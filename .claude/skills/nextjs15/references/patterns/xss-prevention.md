---
id: pt-xss-prevention
name: XSS Prevention
version: 2.0.0
layer: L5
category: security
description: Cross-Site Scripting prevention techniques for Next.js applications
tags: [security, xss, sanitization, escaping, protection]
composes: []
dependencies: []
formula: React Escaping + DOMPurify + CSP + URL Validation = XSS Protection
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

## When to Use

- Rendering user-generated content safely
- Sanitizing rich text/HTML content
- Validating and sanitizing URLs
- Safely embedding JSON data in pages
- Processing SVG uploads

## Composition Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ XSS Prevention Layers                                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Layer 1: React Auto-Escaping (Default)                    │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ <p>{userContent}</p>  // Automatically escaped      │   │
│  │ <img src={userUrl} /> // Attributes escaped         │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Layer 2: HTML Sanitization (When needed)                  │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ DOMPurify.sanitize(html, {                          │   │
│  │   ALLOWED_TAGS: ['p', 'b', 'i', 'a'],              │   │
│  │   ALLOWED_ATTR: ['href']                            │   │
│  │ })                                                  │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Layer 3: URL Validation                                   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ - Check protocol (http/https only)                  │   │
│  │ - Block javascript: URLs                            │   │
│  │ - Validate redirect destinations                    │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Layer 4: Content Security Policy                          │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ script-src 'self' 'nonce-xxx' 'strict-dynamic'     │   │
│  │ // Blocks inline scripts without nonce              │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

# XSS Prevention

Prevent Cross-Site Scripting attacks through proper output encoding, input sanitization, and Content Security Policy.

## Overview

XSS prevention requires:
- Automatic output encoding (React handles this)
- Sanitizing user-generated HTML content
- Content Security Policy headers
- Avoiding dangerous patterns like dangerouslySetInnerHTML

## Implementation

### React's Built-in Protection

```typescript
// React automatically escapes values in JSX
// This is SAFE - React escapes the content
function UserComment({ comment }: { comment: string }) {
  // Even if comment contains <script>alert('xss')</script>
  // it will be rendered as text, not executed
  return <p>{comment}</p>;
}

// Attributes are also escaped
function UserLink({ url, label }: { url: string; label: string }) {
  // Safe - React escapes attribute values
  return <a href={url}>{label}</a>;
}

// But watch out for javascript: URLs
function SafeLink({ url, children }: { url: string; children: React.ReactNode }) {
  // Validate URL protocol
  const safeUrl = url.startsWith("javascript:") ? "#" : url;
  
  return <a href={safeUrl}>{children}</a>;
}
```

### URL Sanitization

```typescript
// lib/security/url.ts

const ALLOWED_PROTOCOLS = ["http:", "https:", "mailto:", "tel:"];

export function sanitizeUrl(url: string): string {
  if (!url) return "";
  
  try {
    const parsed = new URL(url, window.location.origin);
    
    if (!ALLOWED_PROTOCOLS.includes(parsed.protocol)) {
      return "";
    }
    
    return parsed.href;
  } catch {
    // Invalid URL
    return "";
  }
}

// For relative URLs
export function sanitizeRelativeUrl(url: string): string {
  if (!url) return "";
  
  // Remove protocol-relative URLs
  if (url.startsWith("//")) {
    return "";
  }
  
  // Check for javascript: in the path
  if (url.toLowerCase().includes("javascript:")) {
    return "";
  }
  
  return url;
}

// Component using sanitization
// components/safe-link.tsx
"use client";

import Link from "next/link";
import { sanitizeUrl } from "@/lib/security/url";

interface SafeLinkProps {
  href: string;
  children: React.ReactNode;
  external?: boolean;
}

export function SafeLink({ href, children, external }: SafeLinkProps) {
  const safeHref = sanitizeUrl(href);
  
  if (!safeHref) {
    return <span>{children}</span>;
  }
  
  if (external) {
    return (
      <a
        href={safeHref}
        target="_blank"
        rel="noopener noreferrer"
      >
        {children}
      </a>
    );
  }
  
  return <Link href={safeHref}>{children}</Link>;
}
```

### HTML Sanitization for Rich Content

```typescript
// lib/security/sanitize.ts
import DOMPurify from "isomorphic-dompurify";

// Configure allowed tags and attributes
const PURIFY_CONFIG: DOMPurify.Config = {
  ALLOWED_TAGS: [
    "p", "br", "b", "i", "em", "strong", "u", "s",
    "h1", "h2", "h3", "h4", "h5", "h6",
    "ul", "ol", "li",
    "a", "img",
    "blockquote", "pre", "code",
    "table", "thead", "tbody", "tr", "th", "td",
  ],
  ALLOWED_ATTR: [
    "href", "src", "alt", "title", "class",
    "target", "rel",
  ],
  ALLOW_DATA_ATTR: false,
  ADD_ATTR: ["target"], // Allow target but we'll sanitize it
  FORBID_TAGS: ["script", "style", "iframe", "form", "input"],
  FORBID_ATTR: ["onerror", "onload", "onclick", "onmouseover"],
};

export function sanitizeHtml(dirty: string): string {
  // Sanitize HTML
  const clean = DOMPurify.sanitize(dirty, PURIFY_CONFIG);
  
  return clean;
}

// For markdown rendering
import { marked } from "marked";

export function markdownToSafeHtml(markdown: string): string {
  // Convert markdown to HTML
  const html = marked.parse(markdown, {
    gfm: true,
    breaks: true,
  });
  
  // Sanitize the resulting HTML
  return sanitizeHtml(html as string);
}

// Component for rendering user HTML
// components/safe-html.tsx
"use client";

import { sanitizeHtml } from "@/lib/security/sanitize";

interface SafeHtmlProps {
  html: string;
  className?: string;
}

export function SafeHtml({ html, className }: SafeHtmlProps) {
  const cleanHtml = sanitizeHtml(html);
  
  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: cleanHtml }}
    />
  );
}

// Usage
function BlogPost({ content }: { content: string }) {
  return (
    <article>
      <SafeHtml html={content} className="prose" />
    </article>
  );
}
```

### Server-Side Sanitization

```typescript
// app/api/comments/route.ts
import { NextRequest, NextResponse } from "next/server";
import createDOMPurify from "dompurify";
import { JSDOM } from "jsdom";
import { z } from "zod";

// Create DOMPurify instance for server
const window = new JSDOM("").window;
const DOMPurify = createDOMPurify(window);

const commentSchema = z.object({
  content: z.string().min(1).max(5000),
  postId: z.string().uuid(),
});

export async function POST(request: NextRequest) {
  const body = await request.json();
  
  const result = commentSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { error: "Invalid input" },
      { status: 400 }
    );
  }
  
  // Sanitize content before storing
  const sanitizedContent = DOMPurify.sanitize(result.data.content, {
    ALLOWED_TAGS: ["b", "i", "em", "strong", "a", "p", "br"],
    ALLOWED_ATTR: ["href"],
  });
  
  const comment = await prisma.comment.create({
    data: {
      content: sanitizedContent,
      postId: result.data.postId,
    },
  });
  
  return NextResponse.json(comment);
}
```

### Input Encoding Utilities

```typescript
// lib/security/encode.ts

// Encode for HTML content
export function encodeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Encode for HTML attributes
export function encodeAttribute(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// Encode for JavaScript strings
export function encodeJavaScript(str: string): string {
  return str
    .replace(/\\/g, "\\\\")
    .replace(/'/g, "\\'")
    .replace(/"/g, '\\"')
    .replace(/\n/g, "\\n")
    .replace(/\r/g, "\\r")
    .replace(/\t/g, "\\t");
}

// Encode for URLs
export function encodeUrlParam(str: string): string {
  return encodeURIComponent(str);
}

// Safe JSON stringify for embedding in HTML
export function safeJsonStringify(data: unknown): string {
  return JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026");
}
```

### Safe JSON Data Injection

```typescript
// app/products/[id]/page.tsx
import { safeJsonStringify } from "@/lib/security/encode";

export default async function ProductPage({ params }) {
  const { id } = await params;
  const product = await getProduct(id);
  
  // Safe way to pass server data to client
  return (
    <div>
      <h1>{product.name}</h1>
      
      {/* Safe JSON embedding */}
      <script
        id="product-data"
        type="application/json"
        dangerouslySetInnerHTML={{
          __html: safeJsonStringify(product),
        }}
      />
      
      <ProductClient />
    </div>
  );
}

// components/product-client.tsx
"use client";

import { useEffect, useState } from "react";

export function ProductClient() {
  const [product, setProduct] = useState(null);
  
  useEffect(() => {
    const dataElement = document.getElementById("product-data");
    if (dataElement) {
      const data = JSON.parse(dataElement.textContent || "{}");
      setProduct(data);
    }
  }, []);
  
  if (!product) return null;
  
  return <div>Interactive product features...</div>;
}
```

### Form Input Validation

```typescript
// lib/validation/xss-safe.ts
import { z } from "zod";

// Text input that strips HTML
export const safeTextSchema = z.string().transform((val) =>
  val.replace(/<[^>]*>/g, "")
);

// Email with additional validation
export const safeEmailSchema = z
  .string()
  .email()
  .transform((val) => val.toLowerCase().trim());

// URL with protocol validation
export const safeUrlSchema = z
  .string()
  .url()
  .refine(
    (url) => {
      try {
        const parsed = new URL(url);
        return ["http:", "https:"].includes(parsed.protocol);
      } catch {
        return false;
      }
    },
    { message: "Only http and https URLs are allowed" }
  );

// Username with strict character set
export const safeUsernameSchema = z
  .string()
  .min(3)
  .max(30)
  .regex(/^[a-zA-Z0-9_-]+$/, "Only letters, numbers, underscore, and dash allowed");

// Form schema example
export const profileFormSchema = z.object({
  name: safeTextSchema.pipe(z.string().min(1).max(100)),
  bio: safeTextSchema.pipe(z.string().max(500)),
  website: safeUrlSchema.optional().or(z.literal("")),
  username: safeUsernameSchema,
});
```

## Variants

### Rich Text Editor Security

```typescript
// components/rich-text-editor.tsx
"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import { sanitizeHtml } from "@/lib/security/sanitize";

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
}

export function RichTextEditor({ content, onChange }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          rel: "noopener noreferrer nofollow",
          target: "_blank",
        },
        validate: (href) => {
          // Only allow http/https links
          try {
            const url = new URL(href);
            return ["http:", "https:"].includes(url.protocol);
          } catch {
            return false;
          }
        },
      }),
    ],
    content: sanitizeHtml(content), // Sanitize initial content
    onUpdate: ({ editor }) => {
      // Sanitize output
      const html = sanitizeHtml(editor.getHTML());
      onChange(html);
    },
  });
  
  return <EditorContent editor={editor} />;
}
```

### SVG Sanitization

```typescript
// lib/security/svg.ts
import DOMPurify from "isomorphic-dompurify";

const SVG_PURIFY_CONFIG: DOMPurify.Config = {
  USE_PROFILES: { svg: true },
  ALLOWED_TAGS: [
    "svg", "g", "path", "circle", "rect", "line", "polyline",
    "polygon", "ellipse", "text", "tspan", "defs", "use",
    "linearGradient", "radialGradient", "stop", "clipPath",
  ],
  ALLOWED_ATTR: [
    "viewBox", "width", "height", "fill", "stroke", "stroke-width",
    "d", "cx", "cy", "r", "x", "y", "x1", "y1", "x2", "y2",
    "points", "transform", "opacity", "id", "class",
    "offset", "stop-color", "stop-opacity",
  ],
  FORBID_TAGS: ["script", "foreignObject"],
  FORBID_ATTR: ["onclick", "onerror", "onload", "xlink:href"],
};

export function sanitizeSvg(svg: string): string {
  return DOMPurify.sanitize(svg, SVG_PURIFY_CONFIG);
}

// Component for user-uploaded SVGs
export function SafeSvg({ svg }: { svg: string }) {
  const cleanSvg = sanitizeSvg(svg);
  
  return (
    <div
      dangerouslySetInnerHTML={{ __html: cleanSvg }}
      className="svg-container"
    />
  );
}
```

## Anti-patterns

### Using dangerouslySetInnerHTML Without Sanitization

```typescript
// BAD: Direct HTML injection
function Comment({ html }: { html: string }) {
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}

// GOOD: Always sanitize first
import { sanitizeHtml } from "@/lib/security/sanitize";

function Comment({ html }: { html: string }) {
  const clean = sanitizeHtml(html);
  return <div dangerouslySetInnerHTML={{ __html: clean }} />;
}
```

### Trusting URL Parameters

```typescript
// BAD: Using URL params directly
function Redirect({ searchParams }) {
  const { redirect } = searchParams;
  
  return (
    <a href={redirect}>Continue</a>
  );
}

// GOOD: Validate and sanitize redirects
const ALLOWED_HOSTS = ["example.com", "app.example.com"];

function Redirect({ searchParams }) {
  const { redirect } = searchParams;
  
  let safeUrl = "/";
  try {
    const url = new URL(redirect, window.location.origin);
    if (ALLOWED_HOSTS.includes(url.hostname)) {
      safeUrl = url.href;
    }
  } catch {
    // Invalid URL, use default
  }
  
  return <a href={safeUrl}>Continue</a>;
}
```

### eval() and Function() Constructor

```typescript
// BAD: Never use eval with user input
function calculate(expression: string) {
  return eval(expression); // XSS vulnerability!
}

// GOOD: Use a safe expression parser
import { evaluate } from "mathjs";

function calculate(expression: string) {
  try {
    return evaluate(expression);
  } catch {
    return null;
  }
}
```

## Related Skills

- `content-security-policy` - CSP headers for XSS mitigation
- `input-sanitization` - Input validation patterns
- `security-headers` - HTTP security headers
- `form-validation` - Form data validation

## Changelog

### 2.0.0 (2025-01-18)
- Standardized to atomic design system v2
- Updated frontmatter schema

- 1.0.0: Initial implementation with sanitization patterns
