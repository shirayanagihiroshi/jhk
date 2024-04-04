const path = require('path');
const XLSX = require('xlsx');
const fs   = require('fs');
// 日本語をうまく扱えないときはjavascriptのファイルの文字コードに注意。shiftjisだとダメだった。
const targetFileName = 'R06時間割_forjhk_v2.xlsx';  // 読み取るファイルに応じて変更が必要
const sheetNameA     = 'R06A';                  // 読み取るファイルに応じて変更が必要
const sheetNameB     = 'R06B';                  // 読み取るファイルに応じて変更が必要
const jikanwariFile  = 'jhkjikanwari.json.js';
const jyugyouFile    = 'jhkjyugyous.json.js';
const teacherFile    = 'jhkteacher.json.js';

// xlsxの読み取り
const source   = path.join(__dirname, targetFileName);
const workbook = XLSX.readFile(source);

// ワークシートの取得
const worksheetA = workbook.Sheets[sheetNameA];
const worksheetB = workbook.Sheets[sheetNameB];

// ワークシートのデータを二次元配列に変換する
const sheetDataA = XLSX.utils.sheet_to_json(worksheetA, {header: 1});
const sheetDataB = XLSX.utils.sheet_to_json(worksheetB, {header: 1});

let xlsx2array;
let jikanwariList   = [];
let jyugyouListTemp = [];
let jyugyouListTemp2= [];
let jyugyouList     = [];
let teacherListTemp = [];
let teacherListTemp2= [];
let teacherList     = [];
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
        // 教員一覧を作る処理
        teacherListTemp.push(sheetValues[i][0]);
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
        // 教員一覧を作る処理
        teacherListTemp.push(sheetValues[i][0]);
        // 授業一覧を作る処理
        jyugyouListTemp.push(sheetValues[i][j]);
      }
    }
  }
}
  
xlsx2array('A', sheetDataA, jikanwariList);
xlsx2array('B', sheetDataB, jikanwariList);

// 重複の排除
teacherListTemp2 = Array.from(new Set(teacherListTemp));
for (i = 0; i <= teacherListTemp2.length -1 ; i++) {
  teacherList.push({'teacher' : teacherListTemp2[i],
                    'kyouka' : ""}); // 後で人間が設定する。
                                     // 国語or社会or数学or理科or英語or体育orその他
}
jyugyouListTemp2 = Array.from(new Set(jyugyouListTemp));
jyugyouListTemp2.sort();
for (i = 0; i <= jyugyouListTemp2.length -1 ; i++) {
  jyugyouList.push({'jyugyou' : jyugyouListTemp2[i],
                    'cls' : []}); // 後で人間が設定する。
}


json = JSON.stringify(jikanwariList);
fs.writeFileSync('public/js/' + jikanwariFile, 'let jhkJikanwari = ' + json);

json = JSON.stringify(teacherList);
fs.writeFileSync('public/js/' + teacherFile, 'let jhkTeachers = ' + json);

json = JSON.stringify(jyugyouList);
fs.writeFileSync('public/js/' + jyugyouFile, 'let jhkJyugyous = ' + json);
