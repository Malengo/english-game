# AGENTS.md - English Game Development Guide

## Project Overview

**English Game** is a gamified English learning mobile game built with Expo that teaches alphabet letters through interactive missions. The core architecture implements a **city exploration system** where players navigate a virtual city map with multiple districts/locations, each containing educational missions. Players progress by exploring different areas, triggering location-based missions, and completing challenges to earn XP and coins.

**Vision:** Transform English learning into an RPG-like adventure where exploring a city unlocks different lesson areas and mission types.

**Tech Stack:**
- React Native 0.81.5 with React 19.1.0
- Expo 54.0.33 for cross-platform deployment (iOS, Android, Web)
- React Navigation 7.x for native stack navigation
- TypeScript (strict mode enabled) for type safety
- ESLint with Expo config for code quality

## Architecture Essentials

### City & Mission System (Core Concept)
The game centers on **city exploration with location-based missions**:

1. **City Map (MapScreen):** Main world where player explores and moves between locations
2. **City Locations/Districts:** Fixed areas (School, Library, Park, Town Square, etc.) rendered as collision boxes
3. **Mission Triggering:** Entering a location's collision zone navigates to a mission screen
4. **Mission Screens:** Each location has an associated learning screen with specific missions
5. **Progression:** Completing missions grants XP/coins, unlocking new areas or challenges

**Current Implementation:** Only one location (School/"Escola") is implemented. Future expansion will add multiple districts with different mission types.

### Navigation Structure
The app uses React Navigation's native stack navigator:
- **MapScreen** (`src/screens/MapScreen.js`): City exploration with player movement and collision detection
- **SchoolScreen** (`src/screens/SchoolScreen.js`): Mission interface (alphabet learning - prototype)

Entry point: `App.js` sets up NavigationContainer and Stack.Navigator with routes "Mapa" and "Escola".

**Critical Pattern:** When player enters a location's collision zone, `MapScreen` detects it via `useEffect` and calls `navigation.navigate("Escola")`. After completing the mission, `navigation.goBack()` returns to the map.

### State Management & Data Flow
- **No Redux/Context** - Uses React hooks (`useState`, `useEffect`) at screen level
- **Map Position State:** Stored in MapScreen as `{x: number, y: number}` coordinates
- **Mission Progress:** Each mission screen tracks progress independently (e.g., alphabet index in SchoolScreen)
- **Collision Detection:** `useEffect` in MapScreen monitors position changes and triggers navigation when player enters a location zone

**Location Collision Zones:**
Currently only one location (School) is defined:
```javascript
escolaArea = { x: 200, y: 100, width: 80, height: 80 } // Hard-coded in MapScreen.js
```
**Future:** This should be refactored to a `locations` array for multiple districts:
```javascript
const locations = [
  { id: "school", name: "Escola", x: 200, y: 100, width: 80, height: 80, route: "Escola", icon: "📚" },
  { id: "library", name: "Biblioteca", x: 400, y: 150, width: 80, height: 80, route: "Library", icon: "📖" },
  { id: "park", name: "Parque", x: 100, y: 300, width: 80, height: 80, route: "Park", icon: "🌳" },
  // ... more locations
];
```

### Component Hierarchy
```
App.js
└── NavigationContainer
    └── Stack.Navigator
        ├── MapScreen (screen "Mapa") - City exploration
        │   └── Player (positioned component)
        └── Mission Screens (screen "Escola", "Library", etc.)
            └── Location-specific missions
```

- **Player Component** (`src/components/Player.js`): Stateless sprite component with emoji-based character display. Props: `x`, `y`, `direction` ('up'/'down'/'left'/'right'), `character` (emoji string)
- **Data Layer** (`src/data/alphabet.js`): Simple export of alphabet array - single source of truth for current mission content

## Development Workflows

### Getting Started
```bash
npm install           # Install dependencies
npm start             # Start Expo Metro and display menu
npm run android       # Build Android target
npm run ios           # Build iOS target
npm run web           # Run web version
npm run lint          # Run ESLint (Expo config)
```

### Key Commands
- `expo start`: Opens interactive menu - press `a` for Android, `i` for iOS, `w` for web
- `npm run reset-project`: Resets to blank project (moves current code to app-example)

### Code Quality
- **Linting:** `npm run lint` - enforces Expo ESLint rules
- **TypeScript:** Strict mode enabled (`tsconfig.json`) but codebase is still JS
- **File Structure:** `.ts`/`.tsx` files compiled alongside `.js` files

## Project-Specific Patterns

### Movement & Collision System
MapScreen implements custom collision detection:
1. Player starts at `{x: 50, y: 100}`
2. Arrow buttons call `move(dx, dy, direction)` to update position by fixed increments (10px per press) and track last direction
3. `useEffect` on position changes checks if player is inside school collision box
4. Boolean calculation: `x > schoolX && x < schoolX + width && y > schoolY && y < schoolY + height`

**Player Direction Tracking:**
- State `lastDirection` tracks the last movement direction ('up', 'down', 'left', 'right')
- State `isMoving` tracks whether animation should play (set to true during move, false after 200ms)
- Passed to Player component to enable directional sprite feedback and animation
- Used for future: directional animation frames, facing direction on stop

**When Modifying:**
- Keep collision calculation in `useEffect` dependency array: `[position, navigation]`
- Movement increments are hardcoded - consider extracting to constants if adding difficulty levels
- School area bounds must be updated if changing layout
- Direction and isMoving props enable sprite animation implementation
- Animation timeout is 200ms per move - adjust if changing movement speed

### Screen-Scoped State
Each screen manages its own state independently:
- No shared state between screens - navigation passes control, not data
- Use navigation params (`navigation.navigate()`, `navigation.goBack()`) only for navigation flow
- Mission progress resets when returning to map (by design - sessions are independent)
- Each location is a fresh experience

### Gamification Mechanics (Current & Future)
Current implementation shows basic reward system in SchoolScreen:
```javascript
// After completing all letters
alert("Você ganhou XP + moedas!");
```

**Future Expansion:**
- XP tracking system (persist across locations)
- Coin/currency rewards per mission
- Unlock new locations based on level
- Daily missions
- Achievement system
- Mission difficulty levels

### Styling Conventions
- **Inline styles** preferred over StyleSheet for simple layouts
- Flexbox for layout (`flex: 1`, `justifyContent`, `alignItems`)
- Absolute positioning for game elements (Player, school area)
- Color scheme: `#ddd` (map background), `orange` (school), `blue` (player), `#E6F4FE` (Android adaptive icon background)

### Character/Sprite System
**Current Implementation:** Emoji-based character display with animation support
- Player rendered as emoji (🧑‍🦱 by default) inside a 40x40px circle
- Semi-transparent blue background: `rgba(100, 150, 255, 0.3)`
- Props support: `x`, `y`, `direction`, `character` (emoji string), `isMoving`, `useImage`
- **Animation:** Opacity flicker when moving (frameIndex cycles through 4 frames at 100ms intervals)

**Available Character Emojis:**
- 🧑‍🦱 Person with hair (current)
- 🧔 Bearded man
- 👨 Man
- 👩 Woman
- 🧙 Mage/Wizard
- 🗡️ Swordsman

**To Change Character:**
Update `character` prop in MapScreen: `<Player ... character="🧙" />`

**To Enable Animation:**
```javascript
// In MapScreen, the move() function now sets isMoving state
const move = (dx, dy, direction) => {
    setLastDirection(direction);
    setIsMoving(true);  // Animation starts
    // ... position update ...
    setTimeout(() => setIsMoving(false), 200);  // Stops after 200ms
};
```

**To Use Custom PNG Sprite:**
1. Add image file to `assets/images/player.png` (recommend 64x64 or 128x128 PNG)
2. Change prop in MapScreen: `<Player ... useImage={true} />`
3. Player.js will automatically handle rotation based on `direction` prop
4. Image will show opacity change when moving for visual feedback

**Future: Sprite Sheet Animation**
- Currently uses opacity flicker for emoji animation
- For sprite sheets: read frameIndex to calculate pixel offset for each animation frame
- Example: `marginTop: -frameIndex * 32` for vertical sprite sheet with 32px frames

## Integration Points & External Dependencies

### Expo Ecosystem
- **expo-router**: Plugin enabled (typedRoutes: true) but currently unused - App.js uses manual navigation
- **expo-font**: Pre-installed but not actively used
- **expo-haptics**: Pre-installed for future vibration feedback (e.g., on collision)
- **Vector Icons**: Pre-installed via @expo/vector-icons (can replace emoji placeholders)

### React Navigation
All navigation happens through the Stack.Navigator - no tab navigation or drawer menu currently.

### Platform-Specific Config
`app.json` contains platform adaptations:
- **iOS:** `supportsTablet: true`
- **Android:** Edge-to-edge enabled, adaptive icon configured, predictive back gesture disabled
- **Web:** Static output, favicon configured
- **New Architecture:** Enabled (`newArchEnabled: true`) and React Compiler experiments active

## Adding New Features

### 🏢 Adding New City Locations & Missions (Priority)
1. **Refactor MapScreen** to use a `locations` array instead of hardcoded `escolaArea`
2. **Create new mission data file** in `src/data/` (e.g., `libraryMissions.js`, `parkChallenges.js`)
3. **Add new mission screen** in `src/screens/` (e.g., `LibraryScreen.js`) following SchoolScreen pattern
4. **Register route** in App.js Stack.Navigator with location name
5. **Add location to map** by appending to locations array with collision box and route reference
6. **Add visual marker** on map using absolute positioning (can use emoji or colored box like School)

**Example:** Adding a Library location for vocabulary missions:
```javascript
// In locations array
{ id: "library", name: "Biblioteca", x: 400, y: 150, width: 80, height: 80, route: "Biblioteca" }
// In App.js
<Stack.Screen name="Biblioteca" component={LibraryScreen} />
// LibraryScreen.js follows same pattern as SchoolScreen but with vocabulary data
```

### Adding Lesson Levels to Existing Locations
1. Create new data file in `src/data/` (e.g., `numbers.js`, `colors.js`)
2. Add new screen in `src/screens/` with same pattern as SchoolScreen (useState for index, useEffect for progression)
3. Register route in App.js Stack.Navigator
4. Add new collision zone or expand existing one in MapScreen

### Adding Interactive Elements
- Use React Native core components: View, Text, Button, ScrollView, FlatList
- All interactive zones use absolute positioning like Player and location areas
- Test on web via `npm run web` for quick iteration

### Adding Sound/Feedback
- Haptics: `import { Haptics } from 'expo-haptics'` and call `Haptics.impactAsync()`
- Trigger on mission complete: `Haptics.impactAsync()` in mission screens
- Audio: Would require installing `expo-av` (not currently included)

## File Organization

```
english-game/
├── App.js (root navigation setup - register all mission screens here)
├── app.json (Expo config, platform-specific settings)
├── package.json (dependencies, scripts)
├── AGENTS.md (this file - AI agent guide)
├── README.md (project overview)
├── src/
│   ├── screens/
│   │   ├── MapScreen.js (city exploration + collision detection for all locations)
│   │   ├── SchoolScreen.js (alphabet learning mission)
│   │   └── [Future] LibraryScreen.js, ParkScreen.js, etc. (additional missions)
│   ├── components/
│   │   └── Player.js (positioned game sprite)
│   ├── data/
│   │   ├── alphabet.js (School mission content)
│   │   └── [Future] vocabulary.js, numbers.js, etc. (other mission content)
│   └── utils/ [Future]
│       └── locations.js (centralized location definitions for map)
└── components/ (legacy Expo template files - not used in current app)
```

**Active Code:** All gameplay logic in `src/`
**Legacy:** Root `components/` directory is unused template code
**Naming Convention:** Screen names match location routes ("Mapa", "Escola", "Biblioteca", etc.)

## Code Style & Conventions

- **Comments:** Portuguese for gameplay logic (e.g., "Detecta entrada na escola")
- **Naming:** Portuguese screen names ("Mapa", "Escola"), English variable names (position, index)
- **Imports:** Standard Node CommonJS style, no barrel exports yet
- **Constants:** Hard-coded values in component bodies (school area, starting position) - extract to constants file if reused

## Debugging Tips

- **Collision Detection:** Log position and location zones in MapScreen `useEffect`:
  ```javascript
  console.log(`Player at ${position.x},${position.y} - Checking locations...`);
  ```
- **Navigation Flow:** Verify screen transitions are triggered correctly by collision detection
- **Web Testing:** Run `npm run web` for fastest feedback loop - no emulator required
- **Device Testing:** Use Expo Go app with QR code from `expo start` for quick mobile testing
- **Mission Testing:** Each location screen can be tested independently by manually navigating to it

