import { learnedColorOptions } from "./balloonMissionConfig";

const DEFAULT_BALLOON_COLORS = ["#E53935", "#1E88E5", "#43A047", "#FBC02D", "#EC407A", "#8E24AA", "#FB8C00"];
const LABEL_COLOR_MAP = {
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

export function buildBalloonCollectibles(mission, options = {}) {

  const config = mission?.spawnRules ?? mission?.balloonMission;
  if (!config) return [];

  const rng = typeof options.rng === "function" ? options.rng : Math.random;
  const rawColors = Array.isArray(config.colors) && config.colors.length > 0 ? config.colors : learnedColorOptions;
  const colors = rawColors
    .map((option, index) => normalizeColorOption(option, index))
    .filter((option) => option.label);
  if (!colors.length) return [];

  const targetColorLabel = mission?.target?.colorLabel ?? config.targetColorLabel ?? colors[0]?.label;
  const normalizedTargetLabel = String(targetColorLabel ?? "").trim().toLowerCase();
  const targetColor =
    colors.find((color) => String(color.label ?? "").trim().toLowerCase() === normalizedTargetLabel) ?? colors[0];
  const targetLabelNormalized = String(targetColor?.label ?? "").trim().toLowerCase();
  const distractorColors = colors.filter(
    (color) => String(color.label ?? "").trim().toLowerCase() !== targetLabelNormalized
  );
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
      isTarget:
        String(colorOption.label ?? "").trim().toLowerCase() ===
        String(targetColor.label ?? "").trim().toLowerCase(),
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
      type: "balloon",
      label: `Balao ${balloon.colorOption.label}`,
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

function normalizeColorOption(option, index) {
  const rawLabel = String(option?.label ?? "").trim();
  const normalizedLabel = rawLabel.toLowerCase();
  const rawColor = typeof option?.color === "string" ? option.color.trim() : "";
  const resolvedColor = rawColor || LABEL_COLOR_MAP[normalizedLabel] || DEFAULT_BALLOON_COLORS[index % DEFAULT_BALLOON_COLORS.length];

  return {
    ...option,
    label: rawLabel,
    color: resolvedColor,
  };
}
