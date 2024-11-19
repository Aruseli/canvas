export type Point = {
  x: number;
  y: number;
};
export type Size = {
  width: number;
  height: number;
};
export type Rect = {
  position: Point; // координата центра прямоугольника
  size: Size;
};
export type ConnectionPoint = {
  point: Point;
  angle: number; // угол в градусах
};

export const dataConverter = (
  rect1: Rect, 
  rect2: Rect, 
  cPoint1: ConnectionPoint, 
  cPoint2: ConnectionPoint
): Point[] => {
  const points: Point[] = [];
  const offset = 20;

  const getSide = (rect: Rect, point: Point): string => {
    const { position, size } = rect;
    const halfWidth = size.width / 2;
    const halfHeight = size.height / 2;
    if (Math.abs(point.x - (position.x - halfWidth)) < 1) return 'left';
    if (Math.abs(point.x - (position.x + halfWidth)) < 1) return 'right';
    if (Math.abs(point.y - (position.y - halfHeight)) < 1) return 'top';
    if (Math.abs(point.y - (position.y + halfHeight)) < 1) return 'bottom';
    return 'unknown';
  };

  const side1 = getSide(rect1, cPoint1.point);
  const side2 = getSide(rect2, cPoint2.point);

  const offsetPoint = (point: Point, side: string): Point => {
    const newPoint = { ...point };
    if (side === 'left') newPoint.x -= offset;
    if (side === 'right') newPoint.x += offset;
    if (side === 'top') newPoint.y -= offset;
    if (side === 'bottom') newPoint.y += offset;
    return newPoint;
  };

  const offsetPoint1 = offsetPoint(cPoint1.point, side1);
  const offsetPoint2 = offsetPoint(cPoint2.point, side2);

  const rect1Bounds = {
    left: rect1.position.x - rect1.size.width / 2,
    right: rect1.position.x + rect1.size.width / 2,
    top: rect1.position.y - rect1.size.height / 2,
    bottom: rect1.position.y + rect1.size.height / 2,
  };

  const rect2Bounds = {
    left: rect2.position.x - rect2.size.width / 2,
    right: rect2.position.x + rect2.size.width / 2,
    top: rect2.position.y - rect2.size.height / 2,
    bottom: rect2.position.y + rect2.size.height / 2,
  };

  let intermediatePoints: Point[] = [];

  if (side1 === 'left' || side1 === 'right') {
    const horizontalX = offsetPoint1.x;
    const horizontalY = offsetPoint2.y;
    if (horizontalY > rect1Bounds.top && horizontalY < rect1Bounds.bottom) {
      const verticalX = side1 === 'left' ? rect1Bounds.left - offset : rect1Bounds.right + offset;
      intermediatePoints = [
        { x: horizontalX, y: rect2Bounds.top < rect1Bounds.top ? rect1Bounds.top - offset : rect1Bounds.bottom + offset },
        { x: verticalX, y: rect2Bounds.top < rect1Bounds.top ? rect1Bounds.top - offset : rect1Bounds.bottom + offset },
        { x: verticalX, y: horizontalY }
      ];
    } else if (horizontalX > rect2Bounds.left && horizontalX < rect2Bounds.right) {
      intermediatePoints = [
        { x: horizontalX, y: rect2Bounds.top - offset },
        { x: offsetPoint2.x, y: rect2Bounds.top - offset }
      ];
    } else {
      intermediatePoints = [{ x: horizontalX, y: horizontalY }];
    }
  } else {
    const verticalX = offsetPoint2.x;
    const verticalY = offsetPoint1.y;
    if (verticalX > rect1Bounds.left && verticalX < rect1Bounds.right) {
      const horizontalY = side1 === 'top' ? rect1Bounds.top - offset : rect1Bounds.bottom + offset;
      intermediatePoints = [
        { x: rect2Bounds.left < rect1Bounds.left ? rect1Bounds.left - offset : rect1Bounds.right + offset, y: verticalY },
        { x: rect2Bounds.left < rect1Bounds.left ? rect1Bounds.left - offset : rect1Bounds.right + offset, y: horizontalY },
        { x: verticalX, y: horizontalY }
      ];
    } else if (verticalY > rect2Bounds.top && verticalY < rect2Bounds.bottom) {
      intermediatePoints = [
        { x: rect2Bounds.left - offset, y: verticalY },
        { x: rect2Bounds.left - offset, y: offsetPoint2.y }
      ];
    } else {
      intermediatePoints = [{ x: verticalX, y: verticalY }];
    }
  }

  points.push(cPoint1.point, offsetPoint1, ...intermediatePoints, offsetPoint2, cPoint2.point);
  return points;
};
