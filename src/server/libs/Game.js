const World = require('./World');
const OverlapTester = require('./OverlapTester');
// 設定
const SharedSettings = require('../../client/js/SharedSettings');
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

      // まだゲーム開始前。プレイしていない通信のソケットIDリストに追加
      world.setNotPlayingSocketID.add(socket.id);

      // ゲーム開始時の処理の指定
      socket.on('enter-the-game', objConfig => {
        // 自ボールの作成
        console.log('enter-the-game : socket.id = %s', socket.id);
        ball = world.createBall(socket.id, objConfig.strNickName);
      });

      // 移動コマンドの処理の指定
      socket.on('change-my-movement', objMovement => {
        if (!ball || !ball.isAlive) {
          return;
        }
        // 自ボールの移動
        ball.objMovement = objMovement;
      });

      // 切断時の処理の指定
      socket.on('disconnect', () => {
        console.log('disconnect : socket.id = %s', socket.id);
        if (!ball) {
          // プレイしていない通信のソケットIDリストから削除
          world.setNotPlayingSocketID.delete(socket.id);
          return;
        }
        world.destroyBall(ball);
        // 自ボールの解放
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
      // ボールごとの処理
      world.setBall.forEach(ball => {
        if ('' !== ball.strSocketID) {
          // 矩形表示領域
          const rectVisibleArea = {
            fLeft: ball.fX - SharedSettings.CANVAS_WIDTH * 0.5,
            fBottom: ball.fY - SharedSettings.CANVAS_HEIGHT * 0.5,
            fRight: ball.fX + SharedSettings.CANVAS_WIDTH * 0.5,
            fTop: ball.fY + SharedSettings.CANVAS_HEIGHT * 0.5
          };
          // 各ボールへ個別送信
          io.to(ball.strSocketID).emit(
            'update',
            // 矩形表示領域に重なっていないボール、壁は返さない（＝表示されない）
            Array.from(world.setBall).filter(ball => {
              return OverlapTester.overlapRects(
                rectVisibleArea,
                ball.rectBound
              );
            }),
            Array.from(world.setWall).filter(wall => {
              return OverlapTester.overlapRects(
                rectVisibleArea,
                wall.rectBound
              );
            }),
            iNanosecDiff
          );
        }
      });

      // プレーしていないソケットごとの処理
      const rectVisibleArea = {
        fLeft:
          SharedSettings.FIELD_WIDTH * 0.5 - SharedSettings.CANVAS_WIDTH * 0.5,
        fBottom:
          SharedSettings.FIELD_HEIGHT * 0.5 -
          SharedSettings.CANVAS_HEIGHT * 0.5,
        fRight:
          SharedSettings.FIELD_WIDTH * 0.5 + SharedSettings.CANVAS_WIDTH * 0.5,
        fTop:
          SharedSettings.FIELD_HEIGHT * 0.5 + SharedSettings.CANVAS_HEIGHT * 0.5
      };
      world.setNotPlayingSocketID.forEach(strSocketID => {
        io.to(strSocketID).emit(
          'update',
          Array.from(world.setBall).filter(tank => {
            return OverlapTester.overlapRects(rectVisibleArea, tank.rectBound);
          }),
          Array.from(world.setWall).filter(wall => {
            return OverlapTester.overlapRects(rectVisibleArea, wall.rectBound);
          }),
          iNanosecDiff
        ); // 個別送信
      });
    }, 1000 / GameSettings.FRAMERATE); // 単位は[ms]。1000[ms] / FRAMERATE[回]
  }
};
