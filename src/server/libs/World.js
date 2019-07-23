const Ball = require('./Ball');
const Wall = require('./Wall');
const OverlapTester = require('./OverlapTester');
// 設定
const SharedSettings = require('../../client/js/SharedSettings');
const GameSettings = require('./GameSettings');

// ワールドクラス
// ・ゲーム内の各種要素を保持する
// ・ゲームに保持される
// ・ゲームワールドの更新処理を有する（ゲームから要請を受け、保持する各種要素を更新する）
// ・ゲーム内の各種要素の生成、破棄を有する
module.exports = class World {
  constructor(io) {
    this.io = io;
    this.setBall = new Set();
    this.setWall = new Set();
    this.setNotPlayingSocketID = new Set(); // プレイしていない通信のソケットIDリスト

    // 壁の生成
    for (let i = 0; i < GameSettings.WALL_COUNT; i++) {
      // ランダム座標値の作成
      const fX_left =
        Math.random() *
        (SharedSettings.FIELD_WIDTH - SharedSettings.WALL_WIDTH);
      const fY_bottom =
        Math.random() *
        (SharedSettings.FIELD_HEIGHT - SharedSettings.WALL_HEIGHT);
      for (let tileX = -1; tileX <= 1; tileX++) {
        for (let tileY = -1; tileY <= 1; tileY++) {
          // 壁生成
          const wall = new Wall(
            fX_left +
              SharedSettings.WALL_WIDTH * 0.5 +
              tileX * SharedSettings.FIELD_WIDTH,
            fY_bottom +
              SharedSettings.WALL_HEIGHT * 0.5 +
              tileY * SharedSettings.FIELD_HEIGHT
          );
          // 壁リストへの登録
          this.setWall.add(wall);
        }
      }
    }
  }

  // 更新処理
  update(fDeltaTime) {
    // オブジェクトの座標値の更新
    this.updateObjects(fDeltaTime);

    // 衝突判定
    this.checkCollisions();

    // 新たな行動（特に、ボットに関する生成や動作
    this.doNewActions(fDeltaTime);
  }

  // オブジェクトの座標値の更新
  updateObjects(fDeltaTime) {
    // ボールの可動域
    const rectBallField = {
      fLeft: 0 + SharedSettings.BALL_WIDTH * 0.5,
      fBottom: 0 + SharedSettings.BALL_HEIGHT * 0.5,
      fRight: SharedSettings.FIELD_WIDTH - SharedSettings.BALL_WIDTH * 0.5,
      fTop: SharedSettings.FIELD_HEIGHT - SharedSettings.BALL_HEIGHT * 0.5
    };
    // ボールごとの処理
    this.setBall.forEach(ball => {
      // スコア加算
      ball.iScore++;
      // ボールの座標値を更新する
      ball.update(fDeltaTime, rectBallField, this.setWall);
    });
  }

  // 衝突判定
  checkCollisions() {
    // 攻撃ボール(balLA) vs 防御ボール(balLB)
    this.setBall.forEach(ballA => {
      this.setBall.forEach(ballB => {
        // 自分ボールとの衝突処理はなし
        if (ballA.strSocketID !== ballB.strSocketID) {
          // 衝突
          if (OverlapTester.overlapRects(ballA.rectBound, ballB.rectBound)) {
            if (ballA.isAttack && !ballB.isAttack) {
              console.log('dead : socket.id = %s', ballB.strSocketID);
              this.destroyBall(ballB); // ボールの削除
            }
            // ballA.fSpeedY = -100;
            // ballA.iScore += 5000; // ポイント
          }
        }
      });
    });
  }

  // 新たな行動
  doNewActions(fDeltaTime) {}

  // ボールの生成
  createBall(strSocketID, strNickName) {
    // ゲーム開始。プレイしていない通信のソケットIDリストから削除
    this.setNotPlayingSocketID.delete(strSocketID);
    // ボールの可動域
    const rectBallField = {
      fLeft: 0 + SharedSettings.BALL_WIDTH * 0.5,
      fBottom: 0 + SharedSettings.BALL_HEIGHT * 0.5,
      fRight: SharedSettings.FIELD_WIDTH - SharedSettings.BALL_WIDTH * 0.5,
      fTop: SharedSettings.FIELD_HEIGHT - SharedSettings.BALL_HEIGHT * 0.5
    };
    // ボールの生成
    const ball = new Ball(
      strSocketID,
      strNickName,
      rectBallField,
      this.setWall
    );
    // ボールリストへの登録
    this.setBall.add(ball);
    return ball;
  }

  // ボールの破棄
  destroyBall(ball) {
    // ボールリストからの削除
    this.setBall.delete(ball);
    if (false) {
      // ボット
    } else {
      // ゲーム開始前に戻るので、プレイしていない通信のソケットIDリストに追加
      this.setNotPlayingSocketID.add(ball.strSocketID);
      // 削除対象ボールのクライアントにイベント'dead'を送信
      this.io.to(ball.strSocketID).emit('dead');
    }
  }
};
