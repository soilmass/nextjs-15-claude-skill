---
id: pt-speech-recognition
name: Speech Recognition
version: 2.0.0
layer: L5
category: data
description: Voice input with real-time transcription and command recognition
tags: [speech, voice, recognition, transcription, commands, accessibility]
composes: []
formula: "SpeechRecognition = WebSpeechAPI + TranscriptionState + CommandMatching + ErrorHandling"
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

# Speech Recognition

## Overview

Implement voice input using the Web Speech API with real-time transcription, voice commands, and multi-language support.

## When to Use

- Building voice search functionality
- Implementing hands-free form input
- Creating voice command interfaces for navigation
- Adding accessibility for motor-impaired users
- Building dictation or note-taking features

## Composition Diagram

```
[Microphone Input] --> [SpeechRecognition API]
                              |
                    [useSpeechRecognition Hook]
                              |
            +-----------------+-----------------+
            |                 |                 |
      [Interim Results] [Final Results] [Error Handling]
            |                 |                 |
      [Live Preview]    [Transcript]     [User Feedback]
                              |
                    [Command Processing]
                              |
            +-----------------+-----------------+
            |                 |                 |
      [String Match]    [Regex Match]    [Callback]
            |                 |                 |
            +-----------------+-----------------+
                              |
                        [Action Executed]
```

## Implementation

### Speech Recognition Types

```tsx
// lib/speech/recognition-types.ts
export interface RecognitionOptions {
  continuous?: boolean;
  interimResults?: boolean;
  lang?: string;
  maxAlternatives?: number;
}

export interface RecognitionResult {
  transcript: string;
  confidence: number;
  isFinal: boolean;
  alternatives?: { transcript: string; confidence: number }[];
}

export interface VoiceCommand {
  command: string | RegExp;
  callback: (params?: Record<string, string>) => void;
  description?: string;
}

export interface RecognitionState {
  isListening: boolean;
  isSupported: boolean;
  transcript: string;
  interimTranscript: string;
  error: string | null;
}
```

### Speech Recognition Hook

```tsx
// hooks/use-speech-recognition.ts
'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import {
  RecognitionOptions,
  RecognitionResult,
  RecognitionState,
  VoiceCommand,
} from '@/lib/speech/recognition-types';

// TypeScript declarations for Web Speech API
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message?: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onstart: ((this: SpeechRecognition, ev: Event) => void) | null;
  onend: ((this: SpeechRecognition, ev: Event) => void) | null;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => void) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

interface UseSpeechRecognitionOptions extends RecognitionOptions {
  commands?: VoiceCommand[];
  onResult?: (result: RecognitionResult) => void;
  onError?: (error: string) => void;
  onStart?: () => void;
  onEnd?: () => void;
}

export function useSpeechRecognition(options: UseSpeechRecognitionOptions = {}) {
  const [state, setState] = useState<RecognitionState>({
    isListening: false,
    isSupported: false,
    transcript: '',
    interimTranscript: '',
    error: null,
  });

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const commandsRef = useRef<VoiceCommand[]>(options.commands || []);

  // Update commands ref when options change
  useEffect(() => {
    commandsRef.current = options.commands || [];
  }, [options.commands]);

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setState((prev) => ({ ...prev, isSupported: false }));
      return;
    }

    setState((prev) => ({ ...prev, isSupported: true }));

    const recognition = new SpeechRecognition();
    recognition.continuous = options.continuous ?? false;
    recognition.interimResults = options.interimResults ?? true;
    recognition.lang = options.lang || 'en-US';
    recognition.maxAlternatives = options.maxAlternatives || 1;

    recognition.onstart = () => {
      setState((prev) => ({ ...prev, isListening: true, error: null }));
      options.onStart?.();
    };

    recognition.onend = () => {
      setState((prev) => ({ ...prev, isListening: false, interimTranscript: '' }));
      options.onEnd?.();
    };

    recognition.onerror = (event) => {
      const errorMessage = getErrorMessage(event.error);
      setState((prev) => ({ ...prev, error: errorMessage, isListening: false }));
      options.onError?.(errorMessage);
    };

    recognition.onresult = (event) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcript = result[0].transcript;

        if (result.isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      if (finalTranscript) {
        setState((prev) => ({
          ...prev,
          transcript: prev.transcript + finalTranscript,
          interimTranscript: '',
        }));

        const result: RecognitionResult = {
          transcript: finalTranscript,
          confidence: event.results[event.results.length - 1][0].confidence,
          isFinal: true,
        };

        options.onResult?.(result);
        processCommands(finalTranscript.toLowerCase().trim());
      } else {
        setState((prev) => ({ ...prev, interimTranscript }));

        if (options.interimResults) {
          options.onResult?.({
            transcript: interimTranscript,
            confidence: 0,
            isFinal: false,
          });
        }
      }
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.abort();
    };
  }, [options.continuous, options.interimResults, options.lang, options.maxAlternatives]);

  const processCommands = useCallback((transcript: string) => {
    for (const cmd of commandsRef.current) {
      if (typeof cmd.command === 'string') {
        if (transcript.includes(cmd.command.toLowerCase())) {
          cmd.callback();
          return;
        }
      } else if (cmd.command instanceof RegExp) {
        const match = transcript.match(cmd.command);
        if (match) {
          const params: Record<string, string> = {};
          match.slice(1).forEach((value, index) => {
            params[`$${index + 1}`] = value;
          });
          cmd.callback(params);
          return;
        }
      }
    }
  }, []);

  const startListening = useCallback(() => {
    if (recognitionRef.current && !state.isListening) {
      try {
        recognitionRef.current.start();
      } catch (error) {
        // Already started
      }
    }
  }, [state.isListening]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && state.isListening) {
      recognitionRef.current.stop();
    }
  }, [state.isListening]);

  const toggleListening = useCallback(() => {
    if (state.isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [state.isListening, startListening, stopListening]);

  const resetTranscript = useCallback(() => {
    setState((prev) => ({ ...prev, transcript: '', interimTranscript: '' }));
  }, []);

  return {
    ...state,
    startListening,
    stopListening,
    toggleListening,
    resetTranscript,
  };
}

function getErrorMessage(error: string): string {
  const errorMessages: Record<string, string> = {
    'no-speech': 'No speech was detected. Please try again.',
    'audio-capture': 'No microphone was found. Please check your audio settings.',
    'not-allowed': 'Microphone permission was denied. Please allow access.',
    aborted: 'Speech recognition was aborted.',
    network: 'Network error occurred. Please check your connection.',
    'service-not-allowed': 'Speech recognition service is not allowed.',
  };

  return errorMessages[error] || `An error occurred: ${error}`;
}
```

### Voice Input Component

```tsx
// components/voice-input.tsx
'use client';

import { forwardRef, useImperativeHandle, useEffect } from 'react';
import { Mic, MicOff, Loader2, X } from 'lucide-react';
import { useSpeechRecognition } from '@/hooks/use-speech-recognition';

interface VoiceInputProps {
  value?: string;
  onChange?: (value: string) => void;
  onFinalResult?: (transcript: string) => void;
  placeholder?: string;
  className?: string;
  continuous?: boolean;
  lang?: string;
  disabled?: boolean;
}

export interface VoiceInputRef {
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
}

export const VoiceInput = forwardRef<VoiceInputRef, VoiceInputProps>(
  function VoiceInput(
    {
      value = '',
      onChange,
      onFinalResult,
      placeholder = 'Speak or type...',
      className = '',
      continuous = false,
      lang = 'en-US',
      disabled = false,
    },
    ref
  ) {
    const {
      isListening,
      isSupported,
      transcript,
      interimTranscript,
      error,
      startListening,
      stopListening,
      resetTranscript,
    } = useSpeechRecognition({
      continuous,
      interimResults: true,
      lang,
      onResult: (result) => {
        if (result.isFinal) {
          onFinalResult?.(result.transcript);
        }
      },
    });

    // Expose methods via ref
    useImperativeHandle(ref, () => ({
      startListening,
      stopListening,
      resetTranscript,
    }));

    // Update value when transcript changes
    useEffect(() => {
      if (transcript) {
        onChange?.(value + transcript);
        resetTranscript();
      }
    }, [transcript]);

    const displayValue = value + interimTranscript;

    return (
      <div className={`relative ${className}`}>
        <div className="relative">
          <textarea
            value={displayValue}
            onChange={(e) => onChange?.(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            className={`
              w-full px-4 py-3 pr-12 border rounded-lg resize-none
              focus:ring-2 focus:ring-blue-500 focus:border-blue-500
              disabled:bg-gray-100 disabled:cursor-not-allowed
              ${error ? 'border-red-300' : 'border-gray-300'}
            `}
            rows={3}
          />

          {/* Interim transcript indicator */}
          {interimTranscript && (
            <div className="absolute bottom-2 left-4 text-sm text-gray-400">
              Listening...
            </div>
          )}

          {/* Voice input button */}
          {isSupported && (
            <button
              type="button"
              onClick={isListening ? stopListening : startListening}
              disabled={disabled}
              className={`
                absolute right-2 top-2 p-2 rounded-full transition-colors
                ${isListening
                  ? 'bg-red-100 text-red-600 hover:bg-red-200'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }
                disabled:opacity-50 disabled:cursor-not-allowed
              `}
              aria-label={isListening ? 'Stop listening' : 'Start voice input'}
            >
              {isListening ? (
                <MicOff className="w-5 h-5" />
              ) : (
                <Mic className="w-5 h-5" />
              )}
            </button>
          )}
        </div>

        {/* Error message */}
        {error && (
          <p className="mt-1 text-sm text-red-600">{error}</p>
        )}

        {/* Listening indicator */}
        {isListening && (
          <div className="flex items-center gap-2 mt-2 text-sm text-blue-600">
            <Loader2 className="w-4 h-4 animate-spin" />
            Listening...
          </div>
        )}
      </div>
    );
  }
);
```

### Voice Search Component

```tsx
// components/voice-search.tsx
'use client';

import { useState, useCallback } from 'react';
import { Search, Mic, MicOff, X, Loader2 } from 'lucide-react';
import { useSpeechRecognition } from '@/hooks/use-speech-recognition';

interface VoiceSearchProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  className?: string;
}

export function VoiceSearch({
  onSearch,
  placeholder = 'Search...',
  className = '',
}: VoiceSearchProps) {
  const [query, setQuery] = useState('');

  const {
    isListening,
    isSupported,
    interimTranscript,
    error,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechRecognition({
    continuous: false,
    interimResults: true,
    onResult: (result) => {
      if (result.isFinal) {
        setQuery(result.transcript);
        onSearch(result.transcript);
      }
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query);
    }
  };

  const handleClear = () => {
    setQuery('');
    resetTranscript();
  };

  const displayValue = query || interimTranscript;

  return (
    <form onSubmit={handleSubmit} className={`relative ${className}`}>
      <div className="relative flex items-center">
        <Search className="absolute left-3 w-5 h-5 text-gray-400" />

        <input
          type="text"
          value={displayValue}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={isListening ? 'Listening...' : placeholder}
          className={`
            w-full pl-10 pr-24 py-3 border rounded-full
            focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            ${isListening ? 'bg-blue-50 border-blue-300' : 'border-gray-300'}
          `}
        />

        <div className="absolute right-2 flex items-center gap-1">
          {displayValue && (
            <button
              type="button"
              onClick={handleClear}
              className="p-2 rounded-full hover:bg-gray-100"
              aria-label="Clear search"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          )}

          {isSupported && (
            <button
              type="button"
              onClick={isListening ? stopListening : startListening}
              className={`
                p-2 rounded-full transition-colors
                ${isListening
                  ? 'bg-red-100 text-red-600'
                  : 'hover:bg-gray-100 text-gray-600'
                }
              `}
              aria-label={isListening ? 'Stop listening' : 'Voice search'}
            >
              {isListening ? (
                <MicOff className="w-5 h-5" />
              ) : (
                <Mic className="w-5 h-5" />
              )}
            </button>
          )}
        </div>
      </div>

      {isListening && (
        <div className="absolute top-full left-0 right-0 mt-2 p-3 bg-white rounded-lg shadow-lg border">
          <div className="flex items-center gap-2 text-sm text-blue-600">
            <div className="flex gap-1">
              <span className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            <span>Listening...</span>
          </div>
          {interimTranscript && (
            <p className="mt-2 text-gray-600 italic">{interimTranscript}</p>
          )}
        </div>
      )}

      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
    </form>
  );
}
```

### Voice Commands Component

```tsx
// components/voice-commands.tsx
'use client';

import { useEffect } from 'react';
import { useSpeechRecognition } from '@/hooks/use-speech-recognition';
import { VoiceCommand } from '@/lib/speech/recognition-types';

interface VoiceCommandsProps {
  commands: VoiceCommand[];
  continuous?: boolean;
  showIndicator?: boolean;
  children?: React.ReactNode;
}

export function VoiceCommands({
  commands,
  continuous = true,
  showIndicator = true,
  children,
}: VoiceCommandsProps) {
  const {
    isListening,
    isSupported,
    startListening,
    stopListening,
  } = useSpeechRecognition({
    commands,
    continuous,
    interimResults: false,
  });

  // Start listening on mount if continuous
  useEffect(() => {
    if (continuous && isSupported) {
      startListening();
    }

    return () => {
      stopListening();
    };
  }, [continuous, isSupported]);

  if (!isSupported) {
    return <>{children}</>;
  }

  return (
    <div className="relative">
      {children}

      {showIndicator && isListening && (
        <div className="fixed bottom-4 right-4 flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-full shadow-lg z-50">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
          <span className="text-sm">Voice commands active</span>
        </div>
      )}
    </div>
  );
}

// Example usage hook
export function useVoiceNavigation() {
  const commands: VoiceCommand[] = [
    {
      command: 'go home',
      callback: () => window.location.href = '/',
      description: 'Navigate to home page',
    },
    {
      command: 'go back',
      callback: () => window.history.back(),
      description: 'Go to previous page',
    },
    {
      command: 'scroll down',
      callback: () => window.scrollBy({ top: 300, behavior: 'smooth' }),
      description: 'Scroll down the page',
    },
    {
      command: 'scroll up',
      callback: () => window.scrollBy({ top: -300, behavior: 'smooth' }),
      description: 'Scroll up the page',
    },
    {
      command: 'scroll to top',
      callback: () => window.scrollTo({ top: 0, behavior: 'smooth' }),
      description: 'Scroll to top of page',
    },
    {
      command: /search for (.+)/i,
      callback: (params) => {
        if (params?.$1) {
          window.location.href = `/search?q=${encodeURIComponent(params.$1)}`;
        }
      },
      description: 'Search for something',
    },
  ];

  return commands;
}
```

## Usage

```tsx
// app/search/page.tsx
'use client';

import { useState } from 'react';
import { VoiceSearch } from '@/components/voice-search';
import { VoiceInput } from '@/components/voice-input';
import { VoiceCommands, useVoiceNavigation } from '@/components/voice-commands';

export default function SearchPage() {
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const [note, setNote] = useState('');
  const navigationCommands = useVoiceNavigation();

  const handleSearch = (query: string) => {
    console.log('Searching for:', query);
    // Perform search
    setSearchResults([
      `Result 1 for "${query}"`,
      `Result 2 for "${query}"`,
      `Result 3 for "${query}"`,
    ]);
  };

  return (
    <VoiceCommands commands={navigationCommands}>
      <div className="max-w-2xl mx-auto p-8 space-y-8">
        <h1 className="text-3xl font-bold">Voice Search Demo</h1>

        {/* Voice Search */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Voice Search</h2>
          <VoiceSearch
            onSearch={handleSearch}
            placeholder="Try saying 'search for restaurants'"
          />
          {searchResults.length > 0 && (
            <ul className="mt-4 space-y-2">
              {searchResults.map((result, i) => (
                <li key={i} className="p-3 bg-gray-50 rounded-lg">
                  {result}
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Voice Note */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Voice Notes</h2>
          <VoiceInput
            value={note}
            onChange={setNote}
            onFinalResult={(text) => console.log('Final:', text)}
            continuous
            placeholder="Click the microphone and start speaking..."
          />
        </section>

        {/* Commands Help */}
        <section className="p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold mb-2">Available Voice Commands:</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            {navigationCommands.map((cmd, i) => (
              <li key={i}>
                <strong>{typeof cmd.command === 'string' ? cmd.command : cmd.command.toString()}</strong>
                {cmd.description && ` - ${cmd.description}`}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </VoiceCommands>
  );
}
```

## Related Skills

- [[speech-synthesis]] - Text-to-speech
- [[accessibility]] - Accessibility patterns
- [[form-validation]] - Form handling
- [[search]] - Search functionality

## Changelog

### 2.0.0 (2025-01-18)
- Standardized to atomic design system v2
- Updated frontmatter schema

### 1.0.0 (2025-01-17)
- Initial implementation
- Real-time transcription
- Voice commands with regex support
- Voice search component
- Voice input component
- Navigation commands helper
