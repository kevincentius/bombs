import { Container, Sprite } from "pixi.js";
import { GameContext } from "../game/game-context";
import { TextureStore } from "../game/texture";
import { Pos } from "../game/types";

export class TilePixi {
  container = new Container();
  sprite: Sprite;

  // state
  alive = true;
  active = false;

  constructor(
    private textureStore: TextureStore,
    public pos: Pos,
    private size: number,
  ) {
    this.sprite = new Sprite({
      texture: this.textureStore.tile,
      anchor: { x: 0.5, y: 0.5 },
      scale: this.size / 8,
    });
    this.sprite.position.set(this.pos.x, this.pos.y);
    this.container.addChild(this.sprite);
  }

  takeHit() {
    if (!this.alive) return;
    this.alive = false;
    this.updateSprite();
  }

  repair() {
    if (this.alive) return;
    this.alive = true;
    this.updateSprite();
  }

  setActive(active: boolean) {
    this.active = active;
    this.updateSprite();
  }

  updateSprite() {
    // this.sprite.alpha = this.alive ? 1 : 0.3;
    this.sprite.texture = this.alive
      ? (this.active ? this.textureStore.tileActive : this.textureStore.tile)
      : (this.active ? this.textureStore.tileRepair : this.textureStore.tileDestroyed);
  }
}
