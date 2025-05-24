import { Texture } from "pixi.js";
import { AppPixi } from "../pixi/app-pixi";
import { BombPixi } from "../pixi/bomb-pixi";
import { FieldPixi } from "../pixi/field-pixi";
import { GamePixi } from "../pixi/game-pixi";
import { PlayerBoundary, PlayerPixi } from "../pixi/player-pixi";
import { DisplayData } from "./display-data";
import { GameRule } from "./game-rule";
import { InputHandler } from "./input-handler";
import { PlayerSettings } from "./player-settings";
import { TextureStore } from "./texture";
import { Pos } from "./types";

export class GameContext {
  gameRule: GameRule = {
    width: 800,
    height: 400,
    
    roundTime: 15,

    kickPower: 8,

    bombSpawnIntervalInitial: 180,
    bombSpawnIntervalFinal: 30,
    bombKickExplosionDelay: 0,
    
    tiles: {
      rows: 20,
      cols: 40,
      size: 20,
    }
  };
  displayData: DisplayData = {
    teams: [
      { score: 0 },
      { score: 0 },
    ],
    timeLeft: this.gameRule.roundTime,
  };
  textureStore = new TextureStore();
  gamePixi: AppPixi;
  inputHandler = new InputHandler();

  constructor(
    private canvas: HTMLCanvasElement,
  ) {
    this.gamePixi = new AppPixi(this, this.canvas, this.textureStore);
  }

  async init() {
    await this.textureStore.init();
    await this.gamePixi.init();
  }
  
  newGame() { return new GamePixi(this, this.textureStore); }
  newField() { return new FieldPixi(this, this.gameRule, this.textureStore); }
  newPlayer(texture: Texture, boundary: PlayerBoundary, settings: PlayerSettings, team: number) { return new PlayerPixi(this, texture, this.inputHandler, boundary, settings, team); }
  newBomb(pos: Pos) { return new BombPixi(this.textureStore, this.gameRule, pos ); }
}
