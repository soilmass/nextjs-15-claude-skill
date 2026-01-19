---
id: pt-clipboard-api
name: Clipboard API
version: 2.0.0
layer: L5
category: browser
description: Clipboard read/write operations with fallback support
tags: [clipboard, copy, paste, text, images]
composes:
  - ../atoms/input-button.md
  - ../atoms/input-text.md
dependencies: []
formula: Clipboard API + Permissions + Fallback = Copy/Paste Functionality
performance:
  impact: low
  lcp: low
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

## When to Use

- Implementing copy-to-clipboard buttons
- Pasting content from clipboard
- Copying formatted HTML or rich text
- Copying/pasting images
- Code snippet copy buttons

## Composition Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ Clipboard API Usage                                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Write Operations                                    │   │
│  │                                                     │   │
│  │ navigator.clipboard.writeText(text)                │   │
│  │ navigator.clipboard.write([ClipboardItem])         │   │
│  │                                                     │   │
│  │ Fallback: document.execCommand('copy')             │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Read Operations (Requires Permission)               │   │
│  │                                                     │   │
│  │ navigator.clipboard.readText()                      │   │
│  │ navigator.clipboard.read() // For images/files     │   │
│  │                                                     │   │
│  │ Permission: clipboard-read                          │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Common UX Pattern:                                         │
│  [Copy] -> "Copied!" toast -> Reset after 2s               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

# Clipboard API

## Overview

A comprehensive Clipboard API implementation supporting text, HTML, and images with proper permissions handling and fallback for older browsers.

## Implementation

### Clipboard Hook

```tsx
// lib/clipboard/use-clipboard.ts
'use client';

import { useState, useCallback } from 'react';

export interface ClipboardResult {
  success: boolean;
  error?: Error;
}

export interface ClipboardContent {
  text?: string;
  html?: string;
  image?: Blob;
}

export function useClipboard() {
  const [isCopying, setIsCopying] = useState(false);
  const [isPasting, setIsPasting] = useState(false);

  // Copy text to clipboard
  const copyText = useCallback(async (text: string): Promise<ClipboardResult> => {
    setIsCopying(true);

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        setIsCopying(false);
        return { success: true };
      }

      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-9999px';
      textArea.style.top = '-9999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();

      const success = document.execCommand('copy');
      document.body.removeChild(textArea);

      setIsCopying(false);
      return { success };
    } catch (error) {
      setIsCopying(false);
      return { success: false, error: error as Error };
    }
  }, []);

  // Copy rich content (text + HTML)
  const copyRichText = useCallback(
    async (text: string, html: string): Promise<ClipboardResult> => {
      setIsCopying(true);

      try {
        if (navigator.clipboard?.write) {
          const blob = new Blob([html], { type: 'text/html' });
          const textBlob = new Blob([text], { type: 'text/plain' });
          
          await navigator.clipboard.write([
            new ClipboardItem({
              'text/html': blob,
              'text/plain': textBlob,
            }),
          ]);
          
          setIsCopying(false);
          return { success: true };
        }

        // Fallback to text only
        return copyText(text);
      } catch (error) {
        setIsCopying(false);
        return { success: false, error: error as Error };
      }
    },
    [copyText]
  );

  // Copy image to clipboard
  const copyImage = useCallback(async (blob: Blob): Promise<ClipboardResult> => {
    setIsCopying(true);

    try {
      if (!navigator.clipboard?.write) {
        setIsCopying(false);
        return { success: false, error: new Error('Clipboard API not supported') };
      }

      await navigator.clipboard.write([
        new ClipboardItem({
          [blob.type]: blob,
        }),
      ]);

      setIsCopying(false);
      return { success: true };
    } catch (error) {
      setIsCopying(false);
      return { success: false, error: error as Error };
    }
  }, []);

  // Copy image from URL
  const copyImageFromUrl = useCallback(
    async (url: string): Promise<ClipboardResult> => {
      try {
        const response = await fetch(url);
        const blob = await response.blob();
        return copyImage(blob);
      } catch (error) {
        return { success: false, error: error as Error };
      }
    },
    [copyImage]
  );

  // Read text from clipboard
  const readText = useCallback(async (): Promise<string | null> => {
    setIsPasting(true);

    try {
      if (navigator.clipboard?.readText) {
        const text = await navigator.clipboard.readText();
        setIsPasting(false);
        return text;
      }

      setIsPasting(false);
      return null;
    } catch (error) {
      setIsPasting(false);
      return null;
    }
  }, []);

  // Read all clipboard content
  const readContent = useCallback(async (): Promise<ClipboardContent | null> => {
    setIsPasting(true);

    try {
      if (!navigator.clipboard?.read) {
        // Fallback to text only
        const text = await readText();
        setIsPasting(false);
        return text ? { text } : null;
      }

      const items = await navigator.clipboard.read();
      const content: ClipboardContent = {};

      for (const item of items) {
        for (const type of item.types) {
          if (type === 'text/plain') {
            const blob = await item.getType(type);
            content.text = await blob.text();
          } else if (type === 'text/html') {
            const blob = await item.getType(type);
            content.html = await blob.text();
          } else if (type.startsWith('image/')) {
            content.image = await item.getType(type);
          }
        }
      }

      setIsPasting(false);
      return content;
    } catch (error) {
      setIsPasting(false);
      return null;
    }
  }, [readText]);

  return {
    copyText,
    copyRichText,
    copyImage,
    copyImageFromUrl,
    readText,
    readContent,
    isCopying,
    isPasting,
  };
}
```

### Copy Button Component

```tsx
// components/clipboard/copy-button.tsx
'use client';

import { useState, useCallback } from 'react';
import { Copy, Check, AlertCircle } from 'lucide-react';
import { useClipboard } from '@/lib/clipboard/use-clipboard';

interface CopyButtonProps {
  text: string;
  label?: string;
  successMessage?: string;
  variant?: 'button' | 'icon';
  className?: string;
  onCopy?: (success: boolean) => void;
}

export function CopyButton({
  text,
  label = 'Copy',
  successMessage = 'Copied!',
  variant = 'button',
  className,
  onCopy,
}: CopyButtonProps) {
  const { copyText, isCopying } = useClipboard();
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleCopy = useCallback(async () => {
    const result = await copyText(text);
    
    if (result.success) {
      setStatus('success');
      onCopy?.(true);
      setTimeout(() => setStatus('idle'), 2000);
    } else {
      setStatus('error');
      onCopy?.(false);
      setTimeout(() => setStatus('idle'), 2000);
    }
  }, [text, copyText, onCopy]);

  if (variant === 'icon') {
    return (
      <button
        onClick={handleCopy}
        disabled={isCopying}
        className={`rounded-lg p-2 transition-colors ${
          status === 'success'
            ? 'text-green-500'
            : status === 'error'
            ? 'text-red-500'
            : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-300'
        } ${className}`}
        aria-label={status === 'success' ? successMessage : label}
      >
        {status === 'success' ? (
          <Check className="h-5 w-5" />
        ) : status === 'error' ? (
          <AlertCircle className="h-5 w-5" />
        ) : (
          <Copy className="h-5 w-5" />
        )}
      </button>
    );
  }

  return (
    <button
      onClick={handleCopy}
      disabled={isCopying}
      className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
        status === 'success'
          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
          : status === 'error'
          ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
      } ${className}`}
    >
      {status === 'success' ? (
        <>
          <Check className="h-4 w-4" />
          {successMessage}
        </>
      ) : status === 'error' ? (
        <>
          <AlertCircle className="h-4 w-4" />
          Failed
        </>
      ) : (
        <>
          <Copy className="h-4 w-4" />
          {label}
        </>
      )}
    </button>
  );
}
```

### Code Block with Copy

```tsx
// components/clipboard/code-block.tsx
'use client';

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { useClipboard } from '@/lib/clipboard/use-clipboard';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/cjs/styles/prism';

interface CodeBlockProps {
  code: string;
  language?: string;
  showLineNumbers?: boolean;
  filename?: string;
}

export function CodeBlock({
  code,
  language = 'typescript',
  showLineNumbers = true,
  filename,
}: CodeBlockProps) {
  const { copyText } = useClipboard();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const result = await copyText(code);
    if (result.success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="group relative overflow-hidden rounded-lg bg-[#282c34]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-700 px-4 py-2">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="h-3 w-3 rounded-full bg-red-500" />
            <div className="h-3 w-3 rounded-full bg-yellow-500" />
            <div className="h-3 w-3 rounded-full bg-green-500" />
          </div>
          {filename && (
            <span className="ml-2 text-sm text-gray-400">{filename}</span>
          )}
        </div>

        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 rounded px-2 py-1 text-xs text-gray-400 opacity-0 transition-opacity hover:bg-gray-700 hover:text-gray-200 group-hover:opacity-100"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              Copy
            </>
          )}
        </button>
      </div>

      {/* Code */}
      <SyntaxHighlighter
        language={language}
        style={oneDark}
        showLineNumbers={showLineNumbers}
        customStyle={{
          margin: 0,
          padding: '1rem',
          background: 'transparent',
          fontSize: '0.875rem',
        }}
      >
        {code.trim()}
      </SyntaxHighlighter>
    </div>
  );
}
```

### Paste Zone Component

```tsx
// components/clipboard/paste-zone.tsx
'use client';

import { useState, useCallback, useRef } from 'react';
import { Clipboard, Image, FileText, AlertCircle } from 'lucide-react';
import { useClipboard, ClipboardContent } from '@/lib/clipboard/use-clipboard';

interface PasteZoneProps {
  onPaste: (content: ClipboardContent) => void;
  acceptTypes?: ('text' | 'html' | 'image')[];
  placeholder?: string;
}

export function PasteZone({
  onPaste,
  acceptTypes = ['text', 'html', 'image'],
  placeholder = 'Click to paste or Ctrl+V',
}: PasteZoneProps) {
  const { readContent, isPasting } = useClipboard();
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string>();
  const zoneRef = useRef<HTMLDivElement>(null);

  const handlePaste = useCallback(async () => {
    setError(undefined);
    const content = await readContent();

    if (!content) {
      setError('No content in clipboard');
      return;
    }

    // Filter by accepted types
    const filtered: ClipboardContent = {};
    if (acceptTypes.includes('text') && content.text) {
      filtered.text = content.text;
    }
    if (acceptTypes.includes('html') && content.html) {
      filtered.html = content.html;
    }
    if (acceptTypes.includes('image') && content.image) {
      filtered.image = content.image;
    }

    if (Object.keys(filtered).length === 0) {
      setError('No supported content type in clipboard');
      return;
    }

    onPaste(filtered);
  }, [readContent, acceptTypes, onPaste]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
        handlePaste();
      }
    },
    [handlePaste]
  );

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);

      const items = e.dataTransfer.items;
      const content: ClipboardContent = {};

      for (const item of items) {
        if (item.kind === 'file' && item.type.startsWith('image/')) {
          content.image = item.getAsFile() || undefined;
        } else if (item.kind === 'string' && item.type === 'text/plain') {
          content.text = await new Promise((resolve) =>
            item.getAsString(resolve)
          );
        } else if (item.kind === 'string' && item.type === 'text/html') {
          content.html = await new Promise((resolve) =>
            item.getAsString(resolve)
          );
        }
      }

      if (Object.keys(content).length > 0) {
        onPaste(content);
      }
    },
    [onPaste]
  );

  return (
    <div
      ref={zoneRef}
      onClick={handlePaste}
      onKeyDown={handleKeyDown}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragOver(true);
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={handleDrop}
      tabIndex={0}
      className={`flex min-h-[120px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors ${
        isDragOver
          ? 'border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-900/20'
          : 'border-gray-300 hover:border-gray-400 dark:border-gray-700 dark:hover:border-gray-600'
      }`}
      role="button"
      aria-label="Paste zone"
    >
      <div className="flex items-center gap-2 text-gray-400">
        {acceptTypes.includes('image') && <Image className="h-6 w-6" />}
        {acceptTypes.includes('text') && <FileText className="h-6 w-6" />}
        <Clipboard className="h-6 w-6" />
      </div>

      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
        {isPasting ? 'Reading clipboard...' : placeholder}
      </p>

      {error && (
        <div className="mt-2 flex items-center gap-1 text-sm text-red-500">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}
    </div>
  );
}
```

### Copy to Clipboard Input

```tsx
// components/clipboard/copy-input.tsx
'use client';

import { useState, useRef } from 'react';
import { Copy, Check } from 'lucide-react';
import { useClipboard } from '@/lib/clipboard/use-clipboard';

interface CopyInputProps {
  value: string;
  label?: string;
}

export function CopyInput({ value, label }: CopyInputProps) {
  const { copyText } = useClipboard();
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleCopy = async () => {
    const result = await copyText(value);
    if (result.success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleFocus = () => {
    inputRef.current?.select();
  };

  return (
    <div>
      {label && (
        <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}
      <div className="flex">
        <input
          ref={inputRef}
          type="text"
          value={value}
          readOnly
          onFocus={handleFocus}
          className="flex-1 rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
        />
        <button
          onClick={handleCopy}
          className={`flex items-center gap-2 rounded-r-lg border px-4 py-2 text-sm font-medium transition-colors ${
            copied
              ? 'border-green-500 bg-green-50 text-green-700 dark:border-green-400 dark:bg-green-900/20 dark:text-green-400'
              : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800'
          }`}
        >
          {copied ? (
            <>
              <Check className="h-4 w-4" />
              Copied
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" />
              Copy
            </>
          )}
        </button>
      </div>
    </div>
  );
}
```

## Usage

```tsx
// Simple copy button
import { CopyButton } from '@/components/clipboard/copy-button';

<CopyButton text="npm install my-package" />

// Icon-only copy
<CopyButton text={apiKey} variant="icon" />

// Copy with callback
<CopyButton
  text={url}
  onCopy={(success) => {
    if (success) {
      toast('Link copied!');
    }
  }}
/>

// Code block with syntax highlighting
import { CodeBlock } from '@/components/clipboard/code-block';

<CodeBlock
  code={`const greeting = "Hello, World!";
console.log(greeting);`}
  language="javascript"
  filename="example.js"
/>

// Copy input field
import { CopyInput } from '@/components/clipboard/copy-input';

<CopyInput
  value="https://example.com/share/abc123"
  label="Share URL"
/>

// Paste zone
import { PasteZone } from '@/components/clipboard/paste-zone';

<PasteZone
  acceptTypes={['text', 'image']}
  onPaste={(content) => {
    if (content.image) {
      handleImageUpload(content.image);
    } else if (content.text) {
      handleTextPaste(content.text);
    }
  }}
/>

// Use hook directly
import { useClipboard } from '@/lib/clipboard/use-clipboard';

function MyComponent() {
  const { copyText, copyImage, readText } = useClipboard();

  const handleCopy = async () => {
    await copyText('Hello!');
  };

  const handlePaste = async () => {
    const text = await readText();
    console.log(text);
  };
}
```

## Related Skills

- [L5/share-api](./share-api.md) - Web Share API
- [L2/copy-button](../molecules/copy-button.md) - Copy button molecule
- [L5/drag-drop](./drag-drop.md) - Drag and drop

## Changelog

### 2.0.0 (2025-01-17)
- Standardized to atomic design system v2
- Updated frontmatter schema

### 1.0.0 (2025-01-17)
- Initial implementation with text, HTML, and image support
