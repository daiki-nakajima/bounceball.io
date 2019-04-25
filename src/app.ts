import "phaser";
import { WelcomeScene } from "./welcomeScene";
import { GameScene } from "./gameScene";
import { ScoreScene } from "./scoreScene";

// ゲームの各種情報
const config: GameConfig = {
   title: "bounceball.io",
   width: 800,
   height: 600,
   parent: "game",
   // 
   scene: [WelcomeScene, GameScene, ScoreScene],
   physics: {
      default: "arcade",
      arcade: {
         debug: false
      }
   },
   backgroundColor: "#18216D"
};

export class MyGame extends Phaser.Game {
   constructor(config: GameConfig) {
      super(config);
   }
};

// ロードされたらゲーム開始
window.onload = () => {
   var game = new MyGame(config);
};