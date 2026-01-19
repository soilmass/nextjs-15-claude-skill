---
id: pt-content-moderation
name: Content Moderation
version: 1.0.0
layer: L5
category: safety
description: User content moderation with automated filtering and manual review workflows
tags: [moderation, safety, content, filtering, review, next15]
composes: []
dependencies: []
formula: "ContentModeration = AutomatedFiltering + ManualReview + ActionHistory + UserFeedback"
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# Content Moderation

## When to Use

- User-generated content platforms
- Comment systems
- Social media applications
- Forum and community sites
- Review platforms

## Composition Diagram

```
Moderation Flow
===============

+------------------------------------------+
|  Content Submission                      |
|  - User posts content                    |
|  - Metadata captured                     |
+------------------------------------------+
              |
              v
+------------------------------------------+
|  Automated Screening                     |
|  - Keyword filtering                     |
|  - AI moderation API                     |
|  - Spam detection                        |
+------------------------------------------+
              |
    +---------+---------+---------+
    |         |                   |
    v         v                   v
[Approved] [Flagged]         [Rejected]
    |         |                   |
    v         v                   v
+--------+ +------------------+ +--------+
| Publish| | Manual Review    | | Notify |
|        | | Queue            | | User   |
+--------+ +------------------+ +--------+
```

## Database Schema

```prisma
// prisma/schema.prisma
model Content {
  id            String    @id @default(cuid())
  type          String    // post, comment, review
  body          String    @db.Text
  authorId      String
  author        User      @relation(fields: [authorId], references: [id])
  status        String    @default("pending") // pending, approved, rejected, flagged
  moderationScore Float?
  moderationFlags Json?   // { profanity: 0.8, spam: 0.2 }
  moderatedBy   String?
  moderatedAt   DateTime?
  moderationNote String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  reports       ContentReport[]
  moderationLog ModerationLog[]

  @@index([status, createdAt])
  @@index([authorId])
}

model ContentReport {
  id        String   @id @default(cuid())
  contentId String
  content   Content  @relation(fields: [contentId], references: [id])
  reporterId String
  reporter  User     @relation(fields: [reporterId], references: [id])
  reason    String   // spam, harassment, hate_speech, etc.
  details   String?
  status    String   @default("pending")
  createdAt DateTime @default(now())

  @@unique([contentId, reporterId])
  @@index([status])
}

model ModerationLog {
  id          String   @id @default(cuid())
  contentId   String
  content     Content  @relation(fields: [contentId], references: [id])
  moderatorId String
  moderator   User     @relation(fields: [moderatorId], references: [id])
  action      String   // approve, reject, flag, escalate
  reason      String?
  previousStatus String
  newStatus   String
  createdAt   DateTime @default(now())

  @@index([contentId])
}
```

## Automated Moderation Service

```typescript
// lib/moderation/auto-moderate.ts
import { prisma } from '@/lib/db';

interface ModerationResult {
  approved: boolean;
  flags: Record<string, number>;
  score: number;
  action: 'approve' | 'flag' | 'reject';
}

const BANNED_WORDS = ['spam', 'scam']; // Simplified example
const FLAG_THRESHOLD = 0.5;
const REJECT_THRESHOLD = 0.8;

export async function autoModerate(content: string): Promise<ModerationResult> {
  const flags: Record<string, number> = {};
  let totalScore = 0;

  // Keyword filtering
  const lowerContent = content.toLowerCase();
  const hasBannedWords = BANNED_WORDS.some((word) => lowerContent.includes(word));
  if (hasBannedWords) {
    flags.banned_words = 1.0;
    totalScore += 1.0;
  }

  // AI moderation (using OpenAI Moderation API)
  try {
    const aiResult = await callModerationAPI(content);
    Object.entries(aiResult.categories).forEach(([category, flagged]) => {
      if (flagged) {
        flags[category] = aiResult.category_scores[category];
        totalScore += aiResult.category_scores[category];
      }
    });
  } catch (error) {
    console.error('AI moderation failed:', error);
  }

  // Spam detection
  const spamScore = detectSpam(content);
  if (spamScore > 0.3) {
    flags.spam = spamScore;
    totalScore += spamScore;
  }

  // Determine action
  const avgScore = Object.keys(flags).length > 0 ? totalScore / Object.keys(flags).length : 0;

  let action: 'approve' | 'flag' | 'reject';
  if (avgScore >= REJECT_THRESHOLD) {
    action = 'reject';
  } else if (avgScore >= FLAG_THRESHOLD) {
    action = 'flag';
  } else {
    action = 'approve';
  }

  return {
    approved: action === 'approve',
    flags,
    score: avgScore,
    action,
  };
}

async function callModerationAPI(content: string) {
  const response = await fetch('https://api.openai.com/v1/moderations', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ input: content }),
  });

  const data = await response.json();
  return data.results[0];
}

function detectSpam(content: string): number {
  let score = 0;

  // Multiple URLs
  const urlCount = (content.match(/https?:\/\//g) || []).length;
  if (urlCount > 3) score += 0.3;

  // ALL CAPS
  const capsRatio = (content.match(/[A-Z]/g) || []).length / content.length;
  if (capsRatio > 0.5) score += 0.2;

  // Repeated characters
  if (/(.)\1{4,}/.test(content)) score += 0.3;

  return Math.min(score, 1);
}
```

## Content Submission with Moderation

```typescript
// app/actions/content.ts
'use server';

import { prisma } from '@/lib/db';
import { auth } from '@/auth';
import { autoModerate } from '@/lib/moderation/auto-moderate';

export async function submitContent(formData: FormData) {
  const session = await auth();
  if (!session?.user) {
    return { error: 'Unauthorized' };
  }

  const body = formData.get('body') as string;
  const type = formData.get('type') as string;

  // Run auto-moderation
  const modResult = await autoModerate(body);

  // Determine initial status
  const status = modResult.action === 'approve'
    ? 'approved'
    : modResult.action === 'reject'
      ? 'rejected'
      : 'flagged';

  const content = await prisma.content.create({
    data: {
      type,
      body,
      authorId: session.user.id,
      status,
      moderationScore: modResult.score,
      moderationFlags: modResult.flags,
    },
  });

  if (status === 'rejected') {
    return {
      error: 'Your content could not be posted as it violates our community guidelines.',
    };
  }

  if (status === 'flagged') {
    return {
      success: true,
      message: 'Your content has been submitted and is pending review.',
      pending: true,
    };
  }

  return { success: true, content };
}
```

## Moderation Queue Component

```typescript
// components/moderation/moderation-queue.tsx
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Check, X, Flag, AlertTriangle } from 'lucide-react';
import { useState } from 'react';

export function ModerationQueue() {
  const queryClient = useQueryClient();

  const { data: items, isLoading } = useQuery({
    queryKey: ['moderation-queue'],
    queryFn: () => fetch('/api/moderation/queue').then((r) => r.json()),
  });

  const moderateMutation = useMutation({
    mutationFn: ({ id, action, note }: { id: string; action: string; note?: string }) =>
      fetch(`/api/moderation/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, note }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['moderation-queue'] });
    },
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Moderation Queue ({items?.data?.length || 0})</h2>

      {items?.data?.map((item: any) => (
        <ModerationCard
          key={item.id}
          item={item}
          onModerate={(action, note) =>
            moderateMutation.mutate({ id: item.id, action, note })
          }
        />
      ))}
    </div>
  );
}

function ModerationCard({
  item,
  onModerate,
}: {
  item: any;
  onModerate: (action: string, note?: string) => void;
}) {
  const [note, setNote] = useState('');
  const flags = item.moderationFlags || {};

  return (
    <div className="p-4 border rounded-lg space-y-4">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm text-muted-foreground">
            {item.type} by {item.author.name}
          </p>
          <p className="text-sm text-muted-foreground">
            {new Date(item.createdAt).toLocaleString()}
          </p>
        </div>
        <div className="flex gap-1">
          {Object.entries(flags).map(([flag, score]: [string, any]) => (
            <Badge key={flag} variant="destructive">
              {flag}: {(score * 100).toFixed(0)}%
            </Badge>
          ))}
        </div>
      </div>

      <div className="p-3 bg-muted rounded">{item.body}</div>

      {item.reports?.length > 0 && (
        <div className="text-sm">
          <p className="font-medium flex items-center gap-1">
            <AlertTriangle className="h-4 w-4" />
            {item.reports.length} user reports
          </p>
        </div>
      )}

      <Textarea
        placeholder="Moderation note (optional)..."
        value={note}
        onChange={(e) => setNote(e.target.value)}
        rows={2}
      />

      <div className="flex gap-2">
        <Button
          variant="default"
          onClick={() => onModerate('approve', note)}
          className="flex-1"
        >
          <Check className="h-4 w-4 mr-2" />
          Approve
        </Button>
        <Button
          variant="destructive"
          onClick={() => onModerate('reject', note)}
          className="flex-1"
        >
          <X className="h-4 w-4 mr-2" />
          Reject
        </Button>
        <Button
          variant="outline"
          onClick={() => onModerate('escalate', note)}
        >
          <Flag className="h-4 w-4 mr-2" />
          Escalate
        </Button>
      </div>
    </div>
  );
}
```

## Report Content Component

```typescript
// components/moderation/report-button.tsx
'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Flag } from 'lucide-react';
import { toast } from 'sonner';

const REPORT_REASONS = [
  { value: 'spam', label: 'Spam or misleading' },
  { value: 'harassment', label: 'Harassment or bullying' },
  { value: 'hate_speech', label: 'Hate speech' },
  { value: 'violence', label: 'Violence or threats' },
  { value: 'other', label: 'Other' },
];

export function ReportButton({ contentId }: { contentId: string }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');

  const reportMutation = useMutation({
    mutationFn: () =>
      fetch(`/api/content/${contentId}/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason, details }),
      }),
    onSuccess: () => {
      toast.success('Report submitted. Thank you for helping keep our community safe.');
      setOpen(false);
    },
  });

  return (
    <>
      <Button variant="ghost" size="sm" onClick={() => setOpen(true)}>
        <Flag className="h-4 w-4" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Report Content</DialogTitle>
          </DialogHeader>

          <RadioGroup value={reason} onValueChange={setReason}>
            {REPORT_REASONS.map((r) => (
              <div key={r.value} className="flex items-center space-x-2">
                <RadioGroupItem value={r.value} id={r.value} />
                <label htmlFor={r.value}>{r.label}</label>
              </div>
            ))}
          </RadioGroup>

          <Textarea
            placeholder="Additional details (optional)..."
            value={details}
            onChange={(e) => setDetails(e.target.value)}
          />

          <Button
            onClick={() => reportMutation.mutate()}
            disabled={!reason || reportMutation.isPending}
          >
            Submit Report
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
}
```

## Anti-patterns

### Don't Rely Only on Automated Moderation

```typescript
// BAD - Auto-reject without review
if (moderationScore > 0.5) {
  await prisma.content.delete({ where: { id } });
}

// GOOD - Flag for review
if (moderationScore > 0.5) {
  await prisma.content.update({
    where: { id },
    data: { status: 'flagged' },
  });
}
```

## Related Skills

- [rate-limiting](./rate-limiting.md)
- [spam-detection](./spam-detection.md)

---

## Changelog

### 1.0.0 (2025-01-18)
- Initial implementation
- Automated screening
- Manual review queue
- User reporting
