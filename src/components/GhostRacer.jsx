import React from 'react';

export function GhostRacer({
  userProgress = 0,
  ghostProgress = 0,
  currentWpm = 0,
  targetWpm = 50,
  isTestActive = false,
}) {
  const wpmDiff = currentWpm - targetWpm;
  const isAhead = wpmDiff >= 0;

  return (
    <div className="w-full px-3 py-1">
      <div className="bg-zinc-900/70 border border-zinc-800/80 rounded-xl p-2.5">
        <div className="flex items-center justify-between text-[11px] mb-2 font-mono">
          <div className="flex items-center gap-1.5 text-zinc-400">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            <span className="font-medium">pace tracker</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-zinc-500 text-[10px]">
              target: {targetWpm} wpm
            </span>
            {isTestActive && currentWpm > 0 && (
              <span
                className={`text-[10px] font-bold px-1.5 py-0.2 rounded font-mono ${
                  isAhead ? 'text-emerald-400 bg-emerald-950/40' : 'text-amber-400 bg-amber-950/40'
                }`}
              >
                {isAhead ? `+${wpmDiff}` : `${wpmDiff}`} wpm
              </span>
            )}
          </div>
        </div>

        {/* Minimalist Dual Track */}
        <div className="relative h-2 w-full bg-zinc-800/60 rounded-full overflow-hidden">
          {/* Ghost Progress (soft gray bar) */}
          <div
            className="absolute top-0 bottom-0 left-0 bg-zinc-600/40 transition-all duration-300 ease-out"
            style={{ width: `${Math.min(Math.max(ghostProgress, 0), 100)}%` }}
          />

          {/* User Progress (clean amber bar) */}
          <div
            className="absolute top-0 bottom-0 left-0 bg-amber-400 transition-all duration-150 ease-out"
            style={{ width: `${Math.min(Math.max(userProgress, 0), 100)}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-[9px] text-zinc-500 font-mono mt-1 px-0.5">
          <span>start</span>
          <span>you: {Math.round(userProgress)}%</span>
          <span>finish 🏁</span>
        </div>
      </div>
    </div>
  );
}
