---
id: pt-accessibility-testing
name: Accessibility Testing
version: 2.0.0
layer: L5
category: testing
description: Automated accessibility testing for Next.js 15 applications using axe-core, Playwright, and manual testing practices
tags: [accessibility, testing, axe-core, playwright, wcag]
composes: []
dependencies: []
formula: "axe-core + Playwright + jest-axe = WCAG compliance validation"
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: AAA
  keyboard: true
  screen-reader: true
---

# Accessibility Testing Pattern

## Overview

Automated accessibility testing for Next.js 15 applications using axe-core, Playwright, and manual testing practices. Ensures WCAG 2.1 compliance and inclusive user experiences.

## When to Use

- **Component development**: Validate ARIA attributes and keyboard accessibility on UI components
- **Form validation**: Ensure error messages are announced and inputs have proper labels
- **Navigation menus**: Test keyboard navigation and focus management
- **Modal/dialog components**: Verify focus trapping and escape key handling
- **Dynamic content**: Test live regions and screen reader announcements
- **Color themes**: Validate contrast ratios across light/dark modes
- **CI/CD pipelines**: Automate accessibility checks before deployment

## Composition Diagram

```
+------------------+     +-------------------+     +------------------+
|  Component Tests | --> | axe-core Scanner  | --> | Violation Report |
|  (jest-axe)      |     | (WCAG rules)      |     |                  |
+------------------+     +-------------------+     +------------------+
         |                        |
         v                        v
+------------------+     +-------------------+
| Focus Management | --> | Keyboard Nav Tests|
| Pattern          |     | (Playwright)      |
+------------------+     +-------------------+
         |                        |
         v                        v
+------------------+     +-------------------+
| Visual Regression| --> | E2E Testing       |
| (screenshots)    |     | (full page scan)  |
+------------------+     +-------------------+
```

## Implementation

### Jest + axe-core Setup

```typescript
// jest.setup.ts
import '@testing-library/jest-dom';
import { toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);
```

```typescript
// test/a11y-utils.ts
import { axe, toHaveNoViolations } from 'jest-axe';
import { render, RenderResult } from '@testing-library/react';

expect.extend(toHaveNoViolations);

export async function checkA11y(
  ui: React.ReactElement,
  options?: Parameters<typeof axe>[1]
): Promise<void> {
  const { container } = render(ui);
  const results = await axe(container, options);
  expect(results).toHaveNoViolations();
}

export async function checkContainerA11y(
  container: HTMLElement,
  options?: Parameters<typeof axe>[1]
): Promise<void> {
  const results = await axe(container, options);
  expect(results).toHaveNoViolations();
}
```

### Component Accessibility Tests

```typescript
// components/__tests__/button.a11y.test.tsx
import { render } from '@testing-library/react';
import { axe } from 'jest-axe';
import { Button } from '../ui/button';

describe('Button Accessibility', () => {
  it('has no accessibility violations', async () => {
    const { container } = render(<Button>Click me</Button>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('has no violations with icon only', async () => {
    const { container } = render(
      <Button aria-label="Add item">
        <PlusIcon />
      </Button>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('has no violations when disabled', async () => {
    const { container } = render(<Button disabled>Disabled</Button>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('has no violations for link button', async () => {
    const { container } = render(
      <Button asChild>
        <a href="/page">Link Button</a>
      </Button>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
```

### Form Accessibility Tests

```typescript
// components/__tests__/form.a11y.test.tsx
import { render } from '@testing-library/react';
import { axe } from 'jest-axe';
import { useForm } from 'react-hook-form';
import { 
  Form, FormField, FormItem, FormLabel, 
  FormControl, FormDescription, FormMessage 
} from '../ui/form';
import { Input } from '../ui/input';

const TestForm = () => {
  const form = useForm({
    defaultValues: { email: '', password: '' },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(() => {})}>
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" {...field} />
              </FormControl>
              <FormDescription>
                We'll never share your email.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
};

describe('Form Accessibility', () => {
  it('has no accessibility violations', async () => {
    const { container } = render(<TestForm />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('associates labels with inputs', () => {
    const { getByLabelText } = render(<TestForm />);
    
    expect(getByLabelText('Email')).toBeInTheDocument();
    expect(getByLabelText('Password')).toBeInTheDocument();
  });

  it('has accessible error messages', async () => {
    const form = useForm({
      defaultValues: { email: '' },
    });
    form.setError('email', { message: 'Email is required' });

    const { container, getByRole } = render(
      <Form {...form}>
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input {...field} aria-invalid={!!form.formState.errors.email} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </Form>
    );

    const input = getByRole('textbox');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
```

### Playwright Accessibility Tests

```typescript
// tests/a11y/pages.spec.ts
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Page Accessibility', () => {
  test('homepage has no critical violations', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('products page has no violations', async ({ page }) => {
    await page.goto('/products');
    await page.waitForLoadState('networkidle');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .exclude('.advertisement') // Exclude third-party content
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('checkout flow is accessible', async ({ page }) => {
    await page.goto('/checkout');

    // Test each step
    const steps = ['cart', 'shipping', 'payment', 'review'];
    
    for (const step of steps) {
      await page.waitForSelector(`[data-step="${step}"]`);
      
      const results = await new AxeBuilder({ page }).analyze();
      
      expect(
        results.violations,
        `Step "${step}" has violations`
      ).toEqual([]);

      const nextButton = page.locator('button:has-text("Next")');
      if (await nextButton.isVisible()) {
        await nextButton.click();
      }
    }
  });
});
```

### Keyboard Navigation Tests

```typescript
// tests/a11y/keyboard.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Keyboard Navigation', () => {
  test('can navigate header with keyboard', async ({ page }) => {
    await page.goto('/');

    // Start from body
    await page.keyboard.press('Tab');
    
    // Should focus skip link first
    const skipLink = page.locator('[data-testid="skip-link"]');
    await expect(skipLink).toBeFocused();

    // Tab to logo/home link
    await page.keyboard.press('Tab');
    const logo = page.locator('header a').first();
    await expect(logo).toBeFocused();

    // Navigate through main menu items
    const menuItems = page.locator('nav[aria-label="Main"] a');
    const count = await menuItems.count();
    
    for (let i = 0; i < count; i++) {
      await page.keyboard.press('Tab');
      await expect(menuItems.nth(i)).toBeFocused();
    }
  });

  test('modal traps focus', async ({ page }) => {
    await page.goto('/');
    
    // Open modal
    await page.click('[data-testid="open-modal"]');
    await page.waitForSelector('[role="dialog"]');

    // First tab should focus first focusable element in modal
    await page.keyboard.press('Tab');
    const closeButton = page.locator('[role="dialog"] button').first();
    await expect(closeButton).toBeFocused();

    // Tab through modal elements
    const focusableElements = page.locator(
      '[role="dialog"] button, [role="dialog"] a, [role="dialog"] input'
    );
    const count = await focusableElements.count();

    // Cycle through modal focus
    for (let i = 0; i < count + 1; i++) {
      await page.keyboard.press('Tab');
    }

    // Should wrap back to first element
    await expect(focusableElements.first()).toBeFocused();

    // Escape should close modal
    await page.keyboard.press('Escape');
    await expect(page.locator('[role="dialog"]')).not.toBeVisible();
  });

  test('dropdown menu keyboard support', async ({ page }) => {
    await page.goto('/');
    
    // Focus dropdown trigger
    const trigger = page.locator('[data-testid="dropdown-trigger"]');
    await trigger.focus();

    // Enter opens dropdown
    await page.keyboard.press('Enter');
    await expect(page.locator('[role="menu"]')).toBeVisible();

    // Arrow down navigates
    await page.keyboard.press('ArrowDown');
    const firstItem = page.locator('[role="menuitem"]').first();
    await expect(firstItem).toBeFocused();

    // Arrow down to next item
    await page.keyboard.press('ArrowDown');
    const secondItem = page.locator('[role="menuitem"]').nth(1);
    await expect(secondItem).toBeFocused();

    // Escape closes
    await page.keyboard.press('Escape');
    await expect(page.locator('[role="menu"]')).not.toBeVisible();
  });
});
```

### Screen Reader Testing

```typescript
// tests/a11y/screen-reader.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Screen Reader Accessibility', () => {
  test('images have alt text', async ({ page }) => {
    await page.goto('/products');

    const images = page.locator('img');
    const count = await images.count();

    for (let i = 0; i < count; i++) {
      const img = images.nth(i);
      const alt = await img.getAttribute('alt');
      const role = await img.getAttribute('role');

      // Either has alt text or is decorative (role="presentation")
      expect(
        alt !== null || role === 'presentation',
        `Image ${i} missing alt text`
      ).toBe(true);
    }
  });

  test('headings are in logical order', async ({ page }) => {
    await page.goto('/');

    const headings = await page.evaluate(() => {
      const headingElements = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
      return Array.from(headingElements).map((h) => ({
        level: parseInt(h.tagName[1]),
        text: h.textContent?.trim(),
      }));
    });

    // Check heading hierarchy
    let previousLevel = 0;
    for (const heading of headings) {
      // Heading level should not skip (e.g., h1 -> h3)
      expect(
        heading.level <= previousLevel + 1,
        `Heading "${heading.text}" skips level (${previousLevel} -> ${heading.level})`
      ).toBe(true);
      previousLevel = heading.level;
    }

    // Should have exactly one h1
    const h1Count = headings.filter((h) => h.level === 1).length;
    expect(h1Count).toBe(1);
  });

  test('links have descriptive text', async ({ page }) => {
    await page.goto('/');

    const links = page.locator('a');
    const count = await links.count();

    for (let i = 0; i < count; i++) {
      const link = links.nth(i);
      const text = await link.textContent();
      const ariaLabel = await link.getAttribute('aria-label');
      const title = await link.getAttribute('title');
      
      const hasDescriptiveText = 
        (text && text.trim().length > 0 && !['click here', 'read more', 'learn more'].includes(text.toLowerCase().trim())) ||
        ariaLabel ||
        title;

      expect(
        hasDescriptiveText,
        `Link ${i} has non-descriptive text: "${text}"`
      ).toBeTruthy();
    }
  });

  test('form inputs have labels', async ({ page }) => {
    await page.goto('/contact');

    const inputs = page.locator('input, textarea, select');
    const count = await inputs.count();

    for (let i = 0; i < count; i++) {
      const input = inputs.nth(i);
      const id = await input.getAttribute('id');
      const ariaLabel = await input.getAttribute('aria-label');
      const ariaLabelledby = await input.getAttribute('aria-labelledby');
      const type = await input.getAttribute('type');

      // Skip hidden inputs
      if (type === 'hidden') continue;

      const hasLabel = 
        ariaLabel ||
        ariaLabelledby ||
        (id && await page.locator(`label[for="${id}"]`).count() > 0);

      expect(
        hasLabel,
        `Input ${i} (type: ${type}, id: ${id}) has no label`
      ).toBe(true);
    }
  });
});
```

### Color Contrast Tests

```typescript
// tests/a11y/contrast.spec.ts
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Color Contrast', () => {
  test('text has sufficient contrast', async ({ page }) => {
    await page.goto('/');

    const results = await new AxeBuilder({ page })
      .withRules(['color-contrast'])
      .analyze();

    expect(results.violations).toEqual([]);
  });

  test('links are distinguishable', async ({ page }) => {
    await page.goto('/');

    // Check that links have underline or sufficient contrast difference
    const links = page.locator('p a, li a');
    const count = await links.count();

    for (let i = 0; i < count; i++) {
      const link = links.nth(i);
      const textDecoration = await link.evaluate(
        (el) => window.getComputedStyle(el).textDecoration
      );
      
      const hasUnderline = textDecoration.includes('underline');
      
      if (!hasUnderline) {
        // Should have 3:1 contrast ratio with surrounding text
        // This is a simplified check - full check requires color analysis
        const fontWeight = await link.evaluate(
          (el) => window.getComputedStyle(el).fontWeight
        );
        expect(
          parseInt(fontWeight) >= 700,
          `Link ${i} needs underline or bold text`
        ).toBe(true);
      }
    }
  });

  test('focus indicators are visible', async ({ page }) => {
    await page.goto('/');

    const buttons = page.locator('button, a, input');
    const count = await buttons.count();

    for (let i = 0; i < Math.min(count, 10); i++) {
      const element = buttons.nth(i);
      
      await element.focus();
      
      const outline = await element.evaluate(
        (el) => window.getComputedStyle(el).outline
      );
      const boxShadow = await element.evaluate(
        (el) => window.getComputedStyle(el).boxShadow
      );

      const hasVisibleFocus = 
        (outline !== 'none' && outline !== '0px none rgb(0, 0, 0)') ||
        (boxShadow !== 'none');

      expect(
        hasVisibleFocus,
        `Element ${i} has no visible focus indicator`
      ).toBe(true);
    }
  });
});
```

### Custom A11y Rules

```typescript
// tests/a11y/custom-rules.ts
import { AxeResults, Result } from 'axe-core';

export function filterViolations(results: AxeResults): Result[] {
  // Filter out known issues or false positives
  return results.violations.filter((violation) => {
    // Ignore specific rules
    if (violation.id === 'region') {
      // Third-party widgets may not have landmarks
      return false;
    }

    // Ignore certain selectors
    const hasExcludedSelector = violation.nodes.every((node) =>
      node.target.some((selector) =>
        selector.includes('.third-party') || 
        selector.includes('#advertisement')
      )
    );
    if (hasExcludedSelector) return false;

    return true;
  });
}

export function getViolationSummary(results: AxeResults): string {
  const violations = filterViolations(results);
  
  if (violations.length === 0) {
    return 'No accessibility violations found';
  }

  return violations
    .map((v) => `${v.id}: ${v.description} (${v.nodes.length} instances)`)
    .join('\n');
}
```

## Variants

### With Storybook a11y Addon

```typescript
// .storybook/main.ts
const config = {
  addons: [
    '@storybook/addon-a11y',
  ],
};

// Component story
export default {
  title: 'Components/Button',
  component: Button,
  parameters: {
    a11y: {
      config: {
        rules: [
          { id: 'color-contrast', enabled: true },
        ],
      },
    },
  },
};
```

### With CI Integration

```yaml
# .github/workflows/a11y.yml
name: Accessibility Tests

on: [push, pull_request]

jobs:
  a11y:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run build
      - run: npm run test:a11y
```

## Anti-patterns

```typescript
// BAD: Skipping accessibility tests
test.skip('accessibility', async () => {});

// GOOD: Fix violations or document exceptions
test('accessibility', async () => {
  const results = await axe(container, {
    rules: {
      'color-contrast': { enabled: false }, // Documented exception
    },
  });
  expect(results).toHaveNoViolations();
});

// BAD: Decorative images without role
<img src="decoration.png" /> // Screen reader reads filename

// GOOD: Mark as decorative
<img src="decoration.png" alt="" role="presentation" />

// BAD: Icon button without label
<button><Icon /></button> // Screen reader: "button"

// GOOD: Accessible icon button
<button aria-label="Add to cart"><Icon /></button>
```

## Related Patterns

- `testing-components.md` - Component testing
- `testing-e2e.md` - E2E testing
- `visual-regression.md` - Visual testing
- `semantic-html.md` - Semantic markup

## Changelog

### 2.0.0 (2025-01-17)
- Standardized to atomic design system v2
- Updated frontmatter schema

### 1.0.0 (2024-01-15)
- Initial accessibility testing pattern
