---
id: pt-returns-automation
name: Returns Automation
version: 1.0.0
layer: L5
category: e-commerce
description: Automated returns processing with RMA generation, refund handling, and inventory updates
tags: [returns, rma, refunds, automation, e-commerce, next15]
composes: []
dependencies: {}
formula: Returns Automation = RMA Generation + Refund Processing + Inventory Updates + Carrier Integration
performance:
  impact: medium
  lcp: neutral
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# Returns Automation

## Overview

Automated returns management systems streamline the entire return lifecycle from customer request to refund completion. This pattern covers return request workflows, partial returns handling, restocking automation, refund processing, and dispute resolution for Next.js 15 e-commerce applications.

### Key Concepts

- **Return Request Workflows**: Self-service return initiation with eligibility checking
- **Partial Returns**: Handling returns of individual items from multi-item orders
- **Restocking Automation**: Inventory management and quality inspection workflows
- **Refund Processing**: Multi-method refund handling with proper accounting
- **Dispute Handling**: Escalation workflows and resolution management

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        RETURNS AUTOMATION SYSTEM                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                      RETURN REQUEST LAYER                             │   │
│  │                                                                        │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌────────────────────────────┐    │   │
│  │  │  Customer   │  │ Eligibility │  │   Return                   │    │   │
│  │  │  Portal     │  │   Engine    │  │   Authorization            │    │   │
│  │  └──────┬──────┘  └──────┬──────┘  └─────────────┬──────────────┘    │   │
│  │         │                │                       │                    │   │
│  │         └────────────────┼───────────────────────┘                    │   │
│  │                          ▼                                            │   │
│  │  ┌────────────────────────────────────────────────────────────────┐  │   │
│  │  │                    RETURN REQUEST QUEUE                         │  │   │
│  │  └────────────────────────────────────────────────────────────────┘  │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                    │                                         │
│                                    ▼                                         │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                      LOGISTICS LAYER                                  │   │
│  │                                                                        │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌────────────┐  │   │
│  │  │   Label     │  │  Shipping   │  │   Tracking  │  │   Drop-off │  │   │
│  │  │   Gen       │  │   Carrier   │  │   Updates   │  │   Locator  │  │   │
│  │  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └─────┬──────┘  │   │
│  │         │                │                │               │          │   │
│  │         └────────────────┼────────────────┼───────────────┘          │   │
│  │                          ▼                ▼                          │   │
│  │  ┌────────────────────────────────────────────────────────────────┐ │   │
│  │  │                    SHIPMENT TRACKING                            │ │   │
│  │  └────────────────────────────────────────────────────────────────┘ │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                    │                                         │
│                                    ▼                                         │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                      RECEIVING & INSPECTION LAYER                     │   │
│  │                                                                        │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌────────────┐  │   │
│  │  │   Package   │  │   Quality   │  │  Condition  │  │   Photo    │  │   │
│  │  │   Receipt   │  │   Check     │  │  Assessment │  │   Evidence │  │   │
│  │  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └─────┬──────┘  │   │
│  │         │                │                │               │          │   │
│  │         └────────────────┴────────────────┴───────────────┘          │   │
│  │                          │                                            │   │
│  │                          ▼                                            │   │
│  │  ┌────────────────────────────────────────────────────────────────┐  │   │
│  │  │              INSPECTION DECISION ENGINE                         │  │   │
│  │  │  ┌──────────┐     ┌──────────┐     ┌────────────────────────┐  │  │   │
│  │  │  │  Accept  │     │ Partial  │     │   Reject               │  │  │   │
│  │  │  │  Return  │     │  Credit  │     │   (Dispute)            │  │  │   │
│  │  │  └────┬─────┘     └────┬─────┘     └───────────┬────────────┘  │  │   │
│  │  └───────┼────────────────┼───────────────────────┼───────────────┘  │   │
│  └──────────┼────────────────┼───────────────────────┼──────────────────┘   │
│             │                │                       │                      │
│             ▼                ▼                       ▼                      │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                      RESTOCKING LAYER                                 │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────────┐  │   │
│  │  │  Inventory  │  │  Warehouse  │  │   Resale/Liquidation        │  │   │
│  │  │  Update     │  │  Routing    │  │   Decision                  │  │   │
│  │  └─────────────┘  └─────────────┘  └─────────────────────────────┘  │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                              │                                               │
│                              ▼                                               │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                      REFUND PROCESSING LAYER                          │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌────────────┐  │   │
│  │  │   Refund    │  │   Payment   │  │   Store     │  │   Ledger   │  │   │
│  │  │   Calc      │  │   Gateway   │  │   Credit    │  │   Entry    │  │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └────────────┘  │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Implementation

### Core Types and Interfaces

```typescript
// types/returns.ts
export interface ReturnRequest {
  id: string;
  orderId: string;
  customerId: string;
  items: ReturnItem[];
  reason: ReturnReason;
  reasonDetails?: string;
  status: ReturnStatus;
  type: ReturnType;
  refundMethod: RefundMethod;
  shippingLabel?: ShippingLabel;
  tracking?: TrackingInfo;
  inspection?: InspectionResult;
  refund?: RefundDetails;
  timeline: ReturnEvent[];
  createdAt: Date;
  updatedAt: Date;
  expiresAt: Date;
}

export interface ReturnItem {
  id: string;
  orderItemId: string;
  productId: string;
  variantId?: string;
  quantity: number;
  quantityReceived?: number;
  condition?: ItemCondition;
  unitPrice: number;
  subtotal: number;
  status: ReturnItemStatus;
}

export type ReturnReason =
  | 'defective'
  | 'wrong_item'
  | 'not_as_described'
  | 'changed_mind'
  | 'too_large'
  | 'too_small'
  | 'arrived_late'
  | 'better_price_elsewhere'
  | 'other';

export type ReturnStatus =
  | 'requested'
  | 'approved'
  | 'label_generated'
  | 'shipped'
  | 'in_transit'
  | 'delivered'
  | 'inspecting'
  | 'inspected'
  | 'processing_refund'
  | 'refunded'
  | 'completed'
  | 'rejected'
  | 'disputed'
  | 'cancelled';

export type ReturnType = 'refund' | 'exchange' | 'store_credit';

export type RefundMethod = 'original_payment' | 'store_credit' | 'bank_transfer';

export type ItemCondition =
  | 'new'
  | 'like_new'
  | 'good'
  | 'fair'
  | 'poor'
  | 'damaged'
  | 'missing_parts';

export type ReturnItemStatus =
  | 'pending'
  | 'received'
  | 'inspected'
  | 'approved'
  | 'rejected'
  | 'restocked'
  | 'disposed';

export interface ShippingLabel {
  id: string;
  carrier: string;
  trackingNumber: string;
  labelUrl: string;
  qrCodeUrl?: string;
  createdAt: Date;
  expiresAt: Date;
}

export interface TrackingInfo {
  carrier: string;
  trackingNumber: string;
  status: string;
  estimatedDelivery?: Date;
  events: TrackingEvent[];
}

export interface TrackingEvent {
  timestamp: Date;
  status: string;
  location?: string;
  description: string;
}

export interface InspectionResult {
  inspectorId: string;
  inspectedAt: Date;
  items: ItemInspection[];
  photos: InspectionPhoto[];
  notes?: string;
  decision: InspectionDecision;
}

export interface ItemInspection {
  returnItemId: string;
  condition: ItemCondition;
  issues: string[];
  restockable: boolean;
  refundPercentage: number;
}

export interface InspectionPhoto {
  id: string;
  itemId: string;
  url: string;
  type: 'overview' | 'damage' | 'serial';
}

export type InspectionDecision =
  | 'full_refund'
  | 'partial_refund'
  | 'reject'
  | 'escalate';

export interface RefundDetails {
  id: string;
  returnId: string;
  method: RefundMethod;
  originalAmount: number;
  deductions: RefundDeduction[];
  finalAmount: number;
  currency: string;
  status: RefundStatus;
  transactionId?: string;
  processedAt?: Date;
}

export interface RefundDeduction {
  type: 'restocking_fee' | 'damage' | 'missing_parts' | 'shipping';
  amount: number;
  reason: string;
}

export type RefundStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'cancelled';

export interface ReturnEvent {
  id: string;
  timestamp: Date;
  type: ReturnEventType;
  description: string;
  metadata?: Record<string, unknown>;
  actor?: { id: string; type: 'customer' | 'system' | 'staff' };
}

export type ReturnEventType =
  | 'request_created'
  | 'request_approved'
  | 'request_rejected'
  | 'label_generated'
  | 'item_shipped'
  | 'item_in_transit'
  | 'item_delivered'
  | 'inspection_started'
  | 'inspection_completed'
  | 'refund_initiated'
  | 'refund_completed'
  | 'dispute_opened'
  | 'dispute_resolved'
  | 'return_completed'
  | 'return_cancelled';

export interface ReturnPolicy {
  id: string;
  name: string;
  windowDays: number;
  conditions: PolicyCondition[];
  restockingFeePercent: number;
  freeReturnThreshold?: number;
  excludedCategories: string[];
  excludedProducts: string[];
}

export interface PolicyCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than';
  value: string | number | boolean;
}
```

### Return Eligibility Engine

```typescript
// lib/returns/eligibility-engine.ts
import { db } from '@/lib/database';
import { redis } from '@/lib/redis';

interface EligibilityResult {
  eligible: boolean;
  reason?: string;
  policy?: ReturnPolicy;
  eligibleItems: EligibleItem[];
  ineligibleItems: IneligibleItem[];
  returnWindow: { start: Date; end: Date };
  shippingCost: number;
}

interface EligibleItem {
  orderItemId: string;
  productId: string;
  maxQuantity: number;
  reasons: ReturnReason[];
  restockingFee: number;
}

interface IneligibleItem {
  orderItemId: string;
  productId: string;
  reason: string;
}

export class ReturnEligibilityEngine {
  /**
   * Check if an order is eligible for return
   */
  async checkEligibility(
    orderId: string,
    customerId: string,
    requestedItems?: Array<{ orderItemId: string; quantity: number }>
  ): Promise<EligibilityResult> {
    // Fetch order details
    const order = await this.getOrder(orderId);

    if (!order) {
      return this.createIneligibleResult('Order not found');
    }

    // Verify customer owns the order
    if (order.customerId !== customerId) {
      return this.createIneligibleResult('Order does not belong to customer');
    }

    // Check order status
    if (!['completed', 'delivered'].includes(order.status)) {
      return this.createIneligibleResult('Order must be delivered before return');
    }

    // Get applicable return policy
    const policy = await this.getApplicablePolicy(order);

    // Calculate return window
    const deliveredAt = order.deliveredAt || order.completedAt;
    const returnWindowEnd = new Date(deliveredAt);
    returnWindowEnd.setDate(returnWindowEnd.getDate() + policy.windowDays);

    if (new Date() > returnWindowEnd) {
      return this.createIneligibleResult(
        `Return window expired (${policy.windowDays} days from delivery)`
      );
    }

    // Check each item for eligibility
    const eligibleItems: EligibleItem[] = [];
    const ineligibleItems: IneligibleItem[] = [];

    const itemsToCheck = requestedItems || order.items.map((item) => ({
      orderItemId: item.id,
      quantity: item.quantity,
    }));

    for (const requestedItem of itemsToCheck) {
      const orderItem = order.items.find((i) => i.id === requestedItem.orderItemId);

      if (!orderItem) {
        ineligibleItems.push({
          orderItemId: requestedItem.orderItemId,
          productId: '',
          reason: 'Item not found in order',
        });
        continue;
      }

      const itemEligibility = await this.checkItemEligibility(
        orderItem,
        requestedItem.quantity,
        policy,
        order
      );

      if (itemEligibility.eligible) {
        eligibleItems.push(itemEligibility.item!);
      } else {
        ineligibleItems.push({
          orderItemId: orderItem.id,
          productId: orderItem.productId,
          reason: itemEligibility.reason!,
        });
      }
    }

    // Calculate shipping cost
    const shippingCost = this.calculateReturnShippingCost(
      eligibleItems,
      policy,
      order
    );

    return {
      eligible: eligibleItems.length > 0,
      reason: eligibleItems.length === 0 ? 'No eligible items' : undefined,
      policy,
      eligibleItems,
      ineligibleItems,
      returnWindow: {
        start: deliveredAt,
        end: returnWindowEnd,
      },
      shippingCost,
    };
  }

  private async checkItemEligibility(
    orderItem: any,
    quantity: number,
    policy: ReturnPolicy,
    order: any
  ): Promise<{
    eligible: boolean;
    reason?: string;
    item?: EligibleItem;
  }> {
    // Check if product is in excluded list
    if (policy.excludedProducts.includes(orderItem.productId)) {
      return { eligible: false, reason: 'Product not eligible for return' };
    }

    // Check if category is excluded
    const product = await this.getProduct(orderItem.productId);
    if (policy.excludedCategories.includes(product.categoryId)) {
      return { eligible: false, reason: 'Product category not eligible for return' };
    }

    // Check if item was already returned
    const previousReturns = await this.getPreviousReturns(
      order.id,
      orderItem.id
    );
    const alreadyReturned = previousReturns.reduce(
      (sum, r) => sum + r.quantity,
      0
    );
    const maxReturnable = orderItem.quantity - alreadyReturned;

    if (maxReturnable <= 0) {
      return { eligible: false, reason: 'Item already fully returned' };
    }

    if (quantity > maxReturnable) {
      return {
        eligible: false,
        reason: `Only ${maxReturnable} unit(s) available for return`,
      };
    }

    // Check product-specific return rules
    const productPolicy = await this.getProductReturnPolicy(orderItem.productId);
    if (productPolicy?.nonReturnable) {
      return { eligible: false, reason: productPolicy.reason || 'Item is non-returnable' };
    }

    // Determine eligible return reasons
    const eligibleReasons = this.getEligibleReasons(orderItem, product);

    // Calculate restocking fee
    const restockingFee = this.calculateRestockingFee(
      orderItem,
      policy,
      productPolicy
    );

    return {
      eligible: true,
      item: {
        orderItemId: orderItem.id,
        productId: orderItem.productId,
        maxQuantity: Math.min(quantity, maxReturnable),
        reasons: eligibleReasons,
        restockingFee,
      },
    };
  }

  private getEligibleReasons(orderItem: any, product: any): ReturnReason[] {
    const allReasons: ReturnReason[] = [
      'defective',
      'wrong_item',
      'not_as_described',
      'changed_mind',
      'arrived_late',
      'other',
    ];

    // Add size-related reasons for apparel
    if (['clothing', 'shoes'].includes(product.categoryId)) {
      allReasons.push('too_large', 'too_small');
    }

    return allReasons;
  }

  private calculateRestockingFee(
    orderItem: any,
    policy: ReturnPolicy,
    productPolicy?: any
  ): number {
    // Product-specific fee takes precedence
    if (productPolicy?.restockingFeePercent !== undefined) {
      return (orderItem.unitPrice * productPolicy.restockingFeePercent) / 100;
    }

    // Use policy default
    return (orderItem.unitPrice * policy.restockingFeePercent) / 100;
  }

  private calculateReturnShippingCost(
    items: EligibleItem[],
    policy: ReturnPolicy,
    order: any
  ): number {
    // Free returns above threshold
    if (policy.freeReturnThreshold) {
      const returnValue = items.reduce((sum, item) => {
        const orderItem = order.items.find((i: any) => i.id === item.orderItemId);
        return sum + (orderItem?.unitPrice || 0) * item.maxQuantity;
      }, 0);

      if (returnValue >= policy.freeReturnThreshold) {
        return 0;
      }
    }

    // Calculate based on weight/size
    // Simplified: flat rate for now
    return 7.99;
  }

  private createIneligibleResult(reason: string): EligibilityResult {
    return {
      eligible: false,
      reason,
      eligibleItems: [],
      ineligibleItems: [],
      returnWindow: { start: new Date(), end: new Date() },
      shippingCost: 0,
    };
  }

  private async getOrder(orderId: string): Promise<any> {
    const result = await db.query(`
      SELECT o.*, json_agg(oi.*) as items
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE o.id = $1
      GROUP BY o.id
    `, [orderId]);

    return result.rows[0];
  }

  private async getProduct(productId: string): Promise<any> {
    const result = await db.query(
      'SELECT * FROM products WHERE id = $1',
      [productId]
    );
    return result.rows[0];
  }

  private async getApplicablePolicy(order: any): Promise<ReturnPolicy> {
    // Check for order-specific policy first
    if (order.returnPolicyId) {
      const result = await db.query(
        'SELECT * FROM return_policies WHERE id = $1',
        [order.returnPolicyId]
      );
      if (result.rows[0]) return result.rows[0];
    }

    // Get default policy
    const result = await db.query(
      'SELECT * FROM return_policies WHERE is_default = true'
    );
    return result.rows[0] || this.getDefaultPolicy();
  }

  private getDefaultPolicy(): ReturnPolicy {
    return {
      id: 'default',
      name: 'Standard Return Policy',
      windowDays: 30,
      conditions: [],
      restockingFeePercent: 0,
      freeReturnThreshold: 50,
      excludedCategories: ['perishables', 'digital'],
      excludedProducts: [],
    };
  }

  private async getPreviousReturns(
    orderId: string,
    orderItemId: string
  ): Promise<Array<{ quantity: number }>> {
    const result = await db.query(`
      SELECT ri.quantity
      FROM return_items ri
      JOIN return_requests rr ON ri.return_request_id = rr.id
      WHERE rr.order_id = $1
        AND ri.order_item_id = $2
        AND rr.status NOT IN ('cancelled', 'rejected')
    `, [orderId, orderItemId]);

    return result.rows;
  }

  private async getProductReturnPolicy(productId: string): Promise<any> {
    const result = await db.query(
      'SELECT return_policy FROM products WHERE id = $1',
      [productId]
    );
    return result.rows[0]?.return_policy;
  }
}
```

### Return Request Service

```typescript
// lib/returns/return-request-service.ts
import { db } from '@/lib/database';
import { redis } from '@/lib/redis';
import { ReturnEligibilityEngine } from './eligibility-engine';
import { ShippingLabelService } from './shipping-label-service';
import { notifyCustomer, notifyWarehouse } from '@/lib/notifications';
import { generateId } from '@/lib/utils';

interface CreateReturnInput {
  orderId: string;
  items: Array<{
    orderItemId: string;
    quantity: number;
    reason: ReturnReason;
    reasonDetails?: string;
  }>;
  type: ReturnType;
  refundMethod: RefundMethod;
}

export class ReturnRequestService {
  private eligibilityEngine: ReturnEligibilityEngine;
  private labelService: ShippingLabelService;

  constructor() {
    this.eligibilityEngine = new ReturnEligibilityEngine();
    this.labelService = new ShippingLabelService();
  }

  /**
   * Create a new return request
   */
  async createReturnRequest(
    customerId: string,
    input: CreateReturnInput
  ): Promise<ReturnRequest> {
    // Validate eligibility
    const eligibility = await this.eligibilityEngine.checkEligibility(
      input.orderId,
      customerId,
      input.items.map((i) => ({ orderItemId: i.orderItemId, quantity: i.quantity }))
    );

    if (!eligibility.eligible) {
      throw new Error(eligibility.reason || 'Items not eligible for return');
    }

    // Create return request
    const returnId = generateId('ret');
    const now = new Date();
    const expiresAt = new Date(now);
    expiresAt.setDate(expiresAt.getDate() + 14); // 14 day label expiry

    const returnRequest: ReturnRequest = {
      id: returnId,
      orderId: input.orderId,
      customerId,
      items: input.items.map((item, index) => {
        const eligible = eligibility.eligibleItems.find(
          (e) => e.orderItemId === item.orderItemId
        );
        const orderItem = this.getOrderItemDetails(input.orderId, item.orderItemId);

        return {
          id: generateId('ri'),
          orderItemId: item.orderItemId,
          productId: eligible?.productId || '',
          quantity: item.quantity,
          unitPrice: orderItem?.unitPrice || 0,
          subtotal: (orderItem?.unitPrice || 0) * item.quantity,
          status: 'pending' as ReturnItemStatus,
        };
      }),
      reason: input.items[0].reason, // Primary reason
      reasonDetails: input.items[0].reasonDetails,
      status: 'requested',
      type: input.type,
      refundMethod: input.refundMethod,
      timeline: [{
        id: generateId('evt'),
        timestamp: now,
        type: 'request_created',
        description: 'Return request created',
        actor: { id: customerId, type: 'customer' },
      }],
      createdAt: now,
      updatedAt: now,
      expiresAt,
    };

    // Save to database
    await this.saveReturnRequest(returnRequest);

    // Auto-approve if eligible
    const shouldAutoApprove = await this.shouldAutoApprove(returnRequest, eligibility);
    if (shouldAutoApprove) {
      return await this.approveReturn(returnId, 'system');
    }

    // Queue for manual review if needed
    if (!shouldAutoApprove) {
      await this.queueForReview(returnRequest);
    }

    // Notify customer
    await notifyCustomer(customerId, {
      type: 'return_requested',
      returnId,
      orderId: input.orderId,
    });

    return returnRequest;
  }

  /**
   * Approve a return request and generate shipping label
   */
  async approveReturn(
    returnId: string,
    approvedBy: string
  ): Promise<ReturnRequest> {
    const returnRequest = await this.getReturnRequest(returnId);
    if (!returnRequest) {
      throw new Error('Return request not found');
    }

    if (returnRequest.status !== 'requested') {
      throw new Error(`Cannot approve return in status: ${returnRequest.status}`);
    }

    // Generate shipping label
    const label = await this.labelService.generateLabel(returnRequest);

    // Update return request
    returnRequest.status = 'label_generated';
    returnRequest.shippingLabel = label;
    returnRequest.timeline.push({
      id: generateId('evt'),
      timestamp: new Date(),
      type: 'request_approved',
      description: 'Return request approved',
      actor: { id: approvedBy, type: approvedBy === 'system' ? 'system' : 'staff' },
    });
    returnRequest.timeline.push({
      id: generateId('evt'),
      timestamp: new Date(),
      type: 'label_generated',
      description: 'Shipping label generated',
      actor: { id: 'system', type: 'system' },
    });
    returnRequest.updatedAt = new Date();

    await this.updateReturnRequest(returnRequest);

    // Notify customer with label
    await notifyCustomer(returnRequest.customerId, {
      type: 'return_approved',
      returnId,
      labelUrl: label.labelUrl,
      qrCodeUrl: label.qrCodeUrl,
      expiresAt: label.expiresAt,
    });

    return returnRequest;
  }

  /**
   * Update return status when item is shipped
   */
  async markAsShipped(
    returnId: string,
    trackingNumber: string
  ): Promise<ReturnRequest> {
    const returnRequest = await this.getReturnRequest(returnId);
    if (!returnRequest) {
      throw new Error('Return request not found');
    }

    returnRequest.status = 'shipped';
    returnRequest.tracking = {
      carrier: returnRequest.shippingLabel?.carrier || 'unknown',
      trackingNumber,
      status: 'in_transit',
      events: [{
        timestamp: new Date(),
        status: 'shipped',
        description: 'Package shipped',
      }],
    };
    returnRequest.timeline.push({
      id: generateId('evt'),
      timestamp: new Date(),
      type: 'item_shipped',
      description: 'Return package shipped',
      actor: { id: returnRequest.customerId, type: 'customer' },
    });
    returnRequest.updatedAt = new Date();

    await this.updateReturnRequest(returnRequest);

    // Notify warehouse
    await notifyWarehouse({
      type: 'return_incoming',
      returnId,
      trackingNumber,
      expectedItems: returnRequest.items,
    });

    return returnRequest;
  }

  /**
   * Record package receipt at warehouse
   */
  async recordReceipt(
    returnId: string,
    receivedItems: Array<{ returnItemId: string; quantityReceived: number }>
  ): Promise<ReturnRequest> {
    const returnRequest = await this.getReturnRequest(returnId);
    if (!returnRequest) {
      throw new Error('Return request not found');
    }

    // Update item quantities
    for (const received of receivedItems) {
      const item = returnRequest.items.find((i) => i.id === received.returnItemId);
      if (item) {
        item.quantityReceived = received.quantityReceived;
        item.status = 'received';
      }
    }

    returnRequest.status = 'inspecting';
    returnRequest.timeline.push({
      id: generateId('evt'),
      timestamp: new Date(),
      type: 'item_delivered',
      description: 'Package received at warehouse',
      actor: { id: 'system', type: 'system' },
    });
    returnRequest.timeline.push({
      id: generateId('evt'),
      timestamp: new Date(),
      type: 'inspection_started',
      description: 'Inspection started',
      actor: { id: 'system', type: 'system' },
    });
    returnRequest.updatedAt = new Date();

    await this.updateReturnRequest(returnRequest);

    return returnRequest;
  }

  private async shouldAutoApprove(
    returnRequest: ReturnRequest,
    eligibility: EligibilityResult
  ): Promise<boolean> {
    // Auto-approve for verified customers with good history
    const customerTrust = await this.getCustomerTrustScore(returnRequest.customerId);
    if (customerTrust < 0.7) {
      return false;
    }

    // Auto-approve for low-risk reasons
    const lowRiskReasons: ReturnReason[] = [
      'defective',
      'wrong_item',
      'not_as_described',
      'too_large',
      'too_small',
    ];
    if (!lowRiskReasons.includes(returnRequest.reason)) {
      return false;
    }

    // Auto-approve if total value is below threshold
    const totalValue = returnRequest.items.reduce((sum, item) => sum + item.subtotal, 0);
    if (totalValue > 500) {
      return false;
    }

    return true;
  }

  private async getCustomerTrustScore(customerId: string): Promise<number> {
    const result = await db.query(`
      SELECT
        COUNT(*) as total_returns,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as successful_returns,
        COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected_returns
      FROM return_requests
      WHERE customer_id = $1
        AND created_at > NOW() - INTERVAL '1 year'
    `, [customerId]);

    const stats = result.rows[0];
    if (stats.total_returns === 0) {
      return 0.8; // Default trust for new customers
    }

    const successRate = stats.successful_returns / stats.total_returns;
    const rejectionPenalty = stats.rejected_returns * 0.1;

    return Math.max(0, Math.min(1, successRate - rejectionPenalty));
  }

  private async queueForReview(returnRequest: ReturnRequest): Promise<void> {
    await redis.zadd(
      'returns:review_queue',
      Date.now(),
      returnRequest.id
    );
  }

  private async getOrderItemDetails(orderId: string, orderItemId: string): Promise<any> {
    const result = await db.query(`
      SELECT * FROM order_items WHERE order_id = $1 AND id = $2
    `, [orderId, orderItemId]);
    return result.rows[0];
  }

  private async saveReturnRequest(returnRequest: ReturnRequest): Promise<void> {
    await db.query(`
      INSERT INTO return_requests (
        id, order_id, customer_id, items, reason, reason_details,
        status, type, refund_method, timeline, created_at, updated_at, expires_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
    `, [
      returnRequest.id,
      returnRequest.orderId,
      returnRequest.customerId,
      JSON.stringify(returnRequest.items),
      returnRequest.reason,
      returnRequest.reasonDetails,
      returnRequest.status,
      returnRequest.type,
      returnRequest.refundMethod,
      JSON.stringify(returnRequest.timeline),
      returnRequest.createdAt,
      returnRequest.updatedAt,
      returnRequest.expiresAt,
    ]);
  }

  private async updateReturnRequest(returnRequest: ReturnRequest): Promise<void> {
    await db.query(`
      UPDATE return_requests
      SET items = $1, status = $2, shipping_label = $3, tracking = $4,
          inspection = $5, refund = $6, timeline = $7, updated_at = $8
      WHERE id = $9
    `, [
      JSON.stringify(returnRequest.items),
      returnRequest.status,
      JSON.stringify(returnRequest.shippingLabel),
      JSON.stringify(returnRequest.tracking),
      JSON.stringify(returnRequest.inspection),
      JSON.stringify(returnRequest.refund),
      JSON.stringify(returnRequest.timeline),
      returnRequest.updatedAt,
      returnRequest.id,
    ]);
  }

  async getReturnRequest(returnId: string): Promise<ReturnRequest | null> {
    const result = await db.query(
      'SELECT * FROM return_requests WHERE id = $1',
      [returnId]
    );

    if (!result.rows[0]) return null;

    return this.mapReturnRow(result.rows[0]);
  }

  private mapReturnRow(row: any): ReturnRequest {
    return {
      id: row.id,
      orderId: row.order_id,
      customerId: row.customer_id,
      items: row.items,
      reason: row.reason,
      reasonDetails: row.reason_details,
      status: row.status,
      type: row.type,
      refundMethod: row.refund_method,
      shippingLabel: row.shipping_label,
      tracking: row.tracking,
      inspection: row.inspection,
      refund: row.refund,
      timeline: row.timeline,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      expiresAt: row.expires_at,
    };
  }
}
```

### Inspection and Restocking Service

```typescript
// lib/returns/inspection-service.ts
import { db } from '@/lib/database';
import { redis } from '@/lib/redis';
import { ReturnRequestService } from './return-request-service';
import { InventoryService } from '@/lib/inventory/inventory-service';
import { generateId } from '@/lib/utils';

export class InspectionService {
  private returnService: ReturnRequestService;
  private inventoryService: InventoryService;

  constructor() {
    this.returnService = new ReturnRequestService();
    this.inventoryService = new InventoryService();
  }

  /**
   * Submit inspection results for a return
   */
  async submitInspection(
    returnId: string,
    inspectorId: string,
    inspection: {
      items: Array<{
        returnItemId: string;
        condition: ItemCondition;
        issues: string[];
        restockable: boolean;
      }>;
      photos: Array<{
        itemId: string;
        url: string;
        type: 'overview' | 'damage' | 'serial';
      }>;
      notes?: string;
    }
  ): Promise<ReturnRequest> {
    const returnRequest = await this.returnService.getReturnRequest(returnId);
    if (!returnRequest) {
      throw new Error('Return request not found');
    }

    if (returnRequest.status !== 'inspecting') {
      throw new Error(`Cannot inspect return in status: ${returnRequest.status}`);
    }

    // Calculate refund percentages based on condition
    const itemInspections: ItemInspection[] = inspection.items.map((item) => ({
      returnItemId: item.returnItemId,
      condition: item.condition,
      issues: item.issues,
      restockable: item.restockable,
      refundPercentage: this.calculateRefundPercentage(item.condition, item.issues),
    }));

    // Determine overall decision
    const decision = this.determineDecision(itemInspections);

    const inspectionResult: InspectionResult = {
      inspectorId,
      inspectedAt: new Date(),
      items: itemInspections,
      photos: inspection.photos.map((p) => ({
        id: generateId('photo'),
        ...p,
      })),
      notes: inspection.notes,
      decision,
    };

    // Update return request
    returnRequest.inspection = inspectionResult;
    returnRequest.status = 'inspected';

    // Update item statuses
    for (const itemInspection of itemInspections) {
      const item = returnRequest.items.find((i) => i.id === itemInspection.returnItemId);
      if (item) {
        item.condition = itemInspection.condition;
        item.status = itemInspection.refundPercentage > 0 ? 'approved' : 'rejected';
      }
    }

    returnRequest.timeline.push({
      id: generateId('evt'),
      timestamp: new Date(),
      type: 'inspection_completed',
      description: `Inspection completed: ${decision}`,
      actor: { id: inspectorId, type: 'staff' },
    });
    returnRequest.updatedAt = new Date();

    await this.updateReturn(returnRequest);

    // Process restocking for accepted items
    await this.processRestocking(returnRequest, itemInspections);

    return returnRequest;
  }

  /**
   * Process restocking for inspected items
   */
  private async processRestocking(
    returnRequest: ReturnRequest,
    inspections: ItemInspection[]
  ): Promise<void> {
    for (const inspection of inspections) {
      const item = returnRequest.items.find((i) => i.id === inspection.returnItemId);
      if (!item) continue;

      if (inspection.restockable && inspection.refundPercentage === 100) {
        // Full restock to primary inventory
        await this.inventoryService.adjustStock({
          productId: item.productId,
          variantId: item.variantId,
          quantity: item.quantityReceived || item.quantity,
          reason: 'return_restock',
          referenceId: returnRequest.id,
          location: 'primary',
        });

        item.status = 'restocked';
      } else if (inspection.restockable && inspection.refundPercentage >= 50) {
        // Restock to secondary/discount inventory
        await this.inventoryService.adjustStock({
          productId: item.productId,
          variantId: item.variantId,
          quantity: item.quantityReceived || item.quantity,
          reason: 'return_restock_discounted',
          referenceId: returnRequest.id,
          location: 'outlet',
          condition: inspection.condition,
        });

        item.status = 'restocked';
      } else {
        // Mark for disposal/liquidation
        await this.inventoryService.recordDisposal({
          productId: item.productId,
          variantId: item.variantId,
          quantity: item.quantityReceived || item.quantity,
          reason: 'return_rejected',
          referenceId: returnRequest.id,
          condition: inspection.condition,
        });

        item.status = 'disposed';
      }
    }

    await this.updateReturn(returnRequest);
  }

  private calculateRefundPercentage(
    condition: ItemCondition,
    issues: string[]
  ): number {
    const conditionPercentages: Record<ItemCondition, number> = {
      'new': 100,
      'like_new': 100,
      'good': 85,
      'fair': 70,
      'poor': 50,
      'damaged': 25,
      'missing_parts': 0,
    };

    let percentage = conditionPercentages[condition];

    // Additional deductions for specific issues
    if (issues.includes('missing_packaging')) percentage -= 5;
    if (issues.includes('missing_accessories')) percentage -= 15;
    if (issues.includes('signs_of_use')) percentage -= 10;
    if (issues.includes('cosmetic_damage')) percentage -= 10;

    return Math.max(0, percentage);
  }

  private determineDecision(inspections: ItemInspection[]): InspectionDecision {
    const avgRefundPercentage =
      inspections.reduce((sum, i) => sum + i.refundPercentage, 0) /
      inspections.length;

    if (avgRefundPercentage >= 95) {
      return 'full_refund';
    } else if (avgRefundPercentage >= 50) {
      return 'partial_refund';
    } else if (avgRefundPercentage > 0) {
      return 'escalate'; // Edge case, needs review
    } else {
      return 'reject';
    }
  }

  private async updateReturn(returnRequest: ReturnRequest): Promise<void> {
    await db.query(`
      UPDATE return_requests
      SET items = $1, inspection = $2, status = $3, timeline = $4, updated_at = NOW()
      WHERE id = $5
    `, [
      JSON.stringify(returnRequest.items),
      JSON.stringify(returnRequest.inspection),
      returnRequest.status,
      JSON.stringify(returnRequest.timeline),
      returnRequest.id,
    ]);
  }
}
```

### Refund Processing Service

```typescript
// lib/returns/refund-service.ts
import { db } from '@/lib/database';
import { PaymentGateway } from '@/lib/payments/gateway';
import { StoreCreditService } from '@/lib/payments/store-credit';
import { AccountingService } from '@/lib/accounting/service';
import { notifyCustomer } from '@/lib/notifications';
import { generateId } from '@/lib/utils';

export class RefundService {
  private paymentGateway: PaymentGateway;
  private storeCreditService: StoreCreditService;
  private accountingService: AccountingService;

  constructor() {
    this.paymentGateway = new PaymentGateway();
    this.storeCreditService = new StoreCreditService();
    this.accountingService = new AccountingService();
  }

  /**
   * Process refund for an inspected return
   */
  async processRefund(returnId: string): Promise<RefundDetails> {
    const returnRequest = await this.getReturnRequest(returnId);
    if (!returnRequest) {
      throw new Error('Return request not found');
    }

    if (!['inspected', 'processing_refund'].includes(returnRequest.status)) {
      throw new Error(`Cannot process refund for return in status: ${returnRequest.status}`);
    }

    // Calculate refund amount
    const refundCalculation = this.calculateRefund(returnRequest);

    // Create refund record
    const refundDetails: RefundDetails = {
      id: generateId('ref'),
      returnId,
      method: returnRequest.refundMethod,
      originalAmount: refundCalculation.originalAmount,
      deductions: refundCalculation.deductions,
      finalAmount: refundCalculation.finalAmount,
      currency: 'USD',
      status: 'pending',
    };

    // Update return status
    await this.updateReturnStatus(returnId, 'processing_refund');

    try {
      // Process refund based on method
      switch (returnRequest.refundMethod) {
        case 'original_payment':
          await this.refundToOriginalPayment(returnRequest, refundDetails);
          break;
        case 'store_credit':
          await this.issueStoreCredit(returnRequest, refundDetails);
          break;
        case 'bank_transfer':
          await this.processBankTransfer(returnRequest, refundDetails);
          break;
      }

      refundDetails.status = 'completed';
      refundDetails.processedAt = new Date();

      // Record in accounting
      await this.accountingService.recordRefund({
        refundId: refundDetails.id,
        orderId: returnRequest.orderId,
        returnId,
        amount: refundDetails.finalAmount,
        method: refundDetails.method,
        deductions: refundDetails.deductions,
      });

      // Update return with refund details
      await this.finalizeReturn(returnRequest, refundDetails);

      // Notify customer
      await notifyCustomer(returnRequest.customerId, {
        type: 'refund_completed',
        returnId,
        refundAmount: refundDetails.finalAmount,
        method: refundDetails.method,
      });

      return refundDetails;
    } catch (error) {
      refundDetails.status = 'failed';
      await this.saveRefundDetails(refundDetails);

      throw error;
    }
  }

  /**
   * Calculate refund amount with deductions
   */
  private calculateRefund(returnRequest: ReturnRequest): {
    originalAmount: number;
    deductions: RefundDeduction[];
    finalAmount: number;
  } {
    const inspection = returnRequest.inspection;
    if (!inspection) {
      throw new Error('Return has not been inspected');
    }

    // Calculate original refund amount
    let originalAmount = 0;
    const deductions: RefundDeduction[] = [];

    for (const item of returnRequest.items) {
      const itemInspection = inspection.items.find(
        (i) => i.returnItemId === item.id
      );

      if (!itemInspection) continue;

      const quantityForRefund = item.quantityReceived || item.quantity;
      const itemOriginalValue = item.unitPrice * quantityForRefund;
      originalAmount += itemOriginalValue;

      // Calculate condition-based deduction
      const refundPercentage = itemInspection.refundPercentage;
      if (refundPercentage < 100) {
        const deductionAmount = itemOriginalValue * (1 - refundPercentage / 100);
        deductions.push({
          type: 'damage',
          amount: deductionAmount,
          reason: `Item condition: ${itemInspection.condition}`,
        });
      }
    }

    // Add restocking fee if applicable
    const restockingFee = this.calculateRestockingFee(returnRequest);
    if (restockingFee > 0) {
      deductions.push({
        type: 'restocking_fee',
        amount: restockingFee,
        reason: 'Standard restocking fee',
      });
    }

    // Add return shipping cost if customer-paid
    const shippingCost = this.getReturnShippingCost(returnRequest);
    if (shippingCost > 0) {
      deductions.push({
        type: 'shipping',
        amount: shippingCost,
        reason: 'Return shipping cost',
      });
    }

    const totalDeductions = deductions.reduce((sum, d) => sum + d.amount, 0);
    const finalAmount = Math.max(0, originalAmount - totalDeductions);

    return {
      originalAmount,
      deductions,
      finalAmount,
    };
  }

  private calculateRestockingFee(returnRequest: ReturnRequest): number {
    // No restocking fee for defective items
    if (['defective', 'wrong_item', 'not_as_described'].includes(returnRequest.reason)) {
      return 0;
    }

    // 15% restocking fee for change of mind
    const originalAmount = returnRequest.items.reduce(
      (sum, item) => sum + item.subtotal,
      0
    );

    return originalAmount * 0.15;
  }

  private getReturnShippingCost(returnRequest: ReturnRequest): number {
    // Free return shipping for defective items
    if (['defective', 'wrong_item', 'not_as_described'].includes(returnRequest.reason)) {
      return 0;
    }

    // Otherwise, customer pays
    return returnRequest.shippingLabel ? 7.99 : 0;
  }

  private async refundToOriginalPayment(
    returnRequest: ReturnRequest,
    refundDetails: RefundDetails
  ): Promise<void> {
    // Get original payment method
    const order = await this.getOrder(returnRequest.orderId);
    const paymentMethod = order.paymentMethod;

    // Process refund through payment gateway
    const result = await this.paymentGateway.refund({
      originalTransactionId: order.transactionId,
      amount: refundDetails.finalAmount,
      currency: refundDetails.currency,
      reason: `Return refund: ${returnRequest.id}`,
    });

    refundDetails.transactionId = result.transactionId;
  }

  private async issueStoreCredit(
    returnRequest: ReturnRequest,
    refundDetails: RefundDetails
  ): Promise<void> {
    const credit = await this.storeCreditService.issue({
      customerId: returnRequest.customerId,
      amount: refundDetails.finalAmount,
      currency: refundDetails.currency,
      reason: `Return refund: ${returnRequest.id}`,
      expiresAt: this.calculateCreditExpiry(),
    });

    refundDetails.transactionId = credit.id;
  }

  private async processBankTransfer(
    returnRequest: ReturnRequest,
    refundDetails: RefundDetails
  ): Promise<void> {
    // Get customer bank details
    const customer = await this.getCustomer(returnRequest.customerId);

    if (!customer.bankAccount) {
      throw new Error('Customer bank account not configured');
    }

    const result = await this.paymentGateway.bankTransfer({
      recipientAccount: customer.bankAccount,
      amount: refundDetails.finalAmount,
      currency: refundDetails.currency,
      reference: `Refund ${returnRequest.id}`,
    });

    refundDetails.transactionId = result.transactionId;
  }

  private calculateCreditExpiry(): Date {
    const expiry = new Date();
    expiry.setFullYear(expiry.getFullYear() + 1); // 1 year expiry
    return expiry;
  }

  private async finalizeReturn(
    returnRequest: ReturnRequest,
    refundDetails: RefundDetails
  ): Promise<void> {
    returnRequest.refund = refundDetails;
    returnRequest.status = 'refunded';
    returnRequest.timeline.push({
      id: generateId('evt'),
      timestamp: new Date(),
      type: 'refund_completed',
      description: `Refund of ${refundDetails.finalAmount} ${refundDetails.currency} completed via ${refundDetails.method}`,
      actor: { id: 'system', type: 'system' },
    });
    returnRequest.timeline.push({
      id: generateId('evt'),
      timestamp: new Date(),
      type: 'return_completed',
      description: 'Return completed',
      actor: { id: 'system', type: 'system' },
    });

    await db.query(`
      UPDATE return_requests
      SET refund = $1, status = 'completed', timeline = $2, updated_at = NOW()
      WHERE id = $3
    `, [
      JSON.stringify(refundDetails),
      JSON.stringify(returnRequest.timeline),
      returnRequest.id,
    ]);
  }

  private async saveRefundDetails(refundDetails: RefundDetails): Promise<void> {
    await db.query(`
      INSERT INTO refund_records (
        id, return_id, method, original_amount, deductions,
        final_amount, currency, status, transaction_id, processed_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      ON CONFLICT (id) DO UPDATE
      SET status = $8, transaction_id = $9, processed_at = $10
    `, [
      refundDetails.id,
      refundDetails.returnId,
      refundDetails.method,
      refundDetails.originalAmount,
      JSON.stringify(refundDetails.deductions),
      refundDetails.finalAmount,
      refundDetails.currency,
      refundDetails.status,
      refundDetails.transactionId,
      refundDetails.processedAt,
    ]);
  }

  private async updateReturnStatus(
    returnId: string,
    status: ReturnStatus
  ): Promise<void> {
    await db.query(
      'UPDATE return_requests SET status = $1, updated_at = NOW() WHERE id = $2',
      [status, returnId]
    );
  }

  private async getReturnRequest(returnId: string): Promise<ReturnRequest | null> {
    const result = await db.query(
      'SELECT * FROM return_requests WHERE id = $1',
      [returnId]
    );
    return result.rows[0] || null;
  }

  private async getOrder(orderId: string): Promise<any> {
    const result = await db.query(
      'SELECT * FROM orders WHERE id = $1',
      [orderId]
    );
    return result.rows[0];
  }

  private async getCustomer(customerId: string): Promise<any> {
    const result = await db.query(
      'SELECT * FROM customers WHERE id = $1',
      [customerId]
    );
    return result.rows[0];
  }
}
```

### Dispute Handling Service

```typescript
// lib/returns/dispute-service.ts
import { db } from '@/lib/database';
import { redis } from '@/lib/redis';
import { notifyCustomer, notifySupport } from '@/lib/notifications';
import { generateId } from '@/lib/utils';

interface Dispute {
  id: string;
  returnId: string;
  customerId: string;
  type: DisputeType;
  reason: string;
  evidence: DisputeEvidence[];
  status: DisputeStatus;
  resolution?: DisputeResolution;
  assignedTo?: string;
  timeline: DisputeEvent[];
  createdAt: Date;
  updatedAt: Date;
}

type DisputeType =
  | 'inspection_result'
  | 'refund_amount'
  | 'return_rejected'
  | 'shipping_damage'
  | 'item_not_received';

type DisputeStatus =
  | 'open'
  | 'under_review'
  | 'pending_customer'
  | 'pending_merchant'
  | 'resolved'
  | 'escalated'
  | 'closed';

interface DisputeEvidence {
  id: string;
  type: 'photo' | 'document' | 'receipt' | 'video' | 'message';
  url?: string;
  content?: string;
  uploadedBy: string;
  uploadedAt: Date;
}

interface DisputeResolution {
  type: 'favor_customer' | 'favor_merchant' | 'compromise';
  action: string;
  refundAdjustment?: number;
  storeCredit?: number;
  notes: string;
  resolvedBy: string;
  resolvedAt: Date;
}

interface DisputeEvent {
  id: string;
  timestamp: Date;
  type: string;
  description: string;
  actor: { id: string; type: 'customer' | 'staff' | 'system' };
}

export class DisputeService {
  /**
   * Open a dispute for a return
   */
  async openDispute(
    customerId: string,
    returnId: string,
    input: {
      type: DisputeType;
      reason: string;
      evidence?: Array<{ type: string; url?: string; content?: string }>;
    }
  ): Promise<Dispute> {
    // Verify return belongs to customer
    const returnRequest = await this.getReturnRequest(returnId);
    if (!returnRequest || returnRequest.customerId !== customerId) {
      throw new Error('Return request not found');
    }

    // Check if dispute already exists
    const existingDispute = await this.getExistingDispute(returnId);
    if (existingDispute && existingDispute.status !== 'closed') {
      throw new Error('A dispute is already open for this return');
    }

    const disputeId = generateId('disp');
    const now = new Date();

    const dispute: Dispute = {
      id: disputeId,
      returnId,
      customerId,
      type: input.type,
      reason: input.reason,
      evidence: (input.evidence || []).map((e) => ({
        id: generateId('ev'),
        type: e.type as DisputeEvidence['type'],
        url: e.url,
        content: e.content,
        uploadedBy: customerId,
        uploadedAt: now,
      })),
      status: 'open',
      timeline: [{
        id: generateId('evt'),
        timestamp: now,
        type: 'dispute_opened',
        description: `Dispute opened: ${input.type}`,
        actor: { id: customerId, type: 'customer' },
      }],
      createdAt: now,
      updatedAt: now,
    };

    await this.saveDispute(dispute);

    // Update return status
    await this.updateReturnStatus(returnId, 'disputed');

    // Notify support team
    await notifySupport({
      type: 'new_dispute',
      disputeId,
      returnId,
      priority: this.calculatePriority(dispute),
    });

    return dispute;
  }

  /**
   * Add evidence to a dispute
   */
  async addEvidence(
    disputeId: string,
    userId: string,
    evidence: { type: string; url?: string; content?: string }
  ): Promise<Dispute> {
    const dispute = await this.getDispute(disputeId);
    if (!dispute) {
      throw new Error('Dispute not found');
    }

    const newEvidence: DisputeEvidence = {
      id: generateId('ev'),
      type: evidence.type as DisputeEvidence['type'],
      url: evidence.url,
      content: evidence.content,
      uploadedBy: userId,
      uploadedAt: new Date(),
    };

    dispute.evidence.push(newEvidence);
    dispute.timeline.push({
      id: generateId('evt'),
      timestamp: new Date(),
      type: 'evidence_added',
      description: `${evidence.type} evidence added`,
      actor: { id: userId, type: userId === dispute.customerId ? 'customer' : 'staff' },
    });
    dispute.updatedAt = new Date();

    await this.updateDispute(dispute);

    return dispute;
  }

  /**
   * Resolve a dispute
   */
  async resolveDispute(
    disputeId: string,
    staffId: string,
    resolution: {
      type: DisputeResolution['type'];
      action: string;
      refundAdjustment?: number;
      storeCredit?: number;
      notes: string;
    }
  ): Promise<Dispute> {
    const dispute = await this.getDispute(disputeId);
    if (!dispute) {
      throw new Error('Dispute not found');
    }

    if (dispute.status === 'resolved' || dispute.status === 'closed') {
      throw new Error('Dispute is already resolved');
    }

    dispute.resolution = {
      ...resolution,
      resolvedBy: staffId,
      resolvedAt: new Date(),
    };
    dispute.status = 'resolved';
    dispute.timeline.push({
      id: generateId('evt'),
      timestamp: new Date(),
      type: 'dispute_resolved',
      description: `Resolved: ${resolution.type} - ${resolution.action}`,
      actor: { id: staffId, type: 'staff' },
    });
    dispute.updatedAt = new Date();

    await this.updateDispute(dispute);

    // Process resolution actions
    await this.processResolution(dispute);

    // Notify customer
    await notifyCustomer(dispute.customerId, {
      type: 'dispute_resolved',
      disputeId,
      resolution: resolution.type,
      action: resolution.action,
    });

    return dispute;
  }

  /**
   * Escalate a dispute to senior support
   */
  async escalateDispute(
    disputeId: string,
    staffId: string,
    reason: string
  ): Promise<Dispute> {
    const dispute = await this.getDispute(disputeId);
    if (!dispute) {
      throw new Error('Dispute not found');
    }

    dispute.status = 'escalated';
    dispute.timeline.push({
      id: generateId('evt'),
      timestamp: new Date(),
      type: 'dispute_escalated',
      description: `Escalated: ${reason}`,
      actor: { id: staffId, type: 'staff' },
    });
    dispute.updatedAt = new Date();

    await this.updateDispute(dispute);

    // Notify senior support
    await notifySupport({
      type: 'dispute_escalated',
      disputeId,
      priority: 'high',
      reason,
    });

    return dispute;
  }

  private async processResolution(dispute: Dispute): Promise<void> {
    const resolution = dispute.resolution;
    if (!resolution) return;

    const returnRequest = await this.getReturnRequest(dispute.returnId);
    if (!returnRequest) return;

    // Process refund adjustment
    if (resolution.refundAdjustment && resolution.refundAdjustment > 0) {
      // Issue additional refund
      const refundService = new (await import('./refund-service')).RefundService();
      // ... process additional refund
    }

    // Issue store credit
    if (resolution.storeCredit && resolution.storeCredit > 0) {
      const storeCreditService = new (await import('@/lib/payments/store-credit')).StoreCreditService();
      await storeCreditService.issue({
        customerId: dispute.customerId,
        amount: resolution.storeCredit,
        currency: 'USD',
        reason: `Dispute resolution: ${dispute.id}`,
      });
    }

    // Update return status based on resolution
    const newStatus = resolution.type === 'favor_customer' ? 'completed' : 'rejected';
    await this.updateReturnStatus(dispute.returnId, newStatus);
  }

  private calculatePriority(dispute: Dispute): 'high' | 'normal' | 'low' {
    // High priority for shipping damage or item not received
    if (['shipping_damage', 'item_not_received'].includes(dispute.type)) {
      return 'high';
    }

    return 'normal';
  }

  private async saveDispute(dispute: Dispute): Promise<void> {
    await db.query(`
      INSERT INTO disputes (
        id, return_id, customer_id, type, reason, evidence,
        status, timeline, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    `, [
      dispute.id,
      dispute.returnId,
      dispute.customerId,
      dispute.type,
      dispute.reason,
      JSON.stringify(dispute.evidence),
      dispute.status,
      JSON.stringify(dispute.timeline),
      dispute.createdAt,
      dispute.updatedAt,
    ]);
  }

  private async updateDispute(dispute: Dispute): Promise<void> {
    await db.query(`
      UPDATE disputes
      SET evidence = $1, status = $2, resolution = $3,
          assigned_to = $4, timeline = $5, updated_at = $6
      WHERE id = $7
    `, [
      JSON.stringify(dispute.evidence),
      dispute.status,
      JSON.stringify(dispute.resolution),
      dispute.assignedTo,
      JSON.stringify(dispute.timeline),
      dispute.updatedAt,
      dispute.id,
    ]);
  }

  private async getDispute(disputeId: string): Promise<Dispute | null> {
    const result = await db.query(
      'SELECT * FROM disputes WHERE id = $1',
      [disputeId]
    );
    return result.rows[0] || null;
  }

  private async getExistingDispute(returnId: string): Promise<Dispute | null> {
    const result = await db.query(
      'SELECT * FROM disputes WHERE return_id = $1 ORDER BY created_at DESC LIMIT 1',
      [returnId]
    );
    return result.rows[0] || null;
  }

  private async getReturnRequest(returnId: string): Promise<ReturnRequest | null> {
    const result = await db.query(
      'SELECT * FROM return_requests WHERE id = $1',
      [returnId]
    );
    return result.rows[0] || null;
  }

  private async updateReturnStatus(returnId: string, status: ReturnStatus): Promise<void> {
    await db.query(
      'UPDATE return_requests SET status = $1, updated_at = NOW() WHERE id = $2',
      [status, returnId]
    );
  }
}
```

### Return Portal Component

```typescript
// app/account/returns/[orderId]/page.tsx
import { Suspense } from 'react';
import { ReturnRequestForm } from '@/components/returns/ReturnRequestForm';
import { OrderItemsList } from '@/components/returns/OrderItemsList';
import { ReturnEligibilityEngine } from '@/lib/returns/eligibility-engine';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function StartReturnPage({
  params,
}: {
  params: { orderId: string };
}) {
  const session = await auth();
  if (!session?.user) {
    redirect('/login');
  }

  const eligibilityEngine = new ReturnEligibilityEngine();
  const eligibility = await eligibilityEngine.checkEligibility(
    params.orderId,
    session.user.id
  );

  if (!eligibility.eligible) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">Return Not Available</h1>
        <p className="text-gray-600">{eligibility.reason}</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Start a Return</h1>

      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-800">
          Return window: {eligibility.returnWindow.start.toLocaleDateString()} -{' '}
          {eligibility.returnWindow.end.toLocaleDateString()}
        </p>
      </div>

      <Suspense fallback={<div>Loading items...</div>}>
        <ReturnRequestForm
          orderId={params.orderId}
          eligibleItems={eligibility.eligibleItems}
          ineligibleItems={eligibility.ineligibleItems}
          shippingCost={eligibility.shippingCost}
        />
      </Suspense>
    </div>
  );
}
```

### Return API Routes

```typescript
// app/api/returns/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { ReturnRequestService } from '@/lib/returns/return-request-service';
import { auth } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const service = new ReturnRequestService();

    const result = await service.createReturnRequest(session.user.id, {
      orderId: body.orderId,
      items: body.items,
      type: body.type || 'refund',
      refundMethod: body.refundMethod || 'original_payment',
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Return request error:', error);

    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create return request' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const returnId = searchParams.get('id');

    const service = new ReturnRequestService();

    if (returnId) {
      const returnRequest = await service.getReturnRequest(returnId);

      if (!returnRequest) {
        return NextResponse.json(
          { error: 'Return not found' },
          { status: 404 }
        );
      }

      if (returnRequest.customerId !== session.user.id) {
        return NextResponse.json(
          { error: 'Access denied' },
          { status: 403 }
        );
      }

      return NextResponse.json(returnRequest);
    }

    // List all returns for customer
    const returns = await service.getCustomerReturns(session.user.id);
    return NextResponse.json(returns);
  } catch (error) {
    console.error('Return fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch returns' },
      { status: 500 }
    );
  }
}
```

## Examples

### Complete Return Flow

```typescript
// Example: Customer initiates a return
const returnService = new ReturnRequestService();

// Step 1: Create return request
const returnRequest = await returnService.createReturnRequest('cust-123', {
  orderId: 'order-456',
  items: [
    {
      orderItemId: 'item-789',
      quantity: 1,
      reason: 'too_small',
      reasonDetails: 'Size runs smaller than expected',
    },
  ],
  type: 'refund',
  refundMethod: 'original_payment',
});

// Step 2: Customer ships item
await returnService.markAsShipped(
  returnRequest.id,
  'TRACK123456789'
);

// Step 3: Warehouse receives and inspects
const inspectionService = new InspectionService();
await inspectionService.submitInspection(
  returnRequest.id,
  'inspector-001',
  {
    items: [{
      returnItemId: returnRequest.items[0].id,
      condition: 'like_new',
      issues: [],
      restockable: true,
    }],
    photos: [{
      itemId: returnRequest.items[0].id,
      url: '/photos/return-123.jpg',
      type: 'overview',
    }],
  }
);

// Step 4: Process refund
const refundService = new RefundService();
const refund = await refundService.processRefund(returnRequest.id);

console.log(`Refund of ${refund.finalAmount} processed`);
```

## Anti-Patterns

### What to Avoid

```typescript
// BAD: No eligibility check before creating return
async function createReturn(orderId: string, items: any[]) {
  // Directly creating return without validation
  return await db.insert('returns', { orderId, items });
}

// BAD: Synchronous refund processing
async function handleReturn(returnId: string) {
  const inspection = await inspectItems(returnId);
  const refund = await processRefund(returnId); // Blocks user
  await updateInventory(returnId); // All sequential
  return refund;
}

// BAD: No tracking or audit trail
async function updateReturnStatus(id: string, status: string) {
  await db.query(
    'UPDATE returns SET status = $1 WHERE id = $2',
    [status, id]
  );
  // No timeline event recorded
}

// BAD: No fraud detection
async function approveAllReturns() {
  // Auto-approving everything without checks
  const pending = await db.query("SELECT * FROM returns WHERE status = 'pending'");
  for (const r of pending.rows) {
    await approveReturn(r.id);
  }
}
```

### Correct Patterns

```typescript
// GOOD: Full eligibility validation
async function createReturn(customerId: string, orderId: string, items: any[]) {
  const eligibility = await checkEligibility(orderId, customerId, items);
  if (!eligibility.eligible) {
    throw new Error(eligibility.reason);
  }
  return await service.createReturnRequest(customerId, {
    orderId,
    items,
    type: 'refund',
    refundMethod: 'original_payment',
  });
}

// GOOD: Async processing with proper status updates
async function handleReturn(returnId: string) {
  await updateStatus(returnId, 'inspecting');

  // Queue for async processing
  await queue.add('inspect-return', { returnId });
  await queue.add('process-refund', { returnId }, { delay: 0, priority: 'normal' });

  // Return immediately, process in background
  return { status: 'processing' };
}

// GOOD: Full audit trail
async function updateReturnStatus(id: string, status: string, actor: Actor) {
  await db.transaction(async (tx) => {
    await tx.query(
      'UPDATE returns SET status = $1, updated_at = NOW() WHERE id = $2',
      [status, id]
    );

    await tx.query(`
      INSERT INTO return_events (return_id, type, actor_id, actor_type, timestamp)
      VALUES ($1, $2, $3, $4, NOW())
    `, [id, `status_${status}`, actor.id, actor.type]);
  });
}

// GOOD: Fraud detection and trust scoring
async function processReturnRequest(returnRequest: ReturnRequest) {
  const trustScore = await calculateCustomerTrustScore(returnRequest.customerId);

  if (trustScore < 0.3) {
    await flagForManualReview(returnRequest.id, 'low_trust_score');
    return { status: 'pending_review' };
  }

  if (trustScore > 0.8 && returnRequest.items[0].subtotal < 100) {
    return await autoApprove(returnRequest.id);
  }

  return { status: 'pending_review' };
}
```

## Testing

### Unit Tests

```typescript
// __tests__/returns/eligibility-engine.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ReturnEligibilityEngine } from '@/lib/returns/eligibility-engine';

describe('ReturnEligibilityEngine', () => {
  let engine: ReturnEligibilityEngine;

  beforeEach(() => {
    engine = new ReturnEligibilityEngine();
  });

  describe('checkEligibility', () => {
    it('returns eligible for delivered order within window', async () => {
      vi.mock('@/lib/database', () => ({
        db: {
          query: vi.fn()
            .mockResolvedValueOnce({
              rows: [{
                id: 'order-1',
                customer_id: 'cust-1',
                status: 'delivered',
                delivered_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                items: [{ id: 'item-1', product_id: 'prod-1', quantity: 1 }],
              }],
            }),
        },
      }));

      const result = await engine.checkEligibility('order-1', 'cust-1');

      expect(result.eligible).toBe(true);
      expect(result.eligibleItems.length).toBeGreaterThan(0);
    });

    it('returns ineligible for expired return window', async () => {
      vi.mock('@/lib/database', () => ({
        db: {
          query: vi.fn()
            .mockResolvedValueOnce({
              rows: [{
                id: 'order-1',
                customer_id: 'cust-1',
                status: 'delivered',
                delivered_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // 60 days ago
                items: [{ id: 'item-1', product_id: 'prod-1', quantity: 1 }],
              }],
            }),
        },
      }));

      const result = await engine.checkEligibility('order-1', 'cust-1');

      expect(result.eligible).toBe(false);
      expect(result.reason).toContain('expired');
    });

    it('rejects items already returned', async () => {
      // Mock order with already returned items
      const result = await engine.checkEligibility('order-1', 'cust-1', [
        { orderItemId: 'item-already-returned', quantity: 1 },
      ]);

      expect(result.ineligibleItems.length).toBe(1);
      expect(result.ineligibleItems[0].reason).toContain('already');
    });
  });
});
```

### Integration Tests

```typescript
// __tests__/returns/return-flow.integration.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { ReturnRequestService } from '@/lib/returns/return-request-service';
import { InspectionService } from '@/lib/returns/inspection-service';
import { RefundService } from '@/lib/returns/refund-service';
import { setupTestDatabase, cleanupTestDatabase, createTestOrder } from '../helpers';

describe('Return Flow Integration', () => {
  let returnService: ReturnRequestService;
  let inspectionService: InspectionService;
  let refundService: RefundService;
  let testOrder: any;

  beforeAll(async () => {
    await setupTestDatabase();
    returnService = new ReturnRequestService();
    inspectionService = new InspectionService();
    refundService = new RefundService();

    testOrder = await createTestOrder({
      customerId: 'test-customer',
      status: 'delivered',
      deliveredAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    });
  });

  afterAll(async () => {
    await cleanupTestDatabase();
  });

  it('completes full return flow from request to refund', async () => {
    // Create return request
    const returnRequest = await returnService.createReturnRequest(
      'test-customer',
      {
        orderId: testOrder.id,
        items: [{
          orderItemId: testOrder.items[0].id,
          quantity: 1,
          reason: 'defective',
        }],
        type: 'refund',
        refundMethod: 'original_payment',
      }
    );

    expect(returnRequest.status).toBe('label_generated'); // Auto-approved

    // Mark as shipped
    await returnService.markAsShipped(returnRequest.id, 'TRACK123');

    // Record receipt
    await returnService.recordReceipt(returnRequest.id, [
      { returnItemId: returnRequest.items[0].id, quantityReceived: 1 },
    ]);

    // Submit inspection
    const inspected = await inspectionService.submitInspection(
      returnRequest.id,
      'inspector-1',
      {
        items: [{
          returnItemId: returnRequest.items[0].id,
          condition: 'like_new',
          issues: [],
          restockable: true,
        }],
        photos: [],
      }
    );

    expect(inspected.inspection?.decision).toBe('full_refund');

    // Process refund
    const refund = await refundService.processRefund(returnRequest.id);

    expect(refund.status).toBe('completed');
    expect(refund.finalAmount).toBeGreaterThan(0);
  });
});
```

## Changelog

### v1.0.0 (2025-01-18)
- Initial pattern documentation
| 1.1.0 | 2025-01-18 | Added eligibility engine |
| 1.2.0 | 2025-01-18 | Added inspection service |
| 1.3.0 | 2025-01-18 | Added refund processing |
| 1.4.0 | 2025-01-18 | Added dispute handling |
| 1.5.0 | 2025-01-18 | Added comprehensive testing examples |
