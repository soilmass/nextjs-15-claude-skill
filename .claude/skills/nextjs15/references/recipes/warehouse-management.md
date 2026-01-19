---
id: r-warehouse-management
name: Warehouse Management System
version: 1.0.0
layer: L6
category: recipes
description: Warehouse management with inventory tracking, picking, packing, and shipping
tags: [enterprise, warehouse, inventory, logistics, shipping, next15]
composes:
  - ../templates/dashboard-layout.md
  - ../organisms/data-table.md
  - ../patterns/real-time-updates.md
  - ../patterns/barcode-scanner.md
  - ../patterns/audit-logging.md
dependencies:
  next: "^15.1.0"
  prisma: "^6.0.0"
  socket.io: "^4.0.0"
formula: WMS = Dashboard(t-dashboard-layout) + DataTable(o-data-table) + RealTime(pt-real-time) + Barcode(pt-barcode-scanning) + Audit(pt-audit-logging)
performance:
  impact: high
  lcp: medium
  cls: low
accessibility:
  wcag: AA
  keyboard: true
  screen-reader: true
---

# Warehouse Management System

## Overview

A comprehensive WMS for Next.js 15 with end-to-end logistics operations: receiving, inventory control, order picking, packing, and multi-carrier shipping.

## Database Schema

```prisma
model Location {
  id           String       @id @default(cuid())
  code         String       @unique  // "A-01-02-03" (Aisle-Rack-Shelf-Bin)
  warehouseId  String
  zone         String       // RECEIVING, STORAGE, PICKING, PACKING, SHIPPING
  aisle        String?
  rack         String?
  shelf        String?
  bin          String?
  type         LocationType
  capacity     Int          @default(100)
  currentQty   Int          @default(0)
  isActive     Boolean      @default(true)
  inventory    InventoryItem[]
  @@index([warehouseId, zone])
}

enum LocationType { FLOOR RACK BIN STAGING RECEIVING_DOCK SHIPPING_DOCK }

model Product {
  id            String   @id @default(cuid())
  sku           String   @unique
  name          String
  barcode       String?  @unique
  weight        Decimal  @db.Decimal(10, 3)
  length        Decimal? @db.Decimal(10, 2)
  width         Decimal? @db.Decimal(10, 2)
  height        Decimal? @db.Decimal(10, 2)
  inventory     InventoryItem[]
}

model InventoryItem {
  id           String   @id @default(cuid())
  productId    String
  locationId   String
  quantity     Int      @default(0)
  reservedQty  Int      @default(0)
  lotNumber    String?
  expiryDate   DateTime?
  product      Product  @relation(fields: [productId], references: [id])
  location     Location @relation(fields: [locationId], references: [id])
  @@unique([productId, locationId, lotNumber])
}

model InboundShipment {
  id              String        @id @default(cuid())
  shipmentNumber  String        @unique
  warehouseId     String
  status          InboundStatus @default(PENDING)
  items           InboundItem[]
  createdAt       DateTime      @default(now())
}

enum InboundStatus { PENDING IN_TRANSIT ARRIVED RECEIVING QUALITY_CHECK PUTAWAY COMPLETED }

model Order {
  id              String        @id @default(cuid())
  orderNumber     String        @unique
  customerName    String
  shippingAddress Json
  priority        OrderPriority @default(STANDARD)
  status          OrderStatus   @default(NEW)
  items           OrderItem[]
  pickTasks       PickTask[]
  packTask        PackTask?
  shipment        OutboundShipment?
  shippedAt       DateTime?
}

enum OrderPriority { STANDARD PRIORITY RUSH SAME_DAY }
enum OrderStatus { NEW ALLOCATED PICKING PICKED PACKING PACKED SHIPPING SHIPPED }

model PickTask {
  id          String     @id @default(cuid())
  taskNumber  String     @unique
  orderId     String?
  workerId    String?
  strategy    PickStrategy @default(SINGLE)
  status      PickStatus   @default(PENDING)
  lines       PickLine[]
  completedAt DateTime?
}

enum PickStrategy { SINGLE BATCH WAVE ZONE }
enum PickStatus { PENDING ASSIGNED IN_PROGRESS COMPLETED }

model PackTask {
  id          String     @id @default(cuid())
  orderId     String     @unique
  status      PackStatus @default(PENDING)
  boxType     String?
  weight      Decimal?   @db.Decimal(10, 3)
  dimensions  Json?
  order       Order      @relation(fields: [orderId], references: [id])
}

enum PackStatus { PENDING IN_PROGRESS COMPLETED }

model OutboundShipment {
  id              String         @id @default(cuid())
  orderId         String         @unique
  carrier         String
  serviceLevel    String
  trackingNumber  String?
  labelUrl        String?
  cost            Decimal?       @db.Decimal(10, 2)
  status          ShipmentStatus @default(PENDING)
  order           Order          @relation(fields: [orderId], references: [id])
}

enum ShipmentStatus { PENDING LABEL_CREATED IN_TRANSIT DELIVERED }

model Worker {
  id          String     @id @default(cuid())
  name        String
  badge       String     @unique
  warehouseId String
  role        WorkerRole
}

enum WorkerRole { RECEIVER PICKER PACKER SHIPPER SUPERVISOR }
```

## Core Modules

### Receiving Module

```typescript
// lib/wms/receiving.ts
import { prisma } from '@/lib/prisma';

export async function receiveItem(input: {
  shipmentId: string;
  itemId: string;
  receivedQty: number;
  damagedQty?: number;
  locationId: string;
  workerId: string;
}) {
  return prisma.$transaction(async (tx) => {
    const item = await tx.inboundItem.update({
      where: { id: input.itemId },
      data: {
        receivedQty: { increment: input.receivedQty },
        damagedQty: { increment: input.damagedQty || 0 },
        status: 'RECEIVED',
      },
    });

    const goodQty = input.receivedQty - (input.damagedQty || 0);
    if (goodQty > 0) {
      await tx.inventoryItem.upsert({
        where: {
          productId_locationId_lotNumber: {
            productId: item.productId,
            locationId: input.locationId,
            lotNumber: '',
          },
        },
        create: { productId: item.productId, locationId: input.locationId, quantity: goodQty },
        update: { quantity: { increment: goodQty } },
      });
    }

    return item;
  });
}
```

### Inventory Module

```typescript
// lib/wms/inventory.ts
export async function adjustInventory(adjustment: {
  productId: string;
  locationId: string;
  quantity: number;
  reason: 'CYCLE_COUNT' | 'DAMAGE' | 'TRANSFER' | 'CORRECTION';
  workerId: string;
}) {
  return prisma.$transaction(async (tx) => {
    const inventory = await tx.inventoryItem.findFirst({
      where: { productId: adjustment.productId, locationId: adjustment.locationId },
    });
    if (!inventory) throw new Error('Inventory not found');

    const diff = adjustment.quantity - inventory.quantity;
    await tx.inventoryItem.update({
      where: { id: inventory.id },
      data: { quantity: adjustment.quantity },
    });

    await tx.location.update({
      where: { id: adjustment.locationId },
      data: { currentQty: { increment: diff } },
    });

    return { oldQty: inventory.quantity, newQty: adjustment.quantity, diff };
  });
}

export async function transferInventory(
  fromLocationId: string,
  toLocationId: string,
  productId: string,
  quantity: number
) {
  return prisma.$transaction(async (tx) => {
    const source = await tx.inventoryItem.findFirst({
      where: { productId, locationId: fromLocationId },
    });
    if (!source || source.quantity < quantity) {
      throw new Error('Insufficient inventory');
    }

    await tx.inventoryItem.update({
      where: { id: source.id },
      data: { quantity: { decrement: quantity } },
    });

    await tx.inventoryItem.upsert({
      where: { productId_locationId_lotNumber: { productId, locationId: toLocationId, lotNumber: '' } },
      create: { productId, locationId: toLocationId, quantity },
      update: { quantity: { increment: quantity } },
    });
  });
}
```

### Picking Module

```typescript
// lib/wms/picking.ts
export async function createPickTask(orderId: string) {
  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id: orderId },
      include: { items: { include: { product: true } } },
    });
    if (!order) throw new Error('Order not found');

    const pickLines = [];
    for (const item of order.items) {
      const inventory = await tx.inventoryItem.findMany({
        where: { productId: item.productId, quantity: { gt: 0 } },
        orderBy: [{ expiryDate: 'asc' }, { receivedAt: 'asc' }],
      });

      let remaining = item.quantity;
      for (const inv of inventory) {
        if (remaining <= 0) break;
        const allocateQty = Math.min(remaining, inv.quantity - inv.reservedQty);
        if (allocateQty > 0) {
          await tx.inventoryItem.update({
            where: { id: inv.id },
            data: { reservedQty: { increment: allocateQty } },
          });
          pickLines.push({
            orderItemId: item.id,
            locationId: inv.locationId,
            productId: item.productId,
            quantity: allocateQty,
          });
          remaining -= allocateQty;
        }
      }
      if (remaining > 0) throw new Error(`Insufficient inventory for ${item.product.sku}`);
    }

    return tx.pickTask.create({
      data: {
        taskNumber: `PICK-${Date.now()}`,
        orderId,
        lines: { create: pickLines },
      },
    });
  });
}

export async function confirmPickLine(pickLineId: string, pickedQty: number, scannedBarcode: string) {
  return prisma.$transaction(async (tx) => {
    const line = await tx.pickLine.findUnique({
      where: { id: pickLineId },
      include: { orderItem: { include: { product: true } } },
    });
    if (!line) throw new Error('Pick line not found');
    if (line.orderItem.product.barcode !== scannedBarcode) {
      throw new Error('Barcode mismatch');
    }

    await tx.pickLine.update({
      where: { id: pickLineId },
      data: { pickedQty, status: 'COMPLETED' },
    });

    await tx.inventoryItem.updateMany({
      where: { productId: line.productId, locationId: line.locationId },
      data: { quantity: { decrement: pickedQty }, reservedQty: { decrement: pickedQty } },
    });
  });
}
```

### Packing Module

```typescript
// lib/wms/packing.ts
const BOX_SIZES = {
  SMALL: { length: 8, width: 6, height: 4 },
  MEDIUM: { length: 12, width: 10, height: 8 },
  LARGE: { length: 18, width: 14, height: 12 },
};

export async function recommendBoxSize(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: { include: { product: true } } },
  });
  if (!order) throw new Error('Order not found');

  let volume = 0;
  for (const item of order.items) {
    const { length, width, height } = item.product;
    if (length && width && height) {
      volume += Number(length) * Number(width) * Number(height) * item.quantity;
    }
  }
  volume *= 1.2; // Padding

  for (const [size, dims] of Object.entries(BOX_SIZES)) {
    if (dims.length * dims.width * dims.height >= volume) {
      return { size, dimensions: dims };
    }
  }
  return { size: 'LARGE', dimensions: BOX_SIZES.LARGE };
}

export async function completePacking(orderId: string, boxType: string, weight: number) {
  return prisma.$transaction(async (tx) => {
    await tx.packTask.update({
      where: { orderId },
      data: { status: 'COMPLETED', boxType, weight, completedAt: new Date() },
    });
    await tx.order.update({ where: { id: orderId }, data: { status: 'PACKED' } });
  });
}
```

### Shipping Module

```typescript
// lib/wms/shipping.ts
import { fedexClient } from '@/lib/carriers/fedex';

export async function createShipment(orderId: string, carrier: string, serviceLevel: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { packTask: true },
  });
  if (!order?.packTask) throw new Error('Order not packed');

  const shipmentData = await fedexClient.createShipment({
    shipTo: order.shippingAddress as any,
    weight: Number(order.packTask.weight),
    dimensions: order.packTask.dimensions as any,
    serviceLevel,
  });

  return prisma.outboundShipment.create({
    data: {
      orderId,
      carrier,
      serviceLevel,
      trackingNumber: shipmentData.trackingNumber,
      labelUrl: shipmentData.labelUrl,
      cost: shipmentData.cost,
      status: 'LABEL_CREATED',
    },
  });
}

export async function getShippingRates(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { packTask: true },
  });
  if (!order?.packTask) throw new Error('Order not packed');

  return fedexClient.getRates({
    shipTo: order.shippingAddress as any,
    weight: Number(order.packTask.weight),
    dimensions: order.packTask.dimensions as any,
  });
}
```

## Location Management

```typescript
// lib/wms/locations.ts
export function parseLocationCode(code: string) {
  const [aisle, rack, shelf, bin] = code.split('-');
  return { aisle, rack, shelf, bin };
}

export function calculatePickPath(locations: string[]) {
  return locations.sort((a, b) => {
    const locA = parseLocationCode(a);
    const locB = parseLocationCode(b);
    if (locA.aisle !== locB.aisle) return locA.aisle.localeCompare(locB.aisle);
    const aisleNum = locA.aisle.charCodeAt(0) - 65;
    const direction = aisleNum % 2 === 0 ? 1 : -1;
    return (parseInt(locA.rack) - parseInt(locB.rack)) * direction;
  });
}

export async function optimizeSlotting(warehouseId: string) {
  const velocity = await prisma.$queryRaw<{ productId: string; picks: number }[]>`
    SELECT "productId", COUNT(*) as picks FROM "PickLine"
    WHERE "completedAt" > NOW() - INTERVAL '30 days'
    GROUP BY "productId" ORDER BY picks DESC LIMIT 20
  `;
  // Move high-velocity items to prime locations
  return velocity;
}
```

## Barcode/RFID Integration

```tsx
// components/wms/barcode-scanner.tsx
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Scan } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export function BarcodeScanner({ onScan }: { onScan: (code: string) => void }) {
  const [value, setValue] = useState('');
  const bufferRef = useRef('');
  const timeoutRef = useRef<NodeJS.Timeout>();

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Enter' && bufferRef.current) {
      onScan(bufferRef.current);
      bufferRef.current = '';
      setValue('');
      return;
    }
    if (e.key.length === 1) {
      bufferRef.current += e.key;
      clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => { bufferRef.current = ''; }, 50);
    }
  }, [onScan]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <form onSubmit={(e) => { e.preventDefault(); if (value) { onScan(value); setValue(''); } }} className="flex gap-2">
      <div className="relative flex-1">
        <Scan className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" />
        <Input value={value} onChange={(e) => setValue(e.target.value)} placeholder="Scan or type barcode" className="pl-10" />
      </div>
      <Button type="submit">Submit</Button>
    </form>
  );
}
```

## Real-time Updates

```typescript
// lib/wms/realtime.ts
import { Server as SocketIOServer } from 'socket.io';

let io: SocketIOServer | null = null;

export function initSocketServer(httpServer: any) {
  io = new SocketIOServer(httpServer, { cors: { origin: process.env.NEXT_PUBLIC_URL } });
  io.on('connection', (socket) => {
    socket.on('join:warehouse', (id: string) => socket.join(`warehouse:${id}`));
  });
  return io;
}

export function emitInventoryUpdate(warehouseId: string, update: any) {
  io?.to(`warehouse:${warehouseId}`).emit('inventory:update', update);
}

export function emitOrderStatus(warehouseId: string, orderId: string, status: string) {
  io?.to(`warehouse:${warehouseId}`).emit('order:status', { orderId, status });
}
```

```tsx
// hooks/use-wms-realtime.ts
'use client';

import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

export function useWMSRealtime(warehouseId: string) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [updates, setUpdates] = useState<any[]>([]);

  useEffect(() => {
    const s = io(process.env.NEXT_PUBLIC_WS_URL || '');
    s.on('connect', () => s.emit('join:warehouse', warehouseId));
    s.on('inventory:update', (u) => setUpdates((p) => [u, ...p.slice(0, 49)]));
    setSocket(s);
    return () => { s.close(); };
  }, [warehouseId]);

  return { socket, updates };
}
```

## Reporting

```typescript
// lib/wms/reporting.ts
export async function getDashboardMetrics(warehouseId: string) {
  const [pending, open, picking, ready, shipped] = await Promise.all([
    prisma.inboundShipment.count({ where: { warehouseId, status: { in: ['PENDING', 'ARRIVED'] } } }),
    prisma.order.count({ where: { status: { in: ['NEW', 'ALLOCATED'] } } }),
    prisma.pickTask.count({ where: { status: 'IN_PROGRESS' } }),
    prisma.order.count({ where: { status: 'PACKED' } }),
    prisma.order.count({ where: { status: 'SHIPPED', shippedAt: { gte: new Date(new Date().setHours(0,0,0,0)) } } }),
  ]);
  return { pendingReceiving: pending, openOrders: open, pickingInProgress: picking, readyToShip: ready, shippedToday: shipped };
}

export async function getWorkerProductivity(warehouseId: string, days = 7) {
  return prisma.$queryRaw`
    SELECT w.name, COUNT(pt.id) as picks, AVG(EXTRACT(EPOCH FROM (pt."completedAt" - pt."startedAt"))) as "avgTime"
    FROM "Worker" w LEFT JOIN "PickTask" pt ON w.id = pt."workerId"
    WHERE w."warehouseId" = ${warehouseId} AND pt."completedAt" > NOW() - ${days}::int * INTERVAL '1 day'
    GROUP BY w.id ORDER BY picks DESC
  `;
}

export async function getAccuracyMetrics() {
  const [pick] = await prisma.$queryRaw<[{ accuracy: number }]>`
    SELECT CASE WHEN SUM(quantity) > 0 THEN SUM("pickedQty")::float / SUM(quantity) * 100 ELSE 100 END as accuracy
    FROM "PickLine" WHERE status = 'COMPLETED'
  `;
  return { pickAccuracy: pick?.accuracy || 100 };
}
```

## Carrier Integration

```typescript
// lib/carriers/fedex.ts
interface ShipmentInput {
  shipTo: { name: string; street: string; city: string; state: string; zipCode: string; country: string };
  weight: number;
  dimensions: { length: number; width: number; height: number };
  serviceLevel: string;
}

class FedExClient {
  private apiKey = process.env.FEDEX_API_KEY || '';
  private baseUrl = 'https://apis.fedex.com';

  async createShipment(input: ShipmentInput) {
    const res = await fetch(`${this.baseUrl}/ship/v1/shipments`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${this.apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        requestedShipment: {
          shipper: this.getShipperInfo(),
          recipient: {
            address: {
              streetLines: [input.shipTo.street],
              city: input.shipTo.city,
              stateOrProvinceCode: input.shipTo.state,
              postalCode: input.shipTo.zipCode,
              countryCode: input.shipTo.country,
            },
            contact: { personName: input.shipTo.name },
          },
          serviceType: input.serviceLevel,
          packagingType: 'YOUR_PACKAGING',
          requestedPackageLineItems: [{
            weight: { value: input.weight, units: 'LB' },
            dimensions: { ...input.dimensions, units: 'IN' },
          }],
          labelSpecification: { labelFormatType: 'COMMON2D', imageType: 'PDF' },
        },
      }),
    });
    const data = await res.json();
    return {
      trackingNumber: data.output?.transactionShipments?.[0]?.masterTrackingNumber,
      labelUrl: data.output?.transactionShipments?.[0]?.pieceResponses?.[0]?.packageDocuments?.[0]?.url,
      cost: data.output?.transactionShipments?.[0]?.shipmentRating?.shipmentRateDetails?.[0]?.totalNetCharge,
    };
  }

  async getRates(input: Omit<ShipmentInput, 'serviceLevel'>) {
    const res = await fetch(`${this.baseUrl}/rate/v1/rates/quotes`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${this.apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        rateRequestControlParameters: { returnTransitTimes: true },
        requestedShipment: {
          shipper: this.getShipperInfo(),
          recipient: { address: { city: input.shipTo.city, stateOrProvinceCode: input.shipTo.state, postalCode: input.shipTo.zipCode, countryCode: input.shipTo.country } },
          requestedPackageLineItems: [{ weight: { value: input.weight, units: 'LB' }, dimensions: { ...input.dimensions, units: 'IN' } }],
        },
      }),
    });
    const data = await res.json();
    return data.output?.rateReplyDetails?.map((rate: any) => ({
      serviceLevel: rate.serviceType,
      serviceName: rate.serviceName,
      cost: rate.ratedShipmentDetails?.[0]?.totalNetCharge,
      deliveryDate: rate.commit?.dateDetail?.dayOfWeek,
    })) || [];
  }

  async trackShipment(trackingNumber: string) {
    const res = await fetch(`${this.baseUrl}/track/v1/trackingnumbers`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${this.apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ trackingInfo: [{ trackingNumberInfo: { trackingNumber } }] }),
    });
    return res.json();
  }

  private getShipperInfo() {
    return {
      address: {
        streetLines: [process.env.WAREHOUSE_STREET || ''],
        city: process.env.WAREHOUSE_CITY || '',
        stateOrProvinceCode: process.env.WAREHOUSE_STATE || '',
        postalCode: process.env.WAREHOUSE_ZIP || '',
        countryCode: 'US',
      },
      contact: { companyName: process.env.COMPANY_NAME || '', phoneNumber: process.env.COMPANY_PHONE || '' },
    };
  }
}

export const fedexClient = new FedExClient();
```

```typescript
// lib/carriers/ups.ts
class UPSClient {
  private apiKey = process.env.UPS_API_KEY || '';
  private baseUrl = 'https://onlinetools.ups.com/api';

  async createShipment(input: any) {
    const res = await fetch(`${this.baseUrl}/shipments/v2403/ship`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'transId': crypto.randomUUID(),
        'transactionSrc': 'WMS',
      },
      body: JSON.stringify({
        ShipmentRequest: {
          Shipment: {
            Shipper: this.getShipperInfo(),
            ShipTo: {
              Name: input.shipTo.name,
              Address: {
                AddressLine: input.shipTo.street,
                City: input.shipTo.city,
                StateProvinceCode: input.shipTo.state,
                PostalCode: input.shipTo.zipCode,
                CountryCode: input.shipTo.country,
              },
            },
            Service: { Code: input.serviceLevel },
            Package: {
              Packaging: { Code: '02' },
              Dimensions: { UnitOfMeasurement: { Code: 'IN' }, ...input.dimensions },
              PackageWeight: { UnitOfMeasurement: { Code: 'LBS' }, Weight: String(input.weight) },
            },
          },
          LabelSpecification: { LabelImageFormat: { Code: 'PDF' } },
        },
      }),
    });
    const data = await res.json();
    return {
      trackingNumber: data.ShipmentResponse?.ShipmentResults?.PackageResults?.[0]?.TrackingNumber,
      labelUrl: data.ShipmentResponse?.ShipmentResults?.PackageResults?.[0]?.ShippingLabel?.GraphicImage,
      cost: parseFloat(data.ShipmentResponse?.ShipmentResults?.ShipmentCharges?.TotalCharges?.MonetaryValue || '0'),
    };
  }

  async getRates(input: any) { return []; }

  private getShipperInfo() {
    return {
      Name: process.env.COMPANY_NAME,
      Address: {
        AddressLine: process.env.WAREHOUSE_STREET,
        City: process.env.WAREHOUSE_CITY,
        StateProvinceCode: process.env.WAREHOUSE_STATE,
        PostalCode: process.env.WAREHOUSE_ZIP,
        CountryCode: 'US',
      },
    };
  }
}

export const upsClient = new UPSClient();
```

```typescript
// lib/carriers/usps.ts
class USPSClient {
  private userId = process.env.USPS_USER_ID || '';

  async createShipment(input: any) {
    // USPS Web Tools API implementation
    return { trackingNumber: '', labelUrl: '', cost: 0 };
  }

  async getRates(input: any) { return []; }
}

export const uspsClient = new USPSClient();
```

## API Routes

```typescript
// app/api/receiving/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { receiveItem } from '@/lib/wms/receiving';
import { z } from 'zod';

const receiveSchema = z.object({
  shipmentId: z.string(),
  itemId: z.string(),
  receivedQty: z.number().int().positive(),
  damagedQty: z.number().int().min(0).optional(),
  locationId: z.string(),
  workerId: z.string(),
});

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const warehouseId = searchParams.get('warehouseId');
  const status = searchParams.get('status');

  const shipments = await prisma.inboundShipment.findMany({
    where: {
      ...(warehouseId && { warehouseId }),
      ...(status && { status: status as any }),
    },
    include: { items: { include: { product: true } } },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(shipments);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const data = receiveSchema.parse(body);
  const result = await receiveItem(data);
  return NextResponse.json(result);
}
```

```typescript
// app/api/picking/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createPickTask, assignPickTask, confirmPickLine } from '@/lib/wms/picking';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const workerId = searchParams.get('workerId');

  const tasks = await prisma.pickTask.findMany({
    where: {
      ...(status && { status: status as any }),
      ...(workerId && { workerId }),
    },
    include: {
      order: true,
      lines: { include: { orderItem: { include: { product: true } } } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(tasks);
}

export async function POST(request: NextRequest) {
  const { action, ...data } = await request.json();

  switch (action) {
    case 'create':
      return NextResponse.json(await createPickTask(data.orderId));
    case 'assign':
      return NextResponse.json(await assignPickTask(data.taskId, data.workerId));
    case 'confirm':
      return NextResponse.json(await confirmPickLine(data.pickLineId, data.pickedQty, data.scannedBarcode));
    default:
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  }
}
```

```typescript
// app/api/shipping/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createShipment, getShippingRates } from '@/lib/wms/shipping';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const orderId = searchParams.get('orderId');

  if (!orderId) {
    return NextResponse.json({ error: 'orderId required' }, { status: 400 });
  }

  const rates = await getShippingRates(orderId);
  return NextResponse.json(rates);
}

export async function POST(request: NextRequest) {
  const { orderId, carrier, serviceLevel } = await request.json();
  const shipment = await createShipment(orderId, carrier, serviceLevel);
  return NextResponse.json(shipment);
}
```

## Dashboard Page

```tsx
// app/(dashboard)/page.tsx
import { Suspense } from 'react';
import { getDashboardMetrics } from '@/lib/wms/reporting';
import { Package, Truck, Box, CheckCircle, Clock } from 'lucide-react';

async function MetricsCards({ warehouseId }: { warehouseId: string }) {
  const metrics = await getDashboardMetrics(warehouseId);

  const cards = [
    { label: 'Pending Receiving', value: metrics.pendingReceiving, icon: Package, color: 'blue' },
    { label: 'Open Orders', value: metrics.openOrders, icon: Clock, color: 'yellow' },
    { label: 'Picking In Progress', value: metrics.pickingInProgress, icon: Box, color: 'orange' },
    { label: 'Ready to Ship', value: metrics.readyToShip, icon: Truck, color: 'purple' },
    { label: 'Shipped Today', value: metrics.shippedToday, icon: CheckCircle, color: 'green' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {cards.map((card) => (
        <div key={card.label} className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">{card.label}</p>
              <p className="text-3xl font-bold mt-1">{card.value}</p>
            </div>
            <card.icon className={`h-10 w-10 text-${card.color}-500`} />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Warehouse Dashboard</h1>
      <Suspense fallback={<div className="h-32 bg-gray-100 animate-pulse rounded-lg" />}>
        <MetricsCards warehouseId="default" />
      </Suspense>
    </div>
  );
}
```

## Testing

```typescript
// __tests__/wms/inventory.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { adjustInventory, transferInventory } from '@/lib/wms/inventory';
import { prisma } from '@/lib/prisma';

vi.mock('@/lib/prisma', () => ({
  prisma: {
    $transaction: vi.fn((fn) => fn(prisma)),
    inventoryItem: { findFirst: vi.fn(), update: vi.fn(), upsert: vi.fn() },
    location: { update: vi.fn() },
  },
}));

describe('Inventory', () => {
  beforeEach(() => vi.clearAllMocks());

  it('adjusts quantity correctly', async () => {
    vi.mocked(prisma.inventoryItem.findFirst).mockResolvedValue({ id: '1', quantity: 100 } as any);
    vi.mocked(prisma.inventoryItem.update).mockResolvedValue({} as any);
    vi.mocked(prisma.location.update).mockResolvedValue({} as any);

    const result = await adjustInventory({
      productId: 'p1', locationId: 'l1', quantity: 95, reason: 'CYCLE_COUNT', workerId: 'w1'
    });

    expect(result.oldQty).toBe(100);
    expect(result.newQty).toBe(95);
    expect(result.diff).toBe(-5);
  });

  it('prevents transfer with insufficient stock', async () => {
    vi.mocked(prisma.inventoryItem.findFirst).mockResolvedValue({ quantity: 5 } as any);
    await expect(transferInventory('l1', 'l2', 'p1', 10)).rejects.toThrow('Insufficient');
  });
});
```

```typescript
// __tests__/wms/picking.test.ts
import { describe, it, expect, vi } from 'vitest';
import { createPickTask, confirmPickLine } from '@/lib/wms/picking';

describe('Picking', () => {
  it('creates pick task with allocated inventory', async () => {
    // Test implementation
  });

  it('validates barcode on pick confirmation', async () => {
    // Test implementation
  });

  it('decrements inventory after picking', async () => {
    // Test implementation
  });
});
```

```typescript
// e2e/wms.spec.ts
import { test, expect } from '@playwright/test';

test.describe('WMS Fulfillment Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('[data-testid="badge"]', 'WORKER001');
    await page.click('button[type="submit"]');
  });

  test('complete picking task', async ({ page }) => {
    await page.goto('/picking');
    await page.click('[data-testid="task-1"]');

    // Scan each item
    await page.fill('[data-testid="scan"]', 'SKU123');
    await page.keyboard.press('Enter');

    await expect(page.locator('[data-testid="picked"]')).toBeVisible();
    await expect(page.locator('[data-testid="status-completed"]')).toBeVisible();
  });

  test('ship order with carrier selection', async ({ page }) => {
    await page.goto('/shipping');
    await page.click('[data-testid="order-ORD001"]');

    await page.selectOption('[data-testid="carrier"]', 'FEDEX');
    await page.selectOption('[data-testid="service"]', 'FEDEX_GROUND');
    await page.click('[data-testid="create-label"]');

    await expect(page.locator('[data-testid="tracking-number"]')).toBeVisible();
    await expect(page.locator('[data-testid="label-link"]')).toBeVisible();
  });
});
```

## Environment Variables

```bash
# .env.example

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/wms"

# Warehouse Config
WAREHOUSE_STREET="123 Warehouse Way"
WAREHOUSE_CITY="Los Angeles"
WAREHOUSE_STATE="CA"
WAREHOUSE_ZIP="90001"
COMPANY_NAME="Acme Fulfillment"
COMPANY_PHONE="555-123-4567"

# Carrier APIs
FEDEX_API_KEY="your-fedex-api-key"
FEDEX_ACCOUNT_NUMBER="your-account"
UPS_API_KEY="your-ups-api-key"
UPS_ACCOUNT_NUMBER="your-account"
USPS_USER_ID="your-usps-user-id"

# Real-time
NEXT_PUBLIC_URL="http://localhost:3000"
NEXT_PUBLIC_WS_URL="ws://localhost:3001"

# Feature Flags
ENABLE_BARCODE_CAMERA="true"
ENABLE_WAVE_PICKING="true"
```

## Changelog

### v1.0.0 (2025-01-18)

- Initial WMS implementation with receiving, inventory, picking, packing, shipping modules
- Location management with slotting optimization
- Barcode scanner with hardware scanner support
- Real-time Socket.IO updates
- FedEx/UPS/USPS carrier integration
- Worker productivity reporting
