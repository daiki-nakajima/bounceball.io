const GameObject = require('./GameObject');
const SharedSettings = require('../../client/js/SharedSettings');
const GameSettings = require('./GameSettings');
const OverlapTester = require('./OverlapTester');

// ボールクラス
module.exports = class Ball extends GameObject {
  constructor(rectField, setWall) {
    super(SharedSettings.BALL_WIDTH, SharedSettings.BALL_HEIGHT, 0.0, 0.0, 0.0);

    this.objMovement = {}; // 動作
    this.fSpeed = GameSettings.BALL_SPEED; // 速度[m/s]。1frameあたり5進む => 1/30[s] で5進む => 1[s]で150進む。

    // 初期位置
    this.fX =
      Math.random() * (SharedSettings.FIELD_WIDTH - SharedSettings.BALL_WIDTH);
    this.fY =
      Math.random() *
      (SharedSettings.FIELD_HEIGHT - SharedSettings.BALL_HEIGHT);

    this.fRotationSpeed = GameSettings.TANK_ROTATION_SPEED; // 回転速度[rad/s]。1frameあたり0.1進む => 1/30[s] で0.1進む => 1[s]で3[rad]進む。

    // 障害物にぶつからない初期位置の算出
    do {
      this.setPos(
        rectField.fLeft + Math.random() * (rectField.fRight - rectField.fLeft),
        rectField.fBottom + Math.random() * (rectField.fTop - rectField.fBottom)
      );
    } while (this.overlapWalls(setWall));
  }

  // 更新
  update(fDeltaTime, rectField, setWall) {
    const fX_old = this.fX; // 移動前座標値のバックアップ
    const fY_old = this.fY; // 移動前座標値のバックアップ
    let bDrived = false; // 前後方向の動きがあったか

    // 移動距離を計算
    const fDistance = this.fSpeed * fDeltaTime;

    // ユーザ入力に従って、タンクの状態を更新
    if (this.objMovement['left']) {
      this.setPos(this.fX - fDistance, this.fY); // 左
      bDrived = true;
    }
    if (this.objMovement['right']) {
      this.setPos(this.fX + fDistance, this.fY); // 右
      bDrived = true;
    }

    // 動きがある場合は、不可侵領域との衝突のチェック
    if (bDrived) {
      let bCollision = false;
      if (!OverlapTester.pointInRect(rectField, { fX: this.fX, fY: this.fY })) {
        // フィールドの外に出た。
        bCollision = true;
      } else if (this.overlapWalls(setWall)) {
        // 壁に当たった。
        bCollision = true;
      }
      if (bCollision) {
        // 衝突する場合は、移動できない。
        this.setPos(fX_old, fY_old);
        bDrived = false; // 前後方向の動きはなし
      }
    }

    return bDrived; // 前後方向の動きがあったかを返す（ボットタンクで使用する）
  }
};
