import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { getLeaderboard, submitScore, getStats, getMessages, postMessage } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Daily challenges repository
const DAILY_CHALLENGES = [
  "The quick mobile thumb jumps over the lazy autocorrect bar on every swipe.",
  "Texting at full throttle requires swift fingers and steady screen focus.",
  "No matter how fast you think your thumbs are, speed without accuracy is zero.",
  "Tap with rhythm, breathe with ease, and watch your words flow like lightning.",
  "Quick messages build big conversations when your thumbs race the digital clock.",
  "Speed is great but muscle memory makes you an unstoppable mobile typist.",
  "Hit every key with intention and leave your past personal record in the dust.",
];

function getDailyChallengePhrase(dateStr) {
  // Deterministic hash based on date string (YYYY-MM-DD)
  const today = dateStr || new Date().toISOString().slice(0, 10);
  let hash = 0;
  for (let i = 0; i < today.length; i++) {
    hash = (hash << 5) - hash + today.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % DAILY_CHALLENGES.length;
  return {
    date: today,
    phrase: DAILY_CHALLENGES[index],
  };
}

// REST Endpoints
app.get('/api/leaderboard', (req, res) => {
  try {
    const { mode, timeframe, limit } = req.query;
    const leaderboard = getLeaderboard({ mode, timeframe, limit });
    res.json({ success: true, leaderboard });
  } catch (err) {
    console.error('Error fetching leaderboard:', err);
    res.status(500).json({ success: false, error: 'Failed to load leaderboard' });
  }
});

app.post('/api/scores', (req, res) => {
  try {
    const { username, wpm, raw_wpm, accuracy, mode, duration_seconds, device_type } = req.body;
    if (wpm === undefined || accuracy === undefined) {
      return res.status(400).json({ success: false, error: 'Invalid score submission payload' });
    }

    const result = submitScore({
      username,
      wpm,
      raw_wpm,
      accuracy,
      mode,
      duration_seconds,
      device_type,
    });

    res.json({ success: true, result });
  } catch (err) {
    console.error('Error submitting score:', err);
    res.status(500).json({ success: false, error: 'Failed to save score' });
  }
});

app.get('/api/daily-challenge', (req, res) => {
  try {
    const daily = getDailyChallengePhrase();
    res.json({ success: true, ...daily });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to generate daily challenge' });
  }
});

app.get('/api/stats', (req, res) => {
  try {
    const stats = getStats();
    res.json({ success: true, stats });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch stats' });
  }
});

// Community Chat Endpoints
app.get('/api/messages', (req, res) => {
  try {
    const limit = req.query.limit || 60;
    const messages = getMessages(limit);
    res.json({ success: true, messages });
  } catch (err) {
    console.error('Error fetching messages:', err);
    res.status(500).json({ success: false, error: 'Failed to load messages' });
  }
});

app.post('/api/messages', (req, res) => {
  try {
    const { username, text, wpm, badge } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, error: 'Message cannot be empty' });
    }
    const message = postMessage({ username, text, wpm, badge });
    res.json({ success: true, message });
  } catch (err) {
    console.error('Error posting message:', err);
    res.status(500).json({ success: false, error: 'Failed to post message' });
  }
});

// Serve frontend build if exists
const distPath = path.join(projectRoot, 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`⚡ Howfast API Server running on http://localhost:${PORT}`);
});
