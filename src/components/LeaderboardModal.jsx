import React, { useState, useEffect } from 'react';
import { Trophy, X, Medal, Smartphone, RefreshCw } from 'lucide-react';
import { fetchLeaderboard } from '../utils/api.js';
import { supabase, isSupabaseConfigured } from '../utils/supabase.js';

export function LeaderboardModal({ isOpen, onClose }) {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMode, setSelectedMode] = useState('all');
  const [timeframe, setTimeframe] = useState('all');

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchLeaderboard(selectedMode, timeframe);
      setLeaderboard(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadData();

      // Realtime subscription for scores
      if (isSupabaseConfigured && supabase) {
        const channel = supabase
          .channel('public:scores')
          .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'scores' }, () => {
            loadData();
          })
          .subscribe();

        return () => {
          supabase.removeChannel(channel);
        };
      }
    }
  }, [isOpen, selectedMode, timeframe]);

  if (!isOpen) return null;

  const modeFilters = [
    { id: 'all', label: 'All' },
    { id: 'story', label: 'Stories' },
    { id: 'lyrics', label: 'Lyrics' },
    { id: '30s', label: '30s' },
    { id: '15s', label: '15s' },
    { id: 'daily', label: 'Daily' },
    { id: 'slang', label: 'Slang' },
  ];

  const getRankBadge = (rank) => {
    if (rank === 1) return <span className="text-amber-400 font-bold font-mono">#1</span>;
    if (rank === 2) return <span className="text-zinc-300 font-bold font-mono">#2</span>;
    if (rank === 3) return <span className="text-amber-600 font-bold font-mono">#3</span>;
    return <span className="text-zinc-500 font-mono">#{rank}</span>;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-lg bg-[#14161b] border border-zinc-800 rounded-3xl p-4 shadow-2xl flex flex-col gap-3 max-h-[85vh] overflow-hidden text-zinc-100 font-sans">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-amber-400">
              <Trophy className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold tracking-tight text-zinc-100">
                  Global Leaderboard
                </h2>
                {isSupabaseConfigured && (
                  <span className="flex items-center gap-1 text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-800/50">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    LIVE
                  </span>
                )}
              </div>
              <p className="text-[10px] text-zinc-400">Top mobile typists worldwide</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={loadData}
              title="Refresh"
              className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-amber-400' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-1.5">
          <div className="flex rounded-xl bg-zinc-900 p-1 border border-zinc-800 text-xs font-mono">
            <button
              onClick={() => setTimeframe('all')}
              className={`flex-1 py-1 rounded-lg font-medium transition-all ${
                timeframe === 'all' ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              All-Time
            </button>
            <button
              onClick={() => setTimeframe('today')}
              className={`flex-1 py-1 rounded-lg font-medium transition-all ${
                timeframe === 'today' ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              Today
            </button>
          </div>

          <div className="flex gap-1 overflow-x-auto no-scrollbar py-0.5 font-mono text-[11px]">
            {modeFilters.map((m) => (
              <button
                key={m.id}
                onClick={() => setSelectedMode(m.id)}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  selectedMode === m.id
                    ? 'bg-amber-400/15 text-amber-400 border border-amber-400/30 font-medium'
                    : 'bg-zinc-900 text-zinc-500 border border-zinc-800 hover:text-zinc-300'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* Scores list */}
        <div className="flex-1 overflow-y-auto space-y-1.5 min-h-[220px] no-scrollbar">
          {loading ? (
            <div className="h-44 flex flex-col items-center justify-center text-zinc-500 text-xs">
              <RefreshCw className="w-4 h-4 animate-spin mb-1 text-amber-400" />
              <span>Loading rankings...</span>
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="h-44 flex flex-col items-center justify-center text-zinc-500 text-xs font-mono">
              <Medal className="w-6 h-6 mb-1 opacity-40" />
              <p>No scores recorded yet.</p>
              <p className="text-[10px] text-amber-400">Be the first to set a record!</p>
            </div>
          ) : (
            leaderboard.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80 hover:border-zinc-700/80 transition-all font-mono"
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 text-center text-xs">
                    {getRankBadge(item.rank)}
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-zinc-200">
                      {item.username}
                    </div>
                    <div className="text-[10px] text-zinc-500 flex items-center gap-1.5">
                      <span>{item.accuracy}% acc</span>
                      <span>•</span>
                      <span>{item.mode}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-base font-bold text-zinc-100">
                    {item.wpm}
                  </div>
                  <span className="text-[9px] text-zinc-500 uppercase">
                    wpm
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
