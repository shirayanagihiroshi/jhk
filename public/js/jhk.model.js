/*
 * jhk.model.js
 * モデルモジュール
 */

jhk.model = (function () {
  'use strict';

  var initModule, login, logout, islogind, getCalendar,
    addNikka, //モジュールスコープ変数
    accessKey, name, calendar;

  initModule = function () {

    accessKey   = {};
    name        = "";
    calendar    = {};

    jhk.data.initModule();

    jhk.data.registerReceive('loginResult', function (msg) {
      let eventName;
      // ログイン成功
      // userKind :8  事務 (8から始まってることに特に意味はない)
      //          :9  非常勤教諭
      //          :10 常勤教諭
      //          :11 教務部
      //          :であり、DBをsktと共用していることに注意
      if ( msg.result == true || msg.userKind == 11) {
        accessKey = { userId : msg.userId,
                      token  : msg.token};
        name      = msg.name;

        //カレンダー情報を最初に取っておく
        jhk.data.sendToServer('readyCalendar', {AKey : accessKey,
                                                clientState : 'init'});
      // ログイン失敗
      } else {
        $.gevent.publish('loginFailure', [msg]);
      }
    });

    // カレンダー取得完了
    jhk.data.registerReceive('readyCalendarResult', function (msg) {
      calendar = msg.calendar;

      if (msg.clientState == 'init') {
        $.gevent.publish('loginSuccess', [{ name: name }]);
      }
    });

    jhk.data.registerReceive('logoutResult', function (msg) {
      let eventName;
      // ログアウト成功
      if ( msg.result == true ) {
        eventName = 'logoutSuccess';

        // 初期化
        accessKey   = {};
        name        = "";
        calendar    = {};
      // ログアウト失敗
      } else {
        // 失敗したとして、どうする？
        eventName = 'logoutFailure';
      }
      $.gevent.publish(eventName, [msg]);
    });


  };//initModule end

  login = function (queryObj) {
    jhk.data.sendToServer('tryLogin',queryObj);
  };

  logout = function () {
    console.log(accessKey);
    jhk.data.sendToServer('tryLogout',{userId : accessKey.userId,
                                       token  : accessKey.token});
  };

  islogind = function () {
    //accessKeyがtokenプロパティを持ち
    if ( Object.keys(accessKey).indexOf('token') !== -1 ) {
      //さらに空でない文字列が設定されていればログイン済
      if ( accessKey.token !== undefined ) {
        if (accessKey.token != "") {
          return true;
        }
      }
    }
    return false;
  };

  getCalendar = function () {
    return calendar;
  }

  addNikka = function (targetDays, calendar) {
    let i, idx,
      f = function (y, m, d) {
        return function (target) {
          if ( target.year == y && target.month == m && target.day == d ) {
            return true;
          } else {
            return false;
          }
        }
      };

    for (i = 0; i < targetDays.length - 1; i++) {
      idx = calendar.findIndex( f(targetDays[i].year, targetDays[i].month, targetDays[i].day) );
      if (idx != -1) {
        // 日課を設定する。これは破壊的。
        targetDays[i].nikka = calendar[idx].nikka;
      }
    }
  }

  return { initModule      : initModule,
          login            : login,
          logout           : logout,
          islogind         : islogind,
          getCalendar      : getCalendar,
          addNikka         : addNikka
         };
}());
