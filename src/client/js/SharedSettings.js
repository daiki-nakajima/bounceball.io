// サーバーとクライアント共通の設定クラス
class SharedSettings {
  // フィールドサイズ
  // ※背景タイル画像のトリム処理未実装のため、
  // 「FIELD_WIDTHは、FIELDTILE_WIDTHの定数倍」「FIELD_HEIGHTは、FIELDTILE_HEIGHTの定数倍」にする必要あり。
  static get FIELD_WIDTH() {
    return 2048.0;
  }
  static get FIELD_HEIGHT() {
    return 2048.0;
  }

  // キャンバスサイズ
  static get CANVAS_WIDTH() {
    return 1000.0;
  }
  static get CANVAS_HEIGHT() {
    return 1000.0;
  }

  // ボール
  static get BALL_WIDTH() {
    return 80.0;
  }
  static get BALL_HEIGHT() {
    return 80.0;
  }

  // 壁サイズ
  static get WALL_WIDTH() {
    return 250.0;
  }
  static get WALL_HEIGHT() {
    return 50.0;
  }

  // 初期バウンド力
  static get INIT_BOUNCY() {
    return 400;
  }
}

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
  // サーバー処理（Node.js処理）用の記述
  module.exports = SharedSettings;
}
