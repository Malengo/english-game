import { locations, getLocationById, getLocationsByStage } from "../locationConfig";

describe("locationConfig", () => {
  it("expoe lista de localizacoes com escola configurada", () => {
    expect(Array.isArray(locations)).toBe(true);
    expect(locations.length).toBeGreaterThan(0);
    expect(locations.some((location) => location.id === "school")).toBe(true);
  });

  it("retorna localizacao pelo id", () => {
    const school = getLocationById("school");

    expect(school).toBeTruthy();
    expect(school.name).toBe("Escola");
    expect(school.stageRequired).toBe(1);
  });

  it("retorna undefined para id inexistente", () => {
    expect(getLocationById("unknown-place")).toBeUndefined();
  });

  it("filtra localizacoes por stage", () => {
    const stageOne = getLocationsByStage(1);
    const stageTwo = getLocationsByStage(2);

    expect(stageOne.every((location) => location.stageRequired <= 1)).toBe(true);
    expect(stageTwo.every((location) => location.stageRequired <= 2)).toBe(true);
    expect(stageTwo.length).toBeGreaterThanOrEqual(stageOne.length);
  });
});

