import { Injectable } from '@angular/core';
import { GameRule } from '../../game/game-rule';

const defaultGameRule: GameRule = {
  width: 800,
  height: 400,
  
  roundTime: 90,

  kickPower: 8,
  repairTime: 20,
  repairTiles: 1,

  respawnTime: 480,

  bombSpawnIntervalInitial: 120,
  bombSpawnIntervalFinal: 30,
  bombKickExplosionDelay: 0 / (1000 / 60),

  tiles: {
    rows: 20,
    cols: 40,
    size: 20,
  },
  
  canFall: false,
  fourPlayers: false,
};

@Injectable({
  providedIn: 'root'
})
export class GameRuleService {

  gameRule?: GameRule;

  constructor() {}

  applyDefaultGameRule() {
    this.gameRule = { ...defaultGameRule };
  }
}
