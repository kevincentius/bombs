
export interface GameRule {
  width: number;
  height: number;
  extraBound: number; // how far a player can enter enemy field
  roundTime: number;
  
  playerSpeed: number;
  kickPower: number;
  kickCooldown: number;

  repairTime: number;
  repairTiles: number;

  respawnTime: number; // if die

  bombSpawnIntervalInitial: number;
  bombSpawnIntervalFinal: number;
  bombKickExplosionDelay: number;

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
