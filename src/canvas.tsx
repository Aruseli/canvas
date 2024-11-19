import { useEffect, useRef, useState } from "react";
import { ConnectionPoint, dataConverter, Point, Rect } from "./data-converter";

const CanvasComponent: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [rect1, setRect1] = useState<Rect>({ position: { x: 100, y: 100 }, size: { width: 80, height: 60 } });
  const [rect2, setRect2] = useState<Rect>({ position: { x: 300, y: 200 }, size: { width: 100, height: 80 } });
  const [cPoint1, setCPoint1] = useState<ConnectionPoint>({ point: { x: 140, y: 100 }, angle: 0 });
  const [cPoint2, setCPoint2] = useState<ConnectionPoint>({ point: { x: 300, y: 160 }, angle: 270 });

  const [draggedRect, setDraggedRect] = useState<number | null>(null);
  const [dragOffset, setDragOffset] = useState<Point>({ x: 0, y: 0 });

  const updateConnectionPoint = (rect: Rect, cPoint: ConnectionPoint): ConnectionPoint => {
    const { position, size } = rect;
    const { angle } = cPoint;
    let newPoint: Point;

    switch (angle) {
      case 0: // right
        newPoint = { x: position.x + size.width / 2, y: position.y };
        break;
      case 90: // bottom
        newPoint = { x: position.x, y: position.y + size.height / 2 };
        break;
      case 180: // left
        newPoint = { x: position.x - size.width / 2, y: position.y };
        break;
      case 270: // top
        newPoint = { x: position.x, y: position.y - size.height / 2 };
        break;
      default:
        newPoint = cPoint.point;
    }

    return { ...cPoint, point: newPoint };
  };

  useEffect(() => {
    setCPoint1(prevCPoint => updateConnectionPoint(rect1, prevCPoint));
  }, [rect1]);

  useEffect(() => {
    setCPoint2(prevCPoint => updateConnectionPoint(rect2, prevCPoint));
  }, [rect2]);
  const isTooClose = (rect1: Rect, rect2: Rect): boolean => { 
    const distanceX = Math.abs(rect1.position.x - rect2.position.x); 
    const distanceY = Math.abs(rect1.position.y - rect2.position.y); 
    const minDistanceX = (rect1.size.width + rect2.size.width) / 2; 
    const minDistanceY = (rect1.size.height + rect2.size.height) / 2; 
    return distanceX < minDistanceX && distanceY < minDistanceY; 
  };
  const adjustRectPosition = (rect1: Rect, rect2: Rect, setRect: React.Dispatch<React.SetStateAction<Rect>>) => { 
    const distanceX = rect1.position.x - rect2.position.x; 
    const distanceY = rect1.position.y - rect2.position.y; 
    const minDistanceX = (rect1.size.width + rect2.size.width) / 2 + 10; 
    const minDistanceY = (rect1.size.height + rect2.size.height) / 2 + 10; 
    let newPosition = { ...rect1.position }; 
    if (Math.abs(distanceX) < minDistanceX) { 
      newPosition.x = rect2.position.x + (distanceX > 0 ? minDistanceX : -minDistanceX); 
    } 
    if (Math.abs(distanceY) < minDistanceY) { 
      newPosition.y = rect2.position.y + (distanceY > 0 ? minDistanceY : -minDistanceY); 
    } 
    setRect(prev => ({ ...prev, position: newPosition })); 
  };
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const drawRect = (rect: Rect, color: string) => { 
        ctx.strokeStyle = color; 
        ctx.strokeRect( 
          rect.position.x - rect.size.width / 2, 
          rect.position.y - rect.size.height / 2, 
          rect.size.width, 
          rect.size.height 
        ); 
      };  
      const color1 = isTooClose(rect1, rect2) ? 'red' : 'black'; 
      const color2 = isTooClose(rect2, rect1) ? 'red' : 'black'; 

      drawRect(rect1, color1); 
      drawRect(rect2, color2); 

      const points = dataConverter(rect1, rect2, cPoint1, cPoint2); 
      ctx.beginPath(); 
      ctx.moveTo(points[0].x, points[0].y); 
      for (let i = 1; i < points.length; i++) { 
        ctx.lineTo(points[i].x, points[i].y); 
      } 

      ctx.stroke(); 
      ctx.fillStyle = 'red'; 
      ctx.beginPath(); 
      ctx.arc(cPoint1.point.x, cPoint1.point.y, 3, 0, 2 * Math.PI); 
      ctx.arc(cPoint2.point.x, cPoint2.point.y, 3, 0, 2 * Math.PI); 
      ctx.fill(); 
    };

    draw();
  }, [rect1, rect2, cPoint1, cPoint2]);

  const handleMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    if (isPointInRect(x, y, rect1)) {
      setDraggedRect(1);
      setDragOffset({ x: x - rect1.position.x, y: y - rect1.position.y });
    } else if (isPointInRect(x, y, rect2)) {
      setDraggedRect(2);
      setDragOffset({ x: x - rect2.position.x, y: y - rect2.position.y });
    }
  };

  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (draggedRect === null) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    if (draggedRect === 1) {
      setRect1(prev => ({
        ...prev,
        position: { x: x - dragOffset.x, y: y - dragOffset.y }
      }));
    } else if (draggedRect === 2) {
      setRect2(prev => ({
        ...prev,
        position: { x: x - dragOffset.x, y: y - dragOffset.y }
      }));
    }
  };

  const handleMouseUp = () => {
    if (draggedRect === 1 && isTooClose(rect1, rect2)) { 
      adjustRectPosition(rect1, rect2, setRect1); 
    } else if (draggedRect === 2 && isTooClose(rect2, rect1)) { 
      adjustRectPosition(rect2, rect1, setRect2); 
    } 
    setDraggedRect(null);
  };

  const isPointInRect = (x: number, y: number, rect: Rect): boolean => {
    return x >= rect.position.x - rect.size.width / 2 &&
           x <= rect.position.x + rect.size.width / 2 &&
           y >= rect.position.y - rect.size.height / 2 &&
           y <= rect.position.y + rect.size.height / 2;
  };
  const handleInputChange = (
    rectIndex: number, 
    field: 'position' | 'size', 
    subField: 'x' | 'y' | 'width' | 'height', 
    value: number
  ) => {
    const setRect = rectIndex === 1 ? setRect1 : setRect2;
    setRect(prev => ({
      ...prev,
      [field]: {
        ...prev[field],
        [subField]: value
      }
    }));
  };
  const handleConnectionPointChange = (
    pointIndex: number,
    field: 'x' | 'y' | 'angle',
    value: number
  ) => {
    const setPoint = pointIndex === 1 ? setCPoint1 : setCPoint2;
    setPoint(prev => ({
      ...prev,
      [field === 'angle' ? 'angle' : 'point']: {
        ...(field === 'angle' ? prev : prev.point),
        [field]: value
      }
    }));
  };

  return (<div className="flex flex-col space-x-6 items-start w-full justify-start p-4 lg:p-8 lg:flex-row">
    <div>
      <canvas 
        ref={canvasRef}
        width={500}
        height={300}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className="border rounded border-gray-300"
      />
    </div>
    <div className="flex flex-row gap-x-6">
      <div className="flex flex-col items-start justify-center gap-y-4 mb-8">
        <h3 className="text-xl font-bold">Rectangle 1</h3>
        <label>
          <p className="mr-4 text-gray-500">X:</p>
          <input className="rounded border border-gray-300 focus:border-green-500 p-1" type="number" value={rect1.position.x} onChange={(e) => handleInputChange(1, 'position', 'x', Number(e.target.value))} />
        </label>
        <label>
          <p className="mr-4 text-gray-500">Y:</p>
          <input className="rounded border border-gray-300 focus:border-green-500 p-1" type="number" value={rect1.position.y} onChange={(e) => handleInputChange(1, 'position', 'y', Number(e.target.value))} />
        </label>
        <label>
          <p className="mr-4 text-gray-500">Width:</p> 
          <input className="rounded border border-gray-300 focus:border-green-500 p-1" type="number" value={rect1.size.width} onChange={(e) => handleInputChange(1, 'size', 'width', Number(e.target.value))} />
        </label>
        <label>
          <p className="mr-4 text-gray-500">Height:</p> 
          <input className="rounded border border-gray-300 focus:border-green-500 p-1" type="number" value={rect1.size.height} onChange={(e) => handleInputChange(1, 'size', 'height', Number(e.target.value))} />
        </label>
      </div>
      <div className="flex flex-col items-start justify-center gap-y-4 mb-8">
        <h3 className="text-xl font-bold">Rectangle 2</h3>
        <label> 
          <p className="mr-4 text-gray-500">X:</p> 
          <input className="rounded border border-gray-300 focus:border-green-500 p-1" type="number" value={rect2.position.x} onChange={(e) => handleInputChange(2, 'position', 'x', Number(e.target.value))} />
        </label>
        <label> 
          <p className="mr-4 text-gray-500">Y:</p> 
          <input className="rounded border border-gray-300 focus:border-green-500 p-1" type="number" value={rect2.position.y} onChange={(e) => handleInputChange(2, 'position', 'y', Number(e.target.value))} />
        </label>
        <label> 
          <p className="mr-4 text-gray-500">Width:</p> 
          <input className="rounded border border-gray-300 focus:border-green-500 p-1" type="number" value={rect2.size.width} onChange={(e) => handleInputChange(2, 'size', 'width', Number(e.target.value))} />
        </label>
        <label>
          <p className="mr-4 text-gray-500">Height:</p>
          <input className="rounded border border-gray-300 focus:border-green-500 p-1" type="number" value={rect2.size.height} onChange={(e) => handleInputChange(2, 'size', 'height', Number(e.target.value))} />
          </label>
      </div>
    </div>
    <div className="flex flex-col items-start justify-center gap-y-4 mb-8">
      <h3 className="text-xl font-bold">Connection Point 1</h3>
      <label>
        <p className="mr-4 text-gray-500">X:</p> 
        <input className="rounded border border-gray-300 focus:border-green-500 p-1" type="number" value={cPoint1.point.x} onChange={(e) => handleConnectionPointChange(1, 'x', Number(e.target.value))} />
      </label>
      <label>
        <p className="mr-4 text-gray-500">Y:</p> 
        <input className="rounded border border-gray-300 focus:border-green-500 p-1" type="number" value={cPoint1.point.y} onChange={(e) => handleConnectionPointChange(1, 'y', Number(e.target.value))} />
      </label>
      <h3 className="text-xl font-bold">Connection Point 2</h3>
      <label> 
        <p className="mr-4 text-gray-500">X:</p> 
        <input className="rounded border border-gray-300 focus:border-green-500 p-1" type="number" value={cPoint2.point.x} onChange={(e) => handleConnectionPointChange(2, 'x', Number(e.target.value))} />
      </label>
      <label>
        <p className="mr-4 text-gray-500">Y:</p> 
        <input className="rounded border border-gray-300 focus:border-green-500 p-1" type="number" value={cPoint2.point.y} onChange={(e) => handleConnectionPointChange(2, 'y', Number(e.target.value))} />
      </label>
    </div>
  </div>);
};

export default CanvasComponent;