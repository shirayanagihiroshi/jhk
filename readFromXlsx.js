const path = require('path');
const XLSX = require('xlsx');
const fs   = require('fs');
// 日本語をうまく扱えないときはjavascriptのファイルの文字コードに注意。shiftjisだとダメだった。
const targetFileName = 'R07時間割_forSkt.xlsx';  // 読み取るファイルに応じて変更が必要
const sheetNameA     = 'R07A';                  // 読み取るファイルに応じて変更が必要
const sheetNameB     = 'R07B';                  // 読み取るファイルに応じて変更が必要
const jikanwariFile  = 'jhkjikanwari.json.js';
const jyugyouFile    = 'jhkjyugyous.json.js';
const teacherFile    = 'jhkteacher.json.js';
const jikanwariPerTeacher = 'jikanwariPerTeacher.json';

// xlsxの読み取り
const source   = path.join(__dirname, targetFileName);
const workbook = XLSX.readFile(source);

// ワークシートの取得
const worksheetA = workbook.Sheets[sheetNameA];
const worksheetB = workbook.Sheets[sheetNameB];

// ワークシートのデータを二次元配列に変換する
const sheetDataA = XLSX.utils.sheet_to_json(worksheetA, {header: 1});
const sheetDataB = XLSX.utils.sheet_to_json(worksheetB, {header: 1});

let xlsx2array, setForSkt, makeTeacherList;
let jikanwariList   = [];
let jyugyouListTemp = [];
let jyugyouListTemp2= [];
let jyugyouList     = [];
let teacherList     = [];
let jikanwariPerTeacherList = [];
let json, i;

// ワークシートを読み取って二次元配列にしたものから
// 必要なデータをとりだし配列に格納する
xlsx2array = function(nikka, sheetValues, jikanwariList) {
  let youbi = 0;
  let koma  = 0;
  // 行と列は固定で扱っている。
  // 'nikka' は 'A' 'B'
  // 'youbi' は 月:1 火:2 水:3 木:4 金:5 土:6
  // 'koma'  は 1限:1 2限:2 ・・・ 7限:7
  for (i = 3;i <= sheetValues.length -1 ; i++) {
    // 月から金曜
    // 各日の1限は2,9,16,23・・・番目のセル
    for (j = 2;j <= 36; j++) {
      if ( j == 2 ) {
        koma  = 1;
        youbi = 1;
      } else if (j == 9 || j == 16 || j == 23  || j == 30) {
        koma  = 1;
        youbi++;
      } else {
        koma++;
      }
      if (sheetValues[i][j] != null && sheetValues[i][j] != "") {
        jikanwariList.push({'nikka'   : nikka,
                            'teacher' : sheetValues[i][0],
                            'youbi'   : youbi,
                            'koma'    : koma,
                            'jyugyou' : sheetValues[i][j]
                           });
        // 授業一覧を作る処理
        jyugyouListTemp.push(sheetValues[i][j]);
      }
    }
    // 37-40は土曜
    for (j = 37;j <= 40; j++) {
      if (sheetValues[i][j] != null && sheetValues[i][j] != "") {
        jikanwariList.push({'nikka'   : nikka,
                            'teacher' : sheetValues[i][0],
                            'youbi'   : 6,
                            'koma'    : j - 36,
                            'jyugyou' : sheetValues[i][j]
                           });
        // 授業一覧を作る処理
        jyugyouListTemp.push(sheetValues[i][j]);
      }
    }
  }
}

// jikanwariList や teacherList が読み込まれている前提で動く
// skt向けの教員ごとの時間割の設定を出力する。jikanwariListとほぼ同じだがデータの形が少し違う。
setForSkt = function () {
  let i, j, jikanwariPerTeacher, jyugyouPerTeacher, tempLst,
    jikanwari, jyugyou,
    retLst = [],
    perTeacher = function (str) {
      return function (target) {
        if ( target.teacher == str ) {
          return true;
        }
      }
    },
    IdFromJyugyouMei = function (Lst, jyugyouMei) {
      let i;
      for (i = 0; i < Lst.length; i++) {
        if (Lst[i].name == jyugyouMei) {
          return Lst[i].jyugyouId;
        }
      }
    };

  for (i = 0; i < teacherList.length; i++) {
    // 時間割データを教員単位で絞り込む
    jikanwariPerTeacher = jikanwariList.filter(perTeacher(teacherList[i].teacher));

    // 重複を含まない授業のリストを得る
    tempLst = [];
    for (j = 0; j < jikanwariPerTeacher.length; j++) {
      tempLst.push(jikanwariPerTeacher[j].jyugyou);
    }
    jyugyouPerTeacher = Array.from(new Set(tempLst));

    // ある教員の授業を設定
    jyugyou = [];
    for (j = 0; j < jyugyouPerTeacher.length; j++) {
      jyugyou.push({ jyugyouId : j+1,
                     name      : jyugyouPerTeacher[j] });
    }

    // ある教員の時間割を設定
    jikanwari = [];
    for (j = 0; j < jikanwariPerTeacher.length; j++) {
      jikanwari.push({ nikka     : jikanwariPerTeacher[j].nikka,
                       youbi     : jikanwariPerTeacher[j].youbi,
                       koma      : jikanwariPerTeacher[j].koma,
                       jyugyouId : IdFromJyugyouMei(jyugyou, jikanwariPerTeacher[j].jyugyou)});
    }

    // sktでは教員の識別にはuserIdを使う。teacherNameは現状使っていないが、
    // データを見たとき分かりやすいかもしれないので設定しておく
    retLst.push({ teacherName : teacherList[i].teacher,
                  userId      : teacherList[i].userId,
                  jyugyou     : jyugyou,
                  jikanwari   : jikanwari});
  }
  return retLst;
}

makeTeacherList = function (sheetValues) {
  let i, lst, obj;

  lst = [];

  for (i = 3;i <= sheetValues.length -1 -3 ; i++) {
    obj = {'teacher' : sheetValues[i][0],
           'kyouka'  : ""}; // 後で人間が設定する。
                            // 国語or社会or数学or理科or英語or体育orその他
    if (sheetValues[i][1] != "") {
      obj.userId = sheetValues[i][1];
    }
    lst.push(obj);
  }
  return lst;
}

xlsx2array('A', sheetDataA, jikanwariList);
xlsx2array('B', sheetDataB, jikanwariList);

teacherList = makeTeacherList(sheetDataA); // Aの名簿とBの名簿は同じはず

jyugyouListTemp2 = Array.from(new Set(jyugyouListTemp));
jyugyouListTemp2.sort();
for (i = 0; i <= jyugyouListTemp2.length -1 ; i++) {
  jyugyouList.push({'jyugyou' : jyugyouListTemp2[i],
                    'cls' : []}); // 後で人間が設定する。
}

if (process.argv[2] == 'jhk') {
  let i;

  json = JSON.stringify(jikanwariList);
  fs.writeFileSync('public/js/' + jikanwariFile, 'let jhkJikanwari = ' + json);

  // (setForSktで使うので一旦設定したが)
  // sktのユーザIDはjhkには要らないので消しておく
  for (i = 0; i < teacherList.length; i++) {
    delete teacherList[i].userId;
  }
  json = JSON.stringify(teacherList);
  fs.writeFileSync('public/js/' + teacherFile, 'let jhkTeachers = ' + json);

  json = JSON.stringify(jyugyouList);
  fs.writeFileSync('public/js/' + jyugyouFile, 'let jhkJyugyous = ' + json);

} else if (process.argv[2] == 'skt') {

  jikanwariPerTeacherList = setForSkt();
  json = JSON.stringify(jikanwariPerTeacherList);
  fs.writeFileSync('public/js/' + jikanwariPerTeacher, json);

} else {
  console.log('input parameter jhk or skt like that "node readFromXlsx.js jhk"');
}
