import { supabase, isSupabaseConfigured } from './supabase.js';

const API_BASE = '/api';

export async function fetchLeaderboard(mode = 'all', timeframe = 'all') {
  // If Supabase is connected (e.g. deployed on Netlify)
  if (isSupabaseConfigured && supabase) {
    try {
      let query = supabase
        .from('scores')
        .select('*');

      if (mode && mode !== 'all') {
        query = query.eq('mode', mode);
      }

      if (timeframe === 'today') {
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        query = query.gte('created_at', todayStart.toISOString());
      }

      query = query
        .order('wpm', { ascending: false })
        .order('accuracy', { ascending: false })
        .limit(50);

      const { data, error } = await query;
      if (error) throw error;

      return (data || []).map((row, idx) => ({
        rank: idx + 1,
        ...row,
      }));
    } catch (err) {
      console.warn('Supabase leaderboard fetch error, falling back:', err);
    }
  }

  // Fallback to Express backend (if running locally or hosted)
  try {
    const res = await fetch(`${API_BASE}/leaderboard?mode=${encodeURIComponent(mode)}&timeframe=${encodeURIComponent(timeframe)}`);
    if (res.ok) {
      const data = await res.json();
      if (data.leaderboard) return data.leaderboard;
    }
  } catch (err) {}

  return getLocalLeaderboard(mode);
}

export async function submitScore(scoreData) {
  const cleanUsername = String(scoreData.username || 'Anonymous').trim().slice(0, 20) || 'Anonymous';
  const cleanWpm = Math.min(Math.max(Math.round(Number(scoreData.wpm) || 0), 0), 180);
  const cleanRawWpm = Math.min(Math.max(Math.round(Number(scoreData.raw_wpm) || 0), 0), 200);
  const cleanAccuracy = Math.min(Math.max(Number(scoreData.accuracy) || 0, 0), 100);
  const cleanDuration = Math.max(Number(scoreData.duration_seconds) || 1, 1);
  const cleanMode = scoreData.mode || '30s';
  const cleanDevice = String(scoreData.device_type || 'mobile').slice(0, 30);

  // If Supabase is connected
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('scores')
        .insert([{
          username: cleanUsername,
          wpm: cleanWpm,
          raw_wpm: cleanRawWpm,
          accuracy: cleanAccuracy,
          mode: cleanMode,
          duration_seconds: cleanDuration,
          device_type: cleanDevice,
        }])
        .select()
        .single();

      if (error) throw error;

      // Query rank position
      const { count } = await supabase
        .from('scores')
        .select('*', { count: 'exact', head: true })
        .eq('mode', cleanMode)
        .gt('wpm', cleanWpm);

      return {
        id: data.id,
        rank: (count || 0) + 1,
        username: cleanUsername,
        wpm: cleanWpm,
        accuracy: cleanAccuracy,
        mode: cleanMode,
      };
    } catch (err) {
      console.warn('Supabase score submit error, falling back:', err);
    }
  }

  // Fallback to Express API
  try {
    const res = await fetch(`${API_BASE}/scores`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(scoreData),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.result) return data.result;
    }
  } catch (err) {}

  saveLocalScore(scoreData);
  return {
    rank: 1,
    username: cleanUsername,
    wpm: cleanWpm,
    accuracy: cleanAccuracy,
    mode: cleanMode,
  };
}

export async function fetchMessages(limit = 60) {
  // If Supabase is connected
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .order('id', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return (data || []).reverse();
    } catch (err) {
      console.warn('Supabase messages fetch error, falling back:', err);
    }
  }

  // Fallback to Express API
  try {
    const res = await fetch(`${API_BASE}/messages?limit=${limit}`);
    if (res.ok) {
      const data = await res.json();
      if (data.messages) return data.messages;
    }
  } catch (err) {}

  return JSON.parse(localStorage.getItem('howfast_local_messages') || '[]');
}

export async function sendMessage({ username, text, wpm = 0, badge = 'Texter' }) {
  const cleanUsername = String(username || 'Anonymous').trim().slice(0, 20) || 'Anonymous';
  const cleanText = String(text || '').trim().slice(0, 280);
  if (!cleanText) return null;
  const cleanWpm = Math.min(Math.max(Math.round(Number(wpm) || 0), 0), 180);
  const cleanBadge = String(badge || 'Texter').slice(0, 30);

  // If Supabase is connected
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('messages')
        .insert([{
          username: cleanUsername,
          text: cleanText,
          wpm: cleanWpm,
          badge: cleanBadge,
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      console.warn('Supabase message post error, falling back:', err);
    }
  }

  // Fallback to Express API
  try {
    const res = await fetch(`${API_BASE}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: cleanUsername, text: cleanText, wpm: cleanWpm, badge: cleanBadge }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.message) return data.message;
    }
  } catch (err) {}

  // Fallback to local
  const local = JSON.parse(localStorage.getItem('howfast_local_messages') || '[]');
  const newMsg = {
    id: Date.now(),
    username: cleanUsername,
    text: cleanText,
    wpm: cleanWpm,
    badge: cleanBadge,
    created_at: new Date().toISOString(),
  };
  local.push(newMsg);
  localStorage.setItem('howfast_local_messages', JSON.stringify(local));
  return newMsg;
}

export async function fetchDailyChallenge() {
  try {
    const res = await fetch(`${API_BASE}/daily-challenge`);
    if (res.ok) {
      const data = await res.json();
      if (data.phrase) return data.phrase;
    }
  } catch (err) {}
  return "The quick mobile thumb jumps over the lazy autocorrect bar on every swipe.";
}

export async function fetchGlobalStats() {
  try {
    const res = await fetch(`${API_BASE}/stats`);
    if (res.ok) {
      const data = await res.json();
      if (data.stats) return data.stats;
    }
  } catch (err) {}
  return { totalRuns: 1, recordWpm: 92, avgWpm: 68.5 };
}

// Local storage fallbacks
function getLocalLeaderboard(mode) {
  try {
    const local = JSON.parse(localStorage.getItem('howfast_local_scores') || '[]');
    let filtered = local;
    if (mode && mode !== 'all') {
      filtered = filtered.filter(s => s.mode === mode);
    }
    return filtered.sort((a, b) => b.wpm - a.wpm).slice(0, 50).map((s, i) => ({ rank: i + 1, ...s }));
  } catch (e) {
    return [];
  }
}

function saveLocalScore(score) {
  try {
    const list = JSON.parse(localStorage.getItem('howfast_local_scores') || '[]');
    list.push({ ...score, created_at: new Date().toISOString() });
    localStorage.setItem('howfast_local_scores', JSON.stringify(list));
  } catch (e) {}
}
