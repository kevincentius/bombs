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
  pos = {x: 0, y: 0};
  lastPos = {x: 0, y: 0};
  kickCooldown = 0;
  kickCooldownMax = 60;

  speed = 2.5;
  radius = 20;

  repairCounter = 0;
  respawnCounterLeft = 0;

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
    this.pos.x = (this.boundary.xMin + this.boundary.xMax) / 2;
    this.pos.y = (this.boundary.yMin + this.boundary.yMax) / 2;

    this.container.addChild(this.sprite);
    this.sprite.scale.set(2.4, 2.4);
  }

  die() {
    this.respawnCounterLeft = this.ctx.gameRule.respawnTime;
  }

  isAlive(): unknown {
    return this.respawnCounterLeft <= 0;
  }

  update() {
    // 3 seconds
    if (this.respawnCounterLeft > 0) {
      if (this.respawnCounterLeft > 180) {
        this.sprite.alpha = 0;
      } else {
        this.sprite.alpha = Date.now() % 500 < 250 ? 0.5 : 0; // blink effect
      }
      
      this.respawnCounterLeft--;
      this.repairCounter = 0;
    } else {
      this.sprite.alpha = 1;
    }

    // movement
    this.lastPos.x = this.pos.x;
    this.lastPos.y = this.pos.y;
    let dx = 0;
    let dy = 0;
    if (this.inputHandler.isDown(this.settings.controls[InputKey.UP])) { dy -= this.speed; }
    if (this.inputHandler.isDown(this.settings.controls[InputKey.DOWN])) { dy += this.speed; }
    if (this.inputHandler.isDown(this.settings.controls[InputKey.LEFT])) { dx -= this.speed; }
    if (this.inputHandler.isDown(this.settings.controls[InputKey.RIGHT])) { dx += this.speed; }

    if (this.isAlive() && this.inputHandler.isDown(this.settings.controls[InputKey.ACTION]) && this.kickCooldown <= 0) {
      this.kickCooldown = this.kickCooldownMax;
      this.subjKick.next();
    }

    // normalize diagonal movement
    if (dx !== 0 || dy !== 0) {
      dx *= Math.SQRT2;
      dy *= Math.SQRT2;
    }

    // clamp
    this.pos.x = Math.max(this.boundary.xMin + this.radius, Math.min(this.boundary.xMax - this.radius, this.pos.x + dx));
    this.pos.y = Math.max(this.boundary.yMin + this.radius, Math.min(this.boundary.yMax - this.radius, this.pos.y + dy));

    // kick cooldown
    this.kickCooldown = Math.max(0, this.kickCooldown - 1);

    // repair
    if (dx == 0 && dy == 0) {
      this.repairCounter++;
    } else {
      this.repairCounter = 0;
    }

    this.sprite.position.set(this.pos.x, this.pos.y);

    const p = this.kickCooldown / this.kickCooldownMax;
    this.sprite.rotation = -this.team * p*p * Math.PI * 2;
  }
}
