---
id: pt-drag-drop
name: Drag and Drop
version: 2.0.0
layer: L5
category: browser
description: Drag and drop patterns with sortable lists and file drops
tags: [drag-drop, dnd, sortable, reorder, file-upload]
composes:
  - ../molecules/card.md
dependencies:
  @dnd-kit/core: "^6.3.0"
formula: @dnd-kit + Sensors + Collision Detection = Accessible Drag & Drop
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

## When to Use

- Building sortable/reorderable lists
- Creating Kanban boards with columns
- Implementing file drag and drop zones
- Supporting keyboard and touch dragging
- Multi-container drag operations

## Composition Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ @dnd-kit Architecture                                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ DndContext                                          │   │
│  │ ┌─────────────────────────────────────────────────┐ │   │
│  │ │ Sensors:                                        │ │   │
│  │ │ - PointerSensor (mouse/touch)                   │ │   │
│  │ │ - KeyboardSensor (arrow keys)                   │ │   │
│  │ │ - TouchSensor (mobile)                          │ │   │
│  │ └─────────────────────────────────────────────────┘ │   │
│  │                                                     │   │
│  │ ┌─────────────────────────────────────────────────┐ │   │
│  │ │ SortableContext                                 │ │   │
│  │ │ ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐      │ │   │
│  │ │ │Item 1 │ │Item 2 │ │Item 3 │ │Item 4 │      │ │   │
│  │ │ │useSor-│ │useSor-│ │useSor-│ │useSor-│      │ │   │
│  │ │ │table  │ │table  │ │table  │ │table  │      │ │   │
│  │ │ └───────┘ └───────┘ └───────┘ └───────┘      │ │   │
│  │ └─────────────────────────────────────────────────┘ │   │
│  │                                                     │   │
│  │ DragOverlay (Preview while dragging)               │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

# Drag and Drop

## Overview

Comprehensive drag and drop patterns using @dnd-kit for sortable lists, Kanban boards, file uploads, and multi-container drag operations.

## Implementation

### Sortable List

```tsx
// components/dnd/sortable-list.tsx
'use client';

import { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';

interface SortableItem {
  id: string;
  content: React.ReactNode;
}

interface SortableListProps {
  items: SortableItem[];
  onReorder: (items: SortableItem[]) => void;
  renderItem?: (item: SortableItem, isDragging: boolean) => React.ReactNode;
}

export function SortableList({ items, onReorder, renderItem }: SortableListProps) {
  const [activeId, setActiveId] = useState<string | null>(null);

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

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);
      onReorder(arrayMove(items, oldIndex, newIndex));
    }

    setActiveId(null);
  };

  const activeItem = items.find((item) => item.id === activeId);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={items} strategy={verticalListSortingStrategy}>
        <ul className="space-y-2">
          {items.map((item) => (
            <SortableItem
              key={item.id}
              item={item}
              renderItem={renderItem}
            />
          ))}
        </ul>
      </SortableContext>

      <DragOverlay>
        {activeItem && renderItem ? (
          renderItem(activeItem, true)
        ) : activeItem ? (
          <DefaultItem item={activeItem} isDragging />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

function SortableItem({
  item,
  renderItem,
}: {
  item: SortableItem;
  renderItem?: (item: SortableItem, isDragging: boolean) => React.ReactNode;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  if (renderItem) {
    return (
      <li ref={setNodeRef} style={style} {...attributes} {...listeners}>
        {renderItem(item, isDragging)}
      </li>
    );
  }

  return (
    <li ref={setNodeRef} style={style}>
      <DefaultItem
        item={item}
        isDragging={isDragging}
        dragHandleProps={{ ...attributes, ...listeners }}
      />
    </li>
  );
}

function DefaultItem({
  item,
  isDragging,
  dragHandleProps,
}: {
  item: SortableItem;
  isDragging?: boolean;
  dragHandleProps?: React.HTMLAttributes<HTMLButtonElement>;
}) {
  return (
    <div
      className={`flex items-center gap-3 rounded-lg border bg-white p-4 ${
        isDragging
          ? 'border-blue-500 shadow-lg'
          : 'border-gray-200 dark:border-gray-700'
      } dark:bg-gray-900`}
    >
      <button
        type="button"
        className="cursor-grab touch-none text-gray-400 hover:text-gray-600 active:cursor-grabbing dark:text-gray-500 dark:hover:text-gray-300"
        {...dragHandleProps}
        aria-label="Drag to reorder"
      >
        <GripVertical className="h-5 w-5" />
      </button>
      <div className="flex-1">{item.content}</div>
    </div>
  );
}
```

### Kanban Board

```tsx
// components/dnd/kanban-board.tsx
'use client';

import { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Plus, GripVertical } from 'lucide-react';

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

interface KanbanBoardProps {
  columns: Column[];
  onColumnsChange: (columns: Column[]) => void;
}

export function KanbanBoard({ columns, onColumnsChange }: KanbanBoardProps) {
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = columns
      .flatMap((col) => col.tasks)
      .find((t) => t.id === active.id);
    setActiveTask(task || null);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Find containers
    const activeColumn = columns.find((col) =>
      col.tasks.some((t) => t.id === activeId)
    );
    const overColumn =
      columns.find((col) => col.id === overId) ||
      columns.find((col) => col.tasks.some((t) => t.id === overId));

    if (!activeColumn || !overColumn || activeColumn.id === overColumn.id) {
      return;
    }

    // Move task to new column
    const activeTask = activeColumn.tasks.find((t) => t.id === activeId)!;
    const newColumns = columns.map((col) => {
      if (col.id === activeColumn.id) {
        return {
          ...col,
          tasks: col.tasks.filter((t) => t.id !== activeId),
        };
      }
      if (col.id === overColumn.id) {
        const overIndex = col.tasks.findIndex((t) => t.id === overId);
        const insertIndex = overIndex >= 0 ? overIndex : col.tasks.length;
        return {
          ...col,
          tasks: [
            ...col.tasks.slice(0, insertIndex),
            activeTask,
            ...col.tasks.slice(insertIndex),
          ],
        };
      }
      return col;
    });

    onColumnsChange(newColumns);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    if (activeId === overId) return;

    const activeColumn = columns.find((col) =>
      col.tasks.some((t) => t.id === activeId)
    );

    if (!activeColumn) return;

    // Reorder within same column
    const oldIndex = activeColumn.tasks.findIndex((t) => t.id === activeId);
    const newIndex = activeColumn.tasks.findIndex((t) => t.id === overId);

    if (oldIndex !== -1 && newIndex !== -1) {
      const newColumns = columns.map((col) => {
        if (col.id === activeColumn.id) {
          return {
            ...col,
            tasks: arrayMove(col.tasks, oldIndex, newIndex),
          };
        }
        return col;
      });
      onColumnsChange(newColumns);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4">
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

function KanbanColumn({ column }: { column: Column }) {
  return (
    <div className="w-72 flex-shrink-0 rounded-lg bg-gray-100 p-4 dark:bg-gray-800">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-semibold text-gray-900 dark:text-white">
          {column.title}
        </h3>
        <span className="rounded-full bg-gray-200 px-2 py-0.5 text-sm text-gray-600 dark:bg-gray-700 dark:text-gray-400">
          {column.tasks.length}
        </span>
      </div>

      <SortableContext
        items={column.tasks.map((t) => t.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-2">
          {column.tasks.map((task) => (
            <SortableTaskCard key={task.id} task={task} />
          ))}
        </div>
      </SortableContext>

      <button className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 py-2 text-sm text-gray-500 hover:border-gray-400 hover:text-gray-600 dark:border-gray-600 dark:text-gray-400">
        <Plus className="h-4 w-4" />
        Add Task
      </button>
    </div>
  );
}

function SortableTaskCard({ task }: { task: Task }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <TaskCard task={task} isDragging={isDragging} />
    </div>
  );
}

function TaskCard({ task, isDragging }: { task: Task; isDragging?: boolean }) {
  return (
    <div
      className={`cursor-grab rounded-lg border bg-white p-3 shadow-sm active:cursor-grabbing dark:bg-gray-900 ${
        isDragging
          ? 'border-blue-500 opacity-90 shadow-lg'
          : 'border-gray-200 dark:border-gray-700'
      }`}
    >
      <h4 className="font-medium text-gray-900 dark:text-white">{task.title}</h4>
      {task.description && (
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {task.description}
        </p>
      )}
    </div>
  );
}
```

### File Drop Zone

```tsx
// components/dnd/file-drop-zone.tsx
'use client';

import { useState, useCallback, useRef } from 'react';
import { Upload, X, File, Image, FileText, Loader2 } from 'lucide-react';

interface FileDropZoneProps {
  accept?: string;
  multiple?: boolean;
  maxSize?: number; // in bytes
  maxFiles?: number;
  onFilesSelected: (files: File[]) => void;
  onUpload?: (files: File[]) => Promise<void>;
}

export function FileDropZone({
  accept,
  multiple = true,
  maxSize = 10 * 1024 * 1024, // 10MB
  maxFiles = 10,
  onFilesSelected,
  onUpload,
}: FileDropZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateFiles = useCallback(
    (fileList: FileList | File[]): { valid: File[]; errors: string[] } => {
      const valid: File[] = [];
      const errors: string[] = [];
      const fileArray = Array.from(fileList);

      if (fileArray.length > maxFiles) {
        errors.push(`Maximum ${maxFiles} files allowed`);
        return { valid, errors };
      }

      for (const file of fileArray) {
        if (file.size > maxSize) {
          errors.push(`${file.name} exceeds maximum size of ${formatBytes(maxSize)}`);
          continue;
        }

        if (accept) {
          const acceptedTypes = accept.split(',').map((t) => t.trim());
          const isAccepted = acceptedTypes.some((type) => {
            if (type.startsWith('.')) {
              return file.name.endsWith(type);
            }
            if (type.endsWith('/*')) {
              return file.type.startsWith(type.replace('/*', '/'));
            }
            return file.type === type;
          });

          if (!isAccepted) {
            errors.push(`${file.name} is not an accepted file type`);
            continue;
          }
        }

        valid.push(file);
      }

      return { valid, errors };
    },
    [accept, maxSize, maxFiles]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);

      const { valid, errors } = validateFiles(e.dataTransfer.files);
      setErrors(errors);

      if (valid.length > 0) {
        const newFiles = multiple ? [...files, ...valid] : valid.slice(0, 1);
        setFiles(newFiles);
        onFilesSelected(newFiles);
      }
    },
    [files, multiple, onFilesSelected, validateFiles]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!e.target.files) return;

      const { valid, errors } = validateFiles(e.target.files);
      setErrors(errors);

      if (valid.length > 0) {
        const newFiles = multiple ? [...files, ...valid] : valid.slice(0, 1);
        setFiles(newFiles);
        onFilesSelected(newFiles);
      }
    },
    [files, multiple, onFilesSelected, validateFiles]
  );

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
    onFilesSelected(newFiles);
  };

  const handleUpload = async () => {
    if (!onUpload || files.length === 0) return;

    setIsUploading(true);
    try {
      await onUpload(files);
      setFiles([]);
    } catch (error) {
      setErrors(['Upload failed. Please try again.']);
    } finally {
      setIsUploading(false);
    }
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return Image;
    if (file.type.includes('pdf') || file.type.includes('document')) return FileText;
    return File;
  };

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`flex min-h-[160px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors ${
          isDragOver
            ? 'border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-900/20'
            : 'border-gray-300 hover:border-gray-400 dark:border-gray-700 dark:hover:border-gray-600'
        }`}
      >
        <Upload
          className={`h-10 w-10 ${
            isDragOver ? 'text-blue-500' : 'text-gray-400'
          }`}
        />
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          <span className="font-medium text-blue-600 dark:text-blue-400">
            Click to upload
          </span>{' '}
          or drag and drop
        </p>
        <p className="mt-1 text-xs text-gray-500">
          {accept || 'Any file type'} up to {formatBytes(maxSize)}
        </p>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleInputChange}
        className="hidden"
      />

      {/* Errors */}
      {errors.length > 0 && (
        <div className="rounded-lg bg-red-50 p-3 dark:bg-red-900/20">
          {errors.map((error, i) => (
            <p key={i} className="text-sm text-red-600 dark:text-red-400">
              {error}
            </p>
          ))}
        </div>
      )}

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file, index) => {
            const Icon = getFileIcon(file);
            return (
              <div
                key={`${file.name}-${index}`}
                className="flex items-center gap-3 rounded-lg border border-gray-200 p-3 dark:border-gray-700"
              >
                <Icon className="h-8 w-8 text-gray-400" />
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-500">{formatBytes(file.size)}</p>
                </div>
                <button
                  onClick={() => removeFile(index)}
                  className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            );
          })}

          {onUpload && (
            <button
              onClick={handleUpload}
              disabled={isUploading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  Upload {files.length} file{files.length > 1 ? 's' : ''}
                </>
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
```

## Usage

```tsx
// Sortable list
import { SortableList } from '@/components/dnd/sortable-list';

function TodoList() {
  const [items, setItems] = useState([
    { id: '1', content: 'Task 1' },
    { id: '2', content: 'Task 2' },
  ]);

  return (
    <SortableList
      items={items}
      onReorder={setItems}
    />
  );
}

// Kanban board
import { KanbanBoard } from '@/components/dnd/kanban-board';

function ProjectBoard() {
  const [columns, setColumns] = useState([
    { id: 'todo', title: 'To Do', tasks: [] },
    { id: 'in-progress', title: 'In Progress', tasks: [] },
    { id: 'done', title: 'Done', tasks: [] },
  ]);

  return (
    <KanbanBoard
      columns={columns}
      onColumnsChange={setColumns}
    />
  );
}

// File drop zone
import { FileDropZone } from '@/components/dnd/file-drop-zone';

function FileUploader() {
  const handleUpload = async (files: File[]) => {
    const formData = new FormData();
    files.forEach(f => formData.append('files', f));
    await fetch('/api/upload', { method: 'POST', body: formData });
  };

  return (
    <FileDropZone
      accept="image/*,.pdf"
      maxSize={5 * 1024 * 1024}
      onFilesSelected={(files) => console.log(files)}
      onUpload={handleUpload}
    />
  );
}
```

## Related Skills

- [L2/sortable-item](../molecules/sortable-item.md) - Sortable item molecule
- [L5/file-upload](./file-upload.md) - File upload patterns
- [L3/kanban-board](../organisms/kanban-board.md) - Kanban organism

## Changelog

### 2.0.0 (2025-01-17)
- Standardized to atomic design system v2
- Updated frontmatter schema

### 1.0.0 (2025-01-17)
- Initial implementation with @dnd-kit
