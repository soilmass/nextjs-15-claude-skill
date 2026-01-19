---
id: a-display-code
name: Code Display
version: 2.0.0
layer: L1
category: display
composes:
  - ../primitives/colors.md
  - ../primitives/typography.md
  - ../primitives/spacing.md
description: Inline and block code display with syntax highlighting using Shiki
tags: [code, syntax-highlighting, shiki, pre, inline-code]
dependencies:
  shiki: "^1.22.0"
  next: "^15.0.0"
performance:
  impact: medium
  lcp: medium
  cls: low
accessibility:
  wcag: AA
  keyboard: true
  screen-reader: true
---

# Code Display

## Overview

The Code Display atom provides both inline code spans and syntax-highlighted code blocks. Uses Shiki for accurate, performant syntax highlighting with theme support. Supports server-side rendering for zero-JS highlighting in production.

## When to Use

Use this skill when:
- Displaying code snippets in documentation or tutorials
- Showing inline code references within text content
- Building a code editor preview or playground
- Rendering API response examples or configuration files

## Implementation

```typescript
// components/ui/code.tsx
import * as React from "react";
import { cn } from "@/lib/utils";

// Inline Code Component
interface InlineCodeProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
}

export function InlineCode({ className, children, ...props }: InlineCodeProps) {
  return (
    <code
      className={cn(
        "relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-medium",
        className
      )}
      {...props}
    >
      {children}
    </code>
  );
}

// Block Code Component (without highlighting)
interface CodeBlockProps extends React.HTMLAttributes<HTMLPreElement> {
  children: React.ReactNode;
  showLineNumbers?: boolean;
}

export function CodeBlock({
  className,
  children,
  showLineNumbers = false,
  ...props
}: CodeBlockProps) {
  return (
    <pre
      className={cn(
        "overflow-x-auto rounded-lg border bg-muted p-4 font-mono text-sm",
        showLineNumbers && "[counter-reset:line]",
        className
      )}
      {...props}
    >
      <code className={cn(showLineNumbers && "grid")}>{children}</code>
    </pre>
  );
}

// Line component for line numbers
interface CodeLineProps {
  children: React.ReactNode;
  highlighted?: boolean;
}

export function CodeLine({ children, highlighted }: CodeLineProps) {
  return (
    <span
      className={cn(
        "before:content-[counter(line)] before:mr-4 before:inline-block before:w-4 before:text-right before:text-muted-foreground [counter-increment:line]",
        highlighted && "bg-primary/10 -mx-4 px-4"
      )}
    >
      {children}
    </span>
  );
}
```

```typescript
// components/ui/syntax-highlighter.tsx
import { codeToHtml } from "shiki";
import { cn } from "@/lib/utils";

interface SyntaxHighlighterProps {
  code: string;
  language: string;
  theme?: "github-dark" | "github-light" | "one-dark-pro" | "dracula";
  showLineNumbers?: boolean;
  highlightLines?: number[];
  className?: string;
}

export async function SyntaxHighlighter({
  code,
  language,
  theme = "github-dark",
  showLineNumbers = false,
  highlightLines = [],
  className,
}: SyntaxHighlighterProps) {
  const html = await codeToHtml(code, {
    lang: language,
    theme,
    transformers: [
      {
        line(node, line) {
          node.properties["data-line"] = line;
          if (highlightLines.includes(line)) {
            this.addClassToHast(node, "highlighted");
          }
          if (showLineNumbers) {
            this.addClassToHast(node, "line-numbered");
          }
        },
      },
    ],
  });

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg border",
        "[&_pre]:overflow-x-auto [&_pre]:p-4 [&_pre]:text-sm",
        "[&_.highlighted]:bg-primary/10 [&_.highlighted]:-mx-4 [&_.highlighted]:px-4",
        showLineNumbers &&
          "[&_.line-numbered]:before:content-[attr(data-line)] [&_.line-numbered]:before:mr-4 [&_.line-numbered]:before:inline-block [&_.line-numbered]:before:w-4 [&_.line-numbered]:before:text-right [&_.line-numbered]:before:text-muted-foreground",
        className
      )}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
```

```typescript
// components/ui/copy-button.tsx
"use client";

import * as React from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";

interface CopyButtonProps {
  value: string;
  className?: string;
}

export function CopyButton({ value, className }: CopyButtonProps) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = React.useCallback(async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [value]);

  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn("h-8 w-8", className)}
      onClick={handleCopy}
      aria-label={copied ? "Copied" : "Copy to clipboard"}
    >
      {copied ? (
        <Check className="h-4 w-4 text-green-500" />
      ) : (
        <Copy className="h-4 w-4" />
      )}
    </Button>
  );
}
```

```typescript
// components/ui/code-block-with-copy.tsx
import * as React from "react";
import { cn } from "@/lib/utils";
import { SyntaxHighlighter } from "./syntax-highlighter";
import { CopyButton } from "./copy-button";

interface CodeBlockWithCopyProps {
  code: string;
  language: string;
  filename?: string;
  theme?: "github-dark" | "github-light" | "one-dark-pro" | "dracula";
  showLineNumbers?: boolean;
  highlightLines?: number[];
  className?: string;
}

export async function CodeBlockWithCopy({
  code,
  language,
  filename,
  theme = "github-dark",
  showLineNumbers = false,
  highlightLines = [],
  className,
}: CodeBlockWithCopyProps) {
  return (
    <div className={cn("relative group", className)}>
      {filename && (
        <div className="flex items-center justify-between rounded-t-lg border border-b-0 bg-muted px-4 py-2">
          <span className="text-sm text-muted-foreground font-mono">
            {filename}
          </span>
          <CopyButton value={code} />
        </div>
      )}
      <div className="relative">
        <SyntaxHighlighter
          code={code}
          language={language}
          theme={theme}
          showLineNumbers={showLineNumbers}
          highlightLines={highlightLines}
          className={cn(filename && "rounded-t-none")}
        />
        {!filename && (
          <CopyButton
            value={code}
            className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity"
          />
        )}
      </div>
    </div>
  );
}
```

### Key Implementation Notes

1. **Server-side Highlighting**: Use async `codeToHtml` from Shiki for zero-JS syntax highlighting in RSC
2. **Copy Functionality**: Separate copy button component with visual feedback and proper accessibility

## Variants

### Inline Code

```tsx
<InlineCode>npm install next</InlineCode>
```

### Block Without Highlighting

```tsx
<CodeBlock showLineNumbers>
  {`function hello() {
  console.log("Hello, World!");
}`}
</CodeBlock>
```

### Syntax Highlighted Block

```tsx
<SyntaxHighlighter
  code={`const greeting = "Hello, World!";
console.log(greeting);`}
  language="typescript"
  theme="github-dark"
  showLineNumbers
  highlightLines={[2]}
/>
```

### With Filename and Copy

```tsx
<CodeBlockWithCopy
  code={code}
  language="typescript"
  filename="example.ts"
  showLineNumbers
/>
```

## States

| State | Background | Border | Text | Transition |
|-------|------------|--------|------|------------|
| Default | muted | border | foreground | - |
| Hover (copy btn) | accent | - | - | 150ms ease |
| Copied | - | - | green-500 | 150ms ease |
| Loading | skeleton | border | - | pulse |

## Accessibility

### Required ARIA Attributes

- `role="region"`: For code blocks, enables landmark navigation
- `aria-label`: "Code example" or filename for context

### Keyboard Navigation

| Key | Action |
|-----|--------|
| `Tab` | Focus copy button |
| `Enter` | Copy code to clipboard |
| `Space` | Copy code to clipboard |

### Screen Reader Announcements

- "Code block, [language]" when focusing the code region
- "Copied to clipboard" after successful copy
- Filename announced when present

## Dependencies

```json
{
  "dependencies": {
    "shiki": "^1.22.0",
    "lucide-react": "^0.460.0"
  }
}
```

### Installation

```bash
npm install shiki lucide-react
```

## Examples

### Basic Usage

```tsx
import { InlineCode, CodeBlock } from "@/components/ui/code";

export function Example() {
  return (
    <div>
      <p>
        Run <InlineCode>npm install</InlineCode> to install dependencies.
      </p>
      <CodeBlock>
        {`const x = 1;
const y = 2;`}
      </CodeBlock>
    </div>
  );
}
```

### With Syntax Highlighting

```tsx
import { SyntaxHighlighter } from "@/components/ui/syntax-highlighter";

export default async function DocsPage() {
  const code = `
import { Button } from "@/components/ui/button";

export function MyComponent() {
  return <Button>Click me</Button>;
}
`;

  return (
    <SyntaxHighlighter
      code={code}
      language="tsx"
      theme="github-dark"
      showLineNumbers
    />
  );
}
```

### Full Featured Block

```tsx
import { CodeBlockWithCopy } from "@/components/ui/code-block-with-copy";

const configCode = `/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    ppr: true,
  },
};

export default nextConfig;`;

export default async function ConfigPage() {
  return (
    <CodeBlockWithCopy
      code={configCode}
      language="javascript"
      filename="next.config.mjs"
      showLineNumbers
      highlightLines={[3, 4, 5]}
    />
  );
}
```

## Anti-patterns

### Using dangerouslySetInnerHTML Without Sanitization

```tsx
// Bad - potential XSS if code comes from user input
<div dangerouslySetInnerHTML={{ __html: userCode }} />

// Good - use Shiki which properly escapes
<SyntaxHighlighter code={userCode} language="javascript" />
```

### Client-side Syntax Highlighting

```tsx
// Bad - adds bundle size and causes layout shift
"use client";
import { Prism } from "react-syntax-highlighter";

// Good - use server-side Shiki
// In a Server Component (no "use client")
import { SyntaxHighlighter } from "./syntax-highlighter";
```

## Related Skills

### Composes From
- [display-text](./display-text.md) - Typography for code captions
- [input-button](./input-button.md) - Copy button styling

### Composes Into
- [card](../molecules/card.md) - Code cards in documentation
- [accordion-item](../molecules/accordion-item.md) - Collapsible code sections

### Alternatives
- [display-text](./display-text.md) - When code formatting not needed

---

## Changelog

### 2.0.0 (2025-01-18)
- Standardized to atomic design system v2
- Updated frontmatter schema
- Added explicit composition references

### 1.0.0 (2025-01-16)
- Initial implementation with Shiki integration
- Added inline code, block code, and syntax highlighter components
- Copy to clipboard functionality with visual feedback
