
import React from 'react';
import { Lab } from '../types';

interface WallOfProofProps {
  labs: Lab[];
  onDelete: (id: string) => void;
}

export const WallOfProof: React.FC<WallOfProofProps> = ({ labs, onDelete }) => {
  // Use timestamp instead of non-existent completedAt property
  const sortedLabs = [...labs].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  if (labs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-400">
        <p className="text-lg">No proof yet... Start your journey! 🚀</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto max-h-[500px] pr-2">
      {sortedLabs.map((lab) => (
        <div key={lab.id} className="group relative bg-white/80 border border-gray-100 p-4 rounded-2xl hover:shadow-md transition-all">
          <button
            onClick={() => onDelete(lab.id)}
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-400 transition-opacity"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div className="flex justify-between items-start mb-2">
            {/* Use category instead of provider to match Lab interface */}
            <span className="px-2 py-1 bg-[#fbcfe8] text-[10px] font-bold text-gray-700 rounded-md uppercase tracking-wider">
              {lab.category}
            </span>
            <span className="text-[10px] text-gray-400 font-mono">
              {new Date(lab.timestamp).toLocaleDateString()}
            </span>
          </div>
          {/* Use name instead of title to match Lab interface */}
          <h4 className="font-semibold text-gray-800 mb-2 truncate pr-4">{lab.name}</h4>
          <a
            /* Use githubLink instead of resourceLink to match Lab interface */
            href={lab.githubLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-xs font-medium text-blue-400 hover:text-blue-600 transition-colors"
          >
            View Resource
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      ))}
    </div>
  );
};
