import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  loadProgress,
  saveProgress,
  markLocationCompleted,
  markSchoolVisited,
  hasVisitedSchoolToday,
  ensureDailyMissions,
  markLessonCompleted,
  markLessonMissionCompleted,
  getLatestLessonCompletion,
  hasCompletedLessonMission,
} from "../progressStorage";

describe("progressStorage", () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    jest.clearAllMocks();
  });

  it("retorna progresso padrao quando nao existe dado", async () => {
    await expect(loadProgress()).resolves.toEqual({
      completedLocationIds: [],
      lessonCompletions: [],
      completedLessonMissionIds: [],
    });
  });

  it("normaliza progresso invalido ao salvar", async () => {
    const saved = await saveProgress({
      completedLocationIds: ["school", 123, null, "house"],
      lessonCompletions: [{ lessonId: "lesson-a", locationId: "school", completedAt: "2026-04-29T00:00:00.000Z" }],
      completedLessonMissionIds: ["mission-a", 12, null],
    });

    expect(saved).toEqual({
      completedLocationIds: ["school", "house"],
      lessonCompletions: [
        { lessonId: "lesson-a", locationId: "school", completedAt: "2026-04-29T00:00:00.000Z" },
      ],
      completedLessonMissionIds: ["mission-a"],
    });
    await expect(loadProgress()).resolves.toEqual(saved);
  });

  it("retorna padrao quando JSON armazenado esta corrompido", async () => {
    await AsyncStorage.setItem("@english-game:progress:v1", "{invalid-json");

    await expect(loadProgress()).resolves.toEqual({
      completedLocationIds: [],
      lessonCompletions: [],
      completedLessonMissionIds: [],
    });
  });

  it("marca local como concluido sem duplicar ids", async () => {
    await saveProgress({ completedLocationIds: ["school"] });

    const updated = await markLocationCompleted("school");
    expect(updated.completedLocationIds).toEqual(["school"]);

    const next = await markLocationCompleted("house");
    expect(next.completedLocationIds).toEqual(["school", "house"]);
  });

  it("marca uma licao e nao duplica a conclusao", async () => {
    const first = await markLessonCompleted({ lessonId: "school-colors-lesson", locationId: "school" });
    const second = await markLessonCompleted({ lessonId: "school-colors-lesson", locationId: "school" });

    expect(first.lessonCompletions).toHaveLength(1);
    expect(second.lessonCompletions).toHaveLength(1);
    expect(getLatestLessonCompletion(second)).toEqual({
      lessonId: "school-colors-lesson",
      locationId: "school",
      completedAt: expect.any(String),
    });
  });

  it("marca missao da licao como concluida", async () => {
    const updated = await markLessonMissionCompleted("school-colors-red-balloons");

    expect(updated.completedLessonMissionIds).toEqual(["school-colors-red-balloons"]);
    expect(hasCompletedLessonMission(updated, "school-colors-red-balloons")).toBe(true);
  });

  it("marca visita na escola e valida visita do dia", async () => {
    await markSchoolVisited();

    await expect(hasVisitedSchoolToday()).resolves.toBe(true);
  });

  it("cria missoes diarias apenas uma vez por dia", async () => {
    const first = await ensureDailyMissions();
    const second = await ensureDailyMissions();

    expect(first.length).toBeGreaterThan(0);
    expect(second).toEqual(first);

    const stored = await loadProgress();
    expect(stored.dailyMissionsDate).toBeDefined();
    expect(Array.isArray(stored.dailyMissions)).toBe(true);
  });
});
