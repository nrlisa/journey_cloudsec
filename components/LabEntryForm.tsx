
import React, { useState } from 'react';
// Corrected imports to match exported members of types.ts
import { LabCategory, CATEGORIES } from '../types';

interface LabEntryFormProps {
  onAddLab: (title: string, category: LabCategory, link: string) => void;
}

export const LabEntryForm: React.FC<LabEntryFormProps> = ({ onAddLab }) => {
  const [title, setTitle] = useState('');
  // Updated state type and default value to be a valid LabCategory ('AWS')
  const [category, setCategory] = useState<LabCategory>('AWS');
  const [link, setLink] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !link) return;
    onAddLab(title, category, link);
    setTitle('');
    setLink('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-600 mb-1">Lab Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., AWS VPC Peering Lab"
          className="w-full px-4 py-3 rounded-xl bg-white/60 border border-gray-100 focus:border-[#bfdbfe] focus:ring-2 focus:ring-[#bfdbfe] outline-none transition-all"
          required
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as LabCategory)}
            className="w-full px-4 py-3 rounded-xl bg-white/60 border border-gray-100 focus:border-[#bfdbfe] focus:ring-2 focus:ring-[#bfdbfe] outline-none transition-all appearance-none"
          >
            {/* Switched to CATEGORIES from types.ts */}
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Resource Link</label>
          <input
            type="url"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            placeholder="GitHub/Docs Link"
            className="w-full px-4 py-3 rounded-xl bg-white/60 border border-gray-100 focus:border-[#bfdbfe] focus:ring-2 focus:ring-[#bfdbfe] outline-none transition-all"
            required
          />
        </div>
      </div>
      <button
        type="submit"
        className="w-full py-3 bg-[#bfdbfe] hover:bg-[#a5c9f9] text-gray-800 font-bold rounded-xl transition-all shadow-sm hover:shadow-md active:scale-[0.98]"
      >
        Log Lab Activity 🌸
      </button>
    </form>
  );
};
