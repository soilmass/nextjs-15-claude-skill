---
id: t-product-detail
name: Product Detail
version: 2.0.0
layer: L4
category: pages
description: E-commerce product detail page with gallery, variants, and reviews
tags: [page, product, detail, ecommerce, pdp, gallery]
formula: "ProductDetail = ProductCard(o-product-card) + MediaGallery(o-media-gallery) + ReviewForm(o-review-form) + Rating(m-rating) + DisplayCurrency(a-display-currency)"
composes:
  - ../organisms/product-card.md
  - ../organisms/media-gallery.md
  - ../organisms/review-form.md
  - ../molecules/rating.md
  - ../atoms/display-currency.md
dependencies: []
performance:
  impact: high
  lcp: critical
  cls: medium
accessibility:
  wcag: AA
  keyboard: true
  screen-reader: true
---

# Product Detail

## Overview

The Product Detail template provides a complete product display page (PDP). Features image gallery, variant selection, pricing, reviews, and related products. Optimized for conversion with clear CTAs and trust signals.

## When to Use

Use this skill when:
- Building product detail pages
- Creating item pages
- Building service detail pages
- Creating course/event pages

## Composition Diagram

```
+------------------------------------------------------------------------+
|                          ProductDetail                                  |
+------------------------------------------------------------------------+
|  [Breadcrumbs: Home > Products > Category > Product Name]               |
|                                                                         |
|  +--------------------------------+  +--------------------------------+ |
|  |  MediaGallery (o-media-gallery)|  |      ProductInfo               | |
|  |  +----------------------------+|  |  [Product Name]                | |
|  |  |                            ||  |  [Rating (m-rating)] (reviews) | |
|  |  |       [Main Image]         ||  |                                | |
|  |  |          [Zoom]            ||  |  [DisplayCurrency] [Compare]   | |
|  |  |    [<]            [>]      ||  |  (a-display-currency)          | |
|  |  +----------------------------+|  |                                | |
|  |  [thumb][thumb][thumb][thumb]  |  |  [Description]                 | |
|  +--------------------------------+  |                                | |
|                                      |  Variants:                     | |
|                                      |  [Color] [Size] [Quantity]     | |
|                                      |                                | |
|                                      |  [Add to Cart] [Heart] [Share] | |
|                                      |                                | |
|                                      |  [Truck] [Shield] [Return]     | |
|                                      +--------------------------------+ |
|                                                                         |
|  +--------------------------------------------------------------------+ |
|  |                      ProductTabs                                   | |
|  |  [Description] [Specifications] [Reviews] [FAQs]                   | |
|  |  +----------------------------------------------------------------+| |
|  |  |              Tab Content Area                                  || |
|  |  |    ReviewForm (o-review-form) / FAQ / Specs                    || |
|  |  +----------------------------------------------------------------+| |
|  +--------------------------------------------------------------------+ |
|                                                                         |
|  +--------------------------------------------------------------------+ |
|  |              RelatedProducts (o-product-card x 4)                  | |
|  |  [Card][Card][Card][Card]                                          | |
|  +--------------------------------------------------------------------+ |
+------------------------------------------------------------------------+
```

## Organisms Used

- [product-card](../organisms/product-card.md) - Related products
- [faq](../organisms/faq.md) - Product FAQs
- [testimonials](../organisms/testimonials.md) - Reviews

## Implementation

```typescript
// app/(shop)/products/[slug]/page.tsx
import { Suspense } from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProductBySlug, getRelatedProducts, getAllProductSlugs } from "@/lib/products";
import { ProductGallery } from "@/components/shop/product-gallery";
import { ProductInfo } from "@/components/shop/product-info";
import { ProductTabs } from "@/components/shop/product-tabs";
import { RelatedProducts } from "@/components/shop/related-products";
import { Skeleton } from "@/components/ui/skeleton";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

// Generate static paths
export async function generateStaticParams() {
  const slugs = await getAllProductSlugs();
  return slugs.map((slug) => ({ slug }));
}

// Generate metadata
export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return { title: "Product Not Found" };
  }

  return {
    title: product.name,
    description: product.description,
    openGraph: {
      title: product.name,
      description: product.description,
      images: product.images.map((img) => ({
        url: img.src,
        width: 800,
        height: 800,
        alt: img.alt,
      })),
      type: "website",
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  // JSON-LD structured data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.images.map((img) => img.src),
    sku: product.sku,
    brand: {
      "@type": "Brand",
      name: product.brand,
    },
    offers: {
      "@type": "Offer",
      url: `https://example.com/products/${slug}`,
      priceCurrency: "USD",
      price: product.price,
      priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      availability: product.inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
    },
    aggregateRating: product.rating
      ? {
          "@type": "AggregateRating",
          ratingValue: product.rating.average,
          reviewCount: product.rating.count,
        }
      : undefined,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="container py-8">
        {/* Breadcrumbs */}
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Products", href: "/products" },
            { label: product.category, href: `/products?category=${product.categorySlug}` },
            { label: product.name },
          ]}
          className="mb-8"
        />

        {/* Product Main Section */}
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 mb-16">
          {/* Gallery */}
          <ProductGallery images={product.images} />

          {/* Info */}
          <ProductInfo product={product} />
        </div>

        {/* Product Details Tabs */}
        <ProductTabs
          description={product.longDescription}
          specifications={product.specifications}
          reviews={product.reviews}
          faqs={product.faqs}
          className="mb-16"
        />

        {/* Related Products */}
        <Suspense
          fallback={
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="aspect-square rounded-lg" />
              ))}
            </div>
          }
        >
          <RelatedProducts productId={product.id} />
        </Suspense>
      </div>
    </>
  );
}
```

### Product Gallery Component

```typescript
// components/shop/product-gallery.tsx
"use client";

import * as React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

interface ProductImage {
  src: string;
  alt: string;
}

interface ProductGalleryProps {
  images: ProductImage[];
}

export function ProductGallery({ images }: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const selectedImage = images[selectedIndex];

  const goToPrevious = () => {
    setSelectedIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setSelectedIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="relative aspect-square rounded-lg overflow-hidden bg-muted">
        <Image
          src={selectedImage.src}
          alt={selectedImage.alt}
          fill
          className="object-cover"
          priority
          sizes="(max-width: 1024px) 100vw, 50vw"
        />

        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            <Button
              variant="secondary"
              size="icon"
              className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full"
              onClick={goToPrevious}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full"
              onClick={goToNext}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </>
        )}

        {/* Zoom Button */}
        <Dialog>
          <DialogTrigger asChild>
            <Button
              variant="secondary"
              size="icon"
              className="absolute top-4 right-4 rounded-full"
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl p-0">
            <Image
              src={selectedImage.src}
              alt={selectedImage.alt}
              width={1200}
              height={1200}
              className="w-full h-auto"
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => setSelectedIndex(index)}
              className={cn(
                "relative h-20 w-20 flex-shrink-0 rounded-md overflow-hidden border-2",
                selectedIndex === index
                  ? "border-primary"
                  : "border-transparent hover:border-muted-foreground/50"
              )}
            >
              <Image
                src={image.src}
                alt={image.alt}
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

### Product Info Component

```typescript
// components/shop/product-info.tsx
"use client";

import * as React from "react";
import { Star, Heart, Share2, Truck, Shield, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { addToCart } from "@/lib/cart";

interface ProductInfoProps {
  product: {
    id: string;
    name: string;
    price: number;
    compareAtPrice?: number;
    rating?: { average: number; count: number };
    description: string;
    variants?: {
      type: string;
      options: { id: string; value: string; available: boolean; colorHex?: string }[];
    }[];
    inStock: boolean;
    sku: string;
  };
}

export function ProductInfo({ product }: ProductInfoProps) {
  const [selectedVariants, setSelectedVariants] = React.useState<Record<string, string>>({});
  const [quantity, setQuantity] = React.useState("1");
  const [isAddingToCart, setIsAddingToCart] = React.useState(false);

  const discount = product.compareAtPrice
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : null;

  const handleAddToCart = async () => {
    setIsAddingToCart(true);
    try {
      await addToCart({
        productId: product.id,
        quantity: parseInt(quantity),
        variants: selectedVariants,
      });
    } finally {
      setIsAddingToCart(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title & Rating */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">{product.name}</h1>
        {product.rating && (
          <div className="flex items-center gap-2">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={cn(
                    "h-4 w-4",
                    star <= Math.round(product.rating!.average)
                      ? "fill-yellow-400 text-yellow-400"
                      : "fill-muted text-muted"
                  )}
                />
              ))}
            </div>
            <span className="text-sm text-muted-foreground">
              ({product.rating.count} reviews)
            </span>
          </div>
        )}
      </div>

      {/* Price */}
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-bold">${product.price}</span>
        {product.compareAtPrice && (
          <>
            <span className="text-lg text-muted-foreground line-through">
              ${product.compareAtPrice}
            </span>
            <Badge variant="destructive">-{discount}%</Badge>
          </>
        )}
      </div>

      {/* Description */}
      <p className="text-muted-foreground">{product.description}</p>

      <Separator />

      {/* Variants */}
      {product.variants?.map((variant) => (
        <div key={variant.type} className="space-y-3">
          <Label className="text-base font-medium">{variant.type}</Label>
          
          {variant.type.toLowerCase() === "color" ? (
            <RadioGroup
              value={selectedVariants[variant.type]}
              onValueChange={(value) =>
                setSelectedVariants((prev) => ({ ...prev, [variant.type]: value }))
              }
              className="flex gap-2"
            >
              {variant.options.map((option) => (
                <div key={option.id}>
                  <RadioGroupItem
                    value={option.id}
                    id={option.id}
                    className="peer sr-only"
                    disabled={!option.available}
                  />
                  <Label
                    htmlFor={option.id}
                    className={cn(
                      "h-10 w-10 rounded-full border-2 cursor-pointer flex items-center justify-center",
                      "peer-data-[state=checked]:border-primary",
                      "peer-disabled:opacity-50 peer-disabled:cursor-not-allowed"
                    )}
                    style={{ backgroundColor: option.colorHex }}
                    title={option.value}
                  />
                </div>
              ))}
            </RadioGroup>
          ) : (
            <RadioGroup
              value={selectedVariants[variant.type]}
              onValueChange={(value) =>
                setSelectedVariants((prev) => ({ ...prev, [variant.type]: value }))
              }
              className="flex flex-wrap gap-2"
            >
              {variant.options.map((option) => (
                <div key={option.id}>
                  <RadioGroupItem
                    value={option.id}
                    id={option.id}
                    className="peer sr-only"
                    disabled={!option.available}
                  />
                  <Label
                    htmlFor={option.id}
                    className={cn(
                      "px-4 py-2 border rounded-md cursor-pointer",
                      "peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5",
                      "peer-disabled:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:line-through"
                    )}
                  >
                    {option.value}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          )}
        </div>
      ))}

      {/* Quantity */}
      <div className="space-y-3">
        <Label className="text-base font-medium">Quantity</Label>
        <Select value={quantity} onValueChange={setQuantity}>
          <SelectTrigger className="w-24">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
              <SelectItem key={num} value={num.toString()}>
                {num}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Actions */}
      <div className="flex gap-4">
        <Button
          size="lg"
          className="flex-1"
          onClick={handleAddToCart}
          disabled={!product.inStock || isAddingToCart}
        >
          {!product.inStock
            ? "Out of Stock"
            : isAddingToCart
            ? "Adding..."
            : "Add to Cart"}
        </Button>
        <Button size="lg" variant="outline">
          <Heart className="h-5 w-5" />
        </Button>
        <Button size="lg" variant="outline">
          <Share2 className="h-5 w-5" />
        </Button>
      </div>

      {/* Trust Signals */}
      <div className="grid grid-cols-3 gap-4 pt-4">
        <div className="text-center">
          <Truck className="h-6 w-6 mx-auto mb-1 text-muted-foreground" />
          <p className="text-xs text-muted-foreground">Free Shipping</p>
        </div>
        <div className="text-center">
          <Shield className="h-6 w-6 mx-auto mb-1 text-muted-foreground" />
          <p className="text-xs text-muted-foreground">2 Year Warranty</p>
        </div>
        <div className="text-center">
          <RotateCcw className="h-6 w-6 mx-auto mb-1 text-muted-foreground" />
          <p className="text-xs text-muted-foreground">30-Day Returns</p>
        </div>
      </div>

      {/* SKU */}
      <p className="text-xs text-muted-foreground">SKU: {product.sku}</p>
    </div>
  );
}
```

## Key Implementation Notes

1. **Image Gallery**: Thumbnails, zoom, navigation
2. **Variant Selection**: Color swatches, size buttons
3. **Trust Signals**: Shipping, warranty, returns
4. **Structured Data**: JSON-LD for SEO
5. **Static Generation**: Pre-rendered pages

## Performance

### LCP Optimization

- Priority loading for main image
- Proper image sizing
- Pre-generated pages

### Dynamic Content

- Reviews loaded with Suspense
- Related products async
- Variant availability checked

## Accessibility

### Required Features

- Variant radio groups labeled
- Gallery navigable by keyboard
- Add to cart status announced
- Image alt text

### Screen Reader

- Price changes announced
- Stock status communicated
- Variant selection confirmed

## Error States

### Product Not Found

```tsx
// app/products/[slug]/not-found.tsx
import Link from 'next/link';
import { Package, ArrowLeft, Search } from 'lucide-react';

export default function ProductNotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4">
      <div className="mx-auto max-w-md text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
          <Package className="h-10 w-10 text-muted-foreground" />
        </div>
        <h1 className="text-2xl font-bold">Product not found</h1>
        <p className="mt-2 text-muted-foreground">
          The product you're looking for doesn't exist or may have been removed.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/products"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            <Search className="h-4 w-4" />
            Browse products
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-lg border px-5 py-2.5 text-sm font-medium hover:bg-accent"
          >
            <ArrowLeft className="h-4 w-4" />
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}
```

### Product Page Error Boundary

```tsx
// app/products/[slug]/error.tsx
'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function ProductError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Product page error:', error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4">
      <div className="mx-auto max-w-md text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
          <AlertTriangle className="h-8 w-8 text-destructive" />
        </div>
        <h1 className="text-2xl font-bold">Unable to load product</h1>
        <p className="mt-2 text-muted-foreground">
          We encountered an error while loading this product. Please try again.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            <RefreshCw className="h-4 w-4" />
            Try again
          </button>
          <Link
            href="/products"
            className="inline-flex items-center justify-center gap-2 rounded-lg border px-5 py-2.5 text-sm font-medium hover:bg-accent"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to products
          </Link>
        </div>
      </div>
    </div>
  );
}
```

### Add to Cart Error Toast

```tsx
// components/shop/cart-error-handler.tsx
import { toast } from 'sonner';

export function handleAddToCartError(error: Error) {
  toast.error('Failed to add to cart', {
    description: error.message || 'Please try again.',
    action: {
      label: 'Retry',
      onClick: () => {
        // Retry logic handled by caller
      },
    },
  });
}
```

## Loading States

### Product Page Loading

```tsx
// app/products/[slug]/loading.tsx
import { Skeleton } from "@/components/ui/skeleton";

export default function ProductLoading() {
  return (
    <div className="container py-8">
      {/* Breadcrumb Skeleton */}
      <div className="mb-8 flex items-center gap-2">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-4 w-32" />
      </div>

      <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 mb-16">
        {/* Gallery Skeleton */}
        <div className="space-y-4">
          <Skeleton className="aspect-square rounded-lg" />
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-20 w-20 rounded-md" />
            ))}
          </div>
        </div>

        {/* Info Skeleton */}
        <div className="space-y-6">
          <div>
            <Skeleton className="h-10 w-3/4 mb-2" />
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-4 w-4" />
                ))}
              </div>
              <Skeleton className="h-4 w-20" />
            </div>
          </div>

          <div className="flex items-baseline gap-2">
            <Skeleton className="h-9 w-24" />
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-6 w-12" />
          </div>

          <Skeleton className="h-20 w-full" />

          <div className="space-y-4">
            <Skeleton className="h-5 w-16" />
            <div className="flex gap-2">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-10 w-10 rounded-full" />
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <Skeleton className="h-5 w-12" />
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-10 w-12 rounded-md" />
              ))}
            </div>
          </div>

          <div className="flex gap-4">
            <Skeleton className="h-12 flex-1" />
            <Skeleton className="h-12 w-12" />
            <Skeleton className="h-12 w-12" />
          </div>
        </div>
      </div>

      {/* Reviews Skeleton */}
      <div className="border-t pt-16">
        <Skeleton className="h-8 w-40 mb-8" />
        <div className="grid gap-6 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-lg border p-4">
              <div className="flex items-start gap-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((j) => (
                      <Skeleton key={j} className="h-4 w-4" />
                    ))}
                  </div>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

### Add to Cart Button with Loading State

```tsx
// components/shop/add-to-cart-button.tsx
'use client';

import { useState } from 'react';
import { ShoppingCart, Loader2, Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type ButtonStatus = 'idle' | 'loading' | 'success' | 'error';

interface AddToCartButtonProps {
  productId: string;
  quantity: number;
  variants?: Record<string, string>;
  disabled?: boolean;
  onAddToCart: () => Promise<void>;
}

export function AddToCartButton({ productId, quantity, variants, disabled, onAddToCart }: AddToCartButtonProps) {
  const [status, setStatus] = useState<ButtonStatus>('idle');

  const handleClick = async () => {
    setStatus('loading');
    try {
      await onAddToCart();
      setStatus('success');
      setTimeout(() => setStatus('idle'), 2000);
    } catch {
      setStatus('error');
      setTimeout(() => setStatus('idle'), 3000);
    }
  };

  return (
    <Button
      onClick={handleClick}
      disabled={disabled || status === 'loading'}
      size="lg"
      className={cn(
        'flex-1 transition-colors',
        status === 'success' && 'bg-green-600 hover:bg-green-700',
        status === 'error' && 'bg-destructive hover:bg-destructive/90'
      )}
    >
      {status === 'loading' && <Loader2 className="h-5 w-5 mr-2 animate-spin" />}
      {status === 'success' && <Check className="h-5 w-5 mr-2" />}
      {status === 'error' && <AlertCircle className="h-5 w-5 mr-2" />}
      {status === 'idle' && <ShoppingCart className="h-5 w-5 mr-2" />}

      {status === 'loading' && 'Adding...'}
      {status === 'success' && 'Added!'}
      {status === 'error' && 'Failed - Retry'}
      {status === 'idle' && 'Add to Cart'}
    </Button>
  );
}
```

## Mobile Responsiveness

### Responsive Product Detail Layout

```tsx
// components/shop/product-detail-mobile.tsx
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Heart, Share2, ShoppingCart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export function ProductDetailMobile({ product }) {
  const [imageIndex, setImageIndex] = useState(0);

  return (
    <div className="min-h-screen">
      {/* Mobile Image Carousel */}
      <div className="relative aspect-square lg:hidden">
        <Image
          src={product.images[imageIndex].src}
          alt={product.images[imageIndex].alt}
          fill
          className="object-cover"
          priority
        />

        {/* Navigation */}
        {product.images.length > 1 && (
          <>
            <button
              onClick={() => setImageIndex((i) => Math.max(0, i - 1))}
              className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow-lg disabled:opacity-50"
              disabled={imageIndex === 0}
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={() => setImageIndex((i) => Math.min(product.images.length - 1, i + 1))}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow-lg disabled:opacity-50"
              disabled={imageIndex === product.images.length - 1}
            >
              <ChevronRight className="h-5 w-5" />
            </button>

            {/* Dots */}
            <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-1.5">
              {product.images.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setImageIndex(i)}
                  className={cn(
                    'h-2 rounded-full transition-all',
                    i === imageIndex ? 'w-4 bg-white' : 'w-2 bg-white/50'
                  )}
                />
              ))}
            </div>
          </>
        )}

        {/* Quick Actions */}
        <div className="absolute right-4 top-4 flex flex-col gap-2">
          <button className="rounded-full bg-white/90 p-2.5 shadow-lg">
            <Heart className="h-5 w-5" />
          </button>
          <button className="rounded-full bg-white/90 p-2.5 shadow-lg">
            <Share2 className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Mobile Sticky Add to Cart */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t bg-background p-4 shadow-lg lg:hidden">
        <div className="flex items-center gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Total</p>
            <p className="text-xl font-bold">${product.price}</p>
          </div>
          <Button className="flex-1" size="lg">
            <ShoppingCart className="h-5 w-5 mr-2" />
            Add to Cart
          </Button>
        </div>
      </div>
    </div>
  );
}
```

### Mobile Variant Selector

```tsx
// components/shop/variant-selector-mobile.tsx
'use client';

import { cn } from '@/lib/utils';

interface VariantSelectorMobileProps {
  variants: {
    type: string;
    options: { id: string; value: string; available: boolean; colorHex?: string }[];
  }[];
  selected: Record<string, string>;
  onChange: (type: string, value: string) => void;
}

export function VariantSelectorMobile({ variants, selected, onChange }: VariantSelectorMobileProps) {
  return (
    <div className="space-y-4">
      {variants.map((variant) => (
        <div key={variant.type}>
          <label className="block text-sm font-medium mb-2">
            {variant.type}: <span className="text-muted-foreground">{selected[variant.type]}</span>
          </label>

          {variant.type.toLowerCase() === 'color' ? (
            <div className="flex flex-wrap gap-2">
              {variant.options.map((option) => (
                <button
                  key={option.id}
                  onClick={() => onChange(variant.type, option.id)}
                  disabled={!option.available}
                  className={cn(
                    'h-10 w-10 rounded-full border-2 transition-all',
                    selected[variant.type] === option.id
                      ? 'border-primary ring-2 ring-primary ring-offset-2'
                      : 'border-transparent',
                    !option.available && 'opacity-50 cursor-not-allowed'
                  )}
                  style={{ backgroundColor: option.colorHex }}
                  aria-label={option.value}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {variant.options.map((option) => (
                <button
                  key={option.id}
                  onClick={() => onChange(variant.type, option.id)}
                  disabled={!option.available}
                  className={cn(
                    'min-w-[48px] px-4 py-2.5 text-sm rounded-lg border transition-all',
                    selected[variant.type] === option.id
                      ? 'border-primary bg-primary/5 font-medium'
                      : 'border-input hover:border-muted-foreground',
                    !option.available && 'opacity-50 line-through cursor-not-allowed'
                  )}
                >
                  {option.value}
                </button>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
```

### Mobile Breakpoints Reference

```tsx
// Product detail responsive patterns:
//
// Mobile (< 1024px):
// - Full-width swipeable image carousel
// - Sticky bottom add-to-cart bar (fixed bottom-0)
// - Stacked layout (image then info)
// - Touch-friendly variant selectors (min 48px tap targets)
// - Collapsible tabs for details/specs/reviews
// - pb-24 on content to account for sticky bar
//
// Desktop (>= 1024px):
// - Two-column grid layout (lg:grid-cols-2)
// - Thumbnail gallery with zoom dialog
// - Inline add-to-cart button
// - All content visible without collapsing
//
// Key responsive classes:
// - lg:hidden - Mobile only (carousel, sticky bar)
// - hidden lg:block - Desktop only (thumbnail gallery)
// - fixed bottom-0 lg:relative - Sticky mobile, inline desktop
// - container py-8 - Consistent padding
// - gap-8 lg:gap-12 - Tighter on mobile
```

## Related Skills

### Uses Layout
- Shop layout

### Related Pages
- [product-listing](./product-listing.md)
- [cart-page](./cart-page.md)

---

## Changelog

### 1.0.0 (2025-01-16)
- Initial implementation
- Image gallery with zoom
- Variant selection
- Reviews and related products
