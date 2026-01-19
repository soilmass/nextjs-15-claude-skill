---
id: pt-testing-e2e
name: End-to-End Testing
version: 2.0.0
layer: L5
category: testing
description: E2E testing with Playwright for full user journey verification
tags: [testing, e2e, playwright, integration, next15]
composes: []
dependencies:
  playwright: "^1.49.0"
formula: "Playwright + fixtures + assertions = full user journey validation"
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# End-to-End Testing

## Overview

End-to-end (E2E) testing verifies complete user workflows from start to finish. Playwright provides cross-browser testing with powerful automation capabilities for Next.js 15 applications.

## When to Use

- **Critical user flows**: Test checkout, registration, and login workflows
- **Cross-browser testing**: Validate behavior in Chrome, Firefox, and Safari
- **Mobile testing**: Test responsive behavior and touch interactions
- **Visual regression**: Capture screenshots to detect UI changes
- **API testing**: Validate backend responses alongside UI
- **Performance checks**: Measure page load times and Core Web Vitals
- **Pre-deployment**: Run full E2E suite before production releases

## Composition Diagram

```
+------------------+     +-------------------+     +------------------+
| Playwright Test  | --> | Browser Context   | --> | Page Interactions|
| (test runner)    |     | (Chrome/FF/Safari)|     | (click, type)    |
+------------------+     +-------------------+     +------------------+
         |                        |                        |
         v                        v                        v
+------------------+     +-------------------+     +------------------+
| Test Fixtures    |     | Visual Regression |     | Accessibility    |
| (auth, data)     |     | (screenshots)     |     | (axe-core)       |
+------------------+     +-------------------+     +------------------+
         |                        |
         v                        v
+------------------+     +-------------------+
| Performance Test |     | API Testing       |
| (Web Vitals)     |     | (request API)     |
+------------------+     +-------------------+
```

## Setup

```typescript
// playwright.config.ts
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
    },
    {
      name: "Mobile Chrome",
      use: { ...devices["Pixel 5"] },
    },
    {
      name: "Mobile Safari",
      use: { ...devices["iPhone 12"] },
    },
  ],

  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
  },
});
```

## Basic Navigation Test

```typescript
// e2e/navigation.spec.ts
import { test, expect } from "@playwright/test";

test.describe("Navigation", () => {
  test("should navigate to home page", async ({ page }) => {
    await page.goto("/");
    
    await expect(page).toHaveTitle(/Acme Inc/);
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Welcome");
  });

  test("should navigate between pages", async ({ page }) => {
    await page.goto("/");
    
    // Click on About link
    await page.getByRole("link", { name: "About" }).click();
    await expect(page).toHaveURL("/about");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("About");

    // Click on Products link
    await page.getByRole("link", { name: "Products" }).click();
    await expect(page).toHaveURL("/products");
  });

  test("should handle 404 pages", async ({ page }) => {
    await page.goto("/non-existent-page");
    
    await expect(page.getByText("Page not found")).toBeVisible();
    await expect(page.getByRole("link", { name: "Go home" })).toBeVisible();
  });
});
```

## Authentication Flow

```typescript
// e2e/auth.spec.ts
import { test, expect } from "@playwright/test";

test.describe("Authentication", () => {
  test("should show login form", async ({ page }) => {
    await page.goto("/login");
    
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByLabel("Password")).toBeVisible();
    await expect(page.getByRole("button", { name: "Sign in" })).toBeVisible();
  });

  test("should show validation errors", async ({ page }) => {
    await page.goto("/login");
    
    // Submit empty form
    await page.getByRole("button", { name: "Sign in" }).click();
    
    await expect(page.getByText("Email is required")).toBeVisible();
    await expect(page.getByText("Password is required")).toBeVisible();
  });

  test("should login successfully", async ({ page }) => {
    await page.goto("/login");
    
    await page.getByLabel("Email").fill("test@example.com");
    await page.getByLabel("Password").fill("password123");
    await page.getByRole("button", { name: "Sign in" }).click();
    
    // Should redirect to dashboard
    await expect(page).toHaveURL("/dashboard");
    await expect(page.getByText("Welcome back")).toBeVisible();
  });

  test("should show error for invalid credentials", async ({ page }) => {
    await page.goto("/login");
    
    await page.getByLabel("Email").fill("test@example.com");
    await page.getByLabel("Password").fill("wrongpassword");
    await page.getByRole("button", { name: "Sign in" }).click();
    
    await expect(page.getByText("Invalid credentials")).toBeVisible();
    await expect(page).toHaveURL("/login");
  });

  test("should logout successfully", async ({ page }) => {
    // Login first
    await page.goto("/login");
    await page.getByLabel("Email").fill("test@example.com");
    await page.getByLabel("Password").fill("password123");
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page).toHaveURL("/dashboard");
    
    // Logout
    await page.getByRole("button", { name: "User menu" }).click();
    await page.getByRole("menuitem", { name: "Sign out" }).click();
    
    await expect(page).toHaveURL("/");
  });
});
```

## E-Commerce Flow

```typescript
// e2e/checkout.spec.ts
import { test, expect } from "@playwright/test";

test.describe("E-Commerce Checkout", () => {
  test("complete purchase flow", async ({ page }) => {
    // Browse products
    await page.goto("/products");
    await expect(page.getByRole("heading", { name: "Products" })).toBeVisible();

    // Click on a product
    await page.getByRole("link", { name: "Premium Widget" }).click();
    await expect(page).toHaveURL(/\/products\/.+/);

    // Add to cart
    await page.getByRole("button", { name: "Add to Cart" }).click();
    await expect(page.getByText("Added to cart")).toBeVisible();

    // Go to cart
    await page.getByRole("link", { name: /Cart/ }).click();
    await expect(page).toHaveURL("/cart");
    await expect(page.getByText("Premium Widget")).toBeVisible();

    // Update quantity
    await page.getByRole("button", { name: "Increase quantity" }).click();
    await expect(page.getByText("Quantity: 2")).toBeVisible();

    // Proceed to checkout
    await page.getByRole("link", { name: "Checkout" }).click();
    await expect(page).toHaveURL("/checkout");

    // Fill shipping info
    await page.getByLabel("Email").fill("buyer@example.com");
    await page.getByLabel("First name").fill("John");
    await page.getByLabel("Last name").fill("Doe");
    await page.getByLabel("Address").fill("123 Main St");
    await page.getByLabel("City").fill("New York");
    await page.getByLabel("ZIP").fill("10001");
    await page.getByRole("button", { name: "Continue to Payment" }).click();

    // Fill payment (Stripe test card)
    const stripeFrame = page.frameLocator('iframe[name*="stripe"]').first();
    await stripeFrame.getByPlaceholder("Card number").fill("4242424242424242");
    await stripeFrame.getByPlaceholder("MM / YY").fill("12/30");
    await stripeFrame.getByPlaceholder("CVC").fill("123");

    // Place order
    await page.getByRole("button", { name: "Place Order" }).click();

    // Confirm success
    await expect(page).toHaveURL(/\/checkout\/success/);
    await expect(page.getByText("Order confirmed")).toBeVisible();
  });
});
```

## Authenticated Tests with Fixtures

```typescript
// e2e/fixtures.ts
import { test as base } from "@playwright/test";

// Extend base test with authenticated user
export const test = base.extend<{ authenticatedPage: Page }>({
  authenticatedPage: async ({ page }, use) => {
    // Login before test
    await page.goto("/login");
    await page.getByLabel("Email").fill("test@example.com");
    await page.getByLabel("Password").fill("password123");
    await page.getByRole("button", { name: "Sign in" }).click();
    await page.waitForURL("/dashboard");
    
    await use(page);
  },
});

export { expect } from "@playwright/test";

// e2e/dashboard.spec.ts
import { test, expect } from "./fixtures";

test.describe("Dashboard", () => {
  test("should display user stats", async ({ authenticatedPage }) => {
    await authenticatedPage.goto("/dashboard");
    
    await expect(authenticatedPage.getByText("Total Revenue")).toBeVisible();
    await expect(authenticatedPage.getByText("Orders")).toBeVisible();
  });

  test("should allow updating profile", async ({ authenticatedPage }) => {
    await authenticatedPage.goto("/dashboard/settings");
    
    await authenticatedPage.getByLabel("Name").fill("New Name");
    await authenticatedPage.getByRole("button", { name: "Save" }).click();
    
    await expect(authenticatedPage.getByText("Profile updated")).toBeVisible();
  });
});
```

## Visual Regression Testing

```typescript
// e2e/visual.spec.ts
import { test, expect } from "@playwright/test";

test.describe("Visual Regression", () => {
  test("home page matches snapshot", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveScreenshot("home.png");
  });

  test("pricing page matches snapshot", async ({ page }) => {
    await page.goto("/pricing");
    await expect(page).toHaveScreenshot("pricing.png", {
      fullPage: true,
    });
  });

  test("component states", async ({ page }) => {
    await page.goto("/components");
    
    // Normal button
    const button = page.getByRole("button", { name: "Click me" });
    await expect(button).toHaveScreenshot("button-default.png");
    
    // Hover state
    await button.hover();
    await expect(button).toHaveScreenshot("button-hover.png");
    
    // Focus state
    await button.focus();
    await expect(button).toHaveScreenshot("button-focus.png");
  });
});
```

## API Testing

```typescript
// e2e/api.spec.ts
import { test, expect } from "@playwright/test";

test.describe("API Endpoints", () => {
  test("GET /api/products returns products", async ({ request }) => {
    const response = await request.get("/api/products");
    
    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);
    
    const products = await response.json();
    expect(Array.isArray(products)).toBeTruthy();
    expect(products.length).toBeGreaterThan(0);
    expect(products[0]).toHaveProperty("id");
    expect(products[0]).toHaveProperty("name");
  });

  test("POST /api/products requires auth", async ({ request }) => {
    const response = await request.post("/api/products", {
      data: { name: "Test Product" },
    });
    
    expect(response.status()).toBe(401);
  });

  test("POST /api/products creates product", async ({ request }) => {
    // Get auth token first
    const loginResponse = await request.post("/api/auth/login", {
      data: { email: "admin@example.com", password: "admin123" },
    });
    const { token } = await loginResponse.json();

    const response = await request.post("/api/products", {
      headers: { Authorization: `Bearer ${token}` },
      data: { name: "New Product", price: 99.99 },
    });
    
    expect(response.status()).toBe(201);
    const product = await response.json();
    expect(product.name).toBe("New Product");
  });
});
```

## Mobile Testing

```typescript
// e2e/mobile.spec.ts
import { test, expect, devices } from "@playwright/test";

test.describe("Mobile Experience", () => {
  test.use({ ...devices["iPhone 12"] });

  test("should show mobile menu", async ({ page }) => {
    await page.goto("/");
    
    // Desktop nav should be hidden
    await expect(page.getByRole("navigation").getByRole("link", { name: "Products" })).not.toBeVisible();
    
    // Mobile menu button should be visible
    const menuButton = page.getByRole("button", { name: "Menu" });
    await expect(menuButton).toBeVisible();
    
    // Open mobile menu
    await menuButton.click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.getByRole("link", { name: "Products" })).toBeVisible();
  });

  test("should handle touch gestures", async ({ page }) => {
    await page.goto("/products");
    
    // Swipe on product carousel
    const carousel = page.getByTestId("product-carousel");
    await carousel.evaluate((el) => {
      el.dispatchEvent(new TouchEvent("touchstart", {
        touches: [{ clientX: 300, clientY: 200 }],
      }));
      el.dispatchEvent(new TouchEvent("touchend", {
        changedTouches: [{ clientX: 100, clientY: 200 }],
      }));
    });
  });
});
```

## Performance Testing

```typescript
// e2e/performance.spec.ts
import { test, expect } from "@playwright/test";

test.describe("Performance", () => {
  test("home page loads within threshold", async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    
    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(3000); // 3 seconds max
  });

  test("core web vitals", async ({ page }) => {
    await page.goto("/");
    
    const metrics = await page.evaluate(() => {
      return new Promise((resolve) => {
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          resolve({
            lcp: entries.find((e) => e.entryType === "largest-contentful-paint")?.startTime,
            fid: entries.find((e) => e.entryType === "first-input")?.processingStart,
            cls: entries.find((e) => e.entryType === "layout-shift")?.value,
          });
        }).observe({ type: "largest-contentful-paint", buffered: true });
      });
    });

    console.log("Core Web Vitals:", metrics);
  });
});
```

## Anti-patterns

### Don't Use Fixed Waits

```typescript
// BAD - Fixed waits are flaky
await page.waitForTimeout(2000);

// GOOD - Wait for specific conditions
await page.waitForSelector("[data-loaded='true']");
await expect(page.getByText("Loaded")).toBeVisible();
```

### Don't Test Third-Party Services

```typescript
// BAD - Testing real Stripe
await page.goto("https://checkout.stripe.com");

// GOOD - Mock or use test mode
await page.route("**/api/create-payment", (route) =>
  route.fulfill({ body: JSON.stringify({ clientSecret: "test_secret" }) })
);
```

## Related Skills

- [testing-unit](./testing-unit.md)
- [testing-integration](./testing-integration.md)
- [ci-cd](./ci-cd.md)

---

## Changelog

### 2.0.0 (2025-01-18)
- Standardized to atomic design system v2
- Updated frontmatter schema

### 1.0.0 (2025-01-16)
- Initial implementation
- Playwright setup
- Auth fixtures
- Visual testing
