import React from 'react';
import { render, waitFor, act } from '@testing-library/react-native';

jest.useFakeTimers();

// Mock locationConfig minimal (no locations needed)
jest.mock('../../data/locationConfig', () => ({
  locations: [],
}));

// Mock progress storage
jest.mock('../../utils/progressStorage', () => ({
  loadProgress: () => Promise.resolve({ completedLocationIds: [] }),
}));

// Provide a controlled npcConfigs so the NPC spawns at the player's initial spawn
const victorianMap = require('../../../assets/lpc-victorian-preview-see-readme/lpc-victorian-preview/victorian-preview.json');
const TILE_WIDTH = victorianMap.tilewidth;
const TILE_HEIGHT = victorianMap.tileheight;
const SPAWN_TILE_X = 56;
const SPAWN_TILE_Y = 53;
const SPAWN_X = SPAWN_TILE_X * TILE_WIDTH;
const SPAWN_Y = SPAWN_TILE_Y * TILE_HEIGHT;

jest.mock('../../data/npcConfig', () => ({
  npcConfigs: [
    {
      id: 'mage-guide',
      name: 'Mago',
      routeObjectName: undefined,
      // Use explicit numeric spawn coordinates for deterministic tests
      patrolPath: [
        { x: 1000, y: 1000 },
        { x: 1064, y: 1000 },
      ],
      speedPxPerTick: 2,
      arriveDistancePx: 2,
      proximityPaddingPx: 64,
      hitbox: { width: 32, height: 32, offsetX: 0, offsetY: 0 },
      sprite: {
          source: require('../../../assets/images/npc/mage-SWEN.png'),
        // Updated to match new NPC sprite frames (48x64)
        sheetWidth: 144,
        sheetHeight: 256,
        cols: 3,
        rows: 4,
        displayWidth: 48,
        displayHeight: 64,
        hitboxSize: 32,
        idleFrame: 1,
        directionRows: { up: 0, right: 1, down: 2, left: 3 },
      },
      dialogAvatarSource: require('../../../assets/images/npc/mage-SWEN-body.png'),
    },
  ],
}));

// Mock Player and FloatingJoystick and Npc to avoid render complexity
jest.mock('../../components/Player', () => () => null);
jest.mock('../../components/Npc', () => () => null);
jest.mock('../../components/FloatingJoystick', () => () => null);
// Note: do NOT mock PlayerDialog - we want to assert the real dialog text is rendered

jest.mock('@react-navigation/native', () => {
  const actual = jest.requireActual('@react-navigation/native');
  const React = require('react');
  return {
    ...actual,
    useFocusEffect: (callback) => {
      React.useEffect(() => callback(), [callback]);
    },
  };
});

const { processNpcTick, buildInitialNpcState } = require('../MapScreen');

describe('MapScreen NPC proximity (logic)', () => {
  it('processNpcTick returns a dialog when player is within proximity of a moving NPC', () => {
    // Build initial NPC states from mocked npcConfigs
    const npcConfigsModule = require('../../data/npcConfig');
    const npcStates = (npcConfigsModule.npcConfigs || []).map((cfg) => buildInitialNpcState(cfg));

    // Place player at the same spawn position as mocked patrolPath so proximity is immediate
    const playerPosition = { x: 1000, y: 1000 };

    const first = processNpcTick({
      npcStates,
      position: playerPosition,
      npcPausedMap: {},
      npcNearMap: {},
      now: Date.now(),
      npcPauseMs: 3000,
    });

    expect(first).toBeDefined();
    expect(Array.isArray(first.dialogs)).toBe(true);
    expect(first.dialogs.length).toBeGreaterThan(0);
    expect(first.dialogs[0].message).toMatch(/Oi! Espera um instante...|Oi!/i);

    // Still near: should not repeat dialog
    const second = processNpcTick({
      npcStates: first.newNpcStates,
      position: playerPosition,
      npcPausedMap: first.newNpcPausedMap,
      npcNearMap: first.newNpcNearMap,
      now: Date.now(),
      npcPauseMs: 3000,
    });

    expect(second.dialogs.length).toBe(0);

    // Move away: should register exit
    const farPosition = { x: 0, y: 0 };
    const third = processNpcTick({
      npcStates: second.newNpcStates,
      position: farPosition,
      npcPausedMap: second.newNpcPausedMap,
      npcNearMap: second.newNpcNearMap,
      now: Date.now(),
      npcPauseMs: 3000,
    });

    expect(third.exitedNpcIds).toContain('mage-guide');

    // Re-enter: dialog should show again
    const fourth = processNpcTick({
      npcStates: third.newNpcStates,
      position: playerPosition,
      npcPausedMap: third.newNpcPausedMap,
      npcNearMap: third.newNpcNearMap,
      now: Date.now(),
      npcPauseMs: 3000,
    });

    expect(fourth.dialogs.length).toBeGreaterThan(0);
  });
});
