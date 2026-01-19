---
id: r-cicd-dashboard
name: CI/CD Dashboard
version: 1.0.0
layer: L6
category: recipes
description: Build and deployment dashboard with pipeline visualization and status monitoring
tags: [developer-tools, cicd, builds, deployments, monitoring, next15, pipelines, webhooks]
composes:
  - ../templates/dashboard-layout.md
  - ../templates/dashboard-home.md
  - ../organisms/data-table.md
  - ../organisms/chart.md
  - ../organisms/timeline.md
  - ../organisms/stats-dashboard.md
  - ../organisms/activity-feed.md
  - ../organisms/notification-center.md
  - ../molecules/badge.md
  - ../molecules/stat-card.md
  - ../molecules/progress-bar.md
dependencies:
  next: "^15.1.0"
  prisma: "^6.0.0"
  socket.io: "^4.0.0"
  "@tanstack/react-query": "^5.0.0"
  zod: "^3.22.0"
  date-fns: "^3.0.0"
  recharts: "^2.10.0"
  lucide-react: "^0.300.0"
formula: CICD = Dashboard(t-dashboard-layout) + DataTable(o-data-table) + Charts(o-chart) + Timeline(o-timeline) + ActivityFeed(o-activity-feed) + RealTime(socket.io) + Webhooks(API)
performance:
  impact: high
  lcp: medium
  cls: low
accessibility:
  wcag: AA
  keyboard: true
  screen-reader: true
complexity: advanced
estimated_time: "16-24 hours"
---

# CI/CD Dashboard

## Overview

A production-ready CI/CD dashboard for monitoring build pipelines, deployments, and system health. Features real-time status updates via WebSocket connections, GitHub/GitLab webhook integration, environment management across dev/staging/production, and comprehensive analytics for build times, success rates, and MTTR tracking.

## Architecture

```
app/
├── (dashboard)/
│   ├── layout.tsx                    # Dashboard shell with sidebar
│   ├── page.tsx                      # Overview with pipeline status
│   ├── pipelines/
│   │   ├── page.tsx                  # Pipeline list
│   │   └── [pipelineId]/
│   │       ├── page.tsx              # Pipeline detail with stages
│   │       └── jobs/[jobId]/page.tsx # Job logs
│   ├── builds/
│   │   ├── page.tsx                  # Build history
│   │   └── [buildId]/page.tsx        # Build detail with logs
│   ├── deployments/
│   │   ├── page.tsx                  # Deployment history
│   │   └── [deploymentId]/page.tsx   # Deployment detail
│   ├── environments/
│   │   └── page.tsx                  # Environment management
│   ├── analytics/
│   │   └── page.tsx                  # Metrics & analytics
│   └── settings/
│       └── page.tsx                  # Webhook & notification settings
├── api/
│   ├── webhooks/
│   │   ├── github/route.ts           # GitHub webhook handler
│   │   └── gitlab/route.ts           # GitLab webhook handler
│   ├── pipelines/
│   │   ├── route.ts                  # CRUD pipelines
│   │   └── [pipelineId]/
│   │       ├── route.ts              # Single pipeline
│   │       ├── trigger/route.ts      # Manual trigger
│   │       └── cancel/route.ts       # Cancel pipeline
│   ├── builds/
│   │   ├── route.ts                  # Build list
│   │   └── [buildId]/
│   │       ├── route.ts              # Build detail
│   │       └── logs/route.ts         # Build logs (streaming)
│   ├── deployments/
│   │   ├── route.ts                  # Deployment list
│   │   └── [deploymentId]/
│   │       ├── route.ts              # Deployment detail
│   │       └── rollback/route.ts     # Rollback deployment
│   ├── environments/route.ts         # Environment management
│   ├── analytics/route.ts            # Metrics aggregation
│   └── notifications/route.ts        # Notification dispatch
├── components/
│   ├── pipelines/
│   │   ├── pipeline-card.tsx
│   │   ├── pipeline-visualization.tsx
│   │   ├── stage-node.tsx
│   │   └── job-card.tsx
│   ├── builds/
│   │   ├── build-status-badge.tsx
│   │   ├── build-list.tsx
│   │   └── log-viewer.tsx
│   ├── deployments/
│   │   ├── deployment-card.tsx
│   │   ├── environment-badge.tsx
│   │   └── rollback-dialog.tsx
│   └── analytics/
│       ├── build-time-chart.tsx
│       ├── success-rate-chart.tsx
│       └── mttr-card.tsx
├── lib/
│   ├── socket.ts                     # Socket.io client
│   ├── webhooks.ts                   # Webhook verification
│   └── notifications.ts              # Slack/email notifications
└── prisma/
    └── schema.prisma
```

## Skills Used

| Skill | Layer | Purpose |
|-------|-------|---------|
| Dashboard Layout | L4 Template | Main dashboard shell with navigation |
| Data Table | L3 Organism | Build/deployment history tables |
| Chart | L3 Organism | Analytics visualizations |
| Timeline | L3 Organism | Pipeline stage visualization |
| Activity Feed | L3 Organism | Real-time build events |
| Notification Center | L3 Organism | Alert management |

## Database Schema

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Project {
  id            String       @id @default(cuid())
  name          String
  slug          String       @unique
  repository    String       // git@github.com:org/repo.git
  provider      Provider     @default(GITHUB)
  defaultBranch String       @default("main")

  pipelines     Pipeline[]
  builds        Build[]
  deployments   Deployment[]
  environments  Environment[]
  webhooks      Webhook[]

  createdAt     DateTime     @default(now())
  updatedAt     DateTime     @updatedAt

  @@index([slug])
}

enum Provider {
  GITHUB
  GITLAB
  BITBUCKET
}

model Pipeline {
  id          String        @id @default(cuid())
  name        String
  config      Json          // Pipeline configuration YAML
  isActive    Boolean       @default(true)

  projectId   String
  project     Project       @relation(fields: [projectId], references: [id], onDelete: Cascade)

  stages      Stage[]
  builds      Build[]

  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt

  @@index([projectId])
}

model Stage {
  id          String        @id @default(cuid())
  name        String
  order       Int

  pipelineId  String
  pipeline    Pipeline      @relation(fields: [pipelineId], references: [id], onDelete: Cascade)

  jobs        Job[]

  @@index([pipelineId])
  @@unique([pipelineId, order])
}

model Job {
  id            String      @id @default(cuid())
  name          String
  script        String[]    // Commands to execute
  dependencies  String[]    // Job IDs this job depends on
  allowFailure  Boolean     @default(false)
  timeout       Int         @default(3600) // seconds

  stageId       String
  stage         Stage       @relation(fields: [stageId], references: [id], onDelete: Cascade)

  executions    JobExecution[]

  @@index([stageId])
}

model Build {
  id            String        @id @default(cuid())
  number        Int
  status        BuildStatus   @default(PENDING)
  branch        String
  commit        String        // SHA
  commitMessage String?
  author        String?
  authorAvatar  String?

  startedAt     DateTime?
  finishedAt    DateTime?
  duration      Int?          // seconds

  projectId     String
  project       Project       @relation(fields: [projectId], references: [id], onDelete: Cascade)

  pipelineId    String
  pipeline      Pipeline      @relation(fields: [pipelineId], references: [id], onDelete: Cascade)

  triggeredBy   String?       // user ID or "webhook"

  jobExecutions JobExecution[]
  logs          BuildLog[]
  deployments   Deployment[]

  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt

  @@unique([projectId, number])
  @@index([projectId, status])
  @@index([pipelineId])
  @@index([branch])
  @@index([createdAt])
}

enum BuildStatus {
  PENDING
  RUNNING
  SUCCESS
  FAILED
  CANCELLED
  SKIPPED
}

model JobExecution {
  id          String        @id @default(cuid())
  status      BuildStatus   @default(PENDING)
  startedAt   DateTime?
  finishedAt  DateTime?
  duration    Int?
  exitCode    Int?

  jobId       String
  job         Job           @relation(fields: [jobId], references: [id], onDelete: Cascade)

  buildId     String
  build       Build         @relation(fields: [buildId], references: [id], onDelete: Cascade)

  logs        BuildLog[]

  @@index([buildId])
  @@index([jobId])
}

model BuildLog {
  id          String        @id @default(cuid())
  timestamp   DateTime      @default(now())
  level       LogLevel      @default(INFO)
  message     String
  metadata    Json?

  buildId     String
  build       Build         @relation(fields: [buildId], references: [id], onDelete: Cascade)

  executionId String?
  execution   JobExecution? @relation(fields: [executionId], references: [id], onDelete: Cascade)

  @@index([buildId, timestamp])
  @@index([executionId])
}

enum LogLevel {
  DEBUG
  INFO
  WARN
  ERROR
}

model Environment {
  id          String        @id @default(cuid())
  name        String        // dev, staging, production
  slug        String
  url         String?       // Environment URL
  isProtected Boolean       @default(false)
  variables   Json?         // Encrypted env variables

  projectId   String
  project     Project       @relation(fields: [projectId], references: [id], onDelete: Cascade)

  deployments Deployment[]

  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt

  @@unique([projectId, slug])
  @@index([projectId])
}

model Deployment {
  id              String           @id @default(cuid())
  status          DeploymentStatus @default(PENDING)
  version         String?          // Deployed version/tag
  commit          String

  startedAt       DateTime?
  finishedAt      DateTime?
  duration        Int?

  environmentId   String
  environment     Environment      @relation(fields: [environmentId], references: [id], onDelete: Cascade)

  buildId         String?
  build           Build?           @relation(fields: [buildId], references: [id])

  projectId       String
  project         Project          @relation(fields: [projectId], references: [id], onDelete: Cascade)

  deployedBy      String?          // user ID
  rollbackFrom    String?          // Previous deployment ID

  createdAt       DateTime         @default(now())
  updatedAt       DateTime         @updatedAt

  @@index([environmentId])
  @@index([projectId])
  @@index([createdAt])
}

enum DeploymentStatus {
  PENDING
  IN_PROGRESS
  SUCCESS
  FAILED
  ROLLED_BACK
}

model Webhook {
  id          String        @id @default(cuid())
  provider    Provider
  secret      String        // For signature verification
  events      String[]      // push, pull_request, etc.
  isActive    Boolean       @default(true)

  projectId   String
  project     Project       @relation(fields: [projectId], references: [id], onDelete: Cascade)

  lastDelivery DateTime?

  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt

  @@index([projectId])
}

// Metrics aggregation table for analytics
model DailyMetrics {
  id                String   @id @default(cuid())
  date              DateTime @db.Date

  projectId         String

  // Build metrics
  totalBuilds       Int      @default(0)
  successfulBuilds  Int      @default(0)
  failedBuilds      Int      @default(0)
  avgBuildDuration  Float    @default(0) // seconds

  // Deployment metrics
  totalDeployments  Int      @default(0)
  successfulDeploys Int      @default(0)
  failedDeploys     Int      @default(0)
  rollbacks         Int      @default(0)

  // MTTR (Mean Time To Recovery)
  mttr              Float?   // minutes

  createdAt         DateTime @default(now())

  @@unique([date, projectId])
  @@index([projectId, date])
}
```

## Implementation

### Build Status Badge Component

```tsx
// components/builds/build-status-badge.tsx
import { cva, type VariantProps } from 'class-variance-authority';
import {
  CheckCircle, XCircle, Clock, Loader2,
  Ban, SkipForward, AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium',
  {
    variants: {
      status: {
        PENDING: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
        RUNNING: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
        SUCCESS: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
        FAILED: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
        CANCELLED: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
        SKIPPED: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400',
      },
    },
    defaultVariants: {
      status: 'PENDING',
    },
  }
);

type BuildStatus = 'PENDING' | 'RUNNING' | 'SUCCESS' | 'FAILED' | 'CANCELLED' | 'SKIPPED';

interface BuildStatusBadgeProps extends VariantProps<typeof badgeVariants> {
  status: BuildStatus;
  showLabel?: boolean;
  className?: string;
}

const statusIcons: Record<BuildStatus, React.ComponentType<{ className?: string }>> = {
  PENDING: Clock,
  RUNNING: Loader2,
  SUCCESS: CheckCircle,
  FAILED: XCircle,
  CANCELLED: Ban,
  SKIPPED: SkipForward,
};

const statusLabels: Record<BuildStatus, string> = {
  PENDING: 'Pending',
  RUNNING: 'Running',
  SUCCESS: 'Passed',
  FAILED: 'Failed',
  CANCELLED: 'Cancelled',
  SKIPPED: 'Skipped',
};

export function BuildStatusBadge({
  status,
  showLabel = true,
  className
}: BuildStatusBadgeProps) {
  const Icon = statusIcons[status];

  return (
    <span className={cn(badgeVariants({ status }), className)}>
      <Icon
        className={cn(
          'h-3.5 w-3.5',
          status === 'RUNNING' && 'animate-spin'
        )}
      />
      {showLabel && <span>{statusLabels[status]}</span>}
    </span>
  );
}
```

### Pipeline Visualization Component

```tsx
// components/pipelines/pipeline-visualization.tsx
'use client';

import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { BuildStatusBadge } from '@/components/builds/build-status-badge';

interface Stage {
  id: string;
  name: string;
  order: number;
  jobs: Job[];
}

interface Job {
  id: string;
  name: string;
  status: BuildStatus;
  duration?: number;
  dependencies: string[];
}

interface PipelineVisualizationProps {
  stages: Stage[];
  className?: string;
  onJobClick?: (jobId: string) => void;
}

export function PipelineVisualization({
  stages,
  className,
  onJobClick
}: PipelineVisualizationProps) {
  const sortedStages = useMemo(
    () => [...stages].sort((a, b) => a.order - b.order),
    [stages]
  );

  const getStageStatus = (stage: Stage): BuildStatus => {
    const statuses = stage.jobs.map(j => j.status);
    if (statuses.some(s => s === 'FAILED')) return 'FAILED';
    if (statuses.some(s => s === 'RUNNING')) return 'RUNNING';
    if (statuses.some(s => s === 'PENDING')) return 'PENDING';
    if (statuses.every(s => s === 'SUCCESS')) return 'SUCCESS';
    if (statuses.every(s => s === 'SKIPPED')) return 'SKIPPED';
    return 'PENDING';
  };

  return (
    <div className={cn('w-full overflow-x-auto', className)}>
      <div className="flex items-stretch gap-2 min-w-max p-4">
        {sortedStages.map((stage, index) => (
          <div key={stage.id} className="flex items-center">
            {/* Stage */}
            <div className="flex flex-col gap-2 min-w-[200px]">
              {/* Stage Header */}
              <div className="flex items-center justify-between px-3 py-2 bg-gray-50 dark:bg-gray-900 rounded-t-lg border border-b-0 border-gray-200 dark:border-gray-700">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {stage.name}
                </span>
                <BuildStatusBadge
                  status={getStageStatus(stage)}
                  showLabel={false}
                />
              </div>

              {/* Jobs */}
              <div className="flex flex-col gap-1.5 p-2 bg-white dark:bg-gray-800 rounded-b-lg border border-gray-200 dark:border-gray-700">
                {stage.jobs.map(job => (
                  <button
                    key={job.id}
                    onClick={() => onJobClick?.(job.id)}
                    className={cn(
                      'flex items-center justify-between p-2 rounded-md text-left',
                      'hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors',
                      'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1'
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <BuildStatusBadge status={job.status} showLabel={false} />
                      <span className="text-sm text-gray-900 dark:text-gray-100">
                        {job.name}
                      </span>
                    </div>
                    {job.duration && (
                      <span className="text-xs text-gray-500">
                        {formatDuration(job.duration)}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Connector */}
            {index < sortedStages.length - 1 && (
              <div className="flex items-center px-2">
                <div className="w-8 h-0.5 bg-gray-300 dark:bg-gray-600" />
                <div className="w-0 h-0 border-t-4 border-b-4 border-l-4 border-transparent border-l-gray-300 dark:border-l-gray-600" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  if (minutes < 60) return `${minutes}m ${remainingSeconds}s`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h ${remainingMinutes}m`;
}
```

### Real-Time Log Viewer

```tsx
// components/builds/log-viewer.tsx
'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useSocket } from '@/hooks/use-socket';
import { cn } from '@/lib/utils';
import {
  Download, Search, ChevronDown, ChevronUp,
  Maximize2, Minimize2, Terminal
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface LogLine {
  id: string;
  timestamp: Date;
  level: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';
  message: string;
}

interface LogViewerProps {
  buildId: string;
  jobId?: string;
  initialLogs?: LogLine[];
  className?: string;
}

const levelColors: Record<string, string> = {
  DEBUG: 'text-gray-500',
  INFO: 'text-blue-500',
  WARN: 'text-yellow-500',
  ERROR: 'text-red-500',
};

export function LogViewer({
  buildId,
  jobId,
  initialLogs = [],
  className
}: LogViewerProps) {
  const [logs, setLogs] = useState<LogLine[]>(initialLogs);
  const [searchTerm, setSearchTerm] = useState('');
  const [autoScroll, setAutoScroll] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const socket = useSocket();

  // Subscribe to real-time logs
  useEffect(() => {
    if (!socket) return;

    const channel = jobId
      ? `build:${buildId}:job:${jobId}:logs`
      : `build:${buildId}:logs`;

    socket.emit('subscribe', channel);

    socket.on('log', (log: LogLine) => {
      setLogs(prev => [...prev, log]);
    });

    return () => {
      socket.emit('unsubscribe', channel);
      socket.off('log');
    };
  }, [socket, buildId, jobId]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (autoScroll && containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [logs, autoScroll]);

  // Handle scroll to detect manual scrolling
  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 50;
    setAutoScroll(isAtBottom);
  }, []);

  const filteredLogs = searchTerm
    ? logs.filter(log =>
        log.message.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : logs;

  const downloadLogs = () => {
    const content = logs
      .map(log => `[${log.timestamp}] [${log.level}] ${log.message}`)
      .join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `build-${buildId}-logs.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className={cn(
        'flex flex-col bg-gray-900 rounded-lg overflow-hidden',
        isExpanded ? 'fixed inset-4 z-50' : 'h-[500px]',
        className
      )}
    >
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <Terminal className="h-4 w-4 text-gray-400" />
          <span className="text-sm font-medium text-gray-200">Build Logs</span>
          <span className="text-xs text-gray-500">
            {logs.length} lines
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-500" />
            <Input
              type="text"
              placeholder="Search logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 h-8 w-48 bg-gray-700 border-gray-600 text-gray-200 text-sm"
            />
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setAutoScroll(!autoScroll)}
            className="text-gray-400 hover:text-gray-200"
          >
            {autoScroll ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronUp className="h-4 w-4" />
            )}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={downloadLogs}
            className="text-gray-400 hover:text-gray-200"
          >
            <Download className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-400 hover:text-gray-200"
          >
            {isExpanded ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Log Content */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-auto font-mono text-sm p-4"
      >
        {filteredLogs.map((log, index) => (
          <div
            key={log.id || index}
            className="flex gap-4 hover:bg-gray-800/50 px-2 py-0.5 rounded"
          >
            <span className="text-gray-600 select-none whitespace-nowrap">
              {new Date(log.timestamp).toLocaleTimeString()}
            </span>
            <span className={cn('font-medium w-12', levelColors[log.level])}>
              [{log.level}]
            </span>
            <span className="text-gray-300 whitespace-pre-wrap break-all">
              {log.message}
            </span>
          </div>
        ))}

        {logs.length === 0 && (
          <div className="flex items-center justify-center h-full text-gray-500">
            Waiting for logs...
          </div>
        )}
      </div>

      {/* Status bar */}
      {!autoScroll && (
        <div className="px-4 py-1 bg-blue-600 text-white text-xs text-center">
          Scroll paused. Click to resume auto-scroll.
          <button
            onClick={() => {
              setAutoScroll(true);
              containerRef.current?.scrollTo({
                top: containerRef.current.scrollHeight,
                behavior: 'smooth'
              });
            }}
            className="ml-2 underline"
          >
            Resume
          </button>
        </div>
      )}
    </div>
  );
}
```

### GitHub Webhook Handler

```tsx
// app/api/webhooks/github/route.ts
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { triggerPipeline } from '@/lib/pipeline';
import { updateCommitStatus } from '@/lib/github';

export async function POST(request: NextRequest) {
  const signature = request.headers.get('x-hub-signature-256');
  const event = request.headers.get('x-github-event');
  const deliveryId = request.headers.get('x-github-delivery');

  if (!signature || !event) {
    return NextResponse.json(
      { error: 'Missing required headers' },
      { status: 400 }
    );
  }

  const body = await request.text();
  const payload = JSON.parse(body);

  // Find matching webhook
  const repositoryUrl = payload.repository?.clone_url || payload.repository?.ssh_url;
  if (!repositoryUrl) {
    return NextResponse.json(
      { error: 'Repository URL not found' },
      { status: 400 }
    );
  }

  const project = await prisma.project.findFirst({
    where: {
      repository: {
        contains: payload.repository.full_name,
      },
      provider: 'GITHUB',
    },
    include: {
      webhooks: {
        where: { provider: 'GITHUB', isActive: true },
      },
      pipelines: {
        where: { isActive: true },
        include: { stages: { include: { jobs: true } } },
      },
    },
  });

  if (!project || project.webhooks.length === 0) {
    return NextResponse.json(
      { error: 'No matching project or webhook found' },
      { status: 404 }
    );
  }

  // Verify signature
  const webhook = project.webhooks[0];
  const expectedSignature = `sha256=${crypto
    .createHmac('sha256', webhook.secret)
    .update(body)
    .digest('hex')}`;

  if (!crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  )) {
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 401 }
    );
  }

  // Update last delivery
  await prisma.webhook.update({
    where: { id: webhook.id },
    data: { lastDelivery: new Date() },
  });

  // Handle different events
  switch (event) {
    case 'push': {
      const branch = payload.ref.replace('refs/heads/', '');
      const commit = payload.head_commit;

      if (!commit) {
        return NextResponse.json({ message: 'No commit in push' });
      }

      // Find pipeline for this branch
      const pipeline = project.pipelines.find(p => {
        const config = p.config as any;
        const branches = config.branches || ['main', 'master'];
        return branches.includes(branch) || branches.includes('*');
      });

      if (!pipeline) {
        return NextResponse.json({ message: 'No pipeline configured for branch' });
      }

      // Create build
      const buildNumber = await getNextBuildNumber(project.id);
      const build = await prisma.build.create({
        data: {
          number: buildNumber,
          status: 'PENDING',
          branch,
          commit: commit.id,
          commitMessage: commit.message,
          author: commit.author.name,
          authorAvatar: payload.sender?.avatar_url,
          projectId: project.id,
          pipelineId: pipeline.id,
          triggeredBy: 'webhook',
        },
      });

      // Update GitHub commit status to pending
      await updateCommitStatus(project, commit.id, {
        state: 'pending',
        context: 'ci/build',
        description: 'Build started',
        target_url: `${process.env.NEXT_PUBLIC_APP_URL}/builds/${build.id}`,
      });

      // Trigger pipeline execution
      await triggerPipeline(build.id);

      return NextResponse.json({
        message: 'Build triggered',
        buildId: build.id,
        buildNumber,
      });
    }

    case 'pull_request': {
      const action = payload.action;
      if (!['opened', 'synchronize', 'reopened'].includes(action)) {
        return NextResponse.json({ message: 'PR event ignored' });
      }

      const branch = payload.pull_request.head.ref;
      const commit = payload.pull_request.head.sha;

      const pipeline = project.pipelines[0]; // Use default pipeline for PRs
      if (!pipeline) {
        return NextResponse.json({ message: 'No pipeline configured' });
      }

      const buildNumber = await getNextBuildNumber(project.id);
      const build = await prisma.build.create({
        data: {
          number: buildNumber,
          status: 'PENDING',
          branch,
          commit,
          commitMessage: payload.pull_request.title,
          author: payload.pull_request.user.login,
          authorAvatar: payload.pull_request.user.avatar_url,
          projectId: project.id,
          pipelineId: pipeline.id,
          triggeredBy: 'webhook',
        },
      });

      await updateCommitStatus(project, commit, {
        state: 'pending',
        context: 'ci/build',
        description: 'Build started',
        target_url: `${process.env.NEXT_PUBLIC_APP_URL}/builds/${build.id}`,
      });

      await triggerPipeline(build.id);

      return NextResponse.json({
        message: 'PR build triggered',
        buildId: build.id,
      });
    }

    default:
      return NextResponse.json({ message: `Event ${event} not handled` });
  }
}

async function getNextBuildNumber(projectId: string): Promise<number> {
  const lastBuild = await prisma.build.findFirst({
    where: { projectId },
    orderBy: { number: 'desc' },
    select: { number: true },
  });
  return (lastBuild?.number || 0) + 1;
}
```

### Environment Management Page

```tsx
// app/(dashboard)/environments/page.tsx
import { Suspense } from 'react';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { EnvironmentList } from '@/components/environments/environment-list';
import { CreateEnvironmentDialog } from '@/components/environments/create-environment-dialog';
import { Skeleton } from '@/components/ui/skeleton';

export const metadata = {
  title: 'Environments | CI/CD Dashboard',
};

export default async function EnvironmentsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Environments</h1>
          <p className="text-gray-500">
            Manage deployment environments across your projects
          </p>
        </div>
        <CreateEnvironmentDialog />
      </div>

      <Suspense fallback={<EnvironmentsSkeleton />}>
        <EnvironmentsData />
      </Suspense>
    </div>
  );
}

async function EnvironmentsData() {
  const environments = await prisma.environment.findMany({
    include: {
      project: { select: { name: true, slug: true } },
      deployments: {
        take: 1,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          status: true,
          version: true,
          commit: true,
          finishedAt: true,
        },
      },
    },
    orderBy: [
      { projectId: 'asc' },
      { name: 'asc' },
    ],
  });

  // Group by project
  const groupedEnvironments = environments.reduce((acc, env) => {
    const projectName = env.project.name;
    if (!acc[projectName]) acc[projectName] = [];
    acc[projectName].push(env);
    return acc;
  }, {} as Record<string, typeof environments>);

  return <EnvironmentList groupedEnvironments={groupedEnvironments} />;
}

function EnvironmentsSkeleton() {
  return (
    <div className="space-y-6">
      {[1, 2].map((i) => (
        <div key={i} className="space-y-4">
          <Skeleton className="h-6 w-48" />
          <div className="grid gap-4 md:grid-cols-3">
            {[1, 2, 3].map((j) => (
              <Skeleton key={j} className="h-48 rounded-lg" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
```

### Environment Card Component

```tsx
// components/environments/environment-card.tsx
'use client';

import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import {
  Globe, Lock, ExternalLink, RefreshCw,
  MoreVertical, Settings, Trash2, GitCommit
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { BuildStatusBadge } from '@/components/builds/build-status-badge';
import { RollbackDialog } from '@/components/deployments/rollback-dialog';

interface EnvironmentCardProps {
  environment: {
    id: string;
    name: string;
    slug: string;
    url?: string | null;
    isProtected: boolean;
    deployments: {
      id: string;
      status: string;
      version?: string | null;
      commit: string;
      finishedAt?: Date | null;
    }[];
  };
  projectSlug: string;
}

const environmentColors: Record<string, string> = {
  production: 'bg-red-100 text-red-700 border-red-200',
  staging: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  development: 'bg-green-100 text-green-700 border-green-200',
  dev: 'bg-green-100 text-green-700 border-green-200',
};

export function EnvironmentCard({ environment, projectSlug }: EnvironmentCardProps) {
  const [isRollbackOpen, setIsRollbackOpen] = useState(false);
  const lastDeployment = environment.deployments[0];

  return (
    <>
      <Card className="relative">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className={environmentColors[environment.slug] || 'bg-gray-100'}
              >
                {environment.name}
              </Badge>
              {environment.isProtected && (
                <Lock className="h-3.5 w-3.5 text-yellow-500" />
              )}
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsRollbackOpen(true)}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Rollback
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          {environment.url && (
            <a
              href={environment.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-sm text-blue-600 hover:underline"
            >
              <Globe className="h-3.5 w-3.5" />
              {new URL(environment.url).hostname}
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </CardHeader>

        <CardContent>
          {lastDeployment ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <BuildStatusBadge status={lastDeployment.status as any} />
                {lastDeployment.finishedAt && (
                  <span className="text-xs text-gray-500">
                    {formatDistanceToNow(new Date(lastDeployment.finishedAt), {
                      addSuffix: true,
                    })}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 text-sm">
                <GitCommit className="h-4 w-4 text-gray-400" />
                <code className="text-xs bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">
                  {lastDeployment.commit.slice(0, 7)}
                </code>
                {lastDeployment.version && (
                  <Badge variant="secondary" className="text-xs">
                    {lastDeployment.version}
                  </Badge>
                )}
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-500">No deployments yet</p>
          )}
        </CardContent>
      </Card>

      <RollbackDialog
        open={isRollbackOpen}
        onOpenChange={setIsRollbackOpen}
        environmentId={environment.id}
        environmentName={environment.name}
      />
    </>
  );
}
```

### Analytics API Route

```tsx
// app/api/analytics/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import {
  subDays, startOfDay, endOfDay, eachDayOfInterval, format
} from 'date-fns';

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const projectId = searchParams.get('projectId');
  const startDate = searchParams.get('startDate')
    ? new Date(searchParams.get('startDate')!)
    : subDays(new Date(), 29);
  const endDate = searchParams.get('endDate')
    ? new Date(searchParams.get('endDate')!)
    : new Date();

  const whereClause = {
    createdAt: {
      gte: startOfDay(startDate),
      lte: endOfDay(endDate),
    },
    ...(projectId && { projectId }),
  };

  // Fetch build statistics
  const [
    totalBuilds,
    buildsByStatus,
    avgBuildDuration,
    buildTrend,
    deploymentStats,
    mttrData,
  ] = await Promise.all([
    // Total builds
    prisma.build.count({ where: whereClause }),

    // Builds by status
    prisma.build.groupBy({
      by: ['status'],
      where: whereClause,
      _count: true,
    }),

    // Average build duration
    prisma.build.aggregate({
      where: {
        ...whereClause,
        status: 'SUCCESS',
        duration: { not: null },
      },
      _avg: { duration: true },
    }),

    // Build trend over time
    prisma.build.groupBy({
      by: ['createdAt'],
      where: whereClause,
      _count: true,
      orderBy: { createdAt: 'asc' },
    }),

    // Deployment statistics
    prisma.deployment.groupBy({
      by: ['status'],
      where: {
        createdAt: whereClause.createdAt,
        ...(projectId && { projectId }),
      },
      _count: true,
    }),

    // MTTR calculation (time from failure to next success)
    calculateMTTR(projectId, startDate, endDate),
  ]);

  // Calculate success rate
  const successCount = buildsByStatus.find(b => b.status === 'SUCCESS')?._count || 0;
  const failedCount = buildsByStatus.find(b => b.status === 'FAILED')?._count || 0;
  const successRate = totalBuilds > 0
    ? ((successCount / totalBuilds) * 100).toFixed(1)
    : 0;

  // Fill in daily data for chart
  const dateRange = eachDayOfInterval({ start: startDate, end: endDate });
  const dailyBuilds = dateRange.map(date => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayBuilds = buildTrend.filter(
      b => format(new Date(b.createdAt), 'yyyy-MM-dd') === dateStr
    );
    return {
      date: dateStr,
      builds: dayBuilds.reduce((sum, b) => sum + b._count, 0),
    };
  });

  // Recent failed builds for debugging
  const recentFailures = await prisma.build.findMany({
    where: {
      ...whereClause,
      status: 'FAILED',
    },
    select: {
      id: true,
      number: true,
      branch: true,
      commit: true,
      commitMessage: true,
      finishedAt: true,
      project: { select: { name: true } },
    },
    orderBy: { finishedAt: 'desc' },
    take: 5,
  });

  return NextResponse.json({
    summary: {
      totalBuilds,
      successRate: Number(successRate),
      avgBuildDuration: Math.round(avgBuildDuration._avg.duration || 0),
      mttr: mttrData.avgMTTR,
    },
    buildsByStatus: buildsByStatus.reduce((acc, b) => {
      acc[b.status] = b._count;
      return acc;
    }, {} as Record<string, number>),
    deploymentsByStatus: deploymentStats.reduce((acc, d) => {
      acc[d.status] = d._count;
      return acc;
    }, {} as Record<string, number>),
    dailyBuilds,
    recentFailures,
  });
}

async function calculateMTTR(
  projectId: string | null,
  startDate: Date,
  endDate: Date
): Promise<{ avgMTTR: number; incidents: number }> {
  // Find all failures and their recovery times
  const failures = await prisma.build.findMany({
    where: {
      status: 'FAILED',
      createdAt: { gte: startDate, lte: endDate },
      ...(projectId && { projectId }),
    },
    select: {
      id: true,
      finishedAt: true,
      projectId: true,
      pipelineId: true,
    },
    orderBy: { finishedAt: 'asc' },
  });

  let totalRecoveryTime = 0;
  let incidentCount = 0;

  for (const failure of failures) {
    // Find the next successful build
    const recovery = await prisma.build.findFirst({
      where: {
        projectId: failure.projectId,
        pipelineId: failure.pipelineId,
        status: 'SUCCESS',
        finishedAt: { gt: failure.finishedAt },
      },
      orderBy: { finishedAt: 'asc' },
      select: { finishedAt: true },
    });

    if (recovery && failure.finishedAt && recovery.finishedAt) {
      const recoveryTime =
        (recovery.finishedAt.getTime() - failure.finishedAt.getTime()) / 1000 / 60;
      totalRecoveryTime += recoveryTime;
      incidentCount++;
    }
  }

  return {
    avgMTTR: incidentCount > 0 ? Math.round(totalRecoveryTime / incidentCount) : 0,
    incidents: incidentCount,
  };
}
```

### Notification Service

```tsx
// lib/notifications.ts
import { prisma } from '@/lib/prisma';

interface NotificationPayload {
  type: 'BUILD_SUCCESS' | 'BUILD_FAILED' | 'DEPLOYMENT_SUCCESS' | 'DEPLOYMENT_FAILED';
  projectId: string;
  buildId?: string;
  deploymentId?: string;
  message: string;
  details?: Record<string, any>;
}

export async function sendNotification(payload: NotificationPayload) {
  const project = await prisma.project.findUnique({
    where: { id: payload.projectId },
    select: { name: true, slug: true },
  });

  if (!project) return;

  // Get notification settings (would come from settings table)
  const settings = await getNotificationSettings(payload.projectId);

  // Slack notification
  if (settings.slack?.enabled) {
    await sendSlackNotification(settings.slack.webhookUrl, {
      project: project.name,
      ...payload,
    });
  }

  // Email notification
  if (settings.email?.enabled) {
    await sendEmailNotification(settings.email.recipients, {
      project: project.name,
      ...payload,
    });
  }

  // Discord notification
  if (settings.discord?.enabled) {
    await sendDiscordNotification(settings.discord.webhookUrl, {
      project: project.name,
      ...payload,
    });
  }
}

async function sendSlackNotification(
  webhookUrl: string,
  payload: NotificationPayload & { project: string }
) {
  const colors: Record<string, string> = {
    BUILD_SUCCESS: '#22c55e',
    BUILD_FAILED: '#ef4444',
    DEPLOYMENT_SUCCESS: '#3b82f6',
    DEPLOYMENT_FAILED: '#f97316',
  };

  const icons: Record<string, string> = {
    BUILD_SUCCESS: ':white_check_mark:',
    BUILD_FAILED: ':x:',
    DEPLOYMENT_SUCCESS: ':rocket:',
    DEPLOYMENT_FAILED: ':warning:',
  };

  const buildUrl = payload.buildId
    ? `${process.env.NEXT_PUBLIC_APP_URL}/builds/${payload.buildId}`
    : undefined;
  const deploymentUrl = payload.deploymentId
    ? `${process.env.NEXT_PUBLIC_APP_URL}/deployments/${payload.deploymentId}`
    : undefined;

  await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      attachments: [
        {
          color: colors[payload.type],
          blocks: [
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: `${icons[payload.type]} *${payload.project}*\n${payload.message}`,
              },
            },
            ...(payload.details ? [
              {
                type: 'section',
                fields: Object.entries(payload.details).map(([key, value]) => ({
                  type: 'mrkdwn',
                  text: `*${key}:*\n${value}`,
                })),
              },
            ] : []),
            ...(buildUrl || deploymentUrl ? [
              {
                type: 'actions',
                elements: [
                  ...(buildUrl ? [{
                    type: 'button',
                    text: { type: 'plain_text', text: 'View Build' },
                    url: buildUrl,
                  }] : []),
                  ...(deploymentUrl ? [{
                    type: 'button',
                    text: { type: 'plain_text', text: 'View Deployment' },
                    url: deploymentUrl,
                  }] : []),
                ],
              },
            ] : []),
          ],
        },
      ],
    }),
  });
}

async function sendEmailNotification(
  recipients: string[],
  payload: NotificationPayload & { project: string }
) {
  // Use your email service (Resend, SendGrid, etc.)
  const { Resend } = await import('resend');
  const resend = new Resend(process.env.RESEND_API_KEY);

  const subjects: Record<string, string> = {
    BUILD_SUCCESS: `Build passed - ${payload.project}`,
    BUILD_FAILED: `Build failed - ${payload.project}`,
    DEPLOYMENT_SUCCESS: `Deployment successful - ${payload.project}`,
    DEPLOYMENT_FAILED: `Deployment failed - ${payload.project}`,
  };

  await resend.emails.send({
    from: 'CI/CD Dashboard <noreply@yourdomain.com>',
    to: recipients,
    subject: subjects[payload.type],
    html: generateEmailTemplate(payload),
  });
}

async function sendDiscordNotification(
  webhookUrl: string,
  payload: NotificationPayload & { project: string }
) {
  const colors: Record<string, number> = {
    BUILD_SUCCESS: 0x22c55e,
    BUILD_FAILED: 0xef4444,
    DEPLOYMENT_SUCCESS: 0x3b82f6,
    DEPLOYMENT_FAILED: 0xf97316,
  };

  await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      embeds: [
        {
          title: payload.project,
          description: payload.message,
          color: colors[payload.type],
          fields: payload.details
            ? Object.entries(payload.details).map(([name, value]) => ({
                name,
                value: String(value),
                inline: true,
              }))
            : [],
          timestamp: new Date().toISOString(),
        },
      ],
    }),
  });
}

function generateEmailTemplate(
  payload: NotificationPayload & { project: string }
): string {
  return `
    <!DOCTYPE html>
    <html>
    <body style="font-family: sans-serif; padding: 20px;">
      <h2>${payload.project}</h2>
      <p>${payload.message}</p>
      ${payload.details ? `
        <table style="border-collapse: collapse; margin-top: 16px;">
          ${Object.entries(payload.details).map(([key, value]) => `
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">${key}</td>
              <td style="padding: 8px; border: 1px solid #ddd;">${value}</td>
            </tr>
          `).join('')}
        </table>
      ` : ''}
      <p style="margin-top: 16px;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL}">View Dashboard</a>
      </p>
    </body>
    </html>
  `;
}

async function getNotificationSettings(projectId: string) {
  // In a real app, fetch from database
  return {
    slack: {
      enabled: !!process.env.SLACK_WEBHOOK_URL,
      webhookUrl: process.env.SLACK_WEBHOOK_URL || '',
    },
    email: {
      enabled: false,
      recipients: [],
    },
    discord: {
      enabled: false,
      webhookUrl: '',
    },
  };
}
```

### Socket.io Real-Time Setup

```tsx
// lib/socket.ts
import { Server as SocketServer } from 'socket.io';
import { Server as HTTPServer } from 'http';

let io: SocketServer | null = null;

export function initializeSocket(httpServer: HTTPServer) {
  io = new SocketServer(httpServer, {
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL,
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // Handle room subscriptions
    socket.on('subscribe', (channel: string) => {
      socket.join(channel);
      console.log(`${socket.id} joined ${channel}`);
    });

    socket.on('unsubscribe', (channel: string) => {
      socket.leave(channel);
      console.log(`${socket.id} left ${channel}`);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  return io;
}

export function getIO(): SocketServer {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
}

// Emit build status updates
export function emitBuildUpdate(buildId: string, status: string, data?: any) {
  if (!io) return;
  io.to(`build:${buildId}`).emit('build:update', { buildId, status, ...data });
}

// Emit log messages
export function emitBuildLog(buildId: string, log: any) {
  if (!io) return;
  io.to(`build:${buildId}:logs`).emit('log', log);
}

// Emit job status updates
export function emitJobUpdate(buildId: string, jobId: string, status: string, data?: any) {
  if (!io) return;
  io.to(`build:${buildId}`).emit('job:update', { buildId, jobId, status, ...data });
}

// Emit deployment updates
export function emitDeploymentUpdate(deploymentId: string, status: string, data?: any) {
  if (!io) return;
  io.to(`deployment:${deploymentId}`).emit('deployment:update', {
    deploymentId,
    status,
    ...data
  });
}

// hooks/use-socket.ts
'use client';

import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function useSocket() {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!socket) {
      socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || '', {
        transports: ['websocket'],
      });
    }

    socket.on('connect', () => setIsConnected(true));
    socket.on('disconnect', () => setIsConnected(false));

    return () => {
      // Don't disconnect on unmount, keep connection alive
    };
  }, []);

  return socket;
}
```

## Testing

### Unit Tests

```tsx
// __tests__/components/build-status-badge.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BuildStatusBadge } from '@/components/builds/build-status-badge';

describe('BuildStatusBadge', () => {
  it.each([
    ['PENDING', 'Pending'],
    ['RUNNING', 'Running'],
    ['SUCCESS', 'Passed'],
    ['FAILED', 'Failed'],
    ['CANCELLED', 'Cancelled'],
    ['SKIPPED', 'Skipped'],
  ])('renders %s status correctly', (status, label) => {
    render(<BuildStatusBadge status={status as any} />);
    expect(screen.getByText(label)).toBeInTheDocument();
  });

  it('hides label when showLabel is false', () => {
    render(<BuildStatusBadge status="SUCCESS" showLabel={false} />);
    expect(screen.queryByText('Passed')).not.toBeInTheDocument();
  });

  it('applies running animation for RUNNING status', () => {
    render(<BuildStatusBadge status="RUNNING" showLabel={false} />);
    const icon = screen.getByRole('img', { hidden: true }) ||
                 document.querySelector('svg');
    expect(icon).toHaveClass('animate-spin');
  });
});
```

### Integration Tests

```tsx
// __tests__/api/webhooks/github.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '@/app/api/webhooks/github/route';
import { NextRequest } from 'next/server';
import crypto from 'crypto';

vi.mock('@/lib/prisma', () => ({
  prisma: {
    project: {
      findFirst: vi.fn(),
    },
    webhook: {
      update: vi.fn(),
    },
    build: {
      create: vi.fn(),
      findFirst: vi.fn(),
    },
  },
}));

vi.mock('@/lib/pipeline', () => ({
  triggerPipeline: vi.fn(),
}));

vi.mock('@/lib/github', () => ({
  updateCommitStatus: vi.fn(),
}));

describe('GitHub Webhook Handler', () => {
  const secret = 'test-secret';

  function createRequest(payload: any, event: string = 'push') {
    const body = JSON.stringify(payload);
    const signature = `sha256=${crypto
      .createHmac('sha256', secret)
      .update(body)
      .digest('hex')}`;

    return new NextRequest('http://localhost/api/webhooks/github', {
      method: 'POST',
      headers: {
        'x-hub-signature-256': signature,
        'x-github-event': event,
        'x-github-delivery': 'test-delivery-id',
        'content-type': 'application/json',
      },
      body,
    });
  }

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('rejects requests without signature', async () => {
    const request = new NextRequest('http://localhost/api/webhooks/github', {
      method: 'POST',
      headers: { 'x-github-event': 'push' },
      body: '{}',
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  it('rejects requests with invalid signature', async () => {
    const { prisma } = await import('@/lib/prisma');
    (prisma.project.findFirst as any).mockResolvedValue({
      id: '1',
      webhooks: [{ id: '1', secret: 'wrong-secret' }],
      pipelines: [],
    });

    const request = createRequest({
      repository: { full_name: 'org/repo', clone_url: 'https://github.com/org/repo.git' },
    });

    const response = await POST(request);
    expect(response.status).toBe(401);
  });

  it('triggers build on push event', async () => {
    const { prisma } = await import('@/lib/prisma');
    const { triggerPipeline } = await import('@/lib/pipeline');

    (prisma.project.findFirst as any).mockResolvedValue({
      id: 'project-1',
      webhooks: [{ id: 'webhook-1', secret }],
      pipelines: [{ id: 'pipeline-1', config: { branches: ['main'] } }],
    });

    (prisma.build.findFirst as any).mockResolvedValue({ number: 5 });
    (prisma.build.create as any).mockResolvedValue({ id: 'build-1' });

    const request = createRequest({
      ref: 'refs/heads/main',
      repository: {
        full_name: 'org/repo',
        clone_url: 'https://github.com/org/repo.git',
      },
      head_commit: {
        id: 'abc123',
        message: 'Test commit',
        author: { name: 'Test User' },
      },
      sender: { avatar_url: 'https://avatar.url' },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.buildId).toBe('build-1');
    expect(triggerPipeline).toHaveBeenCalledWith('build-1');
  });
});
```

### E2E Tests

```typescript
// e2e/cicd-dashboard.spec.ts
import { test, expect } from '@playwright/test';

test.describe('CI/CD Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'password');
    await page.click('button[type="submit"]');
    await page.waitForURL('/');
  });

  test('displays pipeline overview', async ({ page }) => {
    await page.goto('/pipelines');
    await expect(page.locator('h1')).toContainText('Pipelines');
    await expect(page.locator('[data-testid="pipeline-card"]')).toBeVisible();
  });

  test('shows build details with logs', async ({ page }) => {
    await page.goto('/builds');
    await page.click('[data-testid="build-row"]:first-child');

    await expect(page.locator('[data-testid="log-viewer"]')).toBeVisible();
    await expect(page.locator('[data-testid="build-status"]')).toBeVisible();
  });

  test('triggers manual build', async ({ page }) => {
    await page.goto('/pipelines');
    await page.click('[data-testid="trigger-build-button"]');

    await page.selectOption('[data-testid="branch-select"]', 'main');
    await page.click('[data-testid="confirm-trigger"]');

    await expect(page.locator('.toast-success')).toContainText('Build triggered');
  });

  test('environment deployment flow', async ({ page }) => {
    await page.goto('/environments');

    await page.click('[data-testid="env-staging"] [data-testid="deploy-button"]');
    await page.click('[data-testid="confirm-deploy"]');

    await expect(page.locator('[data-testid="deployment-status"]')).toContainText('In Progress');
  });

  test('analytics page loads metrics', async ({ page }) => {
    await page.goto('/analytics');

    await expect(page.locator('[data-testid="success-rate"]')).toBeVisible();
    await expect(page.locator('[data-testid="build-duration-chart"]')).toBeVisible();
    await expect(page.locator('[data-testid="mttr-card"]')).toBeVisible();
  });
});
```

## Error Handling

```tsx
// lib/errors.ts
export class CICDError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = 'CICDError';
  }
}

export const ErrorCodes = {
  BUILD_TRIGGER_FAILED: 'BUILD_TRIGGER_FAILED',
  WEBHOOK_VERIFICATION_FAILED: 'WEBHOOK_VERIFICATION_FAILED',
  DEPLOYMENT_FAILED: 'DEPLOYMENT_FAILED',
  ROLLBACK_FAILED: 'ROLLBACK_FAILED',
  INVALID_PIPELINE_CONFIG: 'INVALID_PIPELINE_CONFIG',
  ENVIRONMENT_PROTECTED: 'ENVIRONMENT_PROTECTED',
  RATE_LIMITED: 'RATE_LIMITED',
} as const;

// app/error.tsx
'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import * as Sentry from '@sentry/nextjs';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
        <p className="text-gray-600 mb-4">
          An error occurred while loading this page.
        </p>
        {error.digest && (
          <p className="text-sm text-gray-500 mb-4 font-mono">
            Error ID: {error.digest}
          </p>
        )}
        <div className="flex gap-4 justify-center">
          <Button onClick={reset} variant="default">
            <RefreshCw className="mr-2 h-4 w-4" />
            Try again
          </Button>
          <Button variant="outline" asChild>
            <a href="/">
              <Home className="mr-2 h-4 w-4" />
              Go home
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}
```

## Accessibility

```tsx
// Accessible pipeline visualization
export function AccessiblePipelineVisualization({ stages }: Props) {
  return (
    <div role="region" aria-label="Pipeline stages">
      <h2 className="sr-only">Pipeline Progress</h2>

      <div className="flex" role="list">
        {stages.map((stage, index) => (
          <div
            key={stage.id}
            role="listitem"
            aria-label={`Stage ${index + 1}: ${stage.name}`}
          >
            <div
              role="group"
              aria-label={`Jobs in ${stage.name}`}
            >
              {stage.jobs.map(job => (
                <button
                  key={job.id}
                  aria-label={`Job: ${job.name}, Status: ${job.status}`}
                  aria-pressed={false}
                  className="focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <span aria-hidden="true">
                    <BuildStatusBadge status={job.status} showLabel={false} />
                  </span>
                  <span>{job.name}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Screen reader summary */}
      <div className="sr-only" role="status" aria-live="polite">
        Pipeline has {stages.length} stages.
        {getStagesSummary(stages)}
      </div>
    </div>
  );
}

function getStagesSummary(stages: Stage[]): string {
  const completed = stages.filter(s =>
    s.jobs.every(j => j.status === 'SUCCESS')
  ).length;
  const failed = stages.filter(s =>
    s.jobs.some(j => j.status === 'FAILED')
  ).length;
  const running = stages.filter(s =>
    s.jobs.some(j => j.status === 'RUNNING')
  ).length;

  return `${completed} completed, ${failed} failed, ${running} running.`;
}
```

## Security

```tsx
// lib/security.ts
import crypto from 'crypto';
import { z } from 'zod';

// Webhook signature verification
export function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string,
  algorithm: 'sha256' | 'sha1' = 'sha256'
): boolean {
  const expectedSignature = `${algorithm}=${crypto
    .createHmac(algorithm, secret)
    .update(payload)
    .digest('hex')}`;

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

// Pipeline config validation
export const pipelineConfigSchema = z.object({
  name: z.string().min(1).max(100),
  branches: z.array(z.string()).optional(),
  stages: z.array(z.object({
    name: z.string().min(1),
    jobs: z.array(z.object({
      name: z.string().min(1),
      script: z.array(z.string()),
      dependencies: z.array(z.string()).optional(),
      allowFailure: z.boolean().optional(),
      timeout: z.number().min(60).max(86400).optional(),
    })),
  })),
});

// Environment variable encryption
export function encryptEnvVariables(
  variables: Record<string, string>
): string {
  const key = Buffer.from(process.env.ENCRYPTION_KEY!, 'hex');
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

  const encrypted = Buffer.concat([
    cipher.update(JSON.stringify(variables), 'utf8'),
    cipher.final(),
  ]);

  const authTag = cipher.getAuthTag();

  return Buffer.concat([iv, authTag, encrypted]).toString('base64');
}

export function decryptEnvVariables(
  encrypted: string
): Record<string, string> {
  const key = Buffer.from(process.env.ENCRYPTION_KEY!, 'hex');
  const data = Buffer.from(encrypted, 'base64');

  const iv = data.subarray(0, 16);
  const authTag = data.subarray(16, 32);
  const content = data.subarray(32);

  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(authTag);

  const decrypted = Buffer.concat([
    decipher.update(content),
    decipher.final(),
  ]);

  return JSON.parse(decrypted.toString('utf8'));
}
```

## Performance

```tsx
// Optimized build list with virtual scrolling
import { useVirtualizer } from '@tanstack/react-virtual';

export function VirtualizedBuildList({ builds }: { builds: Build[] }) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: builds.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 72,
    overscan: 5,
  });

  return (
    <div ref={parentRef} className="h-[600px] overflow-auto">
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map((virtualRow) => (
          <div
            key={virtualRow.key}
            style={{
              position: 'absolute',
              top: 0,
              transform: `translateY(${virtualRow.start}px)`,
              width: '100%',
            }}
          >
            <BuildRow build={builds[virtualRow.index]} />
          </div>
        ))}
      </div>
    </div>
  );
}

// Cached analytics queries
import { unstable_cache } from 'next/cache';

export const getCachedAnalytics = unstable_cache(
  async (projectId: string, startDate: string, endDate: string) => {
    return prisma.dailyMetrics.findMany({
      where: {
        projectId,
        date: { gte: new Date(startDate), lte: new Date(endDate) },
      },
      orderBy: { date: 'asc' },
    });
  },
  ['analytics'],
  { revalidate: 300, tags: ['analytics'] }
);
```

## Environment Variables

```bash
# .env.example

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/cicd"

# Authentication
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# Socket.io
NEXT_PUBLIC_SOCKET_URL="http://localhost:3001"

# GitHub Integration
GITHUB_APP_ID=""
GITHUB_PRIVATE_KEY=""
GITHUB_WEBHOOK_SECRET=""

# GitLab Integration
GITLAB_TOKEN=""
GITLAB_WEBHOOK_SECRET=""

# Notifications
SLACK_WEBHOOK_URL=""
RESEND_API_KEY=""

# Security
ENCRYPTION_KEY="" # 32-byte hex string for env var encryption

# Monitoring
SENTRY_DSN=""
NEXT_PUBLIC_SENTRY_DSN=""
```

## Deployment Checklist

- [ ] Database migrations applied
- [ ] Environment variables configured
- [ ] Webhook secrets generated and stored
- [ ] Socket.io server configured
- [ ] Notification integrations tested
- [ ] SSL certificates configured
- [ ] Rate limiting enabled
- [ ] Error tracking (Sentry) configured
- [ ] Backup strategy in place
- [ ] Monitoring dashboards set up

## Related Recipes

- [r-analytics-dashboard](./analytics-dashboard.md) - General analytics patterns
- [r-realtime-app](./realtime-app.md) - WebSocket implementation
- [r-status-page](./status-page.md) - Service status monitoring

## Changelog

### v1.0.0 (2025-01-18)

- Initial implementation with pipeline visualization
- Real-time build log streaming via WebSocket
- GitHub/GitLab webhook integration
- Environment management with rollback support
- Build metrics and MTTR analytics
- Slack, email, and Discord notifications
- Comprehensive test coverage
