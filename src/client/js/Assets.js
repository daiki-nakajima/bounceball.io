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

    // 爆発画像
    this.imageExpls = new Image();
    this.imageExpls.src = '../images/explosions.png';
    this.arectExplInItemsImage = [
      { sx: 958, sy: 774, sw: 64, sh: 64 },
      { sx: 892, sy: 766, sw: 64, sh: 64 },
      { sx: 958, sy: 708, sw: 64, sh: 64 },
      { sx: 826, sy: 760, sw: 64, sh: 64 },
      { sx: 892, sy: 700, sw: 64, sh: 64 },
      { sx: 958, sy: 642, sw: 64, sh: 64 },
      { sx: 826, sy: 694, sw: 64, sh: 64 },
      { sx: 892, sy: 634, sw: 64, sh: 64 },
      { sx: 826, sy: 628, sw: 64, sh: 64 },
      { sx: 760, sy: 708, sw: 64, sh: 64 },
      { sx: 760, sy: 642, sw: 64, sh: 64 },
      { sx: 698, sy: 808, sw: 64, sh: 64 },
      { sx: 694, sy: 708, sw: 64, sh: 64 },
      { sx: 694, sy: 642, sw: 64, sh: 64 },
      { sx: 906, sy: 568, sw: 64, sh: 64 },
      { sx: 840, sy: 562, sw: 64, sh: 64 },
      { sx: 774, sy: 562, sw: 64, sh: 64 },
      { sx: 708, sy: 562, sw: 64, sh: 64 },
      { sx: 642, sy: 938, sw: 64, sh: 64 },
      { sx: 632, sy: 872, sw: 64, sh: 64 },
      { sx: 632, sy: 872, sw: 64, sh: 64 },
      { sx: 632, sy: 872, sw: 64, sh: 64 },
      { sx: 632, sy: 872, sw: 64, sh: 64 },
      { sx: 632, sy: 872, sw: 64, sh: 64 }
    ];
  }
}
