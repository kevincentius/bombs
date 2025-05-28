import { GameRule } from "../../../game/game-rule";

interface GameOption {
  caption: string;
  values: GameOptionValue[];
  defaultIndex: number;
  applier: (gameRule: GameRule, value: number) => void;
  advanced?: boolean;
}

interface GameOptionValue {
  label: string;
  value: number;
}

export const gameOptions: GameOption[] = [
  {
    caption: 'Game length',
    values: [
      { label: '30s', value: 30 },
      { label: '60s', value: 60 },
      { label: '90s', value: 90 },
      { label: '150s', value: 120 },
    ],
    defaultIndex: 2,
    applier: (gameRule, value) => { gameRule.roundTime = value; }
  },

  {
    caption: 'Repair speed',
    values: [
      { label: 'Fast', value: 14 },
      { label: 'Normal', value: 20 },
      { label: 'Slow', value: 30 },
      { label: 'Disabled', value: 999999999 },
    ],
    defaultIndex: 1,
    applier: (gameRule, value) => { gameRule.repairTime = value; },
    advanced: true,
  },

  {
    caption: 'Respawn speed',
    values: [
      { label: 'Fast', value: 240 },
      { label: 'Normal', value: 480 },
      { label: 'Slow', value: 720 },
    ],
    defaultIndex: 1,
    applier: (gameRule, value) => { gameRule.respawnTime = value; },
    advanced: true,
  },

  {
    caption: 'Bombs amount at start',
    values: [
      { label: 'Few', value: 120 },
      { label: 'Normal', value: 60 },
      { label: 'Many', value: 30 },
    ],
    defaultIndex: 0,
    applier: (gameRule, value) => { gameRule.bombSpawnIntervalInitial = value; },
    advanced: true,
  },

  {
    caption: 'Bombs amount at end',
    values: [
      { label: 'Few', value: 120 },
      { label: 'Normal', value: 60 },
      { label: 'Many', value: 30 },
    ],
    defaultIndex: 2,
    applier: (gameRule, value) => { gameRule.bombSpawnIntervalFinal = value; },
    advanced: true,
  },

  {
    caption: 'Bomb time before explosion',
    values: [
      { label: 'Short', value: 30 },
      { label: 'Normal', value: 60 },
      { label: 'Long', value: 90 },
    ]
  }
];
