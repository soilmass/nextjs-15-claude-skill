---
id: pt-video-player
name: Video Playback Component
version: 1.0.0
layer: L5
category: media
description: Video playback component with custom controls for Next.js applications
tags: [video, player, media, streaming, next15, react19]
composes:
  - ../atoms/input-button.md
  - ../molecules/card.md
dependencies:
  video.js: "^8.18.0"
formula: Video Element + Custom Controls + Keyboard Shortcuts = Rich Video Player
performance:
  impact: high
  lcp: high
  cls: medium
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# Video Playback Component

## When to Use

- **Video content**: Playing hosted or streaming videos
- **Custom controls**: Branded player with specific UI requirements
- **Educational content**: Courses with progress tracking
- **Media galleries**: Video collections with thumbnails

**Avoid when**: YouTube/Vimeo embeds suffice, or using native browser controls.

## Composition Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ Video Player Architecture                                    │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ VideoPlayer                                           │  │
│  │  ├─ Video Element: HTML5 video with HLS support      │  │
│  │  ├─ Controls: Play, seek, volume, fullscreen         │  │
│  │  └─ Progress: Watch progress tracking                │  │
│  └───────────────────────────────────────────────────────┘  │
│         │                    │                    │         │
│         ▼                    ▼                    ▼         │
│  ┌────────────┐     ┌──────────────┐     ┌─────────────┐   │
│  │ Playback   │     │ Seek Bar     │     │ Quality     │   │
│  │ Controls   │     │ Progress     │     │ Selector    │   │
│  └────────────┘     └──────────────┘     └─────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Video Player Component

```typescript
// components/video/video-player.tsx
'use client';

import {
  useRef,
  useState,
  useEffect,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Settings,
  SkipBack,
  SkipForward,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export interface VideoPlayerRef {
  play: () => void;
  pause: () => void;
  seek: (time: number) => void;
  getCurrentTime: () => number;
  getDuration: () => number;
}

interface VideoPlayerProps {
  src: string;
  poster?: string;
  title?: string;
  autoPlay?: boolean;
  onProgress?: (progress: number) => void;
  onEnded?: () => void;
  onTimeUpdate?: (currentTime: number, duration: number) => void;
  qualities?: { label: string; src: string }[];
  startTime?: number;
}

export const VideoPlayer = forwardRef<VideoPlayerRef, VideoPlayerProps>(
  (
    {
      src,
      poster,
      title,
      autoPlay = false,
      onProgress,
      onEnded,
      onTimeUpdate,
      qualities,
      startTime = 0,
    },
    ref
  ) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showControls, setShowControls] = useState(true);
    const [currentQuality, setCurrentQuality] = useState(src);
    const hideControlsTimeout = useRef<NodeJS.Timeout>();

    useImperativeHandle(ref, () => ({
      play: () => videoRef.current?.play(),
      pause: () => videoRef.current?.pause(),
      seek: (time) => {
        if (videoRef.current) videoRef.current.currentTime = time;
      },
      getCurrentTime: () => videoRef.current?.currentTime || 0,
      getDuration: () => videoRef.current?.duration || 0,
    }));

    useEffect(() => {
      if (videoRef.current && startTime > 0) {
        videoRef.current.currentTime = startTime;
      }
    }, [startTime]);

    const handleTimeUpdate = useCallback(() => {
      if (!videoRef.current) return;
      const current = videoRef.current.currentTime;
      const total = videoRef.current.duration;

      setCurrentTime(current);
      setDuration(total);

      const progress = (current / total) * 100;
      onProgress?.(progress);
      onTimeUpdate?.(current, total);
    }, [onProgress, onTimeUpdate]);

    const togglePlay = useCallback(() => {
      if (!videoRef.current) return;
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }, [isPlaying]);

    const handleSeek = useCallback((value: number[]) => {
      if (!videoRef.current) return;
      const time = (value[0] / 100) * duration;
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }, [duration]);

    const handleVolumeChange = useCallback((value: number[]) => {
      if (!videoRef.current) return;
      const vol = value[0] / 100;
      videoRef.current.volume = vol;
      setVolume(vol);
      setIsMuted(vol === 0);
    }, []);

    const toggleMute = useCallback(() => {
      if (!videoRef.current) return;
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }, [isMuted]);

    const toggleFullscreen = useCallback(async () => {
      if (!containerRef.current) return;

      if (!isFullscreen) {
        await containerRef.current.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
      setIsFullscreen(!isFullscreen);
    }, [isFullscreen]);

    const skip = useCallback((seconds: number) => {
      if (!videoRef.current) return;
      videoRef.current.currentTime += seconds;
    }, []);

    const handleKeyDown = useCallback(
      (e: KeyboardEvent) => {
        switch (e.key) {
          case ' ':
          case 'k':
            e.preventDefault();
            togglePlay();
            break;
          case 'ArrowLeft':
            e.preventDefault();
            skip(-10);
            break;
          case 'ArrowRight':
            e.preventDefault();
            skip(10);
            break;
          case 'm':
            e.preventDefault();
            toggleMute();
            break;
          case 'f':
            e.preventDefault();
            toggleFullscreen();
            break;
        }
      },
      [togglePlay, skip, toggleMute, toggleFullscreen]
    );

    useEffect(() => {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    const formatTime = (time: number): string => {
      const minutes = Math.floor(time / 60);
      const seconds = Math.floor(time % 60);
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    const handleMouseMove = () => {
      setShowControls(true);
      clearTimeout(hideControlsTimeout.current);
      hideControlsTimeout.current = setTimeout(() => {
        if (isPlaying) setShowControls(false);
      }, 3000);
    };

    const changeQuality = (newSrc: string) => {
      if (!videoRef.current) return;
      const currentTime = videoRef.current.currentTime;
      setCurrentQuality(newSrc);
      videoRef.current.src = newSrc;
      videoRef.current.currentTime = currentTime;
      if (isPlaying) videoRef.current.play();
    };

    return (
      <div
        ref={containerRef}
        className="relative bg-black rounded-lg overflow-hidden group"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => isPlaying && setShowControls(false)}
      >
        <video
          ref={videoRef}
          src={currentQuality}
          poster={poster}
          autoPlay={autoPlay}
          className="w-full aspect-video"
          onTimeUpdate={handleTimeUpdate}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={onEnded}
          onLoadedMetadata={() => setDuration(videoRef.current?.duration || 0)}
          onClick={togglePlay}
        />

        {/* Controls overlay */}
        <div
          className={`absolute inset-0 bg-gradient-to-t from-black/60 to-transparent transition-opacity ${
            showControls ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {/* Center play button */}
          <button
            className="absolute inset-0 flex items-center justify-center"
            onClick={togglePlay}
          >
            {!isPlaying && (
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <Play className="h-8 w-8 text-white" />
              </div>
            )}
          </button>

          {/* Title */}
          {title && (
            <div className="absolute top-4 left-4">
              <h3 className="text-white font-medium">{title}</h3>
            </div>
          )}

          {/* Bottom controls */}
          <div className="absolute bottom-0 left-0 right-0 p-4 space-y-2">
            {/* Progress bar */}
            <Slider
              value={[(currentTime / duration) * 100 || 0]}
              onValueChange={handleSeek}
              max={100}
              step={0.1}
              className="cursor-pointer"
            />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={togglePlay}>
                  {isPlaying ? (
                    <Pause className="h-5 w-5 text-white" />
                  ) : (
                    <Play className="h-5 w-5 text-white" />
                  )}
                </Button>

                <Button variant="ghost" size="icon" onClick={() => skip(-10)}>
                  <SkipBack className="h-5 w-5 text-white" />
                </Button>

                <Button variant="ghost" size="icon" onClick={() => skip(10)}>
                  <SkipForward className="h-5 w-5 text-white" />
                </Button>

                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" onClick={toggleMute}>
                    {isMuted ? (
                      <VolumeX className="h-5 w-5 text-white" />
                    ) : (
                      <Volume2 className="h-5 w-5 text-white" />
                    )}
                  </Button>
                  <Slider
                    value={[isMuted ? 0 : volume * 100]}
                    onValueChange={handleVolumeChange}
                    max={100}
                    className="w-20"
                  />
                </div>

                <span className="text-white text-sm">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {qualities && qualities.length > 1 && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <Settings className="h-5 w-5 text-white" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      {qualities.map((q) => (
                        <DropdownMenuItem
                          key={q.src}
                          onClick={() => changeQuality(q.src)}
                        >
                          {q.label}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}

                <Button variant="ghost" size="icon" onClick={toggleFullscreen}>
                  {isFullscreen ? (
                    <Minimize className="h-5 w-5 text-white" />
                  ) : (
                    <Maximize className="h-5 w-5 text-white" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

VideoPlayer.displayName = 'VideoPlayer';
```

## Video Progress Tracking

```typescript
// hooks/use-video-progress.ts
import { useEffect, useCallback } from 'react';
import { debounce } from 'lodash';

interface UseVideoProgressOptions {
  videoId: string;
  onProgressSaved?: () => void;
}

export function useVideoProgress({ videoId, onProgressSaved }: UseVideoProgressOptions) {
  const saveProgress = useCallback(
    debounce(async (currentTime: number, duration: number) => {
      const progress = (currentTime / duration) * 100;

      await fetch('/api/videos/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoId,
          currentTime,
          progress,
          completed: progress >= 95,
        }),
      });

      onProgressSaved?.();
    }, 5000),
    [videoId, onProgressSaved]
  );

  return { saveProgress };
}
```

## Related Patterns

- [video-thumbnails](./video-thumbnails.md)
- [video-upload](./video-upload.md)
- [lazy-loading](./lazy-loading.md)

---

## Changelog

### 1.0.0 (2025-01-18)
- Initial implementation
- Custom controls
- Keyboard shortcuts
- Quality selection
- Progress tracking
