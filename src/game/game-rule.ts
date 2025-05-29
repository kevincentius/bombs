
export interface GameRule {
  width: number;
  height: number;
  extraBound: number; // how far a player can enter enemy field
  roundTime: number;
  
  player: {
    speed: number;
    
    kick: {
      reach: number;
      power: number;
      powerMult: number;
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

    animation: {
      litTime: number;
      litBlinkIntervalInitial: number;
      litBlinkIntervalFinal: number;
      litOpacity: number;
      shakePower: number;
    };

    collision: {
      speedToKillPlayers: number; // if the bomb moves at this speed, it can kill players
      friendlyFire: boolean;
      gracePeriod: number; // period before the bomb can hit the kicker himself
    },
  },

  tiles: {
    rows: number;
    cols: number;
    size: number;
  }

  fourPlayers: boolean;
}
