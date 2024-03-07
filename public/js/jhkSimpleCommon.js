1/*
 * jhkSimpleCommon.js
 * 授業変更　閲覧モジュールと登録モジュールで共通の処理
 * モジュールjhkのメンバではないので注意。
 */

// 関数
let jhkSimpleCommonAddTableHeaher, jhkSimpleCommonAddTableContents,
  jhkSimpleCommonSetJikanwari, jhkSimpleCommonDeleteRowTable,
  jhkSimpleCommonGetTargetDays, jhkSimpleCommonMakeDateStr,
  jhkSimpleCommonSetTeachersLst, jhkTeacherFilterF;

// テーブルにヘッダーを追加する
jhkSimpleCommonAddTableHeaher = function (targetId) {
  let i, tr,
    headers = ['日付', '朝HR', '1限', '2限', '3限', '4限', '5限', '6限', '帰HR', '7限'],
    tbl = document.getElementById(targetId);

  tr = document.createElement('tr');

  for(i = 0; i <= headers.length - 1 ; i++){
    let th = document.createElement('th');

    th.innerHTML = headers[i];
    tr.appendChild(th);
  }
  tbl.appendChild(tr);
}

// テーブルに中身を追加する
jhkSimpleCommonAddTableContents = function(targetId, targetJikanwari, targetDays) {
  let i, j, aDayData,
    dayFilterF = function (y, m, d) {
      return function (target) {
        if ( target.year == y && target.month == m && target.day == d) {
          return true;
        } else {
          return false;
        }
      }
    },
    tbl = document.getElementById(targetId);

  for(i = 0; i <= targetDays.length - 1; i++){
    let tr = document.createElement('tr');

    aDayData = targetJikanwari.filter(dayFilterF(targetDays[i].year, targetDays[i].month, targetDays[i].day));

    for(j = 0; j < 10; j++){ // ['日付', '朝HR', '1限', '2限', '3限', '4限', '5限', '6限', '帰HR', '7限']の繰返
      let td = document.createElement('td');
      if (j == 0) {
        td.innerHTML = jhkSimpleCommonMakeDateStr(targetDays[i].year,
                                                  targetDays[i].month,
                                                  targetDays[i].day,
                                                  targetDays[i].youbi);
      } else {
        td.innerHTML = jhkSimpleCommonSetJikanwari(aDayData, j);
      }
      tr.appendChild(td);
    }
    tbl.appendChild(tr);
  }
}

// 時間割を設定する
// koma : 1 朝SHR
//      : 2 1限
//      : 3 2限
//      : 4 3限
//      : 5 4限
//      : 6 5限
//      : 7 6限
//      : 8 帰SHR
//      : 9 7限
jhkSimpleCommonSetJikanwari = function (aDayData, koma) {
  let i, aKomaData,
    retStr = '',
    komaFilterF = function (koma) {
      return function (target) {
        if ( target.koma == koma) {
          return true;
        } else {
          return false;
        }
      }
    };

  aKomaData = aDayData.filter(komaFilterF(koma));

  for (i = 0; i <= aKomaData.length-1; i++) {
    retStr += aKomaData[i].jyugyou + aKomaData[i].teacher;
    console.log('Property:' + aKomaData[i].hasOwnProperty('teacher'));
  }

  return retStr;
}

// 日付を文字列で生成
jhkSimpleCommonMakeDateStr = function (y, m, d, youbi) {
  let dayOfWeek = ['日','月','火','水','木','金','土'];
    retVal = String(m) + '/' + String(d) + ' ';

  if (youbi == 0) {
    retVal += '<span class="jhkSunday">'
  } else if (youbi == 6) {
    retVal += '<span class="jhkSaturday">'
  }
  retVal += dayOfWeek[youbi];
  if (youbi == 0 || youbi == 6) {
    retVal += '</span>'
  }

  return retVal;
}

// テーブルの行を削除する
jhkSimpleCommonDeleteRowTable = function(targetId, deleteNum) {
  let i, tbl = document.getElementById(targetId);

  for (i = 0; i < deleteNum; i++) {
    tbl.deleteRow(-1);
  }
}

// 指定日からのn日間を返す。
jhkSimpleCommonGetTargetDays = function (n, y, m, d, offset=0) {
  let i, targetday,
    output = [];

  if ( y === undefined || m === undefined || d === undefined ) {
    targetday = new Date();
  } else {
    targetday = new Date(y, m - 1 , d); //月だけ0始まり
  }

  if (offset != 0) {
    targetday.setDate(targetday.getDate() + offset );
  }

  for (i = 0; i < n; i++) {
    output.push({
      year  : targetday.getFullYear(),
      month : targetday.getMonth() + 1, //月だけ0始まり
      day   : targetday.getDate(),
      youbi : targetday.getDay()
    })
    targetday.setDate(targetday.getDate() + 1);
  }
  return output;
}

// 教員のリストを設定する
jhkSimpleCommonSetTeachersLst = function(targetId) {
  // teachers の中身はteacher.json.jsにある
  let i, teacher,
    teacherList = document.getElementById(targetId);

  for (i = 0; i <= teachers.length -1; i++) {
    teacher = document.createElement('option');
    teacher.value = teachers[i];
    teacher.text = teachers[i];
    teacherList.appendChild(teacher);
  }
}

// 教員絞り込み関数
jhkTeacherFilterF = function (t) {
  return function (target) {
    if ( target.teacher == t) {
      return true;
    } else {
      return false;
    }
  }
};
