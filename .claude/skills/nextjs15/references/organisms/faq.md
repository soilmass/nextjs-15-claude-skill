---
id: o-faq
name: FAQ
version: 2.0.0
layer: L3
category: marketing
description: Frequently asked questions section with expandable accordions
tags: [faq, questions, accordion, help, support]
formula: "FAQ = AccordionItem(m-accordion-item)[] + Input(a-input) + Button(a-button) + Badge(a-badge)"
composes:
  - ../molecules/accordion-item.md
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

# FAQ

## Overview

The FAQ organism displays frequently asked questions in an accordion format with smooth animations, search functionality, and category filtering. Supports multiple layout variants for different use cases.

## Composition Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│  FAQ (o-faq)                                                    │
├─────────────────────────────────────────────────────────────────┤
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  Header                                                   │  │
│  │  ├── Title (h2)                                           │  │
│  │  └── Description                                          │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  Search & Filters                                         │  │
│  │  ├── Input (a-input) [search icon]                        │  │
│  │  └── Badge (a-badge)[] [category filters]                 │  │
│  │      └── Button (a-button) [All, Category1, Category2]    │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  Accordion                                                │  │
│  │  ├── AccordionItem (m-accordion-item)                     │  │
│  │  │   ├── Trigger (question)                               │  │
│  │  │   └── Content (answer)                                 │  │
│  │  ├── AccordionItem (m-accordion-item)                     │  │
│  │  │   ├── Trigger (question)                               │  │
│  │  │   └── Content (answer)                                 │  │
│  │  └── ... (repeating items)                                │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  Contact CTA (optional)                                   │  │
│  │  ├── Title                                                │  │
│  │  ├── Description                                          │  │
│  │  └── Button (a-button) [Contact Support]                  │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## When to Use

Use this skill when:
- Building FAQ pages
- Creating help/support sections
- Implementing product documentation
- Building knowledge bases

## Molecules Used

- [accordion-item](../molecules/accordion-item.md) - Individual Q&A items

## Implementation

```typescript
// components/organisms/faq.tsx
"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Plus, Minus, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category?: string;
}

interface FAQProps {
  /** Section title */
  title?: string;
  /** Section description */
  description?: string;
  /** FAQ items */
  items: FAQItem[];
  /** Show search */
  showSearch?: boolean;
  /** Show category filters */
  showCategories?: boolean;
  /** Layout variant */
  variant?: "default" | "cards" | "columns" | "minimal";
  /** Allow multiple open */
  allowMultiple?: boolean;
  /** Default open items */
  defaultOpen?: string[];
  /** Contact CTA */
  contactCta?: {
    title: string;
    description: string;
    buttonLabel: string;
    href: string;
  };
  /** Additional class names */
  className?: string;
}

export function FAQ({
  title = "Frequently Asked Questions",
  description,
  items,
  showSearch = false,
  showCategories = false,
  variant = "default",
  allowMultiple = false,
  defaultOpen = [],
  contactCta,
  className,
}: FAQProps) {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState<string | null>(null);
  const [openItems, setOpenItems] = React.useState<string[]>(defaultOpen);

  // Get unique categories
  const categories = React.useMemo(() => {
    const cats = new Set<string>();
    items.forEach((item) => {
      if (item.category) cats.add(item.category);
    });
    return Array.from(cats);
  }, [items]);

  // Filter items
  const filteredItems = React.useMemo(() => {
    return items.filter((item) => {
      const matchesSearch =
        !searchQuery ||
        item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.answer.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        !selectedCategory || item.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [items, searchQuery, selectedCategory]);

  const handleValueChange = (value: string | string[]) => {
    if (Array.isArray(value)) {
      setOpenItems(value);
    } else {
      setOpenItems(value ? [value] : []);
    }
  };

  const renderAccordion = (faqItems: FAQItem[]) => (
    <Accordion
      type={allowMultiple ? "multiple" : "single"}
      value={allowMultiple ? openItems : openItems[0]}
      onValueChange={handleValueChange}
      collapsible={!allowMultiple}
      className="space-y-4"
    >
      {faqItems.map((item) => (
        <AccordionItem
          key={item.id}
          value={item.id}
          className={cn(
            variant === "cards" &&
              "border rounded-lg px-4 data-[state=open]:bg-muted/50",
            variant === "minimal" && "border-0 border-b"
          )}
        >
          <AccordionTrigger
            className={cn(
              "hover:no-underline text-left",
              variant === "minimal" && "py-6"
            )}
          >
            <span className="font-medium">{item.question}</span>
          </AccordionTrigger>
          <AccordionContent className="text-muted-foreground">
            <div
              className="prose prose-sm dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: item.answer }}
            />
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );

  return (
    <section className={cn("py-20 lg:py-32", className)}>
      <div className="container">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          {title && (
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
              {title}
            </h2>
          )}
          {description && (
            <p className="text-lg text-muted-foreground">{description}</p>
          )}
        </div>

        {/* Search and Filters */}
        {(showSearch || showCategories) && (
          <div className="max-w-2xl mx-auto mb-8 space-y-4">
            {showSearch && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search questions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            )}

            {showCategories && categories.length > 0 && (
              <div className="flex flex-wrap gap-2 justify-center">
                <Button
                  variant={selectedCategory === null ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(null)}
                >
                  All
                </Button>
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category}
                  </Button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* FAQ Content */}
        {variant === "columns" ? (
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <div>
              {renderAccordion(
                filteredItems.filter((_, i) => i % 2 === 0)
              )}
            </div>
            <div>
              {renderAccordion(
                filteredItems.filter((_, i) => i % 2 === 1)
              )}
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto">
            {filteredItems.length > 0 ? (
              renderAccordion(filteredItems)
            ) : (
              <p className="text-center text-muted-foreground py-8">
                No questions found matching your search.
              </p>
            )}
          </div>
        )}

        {/* Contact CTA */}
        {contactCta && (
          <div className="mt-16 text-center max-w-xl mx-auto">
            <div className="bg-muted rounded-lg p-8">
              <h3 className="text-xl font-semibold mb-2">{contactCta.title}</h3>
              <p className="text-muted-foreground mb-4">
                {contactCta.description}
              </p>
              <Button asChild>
                <a href={contactCta.href}>{contactCta.buttonLabel}</a>
              </Button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
```

### Key Implementation Notes

1. **Search Filtering**: Searches both question and answer text
2. **Category Filters**: Optional category-based filtering
3. **Multiple Layouts**: Default, cards, columns, minimal variants
4. **Rich Content**: Supports HTML in answers

## Variants

### Default FAQ

```tsx
<FAQ
  items={[
    {
      id: "1",
      question: "What is your refund policy?",
      answer: "We offer a 30-day money-back guarantee.",
    },
    {
      id: "2",
      question: "How do I cancel my subscription?",
      answer: "You can cancel anytime from your account settings.",
    },
  ]}
/>
```

### With Search and Categories

```tsx
<FAQ
  items={faqItems}
  showSearch
  showCategories
  contactCta={{
    title: "Still have questions?",
    description: "Can't find what you're looking for?",
    buttonLabel: "Contact Support",
    href: "/contact",
  }}
/>
```

### Two-Column Layout

```tsx
<FAQ
  variant="columns"
  items={faqItems}
  allowMultiple
/>
```

### Minimal Style

```tsx
<FAQ
  variant="minimal"
  items={faqItems}
/>
```

## Accessibility

### Required Attributes

- Accordion uses proper ARIA pattern
- Questions are focusable
- Expanded state is announced

### Keyboard Navigation

| Key | Action |
|-----|--------|
| `Tab` | Navigate to questions |
| `Enter/Space` | Toggle answer |
| `Arrow Up/Down` | Navigate between items |

## Dependencies

```json
{
  "dependencies": {
    "@radix-ui/react-accordion": "^1.2.0",
    "lucide-react": "^0.460.0"
  }
}
```

## States

| State | Description | Visual Change |
|-------|-------------|---------------|
| Default | FAQ with all items collapsed | Questions visible with expand icons, answers hidden |
| Item Expanded | Single FAQ item open | Answer visible, expand icon rotated, smooth height animation |
| Multiple Expanded | Multiple items open (if allowed) | Several answers visible simultaneously |
| Search Active | User typing in search field | Search input focused with visible text |
| Search Results | Filtered by search query | Only matching FAQs shown, others hidden |
| No Results | Search has no matches | "No questions found" message displayed |
| Category Selected | User filtered by category | Active category button highlighted, other FAQs filtered out |
| All Categories | No category filter active | "All" button highlighted, all FAQs visible |
| Item Hover | Mouse over collapsed question | Question text or trigger shows subtle highlight |
| Columns Layout | Two-column variant active | FAQs split across two columns side by side |
| Cards Variant | Card-styled items | Each FAQ item has card background and border |
| Minimal Variant | Simplified styling | No card backgrounds, only bottom borders |

## Anti-patterns

### 1. Missing Unique IDs

```tsx
// Bad: FAQ items without unique IDs
const items = [
  { question: "What is this?", answer: "..." },
  { question: "How does it work?", answer: "..." },
];

// Good: Each item has a unique ID
const items = [
  { id: "what-is", question: "What is this?", answer: "..." },
  { id: "how-works", question: "How does it work?", answer: "..." },
];
```

### 2. Allowing Multiple Without Reason

```tsx
// Bad: Multiple open creates overwhelming content
<FAQ
  items={twentyFAQItems}
  allowMultiple={true}  // Users may open all, creating huge scroll
/>

// Good: Single open for focused reading, or limit items
<FAQ
  items={twentyFAQItems}
  allowMultiple={false}  // One at a time for clarity
/>

// Or provide search for long lists
<FAQ
  items={twentyFAQItems}
  showSearch={true}
  allowMultiple={false}
/>
```

### 3. HTML in Answers Without Sanitization

```tsx
// Bad: Directly using user-provided HTML
<FAQ
  items={[{
    id: "1",
    question: "FAQ",
    answer: userSubmittedHTML,  // XSS vulnerability!
  }]}
/>

// Good: Sanitize HTML or use plain text
import DOMPurify from 'dompurify';

<FAQ
  items={[{
    id: "1",
    question: "FAQ",
    answer: DOMPurify.sanitize(userSubmittedHTML),
  }]}
/>
```

### 4. Categories Without Category Data

```tsx
// Bad: showCategories enabled but items have no categories
<FAQ
  items={[
    { id: "1", question: "Q1", answer: "A1" },  // No category!
    { id: "2", question: "Q2", answer: "A2" },  // No category!
  ]}
  showCategories={true}  // Empty category filter!
/>

// Good: Provide category for each item when using categories
<FAQ
  items={[
    { id: "1", question: "Q1", answer: "A1", category: "General" },
    { id: "2", question: "Q2", answer: "A2", category: "Billing" },
  ]}
  showCategories={true}
/>
```

## Related Skills

### Composes From
- [molecules/accordion-item](../molecules/accordion-item.md)

### Composes Into
- [templates/faq-page](../templates/faq-page.md)
- [templates/landing-page](../templates/landing-page.md)

---

## Changelog

### 2.0.0 (2025-01-17)
- Standardized to atomic design system v2
- Updated frontmatter schema
- Added explicit composition references

### 1.0.0 (2025-01-16)
- Initial implementation
- Search and category filtering
- Four layout variants
- Contact CTA option
