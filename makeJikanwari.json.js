/*

概要

jhkとsktの両方向けのデータを生成する
readFromXlsx.js　に代わるものである。
エクセルでなくCVSを読むので、require('xlsx')を必要としない。

データの流れ
　イデアから
　先生名出力.csv
　先生一覧.csv　※出力の手順
　選択授業の授業設定.csv
　先生の授業設定.csv
　を出力する

CSVは多分文字コードがSJISなので、【UTF-8】にして上書きする。

【手作業】先生名出力.csv　の（エクセルで開いたときのE列）へsktのuserIdを記載する

node makeJikanwariPre.json.js

をする。これは同じフォルダに
　先生の授業設定_名簿付.csv
を出力する。これはシステムに読ませる生成物でなく、中間生成物である。
クラス単位で行う授業は学年や組を設定したが、
クラスをまたいで行う授業などは合同名簿IDを設定する必要がある。
ここで【手作業】で合同名簿IDを降っていけば、SKTの個人の設定が完成する
はずであるが、R8年の準備作業としては手が回らなかった。

（先生の授業設定_名簿付.csv　に合同名簿IDを追記する。
　エクセルの操作で一番最初の行ColumnN・・・とゴミが入ったときは削除すること）

その後
node makeJikanwari.json.js　する。



※出力の手順

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
6:先生一覧.csvが出力される。


構成
  makeJikanwariPre.json.js
  makeJikanwari.json.js
の両方で使う関数は
  makeJikanwariTool.json.js
にある。

*/

const tools = require('./makeJikanwariTool.json.js');
const path  = require('path');
const fs    = require('fs');
// 日本語をうまく扱えないときはjavascriptのファイルの文字コードに注意。shiftjisだとダメだった。
const teacherFileName           = '先生名出力.csv';         // 入力 【手動でsktのIDの付与が必要！】
const itiranFileName            = '先生一覧.csv';           // 入力
const sentakuFileName           = '選択授業の授業設定.csv'; // 入力
const jyugyouPerTeacherFileName = '先生の授業設定.csv';     // 入力
const jyugyouPerTeacherExFName  = '先生の授業設定_名簿付.csv';  // 入力　合同名簿IDの追記ができるとよい

const teacherFile               = 'jhkteacher.json.js';     // 出力
const jikanwariFile             = 'jhkjikanwari.json.js';   // 出力
const jyugyouIDsFile            = 'jhkjyugyous.json.js';    // 出力

const jikanwariPerTeacher       = 'jikanwariPerTeacher.json'; // 出力　for SKT

// csvファイルの読み取り
let source      = path.join(__dirname, teacherFileName);
let teacherNameFile = fs.readFileSync(source, 'utf8');

source          = path.join(__dirname, itiranFileName);
let itiranFile  = fs.readFileSync(source, 'utf8');

source          = path.join(__dirname, sentakuFileName);
 let sentakuFile = fs.readFileSync(source, 'utf8');

source          = path.join(__dirname, jyugyouPerTeacherExFName);
let jyugyouPteacher = fs.readFileSync(source, 'utf8');

// BOM（\ufeff）があれば除去する
if (teacherNameFile.startsWith('\ufeff')) {
  teacherNameFile = teacherNameFile.slice(1);
}

if (itiranFile.startsWith('\ufeff')) {
  itiranFile = itiranFile.slice(1);
}

if (sentakuFile.startsWith('\ufeff')) {
  sentakuFile = sentakuFile.slice(1);
}

if (jyugyouPteacher.startsWith('\ufeff')) {
  jyugyouPteacher = jyugyouPteacher.slice(1);
}

// 全角の数字を半角の数字に変換。全角のハイフンも半角に
teacherNameFile  = tools.toHalfWidth(teacherNameFile);
itiranFile       = tools.toHalfWidth(itiranFile);
sentakuFile      = tools.toHalfWidth(sentakuFile);
jyugyouPteacher  = tools.toHalfWidth(jyugyouPteacher);

// CSVデータを二次元配列に変換する
const teacherData  = tools.convertCSVtoArray(teacherNameFile);
const itiranData   = tools.convertCSVtoArray(itiranFile);
const sentakuData  = tools.convertCSVtoArray(sentakuFile);
const jyugyouPteacherData = tools.convertCSVtoArray(jyugyouPteacher);


const teacherList = makeTeacherList(teacherData);

function makeTeacherList(arr) {
  let i, lst, obj, objforSKT;

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


// 2次元配列からjavascriptのオフジェクトの配列にする。
// { jyugyouID;"hoge",
//   teacher:["A先生", "B先生"],
//   class : "3-17", "3-17"} みたいなもののリスト
const sentakuList = tools.makeSentakuList(sentakuData);

// この授業のリストはjhk用のデータ。
// 学校全体でどんな授業があるかの一覧
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


// 先生の授業設定_名簿付.csv の以下をjavascriptの配列にする
// 先生名,
// userId(sktの),
// 授業ID(sktの),
// name(sktの授業名の意。イデアの授業IDで 現代文 みたいなやつ。後で一覧から読み取るときに使う),
// クラス名(3-1みたいなやつ。後で一覧から読み取るときに使う),
// gakunen,
// cls,
// goudouMeiboId
let jyugyouPerTeacherList = makejyugyouPerTeacherList(jyugyouPteacherData);

function makejyugyouPerTeacherList(arr) {
  let i, teacher ;
  let lst = [];

  function getJyugyouObj(arr) {
    // クラス名があれば
    if (arr[4].length > 0) {
      return { jyugyouId : arr[2],
               gakunen   : arr[5],
               cls       : arr[6],
               name      : arr[3],
               clsName   : arr[4]
             };
    } else {
      return { jyugyouId : arr[2],
               name      : arr[3],
               clsName   : arr[4]
             };
    }
  }

  for (i = 0; i < arr.length; i++) {
    if (i == 0) {
      teacher = { teacherName : arr[i][0],
                  userId    : arr[i][1],
                  jyugyou   : [],
                  jikanwari : [] };
      teacher.jyugyou.push(getJyugyouObj(arr[i]));

    // ユーザが切り替わったら
    } else if (i != 0 && arr[i][1] != arr[i - 1][1]) {

      lst.push(teacher);

      teacher = { teacherName : arr[i][0],
                  userId    : arr[i][1],
                  jyugyou   : [],
                  jikanwari : [] };
      teacher.jyugyou.push(getJyugyouObj(arr[i]));

    } else {
      teacher.jyugyou.push(getJyugyouObj(arr[i]));
    }
  }

  return lst;
}


const itiranList = makeItiranList(itiranData);
function makeItiranList(arr) {
  const startRow = 3; // ここから先生ごとの時間割が始まる

  let searchTeacher = function (str) {
    return function (target) {
      if ( target.teacherName == str ) {
        return true;
      }
    }
  };
  function addjyugyou(teacher, jyugyouname, clsname, nikka, youbi, koma) {
    let i;

    if (teacher != null) {
      let jId = 0;

      // 不毛な処理をしている気がするが
      // 授業名とクラス名から授業IDを引き当てる
      // まず、授業名とクラス名が両方一致するものを探す
      // クラス単位の授業はここで見つかるはず
      for (i = 0; i < teacher.jyugyou.length; i++) {
        if ( teacher.jyugyou[i].name == jyugyouname &&
             teacher.jyugyou[i].clsName == clsname) {
          jId = teacher.jyugyou[i].jyugyouId;
        }
      }
      // 次に、授業名だけでさがず
      // 選択授業はここでみつかるはず
      if (jId == 0) {
        for (i = 0; i < teacher.jyugyou.length; i++) {
          if ( teacher.jyugyou[i].name == jyugyouname ) {
            jId = teacher.jyugyou[i].jyugyouId;
          }
        }
      }

      teacher.jikanwari.push({ nikka     : nikka,
                               youbi     : youbi,
                               koma      : koma,
                               jyugyouId : jId
                             });
    }
  }

  // 特定の授業IDが選択授業のリストにあるかどうかチェックし、
  // クラスの設定を返す
  // あと、授業のリストを作る。clsStrは授業のリストを作るのにしか使ってない。
  // jyugyouIDStrとclsStrは　先生一覧.csv　における上と下
  function inSentaku (teacherStr, jyugyouIDStr, clsStr) {
    let f = function (str) {
      return function (target) {
        if ( target.jyugyouID == str ) {
          return true;
        }
      }
    };

    // イデアの選択授業の設定のうち、参照する価値のあるものはそれをつかう。
    // つまり特別な処理をする対象の授業IDたちを挙げる
    if (jyugyouIDStr == 'LHR') {
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

    // 特別な処理をしない授業IDたち　つまり　普通の処理
    // 複数のクラスが混ざる授業は、イデアの選択授業の設定のクラスでは解決しないので
    // 複数のクラスをそのまま設定しておく。
    } else {
      let obj = sentakuList.find(f(jyugyouIDStr));
      // イデアでいう選択授業でないときは　clsStrは　3-1　みたいなものであるはず
      if (obj === undefined) {

        makeJyugyou("", clsStr);

        return "";

      // イデアでいう選択授業であるとき　clsStrは　3-1、3-2、3-3　みたいなものかもしれないし
      // 3-1みたいなものかもしれない
      } else {

        // クラスの連結をばらす。もともと連結されていないデータは単独のリストとなる
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

    let obj = jyugyouPerTeacherList.find(searchTeacher(arr[i][0]));

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

        addjyugyou(obj, arr[i][j], arr[i + 1][j], nikka, youbi, koma);
      }
    }
    // 一部はクラス名を授業名に差し替える
    // これをしないと、sktの授業名は　数学　みたいな感じ
    let idx;
    if (obj != null && obj.jyugyou != null) {
      for (idx = 0; idx < obj.jyugyou.length; idx++) {
        if (obj.jyugyou[idx].name != 'LHR' && obj.jyugyou[idx].clsName != "") {
          obj.jyugyou[idx].name = obj.jyugyou[idx].clsName;
        }
      }
    }
        console.log(obj);

  }

  return lst;
}

let json = JSON.stringify(teacherList);
fs.writeFileSync('public/js/' + teacherFile, 'let jhkTeachers = ' + json);

json = JSON.stringify(itiranList);
fs.writeFileSync('public/js/' + jikanwariFile, 'let jhkJikanwari = ' + json);

json = JSON.stringify(jyugyouList);
fs.writeFileSync('public/js/' + jyugyouIDsFile, 'let jhkJyugyous = ' + json);

json = JSON.stringify(jyugyouPerTeacherList);
fs.writeFileSync(jikanwariPerTeacher, json);

