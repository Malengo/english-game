# AGENTS.md - English Game Development Guide

## Project Overview

**English Game** is a gamified English learning game built with Expo and React Native. The current app is centered on a tile-based city map where the player explores locations, meets NPCs, starts educational missions, completes lessons, and unlocks later areas through saved progress.

**Vision:** turn English learning into a light RPG-style city adventure. Each location should feel like a meaningful place in the world and should teach a focused English topic through short interactive missions.

**Current focus:** city exploration, school color lesson, house mission placeholder, NPC interaction, location unlocking, and persistent lesson progress.

**Tech Stack:**
- React Native 0.81.5 with React 19.1.0
- Expo 54.0.33 for iOS, Android, and Web
- React Navigation 7.x with native stack navigation
- JavaScript codebase with TypeScript strict config available
- Jest + `@testing-library/react-native` for automated tests
- AsyncStorage for local progress persistence

## Architecture Essentials

### City & Mission System

The game currently has these core pieces:

1. **MapScreen** (`src/screens/MapScreen.js`): main city exploration screen.
2. **Tiled map assets:** `victorian-preview.json` and `victorian-preview.png` define the world size, background, collision layers, location points, and NPC route objects.
3. **Location config** (`src/data/locationConfig.js`): central list of available places and their mission routes.
4. **Mission screens:** location-specific learning screens such as `SchoolMissionScreen` and `HouseMissionScreen`.
5. **Progress storage** (`src/utils/progressStorage.js`): persists completed locations, lesson completions, daily mission data, and completed post-lesson missions.
6. **Map logic helpers** (`src/screens/mapScreen.logic.js`): pure movement, collision, stage, NPC, and mission helper functions that are covered by tests.

### Current Locations

Locations are configured in `src/data/locationConfig.js`.

Current entries:
- `school`: first/tutorial location, route `SchoolMission`, stage 1, teaches colors.
- `house`: unlocks after school, route `HouseMission`, stage 2, currently a simple placeholder mission.
- `bakery`: stage 3 location, route `BakeryMission`, currently a simple placeholder mission.

When adding or editing locations, keep `screenRoute` aligned with the route registered in `App.js`.

### Navigation Structure

`App.js` defines the native stack:

```javascript
<Stack.Screen name="MAPAS" component={MapScreen} />
<Stack.Screen name="SchoolMission" component={SchoolMissionScreen} options={{ title: "School" }} />
<Stack.Screen name="HouseMission" component={HouseMissionScreen} options={{ title: "Casa" }} />
```

Critical pattern:
- `MapScreen` detects when the player enters a location trigger.
- It opens a modal for available locations or a blocked modal for locked locations.
- Pressing "Continuar" calls `navigation.navigate(activeLocation.screenRoute, params)`.
- Mission screens call `navigation.goBack()` to return to the map.
- `MapScreen` refreshes progress on focus using `useFocusEffect`.

### Component Hierarchy

```text
App.js
`-- NavigationContainer
    `-- Stack.Navigator
        |-- MapScreen ("MAPAS")
        |   |-- Player
        |   |-- Npc
        |   |-- FloatingJoystick
        |   `-- PlayerDialog
        |-- SchoolMissionScreen ("SchoolMission")
        |-- HouseMissionScreen ("HouseMission")
        `-- BakeryMissionScreen ("BakeryMission")
```

Important components:
- `src/components/Player.js`: player sprite renderer. Supports sprite-sheet image mode and emoji fallback.
- `src/components/Npc.js`: NPC sprite renderer.
- `src/components/FloatingJoystick.js`: movement input.
- `src/components/PlayerDialog.js`: speech/dialog overlay for player and NPC messages.

## Data & Progress Flow

### Local State

The project does not use Redux or global React Context. Most state is screen-scoped with hooks.

`MapScreen` owns:
- Player position and movement direction.
- Active/blocked location modal state.
- NPC positions and proximity state.
- Dialog state.
- Completed locations and lesson mission progress loaded from storage.
- Active post-lesson collectibles.

Mission screens own their own quiz/progression UI state.

### Persistent Progress

Progress lives in `src/utils/progressStorage.js` under the AsyncStorage key `@english-game:progress:v1`.

Stored fields include:
- `completedLocationIds`
- `lessonCompletions`
- `completedLessonMissionIds`
- `lastSchoolVisit`
- `dailyMissionsDate`
- `dailyMissions`

Use the exported helpers instead of writing directly to AsyncStorage:
- `loadProgress`
- `saveProgress`
- `markLocationCompleted`
- `markSchoolVisited`
- `hasVisitedSchoolToday`
- `ensureDailyMissions`
- `markLessonCompleted`
- `markLessonMissionCompleted`
- `getLatestLessonCompletion`
- `hasCompletedLessonMission`

### Stage Unlocking

Stage calculation is in `calculateCurrentStage` from `src/screens/mapScreen.logic.js`.

Rule: completing a location unlocks the next stage after that location's `stageRequired`.

Example:
- Complete `school` at stage 1.
- Current stage becomes at least 2.
- `house` becomes available.

## Movement, Collision, and Map Behavior

### World Setup

`MapScreen` imports the Tiled JSON map:

```javascript
const victorianMapData = require("../../assets/lpc-victorian-preview-see-readme/lpc-victorian-preview/victorian-preview.json");
const MAP_BACKGROUND = require("../../assets/lpc-victorian-preview-see-readme/lpc-victorian-preview/victorian-preview.png");
```

World size is computed from map tile dimensions:

```javascript
const WORLD_WIDTH = victorianMapData.width * victorianMapData.tilewidth;
const WORLD_HEIGHT = victorianMapData.height * victorianMapData.tileheight;
```

### Player Movement

Movement is joystick-driven:
- `FloatingJoystick` calls `handleJoystickMove`.
- `moveVectorRef` stores the current movement vector.
- A movement interval resolves steps through `resolveMovementStep`.
- Direction state drives sprite animation: `up`, `right`, `down`, `left`.

The initial position is based on tile coordinates:

```javascript
const SPAWN_TILE_X = 56;
const SPAWN_TILE_Y = 53;
```

### Collision

Collision data comes from Tiled object layers whose names include `collision`.

Supported collision shapes:
- Rectangles
- Polygons

The player collision box is smaller than the visual sprite. Keep this intentional: it makes movement feel less sticky around buildings and map decorations.

Important helpers in `mapScreen.logic.js`:
- `resolveMovementStep`
- `collidesWithAnyShape`
- `getPlayerCollisionRect`
- `rectsOverlap`
- `getAabbRect`

### Location Triggers

Location trigger rectangles are built from Tiled object layers when a layer matching the location id exists. If no map point exists, the code falls back to `tileX`, `tileY`, `width`, and `height` from `locationConfig.js`.

Location entry actions are resolved with:

```javascript
resolveLocationEntryAction({
  isInside,
  wasInside,
  activeLocationId,
  blockedLocationId,
  currentStage,
  requiredStage,
});
```

Do not reintroduce hardcoded per-location collision checks in `MapScreen`; use the `locations` array and the Tiled map data.

## NPC System

NPC config lives in `src/data/npcConfig.js`.

NPC routes can come from the Tiled object layer named `npc_routes`. Route matching checks:
- `routeObjectName`
- NPC `id`
- NPC `name`

Important helpers:
- `buildInitialNpcState` in `MapScreen.js`
- `processNpcTick` in `MapScreen.js`
- `resolveNpcPatrolStep` in `mapScreen.logic.js`
- `isPlayerNearNpc` in `mapScreen.logic.js`

NPCs pause and show dialog when the player is nearby. Dialog selection prefers the closest NPC when more than one NPC enters proximity.

## Lesson and Mission Content

### School Lesson

The current school lesson is in `src/data/schoolColorsLesson.js`.

`SchoolMissionScreen`:
- Displays a short multiple-choice color lesson.
- Tracks selected answers and feedback locally.
- On completion, calls:
  - `markLocationCompleted("school")`
  - `markLessonCompleted({ lessonId, locationId: "school" })`
  - `markSchoolVisited()`
- Returns to the map with `navigation.goBack()`.

### Post-Lesson Mission Collectibles

`src/data/lessonMissionCatalog.js` defines follow-up collectible missions that can appear on the map after a lesson is completed.

`MapScreen` resolves the active lesson mission with:
- `resolveActiveLessonMission`
- `buildLessonMissionCollectibles`

When all collectibles for the active mission are collected, `markLessonMissionCompleted` is called.

## Development Workflows

### Getting Started

```bash
npm install
npm start
npm run android
npm run ios
npm run web
```

### Quality Commands

```bash
npm run lint
npm test
npm run test:watch
npm run test:coverage
npm run tdd
```

Use `npm run web` for the fastest manual gameplay feedback loop.

## Adding New Features

### Adding a New Location and Mission

1. Add the mission screen in `src/screens/`, for example `BakeryMissionScreen.js`.
2. Register the route in `App.js`.
3. Add or update the location entry in `src/data/locationConfig.js`.
4. If possible, add a matching Tiled object layer/object for the location id so the trigger uses map data.
5. Add mission content in `src/data/` if the mission has reusable data.
6. Update progress behavior if the mission should unlock later stages.
7. Add focused tests for the data, screen behavior, and any new pure logic.

Example route/config alignment:

```javascript
// App.js
<Stack.Screen name="BakeryMission" component={BakeryMissionScreen} />

// src/data/locationConfig.js
{
  id: "bakery",
  name: "Padaria",
  screenRoute: "BakeryMission",
  stageRequired: 3,
}
```

### Adding a New Lesson to an Existing Location

1. Create a data file in `src/data/`.
2. Add a mission screen or extend an existing one if the interaction pattern is the same.
3. Track completion through `markLessonCompleted`.
4. Add optional follow-up collectibles in `lessonMissionCatalog.js`.
5. Add tests before or alongside implementation.

### Adding Sound or Feedback

`expo-haptics` is already installed and can be used for tactile feedback on mobile.

Audio is not currently configured. Adding audio would likely require installing and wiring an Expo audio package.

## File Organization

```text
english-game/
|-- App.js
|-- app.json
|-- package.json
|-- AGENTS.md
|-- README.md
|-- assets/
|   |-- images/
|   `-- lpc-victorian-preview-see-readme/
|-- src/
|   |-- components/
|   |   |-- FloatingJoystick.js
|   |   |-- Npc.js
|   |   |-- Player.js
|   |   |-- PlayerDialog.js
|   |   `-- __tests__/
|   |-- data/
|   |   |-- alphabet.js
|   |   |-- lessonMissionCatalog.js
|   |   |-- locationConfig.js
|   |   |-- npcConfig.js
|   |   |-- schoolColorsLesson.js
|   |   `-- __tests__/
|   |-- screens/
|   |   |-- BakeryMissionScreen.js
|   |   |-- HouseMissionScreen.js
|   |   |-- LoginScreen.js
|   |   |-- MapScreen.js
|   |   |-- SchoolMissionScreen.js
|   |   |-- mapScreen.logic.js
|   |   `-- __tests__/
|   |-- services/
|   |   `-- authService.js
|   `-- utils/
|       |-- progressStorage.js
|       `-- __tests__/
|-- __mocks__/
`-- prompts/
```

## Code Style & Conventions

- Prefer existing local patterns over introducing a new architecture.
- Keep gameplay comments in Portuguese when they explain player-facing behavior.
- Keep route names and `screenRoute` values synchronized.
- Use `locationConfig.js` for locations; avoid hardcoded location-specific trigger logic.
- Use pure helpers in `mapScreen.logic.js` for logic that should be tested.
- Use AsyncStorage only through `progressStorage.js` helpers.
- Keep `testID` values stable; they are part of the test contract.
- Inline styles are common in this app. Use them consistently unless a screen grows enough to justify extraction.
- The active app code lives in `src/`. Root template folders/files should not be treated as gameplay code unless they are wired into `App.js`.

## Sprite System

`Player.js` supports two render modes:

1. **Sprite-sheet image mode** with `useImage={true}`.
2. **Emoji fallback mode** with `useImage={false}`.

Current map usage passes `useImage={true}` and expects:

```text
assets/images/player.png
```

The player sheet is treated as a 3x4 grid:
- 3 columns of frames
- 4 rows of directions
- Direction row order: `up`, `right`, `down`, `left`

If changing sprite dimensions, update the constants in `Player.js` and adjust tests if needed.

## Testing Conventions

Use `@testing-library/react-native`.

Guidelines:
- Prefer user-facing queries (`getByText`, accessibility queries) for visible UI.
- Use `testID` for sprites, map overlays, and non-text visual elements.
- Keep `testID` in `kebab-case`.
- Add tests for pure map logic in `src/screens/__tests__/mapScreen.logic.test.js`.
- Add component tests next to component behavior in `src/components/__tests__/`.
- Add progress persistence tests in `src/utils/__tests__/progressStorage.test.js`.

Existing useful test areas:
- Player rendering and animation contract.
- NPC rendering and proximity behavior.
- Location config validation.
- Map entry/progression integration.
- Mission screen completion behavior.
- Progress storage normalization and updates.

## Debugging Tips

- **Map position:** use the debug HUD in development mode to inspect player coordinates and current stage.
- **Collision:** inspect Tiled collision object layers first, then verify the player's smaller collision box.
- **Locations:** confirm the location id matches the Tiled object layer name or that fallback `tileX`/`tileY` data is valid.
- **Navigation:** confirm `screenRoute` exists in `App.js`.
- **Progress:** clear AsyncStorage or use tests when validating unlock flow from scratch.
- **Web testing:** run `npm run web` for quick iteration.
- **Device testing:** run `npm start` and use Expo Go or a development build.

## Known Maintenance Notes

- The README may still describe older alphabet-focused behavior in places. Prefer this file and the current source code when they differ.
- `BakeryMissionScreen.js` is currently a placeholder and needs a real vocabulary mission.
- `LoginScreen.js` and `authService.js` exist, but login is not wired into `App.js`.
- Some older docs or files may contain broken UTF-8 display artifacts. New edits should use clean UTF-8 or plain ASCII consistently.
