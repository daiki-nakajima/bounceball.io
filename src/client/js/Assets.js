// アセット群(画像ファイルに関する)クラス
class Assets {
  constructor() {
    // 背景画像
    this.imageField = new Image();
    this.imageField.src = '../images/grass01.png';

    this.rectFieldInFieldImage = { sx: 0, sy: 0, sw: 512, sh: 512 };

    // ボール画像
    this.imageItems = new Image();
    this.imageItems.src = '../images/ball.png';

    this.arectBallInItemsImage = [
      { sx: 0, sy: 0, sw: 16, sh: 16 },
      { sx: 16, sy: 0, sw: 16, sh: 16 },
      { sx: 32, sy: 0, sw: 16, sh: 16 },
      { sx: 48, sy: 0, sw: 16, sh: 16 },
      { sx: 64, sy: 0, sw: 16, sh: 16 },
      { sx: 80, sy: 0, sw: 16, sh: 16 }
    ];

    // ボール画像
    this.imageWalls = new Image();
    this.imageWalls.src = '../images/items.png';
    this.rectWallInItemsImage = { sx: 38, sy: 2, sw: 64, sh: 16 };
  }
}
