import { AnimatedSprite, Application, Assets, Container, Sprite } from "pixi.js";
import { TextureStore } from "../game/texture";
import { GamePixi } from "./game-pixi";
import { GameContext } from "../game/game-context";

export class AppPixi {
  app = new Application();
  
  container: Container = new Container();
  game!: GamePixi;

  constructor(
    private ctx: GameContext,
    private canvas: HTMLCanvasElement,
    private textureStore: TextureStore,
  ) {
    
  }

  async init() {
    await this.app.init({
      background: '#000000',
      canvas: this.canvas,
      width: 800,
      height: 400,
    });

    this.app.stage.addChild(this.container);

    this.game = this.ctx.newGame();
    this.container.addChild(this.game.container);
    
    // Listen for animate update
    let lastUpdate = Date.now();
    const mspf = 17;

    this.app.ticker.add(delta => {
      const now = Date.now();
      
      while (now - lastUpdate >= mspf) {
        lastUpdate += mspf;
        this.game.update();
      }
    });
  }
}
