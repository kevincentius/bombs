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
  nextBombId = 0;
  kickGracePeriodMap = new Map<number, number>(); // player cannot kick the same bomb twice within this grace period

  spawnCounter = 0;
  spawnInterval = 60;

  tileContainer = new Container();
  tiles: TilePixi[][] = [];

  constructor(
    private ctx: GameContext,
    private gameRule: GameRule,
    private textureStore: TextureStore,
  ) {
    this.spawnCounter = Math.max(60, this.gameRule.bombSpawner.intervalInitial / 2);
    this.createExplosion({ x: 400, y: 200});

    this.container.sortableChildren = true; // enable sorting for z-index management
    
    this.container.addChild(this.tileContainer);
    this.createPlayers();
    this.container.addChild(this.bombContainer);
    this.container.addChild(this.playerContainer);

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

    const p3Settings: PlayerSettings = {
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

    const p1Settings: PlayerSettings = {
      controls: {
        DOWN: 'k',
        UP: 'i',
        LEFT: 'j',
        RIGHT: 'l',
        ACTION: 'h',
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
    
    this.addPlayer(this.ctx.newPlayer(this.textureStore.players[0], boundaryLeft, p1Settings, -1, 0));
    this.addPlayer(this.ctx.newPlayer(this.textureStore.players[1], boundaryRight, p2Settings, 1, 1));

    if (this.gameRule.fourPlayers) {
      this.addPlayer(this.ctx.newPlayer(this.textureStore.players[2], boundaryLeft, p3Settings, -1, 2));
      this.addPlayer(this.ctx.newPlayer(this.textureStore.players[3], boundaryRight, p4Settings, 1, 3));
    }
  }

  update() {
    this.updatePlayersWithoutRepairs();
    // ugly, but this updatePlayerRepairs must be done after updatePlayers and updateTiles. Because collision detection and move undo is done in updateTiles.
    this.updatePlayerRepairs();
    this.updateBombSpawner();
    this.updateBombs();
    this.updateTiles();


    if (this.players.length === 0) {
      this.ctx.appPixi.game.gameOver();
    }
  }

  updatePlayersWithoutRepairs() {
    this.players.forEach(player => {
      player.updateWithoutRepairs();
    });
  }

  updatePlayerRepairs() {
    this.players.forEach(player => player.updateRepairs());
  }

  updateBombSpawner() {
    if (this.ctx.displayData.timeLeft <= 0) return; // no bombs if time is up

    this.spawnInterval = this.ctx.displayData.timeLeft / this.gameRule.roundTime * (this.gameRule.bombSpawner.intervalInitial - this.gameRule.bombSpawner.intervalFinal) + this.gameRule.bombSpawner.intervalFinal;
    this.spawnCounter++;
    if (this.spawnCounter >= this.spawnInterval) {
      this.spawnCounter -= this.spawnInterval;

      this.spawnBomb();
    }
  }

  private spawnBomb() {
    const x = Math.random() * 800; // assuming field width is 800
    const y = Math.random() * 400; // assuming field height is 400
    const bomb = this.ctx.newBomb({ x, y }, this.nextBombId++);
    this.bombs.push(bomb);
    this.bombContainer.addChild(bomb.container);
    
    this.textureStore.bombSpawnSound.play(); // play bomb spawn sound
  }

  updateBombs() {
    // check if player kicks bombs
    for (const player of this.getAlivePlayers().filter(p => p.kickDurationLeft > 0)) {
      for (const bomb of this.bombs) {
        const id = player.id * 999_999_999_999_999 + bomb.id; // unique id for player-bomb pair

        // grace period to avoid double kicks
        const gracePeriod = this.kickGracePeriodMap.get(id);
        if (gracePeriod == null) {
          this.checkKickBomb(player.team, player.id, player.pos, player.rule.kick.reach, player.kickPower);
          this.kickGracePeriodMap.set(id, this.gameRule.bomb.collision.gracePeriod);
        }
      }
    }

    // update grace periods for kicks
    this.kickGracePeriodMap.forEach((value, key) => {
      if (value > 0) {
        this.kickGracePeriodMap.set(key, value - 1);
      } else {
        this.kickGracePeriodMap.delete(key);
      }
    });

    // update bombs while deleting the ones that have exploded
    this.bombs = this.bombs.filter(bomb => {
      const exploded = bomb.update();
      if (exploded) {
        this.explodeBomb(bomb);
      };
      return !exploded;
    });

    // bombs explode by collision (not by time)
    this.bombs = this.bombs.filter(bomb => {
      let exploded = false;
      if (bomb.collision.deadly) {
        this.getAlivePlayers().filter(p => p.kickDurationLeft <= 0).forEach(player => {
          const dist = Math.hypot(player.pos.x - bomb.pos.x, player.pos.y - bomb.pos.y);
          if (dist < player.rule.radius + bomb.config.radius) {
            if (bomb.collision.kicker !== player.id
              && !(!this.gameRule.bomb.collision.friendlyFire && bomb.collision.kickerTeam === player.team)) {
              this.explodeBomb(bomb);
              this.textureStore.bombHitSound.play();
              exploded = true;
            }
          }
        });
      }
      return !exploded;
    });
  }

  private explodeBomb(bomb: BombPixi) {
    this.playExplosionSound();
    this.createExplosion(bomb.pos);

    this.getAlivePlayers().forEach(player => {
      const dist = Math.hypot(player.pos.x - bomb.pos.x, player.pos.y - bomb.pos.y);
      if (dist < player.rule.radius + bomb.config.explosionRadius) {
        this.killPlayer(player);
      }
    });

    bomb.container.destroy();
    
    // destroy tiles
    this.destroyTiles(bomb.pos, bomb.config.tileDestroyRadius);
  }

  private playExplosionSound() {
    const id = Math.floor(Math.random() * this.textureStore.explosionSounds.length);
    this.textureStore.explosionSounds[id].stop(); 
    this.textureStore.explosionSounds[id].play();
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
      const hitPlayers = players.filter(player => Math.hypot(player.pos.x - tile.pos.x, player.pos.y - tile.pos.y) < player.rule.groundRadius + this.gameRule.tiles.size / 2);
      hitPlayers.forEach(player => {
        playerTileCollisionMap.set(player, playerTileCollisionMap.get(player) || []);
        playerTileCollisionMap.get(player)!.push(tile);
        tile.setActive(true);
      });
    });

    // repair mechanic
    if (this.ctx.displayData.timeLeft > 0) {
      for (const player of players.filter(p => p.repairCounter >= this.gameRule.player.repairTime)) {
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
      if (this.gameRule.player.canFall) {
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
          if (dist < player.rule.groundRadius + this.gameRule.tiles.size / 2) {
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
  }

  checkKickBomb(team: number, playerId: number, playerPos: Pos, kickReach: number, kickPower: number) {
    // find bombs
    const hits = this.bombs
      .filter(bomb => bomb.time >= bomb.config.spawnTime)
      .map(bomb => ({
        bomb,
        dist: Math.hypot(bomb.pos.x - playerPos.x, bomb.pos.y - playerPos.y),
        dy: bomb.pos.y - playerPos.y,
        dx: bomb.pos.x - playerPos.x,
      }))
      .filter(hit => hit.dist < kickReach + this.gameRule.bomb.radius)
    ;

    const power = 0.5 + 0.5 / hits.length;
    hits.forEach(hit => {
      hit.bomb.speed = kickPower;
      hit.bomb.dir = Math.atan2(hit.dy, hit.dx);
      hit.bomb.kicked(playerId, team);
      
      const p = kickPower / (this.gameRule.player.kick.power * this.gameRule.player.kick.powerMult);
      let kickSoundIndex;
      if (this.ctx.gameRule.player.kick.charge.time > 1) {
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
  }
}
