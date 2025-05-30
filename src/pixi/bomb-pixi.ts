import { Container, Sprite } from "pixi.js";
import { TextureStore } from "../game/texture";
import { Pos } from "../game/types";
import { GameRule } from "../game/game-rule";

interface BombCollisionData {
  kicker: number | null;
  kickerTeam: number | null; // team of the kicker, if applicable
  gracePeriod: number;
  deadly: boolean; // if the bomb is deadly (can kill players)
}

export class BombPixi {
  container = new Container();
  sprite: Sprite;
  litSprite: Sprite;

  // state
  time = 0;
  pos: Pos = { x: 0, y: 0 };
  speed = 0;
  dir = 0

  collision: BombCollisionData = {
    gracePeriod: 0,
    kicker: null,
    kickerTeam: null,
    deadly: false,
  };

  get config() { return this.gameRule.bomb; }

  constructor(
    private textureStore: TextureStore,
    private gameRule: GameRule,
    spawnPos: Pos,
    public id: number,
  ) {
    const spriteScale = this.gameRule.bomb.radius * 2 / this.textureStore.bomb.width;
    this.sprite = new Sprite({
      texture: this.textureStore.bomb,
      anchor: { x: 0.5, y: 0.5 },
      scale: spriteScale,
    });
    this.container.addChild(this.sprite);

    this.litSprite = new Sprite({
      texture: this.textureStore.bombLit,
      anchor: { x: 0.5, y: 0.5 },
      scale: spriteScale,
    });
    this.container.addChild(this.litSprite);

    this.pos = { x: spawnPos.x, y: spawnPos.y };
    this.dir = Math.random() * Math.PI * 2; // random direction
    this.speed = Math.random() * 5;
  }

  kicked(playerId: number, team: number) {
    this.time = Math.min(this.time, this.config.spawnTime + this.config.explosionDelay * (1 - this.gameRule.bomb.resetTimerOnKick));

    this.collision.kicker = playerId;
    this.collision.kickerTeam = team;
    this.collision.gracePeriod = this.config.collision.gracePeriod;
  }

  update() {
    this.updateMovement();
    this.updateCollision();
    this.updateVisual();

    this.time++;
    if (this.time > this.config.spawnTime + this.config.explosionDelay) {
      this.container.destroy();
      return true;
    }

    return false;
  }

  private updateCollision() {
    this.collision.gracePeriod = Math.max(0, this.collision.gracePeriod - 1);
    if (this.collision.kicker !== null && this.collision.gracePeriod <= 0) {
      this.collision.kicker = null;
    }
    this.collision.deadly = this.time > this.config.spawnTime && this.speed >= this.config.collision.speedToKillPlayers;
  }

  private updateMovement() {
    const vx = Math.cos(this.dir) * this.speed;
    const vy = Math.sin(this.dir) * this.speed;
    this.pos.x += vx;
    this.pos.y += vy;
    this.speed = Math.max(0, this.speed * this.config.vMult - this.config.vDeccel);

    // bounce
    let bounce = false;
    if (vx > 0 && this.pos.x + this.config.radius >= 800) { // assuming field width is 800
      this.dir = Math.PI - this.dir; // reflect direction
      this.pos.x = 800 - this.config.radius; // assuming field width is 800
      bounce = true;
    } else if (vx < 0 && this.pos.x - this.config.radius <= 0) {
      this.dir = Math.PI - this.dir; // reflect direction
      this.pos.x = this.config.radius;
      bounce = true;
    }
    if (vy > 0 && this.pos.y + this.config.radius >= 400) { // assuming field height is 400
      this.dir = -this.dir; // reflect direction
      this.pos.y = 400 - this.config.radius; // assuming field height is 400
      bounce = true;
    } else if (vy < 0 && this.pos.y - this.config.radius <= 0) {
      this.dir = -this.dir; // reflect direction
      this.pos.y = this.config.radius;
      bounce = true;
    }
    if (bounce) {
      this.textureStore.bounceSound.play();
    }
  }

  private updateVisual() {
    // initial spawn
    const spawnP = Math.min(1, this.time / this.config.spawnTime);
    const spawnP2 = 2 * (spawnP - 0.5);
    const spawnTfY = 100 * (spawnP2 * spawnP2 - 1);

    const p = (this.time / (this.config.spawnTime + this.config.explosionDelay));
    const shake = (p * p) * this.config.animation.shakePower;
    const shakeX = 2 * Math.random() * shake * 2 - shake;
    const shakeY = 2 * Math.random() * shake * 2 - shake;
    this.container.position.set(this.pos.x + shakeX, this.pos.y + shakeY + spawnTfY);
    this.container.alpha = spawnP;

    // this.container.scale.y = this.collision.deadly ? 1.1 : 1;
    const timeLeft = this.config.spawnTime + this.config.explosionDelay - this.time;
    const litTime = this.config.animation.litTime;
    if (timeLeft > litTime) {
      this.litSprite.visible = false;
    } else {
      const litP = 1 - (timeLeft / litTime);
      const litIntv = (1 - litP) * this.config.animation.litBlinkIntervalInitial + litP * this.config.animation.litBlinkIntervalFinal;
      if (timeLeft % litIntv > litIntv / 2) {
        this.litSprite.visible = true;
        this.litSprite.alpha = litP * this.config.animation.litOpacity;
      } else {
        this.litSprite.visible = false;
      }
    }
  }
}
