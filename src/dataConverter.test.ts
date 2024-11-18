export type Point = { x: number; y: number; };
export type Size = { width: number; height: number; };
export type Rect = { position: Point; size: Size; };
export type ConnectionPoint = { point: Point; angle: number; };

const BUFFER = 10; 

export const dataConverter = (
  rect1: Rect,
  rect2: Rect,
  cPoint1: ConnectionPoint,
  cPoint2: ConnectionPoint
): Point[] => {
  const points: Point[] = [];

  const isOnBoundary = (rect: Rect, connPoint: ConnectionPoint): boolean => {
    const { x, y } = connPoint.point;
    const { position, size } = rect;
    const halfWidth = size.width / 2;
    const halfHeight = size.height / 2;

    const onLeftOrRightBoundary = (x === position.x - halfWidth || x === position.x + halfWidth) && (y >= position.y - halfHeight && y <= position.y + halfHeight);
    const onTopOrBottomBoundary = (y === position.y - halfHeight || y === position.y + halfHeight) && (x >= position.x - halfWidth && x <= position.x + halfWidth);

    return onLeftOrRightBoundary || onTopOrBottomBoundary;
  };

  const isValidAngle = (angle: number): boolean => {
    return [0, 90, 180, 270].includes(angle);
  };

  if (!isOnBoundary(rect1, cPoint1) || !isValidAngle(cPoint1.angle)) {
    throw new Error("Connection point 1 is not on the boundary or angle is not valid.");
  }

  if (!isOnBoundary(rect2, cPoint2) || !isValidAngle(cPoint2.angle)) {
    throw new Error("Connection point 2 is not on the boundary or angle is not valid.");
  }

  points.push(cPoint1.point);

  const getNextPoint = (point: Point, angle: number, distance: number): Point => {
    switch (angle) {
      case 0: return { x: point.x + distance, y: point.y };
      case 90: return { x: point.x, y: point.y + distance };
      case 180: return { x: point.x - distance, y: point.y };
      case 270: return { x: point.x, y: point.y - distance };
      default: return point;
    }
  };

  const firstOutPoint = getNextPoint(cPoint1.point, cPoint1.angle, BUFFER);
  points.push(firstOutPoint);

  const midPoint: Point = { x: (rect1.position.x + rect2.position.x) / 2, y: (rect1.position.y + rect2.position.y) / 2 };
  points.push(midPoint);

  const secondOutPoint = getNextPoint(cPoint2.point, cPoint2.angle, BUFFER);
  points.push(secondOutPoint);

  points.push(cPoint2.point);

  return points;
};