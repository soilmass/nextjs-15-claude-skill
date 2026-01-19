---
id: pt-web-workers
name: Web Workers
version: 2.0.0
layer: L5
category: background
description: Offload heavy computations to background threads using Web Workers
tags: [background, web, workers]
composes: []
dependencies: []
formula: Worker Thread + Message Passing + Comlink = Non-Blocking Computation
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

- Heavy data processing that would block UI
- Image/video manipulation
- Complex calculations (crypto, parsing)
- Large dataset sorting/filtering
- Real-time data transformation

## Composition Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ Web Workers Architecture                                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────┐    ┌─────────────────────────────┐│
│  │ Main Thread         │    │ Worker Thread               ││
│  │                     │    │                             ││
│  │ UI Responsive       │◄──►│ Heavy Computation           ││
│  │ Event Handling      │    │ - Data processing           ││
│  │ DOM Access          │    │ - Image manipulation        ││
│  │                     │    │ - Complex calculations      ││
│  └──────────┬──────────┘    └─────────────┬───────────────┘│
│             │                             │                 │
│             │    postMessage(data)        │                 │
│             │◄───────────────────────────►│                 │
│             │    onmessage(result)        │                 │
│                                                             │
│  Comlink (Optional):                                        │
│  - Proxy-based API for cleaner code                        │
│  - async/await instead of messages                         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

# Web Workers Pattern

## Overview

Web Workers enable running JavaScript in background threads, keeping the main thread responsive for UI interactions. This pattern shows how to implement Web Workers in Next.js 15 for CPU-intensive tasks like data processing, image manipulation, and complex calculations.

## Implementation

### Worker Setup with TypeScript

```typescript
// lib/workers/types.ts
export interface WorkerMessage<T = unknown> {
  type: string;
  payload: T;
  id: string;
}

export interface WorkerResponse<T = unknown> {
  type: string;
  payload: T;
  id: string;
  error?: string;
}

export interface DataProcessingPayload {
  data: number[];
  operation: 'sort' | 'filter' | 'transform' | 'aggregate';
  options?: Record<string, unknown>;
}

export interface DataProcessingResult {
  result: number[];
  duration: number;
  itemsProcessed: number;
}
```

### Data Processing Worker

```typescript
// workers/data-processor.worker.ts
/// <reference lib="webworker" />

import type { WorkerMessage, WorkerResponse, DataProcessingPayload, DataProcessingResult } from '@/lib/workers/types';

declare const self: DedicatedWorkerGlobalScope;

// Heavy computation functions
function quickSort(arr: number[]): number[] {
  if (arr.length <= 1) return arr;
  
  const pivot = arr[Math.floor(arr.length / 2)];
  const left = arr.filter(x => x < pivot);
  const middle = arr.filter(x => x === pivot);
  const right = arr.filter(x => x > pivot);
  
  return [...quickSort(left), ...middle, ...quickSort(right)];
}

function processData(payload: DataProcessingPayload): DataProcessingResult {
  const startTime = performance.now();
  let result: number[];
  
  switch (payload.operation) {
    case 'sort':
      result = quickSort([...payload.data]);
      break;
    case 'filter':
      const threshold = (payload.options?.threshold as number) ?? 0;
      result = payload.data.filter(n => n > threshold);
      break;
    case 'transform':
      const multiplier = (payload.options?.multiplier as number) ?? 2;
      result = payload.data.map(n => n * multiplier);
      break;
    case 'aggregate':
      // Complex aggregation with sliding window
      const windowSize = (payload.options?.windowSize as number) ?? 5;
      result = [];
      for (let i = 0; i <= payload.data.length - windowSize; i++) {
        const window = payload.data.slice(i, i + windowSize);
        const avg = window.reduce((a, b) => a + b, 0) / windowSize;
        result.push(Math.round(avg * 100) / 100);
      }
      break;
    default:
      result = payload.data;
  }
  
  return {
    result,
    duration: performance.now() - startTime,
    itemsProcessed: payload.data.length,
  };
}

self.onmessage = (event: MessageEvent<WorkerMessage<DataProcessingPayload>>) => {
  const { type, payload, id } = event.data;
  
  try {
    if (type === 'PROCESS_DATA') {
      const result = processData(payload);
      
      const response: WorkerResponse<DataProcessingResult> = {
        type: 'PROCESS_DATA_COMPLETE',
        payload: result,
        id,
      };
      
      self.postMessage(response);
    }
  } catch (error) {
    const response: WorkerResponse<null> = {
      type: 'ERROR',
      payload: null,
      id,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
    
    self.postMessage(response);
  }
};

export {};
```

### Worker Manager Hook

```typescript
// hooks/use-worker.ts
'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import type { WorkerMessage, WorkerResponse } from '@/lib/workers/types';

interface WorkerOptions {
  onMessage?: (response: WorkerResponse) => void;
  onError?: (error: ErrorEvent) => void;
}

interface PendingTask<T> {
  resolve: (value: T) => void;
  reject: (reason: Error) => void;
  timeout: NodeJS.Timeout;
}

export function useWorker<TPayload, TResult>(
  workerFactory: () => Worker,
  options: WorkerOptions = {}
) {
  const workerRef = useRef<Worker | null>(null);
  const pendingTasks = useRef<Map<string, PendingTask<TResult>>>(new Map());
  const [isReady, setIsReady] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  useEffect(() => {
    // Create worker instance
    workerRef.current = workerFactory();
    setIsReady(true);
    
    const worker = workerRef.current;
    
    worker.onmessage = (event: MessageEvent<WorkerResponse<TResult>>) => {
      const { id, payload, error } = event.data;
      
      const task = pendingTasks.current.get(id);
      if (task) {
        clearTimeout(task.timeout);
        pendingTasks.current.delete(id);
        
        if (pendingTasks.current.size === 0) {
          setIsProcessing(false);
        }
        
        if (error) {
          task.reject(new Error(error));
        } else {
          task.resolve(payload);
        }
      }
      
      options.onMessage?.(event.data);
    };
    
    worker.onerror = (error: ErrorEvent) => {
      console.error('Worker error:', error);
      options.onError?.(error);
      
      // Reject all pending tasks
      pendingTasks.current.forEach((task, id) => {
        clearTimeout(task.timeout);
        task.reject(new Error(error.message));
      });
      pendingTasks.current.clear();
      setIsProcessing(false);
    };
    
    return () => {
      // Cleanup pending tasks
      pendingTasks.current.forEach((task) => {
        clearTimeout(task.timeout);
        task.reject(new Error('Worker terminated'));
      });
      pendingTasks.current.clear();
      
      worker.terminate();
      workerRef.current = null;
      setIsReady(false);
    };
  }, [workerFactory, options.onMessage, options.onError]);
  
  const postMessage = useCallback(
    (type: string, payload: TPayload, timeoutMs = 30000): Promise<TResult> => {
      return new Promise((resolve, reject) => {
        if (!workerRef.current) {
          reject(new Error('Worker not initialized'));
          return;
        }
        
        const id = crypto.randomUUID();
        
        const timeout = setTimeout(() => {
          pendingTasks.current.delete(id);
          if (pendingTasks.current.size === 0) {
            setIsProcessing(false);
          }
          reject(new Error('Worker task timeout'));
        }, timeoutMs);
        
        pendingTasks.current.set(id, { resolve, reject, timeout });
        setIsProcessing(true);
        
        const message: WorkerMessage<TPayload> = { type, payload, id };
        workerRef.current.postMessage(message);
      });
    },
    []
  );
  
  const terminate = useCallback(() => {
    if (workerRef.current) {
      pendingTasks.current.forEach((task) => {
        clearTimeout(task.timeout);
        task.reject(new Error('Worker terminated by user'));
      });
      pendingTasks.current.clear();
      
      workerRef.current.terminate();
      workerRef.current = null;
      setIsReady(false);
      setIsProcessing(false);
    }
  }, []);
  
  return { postMessage, terminate, isReady, isProcessing };
}
```

### Worker Pool for Parallel Processing

```typescript
// lib/workers/worker-pool.ts
'use client';

import type { WorkerMessage, WorkerResponse } from './types';

interface PooledWorker {
  worker: Worker;
  busy: boolean;
  taskId: string | null;
}

interface QueuedTask<TPayload, TResult> {
  type: string;
  payload: TPayload;
  id: string;
  resolve: (value: TResult) => void;
  reject: (reason: Error) => void;
}

export class WorkerPool<TPayload = unknown, TResult = unknown> {
  private workers: PooledWorker[] = [];
  private taskQueue: QueuedTask<TPayload, TResult>[] = [];
  private maxWorkers: number;
  private workerFactory: () => Worker;
  
  constructor(workerFactory: () => Worker, maxWorkers = navigator.hardwareConcurrency || 4) {
    this.workerFactory = workerFactory;
    this.maxWorkers = maxWorkers;
  }
  
  private createWorker(): PooledWorker {
    const worker = this.workerFactory();
    
    const pooledWorker: PooledWorker = {
      worker,
      busy: false,
      taskId: null,
    };
    
    worker.onmessage = (event: MessageEvent<WorkerResponse<TResult>>) => {
      const { id, payload, error } = event.data;
      
      // Find the task in our internal tracking
      pooledWorker.busy = false;
      pooledWorker.taskId = null;
      
      // Process next task in queue
      this.processQueue();
    };
    
    worker.onerror = (error: ErrorEvent) => {
      console.error('Pool worker error:', error);
      pooledWorker.busy = false;
      pooledWorker.taskId = null;
      this.processQueue();
    };
    
    return pooledWorker;
  }
  
  private getAvailableWorker(): PooledWorker | null {
    // Find idle worker
    let worker = this.workers.find(w => !w.busy);
    
    // Create new worker if under limit
    if (!worker && this.workers.length < this.maxWorkers) {
      worker = this.createWorker();
      this.workers.push(worker);
    }
    
    return worker || null;
  }
  
  private processQueue(): void {
    while (this.taskQueue.length > 0) {
      const worker = this.getAvailableWorker();
      if (!worker) break;
      
      const task = this.taskQueue.shift()!;
      this.executeTask(worker, task);
    }
  }
  
  private executeTask(
    pooledWorker: PooledWorker,
    task: QueuedTask<TPayload, TResult>
  ): void {
    pooledWorker.busy = true;
    pooledWorker.taskId = task.id;
    
    const messageHandler = (event: MessageEvent<WorkerResponse<TResult>>) => {
      if (event.data.id === task.id) {
        pooledWorker.worker.removeEventListener('message', messageHandler);
        
        if (event.data.error) {
          task.reject(new Error(event.data.error));
        } else {
          task.resolve(event.data.payload);
        }
      }
    };
    
    pooledWorker.worker.addEventListener('message', messageHandler);
    
    const message: WorkerMessage<TPayload> = {
      type: task.type,
      payload: task.payload,
      id: task.id,
    };
    
    pooledWorker.worker.postMessage(message);
  }
  
  exec(type: string, payload: TPayload): Promise<TResult> {
    return new Promise((resolve, reject) => {
      const task: QueuedTask<TPayload, TResult> = {
        type,
        payload,
        id: crypto.randomUUID(),
        resolve,
        reject,
      };
      
      this.taskQueue.push(task);
      this.processQueue();
    });
  }
  
  async execBatch(type: string, payloads: TPayload[]): Promise<TResult[]> {
    return Promise.all(payloads.map(payload => this.exec(type, payload)));
  }
  
  terminate(): void {
    this.workers.forEach(({ worker }) => worker.terminate());
    this.workers = [];
    this.taskQueue.forEach(task => {
      task.reject(new Error('Worker pool terminated'));
    });
    this.taskQueue = [];
  }
  
  get stats() {
    return {
      totalWorkers: this.workers.length,
      busyWorkers: this.workers.filter(w => w.busy).length,
      queuedTasks: this.taskQueue.length,
      maxWorkers: this.maxWorkers,
    };
  }
}
```

### Image Processing Worker

```typescript
// workers/image-processor.worker.ts
/// <reference lib="webworker" />

import type { WorkerMessage, WorkerResponse } from '@/lib/workers/types';

declare const self: DedicatedWorkerGlobalScope;

interface ImageProcessPayload {
  imageData: ImageData;
  operation: 'grayscale' | 'blur' | 'sharpen' | 'brightness' | 'contrast';
  options?: {
    amount?: number;
    radius?: number;
  };
}

interface ImageProcessResult {
  imageData: ImageData;
  duration: number;
}

function applyGrayscale(data: Uint8ClampedArray): void {
  for (let i = 0; i < data.length; i += 4) {
    const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
    data[i] = avg;     // R
    data[i + 1] = avg; // G
    data[i + 2] = avg; // B
  }
}

function applyBrightness(data: Uint8ClampedArray, amount: number): void {
  for (let i = 0; i < data.length; i += 4) {
    data[i] = Math.min(255, Math.max(0, data[i] + amount));
    data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + amount));
    data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + amount));
  }
}

function applyContrast(data: Uint8ClampedArray, amount: number): void {
  const factor = (259 * (amount + 255)) / (255 * (259 - amount));
  
  for (let i = 0; i < data.length; i += 4) {
    data[i] = Math.min(255, Math.max(0, factor * (data[i] - 128) + 128));
    data[i + 1] = Math.min(255, Math.max(0, factor * (data[i + 1] - 128) + 128));
    data[i + 2] = Math.min(255, Math.max(0, factor * (data[i + 2] - 128) + 128));
  }
}

function applyBlur(imageData: ImageData, radius: number): ImageData {
  const { data, width, height } = imageData;
  const output = new Uint8ClampedArray(data.length);
  const kernelSize = radius * 2 + 1;
  const kernelArea = kernelSize * kernelSize;
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let r = 0, g = 0, b = 0;
      
      for (let ky = -radius; ky <= radius; ky++) {
        for (let kx = -radius; kx <= radius; kx++) {
          const px = Math.min(width - 1, Math.max(0, x + kx));
          const py = Math.min(height - 1, Math.max(0, y + ky));
          const idx = (py * width + px) * 4;
          
          r += data[idx];
          g += data[idx + 1];
          b += data[idx + 2];
        }
      }
      
      const idx = (y * width + x) * 4;
      output[idx] = r / kernelArea;
      output[idx + 1] = g / kernelArea;
      output[idx + 2] = b / kernelArea;
      output[idx + 3] = data[idx + 3];
    }
  }
  
  return new ImageData(output, width, height);
}

function processImage(payload: ImageProcessPayload): ImageProcessResult {
  const startTime = performance.now();
  let result = payload.imageData;
  const data = new Uint8ClampedArray(payload.imageData.data);
  
  switch (payload.operation) {
    case 'grayscale':
      applyGrayscale(data);
      result = new ImageData(data, payload.imageData.width, payload.imageData.height);
      break;
    case 'brightness':
      applyBrightness(data, payload.options?.amount ?? 50);
      result = new ImageData(data, payload.imageData.width, payload.imageData.height);
      break;
    case 'contrast':
      applyContrast(data, payload.options?.amount ?? 50);
      result = new ImageData(data, payload.imageData.width, payload.imageData.height);
      break;
    case 'blur':
      result = applyBlur(payload.imageData, payload.options?.radius ?? 3);
      break;
  }
  
  return {
    imageData: result,
    duration: performance.now() - startTime,
  };
}

self.onmessage = (event: MessageEvent<WorkerMessage<ImageProcessPayload>>) => {
  const { type, payload, id } = event.data;
  
  try {
    if (type === 'PROCESS_IMAGE') {
      const result = processImage(payload);
      
      const response: WorkerResponse<ImageProcessResult> = {
        type: 'PROCESS_IMAGE_COMPLETE',
        payload: result,
        id,
      };
      
      self.postMessage(response);
    }
  } catch (error) {
    const response: WorkerResponse<null> = {
      type: 'ERROR',
      payload: null,
      id,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
    
    self.postMessage(response);
  }
};

export {};
```

### React Component with Workers

```tsx
// components/data-processor.tsx
'use client';

import { useState, useCallback, useMemo } from 'react';
import { useWorker } from '@/hooks/use-worker';
import type { DataProcessingPayload, DataProcessingResult } from '@/lib/workers/types';

export function DataProcessor() {
  const [data, setData] = useState<number[]>([]);
  const [result, setResult] = useState<DataProcessingResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const workerFactory = useCallback(
    () => new Worker(new URL('../workers/data-processor.worker.ts', import.meta.url)),
    []
  );
  
  const { postMessage, isReady, isProcessing } = useWorker<
    DataProcessingPayload,
    DataProcessingResult
  >(workerFactory);
  
  const generateData = useCallback((count: number) => {
    const newData = Array.from(
      { length: count },
      () => Math.floor(Math.random() * 10000)
    );
    setData(newData);
    setResult(null);
    setError(null);
  }, []);
  
  const processData = useCallback(
    async (operation: DataProcessingPayload['operation']) => {
      if (data.length === 0) return;
      
      try {
        setError(null);
        const response = await postMessage('PROCESS_DATA', {
          data,
          operation,
          options: { threshold: 5000, multiplier: 2, windowSize: 10 },
        });
        setResult(response);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Processing failed');
      }
    },
    [data, postMessage]
  );
  
  return (
    <div className="p-6 space-y-4">
      <h2 className="text-xl font-bold">Data Processor (Web Worker)</h2>
      
      <div className="flex gap-2">
        <button
          onClick={() => generateData(100000)}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Generate 100K items
        </button>
        <button
          onClick={() => generateData(1000000)}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Generate 1M items
        </button>
      </div>
      
      {data.length > 0 && (
        <p className="text-gray-600">
          Data: {data.length.toLocaleString()} items
        </p>
      )}
      
      <div className="flex gap-2 flex-wrap">
        {(['sort', 'filter', 'transform', 'aggregate'] as const).map((op) => (
          <button
            key={op}
            onClick={() => processData(op)}
            disabled={!isReady || isProcessing || data.length === 0}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {op.charAt(0).toUpperCase() + op.slice(1)}
          </button>
        ))}
      </div>
      
      {isProcessing && (
        <div className="flex items-center gap-2 text-blue-600">
          <div className="animate-spin h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full" />
          Processing in background...
        </div>
      )}
      
      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded">
          Error: {error}
        </div>
      )}
      
      {result && (
        <div className="p-4 bg-gray-50 rounded space-y-2">
          <p>
            <strong>Duration:</strong> {result.duration.toFixed(2)}ms
          </p>
          <p>
            <strong>Items processed:</strong>{' '}
            {result.itemsProcessed.toLocaleString()}
          </p>
          <p>
            <strong>Result items:</strong>{' '}
            {result.result.length.toLocaleString()}
          </p>
          <p className="text-sm text-gray-500">
            First 10: [{result.result.slice(0, 10).join(', ')}...]
          </p>
        </div>
      )}
    </div>
  );
}
```

### Transferable Objects for Large Data

```typescript
// hooks/use-transferable-worker.ts
'use client';

import { useCallback, useEffect, useRef } from 'react';

interface TransferableMessage {
  type: string;
  buffer: ArrayBuffer;
  id: string;
}

export function useTransferableWorker(workerFactory: () => Worker) {
  const workerRef = useRef<Worker | null>(null);
  const callbacksRef = useRef<Map<string, (data: ArrayBuffer) => void>>(new Map());
  
  useEffect(() => {
    workerRef.current = workerFactory();
    
    workerRef.current.onmessage = (event) => {
      const { id, buffer } = event.data;
      const callback = callbacksRef.current.get(id);
      if (callback) {
        callback(buffer);
        callbacksRef.current.delete(id);
      }
    };
    
    return () => {
      workerRef.current?.terminate();
    };
  }, [workerFactory]);
  
  // Send ArrayBuffer with zero-copy transfer
  const sendBuffer = useCallback(
    (type: string, buffer: ArrayBuffer): Promise<ArrayBuffer> => {
      return new Promise((resolve) => {
        if (!workerRef.current) throw new Error('Worker not ready');
        
        const id = crypto.randomUUID();
        callbacksRef.current.set(id, resolve);
        
        const message: TransferableMessage = { type, buffer, id };
        
        // Transfer ownership of the buffer (zero-copy)
        workerRef.current.postMessage(message, [buffer]);
      });
    },
    []
  );
  
  // Convert typed array to buffer and back
  const processTypedArray = useCallback(
    async <T extends Float32Array | Float64Array | Int32Array>(
      type: string,
      array: T
    ): Promise<T> => {
      const resultBuffer = await sendBuffer(type, array.buffer);
      return new (array.constructor as new (buffer: ArrayBuffer) => T)(resultBuffer);
    },
    [sendBuffer]
  );
  
  return { sendBuffer, processTypedArray };
}
```

### Webpack Configuration for Workers

```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Ensure workers are properly bundled
      config.output.globalObject = 'self';
    }
    
    return config;
  },
};

export default nextConfig;
```

## Variants

### SharedArrayBuffer for Shared Memory

```typescript
// lib/workers/shared-memory.ts
export function createSharedBuffer(size: number): SharedArrayBuffer {
  // Requires COOP/COEP headers
  return new SharedArrayBuffer(size);
}

// middleware.ts - Required headers
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  
  // Enable SharedArrayBuffer
  response.headers.set('Cross-Origin-Opener-Policy', 'same-origin');
  response.headers.set('Cross-Origin-Embedder-Policy', 'require-corp');
  
  return response;
}
```

### Comlink for Cleaner API

```typescript
// workers/comlink-worker.ts
import * as Comlink from 'comlink';

const api = {
  async processData(data: number[]): Promise<number[]> {
    return data.sort((a, b) => a - b);
  },
  
  async heavyCalculation(n: number): Promise<number> {
    let result = 0;
    for (let i = 0; i < n; i++) {
      result += Math.sqrt(i);
    }
    return result;
  },
};

Comlink.expose(api);

// Usage in component
import * as Comlink from 'comlink';

type WorkerApi = typeof api;

const worker = new Worker(new URL('./comlink-worker.ts', import.meta.url));
const api = Comlink.wrap<WorkerApi>(worker);

const result = await api.processData([3, 1, 2]); // [1, 2, 3]
```

## Anti-Patterns

```typescript
// Bad: Creating worker on every render
function BadComponent() {
  // Worker created every render!
  const worker = new Worker(new URL('./worker.ts', import.meta.url));
  
  return <button onClick={() => worker.postMessage('work')}>Process</button>;
}

// Good: Worker in ref, created once
function GoodComponent() {
  const workerRef = useRef<Worker>();
  
  useEffect(() => {
    workerRef.current = new Worker(new URL('./worker.ts', import.meta.url));
    return () => workerRef.current?.terminate();
  }, []);
  
  return <button onClick={() => workerRef.current?.postMessage('work')}>Process</button>;
}

// Bad: Sending large objects by copy
worker.postMessage({ hugeArray: new Float32Array(1000000) });

// Good: Using transferable objects
const buffer = new Float32Array(1000000).buffer;
worker.postMessage({ buffer }, [buffer]); // Zero-copy transfer
```

## Related Skills

- `code-splitting` - Dynamic imports for worker files
- `lazy-loading` - Load workers on demand
- `performance-testing` - Benchmark worker performance
- `bundle-optimization` - Optimize worker bundle size

## Changelog

### 2.0.0 (2025-01-18)
- Standardized to atomic design system v2
- Updated frontmatter schema

- 1.0.0: Initial Web Workers pattern with pool and transferables
