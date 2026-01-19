---
id: r-meditation-app
name: Meditation App
version: 3.0.0
layer: L6
category: recipes
description: Mobile-first meditation app with audio player, guided sessions, streaks, and PWA offline support
tags: [meditation, audio, wellness, mindfulness, pwa, mobile-first, streaks]
formula: "MeditationApp = DashboardLayout(t-dashboard-layout) + OnboardingLayout(t-onboarding-layout) + SettingsPage(t-settings-page) + AuthLayout(t-auth-layout) + ProfilePage(t-profile-page) + Header(o-header) + Calendar(o-calendar) + StatsDashboard(o-stats-dashboard) + OnboardingFlow(o-onboarding-flow) + Tabs(o-tabs) + Modal(o-modal) + MediaGallery(o-media-gallery) + Footer(o-footer) + Sidebar(o-sidebar) + Breadcrumb(m-breadcrumb) + Card(m-card) + FormField(m-form-field) + Badge(m-badge) + Avatar(m-avatar) + StatCard(m-stat-card) + Stepper(m-stepper) + RangeSlider(m-range-slider) + ProgressBar(m-progress-bar) + Toast(m-toast) + SearchInput(m-search-input) + Pagination(m-pagination) + EmptyState(m-empty-state) + NextAuth(pt-next-auth) + AuthMiddleware(pt-auth-middleware) + SessionManagement(pt-session-management) + RateLimiting(pt-rate-limiting) + FormValidation(pt-form-validation) + ZodSchemas(pt-zod-schemas) + ServerActions(pt-server-actions) + Pwa(pt-pwa) + MobileFirst(pt-mobile-first) + OfflineSync(pt-offline-sync) + IndexedDb(pt-indexed-db) + Persistence(pt-persistence) + AudioPlayer(pt-audio-player) + BackgroundAudio(pt-background-audio) + PushNotifications(pt-push-notifications) + ErrorBoundaries(pt-error-boundaries) + ErrorTracking(pt-error-tracking) + SkeletonLoading(pt-skeleton-loading) + AnalyticsEvents(pt-analytics-events) + Zustand(pt-zustand) + ReactQuery(pt-react-query) + OptimisticUpdates(pt-optimistic-updates) + Animations(pt-animations) + Gamification(pt-gamification) + StripeSubscriptions(pt-stripe-subscriptions) + TestingE2e(pt-testing-e2e) + TestingUnit(pt-testing-unit) + AuditLogging(pt-audit-logging) + Csp(pt-csp) + InputSanitization(pt-input-sanitization) + GdprCompliance(pt-gdpr-compliance) + Sitemap(pt-sitemap) + StructuredData(pt-structured-data) + MetadataApi(pt-metadata-api) + UserAnalytics(pt-user-analytics)"
composes:
  # L4 Templates
  - ../templates/dashboard-layout.md
  - ../templates/onboarding-layout.md
  - ../templates/settings-page.md
  - ../templates/auth-layout.md
  - ../templates/profile-page.md
  # L3 Organisms
  - ../organisms/header.md
  - ../organisms/calendar.md
  - ../organisms/stats-dashboard.md
  - ../organisms/onboarding-flow.md
  - ../organisms/tabs.md
  - ../organisms/modal.md
  - ../organisms/media-gallery.md
  # L2 Molecules
  - ../molecules/breadcrumb.md
  - ../molecules/card.md
  - ../molecules/form-field.md
  - ../molecules/badge.md
  - ../molecules/avatar.md
  - ../molecules/stat-card.md
  - ../molecules/stepper.md
  - ../molecules/range-slider.md
  - ../molecules/progress-bar.md
  - ../molecules/toast.md
  # L5 Patterns - Authentication
  - ../patterns/next-auth.md
  - ../patterns/auth-middleware.md
  - ../patterns/session-management.md
  # L5 Patterns - Security
  - ../patterns/rate-limiting.md
  # L5 Patterns - Forms & Validation
  - ../patterns/form-validation.md
  - ../patterns/zod-schemas.md
  - ../patterns/server-actions.md
  # L5 Patterns - PWA & Mobile
  - ../patterns/pwa.md
  - ../patterns/mobile-first.md
  - ../patterns/offline-sync.md
  - ../patterns/indexed-db.md
  - ../patterns/persistence.md
  # L5 Patterns - Audio
  - ../patterns/audio-player.md
  - ../patterns/background-audio.md
  # L5 Patterns - Communication
  - ../patterns/push-notifications.md
  # L5 Patterns - Error Handling
  - ../patterns/error-boundaries.md
  - ../patterns/error-tracking.md
  - ../patterns/skeleton-loading.md
  # L5 Patterns - Analytics
  - ../patterns/analytics-events.md
  # L5 Patterns - State Management
  - ../patterns/zustand.md
  - ../patterns/react-query.md
  - ../patterns/optimistic-updates.md
  # L5 Patterns - Meditation Specific
  - ../patterns/animations.md
  - ../patterns/gamification.md
  - ../patterns/stripe-subscriptions.md
  # L5 Patterns - Testing
  - ../patterns/testing-e2e.md
  - ../patterns/testing-unit.md
  # L5 Patterns - Security (Additional)
  - ../patterns/audit-logging.md
  - ../patterns/csp.md
  - ../patterns/input-sanitization.md
  # L5 Patterns - Privacy
  - ../patterns/gdpr-compliance.md
  # L5 Patterns - SEO
  - ../patterns/sitemap.md
  - ../patterns/structured-data.md
  - ../patterns/metadata-api.md
  # L5 Patterns - Analytics (Additional)
  - ../patterns/user-analytics.md
  # L3 Organisms - Additional
  - ../organisms/footer.md
  - ../organisms/sidebar.md
  # L2 Molecules - Additional
  - ../molecules/search-input.md
  - ../molecules/pagination.md
  - ../molecules/empty-state.md
dependencies:
  - next@15.0.0
  - react@19.0.0
  - prisma@6.0.0
  - howler@2.2.0
skills:
  - pwa
  - mobile-first
  - audio-player
  - offline-sync
  - streaks
  - animations
performance:
  impact: high
  lcp: medium
  cls: low
accessibility:
  wcag: AA
  keyboard: true
  screen-reader: true
---

## Overview

A serene mobile-first meditation application featuring guided audio sessions, ambient sounds, streak tracking for consistency, and full PWA support for offline meditation. Includes breathing exercises, sleep stories, and progress tracking.

## Project Structure

```
app/
├── (auth)/
│   ├── login/page.tsx
│   └── register/page.tsx
├── (app)/
│   ├── layout.tsx
│   ├── page.tsx                    # Home / featured sessions
│   ├── meditate/
│   │   ├── page.tsx                # Browse meditations
│   │   ├── [id]/page.tsx           # Session detail
│   │   └── player/page.tsx         # Active player
│   ├── breathe/page.tsx            # Breathing exercises
│   ├── sleep/
│   │   ├── page.tsx                # Sleep content
│   │   └── [id]/page.tsx           # Sleep story
│   ├── sounds/page.tsx             # Ambient sounds mixer
│   ├── progress/
│   │   ├── page.tsx                # Stats & streaks
│   │   └── history/page.tsx        # Session history
│   └── settings/
│       ├── page.tsx
│       ├── reminders/page.tsx
│       └── downloads/page.tsx      # Offline content
├── api/
│   ├── sessions/
│   │   ├── route.ts
│   │   └── [id]/route.ts
│   ├── progress/route.ts
│   ├── favorites/route.ts
│   └── download/route.ts
├── manifest.ts
└── sw.ts
components/
├── player/
│   ├── audio-player.tsx
│   ├── player-controls.tsx
│   ├── progress-ring.tsx
│   ├── background-sounds.tsx
│   └── mini-player.tsx
├── breathing/
│   ├── breath-circle.tsx
│   └── breath-guide.tsx
├── sessions/
│   ├── session-card.tsx
│   ├── session-list.tsx
│   └── category-tabs.tsx
├── progress/
│   ├── streak-calendar.tsx
│   ├── stats-overview.tsx
│   └── achievement-card.tsx
└── ui/
    ├── gradient-background.tsx
    └── animated-waves.tsx
lib/
├── audio.ts
├── offline-db.ts
└── streak-utils.ts
public/
├── audio/                          # Audio files
└── icons/                          # PWA icons
```

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

model User {
  id              String    @id @default(cuid())
  email           String    @unique
  name            String
  passwordHash    String
  avatarUrl       String?
  
  // Preferences
  preferredDuration Int     @default(10)  // Minutes
  dailyGoal       Int       @default(10)  // Minutes
  reminderTime    String?   // HH:mm format
  reminderEnabled Boolean   @default(false)
  
  // Stats
  totalMinutes    Int       @default(0)
  totalSessions   Int       @default(0)
  currentStreak   Int       @default(0)
  longestStreak   Int       @default(0)
  lastSessionDate DateTime?
  
  sessions        UserSession[]
  favorites       Favorite[]
  downloads       Download[]
  achievements    UserAchievement[]
  
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}

model Category {
  id          String    @id @default(cuid())
  name        String    @unique
  slug        String    @unique
  description String?
  icon        String?
  color       String?
  order       Int       @default(0)
  
  sessions    Session[]
}

model Session {
  id              String       @id @default(cuid())
  categoryId      String
  
  title           String
  slug            String       @unique
  description     String       @db.Text
  
  // Media
  audioUrl        String
  imageUrl        String?
  duration        Int          // Seconds
  
  // Metadata
  type            SessionType  @default(GUIDED)
  difficulty      Difficulty   @default(BEGINNER)
  instructor      String?
  
  // Content
  tags            String[]
  benefits        String[]
  
  isFeatured      Boolean      @default(false)
  isPremium       Boolean      @default(false)
  isPublished     Boolean      @default(true)
  
  category        Category     @relation(fields: [categoryId], references: [id])
  userSessions    UserSession[]
  favorites       Favorite[]
  downloads       Download[]
  
  createdAt       DateTime     @default(now())
  updatedAt       DateTime     @updatedAt
  
  @@index([categoryId])
  @@index([type])
  @@index([isFeatured])
}

enum SessionType {
  GUIDED
  UNGUIDED
  SLEEP_STORY
  MUSIC
  SOUNDSCAPE
}

enum Difficulty {
  BEGINNER
  INTERMEDIATE
  ADVANCED
}

model UserSession {
  id          String    @id @default(cuid())
  userId      String
  sessionId   String
  
  startedAt   DateTime  @default(now())
  completedAt DateTime?
  duration    Int       // Actual duration listened (seconds)
  completed   Boolean   @default(false)
  
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  session     Session   @relation(fields: [sessionId], references: [id])
  
  @@index([userId])
  @@index([sessionId])
  @@index([startedAt])
}

model Favorite {
  id        String   @id @default(cuid())
  userId    String
  sessionId String
  
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  session   Session  @relation(fields: [sessionId], references: [id])
  
  createdAt DateTime @default(now())
  
  @@unique([userId, sessionId])
}

model Download {
  id          String   @id @default(cuid())
  userId      String
  sessionId   String
  
  fileSize    Int      // Bytes
  downloadedAt DateTime @default(now())
  expiresAt   DateTime?
  
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  session     Session  @relation(fields: [sessionId], references: [id])
  
  @@unique([userId, sessionId])
}

model AmbientSound {
  id        String   @id @default(cuid())
  name      String
  slug      String   @unique
  icon      String
  audioUrl  String
  category  String   // nature, weather, urban, white-noise
  
  createdAt DateTime @default(now())
}

model BreathingExercise {
  id          String   @id @default(cuid())
  name        String
  slug        String   @unique
  description String
  
  // Pattern (seconds)
  inhale      Int
  hold1       Int      @default(0)
  exhale      Int
  hold2       Int      @default(0)
  
  cycles      Int      @default(4)
  
  benefits    String[]
  
  createdAt   DateTime @default(now())
}

model Achievement {
  id          String   @id @default(cuid())
  name        String
  description String
  icon        String
  category    AchievementCategory
  
  // Requirement
  requirement Json     // e.g., { type: "streak", value: 7 }
  
  users       UserAchievement[]
}

enum AchievementCategory {
  STREAK
  MINUTES
  SESSIONS
  EXPLORATION
}

model UserAchievement {
  id            String      @id @default(cuid())
  userId        String
  achievementId String
  
  unlockedAt    DateTime    @default(now())
  
  user          User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  achievement   Achievement @relation(fields: [achievementId], references: [id])
  
  @@unique([userId, achievementId])
}
```

## Implementation

### Audio Player Component

```tsx
// components/player/audio-player.tsx
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Howl } from 'howler';
import { Play, Pause, SkipBack, SkipForward, Volume2 } from 'lucide-react';
import { ProgressRing } from './progress-ring';
import { BackgroundSounds } from './background-sounds';
import { usePlayerStore } from '@/stores/player-store';

interface AudioPlayerProps {
  session: {
    id: string;
    title: string;
    audioUrl: string;
    duration: number;
    imageUrl?: string;
    instructor?: string;
  };
  onComplete: () => void;
}

export function AudioPlayer({ session, onComplete }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(session.duration);
  const [showSounds, setShowSounds] = useState(false);
  const soundRef = useRef<Howl | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const { backgroundVolume, backgroundSounds } = usePlayerStore();
  
  // Initialize audio
  useEffect(() => {
    soundRef.current = new Howl({
      src: [session.audioUrl],
      html5: true,
      preload: true,
      onload: () => {
        setDuration(soundRef.current?.duration() || session.duration);
      },
      onend: () => {
        setIsPlaying(false);
        onComplete();
      },
    });
    
    return () => {
      soundRef.current?.unload();
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [session.audioUrl, session.duration, onComplete]);
  
  // Track progress
  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        if (soundRef.current) {
          setCurrentTime(soundRef.current.seek() as number);
        }
      }, 100);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
    
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying]);
  
  const togglePlay = useCallback(() => {
    if (!soundRef.current) return;
    
    if (isPlaying) {
      soundRef.current.pause();
    } else {
      soundRef.current.play();
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying]);
  
  const seek = useCallback((time: number) => {
    if (soundRef.current) {
      soundRef.current.seek(time);
      setCurrentTime(time);
    }
  }, []);
  
  const skip = useCallback((seconds: number) => {
    const newTime = Math.max(0, Math.min(currentTime + seconds, duration));
    seek(newTime);
  }, [currentTime, duration, seek]);
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  const progress = (currentTime / duration) * 100;
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-900 via-purple-900 to-slate-900 text-white flex flex-col">
      {/* Background Image */}
      {session.imageUrl && (
        <div 
          className="absolute inset-0 opacity-20 bg-cover bg-center"
          style={{ backgroundImage: `url(${session.imageUrl})` }}
        />
      )}
      
      {/* Content */}
      <div className="relative flex-1 flex flex-col items-center justify-center px-8">
        {/* Progress Ring */}
        <div className="mb-8">
          <ProgressRing
            progress={progress}
            size={280}
            strokeWidth={6}
            isPlaying={isPlaying}
          />
        </div>
        
        {/* Session Info */}
        <h1 className="text-2xl font-semibold text-center mb-2">
          {session.title}
        </h1>
        {session.instructor && (
          <p className="text-white/60 mb-8">{session.instructor}</p>
        )}
        
        {/* Time Display */}
        <div className="flex items-center gap-4 text-sm text-white/60 mb-8">
          <span>{formatTime(currentTime)}</span>
          <div className="w-48 h-1 bg-white/20 rounded-full overflow-hidden">
            <div 
              className="h-full bg-white rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span>{formatTime(duration)}</span>
        </div>
        
        {/* Controls */}
        <div className="flex items-center gap-8">
          <button
            onClick={() => skip(-15)}
            className="p-3 text-white/60 hover:text-white transition-colors"
          >
            <SkipBack className="h-8 w-8" />
          </button>
          
          <button
            onClick={togglePlay}
            className="p-6 bg-white rounded-full text-indigo-900 hover:scale-105 transition-transform"
          >
            {isPlaying ? (
              <Pause className="h-10 w-10" fill="currentColor" />
            ) : (
              <Play className="h-10 w-10 ml-1" fill="currentColor" />
            )}
          </button>
          
          <button
            onClick={() => skip(15)}
            className="p-3 text-white/60 hover:text-white transition-colors"
          >
            <SkipForward className="h-8 w-8" />
          </button>
        </div>
      </div>
      
      {/* Bottom Actions */}
      <div className="relative p-6 flex justify-center gap-8">
        <button
          onClick={() => setShowSounds(!showSounds)}
          className={`p-3 rounded-full ${
            backgroundSounds.length > 0 ? 'bg-white/20' : 'bg-white/10'
          }`}
        >
          <Volume2 className="h-6 w-6" />
        </button>
      </div>
      
      {/* Background Sounds Panel */}
      {showSounds && (
        <BackgroundSounds onClose={() => setShowSounds(false)} />
      )}
    </div>
  );
}
```

### Progress Ring Component

```tsx
// components/player/progress-ring.tsx
'use client';

import { motion } from 'framer-motion';

interface ProgressRingProps {
  progress: number;
  size: number;
  strokeWidth: number;
  isPlaying: boolean;
}

export function ProgressRing({ progress, size, strokeWidth, isPlaying }: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;
  
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth={strokeWidth}
        />
        
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#gradient)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          initial={false}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.1 }}
        />
        
        {/* Gradient definition */}
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#818cf8" />
            <stop offset="100%" stopColor="#c084fc" />
          </linearGradient>
        </defs>
      </svg>
      
      {/* Center breathing animation */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          className="w-32 h-32 rounded-full bg-white/10"
          animate={isPlaying ? {
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.5, 0.3],
          } : {}}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>
    </div>
  );
}
```

### Breathing Exercise Component

```tsx
// components/breathing/breath-circle.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface BreathCircleProps {
  exercise: {
    name: string;
    inhale: number;
    hold1: number;
    exhale: number;
    hold2: number;
    cycles: number;
  };
  onComplete: () => void;
}

type Phase = 'inhale' | 'hold1' | 'exhale' | 'hold2';

export function BreathCircle({ exercise, onComplete }: BreathCircleProps) {
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState<Phase>('inhale');
  const [currentCycle, setCurrentCycle] = useState(1);
  const [countdown, setCountdown] = useState(exercise.inhale);
  
  const phaseLabels: Record<Phase, string> = {
    inhale: 'Breathe In',
    hold1: 'Hold',
    exhale: 'Breathe Out',
    hold2: 'Hold',
  };
  
  const getPhaseDuration = useCallback((phase: Phase) => {
    switch (phase) {
      case 'inhale': return exercise.inhale;
      case 'hold1': return exercise.hold1;
      case 'exhale': return exercise.exhale;
      case 'hold2': return exercise.hold2;
    }
  }, [exercise]);
  
  const getNextPhase = useCallback((current: Phase): Phase | null => {
    switch (current) {
      case 'inhale': return exercise.hold1 > 0 ? 'hold1' : 'exhale';
      case 'hold1': return 'exhale';
      case 'exhale': return exercise.hold2 > 0 ? 'hold2' : 'inhale';
      case 'hold2': return 'inhale';
    }
  }, [exercise]);
  
  useEffect(() => {
    if (!isActive) return;
    
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          const nextPhase = getNextPhase(phase);
          
          if (nextPhase === 'inhale') {
            if (currentCycle >= exercise.cycles) {
              setIsActive(false);
              onComplete();
              return exercise.inhale;
            }
            setCurrentCycle((c) => c + 1);
          }
          
          if (nextPhase) {
            setPhase(nextPhase);
            return getPhaseDuration(nextPhase);
          }
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [isActive, phase, currentCycle, exercise.cycles, getNextPhase, getPhaseDuration, onComplete]);
  
  const getCircleScale = () => {
    switch (phase) {
      case 'inhale': return 1.5;
      case 'hold1': return 1.5;
      case 'exhale': return 1;
      case 'hold2': return 1;
    }
  };
  
  const handleStart = () => {
    setIsActive(true);
    setPhase('inhale');
    setCurrentCycle(1);
    setCountdown(exercise.inhale);
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-900 via-cyan-900 to-slate-900 flex flex-col items-center justify-center text-white">
      {/* Cycle indicator */}
      <div className="mb-8">
        <p className="text-sm text-white/60">
          Cycle {currentCycle} of {exercise.cycles}
        </p>
      </div>
      
      {/* Breathing circle */}
      <div className="relative w-64 h-64 flex items-center justify-center">
        {/* Outer ring */}
        <div className="absolute inset-0 rounded-full border-2 border-white/20" />
        
        {/* Animated circle */}
        <motion.div
          className="absolute rounded-full bg-gradient-to-br from-teal-400/50 to-cyan-400/50"
          initial={{ width: 120, height: 120 }}
          animate={isActive ? {
            width: getCircleScale() * 120,
            height: getCircleScale() * 120,
          } : {}}
          transition={{
            duration: getPhaseDuration(phase),
            ease: phase === 'inhale' || phase === 'exhale' ? 'easeInOut' : 'linear',
          }}
        />
        
        {/* Center content */}
        <div className="relative z-10 text-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={phase}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <p className="text-2xl font-light mb-2">{phaseLabels[phase]}</p>
              <p className="text-5xl font-bold">{countdown}</p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
      
      {/* Start/Stop button */}
      <div className="mt-12">
        {!isActive ? (
          <button
            onClick={handleStart}
            className="px-8 py-4 bg-white/20 rounded-full text-lg font-medium hover:bg-white/30 transition-colors"
          >
            Start Breathing
          </button>
        ) : (
          <button
            onClick={() => setIsActive(false)}
            className="px-8 py-4 bg-white/10 rounded-full text-lg font-medium hover:bg-white/20 transition-colors"
          >
            Pause
          </button>
        )}
      </div>
      
      {/* Exercise name */}
      <p className="mt-8 text-white/40 text-sm">{exercise.name}</p>
    </div>
  );
}
```

### Streak Calendar

```tsx
// components/progress/streak-calendar.tsx
'use client';

import { useMemo } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, subMonths, addMonths } from 'date-fns';
import { ChevronLeft, ChevronRight, Flame } from 'lucide-react';
import { useState } from 'react';

interface StreakCalendarProps {
  sessionDates: Date[];
  currentStreak: number;
  longestStreak: number;
}

export function StreakCalendar({ sessionDates, currentStreak, longestStreak }: StreakCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  const days = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);
  
  const firstDayOfWeek = useMemo(() => {
    return startOfMonth(currentMonth).getDay();
  }, [currentMonth]);
  
  const hasSession = (day: Date) => {
    return sessionDates.some(date => isSameDay(date, day));
  };
  
  return (
    <div className="bg-white rounded-2xl p-6">
      {/* Streak Stats */}
      <div className="flex justify-center gap-8 mb-6">
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-orange-500 mb-1">
            <Flame className="h-5 w-5" />
            <span className="text-2xl font-bold">{currentStreak}</span>
          </div>
          <p className="text-xs text-gray-500">Current Streak</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-purple-500 mb-1">
            <Flame className="h-5 w-5" />
            <span className="text-2xl font-bold">{longestStreak}</span>
          </div>
          <p className="text-xs text-gray-500">Longest Streak</p>
        </div>
      </div>
      
      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h3 className="font-semibold">{format(currentMonth, 'MMMM yyyy')}</h3>
        <button
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
      
      {/* Day Headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
          <div key={i} className="text-center text-xs text-gray-400 py-2">
            {day}
          </div>
        ))}
      </div>
      
      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Empty cells for alignment */}
        {Array.from({ length: firstDayOfWeek }).map((_, i) => (
          <div key={`empty-${i}`} className="aspect-square" />
        ))}
        
        {/* Day cells */}
        {days.map((day) => {
          const completed = hasSession(day);
          const today = isToday(day);
          
          return (
            <div
              key={day.toISOString()}
              className={`aspect-square flex items-center justify-center rounded-full text-sm ${
                completed
                  ? 'bg-gradient-to-br from-indigo-500 to-purple-500 text-white'
                  : today
                  ? 'border-2 border-indigo-300'
                  : ''
              }`}
            >
              {format(day, 'd')}
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

### Ambient Sounds Mixer

```tsx
// components/player/background-sounds.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { Howl } from 'howler';
import { X, Volume2 } from 'lucide-react';
import { usePlayerStore } from '@/stores/player-store';

interface Sound {
  id: string;
  name: string;
  icon: string;
  audioUrl: string;
}

const AMBIENT_SOUNDS: Sound[] = [
  { id: 'rain', name: 'Rain', icon: '🌧️', audioUrl: '/audio/rain.mp3' },
  { id: 'ocean', name: 'Ocean', icon: '🌊', audioUrl: '/audio/ocean.mp3' },
  { id: 'forest', name: 'Forest', icon: '🌲', audioUrl: '/audio/forest.mp3' },
  { id: 'fire', name: 'Fireplace', icon: '🔥', audioUrl: '/audio/fire.mp3' },
  { id: 'wind', name: 'Wind', icon: '💨', audioUrl: '/audio/wind.mp3' },
  { id: 'birds', name: 'Birds', icon: '🐦', audioUrl: '/audio/birds.mp3' },
  { id: 'thunder', name: 'Thunder', icon: '⛈️', audioUrl: '/audio/thunder.mp3' },
  { id: 'stream', name: 'Stream', icon: '💧', audioUrl: '/audio/stream.mp3' },
];

interface BackgroundSoundsProps {
  onClose: () => void;
}

export function BackgroundSounds({ onClose }: BackgroundSoundsProps) {
  const { 
    backgroundSounds, 
    soundVolumes,
    toggleSound, 
    setSoundVolume 
  } = usePlayerStore();
  
  const soundsRef = useRef<Map<string, Howl>>(new Map());
  
  // Initialize and cleanup sounds
  useEffect(() => {
    return () => {
      soundsRef.current.forEach(sound => sound.unload());
      soundsRef.current.clear();
    };
  }, []);
  
  // Handle sound toggle
  useEffect(() => {
    AMBIENT_SOUNDS.forEach(sound => {
      const isActive = backgroundSounds.includes(sound.id);
      const howl = soundsRef.current.get(sound.id);
      
      if (isActive && !howl) {
        // Create and play new sound
        const newHowl = new Howl({
          src: [sound.audioUrl],
          loop: true,
          volume: (soundVolumes[sound.id] || 50) / 100,
        });
        newHowl.play();
        soundsRef.current.set(sound.id, newHowl);
      } else if (!isActive && howl) {
        // Stop and remove sound
        howl.stop();
        howl.unload();
        soundsRef.current.delete(sound.id);
      }
    });
  }, [backgroundSounds, soundVolumes]);
  
  // Update volume when slider changes
  const handleVolumeChange = (soundId: string, volume: number) => {
    setSoundVolume(soundId, volume);
    const howl = soundsRef.current.get(soundId);
    if (howl) {
      howl.volume(volume / 100);
    }
  };
  
  return (
    <div className="fixed inset-x-0 bottom-0 bg-slate-900/95 backdrop-blur-lg rounded-t-3xl p-6 z-50">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">Background Sounds</h3>
        <button onClick={onClose} className="p-2 text-white/60 hover:text-white">
          <X className="h-5 w-5" />
        </button>
      </div>
      
      {/* Sound Grid */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {AMBIENT_SOUNDS.map((sound) => {
          const isActive = backgroundSounds.includes(sound.id);
          
          return (
            <button
              key={sound.id}
              onClick={() => toggleSound(sound.id)}
              className={`flex flex-col items-center p-3 rounded-xl transition-colors ${
                isActive
                  ? 'bg-indigo-600/30 ring-2 ring-indigo-500'
                  : 'bg-white/5 hover:bg-white/10'
              }`}
            >
              <span className="text-2xl mb-1">{sound.icon}</span>
              <span className="text-xs text-white/70">{sound.name}</span>
            </button>
          );
        })}
      </div>
      
      {/* Active Sound Volumes */}
      {backgroundSounds.length > 0 && (
        <div className="space-y-4 pt-4 border-t border-white/10">
          {backgroundSounds.map((soundId) => {
            const sound = AMBIENT_SOUNDS.find(s => s.id === soundId);
            if (!sound) return null;
            
            return (
              <div key={soundId} className="flex items-center gap-4">
                <span className="text-lg">{sound.icon}</span>
                <span className="text-sm text-white/70 w-20">{sound.name}</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={soundVolumes[soundId] || 50}
                  onChange={(e) => handleVolumeChange(soundId, parseInt(e.target.value))}
                  className="flex-1 h-1 bg-white/20 rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full"
                />
                <Volume2 className="h-4 w-4 text-white/40" />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
```

### PWA Service Worker

```tsx
// public/sw.js
const CACHE_NAME = 'meditation-app-v1';
const AUDIO_CACHE = 'meditation-audio-v1';

const STATIC_ASSETS = [
  '/',
  '/meditate',
  '/breathe',
  '/sounds',
  '/progress',
  '/manifest.json',
];

// Install - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate - clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME && key !== AUDIO_CACHE)
          .map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// Fetch handler with audio caching
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Handle audio files - cache first
  if (url.pathname.startsWith('/audio/') || event.request.destination === 'audio') {
    event.respondWith(
      caches.open(AUDIO_CACHE).then((cache) => {
        return cache.match(event.request).then((cached) => {
          if (cached) return cached;
          
          return fetch(event.request).then((response) => {
            cache.put(event.request, response.clone());
            return response;
          });
        });
      })
    );
    return;
  }
  
  // Network first for API
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match(event.request);
      })
    );
    return;
  }
  
  // Cache first for static assets
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      
      return fetch(event.request).then((response) => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, clone);
          });
        }
        return response;
      });
    })
  );
});

// Handle audio download for offline
self.addEventListener('message', (event) => {
  if (event.data.type === 'DOWNLOAD_AUDIO') {
    const { url, sessionId } = event.data;
    
    caches.open(AUDIO_CACHE).then((cache) => {
      fetch(url).then((response) => {
        cache.put(url, response);
        event.source.postMessage({
          type: 'DOWNLOAD_COMPLETE',
          sessionId,
        });
      });
    });
  }
});
```

## Skills Used

| Skill | Purpose | Reference |
|-------|---------|-----------|
| pwa | Progressive Web App with offline support | [indexed-db.md](../patterns/indexed-db.md) |
| mobile-first | Mobile-optimized UI design | [dashboard-layout.md](../templates/dashboard-layout.md) |
| audio-player | Meditation audio playback with Howler.js | [persistence.md](../patterns/persistence.md) |
| offline-sync | IndexedDB for offline sessions | [indexed-db.md](../patterns/indexed-db.md) |
| streaks | Daily streak tracking and achievements | [zustand.md](../patterns/zustand.md) |
| animations | Breathing animations with Framer Motion | [calendar.md](../organisms/calendar.md) |

## Testing

### Test Setup

```tsx
// __tests__/setup.ts
import '@testing-library/jest-dom';
import { server } from './mocks/server';

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// Mock Howler.js
jest.mock('howler', () => ({
  Howl: jest.fn().mockImplementation(() => ({
    play: jest.fn(),
    pause: jest.fn(),
    stop: jest.fn(),
    seek: jest.fn(),
    duration: jest.fn(() => 300),
    unload: jest.fn(),
  })),
}));
```

### Unit Tests

```tsx
// __tests__/lib/streak-utils.test.ts
import { calculateStreak, isStreakBroken, getStreakDates } from '@/lib/streak-utils';

describe('calculateStreak', () => {
  it('calculates consecutive days', () => {
    const dates = [
      new Date('2025-01-15'),
      new Date('2025-01-16'),
      new Date('2025-01-17'),
    ];
    expect(calculateStreak(dates)).toBe(3);
  });

  it('handles broken streaks', () => {
    const dates = [
      new Date('2025-01-14'),
      new Date('2025-01-17'), // Gap
    ];
    expect(calculateStreak(dates)).toBe(1);
  });

  it('returns 0 for empty array', () => {
    expect(calculateStreak([])).toBe(0);
  });
});

describe('isStreakBroken', () => {
  it('returns false for consecutive days', () => {
    const lastSession = new Date();
    lastSession.setDate(lastSession.getDate() - 1);
    expect(isStreakBroken(lastSession)).toBe(false);
  });

  it('returns true for gap > 1 day', () => {
    const lastSession = new Date();
    lastSession.setDate(lastSession.getDate() - 3);
    expect(isStreakBroken(lastSession)).toBe(true);
  });
});
```

### Component Tests

```tsx
// __tests__/components/breath-circle.test.tsx
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BreathCircle } from '@/components/breathing/breath-circle';

const mockExercise = {
  name: 'Box Breathing',
  inhale: 4,
  hold1: 4,
  exhale: 4,
  hold2: 4,
  cycles: 2,
};

describe('BreathCircle', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('shows start button initially', () => {
    render(<BreathCircle exercise={mockExercise} onComplete={jest.fn()} />);
    expect(screen.getByText('Start Breathing')).toBeInTheDocument();
  });

  it('displays breathing phases', async () => {
    render(<BreathCircle exercise={mockExercise} onComplete={jest.fn()} />);

    await userEvent.click(screen.getByText('Start Breathing'));

    expect(screen.getByText('Breathe In')).toBeInTheDocument();

    // Advance through inhale phase
    act(() => {
      jest.advanceTimersByTime(4000);
    });

    expect(screen.getByText('Hold')).toBeInTheDocument();
  });

  it('calls onComplete after all cycles', async () => {
    const onComplete = jest.fn();
    render(<BreathCircle exercise={mockExercise} onComplete={onComplete} />);

    await userEvent.click(screen.getByText('Start Breathing'));

    // Complete all cycles (2 cycles * 16 seconds each)
    act(() => {
      jest.advanceTimersByTime(32000);
    });

    expect(onComplete).toHaveBeenCalled();
  });
});
```

### E2E Tests (Playwright)

```tsx
// e2e/meditation.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Meditation App', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', 'user@test.com');
    await page.fill('input[name="password"]', 'password');
    await page.click('button[type="submit"]');
  });

  test('plays a meditation session', async ({ page }) => {
    await page.goto('/meditate');
    await page.click('[data-testid="session-card"]');

    // Start session
    await page.click('button[aria-label="Play"]');

    // Check progress ring updates
    await page.waitForTimeout(2000);
    const progressRing = page.locator('[data-testid="progress-ring"]');
    await expect(progressRing).toBeVisible();
  });

  test('tracks session completion', async ({ page }) => {
    await page.goto('/meditate/quick-calm');
    await page.click('button[aria-label="Play"]');

    // Wait for completion (mock short session)
    await page.evaluate(() => {
      window.dispatchEvent(new CustomEvent('session-complete'));
    });

    await expect(page.locator('text=Session Complete')).toBeVisible();
  });

  test('maintains streak after daily session', async ({ page }) => {
    await page.goto('/progress');
    const initialStreak = await page.locator('[data-testid="current-streak"]').textContent();

    // Complete a session
    await page.goto('/meditate/quick-calm');
    await page.evaluate(() => {
      window.dispatchEvent(new CustomEvent('session-complete'));
    });

    await page.goto('/progress');
    const newStreak = await page.locator('[data-testid="current-streak"]').textContent();

    expect(parseInt(newStreak!)).toBeGreaterThanOrEqual(parseInt(initialStreak!));
  });
});

test.describe('Breathing Exercises', () => {
  test('completes box breathing', async ({ page }) => {
    await page.goto('/breathe');
    await page.click('text=Box Breathing');
    await page.click('text=Start Breathing');

    await expect(page.locator('text=Breathe In')).toBeVisible();

    // Wait for cycle
    await page.waitForTimeout(5000);
    await expect(page.locator('text=Hold')).toBeVisible();
  });
});

test.describe('Offline Support', () => {
  test('works offline with cached sessions', async ({ page, context }) => {
    // First, cache content
    await page.goto('/meditate');
    await page.click('[data-testid="download-button"]');
    await page.waitForSelector('text=Downloaded');

    // Go offline
    await context.setOffline(true);

    // Navigate to downloaded session
    await page.goto('/settings/downloads');
    await page.click('[data-testid="offline-session"]');

    await expect(page.locator('button[aria-label="Play"]')).toBeEnabled();
  });
});
```

## Error Handling

### Error Boundary

```tsx
// components/error-boundary.tsx
'use client';

import { useEffect } from 'react';
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
    <div className="min-h-screen bg-gradient-to-b from-indigo-900 to-slate-900 flex items-center justify-center">
      <div className="text-center text-white">
        <h2 className="text-2xl font-semibold mb-4">Something went wrong</h2>
        <p className="text-white/60 mb-6">
          We couldn't load this meditation. Please try again.
        </p>
        <button
          onClick={reset}
          className="px-6 py-3 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
```

### API Error Handler

```tsx
// lib/api-error.ts
export class APIError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = 'APIError';
  }
}

export function handleAPIError(error: unknown) {
  if (error instanceof APIError) {
    return Response.json(
      { error: error.message, code: error.code },
      { status: error.statusCode }
    );
  }

  console.error('Unexpected error:', error);
  return Response.json(
    { error: 'Internal server error' },
    { status: 500 }
  );
}
```

### Audio Playback Error Handling

```tsx
// components/player/audio-player.tsx
const handleAudioError = useCallback((error: Error) => {
  console.error('Audio playback error:', error);

  // Try to recover from transient errors
  if (retryCount < 3) {
    setRetryCount(prev => prev + 1);
    soundRef.current?.play();
  } else {
    setError('Unable to play audio. Please check your connection.');
    Sentry.captureException(error, {
      tags: { feature: 'audio-player' },
      extra: { sessionId: session.id },
    });
  }
}, [retryCount, session.id]);
```

## Accessibility

### WCAG Compliance

| Criterion | Level | Implementation |
|-----------|-------|----------------|
| 1.1.1 Non-text Content | A | Alt text for session images |
| 1.3.1 Info and Relationships | A | Semantic HTML, ARIA labels |
| 1.4.3 Contrast | AA | 4.5:1 contrast (light text on dark bg) |
| 2.1.1 Keyboard | A | Full keyboard navigation |
| 2.4.4 Link Purpose | A | Descriptive session links |
| 1.4.11 Non-text Contrast | AA | Visual indicators for controls |

### Focus Management

```tsx
// components/player/audio-player.tsx
import { useRef, useEffect } from 'react';

export function AudioPlayer({ session, onComplete }: Props) {
  const playButtonRef = useRef<HTMLButtonElement>(null);

  // Focus play button on mount
  useEffect(() => {
    playButtonRef.current?.focus();
  }, []);

  // Announce state changes
  const [announcement, setAnnouncement] = useState('');

  const togglePlay = () => {
    if (isPlaying) {
      setAnnouncement('Paused');
    } else {
      setAnnouncement('Playing');
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div role="region" aria-label={`Meditation: ${session.title}`}>
      <div aria-live="polite" className="sr-only">
        {announcement}
      </div>

      <button
        ref={playButtonRef}
        onClick={togglePlay}
        aria-label={isPlaying ? 'Pause meditation' : 'Play meditation'}
        aria-pressed={isPlaying}
      >
        {isPlaying ? <Pause /> : <Play />}
      </button>
    </div>
  );
}
```

### Accessible Breathing Animation

```tsx
// components/breathing/breath-circle.tsx
<div
  role="timer"
  aria-live="assertive"
  aria-atomic="true"
  aria-label={`${phaseLabels[phase]}, ${countdown} seconds remaining`}
>
  <motion.div
    aria-hidden="true"
    className="breath-circle"
    animate={{ scale: getCircleScale() }}
  />
  <p className="text-2xl">{phaseLabels[phase]}</p>
  <p className="text-5xl">{countdown}</p>
</div>
```

## Security

### Zod Validation

```tsx
// lib/validations/session.ts
import { z } from 'zod';

export const sessionProgressSchema = z.object({
  sessionId: z.string().cuid(),
  duration: z.number().int().min(0).max(7200), // Max 2 hours
  completed: z.boolean(),
});

export const userPreferencesSchema = z.object({
  preferredDuration: z.number().int().min(1).max(60),
  dailyGoal: z.number().int().min(1).max(120),
  reminderTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/).optional(),
  reminderEnabled: z.boolean(),
});

export const downloadRequestSchema = z.object({
  sessionId: z.string().cuid(),
});
```

### Rate Limiting

```tsx
// middleware.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(60, '1 m'),
});

export async function middleware(request: NextRequest) {
  // Rate limit progress updates
  if (request.nextUrl.pathname.startsWith('/api/progress')) {
    const ip = request.ip ?? '127.0.0.1';
    const { success } = await ratelimit.limit(`progress:${ip}`);

    if (!success) {
      return new Response('Too many requests', { status: 429 });
    }
  }

  // Rate limit downloads
  if (request.nextUrl.pathname.startsWith('/api/download')) {
    const ip = request.ip ?? '127.0.0.1';
    const { success } = await ratelimit.limit(`download:${ip}`);

    if (!success) {
      return new Response('Download limit exceeded', { status: 429 });
    }
  }
}
```

### Auth Middleware

```tsx
// lib/auth-middleware.ts
import { getServerSession } from 'next-auth';
import { authOptions } from './auth';

export async function requireAuth() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    throw new APIError('Unauthorized', 401);
  }
  return session.user;
}

export async function getUserProgress(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      currentStreak: true,
      longestStreak: true,
      totalMinutes: true,
      totalSessions: true,
      lastSessionDate: true,
    },
  });
}
```

## Performance

### Audio Caching Strategy

```tsx
// lib/audio-cache.ts
const AUDIO_CACHE = 'meditation-audio-v1';

export async function cacheAudio(url: string): Promise<void> {
  const cache = await caches.open(AUDIO_CACHE);
  const response = await fetch(url);
  await cache.put(url, response);
}

export async function getCachedAudio(url: string): Promise<Response | undefined> {
  const cache = await caches.open(AUDIO_CACHE);
  return cache.match(url);
}

export async function clearOldCache(): Promise<void> {
  const cache = await caches.open(AUDIO_CACHE);
  const keys = await cache.keys();

  // Keep only last 10 downloaded sessions
  if (keys.length > 10) {
    const toDelete = keys.slice(0, keys.length - 10);
    await Promise.all(toDelete.map(key => cache.delete(key)));
  }
}
```

### IndexedDB for Offline Data

```tsx
// lib/offline-db.ts
import { openDB, IDBPDatabase } from 'idb';

interface MeditationDB {
  sessions: {
    key: string;
    value: {
      id: string;
      data: any;
      cachedAt: number;
    };
  };
  progress: {
    key: string;
    value: {
      sessionId: string;
      duration: number;
      completedAt: number;
      synced: boolean;
    };
  };
}

export async function getDB(): Promise<IDBPDatabase<MeditationDB>> {
  return openDB<MeditationDB>('meditation-app', 1, {
    upgrade(db) {
      db.createObjectStore('sessions', { keyPath: 'id' });
      db.createObjectStore('progress', { keyPath: 'sessionId' });
    },
  });
}

// Sync pending progress when online
export async function syncPendingProgress(): Promise<void> {
  const db = await getDB();
  const pending = await db.getAll('progress');
  const unsynced = pending.filter(p => !p.synced);

  for (const progress of unsynced) {
    try {
      await fetch('/api/progress', {
        method: 'POST',
        body: JSON.stringify(progress),
      });
      await db.put('progress', { ...progress, synced: true });
    } catch (e) {
      console.error('Failed to sync progress:', e);
    }
  }
}
```

### Bundle Optimization

```tsx
// Dynamic imports for heavy components
const AudioPlayer = dynamic(() => import('@/components/player/audio-player'), {
  loading: () => <PlayerSkeleton />,
  ssr: false,
});

const StreakCalendar = dynamic(() => import('@/components/progress/streak-calendar'), {
  loading: () => <CalendarSkeleton />,
  ssr: false,
});

// Preload audio on hover
const SessionCard = ({ session }: Props) => {
  const prefetchAudio = () => {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = session.audioUrl;
    document.head.appendChild(link);
  };

  return (
    <div onMouseEnter={prefetchAudio}>
      {/* Card content */}
    </div>
  );
};
```

## CI/CD

### GitHub Actions Workflow

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
        ports:
          - 5432:5432

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Generate Prisma client
        run: npx prisma generate

      - name: Run migrations
        run: npx prisma migrate deploy
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test

      - name: Run linting
        run: npm run lint

      - name: Run type check
        run: npm run type-check

      - name: Run unit tests
        run: npm run test
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test

      - name: Build application
        run: npm run build

  e2e:
    runs-on: ubuntu-latest
    needs: test

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright browsers
        run: npx playwright install --with-deps

      - name: Run E2E tests
        run: npm run test:e2e

      - name: Upload test results
        uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/

  lighthouse:
    runs-on: ubuntu-latest
    needs: test

    steps:
      - uses: actions/checkout@v4

      - name: Lighthouse CI
        uses: treosh/lighthouse-ci-action@v10
        with:
          urls: |
            http://localhost:3000
            http://localhost:3000/meditate
          configPath: ./lighthouse.config.js
```

## Monitoring

### Sentry Integration

```tsx
// sentry.client.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  integrations: [
    Sentry.replayIntegration(),
  ],
});

// Track audio playback errors
export function trackAudioError(sessionId: string, error: Error) {
  Sentry.captureException(error, {
    tags: { feature: 'audio-player' },
    extra: { sessionId },
  });
}

// Track offline sync issues
export function trackSyncError(error: Error) {
  Sentry.captureException(error, {
    tags: { feature: 'offline-sync' },
  });
}
```

### Health Checks

```tsx
// app/api/health/route.ts
import { prisma } from '@/lib/prisma';

export async function GET() {
  const checks = {
    database: false,
    audioStorage: false,
    timestamp: new Date().toISOString(),
  };

  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.database = true;
  } catch (e) {
    console.error('Database health check failed:', e);
  }

  // Check audio storage
  try {
    const response = await fetch(process.env.AUDIO_STORAGE_URL + '/health');
    checks.audioStorage = response.ok;
  } catch (e) {
    console.error('Audio storage health check failed:', e);
  }

  const healthy = checks.database && checks.audioStorage;

  return Response.json(checks, {
    status: healthy ? 200 : 503,
  });
}
```

## Environment Variables

```bash
# .env.example

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/meditation"

# Authentication
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# Audio Storage
AUDIO_STORAGE_URL="https://audio.example.com"
AUDIO_STORAGE_ACCESS_KEY="your-access-key"
AUDIO_STORAGE_SECRET_KEY="your-secret-key"

# Push Notifications
VAPID_PUBLIC_KEY="your-vapid-public-key"
VAPID_PRIVATE_KEY="your-vapid-private-key"

# Monitoring
NEXT_PUBLIC_SENTRY_DSN="https://..."
SENTRY_AUTH_TOKEN="sntrys_..."

# Rate Limiting
UPSTASH_REDIS_REST_URL="https://..."
UPSTASH_REDIS_REST_TOKEN="..."

# PWA
NEXT_PUBLIC_APP_NAME="Serenity"
NEXT_PUBLIC_APP_SHORT_NAME="Serenity"
```

## Deployment Checklist

- [ ] Environment variables configured in production
- [ ] Database migrations run successfully
- [ ] Audio storage and CDN configured
- [ ] SSL certificate installed
- [ ] PWA manifest configured
- [ ] Service worker registered
- [ ] Push notification credentials set up
- [ ] Rate limiting enabled
- [ ] Error monitoring configured (Sentry)
- [ ] Health check endpoint verified
- [ ] Offline functionality tested
- [ ] Audio streaming optimized
- [ ] Cache headers configured
- [ ] Lighthouse PWA score verified
- [ ] App store assets prepared (if applicable)
- [ ] Analytics tracking installed
- [ ] Backup strategy in place

## Related Skills

- [[pwa]] - Progressive Web App setup
- [[mobile-first]] - Mobile-first design
- [[audio-player]] - Audio playback
- [[offline-sync]] - Offline support
- [[animations]] - Framer Motion animations
- [[streaks]] - Streak tracking logic

## Changelog

- 1.0.0: Initial meditation app recipe with audio, breathing, and streaks
