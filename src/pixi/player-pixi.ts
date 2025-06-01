import { Container, Graphics, Sprite, Texture } from "pixi.js";
import { GameContext } from "../game/game-context";
import { PlayerSettings } from "../game/player-settings";
import { InputHandler } from "../game/input-handler";
import { InputKey } from "../game/types";

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

  repairCounter = 0;
  respawnCounterLeft = 0;

  // current kick
  kickAnimationLeft = 0;
  kickAnimationDuration = 25; // minimum animation frames (otherwise it depends on cooldown)
  kickDurationLeft = 0;
  kickPower = 0;
 
  kickChargeCounter = 0;
  
  chargeBarContainer = new Container();
  chargeBarW = 16;
  chargeSoundId?: number;

  reachCircle = new Graphics();

  get rule() { return this.ctx.gameRule.player; }

  constructor(
    private ctx: GameContext,
    private texture: Texture,
    private inputHandler: InputHandler,
    private boundary: PlayerBoundary,
    private settings: PlayerSettings,
    public team: number, // -1 for left, 1 for right
    public readonly id: number, // player id, used for debugging
  ) {
    this.sprite = new Sprite({
      texture: this.texture,
      anchor: { x: 0.5, y: 0.5 },
    });
    this.pos.x = (this.boundary.xMin + this.boundary.xMax) / 2;
    this.pos.y = (this.boundary.yMin + this.boundary.yMax) / 2;

    this.container.addChild(this.sprite);

    const scale = this.rule.radius * 2 / ((this.texture.width + this.texture.height) / 2);
    this.sprite.scale.set(scale, scale);

    this.createChargeBar();
    this.createReachCircle();
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
    const y = -this.rule.radius - 6 - h / 2 - 2;
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

  private createReachCircle() {
    this.reachCircle.circle(0, 0, this.rule.kick.reach);
    this.reachCircle.stroke({ width: 1, color: 0xffffff, alpha: 0.15 });
    
    this.container.addChild(this.reachCircle);
  }

  die() {
    this.respawnCounterLeft = this.rule.respawnTime;
  }

  isAlive(): unknown {
    return this.respawnCounterLeft <= 0;
  }

  updateWithoutRepairs() {
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
    this.handleMovement();

    // kick
    this.kickDurationLeft = Math.max(0, this.kickDurationLeft - 1);
    if (this.isAlive() && this.kickCooldown <= 0) {
      if (this.inputHandler.isDown(this.settings.controls[InputKey.ACTION])) {
        if (this.rule.kick.charge.time == 0) {
          this.kickCooldown = this.rule.kick.cooldown;
          this.kickDurationLeft = this.rule.kick.duration;
          this.kickAnimationLeft = this.kickAnimationDuration;
          this.kickPower = this.rule.kick.power * this.rule.kick.powerMult;
          this.ctx.textureStore.missSound.play();
        } else if (this.kickCooldown <= 0) {
          if (this.kickChargeCounter == 0) {
            this.chargeSoundId = this.ctx.textureStore.chargeSound.play();
          }
          this.kickChargeCounter++;
        }
      } else {
        if (this.kickChargeCounter > 0) {
          this.kickCooldown = this.rule.kick.cooldown;
          this.kickDurationLeft = this.rule.kick.duration;
          this.kickAnimationLeft = this.kickAnimationDuration;
          this.kickPower = this.getKickChargeValue() * this.rule.kick.power * this.rule.kick.powerMult;
          this.kickChargeCounter = 0;
          this.ctx.textureStore.missSound.play();
        }
      }
    } else {
      this.kickChargeCounter = 0;
    }

    // kick cooldown
    this.kickCooldown = Math.max(0, this.kickCooldown - 1);
    this.kickAnimationLeft = Math.max(0, this.kickAnimationLeft - 1);

    this.container.position.set(this.pos.x, this.pos.y);

    // const p = this.kickCooldown / this.rule.kick.cooldown;
    const p = this.kickAnimationLeft / this.kickAnimationDuration;
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

  updateRepairs() {
    if (this.lastPos.x == this.pos.x && this.lastPos.y == this.pos.y) {
      this.repairCounter++;
    } else {
      this.repairCounter = 0;
    }
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
    this.pos.x = Math.max(this.boundary.xMin + this.rule.radius, Math.min(this.boundary.xMax - this.rule.radius, this.pos.x + dx));
    this.pos.y = Math.max(this.boundary.yMin + this.rule.radius, Math.min(this.boundary.yMax - this.rule.radius, this.pos.y + dy));
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
