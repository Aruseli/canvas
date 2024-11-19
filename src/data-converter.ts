export type Point = {
  x: number;
  y: number;
};

export type Size = {
  width: number;
  height: number;
};

export type Rect = {
  position: Point; // center of the rectangle
  size: Size;
};

export type ConnectionPoint = {
  point: Point;
  angle: number; // angle in degrees
};

interface Side {
  side: string;
  offset: Point;
}

const getRectEdges = (rect: Rect) => {
  const { position, size } = rect;
  return {
    left: position.x - size.width / 2,
    right: position.x + size.width / 2,
    top: position.y - size.height / 2,
    bottom: position.y + size.height / 2,
  };
};

const determineEdge = (rect: Rect, point: Point): Side => {
  const { left, right, top, bottom } = getRectEdges(rect);
  const sides: Side[] = [
    { side: "left", offset: { x: -10, y: 0 } },
    { side: "right", offset: { x: 10, y: 0 } },
    { side: "top", offset: { x: 0, y: -10 } },
    { side: "bottom", offset: { x: 0, y: 10 } }
  ];

  let nearestEdge = { side: "unknown", offset: { x: 0, y: 0 }, distanceSq: Infinity };
  
  const edgePoints = [
    { x: left, y: (top + bottom) / 2 },
    { x: right, y: (top + bottom) / 2 },
    { x: (left + right) / 2, y: top },
    { x: (left + right) / 2, y: bottom }
  ];

  for (let i = 0; i < edgePoints.length; i++) {
    const edgePoint = edgePoints[i];
    const distanceSq = Math.pow(edgePoint.x - point.x, 2) + Math.pow(edgePoint.y - point.y, 2);
    
    if (distanceSq < nearestEdge.distanceSq) {
      nearestEdge = { ...sides[i], distanceSq };
    }
  }

  return nearestEdge;
};

const isInside = (point: Point, box: any): boolean => 
  point.x >= box.left && point.x <= box.right &&
  point.y >= box.top && point.y <= box.bottom;

export const dataConverter = (
  rect1: Rect,
  rect2: Rect,
  cPoint1: ConnectionPoint,
  cPoint2: ConnectionPoint
): Point[] => {
  const points: Point[] = [];
  const offset = 10; 
  const edge1 = determineEdge(rect1, cPoint1.point);
  const edge2 = determineEdge(rect2, cPoint2.point);

  points.push(cPoint1.point);

  const firstOffsetPoint = {
    x: cPoint1.point.x + edge1.offset.x,
    y: cPoint1.point.y + edge1.offset.y
  };
  points.push(firstOffsetPoint);

  const box2 = {
    left: rect2.position.x - rect2.size.width / 2 - offset,
    right: rect2.position.x + rect2.size.width / 2 + offset,
    top: rect2.position.y - rect2.size.height / 2 - offset,
    bottom: rect2.position.y + rect2.size.height / 2 + offset
  };

  let intermediatePoints: Point[] = [];

  if (edge1.side === "left" || edge1.side === "right") {
    const horizontalPoint = { x: firstOffsetPoint.x, y: cPoint2.point.y };
    
    if (isInside(horizontalPoint, box2)) {
      const targetY = (Math.abs(firstOffsetPoint.y - box2.top) < Math.abs(firstOffsetPoint.y - box2.bottom))
        ? box2.top : box2.bottom;
      intermediatePoints = [
        { x: firstOffsetPoint.x, y: targetY },
        { x: cPoint2.point.x, y: targetY }
      ];
    } else {
      intermediatePoints = [horizontalPoint];
    }
  } else {
    const verticalPoint = { x: cPoint2.point.x, y: firstOffsetPoint.y };
    if (isInside(verticalPoint, box2)) {
      const targetX = (Math.abs(firstOffsetPoint.x - box2.left) < Math.abs(firstOffsetPoint.x - box2.right))
        ? box2.left : box2.right;
      intermediatePoints = [
        { x: targetX, y: firstOffsetPoint.y },
        { x: targetX, y: cPoint2.point.y + offset }
      ];
    } else {
      intermediatePoints = [verticalPoint];
    }
  }

  points.push(...intermediatePoints);

  const lastOffsetPoint = {
    x: cPoint2.point.x + edge2.offset.x,
    y: cPoint2.point.y + edge2.offset.y
  };
  points.push(lastOffsetPoint);
  points.push(cPoint2.point);

  return points;
};