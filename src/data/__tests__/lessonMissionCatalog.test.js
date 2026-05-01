import { buildLessonMissionCollectibles, getLessonMissionByLessonId } from "../lessonMissionCatalog";
import { schoolColorsLesson } from "../schoolColorsLesson";

describe("lessonMissionCatalog", () => {
  const mission = getLessonMissionByLessonId(schoolColorsLesson.id);

  it("gera quantidade minima aleatoria de baloes com alvo e distratores", () => {
    const collectibles = buildLessonMissionCollectibles(mission, null, {
      worldWidth: 800,
      worldHeight: 600,
      rng: () => 0,
    });

    const targetBalloons = collectibles.filter((collectible) => collectible.isTarget);
    const wrongBalloons = collectibles.filter((collectible) => !collectible.isTarget);

    expect(collectibles).toHaveLength(mission.balloonMission.minCount);
    expect(targetBalloons).toHaveLength(mission.balloonMission.minTargetCount);
    expect(wrongBalloons.length).toBeGreaterThan(0);
    expect(new Set(collectibles.map((collectible) => collectible.colorLabel)).size).toBeGreaterThan(1);
  });

  it("respeita limite maximo e espalha baloes dentro do mapa", () => {
    const collectibles = buildLessonMissionCollectibles(mission, null, {
      worldWidth: 800,
      worldHeight: 600,
      rng: () => 0.999,
    });

    expect(collectibles).toHaveLength(mission.balloonMission.maxCount);

    for (const collectible of collectibles) {
      expect(collectible.x).toBeGreaterThanOrEqual(mission.balloonMission.mapPadding);
      expect(collectible.y).toBeGreaterThanOrEqual(mission.balloonMission.mapPadding);
      expect(collectible.x + collectible.width).toBeLessThanOrEqual(800 - mission.balloonMission.mapPadding + 1);
      expect(collectible.y + collectible.height).toBeLessThanOrEqual(600 - mission.balloonMission.mapPadding + 1);
    }
  });

  it("rejeita posicoes bloqueadas por colisao do mapa", () => {
    const rngValues = [
      0, // total count min
      0, // target count min
      ...Array(20).fill(0), // shuffle
      0,
      0, // first candidate: blocked near padding
      0.5,
      0.5, // accepted
    ];
    let rngIndex = 0;
    const blockedRects = [];

    const collectibles = buildLessonMissionCollectibles(mission, null, {
      worldWidth: 800,
      worldHeight: 600,
      maxPlacementAttempts: 3,
      rng: () => rngValues[rngIndex++] ?? 0.5,
      isAreaBlocked: (rect) => {
        const blocked = rect.x < 150 && rect.y < 150;
        if (blocked) blockedRects.push(rect);
        return blocked;
      },
    });

    expect(blockedRects.length).toBeGreaterThan(0);
    expect(collectibles.length).toBeGreaterThan(0);
    expect(collectibles.every((collectible) => collectible.x >= 150 || collectible.y >= 150)).toBe(true);
  });
});
