const OverlapTester = require('./OverlapTester');
// ゲームオブジェクトクラス
module.exports = class GameObject {
  constructor(fWidth, fHeight, fX, fY, fAngle) {
    this.fWidth = fWidth; // 幅
    this.fHeight = fHeight; // 高さ
    this.fX = fX; // 位置(X)
    this.fY = fY; // 位置(Y)
    this.fAngle = fAngle; // 向き（+x軸の方向が0。+y軸の方向がPI/2）

    this.rectBound = {};
    this.setPos(fX, fY);
  }

  toJson() {
    return {
      fX: this.fX,
      fY: this.fY,
      fAngle: this.fAngle
    };
  }

  setPos(fX, fY) {
    this.fX = fX;
    this.fY = fY;
    this.rectBound = {
      fLeft: fX - this.fWidth * 0.5,
      fBottom: fY - this.fHeight * 0.5,
      fRight: fX + this.fWidth * 0.5,
      fTop: fY + this.fHeight * 0.5
    };
  }

  // オブジェクトとの干渉チェック
  overlapWalls(setWall) {
    return Array.from(setWall).some(wall => {
      if (OverlapTester.overlapRects(this.rectBound, wall.rectBound)) {
        return true;
      }
    });
  }

  // 干渉したボールの反発力を返す
  overlapBalls(setBall) {
    return Array.from(setBall).some(ball => {
      if (OverlapTester.overlapRects(this.rectBound, ball.rectBound)) {
        if (this.strSocketID !== ball.strSocketID) {
          return true;
        }
      }
    });
  }

  // 床を踏んでいるか判定
  landOnWalls(setWall) {
    return Array.from(setWall).some(wall => {
      if (
        OverlapTester.overlapRects(this.rectBound, wall.rectBound) &&
        OverlapTester.landOnRects(this.rectBound, wall.rectBound)
      ) {
        return true;
      }
    });
  }
};
