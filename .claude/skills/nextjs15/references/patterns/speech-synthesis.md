---
id: pt-speech-synthesis
name: Speech Synthesis
version: 2.0.0
layer: L5
category: data
description: Text-to-speech functionality with voice selection and playback controls
tags: [speech, tts, text-to-speech, voice, accessibility, audio]
composes: []
formula: "SpeechSynthesis = WebSpeechAPI + VoiceSelection + PlaybackControls + QueueManagement"
dependencies:
  - react
accessibility:
  wcag: AAA
  keyboard: true
  screen-reader: true
performance:
  impact: low
  lcp: neutral
  cls: neutral
---

# Speech Synthesis

## Overview

Implement text-to-speech functionality using the Web Speech API with voice selection, playback controls, rate/pitch adjustment, and accessibility features.

## When to Use

- Adding audio accessibility features for visually impaired users
- Building article "read aloud" functionality
- Creating voice-enabled notifications and announcements
- Implementing language learning applications
- Need for hands-free content consumption

## Composition Diagram

```
[Text Content] --> [useSpeechSynthesis Hook]
                          |
            +-------------+-------------+
            |             |             |
      [Voice Selection] [Settings]  [Queue]
            |             |             |
            +-------------+-------------+
                          |
                  [SpeechSynthesisUtterance]
                          |
            +-------------+-------------+
            |             |             |
         [Play]       [Pause]       [Stop]
            |             |             |
      [Progress]    [Resume]      [Reset]
                          |
                  [Audio Output]
```

## Implementation

### Speech Types

```tsx
// lib/speech/types.ts
export interface SpeechOptions {
  text: string;
  voice?: SpeechSynthesisVoice;
  rate?: number; // 0.1 to 10
  pitch?: number; // 0 to 2
  volume?: number; // 0 to 1
  lang?: string;
}

export interface SpeechState {
  isSpeaking: boolean;
  isPaused: boolean;
  isSupported: boolean;
  voices: SpeechSynthesisVoice[];
  currentVoice: SpeechSynthesisVoice | null;
  progress: number;
}

export interface SpeechQueueItem {
  id: string;
  text: string;
  options?: Partial<SpeechOptions>;
}
```

### Speech Synthesis Hook

```tsx
// hooks/use-speech-synthesis.ts
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { SpeechOptions, SpeechState, SpeechQueueItem } from '@/lib/speech/types';

interface UseSpeechSynthesisOptions {
  defaultVoice?: string;
  defaultRate?: number;
  defaultPitch?: number;
  defaultVolume?: number;
  onStart?: () => void;
  onEnd?: () => void;
  onPause?: () => void;
  onResume?: () => void;
  onError?: (error: Error) => void;
  onBoundary?: (event: SpeechSynthesisEvent) => void;
}

export function useSpeechSynthesis(options: UseSpeechSynthesisOptions = {}) {
  const [state, setState] = useState<SpeechState>({
    isSpeaking: false,
    isPaused: false,
    isSupported: false,
    voices: [],
    currentVoice: null,
    progress: 0,
  });

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const queueRef = useRef<SpeechQueueItem[]>([]);
  const currentIndexRef = useRef(0);

  // Check browser support and load voices
  useEffect(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      return;
    }

    setState((prev) => ({ ...prev, isSupported: true }));

    const loadVoices = () => {
      const voices = speechSynthesis.getVoices();
      if (voices.length > 0) {
        const defaultVoice =
          voices.find((v) => v.name === options.defaultVoice) ||
          voices.find((v) => v.default) ||
          voices[0];

        setState((prev) => ({
          ...prev,
          voices,
          currentVoice: defaultVoice,
        }));
      }
    };

    loadVoices();
    speechSynthesis.addEventListener('voiceschanged', loadVoices);

    return () => {
      speechSynthesis.removeEventListener('voiceschanged', loadVoices);
      speechSynthesis.cancel();
    };
  }, [options.defaultVoice]);

  const speak = useCallback(
    (speechOptions: SpeechOptions) => {
      if (!state.isSupported) {
        options.onError?.(new Error('Speech synthesis not supported'));
        return;
      }

      // Cancel any ongoing speech
      speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(speechOptions.text);

      utterance.voice = speechOptions.voice || state.currentVoice;
      utterance.rate = speechOptions.rate ?? options.defaultRate ?? 1;
      utterance.pitch = speechOptions.pitch ?? options.defaultPitch ?? 1;
      utterance.volume = speechOptions.volume ?? options.defaultVolume ?? 1;
      utterance.lang = speechOptions.lang || utterance.voice?.lang || 'en-US';

      utterance.onstart = () => {
        setState((prev) => ({ ...prev, isSpeaking: true, isPaused: false, progress: 0 }));
        options.onStart?.();
      };

      utterance.onend = () => {
        setState((prev) => ({ ...prev, isSpeaking: false, isPaused: false, progress: 100 }));
        options.onEnd?.();
        processQueue();
      };

      utterance.onpause = () => {
        setState((prev) => ({ ...prev, isPaused: true }));
        options.onPause?.();
      };

      utterance.onresume = () => {
        setState((prev) => ({ ...prev, isPaused: false }));
        options.onResume?.();
      };

      utterance.onerror = (event) => {
        setState((prev) => ({ ...prev, isSpeaking: false, isPaused: false }));
        options.onError?.(new Error(event.error));
      };

      utterance.onboundary = (event) => {
        if (event.name === 'word') {
          const progress = Math.round(
            (event.charIndex / speechOptions.text.length) * 100
          );
          setState((prev) => ({ ...prev, progress }));
        }
        options.onBoundary?.(event);
      };

      utteranceRef.current = utterance;
      speechSynthesis.speak(utterance);
    },
    [state.isSupported, state.currentVoice, options]
  );

  const processQueue = useCallback(() => {
    currentIndexRef.current++;
    if (currentIndexRef.current < queueRef.current.length) {
      const item = queueRef.current[currentIndexRef.current];
      speak({ text: item.text, ...item.options });
    } else {
      queueRef.current = [];
      currentIndexRef.current = 0;
    }
  }, [speak]);

  const speakQueue = useCallback(
    (items: SpeechQueueItem[]) => {
      queueRef.current = items;
      currentIndexRef.current = 0;
      if (items.length > 0) {
        const first = items[0];
        speak({ text: first.text, ...first.options });
      }
    },
    [speak]
  );

  const pause = useCallback(() => {
    if (state.isSpeaking && !state.isPaused) {
      speechSynthesis.pause();
    }
  }, [state.isSpeaking, state.isPaused]);

  const resume = useCallback(() => {
    if (state.isPaused) {
      speechSynthesis.resume();
    }
  }, [state.isPaused]);

  const stop = useCallback(() => {
    speechSynthesis.cancel();
    queueRef.current = [];
    currentIndexRef.current = 0;
    setState((prev) => ({ ...prev, isSpeaking: false, isPaused: false, progress: 0 }));
  }, []);

  const setVoice = useCallback((voice: SpeechSynthesisVoice) => {
    setState((prev) => ({ ...prev, currentVoice: voice }));
  }, []);

  const getVoicesByLang = useCallback(
    (lang: string) => {
      return state.voices.filter((v) => v.lang.startsWith(lang));
    },
    [state.voices]
  );

  return {
    ...state,
    speak,
    speakQueue,
    pause,
    resume,
    stop,
    setVoice,
    getVoicesByLang,
  };
}
```

### Text-to-Speech Component

```tsx
// components/text-to-speech.tsx
'use client';

import { useState } from 'react';
import { Play, Pause, Square, Volume2, VolumeX, Settings } from 'lucide-react';
import { useSpeechSynthesis } from '@/hooks/use-speech-synthesis';
import * as Popover from '@radix-ui/react-popover';
import * as Slider from '@radix-ui/react-slider';

interface TextToSpeechProps {
  text: string;
  className?: string;
  showSettings?: boolean;
  autoHighlight?: boolean;
}

export function TextToSpeech({
  text,
  className = '',
  showSettings = true,
}: TextToSpeechProps) {
  const [rate, setRate] = useState(1);
  const [pitch, setPitch] = useState(1);
  const [volume, setVolume] = useState(1);

  const {
    isSpeaking,
    isPaused,
    isSupported,
    voices,
    currentVoice,
    progress,
    speak,
    pause,
    resume,
    stop,
    setVoice,
  } = useSpeechSynthesis();

  if (!isSupported) {
    return null;
  }

  const handlePlayPause = () => {
    if (isSpeaking && !isPaused) {
      pause();
    } else if (isPaused) {
      resume();
    } else {
      speak({ text, rate, pitch, volume });
    }
  };

  const englishVoices = voices.filter((v) => v.lang.startsWith('en'));

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Play/Pause Button */}
      <button
        onClick={handlePlayPause}
        className="p-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors"
        aria-label={isSpeaking && !isPaused ? 'Pause' : 'Play'}
      >
        {isSpeaking && !isPaused ? (
          <Pause className="w-5 h-5" />
        ) : (
          <Play className="w-5 h-5" />
        )}
      </button>

      {/* Stop Button */}
      {isSpeaking && (
        <button
          onClick={stop}
          className="p-2 rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors"
          aria-label="Stop"
        >
          <Square className="w-5 h-5" />
        </button>
      )}

      {/* Progress Bar */}
      {isSpeaking && (
        <div className="flex-1 h-1 bg-gray-200 rounded-full overflow-hidden max-w-32">
          <div
            className="h-full bg-blue-600 transition-all duration-100"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* Volume Toggle */}
      <button
        onClick={() => setVolume(volume === 0 ? 1 : 0)}
        className="p-2 rounded-full hover:bg-gray-100 transition-colors"
        aria-label={volume === 0 ? 'Unmute' : 'Mute'}
      >
        {volume === 0 ? (
          <VolumeX className="w-5 h-5 text-gray-600" />
        ) : (
          <Volume2 className="w-5 h-5 text-gray-600" />
        )}
      </button>

      {/* Settings Popover */}
      {showSettings && (
        <Popover.Root>
          <Popover.Trigger asChild>
            <button
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Speech settings"
            >
              <Settings className="w-5 h-5 text-gray-600" />
            </button>
          </Popover.Trigger>

          <Popover.Portal>
            <Popover.Content
              className="w-72 bg-white rounded-lg shadow-lg border p-4 z-50"
              sideOffset={5}
            >
              <div className="space-y-4">
                {/* Voice Selection */}
                <div>
                  <label className="block text-sm font-medium mb-1">Voice</label>
                  <select
                    value={currentVoice?.name || ''}
                    onChange={(e) => {
                      const voice = voices.find((v) => v.name === e.target.value);
                      if (voice) setVoice(voice);
                    }}
                    className="w-full px-3 py-2 border rounded-md text-sm"
                  >
                    {englishVoices.map((voice) => (
                      <option key={voice.name} value={voice.name}>
                        {voice.name} ({voice.lang})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Rate Slider */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Speed: {rate.toFixed(1)}x
                  </label>
                  <Slider.Root
                    value={[rate]}
                    onValueChange={([value]) => setRate(value)}
                    min={0.5}
                    max={2}
                    step={0.1}
                    className="relative flex items-center w-full h-5"
                  >
                    <Slider.Track className="relative h-1 grow rounded-full bg-gray-200">
                      <Slider.Range className="absolute h-full rounded-full bg-blue-600" />
                    </Slider.Track>
                    <Slider.Thumb className="block w-4 h-4 bg-white border-2 border-blue-600 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </Slider.Root>
                </div>

                {/* Pitch Slider */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Pitch: {pitch.toFixed(1)}
                  </label>
                  <Slider.Root
                    value={[pitch]}
                    onValueChange={([value]) => setPitch(value)}
                    min={0.5}
                    max={2}
                    step={0.1}
                    className="relative flex items-center w-full h-5"
                  >
                    <Slider.Track className="relative h-1 grow rounded-full bg-gray-200">
                      <Slider.Range className="absolute h-full rounded-full bg-blue-600" />
                    </Slider.Track>
                    <Slider.Thumb className="block w-4 h-4 bg-white border-2 border-blue-600 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </Slider.Root>
                </div>

                {/* Volume Slider */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Volume: {Math.round(volume * 100)}%
                  </label>
                  <Slider.Root
                    value={[volume]}
                    onValueChange={([value]) => setVolume(value)}
                    min={0}
                    max={1}
                    step={0.1}
                    className="relative flex items-center w-full h-5"
                  >
                    <Slider.Track className="relative h-1 grow rounded-full bg-gray-200">
                      <Slider.Range className="absolute h-full rounded-full bg-blue-600" />
                    </Slider.Track>
                    <Slider.Thumb className="block w-4 h-4 bg-white border-2 border-blue-600 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </Slider.Root>
                </div>
              </div>

              <Popover.Arrow className="fill-white" />
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>
      )}
    </div>
  );
}
```

### Read Aloud Article Component

```tsx
// components/read-aloud-article.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Square } from 'lucide-react';
import { useSpeechSynthesis } from '@/hooks/use-speech-synthesis';

interface ReadAloudArticleProps {
  content: string;
  className?: string;
}

export function ReadAloudArticle({ content, className }: ReadAloudArticleProps) {
  const [paragraphs, setParagraphs] = useState<string[]>([]);
  const [currentParagraph, setCurrentParagraph] = useState(0);
  const [highlightedText, setHighlightedText] = useState('');
  const contentRef = useRef<HTMLDivElement>(null);

  const {
    isSpeaking,
    isPaused,
    isSupported,
    speak,
    speakQueue,
    pause,
    resume,
    stop,
  } = useSpeechSynthesis({
    onEnd: () => {
      if (currentParagraph < paragraphs.length - 1) {
        setCurrentParagraph((prev) => prev + 1);
      }
    },
    onBoundary: (event) => {
      if (event.name === 'word') {
        const text = paragraphs[currentParagraph];
        const word = text.substring(event.charIndex, event.charIndex + event.charLength);
        setHighlightedText(word);
      }
    },
  });

  // Parse content into paragraphs
  useEffect(() => {
    const div = document.createElement('div');
    div.innerHTML = content;
    const textContent = div.textContent || '';
    const paras = textContent
      .split(/\n\n+/)
      .map((p) => p.trim())
      .filter((p) => p.length > 0);
    setParagraphs(paras);
  }, [content]);

  // Speak current paragraph when it changes during playback
  useEffect(() => {
    if (isSpeaking && !isPaused && paragraphs[currentParagraph]) {
      speak({ text: paragraphs[currentParagraph] });
    }
  }, [currentParagraph]);

  const handlePlayPause = () => {
    if (isSpeaking && !isPaused) {
      pause();
    } else if (isPaused) {
      resume();
    } else {
      speak({ text: paragraphs[currentParagraph] });
    }
  };

  const handleStop = () => {
    stop();
    setCurrentParagraph(0);
    setHighlightedText('');
  };

  const handlePrevious = () => {
    if (currentParagraph > 0) {
      stop();
      setCurrentParagraph((prev) => prev - 1);
      speak({ text: paragraphs[currentParagraph - 1] });
    }
  };

  const handleNext = () => {
    if (currentParagraph < paragraphs.length - 1) {
      stop();
      setCurrentParagraph((prev) => prev + 1);
      speak({ text: paragraphs[currentParagraph + 1] });
    }
  };

  if (!isSupported) {
    return null;
  }

  return (
    <div className={className}>
      {/* Controls */}
      <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-center gap-4 z-10">
        <button
          onClick={handlePrevious}
          disabled={currentParagraph === 0}
          className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Previous paragraph"
        >
          <SkipBack className="w-5 h-5" />
        </button>

        <button
          onClick={handlePlayPause}
          className="p-3 rounded-full bg-blue-600 text-white hover:bg-blue-700"
          aria-label={isSpeaking && !isPaused ? 'Pause' : 'Play'}
        >
          {isSpeaking && !isPaused ? (
            <Pause className="w-6 h-6" />
          ) : (
            <Play className="w-6 h-6" />
          )}
        </button>

        <button
          onClick={handleStop}
          disabled={!isSpeaking}
          className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Stop"
        >
          <Square className="w-5 h-5" />
        </button>

        <button
          onClick={handleNext}
          disabled={currentParagraph === paragraphs.length - 1}
          className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Next paragraph"
        >
          <SkipForward className="w-5 h-5" />
        </button>

        <span className="text-sm text-gray-500 ml-4">
          {currentParagraph + 1} / {paragraphs.length}
        </span>
      </div>

      {/* Content with highlighting */}
      <div ref={contentRef} className="prose max-w-none p-6">
        {paragraphs.map((paragraph, index) => (
          <p
            key={index}
            className={`transition-colors duration-200 ${
              index === currentParagraph && isSpeaking
                ? 'bg-yellow-100 rounded px-2 -mx-2'
                : ''
            } ${index < currentParagraph ? 'text-gray-400' : ''}`}
          >
            {paragraph}
          </p>
        ))}
      </div>
    </div>
  );
}
```

### Accessibility Announcement Component

```tsx
// components/announce.tsx
'use client';

import { useEffect } from 'react';
import { useSpeechSynthesis } from '@/hooks/use-speech-synthesis';

interface AnnounceProps {
  message: string;
  politeness?: 'polite' | 'assertive';
  speakAloud?: boolean;
}

export function Announce({
  message,
  politeness = 'polite',
  speakAloud = false,
}: AnnounceProps) {
  const { speak, isSupported } = useSpeechSynthesis();

  useEffect(() => {
    if (speakAloud && isSupported && message) {
      speak({ text: message });
    }
  }, [message, speakAloud, isSupported, speak]);

  return (
    <div
      role="status"
      aria-live={politeness}
      aria-atomic="true"
      className="sr-only"
    >
      {message}
    </div>
  );
}
```

## Usage

```tsx
// app/article/page.tsx
import { TextToSpeech } from '@/components/text-to-speech';
import { ReadAloudArticle } from '@/components/read-aloud-article';

const articleContent = `
  <p>This is the first paragraph of the article. It contains important information that readers might want to listen to.</p>
  
  <p>The second paragraph continues with more details. Speech synthesis makes content more accessible to users who prefer audio.</p>
  
  <p>Finally, the conclusion wraps up the main points discussed in this article.</p>
`;

export default function ArticlePage() {
  const plainText = "This is a sample text that can be read aloud using speech synthesis. It demonstrates the text-to-speech functionality.";

  return (
    <div className="max-w-3xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-4">Article Title</h1>
      
      {/* Simple TTS controls */}
      <div className="flex items-center gap-4 mb-8 p-4 bg-gray-50 rounded-lg">
        <span className="text-sm text-gray-600">Listen to this article:</span>
        <TextToSpeech text={plainText} showSettings />
      </div>

      {/* Full read-aloud experience */}
      <ReadAloudArticle content={articleContent} />
    </div>
  );
}
```

## Related Skills

- [[speech-recognition]] - Voice input
- [[accessibility]] - Accessibility patterns
- [[audio]] - Audio playback
- [[offline-mode]] - Offline support

## Changelog

### 2.0.0 (2025-01-18)
- Standardized to atomic design system v2
- Updated frontmatter schema

### 1.0.0 (2025-01-17)
- Initial implementation
- Voice selection and settings
- Playback controls (play, pause, stop)
- Rate, pitch, volume adjustment
- Read-aloud article component
- Accessibility announcements
