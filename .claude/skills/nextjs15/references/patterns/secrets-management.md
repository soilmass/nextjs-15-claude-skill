---
id: pt-secrets-management
name: Secrets Management
version: 1.0.0
layer: L5
category: security
description: Secure secrets management with Vault integration, credential rotation, environment-based injection, and comprehensive audit trails
tags: [secrets, vault, security, credentials, rotation, audit, next15, infrastructure]
composes: []
dependencies:
  "@hashicorp/vault": "^1.0.0"
  "ioredis": "^5.3.0"
  "@prisma/client": "^5.0.0"
formula: "Secrets Management = Vault (storage) + Rotation (lifecycle) + Injection (delivery) + Audit (compliance)"
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# Secrets Management

## Overview

Secrets management is a critical infrastructure pattern for securely storing, accessing, rotating, and auditing sensitive credentials like API keys, database passwords, and encryption keys. In Next.js 15 applications, proper secrets management prevents credential leaks, enables zero-trust security models, and maintains compliance with security standards like SOC2 and PCI-DSS.

This pattern implements a comprehensive secrets management system using HashiCorp Vault as the primary secrets store, with Redis for caching short-lived credentials, Prisma for audit logging, and environment-based injection for both server and edge runtime contexts. The architecture supports automatic credential rotation, lease management, and real-time audit trails for all secret access operations.

Modern applications require different secrets for different environments (development, staging, production) and contexts (server-side, edge functions, build time). This pattern provides a unified API for accessing secrets regardless of the underlying storage mechanism, with proper isolation between environments and comprehensive logging for security audits and compliance requirements.

## When to Use

Use this pattern when:
- You need to manage API keys, database credentials, or encryption keys securely
- Compliance requirements mandate audit trails for secret access (SOC2, PCI-DSS, HIPAA)
- You require automatic credential rotation without application restarts
- Multiple environments need isolated secret namespaces
- You need to prevent secrets from leaking into logs or error reports
- Third-party service credentials need secure storage and retrieval
- You want to implement zero-trust security architecture

## When NOT to Use

Avoid this pattern when:
- You only have a few static environment variables that rarely change
- Your application runs in a single environment without compliance requirements
- You don't have infrastructure to run Vault or similar secrets management systems
- The overhead of a secrets management system outweighs the security benefits
- You're building a simple prototype or proof-of-concept

## Composition Diagram

```
SECRETS MANAGEMENT ARCHITECTURE
================================

┌─────────────────────────────────────────────────────────────────────────────┐
│                           SECRETS MANAGEMENT SYSTEM                          │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
        ┌─────────────────────────────┼─────────────────────────────┐
        │                             │                             │
        ▼                             ▼                             ▼
┌───────────────┐           ┌───────────────┐           ┌───────────────┐
│    STORAGE    │           │   LIFECYCLE   │           │     AUDIT     │
│    LAYER      │           │   MANAGEMENT  │           │    SYSTEM     │
├───────────────┤           ├───────────────┤           ├───────────────┤
│• HashiCorp    │           │• Rotation     │           │• Access Logs  │
│  Vault        │──────────▶│  Scheduler    │◀──────────│• Change Audit │
│• AWS Secrets  │           │• Lease Mgmt   │           │• Alert System │
│• Azure KeyVlt │           │• Expiry Check │           │• Compliance   │
└───────────────┘           └───────┬───────┘           └───────────────┘
                                    │
        ┌───────────────────────────┼───────────────────────────┐
        │                           │                           │
        ▼                           ▼                           ▼
┌───────────────┐           ┌───────────────┐           ┌───────────────┐
│  Environment  │           │    Caching    │           │   Injection   │
│  Isolation    │           │    Layer      │           │    Points     │
├───────────────┤           ├───────────────┤           ├───────────────┤
│• Development  │           │• Redis Cache  │           │• Server Comp  │
│• Staging      │◀─────────▶│• Memory TTL   │──────────▶│• Edge Runtime │
│• Production   │           │• Auto-Refresh │           │• API Routes   │
└───────────────┘           └───────────────┘           └───────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│  Flow: App Request → Cache Check → Vault Fetch → Decrypt → Audit → Return   │
└─────────────────────────────────────────────────────────────────────────────┘

Secret Types:
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│   STATIC        │  │   DYNAMIC       │  │   ROTATING      │
├─────────────────┤  ├─────────────────┤  ├─────────────────┤
│• API Keys       │  │• DB Credentials │  │• JWT Signing    │
│• Webhook Secrets│  │• OAuth Tokens   │  │• Encryption Keys│
│• Service URLs   │  │• Temp Creds     │  │• Session Keys   │
└─────────────────┘  └─────────────────┘  └─────────────────┘
```

## Implementation

### Core Types and Configuration

```typescript
// lib/secrets/types.ts
export type SecretType = 'static' | 'dynamic' | 'rotating';
export type SecretCategory = 'api-key' | 'database' | 'encryption' | 'oauth' | 'webhook' | 'certificate';

export interface SecretMetadata {
  id: string;
  name: string;
  type: SecretType;
  category: SecretCategory;
  environment: string;
  version: number;
  createdAt: Date;
  updatedAt: Date;
  expiresAt?: Date;
  rotationSchedule?: string; // Cron expression
  lastRotatedAt?: Date;
  tags: string[];
}

export interface Secret {
  metadata: SecretMetadata;
  value: string;
  lease?: {
    id: string;
    duration: number;
    renewable: boolean;
    expiresAt: Date;
  };
}

export interface SecretAccessLog {
  id: string;
  secretId: string;
  secretName: string;
  accessedBy: string;
  accessedAt: Date;
  operation: 'read' | 'write' | 'rotate' | 'delete';
  ipAddress?: string;
  userAgent?: string;
  success: boolean;
  errorMessage?: string;
}

export interface RotationConfig {
  enabled: boolean;
  schedule: string; // Cron expression
  retentionCount: number; // Number of old versions to keep
  notifyBefore: number; // Hours before expiry to notify
  autoRotate: boolean;
}

export interface SecretsConfig {
  vault: {
    address: string;
    token?: string;
    roleId?: string;
    secretId?: string;
    namespace?: string;
    mountPath: string;
  };
  cache: {
    enabled: boolean;
    ttlSeconds: number;
    redisUrl?: string;
  };
  audit: {
    enabled: boolean;
    retentionDays: number;
  };
  encryption: {
    algorithm: string;
    keyId: string;
  };
}
```

### Vault Client Implementation

```typescript
// lib/secrets/vault-client.ts
import { SecretType, Secret, SecretMetadata, SecretsConfig } from './types';

interface VaultResponse<T> {
  data: T;
  lease_id?: string;
  lease_duration?: number;
  renewable?: boolean;
}

interface VaultKVData {
  data: Record<string, string>;
  metadata: {
    created_time: string;
    version: number;
  };
}

export class VaultClient {
  private baseUrl: string;
  private token: string;
  private namespace?: string;
  private mountPath: string;

  constructor(config: SecretsConfig['vault']) {
    this.baseUrl = config.address;
    this.token = config.token || '';
    this.namespace = config.namespace;
    this.mountPath = config.mountPath;
  }

  async authenticate(roleId: string, secretId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/v1/auth/approle/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(this.namespace && { 'X-Vault-Namespace': this.namespace }),
      },
      body: JSON.stringify({
        role_id: roleId,
        secret_id: secretId,
      }),
    });

    if (!response.ok) {
      throw new Error(`Vault authentication failed: ${response.statusText}`);
    }

    const data = await response.json();
    this.token = data.auth.client_token;
  }

  private async request<T>(
    method: string,
    path: string,
    body?: unknown
  ): Promise<VaultResponse<T>> {
    const response = await fetch(`${this.baseUrl}/v1/${path}`, {
      method,
      headers: {
        'X-Vault-Token': this.token,
        'Content-Type': 'application/json',
        ...(this.namespace && { 'X-Vault-Namespace': this.namespace }),
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Vault request failed: ${error}`);
    }

    return response.json();
  }

  async getSecret(
    path: string,
    environment: string
  ): Promise<Secret | null> {
    try {
      const fullPath = `${this.mountPath}/data/${environment}/${path}`;
      const response = await this.request<VaultKVData>('GET', fullPath);

      const value = response.data.data.value;
      if (!value) return null;

      return {
        metadata: {
          id: `${environment}/${path}`,
          name: path,
          type: 'static',
          category: 'api-key',
          environment,
          version: response.data.metadata.version,
          createdAt: new Date(response.data.metadata.created_time),
          updatedAt: new Date(response.data.metadata.created_time),
          tags: [],
        },
        value,
        lease: response.lease_id
          ? {
              id: response.lease_id,
              duration: response.lease_duration || 0,
              renewable: response.renewable || false,
              expiresAt: new Date(
                Date.now() + (response.lease_duration || 0) * 1000
              ),
            }
          : undefined,
      };
    } catch (error) {
      console.error(`Failed to get secret ${path}:`, error);
      return null;
    }
  }

  async setSecret(
    path: string,
    environment: string,
    value: string,
    metadata?: Partial<SecretMetadata>
  ): Promise<boolean> {
    try {
      const fullPath = `${this.mountPath}/data/${environment}/${path}`;
      await this.request('POST', fullPath, {
        data: {
          value,
          ...metadata,
        },
      });
      return true;
    } catch (error) {
      console.error(`Failed to set secret ${path}:`, error);
      return false;
    }
  }

  async deleteSecret(path: string, environment: string): Promise<boolean> {
    try {
      const fullPath = `${this.mountPath}/metadata/${environment}/${path}`;
      await this.request('DELETE', fullPath);
      return true;
    } catch (error) {
      console.error(`Failed to delete secret ${path}:`, error);
      return false;
    }
  }

  async listSecrets(
    environment: string,
    prefix?: string
  ): Promise<string[]> {
    try {
      const fullPath = prefix
        ? `${this.mountPath}/metadata/${environment}/${prefix}`
        : `${this.mountPath}/metadata/${environment}`;

      const response = await this.request<{ keys: string[] }>('LIST', fullPath);
      return response.data.keys || [];
    } catch (error) {
      console.error(`Failed to list secrets:`, error);
      return [];
    }
  }

  async getDynamicSecret(
    engine: string,
    role: string
  ): Promise<Secret | null> {
    try {
      const path = `${engine}/creds/${role}`;
      const response = await this.request<Record<string, string>>('GET', path);

      return {
        metadata: {
          id: response.lease_id || `${engine}/${role}`,
          name: role,
          type: 'dynamic',
          category: 'database',
          environment: process.env.NODE_ENV || 'development',
          version: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
          expiresAt: new Date(
            Date.now() + (response.lease_duration || 3600) * 1000
          ),
          tags: ['dynamic'],
        },
        value: JSON.stringify(response.data),
        lease: {
          id: response.lease_id || '',
          duration: response.lease_duration || 3600,
          renewable: response.renewable || true,
          expiresAt: new Date(
            Date.now() + (response.lease_duration || 3600) * 1000
          ),
        },
      };
    } catch (error) {
      console.error(`Failed to get dynamic secret:`, error);
      return null;
    }
  }

  async renewLease(leaseId: string, increment?: number): Promise<boolean> {
    try {
      await this.request('POST', 'sys/leases/renew', {
        lease_id: leaseId,
        increment,
      });
      return true;
    } catch (error) {
      console.error(`Failed to renew lease ${leaseId}:`, error);
      return false;
    }
  }

  async revokeLease(leaseId: string): Promise<boolean> {
    try {
      await this.request('POST', 'sys/leases/revoke', {
        lease_id: leaseId,
      });
      return true;
    } catch (error) {
      console.error(`Failed to revoke lease ${leaseId}:`, error);
      return false;
    }
  }
}
```

### Secrets Cache Layer

```typescript
// lib/secrets/cache.ts
import Redis from 'ioredis';
import { Secret } from './types';

interface CacheEntry {
  secret: Secret;
  cachedAt: number;
  expiresAt: number;
}

export class SecretsCache {
  private redis: Redis | null = null;
  private memoryCache: Map<string, CacheEntry> = new Map();
  private ttlSeconds: number;

  constructor(redisUrl?: string, ttlSeconds = 300) {
    this.ttlSeconds = ttlSeconds;

    if (redisUrl) {
      this.redis = new Redis(redisUrl, {
        maxRetriesPerRequest: 3,
        retryStrategy: (times) => Math.min(times * 50, 2000),
      });
    }
  }

  private getCacheKey(name: string, environment: string): string {
    return `secrets:${environment}:${name}`;
  }

  async get(name: string, environment: string): Promise<Secret | null> {
    const key = this.getCacheKey(name, environment);

    // Check memory cache first
    const memoryEntry = this.memoryCache.get(key);
    if (memoryEntry && memoryEntry.expiresAt > Date.now()) {
      return memoryEntry.secret;
    }

    // Check Redis cache
    if (this.redis) {
      try {
        const data = await this.redis.get(key);
        if (data) {
          const entry: CacheEntry = JSON.parse(data);
          // Also store in memory for faster subsequent access
          this.memoryCache.set(key, entry);
          return entry.secret;
        }
      } catch (error) {
        console.error('Redis cache get error:', error);
      }
    }

    return null;
  }

  async set(
    name: string,
    environment: string,
    secret: Secret,
    ttlOverride?: number
  ): Promise<void> {
    const key = this.getCacheKey(name, environment);
    const ttl = ttlOverride ?? this.ttlSeconds;

    const entry: CacheEntry = {
      secret,
      cachedAt: Date.now(),
      expiresAt: Date.now() + ttl * 1000,
    };

    // Store in memory cache
    this.memoryCache.set(key, entry);

    // Store in Redis
    if (this.redis) {
      try {
        await this.redis.setex(key, ttl, JSON.stringify(entry));
      } catch (error) {
        console.error('Redis cache set error:', error);
      }
    }
  }

  async invalidate(name: string, environment: string): Promise<void> {
    const key = this.getCacheKey(name, environment);

    this.memoryCache.delete(key);

    if (this.redis) {
      try {
        await this.redis.del(key);
      } catch (error) {
        console.error('Redis cache invalidate error:', error);
      }
    }
  }

  async invalidateAll(environment?: string): Promise<void> {
    // Clear memory cache
    if (environment) {
      const prefix = `secrets:${environment}:`;
      for (const key of this.memoryCache.keys()) {
        if (key.startsWith(prefix)) {
          this.memoryCache.delete(key);
        }
      }
    } else {
      this.memoryCache.clear();
    }

    // Clear Redis cache
    if (this.redis) {
      try {
        const pattern = environment
          ? `secrets:${environment}:*`
          : 'secrets:*';
        const keys = await this.redis.keys(pattern);
        if (keys.length > 0) {
          await this.redis.del(...keys);
        }
      } catch (error) {
        console.error('Redis cache invalidateAll error:', error);
      }
    }
  }

  async close(): Promise<void> {
    if (this.redis) {
      await this.redis.quit();
    }
  }
}
```

### Audit Logger

```typescript
// lib/secrets/audit.ts
import { prisma } from '@/lib/db';
import { SecretAccessLog } from './types';

export class SecretsAuditLogger {
  private enabled: boolean;
  private retentionDays: number;

  constructor(enabled = true, retentionDays = 90) {
    this.enabled = enabled;
    this.retentionDays = retentionDays;
  }

  async log(entry: Omit<SecretAccessLog, 'id'>): Promise<void> {
    if (!this.enabled) return;

    try {
      await prisma.secretAccessLog.create({
        data: {
          secretId: entry.secretId,
          secretName: entry.secretName,
          accessedBy: entry.accessedBy,
          accessedAt: entry.accessedAt,
          operation: entry.operation,
          ipAddress: entry.ipAddress,
          userAgent: entry.userAgent,
          success: entry.success,
          errorMessage: entry.errorMessage,
        },
      });
    } catch (error) {
      console.error('Failed to log secret access:', error);
    }
  }

  async logRead(
    secretId: string,
    secretName: string,
    accessedBy: string,
    context?: { ipAddress?: string; userAgent?: string }
  ): Promise<void> {
    await this.log({
      secretId,
      secretName,
      accessedBy,
      accessedAt: new Date(),
      operation: 'read',
      ipAddress: context?.ipAddress,
      userAgent: context?.userAgent,
      success: true,
    });
  }

  async logWrite(
    secretId: string,
    secretName: string,
    accessedBy: string,
    success: boolean,
    errorMessage?: string
  ): Promise<void> {
    await this.log({
      secretId,
      secretName,
      accessedBy,
      accessedAt: new Date(),
      operation: 'write',
      success,
      errorMessage,
    });
  }

  async logRotation(
    secretId: string,
    secretName: string,
    success: boolean,
    errorMessage?: string
  ): Promise<void> {
    await this.log({
      secretId,
      secretName,
      accessedBy: 'system:rotation',
      accessedAt: new Date(),
      operation: 'rotate',
      success,
      errorMessage,
    });
  }

  async getAccessLogs(
    filters: {
      secretId?: string;
      secretName?: string;
      accessedBy?: string;
      operation?: string;
      startDate?: Date;
      endDate?: Date;
    },
    pagination: { page: number; limit: number } = { page: 1, limit: 50 }
  ): Promise<{ logs: SecretAccessLog[]; total: number }> {
    const where: any = {};

    if (filters.secretId) where.secretId = filters.secretId;
    if (filters.secretName) where.secretName = { contains: filters.secretName };
    if (filters.accessedBy) where.accessedBy = filters.accessedBy;
    if (filters.operation) where.operation = filters.operation;
    if (filters.startDate || filters.endDate) {
      where.accessedAt = {};
      if (filters.startDate) where.accessedAt.gte = filters.startDate;
      if (filters.endDate) where.accessedAt.lte = filters.endDate;
    }

    const [logs, total] = await Promise.all([
      prisma.secretAccessLog.findMany({
        where,
        orderBy: { accessedAt: 'desc' },
        skip: (pagination.page - 1) * pagination.limit,
        take: pagination.limit,
      }),
      prisma.secretAccessLog.count({ where }),
    ]);

    return { logs: logs as SecretAccessLog[], total };
  }

  async cleanup(): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - this.retentionDays);

    const result = await prisma.secretAccessLog.deleteMany({
      where: {
        accessedAt: {
          lt: cutoffDate,
        },
      },
    });

    return result.count;
  }
}
```

### Credential Rotation Manager

```typescript
// lib/secrets/rotation.ts
import { VaultClient } from './vault-client';
import { SecretsCache } from './cache';
import { SecretsAuditLogger } from './audit';
import { RotationConfig, Secret, SecretMetadata } from './types';
import { prisma } from '@/lib/db';

interface RotationJob {
  secretId: string;
  secretName: string;
  environment: string;
  config: RotationConfig;
  lastRotation?: Date;
  nextRotation: Date;
}

export class CredentialRotationManager {
  private vault: VaultClient;
  private cache: SecretsCache;
  private auditLogger: SecretsAuditLogger;
  private rotationJobs: Map<string, RotationJob> = new Map();

  constructor(
    vault: VaultClient,
    cache: SecretsCache,
    auditLogger: SecretsAuditLogger
  ) {
    this.vault = vault;
    this.cache = cache;
    this.auditLogger = auditLogger;
  }

  async registerRotation(
    secretId: string,
    secretName: string,
    environment: string,
    config: RotationConfig
  ): Promise<void> {
    const nextRotation = this.calculateNextRotation(config.schedule);

    const job: RotationJob = {
      secretId,
      secretName,
      environment,
      config,
      nextRotation,
    };

    this.rotationJobs.set(secretId, job);

    // Store in database for persistence
    await prisma.secretRotationSchedule.upsert({
      where: { secretId },
      create: {
        secretId,
        secretName,
        environment,
        schedule: config.schedule,
        enabled: config.enabled,
        autoRotate: config.autoRotate,
        retentionCount: config.retentionCount,
        notifyBefore: config.notifyBefore,
        nextRotation,
      },
      update: {
        schedule: config.schedule,
        enabled: config.enabled,
        autoRotate: config.autoRotate,
        retentionCount: config.retentionCount,
        notifyBefore: config.notifyBefore,
        nextRotation,
      },
    });
  }

  private calculateNextRotation(cronSchedule: string): Date {
    // Simple cron parsing - in production use a proper cron library
    const now = new Date();
    const parts = cronSchedule.split(' ');

    // Handle common patterns
    if (cronSchedule === '0 0 * * 0') {
      // Weekly on Sunday
      const next = new Date(now);
      next.setDate(next.getDate() + (7 - next.getDay()));
      next.setHours(0, 0, 0, 0);
      return next;
    }

    if (cronSchedule === '0 0 1 * *') {
      // Monthly on 1st
      const next = new Date(now);
      next.setMonth(next.getMonth() + 1);
      next.setDate(1);
      next.setHours(0, 0, 0, 0);
      return next;
    }

    // Default to 24 hours from now
    return new Date(now.getTime() + 24 * 60 * 60 * 1000);
  }

  async rotateSecret(
    secretId: string,
    newValueGenerator?: () => Promise<string>
  ): Promise<boolean> {
    const job = this.rotationJobs.get(secretId);
    if (!job) {
      console.error(`No rotation job found for secret ${secretId}`);
      return false;
    }

    try {
      // Get current secret for backup
      const currentSecret = await this.vault.getSecret(
        job.secretName,
        job.environment
      );

      // Generate new value
      const newValue = newValueGenerator
        ? await newValueGenerator()
        : this.generateSecureValue();

      // Store new secret
      const success = await this.vault.setSecret(
        job.secretName,
        job.environment,
        newValue,
        {
          version: (currentSecret?.metadata.version || 0) + 1,
          lastRotatedAt: new Date(),
        }
      );

      if (success) {
        // Invalidate cache
        await this.cache.invalidate(job.secretName, job.environment);

        // Update rotation schedule
        job.lastRotation = new Date();
        job.nextRotation = this.calculateNextRotation(job.config.schedule);

        await prisma.secretRotationSchedule.update({
          where: { secretId },
          data: {
            lastRotation: job.lastRotation,
            nextRotation: job.nextRotation,
          },
        });

        // Log successful rotation
        await this.auditLogger.logRotation(secretId, job.secretName, true);
      }

      return success;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      await this.auditLogger.logRotation(secretId, job.secretName, false, errorMessage);
      throw error;
    }
  }

  private generateSecureValue(length = 32): string {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return Array.from(array, (byte) => charset[byte % charset.length]).join('');
  }

  async checkExpiringSecrets(hoursAhead = 24): Promise<RotationJob[]> {
    const cutoff = new Date(Date.now() + hoursAhead * 60 * 60 * 1000);

    const expiring: RotationJob[] = [];
    for (const job of this.rotationJobs.values()) {
      if (job.nextRotation <= cutoff) {
        expiring.push(job);
      }
    }

    return expiring;
  }

  async runScheduledRotations(): Promise<{
    rotated: string[];
    failed: string[];
  }> {
    const now = new Date();
    const rotated: string[] = [];
    const failed: string[] = [];

    for (const [secretId, job] of this.rotationJobs.entries()) {
      if (job.config.autoRotate && job.nextRotation <= now) {
        try {
          const success = await this.rotateSecret(secretId);
          if (success) {
            rotated.push(secretId);
          } else {
            failed.push(secretId);
          }
        } catch (error) {
          failed.push(secretId);
        }
      }
    }

    return { rotated, failed };
  }
}
```

### Main Secrets Manager

```typescript
// lib/secrets/manager.ts
import { VaultClient } from './vault-client';
import { SecretsCache } from './cache';
import { SecretsAuditLogger } from './audit';
import { CredentialRotationManager } from './rotation';
import { Secret, SecretsConfig } from './types';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';

export class SecretsManager {
  private vault: VaultClient;
  private cache: SecretsCache;
  private auditLogger: SecretsAuditLogger;
  private rotationManager: CredentialRotationManager;
  private environment: string;

  constructor(config: SecretsConfig) {
    this.vault = new VaultClient(config.vault);
    this.cache = new SecretsCache(
      config.cache.redisUrl,
      config.cache.ttlSeconds
    );
    this.auditLogger = new SecretsAuditLogger(
      config.audit.enabled,
      config.audit.retentionDays
    );
    this.rotationManager = new CredentialRotationManager(
      this.vault,
      this.cache,
      this.auditLogger
    );
    this.environment = process.env.NODE_ENV || 'development';
  }

  async initialize(): Promise<void> {
    const vaultConfig = {
      roleId: process.env.VAULT_ROLE_ID,
      secretId: process.env.VAULT_SECRET_ID,
    };

    if (vaultConfig.roleId && vaultConfig.secretId) {
      await this.vault.authenticate(vaultConfig.roleId, vaultConfig.secretId);
    }
  }

  async getSecret(name: string, environment?: string): Promise<string | null> {
    const env = environment || this.environment;
    const accessContext = await this.getAccessContext();

    // Check cache first
    const cached = await this.cache.get(name, env);
    if (cached) {
      await this.auditLogger.logRead(
        cached.metadata.id,
        name,
        accessContext.userId,
        { ipAddress: accessContext.ipAddress, userAgent: accessContext.userAgent }
      );
      return cached.value;
    }

    // Fetch from Vault
    const secret = await this.vault.getSecret(name, env);
    if (!secret) return null;

    // Cache the secret
    const ttl = secret.lease?.duration || 300;
    await this.cache.set(name, env, secret, ttl);

    // Log access
    await this.auditLogger.logRead(
      secret.metadata.id,
      name,
      accessContext.userId,
      { ipAddress: accessContext.ipAddress, userAgent: accessContext.userAgent }
    );

    return secret.value;
  }

  async setSecret(
    name: string,
    value: string,
    environment?: string
  ): Promise<boolean> {
    const env = environment || this.environment;
    const accessContext = await this.getAccessContext();

    const success = await this.vault.setSecret(name, env, value);

    await this.auditLogger.logWrite(
      `${env}/${name}`,
      name,
      accessContext.userId,
      success
    );

    if (success) {
      await this.cache.invalidate(name, env);
    }

    return success;
  }

  async deleteSecret(name: string, environment?: string): Promise<boolean> {
    const env = environment || this.environment;
    const accessContext = await this.getAccessContext();

    const success = await this.vault.deleteSecret(name, env);

    await this.auditLogger.log({
      secretId: `${env}/${name}`,
      secretName: name,
      accessedBy: accessContext.userId,
      accessedAt: new Date(),
      operation: 'delete',
      success,
    });

    if (success) {
      await this.cache.invalidate(name, env);
    }

    return success;
  }

  async listSecrets(environment?: string, prefix?: string): Promise<string[]> {
    const env = environment || this.environment;
    return this.vault.listSecrets(env, prefix);
  }

  async getDatabaseCredentials(role: string): Promise<{
    username: string;
    password: string;
  } | null> {
    const secret = await this.vault.getDynamicSecret('database', role);
    if (!secret) return null;

    const credentials = JSON.parse(secret.value);
    return {
      username: credentials.username,
      password: credentials.password,
    };
  }

  getRotationManager(): CredentialRotationManager {
    return this.rotationManager;
  }

  getAuditLogger(): SecretsAuditLogger {
    return this.auditLogger;
  }

  private async getAccessContext(): Promise<{
    userId: string;
    ipAddress?: string;
    userAgent?: string;
  }> {
    try {
      const session = await auth();
      const headersList = await headers();

      return {
        userId: session?.user?.id || 'anonymous',
        ipAddress: headersList.get('x-forwarded-for')?.split(',')[0] ||
                   headersList.get('x-real-ip') || undefined,
        userAgent: headersList.get('user-agent') || undefined,
      };
    } catch {
      return { userId: 'system' };
    }
  }

  async close(): Promise<void> {
    await this.cache.close();
  }
}

// Singleton instance
let secretsManager: SecretsManager | null = null;

export function getSecretsManager(): SecretsManager {
  if (!secretsManager) {
    secretsManager = new SecretsManager({
      vault: {
        address: process.env.VAULT_ADDR || 'http://localhost:8200',
        token: process.env.VAULT_TOKEN,
        roleId: process.env.VAULT_ROLE_ID,
        secretId: process.env.VAULT_SECRET_ID,
        namespace: process.env.VAULT_NAMESPACE,
        mountPath: process.env.VAULT_MOUNT_PATH || 'secret',
      },
      cache: {
        enabled: true,
        ttlSeconds: 300,
        redisUrl: process.env.REDIS_URL,
      },
      audit: {
        enabled: true,
        retentionDays: 90,
      },
      encryption: {
        algorithm: 'aes-256-gcm',
        keyId: process.env.ENCRYPTION_KEY_ID || 'default',
      },
    });
  }
  return secretsManager;
}
```

### Environment-Based Injection

```typescript
// lib/secrets/injection.ts
import { getSecretsManager } from './manager';

interface InjectedSecrets {
  [key: string]: string;
}

// Define required secrets per environment
const REQUIRED_SECRETS: Record<string, string[]> = {
  development: [
    'DATABASE_URL',
    'NEXTAUTH_SECRET',
    'API_KEY',
  ],
  staging: [
    'DATABASE_URL',
    'NEXTAUTH_SECRET',
    'API_KEY',
    'STRIPE_SECRET_KEY',
    'SENDGRID_API_KEY',
  ],
  production: [
    'DATABASE_URL',
    'NEXTAUTH_SECRET',
    'API_KEY',
    'STRIPE_SECRET_KEY',
    'SENDGRID_API_KEY',
    'SENTRY_DSN',
    'ANALYTICS_KEY',
  ],
};

export async function injectSecrets(
  environment?: string
): Promise<InjectedSecrets> {
  const env = environment || process.env.NODE_ENV || 'development';
  const manager = getSecretsManager();
  await manager.initialize();

  const required = REQUIRED_SECRETS[env] || REQUIRED_SECRETS.development;
  const secrets: InjectedSecrets = {};

  const results = await Promise.allSettled(
    required.map(async (name) => {
      const value = await manager.getSecret(name, env);
      return { name, value };
    })
  );

  for (const result of results) {
    if (result.status === 'fulfilled' && result.value.value) {
      secrets[result.value.name] = result.value.value;
    }
  }

  return secrets;
}

// For use in next.config.js or similar build-time contexts
export async function loadBuildTimeSecrets(): Promise<void> {
  const secrets = await injectSecrets();

  for (const [key, value] of Object.entries(secrets)) {
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

// Validate all required secrets are present
export async function validateSecrets(
  environment?: string
): Promise<{ valid: boolean; missing: string[] }> {
  const env = environment || process.env.NODE_ENV || 'development';
  const manager = getSecretsManager();
  await manager.initialize();

  const required = REQUIRED_SECRETS[env] || REQUIRED_SECRETS.development;
  const missing: string[] = [];

  for (const name of required) {
    const value = await manager.getSecret(name, env);
    if (!value) {
      missing.push(name);
    }
  }

  return {
    valid: missing.length === 0,
    missing,
  };
}
```

### Server Action for Secrets Management

```typescript
// app/actions/secrets.ts
'use server';

import { auth } from '@/lib/auth';
import { getSecretsManager } from '@/lib/secrets/manager';
import { hasPermission, type Role } from '@/lib/auth/permissions';
import { revalidatePath } from 'next/cache';

export async function createSecret(
  name: string,
  value: string,
  environment: string
) {
  const session = await auth();
  if (!session?.user) throw new Error('Unauthorized');

  const role = session.user.role as Role;
  if (!hasPermission(role, 'secrets:write')) {
    throw new Error('Insufficient permissions');
  }

  const manager = getSecretsManager();
  await manager.initialize();

  const success = await manager.setSecret(name, value, environment);
  if (!success) throw new Error('Failed to create secret');

  revalidatePath('/admin/secrets');
  return { success: true };
}

export async function deleteSecret(name: string, environment: string) {
  const session = await auth();
  if (!session?.user) throw new Error('Unauthorized');

  const role = session.user.role as Role;
  if (!hasPermission(role, 'secrets:delete')) {
    throw new Error('Insufficient permissions');
  }

  const manager = getSecretsManager();
  await manager.initialize();

  const success = await manager.deleteSecret(name, environment);
  if (!success) throw new Error('Failed to delete secret');

  revalidatePath('/admin/secrets');
  return { success: true };
}

export async function rotateSecret(secretId: string) {
  const session = await auth();
  if (!session?.user) throw new Error('Unauthorized');

  const role = session.user.role as Role;
  if (!hasPermission(role, 'secrets:rotate')) {
    throw new Error('Insufficient permissions');
  }

  const manager = getSecretsManager();
  await manager.initialize();

  const rotationManager = manager.getRotationManager();
  const success = await rotationManager.rotateSecret(secretId);

  if (!success) throw new Error('Failed to rotate secret');

  revalidatePath('/admin/secrets');
  return { success: true };
}

export async function getAuditLogs(
  page: number,
  limit: number,
  filters?: {
    secretName?: string;
    operation?: string;
    startDate?: string;
    endDate?: string;
  }
) {
  const session = await auth();
  if (!session?.user) throw new Error('Unauthorized');

  const role = session.user.role as Role;
  if (!hasPermission(role, 'audit:read')) {
    throw new Error('Insufficient permissions');
  }

  const manager = getSecretsManager();
  const auditLogger = manager.getAuditLogger();

  const result = await auditLogger.getAccessLogs(
    {
      secretName: filters?.secretName,
      operation: filters?.operation,
      startDate: filters?.startDate ? new Date(filters.startDate) : undefined,
      endDate: filters?.endDate ? new Date(filters.endDate) : undefined,
    },
    { page, limit }
  );

  return result;
}
```

### Database Schema

```prisma
// prisma/schema.prisma

model SecretAccessLog {
  id           String   @id @default(cuid())
  secretId     String
  secretName   String
  accessedBy   String
  accessedAt   DateTime @default(now())
  operation    String   // 'read', 'write', 'rotate', 'delete'
  ipAddress    String?
  userAgent    String?
  success      Boolean
  errorMessage String?

  @@index([secretId])
  @@index([accessedAt])
  @@index([accessedBy])
  @@index([operation])
}

model SecretRotationSchedule {
  id             String    @id @default(cuid())
  secretId       String    @unique
  secretName     String
  environment    String
  schedule       String    // Cron expression
  enabled        Boolean   @default(true)
  autoRotate     Boolean   @default(false)
  retentionCount Int       @default(3)
  notifyBefore   Int       @default(24) // Hours
  lastRotation   DateTime?
  nextRotation   DateTime
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt

  @@index([nextRotation])
  @@index([environment])
}

model SecretVersion {
  id          String   @id @default(cuid())
  secretId    String
  secretName  String
  environment String
  version     Int
  createdAt   DateTime @default(now())
  createdBy   String
  encryptedValue String @db.Text

  @@unique([secretId, version])
  @@index([secretId])
}
```

## Examples

### Example 1: API Key Management for Third-Party Services

```typescript
// lib/integrations/stripe.ts
import { getSecretsManager } from '@/lib/secrets/manager';
import Stripe from 'stripe';

let stripeClient: Stripe | null = null;

export async function getStripeClient(): Promise<Stripe> {
  if (stripeClient) return stripeClient;

  const manager = getSecretsManager();
  await manager.initialize();

  const secretKey = await manager.getSecret('STRIPE_SECRET_KEY');
  if (!secretKey) {
    throw new Error('Stripe secret key not found');
  }

  stripeClient = new Stripe(secretKey, {
    apiVersion: '2024-12-18.acacia',
  });

  return stripeClient;
}

// Usage in API route
// app/api/payments/route.ts
import { getStripeClient } from '@/lib/integrations/stripe';

export async function POST(request: Request) {
  const stripe = await getStripeClient();

  const { amount, currency } = await request.json();

  const paymentIntent = await stripe.paymentIntents.create({
    amount,
    currency,
  });

  return Response.json({ clientSecret: paymentIntent.client_secret });
}
```

### Example 2: Database Credential Rotation

```typescript
// lib/db/dynamic-credentials.ts
import { getSecretsManager } from '@/lib/secrets/manager';
import { PrismaClient } from '@prisma/client';

interface DatabaseCredentials {
  username: string;
  password: string;
  host: string;
  port: number;
  database: string;
}

let currentCredentials: DatabaseCredentials | null = null;
let credentialsExpiry: Date | null = null;

export async function getDynamicPrismaClient(): Promise<PrismaClient> {
  const manager = getSecretsManager();
  await manager.initialize();

  // Check if credentials need refresh
  if (!currentCredentials || !credentialsExpiry || new Date() > credentialsExpiry) {
    const creds = await manager.getDatabaseCredentials('app-role');
    if (!creds) throw new Error('Failed to get database credentials');

    const host = await manager.getSecret('DATABASE_HOST');
    const port = await manager.getSecret('DATABASE_PORT');
    const database = await manager.getSecret('DATABASE_NAME');

    currentCredentials = {
      username: creds.username,
      password: creds.password,
      host: host || 'localhost',
      port: parseInt(port || '5432'),
      database: database || 'app',
    };

    // Set expiry to 1 hour (Vault lease duration)
    credentialsExpiry = new Date(Date.now() + 60 * 60 * 1000);
  }

  const connectionString = `postgresql://${currentCredentials.username}:${currentCredentials.password}@${currentCredentials.host}:${currentCredentials.port}/${currentCredentials.database}`;

  return new PrismaClient({
    datasources: {
      db: { url: connectionString },
    },
  });
}

// Setup rotation for static database credentials
export async function setupDatabaseCredentialRotation(): Promise<void> {
  const manager = getSecretsManager();
  await manager.initialize();

  const rotationManager = manager.getRotationManager();

  await rotationManager.registerRotation(
    'database-credentials',
    'DATABASE_PASSWORD',
    'production',
    {
      enabled: true,
      schedule: '0 0 1 * *', // Monthly on 1st
      retentionCount: 3,
      notifyBefore: 72, // 3 days before
      autoRotate: true,
    }
  );
}
```

### Example 3: JWT Signing Key Rotation

```typescript
// lib/auth/jwt-secrets.ts
import { getSecretsManager } from '@/lib/secrets/manager';
import { SignJWT, jwtVerify } from 'jose';

interface JWTKeySet {
  current: string;
  previous?: string;
  currentVersion: number;
}

export async function getJWTKeySet(): Promise<JWTKeySet> {
  const manager = getSecretsManager();
  await manager.initialize();

  const currentKey = await manager.getSecret('JWT_SIGNING_KEY');
  const previousKey = await manager.getSecret('JWT_SIGNING_KEY_PREVIOUS');
  const version = await manager.getSecret('JWT_KEY_VERSION');

  if (!currentKey) {
    throw new Error('JWT signing key not found');
  }

  return {
    current: currentKey,
    previous: previousKey || undefined,
    currentVersion: parseInt(version || '1'),
  };
}

export async function signToken(payload: Record<string, unknown>): Promise<string> {
  const keySet = await getJWTKeySet();
  const key = new TextEncoder().encode(keySet.current);

  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256', kid: `v${keySet.currentVersion}` })
    .setIssuedAt()
    .setExpirationTime('1h')
    .sign(key);
}

export async function verifyToken(token: string): Promise<Record<string, unknown> | null> {
  const keySet = await getJWTKeySet();

  // Try current key first
  try {
    const key = new TextEncoder().encode(keySet.current);
    const { payload } = await jwtVerify(token, key);
    return payload as Record<string, unknown>;
  } catch {
    // Try previous key for tokens signed before rotation
    if (keySet.previous) {
      try {
        const key = new TextEncoder().encode(keySet.previous);
        const { payload } = await jwtVerify(token, key);
        return payload as Record<string, unknown>;
      } catch {
        return null;
      }
    }
    return null;
  }
}

// Rotate JWT keys
export async function rotateJWTKeys(): Promise<void> {
  const manager = getSecretsManager();
  await manager.initialize();

  const currentKey = await manager.getSecret('JWT_SIGNING_KEY');
  const currentVersion = await manager.getSecret('JWT_KEY_VERSION');

  // Move current to previous
  if (currentKey) {
    await manager.setSecret('JWT_SIGNING_KEY_PREVIOUS', currentKey);
  }

  // Generate new key
  const newKey = crypto.randomUUID() + crypto.randomUUID();
  await manager.setSecret('JWT_SIGNING_KEY', newKey);

  // Increment version
  const newVersion = (parseInt(currentVersion || '1') + 1).toString();
  await manager.setSecret('JWT_KEY_VERSION', newVersion);
}
```

## Anti-patterns

### Anti-pattern 1: Hardcoding Secrets

```typescript
// BAD - Secrets hardcoded in source code
const stripeKey = 'sk_live_abc123xyz';
const stripe = new Stripe(stripeKey);

// BAD - Secrets in configuration files committed to git
// config/production.json
{
  "database": {
    "password": "super_secret_password"
  }
}

// GOOD - Fetch secrets from secure storage
import { getSecretsManager } from '@/lib/secrets/manager';

async function initStripe() {
  const manager = getSecretsManager();
  await manager.initialize();

  const secretKey = await manager.getSecret('STRIPE_SECRET_KEY');
  if (!secretKey) {
    throw new Error('Stripe key not configured');
  }

  return new Stripe(secretKey);
}
```

### Anti-pattern 2: Logging Secrets

```typescript
// BAD - Logging secret values
async function getApiKey() {
  const key = await getSecret('API_KEY');
  console.log(`Fetched API key: ${key}`); // NEVER DO THIS
  return key;
}

// BAD - Including secrets in error messages
async function callExternalApi() {
  const apiKey = await getSecret('EXTERNAL_API_KEY');
  try {
    await fetch(url, { headers: { Authorization: apiKey } });
  } catch (error) {
    throw new Error(`Failed with key ${apiKey}: ${error}`); // NEVER DO THIS
  }
}

// GOOD - Never log or expose secret values
async function getApiKey() {
  const key = await getSecret('API_KEY');
  console.log('API key fetched successfully'); // Log action, not value
  return key;
}

// GOOD - Redact secrets in errors
async function callExternalApi() {
  const apiKey = await getSecret('EXTERNAL_API_KEY');
  try {
    await fetch(url, { headers: { Authorization: apiKey } });
  } catch (error) {
    console.error('External API call failed', {
      hasApiKey: !!apiKey,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw new Error('External API call failed');
  }
}
```

### Anti-pattern 3: Not Rotating Credentials

```typescript
// BAD - Using static credentials without rotation
const DATABASE_URL = process.env.DATABASE_URL; // Same password for years

// BAD - No expiration tracking
const apiKey = await vault.getSecret('api-key');
// Using potentially compromised key indefinitely

// GOOD - Implement credential rotation
import { getSecretsManager } from '@/lib/secrets/manager';

async function setupCredentialRotation() {
  const manager = getSecretsManager();
  const rotationManager = manager.getRotationManager();

  // Register rotation schedule
  await rotationManager.registerRotation(
    'database-password',
    'DATABASE_PASSWORD',
    'production',
    {
      enabled: true,
      schedule: '0 0 * * 0', // Weekly
      retentionCount: 2,
      notifyBefore: 48,
      autoRotate: true,
    }
  );

  // Setup cron job to run scheduled rotations
  // In production, use a proper job scheduler
  setInterval(async () => {
    const result = await rotationManager.runScheduledRotations();
    if (result.failed.length > 0) {
      // Alert on failed rotations
      console.error('Failed rotations:', result.failed);
    }
  }, 60 * 60 * 1000); // Check hourly
}
```

### Anti-pattern 4: No Audit Trail

```typescript
// BAD - No tracking of secret access
async function getApiCredentials() {
  const key = await vault.read('secret/api-key');
  return key; // No record of who accessed what when
}

// GOOD - Comprehensive audit logging
import { getSecretsManager } from '@/lib/secrets/manager';

async function getApiCredentials(userId: string) {
  const manager = getSecretsManager();

  // Manager automatically logs all access with context
  const key = await manager.getSecret('api-key');

  // Access is logged with userId, timestamp, IP, etc.
  return key;
}

// Query audit logs for compliance
async function getSecretAccessReport(startDate: Date, endDate: Date) {
  const manager = getSecretsManager();
  const auditLogger = manager.getAuditLogger();

  const logs = await auditLogger.getAccessLogs({
    startDate,
    endDate,
  }, { page: 1, limit: 1000 });

  return logs;
}
```

## Testing

```typescript
// __tests__/secrets/manager.test.ts
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { SecretsManager } from '@/lib/secrets/manager';
import { VaultClient } from '@/lib/secrets/vault-client';
import { SecretsCache } from '@/lib/secrets/cache';

vi.mock('@/lib/secrets/vault-client');
vi.mock('@/lib/secrets/cache');

describe('SecretsManager', () => {
  let manager: SecretsManager;
  let mockVaultClient: VaultClient;
  let mockCache: SecretsCache;

  beforeEach(() => {
    mockVaultClient = new VaultClient({
      address: 'http://localhost:8200',
      mountPath: 'secret',
    });

    mockCache = new SecretsCache(undefined, 300);

    manager = new SecretsManager({
      vault: {
        address: 'http://localhost:8200',
        mountPath: 'secret',
      },
      cache: {
        enabled: true,
        ttlSeconds: 300,
      },
      audit: {
        enabled: false,
        retentionDays: 90,
      },
      encryption: {
        algorithm: 'aes-256-gcm',
        keyId: 'test',
      },
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should return cached secret if available', async () => {
    const cachedSecret = {
      metadata: {
        id: 'test-secret',
        name: 'API_KEY',
        type: 'static' as const,
        category: 'api-key' as const,
        environment: 'development',
        version: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        tags: [],
      },
      value: 'cached-value',
    };

    vi.mocked(mockCache.get).mockResolvedValue(cachedSecret);

    const value = await manager.getSecret('API_KEY');

    expect(value).toBe('cached-value');
    expect(mockVaultClient.getSecret).not.toHaveBeenCalled();
  });

  it('should fetch from Vault when cache misses', async () => {
    vi.mocked(mockCache.get).mockResolvedValue(null);
    vi.mocked(mockVaultClient.getSecret).mockResolvedValue({
      metadata: {
        id: 'test-secret',
        name: 'API_KEY',
        type: 'static',
        category: 'api-key',
        environment: 'development',
        version: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        tags: [],
      },
      value: 'vault-value',
    });

    const value = await manager.getSecret('API_KEY');

    expect(value).toBe('vault-value');
    expect(mockVaultClient.getSecret).toHaveBeenCalledWith('API_KEY', 'development');
    expect(mockCache.set).toHaveBeenCalled();
  });

  it('should invalidate cache when secret is updated', async () => {
    vi.mocked(mockVaultClient.setSecret).mockResolvedValue(true);

    await manager.setSecret('API_KEY', 'new-value');

    expect(mockCache.invalidate).toHaveBeenCalledWith('API_KEY', 'development');
  });
});

// __tests__/secrets/rotation.test.ts
describe('CredentialRotationManager', () => {
  it('should rotate secret and update cache', async () => {
    const manager = getSecretsManager();
    const rotationManager = manager.getRotationManager();

    await rotationManager.registerRotation(
      'test-secret',
      'TEST_KEY',
      'development',
      {
        enabled: true,
        schedule: '0 0 * * *',
        retentionCount: 3,
        notifyBefore: 24,
        autoRotate: true,
      }
    );

    const success = await rotationManager.rotateSecret('test-secret');

    expect(success).toBe(true);
  });

  it('should identify expiring secrets', async () => {
    const manager = getSecretsManager();
    const rotationManager = manager.getRotationManager();

    // Register secret expiring soon
    await rotationManager.registerRotation(
      'expiring-secret',
      'EXPIRING_KEY',
      'development',
      {
        enabled: true,
        schedule: '0 0 * * *',
        retentionCount: 3,
        notifyBefore: 48,
        autoRotate: false,
      }
    );

    const expiring = await rotationManager.checkExpiringSecrets(72);

    expect(expiring.length).toBeGreaterThan(0);
  });
});

// __tests__/secrets/audit.test.ts
describe('SecretsAuditLogger', () => {
  it('should log secret access', async () => {
    const { SecretsAuditLogger } = await import('@/lib/secrets/audit');
    const logger = new SecretsAuditLogger(true, 90);

    await logger.logRead(
      'test-id',
      'TEST_SECRET',
      'user-123',
      { ipAddress: '127.0.0.1' }
    );

    const logs = await logger.getAccessLogs(
      { secretId: 'test-id' },
      { page: 1, limit: 10 }
    );

    expect(logs.logs.length).toBeGreaterThan(0);
    expect(logs.logs[0].operation).toBe('read');
  });

  it('should clean up old audit logs', async () => {
    const { SecretsAuditLogger } = await import('@/lib/secrets/audit');
    const logger = new SecretsAuditLogger(true, 1);

    const deletedCount = await logger.cleanup();

    expect(typeof deletedCount).toBe('number');
  });
});
```

## Related Skills

### Composes From
- [encryption](./encryption.md) - Encrypt secrets at rest
- [redis-cache](./redis-cache.md) - Cache layer for secrets
- [prisma-patterns](./prisma-patterns.md) - Database for audit logs

### Composes Into
- [multi-tenancy](./multi-tenancy.md) - Tenant-isolated secrets
- [api-gateway](./api-gateway.md) - API key management
- [zero-downtime](./zero-downtime.md) - Credential rotation during deployment

### Alternatives
- [environment-variables](./environment-variables.md) - Simple env-based secrets for small projects
- AWS Secrets Manager - AWS-native secrets management
- Azure Key Vault - Azure-native secrets management

---

## Changelog

### 1.0.0 (2025-01-18)
- Initial implementation
- Vault integration with KV v2 engine
- Redis caching layer
- Prisma-based audit logging
- Credential rotation scheduler
- Environment-based injection
- Server action integration
- Comprehensive testing examples
