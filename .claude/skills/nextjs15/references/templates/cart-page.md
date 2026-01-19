---
id: t-cart-page
name: Cart Page
version: 2.0.0
layer: L4
category: pages
description: Shopping cart page with items, quantities, and checkout flow
tags: [page, cart, ecommerce, shopping, checkout]
composes:
  - ../organisms/cart.md
  - ../organisms/checkout-summary.md
  - ../molecules/form-field.md
formula: "CartPage = Cart(o-cart) + CheckoutSummary(o-checkout-summary) + PromoCodeField(m-form-field) + RecentlyViewed"
dependencies: []
performance:
  impact: medium
  lcp: medium
  cls: medium
accessibility:
  wcag: AA
  keyboard: true
  screen-reader: true
---

# Cart Page

## Overview

The Cart Page template provides a complete shopping cart view. Features item management, quantity updates, promo codes, order summary, and checkout initiation. Designed for easy cart management before checkout.

## When to Use

Use this skill when:
- Building cart pages
- Creating basket views
- Building order review before checkout

## Composition Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                            Cart Page                                    │
├─────────────────────────────────────────────────────────────────────────┤
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                       Page Header                                 │  │
│  │  "Shopping Cart" (X items)                                        │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│  ┌─────────────────────────────────────────┬─────────────────────────┐  │
│  │                                         │                         │  │
│  │          Cart Items (o-cart)            │  Checkout Summary       │  │
│  │                                         │  (o-checkout-summary)   │  │
│  │  ┌───────────────────────────────────┐  │  ┌─────────────────┐    │  │
│  │  │ [Img] Product Name                │  │  │ Subtotal  $XX   │    │  │
│  │  │       Size: M | Color: Blue       │  │  │ Discount  -$XX  │    │  │
│  │  │       [-] 2 [+]         $99.00    │  │  │ Shipping  $XX   │    │  │
│  │  │                      [Remove]     │  │  │ Tax       $XX   │    │  │
│  │  └───────────────────────────────────┘  │  │ ───────────────│    │  │
│  │                                         │  │ Total    $XXX   │    │  │
│  │  ┌───────────────────────────────────┐  │  └─────────────────┘    │  │
│  │  │ [Img] Product Name 2              │  │                         │  │
│  │  │       Size: L                     │  │  Promo Code             │  │
│  │  │       [-] 1 [+]         $49.00    │  │  (m-form-field)         │  │
│  │  │                      [Remove]     │  │  ┌─────────────────┐    │  │
│  │  └───────────────────────────────────┘  │  │ [Enter code  ]  │    │  │
│  │                                         │  │ [Apply]         │    │  │
│  │                                         │  └─────────────────┘    │  │
│  │  [Continue Shopping]                    │                         │  │
│  │                                         │  [Proceed to Checkout]  │  │
│  │                                         │                         │  │
│  └─────────────────────────────────────────┴─────────────────────────┘  │
│                                                                         │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                     Recently Viewed                               │  │
│  │  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────────┐  │  │
│  │  │ [Product Img]   │ │ [Product Img]   │ │ [Product Img]       │  │  │
│  │  │ Product Name    │ │ Product Name    │ │ Product Name        │  │  │
│  │  │ $XX.XX          │ │ $XX.XX          │ │ $XX.XX              │  │  │
│  │  └─────────────────┘ └─────────────────┘ └─────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                    Empty State (if cart empty)                    │  │
│  │  [Shopping Bag Icon]                                              │  │
│  │  "Your cart is empty"                                             │  │
│  │  [Browse Products ->] [Go to Homepage]                            │  │
│  └───────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
```

## Organisms Used

- [cart](../organisms/cart.md) - Cart functionality

## Implementation

```typescript
// app/(shop)/cart/page.tsx
import { Metadata } from "next";
import { getCart } from "@/lib/cart";
import { Cart } from "@/components/organisms/cart";
import { RecentlyViewed } from "@/components/shop/recently-viewed";
import { CartEmpty } from "@/components/shop/cart-empty";

export const metadata: Metadata = {
  title: "Shopping Cart",
  robots: { index: false },
};

export default async function CartPage() {
  const cart = await getCart();

  if (!cart || cart.items.length === 0) {
    return <CartEmpty />;
  }

  return (
    <div className="container py-8">
      <Cart
        variant="page"
        items={cart.items}
        summary={{
          subtotal: cart.subtotal,
          discount: cart.discount,
          shipping: cart.estimatedShipping,
          tax: cart.estimatedTax,
          total: cart.total,
        }}
        promoCode={cart.promoCode}
        showPromoCode
        onUpdateQuantity={async (itemId, quantity) => {
          "use server";
          await updateCartItem(itemId, quantity);
        }}
        onRemoveItem={async (itemId) => {
          "use server";
          await removeCartItem(itemId);
        }}
        onApplyPromoCode={async (code) => {
          "use server";
          return await applyPromoCode(code);
        }}
        onRemovePromoCode={async () => {
          "use server";
          await removePromoCode();
        }}
        onCheckout={() => {
          redirect("/checkout");
        }}
        onContinueShopping={() => {
          redirect("/products");
        }}
        checkoutLabel="Proceed to Checkout"
      />

      {/* Recently Viewed */}
      <section className="mt-16">
        <h2 className="text-2xl font-bold mb-6">Recently Viewed</h2>
        <RecentlyViewed />
      </section>
    </div>
  );
}
```

### Cart Empty Component

```typescript
// components/shop/cart-empty.tsx
import Link from "next/link";
import { ShoppingBag, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CartEmpty() {
  return (
    <div className="container py-16">
      <div className="max-w-md mx-auto text-center">
        <div className="inline-flex items-center justify-center h-24 w-24 rounded-full bg-muted mb-6">
          <ShoppingBag className="h-12 w-12 text-muted-foreground" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Your cart is empty</h1>
        <p className="text-muted-foreground mb-8">
          Looks like you haven't added any items to your cart yet. 
          Browse our collection to find something you'll love.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild>
            <Link href="/products">
              Browse Products
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/">Go to Homepage</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
```

### Server Actions

```typescript
// app/actions/cart.ts
"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";

export async function updateCartItem(itemId: string, quantity: number) {
  const cookieStore = await cookies();
  const cartId = cookieStore.get("cart_id")?.value;
  
  if (!cartId) throw new Error("Cart not found");

  await prisma.cartItem.update({
    where: { id: itemId, cartId },
    data: { quantity },
  });

  revalidatePath("/cart");
}

export async function removeCartItem(itemId: string) {
  const cookieStore = await cookies();
  const cartId = cookieStore.get("cart_id")?.value;
  
  if (!cartId) throw new Error("Cart not found");

  await prisma.cartItem.delete({
    where: { id: itemId, cartId },
  });

  revalidatePath("/cart");
}

export async function applyPromoCode(code: string): Promise<boolean> {
  const cookieStore = await cookies();
  const cartId = cookieStore.get("cart_id")?.value;
  
  if (!cartId) throw new Error("Cart not found");

  // Validate promo code
  const promo = await prisma.promoCode.findUnique({
    where: { code: code.toUpperCase(), active: true },
  });

  if (!promo) return false;

  // Apply to cart
  await prisma.cart.update({
    where: { id: cartId },
    data: {
      promoCodeId: promo.id,
      discount: promo.type === "percent"
        ? (promo.value / 100) * (await getCartSubtotal(cartId))
        : promo.value,
    },
  });

  revalidatePath("/cart");
  return true;
}

export async function removePromoCode() {
  const cookieStore = await cookies();
  const cartId = cookieStore.get("cart_id")?.value;
  
  if (!cartId) throw new Error("Cart not found");

  await prisma.cart.update({
    where: { id: cartId },
    data: {
      promoCodeId: null,
      discount: 0,
    },
  });

  revalidatePath("/cart");
}
```

## Key Implementation Notes

1. **Server Actions**: Cart updates via server actions
2. **Optimistic Updates**: UI updates before server confirms
3. **Promo Codes**: Validation and application
4. **Empty State**: Helpful empty cart message
5. **Cross-sells**: Recently viewed products

## Variants

### Compact Cart

```tsx
// For cart drawer/sidebar
<Cart
  variant="drawer"
  items={items}
  summary={summary}
  onCheckout={() => router.push("/checkout")}
>
  <CartButton count={itemCount} />
</Cart>
```

### Cart with Recommendations

```tsx
<div className="container py-8">
  <div className="grid lg:grid-cols-[1fr_400px] gap-8">
    <div>
      <CartItems items={items} />
      
      {/* Frequently Bought Together */}
      <section className="mt-8 p-6 border rounded-lg">
        <h3 className="font-semibold mb-4">Frequently Bought Together</h3>
        <ProductBundle products={bundleProducts} />
      </section>
    </div>
    
    <CartSummary summary={summary} />
  </div>
</div>
```

## Performance

### Data Loading

- Cart loaded server-side
- Optimistic updates for changes
- Revalidation on mutations

### UX Optimization

- Debounce quantity changes
- Loading states on actions
- Error recovery

## Accessibility

### Required Features

- Quantity controls labeled
- Remove buttons described
- Promo code form accessible
- Summary totals announced

### Screen Reader

- Cart updates announced
- Item removal confirmed
- Total changes communicated

## Error States

### Cart Loading Error

```tsx
// app/(shop)/cart/error.tsx
"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ShoppingCart, RefreshCw, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function CartError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Cart error:", error);
  }, [error]);

  return (
    <div className="container py-16">
      <div className="max-w-md mx-auto text-center space-y-6">
        <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-destructive/10">
          <AlertCircle className="h-10 w-10 text-destructive" />
        </div>
        <h1 className="text-2xl font-bold">Failed to load cart</h1>
        <p className="text-muted-foreground">
          There was an error loading your shopping cart. Please try again.
        </p>
        <div className="flex gap-4 justify-center">
          <Button onClick={reset}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Try again
          </Button>
          <Button variant="outline" asChild>
            <Link href="/products">Continue shopping</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
```

### Cart Item Update Errors

```tsx
"use client";

import { useState } from "react";
import { toast } from "sonner";
import { updateCartItem, removeCartItem } from "@/app/actions/cart";

export function CartItemActions({ itemId }: { itemId: string }) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleQuantityChange = async (quantity: number) => {
    setIsUpdating(true);
    setError(null);

    try {
      const result = await updateCartItem(itemId, quantity);

      if (result.error) {
        if (result.error === "OUT_OF_STOCK") {
          setError(`Only ${result.availableStock} available`);
          toast.error("Not enough stock available");
        } else if (result.error === "ITEM_NOT_FOUND") {
          toast.error("Item no longer exists");
        } else {
          toast.error("Failed to update quantity");
        }
        return;
      }

      toast.success("Cart updated");
    } catch (err) {
      setError("Failed to update");
      toast.error("Something went wrong");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemove = async () => {
    try {
      await removeCartItem(itemId);
      toast.success("Item removed from cart");
    } catch (err) {
      toast.error("Failed to remove item");
    }
  };

  return (
    <div className="space-y-2">
      <QuantitySelector
        onChange={handleQuantityChange}
        disabled={isUpdating}
      />
      {error && (
        <p className="text-xs text-destructive flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          {error}
        </p>
      )}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleRemove}
        className="text-muted-foreground hover:text-destructive"
      >
        Remove
      </Button>
    </div>
  );
}
```

### Promo Code Errors

```tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertCircle, Check, Loader2, X } from "lucide-react";
import { applyPromoCode, removePromoCode } from "@/app/actions/cart";

type PromoError = "INVALID" | "EXPIRED" | "MIN_ORDER" | "ALREADY_USED" | "ERROR";

const errorMessages: Record<PromoError, string> = {
  INVALID: "This promo code is invalid",
  EXPIRED: "This promo code has expired",
  MIN_ORDER: "Minimum order amount not met",
  ALREADY_USED: "You've already used this code",
  ERROR: "Failed to apply promo code",
};

export function PromoCodeForm({ appliedCode }: { appliedCode?: string }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState<PromoError | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const result = await applyPromoCode(code);

      if (!result.success) {
        setError(result.error as PromoError);
        return;
      }

      setSuccess(true);
      setCode("");
    } catch (err) {
      setError("ERROR");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemove = async () => {
    try {
      await removePromoCode();
    } catch (err) {
      // Handle silently
    }
  };

  if (appliedCode) {
    return (
      <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
        <div className="flex items-center gap-2">
          <Check className="h-4 w-4 text-green-600" />
          <span className="text-sm font-medium">{appliedCode}</span>
        </div>
        <Button variant="ghost" size="sm" onClick={handleRemove}>
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleApply} className="space-y-2">
      <div className="flex gap-2">
        <Input
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="Enter promo code"
          className={error ? "border-destructive" : ""}
        />
        <Button type="submit" disabled={isLoading || !code.trim()}>
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "Apply"
          )}
        </Button>
      </div>
      {error && (
        <p className="text-sm text-destructive flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          {errorMessages[error]}
        </p>
      )}
    </form>
  );
}
```

### Stock Validation Error

```tsx
// Server action with stock validation
"use server";

export async function validateCart() {
  const cart = await getCart();
  const errors: CartError[] = [];

  for (const item of cart.items) {
    const product = await getProduct(item.productId);

    if (!product) {
      errors.push({
        itemId: item.id,
        type: "REMOVED",
        message: "This product is no longer available",
      });
      continue;
    }

    if (product.stock < item.quantity) {
      errors.push({
        itemId: item.id,
        type: "STOCK",
        message: `Only ${product.stock} available`,
        availableStock: product.stock,
      });
    }

    if (product.price !== item.price) {
      errors.push({
        itemId: item.id,
        type: "PRICE_CHANGED",
        message: "Price has changed",
        newPrice: product.price,
      });
    }
  }

  return { errors };
}

// Display cart errors
export function CartErrors({ errors }: { errors: CartError[] }) {
  if (errors.length === 0) return null;

  return (
    <Alert variant="destructive" className="mb-6">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Cart issues</AlertTitle>
      <AlertDescription>
        <ul className="list-disc pl-4 mt-2 space-y-1">
          {errors.map((error, i) => (
            <li key={i} className="text-sm">{error.message}</li>
          ))}
        </ul>
      </AlertDescription>
    </Alert>
  );
}
```

## Loading States

### Full Cart Loading

```tsx
// app/(shop)/cart/loading.tsx
import { Skeleton } from "@/components/ui/skeleton";

export default function CartLoading() {
  return (
    <div className="container py-8 animate-pulse">
      {/* Header */}
      <Skeleton className="h-8 w-48 mb-8" />

      <div className="grid lg:grid-cols-[1fr_400px] gap-8">
        {/* Cart Items */}
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex gap-4 p-4 border rounded-lg">
              <Skeleton className="h-24 w-24 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-4 w-24" />
                <div className="flex justify-between mt-4">
                  <Skeleton className="h-9 w-28" />
                  <Skeleton className="h-5 w-16" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="lg:sticky lg:top-24 h-fit">
          <div className="border rounded-lg p-6 space-y-4">
            <Skeleton className="h-6 w-32" />
            <div className="space-y-2">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-16" />
              </div>
              <div className="flex justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-16" />
              </div>
              <div className="flex justify-between">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-16" />
              </div>
            </div>
            <Skeleton className="h-px w-full" />
            <div className="flex justify-between">
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-5 w-20" />
            </div>
            <Skeleton className="h-11 w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
```

### Optimistic Updates

```tsx
"use client";

import { useOptimistic, useTransition } from "react";
import { updateCartItem } from "@/app/actions/cart";

export function CartItem({ item }: { item: CartItem }) {
  const [isPending, startTransition] = useTransition();
  const [optimisticQuantity, setOptimisticQuantity] = useOptimistic(
    item.quantity,
    (_, newQuantity: number) => newQuantity
  );

  const handleQuantityChange = (newQuantity: number) => {
    startTransition(async () => {
      setOptimisticQuantity(newQuantity);
      await updateCartItem(item.id, newQuantity);
    });
  };

  return (
    <div className={cn("flex gap-4", isPending && "opacity-60")}>
      <Image src={item.image} alt={item.name} width={96} height={96} />
      <div className="flex-1">
        <h3 className="font-medium">{item.name}</h3>
        <QuantitySelector
          value={optimisticQuantity}
          onChange={handleQuantityChange}
          disabled={isPending}
        />
        <p className="font-medium">
          ${(item.price * optimisticQuantity).toFixed(2)}
        </p>
      </div>
    </div>
  );
}
```

### Recently Viewed Loading

```tsx
import { Suspense } from "react";

function RecentlyViewedSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="aspect-square rounded-lg" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-16" />
        </div>
      ))}
    </div>
  );
}

export function CartPage() {
  return (
    <>
      <Cart />

      <section className="mt-16">
        <h2 className="text-2xl font-bold mb-6">Recently Viewed</h2>
        <Suspense fallback={<RecentlyViewedSkeleton />}>
          <RecentlyViewed />
        </Suspense>
      </section>
    </>
  );
}
```

## Mobile Responsiveness

### Responsive Layout Breakdown

| Breakpoint | Layout Changes |
|------------|----------------|
| `< 640px` (mobile) | Single column, summary at bottom, compact items |
| `640px - 1024px` (tablet) | Single column with larger items |
| `> 1024px` (desktop) | Two columns with sticky summary |

### Mobile-First Implementation

```tsx
export default function CartPage({ cart }: { cart: Cart }) {
  return (
    <div className="container py-6 sm:py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">
          Shopping Cart
          <span className="text-muted-foreground font-normal ml-2">
            ({cart.items.length} {cart.items.length === 1 ? "item" : "items"})
          </span>
        </h1>
        <Button variant="ghost" size="sm" asChild className="hidden sm:flex">
          <Link href="/products">Continue Shopping</Link>
        </Button>
      </div>

      <div className="lg:grid lg:grid-cols-[1fr_380px] xl:grid-cols-[1fr_400px] lg:gap-8">
        {/* Cart Items */}
        <div className="space-y-3 sm:space-y-4">
          {cart.items.map((item) => (
            <div
              key={item.id}
              className="flex gap-3 sm:gap-4 p-3 sm:p-4 border rounded-lg"
            >
              {/* Product Image */}
              <div className="relative h-20 w-20 sm:h-24 sm:w-24 flex-shrink-0">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-cover rounded-md"
                />
              </div>

              {/* Product Details */}
              <div className="flex-1 min-w-0">
                <div className="flex justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="font-medium text-sm sm:text-base truncate">
                      {item.name}
                    </h3>
                    {item.variant && (
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        {item.variant}
                      </p>
                    )}
                  </div>
                  {/* Price - Desktop only, mobile shows below */}
                  <p className="font-medium text-sm sm:text-base hidden sm:block">
                    ${(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>

                {/* Actions Row */}
                <div className="flex items-center justify-between mt-3 sm:mt-4">
                  {/* Quantity Selector */}
                  <div className="flex items-center gap-1 sm:gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-7 w-7 sm:h-8 sm:w-8"
                    >
                      <Minus className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                    <span className="w-8 text-center text-sm sm:text-base">
                      {item.quantity}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-7 w-7 sm:h-8 sm:w-8"
                    >
                      <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                  </div>

                  {/* Price - Mobile only */}
                  <p className="font-medium text-sm sm:hidden">
                    ${(item.price * item.quantity).toFixed(2)}
                  </p>

                  {/* Remove Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs sm:text-sm text-muted-foreground"
                  >
                    <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1" />
                    <span className="hidden sm:inline">Remove</span>
                  </Button>
                </div>
              </div>
            </div>
          ))}

          {/* Continue Shopping - Mobile */}
          <Button variant="outline" asChild className="w-full sm:hidden">
            <Link href="/products">Continue Shopping</Link>
          </Button>
        </div>

        {/* Order Summary */}
        <div className="mt-8 lg:mt-0">
          <div className="lg:sticky lg:top-24 border rounded-lg p-4 sm:p-6 space-y-4">
            <h2 className="font-semibold text-base sm:text-lg">Order Summary</h2>

            {/* Summary Lines */}
            <div className="space-y-2 text-sm sm:text-base">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>${cart.subtotal.toFixed(2)}</span>
              </div>
              {cart.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>-${cart.discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span>
                  {cart.shipping === 0 ? "Free" : `$${cart.shipping.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax</span>
                <span>${cart.tax.toFixed(2)}</span>
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-between font-semibold text-base sm:text-lg">
                <span>Total</span>
                <span>${cart.total.toFixed(2)}</span>
              </div>
            </div>

            {/* Promo Code */}
            <PromoCodeForm appliedCode={cart.promoCode} />

            {/* Checkout Button */}
            <Button asChild className="w-full h-11 sm:h-12 text-sm sm:text-base">
              <Link href="/checkout">Proceed to Checkout</Link>
            </Button>

            {/* Trust Badges */}
            <div className="flex items-center justify-center gap-4 pt-2">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Lock className="h-3 w-3" />
                <span>Secure checkout</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <RefreshCw className="h-3 w-3" />
                <span>Easy returns</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recently Viewed - Horizontal scroll on mobile */}
      <section className="mt-12 sm:mt-16">
        <h2 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6">
          Recently Viewed
        </h2>
        <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
          <div className="flex sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-4 min-w-max sm:min-w-0">
            {recentlyViewed.map((product) => (
              <div key={product.id} className="w-40 sm:w-auto flex-shrink-0 sm:flex-shrink">
                <ProductCard product={product} compact />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
```

### Mobile Empty Cart

```tsx
export function CartEmpty() {
  return (
    <div className="container py-12 sm:py-16">
      <div className="max-w-md mx-auto text-center px-4">
        <div className="inline-flex items-center justify-center h-20 w-20 sm:h-24 sm:w-24 rounded-full bg-muted mb-4 sm:mb-6">
          <ShoppingBag className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground" />
        </div>
        <h1 className="text-xl sm:text-2xl font-bold mb-2">Your cart is empty</h1>
        <p className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8">
          Looks like you haven't added any items to your cart yet.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
          <Button asChild className="h-11 sm:h-auto">
            <Link href="/products">
              Browse Products
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button variant="outline" asChild className="h-11 sm:h-auto">
            <Link href="/">Go to Homepage</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
```

## Related Skills

### Related Pages
- [product-detail](./product-detail.md)
- [checkout-page](./checkout-page.md)

---

## Changelog

### 1.0.0 (2025-01-16)
- Initial implementation
- Server actions for cart
- Promo code support
- Empty state
