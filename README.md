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
- node.js : v--
- mongodb : v--

## 実行

- データの準備(時間割のExcel表)：
授業名から該当クラスを引き当てるロジックがあるので、「道徳」や「LHR」は許さない。
該当クラスのHRの名前に変更しておく。例：'道徳'->'1-A'  とか、'LHR'->'3-1'　等
後の手順のnpm installをしたあと、以下のコマンドを実行する
readFromXlsx.js 時間割のExcel表のファイル名

- データの準備：。
public/js/jhkClasses.json.js (クラスが増減したら、それを人間の手で修正する必要がある)
public/js/jhkjyugyous.json.js (授業名から該当クラスを探すための一覧。
ファイル自体はreadFromXlsx.jsに時間割のExcel表を読ませると自動で生成されるが、
該当クラスは人間が手で入力する必要がある。例えばjyugyouが'１－ABC'ならclsは['1-A','1-B','1-C']とする。)
public/js/jhkjikanwari.json.js (先生の時間割のデータ。readFromXlsx.jsに時間割のExcel表を読ませると自動で生成される)
public/js/jhkteacher.json.js (先生の一覧のデータ。readFromXlsx.jsに時間割のExcel表を読ませると自動で生成される)

- サーバ側 : このリポジトリをcloneし、`npm install`そして、`node app.js`
する。ただし、`lib/keys.js`にあるhttpsの鍵、mongodbのユーザは相応に変更が必要。

### 設計
別ファイル参照。
