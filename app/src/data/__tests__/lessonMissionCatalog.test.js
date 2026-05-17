import {
  buildLessonMissionCatalog,
  buildLessonMissionCollectibles,
  getLessonMissionByLessonId,
} from "../lessonMissionCatalog";
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

    expect(collectibles).toHaveLength(mission.spawnRules.minCount);
    expect(targetBalloons).toHaveLength(mission.spawnRules.minTargetCount);
    expect(wrongBalloons.length).toBeGreaterThan(0);
    expect(new Set(collectibles.map((collectible) => collectible.colorLabel)).size).toBeGreaterThan(1);
  });

  it("respeita limite maximo e espalha baloes dentro do mapa", () => {
    const collectibles = buildLessonMissionCollectibles(mission, null, {
      worldWidth: 800,
      worldHeight: 600,
      rng: () => 0.999,
    });

    expect(collectibles).toHaveLength(mission.spawnRules.maxCount);

    for (const collectible of collectibles) {
      expect(collectible.x).toBeGreaterThanOrEqual(mission.spawnRules.mapPadding);
      expect(collectible.y).toBeGreaterThanOrEqual(mission.spawnRules.mapPadding);
      expect(collectible.x + collectible.width).toBeLessThanOrEqual(800 - mission.spawnRules.mapPadding + 1);
      expect(collectible.y + collectible.height).toBeLessThanOrEqual(600 - mission.spawnRules.mapPadding + 1);
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

  it("gera baloes FIND com as cores cadastradas nas opcoes da licao dinamica", () => {
    const catalog = buildLessonMissionCatalog([
      {
        id: "dynamic-colors",
        title: "Dynamic Colors",
        mission: {
          type: "FIND",
          title: "Baloes",
          description: "Encontre os baloes {color} no mapa.",
        },
        questions: [
          {
            options: [
              { id: "opt-cyan", label: "Cyan", color: "#00BCD4" },
              { id: "opt-lime", label: "Lime", color: "#CDDC39" },
            ],
          },
        ],
      },
    ]);

    const mission = catalog.find((entry) => entry.missionId === "dynamic-colors-find-opt-cyan");
    const collectibles = buildLessonMissionCollectibles(mission, null, {
      worldWidth: 800,
      worldHeight: 600,
      rng: () => 0,
    });

    expect(mission.spawnRules.colors).toEqual([
      expect.objectContaining({ label: "Cyan", color: "#00BCD4" }),
      expect.objectContaining({ label: "Lime", color: "#CDDC39" }),
    ]);
    expect(collectibles.filter((collectible) => collectible.colorLabel === "Cyan")).toEqual(
      expect.arrayContaining([expect.objectContaining({ color: "#00BCD4", isTarget: true })])
    );
    expect(collectibles.some((collectible) => collectible.color === "#CDDC39")).toBe(true);
  });

  it("gera uma missao FIND de emoji usando o emoji da pergunta", () => {
    const catalog = buildLessonMissionCatalog([
      {
        id: "fruit-emoji",
        title: "Fruit Emoji",
        mission: {
          type: "FIND",
          title: "Fruta",
          description: "Encontre {emoji} no mapa.",
          targetSource: "QUESTION_EMOJI",
          collectibleType: "emoji",
        },
        questions: [
          {
            id: "apple-question",
            emoji: "🍎",
            prompt: "What fruit is this?",
            correctIndex: 0,
            options: [
              { id: "apple", label: "Apple", color: "#E53935" },
              { id: "banana", label: "Banana", color: "#FBC02D" },
            ],
          },
        ],
      },
    ]);

    const mission = catalog.find((entry) => entry.missionId === "fruit-emoji-find-apple-question");
    const collectibles = buildLessonMissionCollectibles(mission, null, {
      worldWidth: 800,
      worldHeight: 600,
      rng: () => 0,
    });

    expect(mission).toEqual(
      expect.objectContaining({
        type: "collectibles",
        target: expect.objectContaining({ emoji: "🍎", label: "Apple" }),
      })
    );
    expect(collectibles).toHaveLength(mission.spawnRules.minCount);
    expect(collectibles).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: "emoji",
          emoji: "🍎",
          label: "Apple",
          isTarget: true,
        }),
      ])
    );
  });
});
