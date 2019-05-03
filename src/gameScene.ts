import "phaser";

export class GameScene extends Phaser.Scene {

   delta: number;
   lastStarTime: number;
   starsCaught: number;
   starsFallen: number;
   speed: number;
   direction: number;
   isMove: boolean;
   sand: Phaser.Physics.Arcade.StaticGroup;
   player: Phaser.Physics.Arcade.Sprite;
   info: Phaser.GameObjects.Text;
   cursors: any;

   constructor() {
      super({ key: "GameScene" });
   }

   init(/*params: any*/): void {
      this.delta = 1000;
      this.lastStarTime = 0;
      this.starsCaught = 0;
      this.starsFallen = 0;
      this.speed = 160;
      this.direction = 1;
      this.isMove = false;
   }

   preload(): void {
      this.load.image("star", "assets/star.png");
      this.load.image("sky", "assets/sky.png");
      this.load.image("bomb", "assets/bomb.png");
      this.load.image("sand", "assets/platform.png");
      this.load.spritesheet('balls', 'assets/balls.png', { frameWidth: 16, frameHeight: 16 });
   }

   create(): void {
      this.add.image(400, 300, 'sky');
      // Ground
      this.sand = this.physics.add.staticGroup({ key: 'sand', frameQuantity: 20 });
      Phaser.Actions.PlaceOnLine(this.sand.getChildren(), new Phaser.Geom.Line(20, 580, 820, 580));
      this.sand.refresh();
      this.info = this.add.text(10, 10, '', { font: '24px Arial Bold', fill: '#FBFBAC' });
      // Player's setting
      this.player = this.physics.add.sprite(100, 400, 'balls');
      this.player.setBounce(1.0);
      this.player.setCollideWorldBounds(true);
      this.player.setScale(2);
      // Player's animation
      this.anims.create({
         key: 'neutral',
         frames: this.anims.generateFrameNumbers('balls', { start: 0, end: 5 }),
         frameRate: 5,
         repeat: -1
      });
      this.player.anims.play('neutral', true);
      // Collider
      this.physics.add.collider(this.player, this.sand);
      // Make the camera follow the player
      this.cameras.main.startFollow(this.player);
      // Input Events
      this.input.on("pointerdown", this.move, this);
      this.input.on("pointerup", this.stop, this);
      // this.cursors = this.input.keyboard.createCursorKeys();
   }

   update(time: number): void {
      const diff: number = time - this.lastStarTime;
      if (diff > this.delta) {
         this.lastStarTime = time;
         if (this.delta > 500) { this.delta -= 20; }
         this.emitStar();
      }
      this.info.text =
         this.starsCaught + " caught - " +
         this.starsFallen + " fallen (max 3)";
      // Play animation depend on key cursors
      if (this.cursors.left.isDown) {
         this.player.flipX = false;
         this.player.setVelocityX(-160);
      }
      else if (this.cursors.right.isDown) {
         this.player.flipX = true;
         this.player.setVelocityX(160);
      }
      else {
         this.player.setVelocityX(0);
      }

      if (this.isMove) {
         this.player.setVelocityX(this.speed * this.direction);
      } else {
         this.player.setVelocityX(0);
      }
      
   }

   move(p): void {
      if (p.x < 800 / 2) {
         this.direction = -1;
         this.player.flipX = false;
      } else {
         this.direction = +1;
         this.player.flipX = true;
      }
      this.isMove = true;
   }

   stop(): void {
      this.isMove = false;
   }

   private onClick(star: Phaser.Physics.Arcade.Image): () => void {
      return function () {
         star.setTint(0x00ff00);
         star.setVelocity(0, 0);
         this.starsCaught += 1;
         this.time.delayedCall(100, function (star) {
            star.destroy();
         }, [star], this);
      }
   }

   private onFall(star: Phaser.Physics.Arcade.Image): () => void {
      return function () {
         star.setTint(0xff0000);
         this.starsFallen += 1;
         this.time.delayedCall(100, function (star) {
            star.destroy();
            if (this.starsFallen > 2) {
               this.scene.start("ScoreScene", { starsCaught: this.starsCaught });
            }
         }, [star], this);
      }
   }
   
   private emitStar(): void {
      // var star: Phaser.Physics.Arcade.Image;
      // var x = Phaser.Math.Between(25, 775);
      // var y = 26;
      // star = this.physics.add.image(x, y, "star");
      // star.setDisplaySize(50, 50);
      // star.setVelocity(0, 200);   
      // star.setInteractive();
      // star.on('pointerdown', this.onClick(star), this);
      // this.physics.add.collider(star, this.sand, this.onFall(star), null, this);
   }

};