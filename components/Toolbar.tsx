
import React from 'react';
import { PenIcon, TrashIcon, RulerIcon } from './icons';

interface ToolbarProps {
  onClear: () => void;
  onResetAxis: () => void;
}

const Toolbar: React.FC<ToolbarProps> = ({ onClear, onResetAxis }) => {
  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-2 p-2 bg-gray-800/60 backdrop-blur-md rounded-full shadow-lg border border-gray-700">
      <button className="p-3 bg-blue-600 text-white rounded-full transition-transform duration-150 ease-in-out cursor-default" aria-label="畫筆工具">
        <PenIcon className="w-6 h-6" />
      </button>
      <button
        onClick={onResetAxis}
        className="p-3 text-gray-300 hover:bg-indigo-500 hover:text-white rounded-full transition-all duration-150 ease-in-out active:scale-90"
        aria-label="設定對稱軸"
      >
        <RulerIcon className="w-6 h-6" />
      </button>
      <button
        onClick={onClear}
        className="p-3 text-gray-300 hover:bg-red-500 hover:text-white rounded-full transition-all duration-150 ease-in-out active:scale-90"
        aria-label="清除畫布"
      >
        <TrashIcon className="w-6 h-6" />
      </button>
    </div>
  );
};

export default Toolbar;
