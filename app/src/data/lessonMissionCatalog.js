import { schoolColorsLesson } from "./schoolColorsLesson";
import { bakeryFoodsLesson } from "./bakeryFoodsLesson";
import { houseObjectsLesson } from "./houseObjectsLesson";
import { starterMissionTemplates } from "./missionTemplates";
import { schoolColorsBalloonMission, schoolColorsBlueBalloonMission } from "../missions/balloons/balloonMissionConfig";
import { buildBalloonCollectibles } from "../missions/balloons/buildBalloonCollectibles";

const DEFAULT_OPTION_COLORS = ["#E53935", "#1E88E5", "#43A047", "#FBC02D", "#EC407A", "#8E24AA", "#FB8C00"];

function slugify(value) {
  return String(value ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function resolveOptionColor(option, index) {
  if (typeof option?.color === "string" && option.color.trim()) return option.color;

  const label = String(option?.label ?? "").trim().toLowerCase();
  const colorMap = {
    red: "#E53935",
    blue: "#1E88E5",
    green: "#43A047",
    yellow: "#FBC02D",
    orange: "#FB8C00",
    purple: "#8E24AA",
    pink: "#EC407A",
    brown: "#8D6E63",
    black: "#212121",
    white: "#FAFAFA",
    gray: "#757575",
    grey: "#757575",
  };

  if (label && colorMap[label]) {
    return colorMap[label];
  }

  return DEFAULT_OPTION_COLORS[index % DEFAULT_OPTION_COLORS.length];
}

function collectLessonOptions(lesson) {
  const unique = new Map();
  const questions = Array.isArray(lesson?.questions) ? lesson.questions : [];

  questions.forEach((question) => {
    (question?.options ?? []).forEach((option) => {
      const label = String(option?.label ?? option?.text ?? "").trim();
      if (!label) return;
      const key = label.toLowerCase();
      if (!unique.has(key)) {
        unique.set(key, { id: option?.id ?? null, label, color: option?.color ?? null });
      }
    });
  });

  return Array.from(unique.values());
}

function buildFindMissionsForLesson(lesson) {
  if (!lesson?.id || !lesson?.mission || String(lesson.mission.type).toUpperCase() !== "FIND") return [];

  const baseTitle = lesson.mission.title ?? "Baloes";
  const basePrompt = lesson.mission.description ?? "Encontre os baloes {color} no mapa.";
  const options = collectLessonOptions(lesson);
  if (!options.length) return [];

  const colors = options.map((option, index) => ({
    id: option.id,
    label: option.label,
    color: resolveOptionColor(option, index),
  }));

  return colors.map((colorOption, index) => {
    const missionKey = slugify(colorOption.id ?? colorOption.label) || `option-${index + 1}`;
    const missionId = `${lesson.id}-find-${missionKey}`;
    const prompt = basePrompt.includes("{color}")
      ? basePrompt.replace("{color}", colorOption.label)
      : `Encontre os baloes ${colorOption.label} no mapa.`;

    return normalizeMission({
      id: missionId,
      missionId,
      type: "balloons",
      lessonId: lesson.id,
      lessonLabel: lesson.title ?? lesson.id,
      title: `${baseTitle} ${colorOption.label}`,
      prompt,
      order: index + 1,
      target: {
        colorLabel: colorOption.label,
      },
      spawnRules: {
        minCount: 8,
        maxCount: 14,
        minTargetCount: 3,
        maxTargetCount: 6,
        size: 40,
        mapPadding: 96,
        colors,
      },
      completionRules: {
        type: "collect-targets",
        requireAllTargets: true,
      },
      feedbackRules: {
        hudLabel: `Baloes ${colorOption.label}`,
        guideMessage: prompt,
        completionMessage: `Muito bem! Voce encontrou todos os baloes ${colorOption.label}.`,
        wrongCollectibleMessageTemplate: "Esse balao e {colorLabel}. Procure baloes {targetColorLabel}.",
      },
      reward: {
        text: colorOption.label,
      },
    });
  });
}

function normalizeMission(mission) {
  if (!mission) return null;

  const id = mission.id ?? mission.missionId;
  if (!id) return null;

  return {
    ...mission,
    id,
    missionId: mission.missionId ?? id,
  };
}

const starterMissionMap = new Map(starterMissionTemplates.map((mission) => [mission.missionId, mission]));

function getStarterMission(missionId) {
  return starterMissionMap.get(missionId) ?? null;
}

export const lessonMissionCatalog = [
  normalizeMission({
    ...schoolColorsBalloonMission,
    lessonId: schoolColorsLesson.id,
    lessonLabel: "colors",
    title: "Baloes red",
    prompt: "Encontre os baloes red no mapa",
    order: 1,
  }),
  normalizeMission({
    ...schoolColorsBlueBalloonMission,
    lessonId: schoolColorsLesson.id,
    lessonLabel: "colors",
    title: "Baloes blue",
    prompt: "Encontre os baloes blue no mapa",
    order: 2,
  }),
  normalizeMission({
    ...(getStarterMission("verbs-sentence-1") ?? {}),
    lessonId: schoolColorsLesson.id,
    lessonLabel: "colors",
    title: "Frase com verbos",
    prompt: "Monte a frase correta",
    order: 3,
  }),
  normalizeMission({
    ...(getStarterMission("house-objects-matching-1") ?? {}),
    lessonId: houseObjectsLesson.id,
    lessonLabel: "house",
    title: "Objetos da casa",
    prompt: "Associe palavra e objeto",
    order: 1,
  }),
  normalizeMission({
    ...(getStarterMission("listening-objects-1") ?? {}),
    lessonId: houseObjectsLesson.id,
    lessonLabel: "house",
    title: "Ouvir objetos",
    prompt: "Ouca e escolha o objeto",
    order: 2,
  }),
  normalizeMission({
    ...(getStarterMission("bakery-foods-red-fruits") ?? {}),
    lessonId: bakeryFoodsLesson.id,
    lessonLabel: "bakery",
    title: "Frutas red",
    prompt: "Encontre as strawberries no mapa",
    order: 1,
  }),
].filter(Boolean);

export function buildLessonMissionsForLesson(lesson) {
  return buildFindMissionsForLesson(lesson);
}

export function buildLessonMissionCatalog(lessons = []) {
  const missions = [];
  const lessonIdsWithDynamicMissions = new Set();

  (Array.isArray(lessons) ? lessons : []).forEach((lesson) => {
    const generated = buildLessonMissionsForLesson(lesson);
    if (generated.length > 0) {
      lessonIdsWithDynamicMissions.add(lesson.id);
      missions.push(...generated);
    }
  });

  const fallback = lessonMissionCatalog.filter((mission) => !lessonIdsWithDynamicMissions.has(mission.lessonId));
  return [...missions, ...fallback];
}

export function getLessonMissionsByLessonId(lessonId, catalog = lessonMissionCatalog) {
  const source = Array.isArray(catalog) ? catalog : lessonMissionCatalog;
  return source
    .filter((mission) => mission.lessonId === lessonId)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

export function getLatestLessonMissionForLesson(lessonId, catalog = lessonMissionCatalog) {
  const missions = getLessonMissionsByLessonId(lessonId, catalog);
  return missions.length > 0 ? missions[missions.length - 1] : null;
}

export function getLessonMissionByLessonId(lessonId, catalog = lessonMissionCatalog) {
  return getLessonMissionsByLessonId(lessonId, catalog)[0] ?? null;
}

export function getLessonMissionById(missionId, catalog = lessonMissionCatalog) {
  const source = Array.isArray(catalog) ? catalog : lessonMissionCatalog;
  return source.find((mission) => mission.missionId === missionId) ?? null;
}

export function buildLessonMissionCollectibles(mission, anchorPosition, options = {}) {
  if (!mission) return [];

  if (mission.type === "balloons") {
    return buildBalloonCollectibles(mission, options);
  }

  const origin = {
    x: Number.isFinite(anchorPosition?.x) ? anchorPosition.x : 0,
    y: Number.isFinite(anchorPosition?.y) ? anchorPosition.y : 0,
  };

  const collectibles = mission.spawnRules?.collectibles ?? mission.collectibles ?? [];

  return collectibles.map((collectible, index) => ({
    ...collectible,
    type: collectible.type ?? "generic",
    x: origin.x + (collectible.offsetX ?? 0),
    y: origin.y + (collectible.offsetY ?? 0),
    width: collectible.width ?? 40,
    height: collectible.height ?? 40,
    pickupRadius: collectible.pickupRadius ?? 0,
    isTarget: collectible.isTarget ?? true,
    order: index,
  }));
}

void getLessonMissionsByLessonId;
void getLatestLessonMissionForLesson;
void getLessonMissionByLessonId;
void getStarterMission;
void buildLessonMissionsForLesson;
void buildLessonMissionCatalog;
void getLessonMissionById;
void buildLessonMissionCollectibles;
