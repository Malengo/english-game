import { schoolColorsLesson } from "./schoolColorsLesson";
import { schoolColorsBalloonMission } from "../missions/balloons/balloonMissionConfig";
import { buildBalloonCollectibles } from "../missions/balloons/buildBalloonCollectibles";

function normalizeMission(mission) {
  if (!mission) return mission;

  const id = mission.id ?? mission.missionId;
  if (!id) return mission;

  return {
    ...mission,
    id,
    missionId: mission.missionId ?? id,
  };
}

export const lessonMissionCatalog = [
  normalizeMission({
    ...schoolColorsBalloonMission,
    lessonId: schoolColorsLesson.id,
    lessonLabel: "colors",
    title: "Baloes red",
    prompt: "Encontre os baloes red no mapa",
  }),
];

export function getLessonMissionByLessonId(lessonId) {
  return lessonMissionCatalog.find((mission) => mission.lessonId === lessonId);
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

void getLessonMissionByLessonId;
void buildLessonMissionCollectibles;
