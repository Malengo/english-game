import {
  ensureLessonCatalogLoaded,
  getLessonById,
  getFirstLessonForLocation,
  getNextLessonInLocation,
  getNextPendingLessonForLocation,
} from "../lessonCatalog";
import { fetchLessons } from "../../services/lessonService";

jest.mock("../../services/lessonService", () => ({
  fetchLessons: jest.fn(),
}));

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

  it("monta steps de ensinamento antes das perguntas remotas", async () => {
    fetchLessons.mockResolvedValue([
      {
        id: "remote-colors-id",
        slug: "school-colors-lesson",
        title: "Colors",
        description: "Aprenda cores",
        locationId: "school",
        stageRequired: 1,
        items: [
          {
            id: "item-red",
            type: "VOCABULARY",
            text: "Red",
            translation: "Vermelho",
            orderIndex: 0,
            audioUrl: "https://example.test/red.mp3",
          },
        ],
        exercises: [
          {
            id: "exercise-apple",
            prompt: "What color is the apple?",
            emoji: "apple",
            type: "MULTIPLE_CHOICE",
            correctAnswer: "Red",
            orderIndex: 0,
            options: [
              { id: "red", text: "Red", correct: true, orderIndex: 0 },
              { id: "blue", text: "Blue", correct: false, orderIndex: 1 },
            ],
          },
        ],
      },
    ]);

    await ensureLessonCatalogLoaded();

    const lesson = getLessonById("school-colors-lesson");
    expect(lesson.steps).toEqual([
      expect.objectContaining({
        id: "item-red",
        type: "teaching",
        itemType: "VOCABULARY",
        audioUrl: "https://example.test/red.mp3",
      }),
      expect.objectContaining({
        id: "exercise-apple",
        type: "question",
        prompt: "What color is the apple?",
      }),
    ]);
  });
});
