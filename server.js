'use strict';

const WebSocketServer = require('ws').Server;
const port = process.env.PORT || 3000;
 
// setting ws
const wss = new WebSocketServer({port:port});
console.log("websocket server created");

// 接続リスト
let connections = [];
 
// WebSocketServer起動
wss.on('connection', (ws) => {
    console.log('websocket connection open');
    // ws受信時、接続リストを追加
    connections.push(ws);
    // 'message' という Key で受信したら、Dataを全クライアントに送信
    ws.on('message', (data) => {
        console.log('received: %s', message); 
        wss.clients.forEach((client) => {
        client.send("ユーザー" + (connections.indexOf(ws) + 1) +"からのメッセージです。" + data);
        });
    });
    
    // クローズ
    ws.on('close', () => {
        console.log('websocket connection close');
    });
});