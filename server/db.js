import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, 'howfast.db');

export const db = new DatabaseSync(dbPath);

// Initialize tables
db.exec(`
  CREATE TABLE IF NOT EXISTS scores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL,
    wpm INTEGER NOT NULL,
    raw_wpm INTEGER NOT NULL,
    accuracy REAL NOT NULL,
    mode TEXT NOT NULL,
    duration_seconds REAL NOT NULL,
    device_type TEXT DEFAULT 'mobile',
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL,
    text TEXT NOT NULL,
    wpm INTEGER DEFAULT 0,
    badge TEXT DEFAULT 'Texter',
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE INDEX IF NOT EXISTS idx_scores_wpm ON scores(wpm DESC);
  CREATE INDEX IF NOT EXISTS idx_scores_mode ON scores(mode);
  CREATE INDEX IF NOT EXISTS idx_scores_created ON scores(created_at);
  CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created_at);
`);

// Seed initial friendly chat messages if empty
const msgCountRow = db.prepare('SELECT count(*) as count FROM messages').get();
if (!msgCountRow || msgCountRow.count === 0) {
  const seedMessages = [
    { username: '⚡ TurboThumb', text: 'Welcome to Howfast! Anyone managed 80+ WPM on mobile yet?', wpm: 92, badge: 'Alien Thumbs' },
    { username: '✨ SwiftTexter', text: 'The song lyrics mode is my favorite so far 🎵', wpm: 68, badge: 'Cheetah' },
    { username: '🐢 ChillTyper', text: 'Working my way up from 40 WPM. Muscle memory getting better!', wpm: 45, badge: 'Rabbit' },
  ];
  const insertMsg = db.prepare(`
    INSERT INTO messages (username, text, wpm, badge, created_at)
    VALUES (?, ?, ?, ?, datetime('now', '-' || ? || ' minutes'))
  `);
  seedMessages.forEach((m, idx) => {
    insertMsg.run(m.username, m.text, m.wpm, m.badge, (3 - idx) * 15);
  });
}

// Seed realistic records if database is empty
const countRow = db.prepare('SELECT count(*) as count FROM scores').get();
if (!countRow || countRow.count === 0) {
  const seedScores = [
    { username: '⚡ TurboThumb', wpm: 92, raw_wpm: 96, accuracy: 98.4, mode: '30s', duration: 30, device: 'iPhone 15 Pro' },
    { username: '🔥 NeonFingers', wpm: 84, raw_wpm: 88, accuracy: 97.2, mode: '30s', duration: 30, device: 'Pixel 8' },
    { username: '🛸 CyberTypist', wpm: 79, raw_wpm: 82, accuracy: 99.0, mode: '30s', duration: 30, device: 'Galaxy S24' },
    { username: '💨 SwiftSwipe', wpm: 74, raw_wpm: 76, accuracy: 96.5, mode: '15s', duration: 15, device: 'mobile' },
    { username: '📱 ThumbGod', wpm: 71, raw_wpm: 75, accuracy: 95.8, mode: 'daily', duration: 24.2, device: 'iPhone 14' },
    { username: '🚀 SpeedRacer', wpm: 66, raw_wpm: 70, accuracy: 94.0, mode: '30s', duration: 30, device: 'mobile' },
    { username: '✨ PixelTap', wpm: 63, raw_wpm: 65, accuracy: 98.1, mode: 'slang', duration: 25.5, device: 'mobile' },
    { username: '🐢 ChillTyper', wpm: 45, raw_wpm: 48, accuracy: 96.0, mode: '30s', duration: 30, device: 'mobile' },
  ];

  const insertStmt = db.prepare(`
    INSERT INTO scores (username, wpm, raw_wpm, accuracy, mode, duration_seconds, device_type, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now', '-' || ? || ' hours'))
  `);

  seedScores.forEach((s, idx) => {
    insertStmt.run(s.username, s.wpm, s.raw_wpm, s.accuracy, s.mode, s.duration, s.device, idx * 3);
  });
  console.log(`Seeded ${seedScores.length} initial leaderboard scores.`);
}

export function getLeaderboard({ mode = 'all', timeframe = 'all', limit = 50 }) {
  let query = 'SELECT id, username, wpm, raw_wpm, accuracy, mode, device_type, created_at FROM scores WHERE 1=1';
  const params = [];

  if (mode && mode !== 'all') {
    query += ' AND mode = ?';
    params.push(mode);
  }

  if (timeframe === 'today') {
    query += " AND created_at >= datetime('now', 'start of day')";
  } else if (timeframe === 'week') {
    query += " AND created_at >= datetime('now', '-7 days')";
  }

  query += ' ORDER BY wpm DESC, accuracy DESC, created_at ASC LIMIT ?';
  params.push(Number(limit) || 50);

  const stmt = db.prepare(query);
  const rows = stmt.all(...params);

  // Add rank index
  return rows.map((row, idx) => ({
    rank: idx + 1,
    ...row,
  }));
}

export function submitScore({ username, wpm, raw_wpm, accuracy, mode, duration_seconds, device_type }) {
  // Sanitization & basic anti-cheat bounds
  const cleanUsername = String(username || 'Anonymous').trim().slice(0, 20) || 'Anonymous';
  const cleanWpm = Math.min(Math.max(Math.round(Number(wpm) || 0), 0), 180);
  const cleanRawWpm = Math.min(Math.max(Math.round(Number(raw_wpm) || 0), 0), 200);
  const cleanAccuracy = Math.min(Math.max(Number(accuracy) || 0, 0), 100);
  const cleanDuration = Math.max(Number(duration_seconds) || 1, 1);
  const cleanMode = ['15s', '30s', '60s', 'daily', 'slang', 'story', 'lyrics'].includes(mode) ? mode : '30s';
  const cleanDevice = String(device_type || 'mobile').slice(0, 30);

  const insert = db.prepare(`
    INSERT INTO scores (username, wpm, raw_wpm, accuracy, mode, duration_seconds, device_type, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
  `);

  const result = insert.run(cleanUsername, cleanWpm, cleanRawWpm, cleanAccuracy, cleanMode, cleanDuration, cleanDevice);

  // Find user rank for this mode
  const rankQuery = db.prepare(`
    SELECT count(*) as rankAhead FROM scores
    WHERE mode = ? AND (wpm > ? OR (wpm = ? AND accuracy > ?))
  `);
  const rankResult = rankQuery.get(cleanMode, cleanWpm, cleanWpm, cleanAccuracy);
  const rank = (rankResult?.rankAhead || 0) + 1;

  return {
    id: result.lastInsertRowid,
    rank,
    username: cleanUsername,
    wpm: cleanWpm,
    accuracy: cleanAccuracy,
    mode: cleanMode,
  };
}

export function getStats() {
  const total = db.prepare('SELECT count(*) as totalRuns, max(wpm) as recordWpm, round(avg(wpm), 1) as avgWpm FROM scores').get();
  return {
    totalRuns: total?.totalRuns || 0,
    recordWpm: total?.recordWpm || 0,
    avgWpm: total?.avgWpm || 0,
  };
}

export function getMessages(limit = 60) {
  const stmt = db.prepare('SELECT id, username, text, wpm, badge, created_at FROM messages ORDER BY id DESC LIMIT ?');
  const rows = stmt.all(Number(limit) || 60);
  return rows.reverse();
}

export function postMessage({ username, text, wpm = 0, badge = 'Texter' }) {
  const cleanUsername = String(username || 'Anonymous').trim().slice(0, 20) || 'Anonymous';
  const cleanText = String(text || '').trim().slice(0, 280);
  if (!cleanText) return null;
  const cleanWpm = Math.min(Math.max(Math.round(Number(wpm) || 0), 0), 180);
  const cleanBadge = String(badge || 'Texter').slice(0, 30);

  const insert = db.prepare(`
    INSERT INTO messages (username, text, wpm, badge, created_at)
    VALUES (?, ?, ?, ?, datetime('now'))
  `);
  const result = insert.run(cleanUsername, cleanText, cleanWpm, cleanBadge);
  return {
    id: result.lastInsertRowid,
    username: cleanUsername,
    text: cleanText,
    wpm: cleanWpm,
    badge: cleanBadge,
    created_at: new Date().toISOString(),
  };
}

