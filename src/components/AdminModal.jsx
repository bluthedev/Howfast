import React, { useState, useEffect } from 'react';
import { Shield, X, RefreshCw, Trash2, Smartphone, MessageSquare, Gauge, Lock, CheckCircle, LogOut } from 'lucide-react';
import { fetchAdminData, deleteScore, deleteMessage } from '../utils/api.js';
import { supabase, isSupabaseConfigured } from '../utils/supabase.js';

const ADMIN_PIN = '147258';

export function AdminModal({ isOpen, onClose }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('howfast_admin_auth') === 'true';
  });
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);

  const [activeTab, setActiveTab] = useState('scores'); // 'scores' | 'messages'
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({
    scores: [],
    messages: [],
    stats: { totalScores: 0, totalMessages: 0, recordWpm: 0, avgWpm: 0, devices: {}, modes: {} },
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetchAdminData();
      if (res) setData(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && isAuthenticated) {
      loadData();

      // Realtime listener for live activity
      if (isSupabaseConfigured && supabase) {
        const scoresChannel = supabase
          .channel('admin:scores')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'scores' }, () => {
            loadData();
          })
          .subscribe();

        const msgsChannel = supabase
          .channel('admin:messages')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, () => {
            loadData();
          })
          .subscribe();

        return () => {
          supabase.removeChannel(scoresChannel);
          supabase.removeChannel(msgsChannel);
        };
      }
    }
  }, [isOpen, isAuthenticated]);

  if (!isOpen) return null;

  const handlePinSubmit = (e) => {
    e.preventDefault();
    if (pinInput.trim() === ADMIN_PIN) {
      setIsAuthenticated(true);
      sessionStorage.setItem('howfast_admin_auth', 'true');
      setPinError(false);
      setPinInput('');
    } else {
      setPinError(true);
      setPinInput('');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('howfast_admin_auth');
    setPinInput('');
  };

  const handleDeleteScore = async (id) => {
    if (confirm('Delete this score entry from the database?')) {
      await deleteScore(id);
      setData((prev) => ({
        ...prev,
        scores: prev.scores.filter((s) => s.id !== id),
      }));
    }
  };

  const handleDeleteMessage = async (id) => {
    if (confirm('Delete this message from community chat?')) {
      await deleteMessage(id);
      setData((prev) => ({
        ...prev,
        messages: prev.messages.filter((m) => m.id !== id),
      }));
    }
  };

  // If Not Authenticated: PIN Prompt
  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
        <div className="w-full max-w-xs bg-[#14161b] border border-zinc-800 rounded-3xl p-6 text-center text-zinc-100 flex flex-col gap-4 shadow-2xl">
          <div className="w-12 h-12 rounded-2xl bg-amber-400/10 border border-amber-400/20 text-amber-400 flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6" />
          </div>

          <div>
            <h3 className="text-base font-bold text-zinc-100">Platform Monitor</h3>
            <p className="text-xs text-zinc-400 mt-0.5">Enter Admin PIN to access</p>
          </div>

          <form onSubmit={handlePinSubmit} className="flex flex-col gap-3">
            <input
              type="password"
              inputMode="numeric"
              maxLength={6}
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
              placeholder="••••••"
              autoFocus
              className={`w-full py-2.5 text-center text-xl font-mono tracking-widest rounded-xl bg-zinc-900 border text-zinc-100 focus:outline-none transition-all ${
                pinError
                  ? 'border-rose-500 animate-shake'
                  : 'border-zinc-800 focus:border-amber-400'
              }`}
            />

            {pinError && (
              <span className="text-[11px] text-rose-400 font-mono">
                Incorrect PIN. Please try again.
              </span>
            )}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2 text-xs rounded-xl bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2 text-xs rounded-xl bg-amber-400 text-zinc-950 font-bold hover:bg-amber-300"
              >
                Unlock
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  const { stats } = data;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-2xl bg-[#14161b] border border-zinc-800 rounded-3xl p-5 shadow-2xl flex flex-col gap-4 max-h-[90vh] overflow-hidden text-zinc-100 font-sans">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-400/10 border border-amber-400/30 text-amber-400">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold tracking-tight text-zinc-100">
                  Platform Monitor & Control
                </h2>
                {isSupabaseConfigured && (
                  <span className="flex items-center gap-1 text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-800/50">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    LIVE TELEMETRY
                  </span>
                )}
              </div>
              <p className="text-[10px] text-zinc-400">Live activity and moderation panel</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={loadData}
              title="Refresh telemetry"
              className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-amber-400' : ''}`} />
            </button>
            <button
              onClick={handleLogout}
              title="Lock Admin Panel"
              className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-zinc-800 transition-all"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Top KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono">
          <div className="p-2.5 rounded-2xl bg-zinc-900 border border-zinc-800">
            <span className="text-[10px] text-zinc-500 uppercase block">Total Tests</span>
            <span className="text-xl font-bold text-zinc-100">{stats.totalScores}</span>
          </div>
          <div className="p-2.5 rounded-2xl bg-zinc-900 border border-zinc-800">
            <span className="text-[10px] text-zinc-500 uppercase block">Messages</span>
            <span className="text-xl font-bold text-zinc-100">{stats.totalMessages}</span>
          </div>
          <div className="p-2.5 rounded-2xl bg-zinc-900 border border-zinc-800">
            <span className="text-[10px] text-zinc-500 uppercase block">Record Speed</span>
            <span className="text-xl font-bold text-amber-400">{stats.recordWpm} <span className="text-[10px] text-zinc-500">wpm</span></span>
          </div>
          <div className="p-2.5 rounded-2xl bg-zinc-900 border border-zinc-800">
            <span className="text-[10px] text-zinc-500 uppercase block">Average Speed</span>
            <span className="text-xl font-bold text-emerald-400">{stats.avgWpm} <span className="text-[10px] text-zinc-500">wpm</span></span>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex rounded-xl bg-zinc-900 p-1 border border-zinc-800 text-xs font-mono">
          <button
            onClick={() => setActiveTab('scores')}
            className={`flex-1 py-1.5 rounded-lg font-medium transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'scores' ? 'bg-zinc-800 text-zinc-100 shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Gauge className="w-3.5 h-3.5 text-amber-400" />
            <span>Test Submissions ({data.scores.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('messages')}
            className={`flex-1 py-1.5 rounded-lg font-medium transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'messages' ? 'bg-zinc-800 text-zinc-100 shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
            <span>Chat Moderation ({data.messages.length})</span>
          </button>
        </div>

        {/* Activity Feed Table */}
        <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 min-h-[260px] no-scrollbar">
          {activeTab === 'scores' ? (
            data.scores.length === 0 ? (
              <div className="h-48 flex items-center justify-center text-zinc-500 text-xs font-mono">
                No test submissions logged yet.
              </div>
            ) : (
              data.scores.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80 hover:border-zinc-700/80 transition-all font-mono text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-amber-400 font-bold">
                      {s.wpm}
                    </div>
                    <div>
                      <div className="font-semibold text-zinc-200 flex items-center gap-1.5">
                        <span>{s.username}</span>
                        <span className="text-[10px] text-zinc-500 font-normal">
                          ({s.mode})
                        </span>
                      </div>
                      <div className="text-[10px] text-zinc-500 flex items-center gap-2">
                        <span>{s.accuracy}% acc</span>
                        <span>•</span>
                        <span>{s.device_type || 'mobile'}</span>
                        <span>•</span>
                        <span>{new Date(s.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteScore(s.id)}
                    title="Remove score"
                    className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-950/30 transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )
          ) : data.messages.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-zinc-500 text-xs font-mono">
              No chat messages logged yet.
            </div>
          ) : (
            data.messages.map((m) => (
              <div
                key={m.id}
                className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80 hover:border-zinc-700/80 transition-all font-mono text-xs"
              >
                <div className="flex-1 mr-3">
                  <div className="flex items-center gap-2 text-[10px] text-zinc-400">
                    <span className="font-bold text-zinc-200">{m.username}</span>
                    {m.wpm > 0 && <span className="text-amber-400">[{m.wpm} wpm]</span>}
                    <span className="text-zinc-600">•</span>
                    <span className="text-zinc-500">
                      {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-300 mt-0.5 break-words font-sans">
                    {m.text}
                  </p>
                </div>

                <button
                  onClick={() => handleDeleteMessage(m.id)}
                  title="Delete message"
                  className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-950/30 transition-all shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer info */}
        <div className="flex items-center justify-between text-[10px] text-zinc-500 border-t border-zinc-800/60 pt-2 font-mono">
          <span>Protected with PIN {ADMIN_PIN}</span>
          <span>Click trash icon to moderate entries</span>
        </div>
      </div>
    </div>
  );
}
