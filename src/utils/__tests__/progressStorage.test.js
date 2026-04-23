import AsyncStorage from "@react-native-async-storage/async-storage";
import { loadProgress, saveProgress, markLocationCompleted } from "../progressStorage";

describe("progressStorage", () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    jest.clearAllMocks();
  });

  it("retorna progresso padrao quando nao existe dado", async () => {
    await expect(loadProgress()).resolves.toEqual({ completedLocationIds: [] });
  });

  it("normaliza progresso invalido ao salvar", async () => {
    const saved = await saveProgress({ completedLocationIds: ["school", 123, null, "house"] });

    expect(saved).toEqual({ completedLocationIds: ["school", "house"] });
    await expect(loadProgress()).resolves.toEqual({ completedLocationIds: ["school", "house"] });
  });

  it("retorna padrao quando JSON armazenado esta corrompido", async () => {
    await AsyncStorage.setItem("@english-game:progress:v1", "{invalid-json");

    await expect(loadProgress()).resolves.toEqual({ completedLocationIds: [] });
  });

  it("marca local como concluido sem duplicar ids", async () => {
    await saveProgress({ completedLocationIds: ["school"] });

    const updated = await markLocationCompleted("school");
    expect(updated).toEqual({ completedLocationIds: ["school"] });

    const next = await markLocationCompleted("house");
    expect(next).toEqual({ completedLocationIds: ["school", "house"] });
  });
});

