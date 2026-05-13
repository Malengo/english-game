import Constants from "expo-constants";

const DEFAULT_BASE_URL = "http://192.168.0.17:8082";

function resolveBaseUrl() {
  const raw = Constants?.expoConfig?.extra?.backendUrl ?? DEFAULT_BASE_URL;
  return String(raw).replace(/\/$/, "");
}

export async function fetchLessons() {
  const baseUrl = resolveBaseUrl();
  const response = await fetch(`${baseUrl}/api/lessons`);

  if (!response.ok) {
    const message = `Lesson fetch failed (${response.status})`;
    throw new Error(message);
  }
  return response.json();
}

void fetchLessons;

