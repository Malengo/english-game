import { buildBalloonCollectibles } from "../buildBalloonCollectibles";
import { schoolColorsBalloonMission } from "../balloonMissionConfig";

describe("buildBalloonCollectibles", () => {
  const mission = {
    missionId: "school-colors-red-balloons",
    balloonMission: schoolColorsBalloonMission,
  };

  it("gera baloes tipados com alvo e distratores", () => {
    const collectibles = buildBalloonCollectibles(mission, {
      worldWidth: 800,
      worldHeight: 600,
      rng: () => 0,
    });

    expect(collectibles).toHaveLength(schoolColorsBalloonMission.minCount);
    expect(collectibles.every((collectible) => collectible.type === "balloon")).toBe(true);
    expect(collectibles.filter((collectible) => collectible.isTarget)).toHaveLength(
      schoolColorsBalloonMission.minTargetCount
    );
    expect(collectibles.some((collectible) => !collectible.isTarget)).toBe(true);
  });
});
