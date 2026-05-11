export const MAGE_DIALOG_COOLDOWN_MS = 5000;

export function buildMageGuideSnapshot({
  hasVisitedSchoolToday,
  latestCompletedLesson,
  activeLessonMission,
  latestCompletedLessonMission,
  hasFinishedLatestLessonMission,
}) {
  return {
    hasVisitedSchoolToday: Boolean(hasVisitedSchoolToday),
    hasLessonToday: Boolean(latestCompletedLesson),
    hasActiveMission: Boolean(activeLessonMission),
    hasCompletedMission: Boolean(latestCompletedLessonMission && hasFinishedLatestLessonMission),
  };
}

export function resolveMageGuideState(snapshot) {
  if (!snapshot.hasVisitedSchoolToday || !snapshot.hasLessonToday) return "goToSchool";
  if (snapshot.hasActiveMission) return "offerMission";
  if (snapshot.hasCompletedMission) return "completedMission";
  return "noMission";
}

export function shouldSkipNpcDialogByCooldown(lastShownAt, now = Date.now(), cooldownMs = MAGE_DIALOG_COOLDOWN_MS) {
  if (!lastShownAt) return false;
  return now - lastShownAt < cooldownMs;
}

export function resolveMageGuideDialogConfig({
  state,
  dialogAnchor,
  activeLessonMission,
  activeLessonMissionList,
  latestCompletedLessonMission,
  onGoToSchool,
  onStartLessonMission,
}) {
  const base = {
    anchorX: dialogAnchor?.anchorX,
    anchorY: dialogAnchor?.anchorY,
    npcId: dialogAnchor?.npcId,
  };

  if (state === "goToSchool") {
    return {
      ...base,
      message: "Antes de seguir para missoes no mapa, conclua uma licao na Escola.",
      ctaLabel: "Ir para Escola",
      onPressCta: onGoToSchool,
    };
  }

  if (state === "offerMission" && activeLessonMission) {
    const missionIndex = activeLessonMissionList.findIndex(
      (mission) => mission.missionId === activeLessonMission.missionId
    );
    const missionSuffix =
      activeLessonMissionList.length > 1 && missionIndex >= 0
        ? ` (Missao ${missionIndex + 1}/${activeLessonMissionList.length})`
        : "";
    const guideMessage = `${
      activeLessonMission.feedbackRules?.guideMessage ??
      activeLessonMission.prompt ??
      "Vamos iniciar a missao."
    }${missionSuffix}`;

    if (activeLessonMission.type === "balloons" || activeLessonMission.type === "collectibles") {
      return {
        ...base,
        message: guideMessage,
        autoHideMs: 8000,
        unlockMissionId: activeLessonMission.missionId,
      };
    }

    return {
      ...base,
      message: guideMessage,
      ctaLabel: "Iniciar missao",
      onPressCta: onStartLessonMission,
    };
  }

  if (state === "completedMission" && latestCompletedLessonMission) {
    return {
      ...base,
      message: latestCompletedLessonMission.feedbackRules?.completionMessage ?? "Missao concluida!",
      autoHideMs: 8000,
    };
  }

  return {
    ...base,
    message: "Você já concluiu a missão desta lição. Volte à Escola para aprender algo novo.",
    autoHideMs: 8000,
  };
}
