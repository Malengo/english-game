import { schoolColorsLesson } from "./schoolColorsLesson";
import { schoolColorsBalloonMission } from "../missions/balloons/balloonMissionConfig";
import { buildBalloonCollectibles } from "../missions/balloons/buildBalloonCollectibles";

export const lessonMissionCatalog = [
  {
    missionId: "school-colors-red-balloons",
    lessonId: schoolColorsLesson.id,
    lessonLabel: "colors",
    title: "Baloes red",
    prompt: "Encontre os baloes red no mapa",
    guideMessage:
      "Muito bem! Voce aprendeu varias cores. Agora procure apenas os baloes red no mapa.",
    completionMessage: "Perfeito! Voce coletou todos os baloes red.",
    rewardText: "Red balloons",
    balloonMission: schoolColorsBalloonMission,
  },
];

export function getLessonMissionByLessonId(lessonId) {
  return lessonMissionCatalog.find((mission) => mission.lessonId === lessonId);
}

export function buildLessonMissionCollectibles(mission, anchorPosition, options = {}) {
  if (!mission) return [];

  if (mission.balloonMission) {
    return buildBalloonCollectibles(mission, options);
  }

  const origin = {
    x: Number.isFinite(anchorPosition?.x) ? anchorPosition.x : 0,
    y: Number.isFinite(anchorPosition?.y) ? anchorPosition.y : 0,
  };

  return (mission.collectibles ?? []).map((collectible, index) => ({
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
