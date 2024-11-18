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

  const edgePoints = [
    { x: left, y: (top + bottom) / 2 },
    { x: right, y: (top + bottom) / 2 },
    { x: (left + right) / 2, y: top },
    { x: (left + right) / 2, y: bottom }
  ];

  return edgePoints.reduce((nearest, edgePoint, index) => {
    const distance = Math.sqrt(Math.pow(edgePoint.x - point.x, 2) + Math.pow(edgePoint.y - point.y, 2));
    return distance < nearest.distance ? { ...sides[index], distance } : nearest;
  }, { side: "unknown", offset: { x: 0, y: 0 }, distance: Infinity });
};

export const dataConverter = (
  rect1: Rect,
  rect2: Rect,
  cPoint1: ConnectionPoint,
  cPoint2: ConnectionPoint
): Point[] => {
  const points: Point[] = [];
  const offset = 10; // Distance from rectangles

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

  const isInside = (point: Point, box: any) => 
    point.x >= box.left && point.x <= box.right && 
    point.y >= box.top && point.y <= box.bottom;

  let intermediatePoints: Point[] = [];

  if (edge1.side === "left" || edge1.side === "right") {
    const horizontalPoint = { x: firstOffsetPoint.x, y: cPoint2.point.y };
    
    if (isInside(horizontalPoint, box2)) {
      const topDistance = Math.abs(firstOffsetPoint.y - box2.top);
      const bottomDistance = Math.abs(firstOffsetPoint.y - box2.bottom);
      
      if (topDistance < bottomDistance) {
        intermediatePoints = [
          { x: firstOffsetPoint.x, y: box2.top },
          { x: cPoint2.point.x, y: box2.top }
        ];
      } else {
        intermediatePoints = [
          { x: firstOffsetPoint.x, y: box2.bottom },
          { x: cPoint2.point.x, y: box2.bottom }
        ];
      }
    } else {
      intermediatePoints = [horizontalPoint];
    }
  } else {
    const verticalPoint = { x: cPoint2.point.x, y: firstOffsetPoint.y };
    
    if (isInside(verticalPoint, box2)) {
      const leftDistance = Math.abs(firstOffsetPoint.x - box2.left);
      const rightDistance = Math.abs(firstOffsetPoint.x - box2.right);
      
      if (leftDistance < rightDistance) {
        intermediatePoints = [
          { x: box2.left, y: firstOffsetPoint.y },
          { x: box2.left, y: cPoint2.point.y + offset }
        ];
      } else {
        intermediatePoints = [
          { x: box2.right, y: firstOffsetPoint.y },
          { x: box2.right, y: cPoint2.point.y }
        ];
      }
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