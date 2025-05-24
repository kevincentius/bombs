
export interface GameRule {
  width: number;
  height: number;
  roundTime: number;
  kickPower: number;

  bombSpawnIntervalInitial: number;
  bombSpawnIntervalFinal: number;
  bombKickExplosionDelay: number;

  tiles: {
    rows: number;
    cols: number;
    size: number;
  }
}
