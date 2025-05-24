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
    this.createExplosion({ x: 400, y: 200});
    this.container.sortableChildren = true; // enable sorting for z-index management
    
    this.container.addChild(this.tileContainer);
    this.createPlayers();
    this.container.addChild(this.playerContainer);
    this.container.addChild(this.bombContainer);

    for (let i = 0; i < this.gameRule.tiles.rows; i++) {
      for (let j = 0; j < this.gameRule.tiles.cols; j++) {
        const tilePos: Pos = {
          x: j * this.gameRule.tiles.size + this.gameRule.tiles.size / 2,
          y: i * this.gameRule.tiles.size + this.gameRule.tiles.size / 2,
        };
        const tile = new TilePixi(this.ctx.textureStore, tilePos);
        this.tiles[i] = this.tiles[i] || [];
        this.tiles[i][j] = tile;
        this.tileContainer.addChild(tile.container);
      }
    }
  }

  createPlayers() {
    const boundaryLeft = { xMin: 0, xMax: 400, yMin: 0, yMax: 400 };
    const boundaryRight = { xMin: 400, xMax: 800, yMin: 0, yMax: 400 };

    const p1Settings: PlayerSettings = {
      controls: {
        DOWN: 's',
        UP: 'w',
        LEFT: 'a',
        RIGHT: 'd',
        ACTION: ' ',
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
        ACTION: ';',
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
    this.addPlayer(this.ctx.newPlayer(this.textureStore.players[2], boundaryLeft, p3Settings, -1));
    this.addPlayer(this.ctx.newPlayer(this.textureStore.players[3], boundaryRight, p4Settings, 1));
  }

  update() {
    this.updatePlayers();

    this.spawnBomb();
    this.updateBombs();
    this.updateTiles();

    if (this.players.length === 0 || this.ctx.displayData.timeLeft <= 0) {
      this.ctx.gamePixi.game.gameOver();
    }
  }

  updatePlayers() {
    this.players.forEach(player => {
      player.update();
      this.container.addChild(player.container);
    });
  }

  spawnBomb() {
    this.spawnInterval = this.ctx.displayData.timeLeft / this.gameRule.roundTime * (this.gameRule.bombSpawnIntervalInitial - this.gameRule.bombSpawnIntervalFinal) + this.gameRule.bombSpawnIntervalFinal;
    this.spawnCounter++;
    if (this.spawnCounter >= this.spawnInterval) {
      this.spawnCounter -= this.spawnInterval;

      // spawn a new bomb at a random position
      const x = Math.random() * 800; // assuming field width is 800
      const y = Math.random() * 400; // assuming field height is 400
      const bomb = this.ctx.newBomb({ x, y });
      this.bombs.push(bomb);
      this.bombContainer.addChild(bomb.container);
    }
  }

  updateBombs() {
    // update bombs while deleting the ones that have exploded
    this.bombs = this.bombs.filter(bomb => {
      const exploded = bomb.update();
      if (exploded) {
        this.createExplosion(bomb.pos);

        this.players = this.players.filter(player => {
          const dist = Math.hypot(player.x - bomb.pos.x, player.y - bomb.pos.y);
          if (dist < player.radius + 20) {
            player.container.destroy();
            return false;
          }
          return true;
        });

        // destroy tiles
        this.destroyTiles(bomb.pos, bomb.config.radius);
      };
      return !exploded;
    });
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
    this.tiles.flat().forEach(tile => tile.setActive(false));

    // players are marked as safe if they stand on a tile
    const unsafePlayers = new Set(this.players);
    let count = 0;
    let scoreMap = new Map<number, number>();
    scoreMap.set(-1, 0);
    scoreMap.set(1, 0);

    for (const row of this.tiles) {
      for (const tile of row) {
        if (!tile.alive) continue; // skip destroyed tiles
        const team = tile.pos.x < 400 ? -1 : 1;
        scoreMap.set(team, (scoreMap.get(team)!) + 1); // count tiles per team

        for (const player of this.players) {
          const dist = Math.hypot(player.x - tile.pos.x, player.y - tile.pos.y);
          if (dist < player.radius + this.gameRule.tiles.size / 2) {
            tile.setActive(true); // activate tile if player is close
            unsafePlayers.delete(player); // player is safe on tile
            count++;
          }
        }
      }
    }

    // kill unsafe players
    for (const player of unsafePlayers) {
      // if player is not safe, destroy their container
      player.container.destroy();
      this.players = this.players.filter(p => p !== player); // remove from players list
      this.createSmallExplosion({ x: player.x, y: player.y }); // create small explosion at player position
    }
    this.players = this.players.filter(p => !unsafePlayers.has(p));

    // update score
    this.ctx.displayData.teams[0].score = scoreMap.get(-1)!; // left team score
    this.ctx.displayData.teams[1].score = scoreMap.get(1)!; // right team score
  }

  createExplosion(pos: Pos) {
    const movie = new AnimatedSprite({
      textures: this.textureStore.explosion,
    });
    movie.position.set(pos.x, pos.y);
    movie.anchor.set(0.5, 0.8);
    movie.animationSpeed = 0.5;
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
    
    player.subjKick.subscribe(() => {
      this.kickBomb({x: player.x, y: player.y}, player.team);
    });
  }

  kickBomb(playerPos: Pos, team: number) {
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
      hit.bomb.speed = this.gameRule.kickPower;
      hit.bomb.dir = Math.atan2(hit.dy, hit.dx);
      hit.bomb.kicked();
      
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
