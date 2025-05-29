
export interface GameRule {
  width: number;
  height: number;
  extraBound: number; // how far a player can enter enemy field
  roundTime: number;
  
  player: {
    speed: number;
    
    kick: {
      power: number;
      cooldown: number;
      charge: {
        time: number; // how long it takes to charge a full strength kick. 0 means instant (no power control)
        precisionExp: number; // 1 = linear. Higher means more precision needed for a full charge.
        overchargedIsWeaker: boolean;
      },
    }
    repairTime: number;
    repairTiles: number;

    canFall: boolean;
    respawnTime: number; // if die
  };

  bombSpawner: {
    intervalInitial: number;
    intervalFinal: number;
  };

  bomb: {
    spawnTime: number;
    explosionDelay: number;
    vMult: number;
    vDeccel: number;
    radius: number;
    explosionRadius: number;
    tileDestroyRadius: number;
    resetTimerOnKick: number;
  },

  tiles: {
    rows: number;
    cols: number;
    size: number;
  }

  fourPlayers: boolean;
}
