/*
 * jhkSimple.js
 * 授業変更閲覧モジュール
 */

// 関数
let toToday, nextDay, previousDay, nextWeek, previousWeek,
  changeCls, changeTeacher, setUpdateDate;
// global変数
let targetDays, targetHenkou;
// 定数
const tableContentsHeight = 14; // 7日分表示

addEventListener('load', function(e){
  // クラスリストを準備
  jhkSimpleCommonSetClsLst('jhkSelectCls');
  // 教員リストを準備
  jhkSimpleCommonSetTeachersLst('jhkSelectTeacher');
  // 更新日時を設定
  setUpdateDate();

  // 初めはすべてのデータを表示する。jhkhenkouDataはjhkSimpleData.json.jsにある。
  targetHenkou = jhkhenkouData;

  // 本日から1週間分の授業変更を表示する
  targetDays = jhkSimpleCommonGetTargetDays(tableContentsHeight);

  jhkSimpleCommonAddTableHeaher('jhkTable');
  jhkSimpleCommonAddTableContents('jhkTable', targetHenkou, targetDays);
});

toToday = function() {
  targetDays = jhkSimpleCommonGetTargetDays(tableContentsHeight);
  jhkSimpleCommonDeleteRowTable('jhkTable', tableContentsHeight);
  jhkSimpleCommonAddTableContents('jhkTable', targetHenkou, targetDays);
}

nextDay = function() {
  targetDays = jhkSimpleCommonGetTargetDays(tableContentsHeight,
                                            targetDays[0].year,
                                            targetDays[0].month,
                                            targetDays[0].day,
                                            1);
  jhkSimpleCommonDeleteRowTable('jhkTable', tableContentsHeight);
  jhkSimpleCommonAddTableContents('jhkTable', targetHenkou, targetDays);
}

previousDay = function() {
  targetDays = jhkSimpleCommonGetTargetDays(tableContentsHeight,
                                            targetDays[0].year,
                                            targetDays[0].month,
                                            targetDays[0].day,
                                            -1);
  jhkSimpleCommonDeleteRowTable('jhkTable', tableContentsHeight);
  jhkSimpleCommonAddTableContents('jhkTable', targetHenkou, targetDays);
}

nextWeek = function() {
  targetDays = jhkSimpleCommonGetTargetDays(tableContentsHeight,
                                            targetDays[0].year,
                                            targetDays[0].month,
                                            targetDays[0].day,
                                            7);
  jhkSimpleCommonDeleteRowTable('jhkTable', tableContentsHeight);
  jhkSimpleCommonAddTableContents('jhkTable', targetHenkou, targetDays);
}

previousWeek = function() {
  targetDays = jhkSimpleCommonGetTargetDays(tableContentsHeight,
                                            targetDays[0].year,
                                            targetDays[0].month,
                                            targetDays[0].day,
                                            -7);
  jhkSimpleCommonDeleteRowTable('jhkTable', tableContentsHeight);
  jhkSimpleCommonAddTableContents('jhkTable', targetHenkou, targetDays);
}

changeCls = function () {
  let clslist, teacherList;
  console.log("changeCls called");

  clslist = document.getElementById('jhkSelectCls');
  clslist.classList.add('listselected');
  teacherList = document.getElementById('jhkSelectTeacher');
  teacherList.classList.remove('listselected');

  // 先頭の'-'ならフィルターなし
  if (clslist.value == '-') {
    targetHenkou = jhkhenkouData;
  } else {
    targetHenkou = jhkhenkouData.filter(jhkClsFilterF(clslist.value));
  }
  jhkSimpleCommonDeleteRowTable('jhkTable', tableContentsHeight);
  jhkSimpleCommonAddTableContents('jhkTable', targetHenkou, targetDays);
}

changeTeacher = function () {
  let clslist, teacherList;

  clslist = document.getElementById('jhkSelectCls');
  clslist.classList.remove('listselected');
  teacherList = document.getElementById('jhkSelectTeacher');
  teacherList.classList.add('listselected');

  // 先頭の'-'ならフィルターなし
  if (teacherList.value == '-') {
    targetHenkou = jhkhenkouData;
  } else {
    targetHenkou = jhkhenkouData.filter(jhkTeacherFilterF(teacherList.value));
  }
  jhkSimpleCommonDeleteRowTable('jhkTable', tableContentsHeight);
  jhkSimpleCommonAddTableContents('jhkTable', targetHenkou, targetDays);
}

setUpdateDate = function () {
  let updatedate = document.getElementById('jhkUpdateDate');
  // jhkUpdateはjhkSimpleData.json.jsにある
  updatedate.innerHTML = jhkUpdate;
}
