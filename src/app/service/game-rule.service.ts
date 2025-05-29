import { Injectable } from '@angular/core';
import { GameRule } from '../../game/game-rule';

const defaultGameRule: GameRule = {
  width: 800,
  height: 400,
  extraBound: 50,
  
  roundTime: 90,

  player: {
    speed: 2.5,
    kick: {
      reach: 60,
      power: 8,
      cooldown: 60,
      charge: {
        time: 90,
        overchargedIsWeaker: true,
        precisionExp: 1,
      },
    },

    repairTime: 20,
    repairTiles: 1,

    canFall: false,
    respawnTime: 480,
  },
  
  bombSpawner: {
    intervalInitial: 120,
    intervalFinal: 30,
  },

  bomb: {
    spawnTime: 1000 / (1000 / 60),
    explosionDelay: 4000 / (1000 / 60),
    vMult: 0.99,
    vDeccel: 0.01,
    radius: 16,
    explosionRadius: 30,
    tileDestroyRadius: 20,

    resetTimerOnKick: 0, // 0 - 1

    collision: {
      speedToKillPlayers: 4, // if the bomb moves at this speed, it can kill players
      friendlyFire: true, // if true, players can kick bombs into each other
      gracePeriod: 10,
    },

    animation: {
      shakePower: 2,
      litTime: 180,
      litBlinkIntervalInitial: 12,
      litBlinkIntervalFinal: 4,
      litOpacity: 0.9,
    },
  },
  
  tiles: {
    rows: 25,
    cols: 50,
    size: 16,
  },
  
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
  
  applyGameRuleFromJson(gameOptionsJson: string) {
    try {
      const parsedRule = JSON.parse(gameOptionsJson);
      this.gameRule = { ...defaultGameRule, ...parsedRule };
    } catch (e) {
      alert('Invalid game rule JSON: ' + e);
      this.applyDefaultGameRule();
    }
  }
}
