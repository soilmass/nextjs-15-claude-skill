---
id: r-marketplace
name: Marketplace
version: 3.0.0
layer: L6
category: recipes
description: Two-sided marketplace with buyers, sellers, listings, orders, reviews, and escrow payments
tags: [marketplace, ecommerce, listings, orders, reviews, payments, escrow]
formula: "Marketplace = ProductListing(t-product-listing) + ProductDetail(t-product-detail) + DashboardLayout(t-dashboard-layout) + CheckoutPage(t-checkout-page) + AuthLayout(t-auth-layout) + SettingsPage(t-settings-page) + SearchResultsPage(t-search-results-page) + ProfilePage(t-profile-page) + Cart(o-cart) + DataTable(o-data-table) + ReviewForm(o-review-form) + Header(o-header) + Footer(o-footer) + FileUploader(o-file-uploader) + CommentsSection(o-comments-section) + NotificationCenter(o-notification-center) + SettingsForm(o-settings-form) + Hero(o-hero) + SearchModal(o-search-modal) + Breadcrumb(m-breadcrumb) + Pagination(m-pagination) + Rating(m-rating) + FormField(m-form-field) + StatCard(m-stat-card) + EmptyState(m-empty-state) + SearchInput(m-search-input) + ActionMenu(m-action-menu) + AvatarGroup(m-avatar-group) + NextAuth(pt-next-auth) + AuthMiddleware(pt-auth-middleware) + SessionManagement(pt-session-management) + Rbac(pt-rbac) + RateLimiting(pt-rate-limiting) + CsrfProtection(pt-csrf-protection) + SecurityHeaders(pt-security-headers) + GdprCompliance(pt-gdpr-compliance) + AuditLogging(pt-audit-logging) + StripeCheckout(pt-stripe-checkout) + StripeWebhooks(pt-stripe-webhooks) + ShoppingCart(pt-shopping-cart) + Checkout(pt-checkout) + DiscountEngine(pt-discount-engine) + TaxCalculation(pt-tax-calculation) + ProductListings(pt-product-listings) + Reviews(pt-reviews) + SearchFilters(pt-search-filters) + FullTextSearch(pt-full-text-search) + Filtering(pt-filtering) + Sorting(pt-sorting) + Pagination(pt-pagination) + RecentlyViewed(pt-recently-viewed) + Wishlists(pt-wishlists) + FormValidation(pt-form-validation) + ZodSchemas(pt-zod-schemas) + ServerActions(pt-server-actions) + Mutations(pt-mutations) + FileUpload(pt-file-upload) + FileStorage(pt-file-storage) + ImageOptimization(pt-image-optimization) + TransactionalEmail(pt-transactional-email) + EmailTemplates(pt-email-templates) + Websockets(pt-websockets) + PushNotifications(pt-push-notifications) + ErrorBoundaries(pt-error-boundaries) + ErrorTracking(pt-error-tracking) + SkeletonLoading(pt-skeleton-loading) + Sitemap(pt-sitemap) + StructuredData(pt-structured-data) + MetadataApi(pt-metadata-api) + AnalyticsEvents(pt-analytics-events) + UserAnalytics(pt-user-analytics) + CacheAside(pt-cache-aside) + ReactQuery(pt-react-query) + Zustand(pt-zustand) + TestingE2e(pt-testing-e2e) + TestingIntegration(pt-testing-integration)"
composes:
  # L2 Molecules - UI Building Blocks
  - ../molecules/breadcrumb.md
  - ../molecules/pagination.md
  - ../molecules/rating.md
  - ../molecules/form-field.md
  - ../molecules/stat-card.md
  - ../molecules/empty-state.md
  - ../molecules/search-input.md
  - ../molecules/action-menu.md
  - ../molecules/avatar-group.md
  # L3 Organisms - Complex Components
  - ../organisms/cart.md
  - ../organisms/data-table.md
  - ../organisms/review-form.md
  - ../organisms/header.md
  - ../organisms/footer.md
  - ../organisms/file-uploader.md
  - ../organisms/comments-section.md
  - ../organisms/notification-center.md
  - ../organisms/settings-form.md
  - ../organisms/hero.md
  - ../organisms/search-modal.md
  # L4 Templates - Page Layouts
  - ../templates/product-listing.md
  - ../templates/product-detail.md
  - ../templates/dashboard-layout.md
  - ../templates/checkout-page.md
  - ../templates/auth-layout.md
  - ../templates/settings-page.md
  - ../templates/search-results-page.md
  - ../templates/profile-page.md
  # L5 Patterns - Authentication & Security
  - ../patterns/next-auth.md
  - ../patterns/auth-middleware.md
  - ../patterns/session-management.md
  - ../patterns/rbac.md
  - ../patterns/rate-limiting.md
  - ../patterns/csrf-protection.md
  - ../patterns/security-headers.md
  - ../patterns/gdpr-compliance.md
  - ../patterns/audit-logging.md
  # L5 Patterns - Payments & Commerce
  - ../patterns/stripe-checkout.md
  - ../patterns/stripe-webhooks.md
  - ../patterns/shopping-cart.md
  - ../patterns/checkout.md
  - ../patterns/discount-engine.md
  - ../patterns/tax-calculation.md
  # L5 Patterns - Product & Catalog
  - ../patterns/product-listings.md
  - ../patterns/reviews.md
  - ../patterns/search-filters.md
  - ../patterns/full-text-search.md
  - ../patterns/filtering.md
  - ../patterns/sorting.md
  - ../patterns/pagination.md
  - ../patterns/recently-viewed.md
  - ../patterns/wishlists.md
  # L5 Patterns - Forms & Validation
  - ../patterns/form-validation.md
  - ../patterns/zod-schemas.md
  - ../patterns/server-actions.md
  - ../patterns/mutations.md
  # L5 Patterns - File Handling
  - ../patterns/file-upload.md
  - ../patterns/file-storage.md
  - ../patterns/image-optimization.md
  # L5 Patterns - Communication
  - ../patterns/transactional-email.md
  - ../patterns/email-templates.md
  - ../patterns/websockets.md
  - ../patterns/push-notifications.md
  # L5 Patterns - Error Handling & UX
  - ../patterns/error-boundaries.md
  - ../patterns/error-tracking.md
  - ../patterns/skeleton-loading.md
  # L5 Patterns - SEO
  - ../patterns/sitemap.md
  - ../patterns/structured-data.md
  - ../patterns/metadata-api.md
  # L5 Patterns - Analytics
  - ../patterns/analytics-events.md
  - ../patterns/user-analytics.md
  # L5 Patterns - State & Caching
  - ../patterns/cache-aside.md
  - ../patterns/react-query.md
  - ../patterns/zustand.md
  # L5 Patterns - Testing
  - ../patterns/testing-e2e.md
  - ../patterns/testing-integration.md
dependencies:
  - next@15.0.0
  - react@19.0.0
  - typescript@5.6.0
  - tailwindcss@4.0.0
  - prisma@6.0.0
  - "@tanstack/react-query"
  - react-hook-form
  - zod
  - stripe
  - "@radix-ui/react-dialog"
  - "@radix-ui/react-tabs"
  - "@radix-ui/react-select"
  - lucide-react
  - date-fns
skills:
  - product-listings
  - shopping-cart
  - checkout
  - reviews
  - search-filters
  - messaging
performance:
  impact: high
  lcp: medium
  cls: low
accessibility:
  wcag: AA
  keyboard: true
  screen-reader: true
---

# Marketplace

## Overview

A complete two-sided marketplace featuring:
- Seller storefronts and verification
- Product listings with variants
- Advanced search and filtering
- Shopping cart and checkout
- Escrow payment system
- Order management for buyers/sellers
- Review and rating system
- In-app messaging between buyers and sellers
- Dispute resolution

## Project Structure

```
marketplace/
├── app/
│   ├── (storefront)/
│   │   ├── page.tsx                    # Homepage
│   │   ├── search/page.tsx             # Search results
│   │   ├── category/[slug]/page.tsx    # Category page
│   │   ├── listing/[id]/page.tsx       # Listing detail
│   │   └── shop/[username]/page.tsx    # Seller storefront
│   ├── (buyer)/
│   │   ├── layout.tsx
│   │   ├── cart/page.tsx
│   │   ├── checkout/page.tsx
│   │   ├── orders/
│   │   │   ├── page.tsx
│   │   │   └── [orderId]/page.tsx
│   │   └── messages/page.tsx
│   ├── (seller)/
│   │   └── seller/
│   │       ├── layout.tsx
│   │       ├── page.tsx                # Seller dashboard
│   │       ├── listings/
│   │       │   ├── page.tsx
│   │       │   ├── new/page.tsx
│   │       │   └── [listingId]/edit/page.tsx
│   │       ├── orders/page.tsx
│   │       ├── analytics/page.tsx
│   │       └── settings/page.tsx
│   ├── api/
│   │   ├── listings/
│   │   │   ├── route.ts
│   │   │   ├── [listingId]/route.ts
│   │   │   └── search/route.ts
│   │   ├── cart/route.ts
│   │   ├── orders/
│   │   │   ├── route.ts
│   │   │   └── [orderId]/
│   │   │       ├── route.ts
│   │   │       ├── ship/route.ts
│   │   │       └── complete/route.ts
│   │   ├── reviews/route.ts
│   │   ├── messages/route.ts
│   │   └── webhooks/stripe/route.ts
│   └── layout.tsx
├── components/
│   ├── listings/
│   │   ├── listing-card.tsx
│   │   ├── listing-gallery.tsx
│   │   ├── listing-form.tsx
│   │   └── variant-selector.tsx
│   ├── cart/
│   │   ├── cart-drawer.tsx
│   │   └── cart-item.tsx
│   ├── orders/
│   │   ├── order-card.tsx
│   │   └── order-timeline.tsx
│   ├── reviews/
│   │   ├── review-card.tsx
│   │   └── review-form.tsx
│   └── ui/
├── lib/
│   ├── api.ts
│   ├── stripe.ts
│   └── escrow.ts
└── prisma/
    └── schema.prisma
```

## Database Schema

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id              String    @id @default(cuid())
  email           String    @unique
  name            String
  avatar          String?
  role            UserRole  @default(BUYER)
  stripeCustomerId String?
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  // Seller profile
  sellerProfile   SellerProfile?
  
  // Buyer relations
  cart            CartItem[]
  orders          Order[]
  reviews         Review[]
  
  // Messages
  messagesSent     Message[] @relation("sender")
  messagesReceived Message[] @relation("receiver")
  conversations    ConversationParticipant[]

  @@index([email])
}

enum UserRole {
  BUYER
  SELLER
  ADMIN
}

model SellerProfile {
  id              String       @id @default(cuid())
  userId          String       @unique
  user            User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  // Store info
  storeName       String
  storeSlug       String       @unique
  description     String?
  logo            String?
  banner          String?
  
  // Verification
  isVerified      Boolean      @default(false)
  verifiedAt      DateTime?
  
  // Stripe Connect
  stripeAccountId String?
  stripeOnboarded Boolean      @default(false)
  
  // Settings
  shippingPolicy  String?
  returnPolicy    String?
  
  // Stats (denormalized)
  totalSales      Int          @default(0)
  totalRevenue    Decimal      @default(0) @db.Decimal(10, 2)
  averageRating   Float        @default(0)
  
  listings        Listing[]
  
  createdAt       DateTime     @default(now())
  updatedAt       DateTime     @updatedAt

  @@index([storeSlug])
}

model Category {
  id          String     @id @default(cuid())
  name        String
  slug        String     @unique
  description String?
  image       String?
  parentId    String?
  parent      Category?  @relation("CategoryChildren", fields: [parentId], references: [id])
  children    Category[] @relation("CategoryChildren")
  listings    Listing[]
  
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt

  @@index([slug])
  @@index([parentId])
}

model Listing {
  id            String        @id @default(cuid())
  title         String
  slug          String
  description   String
  
  // Pricing
  price         Decimal       @db.Decimal(10, 2)
  comparePrice  Decimal?      @db.Decimal(10, 2)
  currency      String        @default("USD")
  
  // Inventory
  quantity      Int           @default(0)
  sku           String?
  
  // Media
  images        String[]
  
  // Categorization
  categoryId    String
  category      Category      @relation(fields: [categoryId], references: [id])
  tags          String[]
  
  // Seller
  sellerId      String
  seller        SellerProfile @relation(fields: [sellerId], references: [id], onDelete: Cascade)
  
  // Variants
  variants      ListingVariant[]
  
  // Status
  status        ListingStatus @default(DRAFT)
  
  // Shipping
  weight        Decimal?      @db.Decimal(10, 2)
  dimensions    Json?         // { length, width, height }
  shippingPrice Decimal?      @db.Decimal(10, 2)
  freeShipping  Boolean       @default(false)
  
  // Stats
  views         Int           @default(0)
  favorites     Int           @default(0)
  
  // Relations
  cartItems     CartItem[]
  orderItems    OrderItem[]
  reviews       Review[]
  
  publishedAt   DateTime?
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt

  @@unique([sellerId, slug])
  @@index([categoryId])
  @@index([sellerId])
  @@index([status])
}

enum ListingStatus {
  DRAFT
  ACTIVE
  PAUSED
  SOLD_OUT
  ARCHIVED
}

model ListingVariant {
  id          String   @id @default(cuid())
  listingId   String
  listing     Listing  @relation(fields: [listingId], references: [id], onDelete: Cascade)
  
  name        String   // e.g., "Size", "Color"
  value       String   // e.g., "Large", "Red"
  price       Decimal? @db.Decimal(10, 2)
  quantity    Int      @default(0)
  sku         String?
  image       String?

  @@index([listingId])
}

model CartItem {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  listingId   String
  listing     Listing  @relation(fields: [listingId], references: [id], onDelete: Cascade)
  quantity    Int      @default(1)
  variantId   String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@unique([userId, listingId, variantId])
  @@index([userId])
}

model Order {
  id              String      @id @default(cuid())
  orderNumber     String      @unique
  
  // Buyer
  buyerId         String
  buyer           User        @relation(fields: [buyerId], references: [id])
  
  // Items
  items           OrderItem[]
  
  // Pricing
  subtotal        Decimal     @db.Decimal(10, 2)
  shippingTotal   Decimal     @db.Decimal(10, 2)
  taxTotal        Decimal     @db.Decimal(10, 2)
  total           Decimal     @db.Decimal(10, 2)
  currency        String      @default("USD")
  
  // Payment
  stripePaymentId String?
  paymentStatus   PaymentStatus @default(PENDING)
  
  // Shipping
  shippingAddress Json
  
  // Status
  status          OrderStatus @default(PENDING)
  
  // Escrow
  escrowReleased  Boolean     @default(false)
  escrowReleasedAt DateTime?
  
  // Dates
  paidAt          DateTime?
  shippedAt       DateTime?
  deliveredAt     DateTime?
  completedAt     DateTime?
  cancelledAt     DateTime?
  
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt

  @@index([buyerId])
  @@index([status])
  @@index([orderNumber])
}

enum OrderStatus {
  PENDING
  PAID
  PROCESSING
  SHIPPED
  DELIVERED
  COMPLETED
  CANCELLED
  REFUNDED
  DISPUTED
}

enum PaymentStatus {
  PENDING
  PROCESSING
  SUCCEEDED
  FAILED
  REFUNDED
}

model OrderItem {
  id          String   @id @default(cuid())
  orderId     String
  order       Order    @relation(fields: [orderId], references: [id], onDelete: Cascade)
  
  listingId   String
  listing     Listing  @relation(fields: [listingId], references: [id])
  
  // Seller reference for multi-seller orders
  sellerId    String
  
  // Snapshot at time of purchase
  title       String
  price       Decimal  @db.Decimal(10, 2)
  quantity    Int
  variantName String?
  variantValue String?
  image       String?
  
  // Item status (for multi-seller orders)
  status      OrderItemStatus @default(PENDING)
  trackingNumber String?
  
  createdAt   DateTime @default(now())

  @@index([orderId])
  @@index([sellerId])
}

enum OrderItemStatus {
  PENDING
  PROCESSING
  SHIPPED
  DELIVERED
}

model Review {
  id          String   @id @default(cuid())
  rating      Int      // 1-5
  title       String?
  content     String
  images      String[]
  
  // Relations
  listingId   String
  listing     Listing  @relation(fields: [listingId], references: [id], onDelete: Cascade)
  reviewerId  String
  reviewer    User     @relation(fields: [reviewerId], references: [id])
  
  // Seller response
  sellerResponse String?
  respondedAt   DateTime?
  
  isVerifiedPurchase Boolean @default(false)
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@unique([listingId, reviewerId])
  @@index([listingId])
}

model Conversation {
  id           String    @id @default(cuid())
  participants ConversationParticipant[]
  messages     Message[]
  listingId    String?   // Optional: conversation about a listing
  lastMessageAt DateTime @default(now())
  createdAt    DateTime  @default(now())

  @@index([listingId])
}

model ConversationParticipant {
  id             String       @id @default(cuid())
  conversationId String
  conversation   Conversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)
  userId         String
  user           User         @relation(fields: [userId], references: [id])
  lastReadAt     DateTime?
  
  @@unique([conversationId, userId])
}

model Message {
  id             String       @id @default(cuid())
  conversationId String
  conversation   Conversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)
  senderId       String
  sender         User         @relation("sender", fields: [senderId], references: [id])
  receiverId     String
  receiver       User         @relation("receiver", fields: [receiverId], references: [id])
  content        String
  attachments    String[]
  read           Boolean      @default(false)
  createdAt      DateTime     @default(now())

  @@index([conversationId])
  @@index([senderId])
  @@index([receiverId])
}
```

## Implementation

### Listing Card

```tsx
// components/listings/listing-card.tsx
import Link from 'next/link';
import Image from 'next/image';
import { Heart, Star, Truck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/utils';

interface ListingCardProps {
  listing: {
    id: string;
    slug: string;
    title: string;
    price: number;
    comparePrice: number | null;
    currency: string;
    images: string[];
    freeShipping: boolean;
    seller: {
      storeName: string;
      storeSlug: string;
      isVerified: boolean;
      averageRating: number;
    };
    _count: {
      reviews: number;
    };
  };
  showFavorite?: boolean;
}

export function ListingCard({ listing, showFavorite = true }: ListingCardProps) {
  const discount = listing.comparePrice
    ? Math.round((1 - listing.price / listing.comparePrice) * 100)
    : null;

  return (
    <article className="group bg-white dark:bg-gray-900 rounded-xl overflow-hidden border hover:shadow-lg transition-all">
      {/* Image */}
      <Link href={`/listing/${listing.id}`}>
        <div className="relative aspect-square">
          {listing.images[0] ? (
            <Image
              src={listing.images[0]}
              alt={listing.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 dark:bg-gray-800" />
          )}
          
          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {discount && (
              <Badge className="bg-red-500 text-white">
                -{discount}%
              </Badge>
            )}
            {listing.freeShipping && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <Truck className="h-3 w-3" />
                Free Shipping
              </Badge>
            )}
          </div>

          {/* Favorite Button */}
          {showFavorite && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 bg-white/80 hover:bg-white"
              onClick={(e) => {
                e.preventDefault();
                // Handle favorite
              }}
            >
              <Heart className="h-4 w-4" />
            </Button>
          )}
        </div>
      </Link>

      {/* Content */}
      <div className="p-3">
        {/* Seller */}
        <Link
          href={`/shop/${listing.seller.storeSlug}`}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-1"
        >
          {listing.seller.storeName}
          {listing.seller.isVerified && (
            <svg className="h-3.5 w-3.5 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
            </svg>
          )}
        </Link>

        {/* Title */}
        <Link href={`/listing/${listing.id}`}>
          <h3 className="font-medium line-clamp-2 group-hover:text-blue-600 transition-colors">
            {listing.title}
          </h3>
        </Link>

        {/* Rating */}
        {listing._count.reviews > 0 && (
          <div className="flex items-center gap-1 mt-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-medium">
              {listing.seller.averageRating.toFixed(1)}
            </span>
            <span className="text-sm text-gray-500">
              ({listing._count.reviews})
            </span>
          </div>
        )}

        {/* Price */}
        <div className="flex items-baseline gap-2 mt-2">
          <span className="text-lg font-bold">
            {formatPrice(listing.price, listing.currency)}
          </span>
          {listing.comparePrice && (
            <span className="text-sm text-gray-500 line-through">
              {formatPrice(listing.comparePrice, listing.currency)}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
```

### Listing Gallery

```tsx
// components/listings/listing-gallery.tsx
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ListingGalleryProps {
  images: string[];
  title: string;
}

export function ListingGallery({ images, title }: ListingGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);

  const goToPrevious = () => {
    setSelectedIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setSelectedIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  if (images.length === 0) {
    return (
      <div className="aspect-square bg-gray-200 dark:bg-gray-800 rounded-xl flex items-center justify-center">
        <span className="text-gray-500">No image</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 group">
        <Image
          src={images[selectedIndex]}
          alt={`${title} - Image ${selectedIndex + 1}`}
          fill
          className="object-contain"
          priority
        />

        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={goToPrevious}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={goToNext}
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </>
        )}

        {/* Zoom Button */}
        <Dialog>
          <DialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="absolute bottom-2 right-2 bg-white/80 hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ZoomIn className="h-5 w-5" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl p-0">
            <div className="relative aspect-square">
              <Image
                src={images[selectedIndex]}
                alt={`${title} - Image ${selectedIndex + 1}`}
                fill
                className="object-contain"
              />
            </div>
          </DialogContent>
        </Dialog>

        {/* Image Counter */}
        <div className="absolute bottom-2 left-2 bg-black/60 text-white text-sm px-2 py-1 rounded">
          {selectedIndex + 1} / {images.length}
        </div>
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => setSelectedIndex(index)}
              className={cn(
                'relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-colors',
                index === selectedIndex
                  ? 'border-blue-500'
                  : 'border-transparent hover:border-gray-300'
              )}
            >
              <Image
                src={image}
                alt={`${title} - Thumbnail ${index + 1}`}
                fill
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
```

### Cart Drawer

```tsx
// components/cart/cart-drawer.tsx
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, X, Plus, Minus, Trash2 } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { formatPrice } from '@/lib/utils';

interface CartItem {
  id: string;
  quantity: number;
  listing: {
    id: string;
    title: string;
    price: number;
    currency: string;
    images: string[];
    seller: {
      storeName: string;
    };
  };
  variant?: {
    name: string;
    value: string;
  };
}

export function CartDrawer() {
  const queryClient = useQueryClient();

  const { data: cart, isLoading } = useQuery({
    queryKey: ['cart'],
    queryFn: async () => {
      const response = await fetch('/api/cart');
      if (!response.ok) throw new Error('Failed to fetch cart');
      return response.json() as Promise<{ items: CartItem[]; total: number }>;
    },
  });

  const updateQuantity = useMutation({
    mutationFn: async ({ itemId, quantity }: { itemId: string; quantity: number }) => {
      const response = await fetch('/api/cart', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId, quantity }),
      });
      if (!response.ok) throw new Error('Failed to update cart');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });

  const removeItem = useMutation({
    mutationFn: async (itemId: string) => {
      const response = await fetch(`/api/cart?itemId=${itemId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to remove item');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });

  const itemCount = cart?.items.reduce((acc, item) => acc + item.quantity, 0) || 0;

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <ShoppingCart className="h-5 w-5" />
          {itemCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
              {itemCount}
            </span>
          )}
        </Button>
      </SheetTrigger>
      
      <SheetContent className="w-full sm:max-w-md flex flex-col">
        <SheetHeader>
          <SheetTitle>Shopping Cart ({itemCount})</SheetTitle>
        </SheetHeader>

        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
          </div>
        ) : !cart?.items.length ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <ShoppingCart className="h-16 w-16 text-gray-300 mb-4" />
            <p className="text-lg font-medium mb-2">Your cart is empty</p>
            <p className="text-gray-500 mb-4">Add items to get started</p>
            <SheetTrigger asChild>
              <Button asChild>
                <Link href="/search">Browse Listings</Link>
              </Button>
            </SheetTrigger>
          </div>
        ) : (
          <>
            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto py-4 space-y-4">
              {cart.items.map((item) => (
                <div key={item.id} className="flex gap-3">
                  {/* Image */}
                  <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                    {item.listing.images[0] && (
                      <Image
                        src={item.listing.images[0]}
                        alt={item.listing.title}
                        fill
                        className="object-cover"
                      />
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/listing/${item.listing.id}`}
                      className="font-medium line-clamp-1 hover:text-blue-600"
                    >
                      {item.listing.title}
                    </Link>
                    <p className="text-sm text-gray-500">
                      {item.listing.seller.storeName}
                    </p>
                    {item.variant && (
                      <p className="text-sm text-gray-500">
                        {item.variant.name}: {item.variant.value}
                      </p>
                    )}
                    <p className="font-semibold mt-1">
                      {formatPrice(item.listing.price, item.listing.currency)}
                    </p>
                  </div>

                  {/* Quantity & Remove */}
                  <div className="flex flex-col items-end justify-between">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-gray-400 hover:text-red-500"
                      onClick={() => removeItem.mutate(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>

                    <div className="flex items-center border rounded-lg">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() =>
                          updateQuantity.mutate({
                            itemId: item.id,
                            quantity: Math.max(1, item.quantity - 1),
                          })
                        }
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center text-sm">{item.quantity}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() =>
                          updateQuantity.mutate({
                            itemId: item.id,
                            quantity: item.quantity + 1,
                          })
                        }
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Separator />

            {/* Footer */}
            <SheetFooter className="pt-4">
              <div className="w-full space-y-4">
                <div className="flex justify-between text-lg font-semibold">
                  <span>Subtotal</span>
                  <span>{formatPrice(cart.total, 'USD')}</span>
                </div>
                <p className="text-sm text-gray-500">
                  Shipping and taxes calculated at checkout
                </p>
                <SheetTrigger asChild>
                  <Button asChild className="w-full" size="lg">
                    <Link href="/checkout">Proceed to Checkout</Link>
                  </Button>
                </SheetTrigger>
              </div>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
```

### Order Timeline

```tsx
// components/orders/order-timeline.tsx
import { format } from 'date-fns';
import { 
  Clock, CreditCard, Package, Truck, 
  CheckCircle, XCircle, AlertCircle 
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface OrderTimelineProps {
  order: {
    status: string;
    createdAt: string;
    paidAt: string | null;
    shippedAt: string | null;
    deliveredAt: string | null;
    completedAt: string | null;
    cancelledAt: string | null;
  };
}

const statusConfig = {
  PENDING: { icon: Clock, label: 'Order Placed', color: 'text-gray-500' },
  PAID: { icon: CreditCard, label: 'Payment Confirmed', color: 'text-blue-500' },
  PROCESSING: { icon: Package, label: 'Processing', color: 'text-yellow-500' },
  SHIPPED: { icon: Truck, label: 'Shipped', color: 'text-purple-500' },
  DELIVERED: { icon: CheckCircle, label: 'Delivered', color: 'text-green-500' },
  COMPLETED: { icon: CheckCircle, label: 'Completed', color: 'text-green-600' },
  CANCELLED: { icon: XCircle, label: 'Cancelled', color: 'text-red-500' },
  DISPUTED: { icon: AlertCircle, label: 'Disputed', color: 'text-orange-500' },
};

const statusOrder = ['PENDING', 'PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'COMPLETED'];

export function OrderTimeline({ order }: OrderTimelineProps) {
  const currentStatusIndex = statusOrder.indexOf(order.status);
  const isCancelled = order.status === 'CANCELLED';
  const isDisputed = order.status === 'DISPUTED';

  const getStepDate = (status: string) => {
    switch (status) {
      case 'PENDING':
        return order.createdAt;
      case 'PAID':
        return order.paidAt;
      case 'SHIPPED':
        return order.shippedAt;
      case 'DELIVERED':
        return order.deliveredAt;
      case 'COMPLETED':
        return order.completedAt;
      default:
        return null;
    }
  };

  if (isCancelled || isDisputed) {
    const config = statusConfig[order.status as keyof typeof statusConfig];
    const Icon = config.icon;
    
    return (
      <div className="flex items-center gap-3 p-4 rounded-lg bg-gray-50 dark:bg-gray-900">
        <div className={cn('p-2 rounded-full', config.color, 'bg-current/10')}>
          <Icon className={cn('h-6 w-6', config.color)} />
        </div>
        <div>
          <p className={cn('font-medium', config.color)}>{config.label}</p>
          <p className="text-sm text-gray-500">
            {format(new Date(order.cancelledAt || order.createdAt), 'MMM d, yyyy h:mm a')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {statusOrder.slice(0, -1).map((status, index) => {
        const config = statusConfig[status as keyof typeof statusConfig];
        const Icon = config.icon;
        const isCompleted = index <= currentStatusIndex;
        const isCurrent = index === currentStatusIndex;
        const date = getStepDate(status);

        return (
          <div key={status} className="flex gap-4">
            {/* Line and Icon */}
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center',
                  isCompleted
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-400'
                )}
              >
                <Icon className="h-5 w-5" />
              </div>
              {index < statusOrder.length - 2 && (
                <div
                  className={cn(
                    'w-0.5 h-12',
                    index < currentStatusIndex
                      ? 'bg-blue-500'
                      : 'bg-gray-200 dark:bg-gray-700'
                  )}
                />
              )}
            </div>

            {/* Content */}
            <div className="pb-8">
              <p
                className={cn(
                  'font-medium',
                  isCompleted ? 'text-gray-900 dark:text-white' : 'text-gray-400'
                )}
              >
                {config.label}
              </p>
              {date && (
                <p className="text-sm text-gray-500">
                  {format(new Date(date), 'MMM d, yyyy h:mm a')}
                </p>
              )}
              {isCurrent && !date && (
                <p className="text-sm text-blue-500">In progress...</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
```

### Checkout API with Escrow

```tsx
// app/api/orders/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { stripe } from '@/lib/stripe';
import { z } from 'zod';
import { nanoid } from 'nanoid';

const checkoutSchema = z.object({
  shippingAddress: z.object({
    name: z.string(),
    line1: z.string(),
    line2: z.string().optional(),
    city: z.string(),
    state: z.string(),
    postalCode: z.string(),
    country: z.string(),
  }),
});

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { shippingAddress } = checkoutSchema.parse(body);

    // Get cart items
    const cartItems = await prisma.cartItem.findMany({
      where: { userId: session.user.id },
      include: {
        listing: {
          include: {
            seller: true,
          },
        },
      },
    });

    if (cartItems.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    // Calculate totals
    const subtotal = cartItems.reduce(
      (acc, item) => acc + Number(item.listing.price) * item.quantity,
      0
    );
    
    const shippingTotal = cartItems.reduce(
      (acc, item) => acc + (item.listing.freeShipping ? 0 : Number(item.listing.shippingPrice || 5)),
      0
    );
    
    const taxRate = 0.08; // 8% tax
    const taxTotal = subtotal * taxRate;
    const total = subtotal + shippingTotal + taxTotal;

    // Create order
    const order = await prisma.order.create({
      data: {
        orderNumber: `ORD-${nanoid(10).toUpperCase()}`,
        buyerId: session.user.id,
        subtotal,
        shippingTotal,
        taxTotal,
        total,
        shippingAddress,
        items: {
          create: cartItems.map((item) => ({
            listingId: item.listing.id,
            sellerId: item.listing.sellerId,
            title: item.listing.title,
            price: item.listing.price,
            quantity: item.quantity,
            image: item.listing.images[0],
          })),
        },
      },
      include: {
        items: true,
      },
    });

    // Create Stripe Payment Intent with escrow (using transfer_data for connected accounts)
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(total * 100), // Convert to cents
      currency: 'usd',
      metadata: {
        orderId: order.id,
        orderNumber: order.orderNumber,
      },
      // For marketplace, we hold funds until order is completed
      capture_method: 'automatic',
    });

    // Update order with payment intent
    await prisma.order.update({
      where: { id: order.id },
      data: { stripePaymentId: paymentIntent.id },
    });

    // Clear cart
    await prisma.cartItem.deleteMany({
      where: { userId: session.user.id },
    });

    return NextResponse.json({
      orderId: order.id,
      orderNumber: order.orderNumber,
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error('Checkout error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

### Escrow Release (Order Complete)

```tsx
// app/api/orders/[orderId]/complete/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { stripe } from '@/lib/stripe';

// POST /api/orders/[orderId]/complete - Buyer confirms delivery, release escrow
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const { orderId } = await params;
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: {
        include: {
          listing: {
            include: {
              seller: true,
            },
          },
        },
      },
    },
  });

  if (!order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }

  if (order.buyerId !== session.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  if (order.status !== 'DELIVERED') {
    return NextResponse.json(
      { error: 'Order must be delivered before completing' },
      { status: 400 }
    );
  }

  // Group items by seller for transfer
  const sellerTotals = new Map<string, { sellerId: string; stripeAccountId: string | null; amount: number }>();
  
  for (const item of order.items) {
    const existing = sellerTotals.get(item.sellerId);
    const itemTotal = Number(item.price) * item.quantity;
    
    if (existing) {
      existing.amount += itemTotal;
    } else {
      sellerTotals.set(item.sellerId, {
        sellerId: item.sellerId,
        stripeAccountId: item.listing.seller.stripeAccountId,
        amount: itemTotal,
      });
    }
  }

  // Platform fee (10%)
  const platformFeeRate = 0.10;

  // Transfer funds to each seller (minus platform fee)
  for (const [sellerId, data] of sellerTotals) {
    if (data.stripeAccountId) {
      const sellerAmount = Math.round(data.amount * (1 - platformFeeRate) * 100);
      
      await stripe.transfers.create({
        amount: sellerAmount,
        currency: 'usd',
        destination: data.stripeAccountId,
        metadata: {
          orderId: order.id,
          orderNumber: order.orderNumber,
          sellerId,
        },
      });

      // Update seller stats
      await prisma.sellerProfile.update({
        where: { id: sellerId },
        data: {
          totalSales: { increment: 1 },
          totalRevenue: { increment: data.amount * (1 - platformFeeRate) },
        },
      });
    }
  }

  // Update order status
  const updatedOrder = await prisma.order.update({
    where: { id: orderId },
    data: {
      status: 'COMPLETED',
      escrowReleased: true,
      escrowReleasedAt: new Date(),
      completedAt: new Date(),
    },
  });

  return NextResponse.json(updatedOrder);
}
```

## Testing

### Test Setup

```bash
# Install testing dependencies
npm install -D vitest @vitejs/plugin-react @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
npm install -D playwright @playwright/test
npm install -D msw stripe-mock
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
import { server } from './mocks/server';

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
  loadStripe: vi.fn().mockResolvedValue({
    elements: vi.fn().mockReturnValue({
      create: vi.fn().mockReturnValue({
        mount: vi.fn(),
        destroy: vi.fn(),
        on: vi.fn(),
      }),
    }),
    confirmPayment: vi.fn().mockResolvedValue({ paymentIntent: { status: 'succeeded' } }),
  }),
}));

// Setup MSW server
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

```typescript
// tests/mocks/handlers.ts
import { http, HttpResponse } from 'msw';

export const handlers = [
  // Listings API
  http.get('/api/listings', async ({ request }) => {
    const url = new URL(request.url);
    const category = url.searchParams.get('category');
    const search = url.searchParams.get('q');
    
    return HttpResponse.json({
      listings: [
        {
          id: 'listing-1',
          title: 'Test Product',
          price: 29.99,
          images: ['https://example.com/image.jpg'],
          seller: { storeName: 'Test Store', isVerified: true },
        },
      ],
      total: 1,
      page: 1,
    });
  }),

  http.get('/api/listings/:id', async ({ params }) => {
    return HttpResponse.json({
      id: params.id,
      title: 'Test Product',
      price: 29.99,
      description: 'Product description',
      images: ['https://example.com/image.jpg'],
      seller: {
        id: 'seller-1',
        storeName: 'Test Store',
        isVerified: true,
        averageRating: 4.5,
      },
      variants: [],
      quantity: 10,
    });
  }),

  http.post('/api/listings', async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({
      id: 'new-listing',
      ...body,
    }, { status: 201 });
  }),

  // Cart API
  http.get('/api/cart', async () => {
    return HttpResponse.json({
      items: [
        {
          id: 'cart-item-1',
          quantity: 2,
          listing: {
            id: 'listing-1',
            title: 'Test Product',
            price: 29.99,
            images: ['https://example.com/image.jpg'],
            seller: { storeName: 'Test Store' },
          },
        },
      ],
      total: 59.98,
    });
  }),

  http.post('/api/cart', async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({
      id: 'cart-item-new',
      ...body,
    }, { status: 201 });
  }),

  http.patch('/api/cart', async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({ success: true });
  }),

  http.delete('/api/cart', async () => {
    return HttpResponse.json({ success: true });
  }),

  // Orders API
  http.post('/api/orders', async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({
      orderId: 'order-123',
      orderNumber: 'ORD-ABC123',
      clientSecret: 'pi_test_secret',
    }, { status: 201 });
  }),

  http.get('/api/orders', async () => {
    return HttpResponse.json([
      {
        id: 'order-1',
        orderNumber: 'ORD-ABC123',
        status: 'PAID',
        total: 64.97,
        items: [{ title: 'Test Product', quantity: 2 }],
        createdAt: new Date().toISOString(),
      },
    ]);
  }),

  http.get('/api/orders/:id', async ({ params }) => {
    return HttpResponse.json({
      id: params.id,
      orderNumber: 'ORD-ABC123',
      status: 'DELIVERED',
      total: 64.97,
      items: [
        {
          id: 'item-1',
          title: 'Test Product',
          price: 29.99,
          quantity: 2,
          sellerId: 'seller-1',
        },
      ],
      shippingAddress: {
        name: 'John Doe',
        line1: '123 Main St',
        city: 'Anytown',
        state: 'CA',
        postalCode: '12345',
        country: 'US',
      },
      createdAt: new Date().toISOString(),
      paidAt: new Date().toISOString(),
      shippedAt: new Date().toISOString(),
      deliveredAt: new Date().toISOString(),
    });
  }),

  http.post('/api/orders/:id/complete', async ({ params }) => {
    return HttpResponse.json({
      id: params.id,
      status: 'COMPLETED',
      escrowReleased: true,
    });
  }),

  http.post('/api/orders/:id/dispute', async ({ params, request }) => {
    const body = await request.json();
    return HttpResponse.json({
      id: params.id,
      status: 'DISPUTED',
      dispute: { reason: body.reason },
    });
  }),

  // Reviews API
  http.get('/api/listings/:id/reviews', async () => {
    return HttpResponse.json({
      reviews: [
        {
          id: 'review-1',
          rating: 5,
          content: 'Great product!',
          reviewer: { name: 'John D.' },
          isVerifiedPurchase: true,
          createdAt: new Date().toISOString(),
        },
      ],
      averageRating: 4.5,
      totalReviews: 10,
    });
  }),

  http.post('/api/reviews', async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({
      id: 'review-new',
      ...body,
    }, { status: 201 });
  }),

  // Seller API
  http.get('/api/seller/dashboard', async () => {
    return HttpResponse.json({
      totalSales: 150,
      totalRevenue: 4500.00,
      pendingOrders: 5,
      averageRating: 4.7,
      recentOrders: [],
    });
  }),

  http.post('/api/seller/onboard', async () => {
    return HttpResponse.json({
      url: 'https://connect.stripe.com/onboard',
    });
  }),

  // Stripe webhook simulation
  http.post('/api/webhooks/stripe', async () => {
    return HttpResponse.json({ received: true });
  }),
];
```

### Unit Tests

```typescript
// tests/unit/components/listing-card.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ListingCard } from '@/components/listings/listing-card';

const mockListing = {
  id: 'listing-1',
  slug: 'test-product',
  title: 'Test Product',
  price: 29.99,
  comparePrice: 39.99,
  currency: 'USD',
  images: ['https://example.com/image.jpg'],
  freeShipping: true,
  seller: {
    storeName: 'Test Store',
    storeSlug: 'test-store',
    isVerified: true,
    averageRating: 4.5,
  },
  _count: {
    reviews: 25,
  },
};

describe('ListingCard', () => {
  it('renders listing information correctly', () => {
    render(<ListingCard listing={mockListing} />);
    
    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText('Test Store')).toBeInTheDocument();
    expect(screen.getByText('$29.99')).toBeInTheDocument();
  });

  it('shows discount badge when comparePrice exists', () => {
    render(<ListingCard listing={mockListing} />);
    
    expect(screen.getByText('-25%')).toBeInTheDocument();
    expect(screen.getByText('$39.99')).toBeInTheDocument();
  });

  it('shows free shipping badge', () => {
    render(<ListingCard listing={mockListing} />);
    
    expect(screen.getByText('Free Shipping')).toBeInTheDocument();
  });

  it('shows verified seller badge', () => {
    render(<ListingCard listing={mockListing} />);
    
    // Verified checkmark should be present
    expect(document.querySelector('svg')).toBeInTheDocument();
  });

  it('displays rating and review count', () => {
    render(<ListingCard listing={mockListing} />);
    
    expect(screen.getByText('4.5')).toBeInTheDocument();
    expect(screen.getByText('(25)')).toBeInTheDocument();
  });

  it('handles favorite button click', async () => {
    const user = userEvent.setup();
    const onFavorite = vi.fn();
    
    render(<ListingCard listing={mockListing} onFavorite={onFavorite} />);
    
    const favoriteButton = screen.getByRole('button', { name: /favorite/i });
    await user.click(favoriteButton);
    
    expect(onFavorite).toHaveBeenCalledWith('listing-1');
  });

  it('links to listing detail page', () => {
    render(<ListingCard listing={mockListing} />);
    
    const link = screen.getByRole('link', { name: /test product/i });
    expect(link).toHaveAttribute('href', '/listing/listing-1');
  });

  it('links to seller store page', () => {
    render(<ListingCard listing={mockListing} />);
    
    const storeLink = screen.getByRole('link', { name: /test store/i });
    expect(storeLink).toHaveAttribute('href', '/shop/test-store');
  });
});
```

```typescript
// tests/unit/components/cart-drawer.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CartDrawer } from '@/components/cart/cart-drawer';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('CartDrawer', () => {
  it('shows cart item count badge', async () => {
    render(<CartDrawer />, { wrapper: createWrapper() });
    
    await waitFor(() => {
      expect(screen.getByText('2')).toBeInTheDocument(); // 2 items in mock
    });
  });

  it('opens drawer on click', async () => {
    const user = userEvent.setup();
    render(<CartDrawer />, { wrapper: createWrapper() });
    
    await user.click(screen.getByRole('button'));
    
    await waitFor(() => {
      expect(screen.getByText('Shopping Cart (2)')).toBeInTheDocument();
    });
  });

  it('displays cart items', async () => {
    const user = userEvent.setup();
    render(<CartDrawer />, { wrapper: createWrapper() });
    
    await user.click(screen.getByRole('button'));
    
    await waitFor(() => {
      expect(screen.getByText('Test Product')).toBeInTheDocument();
      expect(screen.getByText('Test Store')).toBeInTheDocument();
    });
  });

  it('shows subtotal', async () => {
    const user = userEvent.setup();
    render(<CartDrawer />, { wrapper: createWrapper() });
    
    await user.click(screen.getByRole('button'));
    
    await waitFor(() => {
      expect(screen.getByText('$59.98')).toBeInTheDocument();
    });
  });

  it('updates quantity on button click', async () => {
    const user = userEvent.setup();
    render(<CartDrawer />, { wrapper: createWrapper() });
    
    await user.click(screen.getByRole('button'));
    
    await waitFor(() => {
      expect(screen.getByText('2')).toBeInTheDocument();
    });
    
    const increaseButton = screen.getAllByRole('button').find(
      btn => btn.querySelector('[data-icon="plus"]')
    );
    
    if (increaseButton) {
      await user.click(increaseButton);
    }
  });

  it('removes item from cart', async () => {
    const user = userEvent.setup();
    render(<CartDrawer />, { wrapper: createWrapper() });
    
    await user.click(screen.getByRole('button'));
    
    await waitFor(() => {
      expect(screen.getByText('Test Product')).toBeInTheDocument();
    });
    
    const removeButton = screen.getByRole('button', { name: /remove/i });
    await user.click(removeButton);
  });

  it('shows empty cart message when no items', async () => {
    // This would need a modified mock handler
  });

  it('has checkout button linking to checkout page', async () => {
    const user = userEvent.setup();
    render(<CartDrawer />, { wrapper: createWrapper() });
    
    await user.click(screen.getByRole('button'));
    
    await waitFor(() => {
      const checkoutLink = screen.getByRole('link', { name: /proceed to checkout/i });
      expect(checkoutLink).toHaveAttribute('href', '/checkout');
    });
  });
});
```

```typescript
// tests/unit/components/order-timeline.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { OrderTimeline } from '@/components/orders/order-timeline';

describe('OrderTimeline', () => {
  it('renders pending order correctly', () => {
    const order = {
      status: 'PENDING',
      createdAt: '2025-01-15T10:00:00Z',
      paidAt: null,
      shippedAt: null,
      deliveredAt: null,
      completedAt: null,
      cancelledAt: null,
    };
    
    render(<OrderTimeline order={order} />);
    
    expect(screen.getByText('Order Placed')).toBeInTheDocument();
    expect(screen.getByText('Payment Confirmed')).toBeInTheDocument();
  });

  it('shows completed steps with dates', () => {
    const order = {
      status: 'SHIPPED',
      createdAt: '2025-01-15T10:00:00Z',
      paidAt: '2025-01-15T10:05:00Z',
      shippedAt: '2025-01-16T14:00:00Z',
      deliveredAt: null,
      completedAt: null,
      cancelledAt: null,
    };
    
    render(<OrderTimeline order={order} />);
    
    expect(screen.getByText('Jan 15, 2025')).toBeInTheDocument();
    expect(screen.getByText('Jan 16, 2025')).toBeInTheDocument();
  });

  it('displays cancelled order status', () => {
    const order = {
      status: 'CANCELLED',
      createdAt: '2025-01-15T10:00:00Z',
      paidAt: null,
      shippedAt: null,
      deliveredAt: null,
      completedAt: null,
      cancelledAt: '2025-01-15T12:00:00Z',
    };
    
    render(<OrderTimeline order={order} />);
    
    expect(screen.getByText('Cancelled')).toBeInTheDocument();
  });

  it('displays disputed order status', () => {
    const order = {
      status: 'DISPUTED',
      createdAt: '2025-01-15T10:00:00Z',
      paidAt: '2025-01-15T10:05:00Z',
      shippedAt: null,
      deliveredAt: null,
      completedAt: null,
      cancelledAt: null,
    };
    
    render(<OrderTimeline order={order} />);
    
    expect(screen.getByText('Disputed')).toBeInTheDocument();
  });

  it('highlights current step', () => {
    const order = {
      status: 'PROCESSING',
      createdAt: '2025-01-15T10:00:00Z',
      paidAt: '2025-01-15T10:05:00Z',
      shippedAt: null,
      deliveredAt: null,
      completedAt: null,
      cancelledAt: null,
    };
    
    render(<OrderTimeline order={order} />);
    
    expect(screen.getByText('In progress...')).toBeInTheDocument();
  });
});
```

```typescript
// tests/unit/lib/escrow.test.ts
import { describe, it, expect, vi } from 'vitest';
import { 
  calculatePlatformFee, 
  calculateSellerPayout,
  validateEscrowRelease,
  canReleaseEscrow,
} from '@/lib/escrow';

describe('Escrow Calculations', () => {
  describe('calculatePlatformFee', () => {
    it('calculates 10% platform fee', () => {
      expect(calculatePlatformFee(100)).toBe(10);
      expect(calculatePlatformFee(59.99)).toBeCloseTo(6.00, 1);
    });

    it('handles zero amount', () => {
      expect(calculatePlatformFee(0)).toBe(0);
    });
  });

  describe('calculateSellerPayout', () => {
    it('calculates seller amount minus platform fee', () => {
      expect(calculateSellerPayout(100)).toBe(90);
      expect(calculateSellerPayout(50)).toBe(45);
    });

    it('handles decimal amounts correctly', () => {
      expect(calculateSellerPayout(29.99)).toBeCloseTo(26.99, 1);
    });
  });

  describe('canReleaseEscrow', () => {
    it('returns true for delivered orders', () => {
      const order = { status: 'DELIVERED', escrowReleased: false };
      expect(canReleaseEscrow(order)).toBe(true);
    });

    it('returns false for non-delivered orders', () => {
      const order = { status: 'SHIPPED', escrowReleased: false };
      expect(canReleaseEscrow(order)).toBe(false);
    });

    it('returns false if escrow already released', () => {
      const order = { status: 'DELIVERED', escrowReleased: true };
      expect(canReleaseEscrow(order)).toBe(false);
    });

    it('returns false for disputed orders', () => {
      const order = { status: 'DISPUTED', escrowReleased: false };
      expect(canReleaseEscrow(order)).toBe(false);
    });
  });

  describe('validateEscrowRelease', () => {
    it('validates buyer ownership', async () => {
      const order = { buyerId: 'user-1', status: 'DELIVERED' };
      const userId = 'user-2';
      
      await expect(validateEscrowRelease(order, userId)).rejects.toThrow('Forbidden');
    });

    it('validates order status', async () => {
      const order = { buyerId: 'user-1', status: 'SHIPPED' };
      const userId = 'user-1';
      
      await expect(validateEscrowRelease(order, userId)).rejects.toThrow(
        'Order must be delivered'
      );
    });

    it('passes validation for valid release', async () => {
      const order = { buyerId: 'user-1', status: 'DELIVERED', escrowReleased: false };
      const userId = 'user-1';
      
      await expect(validateEscrowRelease(order, userId)).resolves.toBe(true);
    });
  });
});
```

```typescript
// tests/unit/lib/pricing.test.ts
import { describe, it, expect } from 'vitest';
import { 
  calculateOrderTotal,
  calculateShipping,
  calculateTax,
  formatPrice,
} from '@/lib/pricing';

describe('Pricing Calculations', () => {
  describe('calculateOrderTotal', () => {
    it('calculates correct total with multiple items', () => {
      const items = [
        { price: 29.99, quantity: 2 },
        { price: 49.99, quantity: 1 },
      ];
      
      expect(calculateOrderTotal(items)).toBeCloseTo(109.97, 2);
    });

    it('handles empty cart', () => {
      expect(calculateOrderTotal([])).toBe(0);
    });
  });

  describe('calculateShipping', () => {
    it('returns 0 for free shipping items', () => {
      const items = [{ freeShipping: true, shippingPrice: 5.99 }];
      expect(calculateShipping(items)).toBe(0);
    });

    it('uses item shipping price when set', () => {
      const items = [{ freeShipping: false, shippingPrice: 7.99 }];
      expect(calculateShipping(items)).toBe(7.99);
    });

    it('uses default shipping when not set', () => {
      const items = [{ freeShipping: false, shippingPrice: null }];
      expect(calculateShipping(items)).toBe(5.00); // Default
    });

    it('sums shipping for multiple sellers', () => {
      const items = [
        { freeShipping: false, shippingPrice: 5.00, sellerId: 'a' },
        { freeShipping: false, shippingPrice: 4.00, sellerId: 'b' },
      ];
      expect(calculateShipping(items)).toBe(9.00);
    });
  });

  describe('calculateTax', () => {
    it('calculates 8% tax by default', () => {
      expect(calculateTax(100)).toBe(8);
      expect(calculateTax(50)).toBe(4);
    });

    it('accepts custom tax rate', () => {
      expect(calculateTax(100, 0.1)).toBe(10);
    });
  });

  describe('formatPrice', () => {
    it('formats USD correctly', () => {
      expect(formatPrice(29.99, 'USD')).toBe('$29.99');
    });

    it('formats EUR correctly', () => {
      expect(formatPrice(29.99, 'EUR')).toMatch(/€|EUR/);
    });

    it('handles zero', () => {
      expect(formatPrice(0, 'USD')).toBe('$0.00');
    });
  });
});
```

### Integration Tests

```typescript
// tests/integration/checkout-flow.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import CheckoutPage from '@/app/(buyer)/checkout/page';
import { server } from '../mocks/server';
import { http, HttpResponse } from 'msw';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('Checkout Flow Integration', () => {
  it('displays cart items in checkout', async () => {
    render(<CheckoutPage />, { wrapper: createWrapper() });
    
    await waitFor(() => {
      expect(screen.getByText('Test Product')).toBeInTheDocument();
      expect(screen.getByText('$59.98')).toBeInTheDocument();
    });
  });

  it('shows shipping address form', async () => {
    render(<CheckoutPage />, { wrapper: createWrapper() });
    
    await waitFor(() => {
      expect(screen.getByLabelText(/street address/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/city/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/postal code/i)).toBeInTheDocument();
    });
  });

  it('validates shipping address before payment', async () => {
    const user = userEvent.setup();
    render(<CheckoutPage />, { wrapper: createWrapper() });
    
    await waitFor(() => {
      expect(screen.getByText('Place Order')).toBeInTheDocument();
    });
    
    await user.click(screen.getByText('Place Order'));
    
    await waitFor(() => {
      expect(screen.getByText(/address is required/i)).toBeInTheDocument();
    });
  });

  it('creates order with valid data', async () => {
    const user = userEvent.setup();
    render(<CheckoutPage />, { wrapper: createWrapper() });
    
    await waitFor(() => {
      expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    });
    
    // Fill shipping address
    await user.type(screen.getByLabelText(/name/i), 'John Doe');
    await user.type(screen.getByLabelText(/street address/i), '123 Main St');
    await user.type(screen.getByLabelText(/city/i), 'Anytown');
    await user.type(screen.getByLabelText(/state/i), 'CA');
    await user.type(screen.getByLabelText(/postal code/i), '12345');
    
    await user.click(screen.getByText('Place Order'));
    
    await waitFor(() => {
      // Payment element should appear
      expect(screen.getByTestId('payment-element')).toBeInTheDocument();
    });
  });

  it('handles payment failure gracefully', async () => {
    server.use(
      http.post('/api/orders', () => {
        return HttpResponse.json(
          { error: 'Payment failed' },
          { status: 400 }
        );
      })
    );

    const user = userEvent.setup();
    render(<CheckoutPage />, { wrapper: createWrapper() });
    
    // Fill and submit form...
    await waitFor(() => {
      expect(screen.getByText(/payment failed/i)).toBeInTheDocument();
    });
  });
});
```

```typescript
// tests/integration/seller-dashboard.test.tsx
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import SellerDashboard from '@/app/(seller)/seller/page';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('Seller Dashboard Integration', () => {
  it('displays seller statistics', async () => {
    render(<SellerDashboard />, { wrapper: createWrapper() });
    
    await waitFor(() => {
      expect(screen.getByText('150')).toBeInTheDocument(); // Total sales
      expect(screen.getByText('$4,500.00')).toBeInTheDocument(); // Revenue
      expect(screen.getByText('4.7')).toBeInTheDocument(); // Rating
    });
  });

  it('shows pending orders count', async () => {
    render(<SellerDashboard />, { wrapper: createWrapper() });
    
    await waitFor(() => {
      expect(screen.getByText('5 Pending')).toBeInTheDocument();
    });
  });

  it('navigates to create listing', async () => {
    const user = userEvent.setup();
    render(<SellerDashboard />, { wrapper: createWrapper() });
    
    await waitFor(() => {
      expect(screen.getByText('Create Listing')).toBeInTheDocument();
    });
    
    const createButton = screen.getByRole('link', { name: /create listing/i });
    expect(createButton).toHaveAttribute('href', '/seller/listings/new');
  });
});
```

```typescript
// tests/integration/order-completion.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import OrderDetailPage from '@/app/(buyer)/orders/[orderId]/page';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('Order Completion Integration', () => {
  it('shows confirm delivery button for delivered orders', async () => {
    render(<OrderDetailPage params={{ orderId: 'order-1' }} />, { 
      wrapper: createWrapper() 
    });
    
    await waitFor(() => {
      expect(screen.getByText('Confirm Delivery')).toBeInTheDocument();
    });
  });

  it('confirms delivery and releases escrow', async () => {
    const user = userEvent.setup();
    render(<OrderDetailPage params={{ orderId: 'order-1' }} />, { 
      wrapper: createWrapper() 
    });
    
    await waitFor(() => {
      expect(screen.getByText('Confirm Delivery')).toBeInTheDocument();
    });
    
    await user.click(screen.getByText('Confirm Delivery'));
    
    // Confirmation dialog
    await waitFor(() => {
      expect(screen.getByText(/release payment to seller/i)).toBeInTheDocument();
    });
    
    await user.click(screen.getByText('Confirm'));
    
    await waitFor(() => {
      expect(screen.getByText('Order Completed')).toBeInTheDocument();
    });
  });

  it('allows opening dispute', async () => {
    const user = userEvent.setup();
    render(<OrderDetailPage params={{ orderId: 'order-1' }} />, { 
      wrapper: createWrapper() 
    });
    
    await waitFor(() => {
      expect(screen.getByText('Report Issue')).toBeInTheDocument();
    });
    
    await user.click(screen.getByText('Report Issue'));
    
    await waitFor(() => {
      expect(screen.getByLabelText(/reason for dispute/i)).toBeInTheDocument();
    });
  });
});
```

### API Route Tests

```typescript
// tests/api/orders.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '@/app/api/orders/route';
import { NextRequest } from 'next/server';

vi.mock('@/lib/auth', () => ({
  getServerSession: vi.fn().mockResolvedValue({ user: { id: 'user-123' } }),
}));

vi.mock('@/lib/prisma', () => ({
  prisma: {
    cartItem: {
      findMany: vi.fn().mockResolvedValue([
        {
          quantity: 2,
          listing: {
            id: 'listing-1',
            title: 'Test',
            price: 29.99,
            sellerId: 'seller-1',
            images: ['img.jpg'],
            freeShipping: false,
            shippingPrice: 5.00,
            seller: { stripeAccountId: 'acct_xxx' },
          },
        },
      ]),
      deleteMany: vi.fn(),
    },
    order: {
      create: vi.fn().mockResolvedValue({
        id: 'order-123',
        orderNumber: 'ORD-ABC123',
      }),
      update: vi.fn(),
    },
  },
}));

vi.mock('@/lib/stripe', () => ({
  stripe: {
    paymentIntents: {
      create: vi.fn().mockResolvedValue({
        id: 'pi_xxx',
        client_secret: 'pi_xxx_secret',
      }),
    },
  },
}));

describe('Orders API Route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates order with correct totals', async () => {
    const { prisma } = await import('@/lib/prisma');
    
    const request = new NextRequest('http://localhost/api/orders', {
      method: 'POST',
      body: JSON.stringify({
        shippingAddress: {
          name: 'John Doe',
          line1: '123 Main St',
          city: 'Anytown',
          state: 'CA',
          postalCode: '12345',
          country: 'US',
        },
      }),
    });
    
    const response = await POST(request);
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data.orderId).toBe('order-123');
    expect(data.clientSecret).toBe('pi_xxx_secret');
    
    // Verify order was created with correct data
    expect(prisma.order.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        buyerId: 'user-123',
        subtotal: 59.98, // 29.99 * 2
      }),
    });
  });

  it('returns 400 for empty cart', async () => {
    const { prisma } = await import('@/lib/prisma');
    (prisma.cartItem.findMany as any).mockResolvedValueOnce([]);
    
    const request = new NextRequest('http://localhost/api/orders', {
      method: 'POST',
      body: JSON.stringify({ shippingAddress: {} }),
    });
    
    const response = await POST(request);
    
    expect(response.status).toBe(400);
  });

  it('validates shipping address', async () => {
    const request = new NextRequest('http://localhost/api/orders', {
      method: 'POST',
      body: JSON.stringify({
        shippingAddress: {
          name: '', // Empty name
        },
      }),
    });
    
    const response = await POST(request);
    
    expect(response.status).toBe(400);
  });

  it('clears cart after order creation', async () => {
    const { prisma } = await import('@/lib/prisma');
    
    const request = new NextRequest('http://localhost/api/orders', {
      method: 'POST',
      body: JSON.stringify({
        shippingAddress: {
          name: 'John Doe',
          line1: '123 Main St',
          city: 'Anytown',
          state: 'CA',
          postalCode: '12345',
          country: 'US',
        },
      }),
    });
    
    await POST(request);
    
    expect(prisma.cartItem.deleteMany).toHaveBeenCalledWith({
      where: { userId: 'user-123' },
    });
  });
});
```

```typescript
// tests/api/escrow-release.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '@/app/api/orders/[orderId]/complete/route';
import { NextRequest } from 'next/server';

vi.mock('@/lib/auth', () => ({
  getServerSession: vi.fn().mockResolvedValue({ user: { id: 'buyer-123' } }),
}));

const mockOrder = {
  id: 'order-123',
  buyerId: 'buyer-123',
  status: 'DELIVERED',
  items: [
    {
      sellerId: 'seller-1',
      price: 50.00,
      quantity: 2,
      listing: {
        seller: {
          stripeAccountId: 'acct_seller1',
        },
      },
    },
  ],
};

vi.mock('@/lib/prisma', () => ({
  prisma: {
    order: {
      findUnique: vi.fn().mockResolvedValue(mockOrder),
      update: vi.fn().mockResolvedValue({ ...mockOrder, status: 'COMPLETED' }),
    },
    sellerProfile: {
      update: vi.fn(),
    },
  },
}));

vi.mock('@/lib/stripe', () => ({
  stripe: {
    transfers: {
      create: vi.fn().mockResolvedValue({ id: 'tr_xxx' }),
    },
  },
}));

describe('Escrow Release API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('transfers funds to seller with platform fee deducted', async () => {
    const { stripe } = await import('@/lib/stripe');
    
    const request = new NextRequest('http://localhost/api/orders/order-123/complete', {
      method: 'POST',
    });
    
    await POST(request, { params: Promise.resolve({ orderId: 'order-123' }) });
    
    // 10% platform fee: $100 * 0.90 = $90 = 9000 cents
    expect(stripe.transfers.create).toHaveBeenCalledWith({
      amount: 9000,
      currency: 'usd',
      destination: 'acct_seller1',
      metadata: expect.objectContaining({
        orderId: 'order-123',
        sellerId: 'seller-1',
      }),
    });
  });

  it('updates order to completed status', async () => {
    const { prisma } = await import('@/lib/prisma');
    
    const request = new NextRequest('http://localhost/api/orders/order-123/complete', {
      method: 'POST',
    });
    
    await POST(request, { params: Promise.resolve({ orderId: 'order-123' }) });
    
    expect(prisma.order.update).toHaveBeenCalledWith({
      where: { id: 'order-123' },
      data: expect.objectContaining({
        status: 'COMPLETED',
        escrowReleased: true,
      }),
    });
  });

  it('updates seller statistics', async () => {
    const { prisma } = await import('@/lib/prisma');
    
    const request = new NextRequest('http://localhost/api/orders/order-123/complete', {
      method: 'POST',
    });
    
    await POST(request, { params: Promise.resolve({ orderId: 'order-123' }) });
    
    expect(prisma.sellerProfile.update).toHaveBeenCalledWith({
      where: { id: 'seller-1' },
      data: expect.objectContaining({
        totalSales: { increment: 1 },
      }),
    });
  });

  it('returns 403 if not order buyer', async () => {
    const { getServerSession } = await import('@/lib/auth');
    (getServerSession as any).mockResolvedValueOnce({ user: { id: 'other-user' } });
    
    const request = new NextRequest('http://localhost/api/orders/order-123/complete', {
      method: 'POST',
    });
    
    const response = await POST(request, { params: Promise.resolve({ orderId: 'order-123' }) });
    
    expect(response.status).toBe(403);
  });

  it('returns 400 if order not delivered', async () => {
    const { prisma } = await import('@/lib/prisma');
    (prisma.order.findUnique as any).mockResolvedValueOnce({
      ...mockOrder,
      status: 'SHIPPED',
    });
    
    const request = new NextRequest('http://localhost/api/orders/order-123/complete', {
      method: 'POST',
    });
    
    const response = await POST(request, { params: Promise.resolve({ orderId: 'order-123' }) });
    
    expect(response.status).toBe(400);
  });
});
```

### E2E Tests (Playwright)

```typescript
// tests/e2e/marketplace-buyer.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Marketplace Buyer Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('searches and filters listings', async ({ page }) => {
    // Search for product
    await page.fill('[placeholder*="Search"]', 'vintage');
    await page.keyboard.press('Enter');
    
    await expect(page).toHaveURL(/search.*q=vintage/);
    
    // Apply category filter
    await page.click('text=Electronics');
    await expect(page.locator('.listing-card')).toHaveCount(await page.locator('.listing-card').count());
    
    // Apply price filter
    await page.fill('[name="minPrice"]', '10');
    await page.fill('[name="maxPrice"]', '100');
    await page.click('text=Apply');
    
    // Verify filter applied
    await expect(page).toHaveURL(/minPrice=10.*maxPrice=100/);
  });

  test('views listing detail', async ({ page }) => {
    await page.goto('/search?q=test');
    
    await page.click('.listing-card >> nth=0');
    
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('[data-testid="price"]')).toBeVisible();
    await expect(page.locator('[data-testid="seller-info"]')).toBeVisible();
    await expect(page.locator('[data-testid="add-to-cart"]')).toBeVisible();
  });

  test('adds item to cart', async ({ page }) => {
    await page.goto('/listing/test-listing');
    
    await page.click('[data-testid="add-to-cart"]');
    
    // Toast notification
    await expect(page.locator('text=Added to cart')).toBeVisible();
    
    // Cart badge updates
    await expect(page.locator('[data-testid="cart-badge"]')).toContainText('1');
  });

  test('completes checkout flow', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('[name="email"]', 'buyer@example.com');
    await page.fill('[name="password"]', 'password');
    await page.click('button[type="submit"]');
    
    // Add to cart
    await page.goto('/listing/test-listing');
    await page.click('[data-testid="add-to-cart"]');
    
    // Go to checkout
    await page.goto('/checkout');
    
    // Fill shipping address
    await page.fill('[name="name"]', 'John Doe');
    await page.fill('[name="line1"]', '123 Main St');
    await page.fill('[name="city"]', 'Anytown');
    await page.fill('[name="state"]', 'CA');
    await page.fill('[name="postalCode"]', '12345');
    await page.selectOption('[name="country"]', 'US');
    
    // Submit order
    await page.click('text=Place Order');
    
    // Payment step
    await expect(page.locator('[data-testid="payment-element"]')).toBeVisible();
    
    // Use test card
    const stripe = page.frameLocator('iframe[name*="stripe"]');
    await stripe.locator('[name="cardnumber"]').fill('4242424242424242');
    await stripe.locator('[name="exp-date"]').fill('12/25');
    await stripe.locator('[name="cvc"]').fill('123');
    await stripe.locator('[name="postal"]').fill('12345');
    
    await page.click('text=Pay');
    
    // Success page
    await expect(page).toHaveURL(/orders\/.*success/);
    await expect(page.locator('text=Order Confirmed')).toBeVisible();
  });

  test('views order history', async ({ page }) => {
    await page.goto('/login');
    await page.fill('[name="email"]', 'buyer@example.com');
    await page.fill('[name="password"]', 'password');
    await page.click('button[type="submit"]');
    
    await page.goto('/orders');
    
    await expect(page.locator('.order-card')).toHaveCount(await page.locator('.order-card').count());
  });

  test('confirms delivery and releases escrow', async ({ page }) => {
    await page.goto('/login');
    await page.fill('[name="email"]', 'buyer@example.com');
    await page.fill('[name="password"]', 'password');
    await page.click('button[type="submit"]');
    
    // Go to delivered order
    await page.goto('/orders/delivered-order-id');
    
    await page.click('text=Confirm Delivery');
    
    // Confirmation dialog
    await expect(page.locator('text=This will release payment')).toBeVisible();
    await page.click('text=Confirm');
    
    await expect(page.locator('text=Order Completed')).toBeVisible();
  });

  test('opens dispute for order', async ({ page }) => {
    await page.goto('/login');
    await page.fill('[name="email"]', 'buyer@example.com');
    await page.fill('[name="password"]', 'password');
    await page.click('button[type="submit"]');
    
    await page.goto('/orders/delivered-order-id');
    
    await page.click('text=Report Issue');
    
    await page.selectOption('[name="reason"]', 'NOT_AS_DESCRIBED');
    await page.fill('[name="description"]', 'Product does not match listing');
    await page.click('text=Submit Dispute');
    
    await expect(page.locator('text=Dispute Submitted')).toBeVisible();
  });
});

test.describe('Marketplace Seller Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('[name="email"]', 'seller@example.com');
    await page.fill('[name="password"]', 'password');
    await page.click('button[type="submit"]');
  });

  test('creates new listing', async ({ page }) => {
    await page.goto('/seller/listings/new');
    
    // Basic info
    await page.fill('[name="title"]', 'Vintage Camera');
    await page.fill('[name="description"]', 'Beautiful vintage camera in great condition');
    await page.fill('[name="price"]', '149.99');
    await page.selectOption('[name="categoryId"]', 'electronics');
    
    // Upload images
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'camera.jpg',
      mimeType: 'image/jpeg',
      buffer: Buffer.from('fake-image-data'),
    });
    
    // Shipping
    await page.fill('[name="weight"]', '0.5');
    await page.fill('[name="shippingPrice"]', '7.99');
    
    await page.click('text=Publish Listing');
    
    await expect(page).toHaveURL(/seller\/listings/);
    await expect(page.locator('text=Listing published')).toBeVisible();
  });

  test('views seller dashboard', async ({ page }) => {
    await page.goto('/seller');
    
    await expect(page.locator('[data-testid="total-sales"]')).toBeVisible();
    await expect(page.locator('[data-testid="total-revenue"]')).toBeVisible();
    await expect(page.locator('[data-testid="pending-orders"]')).toBeVisible();
  });

  test('processes order shipment', async ({ page }) => {
    await page.goto('/seller/orders');
    
    // Click on pending order
    await page.click('.order-row[data-status="PAID"] >> nth=0');
    
    await page.click('text=Mark as Shipped');
    await page.fill('[name="trackingNumber"]', 'TRACK123456');
    await page.selectOption('[name="carrier"]', 'USPS');
    await page.click('text=Confirm Shipment');
    
    await expect(page.locator('text=Order shipped')).toBeVisible();
  });

  test('responds to review', async ({ page }) => {
    await page.goto('/seller/reviews');
    
    await page.click('.review-card >> nth=0 >> text=Respond');
    await page.fill('[name="response"]', 'Thank you for your feedback!');
    await page.click('text=Submit Response');
    
    await expect(page.locator('text=Response submitted')).toBeVisible();
  });
});

test.describe('Messaging', () => {
  test('buyer messages seller about listing', async ({ page }) => {
    await page.goto('/login');
    await page.fill('[name="email"]', 'buyer@example.com');
    await page.fill('[name="password"]', 'password');
    await page.click('button[type="submit"]');
    
    await page.goto('/listing/test-listing');
    
    await page.click('text=Contact Seller');
    
    await page.fill('[name="message"]', 'Is this item still available?');
    await page.click('text=Send');
    
    await expect(page.locator('text=Message sent')).toBeVisible();
  });

  test('seller replies to message', async ({ page }) => {
    await page.goto('/login');
    await page.fill('[name="email"]', 'seller@example.com');
    await page.fill('[name="password"]', 'password');
    await page.click('button[type="submit"]');
    
    await page.goto('/seller/messages');
    
    await page.click('.conversation >> nth=0');
    
    await page.fill('[name="reply"]', 'Yes, it is still available!');
    await page.click('text=Send');
    
    await expect(page.locator('text=Yes, it is still available!')).toBeVisible();
  });
});

test.describe('Mobile Experience', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('mobile navigation works', async ({ page }) => {
    await page.goto('/');
    
    await page.click('[data-testid="mobile-menu-button"]');
    await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible();
    
    await page.click('text=Categories');
    await expect(page.locator('.category-list')).toBeVisible();
  });

  test('mobile cart drawer works', async ({ page }) => {
    await page.goto('/');
    
    await page.click('[data-testid="cart-button"]');
    await expect(page.locator('[data-testid="cart-drawer"]')).toBeVisible();
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
    ['json', { outputFile: 'test-results/results.json' }],
  ],
  use: {
    baseURL: process.env.TEST_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 12'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

## Error Handling

### Error Boundary

```typescript
// components/error-boundary.tsx
'use client';

import { Component, ReactNode } from 'react';
import * as Sentry from '@sentry/nextjs';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
    Sentry.captureException(error, {
      extra: { componentStack: errorInfo.componentStack },
      tags: { component: 'Marketplace' },
    });
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div role="alert" className="flex flex-col items-center justify-center p-8 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
          <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-xl font-semibold text-red-800 dark:text-red-200 mb-2">
            Something went wrong
          </h2>
          <p className="text-red-600 dark:text-red-300 mb-4 text-center max-w-md">
            {this.state.error?.message || 'An unexpected error occurred'}
          </p>
          <div className="flex gap-2">
            <Button
              onClick={() => this.setState({ hasError: false })}
              variant="destructive"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Try again
            </Button>
            <Button variant="outline" asChild>
              <a href="/">
                <Home className="mr-2 h-4 w-4" />
                Go home
              </a>
            </Button>
          </div>
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
import { AlertCircle, Home, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full text-center">
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-red-100 dark:bg-red-900 rounded-full">
            <AlertCircle className="h-12 w-12 text-red-600 dark:text-red-400" />
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Something went wrong
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          We're working on fixing this issue.
        </p>
        
        {error.digest && (
          <p className="text-sm text-gray-500 mb-6 font-mono">
            Error ID: {error.digest}
          </p>
        )}
        
        <div className="flex justify-center gap-4">
          <Button onClick={reset}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Try again
          </Button>
          <Button variant="outline" asChild>
            <a href="/">
              <Home className="mr-2 h-4 w-4" />
              Go home
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}
```

### Marketplace-Specific Errors

```typescript
// lib/errors/marketplace-errors.ts
import * as Sentry from '@sentry/nextjs';

export class MarketplaceError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = 'MarketplaceError';
  }

  toJSON() {
    return {
      error: {
        message: this.message,
        code: this.code,
        details: this.details,
      },
    };
  }
}

// Payment errors
export class PaymentError extends MarketplaceError {
  constructor(message: string, stripeError?: any) {
    super(message, 'PAYMENT_ERROR', 400, { stripeError: stripeError?.code });
    this.name = 'PaymentError';
  }
}

// Escrow errors
export class EscrowError extends MarketplaceError {
  constructor(message: string, orderId: string) {
    super(message, 'ESCROW_ERROR', 400, { orderId });
    this.name = 'EscrowError';
  }
}

// Inventory errors
export class InsufficientInventoryError extends MarketplaceError {
  constructor(listingId: string, requested: number, available: number) {
    super(
      `Insufficient inventory for listing ${listingId}`,
      'INSUFFICIENT_INVENTORY',
      400,
      { listingId, requested, available }
    );
    this.name = 'InsufficientInventoryError';
  }
}

// Seller errors
export class SellerNotVerifiedError extends MarketplaceError {
  constructor(sellerId: string) {
    super('Seller is not verified', 'SELLER_NOT_VERIFIED', 403, { sellerId });
    this.name = 'SellerNotVerifiedError';
  }
}

export class SellerNotOnboardedError extends MarketplaceError {
  constructor(sellerId: string) {
    super('Seller has not completed payment onboarding', 'SELLER_NOT_ONBOARDED', 400, { sellerId });
    this.name = 'SellerNotOnboardedError';
  }
}

// Dispute errors
export class DisputeError extends MarketplaceError {
  constructor(message: string, orderId: string) {
    super(message, 'DISPUTE_ERROR', 400, { orderId });
    this.name = 'DisputeError';
  }
}

// Error handler
export function handleMarketplaceError(error: unknown): Response {
  console.error('[Marketplace Error]', error);

  if (error instanceof MarketplaceError) {
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
```

### React Query Error Handling

```typescript
// lib/query-client.ts
import { QueryClient, QueryCache, MutationCache } from '@tanstack/react-query';
import { toast } from 'sonner';
import { MarketplaceError, PaymentError } from './errors/marketplace-errors';

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error, query) => {
      if (query.meta?.showErrorToast !== false) {
        const message = error instanceof MarketplaceError 
          ? error.message 
          : 'Failed to load data';
        toast.error(message);
      }
    },
  }),
  mutationCache: new MutationCache({
    onError: (error) => {
      if (error instanceof PaymentError) {
        toast.error('Payment failed. Please try again or use a different payment method.');
      } else if (error instanceof MarketplaceError) {
        toast.error(error.message);
      } else {
        toast.error('An error occurred');
      }
    },
  }),
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        if (error instanceof MarketplaceError && error.statusCode < 500) {
          return false;
        }
        return failureCount < 3;
      },
      staleTime: 5 * 60 * 1000,
    },
  },
});
```

## Accessibility

### Accessibility Standards

This recipe implements WCAG 2.1 Level AA compliance:

| Criterion | Implementation |
|-----------|---------------|
| 1.1.1 Non-text Content | Product images have descriptive alt text |
| 1.3.1 Info and Relationships | Form labels, fieldsets for grouped inputs |
| 1.4.1 Use of Color | Status uses icons + text, not just color |
| 1.4.3 Contrast | 4.5:1 minimum for all text |
| 2.1.1 Keyboard | Full keyboard navigation for all features |
| 2.1.2 No Keyboard Trap | Modal dialogs properly trap and release focus |
| 2.4.1 Bypass Blocks | Skip links for main content |
| 2.4.4 Link Purpose | Clear link text, aria-labels where needed |
| 2.4.7 Focus Visible | Custom focus indicators |
| 3.2.2 On Input | No unexpected navigation on input |
| 4.1.2 Name, Role, Value | ARIA labels on custom components |
| 4.1.3 Status Messages | Cart updates, order status announced |

### Skip Links

```typescript
// components/skip-links.tsx
export function SkipLinks() {
  return (
    <div className="sr-only focus-within:not-sr-only">
      <a
        href="#main-content"
        className="absolute top-4 left-4 z-50 px-4 py-2 bg-primary text-primary-foreground rounded-lg focus:outline-none focus:ring-2"
      >
        Skip to main content
      </a>
      <a
        href="#search"
        className="absolute top-4 left-48 z-50 px-4 py-2 bg-primary text-primary-foreground rounded-lg focus:outline-none focus:ring-2"
      >
        Skip to search
      </a>
    </div>
  );
}
```

### Accessible Listing Card

```typescript
// components/listings/accessible-listing-card.tsx
import Link from 'next/link';
import Image from 'next/image';
import { Heart, Star, Truck, Check } from 'lucide-react';
import { formatPrice } from '@/lib/utils';

export function AccessibleListingCard({ listing }: { listing: any }) {
  return (
    <article
      className="group bg-white dark:bg-gray-900 rounded-xl overflow-hidden border hover:shadow-lg transition-all"
      aria-labelledby={`listing-${listing.id}-title`}
    >
      <Link href={`/listing/${listing.id}`} className="block">
        <div className="relative aspect-square">
          <Image
            src={listing.images[0] || '/placeholder.jpg'}
            alt={`${listing.title} - ${listing.seller.storeName}`}
            fill
            className="object-cover"
          />
          
          {/* Badges with screen reader text */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {listing.discount && (
              <span className="bg-red-500 text-white px-2 py-1 rounded text-sm">
                <span className="sr-only">Discount: </span>
                -{listing.discount}%
              </span>
            )}
            {listing.freeShipping && (
              <span className="bg-green-500 text-white px-2 py-1 rounded text-sm flex items-center gap-1">
                <Truck className="h-3 w-3" aria-hidden="true" />
                <span>Free Shipping</span>
              </span>
            )}
          </div>
        </div>
      </Link>

      <div className="p-3">
        {/* Seller with verification */}
        <Link
          href={`/shop/${listing.seller.storeSlug}`}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
        >
          {listing.seller.storeName}
          {listing.seller.isVerified && (
            <>
              <Check className="h-3.5 w-3.5 text-blue-500" aria-hidden="true" />
              <span className="sr-only">(Verified seller)</span>
            </>
          )}
        </Link>

        {/* Title */}
        <Link href={`/listing/${listing.id}`}>
          <h3 
            id={`listing-${listing.id}-title`}
            className="font-medium line-clamp-2 group-hover:text-blue-600"
          >
            {listing.title}
          </h3>
        </Link>

        {/* Rating */}
        {listing.reviewCount > 0 && (
          <div className="flex items-center gap-1 mt-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" aria-hidden="true" />
            <span className="text-sm">
              <span className="font-medium">{listing.rating.toFixed(1)}</span>
              <span className="sr-only"> out of 5 stars</span>
              <span className="text-gray-500"> ({listing.reviewCount} reviews)</span>
            </span>
          </div>
        )}

        {/* Price */}
        <div className="flex items-baseline gap-2 mt-2">
          <span className="text-lg font-bold">
            <span className="sr-only">Price: </span>
            {formatPrice(listing.price, listing.currency)}
          </span>
          {listing.comparePrice && (
            <span className="text-sm text-gray-500 line-through">
              <span className="sr-only">Original price: </span>
              {formatPrice(listing.comparePrice, listing.currency)}
            </span>
          )}
        </div>
      </div>

      {/* Favorite button */}
      <button
        className="absolute top-2 right-2 p-2 bg-white/80 rounded-full hover:bg-white"
        aria-label={`Add ${listing.title} to favorites`}
        onClick={(e) => {
          e.preventDefault();
          // Handle favorite
        }}
      >
        <Heart className="h-4 w-4" aria-hidden="true" />
      </button>
    </article>
  );
}
```

### Accessible Cart Announcements

```typescript
// components/cart/cart-announcer.tsx
'use client';

import { useEffect, useRef, useState } from 'react';

interface CartAnnouncerProps {
  itemCount: number;
  lastAction?: 'add' | 'remove' | 'update' | null;
  lastItemName?: string;
}

export function CartAnnouncer({ itemCount, lastAction, lastItemName }: CartAnnouncerProps) {
  const [message, setMessage] = useState('');
  const prevCount = useRef(itemCount);

  useEffect(() => {
    if (lastAction && lastItemName) {
      switch (lastAction) {
        case 'add':
          setMessage(`${lastItemName} added to cart. Cart now has ${itemCount} items.`);
          break;
        case 'remove':
          setMessage(`${lastItemName} removed from cart. Cart now has ${itemCount} items.`);
          break;
        case 'update':
          setMessage(`${lastItemName} quantity updated. Cart now has ${itemCount} items.`);
          break;
      }
    }
    
    prevCount.current = itemCount;
  }, [itemCount, lastAction, lastItemName]);

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="sr-only"
    >
      {message}
    </div>
  );
}
```

### Keyboard Navigation for Gallery

```typescript
// components/listings/keyboard-gallery.tsx
'use client';

import { useState, useCallback, useEffect } from 'react';
import Image from 'next/image';

export function KeyboardGallery({ images, title }: { images: string[]; title: string }) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault();
        setSelectedIndex((i) => (i > 0 ? i - 1 : images.length - 1));
        break;
      case 'ArrowRight':
        e.preventDefault();
        setSelectedIndex((i) => (i < images.length - 1 ? i + 1 : 0));
        break;
      case 'Home':
        e.preventDefault();
        setSelectedIndex(0);
        break;
      case 'End':
        e.preventDefault();
        setSelectedIndex(images.length - 1);
        break;
    }
  }, [images.length]);

  return (
    <div
      role="group"
      aria-label={`${title} image gallery, ${images.length} images`}
      onKeyDown={(e) => handleKeyDown(e.nativeEvent)}
      tabIndex={0}
      className="focus:outline-none focus:ring-2 focus:ring-primary rounded-xl"
    >
      <div className="relative aspect-square">
        <Image
          src={images[selectedIndex]}
          alt={`${title} - Image ${selectedIndex + 1} of ${images.length}`}
          fill
          className="object-contain rounded-xl"
        />
      </div>
      
      <p className="sr-only">
        Image {selectedIndex + 1} of {images.length}. 
        Use arrow keys to navigate, Home for first, End for last.
      </p>
      
      {/* Visible thumbnails */}
      <div className="flex gap-2 mt-4" role="tablist" aria-label="Image thumbnails">
        {images.map((img, i) => (
          <button
            key={i}
            role="tab"
            aria-selected={i === selectedIndex}
            aria-label={`View image ${i + 1}`}
            onClick={() => setSelectedIndex(i)}
            className={`w-16 h-16 rounded-lg overflow-hidden border-2 ${
              i === selectedIndex ? 'border-primary' : 'border-transparent'
            }`}
          >
            <Image src={img} alt="" fill className="object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
}
```

## Security

### Input Validation

```typescript
// lib/validations/listing.ts
import { z } from 'zod';

export const listingSchema = z.object({
  title: z.string()
    .min(5, 'Title must be at least 5 characters')
    .max(200, 'Title must be less than 200 characters')
    .regex(/^[^<>]*$/, 'Title contains invalid characters'),
  description: z.string()
    .min(20, 'Description must be at least 20 characters')
    .max(10000, 'Description must be less than 10,000 characters'),
  price: z.number()
    .positive('Price must be positive')
    .max(999999.99, 'Price exceeds maximum'),
  comparePrice: z.number().positive().optional().nullable(),
  categoryId: z.string().cuid('Invalid category'),
  quantity: z.number().int().min(0).max(10000),
  images: z.array(z.string().url()).min(1, 'At least one image required').max(10),
  tags: z.array(z.string().max(50)).max(10).optional(),
  shippingPrice: z.number().min(0).max(999.99).optional(),
  freeShipping: z.boolean().default(false),
  weight: z.number().positive().optional(),
});

export const orderSchema = z.object({
  shippingAddress: z.object({
    name: z.string().min(2).max(100),
    line1: z.string().min(5).max(200),
    line2: z.string().max(200).optional(),
    city: z.string().min(2).max(100),
    state: z.string().min(2).max(100),
    postalCode: z.string().regex(/^[a-zA-Z0-9\s-]{3,20}$/),
    country: z.string().length(2),
  }),
});

export const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  title: z.string().max(200).optional(),
  content: z.string().min(10).max(5000),
  images: z.array(z.string().url()).max(5).optional(),
});
```

### Seller Verification

```typescript
// lib/seller-verification.ts
import { prisma } from '@/lib/prisma';

export interface VerificationResult {
  verified: boolean;
  reason?: string;
}

export async function verifySeller(sellerId: string): Promise<VerificationResult> {
  const seller = await prisma.sellerProfile.findUnique({
    where: { id: sellerId },
    include: {
      user: true,
    },
  });

  if (!seller) {
    return { verified: false, reason: 'Seller not found' };
  }

  // Check Stripe onboarding
  if (!seller.stripeOnboarded || !seller.stripeAccountId) {
    return { verified: false, reason: 'Payment setup incomplete' };
  }

  // Check for verified email
  if (!seller.user.emailVerified) {
    return { verified: false, reason: 'Email not verified' };
  }

  // Check for banned status
  if (seller.user.banned) {
    return { verified: false, reason: 'Account suspended' };
  }

  // Check minimum account age (7 days)
  const accountAge = Date.now() - new Date(seller.createdAt).getTime();
  const minAge = 7 * 24 * 60 * 60 * 1000;
  if (accountAge < minAge) {
    return { verified: false, reason: 'Account too new' };
  }

  return { verified: true };
}

export async function canCreateListing(sellerId: string): Promise<VerificationResult> {
  const verification = await verifySeller(sellerId);
  if (!verification.verified) {
    return verification;
  }

  // Check listing limits
  const listingCount = await prisma.listing.count({
    where: { sellerId, status: { in: ['ACTIVE', 'DRAFT'] } },
  });

  const seller = await prisma.sellerProfile.findUnique({
    where: { id: sellerId },
    include: { user: true },
  });

  const limit = seller?.user.plan === 'PRO' ? 1000 : 50;
  if (listingCount >= limit) {
    return { verified: false, reason: 'Listing limit reached' };
  }

  return { verified: true };
}
```

### Fraud Prevention

```typescript
// lib/fraud-prevention.ts
import { prisma } from '@/lib/prisma';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL!,
  token: process.env.UPSTASH_REDIS_TOKEN!,
});

interface FraudSignal {
  type: string;
  score: number;
  details: string;
}

export async function checkOrderFraud(
  userId: string,
  orderTotal: number,
  ipAddress: string
): Promise<{ allowed: boolean; signals: FraudSignal[] }> {
  const signals: FraudSignal[] = [];

  // Check for velocity - too many orders in short time
  const recentOrders = await prisma.order.count({
    where: {
      buyerId: userId,
      createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    },
  });

  if (recentOrders > 10) {
    signals.push({
      type: 'HIGH_VELOCITY',
      score: 30,
      details: `${recentOrders} orders in 24 hours`,
    });
  }

  // Check for unusual order amount
  const avgOrderTotal = await prisma.order.aggregate({
    where: { buyerId: userId },
    _avg: { total: true },
  });

  if (avgOrderTotal._avg.total && orderTotal > Number(avgOrderTotal._avg.total) * 5) {
    signals.push({
      type: 'UNUSUAL_AMOUNT',
      score: 25,
      details: `Order ${orderTotal} vs avg ${avgOrderTotal._avg.total}`,
    });
  }

  // Check for IP velocity
  const ipOrders = await redis.incr(`fraud:ip:${ipAddress}`);
  await redis.expire(`fraud:ip:${ipAddress}`, 3600);

  if (ipOrders > 20) {
    signals.push({
      type: 'IP_VELOCITY',
      score: 40,
      details: `${ipOrders} orders from same IP`,
    });
  }

  // Check for known fraudulent patterns
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, createdAt: true },
  });

  if (user) {
    // New account with high-value order
    const accountAge = Date.now() - new Date(user.createdAt).getTime();
    if (accountAge < 24 * 60 * 60 * 1000 && orderTotal > 500) {
      signals.push({
        type: 'NEW_ACCOUNT_HIGH_VALUE',
        score: 35,
        details: `Account < 24h old, order $${orderTotal}`,
      });
    }

    // Disposable email
    const disposableDomains = ['tempmail.com', 'guerrillamail.com', '10minutemail.com'];
    const emailDomain = user.email.split('@')[1];
    if (disposableDomains.includes(emailDomain)) {
      signals.push({
        type: 'DISPOSABLE_EMAIL',
        score: 50,
        details: `Email domain: ${emailDomain}`,
      });
    }
  }

  // Calculate total score
  const totalScore = signals.reduce((sum, s) => sum + s.score, 0);
  const allowed = totalScore < 70;

  // Log for review if suspicious
  if (signals.length > 0) {
    await prisma.fraudLog.create({
      data: {
        userId,
        orderTotal,
        ipAddress,
        signals: signals as any,
        totalScore,
        blocked: !allowed,
      },
    });
  }

  return { allowed, signals };
}
```

### Rate Limiting

```typescript
// lib/rate-limit.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL!,
  token: process.env.UPSTASH_REDIS_TOKEN!,
});

export const rateLimiters = {
  // General API
  api: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(100, '1 m'),
    prefix: 'ratelimit:api',
  }),
  
  // Checkout - more restrictive
  checkout: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, '1 m'),
    prefix: 'ratelimit:checkout',
  }),
  
  // Listing creation
  createListing: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, '1 h'),
    prefix: 'ratelimit:listing',
  }),
  
  // Messages
  messages: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(30, '1 m'),
    prefix: 'ratelimit:messages',
  }),
  
  // Reviews
  reviews: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, '1 h'),
    prefix: 'ratelimit:reviews',
  }),
};
```

### Security Headers

```typescript
// next.config.js
const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: `
      default-src 'self';
      script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.stripe.com;
      style-src 'self' 'unsafe-inline';
      img-src 'self' blob: data: https: *.cloudinary.com;
      font-src 'self';
      connect-src 'self' https://api.stripe.com wss://*.pusher.com;
      frame-src https://js.stripe.com https://hooks.stripe.com;
      frame-ancestors 'none';
    `.replace(/\s{2,}/g, ' ').trim(),
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()',
  },
];

module.exports = {
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
};
```

## Performance

### Caching Strategies

```typescript
// app/api/listings/route.ts
export const revalidate = 60; // Revalidate every 60 seconds

export async function GET(request: NextRequest) {
  const data = await fetchListings();
  
  return Response.json(data, {
    headers: {
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
    },
  });
}
```

### React Query Optimization

```typescript
// hooks/use-listings.ts
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';

export function useListings(filters: ListingFilters) {
  return useInfiniteQuery({
    queryKey: ['listings', filters],
    queryFn: ({ pageParam = 0 }) => fetchListings({ ...filters, offset: pageParam }),
    getNextPageParam: (lastPage) => lastPage.nextOffset,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 30 * 60 * 1000, // 30 minutes
  });
}

export function useListing(id: string) {
  return useQuery({
    queryKey: ['listing', id],
    queryFn: () => fetchListing(id),
    staleTime: 5 * 60 * 1000,
  });
}

// Prefetch on hover
export function usePrefetchListing() {
  const queryClient = useQueryClient();
  
  return (id: string) => {
    queryClient.prefetchQuery({
      queryKey: ['listing', id],
      queryFn: () => fetchListing(id),
    });
  };
}
```

### Image Optimization

```typescript
// components/optimized-listing-image.tsx
import Image from 'next/image';

export function ListingImage({ src, alt, priority = false }: {
  src: string;
  alt: string;
  priority?: boolean;
}) {
  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
      priority={priority}
      placeholder="blur"
      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD..."
      className="object-cover"
    />
  );
}
```

### Dynamic Imports

```typescript
// Lazy load checkout components
const StripePaymentElement = dynamic(
  () => import('@/components/checkout/stripe-payment'),
  { loading: () => <PaymentSkeleton /> }
);

const ReviewForm = dynamic(
  () => import('@/components/reviews/review-form'),
  { loading: () => <Skeleton className="h-48" /> }
);
```

## CI/CD

### GitHub Actions Workflow

```yaml
# .github/workflows/ci.yml
name: Marketplace CI/CD

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

env:
  NODE_VERSION: '20'

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check

  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      - run: npm ci
      - run: npm run test:unit -- --coverage
      - uses: codecov/codecov-action@v3

  integration-tests:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: test
        ports:
          - 5432:5432
      redis:
        image: redis:7
        ports:
          - 6379:6379
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      - run: npm ci
      - run: npx prisma migrate deploy
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test
      - run: npm run test:integration
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test
          UPSTASH_REDIS_URL: redis://localhost:6379

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run build
      - run: npm run test:e2e
      - uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/

  deploy-preview:
    needs: [lint, unit-tests]
    if: github.event_name == 'pull_request'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}

  deploy-production:
    needs: [lint, unit-tests, integration-tests, e2e-tests]
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

### Package Scripts

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit",
    "test": "vitest",
    "test:unit": "vitest run",
    "test:integration": "vitest run tests/integration",
    "test:e2e": "playwright test",
    "test:coverage": "vitest run --coverage"
  }
}
```

## Monitoring

### Sentry Setup

```typescript
// sentry.client.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  integrations: [new Sentry.Replay()],
});
```

### Marketplace Metrics

```typescript
// lib/metrics.ts
import { track } from '@vercel/analytics';
import * as Sentry from '@sentry/nextjs';

export function trackPurchase(orderId: string, total: number, items: number) {
  track('purchase', {
    orderId,
    total,
    items,
  });
  
  Sentry.addBreadcrumb({
    category: 'commerce',
    message: `Order ${orderId} completed`,
    data: { total, items },
    level: 'info',
  });
}

export function trackListingView(listingId: string, sellerId: string) {
  track('listing_view', { listingId, sellerId });
}

export function trackAddToCart(listingId: string, quantity: number) {
  track('add_to_cart', { listingId, quantity });
}

export function trackSearch(query: string, resultsCount: number) {
  track('search', { query, resultsCount });
}
```

### Health Check

```typescript
// app/api/health/route.ts
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    
    return Response.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: 'up',
        stripe: 'up',
      },
    });
  } catch (error) {
    return Response.json(
      { status: 'unhealthy', error: 'Database connection failed' },
      { status: 503 }
    );
  }
}
```

## Environment Variables

```bash
# .env.example

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Database
DATABASE_URL="postgresql://..."

# Authentication
NEXTAUTH_SECRET=
NEXTAUTH_URL=http://localhost:3000

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Cloudinary (images)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Rate Limiting
UPSTASH_REDIS_URL=
UPSTASH_REDIS_TOKEN=

# Monitoring
NEXT_PUBLIC_SENTRY_DSN=
SENTRY_DSN=
```

## Deployment Checklist

- [ ] All environment variables configured
- [ ] Database migrations applied
- [ ] Stripe webhooks configured
- [ ] Stripe Connect onboarding tested
- [ ] Escrow flow tested end-to-end
- [ ] Security headers configured
- [ ] Rate limiting enabled
- [ ] Fraud prevention rules configured
- [ ] Sentry configured
- [ ] Analytics enabled
- [ ] All tests passing
- [ ] CI/CD pipeline configured

## Related Skills

- [Product Listings](../patterns/product-listings.md) - Listing management
- [Shopping Cart](../patterns/shopping-cart.md) - Cart functionality
- [Checkout](../patterns/checkout.md) - Payment processing
- [Reviews](../patterns/reviews.md) - Rating system
- [Search Filters](../patterns/search-filters.md) - Product search

## Changelog

### v2.0.0 (2025-01-18)
- Standardized to god-tier template
- Added comprehensive Testing section with marketplace-specific tests
- Added Error Handling with escrow/fraud error classes
- Added Accessibility section
- Added Security section with fraud prevention
- Added Performance section
- Added CI/CD section
- Added Monitoring section

### v1.0.0 (2025-01-17)
- Initial implementation with listings, cart, orders
- Two-sided marketplace with seller profiles
- Escrow payment system with Stripe Connect
- Review and rating system
- Order tracking with timeline
- Multi-seller order support
