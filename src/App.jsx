import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Header } from './components/Header.jsx';
import { ModeSelector } from './components/ModeSelector.jsx';
import { GhostRacer } from './components/GhostRacer.jsx';
import { ComboMeter } from './components/ComboMeter.jsx';
import { StatsBar } from './components/StatsBar.jsx';
import { TypingArea } from './components/TypingArea.jsx';
import { ResultModal } from './components/ResultModal.jsx';
import { LeaderboardModal } from './components/LeaderboardModal.jsx';
import { CommunityChat } from './components/CommunityChat.jsx';
import { AdminModal } from './components/AdminModal.jsx';
import { sound } from './utils/audio.js';
import { getRandomWords, getDailyChallengeWords } from './utils/wordBanks.js';
import { Shield } from 'lucide-react';

export function App() {
  const [mode, setMode] = useState('story'); // Default to interesting story mode!
  const [words, setWords] = useState([]);
  const [activeWordIndex, setActiveWordIndex] = useState(0);
  const [currentInput, setCurrentInput] = useState('');
  const [wordStatuses, setWordStatuses] = useState([]);

  // Test lifecycle
  const [isTestActive, setIsTestActive] = useState(false);
  const [isTestFinished, setIsTestFinished] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);

  // Performance
  const [keystrokes, setKeystrokes] = useState({ total: 0, correct: 0, errors: 0 });
  const [liveWpm, setLiveWpm] = useState(0);
  const [rawWpm, setRawWpm] = useState(0);
  const [liveAccuracy, setLiveAccuracy] = useState(100);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);

  // Modals & UI
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isResultOpen, setIsResultOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(sound.isMuted);
  const [isHapticsEnabled, setIsHapticsEnabled] = useState(sound.isHapticsEnabled);
  const [allowAutocorrect, setAllowAutocorrect] = useState(false);

  // Results payload
  const [finalResults, setFinalResults] = useState(null);

  // Personal Best
  const [personalBest, setPersonalBest] = useState(() => {
    return Number(localStorage.getItem(`howfast_pb_${mode}`) || 0);
  });

  const timerRef = useRef(null);

  // Check if mode is untimed (finishes when all words completed)
  const isPassageMode = useCallback((m) => {
    return m === 'story' || m === 'lyrics' || m === 'daily';
  }, []);

  const getModeDuration = useCallback((m) => {
    if (m === '15s') return 15;
    if (m === '30s') return 30;
    if (m === '60s') return 60;
    if (m === 'slang') return 30;
    return 0; // story, lyrics, daily count elapsed seconds
  }, []);

  // Initialize or reset words
  const initializeTest = useCallback((selectedMode = mode) => {
    if (timerRef.current) clearInterval(timerRef.current);

    let initialWords;
    if (selectedMode === 'daily') {
      initialWords = getDailyChallengeWords();
    } else {
      initialWords = getRandomWords(60, selectedMode);
    }

    const duration = getModeDuration(selectedMode);
    setWords(initialWords);
    setActiveWordIndex(0);
    setCurrentInput('');
    setWordStatuses(new Array(initialWords.length).fill('pending'));
    setIsTestActive(false);
    setIsTestFinished(false);
    setStartTime(null);
    setTimeLeft(duration);
    setKeystrokes({ total: 0, correct: 0, errors: 0 });
    setLiveWpm(0);
    setRawWpm(0);
    setLiveAccuracy(100);
    setCombo(0);
    setMaxCombo(0);
    setIsResultOpen(false);

    const storedPb = Number(localStorage.getItem(`howfast_pb_${selectedMode}`) || 0);
    setPersonalBest(storedPb);
  }, [mode, getModeDuration]);

  useEffect(() => {
    initializeTest(mode);
  }, []);

  const handleSelectMode = (newMode) => {
    if (isTestActive) return;
    setMode(newMode);
    initializeTest(newMode);
  };

  // Finish test
  const finishTest = useCallback((finalDuration) => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsTestActive(false);
    setIsTestFinished(true);

    const elapsedMinutes = Math.max((finalDuration || 1) / 60, 0.05);

    let correctChars = 0;
    wordStatuses.forEach((status, idx) => {
      if (status === 'correct' && words[idx]) {
        correctChars += words[idx].length + 1;
      }
    });

    const calculatedWpm = Math.round((correctChars / 5) / elapsedMinutes);
    const calculatedRawWpm = Math.round((keystrokes.total / 5) / elapsedMinutes);
    const calculatedAcc =
      keystrokes.total > 0
        ? Math.round((keystrokes.correct / keystrokes.total) * 100)
        : 100;

    const results = {
      wpm: calculatedWpm,
      rawWpm: calculatedRawWpm,
      accuracy: calculatedAcc,
      duration: finalDuration,
      totalKeystrokes: keystrokes.total,
      correctKeystrokes: keystrokes.correct,
      errorKeystrokes: keystrokes.errors,
      maxCombo,
    };

    setFinalResults(results);
    setIsResultOpen(true);
    sound.playFinishFanfare();
  }, [wordStatuses, words, keystrokes, maxCombo]);

  // Main timer loop
  useEffect(() => {
    if (!isTestActive) return;

    const untimed = isPassageMode(mode);
    const totalDuration = getModeDuration(mode);

    timerRef.current = setInterval(() => {
      if (!startTime) return;
      const elapsedSeconds = (Date.now() - startTime) / 1000;

      if (untimed) {
        setTimeLeft(elapsedSeconds);
      } else {
        const remaining = Math.max(totalDuration - elapsedSeconds, 0);
        setTimeLeft(remaining);

        if (remaining <= 0) {
          finishTest(totalDuration);
        }
      }

      // Live metrics update
      if (elapsedSeconds > 0.8) {
        const elapsedMinutes = elapsedSeconds / 60;
        let correctChars = 0;
        wordStatuses.forEach((status, idx) => {
          if (status === 'correct' && words[idx]) {
            correctChars += words[idx].length + 1;
          }
        });
        setLiveWpm(Math.round((correctChars / 5) / elapsedMinutes));
        setRawWpm(Math.round((keystrokes.total / 5) / elapsedMinutes));

        if (keystrokes.total > 0) {
          setLiveAccuracy(Math.round((keystrokes.correct / keystrokes.total) * 100));
        }
      }
    }, 100);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTestActive, startTime, mode, wordStatuses, words, keystrokes, isPassageMode, getModeDuration, finishTest]);

  // Input change
  const handleInputChange = (value) => {
    if (isTestFinished) return;

    if (!isTestActive) {
      setIsTestActive(true);
      setStartTime(Date.now());
    }

    const targetWord = words[activeWordIndex] || '';

    // Space key advances word
    if (value.endsWith(' ')) {
      const typedWord = value.trim();
      const isWordCorrect = typedWord === targetWord;

      const updatedStatuses = [...wordStatuses];
      updatedStatuses[activeWordIndex] = isWordCorrect ? 'correct' : 'incorrect';
      setWordStatuses(updatedStatuses);

      const wordCharsCorrect = isWordCorrect ? targetWord.length + 1 : 0;
      const wordErrors = isWordCorrect ? 0 : Math.max(typedWord.length, targetWord.length);

      setKeystrokes((prev) => ({
        total: prev.total + value.length,
        correct: prev.correct + wordCharsCorrect,
        errors: prev.errors + wordErrors,
      }));

      if (isWordCorrect) {
        const newCombo = combo + 1;
        setCombo(newCombo);
        if (newCombo > maxCombo) setMaxCombo(newCombo);

        if (newCombo % 5 === 0) {
          sound.playStreakChime(newCombo);
        } else {
          sound.playKeyClick();
        }
      } else {
        setCombo(0);
        sound.playErrorBuzz();
      }

      const nextWordIdx = activeWordIndex + 1;
      setActiveWordIndex(nextWordIdx);
      setCurrentInput('');

      // If story, lyrics or daily finished all words
      if (isPassageMode(mode) && nextWordIdx >= words.length) {
        const totalElapsed = (Date.now() - (startTime || Date.now())) / 1000;
        finishTest(totalElapsed);
      }
      return;
    }

    // Letter-by-letter checking
    const lastCharTyped = value.slice(-1);
    const expectedChar = targetWord[value.length - 1];

    if (value.length > currentInput.length) {
      const isCharCorrect = lastCharTyped === expectedChar;
      if (isCharCorrect) {
        sound.playKeyClick();
        setKeystrokes((prev) => ({ ...prev, total: prev.total + 1, correct: prev.correct + 1 }));
      } else {
        sound.playErrorBuzz();
        setKeystrokes((prev) => ({ ...prev, total: prev.total + 1, errors: prev.errors + 1 }));
      }
    }

    setCurrentInput(value);
  };

  // Ghost racer calculations
  const targetGhostWpm = personalBest > 25 ? personalBest : 50;
  let userProgress = 0;
  let ghostProgress = 0;

  if (isTestActive && startTime) {
    const elapsed = (Date.now() - startTime) / 1000;
    const totalDuration = getModeDuration(mode);

    if (isPassageMode(mode)) {
      userProgress = (activeWordIndex / Math.max(words.length, 1)) * 100;
      const expectedTimeForGhost = (words.length * 5) / ((targetGhostWpm / 60) * 5);
      ghostProgress = (elapsed / Math.max(expectedTimeForGhost, 1)) * 100;
    } else {
      const estimatedTargetWords = targetGhostWpm * (totalDuration / 60);
      userProgress = (activeWordIndex / Math.max(estimatedTargetWords, 1)) * 100;
      ghostProgress = (elapsed / Math.max(totalDuration, 1)) * 100;
    }
  }

  const handleNewPersonalBest = (newWpm) => {
    setPersonalBest(newWpm);
    localStorage.setItem(`howfast_pb_${mode}`, String(newWpm));
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#0e1015] text-zinc-100 font-sans selection:bg-amber-400 selection:text-black">
      {/* Header */}
      <Header
        isMuted={isMuted}
        onToggleMute={() => setIsMuted(sound.toggleMute())}
        isHapticsEnabled={isHapticsEnabled}
        onToggleHaptics={() => setIsHapticsEnabled(sound.toggleHaptics())}
        onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
        onOpenChat={() => setIsChatOpen(true)}
        personalBest={personalBest}
      />

      {/* Main Focus Area */}
      <main className="flex-1 flex flex-col justify-between max-w-xl w-full mx-auto pb-4">
        <div className="w-full flex flex-col gap-1">
          <ModeSelector
            currentMode={mode}
            onSelectMode={handleSelectMode}
            isTestActive={isTestActive}
            allowAutocorrect={allowAutocorrect}
            onToggleAutocorrect={() => setAllowAutocorrect(!allowAutocorrect)}
          />

          <GhostRacer
            userProgress={userProgress}
            ghostProgress={ghostProgress}
            currentWpm={liveWpm}
            targetWpm={targetGhostWpm}
            isTestActive={isTestActive}
          />

          <ComboMeter combo={combo} />

          <StatsBar
            wpm={liveWpm}
            accuracy={liveAccuracy}
            timeLeft={timeLeft}
            totalTime={getModeDuration(mode)}
            mode={mode}
            isTestActive={isTestActive}
          />
        </div>

        {/* Typing Area */}
        <div className="my-auto py-2">
          <TypingArea
            words={words}
            activeWordIndex={activeWordIndex}
            currentInput={currentInput}
            wordStatuses={wordStatuses}
            isTestActive={isTestActive}
            isTestFinished={isTestFinished}
            onInputChange={handleInputChange}
            onRestart={() => initializeTest(mode)}
            allowAutocorrect={allowAutocorrect}
          />
        </div>

        <footer className="px-4 text-[10px] text-zinc-600 font-mono flex items-center justify-between">
          <span>clean, fast mobile typing</span>
          <button
            onClick={() => setIsAdminOpen(true)}
            className="text-zinc-600 hover:text-zinc-400 transition-colors py-1 px-1.5 rounded flex items-center gap-1 active:scale-95"
            title="Platform Monitor (PIN: 147258)"
          >
            <Shield className="w-3 h-3 text-zinc-500" />
            <span>monitor</span>
          </button>
        </footer>
      </main>

      {/* Result Modal */}
      <ResultModal
        isOpen={isResultOpen}
        results={finalResults}
        onRestart={() => initializeTest(mode)}
        personalBest={personalBest}
        onNewPersonalBest={handleNewPersonalBest}
        mode={mode}
      />

      {/* Global Leaderboard Modal */}
      <LeaderboardModal
        isOpen={isLeaderboardOpen}
        onClose={() => setIsLeaderboardOpen(false)}
      />

      {/* General Community Chat */}
      <CommunityChat
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        userWpm={liveWpm || personalBest}
        userBadge="Texter"
      />

      {/* Admin Activity Monitor */}
      <AdminModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
      />
    </div>
  );
}

export default App;
