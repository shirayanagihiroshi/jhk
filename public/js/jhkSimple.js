1/*
 * jhkSimple.js
 * 授業変更閲覧モジュール
 */

// 関数
let toToday, nextDay, previousDay, nextWeek, previousWeek,
  changeCls, setSelectCls, changeTeacher;
// global変数
let targetDays, targetJikanwari;
// 定数
const tableContentsHeight = 14; // 7日分表示

addEventListener('load', function(e){
  // プルダウンリストを準備
  setSelectCls();
  // 教員リストを準備
  jhkSimpleCommonSetTeachersLst('jhkSelectTeacher');

  // 初めはすべてのデータを表示する
  targetJikanwari = jikanwariData;

  // 本日から1週間分の授業変更を表示する
  targetDays = jhkSimpleCommonGetTargetDays(tableContentsHeight);

  jhkSimpleCommonAddTableHeaher('jhkTable');
  jhkSimpleCommonAddTableContents('jhkTable', targetJikanwari, targetDays);
});

toToday = function() {
  targetDays = jhkSimpleCommonGetTargetDays(tableContentsHeight);
  jhkSimpleCommonDeleteRowTable('jhkTable', tableContentsHeight);
  jhkSimpleCommonAddTableContents('jhkTable', targetJikanwari, targetDays);
}

nextDay = function() {
  targetDays = jhkSimpleCommonGetTargetDays(tableContentsHeight,
                                            targetDays[0].year,
                                            targetDays[0].month,
                                            targetDays[0].day,
                                            1);
  jhkSimpleCommonDeleteRowTable('jhkTable', tableContentsHeight);
  jhkSimpleCommonAddTableContents('jhkTable', targetJikanwari, targetDays);
}

previousDay = function() {
  targetDays = jhkSimpleCommonGetTargetDays(tableContentsHeight,
                                            targetDays[0].year,
                                            targetDays[0].month,
                                            targetDays[0].day,
                                            -1);
  jhkSimpleCommonDeleteRowTable('jhkTable', tableContentsHeight);
  jhkSimpleCommonAddTableContents('jhkTable', targetJikanwari, targetDays);
}

nextWeek = function() {
  targetDays = jhkSimpleCommonGetTargetDays(tableContentsHeight,
                                            targetDays[0].year,
                                            targetDays[0].month,
                                            targetDays[0].day,
                                            7);
  jhkSimpleCommonDeleteRowTable('jhkTable', tableContentsHeight);
  jhkSimpleCommonAddTableContents('jhkTable', targetJikanwari, targetDays);
}

previousWeek = function() {
  targetDays = jhkSimpleCommonGetTargetDays(tableContentsHeight,
                                            targetDays[0].year,
                                            targetDays[0].month,
                                            targetDays[0].day,
                                            -7);
  jhkSimpleCommonDeleteRowTable('jhkTable', tableContentsHeight);
  jhkSimpleCommonAddTableContents('jhkTable', targetJikanwari, targetDays);
}

changeCls = function () {
  let clslist, teacherList;
  console.log("changeCls called");

  clslist = document.getElementById('selectCls');
  clslist.classList.add('listselected');
  teacherList = document.getElementById('jhkSelectTeacher');
  teacherList.classList.remove('listselected');

}

setSelectCls = function() {
  let cls,
    clslist = document.getElementById('selectCls');
  
  cls = document.createElement('option');
  cls.value = '1-1';
  cls.text = '1-1';
  clslist.appendChild(cls);

  cls = document.createElement('option');
  cls.value = '1-2';
  cls.text = '1-2';
  clslist.appendChild(cls);

}

changeTeacher = function () {
  let clslist, teacherList;

  clslist = document.getElementById('selectCls');
  clslist.classList.remove('listselected');
  teacherList = document.getElementById('jhkSelectTeacher');
  teacherList.classList.add('listselected');

  targetJikanwari = jikanwariData.filter(jhkTeacherFilterF(teacherList.value));
  jhkSimpleCommonDeleteRowTable('jhkTable', tableContentsHeight);
  jhkSimpleCommonAddTableContents('jhkTable', targetJikanwari, targetDays);
}

