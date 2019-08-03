// スクリーンクラス
class Screen {
  constructor(socket, canvas, startScreen) {
    this.socket = socket;
    this.canvas = canvas;
    this.startScreen = startScreen;
    this.context = canvas.getContext('2d');

    this.assets = new Assets();
    this.iProcessingTimeNanoSec = 0;

    this.iProcessingTimeNanoSec = 0;
    this.aBall = null;
    this.aWall = null;
    this.aExpl = null;
    this.initBouncy = SharedSettings.INIT_BOUNCY;

    // キャンバスの初期化
    this.canvas.width = SharedSettings.CANVAS_WIDTH;
    this.canvas.height = SharedSettings.CANVAS_HEIGHT;

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
    // 中心座標の初期化完了フラグ
    this.isCentered = false;
  }

  // ソケットの初期化
  initSocket() {
    // 接続確立時の処理
    this.socket.on('connect', () => {
      console.log('connect : socket.id = %s', socket.id);
    });

    // サーバーからの状態通知(update)に対する処理
    this.socket.on('update', (aBall, aWall, aExpl, iProcessingTimeNanoSec) => {
      this.aBall = aBall;
      this.aWall = aWall;
      this.aExpl = aExpl;
      this.iProcessingTimeNanoSec = iProcessingTimeNanoSec;
    });

    // デッドしたらスタート画面に戻る
    this.socket.on('dead', () => {
      document.getElementById('start-button').disabled = false;
      startScreen.classList.toggle('is-hide');
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
      // ボールは中心座標に位置する
      this.fCenterX = ballSelf.fX;
      this.fCenterY = ballSelf.fY;
    } else {
      this.fCenterX = SharedSettings.FIELD_WIDTH * 0.5;
      this.fCenterY = SharedSettings.FIELD_HEIGHT * 0.5;
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

    const fTimeCurrentSec = iTimeCurrent * 0.001; // iTimeCurrentは、ミリ秒。秒に変換。
    // ボールの描画
    if (null !== this.aBall) {
      // const fTimeCurrentSec = iTimeCurrent * 0.001; // iTimeCurrentは、ミリ秒。秒に変換。
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
    // 爆発の描画
    if (null !== this.aExpl) {
      const iIndexFrame4Expl = parseInt(fTimeCurrentSec / 0.2) % 24; // フレーム番号
      this.aExpl.forEach(expl => {
        this.renderExpl(expl, iIndexFrame4Expl);
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
      const score = parseInt(ballSelf.bouncy) - this.initBouncy;
      this.context.fillText('Score : ' + score, 20, 40);
      this.context.restore();
    }

    // 画面右上にスコアランキング表示
    this.context.save();
    this.context.font = RenderingSettings.PROCESSINGTIME_FONT;
    this.context.fillStyle = RenderingSettings.PROCESSINGTIME_COLOR;
    this.context.fillText('Leader Board', this.canvas.width - 25 * 10, 40);
    this.context.restore();
    if (null !== this.aBall) {
      this.renderScore(this.aBall);
    }
  }

  renderWall(wall) {
    this.context.save();
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
    this.context.restore();
  }

  renderBall(ball, iIndexFrame) {
    this.context.save(); // translate前の状態をセーブ
    // ボールの座標値に移動
    this.context.translate(ball.fX, ball.fY);
    // 画像描画
    this.context.save(); // rotate前の状態をセーブ
    // this.context.rotate(ball.fAngle);
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

  renderExpl(expl, iIndexFrame) {
    this.context.save();
    this.context.translate(expl.fX, expl.fY);

    this.context.save();
    this.context.drawImage(
      this.assets.imageExpls,
      this.assets.arectExplInItemsImage[iIndexFrame].sx,
      this.assets.arectExplInItemsImage[iIndexFrame].sy,
      this.assets.arectExplInItemsImage[iIndexFrame].sw,
      this.assets.arectExplInItemsImage[iIndexFrame].sh,
      -SharedSettings.BALL_WIDTH * 0.5,
      -SharedSettings.BALL_HEIGHT * 0.5,
      SharedSettings.BALL_WIDTH * 3,
      SharedSettings.BALL_HEIGHT * 3
    );
    this.context.restore();

    this.context.restore();
  }

  renderScore(aBall) {
    let sortBalls = aBall;
    // スコア順に整列
    sortBalls
      .sort((a, b) => {
        if (a.bouncy < b.bouncy) return 1;
        if (a.bouncy > b.bouncy) return -1;
        return 0;
      })
      .slice(0, 5)
      .forEach((ball, i) => {
        this.context.save();
        this.context.font = RenderingSettings.SCORE_FONT;
        this.context.fillStyle = RenderingSettings.SCORE_COLOR;
        // #1 name score
        this.context.textAlign = 'start';
        this.context.fillText(
          '#' + (i + 1),
          this.canvas.width - 30 * 10,
          (i + 2) * 40
        );
        this.context.textAlign = 'start';
        this.context.fillText(
          ball.strNickName,
          this.canvas.width - 25 * 10,
          (i + 2) * 40
        );
        this.context.textAlign = 'end';
        const score = parseInt(ball.bouncy) - this.initBouncy;
        this.context.fillText(score, this.canvas.width - 1 * 10, (i + 2) * 40);
        this.context.restore();
      });
  }
}
