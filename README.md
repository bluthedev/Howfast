# ⚡ HOWFAST - Mobile Keyboard Typing Speed Test

A sleek, fast, and addictive mobile-first web application engineered specifically for testing how fast people can type on mobile phone keyboards.

![Howfast Hero Banner](/public/hero.jpg)

---

## 🌟 Features & Gamification

- 📱 **Mobile-First Virtual Viewport**: Fully tuned for iOS Safari & Android Chrome keyboards using dynamic viewport handling. The active word and input never get covered or pushed off-screen.
- ⚡ **Real-Time WPM & Accuracy**: Calculates net WPM, raw WPM, accuracy %, keystrokes, and elapsed time with millisecond precision.
- 👻 **Ghost Racer**: A live race track at the top showing your real-time speed competing against your Personal Best (or a 50 WPM benchmark ghost).
- 🔥 **Combo Streaks & Fire Effects**: Build streaks with consecutive accurate words. Unlock **Warm Up 🔥**, **On Fire ⚡**, and **Hyper Speed 🚀** multipliers with celebration chimes and confetti.
- 📅 **Daily Challenge Mode**: Wordle-style universal daily sentence where everyone globally competes on the exact same phrase once a day.
- 💬 **Chat & Slang Mode**: Test real-world texting speed with modern abbreviations (`ngl`, `tbh`, `idk`, `omw`, `fr fr`, `rizz`, `bussin`).
- 🦥 to 👽 **Thumb Rank Badges**: Unlock funny, rewarding animal rank cards based on your speed:
  - 🦥 *Sloth* (< 25 WPM)
  - 🐢 *Turtle* (25 - 39 WPM)
  - 🐇 *Rabbit* (40 - 54 WPM)
  - 🐆 *Cheetah* (55 - 69 WPM)
  - ⚡ *Speed Demon* (70 - 84 WPM)
  - 👽 *Alien Thumbs* (85+ WPM)
- 🏆 **Global Leaderboard**: Live rankings stored in SQLite with filters for All-Time, Today, and game modes.
- 🔊 **Zero-Latency Web Audio & Haptics**: Built-in sound synthesis for mechanical key clicks, error buzzes, streak chimes, and mobile phone vibration.
- 📤 **Viral Share Card**: 1-tap share with formatted emojis, rank badge, and stats for WhatsApp, iMessage, and social media.
- 📲 **PWA Ready**: Add directly to phone Home Screen for an immersive full-screen experience.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)

### Running the App

```bash
# 1. Start the fullstack server (Backend API + Frontend)
node server/index.js
```
Then open [http://localhost:3001](http://localhost:3001) in your mobile browser or desktop browser with Mobile Device Emulation turned on (`Ctrl+Shift+I` -> `Ctrl+Shift+M`).

### Development Mode (with Hot Reloading)
```bash
# Terminal 1: Start backend API
npm run server

# Terminal 2: Start Vite frontend
npm run dev
```

---

## 🏗️ Architecture

- **Frontend**: React 19, Vite, Tailwind CSS, Lucide Icons, Canvas-Confetti
- **Audio & Haptics**: Native Web Audio API Synthesizer & Vibration API (0 external sound asset delay)
- **Backend**: Node.js, Express
- **Database**: SQLite (Node.js built-in native `node:sqlite`)
- **Brand Assets**: Custom neon cyber mobile logo and hero banner generated in `/public`
