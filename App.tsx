
import React, { useRef } from 'react';
import SymmetryCanvas, { type SymmetryCanvasHandle } from './components/SymmetryCanvas';
import Toolbar from './components/Toolbar';

const App: React.FC = () => {
  const canvasRef = useRef<SymmetryCanvasHandle>(null);

  const handleClear = () => {
    if (canvasRef.current) {
      canvasRef.current.clearCanvas();
    }
  };

  const handleResetAxis = () => {
    if (canvasRef.current) {
      canvasRef.current.resetAxis();
    }
  };

  return (
    <div className="relative w-screen h-screen flex flex-col items-center justify-center bg-gray-900 overflow-hidden">
      <header className="absolute top-0 left-0 right-0 p-4 text-center">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-200 tracking-wider">對稱繪圖板</h1>
        <p className="text-gray-400 text-sm">請先定義對稱軸，然後開始繪畫，見證奇蹟。</p>
      </header>
      
      <main className="flex-grow w-full h-full p-4 md:p-8 flex items-center justify-center">
        <SymmetryCanvas ref={canvasRef} />
      </main>

      <Toolbar onClear={handleClear} onResetAxis={handleResetAxis} />
    </div>
  );
};

export default App;
