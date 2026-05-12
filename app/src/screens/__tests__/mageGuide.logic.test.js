import {
  buildMageGuideSnapshot,
  resolveMageGuideState,
  shouldSkipNpcDialogByCooldown,
  resolveMageGuideDialogConfig,
} from "../mageGuide.logic";

describe("mageGuide.logic", () => {
  it("resolve estado do mage por snapshot", () => {
    expect(resolveMageGuideState(buildMageGuideSnapshot({ hasVisitedSchoolToday: false }))).toBe("goToSchool");
    expect(
      resolveMageGuideState(
        buildMageGuideSnapshot({
          hasVisitedSchoolToday: true,
          latestCompletedLesson: { lessonId: "school-colors-1" },
          activeLessonMission: { missionId: "m1" },
        })
      )
    ).toBe("offerMission");
  });

  it("respeita cooldown de dialogo", () => {
    const now = 10000;
    expect(shouldSkipNpcDialogByCooldown(null, now, 5000)).toBe(false);
    expect(shouldSkipNpcDialogByCooldown(7000, now, 5000)).toBe(true);
    expect(shouldSkipNpcDialogByCooldown(2000, now, 5000)).toBe(false);
  });

  it("monta payload de dialogo para missao de mapa", () => {
    const payload = resolveMageGuideDialogConfig({
      state: "offerMission",
      dialogAnchor: { anchorX: 10, anchorY: 20, npcId: "mage-guide" },
      activeLessonMission: { missionId: "mission-a", type: "balloons", feedbackRules: { guideMessage: "Colete red" } },
      activeLessonMissionList: [{ missionId: "mission-a" }],
      latestCompletedLessonMission: null,
    });

    expect(payload.message).toContain("Colete red");
    expect(payload.unlockMissionId).toBe("mission-a");
  });
});
