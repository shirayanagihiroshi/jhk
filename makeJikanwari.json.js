/*  使い方

1:完成した時間割をイデアの時間割で開く。
2:ファイル
  ->テキストファイル(CSV)出力設定　&　出力
3:出力する形式の選択（ダイアログ右上）
  で　先生一覧出力　を選ぶ
(設定
・先生の出力は
　１授業ID
　２クラス名
・先頭に文字を付加するはチェックを外す
・出力文字数は6文字以上
・選択授業の出力内容
　科目名：
　　　内訳科目名を出力
　クラス名・教室名：
　　　1-1,1-2の複数のクラスを1-12と出力はチェックしない
　　（職員室に張り出す一覧表はこれにチェックしてるっぽい）
　内訳の印字方式；
　　　内訳先頭から出力
)
※上の出力設定で、3-12は3-1、3-2みたいに出力されるはず
4:テキスト出力ボタンを押す
5:全ての先生にチェックが入った状態で出力ボタンを押す
7:ファイルの種類でCSV形式データ(*.csv)を選び、保存ボタンを押す
6:先生一覧.csv(以降X)が出力される。

7:X の文字コードがSJISなので、UTF-8にして上書きする。

7':道徳や学活あたりはデータの修正が必要！

8: 上記と同様に　選択授業設定出力　を選んで
  選択授業の授業設定.csv(以降Y)が出力される

9:XとY を本ファイルを同じフォルダに置き、コマンドプロンプトで以下をする。
  node makeJikanwari.json.js

*/

const path = require('path');
const fs   = require('fs');
// 日本語をうまく扱えないときはjavascriptのファイルの文字コードに注意。shiftjisだとダメだった。
const itiranFileName = '先生一覧.csv';            // 読み取るファイルに応じて変更が必要
const sentakuFileName = '選択授業の授業設定.csv'; // 読み取るファイルに応じて変更が必要
const jikanwariFile  = 'jhkjikanwari.json.js';
const jyugyouFile    = 'jhkjyugyous.json.js';

// csvファイルの読み取り
let source     = path.join(__dirname, itiranFileName);
let itiranFile = fs.readFileSync(source, 'utf8');

source     = path.join(__dirname, sentakuFileName);
let sentakuFile = fs.readFileSync(source, 'utf8');

// BOM（\ufeff）があれば除去する
if (itiranFile.startsWith('\ufeff')) {
  itiranFile = itiranFile.slice(1);
}

if (sentakuFile.startsWith('\ufeff')) {
  sentakuFile = sentakuFile.slice(1);
}

// 全角の数字を半角の数字に変換。全角のハイフンも半角に
itiranFile  = toHalfWidth(itiranFile);
sentakuFile = toHalfWidth(sentakuFile);

function toHalfWidth(str) {
  return str.replace(/[！-～]/g, function(s) {
    // 文字コードを 0xFEE0 分ずらすことで全角から半角に変換
    return String.fromCharCode(s.charCodeAt(0) - 0xfee0);
  }).replace(/－/g, "-")  // 全角ハイフン(マイナス)を半角に
    .replace(/ー/g, "-")  // 全角長音を半角に
    .replace(/—/g, "-")  // エムダッシュを半角に
    .trim();              // 前後の余計な空白を消す
}

// データを二次元配列に変換する
const itiranData  = convertCSVtoArray(itiranFile);
const sentakuData  = convertCSVtoArray(sentakuFile);

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

// 2次元配列からjavascriptのオフジェクトの配列にする。
// { jyugyouID;"hoge",
//   teacher:["A先生", "B先生"],
//   class : "3-17", "3-17"} みたいなもののリスト
const sentakuList = makeSentakuList(sentakuData);
function makeSentakuList (arr) {
  let i, lst, objMakingFlg, obj;

  lst = [];

  objMakingFlg = false;

  for (i = 0; i < arr.length; i++) {
    if (arr[i][0] == "選択授業名" ) {
      obj = {'jyugyouID' : arr[i][1],
             'teacher'   : [],
             'class'     : []};

      objMakingFlg = true;

    } else if(objMakingFlg == true && arr[i][0] == "授業ID") { // ここはスルー

    } else if(objMakingFlg == true && obj.jyugyouID == arr[i][0]) {

      // ここでいう選択授業は、生徒が選択するかでなく、
      // 先生複数人や生徒複数集団にまたがるような授業のこと
      //
      // LHRの、担任- クラス　みたいに、使う意味があるもの(R8年のデータを見て書いてる)と
      // 3-16実英数みたいに、イデア的にクラスは入力されているけど
      // (クラスをまたいだ別の集団で授業をやるから)
      // ここでのクラスにあまり意味のないものもあるので注意

      obj.teacher.push(arr[i][2]); //先生名
      obj.class.push(arr[i][3]);   //クラス名

    } else {
      if (objMakingFlg == true) {
        lst.push(obj);
        objMakingFlg = false;
      }
    }
  }
  return lst;
}

let jyugyouList = [];
function makeJyugyou(jyugyou, cls) {
  let f = function (str) {
    return function (target) {
      if ( target.jyugyou == str ) {
        return true;
      }
    }
  };

  // jyugyou ""のときはクラス名をjyugyouとする
  if (jyugyou == "") {
    // なければ追加
    if (jyugyouList.find(f(cls)) === undefined) {
      jyugyouList.push({'jyugyou' : cls,
                        'cls'     : [cls]
      });
    }

  } else {
    // なければ追加
    if (jyugyouList.find(f(jyugyou)) === undefined) {
      // clsがもともと配列なら
      if (Array.isArray(cls)) {
        jyugyouList.push({'jyugyou' : jyugyou,
                          'cls'     : cls
        });
      } else {
        jyugyouList.push({'jyugyou' : jyugyou,
                          'cls'     : [cls]
        });
      }
    }
  }
}

const itiranList = makeItiranList(itiranData);
function makeItiranList(arr) {
  const startRow = 3; // 5行目から先生ごとの時間割が始まる

  // 特定の授業IDが選択授業のリストにあるかどうかチェックし、
  // クラスの設定を返す
  // あと、授業のリストを作る。clsStrは授業のリストを作るのにしか使ってない。
  function inSentaku (teacherStr, jyugyouIDStr, clsStr) {
    let f = function (str) {
      return function (target) {
        if ( target.jyugyouID == str ) {
          return true;
        }
      }
    };

    // イデアの選択授業の設定のうち、参照する価値のあるものはそれをつかう。
    if (jyugyouIDStr == 'LHR' || jyugyouIDStr == '学活' || jyugyouIDStr == '道徳') {
      let obj = sentakuList.find(f(jyugyouIDStr));
      if (obj === undefined) {
        // ないはず
      } else {
        let idx = obj.teacher.indexOf(teacherStr);
        // 見つかるはずの処理
        if (idx != -1) {

          makeJyugyou("", obj.class[idx]);

          return obj.class[idx];
        }
      }

    // 複数のクラスが混ざる授業は、選択授業の設定のクラスでは解決しない
    } else {
      let obj = sentakuList.find(f(jyugyouIDStr));
      if (obj === undefined) {

        // 選択授業のリストにないとき
        makeJyugyou("", clsStr);

        return "";
      } else {

        // 選択授業のリストにないとき
        // クラスが、で連結されているのでばらす
        makeJyugyou(jyugyouIDStr, clsStr.split(/[、,]/).map(item => item.trim()) );

        return jyugyouIDStr;
      }
    }
  }

  let lst, i, j, str, jyugyou, nikka, youbi, koma;

  lst = [];

  // 先生ごとの繰り返し
  // イデアから先生一人当たり2行で出力したものを参照する
  // 1行目は授業ID、2行目はクラス。クラスのほうはあてにならない時があるので注意
  for (i = startRow; i < arr.length; i = i + 2) {

    // A週月曜から土曜、B週月曜から金曜の11日×7
    for (j = 1; j < 77; j++) {

      if (arr[i][j].length > 0) {
        str = inSentaku(arr[i][0], arr[i][j], arr[i + 1][j]);
        // 授業IDが選択授業リストにあるものなら、それをつかう
        if (str != "") {
          jyugyou = str;
        // そうでなければ、次の行のクラス名を使う
        } else {
          jyugyou = arr[i + 1][j];
        }

        if (1 <= j && j <= 7) {
          nikka = 'A';
          youbi = 1;
          koma  = j;
        } else if (8 <= j && j <= 14){
          nikka = 'A';
          youbi = 2;
          koma  = j - 7;
        } else if (15 <= j && j <= 21){
          nikka = 'A';
          youbi = 3;
          koma  = j - 14;
        } else if (22 <= j && j <= 28){
          nikka = 'A';
          youbi = 4;
          koma  = j - 21;
        } else if (29 <= j && j <= 35){
          nikka = 'A';
          youbi = 5;
          koma  = j - 28;
        } else if (36 <= j && j <= 42){
          nikka = 'A';
          youbi = 6;
          koma  = j - 35;
        } else if (43 <= j && j <= 49){
          nikka = 'B';
          youbi = 1;
          koma  = j - 42;
        } else if (50 <= j && j <= 56){
          nikka = 'B';
          youbi = 2;
          koma  = j - 49;
        } else if (57 <= j && j <= 63){
          nikka = 'B';
          youbi = 3;
          koma  = j - 56;
        } else if (64 <= j && j <= 70){
          nikka = 'B';
          youbi = 4;
          koma  = j - 63;
        } else if (71 <= j && j <= 77){
          nikka = 'B';
          youbi = 5;
          koma  = j - 70;
        }
        lst.push({'nikka'   : nikka,
                  'teacher' : arr[i][0],
                  'youbi'   : youbi,
                  'koma'    : koma,
                  'jyugyou' : jyugyou
        });
      }
    }
  }

  return lst;
}

let json = JSON.stringify(itiranList);
fs.writeFileSync('public/js/' + jikanwariFile, 'let jhkJikanwari = ' + json);

json = JSON.stringify(jyugyouList);
fs.writeFileSync('public/js/' + jyugyouFile, 'let jhkJyugyous = ' + json);

