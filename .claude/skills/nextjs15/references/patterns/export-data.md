---
id: pt-export-data
name: Export Data
version: 2.0.0
layer: L5
category: files
description: Export data to CSV, Excel, PDF, and JSON formats with streaming support
tags: [export, csv, excel, pdf, json, download, data]
composes: []
dependencies:
  exceljs: "^4.4.0"
formula: Data Query + Format Conversion + Streaming = Scalable Data Export
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

- Exporting database records to CSV/Excel
- Generating PDF reports from data
- Streaming large datasets for download
- Creating scheduled export jobs
- Supporting multiple export formats

## Composition Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ Data Export Architecture                                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  User Request                                               │
│     │                                                       │
│     ▼                                                       │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Export Options                                      │   │
│  │ - Format: CSV | XLSX | PDF | JSON                   │   │
│  │ - Columns selection                                 │   │
│  │ - Filters & date range                              │   │
│  └─────────────────────┬───────────────────────────────┘   │
│                        │                                    │
│         ┌──────────────┴──────────────┐                    │
│         ▼                             ▼                    │
│  Small Dataset             Large Dataset                   │
│  (Direct Export)           (Background Job)                │
│         │                             │                    │
│         ▼                             ▼                    │
│  ┌────────────┐               ┌─────────────────┐         │
│  │ Stream     │               │ Queue Job       │         │
│  │ Response   │               │ - Process chunks│         │
│  │            │               │ - Store in S3   │         │
│  └────────────┘               │ - Email link    │         │
│                               └─────────────────┘         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

# Export Data

## Overview

Comprehensive data export functionality supporting CSV, Excel (XLSX), PDF, and JSON formats. Includes streaming for large datasets, formatting options, and progress tracking.

## Implementation

### Export Types and Configuration

```tsx
// lib/export/types.ts
export type ExportFormat = 'csv' | 'xlsx' | 'pdf' | 'json';

export interface ExportColumn<T> {
  key: keyof T | string;
  header: string;
  width?: number;
  format?: (value: unknown, row: T) => string;
  align?: 'left' | 'center' | 'right';
}

export interface ExportOptions<T> {
  filename: string;
  format: ExportFormat;
  columns: ExportColumn<T>[];
  title?: string;
  subtitle?: string;
  includeTimestamp?: boolean;
  sheetName?: string; // For Excel
  orientation?: 'portrait' | 'landscape'; // For PDF
}

export interface ExportResult {
  success: boolean;
  filename: string;
  size: number;
  error?: string;
}
```

### CSV Exporter

```tsx
// lib/export/csv-exporter.ts
import { ExportColumn } from './types';

export function exportToCSV<T extends Record<string, unknown>>(
  data: T[],
  columns: ExportColumn<T>[],
  filename: string
): Blob {
  const headers = columns.map((col) => escapeCSV(col.header));
  const rows = data.map((row) =>
    columns.map((col) => {
      const value = getNestedValue(row, col.key as string);
      const formatted = col.format ? col.format(value, row) : String(value ?? '');
      return escapeCSV(formatted);
    })
  );

  const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const BOM = '\uFEFF'; // UTF-8 BOM for Excel compatibility
  
  return new Blob([BOM + csv], { type: 'text/csv;charset=utf-8;' });
}

function escapeCSV(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  return path.split('.').reduce((acc, key) => {
    if (acc && typeof acc === 'object') {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj as unknown);
}

// Streaming CSV for large datasets
export async function* streamCSV<T extends Record<string, unknown>>(
  data: AsyncIterable<T>,
  columns: ExportColumn<T>[]
): AsyncGenerator<string> {
  // Yield headers
  const headers = columns.map((col) => escapeCSV(col.header));
  yield '\uFEFF' + headers.join(',') + '\n';

  // Yield rows
  for await (const row of data) {
    const values = columns.map((col) => {
      const value = getNestedValue(row, col.key as string);
      const formatted = col.format ? col.format(value, row) : String(value ?? '');
      return escapeCSV(formatted);
    });
    yield values.join(',') + '\n';
  }
}
```

### Excel Exporter

```tsx
// lib/export/excel-exporter.ts
import * as XLSX from 'xlsx';
import { ExportColumn, ExportOptions } from './types';

export function exportToExcel<T extends Record<string, unknown>>(
  data: T[],
  options: ExportOptions<T>
): Blob {
  const { columns, sheetName = 'Data', title, subtitle, includeTimestamp } = options;

  // Create workbook and worksheet
  const wb = XLSX.utils.book_new();
  
  // Prepare data with headers
  const wsData: (string | number | Date)[][] = [];

  // Add title rows if provided
  let startRow = 0;
  if (title) {
    wsData.push([title]);
    startRow++;
  }
  if (subtitle) {
    wsData.push([subtitle]);
    startRow++;
  }
  if (includeTimestamp) {
    wsData.push([`Generated: ${new Date().toLocaleString()}`]);
    startRow++;
  }
  if (startRow > 0) {
    wsData.push([]); // Empty row before data
    startRow++;
  }

  // Add headers
  wsData.push(columns.map((col) => col.header));

  // Add data rows
  data.forEach((row) => {
    const values = columns.map((col) => {
      const value = getNestedValue(row, col.key as string);
      return col.format ? col.format(value, row) : value;
    });
    wsData.push(values as (string | number | Date)[]);
  });

  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // Set column widths
  ws['!cols'] = columns.map((col) => ({
    wch: col.width || Math.max(col.header.length, 15),
  }));

  // Style title row
  if (title) {
    const titleCell = ws['A1'];
    if (titleCell) {
      titleCell.s = {
        font: { bold: true, sz: 16 },
      };
    }
  }

  XLSX.utils.book_append_sheet(wb, ws, sheetName);

  // Generate buffer
  const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
  
  return new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
}

function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  return path.split('.').reduce((acc, key) => {
    if (acc && typeof acc === 'object') {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj as unknown);
}

// Multiple sheets export
export function exportToExcelMultiSheet<T extends Record<string, unknown>>(
  sheets: { name: string; data: T[]; columns: ExportColumn<T>[] }[],
  filename: string
): Blob {
  const wb = XLSX.utils.book_new();

  sheets.forEach(({ name, data, columns }) => {
    const wsData = [
      columns.map((col) => col.header),
      ...data.map((row) =>
        columns.map((col) => {
          const value = getNestedValue(row, col.key as string);
          return col.format ? col.format(value, row) : value;
        })
      ),
    ];

    const ws = XLSX.utils.aoa_to_sheet(wsData as unknown[][]);
    ws['!cols'] = columns.map((col) => ({
      wch: col.width || Math.max(col.header.length, 15),
    }));

    XLSX.utils.book_append_sheet(wb, ws, name);
  });

  const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
  
  return new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
}
```

### PDF Exporter

```tsx
// lib/export/pdf-exporter.ts
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ExportColumn, ExportOptions } from './types';

export function exportToPDF<T extends Record<string, unknown>>(
  data: T[],
  options: ExportOptions<T>
): Blob {
  const {
    columns,
    title,
    subtitle,
    includeTimestamp,
    orientation = 'portrait',
  } = options;

  const doc = new jsPDF({
    orientation,
    unit: 'mm',
    format: 'a4',
  });

  let yPosition = 20;

  // Add title
  if (title) {
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(title, 14, yPosition);
    yPosition += 10;
  }

  // Add subtitle
  if (subtitle) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(subtitle, 14, yPosition);
    yPosition += 8;
  }

  // Add timestamp
  if (includeTimestamp) {
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, yPosition);
    yPosition += 10;
    doc.setTextColor(0);
  }

  // Prepare table data
  const headers = columns.map((col) => col.header);
  const rows = data.map((row) =>
    columns.map((col) => {
      const value = getNestedValue(row, col.key as string);
      return col.format ? col.format(value, row) : String(value ?? '');
    })
  );

  // Add table
  autoTable(doc, {
    head: [headers],
    body: rows,
    startY: yPosition,
    styles: {
      fontSize: 9,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: [59, 130, 246], // Blue
      textColor: 255,
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [245, 247, 250],
    },
    columnStyles: columns.reduce((acc, col, index) => {
      acc[index] = {
        halign: col.align || 'left',
        cellWidth: col.width ? col.width * 0.3 : 'auto',
      };
      return acc;
    }, {} as Record<number, { halign: string; cellWidth: number | 'auto' }>),
  });

  // Add page numbers
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(10);
    doc.setTextColor(150);
    doc.text(
      `Page ${i} of ${pageCount}`,
      doc.internal.pageSize.width / 2,
      doc.internal.pageSize.height - 10,
      { align: 'center' }
    );
  }

  return doc.output('blob');
}

function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  return path.split('.').reduce((acc, key) => {
    if (acc && typeof acc === 'object') {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj as unknown);
}
```

### JSON Exporter

```tsx
// lib/export/json-exporter.ts
import { ExportColumn } from './types';

export function exportToJSON<T extends Record<string, unknown>>(
  data: T[],
  columns?: ExportColumn<T>[],
  pretty = true
): Blob {
  let exportData: unknown;

  if (columns) {
    // Export only specified columns
    exportData = data.map((row) => {
      const obj: Record<string, unknown> = {};
      columns.forEach((col) => {
        const key = col.key as string;
        const value = getNestedValue(row, key);
        obj[col.header] = col.format ? col.format(value, row) : value;
      });
      return obj;
    });
  } else {
    exportData = data;
  }

  const json = pretty
    ? JSON.stringify(exportData, null, 2)
    : JSON.stringify(exportData);

  return new Blob([json], { type: 'application/json' });
}

function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  return path.split('.').reduce((acc, key) => {
    if (acc && typeof acc === 'object') {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj as unknown);
}

// NDJSON (Newline Delimited JSON) for streaming
export async function* streamNDJSON<T>(
  data: AsyncIterable<T>
): AsyncGenerator<string> {
  for await (const item of data) {
    yield JSON.stringify(item) + '\n';
  }
}
```

### Export Hook

```tsx
// hooks/use-export.ts
'use client';

import { useState, useCallback } from 'react';
import { ExportOptions, ExportFormat, ExportResult } from '@/lib/export/types';
import { exportToCSV } from '@/lib/export/csv-exporter';
import { exportToExcel } from '@/lib/export/excel-exporter';
import { exportToPDF } from '@/lib/export/pdf-exporter';
import { exportToJSON } from '@/lib/export/json-exporter';

interface UseExportState {
  isExporting: boolean;
  progress: number;
  error: string | null;
}

export function useExport<T extends Record<string, unknown>>() {
  const [state, setState] = useState<UseExportState>({
    isExporting: false,
    progress: 0,
    error: null,
  });

  const exportData = useCallback(
    async (data: T[], options: ExportOptions<T>): Promise<ExportResult> => {
      setState({ isExporting: true, progress: 0, error: null });

      try {
        let blob: Blob;
        const filename = getFilename(options.filename, options.format);

        setState((prev) => ({ ...prev, progress: 25 }));

        switch (options.format) {
          case 'csv':
            blob = exportToCSV(data, options.columns, filename);
            break;
          case 'xlsx':
            blob = exportToExcel(data, options);
            break;
          case 'pdf':
            blob = exportToPDF(data, options);
            break;
          case 'json':
            blob = exportToJSON(data, options.columns);
            break;
          default:
            throw new Error(`Unsupported format: ${options.format}`);
        }

        setState((prev) => ({ ...prev, progress: 75 }));

        // Trigger download
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        setState({ isExporting: false, progress: 100, error: null });

        return {
          success: true,
          filename,
          size: blob.size,
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Export failed';
        setState({ isExporting: false, progress: 0, error: message });

        return {
          success: false,
          filename: '',
          size: 0,
          error: message,
        };
      }
    },
    []
  );

  return {
    ...state,
    exportData,
  };
}

function getFilename(base: string, format: ExportFormat): string {
  const ext = format === 'xlsx' ? 'xlsx' : format;
  const hasExt = base.toLowerCase().endsWith(`.${ext}`);
  return hasExt ? base : `${base}.${ext}`;
}
```

### Export Dialog Component

```tsx
// components/export-dialog.tsx
'use client';

import { useState } from 'react';
import { X, Download, FileText, Table, FileJson, FileType } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import { ExportFormat, ExportColumn } from '@/lib/export/types';
import { useExport } from '@/hooks/use-export';

interface ExportDialogProps<T> {
  data: T[];
  columns: ExportColumn<T>[];
  defaultFilename?: string;
  trigger: React.ReactNode;
  onExportComplete?: (result: { format: ExportFormat; filename: string }) => void;
}

export function ExportDialog<T extends Record<string, unknown>>({
  data,
  columns,
  defaultFilename = 'export',
  trigger,
  onExportComplete,
}: ExportDialogProps<T>) {
  const [open, setOpen] = useState(false);
  const [format, setFormat] = useState<ExportFormat>('csv');
  const [filename, setFilename] = useState(defaultFilename);
  const [includeTimestamp, setIncludeTimestamp] = useState(true);

  const { isExporting, progress, error, exportData } = useExport<T>();

  const formats: { value: ExportFormat; label: string; icon: React.ReactNode }[] = [
    { value: 'csv', label: 'CSV', icon: <FileText className="w-5 h-5" /> },
    { value: 'xlsx', label: 'Excel', icon: <Table className="w-5 h-5" /> },
    { value: 'pdf', label: 'PDF', icon: <FileType className="w-5 h-5" /> },
    { value: 'json', label: 'JSON', icon: <FileJson className="w-5 h-5" /> },
  ];

  const handleExport = async () => {
    const result = await exportData(data, {
      filename,
      format,
      columns,
      title: filename,
      includeTimestamp,
    });

    if (result.success) {
      onExportComplete?.({ format, filename: result.filename });
      setOpen(false);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 data-[state=open]:animate-fade-in" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl w-full max-w-md p-6 data-[state=open]:animate-slide-up">
          <div className="flex justify-between items-center mb-6">
            <Dialog.Title className="text-xl font-semibold">
              Export Data
            </Dialog.Title>
            <Dialog.Close className="p-1 rounded-md hover:bg-gray-100">
              <X className="w-5 h-5" />
            </Dialog.Close>
          </div>

          <div className="space-y-6">
            {/* Format Selection */}
            <div>
              <label className="block text-sm font-medium mb-2">Format</label>
              <div className="grid grid-cols-4 gap-2">
                {formats.map((f) => (
                  <button
                    key={f.value}
                    onClick={() => setFormat(f.value)}
                    className={`
                      flex flex-col items-center gap-1 p-3 rounded-lg border-2 transition-colors
                      ${format === f.value
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300'
                      }
                    `}
                  >
                    {f.icon}
                    <span className="text-xs font-medium">{f.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Filename */}
            <div>
              <label htmlFor="filename" className="block text-sm font-medium mb-2">
                Filename
              </label>
              <input
                id="filename"
                type="text"
                value={filename}
                onChange={(e) => setFilename(e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Options */}
            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={includeTimestamp}
                  onChange={(e) => setIncludeTimestamp(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm">Include timestamp</span>
              </label>
            </div>

            {/* Data Info */}
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-sm text-gray-600">
                <span className="font-medium">{data.length}</span> rows,{' '}
                <span className="font-medium">{columns.length}</span> columns
              </p>
            </div>

            {/* Progress */}
            {isExporting && (
              <div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-sm text-gray-600 mt-1">Exporting...</p>
              </div>
            )}

            {/* Error */}
            {error && (
              <p className="text-sm text-red-500">{error}</p>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-3">
              <Dialog.Close asChild>
                <button className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md">
                  Cancel
                </button>
              </Dialog.Close>
              <button
                onClick={handleExport}
                disabled={isExporting || !filename}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
```

### Server-Side Export Route

```tsx
// app/api/export/route.ts
import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';

export async function POST(request: NextRequest) {
  const { data, columns, format, filename } = await request.json();

  let content: Buffer | string;
  let contentType: string;
  let fileExtension: string;

  switch (format) {
    case 'csv': {
      const headers = columns.map((c: { header: string }) => c.header);
      const rows = data.map((row: Record<string, unknown>) =>
        columns.map((c: { key: string }) => escapeCSV(String(row[c.key] ?? '')))
      );
      content = '\uFEFF' + [headers.join(','), ...rows.map((r: string[]) => r.join(','))].join('\n');
      contentType = 'text/csv;charset=utf-8';
      fileExtension = 'csv';
      break;
    }

    case 'xlsx': {
      const wb = XLSX.utils.book_new();
      const wsData = [
        columns.map((c: { header: string }) => c.header),
        ...data.map((row: Record<string, unknown>) =>
          columns.map((c: { key: string }) => row[c.key])
        ),
      ];
      const ws = XLSX.utils.aoa_to_sheet(wsData);
      XLSX.utils.book_append_sheet(wb, ws, 'Data');
      content = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
      contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      fileExtension = 'xlsx';
      break;
    }

    case 'json': {
      content = JSON.stringify(data, null, 2);
      contentType = 'application/json';
      fileExtension = 'json';
      break;
    }

    default:
      return NextResponse.json({ error: 'Unsupported format' }, { status: 400 });
  }

  return new NextResponse(content, {
    headers: {
      'Content-Type': contentType,
      'Content-Disposition': `attachment; filename="${filename}.${fileExtension}"`,
    },
  });
}

function escapeCSV(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}
```

## Usage

```tsx
// app/reports/page.tsx
'use client';

import { ExportDialog } from '@/components/export-dialog';
import { Download } from 'lucide-react';
import { ExportColumn } from '@/lib/export/types';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  status: 'active' | 'inactive';
}

const users: User[] = [
  { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin', createdAt: '2024-01-15', status: 'active' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'User', createdAt: '2024-02-20', status: 'active' },
  { id: 3, name: 'Bob Wilson', email: 'bob@example.com', role: 'User', createdAt: '2024-03-10', status: 'inactive' },
];

const columns: ExportColumn<User>[] = [
  { key: 'id', header: 'ID', width: 10, align: 'center' },
  { key: 'name', header: 'Full Name', width: 25 },
  { key: 'email', header: 'Email Address', width: 30 },
  { key: 'role', header: 'Role', width: 15 },
  {
    key: 'createdAt',
    header: 'Created',
    width: 15,
    format: (value) => new Date(value as string).toLocaleDateString(),
  },
  {
    key: 'status',
    header: 'Status',
    width: 12,
    format: (value) => (value === 'active' ? 'Active' : 'Inactive'),
  },
];

export default function ReportsPage() {
  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">User Report</h1>
        
        <ExportDialog
          data={users}
          columns={columns}
          defaultFilename="user-report"
          trigger={
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              <Download className="w-4 h-4" />
              Export
            </button>
          }
          onExportComplete={({ format, filename }) => {
            console.log(`Exported as ${format}: ${filename}`);
          }}
        />
      </div>

      <table className="w-full border-collapse border">
        <thead>
          <tr className="bg-gray-100">
            {columns.map((col) => (
              <th key={col.key as string} className="border p-2 text-left">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className="hover:bg-gray-50">
              {columns.map((col) => (
                <td key={col.key as string} className="border p-2">
                  {col.format
                    ? col.format(user[col.key as keyof User], user)
                    : String(user[col.key as keyof User])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

## Related Skills

- [[import-data]] - Data import patterns
- [[download-files]] - File download handling
- [[data-table]] - Data table component
- [[filtering]] - Data filtering

## Changelog

### 2.0.0 (2025-01-17)
- Standardized to atomic design system v2
- Updated frontmatter schema

### 1.0.0 (2025-01-17)
- Initial implementation
- CSV, Excel, PDF, JSON export
- Export dialog component
- Streaming support for large datasets
- Server-side export route
