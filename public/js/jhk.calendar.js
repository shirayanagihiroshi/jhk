/*
 * jhk.calendar.js
 * モジュール
 */
jhk.calendar = (function () {
  'use strict';

  //---モジュールスコープ変数---
  var configMap = {
        main_html : String()
          + '<button id="jhk-calendar-previousWeek">↑↑前の週へ</button>'
          + '<button id="jhk-calendar-previousDay">↑前の日へ</button>'
          + '<button id="jhk-calendar-toToday">今週へ</button>'
          + '<button id="jhk-calendar-nextDay">↓次の日へ</button>'
          + '<button id="jhk-calendar-nextWeek">↓↓次の週へ</button>'
          + 'filter:<select id="jhk-calendar-selectCls"">'
          + '</select>'
          + 'filter:<select id="jhk-calendar-selectTeacher">'
          + '</select>'
          + 'select:<select id="jhk-calendar-selectTeacher-select">'
          + '</select>'
          + '<table id="jhk-calendar-table">'
          + '</table>',
        jyugyouClaName      : 'jhk-calendar-jyugyou',
        ediClaName          : 'jhk-calendar-edi',
        delClaName          : 'jhk-calendar-del',
        settable_map        : {tableContentsHeight:true,
                               year               :true,
                               month              :true,
                               day                :true},
        tableContentsHeight : 0,
        year                : 0,
        month               : 0,
        day                 : 0
      },
      stateMap = {
        $container : null,
        targetDays : [],
        henkous    : [],
        delTarget  : {}
      },
      jqueryMap = {},
      setJqueryMap, configModule, initModule, removeCalendar, removeHenkou,
      getDispTarget,
      onPreviousWeek, onPreviousDay, onToToday, onNextDay, onNextWeek,
      onTalbeClick, onChangeTeacherS, setDelTarget;
      

  //---DOMメソッド---
  setJqueryMap = function () {
    var $container = stateMap.$container;
    jqueryMap = {
      $container     : $container,
      $previousWeek  : $container.find( '#jhk-calendar-previousWeek' ),
      $previousDay   : $container.find( '#jhk-calendar-previousDay' ),
      $toToday       : $container.find( '#jhk-calendar-toToday' ),
      $nextDay       : $container.find( '#jhk-calendar-nextDay' ),
      $nextWeek      : $container.find( '#jhk-calendar-nextWeek' ),
      $selectCls     : $container.find( '#jhk-calendar-selectCls' ),
      $selectTeacher : $container.find( '#jhk-calendar-selectTeacher' ),
      $selectTeacherS: $container.find( '#jhk-calendar-selectTeacher-select' ),
      $table         : $container.find( '#jhk-calendar-table' )
    };
  }

  //---イベントハンドラ---
  onTalbeClick = function (tate, yoko) {
    console.log('onTalbeClick tate:' + String(tate) + ',yoko:' + String(yoko));
  }

  setDelTarget = function (tate, yoko, teacher) {
    const dayOfWeek = ['日','月','火','水','木','金','土'];
    let d = stateMap.targetDays[tate],
      str = String(d.month) + '月' + String(d.day) + '日(' + dayOfWeek[d.youbi] + ')'
            + jhkSimpleCommonCelPosToKoma(yoko) + teacher + '先生';

    stateMap.delTarget.year    = d.year;
    stateMap.delTarget.month   = d.month;
    stateMap.delTarget.day     = d.day;
    stateMap.delTarget.koma    = yoko;
    stateMap.delTarget.teacher = teacher;

    console.log(str);
    $.gevent.publish('verifyDelete', [{dialogStr:str + 'の変更を削除しますか？'}]);

  }

  onPreviousWeek = function () {
    console.log('onPreviousWeek');
    return false;
  }

  onPreviousDay = function () {
    console.log('onPreviousDay');
    stateMap.targetDays = jhkSimpleCommonGetTargetDays(configMap.tableContentsHeight,
                                                       stateMap.targetDays[0].year,
                                                       stateMap.targetDays[0].month,
                                                       stateMap.targetDays[0].day,
                                                       -1);
    jhk.model.addNikka(stateMap.targetDays, jhk.model.getCalendar());

    jhkSimpleCommonDeleteRowTable('jhk-calendar-table', configMap.tableContentsHeight);
    jhkSimpleCommonAddTableContents('jhk-calendar-table',
                                    stateMap.henkous,
                                    stateMap.targetDays,
                                    jqueryMap.$selectTeacherS.val(),
                                    jhkJikanwari,
                                    configMap.jyugyouClaName,
                                    configMap.ediClaName,
                                    configMap.delClaName);
    return false;
  }

  onToToday = function () {
    console.log('onToToday');
    return false;
  }

  onNextDay = function () {
    console.log('onNextDay');
    stateMap.targetDays = jhkSimpleCommonGetTargetDays(configMap.tableContentsHeight,
                                                       stateMap.targetDays[0].year,
                                                       stateMap.targetDays[0].month,
                                                       stateMap.targetDays[0].day,
                                                       1);
    jhk.model.addNikka(stateMap.targetDays, jhk.model.getCalendar());

    jhkSimpleCommonDeleteRowTable('jhk-calendar-table', configMap.tableContentsHeight);
    jhkSimpleCommonAddTableContents('jhk-calendar-table',
                                    stateMap.henkous,
                                    stateMap.targetDays,
                                    jqueryMap.$selectTeacherS.val(),
                                    jhkJikanwari,
                                    configMap.jyugyouClaName,
                                    configMap.ediClaName,
                                    configMap.delClaName);
    return false;
  }

  onNextWeek = function () {
    console.log('onNextWeek');
    return false;
  }

  onChangeTeacherS = function () {
    console.log('onChangeTeacherS');

    jhkSimpleCommonDeleteRowTable('jhk-calendar-table', configMap.tableContentsHeight);
    jhkSimpleCommonAddTableContents('jhk-calendar-table',
                                    stateMap.henkous,
                                    stateMap.targetDays,
                                    jqueryMap.$selectTeacherS.val(),
                                    jhkJikanwari,
                                    configMap.jyugyouClaName,
                                    configMap.ediClaName,
                                    configMap.delClaName);
    return false;
  }

  //---ユーティリティメソッド---

  //---パブリックメソッド---
  configModule = function ( input_map ) {
    jhk.util.setConfigMap({
      input_map : input_map,
      settable_map : configMap.settable_map,
      config_map : configMap
    });
    return true;
  }

  initModule = function ( $container ) {
    $container.html( configMap.main_html );
    stateMap.$container = $container;
    setJqueryMap();

    if (configMap.year != 0) {
      stateMap.targetDays = jhkSimpleCommonGetTargetDays(configMap.tableContentsHeight,
                                                         configMap.year,
                                                         configMap.month,
                                                         configMap.day);
    } else {
      stateMap.targetDays = jhkSimpleCommonGetTargetDays(configMap.tableContentsHeight);
    }
    jhk.model.addNikka(stateMap.targetDays, jhk.model.getCalendar())

    // あとでDBから取るようにする
    stateMap.henkous = henkouData;

    jqueryMap.$previousWeek
      .click( onPreviousWeek );

    jqueryMap.$previousDay
      .click( onPreviousDay );

    jqueryMap.$toToday
      .click( onToToday );

    jqueryMap.$nextDay
      .click( onNextDay );

    jqueryMap.$nextWeek
      .click( onNextWeek );

    jqueryMap.$selectTeacherS
      .change( onChangeTeacherS );

    jhkSimpleCommonSetTeachersLst('jhk-calendar-selectTeacher');

    jhkSimpleCommonSetTeachersLst('jhk-calendar-selectTeacher-select');

    jhkSimpleCommonAddTableHeaher('jhk-calendar-table');
    jhkSimpleCommonAddTableContents('jhk-calendar-table',
                                    stateMap.henkous,
                                    stateMap.targetDays,
                                    null,
                                    null,
                                    null,
                                    configMap.ediClaName,
                                    configMap.delClaName);

    // 重複して登録すると、何度もイベントが発行される。それを避けるため、一旦削除
    $(document).off('click');

    $(document).on('click', '.' + configMap.ediClaName, function (event) { // .はクラスを指定するの意味
      let yokoIndex = this.cellIndex,
        tateIndex = $(this).closest('tr').index();

        if (yokoIndex != 0) { //日付のクリックは不要
          onTalbeClick(tateIndex-1, yokoIndex); // tateを日付のindexとして使えるように補正
        }
      return false;
    });

    $(document).on('click', '.' + configMap.delClaName, function (event) { // .はクラスを指定するの意味
      let yokoIndex = $(this).closest('td').index(),
        tateIndex = $(this).closest('tr').index();

        if (yokoIndex != 0) { //日付のクリックは不要
          setDelTarget(tateIndex-1, yokoIndex, this.innerHTML)
        }
      return false; // ここでreturn falseしないとediClaNameの方も発火する
    });

    return true;
  }

  removeCalendar = function ( ) {
    //初期化と状態の解除
    if ( jqueryMap != null ) {
      if ( jqueryMap.$container ) {
        jqueryMap.$previousWeek.remove();
        jqueryMap.$previousDay.remove();
        jqueryMap.$toToday.remove();
        jqueryMap.$nextDay.remove();
        jqueryMap.$nextWeek.remove();
        jqueryMap.$selectCls.remove();
        jqueryMap.$selectTeacher.remove();
        jqueryMap.$selectTeacherS.remove();
        jqueryMap.$table.remove();
      }
    }
    return true;
  }

  // ダイアログから戻るときに、元の範囲を表示するためにshellが参照する。
  getDispTarget = function () {
    let obj = {year  : stateMap.targetDays[0].year,
               month : stateMap.targetDays[0].month,
               day   : stateMap.targetDays[0].day};
    return obj;
  }

  removeHenkou = function () {
    jhk.model.removeHenkou(stateMap.delTarget.year,
                           stateMap.delTarget.month,
                           stateMap.delTarget.day,
                           stateMap.delTarget.koma,
                           stateMap.delTarget.teacher);
  }

  return {
    configModule  : configModule,
    initModule    : initModule,
    removeCalendar: removeCalendar,
    getDispTarget : getDispTarget,
    removeHenkou  : removeHenkou
  };
}());
