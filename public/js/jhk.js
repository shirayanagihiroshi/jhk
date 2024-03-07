/*
 * jhk.js
 * ルート名前空間モジュール
 */
var jhk = (function () {
  'use strict';

  var initModule = function ( $container ) {
    jhk.model.initModule();
    jhk.shell.initModule($container);
  }

  return { initModule : initModule };
}());
