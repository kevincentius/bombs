import { Container, Sprite } from "pixi.js";
import { GameContext } from "../game/game-context";
import { TextureStore } from "../game/texture";
import { Pos } from "../game/types";

export class TilePixi {
  container = new Container();
  sprite: Sprite;

  // state
  alive = true;

  constructor(
    private textureStore: TextureStore,
    public pos: Pos,
  ) {
    this.sprite = new Sprite({
      texture: this.textureStore.tile,
      anchor: { x: 0.5, y: 0.5 },
      scale: 2.5,
    });
    this.sprite.position.set(this.pos.x, this.pos.y);
    this.container.addChild(this.sprite);
  }

  takeHit() {
    this.sprite.destroy();
    this.alive = false;
  }

  setActive(active: boolean) {
    this.sprite.texture = active ? this.textureStore.tileActive : this.textureStore.tile;
  }
}
