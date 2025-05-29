import { Container, Sprite } from "pixi.js";
import { TextureStore } from "../game/texture";
import { Pos } from "../game/types";
import { GameRule } from "../game/game-rule";

export class BombPixi {
  container = new Container();
  sprite: Sprite;

  // state
  time = 0;
  pos: Pos = { x: 0, y: 0 };
  speed = 0;
  dir = 0

  get config() { return this.gameRule.bomb; }

  constructor(
    private textureStore: TextureStore,
    private gameRule: GameRule,
    spawnPos: Pos,
  ) {
    this.sprite = new Sprite({
      texture: this.textureStore.bomb,
      anchor: { x: 0.5, y: 0.5 },
    });
    this.container.addChild(this.sprite);

    this.pos = { x: spawnPos.x, y: spawnPos.y };
    this.dir = Math.random() * Math.PI * 2; // random direction
    this.speed = Math.random() * 5;
  }

  kicked() {
    this.time = Math.min(this.time, this.config.spawnTime + this.config.explosionDelay * (1 - this.gameRule.bomb.resetTimerOnKick));
  }

  update() {
    const vx = Math.cos(this.dir) * this.speed;
    const vy = Math.sin(this.dir) * this.speed;
    this.pos.x += vx;
    this.pos.y += vy;
    this.speed = Math.max(0, this.speed * this.config.vMult - this.config.vDeccel);
    
    // bounce
    if (vx > 0 && this.pos.x + this.config.radius >= 800) { // assuming field width is 800
      this.dir = Math.PI - this.dir; // reflect direction
      this.pos.x = 800 - this.config.radius; // assuming field width is 800
    } else if (vx < 0 && this.pos.x - this.config.radius <= 0) {
      this.dir = Math.PI - this.dir; // reflect direction
      this.pos.x = this.config.radius;
    }
    if (vy > 0 && this.pos.y + this.config.radius >= 400) { // assuming field height is 400
      this.dir = -this.dir; // reflect direction
      this.pos.y = 400 - this.config.radius; // assuming field height is 400
    } else if (vy < 0 && this.pos.y - this.config.radius <= 0) {
      this.dir = -this.dir; // reflect direction
      this.pos.y = this.config.radius;
    }

    // initial spawn
    const spawnP = Math.min(1, this.time / this.config.spawnTime);
    const spawnP2 = 2 * (spawnP - 0.5);
    const spawnTfY = 100 * (spawnP2 * spawnP2 - 1);

    const p = (this.time / (this.config.spawnTime + this.config.explosionDelay));
    // const scale = 1.5 + 0.5*(1-(1-p)*(1-p));
    const scale = 3;
    const shake = (p * p);
    const shakeX = 2 * Math.random() * shake * 2 - shake;
    const shakeY = 2 * Math.random() * shake * 2 - shake;
    this.sprite.scale = { x: scale, y: scale };
    this.sprite.position.set(this.pos.x + shakeX, this.pos.y + shakeY + spawnTfY);
    this.sprite.alpha = spawnP;


    const tintC = 0xff * (1 - p*p*p);
    this.sprite.tint = (tintC << 16) | (tintC << 8) | tintC; // grayscale tint

    this.time++;
    if (this.time > this.config.spawnTime + this.config.explosionDelay) {
      this.container.destroy();
      return true;
    }

    return false;
  }
}
