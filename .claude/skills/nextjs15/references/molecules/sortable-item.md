---
id: m-sortable-item
name: Sortable Item
version: 2.0.0
layer: L2
category: interactive
description: Drag-and-drop sortable item with handle, keyboard support, and animations
tags: [drag, drop, sortable, reorder, dnd]
performance:
  impact: low
  lcp: neutral
  cls: low
formula: "SortableItem = DragHandle(a-input-button) + Content(children) + DisplayIcon(a-display-icon) + DndKitContext"
composes:
  - ../atoms/display-icon.md
  - ../atoms/input-button.md
dependencies:
  react: "^19.0.0"
  "@dnd-kit/core": "^6.1.0"
  "@dnd-kit/sortable": "^8.0.0"
  "@dnd-kit/utilities": "^3.2.2"
  lucide-react: "^0.460.0"
  class-variance-authority: "^0.7.1"
accessibility:
  wcag: AA
  keyboard: true
  screen-reader: true
---

# Sortable Item

## Overview

A drag-and-drop sortable item molecule built with dnd-kit. Supports drag handles, keyboard reordering, touch devices, and smooth animations. Use with SortableList to create reorderable lists.

## When to Use

Use this skill when:
- Building reorderable lists or grids
- Creating kanban boards with draggable cards
- Implementing file/image galleries with reordering
- Building task managers with priority ordering

## Composition Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                       SortableItem (L2)                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                   DndContext (dnd-kit)                     │  │
│  │  ┌─────────────────────────────────────────────────────┐  │  │
│  │  │              SortableContext (dnd-kit)              │  │  │
│  │  │                                                     │  │  │
│  │  │  ┌───────────────────────────────────────────────┐  │  │  │
│  │  │  │            Item Container                     │  │  │  │
│  │  │  │  ┌────────┐  ┌──────────────────┐  ┌───────┐  │  │  │  │
│  │  │  │  │ Handle │  │    Content       │  │Trailing│  │  │  │  │
│  │  │  │  │(a-input│  │   (children)     │  │ Action │  │  │  │  │
│  │  │  │  │-button)│  │                  │  │        │  │  │  │  │
│  │  │  │  │   ⋮⋮   │  │  Task title...   │  │   ✕    │  │  │  │  │
│  │  │  │  │        │  │                  │  │        │  │  │  │  │
│  │  │  │  └────────┘  └──────────────────┘  └───────┘  │  │  │  │
│  │  │  └───────────────────────────────────────────────┘  │  │  │
│  │  │                                                     │  │  │
│  │  └─────────────────────────────────────────────────────┘  │  │
│  │                                                           │  │
│  │  ┌─────────────────────────────────────────────────────┐  │  │
│  │  │            DragOverlay (floating preview)           │  │  │
│  │  └─────────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Implementation

```tsx
// components/molecules/sortable-item.tsx
'use client';

import * as React from 'react';
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
  UniqueIdentifier,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cva, type VariantProps } from 'class-variance-authority';
import { GripVertical, GripHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';

// Types
interface SortableItemProps extends VariantProps<typeof sortableItemVariants> {
  id: string | number;
  children: React.ReactNode;
  handle?: boolean;
  disabled?: boolean;
  className?: string;
}

interface SortableListProps<T extends { id: string | number }> {
  items: T[];
  onReorder: (items: T[]) => void;
  renderItem: (item: T, index: number) => React.ReactNode;
  direction?: 'vertical' | 'horizontal';
  handle?: boolean;
  disabled?: boolean;
  className?: string;
  itemClassName?: string;
}

// Styles
const sortableItemVariants = cva(
  'relative flex items-center gap-2 rounded-lg border bg-background transition-all',
  {
    variants: {
      variant: {
        default: 'border-border',
        ghost: 'border-transparent bg-transparent',
        card: 'border-border shadow-sm',
      },
      size: {
        sm: 'p-2',
        md: 'p-3',
        lg: 'p-4',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

// Drag Handle Component
interface DragHandleProps {
  direction?: 'vertical' | 'horizontal';
  className?: string;
  listeners?: Record<string, Function>;
  attributes?: Record<string, unknown>;
}

export function DragHandle({
  direction = 'vertical',
  className,
  listeners,
  attributes,
}: DragHandleProps) {
  const Icon = direction === 'vertical' ? GripVertical : GripHorizontal;

  return (
    <button
      type="button"
      className={cn(
        'flex-shrink-0 cursor-grab touch-none rounded p-1',
        'text-muted-foreground hover:text-foreground hover:bg-accent',
        'focus:outline-none focus:ring-2 focus:ring-ring',
        'active:cursor-grabbing',
        className
      )}
      {...listeners}
      {...attributes}
    >
      <Icon className="h-4 w-4" />
      <span className="sr-only">Drag to reorder</span>
    </button>
  );
}

// Sortable Item Component
export function SortableItem({
  id,
  children,
  handle = true,
  disabled = false,
  variant,
  size,
  className,
}: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
    isSorting,
  } = useSortable({
    id,
    disabled,
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        sortableItemVariants({ variant, size }),
        isDragging && 'opacity-50 shadow-lg ring-2 ring-primary',
        isSorting && 'cursor-grabbing',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      {...(!handle ? { ...attributes, ...listeners } : {})}
    >
      {handle && !disabled && (
        <DragHandle listeners={listeners} attributes={attributes} />
      )}
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}

// Sortable List Container
export function SortableList<T extends { id: string | number }>({
  items,
  onReorder,
  renderItem,
  direction = 'vertical',
  handle = true,
  disabled = false,
  className,
  itemClassName,
}: SortableListProps<T>) {
  const [activeId, setActiveId] = React.useState<UniqueIdentifier | null>(null);

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
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);
      const newItems = arrayMove(items, oldIndex, newIndex);
      onReorder(newItems);
    }

    setActiveId(null);
  };

  const handleDragCancel = () => {
    setActiveId(null);
  };

  const strategy =
    direction === 'vertical'
      ? verticalListSortingStrategy
      : horizontalListSortingStrategy;

  const activeItem = activeId
    ? items.find((item) => item.id === activeId)
    : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <SortableContext items={items.map((i) => i.id)} strategy={strategy}>
        <div
          className={cn(
            direction === 'vertical' ? 'flex flex-col gap-2' : 'flex gap-2',
            className
          )}
          role="list"
          aria-label="Sortable list"
        >
          {items.map((item, index) => (
            <div key={item.id} role="listitem" className={itemClassName}>
              <SortableItem id={item.id} handle={handle} disabled={disabled}>
                {renderItem(item, index)}
              </SortableItem>
            </div>
          ))}
        </div>
      </SortableContext>

      <DragOverlay>
        {activeItem ? (
          <div
            className={cn(
              sortableItemVariants(),
              'shadow-xl ring-2 ring-primary',
              itemClassName
            )}
          >
            {handle && <DragHandle />}
            <div className="flex-1 min-w-0">
              {renderItem(activeItem, items.indexOf(activeItem))}
            </div>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

// Simple Sortable List Hook
export function useSortableList<T extends { id: string | number }>(
  initialItems: T[]
) {
  const [items, setItems] = React.useState(initialItems);

  const handleReorder = React.useCallback((newItems: T[]) => {
    setItems(newItems);
  }, []);

  const moveItem = React.useCallback((fromIndex: number, toIndex: number) => {
    setItems((prev) => arrayMove(prev, fromIndex, toIndex));
  }, []);

  const addItem = React.useCallback((item: T, index?: number) => {
    setItems((prev) => {
      if (index !== undefined) {
        const newItems = [...prev];
        newItems.splice(index, 0, item);
        return newItems;
      }
      return [...prev, item];
    });
  }, []);

  const removeItem = React.useCallback((id: string | number) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const updateItem = React.useCallback(
    (id: string | number, updates: Partial<T>) => {
      setItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
      );
    },
    []
  );

  return {
    items,
    setItems,
    handleReorder,
    moveItem,
    addItem,
    removeItem,
    updateItem,
  };
}

// Pre-built: Task List Item
interface TaskItem {
  id: string;
  title: string;
  completed: boolean;
}

interface SortableTaskListProps {
  tasks: TaskItem[];
  onReorder: (tasks: TaskItem[]) => void;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

export function SortableTaskList({
  tasks,
  onReorder,
  onToggle,
  onDelete,
}: SortableTaskListProps) {
  return (
    <SortableList
      items={tasks}
      onReorder={onReorder}
      renderItem={(task) => (
        <div className="flex items-center gap-3 flex-1">
          <input
            type="checkbox"
            checked={task.completed}
            onChange={() => onToggle(task.id)}
            className="h-4 w-4 rounded border-gray-300"
          />
          <span
            className={cn(
              'flex-1 truncate',
              task.completed && 'line-through text-muted-foreground'
            )}
          >
            {task.title}
          </span>
          <button
            onClick={() => onDelete(task.id)}
            className="text-muted-foreground hover:text-destructive"
          >
            Delete
          </button>
        </div>
      )}
    />
  );
}

// Pre-built: Kanban Card
interface KanbanCard {
  id: string;
  title: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high';
}

interface SortableKanbanCardProps {
  card: KanbanCard;
  onClick?: () => void;
}

const priorityColors = {
  low: 'bg-blue-100 text-blue-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-red-100 text-red-800',
};

export function SortableKanbanCard({ card, onClick }: SortableKanbanCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: card.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'rounded-lg border bg-card p-3 shadow-sm cursor-grab',
        'hover:shadow-md transition-shadow',
        isDragging && 'opacity-50 shadow-lg'
      )}
      onClick={onClick}
      {...attributes}
      {...listeners}
    >
      <h4 className="font-medium text-sm">{card.title}</h4>
      {card.description && (
        <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
          {card.description}
        </p>
      )}
      {card.priority && (
        <span
          className={cn(
            'mt-2 inline-block text-xs px-2 py-0.5 rounded-full',
            priorityColors[card.priority]
          )}
        >
          {card.priority}
        </span>
      )}
    </div>
  );
}

// Pre-built: Image Gallery Sortable
interface GalleryImage {
  id: string;
  src: string;
  alt: string;
}

interface SortableGalleryProps {
  images: GalleryImage[];
  onReorder: (images: GalleryImage[]) => void;
  onRemove?: (id: string) => void;
}

export function SortableGallery({
  images,
  onReorder,
  onRemove,
}: SortableGalleryProps) {
  return (
    <SortableList
      items={images}
      onReorder={onReorder}
      direction="horizontal"
      handle={false}
      className="flex-wrap"
      renderItem={(image) => (
        <div className="relative group">
          <img
            src={image.src}
            alt={image.alt}
            className="h-24 w-24 object-cover rounded-lg"
          />
          {onRemove && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemove(image.id);
              }}
              className={cn(
                'absolute -top-2 -right-2 h-6 w-6 rounded-full',
                'bg-destructive text-destructive-foreground',
                'opacity-0 group-hover:opacity-100 transition-opacity',
                'flex items-center justify-center text-xs'
              )}
            >
              x
            </button>
          )}
        </div>
      )}
    />
  );
}
```

## Variants

### Size Variants

```tsx
<SortableItem size="sm" />
<SortableItem size="md" />
<SortableItem size="lg" />
```

### Style Variants

```tsx
<SortableItem variant="default" />
<SortableItem variant="ghost" />
<SortableItem variant="card" />
```

### With/Without Handle

```tsx
<SortableItem handle={true} />  // Drag by handle only
<SortableItem handle={false} /> // Drag entire item
```

## Usage

### Basic Sortable List

```tsx
import { SortableList } from '@/components/molecules/sortable-item';

interface Item {
  id: string;
  name: string;
}

export function ReorderableList() {
  const [items, setItems] = useState<Item[]>([
    { id: '1', name: 'Item 1' },
    { id: '2', name: 'Item 2' },
    { id: '3', name: 'Item 3' },
  ]);

  return (
    <SortableList
      items={items}
      onReorder={setItems}
      renderItem={(item) => (
        <span>{item.name}</span>
      )}
    />
  );
}
```

### Task List with Hook

```tsx
import { SortableList, useSortableList } from '@/components/molecules/sortable-item';

export function TaskManager() {
  const {
    items: tasks,
    handleReorder,
    addItem,
    removeItem,
    updateItem,
  } = useSortableList([
    { id: '1', title: 'Task 1', completed: false },
    { id: '2', title: 'Task 2', completed: true },
  ]);

  return (
    <div>
      <button onClick={() => addItem({ id: crypto.randomUUID(), title: 'New Task', completed: false })}>
        Add Task
      </button>
      
      <SortableList
        items={tasks}
        onReorder={handleReorder}
        renderItem={(task) => (
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={task.completed}
              onChange={() => updateItem(task.id, { completed: !task.completed })}
            />
            <span>{task.title}</span>
            <button onClick={() => removeItem(task.id)}>Delete</button>
          </div>
        )}
      />
    </div>
  );
}
```

### Horizontal Image Gallery

```tsx
import { SortableGallery } from '@/components/molecules/sortable-item';

export function ImageUploader() {
  const [images, setImages] = useState([
    { id: '1', src: '/img1.jpg', alt: 'Image 1' },
    { id: '2', src: '/img2.jpg', alt: 'Image 2' },
  ]);

  return (
    <SortableGallery
      images={images}
      onReorder={setImages}
      onRemove={(id) => setImages(prev => prev.filter(img => img.id !== id))}
    />
  );
}
```

### Kanban Board Column

```tsx
import { DndContext } from '@dnd-kit/core';
import { SortableContext } from '@dnd-kit/sortable';
import { SortableKanbanCard } from '@/components/molecules/sortable-item';

export function KanbanColumn({ cards, onReorder }) {
  return (
    <div className="bg-muted p-4 rounded-lg min-h-[200px]">
      <h3 className="font-semibold mb-3">To Do</h3>
      <SortableContext items={cards.map(c => c.id)}>
        <div className="space-y-2">
          {cards.map((card) => (
            <SortableKanbanCard
              key={card.id}
              card={card}
              onClick={() => openCard(card)}
            />
          ))}
        </div>
      </SortableContext>
    </div>
  );
}
```

### Disabled State

```tsx
<SortableList
  items={items}
  onReorder={setItems}
  disabled={isReadOnly}
  renderItem={(item) => <span>{item.name}</span>}
/>
```

## Anti-patterns

```tsx
// Don't forget unique IDs
const items = [
  { name: 'Item 1' }, // Missing id!
];

// Do ensure all items have unique IDs
const items = [
  { id: '1', name: 'Item 1' },
  { id: '2', name: 'Item 2' },
];

// Don't mutate items directly in onReorder
onReorder={(newItems) => {
  items = newItems; // Wrong - mutating directly
}}

// Do use state setter
onReorder={(newItems) => {
  setItems(newItems); // Correct
}}

// Don't use index as key
{items.map((item, index) => (
  <SortableItem key={index} id={item.id} /> // index as key breaks dnd
))}

// Do use stable ID
{items.map((item) => (
  <SortableItem key={item.id} id={item.id} />
))}
```

## Related Skills

- `patterns/drag-drop` - Drag and drop patterns
- `organisms/kanban-board` - Full kanban implementation
- `molecules/list-item` - Static list items

## Changelog

### 1.0.0 (2025-01-17)

- Initial implementation with dnd-kit
- Vertical and horizontal list support
- Drag handle option
- Keyboard navigation
- Touch device support
- useSortableList hook
- Pre-built TaskList, KanbanCard, Gallery variants
