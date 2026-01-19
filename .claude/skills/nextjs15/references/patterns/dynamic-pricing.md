---
id: pt-dynamic-pricing
name: Dynamic Pricing
version: 1.0.0
layer: L5
category: e-commerce
description: Real-time pricing strategies with demand-based adjustments, competitor monitoring, and margin optimization
tags: [pricing, dynamic, optimization, e-commerce, next15]
composes: []
dependencies: {}
formula: Dynamic Pricing = Demand Elasticity + Competitor Monitoring + Margin Optimization + Time-based Rules
performance:
  impact: medium
  lcp: neutral
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# Dynamic Pricing

## Overview

Dynamic pricing systems enable intelligent price adjustments based on market conditions, demand signals, competition, and business rules. This pattern covers rule-based pricing engines, time-based promotions, demand-based adjustments, competitor price monitoring, and A/B price testing for Next.js 15 e-commerce applications.

### Key Concepts

- **Price Rules**: Configurable rules for automatic price adjustments
- **Time-Based Pricing**: Scheduled prices, flash sales, and promotional periods
- **Demand-Based Adjustments**: Pricing based on inventory levels and demand signals
- **Competitor Monitoring**: Automated tracking and response to competitor prices
- **A/B Price Testing**: Controlled experiments to optimize pricing strategies

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        DYNAMIC PRICING SYSTEM                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                      DATA INPUT LAYER                                 │   │
│  │                                                                        │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌────────────┐  │   │
│  │  │  Inventory  │  │   Demand    │  │ Competitor  │  │  Market    │  │   │
│  │  │  Levels     │  │   Signals   │  │   Prices    │  │  Trends    │  │   │
│  │  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └─────┬──────┘  │   │
│  │         │                │                │               │          │   │
│  │         └────────────────┼────────────────┼───────────────┘          │   │
│  │                          ▼                ▼                          │   │
│  │  ┌────────────────────────────────────────────────────────────────┐ │   │
│  │  │                    SIGNAL AGGREGATOR                            │ │   │
│  │  └────────────────────────────────────────────────────────────────┘ │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                    │                                         │
│                                    ▼                                         │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                      PRICING ENGINE                                   │   │
│  │                                                                        │   │
│  │  ┌────────────────────────────────────────────────────────────────┐  │   │
│  │  │                    RULE PROCESSOR                               │  │   │
│  │  │                                                                  │  │   │
│  │  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐   │  │   │
│  │  │  │ Time-    │  │ Demand-  │  │ Inventory│  │ Competitor   │   │  │   │
│  │  │  │ Based    │  │ Based    │  │ Based    │  │ Response     │   │  │   │
│  │  │  └────┬─────┘  └────┬─────┘  └────┬─────┘  └──────┬───────┘   │  │   │
│  │  │       │             │             │               │           │  │   │
│  │  │       └─────────────┼─────────────┼───────────────┘           │  │   │
│  │  │                     ▼             ▼                           │  │   │
│  │  │  ┌────────────────────────────────────────────────────────┐   │  │   │
│  │  │  │              PRICE CALCULATOR                           │   │  │   │
│  │  │  │  ┌─────────────────────────────────────────────────┐   │   │  │   │
│  │  │  │  │ Base Price → Rules → Constraints → Final Price  │   │   │  │   │
│  │  │  │  └─────────────────────────────────────────────────┘   │   │  │   │
│  │  │  └────────────────────────────────────────────────────────┘   │  │   │
│  │  └────────────────────────────────────────────────────────────────┘  │   │
│  │                                                                        │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────────┐  │   │
│  │  │  A/B Test   │  │  Price      │  │   Approval                  │  │   │
│  │  │  Engine     │  │  Validator  │  │   Workflow                  │  │   │
│  │  └─────────────┘  └─────────────┘  └─────────────────────────────┘  │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                    │                                         │
│                                    ▼                                         │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                      PRICE DISTRIBUTION                               │   │
│  │                                                                        │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌────────────┐  │   │
│  │  │   Product   │  │   Search    │  │   Cart &    │  │   Feed     │  │   │
│  │  │   Pages     │  │   Results   │  │   Checkout  │  │   Export   │  │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └────────────┘  │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                    │                                         │
│                                    ▼                                         │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                      ANALYTICS & MONITORING                           │   │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────────┐ │   │
│  │  │   Price    │  │   Revenue  │  │  Conversion│  │   Margin       │ │   │
│  │  │   History  │  │   Impact   │  │   Rate     │  │   Tracking     │ │   │
│  │  └────────────┘  └────────────┘  └────────────┘  └────────────────┘ │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Implementation

### Core Types and Interfaces

```typescript
// types/pricing.ts
export interface Price {
  productId: string;
  variantId?: string;
  basePrice: number;
  currentPrice: number;
  currency: string;
  compareAtPrice?: number;
  costPrice?: number;
  minPrice?: number;
  maxPrice?: number;
  appliedRules: AppliedRule[];
  validFrom: Date;
  validUntil?: Date;
  updatedAt: Date;
}

export interface AppliedRule {
  ruleId: string;
  ruleName: string;
  type: PriceRuleType;
  adjustment: number;
  adjustmentType: 'percentage' | 'fixed' | 'set';
  priority: number;
}

export type PriceRuleType =
  | 'time_based'
  | 'demand_based'
  | 'inventory_based'
  | 'competitor_based'
  | 'customer_segment'
  | 'volume_discount'
  | 'bundle'
  | 'promotional'
  | 'clearance';

export interface PriceRule {
  id: string;
  name: string;
  description?: string;
  type: PriceRuleType;
  priority: number;
  conditions: RuleCondition[];
  adjustment: PriceAdjustment;
  constraints: PriceConstraints;
  schedule?: RuleSchedule;
  targeting?: RuleTargeting;
  status: 'active' | 'inactive' | 'scheduled' | 'expired';
  createdAt: Date;
  updatedAt: Date;
}

export interface RuleCondition {
  field: string;
  operator: ConditionOperator;
  value: string | number | boolean | string[];
}

export type ConditionOperator =
  | 'equals'
  | 'not_equals'
  | 'greater_than'
  | 'less_than'
  | 'in'
  | 'not_in'
  | 'contains'
  | 'between';

export interface PriceAdjustment {
  type: 'percentage' | 'fixed' | 'set' | 'formula';
  value: number;
  formula?: string;
  roundingRule?: 'none' | 'floor' | 'ceil' | 'round' | 'psychological';
}

export interface PriceConstraints {
  minPrice?: number;
  maxPrice?: number;
  minMargin?: number;
  maxDiscount?: number;
  requireApproval?: boolean;
  approvalThreshold?: number;
}

export interface RuleSchedule {
  startDate: Date;
  endDate?: Date;
  recurring?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    daysOfWeek?: number[];
    hoursOfDay?: number[];
  };
  timezone: string;
}

export interface RuleTargeting {
  productIds?: string[];
  categoryIds?: string[];
  brandIds?: string[];
  customerSegments?: string[];
  regions?: string[];
  channels?: string[];
}

export interface CompetitorPrice {
  id: string;
  productId: string;
  competitorId: string;
  competitorName: string;
  price: number;
  currency: string;
  url?: string;
  inStock: boolean;
  shippingCost?: number;
  totalPrice: number;
  scrapedAt: Date;
  validUntil: Date;
}

export interface PriceTest {
  id: string;
  name: string;
  description?: string;
  productIds: string[];
  variants: PriceTestVariant[];
  trafficAllocation: TrafficAllocation[];
  metrics: TestMetrics;
  status: 'draft' | 'running' | 'paused' | 'completed' | 'cancelled';
  startDate: Date;
  endDate?: Date;
  targetSampleSize?: number;
  confidenceLevel: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface PriceTestVariant {
  id: string;
  name: string;
  priceModifier: PriceAdjustment;
  isControl: boolean;
}

export interface TrafficAllocation {
  variantId: string;
  percentage: number;
}

export interface TestMetrics {
  impressions: Record<string, number>;
  conversions: Record<string, number>;
  revenue: Record<string, number>;
  averageOrderValue: Record<string, number>;
}

export interface PriceChangeEvent {
  id: string;
  productId: string;
  variantId?: string;
  previousPrice: number;
  newPrice: number;
  changeReason: string;
  ruleId?: string;
  approvedBy?: string;
  timestamp: Date;
}
```

### Price Rules Engine

```typescript
// lib/pricing/rules-engine.ts
import { db } from '@/lib/database';
import { redis } from '@/lib/redis';
import { eventEmitter } from '@/lib/events';
import { generateId } from '@/lib/utils';

export class PriceRulesEngine {
  private readonly CACHE_TTL = 300; // 5 minutes

  /**
   * Calculate price for a product applying all applicable rules
   */
  async calculatePrice(
    productId: string,
    variantId?: string,
    context?: PricingContext
  ): Promise<Price> {
    // Get base price
    const basePrice = await this.getBasePrice(productId, variantId);

    if (!basePrice) {
      throw new Error('Product not found');
    }

    // Get applicable rules
    const rules = await this.getApplicableRules(productId, variantId, context);

    // Sort by priority
    const sortedRules = rules.sort((a, b) => b.priority - a.priority);

    // Apply rules
    let currentPrice = basePrice.amount;
    const appliedRules: AppliedRule[] = [];

    for (const rule of sortedRules) {
      const adjustment = this.calculateAdjustment(rule, currentPrice, basePrice.amount);

      if (adjustment !== 0) {
        currentPrice += adjustment;
        appliedRules.push({
          ruleId: rule.id,
          ruleName: rule.name,
          type: rule.type,
          adjustment,
          adjustmentType: rule.adjustment.type,
          priority: rule.priority,
        });
      }

      // Apply constraints
      currentPrice = this.applyConstraints(currentPrice, rule.constraints, basePrice);
    }

    // Apply global constraints
    currentPrice = this.applyGlobalConstraints(currentPrice, basePrice);

    // Round price
    currentPrice = this.roundPrice(currentPrice);

    const price: Price = {
      productId,
      variantId,
      basePrice: basePrice.amount,
      currentPrice,
      currency: basePrice.currency,
      compareAtPrice: currentPrice < basePrice.amount ? basePrice.amount : undefined,
      costPrice: basePrice.costPrice,
      minPrice: basePrice.minPrice,
      maxPrice: basePrice.maxPrice,
      appliedRules,
      validFrom: new Date(),
      validUntil: this.calculateValidUntil(sortedRules),
      updatedAt: new Date(),
    };

    // Cache the calculated price
    await this.cachePrice(price);

    return price;
  }

  /**
   * Create a new price rule
   */
  async createRule(rule: Omit<PriceRule, 'id' | 'createdAt' | 'updatedAt'>): Promise<PriceRule> {
    const ruleId = generateId('rule');
    const now = new Date();

    const newRule: PriceRule = {
      id: ruleId,
      ...rule,
      createdAt: now,
      updatedAt: now,
    };

    await db.query(`
      INSERT INTO price_rules (
        id, name, description, type, priority, conditions, adjustment,
        constraints, schedule, targeting, status, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
    `, [
      newRule.id,
      newRule.name,
      newRule.description,
      newRule.type,
      newRule.priority,
      JSON.stringify(newRule.conditions),
      JSON.stringify(newRule.adjustment),
      JSON.stringify(newRule.constraints),
      JSON.stringify(newRule.schedule),
      JSON.stringify(newRule.targeting),
      newRule.status,
      newRule.createdAt,
      newRule.updatedAt,
    ]);

    // Invalidate price cache for affected products
    await this.invalidateAffectedPrices(newRule);

    return newRule;
  }

  /**
   * Update an existing rule
   */
  async updateRule(ruleId: string, updates: Partial<PriceRule>): Promise<PriceRule> {
    const existing = await this.getRule(ruleId);
    if (!existing) {
      throw new Error('Rule not found');
    }

    const updated = { ...existing, ...updates, updatedAt: new Date() };

    await db.query(`
      UPDATE price_rules
      SET name = $1, description = $2, type = $3, priority = $4,
          conditions = $5, adjustment = $6, constraints = $7,
          schedule = $8, targeting = $9, status = $10, updated_at = $11
      WHERE id = $12
    `, [
      updated.name,
      updated.description,
      updated.type,
      updated.priority,
      JSON.stringify(updated.conditions),
      JSON.stringify(updated.adjustment),
      JSON.stringify(updated.constraints),
      JSON.stringify(updated.schedule),
      JSON.stringify(updated.targeting),
      updated.status,
      updated.updatedAt,
      ruleId,
    ]);

    // Invalidate affected prices
    await this.invalidateAffectedPrices(existing);
    await this.invalidateAffectedPrices(updated);

    return updated;
  }

  private async getApplicableRules(
    productId: string,
    variantId: string | undefined,
    context?: PricingContext
  ): Promise<PriceRule[]> {
    const cacheKey = `rules:applicable:${productId}:${variantId || 'base'}`;
    const cached = await redis.get(cacheKey);

    if (cached) {
      const rules = JSON.parse(cached);
      return this.filterByContext(rules, context);
    }

    // Get product details
    const product = await this.getProductDetails(productId);

    // Query active rules
    const result = await db.query(`
      SELECT * FROM price_rules
      WHERE status = 'active'
        AND (
          targeting IS NULL
          OR targeting->'productIds' ? $1
          OR targeting->'categoryIds' ? $2
          OR targeting->'brandIds' ? $3
          OR (
            targeting->'productIds' IS NULL
            AND targeting->'categoryIds' IS NULL
            AND targeting->'brandIds' IS NULL
          )
        )
      ORDER BY priority DESC
    `, [productId, product.categoryId, product.brandId]);

    const rules = result.rows.map(this.mapRuleRow);

    // Cache for 5 minutes
    await redis.setex(cacheKey, this.CACHE_TTL, JSON.stringify(rules));

    return this.filterByContext(rules, context);
  }

  private filterByContext(rules: PriceRule[], context?: PricingContext): PriceRule[] {
    if (!context) return rules;

    const now = new Date();

    return rules.filter((rule) => {
      // Check schedule
      if (rule.schedule) {
        if (rule.schedule.startDate > now) return false;
        if (rule.schedule.endDate && rule.schedule.endDate < now) return false;

        // Check recurring schedule
        if (rule.schedule.recurring) {
          const dayOfWeek = now.getDay();
          const hour = now.getHours();

          if (rule.schedule.recurring.daysOfWeek &&
              !rule.schedule.recurring.daysOfWeek.includes(dayOfWeek)) {
            return false;
          }

          if (rule.schedule.recurring.hoursOfDay &&
              !rule.schedule.recurring.hoursOfDay.includes(hour)) {
            return false;
          }
        }
      }

      // Check targeting
      if (rule.targeting) {
        if (rule.targeting.customerSegments &&
            context.customerSegment &&
            !rule.targeting.customerSegments.includes(context.customerSegment)) {
          return false;
        }

        if (rule.targeting.regions &&
            context.region &&
            !rule.targeting.regions.includes(context.region)) {
          return false;
        }

        if (rule.targeting.channels &&
            context.channel &&
            !rule.targeting.channels.includes(context.channel)) {
          return false;
        }
      }

      // Check conditions
      return this.evaluateConditions(rule.conditions, context);
    });
  }

  private evaluateConditions(
    conditions: RuleCondition[],
    context: PricingContext
  ): boolean {
    for (const condition of conditions) {
      const fieldValue = this.getContextValue(condition.field, context);

      switch (condition.operator) {
        case 'equals':
          if (fieldValue !== condition.value) return false;
          break;
        case 'not_equals':
          if (fieldValue === condition.value) return false;
          break;
        case 'greater_than':
          if (typeof fieldValue !== 'number' || fieldValue <= condition.value) return false;
          break;
        case 'less_than':
          if (typeof fieldValue !== 'number' || fieldValue >= condition.value) return false;
          break;
        case 'in':
          if (!Array.isArray(condition.value) || !condition.value.includes(fieldValue)) return false;
          break;
        case 'not_in':
          if (Array.isArray(condition.value) && condition.value.includes(fieldValue)) return false;
          break;
        case 'between':
          if (typeof fieldValue !== 'number' ||
              !Array.isArray(condition.value) ||
              fieldValue < condition.value[0] ||
              fieldValue > condition.value[1]) return false;
          break;
      }
    }

    return true;
  }

  private getContextValue(field: string, context: PricingContext): unknown {
    const fieldMap: Record<string, unknown> = {
      'inventory.level': context.inventoryLevel,
      'inventory.days_of_supply': context.daysOfSupply,
      'demand.score': context.demandScore,
      'demand.velocity': context.demandVelocity,
      'customer.segment': context.customerSegment,
      'customer.lifetime_value': context.customerLifetimeValue,
      'order.quantity': context.orderQuantity,
      'time.hour': new Date().getHours(),
      'time.day_of_week': new Date().getDay(),
      'time.day_of_month': new Date().getDate(),
    };

    return fieldMap[field];
  }

  private calculateAdjustment(
    rule: PriceRule,
    currentPrice: number,
    basePrice: number
  ): number {
    const { type, value, formula } = rule.adjustment;

    switch (type) {
      case 'percentage':
        return currentPrice * (value / 100);
      case 'fixed':
        return value;
      case 'set':
        return value - currentPrice;
      case 'formula':
        return this.evaluateFormula(formula!, { currentPrice, basePrice });
      default:
        return 0;
    }
  }

  private evaluateFormula(
    formula: string,
    variables: Record<string, number>
  ): number {
    // Safe formula evaluation
    // In production, use a proper expression parser
    let expression = formula;
    for (const [key, value] of Object.entries(variables)) {
      expression = expression.replace(new RegExp(`\\$${key}`, 'g'), value.toString());
    }

    try {
      // Only allow basic math operations
      if (!/^[\d\s+\-*/().]+$/.test(expression)) {
        throw new Error('Invalid formula');
      }
      return Function(`'use strict'; return (${expression})`)();
    } catch {
      return 0;
    }
  }

  private applyConstraints(
    price: number,
    constraints: PriceConstraints,
    basePrice: { amount: number; costPrice?: number }
  ): number {
    let constrainedPrice = price;

    // Min price
    if (constraints.minPrice !== undefined) {
      constrainedPrice = Math.max(constrainedPrice, constraints.minPrice);
    }

    // Max price
    if (constraints.maxPrice !== undefined) {
      constrainedPrice = Math.min(constrainedPrice, constraints.maxPrice);
    }

    // Min margin
    if (constraints.minMargin !== undefined && basePrice.costPrice) {
      const minPriceForMargin = basePrice.costPrice * (1 + constraints.minMargin / 100);
      constrainedPrice = Math.max(constrainedPrice, minPriceForMargin);
    }

    // Max discount
    if (constraints.maxDiscount !== undefined) {
      const maxDiscountPrice = basePrice.amount * (1 - constraints.maxDiscount / 100);
      constrainedPrice = Math.max(constrainedPrice, maxDiscountPrice);
    }

    return constrainedPrice;
  }

  private applyGlobalConstraints(price: number, basePrice: any): number {
    // Never go below cost
    if (basePrice.costPrice && price < basePrice.costPrice) {
      price = basePrice.costPrice;
    }

    // Never go below min price
    if (basePrice.minPrice && price < basePrice.minPrice) {
      price = basePrice.minPrice;
    }

    // Never exceed max price
    if (basePrice.maxPrice && price > basePrice.maxPrice) {
      price = basePrice.maxPrice;
    }

    return price;
  }

  private roundPrice(price: number): number {
    // Psychological pricing: end in .99 or .95
    const roundedDown = Math.floor(price);
    const decimal = price - roundedDown;

    if (decimal < 0.5) {
      return roundedDown - 0.01; // .99
    } else if (decimal < 0.75) {
      return roundedDown + 0.49; // .49
    } else {
      return roundedDown + 0.99; // .99
    }
  }

  private calculateValidUntil(rules: PriceRule[]): Date | undefined {
    let earliest: Date | undefined;

    for (const rule of rules) {
      if (rule.schedule?.endDate) {
        if (!earliest || rule.schedule.endDate < earliest) {
          earliest = rule.schedule.endDate;
        }
      }
    }

    return earliest;
  }

  private async getBasePrice(
    productId: string,
    variantId?: string
  ): Promise<{ amount: number; currency: string; costPrice?: number; minPrice?: number; maxPrice?: number } | null> {
    const result = await db.query(`
      SELECT
        COALESCE(pv.price, p.price) as amount,
        p.currency,
        COALESCE(pv.cost_price, p.cost_price) as cost_price,
        p.min_price,
        p.max_price
      FROM products p
      LEFT JOIN product_variants pv ON pv.product_id = p.id AND pv.id = $2
      WHERE p.id = $1
    `, [productId, variantId]);

    return result.rows[0] || null;
  }

  private async getProductDetails(productId: string): Promise<any> {
    const result = await db.query(
      'SELECT category_id, brand_id FROM products WHERE id = $1',
      [productId]
    );
    return result.rows[0];
  }

  private async getRule(ruleId: string): Promise<PriceRule | null> {
    const result = await db.query(
      'SELECT * FROM price_rules WHERE id = $1',
      [ruleId]
    );
    return result.rows[0] ? this.mapRuleRow(result.rows[0]) : null;
  }

  private mapRuleRow(row: any): PriceRule {
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      type: row.type,
      priority: row.priority,
      conditions: row.conditions,
      adjustment: row.adjustment,
      constraints: row.constraints,
      schedule: row.schedule,
      targeting: row.targeting,
      status: row.status,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  private async cachePrice(price: Price): Promise<void> {
    const cacheKey = `price:${price.productId}:${price.variantId || 'base'}`;
    const ttl = price.validUntil
      ? Math.floor((price.validUntil.getTime() - Date.now()) / 1000)
      : this.CACHE_TTL;

    if (ttl > 0) {
      await redis.setex(cacheKey, ttl, JSON.stringify(price));
    }
  }

  private async invalidateAffectedPrices(rule: PriceRule): Promise<void> {
    if (rule.targeting?.productIds) {
      for (const productId of rule.targeting.productIds) {
        await redis.del(`price:${productId}:*`);
        await redis.del(`rules:applicable:${productId}:*`);
      }
    } else {
      // Broad invalidation for rules without specific targeting
      const keys = await redis.keys('price:*');
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    }
  }
}

interface PricingContext {
  customerSegment?: string;
  customerLifetimeValue?: number;
  region?: string;
  channel?: string;
  inventoryLevel?: number;
  daysOfSupply?: number;
  demandScore?: number;
  demandVelocity?: number;
  orderQuantity?: number;
}
```

### Time-Based Pricing Service

```typescript
// lib/pricing/time-based-pricing.ts
import { db } from '@/lib/database';
import { redis } from '@/lib/redis';
import { PriceRulesEngine } from './rules-engine';
import { eventEmitter } from '@/lib/events';
import { generateId } from '@/lib/utils';

interface FlashSale {
  id: string;
  name: string;
  productIds: string[];
  discount: PriceAdjustment;
  startTime: Date;
  endTime: Date;
  maxQuantity?: number;
  quantitySold: number;
  status: 'scheduled' | 'active' | 'ended' | 'cancelled';
}

interface ScheduledPrice {
  id: string;
  productId: string;
  variantId?: string;
  price: number;
  startDate: Date;
  endDate?: Date;
  recurring?: {
    frequency: 'daily' | 'weekly';
    startTime: string;
    endTime: string;
    daysOfWeek?: number[];
  };
  status: 'scheduled' | 'active' | 'ended';
}

export class TimeBasedPricingService {
  private rulesEngine: PriceRulesEngine;

  constructor() {
    this.rulesEngine = new PriceRulesEngine();
  }

  /**
   * Create a flash sale
   */
  async createFlashSale(sale: Omit<FlashSale, 'id' | 'quantitySold' | 'status'>): Promise<FlashSale> {
    const saleId = generateId('flash');

    const flashSale: FlashSale = {
      id: saleId,
      ...sale,
      quantitySold: 0,
      status: sale.startTime > new Date() ? 'scheduled' : 'active',
    };

    await db.query(`
      INSERT INTO flash_sales (
        id, name, product_ids, discount, start_time, end_time,
        max_quantity, quantity_sold, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `, [
      flashSale.id,
      flashSale.name,
      JSON.stringify(flashSale.productIds),
      JSON.stringify(flashSale.discount),
      flashSale.startTime,
      flashSale.endTime,
      flashSale.maxQuantity,
      flashSale.quantitySold,
      flashSale.status,
    ]);

    // Create corresponding price rules
    await this.createFlashSaleRule(flashSale);

    // Schedule activation if needed
    if (flashSale.status === 'scheduled') {
      await this.scheduleFlashSaleActivation(flashSale);
    }

    return flashSale;
  }

  /**
   * Get active flash sales for a product
   */
  async getActiveFlashSales(productId: string): Promise<FlashSale[]> {
    const now = new Date();

    const result = await db.query(`
      SELECT * FROM flash_sales
      WHERE status = 'active'
        AND $1 = ANY(product_ids::text[])
        AND start_time <= $2
        AND end_time > $2
        AND (max_quantity IS NULL OR quantity_sold < max_quantity)
    `, [productId, now]);

    return result.rows;
  }

  /**
   * Record flash sale purchase
   */
  async recordFlashSalePurchase(
    flashSaleId: string,
    quantity: number
  ): Promise<boolean> {
    const result = await db.query(`
      UPDATE flash_sales
      SET quantity_sold = quantity_sold + $1
      WHERE id = $2
        AND status = 'active'
        AND (max_quantity IS NULL OR quantity_sold + $1 <= max_quantity)
      RETURNING *
    `, [quantity, flashSaleId]);

    if (result.rows.length === 0) {
      return false;
    }

    const sale = result.rows[0];

    // Check if sale is sold out
    if (sale.max_quantity && sale.quantity_sold >= sale.max_quantity) {
      await this.endFlashSale(flashSaleId, 'sold_out');
    }

    return true;
  }

  /**
   * Create scheduled price change
   */
  async createScheduledPrice(
    schedule: Omit<ScheduledPrice, 'id' | 'status'>
  ): Promise<ScheduledPrice> {
    const scheduleId = generateId('sched');

    const scheduledPrice: ScheduledPrice = {
      id: scheduleId,
      ...schedule,
      status: schedule.startDate > new Date() ? 'scheduled' : 'active',
    };

    await db.query(`
      INSERT INTO scheduled_prices (
        id, product_id, variant_id, price, start_date, end_date, recurring, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `, [
      scheduledPrice.id,
      scheduledPrice.productId,
      scheduledPrice.variantId,
      scheduledPrice.price,
      scheduledPrice.startDate,
      scheduledPrice.endDate,
      JSON.stringify(scheduledPrice.recurring),
      scheduledPrice.status,
    ]);

    // Schedule activation
    if (scheduledPrice.status === 'scheduled') {
      await this.scheduleActivation(scheduledPrice);
    }

    return scheduledPrice;
  }

  /**
   * Get current scheduled price for a product
   */
  async getCurrentScheduledPrice(
    productId: string,
    variantId?: string
  ): Promise<ScheduledPrice | null> {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const currentTime = now.toTimeString().slice(0, 5);

    const result = await db.query(`
      SELECT * FROM scheduled_prices
      WHERE product_id = $1
        AND ($2::text IS NULL OR variant_id = $2)
        AND status = 'active'
        AND start_date <= $3
        AND (end_date IS NULL OR end_date > $3)
      ORDER BY start_date DESC
      LIMIT 1
    `, [productId, variantId, now]);

    if (result.rows.length === 0) {
      return null;
    }

    const schedule = result.rows[0];

    // Check recurring schedule
    if (schedule.recurring) {
      const { daysOfWeek, startTime, endTime } = schedule.recurring;

      // Check day of week
      if (daysOfWeek && !daysOfWeek.includes(dayOfWeek)) {
        return null;
      }

      // Check time of day
      if (currentTime < startTime || currentTime >= endTime) {
        return null;
      }
    }

    return schedule;
  }

  /**
   * Process scheduled price activations
   */
  async processScheduledPrices(): Promise<number> {
    const now = new Date();
    let processed = 0;

    // Activate scheduled prices
    const toActivate = await db.query(`
      UPDATE scheduled_prices
      SET status = 'active'
      WHERE status = 'scheduled'
        AND start_date <= $1
      RETURNING *
    `, [now]);

    for (const schedule of toActivate.rows) {
      await this.applyScheduledPrice(schedule);
      processed++;
    }

    // End expired prices
    const toEnd = await db.query(`
      UPDATE scheduled_prices
      SET status = 'ended'
      WHERE status = 'active'
        AND end_date IS NOT NULL
        AND end_date <= $1
      RETURNING *
    `, [now]);

    for (const schedule of toEnd.rows) {
      await this.revertScheduledPrice(schedule);
      processed++;
    }

    return processed;
  }

  private async createFlashSaleRule(sale: FlashSale): Promise<void> {
    await this.rulesEngine.createRule({
      name: `Flash Sale: ${sale.name}`,
      type: 'promotional',
      priority: 100, // High priority
      conditions: [],
      adjustment: sale.discount,
      constraints: {
        maxDiscount: 90, // Never more than 90% off
      },
      schedule: {
        startDate: sale.startTime,
        endDate: sale.endTime,
        timezone: 'UTC',
      },
      targeting: {
        productIds: sale.productIds,
      },
      status: sale.status === 'scheduled' ? 'scheduled' : 'active',
    });
  }

  private async scheduleFlashSaleActivation(sale: FlashSale): Promise<void> {
    const delay = sale.startTime.getTime() - Date.now();
    if (delay > 0) {
      // Queue for activation
      await redis.zadd(
        'flash_sale:scheduled',
        sale.startTime.getTime(),
        sale.id
      );
    }
  }

  private async endFlashSale(saleId: string, reason: string): Promise<void> {
    await db.query(
      'UPDATE flash_sales SET status = $1 WHERE id = $2',
      ['ended', saleId]
    );

    await eventEmitter.emit('flash_sale:ended', { saleId, reason });
  }

  private async scheduleActivation(schedule: ScheduledPrice): Promise<void> {
    const delay = schedule.startDate.getTime() - Date.now();
    if (delay > 0) {
      await redis.zadd(
        'scheduled_price:pending',
        schedule.startDate.getTime(),
        schedule.id
      );
    }
  }

  private async applyScheduledPrice(schedule: ScheduledPrice): Promise<void> {
    // Record price change
    await eventEmitter.emit('price:scheduled_change', {
      productId: schedule.productId,
      variantId: schedule.variantId,
      newPrice: schedule.price,
      scheduleId: schedule.id,
    });

    // Invalidate price cache
    await redis.del(`price:${schedule.productId}:${schedule.variantId || 'base'}`);
  }

  private async revertScheduledPrice(schedule: ScheduledPrice): Promise<void> {
    await eventEmitter.emit('price:schedule_ended', {
      productId: schedule.productId,
      variantId: schedule.variantId,
      scheduleId: schedule.id,
    });

    await redis.del(`price:${schedule.productId}:${schedule.variantId || 'base'}`);
  }
}
```

### Demand-Based Pricing Service

```typescript
// lib/pricing/demand-based-pricing.ts
import { db } from '@/lib/database';
import { redis } from '@/lib/redis';
import { ForecastingEngine } from '@/lib/inventory/forecasting-engine';
import { PriceRulesEngine } from './rules-engine';

interface DemandSignal {
  productId: string;
  variantId?: string;
  viewCount: number;
  addToCartRate: number;
  purchaseVelocity: number;
  searchVolume: number;
  inventoryLevel: number;
  daysOfSupply: number;
  timestamp: Date;
}

interface DemandPriceAdjustment {
  productId: string;
  variantId?: string;
  currentDemandScore: number;
  recommendedAdjustment: number;
  adjustmentType: 'increase' | 'decrease' | 'none';
  confidence: number;
  factors: DemandFactor[];
}

interface DemandFactor {
  name: string;
  value: number;
  impact: number;
  direction: 'positive' | 'negative';
}

export class DemandBasedPricingService {
  private forecastingEngine: ForecastingEngine;
  private rulesEngine: PriceRulesEngine;

  // Configurable thresholds
  private readonly HIGH_DEMAND_THRESHOLD = 0.75;
  private readonly LOW_DEMAND_THRESHOLD = 0.25;
  private readonly MAX_INCREASE_PERCENT = 15;
  private readonly MAX_DECREASE_PERCENT = 25;

  constructor() {
    this.forecastingEngine = new ForecastingEngine();
    this.rulesEngine = new PriceRulesEngine();
  }

  /**
   * Calculate demand score for a product
   */
  async calculateDemandScore(
    productId: string,
    variantId?: string
  ): Promise<DemandSignal> {
    const cacheKey = `demand:score:${productId}:${variantId || 'base'}`;
    const cached = await redis.get(cacheKey);

    if (cached) {
      const parsed = JSON.parse(cached);
      return { ...parsed, timestamp: new Date(parsed.timestamp) };
    }

    // Get various demand signals
    const [viewCount, addToCartRate, purchaseVelocity, searchVolume] = await Promise.all([
      this.getRecentViewCount(productId, variantId),
      this.getAddToCartRate(productId, variantId),
      this.getPurchaseVelocity(productId, variantId),
      this.getSearchVolume(productId),
    ]);

    // Get inventory signals
    const inventory = await this.getInventoryStatus(productId, variantId);

    const signal: DemandSignal = {
      productId,
      variantId,
      viewCount,
      addToCartRate,
      purchaseVelocity,
      searchVolume,
      inventoryLevel: inventory.level,
      daysOfSupply: inventory.daysOfSupply,
      timestamp: new Date(),
    };

    // Cache for 15 minutes
    await redis.setex(cacheKey, 900, JSON.stringify(signal));

    return signal;
  }

  /**
   * Get price adjustment recommendation based on demand
   */
  async getRecommendedAdjustment(
    productId: string,
    variantId?: string
  ): Promise<DemandPriceAdjustment> {
    const demandSignal = await this.calculateDemandScore(productId, variantId);
    const forecast = await this.forecastingEngine.generateForecast(productId, variantId);

    // Calculate composite demand score (0-1)
    const demandScore = this.calculateCompositeScore(demandSignal);

    // Determine adjustment
    const factors: DemandFactor[] = [];
    let adjustmentPercent = 0;

    // High demand signals
    if (demandScore > this.HIGH_DEMAND_THRESHOLD) {
      // Check inventory constraints
      if (demandSignal.daysOfSupply < 7) {
        adjustmentPercent += Math.min(
          (this.HIGH_DEMAND_THRESHOLD - demandScore) * -this.MAX_INCREASE_PERCENT * 2,
          this.MAX_INCREASE_PERCENT
        );
        factors.push({
          name: 'Low inventory with high demand',
          value: demandSignal.daysOfSupply,
          impact: adjustmentPercent,
          direction: 'positive',
        });
      }

      // Add to cart rate above average
      if (demandSignal.addToCartRate > 0.1) {
        const addToCartBoost = (demandSignal.addToCartRate - 0.1) * 50;
        adjustmentPercent += Math.min(addToCartBoost, 5);
        factors.push({
          name: 'High add-to-cart rate',
          value: demandSignal.addToCartRate,
          impact: Math.min(addToCartBoost, 5),
          direction: 'positive',
        });
      }
    }

    // Low demand signals
    if (demandScore < this.LOW_DEMAND_THRESHOLD) {
      // High inventory
      if (demandSignal.daysOfSupply > 60) {
        adjustmentPercent -= Math.min(
          (this.LOW_DEMAND_THRESHOLD - demandScore) * this.MAX_DECREASE_PERCENT * 2,
          this.MAX_DECREASE_PERCENT
        );
        factors.push({
          name: 'High inventory with low demand',
          value: demandSignal.daysOfSupply,
          impact: adjustmentPercent,
          direction: 'negative',
        });
      }

      // Declining purchase velocity
      if (demandSignal.purchaseVelocity < 0.5) {
        const velocityDiscount = (0.5 - demandSignal.purchaseVelocity) * 20;
        adjustmentPercent -= Math.min(velocityDiscount, 10);
        factors.push({
          name: 'Low purchase velocity',
          value: demandSignal.purchaseVelocity,
          impact: -Math.min(velocityDiscount, 10),
          direction: 'negative',
        });
      }
    }

    // Calculate confidence based on data quality
    const confidence = this.calculateConfidence(demandSignal, forecast);

    return {
      productId,
      variantId,
      currentDemandScore: demandScore,
      recommendedAdjustment: adjustmentPercent,
      adjustmentType: adjustmentPercent > 0 ? 'increase' :
                      adjustmentPercent < 0 ? 'decrease' : 'none',
      confidence,
      factors,
    };
  }

  /**
   * Apply demand-based pricing rule
   */
  async applyDemandBasedPricing(
    productId: string,
    variantId?: string,
    autoApproveThreshold: number = 0.8
  ): Promise<{ applied: boolean; requiresApproval: boolean; adjustment: DemandPriceAdjustment }> {
    const adjustment = await this.getRecommendedAdjustment(productId, variantId);

    if (adjustment.adjustmentType === 'none') {
      return { applied: false, requiresApproval: false, adjustment };
    }

    // Check if auto-approval is allowed
    const requiresApproval =
      adjustment.confidence < autoApproveThreshold ||
      Math.abs(adjustment.recommendedAdjustment) > 10;

    if (!requiresApproval) {
      // Create temporary price rule
      await this.rulesEngine.createRule({
        name: `Demand-based: ${productId}`,
        type: 'demand_based',
        priority: 50,
        conditions: [],
        adjustment: {
          type: 'percentage',
          value: adjustment.recommendedAdjustment,
        },
        constraints: {
          minMargin: 10,
          maxDiscount: this.MAX_DECREASE_PERCENT,
        },
        schedule: {
          startDate: new Date(),
          endDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
          timezone: 'UTC',
        },
        targeting: {
          productIds: [productId],
        },
        status: 'active',
      });

      return { applied: true, requiresApproval: false, adjustment };
    }

    // Queue for approval
    await this.queueForApproval(productId, variantId, adjustment);

    return { applied: false, requiresApproval: true, adjustment };
  }

  private calculateCompositeScore(signal: DemandSignal): number {
    // Normalize each metric to 0-1 scale
    const viewScore = Math.min(signal.viewCount / 1000, 1);
    const cartScore = Math.min(signal.addToCartRate * 10, 1);
    const velocityScore = Math.min(signal.purchaseVelocity, 1);
    const searchScore = Math.min(signal.searchVolume / 500, 1);

    // Weighted average
    const weights = {
      view: 0.15,
      cart: 0.35,
      velocity: 0.35,
      search: 0.15,
    };

    return (
      viewScore * weights.view +
      cartScore * weights.cart +
      velocityScore * weights.velocity +
      searchScore * weights.search
    );
  }

  private calculateConfidence(signal: DemandSignal, forecast: any): number {
    // More data points = higher confidence
    const dataConfidence = Math.min(signal.viewCount / 100, 1);

    // Forecast confidence
    const forecastConfidence = forecast.confidence;

    // Recency confidence
    const ageHours = (Date.now() - signal.timestamp.getTime()) / (1000 * 60 * 60);
    const recencyConfidence = Math.max(0, 1 - ageHours / 24);

    return (dataConfidence * 0.4 + forecastConfidence * 0.4 + recencyConfidence * 0.2);
  }

  private async getRecentViewCount(productId: string, variantId?: string): Promise<number> {
    const result = await db.query(`
      SELECT COUNT(*) as count
      FROM product_views
      WHERE product_id = $1
        AND ($2::text IS NULL OR variant_id = $2)
        AND viewed_at > NOW() - INTERVAL '24 hours'
    `, [productId, variantId]);

    return parseInt(result.rows[0].count, 10);
  }

  private async getAddToCartRate(productId: string, variantId?: string): Promise<number> {
    const result = await db.query(`
      SELECT
        COUNT(CASE WHEN event_type = 'add_to_cart' THEN 1 END)::float /
        NULLIF(COUNT(CASE WHEN event_type = 'view' THEN 1 END), 0)::float as rate
      FROM user_interactions
      WHERE product_id = $1
        AND ($2::text IS NULL OR variant_id = $2)
        AND created_at > NOW() - INTERVAL '7 days'
    `, [productId, variantId]);

    return parseFloat(result.rows[0].rate || '0');
  }

  private async getPurchaseVelocity(productId: string, variantId?: string): Promise<number> {
    // Calculate purchases per day relative to 30-day average
    const result = await db.query(`
      WITH daily_sales AS (
        SELECT
          DATE(o.created_at) as date,
          SUM(oi.quantity) as quantity
        FROM order_items oi
        JOIN orders o ON oi.order_id = o.id
        WHERE oi.product_id = $1
          AND ($2::text IS NULL OR oi.variant_id = $2)
          AND o.status = 'completed'
          AND o.created_at > NOW() - INTERVAL '30 days'
        GROUP BY DATE(o.created_at)
      )
      SELECT
        COALESCE(
          (SELECT quantity FROM daily_sales WHERE date = CURRENT_DATE - 1) /
          NULLIF(AVG(quantity), 0),
          0
        ) as velocity
      FROM daily_sales
    `, [productId, variantId]);

    return parseFloat(result.rows[0].velocity || '0');
  }

  private async getSearchVolume(productId: string): Promise<number> {
    const result = await db.query(`
      SELECT COUNT(*) as count
      FROM search_logs
      WHERE result_product_ids @> $1::jsonb
        AND searched_at > NOW() - INTERVAL '24 hours'
    `, [JSON.stringify([productId])]);

    return parseInt(result.rows[0].count, 10);
  }

  private async getInventoryStatus(
    productId: string,
    variantId?: string
  ): Promise<{ level: number; daysOfSupply: number }> {
    const result = await db.query(`
      SELECT
        SUM((quantities->>'available')::int) as level
      FROM inventory_items
      WHERE product_id = $1
        AND ($2::text IS NULL OR variant_id = $2)
        AND status = 'active'
    `, [productId, variantId]);

    const level = parseInt(result.rows[0]?.level || '0', 10);

    // Calculate days of supply
    const avgDailySales = await this.getAverageDailySales(productId, variantId);
    const daysOfSupply = avgDailySales > 0 ? level / avgDailySales : 999;

    return { level, daysOfSupply };
  }

  private async getAverageDailySales(productId: string, variantId?: string): Promise<number> {
    const result = await db.query(`
      SELECT
        COALESCE(SUM(oi.quantity)::float / 30, 0) as avg_daily
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      WHERE oi.product_id = $1
        AND ($2::text IS NULL OR oi.variant_id = $2)
        AND o.status = 'completed'
        AND o.created_at > NOW() - INTERVAL '30 days'
    `, [productId, variantId]);

    return parseFloat(result.rows[0].avg_daily || '0');
  }

  private async queueForApproval(
    productId: string,
    variantId: string | undefined,
    adjustment: DemandPriceAdjustment
  ): Promise<void> {
    await db.query(`
      INSERT INTO price_approval_queue (
        product_id, variant_id, adjustment_type, adjustment_percent,
        demand_score, confidence, factors, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
    `, [
      productId,
      variantId,
      adjustment.adjustmentType,
      adjustment.recommendedAdjustment,
      adjustment.currentDemandScore,
      adjustment.confidence,
      JSON.stringify(adjustment.factors),
    ]);
  }
}
```

### Competitor Price Monitoring

```typescript
// lib/pricing/competitor-monitoring.ts
import { db } from '@/lib/database';
import { redis } from '@/lib/redis';
import { eventEmitter } from '@/lib/events';
import { generateId } from '@/lib/utils';

interface CompetitorConfig {
  id: string;
  name: string;
  domain: string;
  scrapeEnabled: boolean;
  scrapeFrequency: number; // hours
  priceSelector?: string;
  productMappings: ProductMapping[];
}

interface ProductMapping {
  productId: string;
  competitorUrl: string;
  competitorSku?: string;
}

interface PriceComparisonResult {
  productId: string;
  ourPrice: number;
  competitors: Array<{
    competitorId: string;
    competitorName: string;
    price: number;
    difference: number;
    differencePercent: number;
    inStock: boolean;
    lastUpdated: Date;
  }>;
  marketPosition: 'lowest' | 'competitive' | 'above_market' | 'highest';
  recommendedAction?: string;
}

export class CompetitorMonitoringService {
  /**
   * Get competitor prices for a product
   */
  async getCompetitorPrices(productId: string): Promise<CompetitorPrice[]> {
    const cacheKey = `competitor:prices:${productId}`;
    const cached = await redis.get(cacheKey);

    if (cached) {
      return JSON.parse(cached);
    }

    const result = await db.query(`
      SELECT * FROM competitor_prices
      WHERE product_id = $1
        AND valid_until > NOW()
      ORDER BY price ASC
    `, [productId]);

    const prices = result.rows;

    // Cache for 1 hour
    await redis.setex(cacheKey, 3600, JSON.stringify(prices));

    return prices;
  }

  /**
   * Compare our price with competitors
   */
  async comparePrice(
    productId: string,
    variantId?: string
  ): Promise<PriceComparisonResult> {
    // Get our current price
    const ourPrice = await this.getOurPrice(productId, variantId);

    // Get competitor prices
    const competitorPrices = await this.getCompetitorPrices(productId);

    const competitors = competitorPrices.map((cp) => ({
      competitorId: cp.competitorId,
      competitorName: cp.competitorName,
      price: cp.totalPrice,
      difference: ourPrice - cp.totalPrice,
      differencePercent: ((ourPrice - cp.totalPrice) / cp.totalPrice) * 100,
      inStock: cp.inStock,
      lastUpdated: cp.scrapedAt,
    }));

    // Determine market position
    const marketPosition = this.determineMarketPosition(ourPrice, competitorPrices);

    // Generate recommendation
    const recommendedAction = this.generateRecommendation(
      ourPrice,
      competitorPrices,
      marketPosition
    );

    return {
      productId,
      ourPrice,
      competitors,
      marketPosition,
      recommendedAction,
    };
  }

  /**
   * Create automatic price response rule
   */
  async createCompetitorResponseRule(
    productId: string,
    config: {
      targetPosition: 'match' | 'beat' | 'near';
      beatByPercent?: number;
      beatByAmount?: number;
      maxDiscount: number;
      minMargin: number;
      excludeCompetitors?: string[];
    }
  ): Promise<void> {
    const ruleId = generateId('comp_rule');

    await db.query(`
      INSERT INTO competitor_response_rules (
        id, product_id, target_position, beat_by_percent, beat_by_amount,
        max_discount, min_margin, exclude_competitors, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'active')
    `, [
      ruleId,
      productId,
      config.targetPosition,
      config.beatByPercent,
      config.beatByAmount,
      config.maxDiscount,
      config.minMargin,
      JSON.stringify(config.excludeCompetitors || []),
    ]);
  }

  /**
   * Process competitor price update
   */
  async processCompetitorPriceUpdate(
    productId: string,
    competitorId: string,
    newPrice: number
  ): Promise<void> {
    // Get response rule
    const rule = await this.getCompetitorResponseRule(productId);

    if (!rule) return;

    // Check if this competitor is excluded
    if (rule.excludeCompetitors?.includes(competitorId)) return;

    // Get our current price and cost
    const ourProduct = await this.getProductPricing(productId);

    // Calculate target price
    let targetPrice: number;

    switch (rule.targetPosition) {
      case 'beat':
        targetPrice = rule.beatByPercent
          ? newPrice * (1 - rule.beatByPercent / 100)
          : newPrice - (rule.beatByAmount || 0.01);
        break;
      case 'match':
        targetPrice = newPrice;
        break;
      case 'near':
        // Within 5% of competitor
        targetPrice = newPrice * 1.02;
        break;
      default:
        return;
    }

    // Apply constraints
    const minAllowedPrice = ourProduct.costPrice * (1 + rule.minMargin / 100);
    const maxAllowedDiscount = ourProduct.basePrice * (1 - rule.maxDiscount / 100);

    targetPrice = Math.max(targetPrice, minAllowedPrice, maxAllowedDiscount);

    // Only adjust if meaningful change
    if (Math.abs(targetPrice - ourProduct.currentPrice) < 0.01) return;

    // Apply price change
    await this.applyCompetitorResponse(productId, targetPrice, competitorId, newPrice);
  }

  /**
   * Scrape competitor prices
   */
  async scrapeCompetitorPrice(mapping: ProductMapping): Promise<CompetitorPrice | null> {
    // In production, this would use a headless browser or API
    // Placeholder implementation
    try {
      // const response = await fetch(mapping.competitorUrl);
      // const html = await response.text();
      // Parse price from HTML using configured selector

      return null;
    } catch (error) {
      console.error(`Failed to scrape ${mapping.competitorUrl}:`, error);
      return null;
    }
  }

  /**
   * Update competitor price in database
   */
  async updateCompetitorPrice(
    productId: string,
    competitorId: string,
    price: number,
    inStock: boolean,
    shippingCost?: number
  ): Promise<void> {
    const priceId = generateId('comp_price');

    await db.query(`
      INSERT INTO competitor_prices (
        id, product_id, competitor_id, price, in_stock,
        shipping_cost, total_price, scraped_at, valid_until
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW() + INTERVAL '24 hours')
      ON CONFLICT (product_id, competitor_id)
      DO UPDATE SET
        price = $4,
        in_stock = $5,
        shipping_cost = $6,
        total_price = $7,
        scraped_at = NOW(),
        valid_until = NOW() + INTERVAL '24 hours'
    `, [
      priceId,
      productId,
      competitorId,
      price,
      inStock,
      shippingCost || 0,
      price + (shippingCost || 0),
    ]);

    // Invalidate cache
    await redis.del(`competitor:prices:${productId}`);

    // Emit event for processing
    await eventEmitter.emit('competitor:price_updated', {
      productId,
      competitorId,
      newPrice: price + (shippingCost || 0),
    });
  }

  private async getOurPrice(productId: string, variantId?: string): Promise<number> {
    const result = await db.query(`
      SELECT COALESCE(pv.price, p.price) as price
      FROM products p
      LEFT JOIN product_variants pv ON pv.product_id = p.id AND pv.id = $2
      WHERE p.id = $1
    `, [productId, variantId]);

    return parseFloat(result.rows[0]?.price || '0');
  }

  private determineMarketPosition(
    ourPrice: number,
    competitorPrices: CompetitorPrice[]
  ): PriceComparisonResult['marketPosition'] {
    if (competitorPrices.length === 0) return 'competitive';

    const inStockPrices = competitorPrices
      .filter((cp) => cp.inStock)
      .map((cp) => cp.totalPrice)
      .sort((a, b) => a - b);

    if (inStockPrices.length === 0) return 'competitive';

    const lowestPrice = inStockPrices[0];
    const highestPrice = inStockPrices[inStockPrices.length - 1];
    const avgPrice = inStockPrices.reduce((a, b) => a + b, 0) / inStockPrices.length;

    if (ourPrice <= lowestPrice) return 'lowest';
    if (ourPrice >= highestPrice) return 'highest';
    if (ourPrice <= avgPrice * 1.05) return 'competitive';
    return 'above_market';
  }

  private generateRecommendation(
    ourPrice: number,
    competitorPrices: CompetitorPrice[],
    position: PriceComparisonResult['marketPosition']
  ): string | undefined {
    switch (position) {
      case 'highest':
        const lowest = competitorPrices
          .filter((cp) => cp.inStock)
          .sort((a, b) => a.totalPrice - b.totalPrice)[0];
        if (lowest) {
          const reduction = ((ourPrice - lowest.totalPrice) / ourPrice * 100).toFixed(1);
          return `Consider reducing price by ${reduction}% to match market`;
        }
        break;
      case 'above_market':
        return 'Price is above market average. Monitor conversion rate.';
      case 'lowest':
        return 'Price is competitive. Consider if margin is adequate.';
    }

    return undefined;
  }

  private async getCompetitorResponseRule(productId: string): Promise<any> {
    const result = await db.query(`
      SELECT * FROM competitor_response_rules
      WHERE product_id = $1 AND status = 'active'
    `, [productId]);

    return result.rows[0];
  }

  private async getProductPricing(productId: string): Promise<any> {
    const result = await db.query(`
      SELECT price as base_price, cost_price, current_price
      FROM products
      WHERE id = $1
    `, [productId]);

    return result.rows[0];
  }

  private async applyCompetitorResponse(
    productId: string,
    targetPrice: number,
    competitorId: string,
    competitorPrice: number
  ): Promise<void> {
    // Record price change
    await db.query(`
      INSERT INTO price_changes (
        id, product_id, previous_price, new_price, change_reason,
        competitor_id, competitor_price, timestamp
      )
      SELECT
        $1, $2, current_price, $3, 'competitor_response', $4, $5, NOW()
      FROM products
      WHERE id = $2
    `, [generateId('change'), productId, targetPrice, competitorId, competitorPrice]);

    // Update product price
    await db.query(`
      UPDATE products
      SET current_price = $1, updated_at = NOW()
      WHERE id = $2
    `, [targetPrice, productId]);

    // Invalidate caches
    await redis.del(`price:${productId}:*`);

    await eventEmitter.emit('price:competitor_response_applied', {
      productId,
      newPrice: targetPrice,
      competitorId,
      competitorPrice,
    });
  }
}
```

### A/B Price Testing Service

```typescript
// lib/pricing/ab-testing.ts
import { db } from '@/lib/database';
import { redis } from '@/lib/redis';
import { generateId } from '@/lib/utils';

interface TestAssignment {
  testId: string;
  variantId: string;
  userId?: string;
  sessionId: string;
  assignedAt: Date;
}

export class PriceABTestingService {
  /**
   * Create a new price test
   */
  async createTest(test: Omit<PriceTest, 'id' | 'metrics' | 'createdAt' | 'updatedAt'>): Promise<PriceTest> {
    const testId = generateId('test');
    const now = new Date();

    // Validate traffic allocation
    const totalAllocation = test.trafficAllocation.reduce((sum, a) => sum + a.percentage, 0);
    if (Math.abs(totalAllocation - 100) > 0.01) {
      throw new Error('Traffic allocation must sum to 100%');
    }

    const priceTest: PriceTest = {
      id: testId,
      ...test,
      metrics: {
        impressions: {},
        conversions: {},
        revenue: {},
        averageOrderValue: {},
      },
      createdAt: now,
      updatedAt: now,
    };

    // Initialize metrics for each variant
    for (const variant of test.variants) {
      priceTest.metrics.impressions[variant.id] = 0;
      priceTest.metrics.conversions[variant.id] = 0;
      priceTest.metrics.revenue[variant.id] = 0;
      priceTest.metrics.averageOrderValue[variant.id] = 0;
    }

    await db.query(`
      INSERT INTO price_tests (
        id, name, description, product_ids, variants, traffic_allocation,
        metrics, status, start_date, end_date, target_sample_size,
        confidence_level, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
    `, [
      priceTest.id,
      priceTest.name,
      priceTest.description,
      JSON.stringify(priceTest.productIds),
      JSON.stringify(priceTest.variants),
      JSON.stringify(priceTest.trafficAllocation),
      JSON.stringify(priceTest.metrics),
      priceTest.status,
      priceTest.startDate,
      priceTest.endDate,
      priceTest.targetSampleSize,
      priceTest.confidenceLevel,
      priceTest.createdAt,
      priceTest.updatedAt,
    ]);

    return priceTest;
  }

  /**
   * Get variant assignment for a user/session
   */
  async getVariantAssignment(
    testId: string,
    sessionId: string,
    userId?: string
  ): Promise<PriceTestVariant> {
    // Check for existing assignment
    const existingKey = `test:assignment:${testId}:${userId || sessionId}`;
    const existing = await redis.get(existingKey);

    if (existing) {
      const test = await this.getTest(testId);
      return test!.variants.find((v) => v.id === existing)!;
    }

    // Get test
    const test = await this.getTest(testId);
    if (!test || test.status !== 'running') {
      throw new Error('Test not active');
    }

    // Assign variant based on traffic allocation
    const variant = this.assignVariant(test);

    // Store assignment
    const assignment: TestAssignment = {
      testId,
      variantId: variant.id,
      userId,
      sessionId,
      assignedAt: new Date(),
    };

    await this.storeAssignment(assignment);
    await redis.set(existingKey, variant.id);

    return variant;
  }

  /**
   * Record impression for a test variant
   */
  async recordImpression(
    testId: string,
    variantId: string,
    sessionId: string
  ): Promise<void> {
    // Dedupe by session
    const dedupeKey = `test:impression:${testId}:${variantId}:${sessionId}`;
    const exists = await redis.get(dedupeKey);

    if (exists) return;

    await redis.setex(dedupeKey, 86400, '1'); // 24 hour dedupe

    await db.query(`
      UPDATE price_tests
      SET metrics = jsonb_set(
        metrics,
        '{impressions, ${variantId}}',
        (COALESCE((metrics->'impressions'->'${variantId}')::int, 0) + 1)::text::jsonb
      ),
      updated_at = NOW()
      WHERE id = $1
    `, [testId]);
  }

  /**
   * Record conversion for a test variant
   */
  async recordConversion(
    testId: string,
    variantId: string,
    revenue: number
  ): Promise<void> {
    await db.query(`
      UPDATE price_tests
      SET
        metrics = jsonb_set(
          jsonb_set(
            metrics,
            '{conversions, ${variantId}}',
            (COALESCE((metrics->'conversions'->'${variantId}')::int, 0) + 1)::text::jsonb
          ),
          '{revenue, ${variantId}}',
          (COALESCE((metrics->'revenue'->'${variantId}')::float, 0) + $2)::text::jsonb
        ),
        updated_at = NOW()
      WHERE id = $1
    `, [testId, revenue]);
  }

  /**
   * Get test results with statistical analysis
   */
  async getTestResults(testId: string): Promise<{
    test: PriceTest;
    analysis: TestAnalysis;
    recommendation?: string;
  }> {
    const test = await this.getTest(testId);
    if (!test) {
      throw new Error('Test not found');
    }

    const analysis = this.analyzeTest(test);
    const recommendation = this.generateRecommendation(test, analysis);

    return { test, analysis, recommendation };
  }

  /**
   * End a test and optionally apply winner
   */
  async endTest(
    testId: string,
    applyWinner: boolean = false
  ): Promise<void> {
    const test = await this.getTest(testId);
    if (!test) {
      throw new Error('Test not found');
    }

    await db.query(`
      UPDATE price_tests
      SET status = 'completed', end_date = NOW(), updated_at = NOW()
      WHERE id = $1
    `, [testId]);

    if (applyWinner) {
      const results = await this.getTestResults(testId);
      const winner = results.analysis.winner;

      if (winner && !winner.isControl) {
        await this.applyTestWinner(test, winner);
      }
    }
  }

  private assignVariant(test: PriceTest): PriceTestVariant {
    const random = Math.random() * 100;
    let cumulative = 0;

    for (const allocation of test.trafficAllocation) {
      cumulative += allocation.percentage;
      if (random <= cumulative) {
        return test.variants.find((v) => v.id === allocation.variantId)!;
      }
    }

    // Fallback to first variant
    return test.variants[0];
  }

  private async storeAssignment(assignment: TestAssignment): Promise<void> {
    await db.query(`
      INSERT INTO test_assignments (
        test_id, variant_id, user_id, session_id, assigned_at
      ) VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (test_id, COALESCE(user_id, session_id))
      DO NOTHING
    `, [
      assignment.testId,
      assignment.variantId,
      assignment.userId,
      assignment.sessionId,
      assignment.assignedAt,
    ]);
  }

  private async getTest(testId: string): Promise<PriceTest | null> {
    const result = await db.query(
      'SELECT * FROM price_tests WHERE id = $1',
      [testId]
    );

    return result.rows[0] || null;
  }

  private analyzeTest(test: PriceTest): TestAnalysis {
    const variantResults: VariantResult[] = [];

    for (const variant of test.variants) {
      const impressions = test.metrics.impressions[variant.id] || 0;
      const conversions = test.metrics.conversions[variant.id] || 0;
      const revenue = test.metrics.revenue[variant.id] || 0;

      const conversionRate = impressions > 0 ? conversions / impressions : 0;
      const revenuePerImpression = impressions > 0 ? revenue / impressions : 0;
      const avgOrderValue = conversions > 0 ? revenue / conversions : 0;

      variantResults.push({
        variantId: variant.id,
        variantName: variant.name,
        isControl: variant.isControl,
        impressions,
        conversions,
        revenue,
        conversionRate,
        revenuePerImpression,
        averageOrderValue: avgOrderValue,
      });
    }

    // Find control
    const control = variantResults.find((v) => v.isControl);

    // Calculate statistical significance
    for (const result of variantResults) {
      if (control && !result.isControl) {
        result.uplift = control.conversionRate > 0
          ? (result.conversionRate - control.conversionRate) / control.conversionRate
          : 0;

        result.pValue = this.calculatePValue(
          control.impressions,
          control.conversions,
          result.impressions,
          result.conversions
        );

        result.isSignificant = result.pValue < (1 - test.confidenceLevel);
      }
    }

    // Determine winner
    const significantResults = variantResults.filter(
      (v) => v.isSignificant && (v.uplift || 0) > 0
    );

    const winner = significantResults.length > 0
      ? significantResults.reduce((best, current) =>
          (current.revenuePerImpression > best.revenuePerImpression) ? current : best
        )
      : undefined;

    const hasEnoughData = variantResults.every(
      (v) => v.impressions >= (test.targetSampleSize || 1000) / test.variants.length
    );

    return {
      variants: variantResults,
      winner,
      hasEnoughData,
      testDuration: Math.floor(
        (Date.now() - test.startDate.getTime()) / (1000 * 60 * 60 * 24)
      ),
    };
  }

  private calculatePValue(
    controlN: number,
    controlX: number,
    treatmentN: number,
    treatmentX: number
  ): number {
    // Two-proportion z-test
    if (controlN === 0 || treatmentN === 0) return 1;

    const p1 = controlX / controlN;
    const p2 = treatmentX / treatmentN;
    const pooledP = (controlX + treatmentX) / (controlN + treatmentN);

    const se = Math.sqrt(pooledP * (1 - pooledP) * (1 / controlN + 1 / treatmentN));

    if (se === 0) return 1;

    const z = Math.abs(p2 - p1) / se;

    // Approximate p-value from z-score
    return 2 * (1 - this.normalCDF(z));
  }

  private normalCDF(z: number): number {
    // Approximation of normal CDF
    const a1 = 0.254829592;
    const a2 = -0.284496736;
    const a3 = 1.421413741;
    const a4 = -1.453152027;
    const a5 = 1.061405429;
    const p = 0.3275911;

    const sign = z < 0 ? -1 : 1;
    z = Math.abs(z) / Math.sqrt(2);

    const t = 1.0 / (1.0 + p * z);
    const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-z * z);

    return 0.5 * (1.0 + sign * y);
  }

  private generateRecommendation(test: PriceTest, analysis: TestAnalysis): string | undefined {
    if (!analysis.hasEnoughData) {
      return `Continue test. Need ${((test.targetSampleSize || 1000) / test.variants.length) - Math.min(...analysis.variants.map(v => v.impressions))} more impressions per variant.`;
    }

    if (analysis.winner) {
      const upliftPercent = ((analysis.winner.uplift || 0) * 100).toFixed(1);
      return `Winner: ${analysis.winner.variantName} with ${upliftPercent}% uplift in conversion rate. Consider applying this pricing.`;
    }

    return 'No statistically significant winner. Consider extending the test or testing different price points.';
  }

  private async applyTestWinner(test: PriceTest, winner: VariantResult): Promise<void> {
    const winningVariant = test.variants.find((v) => v.id === winner.variantId);
    if (!winningVariant) return;

    // Apply winner's price modifier to all test products
    for (const productId of test.productIds) {
      // Create permanent price rule based on winner
      await db.query(`
        INSERT INTO price_rules (
          id, name, type, priority, conditions, adjustment, constraints,
          targeting, status, created_at, updated_at
        ) VALUES (
          $1, $2, 'promotional', 30, '[]', $3, '{}',
          $4, 'active', NOW(), NOW()
        )
      `, [
        generateId('rule'),
        `Test Winner: ${test.name}`,
        JSON.stringify(winningVariant.priceModifier),
        JSON.stringify({ productIds: [productId] }),
      ]);
    }
  }
}

interface TestAnalysis {
  variants: VariantResult[];
  winner?: VariantResult;
  hasEnoughData: boolean;
  testDuration: number;
}

interface VariantResult {
  variantId: string;
  variantName: string;
  isControl: boolean;
  impressions: number;
  conversions: number;
  revenue: number;
  conversionRate: number;
  revenuePerImpression: number;
  averageOrderValue: number;
  uplift?: number;
  pValue?: number;
  isSignificant?: boolean;
}
```

### Pricing API Routes

```typescript
// app/api/pricing/[productId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PriceRulesEngine } from '@/lib/pricing/rules-engine';
import { PriceABTestingService } from '@/lib/pricing/ab-testing';
import { cookies } from 'next/headers';

export async function GET(
  request: NextRequest,
  { params }: { params: { productId: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const variantId = searchParams.get('variantId') || undefined;

    const rulesEngine = new PriceRulesEngine();
    const abTestService = new PriceABTestingService();

    // Get session/user for A/B test assignment
    const cookieStore = cookies();
    const sessionId = cookieStore.get('session_id')?.value || 'anonymous';

    // Check for active A/B test
    const activeTest = await getActiveTest(params.productId);

    let price: Price;

    if (activeTest) {
      // Get test variant assignment
      const variant = await abTestService.getVariantAssignment(
        activeTest.id,
        sessionId
      );

      // Record impression
      await abTestService.recordImpression(activeTest.id, variant.id, sessionId);

      // Calculate price with test modifier
      price = await rulesEngine.calculatePrice(
        params.productId,
        variantId,
        { testVariant: variant }
      );
    } else {
      price = await rulesEngine.calculatePrice(params.productId, variantId);
    }

    return NextResponse.json({
      productId: params.productId,
      variantId,
      price: price.currentPrice,
      compareAtPrice: price.compareAtPrice,
      currency: price.currency,
      appliedRules: price.appliedRules.map((r) => ({
        name: r.ruleName,
        type: r.type,
      })),
    });
  } catch (error) {
    console.error('Pricing error:', error);
    return NextResponse.json(
      { error: 'Failed to calculate price' },
      { status: 500 }
    );
  }
}

async function getActiveTest(productId: string): Promise<PriceTest | null> {
  // Implementation to find active test for product
  return null;
}
```

## Examples

### Flash Sale Setup

```typescript
// Example: Create a flash sale
const timeBasedService = new TimeBasedPricingService();

const flashSale = await timeBasedService.createFlashSale({
  name: 'Summer Clearance',
  productIds: ['prod-1', 'prod-2', 'prod-3'],
  discount: {
    type: 'percentage',
    value: -30, // 30% off
  },
  startTime: new Date('2025-01-20T00:00:00Z'),
  endTime: new Date('2025-01-21T00:00:00Z'),
  maxQuantity: 1000,
});

console.log(`Flash sale ${flashSale.id} created`);
```

### Price Test Configuration

```typescript
// Example: Set up an A/B price test
const abTestService = new PriceABTestingService();

const test = await abTestService.createTest({
  name: 'Premium Product Pricing',
  productIds: ['premium-widget'],
  variants: [
    {
      id: 'control',
      name: 'Current Price',
      priceModifier: { type: 'percentage', value: 0 },
      isControl: true,
    },
    {
      id: 'higher',
      name: '10% Higher',
      priceModifier: { type: 'percentage', value: 10 },
      isControl: false,
    },
    {
      id: 'lower',
      name: '10% Lower',
      priceModifier: { type: 'percentage', value: -10 },
      isControl: false,
    },
  ],
  trafficAllocation: [
    { variantId: 'control', percentage: 40 },
    { variantId: 'higher', percentage: 30 },
    { variantId: 'lower', percentage: 30 },
  ],
  status: 'running',
  startDate: new Date(),
  targetSampleSize: 10000,
  confidenceLevel: 0.95,
});
```

## Anti-Patterns

### What to Avoid

```typescript
// BAD: Changing prices without tracking
async function updatePrice(productId: string, newPrice: number) {
  await db.query('UPDATE products SET price = $1 WHERE id = $2', [newPrice, productId]);
  // No record of change, no way to analyze impact
}

// BAD: No constraints on automatic pricing
async function applyDemandPricing(productId: string, demandScore: number) {
  const adjustment = demandScore * 100; // Could be huge!
  const newPrice = basePrice * (1 + adjustment / 100);
  await updatePrice(productId, newPrice);
}

// BAD: Exposing pricing logic client-side
function calculateClientPrice(basePrice: number, discountCode: string) {
  // Discount logic visible and exploitable
  if (discountCode === 'SECRET50') {
    return basePrice * 0.5;
  }
  return basePrice;
}

// BAD: No A/B test isolation
async function getPrice(productId: string, userId: string) {
  // User gets different prices on refresh
  const variant = Math.random() > 0.5 ? 'high' : 'low';
  return variant === 'high' ? basePrice * 1.1 : basePrice;
}
```

### Correct Patterns

```typescript
// GOOD: Full audit trail for price changes
async function updatePrice(productId: string, newPrice: number, reason: string) {
  await db.transaction(async (tx) => {
    const current = await tx.query('SELECT price FROM products WHERE id = $1', [productId]);

    await tx.query(`
      INSERT INTO price_changes (product_id, previous_price, new_price, reason, timestamp)
      VALUES ($1, $2, $3, $4, NOW())
    `, [productId, current.rows[0].price, newPrice, reason]);

    await tx.query('UPDATE products SET price = $1 WHERE id = $2', [newPrice, productId]);
  });
}

// GOOD: Bounded automatic pricing
async function applyDemandPricing(productId: string, demandScore: number) {
  const MAX_INCREASE = 0.15; // 15% max
  const MAX_DECREASE = 0.25; // 25% max

  const adjustment = Math.max(-MAX_DECREASE, Math.min(MAX_INCREASE, demandScore * 0.2));

  const product = await getProduct(productId);
  const newPrice = product.basePrice * (1 + adjustment);

  // Ensure margin
  const minPrice = product.costPrice * 1.1;
  const finalPrice = Math.max(newPrice, minPrice);

  await updatePrice(productId, finalPrice, 'demand_based');
}

// GOOD: Server-side pricing only
async function getPrice(productId: string) {
  const price = await rulesEngine.calculatePrice(productId);
  return { price: price.currentPrice }; // No logic exposed
}

// GOOD: Consistent A/B test assignment
async function getPrice(productId: string, sessionId: string) {
  // Check for existing assignment
  const assignment = await redis.get(`test:${productId}:${sessionId}`);

  if (assignment) {
    return getVariantPrice(productId, assignment);
  }

  // Deterministic assignment based on hash
  const variant = hashAssignment(productId, sessionId);
  await redis.set(`test:${productId}:${sessionId}`, variant);

  return getVariantPrice(productId, variant);
}
```

## Testing

### Unit Tests

```typescript
// __tests__/pricing/rules-engine.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PriceRulesEngine } from '@/lib/pricing/rules-engine';

describe('PriceRulesEngine', () => {
  let engine: PriceRulesEngine;

  beforeEach(() => {
    engine = new PriceRulesEngine();
    vi.clearAllMocks();
  });

  describe('calculatePrice', () => {
    it('returns base price when no rules apply', async () => {
      const price = await engine.calculatePrice('prod-no-rules');

      expect(price.currentPrice).toBe(price.basePrice);
      expect(price.appliedRules).toHaveLength(0);
    });

    it('applies percentage discount rule', async () => {
      // Mock rule: 20% off
      const price = await engine.calculatePrice('prod-with-discount');

      expect(price.currentPrice).toBe(price.basePrice * 0.8);
      expect(price.appliedRules).toHaveLength(1);
      expect(price.appliedRules[0].type).toBe('promotional');
    });

    it('respects min margin constraint', async () => {
      // Mock: cost = 80, base = 100, discount = 30%
      // Without constraint: 70
      // With 10% min margin: 88

      const price = await engine.calculatePrice('prod-margin-constrained');

      expect(price.currentPrice).toBeGreaterThanOrEqual(88);
    });

    it('applies rules in priority order', async () => {
      const price = await engine.calculatePrice('prod-multiple-rules');

      // Verify rules applied in descending priority
      for (let i = 1; i < price.appliedRules.length; i++) {
        expect(price.appliedRules[i - 1].priority).toBeGreaterThanOrEqual(
          price.appliedRules[i].priority
        );
      }
    });
  });

  describe('rule conditions', () => {
    it('evaluates time-based conditions', async () => {
      vi.setSystemTime(new Date('2025-01-20T14:00:00Z'));

      const price = await engine.calculatePrice('prod-time-based');

      // Rule active 12:00-18:00
      expect(price.appliedRules.some((r) => r.type === 'time_based')).toBe(true);
    });

    it('evaluates inventory conditions', async () => {
      const price = await engine.calculatePrice('prod-low-inventory', undefined, {
        inventoryLevel: 5,
        daysOfSupply: 2,
      });

      expect(price.appliedRules.some((r) => r.type === 'inventory_based')).toBe(true);
    });
  });
});
```

### Integration Tests

```typescript
// __tests__/pricing/ab-testing.integration.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { PriceABTestingService } from '@/lib/pricing/ab-testing';
import { setupTestDatabase, cleanupTestDatabase } from '../helpers';

describe('PriceABTestingService Integration', () => {
  let service: PriceABTestingService;
  let testId: string;

  beforeAll(async () => {
    await setupTestDatabase();
    service = new PriceABTestingService();

    // Create test
    const test = await service.createTest({
      name: 'Integration Test',
      productIds: ['test-prod'],
      variants: [
        { id: 'control', name: 'Control', priceModifier: { type: 'percentage', value: 0 }, isControl: true },
        { id: 'treatment', name: 'Treatment', priceModifier: { type: 'percentage', value: 10 }, isControl: false },
      ],
      trafficAllocation: [
        { variantId: 'control', percentage: 50 },
        { variantId: 'treatment', percentage: 50 },
      ],
      status: 'running',
      startDate: new Date(),
      confidenceLevel: 0.95,
    });

    testId = test.id;
  });

  afterAll(async () => {
    await cleanupTestDatabase();
  });

  it('consistently assigns same variant to same session', async () => {
    const sessionId = 'test-session-123';

    const assignment1 = await service.getVariantAssignment(testId, sessionId);
    const assignment2 = await service.getVariantAssignment(testId, sessionId);

    expect(assignment1.id).toBe(assignment2.id);
  });

  it('distributes traffic according to allocation', async () => {
    const assignments = { control: 0, treatment: 0 };

    for (let i = 0; i < 1000; i++) {
      const variant = await service.getVariantAssignment(testId, `session-${i}`);
      assignments[variant.id as keyof typeof assignments]++;
    }

    // Should be roughly 50/50 with some variance
    expect(assignments.control).toBeGreaterThan(400);
    expect(assignments.control).toBeLessThan(600);
    expect(assignments.treatment).toBeGreaterThan(400);
    expect(assignments.treatment).toBeLessThan(600);
  });

  it('calculates test results correctly', async () => {
    // Simulate conversions
    for (let i = 0; i < 100; i++) {
      await service.recordImpression(testId, 'control', `ctrl-${i}`);
      if (i < 10) {
        await service.recordConversion(testId, 'control', 50);
      }
    }

    for (let i = 0; i < 100; i++) {
      await service.recordImpression(testId, 'treatment', `treat-${i}`);
      if (i < 15) {
        await service.recordConversion(testId, 'treatment', 55);
      }
    }

    const results = await service.getTestResults(testId);

    expect(results.analysis.variants).toHaveLength(2);

    const control = results.analysis.variants.find((v) => v.isControl);
    expect(control?.conversionRate).toBeCloseTo(0.1, 2);

    const treatment = results.analysis.variants.find((v) => !v.isControl);
    expect(treatment?.conversionRate).toBeCloseTo(0.15, 2);
  });
});
```

## Changelog

### v1.0.0 (2025-01-18)
- Initial pattern documentation
| 1.1.0 | 2025-01-18 | Added price rules engine |
| 1.2.0 | 2025-01-18 | Added time-based pricing |
| 1.3.0 | 2025-01-18 | Added demand-based pricing |
| 1.4.0 | 2025-01-18 | Added competitor monitoring |
| 1.5.0 | 2025-01-18 | Added A/B price testing |
| 1.6.0 | 2025-01-18 | Added comprehensive testing examples |
