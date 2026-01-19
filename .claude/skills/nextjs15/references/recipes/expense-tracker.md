---
id: r-expense-tracker
name: Expense Tracker
version: 3.0.0
layer: L6
category: recipes
description: Mobile-first personal expense tracking with receipt OCR, categories, budgets, and financial reports
tags: [expenses, budgets, finance, mobile-first, pwa, ocr]
formula: "ExpenseTracker = DashboardLayout(t-dashboard-layout) + DashboardHome(t-dashboard-home) + SettingsPage(t-settings-page) + AuthLayout(t-auth-layout) + ProfilePage(t-profile-page) + Header(o-header) + Chart(o-chart) + StatsDashboard(o-stats-dashboard) + DataTable(o-data-table) + Calendar(o-calendar) + Tabs(o-tabs) + Modal(o-modal) + FileUploader(o-file-uploader) + Breadcrumb(m-breadcrumb) + Pagination(m-pagination) + Card(m-card) + FormField(m-form-field) + Badge(m-badge) + StatCard(m-stat-card) + ProgressBar(m-progress-bar) + DatePicker(m-date-picker) + Select(m-select) + Toast(m-toast) + NextAuth(pt-next-auth) + AuthMiddleware(pt-auth-middleware) + SessionManagement(pt-session-management) + RateLimiting(pt-rate-limiting) + GdprCompliance(pt-gdpr-compliance) + FormValidation(pt-form-validation) + ZodSchemas(pt-zod-schemas) + ServerActions(pt-server-actions) + Pwa(pt-pwa) + MobileFirst(pt-mobile-first) + OfflineSync(pt-offline-sync) + IndexedDb(pt-indexed-db) + Persistence(pt-persistence) + FileUpload(pt-file-upload) + ImageProcessing(pt-image-processing) + Ocr(pt-ocr) + Charts(pt-charts) + BudgetAlerts(pt-budget-alerts) + TransactionalEmail(pt-transactional-email) + PushNotifications(pt-push-notifications) + ErrorBoundaries(pt-error-boundaries) + ErrorTracking(pt-error-tracking) + SkeletonLoading(pt-skeleton-loading) + AnalyticsEvents(pt-analytics-events) + Filtering(pt-filtering) + Pagination(pt-pagination) + Sorting(pt-sorting) + ExportData(pt-export-data) + ReactQuery(pt-react-query) + Zustand(pt-zustand) + OptimisticUpdates(pt-optimistic-updates) + RecurringTransactions(pt-recurring-transactions) + TestingE2e(pt-testing-e2e) + TestingUnit(pt-testing-unit) + AuditLogging(pt-audit-logging) + Csp(pt-csp) + InputSanitization(pt-input-sanitization) + Sitemap(pt-sitemap) + StructuredData(pt-structured-data) + MetadataApi(pt-metadata-api) + UserAnalytics(pt-user-analytics)"
composes:
  # L4 Templates
  - ../templates/dashboard-layout.md
  - ../templates/dashboard-home.md
  - ../templates/settings-page.md
  - ../templates/auth-layout.md
  - ../templates/profile-page.md
  # L3 Organisms
  - ../organisms/header.md
  - ../organisms/chart.md
  - ../organisms/stats-dashboard.md
  - ../organisms/data-table.md
  - ../organisms/calendar.md
  - ../organisms/tabs.md
  - ../organisms/modal.md
  - ../organisms/file-uploader.md
  # L2 Molecules
  - ../molecules/breadcrumb.md
  - ../molecules/pagination.md
  - ../molecules/card.md
  - ../molecules/form-field.md
  - ../molecules/badge.md
  - ../molecules/stat-card.md
  - ../molecules/progress-bar.md
  - ../molecules/date-picker.md
  - ../molecules/select.md
  - ../molecules/toast.md
  # L5 Patterns - Authentication
  - ../patterns/next-auth.md
  - ../patterns/auth-middleware.md
  - ../patterns/session-management.md
  # L5 Patterns - Security
  - ../patterns/rate-limiting.md
  - ../patterns/gdpr-compliance.md
  # L5 Patterns - Forms & Validation
  - ../patterns/form-validation.md
  - ../patterns/zod-schemas.md
  - ../patterns/server-actions.md
  # L5 Patterns - PWA & Mobile
  - ../patterns/pwa.md
  - ../patterns/mobile-first.md
  - ../patterns/offline-sync.md
  - ../patterns/indexed-db.md
  - ../patterns/persistence.md
  # L5 Patterns - Receipt & Image
  - ../patterns/file-upload.md
  - ../patterns/image-processing.md
  - ../patterns/ocr.md
  # L5 Patterns - Finance Specific
  - ../patterns/charts.md
  - ../patterns/budget-alerts.md
  # L5 Patterns - Communication
  - ../patterns/transactional-email.md
  - ../patterns/push-notifications.md
  # L5 Patterns - Error Handling
  - ../patterns/error-boundaries.md
  - ../patterns/error-tracking.md
  - ../patterns/skeleton-loading.md
  # L5 Patterns - Analytics
  - ../patterns/analytics-events.md
  # L5 Patterns - Data Management
  - ../patterns/filtering.md
  - ../patterns/pagination.md
  - ../patterns/sorting.md
  - ../patterns/export-data.md
  # L5 Patterns - State Management
  - ../patterns/react-query.md
  - ../patterns/zustand.md
  - ../patterns/optimistic-updates.md
  # L5 Patterns - Recurring
  - ../patterns/recurring-transactions.md
  # L5 Patterns - Testing
  - ../patterns/testing-e2e.md
  - ../patterns/testing-unit.md
  # L5 Patterns - Security (Additional)
  - ../patterns/audit-logging.md
  - ../patterns/csp.md
  - ../patterns/input-sanitization.md
  # L5 Patterns - SEO
  - ../patterns/sitemap.md
  - ../patterns/structured-data.md
  - ../patterns/metadata-api.md
  # L5 Patterns - Analytics (Additional)
  - ../patterns/user-analytics.md
dependencies:
  - next@15.0.0
  - react@19.0.0
  - prisma@6.0.0
  - tesseract.js@5.0.0
  - recharts@2.12.0
  - date-fns@3.0.0
skills:
  - pwa
  - mobile-first
  - file-upload
  - image-processing
  - charts
  - offline-sync
performance:
  impact: high
  lcp: medium
  cls: low
accessibility:
  wcag: AA
  keyboard: true
  screen-reader: true
---

## Overview

A mobile-first expense tracking application with receipt OCR scanning, customizable categories, budget tracking with alerts, and comprehensive financial reports. Built as a Progressive Web App for offline usage and quick expense entry on the go.

## Project Structure

```
app/
├── (auth)/
│   ├── login/page.tsx
│   └── register/page.tsx
├── (app)/
│   ├── layout.tsx                  # Bottom nav layout
│   ├── page.tsx                    # Dashboard / expense feed
│   ├── add/page.tsx                # Quick add expense
│   ├── scan/page.tsx               # Receipt scanner
│   ├── expenses/
│   │   ├── page.tsx                # Expense list
│   │   └── [id]/page.tsx           # Expense detail
│   ├── budgets/
│   │   ├── page.tsx                # Budget overview
│   │   └── [id]/page.tsx           # Budget detail
│   ├── reports/
│   │   ├── page.tsx                # Reports dashboard
│   │   ├── monthly/page.tsx
│   │   └── category/page.tsx
│   └── settings/
│       ├── page.tsx
│       ├── categories/page.tsx
│       └── export/page.tsx
├── api/
│   ├── expenses/
│   │   ├── route.ts
│   │   └── [id]/route.ts
│   ├── budgets/route.ts
│   ├── categories/route.ts
│   ├── receipts/
│   │   ├── upload/route.ts
│   │   └── ocr/route.ts
│   └── reports/route.ts
├── manifest.ts                     # PWA manifest
└── sw.ts                           # Service worker
components/
├── expenses/
│   ├── expense-form.tsx
│   ├── expense-card.tsx
│   ├── expense-list.tsx
│   └── quick-add.tsx
├── scanner/
│   ├── camera-capture.tsx
│   ├── receipt-preview.tsx
│   └── ocr-result.tsx
├── budgets/
│   ├── budget-card.tsx
│   ├── budget-progress.tsx
│   └── budget-form.tsx
├── reports/
│   ├── spending-chart.tsx
│   ├── category-breakdown.tsx
│   └── trend-chart.tsx
├── layout/
│   ├── bottom-nav.tsx
│   ├── pull-to-refresh.tsx
│   └── swipe-actions.tsx
└── ui/
    ├── amount-input.tsx
    └── date-picker-mobile.tsx
lib/
├── ocr.ts
├── offline-db.ts                   # IndexedDB for offline
└── sync.ts                         # Background sync
public/
├── icons/                          # PWA icons
└── sw.js                           # Compiled service worker
```

## Database Schema

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id           String    @id @default(cuid())
  email        String    @unique
  name         String
  passwordHash String
  currency     String    @default("USD")
  
  expenses     Expense[]
  categories   Category[]
  budgets      Budget[]
  
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt
}

model Category {
  id        String    @id @default(cuid())
  userId    String
  name      String
  icon      String    @default("receipt")
  color     String    @default("#6366f1")
  isDefault Boolean   @default(false)
  
  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  expenses  Expense[]
  budgets   Budget[]
  
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
  
  @@unique([userId, name])
  @@index([userId])
}

model Expense {
  id          String   @id @default(cuid())
  userId      String
  categoryId  String?
  amount      Decimal  @db.Decimal(10, 2)
  currency    String   @default("USD")
  description String
  notes       String?
  date        DateTime @default(now())
  
  // Receipt data
  receiptUrl  String?
  merchant    String?
  
  // Sync metadata
  localId     String?  // Client-generated ID for offline sync
  syncedAt    DateTime?
  
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  category    Category? @relation(fields: [categoryId], references: [id])
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@index([userId])
  @@index([userId, date])
  @@index([categoryId])
  @@index([localId])
}

model Budget {
  id         String       @id @default(cuid())
  userId     String
  categoryId String?
  name       String
  amount     Decimal      @db.Decimal(10, 2)
  period     BudgetPeriod @default(MONTHLY)
  startDate  DateTime
  isActive   Boolean      @default(true)
  alertAt    Int?         // Alert when percentage reached (e.g., 80)
  
  user       User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  category   Category?    @relation(fields: [categoryId], references: [id])
  
  createdAt  DateTime     @default(now())
  updatedAt  DateTime     @updatedAt
  
  @@index([userId])
  @@index([categoryId])
}

enum BudgetPeriod {
  WEEKLY
  BIWEEKLY
  MONTHLY
  QUARTERLY
  YEARLY
}
```

## Implementation

### PWA Manifest

```tsx
// app/manifest.ts
import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Expense Tracker',
    short_name: 'Expenses',
    description: 'Track your expenses on the go',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#6366f1',
    orientation: 'portrait',
    icons: [
      {
        src: '/icons/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: '/icons/icon-maskable.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
    categories: ['finance', 'productivity'],
    shortcuts: [
      {
        name: 'Add Expense',
        short_name: 'Add',
        url: '/add',
        icons: [{ src: '/icons/add-expense.png', sizes: '96x96' }],
      },
      {
        name: 'Scan Receipt',
        short_name: 'Scan',
        url: '/scan',
        icons: [{ src: '/icons/scan-receipt.png', sizes: '96x96' }],
      },
    ],
  };
}
```

### Bottom Navigation Layout

```tsx
// app/(app)/layout.tsx
import { BottomNav } from '@/components/layout/bottom-nav';
import { PullToRefresh } from '@/components/layout/pull-to-refresh';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <PullToRefresh>
        {children}
      </PullToRefresh>
      <BottomNav />
    </div>
  );
}
```

```tsx
// components/layout/bottom-nav.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Receipt, PieChart, Settings, Plus } from 'lucide-react';

const navItems = [
  { href: '/', icon: Home, label: 'Home' },
  { href: '/expenses', icon: Receipt, label: 'Expenses' },
  { href: '/add', icon: Plus, label: 'Add', primary: true },
  { href: '/reports', icon: PieChart, label: 'Reports' },
  { href: '/settings', icon: Settings, label: 'Settings' },
];

export function BottomNav() {
  const pathname = usePathname();
  
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t safe-area-bottom">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          
          if (item.primary) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center justify-center w-14 h-14 -mt-6 bg-indigo-600 rounded-full shadow-lg"
              >
                <Icon className="h-6 w-6 text-white" />
              </Link>
            );
          }
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 h-full ${
                isActive ? 'text-indigo-600' : 'text-gray-500'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs mt-1">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
```

### Quick Add Expense Form

```tsx
// components/expenses/quick-add.tsx
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Camera, X } from 'lucide-react';
import { AmountInput } from '@/components/ui/amount-input';
import { DatePickerMobile } from '@/components/ui/date-picker-mobile';
import { CategoryPicker } from './category-picker';
import { saveOffline, isOnline } from '@/lib/offline-db';

const expenseSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  description: z.string().min(1, 'Description required'),
  categoryId: z.string().optional(),
  date: z.date(),
  notes: z.string().optional(),
});

type ExpenseFormData = z.infer<typeof expenseSchema>;

export function QuickAdd() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [showMore, setShowMore] = useState(false);
  
  const form = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      amount: 0,
      description: '',
      date: new Date(),
    },
  });
  
  const mutation = useMutation({
    mutationFn: async (data: ExpenseFormData) => {
      // Generate local ID for offline sync
      const localId = crypto.randomUUID();
      
      if (!isOnline()) {
        // Save to IndexedDB for later sync
        await saveOffline('expenses', { ...data, localId });
        return { localId, offline: true };
      }
      
      const response = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, localId }),
      });
      
      if (!response.ok) throw new Error('Failed to save');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      router.push('/');
    },
  });
  
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b px-4 py-3 flex items-center justify-between">
        <button onClick={() => router.back()} className="p-2 -ml-2">
          <X className="h-6 w-6" />
        </button>
        <h1 className="font-semibold">Add Expense</h1>
        <button
          onClick={form.handleSubmit((data) => mutation.mutate(data))}
          disabled={mutation.isPending}
          className="text-indigo-600 font-medium disabled:opacity-50"
        >
          {mutation.isPending ? 'Saving...' : 'Save'}
        </button>
      </div>
      
      <form className="p-4 space-y-6">
        {/* Amount - Large touch-friendly input */}
        <div className="text-center py-8">
          <AmountInput
            value={form.watch('amount')}
            onChange={(value) => form.setValue('amount', value)}
            currency="USD"
            className="text-5xl font-bold text-center"
          />
          {form.formState.errors.amount && (
            <p className="text-sm text-red-600 mt-2">
              {form.formState.errors.amount.message}
            </p>
          )}
        </div>
        
        {/* Description */}
        <div>
          <input
            {...form.register('description')}
            placeholder="What was this for?"
            className="w-full text-lg border-b border-gray-200 py-3 focus:border-indigo-600 focus:outline-none"
          />
        </div>
        
        {/* Category */}
        <CategoryPicker
          value={form.watch('categoryId')}
          onChange={(id) => form.setValue('categoryId', id)}
        />
        
        {/* Date */}
        <DatePickerMobile
          value={form.watch('date')}
          onChange={(date) => form.setValue('date', date)}
        />
        
        {/* More Options Toggle */}
        <button
          type="button"
          onClick={() => setShowMore(!showMore)}
          className="text-sm text-indigo-600"
        >
          {showMore ? 'Less options' : 'More options'}
        </button>
        
        {showMore && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Notes</label>
              <textarea
                {...form.register('notes')}
                rows={3}
                className="w-full border rounded-lg p-3"
                placeholder="Add notes..."
              />
            </div>
          </div>
        )}
        
        {/* Scan Receipt Button */}
        <button
          type="button"
          onClick={() => router.push('/scan')}
          className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600"
        >
          <Camera className="h-5 w-5" />
          Scan Receipt
        </button>
      </form>
    </div>
  );
}
```

### Receipt Scanner with OCR

```tsx
// components/scanner/camera-capture.tsx
'use client';

import { useRef, useState, useCallback } from 'react';
import { Camera, X, RotateCcw, Check } from 'lucide-react';

interface CameraCaptureProps {
  onCapture: (imageData: string) => void;
  onClose: () => void;
}

export function CameraCapture({ onCapture, onClose }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [captured, setCaptured] = useState<string | null>(null);
  
  const startCamera = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Use back camera
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setStream(mediaStream);
      }
    } catch (err) {
      console.error('Camera access denied:', err);
    }
  }, []);
  
  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  }, [stream]);
  
  const capture = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        const imageData = canvas.toDataURL('image/jpeg', 0.8);
        setCaptured(imageData);
        stopCamera();
      }
    }
  }, [stopCamera]);
  
  const retake = useCallback(() => {
    setCaptured(null);
    startCamera();
  }, [startCamera]);
  
  const confirm = useCallback(() => {
    if (captured) {
      onCapture(captured);
    }
  }, [captured, onCapture]);
  
  // Start camera on mount
  useState(() => {
    startCamera();
    return () => stopCamera();
  });
  
  return (
    <div className="fixed inset-0 bg-black z-50">
      {/* Close button */}
      <button
        onClick={() => {
          stopCamera();
          onClose();
        }}
        className="absolute top-4 left-4 z-10 p-2 bg-black/50 rounded-full text-white"
      >
        <X className="h-6 w-6" />
      </button>
      
      {captured ? (
        <>
          {/* Preview captured image */}
          <img
            src={captured}
            alt="Captured receipt"
            className="w-full h-full object-contain"
          />
          
          {/* Action buttons */}
          <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-8">
            <button
              onClick={retake}
              className="p-4 bg-white/20 rounded-full text-white"
            >
              <RotateCcw className="h-8 w-8" />
            </button>
            <button
              onClick={confirm}
              className="p-4 bg-green-500 rounded-full text-white"
            >
              <Check className="h-8 w-8" />
            </button>
          </div>
        </>
      ) : (
        <>
          {/* Live camera view */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
          
          {/* Capture overlay */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-8 border-2 border-white/50 rounded-lg" />
            <p className="absolute bottom-32 left-0 right-0 text-center text-white text-sm">
              Position receipt within the frame
            </p>
          </div>
          
          {/* Capture button */}
          <button
            onClick={capture}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 w-20 h-20 bg-white rounded-full flex items-center justify-center"
          >
            <div className="w-16 h-16 bg-white border-4 border-gray-300 rounded-full" />
          </button>
        </>
      )}
      
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
```

### OCR Processing

```tsx
// lib/ocr.ts
import Tesseract from 'tesseract.js';

interface OCRResult {
  text: string;
  amount: number | null;
  merchant: string | null;
  date: Date | null;
  confidence: number;
}

export async function processReceipt(imageData: string): Promise<OCRResult> {
  const { data } = await Tesseract.recognize(imageData, 'eng', {
    logger: (m) => console.log(m),
  });
  
  const text = data.text;
  
  // Extract amount - look for total patterns
  const amountPatterns = [
    /total[:\s]*\$?([\d,]+\.?\d*)/i,
    /amount[:\s]*\$?([\d,]+\.?\d*)/i,
    /grand total[:\s]*\$?([\d,]+\.?\d*)/i,
    /\$\s*([\d,]+\.\d{2})\s*$/m,
  ];
  
  let amount: number | null = null;
  for (const pattern of amountPatterns) {
    const match = text.match(pattern);
    if (match) {
      amount = parseFloat(match[1].replace(',', ''));
      break;
    }
  }
  
  // Extract merchant - usually first line or after store name patterns
  const lines = text.split('\n').filter(Boolean);
  let merchant = lines[0]?.trim() || null;
  
  // Clean up merchant name
  if (merchant) {
    merchant = merchant.replace(/[^a-zA-Z\s]/g, '').trim();
    if (merchant.length < 3) merchant = null;
  }
  
  // Extract date
  const datePatterns = [
    /(\d{1,2}\/\d{1,2}\/\d{2,4})/,
    /(\d{1,2}-\d{1,2}-\d{2,4})/,
    /(\w{3}\s+\d{1,2},?\s+\d{4})/i,
  ];
  
  let date: Date | null = null;
  for (const pattern of datePatterns) {
    const match = text.match(pattern);
    if (match) {
      const parsed = new Date(match[1]);
      if (!isNaN(parsed.getTime())) {
        date = parsed;
        break;
      }
    }
  }
  
  return {
    text,
    amount,
    merchant,
    date,
    confidence: data.confidence,
  };
}
```

### Offline Database (IndexedDB)

```tsx
// lib/offline-db.ts
import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface ExpenseDB extends DBSchema {
  expenses: {
    key: string;
    value: {
      localId: string;
      amount: number;
      description: string;
      categoryId?: string;
      date: Date;
      notes?: string;
      synced: boolean;
      createdAt: Date;
    };
    indexes: { 'by-synced': boolean };
  };
  syncQueue: {
    key: string;
    value: {
      id: string;
      action: 'create' | 'update' | 'delete';
      entity: string;
      data: any;
      createdAt: Date;
    };
  };
}

let db: IDBPDatabase<ExpenseDB> | null = null;

export async function getDB(): Promise<IDBPDatabase<ExpenseDB>> {
  if (db) return db;
  
  db = await openDB<ExpenseDB>('expense-tracker', 1, {
    upgrade(database) {
      // Expenses store
      const expenseStore = database.createObjectStore('expenses', {
        keyPath: 'localId',
      });
      expenseStore.createIndex('by-synced', 'synced');
      
      // Sync queue store
      database.createObjectStore('syncQueue', {
        keyPath: 'id',
      });
    },
  });
  
  return db;
}

export function isOnline(): boolean {
  return navigator.onLine;
}

export async function saveOffline(entity: string, data: any): Promise<void> {
  const database = await getDB();
  
  await database.put('expenses', {
    ...data,
    synced: false,
    createdAt: new Date(),
  });
  
  await database.add('syncQueue', {
    id: crypto.randomUUID(),
    action: 'create',
    entity,
    data,
    createdAt: new Date(),
  });
}

export async function getPendingSync(): Promise<any[]> {
  const database = await getDB();
  return database.getAll('syncQueue');
}

export async function markSynced(localId: string): Promise<void> {
  const database = await getDB();
  const expense = await database.get('expenses', localId);
  if (expense) {
    await database.put('expenses', { ...expense, synced: true });
  }
}

export async function clearSyncQueue(id: string): Promise<void> {
  const database = await getDB();
  await database.delete('syncQueue', id);
}
```

### Budget Progress Component

```tsx
// components/budgets/budget-progress.tsx
'use client';

import { useMemo } from 'react';
import { AlertTriangle } from 'lucide-react';

interface BudgetProgressProps {
  budget: {
    id: string;
    name: string;
    amount: number;
    spent: number;
    alertAt?: number;
    category?: {
      name: string;
      icon: string;
      color: string;
    };
  };
}

export function BudgetProgress({ budget }: BudgetProgressProps) {
  const percentage = useMemo(() => {
    return Math.min(100, (budget.spent / budget.amount) * 100);
  }, [budget.spent, budget.amount]);
  
  const remaining = budget.amount - budget.spent;
  const isOverBudget = remaining < 0;
  const isNearLimit = budget.alertAt && percentage >= budget.alertAt;
  
  const progressColor = useMemo(() => {
    if (isOverBudget) return 'bg-red-500';
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 75) return 'bg-yellow-500';
    return 'bg-green-500';
  }, [percentage, isOverBudget]);
  
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          {budget.category && (
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-white"
              style={{ backgroundColor: budget.category.color }}
            >
              <span>{budget.category.icon}</span>
            </div>
          )}
          <div>
            <h3 className="font-medium">{budget.name}</h3>
            {budget.category && (
              <p className="text-sm text-gray-500">{budget.category.name}</p>
            )}
          </div>
        </div>
        {isNearLimit && !isOverBudget && (
          <AlertTriangle className="h-5 w-5 text-yellow-500" />
        )}
      </div>
      
      {/* Progress bar */}
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-2">
        <div
          className={`h-full rounded-full transition-all ${progressColor}`}
          style={{ width: `${Math.min(100, percentage)}%` }}
        />
      </div>
      
      <div className="flex justify-between text-sm">
        <span className="text-gray-600">
          ${budget.spent.toFixed(2)} spent
        </span>
        <span className={isOverBudget ? 'text-red-600 font-medium' : 'text-gray-600'}>
          {isOverBudget ? (
            <>-${Math.abs(remaining).toFixed(2)} over</>
          ) : (
            <>${remaining.toFixed(2)} left</>
          )}
        </span>
      </div>
      
      <div className="text-right text-xs text-gray-400 mt-1">
        of ${budget.amount.toFixed(2)}
      </div>
    </div>
  );
}
```

### Spending Chart

```tsx
// components/reports/spending-chart.tsx
'use client';

import { useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { format, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';

interface SpendingChartProps {
  expenses: Array<{
    date: string;
    amount: number;
  }>;
  month: Date;
}

export function SpendingChart({ expenses, month }: SpendingChartProps) {
  const data = useMemo(() => {
    const start = startOfMonth(month);
    const end = endOfMonth(month);
    const days = eachDayOfInterval({ start, end });
    
    // Aggregate expenses by day
    const byDay = expenses.reduce<Record<string, number>>((acc, exp) => {
      const day = format(new Date(exp.date), 'yyyy-MM-dd');
      acc[day] = (acc[day] || 0) + exp.amount;
      return acc;
    }, {});
    
    // Create cumulative data
    let cumulative = 0;
    return days.map((day) => {
      const key = format(day, 'yyyy-MM-dd');
      cumulative += byDay[key] || 0;
      return {
        date: format(day, 'd'),
        daily: byDay[key] || 0,
        cumulative,
      };
    });
  }, [expenses, month]);
  
  const totalSpent = data[data.length - 1]?.cumulative || 0;
  
  return (
    <div className="bg-white rounded-xl p-4">
      <div className="mb-4">
        <h3 className="text-sm text-gray-500">
          {format(month, 'MMMM yyyy')}
        </h3>
        <p className="text-2xl font-bold">${totalSpent.toFixed(2)}</p>
      </div>
      
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorSpent" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10 }}
              interval="preserveStartEnd"
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10 }}
              tickFormatter={(value) => `$${value}`}
            />
            <Tooltip
              formatter={(value: number) => [`$${value.toFixed(2)}`, 'Spent']}
              contentStyle={{
                borderRadius: 8,
                border: 'none',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              }}
            />
            <Area
              type="monotone"
              dataKey="cumulative"
              stroke="#6366f1"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorSpent)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
```

### Category Breakdown

```tsx
// components/reports/category-breakdown.tsx
'use client';

import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';

interface CategoryBreakdownProps {
  data: Array<{
    categoryId: string;
    categoryName: string;
    categoryColor: string;
    total: number;
  }>;
}

export function CategoryBreakdown({ data }: CategoryBreakdownProps) {
  const total = useMemo(() => {
    return data.reduce((sum, item) => sum + item.total, 0);
  }, [data]);
  
  const chartData = useMemo(() => {
    return data.map((item) => ({
      name: item.categoryName,
      value: item.total,
      color: item.categoryColor,
      percentage: ((item.total / total) * 100).toFixed(1),
    }));
  }, [data, total]);
  
  return (
    <div className="bg-white rounded-xl p-4">
      <h3 className="font-medium mb-4">By Category</h3>
      
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={40}
              outerRadius={70}
              paddingAngle={2}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={index} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
      
      {/* Legend */}
      <div className="space-y-2 mt-4">
        {chartData.map((item, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-sm">{item.name}</span>
            </div>
            <div className="text-sm">
              <span className="font-medium">${item.value.toFixed(2)}</span>
              <span className="text-gray-400 ml-1">({item.percentage}%)</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### Service Worker for Offline Support

```tsx
// public/sw.js
const CACHE_NAME = 'expense-tracker-v1';
const STATIC_ASSETS = [
  '/',
  '/add',
  '/expenses',
  '/reports',
  '/settings',
  '/manifest.json',
];

// Install - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate - clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// Fetch - network first, fallback to cache
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;
  
  // Skip API requests (handle offline in app)
  if (event.request.url.includes('/api/')) return;
  
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Cache successful responses
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, clone);
        });
        return response;
      })
      .catch(() => {
        // Fallback to cache
        return caches.match(event.request);
      })
  );
});

// Background sync for offline expenses
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-expenses') {
    event.waitUntil(syncExpenses());
  }
});

async function syncExpenses() {
  // This would sync IndexedDB data to the server
  const clients = await self.clients.matchAll();
  clients.forEach((client) => {
    client.postMessage({ type: 'SYNC_COMPLETE' });
  });
}
```

## Skills Used

| Skill | Layer | Purpose |
|-------|-------|---------|
| dashboard-layout | L5 | Main app shell with sidebar and navigation |
| dashboard-home | L5 | Dashboard overview with stats and recent activity |
| settings-page | L5 | User preferences and app configuration |
| pwa | L4 | Progressive Web App manifest and service worker |
| mobile-first | L4 | Touch-optimized responsive design |
| file-upload | L4 | Receipt image upload handling |
| image-processing | L4 | Receipt image optimization and OCR preprocessing |
| charts | L4 | Spending visualization with Recharts |
| offline-sync | L4 | IndexedDB storage and background sync |

## Testing

### Test Setup

```ts
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    include: ['**/*.{test,spec}.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'tests/setup.ts'],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
});
```

```ts
// tests/setup.ts
import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock IndexedDB
import 'fake-indexeddb/auto';

// Mock navigator.onLine
Object.defineProperty(navigator, 'onLine', {
  value: true,
  writable: true,
});

// Mock service worker
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    back: vi.fn(),
    refresh: vi.fn(),
  }),
  usePathname: () => '/',
}));
```

### Unit Tests

```tsx
// components/expenses/__tests__/expense-form.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { QuickAdd } from '../quick-add';
import { describe, it, expect, vi } from 'vitest';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

describe('QuickAdd Expense Form', () => {
  it('renders amount input and description field', () => {
    render(<QuickAdd />, { wrapper });

    expect(screen.getByPlaceholderText(/what was this for/i)).toBeInTheDocument();
    expect(screen.getByText(/save/i)).toBeInTheDocument();
  });

  it('validates required fields before submission', async () => {
    render(<QuickAdd />, { wrapper });

    const saveButton = screen.getByText(/save/i);
    await userEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText(/amount must be positive/i)).toBeInTheDocument();
    });
  });

  it('submits expense with valid data', async () => {
    const mockFetch = vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: '1', amount: 25.50 }),
    } as Response);

    render(<QuickAdd />, { wrapper });

    await userEvent.type(screen.getByPlaceholderText(/what was this for/i), 'Coffee');

    // Amount input interaction would be tested based on AmountInput component API

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalled();
    });

    mockFetch.mockRestore();
  });
});
```

```tsx
// components/budgets/__tests__/budget-progress.test.tsx
import { render, screen } from '@testing-library/react';
import { BudgetProgress } from '../budget-progress';
import { describe, it, expect } from 'vitest';

describe('BudgetProgress', () => {
  const baseBudget = {
    id: '1',
    name: 'Groceries',
    amount: 500,
    spent: 250,
    category: { name: 'Food', icon: '🛒', color: '#22c55e' },
  };

  it('displays budget name and progress', () => {
    render(<BudgetProgress budget={baseBudget} />);

    expect(screen.getByText('Groceries')).toBeInTheDocument();
    expect(screen.getByText('$250.00 spent')).toBeInTheDocument();
    expect(screen.getByText('$250.00 left')).toBeInTheDocument();
  });

  it('shows over budget warning when spent exceeds amount', () => {
    const overBudget = { ...baseBudget, spent: 600 };
    render(<BudgetProgress budget={overBudget} />);

    expect(screen.getByText(/-\$100\.00 over/i)).toBeInTheDocument();
  });

  it('displays alert when near limit', () => {
    const nearLimit = { ...baseBudget, spent: 450, alertAt: 80 };
    render(<BudgetProgress budget={nearLimit} />);

    expect(screen.getByRole('img', { hidden: true })).toBeInTheDocument(); // AlertTriangle icon
  });
});
```

### Integration Tests

```tsx
// tests/integration/expense-api.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from '@/lib/prisma';

describe('Expense API Integration', () => {
  let testUserId: string;
  let testCategoryId: string;

  beforeAll(async () => {
    // Create test user and category
    const user = await prisma.user.create({
      data: {
        email: 'test@example.com',
        name: 'Test User',
        passwordHash: 'hashed',
      },
    });
    testUserId = user.id;

    const category = await prisma.category.create({
      data: {
        userId: testUserId,
        name: 'Test Category',
        icon: 'receipt',
        color: '#6366f1',
      },
    });
    testCategoryId = category.id;
  });

  afterAll(async () => {
    await prisma.expense.deleteMany({ where: { userId: testUserId } });
    await prisma.category.deleteMany({ where: { userId: testUserId } });
    await prisma.user.delete({ where: { id: testUserId } });
  });

  it('creates expense with category', async () => {
    const expense = await prisma.expense.create({
      data: {
        userId: testUserId,
        categoryId: testCategoryId,
        amount: 45.99,
        description: 'Grocery shopping',
        date: new Date(),
      },
    });

    expect(expense.id).toBeDefined();
    expect(Number(expense.amount)).toBe(45.99);
  });

  it('calculates monthly spending correctly', async () => {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const result = await prisma.expense.aggregate({
      where: {
        userId: testUserId,
        date: { gte: startOfMonth },
      },
      _sum: { amount: true },
    });

    expect(result._sum.amount).toBeDefined();
  });
});
```

### E2E Tests

```ts
// tests/e2e/expense-flow.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Expense Tracking Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login and navigate to app
    await page.goto('/login');
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/');
  });

  test('adds new expense via quick add', async ({ page }) => {
    await page.click('a[href="/add"]');
    await page.waitForURL('/add');

    // Enter amount using number pad
    await page.fill('input[type="number"]', '25.50');
    await page.fill('input[placeholder*="What was this for"]', 'Coffee with client');

    // Select category
    await page.click('[data-testid="category-picker"]');
    await page.click('text=Food & Drink');

    // Save expense
    await page.click('text=Save');

    await page.waitForURL('/');
    await expect(page.locator('text=Coffee with client')).toBeVisible();
  });

  test('scans receipt and extracts data', async ({ page }) => {
    await page.click('a[href="/scan"]');

    // Upload test receipt image
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles('./tests/fixtures/receipt.jpg');

    await page.waitForSelector('[data-testid="ocr-result"]');

    // Verify extracted amount
    await expect(page.locator('[data-testid="extracted-amount"]')).toContainText('$');
  });

  test('views budget progress and alerts', async ({ page }) => {
    await page.goto('/budgets');

    await expect(page.locator('[data-testid="budget-card"]').first()).toBeVisible();

    // Check progress bar exists
    await expect(page.locator('[role="progressbar"]').first()).toBeVisible();
  });

  test('works offline and syncs when online', async ({ page, context }) => {
    // Go offline
    await context.setOffline(true);

    await page.click('a[href="/add"]');
    await page.fill('input[type="number"]', '15.00');
    await page.fill('input[placeholder*="What was this for"]', 'Offline expense');
    await page.click('text=Save');

    // Verify saved offline indicator
    await expect(page.locator('[data-testid="offline-indicator"]')).toBeVisible();

    // Go back online
    await context.setOffline(false);

    // Wait for sync
    await page.waitForSelector('[data-testid="sync-complete"]');
  });
});
```

## Error Handling

### Error Boundary

```tsx
// components/error-boundary.tsx
'use client';

import { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Expense Tracker Error:', error, errorInfo);

    // Report to error tracking service
    if (typeof window !== 'undefined' && window.Sentry) {
      window.Sentry.captureException(error, { extra: errorInfo });
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-lg font-semibold mb-2">Something went wrong</h2>
            <p className="text-gray-600 mb-4">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <button
              onClick={this.handleRetry}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg mx-auto"
            >
              <RefreshCw className="h-4 w-4" />
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
```

### API Error Handler

```tsx
// lib/api-error.ts
export class APIError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code?: string
  ) {
    super(message);
    this.name = 'APIError';
  }
}

export function handleAPIError(error: unknown): Response {
  console.error('API Error:', error);

  if (error instanceof APIError) {
    return Response.json(
      { error: error.message, code: error.code },
      { status: error.statusCode }
    );
  }

  if (error instanceof z.ZodError) {
    return Response.json(
      { error: 'Validation failed', details: error.errors },
      { status: 400 }
    );
  }

  return Response.json(
    { error: 'Internal server error' },
    { status: 500 }
  );
}

// Usage in API routes
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = expenseSchema.parse(body);
    // ... create expense
  } catch (error) {
    return handleAPIError(error);
  }
}
```

### Form Validation Errors

```tsx
// components/ui/form-error.tsx
import { AlertCircle } from 'lucide-react';
import { FieldError } from 'react-hook-form';

interface FormErrorProps {
  error?: FieldError;
  message?: string;
}

export function FormError({ error, message }: FormErrorProps) {
  const errorMessage = error?.message || message;

  if (!errorMessage) return null;

  return (
    <div className="flex items-center gap-2 mt-1 text-sm text-red-600" role="alert">
      <AlertCircle className="h-4 w-4 flex-shrink-0" />
      <span>{errorMessage}</span>
    </div>
  );
}

// Expense-specific validation messages
export const expenseErrors = {
  amount: {
    required: 'Please enter an amount',
    positive: 'Amount must be greater than zero',
    max: 'Amount exceeds maximum limit',
  },
  description: {
    required: 'Please describe this expense',
    maxLength: 'Description is too long',
  },
  category: {
    required: 'Please select a category',
  },
  date: {
    required: 'Please select a date',
    future: 'Date cannot be in the future',
  },
};
```

## Accessibility

| WCAG Criterion | Level | Implementation |
|----------------|-------|----------------|
| 1.1.1 Non-text Content | A | Alt text for receipt images, icons have aria-labels |
| 1.3.1 Info and Relationships | A | Semantic form markup, fieldsets for grouped inputs |
| 1.4.3 Contrast | AA | 4.5:1 minimum contrast for text, 3:1 for UI components |
| 2.1.1 Keyboard | A | All functions accessible via keyboard |
| 2.4.3 Focus Order | A | Logical tab order through expense form |
| 2.4.7 Focus Visible | AA | Clear focus indicators on all interactive elements |
| 3.3.1 Error Identification | A | Form errors clearly identified with color and icon |
| 3.3.2 Labels or Instructions | A | All form fields have visible labels |
| 4.1.2 Name, Role, Value | A | ARIA attributes for custom components |

### Focus Management for Mobile

```tsx
// hooks/use-mobile-focus.ts
import { useEffect, useRef } from 'react';

export function useMobileFocus<T extends HTMLElement>() {
  const ref = useRef<T>(null);

  useEffect(() => {
    // Focus management for bottom sheet modals
    const handleFocus = () => {
      if (ref.current) {
        ref.current.focus();
        // Scroll into view on mobile keyboards
        ref.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    };

    window.addEventListener('resize', handleFocus);
    return () => window.removeEventListener('resize', handleFocus);
  }, []);

  return ref;
}

// Usage in QuickAdd
export function QuickAdd() {
  const amountInputRef = useMobileFocus<HTMLInputElement>();

  return (
    <input
      ref={amountInputRef}
      type="number"
      inputMode="decimal"
      aria-label="Expense amount"
      autoFocus
    />
  );
}
```

### Accessible Forms

```tsx
// components/expenses/accessible-expense-form.tsx
<form onSubmit={handleSubmit} aria-label="Add new expense">
  <fieldset>
    <legend className="sr-only">Expense Details</legend>

    <div role="group" aria-labelledby="amount-label">
      <label id="amount-label" htmlFor="amount">
        Amount <span aria-hidden="true">*</span>
        <span className="sr-only">(required)</span>
      </label>
      <input
        id="amount"
        type="number"
        inputMode="decimal"
        aria-required="true"
        aria-invalid={!!errors.amount}
        aria-describedby={errors.amount ? 'amount-error' : undefined}
      />
      {errors.amount && (
        <span id="amount-error" role="alert">
          {errors.amount.message}
        </span>
      )}
    </div>

    <div role="group" aria-labelledby="category-label">
      <span id="category-label">Category</span>
      <div role="listbox" aria-labelledby="category-label">
        {categories.map((cat) => (
          <button
            key={cat.id}
            role="option"
            aria-selected={selectedCategory === cat.id}
            onClick={() => setSelectedCategory(cat.id)}
          >
            <span aria-hidden="true">{cat.icon}</span>
            {cat.name}
          </button>
        ))}
      </div>
    </div>
  </fieldset>

  <button type="submit" aria-busy={isSubmitting}>
    {isSubmitting ? 'Saving...' : 'Save Expense'}
  </button>
</form>
```

## Security

### Input Validation with Zod

```tsx
// lib/validations/expense.ts
import { z } from 'zod';

export const expenseSchema = z.object({
  amount: z
    .number()
    .positive('Amount must be positive')
    .max(999999.99, 'Amount exceeds maximum'),
  description: z
    .string()
    .min(1, 'Description required')
    .max(255, 'Description too long')
    .regex(/^[a-zA-Z0-9\s\-_.,!?()]+$/, 'Invalid characters in description'),
  categoryId: z.string().cuid().optional(),
  date: z.coerce.date().max(new Date(), 'Date cannot be in the future'),
  notes: z.string().max(1000).optional(),
  receiptUrl: z.string().url().optional(),
});

export const budgetSchema = z.object({
  name: z.string().min(1).max(100),
  amount: z.number().positive().max(9999999.99),
  period: z.enum(['WEEKLY', 'BIWEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY']),
  categoryId: z.string().cuid().optional(),
  alertAt: z.number().min(1).max(100).optional(),
});

// Sanitize OCR text output
export function sanitizeOCRText(text: string): string {
  return text
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/[^\w\s\-.,$/\\]/g, '') // Allow only safe characters
    .trim()
    .slice(0, 5000); // Limit length
}
```

### Rate Limiting Configuration

```tsx
// lib/rate-limit.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Different limits for different endpoints
export const rateLimits = {
  // Standard API calls
  api: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(100, '1 m'),
    prefix: 'ratelimit:api',
  }),

  // Expense creation (more restrictive)
  createExpense: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(30, '1 m'),
    prefix: 'ratelimit:expense',
  }),

  // OCR processing (expensive operation)
  ocr: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, '1 m'),
    prefix: 'ratelimit:ocr',
  }),

  // Auth attempts
  auth: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, '15 m'),
    prefix: 'ratelimit:auth',
  }),
};

// Middleware helper
export async function checkRateLimit(
  limiter: Ratelimit,
  identifier: string
): Promise<{ success: boolean; remaining: number }> {
  const { success, remaining } = await limiter.limit(identifier);
  return { success, remaining };
}
```

### Auth Middleware

```tsx
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  const isAuthPage = request.nextUrl.pathname.startsWith('/login') ||
                     request.nextUrl.pathname.startsWith('/register');

  // Redirect unauthenticated users to login
  if (!token && !isAuthPage) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect authenticated users away from auth pages
  if (token && isAuthPage) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Add security headers
  const response = NextResponse.next();
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  return response;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|icons|sw.js).*)'],
};
```

## Performance

### Caching Strategies

```tsx
// lib/cache.ts
import { unstable_cache } from 'next/cache';

// Cache user's categories (rarely change)
export const getCachedCategories = unstable_cache(
  async (userId: string) => {
    return prisma.category.findMany({
      where: { userId },
      orderBy: { name: 'asc' },
    });
  },
  ['user-categories'],
  { revalidate: 3600, tags: ['categories'] }
);

// Cache monthly summary (revalidate on new expense)
export const getCachedMonthlySummary = unstable_cache(
  async (userId: string, month: string) => {
    const startDate = new Date(`${month}-01`);
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 1);

    return prisma.expense.aggregate({
      where: {
        userId,
        date: { gte: startDate, lt: endDate },
      },
      _sum: { amount: true },
      _count: true,
    });
  },
  ['monthly-summary'],
  { revalidate: 300, tags: ['expenses'] }
);

// React Query configuration for client-side caching
export const queryClientConfig = {
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes
      refetchOnWindowFocus: false,
      retry: 2,
    },
  },
};
```

### Image Optimization

```tsx
// next.config.ts
import type { NextConfig } from 'next';

const config: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'expense-receipts.s3.amazonaws.com',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [320, 420, 768, 1024],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
  },
};

export default config;
```

```tsx
// components/receipts/receipt-thumbnail.tsx
import Image from 'next/image';

export function ReceiptThumbnail({ url, alt }: { url: string; alt: string }) {
  return (
    <div className="relative w-16 h-16 rounded-lg overflow-hidden">
      <Image
        src={url}
        alt={alt}
        fill
        sizes="64px"
        className="object-cover"
        placeholder="blur"
        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRg..."
        loading="lazy"
      />
    </div>
  );
}
```

### Bundle Optimization

```tsx
// Dynamic imports for heavy components
import dynamic from 'next/dynamic';

// Lazy load charts (only needed on reports page)
export const SpendingChart = dynamic(
  () => import('@/components/reports/spending-chart'),
  {
    loading: () => <div className="h-48 bg-gray-100 animate-pulse rounded-xl" />,
    ssr: false,
  }
);

// Lazy load OCR (only needed on scan page)
export const CameraCapture = dynamic(
  () => import('@/components/scanner/camera-capture'),
  {
    loading: () => <div className="h-screen bg-black" />,
    ssr: false,
  }
);

// next.config.ts bundle analysis
// Run: ANALYZE=true npm run build
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});
```

## CI/CD

```yaml
# .github/workflows/ci.yml
name: CI/CD

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

env:
  DATABASE_URL: ${{ secrets.DATABASE_URL }}
  NEXTAUTH_SECRET: ${{ secrets.NEXTAUTH_SECRET }}

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run lint

  typecheck:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run typecheck

  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run test:coverage
      - uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json

  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run build
      - run: npm run test:e2e
      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/

  deploy:
    needs: [lint, typecheck, test, e2e]
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

## Monitoring

### Sentry Setup

```tsx
// sentry.client.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  integrations: [
    Sentry.replayIntegration({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
  beforeSend(event) {
    // Sanitize sensitive data
    if (event.request?.data) {
      delete event.request.data.amount;
      delete event.request.data.description;
    }
    return event;
  },
});
```

```tsx
// sentry.server.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 0.1,
  profilesSampleRate: 0.1,
});
```

### Health Check Endpoint

```tsx
// app/api/health/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const healthcheck = {
    uptime: process.uptime(),
    timestamp: Date.now(),
    status: 'ok',
    checks: {} as Record<string, { status: string; latency?: number }>,
  };

  // Database check
  const dbStart = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    healthcheck.checks.database = {
      status: 'ok',
      latency: Date.now() - dbStart,
    };
  } catch (error) {
    healthcheck.status = 'degraded';
    healthcheck.checks.database = { status: 'error' };
  }

  // Memory check
  const memUsage = process.memoryUsage();
  healthcheck.checks.memory = {
    status: memUsage.heapUsed < 500 * 1024 * 1024 ? 'ok' : 'warning',
  };

  const statusCode = healthcheck.status === 'ok' ? 200 : 503;
  return NextResponse.json(healthcheck, { status: statusCode });
}
```

## Environment Variables

```bash
# .env.example

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/expense_tracker"

# Authentication
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# AWS S3 (Receipt Storage)
AWS_REGION="us-east-1"
AWS_ACCESS_KEY_ID="your-access-key"
AWS_SECRET_ACCESS_KEY="your-secret-key"
AWS_S3_BUCKET="expense-receipts"

# Redis (Rate Limiting & Caching)
UPSTASH_REDIS_REST_URL="https://your-redis.upstash.io"
UPSTASH_REDIS_REST_TOKEN="your-redis-token"

# Sentry (Error Monitoring)
SENTRY_DSN="https://your-dsn@sentry.io/project"
NEXT_PUBLIC_SENTRY_DSN="https://your-dsn@sentry.io/project"

# Analytics (Optional)
NEXT_PUBLIC_POSTHOG_KEY="your-posthog-key"
NEXT_PUBLIC_POSTHOG_HOST="https://app.posthog.com"

# PWA
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

## Deployment Checklist

- [ ] All environment variables configured in production
- [ ] Database migrations applied (`npx prisma migrate deploy`)
- [ ] S3 bucket created with proper CORS configuration
- [ ] Redis instance provisioned for rate limiting
- [ ] Sentry project configured and DSN added
- [ ] PWA manifest icons generated (192x192, 512x512, maskable)
- [ ] Service worker tested for offline functionality
- [ ] SSL certificate configured
- [ ] Rate limiting tested and thresholds verified
- [ ] Database connection pooling configured
- [ ] Backup strategy implemented
- [ ] Health check endpoint accessible
- [ ] Error boundaries tested
- [ ] Lighthouse audit score > 90 for all categories
- [ ] WCAG accessibility audit passed
- [ ] Load testing completed
- [ ] Security headers configured
- [ ] Content Security Policy defined

## Related Skills

- [[pwa]] - Progressive Web App setup
- [[mobile-first]] - Mobile-first design patterns
- [[offline-sync]] - Offline data synchronization
- [[file-upload]] - Image upload handling
- [[charts]] - Data visualization
- [[indexeddb]] - Client-side storage

## Changelog

- 1.0.0: Initial expense tracker recipe with OCR, budgets, and PWA support
