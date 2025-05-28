import { Assets, Rectangle, Texture } from "pixi.js";
import {Howl, Howler} from 'howler';

export class TextureStore {
  players!: Texture[];
  bomb!: Texture;
  explosion!: Texture[];
  smallExplosion!: Texture[];
  tile!: Texture;
  tileActive!: Texture;
  tileRepair!: Texture;
  tileDestroyed!: Texture;

  roundStartSound = new Howl({ src: ['round-start.mp3'] });
  roundEndSound = new Howl({ src: ['round-end.mp3'] });
  repairSound = new Howl({ src: ['repair.mp3'] });

  bombSpawnSound = new Howl({ src: ['bomb-spawn.mp3'] });
  explosionSounds: Howl[] = [
    new Howl({ src: ['explosion0.mp3']}),
    new Howl({ src: ['explosion1.mp3']}),
  ];

  kickSounds: Howl[] = [
    new Howl({ src: ['kick0.mp3']}),
    new Howl({ src: ['kick1.mp3']}),
    new Howl({ src: ['kick2.mp3']}),
  ];

  async init() {
    this.players = await Promise.all([
      Assets.load('player0.png'),
      Assets.load('player1.png'),
      Assets.load('player2.png'),
      Assets.load('player3.png'),
    ]);
    this.players.forEach((texture) => texture.source.scaleMode = 'nearest');
    this.bomb = await Assets.load('bomb.png');
    this.bomb.source.scaleMode = 'nearest';
    this.tile = await Assets.load('tile.png');
    this.tileActive = await Assets.load('tile-active.png');
    this.tileRepair = await Assets.load('tile-repair.png');
    this.tileDestroyed = await Assets.load('tile-destroyed.png');
    
    // 1x12 sprite sheet for the explosion:
    const explosionSheet = await Assets.load('explosion.png');
    this.explosion = [];
    for (let i = 0; i < 12; i++) {
      this.explosion.push(new Texture(
        {
          source: explosionSheet,
          frame: new Rectangle(i * 128, 0, 128, 128),
        }
      ));
    }

    // 1x12 sprite sheet for the explosion:
    const explosionSmallSheet = await Assets.load('explosion-small.png');
    this.smallExplosion = [];
    for (let i = 0; i < 7; i++) {
      this.smallExplosion.push(new Texture(
        {
          source: explosionSmallSheet,
          frame: new Rectangle(i * 32, 0, 32, 32),
        }
      ));
    }
  }

}


