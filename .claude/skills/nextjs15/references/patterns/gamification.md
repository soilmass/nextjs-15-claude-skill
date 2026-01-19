---
id: pt-gamification
name: Gamification
version: 1.0.0
layer: L5
category: engagement
description: Implement gamification with points, badges, achievements, and leaderboards
tags: [gamification, points, badges, achievements, leaderboard, engagement, next15, react19]
composes:
  - ../molecules/progress-bar.md
dependencies: []
formula: "Gamification = Points + Badges + Achievements + Leaderboard + Notifications"
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# Gamification

## When to Use

- When building learning platforms or courses
- For increasing user engagement in applications
- When implementing loyalty programs
- For community platforms with reputation systems
- When building fitness or habit tracking apps

## Overview

This pattern implements gamification elements including points, badges, achievements, levels, and leaderboards. It covers the database schema, point awarding, achievement tracking, and UI components.

## Database Schema

```prisma
// prisma/schema.prisma
model User {
  id           String        @id @default(cuid())
  email        String        @unique
  name         String?
  points       Int           @default(0)
  level        Int           @default(1)
  badges       UserBadge[]
  achievements UserAchievement[]
  pointHistory PointHistory[]
}

model Badge {
  id          String      @id @default(cuid())
  name        String      @unique
  description String
  imageUrl    String
  category    String
  rarity      BadgeRarity @default(COMMON)
  users       UserBadge[]
}

enum BadgeRarity {
  COMMON
  UNCOMMON
  RARE
  EPIC
  LEGENDARY
}

model UserBadge {
  id        String   @id @default(cuid())
  userId    String
  badgeId   String
  earnedAt  DateTime @default(now())
  user      User     @relation(fields: [userId], references: [id])
  badge     Badge    @relation(fields: [badgeId], references: [id])

  @@unique([userId, badgeId])
}

model Achievement {
  id          String            @id @default(cuid())
  name        String            @unique
  description String
  points      Int
  requirement Json              // { type: "posts", count: 10 }
  users       UserAchievement[]
}

model UserAchievement {
  id            String      @id @default(cuid())
  userId        String
  achievementId String
  progress      Int         @default(0)
  completed     Boolean     @default(false)
  completedAt   DateTime?
  user          User        @relation(fields: [userId], references: [id])
  achievement   Achievement @relation(fields: [achievementId], references: [id])

  @@unique([userId, achievementId])
}

model PointHistory {
  id        String   @id @default(cuid())
  userId    String
  points    Int
  reason    String
  metadata  Json?
  createdAt DateTime @default(now())
  user      User     @relation(fields: [userId], references: [id])
}
```

## Points System

```typescript
// lib/gamification/points.ts
import { prisma } from "@/lib/db";

export const POINT_VALUES = {
  POST_CREATED: 10,
  POST_LIKED: 1,
  COMMENT_CREATED: 5,
  COMMENT_LIKED: 1,
  PROFILE_COMPLETED: 50,
  DAILY_LOGIN: 5,
  STREAK_BONUS: 10,
  REFERRAL: 100,
} as const;

export type PointAction = keyof typeof POINT_VALUES;

export async function awardPoints(
  userId: string,
  action: PointAction,
  metadata?: Record<string, unknown>
): Promise<{ newTotal: number; levelUp: boolean }> {
  const points = POINT_VALUES[action];

  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      points: { increment: points },
      pointHistory: {
        create: {
          points,
          reason: action,
          metadata: metadata || {},
        },
      },
    },
    select: { points: true, level: true },
  });

  // Check for level up
  const newLevel = calculateLevel(user.points);
  let levelUp = false;

  if (newLevel > user.level) {
    await prisma.user.update({
      where: { id: userId },
      data: { level: newLevel },
    });
    levelUp = true;
  }

  // Check achievements
  await checkAchievements(userId, action);

  return { newTotal: user.points, levelUp };
}

function calculateLevel(points: number): number {
  // Level formula: level = floor(sqrt(points / 100)) + 1
  return Math.floor(Math.sqrt(points / 100)) + 1;
}

export function getPointsForLevel(level: number): number {
  return Math.pow(level - 1, 2) * 100;
}

export function getProgressToNextLevel(points: number): {
  currentLevel: number;
  progress: number;
  pointsNeeded: number;
} {
  const currentLevel = calculateLevel(points);
  const currentLevelPoints = getPointsForLevel(currentLevel);
  const nextLevelPoints = getPointsForLevel(currentLevel + 1);
  const pointsInLevel = points - currentLevelPoints;
  const pointsNeeded = nextLevelPoints - currentLevelPoints;

  return {
    currentLevel,
    progress: (pointsInLevel / pointsNeeded) * 100,
    pointsNeeded: nextLevelPoints - points,
  };
}
```

## Achievement System

```typescript
// lib/gamification/achievements.ts
import { prisma } from "@/lib/db";
import type { PointAction } from "./points";

interface AchievementRequirement {
  type: string;
  count: number;
}

const ACHIEVEMENT_TRIGGERS: Record<PointAction, string> = {
  POST_CREATED: "posts",
  COMMENT_CREATED: "comments",
  POST_LIKED: "likes_given",
  COMMENT_LIKED: "likes_given",
  PROFILE_COMPLETED: "profile",
  DAILY_LOGIN: "logins",
  STREAK_BONUS: "streak",
  REFERRAL: "referrals",
};

export async function checkAchievements(
  userId: string,
  action: PointAction
): Promise<string[]> {
  const triggerType = ACHIEVEMENT_TRIGGERS[action];
  const earnedAchievements: string[] = [];

  // Get all achievements for this trigger type
  const achievements = await prisma.achievement.findMany({
    where: {
      requirement: {
        path: ["type"],
        equals: triggerType,
      },
    },
    include: {
      users: {
        where: { userId, completed: false },
      },
    },
  });

  for (const achievement of achievements) {
    const requirement = achievement.requirement as AchievementRequirement;

    // Get or create user achievement progress
    let userAchievement = achievement.users[0];

    if (!userAchievement) {
      userAchievement = await prisma.userAchievement.create({
        data: {
          userId,
          achievementId: achievement.id,
          progress: 0,
        },
      });
    }

    // Increment progress
    const newProgress = userAchievement.progress + 1;
    const completed = newProgress >= requirement.count;

    await prisma.userAchievement.update({
      where: { id: userAchievement.id },
      data: {
        progress: newProgress,
        completed,
        completedAt: completed ? new Date() : null,
      },
    });

    if (completed) {
      // Award achievement points
      await prisma.user.update({
        where: { id: userId },
        data: { points: { increment: achievement.points } },
      });

      earnedAchievements.push(achievement.name);
    }
  }

  return earnedAchievements;
}

export async function getUserAchievements(userId: string) {
  return prisma.userAchievement.findMany({
    where: { userId },
    include: { achievement: true },
    orderBy: { completedAt: "desc" },
  });
}
```

## Badge System

```typescript
// lib/gamification/badges.ts
import { prisma } from "@/lib/db";

export async function awardBadge(
  userId: string,
  badgeName: string
): Promise<boolean> {
  const badge = await prisma.badge.findUnique({
    where: { name: badgeName },
  });

  if (!badge) return false;

  // Check if user already has badge
  const existing = await prisma.userBadge.findUnique({
    where: {
      userId_badgeId: { userId, badgeId: badge.id },
    },
  });

  if (existing) return false;

  await prisma.userBadge.create({
    data: {
      userId,
      badgeId: badge.id,
    },
  });

  return true;
}

export async function getUserBadges(userId: string) {
  return prisma.userBadge.findMany({
    where: { userId },
    include: { badge: true },
    orderBy: { earnedAt: "desc" },
  });
}

export async function checkBadgeEligibility(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      _count: {
        select: {
          posts: true,
          comments: true,
        },
      },
    },
  });

  if (!user) return;

  // First post badge
  if (user._count.posts === 1) {
    await awardBadge(userId, "first_post");
  }

  // Prolific writer badge
  if (user._count.posts >= 100) {
    await awardBadge(userId, "prolific_writer");
  }

  // Commenter badges
  if (user._count.comments >= 50) {
    await awardBadge(userId, "active_commenter");
  }
}
```

## Leaderboard

```typescript
// lib/gamification/leaderboard.ts
import { prisma } from "@/lib/db";
import { unstable_cache } from "next/cache";

export const getLeaderboard = unstable_cache(
  async (limit: number = 10, period: "all" | "week" | "month" = "all") => {
    let dateFilter = {};

    if (period !== "all") {
      const now = new Date();
      const startDate = period === "week"
        ? new Date(now.setDate(now.getDate() - 7))
        : new Date(now.setMonth(now.getMonth() - 1));

      dateFilter = { createdAt: { gte: startDate } };
    }

    if (period === "all") {
      return prisma.user.findMany({
        select: {
          id: true,
          name: true,
          points: true,
          level: true,
          badges: { include: { badge: true }, take: 3 },
        },
        orderBy: { points: "desc" },
        take: limit,
      });
    }

    // For time-based leaderboards, aggregate point history
    const pointsInPeriod = await prisma.pointHistory.groupBy({
      by: ["userId"],
      _sum: { points: true },
      where: dateFilter,
      orderBy: { _sum: { points: "desc" } },
      take: limit,
    });

    const userIds = pointsInPeriod.map((p) => p.userId);
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: {
        id: true,
        name: true,
        level: true,
        badges: { include: { badge: true }, take: 3 },
      },
    });

    return pointsInPeriod.map((p) => {
      const user = users.find((u) => u.id === p.userId)!;
      return { ...user, points: p._sum.points || 0 };
    });
  },
  ["leaderboard"],
  { revalidate: 300 }
);
```

## Achievement Component

```typescript
// components/gamification/achievements.tsx
"use client";

import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Trophy, Lock } from "lucide-react";

interface Achievement {
  id: string;
  name: string;
  description: string;
  points: number;
  progress: number;
  completed: boolean;
  requirement: { type: string; count: number };
}

export function AchievementCard({ achievement }: { achievement: Achievement }) {
  const progressPercent = (achievement.progress / achievement.requirement.count) * 100;

  return (
    <Card className={`p-4 ${achievement.completed ? "bg-primary/5 border-primary" : ""}`}>
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-full ${achievement.completed ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
          {achievement.completed ? (
            <Trophy className="h-6 w-6" />
          ) : (
            <Lock className="h-6 w-6" />
          )}
        </div>

        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">{achievement.name}</h3>
            <Badge variant="secondary">+{achievement.points} pts</Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {achievement.description}
          </p>

          {!achievement.completed && (
            <div className="mt-3">
              <div className="flex justify-between text-xs mb-1">
                <span>Progress</span>
                <span>{achievement.progress}/{achievement.requirement.count}</span>
              </div>
              <Progress value={progressPercent} className="h-2" />
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
```

## Server Action for Points

```typescript
// app/actions/gamification.ts
"use server";

import { auth } from "@/auth";
import { awardPoints } from "@/lib/gamification/points";
import { revalidatePath } from "next/cache";

export async function claimDailyBonus() {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  // Check if already claimed today
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const existingClaim = await prisma.pointHistory.findFirst({
    where: {
      userId: session.user.id,
      reason: "DAILY_LOGIN",
      createdAt: { gte: today },
    },
  });

  if (existingClaim) {
    return { success: false, message: "Already claimed today" };
  }

  const { newTotal, levelUp } = await awardPoints(session.user.id, "DAILY_LOGIN");

  revalidatePath("/profile");

  return {
    success: true,
    points: POINT_VALUES.DAILY_LOGIN,
    newTotal,
    levelUp,
  };
}
```

## Anti-patterns

### Don't Award Points Without Tracking

```typescript
// BAD - No history
await prisma.user.update({
  where: { id: userId },
  data: { points: { increment: 10 } },
});

// GOOD - Track in history
await awardPoints(userId, "POST_CREATED", { postId });
```

## Related Patterns

- [notifications](./notifications.md)
- [real-time](./real-time.md)
- [social-features](./social-features.md)

---

## Changelog

### 1.0.0 (2025-01-18)
- Initial implementation
- Points and levels
- Achievements and badges
- Leaderboard system
