/*
 * jhk.dialog.js
 * ダイアログモジュール
 */
jhk.dialog = (function () {
  'use strict';

  //---モジュールスコープ変数---
  var configMap = {
        main_html : String()
        + '<div class="jhk-dialog">'
          + '<div class="jhk-dialog-head">'
            + '<h1>ログインする？</h1>'
            + '<div class="jhk-dialog-head-closer">'
              + '<p>x</p>'
            + '</div>'
          + '</div>'
          + '<div class="jhk-dialog-main">'
            + '<div class="jhk-dialog-main-username-title">'
              + '<p>ユーザID</p>'
            + '</div>'
            + '<input type="text" class="jhk-dialog-main-username-textbox">'
            + '<div class="jhk-dialog-main-passward-title">'
              + '<p>password</p>'
            + '</div>'
            + '<input type="password" class="jhk-dialog-main-passward-textbox">'
            + '<button class="jhk-dialog-main-button-ok">'
              + '<p>ok</p>'
            + '</button>'
            + '<button class="jhk-dialog-main-button-cancel">'
              + '<p>cancel</p>'
            + '</button>'
          + '</div>'
        + '<div>',
        settable_map : {}
      },
      stateMap = {
        $append_target : null
      },
      jqueryMap = {},
      setJqueryMap, configModule, initModule, removeDialog, onClose, onOK;

  //---DOMメソッド---
  setJqueryMap = function () {
    var $append_target = stateMap.$append_target,
        $dialog = $append_target.find( '.jhk-dialog' );
    jqueryMap = {
      $dialog          : $dialog,
      $closer          : $dialog.find( '.jhk-dialog-head-closer' ),
      $usernameTitle   : $dialog.find( '.jhk-dialog-main-username-title' ),
      $usernameTextbox : $dialog.find( '.jhk-dialog-main-username-textbox' ),
      $PasswordTitle   : $dialog.find( '.jhk-dialog-main-passward-title' ),
      $PasswordTextbox : $dialog.find( '.jhk-dialog-main-passward-textbox' ),
      $buttonOK        : $dialog.find( '.jhk-dialog-main-button-ok' ),
      $buttonCancel    : $dialog.find( '.jhk-dialog-main-button-cancel' )
    };
  }

  //---イベントハンドラ---
  onClose = function () {
    $.gevent.publish('cancelDialog', [{}]);
    return false;
  }

  onOK = function () {
    jhk.model.login({userId:jqueryMap.$usernameTextbox.val(),
                     passWord:jqueryMap.$PasswordTextbox.val()});
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

    jqueryMap.$buttonOK
      .click( onOK );
    jqueryMap.$closer
      .click( onClose );
    jqueryMap.$buttonCancel
      .click( onClose );

    return true;
  }

  return {
    configModule : configModule,
    initModule   : initModule,
    removeDialog : removeDialog
  };
}());
