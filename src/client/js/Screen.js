// スクリーンクラス
class Screen {
  constructor(socket, canvas) {
    this.socket = socket;
    this.canvas = canvas;
    this.context = canvas.getContext('2d');

    this.assets = new Assets();
    this.iProcessingTimeNanoSec = 0;

    this.iProcessingTimeNanoSec = 0;
    this.aBall = null;
    this.aWall = null;

    // キャンバスの初期化
    this.canvas.width = SharedSettings.FIELD_WIDTH;
    this.canvas.height = SharedSettings.FIELD_HEIGHT;

    // ソケットの初期化
    this.initSocket();

    // コンテキストの初期化
    // アンチエイリアスの抑止（画像がぼやけるのの防止）以下４行
    this.context.mozImageSmoothingEnabled = false;
    this.context.webkitImageSmoothingEnabled = false;
    this.context.msImageSmoothingEnabled = false;
    this.context.imageSmoothingEnabled = false;

    // 描画中心座標値
    this.fCenterX = SharedSettings.FIELD_WIDTH * 0.5;
    this.fCenterY = SharedSettings.FIELD_HEIGHT * 0.5;
  }

  // ソケットの初期化
  initSocket() {
    // 接続確立時の処理
    this.socket.on('connect', () => {
      console.log('connect : socket.id = %s', socket.id);
      // this.socket.emit('enter-the-game');
    });

    // サーバーからの状態通知(update)に対する処理
    this.socket.on('update', (aBall, aWall, iProcessingTimeNanoSec) => {
      this.aBall = aBall;
      this.aWall = aWall;
      this.iProcessingTimeNanoSec = iProcessingTimeNanoSec;
    });

    // デッドしたらスタート画面に戻る
    this.socket.on('dead', () => {
      $('#start-screen').show();
    });
  }

  // アニメーション（無限ループ処理）
  animate(iTimeCurrent) {
    requestAnimationFrame(iTimeCurrent => {
      this.animate(iTimeCurrent);
    });
    this.render(iTimeCurrent);
  }

  // 描画。animateから無限に呼び出される
  render(iTimeCurrent) {
    // ボールリストから、socket.idで自ボールを取得する
    let ballSelf = null;
    if (null !== this.aBall) {
      this.aBall.some(ball => {
        if (ball.strSocketID === this.socket.id) {
          // 自タンク
          ballSelf = ball;
          return true;
        }
      });
    }

    // 描画中心座標値
    if (null !== ballSelf) {
      // 自タンク座標値
      this.fCenterX = ballSelf.fX;
      this.fCenterY = ballSelf.fY;
    }

    // キャンバスのクリア
    this.context.clearRect(0, 0, canvas.width, canvas.height);

    // 全体を平行移動
    // 中心座標値が(CenterX, CenterY)、キャンバスの大きさが(CanvasX, CanvaxY)の場合
    // キャンバス中心は(CanvasX/2, CanvasY/2)
    // 中心座標値とキャンバス中心との差分、オフセットする。
    // オフセット量は、{ -(CenterX - CanvasX/2), -(CenterY - CanvasY/2) } => { CanvasX * 0.5 - CenterX, CanvasY * 0.5 - CanvasY}
    this.context.save();
    this.context.translate(
      this.canvas.width * 0.5 - this.fCenterX,
      this.canvas.height * 0.5 - this.fCenterY
    );

    // キャンバスの塗りつぶし
    this.renderField();

    // ボールの描画
    if (null !== this.aBall) {
      const fTimeCurrentSec = iTimeCurrent * 0.001; // iTimeCurrentは、ミリ秒。秒に変換。
      const iIndexFrame = parseInt(fTimeCurrentSec / 0.2) % 6; // フレーム番号
      this.aBall.forEach(ball => {
        this.renderBall(ball, iIndexFrame);
      });
    }

    // 壁の描画
    if (null !== this.aWall) {
      this.aWall.forEach(wall => {
        this.renderWall(wall);
      });
    }

    // 全体を平行移動の終了
    this.context.restore();

    // キャンバスの枠の描画
    this.context.save();
    this.context.strokeStyle = RenderingSettings.FIELD_LINECOLOR;
    this.context.lineWidth = RenderingSettings.FIELD_LINEWIDTH;
    this.context.strokeRect(0, 0, canvas.width, canvas.height);
    this.context.restore();

    // 画面左上に得点表示
    if (null !== ballSelf) {
      this.context.save();
      this.context.font = RenderingSettings.SCORE_FONT;
      this.context.fillStyle = RenderingSettings.SCORE_COLOR;
      this.context.fillText('Score : ' + ballSelf.iScore, 20, 40);
      this.context.restore();
    }

    // 画面右上にサーバー処理時間表示
    this.context.save();
    this.context.font = RenderingSettings.PROCESSINGTIME_FONT;
    this.context.fillStyle = RenderingSettings.PROCESSINGTIME_COLOR;
    this.context.fillText(
      (this.iProcessingTimeNanoSec * 1e-9).toFixed(9) + ' [s]',
      this.canvas.width - 30 * 10,
      40
    );
    this.context.restore();
  }

  renderWall(wall) {
    // 画像描画
    this.context.drawImage(
      this.assets.imageWalls,
      this.assets.rectWallInItemsImage.sx,
      this.assets.rectWallInItemsImage.sy, // 描画元画像の右上座標
      this.assets.rectWallInItemsImage.sw,
      this.assets.rectWallInItemsImage.sh, // 描画元画像の大きさ
      wall.fX - SharedSettings.WALL_WIDTH * 0.5, // 画像先領域の右上座標（領域中心が、原点になるように指定する）
      wall.fY - SharedSettings.WALL_HEIGHT * 0.5, // 画像先領域の右上座標（領域中心が、原点になるように指定する）
      SharedSettings.WALL_WIDTH, // 描画先領域の大きさ
      SharedSettings.WALL_HEIGHT
    ); // 描画先領域の大きさ
  }

  renderField() {
    this.context.save();

    let iCountX = parseInt(
      SharedSettings.FIELD_WIDTH / RenderingSettings.FIELDTILE_WIDTH
    );
    let iCountY = parseInt(
      SharedSettings.FIELD_HEIGHT / RenderingSettings.FIELDTILE_HEIGHT
    );
    for (let iIndexY = 1 - iCountY; iIndexY <= iCountY; iIndexY++) {
      for (let iIndexX = 1 - iCountX; iIndexX <= iCountX; iIndexX++) {
        this.context.drawImage(
          this.assets.imageField,
          // 元画像のサイズ指定
          this.assets.rectFieldInFieldImage.sx, // 元画像の右上座標x
          this.assets.rectFieldInFieldImage.sy, // 元画像の右上座標y
          this.assets.rectFieldInFieldImage.sw, // 元画像の幅
          this.assets.rectFieldInFieldImage.sh, // 元画像の高さ
          // 描画位置指定
          iIndexX * RenderingSettings.FIELDTILE_WIDTH, // 描画領域の右上座標（領域中心が、原点になるように指定する）
          iIndexY * RenderingSettings.FIELDTILE_HEIGHT, // 描画領域の右上座標（領域中心が、原点になるように指定する）
          RenderingSettings.FIELDTILE_WIDTH, // 描画領域の幅
          RenderingSettings.FIELDTILE_HEIGHT // 描画領域の高さ
        );
      }
    }

    this.context.restore();
  }

  renderBall(ball, iIndexFrame) {
    this.context.save(); // translate前の状態をセーブ
    // ボールの座標値に移動
    this.context.translate(ball.fX, ball.fY);
    // 画像描画
    this.context.save(); // rotate前の状態をセーブ
    this.context.rotate(ball.fAngle);
    this.context.drawImage(
      this.assets.imageItems,
      this.assets.arectBallInItemsImage[iIndexFrame].sx,
      this.assets.arectBallInItemsImage[iIndexFrame].sy, // 描画元画像の右上座標
      this.assets.arectBallInItemsImage[iIndexFrame].sw,
      this.assets.arectBallInItemsImage[iIndexFrame].sh, // 描画元画像の大きさ
      -SharedSettings.BALL_WIDTH * 0.5, // 画像先領域の右上座標（領域中心が、原点になるように指定する）
      -SharedSettings.BALL_HEIGHT * 0.5, // 画像先領域の右上座標（領域中心が、原点になるように指定する）
      SharedSettings.BALL_WIDTH, // 描画先領域の大きさ
      SharedSettings.BALL_HEIGHT
    ); // 描画先領域の大きさ
    this.context.restore(); // rotate前の状態をリストア

    // ニックネーム
    this.context.save(); // ニックネーム描画前をセーブ
    this.context.textAlign = 'center';
    this.context.font = RenderingSettings.NICKNAME_FONT;
    this.context.fillStyle = RenderingSettings.NICKNAME_COLOR;
    this.context.fillText(ball.strNickName, 0, -50);
    this.context.restore(); // ニックネーム描画前をリストア

    this.context.restore(); // translate前の状態をリストア
  }
}
