---
id: pt-hls-streaming
name: HLS Video Streaming
version: 1.0.0
layer: L5
category: media
description: Implement HLS video streaming for adaptive bitrate playback
tags: [hls, video, streaming, adaptive-bitrate, media, next15, react19]
composes: []
dependencies: []
formula: "HLSStreaming = VideoTranscoding + ManifestGeneration + AdaptivePlayer + CDN"
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# HLS Video Streaming

## When to Use

- When building video platforms or streaming services
- For adaptive bitrate video delivery
- When implementing video on demand (VOD)
- For live streaming applications
- When video needs to work across devices

## Overview

This pattern implements HLS (HTTP Live Streaming) video delivery with adaptive bitrate streaming. It covers video transcoding, manifest generation, and a React player component.

## Video Processing with FFmpeg

```typescript
// lib/video/transcoding.ts
import { spawn } from "child_process";
import path from "path";
import fs from "fs/promises";

interface TranscodeOptions {
  inputPath: string;
  outputDir: string;
  qualities: VideoQuality[];
}

interface VideoQuality {
  name: string;
  width: number;
  height: number;
  bitrate: string;
  audioBitrate: string;
}

const DEFAULT_QUALITIES: VideoQuality[] = [
  { name: "1080p", width: 1920, height: 1080, bitrate: "5000k", audioBitrate: "192k" },
  { name: "720p", width: 1280, height: 720, bitrate: "2500k", audioBitrate: "128k" },
  { name: "480p", width: 854, height: 480, bitrate: "1000k", audioBitrate: "96k" },
  { name: "360p", width: 640, height: 360, bitrate: "600k", audioBitrate: "64k" },
];

export async function transcodeToHLS(options: TranscodeOptions): Promise<string> {
  const { inputPath, outputDir, qualities = DEFAULT_QUALITIES } = options;

  await fs.mkdir(outputDir, { recursive: true });

  // Generate each quality variant
  for (const quality of qualities) {
    await transcodeVariant(inputPath, outputDir, quality);
  }

  // Generate master playlist
  const masterPlaylist = generateMasterPlaylist(qualities);
  const masterPath = path.join(outputDir, "master.m3u8");
  await fs.writeFile(masterPath, masterPlaylist);

  return masterPath;
}

async function transcodeVariant(
  inputPath: string,
  outputDir: string,
  quality: VideoQuality
): Promise<void> {
  const outputPath = path.join(outputDir, quality.name);
  await fs.mkdir(outputPath, { recursive: true });

  const args = [
    "-i", inputPath,
    "-vf", `scale=${quality.width}:${quality.height}`,
    "-c:v", "libx264",
    "-b:v", quality.bitrate,
    "-c:a", "aac",
    "-b:a", quality.audioBitrate,
    "-hls_time", "10",
    "-hls_list_size", "0",
    "-hls_segment_filename", path.join(outputPath, "segment_%03d.ts"),
    "-f", "hls",
    path.join(outputPath, "playlist.m3u8"),
  ];

  return new Promise((resolve, reject) => {
    const ffmpeg = spawn("ffmpeg", args);

    ffmpeg.stderr.on("data", (data) => {
      console.log(`FFmpeg: ${data}`);
    });

    ffmpeg.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`FFmpeg exited with code ${code}`));
    });
  });
}

function generateMasterPlaylist(qualities: VideoQuality[]): string {
  let playlist = "#EXTM3U\n#EXT-X-VERSION:3\n\n";

  for (const quality of qualities) {
    const bandwidth = parseInt(quality.bitrate) * 1000;
    playlist += `#EXT-X-STREAM-INF:BANDWIDTH=${bandwidth},RESOLUTION=${quality.width}x${quality.height}\n`;
    playlist += `${quality.name}/playlist.m3u8\n\n`;
  }

  return playlist;
}
```

## Video Upload and Processing API

```typescript
// app/api/videos/upload/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { transcodeToHLS } from "@/lib/video/transcoding";
import { uploadToStorage } from "@/lib/storage";
import path from "path";
import os from "os";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("video") as File;
  const title = formData.get("title") as string;

  if (!file) {
    return NextResponse.json({ error: "No video file" }, { status: 400 });
  }

  // Create video record
  const video = await prisma.video.create({
    data: {
      title,
      userId: session.user.id,
      status: "processing",
    },
  });

  // Process in background
  processVideo(video.id, file).catch((error) => {
    console.error("Video processing failed:", error);
    prisma.video.update({
      where: { id: video.id },
      data: { status: "failed" },
    });
  });

  return NextResponse.json({ videoId: video.id, status: "processing" });
}

async function processVideo(videoId: string, file: File) {
  const tempDir = path.join(os.tmpdir(), `video-${videoId}`);
  const inputPath = path.join(tempDir, file.name);
  const outputDir = path.join(tempDir, "hls");

  // Save uploaded file
  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.mkdir(tempDir, { recursive: true });
  await fs.writeFile(inputPath, buffer);

  // Transcode to HLS
  await transcodeToHLS({ inputPath, outputDir });

  // Upload HLS files to storage
  const hlsUrl = await uploadHLSToStorage(outputDir, videoId);

  // Generate thumbnail
  const thumbnailUrl = await generateThumbnail(inputPath, videoId);

  // Update video record
  await prisma.video.update({
    where: { id: videoId },
    data: {
      status: "ready",
      hlsUrl,
      thumbnailUrl,
    },
  });

  // Cleanup temp files
  await fs.rm(tempDir, { recursive: true });
}
```

## HLS Player Component

```typescript
// components/video/hls-player.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import { Play, Pause, Volume2, VolumeX, Maximize, Settings } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

interface HLSPlayerProps {
  src: string;
  poster?: string;
  autoPlay?: boolean;
  className?: string;
}

export function HLSPlayer({
  src,
  poster,
  autoPlay = false,
  className,
}: HLSPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);

  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [qualities, setQualities] = useState<{ index: number; label: string }[]>([]);
  const [currentQuality, setCurrentQuality] = useState(-1);
  const [showControls, setShowControls] = useState(true);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
      });

      hls.loadSource(src);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        const levels = hls.levels.map((level, index) => ({
          index,
          label: `${level.height}p`,
        }));
        setQualities([{ index: -1, label: "Auto" }, ...levels]);

        if (autoPlay) video.play();
      });

      hls.on(Hls.Events.LEVEL_SWITCHED, (_, data) => {
        setCurrentQuality(data.level);
      });

      hlsRef.current = hls;

      return () => {
        hls.destroy();
      };
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      // Native HLS support (Safari)
      video.src = src;
      if (autoPlay) video.play();
    }
  }, [src, autoPlay]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      if (video.buffered.length > 0) {
        setBuffered(video.buffered.end(video.buffered.length - 1));
      }
    };

    const handleDurationChange = () => setDuration(video.duration);
    const handlePlay = () => setPlaying(true);
    const handlePause = () => setPlaying(false);

    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("durationchange", handleDurationChange);
    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);

    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("durationchange", handleDurationChange);
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
    };
  }, []);

  const togglePlay = () => {
    if (videoRef.current) {
      playing ? videoRef.current.pause() : videoRef.current.play();
    }
  };

  const handleSeek = (value: number[]) => {
    if (videoRef.current) {
      videoRef.current.currentTime = value[0];
    }
  };

  const handleVolumeChange = (value: number[]) => {
    if (videoRef.current) {
      videoRef.current.volume = value[0];
      setVolume(value[0]);
      setMuted(value[0] === 0);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !muted;
      setMuted(!muted);
    }
  };

  const setQuality = (index: number) => {
    if (hlsRef.current) {
      hlsRef.current.currentLevel = index;
      setCurrentQuality(index);
    }
  };

  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        videoRef.current.requestFullscreen();
      }
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div
      className={cn("relative group bg-black", className)}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      <video
        ref={videoRef}
        poster={poster}
        className="w-full h-full"
        onClick={togglePlay}
      />

      {/* Controls overlay */}
      <div
        className={cn(
          "absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent transition-opacity",
          showControls ? "opacity-100" : "opacity-0"
        )}
      >
        {/* Progress bar */}
        <div className="relative h-1 bg-white/30 rounded mb-4 cursor-pointer">
          <div
            className="absolute h-full bg-white/50 rounded"
            style={{ width: `${(buffered / duration) * 100}%` }}
          />
          <Slider
            value={[currentTime]}
            max={duration}
            step={0.1}
            onValueChange={handleSeek}
            className="absolute inset-0"
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={togglePlay} className="text-white">
              {playing ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
            </button>

            <div className="flex items-center gap-2">
              <button onClick={toggleMute} className="text-white">
                {muted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
              </button>
              <Slider
                value={[muted ? 0 : volume]}
                max={1}
                step={0.1}
                onValueChange={handleVolumeChange}
                className="w-24"
              />
            </div>

            <span className="text-white text-sm">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* Quality selector */}
            <select
              value={currentQuality}
              onChange={(e) => setQuality(parseInt(e.target.value))}
              className="bg-transparent text-white text-sm border-none"
            >
              {qualities.map((q) => (
                <option key={q.index} value={q.index} className="bg-black">
                  {q.label}
                </option>
              ))}
            </select>

            <button onClick={toggleFullscreen} className="text-white">
              <Maximize className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
```

## Video API Route

```typescript
// app/api/videos/[id]/stream/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSignedUrl } from "@/lib/storage";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const video = await prisma.video.findUnique({
    where: { id },
    select: { hlsUrl: true, status: true },
  });

  if (!video || video.status !== "ready") {
    return NextResponse.json({ error: "Video not found" }, { status: 404 });
  }

  // Return signed URL for the HLS manifest
  const signedUrl = await getSignedUrl(video.hlsUrl, 3600);

  return NextResponse.json({ url: signedUrl });
}
```

## Anti-patterns

### Don't Serve Video Directly from App Server

```typescript
// BAD - Serving video from Next.js
app.get("/video/:id", (req, res) => {
  res.sendFile(videoPath);
});

// GOOD - Use CDN with signed URLs
const cdnUrl = await getSignedUrl(video.hlsUrl, 3600);
return NextResponse.json({ url: cdnUrl });
```

## Related Patterns

- [file-preview](./file-preview.md)
- [streaming](./streaming.md)
- [lazy-loading](./lazy-loading.md)

---

## Changelog

### 1.0.0 (2025-01-18)
- Initial implementation
- FFmpeg transcoding
- HLS player component
- Adaptive bitrate support
