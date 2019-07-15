const GameObject = require('./GameObject');
const SharedSettings = require('../../client/js/SharedSettings');

// 壁クラス
module.exports = class Wall extends GameObject {
  constructor(fX, fY) {
    super(SharedSettings.WALL_WIDTH, SharedSettings.WALL_HEIGHT, fX, fY, 0);
  }
};
