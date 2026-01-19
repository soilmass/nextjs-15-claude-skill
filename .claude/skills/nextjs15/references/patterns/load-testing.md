---
id: pt-load-testing
name: Load Testing
version: 2.0.0
layer: L5
category: testing
description: Load testing for Next.js 15 applications using k6 and Artillery
tags: [testing, load, testing]
composes: []
dependencies:
  k6: "^0.54.0"
formula: "k6 + Artillery + thresholds = capacity validation"
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# Load Testing Pattern

## Overview

Load testing for Next.js 15 applications using k6, Artillery, and custom scripts. Validates application performance under expected and peak traffic conditions.

## When to Use

- **Pre-launch**: Validate production capacity before major releases
- **Traffic spikes**: Test Black Friday, product launches, or viral events
- **Infrastructure changes**: Verify new servers, CDN, or database scaling
- **API rate limits**: Validate throttling behavior under load
- **Database performance**: Test connection pooling and query performance
- **Caching strategies**: Verify cache hit rates under concurrent requests
- **CI/CD gates**: Fail builds that degrade performance

## Composition Diagram

```
+------------------+     +-------------------+     +------------------+
| k6 / Artillery   | --> | VU Scenarios      | --> | Metric           |
| (load generator) |     | (ramping, spike)  |     | Collection       |
+------------------+     +-------------------+     +------------------+
         |                        |                        |
         v                        v                        v
+------------------+     +-------------------+     +------------------+
| Performance Test |     | API Testing       |     | Threshold        |
| (response times) |     | (endpoints)       |     | Validation       |
+------------------+     +-------------------+     +------------------+
         |                        |
         v                        v
+------------------+     +-------------------+
| Rate Limiting    |     | Caching           |
| (throttle tests) |     | (hit rates)       |
+------------------+     +-------------------+
```

## Implementation

### k6 Load Test Configuration

```typescript
// tests/load/k6/config.ts
export const options = {
  scenarios: {
    // Smoke test
    smoke: {
      executor: 'constant-vus',
      vus: 1,
      duration: '1m',
      tags: { test_type: 'smoke' },
    },
    // Load test
    load: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '2m', target: 50 },   // Ramp up
        { duration: '5m', target: 50 },   // Stay at 50
        { duration: '2m', target: 100 },  // Ramp up to 100
        { duration: '5m', target: 100 },  // Stay at 100
        { duration: '2m', target: 0 },    // Ramp down
      ],
      tags: { test_type: 'load' },
    },
    // Stress test
    stress: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '2m', target: 100 },
        { duration: '5m', target: 100 },
        { duration: '2m', target: 200 },
        { duration: '5m', target: 200 },
        { duration: '2m', target: 300 },
        { duration: '5m', target: 300 },
        { duration: '5m', target: 0 },
      ],
      tags: { test_type: 'stress' },
    },
    // Spike test
    spike: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '10s', target: 100 },  // Fast ramp up
        { duration: '1m', target: 100 },   // Stay
        { duration: '10s', target: 500 },  // Spike!
        { duration: '3m', target: 500 },   // Stay at peak
        { duration: '10s', target: 100 },  // Scale down
        { duration: '3m', target: 100 },
        { duration: '10s', target: 0 },
      ],
      tags: { test_type: 'spike' },
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<500', 'p(99)<1000'],
    http_req_failed: ['rate<0.01'],
    http_reqs: ['rate>100'],
  },
};
```

### k6 Main Test Script

```javascript
// tests/load/k6/main.js
import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const pageLoadTime = new Trend('page_load_time');

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export const options = {
  scenarios: {
    default: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '1m', target: 50 },
        { duration: '3m', target: 50 },
        { duration: '1m', target: 0 },
      ],
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<500'],
    errors: ['rate<0.1'],
    page_load_time: ['p(95)<2000'],
  },
};

export default function () {
  group('Homepage', () => {
    const start = Date.now();
    const res = http.get(`${BASE_URL}/`);
    
    pageLoadTime.add(Date.now() - start);
    
    const success = check(res, {
      'status is 200': (r) => r.status === 200,
      'has content': (r) => r.body.includes('<!DOCTYPE html>'),
      'response time < 500ms': (r) => r.timings.duration < 500,
    });
    
    errorRate.add(!success);
  });

  sleep(1);

  group('Product List', () => {
    const res = http.get(`${BASE_URL}/api/products`, {
      headers: { Accept: 'application/json' },
    });

    check(res, {
      'status is 200': (r) => r.status === 200,
      'has products': (r) => JSON.parse(r.body).products.length > 0,
      'response time < 200ms': (r) => r.timings.duration < 200,
    });
  });

  sleep(1);

  group('Product Detail', () => {
    const productId = 'sample-product';
    const res = http.get(`${BASE_URL}/products/${productId}`);

    check(res, {
      'status is 200': (r) => r.status === 200,
      'has product info': (r) => r.body.includes(productId),
    });
  });

  sleep(Math.random() * 3);
}

export function handleSummary(data) {
  return {
    'summary.json': JSON.stringify(data, null, 2),
    stdout: textSummary(data, { indent: ' ', enableColors: true }),
  };
}
```

### User Journey Test

```javascript
// tests/load/k6/user-journey.js
import http from 'k6/http';
import { check, sleep, group, fail } from 'k6';
import { SharedArray } from 'k6/data';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

// Load test data
const users = new SharedArray('users', () => {
  return JSON.parse(open('./data/users.json'));
});

const products = new SharedArray('products', () => {
  return JSON.parse(open('./data/products.json'));
});

export const options = {
  scenarios: {
    user_journey: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '2m', target: 20 },
        { duration: '5m', target: 20 },
        { duration: '1m', target: 0 },
      ],
    },
  },
  thresholds: {
    'group_duration{group:::Complete Purchase}': ['p(95)<10000'],
    http_req_failed: ['rate<0.05'],
  },
};

export default function () {
  const user = users[Math.floor(Math.random() * users.length)];
  const product = products[Math.floor(Math.random() * products.length)];

  group('Browse Homepage', () => {
    const res = http.get(`${BASE_URL}/`);
    check(res, { 'homepage loaded': (r) => r.status === 200 });
    sleep(2 + Math.random() * 3);
  });

  group('Search Products', () => {
    const res = http.get(`${BASE_URL}/api/products?search=${product.category}`);
    check(res, { 'search works': (r) => r.status === 200 });
    sleep(1 + Math.random() * 2);
  });

  group('View Product', () => {
    const res = http.get(`${BASE_URL}/products/${product.id}`);
    check(res, { 'product page loaded': (r) => r.status === 200 });
    sleep(3 + Math.random() * 5);
  });

  group('Add to Cart', () => {
    const res = http.post(
      `${BASE_URL}/api/cart`,
      JSON.stringify({ productId: product.id, quantity: 1 }),
      { headers: { 'Content-Type': 'application/json' } }
    );
    check(res, { 'added to cart': (r) => r.status === 200 || r.status === 201 });
    sleep(1);
  });

  // 30% of users proceed to checkout
  if (Math.random() < 0.3) {
    group('Complete Purchase', () => {
      // Login
      const loginRes = http.post(
        `${BASE_URL}/api/auth/login`,
        JSON.stringify({ email: user.email, password: user.password }),
        { headers: { 'Content-Type': 'application/json' } }
      );
      
      if (!check(loginRes, { 'logged in': (r) => r.status === 200 })) {
        fail('Login failed');
        return;
      }

      const token = JSON.parse(loginRes.body).token;
      const authHeaders = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      };

      sleep(1);

      // Checkout
      const checkoutRes = http.post(
        `${BASE_URL}/api/checkout`,
        JSON.stringify({
          paymentMethod: 'card',
          shippingAddress: user.address,
        }),
        { headers: authHeaders }
      );

      check(checkoutRes, {
        'checkout successful': (r) => r.status === 200 || r.status === 201,
      });
    });
  }
}
```

### Artillery Configuration

```yaml
# tests/load/artillery/config.yml
config:
  target: "http://localhost:3000"
  phases:
    - duration: 60
      arrivalRate: 5
      name: "Warm up"
    - duration: 120
      arrivalRate: 10
      rampTo: 50
      name: "Ramp up load"
    - duration: 300
      arrivalRate: 50
      name: "Sustained load"
    - duration: 60
      arrivalRate: 50
      rampTo: 5
      name: "Ramp down"
  
  plugins:
    expect: {}
    metrics-by-endpoint: {}

  defaults:
    headers:
      Accept: "application/json"

  variables:
    productIds:
      - "prod_1"
      - "prod_2"
      - "prod_3"

  ensure:
    p99: 1000
    maxErrorRate: 1

scenarios:
  - name: "Browse and purchase"
    weight: 70
    flow:
      - get:
          url: "/"
          capture:
            - json: "$.csrfToken"
              as: "csrfToken"
      - think: 2
      
      - get:
          url: "/api/products"
          expect:
            - statusCode: 200
            - contentType: application/json
      - think: 1
      
      - get:
          url: "/products/{{ $randomString(productIds) }}"
          expect:
            - statusCode: 200
      - think: 3
      
      - post:
          url: "/api/cart"
          json:
            productId: "{{ $randomString(productIds) }}"
            quantity: 1
          expect:
            - statusCode:
                - 200
                - 201

  - name: "Quick browse"
    weight: 30
    flow:
      - get:
          url: "/"
      - think: 1
      - get:
          url: "/api/products?limit=20"
      - think: 2
      - get:
          url: "/products/{{ $randomString(productIds) }}"
```

### API Load Test

```javascript
// tests/load/k6/api-load.js
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Counter, Rate, Trend } from 'k6/metrics';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

// Metrics
const requests = new Counter('api_requests');
const errors = new Rate('api_errors');
const latency = new Trend('api_latency');

export const options = {
  scenarios: {
    api_load: {
      executor: 'constant-arrival-rate',
      rate: 100,           // 100 requests per second
      timeUnit: '1s',
      duration: '5m',
      preAllocatedVUs: 50,
      maxVUs: 200,
    },
  },
  thresholds: {
    api_latency: ['p(95)<200', 'p(99)<500'],
    api_errors: ['rate<0.01'],
  },
};

const endpoints = [
  { path: '/api/products', weight: 40 },
  { path: '/api/products/1', weight: 30 },
  { path: '/api/categories', weight: 20 },
  { path: '/api/cart', weight: 10 },
];

function selectEndpoint() {
  const random = Math.random() * 100;
  let sum = 0;
  for (const endpoint of endpoints) {
    sum += endpoint.weight;
    if (random < sum) return endpoint.path;
  }
  return endpoints[0].path;
}

export default function () {
  const endpoint = selectEndpoint();
  const start = Date.now();
  
  const res = http.get(`${BASE_URL}${endpoint}`, {
    headers: { Accept: 'application/json' },
    tags: { endpoint },
  });

  latency.add(Date.now() - start);
  requests.add(1);

  const success = check(res, {
    'status is 2xx': (r) => r.status >= 200 && r.status < 300,
    'response time OK': (r) => r.timings.duration < 500,
  });

  errors.add(!success);
}
```

### Database Connection Test

```javascript
// tests/load/k6/database-load.js
import http from 'k6/http';
import { check } from 'k6';
import { Trend } from 'k6/metrics';

const queryTime = new Trend('db_query_time');

export const options = {
  scenarios: {
    db_connections: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '1m', target: 10 },
        { duration: '2m', target: 50 },
        { duration: '3m', target: 100 },
        { duration: '2m', target: 200 },
        { duration: '1m', target: 0 },
      ],
    },
  },
  thresholds: {
    db_query_time: ['p(95)<100'],
    http_req_failed: ['rate<0.05'],
  },
};

export default function () {
  // Complex query endpoint
  const res = http.get(`${__ENV.BASE_URL}/api/reports/sales?range=30d`, {
    headers: { Authorization: `Bearer ${__ENV.API_TOKEN}` },
  });

  check(res, {
    'query successful': (r) => r.status === 200,
  });

  // Extract query time from response header
  const dbTime = res.headers['X-Database-Time'];
  if (dbTime) {
    queryTime.add(parseFloat(dbTime));
  }
}
```

### CI/CD Integration

```yaml
# .github/workflows/load-tests.yml
name: Load Tests

on:
  schedule:
    - cron: '0 2 * * *'  # Daily at 2 AM
  workflow_dispatch:
    inputs:
      test_type:
        description: 'Test type'
        required: true
        default: 'load'
        type: choice
        options:
          - smoke
          - load
          - stress
          - spike

jobs:
  load-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Install k6
        run: |
          curl https://github.com/grafana/k6/releases/download/v0.47.0/k6-v0.47.0-linux-amd64.tar.gz -L | tar xvz
          sudo mv k6-v0.47.0-linux-amd64/k6 /usr/local/bin/

      - name: Run load test
        run: |
          k6 run tests/load/k6/main.js \
            --env BASE_URL=${{ secrets.STAGING_URL }} \
            --out json=results.json
        env:
          K6_SCENARIO: ${{ github.event.inputs.test_type || 'load' }}

      - name: Upload results
        uses: actions/upload-artifact@v4
        with:
          name: load-test-results
          path: results.json

      - name: Check thresholds
        run: |
          if grep -q '"thresholds":{".*":false' results.json; then
            echo "Thresholds failed!"
            exit 1
          fi
```

### Results Reporter

```typescript
// scripts/load-test-report.ts
import fs from 'fs';

interface K6Results {
  metrics: {
    http_req_duration: {
      values: {
        avg: number;
        min: number;
        max: number;
        p95: number;
        p99: number;
      };
    };
    http_req_failed: {
      values: { rate: number };
    };
    http_reqs: {
      values: { count: number; rate: number };
    };
  };
  thresholds: Record<string, boolean>;
}

function generateReport(results: K6Results): string {
  const { metrics, thresholds } = results;
  
  const lines = [
    '# Load Test Report',
    '',
    '## Summary',
    `- Total Requests: ${metrics.http_reqs.values.count}`,
    `- Request Rate: ${metrics.http_reqs.values.rate.toFixed(2)}/s`,
    `- Error Rate: ${(metrics.http_req_failed.values.rate * 100).toFixed(2)}%`,
    '',
    '## Response Times',
    `- Average: ${metrics.http_req_duration.values.avg.toFixed(2)}ms`,
    `- Min: ${metrics.http_req_duration.values.min.toFixed(2)}ms`,
    `- Max: ${metrics.http_req_duration.values.max.toFixed(2)}ms`,
    `- p95: ${metrics.http_req_duration.values.p95.toFixed(2)}ms`,
    `- p99: ${metrics.http_req_duration.values.p99.toFixed(2)}ms`,
    '',
    '## Thresholds',
    ...Object.entries(thresholds).map(
      ([name, passed]) => `- ${passed ? '✅' : '❌'} ${name}`
    ),
  ];

  return lines.join('\n');
}

const results = JSON.parse(fs.readFileSync('results.json', 'utf-8'));
console.log(generateReport(results));
```

## Anti-patterns

```typescript
// BAD: Testing with unrealistic data
const users = Array(1000).fill({ email: 'test@test.com' }); // Same user!

// GOOD: Use varied test data
const users = loadTestUsers(); // Unique users

// BAD: No warm-up phase
stages: [
  { duration: '5m', target: 1000 }, // Instant high load
]

// GOOD: Gradual ramp-up
stages: [
  { duration: '2m', target: 100 },
  { duration: '5m', target: 500 },
  { duration: '5m', target: 1000 },
]

// BAD: Testing only happy paths
http.get('/api/products');

// GOOD: Include error scenarios
http.get('/api/products/invalid-id'); // 404
http.post('/api/products', 'invalid'); // 400
```

## Related Patterns

- `performance-testing.md` - Performance validation
- `api-testing.md` - API testing
- `rate-limiting.md` - Rate limiting
- `caching.md` - Cache strategies

## Changelog

### 2.0.0 (2025-01-18)
- Standardized to atomic design system v2
- Updated frontmatter schema

- 2024-01-15: Initial load testing pattern
