---
id: pt-contract-testing
name: Contract Testing
version: 2.0.0
layer: L5
category: testing
description: API contract testing for Next.js 15 applications using Pact and OpenAPI schema validation
tags: [testing, contract, pact, openapi, api, validation]
composes: []
dependencies:
  @pact-foundation/pact: "^13.0.0"
formula: "Pact + OpenAPI + Zod = consumer-provider contract validation"
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# Contract Testing Pattern

## Overview

API contract testing for Next.js 15 applications using Pact and OpenAPI schema validation. Ensures API compatibility between frontend and backend services.

## When to Use

- **Microservices**: Validate contracts between frontend and multiple backend services
- **API versioning**: Ensure backward compatibility when updating API versions
- **Team collaboration**: Define API contracts before implementation
- **Third-party integrations**: Validate external API responses match expectations
- **GraphQL APIs**: Test query/mutation contracts with schema validation
- **Breaking change detection**: Catch incompatible changes in CI/CD

## Composition Diagram

```
+------------------+     +-------------------+     +------------------+
| Consumer Tests   | --> | Pact Contract     | --> | Provider         |
| (Frontend)       |     | (.json file)      |     | Verification     |
+------------------+     +-------------------+     +------------------+
         |                        |                        |
         v                        v                        v
+------------------+     +-------------------+     +------------------+
| API Testing      |     | OpenAPI Spec      |     | Zod Schema       |
| Pattern          |     | Validation        |     | (type safety)    |
+------------------+     +-------------------+     +------------------+
         |                        |
         v                        v
+------------------+     +-------------------+
| Mocking Pattern  |     | Integration Tests |
| (MSW)            |     |                   |
+------------------+     +-------------------+
```

## Implementation

### Pact Consumer Setup

```typescript
// tests/contracts/pact-setup.ts
import { PactV3, MatchersV3 } from '@pact-foundation/pact';
import path from 'path';

export const provider = new PactV3({
  consumer: 'NextjsFrontend',
  provider: 'ApiBackend',
  dir: path.resolve(process.cwd(), 'pacts'),
  logLevel: 'warn',
});

export const { like, eachLike, regex, datetime, integer, decimal, boolean, string } =
  MatchersV3;
```

### Consumer Contract Tests

```typescript
// tests/contracts/products.consumer.pact.ts
import { provider, like, eachLike, integer, string } from './pact-setup';
import { getProducts, getProduct, createProduct } from '@/lib/api/products';

describe('Products API Contract', () => {
  describe('GET /api/products', () => {
    it('returns a list of products', async () => {
      await provider
        .given('products exist')
        .uponReceiving('a request for all products')
        .withRequest({
          method: 'GET',
          path: '/api/products',
          headers: {
            Accept: 'application/json',
          },
        })
        .willRespondWith({
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
          body: {
            products: eachLike({
              id: string('prod_123'),
              name: string('Sample Product'),
              price: integer(9999),
              description: string('Product description'),
              category: like({
                id: string('cat_1'),
                name: string('Electronics'),
              }),
              inStock: boolean(true),
              createdAt: regex(
                '2024-01-15T10:30:00.000Z',
                /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/
              ),
            }),
            pagination: like({
              page: integer(1),
              limit: integer(20),
              total: integer(100),
              totalPages: integer(5),
            }),
          },
        });

      await provider.executeTest(async (mockServer) => {
        const result = await getProducts({
          baseUrl: mockServer.url,
        });

        expect(result.products).toHaveLength(1);
        expect(result.products[0]).toHaveProperty('id');
        expect(result.products[0]).toHaveProperty('name');
        expect(result.pagination).toHaveProperty('total');
      });
    });

    it('returns filtered products', async () => {
      await provider
        .given('products in category electronics exist')
        .uponReceiving('a request for products filtered by category')
        .withRequest({
          method: 'GET',
          path: '/api/products',
          query: { category: 'electronics' },
          headers: {
            Accept: 'application/json',
          },
        })
        .willRespondWith({
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
          body: {
            products: eachLike({
              id: string('prod_123'),
              name: string('Sample Product'),
              category: like({
                id: string('cat_electronics'),
                name: string('Electronics'),
              }),
            }),
          },
        });

      await provider.executeTest(async (mockServer) => {
        const result = await getProducts({
          baseUrl: mockServer.url,
          category: 'electronics',
        });

        expect(result.products[0].category.name).toBe('Electronics');
      });
    });
  });

  describe('GET /api/products/:id', () => {
    it('returns a single product', async () => {
      const productId = 'prod_123';

      await provider
        .given('product with id prod_123 exists')
        .uponReceiving('a request for a specific product')
        .withRequest({
          method: 'GET',
          path: `/api/products/${productId}`,
          headers: {
            Accept: 'application/json',
          },
        })
        .willRespondWith({
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
          body: like({
            id: string(productId),
            name: string('Sample Product'),
            price: integer(9999),
            description: string('Detailed description'),
            images: eachLike({
              url: string('https://example.com/image.jpg'),
              alt: string('Product image'),
            }),
            variants: eachLike({
              id: string('var_1'),
              name: string('Size M'),
              price: integer(9999),
              inStock: boolean(true),
            }),
          }),
        });

      await provider.executeTest(async (mockServer) => {
        const product = await getProduct(productId, {
          baseUrl: mockServer.url,
        });

        expect(product.id).toBe(productId);
        expect(product).toHaveProperty('images');
        expect(product).toHaveProperty('variants');
      });
    });

    it('returns 404 for non-existent product', async () => {
      await provider
        .given('product does not exist')
        .uponReceiving('a request for a non-existent product')
        .withRequest({
          method: 'GET',
          path: '/api/products/non_existent',
          headers: {
            Accept: 'application/json',
          },
        })
        .willRespondWith({
          status: 404,
          headers: {
            'Content-Type': 'application/json',
          },
          body: like({
            error: string('Not Found'),
            message: string('Product not found'),
          }),
        });

      await provider.executeTest(async (mockServer) => {
        await expect(
          getProduct('non_existent', { baseUrl: mockServer.url })
        ).rejects.toThrow('Product not found');
      });
    });
  });

  describe('POST /api/products', () => {
    it('creates a new product', async () => {
      const newProduct = {
        name: 'New Product',
        price: 1999,
        description: 'A new product',
        categoryId: 'cat_1',
      };

      await provider
        .given('user is authenticated as admin')
        .uponReceiving('a request to create a product')
        .withRequest({
          method: 'POST',
          path: '/api/products',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            Authorization: 'Bearer valid_token',
          },
          body: newProduct,
        })
        .willRespondWith({
          status: 201,
          headers: {
            'Content-Type': 'application/json',
          },
          body: like({
            id: string('prod_new'),
            name: string(newProduct.name),
            price: integer(newProduct.price),
            description: string(newProduct.description),
            createdAt: regex(
              '2024-01-15T10:30:00.000Z',
              /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/
            ),
          }),
        });

      await provider.executeTest(async (mockServer) => {
        const result = await createProduct(newProduct, {
          baseUrl: mockServer.url,
          token: 'valid_token',
        });

        expect(result.name).toBe(newProduct.name);
        expect(result).toHaveProperty('id');
        expect(result).toHaveProperty('createdAt');
      });
    });

    it('returns 401 without authentication', async () => {
      await provider
        .given('user is not authenticated')
        .uponReceiving('an unauthorized request to create a product')
        .withRequest({
          method: 'POST',
          path: '/api/products',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: { name: 'Test' },
        })
        .willRespondWith({
          status: 401,
          headers: {
            'Content-Type': 'application/json',
          },
          body: like({
            error: string('Unauthorized'),
            message: string('Authentication required'),
          }),
        });

      await provider.executeTest(async (mockServer) => {
        await expect(
          createProduct({ name: 'Test' }, { baseUrl: mockServer.url })
        ).rejects.toThrow('Authentication required');
      });
    });
  });
});
```

### OpenAPI Schema Validation

```typescript
// tests/contracts/openapi-validation.ts
import { OpenAPIValidator } from 'openapi-backend';
import * as fs from 'fs';
import * as path from 'path';

const openApiSpec = JSON.parse(
  fs.readFileSync(
    path.join(process.cwd(), 'openapi.json'),
    'utf-8'
  )
);

const validator = new OpenAPIValidator({
  definition: openApiSpec,
});

export async function validateRequest(
  method: string,
  path: string,
  body?: unknown,
  headers?: Record<string, string>
): Promise<{ valid: boolean; errors?: any[] }> {
  const result = await validator.validateRequest({
    method,
    path,
    body,
    headers,
  });

  return {
    valid: result.valid,
    errors: result.errors,
  };
}

export async function validateResponse(
  method: string,
  path: string,
  statusCode: number,
  body: unknown
): Promise<{ valid: boolean; errors?: any[] }> {
  const result = await validator.validateResponse(
    { method, path },
    { statusCode, body }
  );

  return {
    valid: result.valid,
    errors: result.errors,
  };
}
```

### API Client with Schema Validation

```typescript
// lib/api/validated-client.ts
import { z } from 'zod';

// Response schemas
const ProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  price: z.number().int().positive(),
  description: z.string().optional(),
  category: z.object({
    id: z.string(),
    name: z.string(),
  }),
  inStock: z.boolean(),
  createdAt: z.string().datetime(),
});

const ProductListResponseSchema = z.object({
  products: z.array(ProductSchema),
  pagination: z.object({
    page: z.number().int().positive(),
    limit: z.number().int().positive(),
    total: z.number().int().nonnegative(),
    totalPages: z.number().int().nonnegative(),
  }),
});

type Product = z.infer<typeof ProductSchema>;
type ProductListResponse = z.infer<typeof ProductListResponseSchema>;

export async function getProducts(options?: {
  baseUrl?: string;
  category?: string;
}): Promise<ProductListResponse> {
  const baseUrl = options?.baseUrl ?? process.env.API_URL;
  const url = new URL('/api/products', baseUrl);
  
  if (options?.category) {
    url.searchParams.set('category', options.category);
  }

  const response = await fetch(url.toString(), {
    headers: { Accept: 'application/json' },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message ?? 'Failed to fetch products');
  }

  const data = await response.json();
  
  // Validate response against schema
  const validated = ProductListResponseSchema.parse(data);
  
  return validated;
}

export async function getProduct(
  id: string,
  options?: { baseUrl?: string }
): Promise<Product> {
  const baseUrl = options?.baseUrl ?? process.env.API_URL;
  
  const response = await fetch(`${baseUrl}/api/products/${id}`, {
    headers: { Accept: 'application/json' },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message ?? 'Failed to fetch product');
  }

  const data = await response.json();
  
  return ProductSchema.parse(data);
}
```

### Provider Verification Tests

```typescript
// tests/contracts/provider-verification.ts
import { Verifier } from '@pact-foundation/pact';
import path from 'path';

describe('Provider Verification', () => {
  it('validates the provider against consumer contracts', async () => {
    const verifier = new Verifier({
      providerBaseUrl: 'http://localhost:3000',
      pactUrls: [
        path.resolve(
          process.cwd(),
          'pacts/NextjsFrontend-ApiBackend.json'
        ),
      ],
      // Or use Pact Broker
      // pactBrokerUrl: process.env.PACT_BROKER_URL,
      // pactBrokerToken: process.env.PACT_BROKER_TOKEN,
      // publishVerificationResult: true,
      // providerVersion: process.env.GIT_SHA,
      stateHandlers: {
        'products exist': async () => {
          // Seed database with test products
          await seedProducts();
          return 'Products seeded';
        },
        'product with id prod_123 exists': async () => {
          await seedProduct({ id: 'prod_123' });
          return 'Product seeded';
        },
        'product does not exist': async () => {
          await clearProducts();
          return 'Products cleared';
        },
        'user is authenticated as admin': async () => {
          // Setup authentication
          return 'Admin authenticated';
        },
        'user is not authenticated': async () => {
          // Clear authentication
          return 'Authentication cleared';
        },
      },
    });

    await verifier.verifyProvider();
  });
});

async function seedProducts() {
  // Seed test products
}

async function seedProduct(data: { id: string }) {
  // Seed specific product
}

async function clearProducts() {
  // Clear all products
}
```

### CI/CD Pipeline

```yaml
# .github/workflows/contract-tests.yml
name: Contract Tests

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  consumer-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20

      - run: npm ci
      
      - name: Run consumer contract tests
        run: npm run test:contracts:consumer

      - name: Publish pacts to broker
        if: github.ref == 'refs/heads/main'
        run: npx pact-broker publish pacts --consumer-app-version=${{ github.sha }}
        env:
          PACT_BROKER_BASE_URL: ${{ secrets.PACT_BROKER_URL }}
          PACT_BROKER_TOKEN: ${{ secrets.PACT_BROKER_TOKEN }}

  provider-verification:
    needs: consumer-tests
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4

      - run: npm ci
      - run: npm run build
      
      - name: Start server
        run: npm run start &
        
      - name: Wait for server
        run: npx wait-on http://localhost:3000

      - name: Verify provider
        run: npm run test:contracts:provider
        env:
          PACT_BROKER_BASE_URL: ${{ secrets.PACT_BROKER_URL }}
          PACT_BROKER_TOKEN: ${{ secrets.PACT_BROKER_TOKEN }}
```

### GraphQL Contract Testing

```typescript
// tests/contracts/graphql.consumer.pact.ts
import { provider, like, eachLike } from './pact-setup';

describe('GraphQL API Contract', () => {
  it('fetches products via GraphQL', async () => {
    const query = `
      query GetProducts($first: Int) {
        products(first: $first) {
          edges {
            node {
              id
              name
              price
            }
          }
          pageInfo {
            hasNextPage
            endCursor
          }
        }
      }
    `;

    await provider
      .given('products exist')
      .uponReceiving('a GraphQL request for products')
      .withRequest({
        method: 'POST',
        path: '/api/graphql',
        headers: {
          'Content-Type': 'application/json',
        },
        body: {
          query,
          variables: { first: 10 },
        },
      })
      .willRespondWith({
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
        body: {
          data: {
            products: {
              edges: eachLike({
                node: like({
                  id: 'prod_1',
                  name: 'Product',
                  price: 1000,
                }),
              }),
              pageInfo: like({
                hasNextPage: true,
                endCursor: 'cursor_abc',
              }),
            },
          },
        },
      });

    await provider.executeTest(async (mockServer) => {
      const result = await graphqlClient.request(query, { first: 10 });
      expect(result.products.edges).toHaveLength(1);
    });
  });
});
```

## Anti-patterns

```typescript
// BAD: Hardcoded values in contracts
.willRespondWith({
  body: {
    products: [
      { id: 'prod_123', name: 'Exact Name' }, // Too specific!
    ],
  },
})

// GOOD: Use matchers
.willRespondWith({
  body: {
    products: eachLike({
      id: string('prod_123'),
      name: string('Sample Product'),
    }),
  },
})

// BAD: Testing implementation details
expect(response.headers['x-internal-id']).toBeDefined();

// GOOD: Test the contract
expect(response.body).toMatchSchema(ProductSchema);

// BAD: Skipping error scenarios
// Only testing happy paths

// GOOD: Test error contracts
it('handles 404', async () => {
  await provider.given('product does not exist')...
});
```

## Related Patterns

- `api-testing.md` - API testing
- `mocking.md` - Mock services
- `testing-integration.md` - Integration tests
- `zod-schemas.md` - Schema validation

## Changelog

### 2.0.0 (2025-01-17)
- Standardized to atomic design system v2
- Updated frontmatter schema

### 1.0.0 (2024-01-15)
- Initial contract testing pattern
