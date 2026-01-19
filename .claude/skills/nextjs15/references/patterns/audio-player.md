---
id: pt-audio-player
name: Audio Player
version: 1.0.0
layer: L5
category: media
description: Audio playback with controls, progress, playlist, and waveform visualization
tags: [audio, media, player, controls, next15]
composes: []
dependencies: []
formula: "AudioPlayer = HTMLAudioElement + Controls + Progress + Playlist + Waveform"
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# Audio Player

## When to Use

- Building podcast players
- Music streaming interfaces
- Audio course platforms
- Voice message playback
- Audio preview components

## Composition Diagram

```
Audio Player Layout
===================

+------------------------------------------+
|  [Album Art]  Track Title                |
|              Artist Name                 |
+------------------------------------------+
|  0:45 ====|=========== 3:24              |
|           Progress Bar                   |
+------------------------------------------+
|  [Prev] [Play/Pause] [Next]              |
|  [Shuffle] [Repeat] [Volume]             |
+------------------------------------------+
```

## Audio Player Hook

```typescript
// hooks/use-audio-player.ts
'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

interface Track {
  id: string;
  title: string;
  artist: string;
  src: string;
  duration?: number;
  coverUrl?: string;
}

interface AudioPlayerState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isLoading: boolean;
  currentTrack: Track | null;
  playlist: Track[];
  currentIndex: number;
  isShuffled: boolean;
  repeatMode: 'none' | 'one' | 'all';
}

export function useAudioPlayer(initialPlaylist: Track[] = []) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [state, setState] = useState<AudioPlayerState>({
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 1,
    isMuted: false,
    isLoading: false,
    currentTrack: initialPlaylist[0] || null,
    playlist: initialPlaylist,
    currentIndex: 0,
    isShuffled: false,
    repeatMode: 'none',
  });

  useEffect(() => {
    audioRef.current = new Audio();
    const audio = audioRef.current;

    audio.addEventListener('timeupdate', () => {
      setState((s) => ({ ...s, currentTime: audio.currentTime }));
    });

    audio.addEventListener('loadedmetadata', () => {
      setState((s) => ({ ...s, duration: audio.duration, isLoading: false }));
    });

    audio.addEventListener('ended', handleTrackEnd);
    audio.addEventListener('waiting', () => setState((s) => ({ ...s, isLoading: true })));
    audio.addEventListener('canplay', () => setState((s) => ({ ...s, isLoading: false })));

    return () => {
      audio.pause();
      audio.src = '';
    };
  }, []);

  const handleTrackEnd = useCallback(() => {
    if (state.repeatMode === 'one') {
      audioRef.current!.currentTime = 0;
      audioRef.current!.play();
    } else if (state.currentIndex < state.playlist.length - 1) {
      playTrack(state.currentIndex + 1);
    } else if (state.repeatMode === 'all') {
      playTrack(0);
    } else {
      setState((s) => ({ ...s, isPlaying: false }));
    }
  }, [state.repeatMode, state.currentIndex, state.playlist.length]);

  const play = useCallback(() => {
    audioRef.current?.play();
    setState((s) => ({ ...s, isPlaying: true }));
  }, []);

  const pause = useCallback(() => {
    audioRef.current?.pause();
    setState((s) => ({ ...s, isPlaying: false }));
  }, []);

  const toggle = useCallback(() => {
    state.isPlaying ? pause() : play();
  }, [state.isPlaying, play, pause]);

  const seek = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setState((s) => ({ ...s, currentTime: time }));
    }
  }, []);

  const setVolume = useCallback((volume: number) => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
      setState((s) => ({ ...s, volume, isMuted: volume === 0 }));
    }
  }, []);

  const toggleMute = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.muted = !audioRef.current.muted;
      setState((s) => ({ ...s, isMuted: !s.isMuted }));
    }
  }, []);

  const playTrack = useCallback((index: number) => {
    const track = state.playlist[index];
    if (track && audioRef.current) {
      audioRef.current.src = track.src;
      audioRef.current.play();
      setState((s) => ({
        ...s,
        currentTrack: track,
        currentIndex: index,
        isPlaying: true,
        isLoading: true,
      }));
    }
  }, [state.playlist]);

  const next = useCallback(() => {
    const nextIndex = state.isShuffled
      ? Math.floor(Math.random() * state.playlist.length)
      : (state.currentIndex + 1) % state.playlist.length;
    playTrack(nextIndex);
  }, [state.isShuffled, state.currentIndex, state.playlist.length, playTrack]);

  const previous = useCallback(() => {
    if (state.currentTime > 3) {
      seek(0);
    } else {
      const prevIndex = state.currentIndex === 0
        ? state.playlist.length - 1
        : state.currentIndex - 1;
      playTrack(prevIndex);
    }
  }, [state.currentTime, state.currentIndex, state.playlist.length, seek, playTrack]);

  return {
    ...state,
    play,
    pause,
    toggle,
    seek,
    setVolume,
    toggleMute,
    playTrack,
    next,
    previous,
    setRepeatMode: (mode: 'none' | 'one' | 'all') =>
      setState((s) => ({ ...s, repeatMode: mode })),
    toggleShuffle: () => setState((s) => ({ ...s, isShuffled: !s.isShuffled })),
  };
}
```

## Audio Player Component

```typescript
// components/audio/audio-player.tsx
'use client';

import { useAudioPlayer } from '@/hooks/use-audio-player';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Repeat,
  Repeat1,
  Shuffle,
  Loader2,
} from 'lucide-react';
import { formatTime } from '@/lib/utils';

interface AudioPlayerProps {
  playlist: Track[];
}

export function AudioPlayer({ playlist }: AudioPlayerProps) {
  const player = useAudioPlayer(playlist);

  return (
    <div className="w-full max-w-md p-4 bg-card rounded-lg shadow-lg">
      {/* Track Info */}
      <div className="flex items-center gap-4 mb-4">
        {player.currentTrack?.coverUrl && (
          <img
            src={player.currentTrack.coverUrl}
            alt={player.currentTrack.title}
            className="w-16 h-16 rounded-md object-cover"
          />
        )}
        <div className="flex-1 min-w-0">
          <h3 className="font-medium truncate">{player.currentTrack?.title}</h3>
          <p className="text-sm text-muted-foreground truncate">
            {player.currentTrack?.artist}
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <Slider
          value={[player.currentTime]}
          max={player.duration || 100}
          step={1}
          onValueChange={([value]) => player.seek(value)}
          className="mb-2"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{formatTime(player.currentTime)}</span>
          <span>{formatTime(player.duration)}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={player.toggleShuffle}
          className={player.isShuffled ? 'text-primary' : ''}
        >
          <Shuffle className="h-4 w-4" />
        </Button>

        <Button variant="ghost" size="icon" onClick={player.previous}>
          <SkipBack className="h-5 w-5" />
        </Button>

        <Button
          size="icon"
          className="h-12 w-12 rounded-full"
          onClick={player.toggle}
          disabled={player.isLoading}
        >
          {player.isLoading ? (
            <Loader2 className="h-6 w-6 animate-spin" />
          ) : player.isPlaying ? (
            <Pause className="h-6 w-6" />
          ) : (
            <Play className="h-6 w-6" />
          )}
        </Button>

        <Button variant="ghost" size="icon" onClick={player.next}>
          <SkipForward className="h-5 w-5" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            const modes: ('none' | 'one' | 'all')[] = ['none', 'one', 'all'];
            const currentIdx = modes.indexOf(player.repeatMode);
            player.setRepeatMode(modes[(currentIdx + 1) % 3]);
          }}
          className={player.repeatMode !== 'none' ? 'text-primary' : ''}
        >
          {player.repeatMode === 'one' ? (
            <Repeat1 className="h-4 w-4" />
          ) : (
            <Repeat className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Volume */}
      <div className="flex items-center gap-2 mt-4">
        <Button variant="ghost" size="icon" onClick={player.toggleMute}>
          {player.isMuted ? (
            <VolumeX className="h-4 w-4" />
          ) : (
            <Volume2 className="h-4 w-4" />
          )}
        </Button>
        <Slider
          value={[player.isMuted ? 0 : player.volume]}
          max={1}
          step={0.01}
          onValueChange={([value]) => player.setVolume(value)}
          className="w-24"
        />
      </div>
    </div>
  );
}
```

## Utility Functions

```typescript
// lib/utils/audio.ts
export function formatTime(seconds: number): string {
  if (!seconds || !isFinite(seconds)) return '0:00';

  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function formatDuration(seconds: number): string {
  if (!seconds) return '0:00';

  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
```

## Playlist Component

```typescript
// components/audio/playlist.tsx
'use client';

import { cn } from '@/lib/utils';
import { Play, Pause } from 'lucide-react';

interface PlaylistProps {
  tracks: Track[];
  currentIndex: number;
  isPlaying: boolean;
  onTrackSelect: (index: number) => void;
}

export function Playlist({ tracks, currentIndex, isPlaying, onTrackSelect }: PlaylistProps) {
  return (
    <div className="space-y-1">
      {tracks.map((track, index) => (
        <button
          key={track.id}
          onClick={() => onTrackSelect(index)}
          className={cn(
            'w-full flex items-center gap-3 p-3 rounded-md hover:bg-muted transition-colors',
            index === currentIndex && 'bg-muted'
          )}
        >
          <div className="w-8 h-8 flex items-center justify-center">
            {index === currentIndex && isPlaying ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4" />
            )}
          </div>
          <div className="flex-1 text-left">
            <p className="font-medium truncate">{track.title}</p>
            <p className="text-sm text-muted-foreground truncate">{track.artist}</p>
          </div>
          <span className="text-sm text-muted-foreground">
            {formatTime(track.duration || 0)}
          </span>
        </button>
      ))}
    </div>
  );
}
```

## Anti-patterns

### Don't Block Main Thread

```typescript
// BAD - Loading audio in render
function Player() {
  const audio = new Audio(src); // Creates new audio each render!
  return <button onClick={() => audio.play()}>Play</button>;
}

// GOOD - Use ref
function Player() {
  const audioRef = useRef<HTMLAudioElement>(null);
  return <audio ref={audioRef} src={src} />;
}
```

## Related Skills

- [background-audio](./background-audio.md)
- [media-session](./media-session.md)

---

## Changelog

### 1.0.0 (2025-01-18)
- Initial implementation
- Playback controls
- Playlist management
- Volume and seek
