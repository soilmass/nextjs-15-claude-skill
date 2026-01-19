---
id: pt-video-transcoding
name: Video Format Transcoding
version: 1.0.0
layer: L5
category: media
description: Video transcoding and format conversion for Next.js applications
tags: [video, transcoding, ffmpeg, encoding, media, next15]
composes:
  - ../molecules/progress-bar.md
  - ../molecules/card.md
  - ../molecules/badge.md
dependencies:
  fluent-ffmpeg: "^2.1.0"
formula: FFmpeg + Queue Processing + Multiple Formats = Adaptive Video Delivery
performance:
  impact: high
  lcp: high
  cls: medium
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# Video Format Transcoding

## When to Use

- **Format compatibility**: Converting videos to web-friendly formats
- **Adaptive streaming**: Creating HLS/DASH manifests with multiple qualities
- **File optimization**: Compressing videos for faster delivery
- **Resolution variants**: Generating multiple quality levels

**Avoid when**: Using dedicated video platforms (Mux, Cloudflare Stream) for transcoding.

## Composition Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ Video Transcoding Architecture                               │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Transcoding Service                                   │  │
│  │  ├─ Format Conversion: MP4, WebM, MOV to web formats │  │
│  │  ├─ Quality Profiles: 1080p, 720p, 480p, 360p        │  │
│  │  └─ HLS Generation: Adaptive bitrate streaming       │  │
│  └───────────────────────────────────────────────────────┘  │
│         │                    │                    │         │
│         ▼                    ▼                    ▼         │
│  ┌────────────┐     ┌──────────────┐     ┌─────────────┐   │
│  │ Job        │     │ Progress     │     │ CDN         │   │
│  │ Queue      │     │ Tracking     │     │ Upload      │   │
│  └────────────┘     └──────────────┘     └─────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Quality Profiles

```typescript
// lib/video/profiles.ts
export interface QualityProfile {
  name: string;
  width: number;
  height: number;
  videoBitrate: string;
  audioBitrate: string;
  maxFrameRate: number;
}

export const QUALITY_PROFILES: Record<string, QualityProfile> = {
  '1080p': {
    name: '1080p',
    width: 1920,
    height: 1080,
    videoBitrate: '5000k',
    audioBitrate: '192k',
    maxFrameRate: 30,
  },
  '720p': {
    name: '720p',
    width: 1280,
    height: 720,
    videoBitrate: '2500k',
    audioBitrate: '128k',
    maxFrameRate: 30,
  },
  '480p': {
    name: '480p',
    width: 854,
    height: 480,
    videoBitrate: '1000k',
    audioBitrate: '96k',
    maxFrameRate: 30,
  },
  '360p': {
    name: '360p',
    width: 640,
    height: 360,
    videoBitrate: '500k',
    audioBitrate: '64k',
    maxFrameRate: 30,
  },
};

export type QualityLevel = keyof typeof QUALITY_PROFILES;
```

## Transcoding Service

```typescript
// lib/video/transcoding-service.ts
import { spawn } from 'child_process';
import { writeFile, unlink, mkdir, readFile } from 'fs/promises';
import { join } from 'path';
import { nanoid } from 'nanoid';
import { QUALITY_PROFILES, QualityProfile, QualityLevel } from './profiles';
import { uploadToStorage, uploadDirectory } from '@/lib/storage';
import { db } from '@/lib/db';

export interface TranscodeOptions {
  inputUrl: string;
  outputFormat?: 'mp4' | 'webm';
  qualities?: QualityLevel[];
  generateHLS?: boolean;
}

export interface TranscodeResult {
  id: string;
  status: 'completed' | 'failed';
  outputs: {
    quality: string;
    url: string;
    width: number;
    height: number;
    size: number;
  }[];
  hlsUrl?: string;
  duration: number;
}

const TEMP_DIR = '/tmp/transcoding';

export class TranscodingService {
  async ensureTempDir(subdir?: string): Promise<string> {
    const dir = subdir ? join(TEMP_DIR, subdir) : TEMP_DIR;
    await mkdir(dir, { recursive: true });
    return dir;
  }

  async transcode(
    jobId: string,
    options: TranscodeOptions,
    onProgress?: (progress: number) => void
  ): Promise<TranscodeResult> {
    const {
      inputUrl,
      outputFormat = 'mp4',
      qualities = ['720p', '480p', '360p'],
      generateHLS = true,
    } = options;

    const workDir = await this.ensureTempDir(jobId);
    const outputs: TranscodeResult['outputs'] = [];

    // Get input duration for progress tracking
    const duration = await this.getVideoDuration(inputUrl);

    // Transcode each quality
    for (let i = 0; i < qualities.length; i++) {
      const quality = qualities[i];
      const profile = QUALITY_PROFILES[quality];
      const outputPath = join(workDir, `${quality}.${outputFormat}`);

      await this.transcodeToFormat(inputUrl, outputPath, profile, outputFormat, (p) => {
        const overallProgress = ((i + p / 100) / qualities.length) * (generateHLS ? 80 : 100);
        onProgress?.(overallProgress);
      });

      const buffer = await readFile(outputPath);
      const url = await uploadToStorage(
        buffer,
        `videos/${jobId}/${quality}.${outputFormat}`,
        `video/${outputFormat}`
      );

      outputs.push({
        quality,
        url,
        width: profile.width,
        height: profile.height,
        size: buffer.length,
      });
    }

    let hlsUrl: string | undefined;

    // Generate HLS
    if (generateHLS) {
      onProgress?.(85);
      hlsUrl = await this.generateHLS(jobId, workDir, outputs, (p) => {
        onProgress?.(85 + p * 0.15);
      });
    }

    // Cleanup
    await this.cleanupWorkDir(workDir);

    return {
      id: jobId,
      status: 'completed',
      outputs,
      hlsUrl,
      duration,
    };
  }

  private async transcodeToFormat(
    inputUrl: string,
    outputPath: string,
    profile: QualityProfile,
    format: 'mp4' | 'webm',
    onProgress?: (progress: number) => void
  ): Promise<void> {
    const videoCodec = format === 'mp4' ? 'libx264' : 'libvpx-vp9';
    const audioCodec = format === 'mp4' ? 'aac' : 'libopus';

    const args = [
      '-i', inputUrl,
      '-c:v', videoCodec,
      '-b:v', profile.videoBitrate,
      '-maxrate', profile.videoBitrate,
      '-bufsize', `${parseInt(profile.videoBitrate) * 2}k`,
      '-vf', `scale=${profile.width}:${profile.height}:force_original_aspect_ratio=decrease,pad=${profile.width}:${profile.height}:(ow-iw)/2:(oh-ih)/2`,
      '-r', profile.maxFrameRate.toString(),
      '-c:a', audioCodec,
      '-b:a', profile.audioBitrate,
      '-movflags', '+faststart',
      '-y',
      outputPath,
    ];

    if (format === 'mp4') {
      args.splice(args.indexOf('-c:v') + 2, 0, '-preset', 'medium', '-crf', '23');
    }

    await this.runFFmpeg(args, onProgress);
  }

  async generateHLS(
    jobId: string,
    workDir: string,
    outputs: TranscodeResult['outputs'],
    onProgress?: (progress: number) => void
  ): Promise<string> {
    const hlsDir = join(workDir, 'hls');
    await mkdir(hlsDir, { recursive: true });

    // Generate HLS for each quality
    for (const output of outputs) {
      const qualityDir = join(hlsDir, output.quality);
      await mkdir(qualityDir, { recursive: true });

      const localPath = join(workDir, `${output.quality}.mp4`);

      await this.runFFmpeg([
        '-i', localPath,
        '-c:v', 'copy',
        '-c:a', 'copy',
        '-hls_time', '6',
        '-hls_playlist_type', 'vod',
        '-hls_segment_filename', join(qualityDir, 'segment_%03d.ts'),
        '-y',
        join(qualityDir, 'playlist.m3u8'),
      ]);
    }

    // Create master playlist
    const masterPlaylist = this.createMasterPlaylist(outputs);
    await writeFile(join(hlsDir, 'master.m3u8'), masterPlaylist);

    // Upload HLS directory
    const hlsBaseUrl = await uploadDirectory(hlsDir, `videos/${jobId}/hls`);

    return `${hlsBaseUrl}/master.m3u8`;
  }

  private createMasterPlaylist(outputs: TranscodeResult['outputs'][]): string {
    let playlist = '#EXTM3U\n#EXT-X-VERSION:3\n\n';

    for (const output of outputs) {
      const profile = QUALITY_PROFILES[output.quality as QualityLevel];
      const bandwidth = parseInt(profile.videoBitrate) * 1000;

      playlist += `#EXT-X-STREAM-INF:BANDWIDTH=${bandwidth},RESOLUTION=${output.width}x${output.height}\n`;
      playlist += `${output.quality}/playlist.m3u8\n\n`;
    }

    return playlist;
  }

  private runFFmpeg(args: string[], onProgress?: (progress: number) => void): Promise<void> {
    return new Promise((resolve, reject) => {
      const ffmpeg = spawn('ffmpeg', ['-progress', 'pipe:1', ...args]);
      let duration = 0;

      ffmpeg.stderr.on('data', (data) => {
        const match = data.toString().match(/Duration: (\d+):(\d+):(\d+)/);
        if (match) {
          duration = parseInt(match[1]) * 3600 + parseInt(match[2]) * 60 + parseInt(match[3]);
        }
      });

      ffmpeg.stdout.on('data', (data) => {
        const match = data.toString().match(/out_time_ms=(\d+)/);
        if (match && duration > 0) {
          const currentMs = parseInt(match[1]);
          const progress = (currentMs / 1000000 / duration) * 100;
          onProgress?.(Math.min(progress, 100));
        }
      });

      ffmpeg.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`FFmpeg exited with code ${code}`));
        }
      });

      ffmpeg.on('error', reject);
    });
  }

  private async getVideoDuration(url: string): Promise<number> {
    return new Promise((resolve, reject) => {
      const ffprobe = spawn('ffprobe', [
        '-v', 'error',
        '-show_entries', 'format=duration',
        '-of', 'default=noprint_wrappers=1:nokey=1',
        url,
      ]);

      let stdout = '';
      ffprobe.stdout.on('data', (data) => { stdout += data.toString(); });
      ffprobe.on('close', (code) => {
        if (code === 0) resolve(parseFloat(stdout.trim()));
        else reject(new Error('Failed to get duration'));
      });
    });
  }

  private async cleanupWorkDir(dir: string): Promise<void> {
    const { rm } = await import('fs/promises');
    await rm(dir, { recursive: true, force: true }).catch(() => {});
  }
}

export const transcodingService = new TranscodingService();
```

## Job Queue Integration

```typescript
// lib/video/transcode-queue.ts
import { Queue, Worker, Job } from 'bullmq';
import { transcodingService, TranscodeOptions } from './transcoding-service';
import { db } from '@/lib/db';

const connection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
};

export const transcodeQueue = new Queue('video-transcode', { connection });

export async function queueTranscodeJob(
  videoId: string,
  options: TranscodeOptions
): Promise<string> {
  const job = await transcodeQueue.add('transcode', {
    videoId,
    ...options,
  });

  await db.video.update({
    where: { id: videoId },
    data: {
      transcodeJobId: job.id,
      transcodeStatus: 'queued',
    },
  });

  return job.id!;
}

// Worker process
export function startTranscodeWorker() {
  const worker = new Worker(
    'video-transcode',
    async (job: Job) => {
      const { videoId, ...options } = job.data;

      await db.video.update({
        where: { id: videoId },
        data: { transcodeStatus: 'processing' },
      });

      try {
        const result = await transcodingService.transcode(
          videoId,
          options,
          async (progress) => {
            await job.updateProgress(progress);
            await db.video.update({
              where: { id: videoId },
              data: { transcodeProgress: progress },
            });
          }
        );

        await db.video.update({
          where: { id: videoId },
          data: {
            transcodeStatus: 'completed',
            transcodeProgress: 100,
            hlsUrl: result.hlsUrl,
            outputs: result.outputs,
          },
        });

        return result;
      } catch (error) {
        await db.video.update({
          where: { id: videoId },
          data: {
            transcodeStatus: 'failed',
            transcodeError: error instanceof Error ? error.message : 'Unknown error',
          },
        });
        throw error;
      }
    },
    { connection, concurrency: 2 }
  );

  return worker;
}
```

## Transcode Progress Component

```typescript
// components/video/transcode-progress.tsx
'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

interface TranscodeProgressProps {
  videoId: string;
  onComplete?: () => void;
}

export function TranscodeProgress({ videoId, onComplete }: TranscodeProgressProps) {
  const [status, setStatus] = useState<string>('queued');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const interval = setInterval(async () => {
      const res = await fetch(`/api/videos/${videoId}/transcode-status`);
      const data = await res.json();

      setStatus(data.status);
      setProgress(data.progress || 0);
      setError(data.error);

      if (data.status === 'completed') {
        clearInterval(interval);
        onComplete?.();
      } else if (data.status === 'failed') {
        clearInterval(interval);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [videoId, onComplete]);

  const statusConfig = {
    queued: { icon: Loader2, color: 'bg-gray-500', label: 'Queued' },
    processing: { icon: Loader2, color: 'bg-blue-500', label: 'Processing' },
    completed: { icon: CheckCircle, color: 'bg-green-500', label: 'Completed' },
    failed: { icon: XCircle, color: 'bg-red-500', label: 'Failed' },
  };

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.queued;
  const Icon = config.icon;

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">Video Processing</CardTitle>
          <Badge className={config.color}>{config.label}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Icon className={`h-4 w-4 ${status === 'processing' || status === 'queued' ? 'animate-spin' : ''}`} />
            <span className="text-sm text-muted-foreground">
              {status === 'processing'
                ? `Transcoding... ${progress.toFixed(0)}%`
                : status === 'completed'
                ? 'Video ready to play'
                : status === 'failed'
                ? error
                : 'Waiting in queue'}
            </span>
          </div>
          {status === 'processing' && <Progress value={progress} />}
        </div>
      </CardContent>
    </Card>
  );
}
```

## Related Patterns

- [video-upload](./video-upload.md)
- [video-thumbnails](./video-thumbnails.md)
- [video-player](./video-player.md)

---

## Changelog

### 1.0.0 (2025-01-18)
- Initial implementation
- FFmpeg transcoding
- HLS generation
- Job queue processing
- Progress tracking
