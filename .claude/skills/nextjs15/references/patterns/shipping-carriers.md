---
id: pt-shipping-carriers
name: Shipping Carriers
version: 1.1.0
layer: L5
category: payments
description: Multi-carrier shipping integration with real-time rate calculation, label generation, tracking, and international shipping support for USPS, FedEx, UPS, and DHL
tags: [shipping, carriers, rates, tracking, fulfillment, ecommerce, next15, logistics]
composes:
  - ../molecules/card.md
  - ../organisms/checkout-form.md
dependencies:
  shippo: "^2.0.0"
  zod: "^3.0.0"
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: AA
  keyboard: true
  screen-reader: true
---

# Shipping Carriers

## Overview

The Shipping Carriers pattern provides a comprehensive integration layer for connecting e-commerce applications with multiple shipping providers including USPS, FedEx, UPS, and DHL. This pattern enables real-time shipping rate calculations, automated label generation, package tracking, and fulfillment workflow automation through shipping aggregators like Shippo or EasyPost.

The implementation abstracts the complexity of working with multiple carrier APIs by providing a unified interface for common shipping operations. This includes address validation to prevent delivery failures, dimensional weight calculations for accurate pricing, customs documentation for international shipments, and webhook integrations for real-time tracking updates. The pattern supports both domestic and international shipping with proper handling of duties, taxes, and customs forms.

For e-commerce platforms, reliable shipping is critical to customer satisfaction and operational efficiency. This pattern reduces cart abandonment by showing accurate shipping costs during checkout, improves fulfillment speed through label automation, and enhances customer experience with proactive tracking notifications. The modular architecture allows easy addition of new carriers and shipping methods as business needs evolve.

## When to Use

- **E-commerce checkout**: Display real-time shipping rates from multiple carriers to give customers choices between speed and cost
- **Order fulfillment**: Automate shipping label generation for warehouse or dropship operations to reduce manual work
- **Package tracking**: Provide customers with tracking information and proactive delivery notifications
- **International shipping**: Handle customs documentation, duties calculation, and international carrier selection
- **Rate shopping**: Automatically select the best carrier/service combination based on delivery requirements and cost
- **Returns processing**: Generate return labels and track return shipments for customer service operations

## When NOT to Use

- **Digital products only**: If you only sell digital goods, skip physical shipping infrastructure
- **Local delivery only**: For hyper-local delivery (same-city, same-day), consider specialized local delivery services instead
- **Third-party fulfillment**: If using Shopify Fulfillment Network, Amazon FBA, or similar, they handle shipping integration
- **Very low volume**: For fewer than 10 orders per month, manual carrier website usage may be more practical than API integration

## Composition Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│ Shipping Carriers Architecture                                                   │
│                                                                                   │
│  ┌─────────────────────────────────────────────────────────────────────────────┐ │
│  │ Checkout Flow                                                                │ │
│  │                                                                              │ │
│  │  ┌────────────────┐    ┌────────────────┐    ┌────────────────────────────┐ │ │
│  │  │ Address Input  │───▶│ Address        │───▶│ Shipping Rate Calculator   │ │ │
│  │  │                │    │ Validation     │    │                            │ │ │
│  │  │ - Street       │    │ - USPS/Shippo  │    │ - Query multiple carriers  │ │ │
│  │  │ - City/State   │    │ - Suggestions  │    │ - Filter by service level  │ │ │
│  │  │ - ZIP/Postal   │    │ - Corrections  │    │ - Sort by price/speed      │ │ │
│  │  │ - Country      │    │                │    │ - Cache results            │ │ │
│  │  └────────────────┘    └────────────────┘    └─────────────┬──────────────┘ │ │
│  │                                                            │                │ │
│  │                                                            ▼                │ │
│  │  ┌─────────────────────────────────────────────────────────────────────┐   │ │
│  │  │ ShippingOptions Component                                           │   │ │
│  │  │                                                                     │   │ │
│  │  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌───────────┐  │   │ │
│  │  │  │ USPS         │ │ FedEx        │ │ UPS          │ │ DHL       │  │   │ │
│  │  │  │              │ │              │ │              │ │           │  │   │ │
│  │  │  │ Ground: $8   │ │ Express: $15 │ │ 2-Day: $12   │ │ Intl: $25 │  │   │ │
│  │  │  │ Priority: $12│ │ 2-Day: $18   │ │ Ground: $9   │ │           │  │   │ │
│  │  │  └──────────────┘ └──────────────┘ └──────────────┘ └───────────┘  │   │ │
│  │  └─────────────────────────────────────────────────────────────────────┘   │ │
│  └─────────────────────────────────────────────────────────────────────────────┘ │
│                                          │                                        │
│                                          │ Selected rate                          │
│                                          ▼                                        │
│  ┌─────────────────────────────────────────────────────────────────────────────┐ │
│  │ Fulfillment Layer                                                            │ │
│  │                                                                              │ │
│  │  ┌────────────────────┐    ┌────────────────────┐    ┌──────────────────┐   │ │
│  │  │ Label Generation   │    │ Packing Slip       │    │ Customs Forms    │   │ │
│  │  │                    │    │                    │    │ (International)  │   │ │
│  │  │ - PDF/ZPL/PNG      │    │ - Order details    │    │ - HS codes       │   │ │
│  │  │ - Batch printing   │    │ - Packing list     │    │ - Value/origin   │   │ │
│  │  │ - Thermal support  │    │ - Return label     │    │ - Duties (DDP)   │   │ │
│  │  └─────────┬──────────┘    └────────────────────┘    └──────────────────┘   │ │
│  │            │                                                                 │ │
│  │            ▼                                                                 │ │
│  │  ┌───────────────────────────────────────────────────────────────────────┐  │ │
│  │  │ Tracking & Webhooks                                                   │  │ │
│  │  │                                                                       │  │ │
│  │  │  Events: label_created → in_transit → out_for_delivery → delivered   │  │ │
│  │  │          └── exception → returned                                    │  │ │
│  │  │                                                                       │  │ │
│  │  │  Notifications: Email / SMS / Push                                   │  │ │
│  │  └───────────────────────────────────────────────────────────────────────┘  │ │
│  └─────────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## Implementation

### Types and Interfaces

```typescript
// lib/shipping/types.ts
export interface ShippingAddress {
  name: string;
  company?: string;
  street1: string;
  street2?: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  phone?: string;
  email?: string;
  isResidential?: boolean;
}

export interface PackageDetails {
  weight: number;      // in ounces
  length: number;      // in inches
  width: number;
  height: number;
  value?: number;      // declared value in cents
  description?: string;
}

export interface ShippingRate {
  id: string;
  carrier: CarrierCode;
  carrierName: string;
  service: string;
  serviceName: string;
  rate: number;        // in cents
  currency: string;
  estimatedDays: number;
  estimatedDelivery?: Date;
  guaranteedDelivery?: boolean;
  saturdayDelivery?: boolean;
  signatureRequired?: boolean;
  insuranceIncluded?: boolean;
  rateId: string;      // ID to use when purchasing
  attributes: string[];
}

export interface ShippingLabel {
  id: string;
  orderId: string;
  carrier: CarrierCode;
  service: string;
  trackingNumber: string;
  trackingUrl: string;
  labelUrl: string;
  labelFormat: 'PDF' | 'PNG' | 'ZPL';
  rate: number;
  createdAt: Date;
}

export interface TrackingEvent {
  status: TrackingStatus;
  statusDetails: string;
  location?: {
    city: string;
    state: string;
    country: string;
    zip?: string;
  };
  timestamp: Date;
}

export interface TrackingInfo {
  trackingNumber: string;
  carrier: CarrierCode;
  status: TrackingStatus;
  statusDetails: string;
  estimatedDelivery?: Date;
  actualDelivery?: Date;
  history: TrackingEvent[];
}

export type CarrierCode = 'usps' | 'fedex' | 'ups' | 'dhl' | 'canada_post' | 'royal_mail';

export type TrackingStatus =
  | 'pre_transit'
  | 'in_transit'
  | 'out_for_delivery'
  | 'delivered'
  | 'available_for_pickup'
  | 'return_to_sender'
  | 'failure'
  | 'unknown';

export interface CustomsItem {
  description: string;
  quantity: number;
  value: number;        // in cents per item
  weight: number;       // in ounces per item
  hsCode?: string;
  originCountry: string;
}

export interface CustomsDeclaration {
  contentsType: 'merchandise' | 'gift' | 'documents' | 'sample' | 'return';
  nonDeliveryOption: 'return' | 'abandon';
  items: CustomsItem[];
  incoterm?: 'DDP' | 'DDU';  // Delivered Duty Paid vs Unpaid
}
```

### Shipping Service

```typescript
// lib/shipping/service.ts
import Shippo from 'shippo';
import { cache } from 'react';
import {
  ShippingAddress,
  PackageDetails,
  ShippingRate,
  ShippingLabel,
  TrackingInfo,
  CustomsDeclaration,
  CarrierCode,
} from './types';

const shippo = new Shippo(process.env.SHIPPO_API_KEY!);

// Store address (from environment)
const FROM_ADDRESS: ShippingAddress = {
  name: process.env.STORE_NAME!,
  company: process.env.STORE_COMPANY,
  street1: process.env.STORE_STREET!,
  city: process.env.STORE_CITY!,
  state: process.env.STORE_STATE!,
  zip: process.env.STORE_ZIP!,
  country: process.env.STORE_COUNTRY || 'US',
  phone: process.env.STORE_PHONE,
  email: process.env.STORE_EMAIL,
};

/**
 * Validate and normalize a shipping address
 */
export async function validateAddress(
  address: ShippingAddress
): Promise<{
  isValid: boolean;
  normalizedAddress?: ShippingAddress;
  messages: string[];
}> {
  try {
    const validation = await shippo.address.create({
      name: address.name,
      street1: address.street1,
      street2: address.street2,
      city: address.city,
      state: address.state,
      zip: address.zip,
      country: address.country,
      validate: true,
    });

    const isValid = validation.validation_results?.is_valid ?? false;

    return {
      isValid,
      normalizedAddress: isValid
        ? {
            ...address,
            street1: validation.street1,
            street2: validation.street2,
            city: validation.city,
            state: validation.state,
            zip: validation.zip,
          }
        : undefined,
      messages: validation.validation_results?.messages?.map(
        (m: any) => m.text
      ) || [],
    };
  } catch (error) {
    console.error('Address validation failed:', error);
    return {
      isValid: false,
      messages: ['Address validation service unavailable'],
    };
  }
}

/**
 * Calculate dimensional weight for a package
 */
export function calculateDimensionalWeight(
  length: number,
  width: number,
  height: number,
  dimFactor: number = 139 // Standard for domestic US
): number {
  return Math.ceil((length * width * height) / dimFactor);
}

/**
 * Get the billable weight (greater of actual vs dimensional)
 */
export function getBillableWeight(parcel: PackageDetails): number {
  const dimWeight = calculateDimensionalWeight(
    parcel.length,
    parcel.width,
    parcel.height
  );
  return Math.max(parcel.weight, dimWeight);
}

/**
 * Get shipping rates from multiple carriers
 */
export async function getShippingRates(
  to: ShippingAddress,
  parcel: PackageDetails,
  options?: {
    carriers?: CarrierCode[];
    serviceLevels?: string[];
    includeInsurance?: boolean;
    signatureRequired?: boolean;
    saturdayDelivery?: boolean;
  }
): Promise<ShippingRate[]> {
  const shipment = await shippo.shipment.create({
    address_from: {
      name: FROM_ADDRESS.name,
      company: FROM_ADDRESS.company,
      street1: FROM_ADDRESS.street1,
      street2: FROM_ADDRESS.street2,
      city: FROM_ADDRESS.city,
      state: FROM_ADDRESS.state,
      zip: FROM_ADDRESS.zip,
      country: FROM_ADDRESS.country,
      phone: FROM_ADDRESS.phone,
      email: FROM_ADDRESS.email,
    },
    address_to: {
      name: to.name,
      company: to.company,
      street1: to.street1,
      street2: to.street2,
      city: to.city,
      state: to.state,
      zip: to.zip,
      country: to.country,
      phone: to.phone,
      email: to.email,
      is_residential: to.isResidential,
    },
    parcels: [
      {
        length: parcel.length.toString(),
        width: parcel.width.toString(),
        height: parcel.height.toString(),
        weight: parcel.weight.toString(),
        distance_unit: 'in',
        mass_unit: 'oz',
      },
    ],
    extra: {
      insurance: options?.includeInsurance
        ? { amount: (parcel.value || 0) / 100, currency: 'USD' }
        : undefined,
      signature_confirmation: options?.signatureRequired ? 'STANDARD' : undefined,
      saturday_delivery: options?.saturdayDelivery,
    },
    async: false,
  });

  // Filter and transform rates
  let rates = shipment.rates.map((rate: any) => ({
    id: rate.object_id,
    carrier: rate.provider.toLowerCase() as CarrierCode,
    carrierName: rate.provider,
    service: rate.servicelevel.token,
    serviceName: rate.servicelevel.name,
    rate: Math.round(parseFloat(rate.amount) * 100),
    currency: rate.currency,
    estimatedDays: rate.estimated_days,
    estimatedDelivery: rate.estimated_days
      ? addBusinessDays(new Date(), rate.estimated_days)
      : undefined,
    guaranteedDelivery: rate.attributes.includes('GUARANTEED'),
    saturdayDelivery: rate.attributes.includes('SATURDAY_DELIVERY'),
    signatureRequired: rate.attributes.includes('SIGNATURE'),
    insuranceIncluded: rate.attributes.includes('INSURANCE'),
    rateId: rate.object_id,
    attributes: rate.attributes,
  }));

  // Apply filters
  if (options?.carriers?.length) {
    rates = rates.filter((r) => options.carriers!.includes(r.carrier));
  }

  if (options?.serviceLevels?.length) {
    rates = rates.filter((r) =>
      options.serviceLevels!.some((sl) =>
        r.service.toLowerCase().includes(sl.toLowerCase())
      )
    );
  }

  // Sort by price
  return rates.sort((a, b) => a.rate - b.rate);
}

/**
 * Create a shipping label for an order
 */
export async function createShippingLabel(
  rateId: string,
  orderId: string,
  options?: {
    labelFormat?: 'PDF' | 'PNG' | 'ZPL';
    customs?: CustomsDeclaration;
  }
): Promise<ShippingLabel> {
  const transaction = await shippo.transaction.create({
    rate: rateId,
    label_file_type: options?.labelFormat || 'PDF',
    async: false,
    ...(options?.customs && {
      customs_declaration: await createCustomsDeclaration(options.customs),
    }),
  });

  if (transaction.status !== 'SUCCESS') {
    throw new Error(
      `Label creation failed: ${transaction.messages?.map((m: any) => m.text).join(', ')}`
    );
  }

  return {
    id: transaction.object_id,
    orderId,
    carrier: transaction.rate.provider.toLowerCase() as CarrierCode,
    service: transaction.rate.servicelevel.token,
    trackingNumber: transaction.tracking_number,
    trackingUrl: transaction.tracking_url_provider,
    labelUrl: transaction.label_url,
    labelFormat: options?.labelFormat || 'PDF',
    rate: Math.round(parseFloat(transaction.rate.amount) * 100),
    createdAt: new Date(),
  };
}

/**
 * Create customs declaration for international shipments
 */
async function createCustomsDeclaration(
  customs: CustomsDeclaration
): Promise<string> {
  const declaration = await shippo.customsdeclaration.create({
    contents_type: customs.contentsType.toUpperCase(),
    non_delivery_option: customs.nonDeliveryOption.toUpperCase(),
    certify: true,
    certify_signer: FROM_ADDRESS.name,
    incoterm: customs.incoterm || 'DDU',
    items: customs.items.map((item) => ({
      description: item.description,
      quantity: item.quantity,
      net_weight: item.weight.toString(),
      mass_unit: 'oz',
      value_amount: (item.value / 100).toFixed(2),
      value_currency: 'USD',
      tariff_number: item.hsCode,
      origin_country: item.originCountry,
    })),
  });

  return declaration.object_id;
}

/**
 * Get tracking information for a shipment
 */
export async function getTrackingInfo(
  carrier: CarrierCode,
  trackingNumber: string
): Promise<TrackingInfo> {
  const tracking = await shippo.track.get_status(
    carrier.toUpperCase(),
    trackingNumber
  );

  const mapStatus = (status: string): TrackingInfo['status'] => {
    const statusMap: Record<string, TrackingInfo['status']> = {
      PRE_TRANSIT: 'pre_transit',
      TRANSIT: 'in_transit',
      DELIVERED: 'delivered',
      RETURNED: 'return_to_sender',
      FAILURE: 'failure',
      UNKNOWN: 'unknown',
    };
    return statusMap[status] || 'unknown';
  };

  return {
    trackingNumber,
    carrier,
    status: mapStatus(tracking.tracking_status.status),
    statusDetails: tracking.tracking_status.status_details,
    estimatedDelivery: tracking.eta ? new Date(tracking.eta) : undefined,
    actualDelivery:
      tracking.tracking_status.status === 'DELIVERED'
        ? new Date(tracking.tracking_status.status_date)
        : undefined,
    history: tracking.tracking_history.map((event: any) => ({
      status: mapStatus(event.status),
      statusDetails: event.status_details,
      location: event.location
        ? {
            city: event.location.city,
            state: event.location.state,
            country: event.location.country,
            zip: event.location.zip,
          }
        : undefined,
      timestamp: new Date(event.status_date),
    })),
  };
}

/**
 * Create a return label
 */
export async function createReturnLabel(
  originalLabelId: string,
  reason?: string
): Promise<ShippingLabel> {
  // Get the original shipment details
  const originalTransaction = await shippo.transaction.retrieve(originalLabelId);

  // Create return shipment (swap from/to addresses)
  const shipment = await shippo.shipment.create({
    address_from: originalTransaction.address_to,
    address_to: originalTransaction.address_from,
    parcels: originalTransaction.parcel,
    async: false,
  });

  // Find similar rate to original
  const returnRate = shipment.rates.find(
    (r: any) =>
      r.provider.toLowerCase() === originalTransaction.rate.provider.toLowerCase()
  );

  if (!returnRate) {
    throw new Error('No return rate available for this carrier');
  }

  const transaction = await shippo.transaction.create({
    rate: returnRate.object_id,
    label_file_type: 'PDF',
    async: false,
  });

  if (transaction.status !== 'SUCCESS') {
    throw new Error('Return label creation failed');
  }

  return {
    id: transaction.object_id,
    orderId: `RETURN-${originalLabelId}`,
    carrier: transaction.rate.provider.toLowerCase() as CarrierCode,
    service: transaction.rate.servicelevel.token,
    trackingNumber: transaction.tracking_number,
    trackingUrl: transaction.tracking_url_provider,
    labelUrl: transaction.label_url,
    labelFormat: 'PDF',
    rate: Math.round(parseFloat(transaction.rate.amount) * 100),
    createdAt: new Date(),
  };
}

// Helper function
function addBusinessDays(date: Date, days: number): Date {
  const result = new Date(date);
  let added = 0;
  while (added < days) {
    result.setDate(result.getDate() + 1);
    const dayOfWeek = result.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      added++;
    }
  }
  return result;
}

// Cached version for use in Server Components
export const getCachedShippingRates = cache(getShippingRates);
```

### API Routes

```typescript
// app/api/shipping/rates/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getShippingRates, validateAddress } from '@/lib/shipping/service';
import { z } from 'zod';

const ratesSchema = z.object({
  address: z.object({
    name: z.string().min(1),
    company: z.string().optional(),
    street1: z.string().min(1),
    street2: z.string().optional(),
    city: z.string().min(1),
    state: z.string().min(1),
    zip: z.string().min(1),
    country: z.string().default('US'),
    phone: z.string().optional(),
    email: z.string().email().optional(),
    isResidential: z.boolean().optional(),
  }),
  items: z.array(
    z.object({
      weight: z.number().positive(),
      quantity: z.number().int().positive(),
      length: z.number().positive().optional(),
      width: z.number().positive().optional(),
      height: z.number().positive().optional(),
      value: z.number().optional(),
    })
  ),
  options: z
    .object({
      carriers: z.array(z.string()).optional(),
      includeInsurance: z.boolean().optional(),
      signatureRequired: z.boolean().optional(),
    })
    .optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { address, items, options } = ratesSchema.parse(body);

    // Validate address first
    const addressValidation = await validateAddress(address);
    if (!addressValidation.isValid) {
      return NextResponse.json(
        {
          error: 'Invalid shipping address',
          messages: addressValidation.messages,
        },
        { status: 400 }
      );
    }

    // Calculate total weight and dimensions
    const totalWeight = items.reduce(
      (sum, item) => sum + item.weight * item.quantity,
      0
    );

    // Use provided dimensions or standard box
    const parcel = {
      weight: totalWeight,
      length: items[0]?.length || 12,
      width: items[0]?.width || 8,
      height: items[0]?.height || 6,
      value: items.reduce((sum, item) => sum + (item.value || 0) * item.quantity, 0),
    };

    const rates = await getShippingRates(
      addressValidation.normalizedAddress || address,
      parcel,
      options as any
    );

    return NextResponse.json({
      rates,
      address: addressValidation.normalizedAddress,
    });
  } catch (error) {
    console.error('Shipping rates error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to calculate shipping rates' },
      { status: 500 }
    );
  }
}
```

```typescript
// app/api/shipping/label/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createShippingLabel } from '@/lib/shipping/service';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { z } from 'zod';

const labelSchema = z.object({
  orderId: z.string(),
  rateId: z.string(),
  labelFormat: z.enum(['PDF', 'PNG', 'ZPL']).optional(),
  customs: z
    .object({
      contentsType: z.enum(['merchandise', 'gift', 'documents', 'sample', 'return']),
      nonDeliveryOption: z.enum(['return', 'abandon']),
      items: z.array(
        z.object({
          description: z.string(),
          quantity: z.number(),
          value: z.number(),
          weight: z.number(),
          hsCode: z.string().optional(),
          originCountry: z.string(),
        })
      ),
      incoterm: z.enum(['DDP', 'DDU']).optional(),
    })
    .optional(),
});

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { orderId, rateId, labelFormat, customs } = labelSchema.parse(body);

    // Verify order belongs to user (for merchant) or exists (for admin)
    const order = await db.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Create the label
    const label = await createShippingLabel(rateId, orderId, {
      labelFormat,
      customs,
    });

    // Save label to database
    await db.shippingLabel.create({
      data: {
        id: label.id,
        orderId: label.orderId,
        carrier: label.carrier,
        service: label.service,
        trackingNumber: label.trackingNumber,
        trackingUrl: label.trackingUrl,
        labelUrl: label.labelUrl,
        labelFormat: label.labelFormat,
        rate: label.rate,
      },
    });

    // Update order status
    await db.order.update({
      where: { id: orderId },
      data: {
        status: 'shipped',
        trackingNumber: label.trackingNumber,
        shippedAt: new Date(),
      },
    });

    return NextResponse.json(label);
  } catch (error) {
    console.error('Label creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create shipping label' },
      { status: 500 }
    );
  }
}
```

```typescript
// app/api/shipping/tracking/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getTrackingInfo } from '@/lib/shipping/service';
import { CarrierCode } from '@/lib/shipping/types';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const trackingNumber = searchParams.get('trackingNumber');
  const carrier = searchParams.get('carrier') as CarrierCode | null;

  if (!trackingNumber || !carrier) {
    return NextResponse.json(
      { error: 'Missing trackingNumber or carrier' },
      { status: 400 }
    );
  }

  try {
    const tracking = await getTrackingInfo(carrier, trackingNumber);
    return NextResponse.json(tracking);
  } catch (error) {
    console.error('Tracking lookup error:', error);
    return NextResponse.json(
      { error: 'Failed to get tracking information' },
      { status: 500 }
    );
  }
}
```

```typescript
// app/api/shipping/webhook/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sendTrackingNotification } from '@/lib/notifications';
import { headers } from 'next/headers';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  const headersList = await headers();
  const signature = headersList.get('x-shippo-signature');

  // Verify webhook signature
  const body = await request.text();
  const expectedSignature = crypto
    .createHmac('sha256', process.env.SHIPPO_WEBHOOK_SECRET!)
    .update(body)
    .digest('hex');

  if (signature !== expectedSignature) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  const event = JSON.parse(body);

  if (event.event === 'track_updated') {
    const { tracking_number, tracking_status } = event.data;

    // Find order by tracking number
    const order = await db.order.findFirst({
      where: { trackingNumber: tracking_number },
      include: { user: true },
    });

    if (order) {
      // Update order status
      await db.order.update({
        where: { id: order.id },
        data: {
          shippingStatus: tracking_status.status.toLowerCase(),
          deliveredAt:
            tracking_status.status === 'DELIVERED' ? new Date() : undefined,
        },
      });

      // Send notification to customer
      await sendTrackingNotification({
        email: order.user.email,
        orderNumber: order.orderNumber,
        trackingNumber: tracking_number,
        status: tracking_status.status,
        statusDetails: tracking_status.status_details,
      });
    }
  }

  return NextResponse.json({ received: true });
}
```

### Shipping Options Component

```typescript
// components/shipping-options.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Truck, Zap, Shield, Calendar, AlertCircle, Package } from 'lucide-react';
import { ShippingRate, ShippingAddress } from '@/lib/shipping/types';
import { formatPrice } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface CartItem {
  id: string;
  weight: number;
  quantity: number;
  value?: number;
}

interface ShippingOptionsProps {
  address: ShippingAddress;
  items: CartItem[];
  onSelect: (rate: ShippingRate) => void;
  selectedRateId?: string;
  className?: string;
}

const carrierLogos: Record<string, string> = {
  usps: '/carriers/usps.svg',
  fedex: '/carriers/fedex.svg',
  ups: '/carriers/ups.svg',
  dhl: '/carriers/dhl.svg',
};

export function ShippingOptions({
  address,
  items,
  onSelect,
  selectedRateId,
  className,
}: ShippingOptionsProps) {
  const [rates, setRates] = useState<ShippingRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRates = useCallback(async () => {
    if (!address.zip) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/shipping/rates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address, items }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to get shipping rates');
      }

      setRates(data.rates);

      // Auto-select cheapest option if none selected
      if (!selectedRateId && data.rates.length > 0) {
        onSelect(data.rates[0]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load shipping options');
    } finally {
      setLoading(false);
    }
  }, [address, items, selectedRateId, onSelect]);

  useEffect(() => {
    fetchRates();
  }, [fetchRates]);

  if (loading) {
    return <ShippingOptionsSkeleton />;
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (rates.length === 0) {
    return (
      <Alert>
        <Package className="h-4 w-4" />
        <AlertDescription>
          No shipping options available for this address. Please verify your shipping address.
        </AlertDescription>
      </Alert>
    );
  }

  // Group rates by speed category
  const expressRates = rates.filter(
    (r) => r.estimatedDays && r.estimatedDays <= 2
  );
  const standardRates = rates.filter(
    (r) => !r.estimatedDays || r.estimatedDays > 2
  );

  return (
    <div className={cn('space-y-4', className)}>
      <RadioGroup
        value={selectedRateId}
        onValueChange={(id) => {
          const rate = rates.find((r) => r.rateId === id);
          if (rate) onSelect(rate);
        }}
      >
        {expressRates.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <Zap className="h-4 w-4 text-yellow-500" />
              Express Shipping
            </h4>
            {expressRates.map((rate) => (
              <ShippingRateCard
                key={rate.rateId}
                rate={rate}
                isSelected={selectedRateId === rate.rateId}
              />
            ))}
          </div>
        )}

        {standardRates.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <Truck className="h-4 w-4" />
              Standard Shipping
            </h4>
            {standardRates.map((rate) => (
              <ShippingRateCard
                key={rate.rateId}
                rate={rate}
                isSelected={selectedRateId === rate.rateId}
              />
            ))}
          </div>
        )}
      </RadioGroup>
    </div>
  );
}

function ShippingRateCard({
  rate,
  isSelected,
}: {
  rate: ShippingRate;
  isSelected: boolean;
}) {
  const formatDeliveryDate = (days?: number) => {
    if (!days) return 'Varies';
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div
      className={cn(
        'relative flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-colors',
        isSelected
          ? 'border-primary bg-primary/5'
          : 'border-gray-200 hover:border-gray-300'
      )}
    >
      <div className="flex items-center gap-4">
        <RadioGroupItem value={rate.rateId} id={rate.rateId} />
        <Label
          htmlFor={rate.rateId}
          className="flex-1 cursor-pointer space-y-1"
        >
          <div className="flex items-center gap-2">
            <span className="font-medium">{rate.carrierName}</span>
            <span className="text-muted-foreground">{rate.serviceName}</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {rate.estimatedDays
                ? `${rate.estimatedDays} day${rate.estimatedDays > 1 ? 's' : ''}`
                : 'Varies'}
            </span>
            <span>Est. {formatDeliveryDate(rate.estimatedDays)}</span>
          </div>
          <div className="flex gap-1 mt-1">
            {rate.guaranteedDelivery && (
              <Badge variant="secondary" className="text-xs">
                <Shield className="h-3 w-3 mr-1" />
                Guaranteed
              </Badge>
            )}
            {rate.signatureRequired && (
              <Badge variant="outline" className="text-xs">
                Signature
              </Badge>
            )}
          </div>
        </Label>
      </div>
      <div className="text-right">
        <span className="text-lg font-semibold">{formatPrice(rate.rate)}</span>
      </div>
    </div>
  );
}

function ShippingOptionsSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center gap-4">
            <Skeleton className="h-4 w-4 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
          <Skeleton className="h-6 w-16" />
        </div>
      ))}
    </div>
  );
}
```

### Tracking Component

```typescript
// components/order-tracking.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Package,
  Truck,
  MapPin,
  CheckCircle,
  Clock,
  ExternalLink,
  RefreshCw,
} from 'lucide-react';
import { TrackingInfo, TrackingEvent } from '@/lib/shipping/types';
import { cn } from '@/lib/utils';

interface OrderTrackingProps {
  trackingNumber: string;
  carrier: string;
  trackingUrl?: string;
}

export function OrderTracking({
  trackingNumber,
  carrier,
  trackingUrl,
}: OrderTrackingProps) {
  const [tracking, setTracking] = useState<TrackingInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTracking = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(
        `/api/shipping/tracking?trackingNumber=${trackingNumber}&carrier=${carrier}`
      );
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error);
      }

      setTracking(data);
    } catch (err) {
      setError('Unable to fetch tracking information');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTracking();
  }, [trackingNumber, carrier]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'out_for_delivery':
        return <Truck className="h-5 w-5 text-blue-500" />;
      case 'in_transit':
        return <Package className="h-5 w-5 text-yellow-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive'> = {
      delivered: 'default',
      in_transit: 'secondary',
      out_for_delivery: 'secondary',
      failure: 'destructive',
    };

    return (
      <Badge variant={variants[status] || 'secondary'}>
        {status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
      </Badge>
    );
  };

  if (loading) {
    return <TrackingSkeleton />;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-lg">Package Tracking</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            {carrier.toUpperCase()} - {trackingNumber}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchTracking}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          {trackingUrl && (
            <Button variant="outline" size="sm" asChild>
              <a href={trackingUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-1" />
                Track on {carrier.toUpperCase()}
              </a>
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {error ? (
          <p className="text-center text-muted-foreground py-4">{error}</p>
        ) : tracking ? (
          <div className="space-y-6">
            {/* Current Status */}
            <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
              {getStatusIcon(tracking.status)}
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{tracking.statusDetails}</span>
                  {getStatusBadge(tracking.status)}
                </div>
                {tracking.estimatedDelivery && tracking.status !== 'delivered' && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Estimated delivery:{' '}
                    {new Date(tracking.estimatedDelivery).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>

            {/* Timeline */}
            <div className="relative">
              {tracking.history.map((event, index) => (
                <TrackingTimelineItem
                  key={index}
                  event={event}
                  isLast={index === tracking.history.length - 1}
                  isFirst={index === 0}
                />
              ))}
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

function TrackingTimelineItem({
  event,
  isLast,
  isFirst,
}: {
  event: TrackingEvent;
  isLast: boolean;
  isFirst: boolean;
}) {
  return (
    <div className="flex gap-4 pb-4">
      <div className="flex flex-col items-center">
        <div
          className={cn(
            'w-3 h-3 rounded-full',
            isFirst ? 'bg-primary' : 'bg-muted-foreground/30'
          )}
        />
        {!isLast && <div className="w-0.5 flex-1 bg-muted-foreground/20 my-1" />}
      </div>
      <div className="flex-1 pb-2">
        <p className={cn('font-medium', !isFirst && 'text-muted-foreground')}>
          {event.statusDetails}
        </p>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
          {event.location && (
            <>
              <MapPin className="h-3 w-3" />
              <span>
                {event.location.city}, {event.location.state}
              </span>
              <span>-</span>
            </>
          )}
          <span>
            {new Date(event.timestamp).toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
}

function TrackingSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="h-6 w-32 bg-muted animate-pulse rounded" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="h-16 bg-muted animate-pulse rounded-lg" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-4">
              <div className="h-3 w-3 bg-muted animate-pulse rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-48 bg-muted animate-pulse rounded" />
                <div className="h-3 w-32 bg-muted animate-pulse rounded" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
```

## Examples

### Example 1: Checkout Integration

```typescript
// app/checkout/page.tsx
'use client';

import { useState } from 'react';
import { ShippingOptions } from '@/components/shipping-options';
import { AddressForm } from '@/components/address-form';
import { OrderSummary } from '@/components/order-summary';
import { useCart } from '@/hooks/use-cart';
import { ShippingRate, ShippingAddress } from '@/lib/shipping/types';

export default function CheckoutPage() {
  const { items, subtotal } = useCart();
  const [address, setAddress] = useState<ShippingAddress | null>(null);
  const [selectedRate, setSelectedRate] = useState<ShippingRate | null>(null);
  const [step, setStep] = useState<'address' | 'shipping' | 'payment'>('address');

  const cartItems = items.map((item) => ({
    id: item.id,
    weight: item.weight,
    quantity: item.quantity,
    value: item.price,
  }));

  const handleAddressSubmit = (addr: ShippingAddress) => {
    setAddress(addr);
    setStep('shipping');
  };

  const handleShippingSelect = (rate: ShippingRate) => {
    setSelectedRate(rate);
  };

  const handleContinueToPayment = () => {
    if (selectedRate) {
      setStep('payment');
    }
  };

  return (
    <div className="container py-8">
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Address Step */}
          <section>
            <h2 className="text-xl font-bold mb-4">Shipping Address</h2>
            <AddressForm
              onSubmit={handleAddressSubmit}
              disabled={step !== 'address'}
            />
          </section>

          {/* Shipping Step */}
          {address && step !== 'address' && (
            <section>
              <h2 className="text-xl font-bold mb-4">Shipping Method</h2>
              <ShippingOptions
                address={address}
                items={cartItems}
                onSelect={handleShippingSelect}
                selectedRateId={selectedRate?.rateId}
              />
              <Button
                className="mt-4"
                onClick={handleContinueToPayment}
                disabled={!selectedRate}
              >
                Continue to Payment
              </Button>
            </section>
          )}
        </div>

        {/* Order Summary */}
        <div>
          <OrderSummary
            subtotal={subtotal}
            shipping={selectedRate?.rate || 0}
            tax={0}
          />
        </div>
      </div>
    </div>
  );
}
```

### Example 2: Admin Fulfillment Dashboard

```typescript
// app/admin/orders/[id]/fulfill/page.tsx
import { notFound } from 'next/navigation';
import { getOrder } from '@/lib/orders';
import { FulfillmentForm } from '@/components/admin/fulfillment-form';

export default async function FulfillOrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getOrder(id);

  if (!order) notFound();

  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-6">
        Fulfill Order #{order.orderNumber}
      </h1>
      <FulfillmentForm order={order} />
    </div>
  );
}

// components/admin/fulfillment-form.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ShippingOptions } from '@/components/shipping-options';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export function FulfillmentForm({ order }: { order: Order }) {
  const router = useRouter();
  const [selectedRate, setSelectedRate] = useState<ShippingRate | null>(null);
  const [creating, setCreating] = useState(false);

  const handleCreateLabel = async () => {
    if (!selectedRate) return;

    setCreating(true);
    try {
      const res = await fetch('/api/shipping/label', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: order.id,
          rateId: selectedRate.rateId,
          labelFormat: 'PDF',
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error);
      }

      toast.success('Shipping label created');

      // Open label in new tab
      window.open(data.labelUrl, '_blank');

      // Refresh page
      router.refresh();
    } catch (error) {
      toast.error('Failed to create shipping label');
    } finally {
      setCreating(false);
    }
  };

  const cartItems = order.items.map((item) => ({
    id: item.productId,
    weight: item.weight,
    quantity: item.quantity,
    value: item.price,
  }));

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h3 className="font-medium mb-2">Ship To</h3>
          <address className="not-italic text-muted-foreground">
            {order.shippingAddress.name}<br />
            {order.shippingAddress.street1}<br />
            {order.shippingAddress.street2 && <>{order.shippingAddress.street2}<br /></>}
            {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}
          </address>
        </div>
        <div>
          <h3 className="font-medium mb-2">Order Items</h3>
          <ul className="space-y-1 text-sm text-muted-foreground">
            {order.items.map((item) => (
              <li key={item.id}>
                {item.quantity}x {item.name} ({item.weight}oz)
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div>
        <h3 className="font-medium mb-4">Select Shipping Service</h3>
        <ShippingOptions
          address={order.shippingAddress}
          items={cartItems}
          onSelect={setSelectedRate}
          selectedRateId={selectedRate?.rateId}
        />
      </div>

      <Button
        onClick={handleCreateLabel}
        disabled={!selectedRate || creating}
        size="lg"
      >
        {creating ? 'Creating Label...' : 'Create Shipping Label'}
      </Button>
    </div>
  );
}
```

### Example 3: Customer Order Tracking Page

```typescript
// app/orders/[id]/page.tsx
import { notFound } from 'next/navigation';
import { getOrderForCustomer } from '@/lib/orders';
import { OrderTracking } from '@/components/order-tracking';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function OrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session) redirect('/login');

  const { id } = await params;
  const order = await getOrderForCustomer(id, session.user.id);

  if (!order) notFound();

  return (
    <div className="container py-8 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Order #{order.orderNumber}</h1>

      {order.trackingNumber && (
        <OrderTracking
          trackingNumber={order.trackingNumber}
          carrier={order.carrier}
          trackingUrl={order.trackingUrl}
        />
      )}

      {!order.trackingNumber && (
        <div className="text-center py-12 text-muted-foreground">
          <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Your order is being prepared for shipment.</p>
          <p className="text-sm mt-2">
            Tracking information will appear here once your order ships.
          </p>
        </div>
      )}
    </div>
  );
}
```

## Anti-patterns

### Anti-pattern 1: Hardcoded Shipping Rates

```typescript
// BAD: Hardcoded rates are inaccurate and outdated
const shippingRates = [
  { name: 'Standard', price: 5.99, days: 5 },
  { name: 'Express', price: 12.99, days: 2 },
];

// GOOD: Fetch real-time rates from carriers
const rates = await getShippingRates(address, parcel);
// Returns actual carrier rates that account for:
// - Package weight and dimensions
// - Distance and zones
// - Current fuel surcharges
// - Service availability
```

### Anti-pattern 2: No Fallback for API Failures

```typescript
// BAD: No fallback when shipping API fails
async function getShippingOptions(address, items) {
  const rates = await getShippingRates(address, items);
  return rates; // Fails if API is down
}

// GOOD: Provide fallback flat-rate options
async function getShippingOptions(address, items) {
  try {
    const rates = await getShippingRates(address, items);
    if (rates.length > 0) return rates;
  } catch (error) {
    console.error('Shipping API failed:', error);
  }

  // Fallback to flat-rate shipping
  return [
    {
      id: 'fallback-standard',
      carrier: 'store',
      carrierName: 'Store Shipping',
      service: 'standard',
      serviceName: 'Standard Shipping',
      rate: 999, // $9.99
      estimatedDays: 7,
      rateId: 'fallback-standard',
    },
    {
      id: 'fallback-express',
      carrier: 'store',
      carrierName: 'Store Shipping',
      service: 'express',
      serviceName: 'Express Shipping',
      rate: 1999, // $19.99
      estimatedDays: 3,
      rateId: 'fallback-express',
    },
  ];
}
```

### Anti-pattern 3: Ignoring Dimensional Weight

```typescript
// BAD: Only using actual weight
const parcel = {
  weight: product.weight, // 8 oz
  // No dimensions!
};

// Carrier may charge for dimensional weight if package is large but light

// GOOD: Calculate billable weight
const parcel = {
  weight: product.weight,
  length: product.length,
  width: product.width,
  height: product.height,
};

// Calculate dimensional weight
const dimWeight = (parcel.length * parcel.width * parcel.height) / 139;
const billableWeight = Math.max(parcel.weight, dimWeight);

// Use billable weight for rate calculation
```

### Anti-pattern 4: Not Validating Addresses

```typescript
// BAD: Using address as-is
async function calculateShipping(address, items) {
  const rates = await getShippingRates(address, items);
  return rates;
}

// Results in:
// - Delivery failures
// - Extra charges for address corrections
// - Customer complaints

// GOOD: Validate and normalize addresses first
async function calculateShipping(address, items) {
  const validation = await validateAddress(address);

  if (!validation.isValid) {
    throw new Error(`Invalid address: ${validation.messages.join(', ')}`);
  }

  // Use normalized address for accurate rates
  const rates = await getShippingRates(validation.normalizedAddress, items);
  return { rates, normalizedAddress: validation.normalizedAddress };
}
```

## Testing

### Unit Tests

```typescript
// __tests__/lib/shipping/service.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  calculateDimensionalWeight,
  getBillableWeight,
  validateAddress,
  getShippingRates,
} from '@/lib/shipping/service';

describe('shipping service', () => {
  describe('calculateDimensionalWeight', () => {
    it('calculates correct dimensional weight', () => {
      // Standard box: 12x8x6 inches
      const dimWeight = calculateDimensionalWeight(12, 8, 6);
      // (12 * 8 * 6) / 139 = 4.1 -> rounds to 5
      expect(dimWeight).toBe(5);
    });

    it('uses custom dim factor', () => {
      const dimWeight = calculateDimensionalWeight(12, 8, 6, 166);
      // (12 * 8 * 6) / 166 = 3.5 -> rounds to 4
      expect(dimWeight).toBe(4);
    });
  });

  describe('getBillableWeight', () => {
    it('returns actual weight when greater than dim weight', () => {
      const parcel = { weight: 32, length: 6, width: 6, height: 6 };
      // Dim weight: (6*6*6)/139 = 1.5 -> 2
      expect(getBillableWeight(parcel)).toBe(32);
    });

    it('returns dim weight when greater than actual weight', () => {
      const parcel = { weight: 4, length: 18, width: 12, height: 12 };
      // Dim weight: (18*12*12)/139 = 18.6 -> 19
      expect(getBillableWeight(parcel)).toBe(19);
    });
  });

  describe('validateAddress', () => {
    it('returns valid for correct address', async () => {
      const result = await validateAddress({
        name: 'John Doe',
        street1: '123 Main St',
        city: 'San Francisco',
        state: 'CA',
        zip: '94105',
        country: 'US',
      });

      expect(result.isValid).toBe(true);
      expect(result.normalizedAddress).toBeDefined();
    });

    it('returns invalid for bad address', async () => {
      const result = await validateAddress({
        name: 'John Doe',
        street1: 'Invalid Street 99999',
        city: 'Fake City',
        state: 'XX',
        zip: '00000',
        country: 'US',
      });

      expect(result.isValid).toBe(false);
      expect(result.messages.length).toBeGreaterThan(0);
    });
  });

  describe('getShippingRates', () => {
    it('returns rates sorted by price', async () => {
      const rates = await getShippingRates(
        {
          name: 'Test',
          street1: '123 Main St',
          city: 'San Francisco',
          state: 'CA',
          zip: '94105',
          country: 'US',
        },
        { weight: 16, length: 10, width: 8, height: 4 }
      );

      expect(rates.length).toBeGreaterThan(0);

      // Verify sorted by price ascending
      for (let i = 1; i < rates.length; i++) {
        expect(rates[i].rate).toBeGreaterThanOrEqual(rates[i - 1].rate);
      }
    });

    it('filters by carrier when specified', async () => {
      const rates = await getShippingRates(
        {
          name: 'Test',
          street1: '123 Main St',
          city: 'San Francisco',
          state: 'CA',
          zip: '94105',
          country: 'US',
        },
        { weight: 16, length: 10, width: 8, height: 4 },
        { carriers: ['usps'] }
      );

      rates.forEach((rate) => {
        expect(rate.carrier).toBe('usps');
      });
    });
  });
});
```

### Integration Tests

```typescript
// __tests__/api/shipping.test.ts
import { describe, it, expect } from 'vitest';
import { testApiHandler } from 'next-test-api-route-handler';
import * as ratesHandler from '@/app/api/shipping/rates/route';

describe('Shipping API', () => {
  describe('POST /api/shipping/rates', () => {
    it('returns rates for valid request', async () => {
      await testApiHandler({
        appHandler: ratesHandler,
        test: async ({ fetch }) => {
          const res = await fetch({
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              address: {
                name: 'Test Customer',
                street1: '123 Main St',
                city: 'San Francisco',
                state: 'CA',
                zip: '94105',
                country: 'US',
              },
              items: [{ weight: 16, quantity: 1 }],
            }),
          });

          expect(res.status).toBe(200);

          const data = await res.json();
          expect(data.rates).toBeDefined();
          expect(Array.isArray(data.rates)).toBe(true);
          expect(data.rates.length).toBeGreaterThan(0);

          // Verify rate structure
          const rate = data.rates[0];
          expect(rate).toHaveProperty('carrier');
          expect(rate).toHaveProperty('rate');
          expect(rate).toHaveProperty('estimatedDays');
        },
      });
    });

    it('returns 400 for invalid address', async () => {
      await testApiHandler({
        appHandler: ratesHandler,
        test: async ({ fetch }) => {
          const res = await fetch({
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              address: {
                name: 'Test',
                street1: '',
                city: '',
                state: '',
                zip: '',
                country: 'US',
              },
              items: [{ weight: 16, quantity: 1 }],
            }),
          });

          expect(res.status).toBe(400);
        },
      });
    });
  });
});
```

## Related Skills

- [Checkout Form](../organisms/checkout-form.md) - Complete checkout implementation
- [Address Form](../molecules/address-form.md) - Address input with validation
- [Geolocation](../patterns/geolocation.md) - Auto-detect user location
- [Order Management](../patterns/order-management.md) - Order lifecycle handling
- [Email Notifications](../patterns/email-notifications.md) - Shipping notifications
- [Webhooks](../patterns/webhooks.md) - Tracking webhook handling

---

## Changelog

### 1.1.0 (2025-01-18)
- Added comprehensive types for all shipping entities
- Added address validation with normalization
- Added dimensional weight calculation
- Added customs declaration support for international shipping
- Added return label generation
- Added webhook handler for tracking updates
- Added fulfillment dashboard example
- Added customer tracking page example
- Expanded anti-patterns with code examples
- Added unit tests for shipping calculations
- Added integration tests for API routes
- Added carrier logo support
- Added grouped shipping options (express/standard)

### 1.0.0 (2025-01-15)
- Initial implementation
- Basic rate calculation
- Label generation
- Tracking lookup
