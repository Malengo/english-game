import {
  getLessonById,
  getFirstLessonForLocation,
  getNextLessonInLocation,
  getNextPendingLessonForLocation,
} from "../lessonCatalog";

describe("lessonCatalog", () => {
  it("retorna primeira licao por local", () => {
    expect(getFirstLessonForLocation("school")?.id).toBe("school-colors-lesson");
    expect(getFirstLessonForLocation("house")?.id).toBe("house-objects-lesson");
    expect(getFirstLessonForLocation("bakery")?.id).toBe("bakery-foods-lesson");
  });

  it("retorna proxima licao dentro do mesmo local", () => {
    expect(getNextLessonInLocation("school", "school-colors-lesson")?.id).toBe("school-classroom-lesson");
    expect(getNextLessonInLocation("school", "school-classroom-lesson")).toBeNull();
  });

  it("retorna proxima licao pendente por local", () => {
    expect(
      getNextPendingLessonForLocation("school", [{ lessonId: "school-colors-lesson" }])?.id
    ).toBe("school-classroom-lesson");

    expect(
      getNextPendingLessonForLocation("school", [
        { lessonId: "school-colors-lesson" },
        { lessonId: "school-classroom-lesson" },
      ])
    ).toBeNull();
  });

  it("resolve licao por id", () => {
    expect(getLessonById("school-colors-lesson")?.title).toBe("Colors");
  });
});

