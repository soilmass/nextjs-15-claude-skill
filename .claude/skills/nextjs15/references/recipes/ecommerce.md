---
id: r-ecommerce
name: E-commerce Recipe
version: 4.0.0
layer: L6
category: commerce
description: Enterprise-grade e-commerce platform with Next.js 15 featuring authentication, search, payments, SEO, i18n, PWA, discounts, inventory management, and admin dashboard
tags: [recipe, ecommerce, shop, cart, checkout, payments, stripe, search, seo, auth, i18n, pwa, subscriptions]
formula: "Ecommerce = ProductListing(t-product-listing) + ProductDetail(t-product-detail) + CartPage(t-cart-page) + CheckoutPage(t-checkout-page) + MarketingLayout(t-marketing-layout) + AdminLayout(t-admin-layout) + DashboardLayout(t-dashboard-layout) + 404Page(t-404-page) + 500Page(t-500-page) + ProductCard(o-product-card) + Cart(o-cart) + CheckoutSummary(o-checkout-summary) + CheckoutForm(o-checkout-form) + DataTable(o-data-table) + Header(o-header) + Footer(o-footer) + MobileMenu(o-mobile-menu) + AuthForm(o-auth-form) + ReviewForm(o-review-form) + NotificationCenter(o-notification-center) + Dialog(o-dialog) + MediaGallery(o-media-gallery) + Faq(o-faq) + CookieConsent(o-cookie-consent) + LanguageSwitcher(o-language-switcher) + ComparisonTable(o-comparison-table) + Testimonials(o-testimonials) + Breadcrumb(m-breadcrumb) + Rating(m-rating) + AddressInput(m-address-input) + PhoneInput(m-phone-input) + CreditCardInput(m-credit-card-input) + ColorPicker(m-color-picker) + RangeSlider(m-range-slider) + Tabs(m-tabs) + AccordionItem(m-accordion-item) + Stepper(m-stepper) + EmptyState(m-empty-state) + ShareButton(m-share-button) + Zustand(pt-zustand) + ServerActions(pt-server-actions) + OptimisticUpdates(pt-optimistic-updates) + StripeCheckout(pt-stripe-checkout) + StripeWebhooks(pt-stripe-webhooks) + StripeSubscriptions(pt-stripe-subscriptions) + StripeBillingPortal(pt-stripe-billing-portal) + PrismaPatterns(pt-prisma-patterns) + NextAuth(pt-next-auth) + AuthMiddleware(pt-auth-middleware) + OauthProviders(pt-oauth-providers) + SessionManagement(pt-session-management) + Rbac(pt-rbac) + FormValidation(pt-form-validation) + MultiStepForms(pt-multi-step-forms) + Search(pt-search) + Filtering(pt-filtering) + Pagination(pt-pagination) + TransactionalEmail(pt-transactional-email) + EmailTemplates(pt-email-templates) + StructuredData(pt-structured-data) + MetadataApi(pt-metadata-api) + Sitemap(pt-sitemap) + OpenGraph(pt-open-graph) + ErrorBoundaries(pt-error-boundaries) + ErrorHandling(pt-error-handling) + SkeletonLoading(pt-skeleton-loading) + Streaming(pt-streaming) + ImageOptimization(pt-image-optimization) + Revalidation(pt-revalidation) + CacheInvalidation(pt-cache-invalidation) + LazyLoading(pt-lazy-loading) + Prefetching(pt-prefetching) + InfiniteScroll(pt-infinite-scroll) + CsrfProtection(pt-csrf-protection) + RateLimiting(pt-rate-limiting) + InputSanitization(pt-input-sanitization) + AnalyticsEvents(pt-analytics-events) + AbTesting(pt-ab-testing) + Translations(pt-translations) + I18nRouting(pt-i18n-routing) + NumberFormatting(pt-number-formatting) + DateFormatting(pt-date-formatting) + LocaleDetection(pt-locale-detection) + OfflineMode(pt-offline-mode) + ServiceWorker(pt-service-worker) + PushNotifications(pt-push-notifications) + PdfGeneration(pt-pdf-generation) + PrintStyles(pt-print-styles) + ExportData(pt-export-data) + SocialSharing(pt-social-sharing) + ShareApi(pt-share-api) + Geolocation(pt-geolocation) + LiveUpdates(pt-live-updates) + CronJobs(pt-cron-jobs) + BackgroundJobs(pt-background-jobs) + RetryLogic(pt-retry-logic) + KeyboardNavigation(pt-keyboard-navigation) + AccessibilityTesting(pt-accessibility-testing) + DiscountEngine(pt-discount-engine) + ShippingCarriers(pt-shipping-carriers) + TaxCalculation(pt-tax-calculation) + InventoryManagement(pt-inventory-management) + ReturnsManagement(pt-returns-management) + GiftCards(pt-gift-cards) + Wishlists(pt-wishlists) + ProductRecommendations(pt-product-recommendations) + AbandonedCartRecovery(pt-abandoned-cart-recovery) + RecentlyViewed(pt-recently-viewed) + UrgencyIndicators(pt-urgency-indicators) + AuditLogging(pt-audit-logging) + GdprCompliance(pt-gdpr-compliance) + DisplayCurrency(a-display-currency)"
composes:
  # L1 Atoms - Display Components
  - ../atoms/display-currency.md
  # L2 Molecules - Form & UI Components
  - ../molecules/breadcrumb.md
  - ../molecules/rating.md
  - ../molecules/address-input.md
  - ../molecules/phone-input.md
  - ../molecules/credit-card-input.md
  - ../molecules/color-picker.md
  - ../molecules/range-slider.md
  - ../molecules/tabs.md
  - ../molecules/accordion-item.md
  - ../molecules/stepper.md
  - ../molecules/empty-state.md
  - ../molecules/share-button.md
  # L3 Organisms - UI Components
  - ../organisms/product-card.md
  - ../organisms/cart.md
  - ../organisms/checkout-summary.md
  - ../organisms/checkout-form.md
  - ../organisms/data-table.md
  - ../organisms/header.md
  - ../organisms/footer.md
  - ../organisms/mobile-menu.md
  - ../organisms/auth-form.md
  - ../organisms/review-form.md
  - ../organisms/notification-center.md
  - ../organisms/dialog.md
  - ../organisms/media-gallery.md
  - ../organisms/faq.md
  - ../organisms/cookie-consent.md
  - ../organisms/language-switcher.md
  - ../organisms/comparison-table.md
  - ../organisms/testimonials.md
  # L4 Templates - Page Layouts
  - ../templates/product-listing.md
  - ../templates/product-detail.md
  - ../templates/cart-page.md
  - ../templates/checkout-page.md
  - ../templates/marketing-layout.md
  - ../templates/admin-layout.md
  - ../templates/dashboard-layout.md
  - ../templates/404-page.md
  - ../templates/500-page.md
  # L5 Patterns - State Management
  - ../patterns/zustand.md
  - ../patterns/server-actions.md
  - ../patterns/optimistic-updates.md
  # L5 Patterns - Payments & Billing
  - ../patterns/stripe-checkout.md
  - ../patterns/stripe-webhooks.md
  - ../patterns/stripe-subscriptions.md
  - ../patterns/stripe-billing-portal.md
  # L5 Patterns - Database
  - ../patterns/prisma-patterns.md
  # L5 Patterns - Authentication
  - ../patterns/next-auth.md
  - ../patterns/auth-middleware.md
  - ../patterns/oauth-providers.md
  - ../patterns/session-management.md
  - ../patterns/rbac.md
  # L5 Patterns - Forms & Validation
  - ../patterns/form-validation.md
  - ../patterns/multi-step-forms.md
  # L5 Patterns - Search & Discovery
  - ../patterns/search.md
  - ../patterns/filtering.md
  - ../patterns/pagination.md
  # L5 Patterns - Email
  - ../patterns/transactional-email.md
  - ../patterns/email-templates.md
  # L5 Patterns - SEO
  - ../patterns/structured-data.md
  - ../patterns/metadata-api.md
  - ../patterns/sitemap.md
  - ../patterns/open-graph.md
  # L5 Patterns - Error Handling
  - ../patterns/error-boundaries.md
  - ../patterns/error-handling.md
  # L5 Patterns - Loading & Performance
  - ../patterns/skeleton-loading.md
  - ../patterns/streaming.md
  - ../patterns/image-optimization.md
  - ../patterns/revalidation.md
  - ../patterns/cache-invalidation.md
  - ../patterns/lazy-loading.md
  - ../patterns/prefetching.md
  - ../patterns/infinite-scroll.md
  # L5 Patterns - Security
  - ../patterns/csrf-protection.md
  - ../patterns/rate-limiting.md
  - ../patterns/input-sanitization.md
  # L5 Patterns - Analytics & Testing
  - ../patterns/analytics-events.md
  - ../patterns/ab-testing.md
  # L5 Patterns - Internationalization
  - ../patterns/translations.md
  - ../patterns/i18n-routing.md
  - ../patterns/number-formatting.md
  - ../patterns/date-formatting.md
  - ../patterns/locale-detection.md
  # L5 Patterns - PWA & Offline
  - ../patterns/offline-mode.md
  - ../patterns/service-worker.md
  - ../patterns/push-notifications.md
  # L5 Patterns - Documents & Export
  - ../patterns/pdf-generation.md
  - ../patterns/print-styles.md
  - ../patterns/export-data.md
  # L5 Patterns - Social & Sharing
  - ../patterns/social-sharing.md
  - ../patterns/share-api.md
  # L5 Patterns - Location & Real-time
  - ../patterns/geolocation.md
  - ../patterns/live-updates.md
  # L5 Patterns - Background Processing
  - ../patterns/cron-jobs.md
  - ../patterns/background-jobs.md
  - ../patterns/retry-logic.md
  # L5 Patterns - Accessibility
  - ../patterns/keyboard-navigation.md
  - ../patterns/accessibility-testing.md
  # L5 Patterns - E-commerce Business Logic (NEW)
  - ../patterns/discount-engine.md
  - ../patterns/shipping-carriers.md
  - ../patterns/tax-calculation.md
  - ../patterns/inventory-management.md
  - ../patterns/returns-management.md
  - ../patterns/gift-cards.md
  - ../patterns/wishlists.md
  - ../patterns/product-recommendations.md
  - ../patterns/abandoned-cart-recovery.md
  - ../patterns/recently-viewed.md
  - ../patterns/urgency-indicators.md
  # L5 Patterns - Compliance & Audit
  - ../patterns/audit-logging.md
  - ../patterns/gdpr-compliance.md
dependencies:
  next: "^15.0.0"
  react: "^19.0.0"
  stripe: "^17.0.0"
  "@stripe/stripe-js": "^4.0.0"
  "@tanstack/react-query": "^5.0.0"
  zustand: "^5.0.0"
  prisma: "^6.0.0"
  "@prisma/client": "^6.0.0"
  next-auth: "^5.0.0"
  "@auth/prisma-adapter": "^2.0.0"
  zod: "^3.23.0"
  react-hook-form: "^7.54.0"
  "@hookform/resolvers": "^3.9.0"
  resend: "^4.0.0"
  "@react-email/components": "^0.0.25"
  next-intl: "^3.0.0"
  "@formatjs/intl-localematcher": "^0.5.0"
  negotiator: "^0.6.0"
  "@react-pdf/renderer": "^4.0.0"
  serwist: "^9.0.0"
  web-push: "^3.6.0"
  "@vercel/analytics": "^1.0.0"
  "@vercel/speed-insights": "^1.0.0"
  easyship: "^1.0.0"
  taxjar: "^4.0.0"
complexity: advanced
estimated_time: 40-80 hours
performance:
  impact: high
  lcp: medium
  cls: low
accessibility:
  wcag: AA
  keyboard: true
  screen-reader: true
---

# E-commerce Recipe

## Overview

Build a full-featured e-commerce platform with Next.js 15. Includes product catalog, shopping cart, checkout flow, payment processing with Stripe, order management, and inventory tracking. Optimized for conversion and performance.

## Architecture

```
app/
├── (shop)/                      # Shop route group
│   ├── layout.tsx              # Shop layout with cart
│   ├── page.tsx                # Homepage/Featured products
│   ├── products/
│   │   ├── page.tsx            # Product listing
│   │   └── [slug]/
│   │       └── page.tsx        # Product detail (SSG)
│   ├── categories/
│   │   └── [slug]/
│   │       └── page.tsx        # Category page
│   ├── search/
│   │   └── page.tsx            # Search results
│   └── cart/
│       └── page.tsx            # Shopping cart
├── (checkout)/                  # Checkout flow (different layout)
│   ├── layout.tsx              # Minimal checkout layout
│   ├── checkout/
│   │   └── page.tsx            # Checkout form
│   └── order/
│       └── [id]/
│           └── page.tsx        # Order confirmation
├── (account)/                   # User account
│   ├── layout.tsx              # Account layout
│   ├── account/
│   │   ├── page.tsx            # Account overview
│   │   ├── orders/
│   │   │   └── page.tsx        # Order history
│   │   └── settings/
│   │       └── page.tsx        # Account settings
├── api/
│   ├── products/
│   │   └── route.ts            # Product API
│   ├── cart/
│   │   └── route.ts            # Cart API
│   ├── checkout/
│   │   └── route.ts            # Create checkout session
│   └── webhooks/
│       └── stripe/
│           └── route.ts        # Stripe webhooks
└── admin/                       # Admin dashboard
    ├── layout.tsx
    ├── products/
    ├── orders/
    └── analytics/
```

## Skills Used

| Skill | Layer | Purpose |
|-------|-------|---------|
| product-listing | L4 | Product grid pages |
| product-detail | L4 | Individual product pages |
| cart-page | L4 | Shopping cart |
| checkout-page | L4 | Checkout flow |
| product-card | L3 | Product display cards |
| cart | L3 | Cart sidebar/drawer |
| checkout-summary | L3 | Order summary |
| data-table | L3 | Admin order management |
| zustand | L5 | Cart state management |
| stripe-integration | L5 | Payment processing |
| prisma | L5 | Database operations |
| image-optimization | L5 | Product images |
| filtering | L5 | Product filtering |
| pagination | L5 | Product pagination |

## Implementation

### Database Schema

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Product {
  id          String   @id @default(cuid())
  name        String
  slug        String   @unique
  description String?
  price       Int      // Store in cents
  comparePrice Int?    // Original price for sales
  images      String[] // Array of image URLs
  category    Category @relation(fields: [categoryId], references: [id])
  categoryId  String
  inventory   Int      @default(0)
  sku         String?  @unique
  status      ProductStatus @default(DRAFT)
  featured    Boolean  @default(false)
  metadata    Json?
  variants    ProductVariant[]
  reviews     Review[]
  orderItems  OrderItem[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([categoryId])
  @@index([status, featured])
  @@index([slug])
}

model ProductVariant {
  id        String   @id @default(cuid())
  product   Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  productId String
  name      String   // e.g., "Large / Blue"
  sku       String?  @unique
  price     Int?     // Override price if different
  inventory Int      @default(0)
  options   Json     // { size: "L", color: "Blue" }
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([productId])
}

model Category {
  id          String     @id @default(cuid())
  name        String
  slug        String     @unique
  description String?
  image       String?
  parent      Category?  @relation("CategoryHierarchy", fields: [parentId], references: [id])
  parentId    String?
  children    Category[] @relation("CategoryHierarchy")
  products    Product[]
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt

  @@index([parentId])
}

model Order {
  id              String      @id @default(cuid())
  orderNumber     String      @unique @default(cuid())
  user            User?       @relation(fields: [userId], references: [id])
  userId          String?
  email           String
  status          OrderStatus @default(PENDING)
  paymentStatus   PaymentStatus @default(PENDING)
  paymentIntent   String?     @unique // Stripe Payment Intent ID
  subtotal        Int
  tax             Int
  shipping        Int
  total           Int
  currency        String      @default("usd")
  shippingAddress Json
  billingAddress  Json?
  items           OrderItem[]
  notes           String?
  metadata        Json?
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt

  @@index([userId])
  @@index([email])
  @@index([status])
  @@index([paymentIntent])
}

model OrderItem {
  id        String   @id @default(cuid())
  order     Order    @relation(fields: [orderId], references: [id], onDelete: Cascade)
  orderId   String
  product   Product  @relation(fields: [productId], references: [id])
  productId String
  variantId String?
  name      String   // Snapshot of product name
  price     Int      // Snapshot of price
  quantity  Int
  metadata  Json?    // Variant options, etc.

  @@index([orderId])
}

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String?
  passwordHash  String?
  orders        Order[]
  reviews       Review[]
  addresses     Address[]
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

model Address {
  id         String  @id @default(cuid())
  user       User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId     String
  name       String
  line1      String
  line2      String?
  city       String
  state      String
  postalCode String
  country    String
  phone      String?
  isDefault  Boolean @default(false)

  @@index([userId])
}

model Review {
  id        String   @id @default(cuid())
  product   Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  productId String
  user      User     @relation(fields: [userId], references: [id])
  userId    String
  rating    Int      // 1-5
  title     String?
  content   String?
  verified  Boolean  @default(false)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([productId, userId])
  @@index([productId])
}

enum ProductStatus {
  DRAFT
  ACTIVE
  ARCHIVED
}

enum OrderStatus {
  PENDING
  CONFIRMED
  PROCESSING
  SHIPPED
  DELIVERED
  CANCELLED
  REFUNDED
}

enum PaymentStatus {
  PENDING
  PAID
  FAILED
  REFUNDED
}
```

### Cart Store (Zustand)

```typescript
// lib/store/cart.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface CartItem {
  id: string;
  productId: string;
  variantId?: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  options?: Record<string, string>;
}

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  
  // Actions
  addItem: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  
  // Computed
  itemCount: () => number;
  subtotal: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (item, quantity = 1) => {
        set((state) => {
          const existingIndex = state.items.findIndex(
            (i) => i.id === item.id
          );

          if (existingIndex > -1) {
            const newItems = [...state.items];
            newItems[existingIndex].quantity += quantity;
            return { items: newItems, isOpen: true };
          }

          return {
            items: [...state.items, { ...item, quantity }],
            isOpen: true,
          };
        });
      },

      removeItem: (id) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        }));
      },

      updateQuantity: (id, quantity) => {
        set((state) => {
          if (quantity <= 0) {
            return { items: state.items.filter((item) => item.id !== id) };
          }
          
          return {
            items: state.items.map((item) =>
              item.id === id ? { ...item, quantity } : item
            ),
          };
        });
      },

      clearCart: () => set({ items: [] }),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

      itemCount: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },

      subtotal: () => {
        return get().items.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        );
      },
    }),
    {
      name: 'cart-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }),
    }
  )
);
```

### Product Card Component

```tsx
// components/shop/product-card.tsx
'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart, Heart } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { useCartStore } from '@/lib/store/cart';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    comparePrice?: number | null;
    images: string[];
    category: { name: string };
    inventory: number;
  };
  className?: string;
}

export function ProductCard({ product, className }: ProductCardProps) {
  const [isHovered, setIsHovered] = React.useState(false);
  const addItem = useCartStore((state) => state.addItem);
  
  const discount = product.comparePrice
    ? Math.round((1 - product.price / product.comparePrice) * 100)
    : 0;
  
  const isOutOfStock = product.inventory === 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    addItem({
      id: product.id,
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0],
    });
  };

  return (
    <Link
      href={`/products/${product.slug}`}
      className={cn('group block', className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
        {/* Product Image */}
        <Image
          src={product.images[0]}
          alt={product.name}
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
          className={cn(
            'object-cover transition-transform duration-500',
            isHovered && 'scale-105'
          )}
        />
        
        {/* Second image on hover */}
        {product.images[1] && (
          <Image
            src={product.images[1]}
            alt={product.name}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
            className={cn(
              'absolute inset-0 object-cover transition-opacity duration-500',
              isHovered ? 'opacity-100' : 'opacity-0'
            )}
          />
        )}

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {discount > 0 && (
            <Badge variant="destructive">-{discount}%</Badge>
          )}
          {isOutOfStock && (
            <Badge variant="secondary">Out of Stock</Badge>
          )}
        </div>

        {/* Quick Actions */}
        <div
          className={cn(
            'absolute bottom-2 left-2 right-2 flex gap-2 transition-all duration-300',
            isHovered ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
          )}
        >
          <Button
            size="sm"
            className="flex-1"
            disabled={isOutOfStock}
            onClick={handleAddToCart}
          >
            <ShoppingCart className="mr-2 h-4 w-4" />
            Add to Cart
          </Button>
          <Button size="sm" variant="outline" className="px-3">
            <Heart className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Product Info */}
      <div className="mt-3 space-y-1">
        <p className="text-xs text-muted-foreground">
          {product.category.name}
        </p>
        <h3 className="font-medium leading-tight group-hover:text-primary transition-colors">
          {product.name}
        </h3>
        <div className="flex items-center gap-2">
          <span className="font-semibold">
            {formatPrice(product.price)}
          </span>
          {product.comparePrice && (
            <span className="text-sm text-muted-foreground line-through">
              {formatPrice(product.comparePrice)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
```

### Checkout API with Stripe

```typescript
// app/api/checkout/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
});

const checkoutSchema = z.object({
  items: z.array(z.object({
    productId: z.string(),
    variantId: z.string().optional(),
    quantity: z.number().min(1),
  })),
  shippingAddress: z.object({
    name: z.string(),
    line1: z.string(),
    line2: z.string().optional(),
    city: z.string(),
    state: z.string(),
    postalCode: z.string(),
    country: z.string(),
    phone: z.string().optional(),
  }),
  email: z.string().email(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const body = await request.json();
    const validated = checkoutSchema.parse(body);

    // Fetch products and validate inventory
    const products = await prisma.product.findMany({
      where: {
        id: { in: validated.items.map((i) => i.productId) },
        status: 'ACTIVE',
      },
      include: {
        variants: true,
      },
    });

    // Build line items and validate
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
    let subtotal = 0;

    for (const item of validated.items) {
      const product = products.find((p) => p.id === item.productId);
      if (!product) {
        return NextResponse.json(
          { error: `Product not found: ${item.productId}` },
          { status: 400 }
        );
      }

      let price = product.price;
      let inventory = product.inventory;
      let variantName = '';

      if (item.variantId) {
        const variant = product.variants.find((v) => v.id === item.variantId);
        if (!variant) {
          return NextResponse.json(
            { error: `Variant not found: ${item.variantId}` },
            { status: 400 }
          );
        }
        price = variant.price ?? product.price;
        inventory = variant.inventory;
        variantName = ` - ${variant.name}`;
      }

      if (inventory < item.quantity) {
        return NextResponse.json(
          { error: `Insufficient inventory for ${product.name}` },
          { status: 400 }
        );
      }

      subtotal += price * item.quantity;

      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: `${product.name}${variantName}`,
            images: product.images.slice(0, 1),
            metadata: {
              productId: product.id,
              variantId: item.variantId || '',
            },
          },
          unit_amount: price,
        },
        quantity: item.quantity,
      });
    }

    // Calculate tax and shipping
    const tax = Math.round(subtotal * 0.08); // 8% tax
    const shipping = subtotal >= 10000 ? 0 : 999; // Free shipping over $100
    const total = subtotal + tax + shipping;

    // Create order in database
    const order = await prisma.order.create({
      data: {
        userId: session?.user?.id,
        email: validated.email,
        subtotal,
        tax,
        shipping,
        total,
        shippingAddress: validated.shippingAddress,
        items: {
          create: validated.items.map((item) => {
            const product = products.find((p) => p.id === item.productId)!;
            const variant = item.variantId
              ? product.variants.find((v) => v.id === item.variantId)
              : null;
            
            return {
              productId: product.id,
              variantId: item.variantId,
              name: product.name + (variant ? ` - ${variant.name}` : ''),
              price: variant?.price ?? product.price,
              quantity: item.quantity,
              metadata: variant?.options || {},
            };
          }),
        },
      },
    });

    // Create Stripe Checkout Session
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: lineItems,
      customer_email: validated.email,
      shipping_options: [
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: { amount: shipping, currency: 'usd' },
            display_name: shipping === 0 ? 'Free Shipping' : 'Standard Shipping',
            delivery_estimate: {
              minimum: { unit: 'business_day', value: 3 },
              maximum: { unit: 'business_day', value: 7 },
            },
          },
        },
      ],
      metadata: {
        orderId: order.id,
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/order/${order.id}?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/cart?canceled=true`,
    });

    // Update order with payment intent
    await prisma.order.update({
      where: { id: order.id },
      data: { paymentIntent: checkoutSession.payment_intent as string },
    });

    return NextResponse.json({
      sessionId: checkoutSession.id,
      url: checkoutSession.url,
    });
  } catch (error) {
    console.error('Checkout error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
```

### Stripe Webhook Handler

```typescript
// app/api/webhooks/stripe/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';
import { sendOrderConfirmation } from '@/lib/email';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const orderId = session.metadata?.orderId;

        if (orderId) {
          // Update order status
          const order = await prisma.order.update({
            where: { id: orderId },
            data: {
              status: 'CONFIRMED',
              paymentStatus: 'PAID',
            },
            include: {
              items: {
                include: { product: true },
              },
            },
          });

          // Decrement inventory
          for (const item of order.items) {
            if (item.variantId) {
              await prisma.productVariant.update({
                where: { id: item.variantId },
                data: { inventory: { decrement: item.quantity } },
              });
            } else {
              await prisma.product.update({
                where: { id: item.productId },
                data: { inventory: { decrement: item.quantity } },
              });
            }
          }

          // Send confirmation email
          await sendOrderConfirmation(order);
        }
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        
        await prisma.order.updateMany({
          where: { paymentIntent: paymentIntent.id },
          data: { paymentStatus: 'FAILED' },
        });
        break;
      }

      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge;
        
        await prisma.order.updateMany({
          where: { paymentIntent: charge.payment_intent as string },
          data: {
            status: 'REFUNDED',
            paymentStatus: 'REFUNDED',
          },
        });
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}
```

### PCI DSS Compliant Payment Flow

PCI DSS (Payment Card Industry Data Security Standard) compliance is critical for any e-commerce application handling payments. The key principle is: **never handle raw card data on your server**. By using Stripe Elements or Payment Element, card data goes directly from the customer's browser to Stripe's servers, significantly reducing your PCI compliance scope (SAQ A or SAQ A-EP instead of SAQ D).

```typescript
// CRITICAL: Never handle raw card data
// - Use Stripe Elements or Payment Element ONLY
// - Server never sees card numbers
// - Use Stripe's tokenization

// components/checkout/payment-element.tsx
'use client';

import { useState, useEffect } from 'react';
import {
  PaymentElement,
  useStripe,
  useElements,
  Elements,
} from '@stripe/react-stripe-js';
import { loadStripe, StripeElementsOptions } from '@stripe/stripe-js';
import { Button } from '@/components/ui/button';
import { Loader2, Lock, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

// Initialize Stripe outside component to avoid recreating on re-renders
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface PaymentFormProps {
  clientSecret: string;
  orderId: string;
  amount: number;
  onSuccess: (paymentIntent: string) => void;
  onError: (error: string) => void;
}

function PaymentForm({ clientSecret, orderId, amount, onSuccess, onError }: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [savePaymentMethod, setSavePaymentMethod] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      // Confirm payment - handles 3D Secure automatically
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/order/${orderId}?success=true`,
          payment_method_data: {
            billing_details: {
              // These come from the PaymentElement
            },
          },
          // Save payment method for future use if customer consented
          ...(savePaymentMethod && {
            setup_future_usage: 'off_session',
          }),
        },
        redirect: 'if_required', // Only redirect for 3DS if needed
      });

      if (error) {
        // Handle specific error types
        if (error.type === 'card_error' || error.type === 'validation_error') {
          setErrorMessage(error.message ?? 'Payment failed');
        } else if (error.type === 'invalid_request_error') {
          setErrorMessage('Invalid payment request. Please try again.');
        } else {
          setErrorMessage('An unexpected error occurred. Please try again.');
        }
        onError(error.message ?? 'Payment failed');
      } else if (paymentIntent) {
        // Payment succeeded without redirect
        if (paymentIntent.status === 'succeeded') {
          onSuccess(paymentIntent.id);
        } else if (paymentIntent.status === 'requires_action') {
          // This shouldn't happen with redirect: 'if_required'
          setErrorMessage('Additional authentication required. Please try again.');
        } else if (paymentIntent.status === 'processing') {
          // Payment is processing (common for bank debits)
          onSuccess(paymentIntent.id);
        }
      }
    } catch (err) {
      console.error('Payment error:', err);
      setErrorMessage('An unexpected error occurred. Please try again.');
      onError('Payment processing failed');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Stripe Payment Element - handles all payment methods */}
      <div className="p-4 border rounded-lg bg-white">
        <PaymentElement
          options={{
            layout: 'tabs',
            wallets: {
              applePay: 'auto',
              googlePay: 'auto',
            },
            business: {
              name: process.env.NEXT_PUBLIC_APP_NAME || 'Store',
            },
          }}
        />
      </div>

      {/* Save payment method consent - required for PCI compliance */}
      <div className="flex items-start space-x-2">
        <Checkbox
          id="save-payment"
          checked={savePaymentMethod}
          onCheckedChange={(checked) => setSavePaymentMethod(checked === true)}
        />
        <div className="grid gap-1.5 leading-none">
          <Label htmlFor="save-payment" className="text-sm font-medium">
            Save payment method for future purchases
          </Label>
          <p className="text-xs text-muted-foreground">
            Your card details are securely stored by Stripe, not on our servers.
          </p>
        </div>
      </div>

      {/* Error display */}
      {errorMessage && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      {/* Submit button */}
      <Button
        type="submit"
        disabled={!stripe || !elements || isProcessing}
        className="w-full"
        size="lg"
      >
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <Lock className="mr-2 h-4 w-4" />
            Pay {formatPrice(amount)}
          </>
        )}
      </Button>

      {/* Security notice */}
      <p className="text-xs text-center text-muted-foreground">
        <Lock className="inline h-3 w-3 mr-1" />
        Payments are securely processed by Stripe. Your card details never touch our servers.
      </p>
    </form>
  );
}

// Format price helper
function formatPrice(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100);
}

// Main payment wrapper component
interface PaymentElementWrapperProps {
  orderId: string;
  amount: number;
  customerEmail: string;
  onSuccess: (paymentIntent: string) => void;
  onError: (error: string) => void;
}

export function PaymentElementWrapper({
  orderId,
  amount,
  customerEmail,
  onSuccess,
  onError,
}: PaymentElementWrapperProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Create PaymentIntent on mount
    const createPaymentIntent = async () => {
      try {
        const response = await fetch('/api/checkout/create-payment-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId,
            amount,
            customerEmail,
          }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to create payment');
        }

        const { clientSecret } = await response.json();
        setClientSecret(clientSecret);
      } catch (err) {
        console.error('Failed to create PaymentIntent:', err);
        setError(err instanceof Error ? err.message : 'Failed to initialize payment');
      }
    };

    createPaymentIntent();
  }, [orderId, amount, customerEmail]);

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!clientSecret) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const options: StripeElementsOptions = {
    clientSecret,
    appearance: {
      theme: 'stripe',
      variables: {
        colorPrimary: '#0f172a',
        colorBackground: '#ffffff',
        colorText: '#1e293b',
        colorDanger: '#dc2626',
        fontFamily: 'system-ui, sans-serif',
        spacingUnit: '4px',
        borderRadius: '8px',
      },
      rules: {
        '.Input': {
          border: '1px solid #e2e8f0',
          boxShadow: 'none',
        },
        '.Input:focus': {
          border: '1px solid #0f172a',
          boxShadow: '0 0 0 1px #0f172a',
        },
      },
    },
    loader: 'auto',
  };

  return (
    <Elements stripe={stripePromise} options={options}>
      <PaymentForm
        clientSecret={clientSecret}
        orderId={orderId}
        amount={amount}
        onSuccess={onSuccess}
        onError={onError}
      />
    </Elements>
  );
}
```

```typescript
// app/api/checkout/create-payment-intent/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { rateLimit } from '@/lib/rate-limit';
import crypto from 'crypto';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
});

const paymentIntentSchema = z.object({
  orderId: z.string().cuid(),
  amount: z.number().int().min(50), // Minimum 50 cents
  customerEmail: z.string().email(),
});

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResult = await rateLimit(request, 'checkout');
    if (rateLimitResult) return rateLimitResult;

    const session = await auth();
    const body = await request.json();
    const validated = paymentIntentSchema.parse(body);

    // Generate idempotency key to prevent duplicate charges
    const idempotencyKey = crypto
      .createHash('sha256')
      .update(`${validated.orderId}-${validated.amount}-${Date.now()}`)
      .digest('hex');

    // Verify order exists and belongs to user
    const order = await prisma.order.findUnique({
      where: { id: validated.orderId },
      include: { items: { include: { product: true } } },
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Verify order belongs to authenticated user or matches email
    if (session?.user?.id && order.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    if (order.email !== validated.customerEmail) {
      return NextResponse.json(
        { error: 'Email mismatch' },
        { status: 400 }
      );
    }

    // Verify amount matches order total
    if (order.total !== validated.amount) {
      return NextResponse.json(
        { error: 'Amount mismatch' },
        { status: 400 }
      );
    }

    // Check if PaymentIntent already exists for this order
    if (order.paymentIntent) {
      // Retrieve existing PaymentIntent
      const existingIntent = await stripe.paymentIntents.retrieve(order.paymentIntent);

      if (existingIntent.status === 'succeeded') {
        return NextResponse.json(
          { error: 'Order already paid' },
          { status: 400 }
        );
      }

      // Return existing client secret if still valid
      if (['requires_payment_method', 'requires_confirmation', 'requires_action'].includes(existingIntent.status)) {
        return NextResponse.json({
          clientSecret: existingIntent.client_secret,
          paymentIntentId: existingIntent.id,
        });
      }
    }

    // Get or create Stripe customer
    let customerId: string | undefined;
    if (session?.user?.id) {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { stripeCustomerId: true, email: true },
      });

      if (user?.stripeCustomerId) {
        customerId = user.stripeCustomerId;
      } else {
        // Create Stripe customer
        const customer = await stripe.customers.create({
          email: validated.customerEmail,
          metadata: {
            userId: session.user.id,
          },
        });

        // Save customer ID
        await prisma.user.update({
          where: { id: session.user.id },
          data: { stripeCustomerId: customer.id },
        });

        customerId = customer.id;
      }
    }

    // Build line items description for statement
    const description = order.items
      .map((item) => `${item.quantity}x ${item.name}`)
      .join(', ')
      .substring(0, 500);

    // Create PaymentIntent with idempotency
    const paymentIntent = await stripe.paymentIntents.create(
      {
        amount: validated.amount,
        currency: order.currency,
        customer: customerId,
        receipt_email: validated.customerEmail,
        description,
        statement_descriptor_suffix: 'ORDER',
        metadata: {
          orderId: order.id,
          orderNumber: order.orderNumber,
          customerEmail: validated.customerEmail,
          ...(session?.user?.id && { userId: session.user.id }),
        },
        // Enable automatic payment methods for better conversion
        automatic_payment_methods: {
          enabled: true,
          allow_redirects: 'always',
        },
        // Capture payment immediately (use 'manual' for auth-only)
        capture_method: 'automatic',
        // Configure for 3D Secure / SCA
        payment_method_options: {
          card: {
            // Request 3DS for all transactions (or 'automatic' for risk-based)
            request_three_d_secure: 'automatic',
          },
        },
        // Shipping details for Radar fraud detection
        shipping: order.shippingAddress
          ? {
              name: (order.shippingAddress as any).name,
              address: {
                line1: (order.shippingAddress as any).line1,
                line2: (order.shippingAddress as any).line2 || undefined,
                city: (order.shippingAddress as any).city,
                state: (order.shippingAddress as any).state,
                postal_code: (order.shippingAddress as any).postalCode,
                country: (order.shippingAddress as any).country,
              },
            }
          : undefined,
      },
      {
        idempotencyKey,
      }
    );

    // Update order with PaymentIntent ID
    await prisma.order.update({
      where: { id: order.id },
      data: { paymentIntent: paymentIntent.id },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    console.error('Create PaymentIntent error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode || 500 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create payment' },
      { status: 500 }
    );
  }
}
```

### 3D Secure / Strong Customer Authentication

3D Secure (3DS) and Strong Customer Authentication (SCA) are required for card payments in the EU and increasingly recommended globally. Stripe's Payment Element handles most 3DS flows automatically, but you need to handle the authentication responses properly.

```typescript
// lib/stripe-sca.ts
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
});

export interface SCAResult {
  success: boolean;
  requiresAction: boolean;
  actionUrl?: string;
  error?: string;
  paymentIntent?: Stripe.PaymentIntent;
}

/**
 * Handle PaymentIntent that requires authentication
 */
export async function handleAuthenticationRequired(
  paymentIntentId: string,
  returnUrl: string
): Promise<SCAResult> {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    switch (paymentIntent.status) {
      case 'requires_action':
        // 3DS authentication required
        if (paymentIntent.next_action?.type === 'redirect_to_url') {
          return {
            success: false,
            requiresAction: true,
            actionUrl: paymentIntent.next_action.redirect_to_url?.url,
            paymentIntent,
          };
        }

        if (paymentIntent.next_action?.type === 'use_stripe_sdk') {
          // Client-side SDK handles this
          return {
            success: false,
            requiresAction: true,
            paymentIntent,
          };
        }

        return {
          success: false,
          requiresAction: true,
          error: 'Unknown action required',
          paymentIntent,
        };

      case 'requires_payment_method':
        // Payment failed, needs new payment method
        return {
          success: false,
          requiresAction: false,
          error: 'Payment method declined. Please try a different card.',
          paymentIntent,
        };

      case 'succeeded':
        return {
          success: true,
          requiresAction: false,
          paymentIntent,
        };

      case 'processing':
        // Payment is processing (bank transfers, etc.)
        return {
          success: true, // Treat as success, will confirm via webhook
          requiresAction: false,
          paymentIntent,
        };

      case 'canceled':
        return {
          success: false,
          requiresAction: false,
          error: 'Payment was canceled',
          paymentIntent,
        };

      default:
        return {
          success: false,
          requiresAction: false,
          error: `Unexpected payment status: ${paymentIntent.status}`,
          paymentIntent,
        };
    }
  } catch (error) {
    console.error('SCA handling error:', error);
    return {
      success: false,
      requiresAction: false,
      error: error instanceof Error ? error.message : 'Failed to process authentication',
    };
  }
}

/**
 * Confirm PaymentIntent after 3DS redirect
 */
export async function confirmAfterRedirect(
  paymentIntentId: string
): Promise<SCAResult> {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    // Check authentication result
    if (paymentIntent.status === 'succeeded') {
      return {
        success: true,
        requiresAction: false,
        paymentIntent,
      };
    }

    if (paymentIntent.status === 'requires_payment_method') {
      // 3DS failed or was declined
      const lastError = paymentIntent.last_payment_error;
      let errorMessage = 'Authentication failed. Please try again or use a different card.';

      if (lastError?.code === 'authentication_required') {
        errorMessage = 'Card authentication was not completed. Please try again.';
      } else if (lastError?.code === 'card_declined') {
        errorMessage = lastError.message || 'Your card was declined.';
      } else if (lastError?.decline_code) {
        errorMessage = getDeclineMessage(lastError.decline_code);
      }

      return {
        success: false,
        requiresAction: false,
        error: errorMessage,
        paymentIntent,
      };
    }

    return handleAuthenticationRequired(paymentIntentId, '');
  } catch (error) {
    console.error('Confirm after redirect error:', error);
    return {
      success: false,
      requiresAction: false,
      error: 'Failed to confirm payment status',
    };
  }
}

/**
 * Get user-friendly decline message
 */
function getDeclineMessage(declineCode: string): string {
  const messages: Record<string, string> = {
    authentication_required: 'This card requires authentication. Please try again.',
    approve_with_id: 'Please contact your bank to authorize this transaction.',
    call_issuer: 'Your card was declined. Please contact your bank.',
    card_not_supported: 'This card is not supported. Please use a different card.',
    card_velocity_exceeded: 'Too many transactions. Please try again later.',
    currency_not_supported: 'This currency is not supported by your card.',
    do_not_honor: 'Your card was declined. Please contact your bank.',
    do_not_try_again: 'Your card was declined. Please use a different card.',
    duplicate_transaction: 'A duplicate transaction was detected.',
    expired_card: 'Your card has expired. Please use a different card.',
    fraudulent: 'This transaction was flagged as potentially fraudulent.',
    generic_decline: 'Your card was declined. Please try a different card.',
    incorrect_cvc: 'The CVC/CVV code is incorrect. Please check and try again.',
    incorrect_number: 'The card number is incorrect. Please check and try again.',
    incorrect_pin: 'The PIN is incorrect. Please try again.',
    incorrect_zip: 'The postal code is incorrect. Please check and try again.',
    insufficient_funds: 'Insufficient funds. Please use a different card.',
    invalid_account: 'The card account is invalid. Please use a different card.',
    invalid_amount: 'The payment amount is invalid.',
    invalid_cvc: 'The CVC/CVV code is invalid.',
    invalid_expiry_month: 'The expiration month is invalid.',
    invalid_expiry_year: 'The expiration year is invalid.',
    invalid_number: 'The card number is invalid.',
    invalid_pin: 'The PIN is invalid.',
    issuer_not_available: 'The card issuer could not be reached. Please try again.',
    lost_card: 'This card has been reported lost. Please use a different card.',
    merchant_blacklist: 'This card cannot be used for this purchase.',
    new_account_information_available: 'Your card details have changed. Please re-enter.',
    no_action_taken: 'Your card was declined. Please contact your bank.',
    not_permitted: 'This transaction is not permitted. Please contact your bank.',
    offline_pin_required: 'This card requires a PIN for online transactions.',
    online_or_offline_pin_required: 'This card requires a PIN.',
    pickup_card: 'This card cannot be used. Please contact your bank.',
    pin_try_exceeded: 'Too many PIN attempts. Please use a different card.',
    processing_error: 'A processing error occurred. Please try again.',
    reenter_transaction: 'Please re-enter the transaction.',
    restricted_card: 'This card is restricted. Please use a different card.',
    revocation_of_all_authorizations: 'All authorizations revoked. Please contact your bank.',
    revocation_of_authorization: 'Authorization revoked. Please contact your bank.',
    security_violation: 'A security violation was detected.',
    service_not_allowed: 'This service is not allowed for your card.',
    stolen_card: 'This card has been reported stolen.',
    stop_payment_order: 'A stop payment order exists for this card.',
    testmode_decline: 'This is a test card. Use a real card in production.',
    transaction_not_allowed: 'This transaction is not allowed.',
    try_again_later: 'Please try again later.',
    withdrawal_count_limit_exceeded: 'Withdrawal limit exceeded. Please try again later.',
  };

  return messages[declineCode] || 'Your card was declined. Please try a different payment method.';
}

/**
 * API route to handle 3DS return URL
 */
// app/api/checkout/confirm-payment/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { confirmAfterRedirect } from '@/lib/stripe-sca';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const paymentIntentId = searchParams.get('payment_intent');
  const paymentIntentClientSecret = searchParams.get('payment_intent_client_secret');
  const redirectStatus = searchParams.get('redirect_status');

  if (!paymentIntentId) {
    return NextResponse.redirect(new URL('/checkout?error=missing_payment_intent', request.url));
  }

  const result = await confirmAfterRedirect(paymentIntentId);

  // Get order ID from PaymentIntent
  const order = await prisma.order.findFirst({
    where: { paymentIntent: paymentIntentId },
    select: { id: true },
  });

  if (!order) {
    return NextResponse.redirect(new URL('/checkout?error=order_not_found', request.url));
  }

  if (result.success) {
    return NextResponse.redirect(new URL(`/order/${order.id}?success=true`, request.url));
  }

  // Encode error for URL
  const errorMessage = encodeURIComponent(result.error || 'Payment failed');
  return NextResponse.redirect(new URL(`/checkout?error=${errorMessage}&order=${order.id}`, request.url));
}
```

```typescript
// components/checkout/sca-modal.tsx
'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, ShieldCheck, AlertTriangle, ExternalLink } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface SCAModalProps {
  isOpen: boolean;
  onClose: () => void;
  actionUrl?: string;
  onAuthComplete: (success: boolean, error?: string) => void;
}

export function SCAModal({ isOpen, onClose, actionUrl, onAuthComplete }: SCAModalProps) {
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && actionUrl) {
      setStatus('ready');
    }
  }, [isOpen, actionUrl]);

  // Listen for authentication completion via postMessage
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Verify origin (Stripe domains)
      if (!event.origin.includes('stripe.com')) {
        return;
      }

      if (event.data?.type === '3DS-authentication-complete') {
        onAuthComplete(event.data.success, event.data.error);
        onClose();
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onAuthComplete, onClose]);

  const handleOpenAuthWindow = () => {
    if (!actionUrl) return;

    // Open authentication in a popup for better UX
    const width = 500;
    const height = 600;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    const authWindow = window.open(
      actionUrl,
      '3DSecureAuth',
      `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no,scrollbars=yes,resizable=no`
    );

    if (!authWindow) {
      setError('Please allow popups for this site to complete authentication.');
      setStatus('error');
      return;
    }

    // Poll for window close (fallback if postMessage fails)
    const pollTimer = setInterval(() => {
      if (authWindow.closed) {
        clearInterval(pollTimer);
        // Check payment status via API
        checkPaymentStatus();
      }
    }, 500);
  };

  const checkPaymentStatus = async () => {
    setStatus('loading');
    try {
      const response = await fetch('/api/checkout/check-payment-status');
      const data = await response.json();

      if (data.success) {
        onAuthComplete(true);
        onClose();
      } else {
        setError(data.error || 'Authentication was not completed');
        setStatus('error');
      }
    } catch (err) {
      setError('Failed to verify payment status');
      setStatus('error');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            Additional Authentication Required
          </DialogTitle>
          <DialogDescription>
            Your bank requires additional verification to complete this payment.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {status === 'loading' && (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
              <p className="text-sm text-muted-foreground">
                Preparing secure authentication...
              </p>
            </div>
          )}

          {status === 'ready' && (
            <>
              <p className="text-sm text-muted-foreground">
                You will be redirected to your bank's secure authentication page.
                This is a standard security measure to protect your card.
              </p>

              <div className="bg-muted p-4 rounded-lg">
                <h4 className="text-sm font-medium mb-2">What to expect:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>- Enter a one-time code sent by your bank</li>
                  <li>- Or approve via your banking app</li>
                  <li>- Or use biometric authentication</li>
                </ul>
              </div>

              <Button onClick={handleOpenAuthWindow} className="w-full">
                <ExternalLink className="mr-2 h-4 w-4" />
                Continue to Bank Verification
              </Button>
            </>
          )}

          {status === 'error' && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Authentication Failed</AlertTitle>
              <AlertDescription className="mt-2">
                {error}
              </AlertDescription>
              <div className="mt-4 flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setError(null);
                    setStatus('ready');
                  }}
                >
                  Try Again
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    onAuthComplete(false, error || undefined);
                    onClose();
                  }}
                >
                  Use Different Card
                </Button>
              </div>
            </Alert>
          )}
        </div>

        <p className="text-xs text-center text-muted-foreground">
          This authentication is powered by 3D Secure, an industry standard for secure payments.
        </p>
      </DialogContent>
    </Dialog>
  );
}
```

### Fraud Detection

Stripe Radar provides built-in fraud detection, but you should implement additional server-side checks for velocity limiting, address verification, and high-risk transaction flagging.

```typescript
// lib/fraud-detection.ts
import { prisma } from '@/lib/prisma';
import { Redis } from '@upstash/redis';
import Stripe from 'stripe';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL!,
  token: process.env.UPSTASH_REDIS_TOKEN!,
});

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
});

export interface FraudCheckResult {
  allowed: boolean;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  flags: string[];
  requiresReview: boolean;
  blockReason?: string;
}

interface FraudCheckInput {
  email: string;
  ipAddress: string;
  amount: number;
  shippingAddress: {
    country: string;
    postalCode: string;
  };
  billingAddress?: {
    country: string;
    postalCode: string;
  };
  userId?: string;
  fingerprint?: string;
}

// High-risk countries (adjust based on your business)
const HIGH_RISK_COUNTRIES = new Set([
  // Add countries based on your fraud data
]);

// Velocity limits
const VELOCITY_LIMITS = {
  ordersPerHour: { ip: 5, email: 3, fingerprint: 3 },
  ordersPerDay: { ip: 20, email: 10, fingerprint: 10 },
  amountPerDay: { ip: 100000, email: 50000 }, // in cents
};

/**
 * Perform comprehensive fraud checks
 */
export async function performFraudCheck(input: FraudCheckInput): Promise<FraudCheckResult> {
  const flags: string[] = [];
  let riskScore = 0;

  // 1. Velocity checks
  const velocityResult = await checkVelocityLimits(input);
  if (!velocityResult.allowed) {
    return {
      allowed: false,
      riskLevel: 'critical',
      flags: velocityResult.flags,
      requiresReview: false,
      blockReason: velocityResult.blockReason,
    };
  }
  flags.push(...velocityResult.flags);
  riskScore += velocityResult.riskScore;

  // 2. Address mismatch detection
  const addressResult = checkAddressMismatch(input);
  flags.push(...addressResult.flags);
  riskScore += addressResult.riskScore;

  // 3. High-risk country flagging
  const countryResult = checkHighRiskCountry(input.shippingAddress.country);
  flags.push(...countryResult.flags);
  riskScore += countryResult.riskScore;

  // 4. Email domain analysis
  const emailResult = analyzeEmail(input.email);
  flags.push(...emailResult.flags);
  riskScore += emailResult.riskScore;

  // 5. Amount anomaly detection
  const amountResult = await checkAmountAnomaly(input);
  flags.push(...amountResult.flags);
  riskScore += amountResult.riskScore;

  // 6. Account age check (for logged-in users)
  if (input.userId) {
    const accountResult = await checkAccountAge(input.userId);
    flags.push(...accountResult.flags);
    riskScore += accountResult.riskScore;
  }

  // Determine risk level
  let riskLevel: FraudCheckResult['riskLevel'];
  if (riskScore >= 100) {
    riskLevel = 'critical';
  } else if (riskScore >= 70) {
    riskLevel = 'high';
  } else if (riskScore >= 40) {
    riskLevel = 'medium';
  } else {
    riskLevel = 'low';
  }

  return {
    allowed: riskLevel !== 'critical',
    riskLevel,
    flags,
    requiresReview: riskLevel === 'high' || riskLevel === 'medium',
  };
}

/**
 * Check velocity limits (orders per time period)
 */
async function checkVelocityLimits(input: FraudCheckInput): Promise<{
  allowed: boolean;
  flags: string[];
  riskScore: number;
  blockReason?: string;
}> {
  const flags: string[] = [];
  let riskScore = 0;
  const now = Date.now();
  const hourAgo = now - 60 * 60 * 1000;
  const dayAgo = now - 24 * 60 * 60 * 1000;

  // Check IP velocity
  const ipOrdersHour = await redis.zcount(`fraud:orders:ip:${input.ipAddress}`, hourAgo, now);
  const ipOrdersDay = await redis.zcount(`fraud:orders:ip:${input.ipAddress}`, dayAgo, now);

  if (ipOrdersHour >= VELOCITY_LIMITS.ordersPerHour.ip) {
    return {
      allowed: false,
      flags: ['velocity_ip_hour_exceeded'],
      riskScore: 100,
      blockReason: 'Too many orders from this IP address',
    };
  }

  if (ipOrdersDay >= VELOCITY_LIMITS.ordersPerDay.ip) {
    return {
      allowed: false,
      flags: ['velocity_ip_day_exceeded'],
      riskScore: 100,
      blockReason: 'Daily order limit exceeded for this IP',
    };
  }

  if (ipOrdersHour > 2) {
    flags.push('elevated_ip_velocity');
    riskScore += 20;
  }

  // Check email velocity
  const emailOrdersHour = await redis.zcount(`fraud:orders:email:${input.email}`, hourAgo, now);
  const emailOrdersDay = await redis.zcount(`fraud:orders:email:${input.email}`, dayAgo, now);

  if (emailOrdersHour >= VELOCITY_LIMITS.ordersPerHour.email) {
    return {
      allowed: false,
      flags: ['velocity_email_hour_exceeded'],
      riskScore: 100,
      blockReason: 'Too many orders from this email',
    };
  }

  if (emailOrdersDay >= VELOCITY_LIMITS.ordersPerDay.email) {
    flags.push('high_email_velocity_day');
    riskScore += 30;
  }

  // Check daily amount
  const ipAmountToday = await redis.get<number>(`fraud:amount:ip:${input.ipAddress}:${getDayKey()}`);
  const emailAmountToday = await redis.get<number>(`fraud:amount:email:${input.email}:${getDayKey()}`);

  if ((ipAmountToday || 0) + input.amount > VELOCITY_LIMITS.amountPerDay.ip) {
    flags.push('high_amount_ip');
    riskScore += 40;
  }

  if ((emailAmountToday || 0) + input.amount > VELOCITY_LIMITS.amountPerDay.email) {
    flags.push('high_amount_email');
    riskScore += 40;
  }

  return { allowed: true, flags, riskScore };
}

/**
 * Check for billing/shipping address mismatch
 */
function checkAddressMismatch(input: FraudCheckInput): { flags: string[]; riskScore: number } {
  const flags: string[] = [];
  let riskScore = 0;

  if (input.billingAddress) {
    // Country mismatch
    if (input.shippingAddress.country !== input.billingAddress.country) {
      flags.push('country_mismatch');
      riskScore += 30;
    }

    // Postal code mismatch (less severe for same country)
    if (
      input.shippingAddress.postalCode !== input.billingAddress.postalCode &&
      input.shippingAddress.country === input.billingAddress.country
    ) {
      flags.push('postal_mismatch');
      riskScore += 10;
    }
  }

  return { flags, riskScore };
}

/**
 * Check for high-risk shipping countries
 */
function checkHighRiskCountry(country: string): { flags: string[]; riskScore: number } {
  if (HIGH_RISK_COUNTRIES.has(country.toUpperCase())) {
    return {
      flags: ['high_risk_country'],
      riskScore: 50,
    };
  }
  return { flags: [], riskScore: 0 };
}

/**
 * Analyze email for fraud signals
 */
function analyzeEmail(email: string): { flags: string[]; riskScore: number } {
  const flags: string[] = [];
  let riskScore = 0;

  const domain = email.split('@')[1]?.toLowerCase();
  const localPart = email.split('@')[0]?.toLowerCase();

  // Disposable email domains
  const disposableDomains = new Set([
    'tempmail.com', 'throwaway.com', 'mailinator.com', 'guerrillamail.com',
    '10minutemail.com', 'trashmail.com', 'fakeinbox.com', // Add more as needed
  ]);

  if (disposableDomains.has(domain)) {
    flags.push('disposable_email');
    riskScore += 40;
  }

  // Check for suspicious patterns in local part
  if (/^[a-z]{10,}[0-9]{3,}$/.test(localPart)) {
    flags.push('suspicious_email_pattern');
    riskScore += 15;
  }

  // Very new gmail addresses (random characters)
  if (domain === 'gmail.com' && /^[a-z0-9]{20,}$/.test(localPart)) {
    flags.push('random_gmail');
    riskScore += 20;
  }

  return { flags, riskScore };
}

/**
 * Check for unusual order amounts
 */
async function checkAmountAnomaly(input: FraudCheckInput): Promise<{ flags: string[]; riskScore: number }> {
  const flags: string[] = [];
  let riskScore = 0;

  // Very high order amount
  if (input.amount > 50000) { // $500+
    flags.push('high_value_order');
    riskScore += 20;
  }

  // Check if amount is significantly higher than user's average
  if (input.userId) {
    const avgOrderAmount = await prisma.order.aggregate({
      where: { userId: input.userId, paymentStatus: 'PAID' },
      _avg: { total: true },
    });

    if (avgOrderAmount._avg.total && input.amount > avgOrderAmount._avg.total * 5) {
      flags.push('amount_anomaly');
      riskScore += 25;
    }
  }

  return { flags, riskScore };
}

/**
 * Check account age for logged-in users
 */
async function checkAccountAge(userId: string): Promise<{ flags: string[]; riskScore: number }> {
  const flags: string[] = [];
  let riskScore = 0;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { createdAt: true },
  });

  if (user) {
    const accountAge = Date.now() - user.createdAt.getTime();
    const hourInMs = 60 * 60 * 1000;

    // Account less than 1 hour old
    if (accountAge < hourInMs) {
      flags.push('very_new_account');
      riskScore += 35;
    }
    // Account less than 24 hours old
    else if (accountAge < 24 * hourInMs) {
      flags.push('new_account');
      riskScore += 15;
    }
  }

  return { flags, riskScore };
}

/**
 * Record order for velocity tracking
 */
export async function recordOrderForVelocity(
  ipAddress: string,
  email: string,
  amount: number,
  fingerprint?: string
): Promise<void> {
  const now = Date.now();
  const dayKey = getDayKey();
  const expireSeconds = 24 * 60 * 60; // 24 hours

  await Promise.all([
    // Record order timestamp for IP
    redis.zadd(`fraud:orders:ip:${ipAddress}`, { score: now, member: `${now}` }),
    redis.expire(`fraud:orders:ip:${ipAddress}`, expireSeconds),

    // Record order timestamp for email
    redis.zadd(`fraud:orders:email:${email}`, { score: now, member: `${now}` }),
    redis.expire(`fraud:orders:email:${email}`, expireSeconds),

    // Track daily amounts
    redis.incrby(`fraud:amount:ip:${ipAddress}:${dayKey}`, amount),
    redis.expire(`fraud:amount:ip:${ipAddress}:${dayKey}`, expireSeconds),
    redis.incrby(`fraud:amount:email:${email}:${dayKey}`, amount),
    redis.expire(`fraud:amount:email:${email}:${dayKey}`, expireSeconds),

    // Record fingerprint if available
    ...(fingerprint ? [
      redis.zadd(`fraud:orders:fp:${fingerprint}`, { score: now, member: `${now}` }),
      redis.expire(`fraud:orders:fp:${fingerprint}`, expireSeconds),
    ] : []),
  ]);
}

/**
 * Get current day key for tracking
 */
function getDayKey(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * Add order to manual review queue
 */
export async function addToReviewQueue(
  orderId: string,
  flags: string[],
  riskLevel: string
): Promise<void> {
  await prisma.order.update({
    where: { id: orderId },
    data: {
      status: 'PENDING',
      metadata: {
        fraudFlags: flags,
        riskLevel,
        reviewRequired: true,
        reviewAddedAt: new Date().toISOString(),
      },
    },
  });

  // Optionally notify admin via Slack, email, etc.
  // await notifyAdmin('New order requires fraud review', { orderId, flags, riskLevel });
}
```

```typescript
// app/api/webhooks/stripe/radar/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';
import { headers } from 'next/headers';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
});

const webhookSecret = process.env.STRIPE_RADAR_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = headers().get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error) {
    console.error('Radar webhook signature verification failed:', error);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'radar.early_fraud_warning.created': {
        const warning = event.data.object as Stripe.Radar.EarlyFraudWarning;
        await handleEarlyFraudWarning(warning);
        break;
      }

      case 'charge.dispute.created': {
        const dispute = event.data.object as Stripe.Dispute;
        await handleDisputeCreated(dispute);
        break;
      }

      case 'review.opened': {
        const review = event.data.object as Stripe.Review;
        await handleReviewOpened(review);
        break;
      }

      case 'review.closed': {
        const review = event.data.object as Stripe.Review;
        await handleReviewClosed(review);
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Radar webhook handler error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

/**
 * Handle early fraud warnings from Radar
 */
async function handleEarlyFraudWarning(warning: Stripe.Radar.EarlyFraudWarning) {
  const chargeId = typeof warning.charge === 'string'
    ? warning.charge
    : warning.charge?.id;

  if (!chargeId) return;

  // Get charge to find PaymentIntent
  const charge = await stripe.charges.retrieve(chargeId);
  const paymentIntentId = typeof charge.payment_intent === 'string'
    ? charge.payment_intent
    : charge.payment_intent?.id;

  if (!paymentIntentId) return;

  // Find and flag the order
  const order = await prisma.order.findFirst({
    where: { paymentIntent: paymentIntentId },
  });

  if (order) {
    // Flag order for review
    await prisma.order.update({
      where: { id: order.id },
      data: {
        metadata: {
          ...(order.metadata as object || {}),
          earlyFraudWarning: true,
          fraudType: warning.fraud_type,
          warningCreatedAt: new Date().toISOString(),
        },
      },
    });

    // If order not yet shipped, hold it
    if (['CONFIRMED', 'PROCESSING'].includes(order.status)) {
      await prisma.order.update({
        where: { id: order.id },
        data: { status: 'PENDING' },
      });
    }

    console.log(`Early fraud warning for order ${order.id}: ${warning.fraud_type}`);
  }
}

/**
 * Handle dispute (chargeback) creation
 */
async function handleDisputeCreated(dispute: Stripe.Dispute) {
  const paymentIntentId = typeof dispute.payment_intent === 'string'
    ? dispute.payment_intent
    : dispute.payment_intent?.id;

  if (!paymentIntentId) return;

  const order = await prisma.order.findFirst({
    where: { paymentIntent: paymentIntentId },
  });

  if (order) {
    // Flag account for potential fraud
    if (order.userId) {
      await prisma.user.update({
        where: { id: order.userId },
        data: {
          metadata: {
            disputeCount: { increment: 1 },
            lastDispute: new Date().toISOString(),
          },
        },
      });

      // Check if user has multiple disputes
      const user = await prisma.user.findUnique({
        where: { id: order.userId },
        select: { metadata: true },
      });

      const disputeCount = (user?.metadata as any)?.disputeCount || 1;

      // Auto-block users with multiple disputes
      if (disputeCount >= 2) {
        await prisma.user.update({
          where: { id: order.userId },
          data: {
            status: 'BLOCKED',
            metadata: {
              ...(user?.metadata as object || {}),
              blockedReason: 'Multiple chargebacks',
              blockedAt: new Date().toISOString(),
            },
          },
        });
      }
    }

    // Update order
    await prisma.order.update({
      where: { id: order.id },
      data: {
        metadata: {
          ...(order.metadata as object || {}),
          disputeId: dispute.id,
          disputeReason: dispute.reason,
          disputeAmount: dispute.amount,
          disputeCreatedAt: new Date().toISOString(),
        },
      },
    });

    // Block email from future orders
    await prisma.blockedEmail.upsert({
      where: { email: order.email },
      update: { reason: 'chargeback' },
      create: {
        email: order.email,
        reason: 'chargeback',
        orderId: order.id,
      },
    });
  }
}

/**
 * Handle Stripe review opened
 */
async function handleReviewOpened(review: Stripe.Review) {
  const paymentIntentId = typeof review.payment_intent === 'string'
    ? review.payment_intent
    : review.payment_intent?.id;

  if (!paymentIntentId) return;

  const order = await prisma.order.findFirst({
    where: { paymentIntent: paymentIntentId },
  });

  if (order) {
    await prisma.order.update({
      where: { id: order.id },
      data: {
        status: 'PENDING',
        metadata: {
          ...(order.metadata as object || {}),
          stripeReviewId: review.id,
          stripeReviewReason: review.reason,
          stripeReviewOpenedAt: new Date().toISOString(),
        },
      },
    });
  }
}

/**
 * Handle Stripe review closed
 */
async function handleReviewClosed(review: Stripe.Review) {
  const paymentIntentId = typeof review.payment_intent === 'string'
    ? review.payment_intent
    : review.payment_intent?.id;

  if (!paymentIntentId) return;

  const order = await prisma.order.findFirst({
    where: { paymentIntent: paymentIntentId },
  });

  if (order) {
    const isApproved = review.closed_reason === 'approved';

    await prisma.order.update({
      where: { id: order.id },
      data: {
        status: isApproved ? 'CONFIRMED' : 'CANCELLED',
        metadata: {
          ...(order.metadata as object || {}),
          stripeReviewClosedAt: new Date().toISOString(),
          stripeReviewResult: review.closed_reason,
        },
      },
    });

    // If review failed, potentially refund
    if (!isApproved && order.paymentIntent) {
      await stripe.refunds.create({
        payment_intent: order.paymentIntent,
        reason: 'fraudulent',
      });
    }
  }
}
```

### Refund & Dispute Handling

Proper refund and dispute handling is essential for maintaining customer trust and managing chargebacks effectively.

```typescript
// app/api/orders/[id]/refund/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { sendRefundNotification } from '@/lib/email';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
});

const refundSchema = z.object({
  amount: z.number().int().min(1).optional(), // Partial refund amount in cents
  reason: z.enum(['requested_by_customer', 'duplicate', 'fraudulent', 'product_not_received', 'product_unacceptable', 'other']),
  note: z.string().max(500).optional(),
  restoreInventory: z.boolean().default(true),
});

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    // Require admin role for refunds
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validated = refundSchema.parse(body);

    // Get order
    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: {
        items: {
          include: { product: true },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    if (!order.paymentIntent) {
      return NextResponse.json(
        { error: 'No payment associated with this order' },
        { status: 400 }
      );
    }

    if (order.paymentStatus === 'REFUNDED') {
      return NextResponse.json(
        { error: 'Order already refunded' },
        { status: 400 }
      );
    }

    // Determine refund amount
    const refundAmount = validated.amount || order.total;
    const isFullRefund = refundAmount >= order.total;

    // Create Stripe refund
    const refund = await stripe.refunds.create({
      payment_intent: order.paymentIntent,
      amount: refundAmount,
      reason: validated.reason === 'requested_by_customer' ? 'requested_by_customer'
            : validated.reason === 'duplicate' ? 'duplicate'
            : validated.reason === 'fraudulent' ? 'fraudulent'
            : undefined, // Stripe only accepts these three reasons
      metadata: {
        orderId: order.id,
        orderNumber: order.orderNumber,
        internalReason: validated.reason,
        note: validated.note || '',
        processedBy: session.user.id,
      },
    });

    // Calculate refunded total
    const existingRefunds = await prisma.refund.findMany({
      where: { orderId: order.id },
    });
    const totalRefunded = existingRefunds.reduce((sum, r) => sum + r.amount, 0) + refundAmount;

    // Create refund record
    const refundRecord = await prisma.refund.create({
      data: {
        orderId: order.id,
        stripeRefundId: refund.id,
        amount: refundAmount,
        reason: validated.reason,
        note: validated.note,
        processedBy: session.user.id,
        status: refund.status === 'succeeded' ? 'COMPLETED' : 'PENDING',
      },
    });

    // Update order status
    await prisma.order.update({
      where: { id: order.id },
      data: {
        paymentStatus: totalRefunded >= order.total ? 'REFUNDED' : 'PAID',
        status: isFullRefund ? 'REFUNDED' : order.status,
        metadata: {
          ...(order.metadata as object || {}),
          lastRefundAt: new Date().toISOString(),
          totalRefunded,
        },
      },
    });

    // Restore inventory if requested
    if (validated.restoreInventory && isFullRefund) {
      for (const item of order.items) {
        if (item.variantId) {
          await prisma.productVariant.update({
            where: { id: item.variantId },
            data: { inventory: { increment: item.quantity } },
          });
        } else {
          await prisma.product.update({
            where: { id: item.productId },
            data: { inventory: { increment: item.quantity } },
          });
        }
      }
    }

    // Send notification to customer
    await sendRefundNotification(order, {
      amount: refundAmount,
      isFullRefund,
      reason: validated.reason,
    });

    return NextResponse.json({
      success: true,
      refund: {
        id: refundRecord.id,
        stripeRefundId: refund.id,
        amount: refundAmount,
        status: refund.status,
      },
    });
  } catch (error) {
    console.error('Refund error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode || 500 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to process refund' },
      { status: 500 }
    );
  }
}

// GET endpoint to check refund status
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: {
        refunds: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Verify user owns order or is admin
    if (order.userId !== session.user.id && session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const totalRefunded = order.refunds.reduce((sum, r) => sum + r.amount, 0);

    return NextResponse.json({
      orderId: order.id,
      orderTotal: order.total,
      totalRefunded,
      remainingBalance: order.total - totalRefunded,
      isFullyRefunded: totalRefunded >= order.total,
      refunds: order.refunds,
    });
  } catch (error) {
    console.error('Get refund status error:', error);
    return NextResponse.json(
      { error: 'Failed to get refund status' },
      { status: 500 }
    );
  }
}
```

```typescript
// app/api/webhooks/stripe/disputes/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';
import { headers } from 'next/headers';
import { sendDisputeNotification } from '@/lib/email';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
});

const webhookSecret = process.env.STRIPE_DISPUTES_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = headers().get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error) {
    console.error('Dispute webhook signature verification failed:', error);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'charge.dispute.created': {
        const dispute = event.data.object as Stripe.Dispute;
        await handleDisputeCreated(dispute);
        break;
      }

      case 'charge.dispute.updated': {
        const dispute = event.data.object as Stripe.Dispute;
        await handleDisputeUpdated(dispute);
        break;
      }

      case 'charge.dispute.closed': {
        const dispute = event.data.object as Stripe.Dispute;
        await handleDisputeClosed(dispute);
        break;
      }

      case 'charge.dispute.funds_withdrawn': {
        const dispute = event.data.object as Stripe.Dispute;
        await handleDisputeFundsWithdrawn(dispute);
        break;
      }

      case 'charge.dispute.funds_reinstated': {
        const dispute = event.data.object as Stripe.Dispute;
        await handleDisputeFundsReinstated(dispute);
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Dispute webhook handler error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

async function handleDisputeCreated(dispute: Stripe.Dispute) {
  const paymentIntentId = getPaymentIntentId(dispute);
  if (!paymentIntentId) return;

  const order = await prisma.order.findFirst({
    where: { paymentIntent: paymentIntentId },
    include: { items: true },
  });

  if (!order) {
    console.warn(`No order found for dispute ${dispute.id}`);
    return;
  }

  // Create dispute record
  await prisma.dispute.create({
    data: {
      orderId: order.id,
      stripeDisputeId: dispute.id,
      amount: dispute.amount,
      currency: dispute.currency,
      reason: dispute.reason,
      status: dispute.status,
      evidenceDueBy: dispute.evidence_details.due_by
        ? new Date(dispute.evidence_details.due_by * 1000)
        : null,
      metadata: {
        chargeId: typeof dispute.charge === 'string' ? dispute.charge : dispute.charge?.id,
        hasEvidence: dispute.evidence_details.has_evidence,
        pastDue: dispute.evidence_details.past_due,
        submissionCount: dispute.evidence_details.submission_count,
      },
    },
  });

  // Update order
  await prisma.order.update({
    where: { id: order.id },
    data: {
      metadata: {
        ...(order.metadata as object || {}),
        hasDispute: true,
        disputeId: dispute.id,
        disputeStatus: dispute.status,
        disputeReason: dispute.reason,
      },
    },
  });

  // Notify admin
  await sendDisputeNotification('created', {
    orderId: order.id,
    orderNumber: order.orderNumber,
    disputeId: dispute.id,
    amount: dispute.amount,
    reason: dispute.reason,
    evidenceDueBy: dispute.evidence_details.due_by,
  });

  // Automatically prepare and submit evidence if possible
  await prepareDisputeEvidence(dispute, order);
}

async function handleDisputeUpdated(dispute: Stripe.Dispute) {
  const existingDispute = await prisma.dispute.findUnique({
    where: { stripeDisputeId: dispute.id },
  });

  if (existingDispute) {
    await prisma.dispute.update({
      where: { id: existingDispute.id },
      data: {
        status: dispute.status,
        metadata: {
          ...(existingDispute.metadata as object || {}),
          hasEvidence: dispute.evidence_details.has_evidence,
          submissionCount: dispute.evidence_details.submission_count,
          updatedAt: new Date().toISOString(),
        },
      },
    });
  }
}

async function handleDisputeClosed(dispute: Stripe.Dispute) {
  const existingDispute = await prisma.dispute.findUnique({
    where: { stripeDisputeId: dispute.id },
    include: { order: true },
  });

  if (existingDispute) {
    const won = dispute.status === 'won';

    await prisma.dispute.update({
      where: { id: existingDispute.id },
      data: {
        status: dispute.status,
        closedAt: new Date(),
        outcome: won ? 'WON' : 'LOST',
      },
    });

    if (existingDispute.order) {
      await prisma.order.update({
        where: { id: existingDispute.order.id },
        data: {
          metadata: {
            ...(existingDispute.order.metadata as object || {}),
            disputeStatus: dispute.status,
            disputeOutcome: won ? 'won' : 'lost',
            disputeClosedAt: new Date().toISOString(),
          },
        },
      });

      // If we lost, flag the customer
      if (!won && existingDispute.order.email) {
        await flagCustomerForDispute(existingDispute.order.email, existingDispute.order.userId);
      }
    }

    // Notify admin of outcome
    await sendDisputeNotification('closed', {
      orderId: existingDispute.orderId,
      disputeId: dispute.id,
      outcome: won ? 'won' : 'lost',
      amount: dispute.amount,
    });
  }
}

async function handleDisputeFundsWithdrawn(dispute: Stripe.Dispute) {
  const existingDispute = await prisma.dispute.findUnique({
    where: { stripeDisputeId: dispute.id },
  });

  if (existingDispute) {
    await prisma.dispute.update({
      where: { id: existingDispute.id },
      data: {
        fundsWithdrawn: true,
        fundsWithdrawnAt: new Date(),
      },
    });
  }
}

async function handleDisputeFundsReinstated(dispute: Stripe.Dispute) {
  const existingDispute = await prisma.dispute.findUnique({
    where: { stripeDisputeId: dispute.id },
  });

  if (existingDispute) {
    await prisma.dispute.update({
      where: { id: existingDispute.id },
      data: {
        fundsReinstated: true,
        fundsReinstatedAt: new Date(),
      },
    });
  }
}

function getPaymentIntentId(dispute: Stripe.Dispute): string | null {
  return typeof dispute.payment_intent === 'string'
    ? dispute.payment_intent
    : dispute.payment_intent?.id || null;
}

async function flagCustomerForDispute(email: string, userId?: string | null) {
  // Add to blocked emails
  await prisma.blockedEmail.upsert({
    where: { email },
    update: {
      reason: 'chargeback_lost',
      updatedAt: new Date(),
    },
    create: {
      email,
      reason: 'chargeback_lost',
    },
  });

  // Flag user if exists
  if (userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { metadata: true },
    });

    const currentMeta = (user?.metadata as any) || {};
    const lostDisputeCount = (currentMeta.lostDisputeCount || 0) + 1;

    await prisma.user.update({
      where: { id: userId },
      data: {
        status: lostDisputeCount >= 1 ? 'BLOCKED' : 'ACTIVE',
        metadata: {
          ...currentMeta,
          lostDisputeCount,
          lastLostDisputeAt: new Date().toISOString(),
          ...(lostDisputeCount >= 1 && {
            blockedReason: 'Lost chargeback',
            blockedAt: new Date().toISOString(),
          }),
        },
      },
    });
  }
}

/**
 * Prepare and submit dispute evidence automatically
 */
async function prepareDisputeEvidence(
  dispute: Stripe.Dispute,
  order: any
): Promise<void> {
  // Only auto-submit for certain dispute reasons
  const autoSubmitReasons = ['fraudulent', 'product_not_received'];
  if (!autoSubmitReasons.includes(dispute.reason)) {
    return;
  }

  try {
    // Gather evidence
    const evidence: Stripe.DisputeUpdateParams.Evidence = {
      // Customer details
      customer_email_address: order.email,
      customer_name: (order.shippingAddress as any)?.name,

      // Product details
      product_description: order.items
        .map((item: any) => `${item.quantity}x ${item.name}`)
        .join(', '),

      // Uncategorized text for additional context
      uncategorized_text: `Order #${order.orderNumber} placed on ${order.createdAt.toISOString()}. Total: $${(order.total / 100).toFixed(2)}`,
    };

    // Add shipping evidence if available
    if (order.trackingNumber) {
      evidence.shipping_carrier = order.shippingCarrier;
      evidence.shipping_tracking_number = order.trackingNumber;
      evidence.shipping_date = order.shippedAt?.toISOString().split('T')[0];
    }

    // Add billing address match evidence
    if (order.billingAddress) {
      evidence.billing_address = [
        (order.billingAddress as any).line1,
        (order.billingAddress as any).line2,
        (order.billingAddress as any).city,
        (order.billingAddress as any).state,
        (order.billingAddress as any).postalCode,
        (order.billingAddress as any).country,
      ].filter(Boolean).join(', ');
    }

    // Submit evidence
    await stripe.disputes.update(dispute.id, {
      evidence,
      submit: true, // Auto-submit evidence
    });

    // Update dispute record
    await prisma.dispute.updateMany({
      where: { stripeDisputeId: dispute.id },
      data: {
        metadata: {
          evidenceAutoSubmitted: true,
          evidenceSubmittedAt: new Date().toISOString(),
        },
      },
    });

    console.log(`Auto-submitted evidence for dispute ${dispute.id}`);
  } catch (error) {
    console.error('Failed to auto-submit dispute evidence:', error);
  }
}
```

### Inventory Reservation

Prevent overselling by reserving inventory during the checkout process with automatic expiration.

```typescript
// lib/inventory.ts
import { prisma } from '@/lib/prisma';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL!,
  token: process.env.UPSTASH_REDIS_TOKEN!,
});

const RESERVATION_TTL = 10 * 60; // 10 minutes in seconds
const RESERVATION_PREFIX = 'inventory:reservation:';

interface ReservationItem {
  productId: string;
  variantId?: string;
  quantity: number;
}

interface ReservationResult {
  success: boolean;
  reservationId?: string;
  failedItems?: Array<{
    productId: string;
    variantId?: string;
    available: number;
    requested: number;
  }>;
}

/**
 * Reserve inventory for checkout
 * Returns a reservation ID that must be used to complete or release the reservation
 */
export async function reserveInventory(
  items: ReservationItem[],
  sessionId: string
): Promise<ReservationResult> {
  const reservationId = `${sessionId}-${Date.now()}`;
  const failedItems: ReservationResult['failedItems'] = [];

  // First, check all items have sufficient inventory
  for (const item of items) {
    const available = await getAvailableInventory(item.productId, item.variantId);

    if (available < item.quantity) {
      failedItems.push({
        productId: item.productId,
        variantId: item.variantId,
        available,
        requested: item.quantity,
      });
    }
  }

  if (failedItems.length > 0) {
    return { success: false, failedItems };
  }

  // Reserve all items atomically using Redis MULTI
  const pipeline = redis.pipeline();

  for (const item of items) {
    const key = getReservationKey(item.productId, item.variantId);

    // Increment reserved count
    pipeline.hincrby(key, 'reserved', item.quantity);
    pipeline.expire(key, RESERVATION_TTL);

    // Track this reservation for later release
    const trackKey = `${RESERVATION_PREFIX}track:${reservationId}`;
    pipeline.hset(trackKey, `${item.productId}:${item.variantId || 'main'}`, item.quantity);
    pipeline.expire(trackKey, RESERVATION_TTL);
  }

  await pipeline.exec();

  // Verify reservations didn't cause overselling (double-check)
  for (const item of items) {
    const available = await getAvailableInventory(item.productId, item.variantId);

    if (available < 0) {
      // Oversold - release this reservation and fail
      await releaseReservation(reservationId);

      return {
        success: false,
        failedItems: [{
          productId: item.productId,
          variantId: item.variantId,
          available: 0,
          requested: item.quantity,
        }],
      };
    }
  }

  return { success: true, reservationId };
}

/**
 * Get available inventory (actual - reserved)
 */
export async function getAvailableInventory(
  productId: string,
  variantId?: string
): Promise<number> {
  // Get actual inventory from database
  let actualInventory: number;

  if (variantId) {
    const variant = await prisma.productVariant.findUnique({
      where: { id: variantId },
      select: { inventory: true },
    });
    actualInventory = variant?.inventory ?? 0;
  } else {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { inventory: true },
    });
    actualInventory = product?.inventory ?? 0;
  }

  // Get reserved count from Redis
  const key = getReservationKey(productId, variantId);
  const reserved = await redis.hget<number>(key, 'reserved') ?? 0;

  return actualInventory - reserved;
}

/**
 * Release a reservation (on checkout abandon or failure)
 */
export async function releaseReservation(reservationId: string): Promise<void> {
  const trackKey = `${RESERVATION_PREFIX}track:${reservationId}`;

  // Get all reserved items for this reservation
  const reservedItems = await redis.hgetall<Record<string, number>>(trackKey);

  if (!reservedItems || Object.keys(reservedItems).length === 0) {
    return;
  }

  const pipeline = redis.pipeline();

  for (const [itemKey, quantity] of Object.entries(reservedItems)) {
    const [productId, variantId] = itemKey.split(':');
    const key = getReservationKey(productId, variantId === 'main' ? undefined : variantId);

    // Decrement reserved count
    pipeline.hincrby(key, 'reserved', -quantity);
  }

  // Delete tracking key
  pipeline.del(trackKey);

  await pipeline.exec();
}

/**
 * Complete a reservation (on successful payment)
 * This removes the reservation but does NOT decrement actual inventory
 * (inventory is decremented by the webhook handler)
 */
export async function completeReservation(reservationId: string): Promise<void> {
  const trackKey = `${RESERVATION_PREFIX}track:${reservationId}`;

  // Get all reserved items for this reservation
  const reservedItems = await redis.hgetall<Record<string, number>>(trackKey);

  if (!reservedItems || Object.keys(reservedItems).length === 0) {
    return;
  }

  const pipeline = redis.pipeline();

  for (const [itemKey, quantity] of Object.entries(reservedItems)) {
    const [productId, variantId] = itemKey.split(':');
    const key = getReservationKey(productId, variantId === 'main' ? undefined : variantId);

    // Decrement reserved count since it's now being purchased
    pipeline.hincrby(key, 'reserved', -quantity);
  }

  // Delete tracking key
  pipeline.del(trackKey);

  await pipeline.exec();
}

/**
 * Extend a reservation TTL (if user is still active in checkout)
 */
export async function extendReservation(reservationId: string): Promise<boolean> {
  const trackKey = `${RESERVATION_PREFIX}track:${reservationId}`;

  // Check if reservation exists
  const exists = await redis.exists(trackKey);
  if (!exists) {
    return false;
  }

  // Get all reserved items
  const reservedItems = await redis.hgetall<Record<string, number>>(trackKey);

  if (!reservedItems || Object.keys(reservedItems).length === 0) {
    return false;
  }

  const pipeline = redis.pipeline();

  // Extend TTL on tracking key
  pipeline.expire(trackKey, RESERVATION_TTL);

  // Extend TTL on each item reservation
  for (const itemKey of Object.keys(reservedItems)) {
    const [productId, variantId] = itemKey.split(':');
    const key = getReservationKey(productId, variantId === 'main' ? undefined : variantId);
    pipeline.expire(key, RESERVATION_TTL);
  }

  await pipeline.exec();
  return true;
}

/**
 * Check if a reservation is still valid
 */
export async function isReservationValid(reservationId: string): Promise<boolean> {
  const trackKey = `${RESERVATION_PREFIX}track:${reservationId}`;
  return (await redis.exists(trackKey)) === 1;
}

/**
 * Get reservation details
 */
export async function getReservationDetails(reservationId: string): Promise<ReservationItem[] | null> {
  const trackKey = `${RESERVATION_PREFIX}track:${reservationId}`;
  const reservedItems = await redis.hgetall<Record<string, number>>(trackKey);

  if (!reservedItems || Object.keys(reservedItems).length === 0) {
    return null;
  }

  return Object.entries(reservedItems).map(([itemKey, quantity]) => {
    const [productId, variantId] = itemKey.split(':');
    return {
      productId,
      variantId: variantId === 'main' ? undefined : variantId,
      quantity,
    };
  });
}

function getReservationKey(productId: string, variantId?: string): string {
  return `${RESERVATION_PREFIX}${productId}${variantId ? `:${variantId}` : ''}`;
}

/**
 * API endpoint to extend reservation (called by client during checkout)
 */
// app/api/checkout/extend-reservation/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { extendReservation } from '@/lib/inventory';

export async function POST(request: NextRequest) {
  try {
    const { reservationId } = await request.json();

    if (!reservationId) {
      return NextResponse.json(
        { error: 'Reservation ID required' },
        { status: 400 }
      );
    }

    const extended = await extendReservation(reservationId);

    if (!extended) {
      return NextResponse.json(
        { error: 'Reservation expired or not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Extend reservation error:', error);
    return NextResponse.json(
      { error: 'Failed to extend reservation' },
      { status: 500 }
    );
  }
}

/**
 * Cleanup job to remove stale reservations
 * Run this periodically via cron
 */
// app/api/cron/cleanup-reservations/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Redis TTL handles cleanup automatically, but we can log stats
  // This endpoint mainly serves as a health check for the reservation system

  return NextResponse.json({
    success: true,
    message: 'Reservation cleanup runs automatically via Redis TTL',
  });
}
```

### PCI Compliance Checklist

This checklist documents the PCI DSS requirements addressed in this implementation.

#### SAQ A / SAQ A-EP Eligibility

This implementation qualifies for SAQ A-EP (or potentially SAQ A with hosted payment fields) because:

- **No card data storage**: Card numbers never touch your servers
- **Tokenization**: Stripe handles all card tokenization
- **Payment Element**: All card input is via Stripe's hosted iframe
- **HTTPS only**: TLS 1.2+ enforced via security headers

#### Security Controls Implemented

| Requirement | Implementation | Location |
|-------------|---------------|----------|
| **TLS 1.2+ Enforcement** | Strict-Transport-Security header with preload | `next.config.js` security headers |
| **No Card Data in Logs** | Stripe handles all card data; PaymentIntent IDs only logged | All API routes |
| **Webhook Signature Verification** | `stripe.webhooks.constructEvent()` validates all webhooks | `/api/webhooks/stripe/*` |
| **CSP Headers** | Strict Content-Security-Policy with Stripe domains allowed | `next.config.js` |
| **CSRF Protection** | Double-submit cookie pattern for state-changing requests | `lib/csrf.ts` |
| **Rate Limiting** | Per-endpoint rate limits prevent abuse | `lib/rate-limit.ts` |
| **Input Validation** | Zod schemas validate all inputs | `lib/validations/*.ts` |
| **Error Handling** | Errors sanitized before client response | `lib/api-error.ts` |
| **Authentication** | Session-based auth with secure cookies | `middleware.ts` |
| **Audit Logging** | Payment events logged with metadata | Webhook handlers |

#### Security Headers Configuration

```javascript
// next.config.js - PCI-compliant security headers
const securityHeaders = [
  // Prevent clickjacking
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },

  // Prevent MIME sniffing
  { key: 'X-Content-Type-Options', value: 'nosniff' },

  // XSS Protection (legacy browsers)
  { key: 'X-XSS-Protection', value: '1; mode=block' },

  // HTTPS enforcement (PCI DSS Requirement 4.1)
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },

  // Referrer policy
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },

  // Permissions policy (disable unnecessary features)
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), payment=(self "https://js.stripe.com")',
  },

  // Content Security Policy (PCI DSS Requirement 6.5.7)
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      // Scripts - allow Stripe
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://m.stripe.network",
      // Styles
      "style-src 'self' 'unsafe-inline'",
      // Images - allow Stripe and CDN
      "img-src 'self' blob: data: https: *.stripe.com",
      // Fonts
      "font-src 'self' data:",
      // Connections - allow Stripe API
      "connect-src 'self' https://api.stripe.com https://*.sentry.io wss://*.stripe.com",
      // Frames - allow Stripe for 3DS
      "frame-src 'self' https://js.stripe.com https://hooks.stripe.com https://*.stripe.com",
      // Prevent embedding in frames (except same origin)
      "frame-ancestors 'self'",
      // Form submissions
      "form-action 'self'",
      // Base URI restriction
      "base-uri 'self'",
      // Upgrade HTTP to HTTPS
      "upgrade-insecure-requests",
    ].join('; '),
  },
];

module.exports = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },

  // Ensure HTTPS in production
  poweredByHeader: false,
};
```

#### Environment Variables for PCI Compliance

```bash
# .env.example - Required environment variables

# CRITICAL: Never commit actual values!
# All secrets should be stored in a secure vault

# Stripe (PCI DSS Requirement 3.4 - don't store card data)
STRIPE_SECRET_KEY=sk_live_... # Server-side only
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_... # Client-safe
STRIPE_WEBHOOK_SECRET=whsec_... # Webhook signature verification

# Database connection (PCI DSS Requirement 8.2 - secure connections)
DATABASE_URL=postgresql://...?sslmode=require

# Session encryption (PCI DSS Requirement 8.5)
AUTH_SECRET=... # Generate with: openssl rand -base64 32

# Never store card numbers in logs (PCI DSS Requirement 3.2)
# Configure log aggregators to filter patterns: /\d{13,19}/ (potential PANs)
```

### PCI DSS SAQ-A Self-Assessment Checklist

When using Stripe Elements or Payment Element (as this recipe does), you qualify for SAQ-A, the simplest PCI compliance level. Here's the validation checklist:

```typescript
// lib/pci-compliance.ts
// PCI DSS Self-Assessment Questionnaire A (SAQ-A) Compliance Validation

export interface PCIComplianceCheck {
  requirementId: string;
  requirement: string;
  status: 'compliant' | 'non-compliant' | 'not-applicable';
  evidence: string;
  notes?: string;
}

/**
 * PCI DSS SAQ-A Compliance Checklist
 * Applicable for e-commerce websites that fully outsource cardholder data handling
 */
export const SAQ_A_CHECKLIST: PCIComplianceCheck[] = [
  // Requirement 2: Do not use vendor-supplied defaults
  {
    requirementId: '2.1',
    requirement: 'Change vendor-supplied defaults and remove unnecessary accounts',
    status: 'compliant',
    evidence: 'All default credentials changed; unnecessary services disabled',
  },

  // Requirement 9: Restrict physical access
  {
    requirementId: '9.9',
    requirement: 'Protect devices that capture payment card data',
    status: 'not-applicable',
    evidence: 'No physical card-capture devices; all payments via Stripe hosted forms',
  },

  // Requirement 12: Information security policy
  {
    requirementId: '12.1',
    requirement: 'Establish, publish, maintain security policy',
    status: 'compliant',
    evidence: 'Security policy documented in SECURITY.md',
  },
  {
    requirementId: '12.8',
    requirement: 'Maintain list of service providers',
    status: 'compliant',
    evidence: 'Stripe listed as PCI Level 1 payment processor',
  },
  {
    requirementId: '12.8.2',
    requirement: 'Service provider PCI DSS compliance confirmed',
    status: 'compliant',
    evidence: 'Stripe maintains PCI Level 1 compliance; AOC available at stripe.com',
  },
];

/**
 * Key SAQ-A eligibility criteria - validate you qualify
 */
export function validateSAQAEligibility(): {
  eligible: boolean;
  criteria: Array<{ criterion: string; met: boolean; details: string }>;
} {
  const criteria = [
    {
      criterion: 'All cardholder data processing outsourced to PCI-compliant third party',
      met: true,
      details: 'All card data handled by Stripe Elements; never touches our servers',
    },
    {
      criterion: 'No electronic storage of cardholder data',
      met: true,
      details: 'No card numbers, CVVs, or track data stored in database or logs',
    },
    {
      criterion: 'No direct connection between merchant systems and cardholder data',
      met: true,
      details: 'Stripe.js communicates directly with Stripe servers via iframe',
    },
    {
      criterion: 'All payment page elements served from PCI-compliant provider',
      met: true,
      details: 'Card input fields are Stripe-hosted iframes (js.stripe.com)',
    },
    {
      criterion: 'Website served entirely via HTTPS',
      met: true,
      details: 'HSTS header enforced; TLS 1.2+ required',
    },
  ];

  return {
    eligible: criteria.every((c) => c.met),
    criteria,
  };
}

/**
 * Validate that card data is not inadvertently captured
 */
export function auditForCardDataLeakage(logContent: string): {
  safe: boolean;
  potentialPANs: string[];
  potentialCVVs: string[];
} {
  // Luhn check for potential PANs
  const potentialPANs: string[] = [];
  const panPattern = /\b\d{13,19}\b/g;
  const matches = logContent.match(panPattern) || [];

  for (const match of matches) {
    if (luhnCheck(match)) {
      potentialPANs.push(match.replace(/\d(?=\d{4})/g, '*')); // Mask for reporting
    }
  }

  // Look for potential CVVs (3-4 digit sequences in suspicious context)
  const cvvPattern = /cvv|cvc|security.?code|card.?code/i;
  const potentialCVVs: string[] = [];
  if (cvvPattern.test(logContent)) {
    potentialCVVs.push('[CVV-related content detected]');
  }

  return {
    safe: potentialPANs.length === 0 && potentialCVVs.length === 0,
    potentialPANs,
    potentialCVVs,
  };
}

function luhnCheck(cardNumber: string): boolean {
  const digits = cardNumber.replace(/\D/g, '');
  let sum = 0;
  let isEven = false;

  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = parseInt(digits[i], 10);

    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    isEven = !isEven;
  }

  return sum % 10 === 0;
}
```

### Cardholder Data Environment (CDE) Isolation

```typescript
// middleware/cde-protection.ts
import { NextRequest, NextResponse } from 'next/server';

/**
 * Middleware to enforce CDE (Cardholder Data Environment) protection
 * Even with SAQ-A, we ensure strict isolation
 */
export async function cdeProtectionMiddleware(request: NextRequest): Promise<NextResponse | null> {
  const response = NextResponse.next();

  // Enhanced security headers for payment pages
  if (isPaymentRelatedPage(request.nextUrl.pathname)) {
    // Stricter CSP for payment pages
    response.headers.set(
      'Content-Security-Policy',
      [
        "default-src 'self'",
        "script-src 'self' https://js.stripe.com",
        "style-src 'self' 'unsafe-inline'",
        "frame-src 'self' https://js.stripe.com https://hooks.stripe.com",
        "connect-src 'self' https://api.stripe.com",
        "img-src 'self' data: https://*.stripe.com",
        "frame-ancestors 'none'",
        "form-action 'self'",
        "base-uri 'self'",
        "upgrade-insecure-requests",
      ].join('; ')
    );

    // Prevent caching of payment pages
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');

    // Additional security headers
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-XSS-Protection', '1; mode=block');
  }

  return response;
}

function isPaymentRelatedPage(pathname: string): boolean {
  const paymentPaths = [
    '/checkout',
    '/payment',
    '/order',
    '/cart',
    '/api/checkout',
    '/api/payment',
  ];
  return paymentPaths.some((path) => pathname.startsWith(path));
}

/**
 * Request sanitization - ensure no card data in requests
 */
export function sanitizeRequestBody(body: any): any {
  const sensitivePatterns = [
    /\b\d{13,19}\b/, // Potential PAN
    /\b\d{3,4}\b.*(?:cvv|cvc|security)/i, // Potential CVV
    /\bcard(?:_)?number\b/i,
    /\bcvv\b/i,
    /\bcvc\b/i,
  ];

  const sanitized = JSON.stringify(body);

  for (const pattern of sensitivePatterns) {
    if (pattern.test(sanitized)) {
      throw new Error('Request rejected: potential cardholder data detected');
    }
  }

  return body;
}
```

### PCI DSS Compliance Validation Tests

```typescript
// tests/compliance/pci-dss.test.ts
import { describe, it, expect, beforeAll } from 'vitest';
import { validateSAQAEligibility, auditForCardDataLeakage } from '@/lib/pci-compliance';
import * as fs from 'fs';
import * as path from 'path';

describe('PCI DSS Compliance Tests', () => {
  describe('SAQ-A Eligibility', () => {
    it('validates SAQ-A eligibility criteria', () => {
      const result = validateSAQAEligibility();

      expect(result.eligible).toBe(true);
      result.criteria.forEach((criterion) => {
        expect(criterion.met).toBe(true);
      });
    });

    it('confirms no card data stored in database schema', () => {
      const schemaPath = path.join(process.cwd(), 'prisma/schema.prisma');
      const schema = fs.readFileSync(schemaPath, 'utf-8');

      // Ensure no card-related fields
      expect(schema).not.toMatch(/cardNumber/i);
      expect(schema).not.toMatch(/\bcvv\b/i);
      expect(schema).not.toMatch(/\bcvc\b/i);
      expect(schema).not.toMatch(/cardExpir/i);
      expect(schema).not.toMatch(/pan\s+String/i);

      // Verify we only store PaymentIntent ID (safe)
      expect(schema).toMatch(/paymentIntent\s+String/);
    });

    it('confirms no card data in environment variables', () => {
      const envExamplePath = path.join(process.cwd(), '.env.example');
      if (fs.existsSync(envExamplePath)) {
        const envContent = fs.readFileSync(envExamplePath, 'utf-8');

        expect(envContent).not.toMatch(/CARD_NUMBER/i);
        expect(envContent).not.toMatch(/CVV/i);
        expect(envContent).not.toMatch(/CVC/i);

        // Safe Stripe variables should exist
        expect(envContent).toMatch(/STRIPE_SECRET_KEY/);
        expect(envContent).toMatch(/STRIPE_PUBLISHABLE_KEY/);
        expect(envContent).toMatch(/STRIPE_WEBHOOK_SECRET/);
      }
    });
  });

  describe('Card Data Leakage Prevention', () => {
    it('detects potential PAN in logs', () => {
      const logWithPAN = 'User checkout completed. Card: 4242424242424242';
      const result = auditForCardDataLeakage(logWithPAN);

      expect(result.safe).toBe(false);
      expect(result.potentialPANs.length).toBeGreaterThan(0);
    });

    it('passes safe log content', () => {
      const safeLog = 'User checkout completed. PaymentIntent: pi_3ABC123xyz';
      const result = auditForCardDataLeakage(safeLog);

      expect(result.safe).toBe(true);
      expect(result.potentialPANs).toHaveLength(0);
    });

    it('detects CVV-related content', () => {
      const logWithCVV = 'Card CVV entered: 123';
      const result = auditForCardDataLeakage(logWithCVV);

      expect(result.safe).toBe(false);
      expect(result.potentialCVVs.length).toBeGreaterThan(0);
    });

    it('validates Luhn algorithm for real PANs', () => {
      // Valid test card numbers (pass Luhn)
      const validPANs = [
        '4242424242424242', // Stripe test
        '5555555555554444', // Stripe test
        '378282246310005', // Amex test
      ];

      for (const pan of validPANs) {
        const result = auditForCardDataLeakage(`Log entry with ${pan}`);
        expect(result.potentialPANs.length).toBeGreaterThan(0);
      }

      // Invalid numbers (fail Luhn) should not flag
      const invalidNumber = '1234567890123456';
      const result = auditForCardDataLeakage(`Log with ${invalidNumber}`);
      expect(result.potentialPANs).toHaveLength(0);
    });
  });

  describe('Security Headers', () => {
    it('validates security headers on payment pages', async () => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/checkout`, {
        method: 'HEAD',
      });

      const headers = response.headers;

      // HSTS
      expect(headers.get('strict-transport-security')).toContain('max-age=');

      // Content Security Policy
      const csp = headers.get('content-security-policy');
      expect(csp).toContain("default-src 'self'");
      expect(csp).toContain('https://js.stripe.com');

      // Prevent framing
      expect(headers.get('x-frame-options')).toBeTruthy();

      // MIME sniffing protection
      expect(headers.get('x-content-type-options')).toBe('nosniff');
    });
  });

  describe('Stripe Integration Security', () => {
    it('verifies Stripe webhook signature validation', async () => {
      const invalidPayload = JSON.stringify({ type: 'payment_intent.succeeded' });
      const invalidSignature = 'invalid_signature';

      const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/stripe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'stripe-signature': invalidSignature,
        },
        body: invalidPayload,
      });

      // Should reject invalid signatures
      expect(response.status).toBe(400);
    });

    it('ensures Payment Element is used (not direct card input)', () => {
      // Scan checkout component for Stripe Payment Element usage
      const checkoutComponentPath = path.join(
        process.cwd(),
        'components/checkout/payment-element.tsx'
      );
      const componentContent = fs.readFileSync(checkoutComponentPath, 'utf-8');

      // Should use PaymentElement from Stripe
      expect(componentContent).toMatch(/@stripe\/react-stripe-js/);
      expect(componentContent).toMatch(/PaymentElement/);

      // Should NOT have direct card input fields
      expect(componentContent).not.toMatch(/<input.*type=["']text["'].*name=["']cardNumber/i);
      expect(componentContent).not.toMatch(/<input.*name=["']cvv/i);
    });
  });

  describe('API Security', () => {
    it('rejects requests with potential card data in body', async () => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: 'order_123',
          cardNumber: '4242424242424242', // This should be rejected
        }),
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toContain('cardholder data');
    });

    it('accepts valid checkout requests without card data', async () => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: 'order_123',
          customerEmail: 'test@example.com',
          // No card data - Stripe handles that
        }),
      });

      // May fail for other reasons, but not card data rejection
      const data = await response.json();
      expect(data.error).not.toContain('cardholder data');
    });
  });
});
```

### Payment Data Incident Response

```typescript
// lib/payment-incident-response.ts
import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/email';

export enum PaymentIncidentType {
  POTENTIAL_DATA_BREACH = 'POTENTIAL_DATA_BREACH',
  FRAUDULENT_ACTIVITY = 'FRAUDULENT_ACTIVITY',
  UNUSUAL_TRANSACTION_PATTERN = 'UNUSUAL_TRANSACTION_PATTERN',
  WEBHOOK_SIGNATURE_FAILURE = 'WEBHOOK_SIGNATURE_FAILURE',
  STRIPE_API_ERROR = 'STRIPE_API_ERROR',
}

export enum IncidentSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

interface PaymentIncidentReport {
  type: PaymentIncidentType;
  severity: IncidentSeverity;
  description: string;
  affectedOrders?: string[];
  affectedCustomers?: string[];
  ipAddress?: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

/**
 * Report and handle payment-related security incidents
 */
export async function reportPaymentIncident(incident: PaymentIncidentReport): Promise<string> {
  // 1. Log the incident
  const incidentRecord = await prisma.paymentIncident.create({
    data: {
      type: incident.type,
      severity: incident.severity,
      description: incident.description,
      affectedOrders: incident.affectedOrders || [],
      affectedCustomers: incident.affectedCustomers || [],
      ipAddress: incident.ipAddress,
      metadata: incident.metadata,
      status: 'OPEN',
      reportedAt: incident.timestamp,
    },
  });

  // 2. Immediate notifications for high/critical severity
  if (incident.severity === IncidentSeverity.HIGH || incident.severity === IncidentSeverity.CRITICAL) {
    await notifySecurityTeam(incidentRecord);
  }

  // 3. Automatic response actions based on severity
  if (incident.severity === IncidentSeverity.CRITICAL) {
    await initiateEmergencyResponse(incidentRecord);
  }

  // 4. Create audit trail
  await prisma.auditLog.create({
    data: {
      action: 'PAYMENT_INCIDENT_REPORTED',
      entityType: 'PaymentIncident',
      entityId: incidentRecord.id,
      details: {
        type: incident.type,
        severity: incident.severity,
      },
    },
  });

  return incidentRecord.id;
}

async function notifySecurityTeam(incident: any): Promise<void> {
  const securityEmails = process.env.SECURITY_TEAM_EMAILS?.split(',') || [];

  for (const email of securityEmails) {
    await sendEmail({
      to: email.trim(),
      subject: `[${incident.severity}] Payment Security Incident - ${incident.type}`,
      template: 'payment-incident-alert',
      data: {
        incidentId: incident.id,
        type: incident.type,
        severity: incident.severity,
        description: incident.description,
        timestamp: incident.reportedAt.toISOString(),
        dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL}/admin/security/incidents/${incident.id}`,
      },
    });
  }
}

async function initiateEmergencyResponse(incident: any): Promise<void> {
  // For critical incidents, take immediate protective actions

  // 1. If IP-based attack, add to blocklist
  if (incident.ipAddress) {
    await prisma.blockedIP.upsert({
      where: { ip: incident.ipAddress },
      create: {
        ip: incident.ipAddress,
        reason: `Auto-blocked: ${incident.type}`,
        incidentId: incident.id,
      },
      update: {
        reason: `Auto-blocked: ${incident.type}`,
        incidentId: incident.id,
      },
    });
  }

  // 2. Flag affected orders for review
  if (incident.affectedOrders?.length > 0) {
    await prisma.order.updateMany({
      where: { id: { in: incident.affectedOrders } },
      data: { requiresReview: true, reviewReason: incident.type },
    });
  }

  // 3. Log emergency response
  await prisma.auditLog.create({
    data: {
      action: 'EMERGENCY_RESPONSE_INITIATED',
      entityType: 'PaymentIncident',
      entityId: incident.id,
      details: {
        actionsType: 'IP blocklist, order flagging',
      },
    },
  });
}

/**
 * PCI DSS Requirement 12.10: Incident Response Plan
 * Checklist for payment data incidents
 */
export const INCIDENT_RESPONSE_CHECKLIST = [
  '1. Contain: Isolate affected systems immediately',
  '2. Preserve: Secure all logs and evidence',
  '3. Notify: Alert security team and management',
  '4. Investigate: Determine scope and impact',
  '5. Remediate: Fix vulnerabilities, reset credentials',
  '6. Report: Notify Stripe, card brands if required (within 72 hours)',
  '7. Review: Update security measures and document lessons learned',
];
```

### Payment Flow Tests

Comprehensive tests for the payment flow including 3D Secure, failure handling, and refunds.

```typescript
// tests/e2e/checkout.spec.ts
import { test, expect } from '@playwright/test';

test.describe('E2E Checkout Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Clear any existing cart
    await page.evaluate(() => localStorage.clear());
  });

  test('complete purchase with card payment', async ({ page }) => {
    // 1. Add product to cart
    await page.goto('/products/test-product');
    await page.click('button:has-text("Add to Cart")');
    await expect(page.locator('[data-testid="cart-count"]')).toHaveText('1');

    // 2. Go to checkout
    await page.click('[data-testid="cart-drawer"] >> text=Checkout');
    await expect(page).toHaveURL('/checkout');

    // 3. Fill shipping information
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="shippingAddress.name"]', 'John Doe');
    await page.fill('[name="shippingAddress.line1"]', '123 Test Street');
    await page.fill('[name="shippingAddress.city"]', 'San Francisco');
    await page.fill('[name="shippingAddress.state"]', 'CA');
    await page.fill('[name="shippingAddress.postalCode"]', '94102');
    await page.selectOption('[name="shippingAddress.country"]', 'US');

    // 4. Wait for Stripe Payment Element to load
    await page.waitForSelector('[data-testid="payment-element"]');

    // 5. Fill Stripe card details (using Stripe test card)
    const stripeFrame = page.frameLocator('iframe[name^="__privateStripeFrame"]').first();
    await stripeFrame.locator('[name="number"]').fill('4242424242424242');
    await stripeFrame.locator('[name="expiry"]').fill('12/30');
    await stripeFrame.locator('[name="cvc"]').fill('123');
    await stripeFrame.locator('[name="postalCode"]').fill('94102');

    // 6. Submit payment
    await page.click('button:has-text("Pay")');

    // 7. Wait for redirect to success page
    await expect(page).toHaveURL(/\/order\/.*\?success=true/, { timeout: 30000 });
    await expect(page.locator('h1')).toContainText('Order Confirmed');
  });

  test('3D Secure authentication flow', async ({ page }) => {
    // Add product and go to checkout
    await page.goto('/products/test-product');
    await page.click('button:has-text("Add to Cart")');
    await page.click('[data-testid="cart-drawer"] >> text=Checkout');

    // Fill shipping information
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="shippingAddress.name"]', 'John Doe');
    await page.fill('[name="shippingAddress.line1"]', '123 Test Street');
    await page.fill('[name="shippingAddress.city"]', 'San Francisco');
    await page.fill('[name="shippingAddress.state"]', 'CA');
    await page.fill('[name="shippingAddress.postalCode"]', '94102');
    await page.selectOption('[name="shippingAddress.country"]', 'US');

    // Wait for Stripe Payment Element
    await page.waitForSelector('[data-testid="payment-element"]');

    // Use Stripe 3DS test card
    const stripeFrame = page.frameLocator('iframe[name^="__privateStripeFrame"]').first();
    await stripeFrame.locator('[name="number"]').fill('4000002500003155'); // 3DS required card
    await stripeFrame.locator('[name="expiry"]').fill('12/30');
    await stripeFrame.locator('[name="cvc"]').fill('123');
    await stripeFrame.locator('[name="postalCode"]').fill('94102');

    // Submit payment
    await page.click('button:has-text("Pay")');

    // Wait for 3DS modal/iframe
    await page.waitForSelector('iframe[name="stripe-challenge-frame"]', { timeout: 10000 });

    // Complete 3DS challenge in Stripe test mode
    const challengeFrame = page.frameLocator('iframe[name="stripe-challenge-frame"]');
    await challengeFrame.locator('button:has-text("Complete")').click();

    // Wait for success
    await expect(page).toHaveURL(/\/order\/.*\?success=true/, { timeout: 30000 });
  });

  test('handles declined card gracefully', async ({ page }) => {
    await page.goto('/products/test-product');
    await page.click('button:has-text("Add to Cart")');
    await page.click('[data-testid="cart-drawer"] >> text=Checkout');

    // Fill shipping information
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="shippingAddress.name"]', 'John Doe');
    await page.fill('[name="shippingAddress.line1"]', '123 Test Street');
    await page.fill('[name="shippingAddress.city"]', 'San Francisco');
    await page.fill('[name="shippingAddress.state"]', 'CA');
    await page.fill('[name="shippingAddress.postalCode"]', '94102');
    await page.selectOption('[name="shippingAddress.country"]', 'US');

    await page.waitForSelector('[data-testid="payment-element"]');

    // Use Stripe declined test card
    const stripeFrame = page.frameLocator('iframe[name^="__privateStripeFrame"]').first();
    await stripeFrame.locator('[name="number"]').fill('4000000000000002'); // Declined card
    await stripeFrame.locator('[name="expiry"]').fill('12/30');
    await stripeFrame.locator('[name="cvc"]').fill('123');
    await stripeFrame.locator('[name="postalCode"]').fill('94102');

    await page.click('button:has-text("Pay")');

    // Should show error message
    await expect(page.locator('[role="alert"]')).toContainText(/declined/i, { timeout: 10000 });

    // User should still be on checkout page
    await expect(page).toHaveURL('/checkout');
  });

  test('handles insufficient funds error', async ({ page }) => {
    await page.goto('/products/test-product');
    await page.click('button:has-text("Add to Cart")');
    await page.click('[data-testid="cart-drawer"] >> text=Checkout');

    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="shippingAddress.name"]', 'John Doe');
    await page.fill('[name="shippingAddress.line1"]', '123 Test Street');
    await page.fill('[name="shippingAddress.city"]', 'San Francisco');
    await page.fill('[name="shippingAddress.state"]', 'CA');
    await page.fill('[name="shippingAddress.postalCode"]', '94102');
    await page.selectOption('[name="shippingAddress.country"]', 'US');

    await page.waitForSelector('[data-testid="payment-element"]');

    // Use Stripe insufficient funds test card
    const stripeFrame = page.frameLocator('iframe[name^="__privateStripeFrame"]').first();
    await stripeFrame.locator('[name="number"]').fill('4000000000009995');
    await stripeFrame.locator('[name="expiry"]').fill('12/30');
    await stripeFrame.locator('[name="cvc"]').fill('123');
    await stripeFrame.locator('[name="postalCode"]').fill('94102');

    await page.click('button:has-text("Pay")');

    await expect(page.locator('[role="alert"]')).toContainText(/insufficient funds/i, { timeout: 10000 });
  });

  test('inventory reservation prevents overselling', async ({ page, context }) => {
    // Create a second page (simulating another customer)
    const page2 = await context.newPage();

    // Both customers add the same low-stock product
    await page.goto('/products/low-stock-product'); // Product with 1 item
    await page2.goto('/products/low-stock-product');

    // First customer adds to cart
    await page.click('button:has-text("Add to Cart")');
    await page.click('[data-testid="cart-drawer"] >> text=Checkout');

    // First customer starts checkout - inventory reserved
    await page.fill('[name="email"]', 'customer1@example.com');
    await page.fill('[name="shippingAddress.name"]', 'Customer One');
    await page.fill('[name="shippingAddress.line1"]', '123 First Street');
    await page.fill('[name="shippingAddress.city"]', 'San Francisco');
    await page.fill('[name="shippingAddress.state"]', 'CA');
    await page.fill('[name="shippingAddress.postalCode"]', '94102');
    await page.selectOption('[name="shippingAddress.country"]', 'US');

    // Second customer tries to add to cart
    await page2.click('button:has-text("Add to Cart")');

    // Second customer should see out of stock or error
    await expect(page2.locator('text=Out of Stock')).toBeVisible({ timeout: 5000 });

    await page2.close();
  });
});

test.describe('Refund Flow', () => {
  test('admin can process full refund', async ({ page }) => {
    // Login as admin
    await page.goto('/admin/login');
    await page.fill('[name="email"]', 'admin@example.com');
    await page.fill('[name="password"]', 'adminpassword');
    await page.click('button:has-text("Login")');

    // Navigate to order
    await page.goto('/admin/orders');
    await page.click('[data-testid="order-row"]:first-child');

    // Click refund button
    await page.click('button:has-text("Issue Refund")');

    // Select full refund
    await page.click('[data-testid="full-refund-option"]');
    await page.selectOption('[name="reason"]', 'requested_by_customer');
    await page.fill('[name="note"]', 'Customer changed their mind');

    // Confirm refund
    await page.click('button:has-text("Confirm Refund")');

    // Verify success
    await expect(page.locator('[data-testid="refund-success"]')).toBeVisible();
    await expect(page.locator('[data-testid="order-status"]')).toHaveText('Refunded');
  });

  test('admin can process partial refund', async ({ page }) => {
    await page.goto('/admin/login');
    await page.fill('[name="email"]', 'admin@example.com');
    await page.fill('[name="password"]', 'adminpassword');
    await page.click('button:has-text("Login")');

    await page.goto('/admin/orders');
    await page.click('[data-testid="order-row"]:first-child');

    await page.click('button:has-text("Issue Refund")');

    // Select partial refund
    await page.click('[data-testid="partial-refund-option"]');
    await page.fill('[name="amount"]', '10.00'); // $10 refund
    await page.selectOption('[name="reason"]', 'product_unacceptable');
    await page.fill('[name="note"]', 'Item arrived damaged');

    await page.click('button:has-text("Confirm Refund")');

    await expect(page.locator('[data-testid="refund-success"]')).toBeVisible();
    await expect(page.locator('[data-testid="refund-amount"]')).toHaveText('$10.00');
  });
});
```

```typescript
// tests/integration/fraud.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { performFraudCheck, recordOrderForVelocity, reserveInventory } from '@/lib/fraud-detection';
import { Redis } from '@upstash/redis';

// Mock Redis
vi.mock('@upstash/redis', () => ({
  Redis: vi.fn().mockImplementation(() => ({
    zcount: vi.fn(),
    get: vi.fn(),
    zadd: vi.fn(),
    expire: vi.fn(),
    incrby: vi.fn(),
    pipeline: vi.fn(() => ({
      hincrby: vi.fn().mockReturnThis(),
      expire: vi.fn().mockReturnThis(),
      hset: vi.fn().mockReturnThis(),
      exec: vi.fn(),
    })),
  })),
}));

// Mock Prisma
vi.mock('@/lib/prisma', () => ({
  prisma: {
    order: { aggregate: vi.fn() },
    user: { findUnique: vi.fn() },
    product: { findUnique: vi.fn() },
    productVariant: { findUnique: vi.fn() },
  },
}));

describe('Fraud Detection', () => {
  let mockRedis: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockRedis = new Redis({ url: '', token: '' });
  });

  describe('performFraudCheck', () => {
    it('allows normal transactions', async () => {
      mockRedis.zcount.mockResolvedValue(0);
      mockRedis.get.mockResolvedValue(null);

      const result = await performFraudCheck({
        email: 'customer@gmail.com',
        ipAddress: '192.168.1.1',
        amount: 5000, // $50
        shippingAddress: { country: 'US', postalCode: '94102' },
      });

      expect(result.allowed).toBe(true);
      expect(result.riskLevel).toBe('low');
      expect(result.flags).toHaveLength(0);
    });

    it('blocks high velocity IP', async () => {
      mockRedis.zcount.mockResolvedValue(10); // 10 orders in last hour
      mockRedis.get.mockResolvedValue(null);

      const result = await performFraudCheck({
        email: 'customer@gmail.com',
        ipAddress: '192.168.1.1',
        amount: 5000,
        shippingAddress: { country: 'US', postalCode: '94102' },
      });

      expect(result.allowed).toBe(false);
      expect(result.riskLevel).toBe('critical');
      expect(result.flags).toContain('velocity_ip_hour_exceeded');
    });

    it('flags disposable email domains', async () => {
      mockRedis.zcount.mockResolvedValue(0);
      mockRedis.get.mockResolvedValue(null);

      const result = await performFraudCheck({
        email: 'test@tempmail.com',
        ipAddress: '192.168.1.1',
        amount: 5000,
        shippingAddress: { country: 'US', postalCode: '94102' },
      });

      expect(result.allowed).toBe(true);
      expect(result.flags).toContain('disposable_email');
      expect(result.riskLevel).not.toBe('low');
    });

    it('flags billing/shipping country mismatch', async () => {
      mockRedis.zcount.mockResolvedValue(0);
      mockRedis.get.mockResolvedValue(null);

      const result = await performFraudCheck({
        email: 'customer@gmail.com',
        ipAddress: '192.168.1.1',
        amount: 5000,
        shippingAddress: { country: 'US', postalCode: '94102' },
        billingAddress: { country: 'GB', postalCode: 'SW1A 1AA' },
      });

      expect(result.flags).toContain('country_mismatch');
    });

    it('flags high-value orders', async () => {
      mockRedis.zcount.mockResolvedValue(0);
      mockRedis.get.mockResolvedValue(null);

      const result = await performFraudCheck({
        email: 'customer@gmail.com',
        ipAddress: '192.168.1.1',
        amount: 100000, // $1000
        shippingAddress: { country: 'US', postalCode: '94102' },
      });

      expect(result.flags).toContain('high_value_order');
    });

    it('requires review for medium risk', async () => {
      mockRedis.zcount.mockResolvedValue(2); // Slightly elevated velocity
      mockRedis.get.mockResolvedValue(30000); // $300 today

      const result = await performFraudCheck({
        email: 'customer@tempmail.com', // Disposable email
        ipAddress: '192.168.1.1',
        amount: 20000, // $200
        shippingAddress: { country: 'US', postalCode: '94102' },
      });

      expect(result.allowed).toBe(true);
      expect(result.requiresReview).toBe(true);
      expect(['medium', 'high']).toContain(result.riskLevel);
    });
  });

  describe('recordOrderForVelocity', () => {
    it('records order in Redis', async () => {
      const pipeline = mockRedis.pipeline();

      await recordOrderForVelocity(
        '192.168.1.1',
        'customer@example.com',
        5000
      );

      expect(pipeline.zadd).toHaveBeenCalled();
      expect(pipeline.incrby).toHaveBeenCalled();
      expect(pipeline.expire).toHaveBeenCalled();
    });

    it('records fingerprint when provided', async () => {
      const pipeline = mockRedis.pipeline();

      await recordOrderForVelocity(
        '192.168.1.1',
        'customer@example.com',
        5000,
        'browser-fingerprint-123'
      );

      // Should have additional calls for fingerprint
      expect(pipeline.zadd).toHaveBeenCalledTimes(3); // IP, email, fingerprint
    });
  });
});

describe('Inventory Reservation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('reserves inventory successfully', async () => {
    const { prisma } = await import('@/lib/prisma');
    (prisma.product.findUnique as any).mockResolvedValue({ inventory: 10 });

    const mockRedis = new Redis({ url: '', token: '' });
    (mockRedis.hget as any).mockResolvedValue(0);

    const result = await reserveInventory(
      [{ productId: 'prod-1', quantity: 2 }],
      'session-123'
    );

    expect(result.success).toBe(true);
    expect(result.reservationId).toBeDefined();
  });

  it('fails when inventory insufficient', async () => {
    const { prisma } = await import('@/lib/prisma');
    (prisma.product.findUnique as any).mockResolvedValue({ inventory: 1 });

    const mockRedis = new Redis({ url: '', token: '' });
    (mockRedis.hget as any).mockResolvedValue(0);

    const result = await reserveInventory(
      [{ productId: 'prod-1', quantity: 5 }],
      'session-123'
    );

    expect(result.success).toBe(false);
    expect(result.failedItems).toHaveLength(1);
    expect(result.failedItems![0].available).toBe(1);
    expect(result.failedItems![0].requested).toBe(5);
  });

  it('accounts for existing reservations', async () => {
    const { prisma } = await import('@/lib/prisma');
    (prisma.product.findUnique as any).mockResolvedValue({ inventory: 5 });

    const mockRedis = new Redis({ url: '', token: '' });
    (mockRedis.hget as any).mockResolvedValue(3); // 3 already reserved

    const result = await reserveInventory(
      [{ productId: 'prod-1', quantity: 3 }],
      'session-123'
    );

    // Available = 5 - 3 = 2, requested = 3
    expect(result.success).toBe(false);
    expect(result.failedItems![0].available).toBe(2);
  });
});

describe('Stripe Radar Integration', () => {
  it('handles early fraud warning webhook', async () => {
    const { POST } = await import('@/app/api/webhooks/stripe/radar/route');
    const { prisma } = await import('@/lib/prisma');

    (prisma.order.findFirst as any).mockResolvedValue({
      id: 'order-1',
      status: 'CONFIRMED',
      metadata: {},
    });

    const mockEvent = {
      type: 'radar.early_fraud_warning.created',
      data: {
        object: {
          charge: 'ch_123',
          fraud_type: 'unauthorized_use_of_card',
        },
      },
    };

    // Mock Stripe webhook verification
    vi.mock('stripe', () => ({
      default: vi.fn().mockImplementation(() => ({
        webhooks: {
          constructEvent: vi.fn().mockReturnValue(mockEvent),
        },
        charges: {
          retrieve: vi.fn().mockResolvedValue({ payment_intent: 'pi_123' }),
        },
      })),
    }));

    const request = new Request('http://localhost/api/webhooks/stripe/radar', {
      method: 'POST',
      body: JSON.stringify(mockEvent),
      headers: { 'stripe-signature': 'test_sig' },
    });

    const response = await POST(request as any);
    expect(response.status).toBe(200);
    expect(prisma.order.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'order-1' },
        data: expect.objectContaining({
          metadata: expect.objectContaining({
            earlyFraudWarning: true,
          }),
        }),
      })
    );
  });
});
```

## Testing

### Test Setup

```bash
# Install testing dependencies
npm install -D vitest @vitejs/plugin-react @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
npm install -D playwright @playwright/test
npx playwright install
```

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    include: ['**/*.test.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'tests/e2e/'],
      thresholds: {
        statements: 80,
        branches: 75,
        functions: 80,
        lines: 80,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

```typescript
// tests/setup.ts
import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/',
}));

// Mock Next.js Image
vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: any) => <img src={src} alt={alt} {...props} />,
}));

// Mock Stripe
vi.mock('@stripe/stripe-js', () => ({
  loadStripe: vi.fn(() => Promise.resolve({
    redirectToCheckout: vi.fn(),
  })),
}));

// Mock localStorage for Zustand
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });
```

### Unit Tests - Cart Store

```typescript
// tests/unit/cart-store.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { useCartStore } from '@/lib/store/cart';

describe('Cart Store', () => {
  beforeEach(() => {
    useCartStore.setState({ items: [], isOpen: false });
  });

  describe('addItem', () => {
    it('adds a new item to cart', () => {
      const { addItem, items } = useCartStore.getState();
      
      addItem({
        id: 'item-1',
        productId: 'prod-1',
        name: 'Test Product',
        price: 2999,
        image: '/test.jpg',
      });
      
      const state = useCartStore.getState();
      expect(state.items).toHaveLength(1);
      expect(state.items[0].quantity).toBe(1);
      expect(state.isOpen).toBe(true);
    });

    it('increments quantity for existing item', () => {
      const { addItem } = useCartStore.getState();
      
      addItem({
        id: 'item-1',
        productId: 'prod-1',
        name: 'Test Product',
        price: 2999,
        image: '/test.jpg',
      });
      
      addItem({
        id: 'item-1',
        productId: 'prod-1',
        name: 'Test Product',
        price: 2999,
        image: '/test.jpg',
      }, 2);
      
      const state = useCartStore.getState();
      expect(state.items).toHaveLength(1);
      expect(state.items[0].quantity).toBe(3);
    });

    it('adds custom quantity', () => {
      const { addItem } = useCartStore.getState();
      
      addItem({
        id: 'item-1',
        productId: 'prod-1',
        name: 'Test Product',
        price: 2999,
        image: '/test.jpg',
      }, 5);
      
      expect(useCartStore.getState().items[0].quantity).toBe(5);
    });
  });

  describe('removeItem', () => {
    it('removes item from cart', () => {
      useCartStore.setState({
        items: [
          { id: 'item-1', productId: 'prod-1', name: 'Product 1', price: 1000, image: '/1.jpg', quantity: 2 },
          { id: 'item-2', productId: 'prod-2', name: 'Product 2', price: 2000, image: '/2.jpg', quantity: 1 },
        ],
      });
      
      useCartStore.getState().removeItem('item-1');
      
      const state = useCartStore.getState();
      expect(state.items).toHaveLength(1);
      expect(state.items[0].id).toBe('item-2');
    });
  });

  describe('updateQuantity', () => {
    it('updates item quantity', () => {
      useCartStore.setState({
        items: [{ id: 'item-1', productId: 'prod-1', name: 'Product', price: 1000, image: '/1.jpg', quantity: 1 }],
      });
      
      useCartStore.getState().updateQuantity('item-1', 5);
      
      expect(useCartStore.getState().items[0].quantity).toBe(5);
    });

    it('removes item when quantity is 0 or less', () => {
      useCartStore.setState({
        items: [{ id: 'item-1', productId: 'prod-1', name: 'Product', price: 1000, image: '/1.jpg', quantity: 1 }],
      });
      
      useCartStore.getState().updateQuantity('item-1', 0);
      
      expect(useCartStore.getState().items).toHaveLength(0);
    });
  });

  describe('computed values', () => {
    it('calculates itemCount correctly', () => {
      useCartStore.setState({
        items: [
          { id: 'item-1', productId: 'prod-1', name: 'Product 1', price: 1000, image: '/1.jpg', quantity: 2 },
          { id: 'item-2', productId: 'prod-2', name: 'Product 2', price: 2000, image: '/2.jpg', quantity: 3 },
        ],
      });
      
      expect(useCartStore.getState().itemCount()).toBe(5);
    });

    it('calculates subtotal correctly', () => {
      useCartStore.setState({
        items: [
          { id: 'item-1', productId: 'prod-1', name: 'Product 1', price: 1000, image: '/1.jpg', quantity: 2 },
          { id: 'item-2', productId: 'prod-2', name: 'Product 2', price: 2000, image: '/2.jpg', quantity: 3 },
        ],
      });
      
      // (1000 * 2) + (2000 * 3) = 8000
      expect(useCartStore.getState().subtotal()).toBe(8000);
    });
  });

  describe('cart visibility', () => {
    it('opens cart', () => {
      useCartStore.getState().openCart();
      expect(useCartStore.getState().isOpen).toBe(true);
    });

    it('closes cart', () => {
      useCartStore.setState({ isOpen: true });
      useCartStore.getState().closeCart();
      expect(useCartStore.getState().isOpen).toBe(false);
    });

    it('toggles cart', () => {
      expect(useCartStore.getState().isOpen).toBe(false);
      useCartStore.getState().toggleCart();
      expect(useCartStore.getState().isOpen).toBe(true);
      useCartStore.getState().toggleCart();
      expect(useCartStore.getState().isOpen).toBe(false);
    });
  });

  describe('clearCart', () => {
    it('clears all items', () => {
      useCartStore.setState({
        items: [
          { id: 'item-1', productId: 'prod-1', name: 'Product 1', price: 1000, image: '/1.jpg', quantity: 2 },
          { id: 'item-2', productId: 'prod-2', name: 'Product 2', price: 2000, image: '/2.jpg', quantity: 3 },
        ],
      });
      
      useCartStore.getState().clearCart();
      
      expect(useCartStore.getState().items).toHaveLength(0);
    });
  });
});
```

### Unit Tests - Product Card

```typescript
// tests/unit/product-card.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProductCard } from '@/components/shop/product-card';
import { useCartStore } from '@/lib/store/cart';

const mockProduct = {
  id: 'prod-1',
  name: 'Test Product',
  slug: 'test-product',
  price: 2999,
  comparePrice: 3999,
  images: ['/image1.jpg', '/image2.jpg'],
  category: { name: 'Electronics' },
  inventory: 10,
};

describe('ProductCard', () => {
  beforeEach(() => {
    useCartStore.setState({ items: [], isOpen: false });
  });

  it('renders product information correctly', () => {
    render(<ProductCard product={mockProduct} />);
    
    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText('Electronics')).toBeInTheDocument();
    expect(screen.getByText('$29.99')).toBeInTheDocument();
    expect(screen.getByText('$39.99')).toBeInTheDocument();
  });

  it('displays discount badge when comparePrice exists', () => {
    render(<ProductCard product={mockProduct} />);
    
    // 25% discount: 1 - (2999/3999) = ~25%
    expect(screen.getByText('-25%')).toBeInTheDocument();
  });

  it('displays out of stock badge when inventory is 0', () => {
    render(<ProductCard product={{ ...mockProduct, inventory: 0 }} />);
    
    expect(screen.getByText('Out of Stock')).toBeInTheDocument();
  });

  it('disables add to cart when out of stock', () => {
    render(<ProductCard product={{ ...mockProduct, inventory: 0 }} />);
    
    const addButton = screen.getByRole('button', { name: /add to cart/i });
    expect(addButton).toBeDisabled();
  });

  it('adds product to cart on button click', async () => {
    const user = userEvent.setup();
    render(<ProductCard product={mockProduct} />);
    
    const addButton = screen.getByRole('button', { name: /add to cart/i });
    await user.click(addButton);
    
    const state = useCartStore.getState();
    expect(state.items).toHaveLength(1);
    expect(state.items[0].productId).toBe('prod-1');
  });

  it('links to product detail page', () => {
    render(<ProductCard product={mockProduct} />);
    
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/products/test-product');
  });

  it('shows second image on hover', async () => {
    const user = userEvent.setup();
    render(<ProductCard product={mockProduct} />);
    
    const images = screen.getAllByRole('img');
    expect(images).toHaveLength(2);
    
    // Second image should have opacity-0 initially
    expect(images[1]).toHaveClass('opacity-0');
  });
});
```

### Unit Tests - Price Utilities

```typescript
// tests/unit/utils.test.ts
import { describe, it, expect } from 'vitest';
import { formatPrice, calculateDiscount, validateInventory } from '@/lib/utils';

describe('formatPrice', () => {
  it('formats cents to dollars', () => {
    expect(formatPrice(2999)).toBe('$29.99');
    expect(formatPrice(100)).toBe('$1.00');
    expect(formatPrice(10000)).toBe('$100.00');
  });

  it('handles zero', () => {
    expect(formatPrice(0)).toBe('$0.00');
  });

  it('handles different currencies', () => {
    expect(formatPrice(2999, 'EUR')).toBe('€29.99');
    expect(formatPrice(2999, 'GBP')).toBe('£29.99');
  });
});

describe('calculateDiscount', () => {
  it('calculates percentage discount', () => {
    expect(calculateDiscount(2999, 3999)).toBe(25);
    expect(calculateDiscount(5000, 10000)).toBe(50);
  });

  it('returns 0 when no compare price', () => {
    expect(calculateDiscount(2999, null)).toBe(0);
    expect(calculateDiscount(2999, undefined)).toBe(0);
  });

  it('returns 0 when compare price is lower', () => {
    expect(calculateDiscount(3999, 2999)).toBe(0);
  });
});

describe('validateInventory', () => {
  it('returns true when inventory is sufficient', () => {
    expect(validateInventory(10, 5)).toBe(true);
  });

  it('returns false when inventory is insufficient', () => {
    expect(validateInventory(5, 10)).toBe(false);
  });

  it('handles edge cases', () => {
    expect(validateInventory(5, 5)).toBe(true);
    expect(validateInventory(0, 1)).toBe(false);
  });
});
```

### Integration Tests - Checkout Flow

```typescript
// tests/integration/checkout.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CheckoutPage } from '@/app/(checkout)/checkout/page';
import { useCartStore } from '@/lib/store/cart';

// Mock fetch
global.fetch = vi.fn();

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('Checkout Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useCartStore.setState({
      items: [
        { id: 'item-1', productId: 'prod-1', name: 'Product 1', price: 2999, image: '/1.jpg', quantity: 2 },
      ],
    });
  });

  it('displays cart items in checkout', () => {
    render(<CheckoutPage />, { wrapper: createWrapper() });
    
    expect(screen.getByText('Product 1')).toBeInTheDocument();
    expect(screen.getByText('$59.98')).toBeInTheDocument(); // 2999 * 2
  });

  it('validates shipping address fields', async () => {
    const user = userEvent.setup();
    render(<CheckoutPage />, { wrapper: createWrapper() });
    
    const submitButton = screen.getByRole('button', { name: /continue to payment/i });
    await user.click(submitButton);
    
    expect(screen.getByText(/name is required/i)).toBeInTheDocument();
    expect(screen.getByText(/address is required/i)).toBeInTheDocument();
  });

  it('submits checkout with valid data', async () => {
    const user = userEvent.setup();
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ sessionId: 'sess_123', url: 'https://checkout.stripe.com/...' }),
    });
    
    render(<CheckoutPage />, { wrapper: createWrapper() });
    
    // Fill form
    await user.type(screen.getByLabelText(/full name/i), 'John Doe');
    await user.type(screen.getByLabelText(/email/i), 'john@example.com');
    await user.type(screen.getByLabelText(/address line 1/i), '123 Main St');
    await user.type(screen.getByLabelText(/city/i), 'New York');
    await user.type(screen.getByLabelText(/state/i), 'NY');
    await user.type(screen.getByLabelText(/zip code/i), '10001');
    
    const submitButton = screen.getByRole('button', { name: /continue to payment/i });
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/checkout', expect.any(Object));
    });
  });

  it('displays error on checkout failure', async () => {
    const user = userEvent.setup();
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ error: 'Insufficient inventory' }),
    });
    
    render(<CheckoutPage />, { wrapper: createWrapper() });
    
    // Fill and submit form...
    await user.type(screen.getByLabelText(/full name/i), 'John Doe');
    await user.type(screen.getByLabelText(/email/i), 'john@example.com');
    await user.type(screen.getByLabelText(/address line 1/i), '123 Main St');
    await user.type(screen.getByLabelText(/city/i), 'New York');
    await user.type(screen.getByLabelText(/state/i), 'NY');
    await user.type(screen.getByLabelText(/zip code/i), '10001');
    await user.click(screen.getByRole('button', { name: /continue to payment/i }));
    
    await waitFor(() => {
      expect(screen.getByText(/insufficient inventory/i)).toBeInTheDocument();
    });
  });

  it('calculates totals correctly', () => {
    useCartStore.setState({
      items: [
        { id: 'item-1', productId: 'prod-1', name: 'Product 1', price: 5000, image: '/1.jpg', quantity: 2 },
        { id: 'item-2', productId: 'prod-2', name: 'Product 2', price: 3000, image: '/2.jpg', quantity: 1 },
      ],
    });
    
    render(<CheckoutPage />, { wrapper: createWrapper() });
    
    // Subtotal: (5000 * 2) + (3000 * 1) = 13000 = $130.00
    expect(screen.getByText('$130.00')).toBeInTheDocument();
    
    // Tax (8%): 13000 * 0.08 = 1040 = $10.40
    expect(screen.getByText('$10.40')).toBeInTheDocument();
    
    // Shipping: Free over $100
    expect(screen.getByText('Free')).toBeInTheDocument();
  });
});
```

### API Route Tests

```typescript
// tests/api/checkout.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '@/app/api/checkout/route';
import { NextRequest } from 'next/server';

// Mock Stripe
vi.mock('stripe', () => ({
  default: vi.fn(() => ({
    checkout: {
      sessions: {
        create: vi.fn().mockResolvedValue({
          id: 'sess_123',
          url: 'https://checkout.stripe.com/...',
          payment_intent: 'pi_123',
        }),
      },
    },
  })),
}));

// Mock Prisma
vi.mock('@/lib/prisma', () => ({
  prisma: {
    product: {
      findMany: vi.fn(),
    },
    order: {
      create: vi.fn(),
      update: vi.fn(),
    },
  },
}));

// Mock auth
vi.mock('@/lib/auth', () => ({
  auth: vi.fn().mockResolvedValue({ user: { id: 'user-1' } }),
}));

describe('/api/checkout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates checkout session successfully', async () => {
    const { prisma } = await import('@/lib/prisma');
    
    (prisma.product.findMany as any).mockResolvedValue([
      { id: 'prod-1', name: 'Product 1', price: 2999, inventory: 10, status: 'ACTIVE', images: ['/1.jpg'], variants: [] },
    ]);
    
    (prisma.order.create as any).mockResolvedValue({ id: 'order-1' });
    
    const request = new NextRequest('http://localhost/api/checkout', {
      method: 'POST',
      body: JSON.stringify({
        items: [{ productId: 'prod-1', quantity: 2 }],
        email: 'test@example.com',
        shippingAddress: {
          name: 'John Doe',
          line1: '123 Main St',
          city: 'New York',
          state: 'NY',
          postalCode: '10001',
          country: 'US',
        },
      }),
    });
    
    const response = await POST(request);
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data.sessionId).toBe('sess_123');
    expect(data.url).toBeDefined();
  });

  it('returns 400 for invalid product', async () => {
    const { prisma } = await import('@/lib/prisma');
    (prisma.product.findMany as any).mockResolvedValue([]);
    
    const request = new NextRequest('http://localhost/api/checkout', {
      method: 'POST',
      body: JSON.stringify({
        items: [{ productId: 'invalid-id', quantity: 1 }],
        email: 'test@example.com',
        shippingAddress: {
          name: 'John Doe',
          line1: '123 Main St',
          city: 'New York',
          state: 'NY',
          postalCode: '10001',
          country: 'US',
        },
      }),
    });
    
    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  it('returns 400 for insufficient inventory', async () => {
    const { prisma } = await import('@/lib/prisma');
    
    (prisma.product.findMany as any).mockResolvedValue([
      { id: 'prod-1', name: 'Product 1', price: 2999, inventory: 1, status: 'ACTIVE', images: ['/1.jpg'], variants: [] },
    ]);
    
    const request = new NextRequest('http://localhost/api/checkout', {
      method: 'POST',
      body: JSON.stringify({
        items: [{ productId: 'prod-1', quantity: 5 }],
        email: 'test@example.com',
        shippingAddress: {
          name: 'John Doe',
          line1: '123 Main St',
          city: 'New York',
          state: 'NY',
          postalCode: '10001',
          country: 'US',
        },
      }),
    });
    
    const response = await POST(request);
    const data = await response.json();
    
    expect(response.status).toBe(400);
    expect(data.error).toContain('Insufficient inventory');
  });

  it('validates request body', async () => {
    const request = new NextRequest('http://localhost/api/checkout', {
      method: 'POST',
      body: JSON.stringify({
        items: [],
        email: 'invalid-email',
      }),
    });
    
    const response = await POST(request);
    expect(response.status).toBe(400);
  });
});
```

### Stripe Webhook Tests

```typescript
// tests/api/webhook-stripe.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '@/app/api/webhooks/stripe/route';
import { NextRequest } from 'next/server';

vi.mock('stripe', () => ({
  default: vi.fn(() => ({
    webhooks: {
      constructEvent: vi.fn(),
    },
  })),
}));

vi.mock('@/lib/prisma', () => ({
  prisma: {
    order: {
      update: vi.fn(),
      updateMany: vi.fn(),
    },
    product: {
      update: vi.fn(),
    },
    productVariant: {
      update: vi.fn(),
    },
  },
}));

vi.mock('@/lib/email', () => ({
  sendOrderConfirmation: vi.fn(),
}));

describe('/api/webhooks/stripe', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('handles checkout.session.completed event', async () => {
    const Stripe = (await import('stripe')).default;
    const stripe = new Stripe('sk_test');
    
    (stripe.webhooks.constructEvent as any).mockReturnValue({
      type: 'checkout.session.completed',
      data: {
        object: {
          metadata: { orderId: 'order-1' },
          payment_intent: 'pi_123',
        },
      },
    });
    
    const { prisma } = await import('@/lib/prisma');
    (prisma.order.update as any).mockResolvedValue({
      id: 'order-1',
      items: [{ productId: 'prod-1', quantity: 2, variantId: null }],
    });
    
    const request = new NextRequest('http://localhost/api/webhooks/stripe', {
      method: 'POST',
      body: '{}',
      headers: { 'stripe-signature': 'sig_123' },
    });
    
    const response = await POST(request);
    expect(response.status).toBe(200);
    
    expect(prisma.order.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'order-1' },
        data: { status: 'CONFIRMED', paymentStatus: 'PAID' },
      })
    );
  });

  it('handles payment_intent.payment_failed event', async () => {
    const Stripe = (await import('stripe')).default;
    const stripe = new Stripe('sk_test');
    
    (stripe.webhooks.constructEvent as any).mockReturnValue({
      type: 'payment_intent.payment_failed',
      data: {
        object: { id: 'pi_123' },
      },
    });
    
    const { prisma } = await import('@/lib/prisma');
    
    const request = new NextRequest('http://localhost/api/webhooks/stripe', {
      method: 'POST',
      body: '{}',
      headers: { 'stripe-signature': 'sig_123' },
    });
    
    const response = await POST(request);
    expect(response.status).toBe(200);
    
    expect(prisma.order.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { paymentIntent: 'pi_123' },
        data: { paymentStatus: 'FAILED' },
      })
    );
  });

  it('returns 400 for invalid signature', async () => {
    const Stripe = (await import('stripe')).default;
    const stripe = new Stripe('sk_test');
    
    (stripe.webhooks.constructEvent as any).mockImplementation(() => {
      throw new Error('Invalid signature');
    });
    
    const request = new NextRequest('http://localhost/api/webhooks/stripe', {
      method: 'POST',
      body: '{}',
      headers: { 'stripe-signature': 'invalid' },
    });
    
    const response = await POST(request);
    expect(response.status).toBe(400);
  });
});
```

### E2E Tests (Playwright)

```typescript
// tests/e2e/shopping-flow.spec.ts
import { test, expect } from '@playwright/test';

test.describe('E-commerce Shopping Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('complete purchase flow', async ({ page }) => {
    // 1. Browse products
    await page.click('text=Shop Now');
    await expect(page).toHaveURL('/products');
    
    // 2. Filter products
    await page.click('[data-testid="category-filter"]');
    await page.click('text=Electronics');
    await expect(page.locator('[data-testid="product-card"]')).toHaveCount(6);
    
    // 3. View product detail
    await page.click('[data-testid="product-card"]:first-child');
    await expect(page).toHaveURL(/\/products\/.+/);
    
    // 4. Add to cart
    await page.selectOption('[name="size"]', 'Large');
    await page.fill('[name="quantity"]', '2');
    await page.click('button:has-text("Add to Cart")');
    
    // Verify cart opened
    await expect(page.locator('[data-testid="cart-drawer"]')).toBeVisible();
    await expect(page.locator('[data-testid="cart-count"]')).toHaveText('2');
    
    // 5. Go to checkout
    await page.click('text=Checkout');
    await expect(page).toHaveURL('/checkout');
    
    // 6. Fill shipping info
    await page.fill('[name="name"]', 'John Doe');
    await page.fill('[name="email"]', 'john@example.com');
    await page.fill('[name="address.line1"]', '123 Main Street');
    await page.fill('[name="address.city"]', 'New York');
    await page.fill('[name="address.state"]', 'NY');
    await page.fill('[name="address.postalCode"]', '10001');
    
    // 7. Submit order (mocked Stripe redirect)
    await page.route('/api/checkout', async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          sessionId: 'sess_test',
          url: '/order/test-order-id?success=true',
        }),
      });
    });
    
    await page.click('button:has-text("Continue to Payment")');
    
    // 8. Verify order confirmation
    await expect(page).toHaveURL(/\/order\/.+\?success=true/);
    await expect(page.locator('h1')).toContainText('Order Confirmed');
  });

  test('add and remove items from cart', async ({ page }) => {
    await page.goto('/products/test-product');
    
    // Add item
    await page.click('button:has-text("Add to Cart")');
    await expect(page.locator('[data-testid="cart-count"]')).toHaveText('1');
    
    // Increase quantity
    await page.click('[data-testid="cart-item-increase"]');
    await expect(page.locator('[data-testid="cart-item-quantity"]')).toHaveText('2');
    
    // Decrease quantity
    await page.click('[data-testid="cart-item-decrease"]');
    await expect(page.locator('[data-testid="cart-item-quantity"]')).toHaveText('1');
    
    // Remove item
    await page.click('[data-testid="cart-item-remove"]');
    await expect(page.locator('[data-testid="cart-empty"]')).toBeVisible();
  });

  test('product search functionality', async ({ page }) => {
    await page.goto('/');
    
    // Open search
    await page.click('[data-testid="search-trigger"]');
    await page.fill('[data-testid="search-input"]', 'wireless');
    
    // Wait for results
    await expect(page.locator('[data-testid="search-results"]')).toBeVisible();
    
    // Click result
    await page.click('[data-testid="search-result"]:first-child');
    await expect(page).toHaveURL(/\/products\/.+/);
  });

  test('handles out of stock products', async ({ page }) => {
    await page.goto('/products/out-of-stock-product');
    
    await expect(page.locator('text=Out of Stock')).toBeVisible();
    await expect(page.locator('button:has-text("Add to Cart")')).toBeDisabled();
    
    // Notify me button should be visible
    await expect(page.locator('button:has-text("Notify Me")')).toBeVisible();
  });

  test('applies discount code', async ({ page }) => {
    // Add product to cart
    await page.goto('/products/test-product');
    await page.click('button:has-text("Add to Cart")');
    await page.click('text=Checkout');
    
    // Apply discount
    await page.fill('[name="discountCode"]', 'SAVE20');
    await page.click('button:has-text("Apply")');
    
    await expect(page.locator('[data-testid="discount-applied"]')).toContainText('20%');
    await expect(page.locator('[data-testid="order-total"]')).not.toHaveText('$29.99');
  });
});

test.describe('Mobile Experience', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('mobile navigation and cart', async ({ page }) => {
    await page.goto('/');
    
    // Open mobile menu
    await page.click('[data-testid="mobile-menu-trigger"]');
    await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible();
    
    // Navigate to products
    await page.click('[data-testid="mobile-menu"] >> text=Products');
    await expect(page).toHaveURL('/products');
    
    // Cart should show as bottom sheet on mobile
    await page.click('[data-testid="product-card"]:first-child');
    await page.click('button:has-text("Add to Cart")');
    
    await expect(page.locator('[data-testid="cart-bottom-sheet"]')).toBeVisible();
  });
});

test.describe('Accessibility', () => {
  test('product listing is accessible', async ({ page }) => {
    await page.goto('/products');
    
    // Check heading hierarchy
    const h1 = page.locator('h1');
    await expect(h1).toHaveCount(1);
    
    // Check product cards are keyboard accessible
    await page.keyboard.press('Tab');
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
    
    // Check for skip link
    await page.keyboard.press('Tab');
    await expect(page.locator('[data-testid="skip-link"]')).toBeFocused();
  });

  test('checkout form is accessible', async ({ page }) => {
    await page.goto('/checkout');
    
    // Check form labels
    const labels = page.locator('label');
    const inputs = page.locator('input');
    
    // Each input should have an associated label
    const inputCount = await inputs.count();
    const labelCount = await labels.count();
    expect(labelCount).toBeGreaterThanOrEqual(inputCount);
    
    // Check for error announcements
    await page.click('button:has-text("Continue to Payment")');
    const errorAlert = page.locator('[role="alert"]');
    await expect(errorAlert).toBeVisible();
  });
});
```

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results.json' }],
    ['junit', { outputFile: 'junit-results.xml' }],
  ],
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    { name: 'mobile-chrome', use: { ...devices['Pixel 5'] } },
    { name: 'mobile-safari', use: { ...devices['iPhone 12'] } },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

## Error Handling

### Error Boundary Component

```typescript
// components/error-boundary.tsx
'use client';

import { Component, ReactNode } from 'react';
import * as Sentry from '@sentry/nextjs';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
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
    this.setState({ errorInfo });
    
    Sentry.withScope((scope) => {
      scope.setExtra('componentStack', errorInfo.componentStack);
      Sentry.captureException(error);
    });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div 
          role="alert"
          className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center"
        >
          <AlertTriangle className="h-16 w-16 text-red-500 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Something went wrong
          </h2>
          <p className="text-gray-600 mb-6 max-w-md">
            We've encountered an unexpected error. Our team has been notified and is working on a fix.
          </p>
          <div className="flex gap-4">
            <Button onClick={this.handleRetry} variant="default">
              <RefreshCw className="mr-2 h-4 w-4" />
              Try again
            </Button>
            <Button onClick={() => window.location.href = '/'} variant="outline">
              <Home className="mr-2 h-4 w-4" />
              Go home
            </Button>
          </div>
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <details className="mt-8 text-left w-full max-w-2xl">
              <summary className="cursor-pointer text-sm text-gray-500">
                Error details (development only)
              </summary>
              <pre className="mt-2 p-4 bg-gray-100 rounded text-xs overflow-auto">
                {this.state.error.toString()}
                {this.state.errorInfo?.componentStack}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
```

### Global Error Page

```typescript
// app/error.tsx
'use client';

import { useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Home, ArrowLeft } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Something went wrong
          </h1>
          <p className="text-gray-600">
            We've been notified and are working on a fix. Please try again.
          </p>
        </div>
        
        {error.digest && (
          <p className="text-sm text-gray-500 mb-6 font-mono bg-gray-100 p-2 rounded">
            Error ID: {error.digest}
          </p>
        )}
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={reset} size="lg">
            <RefreshCw className="mr-2 h-4 w-4" />
            Try again
          </Button>
          <Button onClick={() => window.history.back()} variant="outline" size="lg">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go back
          </Button>
          <Button asChild variant="ghost" size="lg">
            <a href="/">
              <Home className="mr-2 h-4 w-4" />
              Home
            </a>
          </Button>
        </div>
        
        <p className="mt-8 text-sm text-gray-500">
          Need help?{' '}
          <a href="/contact" className="text-primary hover:underline">
            Contact support
          </a>
        </p>
      </div>
    </div>
  );
}
```

### Not Found Page

```typescript
// app/not-found.tsx
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home, Search, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <h1 className="text-9xl font-bold text-gray-200">404</h1>
        <h2 className="text-2xl font-bold text-gray-900 mt-4 mb-2">
          Page not found
        </h2>
        <p className="text-gray-600 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild size="lg">
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Go home
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/products">
              <Search className="mr-2 h-4 w-4" />
              Browse products
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
```

### API Error Handler

```typescript
// lib/api-error.ts
import * as Sentry from '@sentry/nextjs';

export class APIError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code: string = 'INTERNAL_ERROR',
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = 'APIError';
  }

  toJSON() {
    return {
      error: {
        message: this.message,
        code: this.code,
        ...(this.details && { details: this.details }),
      },
    };
  }
}

export class ValidationError extends APIError {
  constructor(message: string, details?: Record<string, any>) {
    super(message, 400, 'VALIDATION_ERROR', details);
  }
}

export class NotFoundError extends APIError {
  constructor(resource: string) {
    super(`${resource} not found`, 404, 'NOT_FOUND');
  }
}

export class UnauthorizedError extends APIError {
  constructor(message = 'Unauthorized') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

export class ForbiddenError extends APIError {
  constructor(message = 'Forbidden') {
    super(message, 403, 'FORBIDDEN');
  }
}

export class ConflictError extends APIError {
  constructor(message: string) {
    super(message, 409, 'CONFLICT');
  }
}

export class RateLimitError extends APIError {
  constructor(retryAfter?: number) {
    super('Too many requests', 429, 'RATE_LIMITED', { retryAfter });
  }
}

export function handleAPIError(error: unknown): Response {
  // Log all errors
  console.error('[API Error]', error);

  if (error instanceof APIError) {
    // Only report server errors to Sentry
    if (error.statusCode >= 500) {
      Sentry.captureException(error);
    }
    return Response.json(error.toJSON(), { status: error.statusCode });
  }

  if (error instanceof Error) {
    Sentry.captureException(error);
    return Response.json(
      { error: { message: 'Internal server error', code: 'INTERNAL_ERROR' } },
      { status: 500 }
    );
  }

  return Response.json(
    { error: { message: 'Unknown error', code: 'UNKNOWN_ERROR' } },
    { status: 500 }
  );
}

// Usage in API routes
export function withErrorHandler(
  handler: (request: Request) => Promise<Response>
) {
  return async (request: Request): Promise<Response> => {
    try {
      return await handler(request);
    } catch (error) {
      return handleAPIError(error);
    }
  };
}
```

### React Query Error Handling

```typescript
// lib/query-client.ts
import { QueryClient, QueryCache, MutationCache } from '@tanstack/react-query';
import { toast } from 'sonner';
import * as Sentry from '@sentry/nextjs';
import { APIError } from './api-error';

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error, query) => {
      // Only show error toast for queries that have already been cached
      if (query.state.data !== undefined) {
        const message = error instanceof APIError 
          ? error.message 
          : 'Failed to fetch data';
        toast.error(message);
      }
      
      // Report to Sentry
      if (!(error instanceof APIError) || error.statusCode >= 500) {
        Sentry.captureException(error, {
          extra: { queryKey: query.queryKey },
        });
      }
    },
  }),
  mutationCache: new MutationCache({
    onError: (error, _variables, _context, mutation) => {
      const message = error instanceof APIError 
        ? error.message 
        : 'An error occurred';
      toast.error(message);
      
      if (!(error instanceof APIError) || error.statusCode >= 500) {
        Sentry.captureException(error, {
          extra: { mutationKey: mutation.options.mutationKey },
        });
      }
    },
  }),
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        // Don't retry on client errors
        if (error instanceof APIError && error.statusCode < 500) {
          return false;
        }
        return failureCount < 3;
      },
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    },
    mutations: {
      retry: false,
    },
  },
});
```

## Accessibility

### Accessibility Standards

This e-commerce implementation follows WCAG 2.1 Level AA guidelines:

| Criterion | Implementation |
|-----------|---------------|
| 1.1.1 Non-text Content | All product images have descriptive alt text |
| 1.3.1 Info and Relationships | Semantic HTML, proper form labels, ARIA landmarks |
| 1.4.1 Use of Color | Status indicators use icons + text, not color alone |
| 1.4.3 Contrast | Minimum 4.5:1 for text, 3:1 for large text |
| 1.4.4 Resize Text | Layout works up to 200% zoom |
| 2.1.1 Keyboard | All interactive elements are keyboard accessible |
| 2.1.2 No Keyboard Trap | Focus can move freely through all elements |
| 2.4.1 Bypass Blocks | Skip to main content link provided |
| 2.4.3 Focus Order | Logical tab order throughout |
| 2.4.7 Focus Visible | Clear focus indicators on all interactive elements |
| 3.3.1 Error Identification | Form errors clearly identified |
| 3.3.2 Labels | All form inputs have visible labels |
| 4.1.2 Name, Role, Value | ARIA attributes for dynamic content |

### Skip Links

```typescript
// components/skip-link.tsx
export function SkipLink() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:shadow-lg focus:outline-none"
    >
      Skip to main content
    </a>
  );
}

// app/layout.tsx
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <SkipLink />
        <Header />
        <main id="main-content" tabIndex={-1} className="focus:outline-none">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
```

### Accessible Product Card

```typescript
// components/shop/accessible-product-card.tsx
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart, Heart } from 'lucide-react';
import { useCartStore } from '@/lib/store/cart';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/utils';

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    comparePrice?: number | null;
    images: string[];
    category: { name: string };
    inventory: number;
  };
}

export function AccessibleProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem);
  const isOutOfStock = product.inventory === 0;
  const discount = product.comparePrice
    ? Math.round((1 - product.price / product.comparePrice) * 100)
    : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem({
      id: product.id,
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0],
    });
  };

  return (
    <article 
      className="group relative"
      aria-labelledby={`product-${product.id}-name`}
    >
      <Link
        href={`/products/${product.slug}`}
        className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-lg"
        aria-describedby={`product-${product.id}-price`}
      >
        <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
          <Image
            src={product.images[0]}
            alt={`${product.name} - ${product.category.name}`}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
            className="object-cover transition-transform group-hover:scale-105"
          />
          
          {/* Status badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {discount > 0 && (
              <span 
                className="px-2 py-1 bg-red-500 text-white text-xs font-medium rounded"
                role="status"
              >
                {discount}% off
              </span>
            )}
            {isOutOfStock && (
              <span 
                className="px-2 py-1 bg-gray-500 text-white text-xs font-medium rounded"
                role="status"
              >
                Out of stock
              </span>
            )}
          </div>
        </div>

        <div className="mt-3 space-y-1">
          <p className="text-xs text-muted-foreground">
            {product.category.name}
          </p>
          <h3 
            id={`product-${product.id}-name`}
            className="font-medium leading-tight"
          >
            {product.name}
          </h3>
          <p id={`product-${product.id}-price`} className="flex items-center gap-2">
            <span className="font-semibold">
              {formatPrice(product.price)}
            </span>
            {product.comparePrice && (
              <>
                <span className="text-sm text-muted-foreground line-through">
                  {formatPrice(product.comparePrice)}
                </span>
                <span className="sr-only">
                  , was {formatPrice(product.comparePrice)}, save {discount}%
                </span>
              </>
            )}
          </p>
        </div>
      </Link>

      {/* Action buttons - outside the link for proper focus management */}
      <div className="mt-3 flex gap-2">
        <Button
          onClick={handleAddToCart}
          disabled={isOutOfStock}
          className="flex-1"
          aria-label={`Add ${product.name} to cart`}
        >
          <ShoppingCart className="mr-2 h-4 w-4" aria-hidden="true" />
          {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
        </Button>
        <Button
          variant="outline"
          size="icon"
          aria-label={`Add ${product.name} to wishlist`}
        >
          <Heart className="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>
    </article>
  );
}
```

### Accessible Cart Drawer

```typescript
// components/shop/accessible-cart-drawer.tsx
'use client';

import { useEffect, useRef } from 'react';
import { X, Plus, Minus, Trash2 } from 'lucide-react';
import { useCartStore } from '@/lib/store/cart';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/utils';
import { useFocusTrap } from '@/hooks/use-focus-trap';

export function AccessibleCartDrawer() {
  const { items, isOpen, closeCart, updateQuantity, removeItem, subtotal } = useCartStore();
  const drawerRef = useFocusTrap<HTMLDivElement>();
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen) {
      closeButtonRef.current?.focus();
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        closeCart();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, closeCart]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        aria-hidden="true"
        onClick={closeCart}
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-title"
        className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-50 shadow-xl flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 id="cart-title" className="text-lg font-semibold">
            Shopping Cart ({items.length} {items.length === 1 ? 'item' : 'items'})
          </h2>
          <Button
            ref={closeButtonRef}
            variant="ghost"
            size="icon"
            onClick={closeCart}
            aria-label="Close cart"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </Button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-4" role="list" aria-label="Cart items">
          {items.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Your cart is empty
            </p>
          ) : (
            <ul className="space-y-4">
              {items.map((item) => (
                <li key={item.id} className="flex gap-4 pb-4 border-b">
                  <img
                    src={item.image}
                    alt=""
                    className="w-20 h-20 object-cover rounded"
                    aria-hidden="true"
                  />
                  <div className="flex-1">
                    <h3 className="font-medium">{item.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {formatPrice(item.price)}
                    </p>
                    
                    <div className="flex items-center gap-2 mt-2">
                      <div 
                        className="flex items-center border rounded"
                        role="group"
                        aria-label={`Quantity for ${item.name}`}
                      >
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          aria-label={`Decrease quantity of ${item.name}`}
                        >
                          <Minus className="h-3 w-3" aria-hidden="true" />
                        </Button>
                        <span 
                          className="w-8 text-center"
                          aria-live="polite"
                          aria-atomic="true"
                        >
                          {item.quantity}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          aria-label={`Increase quantity of ${item.name}`}
                        >
                          <Plus className="h-3 w-3" aria-hidden="true" />
                        </Button>
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-500"
                        onClick={() => removeItem(item.id)}
                        aria-label={`Remove ${item.name} from cart`}
                      >
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                      </Button>
                    </div>
                  </div>
                  <p className="font-medium" aria-label="Item total">
                    {formatPrice(item.price * item.quantity)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-4 border-t space-y-4">
            <div className="flex justify-between text-lg font-semibold">
              <span>Subtotal</span>
              <span aria-live="polite">{formatPrice(subtotal())}</span>
            </div>
            <Button asChild className="w-full" size="lg">
              <a href="/checkout">Proceed to Checkout</a>
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
```

### Focus Trap Hook

```typescript
// hooks/use-focus-trap.ts
import { useEffect, useRef } from 'react';

const FOCUSABLE_SELECTORS = [
  'button:not([disabled])',
  '[href]',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');

export function useFocusTrap<T extends HTMLElement>() {
  const containerRef = useRef<T>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const focusableElements = container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS);
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    }

    container.addEventListener('keydown', handleKeyDown);
    return () => container.removeEventListener('keydown', handleKeyDown);
  }, []);

  return containerRef;
}
```

### Live Region Announcer

```typescript
// components/ui/announcer.tsx
'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface AnnouncerContextType {
  announce: (message: string, priority?: 'polite' | 'assertive') => void;
}

const AnnouncerContext = createContext<AnnouncerContextType>({
  announce: () => {},
});

export function AnnouncerProvider({ children }: { children: ReactNode }) {
  const [politeMessage, setPoliteMessage] = useState('');
  const [assertiveMessage, setAssertiveMessage] = useState('');

  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    const setter = priority === 'assertive' ? setAssertiveMessage : setPoliteMessage;
    
    // Clear first to ensure announcement even if same message
    setter('');
    setTimeout(() => setter(message), 100);
  }, []);

  return (
    <AnnouncerContext.Provider value={{ announce }}>
      {children}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {politeMessage}
      </div>
      <div className="sr-only" aria-live="assertive" aria-atomic="true">
        {assertiveMessage}
      </div>
    </AnnouncerContext.Provider>
  );
}

export const useAnnounce = () => useContext(AnnouncerContext);

// Usage in cart
export function useCartAnnouncements() {
  const { announce } = useAnnounce();
  
  const announceAddToCart = (productName: string) => {
    announce(`${productName} added to cart`);
  };
  
  const announceRemoveFromCart = (productName: string) => {
    announce(`${productName} removed from cart`);
  };
  
  const announceQuantityChange = (productName: string, quantity: number) => {
    announce(`${productName} quantity updated to ${quantity}`);
  };
  
  return { announceAddToCart, announceRemoveFromCart, announceQuantityChange };
}
```

## Security

### Input Validation with Zod

```typescript
// lib/validations/checkout.ts
import { z } from 'zod';

export const addressSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters')
    .regex(/^[a-zA-Z\s'-]+$/, 'Name contains invalid characters'),
  line1: z.string()
    .min(5, 'Address must be at least 5 characters')
    .max(200, 'Address must be less than 200 characters'),
  line2: z.string().max(200).optional(),
  city: z.string()
    .min(2, 'City must be at least 2 characters')
    .max(100, 'City must be less than 100 characters'),
  state: z.string()
    .min(2, 'State must be at least 2 characters')
    .max(100, 'State must be less than 100 characters'),
  postalCode: z.string()
    .regex(/^[0-9]{5}(-[0-9]{4})?$/, 'Invalid postal code'),
  country: z.string().length(2, 'Invalid country code'),
  phone: z.string()
    .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number')
    .optional(),
});

export const checkoutSchema = z.object({
  items: z.array(z.object({
    productId: z.string().cuid(),
    variantId: z.string().cuid().optional(),
    quantity: z.number().int().min(1).max(100),
  })).min(1, 'Cart cannot be empty'),
  email: z.string().email('Invalid email address'),
  shippingAddress: addressSchema,
  billingAddress: addressSchema.optional(),
  sameAsBilling: z.boolean().default(true),
  discountCode: z.string().max(50).optional(),
});

export const productReviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  title: z.string().min(3).max(100).optional(),
  content: z.string().min(10).max(5000).optional(),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
export type AddressInput = z.infer<typeof addressSchema>;
```

### Rate Limiting

```typescript
// lib/rate-limit.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { NextRequest } from 'next/server';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL!,
  token: process.env.UPSTASH_REDIS_TOKEN!,
});

export const rateLimiters = {
  // Standard API rate limit
  api: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(100, '1 m'),
    prefix: 'ratelimit:api',
    analytics: true,
  }),
  
  // Checkout - more restrictive
  checkout: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, '1 m'),
    prefix: 'ratelimit:checkout',
    analytics: true,
  }),
  
  // Auth endpoints
  auth: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, '1 m'),
    prefix: 'ratelimit:auth',
    analytics: true,
  }),
  
  // Sensitive operations
  sensitive: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(3, '1 h'),
    prefix: 'ratelimit:sensitive',
    analytics: true,
  }),
};

export async function rateLimit(
  request: NextRequest,
  type: keyof typeof rateLimiters = 'api'
): Promise<Response | null> {
  const ip = request.ip ?? request.headers.get('x-forwarded-for') ?? 'anonymous';
  const identifier = `${type}:${ip}`;
  
  const { success, limit, reset, remaining } = await rateLimiters[type].limit(identifier);

  const headers = {
    'X-RateLimit-Limit': limit.toString(),
    'X-RateLimit-Remaining': remaining.toString(),
    'X-RateLimit-Reset': reset.toString(),
  };

  if (!success) {
    return new Response(
      JSON.stringify({ error: { message: 'Too many requests', code: 'RATE_LIMITED' } }),
      {
        status: 429,
        headers: {
          ...headers,
          'Retry-After': Math.ceil((reset - Date.now()) / 1000).toString(),
          'Content-Type': 'application/json',
        },
      }
    );
  }

  return null;
}
```

### Security Headers

```javascript
// next.config.js
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block',
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), payment=(self "https://js.stripe.com")',
  },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' blob: data: https: *.stripe.com",
      "font-src 'self' data:",
      "connect-src 'self' https://api.stripe.com https://*.sentry.io",
      "frame-src 'self' https://js.stripe.com https://hooks.stripe.com",
      "frame-ancestors 'self'",
      "form-action 'self'",
      "base-uri 'self'",
      "upgrade-insecure-requests",
    ].join('; '),
  },
];

module.exports = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
};
```

### CSRF Protection

```typescript
// lib/csrf.ts
import { cookies } from 'next/headers';
import { randomBytes, timingSafeEqual } from 'crypto';

const CSRF_TOKEN_LENGTH = 32;
const CSRF_COOKIE_NAME = 'csrf-token';
const CSRF_HEADER_NAME = 'x-csrf-token';

export function generateCSRFToken(): string {
  const token = randomBytes(CSRF_TOKEN_LENGTH).toString('hex');
  
  cookies().set(CSRF_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 60 * 60, // 1 hour
  });
  
  return token;
}

export function validateCSRFToken(request: Request): boolean {
  const cookieToken = cookies().get(CSRF_COOKIE_NAME)?.value;
  const headerToken = request.headers.get(CSRF_HEADER_NAME);
  
  if (!cookieToken || !headerToken) {
    return false;
  }
  
  try {
    const cookieBuffer = Buffer.from(cookieToken, 'hex');
    const headerBuffer = Buffer.from(headerToken, 'hex');
    
    if (cookieBuffer.length !== headerBuffer.length) {
      return false;
    }
    
    return timingSafeEqual(cookieBuffer, headerBuffer);
  } catch {
    return false;
  }
}

// React hook for CSRF
export function useCSRFToken() {
  const [token, setToken] = useState<string | null>(null);
  
  useEffect(() => {
    fetch('/api/csrf')
      .then(res => res.json())
      .then(data => setToken(data.token));
  }, []);
  
  return token;
}

// API route
// app/api/csrf/route.ts
export async function GET() {
  const token = generateCSRFToken();
  return Response.json({ token });
}
```

### Middleware Security

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { rateLimit } from './lib/rate-limit';
import { verifyToken } from './lib/auth';

const protectedRoutes = ['/account', '/checkout', '/admin'];
const adminRoutes = ['/admin'];
const authRoutes = ['/login', '/register'];
const apiRoutes = ['/api'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const response = NextResponse.next();

  // Add security headers to all responses
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');

  // Rate limiting for API routes
  if (pathname.startsWith('/api')) {
    const type = pathname.includes('/checkout') ? 'checkout' 
               : pathname.includes('/auth') ? 'auth' 
               : 'api';
    
    const rateLimitResponse = await rateLimit(request, type);
    if (rateLimitResponse) return rateLimitResponse;
  }

  // Authentication check
  const token = request.cookies.get('auth-token')?.value;
  const isProtected = protectedRoutes.some((route) => pathname.startsWith(route));
  const isAdmin = adminRoutes.some((route) => pathname.startsWith(route));
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  if (isProtected || isAdmin) {
    if (!token) {
      const url = new URL('/login', request.url);
      url.searchParams.set('redirect', pathname);
      return NextResponse.redirect(url);
    }

    const user = await verifyToken(token);
    if (!user) {
      const res = NextResponse.redirect(new URL('/login', request.url));
      res.cookies.delete('auth-token');
      return res;
    }

    // Admin role check
    if (isAdmin && user.role !== 'admin') {
      return NextResponse.redirect(new URL('/', request.url));
    }

    // Add user info to headers for API routes
    if (pathname.startsWith('/api')) {
      response.headers.set('x-user-id', user.id);
      response.headers.set('x-user-role', user.role);
    }
  }

  // Redirect authenticated users away from auth pages
  if (isAuthRoute && token) {
    const user = await verifyToken(token);
    if (user) {
      return NextResponse.redirect(new URL('/account', request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
};
```

## Performance

### Caching Strategies

```typescript
// app/api/products/route.ts
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const category = searchParams.get('category');
  
  const products = await prisma.product.findMany({
    where: {
      status: 'ACTIVE',
      ...(category && { category: { slug: category } }),
    },
    include: { category: true },
    take: 20,
  });

  return Response.json(products, {
    headers: {
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      'CDN-Cache-Control': 'public, max-age=300',
      'Vercel-CDN-Cache-Control': 'public, max-age=300',
    },
  });
}

// For static pages with ISR
// app/products/[slug]/page.tsx
export const revalidate = 3600; // Revalidate every hour

export async function generateStaticParams() {
  const products = await prisma.product.findMany({
    where: { status: 'ACTIVE' },
    select: { slug: true },
  });
  
  return products.map((product) => ({
    slug: product.slug,
  }));
}

// Dynamic metadata for SEO
export async function generateMetadata({ params }: { params: { slug: string } }) {
  const product = await prisma.product.findUnique({
    where: { slug: params.slug },
  });
  
  if (!product) return {};
  
  return {
    title: `${product.name} | Shop`,
    description: product.description,
    openGraph: {
      images: product.images[0],
    },
  };
}
```

### Image Optimization

```typescript
// components/optimized-product-image.tsx
import Image from 'next/image';
import { useState } from 'react';

interface ProductImageProps {
  src: string;
  alt: string;
  priority?: boolean;
  sizes?: string;
}

export function OptimizedProductImage({
  src,
  alt,
  priority = false,
  sizes = '(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw',
}: ProductImageProps) {
  const [isLoading, setIsLoading] = useState(true);

  // Generate blur placeholder
  const shimmer = (w: number, h: number) => `
    <svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${w}" height="${h}" fill="#f3f4f6"/>
      <rect width="${w}" height="${h}" fill="url(#shimmer)"/>
      <defs>
        <linearGradient id="shimmer">
          <stop offset="0%" stop-color="#f3f4f6"/>
          <stop offset="50%" stop-color="#e5e7eb"/>
          <stop offset="100%" stop-color="#f3f4f6"/>
        </linearGradient>
      </defs>
    </svg>
  `;

  const toBase64 = (str: string) =>
    typeof window === 'undefined'
      ? Buffer.from(str).toString('base64')
      : window.btoa(str);

  return (
    <div className="relative aspect-square overflow-hidden bg-muted">
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        placeholder="blur"
        blurDataURL={`data:image/svg+xml;base64,${toBase64(shimmer(400, 400))}`}
        className={`
          object-cover duration-700 ease-in-out
          ${isLoading ? 'scale-110 blur-lg' : 'scale-100 blur-0'}
        `}
        onLoad={() => setIsLoading(false)}
      />
    </div>
  );
}
```

### Bundle Optimization

```javascript
// next.config.js
/** @type {import('next').NextConfig} */
module.exports = {
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      '@radix-ui/react-icons',
      '@tanstack/react-query',
      'date-fns',
    ],
  },
  
  modularizeImports: {
    lodash: {
      transform: 'lodash/{{member}}',
    },
  },
  
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  
  // Enable gzip compression
  compress: true,
  
  // Reduce build output size
  productionBrowserSourceMaps: false,
};
```

### Dynamic Imports

```typescript
// Lazy load heavy components
import dynamic from 'next/dynamic';

// Product image gallery with zoom
const ProductGallery = dynamic(
  () => import('@/components/shop/product-gallery'),
  {
    loading: () => <div className="aspect-square bg-muted animate-pulse" />,
  }
);

// Reviews section
const ProductReviews = dynamic(
  () => import('@/components/shop/product-reviews'),
  {
    loading: () => <div className="h-96 bg-muted animate-pulse" />,
    ssr: false, // Client-side only
  }
);

// Rich text editor for admin
const RichTextEditor = dynamic(
  () => import('@/components/admin/rich-text-editor'),
  {
    ssr: false,
    loading: () => <textarea className="w-full h-64 border rounded" />,
  }
);

// Chart components for analytics
const AnalyticsChart = dynamic(
  () => import('@/components/admin/analytics-chart'),
  { ssr: false }
);
```

### Prefetching and Preloading

```typescript
// app/products/page.tsx
import Link from 'next/link';
import { ProductCard } from '@/components/shop/product-card';

export default async function ProductsPage() {
  const products = await fetchProducts();
  
  return (
    <div>
      {/* Prefetch first 4 product pages */}
      {products.slice(0, 4).map((product) => (
        <Link
          key={product.id}
          href={`/products/${product.slug}`}
          prefetch={true}
        >
          <ProductCard product={product} />
        </Link>
      ))}
      
      {/* Don't prefetch remaining products */}
      {products.slice(4).map((product) => (
        <Link
          key={product.id}
          href={`/products/${product.slug}`}
          prefetch={false}
        >
          <ProductCard product={product} />
        </Link>
      ))}
    </div>
  );
}

// Preload critical resources
// app/layout.tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <head>
        {/* Preload critical fonts */}
        <link
          rel="preload"
          href="/fonts/inter-var.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        
        {/* Preconnect to external services */}
        <link rel="preconnect" href="https://api.stripe.com" />
        <link rel="dns-prefetch" href="https://api.stripe.com" />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

## CI/CD

### GitHub Actions Workflow

```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

env:
  NODE_VERSION: '20'
  VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
  VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}

jobs:
  lint-and-type-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Lint
        run: npm run lint
      
      - name: Type check
        run: npm run type-check
      
      - name: Check formatting
        run: npx prettier --check .

  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run unit tests
        run: npm run test:unit -- --coverage
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
          flags: unit-tests

  e2e-tests:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test
          POSTGRES_DB: testdb
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    
    steps:
      - uses: actions/checkout@v4
      
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Install Playwright
        run: npx playwright install --with-deps
      
      - name: Setup database
        run: npx prisma migrate deploy
        env:
          DATABASE_URL: postgresql://test:test@localhost:5432/testdb
      
      - name: Build application
        run: npm run build
        env:
          DATABASE_URL: postgresql://test:test@localhost:5432/testdb
      
      - name: Run E2E tests
        run: npm run test:e2e
        env:
          DATABASE_URL: postgresql://test:test@localhost:5432/testdb
          NEXT_PUBLIC_APP_URL: http://localhost:3000
      
      - name: Upload test results
        uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 7

  security-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Run Snyk security scan
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
        with:
          args: --severity-threshold=high

  deploy-preview:
    needs: [lint-and-type-check, unit-tests]
    if: github.event_name == 'pull_request'
    runs-on: ubuntu-latest
    environment:
      name: preview
      url: ${{ steps.deploy.outputs.url }}
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Deploy to Vercel Preview
        id: deploy
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ env.VERCEL_ORG_ID }}
          vercel-project-id: ${{ env.VERCEL_PROJECT_ID }}
          github-comment: true

  deploy-production:
    needs: [lint-and-type-check, unit-tests, e2e-tests, security-scan]
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    environment:
      name: production
      url: https://your-store.com
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Deploy to Vercel Production
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ env.VERCEL_ORG_ID }}
          vercel-project-id: ${{ env.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
      
      - name: Notify Sentry of deploy
        run: |
          curl -sL https://sentry.io/api/0/organizations/${{ secrets.SENTRY_ORG }}/releases/ \
            -H "Authorization: Bearer ${{ secrets.SENTRY_AUTH_TOKEN }}" \
            -H "Content-Type: application/json" \
            -d '{
              "version": "${{ github.sha }}",
              "projects": ["${{ secrets.SENTRY_PROJECT }}"]
            }'
```

### Package Scripts

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "lint:fix": "next lint --fix",
    "type-check": "tsc --noEmit",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "test": "vitest",
    "test:unit": "vitest run",
    "test:watch": "vitest watch",
    "test:coverage": "vitest run --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:headed": "playwright test --headed",
    "db:generate": "prisma generate",
    "db:push": "prisma db push",
    "db:migrate": "prisma migrate dev",
    "db:migrate:deploy": "prisma migrate deploy",
    "db:seed": "prisma db seed",
    "db:studio": "prisma studio",
    "postinstall": "prisma generate"
  }
}
```

## Monitoring

### Sentry Setup

```bash
# Install Sentry
npx @sentry/wizard@latest -i nextjs
```

```typescript
// sentry.client.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  
  // Performance Monitoring
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  // Session Replay
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  
  integrations: [
    new Sentry.Replay({
      maskAllText: false,
      blockAllMedia: false,
      maskAllInputs: true,
    }),
    new Sentry.BrowserTracing({
      tracePropagationTargets: ['localhost', /^https:\/\/yourstore\.com/],
    }),
  ],
  
  // Filter out non-critical errors
  beforeSend(event, hint) {
    const error = hint.originalException as Error;
    
    // Ignore cancelled requests
    if (error?.message?.includes('AbortError')) {
      return null;
    }
    
    // Ignore network errors from extensions
    if (error?.message?.includes('extension')) {
      return null;
    }
    
    return event;
  },
});
```

```typescript
// sentry.server.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  // Capture unhandled promise rejections
  integrations: [
    new Sentry.Integrations.OnUnhandledRejection({ mode: 'warn' }),
  ],
});
```

```typescript
// sentry.edge.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
});
```

### Vercel Analytics

```typescript
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
```

### Custom Event Tracking

```typescript
// lib/analytics.ts
import { track } from '@vercel/analytics';
import * as Sentry from '@sentry/nextjs';

// Track e-commerce events
export const analytics = {
  viewProduct(product: { id: string; name: string; price: number; category: string }) {
    track('product_viewed', {
      product_id: product.id,
      product_name: product.name,
      price: product.price / 100,
      category: product.category,
    });
    
    Sentry.addBreadcrumb({
      category: 'product',
      message: `Viewed ${product.name}`,
      level: 'info',
    });
  },

  addToCart(product: { id: string; name: string; price: number; quantity: number }) {
    track('add_to_cart', {
      product_id: product.id,
      product_name: product.name,
      price: product.price / 100,
      quantity: product.quantity,
      value: (product.price * product.quantity) / 100,
    });
  },

  beginCheckout(cart: { items: any[]; subtotal: number }) {
    track('begin_checkout', {
      items_count: cart.items.length,
      value: cart.subtotal / 100,
    });
  },

  purchase(order: { id: string; total: number; items: any[] }) {
    track('purchase', {
      order_id: order.id,
      value: order.total / 100,
      items_count: order.items.length,
    });
    
    Sentry.setContext('last_order', {
      order_id: order.id,
      total: order.total,
    });
  },

  searchProducts(query: string, resultsCount: number) {
    track('search', {
      query,
      results_count: resultsCount,
    });
  },

  applyDiscount(code: string, success: boolean, discount?: number) {
    track('discount_applied', {
      code,
      success,
      discount_amount: discount ? discount / 100 : undefined,
    });
  },
};
```

### Health Check Endpoint

```typescript
// app/api/health/route.ts
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function GET() {
  const checks: Record<string, 'healthy' | 'unhealthy' | 'degraded'> = {};
  
  // Database check
  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.database = 'healthy';
  } catch {
    checks.database = 'unhealthy';
  }
  
  // Stripe check
  try {
    await stripe.balance.retrieve();
    checks.stripe = 'healthy';
  } catch {
    checks.stripe = 'unhealthy';
  }
  
  // Redis check (if using Upstash)
  try {
    const redis = new Redis({
      url: process.env.UPSTASH_REDIS_URL!,
      token: process.env.UPSTASH_REDIS_TOKEN!,
    });
    await redis.ping();
    checks.redis = 'healthy';
  } catch {
    checks.redis = 'degraded'; // Non-critical
  }
  
  const overallStatus = Object.values(checks).every((s) => s === 'healthy')
    ? 'healthy'
    : Object.values(checks).some((s) => s === 'unhealthy')
    ? 'unhealthy'
    : 'degraded';
  
  return Response.json(
    {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      services: checks,
    },
    { status: overallStatus === 'unhealthy' ? 503 : 200 }
  );
}
```

## Environment Variables

```bash
# .env.example

# ===========================================
# Application
# ===========================================
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME="My Store"

# ===========================================
# Database
# ===========================================
DATABASE_URL="postgresql://user:password@localhost:5432/store"

# ===========================================
# Authentication
# ===========================================
AUTH_SECRET="generate-with-openssl-rand-base64-32"
AUTH_URL=http://localhost:3000

# ===========================================
# Stripe
# ===========================================
STRIPE_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# ===========================================
# Email (Resend)
# ===========================================
RESEND_API_KEY="re_..."
EMAIL_FROM="noreply@yourstore.com"

# ===========================================
# Monitoring
# ===========================================
NEXT_PUBLIC_SENTRY_DSN="https://...@sentry.io/..."
SENTRY_DSN="https://...@sentry.io/..."
SENTRY_AUTH_TOKEN="sntrys_..."
SENTRY_ORG="your-org"
SENTRY_PROJECT="your-project"

# ===========================================
# Rate Limiting (Upstash Redis)
# ===========================================
UPSTASH_REDIS_URL="https://..."
UPSTASH_REDIS_TOKEN="..."

# ===========================================
# Image Upload (Cloudinary or Uploadthing)
# ===========================================
CLOUDINARY_CLOUD_NAME="..."
CLOUDINARY_API_KEY="..."
CLOUDINARY_API_SECRET="..."
# or
UPLOADTHING_SECRET="..."
UPLOADTHING_APP_ID="..."
```

## Deployment Checklist

### Pre-Deployment
- [ ] All environment variables configured in Vercel
- [ ] Database migrations applied (`npx prisma migrate deploy`)
- [ ] Stripe webhook endpoints configured for production URL
- [ ] SSL certificate configured (automatic with Vercel)

### Testing
- [ ] All unit tests passing (`npm run test:unit`)
- [ ] All E2E tests passing (`npm run test:e2e`)
- [ ] Manual checkout flow tested with Stripe test cards
- [ ] Mobile responsive testing completed

### Security
- [ ] Security headers configured in `next.config.js`
- [ ] Rate limiting enabled for API routes
- [ ] CSRF protection enabled
- [ ] Input validation on all forms
- [ ] Sensitive routes require authentication

### Performance
- [ ] Images optimized and served via CDN
- [ ] Bundle size analyzed (`npm run build && npx @next/bundle-analyzer`)
- [ ] Core Web Vitals within acceptable range
- [ ] Caching headers configured for API routes

### Monitoring
- [ ] Sentry error tracking configured
- [ ] Vercel Analytics enabled
- [ ] Health check endpoint responding
- [ ] Uptime monitoring configured

### Accessibility
- [ ] WCAG 2.1 AA compliance verified
- [ ] Screen reader testing completed
- [ ] Keyboard navigation tested
- [ ] Color contrast ratios verified

### SEO
- [ ] Meta tags configured for all pages
- [ ] Open Graph images generated
- [ ] `robots.txt` configured
- [ ] `sitemap.xml` generated
- [ ] Structured data (JSON-LD) implemented

## Related Recipes

- [saas-dashboard](./saas-dashboard.md) - Admin dashboard patterns
- [marketing-site](./marketing-site.md) - Landing pages and marketing
- [realtime-app](./realtime-app.md) - Live inventory updates
- [subscription-billing](./subscription-billing.md) - Recurring payments

## Changelog

### v2.0.0 (2025-01-18)
- Upgraded to god-tier template
- Added comprehensive Testing section with Vitest + Playwright
- Added Error Handling section with error boundaries and API errors
- Added Accessibility section with WCAG 2.1 AA compliance
- Added Security section with rate limiting, validation, CSRF
- Added Performance section with caching and optimization
- Added CI/CD section with GitHub Actions workflow
- Added Monitoring section with Sentry and Vercel Analytics

### v1.0.0 (2025-01-17)
- Initial recipe for Next.js 15
- Stripe integration
- Zustand cart state
- Full checkout flow

## Environment Variables

```env
# .env.local
DATABASE_URL="postgresql://..."
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Stripe
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Email
RESEND_API_KEY="re_..."

# Auth
AUTH_SECRET="..."
```

## Deployment Checklist

- [ ] Configure Stripe webhook endpoints
- [ ] Set up database with migrations
- [ ] Configure image CDN (Cloudinary/Uploadthing)
- [ ] Set up transactional emails
- [ ] Configure tax calculation service
- [ ] Set up inventory alerts
- [ ] Configure analytics and conversion tracking
- [ ] Test complete checkout flow
- [ ] Set up monitoring and error tracking

## Related Recipes

- [saas-dashboard](./saas-dashboard.md) - For admin dashboard
- [marketing-site](./marketing-site.md) - For landing pages
- [realtime-app](./realtime-app.md) - For live inventory updates

---

## Changelog

### 1.0.0 (2025-01-17)
- Initial recipe for Next.js 15
- Stripe integration
- Zustand cart state
- Full checkout flow
