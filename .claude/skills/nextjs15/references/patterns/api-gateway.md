---
id: pt-api-gateway
name: API Gateway
version: 1.0.0
layer: L5
category: infrastructure
description: Implement API Gateway pattern for request routing, service aggregation, auth centralization, and rate limiting per service
tags: [api-gateway, routing, aggregation, rate-limiting, auth, microservices, next15]
composes: []
dependencies:
  "ioredis": "^5.3.0"
  "zod": "^3.22.0"
  "@upstash/ratelimit": "^1.0.0"
formula: "API Gateway = Routing (dispatch) + Auth (guard) + Rate Limiting (throttle) + Aggregation (compose)"
performance:
  impact: medium
  lcp: neutral
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# API Gateway

## Overview

An API Gateway serves as the single entry point for all client requests in a microservices architecture, handling cross-cutting concerns like authentication, rate limiting, request routing, and response aggregation. Instead of clients communicating directly with multiple backend services, they interact with the gateway which orchestrates requests, enforces policies, and provides a unified API surface.

In Next.js 15 applications, the API Gateway pattern enables sophisticated request handling through API routes and middleware. This pattern implements a complete gateway with intelligent routing based on paths and headers, centralized authentication and authorization, per-service and per-user rate limiting, request/response transformation, service aggregation for reducing round trips, circuit breaking for fault tolerance, and comprehensive request logging.

Modern applications often consist of multiple microservices, each with different protocols, authentication requirements, and rate limits. The API Gateway abstracts this complexity from clients, providing a consistent interface while handling the intricacies of service communication, retry logic, and graceful degradation when services are unavailable.

## When to Use

Use this pattern when:
- You have multiple backend services that clients need to access
- You want to centralize authentication and authorization logic
- Different services require different rate limiting policies
- Clients need aggregated data from multiple services in single requests
- You want to abstract internal service architecture from clients
- You need request/response transformation between clients and services
- Circuit breaking and retry logic need central management
- API versioning needs to be handled consistently

## When NOT to Use

Avoid this pattern when:
- You have a simple monolithic application
- Direct service-to-service communication is preferred
- The overhead of an additional network hop is unacceptable
- You lack the infrastructure to maintain a gateway
- Services are accessed by internal systems only

## Composition Diagram

```
API GATEWAY ARCHITECTURE
=========================

┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT REQUESTS                                 │
│                    Mobile App | Web App | Third-Party                       │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              API GATEWAY                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐        │
│  │   INGRESS       │    │   MIDDLEWARE    │    │    EGRESS       │        │
│  │   PIPELINE      │    │    CHAIN        │    │   PIPELINE      │        │
│  ├─────────────────┤    ├─────────────────┤    ├─────────────────┤        │
│  │• Request Parse  │───▶│• Authentication │───▶│• Load Balancer  │        │
│  │• Validation     │    │• Authorization  │    │• Circuit Breaker│        │
│  │• Rate Limiting  │    │• Rate Limit     │    │• Retry Logic    │        │
│  │• Request ID     │    │• Transformation │    │• Timeout        │        │
│  └─────────────────┘    └─────────────────┘    └─────────────────┘        │
│                                                         │                  │
│  ┌──────────────────────────────────────────────────────┼────────────────┐ │
│  │                         ROUTER                       │                │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │                │ │
│  │  │  /api/users │  │ /api/orders │  │ /api/search │  │                │ │
│  │  │   → User    │  │   → Order   │  │   → Search  │  │                │ │
│  │  │    Service  │  │    Service  │  │   Service   │  │                │ │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  │                │ │
│  └──────────────────────────────────────────────────────┘                │ │
│                                                                           │ │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │                      SERVICE AGGREGATOR                               │ │
│  │  /api/dashboard → [User Service] + [Order Service] + [Analytics]     │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
        ┌─────────────────────────────┼─────────────────────────────┐
        │                             │                             │
        ▼                             ▼                             ▼
┌───────────────┐           ┌───────────────┐           ┌───────────────┐
│  User Service │           │ Order Service │           │Search Service │
│  :3001        │           │  :3002        │           │  :3003        │
└───────────────┘           └───────────────┘           └───────────────┘

Rate Limiting Tiers:
┌─────────────────────────────────────────────────────────────────────────────┐
│  Tier       │ Requests/min │ Burst │ Services                              │
├─────────────┼──────────────┼───────┼───────────────────────────────────────┤
│  Anonymous  │     60       │  10   │ Public endpoints only                 │
│  Basic      │    300       │  50   │ All authenticated endpoints           │
│  Pro        │   1000       │ 200   │ All endpoints + aggregations          │
│  Enterprise │  10000       │ 500   │ Unlimited + priority routing          │
└─────────────────────────────────────────────────────────────────────────────┘

Circuit Breaker States:
┌──────────┐     Failure Rate > 50%      ┌──────────┐
│  CLOSED  │ ─────────────────────────▶  │   OPEN   │
│ (normal) │                             │ (failing)│
└────┬─────┘                             └────┬─────┘
     │                                        │
     │           Success                      │ After timeout
     │                                        ▼
     │                              ┌──────────────────┐
     └─────────────────────────────│   HALF-OPEN      │
                                   │  (testing)       │
                                   └──────────────────┘
```

## Implementation

### Core Types and Configuration

```typescript
// lib/api-gateway/types.ts
import { z } from 'zod';

export interface ServiceConfig {
  name: string;
  baseUrl: string;
  timeout: number;
  retries: number;
  healthCheck: string;
  circuitBreaker: CircuitBreakerConfig;
  rateLimits: Record<string, RateLimitConfig>;
}

export interface CircuitBreakerConfig {
  failureThreshold: number;
  successThreshold: number;
  timeout: number; // milliseconds to wait before half-open
  windowSize: number; // milliseconds for failure rate calculation
}

export interface RateLimitConfig {
  requests: number;
  window: number; // seconds
  burst?: number;
}

export interface RouteConfig {
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | '*';
  service: string;
  servicePath?: string;
  requiresAuth: boolean;
  permissions?: string[];
  rateLimit?: string;
  timeout?: number;
  cache?: CacheConfig;
  transform?: TransformConfig;
}

export interface CacheConfig {
  ttl: number;
  staleWhileRevalidate?: number;
  tags?: string[];
}

export interface TransformConfig {
  request?: (req: GatewayRequest) => GatewayRequest;
  response?: (res: GatewayResponse) => GatewayResponse;
}

export interface AggregationConfig {
  path: string;
  method: 'GET' | 'POST';
  requiresAuth: boolean;
  services: {
    name: string;
    path: string;
    as: string;
    optional?: boolean;
  }[];
  merge?: (results: Record<string, unknown>) => unknown;
}

export interface GatewayRequest {
  method: string;
  path: string;
  headers: Record<string, string>;
  query: Record<string, string>;
  body?: unknown;
  user?: {
    id: string;
    role: string;
    permissions: string[];
    tier: string;
  };
  metadata: {
    requestId: string;
    timestamp: Date;
    clientIp: string;
    userAgent: string;
  };
}

export interface GatewayResponse {
  status: number;
  headers: Record<string, string>;
  body: unknown;
  metadata: {
    requestId: string;
    latency: number;
    service: string;
    cached: boolean;
  };
}

export type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

export const GatewayRequestSchema = z.object({
  method: z.string(),
  path: z.string(),
  headers: z.record(z.string()),
  query: z.record(z.string()),
  body: z.unknown().optional(),
});
```

### Gateway Configuration

```typescript
// lib/api-gateway/config.ts
import { ServiceConfig, RouteConfig, AggregationConfig } from './types';

export const services: Record<string, ServiceConfig> = {
  users: {
    name: 'users',
    baseUrl: process.env.USER_SERVICE_URL || 'http://localhost:3001',
    timeout: 5000,
    retries: 2,
    healthCheck: '/health',
    circuitBreaker: {
      failureThreshold: 5,
      successThreshold: 2,
      timeout: 30000,
      windowSize: 60000,
    },
    rateLimits: {
      default: { requests: 100, window: 60 },
      search: { requests: 30, window: 60 },
    },
  },
  orders: {
    name: 'orders',
    baseUrl: process.env.ORDER_SERVICE_URL || 'http://localhost:3002',
    timeout: 10000,
    retries: 3,
    healthCheck: '/health',
    circuitBreaker: {
      failureThreshold: 3,
      successThreshold: 2,
      timeout: 60000,
      windowSize: 60000,
    },
    rateLimits: {
      default: { requests: 50, window: 60 },
      create: { requests: 10, window: 60 },
    },
  },
  search: {
    name: 'search',
    baseUrl: process.env.SEARCH_SERVICE_URL || 'http://localhost:3003',
    timeout: 3000,
    retries: 1,
    healthCheck: '/health',
    circuitBreaker: {
      failureThreshold: 10,
      successThreshold: 3,
      timeout: 15000,
      windowSize: 30000,
    },
    rateLimits: {
      default: { requests: 200, window: 60 },
    },
  },
  analytics: {
    name: 'analytics',
    baseUrl: process.env.ANALYTICS_SERVICE_URL || 'http://localhost:3004',
    timeout: 8000,
    retries: 2,
    healthCheck: '/health',
    circuitBreaker: {
      failureThreshold: 5,
      successThreshold: 2,
      timeout: 30000,
      windowSize: 60000,
    },
    rateLimits: {
      default: { requests: 20, window: 60 },
    },
  },
};

export const routes: RouteConfig[] = [
  // User service routes
  {
    path: '/api/users',
    method: 'GET',
    service: 'users',
    servicePath: '/users',
    requiresAuth: true,
    permissions: ['users:read'],
    rateLimit: 'default',
  },
  {
    path: '/api/users/:id',
    method: 'GET',
    service: 'users',
    servicePath: '/users/:id',
    requiresAuth: true,
    permissions: ['users:read'],
    cache: { ttl: 60, staleWhileRevalidate: 300 },
  },
  {
    path: '/api/users',
    method: 'POST',
    service: 'users',
    servicePath: '/users',
    requiresAuth: true,
    permissions: ['users:write'],
    rateLimit: 'create',
  },
  {
    path: '/api/users/search',
    method: 'GET',
    service: 'users',
    servicePath: '/users/search',
    requiresAuth: true,
    rateLimit: 'search',
  },

  // Order service routes
  {
    path: '/api/orders',
    method: 'GET',
    service: 'orders',
    servicePath: '/orders',
    requiresAuth: true,
    permissions: ['orders:read'],
  },
  {
    path: '/api/orders/:id',
    method: 'GET',
    service: 'orders',
    servicePath: '/orders/:id',
    requiresAuth: true,
    permissions: ['orders:read'],
  },
  {
    path: '/api/orders',
    method: 'POST',
    service: 'orders',
    servicePath: '/orders',
    requiresAuth: true,
    permissions: ['orders:write'],
    rateLimit: 'create',
    timeout: 15000, // Longer timeout for order creation
  },

  // Search service routes
  {
    path: '/api/search',
    method: 'GET',
    service: 'search',
    servicePath: '/search',
    requiresAuth: false,
    cache: { ttl: 30 },
  },

  // Analytics routes (admin only)
  {
    path: '/api/analytics/*',
    method: '*',
    service: 'analytics',
    servicePath: '/analytics/*',
    requiresAuth: true,
    permissions: ['analytics:read'],
  },
];

export const aggregations: AggregationConfig[] = [
  {
    path: '/api/dashboard',
    method: 'GET',
    requiresAuth: true,
    services: [
      { name: 'users', path: '/users/me', as: 'user' },
      { name: 'orders', path: '/orders/recent', as: 'recentOrders' },
      { name: 'analytics', path: '/analytics/summary', as: 'analytics', optional: true },
    ],
    merge: (results) => ({
      user: results.user,
      orders: results.recentOrders,
      analytics: results.analytics || null,
    }),
  },
  {
    path: '/api/checkout/summary',
    method: 'POST',
    requiresAuth: true,
    services: [
      { name: 'users', path: '/users/me/address', as: 'address' },
      { name: 'orders', path: '/orders/cart', as: 'cart' },
      { name: 'orders', path: '/orders/shipping-options', as: 'shipping' },
    ],
  },
];

export const tierRateLimits: Record<string, { requests: number; window: number; burst: number }> = {
  anonymous: { requests: 60, window: 60, burst: 10 },
  basic: { requests: 300, window: 60, burst: 50 },
  pro: { requests: 1000, window: 60, burst: 200 },
  enterprise: { requests: 10000, window: 60, burst: 500 },
};
```

### Rate Limiter

```typescript
// lib/api-gateway/rate-limiter.ts
import Redis from 'ioredis';
import { RateLimitConfig } from './types';
import { tierRateLimits } from './config';

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  reset: number;
  limit: number;
}

export class RateLimiter {
  private redis: Redis;

  constructor(redisUrl: string) {
    this.redis = new Redis(redisUrl);
  }

  async checkLimit(
    identifier: string,
    config: RateLimitConfig,
    tier?: string
  ): Promise<RateLimitResult> {
    // Apply tier multiplier if applicable
    const tierConfig = tier ? tierRateLimits[tier] : null;
    const effectiveLimit = tierConfig
      ? Math.max(config.requests, tierConfig.requests)
      : config.requests;
    const effectiveWindow = config.window;

    const key = `ratelimit:${identifier}`;
    const now = Date.now();
    const windowStart = now - effectiveWindow * 1000;

    // Use Redis sorted set for sliding window
    const multi = this.redis.multi();

    // Remove old entries
    multi.zremrangebyscore(key, 0, windowStart);

    // Count current requests
    multi.zcard(key);

    // Add current request
    multi.zadd(key, now.toString(), `${now}:${Math.random()}`);

    // Set expiry
    multi.expire(key, effectiveWindow);

    const results = await multi.exec();
    const currentCount = (results?.[1]?.[1] as number) || 0;

    const allowed = currentCount < effectiveLimit;
    const remaining = Math.max(0, effectiveLimit - currentCount - 1);
    const reset = Math.ceil((windowStart + effectiveWindow * 1000) / 1000);

    return {
      allowed,
      remaining,
      reset,
      limit: effectiveLimit,
    };
  }

  async checkBurst(identifier: string, burst: number): Promise<boolean> {
    const key = `burst:${identifier}`;

    // Token bucket algorithm
    const tokens = await this.redis.get(key);
    const currentTokens = tokens ? parseInt(tokens, 10) : burst;

    if (currentTokens <= 0) {
      return false;
    }

    await this.redis.setex(key, 1, (currentTokens - 1).toString());
    return true;
  }

  async getHeaders(result: RateLimitResult): Promise<Record<string, string>> {
    return {
      'X-RateLimit-Limit': result.limit.toString(),
      'X-RateLimit-Remaining': result.remaining.toString(),
      'X-RateLimit-Reset': result.reset.toString(),
    };
  }

  async close(): Promise<void> {
    await this.redis.quit();
  }
}

// Singleton instance
let rateLimiter: RateLimiter | null = null;

export function getRateLimiter(): RateLimiter {
  if (!rateLimiter) {
    rateLimiter = new RateLimiter(process.env.REDIS_URL || 'redis://localhost:6379');
  }
  return rateLimiter;
}
```

### Circuit Breaker

```typescript
// lib/api-gateway/circuit-breaker.ts
import Redis from 'ioredis';
import { CircuitBreakerConfig, CircuitState } from './types';

interface CircuitStatus {
  state: CircuitState;
  failures: number;
  successes: number;
  lastFailure?: Date;
  lastSuccess?: Date;
  nextRetry?: Date;
}

export class CircuitBreaker {
  private redis: Redis;
  private config: CircuitBreakerConfig;
  private serviceName: string;

  constructor(redis: Redis, serviceName: string, config: CircuitBreakerConfig) {
    this.redis = redis;
    this.serviceName = serviceName;
    this.config = config;
  }

  private getKey(): string {
    return `circuit:${this.serviceName}`;
  }

  async getStatus(): Promise<CircuitStatus> {
    const data = await this.redis.hgetall(this.getKey());

    if (!data || Object.keys(data).length === 0) {
      return {
        state: 'CLOSED',
        failures: 0,
        successes: 0,
      };
    }

    return {
      state: (data.state as CircuitState) || 'CLOSED',
      failures: parseInt(data.failures || '0', 10),
      successes: parseInt(data.successes || '0', 10),
      lastFailure: data.lastFailure ? new Date(data.lastFailure) : undefined,
      lastSuccess: data.lastSuccess ? new Date(data.lastSuccess) : undefined,
      nextRetry: data.nextRetry ? new Date(data.nextRetry) : undefined,
    };
  }

  async canExecute(): Promise<boolean> {
    const status = await this.getStatus();

    switch (status.state) {
      case 'CLOSED':
        return true;

      case 'OPEN':
        // Check if timeout has passed
        if (status.nextRetry && new Date() >= status.nextRetry) {
          // Transition to half-open
          await this.transitionTo('HALF_OPEN');
          return true;
        }
        return false;

      case 'HALF_OPEN':
        return true;

      default:
        return true;
    }
  }

  async recordSuccess(): Promise<void> {
    const status = await this.getStatus();
    const now = new Date().toISOString();

    if (status.state === 'HALF_OPEN') {
      const newSuccesses = status.successes + 1;

      if (newSuccesses >= this.config.successThreshold) {
        // Close the circuit
        await this.transitionTo('CLOSED');
      } else {
        await this.redis.hset(this.getKey(), {
          successes: newSuccesses.toString(),
          lastSuccess: now,
        });
      }
    } else {
      await this.redis.hset(this.getKey(), {
        lastSuccess: now,
        successes: '0',
        failures: '0',
      });
    }
  }

  async recordFailure(): Promise<void> {
    const status = await this.getStatus();
    const now = new Date();

    if (status.state === 'HALF_OPEN') {
      // Immediately open on failure during half-open
      await this.transitionTo('OPEN');
      return;
    }

    const newFailures = status.failures + 1;

    await this.redis.hset(this.getKey(), {
      failures: newFailures.toString(),
      lastFailure: now.toISOString(),
    });

    // Check if we need to open the circuit
    if (newFailures >= this.config.failureThreshold) {
      await this.transitionTo('OPEN');
    }
  }

  private async transitionTo(state: CircuitState): Promise<void> {
    const now = new Date();
    const updates: Record<string, string> = {
      state,
    };

    if (state === 'OPEN') {
      updates.nextRetry = new Date(now.getTime() + this.config.timeout).toISOString();
      updates.failures = '0';
      updates.successes = '0';
    } else if (state === 'CLOSED') {
      updates.failures = '0';
      updates.successes = '0';
    } else if (state === 'HALF_OPEN') {
      updates.successes = '0';
    }

    await this.redis.hset(this.getKey(), updates);
    await this.redis.expire(this.getKey(), Math.ceil(this.config.windowSize / 1000) * 2);

    console.log(`Circuit breaker for ${this.serviceName} transitioned to ${state}`);
  }

  async reset(): Promise<void> {
    await this.redis.del(this.getKey());
  }
}

// Circuit breaker manager
export class CircuitBreakerManager {
  private redis: Redis;
  private breakers: Map<string, CircuitBreaker> = new Map();

  constructor(redisUrl: string) {
    this.redis = new Redis(redisUrl);
  }

  getBreaker(serviceName: string, config: CircuitBreakerConfig): CircuitBreaker {
    let breaker = this.breakers.get(serviceName);
    if (!breaker) {
      breaker = new CircuitBreaker(this.redis, serviceName, config);
      this.breakers.set(serviceName, breaker);
    }
    return breaker;
  }

  async getStatuses(): Promise<Record<string, CircuitStatus>> {
    const statuses: Record<string, CircuitStatus> = {};
    for (const [name, breaker] of this.breakers) {
      statuses[name] = await breaker.getStatus();
    }
    return statuses;
  }

  async close(): Promise<void> {
    await this.redis.quit();
  }
}

// Singleton instance
let circuitBreakerManager: CircuitBreakerManager | null = null;

export function getCircuitBreakerManager(): CircuitBreakerManager {
  if (!circuitBreakerManager) {
    circuitBreakerManager = new CircuitBreakerManager(
      process.env.REDIS_URL || 'redis://localhost:6379'
    );
  }
  return circuitBreakerManager;
}
```

### Service Client

```typescript
// lib/api-gateway/service-client.ts
import { ServiceConfig, GatewayRequest, GatewayResponse } from './types';
import { CircuitBreaker, getCircuitBreakerManager } from './circuit-breaker';

interface ServiceClientConfig extends ServiceConfig {
  circuitBreaker: CircuitBreaker;
}

export class ServiceClient {
  private config: ServiceClientConfig;
  private breaker: CircuitBreaker;

  constructor(config: ServiceConfig) {
    const manager = getCircuitBreakerManager();
    this.breaker = manager.getBreaker(config.name, config.circuitBreaker);
    this.config = { ...config, circuitBreaker: this.breaker };
  }

  async request(
    path: string,
    options: {
      method: string;
      headers?: Record<string, string>;
      body?: unknown;
      timeout?: number;
    }
  ): Promise<{ status: number; data: unknown; headers: Record<string, string> }> {
    // Check circuit breaker
    const canExecute = await this.breaker.canExecute();
    if (!canExecute) {
      throw new ServiceUnavailableError(
        `Service ${this.config.name} is unavailable (circuit open)`
      );
    }

    const url = `${this.config.baseUrl}${path}`;
    const timeout = options.timeout || this.config.timeout;

    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= this.config.retries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        const response = await fetch(url, {
          method: options.method,
          headers: {
            'Content-Type': 'application/json',
            ...options.headers,
          },
          body: options.body ? JSON.stringify(options.body) : undefined,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        // Record success for circuit breaker
        await this.breaker.recordSuccess();

        const data = await this.parseResponse(response);
        const responseHeaders: Record<string, string> = {};
        response.headers.forEach((value, key) => {
          responseHeaders[key] = value;
        });

        return {
          status: response.status,
          data,
          headers: responseHeaders,
        };
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        // Don't retry on certain errors
        if (error instanceof Error && error.name === 'AbortError') {
          lastError = new TimeoutError(
            `Request to ${this.config.name} timed out after ${timeout}ms`
          );
        }

        // Record failure for circuit breaker
        if (attempt === this.config.retries) {
          await this.breaker.recordFailure();
        }

        // Wait before retry (exponential backoff)
        if (attempt < this.config.retries) {
          await this.sleep(Math.pow(2, attempt) * 100);
        }
      }
    }

    throw lastError || new Error(`Request to ${this.config.name} failed`);
  }

  private async parseResponse(response: Response): Promise<unknown> {
    const contentType = response.headers.get('content-type');

    if (contentType?.includes('application/json')) {
      return response.json();
    }

    return response.text();
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.request(this.config.healthCheck, {
        method: 'GET',
        timeout: 5000,
      });
      return response.status === 200;
    } catch {
      return false;
    }
  }
}

export class ServiceUnavailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ServiceUnavailableError';
  }
}

export class TimeoutError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TimeoutError';
  }
}

// Service client factory
const serviceClients: Map<string, ServiceClient> = new Map();

export function getServiceClient(config: ServiceConfig): ServiceClient {
  let client = serviceClients.get(config.name);
  if (!client) {
    client = new ServiceClient(config);
    serviceClients.set(config.name, client);
  }
  return client;
}
```

### Router

```typescript
// lib/api-gateway/router.ts
import { RouteConfig, AggregationConfig, GatewayRequest } from './types';
import { routes, aggregations, services } from './config';

interface MatchedRoute {
  route: RouteConfig;
  params: Record<string, string>;
}

interface MatchedAggregation {
  aggregation: AggregationConfig;
  params: Record<string, string>;
}

export class Router {
  private routes: RouteConfig[];
  private aggregations: AggregationConfig[];

  constructor() {
    this.routes = routes;
    this.aggregations = aggregations;
  }

  matchRoute(request: GatewayRequest): MatchedRoute | null {
    for (const route of this.routes) {
      // Check method
      if (route.method !== '*' && route.method !== request.method) {
        continue;
      }

      // Check path
      const params = this.matchPath(route.path, request.path);
      if (params !== null) {
        return { route, params };
      }
    }
    return null;
  }

  matchAggregation(request: GatewayRequest): MatchedAggregation | null {
    for (const aggregation of this.aggregations) {
      if (aggregation.method !== request.method) {
        continue;
      }

      const params = this.matchPath(aggregation.path, request.path);
      if (params !== null) {
        return { aggregation, params };
      }
    }
    return null;
  }

  private matchPath(
    pattern: string,
    path: string
  ): Record<string, string> | null {
    // Handle wildcard patterns
    if (pattern.endsWith('/*')) {
      const prefix = pattern.slice(0, -2);
      if (path.startsWith(prefix)) {
        return { '*': path.slice(prefix.length) };
      }
      return null;
    }

    const patternParts = pattern.split('/').filter(Boolean);
    const pathParts = path.split('/').filter(Boolean);

    if (patternParts.length !== pathParts.length) {
      return null;
    }

    const params: Record<string, string> = {};

    for (let i = 0; i < patternParts.length; i++) {
      const patternPart = patternParts[i];
      const pathPart = pathParts[i];

      if (patternPart.startsWith(':')) {
        // Parameter
        params[patternPart.slice(1)] = pathPart;
      } else if (patternPart !== pathPart) {
        // Mismatch
        return null;
      }
    }

    return params;
  }

  buildServicePath(
    servicePath: string,
    params: Record<string, string>
  ): string {
    let result = servicePath;

    // Replace parameters
    for (const [key, value] of Object.entries(params)) {
      result = result.replace(`:${key}`, value);
    }

    // Handle wildcard
    if (params['*']) {
      result = result.replace('*', params['*']);
    }

    return result;
  }

  getServiceConfig(serviceName: string) {
    return services[serviceName];
  }
}

// Singleton instance
let router: Router | null = null;

export function getRouter(): Router {
  if (!router) {
    router = new Router();
  }
  return router;
}
```

### Request Handler

```typescript
// lib/api-gateway/handler.ts
import { NextRequest, NextResponse } from 'next/server';
import { GatewayRequest, GatewayResponse, RouteConfig } from './types';
import { getRouter } from './router';
import { getRateLimiter } from './rate-limiter';
import { getServiceClient } from './service-client';
import { auth } from '@/lib/auth';
import { hasPermission, type Role } from '@/lib/auth/permissions';
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

export async function handleGatewayRequest(
  request: NextRequest
): Promise<NextResponse> {
  const startTime = performance.now();
  const requestId = crypto.randomUUID();

  try {
    // Build gateway request
    const gatewayRequest = await buildGatewayRequest(request, requestId);

    // Try aggregation first
    const router = getRouter();
    const aggregationMatch = router.matchAggregation(gatewayRequest);

    if (aggregationMatch) {
      return await handleAggregation(
        gatewayRequest,
        aggregationMatch.aggregation,
        aggregationMatch.params,
        startTime
      );
    }

    // Try regular route
    const routeMatch = router.matchRoute(gatewayRequest);

    if (!routeMatch) {
      return createErrorResponse(404, 'Not Found', requestId);
    }

    return await handleRoute(
      gatewayRequest,
      routeMatch.route,
      routeMatch.params,
      startTime
    );
  } catch (error) {
    console.error('Gateway error:', error);
    return createErrorResponse(
      500,
      error instanceof Error ? error.message : 'Internal Server Error',
      requestId
    );
  }
}

async function buildGatewayRequest(
  request: NextRequest,
  requestId: string
): Promise<GatewayRequest> {
  const session = await auth();
  const headers: Record<string, string> = {};
  request.headers.forEach((value, key) => {
    headers[key] = value;
  });

  const query: Record<string, string> = {};
  request.nextUrl.searchParams.forEach((value, key) => {
    query[key] = value;
  });

  let body: unknown;
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    try {
      body = await request.json();
    } catch {
      // No body or not JSON
    }
  }

  return {
    method: request.method,
    path: request.nextUrl.pathname,
    headers,
    query,
    body,
    user: session?.user
      ? {
          id: session.user.id!,
          role: session.user.role as string,
          permissions: session.user.permissions || [],
          tier: session.user.tier || 'basic',
        }
      : undefined,
    metadata: {
      requestId,
      timestamp: new Date(),
      clientIp:
        request.headers.get('x-forwarded-for')?.split(',')[0] ||
        request.headers.get('x-real-ip') ||
        'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
    },
  };
}

async function handleRoute(
  request: GatewayRequest,
  route: RouteConfig,
  params: Record<string, string>,
  startTime: number
): Promise<NextResponse> {
  const router = getRouter();
  const requestId = request.metadata.requestId;

  // Authentication check
  if (route.requiresAuth && !request.user) {
    return createErrorResponse(401, 'Authentication required', requestId);
  }

  // Authorization check
  if (route.permissions && route.permissions.length > 0) {
    const hasAccess = route.permissions.some((permission) =>
      request.user?.permissions.includes(permission)
    );
    if (!hasAccess) {
      return createErrorResponse(403, 'Insufficient permissions', requestId);
    }
  }

  // Rate limiting
  const rateLimiter = getRateLimiter();
  const rateLimitKey = request.user?.id || request.metadata.clientIp;
  const serviceConfig = router.getServiceConfig(route.service);
  const rateLimitConfig = serviceConfig.rateLimits[route.rateLimit || 'default'];

  if (rateLimitConfig) {
    const result = await rateLimiter.checkLimit(
      `${route.service}:${rateLimitKey}`,
      rateLimitConfig,
      request.user?.tier
    );

    if (!result.allowed) {
      const headers = await rateLimiter.getHeaders(result);
      return new NextResponse(
        JSON.stringify({ error: 'Rate limit exceeded' }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'X-Request-Id': requestId,
            ...headers,
          },
        }
      );
    }
  }

  // Check cache
  if (route.cache && request.method === 'GET') {
    const cacheKey = `cache:${route.service}:${request.path}:${JSON.stringify(request.query)}`;
    const cached = await redis.get(cacheKey);

    if (cached) {
      const latency = performance.now() - startTime;
      return new NextResponse(cached, {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'X-Request-Id': requestId,
          'X-Cache': 'HIT',
          'X-Latency': latency.toFixed(2),
        },
      });
    }
  }

  // Build service request
  const servicePath = router.buildServicePath(
    route.servicePath || route.path,
    params
  );

  // Apply request transform
  let transformedRequest = request;
  if (route.transform?.request) {
    transformedRequest = route.transform.request(request);
  }

  // Call service
  const client = getServiceClient(serviceConfig);

  try {
    const response = await client.request(servicePath, {
      method: request.method,
      headers: {
        'X-Request-Id': requestId,
        'X-User-Id': request.user?.id || '',
        'X-User-Role': request.user?.role || '',
        ...transformedRequest.headers,
      },
      body: transformedRequest.body,
      timeout: route.timeout || serviceConfig.timeout,
    });

    const latency = performance.now() - startTime;

    // Apply response transform
    let responseBody = response.data;
    if (route.transform?.response) {
      const transformed = route.transform.response({
        status: response.status,
        headers: response.headers,
        body: response.data,
        metadata: {
          requestId,
          latency,
          service: route.service,
          cached: false,
        },
      });
      responseBody = transformed.body;
    }

    // Cache successful GET responses
    if (route.cache && request.method === 'GET' && response.status === 200) {
      const cacheKey = `cache:${route.service}:${request.path}:${JSON.stringify(request.query)}`;
      await redis.setex(cacheKey, route.cache.ttl, JSON.stringify(responseBody));
    }

    return new NextResponse(JSON.stringify(responseBody), {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
        'X-Request-Id': requestId,
        'X-Latency': latency.toFixed(2),
        'X-Service': route.service,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.name === 'ServiceUnavailableError') {
      return createErrorResponse(503, error.message, requestId);
    }
    if (error instanceof Error && error.name === 'TimeoutError') {
      return createErrorResponse(504, error.message, requestId);
    }
    throw error;
  }
}

async function handleAggregation(
  request: GatewayRequest,
  aggregation: AggregationConfig,
  params: Record<string, string>,
  startTime: number
): Promise<NextResponse> {
  const router = getRouter();
  const requestId = request.metadata.requestId;

  // Authentication check
  if (aggregation.requiresAuth && !request.user) {
    return createErrorResponse(401, 'Authentication required', requestId);
  }

  // Fetch from all services in parallel
  const results: Record<string, unknown> = {};
  const errors: Record<string, string> = {};

  await Promise.all(
    aggregation.services.map(async (service) => {
      const serviceConfig = router.getServiceConfig(service.name);
      const client = getServiceClient(serviceConfig);

      try {
        const response = await client.request(service.path, {
          method: request.method,
          headers: {
            'X-Request-Id': requestId,
            'X-User-Id': request.user?.id || '',
          },
          body: request.body,
        });

        if (response.status >= 200 && response.status < 300) {
          results[service.as] = response.data;
        } else if (!service.optional) {
          errors[service.as] = `Service returned ${response.status}`;
        }
      } catch (error) {
        if (!service.optional) {
          errors[service.as] = error instanceof Error ? error.message : 'Unknown error';
        }
      }
    })
  );

  // Check for non-optional failures
  if (Object.keys(errors).length > 0) {
    return new NextResponse(
      JSON.stringify({ error: 'Service aggregation failed', details: errors }),
      {
        status: 502,
        headers: {
          'Content-Type': 'application/json',
          'X-Request-Id': requestId,
        },
      }
    );
  }

  // Merge results
  const merged = aggregation.merge ? aggregation.merge(results) : results;
  const latency = performance.now() - startTime;

  return new NextResponse(JSON.stringify(merged), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'X-Request-Id': requestId,
      'X-Latency': latency.toFixed(2),
      'X-Aggregated': aggregation.services.map((s) => s.name).join(','),
    },
  });
}

function createErrorResponse(
  status: number,
  message: string,
  requestId: string
): NextResponse {
  return new NextResponse(
    JSON.stringify({ error: message }),
    {
      status,
      headers: {
        'Content-Type': 'application/json',
        'X-Request-Id': requestId,
      },
    }
  );
}
```

### API Route Handler

```typescript
// app/api/gateway/[...path]/route.ts
import { NextRequest } from 'next/server';
import { handleGatewayRequest } from '@/lib/api-gateway/handler';

export async function GET(request: NextRequest) {
  return handleGatewayRequest(request);
}

export async function POST(request: NextRequest) {
  return handleGatewayRequest(request);
}

export async function PUT(request: NextRequest) {
  return handleGatewayRequest(request);
}

export async function DELETE(request: NextRequest) {
  return handleGatewayRequest(request);
}

export async function PATCH(request: NextRequest) {
  return handleGatewayRequest(request);
}
```

### Gateway Middleware

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // Only apply to gateway routes
  if (!request.nextUrl.pathname.startsWith('/api/gateway')) {
    return NextResponse.next();
  }

  const response = NextResponse.next();

  // Add CORS headers
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, DELETE, PATCH, OPTIONS'
  );
  response.headers.set(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, X-Request-Id'
  );
  response.headers.set(
    'Access-Control-Expose-Headers',
    'X-Request-Id, X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset'
  );

  // Handle preflight
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, { status: 200, headers: response.headers });
  }

  return response;
}

export const config = {
  matcher: '/api/gateway/:path*',
};
```

### Health Check and Admin Endpoints

```typescript
// app/api/gateway/admin/health/route.ts
import { NextResponse } from 'next/server';
import { services } from '@/lib/api-gateway/config';
import { getServiceClient } from '@/lib/api-gateway/service-client';
import { getCircuitBreakerManager } from '@/lib/api-gateway/circuit-breaker';

export async function GET() {
  const healthChecks: Record<string, {
    healthy: boolean;
    latency?: number;
    circuit: string;
  }> = {};

  const circuitManager = getCircuitBreakerManager();
  const circuitStatuses = await circuitManager.getStatuses();

  await Promise.all(
    Object.entries(services).map(async ([name, config]) => {
      const client = getServiceClient(config);
      const startTime = performance.now();

      try {
        const healthy = await client.healthCheck();
        const latency = performance.now() - startTime;

        healthChecks[name] = {
          healthy,
          latency: Math.round(latency),
          circuit: circuitStatuses[name]?.state || 'CLOSED',
        };
      } catch {
        healthChecks[name] = {
          healthy: false,
          circuit: circuitStatuses[name]?.state || 'UNKNOWN',
        };
      }
    })
  );

  const allHealthy = Object.values(healthChecks).every((h) => h.healthy);

  return NextResponse.json(
    {
      status: allHealthy ? 'healthy' : 'degraded',
      services: healthChecks,
      timestamp: new Date().toISOString(),
    },
    { status: allHealthy ? 200 : 503 }
  );
}

// app/api/gateway/admin/circuits/route.ts
export async function GET() {
  const circuitManager = getCircuitBreakerManager();
  const statuses = await circuitManager.getStatuses();

  return NextResponse.json({
    circuits: statuses,
    timestamp: new Date().toISOString(),
  });
}

// app/api/gateway/admin/circuits/[service]/reset/route.ts
export async function POST(
  request: Request,
  { params }: { params: { service: string } }
) {
  const { service } = params;
  const serviceConfig = services[service];

  if (!serviceConfig) {
    return NextResponse.json({ error: 'Service not found' }, { status: 404 });
  }

  const circuitManager = getCircuitBreakerManager();
  const breaker = circuitManager.getBreaker(service, serviceConfig.circuitBreaker);
  await breaker.reset();

  return NextResponse.json({ success: true, service });
}
```

## Examples

### Example 1: E-commerce API Gateway

```typescript
// lib/api-gateway/ecommerce-config.ts
export const ecommerceRoutes: RouteConfig[] = [
  // Product catalog
  {
    path: '/api/products',
    method: 'GET',
    service: 'catalog',
    servicePath: '/products',
    requiresAuth: false,
    cache: { ttl: 60, staleWhileRevalidate: 300 },
  },
  {
    path: '/api/products/:id',
    method: 'GET',
    service: 'catalog',
    servicePath: '/products/:id',
    requiresAuth: false,
    cache: { ttl: 300 },
  },

  // Shopping cart
  {
    path: '/api/cart',
    method: 'GET',
    service: 'cart',
    servicePath: '/cart',
    requiresAuth: true,
  },
  {
    path: '/api/cart/items',
    method: 'POST',
    service: 'cart',
    servicePath: '/cart/items',
    requiresAuth: true,
    rateLimit: 'cart-add',
  },

  // Checkout
  {
    path: '/api/checkout',
    method: 'POST',
    service: 'checkout',
    servicePath: '/checkout',
    requiresAuth: true,
    permissions: ['checkout:create'],
    timeout: 30000,
    rateLimit: 'checkout',
  },

  // Order tracking
  {
    path: '/api/orders/:id/track',
    method: 'GET',
    service: 'shipping',
    servicePath: '/tracking/:id',
    requiresAuth: true,
    cache: { ttl: 30 },
  },
];

export const ecommerceAggregations: AggregationConfig[] = [
  // Product page - product + reviews + recommendations
  {
    path: '/api/products/:id/full',
    method: 'GET',
    requiresAuth: false,
    services: [
      { name: 'catalog', path: '/products/:id', as: 'product' },
      { name: 'reviews', path: '/reviews/product/:id', as: 'reviews' },
      { name: 'recommendations', path: '/recommendations/product/:id', as: 'recommendations', optional: true },
    ],
    merge: (results) => ({
      ...results.product,
      reviews: results.reviews,
      recommendations: results.recommendations || [],
    }),
  },

  // Checkout summary
  {
    path: '/api/checkout/summary',
    method: 'GET',
    requiresAuth: true,
    services: [
      { name: 'cart', path: '/cart', as: 'cart' },
      { name: 'inventory', path: '/availability/batch', as: 'availability' },
      { name: 'shipping', path: '/shipping/options', as: 'shippingOptions' },
      { name: 'promotions', path: '/promotions/applicable', as: 'promotions', optional: true },
    ],
    merge: (results) => {
      const cart = results.cart as any;
      const availability = results.availability as any;

      return {
        items: cart.items.map((item: any) => ({
          ...item,
          available: availability[item.productId]?.available || false,
        })),
        subtotal: cart.subtotal,
        shippingOptions: results.shippingOptions,
        promotions: results.promotions || [],
      };
    },
  },
];
```

### Example 2: Multi-tenant SaaS Gateway

```typescript
// lib/api-gateway/saas-middleware.ts
import { GatewayRequest } from './types';

// Tenant extraction middleware
export function extractTenant(request: GatewayRequest): string | null {
  // From subdomain
  const host = request.headers.host || '';
  const subdomain = host.split('.')[0];
  if (subdomain && subdomain !== 'www' && subdomain !== 'api') {
    return subdomain;
  }

  // From header
  const tenantHeader = request.headers['x-tenant-id'];
  if (tenantHeader) {
    return tenantHeader;
  }

  // From path
  const pathMatch = request.path.match(/^\/tenants\/([^/]+)/);
  if (pathMatch) {
    return pathMatch[1];
  }

  return null;
}

// Tenant-aware rate limiting
export async function getTenantRateLimit(
  tenantId: string
): Promise<{ requests: number; window: number }> {
  // Fetch tenant plan from database or cache
  const tenant = await getTenantConfig(tenantId);

  switch (tenant.plan) {
    case 'enterprise':
      return { requests: 10000, window: 60 };
    case 'business':
      return { requests: 1000, window: 60 };
    case 'starter':
      return { requests: 100, window: 60 };
    default:
      return { requests: 60, window: 60 };
  }
}

// Tenant-specific routing
export function getTenantServiceUrl(
  serviceName: string,
  tenantId: string
): string {
  // Different tenants might have dedicated instances
  const dedicatedTenants = ['acme-corp', 'bigco'];

  if (dedicatedTenants.includes(tenantId)) {
    return `https://${serviceName}-${tenantId}.internal.example.com`;
  }

  return `https://${serviceName}.internal.example.com`;
}

// Usage in handler
export async function handleTenantRequest(
  request: GatewayRequest
): Promise<Response> {
  const tenantId = extractTenant(request);

  if (!tenantId) {
    return new Response(
      JSON.stringify({ error: 'Tenant not specified' }),
      { status: 400 }
    );
  }

  // Validate tenant exists
  const tenant = await getTenantConfig(tenantId);
  if (!tenant || !tenant.active) {
    return new Response(
      JSON.stringify({ error: 'Invalid or inactive tenant' }),
      { status: 403 }
    );
  }

  // Apply tenant-specific rate limit
  const rateLimit = await getTenantRateLimit(tenantId);
  const rateLimitResult = await checkRateLimit(tenantId, rateLimit);

  if (!rateLimitResult.allowed) {
    return new Response(
      JSON.stringify({ error: 'Tenant rate limit exceeded' }),
      { status: 429 }
    );
  }

  // Route to tenant-specific service
  const serviceUrl = getTenantServiceUrl('api', tenantId);

  // Add tenant context to forwarded request
  const headers = {
    ...request.headers,
    'X-Tenant-Id': tenantId,
    'X-Tenant-Plan': tenant.plan,
  };

  // Forward request
  return forwardRequest(serviceUrl, request, headers);
}
```

### Example 3: API Versioning Gateway

```typescript
// lib/api-gateway/versioning.ts
import { GatewayRequest, RouteConfig } from './types';

type ApiVersion = 'v1' | 'v2' | 'v3';

interface VersionedRoute extends RouteConfig {
  versions: Record<ApiVersion, {
    service: string;
    servicePath: string;
    deprecated?: boolean;
    sunset?: Date;
  }>;
}

export const versionedRoutes: VersionedRoute[] = [
  {
    path: '/api/users',
    method: 'GET',
    service: 'users',
    requiresAuth: true,
    versions: {
      v1: {
        service: 'users-v1',
        servicePath: '/users',
        deprecated: true,
        sunset: new Date('2025-06-01'),
      },
      v2: {
        service: 'users-v2',
        servicePath: '/users',
      },
      v3: {
        service: 'users-v3',
        servicePath: '/users',
      },
    },
  },
];

export function extractApiVersion(request: GatewayRequest): ApiVersion {
  // From path: /api/v2/users
  const pathMatch = request.path.match(/^\/api\/(v\d+)\//);
  if (pathMatch) {
    return pathMatch[1] as ApiVersion;
  }

  // From header: X-API-Version: v2
  const headerVersion = request.headers['x-api-version'];
  if (headerVersion && isValidVersion(headerVersion)) {
    return headerVersion as ApiVersion;
  }

  // From Accept header: Accept: application/vnd.api.v2+json
  const acceptHeader = request.headers.accept || '';
  const acceptMatch = acceptHeader.match(/vnd\.api\.(v\d+)/);
  if (acceptMatch && isValidVersion(acceptMatch[1])) {
    return acceptMatch[1] as ApiVersion;
  }

  // Default to latest
  return 'v3';
}

function isValidVersion(version: string): boolean {
  return ['v1', 'v2', 'v3'].includes(version);
}

export async function handleVersionedRequest(
  request: GatewayRequest,
  route: VersionedRoute
): Promise<Response> {
  const version = extractApiVersion(request);
  const versionConfig = route.versions[version];

  if (!versionConfig) {
    return new Response(
      JSON.stringify({ error: `API version ${version} not supported` }),
      { status: 400 }
    );
  }

  const headers: Record<string, string> = {};

  // Add deprecation headers
  if (versionConfig.deprecated) {
    headers['Deprecation'] = 'true';
    if (versionConfig.sunset) {
      headers['Sunset'] = versionConfig.sunset.toUTCString();
    }
    headers['X-Deprecated-Message'] = `API ${version} is deprecated. Please migrate to v3.`;
  }

  // Route to version-specific service
  const serviceConfig = services[versionConfig.service];
  const client = getServiceClient(serviceConfig);

  const response = await client.request(versionConfig.servicePath, {
    method: request.method,
    headers: request.headers,
    body: request.body,
  });

  return new Response(JSON.stringify(response.data), {
    status: response.status,
    headers: {
      'Content-Type': 'application/json',
      'X-API-Version': version,
      ...headers,
    },
  });
}
```

## Anti-patterns

### Anti-pattern 1: No Circuit Breaker

```typescript
// BAD - No protection against cascading failures
async function callService(serviceName: string, path: string) {
  const service = services[serviceName];
  // If service is down, every request fails and times out
  return fetch(`${service.baseUrl}${path}`);
}

// GOOD - Circuit breaker prevents cascading failures
async function callService(serviceName: string, path: string) {
  const client = getServiceClient(services[serviceName]);
  // Circuit breaker will fail-fast when service is unhealthy
  return client.request(path, { method: 'GET' });
}
```

### Anti-pattern 2: Client-Specific Rate Limits Only

```typescript
// BAD - Only rate limiting per client
const rateLimiter = new RateLimiter();
const result = await rateLimiter.checkLimit(clientId, { requests: 100, window: 60 });

// GOOD - Rate limit at multiple levels
async function checkAllRateLimits(request: GatewayRequest) {
  const rateLimiter = getRateLimiter();

  // Global rate limit
  const globalResult = await rateLimiter.checkLimit(
    'global',
    { requests: 10000, window: 60 }
  );
  if (!globalResult.allowed) return { allowed: false, reason: 'global' };

  // Per-service rate limit
  const serviceResult = await rateLimiter.checkLimit(
    `service:${request.service}`,
    { requests: 1000, window: 60 }
  );
  if (!serviceResult.allowed) return { allowed: false, reason: 'service' };

  // Per-client rate limit
  const clientResult = await rateLimiter.checkLimit(
    `client:${request.user?.id || request.metadata.clientIp}`,
    { requests: 100, window: 60 },
    request.user?.tier
  );
  if (!clientResult.allowed) return { allowed: false, reason: 'client' };

  return { allowed: true };
}
```

### Anti-pattern 3: Sequential Service Calls

```typescript
// BAD - Sequential calls for aggregation
async function getDashboard(userId: string) {
  const user = await userService.getUser(userId); // 100ms
  const orders = await orderService.getOrders(userId); // 150ms
  const analytics = await analyticsService.getSummary(userId); // 200ms
  // Total: 450ms

  return { user, orders, analytics };
}

// GOOD - Parallel calls with Promise.all
async function getDashboard(userId: string) {
  const [user, orders, analytics] = await Promise.all([
    userService.getUser(userId),
    orderService.getOrders(userId),
    analyticsService.getSummary(userId).catch(() => null), // Optional
  ]);
  // Total: ~200ms (max of all)

  return { user, orders, analytics };
}
```

### Anti-pattern 4: No Request Correlation

```typescript
// BAD - No way to trace requests across services
async function handleRequest(request: Request) {
  const userResponse = await fetch('http://user-service/users/1');
  const orderResponse = await fetch('http://order-service/orders');
  // How do you debug issues across services?
}

// GOOD - Correlation IDs for distributed tracing
async function handleRequest(request: GatewayRequest) {
  const requestId = request.metadata.requestId;

  const userResponse = await fetch('http://user-service/users/1', {
    headers: {
      'X-Request-Id': requestId,
      'X-Correlation-Id': requestId,
    },
  });

  const orderResponse = await fetch('http://order-service/orders', {
    headers: {
      'X-Request-Id': requestId,
      'X-Correlation-Id': requestId,
      'X-Causation-Id': userResponse.headers.get('X-Request-Id'),
    },
  });

  // All logs can be correlated by requestId
}
```

## Testing

```typescript
// __tests__/api-gateway/router.test.ts
import { describe, it, expect } from 'vitest';
import { Router } from '@/lib/api-gateway/router';

describe('Router', () => {
  const router = new Router();

  describe('matchRoute', () => {
    it('should match exact paths', () => {
      const request = {
        method: 'GET',
        path: '/api/users',
        headers: {},
        query: {},
        metadata: {
          requestId: 'test',
          timestamp: new Date(),
          clientIp: '127.0.0.1',
          userAgent: 'test',
        },
      };

      const match = router.matchRoute(request);

      expect(match).not.toBeNull();
      expect(match?.route.service).toBe('users');
    });

    it('should match paths with parameters', () => {
      const request = {
        method: 'GET',
        path: '/api/users/123',
        headers: {},
        query: {},
        metadata: {
          requestId: 'test',
          timestamp: new Date(),
          clientIp: '127.0.0.1',
          userAgent: 'test',
        },
      };

      const match = router.matchRoute(request);

      expect(match).not.toBeNull();
      expect(match?.params.id).toBe('123');
    });

    it('should match wildcard paths', () => {
      const request = {
        method: 'GET',
        path: '/api/analytics/reports/daily',
        headers: {},
        query: {},
        metadata: {
          requestId: 'test',
          timestamp: new Date(),
          clientIp: '127.0.0.1',
          userAgent: 'test',
        },
      };

      const match = router.matchRoute(request);

      expect(match).not.toBeNull();
      expect(match?.route.service).toBe('analytics');
    });
  });

  describe('buildServicePath', () => {
    it('should replace parameters', () => {
      const path = router.buildServicePath('/users/:id/orders/:orderId', {
        id: '123',
        orderId: '456',
      });

      expect(path).toBe('/users/123/orders/456');
    });
  });
});

// __tests__/api-gateway/rate-limiter.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { RateLimiter } from '@/lib/api-gateway/rate-limiter';

describe('RateLimiter', () => {
  let rateLimiter: RateLimiter;

  beforeEach(() => {
    rateLimiter = new RateLimiter('redis://localhost:6379');
  });

  it('should allow requests within limit', async () => {
    const result = await rateLimiter.checkLimit('test-user', {
      requests: 10,
      window: 60,
    });

    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(9);
  });

  it('should block requests over limit', async () => {
    // Fill up the limit
    for (let i = 0; i < 10; i++) {
      await rateLimiter.checkLimit('test-user-2', {
        requests: 10,
        window: 60,
      });
    }

    const result = await rateLimiter.checkLimit('test-user-2', {
      requests: 10,
      window: 60,
    });

    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
  });
});

// __tests__/api-gateway/circuit-breaker.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { CircuitBreaker, CircuitBreakerManager } from '@/lib/api-gateway/circuit-breaker';

describe('CircuitBreaker', () => {
  let manager: CircuitBreakerManager;
  let breaker: CircuitBreaker;

  beforeEach(() => {
    manager = new CircuitBreakerManager('redis://localhost:6379');
    breaker = manager.getBreaker('test-service', {
      failureThreshold: 3,
      successThreshold: 2,
      timeout: 10000,
      windowSize: 60000,
    });
  });

  it('should start in CLOSED state', async () => {
    const status = await breaker.getStatus();
    expect(status.state).toBe('CLOSED');
  });

  it('should open after failure threshold', async () => {
    await breaker.recordFailure();
    await breaker.recordFailure();
    await breaker.recordFailure();

    const status = await breaker.getStatus();
    expect(status.state).toBe('OPEN');
  });

  it('should not allow execution when open', async () => {
    await breaker.recordFailure();
    await breaker.recordFailure();
    await breaker.recordFailure();

    const canExecute = await breaker.canExecute();
    expect(canExecute).toBe(false);
  });

  it('should close after success threshold in half-open', async () => {
    // Reset and manually set to half-open
    await breaker.reset();

    // Record successes
    await breaker.recordSuccess();
    await breaker.recordSuccess();

    const status = await breaker.getStatus();
    expect(status.state).toBe('CLOSED');
  });
});

// __tests__/api-gateway/handler.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handleGatewayRequest } from '@/lib/api-gateway/handler';
import { NextRequest } from 'next/server';

vi.mock('@/lib/auth', () => ({
  auth: vi.fn().mockResolvedValue({
    user: { id: 'user-1', role: 'user', permissions: ['users:read'] },
  }),
}));

describe('handleGatewayRequest', () => {
  it('should route to correct service', async () => {
    const request = new NextRequest('http://localhost/api/users', {
      method: 'GET',
    });

    const response = await handleGatewayRequest(request);

    expect(response.status).toBe(200);
    expect(response.headers.get('X-Service')).toBe('users');
  });

  it('should return 401 for unauthenticated requests to protected routes', async () => {
    vi.mocked(auth).mockResolvedValueOnce(null);

    const request = new NextRequest('http://localhost/api/users', {
      method: 'GET',
    });

    const response = await handleGatewayRequest(request);

    expect(response.status).toBe(401);
  });

  it('should handle aggregation requests', async () => {
    const request = new NextRequest('http://localhost/api/dashboard', {
      method: 'GET',
    });

    const response = await handleGatewayRequest(request);

    expect(response.status).toBe(200);
    expect(response.headers.get('X-Aggregated')).toContain('users');
  });
});
```

## Related Skills

### Composes From
- [rbac](./rbac.md) - Permission-based route protection
- [redis-cache](./redis-cache.md) - Response caching and rate limiting
- [jwt-tokens](./jwt-tokens.md) - Token validation at gateway

### Composes Into
- [multi-tenancy](./multi-tenancy.md) - Tenant-aware routing
- [microservices](./microservices.md) - Service mesh communication
- [zero-downtime](./zero-downtime.md) - Blue-green deployments via gateway

### Alternatives
- Kong - Enterprise API gateway
- AWS API Gateway - Managed cloud gateway
- Nginx - Reverse proxy with API gateway features
- Traefik - Cloud-native edge router

---

## Changelog

### 1.0.0 (2025-01-18)
- Initial implementation
- Route matching with parameters and wildcards
- Service client with retry and timeout
- Circuit breaker with Redis state
- Sliding window rate limiting
- Service aggregation for reduced round trips
- Response caching
- Health check endpoints
- Request correlation IDs
- Comprehensive testing examples
