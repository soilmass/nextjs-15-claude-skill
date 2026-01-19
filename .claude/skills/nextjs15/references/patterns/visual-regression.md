---
id: pt-visual-regression
name: Visual Regression
version: 2.0.0
layer: L5
category: testing
description: Visual regression testing using Playwright and Chromatic
tags: [testing, visual, regression]
composes: []
dependencies:
  playwright: "^1.49.0"
formula: "Playwright screenshots + Chromatic + thresholds = visual diff detection"
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# Visual Regression Testing Pattern

## Overview

Visual regression testing for Next.js 15 applications using Playwright and Chromatic. Captures screenshots to detect unintended visual changes across components and pages.

## When to Use

- **UI component changes**: Detect unintended style changes in buttons, cards, etc.
- **Theme updates**: Validate dark/light mode switching and color changes
- **Responsive design**: Capture screenshots at multiple breakpoints
- **CSS refactoring**: Ensure style changes don't break existing layouts
- **Font loading**: Verify fonts render correctly across browsers
- **Animation states**: Capture key frames of animated elements
- **Email templates**: Validate email rendering across clients

## Composition Diagram

```
+------------------+     +-------------------+     +------------------+
| Playwright       | --> | Screenshot        | --> | Diff Algorithm   |
| (browser control)|     | Capture           |     | (pixel compare)  |
+------------------+     +-------------------+     +------------------+
         |                        |                        |
         v                        v                        v
+------------------+     +-------------------+     +------------------+
| E2E Testing      |     | Chromatic         |     | Threshold        |
| Pattern          |     | (cloud service)   |     | Configuration    |
+------------------+     +-------------------+     +------------------+
         |                        |
         v                        v
+------------------+     +-------------------+
| Component Tests  |     | Accessibility     |
| (Storybook)      |     | (contrast check)  |
+------------------+     +-------------------+
```

## Implementation

### Playwright Visual Testing Setup

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/visual',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },

  // Configure snapshot settings
  expect: {
    toHaveScreenshot: {
      maxDiffPixels: 100,
      threshold: 0.2,
      animations: 'disabled',
    },
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 12'] },
    },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

### Page Visual Tests

```typescript
// tests/visual/pages.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Page Visual Regression', () => {
  test('homepage', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Wait for fonts and images
    await page.waitForTimeout(500);
    
    await expect(page).toHaveScreenshot('homepage.png', {
      fullPage: true,
    });
  });

  test('products page', async ({ page }) => {
    await page.goto('/products');
    await page.waitForLoadState('networkidle');
    
    // Wait for product images
    await page.waitForSelector('img[src*="product"]');
    
    await expect(page).toHaveScreenshot('products.png', {
      fullPage: true,
    });
  });

  test('product detail page', async ({ page }) => {
    await page.goto('/products/sample-product');
    await page.waitForLoadState('networkidle');
    
    await expect(page).toHaveScreenshot('product-detail.png');
  });

  test('checkout page', async ({ page }) => {
    // Setup cart state
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('cart', JSON.stringify([
        { id: '1', name: 'Product 1', price: 100, quantity: 2 },
      ]));
    });
    
    await page.goto('/checkout');
    await page.waitForLoadState('networkidle');
    
    await expect(page).toHaveScreenshot('checkout.png');
  });
});
```

### Component Visual Tests

```typescript
// tests/visual/components.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Component Visual Regression', () => {
  test('button variants', async ({ page }) => {
    await page.goto('/storybook/iframe.html?id=components-button--all-variants');
    await page.waitForLoadState('networkidle');
    
    await expect(page.locator('#storybook-root')).toHaveScreenshot('button-variants.png');
  });

  test('form states', async ({ page }) => {
    await page.goto('/storybook/iframe.html?id=components-form--with-validation');
    
    // Trigger validation
    await page.click('button[type="submit"]');
    await page.waitForTimeout(100);
    
    await expect(page.locator('#storybook-root')).toHaveScreenshot('form-validation.png');
  });

  test('card component', async ({ page }) => {
    await page.goto('/storybook/iframe.html?id=components-card--default');
    
    await expect(page.locator('#storybook-root')).toHaveScreenshot('card.png');
  });

  test('modal open state', async ({ page }) => {
    await page.goto('/storybook/iframe.html?id=components-modal--default');
    
    await page.click('button:has-text("Open Modal")');
    await page.waitForSelector('[role="dialog"]');
    
    await expect(page).toHaveScreenshot('modal-open.png');
  });
});
```

### Responsive Visual Tests

```typescript
// tests/visual/responsive.spec.ts
import { test, expect } from '@playwright/test';

const viewports = [
  { name: 'mobile', width: 375, height: 667 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1280, height: 720 },
  { name: 'wide', width: 1920, height: 1080 },
];

test.describe('Responsive Visual Tests', () => {
  for (const viewport of viewports) {
    test(`homepage at ${viewport.name}`, async ({ page }) => {
      await page.setViewportSize({ 
        width: viewport.width, 
        height: viewport.height 
      });
      
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      await expect(page).toHaveScreenshot(`homepage-${viewport.name}.png`, {
        fullPage: true,
      });
    });

    test(`navigation at ${viewport.name}`, async ({ page }) => {
      await page.setViewportSize({ 
        width: viewport.width, 
        height: viewport.height 
      });
      
      await page.goto('/');
      
      // Open mobile menu if on mobile
      if (viewport.width < 768) {
        await page.click('[data-testid="mobile-menu-button"]');
        await page.waitForSelector('[data-testid="mobile-menu"]');
      }
      
      await expect(page.locator('header')).toHaveScreenshot(
        `navigation-${viewport.name}.png`
      );
    });
  }
});
```

### Dark Mode Visual Tests

```typescript
// tests/visual/dark-mode.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Dark Mode Visual Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Enable dark mode
    await page.emulateMedia({ colorScheme: 'dark' });
  });

  test('homepage dark mode', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    await expect(page).toHaveScreenshot('homepage-dark.png', {
      fullPage: true,
    });
  });

  test('components dark mode', async ({ page }) => {
    await page.goto('/storybook/iframe.html?id=components-button--all-variants');
    
    await expect(page.locator('#storybook-root')).toHaveScreenshot(
      'button-variants-dark.png'
    );
  });

  test('toggle dark mode', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' });
    await page.goto('/');
    
    // Light mode screenshot
    await expect(page.locator('main')).toHaveScreenshot('main-light.png');
    
    // Toggle to dark mode
    await page.click('[data-testid="theme-toggle"]');
    await page.waitForTimeout(300); // Wait for transition
    
    // Dark mode screenshot
    await expect(page.locator('main')).toHaveScreenshot('main-dark.png');
  });
});
```

### Chromatic Integration

```typescript
// .storybook/main.ts
import type { StorybookConfig } from '@storybook/nextjs';

const config: StorybookConfig = {
  stories: ['../components/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@chromatic-com/storybook',
  ],
  framework: {
    name: '@storybook/nextjs',
    options: {},
  },
};

export default config;
```

```yaml
# .github/workflows/chromatic.yml
name: Chromatic

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  chromatic:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - run: npm ci

      - name: Publish to Chromatic
        uses: chromaui/action@latest
        with:
          projectToken: ${{ secrets.CHROMATIC_PROJECT_TOKEN }}
          buildScriptName: build-storybook
          autoAcceptChanges: main
          exitOnceUploaded: true
```

### Visual Test Utilities

```typescript
// tests/visual/utils.ts
import { Page, expect } from '@playwright/test';

export async function waitForStableScreen(page: Page): Promise<void> {
  // Wait for network idle
  await page.waitForLoadState('networkidle');
  
  // Wait for fonts
  await page.evaluate(() => document.fonts.ready);
  
  // Wait for images
  await page.waitForFunction(() => {
    const images = Array.from(document.images);
    return images.every((img) => img.complete);
  });
  
  // Wait for animations
  await page.waitForTimeout(500);
}

export async function hideElements(
  page: Page, 
  selectors: string[]
): Promise<void> {
  for (const selector of selectors) {
    await page.addStyleTag({
      content: `${selector} { visibility: hidden !important; }`,
    });
  }
}

export async function takeScreenshotWithMask(
  page: Page,
  name: string,
  masks: string[]
): Promise<void> {
  const maskLocators = masks.map((m) => page.locator(m));
  
  await expect(page).toHaveScreenshot(name, {
    mask: maskLocators,
  });
}

// Usage
test('page with dynamic content', async ({ page }) => {
  await page.goto('/dashboard');
  await waitForStableScreen(page);
  
  // Mask dynamic content
  await takeScreenshotWithMask(page, 'dashboard.png', [
    '[data-testid="timestamp"]',
    '[data-testid="user-avatar"]',
    '.random-content',
  ]);
});
```

### Animation Handling

```typescript
// tests/visual/animations.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Animation Visual Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Disable CSS animations
    await page.addStyleTag({
      content: `
        *, *::before, *::after {
          animation-duration: 0s !important;
          animation-delay: 0s !important;
          transition-duration: 0s !important;
          transition-delay: 0s !important;
        }
      `,
    });
  });

  test('loading spinner', async ({ page }) => {
    await page.goto('/loading-demo');
    
    await expect(page.locator('[data-testid="spinner"]')).toHaveScreenshot(
      'spinner.png'
    );
  });

  test('skeleton screens', async ({ page }) => {
    // Block API to keep skeleton visible
    await page.route('/api/**', (route) => route.abort());
    
    await page.goto('/products');
    
    await expect(page.locator('[data-testid="product-grid"]')).toHaveScreenshot(
      'product-skeleton.png'
    );
  });
});
```

### CI/CD Integration

```yaml
# .github/workflows/visual-tests.yml
name: Visual Regression Tests

on:
  pull_request:
    branches: [main]

jobs:
  visual-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - run: npm ci

      - name: Install Playwright Browsers
        run: npx playwright install --with-deps

      - name: Build application
        run: npm run build

      - name: Run visual tests
        run: npx playwright test tests/visual/
        env:
          CI: true

      - name: Upload test results
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30

      - name: Upload screenshots
        uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: screenshots-diff
          path: tests/visual/**/*-diff.png
          retention-days: 7
```

### Visual Test for Email Templates

```typescript
// tests/visual/emails.spec.ts
import { test, expect } from '@playwright/test';
import { render } from '@react-email/render';
import { WelcomeEmail } from '@/emails/welcome';

test.describe('Email Template Visual Tests', () => {
  test('welcome email', async ({ page }) => {
    const html = render(
      WelcomeEmail({ 
        name: 'John Doe',
        actionUrl: 'https://example.com/verify',
      })
    );

    await page.setContent(html);
    
    await expect(page).toHaveScreenshot('email-welcome.png', {
      fullPage: true,
    });
  });

  test('welcome email mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    const html = render(
      WelcomeEmail({ 
        name: 'John Doe',
        actionUrl: 'https://example.com/verify',
      })
    );

    await page.setContent(html);
    
    await expect(page).toHaveScreenshot('email-welcome-mobile.png', {
      fullPage: true,
    });
  });
});
```

## Variants

### With Percy Integration

```typescript
// tests/visual/percy.spec.ts
import { test } from '@playwright/test';
import percySnapshot from '@percy/playwright';

test('homepage', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  
  await percySnapshot(page, 'Homepage');
});

test.describe('responsive', () => {
  const widths = [375, 768, 1280];
  
  test('homepage responsive', async ({ page }) => {
    await page.goto('/');
    
    await percySnapshot(page, 'Homepage Responsive', {
      widths,
    });
  });
});
```

### With Argos CI

```typescript
// tests/visual/argos.spec.ts
import { test } from '@playwright/test';
import { argosScreenshot } from '@argos-ci/playwright';

test('homepage', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  
  await argosScreenshot(page, 'homepage');
});
```

## Anti-patterns

```typescript
// BAD: Not waiting for content
await page.goto('/');
await expect(page).toHaveScreenshot(); // Flaky - content might not be loaded!

// GOOD: Wait for stable state
await page.goto('/');
await page.waitForLoadState('networkidle');
await page.waitForTimeout(500);
await expect(page).toHaveScreenshot();

// BAD: Testing with live data
await page.goto('/users'); // Random avatars, names

// GOOD: Use consistent test data
await page.route('/api/users', (route) => route.fulfill({
  body: JSON.stringify([
    { id: '1', name: 'John Doe', avatar: '/test-avatar.png' }
  ])
}));

// BAD: Too strict comparison
expect: { toHaveScreenshot: { maxDiffPixels: 0 } } // Will fail on anti-aliasing

// GOOD: Allow reasonable threshold
expect: { toHaveScreenshot: { maxDiffPixels: 100, threshold: 0.2 } }
```

## Related Patterns

- `snapshot-testing.md` - DOM snapshots
- `testing-e2e.md` - E2E testing
- `accessibility-testing.md` - A11y testing
- `testing-components.md` - Component tests

## Changelog

### 2.0.0 (2025-01-18)
- Standardized to atomic design system v2
- Updated frontmatter schema

- 2024-01-15: Initial visual regression testing pattern
