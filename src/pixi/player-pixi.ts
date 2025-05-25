import { Container, Sprite, Texture } from "pixi.js";
import { GameContext } from "../game/game-context";
import { TextureStore } from "../game/texture";
import { PlayerSettings } from "../game/player-settings";
import { InputHandler } from "../game/input-handler";
import { InputKey } from "../game/types";
import { Subject } from "rxjs";

export interface PlayerBoundary {
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
}

export class PlayerPixi {
  container = new Container();
  sprite: Sprite;

  // state
  x = 0;
  y = 0;
  kickCooldown = 0;
  kickCooldownMax = 60;

  speed = 2.5;
  radius = 20;

  repairCounter = 0;
  respawnCounter = 0;

  subjKick = new Subject<void>();

  constructor(
    private ctx: GameContext,
    private texture: Texture,
    private inputHandler: InputHandler,
    private boundary: PlayerBoundary,
    private settings: PlayerSettings,
    public team: number, // -1 for left, 1 for right
  ) {
    this.sprite = new Sprite({
      texture: this.texture,
      anchor: { x: 0.5, y: 0.5 },
    });
    this.x = (this.boundary.xMin + this.boundary.xMax) / 2;
    this.y = (this.boundary.yMin + this.boundary.yMax) / 2;

    this.container.addChild(this.sprite);
    this.sprite.scale.set(2.4, 2.4);
  }

  update() {
    let dx = 0;
    let dy = 0;
    if (this.inputHandler.isDown(this.settings.controls[InputKey.UP])) { dy -= this.speed; }
    if (this.inputHandler.isDown(this.settings.controls[InputKey.DOWN])) { dy += this.speed; }
    if (this.inputHandler.isDown(this.settings.controls[InputKey.LEFT])) { dx -= this.speed; }
    if (this.inputHandler.isDown(this.settings.controls[InputKey.RIGHT])) { dx += this.speed; }

    if (this.inputHandler.isDown(this.settings.controls[InputKey.ACTION]) && this.kickCooldown <= 0) {
      this.kickCooldown = this.kickCooldownMax;
      this.subjKick.next();
    }

    // normalize diagonal movement
    if (dx !== 0 || dy !== 0) {
      dx *= Math.SQRT2;
      dy *= Math.SQRT2;
    }

    // clamp
    this.x = Math.max(this.boundary.xMin + this.radius, Math.min(this.boundary.xMax - this.radius, this.x + dx));
    this.y = Math.max(this.boundary.yMin + this.radius, Math.min(this.boundary.yMax - this.radius, this.y + dy));

    // kick cooldown
    this.kickCooldown = Math.max(0, this.kickCooldown - 1);

    // repair
    if (dx == 0 && dy == 0) {
      this.repairCounter++;
    } else {
      this.repairCounter = 0;
    }

    this.sprite.position.set(this.x, this.y);

    const p = this.kickCooldown / this.kickCooldownMax;
    this.sprite.rotation = -this.team * p*p * Math.PI * 2;
  }
}
