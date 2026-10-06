import React from 'react';

export function StatsBar({
  wpm = 0,
  accuracy = 100,
  timeLeft = 30,
  totalTime = 30,
  mode = '30s',
  isTestActive = false,
}) {
  const isTimed = mode === '15s' || mode === '30s' || mode === '60s' || mode === 'slang';
  const displayTimer = isTimed ? `${Math.ceil(timeLeft)}s` : `${timeLeft.toFixed(1)}s`;

  return (
    <div className="w-full flex items-center justify-around px-4 py-2 border-y border-zinc-800/60 my-1 font-mono">
      {/* WPM */}
      <div className="flex flex-col items-center">
        <span className="text-[10px] text-zinc-500 uppercase tracking-wider">wpm</span>
        <span className="text-2xl font-bold text-zinc-100">{Math.round(wpm)}</span>
      </div>

      {/* Accuracy */}
      <div className="flex flex-col items-center">
        <span className="text-[10px] text-zinc-500 uppercase tracking-wider">accuracy</span>
        <span className="text-2xl font-bold text-zinc-100">{accuracy}%</span>
      </div>

      {/* Timer */}
      <div className="flex flex-col items-center">
        <span className="text-[10px] text-zinc-500 uppercase tracking-wider">
          {isTimed ? 'time left' : 'time'}
        </span>
        <span className={`text-2xl font-bold ${
          isTimed && timeLeft <= 5 && isTestActive ? 'text-rose-400' : 'text-amber-400'
        }`}>
          {displayTimer}
        </span>
      </div>
    </div>
  );
}
