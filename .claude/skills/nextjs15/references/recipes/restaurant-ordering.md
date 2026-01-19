---
id: r-restaurant-ordering
name: Restaurant Ordering
version: 3.0.0
layer: L6
category: recipes
description: Restaurant ordering platform with menu builder, cart, table reservations, and delivery tracking
tags: [restaurant, food, ordering, menu, reservations, delivery, cart]
formula: "RestaurantOrdering = ProductListing(t-product-listing) + CartPage(t-cart-page) + CheckoutPage(t-checkout-page) + DashboardLayout(t-dashboard-layout) + AuthLayout(t-auth-layout) + SettingsPage(t-settings-page) + Cart(o-cart) + CheckoutForm(o-checkout-form) + CheckoutSummary(o-checkout-summary) + ProductCard(o-product-card) + FileUploader(o-file-uploader) + Header(o-header) + Footer(o-footer) + Hero(o-hero) + Calendar(o-calendar) + DataTable(o-data-table) + Chart(o-chart) + StatsDashboard(o-stats-dashboard) + NotificationCenter(o-notification-center) + SettingsForm(o-settings-form) + Card(m-card) + StatCard(m-stat-card) + Breadcrumb(m-breadcrumb) + Pagination(m-pagination) + FormField(m-form-field) + DatePicker(m-date-picker) + AddressInput(m-address-input) + EmptyState(m-empty-state) + Rating(m-rating) + NextAuth(pt-next-auth) + AuthMiddleware(pt-auth-middleware) + Rbac(pt-rbac) + RateLimiting(pt-rate-limiting) + AuditLogging(pt-audit-logging) + Zustand(pt-zustand) + OptimisticUpdates(pt-optimistic-updates) + ReactQuery(pt-react-query) + Websockets(pt-websockets) + ServerSentEvents(pt-server-sent-events) + PushNotifications(pt-push-notifications) + MapsIntegration(pt-maps-integration) + Geolocation(pt-geolocation) + StripeCheckout(pt-stripe-checkout) + StripeWebhooks(pt-stripe-webhooks) + FormValidation(pt-form-validation) + ZodSchemas(pt-zod-schemas) + ServerActions(pt-server-actions) + Mutations(pt-mutations) + TransactionalEmail(pt-transactional-email) + EmailTemplates(pt-email-templates) + FileUpload(pt-file-upload) + FileStorage(pt-file-storage) + ImageOptimization(pt-image-optimization) + DatePickers(pt-date-pickers) + Sitemap(pt-sitemap) + StructuredData(pt-structured-data) + MetadataApi(pt-metadata-api) + ErrorBoundaries(pt-error-boundaries) + ErrorTracking(pt-error-tracking) + SkeletonLoading(pt-skeleton-loading) + AnalyticsEvents(pt-analytics-events) + Pagination(pt-pagination) + Filtering(pt-filtering) + Sorting(pt-sorting) + TestingE2e(pt-testing-e2e)"
composes:
  # L2 Molecules - UI Building Blocks
  - ../molecules/card.md
  - ../molecules/stat-card.md
  - ../molecules/breadcrumb.md
  - ../molecules/pagination.md
  - ../molecules/form-field.md
  - ../molecules/date-picker.md
  - ../molecules/address-input.md
  - ../molecules/empty-state.md
  - ../molecules/rating.md
  # L3 Organisms - Complex Components
  - ../organisms/cart.md
  - ../organisms/checkout-form.md
  - ../organisms/checkout-summary.md
  - ../organisms/product-card.md
  - ../organisms/file-uploader.md
  - ../organisms/header.md
  - ../organisms/footer.md
  - ../organisms/hero.md
  - ../organisms/calendar.md
  - ../organisms/data-table.md
  - ../organisms/chart.md
  - ../organisms/stats-dashboard.md
  - ../organisms/notification-center.md
  - ../organisms/settings-form.md
  # L4 Templates - Page Layouts
  - ../templates/product-listing.md
  - ../templates/cart-page.md
  - ../templates/checkout-page.md
  - ../templates/dashboard-layout.md
  - ../templates/auth-layout.md
  - ../templates/settings-page.md
  # L5 Patterns - Authentication & Security
  - ../patterns/next-auth.md
  - ../patterns/auth-middleware.md
  - ../patterns/rbac.md
  - ../patterns/rate-limiting.md
  - ../patterns/audit-logging.md
  # L5 Patterns - State & Real-time
  - ../patterns/zustand.md
  - ../patterns/optimistic-updates.md
  - ../patterns/react-query.md
  - ../patterns/websockets.md
  - ../patterns/server-sent-events.md
  - ../patterns/push-notifications.md
  # L5 Patterns - Location
  - ../patterns/maps-integration.md
  - ../patterns/geolocation.md
  # L5 Patterns - Payments
  - ../patterns/stripe-checkout.md
  - ../patterns/stripe-webhooks.md
  # L5 Patterns - Forms & Validation
  - ../patterns/form-validation.md
  - ../patterns/zod-schemas.md
  - ../patterns/server-actions.md
  - ../patterns/mutations.md
  # L5 Patterns - Communication
  - ../patterns/transactional-email.md
  - ../patterns/email-templates.md
  # L5 Patterns - File & Image
  - ../patterns/file-upload.md
  - ../patterns/file-storage.md
  - ../patterns/image-optimization.md
  # L5 Patterns - Calendar
  - ../patterns/date-pickers.md
  # L5 Patterns - SEO
  - ../patterns/sitemap.md
  - ../patterns/structured-data.md
  - ../patterns/metadata-api.md
  # L5 Patterns - Error Handling & UX
  - ../patterns/error-boundaries.md
  - ../patterns/error-tracking.md
  - ../patterns/skeleton-loading.md
  # L5 Patterns - Analytics
  - ../patterns/analytics-events.md
  # L5 Patterns - Data Management
  - ../patterns/pagination.md
  - ../patterns/filtering.md
  - ../patterns/sorting.md
  # L5 Patterns - Testing
  - ../patterns/testing-e2e.md
dependencies:
  - next@15.0.0
  - react@19.0.0
  - prisma@6.0.0
  - stripe@14.0.0
  - pusher-js@8.0.0
skills:
  - cart-management
  - stripe-integration
  - realtime-updates
  - geolocation
  - image-upload
performance:
  impact: high
  lcp: medium
  cls: low
accessibility:
  wcag: AA
  keyboard: true
  screen-reader: true
---

## Overview

A complete restaurant ordering platform enabling customers to browse menus, place orders for delivery/pickup/dine-in, make table reservations, and track deliveries in real-time. Includes restaurant admin dashboard for menu management, order processing, and analytics.

## Project Structure

```
app/
├── (marketing)/
│   ├── layout.tsx
│   ├── page.tsx                    # Restaurant homepage
│   └── about/page.tsx
├── menu/
│   ├── page.tsx                    # Full menu
│   └── [category]/page.tsx         # Category view
├── order/
│   ├── page.tsx                    # Cart & checkout
│   ├── confirmation/page.tsx       # Order confirmed
│   └── track/[id]/page.tsx         # Track order
├── reservations/
│   ├── page.tsx                    # Make reservation
│   └── confirmation/page.tsx
├── (admin)/                        # Restaurant admin
│   ├── layout.tsx
│   ├── page.tsx                    # Dashboard
│   ├── orders/
│   │   ├── page.tsx                # Order queue
│   │   └── [id]/page.tsx           # Order detail
│   ├── menu/
│   │   ├── page.tsx                # Menu management
│   │   ├── items/
│   │   │   ├── page.tsx
│   │   │   ├── new/page.tsx
│   │   │   └── [id]/page.tsx
│   │   └── categories/page.tsx
│   ├── reservations/page.tsx
│   ├── tables/page.tsx             # Table management
│   ├── analytics/page.tsx
│   └── settings/
│       ├── page.tsx
│       ├── hours/page.tsx
│       ├── delivery/page.tsx
│       └── payments/page.tsx
├── api/
│   ├── menu/
│   │   ├── route.ts
│   │   ├── items/route.ts
│   │   └── categories/route.ts
│   ├── orders/
│   │   ├── route.ts
│   │   ├── [id]/route.ts
│   │   └── [id]/status/route.ts
│   ├── cart/route.ts
│   ├── reservations/route.ts
│   ├── checkout/route.ts
│   └── webhooks/stripe/route.ts
└── components/
    ├── menu/
    │   ├── menu-item.tsx
    │   ├── category-nav.tsx
    │   ├── item-modal.tsx
    │   └── modifier-selector.tsx
    ├── cart/
    │   ├── cart-drawer.tsx
    │   ├── cart-item.tsx
    │   └── cart-summary.tsx
    ├── order/
    │   ├── order-type-selector.tsx
    │   ├── delivery-form.tsx
    │   ├── order-timeline.tsx
    │   └── live-tracking.tsx
    ├── reservations/
    │   ├── date-picker.tsx
    │   ├── time-slots.tsx
    │   └── party-size.tsx
    └── admin/
        ├── order-card.tsx
        ├── order-queue.tsx
        ├── menu-editor.tsx
        └── analytics-charts.tsx
lib/
├── cart.ts
├── pusher.ts
└── delivery.ts
stores/
└── cart-store.ts
```

## Database Schema

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Restaurant {
  id              String    @id @default(cuid())
  name            String
  slug            String    @unique
  description     String?   @db.Text
  
  // Contact
  email           String
  phone           String
  
  // Address
  address         String
  city            String
  state           String
  postalCode      String
  latitude        Float?
  longitude       Float?
  
  // Media
  logoUrl         String?
  bannerUrl       String?
  
  // Settings
  currency        String    @default("USD")
  timezone        String    @default("America/New_York")
  
  // Delivery settings
  deliveryEnabled Boolean   @default(true)
  deliveryFee     Decimal   @default(0) @db.Decimal(10, 2)
  deliveryRadius  Float?    // Miles
  minOrderAmount  Decimal?  @db.Decimal(10, 2)
  
  // Pickup settings
  pickupEnabled   Boolean   @default(true)
  pickupPrepTime  Int       @default(20) // Minutes
  
  // Dine-in settings
  dineInEnabled   Boolean   @default(true)
  
  // Stripe
  stripeAccountId String?
  
  categories      Category[]
  menuItems       MenuItem[]
  orders          Order[]
  tables          Table[]
  reservations    Reservation[]
  hours           BusinessHour[]
  
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}

model BusinessHour {
  id           String     @id @default(cuid())
  restaurantId String
  dayOfWeek    Int        // 0-6
  openTime     String     // HH:mm
  closeTime    String     // HH:mm
  isClosed     Boolean    @default(false)
  
  restaurant   Restaurant @relation(fields: [restaurantId], references: [id], onDelete: Cascade)
  
  @@unique([restaurantId, dayOfWeek])
}

model Category {
  id           String     @id @default(cuid())
  restaurantId String
  name         String
  slug         String
  description  String?
  imageUrl     String?
  order        Int        @default(0)
  isActive     Boolean    @default(true)
  
  restaurant   Restaurant @relation(fields: [restaurantId], references: [id], onDelete: Cascade)
  items        MenuItem[]
  
  @@unique([restaurantId, slug])
  @@index([restaurantId])
}

model MenuItem {
  id              String          @id @default(cuid())
  restaurantId    String
  categoryId      String
  
  name            String
  slug            String
  description     String?         @db.Text
  
  price           Decimal         @db.Decimal(10, 2)
  comparePrice    Decimal?        @db.Decimal(10, 2)
  
  // Media
  imageUrl        String?
  
  // Availability
  isActive        Boolean         @default(true)
  isAvailable     Boolean         @default(true)
  
  // Dietary info
  isVegetarian    Boolean         @default(false)
  isVegan         Boolean         @default(false)
  isGlutenFree    Boolean         @default(false)
  isSpicy         Boolean         @default(false)
  
  // Nutrition
  calories        Int?
  
  // Prep
  prepTime        Int?            // Minutes
  
  order           Int             @default(0)
  
  restaurant      Restaurant      @relation(fields: [restaurantId], references: [id], onDelete: Cascade)
  category        Category        @relation(fields: [categoryId], references: [id])
  modifierGroups  ModifierGroup[]
  orderItems      OrderItem[]
  
  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt
  
  @@unique([restaurantId, slug])
  @@index([restaurantId])
  @@index([categoryId])
}

model ModifierGroup {
  id          String     @id @default(cuid())
  menuItemId  String
  
  name        String     // e.g., "Size", "Toppings"
  required    Boolean    @default(false)
  minSelect   Int        @default(0)
  maxSelect   Int        @default(1)
  
  menuItem    MenuItem   @relation(fields: [menuItemId], references: [id], onDelete: Cascade)
  modifiers   Modifier[]
  
  @@index([menuItemId])
}

model Modifier {
  id              String        @id @default(cuid())
  groupId         String
  
  name            String
  price           Decimal       @default(0) @db.Decimal(10, 2)
  isDefault       Boolean       @default(false)
  isAvailable     Boolean       @default(true)
  order           Int           @default(0)
  
  group           ModifierGroup @relation(fields: [groupId], references: [id], onDelete: Cascade)
  
  @@index([groupId])
}

model Order {
  id              String      @id @default(cuid())
  restaurantId    String
  orderNumber     String
  
  // Customer
  customerName    String
  customerEmail   String
  customerPhone   String
  
  // Type
  type            OrderType
  
  // Status
  status          OrderStatus @default(PENDING)
  
  // Delivery info
  deliveryAddress String?
  deliveryCity    String?
  deliveryState   String?
  deliveryPostal  String?
  deliveryLat     Float?
  deliveryLng     Float?
  deliveryInstructions String?
  
  // Pickup/dine-in info
  tableId         String?
  pickupTime      DateTime?
  
  // Pricing
  subtotal        Decimal     @db.Decimal(10, 2)
  tax             Decimal     @db.Decimal(10, 2)
  deliveryFee     Decimal     @default(0) @db.Decimal(10, 2)
  tip             Decimal     @default(0) @db.Decimal(10, 2)
  discount        Decimal     @default(0) @db.Decimal(10, 2)
  total           Decimal     @db.Decimal(10, 2)
  
  // Payment
  stripePaymentIntentId String?
  paymentStatus   PaymentStatus @default(PENDING)
  
  // Notes
  notes           String?
  
  // Timing
  prepTime        Int?        // Estimated minutes
  estimatedReady  DateTime?
  actualReady     DateTime?
  
  // Driver (for delivery)
  driverName      String?
  driverPhone     String?
  driverLocation  Json?       // { lat, lng }
  
  restaurant      Restaurant  @relation(fields: [restaurantId], references: [id])
  table           Table?      @relation(fields: [tableId], references: [id])
  items           OrderItem[]
  statusHistory   OrderStatusHistory[]
  
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt
  
  @@index([restaurantId])
  @@index([status])
  @@index([createdAt])
}

enum OrderType {
  DELIVERY
  PICKUP
  DINE_IN
}

enum OrderStatus {
  PENDING
  CONFIRMED
  PREPARING
  READY
  OUT_FOR_DELIVERY
  DELIVERED
  COMPLETED
  CANCELLED
}

enum PaymentStatus {
  PENDING
  PAID
  FAILED
  REFUNDED
}

model OrderItem {
  id          String   @id @default(cuid())
  orderId     String
  menuItemId  String
  
  name        String   // Snapshot of item name
  quantity    Int
  unitPrice   Decimal  @db.Decimal(10, 2)
  totalPrice  Decimal  @db.Decimal(10, 2)
  
  // Selected modifiers (JSON snapshot)
  modifiers   Json?
  
  notes       String?
  
  order       Order    @relation(fields: [orderId], references: [id], onDelete: Cascade)
  menuItem    MenuItem @relation(fields: [menuItemId], references: [id])
  
  @@index([orderId])
}

model OrderStatusHistory {
  id        String      @id @default(cuid())
  orderId   String
  status    OrderStatus
  note      String?
  
  order     Order       @relation(fields: [orderId], references: [id], onDelete: Cascade)
  
  createdAt DateTime    @default(now())
  
  @@index([orderId])
}

model Table {
  id           String        @id @default(cuid())
  restaurantId String
  
  name         String        // e.g., "Table 1", "Patio A"
  capacity     Int
  location     String?       // e.g., "Indoor", "Patio"
  isActive     Boolean       @default(true)
  
  restaurant   Restaurant    @relation(fields: [restaurantId], references: [id], onDelete: Cascade)
  reservations Reservation[]
  orders       Order[]
  
  @@index([restaurantId])
}

model Reservation {
  id           String            @id @default(cuid())
  restaurantId String
  tableId      String?
  
  // Customer
  customerName  String
  customerEmail String
  customerPhone String
  
  partySize    Int
  date         DateTime          @db.Date
  time         String            // HH:mm
  duration     Int               @default(90) // Minutes
  
  status       ReservationStatus @default(PENDING)
  
  notes        String?
  specialRequests String?
  
  restaurant   Restaurant        @relation(fields: [restaurantId], references: [id])
  table        Table?            @relation(fields: [tableId], references: [id])
  
  createdAt    DateTime          @default(now())
  
  @@index([restaurantId])
  @@index([date])
  @@index([status])
}

enum ReservationStatus {
  PENDING
  CONFIRMED
  SEATED
  COMPLETED
  CANCELLED
  NO_SHOW
}
```

## Implementation

### Menu Page with Cart

```tsx
// app/menu/page.tsx
import { prisma } from '@/lib/prisma';
import { CategoryNav } from '@/components/menu/category-nav';
import { MenuSection } from '@/components/menu/menu-section';
import { CartDrawer } from '@/components/cart/cart-drawer';

export default async function MenuPage() {
  const restaurant = await prisma.restaurant.findFirst({
    include: {
      categories: {
        where: { isActive: true },
        orderBy: { order: 'asc' },
        include: {
          items: {
            where: { isActive: true },
            orderBy: { order: 'asc' },
            include: {
              modifierGroups: {
                include: { modifiers: { orderBy: { order: 'asc' } } },
              },
            },
          },
        },
      },
    },
  });
  
  if (!restaurant) {
    return <div>Restaurant not found</div>;
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sticky Category Nav */}
      <CategoryNav categories={restaurant.categories} />
      
      {/* Menu Content */}
      <div className="max-w-4xl mx-auto px-4 py-6 pb-24">
        {restaurant.categories.map((category) => (
          <MenuSection
            key={category.id}
            category={category}
            items={category.items}
          />
        ))}
      </div>
      
      {/* Cart Drawer */}
      <CartDrawer restaurantId={restaurant.id} />
    </div>
  );
}
```

### Menu Item Component with Modal

```tsx
// components/menu/menu-item.tsx
'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useCartStore } from '@/stores/cart-store';
import { ItemModal } from './item-modal';

interface MenuItemProps {
  item: {
    id: string;
    name: string;
    description: string | null;
    price: number;
    imageUrl: string | null;
    isAvailable: boolean;
    isVegetarian: boolean;
    isVegan: boolean;
    isGlutenFree: boolean;
    isSpicy: boolean;
    modifierGroups: any[];
  };
}

export function MenuItem({ item }: MenuItemProps) {
  const [showModal, setShowModal] = useState(false);
  const addItem = useCartStore((state) => state.addItem);
  
  const handleQuickAdd = () => {
    if (item.modifierGroups.length > 0) {
      setShowModal(true);
    } else {
      addItem({
        menuItemId: item.id,
        name: item.name,
        price: item.price,
        quantity: 1,
        modifiers: [],
      });
    }
  };
  
  return (
    <>
      <div
        onClick={() => setShowModal(true)}
        className={`bg-white rounded-lg border p-4 flex gap-4 cursor-pointer hover:shadow-md transition-shadow ${
          !item.isAvailable ? 'opacity-50' : ''
        }`}
      >
        {/* Image */}
        {item.imageUrl && (
          <img
            src={item.imageUrl}
            alt={item.name}
            className="w-24 h-24 object-cover rounded-lg"
          />
        )}
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-medium">{item.name}</h3>
              
              {/* Dietary badges */}
              <div className="flex gap-1 mt-1">
                {item.isVegetarian && (
                  <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded">V</span>
                )}
                {item.isVegan && (
                  <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded">VG</span>
                )}
                {item.isGlutenFree && (
                  <span className="text-xs bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded">GF</span>
                )}
                {item.isSpicy && (
                  <span className="text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded">🌶️</span>
                )}
              </div>
            </div>
            
            <span className="font-semibold">${item.price.toFixed(2)}</span>
          </div>
          
          {item.description && (
            <p className="text-sm text-gray-500 mt-1 line-clamp-2">
              {item.description}
            </p>
          )}
        </div>
        
        {/* Add button */}
        {item.isAvailable && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleQuickAdd();
            }}
            className="self-center p-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700"
          >
            <Plus className="h-5 w-5" />
          </button>
        )}
      </div>
      
      {/* Item Modal */}
      {showModal && (
        <ItemModal
          item={item}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}
```

### Cart Store (Zustand)

```tsx
// stores/cart-store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CartItem {
  id: string;
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  modifiers: Array<{
    groupName: string;
    name: string;
    price: number;
  }>;
  notes?: string;
}

interface CartState {
  items: CartItem[];
  restaurantId: string | null;
  orderType: 'DELIVERY' | 'PICKUP' | 'DINE_IN';
  
  // Actions
  setRestaurant: (id: string) => void;
  setOrderType: (type: 'DELIVERY' | 'PICKUP' | 'DINE_IN') => void;
  addItem: (item: Omit<CartItem, 'id'>) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  removeItem: (itemId: string) => void;
  clearCart: () => void;
  
  // Computed
  getSubtotal: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      restaurantId: null,
      orderType: 'PICKUP',
      
      setRestaurant: (id) => set({ restaurantId: id }),
      
      setOrderType: (type) => set({ orderType: type }),
      
      addItem: (item) => {
        const id = crypto.randomUUID();
        set((state) => ({
          items: [...state.items, { ...item, id }],
        }));
      },
      
      updateQuantity: (itemId, quantity) => {
        if (quantity <= 0) {
          set((state) => ({
            items: state.items.filter((i) => i.id !== itemId),
          }));
        } else {
          set((state) => ({
            items: state.items.map((i) =>
              i.id === itemId ? { ...i, quantity } : i
            ),
          }));
        }
      },
      
      removeItem: (itemId) => {
        set((state) => ({
          items: state.items.filter((i) => i.id !== itemId),
        }));
      },
      
      clearCart: () => set({ items: [] }),
      
      getSubtotal: () => {
        const { items } = get();
        return items.reduce((sum, item) => {
          const modifierTotal = item.modifiers.reduce((m, mod) => m + mod.price, 0);
          return sum + (item.price + modifierTotal) * item.quantity;
        }, 0);
      },
      
      getItemCount: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },
    }),
    {
      name: 'cart-storage',
    }
  )
);
```

### Order Tracking Page

```tsx
// app/order/track/[id]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Pusher from 'pusher-js';
import { OrderTimeline } from '@/components/order/order-timeline';
import { LiveTracking } from '@/components/order/live-tracking';
import { format } from 'date-fns';

export default function TrackOrderPage() {
  const { id } = useParams();
  const [order, setOrder] = useState<any>(null);
  
  // Fetch initial order
  const { data: initialOrder } = useQuery({
    queryKey: ['order', id],
    queryFn: async () => {
      const res = await fetch(`/api/orders/${id}`);
      return res.json();
    },
  });
  
  // Subscribe to real-time updates
  useEffect(() => {
    if (!id) return;
    
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    });
    
    const channel = pusher.subscribe(`order-${id}`);
    
    channel.bind('status-update', (data: any) => {
      setOrder((prev: any) => ({ ...prev, ...data }));
    });
    
    channel.bind('driver-location', (data: any) => {
      setOrder((prev: any) => ({ ...prev, driverLocation: data }));
    });
    
    return () => {
      channel.unbind_all();
      pusher.unsubscribe(`order-${id}`);
    };
  }, [id]);
  
  const displayOrder = order || initialOrder;
  
  if (!displayOrder) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full" />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-4 py-6">
        <div className="max-w-2xl mx-auto">
          <p className="text-sm text-gray-500">Order #{displayOrder.orderNumber}</p>
          <h1 className="text-2xl font-bold mt-1">
            {displayOrder.status === 'DELIVERED' || displayOrder.status === 'COMPLETED'
              ? 'Order Complete!'
              : 'Tracking Your Order'}
          </h1>
          
          {displayOrder.estimatedReady && displayOrder.status !== 'COMPLETED' && (
            <p className="text-gray-600 mt-2">
              Estimated {displayOrder.type === 'DELIVERY' ? 'delivery' : 'ready'}: {' '}
              <span className="font-medium">
                {format(new Date(displayOrder.estimatedReady), 'h:mm a')}
              </span>
            </p>
          )}
        </div>
      </div>
      
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Live Map for Delivery */}
        {displayOrder.type === 'DELIVERY' && 
         displayOrder.status === 'OUT_FOR_DELIVERY' && 
         displayOrder.driverLocation && (
          <LiveTracking
            driverLocation={displayOrder.driverLocation}
            destinationLat={displayOrder.deliveryLat}
            destinationLng={displayOrder.deliveryLng}
            driverName={displayOrder.driverName}
            driverPhone={displayOrder.driverPhone}
          />
        )}
        
        {/* Order Timeline */}
        <div className="bg-white rounded-lg border p-6">
          <OrderTimeline
            status={displayOrder.status}
            type={displayOrder.type}
            history={displayOrder.statusHistory}
          />
        </div>
        
        {/* Order Details */}
        <div className="bg-white rounded-lg border p-6">
          <h2 className="font-semibold mb-4">Order Details</h2>
          
          <div className="space-y-3">
            {displayOrder.items.map((item: any) => (
              <div key={item.id} className="flex justify-between">
                <div>
                  <span className="font-medium">{item.quantity}x</span> {item.name}
                  {item.modifiers?.length > 0 && (
                    <p className="text-sm text-gray-500">
                      {item.modifiers.map((m: any) => m.name).join(', ')}
                    </p>
                  )}
                </div>
                <span>${Number(item.totalPrice).toFixed(2)}</span>
              </div>
            ))}
          </div>
          
          <div className="border-t mt-4 pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span>Subtotal</span>
              <span>${Number(displayOrder.subtotal).toFixed(2)}</span>
            </div>
            {Number(displayOrder.deliveryFee) > 0 && (
              <div className="flex justify-between text-sm">
                <span>Delivery Fee</span>
                <span>${Number(displayOrder.deliveryFee).toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span>Tax</span>
              <span>${Number(displayOrder.tax).toFixed(2)}</span>
            </div>
            {Number(displayOrder.tip) > 0 && (
              <div className="flex justify-between text-sm">
                <span>Tip</span>
                <span>${Number(displayOrder.tip).toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between font-semibold pt-2 border-t">
              <span>Total</span>
              <span>${Number(displayOrder.total).toFixed(2)}</span>
            </div>
          </div>
        </div>
        
        {/* Delivery Address */}
        {displayOrder.type === 'DELIVERY' && (
          <div className="bg-white rounded-lg border p-6">
            <h2 className="font-semibold mb-2">Delivery Address</h2>
            <p className="text-gray-600">
              {displayOrder.deliveryAddress}<br />
              {displayOrder.deliveryCity}, {displayOrder.deliveryState} {displayOrder.deliveryPostal}
            </p>
            {displayOrder.deliveryInstructions && (
              <p className="text-sm text-gray-500 mt-2">
                Note: {displayOrder.deliveryInstructions}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
```

### Admin Order Queue

```tsx
// components/admin/order-queue.tsx
'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Pusher from 'pusher-js';
import { format } from 'date-fns';
import { Clock, MapPin, User, ChefHat, Check, Truck } from 'lucide-react';

const STATUS_FLOW = {
  PENDING: 'CONFIRMED',
  CONFIRMED: 'PREPARING',
  PREPARING: 'READY',
  READY: 'OUT_FOR_DELIVERY',
  OUT_FOR_DELIVERY: 'DELIVERED',
};

export function OrderQueue({ restaurantId }: { restaurantId: string }) {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<string>('active');
  
  // Fetch orders
  const { data: orders } = useQuery({
    queryKey: ['orders', filter],
    queryFn: async () => {
      const res = await fetch(`/api/orders?filter=${filter}`);
      return res.json();
    },
    refetchInterval: 30000, // Refresh every 30s
  });
  
  // Real-time updates
  useEffect(() => {
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    });
    
    const channel = pusher.subscribe(`restaurant-${restaurantId}`);
    
    channel.bind('new-order', () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      // Play notification sound
      new Audio('/sounds/new-order.mp3').play();
    });
    
    return () => {
      channel.unbind_all();
      pusher.unsubscribe(`restaurant-${restaurantId}`);
    };
  }, [restaurantId, queryClient]);
  
  // Update order status
  const updateStatus = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: string }) => {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-700';
      case 'CONFIRMED': return 'bg-blue-100 text-blue-700';
      case 'PREPARING': return 'bg-purple-100 text-purple-700';
      case 'READY': return 'bg-green-100 text-green-700';
      case 'OUT_FOR_DELIVERY': return 'bg-indigo-100 text-indigo-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };
  
  const getNextAction = (order: any) => {
    const nextStatus = STATUS_FLOW[order.status as keyof typeof STATUS_FLOW];
    if (!nextStatus) return null;
    
    const labels: Record<string, { label: string; icon: any }> = {
      CONFIRMED: { label: 'Accept', icon: Check },
      PREPARING: { label: 'Start Prep', icon: ChefHat },
      READY: { label: 'Mark Ready', icon: Check },
      OUT_FOR_DELIVERY: { label: 'Out for Delivery', icon: Truck },
      DELIVERED: { label: 'Complete', icon: Check },
    };
    
    return labels[nextStatus];
  };
  
  return (
    <div>
      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6">
        {['active', 'completed', 'cancelled'].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-4 py-2 rounded-lg font-medium capitalize ${
              filter === tab
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
      
      {/* Orders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {orders?.map((order: any) => {
          const nextAction = getNextAction(order);
          
          return (
            <div key={order.id} className="bg-white rounded-lg border shadow-sm">
              {/* Header */}
              <div className="p-4 border-b flex items-center justify-between">
                <div>
                  <span className="font-bold">#{order.orderNumber}</span>
                  <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </div>
                <span className="text-sm text-gray-500">
                  {format(new Date(order.createdAt), 'h:mm a')}
                </span>
              </div>
              
              {/* Customer & Type */}
              <div className="p-4 border-b">
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-gray-400" />
                  <span>{order.customerName}</span>
                </div>
                <div className="flex items-center gap-2 text-sm mt-1">
                  {order.type === 'DELIVERY' ? (
                    <>
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span className="truncate">{order.deliveryAddress}</span>
                    </>
                  ) : order.type === 'PICKUP' ? (
                    <>
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span>Pickup @ {format(new Date(order.pickupTime), 'h:mm a')}</span>
                    </>
                  ) : (
                    <>
                      <span>Table {order.table?.name}</span>
                    </>
                  )}
                </div>
              </div>
              
              {/* Items */}
              <div className="p-4 border-b max-h-40 overflow-y-auto">
                {order.items.map((item: any) => (
                  <div key={item.id} className="flex justify-between text-sm mb-1">
                    <span>
                      <span className="font-medium">{item.quantity}x</span> {item.name}
                    </span>
                  </div>
                ))}
                {order.notes && (
                  <p className="text-xs text-orange-600 mt-2 p-2 bg-orange-50 rounded">
                    Note: {order.notes}
                  </p>
                )}
              </div>
              
              {/* Footer */}
              <div className="p-4 flex items-center justify-between">
                <span className="font-bold">${Number(order.total).toFixed(2)}</span>
                
                {nextAction && (
                  <button
                    onClick={() => updateStatus.mutate({
                      orderId: order.id,
                      status: STATUS_FLOW[order.status as keyof typeof STATUS_FLOW],
                    })}
                    disabled={updateStatus.isPending}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
                  >
                    <nextAction.icon className="h-4 w-4" />
                    {nextAction.label}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
      
      {orders?.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No {filter} orders
        </div>
      )}
    </div>
  );
}
```

## Skills Used

| Skill | Layer | Purpose |
|-------|-------|---------|
| ProductListing | L5 | Menu display with categories |
| CartPage | L5 | Order review before checkout |
| CheckoutPage | L5 | Payment and delivery info |
| DashboardLayout | L5 | Restaurant admin panel |
| Cart | L4 | Shopping cart with modifiers |
| CheckoutForm | L4 | Customer and delivery details |
| CheckoutSummary | L4 | Order totals and fees |
| ProductCard | L4 | Menu item display |
| FileUploader | L4 | Menu item images |
| ZustandPattern | L3 | Cart state management |
| OptimisticUpdatesPattern | L3 | Order status updates |

## Testing

### Setup

```bash
pnpm add -D vitest @testing-library/react @testing-library/user-event @vitejs/plugin-react jsdom msw
```

```ts
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    include: ['**/*.test.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      exclude: ['node_modules/', 'tests/'],
    },
  },
});
```

### Unit Tests

```tsx
// stores/cart-store.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { useCartStore } from './cart-store';

describe('Cart Store', () => {
  beforeEach(() => {
    useCartStore.setState({ items: [], restaurantId: null });
  });

  it('adds item to cart', () => {
    useCartStore.getState().addItem({
      menuItemId: 'item-1',
      name: 'Margherita Pizza',
      price: 14.99,
      quantity: 1,
      modifiers: [],
    });

    const { items } = useCartStore.getState();
    expect(items).toHaveLength(1);
    expect(items[0].name).toBe('Margherita Pizza');
  });

  it('calculates subtotal with modifiers', () => {
    useCartStore.getState().addItem({
      menuItemId: 'item-1',
      name: 'Burger',
      price: 12.99,
      quantity: 2,
      modifiers: [
        { groupName: 'Toppings', name: 'Bacon', price: 2.00 },
        { groupName: 'Toppings', name: 'Cheese', price: 1.00 },
      ],
    });

    const subtotal = useCartStore.getState().getSubtotal();
    // (12.99 + 2.00 + 1.00) * 2 = 31.98
    expect(subtotal).toBe(31.98);
  });

  it('updates item quantity', () => {
    useCartStore.getState().addItem({
      menuItemId: 'item-1',
      name: 'Salad',
      price: 9.99,
      quantity: 1,
      modifiers: [],
    });

    const itemId = useCartStore.getState().items[0].id;
    useCartStore.getState().updateQuantity(itemId, 3);

    expect(useCartStore.getState().items[0].quantity).toBe(3);
  });

  it('removes item when quantity set to 0', () => {
    useCartStore.getState().addItem({
      menuItemId: 'item-1',
      name: 'Salad',
      price: 9.99,
      quantity: 1,
      modifiers: [],
    });

    const itemId = useCartStore.getState().items[0].id;
    useCartStore.getState().updateQuantity(itemId, 0);

    expect(useCartStore.getState().items).toHaveLength(0);
  });
});
```

### Integration Tests

```tsx
// tests/integration/checkout.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CheckoutPage } from '@/app/order/page';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { useCartStore } from '@/stores/cart-store';

const server = setupServer(
  http.post('/api/checkout', async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({
      orderId: 'order-123',
      orderNumber: 'A001',
      total: body.total,
    });
  }),
  http.post('/api/orders', () => {
    return HttpResponse.json({ id: 'order-123', status: 'PENDING' });
  })
);

beforeAll(() => server.listen());
afterEach(() => {
  server.resetHandlers();
  useCartStore.setState({ items: [], restaurantId: null });
});
afterAll(() => server.close());

describe('Checkout Flow', () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  beforeEach(() => {
    useCartStore.getState().addItem({
      menuItemId: 'pizza-1',
      name: 'Pepperoni Pizza',
      price: 16.99,
      quantity: 1,
      modifiers: [],
    });
    useCartStore.getState().setRestaurant('restaurant-123');
  });

  it('displays cart items and total', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <CheckoutPage />
      </QueryClientProvider>
    );

    expect(screen.getByText('Pepperoni Pizza')).toBeInTheDocument();
    expect(screen.getByText('$16.99')).toBeInTheDocument();
  });

  it('submits order with delivery info', async () => {
    const user = userEvent.setup();

    render(
      <QueryClientProvider client={queryClient}>
        <CheckoutPage />
      </QueryClientProvider>
    );

    // Fill delivery form
    await user.type(screen.getByLabelText(/name/i), 'John Doe');
    await user.type(screen.getByLabelText(/email/i), 'john@example.com');
    await user.type(screen.getByLabelText(/phone/i), '555-123-4567');
    await user.type(screen.getByLabelText(/address/i), '123 Main St');

    await user.click(screen.getByRole('button', { name: /place order/i }));

    await waitFor(() => {
      expect(screen.getByText(/order confirmed/i)).toBeInTheDocument();
    });
  });
});
```

### E2E Tests

```ts
// tests/e2e/ordering-flow.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Restaurant Ordering', () => {
  test('complete order from menu to checkout', async ({ page }) => {
    await page.goto('/menu');

    // Add item to cart
    await page.click('text=Margherita Pizza');
    await expect(page.getByRole('dialog')).toBeVisible();

    // Select modifiers
    await page.click('text=Large');
    await page.click('text=Extra Cheese');
    await page.click('button:has-text("Add to Order")');

    // Check cart
    await expect(page.getByTestId('cart-count')).toHaveText('1');

    // Go to checkout
    await page.click('button:has-text("View Cart")');
    await expect(page).toHaveURL('/order');

    // Fill checkout form
    await page.fill('input[name="customerName"]', 'Test User');
    await page.fill('input[name="customerEmail"]', 'test@example.com');
    await page.fill('input[name="customerPhone"]', '555-123-4567');

    // Select pickup
    await page.click('text=Pickup');
    await page.selectOption('select[name="pickupTime"]', { index: 1 });

    // Place order
    await page.click('button:has-text("Place Order")');

    // Verify confirmation
    await expect(page).toHaveURL(/\/order\/confirmation/);
    await expect(page.getByText('Order Confirmed')).toBeVisible();
  });

  test('tracks order in real-time', async ({ page }) => {
    // Assume order exists
    await page.goto('/order/track/test-order-123');

    await expect(page.getByText('Order #')).toBeVisible();
    await expect(page.getByText('Estimated')).toBeVisible();

    // Verify timeline is visible
    await expect(page.getByTestId('order-timeline')).toBeVisible();
  });
});
```

## Error Handling

### Error Boundary

```tsx
// components/error-boundary.tsx
'use client';

import { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, ShoppingBag } from 'lucide-react';
import Link from 'next/link';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Restaurant ordering error:', error, errorInfo);
    // Send to error tracking service
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <div className="text-center max-w-md">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
            <p className="text-gray-600 mb-6">
              We couldn't load your order. Your cart items are saved.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => this.setState({ hasError: false })}
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg"
              >
                <RefreshCw className="h-4 w-4" />
                Try Again
              </button>
              <Link
                href="/menu"
                className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg"
              >
                <ShoppingBag className="h-4 w-4" />
                Back to Menu
              </Link>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
```

### API Error Handling

```ts
// lib/api-errors.ts
export class OrderAPIError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code: string
  ) {
    super(message);
    this.name = 'OrderAPIError';
  }
}

export const ErrorCodes = {
  RESTAURANT_CLOSED: 'RESTAURANT_CLOSED',
  ITEM_UNAVAILABLE: 'ITEM_UNAVAILABLE',
  MINIMUM_NOT_MET: 'MINIMUM_NOT_MET',
  DELIVERY_UNAVAILABLE: 'DELIVERY_UNAVAILABLE',
  PAYMENT_FAILED: 'PAYMENT_FAILED',
  ORDER_NOT_FOUND: 'ORDER_NOT_FOUND',
} as const;

export function handleOrderError(error: unknown): Response {
  if (error instanceof OrderAPIError) {
    return Response.json(
      { error: error.message, code: error.code },
      { status: error.statusCode }
    );
  }

  console.error('Unexpected order error:', error);
  return Response.json(
    { error: 'An unexpected error occurred', code: 'INTERNAL_ERROR' },
    { status: 500 }
  );
}
```

### Order Status Error Handling

```ts
// lib/order-status.ts
import { pusherServer } from './pusher';

export async function updateOrderStatus(
  orderId: string,
  status: string,
  note?: string
) {
  try {
    const order = await prisma.order.update({
      where: { id: orderId },
      data: { status },
    });

    await prisma.orderStatusHistory.create({
      data: { orderId, status, note },
    });

    // Notify customer in real-time
    await pusherServer.trigger(`order-${orderId}`, 'status-update', {
      status,
      updatedAt: new Date().toISOString(),
    });

    return order;
  } catch (error) {
    console.error('Failed to update order status:', error);
    throw new OrderAPIError(
      'Failed to update order status',
      500,
      'STATUS_UPDATE_FAILED'
    );
  }
}
```

## Accessibility

### WCAG 2.1 AA Compliance

| Criterion | Implementation |
|-----------|----------------|
| 1.1.1 Non-text Content | Alt text for menu item images, dietary icons |
| 1.3.1 Info and Relationships | Semantic menu categories, proper form labels |
| 1.4.3 Contrast | 4.5:1 minimum contrast for prices and descriptions |
| 2.1.1 Keyboard | Cart and checkout fully keyboard navigable |
| 2.4.4 Link Purpose | Descriptive text for menu items and order links |
| 3.3.1 Error Identification | Clear messages for out-of-stock items |
| 3.3.2 Labels or Instructions | Form field labels for checkout |
| 4.1.2 Name, Role, Value | ARIA for cart drawer and modals |

### Focus Management

```tsx
// hooks/use-item-modal-focus.ts
import { useEffect, useRef } from 'react';

export function useItemModalFocus(isOpen: boolean) {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      modalRef.current?.focus();
    } else {
      previousFocusRef.current?.focus();
    }
  }, [isOpen]);

  return modalRef;
}

// Accessible menu item card
function MenuItem({ item }: { item: MenuItem }) {
  return (
    <article
      role="article"
      aria-label={`${item.name}, ${item.price}`}
      className="..."
    >
      <img
        src={item.imageUrl}
        alt={`Photo of ${item.name}`}
        className="..."
      />
      <div className="flex gap-1">
        {item.isVegetarian && (
          <span aria-label="Vegetarian" title="Vegetarian">
            <span className="sr-only">Vegetarian</span>
            V
          </span>
        )}
        {item.isSpicy && (
          <span aria-label="Spicy" title="Spicy">
            <span className="sr-only">Spicy</span>
            🌶️
          </span>
        )}
      </div>
    </article>
  );
}
```

### Cart Accessibility

```tsx
// components/cart/cart-drawer.tsx
function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="cart-title"
      aria-describedby="cart-description"
      className="..."
    >
      <h2 id="cart-title" className="sr-only">Your Cart</h2>
      <p id="cart-description" className="sr-only">
        Review and modify items in your cart before checkout
      </p>

      {/* Cart items with aria-live for updates */}
      <div aria-live="polite" aria-atomic="false">
        {items.map((item) => (
          <CartItem key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}
```

## Security

### Input Validation

```ts
// lib/validations/order.ts
import { z } from 'zod';

export const orderSchema = z.object({
  restaurantId: z.string().cuid(),

  customerName: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters'),

  customerEmail: z.string().email('Invalid email address'),

  customerPhone: z.string()
    .regex(/^[\d\s\-\+\(\)]+$/, 'Invalid phone number')
    .min(10, 'Phone number too short'),

  type: z.enum(['DELIVERY', 'PICKUP', 'DINE_IN']),

  // Delivery fields (conditional)
  deliveryAddress: z.string().max(200).optional(),
  deliveryCity: z.string().max(100).optional(),
  deliveryState: z.string().max(50).optional(),
  deliveryPostal: z.string().max(20).optional(),
  deliveryInstructions: z.string().max(500).optional(),

  // Pickup/dine-in fields
  pickupTime: z.coerce.date().optional(),
  tableId: z.string().cuid().optional(),

  // Items
  items: z.array(z.object({
    menuItemId: z.string().cuid(),
    quantity: z.number().min(1).max(99),
    modifiers: z.array(z.object({
      groupName: z.string(),
      name: z.string(),
      price: z.number().min(0),
    })).optional(),
    notes: z.string().max(200).optional(),
  })).min(1, 'Order must have at least one item'),

  notes: z.string().max(500).optional(),
  tip: z.number().min(0).max(1000).optional(),
}).refine((data) => {
  if (data.type === 'DELIVERY') {
    return data.deliveryAddress && data.deliveryCity && data.deliveryPostal;
  }
  return true;
}, {
  message: 'Delivery address is required for delivery orders',
  path: ['deliveryAddress'],
});
```

### Rate Limiting

```ts
// middleware.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const orderRatelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, '1 m'), // 5 orders per minute
  analytics: true,
});

const menuRatelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(60, '1 m'), // 60 menu requests per minute
  analytics: true,
});

export async function middleware(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') ?? '127.0.0.1';

  if (request.nextUrl.pathname === '/api/orders' && request.method === 'POST') {
    const { success } = await orderRatelimit.limit(`order:${ip}`);

    if (!success) {
      return NextResponse.json(
        { error: 'Too many orders. Please wait before placing another order.' },
        { status: 429 }
      );
    }
  }

  if (request.nextUrl.pathname.startsWith('/api/menu')) {
    const { success } = await menuRatelimit.limit(`menu:${ip}`);

    if (!success) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429 }
      );
    }
  }

  return NextResponse.next();
}
```

## Performance

### Caching Strategy

```ts
// app/api/menu/route.ts
import { unstable_cache } from 'next/cache';

const getMenuWithCategories = unstable_cache(
  async (restaurantId: string) => {
    return prisma.restaurant.findUnique({
      where: { id: restaurantId },
      include: {
        categories: {
          where: { isActive: true },
          orderBy: { order: 'asc' },
          include: {
            items: {
              where: { isActive: true },
              orderBy: { order: 'asc' },
              include: {
                modifierGroups: {
                  include: { modifiers: true },
                },
              },
            },
          },
        },
      },
    });
  },
  ['menu'],
  { revalidate: 60, tags: ['menu'] } // Cache for 1 minute
);

export async function GET(request: NextRequest) {
  const restaurantId = request.nextUrl.searchParams.get('restaurantId');
  const menu = await getMenuWithCategories(restaurantId!);

  return Response.json(menu, {
    headers: {
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
    },
  });
}
```

### Image Optimization

```tsx
// components/menu/menu-item-image.tsx
import Image from 'next/image';

interface MenuItemImageProps {
  src: string;
  alt: string;
  priority?: boolean;
}

export function MenuItemImage({ src, alt, priority = false }: MenuItemImageProps) {
  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes="(max-width: 640px) 100px, 150px"
      className="object-cover"
      priority={priority}
      placeholder="blur"
      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD..."
    />
  );
}
```

### Real-time Optimization

```ts
// lib/pusher-batching.ts
import { pusherServer } from './pusher';

// Batch multiple order updates
const orderUpdateQueue = new Map<string, any>();
let batchTimeout: NodeJS.Timeout | null = null;

export function queueOrderUpdate(orderId: string, data: any) {
  orderUpdateQueue.set(orderId, data);

  if (!batchTimeout) {
    batchTimeout = setTimeout(async () => {
      const updates = Array.from(orderUpdateQueue.entries());
      orderUpdateQueue.clear();
      batchTimeout = null;

      // Send batched updates
      await Promise.all(
        updates.map(([id, data]) =>
          pusherServer.trigger(`order-${id}`, 'status-update', data)
        )
      );
    }, 100); // Batch within 100ms
  }
}
```

## CI/CD

### GitHub Actions

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  lint-and-test:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test
          POSTGRES_DB: restaurant_test
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v2
        with:
          version: 8

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Lint
        run: pnpm lint

      - name: Type check
        run: pnpm type-check

      - name: Setup database
        run: pnpm prisma migrate deploy
        env:
          DATABASE_URL: postgresql://test:test@localhost:5432/restaurant_test

      - name: Run tests
        run: pnpm test:coverage
        env:
          DATABASE_URL: postgresql://test:test@localhost:5432/restaurant_test
          STRIPE_SECRET_KEY: sk_test_mock
          PUSHER_APP_ID: test
          PUSHER_KEY: test
          PUSHER_SECRET: test

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info

  e2e:
    runs-on: ubuntu-latest
    needs: lint-and-test

    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v2
        with:
          version: 8

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Install Playwright
        run: pnpm exec playwright install --with-deps

      - name: Build
        run: pnpm build
        env:
          DATABASE_URL: ${{ secrets.TEST_DATABASE_URL }}

      - name: Run E2E tests
        run: pnpm test:e2e
```

## Monitoring

### Sentry Integration

```ts
// sentry.client.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,

  integrations: [
    Sentry.replayIntegration({
      maskAllText: false,
      blockAllMedia: false,
    }),
  ],

  beforeSend(event) {
    // Filter out non-critical ordering errors
    if (event.exception?.values?.[0]?.value?.includes('Cart sync')) {
      return null;
    }
    return event;
  },
});
```

### Health Check Endpoint

```ts
// app/api/health/route.ts
import { prisma } from '@/lib/prisma';
import Pusher from 'pusher';

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.PUSHER_CLUSTER!,
});

export async function GET() {
  const checks = {
    database: false,
    pusher: false,
    timestamp: new Date().toISOString(),
  };

  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.database = true;
  } catch (error) {
    console.error('Database health check failed:', error);
  }

  try {
    await pusher.trigger('health-check', 'ping', {});
    checks.pusher = true;
  } catch (error) {
    console.error('Pusher health check failed:', error);
  }

  const healthy = checks.database && checks.pusher;

  return Response.json(checks, {
    status: healthy ? 200 : 503,
  });
}
```

### Order Monitoring

```ts
// lib/order-monitoring.ts
import * as Sentry from '@sentry/nextjs';

export function trackOrderPlaced(order: {
  id: string;
  total: number;
  type: string;
  itemCount: number;
}) {
  Sentry.addBreadcrumb({
    category: 'order',
    message: 'Order placed',
    level: 'info',
    data: {
      orderId: order.id,
      total: order.total,
      type: order.type,
      itemCount: order.itemCount,
    },
  });
}

export function trackOrderStatusChange(orderId: string, fromStatus: string, toStatus: string) {
  Sentry.addBreadcrumb({
    category: 'order',
    message: `Order status: ${fromStatus} -> ${toStatus}`,
    level: 'info',
    data: { orderId, fromStatus, toStatus },
  });
}
```

## Environment Variables

```bash
# .env.example

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/restaurant_ordering"

# Authentication (Admin)
NEXTAUTH_SECRET="your-nextauth-secret-here"
NEXTAUTH_URL="http://localhost:3000"

# Stripe
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Pusher (Real-time)
PUSHER_APP_ID="your-pusher-app-id"
PUSHER_KEY="your-pusher-key"
PUSHER_SECRET="your-pusher-secret"
PUSHER_CLUSTER="us2"
NEXT_PUBLIC_PUSHER_KEY="your-pusher-key"
NEXT_PUBLIC_PUSHER_CLUSTER="us2"

# File Upload (UploadThing)
UPLOADTHING_SECRET="your-uploadthing-secret"
UPLOADTHING_APP_ID="your-uploadthing-app-id"

# Monitoring
NEXT_PUBLIC_SENTRY_DSN="https://your-sentry-dsn"
SENTRY_AUTH_TOKEN="your-sentry-auth-token"

# Rate Limiting (Upstash Redis)
UPSTASH_REDIS_REST_URL="https://your-redis-url"
UPSTASH_REDIS_REST_TOKEN="your-redis-token"

# Geolocation (for delivery tracking)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="your-google-maps-key"
```

## Deployment Checklist

- [ ] Environment variables configured in production
- [ ] Database migrations applied (`pnpm prisma migrate deploy`)
- [ ] Stripe account configured for payment processing
- [ ] Stripe webhook endpoint registered
- [ ] Pusher account configured for real-time updates
- [ ] Menu item images uploaded to CDN
- [ ] Rate limiting Redis configured
- [ ] Sentry project created and DSN set
- [ ] Health check endpoint responding
- [ ] SSL certificate valid
- [ ] Business hours configured correctly
- [ ] Delivery zones configured (if applicable)
- [ ] Google Maps API key configured (for delivery tracking)
- [ ] Admin accounts created for restaurant staff
- [ ] Order notification sounds tested
- [ ] Mobile responsiveness verified
- [ ] Payment flow tested end-to-end

## Related Skills

- [[cart-management]] - Shopping cart logic
- [[stripe-integration]] - Payment processing
- [[realtime-updates]] - Pusher integration
- [[geolocation]] - Delivery tracking
- [[image-upload]] - Menu item images

## Changelog

- 1.0.0: Initial restaurant ordering recipe with menu, cart, and tracking
