---
id: r-survey-builder
name: Survey Builder
version: 3.0.0
layer: L6
category: recipes
description: Form and survey builder with drag-and-drop, conditional logic, and response analytics
tags: [surveys, forms, builder, drag-drop, analytics, responses]
formula: "SurveyBuilder = DashboardLayout(t-dashboard-layout) + DashboardHome(t-dashboard-home) + OnboardingLayout(t-onboarding-layout) + AuthLayout(t-auth-layout) + SettingsPage(t-settings-page) + MarketingLayout(t-marketing-layout) + Header(o-header) + Sidebar(o-sidebar) + DataTable(o-data-table) + Chart(o-chart) + StatsDashboard(o-stats-dashboard) + Tabs(o-tabs) + Modal(o-modal) + FilterBar(o-filter-bar) + Breadcrumb(m-breadcrumb) + Pagination(m-pagination) + Card(m-card) + FormField(m-form-field) + Badge(m-badge) + SearchInput(m-search-input) + StatCard(m-stat-card) + ProgressBar(m-progress-bar) + Toast(m-toast) + NextAuth(pt-next-auth) + AuthMiddleware(pt-auth-middleware) + SessionManagement(pt-session-management) + Rbac(pt-rbac) + RateLimiting(pt-rate-limiting) + AuditLogging(pt-audit-logging) + GdprCompliance(pt-gdpr-compliance) + FormValidation(pt-form-validation) + ZodSchemas(pt-zod-schemas) + ServerActions(pt-server-actions) + DragAndDrop(pt-drag-and-drop) + ConditionalLogic(pt-conditional-logic) + TransactionalEmail(pt-transactional-email) + ErrorBoundaries(pt-error-boundaries) + ErrorTracking(pt-error-tracking) + SkeletonLoading(pt-skeleton-loading) + Analytics(pt-analytics) + AnalyticsEvents(pt-analytics-events) + UserAnalytics(pt-user-analytics) + Filtering(pt-filtering) + Pagination(pt-pagination) + Sorting(pt-sorting) + ReactQuery(pt-react-query) + Zustand(pt-zustand) + OptimisticUpdates(pt-optimistic-updates) + ExportData(pt-export-data) + Sharing(pt-sharing) + EmbedWidget(pt-embed-widget) + ThemeCustomization(pt-theme-customization) + UrlShortening(pt-url-shortening) + ResponseValidation(pt-response-validation) + TestingE2e(pt-testing-e2e) + TestingUnit(pt-testing-unit) + Sitemap(pt-sitemap) + StructuredData(pt-structured-data) + MetadataApi(pt-metadata-api) + Csp(pt-csp) + InputSanitization(pt-input-sanitization)"
composes:
  # L4 Templates
  - ../templates/dashboard-layout.md
  - ../templates/dashboard-home.md
  - ../templates/onboarding-layout.md
  - ../templates/auth-layout.md
  - ../templates/settings-page.md
  - ../templates/marketing-layout.md
  # L3 Organisms
  - ../organisms/header.md
  - ../organisms/sidebar.md
  - ../organisms/data-table.md
  - ../organisms/chart.md
  - ../organisms/stats-dashboard.md
  - ../organisms/tabs.md
  - ../organisms/modal.md
  - ../organisms/filter-bar.md
  # L2 Molecules
  - ../molecules/breadcrumb.md
  - ../molecules/pagination.md
  - ../molecules/card.md
  - ../molecules/form-field.md
  - ../molecules/badge.md
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
  - ../patterns/gdpr-compliance.md
  # L5 Patterns - Forms & Validation
  - ../patterns/form-validation.md
  - ../patterns/zod-schemas.md
  - ../patterns/server-actions.md
  # L5 Patterns - Survey Builder Specific
  - ../patterns/drag-and-drop.md
  - ../patterns/conditional-logic.md
  # L5 Patterns - Communication
  - ../patterns/transactional-email.md
  # L5 Patterns - Error Handling
  - ../patterns/error-boundaries.md
  - ../patterns/error-tracking.md
  - ../patterns/skeleton-loading.md
  # L5 Patterns - Analytics
  - ../patterns/analytics.md
  - ../patterns/analytics-events.md
  - ../patterns/user-analytics.md
  # L5 Patterns - Data Management
  - ../patterns/filtering.md
  - ../patterns/pagination.md
  - ../patterns/sorting.md
  # L5 Patterns - State Management
  - ../patterns/react-query.md
  - ../patterns/zustand.md
  - ../patterns/optimistic-updates.md
  # L5 Patterns - Distribution & Sharing
  - ../patterns/export-data.md
  - ../patterns/sharing.md
  - ../patterns/embed-widget.md
  - ../patterns/theme-customization.md
  - ../patterns/url-shortening.md
  - ../patterns/response-validation.md
  # L5 Patterns - Testing
  - ../patterns/testing-e2e.md
  - ../patterns/testing-unit.md
  # L5 Patterns - SEO
  - ../patterns/sitemap.md
  - ../patterns/structured-data.md
  - ../patterns/metadata-api.md
  # L5 Patterns - Security (Additional)
  - ../patterns/csp.md
  - ../patterns/input-sanitization.md
dependencies:
  - next@15.0.0
  - react@19.0.0
  - typescript@5.6.0
  - tailwindcss@4.0.0
  - prisma@6.0.0
  - "@tanstack/react-query"
  - "@dnd-kit/core"
  - "@dnd-kit/sortable"
  - react-hook-form
  - zod
  - "@radix-ui/react-dialog"
  - "@radix-ui/react-tabs"
  - recharts
  - lucide-react
skills:
  - drag-and-drop
  - form-validation
  - conditional-logic
  - analytics
  - export-data
performance:
  impact: high
  lcp: medium
  cls: low
accessibility:
  wcag: AA
  keyboard: true
  screen-reader: true
---

# Survey Builder

## Overview

A complete survey and form builder featuring:
- Drag-and-drop form builder
- Multiple question types (text, choice, rating, etc.)
- Conditional logic and branching
- Response collection and analytics
- Survey sharing and embedding
- Real-time response tracking
- Export responses to CSV/Excel
- Survey templates

## Project Structure

```
survey-builder/
├── app/
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   ├── page.tsx                    # Dashboard
│   │   ├── surveys/
│   │   │   ├── page.tsx                # Survey list
│   │   │   ├── new/page.tsx            # Create survey
│   │   │   └── [surveyId]/
│   │   │       ├── page.tsx            # Edit survey
│   │   │       ├── responses/page.tsx  # View responses
│   │   │       └── analytics/page.tsx
│   │   └── templates/page.tsx
│   ├── (public)/
│   │   └── s/[surveyId]/
│   │       ├── page.tsx                # Take survey
│   │       └── thank-you/page.tsx
│   ├── api/
│   │   ├── surveys/
│   │   │   ├── route.ts
│   │   │   └── [surveyId]/
│   │   │       ├── route.ts
│   │   │       ├── publish/route.ts
│   │   │       ├── responses/route.ts
│   │   │       └── export/route.ts
│   │   └── responses/route.ts
│   └── layout.tsx
├── components/
│   ├── builder/
│   │   ├── survey-builder.tsx
│   │   ├── question-palette.tsx
│   │   ├── question-editor.tsx
│   │   └── logic-editor.tsx
│   ├── survey/
│   │   ├── survey-renderer.tsx
│   │   ├── question-types/
│   │   │   ├── text-question.tsx
│   │   │   ├── choice-question.tsx
│   │   │   ├── rating-question.tsx
│   │   │   └── matrix-question.tsx
│   │   └── progress-bar.tsx
│   ├── responses/
│   │   ├── response-table.tsx
│   │   └── response-charts.tsx
│   └── ui/
├── lib/
│   ├── survey-logic.ts
│   └── utils.ts
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
  id        String   @id @default(cuid())
  email     String   @unique
  name      String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  surveys   Survey[]
}

model Survey {
  id           String       @id @default(cuid())
  title        String
  description  String?
  
  // Settings
  status       SurveyStatus @default(DRAFT)
  isAnonymous  Boolean      @default(true)
  allowMultiple Boolean     @default(false)
  requireAuth  Boolean      @default(false)
  
  // Limits
  maxResponses Int?
  startsAt     DateTime?
  endsAt       DateTime?
  
  // Appearance
  theme        Json?        // Colors, fonts, logo
  
  // Questions
  questions    Question[]
  
  // Responses
  responses    Response[]
  
  // Owner
  userId       String
  user         User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  // Stats
  responseCount Int         @default(0)
  
  publishedAt  DateTime?
  createdAt    DateTime     @default(now())
  updatedAt    DateTime     @updatedAt

  @@index([userId])
  @@index([status])
}

enum SurveyStatus {
  DRAFT
  PUBLISHED
  CLOSED
  ARCHIVED
}

model Question {
  id           String       @id @default(cuid())
  surveyId     String
  survey       Survey       @relation(fields: [surveyId], references: [id], onDelete: Cascade)
  
  type         QuestionType
  title        String
  description  String?
  
  // Position
  position     Int
  pageNumber   Int          @default(1)
  
  // Settings
  isRequired   Boolean      @default(false)
  
  // Type-specific config
  config       Json         // Options, validation rules, etc.
  
  // Conditional logic
  logic        Json?        // Show/hide conditions
  
  // Answers
  answers      Answer[]
  
  createdAt    DateTime     @default(now())
  updatedAt    DateTime     @updatedAt

  @@index([surveyId])
  @@index([position])
}

enum QuestionType {
  SHORT_TEXT
  LONG_TEXT
  EMAIL
  NUMBER
  PHONE
  DATE
  TIME
  
  SINGLE_CHOICE
  MULTIPLE_CHOICE
  DROPDOWN
  
  RATING
  SCALE
  NPS
  
  MATRIX
  RANKING
  
  FILE_UPLOAD
  SIGNATURE
  
  SECTION_HEADER
  STATEMENT
}

model Response {
  id          String         @id @default(cuid())
  surveyId    String
  survey      Survey         @relation(fields: [surveyId], references: [id], onDelete: Cascade)
  
  // Respondent
  respondentId String?       // For authenticated responses
  email        String?
  
  // Answers
  answers      Answer[]
  
  // Metadata
  ipAddress    String?
  userAgent    String?
  
  // Progress
  isComplete   Boolean       @default(false)
  completedAt  DateTime?
  
  // Time tracking
  startedAt    DateTime      @default(now())
  duration     Int?          // Seconds to complete
  
  createdAt    DateTime      @default(now())
  updatedAt    DateTime      @updatedAt

  @@index([surveyId])
  @@index([isComplete])
}

model Answer {
  id          String    @id @default(cuid())
  responseId  String
  response    Response  @relation(fields: [responseId], references: [id], onDelete: Cascade)
  questionId  String
  question    Question  @relation(fields: [questionId], references: [id], onDelete: Cascade)
  
  // Answer value (JSON for flexibility)
  value       Json
  
  createdAt   DateTime  @default(now())

  @@unique([responseId, questionId])
  @@index([responseId])
  @@index([questionId])
}

model SurveyTemplate {
  id          String   @id @default(cuid())
  name        String
  description String?
  category    String
  thumbnail   String?
  config      Json     // Survey structure
  isPublic    Boolean  @default(true)
  usageCount  Int      @default(0)
  createdAt   DateTime @default(now())
}
```

## Implementation

### Survey Builder

```tsx
// components/builder/survey-builder.tsx
'use client';

import { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Save, Eye, Settings, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { QuestionPalette } from './question-palette';
import { QuestionEditor } from './question-editor';
import { SortableQuestion } from './sortable-question';

interface Question {
  id: string;
  type: string;
  title: string;
  description?: string;
  isRequired: boolean;
  config: any;
  logic?: any;
}

interface SurveyBuilderProps {
  surveyId: string;
  initialData: {
    title: string;
    description?: string;
    questions: Question[];
  };
}

export function SurveyBuilder({ surveyId, initialData }: SurveyBuilderProps) {
  const [title, setTitle] = useState(initialData.title);
  const [description, setDescription] = useState(initialData.description || '');
  const [questions, setQuestions] = useState<Question[]>(initialData.questions);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const saveSurvey = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/surveys/${surveyId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, questions }),
      });
      if (!response.ok) throw new Error('Failed to save');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['survey', surveyId] });
    },
  });

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (over && active.id !== over.id) {
      setQuestions((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const addQuestion = (type: string) => {
    const newQuestion: Question = {
      id: `q_${Date.now()}`,
      type,
      title: getDefaultTitle(type),
      isRequired: false,
      config: getDefaultConfig(type),
    };
    setQuestions([...questions, newQuestion]);
    setSelectedQuestion(newQuestion);
  };

  const updateQuestion = (id: string, updates: Partial<Question>) => {
    setQuestions(questions.map((q) =>
      q.id === id ? { ...q, ...updates } : q
    ));
    if (selectedQuestion?.id === id) {
      setSelectedQuestion({ ...selectedQuestion, ...updates });
    }
  };

  const deleteQuestion = (id: string) => {
    setQuestions(questions.filter((q) => q.id !== id));
    if (selectedQuestion?.id === id) {
      setSelectedQuestion(null);
    }
  };

  const duplicateQuestion = (id: string) => {
    const question = questions.find((q) => q.id === id);
    if (question) {
      const newQuestion = {
        ...question,
        id: `q_${Date.now()}`,
        title: `${question.title} (copy)`,
      };
      const index = questions.findIndex((q) => q.id === id);
      const newQuestions = [...questions];
      newQuestions.splice(index + 1, 0, newQuestion);
      setQuestions(newQuestions);
    }
  };

  const activeQuestion = activeId ? questions.find((q) => q.id === activeId) : null;

  return (
    <div className="h-full flex">
      {/* Question Palette */}
      <div className="w-64 border-r bg-gray-50 dark:bg-gray-900 p-4">
        <QuestionPalette onAdd={addQuestion} />
      </div>

      {/* Builder Canvas */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex-1 mr-4">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Survey Title"
              className="text-xl font-bold border-none focus:ring-0 p-0"
            />
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
            <Button
              size="sm"
              onClick={() => saveSurvey.mutate()}
              disabled={saveSurvey.isPending}
            >
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-2xl mx-auto">
            {/* Description */}
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Survey description (optional)"
              className="mb-6 resize-none"
              rows={2}
            />

            {/* Questions */}
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={questions.map((q) => q.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-4">
                  {questions.map((question, index) => (
                    <SortableQuestion
                      key={question.id}
                      question={question}
                      index={index}
                      isSelected={selectedQuestion?.id === question.id}
                      onSelect={() => setSelectedQuestion(question)}
                      onUpdate={(updates) => updateQuestion(question.id, updates)}
                      onDelete={() => deleteQuestion(question.id)}
                      onDuplicate={() => duplicateQuestion(question.id)}
                    />
                  ))}
                </div>
              </SortableContext>

              <DragOverlay>
                {activeQuestion && (
                  <div className="bg-white dark:bg-gray-800 rounded-lg border-2 border-blue-500 p-4 shadow-lg opacity-80">
                    <p className="font-medium">{activeQuestion.title}</p>
                  </div>
                )}
              </DragOverlay>
            </DndContext>

            {/* Add Question */}
            {questions.length === 0 && (
              <div className="text-center py-12 bg-gray-50 dark:bg-gray-900 rounded-xl border-2 border-dashed">
                <p className="text-gray-500 mb-4">
                  Drag questions from the left panel or click to add
                </p>
                <Button variant="outline" onClick={() => addQuestion('SHORT_TEXT')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Question
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Question Editor Panel */}
      {selectedQuestion && (
        <div className="w-80 border-l bg-white dark:bg-gray-900 overflow-y-auto">
          <QuestionEditor
            question={selectedQuestion}
            onUpdate={(updates) => updateQuestion(selectedQuestion.id, updates)}
            onClose={() => setSelectedQuestion(null)}
          />
        </div>
      )}
    </div>
  );
}

function getDefaultTitle(type: string): string {
  const titles: Record<string, string> = {
    SHORT_TEXT: 'Short answer question',
    LONG_TEXT: 'Long answer question',
    SINGLE_CHOICE: 'Multiple choice question',
    MULTIPLE_CHOICE: 'Checkboxes question',
    RATING: 'Rating question',
    SCALE: 'Scale question',
    NPS: 'Net Promoter Score',
    DROPDOWN: 'Dropdown question',
    DATE: 'Date question',
    EMAIL: 'Email question',
  };
  return titles[type] || 'New question';
}

function getDefaultConfig(type: string): any {
  switch (type) {
    case 'SINGLE_CHOICE':
    case 'MULTIPLE_CHOICE':
    case 'DROPDOWN':
      return { options: ['Option 1', 'Option 2', 'Option 3'] };
    case 'RATING':
      return { max: 5, icon: 'star' };
    case 'SCALE':
      return { min: 1, max: 10, minLabel: 'Not at all', maxLabel: 'Extremely' };
    case 'NPS':
      return { min: 0, max: 10 };
    default:
      return {};
  }
}
```

### Survey Renderer

```tsx
// components/survey/survey-renderer.tsx
'use client';

import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { TextQuestion } from './question-types/text-question';
import { ChoiceQuestion } from './question-types/choice-question';
import { RatingQuestion } from './question-types/rating-question';
import { evaluateLogic } from '@/lib/survey-logic';

interface Question {
  id: string;
  type: string;
  title: string;
  description?: string;
  isRequired: boolean;
  config: any;
  logic?: any;
  pageNumber: number;
}

interface SurveyRendererProps {
  surveyId: string;
  survey: {
    title: string;
    description?: string;
    questions: Question[];
    theme?: any;
  };
}

export function SurveyRenderer({ surveyId, survey }: SurveyRendererProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [startTime] = useState(Date.now());
  const router = useRouter();

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm();
  const formValues = watch();

  // Filter visible questions based on logic
  const visibleQuestions = useMemo(() => {
    return survey.questions.filter((question) => {
      if (!question.logic) return true;
      return evaluateLogic(question.logic, formValues);
    });
  }, [survey.questions, formValues]);

  // Get pages
  const pages = useMemo(() => {
    const pageMap = new Map<number, Question[]>();
    visibleQuestions.forEach((q) => {
      const page = q.pageNumber || 1;
      if (!pageMap.has(page)) pageMap.set(page, []);
      pageMap.get(page)!.push(q);
    });
    return Array.from(pageMap.entries()).sort((a, b) => a[0] - b[0]);
  }, [visibleQuestions]);

  const totalPages = pages.length;
  const currentQuestions = pages.find(([page]) => page === currentPage)?.[1] || [];
  const progress = ((currentPage - 1) / totalPages) * 100;

  const submitResponse = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch(`/api/surveys/${surveyId}/responses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answers: Object.entries(data).map(([questionId, value]) => ({
            questionId,
            value,
          })),
          duration: Math.floor((Date.now() - startTime) / 1000),
        }),
      });
      if (!response.ok) throw new Error('Failed to submit');
      return response.json();
    },
    onSuccess: () => {
      router.push(`/s/${surveyId}/thank-you`);
    },
  });

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const onSubmit = (data: any) => {
    if (currentPage < totalPages) {
      goToNextPage();
    } else {
      submitResponse.mutate(data);
    }
  };

  const renderQuestion = (question: Question) => {
    const commonProps = {
      question,
      register,
      error: errors[question.id],
      value: formValues[question.id],
      onChange: (value: any) => setValue(question.id, value),
    };

    switch (question.type) {
      case 'SHORT_TEXT':
      case 'LONG_TEXT':
      case 'EMAIL':
      case 'NUMBER':
      case 'PHONE':
        return <TextQuestion {...commonProps} />;
      case 'SINGLE_CHOICE':
      case 'MULTIPLE_CHOICE':
      case 'DROPDOWN':
        return <ChoiceQuestion {...commonProps} />;
      case 'RATING':
      case 'SCALE':
      case 'NPS':
        return <RatingQuestion {...commonProps} />;
      default:
        return null;
    }
  };

  return (
    <div
      className="min-h-screen"
      style={{
        backgroundColor: survey.theme?.backgroundColor || '#f9fafb',
      }}
    >
      <div className="max-w-2xl mx-auto p-6">
        {/* Progress */}
        <Progress value={progress} className="mb-6" />

        {/* Header */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border p-6 mb-6">
          <h1 className="text-2xl font-bold mb-2">{survey.title}</h1>
          {survey.description && (
            <p className="text-gray-600">{survey.description}</p>
          )}
        </div>

        {/* Questions */}
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-6">
            {currentQuestions.map((question) => (
              <div
                key={question.id}
                className="bg-white dark:bg-gray-900 rounded-xl border p-6"
              >
                {renderQuestion(question)}
              </div>
            ))}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={goToPrevPage}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>

            <span className="text-sm text-gray-500">
              Page {currentPage} of {totalPages}
            </span>

            {currentPage < totalPages ? (
              <Button type="submit">
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button type="submit" disabled={submitResponse.isPending}>
                <Send className="h-4 w-4 mr-2" />
                {submitResponse.isPending ? 'Submitting...' : 'Submit'}
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
```

### Choice Question Component

```tsx
// components/survey/question-types/choice-question.tsx
'use client';

import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface ChoiceQuestionProps {
  question: {
    id: string;
    type: string;
    title: string;
    description?: string;
    isRequired: boolean;
    config: {
      options: string[];
      allowOther?: boolean;
    };
  };
  value: any;
  onChange: (value: any) => void;
  error?: any;
}

export function ChoiceQuestion({ question, value, onChange, error }: ChoiceQuestionProps) {
  const { type, title, description, isRequired, config } = question;
  const { options, allowOther } = config;

  return (
    <div>
      <div className="mb-4">
        <h3 className="font-medium">
          {title}
          {isRequired && <span className="text-red-500 ml-1">*</span>}
        </h3>
        {description && (
          <p className="text-sm text-gray-500 mt-1">{description}</p>
        )}
      </div>

      {type === 'SINGLE_CHOICE' && (
        <RadioGroup value={value} onValueChange={onChange}>
          <div className="space-y-2">
            {options.map((option: string, index: number) => (
              <div key={index} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={`${question.id}-${index}`} />
                <Label
                  htmlFor={`${question.id}-${index}`}
                  className="cursor-pointer"
                >
                  {option}
                </Label>
              </div>
            ))}
            {allowOther && (
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="__other__" id={`${question.id}-other`} />
                <Label htmlFor={`${question.id}-other`}>Other</Label>
                {value === '__other__' && (
                  <input
                    type="text"
                    className="ml-2 px-2 py-1 border rounded"
                    placeholder="Please specify"
                  />
                )}
              </div>
            )}
          </div>
        </RadioGroup>
      )}

      {type === 'MULTIPLE_CHOICE' && (
        <div className="space-y-2">
          {options.map((option: string, index: number) => {
            const isChecked = Array.isArray(value) && value.includes(option);
            return (
              <div key={index} className="flex items-center space-x-2">
                <Checkbox
                  id={`${question.id}-${index}`}
                  checked={isChecked}
                  onCheckedChange={(checked) => {
                    const current = Array.isArray(value) ? value : [];
                    if (checked) {
                      onChange([...current, option]);
                    } else {
                      onChange(current.filter((v: string) => v !== option));
                    }
                  }}
                />
                <Label
                  htmlFor={`${question.id}-${index}`}
                  className="cursor-pointer"
                >
                  {option}
                </Label>
              </div>
            );
          })}
        </div>
      )}

      {type === 'DROPDOWN' && (
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select an option" />
          </SelectTrigger>
          <SelectContent>
            {options.map((option: string, index: number) => (
              <SelectItem key={index} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {error && (
        <p className="text-sm text-red-500 mt-2">This field is required</p>
      )}
    </div>
  );
}
```

### Response Analytics

```tsx
// components/responses/response-charts.tsx
'use client';

import { useQuery } from '@tanstack/react-query';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

interface ResponseChartsProps {
  surveyId: string;
}

export function ResponseCharts({ surveyId }: ResponseChartsProps) {
  const { data, isLoading } = useQuery({
    queryKey: ['survey-analytics', surveyId],
    queryFn: async () => {
      const response = await fetch(`/api/surveys/${surveyId}/analytics`);
      if (!response.ok) throw new Error('Failed to fetch');
      return response.json();
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    );
  }

  const { summary, questionAnalytics } = data;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500">Total Responses</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{summary.totalResponses}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500">Completion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{summary.completionRate}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500">Avg. Duration</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{summary.avgDuration}s</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500">Today</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{summary.todayResponses}</p>
          </CardContent>
        </Card>
      </div>

      {/* Question Analytics */}
      {questionAnalytics.map((qa: any) => (
        <Card key={qa.questionId}>
          <CardHeader>
            <CardTitle className="text-lg">{qa.title}</CardTitle>
            <p className="text-sm text-gray-500">
              {qa.responseCount} responses
            </p>
          </CardHeader>
          <CardContent>
            {qa.type === 'SINGLE_CHOICE' || qa.type === 'MULTIPLE_CHOICE' ? (
              <div className="grid grid-cols-2 gap-8">
                {/* Bar Chart */}
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={qa.distribution} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis type="category" dataKey="option" width={100} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#3b82f6" radius={4} />
                  </BarChart>
                </ResponsiveContainer>

                {/* Pie Chart */}
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={qa.distribution}
                      dataKey="count"
                      nameKey="option"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                    >
                      {qa.distribution.map((entry: any, index: number) => (
                        <Cell key={entry.option} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : qa.type === 'RATING' || qa.type === 'NPS' ? (
              <div>
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-4xl font-bold">{qa.average.toFixed(1)}</span>
                  <span className="text-gray-500">/ {qa.max}</span>
                </div>
                <ResponsiveContainer width="100%" height={150}>
                  <BarChart data={qa.distribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="rating" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#3b82f6" radius={4} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {qa.responses.slice(0, 10).map((response: string, index: number) => (
                  <div key={index} className="p-2 bg-gray-50 dark:bg-gray-800 rounded">
                    {response}
                  </div>
                ))}
                {qa.responses.length > 10 && (
                  <p className="text-sm text-gray-500">
                    +{qa.responses.length - 10} more responses
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
```

### Survey Logic Evaluator

```tsx
// lib/survey-logic.ts

interface Condition {
  questionId: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than' | 'is_empty' | 'is_not_empty';
  value?: any;
}

interface LogicRule {
  conditions: Condition[];
  match: 'all' | 'any';
  action: 'show' | 'hide';
}

export function evaluateLogic(logic: LogicRule, formValues: Record<string, any>): boolean {
  if (!logic || !logic.conditions || logic.conditions.length === 0) {
    return true;
  }

  const results = logic.conditions.map((condition) => {
    const fieldValue = formValues[condition.questionId];
    return evaluateCondition(condition, fieldValue);
  });

  const matches = logic.match === 'all'
    ? results.every(Boolean)
    : results.some(Boolean);

  return logic.action === 'show' ? matches : !matches;
}

function evaluateCondition(condition: Condition, fieldValue: any): boolean {
  const { operator, value } = condition;

  switch (operator) {
    case 'equals':
      if (Array.isArray(fieldValue)) {
        return fieldValue.includes(value);
      }
      return fieldValue === value;

    case 'not_equals':
      if (Array.isArray(fieldValue)) {
        return !fieldValue.includes(value);
      }
      return fieldValue !== value;

    case 'contains':
      if (typeof fieldValue === 'string') {
        return fieldValue.toLowerCase().includes(String(value).toLowerCase());
      }
      if (Array.isArray(fieldValue)) {
        return fieldValue.some((v) =>
          String(v).toLowerCase().includes(String(value).toLowerCase())
        );
      }
      return false;

    case 'greater_than':
      return Number(fieldValue) > Number(value);

    case 'less_than':
      return Number(fieldValue) < Number(value);

    case 'is_empty':
      return !fieldValue || (Array.isArray(fieldValue) && fieldValue.length === 0);

    case 'is_not_empty':
      return !!fieldValue && (!Array.isArray(fieldValue) || fieldValue.length > 0);

    default:
      return true;
  }
}
```

## Skills Used

| Skill | Purpose |
|-------|---------|
| [drag-and-drop](../patterns/drag-and-drop.md) | Drag-and-drop survey builder interface |
| [form-validation](../patterns/form-validation.md) | Survey response validation with Zod |
| [conditional-logic](../patterns/conditional-logic.md) | Question branching and skip logic |
| [analytics](../patterns/analytics.md) | Response analysis and visualization |
| [export-data](../patterns/export-data.md) | CSV/Excel response export |

## Testing

### Unit Tests

```tsx
// __tests__/lib/survey-logic.test.ts
import { describe, it, expect } from 'vitest';
import { evaluateLogic, evaluateCondition } from '@/lib/survey-logic';

describe('evaluateCondition', () => {
  it('evaluates equals operator correctly', () => {
    expect(evaluateCondition({ operator: 'equals', value: 'yes' }, 'yes')).toBe(true);
    expect(evaluateCondition({ operator: 'equals', value: 'yes' }, 'no')).toBe(false);
  });

  it('handles array values with equals', () => {
    expect(evaluateCondition({ operator: 'equals', value: 'option1' }, ['option1', 'option2'])).toBe(true);
    expect(evaluateCondition({ operator: 'equals', value: 'option3' }, ['option1', 'option2'])).toBe(false);
  });

  it('evaluates contains operator', () => {
    expect(evaluateCondition({ operator: 'contains', value: 'test' }, 'this is a test')).toBe(true);
    expect(evaluateCondition({ operator: 'contains', value: 'missing' }, 'this is a test')).toBe(false);
  });

  it('evaluates greater_than operator', () => {
    expect(evaluateCondition({ operator: 'greater_than', value: 5 }, 10)).toBe(true);
    expect(evaluateCondition({ operator: 'greater_than', value: 5 }, 3)).toBe(false);
  });

  it('evaluates is_empty operator', () => {
    expect(evaluateCondition({ operator: 'is_empty' }, '')).toBe(true);
    expect(evaluateCondition({ operator: 'is_empty' }, null)).toBe(true);
    expect(evaluateCondition({ operator: 'is_empty' }, [])).toBe(true);
    expect(evaluateCondition({ operator: 'is_empty' }, 'value')).toBe(false);
  });
});

describe('evaluateLogic', () => {
  it('shows question when all conditions match', () => {
    const logic = {
      conditions: [
        { questionId: 'q1', operator: 'equals', value: 'yes' },
        { questionId: 'q2', operator: 'greater_than', value: 5 },
      ],
      match: 'all',
      action: 'show',
    };

    expect(evaluateLogic(logic, { q1: 'yes', q2: 10 })).toBe(true);
    expect(evaluateLogic(logic, { q1: 'no', q2: 10 })).toBe(false);
  });

  it('shows question when any condition matches', () => {
    const logic = {
      conditions: [
        { questionId: 'q1', operator: 'equals', value: 'yes' },
        { questionId: 'q2', operator: 'equals', value: 'yes' },
      ],
      match: 'any',
      action: 'show',
    };

    expect(evaluateLogic(logic, { q1: 'yes', q2: 'no' })).toBe(true);
    expect(evaluateLogic(logic, { q1: 'no', q2: 'no' })).toBe(false);
  });

  it('hides question based on logic action', () => {
    const logic = {
      conditions: [{ questionId: 'q1', operator: 'equals', value: 'skip' }],
      match: 'all',
      action: 'hide',
    };

    expect(evaluateLogic(logic, { q1: 'skip' })).toBe(false);
    expect(evaluateLogic(logic, { q1: 'show' })).toBe(true);
  });
});
```

```tsx
// __tests__/components/survey-renderer.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SurveyRenderer } from '@/components/survey/survey-renderer';

const mockSurvey = {
  title: 'Test Survey',
  description: 'A test survey',
  questions: [
    {
      id: 'q1',
      type: 'SHORT_TEXT',
      title: 'What is your name?',
      isRequired: true,
      config: {},
      pageNumber: 1,
    },
    {
      id: 'q2',
      type: 'SINGLE_CHOICE',
      title: 'Select an option',
      isRequired: false,
      config: { options: ['Option A', 'Option B'] },
      pageNumber: 1,
    },
  ],
};

describe('SurveyRenderer', () => {
  it('renders survey title and description', () => {
    render(<SurveyRenderer surveyId="test" survey={mockSurvey} />);

    expect(screen.getByText('Test Survey')).toBeInTheDocument();
    expect(screen.getByText('A test survey')).toBeInTheDocument();
  });

  it('renders all visible questions', () => {
    render(<SurveyRenderer surveyId="test" survey={mockSurvey} />);

    expect(screen.getByText('What is your name?')).toBeInTheDocument();
    expect(screen.getByText('Select an option')).toBeInTheDocument();
  });

  it('shows required indicator for required questions', () => {
    render(<SurveyRenderer surveyId="test" survey={mockSurvey} />);

    const requiredIndicators = screen.getAllByText('*');
    expect(requiredIndicators.length).toBeGreaterThan(0);
  });
});
```

### Integration Tests

```tsx
// __tests__/api/surveys.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from '@/lib/prisma';
import { POST, GET } from '@/app/api/surveys/route';

describe('Survey API', () => {
  let testUserId: string;

  beforeAll(async () => {
    const user = await prisma.user.create({
      data: { email: 'test@example.com', name: 'Test User' },
    });
    testUserId = user.id;
  });

  afterAll(async () => {
    await prisma.user.delete({ where: { id: testUserId } });
  });

  it('creates a new survey', async () => {
    const request = new Request('http://localhost/api/surveys', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Test Survey',
        description: 'A test survey',
        userId: testUserId,
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.title).toBe('Test Survey');
    expect(data.id).toBeDefined();

    // Cleanup
    await prisma.survey.delete({ where: { id: data.id } });
  });

  it('returns user surveys', async () => {
    const survey = await prisma.survey.create({
      data: {
        title: 'User Survey',
        userId: testUserId,
      },
    });

    const request = new Request(`http://localhost/api/surveys?userId=${testUserId}`);
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.surveys.length).toBeGreaterThan(0);

    await prisma.survey.delete({ where: { id: survey.id } });
  });
});
```

### E2E Tests

```tsx
// e2e/survey-builder.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Survey Builder', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('[data-testid="email"]', 'test@example.com');
    await page.click('[data-testid="login-button"]');
    await page.waitForURL('/surveys');
  });

  test('creates a new survey', async ({ page }) => {
    await page.click('[data-testid="new-survey-button"]');
    await page.fill('[data-testid="survey-title"]', 'My Test Survey');

    // Add a text question
    await page.click('[data-testid="add-short-text"]');
    await page.fill('[data-testid="question-title"]', 'What is your name?');

    // Save survey
    await page.click('[data-testid="save-survey"]');

    await expect(page.locator('[data-testid="save-success"]')).toBeVisible();
  });

  test('drag and drop to reorder questions', async ({ page }) => {
    await page.goto('/surveys/test-survey-id');

    const question1 = page.locator('[data-testid="question-0"]');
    const question2 = page.locator('[data-testid="question-1"]');

    // Get initial positions
    const box1 = await question1.boundingBox();
    const box2 = await question2.boundingBox();

    // Drag question 2 above question 1
    await page.mouse.move(box2!.x + box2!.width / 2, box2!.y + box2!.height / 2);
    await page.mouse.down();
    await page.mouse.move(box1!.x + box1!.width / 2, box1!.y - 10);
    await page.mouse.up();

    // Verify order changed
    await expect(page.locator('[data-testid="question-0"]')).toHaveAttribute(
      'data-question-id',
      'q2'
    );
  });

  test('preview survey works', async ({ page }) => {
    await page.goto('/surveys/test-survey-id');
    await page.click('[data-testid="preview-button"]');

    await expect(page.locator('[data-testid="survey-preview"]')).toBeVisible();
  });

  test('public survey submission', async ({ page }) => {
    await page.goto('/s/published-survey-id');

    // Fill out required fields
    await page.fill('[data-testid="q1-input"]', 'John Doe');
    await page.click('[data-testid="q2-option-1"]');

    // Submit
    await page.click('[data-testid="submit-survey"]');

    await expect(page).toHaveURL(/\/s\/.*\/thank-you/);
  });
});
```

## Error Handling

### Error Boundary

```tsx
// components/survey-error.tsx
'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw, FileQuestion } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function SurveyError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Survey error:', error);
  }, [error]);

  const isSurveyNotFound = error.message.includes('not found');
  const isSurveyClosed = error.message.includes('closed');

  return (
    <div className="min-h-[400px] flex items-center justify-center">
      <div className="text-center max-w-md">
        <FileQuestion className="h-12 w-12 text-gray-400 mx-auto mb-4" />

        <h2 className="text-xl font-semibold mb-2">
          {isSurveyNotFound
            ? 'Survey Not Found'
            : isSurveyClosed
            ? 'Survey Closed'
            : 'Error Loading Survey'}
        </h2>

        <p className="text-muted-foreground mb-4">
          {isSurveyNotFound
            ? 'This survey does not exist or has been deleted.'
            : isSurveyClosed
            ? 'This survey is no longer accepting responses.'
            : 'We encountered an error loading the survey. Please try again.'}
        </p>

        {!isSurveyNotFound && !isSurveyClosed && (
          <Button onClick={reset}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        )}
      </div>
    </div>
  );
}
```

### Form Validation Errors

```tsx
// lib/survey-validation.ts
import { z } from 'zod';

export function createSurveyResponseSchema(questions: Question[]) {
  const shape: Record<string, z.ZodTypeAny> = {};

  for (const question of questions) {
    let fieldSchema: z.ZodTypeAny;

    switch (question.type) {
      case 'SHORT_TEXT':
        fieldSchema = z.string().max(500);
        break;
      case 'LONG_TEXT':
        fieldSchema = z.string().max(5000);
        break;
      case 'EMAIL':
        fieldSchema = z.string().email('Invalid email address');
        break;
      case 'NUMBER':
        fieldSchema = z.number();
        break;
      case 'SINGLE_CHOICE':
      case 'DROPDOWN':
        fieldSchema = z.string();
        break;
      case 'MULTIPLE_CHOICE':
        fieldSchema = z.array(z.string());
        break;
      case 'RATING':
      case 'NPS':
        fieldSchema = z.number().min(question.config.min || 0).max(question.config.max || 10);
        break;
      default:
        fieldSchema = z.any();
    }

    if (!question.isRequired) {
      fieldSchema = fieldSchema.optional();
    }

    shape[question.id] = fieldSchema;
  }

  return z.object(shape);
}
```

## Accessibility

### WCAG 2.1 AA Compliance

```tsx
// components/survey/question-types/choice-question.tsx
export function ChoiceQuestion({ question, value, onChange, error }: ChoiceQuestionProps) {
  const { type, title, description, isRequired, config } = question;

  return (
    <fieldset
      className="space-y-4"
      aria-describedby={description ? `${question.id}-desc` : undefined}
    >
      <legend className="font-medium">
        {title}
        {isRequired && (
          <>
            <span className="text-red-500 ml-1" aria-hidden="true">*</span>
            <span className="sr-only">(required)</span>
          </>
        )}
      </legend>

      {description && (
        <p id={`${question.id}-desc`} className="text-sm text-gray-500">
          {description}
        </p>
      )}

      <div
        role={type === 'SINGLE_CHOICE' ? 'radiogroup' : 'group'}
        aria-required={isRequired}
        aria-invalid={!!error}
        aria-describedby={error ? `${question.id}-error` : undefined}
      >
        {config.options.map((option: string, index: number) => (
          <div key={index} className="flex items-center space-x-2">
            {type === 'SINGLE_CHOICE' ? (
              <input
                type="radio"
                id={`${question.id}-${index}`}
                name={question.id}
                value={option}
                checked={value === option}
                onChange={() => onChange(option)}
                aria-describedby={description ? `${question.id}-desc` : undefined}
                className="h-4 w-4"
              />
            ) : (
              <input
                type="checkbox"
                id={`${question.id}-${index}`}
                value={option}
                checked={Array.isArray(value) && value.includes(option)}
                onChange={(e) => {
                  const current = Array.isArray(value) ? value : [];
                  if (e.target.checked) {
                    onChange([...current, option]);
                  } else {
                    onChange(current.filter((v: string) => v !== option));
                  }
                }}
                className="h-4 w-4"
              />
            )}
            <label htmlFor={`${question.id}-${index}`} className="cursor-pointer">
              {option}
            </label>
          </div>
        ))}
      </div>

      {error && (
        <p id={`${question.id}-error`} className="text-sm text-red-600" role="alert">
          {error.message || 'This field is required'}
        </p>
      )}
    </fieldset>
  );
}
```

### Rating Question Accessibility

```tsx
// components/survey/question-types/rating-question.tsx
export function RatingQuestion({ question, value, onChange, error }: RatingQuestionProps) {
  const { max = 5, icon = 'star' } = question.config;

  return (
    <div>
      <label id={`${question.id}-label`} className="font-medium block mb-2">
        {question.title}
        {question.isRequired && <span className="sr-only">(required)</span>}
      </label>

      <div
        role="slider"
        aria-valuemin={1}
        aria-valuemax={max}
        aria-valuenow={value || 0}
        aria-valuetext={value ? `${value} out of ${max}` : 'No rating selected'}
        aria-labelledby={`${question.id}-label`}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
            onChange(Math.min((value || 0) + 1, max));
          } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
            onChange(Math.max((value || 0) - 1, 1));
          }
        }}
        className="flex gap-1 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded p-1"
      >
        {Array.from({ length: max }, (_, i) => i + 1).map((rating) => (
          <button
            key={rating}
            type="button"
            onClick={() => onChange(rating)}
            className={cn(
              'p-1 rounded transition-colors focus:outline-none',
              rating <= (value || 0) ? 'text-yellow-400' : 'text-gray-300'
            )}
            aria-label={`Rate ${rating} out of ${max}`}
            tabIndex={-1}
          >
            <Star className="h-8 w-8 fill-current" />
          </button>
        ))}
      </div>

      <p className="sr-only" aria-live="polite">
        {value ? `Selected: ${value} out of ${max}` : 'No rating selected'}
      </p>
    </div>
  );
}
```

## Security

### Input Validation

```tsx
// lib/validations/survey.ts
import { z } from 'zod';

export const createSurveySchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title must be less than 200 characters')
    .regex(/^[^<>]*$/, 'Title contains invalid characters'),
  description: z
    .string()
    .max(2000, 'Description must be less than 2000 characters')
    .optional(),
  questions: z.array(
    z.object({
      type: z.enum([
        'SHORT_TEXT', 'LONG_TEXT', 'EMAIL', 'NUMBER',
        'SINGLE_CHOICE', 'MULTIPLE_CHOICE', 'DROPDOWN',
        'RATING', 'SCALE', 'NPS',
      ]),
      title: z.string().min(1).max(500),
      description: z.string().max(1000).optional(),
      isRequired: z.boolean(),
      config: z.record(z.any()),
      logic: z.object({
        conditions: z.array(z.any()),
        match: z.enum(['all', 'any']),
        action: z.enum(['show', 'hide']),
      }).optional(),
    })
  ).max(100, 'Survey cannot have more than 100 questions'),
});

export const submitResponseSchema = z.object({
  answers: z.array(
    z.object({
      questionId: z.string().cuid(),
      value: z.any(),
    })
  ),
  duration: z.number().int().positive().max(86400), // Max 24 hours
});
```

### Rate Limiting

```tsx
// lib/rate-limit.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL!,
  token: process.env.UPSTASH_REDIS_TOKEN!,
});

export const rateLimits = {
  // Survey creation
  createSurvey: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, '1 h'),
    prefix: 'ratelimit:survey:create',
  }),

  // Response submission
  submitResponse: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, '1 m'),
    prefix: 'ratelimit:response:submit',
  }),

  // Export data
  exportResponses: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, '1 h'),
    prefix: 'ratelimit:export',
  }),
};

// Anti-spam for public surveys
export async function checkResponseSpam(
  surveyId: string,
  ip: string
): Promise<boolean> {
  const key = `spam:${surveyId}:${ip}`;
  const count = await redis.incr(key);

  if (count === 1) {
    await redis.expire(key, 3600); // 1 hour window
  }

  return count > 10; // Max 10 responses per IP per hour
}
```

### XSS Prevention

```tsx
// lib/sanitize.ts
import DOMPurify from 'isomorphic-dompurify';

export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
    ALLOWED_ATTR: ['href', 'target'],
  });
}

export function sanitizeText(text: string): string {
  return text
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}
```

## Performance

### Caching Strategies

```tsx
// lib/cache.ts
import { unstable_cache } from 'next/cache';
import { prisma } from '@/lib/prisma';

// Cache survey structure (doesn't change during active survey)
export const getCachedSurvey = unstable_cache(
  async (surveyId: string) => {
    return prisma.survey.findUnique({
      where: { id: surveyId, status: 'PUBLISHED' },
      include: {
        questions: {
          orderBy: [{ pageNumber: 'asc' }, { position: 'asc' }],
        },
      },
    });
  },
  ['survey'],
  { revalidate: 60, tags: ['survey'] }
);

// Cache analytics with shorter TTL
export const getCachedAnalytics = unstable_cache(
  async (surveyId: string) => {
    const [summary, questionAnalytics] = await Promise.all([
      prisma.response.aggregate({
        where: { surveyId },
        _count: true,
        _avg: { duration: true },
      }),
      getQuestionAnalytics(surveyId),
    ]);

    return {
      totalResponses: summary._count,
      avgDuration: Math.round(summary._avg.duration || 0),
      questionAnalytics,
    };
  },
  ['analytics'],
  { revalidate: 30, tags: ['analytics'] }
);
```

### Lazy Loading Questions

```tsx
// components/survey/survey-renderer.tsx
import { lazy, Suspense } from 'react';

const QuestionComponents = {
  SHORT_TEXT: lazy(() => import('./question-types/text-question')),
  LONG_TEXT: lazy(() => import('./question-types/text-question')),
  SINGLE_CHOICE: lazy(() => import('./question-types/choice-question')),
  MULTIPLE_CHOICE: lazy(() => import('./question-types/choice-question')),
  RATING: lazy(() => import('./question-types/rating-question')),
  MATRIX: lazy(() => import('./question-types/matrix-question')),
};

function renderQuestion(question: Question, props: any) {
  const Component = QuestionComponents[question.type];

  if (!Component) return null;

  return (
    <Suspense fallback={<QuestionSkeleton />}>
      <Component question={question} {...props} />
    </Suspense>
  );
}
```

## CI/CD

### GitHub Actions Workflow

```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

env:
  DATABASE_URL: postgresql://postgres:postgres@localhost:5432/survey_test

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
        with:
          version: 9
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: pnpm lint
      - run: pnpm type-check

  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_USER: postgres
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: survey_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
        with:
          version: 9
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: pnpm prisma generate
      - run: pnpm prisma db push
      - run: pnpm test:unit
      - run: pnpm test:integration

  e2e:
    runs-on: ubuntu-latest
    needs: [lint, test]
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
        with:
          version: 9
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: pnpm exec playwright install --with-deps
      - run: pnpm build
      - run: pnpm test:e2e
      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/

  deploy:
    runs-on: ubuntu-latest
    needs: [e2e]
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

## Monitoring

### Sentry Integration

```tsx
// sentry.client.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1,
  integrations: [
    Sentry.replayIntegration({
      maskAllText: false,
      maskAllInputs: true, // Mask survey responses
    }),
  ],
});
```

### Health Check Endpoint

```tsx
// app/api/health/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const checks = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    checks: {} as Record<string, any>,
  };

  // Database check
  const dbStart = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.checks.database = { status: 'healthy', latency: Date.now() - dbStart };
  } catch (error) {
    checks.checks.database = { status: 'unhealthy', error: 'Connection failed' };
    checks.status = 'unhealthy';
  }

  // Active surveys count
  const activeSurveys = await prisma.survey.count({
    where: { status: 'PUBLISHED' },
  });
  checks.checks.activeSurveys = { count: activeSurveys };

  return NextResponse.json(checks, {
    status: checks.status === 'healthy' ? 200 : 503,
  });
}
```

### Survey Metrics

```tsx
// lib/metrics.ts
import { Counter, Histogram, Registry } from 'prom-client';

export const registry = new Registry();

export const surveyViews = new Counter({
  name: 'survey_views_total',
  help: 'Total survey page views',
  labelNames: ['survey_id'],
  registers: [registry],
});

export const surveySubmissions = new Counter({
  name: 'survey_submissions_total',
  help: 'Total survey submissions',
  labelNames: ['survey_id', 'status'],
  registers: [registry],
});

export const surveyCompletionTime = new Histogram({
  name: 'survey_completion_seconds',
  help: 'Survey completion time in seconds',
  labelNames: ['survey_id'],
  buckets: [30, 60, 120, 300, 600, 1200],
  registers: [registry],
});
```

## Environment Variables

```bash
# .env.example

# ===================
# Database
# ===================
DATABASE_URL="postgresql://user:password@localhost:5432/surveybuilder"

# ===================
# Authentication
# ===================
NEXTAUTH_SECRET="your-nextauth-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# ===================
# Redis (for rate limiting)
# ===================
UPSTASH_REDIS_URL="https://xxx.upstash.io"
UPSTASH_REDIS_TOKEN="your-token"

# ===================
# File Storage (for file uploads)
# ===================
AWS_S3_BUCKET="your-bucket"
AWS_ACCESS_KEY_ID="your-access-key"
AWS_SECRET_ACCESS_KEY="your-secret-key"
AWS_REGION="us-east-1"

# ===================
# Monitoring
# ===================
NEXT_PUBLIC_SENTRY_DSN="https://xxx@sentry.io/xxx"
SENTRY_AUTH_TOKEN="your-sentry-auth-token"

# ===================
# Application
# ===================
NEXT_PUBLIC_APP_URL="https://surveys.yourdomain.com"
```

## Deployment Checklist

### Pre-Deployment

- [ ] All environment variables configured
- [ ] Database migrations applied
- [ ] File storage configured for uploads
- [ ] SSL certificate configured

### Security

- [ ] Rate limiting enabled
- [ ] XSS sanitization enabled
- [ ] CSRF protection verified
- [ ] Input validation on all endpoints

### Features

- [ ] Survey creation works end-to-end
- [ ] Conditional logic functioning
- [ ] Response submission works
- [ ] Analytics dashboard loading
- [ ] Export functionality working

### Monitoring

- [ ] Sentry configured
- [ ] Health check endpoint accessible
- [ ] Response time alerts configured
- [ ] Error rate alerts configured

### Post-Deployment

- [ ] Create test survey and submit response
- [ ] Verify analytics update
- [ ] Test export functionality
- [ ] Verify email notifications (if configured)
- [ ] Test survey sharing and embedding
- [ ] Monitor error rates for first 24 hours

## Related Skills

- [Drag and Drop](../patterns/drag-and-drop.md) - Builder functionality
- [Form Validation](../patterns/form-validation.md) - Input validation
- [Conditional Logic](../patterns/conditional-logic.md) - Survey branching
- [Analytics](../patterns/analytics.md) - Response analysis
- [Export Data](../patterns/export-data.md) - CSV/Excel export

## Changelog

### 1.0.0 (2025-01-17)

- Initial implementation with survey builder
- Multiple question types
- Conditional logic and branching
- Response collection and analytics
- Survey sharing and embedding
