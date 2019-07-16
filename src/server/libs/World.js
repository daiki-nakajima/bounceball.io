const Ball = require('./Ball');
const Wall = require('./Wall');
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

    // 壁の生成
    for (let i = 0; i < GameSettings.WALL_COUNT; i++) {
      // ランダム座標値の作成
      const fX_left =
        Math.random() *
        (SharedSettings.FIELD_WIDTH - SharedSettings.WALL_WIDTH);
      const fY_bottom =
        Math.random() *
        (SharedSettings.FIELD_HEIGHT - SharedSettings.WALL_HEIGHT);
      // 壁生成
      const wall = new Wall(
        fX_left + SharedSettings.WALL_WIDTH * 0.5,
        fY_bottom + SharedSettings.WALL_HEIGHT * 0.5
      );
      // 壁リストへの登録
      this.setWall.add(wall);
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
      // ボールが落ちていたら削除する
      if (!ball.isAlive) {
        console.log('dead : socket.id = %s', ball.strSocketID);
        this.destroyBall(ball);
      }
      // スコア加算
      ball.iScore++;
      // ボールの座標値を更新する
      ball.update(fDeltaTime, rectBallField, this.setWall);
    });
  }

  // 衝突判定
  checkCollisions() {}

  // 新たな行動
  doNewActions(fDeltaTime) {}

  // ボールの生成
  createBall(strSocketID, strNickName) {
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
    // 削除対象ボールのクライアントにイベント'dead'を送信
    this.io.to(tank.strSocketID).emit('dead');
  }
};
