---
id: o-kanban-board
name: Kanban Board
version: 2.0.0
layer: L3
category: data
description: Drag-and-drop kanban board with columns, cards, and real-time updates
tags: [kanban, board, drag-drop, tasks, workflow, project-management]
formula: "KanbanBoard = Card(m-card) + Avatar(m-avatar) + DropdownMenu(m-dropdown-menu) + Badge(a-badge) + Button(a-button)"
composes:
  - ../molecules/card.md
  - ../molecules/avatar.md
dependencies: ["@dnd-kit/core", "@dnd-kit/sortable", "@dnd-kit/utilities", framer-motion]
performance:
  impact: high
  lcp: low
  cls: medium
accessibility:
  wcag: AA
  keyboard: true
  screen-reader: true
---

# Kanban Board

## Overview

The Kanban Board organism provides a fully interactive drag-and-drop board for task management. Features columns with sortable cards, keyboard accessibility, touch support, and optimistic UI updates.

## When to Use

Use this skill when:
- Building project management interfaces
- Creating task/issue trackers
- Implementing workflow visualization
- Building CRM pipelines

## Composition Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ KanbanBoard                                                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐          │
│  │ Column: To Do    │  │ Column: In Prog  │  │ Column: Done     │          │
│  │ ┌──────────────┐ │  │ ┌──────────────┐ │  │ ┌──────────────┐ │          │
│  │ │ Header       │ │  │ │ Header       │ │  │ │ Header       │ │          │
│  │ │ ● Title [3]  │ │  │ │ ● Title [2]  │ │  │ │ ● Title [5]  │ │          │
│  │ │   ┌────────┐ │ │  │ │   ┌────────┐ │ │  │ │   ┌────────┐ │ │          │
│  │ │   │ Button │ │ │  │ │   │ Button │ │ │  │ │   │ Button │ │ │          │
│  │ │   │  [+]   │ │ │  │ │   │  [+]   │ │ │  │ │   │  [+]   │ │ │          │
│  │ │   └────────┘ │ │  │ │   └────────┘ │ │  │ │   └────────┘ │ │          │
│  │ └──────────────┘ │  │ └──────────────┘ │  │ └──────────────┘ │          │
│  │                  │  │                  │  │                  │          │
│  │ ┌──────────────┐ │  │ ┌──────────────┐ │  │ ┌──────────────┐ │          │
│  │ │ Card (m-card)│ │  │ │ Card (m-card)│ │  │ │ Card (m-card)│ │          │
│  │ │ ┌──────────┐ │ │  │ │ ┌──────────┐ │ │  │ │ ┌──────────┐ │ │          │
│  │ │ │ Title  ⋮ │ │ │  │ │ │ Title  ⋮ │ │ │  │ │ │ Title  ⋮ │ │ │          │
│  │ │ └──────────┘ │ │  │ │ └──────────┘ │ │  │ │ └──────────┘ │ │          │
│  │ │ Description  │ │  │ │ Description  │ │  │ │ Description  │ │          │
│  │ │ ┌───────┐ ○  │ │  │ │ ┌───────┐ ○  │ │  │ │ ┌───────┐ ○  │ │          │
│  │ │ │ Badge │    │ │  │ │ │ Badge │    │ │  │ │ │ Badge │    │ │          │
│  │ │ │(high) │Avtr│ │  │ │ │(med)  │Avtr│ │  │ │ │(low)  │Avtr│ │          │
│  │ │ └───────┘    │ │  │ │ └───────┘    │ │  │ │ └───────┘    │ │          │
│  │ └──────────────┘ │  │ └──────────────┘ │  │ └──────────────┘ │          │
│  │        ⋮         │  │        ⋮         │  │        ⋮         │          │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘          │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ DragOverlay: Card (m-card) - appears when dragging                  │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Molecules Used

- [card](../molecules/card.md) - Task cards
- [badge](../atoms/badge.md) - Status/priority tags
- [avatar](../molecules/avatar.md) - Assignee display

## Implementation

```typescript
// components/organisms/kanban-board.tsx
"use client";

import * as React from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  UniqueIdentifier,
  closestCorners,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { motion } from "framer-motion";
import { GripVertical, MoreHorizontal, Plus, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";

interface KanbanCard {
  id: string;
  title: string;
  description?: string;
  priority?: "low" | "medium" | "high" | "urgent";
  labels?: string[];
  assignee?: {
    name: string;
    avatar?: string;
  };
  dueDate?: Date;
  columnId: string;
  order: number;
}

interface KanbanColumn {
  id: string;
  title: string;
  color?: string;
  limit?: number;
}

interface KanbanBoardProps {
  /** Column definitions */
  columns: KanbanColumn[];
  /** Card data */
  cards: KanbanCard[];
  /** Card moved callback */
  onCardMove?: (
    cardId: string,
    fromColumnId: string,
    toColumnId: string,
    newOrder: number
  ) => void;
  /** Card click callback */
  onCardClick?: (card: KanbanCard) => void;
  /** Add card callback */
  onAddCard?: (columnId: string) => void;
  /** Edit card callback */
  onEditCard?: (card: KanbanCard) => void;
  /** Delete card callback */
  onDeleteCard?: (cardId: string) => void;
  /** Show add button in columns */
  showAddButton?: boolean;
  /** Disable drag and drop */
  disabled?: boolean;
  /** Additional class names */
  className?: string;
}

const priorityColors: Record<string, string> = {
  low: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  high: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  urgent: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
};

function TaskCard({
  card,
  onClick,
  onEdit,
  onDelete,
  isDragging,
  disabled,
}: {
  card: KanbanCard;
  onClick?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  isDragging?: boolean;
  disabled?: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({
    id: card.id,
    disabled,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const isOverlay = isDragging;
  const isBeingDragged = isSortableDragging;

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={cn(
        "cursor-pointer transition-shadow hover:shadow-md",
        isBeingDragged && "opacity-50",
        isOverlay && "shadow-lg ring-2 ring-primary"
      )}
      onClick={onClick}
    >
      <CardHeader className="p-3 pb-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <CardTitle className="text-sm font-medium line-clamp-2">
              {card.title}
            </CardTitle>
          </div>
          <div className="flex items-center gap-1">
            {!disabled && (
              <button
                className="cursor-grab opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
                {...attributes}
                {...listeners}
                aria-label="Drag handle"
              >
                <GripVertical className="h-4 w-4 text-muted-foreground" />
              </button>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 opacity-0 group-hover:opacity-100 focus:opacity-100"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreHorizontal className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onEdit}>Edit</DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={onDelete}
                >
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-3 pt-2">
        {card.description && (
          <CardDescription className="text-xs line-clamp-2 mb-2">
            {card.description}
          </CardDescription>
        )}
        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-wrap gap-1">
            {card.priority && (
              <Badge
                variant="secondary"
                className={cn("text-xs", priorityColors[card.priority])}
              >
                {card.priority}
              </Badge>
            )}
            {card.labels?.slice(0, 2).map((label) => (
              <Badge key={label} variant="outline" className="text-xs">
                {label}
              </Badge>
            ))}
          </div>
          {card.assignee && (
            <Avatar className="h-6 w-6">
              <AvatarImage src={card.assignee.avatar} alt={card.assignee.name} />
              <AvatarFallback className="text-xs">
                {card.assignee.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function Column({
  column,
  cards,
  onCardClick,
  onEditCard,
  onDeleteCard,
  onAddCard,
  showAddButton,
  disabled,
}: {
  column: KanbanColumn;
  cards: KanbanCard[];
  onCardClick?: (card: KanbanCard) => void;
  onEditCard?: (card: KanbanCard) => void;
  onDeleteCard?: (cardId: string) => void;
  onAddCard?: () => void;
  showAddButton?: boolean;
  disabled?: boolean;
}) {
  const isOverLimit = column.limit && cards.length >= column.limit;

  return (
    <div className="flex flex-col bg-muted/50 rounded-lg min-w-[280px] max-w-[320px]">
      {/* Column Header */}
      <div className="flex items-center justify-between p-3 border-b">
        <div className="flex items-center gap-2">
          {column.color && (
            <div
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: column.color }}
            />
          )}
          <h3 className="font-semibold text-sm">{column.title}</h3>
          <Badge variant="secondary" className="rounded-full text-xs">
            {cards.length}
            {column.limit && `/${column.limit}`}
          </Badge>
        </div>
        {showAddButton && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={onAddCard}
            disabled={isOverLimit}
          >
            <Plus className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Cards */}
      <ScrollArea className="flex-1 p-2">
        <SortableContext
          items={cards.map((c) => c.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2">
            {cards.map((card) => (
              <div key={card.id} className="group">
                <TaskCard
                  card={card}
                  onClick={() => onCardClick?.(card)}
                  onEdit={() => onEditCard?.(card)}
                  onDelete={() => onDeleteCard?.(card.id)}
                  disabled={disabled}
                />
              </div>
            ))}
          </div>
        </SortableContext>
        
        {cards.length === 0 && (
          <div className="text-center py-8 text-muted-foreground text-sm">
            No cards
          </div>
        )}
      </ScrollArea>
    </div>
  );
}

export function KanbanBoard({
  columns,
  cards: initialCards,
  onCardMove,
  onCardClick,
  onAddCard,
  onEditCard,
  onDeleteCard,
  showAddButton = true,
  disabled = false,
  className,
}: KanbanBoardProps) {
  const [cards, setCards] = React.useState(initialCards);
  const [activeId, setActiveId] = React.useState<UniqueIdentifier | null>(null);

  // Sync with props
  React.useEffect(() => {
    setCards(initialCards);
  }, [initialCards]);

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

  const activeCard = activeId
    ? cards.find((card) => card.id === activeId)
    : null;

  const getCardsByColumn = (columnId: string) =>
    cards
      .filter((card) => card.columnId === columnId)
      .sort((a, b) => a.order - b.order);

  const findColumn = (id: UniqueIdentifier) => {
    // Check if it's a column ID
    const column = columns.find((col) => col.id === id);
    if (column) return column.id;

    // Check if it's a card ID and find its column
    const card = cards.find((card) => card.id === id);
    return card?.columnId;
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeColumnId = findColumn(active.id);
    const overColumnId = findColumn(over.id);

    if (!activeColumnId || !overColumnId || activeColumnId === overColumnId) {
      return;
    }

    setCards((prev) => {
      const activeCards = prev.filter((c) => c.columnId === activeColumnId);
      const overCards = prev.filter((c) => c.columnId === overColumnId);
      const activeCard = prev.find((c) => c.id === active.id);
      
      if (!activeCard) return prev;

      // Find the index to insert at
      const overIndex = overCards.findIndex((c) => c.id === over.id);
      const newIndex = overIndex >= 0 ? overIndex : overCards.length;

      return prev.map((card) => {
        if (card.id === active.id) {
          return { ...card, columnId: overColumnId, order: newIndex };
        }
        return card;
      });
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeCard = cards.find((c) => c.id === active.id);
    if (!activeCard) return;

    const overColumnId = findColumn(over.id);
    if (!overColumnId) return;

    const columnCards = cards
      .filter((c) => c.columnId === overColumnId)
      .sort((a, b) => a.order - b.order);

    const oldIndex = columnCards.findIndex((c) => c.id === active.id);
    const newIndex = columnCards.findIndex((c) => c.id === over.id);

    if (oldIndex !== newIndex && newIndex !== -1) {
      const reordered = arrayMove(columnCards, oldIndex, newIndex);
      
      setCards((prev) =>
        prev.map((card) => {
          const idx = reordered.findIndex((c) => c.id === card.id);
          if (idx !== -1) {
            return { ...card, order: idx };
          }
          return card;
        })
      );
    }

    // Notify parent
    if (onCardMove) {
      const fromColumnId = activeCard.columnId;
      const newOrder = newIndex >= 0 ? newIndex : columnCards.length;
      onCardMove(activeCard.id, fromColumnId, overColumnId, newOrder);
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
      <div className={cn("flex gap-4 overflow-x-auto pb-4", className)}>
        {columns.map((column) => (
          <Column
            key={column.id}
            column={column}
            cards={getCardsByColumn(column.id)}
            onCardClick={onCardClick}
            onEditCard={onEditCard}
            onDeleteCard={onDeleteCard}
            onAddCard={() => onAddCard?.(column.id)}
            showAddButton={showAddButton}
            disabled={disabled}
          />
        ))}
      </div>

      {/* Drag Overlay */}
      <DragOverlay>
        {activeCard && (
          <div className="w-[280px]">
            <TaskCard card={activeCard} isDragging />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
```

### Key Implementation Notes

1. **DnD Kit**: Uses @dnd-kit for accessible drag-and-drop
2. **Optimistic Updates**: Local state updated before callback
3. **Column Limits**: Optional WIP limits per column
4. **Keyboard Support**: Full keyboard navigation

## Variants

### Basic Kanban

```tsx
const columns = [
  { id: "todo", title: "To Do", color: "#6b7280" },
  { id: "in-progress", title: "In Progress", color: "#3b82f6" },
  { id: "done", title: "Done", color: "#22c55e" },
];

const cards = [
  {
    id: "1",
    title: "Implement login",
    columnId: "todo",
    order: 0,
    priority: "high",
  },
  // More cards...
];

<KanbanBoard
  columns={columns}
  cards={cards}
  onCardMove={(cardId, from, to, order) => {
    console.log(`Card ${cardId} moved from ${from} to ${to}`);
  }}
/>
```

### With Assignees and Labels

```tsx
<KanbanBoard
  columns={columns}
  cards={[
    {
      id: "1",
      title: "Design new dashboard",
      description: "Create mockups for the admin dashboard",
      columnId: "in-progress",
      order: 0,
      priority: "medium",
      labels: ["design", "frontend"],
      assignee: {
        name: "John Doe",
        avatar: "/avatars/john.jpg",
      },
    },
  ]}
  onCardClick={(card) => openCardModal(card)}
/>
```

### With WIP Limits

```tsx
<KanbanBoard
  columns={[
    { id: "todo", title: "To Do" },
    { id: "in-progress", title: "In Progress", limit: 3 },
    { id: "review", title: "Review", limit: 2 },
    { id: "done", title: "Done" },
  ]}
  cards={cards}
/>
```

### Read-Only

```tsx
<KanbanBoard
  columns={columns}
  cards={cards}
  disabled
  showAddButton={false}
/>
```

## Performance

### Large Boards

- Virtualize cards for large columns
- Lazy load card details
- Debounce drag updates

### Optimistic UI

- Update local state immediately
- Rollback on server error
- Show loading states

## States

| State | Description | Visual Change |
|-------|-------------|---------------|
| Default | Board displays columns with cards in normal state | Cards have standard styling, drag handles hidden |
| Hover (Card) | User hovers over a card | Shadow increases, drag handle and menu button appear |
| Dragging | Card is being dragged by user | Original card shows 50% opacity, drag overlay follows cursor with ring highlight |
| Over Column | Dragged card hovers over a different column | Target column may highlight to indicate drop zone |
| At WIP Limit | Column has reached its card limit | Add button disabled, badge shows limit reached (e.g., "3/3") |
| Empty Column | Column contains no cards | Shows "No cards" placeholder text centered |
| Disabled | Drag and drop functionality disabled | Drag handles hidden, cards not draggable, visual cues removed |
| Focused (Keyboard) | Card selected via keyboard navigation | Focus ring visible around card |

## Anti-patterns

### Bad: Mutating state directly instead of using callbacks

```tsx
// Bad - Mutating cards array directly
function handleDrop(cardId: string, columnId: string) {
  const card = cards.find(c => c.id === cardId);
  card.columnId = columnId; // Direct mutation!
  setCards(cards); // Same reference, won't trigger re-render
}

// Good - Immutable update with callback notification
function handleDrop(cardId: string, columnId: string, newOrder: number) {
  setCards(prev => prev.map(card =>
    card.id === cardId
      ? { ...card, columnId, order: newOrder }
      : card
  ));
  onCardMove?.(cardId, fromColumnId, columnId, newOrder);
}
```

### Bad: Not implementing optimistic updates

```tsx
// Bad - Waiting for server response before updating UI
async function handleCardMove(cardId: string, toColumn: string) {
  setLoading(true);
  await api.moveCard(cardId, toColumn); // User waits for server
  const newCards = await api.getCards();
  setCards(newCards);
  setLoading(false);
}

// Good - Optimistic update with rollback on error
async function handleCardMove(cardId: string, toColumn: string, newOrder: number) {
  const previousCards = cards;
  // Update UI immediately
  setCards(prev => prev.map(c =>
    c.id === cardId ? { ...c, columnId: toColumn, order: newOrder } : c
  ));
  try {
    await api.moveCard(cardId, toColumn, newOrder);
  } catch (error) {
    setCards(previousCards); // Rollback on failure
    toast.error('Failed to move card');
  }
}
```

### Bad: Missing keyboard accessibility for drag-and-drop

```tsx
// Bad - Only supporting mouse interactions
<div
  onMouseDown={handleDragStart}
  onMouseMove={handleDragMove}
  onMouseUp={handleDragEnd}
>
  <Card>{card.title}</Card>
</div>

// Good - Using dnd-kit with keyboard sensor support
const sensors = useSensors(
  useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
);

<DndContext sensors={sensors} onDragEnd={handleDragEnd}>
  <SortableContext items={cards}>
    {cards.map(card => <SortableCard key={card.id} card={card} />)}
  </SortableContext>
</DndContext>
```

### Bad: Not respecting WIP limits

```tsx
// Bad - Allowing unlimited cards in columns
<Column cards={columnCards} />

// Good - Enforcing WIP limits and providing visual feedback
<Column
  cards={columnCards}
  limit={column.limit}
  isOverLimit={column.limit && columnCards.length >= column.limit}
/>
// In Column component:
{isOverLimit && (
  <Badge variant="destructive">At limit</Badge>
)}
<Button disabled={isOverLimit} onClick={onAddCard}>
  <Plus />
</Button>
```

## Accessibility

### Required Attributes

- Drag handles have labels
- Cards are keyboard focusable
- Column limits are announced

### Screen Reader

- Card position announced on move
- Column contents announced
- Drop targets described

### Keyboard Navigation

- Tab to navigate cards
- Space/Enter to pick up
- Arrow keys to move
- Space/Enter to drop

## Dependencies

```json
{
  "dependencies": {
    "@dnd-kit/core": "^6.1.0",
    "@dnd-kit/sortable": "^8.0.0",
    "@dnd-kit/utilities": "^3.2.0",
    "framer-motion": "^11.0.0"
  }
}
```

## Related Skills

### Composes Into
- [templates/project-board](../templates/project-board.md)
- [templates/dashboard-layout](../templates/dashboard-layout.md)

---

## Changelog

### 2.0.0 (2025-01-17)
- Standardized to atomic design system v2
- Updated frontmatter schema
- Added explicit composition references

### 1.0.0 (2025-01-16)
- Initial implementation
- DnD Kit integration
- Column WIP limits
- Keyboard accessibility
