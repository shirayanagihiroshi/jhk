/*
 * jhk.shell.js
 * シェルモジュール
 */
jhk.shell = (function () {
  'use strict';

  //---モジュールスコープ変数---
  var configMap = {
    anchor_schema_map : {
      status : {matiuke         : true,
                dialog          : true
              },
      _status : {
        dialogKind : { login          : true,  // status : dialog のとき使用
                       logout         : true,  // status : dialog のとき使用
                       verifyDelete   : true,  // status : dialog のとき使用

                       invalid        : true,  // status : dialog のとき使用
                       verify         : true,  // status : dialog のとき使用
                       verifydel      : true,  // status : dialog のとき使用
                       Updone         : true,  // status : dialog のとき使用
                       nowusableverify :true,  // status : dialog のとき使用
                       wakuverify     : true,  // status : dialog のとき使用
                       wakuUpdateDone : true}  // status : dialog のとき使用
      }
      // アンカーマップとして許容される型を事前に指定するためのもの。
      // 例えば、color : {red : true, blue : true}
      // とすれば、キーcolorの値は'red'か'blue'のみ許容される。
      // 単にtrueとすれば、どんな値も許容される。従属キーに対しても同じ。
      // ここでキーとして挙げていないものをキーとして使用するのは許容されない。
    },
    main_html : String()
      + '<div class="jhk-shell-head">'
        + '<div class="jhk-shell-head-title"></div>'
        + '<button class="jhk-shell-head-acct"></button>'
      + '</div>'
      + '<div class="jhk-shell-main">'
      + '</div>'
    },
    stateMap = {
      $container : null,
      anchor_map : {},
      dialogStr     : "",   // ダイアログで表示する文言を一時的に保持。
                            // ここになきゃいけない情報でないので良い場所を見つけたら移す
      calendarYear  : 0,    // ダイアログ表示のあと同じ範囲の日を表示するために保持
      calendarMonth : 0,
      calendarDay   : 0
    },
    jqueryMap = {},
    copyAnchorMap, changeAnchorPart, onHashchange, setModal,
    setJqueryMap, initModule, stateCtl;

  //---DOMメソッド---
  setJqueryMap = function () {
    var $container = stateMap.$container;
    jqueryMap = {
      $container : $container,
      $title     : $container.find( '.jhk-shell-head-title' ),
      $acct      : $container.find( '.jhk-shell-head-acct' ),
      $main      : $container.find( '.jhk-shell-main' )
    };
  }

  //---イベントハンドラ---
  onHashchange = function ( event ) {
    var anchor_map_previous = copyAnchorMap(),
        anchor_map_proposed,
        _s_status_previous, _s_status_proposed;

    // アンカーの解析を試みる
    try {
      anchor_map_proposed = $.uriAnchor.makeAnchorMap();
    } catch ( error ) {
      $.uriAnchor.setAnchor( anchor_map_previous, null, true );
      return false;
    }
    stateMap.anchor_map = anchor_map_proposed;

    // makeAnchorMapは独立したキー毎に、'_s_キー'というのを作る。
    // 該当するキー値と、そのキーに従属したキー値が含まれる。
    // おそらくここの処理のように、変更の有無を調べやすくするためのもの。
    // spaの本には単に便利な変数と書いてあった。
    _s_status_previous = anchor_map_previous._s_status;
    _s_status_proposed = anchor_map_proposed._s_status;

    // 変更されている場合の処理
    if ( !anchor_map_previous || _s_status_previous !== _s_status_proposed ) {

      stateCtl(anchor_map_proposed);
    }

    return false;
  }

  // 真のイベントハンドラ
  // 状態管理 URLの変更を感知して各種処理を行う。
  // 履歴に残る操作は必ずここを通る。
  // なお、従属変数は'_s_キー'に入っている。
  stateCtl = function ( anchor_map ) {

    console.log('**** stateCtl ****');
    console.log('status:' + anchor_map.status);

/*
    let clearMainContent = function () {
      yoyaku.dialog.removeDialog();
      yoyaku.dialogOkCancel.removeDialog();
    };
*/

    // ダイアログの場合
    if ( anchor_map.status == 'dialog' ) {

      if ( anchor_map._status.dialogKind == 'login' ) {
        setModal(true);
        jhk.dialog.configModule({});
        jhk.dialog.initModule( jqueryMap.$container );

      } else if ( anchor_map._status.dialogKind == 'logout' ) {
        setModal(true);
        jhk.dialogOkCancel.configModule({showStr : 'ログアウトしますか？',
                                         okFunc  : jhk.model.logout,
                                         okStr   : 'ok'});
        jhk.dialogOkCancel.initModule( jqueryMap.$container );

      } else if ( anchor_map._status.dialogKind == 'verifyDelete' ) {
        setModal(true);
        jhk.dialogOkCancel.configModule({showStr : stateMap.dialogStr,
                                         okFunc  : jhk.calendar.removeHenkou,
                                         okStr   : 'ok'});
        jhk.dialogOkCancel.initModule( jqueryMap.$container );
      }

    // 待ち受け画面の場合
    } else if ( anchor_map.status == 'matiuke' ) {

      setModal(false);
      jhk.dialog.removeDialog();
      jhk.dialogOkCancel.removeDialog();

      // 設定の準備をすること
      jhk.calendar.configModule({tableContentsHeight : 14,
                                 year                : stateMap.calendarYear,
                                 month               : stateMap.calendarMonth,
                                 day                 : stateMap.calendarDay});
      jhk.calendar.initModule( jqueryMap.$main );
    }
  }

  //---ユーティリティメソッド---
  copyAnchorMap = function () {
    // $.extendはマージ。第2引数へ第3引数をマージする。
    // 第1引数のtrueはディープコピーを意味する。
    return $.extend( true, {}, stateMap.anchor_map );
  }

  // それ以前の履歴が残らないようにするには replace_flag を true にする。
  // option_map は null でよい。
  // 通常の使用では arg_map のみ渡せばよい。
  changeAnchorPart = function ( arg_map, option_map = null, replace_flag = false ) {
    var anchor_map_revise = copyAnchorMap(),
        bool_return = true,
        key_name, key_name_dep;

    // アンカーマップへ変更を統合
    KEYVAL:
    for ( key_name in arg_map ) {
      if ( arg_map.hasOwnProperty( key_name ) ) {
        // 反復中に従属キーを飛ばす
        if ( key_name.indexOf( '_' ) === 0 ) { continue KEYVAL; }

        // 独立キーを更新する
        anchor_map_revise[key_name] = arg_map[key_name];

        // 合致する独立キーを更新する
        key_name_dep = '_' + key_name;
        if ( arg_map[key_name_dep] ) {
          anchor_map_revise[key_name_dep] = arg_map[key_name_dep];
        } else {
          delete anchor_map_revise[key_name_dep];
          delete anchor_map_revise['_s' + key_name_dep];
        }
      }
    }

    //uriの更新開始。成功しなければ元に戻す
    try {
      $.uriAnchor.setAnchor( anchor_map_revise, option_map, replace_flag );
    } catch {
      // uriを既存の状態に置き換える
      $.uriAnchor.setAnchor( stateMap.anchor_map, null, true );
      bool_return = false;
    }

    return bool_return;
  }

  // flg:trueで呼ぶと、ダイアログ以外はタッチ無効
  // flg:falseで呼ぶと有効に戻る。
  setModal = function ( flg ) {
    let setModalconfig;

    if ( flg == true ) {
      setModalconfig = 'none';
    } else {
      setModalconfig = 'auto';
    }
    //クリックイベント等を有効化or無効化
    jqueryMap.$acct.css('pointer-events', setModalconfig);
    jqueryMap.$main.css('pointer-events', setModalconfig);
  }

  //---パブリックメソッド---
  initModule = function ( $container ) {

    stateMap.$container = $container; //ここで渡されるのはjhk全体
    $container.html( configMap.main_html );
    setJqueryMap();

    // 許容されるuriアンカーの型を指定
    $.uriAnchor.configModule ({
      schema_map : configMap.anchor_schema_map
    });

    jqueryMap.$title.html( '授業変更を設定する' );

    // 以降、各種イベント処理の登録
    // ダイアログ消去
    $.gevent.subscribe( $container, 'cancelDialog', function (event, msg_map) {
      changeAnchorPart({
        status : 'matiuke'
      });
    });

    // ログインダイアログ表示
    $.gevent.subscribe( $container, 'tryLogin', function (event, msg_map) {
      changeAnchorPart({
        status : 'dialog',
        _status : {
          dialogKind : 'login'
        }
      });
    });

    // ログイン成功
    $.gevent.subscribe( $container, 'loginSuccess', function (event, msg_map) {

      // 設計上、これらはonHashchangeで処理すべきだが、そのためには
      // なぜダイアログを閉じたのかという情報が必要になり面倒。いい案を考える。
      jhk.acct.configModule({showStr : msg_map.name});
      jhk.acct.initModule( jqueryMap.$acct );

      changeAnchorPart({
        status : 'matiuke'
      }, null, true); //ログイン前には戻したくないので、履歴を消去
    });

    // ログイン失敗
    $.gevent.subscribe( $container, 'loginFailure', function (event, msg_map) {
      //履歴には残さず、しれっとダイヤログを書き直してやり直しさせる。
      jhk.dialog.removeDialog();
      jhk.dialog.configModule({});
      jhk.dialog.initModule( jqueryMap.$container );
    });

    // ログアウトダイアログ表示
    $.gevent.subscribe( $container, 'tryLogout', function (event, msg_map) {
      changeAnchorPart({
        status : 'dialog',
        _status : {
          dialogKind : 'logout'
        }
      });
    });

    // ログアウト成功
    $.gevent.subscribe( $container, 'logoutSuccess', function (event, msg_map) {
      // 設計上、これらはonHashchangeで処理すべきだが、そのためには
      // なぜダイアログを閉じたのかという情報が必要になり面倒。いい案を考える。
      jhk.acct.configModule({showStr : "ログインする"});
      jhk.acct.initModule( jqueryMap.$acct );

      changeAnchorPart({
        status : 'matiuke'
      }, null, true); //ログイン前には戻したくないので、履歴を消去
    });

    // ログアウト失敗
    $.gevent.subscribe( $container, 'logoutFailure', function (event, msg_map) {
      //どうする？
    });

    // 授業変更削除確認画面
    $.gevent.subscribe( $container, 'verifyDelete', function (event, msg_map) {
      let obj = jhk.calendar.getDispTarget();
      stateMap.calendarYear  = obj.year;
      stateMap.calendarMonth = obj.month;
      stateMap.calendarDay   = obj.day;
      stateMap.dialogStr = msg_map.dialogStr;
      changeAnchorPart({
        status : 'dialog',
        _status : {
          dialogKind  : 'verifyDelete'
        }
      });
    });

    
    jhk.acct.configModule({showStr : 'ログインする'});
    jhk.acct.initModule( jqueryMap.$acct );

    $(window)
      .bind( 'hashchange', onHashchange )
      .trigger( 'hashchange' );

  }

  return { initModule : initModule };
}());
