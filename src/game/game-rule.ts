
export interface GameRule {
  width: number;
  height: number;
  extraBound: number; // how far a player can enter enemy field
  roundTime: number;
  
  playerSpeed: number;
  kickPower: number;
  kickCooldown: number;
  kickChargeTime: number; // how long it takes to charge a full strength kick. 0 means instant (no power control)
  kickOverchargedIsWeaker: boolean;
  kickChargePrecisionExp: number; // 1 = linear. Higher means more precision needed for a full charge.

  repairTime: number;
  repairTiles: number;

  respawnTime: number; // if die

  bombSpawnIntervalInitial: number;
  bombSpawnIntervalFinal: number;
  resetBombTimerOnKick: number;

  canFall: boolean;

  bomb: {
    spawnTime: number;
    explosionDelay: number;
    vMult: number;
    vDeccel: number;
    radius: number;
    explosionRadius: number;
    tileDestroyRadius: number;
  },

  tiles: {
    rows: number;
    cols: number;
    size: number;
  }

  fourPlayers: boolean;
}
