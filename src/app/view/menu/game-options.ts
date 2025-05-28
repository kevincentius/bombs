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
    caption: 'Player movement speed',
    values: [
      { label: 'Slow', value: 1.5 },
      { label: 'Normal', value: 2.5 },
      { label: 'Fast', value: 3.5 },
    ],
    defaultIndex: 1,
    applier: (gameRule, value) => { gameRule.playerSpeed = value; },
    advanced: true,
  },

  {
    caption: 'Allow entering opponent field',
    values: [
      { label: 'No', value: 0 },
      { label: 'A little', value: 50 },
      { label: 'Half way', value: 200 },
      { label: 'Freely', value: 400 },
    ],
    defaultIndex: 1,
    applier: (gameRule, value) => { gameRule.extraBound = value; },
  },

  {
    caption: 'Kick cooldown',
    values: [
      { label: 'Slow', value: 90 },
      { label: 'Normal', value: 60 },
      { label: 'Fast', value: 45 },
      { label: 'Very Fast', value: 30 },
    ],
    defaultIndex: 1,
    applier: (gameRule, value) => { gameRule.kickCooldown = value; },
    advanced: true,
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
      { label: 'Short', value: 3 },
      { label: 'Normal', value: 4 },
      { label: 'Long', value: 6.5 },
      { label: 'Very Long', value: 10 },
    ],
    defaultIndex: 1,
    applier: (gameRule, value) => gameRule.bomb.explosionDelay = value * 60,
    advanced: true,
  },

  {
    caption: 'Bomb explosion radius',
    values: [
      { label: 'Small', value: 20 },
      { label: 'Normal', value: 30 },
      { label: 'Big', value: 45 },
      { label: 'Huge', value: 70 },
    ],
    defaultIndex: 1,
    applier: (gameRule, value) => { gameRule.bomb.explosionRadius = value; },
    advanced: true,
  },

  {
    caption: 'Bomb tile destruction radius',
    values: [
      { label: 'Small', value: 20 },
      { label: 'Normal', value: 30 },
      { label: 'Big', value: 45 },
      { label: 'Huge', value: 70 },
    ],
    defaultIndex: 1,
    applier: (gameRule, value) => { gameRule.bomb.tileDestroyRadius = value; },
    advanced: true,
  },
];
