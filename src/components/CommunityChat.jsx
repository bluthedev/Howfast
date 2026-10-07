import React, { useState, useEffect, useRef } from 'react';
import { X, Send, MessageSquare, RefreshCw, Radio } from 'lucide-react';
import { fetchMessages, sendMessage } from '../utils/api.js';
import { supabase, isSupabaseConfigured } from '../utils/supabase.js';

export function CommunityChat({
  isOpen,
  onClose,
  currentUsername = '',
  userWpm = 0,
  userBadge = 'Texter',
}) {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [authorName, setAuthorName] = useState(() => {
    return currentUsername || localStorage.getItem('howfast_username') || 'ThumbRacer';
  });
  const [isSending, setIsSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  const loadMessages = async () => {
    try {
      const data = await fetchMessages();
      setMessages(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadMessages();

      // Realtime WebSocket channel with Supabase
      if (isSupabaseConfigured && supabase) {
        const channel = supabase
          .channel('public:messages')
          .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
            if (payload && payload.new) {
              setMessages((prev) => {
                if (prev.some((m) => m.id === payload.new.id)) return prev;
                return [...prev, payload.new];
              });
            }
          })
          .subscribe();

        return () => {
          supabase.removeChannel(channel);
        };
      } else {
        // Fallback polling
        const interval = setInterval(loadMessages, 3500);
        return () => clearInterval(interval);
      }
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || isSending) return;

    const trimmed = inputText.trim();
    setInputText('');
    setIsSending(true);

    const nameToUse = authorName.trim() || 'Anonymous';
    localStorage.setItem('howfast_username', nameToUse);

    try {
      const newMsg = await sendMessage({
        username: nameToUse,
        text: trimmed,
        wpm: userWpm,
        badge: userBadge,
      });

      // If not using real-time websocket, append manually
      if (!isSupabaseConfigured && newMsg) {
        setMessages((prev) => [...prev, newMsg]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSending(false);
    }
  };

  const handleQuickEmoji = (emoji) => {
    setInputText((prev) => prev + emoji);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-lg bg-[#14161b] border border-zinc-800 rounded-3xl p-4 shadow-2xl flex flex-col gap-3 h-[85vh] max-h-[640px] overflow-hidden text-zinc-100">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3 px-1">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-zinc-800/80 text-amber-400">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold tracking-wide text-zinc-100">
                  Community Lounge
                </h2>
                {isSupabaseConfigured && (
                  <span className="flex items-center gap-1 text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-800/50">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    LIVE
                  </span>
                )}
              </div>
              <p className="text-[10px] text-zinc-400">Chat with typists worldwide</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={loadMessages}
              title="Refresh messages"
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

        {/* Messages Feed */}
        <div className="flex-1 overflow-y-auto px-1 space-y-2.5 no-scrollbar">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-zinc-500 text-xs">
              <MessageSquare className="w-8 h-8 mb-2 opacity-40" />
              <span>No messages yet. Say hello to the room!</span>
            </div>
          ) : (
            messages.map((msg) => {
              const isMe = msg.username === authorName;
              return (
                <div
                  key={msg.id || Math.random()}
                  className={`flex flex-col gap-0.5 max-w-[85%] ${
                    isMe ? 'ml-auto items-end' : 'mr-auto items-start'
                  }`}
                >
                  {/* Sender metadata */}
                  <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 px-1 font-mono">
                    <span className="font-semibold text-zinc-300">{msg.username}</span>
                    {msg.wpm > 0 && (
                      <span className="px-1.5 py-0.2 rounded bg-zinc-800 text-amber-400 font-medium text-[9px]">
                        {msg.wpm} WPM
                      </span>
                    )}
                  </div>

                  {/* Bubble */}
                  <div
                    className={`px-3 py-2 rounded-2xl text-xs break-words leading-relaxed ${
                      isMe
                        ? 'bg-amber-500/15 text-amber-100 border border-amber-500/30 rounded-tr-none'
                        : 'bg-zinc-800/90 text-zinc-200 border border-zinc-700/60 rounded-tl-none'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Emoji Bar */}
        <div className="flex items-center gap-1 px-1 py-0.5 text-sm overflow-x-auto no-scrollbar">
          {['🔥', '🚀', '⚡', '📱', '💀', '👏', '🏆', '💯'].map((emoji) => (
            <button
              key={emoji}
              onClick={() => handleQuickEmoji(emoji)}
              className="px-2 py-0.5 rounded-lg bg-zinc-800/60 hover:bg-zinc-700/60 text-xs transition-all active:scale-95"
            >
              {emoji}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSend} className="flex flex-col gap-2 pt-1 border-t border-zinc-800">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              placeholder="Your Name"
              maxLength={18}
              className="w-28 px-2.5 py-1.5 text-[11px] rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-200 focus:outline-none focus:border-amber-500/50 font-mono"
            />
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type message..."
              maxLength={200}
              className="flex-1 px-3 py-2 text-xs rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500/50"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isSending}
              className="p-2.5 rounded-xl bg-amber-400 text-zinc-950 font-bold disabled:opacity-40 transition-all active:scale-95 flex items-center justify-center shadow-sm"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
