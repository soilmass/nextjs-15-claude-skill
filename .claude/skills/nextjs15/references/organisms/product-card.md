---
id: o-product-card
name: Product Card
version: 2.0.0
layer: L3
category: commerce
description: E-commerce product card with images, variants, pricing, and add-to-cart
tags: [product, card, commerce, ecommerce, shop, catalog]
formula: "ProductCard = Card(m-card) + Tooltip(m-tooltip) + Badge(a-badge) + Button(a-button) + Skeleton(a-skeleton)"
composes:
  - ../molecules/card.md
dependencies: [framer-motion, lucide-react]
performance:
  impact: medium
  lcp: high
  cls: medium
accessibility:
  wcag: AA
  keyboard: true
  screen-reader: true
---

# Product Card

## Overview

The Product Card organism provides a complete e-commerce product display with image gallery, variant selection, pricing, ratings, and add-to-cart functionality. Supports multiple layouts, quick view, and wishlist integration.

## When to Use

Use this skill when:
- Building product listing pages
- Creating product grids/catalogs
- Displaying featured products
- Building shopping experiences

## Composition Diagram

```
┌─────────────────────────────────────────────────┐
│ ProductCard                                      │
├─────────────────────────────────────────────────┤
│  ┌───────────────────────────────────────────┐  │
│  │ Image Gallery                              │  │
│  │  ┌─────────────────────────────────────┐  │  │
│  │  │                                     │  │  │
│  │  │         [Product Image]             │  │  │
│  │  │                                     │  │  │
│  │  │ ┌──────────────┐   ┌─────────────┐ │  │  │
│  │  │ │Badge(a-badge)│   │ Button      │ │  │  │
│  │  │ │  [Sale]      │   │ (wishlist)  │ │  │  │
│  │  │ └──────────────┘   └─────────────┘ │  │  │
│  │  │                    ┌─────────────┐ │  │  │
│  │  │                    │ Button      │ │  │  │
│  │  │                    │ (quick view)│ │  │  │
│  │  │                    └─────────────┘ │  │  │
│  │  │  ○ ○ ● ○  (navigation dots)       │  │  │
│  │  └─────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────┘  │
│                                                  │
│  ┌───────────────────────────────────────────┐  │
│  │ Card Content (m-card)                      │  │
│  │  Product Name                              │  │
│  │  ★★★★☆ (128)                              │  │
│  │                                            │  │
│  │  Variants: ● ○ ○  [S] [M] [L]             │  │
│  │  ┌────────────────────────────┐           │  │
│  │  │ Tooltip (m-tooltip)        │           │  │
│  │  │ "Color: Black"             │           │  │
│  │  └────────────────────────────┘           │  │
│  │                                            │  │
│  │  $299  $399                               │  │
│  │  ───────────────────────────────────────  │  │
│  │  ┌────────────────────────────────────┐   │  │
│  │  │ Button (a-button)                  │   │  │
│  │  │ [🛒 Add to Cart]                   │   │  │
│  │  └────────────────────────────────────┘   │  │
│  └───────────────────────────────────────────┘  │
│                                                  │
│  Loading: Skeleton (a-skeleton)                 │
└─────────────────────────────────────────────────┘
```

## Molecules Used

- [card](../molecules/card.md) - Base container
- [badge](../atoms/badge.md) - Sale/new labels
- [button](../atoms/button.md) - Add to cart
- [skeleton](../atoms/skeleton.md) - Loading state

## Implementation

```typescript
// components/organisms/product-card.tsx
"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  ShoppingCart,
  Star,
  Eye,
  Check,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ProductImage {
  src: string;
  alt: string;
}

interface ProductVariant {
  id: string;
  name: string;
  value: string;
  type: "color" | "size" | "option";
  available?: boolean;
  colorHex?: string;
}

interface ProductPrice {
  amount: number;
  currency?: string;
  compareAt?: number;
}

interface ProductRating {
  average: number;
  count: number;
}

interface ProductCardProps {
  /** Product ID */
  id: string;
  /** Product name */
  name: string;
  /** Product description */
  description?: string;
  /** Product URL */
  href: string;
  /** Product images */
  images: ProductImage[];
  /** Product price */
  price: ProductPrice;
  /** Product rating */
  rating?: ProductRating;
  /** Product variants */
  variants?: ProductVariant[];
  /** Sale badge */
  badge?: string;
  /** Is in stock */
  inStock?: boolean;
  /** Is in wishlist */
  isWishlisted?: boolean;
  /** Card layout */
  layout?: "vertical" | "horizontal" | "compact";
  /** Show quick view button */
  showQuickView?: boolean;
  /** Add to cart handler */
  onAddToCart?: (productId: string, variantId?: string) => void;
  /** Wishlist toggle handler */
  onWishlistToggle?: (productId: string) => void;
  /** Quick view handler */
  onQuickView?: (productId: string) => void;
  /** Loading state */
  isLoading?: boolean;
  /** Additional class names */
  className?: string;
}

function formatPrice(price: ProductPrice): string {
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: price.currency ?? "USD",
  });
  return formatter.format(price.amount);
}

function calculateDiscount(price: ProductPrice): number | null {
  if (!price.compareAt || price.compareAt <= price.amount) return null;
  return Math.round(((price.compareAt - price.amount) / price.compareAt) * 100);
}

function RatingStars({ rating }: { rating: ProductRating }) {
  return (
    <div className="flex items-center gap-1">
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={cn(
              "h-3.5 w-3.5",
              star <= Math.round(rating.average)
                ? "fill-yellow-400 text-yellow-400"
                : "fill-muted text-muted"
            )}
          />
        ))}
      </div>
      <span className="text-xs text-muted-foreground">
        ({rating.count})
      </span>
    </div>
  );
}

function ImageGallery({
  images,
  onHover,
}: {
  images: ProductImage[];
  onHover?: boolean;
}) {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [isHovered, setIsHovered] = React.useState(false);

  // Auto-cycle on hover
  React.useEffect(() => {
    if (!onHover || !isHovered || images.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 1500);

    return () => clearInterval(interval);
  }, [isHovered, images.length, onHover]);

  return (
    <div
      className="relative aspect-square overflow-hidden bg-muted"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setCurrentIndex(0);
      }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="absolute inset-0"
        >
          <Image
            src={images[currentIndex].src}
            alt={images[currentIndex].alt}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 50vw, 25vw"
          />
        </motion.div>
      </AnimatePresence>

      {/* Navigation dots */}
      {images.length > 1 && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={(e) => {
                e.preventDefault();
                setCurrentIndex(index);
              }}
              className={cn(
                "h-1.5 rounded-full transition-all",
                currentIndex === index
                  ? "w-4 bg-white"
                  : "w-1.5 bg-white/60 hover:bg-white/80"
              )}
              aria-label={`View image ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Navigation arrows */}
      {images.length > 1 && isHovered && (
        <>
          <button
            onClick={(e) => {
              e.preventDefault();
              setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
            }}
            className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-white/80 flex items-center justify-center hover:bg-white transition-colors"
            aria-label="Previous image"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              setCurrentIndex((prev) => (prev + 1) % images.length);
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-white/80 flex items-center justify-center hover:bg-white transition-colors"
            aria-label="Next image"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </>
      )}
    </div>
  );
}

function VariantSelector({
  variants,
  selectedId,
  onChange,
}: {
  variants: ProductVariant[];
  selectedId?: string;
  onChange: (id: string) => void;
}) {
  const colorVariants = variants.filter((v) => v.type === "color");
  const sizeVariants = variants.filter((v) => v.type === "size");

  return (
    <div className="space-y-2">
      {/* Color variants */}
      {colorVariants.length > 0 && (
        <div className="flex gap-1.5">
          {colorVariants.map((variant) => (
            <TooltipProvider key={variant.id}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      onChange(variant.id);
                    }}
                    disabled={!variant.available}
                    className={cn(
                      "h-6 w-6 rounded-full border-2 transition-all",
                      selectedId === variant.id
                        ? "border-primary ring-2 ring-primary/20"
                        : "border-transparent hover:border-muted-foreground/30",
                      !variant.available && "opacity-50 cursor-not-allowed"
                    )}
                    style={{ backgroundColor: variant.colorHex }}
                    aria-label={variant.name}
                  />
                </TooltipTrigger>
                <TooltipContent>
                  <p>{variant.name}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
        </div>
      )}

      {/* Size variants */}
      {sizeVariants.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {sizeVariants.map((variant) => (
            <button
              key={variant.id}
              onClick={(e) => {
                e.preventDefault();
                onChange(variant.id);
              }}
              disabled={!variant.available}
              className={cn(
                "px-2 py-1 text-xs rounded border transition-colors",
                selectedId === variant.id
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-input hover:border-primary",
                !variant.available && "opacity-50 cursor-not-allowed line-through"
              )}
            >
              {variant.value}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ProductCardSkeleton({ layout }: { layout: string }) {
  if (layout === "horizontal") {
    return (
      <div className="flex gap-4 p-4 rounded-lg border">
        <Skeleton className="h-32 w-32 rounded-md" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-6 w-20" />
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border overflow-hidden">
      <Skeleton className="aspect-square" />
      <div className="p-4 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-6 w-20" />
      </div>
    </div>
  );
}

export function ProductCard({
  id,
  name,
  description,
  href,
  images,
  price,
  rating,
  variants,
  badge,
  inStock = true,
  isWishlisted = false,
  layout = "vertical",
  showQuickView = true,
  onAddToCart,
  onWishlistToggle,
  onQuickView,
  isLoading = false,
  className,
}: ProductCardProps) {
  const [selectedVariant, setSelectedVariant] = React.useState<string | undefined>(
    variants?.[0]?.id
  );
  const [isAddingToCart, setIsAddingToCart] = React.useState(false);
  const [justAdded, setJustAdded] = React.useState(false);

  const discount = calculateDiscount(price);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!onAddToCart || !inStock) return;

    setIsAddingToCart(true);
    try {
      await onAddToCart(id, selectedVariant);
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 2000);
    } finally {
      setIsAddingToCart(false);
    }
  };

  if (isLoading) {
    return <ProductCardSkeleton layout={layout} />;
  }

  if (layout === "horizontal") {
    return (
      <Link href={href} className={cn("block group", className)}>
        <div className="flex gap-4 p-4 rounded-lg border hover:border-primary/50 transition-colors">
          <div className="relative h-32 w-32 flex-shrink-0 overflow-hidden rounded-md">
            <Image
              src={images[0].src}
              alt={images[0].alt}
              fill
              className="object-cover"
            />
            {badge && (
              <Badge className="absolute top-2 left-2" variant="destructive">
                {badge}
              </Badge>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-medium truncate group-hover:text-primary transition-colors">
              {name}
            </h3>
            {description && (
              <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                {description}
              </p>
            )}
            {rating && <RatingStars rating={rating} />}
            <div className="flex items-center gap-2 mt-2">
              <span className="font-bold">{formatPrice(price)}</span>
              {price.compareAt && (
                <span className="text-sm text-muted-foreground line-through">
                  {formatPrice({ ...price, amount: price.compareAt })}
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-col justify-between items-end">
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.preventDefault();
                onWishlistToggle?.(id);
              }}
            >
              <Heart
                className={cn(
                  "h-5 w-5",
                  isWishlisted && "fill-red-500 text-red-500"
                )}
              />
            </Button>
            <Button
              size="sm"
              disabled={!inStock || isAddingToCart}
              onClick={handleAddToCart}
            >
              {justAdded ? (
                <Check className="h-4 w-4" />
              ) : (
                <ShoppingCart className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </Link>
    );
  }

  // Vertical layout (default)
  return (
    <div className={cn("group relative rounded-lg border overflow-hidden", className)}>
      <Link href={href} className="block">
        {/* Image */}
        <div className="relative">
          <ImageGallery images={images} onHover />

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {badge && (
              <Badge variant="destructive">{badge}</Badge>
            )}
            {discount && (
              <Badge variant="secondary">-{discount}%</Badge>
            )}
            {!inStock && (
              <Badge variant="outline" className="bg-background">
                Out of stock
              </Badge>
            )}
          </div>

          {/* Quick actions */}
          <div className="absolute top-2 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="secondary"
              size="icon"
              className="h-8 w-8 rounded-full"
              onClick={(e) => {
                e.preventDefault();
                onWishlistToggle?.(id);
              }}
            >
              <Heart
                className={cn(
                  "h-4 w-4",
                  isWishlisted && "fill-red-500 text-red-500"
                )}
              />
            </Button>
            {showQuickView && (
              <Button
                variant="secondary"
                size="icon"
                className="h-8 w-8 rounded-full"
                onClick={(e) => {
                  e.preventDefault();
                  onQuickView?.(id);
                }}
              >
                <Eye className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Add to cart overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-2 translate-y-full group-hover:translate-y-0 transition-transform">
            <Button
              className="w-full"
              disabled={!inStock || isAddingToCart}
              onClick={handleAddToCart}
            >
              {justAdded ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Added
                </>
              ) : isAddingToCart ? (
                "Adding..."
              ) : (
                <>
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Add to Cart
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-2">
          <h3 className="font-medium line-clamp-2 group-hover:text-primary transition-colors">
            {name}
          </h3>

          {rating && <RatingStars rating={rating} />}

          {/* Variants */}
          {variants && variants.length > 0 && (
            <VariantSelector
              variants={variants}
              selectedId={selectedVariant}
              onChange={setSelectedVariant}
            />
          )}

          {/* Price */}
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold">{formatPrice(price)}</span>
            {price.compareAt && (
              <span className="text-sm text-muted-foreground line-through">
                {formatPrice({ ...price, amount: price.compareAt })}
              </span>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}
```

### Key Implementation Notes

1. **Image Gallery**: Hover-to-cycle with navigation
2. **Variant Selection**: Color swatches and size buttons
3. **Price Formatting**: Currency formatting with sale prices
4. **Add to Cart**: Optimistic UI with confirmation state

## Variants

### Basic Product Card

```tsx
<ProductCard
  id="prod-1"
  name="Premium Wireless Headphones"
  href="/products/headphones"
  images={[
    { src: "/products/headphones-1.jpg", alt: "Headphones front view" },
    { src: "/products/headphones-2.jpg", alt: "Headphones side view" },
  ]}
  price={{ amount: 299, compareAt: 399 }}
  rating={{ average: 4.5, count: 128 }}
  badge="Sale"
  onAddToCart={(id) => addToCart(id)}
/>
```

### With Variants

```tsx
<ProductCard
  id="prod-2"
  name="Cotton T-Shirt"
  href="/products/tshirt"
  images={[{ src: "/products/tshirt.jpg", alt: "T-shirt" }]}
  price={{ amount: 29 }}
  variants={[
    { id: "black", name: "Black", value: "BK", type: "color", colorHex: "#000", available: true },
    { id: "white", name: "White", value: "WH", type: "color", colorHex: "#fff", available: true },
    { id: "s", name: "Small", value: "S", type: "size", available: true },
    { id: "m", name: "Medium", value: "M", type: "size", available: false },
    { id: "l", name: "Large", value: "L", type: "size", available: true },
  ]}
  onAddToCart={(id, variant) => addToCart(id, variant)}
/>
```

### Horizontal Layout

```tsx
<ProductCard
  layout="horizontal"
  id="prod-3"
  name="Laptop Stand"
  description="Ergonomic aluminum laptop stand with adjustable height"
  href="/products/laptop-stand"
  images={[{ src: "/products/stand.jpg", alt: "Laptop stand" }]}
  price={{ amount: 79 }}
/>
```

### With Wishlist

```tsx
<ProductCard
  id="prod-4"
  name="Smart Watch"
  href="/products/watch"
  images={[{ src: "/products/watch.jpg", alt: "Smart watch" }]}
  price={{ amount: 199 }}
  isWishlisted={wishlist.includes("prod-4")}
  onWishlistToggle={(id) => toggleWishlist(id)}
  onQuickView={(id) => openQuickView(id)}
/>
```

## Performance

### Image Optimization

- Use Next.js Image with proper sizes
- Lazy load off-screen cards
- Consider blur placeholders

### Interaction

- Debounce add to cart
- Optimistic wishlist updates
- Preload product pages on hover

## States

| State | Description | Visual Change |
|-------|-------------|---------------|
| Default | Card in normal display state | Standard card styling, action buttons hidden |
| Hover | Mouse over product card | Shadow increase, quick action buttons appear, add-to-cart slides up |
| Image Hover | Mouse over image gallery | Navigation arrows appear, auto-cycle through images |
| Wishlisted | Product added to wishlist | Heart icon filled with red color |
| Out of Stock | Product not available | "Out of stock" badge, add-to-cart button disabled |
| On Sale | Product has discount | "Sale" badge, original price struck through, discount percentage badge |
| Variant Selected | Color/size variant chosen | Selected variant has primary border/ring, size button filled |
| Variant Unavailable | Variant not in stock | Variant button shows reduced opacity, strikethrough for sizes |
| Adding to Cart | Add to cart in progress | Button shows "Adding..." text |
| Just Added | Successfully added to cart | Button shows checkmark with "Added" text for 2 seconds |
| Loading (Skeleton) | Product data loading | Skeleton placeholders for image, title, and price |
| Quick View Open | Quick view modal triggered | onQuickView callback fired (modal handled externally) |

## Anti-patterns

### Bad: Not debouncing add-to-cart clicks

```tsx
// Bad - Multiple rapid clicks add multiple items
<Button onClick={() => onAddToCart(id)}>
  Add to Cart
</Button>

// Good - Prevent duplicate submissions with loading state
const [isAddingToCart, setIsAddingToCart] = useState(false);

const handleAddToCart = async (e: React.MouseEvent) => {
  e.preventDefault();
  if (isAddingToCart || !inStock) return;

  setIsAddingToCart(true);
  try {
    await onAddToCart(id, selectedVariant);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2000);
  } finally {
    setIsAddingToCart(false);
  }
};
```

### Bad: Not using Next.js Image optimization

```tsx
// Bad - Regular img tag without optimization
<img
  src={product.image}
  alt={product.name}
  className="w-full h-full object-cover"
/>

// Good - Use Next.js Image with proper sizes
<Image
  src={images[currentIndex].src}
  alt={images[currentIndex].alt}
  fill
  className="object-cover"
  sizes="(max-width: 768px) 50vw, 25vw"
  priority={false}
/>
```

### Bad: Price formatting without Intl API

```tsx
// Bad - String concatenation for price
<span>${price.amount}</span>

// Good - Use Intl.NumberFormat for proper currency formatting
function formatPrice(price: ProductPrice): string {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: price.currency ?? 'USD',
  });
  return formatter.format(price.amount);
}

<span>{formatPrice(price)}</span>
```

### Bad: Not handling variant availability

```tsx
// Bad - All variants appear clickable
{variants.map(variant => (
  <button onClick={() => setSelected(variant.id)}>
    {variant.name}
  </button>
))}

// Good - Disable unavailable variants with visual feedback
<button
  onClick={(e) => {
    e.preventDefault();
    if (variant.available) onChange(variant.id);
  }}
  disabled={!variant.available}
  className={cn(
    'px-2 py-1 rounded border',
    selectedId === variant.id && 'border-primary bg-primary text-primary-foreground',
    !variant.available && 'opacity-50 cursor-not-allowed line-through'
  )}
>
  {variant.value}
</button>
```

## Accessibility

### Required Attributes

- Images have descriptive alt text
- Buttons have aria-labels
- Variants have visible labels

### Screen Reader

- Product name links to detail page
- Price changes announced
- Cart confirmation announced

### Keyboard Navigation

- Tab through interactive elements
- Enter/Space for actions
- Arrow keys for image navigation

## Dependencies

```json
{
  "dependencies": {
    "framer-motion": "^11.0.0",
    "lucide-react": "^0.460.0"
  }
}
```

## Related Skills

### Composes Into
- [templates/product-listing](../templates/product-listing.md)
- [templates/shop-page](../templates/shop-page.md)

---

## Changelog

### 2.0.0 (2025-01-17)
- Standardized to atomic design system v2
- Updated frontmatter schema
- Added explicit composition references

### 1.0.0 (2025-01-16)
- Initial implementation
- Image gallery with hover cycling
- Variant selection
- Wishlist and quick view
