import AsyncStorage from "@react-native-async-storage/async-storage";

const PROGRESS_STORAGE_KEY = "@english-game:progress:v1";

const DEFAULT_PROGRESS = {
  completedLocationIds: [],
};

function normalizeProgress(rawProgress) {
  if (!rawProgress || typeof rawProgress !== "object") {
    return DEFAULT_PROGRESS;
  }

  const completedLocationIds = Array.isArray(rawProgress.completedLocationIds)
    ? rawProgress.completedLocationIds.filter((value) => typeof value === "string")
    : [];

  return { completedLocationIds };
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

  return saveProgress({ completedLocationIds: Array.from(nextCompleted) });
}

