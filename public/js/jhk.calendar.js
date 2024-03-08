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
          +  '<table id="jhk-calendar-table">'
          +  '</table>',
        settable_map : {tableContentsHeight:true},
        tableContentsHeight : 0
      },
      stateMap = {
        $container : null,
        targetDays : [],
        henkous    : []
      },
      jqueryMap = {},
      setJqueryMap, configModule, initModule, removeCalendar,
      onPreviousWeek, onPreviousDay, onToToday, onNextDay, onNextWeek,
      onChangeTeacherS;
      

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
  onPreviousWeek= function () {
    console.log('onPreviousWeek');
    return false;
  }

  onPreviousDay = function () {
    console.log('onPreviousDay');
    return false;
  }

  onToToday = function () {
    console.log('onToToday');
    return false;
  }

  onNextDay = function () {
    console.log('onNextDay');
    return false;
  }

  onNextWeek = function () {
    console.log('onNextWeek');
    return false;
  }

  onChangeTeacherS = function () {
    console.log('onChangeTeacherS');

jqueryMap.$selectTeacherS
    jhkSimpleCommonDeleteRowTable('jhk-calendar-table', configMap.tableContentsHeight);
    jhkSimpleCommonAddTableContents('jhk-calendar-table',
                                    stateMap.henkous,
                                    stateMap.targetDays,
                                    jqueryMap.$selectTeacherS.val(),
                                    jhkJikanwari,
                                    'jhk-calendar-noJyugyou');
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

    stateMap.targetDays = jhkSimpleCommonGetTargetDays(configMap.tableContentsHeight);
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
                                    stateMap.targetDays);

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

  return {
    configModule  : configModule,
    initModule    : initModule,
    removeCalendar: removeCalendar
  };
}());
