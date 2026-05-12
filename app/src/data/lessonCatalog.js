import lessonsApi from "./lessonsApi.json";

const locations = Array.isArray(lessonsApi?.locations) ? lessonsApi.locations : [];

const allLessons = locations
  .flatMap((location) =>
    (location.lessons ?? []).map((lesson) => ({
      ...lesson,
      locationId: location.id,
      order: lesson.order ?? 0,
    }))
  )
  .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

const lessonsById = new Map(allLessons.map((lesson) => [lesson.id, lesson]));

export function getLessonById(lessonId) {
  return lessonsById.get(lessonId) ?? null;
}

export function getLessonsForLocation(locationId) {
  return allLessons
    .filter((lesson) => lesson.locationId === locationId)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

export function getFirstLessonForLocation(locationId) {
  const lessons = getLessonsForLocation(locationId);
  return lessons.length > 0 ? lessons[0] : null;
}

export function getNextLessonInLocation(locationId, currentLessonId) {
  const lessons = getLessonsForLocation(locationId);
  const currentIndex = lessons.findIndex((lesson) => lesson.id === currentLessonId);
  if (currentIndex < 0) return null;
  return lessons[currentIndex + 1] ?? null;
}

export function getNextPendingLessonForLocation(locationId, lessonCompletions = []) {
  const lessons = getLessonsForLocation(locationId);
  const completedSet = new Set(
    (Array.isArray(lessonCompletions) ? lessonCompletions : [])
      .map((entry) => entry?.lessonId)
      .filter(Boolean)
  );

  return lessons.find((lesson) => !completedSet.has(lesson.id)) ?? null;
}

void getLessonById;
void getLessonsForLocation;
void getFirstLessonForLocation;
void getNextLessonInLocation;
void getNextPendingLessonForLocation;

