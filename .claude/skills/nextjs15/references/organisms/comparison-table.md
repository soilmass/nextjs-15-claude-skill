---
id: o-comparison-table
name: Comparison Table
version: 2.0.0
layer: L3
category: data
description: Feature comparison table for products, plans, or services
tags: [comparison, table, features, pricing, products, plans]
formula: "ComparisonTable = Tooltip(m-tooltip) + Badge(a-badge) + Button(a-button)"
composes: []
dependencies: [lucide-react]
performance:
  impact: low
  lcp: low
  cls: low
accessibility:
  wcag: AA
  keyboard: true
  screen-reader: true
---

# Comparison Table

## Overview

The Comparison Table organism displays side-by-side comparisons of features, products, or plans. Supports sticky headers, highlighting, tooltips, and responsive mobile layouts with horizontal scrolling or card views.

## When to Use

Use this skill when:
- Comparing pricing tiers/plans
- Displaying product feature comparisons
- Building "vs" comparison pages
- Showing service level differences

## Composition Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                    ComparisonTable (L3)                             │
├─────────────────────────────────────────────────────────────────────┤
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │  TableHeader (sticky)                                         │  │
│  │  ┌──────────┬──────────────┬──────────────┬──────────────┐   │  │
│  │  │ Features │   Plan A     │   Plan B     │   Plan C     │   │  │
│  │  │          │ Badge(a-badge)│ Badge(a-badge)│             │   │  │
│  │  │          │ Price        │ Price        │ Price        │   │  │
│  │  │          │Button(a-btn) │Button(a-btn) │Button(a-btn) │   │  │
│  │  └──────────┴──────────────┴──────────────┴──────────────┘   │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │  FeatureRow                                                   │  │
│  │  ┌──────────────────────┬─────────┬─────────┬─────────┐      │  │
│  │  │ Feature Name         │   ✓     │   ✓     │   ✗     │      │  │
│  │  │ Tooltip(m-tooltip) ? │ Value   │ Value   │ Value   │      │  │
│  │  └──────────────────────┴─────────┴─────────┴─────────┘      │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │  CategoryHeader (optional grouping)                           │  │
│  │  ┌─────────────────────────────────────────────────────────┐  │  │
│  │  │  CATEGORY NAME                                          │  │  │
│  │  └─────────────────────────────────────────────────────────┘  │  │
│  │  FeatureRow[]                                                 │  │
│  └───────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

## Molecules Used

- [badge](../atoms/badge.md) - Plan/tier labels
- [tooltip](../molecules/tooltip.md) - Feature explanations
- [button](../atoms/button.md) - CTA buttons

## Implementation

```typescript
// components/organisms/comparison-table.tsx
"use client";

import * as React from "react";
import { Check, X, Minus, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

type FeatureValue = boolean | string | number | "partial";

interface Feature {
  id: string;
  name: string;
  description?: string;
  category?: string;
}

interface ComparisonItem {
  id: string;
  name: string;
  description?: string;
  price?: {
    amount: number;
    currency?: string;
    period?: string;
  };
  badge?: string;
  highlighted?: boolean;
  ctaLabel?: string;
  ctaHref?: string;
  features: Record<string, FeatureValue>;
}

interface ComparisonTableProps {
  /** Items to compare (columns) */
  items: ComparisonItem[];
  /** Features to display (rows) */
  features: Feature[];
  /** Group features by category */
  groupByCategory?: boolean;
  /** Show feature descriptions in tooltips */
  showTooltips?: boolean;
  /** Highlight best value in each row */
  highlightBest?: boolean;
  /** Mobile layout style */
  mobileLayout?: "scroll" | "cards" | "stack";
  /** Sticky header */
  stickyHeader?: boolean;
  /** Show prices */
  showPrices?: boolean;
  /** CTA click handler */
  onCtaClick?: (item: ComparisonItem) => void;
  /** Additional class names */
  className?: string;
}

function FeatureValueCell({
  value,
  highlight = false,
}: {
  value: FeatureValue;
  highlight?: boolean;
}) {
  if (typeof value === "boolean") {
    return value ? (
      <Check
        className={cn(
          "h-5 w-5",
          highlight ? "text-green-500" : "text-green-500/70"
        )}
      />
    ) : (
      <X className="h-5 w-5 text-muted-foreground/50" />
    );
  }

  if (value === "partial") {
    return <Minus className="h-5 w-5 text-yellow-500" />;
  }

  if (typeof value === "number") {
    return (
      <span
        className={cn(
          "font-medium tabular-nums",
          highlight && "text-primary font-bold"
        )}
      >
        {value.toLocaleString()}
      </span>
    );
  }

  return (
    <span
      className={cn("text-sm", highlight && "font-medium text-primary")}
    >
      {value}
    </span>
  );
}

function PriceDisplay({
  price,
}: {
  price: ComparisonItem["price"];
}) {
  if (!price) return null;

  return (
    <div className="space-y-1">
      <div className="flex items-baseline justify-center gap-1">
        <span className="text-3xl font-bold">
          {price.currency ?? "$"}
          {price.amount}
        </span>
        {price.period && (
          <span className="text-muted-foreground text-sm">
            /{price.period}
          </span>
        )}
      </div>
    </div>
  );
}

function TableHeader({
  items,
  showPrices,
  onCtaClick,
  sticky,
}: {
  items: ComparisonItem[];
  showPrices: boolean;
  onCtaClick?: (item: ComparisonItem) => void;
  sticky: boolean;
}) {
  return (
    <thead className={cn(sticky && "sticky top-0 z-10 bg-background")}>
      <tr>
        <th className="text-left p-4 font-medium text-muted-foreground bg-background">
          Features
        </th>
        {items.map((item) => (
          <th
            key={item.id}
            className={cn(
              "p-4 text-center min-w-[180px] bg-background",
              item.highlighted && "bg-primary/5"
            )}
          >
            <div className="space-y-3">
              {/* Badge */}
              {item.badge && (
                <Badge
                  variant={item.highlighted ? "default" : "secondary"}
                  className="mb-2"
                >
                  {item.badge}
                </Badge>
              )}

              {/* Name */}
              <h3 className="font-semibold text-lg">{item.name}</h3>

              {/* Description */}
              {item.description && (
                <p className="text-sm text-muted-foreground">
                  {item.description}
                </p>
              )}

              {/* Price */}
              {showPrices && <PriceDisplay price={item.price} />}

              {/* CTA */}
              {item.ctaLabel && (
                <Button
                  variant={item.highlighted ? "default" : "outline"}
                  className="w-full"
                  onClick={() => onCtaClick?.(item)}
                  asChild={!!item.ctaHref}
                >
                  {item.ctaHref ? (
                    <a href={item.ctaHref}>{item.ctaLabel}</a>
                  ) : (
                    item.ctaLabel
                  )}
                </Button>
              )}
            </div>
          </th>
        ))}
      </tr>
    </thead>
  );
}

function FeatureRow({
  feature,
  items,
  showTooltip,
  highlightBest,
}: {
  feature: Feature;
  items: ComparisonItem[];
  showTooltip: boolean;
  highlightBest: boolean;
}) {
  // Find best value for highlighting
  const getBestIndex = (): number | null => {
    if (!highlightBest) return null;

    const values = items.map((item) => item.features[feature.id]);
    
    // For boolean, find true values
    if (values.every((v) => typeof v === "boolean")) {
      const trueCount = values.filter(Boolean).length;
      if (trueCount === 1) {
        return values.findIndex(Boolean);
      }
      return null;
    }

    // For numbers, find highest
    if (values.every((v) => typeof v === "number")) {
      const max = Math.max(...(values as number[]));
      const maxCount = values.filter((v) => v === max).length;
      if (maxCount === 1) {
        return values.indexOf(max);
      }
      return null;
    }

    return null;
  };

  const bestIndex = getBestIndex();

  return (
    <tr className="border-b">
      <td className="p-4">
        <div className="flex items-center gap-2">
          <span className="font-medium">{feature.name}</span>
          {showTooltip && feature.description && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <HelpCircle className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>{feature.description}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </td>
      {items.map((item, index) => (
        <td
          key={item.id}
          className={cn(
            "p-4 text-center",
            item.highlighted && "bg-primary/5"
          )}
        >
          <div className="flex items-center justify-center">
            <FeatureValueCell
              value={item.features[feature.id]}
              highlight={bestIndex === index}
            />
          </div>
        </td>
      ))}
    </tr>
  );
}

function CategoryHeader({ category }: { category: string }) {
  return (
    <tr className="bg-muted/50">
      <td
        colSpan={100}
        className="p-3 font-semibold text-sm uppercase tracking-wider text-muted-foreground"
      >
        {category}
      </td>
    </tr>
  );
}

function MobileCardView({
  items,
  features,
  showPrices,
  onCtaClick,
  groupByCategory,
}: {
  items: ComparisonItem[];
  features: Feature[];
  showPrices: boolean;
  onCtaClick?: (item: ComparisonItem) => void;
  groupByCategory: boolean;
}) {
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const selectedItem = items[selectedIndex];

  // Group features by category
  const groupedFeatures = groupByCategory
    ? features.reduce<Record<string, Feature[]>>((acc, feature) => {
        const category = feature.category ?? "Features";
        if (!acc[category]) acc[category] = [];
        acc[category].push(feature);
        return acc;
      }, {})
    : { Features: features };

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex overflow-x-auto gap-2 pb-2">
        {items.map((item, index) => (
          <Button
            key={item.id}
            variant={selectedIndex === index ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedIndex(index)}
            className="flex-shrink-0"
          >
            {item.name}
            {item.badge && (
              <Badge variant="secondary" className="ml-2 text-xs">
                {item.badge}
              </Badge>
            )}
          </Button>
        ))}
      </div>

      {/* Selected Item Card */}
      <div
        className={cn(
          "rounded-lg border p-6",
          selectedItem.highlighted && "border-primary bg-primary/5"
        )}
      >
        {/* Header */}
        <div className="text-center mb-6">
          <h3 className="text-xl font-bold">{selectedItem.name}</h3>
          {selectedItem.description && (
            <p className="text-muted-foreground mt-1">
              {selectedItem.description}
            </p>
          )}
          {showPrices && selectedItem.price && (
            <div className="mt-4">
              <PriceDisplay price={selectedItem.price} />
            </div>
          )}
          {selectedItem.ctaLabel && (
            <Button
              className="mt-4 w-full"
              onClick={() => onCtaClick?.(selectedItem)}
            >
              {selectedItem.ctaLabel}
            </Button>
          )}
        </div>

        {/* Features */}
        <div className="space-y-6">
          {Object.entries(groupedFeatures).map(([category, categoryFeatures]) => (
            <div key={category}>
              {groupByCategory && (
                <h4 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-3">
                  {category}
                </h4>
              )}
              <div className="space-y-3">
                {categoryFeatures.map((feature) => (
                  <div
                    key={feature.id}
                    className="flex items-center justify-between py-2 border-b last:border-0"
                  >
                    <span className="text-sm">{feature.name}</span>
                    <FeatureValueCell
                      value={selectedItem.features[feature.id]}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ComparisonTable({
  items,
  features,
  groupByCategory = false,
  showTooltips = true,
  highlightBest = true,
  mobileLayout = "scroll",
  stickyHeader = true,
  showPrices = true,
  onCtaClick,
  className,
}: ComparisonTableProps) {
  // Group features by category if needed
  const groupedFeatures = groupByCategory
    ? features.reduce<Record<string, Feature[]>>((acc, feature) => {
        const category = feature.category ?? "Features";
        if (!acc[category]) acc[category] = [];
        acc[category].push(feature);
        return acc;
      }, {})
    : null;

  const tableContent = (
    <table className="w-full border-collapse">
      <TableHeader
        items={items}
        showPrices={showPrices}
        onCtaClick={onCtaClick}
        sticky={stickyHeader}
      />
      <tbody>
        {groupedFeatures
          ? Object.entries(groupedFeatures).map(([category, categoryFeatures]) => (
              <React.Fragment key={category}>
                <CategoryHeader category={category} />
                {categoryFeatures.map((feature) => (
                  <FeatureRow
                    key={feature.id}
                    feature={feature}
                    items={items}
                    showTooltip={showTooltips}
                    highlightBest={highlightBest}
                  />
                ))}
              </React.Fragment>
            ))
          : features.map((feature) => (
              <FeatureRow
                key={feature.id}
                feature={feature}
                items={items}
                showTooltip={showTooltips}
                highlightBest={highlightBest}
              />
            ))}
      </tbody>
    </table>
  );

  return (
    <div className={className}>
      {/* Desktop Table */}
      <div className={cn("hidden md:block", mobileLayout === "scroll" && "md:hidden lg:block")}>
        <div className="rounded-lg border overflow-hidden">
          {tableContent}
        </div>
      </div>

      {/* Mobile Scroll */}
      {mobileLayout === "scroll" && (
        <div className="block lg:hidden">
          <ScrollArea className="rounded-lg border">
            <div className="min-w-[600px]">
              {tableContent}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>
      )}

      {/* Mobile Cards */}
      {mobileLayout === "cards" && (
        <div className="block md:hidden">
          <MobileCardView
            items={items}
            features={features}
            showPrices={showPrices}
            onCtaClick={onCtaClick}
            groupByCategory={groupByCategory}
          />
        </div>
      )}
    </div>
  );
}
```

### Key Implementation Notes

1. **Responsive Layouts**: Table, scroll, and card views
2. **Feature Grouping**: Optional category grouping
3. **Value Highlighting**: Best values emphasized
4. **Sticky Headers**: Headers stay visible while scrolling

## Variants

### Pricing Comparison

```tsx
<ComparisonTable
  items={[
    {
      id: "free",
      name: "Free",
      price: { amount: 0, period: "month" },
      ctaLabel: "Get Started",
      ctaHref: "/signup",
      features: {
        projects: 3,
        storage: "1GB",
        support: false,
        api: false,
      },
    },
    {
      id: "pro",
      name: "Pro",
      badge: "Popular",
      highlighted: true,
      price: { amount: 29, period: "month" },
      ctaLabel: "Start Trial",
      features: {
        projects: "Unlimited",
        storage: "100GB",
        support: true,
        api: true,
      },
    },
    {
      id: "enterprise",
      name: "Enterprise",
      price: { amount: 99, period: "month" },
      ctaLabel: "Contact Sales",
      features: {
        projects: "Unlimited",
        storage: "Unlimited",
        support: true,
        api: true,
      },
    },
  ]}
  features={[
    { id: "projects", name: "Projects" },
    { id: "storage", name: "Storage" },
    { id: "support", name: "Priority Support" },
    { id: "api", name: "API Access" },
  ]}
  showPrices
  highlightBest
/>
```

### Product Comparison

```tsx
<ComparisonTable
  items={products}
  features={[
    { id: "display", name: "Display Size", category: "Display" },
    { id: "resolution", name: "Resolution", category: "Display" },
    { id: "processor", name: "Processor", category: "Performance" },
    { id: "ram", name: "RAM", category: "Performance" },
    { id: "battery", name: "Battery Life", category: "Battery" },
  ]}
  groupByCategory
  showPrices
  mobileLayout="cards"
/>
```

### Feature Comparison

```tsx
<ComparisonTable
  items={[
    { id: "ours", name: "Our Product", highlighted: true, features: {...} },
    { id: "competitor", name: "Competitor A", features: {...} },
    { id: "competitor2", name: "Competitor B", features: {...} },
  ]}
  features={featureList}
  showPrices={false}
  showTooltips
/>
```

## Performance

### Large Tables

- Virtualize rows for 50+ features
- Lazy load feature descriptions
- Memoize cell components

### Mobile Optimization

- Card view reduces DOM nodes
- Scroll view uses native scrolling
- Tab switching is instant

## Accessibility

### Required Attributes

- Table has proper semantic structure
- Headers associated with cells
- Feature tooltips are keyboard accessible

### Screen Reader

- Features are read with plan context
- Boolean values announced as Yes/No
- Highlighted best values announced

### Keyboard Navigation

- Tab through interactive elements
- Tooltips accessible via focus
- CTAs reachable via keyboard

## Dependencies

```json
{
  "dependencies": {
    "lucide-react": "^0.460.0"
  }
}
```

## States

| State | Description | Visual Change |
|-------|-------------|---------------|
| Default | Table displaying comparison data normally | All columns visible with feature rows and values |
| Item Highlighted | A column/plan is marked as featured | Column has primary background tint, badge shows "Popular" or similar |
| Feature Tooltip Open | Hovering over feature info icon | Tooltip popover appears with feature description |
| Best Value Highlighted | Highest/best value in row emphasized | Cell text becomes bold with primary color |
| Mobile Scroll View | On smaller screens with scroll layout | Horizontal scroll enabled, min-width applied to table |
| Mobile Card View | On smaller screens with card layout | Tab buttons for plans, selected plan shown as card |
| Tab Selected | User selected a different plan in mobile view | Selected tab button is filled, card content updates |
| Sticky Header Active | User scrolled down past header | Header row remains fixed at top with background |
| CTA Hover | Mouse over call-to-action button | Button shows hover state with color change |
| Boolean True | Feature is available | Green checkmark icon displayed |
| Boolean False | Feature is not available | Gray X icon displayed |
| Partial Value | Feature is partially available | Yellow minus icon displayed |

## Anti-patterns

### 1. Missing Feature IDs in Data

```tsx
// Bad: Features without unique IDs
const features = [
  { name: "Storage" },
  { name: "Users" },
];

// Good: Features with unique IDs matching item.features keys
const features = [
  { id: "storage", name: "Storage" },
  { id: "users", name: "Users" },
];
```

### 2. Mismatched Feature Keys

```tsx
// Bad: Item features don't match feature IDs
const features = [{ id: "storage", name: "Storage" }];
const items = [{
  id: "pro",
  name: "Pro",
  features: { disk_space: "100GB" }  // Wrong key!
}];

// Good: Feature keys match exactly
const features = [{ id: "storage", name: "Storage" }];
const items = [{
  id: "pro",
  name: "Pro",
  features: { storage: "100GB" }  // Matches feature.id
}];
```

### 3. Too Many Columns Without Mobile Strategy

```tsx
// Bad: 6+ columns with scroll layout on mobile
<ComparisonTable
  items={sixDifferentPlans}
  features={features}
  mobileLayout="scroll"  // Hard to use with many columns
/>

// Good: Use cards layout for many items or limit columns
<ComparisonTable
  items={sixDifferentPlans}
  features={features}
  mobileLayout="cards"  // Better UX for many plans
/>
```

### 4. Not Grouping Related Features

```tsx
// Bad: Long flat list of 20+ features
<ComparisonTable
  features={twentyFeatures}
  items={plans}
  groupByCategory={false}
/>

// Good: Group features by category for better scanning
const features = [
  { id: "storage", name: "Storage", category: "Resources" },
  { id: "bandwidth", name: "Bandwidth", category: "Resources" },
  { id: "support", name: "Support", category: "Service" },
  { id: "sla", name: "SLA", category: "Service" },
];

<ComparisonTable
  features={features}
  items={plans}
  groupByCategory={true}
/>
```

## Related Skills

### Composes Into
- [templates/pricing-page](../templates/pricing-page.md)
- [templates/product-comparison](../templates/product-comparison.md)

---

## Changelog

### 2.0.0 (2025-01-17)
- Standardized to atomic design system v2
- Updated frontmatter schema
- Added explicit composition references

### 1.0.0 (2025-01-16)
- Initial implementation
- Three mobile layout options
- Feature grouping by category
- Value highlighting
