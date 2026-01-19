---
id: pt-progress-tracking
name: Progress Tracking
version: 1.0.0
layer: L5
category: features
description: Track and display user progress through courses, tasks, or workflows
tags: [features, progress, tracking, gamification, next15, react19]
composes:
  - ../atoms/display-badge.md
dependencies: []
formula: "ProgressTracking = ProgressStore + ProgressBar + Milestones + Achievements"
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# Progress Tracking

## Overview

Progress tracking helps users understand their advancement through courses, tasks, or multi-step workflows. This pattern covers progress storage, visualization, and milestone celebrations.

## When to Use

- Online courses and learning platforms
- Onboarding flows
- Multi-step forms or wizards
- Task completion systems
- Achievement/badge systems

## Progress Schema

```prisma
// prisma/schema.prisma
model UserProgress {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])

  courseId  String
  course    Course   @relation(fields: [courseId], references: [id])

  completedLessons String[] // Array of lesson IDs
  currentLesson    String?
  startedAt        DateTime @default(now())
  completedAt      DateTime?

  @@unique([userId, courseId])
  @@map("user_progress")
}

model Achievement {
  id          String   @id @default(cuid())
  name        String
  description String
  icon        String
  criteria    Json     // { type: 'lessons_completed', count: 10 }

  users UserAchievement[]

  @@map("achievements")
}

model UserAchievement {
  id            String      @id @default(cuid())
  userId        String
  user          User        @relation(fields: [userId], references: [id])
  achievementId String
  achievement   Achievement @relation(fields: [achievementId], references: [id])
  unlockedAt    DateTime    @default(now())

  @@unique([userId, achievementId])
  @@map("user_achievements")
}
```

## Progress Service

```typescript
// lib/services/progress.ts
import { prisma } from '@/lib/db';

export async function getProgress(userId: string, courseId: string) {
  const progress = await prisma.userProgress.findUnique({
    where: { userId_courseId: { userId, courseId } },
  });

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: { lessons: { orderBy: { order: 'asc' } } },
  });

  if (!course) return null;

  const totalLessons = course.lessons.length;
  const completedCount = progress?.completedLessons.length || 0;
  const percentage = totalLessons > 0
    ? Math.round((completedCount / totalLessons) * 100)
    : 0;

  return {
    courseId,
    totalLessons,
    completedCount,
    percentage,
    completedLessons: progress?.completedLessons || [],
    currentLesson: progress?.currentLesson || course.lessons[0]?.id,
    isCompleted: completedCount === totalLessons,
    startedAt: progress?.startedAt,
    completedAt: progress?.completedAt,
  };
}

export async function markLessonComplete(
  userId: string,
  courseId: string,
  lessonId: string
) {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: { lessons: { orderBy: { order: 'asc' } } },
  });

  if (!course) throw new Error('Course not found');

  const currentProgress = await prisma.userProgress.findUnique({
    where: { userId_courseId: { userId, courseId } },
  });

  const completedLessons = new Set(currentProgress?.completedLessons || []);
  completedLessons.add(lessonId);

  const currentLessonIndex = course.lessons.findIndex((l) => l.id === lessonId);
  const nextLesson = course.lessons[currentLessonIndex + 1];

  const isNowComplete = completedLessons.size === course.lessons.length;

  const progress = await prisma.userProgress.upsert({
    where: { userId_courseId: { userId, courseId } },
    create: {
      userId,
      courseId,
      completedLessons: [lessonId],
      currentLesson: nextLesson?.id || lessonId,
    },
    update: {
      completedLessons: Array.from(completedLessons),
      currentLesson: nextLesson?.id || lessonId,
      ...(isNowComplete && { completedAt: new Date() }),
    },
  });

  // Check for achievements
  await checkAchievements(userId);

  return {
    progress,
    isComplete: isNowComplete,
    nextLesson,
  };
}

async function checkAchievements(userId: string) {
  const achievements = await prisma.achievement.findMany();
  const userProgress = await prisma.userProgress.findMany({
    where: { userId },
  });

  const totalCompleted = userProgress.reduce(
    (sum, p) => sum + p.completedLessons.length,
    0
  );

  for (const achievement of achievements) {
    const criteria = achievement.criteria as { type: string; count: number };

    if (criteria.type === 'lessons_completed' && totalCompleted >= criteria.count) {
      await prisma.userAchievement.upsert({
        where: { userId_achievementId: { userId, achievementId: achievement.id } },
        create: { userId, achievementId: achievement.id },
        update: {},
      });
    }
  }
}
```

## Progress Bar Component

```typescript
// components/progress-bar.tsx
'use client';

import { cn } from '@/lib/utils';
import { CheckCircle } from 'lucide-react';

interface ProgressBarProps {
  value: number;
  max?: number;
  showLabel?: boolean;
  showMilestones?: boolean;
  milestones?: number[];
  className?: string;
}

export function ProgressBar({
  value,
  max = 100,
  showLabel = true,
  showMilestones = false,
  milestones = [25, 50, 75, 100],
  className,
}: ProgressBarProps) {
  const percentage = Math.min(Math.round((value / max) * 100), 100);

  return (
    <div className={cn('space-y-2', className)}>
      <div className="relative">
        <div className="h-3 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-500 ease-out"
            style={{ width: `${percentage}%` }}
          />
        </div>

        {showMilestones && (
          <div className="absolute inset-0 flex justify-between px-1">
            {milestones.map((milestone) => (
              <div
                key={milestone}
                className="relative flex flex-col items-center"
                style={{ left: `${milestone}%`, transform: 'translateX(-50%)' }}
              >
                <div
                  className={cn(
                    'w-4 h-4 rounded-full border-2 bg-background -mt-0.5',
                    percentage >= milestone
                      ? 'border-primary bg-primary'
                      : 'border-muted-foreground'
                  )}
                >
                  {percentage >= milestone && (
                    <CheckCircle className="w-full h-full text-primary-foreground" />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showLabel && (
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Progress</span>
          <span className="font-medium">{percentage}%</span>
        </div>
      )}
    </div>
  );
}
```

## Course Progress Card

```typescript
// components/course-progress-card.tsx
import Link from 'next/link';
import { ProgressBar } from '@/components/progress-bar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlayCircle, CheckCircle2 } from 'lucide-react';

interface CourseProgressCardProps {
  course: {
    id: string;
    title: string;
    description: string;
    thumbnail?: string;
  };
  progress: {
    percentage: number;
    completedCount: number;
    totalLessons: number;
    currentLesson?: string;
    isCompleted: boolean;
  };
}

export function CourseProgressCard({ course, progress }: CourseProgressCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {course.title}
          {progress.isCompleted && (
            <CheckCircle2 className="h-5 w-5 text-green-500" />
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">{course.description}</p>

        <ProgressBar value={progress.percentage} />

        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            {progress.completedCount} of {progress.totalLessons} lessons
          </span>

          <Button asChild size="sm">
            <Link
              href={`/courses/${course.id}/lessons/${progress.currentLesson}`}
            >
              <PlayCircle className="mr-2 h-4 w-4" />
              {progress.isCompleted ? 'Review' : 'Continue'}
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
```

## Server Action for Progress

```typescript
// app/courses/[courseId]/lessons/[lessonId]/actions.ts
'use server';

import { auth } from '@/lib/auth';
import { markLessonComplete } from '@/lib/services/progress';
import { revalidatePath } from 'next/cache';

export async function completeLessonAction(courseId: string, lessonId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: 'Unauthorized' };
  }

  try {
    const result = await markLessonComplete(session.user.id, courseId, lessonId);

    revalidatePath(`/courses/${courseId}`);
    revalidatePath('/dashboard');

    return {
      success: true,
      isComplete: result.isComplete,
      nextLessonId: result.nextLesson?.id,
    };
  } catch (error) {
    return { error: 'Failed to mark lesson complete' };
  }
}
```

## Achievement Toast

```typescript
// components/achievement-toast.tsx
'use client';

import { useEffect } from 'react';
import { toast } from 'sonner';
import { Trophy } from 'lucide-react';

interface Achievement {
  name: string;
  description: string;
  icon: string;
}

export function useAchievementToast(newAchievements: Achievement[]) {
  useEffect(() => {
    newAchievements.forEach((achievement) => {
      toast.custom(
        () => (
          <div className="flex items-center gap-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white p-4 rounded-lg shadow-lg">
            <Trophy className="h-8 w-8" />
            <div>
              <p className="font-bold">Achievement Unlocked!</p>
              <p className="text-sm">{achievement.name}</p>
            </div>
          </div>
        ),
        { duration: 5000 }
      );
    });
  }, [newAchievements]);
}
```

## Anti-patterns

### Don't Store Progress Only Client-Side

```typescript
// BAD - Lost on refresh
const [progress, setProgress] = useState(0);

// GOOD - Persist to database
await markLessonComplete(userId, courseId, lessonId);
```

## Related Skills

- [optimistic-updates](./optimistic-updates.md)
- [server-actions](./server-actions.md)

---

## Changelog

### 1.0.0 (2025-01-18)
- Initial implementation
- Progress service
- Progress components
- Achievement system
