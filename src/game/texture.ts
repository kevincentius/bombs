import { Assets, Rectangle, Texture } from "pixi.js";
import {Howl, Howler} from 'howler';

export class TextureStore {
  players!: Texture[];
  bomb!: Texture;
  bombLit!: Texture;
  explosion!: Texture[];
  smallExplosion!: Texture[];
  tile!: Texture[];
  tileActive!: Texture[];
  tileRepair!: Texture;
  tileDestroyed!: Texture;

  chargeBarEmpty!: Texture;
  chargeBarFull!: Texture;

  roundStartSound = new Howl({ src: ['round-start.mp3'] });
  roundEndSound = new Howl({ src: ['round-end.mp3'] });
  repairSound = new Howl({ src: ['repair.mp3'] });
  chargeSound = new Howl({ src: ['charge.mp3'] });
  playerDieSound = new Howl({ src: ['player-die.mp3'] });
  missSound = new Howl({ src: ['miss.mp3'] });
  bombHitSound = new Howl({ src: ['hit.mp3'], volume: 1 });
  bounceSound = new Howl({ src: ['bounce.mp3'], volume: 0.5 });

  bombSpawnSound = new Howl({ src: ['bomb-spawn.mp3'], volume: 0.5 });
  explosionSounds: Howl[] = [
    new Howl({ src: ['explosion0.mp3'], volume: 0.25 }),
    new Howl({ src: ['explosion1.mp3'], volume: 0.25 }),
  ];

  kickSounds: Howl[] = [
    new Howl({ src: ['kick0.mp3'], volume: 1 }),
    new Howl({ src: ['kick1.mp3'], volume: 0.5 }),
    new Howl({ src: ['kick2.mp3'], volume: 0.5 }),
    new Howl({ src: ['kick3.mp3'], volume: 0.5 }),
    new Howl({ src: ['kick4.mp3'], volume: 0.5 }),
  ];

  clockTickSound = new Howl({ src: ['clock-tick.mp3'], volume: 1 });
  initialized = false;

  async init() {
    if (this.initialized) return;

    this.players = await Promise.all([
      Assets.load('player0.png'),
      Assets.load('player1.png'),
      Assets.load('player2.png'),
      Assets.load('player3.png'),
    ]);
    this.bomb = await Assets.load('bomb.png');
    this.bombLit = await Assets.load('bomb-lit.png');
    this.tile = await Promise.all([
      Assets.load('tile0.png'),
      Assets.load('tile1.png'),
    ]);
    this.tileActive = await Promise.all([
      await Assets.load('tile-active0.png'),
      await Assets.load('tile-active1.png'),
    ]);
    this.tileRepair = await Assets.load('tile-repair.png');
    this.tileDestroyed = await Assets.load('tile-destroyed.png');
    this.chargeBarEmpty = await Assets.load('charge-bar-empty.png');
    this.chargeBarFull = await Assets.load('charge-bar-full.png');
    
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

    const textures = [
      ...this.players,
      this.bomb,
      this.bombLit,
      ...this.explosion,
      ...this.smallExplosion,
      ...this.tile,
      ...this.tileActive,
      this.tileRepair,
      this.tileDestroyed,
      this.chargeBarEmpty,
      this.chargeBarFull
    ];
    textures.forEach((texture) => {
      texture.source.scaleMode = 'nearest';
    });
  }

}


