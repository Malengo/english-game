import { schoolColorsLesson } from "../../data/schoolColorsLesson";

export const learnedColorOptions = Array.from(
  new Map(
    schoolColorsLesson.questions
      .flatMap((question) => question.options)
      .map((option) => [option.label, option])
  ).values()
);

export const schoolColorsBalloonMission = {
  targetColorLabel: "Red",
  minCount: 8,
  maxCount: 14,
  minTargetCount: 3,
  maxTargetCount: 6,
  size: 40,
  mapPadding: 96,
  colors: learnedColorOptions,
};
