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

const textureStore = new TextureStore();
const inputHandler = new InputHandler();

const initPromise = Promise.all([
  textureStore.init(),
]);

export function test() {
  console.log('hello');
}

export class GameContext {
  displayData: DisplayData;
  textureStore = textureStore;
  appPixi: AppPixi;
  inputHandler = inputHandler;
  winner: number | null = null; // -1 for left, 1 for right, 0 for draw, null for ongoing game

  constructor(
    private canvas: HTMLCanvasElement,
    public gameRule: GameRule,
  ) {
    this.appPixi = new AppPixi(this, this.canvas, this.textureStore);

    this.displayData = {
      teams: [
        { score: 0 },
        { score: 0 },
      ],
      timeLeft: this.gameRule.roundTime,
    };
  }

  async init() {
    await initPromise;
    await this.appPixi.init();
  }
  
  newGame() { return new GamePixi(this, this.textureStore); }
  newField() { return new FieldPixi(this, this.gameRule, this.textureStore); }
  newPlayer(texture: Texture, boundary: PlayerBoundary, settings: PlayerSettings, team: number, id: number) { return new PlayerPixi(this, texture, this.inputHandler, boundary, settings, team, id); }
  newBomb(pos: Pos) { return new BombPixi(this.textureStore, this.gameRule, pos ); }

  destroy() {
    this.appPixi.app.stop();
    this.appPixi.app.destroy();
  }
}
