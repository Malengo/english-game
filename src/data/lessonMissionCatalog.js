import { schoolColorsLesson } from "./schoolColorsLesson";
import { bakeryFoodsLesson } from "./bakeryFoodsLesson";
import { houseObjectsLesson } from "./houseObjectsLesson";
import { starterMissionTemplates } from "./missionTemplates";
import { schoolColorsBalloonMission, schoolColorsBlueBalloonMission } from "../missions/balloons/balloonMissionConfig";
import { buildBalloonCollectibles } from "../missions/balloons/buildBalloonCollectibles";

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

export function getLessonMissionsByLessonId(lessonId) {
  return lessonMissionCatalog
    .filter((mission) => mission.lessonId === lessonId)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

export function getLatestLessonMissionForLesson(lessonId) {
  const missions = getLessonMissionsByLessonId(lessonId);
  return missions.length > 0 ? missions[missions.length - 1] : null;
}

export function getLessonMissionByLessonId(lessonId) {
  return getLessonMissionsByLessonId(lessonId)[0] ?? null;
}

export function getLessonMissionById(missionId) {
  return lessonMissionCatalog.find((mission) => mission.missionId === missionId) ?? null;
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
void getLessonMissionById;
void buildLessonMissionCollectibles;
