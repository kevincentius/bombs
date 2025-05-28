import { Injectable } from '@angular/core';
import { GameRule } from '../../game/game-rule';

const defaultGameRule: GameRule = {
  width: 800,
  height: 400,
  extraBound: 50,
  
  roundTime: 90,

  playerSpeed: 2.5,
  kickPower: 8,
  kickCooldown: 60,
  repairTime: 20,
  repairTiles: 1,

  respawnTime: 480,

  bombSpawnIntervalInitial: 120,
  bombSpawnIntervalFinal: 30,
  bombKickExplosionDelay: 0 / (1000 / 60),

  bomb: {
    spawnTime: 1000 / (1000 / 60),
    explosionDelay: 4000 / (1000 / 60),
    vMult: 0.99,
    vDeccel: 0.01,
    radius: 20,
    explosionRadius: 30,
    tileDestroyRadius: 20,
  },
  
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
