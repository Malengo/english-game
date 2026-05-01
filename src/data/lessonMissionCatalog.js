import { schoolColorsLesson } from "./schoolColorsLesson";

export const lessonMissionCatalog = [
  {
    missionId: "school-colors-red-balloons",
    lessonId: schoolColorsLesson.id,
    lessonLabel: "colors",
    title: "Baloes vermelhos",
    prompt: "Encontre os baloes red no mapa",
    guideMessage: "Muito bem! Voce aprendeu as cores. Agora procure os baloes red no mapa.",
    completionMessage: "Perfeito! Voce coletou todos os baloes red.",
    rewardText: "Red balloons",
    collectibles: [
      {
        id: "red-balloon-1",
        label: "Balao red",
        emoji: "🎈",
        color: "rgb(234 234 234 / 0)",
        offsetX: 120,
        offsetY: -40,
      },
      {
        id: "red-balloon-2",
        label: "Balao red",
        emoji: "🎈",
        color: "rgb(234 234 234 / 0)",
        offsetX: 220,
        offsetY: 20,
      },
      {
        id: "red-balloon-3",
        label: "Balao red",
        emoji: "🎈",
        color: "rgb(234 234 234 / 0)",
        offsetX: 140,
        offsetY: 120,
      },
    ],
  },
];

export function getLessonMissionByLessonId(lessonId) {
  return lessonMissionCatalog.find((mission) => mission.lessonId === lessonId);
}

export function buildLessonMissionCollectibles(mission, anchorPosition) {
  if (!mission) return [];

  const origin = {
    x: Number.isFinite(anchorPosition?.x) ? anchorPosition.x : 0,
    y: Number.isFinite(anchorPosition?.y) ? anchorPosition.y : 0,
  };

  return (mission.collectibles ?? []).map((collectible, index) => ({
    ...collectible,
    x: origin.x + (collectible.offsetX ?? 0),
    y: origin.y + (collectible.offsetY ?? 0),
    width: collectible.width ?? 40,
    height: collectible.height ?? 40,
    pickupRadius: collectible.pickupRadius ?? 0,
    order: index,
  }));
}

void getLessonMissionByLessonId;
void buildLessonMissionCollectibles;
