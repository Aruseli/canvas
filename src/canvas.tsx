import React, { useEffect, useRef } from 'react';
import { dataConverter, Point, Rect } from './data-converter';

const CanvasComponent: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.error("Failed to get canvas context");
      return;
    }
    // Define two rectangles and connection points
    const rect1 = { position:{ x :100,y :100}, size:{ width :80,height :50 } };
    const rect2 = { position:{ x :300,y :100}, size:{ width :80,height :50 } };
    const connection1 = { point:{ x :100,y :75}, angle :90 }; 
    const connection2 = { point:{ x :300,y :125}, angle :90 }; 

    // Function to draw rectangles
    const drawRect = (rect: Rect) => {
      ctx.fillStyle='lightblue';
      ctx.fillRect(rect.position.x - rect.size.width / 2, rect.position.y - rect.size.height / 2, rect.size.width, rect.size.height);
    };

    // Draw rectangles
    drawRect(rect1);
    drawRect(rect2);

    // Calculate points for the broken line using dataConverter
    const points = dataConverter(rect1, rect2, connection1, connection2);

    // Function to draw a broken line
    const drawLine = (points: Point[]) => {
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    
    for (let i=0; i<points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
    }
    
    ctx.strokeStyle='red';
    ctx.lineWidth=1;
    ctx.stroke();
  };

  // Draw broken line
  drawLine(points);
      
  }, []);

  return <canvas ref={canvasRef} width={400} height={400} style={{ border:'1px solid #000' }} />;
};

export default CanvasComponent;