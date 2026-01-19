---
id: r-project-management
name: Project Management
version: 3.0.0
layer: L6
category: recipes
description: Kanban-style project management with boards, tasks, drag-and-drop, assignments, and team collaboration
tags: [kanban, tasks, projects, drag-drop, collaboration, teams, sprints]
formula: "ProjectManagement = DashboardLayout(t-dashboard-layout) + DashboardHome(t-dashboard-home) + SettingsPage(t-settings-page) + AuthLayout(t-auth-layout) + ProfilePage(t-profile-page) + KanbanBoard(o-kanban-board) + DataTable(o-data-table) + Dialog(o-dialog) + UserMenu(o-user-menu) + Header(o-header) + Sidebar(o-sidebar) + Chart(o-chart) + StatsDashboard(o-stats-dashboard) + Tabs(o-tabs) + Modal(o-modal) + FilterBar(o-filter-bar) + ActivityTimeline(o-activity-timeline) + FileUploader(o-file-uploader) + Breadcrumb(m-breadcrumb) + Pagination(m-pagination) + Card(m-card) + FormField(m-form-field) + Badge(m-badge) + Avatar(m-avatar) + DatePicker(m-date-picker) + SearchInput(m-search-input) + Toast(m-toast) + NextAuth(pt-next-auth) + AuthMiddleware(pt-auth-middleware) + SessionManagement(pt-session-management) + Rbac(pt-rbac) + MultiTenancy(pt-multi-tenancy) + RateLimiting(pt-rate-limiting) + AuditLogging(pt-audit-logging) + FormValidation(pt-form-validation) + ZodSchemas(pt-zod-schemas) + ServerActions(pt-server-actions) + TransactionalEmail(pt-transactional-email) + PushNotifications(pt-push-notifications) + ErrorBoundaries(pt-error-boundaries) + ErrorTracking(pt-error-tracking) + SkeletonLoading(pt-skeleton-loading) + AnalyticsEvents(pt-analytics-events) + Filtering(pt-filtering) + Sorting(pt-sorting) + ReactQuery(pt-react-query) + Zustand(pt-zustand) + OptimisticUpdates(pt-optimistic-updates) + RichTextEditor(pt-rich-text-editor) + DragAndDrop(pt-drag-and-drop) + WebsocketUpdates(pt-websocket-updates) + FileUpload(pt-file-upload) + MentionsAutocomplete(pt-mentions-autocomplete) + CalendarIntegration(pt-calendar-integration) + TestingE2e(pt-testing-e2e) + TestingUnit(pt-testing-unit) + KeyboardNavigation(pt-keyboard-navigation) + GdprCompliance(pt-gdpr-compliance) + Csp(pt-csp) + InputSanitization(pt-input-sanitization) + Sitemap(pt-sitemap) + StructuredData(pt-structured-data) + MetadataApi(pt-metadata-api) + UserAnalytics(pt-user-analytics) + Pagination(pt-pagination)"
composes:
  # L4 Templates
  - ../templates/dashboard-layout.md
  - ../templates/dashboard-home.md
  - ../templates/settings-page.md
  - ../templates/auth-layout.md
  - ../templates/profile-page.md
  # L3 Organisms
  - ../organisms/kanban-board.md
  - ../organisms/data-table.md
  - ../organisms/dialog.md
  - ../organisms/user-menu.md
  - ../organisms/header.md
  - ../organisms/sidebar.md
  - ../organisms/chart.md
  - ../organisms/stats-dashboard.md
  - ../organisms/tabs.md
  - ../organisms/modal.md
  - ../organisms/filter-bar.md
  - ../organisms/activity-timeline.md
  - ../organisms/file-uploader.md
  # L2 Molecules
  - ../molecules/breadcrumb.md
  - ../molecules/pagination.md
  - ../molecules/card.md
  - ../molecules/form-field.md
  - ../molecules/badge.md
  - ../molecules/avatar.md
  - ../molecules/date-picker.md
  - ../molecules/search-input.md
  - ../molecules/toast.md
  # L5 Patterns - Authentication
  - ../patterns/next-auth.md
  - ../patterns/auth-middleware.md
  - ../patterns/session-management.md
  - ../patterns/rbac.md
  - ../patterns/multi-tenancy.md
  # L5 Patterns - Security
  - ../patterns/rate-limiting.md
  - ../patterns/audit-logging.md
  # L5 Patterns - Forms & Validation
  - ../patterns/form-validation.md
  - ../patterns/zod-schemas.md
  - ../patterns/server-actions.md
  # L5 Patterns - Communication
  - ../patterns/transactional-email.md
  - ../patterns/push-notifications.md
  # L5 Patterns - Error Handling
  - ../patterns/error-boundaries.md
  - ../patterns/error-tracking.md
  - ../patterns/skeleton-loading.md
  # L5 Patterns - Analytics
  - ../patterns/analytics-events.md
  # L5 Patterns - Data Management
  - ../patterns/filtering.md
  - ../patterns/sorting.md
  # L5 Patterns - State Management
  - ../patterns/react-query.md
  - ../patterns/zustand.md
  - ../patterns/optimistic-updates.md
  # L5 Patterns - Project Management Specific
  - ../patterns/rich-text-editor.md
  - ../patterns/drag-and-drop.md
  - ../patterns/websocket-updates.md
  - ../patterns/file-upload.md
  - ../patterns/mentions-autocomplete.md
  - ../patterns/calendar-integration.md
  # L5 Patterns - Testing
  - ../patterns/testing-e2e.md
  - ../patterns/testing-unit.md
  # L5 Patterns - Accessibility
  - ../patterns/keyboard-navigation.md
  # L5 Patterns - Security (Additional)
  - ../patterns/gdpr-compliance.md
  - ../patterns/csp.md
  - ../patterns/input-sanitization.md
  # L5 Patterns - SEO
  - ../patterns/sitemap.md
  - ../patterns/structured-data.md
  - ../patterns/metadata-api.md
  # L5 Patterns - Analytics (Additional)
  - ../patterns/user-analytics.md
  # L5 Patterns - Data Management (Additional)
  - ../patterns/pagination.md
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
  - "@radix-ui/react-popover"
  - "@radix-ui/react-avatar"
  - "@radix-ui/react-dropdown-menu"
  - lucide-react
  - date-fns
skills:
  - drag-and-drop
  - real-time-updates
  - optimistic-updates
  - keyboard-navigation
  - rich-text-editor
performance:
  impact: high
  lcp: medium
  cls: low
accessibility:
  wcag: AA
  keyboard: true
  screen-reader: true
---

# Project Management

## Overview

A comprehensive project management application featuring:
- Kanban boards with drag-and-drop
- Task cards with details, attachments, comments
- Multiple views (Board, List, Calendar, Timeline)
- Team workspaces and member management
- Labels, priorities, and due dates
- Sprint planning and tracking
- Activity logging and notifications
- Real-time collaboration

## Project Structure

```
project-management/
├── app/
│   ├── (workspace)/
│   │   ├── layout.tsx
│   │   ├── page.tsx                      # Workspace home
│   │   ├── [workspaceId]/
│   │   │   ├── page.tsx                  # Projects list
│   │   │   ├── settings/page.tsx
│   │   │   └── members/page.tsx
│   │   └── project/[projectId]/
│   │       ├── page.tsx                  # Board view (default)
│   │       ├── list/page.tsx             # List view
│   │       ├── calendar/page.tsx         # Calendar view
│   │       ├── timeline/page.tsx         # Gantt view
│   │       └── settings/page.tsx
│   ├── api/
│   │   ├── workspaces/
│   │   │   ├── route.ts
│   │   │   └── [workspaceId]/
│   │   │       ├── route.ts
│   │   │       └── members/route.ts
│   │   ├── projects/
│   │   │   ├── route.ts
│   │   │   └── [projectId]/
│   │   │       ├── route.ts
│   │   │       └── columns/route.ts
│   │   ├── tasks/
│   │   │   ├── route.ts
│   │   │   └── [taskId]/
│   │   │       ├── route.ts
│   │   │       ├── comments/route.ts
│   │   │       └── attachments/route.ts
│   │   └── columns/
│   │       ├── route.ts
│   │       └── [columnId]/route.ts
│   └── layout.tsx
├── components/
│   ├── board/
│   │   ├── kanban-board.tsx
│   │   ├── board-column.tsx
│   │   ├── task-card.tsx
│   │   └── add-task-form.tsx
│   ├── task/
│   │   ├── task-detail-modal.tsx
│   │   ├── task-comments.tsx
│   │   ├── task-attachments.tsx
│   │   └── task-activity.tsx
│   ├── views/
│   │   ├── list-view.tsx
│   │   ├── calendar-view.tsx
│   │   └── timeline-view.tsx
│   └── ui/
├── lib/
│   ├── api.ts
│   └── utils.ts
├── hooks/
│   ├── use-board.ts
│   └── use-tasks.ts
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
  avatar    String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Workspaces
  workspaces    WorkspaceMember[]
  ownedWorkspaces Workspace[]
  
  // Tasks
  assignedTasks TaskAssignee[]
  createdTasks  Task[]         @relation("creator")
  comments      Comment[]
  activities    Activity[]

  @@index([email])
}

model Workspace {
  id          String   @id @default(cuid())
  name        String
  slug        String   @unique
  description String?
  logo        String?
  
  ownerId     String
  owner       User     @relation(fields: [ownerId], references: [id])
  
  members     WorkspaceMember[]
  projects    Project[]
  labels      Label[]
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([slug])
  @@index([ownerId])
}

model WorkspaceMember {
  id          String        @id @default(cuid())
  workspaceId String
  workspace   Workspace     @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  userId      String
  user        User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  role        WorkspaceRole @default(MEMBER)
  joinedAt    DateTime      @default(now())

  @@unique([workspaceId, userId])
  @@index([workspaceId])
  @@index([userId])
}

enum WorkspaceRole {
  OWNER
  ADMIN
  MEMBER
  VIEWER
}

model Project {
  id          String        @id @default(cuid())
  name        String
  slug        String
  description String?
  color       String        @default("#3b82f6")
  icon        String?
  
  workspaceId String
  workspace   Workspace     @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  
  columns     Column[]
  tasks       Task[]
  
  // Settings
  defaultView String        @default("board")
  isPublic    Boolean       @default(false)
  
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt

  @@unique([workspaceId, slug])
  @@index([workspaceId])
}

model Column {
  id          String   @id @default(cuid())
  name        String
  position    Int
  color       String?
  
  projectId   String
  project     Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)
  
  tasks       Task[]
  
  // Limits
  taskLimit   Int?     // WIP limit
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([projectId])
}

model Task {
  id          String       @id @default(cuid())
  title       String
  description String?
  position    Int
  
  // Status
  columnId    String
  column      Column       @relation(fields: [columnId], references: [id], onDelete: Cascade)
  
  projectId   String
  project     Project      @relation(fields: [projectId], references: [id], onDelete: Cascade)
  
  // Properties
  priority    TaskPriority @default(NONE)
  dueDate     DateTime?
  startDate   DateTime?
  estimatedHours Float?
  actualHours Float?
  
  // Relations
  creatorId   String
  creator     User         @relation("creator", fields: [creatorId], references: [id])
  assignees   TaskAssignee[]
  labels      TaskLabel[]
  comments    Comment[]
  attachments Attachment[]
  activities  Activity[]
  
  // Subtasks
  parentId    String?
  parent      Task?        @relation("subtasks", fields: [parentId], references: [id])
  subtasks    Task[]       @relation("subtasks")
  
  // Checklist
  checklist   ChecklistItem[]
  
  completedAt DateTime?
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt

  @@index([columnId])
  @@index([projectId])
  @@index([creatorId])
  @@index([dueDate])
}

enum TaskPriority {
  NONE
  LOW
  MEDIUM
  HIGH
  URGENT
}

model TaskAssignee {
  id        String   @id @default(cuid())
  taskId    String
  task      Task     @relation(fields: [taskId], references: [id], onDelete: Cascade)
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  assignedAt DateTime @default(now())

  @@unique([taskId, userId])
  @@index([taskId])
  @@index([userId])
}

model Label {
  id          String      @id @default(cuid())
  name        String
  color       String
  workspaceId String
  workspace   Workspace   @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  tasks       TaskLabel[]
  
  createdAt   DateTime    @default(now())

  @@unique([workspaceId, name])
  @@index([workspaceId])
}

model TaskLabel {
  id        String   @id @default(cuid())
  taskId    String
  task      Task     @relation(fields: [taskId], references: [id], onDelete: Cascade)
  labelId   String
  label     Label    @relation(fields: [labelId], references: [id], onDelete: Cascade)

  @@unique([taskId, labelId])
}

model ChecklistItem {
  id          String   @id @default(cuid())
  text        String
  completed   Boolean  @default(false)
  position    Int
  taskId      String
  task        Task     @relation(fields: [taskId], references: [id], onDelete: Cascade)
  completedAt DateTime?
  createdAt   DateTime @default(now())

  @@index([taskId])
}

model Comment {
  id        String   @id @default(cuid())
  content   String
  taskId    String
  task      Task     @relation(fields: [taskId], references: [id], onDelete: Cascade)
  authorId  String
  author    User     @relation(fields: [authorId], references: [id])
  
  // Threading
  parentId  String?
  parent    Comment? @relation("replies", fields: [parentId], references: [id])
  replies   Comment[] @relation("replies")
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([taskId])
  @@index([authorId])
}

model Attachment {
  id        String   @id @default(cuid())
  name      String
  url       String
  type      String
  size      Int
  taskId    String
  task      Task     @relation(fields: [taskId], references: [id], onDelete: Cascade)
  uploadedBy String
  createdAt DateTime @default(now())

  @@index([taskId])
}

model Activity {
  id        String   @id @default(cuid())
  type      String   // 'created', 'moved', 'assigned', 'commented', etc.
  data      Json?    // Additional context
  taskId    String
  task      Task     @relation(fields: [taskId], references: [id], onDelete: Cascade)
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  createdAt DateTime @default(now())

  @@index([taskId])
  @@index([userId])
  @@index([createdAt])
}
```

## Implementation

### Kanban Board

```tsx
// components/board/kanban-board.tsx
'use client';

import { useState, useCallback } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { BoardColumn } from './board-column';
import { TaskCard } from './task-card';
import { Button } from '@/components/ui/button';

interface Task {
  id: string;
  title: string;
  description: string | null;
  position: number;
  columnId: string;
  priority: string;
  dueDate: string | null;
  assignees: { user: { id: string; name: string; avatar: string | null } }[];
  labels: { label: { id: string; name: string; color: string } }[];
  _count: { subtasks: number; comments: number; attachments: number };
}

interface Column {
  id: string;
  name: string;
  position: number;
  color: string | null;
  taskLimit: number | null;
  tasks: Task[];
}

interface KanbanBoardProps {
  projectId: string;
  columns: Column[];
}

export function KanbanBoard({ projectId, columns: initialColumns }: KanbanBoardProps) {
  const [columns, setColumns] = useState(initialColumns);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [activeColumn, setActiveColumn] = useState<Column | null>(null);
  const queryClient = useQueryClient();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const moveTask = useMutation({
    mutationFn: async ({
      taskId,
      columnId,
      position,
    }: {
      taskId: string;
      columnId: string;
      position: number;
    }) => {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ columnId, position }),
      });
      if (!response.ok) throw new Error('Failed to move task');
      return response.json();
    },
    onError: () => {
      // Revert on error
      setColumns(initialColumns);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['board', projectId] });
    },
  });

  const findColumn = (id: string) => {
    return columns.find((col) => col.id === id);
  };

  const findTask = (id: string) => {
    for (const column of columns) {
      const task = column.tasks.find((t) => t.id === id);
      if (task) return { task, column };
    }
    return null;
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const activeId = active.id as string;

    // Check if dragging a column
    const column = findColumn(activeId);
    if (column) {
      setActiveColumn(column);
      return;
    }

    // Check if dragging a task
    const taskData = findTask(activeId);
    if (taskData) {
      setActiveTask(taskData.task);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Find the containers
    const activeTaskData = findTask(activeId);
    if (!activeTaskData) return;

    const { column: activeColumn } = activeTaskData;

    // Check if over a column
    let overColumn = findColumn(overId);
    if (!overColumn) {
      const overTaskData = findTask(overId);
      if (overTaskData) {
        overColumn = overTaskData.column;
      }
    }

    if (!overColumn || activeColumn.id === overColumn.id) return;

    // Move task to new column
    setColumns((prev) => {
      const activeColIndex = prev.findIndex((c) => c.id === activeColumn.id);
      const overColIndex = prev.findIndex((c) => c.id === overColumn!.id);

      const activeTaskIndex = prev[activeColIndex].tasks.findIndex(
        (t) => t.id === activeId
      );

      const newColumns = [...prev];
      const [movedTask] = newColumns[activeColIndex].tasks.splice(activeTaskIndex, 1);
      movedTask.columnId = overColumn!.id;
      newColumns[overColIndex].tasks.push(movedTask);

      return newColumns;
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    setActiveTask(null);
    setActiveColumn(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeTaskData = findTask(activeId);
    if (!activeTaskData) return;

    const overColumn = findColumn(overId) || findTask(overId)?.column;
    if (!overColumn) return;

    // Calculate new position
    const overTaskIndex = overColumn.tasks.findIndex((t) => t.id === overId);
    const newPosition = overTaskIndex >= 0 ? overTaskIndex : overColumn.tasks.length;

    // Optimistic update already done in handleDragOver
    // Now persist to server
    moveTask.mutate({
      taskId: activeId,
      columnId: overColumn.id,
      position: newPosition,
    });
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 h-full overflow-x-auto p-4">
        <SortableContext
          items={columns.map((c) => c.id)}
          strategy={horizontalListSortingStrategy}
        >
          {columns.map((column) => (
            <BoardColumn
              key={column.id}
              column={column}
              projectId={projectId}
            />
          ))}
        </SortableContext>

        {/* Add Column Button */}
        <div className="flex-shrink-0 w-72">
          <Button
            variant="ghost"
            className="w-full justify-start text-gray-500 hover:text-gray-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Column
          </Button>
        </div>
      </div>

      {/* Drag Overlay */}
      <DragOverlay>
        {activeTask && (
          <TaskCard task={activeTask} isDragging />
        )}
      </DragOverlay>
    </DndContext>
  );
}
```

### Board Column

```tsx
// components/board/board-column.tsx
'use client';

import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { MoreHorizontal, Plus } from 'lucide-react';
import { TaskCard } from './task-card';
import { AddTaskForm } from './add-task-form';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface Task {
  id: string;
  title: string;
  description: string | null;
  position: number;
  columnId: string;
  priority: string;
  dueDate: string | null;
  assignees: { user: { id: string; name: string; avatar: string | null } }[];
  labels: { label: { id: string; name: string; color: string } }[];
  _count: { subtasks: number; comments: number; attachments: number };
}

interface Column {
  id: string;
  name: string;
  position: number;
  color: string | null;
  taskLimit: number | null;
  tasks: Task[];
}

interface BoardColumnProps {
  column: Column;
  projectId: string;
}

export function BoardColumn({ column, projectId }: BoardColumnProps) {
  const [isAddingTask, setIsAddingTask] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: column.id,
    data: { type: 'column', column },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const isOverLimit = column.taskLimit && column.tasks.length >= column.taskLimit;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'flex-shrink-0 w-72 bg-gray-100 dark:bg-gray-900 rounded-xl flex flex-col max-h-full',
        isDragging && 'opacity-50'
      )}
    >
      {/* Column Header */}
      <div
        {...attributes}
        {...listeners}
        className="flex items-center justify-between p-3 cursor-grab active:cursor-grabbing"
      >
        <div className="flex items-center gap-2">
          {column.color && (
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: column.color }}
            />
          )}
          <h3 className="font-semibold">{column.name}</h3>
          <span className={cn(
            'text-sm px-2 py-0.5 rounded-full',
            isOverLimit
              ? 'bg-red-100 text-red-700'
              : 'bg-gray-200 dark:bg-gray-800 text-gray-600'
          )}>
            {column.tasks.length}
            {column.taskLimit && `/${column.taskLimit}`}
          </span>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Rename</DropdownMenuItem>
            <DropdownMenuItem>Set WIP Limit</DropdownMenuItem>
            <DropdownMenuItem>Change Color</DropdownMenuItem>
            <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Tasks */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        <SortableContext
          items={column.tasks.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          {column.tasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </SortableContext>

        {/* Add Task Form */}
        {isAddingTask ? (
          <AddTaskForm
            columnId={column.id}
            projectId={projectId}
            onCancel={() => setIsAddingTask(false)}
            onSuccess={() => setIsAddingTask(false)}
          />
        ) : (
          <Button
            variant="ghost"
            className="w-full justify-start text-gray-500 hover:text-gray-700"
            onClick={() => setIsAddingTask(true)}
            disabled={isOverLimit}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Task
          </Button>
        )}
      </div>
    </div>
  );
}
```

### Task Card

```tsx
// components/board/task-card.tsx
'use client';

import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { format, isPast, isToday } from 'date-fns';
import { 
  Calendar, MessageSquare, Paperclip, 
  CheckSquare, AlertCircle, Flag 
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { TaskDetailModal } from '@/components/task/task-detail-modal';
import { cn } from '@/lib/utils';

interface Task {
  id: string;
  title: string;
  description: string | null;
  position: number;
  columnId: string;
  priority: string;
  dueDate: string | null;
  assignees: { user: { id: string; name: string; avatar: string | null } }[];
  labels: { label: { id: string; name: string; color: string } }[];
  _count: { subtasks: number; comments: number; attachments: number };
}

interface TaskCardProps {
  task: Task;
  isDragging?: boolean;
}

const priorityConfig = {
  URGENT: { color: 'text-red-500', icon: AlertCircle },
  HIGH: { color: 'text-orange-500', icon: Flag },
  MEDIUM: { color: 'text-yellow-500', icon: Flag },
  LOW: { color: 'text-blue-500', icon: Flag },
  NONE: { color: 'text-gray-400', icon: null },
};

export function TaskCard({ task, isDragging }: TaskCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({
    id: task.id,
    data: { type: 'task', task },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const priority = priorityConfig[task.priority as keyof typeof priorityConfig];
  const PriorityIcon = priority?.icon;

  const isOverdue = task.dueDate && isPast(new Date(task.dueDate)) && !isToday(new Date(task.dueDate));
  const isDueToday = task.dueDate && isToday(new Date(task.dueDate));

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        onClick={() => setIsModalOpen(true)}
        className={cn(
          'bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm border cursor-pointer',
          'hover:shadow-md hover:border-blue-300 transition-all',
          isDragging && 'shadow-lg rotate-3 opacity-90'
        )}
      >
        {/* Labels */}
        {task.labels.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {task.labels.map(({ label }) => (
              <div
                key={label.id}
                className="h-1.5 w-8 rounded-full"
                style={{ backgroundColor: label.color }}
                title={label.name}
              />
            ))}
          </div>
        )}

        {/* Title */}
        <p className="font-medium text-sm mb-2">{task.title}</p>

        {/* Meta Info */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-2">
            {/* Priority */}
            {PriorityIcon && (
              <PriorityIcon className={cn('h-3.5 w-3.5', priority.color)} />
            )}

            {/* Due Date */}
            {task.dueDate && (
              <span className={cn(
                'flex items-center gap-1',
                isOverdue && 'text-red-500',
                isDueToday && 'text-orange-500'
              )}>
                <Calendar className="h-3 w-3" />
                {format(new Date(task.dueDate), 'MMM d')}
              </span>
            )}

            {/* Comments */}
            {task._count.comments > 0 && (
              <span className="flex items-center gap-1">
                <MessageSquare className="h-3 w-3" />
                {task._count.comments}
              </span>
            )}

            {/* Attachments */}
            {task._count.attachments > 0 && (
              <span className="flex items-center gap-1">
                <Paperclip className="h-3 w-3" />
                {task._count.attachments}
              </span>
            )}

            {/* Subtasks */}
            {task._count.subtasks > 0 && (
              <span className="flex items-center gap-1">
                <CheckSquare className="h-3 w-3" />
                {task._count.subtasks}
              </span>
            )}
          </div>

          {/* Assignees */}
          {task.assignees.length > 0 && (
            <div className="flex -space-x-2">
              {task.assignees.slice(0, 3).map(({ user }) => (
                <Avatar key={user.id} className="h-6 w-6 border-2 border-white">
                  <AvatarImage src={user.avatar || undefined} alt={user.name} />
                  <AvatarFallback className="text-xs">{user.name[0]}</AvatarFallback>
                </Avatar>
              ))}
              {task.assignees.length > 3 && (
                <div className="h-6 w-6 rounded-full bg-gray-200 flex items-center justify-center text-xs border-2 border-white">
                  +{task.assignees.length - 3}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Task Detail Modal */}
      <TaskDetailModal
        taskId={task.id}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
      />
    </>
  );
}
```

### Task Detail Modal

```tsx
// components/task/task-detail-modal.tsx
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import {
  X, Calendar, Users, Tag, Paperclip,
  CheckSquare, MessageSquare, Clock, MoreHorizontal
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { TaskComments } from './task-comments';
import { TaskActivity } from './task-activity';
import { cn } from '@/lib/utils';

const taskSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
});

interface TaskDetailModalProps {
  taskId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TaskDetailModal({ taskId, open, onOpenChange }: TaskDetailModalProps) {
  const queryClient = useQueryClient();

  const { data: task, isLoading } = useQuery({
    queryKey: ['task', taskId],
    queryFn: async () => {
      const response = await fetch(`/api/tasks/${taskId}`);
      if (!response.ok) throw new Error('Failed to fetch task');
      return response.json();
    },
    enabled: open,
  });

  const updateTask = useMutation({
    mutationFn: async (data: Partial<z.infer<typeof taskSchema>>) => {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update task');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task', taskId] });
      queryClient.invalidateQueries({ queryKey: ['board'] });
    },
  });

  const { register, handleSubmit } = useForm({
    resolver: zodResolver(taskSchema),
    values: task ? { title: task.title, description: task.description || '' } : undefined,
  });

  if (isLoading || !task) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl">
          <div className="flex items-center justify-center h-96">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col p-0">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>{task.project.name}</span>
            <span>/</span>
            <span>{task.column.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Main Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* Title */}
            <input
              {...register('title')}
              className="text-2xl font-bold w-full bg-transparent border-none focus:outline-none focus:ring-0 mb-4"
              onBlur={handleSubmit((data) => updateTask.mutate(data))}
            />

            {/* Description */}
            <div className="mb-6">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                Description
              </h3>
              <Textarea
                {...register('description')}
                placeholder="Add a description..."
                className="min-h-[100px] resize-none"
                onBlur={handleSubmit((data) => updateTask.mutate(data))}
              />
            </div>

            {/* Checklist */}
            {task.checklist.length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <CheckSquare className="h-4 w-4" />
                  Checklist
                </h3>
                <div className="space-y-2">
                  {task.checklist.map((item: any) => (
                    <label
                      key={item.id}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={item.completed}
                        className="rounded"
                        onChange={() => {/* Toggle checklist item */}}
                      />
                      <span className={cn(item.completed && 'line-through text-gray-500')}>
                        {item.text}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Comments */}
            <div className="mb-6">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Comments ({task.comments.length})
              </h3>
              <TaskComments taskId={taskId} comments={task.comments} />
            </div>

            {/* Activity */}
            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Activity
              </h3>
              <TaskActivity activities={task.activities} />
            </div>
          </div>

          {/* Sidebar */}
          <div className="w-64 border-l bg-gray-50 dark:bg-gray-900 p-4 space-y-4">
            {/* Assignees */}
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-2">Assignees</h4>
              <div className="space-y-2">
                {task.assignees.map(({ user }: any) => (
                  <div key={user.id} className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback>{user.name[0]}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{user.name}</span>
                  </div>
                ))}
                <Button variant="ghost" size="sm" className="w-full justify-start">
                  <Users className="h-4 w-4 mr-2" />
                  Add assignee
                </Button>
              </div>
            </div>

            {/* Labels */}
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-2">Labels</h4>
              <div className="flex flex-wrap gap-1">
                {task.labels.map(({ label }: any) => (
                  <Badge
                    key={label.id}
                    style={{ backgroundColor: label.color }}
                    className="text-white"
                  >
                    {label.name}
                  </Badge>
                ))}
                <Button variant="ghost" size="sm">
                  <Tag className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Due Date */}
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-2">Due Date</h4>
              {task.dueDate ? (
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4" />
                  {format(new Date(task.dueDate), 'MMM d, yyyy')}
                </div>
              ) : (
                <Button variant="ghost" size="sm" className="w-full justify-start">
                  <Calendar className="h-4 w-4 mr-2" />
                  Set due date
                </Button>
              )}
            </div>

            {/* Priority */}
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-2">Priority</h4>
              <select
                value={task.priority}
                onChange={(e) => updateTask.mutate({ priority: e.target.value })}
                className="w-full p-2 rounded border bg-white dark:bg-gray-800"
              >
                <option value="NONE">None</option>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>

            {/* Attachments */}
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-2">
                Attachments ({task.attachments.length})
              </h4>
              <Button variant="ghost" size="sm" className="w-full justify-start">
                <Paperclip className="h-4 w-4 mr-2" />
                Add attachment
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

### Tasks API

```tsx
// app/api/tasks/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';

const createTaskSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  columnId: z.string(),
  projectId: z.string(),
  priority: z.enum(['NONE', 'LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  dueDate: z.string().datetime().optional(),
  assigneeIds: z.array(z.string()).optional(),
  labelIds: z.array(z.string()).optional(),
});

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const data = createTaskSchema.parse(body);

    // Get the highest position in the column
    const lastTask = await prisma.task.findFirst({
      where: { columnId: data.columnId },
      orderBy: { position: 'desc' },
      select: { position: true },
    });

    const position = (lastTask?.position ?? -1) + 1;

    const task = await prisma.task.create({
      data: {
        title: data.title,
        description: data.description,
        columnId: data.columnId,
        projectId: data.projectId,
        creatorId: session.user.id,
        priority: data.priority || 'NONE',
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        position,
        assignees: data.assigneeIds
          ? {
              create: data.assigneeIds.map((userId) => ({ userId })),
            }
          : undefined,
        labels: data.labelIds
          ? {
              create: data.labelIds.map((labelId) => ({ labelId })),
            }
          : undefined,
      },
      include: {
        assignees: { include: { user: true } },
        labels: { include: { label: true } },
        _count: { select: { subtasks: true, comments: true, attachments: true } },
      },
    });

    // Create activity
    await prisma.activity.create({
      data: {
        type: 'created',
        taskId: task.id,
        userId: session.user.id,
      },
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error('Create task error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

## Skills Used

| Skill | Layer | Purpose |
|-------|-------|---------|
| [dashboard-layout](../templates/dashboard-layout.md) | L5 | Main workspace layout |
| [dashboard-home](../templates/dashboard-home.md) | L5 | Project overview page |
| [settings-page](../templates/settings-page.md) | L5 | Workspace and project settings |
| [kanban-board](../organisms/kanban-board.md) | L4 | Drag-and-drop task board |
| [data-table](../organisms/data-table.md) | L4 | List view for tasks |
| [dialog](../organisms/dialog.md) | L4 | Task detail modal |
| [user-menu](../organisms/user-menu.md) | L4 | User profile dropdown |
| [optimistic-updates](../patterns/optimistic-updates.md) | L3 | Instant drag feedback |
| [rich-text-editor](../patterns/rich-text-editor.md) | L3 | Task descriptions |

## Testing

### Test Setup

```typescript
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

```typescript
// tests/setup.ts
import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
    back: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/',
}));

// Mock @dnd-kit
vi.mock('@dnd-kit/core', () => ({
  DndContext: ({ children }: { children: React.ReactNode }) => children,
  DragOverlay: ({ children }: { children: React.ReactNode }) => children,
  useSensor: vi.fn(),
  useSensors: vi.fn(() => []),
  closestCorners: vi.fn(),
  PointerSensor: vi.fn(),
  KeyboardSensor: vi.fn(),
}));
```

### Unit Tests

```typescript
// __tests__/components/task-card.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { TaskCard } from '@/components/board/task-card';
import { vi } from 'vitest';

const mockTask = {
  id: 'task-1',
  title: 'Implement login page',
  description: 'Create the login form with validation',
  position: 0,
  columnId: 'col-1',
  priority: 'HIGH',
  dueDate: '2025-02-15',
  assignees: [
    { user: { id: 'user-1', name: 'John Doe', avatar: null } }
  ],
  labels: [
    { label: { id: 'label-1', name: 'Frontend', color: '#3b82f6' } }
  ],
  _count: { subtasks: 3, comments: 5, attachments: 2 },
};

describe('TaskCard', () => {
  it('renders task title', () => {
    render(<TaskCard task={mockTask} />);
    expect(screen.getByText('Implement login page')).toBeInTheDocument();
  });

  it('displays priority indicator for high priority tasks', () => {
    render(<TaskCard task={mockTask} />);
    // Check for priority icon
    expect(document.querySelector('.text-orange-500')).toBeInTheDocument();
  });

  it('shows due date', () => {
    render(<TaskCard task={mockTask} />);
    expect(screen.getByText('Feb 15')).toBeInTheDocument();
  });

  it('displays assignee avatars', () => {
    render(<TaskCard task={mockTask} />);
    expect(screen.getByText('J')).toBeInTheDocument(); // Avatar fallback
  });

  it('shows task metadata counts', () => {
    render(<TaskCard task={mockTask} />);
    expect(screen.getByText('5')).toBeInTheDocument(); // Comments
    expect(screen.getByText('2')).toBeInTheDocument(); // Attachments
    expect(screen.getByText('3')).toBeInTheDocument(); // Subtasks
  });

  it('opens modal on click', () => {
    render(<TaskCard task={mockTask} />);
    fireEvent.click(screen.getByText('Implement login page'));
    // Modal should open (handled by state)
  });
});
```

### Integration Tests

```typescript
// __tests__/integration/kanban-board.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { KanbanBoard } from '@/components/board/kanban-board';

const mockColumns = [
  {
    id: 'col-1',
    name: 'To Do',
    position: 0,
    color: '#6b7280',
    taskLimit: null,
    tasks: [
      { id: 'task-1', title: 'Task 1', position: 0, columnId: 'col-1', priority: 'NONE', dueDate: null, assignees: [], labels: [], _count: { subtasks: 0, comments: 0, attachments: 0 } },
    ],
  },
  {
    id: 'col-2',
    name: 'In Progress',
    position: 1,
    color: '#3b82f6',
    taskLimit: 5,
    tasks: [],
  },
];

const server = setupServer(
  rest.patch('/api/tasks/:taskId', (req, res, ctx) => {
    return res(ctx.json({ success: true }));
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('KanbanBoard', () => {
  it('renders all columns', () => {
    render(<KanbanBoard projectId="proj-1" columns={mockColumns} />);
    expect(screen.getByText('To Do')).toBeInTheDocument();
    expect(screen.getByText('In Progress')).toBeInTheDocument();
  });

  it('shows task count per column', () => {
    render(<KanbanBoard projectId="proj-1" columns={mockColumns} />);
    expect(screen.getByText('1')).toBeInTheDocument(); // To Do count
  });

  it('displays WIP limit when set', () => {
    render(<KanbanBoard projectId="proj-1" columns={mockColumns} />);
    expect(screen.getByText('0/5')).toBeInTheDocument(); // In Progress limit
  });

  it('handles task move API call', async () => {
    render(<KanbanBoard projectId="proj-1" columns={mockColumns} />);
    // Simulate drag-and-drop (would need more setup for dnd-kit testing)
  });
});
```

### E2E Tests

```typescript
// e2e/kanban-workflow.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Kanban Workflow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
  });

  test('user can create a new task', async ({ page }) => {
    await page.goto('/project/test-project-123');

    // Click add task button in first column
    await page.click('text="Add Task"');

    // Fill task form
    await page.fill('input[placeholder="Task title"]', 'New Feature');
    await page.click('text="Create"');

    // Verify task appears
    await expect(page.locator('text="New Feature"')).toBeVisible();
  });

  test('user can drag task between columns', async ({ page }) => {
    await page.goto('/project/test-project-123');

    const task = page.locator('text="Existing Task"');
    const targetColumn = page.locator('text="In Progress"').locator('..');

    // Perform drag
    await task.dragTo(targetColumn);

    // Verify task moved
    await expect(task).toBeVisible();
  });

  test('user can open and edit task details', async ({ page }) => {
    await page.goto('/project/test-project-123');

    // Click on task
    await page.click('text="Existing Task"');

    // Modal should open
    await expect(page.locator('[role="dialog"]')).toBeVisible();

    // Edit title
    await page.fill('input[value="Existing Task"]', 'Updated Task');
    await page.keyboard.press('Tab'); // Blur to save

    // Verify update
    await expect(page.locator('text="Updated Task"')).toBeVisible();
  });

  test('user can add comment to task', async ({ page }) => {
    await page.goto('/project/test-project-123');

    await page.click('text="Existing Task"');
    await page.fill('textarea[placeholder="Add a comment..."]', 'Great progress!');
    await page.click('text="Post Comment"');

    await expect(page.locator('text="Great progress!"')).toBeVisible();
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
    console.error('Project management error:', error, errorInfo);
    // Send to error tracking service
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <AlertTriangle className="h-12 w-12 text-amber-500 mb-4" />
            <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
            <p className="text-gray-600 mb-4">
              We couldn't load your board. Your tasks are safe.
            </p>
            <button
              onClick={() => this.setState({ hasError: false })}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <RefreshCw className="h-4 w-4" />
              Reload Board
            </button>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
```

### API Error Handler

```typescript
// lib/api-errors.ts
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

export class TaskConflictError extends Error {
  constructor(
    message: string,
    public taskId: string,
    public expectedVersion: number
  ) {
    super(message);
    this.name = 'TaskConflictError';
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

  if (error instanceof TaskConflictError) {
    return Response.json(
      { error: error.message, taskId: error.taskId, conflict: true },
      { status: 409 }
    );
  }

  if (error instanceof Error) {
    return Response.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }

  return Response.json({ error: 'Unknown error' }, { status: 500 });
}
```

## Accessibility

```tsx
// components/accessible-kanban.tsx
'use client';

import { useCallback, useRef } from 'react';

interface AccessibleKanbanProps {
  columns: Array<{
    id: string;
    name: string;
    tasks: Array<{ id: string; title: string }>;
  }>;
  onTaskMove: (taskId: string, columnId: string, position: number) => void;
}

export function AccessibleKanban({ columns, onTaskMove }: AccessibleKanbanProps) {
  const announceRef = useRef<HTMLDivElement>(null);

  const announce = useCallback((message: string) => {
    if (announceRef.current) {
      announceRef.current.textContent = message;
    }
  }, []);

  const handleKeyDown = (
    e: React.KeyboardEvent,
    taskId: string,
    currentColumnIndex: number,
    currentTaskIndex: number
  ) => {
    if (e.key === 'ArrowRight' && currentColumnIndex < columns.length - 1) {
      e.preventDefault();
      const targetColumn = columns[currentColumnIndex + 1];
      onTaskMove(taskId, targetColumn.id, 0);
      announce(`Task moved to ${targetColumn.name}`);
    }

    if (e.key === 'ArrowLeft' && currentColumnIndex > 0) {
      e.preventDefault();
      const targetColumn = columns[currentColumnIndex - 1];
      onTaskMove(taskId, targetColumn.id, 0);
      announce(`Task moved to ${targetColumn.name}`);
    }
  };

  return (
    <div role="application" aria-label="Kanban board">
      {/* Live region for announcements */}
      <div
        ref={announceRef}
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      />

      <div className="flex gap-4" role="list" aria-label="Board columns">
        {columns.map((column, columnIndex) => (
          <div
            key={column.id}
            role="listitem"
            aria-label={`${column.name} column with ${column.tasks.length} tasks`}
            className="flex-shrink-0 w-72 bg-gray-100 rounded-xl"
          >
            <h2 className="p-3 font-semibold">{column.name}</h2>

            <div
              role="list"
              aria-label={`Tasks in ${column.name}`}
              className="p-2 space-y-2"
            >
              {column.tasks.map((task, taskIndex) => (
                <div
                  key={task.id}
                  role="listitem"
                  tabIndex={0}
                  onKeyDown={(e) =>
                    handleKeyDown(e, task.id, columnIndex, taskIndex)
                  }
                  aria-label={`${task.title}. Press arrow keys to move between columns.`}
                  className="bg-white p-3 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {task.title}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Keyboard instructions */}
      <div className="sr-only">
        Use arrow keys to navigate between tasks. Press left or right arrow
        to move a task between columns.
      </div>
    </div>
  );
}

// WCAG 2.1 AA Compliance Checklist:
// - Keyboard navigation for all drag-and-drop operations
// - Live region announcements for state changes
// - Focus management during drag operations
// - Clear visual focus indicators
// - Semantic HTML structure with proper ARIA roles
// - Screen reader instructions for keyboard shortcuts
```

## Security

### Input Validation

```typescript
// lib/validation/task.ts
import { z } from 'zod';

export const createTaskSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title must be less than 200 characters'),
  description: z.string().max(10000).optional(),
  columnId: z.string().cuid(),
  projectId: z.string().cuid(),
  priority: z.enum(['NONE', 'LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  dueDate: z.string().datetime().optional(),
  assigneeIds: z.array(z.string().cuid()).max(20).optional(),
  labelIds: z.array(z.string().cuid()).max(10).optional(),
});

export const updateTaskSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(10000).optional(),
  columnId: z.string().cuid().optional(),
  position: z.number().int().min(0).optional(),
  priority: z.enum(['NONE', 'LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  dueDate: z.string().datetime().nullable().optional(),
});

export const commentSchema = z.object({
  content: z
    .string()
    .min(1, 'Comment cannot be empty')
    .max(5000, 'Comment must be less than 5000 characters'),
  taskId: z.string().cuid(),
  parentId: z.string().cuid().optional(),
});

// Sanitize rich text content
export function sanitizeDescription(html: string): string {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+="[^"]*"/gi, '')
    .replace(/javascript:/gi, '');
}
```

### Rate Limiting

```typescript
// lib/rate-limit.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export const rateLimits = {
  // Task creation: 100 per hour
  createTask: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(100, '1 h'),
    prefix: 'ratelimit:create-task',
  }),

  // Task updates: 500 per minute (for drag-and-drop)
  updateTask: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(500, '1 m'),
    prefix: 'ratelimit:update-task',
  }),

  // Comments: 50 per 10 minutes
  comment: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(50, '10 m'),
    prefix: 'ratelimit:comment',
  }),

  // File uploads: 20 per hour
  upload: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(20, '1 h'),
    prefix: 'ratelimit:upload',
  }),
};

export async function checkRateLimit(
  limiter: Ratelimit,
  identifier: string
): Promise<{ success: boolean; remaining: number; reset: number }> {
  const { success, remaining, reset } = await limiter.limit(identifier);
  return { success, remaining, reset };
}
```

## Performance

### Caching Strategies

```typescript
// lib/cache.ts
import { unstable_cache } from 'next/cache';
import { prisma } from './prisma';

// Cache board data for 30 seconds (frequently changing)
export const getCachedBoard = unstable_cache(
  async (projectId: string) => {
    return prisma.column.findMany({
      where: { projectId },
      orderBy: { position: 'asc' },
      include: {
        tasks: {
          orderBy: { position: 'asc' },
          include: {
            assignees: { include: { user: true } },
            labels: { include: { label: true } },
            _count: { select: { subtasks: true, comments: true, attachments: true } },
          },
        },
      },
    });
  },
  ['board'],
  { revalidate: 30, tags: ['board'] }
);

// Cache project metadata for 5 minutes
export const getCachedProject = unstable_cache(
  async (projectId: string) => {
    return prisma.project.findUnique({
      where: { id: projectId },
      include: {
        workspace: true,
        _count: { select: { tasks: true, columns: true } },
      },
    });
  },
  ['project'],
  { revalidate: 300, tags: ['projects'] }
);

// Optimistic updates - no server cache for real-time feel
export async function revalidateBoardCache(projectId: string) {
  const { revalidateTag } = await import('next/cache');
  revalidateTag('board');
  revalidateTag(`board-${projectId}`);
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
  DATABASE_URL: ${{ secrets.DATABASE_URL }}

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
      - run: npm run type-check

  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: kanban_test
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npx prisma migrate deploy
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/kanban_test
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
      - uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/

  deploy:
    needs: [lint, test, e2e]
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

### Sentry Integration

```typescript
// sentry.client.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  integrations: [
    Sentry.replayIntegration({
      maskAllText: false,
      blockAllMedia: false,
    }),
  ],
});
```

### Health Checks

```typescript
// app/api/health/route.ts
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      database: 'unknown',
      cache: 'unknown',
    },
  };

  try {
    // Check database
    await prisma.$queryRaw`SELECT 1`;
    health.services.database = 'healthy';
  } catch {
    health.services.database = 'unhealthy';
    health.status = 'degraded';
  }

  const statusCode = health.status === 'healthy' ? 200 : 503;
  return NextResponse.json(health, { status: statusCode });
}
```

## Environment Variables

```bash
# .env.example

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/kanban"

# Authentication
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-min-32-chars"

# File uploads (UploadThing)
UPLOADTHING_SECRET="sk_live_your-uploadthing-secret"
UPLOADTHING_APP_ID="your-app-id"

# Redis (for rate limiting and real-time)
UPSTASH_REDIS_REST_URL="https://your-redis.upstash.io"
UPSTASH_REDIS_REST_TOKEN="your-redis-token"

# Real-time (optional - Pusher/Ably)
PUSHER_APP_ID="your-pusher-app-id"
PUSHER_KEY="your-pusher-key"
PUSHER_SECRET="your-pusher-secret"
PUSHER_CLUSTER="us2"
NEXT_PUBLIC_PUSHER_KEY="your-pusher-key"

# Monitoring
NEXT_PUBLIC_SENTRY_DSN="https://your-sentry-dsn@sentry.io/project"

# App Config
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_APP_NAME="TaskBoard"
```

## Deployment Checklist

- [ ] **Environment Setup**
  - [ ] All environment variables configured in production
  - [ ] Database connection string uses connection pooling
  - [ ] File upload limits configured
  - [ ] Real-time service (if used) configured

- [ ] **Database**
  - [ ] Run `prisma migrate deploy` on production
  - [ ] Indexes created for frequent queries (columnId, projectId)
  - [ ] Database backups configured

- [ ] **Security**
  - [ ] NEXTAUTH_SECRET is unique and secure (32+ chars)
  - [ ] Rate limiting enabled for task operations
  - [ ] CORS configured for production domain only
  - [ ] CSP headers configured

- [ ] **Performance**
  - [ ] Optimistic updates working for drag-and-drop
  - [ ] Board data efficiently queried with includes
  - [ ] WebSocket/real-time configured for collaboration
  - [ ] Static assets cached via CDN

- [ ] **Monitoring**
  - [ ] Sentry error tracking configured
  - [ ] Health check endpoint accessible
  - [ ] Performance metrics tracked
  - [ ] Log aggregation set up

- [ ] **Testing**
  - [ ] All tests passing in CI
  - [ ] E2E tests for critical workflows
  - [ ] Drag-and-drop tested across browsers
  - [ ] Keyboard navigation tested

## Related Skills

- [Drag and Drop](../patterns/drag-and-drop.md) - DnD functionality
- [Real-time Updates](../patterns/real-time-updates.md) - Live collaboration
- [Optimistic Updates](../patterns/optimistic-updates.md) - Instant feedback
- [Keyboard Navigation](../patterns/keyboard-navigation.md) - Accessibility
- [Rich Text Editor](../patterns/rich-text-editor.md) - Task descriptions

## Changelog

### 1.0.0 (2025-01-17)

- Initial implementation with Kanban board
- Drag-and-drop with @dnd-kit
- Task cards with labels, assignees, due dates
- Task detail modal with comments and activity
- Column management with WIP limits
- Priority and status tracking
