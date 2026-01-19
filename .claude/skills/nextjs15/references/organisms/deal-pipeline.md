---
id: o-deal-pipeline
name: Deal Pipeline
version: 1.0.0
layer: L3
category: data
description: Sales/CRM pipeline view with stages, drag-and-drop, and deal cards
tags: [pipeline, crm, sales, deals, kanban, stages]
formula: "DealPipeline = Card(m-card)[] + Badge(a-badge) + Button(a-button) + Avatar(a-avatar) + DropdownMenu(m-action-menu)"
composes:
  - ../molecules/card.md
  - ../molecules/action-menu.md
  - ../atoms/display-badge.md
  - ../atoms/input-button.md
  - ../atoms/display-avatar.md
dependencies: ["@dnd-kit/core", "@dnd-kit/sortable", "lucide-react", "date-fns"]
performance:
  impact: medium
  lcp: low
  cls: medium
accessibility:
  wcag: AA
  keyboard: true
  screen-reader: true
---

# Deal Pipeline

## Overview

The Deal Pipeline organism provides a visual sales pipeline for CRM applications with drag-and-drop functionality, stage management, deal cards with key metrics, and filtering capabilities.

## When to Use

Use this skill when:
- Building CRM or sales dashboards
- Creating deal management interfaces
- Visualizing sales funnel stages
- Tracking opportunity progression

## Composition Diagram

```
+---------------------------------------------------------------------+
|                      DealPipeline (L3)                               |
+---------------------------------------------------------------------+
|  +---------------------------------------------------------------+  |
|  |  Pipeline Header                                              |  |
|  |  [Filter] [+ Add Deal] Button(a-button)                       |  |
|  +---------------------------------------------------------------+  |
|                                                                     |
|  +-------------+ +-------------+ +-------------+ +-------------+   |
|  | Stage: Lead | | Qualified   | | Proposal    | | Closed Won  |   |
|  | $50,000 (5) | | $120,000(3) | | $80,000 (2) | | $200,000(4) |   |
|  +-------------+ +-------------+ +-------------+ +-------------+   |
|  | +---------+ | | +---------+ | | +---------+ | | +---------+ |   |
|  | |DealCard | | | |DealCard | | | |DealCard | | | |DealCard | |   |
|  | |Card(m)  | | | |Card(m)  | | | |Card(m)  | | | |Card(m)  | |   |
|  | |Avatar   | | | |Avatar   | | | |Avatar   | | | |Avatar   | |   |
|  | |Badge    | | | |Badge    | | | |Badge    | | | |Badge    | |   |
|  | +---------+ | | +---------+ | | +---------+ | | +---------+ |   |
|  | +---------+ | | +---------+ | |             | | +---------+ |   |
|  | |DealCard | | | |DealCard | | |             | | |DealCard | |   |
|  | +---------+ | | +---------+ | |             | | +---------+ |   |
|  +-------------+ +-------------+ +-------------+ +-------------+   |
+---------------------------------------------------------------------+
```

## Implementation

```tsx
// components/organisms/deal-pipeline.tsx
'use client';

import * as React from 'react';
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
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { format } from 'date-fns';
import {
  MoreHorizontal,
  Plus,
  DollarSign,
  Calendar,
  User,
  Building,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Deal {
  id: string;
  title: string;
  value: number;
  company: string;
  contact: {
    name: string;
    avatar?: string;
  };
  stage: string;
  probability: number;
  expectedCloseDate: Date;
  createdAt: Date;
}

interface Stage {
  id: string;
  name: string;
  color: string;
}

interface DealPipelineProps {
  deals: Deal[];
  stages: Stage[];
  onDealMove?: (dealId: string, fromStage: string, toStage: string) => void;
  onDealClick?: (deal: Deal) => void;
  onAddDeal?: (stageId: string) => void;
  className?: string;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function DealCard({
  deal,
  onClick,
  isDragging,
}: {
  deal: Deal;
  onClick?: () => void;
  isDragging?: boolean;
}) {
  const initials = deal.contact.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2);

  return (
    <div
      className={cn(
        'rounded-lg border bg-card p-3 shadow-sm cursor-pointer',
        'hover:border-primary/50 transition-colors',
        isDragging && 'opacity-50 rotate-2 shadow-lg'
      )}
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-2">
        <h4 className="font-medium text-sm line-clamp-1">{deal.title}</h4>
        <button className="p-1 hover:bg-accent rounded">
          <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>

      <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
        <Building className="h-3 w-3" />
        <span className="truncate">{deal.company}</span>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-1 font-semibold text-sm">
          <DollarSign className="h-4 w-4 text-green-600" />
          {formatCurrency(deal.value)}
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Calendar className="h-3 w-3" />
          {format(new Date(deal.expectedCloseDate), 'MMM d')}
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
            {deal.contact.avatar ? (
              <img
                src={deal.contact.avatar}
                alt={deal.contact.name}
                className="h-full w-full rounded-full object-cover"
              />
            ) : (
              initials
            )}
          </div>
          <span className="text-xs text-muted-foreground truncate max-w-[80px]">
            {deal.contact.name}
          </span>
        </div>
        <span className="text-xs font-medium text-primary">
          {deal.probability}%
        </span>
      </div>
    </div>
  );
}

function SortableDealCard({
  deal,
  onClick,
}: {
  deal: Deal;
  onClick?: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: deal.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <DealCard deal={deal} onClick={onClick} isDragging={isDragging} />
    </div>
  );
}

function StageColumn({
  stage,
  deals,
  onDealClick,
  onAddDeal,
}: {
  stage: Stage;
  deals: Deal[];
  onDealClick?: (deal: Deal) => void;
  onAddDeal?: () => void;
}) {
  const totalValue = deals.reduce((sum, deal) => sum + deal.value, 0);

  return (
    <div className="flex-shrink-0 w-72">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: stage.color }}
          />
          <h3 className="font-semibold text-sm">{stage.name}</h3>
          <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
            {deals.length}
          </span>
        </div>
        <button
          onClick={onAddDeal}
          className="p-1 hover:bg-accent rounded transition-colors"
        >
          <Plus className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>

      <div className="text-sm font-medium text-muted-foreground mb-3">
        {formatCurrency(totalValue)}
      </div>

      <SortableContext items={deals.map((d) => d.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-2 min-h-[200px] p-2 bg-muted/30 rounded-lg">
          {deals.map((deal) => (
            <SortableDealCard
              key={deal.id}
              deal={deal}
              onClick={() => onDealClick?.(deal)}
            />
          ))}
        </div>
      </SortableContext>
    </div>
  );
}

export function DealPipeline({
  deals,
  stages,
  onDealMove,
  onDealClick,
  onAddDeal,
  className,
}: DealPipelineProps) {
  const [activeDeal, setActiveDeal] = React.useState<Deal | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const dealsByStage = React.useMemo(() => {
    const grouped: Record<string, Deal[]> = {};
    stages.forEach((stage) => {
      grouped[stage.id] = deals.filter((deal) => deal.stage === stage.id);
    });
    return grouped;
  }, [deals, stages]);

  const handleDragStart = (event: DragStartEvent) => {
    const deal = deals.find((d) => d.id === event.active.id);
    setActiveDeal(deal || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDeal(null);

    if (!over) return;

    const activeDeal = deals.find((d) => d.id === active.id);
    if (!activeDeal) return;

    const overStage = stages.find((s) =>
      dealsByStage[s.id]?.some((d) => d.id === over.id)
    );

    if (overStage && overStage.id !== activeDeal.stage) {
      onDealMove?.(activeDeal.id, activeDeal.stage, overStage.id);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className={cn('overflow-x-auto', className)}>
        <div className="flex gap-4 p-4 min-w-max">
          {stages.map((stage) => (
            <StageColumn
              key={stage.id}
              stage={stage}
              deals={dealsByStage[stage.id] || []}
              onDealClick={onDealClick}
              onAddDeal={() => onAddDeal?.(stage.id)}
            />
          ))}
        </div>
      </div>

      <DragOverlay>
        {activeDeal && <DealCard deal={activeDeal} isDragging />}
      </DragOverlay>
    </DndContext>
  );
}
```

## Usage

### Basic Usage

```tsx
import { DealPipeline } from '@/components/organisms/deal-pipeline';

const stages = [
  { id: 'lead', name: 'Lead', color: '#6366f1' },
  { id: 'qualified', name: 'Qualified', color: '#8b5cf6' },
  { id: 'proposal', name: 'Proposal', color: '#f59e0b' },
  { id: 'closed', name: 'Closed Won', color: '#22c55e' },
];

export function SalesDashboard() {
  return (
    <DealPipeline
      deals={deals}
      stages={stages}
      onDealMove={(dealId, from, to) => updateDealStage(dealId, to)}
      onDealClick={(deal) => openDealModal(deal)}
    />
  );
}
```

## Accessibility

- Keyboard navigation for drag and drop
- Stage announcements for screen readers
- Focus management during drag operations

## Dependencies

```json
{
  "dependencies": {
    "@dnd-kit/core": "^6.1.0",
    "@dnd-kit/sortable": "^8.0.0",
    "date-fns": "^3.0.0",
    "lucide-react": "^0.460.0"
  }
}
```

## States

| State | Description | Visual Change |
|-------|-------------|---------------|
| Default | Pipeline showing all stages with deals | Columns visible with deal cards in each stage |
| Empty Stage | Stage with no deals | Empty column with muted background, add button visible |
| Card Hover | Mouse over deal card | Card border changes to primary tint, subtle shadow |
| Card Dragging | Deal being dragged to new stage | Card slightly rotated, elevated shadow, original position faded |
| Drag Over Stage | Hovering over valid drop target | Stage column may show highlight or accepts indicator |
| Card Dropped | Deal moved to new stage | Card settles into new position, callback fires |
| Stage Scrollable | Many deals in single stage | Vertical scroll within stage column |
| Pipeline Scrollable | Many stages exceed width | Horizontal scroll on pipeline container |
| Add Deal Hover | Mouse over add deal button | Button shows hover background |
| Menu Open | Deal card action menu open | Dropdown menu visible with options |
| Stage Loading | Deals being loaded for stage | Optional skeleton or loading indicator in column |

## Anti-patterns

### 1. Mismatched Stage IDs

```tsx
// Bad: Deal.stage doesn't match any stage.id
const stages = [{ id: 'lead', name: 'Lead', color: '#blue' }];
const deals = [{ id: '1', stage: 'new-lead', ... }];  // Wrong stage ID!

<DealPipeline stages={stages} deals={deals} />

// Good: Deal.stage matches stage.id exactly
const stages = [{ id: 'lead', name: 'Lead', color: '#3b82f6' }];
const deals = [{ id: '1', stage: 'lead', ... }];

<DealPipeline stages={stages} deals={deals} />
```

### 2. Not Handling Deal Move Callback

```tsx
// Bad: Drag works but changes aren't persisted
<DealPipeline
  deals={deals}
  stages={stages}
  // Missing onDealMove - drops will reset on refresh!
/>

// Good: Handle deal moves to persist changes
<DealPipeline
  deals={deals}
  stages={stages}
  onDealMove={(dealId, fromStage, toStage) => {
    updateDealStage(dealId, toStage);  // Persist to database
    setDeals(prev => prev.map(d =>
      d.id === dealId ? { ...d, stage: toStage } : d
    ));
  }}
/>
```

### 3. Invalid Date Objects in Deals

```tsx
// Bad: String dates instead of Date objects
const deals = [{
  id: '1',
  expectedCloseDate: '2025-01-15',  // String!
  createdAt: '2025-01-01',  // String!
  ...
}];

// Good: Use proper Date objects
const deals = [{
  id: '1',
  expectedCloseDate: new Date('2025-01-15'),
  createdAt: new Date('2025-01-01'),
  ...
}];
```

### 4. Too Many Stages Without Horizontal Scroll

```tsx
// Bad: 10+ stages in narrow container
<div className="w-96">  {/* Too narrow for many stages */}
  <DealPipeline
    stages={tenStages}
    deals={deals}
  />
</div>

// Good: Allow overflow or limit visible stages
<div className="w-full overflow-x-auto">
  <DealPipeline
    stages={tenStages}
    deals={deals}
    className="min-w-max"
  />
</div>
```

## Related Skills

- [organisms/kanban-board](./kanban-board.md)
- [molecules/card](../molecules/card.md)

---

## Changelog

### 1.0.0 (2025-01-18)
- Initial implementation
- Drag-and-drop with dnd-kit
- Deal cards with metrics
- Stage management
