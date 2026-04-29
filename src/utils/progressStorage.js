import AsyncStorage from "@react-native-async-storage/async-storage";

const PROGRESS_STORAGE_KEY = "@english-game:progress:v1";

const DEFAULT_PROGRESS = {
  completedLocationIds: [],
  lessonCompletions: [],
  completedLessonMissionIds: [],
};

function normalizeProgress(rawProgress) {
  if (!rawProgress || typeof rawProgress !== "object") {
    return DEFAULT_PROGRESS;
  }

  const completedLocationIds = Array.isArray(rawProgress.completedLocationIds)
    ? rawProgress.completedLocationIds.filter((value) => typeof value === "string")
    : [];

  const lessonCompletions = Array.isArray(rawProgress.lessonCompletions)
    ? rawProgress.lessonCompletions
        .filter((entry) => entry && typeof entry.lessonId === "string")
        .map((entry) => {
          const normalized = { lessonId: entry.lessonId };

          if (typeof entry.locationId === "string") {
            normalized.locationId = entry.locationId;
          }

          if (typeof entry.completedAt === "string") {
            normalized.completedAt = entry.completedAt;
          }

          return normalized;
        })
    : [];

  const completedLessonMissionIds = Array.isArray(rawProgress.completedLessonMissionIds)
    ? rawProgress.completedLessonMissionIds.filter((value) => typeof value === "string")
    : [];

  const result = {
    completedLocationIds,
    lessonCompletions,
    completedLessonMissionIds,
  };

  if (typeof rawProgress.lastSchoolVisit === "string") {
    result.lastSchoolVisit = rawProgress.lastSchoolVisit;
  }

  if (
    typeof rawProgress.dailyMissionsDate === "string" &&
    Array.isArray(rawProgress.dailyMissions)
  ) {
    result.dailyMissionsDate = rawProgress.dailyMissionsDate;
    result.dailyMissions = rawProgress.dailyMissions
      .filter((mission) => mission && typeof mission.id === "string" && typeof mission.title === "string")
      .map((mission) => ({
        id: mission.id,
        title: mission.title,
        completed: Boolean(mission.completed),
      }));
  }

  return result;
}

export async function loadProgress() {
  try {
    const value = await AsyncStorage.getItem(PROGRESS_STORAGE_KEY);
    if (!value) return DEFAULT_PROGRESS;
    return normalizeProgress(JSON.parse(value));
  } catch {
    return DEFAULT_PROGRESS;
  }
}

export async function saveProgress(progress) {
  const normalized = normalizeProgress(progress);
  await AsyncStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(normalized));
  return normalized;
}

export async function markLocationCompleted(locationId) {
  const progress = await loadProgress();
  const nextCompleted = new Set(progress.completedLocationIds);
  nextCompleted.add(locationId);

  return saveProgress({
    ...progress,
    completedLocationIds: Array.from(nextCompleted),
  });
}

export async function markSchoolVisited(timestamp = Date.now()) {
  const progress = await loadProgress();
  const next = {
    ...progress,
    lastSchoolVisit: new Date(timestamp).toISOString(),
  };

  return saveProgress(next);
}

export async function hasVisitedSchoolToday() {
  const progress = await loadProgress();
  if (!progress.lastSchoolVisit) return false;

  const lastVisit = new Date(progress.lastSchoolVisit);
  const now = new Date();

  return (
    lastVisit.getFullYear() === now.getFullYear() &&
    lastVisit.getMonth() === now.getMonth() &&
    lastVisit.getDate() === now.getDate()
  );
}

export async function ensureDailyMissions() {
  const progress = await loadProgress();
  const todayDate = new Date().toISOString().slice(0, 10);

  if (
    progress.dailyMissionsDate === todayDate &&
    Array.isArray(progress.dailyMissions) &&
    progress.dailyMissions.length > 0
  ) {
    return progress.dailyMissions;
  }

  const missions = [
    { id: `${todayDate}-letters`, title: "Pratique 5 letras", completed: false },
    { id: `${todayDate}-match`, title: "Jogo de correspondencia", completed: false },
    { id: `${todayDate}-quiz`, title: "Quiz rapido", completed: false },
  ];

  const next = {
    ...progress,
    dailyMissionsDate: todayDate,
    dailyMissions: missions,
  };

  await saveProgress(next);
  return missions;
}

export async function markLessonCompleted({ lessonId, locationId = undefined, completedAt = Date.now() }) {
  if (typeof lessonId !== "string" || !lessonId.trim()) {
    return loadProgress();
  }

  const progress = await loadProgress();
  const alreadyCompleted = progress.lessonCompletions.some((entry) => entry.lessonId === lessonId);

  if (alreadyCompleted) {
    return progress;
  }

  const next = {
    ...progress,
    lessonCompletions: [
      ...progress.lessonCompletions,
      {
        lessonId,
        ...(typeof locationId === "string" ? { locationId } : {}),
        completedAt: new Date(completedAt).toISOString(),
      },
    ],
  };

  return saveProgress(next);
}

export async function markLessonMissionCompleted(missionId) {
  if (typeof missionId !== "string" || !missionId.trim()) {
    return loadProgress();
  }

  const progress = await loadProgress();
  const nextCompleted = new Set(progress.completedLessonMissionIds);
  nextCompleted.add(missionId);

  return saveProgress({
    ...progress,
    completedLessonMissionIds: Array.from(nextCompleted),
  });
}

export function getLatestLessonCompletion(progress) {
  const lessonCompletions = Array.isArray(progress?.lessonCompletions) ? progress.lessonCompletions : [];
  return lessonCompletions.length > 0 ? lessonCompletions[lessonCompletions.length - 1] : null;
}

export function hasCompletedLessonMission(progress, missionId) {
  if (typeof missionId !== "string" || !missionId.trim()) return false;

  return Array.isArray(progress?.completedLessonMissionIds)
    ? progress.completedLessonMissionIds.includes(missionId)
    : false;
}

