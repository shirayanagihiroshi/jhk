/*
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
  jhkSimpleCommonSetClsLst, jhkClsFilterF,
  jhkSimpleCommonSetTeachersLst, jhkTeacherFilterF,
  jhkSimpleCommonSetKyoukaLst,
  jhkSimpleCommonSetJyugyouLst;

// そうそう変更されなさそうだし、jsonファイルを用意するほどのものでもないのでここに。
// 先生をプルダウンから選ぶのにリストが長すぎなので、これで絞り込む
const jhkkyouka = [
  '-',
  '国語',
  '社会',
  '数学',
  '理科',
  '英語',
  '体育',
  'その他'
  ]

jhkSimpleCommonCelPosToKoma = function (CelPos) {
  let headers = ['日付', '朝HR', '1限', '2限', '3限', '4限', '5限', '6限', '帰HR', '7限'];

  return headers[CelPos];
}

// テーブルにヘッダーを追加する
jhkSimpleCommonAddTableHeaher = function (targetId, kind=null) {
  let i, tr, array,
    headersForHenkouTantou = ['日付','いない人', '朝HR', '1限', '2限', '3限', '4限', '5限', '6限', '帰HR', '7限'],
    headers =                ['日付'           , '朝HR', '1限', '2限', '3限', '4限', '5限', '6限', '帰HR', '7限'],
    tbl = document.getElementById(targetId);

  tr = document.createElement('tr');

  if (kind == "ForHenkouTantou") {
    array = headersForHenkouTantou;
  } else {
    array = headers;
  }

  for(i = 0; i <= array.length - 1 ; i++){
    let th = document.createElement('th');

    th.innerHTML = array[i];
    th.classList.add('jhk-table-header');
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
// tempTarget   : 入れ替えのうち、1人目のデータ(授業変更の登録の、入れ替えモードのときのみ設定)
// infocls      : いない人情報入力用クラスの名前(授業変更の登録のときのみ設定)
// kind         : 授業変更の登録のときのみ、"ForHenkouTantou"を指定
jhkSimpleCommonAddTableContents = function(targetId, targetHenkou, targetDays, targetteacher=null, jikanwari=null, clsname=null, edicls=null, delcls=null,
                                           tempTarget=null, infocls=null, kind=null) {
  let i, j, flg, aDayData, tableColumnNum,
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

    if (kind == "ForHenkouTantou") {
      tableColumnNum = 11;  // ['日付', 'いない人', '朝HR', '1限', '2限', '3限', '4限', '5限', '6限', '帰HR', '7限']の繰返
    } else {
      tableColumnNum = 10;  // ['日付'            , '朝HR', '1限', '2限', '3限', '4限', '5限', '6限', '帰HR', '7限']の繰返
    }

    aDayData = targetHenkou.filter(dayFilterF(targetDays[i].year, targetDays[i].month, targetDays[i].day));
    for(j = 0; j < tableColumnNum; j++){
      let td = document.createElement('td');
      // 日付
      if (j == 0) {
        td.innerHTML = jhkSimpleCommonMakeDateStr(targetDays[i].year,
                                                  targetDays[i].month,
                                                  targetDays[i].day,
                                                  targetDays[i].youbi);

      // 登録担当者用
      } else if (kind == "ForHenkouTantou") {
        // いない人
        if (j == 1) {

          td.innerHTML = "〇〇 9:00-12:00";

        // 表示のみ用と同じ流れ
        } else {
          if (tempTarget          != null             &&
              targetDays[i].year  == tempTarget.year  && 
              targetDays[i].month == tempTarget.month &&
              targetDays[i].day   == tempTarget.day   && 
              j - 1               == tempTarget.koma) {
            td.innerHTML = jhkSimpleCommonGetHenkou(aDayData, j - 1, delcls, tempTarget.teacher);
          } else {
            td.innerHTML = jhkSimpleCommonGetHenkou(aDayData, j - 1, delcls, null);
          }
        }
      // 表示のみ用
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
        if (kind == "ForHenkouTantou"  && j >= 2 ) {
          flg = jhkSimpleCommonGetJyugyou(targetteacher, jikanwari, targetDays[i].nikka, targetDays[i].youbi, j - 1);
        } else {
          flg = jhkSimpleCommonGetJyugyou(targetteacher, jikanwari, targetDays[i].nikka, targetDays[i].youbi, j);
        }
      } else {
        flg = '';
      }
      if (flg != '') {
        td.classList.add(clsname);
      }
      // クリックできるようにクラスを設定
      if (infocls != null && j == 1) { //j==1は'いない人'のとき
        td.classList.add(infocls);
      } else if (edicls != null) {
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

//クラスのリストを設定する
jhkSimpleCommonSetClsLst = function(targetId) {
  // jhkClasses の中身はjhkClasses.json.jsにある
  let i, cls,
    classList = document.getElementById(targetId);

  // 先頭に'-'を追加
  cls = document.createElement('option');
  cls.value = '-';
  cls.text = '-';
  classList.appendChild(cls);

  // 中学校を追加
  cls = document.createElement('option');
  cls.value = '中学';
  cls.text = '中学';
  classList.appendChild(cls);

  // 高校を追加
  cls = document.createElement('option');
  cls.value = '高校';
  cls.text = '高校';
  classList.appendChild(cls);

  for (i = 0; i <= jhkClasses.length -1; i++) {
    cls = document.createElement('option');
    cls.value = jhkClasses[i];
    cls.text = jhkClasses[i];
    classList.appendChild(cls);
  }
}

// 教員のリストを設定する
jhkSimpleCommonSetTeachersLst = function(targetId, teacherForcus=null, kyoukaFilter=null) {
  // jhkTeachers の中身はjhkteacher.json.jsにある
  let i, teacher,
    targetlst = [],
    teacherList = document.getElementById(targetId),
    f = function (kyouka) {
      return function (target) {
        if ( target.kyouka == kyouka) {
          return true;
        } else {
          return false;
        }
      }
    };

  teacherList.innerHTML='';

  if (kyoukaFilter == null || kyoukaFilter == '' || kyoukaFilter == '-') { //起動時は''でくる
    targetlst = jhkTeachers;
  } else {
    targetlst = jhkTeachers.filter(f(kyoukaFilter));
  }

  // 先頭に'-'を追加
  teacher = document.createElement('option');
  teacher.value = '-';
  teacher.text = '-';
  teacherList.appendChild(teacher);

  for (i = 0; i <= targetlst.length -1; i++) {
    teacher = document.createElement('option');
    teacher.value = targetlst[i].teacher;
    teacher.text = targetlst[i].teacher;
    if (teacherForcus != null && teacherForcus == targetlst[i].teacher) {
      teacher.selected = true;
    }
    teacherList.appendChild(teacher);
  }
};

// 教科のリストを設定する
jhkSimpleCommonSetKyoukaLst = function(targetId, kyoukaForcus=null) {
  // jhkkyouka の中身はこのファイルにある
  let i, kyouka,
    kyoukaList = document.getElementById(targetId);

  for (i = 0; i <= jhkkyouka.length -1; i++) {
    kyouka = document.createElement('option');
    kyouka.value = jhkkyouka[i];
    kyouka.text = jhkkyouka[i];
    if (kyoukaForcus != null && kyoukaForcus == jhkkyouka[i]) {
      kyouka.selected = true;
    }
    kyoukaList.appendChild(kyouka);
  }
};

// 教員絞り込み関数
jhkTeacherFilterF = function (t) {
  return function (target) {
    if ( (target.teacher == t) ||
         (target.hasOwnProperty('to')           == true && target.to           == t) ||
         (target.hasOwnProperty('jyokin')       == true && target.jyokin       == t) ||
         (target.hasOwnProperty('tonariJyokin') == true && target.tonariJyokin == t) ) {
      return true;
    } else {
      return false;
    }
  }
};

// 授業のリストを設定する
jhkSimpleCommonSetJyugyouLst = function(targetId, jyugyouForcus=null) {
  // jhkJyugyous の中身はjhkjyugyous.json.jsにある
  let i, jyugyou,
    jyugyouList = document.getElementById(targetId);

  // 先頭に'-'を追加
  jyugyou = document.createElement('option');
  jyugyou.value = '-';
  jyugyou.text = '-';
  jyugyouList.appendChild(jyugyou);

  for (i = 0; i <= jhkJyugyous.length -1; i++) {
    jyugyou = document.createElement('option');
    jyugyou.value = jhkJyugyous[i].jyugyou;
    jyugyou.text = jhkJyugyous[i].jyugyou;
    if (jyugyouForcus != null && jyugyouForcus == jhkJyugyous[i].jyugyou) {
      jyugyou.selected = true;
    }
    jyugyouList.appendChild(jyugyou);
  }
}

// クラスによる絞り込み関数
// これは授業を絞りこむのに使う
jhkClsFilterF = function (cls) {
  return function (target) {
    if (cls == '中学') { //中学のときは特別の判定
      if ( target.cls.includes('1-A') || target.cls.includes('1-B') || target.cls.includes('1-C') ||
           target.cls.includes('2-A') || target.cls.includes('2-B') || target.cls.includes('2-C') ||
           target.cls.includes('3-A') || target.cls.includes('3-B') || target.cls.includes('3-C') ) {
        return true;
      } else {
        return false;
      }
    } else if (cls == '高校') {
      if ( target.cls.includes('1-1') || target.cls.includes('1-2') || target.cls.includes('1-3') || target.cls.includes('1-4') || target.cls.includes('1-5')  ||
           target.cls.includes('1-6') || target.cls.includes('1-7') || target.cls.includes('1-8') || target.cls.includes('1-9') || target.cls.includes('1-10') ||
           target.cls.includes('2-1') || target.cls.includes('2-2') || target.cls.includes('2-3') || target.cls.includes('2-4') || target.cls.includes('2-5')  ||
           target.cls.includes('2-6') || target.cls.includes('2-7') || target.cls.includes('2-8') || target.cls.includes('2-9') || target.cls.includes('2-10') ||
           target.cls.includes('3-1') || target.cls.includes('3-2') || target.cls.includes('3-3') || target.cls.includes('3-4') || target.cls.includes('3-5')  ||
           target.cls.includes('3-6') || target.cls.includes('3-7') || target.cls.includes('3-8') || target.cls.includes('3-9') || target.cls.includes('3-10') ) {
        return true;
      } else {
        return false;
      }
    } else {
      if (target.cls.includes(cls)) {
        return true;
      } else {
        return false;
      }
    }
  }
};
