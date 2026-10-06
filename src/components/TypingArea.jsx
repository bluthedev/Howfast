import React, { useRef, useEffect } from 'react';
import { RotateCcw } from 'lucide-react';

export function TypingArea({
  words = [],
  activeWordIndex = 0,
  currentInput = '',
  wordStatuses = [],
  isTestActive = false,
  isTestFinished = false,
  onInputChange,
  onRestart,
  allowAutocorrect = false,
}) {
  const inputRef = useRef(null);
  const activeWordRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!isTestFinished && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isTestFinished, activeWordIndex]);

  // Keep active word centered into view smoothly
  useEffect(() => {
    if (activeWordRef.current && containerRef.current) {
      const container = containerRef.current;
      const element = activeWordRef.current;

      const containerTop = container.scrollTop;
      const containerBottom = containerTop + container.clientHeight;
      const elemTop = element.offsetTop;
      const elemBottom = elemTop + element.clientHeight;

      if (elemTop < containerTop + 20 || elemBottom > containerBottom - 20) {
        container.scrollTo({
          top: elemTop - 40,
          behavior: 'smooth',
        });
      }
    }
  }, [activeWordIndex]);

  const handleContainerTap = () => {
    if (inputRef.current && !isTestFinished) {
      inputRef.current.focus();
    }
  };

  return (
    <div className="w-full flex flex-col gap-3 px-3 py-1 flex-1 max-w-xl mx-auto">
      {/* Passage Display Area */}
      <div
        ref={containerRef}
        onClick={handleContainerTap}
        className="relative min-h-[145px] max-h-[185px] sm:min-h-[170px] overflow-y-auto p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 cursor-text select-none text-base sm:text-lg leading-relaxed font-mono no-scrollbar"
      >
        <div className="flex flex-wrap gap-x-2 gap-y-1.5 items-center">
          {words.map((word, wordIdx) => {
            const isCurrent = wordIdx === activeWordIndex;
            const status = wordStatuses[wordIdx];

            if (isCurrent) {
              return (
                <span
                  key={wordIdx}
                  ref={activeWordRef}
                  className="relative px-1.5 py-0.5 rounded-md bg-zinc-800/90 border border-amber-500/40 inline-flex items-center text-zinc-100"
                >
                  {word.split('').map((char, charIdx) => {
                    const typedChar = currentInput[charIdx];
                    let charColor = 'text-zinc-300';
                    let underline = false;

                    if (typedChar !== undefined) {
                      if (typedChar === char) {
                        charColor = 'text-zinc-100 font-semibold';
                      } else {
                        charColor = 'text-rose-400 bg-rose-950/50 rounded px-0.5';
                        underline = true;
                      }
                    }

                    const isCaretHere = charIdx === currentInput.length;

                    return (
                      <span key={charIdx} className={`relative ${charColor} ${underline ? 'underline decoration-rose-500' : ''}`}>
                        {isCaretHere && (
                          <span className="absolute -left-[1px] top-1 bottom-1 w-[2px] bg-amber-400 animate-pulse" />
                        )}
                        {char}
                      </span>
                    );
                  })}

                  {/* Excess letters */}
                  {currentInput.length > word.length && (
                    <span className="text-rose-400 bg-rose-950/60 rounded px-0.5">
                      {currentInput.slice(word.length)}
                    </span>
                  )}

                  {/* Trailing caret */}
                  {currentInput.length >= word.length && (
                    <span className="inline-block w-[2px] h-4 bg-amber-400 animate-pulse ml-[1px]" />
                  )}
                </span>
              );
            }

            let wordColor = 'text-zinc-500';
            if (status === 'correct') {
              wordColor = 'text-zinc-300';
            } else if (status === 'incorrect') {
              wordColor = 'text-rose-400/80 line-through';
            }

            return (
              <span key={wordIdx} className={`transition-colors duration-100 ${wordColor}`}>
                {word}
              </span>
            );
          })}
        </div>
      </div>

      {/* Input Bar */}
      <div className="relative w-full">
        <input
          ref={inputRef}
          type="text"
          value={currentInput}
          onChange={(e) => onInputChange(e.target.value)}
          disabled={isTestFinished}
          placeholder={isTestActive ? "" : "Tap here to begin..."}
          autoCapitalize={allowAutocorrect ? "sentences" : "none"}
          autoCorrect={allowAutocorrect ? "on" : "off"}
          autoComplete="off"
          spellCheck={allowAutocorrect ? "true" : "false"}
          enterKeyHint="next"
          className="w-full px-4 py-3 pr-14 rounded-xl bg-zinc-900 border border-zinc-800 focus:border-zinc-600 focus:outline-none text-zinc-100 placeholder-zinc-600 font-mono text-base shadow-sm transition-all"
        />

        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center">
          <button
            onClick={() => {
              onRestart();
              if (inputRef.current) inputRef.current.focus();
            }}
            title="Restart"
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 active:scale-95 transition-all"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between text-[11px] text-zinc-500 font-mono px-1">
        <span>space to advance word</span>
        <span>touch optimized</span>
      </div>
    </div>
  );
}
