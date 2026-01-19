---
id: pt-performance-testing
name: Performance Testing Pattern
version: 2.0.0
layer: L5
category: testing
description: Performance testing for Next.js 15 applications using Lighthouse CI, Web Vitals, and performance budgets
tags: [testing, performance, lighthouse, web-vitals, benchmarks]
composes: []
dependencies:
  playwright: "^1.49.0"
formula: "Lighthouse CI + Web Vitals + Playwright = performance validation"
performance:
  impact: high
  lcp: positive
  cls: neutral
accessibility:
  wcag: AA
  keyboard: true
  screen-reader: true
---

# Performance Testing Pattern

## Overview

Performance testing for Next.js 15 applications using Lighthouse CI, Web Vitals monitoring, and performance budgets. Ensures optimal user experience through automated performance validation.

## When to Use

- **Pre-deployment**: Validate Core Web Vitals before releasing to production
- **Bundle analysis**: Monitor JavaScript bundle sizes and code splitting
- **CI/CD gates**: Block deployments that exceed performance budgets
- **Image optimization**: Verify LCP improvements from image optimizations
- **Cache validation**: Test cache hit rates and CDN performance
- **Mobile testing**: Validate performance on throttled network conditions
- **Regression detection**: Catch performance degradations early

## Composition Diagram

```
+------------------+     +-------------------+     +------------------+
| Lighthouse CI    | --> | Core Web Vitals   | --> | Performance      |
| (scores)         |     | (LCP, FID, CLS)   |     | Budget Check     |
+------------------+     +-------------------+     +------------------+
         |                        |                        |
         v                        v                        v
+------------------+     +-------------------+     +------------------+
| Bundle Analysis  |     | Runtime Metrics   |     | Load Testing     |
| (size limits)    |     | (memory, CPU)     |     | (k6/Artillery)   |
+------------------+     +-------------------+     +------------------+
         |                        |
         v                        v
+------------------+     +-------------------+
| E2E Testing      |     | Edge Cache        |
| (Playwright)     |     | Validation        |
+------------------+     +-------------------+
```

## Implementation

### Lighthouse CI Configuration

```javascript
// lighthouserc.js
module.exports = {
  ci: {
    collect: {
      url: [
        'http://localhost:3000/',
        'http://localhost:3000/products',
        'http://localhost:3000/products/sample-product',
        'http://localhost:3000/checkout',
      ],
      startServerCommand: 'npm run start',
      startServerReadyPattern: 'ready on',
      numberOfRuns: 3,
      settings: {
        preset: 'desktop',
        throttling: {
          cpuSlowdownMultiplier: 1,
        },
      },
    },
    assert: {
      preset: 'lighthouse:recommended',
      assertions: {
        'categories:performance': ['error', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.95 }],
        'categories:best-practices': ['error', { minScore: 0.9 }],
        'categories:seo': ['error', { minScore: 0.9 }],
        'first-contentful-paint': ['error', { maxNumericValue: 1500 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
        'total-blocking-time': ['error', { maxNumericValue: 300 }],
        'speed-index': ['error', { maxNumericValue: 3000 }],
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};
```

### Performance Budget

```json
// budget.json
[
  {
    "path": "/*",
    "timings": [
      { "metric": "first-contentful-paint", "budget": 1500 },
      { "metric": "largest-contentful-paint", "budget": 2500 },
      { "metric": "total-blocking-time", "budget": 300 },
      { "metric": "cumulative-layout-shift", "budget": 0.1 },
      { "metric": "speed-index", "budget": 3000 }
    ],
    "resourceSizes": [
      { "resourceType": "script", "budget": 300 },
      { "resourceType": "total", "budget": 500 },
      { "resourceType": "image", "budget": 200 }
    ],
    "resourceCounts": [
      { "resourceType": "script", "budget": 10 },
      { "resourceType": "total", "budget": 50 }
    ]
  },
  {
    "path": "/products/*",
    "timings": [
      { "metric": "largest-contentful-paint", "budget": 3000 }
    ],
    "resourceSizes": [
      { "resourceType": "image", "budget": 500 }
    ]
  }
]
```

### Playwright Performance Tests

```typescript
// tests/performance/core-vitals.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Core Web Vitals', () => {
  test('homepage LCP under 2.5s', async ({ page }) => {
    await page.goto('/');

    const lcp = await page.evaluate(() => {
      return new Promise<number>((resolve) => {
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          resolve(lastEntry.startTime);
        }).observe({ type: 'largest-contentful-paint', buffered: true });
      });
    });

    expect(lcp).toBeLessThan(2500);
  });

  test('homepage CLS under 0.1', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const cls = await page.evaluate(() => {
      return new Promise<number>((resolve) => {
        let clsValue = 0;
        
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (!(entry as any).hadRecentInput) {
              clsValue += (entry as any).value;
            }
          }
        }).observe({ type: 'layout-shift', buffered: true });

        setTimeout(() => resolve(clsValue), 1000);
      });
    });

    expect(cls).toBeLessThan(0.1);
  });

  test('homepage FID proxy (TBT) under 300ms', async ({ page }) => {
    await page.goto('/');

    const tbt = await page.evaluate(() => {
      return new Promise<number>((resolve) => {
        let tbtValue = 0;
        
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            const blockingTime = entry.duration - 50;
            if (blockingTime > 0) {
              tbtValue += blockingTime;
            }
          }
        }).observe({ type: 'longtask', buffered: true });

        setTimeout(() => resolve(tbtValue), 3000);
      });
    });

    expect(tbt).toBeLessThan(300);
  });
});
```

### Bundle Size Testing

```typescript
// tests/performance/bundle.spec.ts
import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

test.describe('Bundle Size', () => {
  test('JavaScript bundle under limit', async () => {
    const buildManifest = JSON.parse(
      fs.readFileSync(
        path.join(process.cwd(), '.next/build-manifest.json'),
        'utf-8'
      )
    );

    // Calculate total JS size
    let totalJsSize = 0;
    const jsFiles = Object.values(buildManifest.pages)
      .flat()
      .filter((file: any) => file.endsWith('.js'));

    for (const file of jsFiles as string[]) {
      const filePath = path.join(process.cwd(), '.next', file);
      if (fs.existsSync(filePath)) {
        const stats = fs.statSync(filePath);
        totalJsSize += stats.size;
      }
    }

    const totalKB = totalJsSize / 1024;
    console.log(`Total JS bundle size: ${totalKB.toFixed(2)} KB`);

    expect(totalKB).toBeLessThan(300); // 300KB limit
  });

  test('first load JS under limit', async ({ page }) => {
    const [response] = await Promise.all([
      page.waitForResponse((res) => res.url().includes('/_next/static')),
      page.goto('/'),
    ]);

    const resources = await page.evaluate(() => {
      return performance.getEntriesByType('resource')
        .filter((r: any) => r.initiatorType === 'script')
        .reduce((total: number, r: any) => total + r.transferSize, 0);
    });

    const totalKB = resources / 1024;
    console.log(`First load JS: ${totalKB.toFixed(2)} KB`);

    expect(totalKB).toBeLessThan(150);
  });

  test('individual chunks under limit', async () => {
    const chunksDir = path.join(process.cwd(), '.next/static/chunks');
    
    if (fs.existsSync(chunksDir)) {
      const files = fs.readdirSync(chunksDir);
      
      for (const file of files) {
        if (file.endsWith('.js')) {
          const filePath = path.join(chunksDir, file);
          const stats = fs.statSync(filePath);
          const sizeKB = stats.size / 1024;
          
          expect(
            sizeKB,
            `Chunk ${file} is too large (${sizeKB.toFixed(2)} KB)`
          ).toBeLessThan(100);
        }
      }
    }
  });
});
```

### Runtime Performance Tests

```typescript
// tests/performance/runtime.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Runtime Performance', () => {
  test('no memory leaks on navigation', async ({ page }) => {
    await page.goto('/');

    // Get initial memory
    const initialMemory = await page.evaluate(() => {
      return (performance as any).memory?.usedJSHeapSize || 0;
    });

    // Navigate multiple times
    for (let i = 0; i < 10; i++) {
      await page.click('a[href="/products"]');
      await page.waitForLoadState('networkidle');
      await page.click('a[href="/"]');
      await page.waitForLoadState('networkidle');
    }

    // Force GC if available
    await page.evaluate(() => {
      if ((window as any).gc) {
        (window as any).gc();
      }
    });

    const finalMemory = await page.evaluate(() => {
      return (performance as any).memory?.usedJSHeapSize || 0;
    });

    // Memory should not increase by more than 50%
    const memoryIncrease = (finalMemory - initialMemory) / initialMemory;
    expect(memoryIncrease).toBeLessThan(0.5);
  });

  test('no long tasks on interaction', async ({ page }) => {
    await page.goto('/');

    const longTasks: number[] = [];

    await page.evaluate(() => {
      (window as any).__longTasks = [];
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          (window as any).__longTasks.push(entry.duration);
        }
      }).observe({ type: 'longtask', buffered: true });
    });

    // Perform interactions
    await page.click('button[data-testid="open-menu"]');
    await page.waitForTimeout(100);
    await page.click('a[href="/products"]');
    await page.waitForLoadState('networkidle');

    const tasks = await page.evaluate(() => (window as any).__longTasks);

    // No tasks longer than 100ms
    for (const duration of tasks) {
      expect(duration).toBeLessThan(100);
    }
  });

  test('scroll performance', async ({ page }) => {
    await page.goto('/products');
    await page.waitForLoadState('networkidle');

    // Measure scroll jank
    const scrollMetrics = await page.evaluate(async () => {
      const frames: number[] = [];
      let lastTime = performance.now();

      return new Promise<{ avgFrameTime: number; maxFrameTime: number }>(
        (resolve) => {
          const onFrame = (time: number) => {
            frames.push(time - lastTime);
            lastTime = time;
          };

          // Scroll and measure
          let scrollCount = 0;
          const scrollInterval = setInterval(() => {
            window.scrollBy(0, 100);
            requestAnimationFrame(onFrame);
            scrollCount++;

            if (scrollCount > 20) {
              clearInterval(scrollInterval);
              resolve({
                avgFrameTime:
                  frames.reduce((a, b) => a + b, 0) / frames.length,
                maxFrameTime: Math.max(...frames),
              });
            }
          }, 16);
        }
      );
    });

    // Average frame time should be under 20ms (50fps)
    expect(scrollMetrics.avgFrameTime).toBeLessThan(20);
    // No frame should take more than 50ms
    expect(scrollMetrics.maxFrameTime).toBeLessThan(50);
  });
});
```

### API Performance Tests

```typescript
// tests/performance/api.spec.ts
import { test, expect } from '@playwright/test';

test.describe('API Performance', () => {
  test('API response times', async ({ request }) => {
    const endpoints = [
      { path: '/api/products', maxTime: 200 },
      { path: '/api/products/1', maxTime: 100 },
      { path: '/api/categories', maxTime: 150 },
    ];

    for (const { path, maxTime } of endpoints) {
      const startTime = Date.now();
      const response = await request.get(path);
      const duration = Date.now() - startTime;

      expect(response.ok()).toBe(true);
      expect(
        duration,
        `${path} took ${duration}ms (max: ${maxTime}ms)`
      ).toBeLessThan(maxTime);
    }
  });

  test('concurrent API requests', async ({ request }) => {
    const startTime = Date.now();

    // Make 10 concurrent requests
    const requests = Array(10)
      .fill(null)
      .map(() => request.get('/api/products'));

    const responses = await Promise.all(requests);
    const duration = Date.now() - startTime;

    // All should succeed
    for (const response of responses) {
      expect(response.ok()).toBe(true);
    }

    // Should complete within 500ms total
    expect(duration).toBeLessThan(500);
  });

  test('API caching works', async ({ request }) => {
    // First request
    const startTime1 = Date.now();
    await request.get('/api/products');
    const duration1 = Date.now() - startTime1;

    // Second request (should be cached)
    const startTime2 = Date.now();
    const response2 = await request.get('/api/products');
    const duration2 = Date.now() - startTime2;

    // Cached request should be faster
    expect(duration2).toBeLessThan(duration1);

    // Check cache header
    const cacheHeader = response2.headers()['x-cache'];
    expect(cacheHeader).toBe('HIT');
  });
});
```

### CI/CD Integration

```yaml
# .github/workflows/performance.yml
name: Performance Tests

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - run: npm ci
      - run: npm run build

      - name: Run Lighthouse CI
        run: |
          npm install -g @lhci/cli
          lhci autorun
        env:
          LHCI_GITHUB_APP_TOKEN: ${{ secrets.LHCI_GITHUB_APP_TOKEN }}

      - name: Upload Lighthouse Report
        uses: actions/upload-artifact@v4
        with:
          name: lighthouse-report
          path: .lighthouseci/

  bundle-size:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm run build

      - name: Check bundle size
        run: npx bundlesize
        env:
          BUNDLESIZE_GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### Bundle Size Configuration

```json
// package.json
{
  "bundlesize": [
    {
      "path": ".next/static/chunks/main-*.js",
      "maxSize": "100 kB"
    },
    {
      "path": ".next/static/chunks/pages/_app-*.js",
      "maxSize": "50 kB"
    },
    {
      "path": ".next/static/chunks/pages/index-*.js",
      "maxSize": "30 kB"
    }
  ]
}
```

### Custom Performance Reporter

```typescript
// lib/perf-reporter.ts
type PerformanceMetric = {
  name: string;
  value: number;
  unit: string;
  threshold: number;
  passed: boolean;
};

export class PerformanceReporter {
  private metrics: PerformanceMetric[] = [];

  addMetric(
    name: string,
    value: number,
    unit: string,
    threshold: number
  ): void {
    this.metrics.push({
      name,
      value,
      unit,
      threshold,
      passed: value <= threshold,
    });
  }

  getReport(): string {
    const lines = ['# Performance Report', ''];
    
    for (const metric of this.metrics) {
      const status = metric.passed ? '✅' : '❌';
      lines.push(
        `${status} ${metric.name}: ${metric.value}${metric.unit} (threshold: ${metric.threshold}${metric.unit})`
      );
    }

    const failedCount = this.metrics.filter((m) => !m.passed).length;
    lines.push('');
    lines.push(`Total: ${this.metrics.length} metrics, ${failedCount} failed`);

    return lines.join('\n');
  }

  hasFailed(): boolean {
    return this.metrics.some((m) => !m.passed);
  }
}
```

## Anti-patterns

```typescript
// BAD: Testing only in development mode
// npm run dev && npx playwright test

// GOOD: Test production build
// npm run build && npm run start && npx playwright test

// BAD: Single run without averaging
const lcp = await measureLCP();
expect(lcp).toBeLessThan(2500);

// GOOD: Multiple runs for accuracy
const runs = await Promise.all([
  measureLCP(),
  measureLCP(),
  measureLCP(),
]);
const avgLcp = runs.reduce((a, b) => a + b) / runs.length;
expect(avgLcp).toBeLessThan(2500);

// BAD: Ignoring network conditions
await page.goto('/'); // Fast connection

// GOOD: Test with throttling
await page.route('**/*', (route) => {
  route.continue({ throttle: { downloadSpeed: 1.5 * 1024 * 1024 / 8 } }); // 1.5 Mbps
});
```

## Related Patterns

- `web-vitals.md` - Core Web Vitals
- `lighthouse-optimization.md` - Lighthouse scores
- `bundle-optimization.md` - Bundle size
- `image-optimization.md` - Image performance

## Changelog

### 2.0.0 (2025-01-17)
- Standardized to atomic design system v2
- Updated frontmatter schema

### 1.0.0 (2024-01-15)
- Initial performance testing pattern
