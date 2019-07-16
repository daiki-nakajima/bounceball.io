const GameObject = require('./GameObject');
const SharedSettings = require('../../client/js/SharedSettings');
const GameSettings = require('./GameSettings');
const OverlapTester = require('./OverlapTester');

// ボールクラス
module.exports = class Ball extends GameObject {
  constructor(strSocketID, strNickName, rectField, setWall) {
    super(SharedSettings.BALL_WIDTH, SharedSettings.BALL_HEIGHT, 0.0, 0.0, 0.0);

    this.strSocketID = strSocketID;
    this.strNickName = strNickName;
    this.objMovement = {}; // 動作
    this.fSpeedX = GameSettings.BALL_SPEED; // 速度[m/s]。1frameあたり5進む => 1/30[s] で5進む => 1[s]で150進む。
    this.fSpeedY = 0;
    this.resiliency = GameSettings.BALL_RESILIENCY; // 反発力初期値
    this.isAlive = true; // 生存
    this.iScore = 0; // スコア

    // 障害物にぶつからない初期位置の算出
    do {
      this.setPos(
        rectField.fLeft + Math.random() * (rectField.fRight - rectField.fLeft),
        rectField.fBottom + Math.random() * (rectField.fTop - rectField.fBottom)
      );
    } while (this.overlapWalls(setWall));
  }

  toJSON() {
    return Object.assign(super.toJson(), {
      strSocketID: this.strSocketID,
      strNickName: this.strNickName,
      isAlive: this.isAlive,
      iScore: this.iScore
    });
  }

  // 更新
  update(fDeltaTime, rectField, setWall) {
    const fX_old = this.fX; // 移動前座標値のバックアップ
    const fY_old = this.fY; // 移動前座標値のバックアップ
    let bDrived = true; // 前後方向の動きがあったか

    // X座標の計算（方向キー）
    let fX_new = this.fX;
    const fDistance = this.fSpeedX * fDeltaTime;
    // ユーザ入力に従って、進行方向を決定
    if (this.objMovement['left']) {
      fX_new -= fDistance; // 左
    }
    if (this.objMovement['right']) {
      fX_new += fDistance; // 右
    }

    // Y座標の計算（自由落下）
    let fY_new = this.fY;
    let force = GameSettings.BALL_MASS * GameSettings.GRAVITY_ACCELERATION; // 運動方程式
    let acceleration = force / GameSettings.BALL_MASS; // 力から加速度
    this.fSpeedY += acceleration * fDeltaTime; // 加速度から速度
    fY_new += this.fSpeedY * fDeltaTime; // 速度から位置

    // 座標更新
    this.setPos(fX_new, fY_new);

    // 動きがある場合は、不可侵領域との衝突判定
    if (bDrived) {
      let bCollision = false;
      // 床を踏んだか判定。
      if (this.landOnWalls(setWall) && this.fSpeedY > 0) {
        console.log('check is ok');
        // 床を踏んだのでバウンド。
        this.fSpeedY = this.resiliency * fDeltaTime;
        // バウンド力UP
        this.resiliency *= 1.01;
      } else if (
        !OverlapTester.pointInRect(rectField, { fX: this.fX, fY: this.fY })
      ) {
        // フィールドの外に出た。
        bCollision = true;
      }
      if (bCollision) {
        // 衝突する場合は更新を無効とし、元の座標へ戻す。
        this.setPos(fX_old, fY_old);
        bDrived = false; // 前後方向の動きはなし
      }
    }

    return bDrived; // 前後方向の動きがあったかを返す（ボットタンクで使用する）
  }

  // 下へ落ちた
  dead() {
    this.isAlive = false;
    return this.iLife;
  }
};
