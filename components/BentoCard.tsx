
import React from 'react';

interface BentoCardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  icon?: React.ReactNode;
}

export const BentoCard: React.FC<BentoCardProps> = ({ children, className = '', title, icon }) => {
  return (
    <div className={`bento-card p-6 flex flex-col h-full ${className}`}>
      {(title || icon) && (
        <div className="flex items-center gap-3 mb-6 shrink-0">
          {icon && <div className="text-pink-500">{icon}</div>}
          {title && <h3 className="text-sm font-black font-poppins text-gray-500 uppercase tracking-widest">{title}</h3>}
        </div>
      )}
      <div className="flex-1 flex flex-col w-full overflow-hidden">
        {children}
      </div>
    </div>
  );
};
