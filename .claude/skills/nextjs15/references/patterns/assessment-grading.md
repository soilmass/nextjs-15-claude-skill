---
id: pt-assessment-grading
name: Assessment Grading
version: 1.0.0
layer: L5
category: education
description: Quiz and test grading logic with scoring algorithms and feedback generation
tags: [education, grading, assessment, quiz, scoring, next15]
composes: []
dependencies: []
formula: "AssessmentGrading = QuestionTypes + ScoringAlgorithm + FeedbackGeneration + ResultsDisplay"
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# Assessment Grading

## When to Use

- Building quiz or exam systems
- Creating knowledge assessments
- Implementing certification tests
- Providing instant feedback on answers
- Tracking learning progress

## Composition Diagram

```
Assessment Flow
===============

+------------------------------------------+
|  Question Bank                           |
|  - Multiple choice                       |
|  - Multiple select                       |
|  - True/False                            |
|  - Short answer                          |
+------------------------------------------+
              |
              v
+------------------------------------------+
|  Answer Submission                       |
|  - Timed or untimed                      |
|  - Progress tracking                     |
+------------------------------------------+
              |
              v
+------------------------------------------+
|  Grading Engine                          |
|  - Auto-grade objective questions        |
|  - Partial credit calculation            |
|  - Manual review queue                   |
+------------------------------------------+
              |
              v
+------------------------------------------+
|  Results & Feedback                      |
|  - Score breakdown                       |
|  - Correct answers                       |
|  - Explanations                          |
+------------------------------------------+
```

## Database Schema

```prisma
// prisma/schema.prisma
model Assessment {
  id            String     @id @default(cuid())
  title         String
  description   String?
  timeLimit     Int?       // minutes
  passingScore  Float      @default(70)
  shuffleQuestions Boolean @default(false)
  showResults   Boolean    @default(true)
  questions     Question[]
  attempts      Attempt[]
  createdAt     DateTime   @default(now())
}

model Question {
  id           String     @id @default(cuid())
  assessmentId String
  assessment   Assessment @relation(fields: [assessmentId], references: [id])
  type         String     // multiple_choice, multiple_select, true_false, short_answer
  text         String
  options      Json?      // For choice questions
  correctAnswer Json      // Can be string, array, or complex object
  points       Float      @default(1)
  explanation  String?
  order        Int

  @@index([assessmentId])
}

model Attempt {
  id           String     @id @default(cuid())
  assessmentId String
  assessment   Assessment @relation(fields: [assessmentId], references: [id])
  userId       String
  user         User       @relation(fields: [userId], references: [id])
  answers      Json       // { questionId: answer }
  score        Float?
  maxScore     Float?
  percentage   Float?
  passed       Boolean?
  gradedAt     DateTime?
  startedAt    DateTime   @default(now())
  submittedAt  DateTime?

  @@index([userId, assessmentId])
}
```

## Grading Service

```typescript
// lib/grading/grader.ts
import { prisma } from '@/lib/db';

interface GradingResult {
  questionId: string;
  correct: boolean;
  pointsEarned: number;
  maxPoints: number;
  feedback?: string;
}

export async function gradeAttempt(attemptId: string): Promise<{
  results: GradingResult[];
  totalScore: number;
  maxScore: number;
  percentage: number;
  passed: boolean;
}> {
  const attempt = await prisma.attempt.findUnique({
    where: { id: attemptId },
    include: {
      assessment: {
        include: { questions: true },
      },
    },
  });

  if (!attempt) throw new Error('Attempt not found');

  const answers = attempt.answers as Record<string, any>;
  const results: GradingResult[] = [];
  let totalScore = 0;
  let maxScore = 0;

  for (const question of attempt.assessment.questions) {
    const userAnswer = answers[question.id];
    const result = gradeQuestion(question, userAnswer);

    results.push(result);
    totalScore += result.pointsEarned;
    maxScore += result.maxPoints;
  }

  const percentage = maxScore > 0 ? (totalScore / maxScore) * 100 : 0;
  const passed = percentage >= attempt.assessment.passingScore;

  await prisma.attempt.update({
    where: { id: attemptId },
    data: {
      score: totalScore,
      maxScore,
      percentage,
      passed,
      gradedAt: new Date(),
    },
  });

  return { results, totalScore, maxScore, percentage, passed };
}

function gradeQuestion(question: any, userAnswer: any): GradingResult {
  const correctAnswer = question.correctAnswer;
  let correct = false;
  let pointsEarned = 0;

  switch (question.type) {
    case 'multiple_choice':
    case 'true_false':
      correct = userAnswer === correctAnswer;
      pointsEarned = correct ? question.points : 0;
      break;

    case 'multiple_select':
      const correctSet = new Set(correctAnswer as string[]);
      const userSet = new Set(userAnswer as string[] || []);

      // Partial credit: points for each correct selection
      let correctSelections = 0;
      let incorrectSelections = 0;

      userSet.forEach((ans) => {
        if (correctSet.has(ans)) correctSelections++;
        else incorrectSelections++;
      });

      const missedSelections = correctSet.size - correctSelections;
      const partialScore = Math.max(
        0,
        (correctSelections - incorrectSelections - missedSelections) / correctSet.size
      );

      correct = partialScore === 1;
      pointsEarned = question.points * partialScore;
      break;

    case 'short_answer':
      const normalizedUser = normalizeAnswer(userAnswer || '');
      const acceptableAnswers = Array.isArray(correctAnswer)
        ? correctAnswer.map(normalizeAnswer)
        : [normalizeAnswer(correctAnswer)];

      correct = acceptableAnswers.some((ans) =>
        ans === normalizedUser || levenshteinDistance(ans, normalizedUser) <= 2
      );
      pointsEarned = correct ? question.points : 0;
      break;
  }

  return {
    questionId: question.id,
    correct,
    pointsEarned,
    maxPoints: question.points,
    feedback: correct ? undefined : question.explanation,
  };
}

function normalizeAnswer(answer: string): string {
  return answer.toLowerCase().trim().replace(/\s+/g, ' ');
}

function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      matrix[i][j] = b[i - 1] === a[j - 1]
        ? matrix[i - 1][j - 1]
        : Math.min(matrix[i - 1][j - 1] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j] + 1);
    }
  }
  return matrix[b.length][a.length];
}
```

## Quiz Component

```typescript
// components/assessment/quiz.tsx
'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';

interface Question {
  id: string;
  type: string;
  text: string;
  options?: { id: string; text: string }[];
  points: number;
}

export function Quiz({ assessmentId, questions }: { assessmentId: string; questions: Question[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});

  const submitMutation = useMutation({
    mutationFn: (data: { assessmentId: string; answers: Record<string, any> }) =>
      fetch('/api/assessments/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }).then((r) => r.json()),
  });

  const question = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;

  const handleAnswer = (value: any) => {
    setAnswers((prev) => ({ ...prev, [question.id]: value }));
  };

  const handleSubmit = () => {
    submitMutation.mutate({ assessmentId, answers });
  };

  if (submitMutation.isSuccess) {
    return <QuizResults results={submitMutation.data} />;
  }

  return (
    <div className="space-y-6">
      <Progress value={progress} />

      <div className="p-6 border rounded-lg">
        <p className="text-sm text-muted-foreground mb-2">
          Question {currentIndex + 1} of {questions.length} ({question.points} points)
        </p>
        <h3 className="text-lg font-medium mb-4">{question.text}</h3>

        {question.type === 'multiple_choice' && (
          <RadioGroup
            value={answers[question.id] || ''}
            onValueChange={handleAnswer}
          >
            {question.options?.map((option) => (
              <div key={option.id} className="flex items-center space-x-2">
                <RadioGroupItem value={option.id} id={option.id} />
                <label htmlFor={option.id}>{option.text}</label>
              </div>
            ))}
          </RadioGroup>
        )}

        {question.type === 'multiple_select' && (
          <div className="space-y-2">
            {question.options?.map((option) => (
              <div key={option.id} className="flex items-center space-x-2">
                <Checkbox
                  id={option.id}
                  checked={(answers[question.id] || []).includes(option.id)}
                  onCheckedChange={(checked) => {
                    const current = answers[question.id] || [];
                    handleAnswer(
                      checked
                        ? [...current, option.id]
                        : current.filter((id: string) => id !== option.id)
                    );
                  }}
                />
                <label htmlFor={option.id}>{option.text}</label>
              </div>
            ))}
          </div>
        )}

        {question.type === 'short_answer' && (
          <Input
            value={answers[question.id] || ''}
            onChange={(e) => handleAnswer(e.target.value)}
            placeholder="Type your answer..."
          />
        )}
      </div>

      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => setCurrentIndex((i) => i - 1)}
          disabled={currentIndex === 0}
        >
          Previous
        </Button>

        {currentIndex === questions.length - 1 ? (
          <Button onClick={handleSubmit} disabled={submitMutation.isPending}>
            Submit Quiz
          </Button>
        ) : (
          <Button onClick={() => setCurrentIndex((i) => i + 1)}>
            Next
          </Button>
        )}
      </div>
    </div>
  );
}
```

## Results Component

```typescript
// components/assessment/quiz-results.tsx
import { CheckCircle, XCircle } from 'lucide-react';

export function QuizResults({ results }: { results: any }) {
  const { totalScore, maxScore, percentage, passed, results: questionResults } = results;

  return (
    <div className="space-y-6">
      <div className={`p-6 rounded-lg ${passed ? 'bg-green-50' : 'bg-red-50'}`}>
        <h2 className="text-2xl font-bold">
          {passed ? 'Congratulations!' : 'Keep Practicing'}
        </h2>
        <p className="text-lg">
          Score: {totalScore}/{maxScore} ({percentage.toFixed(1)}%)
        </p>
      </div>

      <div className="space-y-4">
        {questionResults.map((result: any, index: number) => (
          <div key={result.questionId} className="p-4 border rounded-lg">
            <div className="flex items-center gap-2">
              {result.correct ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
              <span>Question {index + 1}: {result.pointsEarned}/{result.maxPoints} points</span>
            </div>
            {result.feedback && (
              <p className="mt-2 text-sm text-muted-foreground">{result.feedback}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
```

## Anti-patterns

### Don't Grade on Client

```typescript
// BAD - Client-side grading (can be cheated)
const score = questions.filter((q) => answers[q.id] === q.correctAnswer).length;

// GOOD - Server-side grading
const result = await fetch('/api/assessments/submit', {
  method: 'POST',
  body: JSON.stringify({ assessmentId, answers }),
});
```

## Related Skills

- [form-validation](./form-validation.md)
- [progress-tracking](./progress-tracking.md)

---

## Changelog

### 1.0.0 (2025-01-18)
- Initial implementation
- Multiple question types
- Partial credit scoring
- Fuzzy matching for short answers
