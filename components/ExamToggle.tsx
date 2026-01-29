
import React from 'react';

interface ExamToggleProps {
  isEnabled: boolean;
  onToggle: () => void;
}

export const ExamToggle: React.FC<ExamToggleProps> = ({ isEnabled, onToggle }) => {
  return (
    <div className="flex items-center justify-between p-4 bg-white/50 rounded-2xl border border-white/20">
      <div className="flex flex-col">
        <span className="font-semibold text-gray-700">Exam Mode</span>
        <span className="text-xs text-gray-500">Pauses daily lab increment</span>
      </div>
      <button
        onClick={onToggle}
        className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors duration-300 focus:outline-none ${
          isEnabled ? 'bg-[#fbcfe8]' : 'bg-gray-200'
        }`}
      >
        <span
          className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform duration-300 ${
            isEnabled ? 'translate-x-7' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
};
