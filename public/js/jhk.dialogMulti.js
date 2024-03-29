/*
 * jhk.dialogMulti.js
 * ボタン複数 ダイアログ部モジュール
 */
jhk.dialogMulti = (function () {
  'use strict';

  //---モジュールスコープ変数---
  var configMap = {
        main_html : String()
        + '<div class="jhk-dialogMulti">'
          + '<div class="jhk-dialogMulti-main">'
            + '<div class="jhk-dialogMulti-main-title">'
            + '</div>'
            + '<select id="jhk-dialogMulti-main-selectJyugyou"></select>'
            + '<div class="jhk-dialogMulti-main-text1">を</div>'
            + '<select id="jhk-dialogMulti-main-selectTeacher"></select>'
            + '<div class="jhk-dialogMulti-main-text2">へ</div>'
            + '<button class="jhk-dialogMulti-main-button-to">'
              + '<p>入れ替え</p>'
            + '</button>'
            + '<button class="jhk-dialogMulti-main-button-jyokin">'
              + '<p>助勤</p>'
            + '</button>'
            + '<button class="jhk-dialogMulti-main-button-tonarijyokin">'
              + '<p>隣助勤</p>'
            + '</button>'
            + '<button class="jhk-dialogMulti-main-button-cancel">'
              + '<p>cancel</p>'
            + '</button>'
          + '</div>'
        + '<div>',
        settable_map : {showStr          : true,
                        toFunc           : true,
                        jyokinFunc       : true,
                        tonarijyokinFunc : true,
                        jyugyouName      : true},
        showStr          : "",
        toFunc           : function () {},
        jyokinFunc       : function () {},
        tonarijyokinFunc : function () {},
        jyugyouName      : ""
      },
      stateMap = {
        $append_target : null
      },
      jqueryMap = {},
      setJqueryMap, configModule, initModule, removeDialog, onClose, onTo,
      onJyokin, onTonariJyokin;

  //---DOMメソッド---
  setJqueryMap = function () {
    var $append_target = stateMap.$append_target,
        $dialog = $append_target.find( '.jhk-dialogMulti' );
    jqueryMap = {
      $dialog          : $dialog,
      $title           : $dialog.find( '.jhk-dialogMulti-main-title' ),
      $selectJyugyou   : $dialog.find( '#jhk-dialogMulti-main-selectJyugyou' ),
      $selectTeacher   : $dialog.find( '#jhk-dialogMulti-main-selectTeacher' ),
      $buttonTo        : $dialog.find( '.jhk-dialogMulti-main-button-to' ),
      $buttonJyokin    : $dialog.find( '.jhk-dialogMulti-main-button-jyokin' ),
      $buttonTonariJyokin : $dialog.find( '.jhk-dialogMulti-main-button-tonarijyokin' ),
      $buttonCancel    : $dialog.find( '.jhk-dialogMulti-main-button-cancel' )
    };
  }

  //---イベントハンドラ---
  onClose = function () {
    $.gevent.publish('cancelDialog', [{}]);
    return false;
  }

  onTo = function () {
    if (jqueryMap.$selectJyugyou.val() != '-' && jqueryMap.$selectTeacher.val() != '-') {
      configMap.toFunc(jqueryMap.$selectJyugyou.val(), jqueryMap.$selectTeacher.val());
    }
    return false;
  }

  onJyokin = function () {
    if (jqueryMap.$selectJyugyou.val() != '-' && jqueryMap.$selectTeacher.val() != '-') {
      configMap.jyokinFunc(jqueryMap.$selectJyugyou.val(), jqueryMap.$selectTeacher.val());
    }
    return false;
  }

  onTonariJyokin = function () {
    if (jqueryMap.$selectJyugyou.val() != '-' && jqueryMap.$selectTeacher.val() != '-') {
      configMap.tonarijyokinFunc(jqueryMap.$selectJyugyou.val(), jqueryMap.$selectTeacher.val());
    }
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

    jqueryMap.$buttonTo
      .click( onTo );
    jqueryMap.$buttonJyokin
      .click( onJyokin );
    jqueryMap.$buttonTonariJyokin
      .click( onTonariJyokin );
    jqueryMap.$buttonCancel
      .click( onClose );

    jhkSimpleCommonSetJyugyouLst('jhk-dialogMulti-main-selectJyugyou', configMap.jyugyouName);
    jhkSimpleCommonSetTeachersLst('jhk-dialogMulti-main-selectTeacher');
    return true;
  }

  return {
    configModule : configModule,
    initModule   : initModule,
    removeDialog : removeDialog,
    onClose      : onClose
  };
}());
