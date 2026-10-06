// API client for Howfast leaderboard and scores

const API_BASE = '/api';

export async function fetchLeaderboard(mode = 'all', timeframe = 'all') {
  try {
    const res = await fetch(`${API_BASE}/leaderboard?mode=${encodeURIComponent(mode)}&timeframe=${encodeURIComponent(timeframe)}`);
    if (!res.ok) throw new Error('Network error');
    const data = await res.json();
    return data.leaderboard || [];
  } catch (err) {
    console.warn('Backend unavailable, using cached local leaderboard:', err);
    return getLocalLeaderboard(mode);
  }
}

export async function submitScore(scoreData) {
  try {
    const res = await fetch(`${API_BASE}/scores`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(scoreData),
    });
    if (!res.ok) throw new Error('Submission failed');
    const data = await res.json();
    return data.result;
  } catch (err) {
    console.warn('Backend submission failed, saving locally:', err);
    saveLocalScore(scoreData);
    return {
      rank: 1,
      username: scoreData.username,
      wpm: scoreData.wpm,
      accuracy: scoreData.accuracy,
      mode: scoreData.mode,
    };
  }
}

export async function fetchDailyChallenge() {
  try {
    const res = await fetch(`${API_BASE}/daily-challenge`);
    if (!res.ok) throw new Error('Failed to fetch daily challenge');
    const data = await res.json();
    return data.phrase;
  } catch (err) {
    return "The quick mobile thumb jumps over the lazy autocorrect bar on every swipe.";
  }
}

export async function fetchGlobalStats() {
  try {
    const res = await fetch(`${API_BASE}/stats`);
    if (!res.ok) throw new Error('Failed to fetch stats');
    const data = await res.json();
    return data.stats;
  } catch (err) {
    return { totalRuns: 1, recordWpm: 92, avgWpm: 68.5 };
  }
}

export async function fetchMessages(limit = 60) {
  try {
    const res = await fetch(`${API_BASE}/messages?limit=${limit}`);
    if (!res.ok) throw new Error('Failed to fetch messages');
    const data = await res.json();
    return data.messages || [];
  } catch (err) {
    console.warn('Backend unavailable, using cached local messages');
    return JSON.parse(localStorage.getItem('howfast_local_messages') || '[]');
  }
}

export async function sendMessage({ username, text, wpm = 0, badge = 'Texter' }) {
  try {
    const res = await fetch(`${API_BASE}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, text, wpm, badge }),
    });
    if (!res.ok) throw new Error('Failed to send message');
    const data = await res.json();
    return data.message;
  } catch (err) {
    console.warn('Backend unavailable, saving message locally');
    const local = JSON.parse(localStorage.getItem('howfast_local_messages') || '[]');
    const newMsg = {
      id: Date.now(),
      username,
      text,
      wpm,
      badge,
      created_at: new Date().toISOString(),
    };
    local.push(newMsg);
    localStorage.setItem('howfast_local_messages', JSON.stringify(local));
    return newMsg;
  }
}

// Local storage fallback handlers
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
