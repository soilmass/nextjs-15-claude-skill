---
id: pt-progressive-enhancement
name: Progressive Enhancement
version: 2.0.0
layer: L5
category: data
description: Build features that work without JavaScript and enhance with JS when available
tags: [progressive-enhancement, no-js, accessibility, resilience, forms, navigation]
composes: []
formula: "ProgressiveEnhancement = NoJSFallback + CSSOnlyInteractions + HydratedEnhancements + FeatureDetection"
dependencies:
  - react
  - next
accessibility:
  wcag: AAA
  keyboard: true
  screen-reader: true
performance:
  impact: low
  lcp: neutral
  cls: neutral
---

# Progressive Enhancement

## When to Use

- Building forms that must work even if JavaScript fails to load
- Creating accessible navigation menus with CSS-only fallbacks
- Implementing accordions, tabs, and modals with `<details>` fallbacks
- Ensuring content is crawlable by search engines
- Supporting users who disable JavaScript for security
- Building resilient applications for unreliable network conditions

## Composition Diagram

```
[Initial HTML] --Server Rendered--> [Browser]
        |
        v
[CSS Styling] ---> [No-JS Fallbacks]
        |                |
        |                +---> [<details>/<summary> for accordions]
        |                +---> [:target for tabs]
        |                +---> [form action fallback]
        |
        v
[JavaScript Loads?]
        |
   +----+----+
   |         |
  [No]     [Yes]
   |         |
   v         v
[CSS-only  [Enhanced
Features]   Experience]
            |
            +---> [Smooth animations]
            +---> [SPA navigation]
            +---> [Dynamic validation]
            +---> [Real-time updates]
```

## Overview

Progressive enhancement ensures core functionality works without JavaScript, then adds enhanced experiences when JS is available. This pattern improves accessibility, SEO, and resilience.

## Implementation

### No-JS Detection Hook

```tsx
// hooks/use-javascript.ts
'use client';

import { useState, useEffect } from 'react';

export function useJavaScript() {
  const [hasJS, setHasJS] = useState(false);

  useEffect(() => {
    setHasJS(true);
  }, []);

  return hasJS;
}

export function useHydrated() {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  return hydrated;
}
```

### CSS No-JS Fallback

```css
/* globals.css */

/* Hide JS-only elements when JS is disabled */
.no-js .js-only {
  display: none !important;
}

/* Show no-JS fallbacks when JS is disabled */
.js .no-js-only {
  display: none !important;
}

/* Progressive image loading */
.no-js img[data-src] {
  display: none;
}

.no-js noscript img {
  display: block;
}
```

### Root Layout with No-JS Class

```tsx
// app/layout.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Progressive Enhancement App',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="no-js">
      <head>
        {/* Immediately remove no-js class if JS is enabled */}
        <script
          dangerouslySetInnerHTML={{
            __html: `document.documentElement.classList.remove('no-js');document.documentElement.classList.add('js');`,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

### Progressive Form Component

```tsx
// components/progressive-form.tsx
'use client';

import { useFormStatus } from 'react-dom';
import { useJavaScript } from '@/hooks/use-javascript';

interface ProgressiveFormProps {
  action: string | ((formData: FormData) => Promise<void>);
  method?: 'get' | 'post';
  children: React.ReactNode;
  onSuccess?: () => void;
  className?: string;
}

function SubmitButton({ 
  children, 
  hasJS 
}: { 
  children: React.ReactNode; 
  hasJS: boolean;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {pending ? 'Submitting...' : children}
    </button>
  );
}

export function ProgressiveForm({
  action,
  method = 'post',
  children,
  onSuccess,
  className,
}: ProgressiveFormProps) {
  const hasJS = useJavaScript();

  // Server action for JS-enabled clients
  async function handleAction(formData: FormData) {
    if (typeof action === 'function') {
      await action(formData);
      onSuccess?.();
    }
  }

  // For no-JS, use traditional form submission
  if (!hasJS && typeof action === 'string') {
    return (
      <form action={action} method={method} className={className}>
        {children}
        <noscript>
          <p className="text-sm text-gray-600 mt-2">
            Form will submit and reload the page.
          </p>
        </noscript>
      </form>
    );
  }

  return (
    <form action={handleAction} className={className}>
      {children}
    </form>
  );
}

// Example: Contact Form with Progressive Enhancement
export function ContactForm() {
  const hasJS = useJavaScript();

  async function submitContact(formData: FormData) {
    'use server';
    
    const data = {
      name: formData.get('name'),
      email: formData.get('email'),
      message: formData.get('message'),
    };

    // Process form data
    await fetch('/api/contact', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  return (
    <ProgressiveForm
      action={hasJS ? submitContact : '/api/contact'}
      method="post"
      className="space-y-4"
    >
      <div>
        <label htmlFor="name" className="block text-sm font-medium">
          Name
        </label>
        <input
          type="text"
          id="name"
          name="name"
          required
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium">
          Email
        </label>
        <input
          type="email"
          id="email"
          name="email"
          required
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
        />
      </div>

      <div>
        <label htmlFor="message" className="block text-sm font-medium">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          rows={4}
          required
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
        />
      </div>

      <SubmitButton hasJS={hasJS}>Send Message</SubmitButton>
    </ProgressiveForm>
  );
}
```

### Progressive Navigation

```tsx
// components/progressive-nav.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useJavaScript } from '@/hooks/use-javascript';
import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';

interface NavItem {
  href: string;
  label: string;
}

interface ProgressiveNavProps {
  items: NavItem[];
}

export function ProgressiveNav({ items }: ProgressiveNavProps) {
  const pathname = usePathname();
  const hasJS = useJavaScript();
  const [isOpen, setIsOpen] = useState(false);

  // Close menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <nav className="bg-white border-b">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold">
              Logo
            </Link>
          </div>

          {/* Desktop nav - always visible */}
          <div className="hidden md:flex items-center space-x-4">
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-2 rounded-md ${
                  pathname === item.href
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Mobile nav */}
          <div className="md:hidden flex items-center">
            {hasJS ? (
              // JS-enabled: Toggle button
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 rounded-md text-gray-700 hover:bg-gray-100"
                aria-expanded={isOpen}
                aria-label="Toggle navigation"
              >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            ) : (
              // No-JS: CSS-only disclosure
              <details className="relative">
                <summary className="p-2 rounded-md text-gray-700 hover:bg-gray-100 list-none cursor-pointer">
                  <Menu size={24} />
                </summary>
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-md shadow-lg border py-1 z-50">
                  {items.map((item) => (
                    <a
                      key={item.href}
                      href={item.href}
                      className={`block px-4 py-2 ${
                        pathname === item.href
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {item.label}
                    </a>
                  ))}
                </div>
              </details>
            )}
          </div>
        </div>

        {/* JS-enabled mobile menu */}
        {hasJS && isOpen && (
          <div className="md:hidden py-2 border-t">
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`block px-4 py-2 rounded-md ${
                  pathname === item.href
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}
```

### Progressive Image Loading

```tsx
// components/progressive-image.tsx
'use client';

import Image from 'next/image';
import { useState } from 'react';
import { useJavaScript } from '@/hooks/use-javascript';

interface ProgressiveImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  placeholder?: string;
  className?: string;
  priority?: boolean;
}

export function ProgressiveImage({
  src,
  alt,
  width,
  height,
  placeholder,
  className,
  priority = false,
}: ProgressiveImageProps) {
  const hasJS = useJavaScript();
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  // Low-quality placeholder
  const lqip = placeholder || `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${width} ${height}'%3E%3Crect fill='%23e5e7eb' width='100%25' height='100%25'/%3E%3C/svg%3E`;

  if (error) {
    return (
      <div
        className={`bg-gray-200 flex items-center justify-center ${className}`}
        style={{ width, height }}
      >
        <span className="text-gray-500 text-sm">Failed to load image</span>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* No-JS fallback */}
      <noscript>
        <img
          src={src}
          alt={alt}
          width={width}
          height={height}
          loading="lazy"
          className="w-full h-auto"
        />
      </noscript>

      {/* JS-enhanced image with blur-up */}
      {hasJS && (
        <>
          {/* Placeholder */}
          {!loaded && (
            <div
              className="absolute inset-0 bg-gray-200 animate-pulse"
              style={{
                backgroundImage: `url(${lqip})`,
                backgroundSize: 'cover',
              }}
            />
          )}

          <Image
            src={src}
            alt={alt}
            width={width}
            height={height}
            priority={priority}
            className={`transition-opacity duration-300 ${
              loaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={() => setLoaded(true)}
            onError={() => setError(true)}
          />
        </>
      )}

      {/* Static image for SSR */}
      {!hasJS && (
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          priority={priority}
        />
      )}
    </div>
  );
}
```

### Progressive Accordion (CSS-Only Fallback)

```tsx
// components/progressive-accordion.tsx
'use client';

import { useState } from 'react';
import { useJavaScript } from '@/hooks/use-javascript';
import { ChevronDown } from 'lucide-react';

interface AccordionItem {
  id: string;
  title: string;
  content: React.ReactNode;
}

interface ProgressiveAccordionProps {
  items: AccordionItem[];
  allowMultiple?: boolean;
}

export function ProgressiveAccordion({
  items,
  allowMultiple = false,
}: ProgressiveAccordionProps) {
  const hasJS = useJavaScript();
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());

  function toggleItem(id: string) {
    setOpenItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        if (!allowMultiple) {
          next.clear();
        }
        next.add(id);
      }
      return next;
    });
  }

  // No-JS: Use native details/summary
  if (!hasJS) {
    return (
      <div className="space-y-2">
        {items.map((item) => (
          <details key={item.id} className="border rounded-lg">
            <summary className="px-4 py-3 cursor-pointer font-medium hover:bg-gray-50 list-none flex justify-between items-center">
              {item.title}
              <ChevronDown className="w-5 h-5 transition-transform details-open:rotate-180" />
            </summary>
            <div className="px-4 py-3 border-t">
              {item.content}
            </div>
          </details>
        ))}
      </div>
    );
  }

  // JS-enhanced: Custom accordion with animations
  return (
    <div className="space-y-2">
      {items.map((item) => {
        const isOpen = openItems.has(item.id);
        return (
          <div key={item.id} className="border rounded-lg overflow-hidden">
            <button
              onClick={() => toggleItem(item.id)}
              className="w-full px-4 py-3 flex justify-between items-center font-medium hover:bg-gray-50 transition-colors"
              aria-expanded={isOpen}
              aria-controls={`accordion-content-${item.id}`}
            >
              {item.title}
              <ChevronDown
                className={`w-5 h-5 transition-transform ${
                  isOpen ? 'rotate-180' : ''
                }`}
              />
            </button>
            <div
              id={`accordion-content-${item.id}`}
              className={`overflow-hidden transition-all duration-200 ${
                isOpen ? 'max-h-96' : 'max-h-0'
              }`}
            >
              <div className="px-4 py-3 border-t">
                {item.content}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
```

### Progressive Tabs (CSS-Only Fallback)

```tsx
// components/progressive-tabs.tsx
'use client';

import { useState } from 'react';
import { useJavaScript } from '@/hooks/use-javascript';

interface Tab {
  id: string;
  label: string;
  content: React.ReactNode;
}

interface ProgressiveTabsProps {
  tabs: Tab[];
  defaultTab?: string;
}

export function ProgressiveTabs({ tabs, defaultTab }: ProgressiveTabsProps) {
  const hasJS = useJavaScript();
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);

  // No-JS: Use anchor links and :target selector
  if (!hasJS) {
    return (
      <div className="progressive-tabs">
        <style>{`
          .progressive-tabs .tab-content {
            display: none;
          }
          .progressive-tabs .tab-content:target {
            display: block;
          }
          .progressive-tabs .tab-content:first-of-type:not(:target) {
            display: block;
          }
          .progressive-tabs .tab-content:first-of-type:target ~ .tab-content:first-of-type {
            display: none;
          }
        `}</style>

        <div className="border-b flex">
          {tabs.map((tab) => (
            <a
              key={tab.id}
              href={`#${tab.id}`}
              className="px-4 py-2 border-b-2 border-transparent hover:border-blue-500 transition-colors"
            >
              {tab.label}
            </a>
          ))}
        </div>

        {tabs.map((tab) => (
          <div key={tab.id} id={tab.id} className="tab-content p-4">
            {tab.content}
          </div>
        ))}
      </div>
    );
  }

  // JS-enhanced tabs
  return (
    <div>
      <div className="border-b flex" role="tablist">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`tabpanel-${tab.id}`}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent hover:border-gray-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {tabs.map((tab) => (
        <div
          key={tab.id}
          id={`tabpanel-${tab.id}`}
          role="tabpanel"
          aria-labelledby={tab.id}
          hidden={activeTab !== tab.id}
          className="p-4"
        >
          {tab.content}
        </div>
      ))}
    </div>
  );
}
```

### Server-Side Form Handler

```tsx
// app/api/contact/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const contentType = request.headers.get('content-type');

  let data: Record<string, unknown>;

  // Handle both JSON and form-urlencoded (no-JS fallback)
  if (contentType?.includes('application/json')) {
    data = await request.json();
  } else {
    const formData = await request.formData();
    data = Object.fromEntries(formData.entries());
  }

  // Process the form data
  console.log('Contact form submission:', data);

  // For form submissions (no-JS), redirect back
  const referer = request.headers.get('referer');
  if (!contentType?.includes('application/json') && referer) {
    return NextResponse.redirect(new URL('/thank-you', referer), 303);
  }

  return NextResponse.json({ success: true });
}
```

## Variants

### Minimal Enhancement

```tsx
// Only enhance specific interactions
export function MinimalEnhancement({ children }: { children: React.ReactNode }) {
  const hasJS = useJavaScript();

  return (
    <div data-js={hasJS ? 'true' : 'false'}>
      {children}
    </div>
  );
}
```

### Feature Detection Based

```tsx
// Enhance based on specific feature support
export function useFeatureDetection() {
  const [features, setFeatures] = useState({
    intersectionObserver: false,
    webAnimations: false,
    webWorkers: false,
    serviceWorker: false,
  });

  useEffect(() => {
    setFeatures({
      intersectionObserver: 'IntersectionObserver' in window,
      webAnimations: 'animate' in document.body,
      webWorkers: 'Worker' in window,
      serviceWorker: 'serviceWorker' in navigator,
    });
  }, []);

  return features;
}
```

## Usage

```tsx
// app/page.tsx
import { ProgressiveNav } from '@/components/progressive-nav';
import { ProgressiveAccordion } from '@/components/progressive-accordion';
import { ProgressiveTabs } from '@/components/progressive-tabs';
import { ContactForm } from '@/components/progressive-form';
import { ProgressiveImage } from '@/components/progressive-image';

const navItems = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
];

const accordionItems = [
  { id: '1', title: 'What is progressive enhancement?', content: <p>Building from a baseline...</p> },
  { id: '2', title: 'Why use it?', content: <p>Better accessibility and resilience...</p> },
];

const tabs = [
  { id: 'overview', label: 'Overview', content: <p>Overview content...</p> },
  { id: 'details', label: 'Details', content: <p>Details content...</p> },
];

export default function Page() {
  return (
    <div>
      <ProgressiveNav items={navItems} />
      
      <main className="max-w-4xl mx-auto p-8 space-y-12">
        <section>
          <h2 className="text-2xl font-bold mb-4">Hero Image</h2>
          <ProgressiveImage
            src="/hero.jpg"
            alt="Hero image"
            width={1200}
            height={600}
            priority
          />
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">FAQ</h2>
          <ProgressiveAccordion items={accordionItems} />
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Information</h2>
          <ProgressiveTabs tabs={tabs} />
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Contact Us</h2>
          <ContactForm />
        </section>
      </main>
    </div>
  );
}
```

## Related Skills

- [[offline-mode]] - PWA offline support
- [[form-validation]] - Form validation patterns
- [[skeleton-loading]] - Loading states
- [[accessibility-testing]] - Testing accessibility

## Changelog

### 2.0.0 (2025-01-18)
- Standardized to atomic design system v2
- Updated frontmatter schema

### 1.0.0 (2025-01-17)
- Initial implementation
- No-JS detection hook
- Progressive form, navigation, image components
- CSS-only accordion and tabs fallbacks
