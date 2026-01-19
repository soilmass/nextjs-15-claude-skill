---
id: pt-satisfaction-survey
name: Satisfaction Survey
version: 1.0.0
layer: L5
category: features
description: Collect user feedback with NPS, CSAT, and custom survey forms
tags: [features, surveys, feedback, nps, csat, next15, react19]
composes:
  - ../atoms/input-radio.md
  - ../atoms/input-textarea.md
dependencies: []
formula: "SatisfactionSurvey = SurveyTrigger + QuestionRenderer + ResponseCollector + Analytics"
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# Satisfaction Survey

## Overview

Satisfaction surveys collect user feedback through NPS (Net Promoter Score), CSAT (Customer Satisfaction), and custom surveys. This pattern covers survey display, response collection, and basic analytics.

## When to Use

- Post-purchase feedback
- Feature satisfaction measurement
- Support ticket resolution feedback
- Periodic user satisfaction checks
- Product NPS tracking

## Survey Schema

```prisma
// prisma/schema.prisma
model Survey {
  id          String       @id @default(cuid())
  name        String
  type        SurveyType
  description String?
  questions   Json         // Array of question objects
  active      Boolean      @default(true)
  trigger     SurveyTrigger
  triggerConfig Json?      // e.g., { daysAfterSignup: 7 }
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt

  responses SurveyResponse[]

  @@map("surveys")
}

enum SurveyType {
  NPS
  CSAT
  CUSTOM
}

enum SurveyTrigger {
  MANUAL
  PAGE_VIEW
  TIME_BASED
  EVENT
  SCHEDULED
}

model SurveyResponse {
  id        String   @id @default(cuid())
  surveyId  String
  survey    Survey   @relation(fields: [surveyId], references: [id])
  userId    String?
  sessionId String?
  answers   Json     // { questionId: answer }
  score     Int?     // For NPS/CSAT
  feedback  String?
  metadata  Json?    // Page, browser, etc.
  createdAt DateTime @default(now())

  @@index([surveyId])
  @@index([userId])
  @@map("survey_responses")
}
```

## Survey Types

```typescript
// lib/surveys/types.ts
export type SurveyType = 'NPS' | 'CSAT' | 'CUSTOM';

export interface SurveyQuestion {
  id: string;
  type: 'nps' | 'csat' | 'rating' | 'text' | 'choice' | 'multiselect';
  question: string;
  required?: boolean;
  options?: string[];
  conditionalOn?: {
    questionId: string;
    condition: 'equals' | 'lessThan' | 'greaterThan';
    value: unknown;
  };
}

export interface Survey {
  id: string;
  name: string;
  type: SurveyType;
  description?: string;
  questions: SurveyQuestion[];
}

export interface SurveyAnswer {
  questionId: string;
  value: unknown;
}
```

## Survey Service

```typescript
// lib/services/surveys.ts
import { prisma } from '@/lib/db';
import type { SurveyAnswer } from '@/lib/surveys/types';

export async function getSurveyForUser(
  surveyId: string,
  userId?: string,
  sessionId?: string
) {
  const survey = await prisma.survey.findUnique({
    where: { id: surveyId, active: true },
  });

  if (!survey) return null;

  // Check if already responded
  const existing = await prisma.surveyResponse.findFirst({
    where: {
      surveyId,
      OR: [
        ...(userId ? [{ userId }] : []),
        ...(sessionId ? [{ sessionId }] : []),
      ],
    },
  });

  if (existing) return null; // Already responded

  return survey;
}

export async function submitSurveyResponse(
  surveyId: string,
  answers: SurveyAnswer[],
  options: {
    userId?: string;
    sessionId?: string;
    metadata?: Record<string, unknown>;
  }
) {
  const survey = await prisma.survey.findUnique({
    where: { id: surveyId },
  });

  if (!survey) throw new Error('Survey not found');

  // Calculate score for NPS/CSAT
  let score: number | undefined;
  let feedback: string | undefined;

  const questions = survey.questions as { id: string; type: string }[];

  for (const answer of answers) {
    const question = questions.find((q) => q.id === answer.questionId);
    if (!question) continue;

    if (question.type === 'nps' || question.type === 'csat') {
      score = answer.value as number;
    }
    if (question.type === 'text') {
      feedback = answer.value as string;
    }
  }

  return prisma.surveyResponse.create({
    data: {
      surveyId,
      userId: options.userId,
      sessionId: options.sessionId,
      answers: answers as any,
      score,
      feedback,
      metadata: options.metadata as any,
    },
  });
}

export async function getNPSStats(surveyId: string, dateRange?: { from: Date; to: Date }) {
  const responses = await prisma.surveyResponse.findMany({
    where: {
      surveyId,
      score: { not: null },
      ...(dateRange && {
        createdAt: { gte: dateRange.from, lte: dateRange.to },
      }),
    },
    select: { score: true },
  });

  const total = responses.length;
  if (total === 0) return { nps: 0, promoters: 0, passives: 0, detractors: 0, total: 0 };

  const promoters = responses.filter((r) => r.score! >= 9).length;
  const passives = responses.filter((r) => r.score! >= 7 && r.score! <= 8).length;
  const detractors = responses.filter((r) => r.score! <= 6).length;

  const nps = Math.round(((promoters - detractors) / total) * 100);

  return { nps, promoters, passives, detractors, total };
}

export async function getCSATStats(surveyId: string) {
  const responses = await prisma.surveyResponse.findMany({
    where: { surveyId, score: { not: null } },
    select: { score: true },
  });

  const total = responses.length;
  if (total === 0) return { csat: 0, satisfied: 0, total: 0 };

  const satisfied = responses.filter((r) => r.score! >= 4).length;
  const csat = Math.round((satisfied / total) * 100);

  return { csat, satisfied, total };
}
```

## NPS Component

```typescript
// components/surveys/nps-survey.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { submitSurvey } from '@/app/surveys/actions';

interface NPSSurveyProps {
  surveyId: string;
  title?: string;
  onComplete?: () => void;
}

export function NPSSurvey({
  surveyId,
  title = 'How likely are you to recommend us?',
  onComplete,
}: NPSSurveyProps) {
  const [score, setScore] = useState<number | null>(null);
  const [feedback, setFeedback] = useState('');
  const [step, setStep] = useState<'score' | 'feedback' | 'thanks'>('score');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleScoreSelect = (value: number) => {
    setScore(value);
    setStep('feedback');
  };

  const handleSubmit = async () => {
    if (score === null) return;

    setIsSubmitting(true);
    try {
      await submitSurvey(surveyId, [
        { questionId: 'nps', value: score },
        { questionId: 'feedback', value: feedback },
      ]);
      setStep('thanks');
      onComplete?.();
    } catch (error) {
      console.error('Survey submission failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (step === 'thanks') {
    return (
      <div className="text-center py-8">
        <p className="text-lg font-medium">Thank you for your feedback!</p>
        <p className="text-muted-foreground mt-2">
          Your response helps us improve.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {step === 'score' && (
        <>
          <p className="text-lg font-medium text-center">{title}</p>
          <div className="flex justify-center gap-1">
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
              <button
                key={value}
                onClick={() => handleScoreSelect(value)}
                className={cn(
                  'w-10 h-10 rounded-lg border text-sm font-medium transition-colors',
                  score === value
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-muted',
                  value <= 6 && 'hover:border-red-300',
                  value >= 7 && value <= 8 && 'hover:border-yellow-300',
                  value >= 9 && 'hover:border-green-300'
                )}
              >
                {value}
              </button>
            ))}
          </div>
          <div className="flex justify-between text-sm text-muted-foreground px-2">
            <span>Not likely</span>
            <span>Very likely</span>
          </div>
        </>
      )}

      {step === 'feedback' && (
        <>
          <p className="text-lg font-medium text-center">
            {score! <= 6
              ? "We're sorry to hear that. How can we improve?"
              : score! <= 8
              ? 'Thanks! What could make your experience better?'
              : "That's great! What do you love most?"}
          </p>
          <Textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Share your thoughts (optional)..."
            rows={4}
          />
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setStep('score')}>
              Back
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
```

## CSAT Component

```typescript
// components/surveys/csat-survey.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { submitSurvey } from '@/app/surveys/actions';

const CSAT_OPTIONS = [
  { value: 1, label: 'Very Dissatisfied', emoji: '😠' },
  { value: 2, label: 'Dissatisfied', emoji: '😞' },
  { value: 3, label: 'Neutral', emoji: '😐' },
  { value: 4, label: 'Satisfied', emoji: '😊' },
  { value: 5, label: 'Very Satisfied', emoji: '😍' },
];

interface CSATSurveyProps {
  surveyId: string;
  question?: string;
  onComplete?: () => void;
}

export function CSATSurvey({
  surveyId,
  question = 'How satisfied are you with your experience?',
  onComplete,
}: CSATSurveyProps) {
  const [selected, setSelected] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSelect = async (value: number) => {
    setSelected(value);

    try {
      await submitSurvey(surveyId, [{ questionId: 'csat', value }]);
      setSubmitted(true);
      onComplete?.();
    } catch (error) {
      console.error('Survey submission failed:', error);
    }
  };

  if (submitted) {
    return (
      <div className="text-center py-4">
        <p className="font-medium">Thank you for your feedback!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-center font-medium">{question}</p>
      <div className="flex justify-center gap-2">
        {CSAT_OPTIONS.map((option) => (
          <button
            key={option.value}
            onClick={() => handleSelect(option.value)}
            className={cn(
              'flex flex-col items-center p-3 rounded-lg border transition-colors',
              selected === option.value
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-muted'
            )}
          >
            <span className="text-2xl">{option.emoji}</span>
            <span className="text-xs mt-1">{option.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
```

## Survey Modal Trigger

```typescript
// components/surveys/survey-modal.tsx
'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { NPSSurvey } from './nps-survey';
import { CSATSurvey } from './csat-survey';

interface SurveyModalProps {
  surveyId: string;
  type: 'NPS' | 'CSAT';
  trigger: 'delay' | 'pageview' | 'manual';
  delay?: number;
}

export function SurveyModal({ surveyId, type, trigger, delay = 30000 }: SurveyModalProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (trigger === 'delay') {
      const timer = setTimeout(() => setOpen(true), delay);
      return () => clearTimeout(timer);
    }
    if (trigger === 'pageview') {
      setOpen(true);
    }
  }, [trigger, delay]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Quick Feedback</DialogTitle>
        </DialogHeader>
        {type === 'NPS' ? (
          <NPSSurvey surveyId={surveyId} onComplete={() => setOpen(false)} />
        ) : (
          <CSATSurvey surveyId={surveyId} onComplete={() => setOpen(false)} />
        )}
      </DialogContent>
    </Dialog>
  );
}
```

## Anti-patterns

### Don't Survey Too Frequently

```typescript
// BAD - Show survey on every page
useEffect(() => {
  showSurvey();
}, []);

// GOOD - Rate limit and check eligibility
useEffect(() => {
  if (shouldShowSurvey(user, lastSurveyDate)) {
    showSurvey();
  }
}, []);
```

## Related Skills

- [form-validation](./form-validation.md)
- [analytics](./analytics.md)

---

## Changelog

### 1.0.0 (2025-01-18)
- Initial implementation
- NPS and CSAT surveys
- Survey modal trigger
- Basic analytics
