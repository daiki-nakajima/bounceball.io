const GameObject = require('./GameObject');
const SharedSettings = require('../../client/js/SharedSettings');
const GameSettings = require('./GameSettings');

module.exports = class Explosion extends GameObject {
  constructor(fX, fY, fAngle) {
    super(
      SharedSettings.BALL_WIDTH,
      SharedSettings.BALL_HEIGHT,
      fX,
      fY,
      fAngle
    );
    this.fLifeTime = GameSettings.EXPL_LIFETIME;
  }

  update(fDeltaTime) {
    this.fLifeTime -= fDeltaTime;
    if (0 > this.fLifeTime) {
      return true; // 消失かどうか
    }
    return false;
  }
};
