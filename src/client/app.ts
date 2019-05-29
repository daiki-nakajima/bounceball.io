import "phaser";
import { WelcomeScene } from "./scenes/welcomeScene";
import { GameScene } from "./scenes/gameScene";
import { ScoreScene } from "./scenes/scoreScene";

// Game Config
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
  backgroundColor: "#6bf"
};

export class MyGame extends Phaser.Game {
  constructor(config: GameConfig) {
    super(config);
  }
}

// Game starts
window.onload = () => {
  const game = new MyGame(config);
};
