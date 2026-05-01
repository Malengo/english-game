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
  getProgressDateKey,
  buildDailyLessonMissionCompletionId,
  isTimestampOnProgressDate,
} from "../progressStorage";

describe("progressStorage", () => {
  beforeEach(async () => {
    jest.useRealTimers();
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

  it("marca uma licao uma vez por dia", async () => {
    const firstDay = new Date("2026-04-29T10:00:00").getTime();
    const nextDay = new Date("2026-04-30T10:00:00").getTime();
    const first = await markLessonCompleted({
      lessonId: "school-colors-lesson",
      locationId: "school",
      completedAt: firstDay,
    });
    const duplicateSameDay = await markLessonCompleted({
      lessonId: "school-colors-lesson",
      locationId: "school",
      completedAt: firstDay,
    });
    const secondDay = await markLessonCompleted({
      lessonId: "school-colors-lesson",
      locationId: "school",
      completedAt: nextDay,
    });

    expect(first.lessonCompletions).toHaveLength(1);
    expect(duplicateSameDay.lessonCompletions).toHaveLength(1);
    expect(secondDay.lessonCompletions).toHaveLength(2);
    expect(getLatestLessonCompletion(secondDay)).toEqual({
      lessonId: "school-colors-lesson",
      locationId: "school",
      completedAt: new Date(nextDay).toISOString(),
    });
  });

  it("marca missao da licao como concluida apenas para o dia atual", async () => {
    const completedAt = new Date("2026-04-29T10:00:00").getTime();
    const updated = await markLessonMissionCompleted("school-colors-red-balloons", completedAt);

    expect(updated.completedLessonMissionIds).toEqual([
      buildDailyLessonMissionCompletionId("school-colors-red-balloons", completedAt),
    ]);

    jest.useFakeTimers().setSystemTime(new Date("2026-04-29T12:00:00"));
    expect(hasCompletedLessonMission(updated, "school-colors-red-balloons")).toBe(true);

    jest.setSystemTime(new Date("2026-04-30T12:00:00"));
    expect(hasCompletedLessonMission(updated, "school-colors-red-balloons")).toBe(false);
    jest.useRealTimers();
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

  it("gera chave diaria usando data local de progresso", () => {
    const timestamp = new Date("2026-04-29T10:00:00").getTime();

    expect(getProgressDateKey(timestamp)).toBe("2026-04-29");
    expect(isTimestampOnProgressDate(new Date(timestamp).toISOString(), timestamp)).toBe(true);
    expect(buildDailyLessonMissionCompletionId("mission-a", timestamp)).toBe("mission-a:2026-04-29");
  });
});
