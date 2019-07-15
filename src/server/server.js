'use strict';

const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const Game = require('./libs/Game.js');

// サーバー作成
const app = express();
const server = http.Server(app);
const io = socketIO(server);

// ポート番号（環境変数PORTがあればそれを、無ければ1337を使う）
const PORT_NO = process.env.PORT || 1337;

// ゲームの作成と開始
const game = new Game();
game.start(io);

// 公開フォルダ（ユーザから見える場所）の指定
app.use(express.static(__dirname + '/../client'));

// サーバーの起動
server.listen(PORT_NO, () => {
  console.log('Starting server on port %d', PORT_NO);
});
