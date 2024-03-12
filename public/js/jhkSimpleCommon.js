1/*
 * jhkSimpleCommon.js
 * 授業変更　閲覧モジュールと登録モジュールで共通の処理
 * モジュールjhkのメンバではないので注意。
 */

// 関数
let jhkSimpleCommonCelPosToKoma,
  jhkSimpleCommonAddTableHeaher, jhkSimpleCommonAddTableContents,
  jhkSimpleCommonGetHenkou, jhkSimpleCommonDeleteRowTable,
  jhkSimpleCommonGetTargetDays, jhkSimpleCommonGetJyugyou,
  jhkSimpleCommonGetKomaStr, jhkSimpleCommonMakeDateStr, 
  jhkSimpleCommonSetTeachersLst, jhkTeacherFilterF;

jhkSimpleCommonCelPosToKoma = function (CelPos) {
  let headers = ['日付', '朝HR', '1限', '2限', '3限', '4限', '5限', '6限', '帰HR', '7限'];

  return headers[CelPos];
}

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
// targetId     : htmlにおけるテーブルのID
// targetHenkou : 授業変更データ
// targetDays   : 対象の日のリスト
// targetteacher: 教員名(授業変更の登録のときのみ設定)
// jikanwari    : 時間割(授業変更の登録のときのみ設定)
// clsname      : グレーアウト用クラスの名前(授業変更の登録のときのみ設定)
// edicls       : 編集用クラスの名前(授業変更の登録のときのみ設定)
// delcls       : 削除クラスの名前(授業変更の登録のときのみ設定)
// tempTarget   :入れ替えのうち、1人目のデータ(授業変更の登録の、入れ替えモードのときのみ設定)
jhkSimpleCommonAddTableContents = function(targetId, targetHenkou, targetDays, targetteacher=null, jikanwari=null, clsname=null, edicls=null, delcls=null,
                                           tempTarget=null) {
  let i, j, flg, aDayData,
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

    aDayData = targetHenkou.filter(dayFilterF(targetDays[i].year, targetDays[i].month, targetDays[i].day));
    for(j = 0; j < 10; j++){ // ['日付', '朝HR', '1限', '2限', '3限', '4限', '5限', '6限', '帰HR', '7限']の繰返
      let td = document.createElement('td');
      if (j == 0) {
        td.innerHTML = jhkSimpleCommonMakeDateStr(targetDays[i].year,
                                                  targetDays[i].month,
                                                  targetDays[i].day,
                                                  targetDays[i].youbi);
      } else {
        if (tempTarget          != null             &&
            targetDays[i].year  == tempTarget.year  && 
            targetDays[i].month == tempTarget.month &&
            targetDays[i].day   == tempTarget.day   && 
            j                   == tempTarget.koma) {
          td.innerHTML = jhkSimpleCommonGetHenkou(aDayData, j, delcls, tempTarget.teacher);
        } else {
          td.innerHTML = jhkSimpleCommonGetHenkou(aDayData, j, delcls, null);
        }
      }

      // 選んだ先生の授業の箇所を目立つように
      if (targetteacher != null && jikanwari != null && clsname != null) {
        flg = jhkSimpleCommonGetJyugyou(targetteacher, jikanwari, targetDays[i].nikka, targetDays[i].youbi, j);
      } else {
        flg = '';
      }
      if (flg != '') {
        td.classList.add(clsname);
      }
      // クリックできるようにクラスを設定
      if (edicls != null) {
        td.classList.add(edicls);
      }
      tr.appendChild(td);
    }
    tbl.appendChild(tr);
  }
}

// 時間割変更の表示文字列を取得する
// koma : 1 朝SHR
//      : 2 1限
//      : 3 2限
//      : 4 3限
//      : 5 4限
//      : 6 5限
//      : 7 6限
//      : 8 帰SHR
//      : 9 7限
jhkSimpleCommonGetHenkou = function (aDayData, koma, delcls, tempTarget) {
  let i, aKomaData,
    retStr = '<ul>',
    komaFilterF = function (koma) {
      return function (target) {
        if ( target.koma == koma) {
          return true;
        } else {
          return false;
        }
      }
    },
    addContents = function (delcls, cls, jyugyou, fromTeacher, ToTeacher) {
      let retStr = '<span class="' + cls + '">' + jyugyou;
      if (delcls != null) {
        retStr += '<span class="' + delcls + '">' + fromTeacher + '</span>';
      } else {
        retStr += fromTeacher;
      }
      retStr += '-' + ToTeacher + '</span>';
      return retStr;
    };

  aKomaData = aDayData.filter(komaFilterF(koma));

  for (i = 0; i <= aKomaData.length-1; i++) {
    retStr += '<li>'
    // 授業入れ替えなら
    if (aKomaData[i].hasOwnProperty('to')) {
      retStr += addContents(delcls, 'jhkIrekae', aKomaData[i].jyugyou, aKomaData[i].teacher, aKomaData[i].to);
    // 助勤なら
    } else if (aKomaData[i].hasOwnProperty('jyokin')) {
      retStr += addContents(delcls, 'jhkJyokin', aKomaData[i].jyugyou, aKomaData[i].teacher, aKomaData[i].jyokin);
    // 隣助勤なら
    } else if (aKomaData[i].hasOwnProperty('tonariJyokin')) {
      retStr += addContents(delcls, 'jhkTonariJyokin', aKomaData[i].jyugyou, aKomaData[i].teacher, '(' + aKomaData[i].tonariJyokin + ')');
    }
    retStr += '</li>'
  }

  if (tempTarget != null) {
    retStr += '<li class="jhkKouho">' + tempTarget + '</li>';
  }
  retStr += '</ul>';

  return retStr;
}

// 日課や曜日などから授業名を返す。
// 授業がなければ''を返す。
// nikka: A週or B週
// youbi: '日'～'土'
// k    : 1 朝SHR
//      : 2 1限
//      : 3 2限
//      : 4 3限
//      : 5 4限
//      : 6 5限
//      : 7 6限
//      : 8 帰SHR
//      : 9 7限
jhkSimpleCommonGetJyugyou = function (targetteacher, jikanwari, nikka, youbi, k) {
  let idx, koma, retval = false,
    f = function (targetteacher, nikka, youbi, koma) {
      return function (target) {
        if ( target.teacher == targetteacher &&
             target.nikka   == nikka         &&
             target.youbi   == youbi         &&
             target.koma    == koma          ) {
          return true;
        } else {
          return false;
        }
      }
    };

  if (k >= 2 && k <= 7) {
    koma = k - 1;
  } else if (k == 9) {
    koma = k - 2;
  } else {
    return '';
  }

  idx = jikanwari.findIndex(f(targetteacher, nikka, youbi, koma));

  if ( idx != -1 ) {
    return jikanwari[idx].jyugyou;
  } else {
    return '';
  }
}

jhkSimpleCommonGetKomaStr = function (k) {
  let koma;
  if (k == 1) {
    koma = '朝HR';
  } else if (k >= 2 && k <= 7) {
    koma = String(k - 1) + '限';
  } else if (k == 8) {
    koma = '帰HR';
  } else {
    koma = '7限';
  }
  return koma;
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
  // jhkTeachers の中身はjhkteacher.json.jsにある
  let i, teacher,
    teacherList = document.getElementById(targetId);

  // 先頭に'-'を追加
  teacher = document.createElement('option');
  teacher.value = '-';
  teacher.text = '-';
  teacherList.appendChild(teacher);

  for (i = 0; i <= jhkTeachers.length -1; i++) {
    teacher = document.createElement('option');
    teacher.value = jhkTeachers[i];
    teacher.text = jhkTeachers[i];
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
