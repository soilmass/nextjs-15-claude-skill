---
id: t-invoice-page
name: Invoice Page
version: 2.0.0
layer: L4
category: pages
description: Invoice detail page with line items, totals, and print/download
tags: [invoice, billing, payment, print, pdf]
performance:
  impact: medium
  lcp: medium
  cls: low
composes:
  - ../organisms/invoice-table.md
  - ../molecules/key-value.md
  - ../atoms/display-currency.md
dependencies:
  - react
  - next
  - lucide-react
  - date-fns
accessibility:
  wcag: AA
  keyboard: true
  screen-reader: true
formula: "InvoicePage = InvoiceTable(o-invoice-table) + KeyValue(m-key-value) + DisplayCurrency(a-display-currency)"
---

# Invoice Page

## Overview

A detailed invoice page displaying billing information, line items, taxes, and totals. Supports printing, PDF download, and payment actions.

## Composition Diagram

```
+------------------------------------------------------------------+
|                        INVOICE PAGE                               |
+------------------------------------------------------------------+
|  [< Back to Invoices]            [Print] [Download] [Send] [...]  |
+------------------------------------------------------------------+
|  +------------------------------------------------------------+  |
|  |                   Invoice Header                           |  |
|  |  +----------------------+    +-------------------------+   |  |
|  |  | [Logo]               |    |        INVOICE          |   |  |
|  |  | Company Name         |    |      [Status Badge]     |   |  |
|  |  | Address              |    +-------------------------+   |  |
|  |  | City, Country        |    | Invoice #: INV-001      |   |  |
|  |  | email@company.com    |    | Issue Date: Jan 1, 2025 |   |  |
|  |  | Tax ID: xxx          |    | Due Date: Jan 15, 2025  |   |  |
|  |  +----------------------+    +-------------------------+   |  |
|  +------------------------------------------------------------+  |
|                                                                   |
|  +------------------------------------------------------------+  |
|  |                 Invoice Details (m-key-value)              |  |
|  |  +------------------------+  +-------------------------+   |  |
|  |  | BILL TO                |  | PAYMENT DETAILS         |   |  |
|  |  | Client Name            |  | Payment Terms: Net 30   |   |  |
|  |  | Client Address         |  |                         |   |  |
|  |  | client@email.com       |  |                         |   |  |
|  |  +------------------------+  +-------------------------+   |  |
|  +------------------------------------------------------------+  |
|                                                                   |
|  +------------------------------------------------------------+  |
|  |              Line Items (o-invoice-table)                  |  |
|  |  +------------------------------------------------------+  |  |
|  |  | Description        | Qty | Unit Price | Disc | Total |  |  |
|  |  +------------------------------------------------------+  |  |
|  |  | Service Item 1     |  1  | $100.00    |  -   |$100.00|  |  |
|  |  | Service Item 2     |  5  | $50.00     | 10%  |$225.00|  |  |
|  |  | Product Item       |  2  | $75.00     |  -   |$150.00|  |  |
|  |  +------------------------------------------------------+  |  |
|  +------------------------------------------------------------+  |
|                                                                   |
|  +------------------------------------------------------------+  |
|  |              Invoice Summary (a-display-currency)          |  |
|  |                              +-------------------------+   |  |
|  |                              | Subtotal:      $475.00  |   |  |
|  |                              | Discount (5%): -$23.75  |   |  |
|  |                              | Tax (10%):      $45.13  |   |  |
|  |                              +-------------------------+   |  |
|  |                              | Total:         $496.38  |   |  |
|  |                              +-------------------------+   |  |
|  |                              | Amount Paid:   -$100.00 |   |  |
|  |                              +=========================+   |  |
|  |                              | AMOUNT DUE:    $396.38  |   |  |
|  |                              +=========================+   |  |
|  +------------------------------------------------------------+  |
|                                                                   |
|  +------------------------------------------------------------+  |
|  |                   Invoice Footer                           |  |
|  |  +------------------------+  +-------------------------+   |  |
|  |  | Notes:                 |  | Bank Details:           |   |  |
|  |  | Thank you for your     |  | Bank: First National    |   |  |
|  |  | business!              |  | Account: 123456789      |   |  |
|  |  +------------------------+  | Routing: 987654321      |   |  |
|  |                              +-------------------------+   |  |
|  |  Terms & Conditions: Payment due within 30 days...        |  |
|  +------------------------------------------------------------+  |
+------------------------------------------------------------------+
```

## When to Use

Use this skill when:
- Building invoice detail pages
- Creating printable billing documents
- Implementing PDF invoice generation
- Building billing/payment workflows

## Implementation

### Invoice Page

```tsx
// app/invoices/[id]/page.tsx
import { notFound } from 'next/navigation';
import { InvoiceHeader } from '@/components/invoice/invoice-header';
import { InvoiceDetails } from '@/components/invoice/invoice-details';
import { InvoiceLineItems } from '@/components/invoice/invoice-line-items';
import { InvoiceSummary } from '@/components/invoice/invoice-summary';
import { InvoiceActions } from '@/components/invoice/invoice-actions';
import { InvoiceFooter } from '@/components/invoice/invoice-footer';

interface InvoicePageProps {
  params: Promise<{ id: string }>;
}

async function getInvoice(id: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/invoices/${id}`, {
    next: { revalidate: 60 },
  });
  
  if (!res.ok) return null;
  return res.json();
}

export async function generateMetadata({ params }: InvoicePageProps) {
  const { id } = await params;
  const invoice = await getInvoice(id);
  
  if (!invoice) return { title: 'Invoice Not Found' };
  
  return {
    title: `Invoice ${invoice.number}`,
    description: `Invoice for ${invoice.client.name}`,
  };
}

export default async function InvoicePage({ params }: InvoicePageProps) {
  const { id } = await params;
  const invoice = await getInvoice(id);

  if (!invoice) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 dark:bg-gray-950 print:bg-white print:py-0">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Actions Bar (hidden on print) */}
        <div className="mb-6 print:hidden">
          <InvoiceActions invoice={invoice} />
        </div>

        {/* Invoice Document */}
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900 print:rounded-none print:border-0 print:shadow-none">
          <InvoiceHeader invoice={invoice} />
          <div className="p-8">
            <InvoiceDetails invoice={invoice} />
            <InvoiceLineItems items={invoice.lineItems} />
            <InvoiceSummary invoice={invoice} />
          </div>
          <InvoiceFooter invoice={invoice} />
        </div>
      </div>
    </div>
  );
}
```

### Invoice Header

```tsx
// components/invoice/invoice-header.tsx
import Image from 'next/image';
import { format, parseISO } from 'date-fns';

interface Invoice {
  number: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  issueDate: string;
  dueDate: string;
  company: {
    name: string;
    logo?: string;
    address: string;
    city: string;
    country: string;
    email: string;
    phone: string;
    taxId?: string;
  };
}

const statusStyles = {
  draft: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  sent: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  paid: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  overdue: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  cancelled: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-500',
};

export function InvoiceHeader({ invoice }: { invoice: Invoice }) {
  return (
    <header className="border-b border-gray-200 bg-gray-50 p-8 dark:border-gray-800 dark:bg-gray-800/50 print:border-0 print:bg-white">
      <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-start">
        {/* Company Info */}
        <div className="flex items-start gap-4">
          {invoice.company.logo && (
            <Image
              src={invoice.company.logo}
              alt={invoice.company.name}
              width={64}
              height={64}
              className="rounded-lg"
            />
          )}
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {invoice.company.name}
            </h2>
            <address className="mt-2 text-sm not-italic text-gray-600 dark:text-gray-400">
              {invoice.company.address}
              <br />
              {invoice.company.city}, {invoice.company.country}
              <br />
              {invoice.company.email}
              <br />
              {invoice.company.phone}
              {invoice.company.taxId && (
                <>
                  <br />
                  Tax ID: {invoice.company.taxId}
                </>
              )}
            </address>
          </div>
        </div>

        {/* Invoice Info */}
        <div className="text-left sm:text-right">
          <div className="flex items-center gap-3 sm:justify-end">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              INVOICE
            </h1>
            <span
              className={`rounded-full px-3 py-1 text-sm font-medium capitalize print:hidden ${
                statusStyles[invoice.status]
              }`}
            >
              {invoice.status}
            </span>
          </div>
          <dl className="mt-4 space-y-1 text-sm">
            <div className="flex gap-2 sm:justify-end">
              <dt className="text-gray-500 dark:text-gray-500">Invoice Number:</dt>
              <dd className="font-medium text-gray-900 dark:text-white">
                {invoice.number}
              </dd>
            </div>
            <div className="flex gap-2 sm:justify-end">
              <dt className="text-gray-500 dark:text-gray-500">Issue Date:</dt>
              <dd className="font-medium text-gray-900 dark:text-white">
                {format(parseISO(invoice.issueDate), 'MMM d, yyyy')}
              </dd>
            </div>
            <div className="flex gap-2 sm:justify-end">
              <dt className="text-gray-500 dark:text-gray-500">Due Date:</dt>
              <dd className="font-medium text-gray-900 dark:text-white">
                {format(parseISO(invoice.dueDate), 'MMM d, yyyy')}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </header>
  );
}
```

### Invoice Details

```tsx
// components/invoice/invoice-details.tsx
interface Invoice {
  client: {
    name: string;
    email: string;
    address: string;
    city: string;
    country: string;
    taxId?: string;
  };
  paymentTerms: string;
  notes?: string;
}

export function InvoiceDetails({ invoice }: { invoice: Invoice }) {
  return (
    <div className="mb-8 grid gap-8 sm:grid-cols-2">
      {/* Bill To */}
      <div>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
          Bill To
        </h3>
        <div className="text-gray-900 dark:text-white">
          <p className="font-semibold">{invoice.client.name}</p>
          <address className="mt-1 text-sm not-italic text-gray-600 dark:text-gray-400">
            {invoice.client.address}
            <br />
            {invoice.client.city}, {invoice.client.country}
            <br />
            {invoice.client.email}
            {invoice.client.taxId && (
              <>
                <br />
                Tax ID: {invoice.client.taxId}
              </>
            )}
          </address>
        </div>
      </div>

      {/* Payment Info */}
      <div>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
          Payment Details
        </h3>
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-gray-600 dark:text-gray-400">Payment Terms:</dt>
            <dd className="font-medium text-gray-900 dark:text-white">
              {invoice.paymentTerms}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
```

### Invoice Line Items

```tsx
// components/invoice/invoice-line-items.tsx
interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  discount?: number;
  total: number;
}

export function InvoiceLineItems({ items }: { items: LineItem[] }) {
  return (
    <div className="mb-8 overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 dark:border-gray-700">
            <th className="py-3 text-left font-semibold text-gray-900 dark:text-white">
              Description
            </th>
            <th className="py-3 text-right font-semibold text-gray-900 dark:text-white">
              Qty
            </th>
            <th className="py-3 text-right font-semibold text-gray-900 dark:text-white">
              Unit Price
            </th>
            <th className="py-3 text-right font-semibold text-gray-900 dark:text-white">
              Discount
            </th>
            <th className="py-3 text-right font-semibold text-gray-900 dark:text-white">
              Total
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
          {items.map((item) => (
            <tr key={item.id}>
              <td className="py-4 text-gray-900 dark:text-white">
                {item.description}
              </td>
              <td className="py-4 text-right text-gray-600 dark:text-gray-400">
                {item.quantity} {item.unit}
              </td>
              <td className="py-4 text-right text-gray-600 dark:text-gray-400">
                ${item.unitPrice.toFixed(2)}
              </td>
              <td className="py-4 text-right text-gray-600 dark:text-gray-400">
                {item.discount ? `${item.discount}%` : '-'}
              </td>
              <td className="py-4 text-right font-medium text-gray-900 dark:text-white">
                ${item.total.toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

### Invoice Summary

```tsx
// components/invoice/invoice-summary.tsx
interface Invoice {
  subtotal: number;
  discount?: {
    type: 'percentage' | 'fixed';
    value: number;
    amount: number;
  };
  tax: {
    rate: number;
    amount: number;
  };
  total: number;
  amountPaid: number;
  amountDue: number;
  currency: string;
}

export function InvoiceSummary({ invoice }: { invoice: Invoice }) {
  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: invoice.currency,
    }).format(amount);

  return (
    <div className="flex justify-end">
      <dl className="w-full max-w-sm space-y-3 text-sm">
        <div className="flex justify-between">
          <dt className="text-gray-600 dark:text-gray-400">Subtotal</dt>
          <dd className="font-medium text-gray-900 dark:text-white">
            {formatCurrency(invoice.subtotal)}
          </dd>
        </div>

        {invoice.discount && (
          <div className="flex justify-between text-green-600 dark:text-green-400">
            <dt>
              Discount
              {invoice.discount.type === 'percentage' && ` (${invoice.discount.value}%)`}
            </dt>
            <dd className="font-medium">
              -{formatCurrency(invoice.discount.amount)}
            </dd>
          </div>
        )}

        <div className="flex justify-between">
          <dt className="text-gray-600 dark:text-gray-400">
            Tax ({invoice.tax.rate}%)
          </dt>
          <dd className="font-medium text-gray-900 dark:text-white">
            {formatCurrency(invoice.tax.amount)}
          </dd>
        </div>

        <div className="border-t border-gray-200 pt-3 dark:border-gray-700">
          <div className="flex justify-between text-base font-semibold">
            <dt className="text-gray-900 dark:text-white">Total</dt>
            <dd className="text-gray-900 dark:text-white">
              {formatCurrency(invoice.total)}
            </dd>
          </div>
        </div>

        {invoice.amountPaid > 0 && (
          <div className="flex justify-between text-green-600 dark:text-green-400">
            <dt>Amount Paid</dt>
            <dd className="font-medium">-{formatCurrency(invoice.amountPaid)}</dd>
          </div>
        )}

        <div className="rounded-lg bg-gray-100 p-4 dark:bg-gray-800">
          <div className="flex justify-between text-lg font-bold">
            <dt className="text-gray-900 dark:text-white">Amount Due</dt>
            <dd className="text-gray-900 dark:text-white">
              {formatCurrency(invoice.amountDue)}
            </dd>
          </div>
        </div>
      </dl>
    </div>
  );
}
```

### Invoice Actions

```tsx
// components/invoice/invoice-actions.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ChevronLeft,
  Printer,
  Download,
  Send,
  CreditCard,
  MoreHorizontal,
  Edit,
  Copy,
  Trash2,
} from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';

interface Invoice {
  id: string;
  number: string;
  status: string;
}

export function InvoiceActions({ invoice }: { invoice: Invoice }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/invoices/${invoice.id}/pdf`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${invoice.number}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async () => {
    setIsLoading(true);
    try {
      await fetch(`/api/invoices/${invoice.id}/send`, { method: 'POST' });
      router.refresh();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <Link
        href="/invoices"
        className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to Invoices
      </Link>

      <div className="flex items-center gap-2">
        <button
          onClick={handlePrint}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          <Printer className="h-4 w-4" />
          Print
        </button>

        <button
          onClick={handleDownload}
          disabled={isLoading}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          <Download className="h-4 w-4" />
          Download PDF
        </button>

        {invoice.status === 'draft' && (
          <button
            onClick={handleSend}
            disabled={isLoading}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
            Send Invoice
          </button>
        )}

        {(invoice.status === 'sent' || invoice.status === 'overdue') && (
          <Link
            href={`/invoices/${invoice.id}/pay`}
            className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
          >
            <CreditCard className="h-4 w-4" />
            Pay Now
          </Link>
        )}

        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button className="rounded-lg border border-gray-300 bg-white p-2 text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700">
              <MoreHorizontal className="h-5 w-5" />
            </button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content
              className="min-w-[160px] rounded-lg border border-gray-200 bg-white p-1 shadow-lg dark:border-gray-700 dark:bg-gray-800"
              align="end"
            >
              <DropdownMenu.Item
                className="flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm text-gray-700 outline-none hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                <Edit className="h-4 w-4" />
                Edit Invoice
              </DropdownMenu.Item>
              <DropdownMenu.Item
                className="flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm text-gray-700 outline-none hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                <Copy className="h-4 w-4" />
                Duplicate
              </DropdownMenu.Item>
              <DropdownMenu.Separator className="my-1 h-px bg-gray-200 dark:bg-gray-700" />
              <DropdownMenu.Item
                className="flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm text-red-600 outline-none hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </div>
    </div>
  );
}
```

### Invoice Footer

```tsx
// components/invoice/invoice-footer.tsx
interface Invoice {
  notes?: string;
  terms?: string;
  bankDetails?: {
    bankName: string;
    accountName: string;
    accountNumber: string;
    routingNumber: string;
    swift?: string;
  };
}

export function InvoiceFooter({ invoice }: { invoice: Invoice }) {
  return (
    <footer className="border-t border-gray-200 bg-gray-50 p-8 dark:border-gray-800 dark:bg-gray-800/50 print:bg-white">
      <div className="grid gap-8 sm:grid-cols-2">
        {/* Notes */}
        {invoice.notes && (
          <div>
            <h3 className="mb-2 text-sm font-semibold text-gray-900 dark:text-white">
              Notes
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {invoice.notes}
            </p>
          </div>
        )}

        {/* Bank Details */}
        {invoice.bankDetails && (
          <div>
            <h3 className="mb-2 text-sm font-semibold text-gray-900 dark:text-white">
              Bank Details
            </h3>
            <dl className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex gap-2">
                <dt className="text-gray-500">Bank:</dt>
                <dd>{invoice.bankDetails.bankName}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="text-gray-500">Account Name:</dt>
                <dd>{invoice.bankDetails.accountName}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="text-gray-500">Account Number:</dt>
                <dd>{invoice.bankDetails.accountNumber}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="text-gray-500">Routing Number:</dt>
                <dd>{invoice.bankDetails.routingNumber}</dd>
              </div>
              {invoice.bankDetails.swift && (
                <div className="flex gap-2">
                  <dt className="text-gray-500">SWIFT:</dt>
                  <dd>{invoice.bankDetails.swift}</dd>
                </div>
              )}
            </dl>
          </div>
        )}
      </div>

      {/* Terms */}
      {invoice.terms && (
        <div className="mt-6 border-t border-gray-200 pt-6 dark:border-gray-700">
          <h3 className="mb-2 text-sm font-semibold text-gray-900 dark:text-white">
            Terms & Conditions
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-500">
            {invoice.terms}
          </p>
        </div>
      )}

      {/* Thank You */}
      <p className="mt-8 text-center text-sm font-medium text-gray-600 dark:text-gray-400">
        Thank you for your business!
      </p>
    </footer>
  );
}
```

## Variants

### Print Stylesheet

```css
/* styles/invoice-print.css */
@media print {
  body {
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  .print\\:hidden {
    display: none !important;
  }

  @page {
    size: A4;
    margin: 1cm;
  }
}
```

## Usage

```tsx
// View invoice
// Navigate to /invoices/inv-123

// Print invoice
// Click Print button or Cmd/Ctrl + P

// Download PDF
// Click Download PDF button
```

## Error States

### Invoice Not Found

```tsx
// components/invoice/invoice-not-found.tsx
import { FileX } from 'lucide-react';
import Link from 'next/link';

export function InvoiceNotFound() {
  return (
    <div className="min-h-[50vh] flex items-center justify-center p-8">
      <div className="max-w-md text-center">
        <FileX className="mx-auto h-12 w-12 text-gray-400" />
        <h2 className="mt-4 text-xl font-semibold">Invoice not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The invoice you're looking for doesn't exist or has been deleted.
        </p>
        <Link
          href="/invoices"
          className="mt-6 inline-block rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          View all invoices
        </Link>
      </div>
    </div>
  );
}
```

### PDF Download Error

```tsx
// components/invoice/pdf-error.tsx
'use client';

import { useState } from 'react';
import { AlertCircle, Download, RefreshCw } from 'lucide-react';

export function PDFDownloadButton({ invoiceId }: { invoiceId: string }) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleDownload = async () => {
    setStatus('loading');
    setErrorMessage('');

    try {
      const res = await fetch(`/api/invoices/${invoiceId}/pdf`);
      if (!res.ok) throw new Error('Failed to generate PDF');

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${invoiceId}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      setStatus('idle');
    } catch (error) {
      setStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Download failed');
    }
  };

  return (
    <div>
      <button
        onClick={handleDownload}
        disabled={status === 'loading'}
        className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium disabled:opacity-50"
      >
        {status === 'loading' ? (
          <RefreshCw className="h-4 w-4 animate-spin" />
        ) : (
          <Download className="h-4 w-4" />
        )}
        Download PDF
      </button>
      {status === 'error' && (
        <div className="mt-2 flex items-center gap-2 text-xs text-red-600">
          <AlertCircle className="h-3 w-3" />
          {errorMessage}
        </div>
      )}
    </div>
  );
}
```

### Error Boundary

```tsx
// app/invoices/[id]/error.tsx
'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import Link from 'next/link';

export default function InvoiceError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Invoice error:', error);
  }, [error]);

  return (
    <div className="min-h-[50vh] flex items-center justify-center p-8">
      <div className="max-w-md text-center">
        <AlertTriangle className="mx-auto h-12 w-12 text-yellow-500" />
        <h2 className="mt-4 text-xl font-semibold">Failed to load invoice</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {error.message || 'Something went wrong loading this invoice.'}
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            <RefreshCw className="h-4 w-4" />
            Try again
          </button>
          <Link
            href="/invoices"
            className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium"
          >
            All invoices
          </Link>
        </div>
      </div>
    </div>
  );
}
```

## Loading States

### Invoice Loading Skeleton

```tsx
// app/invoices/[id]/loading.tsx
export default function InvoiceLoading() {
  return (
    <div className="min-h-screen bg-gray-100 py-8 dark:bg-gray-950">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Actions skeleton */}
        <div className="mb-6 flex items-center justify-between">
          <div className="h-5 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
          <div className="flex gap-2">
            <div className="h-10 w-20 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-800" />
            <div className="h-10 w-32 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-800" />
          </div>
        </div>

        {/* Invoice document skeleton */}
        <div className="overflow-hidden rounded-xl border bg-white dark:bg-gray-900">
          {/* Header */}
          <div className="border-b bg-gray-50 p-8 dark:bg-gray-800/50">
            <div className="flex justify-between">
              <div className="space-y-2">
                <div className="h-16 w-16 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700" />
                <div className="h-5 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                <div className="h-4 w-48 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
              </div>
              <div className="space-y-2 text-right">
                <div className="ml-auto h-8 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                <div className="ml-auto h-4 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                <div className="ml-auto h-4 w-28 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="p-8 space-y-8">
            <div className="grid gap-8 sm:grid-cols-2">
              <div className="space-y-2">
                <div className="h-4 w-16 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
                <div className="h-5 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
                <div className="h-4 w-48 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
              </div>
              <div className="space-y-2">
                <div className="h-4 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
                <div className="h-4 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
              </div>
            </div>

            {/* Line items */}
            <div className="space-y-4">
              <div className="h-10 w-full animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-12 w-full animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
              ))}
            </div>

            {/* Summary */}
            <div className="ml-auto max-w-sm space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex justify-between">
                  <div className="h-4 w-20 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
                  <div className="h-4 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

## Mobile Responsiveness

### Responsive Invoice Layout

```tsx
// components/invoice/responsive-invoice.tsx
export function ResponsiveInvoice({ invoice }: { invoice: Invoice }) {
  return (
    <div className="min-h-screen bg-gray-100 py-4 sm:py-8 dark:bg-gray-950 print:bg-white print:py-0">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Actions - responsive layout */}
        <div className="mb-4 sm:mb-6 print:hidden">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Link
              href="/invoices"
              className="inline-flex items-center gap-2 text-sm text-gray-600"
            >
              <ChevronLeft className="h-4 w-4" />
              Back
            </Link>
            <div className="flex flex-wrap gap-2">
              <button className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm">
                <Printer className="h-4 w-4" />
                <span className="hidden sm:inline">Print</span>
              </button>
              <button className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm">
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">Download</span>
              </button>
              {invoice.status === 'sent' && (
                <button className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 rounded-lg bg-green-600 px-3 py-2 text-sm text-white">
                  <CreditCard className="h-4 w-4" />
                  Pay
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Invoice document */}
        <div className="overflow-hidden rounded-lg sm:rounded-xl border bg-white shadow-sm dark:bg-gray-900">
          {/* Header - stack on mobile */}
          <header className="border-b bg-gray-50 p-4 sm:p-8 dark:bg-gray-800/50">
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-between">
              {/* Company info */}
              <div className="flex items-start gap-3 sm:gap-4">
                {invoice.company.logo && (
                  <Image
                    src={invoice.company.logo}
                    alt={invoice.company.name}
                    width={48}
                    height={48}
                    className="rounded-lg sm:w-16 sm:h-16"
                  />
                )}
                <div className="text-sm">
                  <h2 className="font-bold text-base sm:text-xl">
                    {invoice.company.name}
                  </h2>
                  <address className="mt-1 not-italic text-gray-600 text-xs sm:text-sm">
                    {invoice.company.address}
                  </address>
                </div>
              </div>

              {/* Invoice info */}
              <div className="flex items-center justify-between sm:block sm:text-right">
                <h1 className="text-lg sm:text-2xl font-bold">INVOICE</h1>
                <span className={`rounded-full px-2 py-0.5 text-xs sm:px-3 sm:py-1 sm:text-sm ${statusStyles[invoice.status]}`}>
                  {invoice.status}
                </span>
              </div>
            </div>
          </header>

          {/* Line items - horizontal scroll on mobile */}
          <div className="p-4 sm:p-8">
            <div className="-mx-4 overflow-x-auto sm:mx-0">
              <table className="w-full min-w-[500px] text-xs sm:text-sm">
                {/* Table content */}
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

### Breakpoint Reference

| Element | Mobile (<640px) | Tablet (640-1024px) | Desktop (>1024px) |
|---------|----------------|---------------------|-------------------|
| Container padding | 16px | 24px | 32px |
| Header layout | Stacked | Side by side | Side by side |
| Action buttons | Full width | Auto width | Auto width |
| Table | Horizontal scroll | Full width | Full width |
| Logo size | 48x48px | 64x64px | 64x64px |

## SEO Considerations

### Metadata Configuration

```tsx
// app/invoices/[id]/page.tsx
import { Metadata } from 'next';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const invoice = await getInvoice(id);

  return {
    title: `Invoice ${invoice.number}`,
    description: `Invoice for ${invoice.client.name} - ${invoice.status}`,
    robots: {
      index: false,
      follow: false,
    },
  };
}
```

### Print Optimization

```tsx
// Ensure proper print title
export const metadata: Metadata = {
  title: {
    template: '%s | Invoices',
    default: 'Invoice',
  },
};
```

## Testing Strategies

### Component Testing

```tsx
// __tests__/invoice-page.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import InvoicePage from '@/app/invoices/[id]/page';
import { InvoiceSummary } from '@/components/invoice/invoice-summary';

const mockInvoice = {
  id: 'inv-123',
  number: 'INV-001',
  status: 'sent',
  subtotal: 100,
  tax: { rate: 10, amount: 10 },
  total: 110,
  amountPaid: 0,
  amountDue: 110,
  currency: 'USD',
  lineItems: [],
  client: { name: 'Test Client' },
  company: { name: 'Test Company' },
};

describe('InvoicePage', () => {
  it('renders invoice number', async () => {
    render(await InvoicePage({ params: Promise.resolve({ id: 'inv-123' }) }));
    expect(screen.getByText('INV-001')).toBeInTheDocument();
  });

  it('shows status badge', async () => {
    render(await InvoicePage({ params: Promise.resolve({ id: 'inv-123' }) }));
    expect(screen.getByText('sent')).toBeInTheDocument();
  });
});

describe('InvoiceSummary', () => {
  it('displays formatted amounts', () => {
    render(<InvoiceSummary invoice={mockInvoice} />);
    expect(screen.getByText('$100.00')).toBeInTheDocument(); // subtotal
    expect(screen.getByText('$10.00')).toBeInTheDocument(); // tax
    expect(screen.getByText('$110.00')).toBeInTheDocument(); // total
  });

  it('shows amount due', () => {
    render(<InvoiceSummary invoice={mockInvoice} />);
    expect(screen.getByText('Amount Due')).toBeInTheDocument();
  });
});
```

### E2E Testing

```tsx
// e2e/invoice.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Invoice Page', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'password');
    await page.click('button[type="submit"]');
  });

  test('displays invoice details', async ({ page }) => {
    await page.goto('/invoices/inv-123');

    await expect(page.getByText('INVOICE')).toBeVisible();
    await expect(page.getByText('INV-001')).toBeVisible();
  });

  test('print button triggers print dialog', async ({ page }) => {
    await page.goto('/invoices/inv-123');

    // Mock window.print
    await page.evaluate(() => {
      window.print = () => {};
    });

    await page.click('text=Print');
    // Print dialog would open
  });

  test('download PDF button works', async ({ page }) => {
    await page.goto('/invoices/inv-123');

    const downloadPromise = page.waitForEvent('download');
    await page.click('text=Download PDF');
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain('invoice');
  });

  test('pay button navigates to payment page', async ({ page }) => {
    await page.goto('/invoices/inv-123');

    await page.click('text=Pay Now');
    await expect(page).toHaveURL(/\/pay$/);
  });

  test('responsive layout on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/invoices/inv-123');

    // Actions should be full width
    const printButton = page.getByRole('button', { name: /print/i });
    const box = await printButton.boundingBox();
    expect(box?.width).toBeGreaterThan(100);
  });
});
```

### Accessibility Testing

```tsx
// __tests__/invoice-accessibility.test.tsx
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import InvoicePage from '@/app/invoices/[id]/page';

expect.extend(toHaveNoViolations);

describe('Invoice Accessibility', () => {
  it('has no accessibility violations', async () => {
    const { container } = render(
      await InvoicePage({ params: Promise.resolve({ id: 'inv-123' }) })
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('table has proper structure', async () => {
    const { container } = render(
      await InvoicePage({ params: Promise.resolve({ id: 'inv-123' }) })
    );

    const table = container.querySelector('table');
    expect(table).toBeInTheDocument();
    expect(container.querySelector('thead')).toBeInTheDocument();
    expect(container.querySelector('tbody')).toBeInTheDocument();
  });

  it('has proper heading hierarchy', async () => {
    const { container } = render(
      await InvoicePage({ params: Promise.resolve({ id: 'inv-123' }) })
    );

    const h1 = container.querySelector('h1');
    expect(h1?.textContent).toContain('INVOICE');
  });
});
```

## Related Skills

- [L3/invoice-table](../organisms/invoice-table.md) - Invoice list table
- [L4/billing-page](./billing-page.md) - Billing settings
- [L5/payment-processing](../patterns/payment-processing.md) - Payment flow

## Changelog

### 1.0.0 (2025-01-17)
- Initial implementation with print and PDF support
