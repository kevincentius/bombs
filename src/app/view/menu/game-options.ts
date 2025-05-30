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
      { label: '15s', value: 15 },
      { label: '30s', value: 30 },
      { label: '60s', value: 60 },
      { label: '90s', value: 90 },
      { label: '150s', value: 120 },
    ],
    defaultIndex: 3,
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
    applier: (gameRule, value) => { gameRule.player.speed = value; },
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
    advanced: true,
  },

  {
    caption: 'Kick type',
    values: [
      { label: 'Simple', value: 0 },
      { label: 'Hold to charge', value: 1 },
      { label: 'Precision charge', value: 2 },
    ],
    defaultIndex: 0,
    applier: (gameRule, value) => {
      if (value === 0) {
        gameRule.player.kick.cooldown = 60;
        gameRule.player.kick.charge.time = 0;
        gameRule.player.kick.power = 8;
      } else if (value === 1){
        gameRule.player.kick.cooldown = 1;
        gameRule.player.kick.charge.time = 90;
        gameRule.player.kick.power = 12;
        gameRule.player.kick.charge.overchargedIsWeaker = false;
        gameRule.player.kick.charge.precisionExp = 1;
      } else if (value === 2){
        gameRule.player.kick.cooldown = 1;
        gameRule.player.kick.charge.time = 60;
        gameRule.player.kick.power = 10;
        gameRule.player.kick.charge.overchargedIsWeaker = true;
        gameRule.player.kick.charge.precisionExp = 5;
      }
    },
  },

  {
    caption: 'Kick power',
    values: [
      { label: 'Weak', value: 0.75 },
      { label: 'Normal', value: 1 },
      { label: 'Strong', value: 1.5 },
      { label: 'Very Strong', value: 2 },
    ],
    defaultIndex: 1,
    applier: (gameRule, value) => { gameRule.player.kick.powerMult = value; },
    advanced: true,
  },

  {
    caption: 'Repair speed',
    values: [
      { label: 'Fast', value: 8 },
      { label: 'Normal', value: 14 },
      { label: 'Slow', value: 24 },
      { label: 'Disabled', value: 999999999 },
    ],
    defaultIndex: 1,
    applier: (gameRule, value) => { gameRule.player.repairTime = value; },
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
    applier: (gameRule, value) => { gameRule.player.respawnTime = value; },
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
    applier: (gameRule, value) => { gameRule.bombSpawner.intervalInitial = value; },
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
    applier: (gameRule, value) => { gameRule.bombSpawner.intervalFinal = value; },
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
    caption: 'Delay bomb explosion after a kick',
    values: [
      { label: 'No', value: 0 },
      { label: 'Yes', value: 1 },
    ],
    defaultIndex: 0,
    applier: (gameRule, value) => { gameRule.bomb.resetTimerOnKick = value; },
    advanced: true,
  },

  {
    caption: 'Bomb explode on collision',
    values: [
      { label: 'No', value: 999999999 },
      { label: 'Yes', value: 4 },
    ],
    defaultIndex: 1,
    applier: (gameRule, value) => { gameRule.bomb.collision.speedToKillPlayers = value; },
    advanced: true,
  },

  {
    caption: 'Friendly fire',
    values: [
      { label: 'No', value: 0 },
      { label: 'Yes', value: 1 },
    ],
    defaultIndex: 1,
    applier: (gameRule, value) => { gameRule.bomb.collision.friendlyFire = value !== 0; },
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
