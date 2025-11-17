
import React, { useRef, useEffect, useImperativeHandle, forwardRef, useState } from 'react';

// Types
type Point = { x: number; y: number };
type Mode = 'defining-axis' | 'drawing';

export interface SymmetryCanvasHandle {
  clearCanvas: () => void;
  resetAxis: () => void;
}

const SymmetryCanvas = forwardRef<SymmetryCanvasHandle>((props, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);

  // State
  const [mode, setMode] = useState<Mode>('defining-axis');
  const [axisPoints, setAxisPoints] = useState<Point[]>([]);

  // Drawing state
  const isDrawing = useRef(false);
  const lastPoint = useRef<Point | null>(null);

  const getCanvas = () => canvasRef.current;
  const getContext = () => contextRef.current;

  const drawSymmetryAxis = (p1: Point, p2: Point, isPreview = false) => {
    const ctx = getContext();
    if (!ctx) return;

    ctx.save();
    
    if (isPreview) {
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.setLineDash([5, 15]);
      ctx.strokeStyle = '#4A5568'; // gray-700
      ctx.lineWidth = 1;
      ctx.stroke();
    } else {
      const neonColor = '#00ffff'; // Cyan
      ctx.setLineDash([20, 5, 2, 5]); // Electric dash

      // Draw the outer glow
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.lineWidth = 4;
      ctx.strokeStyle = neonColor;
      ctx.shadowColor = neonColor;
      ctx.shadowBlur = 20;
      ctx.stroke();

      // Draw the inner "core" line
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.lineWidth = 1;
      ctx.strokeStyle = '#ffffff'; // White core
      ctx.shadowBlur = 0;
      ctx.stroke();
    }
    
    ctx.restore();
  };
  
  const setupCanvas = () => {
    const canvas = getCanvas();
    if (!canvas) return;

    const parent = canvas.parentElement;
    if (!parent) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = parent.getBoundingClientRect();

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;

    const context = canvas.getContext('2d');
    if (!context) return;

    context.scale(dpr, dpr);
    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.strokeStyle = 'white';
    context.lineWidth = 4;
    contextRef.current = context;
  };

  useImperativeHandle(ref, () => ({
    clearCanvas() {
      const canvas = getCanvas();
      const ctx = getContext();
      if (canvas && ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (mode === 'drawing' && axisPoints.length === 2) {
          drawSymmetryAxis(axisPoints[0], axisPoints[1]);
        }
      }
    },
    resetAxis() {
      const canvas = getCanvas();
      const ctx = getContext();
      if (canvas && ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
      setAxisPoints([]);
      setMode('defining-axis');
    },
  }));

  useEffect(() => {
    setupCanvas();
    const handleResize = () => {
        // Full reset on resize is simplest to manage canvas state
        setupCanvas();
        setAxisPoints([]);
        setMode('defining-axis');
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const getCoords = (e: MouseEvent | TouchEvent): Point | null => {
    const canvas = getCanvas();
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;

    if (e instanceof TouchEvent) {
      if (e.touches.length === 0) return null;
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  const reflectPoint = (p: Point): Point => {
    if (axisPoints.length < 2) return p;
    const [p1, p2] = axisPoints;

    const A = p2.y - p1.y;
    const B = p1.x - p2.x;
    const C = -A * p1.x - B * p1.y;

    const denominator = A * A + B * B;
    if (denominator === 0) return p;

    const value = A * p.x + B * p.y + C;
    const reflectedX = p.x - (2 * A * value) / denominator;
    const reflectedY = p.y - (2 * B * value) / denominator;

    return { x: reflectedX, y: reflectedY };
  };

  const handlePointerDown = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const coords = getCoords(e.nativeEvent);
    if (!coords) return;

    if (mode === 'defining-axis') {
      const newAxisPoints = [...axisPoints, coords];
      setAxisPoints(newAxisPoints);

      if (newAxisPoints.length === 2) {
        const ctx = getContext();
        if (!ctx) return;
        ctx.clearRect(0, 0, getCanvas()!.width, getCanvas()!.height);
        drawSymmetryAxis(newAxisPoints[0], newAxisPoints[1]);
        setMode('drawing');
      }
    } else {
      isDrawing.current = true;
      lastPoint.current = coords;
    }
  };

  const handlePointerUp = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (mode === 'drawing') {
      isDrawing.current = false;
      lastPoint.current = null;
    }
  };

  const handlePointerMove = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const coords = getCoords(e.nativeEvent);
    if (!coords) return;

    if (mode === 'defining-axis' && axisPoints.length === 1) {
      const ctx = getContext();
      if (!ctx) return;
      ctx.clearRect(0, 0, getCanvas()!.width, getCanvas()!.height);
      
      ctx.save();
      ctx.beginPath();
      ctx.arc(axisPoints[0].x, axisPoints[0].y, 5, 0, 2 * Math.PI);
      ctx.fillStyle = '#90cdf4'; // blue-300
      ctx.fill();
      ctx.restore();

      drawSymmetryAxis(axisPoints[0], coords, true);
    } else if (mode === 'drawing' && isDrawing.current) {
      const ctx = getContext();
      if (!ctx || !lastPoint.current) return;

      const mirroredCoords = reflectPoint(coords);
      const lastMirroredPoint = reflectPoint(lastPoint.current);

      ctx.beginPath();
      ctx.moveTo(lastPoint.current.x, lastPoint.current.y);
      ctx.lineTo(coords.x, coords.y);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(lastMirroredPoint.x, lastMirroredPoint.y);
      ctx.lineTo(mirroredCoords.x, mirroredCoords.y);
      ctx.stroke();

      lastPoint.current = coords;
    }
  };

  return (
    <div className="relative w-full h-full max-w-6xl max-h-[80vh]">
      {mode === 'defining-axis' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/50 rounded-lg pointer-events-none z-10 backdrop-blur-sm">
          <h2 className="text-2xl font-bold text-gray-200">設定對稱軸</h2>
          <p className="text-gray-400 mt-2">
            {axisPoints.length === 0
              ? '點擊任意位置以設定第一個點。'
              : '點擊任意位置以設定第二個點。'}
          </p>
        </div>
      )}
      <canvas
        ref={canvasRef}
        className="bg-gray-800 rounded-lg shadow-2xl cursor-crosshair touch-none w-full h-full"
        onMouseDown={handlePointerDown}
        onMouseMove={handlePointerMove}
        onMouseUp={handlePointerUp}
        onMouseLeave={handlePointerUp}
        onTouchStart={handlePointerDown}
        onTouchMove={handlePointerMove}
        onTouchEnd={handlePointerUp}
        onTouchCancel={handlePointerUp}
      />
    </div>
  );
});

export default SymmetryCanvas;
