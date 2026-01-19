---
id: pt-background-audio
name: Background Audio
version: 1.0.0
layer: L5
category: media
description: Background audio continuation across page navigations with Media Session API
tags: [audio, media, background, media-session, next15]
composes: []
dependencies: []
formula: "BackgroundAudio = PersistentAudioContext + MediaSessionAPI + MiniPlayer + GlobalState"
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# Background Audio

## When to Use

- Music streaming apps with navigation
- Podcast players that persist across pages
- Audio courses with continuous playback
- Any app needing audio during navigation
- Media apps with lock screen controls

## Composition Diagram

```
Background Audio Architecture
=============================

+------------------------------------------+
|  Audio Context Provider (layout.tsx)     |
|  - Persistent audio element              |
|  - Global playback state                 |
+------------------------------------------+
              |
              v
+------------------------------------------+
|  Media Session API Integration           |
|  - Lock screen controls                  |
|  - Notification media controls           |
|  - Hardware media keys                   |
+------------------------------------------+
              |
              v
+------------------------------------------+
|  Mini Player (fixed position)            |
|  - Appears during navigation             |
|  - Quick controls                        |
+------------------------------------------+
```

## Audio Context Provider

```typescript
// providers/audio-provider.tsx
'use client';

import { createContext, useContext, useRef, useState, useCallback, useEffect } from 'react';

interface Track {
  id: string;
  title: string;
  artist: string;
  src: string;
  artwork?: string;
}

interface AudioContextType {
  currentTrack: Track | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  play: (track: Track) => void;
  pause: () => void;
  resume: () => void;
  seek: (time: number) => void;
  setVolume: (volume: number) => void;
}

const AudioContext = createContext<AudioContextType | null>(null);

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    // Create audio element only once
    audioRef.current = new Audio();
    const audio = audioRef.current;

    audio.addEventListener('timeupdate', () => setCurrentTime(audio.currentTime));
    audio.addEventListener('loadedmetadata', () => setDuration(audio.duration));
    audio.addEventListener('ended', () => setIsPlaying(false));
    audio.addEventListener('play', () => setIsPlaying(true));
    audio.addEventListener('pause', () => setIsPlaying(false));

    return () => {
      audio.pause();
      audio.src = '';
    };
  }, []);

  // Setup Media Session API
  useEffect(() => {
    if (!currentTrack || !('mediaSession' in navigator)) return;

    navigator.mediaSession.metadata = new MediaMetadata({
      title: currentTrack.title,
      artist: currentTrack.artist,
      artwork: currentTrack.artwork
        ? [{ src: currentTrack.artwork, sizes: '512x512', type: 'image/png' }]
        : undefined,
    });

    navigator.mediaSession.setActionHandler('play', () => resume());
    navigator.mediaSession.setActionHandler('pause', () => pause());
    navigator.mediaSession.setActionHandler('seekto', (details) => {
      if (details.seekTime !== undefined) seek(details.seekTime);
    });

    return () => {
      navigator.mediaSession.setActionHandler('play', null);
      navigator.mediaSession.setActionHandler('pause', null);
      navigator.mediaSession.setActionHandler('seekto', null);
    };
  }, [currentTrack]);

  // Update playback state for Media Session
  useEffect(() => {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';
    }
  }, [isPlaying]);

  const play = useCallback((track: Track) => {
    if (audioRef.current) {
      audioRef.current.src = track.src;
      audioRef.current.play();
      setCurrentTrack(track);
    }
  }, []);

  const pause = useCallback(() => {
    audioRef.current?.pause();
  }, []);

  const resume = useCallback(() => {
    audioRef.current?.play();
  }, []);

  const seek = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  }, []);

  const setVolume = useCallback((volume: number) => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, []);

  return (
    <AudioContext.Provider
      value={{
        currentTrack,
        isPlaying,
        currentTime,
        duration,
        play,
        pause,
        resume,
        seek,
        setVolume,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
}

export function useAudio() {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudio must be used within AudioProvider');
  }
  return context;
}
```

## Layout Integration

```typescript
// app/layout.tsx
import { AudioProvider } from '@/providers/audio-provider';
import { MiniPlayer } from '@/components/audio/mini-player';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AudioProvider>
          {children}
          <MiniPlayer />
        </AudioProvider>
      </body>
    </html>
  );
}
```

## Mini Player Component

```typescript
// components/audio/mini-player.tsx
'use client';

import { useAudio } from '@/providers/audio-provider';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Play, Pause, X } from 'lucide-react';
import { formatTime } from '@/lib/utils';

export function MiniPlayer() {
  const { currentTrack, isPlaying, currentTime, duration, pause, resume } = useAudio();

  if (!currentTrack) return null;

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card border-t p-3 z-50">
      <Progress value={progress} className="absolute top-0 left-0 right-0 h-1" />

      <div className="flex items-center gap-4 max-w-screen-xl mx-auto">
        {currentTrack.artwork && (
          <img
            src={currentTrack.artwork}
            alt={currentTrack.title}
            className="w-12 h-12 rounded object-cover"
          />
        )}

        <div className="flex-1 min-w-0">
          <p className="font-medium truncate">{currentTrack.title}</p>
          <p className="text-sm text-muted-foreground truncate">{currentTrack.artist}</p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground hidden sm:block">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>

          <Button
            size="icon"
            variant="ghost"
            onClick={() => (isPlaying ? pause() : resume())}
          >
            {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
          </Button>
        </div>
      </div>
    </div>
  );
}
```

## Track Play Button

```typescript
// components/audio/play-button.tsx
'use client';

import { useAudio } from '@/providers/audio-provider';
import { Button } from '@/components/ui/button';
import { Play, Pause } from 'lucide-react';

interface PlayButtonProps {
  track: Track;
  size?: 'sm' | 'md' | 'lg';
}

export function PlayButton({ track, size = 'md' }: PlayButtonProps) {
  const { currentTrack, isPlaying, play, pause, resume } = useAudio();

  const isCurrentTrack = currentTrack?.id === track.id;
  const isTrackPlaying = isCurrentTrack && isPlaying;

  const handleClick = () => {
    if (isCurrentTrack) {
      isPlaying ? pause() : resume();
    } else {
      play(track);
    }
  };

  const iconSize = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  }[size];

  return (
    <Button
      size="icon"
      variant={isTrackPlaying ? 'default' : 'secondary'}
      onClick={handleClick}
    >
      {isTrackPlaying ? (
        <Pause className={iconSize} />
      ) : (
        <Play className={iconSize} />
      )}
    </Button>
  );
}
```

## Persistent State with Storage

```typescript
// hooks/use-persisted-audio.ts
'use client';

import { useEffect } from 'react';
import { useAudio } from '@/providers/audio-provider';

const STORAGE_KEY = 'audio-player-state';

interface PersistedState {
  trackId: string;
  currentTime: number;
  volume: number;
}

export function usePersistedAudio() {
  const { currentTrack, currentTime, setVolume, seek } = useAudio();

  // Restore state on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const state: PersistedState = JSON.parse(saved);
        setVolume(state.volume);
        // Track restoration handled by parent
      } catch (e) {
        console.error('Failed to restore audio state');
      }
    }
  }, []);

  // Save state periodically
  useEffect(() => {
    if (!currentTrack) return;

    const interval = setInterval(() => {
      const state: PersistedState = {
        trackId: currentTrack.id,
        currentTime,
        volume: 1, // Get from context
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }, 5000);

    return () => clearInterval(interval);
  }, [currentTrack, currentTime]);
}
```

## Keyboard Shortcuts

```typescript
// hooks/use-audio-shortcuts.ts
'use client';

import { useEffect } from 'react';
import { useAudio } from '@/providers/audio-provider';

export function useAudioShortcuts() {
  const { isPlaying, pause, resume, seek, currentTime } = useAudio();

  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      // Ignore if typing in input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.key) {
        case ' ':
          e.preventDefault();
          isPlaying ? pause() : resume();
          break;
        case 'ArrowLeft':
          seek(Math.max(0, currentTime - 10));
          break;
        case 'ArrowRight':
          seek(currentTime + 10);
          break;
      }
    };

    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, [isPlaying, pause, resume, seek, currentTime]);
}
```

## Anti-patterns

### Don't Create New Audio on Navigation

```typescript
// BAD - Audio resets on navigation
export default function Page() {
  const audioRef = useRef(new Audio()); // New audio each page
  return <Player audio={audioRef} />;
}

// GOOD - Audio persists in context
export default function Page() {
  const audio = useAudio(); // Shared context
  return <Player audio={audio} />;
}
```

## Related Skills

- [audio-player](./audio-player.md)
- [zustand](./zustand.md)

---

## Changelog

### 1.0.0 (2025-01-18)
- Initial implementation
- Persistent audio context
- Media Session API integration
- Mini player component
