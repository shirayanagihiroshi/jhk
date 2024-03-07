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
- サーバ側 : このリポジトリをcloneし、`npm install`そして、`node app.js`
する。ただし、`lib/keys.js`にあるhttpsの鍵、mongodbのユーザは相応に変更が必要。

### 設計
別ファイル参照。
