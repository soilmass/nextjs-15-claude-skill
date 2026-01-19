---
id: pt-quiz-engine
name: Quiz Engine
version: 1.0.0
layer: L5
category: features
description: Build interactive quizzes and assessments with scoring and results
tags: [features, quiz, assessment, gamification, next15, react19]
composes:
  - ../atoms/input-radio.md
  - ../atoms/input-checkbox.md
dependencies: []
formula: "QuizEngine = QuestionRenderer + AnswerValidator + ScoreCalculator + ResultsDisplay"
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# Quiz Engine

## Overview

A quiz engine handles question rendering, answer collection, validation, scoring, and result display. This pattern covers flexible quiz types including multiple choice, true/false, and fill-in-the-blank.

## When to Use

- Educational platforms
- Knowledge assessments
- Certification exams
- Survey-style questionnaires
- Gamified learning experiences

## Quiz Schema

```prisma
// prisma/schema.prisma
model Quiz {
  id          String   @id @default(cuid())
  title       String
  description String?
  timeLimit   Int?     // in seconds
  passingScore Int     @default(70) // percentage
  shuffleQuestions Boolean @default(false)
  showAnswers Boolean @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  questions QuizQuestion[]
  attempts  QuizAttempt[]

  @@map("quizzes")
}

model QuizQuestion {
  id           String   @id @default(cuid())
  quizId       String
  quiz         Quiz     @relation(fields: [quizId], references: [id])
  type         QuestionType
  question     String
  options      Json?    // for multiple choice
  correctAnswer Json    // string or array of strings
  explanation  String?
  points       Int      @default(1)
  order        Int

  @@index([quizId])
  @@map("quiz_questions")
}

enum QuestionType {
  MULTIPLE_CHOICE
  MULTIPLE_SELECT
  TRUE_FALSE
  FILL_BLANK
  SHORT_ANSWER
}

model QuizAttempt {
  id          String   @id @default(cuid())
  quizId      String
  quiz        Quiz     @relation(fields: [quizId], references: [id])
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  answers     Json     // { questionId: answer }
  score       Int
  maxScore    Int
  percentage  Float
  passed      Boolean
  startedAt   DateTime @default(now())
  completedAt DateTime?

  @@index([userId])
  @@index([quizId])
  @@map("quiz_attempts")
}
```

## Quiz Types

```typescript
// lib/quiz/types.ts
export type QuestionType =
  | 'MULTIPLE_CHOICE'
  | 'MULTIPLE_SELECT'
  | 'TRUE_FALSE'
  | 'FILL_BLANK'
  | 'SHORT_ANSWER';

export interface Question {
  id: string;
  type: QuestionType;
  question: string;
  options?: string[];
  points: number;
  explanation?: string;
}

export interface QuestionWithAnswer extends Question {
  correctAnswer: string | string[];
}

export interface Answer {
  questionId: string;
  answer: string | string[];
}

export interface QuizResult {
  score: number;
  maxScore: number;
  percentage: number;
  passed: boolean;
  answers: Array<{
    questionId: string;
    isCorrect: boolean;
    userAnswer: string | string[];
    correctAnswer: string | string[];
    explanation?: string;
  }>;
}
```

## Quiz Service

```typescript
// lib/quiz/service.ts
import { prisma } from '@/lib/db';
import type { Answer, QuizResult } from './types';

export async function getQuiz(quizId: string) {
  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    include: {
      questions: {
        orderBy: { order: 'asc' },
        select: {
          id: true,
          type: true,
          question: true,
          options: true,
          points: true,
          // Don't include correctAnswer
        },
      },
    },
  });

  if (!quiz) return null;

  // Shuffle questions if enabled
  if (quiz.shuffleQuestions) {
    quiz.questions = shuffleArray(quiz.questions);
  }

  return quiz;
}

export async function submitQuiz(
  quizId: string,
  userId: string,
  answers: Answer[]
): Promise<QuizResult> {
  const questions = await prisma.quizQuestion.findMany({
    where: { quizId },
  });

  let score = 0;
  let maxScore = 0;
  const results: QuizResult['answers'] = [];

  for (const question of questions) {
    const userAnswer = answers.find((a) => a.questionId === question.id);
    const correctAnswer = question.correctAnswer as string | string[];

    maxScore += question.points;

    const isCorrect = checkAnswer(
      question.type,
      userAnswer?.answer,
      correctAnswer
    );

    if (isCorrect) {
      score += question.points;
    }

    results.push({
      questionId: question.id,
      isCorrect,
      userAnswer: userAnswer?.answer || '',
      correctAnswer,
      explanation: question.explanation || undefined,
    });
  }

  const percentage = maxScore > 0 ? (score / maxScore) * 100 : 0;

  const quiz = await prisma.quiz.findUnique({ where: { id: quizId } });
  const passed = percentage >= (quiz?.passingScore || 70);

  // Save attempt
  await prisma.quizAttempt.create({
    data: {
      quizId,
      userId,
      answers: answers as any,
      score,
      maxScore,
      percentage,
      passed,
      completedAt: new Date(),
    },
  });

  return { score, maxScore, percentage, passed, answers: results };
}

function checkAnswer(
  type: string,
  userAnswer: string | string[] | undefined,
  correctAnswer: string | string[]
): boolean {
  if (!userAnswer) return false;

  switch (type) {
    case 'MULTIPLE_SELECT': {
      const userSet = new Set(Array.isArray(userAnswer) ? userAnswer : [userAnswer]);
      const correctSet = new Set(Array.isArray(correctAnswer) ? correctAnswer : [correctAnswer]);
      return (
        userSet.size === correctSet.size &&
        [...userSet].every((a) => correctSet.has(a))
      );
    }
    case 'FILL_BLANK':
    case 'SHORT_ANSWER': {
      const normalize = (s: string) => s.toLowerCase().trim();
      const userNorm = normalize(String(userAnswer));
      if (Array.isArray(correctAnswer)) {
        return correctAnswer.some((a) => normalize(a) === userNorm);
      }
      return normalize(correctAnswer) === userNorm;
    }
    default:
      return userAnswer === correctAnswer;
  }
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
```

## Quiz Component

```typescript
// components/quiz/quiz-player.tsx
'use client';

import { useState, useEffect } from 'react';
import { QuizQuestion } from './quiz-question';
import { QuizResults } from './quiz-results';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { submitQuizAction } from '@/app/quizzes/[id]/actions';
import type { Question, Answer, QuizResult } from '@/lib/quiz/types';

interface QuizPlayerProps {
  quizId: string;
  title: string;
  questions: Question[];
  timeLimit?: number;
}

export function QuizPlayer({ quizId, title, questions, timeLimit }: QuizPlayerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [timeRemaining, setTimeRemaining] = useState(timeLimit || 0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<QuizResult | null>(null);

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;

  // Timer
  useEffect(() => {
    if (!timeLimit || result) return;

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLimit, result]);

  const handleAnswer = (answer: string | string[]) => {
    setAnswers((prev) => {
      const existing = prev.findIndex((a) => a.questionId === currentQuestion.id);
      const newAnswer = { questionId: currentQuestion.id, answer };

      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = newAnswer;
        return updated;
      }
      return [...prev, newAnswer];
    });
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const result = await submitQuizAction(quizId, answers);
      setResult(result);
    } catch (error) {
      console.error('Submit error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (result) {
    return <QuizResults result={result} questions={questions} />;
  }

  const currentAnswer = answers.find((a) => a.questionId === currentQuestion.id);

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>{title}</CardTitle>
          {timeLimit && (
            <span className="text-sm font-mono">
              {Math.floor(timeRemaining / 60)}:{String(timeRemaining % 60).padStart(2, '0')}
            </span>
          )}
        </div>
        <Progress value={progress} />
        <p className="text-sm text-muted-foreground">
          Question {currentIndex + 1} of {questions.length}
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        <QuizQuestion
          question={currentQuestion}
          value={currentAnswer?.answer}
          onChange={handleAnswer}
        />

        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => setCurrentIndex((i) => i - 1)}
            disabled={currentIndex === 0}
          >
            Previous
          </Button>

          {currentIndex === questions.length - 1 ? (
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit Quiz'}
            </Button>
          ) : (
            <Button onClick={() => setCurrentIndex((i) => i + 1)}>
              Next
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
```

## Question Renderer

```typescript
// components/quiz/quiz-question.tsx
'use client';

import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Question } from '@/lib/quiz/types';

interface QuizQuestionProps {
  question: Question;
  value?: string | string[];
  onChange: (answer: string | string[]) => void;
}

export function QuizQuestion({ question, value, onChange }: QuizQuestionProps) {
  switch (question.type) {
    case 'MULTIPLE_CHOICE':
    case 'TRUE_FALSE':
      return (
        <div className="space-y-4">
          <p className="text-lg font-medium">{question.question}</p>
          <RadioGroup value={value as string} onValueChange={onChange}>
            {(question.options || ['True', 'False']).map((option, i) => (
              <div key={i} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={`option-${i}`} />
                <Label htmlFor={`option-${i}`}>{option}</Label>
              </div>
            ))}
          </RadioGroup>
        </div>
      );

    case 'MULTIPLE_SELECT':
      const selected = (value as string[]) || [];
      return (
        <div className="space-y-4">
          <p className="text-lg font-medium">{question.question}</p>
          <p className="text-sm text-muted-foreground">Select all that apply</p>
          {question.options?.map((option, i) => (
            <div key={i} className="flex items-center space-x-2">
              <Checkbox
                id={`option-${i}`}
                checked={selected.includes(option)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    onChange([...selected, option]);
                  } else {
                    onChange(selected.filter((s) => s !== option));
                  }
                }}
              />
              <Label htmlFor={`option-${i}`}>{option}</Label>
            </div>
          ))}
        </div>
      );

    case 'FILL_BLANK':
    case 'SHORT_ANSWER':
      return (
        <div className="space-y-4">
          <p className="text-lg font-medium">{question.question}</p>
          <Input
            value={(value as string) || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Type your answer..."
          />
        </div>
      );

    default:
      return null;
  }
}
```

## Anti-patterns

### Don't Send Correct Answers to Client

```typescript
// BAD - Exposes answers
const quiz = await prisma.quiz.findUnique({
  include: { questions: true }, // includes correctAnswer
});

// GOOD - Exclude answers
const quiz = await prisma.quiz.findUnique({
  include: {
    questions: {
      select: { id: true, question: true, options: true },
    },
  },
});
```

## Related Skills

- [progress-tracking](./progress-tracking.md)
- [form-validation](./form-validation.md)

---

## Changelog

### 1.0.0 (2025-01-18)
- Initial implementation
- Multiple question types
- Scoring and results
- Timer support
