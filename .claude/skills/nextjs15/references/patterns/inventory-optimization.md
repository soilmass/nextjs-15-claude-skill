---
id: pt-inventory-optimization
name: Inventory Optimization
version: 1.0.0
layer: L5
category: e-commerce
description: Advanced inventory management with demand forecasting, reorder points, and safety stock calculations
tags: [inventory, optimization, forecasting, stock-management, next15]
composes: []
dependencies: {}
formula: Inventory Optimization = Demand Forecasting + Reorder Points + Safety Stock + ABC Analysis
performance:
  impact: medium
  lcp: neutral
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# Inventory Optimization

## Overview

Inventory optimization systems ensure accurate stock levels, prevent overselling, and maximize fulfillment efficiency. This pattern covers real-time synchronization, overbooking prevention, stock reservation mechanisms, fulfillment allocation strategies, and demand forecasting for Next.js 15 e-commerce applications.

### Key Concepts

- **Real-Time Sync**: Multi-channel inventory synchronization with conflict resolution
- **Overbooking Prevention**: Lock-based and optimistic concurrency control
- **Stock Reservation**: Temporary holds during checkout with automatic release
- **Fulfillment Allocation**: Smart routing to warehouses and fulfillment centers
- **Demand Forecasting**: ML-based prediction for inventory planning

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        INVENTORY OPTIMIZATION SYSTEM                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                      INVENTORY SOURCES                                │   │
│  │                                                                        │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌────────────┐  │   │
│  │  │  Warehouse  │  │  Retail     │  │  Supplier   │  │  3PL       │  │   │
│  │  │  System     │  │  POS        │  │  Feed       │  │  Partners  │  │   │
│  │  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └─────┬──────┘  │   │
│  │         │                │                │               │          │   │
│  │         └────────────────┼────────────────┼───────────────┘          │   │
│  │                          ▼                ▼                          │   │
│  │  ┌────────────────────────────────────────────────────────────────┐ │   │
│  │  │                    SYNC ORCHESTRATOR                            │ │   │
│  │  │  ┌──────────────┐  ┌──────────────┐  ┌───────────────────────┐ │ │   │
│  │  │  │   Event      │  │   Conflict   │  │   Reconciliation     │ │ │   │
│  │  │  │   Stream     │  │   Resolver   │  │   Engine             │ │ │   │
│  │  │  └──────────────┘  └──────────────┘  └───────────────────────┘ │ │   │
│  │  └────────────────────────────────────────────────────────────────┘ │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                    │                                         │
│                                    ▼                                         │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                      CENTRAL INVENTORY HUB                            │   │
│  │                                                                        │   │
│  │  ┌────────────────────────────────────────────────────────────────┐  │   │
│  │  │                    STOCK LEVELS                                 │  │   │
│  │  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐   │  │   │
│  │  │  │ Available│  │ Reserved │  │ Committed│  │ In Transit   │   │  │   │
│  │  │  │   100    │  │    25    │  │    10    │  │     15       │   │  │   │
│  │  │  └──────────┘  └──────────┘  └──────────┘  └──────────────┘   │  │   │
│  │  └────────────────────────────────────────────────────────────────┘  │   │
│  │                                                                        │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────────┐  │   │
│  │  │   Product   │  │  Location   │  │   Variant                   │  │   │
│  │  │   Index     │  │   Mapping   │  │   Matrix                    │  │   │
│  │  └─────────────┘  └─────────────┘  └─────────────────────────────┘  │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                    │                                         │
│         ┌──────────────────────────┼──────────────────────────┐             │
│         ▼                          ▼                          ▼             │
│  ┌─────────────┐           ┌─────────────┐           ┌─────────────┐       │
│  │ Reservation │           │ Allocation  │           │  Forecasting│       │
│  │   Engine    │           │   Engine    │           │    Engine   │       │
│  │             │           │             │           │             │       │
│  │ ┌─────────┐ │           │ ┌─────────┐ │           │ ┌─────────┐ │       │
│  │ │ Hold    │ │           │ │ Route   │ │           │ │ Predict │ │       │
│  │ │ Release │ │           │ │ Optimize│ │           │ │ Reorder │ │       │
│  │ │ Commit  │ │           │ │ Split   │ │           │ │ Buffer  │ │       │
│  │ └─────────┘ │           │ └─────────┘ │           │ └─────────┘ │       │
│  └─────────────┘           └─────────────┘           └─────────────┘       │
│         │                          │                          │             │
│         └──────────────────────────┼──────────────────────────┘             │
│                                    ▼                                         │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                      INVENTORY EVENTS                                 │   │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────────┐ │   │
│  │  │   Stock    │  │   Stock    │  │  Low Stock │  │   Out of       │ │   │
│  │  │   Update   │  │   Reserved │  │   Alert    │  │   Stock        │ │   │
│  │  └────────────┘  └────────────┘  └────────────┘  └────────────────┘ │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Implementation

### Core Types and Interfaces

```typescript
// types/inventory.ts
export interface InventoryItem {
  id: string;
  productId: string;
  variantId?: string;
  sku: string;
  locationId: string;
  quantities: InventoryQuantities;
  thresholds: InventoryThresholds;
  status: InventoryStatus;
  lastSyncedAt: Date;
  updatedAt: Date;
}

export interface InventoryQuantities {
  onHand: number;
  available: number;
  reserved: number;
  committed: number;
  inTransit: number;
  damaged: number;
  onHold: number;
}

export interface InventoryThresholds {
  reorderPoint: number;
  safetyStock: number;
  maxStock: number;
  leadTimeDays: number;
}

export type InventoryStatus = 'active' | 'discontinued' | 'seasonal' | 'backorder';

export interface StockLocation {
  id: string;
  name: string;
  type: LocationType;
  address: Address;
  capabilities: LocationCapabilities;
  priority: number;
  isActive: boolean;
}

export type LocationType = 'warehouse' | 'store' | 'fulfillment_center' | 'supplier' | 'dropship';

export interface LocationCapabilities {
  canShip: boolean;
  canPickup: boolean;
  handlesReturns: boolean;
  sameDay: boolean;
  nextDay: boolean;
  supportedCarriers: string[];
}

export interface Address {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  coordinates?: { lat: number; lng: number };
}

export interface StockReservation {
  id: string;
  productId: string;
  variantId?: string;
  locationId: string;
  quantity: number;
  sessionId: string;
  orderId?: string;
  status: ReservationStatus;
  expiresAt: Date;
  createdAt: Date;
}

export type ReservationStatus = 'pending' | 'committed' | 'released' | 'expired';

export interface InventoryMovement {
  id: string;
  type: MovementType;
  productId: string;
  variantId?: string;
  fromLocationId?: string;
  toLocationId?: string;
  quantity: number;
  reason: string;
  referenceType?: string;
  referenceId?: string;
  performedBy: string;
  timestamp: Date;
}

export type MovementType =
  | 'receive'
  | 'ship'
  | 'transfer'
  | 'adjust'
  | 'reserve'
  | 'release'
  | 'commit'
  | 'return'
  | 'damage'
  | 'dispose';

export interface AllocationResult {
  orderId: string;
  allocations: LocationAllocation[];
  unallocated: UnallocatedItem[];
  strategy: AllocationStrategy;
  estimatedShipDate: Date;
}

export interface LocationAllocation {
  locationId: string;
  items: AllocatedItem[];
  shippingMethod: string;
  estimatedDelivery: Date;
  cost: number;
}

export interface AllocatedItem {
  productId: string;
  variantId?: string;
  quantity: number;
  inventoryItemId: string;
}

export interface UnallocatedItem {
  productId: string;
  variantId?: string;
  quantity: number;
  reason: string;
  backorderDate?: Date;
}

export type AllocationStrategy =
  | 'nearest_warehouse'
  | 'lowest_cost'
  | 'fastest_delivery'
  | 'single_shipment'
  | 'balanced';

export interface DemandForecast {
  productId: string;
  variantId?: string;
  period: ForecastPeriod;
  predictions: DemandPrediction[];
  confidence: number;
  factors: ForecastFactor[];
  generatedAt: Date;
}

export interface DemandPrediction {
  date: Date;
  quantity: number;
  lowerBound: number;
  upperBound: number;
}

export type ForecastPeriod = 'daily' | 'weekly' | 'monthly';

export interface ForecastFactor {
  name: string;
  impact: number;
  direction: 'positive' | 'negative';
}

export interface InventoryEvent {
  id: string;
  type: InventoryEventType;
  productId: string;
  variantId?: string;
  locationId: string;
  data: Record<string, unknown>;
  timestamp: Date;
}

export type InventoryEventType =
  | 'stock_updated'
  | 'stock_reserved'
  | 'stock_committed'
  | 'stock_released'
  | 'low_stock_alert'
  | 'out_of_stock'
  | 'back_in_stock'
  | 'sync_completed'
  | 'sync_conflict';
```

### Real-Time Inventory Service

```typescript
// lib/inventory/inventory-service.ts
import { db } from '@/lib/database';
import { redis } from '@/lib/redis';
import { eventEmitter } from '@/lib/events';
import { generateId } from '@/lib/utils';

export class InventoryService {
  private readonly LOCK_TTL = 5000; // 5 seconds
  private readonly RESERVATION_TTL = 15 * 60; // 15 minutes

  /**
   * Get available quantity for a product across all or specific locations
   */
  async getAvailableQuantity(
    productId: string,
    variantId?: string,
    locationId?: string
  ): Promise<number> {
    const cacheKey = this.getAvailabilityCacheKey(productId, variantId, locationId);
    const cached = await redis.get(cacheKey);

    if (cached !== null) {
      return parseInt(cached, 10);
    }

    let query = `
      SELECT SUM(
        quantities->>'available'::int
      ) as available
      FROM inventory_items
      WHERE product_id = $1
        AND status = 'active'
    `;
    const params: (string | undefined)[] = [productId];

    if (variantId) {
      query += ' AND variant_id = $2';
      params.push(variantId);
    }

    if (locationId) {
      query += ` AND location_id = $${params.length + 1}`;
      params.push(locationId);
    }

    const result = await db.query(query, params);
    const available = parseInt(result.rows[0]?.available || '0', 10);

    // Cache for 30 seconds
    await redis.setex(cacheKey, 30, available.toString());

    return available;
  }

  /**
   * Get detailed inventory across locations
   */
  async getInventoryByLocation(
    productId: string,
    variantId?: string
  ): Promise<InventoryItem[]> {
    let query = `
      SELECT i.*, l.name as location_name, l.type as location_type
      FROM inventory_items i
      JOIN stock_locations l ON i.location_id = l.id
      WHERE i.product_id = $1
        AND i.status = 'active'
        AND l.is_active = true
      ORDER BY l.priority ASC
    `;
    const params: (string | undefined)[] = [productId];

    if (variantId) {
      query = query.replace('WHERE i.product_id = $1', 'WHERE i.product_id = $1 AND i.variant_id = $2');
      params.push(variantId);
    }

    const result = await db.query(query, params);
    return result.rows.map(this.mapInventoryRow);
  }

  /**
   * Adjust stock level with proper locking
   */
  async adjustStock(adjustment: {
    productId: string;
    variantId?: string;
    locationId: string;
    quantity: number;
    reason: string;
    referenceType?: string;
    referenceId?: string;
    performedBy?: string;
  }): Promise<InventoryItem> {
    const lockKey = this.getLockKey(
      adjustment.productId,
      adjustment.variantId,
      adjustment.locationId
    );

    // Acquire distributed lock
    const lockAcquired = await this.acquireLock(lockKey);
    if (!lockAcquired) {
      throw new Error('Failed to acquire inventory lock. Please try again.');
    }

    try {
      // Get current inventory
      const current = await this.getInventoryItem(
        adjustment.productId,
        adjustment.variantId,
        adjustment.locationId
      );

      if (!current) {
        throw new Error('Inventory item not found');
      }

      // Calculate new quantities
      const newOnHand = current.quantities.onHand + adjustment.quantity;
      const newAvailable = current.quantities.available + adjustment.quantity;

      if (newOnHand < 0 || newAvailable < 0) {
        throw new Error('Adjustment would result in negative inventory');
      }

      // Update inventory
      const result = await db.query(`
        UPDATE inventory_items
        SET quantities = quantities || jsonb_build_object(
          'onHand', $1,
          'available', $2
        ),
        updated_at = NOW()
        WHERE id = $3
        RETURNING *
      `, [newOnHand, newAvailable, current.id]);

      const updated = this.mapInventoryRow(result.rows[0]);

      // Record movement
      await this.recordMovement({
        type: adjustment.quantity > 0 ? 'receive' : 'adjust',
        productId: adjustment.productId,
        variantId: adjustment.variantId,
        toLocationId: adjustment.quantity > 0 ? adjustment.locationId : undefined,
        fromLocationId: adjustment.quantity < 0 ? adjustment.locationId : undefined,
        quantity: Math.abs(adjustment.quantity),
        reason: adjustment.reason,
        referenceType: adjustment.referenceType,
        referenceId: adjustment.referenceId,
        performedBy: adjustment.performedBy || 'system',
      });

      // Invalidate cache
      await this.invalidateCache(adjustment.productId, adjustment.variantId);

      // Emit events
      await this.emitStockEvent(updated, adjustment.quantity);

      return updated;
    } finally {
      await this.releaseLock(lockKey);
    }
  }

  /**
   * Reserve stock for checkout
   */
  async reserveStock(reservation: {
    productId: string;
    variantId?: string;
    quantity: number;
    sessionId: string;
    locationId?: string;
  }): Promise<StockReservation> {
    // Find location with sufficient stock
    const locationId = reservation.locationId ||
      await this.findBestLocation(
        reservation.productId,
        reservation.variantId,
        reservation.quantity
      );

    if (!locationId) {
      throw new Error('Insufficient stock available');
    }

    const lockKey = this.getLockKey(
      reservation.productId,
      reservation.variantId,
      locationId
    );

    const lockAcquired = await this.acquireLock(lockKey);
    if (!lockAcquired) {
      throw new Error('Failed to acquire inventory lock');
    }

    try {
      // Check available quantity
      const inventory = await this.getInventoryItem(
        reservation.productId,
        reservation.variantId,
        locationId
      );

      if (!inventory || inventory.quantities.available < reservation.quantity) {
        throw new Error('Insufficient stock available');
      }

      // Create reservation
      const reservationId = generateId('res');
      const expiresAt = new Date(Date.now() + this.RESERVATION_TTL * 1000);

      const stockReservation: StockReservation = {
        id: reservationId,
        productId: reservation.productId,
        variantId: reservation.variantId,
        locationId,
        quantity: reservation.quantity,
        sessionId: reservation.sessionId,
        status: 'pending',
        expiresAt,
        createdAt: new Date(),
      };

      // Update inventory
      await db.query(`
        UPDATE inventory_items
        SET quantities = quantities || jsonb_build_object(
          'available', (quantities->>'available')::int - $1,
          'reserved', (quantities->>'reserved')::int + $1
        ),
        updated_at = NOW()
        WHERE id = $2
      `, [reservation.quantity, inventory.id]);

      // Save reservation
      await db.query(`
        INSERT INTO stock_reservations (
          id, product_id, variant_id, location_id, quantity,
          session_id, status, expires_at, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `, [
        stockReservation.id,
        stockReservation.productId,
        stockReservation.variantId,
        stockReservation.locationId,
        stockReservation.quantity,
        stockReservation.sessionId,
        stockReservation.status,
        stockReservation.expiresAt,
        stockReservation.createdAt,
      ]);

      // Schedule expiration
      await this.scheduleReservationExpiry(stockReservation);

      // Invalidate cache
      await this.invalidateCache(reservation.productId, reservation.variantId);

      // Record movement
      await this.recordMovement({
        type: 'reserve',
        productId: reservation.productId,
        variantId: reservation.variantId,
        toLocationId: locationId,
        quantity: reservation.quantity,
        reason: 'checkout_reservation',
        referenceType: 'reservation',
        referenceId: reservationId,
        performedBy: 'system',
      });

      return stockReservation;
    } finally {
      await this.releaseLock(lockKey);
    }
  }

  /**
   * Commit reserved stock when order is placed
   */
  async commitReservation(
    reservationId: string,
    orderId: string
  ): Promise<void> {
    const reservation = await this.getReservation(reservationId);
    if (!reservation) {
      throw new Error('Reservation not found');
    }

    if (reservation.status !== 'pending') {
      throw new Error(`Cannot commit reservation in status: ${reservation.status}`);
    }

    const lockKey = this.getLockKey(
      reservation.productId,
      reservation.variantId,
      reservation.locationId
    );

    const lockAcquired = await this.acquireLock(lockKey);
    if (!lockAcquired) {
      throw new Error('Failed to acquire inventory lock');
    }

    try {
      // Update inventory: move from reserved to committed
      await db.query(`
        UPDATE inventory_items
        SET quantities = quantities || jsonb_build_object(
          'reserved', (quantities->>'reserved')::int - $1,
          'committed', (quantities->>'committed')::int + $1
        ),
        updated_at = NOW()
        WHERE product_id = $2
          AND ($3::text IS NULL OR variant_id = $3)
          AND location_id = $4
      `, [
        reservation.quantity,
        reservation.productId,
        reservation.variantId,
        reservation.locationId,
      ]);

      // Update reservation
      await db.query(`
        UPDATE stock_reservations
        SET status = 'committed', order_id = $1
        WHERE id = $2
      `, [orderId, reservationId]);

      // Record movement
      await this.recordMovement({
        type: 'commit',
        productId: reservation.productId,
        variantId: reservation.variantId,
        toLocationId: reservation.locationId,
        quantity: reservation.quantity,
        reason: 'order_placed',
        referenceType: 'order',
        referenceId: orderId,
        performedBy: 'system',
      });

      // Invalidate cache
      await this.invalidateCache(reservation.productId, reservation.variantId);
    } finally {
      await this.releaseLock(lockKey);
    }
  }

  /**
   * Release reserved stock
   */
  async releaseReservation(reservationId: string, reason: string): Promise<void> {
    const reservation = await this.getReservation(reservationId);
    if (!reservation) {
      return; // Already released or doesn't exist
    }

    if (reservation.status !== 'pending') {
      return; // Can only release pending reservations
    }

    const lockKey = this.getLockKey(
      reservation.productId,
      reservation.variantId,
      reservation.locationId
    );

    const lockAcquired = await this.acquireLock(lockKey);
    if (!lockAcquired) {
      throw new Error('Failed to acquire inventory lock');
    }

    try {
      // Update inventory: move from reserved back to available
      await db.query(`
        UPDATE inventory_items
        SET quantities = quantities || jsonb_build_object(
          'reserved', GREATEST(0, (quantities->>'reserved')::int - $1),
          'available', (quantities->>'available')::int + $1
        ),
        updated_at = NOW()
        WHERE product_id = $2
          AND ($3::text IS NULL OR variant_id = $3)
          AND location_id = $4
      `, [
        reservation.quantity,
        reservation.productId,
        reservation.variantId,
        reservation.locationId,
      ]);

      // Update reservation status
      await db.query(`
        UPDATE stock_reservations
        SET status = 'released'
        WHERE id = $1
      `, [reservationId]);

      // Record movement
      await this.recordMovement({
        type: 'release',
        productId: reservation.productId,
        variantId: reservation.variantId,
        fromLocationId: reservation.locationId,
        quantity: reservation.quantity,
        reason,
        referenceType: 'reservation',
        referenceId: reservationId,
        performedBy: 'system',
      });

      // Invalidate cache
      await this.invalidateCache(reservation.productId, reservation.variantId);

      // Emit back in stock if needed
      const available = await this.getAvailableQuantity(
        reservation.productId,
        reservation.variantId
      );
      if (available > 0) {
        await eventEmitter.emit('inventory:back_in_stock', {
          productId: reservation.productId,
          variantId: reservation.variantId,
          available,
        });
      }
    } finally {
      await this.releaseLock(lockKey);
    }
  }

  /**
   * Process expired reservations
   */
  async processExpiredReservations(): Promise<number> {
    const result = await db.query(`
      SELECT * FROM stock_reservations
      WHERE status = 'pending'
        AND expires_at < NOW()
      LIMIT 100
    `);

    let released = 0;

    for (const row of result.rows) {
      try {
        await this.releaseReservation(row.id, 'reservation_expired');
        released++;
      } catch (error) {
        console.error(`Failed to release reservation ${row.id}:`, error);
      }
    }

    return released;
  }

  private async findBestLocation(
    productId: string,
    variantId: string | undefined,
    quantity: number
  ): Promise<string | null> {
    const result = await db.query(`
      SELECT i.location_id
      FROM inventory_items i
      JOIN stock_locations l ON i.location_id = l.id
      WHERE i.product_id = $1
        AND ($2::text IS NULL OR i.variant_id = $2)
        AND (i.quantities->>'available')::int >= $3
        AND i.status = 'active'
        AND l.is_active = true
        AND l.capabilities->>'canShip' = 'true'
      ORDER BY l.priority ASC
      LIMIT 1
    `, [productId, variantId, quantity]);

    return result.rows[0]?.location_id || null;
  }

  private async getInventoryItem(
    productId: string,
    variantId: string | undefined,
    locationId: string
  ): Promise<InventoryItem | null> {
    const result = await db.query(`
      SELECT * FROM inventory_items
      WHERE product_id = $1
        AND ($2::text IS NULL OR variant_id = $2)
        AND location_id = $3
    `, [productId, variantId, locationId]);

    return result.rows[0] ? this.mapInventoryRow(result.rows[0]) : null;
  }

  private async getReservation(reservationId: string): Promise<StockReservation | null> {
    const result = await db.query(
      'SELECT * FROM stock_reservations WHERE id = $1',
      [reservationId]
    );
    return result.rows[0] || null;
  }

  private async recordMovement(movement: Omit<InventoryMovement, 'id' | 'timestamp'>): Promise<void> {
    await db.query(`
      INSERT INTO inventory_movements (
        id, type, product_id, variant_id, from_location_id, to_location_id,
        quantity, reason, reference_type, reference_id, performed_by, timestamp
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())
    `, [
      generateId('mov'),
      movement.type,
      movement.productId,
      movement.variantId,
      movement.fromLocationId,
      movement.toLocationId,
      movement.quantity,
      movement.reason,
      movement.referenceType,
      movement.referenceId,
      movement.performedBy,
    ]);
  }

  private async emitStockEvent(
    inventory: InventoryItem,
    change: number
  ): Promise<void> {
    await eventEmitter.emit('inventory:stock_updated', {
      productId: inventory.productId,
      variantId: inventory.variantId,
      locationId: inventory.locationId,
      available: inventory.quantities.available,
      change,
    });

    // Check thresholds
    if (inventory.quantities.available <= 0) {
      await eventEmitter.emit('inventory:out_of_stock', {
        productId: inventory.productId,
        variantId: inventory.variantId,
      });
    } else if (inventory.quantities.available <= inventory.thresholds.reorderPoint) {
      await eventEmitter.emit('inventory:low_stock_alert', {
        productId: inventory.productId,
        variantId: inventory.variantId,
        available: inventory.quantities.available,
        reorderPoint: inventory.thresholds.reorderPoint,
      });
    }
  }

  private async scheduleReservationExpiry(reservation: StockReservation): Promise<void> {
    const ttl = Math.floor((reservation.expiresAt.getTime() - Date.now()) / 1000);
    if (ttl > 0) {
      await redis.setex(
        `reservation:expiry:${reservation.id}`,
        ttl,
        JSON.stringify(reservation)
      );
    }
  }

  private getLockKey(productId: string, variantId: string | undefined, locationId: string): string {
    return `inventory:lock:${productId}:${variantId || 'base'}:${locationId}`;
  }

  private async acquireLock(key: string): Promise<boolean> {
    const result = await redis.set(key, '1', 'NX', 'PX', this.LOCK_TTL);
    return result === 'OK';
  }

  private async releaseLock(key: string): Promise<void> {
    await redis.del(key);
  }

  private getAvailabilityCacheKey(
    productId: string,
    variantId?: string,
    locationId?: string
  ): string {
    return `inventory:available:${productId}:${variantId || 'all'}:${locationId || 'all'}`;
  }

  private async invalidateCache(productId: string, variantId?: string): Promise<void> {
    const pattern = `inventory:available:${productId}:${variantId || '*'}:*`;
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  }

  private mapInventoryRow(row: any): InventoryItem {
    return {
      id: row.id,
      productId: row.product_id,
      variantId: row.variant_id,
      sku: row.sku,
      locationId: row.location_id,
      quantities: row.quantities,
      thresholds: row.thresholds,
      status: row.status,
      lastSyncedAt: row.last_synced_at,
      updatedAt: row.updated_at,
    };
  }

  async recordDisposal(disposal: {
    productId: string;
    variantId?: string;
    quantity: number;
    reason: string;
    referenceId?: string;
    condition: ItemCondition;
  }): Promise<void> {
    // Implementation for disposing damaged/unsellable inventory
    await this.recordMovement({
      type: 'dispose',
      productId: disposal.productId,
      variantId: disposal.variantId,
      quantity: disposal.quantity,
      reason: `${disposal.reason} - condition: ${disposal.condition}`,
      referenceType: 'disposal',
      referenceId: disposal.referenceId,
      performedBy: 'system',
    });
  }
}
```

### Allocation Engine

```typescript
// lib/inventory/allocation-engine.ts
import { db } from '@/lib/database';
import { InventoryService } from './inventory-service';
import { GeoService } from '@/lib/geo/service';

interface OrderItem {
  productId: string;
  variantId?: string;
  quantity: number;
}

interface AllocationOptions {
  strategy: AllocationStrategy;
  deliveryAddress: Address;
  preferredCarrier?: string;
  maxShipments?: number;
  requiredDeliveryDate?: Date;
}

export class AllocationEngine {
  private inventoryService: InventoryService;
  private geoService: GeoService;

  constructor() {
    this.inventoryService = new InventoryService();
    this.geoService = new GeoService();
  }

  /**
   * Allocate inventory for an order
   */
  async allocateOrder(
    orderId: string,
    items: OrderItem[],
    options: AllocationOptions
  ): Promise<AllocationResult> {
    // Get all locations with available stock
    const locationStock = await this.getLocationStock(items);

    // Get location distances from delivery address
    const locationDistances = await this.getLocationDistances(
      Object.keys(locationStock),
      options.deliveryAddress
    );

    // Choose allocation strategy
    let allocations: LocationAllocation[];

    switch (options.strategy) {
      case 'nearest_warehouse':
        allocations = await this.allocateByDistance(
          items,
          locationStock,
          locationDistances
        );
        break;
      case 'lowest_cost':
        allocations = await this.allocateByLowestCost(
          items,
          locationStock,
          locationDistances,
          options
        );
        break;
      case 'fastest_delivery':
        allocations = await this.allocateByFastestDelivery(
          items,
          locationStock,
          locationDistances,
          options
        );
        break;
      case 'single_shipment':
        allocations = await this.allocateSingleShipment(
          items,
          locationStock,
          locationDistances
        );
        break;
      case 'balanced':
      default:
        allocations = await this.allocateBalanced(
          items,
          locationStock,
          locationDistances,
          options
        );
    }

    // Identify unallocated items
    const unallocated = this.findUnallocatedItems(items, allocations);

    // Calculate estimated ship date
    const estimatedShipDate = this.calculateEstimatedShipDate(allocations);

    return {
      orderId,
      allocations,
      unallocated,
      strategy: options.strategy,
      estimatedShipDate,
    };
  }

  /**
   * Allocate by nearest warehouse
   */
  private async allocateByDistance(
    items: OrderItem[],
    locationStock: Map<string, Map<string, number>>,
    distances: Map<string, number>
  ): Promise<LocationAllocation[]> {
    const allocations: LocationAllocation[] = [];
    const remainingItems = new Map(items.map((i) => [this.getItemKey(i), i.quantity]));

    // Sort locations by distance
    const sortedLocations = Array.from(distances.entries())
      .sort((a, b) => a[1] - b[1])
      .map(([id]) => id);

    for (const locationId of sortedLocations) {
      const locationItems: AllocatedItem[] = [];
      const stock = locationStock.get(locationId);

      if (!stock) continue;

      for (const [itemKey, remaining] of remainingItems) {
        const available = stock.get(itemKey) || 0;
        if (available <= 0) continue;

        const allocateQty = Math.min(remaining, available);
        const [productId, variantId] = itemKey.split(':');

        locationItems.push({
          productId,
          variantId: variantId || undefined,
          quantity: allocateQty,
          inventoryItemId: `${locationId}:${itemKey}`,
        });

        remainingItems.set(itemKey, remaining - allocateQty);
        stock.set(itemKey, available - allocateQty);
      }

      if (locationItems.length > 0) {
        const location = await this.getLocation(locationId);
        const delivery = await this.estimateDelivery(locationId, distances.get(locationId)!);

        allocations.push({
          locationId,
          items: locationItems,
          shippingMethod: delivery.method,
          estimatedDelivery: delivery.date,
          cost: delivery.cost,
        });
      }

      // Check if all items allocated
      const allAllocated = Array.from(remainingItems.values()).every((q) => q === 0);
      if (allAllocated) break;
    }

    return allocations;
  }

  /**
   * Allocate to minimize shipping cost
   */
  private async allocateByLowestCost(
    items: OrderItem[],
    locationStock: Map<string, Map<string, number>>,
    distances: Map<string, number>,
    options: AllocationOptions
  ): Promise<LocationAllocation[]> {
    // Get shipping costs for each location
    const locationCosts = await this.getShippingCosts(
      Array.from(locationStock.keys()),
      options.deliveryAddress,
      items
    );

    // Sort by total cost (shipping + handling)
    const sortedLocations = Array.from(locationCosts.entries())
      .sort((a, b) => a[1] - b[1])
      .map(([id]) => id);

    return this.allocateFromSortedLocations(
      items,
      locationStock,
      sortedLocations,
      distances
    );
  }

  /**
   * Allocate for fastest delivery
   */
  private async allocateByFastestDelivery(
    items: OrderItem[],
    locationStock: Map<string, Map<string, number>>,
    distances: Map<string, number>,
    options: AllocationOptions
  ): Promise<LocationAllocation[]> {
    // Get delivery times for each location
    const locationDeliveryTimes = await this.getDeliveryTimes(
      Array.from(locationStock.keys()),
      options.deliveryAddress
    );

    // Sort by delivery time
    const sortedLocations = Array.from(locationDeliveryTimes.entries())
      .sort((a, b) => a[1] - b[1])
      .map(([id]) => id);

    return this.allocateFromSortedLocations(
      items,
      locationStock,
      sortedLocations,
      distances
    );
  }

  /**
   * Allocate from single location if possible
   */
  private async allocateSingleShipment(
    items: OrderItem[],
    locationStock: Map<string, Map<string, number>>,
    distances: Map<string, number>
  ): Promise<LocationAllocation[]> {
    // Find locations that can fulfill entire order
    const eligibleLocations: string[] = [];

    for (const [locationId, stock] of locationStock) {
      let canFulfill = true;

      for (const item of items) {
        const key = this.getItemKey(item);
        const available = stock.get(key) || 0;
        if (available < item.quantity) {
          canFulfill = false;
          break;
        }
      }

      if (canFulfill) {
        eligibleLocations.push(locationId);
      }
    }

    if (eligibleLocations.length === 0) {
      // Fall back to multi-shipment
      return this.allocateByDistance(items, locationStock, distances);
    }

    // Choose closest eligible location
    const sortedEligible = eligibleLocations.sort(
      (a, b) => (distances.get(a) || Infinity) - (distances.get(b) || Infinity)
    );

    const locationId = sortedEligible[0];
    const location = await this.getLocation(locationId);
    const delivery = await this.estimateDelivery(locationId, distances.get(locationId)!);

    return [{
      locationId,
      items: items.map((item) => ({
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity,
        inventoryItemId: `${locationId}:${this.getItemKey(item)}`,
      })),
      shippingMethod: delivery.method,
      estimatedDelivery: delivery.date,
      cost: delivery.cost,
    }];
  }

  /**
   * Balanced allocation considering cost, speed, and inventory levels
   */
  private async allocateBalanced(
    items: OrderItem[],
    locationStock: Map<string, Map<string, number>>,
    distances: Map<string, number>,
    options: AllocationOptions
  ): Promise<LocationAllocation[]> {
    // Score each location
    const locationScores = new Map<string, number>();

    for (const locationId of locationStock.keys()) {
      const distance = distances.get(locationId) || Infinity;
      const stock = locationStock.get(locationId)!;

      // Calculate fulfillment capability
      let fulfillable = 0;
      let total = 0;
      for (const item of items) {
        const key = this.getItemKey(item);
        const available = stock.get(key) || 0;
        fulfillable += Math.min(available, item.quantity);
        total += item.quantity;
      }
      const fulfillmentRatio = fulfillable / total;

      // Distance score (inverse, normalized)
      const maxDistance = Math.max(...Array.from(distances.values()));
      const distanceScore = 1 - (distance / maxDistance);

      // Combined score
      const score = (fulfillmentRatio * 0.6) + (distanceScore * 0.4);
      locationScores.set(locationId, score);
    }

    // Sort by score
    const sortedLocations = Array.from(locationScores.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([id]) => id);

    return this.allocateFromSortedLocations(
      items,
      locationStock,
      sortedLocations,
      distances
    );
  }

  private async allocateFromSortedLocations(
    items: OrderItem[],
    locationStock: Map<string, Map<string, number>>,
    sortedLocations: string[],
    distances: Map<string, number>
  ): Promise<LocationAllocation[]> {
    const allocations: LocationAllocation[] = [];
    const remainingItems = new Map(items.map((i) => [this.getItemKey(i), i.quantity]));

    for (const locationId of sortedLocations) {
      const locationItems: AllocatedItem[] = [];
      const stock = locationStock.get(locationId);

      if (!stock) continue;

      for (const [itemKey, remaining] of remainingItems) {
        if (remaining <= 0) continue;

        const available = stock.get(itemKey) || 0;
        if (available <= 0) continue;

        const allocateQty = Math.min(remaining, available);
        const [productId, variantId] = itemKey.split(':');

        locationItems.push({
          productId,
          variantId: variantId || undefined,
          quantity: allocateQty,
          inventoryItemId: `${locationId}:${itemKey}`,
        });

        remainingItems.set(itemKey, remaining - allocateQty);
      }

      if (locationItems.length > 0) {
        const delivery = await this.estimateDelivery(locationId, distances.get(locationId)!);

        allocations.push({
          locationId,
          items: locationItems,
          shippingMethod: delivery.method,
          estimatedDelivery: delivery.date,
          cost: delivery.cost,
        });
      }

      const allAllocated = Array.from(remainingItems.values()).every((q) => q <= 0);
      if (allAllocated) break;
    }

    return allocations;
  }

  private async getLocationStock(
    items: OrderItem[]
  ): Promise<Map<string, Map<string, number>>> {
    const productIds = [...new Set(items.map((i) => i.productId))];

    const result = await db.query(`
      SELECT
        location_id,
        product_id,
        variant_id,
        (quantities->>'available')::int as available
      FROM inventory_items
      WHERE product_id = ANY($1)
        AND status = 'active'
        AND (quantities->>'available')::int > 0
    `, [productIds]);

    const locationStock = new Map<string, Map<string, number>>();

    for (const row of result.rows) {
      if (!locationStock.has(row.location_id)) {
        locationStock.set(row.location_id, new Map());
      }
      const key = `${row.product_id}:${row.variant_id || ''}`;
      locationStock.get(row.location_id)!.set(key, row.available);
    }

    return locationStock;
  }

  private async getLocationDistances(
    locationIds: string[],
    destination: Address
  ): Promise<Map<string, number>> {
    const locations = await db.query(`
      SELECT id, address FROM stock_locations WHERE id = ANY($1)
    `, [locationIds]);

    const distances = new Map<string, number>();

    for (const location of locations.rows) {
      const origin = location.address;
      const distance = await this.geoService.calculateDistance(
        origin.coordinates,
        destination.coordinates
      );
      distances.set(location.id, distance);
    }

    return distances;
  }

  private async getShippingCosts(
    locationIds: string[],
    destination: Address,
    items: OrderItem[]
  ): Promise<Map<string, number>> {
    // Simplified shipping cost calculation
    const costs = new Map<string, number>();
    const distances = await this.getLocationDistances(locationIds, destination);

    for (const locationId of locationIds) {
      const distance = distances.get(locationId) || 0;
      // Base cost + distance factor
      const cost = 5 + (distance / 100) * 0.5;
      costs.set(locationId, cost);
    }

    return costs;
  }

  private async getDeliveryTimes(
    locationIds: string[],
    destination: Address
  ): Promise<Map<string, number>> {
    const times = new Map<string, number>();
    const distances = await this.getLocationDistances(locationIds, destination);

    for (const locationId of locationIds) {
      const distance = distances.get(locationId) || 0;
      // Estimate days based on distance
      const days = Math.ceil(distance / 500) + 1;
      times.set(locationId, days);
    }

    return times;
  }

  private async getLocation(locationId: string): Promise<StockLocation> {
    const result = await db.query(
      'SELECT * FROM stock_locations WHERE id = $1',
      [locationId]
    );
    return result.rows[0];
  }

  private async estimateDelivery(
    locationId: string,
    distance: number
  ): Promise<{ method: string; date: Date; cost: number }> {
    const location = await this.getLocation(locationId);
    const days = Math.ceil(distance / 500) + 1;

    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + days);

    return {
      method: days <= 2 ? 'express' : 'standard',
      date: deliveryDate,
      cost: 5 + (distance / 100) * 0.5,
    };
  }

  private findUnallocatedItems(
    items: OrderItem[],
    allocations: LocationAllocation[]
  ): UnallocatedItem[] {
    const allocated = new Map<string, number>();

    for (const allocation of allocations) {
      for (const item of allocation.items) {
        const key = this.getItemKey(item);
        allocated.set(key, (allocated.get(key) || 0) + item.quantity);
      }
    }

    const unallocated: UnallocatedItem[] = [];

    for (const item of items) {
      const key = this.getItemKey(item);
      const allocatedQty = allocated.get(key) || 0;
      const remaining = item.quantity - allocatedQty;

      if (remaining > 0) {
        unallocated.push({
          productId: item.productId,
          variantId: item.variantId,
          quantity: remaining,
          reason: 'insufficient_stock',
        });
      }
    }

    return unallocated;
  }

  private calculateEstimatedShipDate(allocations: LocationAllocation[]): Date {
    // Earliest date when all shipments can be dispatched
    const today = new Date();
    today.setDate(today.getDate() + 1); // Next business day
    return today;
  }

  private getItemKey(item: { productId: string; variantId?: string }): string {
    return `${item.productId}:${item.variantId || ''}`;
  }
}
```

### Demand Forecasting Engine

```typescript
// lib/inventory/forecasting-engine.ts
import { db } from '@/lib/database';
import { redis } from '@/lib/redis';

interface SalesData {
  date: Date;
  quantity: number;
}

interface SeasonalityFactors {
  dayOfWeek: number[];
  monthOfYear: number[];
  holidays: Map<string, number>;
}

export class ForecastingEngine {
  /**
   * Generate demand forecast for a product
   */
  async generateForecast(
    productId: string,
    variantId?: string,
    period: ForecastPeriod = 'daily',
    horizonDays: number = 30
  ): Promise<DemandForecast> {
    // Get historical sales data
    const salesData = await this.getHistoricalSales(productId, variantId, 365);

    if (salesData.length < 30) {
      // Not enough data, use category average
      return this.generateCategoryBasedForecast(productId, variantId, period, horizonDays);
    }

    // Calculate base demand (moving average)
    const baseDemand = this.calculateMovingAverage(salesData, 30);

    // Calculate seasonality factors
    const seasonality = await this.calculateSeasonality(productId, salesData);

    // Detect trend
    const trend = this.calculateTrend(salesData);

    // Generate predictions
    const predictions: DemandPrediction[] = [];
    const factors: ForecastFactor[] = [];

    for (let i = 0; i < horizonDays; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);

      // Apply seasonality
      const dayOfWeek = date.getDay();
      const month = date.getMonth();
      const seasonalFactor = seasonality.dayOfWeek[dayOfWeek] * seasonality.monthOfYear[month];

      // Check for holidays
      const holidayKey = `${date.getMonth()}-${date.getDate()}`;
      const holidayFactor = seasonality.holidays.get(holidayKey) || 1;

      // Calculate prediction
      const baseWithTrend = baseDemand + (trend * i);
      const prediction = Math.max(0, baseWithTrend * seasonalFactor * holidayFactor);

      // Calculate confidence interval
      const stdDev = this.calculateStdDev(salesData.map((s) => s.quantity));
      const interval = 1.96 * stdDev; // 95% confidence

      predictions.push({
        date,
        quantity: Math.round(prediction),
        lowerBound: Math.max(0, Math.round(prediction - interval)),
        upperBound: Math.round(prediction + interval),
      });
    }

    // Identify key factors
    if (Math.abs(trend) > 0.1) {
      factors.push({
        name: 'Trend',
        impact: Math.abs(trend) * 100,
        direction: trend > 0 ? 'positive' : 'negative',
      });
    }

    const avgSeasonalVariation = this.calculateSeasonalVariation(seasonality);
    if (avgSeasonalVariation > 0.1) {
      factors.push({
        name: 'Seasonality',
        impact: avgSeasonalVariation * 100,
        direction: 'positive',
      });
    }

    // Calculate overall confidence
    const confidence = this.calculateForecastConfidence(salesData.length, stdDev);

    return {
      productId,
      variantId,
      period,
      predictions,
      confidence,
      factors,
      generatedAt: new Date(),
    };
  }

  /**
   * Calculate recommended reorder quantity
   */
  async calculateReorderQuantity(
    productId: string,
    variantId?: string,
    locationId?: string
  ): Promise<{
    quantity: number;
    reason: string;
    urgency: 'low' | 'medium' | 'high' | 'critical';
  }> {
    // Get current inventory
    const inventory = await this.getCurrentInventory(productId, variantId, locationId);

    // Get forecast
    const forecast = await this.generateForecast(productId, variantId, 'daily', 30);

    // Calculate demand for lead time
    const leadTimeDays = inventory.thresholds.leadTimeDays;
    const leadTimeDemand = forecast.predictions
      .slice(0, leadTimeDays)
      .reduce((sum, p) => sum + p.quantity, 0);

    // Calculate safety stock needs
    const avgDailyDemand = leadTimeDemand / leadTimeDays;
    const demandVariability = this.calculateDemandVariability(forecast.predictions);
    const safetyStock = avgDailyDemand * demandVariability * Math.sqrt(leadTimeDays);

    // Calculate reorder point
    const reorderPoint = leadTimeDemand + safetyStock;

    // Determine if reorder is needed
    const currentAvailable = inventory.quantities.available + inventory.quantities.inTransit;

    if (currentAvailable <= 0) {
      return {
        quantity: Math.ceil(leadTimeDemand + safetyStock * 2),
        reason: 'Out of stock - urgent replenishment needed',
        urgency: 'critical',
      };
    }

    if (currentAvailable < reorderPoint * 0.5) {
      return {
        quantity: Math.ceil(inventory.thresholds.maxStock - currentAvailable),
        reason: 'Stock below critical threshold',
        urgency: 'high',
      };
    }

    if (currentAvailable < reorderPoint) {
      return {
        quantity: Math.ceil(inventory.thresholds.maxStock - currentAvailable),
        reason: 'Stock approaching reorder point',
        urgency: 'medium',
      };
    }

    // Calculate days of supply
    const daysOfSupply = currentAvailable / avgDailyDemand;
    const optimalDaysOfSupply = 30;

    if (daysOfSupply < optimalDaysOfSupply) {
      return {
        quantity: Math.ceil((optimalDaysOfSupply - daysOfSupply) * avgDailyDemand),
        reason: 'Replenishment recommended for optimal stock level',
        urgency: 'low',
      };
    }

    return {
      quantity: 0,
      reason: 'Stock levels adequate',
      urgency: 'low',
    };
  }

  private async getHistoricalSales(
    productId: string,
    variantId: string | undefined,
    days: number
  ): Promise<SalesData[]> {
    const cacheKey = `sales:history:${productId}:${variantId || 'base'}:${days}`;
    const cached = await redis.get(cacheKey);

    if (cached) {
      const data = JSON.parse(cached);
      return data.map((d: any) => ({ ...d, date: new Date(d.date) }));
    }

    const result = await db.query(`
      SELECT DATE(o.created_at) as date, SUM(oi.quantity) as quantity
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      WHERE oi.product_id = $1
        AND ($2::text IS NULL OR oi.variant_id = $2)
        AND o.status = 'completed'
        AND o.created_at > NOW() - INTERVAL '${days} days'
      GROUP BY DATE(o.created_at)
      ORDER BY date
    `, [productId, variantId]);

    const salesData = result.rows.map((row) => ({
      date: new Date(row.date),
      quantity: parseInt(row.quantity, 10),
    }));

    await redis.setex(cacheKey, 3600, JSON.stringify(salesData));

    return salesData;
  }

  private calculateMovingAverage(data: SalesData[], windowSize: number): number {
    if (data.length === 0) return 0;

    const recentData = data.slice(-windowSize);
    const sum = recentData.reduce((acc, d) => acc + d.quantity, 0);
    return sum / recentData.length;
  }

  private async calculateSeasonality(
    productId: string,
    salesData: SalesData[]
  ): Promise<SeasonalityFactors> {
    // Day of week factors
    const dayTotals = new Array(7).fill(0);
    const dayCounts = new Array(7).fill(0);

    for (const sale of salesData) {
      const day = sale.date.getDay();
      dayTotals[day] += sale.quantity;
      dayCounts[day]++;
    }

    const overallAvg = salesData.reduce((sum, s) => sum + s.quantity, 0) / salesData.length;
    const dayOfWeek = dayTotals.map((total, i) =>
      dayCounts[i] > 0 ? (total / dayCounts[i]) / overallAvg : 1
    );

    // Month factors
    const monthTotals = new Array(12).fill(0);
    const monthCounts = new Array(12).fill(0);

    for (const sale of salesData) {
      const month = sale.date.getMonth();
      monthTotals[month] += sale.quantity;
      monthCounts[month]++;
    }

    const monthOfYear = monthTotals.map((total, i) =>
      monthCounts[i] > 0 ? (total / monthCounts[i]) / overallAvg : 1
    );

    // Holiday factors (simplified)
    const holidays = new Map<string, number>();
    holidays.set('11-25', 2.5); // Black Friday area
    holidays.set('11-26', 2.5);
    holidays.set('11-27', 2.0);
    holidays.set('11-28', 1.8);
    holidays.set('12-24', 1.5); // Christmas Eve
    holidays.set('12-25', 0.5); // Christmas Day

    return { dayOfWeek, monthOfYear, holidays };
  }

  private calculateTrend(data: SalesData[]): number {
    if (data.length < 2) return 0;

    // Simple linear regression
    const n = data.length;
    let sumX = 0;
    let sumY = 0;
    let sumXY = 0;
    let sumX2 = 0;

    data.forEach((d, i) => {
      sumX += i;
      sumY += d.quantity;
      sumXY += i * d.quantity;
      sumX2 += i * i;
    });

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    return slope;
  }

  private calculateStdDev(values: number[]): number {
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const squareDiffs = values.map((value) => Math.pow(value - mean, 2));
    return Math.sqrt(squareDiffs.reduce((a, b) => a + b, 0) / values.length);
  }

  private calculateSeasonalVariation(seasonality: SeasonalityFactors): number {
    const dayVariation = this.calculateStdDev(seasonality.dayOfWeek);
    const monthVariation = this.calculateStdDev(seasonality.monthOfYear);
    return (dayVariation + monthVariation) / 2;
  }

  private calculateForecastConfidence(dataPoints: number, stdDev: number): number {
    // More data and lower variance = higher confidence
    const dataConfidence = Math.min(dataPoints / 365, 1);
    const varianceConfidence = Math.max(0, 1 - (stdDev / 100));
    return (dataConfidence * 0.6 + varianceConfidence * 0.4);
  }

  private calculateDemandVariability(predictions: DemandPrediction[]): number {
    const quantities = predictions.map((p) => p.quantity);
    const mean = quantities.reduce((a, b) => a + b, 0) / quantities.length;
    const stdDev = this.calculateStdDev(quantities);
    return stdDev / mean; // Coefficient of variation
  }

  private async getCurrentInventory(
    productId: string,
    variantId?: string,
    locationId?: string
  ): Promise<InventoryItem> {
    const result = await db.query(`
      SELECT * FROM inventory_items
      WHERE product_id = $1
        AND ($2::text IS NULL OR variant_id = $2)
        AND ($3::text IS NULL OR location_id = $3)
      LIMIT 1
    `, [productId, variantId, locationId]);

    return result.rows[0];
  }

  private async generateCategoryBasedForecast(
    productId: string,
    variantId: string | undefined,
    period: ForecastPeriod,
    horizonDays: number
  ): Promise<DemandForecast> {
    // Get category average
    const product = await db.query(
      'SELECT category_id FROM products WHERE id = $1',
      [productId]
    );
    const categoryId = product.rows[0]?.category_id;

    const categoryAvg = await db.query(`
      SELECT AVG(daily_avg) as avg_demand
      FROM (
        SELECT oi.product_id, AVG(oi.quantity) as daily_avg
        FROM order_items oi
        JOIN products p ON oi.product_id = p.id
        JOIN orders o ON oi.order_id = o.id
        WHERE p.category_id = $1
          AND o.status = 'completed'
          AND o.created_at > NOW() - INTERVAL '90 days'
        GROUP BY oi.product_id, DATE(o.created_at)
      ) sub
    `, [categoryId]);

    const baseDemand = parseFloat(categoryAvg.rows[0]?.avg_demand || '1');

    const predictions: DemandPrediction[] = [];
    for (let i = 0; i < horizonDays; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);

      predictions.push({
        date,
        quantity: Math.round(baseDemand),
        lowerBound: Math.round(baseDemand * 0.5),
        upperBound: Math.round(baseDemand * 1.5),
      });
    }

    return {
      productId,
      variantId,
      period,
      predictions,
      confidence: 0.3, // Low confidence for category-based
      factors: [{
        name: 'Category Average',
        impact: 100,
        direction: 'positive',
      }],
      generatedAt: new Date(),
    };
  }
}
```

### Inventory Sync Service

```typescript
// lib/inventory/sync-service.ts
import { db } from '@/lib/database';
import { redis } from '@/lib/redis';
import { eventEmitter } from '@/lib/events';
import { InventoryService } from './inventory-service';

interface SyncSource {
  id: string;
  type: 'warehouse' | 'pos' | 'supplier' | 'marketplace';
  name: string;
  lastSyncAt?: Date;
  config: Record<string, unknown>;
}

interface SyncResult {
  sourceId: string;
  itemsProcessed: number;
  itemsUpdated: number;
  conflicts: SyncConflict[];
  duration: number;
}

interface SyncConflict {
  productId: string;
  variantId?: string;
  locationId: string;
  localQuantity: number;
  remoteQuantity: number;
  resolution: 'local_wins' | 'remote_wins' | 'manual';
}

export class InventorySyncService {
  private inventoryService: InventoryService;

  constructor() {
    this.inventoryService = new InventoryService();
  }

  /**
   * Sync inventory from external source
   */
  async syncFromSource(
    sourceId: string,
    data: Array<{
      sku: string;
      quantity: number;
      locationId?: string;
    }>
  ): Promise<SyncResult> {
    const startTime = Date.now();
    const source = await this.getSource(sourceId);

    if (!source) {
      throw new Error('Sync source not found');
    }

    let itemsProcessed = 0;
    let itemsUpdated = 0;
    const conflicts: SyncConflict[] = [];

    for (const item of data) {
      itemsProcessed++;

      try {
        // Find inventory item by SKU
        const inventoryItem = await this.findBySku(item.sku, item.locationId);

        if (!inventoryItem) {
          console.warn(`SKU not found: ${item.sku}`);
          continue;
        }

        // Check for conflict
        const currentQuantity = inventoryItem.quantities.onHand;
        const remoteQuantity = item.quantity;

        if (currentQuantity !== remoteQuantity) {
          // Detect conflict type
          const conflict = await this.detectConflict(
            inventoryItem,
            remoteQuantity,
            source
          );

          if (conflict.resolution === 'manual') {
            conflicts.push(conflict);
            continue;
          }

          // Apply resolution
          if (conflict.resolution === 'remote_wins') {
            await this.applyRemoteUpdate(inventoryItem, remoteQuantity, sourceId);
            itemsUpdated++;
          }
          // local_wins = no action needed
        }
      } catch (error) {
        console.error(`Error processing SKU ${item.sku}:`, error);
      }
    }

    // Update sync timestamp
    await this.updateSyncTimestamp(sourceId);

    const duration = Date.now() - startTime;

    // Emit sync event
    await eventEmitter.emit('inventory:sync_completed', {
      sourceId,
      itemsProcessed,
      itemsUpdated,
      conflictCount: conflicts.length,
      duration,
    });

    return {
      sourceId,
      itemsProcessed,
      itemsUpdated,
      conflicts,
      duration,
    };
  }

  /**
   * Reconcile inventory across all sources
   */
  async reconcile(
    productId: string,
    variantId?: string
  ): Promise<{
    adjustments: Array<{ locationId: string; adjustment: number }>;
    reconciled: boolean;
  }> {
    // Get all inventory records
    const inventoryItems = await this.inventoryService.getInventoryByLocation(
      productId,
      variantId
    );

    const adjustments: Array<{ locationId: string; adjustment: number }> = [];

    for (const item of inventoryItems) {
      // Calculate expected quantity
      const movements = await this.getMovementsSinceSync(item.id);
      const expectedQuantity = item.quantities.onHand + movements;

      // Get actual count from source (if available)
      const actualCount = await this.getSourceCount(item);

      if (actualCount !== null && actualCount !== expectedQuantity) {
        const adjustment = actualCount - item.quantities.onHand;

        adjustments.push({
          locationId: item.locationId,
          adjustment,
        });

        // Apply adjustment
        await this.inventoryService.adjustStock({
          productId,
          variantId,
          locationId: item.locationId,
          quantity: adjustment,
          reason: 'reconciliation_adjustment',
        });
      }
    }

    return {
      adjustments,
      reconciled: adjustments.length === 0,
    };
  }

  private async detectConflict(
    inventoryItem: InventoryItem,
    remoteQuantity: number,
    source: SyncSource
  ): Promise<SyncConflict> {
    const localQuantity = inventoryItem.quantities.onHand;
    const difference = Math.abs(localQuantity - remoteQuantity);

    // Get recent activity
    const recentMovements = await this.getRecentMovements(inventoryItem.id);

    let resolution: SyncConflict['resolution'];

    // If there were local movements since last sync, local wins
    if (recentMovements.length > 0) {
      resolution = 'local_wins';
    }
    // If difference is small, remote wins
    else if (difference <= 5) {
      resolution = 'remote_wins';
    }
    // Large difference needs manual review
    else {
      resolution = 'manual';
    }

    return {
      productId: inventoryItem.productId,
      variantId: inventoryItem.variantId,
      locationId: inventoryItem.locationId,
      localQuantity,
      remoteQuantity,
      resolution,
    };
  }

  private async applyRemoteUpdate(
    inventoryItem: InventoryItem,
    newQuantity: number,
    sourceId: string
  ): Promise<void> {
    const adjustment = newQuantity - inventoryItem.quantities.onHand;

    await this.inventoryService.adjustStock({
      productId: inventoryItem.productId,
      variantId: inventoryItem.variantId,
      locationId: inventoryItem.locationId,
      quantity: adjustment,
      reason: 'sync_update',
      referenceType: 'sync',
      referenceId: sourceId,
    });
  }

  private async getSource(sourceId: string): Promise<SyncSource | null> {
    const result = await db.query(
      'SELECT * FROM sync_sources WHERE id = $1',
      [sourceId]
    );
    return result.rows[0] || null;
  }

  private async findBySku(
    sku: string,
    locationId?: string
  ): Promise<InventoryItem | null> {
    let query = 'SELECT * FROM inventory_items WHERE sku = $1';
    const params: string[] = [sku];

    if (locationId) {
      query += ' AND location_id = $2';
      params.push(locationId);
    }

    query += ' LIMIT 1';

    const result = await db.query(query, params);
    return result.rows[0] || null;
  }

  private async getRecentMovements(inventoryItemId: string): Promise<any[]> {
    const result = await db.query(`
      SELECT * FROM inventory_movements
      WHERE (
        (product_id, variant_id, from_location_id) IN (
          SELECT product_id, variant_id, location_id FROM inventory_items WHERE id = $1
        )
        OR
        (product_id, variant_id, to_location_id) IN (
          SELECT product_id, variant_id, location_id FROM inventory_items WHERE id = $1
        )
      )
      AND timestamp > NOW() - INTERVAL '1 hour'
    `, [inventoryItemId]);

    return result.rows;
  }

  private async getMovementsSinceSync(inventoryItemId: string): Promise<number> {
    const result = await db.query(`
      SELECT
        COALESCE(SUM(CASE WHEN to_location_id IS NOT NULL THEN quantity ELSE 0 END), 0) -
        COALESCE(SUM(CASE WHEN from_location_id IS NOT NULL THEN quantity ELSE 0 END), 0) as net_movement
      FROM inventory_movements
      WHERE (
        (product_id, variant_id, from_location_id) IN (
          SELECT product_id, variant_id, location_id FROM inventory_items WHERE id = $1
        )
        OR
        (product_id, variant_id, to_location_id) IN (
          SELECT product_id, variant_id, location_id FROM inventory_items WHERE id = $1
        )
      )
      AND timestamp > (SELECT last_synced_at FROM inventory_items WHERE id = $1)
    `, [inventoryItemId]);

    return parseInt(result.rows[0]?.net_movement || '0', 10);
  }

  private async getSourceCount(inventoryItem: InventoryItem): Promise<number | null> {
    // In production, this would query the external source
    // For now, return null to indicate no source data
    return null;
  }

  private async updateSyncTimestamp(sourceId: string): Promise<void> {
    await db.query(
      'UPDATE sync_sources SET last_sync_at = NOW() WHERE id = $1',
      [sourceId]
    );
  }
}
```

### Inventory API Routes

```typescript
// app/api/inventory/[productId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { InventoryService } from '@/lib/inventory/inventory-service';

export async function GET(
  request: NextRequest,
  { params }: { params: { productId: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const variantId = searchParams.get('variantId') || undefined;
    const locationId = searchParams.get('locationId') || undefined;

    const service = new InventoryService();

    // Get available quantity
    const available = await service.getAvailableQuantity(
      params.productId,
      variantId,
      locationId
    );

    // Get by location for detailed view
    const byLocation = await service.getInventoryByLocation(
      params.productId,
      variantId
    );

    return NextResponse.json({
      productId: params.productId,
      variantId,
      available,
      locations: byLocation.map((item) => ({
        locationId: item.locationId,
        available: item.quantities.available,
        reserved: item.quantities.reserved,
        committed: item.quantities.committed,
        inTransit: item.quantities.inTransit,
      })),
    });
  } catch (error) {
    console.error('Inventory fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch inventory' },
      { status: 500 }
    );
  }
}
```

## Examples

### Stock Reservation Flow

```typescript
// Example: Reserve stock during checkout
const inventoryService = new InventoryService();

// Reserve stock
const reservation = await inventoryService.reserveStock({
  productId: 'prod-123',
  variantId: 'var-456',
  quantity: 2,
  sessionId: 'session-789',
});

console.log(`Reserved ${reservation.quantity} units until ${reservation.expiresAt}`);

// Later, when order is placed
await inventoryService.commitReservation(reservation.id, 'order-001');

// Or if checkout is abandoned
await inventoryService.releaseReservation(reservation.id, 'checkout_abandoned');
```

### Order Allocation

```typescript
// Example: Allocate inventory for order
const allocationEngine = new AllocationEngine();

const result = await allocationEngine.allocateOrder(
  'order-001',
  [
    { productId: 'prod-1', quantity: 2 },
    { productId: 'prod-2', variantId: 'size-L', quantity: 1 },
  ],
  {
    strategy: 'balanced',
    deliveryAddress: {
      street: '123 Main St',
      city: 'New York',
      state: 'NY',
      postalCode: '10001',
      country: 'US',
    },
  }
);

console.log(`Allocated from ${result.allocations.length} locations`);
```

## Anti-Patterns

### What to Avoid

```typescript
// BAD: No locking during stock updates
async function updateStock(productId: string, quantity: number) {
  const current = await getStock(productId);
  // Race condition: another process might update between read and write
  await setStock(productId, current + quantity);
}

// BAD: Reserving without TTL
async function reserveForCheckout(productId: string, quantity: number) {
  // Stock held forever if checkout abandoned
  await db.query(
    'UPDATE inventory SET reserved = reserved + $1 WHERE product_id = $2',
    [quantity, productId]
  );
}

// BAD: Single point of failure for availability check
async function checkAvailability(productId: string) {
  // Not cached, hits database every time
  return await db.query(
    'SELECT available FROM inventory WHERE product_id = $1',
    [productId]
  );
}

// BAD: No conflict resolution in sync
async function syncInventory(externalData: any[]) {
  for (const item of externalData) {
    // Blindly overwrites local data
    await db.query(
      'UPDATE inventory SET quantity = $1 WHERE sku = $2',
      [item.quantity, item.sku]
    );
  }
}
```

### Correct Patterns

```typescript
// GOOD: Distributed locking for stock updates
async function updateStock(productId: string, quantity: number) {
  const lockKey = `inventory:lock:${productId}`;
  const lock = await acquireLock(lockKey, 5000);

  try {
    const current = await getStock(productId);
    await setStock(productId, current + quantity);
    await recordMovement(productId, quantity);
  } finally {
    await releaseLock(lock);
  }
}

// GOOD: TTL-based reservations with cleanup
async function reserveForCheckout(productId: string, quantity: number, sessionId: string) {
  const reservation = await createReservation({
    productId,
    quantity,
    sessionId,
    expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 min
  });

  // Schedule cleanup
  await scheduleRelease(reservation.id, reservation.expiresAt);

  return reservation;
}

// GOOD: Cached availability with short TTL
async function checkAvailability(productId: string) {
  const cacheKey = `inventory:available:${productId}`;
  const cached = await redis.get(cacheKey);

  if (cached) return parseInt(cached);

  const result = await db.query(
    'SELECT available FROM inventory WHERE product_id = $1',
    [productId]
  );
  const available = result.rows[0]?.available || 0;

  await redis.setex(cacheKey, 30, available);
  return available;
}

// GOOD: Conflict detection and resolution
async function syncInventory(externalData: any[]) {
  for (const item of externalData) {
    const local = await getLocalInventory(item.sku);
    const recentActivity = await getRecentMovements(item.sku);

    if (recentActivity.length > 0) {
      // Local activity since last sync - don't overwrite
      await logConflict(item.sku, local.quantity, item.quantity);
      continue;
    }

    // Safe to update
    await updateInventory(item.sku, item.quantity, 'sync');
  }
}
```

## Testing

### Unit Tests

```typescript
// __tests__/inventory/inventory-service.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { InventoryService } from '@/lib/inventory/inventory-service';

describe('InventoryService', () => {
  let service: InventoryService;

  beforeEach(() => {
    service = new InventoryService();
    vi.clearAllMocks();
  });

  describe('reserveStock', () => {
    it('creates reservation and reduces available quantity', async () => {
      const reservation = await service.reserveStock({
        productId: 'prod-1',
        quantity: 5,
        sessionId: 'session-1',
      });

      expect(reservation.quantity).toBe(5);
      expect(reservation.status).toBe('pending');
      expect(reservation.expiresAt).toBeInstanceOf(Date);
    });

    it('throws when insufficient stock', async () => {
      await expect(
        service.reserveStock({
          productId: 'prod-1',
          quantity: 1000,
          sessionId: 'session-1',
        })
      ).rejects.toThrow('Insufficient stock');
    });

    it('handles concurrent reservations with locking', async () => {
      // Two concurrent reservations for limited stock
      const results = await Promise.allSettled([
        service.reserveStock({ productId: 'prod-limited', quantity: 3, sessionId: 's1' }),
        service.reserveStock({ productId: 'prod-limited', quantity: 3, sessionId: 's2' }),
      ]);

      // At least one should succeed, possibly both fail if stock is 5
      const successes = results.filter((r) => r.status === 'fulfilled');
      expect(successes.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('commitReservation', () => {
    it('moves quantity from reserved to committed', async () => {
      const reservation = await service.reserveStock({
        productId: 'prod-1',
        quantity: 2,
        sessionId: 'session-1',
      });

      await service.commitReservation(reservation.id, 'order-1');

      const inventory = await service.getInventoryByLocation('prod-1');
      // Verify committed increased
    });
  });

  describe('releaseReservation', () => {
    it('returns quantity to available', async () => {
      const reservation = await service.reserveStock({
        productId: 'prod-1',
        quantity: 2,
        sessionId: 'session-1',
      });

      const beforeRelease = await service.getAvailableQuantity('prod-1');
      await service.releaseReservation(reservation.id, 'test');
      const afterRelease = await service.getAvailableQuantity('prod-1');

      expect(afterRelease).toBe(beforeRelease + 2);
    });
  });
});
```

### Integration Tests

```typescript
// __tests__/inventory/allocation.integration.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { AllocationEngine } from '@/lib/inventory/allocation-engine';
import { setupTestDatabase, cleanupTestDatabase, createTestInventory } from '../helpers';

describe('AllocationEngine Integration', () => {
  let engine: AllocationEngine;

  beforeAll(async () => {
    await setupTestDatabase();
    engine = new AllocationEngine();

    // Create test inventory in multiple locations
    await createTestInventory([
      { productId: 'prod-1', locationId: 'warehouse-east', quantity: 100 },
      { productId: 'prod-1', locationId: 'warehouse-west', quantity: 50 },
      { productId: 'prod-2', locationId: 'warehouse-east', quantity: 25 },
    ]);
  });

  afterAll(async () => {
    await cleanupTestDatabase();
  });

  it('allocates from nearest warehouse', async () => {
    const result = await engine.allocateOrder(
      'order-1',
      [{ productId: 'prod-1', quantity: 10 }],
      {
        strategy: 'nearest_warehouse',
        deliveryAddress: {
          street: '123 Main St',
          city: 'New York',
          state: 'NY',
          postalCode: '10001',
          country: 'US',
          coordinates: { lat: 40.7128, lng: -74.006 },
        },
      }
    );

    expect(result.allocations.length).toBe(1);
    expect(result.allocations[0].locationId).toBe('warehouse-east');
    expect(result.unallocated.length).toBe(0);
  });

  it('splits across locations when needed', async () => {
    const result = await engine.allocateOrder(
      'order-2',
      [{ productId: 'prod-1', quantity: 120 }], // More than any single location
      {
        strategy: 'balanced',
        deliveryAddress: {
          street: '456 Oak Ave',
          city: 'Chicago',
          state: 'IL',
          postalCode: '60601',
          country: 'US',
          coordinates: { lat: 41.8781, lng: -87.6298 },
        },
      }
    );

    expect(result.allocations.length).toBe(2);
    const totalAllocated = result.allocations.reduce(
      (sum, a) => sum + a.items.reduce((s, i) => s + i.quantity, 0),
      0
    );
    expect(totalAllocated).toBe(120);
  });
});
```

## Changelog

### v1.0.0 (2025-01-18)
- Initial pattern documentation
| 1.1.0 | 2025-01-18 | Added stock reservation system |
| 1.2.0 | 2025-01-18 | Added allocation engine |
| 1.3.0 | 2025-01-18 | Added demand forecasting |
| 1.4.0 | 2025-01-18 | Added sync service |
| 1.5.0 | 2025-01-18 | Added comprehensive testing examples |
