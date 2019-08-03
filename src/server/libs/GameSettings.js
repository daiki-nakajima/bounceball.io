// サーバー設定
module.exports = class GameSettings {
  // ゲーム全体
  // フレームレート（１秒当たりのフレーム数）
  static get FRAMERATE() {
    return 30;
  }

  // ボール
  // 速度[m/s]。1frameあたり5進む => 1/30[s] で5進む => 1[s]で150進む。
  static get BALL_SPEED() {
    return 300.0;
  }

  static get GRAVITY_ACCELERATION() {
    return 500;
  }

  static get BALL_MASS() {
    return 40;
  }

  // 壁
  static get WALL_COUNT() {
    return 12;
  }
  // 爆発時間
  static get EXPL_LIFETIME() {
    return 2.0; //単位[s]
  }
};
