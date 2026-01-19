---
id: pt-video-conferencing
name: Video Call Integration
version: 1.0.0
layer: L5
category: communication
description: Video conferencing integration with Daily.co for Next.js applications
tags: [video, webrtc, conferencing, calls, daily, next15, react19]
composes:
  - ../atoms/input-button.md
  - ../molecules/card.md
  - ../organisms/dialog.md
  - ../molecules/avatar.md
dependencies: []
formula: Daily SDK + Room Management + UI Components = Video Calling
performance:
  impact: high
  lcp: high
  cls: medium
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# Video Call Integration

## When to Use

- **Team meetings**: Internal video conferencing for teams
- **Customer calls**: Sales demos, support calls, consultations
- **Live events**: Webinars, workshops, live streaming
- **Telehealth**: Video consultations for healthcare

**Avoid when**: Audio-only suffices, or using established platforms (Zoom, Teams).

## Composition Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ Video Conferencing Architecture                              │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Daily Service                                         │  │
│  │  ├─ Room Management: Create, configure, delete rooms │  │
│  │  ├─ Token Generation: Secure meeting access          │  │
│  │  └─ Recording: Cloud recording management            │  │
│  └───────────────────────────────────────────────────────┘  │
│         │                    │                    │         │
│         ▼                    ▼                    ▼         │
│  ┌────────────┐     ┌──────────────┐     ┌─────────────┐   │
│  │ Video      │     │ Participant  │     │ Controls    │   │
│  │ Grid       │     │ List         │     │ Bar         │   │
│  └────────────┘     └──────────────┘     └─────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Daily Service

```typescript
// lib/video/service.ts
const DAILY_API_KEY = process.env.DAILY_API_KEY!;
const DAILY_API_URL = 'https://api.daily.co/v1';

export interface Room {
  id: string;
  name: string;
  url: string;
  createdAt: Date;
  config: RoomConfig;
}

export interface RoomConfig {
  maxParticipants?: number;
  enableChat?: boolean;
  enableScreenShare?: boolean;
  enableRecording?: boolean;
  startVideoOff?: boolean;
  startAudioOff?: boolean;
  expiryMinutes?: number;
}

export interface MeetingToken {
  token: string;
  roomName: string;
  expiresAt: Date;
}

export class VideoService {
  private async request(endpoint: string, options: RequestInit = {}) {
    const response = await fetch(`${DAILY_API_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${DAILY_API_KEY}`,
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`Daily API error: ${response.statusText}`);
    }

    return response.json();
  }

  async createRoom(name: string, config: RoomConfig = {}): Promise<Room> {
    const expiryTime = config.expiryMinutes
      ? Math.floor(Date.now() / 1000) + config.expiryMinutes * 60
      : undefined;

    const data = await this.request('/rooms', {
      method: 'POST',
      body: JSON.stringify({
        name,
        properties: {
          max_participants: config.maxParticipants || 10,
          enable_chat: config.enableChat ?? true,
          enable_screenshare: config.enableScreenShare ?? true,
          enable_recording: config.enableRecording ? 'cloud' : undefined,
          start_video_off: config.startVideoOff ?? false,
          start_audio_off: config.startAudioOff ?? false,
          exp: expiryTime,
        },
      }),
    });

    return {
      id: data.id,
      name: data.name,
      url: data.url,
      createdAt: new Date(data.created_at),
      config,
    };
  }

  async getRoom(name: string): Promise<Room | null> {
    try {
      const data = await this.request(`/rooms/${name}`);
      return {
        id: data.id,
        name: data.name,
        url: data.url,
        createdAt: new Date(data.created_at),
        config: {},
      };
    } catch {
      return null;
    }
  }

  async deleteRoom(name: string): Promise<void> {
    await this.request(`/rooms/${name}`, { method: 'DELETE' });
  }

  async createMeetingToken(
    roomName: string,
    options: {
      userId?: string;
      userName?: string;
      isOwner?: boolean;
      expiryMinutes?: number;
    } = {}
  ): Promise<MeetingToken> {
    const expiryTime = Math.floor(Date.now() / 1000) + (options.expiryMinutes || 60) * 60;

    const data = await this.request('/meeting-tokens', {
      method: 'POST',
      body: JSON.stringify({
        properties: {
          room_name: roomName,
          user_id: options.userId,
          user_name: options.userName,
          is_owner: options.isOwner ?? false,
          exp: expiryTime,
        },
      }),
    });

    return {
      token: data.token,
      roomName,
      expiresAt: new Date(expiryTime * 1000),
    };
  }

  async startRecording(roomName: string): Promise<{ recordingId: string }> {
    const data = await this.request(`/rooms/${roomName}/recordings`, {
      method: 'POST',
    });
    return { recordingId: data.id };
  }

  async stopRecording(roomName: string, recordingId: string): Promise<void> {
    await this.request(`/rooms/${roomName}/recordings/${recordingId}/stop`, {
      method: 'POST',
    });
  }

  async getRecordings(roomName: string): Promise<{ id: string; url: string; duration: number }[]> {
    const data = await this.request(`/rooms/${roomName}/recordings`);
    return data.data.map((r: any) => ({
      id: r.id,
      url: r.download_link,
      duration: r.duration,
    }));
  }
}

export const videoService = new VideoService();
```

## API Routes

```typescript
// app/api/video/rooms/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { videoService } from '@/lib/video/service';
import { nanoid } from 'nanoid';

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { name, config } = await request.json();
  const roomName = name || `meeting-${nanoid(8)}`;

  const room = await videoService.createRoom(roomName, config);

  return NextResponse.json(room);
}

// app/api/video/rooms/[name]/token/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { videoService } from '@/lib/video/service';

export async function POST(
  request: NextRequest,
  { params }: { params: { name: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { isOwner } = await request.json();

  const token = await videoService.createMeetingToken(params.name, {
    userId: session.user.id,
    userName: session.user.name || 'Guest',
    isOwner,
  });

  return NextResponse.json(token);
}
```

## Video Call Component

```typescript
// components/video/video-call.tsx
'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import DailyIframe, { DailyCall } from '@daily-co/daily-js';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  Monitor,
  Users,
} from 'lucide-react';

interface VideoCallProps {
  roomUrl: string;
  token?: string;
  onLeave?: () => void;
}

export function VideoCall({ roomUrl, token, onLeave }: VideoCallProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const callRef = useRef<DailyCall | null>(null);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [participantCount, setParticipantCount] = useState(1);
  const [isJoined, setIsJoined] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    const call = DailyIframe.createFrame(containerRef.current, {
      showLeaveButton: false,
      showFullscreenButton: true,
      iframeStyle: {
        width: '100%',
        height: '100%',
        border: 'none',
        borderRadius: '8px',
      },
    });

    callRef.current = call;

    call.on('joined-meeting', () => {
      setIsJoined(true);
      updateParticipantCount();
    });

    call.on('left-meeting', () => {
      setIsJoined(false);
      onLeave?.();
    });

    call.on('participant-joined', updateParticipantCount);
    call.on('participant-left', updateParticipantCount);

    call.join({ url: roomUrl, token });

    function updateParticipantCount() {
      const participants = call.participants();
      setParticipantCount(Object.keys(participants).length);
    }

    return () => {
      call.destroy();
    };
  }, [roomUrl, token, onLeave]);

  const toggleAudio = useCallback(() => {
    if (callRef.current) {
      callRef.current.setLocalAudio(!isAudioOn);
      setIsAudioOn(!isAudioOn);
    }
  }, [isAudioOn]);

  const toggleVideo = useCallback(() => {
    if (callRef.current) {
      callRef.current.setLocalVideo(!isVideoOn);
      setIsVideoOn(!isVideoOn);
    }
  }, [isVideoOn]);

  const shareScreen = useCallback(() => {
    if (callRef.current) {
      callRef.current.startScreenShare();
    }
  }, []);

  const leaveCall = useCallback(() => {
    if (callRef.current) {
      callRef.current.leave();
    }
  }, []);

  return (
    <Card className="relative overflow-hidden">
      <div ref={containerRef} className="aspect-video bg-black" />

      {isJoined && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/50 backdrop-blur-sm rounded-full px-4 py-2">
          <Button
            variant={isAudioOn ? 'secondary' : 'destructive'}
            size="icon"
            onClick={toggleAudio}
          >
            {isAudioOn ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
          </Button>

          <Button
            variant={isVideoOn ? 'secondary' : 'destructive'}
            size="icon"
            onClick={toggleVideo}
          >
            {isVideoOn ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
          </Button>

          <Button variant="secondary" size="icon" onClick={shareScreen}>
            <Monitor className="h-4 w-4" />
          </Button>

          <div className="flex items-center gap-1 px-2 text-white text-sm">
            <Users className="h-4 w-4" />
            <span>{participantCount}</span>
          </div>

          <Button variant="destructive" size="icon" onClick={leaveCall}>
            <PhoneOff className="h-4 w-4" />
          </Button>
        </div>
      )}
    </Card>
  );
}
```

## Meeting Scheduler

```typescript
// components/video/meeting-scheduler.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Video, Copy } from 'lucide-react';

export function MeetingScheduler() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [meetingUrl, setMeetingUrl] = useState('');
  const [config, setConfig] = useState({
    enableRecording: false,
    enableChat: true,
    maxParticipants: 10,
  });

  const createMeeting = async () => {
    setLoading(true);

    try {
      const res = await fetch('/api/video/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config }),
      });

      const room = await res.json();
      setMeetingUrl(room.url);
      toast.success('Meeting created');
    } catch {
      toast.error('Failed to create meeting');
    } finally {
      setLoading(false);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(meetingUrl);
    toast.success('Link copied');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Video className="h-4 w-4 mr-2" />
          New Meeting
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Meeting</DialogTitle>
        </DialogHeader>

        {!meetingUrl ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Enable Recording</Label>
              <Switch
                checked={config.enableRecording}
                onCheckedChange={(checked) =>
                  setConfig({ ...config, enableRecording: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <Label>Enable Chat</Label>
              <Switch
                checked={config.enableChat}
                onCheckedChange={(checked) =>
                  setConfig({ ...config, enableChat: checked })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Max Participants</Label>
              <Input
                type="number"
                value={config.maxParticipants}
                onChange={(e) =>
                  setConfig({ ...config, maxParticipants: parseInt(e.target.value) })
                }
                min={2}
                max={100}
              />
            </div>

            <Button onClick={createMeeting} disabled={loading} className="w-full">
              {loading ? 'Creating...' : 'Create Meeting'}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input value={meetingUrl} readOnly />
              <Button variant="outline" size="icon" onClick={copyLink}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <Button
              onClick={() => window.open(meetingUrl, '_blank')}
              className="w-full"
            >
              Join Meeting
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
```

## Related Patterns

- [websocket](./websocket.md)
- [notifications](./notifications.md)
- [scheduling](./scheduling.md)

---

## Changelog

### 1.0.0 (2025-01-18)
- Initial implementation
- Daily.co integration
- Room management
- Video call component
- Meeting scheduler
