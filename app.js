'use strict';

//------モジュールスコープ変数s--------
  var
    keys     = require('./lib/keys'),
    fs       = require('fs'),
    writefilename = './public/js/jhkSimpleData.json.js',
    writejson     = null,
    express  = require('express'),
    app      = express(),
    router   = express.Router(),
    http     = require('https').createServer({
      key  : fs.readFileSync(keys.privkeyFilePath),
      cert : fs.readFileSync(keys.certFilePath)
    }, app ),
    io       = require('socket.io')( http ),
    crypt    = require('./lib/crypt'),
    db       = require('./lib/database'),
    utils    = require('./lib/util_s'),
    port     = 4001;

//------モジュールスコープ変数e--------

//------ユーティリティメソッドs--------
io.on("connection", function (socket) {
  // 単に取得するだけの処理はまとめておく
  // ログインなど特殊なのは別処理
  let commonDBFind = function (msg, collectionName, resultMessageName) {

    // アクセスキーの確認のために'yoyaku_user'にアクセスしている
    db.findManyDocuments('yoyaku_user', {userId:msg.AKey.userId}, {projection:{_id:0}}, function (result) {
      // ログイン中のユーザにのみ回答
      if (result.length != 0 && msg.AKey.token == result[0].token ) {
        db.findManyDocuments(collectionName, msg.SKey, {projection:{_id:0}}, function (res) {
          let obj = {res         : res,
                     clientState : msg.clientState};
          //console.log('findDocuments done');
          io.to(socket.id).emit(resultMessageName, obj); // 送信者のみに送信
        });
      } else {
        // ここにアナザーログインを実装すること
        io.to(socket.id).emit('anotherLogin', {}); // 送信者のみに送信
      }
    });
  };

  socket.on('tryLogin', function (msg) {
    db.findManyDocuments('user', {userId:msg.userId}, {projection:{_id:0}}, function (result) {
      if (result.length != 0) {
        crypt.compare(msg.passWord, result[0].passWord, function (res) {
          //パスワードが一致
          if (res) {
            let token = String(Math.random()).slice(2,12);

            //お手軽なランダム文字列をトークンとして設定し、ログイン状態とする
            db.updateDocument('user', {userId:msg.userId}, {$set:{token:token}}, function (res) {
              io.to(socket.id).emit('loginResult', {result   : true,
                                                    userId   : msg.userId,
                                                    token    : token,
                                                    userKind : result[0].userKind,
                                                    name     : result[0].name}); // 送信者のみに送信
            });

          //パスワードが違う
          } else {
            io.to(socket.id).emit('loginResult', {result: false}); // 送信者のみに送信
          }
        });
      // 該当ユーザがいない
      } else {
        io.to(socket.id).emit('loginResult', {result: false}); // 送信者のみに送信
      }
    });
  });

  socket.on('tryLogout', function (msg) {
    db.findManyDocuments('user', {userId:msg.userId}, {projection:{_id:0}}, function (result) {
      if (result.length != 0) {
        //トークンを空文字列とし、ログアウト状態とする
        db.updateDocument('user', {userId:msg.userId}, {$set:{token:""}}, function (res) {
          io.to(socket.id).emit('logoutResult', {result: true}); // 送信者のみに送信
        });
      // 該当ユーザがいない
      } else {
        io.to(socket.id).emit('logoutResult', {result: false}); // 送信者のみに送信
      }
    });
  });

  socket.on('readyCalendar', function (msg) {
    console.log("readyCalendar");
    db.findManyDocuments('user', {userId:msg.AKey.userId}, {projection:{_id:0}}, function (result) {
      // 正当なユーザにのみ返事をするためのチェック
      if (result.length != 0 && msg.AKey.token == result[0].token ) {
        db.findManyDocuments('calendar', {}, {projection:{_id:0}}, function (res) {
            let obj = {calendar:res, clientState:msg.clientState};
            io.to(socket.id).emit('readyCalendarResult', obj); // 送信者のみに送信
        });
      } else {
        io.to(socket.id).emit('anotherLogin', {}); // 送信者のみに送信
      }
    });
  });

  socket.on('readyHenkou', function (msg) {
    db.findManyDocuments('user', {userId:msg.AKey.userId}, {projection:{_id:0}}, function (result) {
      // ログイン中のユーザにのみ回答
      if (result.length != 0 && msg.AKey.token == result[0].token ) {
        db.findManyDocuments('jhkdatas', {}, {projection:{_id:0}}, function (res) {
            let obj = {datas:res, clientState:msg.clientState};
            io.to(socket.id).emit('readyHenkouSuccess', obj); // 送信者のみに送信
            // クライアントには何も言わず、しれっとファイルへ書き込む
            // 見るだけの人はこのファイルで授業変更を知る
            if (msg.clientState == 'afterAdd' || msg.clientState == 'afterDel') {
              writejson(res);
            }
        });
      } else {
        io.to(socket.id).emit('getHenkouFailure', {}); // 送信者のみに送信
      }
    });
  });

  socket.on('addHenkou', function (msg) {
    db.findManyDocuments('user', {userId:msg.AKey.userId}, {projection:{_id:0}}, function (result) {
      // ログイン中のユーザにのみ回答
      if (result.length != 0 && msg.AKey.token == result[0].token ) {
        db.insertManyDocuments('jhkdatas', msg.datas, function (result) {
          io.to(socket.id).emit('addHenkouSuccess', result); // 送信者のみに送信
        });
      } else {
        io.to(socket.id).emit('addHenkouFailure', {}); // 送信者のみに送信
      }
    });
  });

  socket.on('addInfo', function (msg) {
    db.findManyDocuments('user', {userId:msg.AKey.userId}, {projection:{_id:0}}, function (result) {
      // ログイン中のユーザにのみ回答
      if (result.length != 0 && msg.AKey.token == result[0].token ) {
        db.updateDocument('jhkdatas', {year  : msg.datas.year,
                                       month : msg.datas.month,
                                       day   : msg.datas.day,
                                       koma  : msg.datas.koma,
                                       cls   : msg.datas.cls},
                          {$set:{inaiInfo:msg.datas.inaiInfo}}, function (res) {
          io.to(socket.id).emit('addInfoSuccess', {result: true}); // 送信者のみに送信
        });
      } else {
        io.to(socket.id).emit('addInfoFailure', {}); // 送信者のみに送信
      }
    });
  });

  socket.on('deleteHenkou', function (msg) {
    db.findManyDocuments('user', {userId:msg.AKey.userId}, {projection:{_id:0}}, function (result) {
      // ログイン中のユーザにのみ回答
      if (result.length != 0 && msg.AKey.token == result[0].token ) {
        db.deleteManyDocuments('jhkdatas',
                               {year    : msg.year,
                                month   : msg.month,
                                day     : msg.day,
                                koma    : msg.koma,
                                teacher : msg.teacher},
                               function (res) {
          let obj = { res : res, clientState : msg.clientState};
          io.to(socket.id).emit('deleteHenkouSuccess', obj); // 送信者のみに送信
        });
      } else {
        io.to(socket.id).emit('deleteHenkouFailure', {}); // 送信者のみに送信
      }
    });
  });

  // 切断
  socket.on("disconnect", () => {
    console.log("user disconnected");
    // tokenを失効させる。
    // upsert:trueとした関係で、ログインせずに切断したときにtokenだけを持つ
    // ドキュメントが生成された模様。該当のものが見つかったときのみ処理するようにする。

    // ログイン直後にログアウトしたか他の端末でログインしたというエラーメッセージが表示される
    // 端末がある模様。トークンを削除しないことにする
    // ログアウトしたかどうかの判定はできなくなる
    /*
    db.findManyDocuments('yoyaku_user', {token:socket.id}, function (result) {
      if ( result.length != 0 ) {
        db.updateDocument('yoyaku_user', {token:socket.id}, {$set:{token:""}}, function (res) {
          // do nothing
        });
      }
    });
    */
  });
});

writejson = function (henkoudata) {
  let writedata,
    f = function (lastMonth, month, nextMonth) {
      return function (target) {
        if ( target.month == lastMonth || target.month == month || target.month == nextMonth) {
          return true;
        } else {
          return false;
        }
      }
    },
    today = new Date(),
    month = today.getMonth() + 1, //月だけ0始まり
    lastMonth, nextMonth, datestr;

  if (month == 1) {
    lastMonth = 12;
  } else {
    lastMonth = month - 1;
  }

  if (month == 12) {
    nextMonth == 1;
  } else {
    nextMonth == month + 1;
  }

  datestr = String(month) + '/' + String(today.getDate()) + ' ' + String(today.getHours()) + ':' + String(today.getMinutes()) + '更新'

  // 今月、先月、来月の分に絞り込み
  writedata = henkoudata.filter(f(lastMonth, month, nextMonth));

  fs.writeFile(writefilename, 'let jhkhenkouData = ' + JSON.stringify(henkoudata) + ', jhkUpdate = "' + datestr + '";', function (err) {
    if (err) {
      console.log('jhkSimpleData.json.jsの書き込みに失敗しました');
      throw err;
    } else {
      console.log('jhkSimpleData.json.jsの書き込みに成功しました');
    }
  });
}
//------ユーティリティメソッドe--------

//------サーバ構成s--------
  app.use( express.json() ); //bodyParseだったやつ
  app.use( function ( request, response, next ) {
    // js,css更新用
    if (request.url.indexOf( '/js/' ) >= 0) {
      utils.setWatch( request.url, 'script' , function ( url_path_inner ) {
        io.emit( 'script', url_path_inner ); //送信元を含む全員に送信
      });
    }
    else if (request.url.indexOf( '/css/' ) >= 0) {
      utils.setWatch( request.url, 'stylesheet' , function ( url_path_inner ) {
        io.emit( 'stylesheet', url_path_inner ); //送信元を含む全員に送信
      });
    }
    next();
  });
  app.use( express.static( __dirname + '/public' ) ); // ややはまった。これがsetwatchの設定の前にあるとだめ
  app.get('/', function ( request, response ) {
    console.log('request.url');
    console.log(request.url);

    response.sendFile( __dirname +'/public/jhkSimple.html' );
  });

  app.get('/kyoumu', function ( request, response ) {
    console.log('request.url');
    console.log(request.url);

    response.sendFile( __dirname +'/public/jhk.html' );
  });
/*
  app.get('/:mypassword', function ( request, response ) {
    let urlStr;

    // 半角英数かどうかチェックし
    // さらにパスワードが合致するかどうかチェック
    if( request.params.mypassword.match(/^[A-Za-z0-9]*$/) &&
        request.params.mypassword == "hamanittai") {

      urlStr = '/public/jhkSimple.html';
    } else {
      urlStr = '/public/jhkSimpleLock.html';
    }
    response.sendFile( __dirname + urlStr );
  });
*/
//------サーバ構成e--------
//------サーバ起動s--------
  http.listen( port, function () {
    console.log(
      'express server listening on port %d in %s mode',
      port, app.settings.env)
  });

//------サーバ起動e--------
