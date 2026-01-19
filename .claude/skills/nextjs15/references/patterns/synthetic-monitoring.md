---
id: pt-synthetic-monitoring
name: Synthetic Monitoring
version: 2.0.0
layer: L5
category: observability
description: Implement synthetic monitoring for proactive testing
tags: [observability, synthetic, monitoring]
composes: []
dependencies: []
formula: automated tests + scheduled execution + geographic distribution = proactive availability monitoring
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# Synthetic Monitoring Pattern

## When to Use

- Applications requiring uptime guarantees and SLA compliance
- E-commerce or critical user flows that must be continuously validated
- Multi-region deployments needing geographic performance verification
- API endpoints requiring health validation beyond simple pings
- Pre-production validation before deployments

## Composition Diagram

```
+-------------------+     +----------------------+     +-------------------+
| Scheduled Runner  |---->| pt-synthetic-monitor |---->|   pt-alerting     |
|   (Cron/CI)       |     |   (Test Execution)   |     | (Failure Alerts)  |
+-------------------+     +----------------------+     +-------------------+
                                    |
              +---------------------+---------------------+
              |                     |                     |
              v                     v                     v
+-------------------+     +-------------------+     +-------------------+
|  Availability     |     |   Performance     |     |   Transaction     |
|     Checks        |     |     Checks        |     |     Checks        |
+-------------------+     +-------------------+     +-------------------+
              |                     |                     |
              v                     v                     v
+-------------------+     +-------------------+     +-------------------+
|   pt-metrics      |     |  pt-web-vitals    |     |     pt-rum        |
|  (Store Results)  |     | (Lighthouse CI)   |     |  (Comparison)     |
+-------------------+     +-------------------+     +-------------------+
```

## Overview

Synthetic monitoring uses automated tests to proactively monitor application availability, performance, and functionality from multiple locations. This pattern covers implementing synthetic checks with Playwright, Lighthouse CI, and custom health probes.

## Implementation

### Synthetic Test Runner

```typescript
// lib/monitoring/synthetic/runner.ts
import { chromium, Browser, Page } from 'playwright';

export interface SyntheticCheck {
  name: string;
  url: string;
  type: 'availability' | 'performance' | 'transaction';
  timeout?: number;
  assertions?: CheckAssertion[];
  steps?: TransactionStep[];
}

export interface CheckAssertion {
  type: 'status' | 'responseTime' | 'content' | 'element';
  expected: unknown;
  operator?: 'equals' | 'lessThan' | 'greaterThan' | 'contains' | 'exists';
}

export interface TransactionStep {
  name: string;
  action: 'navigate' | 'click' | 'fill' | 'wait' | 'assert';
  selector?: string;
  value?: string;
  timeout?: number;
}

export interface CheckResult {
  name: string;
  url: string;
  success: boolean;
  duration: number;
  timestamp: Date;
  location: string;
  error?: string;
  metrics?: {
    ttfb?: number;
    fcp?: number;
    lcp?: number;
    statusCode?: number;
  };
  steps?: StepResult[];
}

export interface StepResult {
  name: string;
  success: boolean;
  duration: number;
  error?: string;
}

export class SyntheticRunner {
  private browser: Browser | null = null;
  private location: string;

  constructor(location = 'local') {
    this.location = location;
  }

  async init() {
    this.browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
  }

  async close() {
    await this.browser?.close();
  }

  async runCheck(check: SyntheticCheck): Promise<CheckResult> {
    if (!this.browser) {
      throw new Error('Browser not initialized');
    }

    const startTime = Date.now();
    const result: CheckResult = {
      name: check.name,
      url: check.url,
      success: false,
      duration: 0,
      timestamp: new Date(),
      location: this.location,
    };

    const context = await this.browser.newContext();
    const page = await context.newPage();

    try {
      switch (check.type) {
        case 'availability':
          await this.runAvailabilityCheck(page, check, result);
          break;
        case 'performance':
          await this.runPerformanceCheck(page, check, result);
          break;
        case 'transaction':
          await this.runTransactionCheck(page, check, result);
          break;
      }

      result.success = true;
    } catch (error) {
      result.success = false;
      result.error = error instanceof Error ? error.message : 'Unknown error';
    } finally {
      result.duration = Date.now() - startTime;
      await context.close();
    }

    return result;
  }

  private async runAvailabilityCheck(
    page: Page,
    check: SyntheticCheck,
    result: CheckResult
  ) {
    const response = await page.goto(check.url, {
      timeout: check.timeout || 30000,
      waitUntil: 'domcontentloaded',
    });

    if (!response) {
      throw new Error('No response received');
    }

    result.metrics = {
      statusCode: response.status(),
    };

    // Check assertions
    if (check.assertions) {
      for (const assertion of check.assertions) {
        await this.checkAssertion(page, response, assertion);
      }
    }
  }

  private async runPerformanceCheck(
    page: Page,
    check: SyntheticCheck,
    result: CheckResult
  ) {
    // Enable performance metrics
    await page.goto(check.url, {
      timeout: check.timeout || 30000,
      waitUntil: 'networkidle',
    });

    // Get performance metrics
    const metrics = await page.evaluate(() => {
      const timing = performance.timing;
      const paint = performance.getEntriesByType('paint');
      const lcp = performance.getEntriesByType('largest-contentful-paint');

      return {
        ttfb: timing.responseStart - timing.requestStart,
        fcp: paint.find((p) => p.name === 'first-contentful-paint')?.startTime,
        lcp: lcp[lcp.length - 1]?.startTime,
        domComplete: timing.domComplete - timing.navigationStart,
        loadComplete: timing.loadEventEnd - timing.navigationStart,
      };
    });

    result.metrics = metrics;

    // Check performance thresholds
    if (check.assertions) {
      for (const assertion of check.assertions) {
        if (assertion.type === 'responseTime') {
          const metricName = assertion.expected as string;
          const threshold = assertion.operator === 'lessThan' 
            ? assertion.expected as number 
            : 3000;
          
          const actualValue = metrics[metricName as keyof typeof metrics];
          if (actualValue && actualValue > threshold) {
            throw new Error(
              `${metricName} (${actualValue}ms) exceeded threshold (${threshold}ms)`
            );
          }
        }
      }
    }
  }

  private async runTransactionCheck(
    page: Page,
    check: SyntheticCheck,
    result: CheckResult
  ) {
    if (!check.steps) {
      throw new Error('Transaction check requires steps');
    }

    result.steps = [];

    for (const step of check.steps) {
      const stepStart = Date.now();
      const stepResult: StepResult = {
        name: step.name,
        success: false,
        duration: 0,
      };

      try {
        await this.executeStep(page, step);
        stepResult.success = true;
      } catch (error) {
        stepResult.error = error instanceof Error ? error.message : 'Step failed';
        throw error;
      } finally {
        stepResult.duration = Date.now() - stepStart;
        result.steps.push(stepResult);
      }
    }
  }

  private async executeStep(page: Page, step: TransactionStep) {
    const timeout = step.timeout || 10000;

    switch (step.action) {
      case 'navigate':
        await page.goto(step.value!, { timeout, waitUntil: 'domcontentloaded' });
        break;
      case 'click':
        await page.click(step.selector!, { timeout });
        break;
      case 'fill':
        await page.fill(step.selector!, step.value!, { timeout });
        break;
      case 'wait':
        await page.waitForSelector(step.selector!, { timeout });
        break;
      case 'assert':
        const element = await page.$(step.selector!);
        if (!element) {
          throw new Error(`Element not found: ${step.selector}`);
        }
        if (step.value) {
          const text = await element.textContent();
          if (!text?.includes(step.value)) {
            throw new Error(`Expected "${step.value}" but found "${text}"`);
          }
        }
        break;
    }
  }

  private async checkAssertion(
    page: Page,
    response: any,
    assertion: CheckAssertion
  ) {
    switch (assertion.type) {
      case 'status':
        if (response.status() !== assertion.expected) {
          throw new Error(
            `Expected status ${assertion.expected} but got ${response.status()}`
          );
        }
        break;
      case 'content':
        const content = await page.content();
        if (!content.includes(assertion.expected as string)) {
          throw new Error(`Content does not contain "${assertion.expected}"`);
        }
        break;
      case 'element':
        const element = await page.$(assertion.expected as string);
        if (!element) {
          throw new Error(`Element not found: ${assertion.expected}`);
        }
        break;
    }
  }
}
```

### Synthetic Check Definitions

```typescript
// lib/monitoring/synthetic/checks.ts
import type { SyntheticCheck } from './runner';

export const syntheticChecks: SyntheticCheck[] = [
  // Homepage availability
  {
    name: 'Homepage Availability',
    url: process.env.NEXT_PUBLIC_APP_URL!,
    type: 'availability',
    assertions: [
      { type: 'status', expected: 200 },
      { type: 'element', expected: 'h1' },
    ],
  },

  // Homepage performance
  {
    name: 'Homepage Performance',
    url: process.env.NEXT_PUBLIC_APP_URL!,
    type: 'performance',
    assertions: [
      { type: 'responseTime', expected: 'lcp', operator: 'lessThan' },
    ],
  },

  // API health check
  {
    name: 'API Health',
    url: `${process.env.NEXT_PUBLIC_APP_URL}/api/health`,
    type: 'availability',
    assertions: [
      { type: 'status', expected: 200 },
      { type: 'content', expected: '"status":"healthy"' },
    ],
  },

  // Login flow transaction
  {
    name: 'Login Transaction',
    url: `${process.env.NEXT_PUBLIC_APP_URL}/login`,
    type: 'transaction',
    steps: [
      { name: 'Navigate to login', action: 'navigate', value: '/login' },
      { name: 'Wait for form', action: 'wait', selector: 'form' },
      { name: 'Enter email', action: 'fill', selector: '#email', value: 'test@example.com' },
      { name: 'Enter password', action: 'fill', selector: '#password', value: 'testpassword' },
      { name: 'Submit form', action: 'click', selector: 'button[type="submit"]' },
      { name: 'Verify redirect', action: 'wait', selector: '[data-testid="dashboard"]' },
    ],
  },

  // Search functionality
  {
    name: 'Search Transaction',
    url: process.env.NEXT_PUBLIC_APP_URL!,
    type: 'transaction',
    steps: [
      { name: 'Navigate to home', action: 'navigate', value: '/' },
      { name: 'Click search', action: 'click', selector: '[data-testid="search-button"]' },
      { name: 'Enter query', action: 'fill', selector: '[data-testid="search-input"]', value: 'test query' },
      { name: 'Submit search', action: 'click', selector: '[data-testid="search-submit"]' },
      { name: 'Verify results', action: 'wait', selector: '[data-testid="search-results"]' },
    ],
  },
];
```

### Scheduled Monitoring Job

```typescript
// lib/monitoring/synthetic/scheduler.ts
import { SyntheticRunner, type CheckResult } from './runner';
import { syntheticChecks } from './checks';

interface MonitoringConfig {
  interval: number; // ms
  locations: string[];
  alertWebhook?: string;
  resultsEndpoint?: string;
}

export class SyntheticMonitor {
  private config: MonitoringConfig;
  private runners: Map<string, SyntheticRunner> = new Map();
  private intervalId?: NodeJS.Timeout;

  constructor(config: MonitoringConfig) {
    this.config = config;
  }

  async start() {
    // Initialize runners for each location
    for (const location of this.config.locations) {
      const runner = new SyntheticRunner(location);
      await runner.init();
      this.runners.set(location, runner);
    }

    // Run immediately
    await this.runAllChecks();

    // Schedule periodic runs
    this.intervalId = setInterval(
      () => this.runAllChecks(),
      this.config.interval
    );

    console.log(`Synthetic monitoring started (interval: ${this.config.interval}ms)`);
  }

  async stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }

    for (const runner of this.runners.values()) {
      await runner.close();
    }
  }

  private async runAllChecks() {
    const results: CheckResult[] = [];

    for (const [location, runner] of this.runners) {
      for (const check of syntheticChecks) {
        try {
          const result = await runner.runCheck(check);
          results.push(result);

          // Send result
          await this.sendResult(result);

          // Alert on failure
          if (!result.success) {
            await this.sendAlert(result);
          }

          console.log(
            `[${location}] ${check.name}: ${result.success ? 'PASS' : 'FAIL'} (${result.duration}ms)`
          );
        } catch (error) {
          console.error(`[${location}] ${check.name}: ERROR`, error);
        }
      }
    }

    return results;
  }

  private async sendResult(result: CheckResult) {
    if (!this.config.resultsEndpoint) return;

    try {
      await fetch(this.config.resultsEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(result),
      });
    } catch (error) {
      console.error('Failed to send result:', error);
    }
  }

  private async sendAlert(result: CheckResult) {
    if (!this.config.alertWebhook) return;

    try {
      await fetch(this.config.alertWebhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: `🚨 Synthetic check failed: ${result.name}`,
          blocks: [
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: `*${result.name}* failed\n*URL:* ${result.url}\n*Location:* ${result.location}\n*Error:* ${result.error}`,
              },
            },
          ],
        }),
      });
    } catch (error) {
      console.error('Failed to send alert:', error);
    }
  }
}
```

### Lighthouse CI Integration

```typescript
// lib/monitoring/synthetic/lighthouse.ts
import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';

export interface LighthouseConfig {
  url: string;
  thresholds?: {
    performance?: number;
    accessibility?: number;
    bestPractices?: number;
    seo?: number;
  };
}

export interface LighthouseResult {
  url: string;
  timestamp: Date;
  scores: {
    performance: number;
    accessibility: number;
    bestPractices: number;
    seo: number;
  };
  metrics: {
    fcp: number;
    lcp: number;
    cls: number;
    tti: number;
    tbt: number;
    speedIndex: number;
  };
  passed: boolean;
  failures: string[];
}

export async function runLighthouse(
  config: LighthouseConfig
): Promise<LighthouseResult> {
  const chrome = await chromeLauncher.launch({
    chromeFlags: ['--headless', '--no-sandbox'],
  });

  try {
    const result = await lighthouse(config.url, {
      port: chrome.port,
      output: 'json',
      onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
    });

    if (!result?.lhr) {
      throw new Error('Lighthouse failed to generate report');
    }

    const { lhr } = result;
    const categories = lhr.categories;
    const audits = lhr.audits;

    const scores = {
      performance: (categories.performance?.score || 0) * 100,
      accessibility: (categories.accessibility?.score || 0) * 100,
      bestPractices: (categories['best-practices']?.score || 0) * 100,
      seo: (categories.seo?.score || 0) * 100,
    };

    const metrics = {
      fcp: audits['first-contentful-paint']?.numericValue || 0,
      lcp: audits['largest-contentful-paint']?.numericValue || 0,
      cls: audits['cumulative-layout-shift']?.numericValue || 0,
      tti: audits['interactive']?.numericValue || 0,
      tbt: audits['total-blocking-time']?.numericValue || 0,
      speedIndex: audits['speed-index']?.numericValue || 0,
    };

    // Check thresholds
    const failures: string[] = [];
    const thresholds = config.thresholds || {};

    if (thresholds.performance && scores.performance < thresholds.performance) {
      failures.push(`Performance: ${scores.performance} < ${thresholds.performance}`);
    }
    if (thresholds.accessibility && scores.accessibility < thresholds.accessibility) {
      failures.push(`Accessibility: ${scores.accessibility} < ${thresholds.accessibility}`);
    }
    if (thresholds.bestPractices && scores.bestPractices < thresholds.bestPractices) {
      failures.push(`Best Practices: ${scores.bestPractices} < ${thresholds.bestPractices}`);
    }
    if (thresholds.seo && scores.seo < thresholds.seo) {
      failures.push(`SEO: ${scores.seo} < ${thresholds.seo}`);
    }

    return {
      url: config.url,
      timestamp: new Date(),
      scores,
      metrics,
      passed: failures.length === 0,
      failures,
    };
  } finally {
    await chrome.kill();
  }
}
```

### GitHub Actions Synthetic Check

```yaml
# .github/workflows/synthetic-monitoring.yml
name: Synthetic Monitoring

on:
  schedule:
    - cron: '*/5 * * * *'  # Every 5 minutes
  workflow_dispatch:

jobs:
  synthetic-checks:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        location: [us-east, us-west, eu-west]
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Install Playwright browsers
        run: npx playwright install chromium
      
      - name: Run synthetic checks
        run: npx ts-node scripts/run-synthetic-checks.ts
        env:
          LOCATION: ${{ matrix.location }}
          APP_URL: ${{ secrets.APP_URL }}
          SLACK_WEBHOOK: ${{ secrets.SLACK_WEBHOOK }}
      
      - name: Upload results
        uses: actions/upload-artifact@v4
        with:
          name: synthetic-results-${{ matrix.location }}
          path: synthetic-results.json
```

## Variants

### Checkly Integration

```typescript
// Using Checkly for managed synthetic monitoring
import { Construct } from 'constructs';
import { ApiCheck, BrowserCheck } from 'checkly/constructs';

new ApiCheck('api-health', {
  name: 'API Health Check',
  request: {
    method: 'GET',
    url: 'https://api.example.com/health',
  },
  assertions: [
    { source: 'STATUS_CODE', comparison: 'EQUALS', target: '200' },
    { source: 'RESPONSE_TIME', comparison: 'LESS_THAN', target: '2000' },
  ],
});
```

## Anti-Patterns

```typescript
// Bad: Running checks too frequently from one location
setInterval(() => runCheck(), 1000); // Every second from same IP!

// Good: Distributed, reasonable intervals
// Run every 5 minutes from multiple locations

// Bad: Alerting on every failure
if (!result.success) sendAlert(result); // Alert fatigue!

// Good: Use alert thresholds
if (consecutiveFailures >= 3) sendAlert(result);
```

## Related Skills

- `observability` - Backend monitoring
- `testing-e2e` - E2E testing
- `alerting` - Alert management
- `rum` - Real User Monitoring

## Changelog

### 2.0.0 (2025-01-18)
- Standardized to atomic design system v2
- Updated frontmatter schema

- 1.0.0: Initial synthetic monitoring pattern
