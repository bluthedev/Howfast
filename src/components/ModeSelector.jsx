import React from 'react';
import { BookOpen, Music, Zap, Clock, Calendar, MessageSquare, Keyboard, ShieldCheck } from 'lucide-react';

export function ModeSelector({
  currentMode,
  onSelectMode,
  isTestActive,
  allowAutocorrect,
  onToggleAutocorrect,
}) {
  const modes = [
    { id: 'story', label: 'Stories', sub: 'Short Tales', icon: BookOpen },
    { id: 'lyrics', label: 'Lyrics', sub: 'Song Lines', icon: Music },
    { id: '30s', label: '30s', sub: 'Classic', icon: Clock },
    { id: '15s', label: '15s', sub: 'Sprint', icon: Zap },
    { id: 'daily', label: 'Daily', sub: 'Universal', icon: Calendar },
    { id: 'slang', label: 'Slang', sub: 'Chat Slang', icon: MessageSquare },
  ];

  return (
    <div className="w-full flex flex-col gap-2 px-3 py-1.5">
      {/* Minimalist Mode Selector Pills */}
      <div className="flex items-center gap-1 p-1 rounded-xl bg-zinc-900/90 border border-zinc-800/80 overflow-x-auto no-scrollbar">
        {modes.map((m) => {
          const Icon = m.icon;
          const isActive = currentMode === m.id;
          return (
            <button
              key={m.id}
              disabled={isTestActive}
              onClick={() => onSelectMode(m.id)}
              className={`flex-1 min-w-[64px] py-1.5 px-2 rounded-lg text-xs font-medium transition-all flex flex-col items-center gap-0.5 ${
                isActive
                  ? 'bg-amber-400 text-zinc-950 font-semibold shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
              } ${isTestActive ? 'opacity-40 cursor-not-allowed' : 'active:scale-95'}`}
            >
              <div className="flex items-center gap-1">
                <Icon className={`w-3 h-3 ${isActive ? 'text-zinc-950' : 'text-zinc-500'}`} />
                <span>{m.label}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Autocorrect Sub-toggle */}
      <div className="flex items-center justify-between px-1 text-[11px] text-zinc-500 font-mono">
        <span>mode: <strong className="text-zinc-400">{currentMode}</strong></span>
        <button
          disabled={isTestActive}
          onClick={onToggleAutocorrect}
          className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md border text-[10px] transition-all ${
            allowAutocorrect
              ? 'border-emerald-800/60 text-emerald-400 bg-emerald-950/20'
              : 'border-zinc-800 text-zinc-400 bg-zinc-900'
          } ${isTestActive ? 'opacity-40 cursor-not-allowed' : 'hover:border-zinc-700 active:scale-95'}`}
        >
          <Keyboard className="w-3 h-3" />
          <span>{allowAutocorrect ? 'Autocorrect ON' : 'Raw Typing'}</span>
        </button>
      </div>
    </div>
  );
}
