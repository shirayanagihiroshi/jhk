/*  使い方

1:完成した時間割をイデアの時間割で開く。
2:ファイル
  ->テキストファイル(CSV)出力設定　&　出力
3:出力する形式の選択（ダイアログ右上）
  で　先生名出力　を選ぶ
4:テキスト出力ボタンを押す
5:全ての先生にチェックが入った状態で出力ボタンを押す
7:ファイルの種類でCSV形式データ(*.csv)を選び、保存ボタンを押す
6:先生名出力.csv(以降X)が出力される。

7:X の文字コードがSJISなので、UTF-8にして上書きする。

8:X を本ファイルを同じフォルダに置き、コマンドプロンプトで以下をする。
  node makeTeacher.json.js

*/

const path = require('path');
const fs   = require('fs');
// 日本語をうまく扱えないときはjavascriptのファイルの文字コードに注意。shiftjisだとダメだった。
const targetFileName = '先生名出力.csv';        // 読み取るファイルに応じて変更が必要
const teacherFile    = 'jhkteacher.json.js';

// csvファイルの読み取り
const source     = path.join(__dirname, targetFileName);
let targetfile = fs.readFileSync(source, 'utf8');

// BOM（\ufeff）があれば除去する
if (targetfile.startsWith('\ufeff')) {
  targetfile = targetfile.slice(1);
}

// データを二次元配列に変換する
const targetdata  = convertCSVtoArray(targetfile);

// 読み込んだCSVデータを二次元配列に変換する
function convertCSVtoArray(str){ // 読み込んだCSVデータが文字列として渡される
  let result = [];
  // \r\n と \n の両方に対応して分割
  let tmp = str.split(/\r?\n/); 

  for(let i = 0; i < tmp.length; i++){
    // 各行をカンマで分けた後、各要素の " を消して空白をトリムする
    let row = tmp[i].split(',').map(item => {
      return item.replace(/"/g, '').trim(); // 全ての " を削除して前後を掃除
    });

    result.push(row);
  }
  return result;
}

const teacherList = makeTeacherList(targetdata);

function makeTeacherList(arr) {
  let i, lst, obj;

  lst = [];

  for (i = 0; i < arr.length; i++) {
    obj = {'teacher' : arr[i][0],  // 先頭の教員名を使う
           'kyouka'  : arr[i][3]}; // 4番目に教科名がある。（イデアが吐いてくるものが変わったら変更する）

    // イデアが吐いてくるものと、jhkに使うものの帳尻を合わせる。
    // 歴公 -> 社会
    if (obj.kyouka == "歴公") {
      obj.kyouka = "社会";

    // 変更なし
    } else if ( obj.kyouka == "国語" || obj.kyouka == "数学" || obj.kyouka == "理科" || obj.kyouka == "理科" || obj.kyouka == "英語" || obj.kyouka == "体育"){

    // その他はこれに
    } else {
      obj.kyouka = "その他";
    }

    lst.push(obj);
  }

  // 養護教諭も追記しておく
  obj = {'teacher' : "鳥居",
         'kyouka'  : "その他"};
  lst.push(obj);
  
  return lst;
}

const json = JSON.stringify(teacherList);
fs.writeFileSync('public/js/' + teacherFile, 'let jhkTeachers = ' + json);
