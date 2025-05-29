import { TextureStore } from "../game/texture";
import { GameContext } from "../game/game-context";
import { FieldPixi } from "./field-pixi";
import { Container } from "pixi.js";

export class GamePixi {
  container = new Container();

  field: FieldPixi;

  running = true;
  timeCounter = 0;

  

  constructor(
    private ctx: GameContext,
    private textureStore: TextureStore,
  ) {
    this.field = this.ctx.newField();
    this.container.addChild(this.field.container);
    this.textureStore.roundStartSound.play();
  }

  update() {
    if (!this.running) return;

    this.timeCounter++;
    if (this.timeCounter >= 60 && this.ctx.displayData.timeLeft > 0) {
      this.timeCounter = 0;
      this.ctx.displayData.timeLeft--;
      
      if (this.ctx.displayData.timeLeft < 10) {
        this.textureStore.clockTickSound.play();
      }

      if (this.ctx.displayData.timeLeft == 0) {
        this.textureStore.roundEndSound.play();
      }
    }

    this.field.update();

    if (this.field.bombs.length === 0 && this.ctx.displayData.timeLeft <= 0) {
      
    }
  }

  gameOver() {
    this.running = false;
  }
}
