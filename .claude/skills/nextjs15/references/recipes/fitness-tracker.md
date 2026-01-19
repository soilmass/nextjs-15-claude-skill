---
id: r-fitness-tracker
name: Fitness Tracker
version: 3.0.0
layer: L6
category: recipes
description: Mobile-first fitness tracking app with workouts, exercise library, progress charts, and goal tracking
tags: [fitness, workouts, exercise, health, mobile-first, pwa, charts]
formula: "FitnessTracker = DashboardLayout(t-dashboard-layout) + DashboardHome(t-dashboard-home) + SettingsPage(t-settings-page) + AuthLayout(t-auth-layout) + OnboardingLayout(t-onboarding-layout) + ProfilePage(t-profile-page) + Header(o-header) + Chart(o-chart) + Calendar(o-calendar) + StatsDashboard(o-stats-dashboard) + Tabs(o-tabs) + Modal(o-modal) + DataTable(o-data-table) + Footer(o-footer) + Sidebar(o-sidebar) + Breadcrumb(m-breadcrumb) + Pagination(m-pagination) + Card(m-card) + FormField(m-form-field) + Badge(m-badge) + Avatar(m-avatar) + StatCard(m-stat-card) + Stepper(m-stepper) + ProgressBar(m-progress-bar) + Toast(m-toast) + SearchInput(m-search-input) + EmptyState(m-empty-state) + NextAuth(pt-next-auth) + AuthMiddleware(pt-auth-middleware) + SessionManagement(pt-session-management) + RateLimiting(pt-rate-limiting) + FormValidation(pt-form-validation) + ZodSchemas(pt-zod-schemas) + ServerActions(pt-server-actions) + Pwa(pt-pwa) + MobileFirst(pt-mobile-first) + OfflineSync(pt-offline-sync) + IndexedDb(pt-indexed-db) + Persistence(pt-persistence) + PushNotifications(pt-push-notifications) + ErrorBoundaries(pt-error-boundaries) + ErrorTracking(pt-error-tracking) + SkeletonLoading(pt-skeleton-loading) + AnalyticsEvents(pt-analytics-events) + Charts(pt-charts) + Zustand(pt-zustand) + ReactQuery(pt-react-query) + OptimisticUpdates(pt-optimistic-updates) + Animations(pt-animations) + Gamification(pt-gamification) + SocialSharing(pt-social-sharing) + TestingE2e(pt-testing-e2e) + TestingUnit(pt-testing-unit) + AuditLogging(pt-audit-logging) + Csp(pt-csp) + InputSanitization(pt-input-sanitization) + GdprCompliance(pt-gdpr-compliance) + Sitemap(pt-sitemap) + StructuredData(pt-structured-data) + MetadataApi(pt-metadata-api) + UserAnalytics(pt-user-analytics)"
composes:
  # L4 Templates
  - ../templates/dashboard-layout.md
  - ../templates/dashboard-home.md
  - ../templates/settings-page.md
  - ../templates/auth-layout.md
  - ../templates/onboarding-layout.md
  - ../templates/profile-page.md
  # L3 Organisms
  - ../organisms/header.md
  - ../organisms/chart.md
  - ../organisms/calendar.md
  - ../organisms/stats-dashboard.md
  - ../organisms/tabs.md
  - ../organisms/modal.md
  - ../organisms/data-table.md
  # L2 Molecules
  - ../molecules/breadcrumb.md
  - ../molecules/pagination.md
  - ../molecules/card.md
  - ../molecules/form-field.md
  - ../molecules/badge.md
  - ../molecules/avatar.md
  - ../molecules/stat-card.md
  - ../molecules/stepper.md
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
  # L5 Patterns - Communication
  - ../patterns/push-notifications.md
  # L5 Patterns - Error Handling
  - ../patterns/error-boundaries.md
  - ../patterns/error-tracking.md
  - ../patterns/skeleton-loading.md
  # L5 Patterns - Analytics
  - ../patterns/analytics-events.md
  - ../patterns/charts.md
  # L5 Patterns - State Management
  - ../patterns/zustand.md
  - ../patterns/react-query.md
  - ../patterns/optimistic-updates.md
  # L5 Patterns - Fitness Specific
  - ../patterns/animations.md
  - ../patterns/gamification.md
  - ../patterns/social-sharing.md
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
  - ../molecules/empty-state.md
dependencies:
  - next@15.0.0
  - react@19.0.0
  - prisma@6.0.0
  - recharts@2.12.0
  - date-fns@3.0.0
skills:
  - pwa
  - mobile-first
  - charts
  - offline-sync
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

A mobile-first fitness tracking application for logging workouts, browsing an exercise library, tracking progress with charts, and setting fitness goals. Built as a PWA with offline support for gym use without connectivity.

## Project Structure

```
app/
├── (auth)/
│   ├── login/page.tsx
│   ├── register/page.tsx
│   └── onboarding/page.tsx         # Initial fitness profile setup
├── (app)/
│   ├── layout.tsx                  # Bottom nav layout
│   ├── page.tsx                    # Dashboard / today's workout
│   ├── workout/
│   │   ├── page.tsx                # Start workout
│   │   ├── active/page.tsx         # Active workout session
│   │   ├── history/page.tsx        # Workout history
│   │   └── [id]/page.tsx           # Workout detail
│   ├── exercises/
│   │   ├── page.tsx                # Exercise library
│   │   ├── [id]/page.tsx           # Exercise detail
│   │   └── custom/page.tsx         # Create custom exercise
│   ├── programs/
│   │   ├── page.tsx                # Workout programs
│   │   └── [id]/page.tsx           # Program detail
│   ├── progress/
│   │   ├── page.tsx                # Progress overview
│   │   ├── body/page.tsx           # Body measurements
│   │   └── strength/page.tsx       # Strength progress
│   ├── goals/page.tsx              # Goals & achievements
│   └── settings/
│       ├── page.tsx
│       ├── profile/page.tsx
│       └── units/page.tsx
├── api/
│   ├── workouts/
│   │   ├── route.ts
│   │   └── [id]/route.ts
│   ├── exercises/route.ts
│   ├── sets/route.ts
│   ├── measurements/route.ts
│   └── sync/route.ts               # Offline sync endpoint
├── manifest.ts
└── sw.ts
components/
├── workout/
│   ├── workout-card.tsx
│   ├── active-workout.tsx
│   ├── set-logger.tsx
│   ├── exercise-picker.tsx
│   ├── rest-timer.tsx
│   └── workout-summary.tsx
├── exercises/
│   ├── exercise-card.tsx
│   ├── exercise-detail.tsx
│   ├── muscle-filter.tsx
│   └── exercise-demo.tsx
├── progress/
│   ├── weight-chart.tsx
│   ├── strength-chart.tsx
│   ├── volume-chart.tsx
│   └── body-chart.tsx
├── goals/
│   ├── goal-card.tsx
│   └── achievement-badge.tsx
└── layout/
    ├── bottom-nav.tsx
    └── workout-fab.tsx
lib/
├── exercises-db.ts                 # Exercise database
├── workout-utils.ts
├── offline-db.ts
└── sync.ts
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
  id            String    @id @default(cuid())
  email         String    @unique
  name          String
  passwordHash  String
  avatarUrl     String?
  
  // Profile
  dateOfBirth   DateTime?
  gender        Gender?
  height        Float?    // In user's preferred unit
  heightUnit    HeightUnit @default(CM)
  weightUnit    WeightUnit @default(KG)
  
  // Fitness level
  fitnessLevel  FitnessLevel @default(INTERMEDIATE)
  fitnessGoal   FitnessGoal  @default(BUILD_MUSCLE)
  
  workouts      Workout[]
  customExercises Exercise[]
  measurements  Measurement[]
  goals         Goal[]
  achievements  UserAchievement[]
  
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

enum Gender {
  MALE
  FEMALE
  OTHER
}

enum HeightUnit {
  CM
  FEET_INCHES
}

enum WeightUnit {
  KG
  LBS
}

enum FitnessLevel {
  BEGINNER
  INTERMEDIATE
  ADVANCED
}

enum FitnessGoal {
  LOSE_WEIGHT
  BUILD_MUSCLE
  GAIN_STRENGTH
  IMPROVE_ENDURANCE
  MAINTAIN
}

model Exercise {
  id              String       @id @default(cuid())
  userId          String?      // null = system exercise
  
  name            String
  slug            String       @unique
  description     String?      @db.Text
  instructions    String[]
  
  // Categorization
  category        ExerciseCategory
  primaryMuscle   Muscle
  secondaryMuscles Muscle[]
  equipment       Equipment[]
  
  // Media
  imageUrl        String?
  videoUrl        String?
  animationUrl    String?
  
  // Metrics
  trackWeight     Boolean      @default(true)
  trackReps       Boolean      @default(true)
  trackTime       Boolean      @default(false)
  trackDistance   Boolean      @default(false)
  
  isCustom        Boolean      @default(false)
  isPublic        Boolean      @default(true)
  
  user            User?        @relation(fields: [userId], references: [id])
  workoutExercises WorkoutExercise[]
  personalRecords PersonalRecord[]
  
  createdAt       DateTime     @default(now())
  updatedAt       DateTime     @updatedAt
  
  @@index([category])
  @@index([primaryMuscle])
}

enum ExerciseCategory {
  STRENGTH
  CARDIO
  FLEXIBILITY
  PLYOMETRIC
  OLYMPIC
  BODYWEIGHT
}

enum Muscle {
  CHEST
  BACK
  SHOULDERS
  BICEPS
  TRICEPS
  FOREARMS
  ABS
  OBLIQUES
  QUADS
  HAMSTRINGS
  GLUTES
  CALVES
  TRAPS
  LATS
  LOWER_BACK
  FULL_BODY
}

enum Equipment {
  BARBELL
  DUMBBELL
  KETTLEBELL
  CABLE
  MACHINE
  BODYWEIGHT
  RESISTANCE_BAND
  PULL_UP_BAR
  BENCH
  CARDIO_MACHINE
}

model Workout {
  id              String       @id @default(cuid())
  userId          String
  
  name            String?
  notes           String?
  
  startedAt       DateTime
  completedAt     DateTime?
  duration        Int?         // Seconds
  
  // Sync metadata
  localId         String?      @unique
  syncedAt        DateTime?
  
  user            User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  exercises       WorkoutExercise[]
  
  createdAt       DateTime     @default(now())
  updatedAt       DateTime     @updatedAt
  
  @@index([userId])
  @@index([startedAt])
}

model WorkoutExercise {
  id          String    @id @default(cuid())
  workoutId   String
  exerciseId  String
  order       Int
  notes       String?
  
  workout     Workout   @relation(fields: [workoutId], references: [id], onDelete: Cascade)
  exercise    Exercise  @relation(fields: [exerciseId], references: [id])
  sets        ExerciseSet[]
  
  @@index([workoutId])
  @@index([exerciseId])
}

model ExerciseSet {
  id                String          @id @default(cuid())
  workoutExerciseId String
  setNumber         Int
  
  // Metrics (nullable based on exercise type)
  weight            Float?
  reps              Int?
  duration          Int?            // Seconds
  distance          Float?          // Meters
  
  rpe               Int?            // Rate of Perceived Exertion (1-10)
  isWarmup          Boolean         @default(false)
  isDropset         Boolean         @default(false)
  isFailure         Boolean         @default(false)
  
  completedAt       DateTime?
  
  workoutExercise   WorkoutExercise @relation(fields: [workoutExerciseId], references: [id], onDelete: Cascade)
  
  @@index([workoutExerciseId])
}

model PersonalRecord {
  id          String    @id @default(cuid())
  userId      String
  exerciseId  String
  
  type        PRType
  value       Float
  reps        Int?
  
  achievedAt  DateTime
  workoutId   String?
  
  exercise    Exercise  @relation(fields: [exerciseId], references: [id])
  
  @@index([userId, exerciseId])
}

enum PRType {
  MAX_WEIGHT
  MAX_REPS
  MAX_VOLUME
  BEST_TIME
  LONGEST_DISTANCE
}

model Measurement {
  id          String    @id @default(cuid())
  userId      String
  
  type        MeasurementType
  value       Float
  unit        String
  
  measuredAt  DateTime  @default(now())
  
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([userId, type])
  @@index([measuredAt])
}

enum MeasurementType {
  WEIGHT
  BODY_FAT
  CHEST
  WAIST
  HIPS
  BICEP_LEFT
  BICEP_RIGHT
  THIGH_LEFT
  THIGH_RIGHT
  CALF_LEFT
  CALF_RIGHT
}

model Goal {
  id          String     @id @default(cuid())
  userId      String
  
  type        GoalType
  target      Float
  current     Float      @default(0)
  unit        String
  
  deadline    DateTime?
  isCompleted Boolean    @default(false)
  completedAt DateTime?
  
  user        User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  createdAt   DateTime   @default(now())
  
  @@index([userId])
}

enum GoalType {
  WEIGHT_LOSS
  WEIGHT_GAIN
  WORKOUT_FREQUENCY
  EXERCISE_PR
  BODY_MEASUREMENT
}

model Achievement {
  id          String    @id @default(cuid())
  
  name        String
  description String
  icon        String
  category    AchievementCategory
  
  // Requirement
  requirement Json      // e.g., { type: "workouts", count: 100 }
  
  users       UserAchievement[]
}

enum AchievementCategory {
  CONSISTENCY
  STRENGTH
  VOLUME
  MILESTONE
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

### Active Workout Screen

```tsx
// app/(app)/workout/active/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useWorkoutStore } from '@/stores/workout-store';
import { SetLogger } from '@/components/workout/set-logger';
import { RestTimer } from '@/components/workout/rest-timer';
import { ExercisePicker } from '@/components/workout/exercise-picker';
import { WorkoutSummary } from '@/components/workout/workout-summary';
import { Plus, X, Clock, CheckCircle } from 'lucide-react';
import { formatDuration } from '@/lib/workout-utils';

export default function ActiveWorkoutPage() {
  const router = useRouter();
  const {
    workout,
    currentExerciseIndex,
    addExercise,
    finishWorkout,
    cancelWorkout,
    isRestTimerActive,
  } = useWorkoutStore();
  
  const [showExercisePicker, setShowExercisePicker] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  
  // Timer
  useEffect(() => {
    if (!workout) return;
    
    const startTime = new Date(workout.startedAt).getTime();
    const interval = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    
    return () => clearInterval(interval);
  }, [workout]);
  
  if (!workout) {
    router.push('/workout');
    return null;
  }
  
  const currentExercise = workout.exercises[currentExerciseIndex];
  
  const handleFinish = async () => {
    const summary = await finishWorkout();
    setShowSummary(true);
  };
  
  const handleCancel = () => {
    if (confirm('Are you sure you want to cancel this workout?')) {
      cancelWorkout();
      router.push('/workout');
    }
  };
  
  if (showSummary) {
    return <WorkoutSummary workout={workout} onClose={() => router.push('/workout')} />;
  }
  
  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b px-4 py-3">
        <div className="flex items-center justify-between">
          <button onClick={handleCancel} className="p-2 -ml-2">
            <X className="h-6 w-6" />
          </button>
          <div className="text-center">
            <p className="text-sm text-gray-500">Workout</p>
            <p className="font-semibold flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {formatDuration(elapsedTime)}
            </p>
          </div>
          <button
            onClick={handleFinish}
            className="px-3 py-1 bg-green-600 text-white rounded-lg text-sm font-medium"
          >
            Finish
          </button>
        </div>
      </div>
      
      {/* Rest Timer Overlay */}
      {isRestTimerActive && <RestTimer />}
      
      {/* Exercises */}
      <div className="p-4 space-y-4">
        {workout.exercises.map((exercise, index) => (
          <div
            key={exercise.id}
            className={`bg-white rounded-xl shadow-sm overflow-hidden ${
              index === currentExerciseIndex ? 'ring-2 ring-indigo-600' : ''
            }`}
          >
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {exercise.imageUrl && (
                    <img
                      src={exercise.imageUrl}
                      alt={exercise.name}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                  )}
                  <div>
                    <h3 className="font-semibold">{exercise.name}</h3>
                    <p className="text-sm text-gray-500">
                      {exercise.sets.filter(s => s.completedAt).length} / {exercise.sets.length} sets
                    </p>
                  </div>
                </div>
                {exercise.sets.every(s => s.completedAt) && (
                  <CheckCircle className="h-6 w-6 text-green-500" />
                )}
              </div>
            </div>
            
            {index === currentExerciseIndex && (
              <SetLogger
                exerciseId={exercise.id}
                sets={exercise.sets}
                exerciseType={exercise.category}
              />
            )}
          </div>
        ))}
        
        {/* Add Exercise Button */}
        <button
          onClick={() => setShowExercisePicker(true)}
          className="w-full py-4 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center gap-2 text-gray-600"
        >
          <Plus className="h-5 w-5" />
          Add Exercise
        </button>
      </div>
      
      {/* Exercise Picker Modal */}
      {showExercisePicker && (
        <ExercisePicker
          onSelect={(exercise) => {
            addExercise(exercise);
            setShowExercisePicker(false);
          }}
          onClose={() => setShowExercisePicker(false)}
        />
      )}
    </div>
  );
}
```

### Set Logger Component

```tsx
// components/workout/set-logger.tsx
'use client';

import { useState } from 'react';
import { useWorkoutStore } from '@/stores/workout-store';
import { Check, Plus, Trash2 } from 'lucide-react';

interface SetLoggerProps {
  exerciseId: string;
  sets: Array<{
    id: string;
    setNumber: number;
    weight: number | null;
    reps: number | null;
    duration: number | null;
    isWarmup: boolean;
    completedAt: Date | null;
    previousWeight?: number;
    previousReps?: number;
  }>;
  exerciseType: string;
}

export function SetLogger({ exerciseId, sets, exerciseType }: SetLoggerProps) {
  const { updateSet, completeSet, addSet, removeSet, startRestTimer } = useWorkoutStore();
  const [editingSet, setEditingSet] = useState<string | null>(null);
  
  const handleComplete = (setId: string) => {
    completeSet(exerciseId, setId);
    startRestTimer(90); // Default 90 second rest
  };
  
  const isStrength = ['STRENGTH', 'BODYWEIGHT'].includes(exerciseType);
  
  return (
    <div className="p-4">
      {/* Header */}
      <div className="grid grid-cols-12 gap-2 text-xs text-gray-500 font-medium mb-2 px-2">
        <div className="col-span-2">SET</div>
        <div className="col-span-3">PREVIOUS</div>
        {isStrength ? (
          <>
            <div className="col-span-3 text-center">KG</div>
            <div className="col-span-2 text-center">REPS</div>
          </>
        ) : (
          <div className="col-span-5 text-center">DURATION</div>
        )}
        <div className="col-span-2"></div>
      </div>
      
      {/* Sets */}
      {sets.map((set) => {
        const isCompleted = !!set.completedAt;
        
        return (
          <div
            key={set.id}
            className={`grid grid-cols-12 gap-2 items-center py-2 px-2 rounded-lg ${
              isCompleted ? 'bg-green-50' : 'bg-gray-50'
            } mb-2`}
          >
            <div className="col-span-2">
              <span className={`font-medium ${set.isWarmup ? 'text-orange-500' : ''}`}>
                {set.isWarmup ? 'W' : set.setNumber}
              </span>
            </div>
            
            <div className="col-span-3 text-sm text-gray-400">
              {set.previousWeight && set.previousReps ? (
                `${set.previousWeight}×${set.previousReps}`
              ) : (
                '-'
              )}
            </div>
            
            {isStrength ? (
              <>
                <div className="col-span-3">
                  <input
                    type="number"
                    value={set.weight || ''}
                    onChange={(e) => updateSet(exerciseId, set.id, {
                      weight: parseFloat(e.target.value) || null,
                    })}
                    placeholder="0"
                    className="w-full text-center py-2 rounded-lg border bg-white"
                    disabled={isCompleted}
                  />
                </div>
                <div className="col-span-2">
                  <input
                    type="number"
                    value={set.reps || ''}
                    onChange={(e) => updateSet(exerciseId, set.id, {
                      reps: parseInt(e.target.value) || null,
                    })}
                    placeholder="0"
                    className="w-full text-center py-2 rounded-lg border bg-white"
                    disabled={isCompleted}
                  />
                </div>
              </>
            ) : (
              <div className="col-span-5">
                <input
                  type="number"
                  value={set.duration || ''}
                  onChange={(e) => updateSet(exerciseId, set.id, {
                    duration: parseInt(e.target.value) || null,
                  })}
                  placeholder="0"
                  className="w-full text-center py-2 rounded-lg border bg-white"
                  disabled={isCompleted}
                />
              </div>
            )}
            
            <div className="col-span-2 flex justify-end gap-1">
              {!isCompleted ? (
                <button
                  onClick={() => handleComplete(set.id)}
                  disabled={isStrength && (!set.weight || !set.reps)}
                  className="p-2 bg-indigo-600 text-white rounded-lg disabled:opacity-50"
                >
                  <Check className="h-4 w-4" />
                </button>
              ) : (
                <button
                  onClick={() => removeSet(exerciseId, set.id)}
                  className="p-2 text-gray-400"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        );
      })}
      
      {/* Add Set */}
      <button
        onClick={() => addSet(exerciseId)}
        className="w-full py-2 text-indigo-600 text-sm font-medium flex items-center justify-center gap-1"
      >
        <Plus className="h-4 w-4" />
        Add Set
      </button>
    </div>
  );
}
```

### Rest Timer Component

```tsx
// components/workout/rest-timer.tsx
'use client';

import { useEffect, useState } from 'react';
import { useWorkoutStore } from '@/stores/workout-store';
import { X, Plus, Minus, SkipForward } from 'lucide-react';

export function RestTimer() {
  const { restTimeRemaining, adjustRestTimer, skipRestTimer } = useWorkoutStore();
  const [initialTime] = useState(restTimeRemaining);
  
  const progress = (restTimeRemaining / initialTime) * 100;
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Vibrate when timer ends
  useEffect(() => {
    if (restTimeRemaining === 0) {
      if ('vibrate' in navigator) {
        navigator.vibrate([200, 100, 200]);
      }
    }
  }, [restTimeRemaining]);
  
  if (restTimeRemaining <= 0) return null;
  
  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center">
      <div className="text-center text-white">
        <p className="text-lg mb-4">Rest Timer</p>
        
        {/* Circular Progress */}
        <div className="relative w-48 h-48 mx-auto mb-6">
          <svg className="w-full h-full -rotate-90">
            <circle
              cx="96"
              cy="96"
              r="88"
              fill="none"
              stroke="rgba(255,255,255,0.2)"
              strokeWidth="8"
            />
            <circle
              cx="96"
              cy="96"
              r="88"
              fill="none"
              stroke="#6366f1"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={553}
              strokeDashoffset={553 * (1 - progress / 100)}
              className="transition-all duration-1000"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-5xl font-bold">{formatTime(restTimeRemaining)}</span>
          </div>
        </div>
        
        {/* Controls */}
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => adjustRestTimer(-15)}
            className="p-3 bg-white/10 rounded-full"
          >
            <Minus className="h-6 w-6" />
          </button>
          
          <button
            onClick={skipRestTimer}
            className="px-6 py-3 bg-indigo-600 rounded-full font-medium flex items-center gap-2"
          >
            <SkipForward className="h-5 w-5" />
            Skip
          </button>
          
          <button
            onClick={() => adjustRestTimer(15)}
            className="p-3 bg-white/10 rounded-full"
          >
            <Plus className="h-6 w-6" />
          </button>
        </div>
      </div>
    </div>
  );
}
```

### Progress Chart

```tsx
// components/progress/strength-chart.tsx
'use client';

import { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { format } from 'date-fns';

interface StrengthChartProps {
  data: Array<{
    date: string;
    weight: number;
    reps: number;
    estimated1RM: number;
  }>;
  exerciseName: string;
}

export function StrengthChart({ data, exerciseName }: StrengthChartProps) {
  const maxWeight = useMemo(() => {
    return Math.max(...data.map(d => d.weight));
  }, [data]);
  
  const max1RM = useMemo(() => {
    return Math.max(...data.map(d => d.estimated1RM));
  }, [data]);
  
  return (
    <div className="bg-white rounded-xl p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold">{exerciseName}</h3>
          <p className="text-sm text-gray-500">Estimated 1RM Progress</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-indigo-600">{max1RM.toFixed(1)} kg</p>
          <p className="text-xs text-gray-500">Best Est. 1RM</p>
        </div>
      </div>
      
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10 }}
              tickFormatter={(value) => format(new Date(value), 'MMM d')}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10 }}
              domain={['dataMin - 5', 'dataMax + 5']}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null;
                const data = payload[0].payload;
                return (
                  <div className="bg-white border rounded-lg p-3 shadow-lg">
                    <p className="text-sm text-gray-500 mb-1">
                      {format(new Date(label), 'MMM d, yyyy')}
                    </p>
                    <p className="font-medium">
                      {data.weight} kg × {data.reps} reps
                    </p>
                    <p className="text-sm text-indigo-600">
                      Est. 1RM: {data.estimated1RM.toFixed(1)} kg
                    </p>
                  </div>
                );
              }}
            />
            <ReferenceLine y={max1RM} stroke="#6366f1" strokeDasharray="5 5" />
            <Line
              type="monotone"
              dataKey="estimated1RM"
              stroke="#6366f1"
              strokeWidth={2}
              dot={{ fill: '#6366f1', r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
```

### Exercise Library

```tsx
// app/(app)/exercises/page.tsx
'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Filter, ChevronRight } from 'lucide-react';
import { MuscleFilter } from '@/components/exercises/muscle-filter';
import { ExerciseCard } from '@/components/exercises/exercise-card';
import Link from 'next/link';

const EQUIPMENT_OPTIONS = [
  'BARBELL', 'DUMBBELL', 'KETTLEBELL', 'CABLE', 'MACHINE', 'BODYWEIGHT'
];

export default function ExercisesPage() {
  const [search, setSearch] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState<string | null>(null);
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  
  const { data: exercises, isLoading } = useQuery({
    queryKey: ['exercises', search, selectedMuscle, selectedEquipment],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (selectedMuscle) params.set('muscle', selectedMuscle);
      if (selectedEquipment.length) params.set('equipment', selectedEquipment.join(','));
      
      const res = await fetch(`/api/exercises?${params}`);
      return res.json();
    },
  });
  
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b">
        <div className="px-4 py-3">
          <h1 className="text-xl font-bold mb-3">Exercise Library</h1>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search exercises..."
              className="w-full pl-10 pr-10 py-2 border rounded-lg"
            />
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`absolute right-3 top-1/2 -translate-y-1/2 ${
                showFilters || selectedMuscle || selectedEquipment.length
                  ? 'text-indigo-600'
                  : 'text-gray-400'
              }`}
            >
              <Filter className="h-5 w-5" />
            </button>
          </div>
        </div>
        
        {/* Filters */}
        {showFilters && (
          <div className="px-4 pb-3 space-y-3">
            {/* Muscle Filter */}
            <MuscleFilter
              selected={selectedMuscle}
              onChange={setSelectedMuscle}
            />
            
            {/* Equipment Filter */}
            <div className="flex flex-wrap gap-2">
              {EQUIPMENT_OPTIONS.map((equipment) => (
                <button
                  key={equipment}
                  onClick={() => {
                    setSelectedEquipment(prev =>
                      prev.includes(equipment)
                        ? prev.filter(e => e !== equipment)
                        : [...prev, equipment]
                    );
                  }}
                  className={`px-3 py-1 rounded-full text-sm ${
                    selectedEquipment.includes(equipment)
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {equipment.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Exercise List */}
      <div className="p-4">
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {exercises?.map((exercise: any) => (
              <Link key={exercise.id} href={`/exercises/${exercise.id}`}>
                <ExerciseCard exercise={exercise} />
              </Link>
            ))}
            
            {exercises?.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                No exercises found
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Create Custom Exercise */}
      <Link
        href="/exercises/custom"
        className="fixed bottom-20 right-4 px-4 py-2 bg-indigo-600 text-white rounded-full shadow-lg flex items-center gap-2"
      >
        + Custom Exercise
      </Link>
    </div>
  );
}
```

### Muscle Filter Component

```tsx
// components/exercises/muscle-filter.tsx
'use client';

interface MuscleFilterProps {
  selected: string | null;
  onChange: (muscle: string | null) => void;
}

const MUSCLE_GROUPS = [
  { id: 'CHEST', label: 'Chest', icon: '💪' },
  { id: 'BACK', label: 'Back', icon: '🔙' },
  { id: 'SHOULDERS', label: 'Shoulders', icon: '🎯' },
  { id: 'BICEPS', label: 'Biceps', icon: '💪' },
  { id: 'TRICEPS', label: 'Triceps', icon: '💪' },
  { id: 'ABS', label: 'Abs', icon: '🔥' },
  { id: 'QUADS', label: 'Quads', icon: '🦵' },
  { id: 'HAMSTRINGS', label: 'Hamstrings', icon: '🦵' },
  { id: 'GLUTES', label: 'Glutes', icon: '🍑' },
  { id: 'CALVES', label: 'Calves', icon: '🦶' },
];

export function MuscleFilter({ selected, onChange }: MuscleFilterProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      <button
        onClick={() => onChange(null)}
        className={`flex-shrink-0 px-3 py-1 rounded-full text-sm ${
          !selected ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700'
        }`}
      >
        All
      </button>
      {MUSCLE_GROUPS.map((muscle) => (
        <button
          key={muscle.id}
          onClick={() => onChange(selected === muscle.id ? null : muscle.id)}
          className={`flex-shrink-0 px-3 py-1 rounded-full text-sm flex items-center gap-1 ${
            selected === muscle.id
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-100 text-gray-700'
          }`}
        >
          <span>{muscle.icon}</span>
          {muscle.label}
        </button>
      ))}
    </div>
  );
}
```

### Workout Store (Zustand)

```tsx
// stores/workout-store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuid } from 'uuid';

interface WorkoutState {
  workout: Workout | null;
  currentExerciseIndex: number;
  isRestTimerActive: boolean;
  restTimeRemaining: number;
  
  // Actions
  startWorkout: () => void;
  addExercise: (exercise: Exercise) => void;
  removeExercise: (exerciseId: string) => void;
  addSet: (exerciseId: string) => void;
  removeSet: (exerciseId: string, setId: string) => void;
  updateSet: (exerciseId: string, setId: string, data: Partial<ExerciseSet>) => void;
  completeSet: (exerciseId: string, setId: string) => void;
  startRestTimer: (seconds: number) => void;
  adjustRestTimer: (seconds: number) => void;
  skipRestTimer: () => void;
  finishWorkout: () => Promise<Workout>;
  cancelWorkout: () => void;
}

export const useWorkoutStore = create<WorkoutState>()(
  persist(
    (set, get) => ({
      workout: null,
      currentExerciseIndex: 0,
      isRestTimerActive: false,
      restTimeRemaining: 0,
      
      startWorkout: () => {
        set({
          workout: {
            id: uuid(),
            localId: uuid(),
            startedAt: new Date().toISOString(),
            exercises: [],
          },
          currentExerciseIndex: 0,
        });
      },
      
      addExercise: (exercise) => {
        const { workout } = get();
        if (!workout) return;
        
        const workoutExercise = {
          id: uuid(),
          ...exercise,
          sets: [
            { id: uuid(), setNumber: 1, weight: null, reps: null, completedAt: null },
            { id: uuid(), setNumber: 2, weight: null, reps: null, completedAt: null },
            { id: uuid(), setNumber: 3, weight: null, reps: null, completedAt: null },
          ],
        };
        
        set({
          workout: {
            ...workout,
            exercises: [...workout.exercises, workoutExercise],
          },
          currentExerciseIndex: workout.exercises.length,
        });
      },
      
      addSet: (exerciseId) => {
        const { workout } = get();
        if (!workout) return;
        
        set({
          workout: {
            ...workout,
            exercises: workout.exercises.map(ex =>
              ex.id === exerciseId
                ? {
                    ...ex,
                    sets: [
                      ...ex.sets,
                      {
                        id: uuid(),
                        setNumber: ex.sets.length + 1,
                        weight: null,
                        reps: null,
                        completedAt: null,
                      },
                    ],
                  }
                : ex
            ),
          },
        });
      },
      
      updateSet: (exerciseId, setId, data) => {
        const { workout } = get();
        if (!workout) return;
        
        set({
          workout: {
            ...workout,
            exercises: workout.exercises.map(ex =>
              ex.id === exerciseId
                ? {
                    ...ex,
                    sets: ex.sets.map(s =>
                      s.id === setId ? { ...s, ...data } : s
                    ),
                  }
                : ex
            ),
          },
        });
      },
      
      completeSet: (exerciseId, setId) => {
        const { workout } = get();
        if (!workout) return;
        
        set({
          workout: {
            ...workout,
            exercises: workout.exercises.map(ex =>
              ex.id === exerciseId
                ? {
                    ...ex,
                    sets: ex.sets.map(s =>
                      s.id === setId
                        ? { ...s, completedAt: new Date().toISOString() }
                        : s
                    ),
                  }
                : ex
            ),
          },
        });
      },
      
      startRestTimer: (seconds) => {
        set({ isRestTimerActive: true, restTimeRemaining: seconds });
        
        const interval = setInterval(() => {
          const { restTimeRemaining } = get();
          if (restTimeRemaining <= 1) {
            clearInterval(interval);
            set({ isRestTimerActive: false, restTimeRemaining: 0 });
          } else {
            set({ restTimeRemaining: restTimeRemaining - 1 });
          }
        }, 1000);
      },
      
      adjustRestTimer: (seconds) => {
        set(state => ({
          restTimeRemaining: Math.max(0, state.restTimeRemaining + seconds),
        }));
      },
      
      skipRestTimer: () => {
        set({ isRestTimerActive: false, restTimeRemaining: 0 });
      },
      
      finishWorkout: async () => {
        const { workout } = get();
        if (!workout) throw new Error('No active workout');
        
        const completedWorkout = {
          ...workout,
          completedAt: new Date().toISOString(),
          duration: Math.floor(
            (Date.now() - new Date(workout.startedAt).getTime()) / 1000
          ),
        };
        
        // Save to API
        await fetch('/api/workouts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(completedWorkout),
        });
        
        set({ workout: null, currentExerciseIndex: 0 });
        
        return completedWorkout;
      },
      
      cancelWorkout: () => {
        set({ workout: null, currentExerciseIndex: 0 });
      },
    }),
    {
      name: 'workout-storage',
    }
  )
);
```

## Skills Used

| Skill | Layer | Purpose |
|-------|-------|---------|
| dashboard-layout | L5 | Main app shell with bottom navigation |
| dashboard-home | L5 | Today's workout and quick stats overview |
| settings-page | L5 | User profile and app preferences |
| chart | L3 | Progress visualization with Recharts |
| calendar | L3 | Workout scheduling and history view |
| stats-dashboard | L3 | Fitness statistics aggregation |
| zustand | L4 | Client-side state for active workouts |
| indexed-db | L4 | Offline workout storage |
| persistence | L4 | State persistence across sessions |
| stat-card | L2 | Individual metric displays |
| stepper | L2 | Onboarding and set progression |

## Testing

### Test Setup

```ts
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    include: ['**/*.{test,spec}.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'tests/setup.ts'],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
});
```

```ts
// tests/setup.ts
import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock IndexedDB for offline storage
import 'fake-indexeddb/auto';

// Mock vibration API
Object.defineProperty(navigator, 'vibrate', {
  value: vi.fn(),
  writable: true,
});

// Mock Zustand persist storage
const mockStorage: Record<string, string> = {};
vi.mock('zustand/middleware', async () => {
  const actual = await vi.importActual('zustand/middleware');
  return {
    ...actual,
    persist: (config: any) => (set: any, get: any, api: any) =>
      config(set, get, api),
  };
});

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    back: vi.fn(),
    refresh: vi.fn(),
  }),
  usePathname: () => '/workout',
}));
```

### Unit Tests

```tsx
// components/workout/__tests__/set-logger.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SetLogger } from '../set-logger';
import { describe, it, expect, vi } from 'vitest';

// Mock the workout store
vi.mock('@/stores/workout-store', () => ({
  useWorkoutStore: () => ({
    updateSet: vi.fn(),
    completeSet: vi.fn(),
    addSet: vi.fn(),
    removeSet: vi.fn(),
    startRestTimer: vi.fn(),
  }),
}));

describe('SetLogger', () => {
  const mockSets = [
    { id: '1', setNumber: 1, weight: null, reps: null, completedAt: null, previousWeight: 100, previousReps: 8 },
    { id: '2', setNumber: 2, weight: null, reps: null, completedAt: null },
    { id: '3', setNumber: 3, weight: null, reps: null, completedAt: null },
  ];

  it('renders all sets', () => {
    render(
      <SetLogger
        exerciseId="ex1"
        sets={mockSets}
        exerciseType="STRENGTH"
      />
    );

    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('shows previous set data', () => {
    render(
      <SetLogger
        exerciseId="ex1"
        sets={mockSets}
        exerciseType="STRENGTH"
      />
    );

    expect(screen.getByText('100x8')).toBeInTheDocument();
  });

  it('allows adding new sets', async () => {
    render(
      <SetLogger
        exerciseId="ex1"
        sets={mockSets}
        exerciseType="STRENGTH"
      />
    );

    const addButton = screen.getByText(/add set/i);
    await userEvent.click(addButton);

    // Verify addSet was called (mocked)
  });

  it('disables complete button without weight and reps', () => {
    render(
      <SetLogger
        exerciseId="ex1"
        sets={mockSets}
        exerciseType="STRENGTH"
      />
    );

    const completeButtons = screen.getAllByRole('button', { name: /complete/i });
    expect(completeButtons[0]).toBeDisabled();
  });
});
```

```tsx
// components/workout/__tests__/rest-timer.test.tsx
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RestTimer } from '../rest-timer';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('@/stores/workout-store', () => ({
  useWorkoutStore: () => ({
    restTimeRemaining: 90,
    adjustRestTimer: vi.fn(),
    skipRestTimer: vi.fn(),
  }),
}));

describe('RestTimer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('displays formatted time', () => {
    render(<RestTimer />);

    expect(screen.getByText('1:30')).toBeInTheDocument();
  });

  it('shows skip button', () => {
    render(<RestTimer />);

    expect(screen.getByText(/skip/i)).toBeInTheDocument();
  });

  it('has adjust timer buttons', () => {
    render(<RestTimer />);

    // Plus and minus buttons for adjusting time
    expect(screen.getAllByRole('button').length).toBeGreaterThanOrEqual(3);
  });
});
```

```tsx
// components/progress/__tests__/strength-chart.test.tsx
import { render, screen } from '@testing-library/react';
import { StrengthChart } from '../strength-chart';
import { describe, it, expect } from 'vitest';

describe('StrengthChart', () => {
  const mockData = [
    { date: '2024-01-01', weight: 100, reps: 5, estimated1RM: 116 },
    { date: '2024-01-08', weight: 102.5, reps: 5, estimated1RM: 119 },
    { date: '2024-01-15', weight: 105, reps: 5, estimated1RM: 122 },
  ];

  it('displays exercise name and best 1RM', () => {
    render(
      <StrengthChart
        data={mockData}
        exerciseName="Bench Press"
      />
    );

    expect(screen.getByText('Bench Press')).toBeInTheDocument();
    expect(screen.getByText('122.0 kg')).toBeInTheDocument();
  });

  it('renders chart container', () => {
    render(
      <StrengthChart
        data={mockData}
        exerciseName="Squat"
      />
    );

    expect(screen.getByText(/Estimated 1RM Progress/i)).toBeInTheDocument();
  });
});
```

### Integration Tests

```tsx
// tests/integration/workout-api.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from '@/lib/prisma';

describe('Workout API Integration', () => {
  let testUserId: string;
  let testExerciseId: string;

  beforeAll(async () => {
    const user = await prisma.user.create({
      data: {
        email: 'fitness@example.com',
        name: 'Fitness Test User',
        passwordHash: 'hashed',
      },
    });
    testUserId = user.id;

    const exercise = await prisma.exercise.create({
      data: {
        name: 'Test Bench Press',
        slug: 'test-bench-press',
        category: 'STRENGTH',
        primaryMuscle: 'CHEST',
        equipment: ['BARBELL', 'BENCH'],
      },
    });
    testExerciseId = exercise.id;
  });

  afterAll(async () => {
    await prisma.exerciseSet.deleteMany({});
    await prisma.workoutExercise.deleteMany({});
    await prisma.workout.deleteMany({ where: { userId: testUserId } });
    await prisma.exercise.delete({ where: { id: testExerciseId } });
    await prisma.user.delete({ where: { id: testUserId } });
  });

  it('creates workout with exercises and sets', async () => {
    const workout = await prisma.workout.create({
      data: {
        userId: testUserId,
        startedAt: new Date(),
        exercises: {
          create: {
            exerciseId: testExerciseId,
            order: 0,
            sets: {
              create: [
                { setNumber: 1, weight: 60, reps: 10 },
                { setNumber: 2, weight: 70, reps: 8 },
                { setNumber: 3, weight: 80, reps: 6 },
              ],
            },
          },
        },
      },
      include: {
        exercises: {
          include: { sets: true },
        },
      },
    });

    expect(workout.id).toBeDefined();
    expect(workout.exercises).toHaveLength(1);
    expect(workout.exercises[0].sets).toHaveLength(3);
  });

  it('calculates total workout volume', async () => {
    const result = await prisma.exerciseSet.aggregate({
      where: {
        workoutExercise: {
          workout: { userId: testUserId },
        },
      },
      _sum: {
        weight: true,
        reps: true,
      },
    });

    expect(result._sum.weight).toBeDefined();
  });

  it('tracks personal records', async () => {
    const pr = await prisma.personalRecord.create({
      data: {
        userId: testUserId,
        exerciseId: testExerciseId,
        type: 'MAX_WEIGHT',
        value: 100,
        reps: 1,
        achievedAt: new Date(),
      },
    });

    expect(pr.id).toBeDefined();
    expect(pr.value).toBe(100);
  });
});
```

### E2E Tests

```ts
// tests/e2e/workout-flow.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Workout Tracking Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/');
  });

  test('starts and completes a workout', async ({ page }) => {
    // Start workout
    await page.click('a[href="/workout"]');
    await page.click('text=Start Workout');

    await page.waitForURL('/workout/active');

    // Add exercise
    await page.click('text=Add Exercise');
    await page.fill('[placeholder*="Search"]', 'Bench Press');
    await page.click('text=Barbell Bench Press');

    // Log first set
    await page.fill('input[placeholder="0"]', '80'); // Weight
    await page.fill('input[placeholder="0"]', '10'); // Reps
    await page.click('[data-testid="complete-set"]');

    // Rest timer should appear
    await expect(page.locator('text=Rest Timer')).toBeVisible();
    await page.click('text=Skip');

    // Finish workout
    await page.click('text=Finish');

    // Summary should appear
    await expect(page.locator('text=Workout Complete')).toBeVisible();
  });

  test('views exercise library and details', async ({ page }) => {
    await page.goto('/exercises');

    // Filter by muscle group
    await page.click('text=Chest');

    await expect(page.locator('[data-testid="exercise-card"]').first()).toBeVisible();

    // View exercise details
    await page.click('[data-testid="exercise-card"]');

    await expect(page.locator('text=Instructions')).toBeVisible();
  });

  test('tracks body measurements', async ({ page }) => {
    await page.goto('/progress/body');

    await page.click('text=Add Measurement');
    await page.selectOption('select[name="type"]', 'WEIGHT');
    await page.fill('input[name="value"]', '75');
    await page.click('text=Save');

    await expect(page.locator('text=75')).toBeVisible();
  });

  test('works offline during workout', async ({ page, context }) => {
    await page.goto('/workout/active');

    // Go offline
    await context.setOffline(true);

    // Should still be able to log sets
    await page.fill('input[placeholder="0"]', '100');
    await page.fill('input[placeholder="0"]', '5');
    await page.click('[data-testid="complete-set"]');

    // Data should be saved locally
    await expect(page.locator('[data-testid="offline-indicator"]')).toBeVisible();

    // Go back online
    await context.setOffline(false);

    // Finish and sync
    await page.click('text=Finish');
    await page.waitForSelector('[data-testid="sync-complete"]');
  });
});
```

## Error Handling

### Error Boundary

```tsx
// components/error-boundary.tsx
'use client';

import { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Dumbbell } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Fitness Tracker Error:', error, errorInfo);

    if (typeof window !== 'undefined' && window.Sentry) {
      window.Sentry.captureException(error, { extra: errorInfo });
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <div className="text-center">
            <Dumbbell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-lg font-semibold mb-2">Workout interrupted</h2>
            <p className="text-gray-600 mb-4">
              {this.state.error?.message || 'Something went wrong'}
            </p>
            <button
              onClick={this.handleRetry}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg mx-auto"
            >
              <RefreshCw className="h-4 w-4" />
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
```

### API Error Handler

```tsx
// lib/api-error.ts
import { z } from 'zod';

export class APIError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code?: string
  ) {
    super(message);
    this.name = 'APIError';
  }
}

export class WorkoutNotFoundError extends APIError {
  constructor(workoutId: string) {
    super(`Workout not found: ${workoutId}`, 404, 'WORKOUT_NOT_FOUND');
  }
}

export class ExerciseNotFoundError extends APIError {
  constructor(exerciseId: string) {
    super(`Exercise not found: ${exerciseId}`, 404, 'EXERCISE_NOT_FOUND');
  }
}

export class SyncConflictError extends APIError {
  constructor() {
    super('Workout data conflict. Please refresh and try again.', 409, 'SYNC_CONFLICT');
  }
}

export function handleAPIError(error: unknown): Response {
  console.error('API Error:', error);

  if (error instanceof APIError) {
    return Response.json(
      { error: error.message, code: error.code },
      { status: error.statusCode }
    );
  }

  if (error instanceof z.ZodError) {
    return Response.json(
      { error: 'Validation failed', details: error.errors },
      { status: 400 }
    );
  }

  return Response.json(
    { error: 'Internal server error' },
    { status: 500 }
  );
}
```

### Form Validation Errors

```tsx
// components/ui/workout-error.tsx
import { AlertCircle } from 'lucide-react';

interface WorkoutErrorProps {
  title: string;
  message: string;
  onDismiss?: () => void;
}

export function WorkoutError({ title, message, onDismiss }: WorkoutErrorProps) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="font-medium text-red-800">{title}</p>
          <p className="text-sm text-red-600 mt-1">{message}</p>
        </div>
        {onDismiss && (
          <button onClick={onDismiss} className="text-red-400 hover:text-red-600">
            x
          </button>
        )}
      </div>
    </div>
  );
}

// Workout-specific validation messages
export const workoutErrors = {
  weight: {
    required: 'Enter weight',
    positive: 'Weight must be positive',
    max: 'Weight exceeds realistic limit',
  },
  reps: {
    required: 'Enter reps',
    positive: 'Reps must be at least 1',
    max: 'That seems like a lot of reps!',
  },
  duration: {
    required: 'Enter duration',
    min: 'Duration must be at least 1 second',
  },
};
```

## Accessibility

| WCAG Criterion | Level | Implementation |
|----------------|-------|----------------|
| 1.1.1 Non-text Content | A | Alt text for exercise images/animations |
| 1.3.1 Info and Relationships | A | Semantic table structure for set logging |
| 1.4.1 Use of Color | A | Status indicated by text + icons, not just color |
| 1.4.3 Contrast | AA | High contrast for visibility during workouts |
| 2.1.1 Keyboard | A | All workout actions keyboard accessible |
| 2.4.3 Focus Order | A | Logical flow through set inputs |
| 2.4.7 Focus Visible | AA | Large, visible focus indicators for gym use |
| 2.5.5 Target Size | AAA | 44x44px minimum touch targets |
| 3.3.1 Error Identification | A | Clear feedback on invalid set entries |
| 4.1.3 Status Messages | AA | Rest timer announcements for screen readers |

### Focus Management for Mobile

```tsx
// hooks/use-workout-focus.ts
import { useEffect, useRef, useCallback } from 'react';

export function useSetInputFocus() {
  const inputRefs = useRef<Map<string, HTMLInputElement>>(new Map());

  const focusNextInput = useCallback((currentSetId: string) => {
    const inputs = Array.from(inputRefs.current.entries());
    const currentIndex = inputs.findIndex(([id]) => id === currentSetId);

    if (currentIndex < inputs.length - 1) {
      const [, nextInput] = inputs[currentIndex + 1];
      nextInput?.focus();
      nextInput?.select();
    }
  }, []);

  const registerInput = useCallback((setId: string, input: HTMLInputElement | null) => {
    if (input) {
      inputRefs.current.set(setId, input);
    } else {
      inputRefs.current.delete(setId);
    }
  }, []);

  return { registerInput, focusNextInput };
}

// Large touch targets for gym use
export function GymFriendlyInput({ ...props }) {
  return (
    <input
      {...props}
      className="w-full h-14 text-2xl text-center font-bold rounded-xl border-2 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-200"
      style={{ minWidth: '80px', minHeight: '56px' }} // 44px minimum + padding
    />
  );
}
```

### Accessible Forms

```tsx
// components/workout/accessible-set-logger.tsx
<div role="region" aria-label="Set logging">
  <table role="grid" aria-label="Exercise sets">
    <thead>
      <tr>
        <th scope="col" id="set-col">Set</th>
        <th scope="col" id="prev-col">Previous</th>
        <th scope="col" id="weight-col">Weight (kg)</th>
        <th scope="col" id="reps-col">Reps</th>
        <th scope="col" id="action-col">Action</th>
      </tr>
    </thead>
    <tbody>
      {sets.map((set, index) => (
        <tr key={set.id} aria-label={`Set ${set.setNumber}`}>
          <td headers="set-col">{set.setNumber}</td>
          <td headers="prev-col" aria-label={set.previousWeight ? `Previous: ${set.previousWeight}kg x ${set.previousReps}` : 'No previous data'}>
            {set.previousWeight ? `${set.previousWeight}x${set.previousReps}` : '-'}
          </td>
          <td headers="weight-col">
            <input
              type="number"
              inputMode="decimal"
              aria-label={`Weight for set ${set.setNumber}`}
              aria-describedby={`weight-hint-${set.id}`}
            />
            <span id={`weight-hint-${set.id}`} className="sr-only">
              Enter weight in kilograms
            </span>
          </td>
          <td headers="reps-col">
            <input
              type="number"
              inputMode="numeric"
              aria-label={`Reps for set ${set.setNumber}`}
            />
          </td>
          <td headers="action-col">
            <button
              aria-label={`Complete set ${set.setNumber}`}
              disabled={!set.weight || !set.reps}
            >
              Complete
            </button>
          </td>
        </tr>
      ))}
    </tbody>
  </table>

  {/* Rest timer with live region */}
  {isRestTimerActive && (
    <div role="timer" aria-live="polite" aria-label={`Rest time remaining: ${formatTime(restTimeRemaining)}`}>
      {formatTime(restTimeRemaining)}
    </div>
  )}
</div>
```

## Security

### Input Validation with Zod

```tsx
// lib/validations/workout.ts
import { z } from 'zod';

export const setSchema = z.object({
  weight: z.number().positive().max(1000, 'Weight seems unrealistic').optional(),
  reps: z.number().int().positive().max(500, 'Reps seem unrealistic').optional(),
  duration: z.number().int().positive().max(86400).optional(), // Max 24 hours
  distance: z.number().positive().max(1000000).optional(), // Max 1000km
  rpe: z.number().int().min(1).max(10).optional(),
  isWarmup: z.boolean().default(false),
  isDropset: z.boolean().default(false),
  isFailure: z.boolean().default(false),
});

export const workoutSchema = z.object({
  name: z.string().max(100).optional(),
  notes: z.string().max(2000).optional(),
  exercises: z.array(z.object({
    exerciseId: z.string().cuid(),
    order: z.number().int().min(0),
    notes: z.string().max(500).optional(),
    sets: z.array(setSchema),
  })),
});

export const measurementSchema = z.object({
  type: z.enum([
    'WEIGHT', 'BODY_FAT', 'CHEST', 'WAIST', 'HIPS',
    'BICEP_LEFT', 'BICEP_RIGHT', 'THIGH_LEFT', 'THIGH_RIGHT',
    'CALF_LEFT', 'CALF_RIGHT'
  ]),
  value: z.number().positive().max(1000),
  unit: z.string().max(10),
  measuredAt: z.coerce.date(),
});
```

### Rate Limiting Configuration

```tsx
// lib/rate-limit.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export const rateLimits = {
  // Workout operations
  workout: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(100, '1 m'),
    prefix: 'ratelimit:workout',
  }),

  // Set logging (high frequency during workout)
  logSet: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(300, '1 m'),
    prefix: 'ratelimit:set',
  }),

  // Sync operations
  sync: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(30, '1 m'),
    prefix: 'ratelimit:sync',
  }),

  // Auth
  auth: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, '15 m'),
    prefix: 'ratelimit:auth',
  }),
};
```

### Auth Middleware

```tsx
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  const { pathname } = request.nextUrl;

  const isAuthPage = pathname.startsWith('/login') ||
                     pathname.startsWith('/register') ||
                     pathname.startsWith('/onboarding');

  if (!token && !isAuthPage) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (token && isAuthPage && !pathname.startsWith('/onboarding')) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  const response = NextResponse.next();
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');

  return response;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|icons|sw.js).*)'],
};
```

## Performance

### Caching Strategies

```tsx
// lib/cache.ts
import { unstable_cache } from 'next/cache';

// Cache exercise library (rarely changes)
export const getCachedExercises = unstable_cache(
  async (muscle?: string, equipment?: string[]) => {
    return prisma.exercise.findMany({
      where: {
        isPublic: true,
        ...(muscle && { primaryMuscle: muscle as any }),
        ...(equipment?.length && { equipment: { hasSome: equipment } }),
      },
      orderBy: { name: 'asc' },
    });
  },
  ['exercises'],
  { revalidate: 86400, tags: ['exercises'] } // 24 hours
);

// Cache user's workout history summary
export const getCachedWorkoutStats = unstable_cache(
  async (userId: string) => {
    const [totalWorkouts, thisWeek, streak] = await Promise.all([
      prisma.workout.count({ where: { userId, completedAt: { not: null } } }),
      prisma.workout.count({
        where: {
          userId,
          completedAt: { not: null },
          startedAt: { gte: getStartOfWeek() },
        },
      }),
      calculateStreak(userId),
    ]);

    return { totalWorkouts, thisWeek, streak };
  },
  ['workout-stats'],
  { revalidate: 300, tags: ['workouts'] }
);

// React Query for real-time workout data
export const queryClientConfig = {
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60, // 1 minute
      gcTime: 1000 * 60 * 10, // 10 minutes
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
};
```

### Image Optimization

```tsx
// next.config.ts
import type { NextConfig } from 'next';

const config: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'fitness-assets.s3.amazonaws.com',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [320, 420, 768],
    imageSizes: [32, 48, 64, 96, 128],
  },
};

export default config;
```

### Bundle Optimization

```tsx
// Dynamic imports for heavy components
import dynamic from 'next/dynamic';

// Lazy load charts (only on progress pages)
export const StrengthChart = dynamic(
  () => import('@/components/progress/strength-chart'),
  {
    loading: () => <div className="h-48 bg-gray-100 animate-pulse rounded-xl" />,
    ssr: false,
  }
);

// Lazy load exercise animations
export const ExerciseDemo = dynamic(
  () => import('@/components/exercises/exercise-demo'),
  {
    loading: () => <div className="aspect-square bg-gray-100 animate-pulse rounded-xl" />,
    ssr: false,
  }
);
```

## CI/CD

```yaml
# .github/workflows/ci.yml
name: CI/CD

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

env:
  DATABASE_URL: ${{ secrets.DATABASE_URL }}
  NEXTAUTH_SECRET: ${{ secrets.NEXTAUTH_SECRET }}

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run lint

  typecheck:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run typecheck

  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run test:coverage
      - uses: codecov/codecov-action@v3

  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run build
      - run: npm run test:e2e
      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/

  deploy:
    needs: [lint, typecheck, test, e2e]
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

## Monitoring

### Sentry Setup

```tsx
// sentry.client.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  integrations: [
    Sentry.replayIntegration({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
  beforeSend(event) {
    // Sanitize workout data
    if (event.extra?.workout) {
      delete event.extra.workout;
    }
    return event;
  },
});
```

### Health Check Endpoint

```tsx
// app/api/health/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const healthcheck = {
    uptime: process.uptime(),
    timestamp: Date.now(),
    status: 'ok',
    checks: {} as Record<string, { status: string; latency?: number }>,
  };

  // Database check
  const dbStart = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    healthcheck.checks.database = {
      status: 'ok',
      latency: Date.now() - dbStart,
    };
  } catch (error) {
    healthcheck.status = 'degraded';
    healthcheck.checks.database = { status: 'error' };
  }

  // Exercise count check
  try {
    const count = await prisma.exercise.count({ where: { isPublic: true } });
    healthcheck.checks.exercises = {
      status: count > 0 ? 'ok' : 'warning',
    };
  } catch (error) {
    healthcheck.checks.exercises = { status: 'error' };
  }

  const statusCode = healthcheck.status === 'ok' ? 200 : 503;
  return NextResponse.json(healthcheck, { status: statusCode });
}
```

## Environment Variables

```bash
# .env.example

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/fitness_tracker"

# Authentication
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# Redis (Rate Limiting & Caching)
UPSTASH_REDIS_REST_URL="https://your-redis.upstash.io"
UPSTASH_REDIS_REST_TOKEN="your-redis-token"

# Sentry (Error Monitoring)
SENTRY_DSN="https://your-dsn@sentry.io/project"
NEXT_PUBLIC_SENTRY_DSN="https://your-dsn@sentry.io/project"

# Exercise Assets (Optional CDN)
NEXT_PUBLIC_ASSETS_URL="https://fitness-assets.s3.amazonaws.com"

# PWA
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

## Deployment Checklist

- [ ] All environment variables configured in production
- [ ] Database migrations applied (`npx prisma migrate deploy`)
- [ ] Exercise database seeded with initial exercises
- [ ] Redis instance provisioned for rate limiting
- [ ] Sentry project configured and DSN added
- [ ] PWA manifest icons generated (192x192, 512x512, maskable)
- [ ] Service worker tested for offline functionality
- [ ] SSL certificate configured
- [ ] Rate limiting tested
- [ ] Database connection pooling configured
- [ ] Health check endpoint accessible
- [ ] Exercise images/animations uploaded to CDN
- [ ] Lighthouse PWA audit passed
- [ ] Touch target sizes verified (44x44px minimum)
- [ ] Offline workout syncing tested
- [ ] Rest timer vibration tested on mobile
- [ ] WCAG accessibility audit passed
- [ ] Load testing for concurrent workout sessions
- [ ] Security headers configured

## Related Skills

- [[pwa]] - Progressive Web App setup
- [[mobile-first]] - Mobile-first design
- [[offline-sync]] - Offline data sync
- [[charts]] - Data visualization
- [[zustand]] - State management
- [[animations]] - UI animations

## Changelog

- 1.0.0: Initial fitness tracker recipe with workouts, exercises, and progress tracking
