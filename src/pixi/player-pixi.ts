import { Container, Graphics, Sprite, Texture } from "pixi.js";
import { GameContext } from "../game/game-context";
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
  chargeBar!: Sprite;
  chargeBarFill!: Sprite;
  mask!: Graphics;

  // state
  pos = {x: 0, y: 0};
  lastPos = {x: 0, y: 0};
  kickCooldown = 0;

  radius = 20;

  repairCounter = 0;
  respawnCounterLeft = 0;

  subjKick = new Subject<number>(); // kick strength

  kickChargeCounter = 0;
  
  chargeBarContainer = new Container();
  chargeBarW = 16;
  chargeSoundId?: number;

  get rule() { return this.ctx.gameRule.player; }

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

    this.createChargeBar();
  }

  private createChargeBar() {
    this.chargeBar = new Sprite({
      texture: this.ctx.textureStore.chargeBarEmpty,
      anchor: { x: 0, y: 0 },
    });
    this.chargeBarFill = new Sprite({
      texture: this.ctx.textureStore.chargeBarFull,
      anchor: { x: 0, y: 0 },
    });

    const w = this.chargeBarW;
    const h = 4;
    const x = -w / 2;
    const y = -this.radius - h / 2 - 2;
    this.chargeBar.width = w;
    this.chargeBar.height = h;
    this.chargeBarFill.width = w;
    this.chargeBarFill.height = h;

    this.mask = new Graphics();
    this.mask.rect(0, 0, w * 0.7, h); // Define shape
    this.mask.fill(0xffffff); // White fill
    this.chargeBarContainer.addChild(this.mask);  
    this.chargeBarFill.mask = this.mask;

    this.chargeBarContainer.position.set(x, y);
    this.chargeBarContainer.addChild(this.chargeBar);
    this.chargeBarContainer.addChild(this.chargeBarFill);

    this.container.addChild(this.chargeBarContainer);
  }

  die() {
    this.respawnCounterLeft = this.rule.respawnTime;
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
    let isMoving = this.handleMovement();

    // kick
    if (this.isAlive() && this.kickCooldown <= 0) {
      if (this.inputHandler.isDown(this.settings.controls[InputKey.ACTION])) {
        if (this.rule.kick.charge.time == 0) {
          this.kickCooldown = this.rule.kick.cooldown;
          this.subjKick.next(this.rule.kick.power);
        } else if (this.kickCooldown <= 0) {
          if (this.kickChargeCounter == 0) {
            this.chargeSoundId = this.ctx.textureStore.chargeSound.play();
          }
          this.kickChargeCounter++;
        }
      } else {
        if (this.kickChargeCounter > 0) {
          this.kickCooldown = this.rule.kick.cooldown;
          this.subjKick.next(this.getKickChargeValue() * this.rule.kick.power);
          this.kickChargeCounter = 0;
        }
      }
    } else {
      this.kickChargeCounter = 0;
    }

    // kick cooldown
    this.kickCooldown = Math.max(0, this.kickCooldown - 1);

    // repair
    if (!isMoving) {
      this.repairCounter++;
    } else {
      this.repairCounter = 0;
    }

    this.container.position.set(this.pos.x, this.pos.y);

    const p = this.kickCooldown / this.rule.kick.cooldown;
    this.sprite.rotation = -this.team * p*p * Math.PI * 2;

    if (this.kickChargeCounter <= 0) {
      this.sprite.position.set(0, 0);
    } else {
      const p = this.getKickChargeValue();
      const q = p*p * 8;
      this.sprite.position.set(
        Math.random() * q - q / 2,
        Math.random() * q - q / 2,
      );
    }

    this.chargeBarContainer.visible = (this.kickChargeCounter > 0);
    this.mask.width = this.chargeBarW * this.getKickChargeValue();
  }

  private handleMovement() {
    this.lastPos.x = this.pos.x;
    this.lastPos.y = this.pos.y;
    let dx = 0;
    let dy = 0;
    const speed = this.rule.speed;
    if (this.inputHandler.isDown(this.settings.controls[InputKey.UP])) { dy -= speed; }
    if (this.inputHandler.isDown(this.settings.controls[InputKey.DOWN])) { dy += speed; }
    if (this.inputHandler.isDown(this.settings.controls[InputKey.LEFT])) { dx -= speed; }
    if (this.inputHandler.isDown(this.settings.controls[InputKey.RIGHT])) { dx += speed; }

    // normalize diagonal movement
    if (dx !== 0 || dy !== 0) {
      dx *= Math.SQRT2;
      dy *= Math.SQRT2;
    }
    let isMoving = (dx !== 0 || dy !== 0);

    // clamp
    this.pos.x = Math.max(this.boundary.xMin + this.radius, Math.min(this.boundary.xMax - this.radius, this.pos.x + dx));
    this.pos.y = Math.max(this.boundary.yMin + this.radius, Math.min(this.boundary.yMax - this.radius, this.pos.y + dy));
    return isMoving;
  }

  private getKickChargeValue() {
    let p = this.getKickChargeValueRaw();
    return Math.pow(p, this.rule.kick.charge.precisionExp);
  }

  /**
   * if overcharged, it starts to decrease again to 25%
   */
  private getKickChargeValueRaw() {
    if (this.kickChargeCounter <= 0) return 0;

    const max = this.rule.kick.charge.time;
    if (this.kickChargeCounter <= max) {
      return this.kickChargeCounter / max;
    } else {
      if (this.rule.kick.charge.overchargedIsWeaker) {
        return Math.max(0.25, 2 - this.kickChargeCounter/max);
      } else {
        return 1;
      }
    }
  }
}
