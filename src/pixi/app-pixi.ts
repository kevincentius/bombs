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

  rescale(scale: number) {
    const appWidth = 800 * scale;
    const appHeight = 400 * scale;

    this.app.stage.scale.set(scale);

    // Adjust position to center the scaled content
    this.app.stage.position.set(
        -(appWidth - 800 * scale) / 2,
        -(appHeight - 400 * scale) / 2
    );

    // Resize renderer to match new screen size
    this.app.renderer.resize(appWidth, appHeight);
  }
}
