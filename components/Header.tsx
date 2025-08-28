
import React from 'react';
import { LeafIcon } from './icons/LeafIcon';

export const Header: React.FC = () => {
  return (
    <header className="w-full p-4 border-b border-slate-700/50 bg-slate-900/80 backdrop-blur-sm sticky top-0 z-10">
      <div className="max-w-4xl mx-auto flex items-center gap-3">
        <LeafIcon className="w-8 h-8 text-emerald-400" />
        <h1 className="text-2xl font-bold font-display text-white">
          Plant Disease <span className="text-emerald-400">Prediction</span>
        </h1>
      </div>
    </header>
  );
};
