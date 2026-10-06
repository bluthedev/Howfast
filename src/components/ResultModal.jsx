import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Share2, RotateCcw, Check, Trophy } from 'lucide-react';
import { getRankTier } from '../utils/rankTiers.js';
import { submitScore } from '../utils/api.js';

export function ResultModal({
  isOpen,
  results,
  onRestart,
  personalBest = 0,
  onNewPersonalBest,
  mode = '30s',
}) {
  const [username, setUsername] = useState(() => {
    return localStorage.getItem('howfast_username') || '';
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedRank, setSubmittedRank] = useState(null);
  const [copiedShare, setCopiedShare] = useState(false);

  const {
    wpm = 0,
    rawWpm = 0,
    accuracy = 100,
    duration = 30,
    totalKeystrokes = 0,
    correctKeystrokes = 0,
    errorKeystrokes = 0,
    maxCombo = 0,
  } = results || {};

  const isNewPB = wpm > personalBest;
  const rankTier = getRankTier(wpm);

  useEffect(() => {
    if (isOpen) {
      setSubmittedRank(null);
      setCopiedShare(false);

      try {
        confetti({
          particleCount: isNewPB ? 70 : 40,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#e5a93c', '#d97706', '#f3f4f6', '#9ca3af'],
        });
      } catch (e) {}

      if (isNewPB && onNewPersonalBest) {
        onNewPersonalBest(wpm);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleScoreSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || isSubmitting || submittedRank !== null) return;

    setIsSubmitting(true);
    localStorage.setItem('howfast_username', username.trim());

    try {
      const res = await submitScore({
        username: username.trim(),
        wpm: Math.round(wpm),
        raw_wpm: Math.round(rawWpm),
        accuracy,
        mode,
        duration_seconds: duration,
        device_type: navigator.userAgent.includes('iPhone') ? 'iPhone' : navigator.userAgent.includes('Android') ? 'Android' : 'Mobile',
      });
      setSubmittedRank(res.rank || 1);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleShare = async () => {
    const shareText = `⚡ howfast mobile test
speed: ${Math.round(wpm)} wpm (${accuracy}% acc)
rank: ${rankTier.title} ${rankTier.emoji}
streak: ${maxCombo} words
test your thumbs at: howfast`;

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: 'howfast score',
          text: shareText,
          url: window.location.href,
        });
        return;
      } catch (err) {}
    }

    try {
      await navigator.clipboard.writeText(shareText);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2500);
    } catch (e) {}
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-sm bg-[#14161b] border border-zinc-800 rounded-3xl p-5 shadow-2xl flex flex-col gap-4 text-center max-h-[90vh] overflow-y-auto no-scrollbar font-mono text-zinc-100">
        {/* New PB Indicator */}
        {isNewPB && personalBest > 0 && (
          <div className="text-xs text-amber-400 font-medium">
            ★ new personal best (+{wpm - personalBest} wpm)
          </div>
        )}

        {/* Big WPM Hero */}
        <div className="flex flex-col items-center py-1">
          <span className="text-[11px] text-zinc-500 uppercase tracking-wider">
            typing speed
          </span>
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-6xl font-bold text-zinc-100">
              {Math.round(wpm)}
            </span>
            <span className="text-sm text-zinc-500">wpm</span>
          </div>
        </div>

        {/* Rank Tier Pill */}
        <div className="p-3 rounded-2xl bg-zinc-900 border border-zinc-800/80 flex items-center gap-3 text-left">
          <span className="text-3xl p-1">{rankTier.emoji}</span>
          <div className="flex-1 font-sans">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-zinc-100">{rankTier.title}</span>
              <span className="text-[10px] text-zinc-400 font-mono">{rankTier.minWpm}+ wpm</span>
            </div>
            <p className="text-[11px] text-zinc-400 leading-snug">{rankTier.description}</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-2 rounded-xl bg-zinc-900 border border-zinc-800">
            <span className="text-[10px] text-zinc-500 block uppercase">accuracy</span>
            <span className="text-sm font-bold text-zinc-200">{accuracy}%</span>
          </div>
          <div className="p-2 rounded-xl bg-zinc-900 border border-zinc-800">
            <span className="text-[10px] text-zinc-500 block uppercase">raw wpm</span>
            <span className="text-sm font-bold text-zinc-200">{Math.round(rawWpm)}</span>
          </div>
          <div className="p-2 rounded-xl bg-zinc-900 border border-zinc-800">
            <span className="text-[10px] text-zinc-500 block uppercase">streak</span>
            <span className="text-sm font-bold text-amber-400">{maxCombo}w</span>
          </div>
        </div>

        {/* Keystrokes summary */}
        <div className="text-[10px] text-zinc-500 flex items-center justify-between px-1">
          <span>keys: {totalKeystrokes}</span>
          <span>correct: {correctKeystrokes}</span>
          <span>errors: {errorKeystrokes}</span>
          <span>time: {duration.toFixed(1)}s</span>
        </div>

        {/* Leaderboard Submission */}
        <div className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800">
          {submittedRank ? (
            <div className="flex items-center justify-center gap-1.5 text-emerald-400 text-xs py-1">
              <Check className="w-3.5 h-3.5" />
              <span>Saved! Current Rank #{submittedRank}</span>
            </div>
          ) : (
            <form onSubmit={handleScoreSubmit} className="flex gap-1.5">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter name for leaderboard"
                maxLength={18}
                className="flex-1 px-3 py-1.5 text-xs rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-zinc-600"
              />
              <button
                type="submit"
                disabled={!username.trim() || isSubmitting}
                className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold disabled:opacity-40 transition-all flex items-center gap-1"
              >
                <Trophy className="w-3 h-3 text-amber-400" />
                <span>Save</span>
              </button>
            </form>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-1 font-sans">
          <button
            onClick={handleShare}
            className="flex-1 py-2.5 px-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-xs font-medium flex items-center justify-center gap-1.5 transition-all"
          >
            {copiedShare ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5" />
                <span>Share</span>
              </>
            )}
          </button>

          <button
            onClick={onRestart}
            className="flex-1 py-2.5 px-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Play Again</span>
          </button>
        </div>
      </div>
    </div>
  );
}
