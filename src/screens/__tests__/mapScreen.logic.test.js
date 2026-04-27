import {
  clamp,
  rectsOverlap,
  getPlayerCollisionRect,
  collidesWithAny,
  collidesWithAnyShape,
  resolveMovementStep,
  calculateCurrentStage,
  selectObjectiveLocation,
  resolveLocationEntryAction,
  getAabbRect,
  areAabbsOverlapping,
  isPlayerNearNpc,
  resolveNpcPatrolStep,
} from "../mapScreen.logic";

describe("mapScreen.logic", () => {
  const collisionBox = { width: 48, height: 64, offsetX: -4, offsetY: -24 };

  it("clamp limita valores no intervalo", () => {
    expect(clamp(5, 0, 10)).toBe(5);
    expect(clamp(-5, 0, 10)).toBe(0);
    expect(clamp(20, 0, 10)).toBe(10);
  });

  it("rectsOverlap detecta apenas sobreposicao estrita", () => {
    const a = { x: 0, y: 0, width: 10, height: 10 };
    const b = { x: 5, y: 5, width: 10, height: 10 };
    const c = { x: 10, y: 0, width: 5, height: 5 };

    expect(rectsOverlap(a, b)).toBe(true);
    expect(rectsOverlap(a, c)).toBe(false);
  });

  it("calcula retangulo de colisao do player", () => {
    const rect = getPlayerCollisionRect({ x: 100, y: 80 }, collisionBox);

    expect(rect).toEqual({ x: 96, y: 56, width: 48, height: 64 });
  });

  it("detecta colisao com qualquer obstaculo", () => {
    const collisionRects = [{ x: 90, y: 50, width: 30, height: 30 }];

    expect(collidesWithAny({ x: 100, y: 80 }, collisionRects, collisionBox)).toBe(true);
    expect(collidesWithAny({ x: 300, y: 300 }, collisionRects, collisionBox)).toBe(false);
  });

  it("detecta colisao com shape retangular na API nova", () => {
    const collisionShapes = [{ type: "rect", x: 90, y: 50, width: 30, height: 30 }];

    expect(collidesWithAnyShape({ x: 100, y: 80 }, collisionShapes, collisionBox)).toBe(true);
    expect(collidesWithAnyShape({ x: 300, y: 300 }, collisionShapes, collisionBox)).toBe(false);
  });

  it("detecta colisao com shape poligonal", () => {
    const collisionShapes = [
      {
        type: "polygon",
        points: [
          { x: 90, y: 50 },
          { x: 130, y: 50 },
          { x: 130, y: 100 },
          { x: 90, y: 100 },
        ],
      },
    ];

    expect(collidesWithAnyShape({ x: 100, y: 80 }, collisionShapes, collisionBox)).toBe(true);
    expect(collidesWithAnyShape({ x: 300, y: 300 }, collisionShapes, collisionBox)).toBe(false);
  });

  it("resolve movimento livre quando nao ha obstaculo", () => {
    const next = resolveMovementStep({
      prev: { x: 100, y: 100 },
      moveVector: { x: 1, y: 0.5 },
      speed: 10,
      bounds: { minX: 0, maxX: 200, minY: 0, maxY: 200 },
      collisionRects: [],
      collisionBox,
    });

    expect(next).toEqual({ x: 110, y: 105 });
  });

  it("bloqueia eixo X e permite deslizar no eixo Y quando colide", () => {
    const collisionRects = [{ x: 145, y: 76, width: 20, height: 9 }];

    const next = resolveMovementStep({
      prev: { x: 100, y: 100 },
      moveVector: { x: 1, y: 1 },
      speed: 10,
      bounds: { minX: 0, maxX: 300, minY: 0, maxY: 300 },
      collisionRects,
      collisionBox,
    });

    expect(next.x).toBe(100);
    expect(next.y).toBe(110);
  });

  it("calcula stage atual com base em locais concluidos", () => {
    const locations = [
      { id: "school", stageRequired: 1 },
      { id: "house", stageRequired: 2 },
      { id: "shop", stageRequired: 6 },
    ];

    expect(calculateCurrentStage(locations, [])).toBe(1);
    expect(calculateCurrentStage(locations, ["school"])).toBe(2);
    expect(calculateCurrentStage(locations, ["school", "house"])).toBe(3);
    expect(calculateCurrentStage(locations, ["shop"])).toBe(7);
  });

  it("seleciona objetivo da fase atual ou fallback destravado", () => {
    const locationTriggers = [
      { id: "school", stageRequired: 1 },
      { id: "house", stageRequired: 2 },
      { id: "bakery", stageRequired: 3 },
    ];

    expect(selectObjectiveLocation(locationTriggers, 2).id).toBe("house");
    expect(selectObjectiveLocation(locationTriggers, 4).id).toBe("school");
    expect(selectObjectiveLocation([], 1)).toBeNull();
  });

  it("decide acao de entrada no local", () => {
    const base = {
      isInside: true,
      wasInside: false,
      activeLocationId: null,
      blockedLocationId: null,
      requiredStage: 2,
    };

    expect(resolveLocationEntryAction({ ...base, currentStage: 2 })).toBe("activate");
    expect(resolveLocationEntryAction({ ...base, currentStage: 1 })).toBe("block");
    expect(resolveLocationEntryAction({ ...base, wasInside: true, currentStage: 2 })).toBe("none");
  });

  it("monta retangulo AABB com offsets", () => {
    const rect = getAabbRect(
      { x: 200, y: 100 },
      { width: 32, height: 32, offsetX: 0, offsetY: 0 }
    );

    expect(rect).toEqual({ x: 200, y: 100, width: 32, height: 32 });
  });

  it("detecta overlap de AABBs com padding", () => {
    const first = { x: 0, y: 0, width: 10, height: 10 };
    const second = { x: 12, y: 0, width: 10, height: 10 };

    expect(areAabbsOverlapping(first, second, 0)).toBe(false);
    expect(areAabbsOverlapping(first, second, 2)).toBe(true);
  });

  it("detecta quando player esta perto do NPC por AABB", () => {
    const near = isPlayerNearNpc({
      playerPosition: { x: 100, y: 80 },
      playerHitbox: { width: 28, height: 16, offsetX: 6, offsetY: 24 },
      npcPosition: { x: 122, y: 81 },
      npcHitbox: { width: 32, height: 32, offsetX: 0, offsetY: 0 },
      padding: 2,
    });

    const far = isPlayerNearNpc({
      playerPosition: { x: 100, y: 80 },
      playerHitbox: { width: 28, height: 16, offsetX: 6, offsetY: 24 },
      npcPosition: { x: 300, y: 300 },
      npcHitbox: { width: 32, height: 32, offsetX: 0, offsetY: 0 },
      padding: 2,
    });

    expect(near).toBe(true);
    expect(far).toBe(false);
  });

  it("avanca NPC em direcao ao proximo waypoint", () => {
    const step = resolveNpcPatrolStep({
      position: { x: 100, y: 100 },
      patrolPath: [
        { x: 100, y: 100 },
        { x: 120, y: 100 },
      ],
      targetIndex: 1,
      speed: 5,
      arriveDistance: 1,
    });

    expect(step.position.x).toBe(105);
    expect(step.position.y).toBe(100);
    expect(step.targetIndex).toBe(1);
    expect(step.direction).toBe("right");
    expect(step.isMoving).toBe(true);
  });

  it("troca waypoint quando ja esta no alvo", () => {
    const step = resolveNpcPatrolStep({
      position: { x: 120, y: 100 },
      patrolPath: [
        { x: 100, y: 100 },
        { x: 120, y: 100 },
      ],
      targetIndex: 1,
      speed: 5,
      arriveDistance: 1,
    });

    expect(step.targetIndex).toBe(0);
    expect(step.direction).toBe("left");
    expect(step.isMoving).toBe(true);
  });
});

