import "phaser";
import { WelcomeScene } from "./welcomeScene";
import { GameScene } from "./gameScene";
import { ScoreScene } from "./scoreScene";

// GameConfig
const config: GameConfig = {
   type: Phaser.AUTO,
   title: "bounceball.io",
   width: 800,
   height: 600,
   parent: "game",
   scene: [WelcomeScene, GameScene, ScoreScene],
   physics: {
      default: "arcade",
      arcade: {
         gravity: { y: 300 },
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

// Game starts
window.onload = () => {
   const game = new MyGame(config);
};