export function clamp(value, min, max) {
  return Math.max(min, Math.min(value, max));
}

export function rectsOverlap(a, b) {
  // Sobreposicao estrita: apenas intersecao real bloqueia, sem colisao por toque de borda.
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}

function pointInRect(point, rect) {
  return (
    point.x >= rect.x &&
    point.x <= rect.x + rect.width &&
    point.y >= rect.y &&
    point.y <= rect.y + rect.height
  );
}

function orientation(a, b, c) {
  const value = (b.y - a.y) * (c.x - b.x) - (b.x - a.x) * (c.y - b.y);
  if (value === 0) return 0;
  return value > 0 ? 1 : 2;
}

function pointOnSegment(a, b, p) {
  return (
    p.x <= Math.max(a.x, b.x) &&
    p.x >= Math.min(a.x, b.x) &&
    p.y <= Math.max(a.y, b.y) &&
    p.y >= Math.min(a.y, b.y) &&
    orientation(a, b, p) === 0
  );
}

function segmentsIntersect(a, b, c, d) {
  const o1 = orientation(a, b, c);
  const o2 = orientation(a, b, d);
  const o3 = orientation(c, d, a);
  const o4 = orientation(c, d, b);

  if (o1 !== o2 && o3 !== o4) return true;

  if (o1 === 0 && pointOnSegment(a, b, c)) return true;
  if (o2 === 0 && pointOnSegment(a, b, d)) return true;
  if (o3 === 0 && pointOnSegment(c, d, a)) return true;
  return !!(o4 === 0 && pointOnSegment(c, d, b));


}

function pointInPolygon(point, polygonPoints) {
  if (!Array.isArray(polygonPoints) || polygonPoints.length < 3) return false;

  for (let i = 0; i < polygonPoints.length; i += 1) {
    const a = polygonPoints[i];
    const b = polygonPoints[(i + 1) % polygonPoints.length];
    if (pointOnSegment(a, b, point)) return true;
  }

  let isInside = false;

  for (let i = 0, j = polygonPoints.length - 1; i < polygonPoints.length; j = i, i += 1) {
    const xi = polygonPoints[i].x;
    const yi = polygonPoints[i].y;
    const xj = polygonPoints[j].x;
    const yj = polygonPoints[j].y;

    const intersects =
      yi > point.y !== yj > point.y &&
      point.x < ((xj - xi) * (point.y - yi)) / (yj - yi) + xi;

    if (intersects) {
      isInside = !isInside;
    }
  }

  return isInside;
}

function rectIntersectsPolygon(rect, polygonPoints) {
  if (!Array.isArray(polygonPoints) || polygonPoints.length < 3) return false;

  const rectPoints = [
    { x: rect.x, y: rect.y },
    { x: rect.x + rect.width, y: rect.y },
    { x: rect.x + rect.width, y: rect.y + rect.height },
    { x: rect.x, y: rect.y + rect.height },
  ];

  if (rectPoints.some((point) => pointInPolygon(point, polygonPoints))) return true;
  if (polygonPoints.some((point) => pointInRect(point, rect))) return true;

  for (let i = 0; i < rectPoints.length; i += 1) {
    const a = rectPoints[i];
    const b = rectPoints[(i + 1) % rectPoints.length];

    for (let j = 0; j < polygonPoints.length; j += 1) {
      const c = polygonPoints[j];
      const d = polygonPoints[(j + 1) % polygonPoints.length];
      if (segmentsIntersect(a, b, c, d)) return true;
    }
  }

  return false;
}

function collidesWithShape(playerRect, shape) {
  if (!shape) return false;

  if (shape.type === "polygon") {
    return rectIntersectsPolygon(playerRect, shape.points ?? []);
  }

  return rectsOverlap(playerRect, shape);
}

export function getPlayerCollisionRect(position, collisionBox) {
  return {
    x: position.x + collisionBox.offsetX,
    y: position.y + collisionBox.offsetY,
    width: collisionBox.width,
    height: collisionBox.height,
  };
}

export function collidesWithAny(position, collisionRects, collisionBox) {
  const playerRect = getPlayerCollisionRect(position, collisionBox);
  return collisionRects.some((rect) => rectsOverlap(playerRect, rect));
}

export function collidesWithAnyShape(position, collisionShapes, collisionBox) {
  const playerRect = getPlayerCollisionRect(position, collisionBox);
  return (collisionShapes ?? []).some((shape) => collidesWithShape(playerRect, shape));
}

export function resolveMovementStep({
  prev,
  moveVector,
  speed,
  bounds,
  collisionRects = [],
  collisionShapes,
  collisionBox,
}) {
  const activeCollisionShapes = collisionShapes ?? collisionRects;
  const wantedX = clamp(prev.x + moveVector.x * speed, bounds.minX, bounds.maxX);
  const wantedY = clamp(prev.y + moveVector.y * speed, bounds.minY, bounds.maxY);

  let nextX = wantedX;
  let nextY = prev.y;

  if (collidesWithAnyShape({ x: nextX, y: nextY }, activeCollisionShapes, collisionBox)) {
    nextX = prev.x;
  }

  nextY = wantedY;
  if (collidesWithAnyShape({ x: nextX, y: nextY }, activeCollisionShapes, collisionBox)) {
    nextY = prev.y;
  }

  return { x: nextX, y: nextY };
}

export function calculateCurrentStage(locations, completedLocationIds) {
  let maxUnlockedStage = 1;

  for (const location of locations) {
    if (completedLocationIds.includes(location.id)) {
      maxUnlockedStage = Math.max(maxUnlockedStage, (location.stageRequired ?? 1) + 1);
    }
  }

  return maxUnlockedStage;
}

export function selectObjectiveLocation(locationTriggers, currentStage) {
  const targetForStage = locationTriggers.find((location) => (location.stageRequired ?? 1) === currentStage);

  if (targetForStage) return targetForStage;

  return locationTriggers.find((location) => (location.stageRequired ?? 1) <= currentStage) ?? null;
}

export function resolveLocationEntryAction({
  isInside,
  wasInside,
  activeLocationId,
  blockedLocationId,
  currentStage,
  requiredStage,
}) {
  const canTrigger = isInside && !wasInside && !activeLocationId && !blockedLocationId;
  if (!canTrigger) return "none";

  return currentStage >= requiredStage ? "activate" : "block";
}

