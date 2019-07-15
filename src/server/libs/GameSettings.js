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
  // 回転速度[rad/s]。1frameあたり0.1進む => 1/30[s] で0.1進む => 1[s]で3[rad]進む。
  // static get BALL_ROTATION_SPEED() {
  //   return 3.0;
  // }

  // 壁
  static get WALL_COUNT() {
    return 3;
  }
};
