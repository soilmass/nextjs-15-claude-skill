---
id: pt-snapshot-testing
name: Snapshot Testing
version: 2.0.0
layer: L5
category: testing
description: Jest snapshot testing for React components in Next.js 15
tags: [testing, snapshot, testing]
composes: []
dependencies:
  vitest: "^2.1.0"
formula: "toMatchSnapshot + inline snapshots + serializers = DOM change detection"
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# Snapshot Testing Pattern

## Overview

Jest snapshot testing for React components in Next.js 15 applications. Captures component output to detect unintended changes in UI rendering.

## When to Use

- **Component rendering**: Capture expected HTML output for UI components
- **Style changes**: Detect unintended class name or style modifications
- **Prop variations**: Snapshot different component states (loading, error, etc.)
- **Form states**: Capture validation error messages and form layouts
- **Code review**: Easily review UI changes in pull requests
- **Regression prevention**: Guard against accidental UI breaks

## Composition Diagram

```
+------------------+     +-------------------+     +------------------+
| Jest/Vitest      | --> | toMatchSnapshot() | --> | .snap file       |
| (test runner)    |     | (serialization)   |     | (stored output)  |
+------------------+     +-------------------+     +------------------+
         |                        |                        |
         v                        v                        v
+------------------+     +-------------------+     +------------------+
| Component Tests  |     | Inline Snapshots  |     | Custom           |
| (render)         |     | (toMatchInline)   |     | Serializers      |
+------------------+     +-------------------+     +------------------+
         |                        |
         v                        v
+------------------+     +-------------------+
| Unit Testing     |     | Visual Regression |
| (isolated)       |     | (screenshots)     |
+------------------+     +-------------------+
```

## Implementation

### Jest Configuration

```typescript
// jest.config.ts
import type { Config } from 'jest';
import nextJest from 'next/jest';

const createJestConfig = nextJest({
  dir: './',
});

const config: Config = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  snapshotSerializers: ['@emotion/jest/serializer'],
  testPathIgnorePatterns: ['<rootDir>/.next/', '<rootDir>/node_modules/'],
};

export default createJestConfig(config);
```

```typescript
// jest.setup.ts
import '@testing-library/jest-dom';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

// Mock Next.js Image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => <img {...props} />,
}));
```

### Basic Component Snapshot

```typescript
// components/__tests__/button.test.tsx
import { render } from '@testing-library/react';
import { Button } from '../ui/button';

describe('Button', () => {
  it('renders correctly with default props', () => {
    const { container } = render(<Button>Click me</Button>);
    expect(container).toMatchSnapshot();
  });

  it('renders all variants', () => {
    const variants = ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'] as const;
    
    variants.forEach((variant) => {
      const { container } = render(
        <Button variant={variant}>Button</Button>
      );
      expect(container).toMatchSnapshot(`variant-${variant}`);
    });
  });

  it('renders all sizes', () => {
    const sizes = ['default', 'sm', 'lg', 'icon'] as const;
    
    sizes.forEach((size) => {
      const { container } = render(
        <Button size={size}>Button</Button>
      );
      expect(container).toMatchSnapshot(`size-${size}`);
    });
  });

  it('renders disabled state', () => {
    const { container } = render(<Button disabled>Disabled</Button>);
    expect(container).toMatchSnapshot();
  });

  it('renders with icon', () => {
    const { container } = render(
      <Button>
        <span className="icon">+</span>
        Add Item
      </Button>
    );
    expect(container).toMatchSnapshot();
  });
});
```

### Complex Component Snapshot

```typescript
// components/__tests__/product-card.test.tsx
import { render } from '@testing-library/react';
import { ProductCard } from '../product-card';

const mockProduct = {
  id: '1',
  name: 'Test Product',
  description: 'A great product for testing',
  price: 99.99,
  image: '/test-image.jpg',
  category: { name: 'Electronics' },
  inStock: true,
};

describe('ProductCard', () => {
  it('renders product with all details', () => {
    const { container } = render(<ProductCard product={mockProduct} />);
    expect(container).toMatchSnapshot();
  });

  it('renders out of stock state', () => {
    const { container } = render(
      <ProductCard product={{ ...mockProduct, inStock: false }} />
    );
    expect(container).toMatchSnapshot();
  });

  it('renders sale price', () => {
    const { container } = render(
      <ProductCard
        product={{
          ...mockProduct,
          salePrice: 79.99,
        }}
      />
    );
    expect(container).toMatchSnapshot();
  });

  it('renders loading state', () => {
    const { container } = render(<ProductCard.Skeleton />);
    expect(container).toMatchSnapshot();
  });
});
```

### Inline Snapshots

```typescript
// components/__tests__/badge.test.tsx
import { render } from '@testing-library/react';
import { Badge } from '../ui/badge';

describe('Badge', () => {
  it('renders default badge', () => {
    const { container } = render(<Badge>New</Badge>);
    expect(container.innerHTML).toMatchInlineSnapshot(
      `"<span class=\\"inline-flex items-center rounded-full bg-primary px-2.5 py-0.5 text-xs font-medium text-primary-foreground\\">New</span>"`
    );
  });

  it('renders destructive badge', () => {
    const { container } = render(<Badge variant="destructive">Error</Badge>);
    expect(container.innerHTML).toMatchInlineSnapshot(
      `"<span class=\\"inline-flex items-center rounded-full bg-destructive px-2.5 py-0.5 text-xs font-medium text-destructive-foreground\\">Error</span>"`
    );
  });
});
```

### Snapshot with Custom Serializer

```typescript
// test/serializers/styled-serializer.ts
import { NewPlugin } from 'pretty-format';

const styledSerializer: NewPlugin = {
  test(val) {
    return val && val.$$typeof === Symbol.for('react.element');
  },
  serialize(val, config, indentation, depth, refs, printer) {
    // Remove dynamic class names
    const serialized = printer(val, config, indentation, depth, refs);
    return serialized.replace(/css-[a-z0-9]+/g, 'css-DYNAMIC');
  },
};

export default styledSerializer;

// jest.config.ts
// snapshotSerializers: ['./test/serializers/styled-serializer.ts'],
```

### Component State Snapshots

```typescript
// components/__tests__/accordion.test.tsx
import { render, fireEvent } from '@testing-library/react';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '../ui/accordion';

describe('Accordion', () => {
  const TestAccordion = () => (
    <Accordion type="single" collapsible>
      <AccordionItem value="item-1">
        <AccordionTrigger>Section 1</AccordionTrigger>
        <AccordionContent>Content 1</AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>Section 2</AccordionTrigger>
        <AccordionContent>Content 2</AccordionContent>
      </AccordionItem>
    </Accordion>
  );

  it('renders collapsed state', () => {
    const { container } = render(<TestAccordion />);
    expect(container).toMatchSnapshot();
  });

  it('renders expanded state', () => {
    const { container, getByText } = render(<TestAccordion />);
    
    fireEvent.click(getByText('Section 1'));
    
    expect(container).toMatchSnapshot();
  });

  it('renders with different item expanded', () => {
    const { container, getByText } = render(<TestAccordion />);
    
    fireEvent.click(getByText('Section 2'));
    
    expect(container).toMatchSnapshot();
  });
});
```

### Server Component Snapshot

```typescript
// app/components/__tests__/server-component.test.tsx
import { render } from '@testing-library/react';

// Mock the data fetching
jest.mock('@/lib/data/products', () => ({
  getProducts: jest.fn().mockResolvedValue([
    { id: '1', name: 'Product 1', price: 100 },
    { id: '2', name: 'Product 2', price: 200 },
  ]),
}));

// For async server components, we need to await them
describe('ProductList (Server Component)', () => {
  it('renders product list', async () => {
    // Import dynamically to get fresh mock
    const { ProductList } = await import('../product-list');
    
    // Server components return a Promise
    const Component = await ProductList();
    const { container } = render(Component);
    
    expect(container).toMatchSnapshot();
  });
});
```

### Snapshot Update Strategy

```typescript
// scripts/update-snapshots.ts
import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';
import { glob } from 'glob';

async function reviewSnapshots() {
  // Find all snapshot files
  const snapshots = await glob('**/__snapshots__/*.snap');
  
  console.log(`Found ${snapshots.length} snapshot files`);
  
  // Check for large snapshots
  for (const file of snapshots) {
    const content = readFileSync(file, 'utf-8');
    const lines = content.split('\n').length;
    
    if (lines > 100) {
      console.warn(`Warning: ${file} has ${lines} lines - consider splitting`);
    }
  }
  
  // Run tests with update flag
  try {
    execSync('npm test -- --updateSnapshot --testPathPattern=snapshot', {
      stdio: 'inherit',
    });
  } catch (error) {
    console.error('Snapshot update failed');
    process.exit(1);
  }
}

reviewSnapshots();
```

### Property-Based Snapshots

```typescript
// components/__tests__/avatar.test.tsx
import { render } from '@testing-library/react';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';

describe('Avatar', () => {
  const testCases = [
    { name: 'John Doe', initials: 'JD', image: null },
    { name: 'Jane Smith', initials: 'JS', image: '/avatar.jpg' },
    { name: 'Bob', initials: 'B', image: null },
  ];

  testCases.forEach(({ name, initials, image }) => {
    it(`renders avatar for ${name}`, () => {
      const { container } = render(
        <Avatar>
          {image && <AvatarImage src={image} alt={name} />}
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
      );
      expect(container).toMatchSnapshot();
    });
  });
});
```

### Form Component Snapshots

```typescript
// components/__tests__/form.test.tsx
import { render } from '@testing-library/react';
import { useForm } from 'react-hook-form';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '../ui/form';
import { Input } from '../ui/input';

const TestForm = ({ errors = {} }: { errors?: Record<string, string> }) => {
  const form = useForm({
    defaultValues: { email: '', password: '' },
  });

  // Manually set errors for snapshot
  Object.entries(errors).forEach(([field, message]) => {
    form.setError(field as any, { message });
  });

  return (
    <Form {...form}>
      <form>
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
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
      </form>
    </Form>
  );
};

describe('Form', () => {
  it('renders empty form', () => {
    const { container } = render(<TestForm />);
    expect(container).toMatchSnapshot();
  });

  it('renders form with validation errors', () => {
    const { container } = render(
      <TestForm
        errors={{
          email: 'Invalid email address',
          password: 'Password is required',
        }}
      />
    );
    expect(container).toMatchSnapshot();
  });
});
```

## Variants

### With Storybook Integration

```typescript
// .storybook/test-runner.ts
import { TestRunnerConfig } from '@storybook/test-runner';

const config: TestRunnerConfig = {
  async postVisit(page, context) {
    // Snapshot each story
    const elementHandler = await page.$('#storybook-root');
    const innerHTML = await elementHandler?.innerHTML();
    expect(innerHTML).toMatchSnapshot();
  },
};

export default config;
```

### With CSS-in-JS Normalization

```typescript
// test/utils/snapshot-utils.ts
import { render, RenderResult } from '@testing-library/react';

export function renderForSnapshot(ui: React.ReactElement): RenderResult {
  const result = render(ui);
  
  // Normalize dynamic class names
  const html = result.container.innerHTML
    .replace(/css-[a-z0-9]+/g, 'css-hash')
    .replace(/sc-[a-z]+/g, 'sc-hash');
  
  result.container.innerHTML = html;
  
  return result;
}
```

## Anti-patterns

```typescript
// BAD: Snapshot includes timestamps or random IDs
render(<Card id={Math.random()} date={new Date()} />);
// Snapshot will always fail!

// GOOD: Use stable values
render(<Card id="test-id" date={new Date('2024-01-01')} />);

// BAD: Testing implementation details
expect(container.querySelector('.internal-class')).toMatchSnapshot();

// GOOD: Test rendered output
expect(container).toMatchSnapshot();

// BAD: Huge snapshots
expect(document.body).toMatchSnapshot(); // Entire page!

// GOOD: Focused snapshots
expect(container.querySelector('[data-testid="header"]')).toMatchSnapshot();

// BAD: Not reviewing snapshot changes
git add -A && git commit -m "update snapshots" // Blindly accepting changes

// GOOD: Review each change
npm test -- --updateSnapshot
git diff __snapshots__/
```

## Related Patterns

- `testing-components.md` - Component testing
- `visual-regression.md` - Visual testing
- `testing-unit.md` - Unit testing
- `mocking.md` - Test mocking

## Changelog

### 2.0.0 (2025-01-18)
- Standardized to atomic design system v2
- Updated frontmatter schema

- 2024-01-15: Initial snapshot testing pattern
