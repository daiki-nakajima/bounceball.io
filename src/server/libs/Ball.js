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
    // this.fSpeedX = GameSettings.BALL_SPEED; // 速度[m/s]。1frameあたり5進む => 1/30[s] で5進む => 1[s]で150進む。
    this.fSpeedX = 0;
    this.fSpeedY = 0;
    this.resiliency = GameSettings.BALL_RESILIENCY; // 反発力初期値
    this.isAlive = true; // 生存
    this.iScore = 0; // スコア
    this.isAttack = false;

    // 初期位置を算出（障害物と重ならなくなるまでループ）
    do {
      // ランダムに床を決定
      const numOfTargetWall = Math.floor(Math.random() * setWall.size);
      let index = 0;
      // 全ての床の中から決定した床を選択
      for (let wall of setWall) {
        if (index === numOfTargetWall) {
          // スタート時落下を防ぐため、決定された床のすぐ上を初期位置とする
          this.setPos(wall.fX, wall.fY - 100);
          break;
        }
        index++;
      }
      // 障害物にぶつかっていないか判定
    } while (this.overlapWalls(setWall));
  }

  // サーバーへJSONで送るためのメソッド
  toJSON() {
    return Object.assign(super.toJson(), {
      strSocketID: this.strSocketID,
      strNickName: this.strNickName,
      isAlive: this.isAlive,
      iScore: this.iScore
    });
  }

  // 更新
  update(fDeltaTime, rectField, setWall, setBall) {
    const fX_old = this.fX; // 移動前座標値のバックアップ
    const fY_old = this.fY; // 移動前座標値のバックアップ

    // X座標の計算（方向キー）
    let fX_new = this.fX;
    // ユーザ入力に従って、進行方向（速度）決定
    if (this.objMovement['left']) {
      if (this.fSpeedX > 0) {
        this.fSpeedX -= 20; // ブレーキ
      } else if (this.fSpeedX >= -1000) {
        this.fSpeedX -= 10; // 左アクセル
      }
    }
    if (this.objMovement['right']) {
      if (this.fSpeedX < 0) {
        this.fSpeedX += 20; // ブレーキ
      } else if (this.fSpeedX <= 1000) {
        this.fSpeedX += 10; // 右アクセル
      }
    }
    fX_new += this.fSpeedX * fDeltaTime; // 速度から位置

    // Y座標の計算（自由落下）
    let fY_new = this.fY;
    let force = GameSettings.BALL_MASS * GameSettings.GRAVITY_ACCELERATION; // 運動方程式
    let acceleration = force / GameSettings.BALL_MASS; // 力から加速度
    this.fSpeedY += acceleration * fDeltaTime; // 加速度から速度
    // 下入力で急降下（攻撃）
    if (this.objMovement['back']) {
      this.fSpeedY = -100;

      setTimeout(() => {
        this.isAttack = true;
        this.fSpeedY = 2500;
      }, 500);
    }
    fY_new += this.fSpeedY * fDeltaTime; // 速度から位置

    // 座標更新
    this.setPos(fX_new, fY_new);

    // 衝突判定フラグ
    let bCollision = false;
    // 衝突したボールの反発力を受け取る（衝突なしなら0。）
    let res = 0;
    res = this.overlapBalls(setBall);
    if (res > 0) {
      bCollision = true;
      this.fSpeedX *= -1;
      this.fSpeedY *= -1;
    }
    // 床を踏んだか判定。
    if (this.landOnWalls(setWall) && this.fSpeedY > 0) {
      // 攻撃終了
      this.isAttack = false;
      // 床を踏んだのでバウンド。
      this.fSpeedY = this.resiliency * fDeltaTime;
      // バウンド力UP
      this.resiliency *= GameSettings.BALL_UPOFRATE;
    } else if (
      // 画面端に到達したか判定。
      !OverlapTester.pointInRect(rectField, { fX: this.fX, fY: this.fY })
    ) {
      //  ぶつかった方向判定
      const dir = OverlapTester.touchDirInRect(rectField, {
        fX: this.fX,
        fY: this.fY
      });
      // 画面端に到達したら反対の画面端へワープ。
      // TODO: setPos を書きすぎているのでまとめる。
      switch (dir) {
        case 'right':
          this.setPos(fX_new - SharedSettings.FIELD_WIDTH, fY_new);
          break;
        case 'left':
          this.setPos(fX_new + SharedSettings.FIELD_WIDTH, fY_new);
          break;
        case 'bottom':
          this.setPos(fX_new, fY_new + SharedSettings.FIELD_HEIGHT);
          break;
        case 'top':
          this.setPos(fX_new, fY_new - SharedSettings.FIELD_HEIGHT);
          break;

        default:
          break;
      }
    }
    if (bCollision) {
      // 衝突する場合は更新を無効とし、元の座標へ戻す。
      this.setPos(fX_old, fY_old);
      // bDrived = false; // 前後方向の動きはなし
    }

    // return bDrived; // 前後方向の動きがあったかを返す（ボットタンクで使用する）
    return true;
  }

  // 下へ落ちた
  dead() {
    this.isAlive = false;
    return this.iLife;
  }
};
