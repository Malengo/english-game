import lessonsApi from "./lessonsApi.json";
import { fetchLessons } from "../services/lessonService";

const DEFAULT_OPTION_COLORS = ["#E53935", "#1E88E5", "#43A047", "#FBC02D", "#EC407A", "#8E24AA", "#FB8C00"];
const DEFAULT_INTRO_MESSAGE = "Vamos comecar!";
const DEFAULT_COMPLETION_MESSAGE = "Muito bem!";
const DEFAULT_SUCCESS_MESSAGE = "Muito bem!";
const DEFAULT_TRY_AGAIN_MESSAGE = "Tente novamente.";
const TEACHING_ITEM_TYPES = new Set(["VOCABULARY", "PHRASE", "DIALOG"]);
const DEFAULT_EMOJI = "❔";

const fallbackLocations = Array.isArray(lessonsApi?.locations) ? lessonsApi.locations : [];

function buildCatalogFromLocations(locations) {
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

  return { locations, allLessons, lessonsById };
}

const fallbackCatalog = buildCatalogFromLocations(fallbackLocations);

let catalogState = {
  ...fallbackCatalog,
  loading: false,
  loaded: false,
  error: null,
  source: "local",
  version: 0,
};

const listeners = new Set();

function notifyCatalogUpdate() {
  catalogState = { ...catalogState, version: catalogState.version + 1 };
  listeners.forEach((listener) => listener(catalogState.version));
}

function resolveOptionLabel(option) {
  return String(option?.label ?? option?.text ?? option?.value ?? "").trim();
}

function resolveRemoteOptionColor(option) {
  return option?.color ?? option?.colorHex ?? option?.hexColor ?? option?.backgroundColor ?? null;
}

function resolveOptionColor(option, localQuestion, index) {
  const optionText = resolveOptionLabel(option);
  const remoteColor = resolveRemoteOptionColor(option);
  if (typeof remoteColor === "string" && remoteColor.trim()) return remoteColor.trim();

  const match = (localQuestion?.options ?? []).find((option) =>
    String(option?.label ?? "").toLowerCase() === String(optionText ?? "").toLowerCase()
  );

  if (match?.color) return match.color;
  return DEFAULT_OPTION_COLORS[index % DEFAULT_OPTION_COLORS.length];
}

function resolveCorrectIndex(options, correctAnswer) {
  const correctOptionIndex = options.findIndex((option) => option.correct === true);
  if (correctOptionIndex >= 0) return correctOptionIndex;

  if (correctAnswer) {
    const answerIndex = options.findIndex((option) => resolveOptionLabel(option) === correctAnswer);
    if (answerIndex >= 0) return answerIndex;
  }

  return 0;
}

function mapExerciseToQuestion(exercise, localQuestion, index) {
  const options = Array.isArray(exercise?.options)
    ? [...exercise.options].sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0))
    : [];

  const correctIndex = resolveCorrectIndex(options, exercise?.correctAnswer);
  return {
    id: exercise?.id ?? `${localQuestion?.id ?? "exercise"}-${index}`,
    emoji: exercise?.emoji ?? DEFAULT_EMOJI,
    prompt: exercise?.prompt ?? localQuestion?.prompt ?? "",
    helperText: localQuestion?.helperText ?? "",
    promptAudioUrl: exercise?.promptAudioUrl ?? null,
    options: options.map((option, optionIndex) => ({
      id: option?.id ?? null,
      label: resolveOptionLabel(option),
      color: resolveOptionColor(option, localQuestion, optionIndex),
      audioUrl: option?.audioUrl ?? null,
    })),
    correctIndex,
    successMessage: localQuestion?.successMessage ?? DEFAULT_SUCCESS_MESSAGE,
    tryAgainMessage: localQuestion?.tryAgainMessage ?? DEFAULT_TRY_AGAIN_MESSAGE,
  };
}

function mapLessonItemToStep(item, index) {
  return {
    id: item?.id ?? `item-${index}`,
    type: "teaching",
    itemType: item?.type ?? "PHRASE",
    text: item?.text ?? "",
    translation: item?.translation ?? "",
    audioUrl: item?.audioUrl ?? null,
    orderIndex: item?.orderIndex ?? index,
  };
}

function mapQuestionToStep(question, index, orderOffset = 0) {
  return {
    ...question,
    id: question?.id ?? `question-${index}`,
    type: "question",
    orderIndex: orderOffset + index,
  };
}

function mapRemoteLesson(remoteLesson, localLesson) {
  const exercises = Array.isArray(remoteLesson?.exercises) ? remoteLesson.exercises : [];
  const localQuestions = Array.isArray(localLesson?.questions) ? localLesson.questions : [];
  const items = Array.isArray(remoteLesson?.items) ? remoteLesson.items : [];

  const questions = exercises.length
    ? exercises
        .slice()
        .sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0))
        .map((exercise, index) => mapExerciseToQuestion(exercise, localQuestions[index], index))
    : localQuestions;

  const teachingSteps = items
    .slice()
    .sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0))
    .filter((item) => TEACHING_ITEM_TYPES.has(item?.type))
    .map(mapLessonItemToStep);
  const questionSteps = questions.map((question, index) => mapQuestionToStep(question, index, teachingSteps.length));
  const steps = teachingSteps.length ? [...teachingSteps, ...questionSteps] : questionSteps;

  return {
    id: remoteLesson?.slug ?? remoteLesson?.id,
    order: localLesson?.order ?? remoteLesson?.stageRequired ?? 0,
    title: remoteLesson?.title ?? localLesson?.title ?? "Licao",
    subtitle: localLesson?.subtitle ?? remoteLesson?.description ?? "",
    introMessage: localLesson?.introMessage ?? DEFAULT_INTRO_MESSAGE,
    completionMessage: localLesson?.completionMessage ?? DEFAULT_COMPLETION_MESSAGE,
    locationId: remoteLesson?.locationId ?? localLesson?.locationId ?? "school",
    mission: remoteLesson?.mission ?? localLesson?.mission ?? null,
    steps,
    questions,
  };
}

function buildCatalogFromRemote(remoteLessons) {
  const localLessonList = fallbackCatalog.allLessons ?? [];
  const localLessonById = new Map(localLessonList.map((lesson) => [lesson.id, lesson]));
  const localLocationById = new Map(fallbackLocations.map((location) => [location.id, location]));
  const lessonsByLocationId = new Map();

  remoteLessons.forEach((remoteLesson) => {
    const localLesson = localLessonById.get(remoteLesson?.slug) ?? localLessonById.get(remoteLesson?.id);
    const mappedLesson = mapRemoteLesson(remoteLesson, localLesson);
    const locationId = mappedLesson.locationId;
    const bucket = lessonsByLocationId.get(locationId) ?? [];
    lessonsByLocationId.set(locationId, [...bucket, mappedLesson]);
  });

  const locationIds = new Set([
    ...fallbackLocations.map((location) => location.id),
    ...Array.from(lessonsByLocationId.keys()),
  ]);

  const locations = Array.from(locationIds).map((locationId) => {
    const localLocation = localLocationById.get(locationId);
    const lessons = lessonsByLocationId.get(locationId) ?? localLocation?.lessons ?? [];

    return {
      ...(localLocation ?? { id: locationId, title: locationId }),
      lessons,
    };
  });

  return buildCatalogFromLocations(locations);
}

export function getLessonCatalogSnapshot() {
  return { ...catalogState };
}

export function subscribeLessonCatalog(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export async function ensureLessonCatalogLoaded() {
  if (catalogState.loading || catalogState.loaded) return;

  catalogState = { ...catalogState, loading: true, error: null };
  notifyCatalogUpdate();

  try {
    const remoteLessons = await fetchLessons();
    const remoteCatalog = buildCatalogFromRemote(Array.isArray(remoteLessons) ? remoteLessons : []);
    catalogState = {
      ...catalogState,
      ...remoteCatalog,
      loading: false,
      loaded: true,
      source: "remote",
      error: null,
    };
  } catch (error) {
    console.error(error);
    catalogState = {
      ...catalogState,
      loading: false,
      loaded: true,
      source: "local",
      error,
    };
  }

  notifyCatalogUpdate();
}

export function getLessonById(lessonId) {
  return catalogState.lessonsById.get(lessonId) ?? null;
}

export function getLessonsForLocation(locationId) {
  return catalogState.allLessons
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

void getLessonCatalogSnapshot;
void subscribeLessonCatalog;
void ensureLessonCatalogLoaded;
void getLessonById;
void getLessonsForLocation;
void getFirstLessonForLocation;
void getNextLessonInLocation;
void getNextPendingLessonForLocation;
