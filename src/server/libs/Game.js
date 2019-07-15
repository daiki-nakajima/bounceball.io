const World = require('./World');
const GameSettings = require('./GameSettings');

// ゲームクラス
// ・ワールドを保持する
// ・通信処理を有する
// ・周期的処理を有する
module.exports = class Game {
  // ゲームスタート
  start(io) {
    const world = new World(io); // setInterval()内での参照があるので、スコープを抜けても、生存し続ける（ガーベッジコレクションされない）。
    let iTimeLast = Date.now(); // setInterval()内での参照があるので、スコープを抜けても、生存し続ける（ガーベッジコレクションされない）。

    // 接続時の処理
    io.on('connection', socket => {
      console.log('connection : socket.id = %s', socket.id);
      // コネクションごとのボールオブジェクト。イベントをまたいで使用される。
      let ball = null;

      // ゲーム開始時の処理の指定
      socket.on('enter-the-game', () => {
        // 自タンクの作成
        console.log('enter-the-game : socket.id = %s', socket.id);
        ball = world.createBall();
      });

      // 移動コマンドの処理の指定
      socket.on('change-my-movement', objMovement => {
        if (!ball) {
          return;
        }
        // 自タンクの移動
        ball.objMovement = objMovement;
      });

      // 切断時の処理の指定
      socket.on('disconnect', () => {
        console.log('disconnect : socket.id = %s', socket.id);
        if (!ball) {
          return;
        }
        world.destroyBall(ball);
        // 自タンクの解放
        ball = null;
      });
    });

    // 周期的処理（1秒間にFRAMERATE回の場合、delayは、1000[ms]/FRAMERATE[回]）
    setInterval(() => {
      // 経過時間の算出
      const iTimeCurrent = Date.now(); // ミリ秒単位で取得
      const fDeltaTime = (iTimeCurrent - iTimeLast) * 0.001; // 秒に変換
      iTimeLast = iTimeCurrent;

      // 処理時間計測用
      const hrtime = process.hrtime(); // ナノ秒単位で取得

      // ゲームワールドの更新
      world.update(fDeltaTime);

      const hrtimeDiff = process.hrtime(hrtime);
      const iNanosecDiff = hrtimeDiff[0] * 1e9 + hrtimeDiff[1];

      // 最新状況をクライアントに送信
      io.emit(
        'update',
        Array.from(world.setBall),
        Array.from(world.setWall),
        iNanosecDiff
      ); // 送信
    }, 1000 / GameSettings.FRAMERATE); // 単位は[ms]。1000[ms] / FRAMERATE[回]
  }
};
