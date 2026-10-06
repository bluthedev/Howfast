import React from 'react';
import { Flame } from 'lucide-react';

export function ComboMeter({ combo = 0 }) {
  if (combo < 4) return null;

  return (
    <div className="flex items-center justify-center py-0.5">
      <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-zinc-900 border border-amber-500/30 text-amber-400 text-xs font-mono font-medium animate-fadeIn">
        <Flame className="w-3 h-3 text-amber-400" />
        <span>{combo} word streak</span>
      </div>
    </div>
  );
}
