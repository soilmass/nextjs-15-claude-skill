---
id: pt-abac
name: Attribute-Based Access Control
version: 1.0.0
layer: L5
category: auth
description: Implement Attribute-Based Access Control with policy engines, resource attributes, and context-aware authorization decisions
tags: [abac, authorization, policy, permissions, context, attributes, next15, security]
composes: []
dependencies:
  "@prisma/client": "^5.0.0"
  "ioredis": "^5.3.0"
formula: "ABAC = Subject (who) + Resource (what) + Action (how) + Environment (when/where) + Policies (rules)"
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# Attribute-Based Access Control (ABAC)

## Overview

Attribute-Based Access Control (ABAC) is a sophisticated authorization model that evaluates access decisions based on attributes of subjects (users), resources, actions, and environmental conditions. Unlike Role-Based Access Control (RBAC) which relies on predefined roles, ABAC provides fine-grained, context-aware authorization that can express complex business rules and compliance requirements.

In Next.js 15 applications, ABAC enables dynamic authorization decisions that consider multiple factors: user department and clearance level, resource sensitivity and ownership, requested action type, time of day, IP location, and device type. This pattern implements a complete ABAC system with a policy engine, attribute providers, decision caching, and audit logging suitable for enterprise applications with complex authorization requirements.

ABAC excels in scenarios where authorization rules are dynamic, context-dependent, and need to express complex conditions. For example, "allow doctors to access patient records only during business hours, only for patients assigned to them, and only from approved hospital network IP addresses" is a rule that ABAC can elegantly express and enforce.

## When to Use

Use this pattern when:
- Authorization decisions depend on multiple attributes beyond just roles
- You need context-aware access control (time, location, device)
- Business rules require fine-grained permissions that change frequently
- Compliance requirements mandate attribute-based restrictions (HIPAA, GDPR)
- Resource-level permissions depend on ownership or relationship attributes
- You need to implement dynamic policies without code changes
- Authorization rules are complex and involve multiple conditions

## When NOT to Use

Avoid this pattern when:
- Simple role-based access is sufficient for your use case
- Your application has few resources and straightforward permissions
- Performance is critical and you cannot afford policy evaluation overhead
- You don't have resources to maintain a policy management system
- The team is unfamiliar with policy languages and ABAC concepts

## Composition Diagram

```
ATTRIBUTE-BASED ACCESS CONTROL ARCHITECTURE
============================================

┌─────────────────────────────────────────────────────────────────────────────┐
│                              ABAC SYSTEM                                     │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
        ┌─────────────────────────────┼─────────────────────────────────────┐
        │                             │                                     │
        ▼                             ▼                                     ▼
┌───────────────┐           ┌───────────────┐                     ┌───────────────┐
│   SUBJECTS    │           │  RESOURCES    │                     │  ENVIRONMENT  │
│  (Who)        │           │  (What)       │                     │  (Context)    │
├───────────────┤           ├───────────────┤                     ├───────────────┤
│• userId       │           │• resourceId   │                     │• currentTime  │
│• department   │           │• resourceType │                     │• ipAddress    │
│• clearance    │           │• owner        │                     │• deviceType   │
│• groups       │           │• sensitivity  │                     │• geoLocation  │
│• title        │           │• classification│                    │• riskScore    │
└───────┬───────┘           └───────┬───────┘                     └───────┬───────┘
        │                           │                                     │
        └───────────────────────────┼─────────────────────────────────────┘
                                    │
                                    ▼
                    ┌───────────────────────────────┐
                    │        POLICY ENGINE          │
                    │                               │
                    │  ┌─────────────────────────┐  │
                    │  │   Policy Repository     │  │
                    │  │   ┌─────┐ ┌─────┐      │  │
                    │  │   │ P1  │ │ P2  │ ...  │  │
                    │  │   └─────┘ └─────┘      │  │
                    │  └─────────────────────────┘  │
                    │              │                │
                    │              ▼                │
                    │  ┌─────────────────────────┐  │
                    │  │   Policy Evaluator      │  │
                    │  │   - Condition Parser    │  │
                    │  │   - Attribute Resolver  │  │
                    │  │   - Decision Combiner   │  │
                    │  └─────────────────────────┘  │
                    │              │                │
                    └──────────────┼────────────────┘
                                   │
                    ┌──────────────┼──────────────┐
                    │              │              │
                    ▼              ▼              ▼
             ┌──────────┐  ┌──────────┐  ┌──────────┐
             │  PERMIT  │  │   DENY   │  │  N/A     │
             └──────────┘  └──────────┘  └──────────┘

Decision Flow:
┌─────────────────────────────────────────────────────────────────────────────┐
│  Request → Collect Attributes → Find Applicable Policies → Evaluate →      │
│  Combine Decisions → Cache Result → Audit Log → Return Decision            │
└─────────────────────────────────────────────────────────────────────────────┘

Policy Structure:
┌─────────────────────────────────────────────────────────────────────────────┐
│  Policy = {                                                                  │
│    target: { subjects, resources, actions }  // When policy applies         │
│    rules: [                                  // Conditions to evaluate      │
│      { condition, effect: PERMIT|DENY }                                     │
│    ]                                                                        │
│    combiningAlgorithm: DENY_UNLESS_PERMIT | PERMIT_UNLESS_DENY              │
│  }                                                                          │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Implementation

### Core Types and Definitions

```typescript
// lib/abac/types.ts
export type Decision = 'PERMIT' | 'DENY' | 'NOT_APPLICABLE' | 'INDETERMINATE';
export type CombiningAlgorithm =
  | 'DENY_OVERRIDES'
  | 'PERMIT_OVERRIDES'
  | 'FIRST_APPLICABLE'
  | 'DENY_UNLESS_PERMIT'
  | 'PERMIT_UNLESS_DENY';

export interface Attribute {
  id: string;
  category: 'subject' | 'resource' | 'action' | 'environment';
  dataType: 'string' | 'number' | 'boolean' | 'date' | 'array';
  value: unknown;
}

export interface AttributeContext {
  subject: Record<string, unknown>;
  resource: Record<string, unknown>;
  action: Record<string, unknown>;
  environment: Record<string, unknown>;
}

export interface Condition {
  attribute: string;
  category: Attribute['category'];
  operator:
    | 'equals'
    | 'notEquals'
    | 'contains'
    | 'in'
    | 'notIn'
    | 'greaterThan'
    | 'lessThan'
    | 'greaterThanOrEqual'
    | 'lessThanOrEqual'
    | 'matches'
    | 'startsWith'
    | 'endsWith'
    | 'between';
  value: unknown;
}

export interface Rule {
  id: string;
  description?: string;
  conditions: Condition[];
  conditionCombining: 'AND' | 'OR';
  effect: 'PERMIT' | 'DENY';
}

export interface PolicyTarget {
  subjects?: Condition[];
  resources?: Condition[];
  actions?: Condition[];
}

export interface Policy {
  id: string;
  name: string;
  description?: string;
  version: number;
  enabled: boolean;
  priority: number;
  target: PolicyTarget;
  rules: Rule[];
  combiningAlgorithm: CombiningAlgorithm;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface AccessRequest {
  subject: Record<string, unknown>;
  resource: Record<string, unknown>;
  action: string;
  environment?: Record<string, unknown>;
}

export interface AccessDecision {
  decision: Decision;
  policies: {
    policyId: string;
    policyName: string;
    decision: Decision;
    matchedRules: string[];
  }[];
  obligations?: Record<string, unknown>[];
  advice?: string[];
  evaluationTime: number;
  cached: boolean;
}

export interface AuditEntry {
  id: string;
  timestamp: Date;
  request: AccessRequest;
  decision: AccessDecision;
  subjectId: string;
  resourceId: string;
  action: string;
  ipAddress?: string;
  userAgent?: string;
}
```

### Condition Evaluator

```typescript
// lib/abac/condition-evaluator.ts
import { Condition, AttributeContext } from './types';

export class ConditionEvaluator {
  evaluate(condition: Condition, context: AttributeContext): boolean {
    const categoryContext = context[condition.category];
    const attributeValue = this.getNestedValue(categoryContext, condition.attribute);

    if (attributeValue === undefined) {
      return false;
    }

    return this.evaluateOperator(
      condition.operator,
      attributeValue,
      condition.value
    );
  }

  private getNestedValue(obj: Record<string, unknown>, path: string): unknown {
    return path.split('.').reduce((current, key) => {
      return current && typeof current === 'object'
        ? (current as Record<string, unknown>)[key]
        : undefined;
    }, obj as unknown);
  }

  private evaluateOperator(
    operator: Condition['operator'],
    attributeValue: unknown,
    conditionValue: unknown
  ): boolean {
    switch (operator) {
      case 'equals':
        return this.equals(attributeValue, conditionValue);

      case 'notEquals':
        return !this.equals(attributeValue, conditionValue);

      case 'contains':
        if (Array.isArray(attributeValue)) {
          return attributeValue.includes(conditionValue);
        }
        if (typeof attributeValue === 'string') {
          return attributeValue.includes(String(conditionValue));
        }
        return false;

      case 'in':
        if (Array.isArray(conditionValue)) {
          return conditionValue.includes(attributeValue);
        }
        return false;

      case 'notIn':
        if (Array.isArray(conditionValue)) {
          return !conditionValue.includes(attributeValue);
        }
        return true;

      case 'greaterThan':
        return this.compare(attributeValue, conditionValue) > 0;

      case 'lessThan':
        return this.compare(attributeValue, conditionValue) < 0;

      case 'greaterThanOrEqual':
        return this.compare(attributeValue, conditionValue) >= 0;

      case 'lessThanOrEqual':
        return this.compare(attributeValue, conditionValue) <= 0;

      case 'matches':
        if (typeof attributeValue === 'string' && typeof conditionValue === 'string') {
          const regex = new RegExp(conditionValue);
          return regex.test(attributeValue);
        }
        return false;

      case 'startsWith':
        if (typeof attributeValue === 'string' && typeof conditionValue === 'string') {
          return attributeValue.startsWith(conditionValue);
        }
        return false;

      case 'endsWith':
        if (typeof attributeValue === 'string' && typeof conditionValue === 'string') {
          return attributeValue.endsWith(conditionValue);
        }
        return false;

      case 'between':
        if (Array.isArray(conditionValue) && conditionValue.length === 2) {
          const [min, max] = conditionValue;
          return this.compare(attributeValue, min) >= 0 &&
                 this.compare(attributeValue, max) <= 0;
        }
        return false;

      default:
        return false;
    }
  }

  private equals(a: unknown, b: unknown): boolean {
    if (a === b) return true;
    if (a instanceof Date && b instanceof Date) {
      return a.getTime() === b.getTime();
    }
    if (Array.isArray(a) && Array.isArray(b)) {
      return a.length === b.length && a.every((v, i) => this.equals(v, b[i]));
    }
    return JSON.stringify(a) === JSON.stringify(b);
  }

  private compare(a: unknown, b: unknown): number {
    if (typeof a === 'number' && typeof b === 'number') {
      return a - b;
    }
    if (a instanceof Date && b instanceof Date) {
      return a.getTime() - b.getTime();
    }
    if (typeof a === 'string' && typeof b === 'string') {
      return a.localeCompare(b);
    }
    return 0;
  }
}
```

### Policy Evaluator

```typescript
// lib/abac/policy-evaluator.ts
import {
  Policy,
  Rule,
  PolicyTarget,
  AttributeContext,
  Decision,
  CombiningAlgorithm,
} from './types';
import { ConditionEvaluator } from './condition-evaluator';

export class PolicyEvaluator {
  private conditionEvaluator: ConditionEvaluator;

  constructor() {
    this.conditionEvaluator = new ConditionEvaluator();
  }

  evaluatePolicy(policy: Policy, context: AttributeContext): {
    decision: Decision;
    matchedRules: string[];
  } {
    // Check if policy target matches
    if (!this.targetMatches(policy.target, context)) {
      return { decision: 'NOT_APPLICABLE', matchedRules: [] };
    }

    // Evaluate all rules
    const ruleResults: { ruleId: string; decision: Decision }[] = [];

    for (const rule of policy.rules) {
      const ruleDecision = this.evaluateRule(rule, context);
      ruleResults.push({ ruleId: rule.id, decision: ruleDecision });
    }

    // Combine rule decisions
    const { decision, matchedRules } = this.combineDecisions(
      ruleResults,
      policy.combiningAlgorithm
    );

    return { decision, matchedRules };
  }

  private targetMatches(target: PolicyTarget, context: AttributeContext): boolean {
    // Check subject conditions
    if (target.subjects && target.subjects.length > 0) {
      const subjectMatch = target.subjects.every((condition) =>
        this.conditionEvaluator.evaluate(
          { ...condition, category: 'subject' },
          context
        )
      );
      if (!subjectMatch) return false;
    }

    // Check resource conditions
    if (target.resources && target.resources.length > 0) {
      const resourceMatch = target.resources.every((condition) =>
        this.conditionEvaluator.evaluate(
          { ...condition, category: 'resource' },
          context
        )
      );
      if (!resourceMatch) return false;
    }

    // Check action conditions
    if (target.actions && target.actions.length > 0) {
      const actionMatch = target.actions.every((condition) =>
        this.conditionEvaluator.evaluate(
          { ...condition, category: 'action' },
          context
        )
      );
      if (!actionMatch) return false;
    }

    return true;
  }

  private evaluateRule(rule: Rule, context: AttributeContext): Decision {
    if (rule.conditions.length === 0) {
      return rule.effect;
    }

    let conditionsMet: boolean;

    if (rule.conditionCombining === 'AND') {
      conditionsMet = rule.conditions.every((condition) =>
        this.conditionEvaluator.evaluate(condition, context)
      );
    } else {
      conditionsMet = rule.conditions.some((condition) =>
        this.conditionEvaluator.evaluate(condition, context)
      );
    }

    if (conditionsMet) {
      return rule.effect;
    }

    return 'NOT_APPLICABLE';
  }

  private combineDecisions(
    ruleResults: { ruleId: string; decision: Decision }[],
    algorithm: CombiningAlgorithm
  ): { decision: Decision; matchedRules: string[] } {
    const matchedRules: string[] = [];

    switch (algorithm) {
      case 'DENY_OVERRIDES': {
        // If any rule denies, deny
        for (const result of ruleResults) {
          if (result.decision === 'DENY') {
            matchedRules.push(result.ruleId);
            return { decision: 'DENY', matchedRules };
          }
          if (result.decision === 'PERMIT') {
            matchedRules.push(result.ruleId);
          }
        }
        return {
          decision: matchedRules.length > 0 ? 'PERMIT' : 'NOT_APPLICABLE',
          matchedRules,
        };
      }

      case 'PERMIT_OVERRIDES': {
        // If any rule permits, permit
        for (const result of ruleResults) {
          if (result.decision === 'PERMIT') {
            matchedRules.push(result.ruleId);
            return { decision: 'PERMIT', matchedRules };
          }
          if (result.decision === 'DENY') {
            matchedRules.push(result.ruleId);
          }
        }
        return {
          decision: matchedRules.length > 0 ? 'DENY' : 'NOT_APPLICABLE',
          matchedRules,
        };
      }

      case 'FIRST_APPLICABLE': {
        // Return first applicable decision
        for (const result of ruleResults) {
          if (result.decision !== 'NOT_APPLICABLE') {
            return { decision: result.decision, matchedRules: [result.ruleId] };
          }
        }
        return { decision: 'NOT_APPLICABLE', matchedRules: [] };
      }

      case 'DENY_UNLESS_PERMIT': {
        // Deny unless explicitly permitted
        for (const result of ruleResults) {
          if (result.decision === 'PERMIT') {
            matchedRules.push(result.ruleId);
            return { decision: 'PERMIT', matchedRules };
          }
        }
        return { decision: 'DENY', matchedRules: [] };
      }

      case 'PERMIT_UNLESS_DENY': {
        // Permit unless explicitly denied
        for (const result of ruleResults) {
          if (result.decision === 'DENY') {
            matchedRules.push(result.ruleId);
            return { decision: 'DENY', matchedRules };
          }
        }
        return { decision: 'PERMIT', matchedRules: [] };
      }

      default:
        return { decision: 'INDETERMINATE', matchedRules: [] };
    }
  }
}
```

### Policy Repository

```typescript
// lib/abac/policy-repository.ts
import { prisma } from '@/lib/db';
import { Policy } from './types';
import Redis from 'ioredis';

export class PolicyRepository {
  private redis: Redis | null = null;
  private memoryCacheTTL = 60000; // 1 minute
  private memoryCache: Map<string, { policy: Policy; expiresAt: number }> = new Map();

  constructor(redisUrl?: string) {
    if (redisUrl) {
      this.redis = new Redis(redisUrl);
    }
  }

  async getPolicy(id: string): Promise<Policy | null> {
    // Check memory cache
    const cached = this.memoryCache.get(id);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.policy;
    }

    // Check Redis cache
    if (this.redis) {
      const redisData = await this.redis.get(`policy:${id}`);
      if (redisData) {
        const policy = this.deserializePolicy(JSON.parse(redisData));
        this.memoryCache.set(id, {
          policy,
          expiresAt: Date.now() + this.memoryCacheTTL,
        });
        return policy;
      }
    }

    // Fetch from database
    const dbPolicy = await prisma.abacPolicy.findUnique({
      where: { id },
      include: { rules: true },
    });

    if (!dbPolicy) return null;

    const policy = this.mapDbToPolicy(dbPolicy);

    // Cache the policy
    await this.cachePolicy(policy);

    return policy;
  }

  async getAllPolicies(enabled = true): Promise<Policy[]> {
    const dbPolicies = await prisma.abacPolicy.findMany({
      where: enabled ? { enabled: true } : undefined,
      include: { rules: true },
      orderBy: { priority: 'desc' },
    });

    return dbPolicies.map((p) => this.mapDbToPolicy(p));
  }

  async getPoliciesForResource(resourceType: string): Promise<Policy[]> {
    const cacheKey = `policies:resource:${resourceType}`;

    // Check Redis cache
    if (this.redis) {
      const cached = await this.redis.get(cacheKey);
      if (cached) {
        return JSON.parse(cached).map((p: any) => this.deserializePolicy(p));
      }
    }

    // Fetch from database
    const policies = await prisma.abacPolicy.findMany({
      where: {
        enabled: true,
        OR: [
          {
            target: {
              path: ['resources'],
              array_contains: [{ attribute: 'type', value: resourceType }],
            },
          },
          {
            target: {
              path: ['resources'],
              equals: null,
            },
          },
        ],
      },
      include: { rules: true },
      orderBy: { priority: 'desc' },
    });

    const mappedPolicies = policies.map((p) => this.mapDbToPolicy(p));

    // Cache the result
    if (this.redis) {
      await this.redis.setex(cacheKey, 300, JSON.stringify(mappedPolicies));
    }

    return mappedPolicies;
  }

  async createPolicy(policy: Omit<Policy, 'id' | 'createdAt' | 'updatedAt'>): Promise<Policy> {
    const created = await prisma.abacPolicy.create({
      data: {
        name: policy.name,
        description: policy.description,
        version: policy.version,
        enabled: policy.enabled,
        priority: policy.priority,
        target: policy.target as any,
        combiningAlgorithm: policy.combiningAlgorithm,
        metadata: policy.metadata as any,
        rules: {
          create: policy.rules.map((rule) => ({
            description: rule.description,
            conditions: rule.conditions as any,
            conditionCombining: rule.conditionCombining,
            effect: rule.effect,
          })),
        },
      },
      include: { rules: true },
    });

    const mappedPolicy = this.mapDbToPolicy(created);
    await this.invalidateCache();

    return mappedPolicy;
  }

  async updatePolicy(
    id: string,
    updates: Partial<Omit<Policy, 'id' | 'createdAt' | 'updatedAt'>>
  ): Promise<Policy | null> {
    const existing = await prisma.abacPolicy.findUnique({ where: { id } });
    if (!existing) return null;

    const updated = await prisma.abacPolicy.update({
      where: { id },
      data: {
        name: updates.name,
        description: updates.description,
        version: updates.version ?? existing.version + 1,
        enabled: updates.enabled,
        priority: updates.priority,
        target: updates.target as any,
        combiningAlgorithm: updates.combiningAlgorithm,
        metadata: updates.metadata as any,
        ...(updates.rules && {
          rules: {
            deleteMany: {},
            create: updates.rules.map((rule) => ({
              description: rule.description,
              conditions: rule.conditions as any,
              conditionCombining: rule.conditionCombining,
              effect: rule.effect,
            })),
          },
        }),
      },
      include: { rules: true },
    });

    const mappedPolicy = this.mapDbToPolicy(updated);
    await this.invalidateCache(id);

    return mappedPolicy;
  }

  async deletePolicy(id: string): Promise<boolean> {
    try {
      await prisma.abacPolicy.delete({ where: { id } });
      await this.invalidateCache(id);
      return true;
    } catch {
      return false;
    }
  }

  private async cachePolicy(policy: Policy): Promise<void> {
    this.memoryCache.set(policy.id, {
      policy,
      expiresAt: Date.now() + this.memoryCacheTTL,
    });

    if (this.redis) {
      await this.redis.setex(
        `policy:${policy.id}`,
        300,
        JSON.stringify(policy)
      );
    }
  }

  private async invalidateCache(policyId?: string): Promise<void> {
    if (policyId) {
      this.memoryCache.delete(policyId);
      if (this.redis) {
        await this.redis.del(`policy:${policyId}`);
      }
    } else {
      this.memoryCache.clear();
      if (this.redis) {
        const keys = await this.redis.keys('policy:*');
        if (keys.length > 0) {
          await this.redis.del(...keys);
        }
        const resourceKeys = await this.redis.keys('policies:resource:*');
        if (resourceKeys.length > 0) {
          await this.redis.del(...resourceKeys);
        }
      }
    }
  }

  private mapDbToPolicy(dbPolicy: any): Policy {
    return {
      id: dbPolicy.id,
      name: dbPolicy.name,
      description: dbPolicy.description,
      version: dbPolicy.version,
      enabled: dbPolicy.enabled,
      priority: dbPolicy.priority,
      target: dbPolicy.target as Policy['target'],
      rules: dbPolicy.rules.map((r: any) => ({
        id: r.id,
        description: r.description,
        conditions: r.conditions,
        conditionCombining: r.conditionCombining,
        effect: r.effect,
      })),
      combiningAlgorithm: dbPolicy.combiningAlgorithm as Policy['combiningAlgorithm'],
      metadata: dbPolicy.metadata,
      createdAt: dbPolicy.createdAt,
      updatedAt: dbPolicy.updatedAt,
    };
  }

  private deserializePolicy(data: any): Policy {
    return {
      ...data,
      createdAt: new Date(data.createdAt),
      updatedAt: new Date(data.updatedAt),
    };
  }

  async close(): Promise<void> {
    if (this.redis) {
      await this.redis.quit();
    }
  }
}
```

### Attribute Provider

```typescript
// lib/abac/attribute-provider.ts
import { prisma } from '@/lib/db';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';

export interface SubjectAttributes {
  id: string;
  email?: string;
  role?: string;
  department?: string;
  clearanceLevel?: number;
  groups?: string[];
  title?: string;
  isVerified?: boolean;
  createdAt?: Date;
}

export interface ResourceAttributes {
  id: string;
  type: string;
  ownerId?: string;
  sensitivity?: 'public' | 'internal' | 'confidential' | 'secret';
  classification?: string;
  department?: string;
  tags?: string[];
  createdAt?: Date;
}

export interface EnvironmentAttributes {
  currentTime: Date;
  dayOfWeek: number;
  hourOfDay: number;
  ipAddress?: string;
  userAgent?: string;
  geoLocation?: {
    country?: string;
    region?: string;
    city?: string;
  };
  deviceType?: 'desktop' | 'mobile' | 'tablet';
  isWorkingHours: boolean;
  riskScore?: number;
}

export class AttributeProvider {
  async getSubjectAttributes(userId?: string): Promise<SubjectAttributes | null> {
    if (!userId) {
      const session = await auth();
      userId = session?.user?.id;
    }

    if (!userId) return null;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        groups: true,
        profile: true,
      },
    });

    if (!user) return null;

    return {
      id: user.id,
      email: user.email || undefined,
      role: user.role,
      department: user.profile?.department,
      clearanceLevel: user.profile?.clearanceLevel,
      groups: user.groups.map((g) => g.name),
      title: user.profile?.title,
      isVerified: user.emailVerified !== null,
      createdAt: user.createdAt,
    };
  }

  async getResourceAttributes(
    resourceType: string,
    resourceId: string
  ): Promise<ResourceAttributes | null> {
    // Dynamic resource fetching based on type
    switch (resourceType) {
      case 'document': {
        const doc = await prisma.document.findUnique({
          where: { id: resourceId },
        });
        if (!doc) return null;
        return {
          id: doc.id,
          type: 'document',
          ownerId: doc.authorId,
          sensitivity: doc.sensitivity as any,
          classification: doc.classification,
          department: doc.department,
          tags: doc.tags,
          createdAt: doc.createdAt,
        };
      }

      case 'project': {
        const project = await prisma.project.findUnique({
          where: { id: resourceId },
        });
        if (!project) return null;
        return {
          id: project.id,
          type: 'project',
          ownerId: project.ownerId,
          sensitivity: project.visibility as any,
          department: project.department,
          tags: project.tags,
          createdAt: project.createdAt,
        };
      }

      case 'report': {
        const report = await prisma.report.findUnique({
          where: { id: resourceId },
        });
        if (!report) return null;
        return {
          id: report.id,
          type: 'report',
          ownerId: report.createdById,
          sensitivity: report.confidentiality as any,
          classification: report.classification,
          department: report.department,
          createdAt: report.createdAt,
        };
      }

      default:
        return null;
    }
  }

  async getEnvironmentAttributes(): Promise<EnvironmentAttributes> {
    const headersList = await headers();
    const now = new Date();

    const ipAddress =
      headersList.get('x-forwarded-for')?.split(',')[0] ||
      headersList.get('x-real-ip') ||
      undefined;

    const userAgent = headersList.get('user-agent') || undefined;

    // Determine device type from user agent
    let deviceType: EnvironmentAttributes['deviceType'] = 'desktop';
    if (userAgent) {
      if (/mobile/i.test(userAgent)) {
        deviceType = 'mobile';
      } else if (/tablet|ipad/i.test(userAgent)) {
        deviceType = 'tablet';
      }
    }

    const hourOfDay = now.getHours();
    const dayOfWeek = now.getDay();
    const isWorkingHours =
      dayOfWeek >= 1 && dayOfWeek <= 5 && // Monday to Friday
      hourOfDay >= 9 && hourOfDay < 17;    // 9 AM to 5 PM

    // Get geo location from IP (mock - in production use MaxMind or similar)
    const geoLocation = await this.getGeoLocation(ipAddress);

    // Calculate risk score based on various factors
    const riskScore = this.calculateRiskScore({
      isWorkingHours,
      deviceType,
      geoLocation,
    });

    return {
      currentTime: now,
      dayOfWeek,
      hourOfDay,
      ipAddress,
      userAgent,
      geoLocation,
      deviceType,
      isWorkingHours,
      riskScore,
    };
  }

  private async getGeoLocation(ipAddress?: string): Promise<EnvironmentAttributes['geoLocation']> {
    if (!ipAddress) return undefined;

    // In production, use a geo-IP service
    // This is a mock implementation
    const vercelCountry = (await headers()).get('x-vercel-ip-country');
    const vercelRegion = (await headers()).get('x-vercel-ip-country-region');
    const vercelCity = (await headers()).get('x-vercel-ip-city');

    if (vercelCountry) {
      return {
        country: vercelCountry,
        region: vercelRegion || undefined,
        city: vercelCity ? decodeURIComponent(vercelCity) : undefined,
      };
    }

    return undefined;
  }

  private calculateRiskScore(factors: {
    isWorkingHours: boolean;
    deviceType: EnvironmentAttributes['deviceType'];
    geoLocation?: EnvironmentAttributes['geoLocation'];
  }): number {
    let score = 0;

    // Non-working hours increases risk
    if (!factors.isWorkingHours) score += 20;

    // Mobile devices have higher risk
    if (factors.deviceType === 'mobile') score += 10;

    // Unknown location increases risk
    if (!factors.geoLocation) score += 15;

    return Math.min(score, 100);
  }
}
```

### Policy Decision Point (PDP)

```typescript
// lib/abac/pdp.ts
import { PolicyRepository } from './policy-repository';
import { PolicyEvaluator } from './policy-evaluator';
import { AttributeProvider } from './attribute-provider';
import {
  AccessRequest,
  AccessDecision,
  AttributeContext,
  Decision,
  CombiningAlgorithm,
} from './types';
import Redis from 'ioredis';
import { prisma } from '@/lib/db';

interface PDPConfig {
  redisUrl?: string;
  cacheTTL?: number;
  defaultDecision?: Decision;
  policyCombiningAlgorithm?: CombiningAlgorithm;
  auditEnabled?: boolean;
}

export class PolicyDecisionPoint {
  private repository: PolicyRepository;
  private evaluator: PolicyEvaluator;
  private attributeProvider: AttributeProvider;
  private redis: Redis | null = null;
  private cacheTTL: number;
  private defaultDecision: Decision;
  private policyCombiningAlgorithm: CombiningAlgorithm;
  private auditEnabled: boolean;

  constructor(config: PDPConfig = {}) {
    this.repository = new PolicyRepository(config.redisUrl);
    this.evaluator = new PolicyEvaluator();
    this.attributeProvider = new AttributeProvider();
    this.cacheTTL = config.cacheTTL ?? 60;
    this.defaultDecision = config.defaultDecision ?? 'DENY';
    this.policyCombiningAlgorithm = config.policyCombiningAlgorithm ?? 'DENY_OVERRIDES';
    this.auditEnabled = config.auditEnabled ?? true;

    if (config.redisUrl) {
      this.redis = new Redis(config.redisUrl);
    }
  }

  async evaluate(request: AccessRequest): Promise<AccessDecision> {
    const startTime = performance.now();

    // Check cache first
    const cacheKey = this.getCacheKey(request);
    const cachedDecision = await this.getCachedDecision(cacheKey);
    if (cachedDecision) {
      cachedDecision.cached = true;
      cachedDecision.evaluationTime = performance.now() - startTime;
      return cachedDecision;
    }

    // Build attribute context
    const context = await this.buildContext(request);

    // Get applicable policies
    const resourceType = request.resource.type as string || 'default';
    const policies = await this.repository.getPoliciesForResource(resourceType);

    // Evaluate each policy
    const policyResults: AccessDecision['policies'] = [];

    for (const policy of policies) {
      const result = this.evaluator.evaluatePolicy(policy, context);
      policyResults.push({
        policyId: policy.id,
        policyName: policy.name,
        decision: result.decision,
        matchedRules: result.matchedRules,
      });
    }

    // Combine policy decisions
    const finalDecision = this.combinePolicyDecisions(policyResults);

    const decision: AccessDecision = {
      decision: finalDecision,
      policies: policyResults,
      evaluationTime: performance.now() - startTime,
      cached: false,
    };

    // Cache the decision
    await this.cacheDecision(cacheKey, decision);

    // Audit the decision
    if (this.auditEnabled) {
      await this.auditDecision(request, decision);
    }

    return decision;
  }

  async isPermitted(
    subjectId: string,
    resourceType: string,
    resourceId: string,
    action: string
  ): Promise<boolean> {
    const subjectAttrs = await this.attributeProvider.getSubjectAttributes(subjectId);
    const resourceAttrs = await this.attributeProvider.getResourceAttributes(
      resourceType,
      resourceId
    );

    if (!subjectAttrs || !resourceAttrs) {
      return false;
    }

    const request: AccessRequest = {
      subject: subjectAttrs,
      resource: resourceAttrs,
      action,
    };

    const decision = await this.evaluate(request);
    return decision.decision === 'PERMIT';
  }

  private async buildContext(request: AccessRequest): Promise<AttributeContext> {
    const environment = request.environment ||
      await this.attributeProvider.getEnvironmentAttributes();

    return {
      subject: request.subject,
      resource: request.resource,
      action: { name: request.action },
      environment,
    };
  }

  private combinePolicyDecisions(
    results: AccessDecision['policies']
  ): Decision {
    const applicableResults = results.filter(
      (r) => r.decision !== 'NOT_APPLICABLE'
    );

    if (applicableResults.length === 0) {
      return this.defaultDecision;
    }

    switch (this.policyCombiningAlgorithm) {
      case 'DENY_OVERRIDES':
        if (applicableResults.some((r) => r.decision === 'DENY')) {
          return 'DENY';
        }
        if (applicableResults.some((r) => r.decision === 'PERMIT')) {
          return 'PERMIT';
        }
        return this.defaultDecision;

      case 'PERMIT_OVERRIDES':
        if (applicableResults.some((r) => r.decision === 'PERMIT')) {
          return 'PERMIT';
        }
        if (applicableResults.some((r) => r.decision === 'DENY')) {
          return 'DENY';
        }
        return this.defaultDecision;

      case 'FIRST_APPLICABLE':
        return applicableResults[0]?.decision || this.defaultDecision;

      case 'DENY_UNLESS_PERMIT':
        return applicableResults.some((r) => r.decision === 'PERMIT')
          ? 'PERMIT'
          : 'DENY';

      case 'PERMIT_UNLESS_DENY':
        return applicableResults.some((r) => r.decision === 'DENY')
          ? 'DENY'
          : 'PERMIT';

      default:
        return this.defaultDecision;
    }
  }

  private getCacheKey(request: AccessRequest): string {
    const subjectKey = request.subject.id || 'anonymous';
    const resourceKey = `${request.resource.type}:${request.resource.id}`;
    return `abac:${subjectKey}:${resourceKey}:${request.action}`;
  }

  private async getCachedDecision(key: string): Promise<AccessDecision | null> {
    if (!this.redis) return null;

    try {
      const cached = await this.redis.get(key);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (error) {
      console.error('ABAC cache get error:', error);
    }

    return null;
  }

  private async cacheDecision(key: string, decision: AccessDecision): Promise<void> {
    if (!this.redis) return;

    try {
      await this.redis.setex(key, this.cacheTTL, JSON.stringify(decision));
    } catch (error) {
      console.error('ABAC cache set error:', error);
    }
  }

  private async auditDecision(
    request: AccessRequest,
    decision: AccessDecision
  ): Promise<void> {
    try {
      await prisma.abacAuditLog.create({
        data: {
          subjectId: String(request.subject.id || 'anonymous'),
          resourceType: String(request.resource.type),
          resourceId: String(request.resource.id),
          action: request.action,
          decision: decision.decision,
          policyResults: decision.policies as any,
          evaluationTime: decision.evaluationTime,
          requestContext: {
            subject: request.subject,
            resource: request.resource,
            environment: request.environment,
          } as any,
        },
      });
    } catch (error) {
      console.error('ABAC audit log error:', error);
    }
  }

  async invalidateCache(subjectId?: string, resourceType?: string): Promise<void> {
    if (!this.redis) return;

    let pattern = 'abac:';
    if (subjectId) pattern += `${subjectId}:`;
    else pattern += '*:';
    if (resourceType) pattern += `${resourceType}:`;
    else pattern += '*:';
    pattern += '*';

    const keys = await this.redis.keys(pattern);
    if (keys.length > 0) {
      await this.redis.del(...keys);
    }
  }

  async close(): Promise<void> {
    await this.repository.close();
    if (this.redis) {
      await this.redis.quit();
    }
  }
}

// Singleton instance
let pdp: PolicyDecisionPoint | null = null;

export function getPDP(): PolicyDecisionPoint {
  if (!pdp) {
    pdp = new PolicyDecisionPoint({
      redisUrl: process.env.REDIS_URL,
      cacheTTL: 60,
      defaultDecision: 'DENY',
      policyCombiningAlgorithm: 'DENY_OVERRIDES',
      auditEnabled: true,
    });
  }
  return pdp;
}
```

### React Hook for ABAC

```typescript
// hooks/use-abac.ts
'use client';

import { useState, useCallback, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface ABACCheckResult {
  permitted: boolean;
  loading: boolean;
  error: Error | null;
}

export function useABAC(
  resourceType: string,
  resourceId: string,
  action: string
): ABACCheckResult {
  const { data: session, status } = useSession();
  const [permitted, setPermitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (status === 'loading') return;

    const checkPermission = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/abac/check', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            resourceType,
            resourceId,
            action,
          }),
        });

        if (!response.ok) {
          throw new Error('Permission check failed');
        }

        const result = await response.json();
        setPermitted(result.permitted);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
        setPermitted(false);
      } finally {
        setLoading(false);
      }
    };

    checkPermission();
  }, [session, status, resourceType, resourceId, action]);

  return { permitted, loading, error };
}

// Guard component
export function ABACGuard({
  resourceType,
  resourceId,
  action,
  children,
  fallback = null,
  loadingComponent = null,
}: {
  resourceType: string;
  resourceId: string;
  action: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  loadingComponent?: React.ReactNode;
}) {
  const { permitted, loading } = useABAC(resourceType, resourceId, action);

  if (loading) {
    return <>{loadingComponent}</>;
  }

  if (!permitted) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
```

### Server-Side Authorization Helper

```typescript
// lib/abac/authorize.ts
import { auth } from '@/lib/auth';
import { getPDP } from './pdp';
import { redirect } from 'next/navigation';

export async function authorize(
  resourceType: string,
  resourceId: string,
  action: string,
  options?: {
    redirectOnDeny?: string;
    throwOnDeny?: boolean;
  }
): Promise<boolean> {
  const session = await auth();

  if (!session?.user?.id) {
    if (options?.redirectOnDeny) {
      redirect(options.redirectOnDeny);
    }
    if (options?.throwOnDeny) {
      throw new Error('Unauthorized: No session');
    }
    return false;
  }

  const pdp = getPDP();
  const permitted = await pdp.isPermitted(
    session.user.id,
    resourceType,
    resourceId,
    action
  );

  if (!permitted) {
    if (options?.redirectOnDeny) {
      redirect(options.redirectOnDeny);
    }
    if (options?.throwOnDeny) {
      throw new Error('Unauthorized: Access denied');
    }
  }

  return permitted;
}

// Usage in Server Component
export default async function DocumentPage({
  params,
}: {
  params: { id: string };
}) {
  await authorize('document', params.id, 'read', {
    redirectOnDeny: '/unauthorized',
  });

  // Fetch and render document
  const document = await getDocument(params.id);
  return <DocumentViewer document={document} />;
}
```

### Database Schema

```prisma
// prisma/schema.prisma

model AbacPolicy {
  id                 String     @id @default(cuid())
  name               String
  description        String?
  version            Int        @default(1)
  enabled            Boolean    @default(true)
  priority           Int        @default(0)
  target             Json       // PolicyTarget
  combiningAlgorithm String     // CombiningAlgorithm
  metadata           Json?
  rules              AbacRule[]
  createdAt          DateTime   @default(now())
  updatedAt          DateTime   @updatedAt

  @@index([enabled, priority])
}

model AbacRule {
  id                 String     @id @default(cuid())
  policyId           String
  policy             AbacPolicy @relation(fields: [policyId], references: [id], onDelete: Cascade)
  description        String?
  conditions         Json       // Condition[]
  conditionCombining String     // 'AND' | 'OR'
  effect             String     // 'PERMIT' | 'DENY'
  createdAt          DateTime   @default(now())

  @@index([policyId])
}

model AbacAuditLog {
  id              String   @id @default(cuid())
  subjectId       String
  resourceType    String
  resourceId      String
  action          String
  decision        String   // Decision
  policyResults   Json     // AccessDecision['policies']
  evaluationTime  Float
  requestContext  Json
  createdAt       DateTime @default(now())

  @@index([subjectId])
  @@index([resourceType, resourceId])
  @@index([createdAt])
  @@index([decision])
}

model UserProfile {
  id             String  @id @default(cuid())
  userId         String  @unique
  user           User    @relation(fields: [userId], references: [id])
  department     String?
  clearanceLevel Int     @default(0)
  title          String?
}
```

## Examples

### Example 1: Healthcare Document Access Policy

```typescript
// Policy: Doctors can only access patient records during working hours,
// for patients assigned to them, from approved networks

const healthcarePolicy: Omit<Policy, 'id' | 'createdAt' | 'updatedAt'> = {
  name: 'Healthcare Patient Record Access',
  description: 'Controls access to patient medical records',
  version: 1,
  enabled: true,
  priority: 100,
  target: {
    resources: [
      { attribute: 'type', category: 'resource', operator: 'equals', value: 'patient-record' },
    ],
  },
  rules: [
    {
      id: 'rule-1',
      description: 'Allow doctors to view assigned patient records during working hours',
      conditions: [
        // Subject must be a doctor
        { attribute: 'role', category: 'subject', operator: 'equals', value: 'doctor' },
        // Resource must be assigned to the subject
        { attribute: 'assignedDoctorId', category: 'resource', operator: 'equals', value: '${subject.id}' },
        // Must be during working hours
        { attribute: 'isWorkingHours', category: 'environment', operator: 'equals', value: true },
        // Risk score must be low
        { attribute: 'riskScore', category: 'environment', operator: 'lessThan', value: 30 },
      ],
      conditionCombining: 'AND',
      effect: 'PERMIT',
    },
    {
      id: 'rule-2',
      description: 'Allow emergency access for any doctor',
      conditions: [
        { attribute: 'role', category: 'subject', operator: 'equals', value: 'doctor' },
        { attribute: 'isEmergency', category: 'resource', operator: 'equals', value: true },
      ],
      conditionCombining: 'AND',
      effect: 'PERMIT',
    },
    {
      id: 'rule-3',
      description: 'Deny access from high-risk environments',
      conditions: [
        { attribute: 'riskScore', category: 'environment', operator: 'greaterThan', value: 70 },
      ],
      conditionCombining: 'AND',
      effect: 'DENY',
    },
  ],
  combiningAlgorithm: 'DENY_OVERRIDES',
};

// Usage in a Server Component
// app/patients/[id]/records/page.tsx
import { authorize } from '@/lib/abac/authorize';
import { getPatientRecord } from '@/lib/patient-service';

export default async function PatientRecordPage({
  params,
}: {
  params: { id: string };
}) {
  await authorize('patient-record', params.id, 'read', {
    redirectOnDeny: '/access-denied',
  });

  const record = await getPatientRecord(params.id);
  return <PatientRecordView record={record} />;
}
```

### Example 2: Financial Document Classification

```typescript
// Policy: Access to financial documents based on clearance level and department

const financialPolicy: Omit<Policy, 'id' | 'createdAt' | 'updatedAt'> = {
  name: 'Financial Document Access Control',
  version: 1,
  enabled: true,
  priority: 90,
  target: {
    resources: [
      { attribute: 'type', category: 'resource', operator: 'in', value: ['financial-report', 'budget', 'forecast'] },
    ],
  },
  rules: [
    {
      id: 'rule-public',
      description: 'Public documents are accessible to all employees',
      conditions: [
        { attribute: 'sensitivity', category: 'resource', operator: 'equals', value: 'public' },
        { attribute: 'isVerified', category: 'subject', operator: 'equals', value: true },
      ],
      conditionCombining: 'AND',
      effect: 'PERMIT',
    },
    {
      id: 'rule-internal',
      description: 'Internal documents require clearance level 2+',
      conditions: [
        { attribute: 'sensitivity', category: 'resource', operator: 'equals', value: 'internal' },
        { attribute: 'clearanceLevel', category: 'subject', operator: 'greaterThanOrEqual', value: 2 },
      ],
      conditionCombining: 'AND',
      effect: 'PERMIT',
    },
    {
      id: 'rule-confidential',
      description: 'Confidential documents require same department and clearance 3+',
      conditions: [
        { attribute: 'sensitivity', category: 'resource', operator: 'equals', value: 'confidential' },
        { attribute: 'clearanceLevel', category: 'subject', operator: 'greaterThanOrEqual', value: 3 },
        { attribute: 'department', category: 'subject', operator: 'equals', value: '${resource.department}' },
      ],
      conditionCombining: 'AND',
      effect: 'PERMIT',
    },
    {
      id: 'rule-secret',
      description: 'Secret documents require executive approval',
      conditions: [
        { attribute: 'sensitivity', category: 'resource', operator: 'equals', value: 'secret' },
        { attribute: 'clearanceLevel', category: 'subject', operator: 'greaterThanOrEqual', value: 5 },
        { attribute: 'groups', category: 'subject', operator: 'contains', value: 'executives' },
      ],
      conditionCombining: 'AND',
      effect: 'PERMIT',
    },
  ],
  combiningAlgorithm: 'FIRST_APPLICABLE',
};

// Server Action with ABAC
// app/actions/documents.ts
'use server';

import { getPDP } from '@/lib/abac/pdp';
import { auth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function downloadDocument(documentId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  const pdp = getPDP();
  const permitted = await pdp.isPermitted(
    session.user.id,
    'financial-report',
    documentId,
    'download'
  );

  if (!permitted) {
    throw new Error('Access denied: Insufficient clearance');
  }

  // Generate download URL
  const url = await generateSignedUrl(documentId);
  return { url };
}
```

### Example 3: Multi-Tenant Project Access

```typescript
// Policy: Project access based on organization membership and project role

const projectPolicy: Omit<Policy, 'id' | 'createdAt' | 'updatedAt'> = {
  name: 'Multi-Tenant Project Access',
  version: 1,
  enabled: true,
  priority: 85,
  target: {
    resources: [
      { attribute: 'type', category: 'resource', operator: 'equals', value: 'project' },
    ],
  },
  rules: [
    {
      id: 'rule-owner',
      description: 'Project owners have full access',
      conditions: [
        { attribute: 'ownerId', category: 'resource', operator: 'equals', value: '${subject.id}' },
      ],
      conditionCombining: 'AND',
      effect: 'PERMIT',
    },
    {
      id: 'rule-org-admin',
      description: 'Organization admins can manage all org projects',
      conditions: [
        { attribute: 'role', category: 'subject', operator: 'equals', value: 'org_admin' },
        { attribute: 'organizationId', category: 'resource', operator: 'equals', value: '${subject.organizationId}' },
      ],
      conditionCombining: 'AND',
      effect: 'PERMIT',
    },
    {
      id: 'rule-member-read',
      description: 'Org members can view public projects',
      conditions: [
        { attribute: 'organizationId', category: 'resource', operator: 'equals', value: '${subject.organizationId}' },
        { attribute: 'sensitivity', category: 'resource', operator: 'equals', value: 'public' },
        { attribute: 'name', category: 'action', operator: 'equals', value: 'read' },
      ],
      conditionCombining: 'AND',
      effect: 'PERMIT',
    },
    {
      id: 'rule-team-member',
      description: 'Team members can access team projects',
      conditions: [
        { attribute: 'teamId', category: 'resource', operator: 'in', value: '${subject.teamIds}' },
      ],
      conditionCombining: 'AND',
      effect: 'PERMIT',
    },
    {
      id: 'rule-cross-org-deny',
      description: 'Deny access to other organization projects',
      conditions: [
        { attribute: 'organizationId', category: 'resource', operator: 'notEquals', value: '${subject.organizationId}' },
      ],
      conditionCombining: 'AND',
      effect: 'DENY',
    },
  ],
  combiningAlgorithm: 'DENY_OVERRIDES',
};
```

## Anti-patterns

### Anti-pattern 1: Embedding Authorization Logic in Components

```typescript
// BAD - Authorization logic scattered in components
function DocumentEditor({ document, user }) {
  // Complex authorization logic mixed with UI
  const canEdit =
    user.role === 'admin' ||
    (user.role === 'editor' && document.departmentId === user.departmentId) ||
    (document.ownerId === user.id && user.isVerified);

  if (!canEdit) return <AccessDenied />;

  return <Editor document={document} />;
}

// GOOD - Use centralized ABAC
import { ABACGuard } from '@/hooks/use-abac';

function DocumentEditor({ document }) {
  return (
    <ABACGuard
      resourceType="document"
      resourceId={document.id}
      action="edit"
      fallback={<AccessDenied />}
    >
      <Editor document={document} />
    </ABACGuard>
  );
}
```

### Anti-pattern 2: Not Caching Policy Decisions

```typescript
// BAD - Evaluating policies on every request without caching
async function checkAccess(userId: string, resourceId: string, action: string) {
  // Fetches policies and evaluates every time
  const policies = await prisma.abacPolicy.findMany();
  const context = await buildContext(userId, resourceId);
  return evaluatePolicies(policies, context, action);
}

// GOOD - Use caching with appropriate TTL
import { getPDP } from '@/lib/abac/pdp';

async function checkAccess(userId: string, resourceId: string, action: string) {
  const pdp = getPDP();
  // PDP handles caching internally
  return pdp.isPermitted(userId, 'resource', resourceId, action);
}
```

### Anti-pattern 3: Ignoring Environment Context

```typescript
// BAD - Only checking subject and resource attributes
const policy = {
  rules: [
    {
      conditions: [
        { attribute: 'role', category: 'subject', operator: 'equals', value: 'admin' },
      ],
      effect: 'PERMIT',
    },
  ],
};

// GOOD - Include environment context for security
const policy = {
  rules: [
    {
      conditions: [
        { attribute: 'role', category: 'subject', operator: 'equals', value: 'admin' },
        // Only allow during working hours
        { attribute: 'isWorkingHours', category: 'environment', operator: 'equals', value: true },
        // Only allow from trusted networks
        { attribute: 'riskScore', category: 'environment', operator: 'lessThan', value: 50 },
      ],
      conditionCombining: 'AND',
      effect: 'PERMIT',
    },
  ],
};
```

### Anti-pattern 4: Client-Only Authorization

```typescript
// BAD - Only checking on client side
function DeleteButton({ documentId }) {
  const { permitted } = useABAC('document', documentId, 'delete');

  if (!permitted) return null;

  // Server endpoint not protected!
  const handleDelete = () => fetch(`/api/documents/${documentId}`, { method: 'DELETE' });

  return <button onClick={handleDelete}>Delete</button>;
}

// GOOD - Enforce on both client and server
function DeleteButton({ documentId }) {
  const { permitted } = useABAC('document', documentId, 'delete');

  if (!permitted) return null;

  return <button onClick={() => deleteDocument(documentId)}>Delete</button>;
}

// Server action with authorization
'use server';
export async function deleteDocument(documentId: string) {
  const session = await auth();
  const pdp = getPDP();

  const permitted = await pdp.isPermitted(
    session.user.id,
    'document',
    documentId,
    'delete'
  );

  if (!permitted) {
    throw new Error('Access denied');
  }

  await prisma.document.delete({ where: { id: documentId } });
}
```

## Testing

```typescript
// __tests__/abac/condition-evaluator.test.ts
import { describe, it, expect } from 'vitest';
import { ConditionEvaluator } from '@/lib/abac/condition-evaluator';

describe('ConditionEvaluator', () => {
  const evaluator = new ConditionEvaluator();

  describe('equals operator', () => {
    it('should match equal string values', () => {
      const result = evaluator.evaluate(
        { attribute: 'role', category: 'subject', operator: 'equals', value: 'admin' },
        { subject: { role: 'admin' }, resource: {}, action: {}, environment: {} }
      );
      expect(result).toBe(true);
    });

    it('should not match different values', () => {
      const result = evaluator.evaluate(
        { attribute: 'role', category: 'subject', operator: 'equals', value: 'admin' },
        { subject: { role: 'user' }, resource: {}, action: {}, environment: {} }
      );
      expect(result).toBe(false);
    });
  });

  describe('in operator', () => {
    it('should match when value is in array', () => {
      const result = evaluator.evaluate(
        { attribute: 'role', category: 'subject', operator: 'in', value: ['admin', 'moderator'] },
        { subject: { role: 'admin' }, resource: {}, action: {}, environment: {} }
      );
      expect(result).toBe(true);
    });
  });

  describe('between operator', () => {
    it('should match when value is in range', () => {
      const result = evaluator.evaluate(
        { attribute: 'clearanceLevel', category: 'subject', operator: 'between', value: [2, 5] },
        { subject: { clearanceLevel: 3 }, resource: {}, action: {}, environment: {} }
      );
      expect(result).toBe(true);
    });
  });
});

// __tests__/abac/policy-evaluator.test.ts
import { describe, it, expect } from 'vitest';
import { PolicyEvaluator } from '@/lib/abac/policy-evaluator';
import { Policy } from '@/lib/abac/types';

describe('PolicyEvaluator', () => {
  const evaluator = new PolicyEvaluator();

  const testPolicy: Policy = {
    id: 'test-policy',
    name: 'Test Policy',
    version: 1,
    enabled: true,
    priority: 100,
    target: {
      resources: [
        { attribute: 'type', category: 'resource', operator: 'equals', value: 'document' },
      ],
    },
    rules: [
      {
        id: 'rule-admin',
        conditions: [
          { attribute: 'role', category: 'subject', operator: 'equals', value: 'admin' },
        ],
        conditionCombining: 'AND',
        effect: 'PERMIT',
      },
      {
        id: 'rule-owner',
        conditions: [
          { attribute: 'ownerId', category: 'resource', operator: 'equals', value: 'user-1' },
          { attribute: 'id', category: 'subject', operator: 'equals', value: 'user-1' },
        ],
        conditionCombining: 'AND',
        effect: 'PERMIT',
      },
    ],
    combiningAlgorithm: 'PERMIT_OVERRIDES',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  it('should permit admin access', () => {
    const result = evaluator.evaluatePolicy(testPolicy, {
      subject: { id: 'user-2', role: 'admin' },
      resource: { id: 'doc-1', type: 'document', ownerId: 'user-1' },
      action: { name: 'read' },
      environment: {},
    });

    expect(result.decision).toBe('PERMIT');
  });

  it('should permit owner access', () => {
    const result = evaluator.evaluatePolicy(testPolicy, {
      subject: { id: 'user-1', role: 'user' },
      resource: { id: 'doc-1', type: 'document', ownerId: 'user-1' },
      action: { name: 'read' },
      environment: {},
    });

    expect(result.decision).toBe('PERMIT');
  });

  it('should deny non-owner non-admin access', () => {
    const result = evaluator.evaluatePolicy(testPolicy, {
      subject: { id: 'user-2', role: 'user' },
      resource: { id: 'doc-1', type: 'document', ownerId: 'user-1' },
      action: { name: 'read' },
      environment: {},
    });

    expect(result.decision).toBe('NOT_APPLICABLE');
  });

  it('should return NOT_APPLICABLE for non-matching target', () => {
    const result = evaluator.evaluatePolicy(testPolicy, {
      subject: { id: 'user-1', role: 'admin' },
      resource: { id: 'project-1', type: 'project' },
      action: { name: 'read' },
      environment: {},
    });

    expect(result.decision).toBe('NOT_APPLICABLE');
  });
});

// __tests__/abac/pdp.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PolicyDecisionPoint } from '@/lib/abac/pdp';

describe('PolicyDecisionPoint', () => {
  let pdp: PolicyDecisionPoint;

  beforeEach(() => {
    pdp = new PolicyDecisionPoint({
      defaultDecision: 'DENY',
      policyCombiningAlgorithm: 'DENY_OVERRIDES',
      auditEnabled: false,
    });
  });

  it('should deny access by default when no policies match', async () => {
    const decision = await pdp.evaluate({
      subject: { id: 'user-1' },
      resource: { id: 'unknown', type: 'unknown' },
      action: 'read',
    });

    expect(decision.decision).toBe('DENY');
  });

  it('should cache decisions', async () => {
    // First call
    await pdp.evaluate({
      subject: { id: 'user-1' },
      resource: { id: 'doc-1', type: 'document' },
      action: 'read',
    });

    // Second call should be cached
    const decision = await pdp.evaluate({
      subject: { id: 'user-1' },
      resource: { id: 'doc-1', type: 'document' },
      action: 'read',
    });

    expect(decision.cached).toBe(true);
  });
});
```

## Related Skills

### Composes From
- [rbac](./rbac.md) - Basic role-based access for simpler scenarios
- [session-management](./session-management.md) - User session for subject attributes
- [redis-cache](./redis-cache.md) - Caching for decision results

### Composes Into
- [multi-tenancy](./multi-tenancy.md) - Tenant-aware authorization
- [hipaa-compliance](./hipaa-compliance.md) - Healthcare access control
- [gdpr-compliance](./gdpr-compliance.md) - Data protection access rules

### Alternatives
- [rbac](./rbac.md) - When simpler role-based access is sufficient
- Open Policy Agent (OPA) - External policy engine for complex deployments
- Casbin - Library-based ABAC/RBAC implementation

---

## Changelog

### 1.0.0 (2025-01-18)
- Initial implementation
- Policy engine with multiple combining algorithms
- Condition evaluator with comprehensive operators
- Attribute provider for subjects, resources, and environment
- Redis caching for policy decisions
- Prisma-based policy storage and audit logging
- React hooks and guard components
- Server-side authorization helpers
- Comprehensive testing examples
