---
id: r-recipe-app
name: Recipe App
version: 3.0.0
layer: L6
category: recipes
description: Mobile-first recipe management with CRUD, meal planning, shopping lists, and nutrition tracking
tags: [recipes, cooking, meal-planning, shopping-list, mobile-first, pwa]
formula: "RecipeApp = DashboardLayout(t-dashboard-layout) + SearchResultsPage(t-search-results-page) + GalleryPage(t-gallery-page) + AuthLayout(t-auth-layout) + ProfilePage(t-profile-page) + SettingsPage(t-settings-page) + Header(o-header) + MediaGallery(o-media-gallery) + FileUploader(o-file-uploader) + Calendar(o-calendar) + MultiStepForm(o-multi-step-form) + Tabs(o-tabs) + Modal(o-modal) + DataTable(o-data-table) + Breadcrumb(m-breadcrumb) + Pagination(m-pagination) + Card(m-card) + FormField(m-form-field) + Badge(m-badge) + Avatar(m-avatar) + SearchInput(m-search-input) + RangeSlider(m-range-slider) + Toast(m-toast) + NextAuth(pt-next-auth) + AuthMiddleware(pt-auth-middleware) + SessionManagement(pt-session-management) + RateLimiting(pt-rate-limiting) + FormValidation(pt-form-validation) + ZodSchemas(pt-zod-schemas) + ServerActions(pt-server-actions) + Pwa(pt-pwa) + MobileFirst(pt-mobile-first) + OfflineSync(pt-offline-sync) + IndexedDb(pt-indexed-db) + ImageOptimization(pt-image-optimization) + Search(pt-search) + Mutations(pt-mutations) + TransactionalEmail(pt-transactional-email) + PushNotifications(pt-push-notifications) + ErrorBoundaries(pt-error-boundaries) + ErrorTracking(pt-error-tracking) + SkeletonLoading(pt-skeleton-loading) + Sitemap(pt-sitemap) + StructuredData(pt-structured-data) + MetadataApi(pt-metadata-api) + AnalyticsEvents(pt-analytics-events) + Filtering(pt-filtering) + Pagination(pt-pagination) + Sorting(pt-sorting) + ReactQuery(pt-react-query) + Zustand(pt-zustand) + OptimisticUpdates(pt-optimistic-updates) + SocialSharing(pt-social-sharing) + PrintStyles(pt-print-styles) + TestingE2e(pt-testing-e2e) + TestingUnit(pt-testing-unit) + AuditLogging(pt-audit-logging) + GdprCompliance(pt-gdpr-compliance) + Csp(pt-csp) + InputSanitization(pt-input-sanitization) + UserAnalytics(pt-user-analytics)"
composes:
  # L4 Templates
  - ../templates/dashboard-layout.md
  - ../templates/search-results-page.md
  - ../templates/gallery-page.md
  - ../templates/auth-layout.md
  - ../templates/profile-page.md
  - ../templates/settings-page.md
  # L3 Organisms
  - ../organisms/header.md
  - ../organisms/media-gallery.md
  - ../organisms/file-uploader.md
  - ../organisms/calendar.md
  - ../organisms/multi-step-form.md
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
  - ../molecules/search-input.md
  - ../molecules/range-slider.md
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
  # L5 Patterns - Recipe Specific
  - ../patterns/image-optimization.md
  - ../patterns/search.md
  - ../patterns/mutations.md
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
  # L5 Patterns - Data Management
  - ../patterns/filtering.md
  - ../patterns/pagination.md
  - ../patterns/sorting.md
  # L5 Patterns - State Management
  - ../patterns/react-query.md
  - ../patterns/zustand.md
  - ../patterns/optimistic-updates.md
  # L5 Patterns - Sharing & Print
  - ../patterns/social-sharing.md
  - ../patterns/print-styles.md
  # L5 Patterns - Testing
  - ../patterns/testing-e2e.md
  - ../patterns/testing-unit.md
  # L5 Patterns - Security (Additional)
  - ../patterns/audit-logging.md
  - ../patterns/gdpr-compliance.md
  - ../patterns/csp.md
  - ../patterns/input-sanitization.md
  # L5 Patterns - Analytics (Additional)
  - ../patterns/user-analytics.md
dependencies:
  - next@15.0.0
  - react@19.0.0
  - prisma@6.0.0
  - uploadthing@6.0.0
skills:
  - mobile-first
  - pwa
  - crud
  - search
  - drag-and-drop
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

A mobile-first recipe management application for home cooks. Features recipe creation with ingredients and steps, meal planning calendar, automatic shopping list generation, nutrition information, and cooking timers. Built as a PWA for offline access while cooking.

## Project Structure

```
app/
├── (auth)/
│   ├── login/page.tsx
│   └── register/page.tsx
├── (app)/
│   ├── layout.tsx
│   ├── page.tsx                    # Recipe feed / home
│   ├── recipes/
│   │   ├── page.tsx                # Browse recipes
│   │   ├── new/page.tsx            # Create recipe
│   │   ├── [id]/page.tsx           # Recipe detail
│   │   ├── [id]/edit/page.tsx      # Edit recipe
│   │   └── [id]/cook/page.tsx      # Cooking mode
│   ├── collections/
│   │   ├── page.tsx                # My collections
│   │   └── [id]/page.tsx           # Collection detail
│   ├── meal-plan/
│   │   ├── page.tsx                # Weekly meal plan
│   │   └── [date]/page.tsx         # Day detail
│   ├── shopping/
│   │   ├── page.tsx                # Shopping lists
│   │   └── [id]/page.tsx           # Active list
│   ├── discover/page.tsx           # Explore recipes
│   └── settings/page.tsx
├── api/
│   ├── recipes/
│   │   ├── route.ts
│   │   ├── [id]/route.ts
│   │   └── import/route.ts         # Import from URL
│   ├── collections/route.ts
│   ├── meal-plan/route.ts
│   ├── shopping-lists/
│   │   ├── route.ts
│   │   └── [id]/items/route.ts
│   └── upload/route.ts
├── manifest.ts
└── sw.ts
components/
├── recipes/
│   ├── recipe-card.tsx
│   ├── recipe-form.tsx
│   ├── ingredient-list.tsx
│   ├── instruction-steps.tsx
│   ├── nutrition-badge.tsx
│   └── cooking-mode.tsx
├── meal-plan/
│   ├── week-view.tsx
│   ├── day-card.tsx
│   └── meal-slot.tsx
├── shopping/
│   ├── shopping-list.tsx
│   ├── list-item.tsx
│   └── aisle-group.tsx
├── cooking/
│   ├── step-viewer.tsx
│   ├── timer.tsx
│   └── ingredient-checklist.tsx
└── layout/
    └── bottom-nav.tsx
lib/
├── nutrition.ts
├── shopping.ts
└── recipe-parser.ts
```

## Database Schema

```prisma
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
  
  // Preferences
  servingSize   Int       @default(4)
  dietaryPrefs  String[]
  
  recipes       Recipe[]
  collections   Collection[]
  mealPlans     MealPlan[]
  shoppingLists ShoppingList[]
  favorites     Favorite[]
  
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

model Recipe {
  id              String       @id @default(cuid())
  userId          String
  
  title           String
  slug            String
  description     String?      @db.Text
  
  // Media
  imageUrl        String?
  videoUrl        String?
  
  // Time
  prepTime        Int?         // Minutes
  cookTime        Int?         // Minutes
  totalTime       Int?         // Minutes
  
  // Servings
  servings        Int          @default(4)
  
  // Difficulty
  difficulty      Difficulty   @default(MEDIUM)
  
  // Categories
  cuisine         String?
  course          String?      // Breakfast, Lunch, Dinner, Dessert, Snack
  tags            String[]
  
  // Dietary
  isVegetarian    Boolean      @default(false)
  isVegan         Boolean      @default(false)
  isGlutenFree    Boolean      @default(false)
  isDairyFree     Boolean      @default(false)
  
  // Source
  sourceUrl       String?
  sourceName      String?
  
  // Visibility
  isPublic        Boolean      @default(false)
  
  // Stats
  viewCount       Int          @default(0)
  cookCount       Int          @default(0)
  rating          Float?
  ratingCount     Int          @default(0)
  
  user            User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  ingredients     Ingredient[]
  instructions    Instruction[]
  nutrition       Nutrition?
  collections     CollectionRecipe[]
  mealPlanItems   MealPlanItem[]
  favorites       Favorite[]
  
  createdAt       DateTime     @default(now())
  updatedAt       DateTime     @updatedAt
  
  @@unique([userId, slug])
  @@index([userId])
  @@index([isPublic])
}

enum Difficulty {
  EASY
  MEDIUM
  HARD
}

model Ingredient {
  id          String   @id @default(cuid())
  recipeId    String
  
  name        String
  amount      Float?
  unit        String?
  preparation String?  // e.g., "diced", "minced"
  group       String?  // e.g., "For the sauce", "For the crust"
  optional    Boolean  @default(false)
  order       Int      @default(0)
  
  recipe      Recipe   @relation(fields: [recipeId], references: [id], onDelete: Cascade)
  
  @@index([recipeId])
}

model Instruction {
  id          String   @id @default(cuid())
  recipeId    String
  
  step        Int
  content     String   @db.Text
  imageUrl    String?
  
  // Timer
  timerMinutes Int?
  timerLabel   String?
  
  recipe      Recipe   @relation(fields: [recipeId], references: [id], onDelete: Cascade)
  
  @@index([recipeId])
}

model Nutrition {
  id          String   @id @default(cuid())
  recipeId    String   @unique
  
  calories    Int?
  protein     Float?   // grams
  carbs       Float?   // grams
  fat         Float?   // grams
  fiber       Float?   // grams
  sugar       Float?   // grams
  sodium      Float?   // mg
  
  // Per serving
  perServing  Boolean  @default(true)
  
  recipe      Recipe   @relation(fields: [recipeId], references: [id], onDelete: Cascade)
}

model Collection {
  id          String   @id @default(cuid())
  userId      String
  
  name        String
  description String?
  imageUrl    String?
  isDefault   Boolean  @default(false)
  
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  recipes     CollectionRecipe[]
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@index([userId])
}

model CollectionRecipe {
  id           String     @id @default(cuid())
  collectionId String
  recipeId     String
  
  collection   Collection @relation(fields: [collectionId], references: [id], onDelete: Cascade)
  recipe       Recipe     @relation(fields: [recipeId], references: [id], onDelete: Cascade)
  
  addedAt      DateTime   @default(now())
  
  @@unique([collectionId, recipeId])
}

model Favorite {
  id        String   @id @default(cuid())
  userId    String
  recipeId  String
  
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  recipe    Recipe   @relation(fields: [recipeId], references: [id], onDelete: Cascade)
  
  createdAt DateTime @default(now())
  
  @@unique([userId, recipeId])
}

model MealPlan {
  id        String         @id @default(cuid())
  userId    String
  
  weekStart DateTime       @db.Date
  
  user      User           @relation(fields: [userId], references: [id], onDelete: Cascade)
  items     MealPlanItem[]
  
  createdAt DateTime       @default(now())
  updatedAt DateTime       @updatedAt
  
  @@unique([userId, weekStart])
  @@index([userId])
}

model MealPlanItem {
  id         String   @id @default(cuid())
  mealPlanId String
  recipeId   String?
  
  date       DateTime @db.Date
  mealType   MealType
  
  // For custom meals without recipe
  customName String?
  
  servings   Int      @default(4)
  notes      String?
  
  mealPlan   MealPlan @relation(fields: [mealPlanId], references: [id], onDelete: Cascade)
  recipe     Recipe?  @relation(fields: [recipeId], references: [id])
  
  @@index([mealPlanId])
  @@index([date])
}

enum MealType {
  BREAKFAST
  LUNCH
  DINNER
  SNACK
}

model ShoppingList {
  id        String             @id @default(cuid())
  userId    String
  
  name      String
  isActive  Boolean            @default(true)
  
  user      User               @relation(fields: [userId], references: [id], onDelete: Cascade)
  items     ShoppingListItem[]
  
  createdAt DateTime           @default(now())
  updatedAt DateTime           @updatedAt
  
  @@index([userId])
}

model ShoppingListItem {
  id             String       @id @default(cuid())
  shoppingListId String
  
  name           String
  amount         Float?
  unit           String?
  aisle          String?      // e.g., "Produce", "Dairy"
  
  isChecked      Boolean      @default(false)
  
  // Link to recipe if generated
  recipeId       String?
  recipeName     String?
  
  shoppingList   ShoppingList @relation(fields: [shoppingListId], references: [id], onDelete: Cascade)
  
  createdAt      DateTime     @default(now())
  
  @@index([shoppingListId])
}
```

## Implementation

### Recipe Detail Page

```tsx
// app/(app)/recipes/[id]/page.tsx
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { RecipeHeader } from '@/components/recipes/recipe-header';
import { IngredientList } from '@/components/recipes/ingredient-list';
import { InstructionSteps } from '@/components/recipes/instruction-steps';
import { NutritionBadge } from '@/components/recipes/nutrition-badge';
import { RecipeActions } from '@/components/recipes/recipe-actions';
import Link from 'next/link';
import { ChefHat } from 'lucide-react';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function RecipePage({ params }: Props) {
  const { id } = await params;
  const user = await getCurrentUser();
  
  const recipe = await prisma.recipe.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, name: true, avatarUrl: true } },
      ingredients: { orderBy: { order: 'asc' } },
      instructions: { orderBy: { step: 'asc' } },
      nutrition: true,
      _count: { select: { favorites: true } },
    },
  });
  
  if (!recipe) {
    notFound();
  }
  
  // Check access
  if (!recipe.isPublic && recipe.userId !== user?.id) {
    notFound();
  }
  
  // Check if favorited
  const isFavorited = user ? await prisma.favorite.findUnique({
    where: { userId_recipeId: { userId: user.id, recipeId: recipe.id } },
  }) : null;
  
  // Increment view count
  await prisma.recipe.update({
    where: { id },
    data: { viewCount: { increment: 1 } },
  });
  
  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Hero Image */}
      {recipe.imageUrl && (
        <div className="relative h-64 md:h-80">
          <img
            src={recipe.imageUrl}
            alt={recipe.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        </div>
      )}
      
      <div className="max-w-2xl mx-auto px-4 -mt-16 relative z-10">
        {/* Recipe Header */}
        <RecipeHeader
          recipe={recipe}
          isFavorited={!!isFavorited}
          favoriteCount={recipe._count.favorites}
          isOwner={recipe.userId === user?.id}
        />
        
        {/* Quick Info */}
        <div className="bg-white rounded-lg border p-4 mt-4">
          <div className="grid grid-cols-3 divide-x text-center">
            <div>
              <p className="text-2xl font-bold">{recipe.totalTime || '-'}</p>
              <p className="text-xs text-gray-500">minutes</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{recipe.servings}</p>
              <p className="text-xs text-gray-500">servings</p>
            </div>
            <div>
              <p className="text-2xl font-bold capitalize">{recipe.difficulty.toLowerCase()}</p>
              <p className="text-xs text-gray-500">difficulty</p>
            </div>
          </div>
        </div>
        
        {/* Description */}
        {recipe.description && (
          <div className="bg-white rounded-lg border p-4 mt-4">
            <p className="text-gray-600">{recipe.description}</p>
          </div>
        )}
        
        {/* Nutrition */}
        {recipe.nutrition && (
          <NutritionBadge nutrition={recipe.nutrition} servings={recipe.servings} />
        )}
        
        {/* Ingredients */}
        <div className="bg-white rounded-lg border p-4 mt-4">
          <h2 className="font-semibold mb-4">Ingredients</h2>
          <IngredientList
            ingredients={recipe.ingredients}
            servings={recipe.servings}
          />
        </div>
        
        {/* Instructions */}
        <div className="bg-white rounded-lg border p-4 mt-4">
          <h2 className="font-semibold mb-4">Instructions</h2>
          <InstructionSteps instructions={recipe.instructions} />
        </div>
        
        {/* Start Cooking Button */}
        <Link
          href={`/recipes/${recipe.id}/cook`}
          className="fixed bottom-20 left-4 right-4 max-w-2xl mx-auto flex items-center justify-center gap-2 py-4 bg-indigo-600 text-white rounded-xl font-medium shadow-lg"
        >
          <ChefHat className="h-5 w-5" />
          Start Cooking
        </Link>
      </div>
    </div>
  );
}
```

### Cooking Mode

```tsx
// app/(app)/recipes/[id]/cook/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useKeepAwake } from '@/hooks/use-keep-awake';
import { StepViewer } from '@/components/cooking/step-viewer';
import { IngredientChecklist } from '@/components/cooking/ingredient-checklist';
import { Timer } from '@/components/cooking/timer';
import { X, List, Clock } from 'lucide-react';

export default function CookingModePage() {
  const { id } = useParams();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [showIngredients, setShowIngredients] = useState(false);
  const [activeTimer, setActiveTimer] = useState<{ minutes: number; label: string } | null>(null);
  
  // Keep screen awake while cooking
  useKeepAwake();
  
  const { data: recipe } = useQuery({
    queryKey: ['recipe', id],
    queryFn: async () => {
      const res = await fetch(`/api/recipes/${id}`);
      return res.json();
    },
  });
  
  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        nextStep();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prevStep();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentStep]);
  
  const nextStep = () => {
    if (recipe && currentStep < recipe.instructions.length - 1) {
      setCurrentStep(currentStep + 1);
      
      // Auto-start timer if step has one
      const step = recipe.instructions[currentStep + 1];
      if (step.timerMinutes) {
        setActiveTimer({ minutes: step.timerMinutes, label: step.timerLabel || `Step ${step.step}` });
      }
    }
  };
  
  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  if (!recipe) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-white border-t-transparent rounded-full" />
      </div>
    );
  }
  
  const instruction = recipe.instructions[currentStep];
  
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-20 bg-black/80 backdrop-blur-sm">
        <div className="flex items-center justify-between p-4">
          <button onClick={() => router.back()} className="p-2">
            <X className="h-6 w-6" />
          </button>
          <span className="font-medium">{recipe.title}</span>
          <button
            onClick={() => setShowIngredients(true)}
            className="p-2"
          >
            <List className="h-6 w-6" />
          </button>
        </div>
        
        {/* Progress bar */}
        <div className="h-1 bg-gray-800">
          <div
            className="h-full bg-indigo-600 transition-all"
            style={{ width: `${((currentStep + 1) / recipe.instructions.length) * 100}%` }}
          />
        </div>
      </div>
      
      {/* Step Content */}
      <div className="pt-20 pb-32 px-6">
        <StepViewer
          step={instruction}
          stepNumber={currentStep + 1}
          totalSteps={recipe.instructions.length}
        />
      </div>
      
      {/* Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-black/80 backdrop-blur-sm p-4">
        <div className="flex gap-4">
          <button
            onClick={prevStep}
            disabled={currentStep === 0}
            className="flex-1 py-4 bg-gray-800 rounded-xl font-medium disabled:opacity-30"
          >
            Previous
          </button>
          
          {instruction.timerMinutes && (
            <button
              onClick={() => setActiveTimer({
                minutes: instruction.timerMinutes!,
                label: instruction.timerLabel || `Step ${instruction.step}`,
              })}
              className="px-6 py-4 bg-orange-600 rounded-xl"
            >
              <Clock className="h-5 w-5" />
            </button>
          )}
          
          <button
            onClick={nextStep}
            disabled={currentStep === recipe.instructions.length - 1}
            className="flex-1 py-4 bg-indigo-600 rounded-xl font-medium disabled:opacity-30"
          >
            {currentStep === recipe.instructions.length - 1 ? 'Done' : 'Next'}
          </button>
        </div>
      </div>
      
      {/* Timer Modal */}
      {activeTimer && (
        <Timer
          minutes={activeTimer.minutes}
          label={activeTimer.label}
          onClose={() => setActiveTimer(null)}
        />
      )}
      
      {/* Ingredients Drawer */}
      {showIngredients && (
        <IngredientChecklist
          ingredients={recipe.ingredients}
          onClose={() => setShowIngredients(false)}
        />
      )}
    </div>
  );
}
```

### Timer Component

```tsx
// components/cooking/timer.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { X, Pause, Play, RotateCcw } from 'lucide-react';

interface TimerProps {
  minutes: number;
  label: string;
  onClose: () => void;
}

export function Timer({ minutes, label, onClose }: TimerProps) {
  const [secondsLeft, setSecondsLeft] = useState(minutes * 60);
  const [isRunning, setIsRunning] = useState(true);
  const initialSeconds = minutes * 60;
  
  useEffect(() => {
    if (!isRunning || secondsLeft <= 0) return;
    
    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          // Timer finished
          if ('vibrate' in navigator) {
            navigator.vibrate([500, 200, 500, 200, 500]);
          }
          // Play sound
          new Audio('/sounds/timer-done.mp3').play();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, [isRunning, secondsLeft]);
  
  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);
  
  const progress = ((initialSeconds - secondsLeft) / initialSeconds) * 100;
  
  const reset = () => {
    setSecondsLeft(initialSeconds);
    setIsRunning(true);
  };
  
  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center">
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 text-white/60"
      >
        <X className="h-6 w-6" />
      </button>
      
      {/* Label */}
      <p className="text-white/60 mb-4">{label}</p>
      
      {/* Timer Circle */}
      <div className="relative w-64 h-64">
        <svg className="w-full h-full -rotate-90">
          <circle
            cx="128"
            cy="128"
            r="120"
            fill="none"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="8"
          />
          <circle
            cx="128"
            cy="128"
            r="120"
            fill="none"
            stroke={secondsLeft === 0 ? '#ef4444' : '#6366f1'}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={754}
            strokeDashoffset={754 * (1 - progress / 100)}
            className="transition-all duration-1000"
          />
        </svg>
        
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`text-6xl font-mono font-bold ${
            secondsLeft === 0 ? 'text-red-500 animate-pulse' : 'text-white'
          }`}>
            {formatTime(secondsLeft)}
          </span>
        </div>
      </div>
      
      {/* Controls */}
      <div className="flex gap-4 mt-8">
        <button
          onClick={reset}
          className="p-4 bg-white/10 rounded-full"
        >
          <RotateCcw className="h-6 w-6" />
        </button>
        
        <button
          onClick={() => setIsRunning(!isRunning)}
          className="p-4 bg-indigo-600 rounded-full"
        >
          {isRunning ? (
            <Pause className="h-6 w-6" />
          ) : (
            <Play className="h-6 w-6 ml-0.5" />
          )}
        </button>
      </div>
      
      {secondsLeft === 0 && (
        <p className="mt-8 text-xl font-medium text-red-400 animate-pulse">
          Timer Complete!
        </p>
      )}
    </div>
  );
}
```

### Meal Plan Week View

```tsx
// components/meal-plan/week-view.tsx
'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format, startOfWeek, addDays, addWeeks, subWeeks } from 'date-fns';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { DayCard } from './day-card';
import { MealSlot } from './meal-slot';

export function WeekView() {
  const queryClient = useQueryClient();
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()));
  
  const { data: mealPlan, isLoading } = useQuery({
    queryKey: ['meal-plan', format(weekStart, 'yyyy-MM-dd')],
    queryFn: async () => {
      const res = await fetch(`/api/meal-plan?week=${format(weekStart, 'yyyy-MM-dd')}`);
      return res.json();
    },
  });
  
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  
  const getMealsForDay = (date: Date) => {
    if (!mealPlan?.items) return [];
    return mealPlan.items.filter(
      (item: any) => format(new Date(item.date), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
    );
  };
  
  return (
    <div className="space-y-4">
      {/* Week Navigation */}
      <div className="flex items-center justify-between bg-white rounded-lg border p-4">
        <button
          onClick={() => setWeekStart(subWeeks(weekStart, 1))}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        
        <div className="text-center">
          <p className="font-semibold">
            {format(weekStart, 'MMM d')} - {format(addDays(weekStart, 6), 'MMM d, yyyy')}
          </p>
          <button
            onClick={() => setWeekStart(startOfWeek(new Date()))}
            className="text-sm text-indigo-600"
          >
            Today
          </button>
        </div>
        
        <button
          onClick={() => setWeekStart(addWeeks(weekStart, 1))}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
      
      {/* Days */}
      <div className="space-y-4">
        {days.map((day) => {
          const meals = getMealsForDay(day);
          const isToday = format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
          
          return (
            <DayCard
              key={day.toISOString()}
              date={day}
              meals={meals}
              isToday={isToday}
              mealPlanId={mealPlan?.id}
            />
          );
        })}
      </div>
    </div>
  );
}
```

### Shopping List

```tsx
// components/shopping/shopping-list.tsx
'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Check, Plus, Trash2 } from 'lucide-react';
import { AisleGroup } from './aisle-group';

interface ShoppingListProps {
  list: {
    id: string;
    name: string;
    items: Array<{
      id: string;
      name: string;
      amount: number | null;
      unit: string | null;
      aisle: string | null;
      isChecked: boolean;
      recipeName: string | null;
    }>;
  };
}

export function ShoppingList({ list }: ShoppingListProps) {
  const queryClient = useQueryClient();
  const [newItemName, setNewItemName] = useState('');
  
  // Group items by aisle
  const groupedItems = list.items.reduce<Record<string, typeof list.items>>((acc, item) => {
    const aisle = item.aisle || 'Other';
    if (!acc[aisle]) acc[aisle] = [];
    acc[aisle].push(item);
    return acc;
  }, {});
  
  // Sort aisles
  const sortedAisles = Object.keys(groupedItems).sort((a, b) => {
    if (a === 'Other') return 1;
    if (b === 'Other') return -1;
    return a.localeCompare(b);
  });
  
  const toggleItem = useMutation({
    mutationFn: async ({ itemId, isChecked }: { itemId: string; isChecked: boolean }) => {
      const res = await fetch(`/api/shopping-lists/${list.id}/items/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isChecked }),
      });
      return res.json();
    },
    onMutate: async ({ itemId, isChecked }) => {
      // Optimistic update
      queryClient.setQueryData(['shopping-list', list.id], (old: any) => ({
        ...old,
        items: old.items.map((item: any) =>
          item.id === itemId ? { ...item, isChecked } : item
        ),
      }));
    },
  });
  
  const addItem = useMutation({
    mutationFn: async (name: string) => {
      const res = await fetch(`/api/shopping-lists/${list.id}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shopping-list', list.id] });
      setNewItemName('');
    },
  });
  
  const checkedCount = list.items.filter((i) => i.isChecked).length;
  const progress = list.items.length > 0 ? (checkedCount / list.items.length) * 100 : 0;
  
  return (
    <div className="space-y-4">
      {/* Progress */}
      <div className="bg-white rounded-lg border p-4">
        <div className="flex justify-between mb-2">
          <span className="text-sm text-gray-500">Progress</span>
          <span className="text-sm font-medium">{checkedCount}/{list.items.length}</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-green-500 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
      
      {/* Add Item */}
      <div className="bg-white rounded-lg border p-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (newItemName.trim()) {
              addItem.mutate(newItemName.trim());
            }
          }}
          className="flex gap-2"
        >
          <input
            type="text"
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            placeholder="Add item..."
            className="flex-1 border rounded-lg px-3 py-2"
          />
          <button
            type="submit"
            disabled={!newItemName.trim() || addItem.isPending}
            className="p-2 bg-indigo-600 text-white rounded-lg disabled:opacity-50"
          >
            <Plus className="h-5 w-5" />
          </button>
        </form>
      </div>
      
      {/* Items by Aisle */}
      {sortedAisles.map((aisle) => (
        <AisleGroup
          key={aisle}
          aisle={aisle}
          items={groupedItems[aisle]}
          onToggle={(itemId, isChecked) => toggleItem.mutate({ itemId, isChecked })}
        />
      ))}
    </div>
  );
}
```

### Recipe Form

```tsx
// components/recipes/recipe-form.tsx
'use client';

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, GripVertical, Upload } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

const recipeSchema = z.object({
  title: z.string().min(1, 'Title required'),
  description: z.string().optional(),
  prepTime: z.coerce.number().optional(),
  cookTime: z.coerce.number().optional(),
  servings: z.coerce.number().min(1).default(4),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']),
  cuisine: z.string().optional(),
  course: z.string().optional(),
  ingredients: z.array(z.object({
    name: z.string().min(1),
    amount: z.coerce.number().optional(),
    unit: z.string().optional(),
    preparation: z.string().optional(),
  })),
  instructions: z.array(z.object({
    content: z.string().min(1),
    timerMinutes: z.coerce.number().optional(),
  })),
  isVegetarian: z.boolean().default(false),
  isVegan: z.boolean().default(false),
  isGlutenFree: z.boolean().default(false),
  isPublic: z.boolean().default(false),
});

type RecipeFormData = z.infer<typeof recipeSchema>;

interface RecipeFormProps {
  recipe?: any;
}

export function RecipeForm({ recipe }: RecipeFormProps) {
  const router = useRouter();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(recipe?.imageUrl || null);
  
  const form = useForm<RecipeFormData>({
    resolver: zodResolver(recipeSchema),
    defaultValues: recipe ? {
      ...recipe,
      ingredients: recipe.ingredients || [{ name: '', amount: null, unit: '', preparation: '' }],
      instructions: recipe.instructions?.map((i: any) => ({ content: i.content, timerMinutes: i.timerMinutes })) || [{ content: '' }],
    } : {
      title: '',
      servings: 4,
      difficulty: 'MEDIUM',
      ingredients: [{ name: '', amount: null, unit: '', preparation: '' }],
      instructions: [{ content: '' }],
      isVegetarian: false,
      isVegan: false,
      isGlutenFree: false,
      isPublic: false,
    },
  });
  
  const { fields: ingredientFields, append: appendIngredient, remove: removeIngredient, move: moveIngredient } = useFieldArray({
    control: form.control,
    name: 'ingredients',
  });
  
  const { fields: instructionFields, append: appendInstruction, remove: removeInstruction, move: moveInstruction } = useFieldArray({
    control: form.control,
    name: 'instructions',
  });
  
  const mutation = useMutation({
    mutationFn: async (data: RecipeFormData) => {
      // Upload image first if new
      let imageUrl = recipe?.imageUrl;
      if (imageFile) {
        const formData = new FormData();
        formData.append('file', imageFile);
        const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData });
        const { url } = await uploadRes.json();
        imageUrl = url;
      }
      
      const url = recipe ? `/api/recipes/${recipe.id}` : '/api/recipes';
      const method = recipe ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, imageUrl }),
      });
      
      if (!response.ok) throw new Error('Failed to save');
      return response.json();
    },
    onSuccess: (data) => {
      router.push(`/recipes/${data.id}`);
    },
  });
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };
  
  return (
    <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))} className="space-y-6">
      {/* Image Upload */}
      <div>
        <label className="block text-sm font-medium mb-2">Photo</label>
        <div className="relative">
          {imagePreview ? (
            <div className="relative h-48 rounded-lg overflow-hidden">
              <img src={imagePreview} alt="" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => { setImageFile(null); setImagePreview(null); }}
                className="absolute top-2 right-2 p-2 bg-black/50 rounded-full text-white"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center h-48 border-2 border-dashed rounded-lg cursor-pointer hover:border-indigo-600">
              <Upload className="h-8 w-8 text-gray-400 mb-2" />
              <span className="text-sm text-gray-500">Upload photo</span>
              <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
            </label>
          )}
        </div>
      </div>
      
      {/* Title */}
      <div>
        <label className="block text-sm font-medium mb-1">Recipe Title</label>
        <input
          {...form.register('title')}
          placeholder="e.g., Grandma's Apple Pie"
          className="w-full border rounded-lg px-3 py-2"
        />
      </div>
      
      {/* Description */}
      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <textarea
          {...form.register('description')}
          rows={3}
          placeholder="Brief description of your recipe..."
          className="w-full border rounded-lg px-3 py-2"
        />
      </div>
      
      {/* Time & Servings */}
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Prep Time (min)</label>
          <input type="number" {...form.register('prepTime')} className="w-full border rounded-lg px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Cook Time (min)</label>
          <input type="number" {...form.register('cookTime')} className="w-full border rounded-lg px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Servings</label>
          <input type="number" {...form.register('servings')} className="w-full border rounded-lg px-3 py-2" />
        </div>
      </div>
      
      {/* Ingredients */}
      <div>
        <label className="block text-sm font-medium mb-2">Ingredients</label>
        <DragDropContext onDragEnd={(result) => {
          if (result.destination) {
            moveIngredient(result.source.index, result.destination.index);
          }
        }}>
          <Droppable droppableId="ingredients">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                {ingredientFields.map((field, index) => (
                  <Draggable key={field.id} draggableId={field.id} index={index}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className="flex gap-2 items-start"
                      >
                        <div {...provided.dragHandleProps} className="p-2 text-gray-400">
                          <GripVertical className="h-4 w-4" />
                        </div>
                        <input
                          {...form.register(`ingredients.${index}.amount`)}
                          type="number"
                          step="0.01"
                          placeholder="Amt"
                          className="w-16 border rounded-lg px-2 py-2 text-sm"
                        />
                        <input
                          {...form.register(`ingredients.${index}.unit`)}
                          placeholder="Unit"
                          className="w-16 border rounded-lg px-2 py-2 text-sm"
                        />
                        <input
                          {...form.register(`ingredients.${index}.name`)}
                          placeholder="Ingredient name"
                          className="flex-1 border rounded-lg px-3 py-2 text-sm"
                        />
                        <button
                          type="button"
                          onClick={() => removeIngredient(index)}
                          className="p-2 text-gray-400 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
        <button
          type="button"
          onClick={() => appendIngredient({ name: '', amount: undefined, unit: '', preparation: '' })}
          className="mt-2 flex items-center gap-1 text-sm text-indigo-600"
        >
          <Plus className="h-4 w-4" /> Add ingredient
        </button>
      </div>
      
      {/* Instructions */}
      <div>
        <label className="block text-sm font-medium mb-2">Instructions</label>
        <div className="space-y-3">
          {instructionFields.map((field, index) => (
            <div key={field.id} className="flex gap-2">
              <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-indigo-100 text-indigo-600 rounded-full text-sm font-medium">
                {index + 1}
              </span>
              <div className="flex-1 space-y-2">
                <textarea
                  {...form.register(`instructions.${index}.content`)}
                  rows={2}
                  placeholder={`Step ${index + 1}...`}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                />
                <input
                  {...form.register(`instructions.${index}.timerMinutes`)}
                  type="number"
                  placeholder="Timer (optional, minutes)"
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <button
                type="button"
                onClick={() => removeInstruction(index)}
                className="p-2 text-gray-400 hover:text-red-600"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => appendInstruction({ content: '', timerMinutes: undefined })}
          className="mt-2 flex items-center gap-1 text-sm text-indigo-600"
        >
          <Plus className="h-4 w-4" /> Add step
        </button>
      </div>
      
      {/* Dietary Tags */}
      <div>
        <label className="block text-sm font-medium mb-2">Dietary Information</label>
        <div className="flex flex-wrap gap-3">
          <label className="flex items-center gap-2">
            <input type="checkbox" {...form.register('isVegetarian')} className="rounded" />
            <span className="text-sm">Vegetarian</span>
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" {...form.register('isVegan')} className="rounded" />
            <span className="text-sm">Vegan</span>
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" {...form.register('isGlutenFree')} className="rounded" />
            <span className="text-sm">Gluten-Free</span>
          </label>
        </div>
      </div>
      
      {/* Visibility */}
      <div className="bg-gray-50 rounded-lg p-4">
        <label className="flex items-center gap-3">
          <input type="checkbox" {...form.register('isPublic')} className="rounded" />
          <div>
            <p className="font-medium">Make this recipe public</p>
            <p className="text-sm text-gray-500">Others can discover and save your recipe</p>
          </div>
        </label>
      </div>
      
      {/* Submit */}
      <button
        type="submit"
        disabled={mutation.isPending}
        className="w-full py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50"
      >
        {mutation.isPending ? 'Saving...' : recipe ? 'Update Recipe' : 'Create Recipe'}
      </button>
    </form>
  );
}
```

## Skills Used

| Skill | Layer | Purpose |
|-------|-------|---------|
| DashboardLayout | L5 | Main app layout with navigation |
| SearchResultsPage | L5 | Recipe discovery and filtering |
| GalleryPage | L5 | Recipe collections display |
| MediaGallery | L4 | Recipe photo galleries |
| FileUploader | L4 | Recipe image uploads |
| Calendar | L4 | Meal planning week view |
| MultiStepForm | L4 | Recipe creation wizard |
| SearchPattern | L3 | Full-text recipe search |
| MutationsPattern | L3 | CRUD with optimistic updates |

## Testing

### Setup

```bash
pnpm add -D vitest @testing-library/react @testing-library/user-event @vitejs/plugin-react jsdom msw
```

```ts
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    include: ['**/*.test.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      exclude: ['node_modules/', 'tests/'],
    },
  },
});
```

### Unit Tests

```tsx
// components/cooking/timer.test.tsx
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Timer } from './timer';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('Timer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('displays initial time correctly', () => {
    render(<Timer minutes={5} label="Boil pasta" onClose={() => {}} />);
    expect(screen.getByText('05:00')).toBeInTheDocument();
  });

  it('counts down correctly', () => {
    render(<Timer minutes={1} label="Test" onClose={() => {}} />);

    act(() => {
      vi.advanceTimersByTime(30000); // 30 seconds
    });

    expect(screen.getByText('00:30')).toBeInTheDocument();
  });

  it('shows completion message when timer finishes', () => {
    render(<Timer minutes={1} label="Test" onClose={() => {}} />);

    act(() => {
      vi.advanceTimersByTime(60000); // 60 seconds
    });

    expect(screen.getByText('Timer Complete!')).toBeInTheDocument();
  });

  it('pauses and resumes timer', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<Timer minutes={5} label="Test" onClose={() => {}} />);

    const pauseButton = screen.getByRole('button', { name: /pause/i });
    await user.click(pauseButton);

    act(() => {
      vi.advanceTimersByTime(10000);
    });

    expect(screen.getByText('05:00')).toBeInTheDocument(); // Should not have changed
  });
});
```

### Integration Tests

```tsx
// tests/integration/recipe-form.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RecipeForm } from '@/components/recipes/recipe-form';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

const server = setupServer(
  http.post('/api/recipes', async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({ id: 'recipe-123', ...body });
  }),
  http.post('/api/upload', () => {
    return HttpResponse.json({ url: 'https://example.com/image.jpg' });
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('RecipeForm', () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  it('creates a recipe with ingredients and instructions', async () => {
    const user = userEvent.setup();

    render(
      <QueryClientProvider client={queryClient}>
        <RecipeForm />
      </QueryClientProvider>
    );

    await user.type(screen.getByLabelText(/recipe title/i), 'Chocolate Chip Cookies');
    await user.type(screen.getByLabelText(/description/i), 'Classic homemade cookies');
    await user.type(screen.getByPlaceholderText(/ingredient name/i), 'All-purpose flour');
    await user.type(screen.getByPlaceholderText(/step 1/i), 'Preheat oven to 375°F');

    await user.click(screen.getByRole('button', { name: /create recipe/i }));

    await waitFor(() => {
      expect(screen.getByText(/saving/i)).toBeInTheDocument();
    });
  });
});
```

### E2E Tests

```ts
// tests/e2e/cooking-mode.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Cooking Mode', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/recipes/test-recipe/cook');
  });

  test('navigates through recipe steps', async ({ page }) => {
    await expect(page.getByText('Step 1')).toBeVisible();

    await page.click('button:has-text("Next")');
    await expect(page.getByText('Step 2')).toBeVisible();

    await page.click('button:has-text("Previous")');
    await expect(page.getByText('Step 1')).toBeVisible();
  });

  test('starts timer from step', async ({ page }) => {
    await page.click('button[aria-label="Start timer"]');
    await expect(page.getByText(/\d{2}:\d{2}/)).toBeVisible();
  });

  test('shows ingredient checklist', async ({ page }) => {
    await page.click('button[aria-label="Show ingredients"]');
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByText('All-purpose flour')).toBeVisible();
  });
});
```

## Error Handling

### Error Boundary

```tsx
// components/error-boundary.tsx
'use client';

import { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

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
    console.error('Recipe app error:', error, errorInfo);
    // Send to error tracking service
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
            <p className="text-gray-600 mb-4">
              We couldn't load your recipes. Please try again.
            </p>
            <button
              onClick={() => this.setState({ hasError: false })}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg"
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

### API Error Handling

```ts
// lib/api-errors.ts
export class RecipeAPIError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code: string
  ) {
    super(message);
    this.name = 'RecipeAPIError';
  }
}

export function handleRecipeError(error: unknown): Response {
  if (error instanceof RecipeAPIError) {
    return Response.json(
      { error: error.message, code: error.code },
      { status: error.statusCode }
    );
  }

  console.error('Unexpected recipe error:', error);
  return Response.json(
    { error: 'An unexpected error occurred', code: 'INTERNAL_ERROR' },
    { status: 500 }
  );
}

// Usage in API route
export async function POST(request: Request) {
  try {
    const body = await request.json();
    // ... recipe creation logic
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new RecipeAPIError('Invalid recipe data', 400, 'VALIDATION_ERROR');
    }
    throw error;
  }
}
```

## Accessibility

### WCAG 2.1 AA Compliance

| Criterion | Implementation |
|-----------|----------------|
| 1.1.1 Non-text Content | Alt text for recipe images, aria-labels for icons |
| 1.3.1 Info and Relationships | Semantic HTML for ingredient lists, proper headings |
| 1.4.3 Contrast | 4.5:1 minimum contrast for recipe text |
| 2.1.1 Keyboard | All cooking mode controls keyboard accessible |
| 2.4.7 Focus Visible | Custom focus rings for recipe cards |
| 4.1.2 Name, Role, Value | ARIA attributes for timer controls |

### Focus Management

```tsx
// hooks/use-cooking-mode-focus.ts
import { useEffect, useRef } from 'react';

export function useCookingModeFocus(currentStep: number) {
  const stepRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Announce step change to screen readers
    const announcement = document.createElement('div');
    announcement.setAttribute('role', 'status');
    announcement.setAttribute('aria-live', 'polite');
    announcement.textContent = `Now on step ${currentStep + 1}`;
    document.body.appendChild(announcement);

    // Focus the step content
    stepRef.current?.focus();

    return () => {
      document.body.removeChild(announcement);
    };
  }, [currentStep]);

  return stepRef;
}

// Timer accessibility
function Timer({ minutes, label, onClose }: TimerProps) {
  return (
    <div
      role="timer"
      aria-label={`${label} timer`}
      aria-live="polite"
      className="..."
    >
      <span aria-hidden="true">{formatTime(secondsLeft)}</span>
      <span className="sr-only">
        {Math.floor(secondsLeft / 60)} minutes and {secondsLeft % 60} seconds remaining
      </span>
    </div>
  );
}
```

## Security

### Input Validation

```ts
// lib/validations/recipe.ts
import { z } from 'zod';

export const recipeSchema = z.object({
  title: z.string()
    .min(3, 'Title must be at least 3 characters')
    .max(100, 'Title must be less than 100 characters')
    .regex(/^[\w\s\-']+$/i, 'Title contains invalid characters'),

  description: z.string()
    .max(2000, 'Description must be less than 2000 characters')
    .optional(),

  prepTime: z.coerce.number()
    .min(0, 'Prep time cannot be negative')
    .max(1440, 'Prep time cannot exceed 24 hours')
    .optional(),

  cookTime: z.coerce.number()
    .min(0, 'Cook time cannot be negative')
    .max(1440, 'Cook time cannot exceed 24 hours')
    .optional(),

  servings: z.coerce.number()
    .min(1, 'Must serve at least 1')
    .max(100, 'Cannot exceed 100 servings'),

  ingredients: z.array(z.object({
    name: z.string().min(1).max(100),
    amount: z.coerce.number().min(0).max(10000).optional(),
    unit: z.string().max(20).optional(),
  })).min(1, 'At least one ingredient required'),

  instructions: z.array(z.object({
    content: z.string().min(5).max(1000),
    timerMinutes: z.coerce.number().min(1).max(1440).optional(),
  })).min(1, 'At least one instruction required'),

  isPublic: z.boolean().default(false),
});

export type RecipeInput = z.infer<typeof recipeSchema>;
```

### Rate Limiting

```ts
// middleware.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(20, '1 m'), // 20 requests per minute
  analytics: true,
});

export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/api/recipes')) {
    const ip = request.headers.get('x-forwarded-for') ?? '127.0.0.1';
    const { success, limit, remaining } = await ratelimit.limit(ip);

    if (!success) {
      return NextResponse.json(
        { error: 'Too many recipe requests. Please slow down.' },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': limit.toString(),
            'X-RateLimit-Remaining': remaining.toString(),
          },
        }
      );
    }
  }

  return NextResponse.next();
}
```

## Performance

### Caching Strategy

```ts
// app/api/recipes/[id]/route.ts
import { NextRequest } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const recipe = await prisma.recipe.findUnique({
    where: { id },
    include: {
      ingredients: { orderBy: { order: 'asc' } },
      instructions: { orderBy: { step: 'asc' } },
      nutrition: true,
    },
  });

  if (!recipe) {
    return Response.json({ error: 'Recipe not found' }, { status: 404 });
  }

  // Cache public recipes for 5 minutes
  const headers = recipe.isPublic
    ? { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' }
    : { 'Cache-Control': 'private, no-cache' };

  return Response.json(recipe, { headers });
}
```

### Image Optimization

```tsx
// components/recipes/recipe-image.tsx
import Image from 'next/image';

interface RecipeImageProps {
  src: string;
  alt: string;
  priority?: boolean;
}

export function RecipeImage({ src, alt, priority = false }: RecipeImageProps) {
  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
      className="object-cover"
      priority={priority}
      placeholder="blur"
      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAAAAUH/8QAIhAAAgEDBAMBAAAAAAAAAAAAAQIDAAQRBQYSIRMxQWH/xAAVAQEBAAAAAAAAAAAAAAAAAAAFBv/EABkRAAMBAQEAAAAAAAAAAAAAAAECAwARIf/aAAwDAQACEQMRAD8A"
    />
  );
}
```

### Service Worker for Offline Cooking

```ts
// public/sw.js
const CACHE_NAME = 'recipe-app-v1';
const RECIPE_CACHE = 'recipes-v1';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        '/',
        '/offline',
        '/sounds/timer-done.mp3',
      ]);
    })
  );
});

// Cache recipes when viewed for offline cooking
self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('/api/recipes/') && event.request.method === 'GET') {
    event.respondWith(
      caches.open(RECIPE_CACHE).then(async (cache) => {
        try {
          const response = await fetch(event.request);
          cache.put(event.request, response.clone());
          return response;
        } catch {
          return cache.match(event.request);
        }
      })
    );
  }
});
```

## CI/CD

### GitHub Actions

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  lint-and-test:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test
          POSTGRES_DB: recipe_app_test
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v2
        with:
          version: 8

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Lint
        run: pnpm lint

      - name: Type check
        run: pnpm type-check

      - name: Setup database
        run: pnpm prisma migrate deploy
        env:
          DATABASE_URL: postgresql://test:test@localhost:5432/recipe_app_test

      - name: Run tests
        run: pnpm test:coverage
        env:
          DATABASE_URL: postgresql://test:test@localhost:5432/recipe_app_test

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info

  e2e:
    runs-on: ubuntu-latest
    needs: lint-and-test

    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v2
        with:
          version: 8

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Install Playwright
        run: pnpm exec playwright install --with-deps

      - name: Build
        run: pnpm build
        env:
          DATABASE_URL: ${{ secrets.TEST_DATABASE_URL }}

      - name: Run E2E tests
        run: pnpm test:e2e
        env:
          DATABASE_URL: ${{ secrets.TEST_DATABASE_URL }}
```

## Monitoring

### Sentry Integration

```ts
// sentry.client.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,

  integrations: [
    Sentry.replayIntegration({
      maskAllText: false,
      blockAllMedia: false,
    }),
  ],

  beforeSend(event) {
    // Filter out cooking timer errors that aren't critical
    if (event.exception?.values?.[0]?.value?.includes('Timer interrupted')) {
      return null;
    }
    return event;
  },
});
```

### Health Check Endpoint

```ts
// app/api/health/route.ts
import { prisma } from '@/lib/prisma';

export async function GET() {
  const checks = {
    database: false,
    timestamp: new Date().toISOString(),
  };

  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.database = true;
  } catch (error) {
    console.error('Database health check failed:', error);
  }

  const healthy = Object.values(checks).every((v) => v === true || typeof v === 'string');

  return Response.json(checks, {
    status: healthy ? 200 : 503,
  });
}
```

## Environment Variables

```bash
# .env.example

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/recipe_app"

# Authentication
NEXTAUTH_SECRET="your-nextauth-secret-here"
NEXTAUTH_URL="http://localhost:3000"

# File Upload (UploadThing)
UPLOADTHING_SECRET="your-uploadthing-secret"
UPLOADTHING_APP_ID="your-uploadthing-app-id"

# Monitoring
NEXT_PUBLIC_SENTRY_DSN="https://your-sentry-dsn"
SENTRY_AUTH_TOKEN="your-sentry-auth-token"

# Rate Limiting (Upstash Redis)
UPSTASH_REDIS_REST_URL="https://your-redis-url"
UPSTASH_REDIS_REST_TOKEN="your-redis-token"

# Analytics (optional)
NEXT_PUBLIC_POSTHOG_KEY="your-posthog-key"
NEXT_PUBLIC_POSTHOG_HOST="https://app.posthog.com"
```

## Deployment Checklist

- [ ] Environment variables configured in production
- [ ] Database migrations applied (`pnpm prisma migrate deploy`)
- [ ] Image upload storage configured (UploadThing/S3)
- [ ] PWA manifest and service worker tested
- [ ] Timer audio files uploaded to CDN
- [ ] Rate limiting Redis configured
- [ ] Sentry project created and DSN set
- [ ] Health check endpoint responding
- [ ] SSL certificate valid
- [ ] CDN configured for static assets
- [ ] Database backups scheduled
- [ ] Error alerting configured
- [ ] Performance monitoring enabled
- [ ] Mobile responsiveness tested
- [ ] Offline cooking mode verified

## Related Skills

- [[mobile-first]] - Mobile-first design
- [[pwa]] - Progressive Web App
- [[crud]] - CRUD operations
- [[drag-and-drop]] - Sortable lists
- [[search]] - Recipe search
- [[image-upload]] - Photo uploads

## Changelog

- 1.0.0: Initial recipe app with meal planning and shopping lists
