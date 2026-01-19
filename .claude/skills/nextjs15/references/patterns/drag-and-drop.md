---
id: pt-drag-and-drop
name: Drag and Drop
version: 1.0.0
layer: L5
category: interaction
description: Implement drag and drop functionality using @dnd-kit for sortable lists, kanban boards, and file uploads
tags: [dnd, drag-drop, sortable, kanban, dnd-kit, next15, react19]
composes:
  - ../organisms/kanban-board.md
dependencies:
  @dnd-kit/core: "^6.3.0"
formula: "DragAndDrop = DndContext + SortableContext + DraggableItem + DroppableContainer"
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# Drag and Drop

## When to Use

- When building kanban boards or task management interfaces
- For sortable lists and reorderable items
- When implementing file upload with drag and drop
- For dashboard widget rearrangement
- When creating tree views with drag-to-reorder

## Overview

This pattern implements drag and drop using @dnd-kit, the recommended library for React drag and drop interactions. It provides accessible, performant, and flexible drag and drop for sortable lists, kanban boards, and more.

## Installation

```bash
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

## Basic Sortable List

```typescript
// components/sortable-list.tsx
"use client";

import { useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";

interface Item {
  id: string;
  content: string;
}

function SortableItem({ id, content }: Item) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-2 p-3 bg-card border rounded-lg"
    >
      <button
        className="cursor-grab active:cursor-grabbing touch-none"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </button>
      <span>{content}</span>
    </div>
  );
}

export function SortableList({
  items: initialItems,
  onReorder,
}: {
  items: Item[];
  onReorder?: (items: Item[]) => void;
}) {
  const [items, setItems] = useState(initialItems);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        const newItems = arrayMove(items, oldIndex, newIndex);
        onReorder?.(newItems);
        return newItems;
      });
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={items} strategy={verticalListSortingStrategy}>
        <div className="space-y-2">
          {items.map((item) => (
            <SortableItem key={item.id} {...item} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
```

## Kanban Board

```typescript
// components/kanban/kanban-board.tsx
"use client";

import { useState } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { KanbanColumn } from "./kanban-column";
import { TaskCard } from "./task-card";

interface Task {
  id: string;
  title: string;
  description?: string;
}

interface Column {
  id: string;
  title: string;
  tasks: Task[];
}

export function KanbanBoard({
  columns: initialColumns,
  onUpdate,
}: {
  columns: Column[];
  onUpdate?: (columns: Column[]) => void;
}) {
  const [columns, setColumns] = useState(initialColumns);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function findColumn(taskId: string) {
    return columns.find((col) => col.tasks.some((task) => task.id === taskId));
  }

  function handleDragStart(event: DragStartEvent) {
    const { active } = event;
    const column = findColumn(active.id as string);
    const task = column?.tasks.find((t) => t.id === active.id);
    setActiveTask(task || null);
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;

    const activeColumn = findColumn(active.id as string);
    const overColumn = columns.find(
      (col) => col.id === over.id || col.tasks.some((t) => t.id === over.id)
    );

    if (!activeColumn || !overColumn || activeColumn.id === overColumn.id) return;

    setColumns((cols) => {
      const activeTask = activeColumn.tasks.find((t) => t.id === active.id)!;

      return cols.map((col) => {
        if (col.id === activeColumn.id) {
          return { ...col, tasks: col.tasks.filter((t) => t.id !== active.id) };
        }
        if (col.id === overColumn.id) {
          const overIndex = col.tasks.findIndex((t) => t.id === over.id);
          const newTasks = [...col.tasks];
          newTasks.splice(overIndex >= 0 ? overIndex : newTasks.length, 0, activeTask);
          return { ...col, tasks: newTasks };
        }
        return col;
      });
    });
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const activeColumn = findColumn(active.id as string);
    if (!activeColumn) return;

    const oldIndex = activeColumn.tasks.findIndex((t) => t.id === active.id);
    const newIndex = activeColumn.tasks.findIndex((t) => t.id === over.id);

    if (oldIndex !== newIndex) {
      setColumns((cols) =>
        cols.map((col) => {
          if (col.id === activeColumn.id) {
            return { ...col, tasks: arrayMove(col.tasks, oldIndex, newIndex) };
          }
          return col;
        })
      );
    }

    onUpdate?.(columns);
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto p-4">
        {columns.map((column) => (
          <KanbanColumn key={column.id} column={column} />
        ))}
      </div>
      <DragOverlay>
        {activeTask && <TaskCard task={activeTask} isDragging />}
      </DragOverlay>
    </DndContext>
  );
}
```

## Server Action for Persisting Order

```typescript
// app/actions/reorder.ts
"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";

export async function reorderItems(
  items: { id: string; order: number }[]
) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  await prisma.$transaction(
    items.map(({ id, order }) =>
      prisma.item.update({
        where: { id },
        data: { order },
      })
    )
  );

  revalidatePath("/items");
}

export async function moveTask(
  taskId: string,
  targetColumnId: string,
  newOrder: number
) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  await prisma.task.update({
    where: { id: taskId },
    data: {
      columnId: targetColumnId,
      order: newOrder,
    },
  });

  revalidatePath("/board");
}
```

## File Drop Zone

```typescript
// components/file-drop-zone.tsx
"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, X, File } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileDropZoneProps {
  onFilesSelected: (files: File[]) => void;
  maxFiles?: number;
  maxSize?: number;
  accept?: Record<string, string[]>;
}

export function FileDropZone({
  onFilesSelected,
  maxFiles = 5,
  maxSize = 10 * 1024 * 1024,
  accept = { "image/*": [".png", ".jpg", ".jpeg", ".gif"] },
}: FileDropZoneProps) {
  const [files, setFiles] = useState<File[]>([]);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const newFiles = [...files, ...acceptedFiles].slice(0, maxFiles);
      setFiles(newFiles);
      onFilesSelected(newFiles);
    },
    [files, maxFiles, onFilesSelected]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles,
    maxSize,
    accept,
  });

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
    onFilesSelected(newFiles);
  };

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
          isDragActive
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25 hover:border-primary/50"
        )}
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
        <p className="mt-2 text-sm text-muted-foreground">
          {isDragActive
            ? "Drop the files here..."
            : "Drag & drop files here, or click to select"}
        </p>
      </div>

      {files.length > 0 && (
        <ul className="space-y-2">
          {files.map((file, index) => (
            <li
              key={index}
              className="flex items-center justify-between p-2 bg-muted rounded"
            >
              <div className="flex items-center gap-2">
                <File className="h-4 w-4" />
                <span className="text-sm truncate">{file.name}</span>
              </div>
              <button
                onClick={() => removeFile(index)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

## Anti-patterns

### Don't Forget Accessibility

```typescript
// BAD - No keyboard support
<div onMouseDown={handleDrag}>Drag me</div>

// GOOD - Use sensors with keyboard support
const sensors = useSensors(
  useSensor(PointerSensor),
  useSensor(KeyboardSensor, {
    coordinateGetter: sortableKeyboardCoordinates,
  })
);
```

### Don't Update State on Every Drag Move

```typescript
// BAD - Expensive updates
onDragMove={(event) => {
  saveToDatabase(event.active.id, event.delta);
}}

// GOOD - Update only on drag end
onDragEnd={(event) => {
  saveToDatabase(event.active.id, event.over?.id);
}}
```

## Related Patterns

- [virtual-scroll](./virtual-scroll.md)
- [optimistic-updates](./optimistic-updates.md)
- [server-actions](./server-actions.md)

---

## Changelog

### 1.0.0 (2025-01-18)
- Initial implementation
- Sortable list pattern
- Kanban board pattern
- File drop zone
- Server action persistence
