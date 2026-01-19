---
id: pt-import-data
name: Import Data
version: 2.0.0
layer: L5
category: data
description: Import data from CSV, Excel, and JSON files with validation and mapping
tags: [import, csv, excel, json, upload, parsing, validation]
composes: []
formula: "DataImport = FileParsing + ColumnMapping + ZodValidation + PreviewStep + ErrorReporting"
dependencies:
  - react
  - next
  - xlsx
  - papaparse
  - zod
accessibility:
  wcag: AA
  keyboard: true
  screen-reader: true
performance:
  impact: low
  lcp: neutral
  cls: neutral
---

# Import Data

## When to Use

- Bulk importing users, products, or inventory from spreadsheets
- Migrating data from other systems via CSV/Excel exports
- Allowing users to upload contact lists or mailing lists
- Importing financial data (transactions, invoices)
- Loading configuration data from JSON files
- Building admin interfaces for batch data entry

## Composition Diagram

```
[File Input]
      |
      v
[File Parser] ---> [Detect Format: CSV/XLSX/JSON]
      |
      +---> [CSV: PapaParse]
      +---> [XLSX: SheetJS]
      +---> [JSON: Native parse]
      |
      v
[Extracted Data]
      |
      v
[Column Mapping UI]
      |
      +---> [Source Headers] <--Map To--> [Target Schema]
      +---> [Auto-match by name similarity]
      |
      v
[Preview Step] ---> [Show first N rows transformed]
      |
      v
[Validation] ---> [Zod Schema]
      |
      +---> [Valid Rows] ---> [Import to DB]
      +---> [Invalid Rows] ---> [Error Report]
      |
      v
[Result Summary]
      |
      +---> [N imported, M skipped, K errors]
```

## Overview

Comprehensive data import functionality supporting CSV, Excel (XLSX), and JSON files with schema validation, column mapping, preview, and error handling.

## Implementation

### Import Types

```tsx
// lib/import/types.ts
import { z } from 'zod';

export type ImportFormat = 'csv' | 'xlsx' | 'json';

export interface ImportColumn {
  key: string;
  label: string;
  required?: boolean;
  type?: 'string' | 'number' | 'date' | 'boolean' | 'email';
  transform?: (value: unknown) => unknown;
}

export interface ColumnMapping {
  sourceColumn: string;
  targetColumn: string;
}

export interface ImportError {
  row: number;
  column: string;
  value: unknown;
  message: string;
}

export interface ImportResult<T> {
  success: boolean;
  data: T[];
  errors: ImportError[];
  totalRows: number;
  validRows: number;
  skippedRows: number;
}

export interface ParsedFile {
  headers: string[];
  rows: Record<string, unknown>[];
  format: ImportFormat;
}
```

### File Parser

```tsx
// lib/import/parser.ts
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import { ParsedFile, ImportFormat } from './types';

export async function parseFile(file: File): Promise<ParsedFile> {
  const format = detectFormat(file);

  switch (format) {
    case 'csv':
      return parseCSV(file);
    case 'xlsx':
      return parseExcel(file);
    case 'json':
      return parseJSON(file);
    default:
      throw new Error(`Unsupported file format: ${file.name}`);
  }
}

function detectFormat(file: File): ImportFormat {
  const ext = file.name.split('.').pop()?.toLowerCase();
  
  if (ext === 'csv' || file.type === 'text/csv') return 'csv';
  if (ext === 'xlsx' || ext === 'xls' || file.type.includes('spreadsheet')) return 'xlsx';
  if (ext === 'json' || file.type === 'application/json') return 'json';
  
  throw new Error(`Unknown file format: ${file.name}`);
}

async function parseCSV(file: File): Promise<ParsedFile> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim(),
      complete: (results) => {
        const headers = results.meta.fields || [];
        const rows = results.data as Record<string, unknown>[];
        
        resolve({
          headers,
          rows,
          format: 'csv',
        });
      },
      error: (error) => {
        reject(new Error(`CSV parsing failed: ${error.message}`));
      },
    });
  });
}

async function parseExcel(file: File): Promise<ParsedFile> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array' });
  
  // Get first sheet
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  
  // Convert to JSON
  const jsonData = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
    defval: '',
  });
  
  // Extract headers from first row
  const headers = jsonData.length > 0 ? Object.keys(jsonData[0]) : [];
  
  return {
    headers,
    rows: jsonData,
    format: 'xlsx',
  };
}

async function parseJSON(file: File): Promise<ParsedFile> {
  const text = await file.text();
  const data = JSON.parse(text);
  
  // Handle both array and object with data property
  const rows: Record<string, unknown>[] = Array.isArray(data)
    ? data
    : data.data || [data];
  
  const headers = rows.length > 0 ? Object.keys(rows[0]) : [];
  
  return {
    headers,
    rows,
    format: 'json',
  };
}

// Parse specific sheet from Excel
export async function parseExcelSheet(
  file: File,
  sheetIndex: number = 0
): Promise<ParsedFile> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array' });
  
  const sheetName = workbook.SheetNames[sheetIndex];
  if (!sheetName) {
    throw new Error(`Sheet at index ${sheetIndex} not found`);
  }
  
  const sheet = workbook.Sheets[sheetName];
  const jsonData = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet);
  const headers = jsonData.length > 0 ? Object.keys(jsonData[0]) : [];
  
  return {
    headers,
    rows: jsonData,
    format: 'xlsx',
  };
}

// Get sheet names from Excel file
export async function getExcelSheets(file: File): Promise<string[]> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array' });
  return workbook.SheetNames;
}
```

### Data Validator

```tsx
// lib/import/validator.ts
import { z } from 'zod';
import { ImportColumn, ImportError, ImportResult, ColumnMapping } from './types';

export function createValidator(columns: ImportColumn[]) {
  const shape: Record<string, z.ZodTypeAny> = {};

  columns.forEach((col) => {
    let schema: z.ZodTypeAny;

    switch (col.type) {
      case 'number':
        schema = z.coerce.number();
        break;
      case 'date':
        schema = z.coerce.date();
        break;
      case 'boolean':
        schema = z.coerce.boolean();
        break;
      case 'email':
        schema = z.string().email();
        break;
      default:
        schema = z.string();
    }

    if (!col.required) {
      schema = schema.optional().nullable();
    }

    shape[col.key] = schema;
  });

  return z.object(shape);
}

export function validateAndTransform<T>(
  rows: Record<string, unknown>[],
  columns: ImportColumn[],
  mapping: ColumnMapping[]
): ImportResult<T> {
  const validator = createValidator(columns);
  const errors: ImportError[] = [];
  const validData: T[] = [];
  let skippedRows = 0;

  rows.forEach((row, rowIndex) => {
    // Apply column mapping
    const mappedRow: Record<string, unknown> = {};
    
    mapping.forEach(({ sourceColumn, targetColumn }) => {
      let value = row[sourceColumn];
      
      // Apply transforms
      const column = columns.find((c) => c.key === targetColumn);
      if (column?.transform) {
        value = column.transform(value);
      }
      
      mappedRow[targetColumn] = value;
    });

    // Validate
    const result = validator.safeParse(mappedRow);

    if (result.success) {
      validData.push(result.data as T);
    } else {
      skippedRows++;
      result.error.errors.forEach((err) => {
        errors.push({
          row: rowIndex + 1,
          column: err.path.join('.'),
          value: mappedRow[err.path[0] as string],
          message: err.message,
        });
      });
    }
  });

  return {
    success: errors.length === 0,
    data: validData,
    errors,
    totalRows: rows.length,
    validRows: validData.length,
    skippedRows,
  };
}

// Quick validation check
export function validateRow(
  row: Record<string, unknown>,
  columns: ImportColumn[]
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  columns.forEach((col) => {
    const value = row[col.key];

    if (col.required && (value === undefined || value === null || value === '')) {
      errors.push(`${col.label} is required`);
      return;
    }

    if (value === undefined || value === null || value === '') return;

    switch (col.type) {
      case 'number':
        if (isNaN(Number(value))) {
          errors.push(`${col.label} must be a number`);
        }
        break;
      case 'email':
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value))) {
          errors.push(`${col.label} must be a valid email`);
        }
        break;
      case 'date':
        if (isNaN(Date.parse(String(value)))) {
          errors.push(`${col.label} must be a valid date`);
        }
        break;
    }
  });

  return { valid: errors.length === 0, errors };
}
```

### Import Hook

```tsx
// hooks/use-import.ts
'use client';

import { useState, useCallback } from 'react';
import { parseFile, getExcelSheets } from '@/lib/import/parser';
import { validateAndTransform } from '@/lib/import/validator';
import {
  ImportColumn,
  ColumnMapping,
  ImportResult,
  ParsedFile,
  ImportError,
} from '@/lib/import/types';

interface UseImportState {
  step: 'upload' | 'mapping' | 'preview' | 'complete';
  file: File | null;
  parsedFile: ParsedFile | null;
  mapping: ColumnMapping[];
  result: ImportResult<unknown> | null;
  isProcessing: boolean;
  error: string | null;
}

export function useImport<T>(columns: ImportColumn[]) {
  const [state, setState] = useState<UseImportState>({
    step: 'upload',
    file: null,
    parsedFile: null,
    mapping: [],
    result: null,
    isProcessing: false,
    error: null,
  });

  const handleFileSelect = useCallback(
    async (file: File) => {
      setState((prev) => ({
        ...prev,
        isProcessing: true,
        error: null,
        file,
      }));

      try {
        const parsedFile = await parseFile(file);

        // Auto-map columns by matching names
        const autoMapping: ColumnMapping[] = columns
          .map((col) => {
            const matchedHeader = parsedFile.headers.find(
              (h) =>
                h.toLowerCase() === col.key.toLowerCase() ||
                h.toLowerCase() === col.label.toLowerCase()
            );

            return matchedHeader
              ? { sourceColumn: matchedHeader, targetColumn: col.key }
              : null;
          })
          .filter((m): m is ColumnMapping => m !== null);

        setState((prev) => ({
          ...prev,
          parsedFile,
          mapping: autoMapping,
          step: 'mapping',
          isProcessing: false,
        }));
      } catch (error) {
        setState((prev) => ({
          ...prev,
          error: error instanceof Error ? error.message : 'Failed to parse file',
          isProcessing: false,
        }));
      }
    },
    [columns]
  );

  const updateMapping = useCallback((mapping: ColumnMapping[]) => {
    setState((prev) => ({ ...prev, mapping }));
  }, []);

  const proceedToPreview = useCallback(() => {
    setState((prev) => ({ ...prev, step: 'preview' }));
  }, []);

  const processImport = useCallback(() => {
    if (!state.parsedFile) return;

    setState((prev) => ({ ...prev, isProcessing: true }));

    const result = validateAndTransform<T>(
      state.parsedFile.rows,
      columns,
      state.mapping
    );

    setState((prev) => ({
      ...prev,
      result,
      step: 'complete',
      isProcessing: false,
    }));

    return result;
  }, [state.parsedFile, state.mapping, columns]);

  const reset = useCallback(() => {
    setState({
      step: 'upload',
      file: null,
      parsedFile: null,
      mapping: [],
      result: null,
      isProcessing: false,
      error: null,
    });
  }, []);

  const goBack = useCallback(() => {
    setState((prev) => {
      const steps: UseImportState['step'][] = ['upload', 'mapping', 'preview', 'complete'];
      const currentIndex = steps.indexOf(prev.step);
      const prevStep = currentIndex > 0 ? steps[currentIndex - 1] : prev.step;
      return { ...prev, step: prevStep };
    });
  }, []);

  return {
    ...state,
    handleFileSelect,
    updateMapping,
    proceedToPreview,
    processImport,
    reset,
    goBack,
  };
}
```

### Import Wizard Component

```tsx
// components/import-wizard.tsx
'use client';

import { useCallback } from 'react';
import { Upload, ArrowLeft, ArrowRight, Check, AlertCircle, X } from 'lucide-react';
import { useImport } from '@/hooks/use-import';
import { ImportColumn, ColumnMapping } from '@/lib/import/types';

interface ImportWizardProps<T> {
  columns: ImportColumn[];
  onComplete: (data: T[]) => void;
  onCancel?: () => void;
}

export function ImportWizard<T>({
  columns,
  onComplete,
  onCancel,
}: ImportWizardProps<T>) {
  const {
    step,
    file,
    parsedFile,
    mapping,
    result,
    isProcessing,
    error,
    handleFileSelect,
    updateMapping,
    proceedToPreview,
    processImport,
    reset,
    goBack,
  } = useImport<T>(columns);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file) handleFileSelect(file);
    },
    [handleFileSelect]
  );

  const handleComplete = () => {
    if (result?.data) {
      onComplete(result.data as T[]);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full">
      {/* Header */}
      <div className="px-6 py-4 border-b flex items-center justify-between">
        <h2 className="text-xl font-semibold">Import Data</h2>
        {onCancel && (
          <button onClick={onCancel} className="p-1 hover:bg-gray-100 rounded">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Progress Steps */}
      <div className="px-6 py-4 border-b">
        <div className="flex items-center justify-between">
          {['Upload', 'Map Columns', 'Preview', 'Complete'].map((label, i) => {
            const stepNames = ['upload', 'mapping', 'preview', 'complete'];
            const currentIndex = stepNames.indexOf(step);
            const isActive = i === currentIndex;
            const isComplete = i < currentIndex;

            return (
              <div key={label} className="flex items-center">
                <div
                  className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                    ${isComplete ? 'bg-green-500 text-white' : ''}
                    ${isActive ? 'bg-blue-500 text-white' : ''}
                    ${!isActive && !isComplete ? 'bg-gray-200 text-gray-600' : ''}
                  `}
                >
                  {isComplete ? <Check className="w-4 h-4" /> : i + 1}
                </div>
                <span className={`ml-2 text-sm ${isActive ? 'font-medium' : 'text-gray-500'}`}>
                  {label}
                </span>
                {i < 3 && (
                  <div className={`w-16 h-0.5 mx-4 ${i < currentIndex ? 'bg-green-500' : 'bg-gray-200'}`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="p-6 min-h-[400px]">
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}

        {step === 'upload' && (
          <UploadStep
            onDrop={handleDrop}
            onFileSelect={handleFileSelect}
            isProcessing={isProcessing}
          />
        )}

        {step === 'mapping' && parsedFile && (
          <MappingStep
            sourceHeaders={parsedFile.headers}
            targetColumns={columns}
            mapping={mapping}
            onMappingChange={updateMapping}
          />
        )}

        {step === 'preview' && parsedFile && (
          <PreviewStep
            parsedFile={parsedFile}
            mapping={mapping}
            columns={columns}
          />
        )}

        {step === 'complete' && result && (
          <CompleteStep result={result} />
        )}
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t flex justify-between">
        <button
          onClick={step === 'upload' ? onCancel : goBack}
          disabled={isProcessing}
          className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md disabled:opacity-50"
        >
          <ArrowLeft className="w-4 h-4" />
          {step === 'upload' ? 'Cancel' : 'Back'}
        </button>

        <div className="flex gap-3">
          {step === 'complete' ? (
            <>
              <button
                onClick={reset}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
              >
                Import Another
              </button>
              <button
                onClick={handleComplete}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                <Check className="w-4 h-4" />
                Done ({result?.validRows} rows)
              </button>
            </>
          ) : (
            <button
              onClick={step === 'mapping' ? proceedToPreview : processImport}
              disabled={isProcessing || (step === 'mapping' && mapping.length === 0)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {step === 'preview' ? 'Import' : 'Next'}
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// Upload Step Component
function UploadStep({
  onDrop,
  onFileSelect,
  isProcessing,
}: {
  onDrop: (e: React.DragEvent) => void;
  onFileSelect: (file: File) => void;
  isProcessing: boolean;
}) {
  return (
    <div
      onDrop={onDrop}
      onDragOver={(e) => e.preventDefault()}
      className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-gray-400 transition-colors"
    >
      <input
        type="file"
        id="import-file"
        accept=".csv,.xlsx,.xls,.json"
        onChange={(e) => e.target.files?.[0] && onFileSelect(e.target.files[0])}
        className="hidden"
        disabled={isProcessing}
      />
      <label htmlFor="import-file" className="cursor-pointer">
        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-lg font-medium text-gray-700 mb-2">
          {isProcessing ? 'Processing...' : 'Drop file here or click to upload'}
        </p>
        <p className="text-sm text-gray-500">
          Supports CSV, Excel (.xlsx), and JSON files
        </p>
      </label>
    </div>
  );
}

// Mapping Step Component
function MappingStep({
  sourceHeaders,
  targetColumns,
  mapping,
  onMappingChange,
}: {
  sourceHeaders: string[];
  targetColumns: ImportColumn[];
  mapping: ColumnMapping[];
  onMappingChange: (mapping: ColumnMapping[]) => void;
}) {
  const handleMappingChange = (targetKey: string, sourceColumn: string) => {
    const newMapping = mapping.filter((m) => m.targetColumn !== targetKey);
    if (sourceColumn) {
      newMapping.push({ sourceColumn, targetColumn: targetKey });
    }
    onMappingChange(newMapping);
  };

  const getMappedSource = (targetKey: string) => {
    return mapping.find((m) => m.targetColumn === targetKey)?.sourceColumn || '';
  };

  return (
    <div className="space-y-4">
      <p className="text-gray-600 mb-6">
        Map the columns from your file to the expected data fields.
      </p>

      <div className="grid gap-4">
        {targetColumns.map((col) => (
          <div key={col.key} className="flex items-center gap-4">
            <div className="w-1/3">
              <span className="font-medium">{col.label}</span>
              {col.required && <span className="text-red-500 ml-1">*</span>}
              {col.type && (
                <span className="text-xs text-gray-500 ml-2">({col.type})</span>
              )}
            </div>
            <ArrowRight className="w-4 h-4 text-gray-400" />
            <select
              value={getMappedSource(col.key)}
              onChange={(e) => handleMappingChange(col.key, e.target.value)}
              className="flex-1 px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Select column --</option>
              {sourceHeaders.map((header) => (
                <option key={header} value={header}>
                  {header}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>
    </div>
  );
}

// Preview Step Component
function PreviewStep({
  parsedFile,
  mapping,
  columns,
}: {
  parsedFile: { headers: string[]; rows: Record<string, unknown>[] };
  mapping: ColumnMapping[];
  columns: ImportColumn[];
}) {
  const previewRows = parsedFile.rows.slice(0, 5);
  const mappedColumns = columns.filter((col) =>
    mapping.some((m) => m.targetColumn === col.key)
  );

  return (
    <div className="space-y-4">
      <p className="text-gray-600">
        Preview of first {previewRows.length} rows. Total: {parsedFile.rows.length} rows.
      </p>

      <div className="overflow-x-auto border rounded-lg">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              {mappedColumns.map((col) => (
                <th key={col.key} className="px-4 py-2 text-left font-medium">
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y">
            {previewRows.map((row, i) => (
              <tr key={i} className="hover:bg-gray-50">
                {mappedColumns.map((col) => {
                  const sourceCol = mapping.find((m) => m.targetColumn === col.key)?.sourceColumn;
                  const value = sourceCol ? row[sourceCol] : '';
                  return (
                    <td key={col.key} className="px-4 py-2 truncate max-w-xs">
                      {String(value ?? '')}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Complete Step Component
function CompleteStep({ result }: { result: { validRows: number; skippedRows: number; errors: { row: number; column: string; message: string }[] } }) {
  return (
    <div className="text-center py-8">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <Check className="w-8 h-8 text-green-600" />
      </div>
      <h3 className="text-xl font-semibold mb-2">Import Complete</h3>
      <p className="text-gray-600 mb-6">
        Successfully imported {result.validRows} rows.
        {result.skippedRows > 0 && (
          <span className="text-yellow-600">
            {' '}{result.skippedRows} rows skipped due to errors.
          </span>
        )}
      </p>

      {result.errors.length > 0 && (
        <div className="text-left bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-h-48 overflow-y-auto">
          <p className="font-medium text-yellow-800 mb-2">Errors:</p>
          <ul className="text-sm text-yellow-700 space-y-1">
            {result.errors.slice(0, 10).map((err, i) => (
              <li key={i}>
                Row {err.row}, {err.column}: {err.message}
              </li>
            ))}
            {result.errors.length > 10 && (
              <li>... and {result.errors.length - 10} more errors</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
```

### Server-Side Import Route

```tsx
// app/api/import/route.ts
import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get('file') as File;
  const mappingStr = formData.get('mapping') as string;
  const columnsStr = formData.get('columns') as string;

  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }

  try {
    const mapping = JSON.parse(mappingStr || '[]');
    const columns = JSON.parse(columnsStr || '[]');

    // Parse file based on type
    let rows: Record<string, unknown>[];
    const ext = file.name.split('.').pop()?.toLowerCase();

    if (ext === 'csv') {
      const text = await file.text();
      const result = Papa.parse(text, { header: true, skipEmptyLines: true });
      rows = result.data as Record<string, unknown>[];
    } else if (ext === 'xlsx' || ext === 'xls') {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'array' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      rows = XLSX.utils.sheet_to_json(sheet);
    } else if (ext === 'json') {
      const text = await file.text();
      const data = JSON.parse(text);
      rows = Array.isArray(data) ? data : [data];
    } else {
      return NextResponse.json({ error: 'Unsupported file format' }, { status: 400 });
    }

    // Apply mapping and validate
    const validData: Record<string, unknown>[] = [];
    const errors: { row: number; message: string }[] = [];

    rows.forEach((row, index) => {
      const mappedRow: Record<string, unknown> = {};
      let isValid = true;

      mapping.forEach(({ sourceColumn, targetColumn }: { sourceColumn: string; targetColumn: string }) => {
        mappedRow[targetColumn] = row[sourceColumn];
      });

      // Basic validation
      columns.forEach((col: { key: string; required?: boolean; label: string }) => {
        if (col.required && !mappedRow[col.key]) {
          errors.push({ row: index + 1, message: `${col.label} is required` });
          isValid = false;
        }
      });

      if (isValid) {
        validData.push(mappedRow);
      }
    });

    return NextResponse.json({
      success: errors.length === 0,
      data: validData,
      errors,
      totalRows: rows.length,
      validRows: validData.length,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Import failed' },
      { status: 500 }
    );
  }
}
```

## Usage

```tsx
// app/import/page.tsx
'use client';

import { useState } from 'react';
import { ImportWizard } from '@/components/import-wizard';
import { ImportColumn } from '@/lib/import/types';

interface User {
  name: string;
  email: string;
  role: string;
  department: string;
}

const columns: ImportColumn[] = [
  { key: 'name', label: 'Full Name', required: true, type: 'string' },
  { key: 'email', label: 'Email', required: true, type: 'email' },
  { key: 'role', label: 'Role', required: false, type: 'string' },
  {
    key: 'department',
    label: 'Department',
    required: false,
    type: 'string',
    transform: (value) => String(value).toUpperCase(),
  },
];

export default function ImportPage() {
  const [importedData, setImportedData] = useState<User[]>([]);
  const [showWizard, setShowWizard] = useState(true);

  const handleComplete = (data: User[]) => {
    setImportedData(data);
    setShowWizard(false);
    console.log('Imported:', data);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Import Users</h1>

        {showWizard ? (
          <ImportWizard<User>
            columns={columns}
            onComplete={handleComplete}
            onCancel={() => setShowWizard(false)}
          />
        ) : (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                Imported {importedData.length} Users
              </h2>
              <button
                onClick={() => setShowWizard(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Import More
              </button>
            </div>

            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  {columns.map((col) => (
                    <th key={col.key} className="border p-2 text-left">
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {importedData.map((user, i) => (
                  <tr key={i}>
                    {columns.map((col) => (
                      <td key={col.key} className="border p-2">
                        {String(user[col.key as keyof User] ?? '')}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
```

## Related Skills

- [[export-data]] - Data export patterns
- [[multipart-upload]] - File upload handling
- [[form-validation]] - Form validation with Zod
- [[data-table]] - Data table component

## Changelog

### 2.0.0 (2025-01-18)
- Standardized to atomic design system v2
- Updated frontmatter schema

### 1.0.0 (2025-01-17)
- Initial implementation
- CSV, Excel, JSON parsing
- Column mapping wizard
- Zod-based validation
- Preview and error reporting
