---
id: pt-test-fixtures
name: Test Fixtures
version: 2.0.0
layer: L5
category: testing
description: Test data factories and fixtures for Next.js 15 applications
tags: [testing, test, fixtures]
composes: []
dependencies: []
formula: "Faker.js + factories + database seeding = reusable test data"
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# Test Fixtures Pattern

## Overview

Test data factories and fixtures for Next.js 15 applications. Provides consistent, maintainable test data generation for unit, integration, and E2E tests.

## When to Use

- **Unit tests**: Generate mock props for component testing
- **Integration tests**: Seed database with consistent test data
- **E2E tests**: Create authenticated users and test scenarios
- **API testing**: Generate request/response fixtures
- **Storybook**: Provide consistent mock data for stories
- **Data-heavy features**: Test pagination, filtering, and sorting

## Composition Diagram

```
+------------------+     +-------------------+     +------------------+
| Faker.js         | --> | Factory Functions | --> | Test Data        |
| (random data)    |     | (build, buildMany)|     | (typed objects)  |
+------------------+     +-------------------+     +------------------+
         |                        |                        |
         v                        v                        v
+------------------+     +-------------------+     +------------------+
| Database Seeding |     | Integration Tests |     | E2E Fixtures     |
| (Prisma/SQLite)  |     | (createTestUser)  |     | (Playwright)     |
+------------------+     +-------------------+     +------------------+
         |                        |
         v                        v
+------------------+     +-------------------+
| Unit Tests       |     | Mocking Pattern   |
| (mock props)     |     | (MSW handlers)    |
+------------------+     +-------------------+
```

## Implementation

### Factory Pattern with Faker

```typescript
// tests/factories/index.ts
import { faker } from '@faker-js/faker';

// Set seed for reproducible tests
faker.seed(12345);

// Base factory type
type Factory<T> = {
  build: (overrides?: Partial<T>) => T;
  buildMany: (count: number, overrides?: Partial<T>) => T[];
};

function createFactory<T>(defaultBuilder: () => T): Factory<T> {
  return {
    build: (overrides = {}) => ({
      ...defaultBuilder(),
      ...overrides,
    }),
    buildMany: (count, overrides = {}) =>
      Array.from({ length: count }, () => ({
        ...defaultBuilder(),
        ...overrides,
      })),
  };
}
```

### User Factory

```typescript
// tests/factories/user.ts
import { faker } from '@faker-js/faker';
import { createFactory } from './index';

export type User = {
  id: string;
  email: string;
  name: string;
  avatar: string;
  role: 'user' | 'admin' | 'moderator';
  createdAt: Date;
  updatedAt: Date;
  emailVerified: boolean;
  preferences: {
    newsletter: boolean;
    notifications: boolean;
    theme: 'light' | 'dark' | 'system';
  };
};

export const userFactory = createFactory<User>(() => ({
  id: faker.string.uuid(),
  email: faker.internet.email().toLowerCase(),
  name: faker.person.fullName(),
  avatar: faker.image.avatar(),
  role: 'user',
  createdAt: faker.date.past(),
  updatedAt: faker.date.recent(),
  emailVerified: faker.datatype.boolean(),
  preferences: {
    newsletter: faker.datatype.boolean(),
    notifications: true,
    theme: faker.helpers.arrayElement(['light', 'dark', 'system']),
  },
}));

// Specialized factories
export const adminFactory = createFactory<User>(() => ({
  ...userFactory.build(),
  role: 'admin',
  emailVerified: true,
}));

export const unverifiedUserFactory = createFactory<User>(() => ({
  ...userFactory.build(),
  emailVerified: false,
}));
```

### Product Factory

```typescript
// tests/factories/product.ts
import { faker } from '@faker-js/faker';
import { createFactory } from './index';
import { categoryFactory } from './category';

export type Product = {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  compareAtPrice: number | null;
  category: Category;
  categoryId: string;
  images: ProductImage[];
  variants: ProductVariant[];
  inStock: boolean;
  stockCount: number;
  featured: boolean;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type ProductImage = {
  id: string;
  url: string;
  alt: string;
  order: number;
};

export type ProductVariant = {
  id: string;
  name: string;
  sku: string;
  price: number;
  stockCount: number;
};

export const productImageFactory = createFactory<ProductImage>(() => ({
  id: faker.string.uuid(),
  url: faker.image.url({ width: 800, height: 800 }),
  alt: faker.commerce.productName(),
  order: faker.number.int({ min: 0, max: 10 }),
}));

export const productVariantFactory = createFactory<ProductVariant>(() => ({
  id: faker.string.uuid(),
  name: faker.helpers.arrayElement(['Small', 'Medium', 'Large', 'XL']),
  sku: faker.string.alphanumeric(8).toUpperCase(),
  price: faker.number.int({ min: 1000, max: 10000 }),
  stockCount: faker.number.int({ min: 0, max: 100 }),
}));

export const productFactory = createFactory<Product>(() => {
  const category = categoryFactory.build();
  const name = faker.commerce.productName();
  
  return {
    id: faker.string.uuid(),
    name,
    slug: faker.helpers.slugify(name).toLowerCase(),
    description: faker.commerce.productDescription(),
    price: faker.number.int({ min: 1000, max: 50000 }),
    compareAtPrice: faker.helpers.maybe(() => 
      faker.number.int({ min: 50000, max: 100000 })
    ) ?? null,
    category,
    categoryId: category.id,
    images: productImageFactory.buildMany(
      faker.number.int({ min: 1, max: 5 })
    ),
    variants: productVariantFactory.buildMany(
      faker.number.int({ min: 1, max: 4 })
    ),
    inStock: faker.datatype.boolean({ probability: 0.8 }),
    stockCount: faker.number.int({ min: 0, max: 500 }),
    featured: faker.datatype.boolean({ probability: 0.2 }),
    published: faker.datatype.boolean({ probability: 0.9 }),
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
  };
});

// Specialized product factories
export const featuredProductFactory = createFactory<Product>(() => ({
  ...productFactory.build(),
  featured: true,
  published: true,
  inStock: true,
}));

export const outOfStockProductFactory = createFactory<Product>(() => ({
  ...productFactory.build(),
  inStock: false,
  stockCount: 0,
}));

export const saleProductFactory = createFactory<Product>(() => {
  const price = faker.number.int({ min: 1000, max: 30000 });
  return {
    ...productFactory.build(),
    price,
    compareAtPrice: price * 1.5,
  };
});
```

### Order Factory

```typescript
// tests/factories/order.ts
import { faker } from '@faker-js/faker';
import { createFactory } from './index';
import { userFactory } from './user';
import { productFactory } from './product';

export type OrderStatus = 
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

export type OrderItem = {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
};

export type Order = {
  id: string;
  orderNumber: string;
  userId: string;
  user: User;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  status: OrderStatus;
  shippingAddress: Address;
  billingAddress: Address;
  paymentMethod: string;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  createdAt: Date;
  updatedAt: Date;
};

export type Address = {
  name: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
};

export const addressFactory = createFactory<Address>(() => ({
  name: faker.person.fullName(),
  line1: faker.location.streetAddress(),
  line2: faker.helpers.maybe(() => faker.location.secondaryAddress()),
  city: faker.location.city(),
  state: faker.location.state(),
  postalCode: faker.location.zipCode(),
  country: 'US',
}));

export const orderItemFactory = createFactory<OrderItem>(() => {
  const product = productFactory.build();
  const quantity = faker.number.int({ min: 1, max: 5 });
  
  return {
    id: faker.string.uuid(),
    productId: product.id,
    productName: product.name,
    quantity,
    unitPrice: product.price,
    totalPrice: product.price * quantity,
  };
});

export const orderFactory = createFactory<Order>(() => {
  const user = userFactory.build();
  const items = orderItemFactory.buildMany(
    faker.number.int({ min: 1, max: 5 })
  );
  const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
  const tax = Math.round(subtotal * 0.08);
  const shipping = subtotal > 10000 ? 0 : 999;
  
  return {
    id: faker.string.uuid(),
    orderNumber: `ORD-${faker.string.alphanumeric(8).toUpperCase()}`,
    userId: user.id,
    user,
    items,
    subtotal,
    tax,
    shipping,
    total: subtotal + tax + shipping,
    status: faker.helpers.arrayElement([
      'pending',
      'confirmed',
      'processing',
      'shipped',
      'delivered',
    ]),
    shippingAddress: addressFactory.build(),
    billingAddress: addressFactory.build(),
    paymentMethod: faker.helpers.arrayElement(['card', 'paypal', 'apple_pay']),
    paymentStatus: 'paid',
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
  };
});
```

### Database Fixtures

```typescript
// tests/fixtures/database.ts
import { PrismaClient } from '@prisma/client';
import { userFactory, adminFactory } from '../factories/user';
import { productFactory, categoryFactory } from '../factories/product';
import { orderFactory } from '../factories/order';

const prisma = new PrismaClient();

export async function seedDatabase() {
  // Clear existing data
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  // Create users
  const admin = await prisma.user.create({
    data: adminFactory.build({ email: 'admin@test.com' }),
  });

  const users = await Promise.all(
    userFactory.buildMany(10).map((user) =>
      prisma.user.create({ data: user })
    )
  );

  // Create categories
  const categories = await Promise.all(
    categoryFactory.buildMany(5).map((category) =>
      prisma.category.create({ data: category })
    )
  );

  // Create products
  const products = await Promise.all(
    categories.flatMap((category) =>
      productFactory.buildMany(10, { categoryId: category.id }).map((product) =>
        prisma.product.create({
          data: {
            ...product,
            category: undefined, // Remove nested relation
          },
        })
      )
    )
  );

  // Create orders
  const orders = await Promise.all(
    users.slice(0, 5).map((user) =>
      prisma.order.create({
        data: {
          ...orderFactory.build({ userId: user.id }),
          user: undefined,
          items: {
            create: orderFactory.build().items.map((item) => ({
              ...item,
              productId: products[0].id,
            })),
          },
        },
      })
    )
  );

  return { admin, users, categories, products, orders };
}

export async function cleanDatabase() {
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();
}
```

### Playwright Fixtures

```typescript
// tests/fixtures/playwright.ts
import { test as base, expect } from '@playwright/test';
import { userFactory, adminFactory } from '../factories/user';
import { productFactory } from '../factories/product';

type Fixtures = {
  authenticatedPage: Page;
  adminPage: Page;
  testUser: User;
  testProduct: Product;
};

export const test = base.extend<Fixtures>({
  testUser: async ({}, use) => {
    const user = userFactory.build();
    await use(user);
  },

  testProduct: async ({}, use) => {
    const product = productFactory.build();
    await use(product);
  },

  authenticatedPage: async ({ page, testUser }, use) => {
    // Create user via API
    await page.request.post('/api/test/users', {
      data: testUser,
    });

    // Login
    await page.goto('/login');
    await page.fill('[name="email"]', testUser.email);
    await page.fill('[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');

    await use(page);

    // Cleanup
    await page.request.delete(`/api/test/users/${testUser.id}`);
  },

  adminPage: async ({ page }, use) => {
    const admin = adminFactory.build({ email: 'admin@test.com' });

    await page.goto('/login');
    await page.fill('[name="email"]', admin.email);
    await page.fill('[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/admin');

    await use(page);
  },
});

export { expect };
```

### API Test Fixtures

```typescript
// tests/fixtures/api.ts
import { test as base } from '@playwright/test';
import { userFactory } from '../factories/user';

type APIFixtures = {
  authToken: string;
  adminToken: string;
  apiClient: {
    get: (path: string) => Promise<Response>;
    post: (path: string, data: unknown) => Promise<Response>;
    put: (path: string, data: unknown) => Promise<Response>;
    delete: (path: string) => Promise<Response>;
  };
};

export const test = base.extend<APIFixtures>({
  authToken: async ({ request }, use) => {
    const user = userFactory.build();
    
    // Create user
    await request.post('/api/test/users', { data: user });
    
    // Get token
    const response = await request.post('/api/auth/login', {
      data: { email: user.email, password: 'password123' },
    });
    const { token } = await response.json();

    await use(token);

    // Cleanup
    await request.delete(`/api/test/users/${user.id}`);
  },

  adminToken: async ({ request }, use) => {
    const response = await request.post('/api/auth/login', {
      data: { email: 'admin@test.com', password: 'admin123' },
    });
    const { token } = await response.json();
    await use(token);
  },

  apiClient: async ({ request, authToken }, use) => {
    const client = {
      get: (path: string) =>
        request.get(path, {
          headers: { Authorization: `Bearer ${authToken}` },
        }),
      post: (path: string, data: unknown) =>
        request.post(path, {
          data,
          headers: { Authorization: `Bearer ${authToken}` },
        }),
      put: (path: string, data: unknown) =>
        request.put(path, {
          data,
          headers: { Authorization: `Bearer ${authToken}` },
        }),
      delete: (path: string) =>
        request.delete(path, {
          headers: { Authorization: `Bearer ${authToken}` },
        }),
    };

    await use(client);
  },
});
```

### Mock Data for Components

```typescript
// tests/fixtures/component-data.ts
import { productFactory } from '../factories/product';
import { orderFactory } from '../factories/order';
import { userFactory } from '../factories/user';

// Pre-built fixtures for component tests
export const mockProducts = {
  single: productFactory.build(),
  list: productFactory.buildMany(10),
  featured: productFactory.buildMany(4, { featured: true }),
  outOfStock: productFactory.build({ inStock: false, stockCount: 0 }),
  onSale: productFactory.build({
    price: 2999,
    compareAtPrice: 4999,
  }),
};

export const mockUsers = {
  regular: userFactory.build(),
  admin: userFactory.build({ role: 'admin' }),
  unverified: userFactory.build({ emailVerified: false }),
};

export const mockOrders = {
  pending: orderFactory.build({ status: 'pending' }),
  shipped: orderFactory.build({ status: 'shipped' }),
  delivered: orderFactory.build({ status: 'delivered' }),
  cancelled: orderFactory.build({ status: 'cancelled' }),
};

// For Storybook
export const storyFixtures = {
  product: mockProducts.single,
  products: mockProducts.list,
  user: mockUsers.regular,
  order: mockOrders.pending,
};
```

### JSON Fixtures

```typescript
// tests/fixtures/json/products.json
[
  {
    "id": "prod_1",
    "name": "Classic T-Shirt",
    "slug": "classic-t-shirt",
    "price": 2999,
    "category": { "id": "cat_1", "name": "Clothing" }
  },
  {
    "id": "prod_2",
    "name": "Running Shoes",
    "slug": "running-shoes",
    "price": 12999,
    "category": { "id": "cat_2", "name": "Footwear" }
  }
]

// tests/fixtures/load-fixtures.ts
import productsJson from './json/products.json';
import usersJson from './json/users.json';

export function loadFixtures() {
  return {
    products: productsJson,
    users: usersJson,
  };
}
```

### Using Fixtures in Tests

```typescript
// tests/products.test.tsx
import { render, screen } from '@testing-library/react';
import { ProductCard } from '@/components/product-card';
import { productFactory, saleProductFactory } from './factories/product';

describe('ProductCard', () => {
  it('renders product details', () => {
    const product = productFactory.build({
      name: 'Test Product',
      price: 2999,
    });

    render(<ProductCard product={product} />);

    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText('$29.99')).toBeInTheDocument();
  });

  it('shows sale price', () => {
    const product = saleProductFactory.build();

    render(<ProductCard product={product} />);

    expect(screen.getByText(/was/i)).toBeInTheDocument();
  });

  it('shows out of stock', () => {
    const product = productFactory.build({ inStock: false });

    render(<ProductCard product={product} />);

    expect(screen.getByText(/out of stock/i)).toBeInTheDocument();
  });
});
```

## Variants

### With Trait System

```typescript
// tests/factories/with-traits.ts
type Traits<T> = Record<string, Partial<T>>;

function createFactoryWithTraits<T>(
  defaultBuilder: () => T,
  traits: Traits<T>
) {
  return {
    build: (overrides: Partial<T> = {}, traitNames: string[] = []) => {
      let result = defaultBuilder();
      
      for (const traitName of traitNames) {
        if (traits[traitName]) {
          result = { ...result, ...traits[traitName] };
        }
      }
      
      return { ...result, ...overrides };
    },
  };
}

export const userFactoryWithTraits = createFactoryWithTraits(
  () => userFactory.build(),
  {
    admin: { role: 'admin', emailVerified: true },
    unverified: { emailVerified: false },
    inactive: { status: 'inactive' },
  }
);

// Usage
const admin = userFactoryWithTraits.build({}, ['admin']);
const unverifiedAdmin = userFactoryWithTraits.build({}, ['admin', 'unverified']);
```

## Anti-patterns

```typescript
// BAD: Hardcoded test data everywhere
const product = {
  id: '123',
  name: 'Test',
  price: 100,
}; // Repeated in every test

// GOOD: Use factories
const product = productFactory.build();

// BAD: Mutable shared fixtures
const sharedUser = userFactory.build();
test('test 1', () => { sharedUser.name = 'Changed'; }); // Affects other tests!

// GOOD: Fresh fixtures per test
test('test 1', () => {
  const user = userFactory.build();
});

// BAD: Random data without seed
faker.person.fullName(); // Different every run

// GOOD: Seeded random data
faker.seed(12345);
faker.person.fullName(); // Reproducible
```

## Related Patterns

- `mocking.md` - Mock services
- `testing-integration.md` - Integration tests
- `testing-e2e.md` - E2E tests
- `seeding.md` - Database seeding

## Changelog

### 2.0.0 (2025-01-18)
- Standardized to atomic design system v2
- Updated frontmatter schema

- 2024-01-15: Initial test fixtures pattern
