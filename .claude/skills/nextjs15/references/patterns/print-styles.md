---
id: pt-print-styles
name: Print Styles
version: 2.0.0
layer: L5
category: data
description: Print-friendly CSS and page layout for printing
tags: [print, css, media-query, pdf, layout]
composes: []
formula: "PrintStyles = MediaQueries + PageBreaks + HeaderFooter + ColorAdjustment + HiddenElements"
dependencies:
  - react
  - next
  - tailwindcss
accessibility:
  wcag: AA
  keyboard: true
  screen-reader: true
performance:
  impact: low
  lcp: neutral
  cls: neutral
---

# Print Styles

## When to Use

- Generating printable invoices, receipts, or order confirmations
- Creating PDF-ready reports from web dashboards
- Building print-friendly documentation or articles
- Designing business cards, flyers, or certificates from web apps
- Providing printer-friendly versions of data tables
- Ensuring proper page breaks for multi-page documents

## Composition Diagram

```
[Web Page] --Print Media Query--> [Print Stylesheet]
      |
      +---> [@media print] ---> [Hide Navigation/Footer/Modals]
      |
      +---> [@page Rules] ---> [Margins / Size / Orientation]
      |
      +---> [Page Breaks]
      |         |
      |         +---> [break-before: page]
      |         +---> [break-after: page]
      |         +---> [break-inside: avoid]
      |
      +---> [Print Header/Footer] ---> [position: fixed]
      |
      +---> [Link URLs] ---> [a::after { content: attr(href) }]
      |
      +---> [Color Adjustments] ---> [print-color-adjust: exact]
      |
      v
[window.print()] ---> [Print Dialog]
```

## Overview

Print-friendly styling patterns for creating professional printed documents from web pages, including page breaks, headers/footers, and print-specific layouts.

## Implementation

### Print Stylesheet

```css
/* styles/print.css */
@media print {
  /* Reset colors for printing */
  * {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
    color-adjust: exact !important;
  }

  /* Hide non-printable elements */
  .no-print,
  .print\\:hidden,
  nav,
  footer,
  aside,
  button:not(.print-button),
  .sidebar,
  .modal,
  .toast,
  .tooltip {
    display: none !important;
  }

  /* Show print-only elements */
  .print\\:block,
  .only-print {
    display: block !important;
  }

  /* Page setup */
  @page {
    size: A4;
    margin: 2cm;
  }

  @page :first {
    margin-top: 3cm;
  }

  /* Avoid breaks inside important elements */
  h1, h2, h3, h4, h5, h6 {
    page-break-after: avoid;
    break-after: avoid;
  }

  p, li, tr, img, figure {
    page-break-inside: avoid;
    break-inside: avoid;
  }

  /* Ensure headings stay with content */
  h1, h2, h3, h4, h5, h6 {
    page-break-after: avoid;
  }

  /* Force page breaks */
  .page-break-before {
    page-break-before: always;
    break-before: page;
  }

  .page-break-after {
    page-break-after: always;
    break-after: page;
  }

  /* Table handling */
  table {
    page-break-inside: auto;
  }

  tr {
    page-break-inside: avoid;
    page-break-after: auto;
  }

  thead {
    display: table-header-group;
  }

  tfoot {
    display: table-footer-group;
  }

  /* Links */
  a[href]::after {
    content: " (" attr(href) ")";
    font-size: 0.8em;
    color: #666;
  }

  a[href^="#"]::after,
  a[href^="javascript:"]::after {
    content: "";
  }

  /* Images */
  img {
    max-width: 100% !important;
  }

  /* Remove shadows and backgrounds */
  .print-clean * {
    box-shadow: none !important;
    text-shadow: none !important;
  }

  /* Adjust typography */
  body {
    font-size: 12pt;
    line-height: 1.5;
    color: #000;
    background: #fff;
  }

  h1 { font-size: 24pt; }
  h2 { font-size: 18pt; }
  h3 { font-size: 14pt; }
  h4, h5, h6 { font-size: 12pt; }

  /* Code blocks */
  pre, code {
    font-size: 10pt;
    background: #f5f5f5 !important;
    border: 1px solid #ddd;
    white-space: pre-wrap;
    word-wrap: break-word;
  }
}
```

### Tailwind Print Utilities

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      screens: {
        print: { raw: 'print' },
      },
    },
  },
  plugins: [
    function ({ addUtilities }) {
      addUtilities({
        '.page-break-before': {
          'page-break-before': 'always',
          'break-before': 'page',
        },
        '.page-break-after': {
          'page-break-after': 'always',
          'break-after': 'page',
        },
        '.page-break-inside-avoid': {
          'page-break-inside': 'avoid',
          'break-inside': 'avoid',
        },
        '.print-color-exact': {
          '-webkit-print-color-adjust': 'exact',
          'print-color-adjust': 'exact',
        },
      });
    },
  ],
};
```

### Print Button Component

```tsx
// components/print/print-button.tsx
'use client';

import { Printer, Download } from 'lucide-react';

interface PrintButtonProps {
  title?: string;
  beforePrint?: () => void | Promise<void>;
  afterPrint?: () => void;
  variant?: 'button' | 'icon';
  className?: string;
}

export function PrintButton({
  title = 'Print',
  beforePrint,
  afterPrint,
  variant = 'button',
  className,
}: PrintButtonProps) {
  const handlePrint = async () => {
    if (beforePrint) {
      await beforePrint();
    }

    // Small delay to ensure any DOM updates are rendered
    setTimeout(() => {
      window.print();
    }, 100);
  };

  // Listen for print completion
  if (typeof window !== 'undefined') {
    window.onafterprint = () => {
      afterPrint?.();
    };
  }

  if (variant === 'icon') {
    return (
      <button
        onClick={handlePrint}
        className={`rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-300 ${className}`}
        aria-label={title}
      >
        <Printer className="h-5 w-5" />
      </button>
    );
  }

  return (
    <button
      onClick={handlePrint}
      className={`inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 ${className}`}
    >
      <Printer className="h-4 w-4" />
      {title}
    </button>
  );
}
```

### Printable Layout Component

```tsx
// components/print/printable-layout.tsx
import { ReactNode } from 'react';

interface PrintableLayoutProps {
  children: ReactNode;
  header?: ReactNode;
  footer?: ReactNode;
  className?: string;
}

export function PrintableLayout({
  children,
  header,
  footer,
  className,
}: PrintableLayoutProps) {
  return (
    <div className={`printable-document ${className}`}>
      {/* Print Header - Shows on every page */}
      {header && (
        <div className="print-header hidden print:block print:fixed print:top-0 print:left-0 print:right-0">
          {header}
        </div>
      )}

      {/* Main Content */}
      <div className="print-content">{children}</div>

      {/* Print Footer - Shows on every page */}
      {footer && (
        <div className="print-footer hidden print:block print:fixed print:bottom-0 print:left-0 print:right-0">
          {footer}
        </div>
      )}

      <style jsx>{`
        @media print {
          .printable-document {
            padding-top: ${header ? '60px' : '0'};
            padding-bottom: ${footer ? '60px' : '0'};
          }
        }
      `}</style>
    </div>
  );
}
```

### Print Header/Footer

```tsx
// components/print/print-header.tsx
import { format } from 'date-fns';

interface PrintHeaderProps {
  title: string;
  logo?: string;
  showDate?: boolean;
}

export function PrintHeader({ title, logo, showDate = true }: PrintHeaderProps) {
  return (
    <header className="hidden border-b border-gray-300 pb-4 print:flex print:items-center print:justify-between">
      <div className="flex items-center gap-4">
        {logo && (
          <img src={logo} alt="" className="h-8 w-auto" />
        )}
        <h1 className="text-lg font-bold text-gray-900">{title}</h1>
      </div>
      {showDate && (
        <time className="text-sm text-gray-500">
          {format(new Date(), 'MMMM d, yyyy')}
        </time>
      )}
    </header>
  );
}

// components/print/print-footer.tsx
interface PrintFooterProps {
  showPageNumbers?: boolean;
  copyright?: string;
}

export function PrintFooter({
  showPageNumbers = true,
  copyright,
}: PrintFooterProps) {
  return (
    <footer className="hidden border-t border-gray-300 pt-4 print:flex print:items-center print:justify-between">
      {copyright && (
        <span className="text-xs text-gray-500">{copyright}</span>
      )}
      {showPageNumbers && (
        <span className="text-xs text-gray-500">
          Page <span className="page-number"></span>
        </span>
      )}
      
      <style jsx>{`
        @media print {
          @page {
            @bottom-right {
              content: "Page " counter(page) " of " counter(pages);
            }
          }
        }
      `}</style>
    </footer>
  );
}
```

### Page Break Component

```tsx
// components/print/page-break.tsx
interface PageBreakProps {
  type?: 'before' | 'after';
}

export function PageBreak({ type = 'after' }: PageBreakProps) {
  return (
    <div
      className={`hidden print:block ${
        type === 'before' ? 'page-break-before' : 'page-break-after'
      }`}
      aria-hidden="true"
    />
  );
}

// Section that avoids breaks
interface PrintSectionProps {
  children: React.ReactNode;
  className?: string;
}

export function PrintSection({ children, className }: PrintSectionProps) {
  return (
    <section className={`page-break-inside-avoid ${className}`}>
      {children}
    </section>
  );
}
```

### Print Preview Component

```tsx
// components/print/print-preview.tsx
'use client';

import { useState, useRef, ReactNode } from 'react';
import { X, Printer, ZoomIn, ZoomOut } from 'lucide-react';

interface PrintPreviewProps {
  children: ReactNode;
  isOpen: boolean;
  onClose: () => void;
  onPrint: () => void;
}

export function PrintPreview({
  children,
  isOpen,
  onClose,
  onPrint,
}: PrintPreviewProps) {
  const [zoom, setZoom] = useState(100);
  const contentRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-gray-900">
      {/* Toolbar */}
      <div className="flex items-center justify-between border-b border-gray-700 bg-gray-800 px-4 py-3">
        <div className="flex items-center gap-4">
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-700 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
          <h2 className="text-lg font-medium text-white">Print Preview</h2>
        </div>

        <div className="flex items-center gap-4">
          {/* Zoom Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setZoom((z) => Math.max(z - 25, 25))}
              className="rounded-lg p-2 text-gray-400 hover:bg-gray-700 hover:text-white"
            >
              <ZoomOut className="h-5 w-5" />
            </button>
            <span className="min-w-[4rem] text-center text-sm text-gray-300">
              {zoom}%
            </span>
            <button
              onClick={() => setZoom((z) => Math.min(z + 25, 200))}
              className="rounded-lg p-2 text-gray-400 hover:bg-gray-700 hover:text-white"
            >
              <ZoomIn className="h-5 w-5" />
            </button>
          </div>

          {/* Print Button */}
          <button
            onClick={onPrint}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Printer className="h-4 w-4" />
            Print
          </button>
        </div>
      </div>

      {/* Preview Content */}
      <div className="h-[calc(100vh-60px)] overflow-auto bg-gray-700 p-8">
        <div
          ref={contentRef}
          className="mx-auto bg-white shadow-2xl"
          style={{
            width: `${(210 * zoom) / 100}mm`,
            minHeight: `${(297 * zoom) / 100}mm`,
            padding: `${(20 * zoom) / 100}mm`,
            transform: `scale(${zoom / 100})`,
            transformOrigin: 'top center',
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
```

### Print-Optimized Table

```tsx
// components/print/print-table.tsx
interface Column<T> {
  key: keyof T | string;
  header: string;
  width?: string;
  align?: 'left' | 'center' | 'right';
  render?: (item: T) => React.ReactNode;
}

interface PrintTableProps<T> {
  data: T[];
  columns: Column<T>[];
  title?: string;
  caption?: string;
}

export function PrintTable<T extends Record<string, any>>({
  data,
  columns,
  title,
  caption,
}: PrintTableProps<T>) {
  return (
    <div className="print-table page-break-inside-avoid">
      {title && (
        <h3 className="mb-4 text-lg font-semibold text-gray-900">{title}</h3>
      )}
      
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b-2 border-gray-300 bg-gray-50">
            {columns.map((col) => (
              <th
                key={col.key as string}
                className={`px-3 py-2 text-${col.align || 'left'} font-semibold text-gray-900`}
                style={{ width: col.width }}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr
              key={index}
              className={`border-b border-gray-200 ${
                index % 2 === 1 ? 'bg-gray-50' : ''
              }`}
            >
              {columns.map((col) => (
                <td
                  key={col.key as string}
                  className={`px-3 py-2 text-${col.align || 'left'} text-gray-700`}
                >
                  {col.render
                    ? col.render(row)
                    : row[col.key as keyof T]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      
      {caption && (
        <p className="mt-2 text-xs text-gray-500 italic">{caption}</p>
      )}
    </div>
  );
}
```

## Usage

```tsx
// Add print button to any page
import { PrintButton } from '@/components/print/print-button';

<PrintButton
  title="Print Report"
  beforePrint={() => {
    // Prepare content for printing
    document.body.classList.add('printing');
  }}
  afterPrint={() => {
    document.body.classList.remove('printing');
  }}
/>

// Use printable layout for documents
import { PrintableLayout, PrintHeader, PrintFooter } from '@/components/print';

function InvoicePage() {
  return (
    <PrintableLayout
      header={<PrintHeader title="Invoice #12345" logo="/logo.png" />}
      footer={<PrintFooter copyright="Company Inc." showPageNumbers />}
    >
      <div className="invoice-content">
        {/* Invoice details */}
      </div>
    </PrintableLayout>
  );
}

// Control page breaks
import { PageBreak, PrintSection } from '@/components/print/page-break';

function Report() {
  return (
    <div>
      <PrintSection>
        <h2>Section 1</h2>
        <p>Content that stays together...</p>
      </PrintSection>
      
      <PageBreak />
      
      <PrintSection>
        <h2>Section 2</h2>
        <p>Starts on new page...</p>
      </PrintSection>
    </div>
  );
}

// Use Tailwind print utilities
<div className="bg-blue-500 print:bg-white print:text-black">
  <nav className="print:hidden">Navigation</nav>
  <main>Content visible in print</main>
  <div className="hidden print:block">Only visible when printing</div>
</div>
```

## Related Skills

- [L4/invoice-page](../templates/invoice-page.md) - Invoice template
- [L5/pdf-generation](./pdf-generation.md) - PDF generation
- [L5/export-data](./export-data.md) - Data export

## Changelog

### 2.0.0 (2025-01-18)
- Standardized to atomic design system v2
- Updated frontmatter schema

### 1.0.0 (2025-01-17)
- Initial implementation with print utilities
