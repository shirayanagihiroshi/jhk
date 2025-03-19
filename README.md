# 授業変更記録確認webアプリ
## 概要

授業変更を記録するwebアプリである。


「シングルページWebアプリケーション
――Node.js、MongoDBを活用したJavaScript SPA」
Michael S. Mikowski、Josh C. Powell　著、佐藤 直生　監訳、木下 哲也　訳

を参考に作ってあり、サーバ側では認証、データの保持をする。その他の処理は主にクライアントのブラウザで行う。

が、カスタマイズされており
授業変更の担当者が授業変更を記録するのにのみwebアプリを用い、
一般のユーザが記録されている授業変更を見るのにはwebアプリでなく
静的なhtml(&javascript)を使う。

## 環境
サーバ側はnode.jsとmongodbが必要。クライアントはブラウザで該当URLにアクセスすれば良い。mongodがあらかじめ動いている必要があり、DBにある程度の情報が登録されている必要がある。

### 依存関係
- node.js : v18.20.0
- Mongodb : 6.0.14

## データの準備1
- <span style="color:blue;">時間割のExcel表の整理</span> : 授業名から該当クラスを引き当てるロジックがあるので、「道徳」や「LHR」は許さない。
該当クラスのHRの名前に変更しておく。例："道徳"->"1-A"  とか、"LHR"->"3-1"　等

- <span style="color:blue;">読み取るデータの設定</span> : readFromXlsx.js の targetFileName, sheetNameA, sheetNameB を設定する。

- <span style="color:blue;">データの変換(xlsx -> json)</span> : コマンドプロンプトで node readFromXlsx.js (事前にnpm installは必要)する。

- <span style="color:blue;">生成されたjson を加工</span> : public/js/jhkjyugyous.json.js (授業名から該当クラスを探すための一覧）
例えばjyugyouが"１－ABC"ならclsは["1-A","1-B","1-C"]とする。

- <span style="color:blue;">生成されたjson を加工</span> : public/js/jhkteacher.json.js (先生の一覧のデータ）
先生に対応する教科を設定する。"国語"or"社会"or"数学"or"理科"or"英語"or"体育"or"その他" である。

- <span style="color:blue;">json を加工</span> : public/js/jhkClasses.json.js (クラスの一覧のデータ）
クラスが増減したら変更する。これはgitにありxlsxで生成されない。

- <span style="color:blue;">データをサーバにコピー</span> : 上記 jhk***.json.js と、jhkjikanwari.json.js(各先生の時間割のデータ)をサーバへコピーする。

## データの準備2
skt(別システム)のuser, calendar collection を参照して、それぞれ、ログインと時間割の引き当て処理のときに使っている。それらのデータがある前提で動く。

## データの準備3
- 元々skt(別システム)の時間割は各ユーザが一つ一つ設定していく設計であった。
- それを全員分一括で設定できるようにする対応において、jhkjikanwari.json.jsを生成するロジックに似たものが必要になった。
- jhkjikanwari.json.jsを生成するロジックと非常によく似ているのでここに追加する。
- skt時間割一括設定対応で必要なものはjhkjikanwari.json.jsを生成するのと似ているが、すこし違いがあり、準備に注意が必要。
- 上記データの準備1では"LHR"->"3-1"のような変更をしてから処理をしたが、skt時間割一括設定対応では一人の教員の担当する授業名がなるべく詳しく分かれていて欲しい。
- つまり"LHR"->"3-1"のような変換処理をする前の状態でデータを食わせる必要がある。
- ただし、sktのIDで紐づけてDBに登録するので、A週のシートの名前のすぐ右隣りのセルにsktのユーザIDを設定する必要がある。(元々週の合計授業数が記載されたセルであったがそれは使っていない。)
- その際、ユーザIDが無いようであれば、セルの値は空白にする。

## 実行
- node app.js する。(lib/keys.js にあるhttpsの鍵、mongodbのユーザは相応に変更が必要)

### 設計
別ファイル参照。
