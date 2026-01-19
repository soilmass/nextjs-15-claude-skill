---
id: r-learning-platform
name: Learning Platform
version: 3.0.0
layer: L6
category: recipes
description: Full-featured LMS with courses, lessons, quizzes, progress tracking, and certificates
tags: [lms, courses, education, quizzes, progress, certificates, video]
formula: "LearningPlatform = DashboardLayout(t-dashboard-layout) + DashboardHome(t-dashboard-home) + MarketingLayout(t-marketing-layout) + AuthLayout(t-auth-layout) + ProfilePage(t-profile-page) + SettingsPage(t-settings-page) + Header(o-header) + Sidebar(o-sidebar) + DataTable(o-data-table) + Chart(o-chart) + StatsDashboard(o-stats-dashboard) + Tabs(o-tabs) + Modal(o-modal) + MediaGallery(o-media-gallery) + FileUploader(o-file-uploader) + Breadcrumb(m-breadcrumb) + Pagination(m-pagination) + Card(m-card) + FormField(m-form-field) + Badge(m-badge) + Avatar(m-avatar) + SearchInput(m-search-input) + StatCard(m-stat-card) + ProgressBar(m-progress-bar) + Toast(m-toast) + NextAuth(pt-next-auth) + AuthMiddleware(pt-auth-middleware) + SessionManagement(pt-session-management) + Rbac(pt-rbac) + RateLimiting(pt-rate-limiting) + AuditLogging(pt-audit-logging) + FormValidation(pt-form-validation) + ZodSchemas(pt-zod-schemas) + ServerActions(pt-server-actions) + VideoPlayer(pt-video-player) + ProgressTracking(pt-progress-tracking) + QuizEngine(pt-quiz-engine) + AssessmentGrading(pt-assessment-grading) + Certificates(pt-certificates) + PdfGeneration(pt-pdf-generation) + Payments(pt-payments) + StripeSubscriptions(pt-stripe-subscriptions) + StripeCheckout(pt-stripe-checkout) + TransactionalEmail(pt-transactional-email) + PushNotifications(pt-push-notifications) + ErrorBoundaries(pt-error-boundaries) + ErrorTracking(pt-error-tracking) + SkeletonLoading(pt-skeleton-loading) + Sitemap(pt-sitemap) + StructuredData(pt-structured-data) + MetadataApi(pt-metadata-api) + AnalyticsEvents(pt-analytics-events) + UserAnalytics(pt-user-analytics) + Filtering(pt-filtering) + Pagination(pt-pagination) + Search(pt-search) + ReactQuery(pt-react-query) + Zustand(pt-zustand) + OptimisticUpdates(pt-optimistic-updates) + Gamification(pt-gamification) + TestingE2e(pt-testing-e2e) + TestingUnit(pt-testing-unit)"
composes:
  # L4 Templates
  - ../templates/dashboard-layout.md
  - ../templates/dashboard-home.md
  - ../templates/marketing-layout.md
  - ../templates/auth-layout.md
  - ../templates/profile-page.md
  - ../templates/settings-page.md
  # L3 Organisms
  - ../organisms/header.md
  - ../organisms/sidebar.md
  - ../organisms/data-table.md
  - ../organisms/chart.md
  - ../organisms/stats-dashboard.md
  - ../organisms/tabs.md
  - ../organisms/modal.md
  - ../organisms/media-gallery.md
  - ../organisms/file-uploader.md
  # L2 Molecules
  - ../molecules/breadcrumb.md
  - ../molecules/pagination.md
  - ../molecules/card.md
  - ../molecules/form-field.md
  - ../molecules/badge.md
  - ../molecules/avatar.md
  - ../molecules/search-input.md
  - ../molecules/stat-card.md
  - ../molecules/progress-bar.md
  - ../molecules/toast.md
  # L5 Patterns - Authentication
  - ../patterns/next-auth.md
  - ../patterns/auth-middleware.md
  - ../patterns/session-management.md
  - ../patterns/rbac.md
  # L5 Patterns - Security
  - ../patterns/rate-limiting.md
  - ../patterns/audit-logging.md
  # L5 Patterns - Forms & Validation
  - ../patterns/form-validation.md
  - ../patterns/zod-schemas.md
  - ../patterns/server-actions.md
  # L5 Patterns - Learning Specific
  - ../patterns/video-player.md
  - ../patterns/progress-tracking.md
  - ../patterns/quiz-engine.md
  - ../patterns/assessment-grading.md
  - ../patterns/certificates.md
  - ../patterns/pdf-generation.md
  # L5 Patterns - Payments
  - ../patterns/payments.md
  - ../patterns/stripe-subscriptions.md
  - ../patterns/stripe-checkout.md
  # L5 Patterns - Communication
  - ../patterns/transactional-email.md
  - ../patterns/push-notifications.md
  # L5 Patterns - Error Handling
  - ../patterns/error-boundaries.md
  - ../patterns/error-tracking.md
  - ../patterns/skeleton-loading.md
  # L5 Patterns - SEO
  - ../patterns/sitemap.md
  - ../patterns/structured-data.md
  - ../patterns/metadata-api.md
  # L5 Patterns - Analytics
  - ../patterns/analytics-events.md
  - ../patterns/user-analytics.md
  # L5 Patterns - Data Management
  - ../patterns/filtering.md
  - ../patterns/pagination.md
  - ../patterns/search.md
  # L5 Patterns - State Management
  - ../patterns/react-query.md
  - ../patterns/zustand.md
  - ../patterns/optimistic-updates.md
  # L5 Patterns - Gamification
  - ../patterns/gamification.md
  # L5 Patterns - Testing
  - ../patterns/testing-e2e.md
  - ../patterns/testing-unit.md
dependencies:
  - next@15.0.0
  - react@19.0.0
  - typescript@5.6.0
  - tailwindcss@4.0.0
  - prisma@6.0.0
  - "@tanstack/react-query"
  - react-hook-form
  - zod
  - "@radix-ui/react-accordion"
  - "@radix-ui/react-progress"
  - "@radix-ui/react-tabs"
  - "@radix-ui/react-dialog"
  - lucide-react
  - react-player
  - stripe
skills:
  - video-player
  - progress-tracking
  - quiz-engine
  - certificates
  - payments
performance:
  impact: high
  lcp: medium
  cls: low
accessibility:
  wcag: AA
  keyboard: true
  screen-reader: true
---

# Learning Platform

## Overview

A comprehensive learning management system featuring:
- Course creation and management
- Video lessons with progress tracking
- Interactive quizzes and assessments
- Student progress dashboard
- Certificate generation
- Instructor dashboard with analytics
- Course purchasing with Stripe
- Discussion forums per course

## Project Structure

```
learning-platform/
├── app/
│   ├── (marketing)/
│   │   ├── page.tsx                    # Landing page
│   │   └── courses/page.tsx            # Course catalog
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   ├── dashboard/page.tsx          # Student dashboard
│   │   ├── my-courses/page.tsx         # Enrolled courses
│   │   └── certificates/page.tsx
│   ├── (course)/
│   │   └── courses/[courseId]/
│   │       ├── page.tsx                # Course overview
│   │       ├── learn/
│   │       │   └── [lessonId]/page.tsx # Lesson player
│   │       └── quiz/[quizId]/page.tsx
│   ├── (instructor)/
│   │   └── instructor/
│   │       ├── layout.tsx
│   │       ├── page.tsx                # Instructor dashboard
│   │       ├── courses/
│   │       │   ├── page.tsx
│   │       │   ├── new/page.tsx
│   │       │   └── [courseId]/
│   │       │       ├── page.tsx        # Edit course
│   │       │       ├── curriculum/page.tsx
│   │       │       └── students/page.tsx
│   │       └── analytics/page.tsx
│   ├── api/
│   │   ├── courses/
│   │   │   ├── route.ts
│   │   │   └── [courseId]/
│   │   │       ├── route.ts
│   │   │       ├── enroll/route.ts
│   │   │       ├── lessons/route.ts
│   │   │       └── progress/route.ts
│   │   ├── lessons/[lessonId]/
│   │   │   ├── route.ts
│   │   │   └── complete/route.ts
│   │   ├── quizzes/
│   │   │   ├── [quizId]/route.ts
│   │   │   └── [quizId]/submit/route.ts
│   │   ├── certificates/route.ts
│   │   └── webhooks/stripe/route.ts
│   └── layout.tsx
├── components/
│   ├── course/
│   │   ├── course-card.tsx
│   │   ├── course-sidebar.tsx
│   │   ├── curriculum-editor.tsx
│   │   └── lesson-player.tsx
│   ├── quiz/
│   │   ├── quiz-player.tsx
│   │   ├── question-card.tsx
│   │   └── quiz-results.tsx
│   ├── progress/
│   │   ├── progress-bar.tsx
│   │   └── achievement-badge.tsx
│   └── ui/
├── lib/
│   ├── api.ts
│   ├── stripe.ts
│   └── certificates.ts
└── prisma/
    └── schema.prisma
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
  avatar        String?
  role          UserRole  @default(STUDENT)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  // Instructor relations
  coursesCreated Course[]  @relation("instructor")
  
  // Student relations
  enrollments    Enrollment[]
  lessonProgress LessonProgress[]
  quizAttempts   QuizAttempt[]
  certificates   Certificate[]
  discussionPosts DiscussionPost[]

  @@index([email])
}

enum UserRole {
  STUDENT
  INSTRUCTOR
  ADMIN
}

model Course {
  id           String       @id @default(cuid())
  title        String
  slug         String       @unique
  description  String
  shortDescription String?
  thumbnail    String?
  previewVideo String?
  price        Decimal      @db.Decimal(10, 2)
  currency     String       @default("USD")
  level        CourseLevel  @default(BEGINNER)
  status       CourseStatus @default(DRAFT)
  
  // Instructor
  instructorId String
  instructor   User         @relation("instructor", fields: [instructorId], references: [id])
  
  // Content
  chapters     Chapter[]
  
  // Students
  enrollments  Enrollment[]
  
  // Meta
  duration     Int          @default(0) // Total minutes
  lessonCount  Int          @default(0)
  
  // Dates
  publishedAt  DateTime?
  createdAt    DateTime     @default(now())
  updatedAt    DateTime     @updatedAt

  @@index([slug])
  @@index([instructorId])
  @@index([status])
}

enum CourseLevel {
  BEGINNER
  INTERMEDIATE
  ADVANCED
}

enum CourseStatus {
  DRAFT
  PUBLISHED
  ARCHIVED
}

model Chapter {
  id          String   @id @default(cuid())
  title       String
  description String?
  position    Int
  courseId    String
  course      Course   @relation(fields: [courseId], references: [id], onDelete: Cascade)
  lessons     Lesson[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([courseId])
}

model Lesson {
  id          String     @id @default(cuid())
  title       String
  description String?
  position    Int
  type        LessonType @default(VIDEO)
  
  // Video content
  videoUrl    String?
  videoDuration Int?     // seconds
  
  // Text content
  content     String?    // Markdown
  
  // Settings
  isFree      Boolean    @default(false)
  isPublished Boolean    @default(false)
  
  // Relations
  chapterId   String
  chapter     Chapter    @relation(fields: [chapterId], references: [id], onDelete: Cascade)
  
  // Attachments & Quiz
  attachments Attachment[]
  quiz        Quiz?
  
  // Progress
  progress    LessonProgress[]
  
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt

  @@index([chapterId])
}

enum LessonType {
  VIDEO
  TEXT
  QUIZ
  ASSIGNMENT
}

model Attachment {
  id        String   @id @default(cuid())
  name      String
  url       String
  type      String
  size      Int
  lessonId  String
  lesson    Lesson   @relation(fields: [lessonId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())

  @@index([lessonId])
}

model Quiz {
  id          String     @id @default(cuid())
  title       String
  description String?
  passingScore Int       @default(70) // Percentage
  timeLimit   Int?       // Minutes
  lessonId    String     @unique
  lesson      Lesson     @relation(fields: [lessonId], references: [id], onDelete: Cascade)
  questions   Question[]
  attempts    QuizAttempt[]
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt
}

model Question {
  id           String       @id @default(cuid())
  text         String
  type         QuestionType @default(MULTIPLE_CHOICE)
  points       Int          @default(1)
  explanation  String?
  position     Int
  quizId       String
  quiz         Quiz         @relation(fields: [quizId], references: [id], onDelete: Cascade)
  options      QuestionOption[]
  createdAt    DateTime     @default(now())
  updatedAt    DateTime     @updatedAt

  @@index([quizId])
}

enum QuestionType {
  MULTIPLE_CHOICE
  MULTIPLE_SELECT
  TRUE_FALSE
  SHORT_ANSWER
}

model QuestionOption {
  id         String   @id @default(cuid())
  text       String
  isCorrect  Boolean  @default(false)
  position   Int
  questionId String
  question   Question @relation(fields: [questionId], references: [id], onDelete: Cascade)

  @@index([questionId])
}

model Enrollment {
  id        String           @id @default(cuid())
  userId    String
  user      User             @relation(fields: [userId], references: [id], onDelete: Cascade)
  courseId  String
  course    Course           @relation(fields: [courseId], references: [id], onDelete: Cascade)
  status    EnrollmentStatus @default(ACTIVE)
  progress  Float            @default(0) // Percentage
  
  // Payment
  paymentId String?
  amount    Decimal?         @db.Decimal(10, 2)
  
  completedAt DateTime?
  createdAt   DateTime       @default(now())
  updatedAt   DateTime       @updatedAt

  @@unique([userId, courseId])
  @@index([userId])
  @@index([courseId])
}

enum EnrollmentStatus {
  ACTIVE
  COMPLETED
  EXPIRED
  REFUNDED
}

model LessonProgress {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  lessonId    String
  lesson      Lesson   @relation(fields: [lessonId], references: [id], onDelete: Cascade)
  
  // Video progress
  watchedSeconds Int   @default(0)
  completed   Boolean  @default(false)
  completedAt DateTime?
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@unique([userId, lessonId])
  @@index([userId])
  @@index([lessonId])
}

model QuizAttempt {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  quizId      String
  quiz        Quiz     @relation(fields: [quizId], references: [id], onDelete: Cascade)
  
  score       Float    // Percentage
  passed      Boolean
  answers     Json     // Stored answers
  timeSpent   Int?     // Seconds
  
  createdAt   DateTime @default(now())

  @@index([userId])
  @@index([quizId])
}

model Certificate {
  id           String   @id @default(cuid())
  uniqueId     String   @unique @default(cuid()) // Public verification ID
  userId       String
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  courseId     String
  courseName   String   // Snapshot of course name
  instructorName String // Snapshot of instructor name
  completedAt  DateTime
  issuedAt     DateTime @default(now())
  pdfUrl       String?

  @@index([userId])
  @@index([uniqueId])
}

model DiscussionPost {
  id        String   @id @default(cuid())
  content   String
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  lessonId  String
  
  // Threading
  parentId  String?
  parent    DiscussionPost?  @relation("replies", fields: [parentId], references: [id])
  replies   DiscussionPost[] @relation("replies")
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([lessonId])
  @@index([parentId])
}
```

## Implementation

### Course Card

```tsx
// components/course/course-card.tsx
import Link from 'next/link';
import Image from 'next/image';
import { Clock, Users, BarChart, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatPrice, formatDuration } from '@/lib/utils';

interface CourseCardProps {
  course: {
    id: string;
    slug: string;
    title: string;
    shortDescription: string | null;
    thumbnail: string | null;
    price: number;
    currency: string;
    level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
    duration: number;
    lessonCount: number;
    instructor: {
      name: string;
      avatar: string | null;
    };
    _count: {
      enrollments: number;
    };
    averageRating?: number;
  };
  showProgress?: boolean;
  progress?: number;
}

const levelColors = {
  BEGINNER: 'bg-green-100 text-green-800',
  INTERMEDIATE: 'bg-yellow-100 text-yellow-800',
  ADVANCED: 'bg-red-100 text-red-800',
};

export function CourseCard({ course, showProgress, progress }: CourseCardProps) {
  return (
    <Link href={`/courses/${course.slug}`}>
      <article className="group bg-white dark:bg-gray-900 rounded-xl overflow-hidden border hover:shadow-lg transition-shadow">
        {/* Thumbnail */}
        <div className="relative aspect-video">
          {course.thumbnail ? (
            <Image
              src={course.thumbnail}
              alt={course.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600" />
          )}
          <Badge className={`absolute top-3 left-3 ${levelColors[course.level]}`}>
            {course.level}
          </Badge>
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-semibold text-lg mb-1 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {course.title}
          </h3>
          
          {course.shortDescription && (
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
              {course.shortDescription}
            </p>
          )}

          {/* Instructor */}
          <div className="flex items-center gap-2 mb-3">
            {course.instructor.avatar ? (
              <Image
                src={course.instructor.avatar}
                alt={course.instructor.name}
                width={24}
                height={24}
                className="rounded-full"
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700" />
            )}
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {course.instructor.name}
            </span>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {formatDuration(course.duration)}
            </span>
            <span className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              {course._count.enrollments.toLocaleString()}
            </span>
            {course.averageRating && (
              <span className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                {course.averageRating.toFixed(1)}
              </span>
            )}
          </div>

          {/* Progress or Price */}
          {showProgress && progress !== undefined ? (
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Progress</span>
                <span className="font-medium">{Math.round(progress)}%</span>
              </div>
              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <span className="text-xl font-bold">
                {formatPrice(course.price, course.currency)}
              </span>
              {course.price > 0 && (
                <span className="text-sm text-gray-500 line-through">
                  {formatPrice(course.price * 1.5, course.currency)}
                </span>
              )}
            </div>
          )}
        </div>
      </article>
    </Link>
  );
}
```

### Lesson Player

```tsx
// components/course/lesson-player.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import ReactPlayer from 'react-player';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Play, Pause, Volume2, VolumeX, Maximize, 
  SkipBack, SkipForward, Settings, CheckCircle 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { cn, formatTime } from '@/lib/utils';

interface LessonPlayerProps {
  lesson: {
    id: string;
    title: string;
    videoUrl: string;
    videoDuration: number;
  };
  initialProgress: number;
  onComplete: () => void;
}

export function LessonPlayer({ lesson, initialProgress, onComplete }: LessonPlayerProps) {
  const playerRef = useRef<ReactPlayer>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [played, setPlayed] = useState(0);
  const [playedSeconds, setPlayedSeconds] = useState(initialProgress);
  const [duration, setDuration] = useState(lesson.videoDuration);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const hideControlsTimeout = useRef<NodeJS.Timeout>();
  const queryClient = useQueryClient();

  // Save progress mutation
  const saveProgress = useMutation({
    mutationFn: async (seconds: number) => {
      const response = await fetch(`/api/lessons/${lesson.id}/progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ watchedSeconds: Math.floor(seconds) }),
      });
      if (!response.ok) throw new Error('Failed to save progress');
      return response.json();
    },
  });

  // Mark complete mutation
  const markComplete = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/lessons/${lesson.id}/complete`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to mark complete');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course-progress'] });
      onComplete();
    },
  });

  // Auto-save progress every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (isPlaying && playedSeconds > 0) {
        saveProgress.mutate(playedSeconds);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [isPlaying, playedSeconds]);

  // Mark complete when 90% watched
  useEffect(() => {
    if (played >= 0.9 && !markComplete.isSuccess) {
      markComplete.mutate();
    }
  }, [played]);

  // Seek to saved progress on mount
  useEffect(() => {
    if (initialProgress > 0 && playerRef.current) {
      playerRef.current.seekTo(initialProgress, 'seconds');
    }
  }, []);

  // Hide controls after inactivity
  useEffect(() => {
    const handleMouseMove = () => {
      setShowControls(true);
      if (hideControlsTimeout.current) {
        clearTimeout(hideControlsTimeout.current);
      }
      if (isPlaying) {
        hideControlsTimeout.current = setTimeout(() => {
          setShowControls(false);
        }, 3000);
      }
    };

    const container = containerRef.current;
    container?.addEventListener('mousemove', handleMouseMove);
    return () => container?.removeEventListener('mousemove', handleMouseMove);
  }, [isPlaying]);

  const handleProgress = (state: { played: number; playedSeconds: number }) => {
    setPlayed(state.played);
    setPlayedSeconds(state.playedSeconds);
  };

  const handleSeek = (value: number[]) => {
    const seekTo = value[0];
    setPlayed(seekTo);
    playerRef.current?.seekTo(seekTo, 'fraction');
  };

  const skip = (seconds: number) => {
    const newTime = playedSeconds + seconds;
    playerRef.current?.seekTo(newTime, 'seconds');
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const playbackRates = [0.5, 0.75, 1, 1.25, 1.5, 2];

  return (
    <div 
      ref={containerRef}
      className="relative aspect-video bg-black rounded-xl overflow-hidden group"
    >
      <ReactPlayer
        ref={playerRef}
        url={lesson.videoUrl}
        width="100%"
        height="100%"
        playing={isPlaying}
        muted={isMuted}
        volume={volume}
        playbackRate={playbackRate}
        onProgress={handleProgress}
        onDuration={setDuration}
        onEnded={() => {
          setIsPlaying(false);
          markComplete.mutate();
        }}
        progressInterval={1000}
      />

      {/* Controls Overlay */}
      <div 
        className={cn(
          'absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 transition-opacity',
          showControls ? 'opacity-100' : 'opacity-0'
        )}
      >
        {/* Top Bar */}
        <div className="absolute top-0 left-0 right-0 p-4">
          <h2 className="text-white font-medium">{lesson.title}</h2>
        </div>

        {/* Center Play Button */}
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="absolute inset-0 flex items-center justify-center"
        >
          <div className={cn(
            'w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center transition-transform',
            isPlaying ? 'scale-0' : 'scale-100'
          )}>
            <Play className="w-10 h-10 text-white fill-white ml-1" />
          </div>
        </button>

        {/* Bottom Controls */}
        <div className="absolute bottom-0 left-0 right-0 p-4 space-y-2">
          {/* Progress Bar */}
          <Slider
            value={[played]}
            max={1}
            step={0.001}
            onValueChange={handleSeek}
            className="cursor-pointer"
          />

          {/* Control Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsPlaying(!isPlaying)}
                className="text-white hover:bg-white/20"
              >
                {isPlaying ? (
                  <Pause className="h-5 w-5" />
                ) : (
                  <Play className="h-5 w-5" />
                )}
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => skip(-10)}
                className="text-white hover:bg-white/20"
              >
                <SkipBack className="h-5 w-5" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => skip(10)}
                className="text-white hover:bg-white/20"
              >
                <SkipForward className="h-5 w-5" />
              </Button>

              {/* Volume */}
              <div className="flex items-center gap-1 group/volume">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsMuted(!isMuted)}
                  className="text-white hover:bg-white/20"
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="h-5 w-5" />
                  ) : (
                    <Volume2 className="h-5 w-5" />
                  )}
                </Button>
                <div className="w-0 overflow-hidden group-hover/volume:w-20 transition-all">
                  <Slider
                    value={[isMuted ? 0 : volume]}
                    max={1}
                    step={0.1}
                    onValueChange={(v) => {
                      setVolume(v[0]);
                      setIsMuted(v[0] === 0);
                    }}
                  />
                </div>
              </div>

              {/* Time */}
              <span className="text-white text-sm ml-2">
                {formatTime(playedSeconds)} / {formatTime(duration)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Playback Speed */}
              <select
                value={playbackRate}
                onChange={(e) => setPlaybackRate(Number(e.target.value))}
                className="bg-transparent text-white text-sm border border-white/30 rounded px-2 py-1"
              >
                {playbackRates.map((rate) => (
                  <option key={rate} value={rate} className="text-black">
                    {rate}x
                  </option>
                ))}
              </select>

              {/* Fullscreen */}
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleFullscreen}
                className="text-white hover:bg-white/20"
              >
                <Maximize className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Completion Badge */}
      {markComplete.isSuccess && (
        <div className="absolute top-4 right-4 flex items-center gap-2 bg-green-500 text-white px-3 py-1 rounded-full text-sm">
          <CheckCircle className="h-4 w-4" />
          Completed
        </div>
      )}
    </div>
  );
}
```

### Quiz Player

```tsx
// components/quiz/quiz-player.tsx
'use client';

import { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Clock, ChevronLeft, ChevronRight, Flag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { QuestionCard } from './question-card';
import { QuizResults } from './quiz-results';
import { cn, formatTime } from '@/lib/utils';

interface Question {
  id: string;
  text: string;
  type: 'MULTIPLE_CHOICE' | 'MULTIPLE_SELECT' | 'TRUE_FALSE' | 'SHORT_ANSWER';
  points: number;
  options: {
    id: string;
    text: string;
  }[];
}

interface QuizPlayerProps {
  quiz: {
    id: string;
    title: string;
    description: string | null;
    passingScore: number;
    timeLimit: number | null;
    questions: Question[];
  };
  onComplete: () => void;
}

interface Answer {
  questionId: string;
  selectedOptions?: string[];
  textAnswer?: string;
}

export function QuizPlayer({ quiz, onComplete }: QuizPlayerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Map<string, Answer>>(new Map());
  const [flagged, setFlagged] = useState<Set<string>>(new Set());
  const [timeRemaining, setTimeRemaining] = useState(quiz.timeLimit ? quiz.timeLimit * 60 : null);
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<any>(null);

  // Timer
  useEffect(() => {
    if (timeRemaining === null || timeRemaining <= 0) return;

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev === null || prev <= 1) {
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timeRemaining]);

  const submitQuiz = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/quizzes/${quiz.id}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answers: Array.from(answers.values()),
          timeSpent: quiz.timeLimit ? (quiz.timeLimit * 60) - (timeRemaining || 0) : null,
        }),
      });
      if (!response.ok) throw new Error('Failed to submit quiz');
      return response.json();
    },
    onSuccess: (data) => {
      setResults(data);
      setShowResults(true);
      if (data.passed) {
        onComplete();
      }
    },
  });

  const currentQuestion = quiz.questions[currentIndex];
  const answeredCount = answers.size;
  const totalQuestions = quiz.questions.length;

  const handleAnswer = (answer: Answer) => {
    setAnswers((prev) => new Map(prev).set(answer.questionId, answer));
  };

  const toggleFlag = () => {
    setFlagged((prev) => {
      const next = new Set(prev);
      if (next.has(currentQuestion.id)) {
        next.delete(currentQuestion.id);
      } else {
        next.add(currentQuestion.id);
      }
      return next;
    });
  };

  const handleSubmit = () => {
    submitQuiz.mutate();
  };

  if (showResults && results) {
    return (
      <QuizResults
        results={results}
        quiz={quiz}
        answers={answers}
        onRetry={() => {
          setAnswers(new Map());
          setFlagged(new Set());
          setCurrentIndex(0);
          setTimeRemaining(quiz.timeLimit ? quiz.timeLimit * 60 : null);
          setShowResults(false);
          setResults(null);
        }}
      />
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{quiz.title}</h1>
          <p className="text-gray-500">
            Question {currentIndex + 1} of {totalQuestions}
          </p>
        </div>

        {timeRemaining !== null && (
          <div className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-lg',
            timeRemaining < 60 ? 'bg-red-100 text-red-600' : 'bg-gray-100'
          )}>
            <Clock className="h-5 w-5" />
            {formatTime(timeRemaining)}
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="flex gap-1 mb-6">
        {quiz.questions.map((q, i) => (
          <button
            key={q.id}
            onClick={() => setCurrentIndex(i)}
            className={cn(
              'flex-1 h-2 rounded-full transition-colors',
              i === currentIndex && 'ring-2 ring-blue-500 ring-offset-2',
              answers.has(q.id) ? 'bg-green-500' : 'bg-gray-200',
              flagged.has(q.id) && 'bg-yellow-500'
            )}
          />
        ))}
      </div>

      {/* Question */}
      <QuestionCard
        question={currentQuestion}
        answer={answers.get(currentQuestion.id)}
        onAnswer={handleAnswer}
        isFlagged={flagged.has(currentQuestion.id)}
        onToggleFlag={toggleFlag}
      />

      {/* Navigation */}
      <div className="flex items-center justify-between mt-6">
        <Button
          variant="outline"
          onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
          disabled={currentIndex === 0}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Previous
        </Button>

        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">
            {answeredCount}/{totalQuestions} answered
          </span>
          
          {currentIndex === totalQuestions - 1 ? (
            <Button
              onClick={handleSubmit}
              disabled={submitQuiz.isPending}
              className="bg-green-600 hover:bg-green-700"
            >
              {submitQuiz.isPending ? 'Submitting...' : 'Submit Quiz'}
            </Button>
          ) : (
            <Button
              onClick={() => setCurrentIndex(Math.min(totalQuestions - 1, currentIndex + 1))}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          )}
        </div>
      </div>

      {/* Question Navigator */}
      <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
        <h3 className="font-medium mb-3">Question Navigator</h3>
        <div className="flex flex-wrap gap-2">
          {quiz.questions.map((q, i) => (
            <button
              key={q.id}
              onClick={() => setCurrentIndex(i)}
              className={cn(
                'w-10 h-10 rounded-lg font-medium transition-colors',
                i === currentIndex && 'ring-2 ring-blue-500',
                answers.has(q.id) 
                  ? 'bg-green-500 text-white' 
                  : 'bg-white dark:bg-gray-800 border',
                flagged.has(q.id) && 'border-2 border-yellow-500'
              )}
            >
              {i + 1}
            </button>
          ))}
        </div>
        <div className="flex gap-4 mt-3 text-sm text-gray-500">
          <span className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-green-500" /> Answered
          </span>
          <span className="flex items-center gap-1">
            <div className="w-3 h-3 rounded border-2 border-yellow-500" /> Flagged
          </span>
        </div>
      </div>
    </div>
  );
}
```

### Course Progress API

```tsx
// app/api/courses/[courseId]/progress/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const { courseId } = await params;
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check enrollment
  const enrollment = await prisma.enrollment.findUnique({
    where: {
      userId_courseId: {
        userId: session.user.id,
        courseId,
      },
    },
  });

  if (!enrollment) {
    return NextResponse.json({ error: 'Not enrolled' }, { status: 403 });
  }

  // Get all lessons in the course
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      chapters: {
        orderBy: { position: 'asc' },
        include: {
          lessons: {
            orderBy: { position: 'asc' },
            select: { id: true, title: true, type: true, videoDuration: true },
          },
        },
      },
    },
  });

  if (!course) {
    return NextResponse.json({ error: 'Course not found' }, { status: 404 });
  }

  // Get user's progress for all lessons
  const allLessonIds = course.chapters.flatMap(c => c.lessons.map(l => l.id));
  
  const progress = await prisma.lessonProgress.findMany({
    where: {
      userId: session.user.id,
      lessonId: { in: allLessonIds },
    },
  });

  const progressMap = new Map(progress.map(p => [p.lessonId, p]));

  // Calculate overall progress
  const completedCount = progress.filter(p => p.completed).length;
  const totalLessons = allLessonIds.length;
  const overallProgress = totalLessons > 0 ? (completedCount / totalLessons) * 100 : 0;

  // Build detailed progress
  const chaptersProgress = course.chapters.map(chapter => ({
    id: chapter.id,
    title: chapter.title,
    lessons: chapter.lessons.map(lesson => ({
      id: lesson.id,
      title: lesson.title,
      type: lesson.type,
      duration: lesson.videoDuration,
      completed: progressMap.get(lesson.id)?.completed || false,
      watchedSeconds: progressMap.get(lesson.id)?.watchedSeconds || 0,
    })),
    completedLessons: chapter.lessons.filter(l => progressMap.get(l.id)?.completed).length,
    totalLessons: chapter.lessons.length,
  }));

  // Update enrollment progress
  await prisma.enrollment.update({
    where: { id: enrollment.id },
    data: { progress: overallProgress },
  });

  return NextResponse.json({
    overallProgress,
    completedLessons: completedCount,
    totalLessons,
    chapters: chaptersProgress,
    isCompleted: overallProgress >= 100,
  });
}
```

### Certificate Generation

```tsx
// lib/certificates.ts
import { prisma } from './prisma';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { uploadToStorage } from './storage';

export async function generateCertificate(
  userId: string,
  courseId: string
): Promise<string> {
  // Get user and course data
  const [user, course] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.course.findUnique({
      where: { id: courseId },
      include: { instructor: true },
    }),
  ]);

  if (!user || !course) {
    throw new Error('User or course not found');
  }

  // Create PDF
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([842, 595]); // A4 Landscape
  const { width, height } = page.getSize();

  // Load fonts
  const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const timesBoldFont = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
  const timesItalicFont = await pdfDoc.embedFont(StandardFonts.TimesRomanItalic);

  // Draw border
  page.drawRectangle({
    x: 20,
    y: 20,
    width: width - 40,
    height: height - 40,
    borderColor: rgb(0.2, 0.4, 0.6),
    borderWidth: 3,
  });

  page.drawRectangle({
    x: 30,
    y: 30,
    width: width - 60,
    height: height - 60,
    borderColor: rgb(0.7, 0.7, 0.7),
    borderWidth: 1,
  });

  // Header
  page.drawText('CERTIFICATE OF COMPLETION', {
    x: width / 2 - 180,
    y: height - 100,
    size: 28,
    font: timesBoldFont,
    color: rgb(0.2, 0.4, 0.6),
  });

  // Subtitle
  page.drawText('This is to certify that', {
    x: width / 2 - 80,
    y: height - 180,
    size: 14,
    font: timesItalicFont,
    color: rgb(0.3, 0.3, 0.3),
  });

  // Student name
  page.drawText(user.name, {
    x: width / 2 - (user.name.length * 12),
    y: height - 230,
    size: 36,
    font: timesBoldFont,
    color: rgb(0.1, 0.1, 0.1),
  });

  // Course completion text
  page.drawText('has successfully completed the course', {
    x: width / 2 - 130,
    y: height - 290,
    size: 14,
    font: timesItalicFont,
    color: rgb(0.3, 0.3, 0.3),
  });

  // Course title
  page.drawText(course.title, {
    x: width / 2 - (course.title.length * 8),
    y: height - 340,
    size: 24,
    font: timesBoldFont,
    color: rgb(0.2, 0.4, 0.6),
  });

  // Date
  const completionDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  page.drawText(`Completed on ${completionDate}`, {
    x: width / 2 - 80,
    y: height - 400,
    size: 12,
    font: timesRomanFont,
    color: rgb(0.4, 0.4, 0.4),
  });

  // Instructor signature
  page.drawLine({
    start: { x: width / 2 - 100, y: 120 },
    end: { x: width / 2 + 100, y: 120 },
    color: rgb(0.5, 0.5, 0.5),
    thickness: 1,
  });

  page.drawText(course.instructor.name, {
    x: width / 2 - 50,
    y: 130,
    size: 14,
    font: timesBoldFont,
    color: rgb(0.2, 0.2, 0.2),
  });

  page.drawText('Instructor', {
    x: width / 2 - 30,
    y: 100,
    size: 10,
    font: timesItalicFont,
    color: rgb(0.5, 0.5, 0.5),
  });

  // Generate unique ID
  const certificateId = `CERT-${Date.now()}-${userId.slice(-4)}`;
  
  page.drawText(`Certificate ID: ${certificateId}`, {
    x: 50,
    y: 50,
    size: 8,
    font: timesRomanFont,
    color: rgb(0.6, 0.6, 0.6),
  });

  // Save PDF
  const pdfBytes = await pdfDoc.save();
  const pdfBuffer = Buffer.from(pdfBytes);

  // Upload to storage
  const pdfUrl = await uploadToStorage(
    pdfBuffer,
    `certificates/${certificateId}.pdf`,
    'application/pdf'
  );

  // Create certificate record
  await prisma.certificate.create({
    data: {
      uniqueId: certificateId,
      userId,
      courseId,
      courseName: course.title,
      instructorName: course.instructor.name,
      completedAt: new Date(),
      pdfUrl,
    },
  });

  return pdfUrl;
}
```

### Instructor Dashboard

```tsx
// app/(instructor)/instructor/page.tsx
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { 
  BookOpen, Users, DollarSign, TrendingUp,
  Eye, Star, Clock
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatPrice } from '@/lib/utils';

export default async function InstructorDashboardPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user || session.user.role !== 'INSTRUCTOR') {
    redirect('/');
  }

  // Fetch instructor stats
  const [courses, enrollments, recentEnrollments] = await Promise.all([
    prisma.course.findMany({
      where: { instructorId: session.user.id },
      include: {
        _count: { select: { enrollments: true } },
      },
    }),
    prisma.enrollment.findMany({
      where: {
        course: { instructorId: session.user.id },
      },
      include: {
        user: { select: { name: true, avatar: true } },
        course: { select: { title: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    }),
    prisma.enrollment.count({
      where: {
        course: { instructorId: session.user.id },
        createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      },
    }),
  ]);

  const totalStudents = courses.reduce((acc, c) => acc + c._count.enrollments, 0);
  const totalRevenue = enrollments.reduce(
    (acc, e) => acc + (e.amount ? Number(e.amount) : 0),
    0
  );
  const publishedCourses = courses.filter(c => c.status === 'PUBLISHED').length;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Instructor Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{courses.length}</div>
            <p className="text-xs text-gray-500">
              {publishedCourses} published
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStudents.toLocaleString()}</div>
            <p className="text-xs text-green-600">
              +{recentEnrollments} this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPrice(totalRevenue, 'USD')}</div>
            <p className="text-xs text-gray-500">Lifetime earnings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg. Completion</CardTitle>
            <TrendingUp className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">67%</div>
            <p className="text-xs text-gray-500">Course completion rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Enrollments */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Enrollments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {enrollments.map((enrollment) => (
              <div key={enrollment.id} className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                  {enrollment.user.avatar && (
                    <img
                      src={enrollment.user.avatar}
                      alt={enrollment.user.name}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium">{enrollment.user.name}</p>
                  <p className="text-sm text-gray-500">
                    Enrolled in {enrollment.course.title}
                  </p>
                </div>
                <span className="text-sm text-gray-500">
                  {new Date(enrollment.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

## Skills Used

| Skill | Purpose | Reference |
|-------|---------|-----------|
| video-player | Lesson video playback with progress | [video-player.md](../patterns/video-player.md) |
| progress-tracking | Course and lesson completion tracking | [progress-tracking.md](../patterns/progress-tracking.md) |
| quiz-engine | Interactive assessments and grading | [quiz-engine.md](../patterns/quiz-engine.md) |
| payments | Course purchases with Stripe | [payments.md](../patterns/payments.md) |
| pdf-generation | Certificate creation and download | [pdf-generation.md](../patterns/pdf-generation.md) |

## Testing

### Test Setup

```tsx
// __tests__/setup.ts
import '@testing-library/jest-dom';
import { server } from './mocks/server';

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

### Unit Tests

```tsx
// __tests__/components/course-card.test.tsx
import { render, screen } from '@testing-library/react';
import { CourseCard } from '@/components/course/course-card';

const mockCourse = {
  id: '1',
  slug: 'react-fundamentals',
  title: 'React Fundamentals',
  shortDescription: 'Learn React from scratch',
  thumbnail: '/course-thumb.jpg',
  price: 49.99,
  currency: 'USD',
  level: 'BEGINNER',
  duration: 360,
  lessonCount: 24,
  instructor: { name: 'John Doe', avatar: null },
  _count: { enrollments: 1500 },
  averageRating: 4.8,
};

describe('CourseCard', () => {
  it('renders course title and instructor', () => {
    render(<CourseCard course={mockCourse} />);
    expect(screen.getByText('React Fundamentals')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('displays formatted price', () => {
    render(<CourseCard course={mockCourse} />);
    expect(screen.getByText('$49.99')).toBeInTheDocument();
  });

  it('shows progress when enrolled', () => {
    render(<CourseCard course={mockCourse} showProgress progress={65} />);
    expect(screen.getByText('65%')).toBeInTheDocument();
  });

  it('displays level badge', () => {
    render(<CourseCard course={mockCourse} />);
    expect(screen.getByText('BEGINNER')).toBeInTheDocument();
  });
});
```

### Integration Tests

```tsx
// __tests__/api/courses.test.ts
import { GET } from '@/app/api/courses/[courseId]/progress/route';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';

jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
}));

describe('GET /api/courses/[courseId]/progress', () => {
  it('returns progress for enrolled user', async () => {
    (getServerSession as jest.Mock).mockResolvedValue({
      user: { id: 'user-1' },
    });

    const request = new Request('http://localhost/api/courses/course-1/progress');
    const response = await GET(request, { params: Promise.resolve({ courseId: 'course-1' }) });
    const data = await response.json();

    expect(data.overallProgress).toBeDefined();
    expect(data.completedLessons).toBeDefined();
  });

  it('returns 403 for non-enrolled user', async () => {
    (getServerSession as jest.Mock).mockResolvedValue({
      user: { id: 'user-2' },
    });

    const request = new Request('http://localhost/api/courses/course-1/progress');
    const response = await GET(request, { params: Promise.resolve({ courseId: 'course-1' }) });

    expect(response.status).toBe(403);
  });
});
```

### E2E Tests (Playwright)

```tsx
// e2e/course-player.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Course Player', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', 'student@test.com');
    await page.fill('input[name="password"]', 'password');
    await page.click('button[type="submit"]');
  });

  test('plays video lesson and tracks progress', async ({ page }) => {
    await page.goto('/courses/react-fundamentals/learn/lesson-1');

    const playButton = page.locator('button[aria-label="Play"]');
    await playButton.click();

    // Wait for video to play for a few seconds
    await page.waitForTimeout(5000);

    // Check progress is being tracked
    const progressBar = page.locator('[data-testid="progress-bar"]');
    await expect(progressBar).toHaveAttribute('style', /width: [1-9]/);
  });

  test('marks lesson complete at 90%', async ({ page }) => {
    await page.goto('/courses/react-fundamentals/learn/lesson-1');

    // Simulate watching 90% of video
    await page.evaluate(() => {
      const video = document.querySelector('video');
      if (video) video.currentTime = video.duration * 0.9;
    });

    await expect(page.locator('text=Completed')).toBeVisible();
  });

  test('navigates to next lesson', async ({ page }) => {
    await page.goto('/courses/react-fundamentals/learn/lesson-1');
    await page.click('text=Next');

    await expect(page).toHaveURL(/lesson-2/);
  });
});

test.describe('Quiz', () => {
  test('submits quiz and shows results', async ({ page }) => {
    await page.goto('/courses/react-fundamentals/quiz/quiz-1');

    // Answer questions
    await page.click('text=useState');
    await page.click('text=Next');
    await page.click('text=Component');
    await page.click('text=Submit Quiz');

    await expect(page.locator('[data-testid="quiz-score"]')).toBeVisible();
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Unable to load course content</h2>
        <p className="text-gray-600 mb-4">
          We're having trouble loading this lesson. Please try again.
        </p>
        <button
          onClick={reset}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg"
        >
          Retry
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

// Usage in route handler
export async function POST(request: Request) {
  try {
    const data = await request.json();
    // ... handle request
  } catch (error) {
    return handleAPIError(error);
  }
}
```

### Form Validation Errors

```tsx
// lib/validations/course.ts
import { z } from 'zod';

export const courseSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(50, 'Description must be at least 50 characters'),
  price: z.number().min(0, 'Price must be positive'),
  level: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']),
});

export const lessonSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  videoUrl: z.string().url('Invalid video URL'),
  content: z.string().optional(),
});

export const quizAnswerSchema = z.object({
  questionId: z.string().cuid(),
  selectedOptions: z.array(z.string()).optional(),
  textAnswer: z.string().max(1000).optional(),
});
```

## Accessibility

### WCAG Compliance

| Criterion | Level | Implementation |
|-----------|-------|----------------|
| 1.1.1 Non-text Content | A | Alt text for thumbnails, captions for videos |
| 1.2.1 Audio-only and Video-only | A | Video captions and transcripts |
| 1.3.1 Info and Relationships | A | Semantic HTML, ARIA labels |
| 1.4.3 Contrast | AA | 4.5:1 text contrast ratio |
| 2.1.1 Keyboard | A | Video controls keyboard accessible |
| 2.4.1 Bypass Blocks | A | Skip to content link |
| 2.4.4 Link Purpose | A | Descriptive lesson links |

### Focus Management

```tsx
// components/course/lesson-player.tsx
import { useRef, useEffect } from 'react';

export function LessonPlayer({ lesson, onComplete }: Props) {
  const playerRef = useRef<HTMLDivElement>(null);

  // Focus player on mount for keyboard navigation
  useEffect(() => {
    playerRef.current?.focus();
  }, [lesson.id]);

  return (
    <div
      ref={playerRef}
      tabIndex={-1}
      role="region"
      aria-label={`Video lesson: ${lesson.title}`}
    >
      <video
        controls
        aria-describedby="video-description"
      >
        <track kind="captions" src={lesson.captionsUrl} label="English" />
      </video>
      <p id="video-description" className="sr-only">
        {lesson.description}
      </p>
    </div>
  );
}
```

### Accessible Quiz Forms

```tsx
// components/quiz/question-card.tsx
<fieldset>
  <legend className="text-lg font-medium mb-4">
    {question.text}
    <span className="sr-only">
      Question {index + 1} of {total}
    </span>
  </legend>

  {question.options.map((option, i) => (
    <label
      key={option.id}
      className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer"
    >
      <input
        type={question.type === 'MULTIPLE_SELECT' ? 'checkbox' : 'radio'}
        name={`question-${question.id}`}
        value={option.id}
        aria-describedby={`option-${option.id}-help`}
      />
      <span>{option.text}</span>
    </label>
  ))}
</fieldset>
```

## Security

### Zod Validation

```tsx
// lib/validations/enrollment.ts
import { z } from 'zod';

export const enrollmentSchema = z.object({
  courseId: z.string().cuid(),
  paymentIntentId: z.string().optional(),
});

export const progressSchema = z.object({
  lessonId: z.string().cuid(),
  watchedSeconds: z.number().int().min(0),
});

export const quizSubmissionSchema = z.object({
  quizId: z.string().cuid(),
  answers: z.array(z.object({
    questionId: z.string().cuid(),
    selectedOptions: z.array(z.string().cuid()).optional(),
    textAnswer: z.string().max(1000).optional(),
  })),
  timeSpent: z.number().int().min(0).optional(),
});
```

### Rate Limiting

```tsx
// middleware.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(100, '1 m'),
});

export async function middleware(request: NextRequest) {
  // Rate limit lesson progress updates
  if (request.nextUrl.pathname.includes('/progress')) {
    const ip = request.ip ?? '127.0.0.1';
    const { success } = await ratelimit.limit(`progress:${ip}`);

    if (!success) {
      return new Response('Too many requests', { status: 429 });
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

export async function requireEnrollment(courseId: string) {
  const user = await requireAuth();

  const enrollment = await prisma.enrollment.findUnique({
    where: {
      userId_courseId: { userId: user.id, courseId },
    },
  });

  if (!enrollment) {
    throw new APIError('Not enrolled in this course', 403);
  }

  return { user, enrollment };
}

export async function requireInstructor(courseId: string) {
  const user = await requireAuth();

  const course = await prisma.course.findUnique({
    where: { id: courseId },
  });

  if (course?.instructorId !== user.id) {
    throw new APIError('Not authorized to modify this course', 403);
  }

  return user;
}
```

## Performance

### Caching Strategy

```tsx
// app/api/courses/[courseId]/route.ts
import { unstable_cache } from 'next/cache';

const getCachedCourse = unstable_cache(
  async (courseId: string) => {
    return prisma.course.findUnique({
      where: { id: courseId },
      include: {
        instructor: true,
        chapters: {
          include: { lessons: true },
          orderBy: { position: 'asc' },
        },
      },
    });
  },
  ['course'],
  { revalidate: 300, tags: ['course'] }
);

// Invalidate on course update
import { revalidateTag } from 'next/cache';
revalidateTag('course');
```

### Video Optimization

```tsx
// components/course/lesson-player.tsx
// Use adaptive streaming with HLS
<ReactPlayer
  url={lesson.videoUrl}
  config={{
    file: {
      attributes: {
        controlsList: 'nodownload',
        disablePictureInPicture: true,
      },
      hlsOptions: {
        maxBufferLength: 30,
        maxMaxBufferLength: 600,
      },
    },
  }}
/>

// Preload next lesson
useEffect(() => {
  if (nextLesson) {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = nextLesson.videoUrl;
    document.head.appendChild(link);
  }
}, [nextLesson]);
```

### Bundle Optimization

```tsx
// Dynamic imports for heavy components
const QuizPlayer = dynamic(() => import('@/components/quiz/quiz-player'), {
  loading: () => <QuizSkeleton />,
  ssr: false,
});

const VideoPlayer = dynamic(() => import('@/components/course/lesson-player'), {
  loading: () => <VideoSkeleton />,
  ssr: false,
});
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

// Track video playback errors
export function trackVideoError(lessonId: string, error: Error) {
  Sentry.captureException(error, {
    tags: { feature: 'video-player' },
    extra: { lessonId },
  });
}

// Track quiz submission errors
export function trackQuizError(quizId: string, error: Error) {
  Sentry.captureException(error, {
    tags: { feature: 'quiz-engine' },
    extra: { quizId },
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
    storage: false,
    timestamp: new Date().toISOString(),
  };

  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.database = true;
  } catch (e) {
    console.error('Database health check failed:', e);
  }

  // Check video storage connectivity
  try {
    const response = await fetch(process.env.VIDEO_STORAGE_URL + '/health');
    checks.storage = response.ok;
  } catch (e) {
    console.error('Storage health check failed:', e);
  }

  const healthy = checks.database && checks.storage;

  return Response.json(checks, {
    status: healthy ? 200 : 503,
  });
}
```

## Environment Variables

```bash
# .env.example

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/learning"

# Authentication
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# Video Storage
VIDEO_STORAGE_URL="https://videos.example.com"
VIDEO_STORAGE_ACCESS_KEY="your-access-key"
VIDEO_STORAGE_SECRET_KEY="your-secret-key"

# Stripe (for course purchases)
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."

# Email
SMTP_HOST="smtp.example.com"
SMTP_PORT="587"
SMTP_USER="your-email"
SMTP_PASSWORD="your-password"

# Certificate Storage
CERTIFICATE_STORAGE_URL="https://certs.example.com"

# Monitoring
NEXT_PUBLIC_SENTRY_DSN="https://..."
SENTRY_AUTH_TOKEN="sntrys_..."

# Rate Limiting
UPSTASH_REDIS_REST_URL="https://..."
UPSTASH_REDIS_REST_TOKEN="..."
```

## Deployment Checklist

- [ ] Environment variables configured in production
- [ ] Database migrations run successfully
- [ ] Stripe webhooks configured (course purchases)
- [ ] Video storage and streaming configured
- [ ] SSL certificate installed
- [ ] CDN configured for video delivery
- [ ] Rate limiting enabled
- [ ] Error monitoring configured (Sentry)
- [ ] Health check endpoint verified
- [ ] Video transcoding pipeline ready
- [ ] Certificate PDF generation tested
- [ ] Email notifications working
- [ ] Cache headers configured
- [ ] SEO meta tags added
- [ ] Analytics tracking installed
- [ ] Backup strategy in place
- [ ] Load testing completed

## Related Skills

- [Video Player](../patterns/video-player.md) - Lesson playback
- [Progress Tracking](../patterns/progress-tracking.md) - Course progress
- [Quiz Engine](../patterns/quiz-engine.md) - Assessments
- [Payments](../patterns/payments.md) - Course purchases
- [PDF Generation](../patterns/pdf-generation.md) - Certificates

## Changelog

### 1.0.0 (2025-01-17)

- Initial implementation with courses, lessons, quizzes
- Video player with progress saving
- Quiz system with multiple question types
- Certificate generation
- Instructor dashboard with analytics
- Student progress tracking
