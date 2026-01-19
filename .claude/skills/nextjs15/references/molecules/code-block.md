---
id: m-code-block
name: Code Block
version: 2.0.0
layer: L2
category: content
description: Syntax highlighted code block with copy button and optional line numbers
tags: [code, syntax, highlight, copy, pre, programming]
formula: "CodeBlock = Code(a-display-code) + CopyButton(m-copy-button) + LineNumbers(a-display-text)"
composes:
  - ../atoms/display-code.md
  - ../atoms/display-text.md
  - ../atoms/input-button.md
dependencies:
  "shiki": "^1.0.0"
performance:
  impact: medium
  lcp: medium
  cls: low
accessibility:
  wcag: AA
  keyboard: true
  screen-reader: true
---

# Code Block

## Overview

The Code Block molecule displays syntax-highlighted code with optional line numbers, a copy-to-clipboard button, and language indicator. Supports multiple programming languages via Shiki syntax highlighter.

## When to Use

Use this skill when:
- Displaying code snippets in documentation
- Showing API examples or configuration
- Building technical tutorials or guides
- Creating code comparison views

## Composition Diagram

```
+-----------------------------------------------+
|                   CodeBlock                    |
+-----------------------------------------------+
| +-------------------------------------------+ |
| |  Header Bar                               | |
| |  [Language: typescript]      [Copy]       | |
| +-------------------------------------------+ |
| +-------------------------------------------+ |
| |  Code Area                                | |
| | +------+--------------------------------+ | |
| | | Line | Code Content                   | | |
| | | Nums | (a-display-code)               | | |
| | +------+--------------------------------+ | |
| | |  1   | import { useState } from ...   | | |
| | |  2   | export function Component() {  | | |
| | |  3   |   const [count, setCount] =... | | |
| | |  4   | }                              | | |
| | +------+--------------------------------+ | |
| +-------------------------------------------+ |
+-----------------------------------------------+
```

## Atoms Used

- [display-code](../atoms/display-code.md) - Syntax highlighted code
- [display-text](../atoms/display-text.md) - Line numbers, language label
- [input-button](../atoms/input-button.md) - Copy button

## Implementation

```typescript
// components/ui/code-block.tsx
"use client";

import * as React from "react";
import { Check, Copy, Terminal } from "lucide-react";
import { cn } from "@/lib/utils";

interface CodeBlockProps {
  /** Code content to display */
  code: string;
  /** Programming language for syntax highlighting */
  language?: string;
  /** Show line numbers */
  showLineNumbers?: boolean;
  /** Starting line number */
  startLine?: number;
  /** Lines to highlight */
  highlightLines?: number[];
  /** Show copy button */
  showCopy?: boolean;
  /** Show language label */
  showLanguage?: boolean;
  /** Filename to display */
  filename?: string;
  /** Maximum height with scroll */
  maxHeight?: string;
  className?: string;
}

export function CodeBlock({
  code,
  language = "plaintext",
  showLineNumbers = true,
  startLine = 1,
  highlightLines = [],
  showCopy = true,
  showLanguage = true,
  filename,
  maxHeight,
  className,
}: CodeBlockProps) {
  const [copied, setCopied] = React.useState(false);
  const lines = code.trim().split("\n");

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={cn(
        "relative rounded-lg border bg-zinc-950 text-zinc-50",
        className
      )}
    >
      {/* Header */}
      {(showLanguage || filename || showCopy) && (
        <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-2">
          <div className="flex items-center gap-2">
            <Terminal className="h-4 w-4 text-zinc-400" />
            <span className="text-sm text-zinc-400">
              {filename || language}
            </span>
          </div>
          {showCopy && (
            <button
              onClick={handleCopy}
              className={cn(
                "flex items-center gap-1 rounded px-2 py-1 text-xs transition-colors",
                "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
              )}
              aria-label={copied ? "Copied" : "Copy code"}
            >
              {copied ? (
                <>
                  <Check className="h-3 w-3" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3" />
                  Copy
                </>
              )}
            </button>
          )}
        </div>
      )}

      {/* Code content */}
      <div
        className={cn("overflow-auto p-4", maxHeight && `max-h-[${maxHeight}]`)}
        style={maxHeight ? { maxHeight } : undefined}
      >
        <pre className="text-sm">
          <code>
            {lines.map((line, index) => {
              const lineNumber = startLine + index;
              const isHighlighted = highlightLines.includes(lineNumber);

              return (
                <div
                  key={index}
                  className={cn(
                    "flex",
                    isHighlighted && "bg-yellow-500/10 -mx-4 px-4"
                  )}
                >
                  {showLineNumbers && (
                    <span
                      className={cn(
                        "mr-4 inline-block w-8 select-none text-right text-zinc-500",
                        isHighlighted && "text-yellow-500"
                      )}
                    >
                      {lineNumber}
                    </span>
                  )}
                  <span className="flex-1">{line || " "}</span>
                </div>
              );
            })}
          </code>
        </pre>
      </div>
    </div>
  );
}
```

```typescript
// components/ui/code-block-group.tsx
import * as React from "react";
import { cn } from "@/lib/utils";
import { CodeBlock } from "./code-block";

interface CodeTab {
  label: string;
  language: string;
  code: string;
  filename?: string;
}

interface CodeBlockGroupProps {
  tabs: CodeTab[];
  className?: string;
}

export function CodeBlockGroup({ tabs, className }: CodeBlockGroupProps) {
  const [activeTab, setActiveTab] = React.useState(0);

  return (
    <div className={cn("rounded-lg border bg-zinc-950", className)}>
      <div className="flex border-b border-zinc-800">
        {tabs.map((tab, index) => (
          <button
            key={tab.label}
            onClick={() => setActiveTab(index)}
            className={cn(
              "px-4 py-2 text-sm transition-colors",
              activeTab === index
                ? "border-b-2 border-primary text-zinc-50"
                : "text-zinc-400 hover:text-zinc-200"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <CodeBlock
        code={tabs[activeTab].code}
        language={tabs[activeTab].language}
        filename={tabs[activeTab].filename}
        showLanguage={false}
        className="border-0 rounded-t-none"
      />
    </div>
  );
}
```

## Variants

### Basic Code Block

```tsx
<CodeBlock
  code={`const greeting = "Hello, World!";
console.log(greeting);`}
  language="javascript"
/>
```

### With Line Highlighting

```tsx
<CodeBlock
  code={codeSnippet}
  language="typescript"
  highlightLines={[2, 3, 4]}
/>
```

### With Filename

```tsx
<CodeBlock
  code={configCode}
  language="json"
  filename="package.json"
/>
```

### Without Line Numbers

```tsx
<CodeBlock
  code={shellCommand}
  language="bash"
  showLineNumbers={false}
/>
```

### Tabbed Code Blocks

```tsx
<CodeBlockGroup
  tabs={[
    { label: "npm", language: "bash", code: "npm install package" },
    { label: "yarn", language: "bash", code: "yarn add package" },
    { label: "pnpm", language: "bash", code: "pnpm add package" },
  ]}
/>
```

## States

| State | Copy Button | Background |
|-------|-------------|------------|
| Default | "Copy" | zinc-950 |
| Hover | highlighted | zinc-950 |
| Copied | "Copied" + check | zinc-950 |
| Line Highlight | - | yellow/10 |

## Accessibility

### Keyboard Navigation

| Key | Action |
|-----|--------|
| `Tab` | Focus copy button |
| `Enter/Space` | Trigger copy |

### Screen Reader Announcements

- Code block announced with language
- Copy success announced via aria-label
- Line numbers are for visual reference

## Dependencies

```json
{
  "dependencies": {
    "lucide-react": "^0.460.0"
  },
  "optionalDependencies": {
    "shiki": "^1.0.0"
  }
}
```

## Examples

### API Documentation

```tsx
<CodeBlock
  code={`fetch('/api/users', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer token'
  }
})`}
  language="javascript"
  filename="api-example.js"
/>
```

### Installation Instructions

```tsx
<CodeBlockGroup
  tabs={[
    { label: "npm", language: "bash", code: "npm install @acme/ui" },
    { label: "yarn", language: "bash", code: "yarn add @acme/ui" },
  ]}
/>
```

## Anti-patterns

### Missing Language

```tsx
// Bad - no syntax highlighting
<CodeBlock code={tsCode} />

// Good - specify language
<CodeBlock code={tsCode} language="typescript" />
```

### Very Long Lines Without Scroll

```tsx
// Bad - horizontal overflow
<CodeBlock code={longLineCode} className="overflow-hidden" />

// Good - allow horizontal scroll
<CodeBlock code={longLineCode} />
```

## Related Skills

### Composes From
- [atoms/display-code](../atoms/display-code.md) - Base code styling
- [molecules/copy-button](./copy-button.md) - Copy functionality

### Composes Into
- [organisms/api-docs](../organisms/api-docs.md) - API documentation

---

## Changelog

### 2.0.0 (2025-01-18)
- Initial L2 molecule implementation
- Line numbers and highlighting
- Copy to clipboard
- CodeBlockGroup for tabbed views
