import { TextureStore } from "../game/texture";
import { GameContext } from "../game/game-context";
import { FieldPixi } from "./field-pixi";
import { Container } from "pixi.js";
import { Subject } from "rxjs";

export class GamePixi {
  container = new Container();

  field: FieldPixi;

  running = true;
  timeCounter = 0;

  subjGameOver = new Subject<void>();

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
      this.ctx.winner = this.ctx.displayData.teams[0].score > this.ctx.displayData.teams[1].score ? -1 :
        this.ctx.displayData.teams[0].score < this.ctx.displayData.teams[1].score ? 1 : 0;
    }
  }

  gameOver() {
    this.running = false;
  }
}
