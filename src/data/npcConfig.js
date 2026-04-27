// src/data/npcConfig.js

export const npcConfigs = [
  {
    id: "mage-guide",
    name: "Mago",
    routeObjectName: "mage--Swen",
    patrolPath: [
      { x: 1500, y: 1180 },
      { x: 1650, y: 1180 },
      { x: 1650, y: 1320 },
      { x: 1500, y: 1320 },
    ],
    speedPxPerTick: 2,
    arriveDistancePx: 2,
    proximityPaddingPx: 18,
    hitbox: {
      width: 32,
      height: 32,
      offsetX: 0,
      offsetY: 0,
    },
    sprite: {
      source: require("../../assets/images/npc/mage-SWEN.png"),
      sheetWidth: 96,
      sheetHeight: 128,
      cols: 3,
      rows: 4,
      displayWidth: 32,
      displayHeight: 32,
      hitboxSize: 32,
      idleFrame: 1,
      directionRows: {
        up: 0,
        right: 1,
        down: 2,
        left: 3,
      },
    },
  },
];

