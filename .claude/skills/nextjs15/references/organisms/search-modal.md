---
id: o-search-modal
name: Search Modal
version: 2.0.0
layer: L3
category: overlays
description: Full-page search modal with keyboard navigation, recent searches, and instant results
tags: [search, modal, command, palette, keyboard]
performance:
  impact: medium
  lcp: low
  cls: low
formula: "SearchModal = Dialog(m-dialog) + Input(a-input) + Button(a-button)"
composes: []
dependencies:
  - react
  - "@radix-ui/react-dialog"
  - lucide-react
  - usehooks-ts
accessibility:
  wcag: AA
  keyboard: true
  screen-reader: true
---

# Search Modal

## Overview

A full-page search modal organism (command palette style) with keyboard navigation, instant search results, recent searches, and categorized results. Triggered by keyboard shortcut or search button.

## Composition Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│ SearchModal                                                      │
├─────────────────────────────────────────────────────────────────┤
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ Dialog (m-dialog)                                          │  │
│  │  ┌─────────────────────────────────────────────────────┐  │  │
│  │  │ Search Header                                        │  │  │
│  │  │  🔍 ┌──────────────────────────────────────┐ ⟳  ✕  │  │  │
│  │  │     │ Input (a-input)                      │        │  │  │
│  │  │     │ "Search pages, users, documents..."  │        │  │  │
│  │  │     └──────────────────────────────────────┘        │  │  │
│  │  └─────────────────────────────────────────────────────┘  │  │
│  │                                                            │  │
│  │  ┌─────────────────────────────────────────────────────┐  │  │
│  │  │ Results Area (scrollable)                            │  │  │
│  │  │                                                      │  │  │
│  │  │  RECENT SEARCHES                          [Clear]   │  │  │
│  │  │  ┌──────────────────────────────────────────────┐   │  │  │
│  │  │  │ 🕐 previous search query                     │   │  │  │
│  │  │  └──────────────────────────────────────────────┘   │  │  │
│  │  │                                                      │  │  │
│  │  │  QUICK ACTIONS                                       │  │  │
│  │  │  ┌──────────────────────────────────────────────┐   │  │  │
│  │  │  │ ┌────┐ Create new document         [Enter]   │   │  │  │
│  │  │  │ │ 📄 │ Start a new blank document            │   │  │  │
│  │  │  │ └────┘                                       │   │  │  │
│  │  │  └──────────────────────────────────────────────┘   │  │  │
│  │  │                                                      │  │  │
│  │  │  PAGES                                               │  │  │
│  │  │  ┌──────────────────────────────────────────────┐   │  │  │
│  │  │  │ ┌────┐ Dashboard                             │   │  │  │
│  │  │  │ │ 📁 │ Main dashboard page                   │   │  │  │
│  │  │  │ └────┘                                       │   │  │  │
│  │  │  └──────────────────────────────────────────────┘   │  │  │
│  │  │                                                      │  │  │
│  │  │  USERS                                               │  │  │
│  │  │  ┌──────────────────────────────────────────────┐   │  │  │
│  │  │  │ ┌────┐ John Doe                              │   │  │  │
│  │  │  │ │ 👤 │ john@example.com                      │   │  │  │
│  │  │  │ └────┘                                       │   │  │  │
│  │  │  └──────────────────────────────────────────────┘   │  │  │
│  │  └─────────────────────────────────────────────────────┘  │  │
│  │                                                            │  │
│  │  ┌─────────────────────────────────────────────────────┐  │  │
│  │  │ Keyboard Hints                                       │  │  │
│  │  │  [↑][↓] Navigate    [Enter] Select    [Esc] Close   │  │  │
│  │  └─────────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                  │
│  SearchTrigger: Button (a-button)                               │
│  ┌────────────────────────────────┐                             │
│  │ 🔍 Search...          [⌘K]    │                             │
│  └────────────────────────────────┘                             │
└─────────────────────────────────────────────────────────────────┘
```

## Implementation

```tsx
// components/organisms/search-modal.tsx
'use client';

import * as React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { useRouter } from 'next/navigation';
import {
  Search,
  X,
  ArrowRight,
  Clock,
  File,
  Hash,
  User,
  Settings,
  Command,
  CornerDownLeft,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import { useDebounce, useLocalStorage } from 'usehooks-ts';
import { cn } from '@/lib/utils';

// Types
interface SearchResult {
  id: string;
  type: 'page' | 'user' | 'document' | 'setting' | 'action';
  title: string;
  description?: string;
  url?: string;
  icon?: React.ReactNode;
  action?: () => void;
  keywords?: string[];
}

interface SearchCategory {
  name: string;
  results: SearchResult[];
}

interface SearchModalProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSearch?: (query: string) => Promise<SearchResult[]>;
  placeholder?: string;
  recentSearchesKey?: string;
  maxRecentSearches?: number;
  categories?: SearchCategory[];
  quickActions?: SearchResult[];
}

// Type icons
const typeIcons: Record<SearchResult['type'], React.ReactNode> = {
  page: <File className="h-4 w-4" />,
  user: <User className="h-4 w-4" />,
  document: <File className="h-4 w-4" />,
  setting: <Settings className="h-4 w-4" />,
  action: <ArrowRight className="h-4 w-4" />,
};

// Search Result Item
function SearchResultItem({
  result,
  isSelected,
  onSelect,
}: {
  result: SearchResult;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const icon = result.icon || typeIcons[result.type];

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors',
        isSelected ? 'bg-accent text-accent-foreground' : 'hover:bg-accent/50'
      )}
      role="option"
      aria-selected={isSelected}
    >
      <div
        className={cn(
          'flex h-10 w-10 items-center justify-center rounded-lg',
          isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted'
        )}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{result.title}</p>
        {result.description && (
          <p className="text-sm text-muted-foreground truncate">
            {result.description}
          </p>
        )}
      </div>
      {isSelected && (
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <CornerDownLeft className="h-3 w-3" />
          <span>Enter</span>
        </div>
      )}
    </button>
  );
}

// Category Section
function CategorySection({
  name,
  results,
  selectedIndex,
  startIndex,
  onSelect,
}: {
  name: string;
  results: SearchResult[];
  selectedIndex: number;
  startIndex: number;
  onSelect: (result: SearchResult) => void;
}) {
  if (results.length === 0) return null;

  return (
    <div className="mb-4">
      <h3 className="px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        {name}
      </h3>
      <div className="space-y-1">
        {results.map((result, index) => (
          <SearchResultItem
            key={result.id}
            result={result}
            isSelected={selectedIndex === startIndex + index}
            onSelect={() => onSelect(result)}
          />
        ))}
      </div>
    </div>
  );
}

// Recent Searches
function RecentSearches({
  searches,
  onSelect,
  onClear,
}: {
  searches: string[];
  onSelect: (query: string) => void;
  onClear: () => void;
}) {
  if (searches.length === 0) return null;

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between px-3 mb-2">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Recent Searches
        </h3>
        <button
          onClick={onClear}
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          Clear
        </button>
      </div>
      <div className="space-y-1">
        {searches.map((search, index) => (
          <button
            key={index}
            onClick={() => onSelect(search)}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left hover:bg-accent/50"
          >
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{search}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// Quick Actions
function QuickActions({
  actions,
  selectedIndex,
  startIndex,
  onSelect,
}: {
  actions: SearchResult[];
  selectedIndex: number;
  startIndex: number;
  onSelect: (action: SearchResult) => void;
}) {
  if (actions.length === 0) return null;

  return (
    <div className="mb-4">
      <h3 className="px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        Quick Actions
      </h3>
      <div className="space-y-1">
        {actions.map((action, index) => (
          <SearchResultItem
            key={action.id}
            result={action}
            isSelected={selectedIndex === startIndex + index}
            onSelect={() => onSelect(action)}
          />
        ))}
      </div>
    </div>
  );
}

// Keyboard Shortcuts Footer
function KeyboardHints() {
  return (
    <div className="flex items-center justify-center gap-4 border-t px-4 py-3 text-xs text-muted-foreground">
      <div className="flex items-center gap-1">
        <kbd className="rounded bg-muted px-1.5 py-0.5 font-mono">
          <ArrowUp className="h-3 w-3 inline" />
        </kbd>
        <kbd className="rounded bg-muted px-1.5 py-0.5 font-mono">
          <ArrowDown className="h-3 w-3 inline" />
        </kbd>
        <span>Navigate</span>
      </div>
      <div className="flex items-center gap-1">
        <kbd className="rounded bg-muted px-1.5 py-0.5 font-mono">Enter</kbd>
        <span>Select</span>
      </div>
      <div className="flex items-center gap-1">
        <kbd className="rounded bg-muted px-1.5 py-0.5 font-mono">Esc</kbd>
        <span>Close</span>
      </div>
    </div>
  );
}

// Main Search Modal
export function SearchModal({
  open: controlledOpen,
  onOpenChange,
  onSearch,
  placeholder = 'Search...',
  recentSearchesKey = 'recent-searches',
  maxRecentSearches = 5,
  categories: defaultCategories = [],
  quickActions = [],
}: SearchModalProps) {
  const router = useRouter();
  const [internalOpen, setInternalOpen] = React.useState(false);
  const [query, setQuery] = React.useState('');
  const [results, setResults] = React.useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const [recentSearches, setRecentSearches] = useLocalStorage<string[]>(
    recentSearchesKey,
    []
  );

  const inputRef = React.useRef<HTMLInputElement>(null);
  const debouncedQuery = useDebounce(query, 200);

  // Controlled vs uncontrolled open state
  const isOpen = controlledOpen ?? internalOpen;
  const setIsOpen = onOpenChange ?? setInternalOpen;

  // Calculate all selectable items
  const allItems = React.useMemo(() => {
    if (query) {
      return results;
    }
    return [...quickActions];
  }, [query, results, quickActions]);

  // Search effect
  React.useEffect(() => {
    if (!debouncedQuery.trim() || !onSearch) {
      setResults([]);
      return;
    }

    const search = async () => {
      setIsLoading(true);
      try {
        const searchResults = await onSearch(debouncedQuery);
        setResults(searchResults);
        setSelectedIndex(0);
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    search();
  }, [debouncedQuery, onSearch]);

  // Keyboard shortcut to open
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsOpen(!isOpen);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [isOpen, setIsOpen]);

  // Reset on close
  React.useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setQuery('');
        setResults([]);
        setSelectedIndex(0);
      }, 200);
    }
  }, [isOpen]);

  // Handle selection
  const handleSelect = (result: SearchResult) => {
    // Save to recent searches
    if (query.trim()) {
      setRecentSearches((prev) => {
        const filtered = prev.filter((s) => s !== query);
        return [query, ...filtered].slice(0, maxRecentSearches);
      });
    }

    // Execute action or navigate
    if (result.action) {
      result.action();
    } else if (result.url) {
      router.push(result.url);
    }

    setIsOpen(false);
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < allItems.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev > 0 ? prev - 1 : allItems.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (allItems[selectedIndex]) {
          handleSelect(allItems[selectedIndex]);
        }
        break;
    }
  };

  // Group results by type
  const groupedResults = React.useMemo(() => {
    const groups: SearchCategory[] = [];
    const types = ['page', 'document', 'user', 'setting', 'action'] as const;

    types.forEach((type) => {
      const typeResults = results.filter((r) => r.type === type);
      if (typeResults.length > 0) {
        groups.push({
          name: type.charAt(0).toUpperCase() + type.slice(1) + 's',
          results: typeResults,
        });
      }
    });

    return groups;
  }, [results]);

  return (
    <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content
          className={cn(
            'fixed left-1/2 top-[20%] z-50 w-full max-w-2xl -translate-x-1/2',
            'rounded-xl border bg-popover shadow-2xl',
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
            'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
            'data-[state=closed]:slide-out-to-left-1/2 data-[state=open]:slide-in-from-left-1/2',
            'data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-top-[48%]'
          )}
          onKeyDown={handleKeyDown}
        >
          {/* Search Input */}
          <div className="flex items-center gap-3 border-b px-4 py-3">
            <Search className="h-5 w-5 text-muted-foreground" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={placeholder}
              className="flex-1 bg-transparent text-lg outline-none placeholder:text-muted-foreground"
              autoFocus
            />
            {isLoading && (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            )}
            <Dialog.Close asChild>
              <button
                className="rounded-md p-1 hover:bg-accent"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </Dialog.Close>
          </div>

          {/* Results */}
          <div
            className="max-h-[400px] overflow-y-auto p-2"
            role="listbox"
            aria-label="Search results"
          >
            {!query.trim() && (
              <>
                <RecentSearches
                  searches={recentSearches}
                  onSelect={setQuery}
                  onClear={() => setRecentSearches([])}
                />
                <QuickActions
                  actions={quickActions}
                  selectedIndex={selectedIndex}
                  startIndex={0}
                  onSelect={handleSelect}
                />
              </>
            )}

            {query.trim() && results.length === 0 && !isLoading && (
              <div className="py-12 text-center">
                <p className="text-muted-foreground">
                  No results found for "{query}"
                </p>
              </div>
            )}

            {query.trim() && results.length > 0 && (
              <>
                {groupedResults.map((category, catIndex) => {
                  const startIndex = groupedResults
                    .slice(0, catIndex)
                    .reduce((acc, cat) => acc + cat.results.length, 0);
                  return (
                    <CategorySection
                      key={category.name}
                      name={category.name}
                      results={category.results}
                      selectedIndex={selectedIndex}
                      startIndex={startIndex}
                      onSelect={handleSelect}
                    />
                  );
                })}
              </>
            )}
          </div>

          {/* Keyboard Hints */}
          <KeyboardHints />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

// Search Trigger Button
export function SearchTrigger({
  onClick,
  className,
}: {
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-2 rounded-lg border bg-background px-3 py-2 text-sm text-muted-foreground',
        'hover:bg-accent hover:text-accent-foreground transition-colors',
        'focus:outline-none focus:ring-2 focus:ring-ring',
        className
      )}
    >
      <Search className="h-4 w-4" />
      <span className="hidden sm:inline">Search...</span>
      <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
        <Command className="h-3 w-3" />K
      </kbd>
    </button>
  );
}
```

## Usage

### Basic Usage

```tsx
import { SearchModal, SearchTrigger } from '@/components/organisms/search-modal';

export function Header() {
  const [searchOpen, setSearchOpen] = useState(false);

  const handleSearch = async (query: string) => {
    const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
    return res.json();
  };

  return (
    <header>
      <SearchTrigger onClick={() => setSearchOpen(true)} />
      <SearchModal
        open={searchOpen}
        onOpenChange={setSearchOpen}
        onSearch={handleSearch}
        placeholder="Search pages, users, documents..."
      />
    </header>
  );
}
```

### With Quick Actions

```tsx
<SearchModal
  onSearch={handleSearch}
  quickActions={[
    {
      id: 'new-doc',
      type: 'action',
      title: 'Create new document',
      description: 'Start a new blank document',
      icon: <Plus className="h-4 w-4" />,
      action: () => router.push('/documents/new'),
    },
    {
      id: 'settings',
      type: 'action',
      title: 'Go to settings',
      icon: <Settings className="h-4 w-4" />,
      url: '/settings',
    },
  ]}
/>
```

### With Categories

```tsx
<SearchModal
  onSearch={async (query) => {
    const [pages, users, docs] = await Promise.all([
      searchPages(query),
      searchUsers(query),
      searchDocs(query),
    ]);
    return [...pages, ...users, ...docs];
  }}
/>
```

## States

| State | Description | Visual Change |
|-------|-------------|---------------|
| Closed | Modal is not visible | Hidden from view |
| Open Empty | Modal open, no query entered | Shows recent searches and quick actions |
| Searching | User has entered query, fetching results | Loading spinner visible, input active |
| Results | Search complete with matches | Grouped results displayed with selection highlight |
| No Results | Search complete, no matches found | Empty state message shown |
| Navigating | User navigating with keyboard | Selected item highlighted with accent background |
| Loading | Async search in progress | Spinner next to input, results area may show skeleton |

## Anti-patterns

### 1. Not Debouncing Search Queries

```tsx
// Bad: Firing API call on every keystroke
function SearchModal({ onSearch }) {
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (query) {
      onSearch(query); // Fires on every character!
    }
  }, [query]);

  return <input value={query} onChange={(e) => setQuery(e.target.value)} />;
}

// Good: Debouncing the search
function SearchModal({ onSearch }) {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 200);

  useEffect(() => {
    if (debouncedQuery.trim()) {
      onSearch(debouncedQuery);
    }
  }, [debouncedQuery]);

  return <input value={query} onChange={(e) => setQuery(e.target.value)} />;
}
```

### 2. Missing Keyboard Navigation Support

```tsx
// Bad: Click-only interaction
function SearchResults({ results, onSelect }) {
  return (
    <div>
      {results.map((result) => (
        <div onClick={() => onSelect(result)}>{result.title}</div>
      ))}
    </div>
  );
}

// Good: Full keyboard navigation with arrow keys and enter
function SearchResults({ results, onSelect, selectedIndex }) {
  return (
    <div role="listbox">
      {results.map((result, index) => (
        <button
          key={result.id}
          role="option"
          aria-selected={index === selectedIndex}
          onClick={() => onSelect(result)}
          onKeyDown={(e) => e.key === "Enter" && onSelect(result)}
          className={index === selectedIndex ? "bg-accent" : ""}
        >
          {result.title}
        </button>
      ))}
    </div>
  );
}
```

### 3. Not Resetting State on Close

```tsx
// Bad: Old state persists when reopening
function SearchModal({ open, onOpenChange }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* Query and results persist after close */}
    </Dialog>
  );
}

// Good: Reset state when modal closes
function SearchModal({ open, onOpenChange }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);

  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        setQuery("");
        setResults([]);
      }, 200); // Wait for close animation
    }
  }, [open]);

  return <Dialog open={open} onOpenChange={onOpenChange}>{/* ... */}</Dialog>;
}
```

### 4. Not Trapping Focus Inside Modal

```tsx
// Bad: Focus can escape to background elements
<Dialog.Content>
  <input type="text" />
  <div>{results}</div>
</Dialog.Content>

// Good: Use Radix Dialog which handles focus trap automatically
<Dialog.Root>
  <Dialog.Portal>
    <Dialog.Overlay />
    <Dialog.Content onKeyDown={handleKeyDown}>
      <input type="text" autoFocus />
      <div role="listbox">{results}</div>
    </Dialog.Content>
  </Dialog.Portal>
</Dialog.Root>
```

## Related Skills

- `organisms/command-palette` - Command palette
- `molecules/search-input` - Search input field
- `patterns/keyboard-navigation` - Keyboard nav patterns

## Changelog

### 2.0.0 (2025-01-17)
- Standardized to atomic design system v2
- Updated frontmatter schema
- Added explicit composition references

### 1.0.0 (2025-01-17)
- Initial implementation with Radix Dialog
- Keyboard shortcut (Cmd/Ctrl+K)
- Recent searches with localStorage
- Debounced search
- Keyboard navigation
- Grouped results by type
