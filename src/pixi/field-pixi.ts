import { AnimatedSprite, Container, Texture } from "pixi.js";
import { GameContext } from "../game/game-context";
import { BombPixi } from "./bomb-pixi";
import { Pos } from "../game/types";
import { PlayerPixi } from "./player-pixi";
import { PlayerSettings } from "../game/player-settings";
import { GameRule } from "../game/game-rule";
import { TilePixi } from "./tile.pixi";
import { TextureStore } from "../game/texture";

export class FieldPixi {
  container = new Container();

  playerContainer = new Container();
  players: PlayerPixi[] = [];

  bombContainer = new Container();
  bombs: BombPixi[] = [];

  spawnCounter = 0;
  spawnInterval = 60;

  tileContainer = new Container();
  tiles: TilePixi[][] = [];

  constructor(
    private ctx: GameContext,
    private gameRule: GameRule,
    private textureStore: TextureStore,
  ) {
    this.spawnCounter = Math.max(60, this.gameRule.bombSpawnIntervalInitial / 2);
    this.createExplosion({ x: 400, y: 200});

    this.container.sortableChildren = true; // enable sorting for z-index management
    
    this.container.addChild(this.tileContainer);
    this.createPlayers();
    this.container.addChild(this.playerContainer);
    this.container.addChild(this.bombContainer);

    this.tiles = Array.from({ length: this.gameRule.tiles.rows }, () => []);
    for (let i = 0; i < this.gameRule.tiles.rows; i++) {
      for (let j = 0; j < this.gameRule.tiles.cols; j++) {
        const tilePos: Pos = {
          x: j * this.gameRule.tiles.size + this.gameRule.tiles.size / 2,
          y: i * this.gameRule.tiles.size + this.gameRule.tiles.size / 2,
        };
        const tile = new TilePixi(this.ctx.textureStore, tilePos, this.gameRule.tiles.size, j < this.gameRule.tiles.cols / 2 ? 0 : 1);
        this.tiles[i] = this.tiles[i] || [];
        this.tiles[i][j] = tile;
        this.tileContainer.addChild(tile.container);
      }
    }
  }

  createPlayers() {
    const extraBound = this.gameRule.extraBound;
    const boundaryLeft = { xMin: 0, xMax: 400 + extraBound, yMin: 0, yMax: 400 };
    const boundaryRight = { xMin: 400 - extraBound, xMax: 800, yMin: 0, yMax: 400 };

    const p1Settings: PlayerSettings = {
      controls: {
        DOWN: 's',
        UP: 'w',
        LEFT: 'a',
        RIGHT: 'd',
        ACTION: 'q',
      }
    };
    
    const p2Settings: PlayerSettings = {
      controls: {
        DOWN: 'ArrowDown',
        UP: 'ArrowUp',
        LEFT: 'ArrowLeft',
        RIGHT: 'ArrowRight',
        ACTION: 'Enter',
      }
    };

    const p3Settings: PlayerSettings = {
      controls: {
        DOWN: 'k',
        UP: 'i',
        LEFT: 'j',
        RIGHT: 'l',
        ACTION: ' ',
      }
    };
    
    const p4Settings: PlayerSettings = {
      controls: {
        DOWN: '5',
        UP: '8',
        LEFT: '4',
        RIGHT: '6',
        ACTION: '+',
      }
    };
    
    this.addPlayer(this.ctx.newPlayer(this.textureStore.players[0], boundaryLeft, p1Settings, -1));
    this.addPlayer(this.ctx.newPlayer(this.textureStore.players[1], boundaryRight, p2Settings, 1));

    if (this.gameRule.fourPlayers) {
      this.addPlayer(this.ctx.newPlayer(this.textureStore.players[2], boundaryLeft, p3Settings, -1));
      this.addPlayer(this.ctx.newPlayer(this.textureStore.players[3], boundaryRight, p4Settings, 1));
    }
  }

  update() {
    this.updatePlayers();

    this.updateBombSpawner();
    this.updateBombs();
    this.updateTiles();

    if (this.players.length === 0) {
      this.ctx.appPixi.game.gameOver();
    }
  }

  updatePlayers() {
    this.players.forEach(player => {
      player.update();
      this.container.addChild(player.container);
    });
  }

  updateBombSpawner() {
    if (this.ctx.displayData.timeLeft <= 0) return; // no bombs if time is up

    this.spawnInterval = this.ctx.displayData.timeLeft / this.gameRule.roundTime * (this.gameRule.bombSpawnIntervalInitial - this.gameRule.bombSpawnIntervalFinal) + this.gameRule.bombSpawnIntervalFinal;
    this.spawnCounter++;
    if (this.spawnCounter >= this.spawnInterval) {
      this.spawnCounter -= this.spawnInterval;

      this.spawnBomb();
    }
  }

  private spawnBomb() {
    const x = Math.random() * 800; // assuming field width is 800
    const y = Math.random() * 400; // assuming field height is 400
    const bomb = this.ctx.newBomb({ x, y });
    this.bombs.push(bomb);
    this.bombContainer.addChild(bomb.container);
    
    this.textureStore.bombSpawnSound.play(); // play bomb spawn sound
  }

  updateBombs() {
    // update bombs while deleting the ones that have exploded
    this.bombs = this.bombs.filter(bomb => {
      const exploded = bomb.update();
      if (exploded) {
        this.textureStore.explosionSounds[
          Math.floor(Math.random() * this.textureStore.explosionSounds.length)
        ].play(); // play explosion sound
        this.createExplosion(bomb.pos);

        this.getAlivePlayers().forEach(player => {
          const dist = Math.hypot(player.pos.x - bomb.pos.x, player.pos.y - bomb.pos.y);
          if (dist < player.radius + bomb.config.explosionRadius) {
            this.killPlayer(player);
          }
        });

        // destroy tiles
        this.destroyTiles(bomb.pos, bomb.config.tileDestroyRadius);
      };
      return !exploded;
    });
  }

  private killPlayer(player: PlayerPixi) {
    player.die();
    this.textureStore.playerDieSound.play();
    this.createSmallExplosion({ x: player.pos.x, y: player.pos.y });
  }

  private destroyTiles(pos: Pos, radius: number) {
    this.tiles.flat().forEach(tile => {
      const dist = Math.hypot(tile.pos.x - pos.x, tile.pos.y - pos.y);
      if (dist < radius + this.gameRule.tiles.size / 2) {
        tile.takeHit(); // destroy tile if in explosion range
      }
    });
  }

  updateTiles() {
    const players = this.getAlivePlayers();

    this.tiles.flat().forEach(tile => tile.setActive(false));
    
    let scoreMap = new Map<number, number>();
    scoreMap.set(-1, 0);
    scoreMap.set(1, 0);
    this.tiles.flat().forEach(tile => {
      const team = tile.pos.x < 400 ? -1 : 1;;
      if (tile.alive) {
        scoreMap.set(team, (scoreMap.get(team) || 0) + 1);
      }
    });

    const playerTileCollisionMap = new Map<PlayerPixi, TilePixi[]>();
    this.tiles.flat().forEach(tile => {
      const hitPlayers = players.filter(player => Math.hypot(player.pos.x - tile.pos.x, player.pos.y - tile.pos.y) < player.radius + this.gameRule.tiles.size / 2);
      hitPlayers.forEach(player => {
        playerTileCollisionMap.set(player, playerTileCollisionMap.get(player) || []);
        playerTileCollisionMap.get(player)!.push(tile);
        tile.setActive(true);
      });
    });

    // repair mechanic
    if (this.ctx.displayData.timeLeft > 0) {
      for (const player of players.filter(p => p.repairCounter >= this.gameRule.repairTime)) {
        const repairableTiles = (playerTileCollisionMap.get(player) || [])
          .filter(tile => !tile.alive);
        if (repairableTiles.length === 0) continue;
  
        // find closest tile
        let closestTile = repairableTiles[0];
        let closestDist = Math.hypot(player.pos.x - closestTile.pos.x, player.pos.y - closestTile.pos.y);
        for (const tile of repairableTiles) {
          const dist = Math.hypot(player.pos.x - tile.pos.x, player.pos.y - tile.pos.y);
          if (dist < closestDist) {
            closestTile = tile;
            closestDist = dist;
          }
        }
        closestTile.repair();
        this.textureStore.repairSound.play();
        player.repairCounter = 0;
        this.createSmallExplosion({ x: closestTile.pos.x, y: closestTile.pos.y });
      }
    }

    // detect players that are not on any safe tiles (fall / undo move)
    const unsafePlayers = new Set<PlayerPixi>(players);
    playerTileCollisionMap.forEach((tiles, player) => {
      if (tiles.find(tile => tile.alive)) {
        unsafePlayers.delete(player); // player is safe on tile
      }
    });
    for (const player of unsafePlayers) {
      if (this.gameRule.canFall) {
          this.killPlayer(player);
      } else {
        player.pos.x = player.lastPos.x;
        player.pos.y = player.lastPos.y;
      }
    }

    // update score
    this.ctx.displayData.teams[0].score = scoreMap.get(-1)!; // left team score
    this.ctx.displayData.teams[1].score = scoreMap.get(1)!; // right team score
  }

  computePlayerToTileCollisions() {
    const hitMap = new Map<PlayerPixi, TilePixi[]>();
    for (const row of this.tiles) {
      for (const tile of row) {
        for (const player of this.getAlivePlayers()) {
          if (!player.isAlive()) return;

          const dist = Math.hypot(player.pos.x - tile.pos.x, player.pos.y - tile.pos.y);
          if (dist < player.radius + this.gameRule.tiles.size / 2) {
            hitMap.set(player, hitMap.get(player) || []);
            hitMap.get(player)!.push(tile);
          }
        }
      }
    }
    return hitMap;
  }

  private getAlivePlayers() {
    return this.players.filter(player => player.isAlive());
  }

  createExplosion(pos: Pos) {
    const movie = new AnimatedSprite({
      textures: this.textureStore.explosion,
    });
    movie.position.set(pos.x, pos.y);
    movie.anchor.set(0.5, 0.8);
    movie.animationSpeed = 0.3;
    movie.scale = this.gameRule.bomb.explosionRadius / 20;
    movie.play();
    movie.loop = false;
    movie.onComplete = () => movie.destroy();
    this.container.addChild(movie);
  }

  createSmallExplosion(pos: Pos) {
    const movie = new AnimatedSprite({
      textures: this.textureStore.smallExplosion,
    });
    movie.scale = 1.75;
    movie.position.set(pos.x, pos.y);
    movie.anchor.set(0.5, 0.5);
    movie.animationSpeed = 0.3;
    movie.play();
    movie.loop = false;
    movie.onComplete = () => movie.destroy();
    this.container.addChild(movie);
  }

  addPlayer(player: PlayerPixi) {
    this.players.push(player);
    this.playerContainer.addChild(player.container);
    
    player.subjKick.subscribe(kickPower => {
      this.checkKickBomb({x: player.pos.x, y: player.pos.y}, kickPower);
    });
  }

  checkKickBomb(playerPos: Pos, kickPower: number) {
    // find bombs
    const hits = this.bombs
      .filter(bomb => bomb.time >= bomb.config.spawnTime)
      .map(bomb => ({
        bomb,
        dist: Math.hypot(bomb.pos.x - playerPos.x, bomb.pos.y - playerPos.y),
        dy: bomb.pos.y - playerPos.y,
        dx: bomb.pos.x - playerPos.x,
      }))
      .filter(hit => hit.dist < 50) // assuming kick range is 50
    ;

    const power = 0.5 + 0.5 / hits.length;
    hits.forEach(hit => {
      hit.bomb.speed = kickPower;
      hit.bomb.dir = Math.atan2(hit.dy, hit.dx);
      hit.bomb.kicked();
      
      const p = kickPower / this.gameRule.kickPower;
      let kickSoundIndex;
      if (this.ctx.gameRule.kickChargeTime > 1) {
        kickSoundIndex = Math.min(this.ctx.textureStore.kickSounds.length - 1, Math.floor(p*p * this.ctx.textureStore.kickSounds.length));;
      } else {
        kickSoundIndex = Math.floor(Math.random() * (this.ctx.textureStore.kickSounds.length - 2)) + 1;
      }
      this.ctx.textureStore.kickSounds[kickSoundIndex].play(); // play kick sound
      this.createSmallExplosion(hit.bomb.pos);

      // const xpd = hit.dy / hit.dist;
      // const dir = (Math.PI * 0.25 * xpd);
      // const vel = {
      //   x: -this.gameRule.kickPower * team * Math.cos(dir) * power, // kick to the left for team -1, right for team 1
      //   y: this.gameRule.kickPower * Math.sin(dir) * power, // kick upwards
      // };
      // hit.bomb.speed = Math.hypot(vel.x, vel.y);
      // hit.bomb.dir = Math.atan2(vel.y, vel.x);
    });

    if (hits.length == 0) {
      this.ctx.textureStore.missSound.play();
    }
  }
}
