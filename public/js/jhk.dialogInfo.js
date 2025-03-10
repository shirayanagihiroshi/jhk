/*
 * jhk.dialogInfo.js
 * いない人入力モジュール
 */
jhk.dialogInfo = (function () {
  'use strict';

  //---モジュールスコープ変数---
  var configMap = {
        main_html : String()
        + '<div class="jhk-dialogInfo">'
          + '<div class="jhk-dialogInfo-main">'
            + '<div class="jhk-dialogInfo-main-title">'
            + '</div>'
            + '<select id="jhk-dialogInfo-main-selectTeacher"></select>'
            + '<select id="jhk-dialogInfo-main-selectJikoku-KARA-JI"></select>'
            + '<div class="jhk-dialogInfo-main-text1">:</div>'
            + '<select id="jhk-dialogInfo-main-selectJikoku-KARA-FUN"></select>'
            + '<div class="jhk-dialogInfo-main-text2">から</div>'
            + '<select id="jhk-dialogInfo-main-selectJikoku-MASE-JI"></select>'
            + '<div class="jhk-dialogInfo-main-text3">:</div>'
            + '<select id="jhk-dialogInfo-main-selectJikoku-MASE-FUN"></select>'
            + '<div class="jhk-dialogInfo-main-text4">(</div>'
            + '<select id="jhk-dialogInfo-main-selectKyouka"></select>'
            + '<div class="jhk-dialogInfo-main-text5">教科絞り込み)</div>'
            + '<button class="jhk-dialogInfo-main-button-touroku">'
              + '<p>登録</p>'
            + '</button>'
            + '<select id="jhk-dialogInfo-main-selectInai"></select>'
            + '<button class="jhk-dialogInfo-main-button-delete">'
              + '<p>削除</p>'
            + '</button>'
            + '<button class="jhk-dialogInfo-main-button-cancel">'
              + '<p>cancel</p>'
            + '</button>'
          + '</div>'
        + '<div>',
        settable_map : {showStr          : true,
                        addInfoFunc      : true,
                        delInfoFunc      : true},
        showStr          : "",
        addInfoFunc      : function () {},
        delInfoFunc      : function () {}
      },
      stateMap = {
        $append_target : null
      },
      jqueryMap = {},
      setJqueryMap, configModule, initModule, removeDialog, onClose, onTouroku,
      onDelete, onChangeKyouka, SetJiLst, SetFunLst;

  //---DOMメソッド---
  setJqueryMap = function () {
    var $append_target = stateMap.$append_target,
        $dialog = $append_target.find( '.jhk-dialogInfo' );
    jqueryMap = {
      $dialog          : $dialog,
      $title           : $dialog.find( '.jhk-dialogInfo-main-title' ),
      $selectTeacher   : $dialog.find( '#jhk-dialogInfo-main-selectTeacher' ),
      $selectKyouka    : $dialog.find( '#jhk-dialogInfo-main-selectKyouka' ),
      $selectInai      : $dialog.find( '#jhk-dialogInfo-main-selectInai' ),
      $buttonTouroku   : $dialog.find( '.jhk-dialogInfo-main-button-touroku' ),
      $buttonDelete    : $dialog.find( '.jhk-dialogInfo-main-button-delete' ),
      $buttonCancel    : $dialog.find( '.jhk-dialogInfo-main-button-cancel' )
    };
  }

  //---イベントハンドラ---
  onClose = function () {
    $.gevent.publish('cancelDialog', [{}]);
    return false;
  }

  onTouroku = function () {
    if (jqueryMap.$selectTeacher.val() != '-') {
      configMap.addInfoFunc(jqueryMap.$selectJyugyou.val(), jqueryMap.$selectTeacher.val());
    }
    return false;
  }

  onDelete = function () {
    if (jqueryMap.$selectTeacher.val() != '-') {
      configMap.delInfoFunc(jqueryMap.$selectJyugyou.val(), jqueryMap.$selectTeacher.val());
    }
    return false;
  }

  onChangeKyouka = function () {
    jhkSimpleCommonSetTeachersLst('jhk-dialogInfo-main-selectTeacher', "", jqueryMap.$selectKyouka.val());
  }

  // ライブラリ
  SetJiLst = function(targetId, initVal=null) {
    let i, opt,
      JiList = ['6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18'],
      targetList = document.getElementById(targetId);

    for (i = 0; i < JiList.length; i++) {
      opt = document.createElement('option');
      opt.value = JiList[i];
      opt.text = JiList[i];
      if (initVal != null && initVal == JiList[i]) {
        opt.selected = true;
      }
      targetList.appendChild(opt);
    }
  }

  SetFunLst = function(targetId, initVal=null) {
    let i, opt,
      FunList = ['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'],
      targetList = document.getElementById(targetId);

    for (i = 0; i < FunList.length; i++) {
      opt = document.createElement('option');
      opt.value = FunList[i];
      opt.text = FunList[i];
      if (initVal != null && initVal == FunList[i]) {
        opt.selected = true;
      }
      targetList.appendChild(opt);
    }
  }

  //---パブリックメソッド---
  configModule = function ( input_map ) {
    jhk.util.setConfigMap({
      input_map : input_map,
      settable_map : configMap.settable_map,
      config_map : configMap
    });
    return true;
  }

  removeDialog = function ( ) {
    //初期化と状態の解除
    if ( jqueryMap != null ) {
      if ( jqueryMap.$dialog ) {
        jqueryMap.$dialog.remove();
        jqueryMap = null;
      }
    }
    stateMap.$append_target = null;
    return true;
  }

  initModule = function ( $append_target ) {
    // $container.html( configMap.main_html );
    // じゃなくて、appendするパターン
    // shellでコンテナを用意すると、dialog側を消してもコンテナが残っちゃう。
    $append_target.append( configMap.main_html );
    stateMap.$append_target = $append_target;
    setJqueryMap();

    jqueryMap.$title.html( configMap.showStr );

    jqueryMap.$buttonTouroku
      .click( onTouroku );
    jqueryMap.$buttonDelete
      .click( onDelete );
    jqueryMap.$buttonCancel
      .click( onClose );

    jqueryMap.$selectKyouka
      .change( onChangeKyouka );

//    jhkSimpleCommonSetJyugyouLst('jhk-dialogInfo-main-selectJyugyou', configMap.jyugyouName);
    jhkSimpleCommonSetTeachersLst('jhk-dialogInfo-main-selectTeacher');
    jhkSimpleCommonSetKyoukaLst('jhk-dialogInfo-main-selectKyouka');
    SetJiLst('jhk-dialogInfo-main-selectJikoku-KARA-JI', '8');
    SetJiLst('jhk-dialogInfo-main-selectJikoku-MASE-JI', '16');
    SetFunLst('jhk-dialogInfo-main-selectJikoku-KARA-FUN', '15');
    SetFunLst('jhk-dialogInfo-main-selectJikoku-MASE-FUN', '30');
    return true;
  }

  return {
    configModule : configModule,
    initModule   : initModule,
    removeDialog : removeDialog,
    onClose      : onClose
  };
}());
