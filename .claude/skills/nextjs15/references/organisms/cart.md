---
id: o-cart
name: Shopping Cart
version: 2.0.0
layer: L3
category: commerce
description: Shopping cart with items, quantities, and order summary
tags: [cart, shopping, commerce, ecommerce, checkout, basket]
formula: "Cart = CartItem(Card + QuantityInput + RemoveButton)[] + OrderSummary + PromoCode(Input) + CheckoutButton(a-button) + Separator(a-separator)"
composes:
  - ../molecules/card.md
dependencies: [framer-motion, lucide-react, nuqs]
performance:
  impact: medium
  lcp: low
  cls: medium
accessibility:
  wcag: AA
  keyboard: true
  screen-reader: true
---

# Shopping Cart

## Overview

The Shopping Cart organism provides a full shopping cart experience with item management, quantity controls, pricing summaries, and checkout flow. Supports both page and drawer/sidebar layouts.

## When to Use

Use this skill when:
- Building e-commerce checkout flows
- Creating cart sidebars/drawers
- Displaying order summaries
- Managing shopping sessions

## Composition Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                           Cart (L3)                              │
├─────────────────────────────────────────────────────────────────┤
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  Header                                                    │  │
│  │  Your Cart (3 items)          Badge(a-badge)               │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  CartItem (Card m-card)                                    │  │
│  │  ┌────────┐ Product Name              ┌─────────┐         │  │
│  │  │ Image  │ Size: M, Color: Blue      │ [-][2][+]│ $49.99 │  │
│  │  │        │                           │Input     │         │  │
│  │  └────────┘                           └─────────┘  [🗑️]   │  │
│  └───────────────────────────────────────────────────────────┘  │
│  ─────────────────── Separator(a-separator) ─────────────────── │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  CartItem (Card m-card)                                    │  │
│  │  ┌────────┐ Another Product           ┌─────────┐         │  │
│  │  │ Image  │ Size: L                   │ [-][1][+]│ $29.99 │  │
│  │  │        │                           │Input     │         │  │
│  │  └────────┘                           └─────────┘  [🗑️]   │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  Promo Code                                                │  │
│  │  ┌────────────────────────────────┐  ┌─────────────────┐  │  │
│  │  │ Enter code        Input(a-inp) │  │ Apply Button    │  │  │
│  │  └────────────────────────────────┘  └─────────────────┘  │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  Order Summary                                             │  │
│  │  Subtotal:                                        $129.97  │  │
│  │  Shipping:                                          $9.99  │  │
│  │  Tax:                                              $11.70  │  │
│  │  ───────────────────────────────────────────────────────   │  │
│  │  Total:                                           $151.66  │  │
│  │                                                           │  │
│  │  ┌─────────────────────────────────────────────────────┐  │  │
│  │  │       Proceed to Checkout   Button(a-button)        │  │  │
│  │  └─────────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## Molecules Used

- [card](../molecules/card.md) - Item containers
- [input](../atoms/input.md) - Quantity input
- [button](../atoms/button.md) - Actions
- [separator](../atoms/separator.md) - Visual dividers

## Implementation

```typescript
// components/organisms/cart.tsx
"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Minus,
  Plus,
  Trash2,
  ShoppingBag,
  ArrowRight,
  Tag,
  Loader2,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";

interface CartItem {
  id: string;
  productId: string;
  name: string;
  href: string;
  image: string;
  price: number;
  compareAtPrice?: number;
  quantity: number;
  maxQuantity?: number;
  variant?: {
    name: string;
    value: string;
  };
}

interface CartSummary {
  subtotal: number;
  discount?: number;
  shipping?: number;
  tax?: number;
  total: number;
}

interface CartProps {
  /** Cart items */
  items: CartItem[];
  /** Cart summary */
  summary: CartSummary;
  /** Currency code */
  currency?: string;
  /** Layout variant */
  variant?: "page" | "drawer" | "mini";
  /** Show promo code input */
  showPromoCode?: boolean;
  /** Applied promo code */
  promoCode?: string;
  /** Is loading */
  isLoading?: boolean;
  /** Update item quantity */
  onUpdateQuantity: (itemId: string, quantity: number) => Promise<void>;
  /** Remove item */
  onRemoveItem: (itemId: string) => Promise<void>;
  /** Apply promo code */
  onApplyPromoCode?: (code: string) => Promise<boolean>;
  /** Remove promo code */
  onRemovePromoCode?: () => void;
  /** Checkout handler */
  onCheckout: () => void;
  /** Continue shopping handler */
  onContinueShopping?: () => void;
  /** Empty cart message */
  emptyMessage?: string;
  /** Checkout button text */
  checkoutLabel?: string;
  /** Additional class names */
  className?: string;
}

function formatPrice(amount: number, currency: string = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount);
}

function CartItemRow({
  item,
  currency,
  onUpdateQuantity,
  onRemove,
  isUpdating,
  compact = false,
}: {
  item: CartItem;
  currency: string;
  onUpdateQuantity: (quantity: number) => void;
  onRemove: () => void;
  isUpdating: boolean;
  compact?: boolean;
}) {
  const [localQuantity, setLocalQuantity] = React.useState(item.quantity);
  const [isRemoving, setIsRemoving] = React.useState(false);

  React.useEffect(() => {
    setLocalQuantity(item.quantity);
  }, [item.quantity]);

  const handleQuantityChange = async (newQuantity: number) => {
    if (newQuantity < 1) return;
    if (item.maxQuantity && newQuantity > item.maxQuantity) return;
    
    setLocalQuantity(newQuantity);
    onUpdateQuantity(newQuantity);
  };

  const handleRemove = async () => {
    setIsRemoving(true);
    await onRemove();
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className={cn(
        "flex gap-4",
        compact ? "py-3" : "py-4",
        isRemoving && "opacity-50"
      )}
    >
      {/* Image */}
      <Link
        href={item.href}
        className={cn(
          "relative flex-shrink-0 overflow-hidden rounded-md bg-muted",
          compact ? "h-16 w-16" : "h-24 w-24"
        )}
      >
        <Image
          src={item.image}
          alt={item.name}
          fill
          className="object-cover"
        />
      </Link>

      {/* Details */}
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-start justify-between gap-2">
          <div>
            <Link
              href={item.href}
              className="font-medium hover:underline line-clamp-2"
            >
              {item.name}
            </Link>
            {item.variant && (
              <p className="text-sm text-muted-foreground">
                {item.variant.name}: {item.variant.value}
              </p>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
            onClick={handleRemove}
            disabled={isRemoving}
          >
            {isRemoving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
          </Button>
        </div>

        <div className="flex items-center justify-between gap-4">
          {/* Quantity controls */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => handleQuantityChange(localQuantity - 1)}
              disabled={localQuantity <= 1 || isUpdating}
            >
              <Minus className="h-3 w-3" />
            </Button>
            <span className="w-8 text-center font-medium tabular-nums">
              {localQuantity}
            </span>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => handleQuantityChange(localQuantity + 1)}
              disabled={
                (item.maxQuantity !== undefined && localQuantity >= item.maxQuantity) ||
                isUpdating
              }
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>

          {/* Price */}
          <div className="text-right">
            <p className="font-medium">
              {formatPrice(item.price * item.quantity, currency)}
            </p>
            {item.compareAtPrice && (
              <p className="text-sm text-muted-foreground line-through">
                {formatPrice(item.compareAtPrice * item.quantity, currency)}
              </p>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function PromoCodeInput({
  appliedCode,
  onApply,
  onRemove,
}: {
  appliedCode?: string;
  onApply: (code: string) => Promise<boolean>;
  onRemove: () => void;
}) {
  const [code, setCode] = React.useState("");
  const [isApplying, setIsApplying] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleApply = async () => {
    if (!code.trim()) return;
    
    setIsApplying(true);
    setError(null);
    
    try {
      const success = await onApply(code.trim().toUpperCase());
      if (success) {
        setCode("");
      } else {
        setError("Invalid promo code");
      }
    } catch {
      setError("Failed to apply code");
    } finally {
      setIsApplying(false);
    }
  };

  if (appliedCode) {
    return (
      <div className="flex items-center justify-between p-3 rounded-md bg-green-50 dark:bg-green-950">
        <div className="flex items-center gap-2">
          <Tag className="h-4 w-4 text-green-600" />
          <span className="text-sm font-medium text-green-600">
            {appliedCode}
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-auto p-1 text-green-600 hover:text-green-700"
          onClick={onRemove}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input
          placeholder="Promo code"
          value={code}
          onChange={(e) => {
            setCode(e.target.value.toUpperCase());
            setError(null);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleApply();
          }}
          className="uppercase"
        />
        <Button
          variant="outline"
          onClick={handleApply}
          disabled={!code.trim() || isApplying}
        >
          {isApplying ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "Apply"
          )}
        </Button>
      </div>
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  );
}

function CartSummarySection({
  summary,
  currency,
}: {
  summary: CartSummary;
  currency: string;
}) {
  return (
    <div className="space-y-3">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">Subtotal</span>
        <span>{formatPrice(summary.subtotal, currency)}</span>
      </div>

      {summary.discount && summary.discount > 0 && (
        <div className="flex justify-between text-sm text-green-600">
          <span>Discount</span>
          <span>-{formatPrice(summary.discount, currency)}</span>
        </div>
      )}

      {summary.shipping !== undefined && (
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Shipping</span>
          <span>
            {summary.shipping === 0
              ? "Free"
              : formatPrice(summary.shipping, currency)}
          </span>
        </div>
      )}

      {summary.tax !== undefined && summary.tax > 0 && (
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Tax</span>
          <span>{formatPrice(summary.tax, currency)}</span>
        </div>
      )}

      <Separator />

      <div className="flex justify-between font-medium text-lg">
        <span>Total</span>
        <span>{formatPrice(summary.total, currency)}</span>
      </div>
    </div>
  );
}

function EmptyCart({
  message = "Your cart is empty",
  onContinueShopping,
}: {
  message?: string;
  onContinueShopping?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <ShoppingBag className="h-16 w-16 text-muted-foreground/50 mb-4" />
      <h3 className="text-lg font-medium mb-2">{message}</h3>
      <p className="text-muted-foreground mb-6">
        Add some items to get started
      </p>
      {onContinueShopping && (
        <Button onClick={onContinueShopping}>
          Continue Shopping
        </Button>
      )}
    </div>
  );
}

// Page layout
function CartPage({
  items,
  summary,
  currency,
  showPromoCode,
  promoCode,
  isLoading,
  onUpdateQuantity,
  onRemoveItem,
  onApplyPromoCode,
  onRemovePromoCode,
  onCheckout,
  onContinueShopping,
  emptyMessage,
  checkoutLabel = "Checkout",
  className,
}: CartProps) {
  const [updatingItems, setUpdatingItems] = React.useState<Set<string>>(new Set());

  const handleUpdateQuantity = async (itemId: string, quantity: number) => {
    setUpdatingItems((prev) => new Set(prev).add(itemId));
    try {
      await onUpdateQuantity(itemId, quantity);
    } finally {
      setUpdatingItems((prev) => {
        const next = new Set(prev);
        next.delete(itemId);
        return next;
      });
    }
  };

  if (items.length === 0) {
    return (
      <div className={cn("container max-w-2xl py-12", className)}>
        <EmptyCart message={emptyMessage} onContinueShopping={onContinueShopping} />
      </div>
    );
  }

  return (
    <div className={cn("container py-8", className)}>
      <div className="grid lg:grid-cols-[1fr_400px] gap-8">
        {/* Cart Items */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">Shopping Cart</h1>
            <Badge variant="secondary">{items.length} items</Badge>
          </div>

          <div className="divide-y">
            <AnimatePresence>
              {items.map((item) => (
                <CartItemRow
                  key={item.id}
                  item={item}
                  currency={currency ?? "USD"}
                  onUpdateQuantity={(qty) => handleUpdateQuantity(item.id, qty)}
                  onRemove={() => onRemoveItem(item.id)}
                  isUpdating={updatingItems.has(item.id)}
                />
              ))}
            </AnimatePresence>
          </div>

          {onContinueShopping && (
            <Button
              variant="ghost"
              className="mt-4"
              onClick={onContinueShopping}
            >
              <ArrowRight className="h-4 w-4 mr-2 rotate-180" />
              Continue Shopping
            </Button>
          )}
        </div>

        {/* Summary */}
        <div>
          <div className="sticky top-24 rounded-lg border p-6 space-y-6">
            <h2 className="font-semibold text-lg">Order Summary</h2>

            {showPromoCode && onApplyPromoCode && onRemovePromoCode && (
              <PromoCodeInput
                appliedCode={promoCode}
                onApply={onApplyPromoCode}
                onRemove={onRemovePromoCode}
              />
            )}

            <CartSummarySection summary={summary} currency={currency ?? "USD"} />

            <Button
              className="w-full"
              size="lg"
              onClick={onCheckout}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              {checkoutLabel}
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              Shipping and taxes calculated at checkout
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Drawer layout
function CartDrawer({
  items,
  summary,
  currency,
  isLoading,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
  onContinueShopping,
  emptyMessage,
  checkoutLabel = "Checkout",
  children,
}: CartProps & { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  const [updatingItems, setUpdatingItems] = React.useState<Set<string>>(new Set());

  const handleUpdateQuantity = async (itemId: string, quantity: number) => {
    setUpdatingItems((prev) => new Set(prev).add(itemId));
    try {
      await onUpdateQuantity(itemId, quantity);
    } finally {
      setUpdatingItems((prev) => {
        const next = new Set(prev);
        next.delete(itemId);
        return next;
      });
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent className="flex flex-col w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            Shopping Cart
            <Badge variant="secondary">{items.length}</Badge>
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <EmptyCart
            message={emptyMessage}
            onContinueShopping={() => {
              setOpen(false);
              onContinueShopping?.();
            }}
          />
        ) : (
          <>
            <ScrollArea className="flex-1 -mx-6 px-6">
              <div className="divide-y">
                <AnimatePresence>
                  {items.map((item) => (
                    <CartItemRow
                      key={item.id}
                      item={item}
                      currency={currency ?? "USD"}
                      onUpdateQuantity={(qty) => handleUpdateQuantity(item.id, qty)}
                      onRemove={() => onRemoveItem(item.id)}
                      isUpdating={updatingItems.has(item.id)}
                      compact
                    />
                  ))}
                </AnimatePresence>
              </div>
            </ScrollArea>

            <SheetFooter className="flex-col gap-4 sm:flex-col">
              <CartSummarySection summary={summary} currency={currency ?? "USD"} />
              <Button
                className="w-full"
                size="lg"
                onClick={() => {
                  setOpen(false);
                  onCheckout();
                }}
                disabled={isLoading}
              >
                {isLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                {checkoutLabel}
              </Button>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

export function Cart(props: CartProps & { children?: React.ReactNode }) {
  if (props.variant === "drawer" && props.children) {
    return <CartDrawer {...props}>{props.children}</CartDrawer>;
  }

  return <CartPage {...props} />;
}

// Export cart button with count
export function CartButton({
  count,
  onClick,
  className,
}: {
  count: number;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn("relative", className)}
      onClick={onClick}
    >
      <ShoppingBag className="h-5 w-5" />
      {count > 0 && (
        <Badge
          className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
          variant="destructive"
        >
          {count > 99 ? "99+" : count}
        </Badge>
      )}
    </Button>
  );
}
```

### Key Implementation Notes

1. **Multiple Layouts**: Page and drawer/sidebar variants
2. **Optimistic Updates**: Quantity changes apply immediately
3. **Promo Codes**: Validation and application flow
4. **Animations**: Smooth item removal with AnimatePresence

## Variants

### Page Layout

```tsx
<Cart
  variant="page"
  items={cartItems}
  summary={{
    subtotal: 299,
    discount: 30,
    shipping: 0,
    tax: 24,
    total: 293,
  }}
  showPromoCode
  promoCode="SAVE10"
  onUpdateQuantity={updateQuantity}
  onRemoveItem={removeItem}
  onApplyPromoCode={applyPromo}
  onRemovePromoCode={removePromo}
  onCheckout={() => router.push("/checkout")}
  onContinueShopping={() => router.push("/shop")}
/>
```

### Drawer Layout

```tsx
<Cart
  variant="drawer"
  items={cartItems}
  summary={cartSummary}
  onUpdateQuantity={updateQuantity}
  onRemoveItem={removeItem}
  onCheckout={() => router.push("/checkout")}
>
  <CartButton count={cartItems.length} />
</Cart>
```

### With Cart Button

```tsx
// In header
<Cart variant="drawer" items={items} summary={summary} {...handlers}>
  <CartButton count={items.reduce((acc, item) => acc + item.quantity, 0)} />
</Cart>
```

## Performance

### State Updates

- Use optimistic updates for quantity
- Debounce API calls
- Show loading states

### Animations

- Use layout animations for reordering
- Exit animations for removals
- Avoid animating during updates

## Accessibility

### Required Attributes

- Quantity buttons have labels
- Remove buttons describe action
- Price changes announced

### Screen Reader

- Cart count in button announced
- Item details read properly
- Summary changes announced

### Keyboard Navigation

- Tab through all controls
- Enter/Space for actions
- Esc closes drawer

## Dependencies

```json
{
  "dependencies": {
    "framer-motion": "^11.0.0",
    "lucide-react": "^0.460.0"
  }
}
```

## States

| State | Description | Visual Change |
|-------|-------------|---------------|
| Default | Cart displays items with quantities and summary | Item list with images, quantity controls, and order total |
| Empty | Cart has no items | Empty state with shopping bag icon, message, and continue shopping button |
| Loading | Initial cart data loading | Spinner in place of cart content |
| Updating | Quantity change in progress | Affected item shows loading state, buttons disabled |
| Removing | Item being removed | Item fades out with exit animation, list re-renders |
| Drawer Open | Cart sidebar visible (drawer variant) | Sheet slides in from right with cart contents |
| Drawer Closed | Cart sidebar hidden | Only trigger button visible |
| Promo Applied | Valid promo code entered | Green success state with code badge and remove button |
| Promo Invalid | Invalid promo code submitted | Error message below input, input may show error styling |
| Promo Loading | Validating promo code | Apply button shows spinner |
| Checkout Loading | Proceeding to checkout | Checkout button shows spinner, all interactions disabled |
| Max Quantity | Item at maximum purchasable quantity | Plus button disabled for that item |
| Min Quantity | Item at quantity 1 | Minus button disabled for that item |

## Anti-patterns

### Bad: Not using optimistic updates for quantity changes

```tsx
// Bad - waiting for server before updating UI
const handleQuantityChange = async (itemId, quantity) => {
  setIsLoading(true);
  await updateCartItem(itemId, quantity); // User waits...
  const newCart = await fetchCart();
  setCart(newCart);
  setIsLoading(false);
};

// Good - optimistic update with rollback
const handleQuantityChange = async (itemId, quantity) => {
  const previousItems = [...items];
  // Update UI immediately
  setItems(items.map(item =>
    item.id === itemId ? { ...item, quantity } : item
  ));

  try {
    await updateCartItem(itemId, quantity);
  } catch (error) {
    // Rollback on failure
    setItems(previousItems);
    toast.error('Failed to update quantity');
  }
};
```

### Bad: Not debouncing rapid quantity changes

```tsx
// Bad - API call on every click
<Button onClick={() => onUpdateQuantity(item.id, quantity + 1)}>
  +
</Button>

// Good - debounce rapid changes
const debouncedUpdate = useDebouncedCallback(
  (itemId, quantity) => onUpdateQuantity(itemId, quantity),
  500
);

// Or batch with local state
const [localQuantity, setLocalQuantity] = useState(item.quantity);
useEffect(() => {
  const timer = setTimeout(() => {
    if (localQuantity !== item.quantity) {
      onUpdateQuantity(item.id, localQuantity);
    }
  }, 500);
  return () => clearTimeout(timer);
}, [localQuantity]);
```

### Bad: Not validating promo codes client-side first

```tsx
// Bad - sending empty/invalid format to server
const handleApplyPromo = async (code) => {
  await applyPromoCode(code); // Even if empty string
};

// Good - validate before API call
const handleApplyPromo = async (code) => {
  const trimmedCode = code.trim().toUpperCase();
  if (!trimmedCode) {
    setError('Please enter a code');
    return;
  }
  if (!/^[A-Z0-9]{4,20}$/.test(trimmedCode)) {
    setError('Invalid code format');
    return;
  }
  await applyPromoCode(trimmedCode);
};
```

### Bad: Not handling out-of-stock scenarios

```tsx
// Bad - allowing any quantity
<Cart
  items={items}
  onUpdateQuantity={handleUpdate} // No max check
/>

// Good - enforce stock limits
<Cart
  items={items.map(item => ({
    ...item,
    maxQuantity: item.stockAvailable,
  }))}
  onUpdateQuantity={(itemId, qty) => {
    const item = items.find(i => i.id === itemId);
    if (qty > item.stockAvailable) {
      toast.error(`Only ${item.stockAvailable} available`);
      return;
    }
    handleUpdate(itemId, qty);
  }}
/>
```

## Related Skills

### Composes Into
- [templates/checkout-layout](../templates/checkout-layout.md)
- [templates/shop-layout](../templates/shop-layout.md)

---

## Changelog

### 2.0.0 (2025-01-17)
- Standardized to atomic design system v2
- Updated frontmatter schema
- Added explicit composition references

### 1.0.0 (2025-01-16)
- Initial implementation
- Page and drawer layouts
- Promo code support
- Quantity controls with optimistic updates
