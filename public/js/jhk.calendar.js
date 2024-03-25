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
          + '<span class="jhk-calendar-text">filter:</span><select id="jhk-calendar-selectCls">'
          + '</select>'
          + '<span class="jhk-calendar-text">filter:</span><select id="jhk-calendar-selectTeacher">'
          + '</select>'
          + '<span class="jhk-calendar-text">select:</span><select id="jhk-calendar-selectTeacher-select">'
          + '</select>'
          + '<span class="jhk-calendar-text">kyouka:</span><select id="jhk-calendar-kyouka-select">'
          + '</select>'
          + '<table id="jhk-calendar-table">'
          + '</table>',
        jyugyouClaName      : 'jhk-calendar-jyugyou',
        ediClaName          : 'jhk-calendar-edi',
        delClaName          : 'jhk-calendar-del',
        settable_map        : {tableContentsHeight:true,
                               year               :true,
                               month              :true,
                               day                :true,
                               teacher            :true,
                               kyouka             :true},
        tableContentsHeight : 0,
        year                : 0,
        month               : 0,
        day                 : 0,
        teacher             : "",
        kyouka              : ""
      },
      stateMap = {
        $container : null,
        targetDays : [],
        henkous    : [],
        addTarget  : [],
        delTarget  : {},
        temphenkouTarget  : null    // 入れ替えモードで使用。ここと次に選ぶところを入れ替える。
      },
      jqueryMap = {},
      setJqueryMap, configModule, initModule, removeCalendar,
      addChange, addTo, addJyokin, addTonarijyokin, removeHenkou,
      getDispTarget, kouhoCancel, tableRedraw,
      onPreviousWeek, onPreviousDay, onToToday, onNextDay, onNextWeek,
      onTalbeClick, onChangeCls, onChangeTeacher, onChangeTeacherS,
      onChangeKyouka, setDelTarget, getClsOfJyugyou ;

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
      $selectKyouka  : $container.find( '#jhk-calendar-kyouka-select' ),
      $text          : $container.find( '.jhk-calendar-text' ),
      $table         : $container.find( '#jhk-calendar-table' )
    };
  }

  //---イベントハンドラ---
  onTalbeClick = function (tate, yoko) {
    let mode = jhk.shell.getMode();

    // 入れ替えモードのとき
    if (mode == 'irekae') {
      // select:で'-'を選んでいたら無視
      if (jqueryMap.$selectTeacherS.val() != '-') {
        let d = stateMap.targetDays[tate],
          jyugyou = jhkSimpleCommonGetJyugyou(jqueryMap.$selectTeacherS.val(), jhkJikanwari, d.nikka, d.youbi, yoko);
        // 授業がないところは無視
        if (jyugyou != '') {
          // まだ入れ替え候補を1人も選んでいなければ、
          // temphenkouTargetに保持して、表に名前を表示する
          if (stateMap.temphenkouTarget == null) {
            let obj = {year    : d.year,
                       month   : d.month,
                       day     : d.day,
                       koma    : yoko,
                       teacher : jqueryMap.$selectTeacherS.val(),
                       jyugyou : jyugyou};

            stateMap.temphenkouTarget = obj;
            jhkSimpleCommonDeleteRowTable('jhk-calendar-table', configMap.tableContentsHeight);
            jhkSimpleCommonAddTableContents('jhk-calendar-table',
                                            stateMap.henkous,
                                            stateMap.targetDays,
                                            jqueryMap.$selectTeacherS.val(),
                                            jhkJikanwari,
                                            configMap.jyugyouClaName,
                                            configMap.ediClaName,
                                            configMap.delClaName,
                                            stateMap.temphenkouTarget);

          // 既に入れ替え候補を1人選んでいて、
          // select:で他の先生を選んでクリックしたら登録確認ダイアログへ
          } else if (jqueryMap.$selectTeacherS.val() != stateMap.temphenkouTarget.teacher)  {
             let str,
               j1 = {year    : stateMap.temphenkouTarget.year,
                     month   : stateMap.temphenkouTarget.month,
                     day     : stateMap.temphenkouTarget.day,
                     koma    : stateMap.temphenkouTarget.koma,
                     teacher : stateMap.temphenkouTarget.teacher,
                     jyugyou : stateMap.temphenkouTarget.jyugyou,
                     to      : jqueryMap.$selectTeacherS.val(),
                     cls     : getClsOfJyugyou(stateMap.temphenkouTarget.jyugyou)},
               j2 = {year    : d.year,
                     month   : d.month,
                     day     : d.day,
                     koma    : yoko,
                     teacher : jqueryMap.$selectTeacherS.val(),
                     jyugyou : jyugyou,
                     to      : stateMap.temphenkouTarget.teacher,
                     cls     : getClsOfJyugyou(jyugyou)};
             stateMap.addTarget.length = 0; // この選択操作の前にキャンセルしていたら、addTargetに不要なものが保存されている。それを消す。
             stateMap.addTarget.push(j1);
             stateMap.addTarget.push(j2);
             str = '入れ替えますか<br>'
             str += String(j1.month) + '月' + String(j1.day) + '日' + jhkSimpleCommonGetKomaStr(j1.koma) + j1.jyugyou + j1.teacher + '<br>';
             str += String(j2.month) + '月' + String(j2.day) + '日' + jhkSimpleCommonGetKomaStr(j2.koma) + j2.jyugyou + j2.teacher;
             $.gevent.publish('verifyChange', [{dialogStr:str}]);
          }
        }
      }

    // 自由入力モードのとき
    } else {
      // select:で'-'を選んでいたら無視
      if (jqueryMap.$selectTeacherS.val() != '-') {
        let str,
          d = stateMap.targetDays[tate],
          jyugyou = jhkSimpleCommonGetJyugyou(jqueryMap.$selectTeacherS.val(), jhkJikanwari, d.nikka, d.youbi, yoko),
          j = {year    : d.year,
               month   : d.month,
               day     : d.day,
               koma    : yoko,
               teacher : jqueryMap.$selectTeacherS.val(),
               jyugyou : jyugyou};

        str = String(j.month) + '月' + String(j.day) + '日' + jhkSimpleCommonGetKomaStr(j.koma) + ' ' + j.teacher + '先生の';
        stateMap.addTarget.length = 0;
        // あと、to か jyokin か tonariJyokin はダイアログ中で選択する。
        // jyugyou はダイアログで変更されるかもしれない
        // （jyugyouの変更が必要なシーンは具体的に想定していないが、なるべく柔軟に登録できるようにしておく）
        stateMap.addTarget.push(j);
        $.gevent.publish('freestyleAdd', [{dialogStr:str,
                                           jyugyou  :jyugyou}]);
      }
    }
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
    stateMap.targetDays = jhkSimpleCommonGetTargetDays(configMap.tableContentsHeight,
                                                       stateMap.targetDays[0].year,
                                                       stateMap.targetDays[0].month,
                                                       stateMap.targetDays[0].day,
                                                       -7);
    jhk.model.addNikka(stateMap.targetDays, jhk.model.getCalendar());

    jhkSimpleCommonDeleteRowTable('jhk-calendar-table', configMap.tableContentsHeight);
    jhkSimpleCommonAddTableContents('jhk-calendar-table',
                                    stateMap.henkous,
                                    stateMap.targetDays,
                                    jqueryMap.$selectTeacherS.val(),
                                    jhkJikanwari,
                                    configMap.jyugyouClaName,
                                    configMap.ediClaName,
                                    configMap.delClaName,
                                    stateMap.temphenkouTarget);
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
                                    configMap.delClaName,
                                    stateMap.temphenkouTarget);
    return false;
  }

  onToToday = function () {
    console.log('onToToday');
    stateMap.targetDays = jhkSimpleCommonGetTargetDays(configMap.tableContentsHeight);
    jhk.model.addNikka(stateMap.targetDays, jhk.model.getCalendar());

    jhkSimpleCommonDeleteRowTable('jhk-calendar-table', configMap.tableContentsHeight);
    jhkSimpleCommonAddTableContents('jhk-calendar-table',
                                    stateMap.henkous,
                                    stateMap.targetDays,
                                    jqueryMap.$selectTeacherS.val(),
                                    jhkJikanwari,
                                    configMap.jyugyouClaName,
                                    configMap.ediClaName,
                                    configMap.delClaName,
                                    stateMap.temphenkouTarget);
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
                                    configMap.delClaName,
                                    stateMap.temphenkouTarget);
    return false;
  }

  onNextWeek = function () {
    console.log('onNextWeek');
    stateMap.targetDays = jhkSimpleCommonGetTargetDays(configMap.tableContentsHeight,
                                                       stateMap.targetDays[0].year,
                                                       stateMap.targetDays[0].month,
                                                       stateMap.targetDays[0].day,
                                                       7);
    jhk.model.addNikka(stateMap.targetDays, jhk.model.getCalendar());

    jhkSimpleCommonDeleteRowTable('jhk-calendar-table', configMap.tableContentsHeight);
    jhkSimpleCommonAddTableContents('jhk-calendar-table',
                                    stateMap.henkous,
                                    stateMap.targetDays,
                                    jqueryMap.$selectTeacherS.val(),
                                    jhkJikanwari,
                                    configMap.jyugyouClaName,
                                    configMap.ediClaName,
                                    configMap.delClaName,
                                    stateMap.temphenkouTarget);
    return false;
  }

  onChangeCls = function () {

    jqueryMap.$selectCls.addClass('listselected');
    jqueryMap.$selectTeacher.removeClass('listselected');

    // 先頭の'-'ならフィルターなし
    if (jqueryMap.$selectCls.val() == '-') {
      stateMap.henkous = jhk.model.getHenkou();
    } else {
      stateMap.henkous = stateMap.henkous.filter(jhkClsFilterF(jqueryMap.$selectCls.val()));
    }

    jhkSimpleCommonDeleteRowTable('jhk-calendar-table', configMap.tableContentsHeight);
    jhkSimpleCommonAddTableContents('jhk-calendar-table',
                                    stateMap.henkous,
                                    stateMap.targetDays,
                                    jqueryMap.$selectTeacherS.val(),
                                    jhkJikanwari,
                                    configMap.jyugyouClaName,
                                    configMap.ediClaName,
                                    configMap.delClaName,
                                    stateMap.temphenkouTarget);
    return false;
  }

  onChangeTeacher = function () {

    jqueryMap.$selectCls.removeClass('listselected');
    jqueryMap.$selectTeacher.addClass('listselected');

    // 先頭の'-'ならフィルターなし
    if (jqueryMap.$selectTeacher.val() == '-') {
      stateMap.henkous = jhk.model.getHenkou();
    } else {
      stateMap.henkous = stateMap.henkous.filter(jhkTeacherFilterF(jqueryMap.$selectTeacher.val()));
    }

    jhkSimpleCommonDeleteRowTable('jhk-calendar-table', configMap.tableContentsHeight);
    jhkSimpleCommonAddTableContents('jhk-calendar-table',
                                    stateMap.henkous,
                                    stateMap.targetDays,
                                    jqueryMap.$selectTeacherS.val(),
                                    jhkJikanwari,
                                    configMap.jyugyouClaName,
                                    configMap.ediClaName,
                                    configMap.delClaName,
                                    stateMap.temphenkouTarget);
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
                                    configMap.delClaName,
                                    stateMap.temphenkouTarget);
    return false;
  }

  onChangeKyouka = function () {
    jhkSimpleCommonSetTeachersLst('jhk-calendar-selectTeacher-select', configMap.teacher, jqueryMap.$selectKyouka.val());

    jhkSimpleCommonDeleteRowTable('jhk-calendar-table', configMap.tableContentsHeight);
    jhkSimpleCommonAddTableContents('jhk-calendar-table',
                                    stateMap.henkous,
                                    stateMap.targetDays,
                                    jqueryMap.$selectTeacherS.val(),
                                    jhkJikanwari,
                                    configMap.jyugyouClaName,
                                    configMap.ediClaName,
                                    configMap.delClaName,
                                    stateMap.temphenkouTarget);
    return false;
  }

  //---ユーティリティメソッド---
  getClsOfJyugyou = function (jyugyou) {
    let idx,
      f = function (t) {
        return function (target) {
          if ( target.jyugyou == t) {
            return true;
          } else {
            return false;
          }
        }
      };

    idx = jhkJyugyous.findIndex(f(jyugyou));
    return jhkJyugyous[idx].cls; //これは失敗しないはず
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

    stateMap.henkous = jhk.model.getHenkou();

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

    jqueryMap.$selectCls
      .change( onChangeCls );

    jqueryMap.$selectTeacher
      .change( onChangeTeacher );

    jqueryMap.$selectTeacherS
      .change( onChangeTeacherS );

    jqueryMap.$selectKyouka
      .change( onChangeKyouka );

    jhkSimpleCommonSetClsLst('jhk-calendar-selectCls');
    jhkSimpleCommonSetTeachersLst('jhk-calendar-selectTeacher');
    jhkSimpleCommonSetTeachersLst('jhk-calendar-selectTeacher-select', configMap.teacher, configMap.kyouka);

    jhkSimpleCommonSetKyoukaLst('jhk-calendar-kyouka-select', configMap.kyouka);

    jhkSimpleCommonAddTableHeaher('jhk-calendar-table');
    jhkSimpleCommonAddTableContents('jhk-calendar-table',
                                    stateMap.henkous,
                                    stateMap.targetDays,
                                    configMap.teacher,
                                    jhkJikanwari,
                                    configMap.jyugyouClaName,
                                    configMap.ediClaName,
                                    configMap.delClaName,
                                    stateMap.temphenkouTarget);

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
          // 追加の意味でクリックしたときに削除されるとイラつくので、
          // select:で誰か先生を選んでいるときは無視する
          if (jqueryMap.$selectTeacherS.val() == '-') {
            setDelTarget(tateIndex-1, yokoIndex, this.innerHTML)
          }
        }
      return false; // ここでreturn falseしないとediClaNameの方も発火する
    });

    $(document).on('click', '.jhkKouho', function (event) {
      //候補はいつでもクリックしたらキャンセル
      kouhoCancel();
      tableRedraw();
      return false;
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
        jqueryMap.$selectKyouka.remove();
        jqueryMap.$text.remove();
        jqueryMap.$table.remove();
      }
    }
    return true;
  }

  // ダイアログから戻るときに、元の範囲を表示するためにshellが参照する。
  getDispTarget = function () {
    let obj = {year    : stateMap.targetDays[0].year,
               month   : stateMap.targetDays[0].month,
               day     : stateMap.targetDays[0].day,
               teacher : jqueryMap.$selectTeacherS.val(),
               kyouka  : jqueryMap.$selectKyouka.val()};
    return obj;
  }

  addChange = function () {
    jhk.model.addHenkou(stateMap.addTarget);
  }

  addTo = function (jyugyou, teacher) {
    stateMap.addTarget[0].jyugyou = jyugyou;
    stateMap.addTarget[0].to = teacher;
    stateMap.addTarget[0].cls = getClsOfJyugyou(jyugyou);
    jhk.model.addHenkou(stateMap.addTarget);
  }

  addJyokin = function (jyugyou, teacher) {
    stateMap.addTarget[0].jyugyou = jyugyou;
    stateMap.addTarget[0].jyokin = teacher;
    stateMap.addTarget[0].cls = getClsOfJyugyou(jyugyou);
    jhk.model.addHenkou(stateMap.addTarget);
  }

  addTonarijyokin = function (jyugyou, teacher) {
    stateMap.addTarget[0].jyugyou = jyugyou;
    stateMap.addTarget[0].tonariJyokin = teacher;
    stateMap.addTarget[0].cls = getClsOfJyugyou(jyugyou);
    jhk.model.addHenkou(stateMap.addTarget);
  }

  removeHenkou = function () {
    jhk.model.removeHenkou(stateMap.delTarget.year,
                           stateMap.delTarget.month,
                           stateMap.delTarget.day,
                           stateMap.delTarget.koma,
                           stateMap.delTarget.teacher);
  }

  // 入れ替え候補を設定中にモードを変えたら、候補はキャンセルする。
  kouhoCancel = function () {
    stateMap.temphenkouTarget = null;
    stateMap.addTarget.length = 0; // これで配列を[]にできる。
    stateMap.addTarget.delTarget = {}
  }

  tableRedraw = function () {
    jhkSimpleCommonDeleteRowTable('jhk-calendar-table', configMap.tableContentsHeight);
    jhkSimpleCommonAddTableContents('jhk-calendar-table',
                                    stateMap.henkous,
                                    stateMap.targetDays,
                                    jqueryMap.$selectTeacherS.val(),
                                    jhkJikanwari,
                                    configMap.jyugyouClaName,
                                    configMap.ediClaName,
                                    configMap.delClaName,
                                    stateMap.temphenkouTarget);
  }

  return {
    configModule  : configModule,
    initModule    : initModule,
    removeCalendar: removeCalendar,
    getDispTarget : getDispTarget,
    addChange     : addChange,
    addTo         : addTo,
    addJyokin     : addJyokin,
    addTonarijyokin : addTonarijyokin,
    removeHenkou  : removeHenkou,
    kouhoCancel   : kouhoCancel,
    tableRedraw   : tableRedraw
  };
}());
