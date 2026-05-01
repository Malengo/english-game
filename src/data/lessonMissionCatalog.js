import { schoolColorsLesson } from "./schoolColorsLesson";

export const learnedColorOptions = Array.from(
  new Map(
    schoolColorsLesson.questions
      .flatMap((question) => question.options)
      .map((option) => [option.label, option])
  ).values()
);

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
    balloonMission: {
      targetColorLabel: "Red",
      minCount: 8,
      maxCount: 14,
      minTargetCount: 3,
      maxTargetCount: 6,
      size: 40,
      mapPadding: 96,
      colors: learnedColorOptions,
    },
  },
];

function clampCount(value, min, max) {
  return Math.max(min, Math.min(value, max));
}

function randomIntInRange(min, max, rng) {
  return Math.floor(rng() * (max - min + 1)) + min;
}

function randomPoint({ width, height, itemSize, padding, rng }) {
  const maxX = Math.max(padding, width - padding - itemSize);
  const maxY = Math.max(padding, height - padding - itemSize);

  return {
    x: padding + rng() * Math.max(0, maxX - padding),
    y: padding + rng() * Math.max(0, maxY - padding),
  };
}

function findOpenPoint({ width, height, itemSize, padding, rng, isAreaBlocked, maxAttempts }) {
  let fallbackPoint = null;

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const point = randomPoint({ width, height, itemSize, padding, rng });
    fallbackPoint = point;
    const rect = { x: point.x, y: point.y, width: itemSize, height: itemSize };

    if (typeof isAreaBlocked !== "function" || !isAreaBlocked(rect)) {
      return point;
    }
  }

  return typeof isAreaBlocked === "function" ? null : fallbackPoint;
}

function shuffle(items, rng) {
  const result = [...items];

  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(rng() * (index + 1));
    const current = result[index];
    result[index] = result[swapIndex];
    result[swapIndex] = current;
  }

  return result;
}

function buildRandomBalloonMissionCollectibles(mission, options = {}) {
  const config = mission.balloonMission;
  const rng = typeof options.rng === "function" ? options.rng : Math.random;
  const colors = Array.isArray(config.colors) && config.colors.length > 0 ? config.colors : learnedColorOptions;
  const targetColor = colors.find((color) => color.label === config.targetColorLabel) ?? colors[0];
  const distractorColors = colors.filter((color) => color.label !== targetColor.label);
  const minCount = Math.max(1, config.minCount ?? 6);
  const maxCount = Math.max(minCount, config.maxCount ?? minCount);
  const totalCount = randomIntInRange(minCount, maxCount, rng);
  const maxTargetCount = clampCount(config.maxTargetCount ?? totalCount, 1, totalCount);
  const minTargetCount = clampCount(config.minTargetCount ?? 1, 1, maxTargetCount);
  const targetCount = randomIntInRange(minTargetCount, maxTargetCount, rng);
  const size = config.size ?? 40;
  const padding = config.mapPadding ?? 80;
  const worldWidth = options.worldWidth ?? 1200;
  const worldHeight = options.worldHeight ?? 900;
  const maxPlacementAttempts = options.maxPlacementAttempts ?? 80;

  const targetBalloons = Array.from({ length: targetCount }, (_, index) => ({
    colorOption: targetColor,
    isTarget: true,
    index,
  }));

  const distractorBalloons = Array.from({ length: totalCount - targetCount }, (_, index) => {
    const colorOption =
      distractorColors.length > 0
        ? distractorColors[randomIntInRange(0, distractorColors.length - 1, rng)]
        : targetColor;

    return {
      colorOption,
      isTarget: colorOption.label === targetColor.label,
      index,
    };
  });

  return shuffle([...targetBalloons, ...distractorBalloons], rng).flatMap((balloon, order) => {
    const point = findOpenPoint({
      width: worldWidth,
      height: worldHeight,
      itemSize: size,
      padding,
      rng,
      isAreaBlocked: options.isAreaBlocked,
      maxAttempts: maxPlacementAttempts,
    });

    if (!point) return [];

    return {
      id: `${mission.missionId}-balloon-${order}`,
      label: `Balao ${balloon.colorOption.label}`,
      emoji: "🎈",
      color: balloon.colorOption.color,
      colorLabel: balloon.colorOption.label,
      targetColorLabel: targetColor.label,
      isTarget: balloon.isTarget,
      x: point.x,
      y: point.y,
      width: size,
      height: size,
      order,
    };
  });
}

export function getLessonMissionByLessonId(lessonId) {
  return lessonMissionCatalog.find((mission) => mission.lessonId === lessonId);
}

export function buildLessonMissionCollectibles(mission, anchorPosition, options = {}) {
  if (!mission) return [];

  if (mission.balloonMission) {
    return buildRandomBalloonMissionCollectibles(mission, options);
  }

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
    isTarget: collectible.isTarget ?? true,
    order: index,
  }));
}

void getLessonMissionByLessonId;
void buildLessonMissionCollectibles;
