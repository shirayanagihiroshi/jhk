/*
 * jhk.dialogOkCancel.js
 * OK Cancel ダイアログ部モジュール
 */
jhk.dialogOkCancel = (function () {
  'use strict';

  //---モジュールスコープ変数---
  var configMap = {
        main_html : String()
        + '<div class="jhk-dialogOkCancel">'
          + '<div class="jhk-dialogOkCancel-main">'
            + '<div class="jhk-dialogOkCancel-main-title">'
            + '</div>'
            + '<button class="jhk-dialogOkCancel-main-button-ok">'
              + '<p>ok</p>'
            + '</button>'
            + '<button class="jhk-dialogOkCancel-main-button-cancel">'
              + '<p>cancel</p>'
            + '</button>'
          + '</div>'
        + '<div>',
        settable_map : {showStr : true,
                        okFunc  : true,
                        okStr   : true},
        showStr : "",
        okFunc  : function () {},
        okStr   : ""
      },
      stateMap = {
        $append_target : null
      },
      jqueryMap = {},
      setJqueryMap, configModule, initModule, removeDialog, onClose, onOK;

  //---DOMメソッド---
  setJqueryMap = function () {
    var $append_target = stateMap.$append_target,
        $dialog = $append_target.find( '.jhk-dialogOkCancel' );
    jqueryMap = {
      $dialog          : $dialog,
      $title           : $dialog.find( '.jhk-dialogOkCancel-main-title' ),
      $buttonOK        : $dialog.find( '.jhk-dialogOkCancel-main-button-ok' ),
      $buttonCancel    : $dialog.find( '.jhk-dialogOkCancel-main-button-cancel' )
    };
  }

  //---イベントハンドラ---
  onClose = function () {
    $.gevent.publish('cancelDialog', [{}]);
    return false;
  }

  onOK = function () {
    //いろいろな受け持つので、configModuleで指定しておく
    configMap.okFunc();
    return false;
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

    if (configMap.okStr != "") {
      jqueryMap.$buttonOK.html( configMap.okStr );
    }

    jqueryMap.$buttonOK
      .click( onOK );
    jqueryMap.$buttonCancel
      .click( onClose );

    return true;
  }

  return {
    configModule : configModule,
    initModule   : initModule,
    removeDialog : removeDialog,
    onClose      : onClose
  };
}());
