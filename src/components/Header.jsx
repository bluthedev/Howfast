import React from 'react';
import { Volume2, VolumeX, Smartphone, Trophy, MessageSquare } from 'lucide-react';

export function Header({
  isMuted,
  onToggleMute,
  isHapticsEnabled,
  onToggleHaptics,
  onOpenLeaderboard,
  onOpenChat,
  personalBest = 0,
}) {
  return (
    <header className="w-full flex items-center justify-between px-4 py-3 bg-[#0e1015]/90 backdrop-blur-md border-b border-zinc-800/80 sticky top-0 z-20">
      {/* Brand */}
      <div className="flex items-center gap-2.5">
        <img
          src="/logo.jpg"
          alt="Howfast"
          className="w-7 h-7 rounded-lg object-cover opacity-90 border border-zinc-800"
        />
        <div className="flex items-baseline gap-1.5">
          <span className="text-base font-bold tracking-tight text-zinc-100 font-mono">
            howfast
          </span>
          <span className="text-[10px] text-zinc-500 font-mono">mobile</span>
        </div>
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-1.5">
        {/* Personal Best Pill */}
        {personalBest > 0 && (
          <div className="hidden xs:flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs font-mono">
            <span className="text-zinc-500">pb:</span>
            <span className="text-amber-400 font-bold">{personalBest}</span>
            <span className="text-[10px] text-zinc-500">wpm</span>
          </div>
        )}

        {/* Chat Button */}
        <button
          onClick={onOpenChat}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-xs font-medium transition-all active:scale-95"
          title="Community Chat"
        >
          <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden sm:inline">Chat</span>
        </button>

        {/* Leaderboard Button */}
        <button
          onClick={onOpenLeaderboard}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-xs font-medium transition-all active:scale-95"
          title="Global Leaderboard"
        >
          <Trophy className="w-3.5 h-3.5 text-zinc-400" />
          <span className="hidden sm:inline">Rankings</span>
        </button>

        {/* Sound Toggle */}
        <button
          onClick={onToggleMute}
          title={isMuted ? "Unmute audio" : "Mute audio"}
          className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-zinc-200 transition-all active:scale-95"
        >
          {isMuted ? <VolumeX className="w-3.5 h-3.5 text-zinc-600" /> : <Volume2 className="w-3.5 h-3.5" />}
        </button>

        {/* Haptics Toggle */}
        <button
          onClick={onToggleHaptics}
          title={isHapticsEnabled ? "Disable vibration" : "Enable vibration"}
          className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-zinc-200 transition-all active:scale-95"
        >
          <Smartphone className={`w-3.5 h-3.5 ${!isHapticsEnabled ? 'opacity-40' : ''}`} />
        </button>
      </div>
    </header>
  );
}
