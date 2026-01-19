---
id: o-code-block
name: Code Block
version: 1.0.0
layer: L3
category: developer
description: Large code block with syntax highlighting, line numbers, copy button, and language indicator
tags: [code, syntax, highlighting, developer, documentation]
formula: "CodeBlock = Code(a-code) + CopyButton(m-copy-button) + Badge(a-badge) + LineNumbers"
composes:
  - ../atoms/display-code.md
  - ../molecules/copy-button.md
  - ../atoms/display-badge.md
dependencies:
  - react
  - lucide-react
performance:
  impact: medium
  lcp: low
  cls: low
accessibility:
  wcag: AA
  keyboard: true
  screen-reader: true
---

# Code Block

## Overview

A comprehensive code block organism for displaying code snippets with syntax highlighting, line numbers, copy functionality, and language indication. Supports themes and collapsible content for large blocks.

## When to Use

Use this skill when:
- Displaying code examples in documentation
- Building technical blog posts
- Creating code playground interfaces
- Showing API response examples

## Composition Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        CodeBlock (L3)                            │
├─────────────────────────────────────────────────────────────────┤
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  Header Bar                                               │  │
│  │  ┌─────────────┐                    ┌─────┐ ┌──────────┐ │  │
│  │  │ Badge(lang) │  filename.tsx      │Wrap │ │CopyButton│ │  │
│  │  │ TypeScript  │                    │ Btn │ │(m-copy)  │ │  │
│  │  └─────────────┘                    └─────┘ └──────────┘ │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  Code Area                                                │  │
│  │  ┌─────┬─────────────────────────────────────────────┐    │  │
│  │  │ 1   │  import React from 'react';                 │    │  │
│  │  │ 2   │                                             │    │  │
│  │  │ 3   │  export function Component() {              │    │  │
│  │  │ 4   │    return <div>Hello</div>;                 │    │  │
│  │  │ 5   │  }                                          │    │  │
│  │  │     │  (highlighted lines supported)              │    │  │
│  │  └─────┴─────────────────────────────────────────────┘    │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  Footer (optional, for expandable)                        │  │
│  │  [Show more] / [Collapse]                                │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## Implementation

```tsx
// components/organisms/code-block.tsx
'use client';

import * as React from 'react';
import { Copy, Check, WrapText, ChevronDown, ChevronUp, FileCode } from 'lucide-react';
import { cn } from '@/lib/utils';

// Types
interface CodeBlockProps {
  code: string;
  language?: string;
  filename?: string;
  showLineNumbers?: boolean;
  highlightLines?: number[];
  startLine?: number;
  maxHeight?: number;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  wrapLines?: boolean;
  theme?: 'dark' | 'light';
  className?: string;
}

// Language display names
const languageNames: Record<string, string> = {
  ts: 'TypeScript',
  tsx: 'TypeScript',
  js: 'JavaScript',
  jsx: 'JavaScript',
  py: 'Python',
  python: 'Python',
  rb: 'Ruby',
  go: 'Go',
  rs: 'Rust',
  rust: 'Rust',
  java: 'Java',
  cpp: 'C++',
  c: 'C',
  cs: 'C#',
  php: 'PHP',
  html: 'HTML',
  css: 'CSS',
  scss: 'SCSS',
  json: 'JSON',
  yaml: 'YAML',
  yml: 'YAML',
  md: 'Markdown',
  sql: 'SQL',
  sh: 'Shell',
  bash: 'Bash',
  zsh: 'Shell',
  graphql: 'GraphQL',
  dockerfile: 'Dockerfile',
};

// Language colors for badges
const languageColors: Record<string, string> = {
  ts: 'bg-blue-100 text-blue-700',
  tsx: 'bg-blue-100 text-blue-700',
  js: 'bg-yellow-100 text-yellow-700',
  jsx: 'bg-yellow-100 text-yellow-700',
  py: 'bg-green-100 text-green-700',
  python: 'bg-green-100 text-green-700',
  go: 'bg-cyan-100 text-cyan-700',
  rs: 'bg-orange-100 text-orange-700',
  rust: 'bg-orange-100 text-orange-700',
  html: 'bg-red-100 text-red-700',
  css: 'bg-purple-100 text-purple-700',
  json: 'bg-gray-100 text-gray-700',
};

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="p-1.5 rounded hover:bg-white/10 transition-colors"
      aria-label="Copy code"
    >
      {copied ? (
        <Check className="h-4 w-4 text-green-400" />
      ) : (
        <Copy className="h-4 w-4" />
      )}
    </button>
  );
}

function LineNumber({
  number,
  isHighlighted,
}: {
  number: number;
  isHighlighted: boolean;
}) {
  return (
    <span
      className={cn(
        'inline-block w-10 pr-4 text-right select-none',
        isHighlighted ? 'text-blue-400' : 'text-zinc-500'
      )}
    >
      {number}
    </span>
  );
}

export function CodeBlock({
  code,
  language = 'text',
  filename,
  showLineNumbers = true,
  highlightLines = [],
  startLine = 1,
  maxHeight,
  collapsible = false,
  defaultCollapsed = false,
  wrapLines = false,
  theme = 'dark',
  className,
}: CodeBlockProps) {
  const [isCollapsed, setIsCollapsed] = React.useState(defaultCollapsed);
  const [shouldWrap, setShouldWrap] = React.useState(wrapLines);

  const lines = code.split('\n');
  const displayedLines = collapsible && isCollapsed ? lines.slice(0, 10) : lines;
  const hasMoreLines = collapsible && lines.length > 10;

  const langKey = language.toLowerCase();
  const langName = languageNames[langKey] || language;
  const langColor = languageColors[langKey] || 'bg-zinc-700 text-zinc-300';

  const themeClasses = {
    dark: 'bg-zinc-950 text-zinc-50',
    light: 'bg-zinc-100 text-zinc-900 border',
  };

  return (
    <div className={cn('rounded-lg overflow-hidden', themeClasses[theme], className)}>
      {/* Header */}
      <div
        className={cn(
          'flex items-center justify-between px-4 py-2',
          theme === 'dark' ? 'border-b border-zinc-800' : 'border-b border-zinc-200'
        )}
      >
        <div className="flex items-center gap-3">
          <span className={cn('rounded px-2 py-0.5 text-xs font-medium', langColor)}>
            {langName}
          </span>
          {filename && (
            <span className="flex items-center gap-1.5 text-sm text-zinc-400">
              <FileCode className="h-4 w-4" />
              {filename}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShouldWrap(!shouldWrap)}
            className={cn(
              'p-1.5 rounded transition-colors',
              theme === 'dark' ? 'hover:bg-white/10' : 'hover:bg-black/10',
              shouldWrap && 'bg-white/10'
            )}
            aria-label={shouldWrap ? 'Disable line wrap' : 'Enable line wrap'}
          >
            <WrapText className="h-4 w-4" />
          </button>
          <CopyButton text={code} />
        </div>
      </div>

      {/* Code Area */}
      <div
        className={cn('overflow-auto', !shouldWrap && 'overflow-x-auto')}
        style={{ maxHeight: maxHeight ? `${maxHeight}px` : undefined }}
      >
        <pre className="p-4 text-sm leading-relaxed">
          <code>
            {displayedLines.map((line, index) => {
              const lineNumber = startLine + index;
              const isHighlighted = highlightLines.includes(lineNumber);

              return (
                <div
                  key={index}
                  className={cn(
                    'flex',
                    isHighlighted && (theme === 'dark' ? 'bg-blue-500/10 -mx-4 px-4' : 'bg-blue-100 -mx-4 px-4'),
                    shouldWrap ? 'whitespace-pre-wrap break-words' : 'whitespace-pre'
                  )}
                >
                  {showLineNumbers && (
                    <LineNumber number={lineNumber} isHighlighted={isHighlighted} />
                  )}
                  <span className="flex-1">{line || ' '}</span>
                </div>
              );
            })}
          </code>
        </pre>
      </div>

      {/* Footer (for collapsible) */}
      {hasMoreLines && (
        <div className={cn('border-t px-4 py-2', theme === 'dark' ? 'border-zinc-800' : 'border-zinc-200')}>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="flex items-center gap-1 text-sm text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            {isCollapsed ? (
              <>
                <ChevronDown className="h-4 w-4" />
                Show {lines.length - 10} more lines
              </>
            ) : (
              <>
                <ChevronUp className="h-4 w-4" />
                Collapse
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}

// Inline code variant
export function InlineCode({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <code
      className={cn(
        'rounded bg-muted px-1.5 py-0.5 font-mono text-sm',
        className
      )}
    >
      {children}
    </code>
  );
}
```

## Usage

### Basic Usage

```tsx
import { CodeBlock } from '@/components/organisms/code-block';

<CodeBlock
  code={`function greet(name: string) {
  return \`Hello, \${name}!\`;
}`}
  language="typescript"
/>
```

### With Highlighted Lines

```tsx
<CodeBlock
  code={code}
  language="tsx"
  filename="component.tsx"
  highlightLines={[3, 4, 5]}
  showLineNumbers
/>
```

### Collapsible Large Code

```tsx
<CodeBlock
  code={largeCodeSnippet}
  language="python"
  collapsible
  defaultCollapsed
  maxHeight={400}
/>
```

### Light Theme

```tsx
<CodeBlock
  code={code}
  language="json"
  theme="light"
  showLineNumbers={false}
/>
```

## States

| State | Description | Visual Change |
|-------|-------------|---------------|
| Default | Code block in normal display mode | Standard syntax highlighting with visible line numbers |
| Collapsed | Large code blocks with content hidden | Shows first 10 lines with "Show more" button in footer |
| Expanded | Previously collapsed code now fully visible | All lines shown with "Collapse" button in footer |
| Copied | User clicked copy button successfully | Copy icon changes to checkmark with green color for 2 seconds |
| Line Wrapped | Text wrapping enabled for long lines | Lines wrap within container, wrap button appears active |
| Line Highlighted | Specific lines marked for emphasis | Highlighted lines have blue background tint |
| Light Theme | Alternative color scheme selected | Light background with dark text and adjusted syntax colors |
| Hover (Copy Button) | Mouse over copy button | Button background becomes slightly visible |
| Hover (Wrap Button) | Mouse over wrap toggle | Button background becomes slightly visible |

## Anti-patterns

### 1. Missing Language Specification

```tsx
// Bad: No language specified, no syntax highlighting
<CodeBlock
  code={codeSnippet}
/>

// Good: Language specified for proper highlighting
<CodeBlock
  code={codeSnippet}
  language="typescript"
/>
```

### 2. Hardcoding Inline Styles Instead of Using Theme

```tsx
// Bad: Overriding theme with inline styles
<CodeBlock
  code={code}
  language="tsx"
  className="bg-black text-white"
  style={{ backgroundColor: '#1a1a1a' }}
/>

// Good: Using the theme prop for consistent theming
<CodeBlock
  code={code}
  language="tsx"
  theme="dark"
/>
```

### 3. Not Using Collapsible for Long Code

```tsx
// Bad: Showing 200 lines of code without collapse
<CodeBlock
  code={veryLongCodeSnippet}
  language="python"
/>

// Good: Using collapsible with maxHeight for long code
<CodeBlock
  code={veryLongCodeSnippet}
  language="python"
  collapsible
  defaultCollapsed
  maxHeight={400}
/>
```

### 4. Invalid Highlight Line Numbers

```tsx
// Bad: Highlighting lines that don't exist in the code
<CodeBlock
  code={`const x = 1;\nconst y = 2;`}
  language="js"
  highlightLines={[1, 2, 3, 10, 15]} // Lines 3, 10, 15 don't exist
/>

// Good: Only highlighting valid line numbers
<CodeBlock
  code={`const x = 1;\nconst y = 2;`}
  language="js"
  highlightLines={[1, 2]}
/>
```

## Related Skills

- `atoms/display-code` - Inline code display
- `molecules/copy-button` - Copy functionality
- `organisms/api-documentation` - API docs

## Changelog

### 1.0.0 (2025-01-18)

- Initial implementation
- Line numbers with highlighting
- Copy button
- Light/dark themes
- Collapsible content
- Line wrapping toggle
