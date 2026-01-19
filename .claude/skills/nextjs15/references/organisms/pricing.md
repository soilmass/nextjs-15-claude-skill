---
id: o-pricing
name: Pricing
version: 2.0.0
layer: L3
category: marketing
description: Pricing table with plans, features, and billing toggle
tags: [pricing, plans, subscription, billing, comparison]
formula: "Pricing = Card(m-card) + Button(a-button) + Badge(a-badge) + Switch(a-switch)"
composes:
  - ../molecules/card.md
dependencies: [framer-motion, lucide-react]
performance:
  impact: low
  lcp: low
  cls: low
accessibility:
  wcag: AA
  keyboard: true
  screen-reader: true
---

# Pricing

## Overview

The Pricing organism displays pricing plans with feature comparisons, billing period toggle (monthly/yearly), highlighted recommended plans, and clear call-to-action buttons. Supports various layouts and styles.

## When to Use

Use this skill when:
- Building SaaS pricing pages
- Creating subscription plan displays
- Showing service tier comparisons
- Building upgrade/downgrade flows

## Composition Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│ Pricing                                                         │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ Header                                                   │    │
│  │  ┌──────────────────┐  ┌─────────────────────────────┐  │    │
│  │  │ Title/Description│  │ Switch (a-switch)           │  │    │
│  │  └──────────────────┘  │ [Monthly] ○────● [Yearly]   │  │    │
│  │                        │ Badge (a-badge) [Save 20%]  │  │    │
│  │                        └─────────────────────────────┘  │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐ │
│  │ Card (m-card)    │ │ Card (m-card)    │ │ Card (m-card)    │ │
│  │ ┌──────────────┐ │ │ ┌──────────────┐ │ │ ┌──────────────┐ │ │
│  │ │Badge(a-badge)│ │ │ │[Most Popular]│ │ │ │Badge(a-badge)│ │ │
│  │ └──────────────┘ │ │ └──────────────┘ │ │ └──────────────┘ │ │
│  │                  │ │                  │ │                  │ │
│  │  Plan Name       │ │  Plan Name       │ │  Plan Name       │ │
│  │  $0/mo           │ │  $29/mo          │ │  $99/mo          │ │
│  │                  │ │                  │ │                  │ │
│  │  ✓ Feature 1     │ │  ✓ Feature 1     │ │  ✓ Feature 1     │ │
│  │  ✓ Feature 2     │ │  ✓ Feature 2     │ │  ✓ Feature 2     │ │
│  │  ✗ Feature 3     │ │  ✓ Feature 3     │ │  ✓ Feature 3     │ │
│  │                  │ │                  │ │                  │ │
│  │ ┌──────────────┐ │ │ ┌──────────────┐ │ │ ┌──────────────┐ │ │
│  │ │Button(a-btn) │ │ │ │Button(a-btn) │ │ │ │Button(a-btn) │ │ │
│  │ │ [Get Started]│ │ │ │[Start Trial] │ │ │ │[Contact Us]  │ │ │
│  │ └──────────────┘ │ │ └──────────────┘ │ │ └──────────────┘ │ │
│  └──────────────────┘ └──────────────────┘ └──────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## Molecules Used

- [card](../molecules/card.md) - Pricing cards

## Implementation

```typescript
// components/organisms/pricing.tsx
"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Check, X, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface PlanFeature {
  text: string;
  included: boolean;
  tooltip?: string;
}

interface Plan {
  id: string;
  name: string;
  description: string;
  priceMonthly: number;
  priceYearly: number;
  features: PlanFeature[];
  cta: {
    label: string;
    href: string;
  };
  popular?: boolean;
  badge?: string;
}

interface PricingProps {
  /** Section title */
  title?: string;
  /** Section description */
  description?: string;
  /** Pricing plans */
  plans: Plan[];
  /** Show billing toggle */
  showBillingToggle?: boolean;
  /** Default billing period */
  defaultBilling?: "monthly" | "yearly";
  /** Yearly discount percentage */
  yearlyDiscount?: number;
  /** Layout variant */
  variant?: "cards" | "table" | "compact";
  /** Currency symbol */
  currency?: string;
  /** Additional class names */
  className?: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export function Pricing({
  title = "Simple, transparent pricing",
  description = "Choose the plan that works best for you",
  plans,
  showBillingToggle = true,
  defaultBilling = "monthly",
  yearlyDiscount = 20,
  variant = "cards",
  currency = "$",
  className,
}: PricingProps) {
  const [billing, setBilling] = React.useState<"monthly" | "yearly">(defaultBilling);

  const getPrice = (plan: Plan) => {
    return billing === "monthly" ? plan.priceMonthly : plan.priceYearly;
  };

  const formatPrice = (price: number) => {
    if (price === 0) return "Free";
    return `${currency}${price}`;
  };

  return (
    <TooltipProvider>
      <section className={cn("py-20 lg:py-32", className)}>
        <div className="container">
          {/* Header */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <motion.h2
              variants={itemVariants}
              className="text-3xl font-bold tracking-tight sm:text-4xl mb-4"
            >
              {title}
            </motion.h2>
            <motion.p
              variants={itemVariants}
              className="text-lg text-muted-foreground"
            >
              {description}
            </motion.p>

            {/* Billing Toggle */}
            {showBillingToggle && (
              <motion.div
                variants={itemVariants}
                className="flex items-center justify-center gap-4 mt-8"
              >
                <Label
                  htmlFor="billing"
                  className={cn(
                    "cursor-pointer",
                    billing === "monthly" && "text-foreground",
                    billing === "yearly" && "text-muted-foreground"
                  )}
                >
                  Monthly
                </Label>
                <Switch
                  id="billing"
                  checked={billing === "yearly"}
                  onCheckedChange={(checked) =>
                    setBilling(checked ? "yearly" : "monthly")
                  }
                />
                <Label
                  htmlFor="billing"
                  className={cn(
                    "cursor-pointer",
                    billing === "yearly" && "text-foreground",
                    billing === "monthly" && "text-muted-foreground"
                  )}
                >
                  Yearly
                  {yearlyDiscount > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      Save {yearlyDiscount}%
                    </Badge>
                  )}
                </Label>
              </motion.div>
            )}
          </motion.div>

          {/* Pricing Cards */}
          {variant === "cards" && (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className={cn(
                "grid gap-8",
                plans.length === 2 && "md:grid-cols-2 max-w-4xl mx-auto",
                plans.length === 3 && "md:grid-cols-2 lg:grid-cols-3",
                plans.length >= 4 && "md:grid-cols-2 lg:grid-cols-4"
              )}
            >
              {plans.map((plan) => (
                <motion.div
                  key={plan.id}
                  variants={itemVariants}
                  className={cn(plan.popular && "lg:-mt-4 lg:mb-4")}
                >
                  <Card
                    className={cn(
                      "relative h-full flex flex-col",
                      plan.popular && "border-primary shadow-lg"
                    )}
                  >
                    {plan.popular && (
                      <div className="absolute -top-3 left-0 right-0 flex justify-center">
                        <Badge className="px-4">Most Popular</Badge>
                      </div>
                    )}
                    {plan.badge && !plan.popular && (
                      <div className="absolute -top-3 left-0 right-0 flex justify-center">
                        <Badge variant="secondary" className="px-4">
                          {plan.badge}
                        </Badge>
                      </div>
                    )}

                    <CardHeader className="text-center pb-2">
                      <CardTitle>{plan.name}</CardTitle>
                      <CardDescription>{plan.description}</CardDescription>
                    </CardHeader>

                    <CardContent className="flex-1">
                      {/* Price */}
                      <div className="text-center mb-6">
                        <span className="text-4xl font-bold">
                          {formatPrice(getPrice(plan))}
                        </span>
                        {getPrice(plan) > 0 && (
                          <span className="text-muted-foreground">
                            /{billing === "monthly" ? "mo" : "yr"}
                          </span>
                        )}
                      </div>

                      {/* Features */}
                      <ul className="space-y-3">
                        {plan.features.map((feature, index) => (
                          <li key={index} className="flex items-start gap-3">
                            {feature.included ? (
                              <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                            ) : (
                              <X className="h-5 w-5 text-muted-foreground/50 shrink-0 mt-0.5" />
                            )}
                            <span
                              className={cn(
                                "text-sm",
                                !feature.included && "text-muted-foreground"
                              )}
                            >
                              {feature.text}
                            </span>
                            {feature.tooltip && (
                              <Tooltip>
                                <TooltipTrigger>
                                  <HelpCircle className="h-4 w-4 text-muted-foreground" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  {feature.tooltip}
                                </TooltipContent>
                              </Tooltip>
                            )}
                          </li>
                        ))}
                      </ul>
                    </CardContent>

                    <CardFooter>
                      <Button
                        className="w-full"
                        variant={plan.popular ? "default" : "outline"}
                        asChild
                      >
                        <Link href={plan.cta.href}>{plan.cta.label}</Link>
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Compact Variant */}
          {variant === "compact" && (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="max-w-2xl mx-auto space-y-4"
            >
              {plans.map((plan) => (
                <motion.div
                  key={plan.id}
                  variants={itemVariants}
                  className={cn(
                    "flex items-center justify-between p-6 rounded-lg border",
                    plan.popular && "border-primary bg-primary/5"
                  )}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{plan.name}</h3>
                      {plan.popular && <Badge>Popular</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {plan.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="text-2xl font-bold">
                        {formatPrice(getPrice(plan))}
                      </span>
                      {getPrice(plan) > 0 && (
                        <span className="text-sm text-muted-foreground">
                          /{billing === "monthly" ? "mo" : "yr"}
                        </span>
                      )}
                    </div>
                    <Button
                      variant={plan.popular ? "default" : "outline"}
                      asChild
                    >
                      <Link href={plan.cta.href}>{plan.cta.label}</Link>
                    </Button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Table Variant */}
          {variant === "table" && (
            <PricingTable
              plans={plans}
              billing={billing}
              currency={currency}
            />
          )}
        </div>
      </section>
    </TooltipProvider>
  );
}

// Pricing Table Component
function PricingTable({
  plans,
  billing,
  currency,
}: {
  plans: Plan[];
  billing: "monthly" | "yearly";
  currency: string;
}) {
  // Get all unique features
  const allFeatures = React.useMemo(() => {
    const features = new Set<string>();
    plans.forEach((plan) => {
      plan.features.forEach((f) => features.add(f.text));
    });
    return Array.from(features);
  }, [plans]);

  const getPrice = (plan: Plan) => {
    return billing === "monthly" ? plan.priceMonthly : plan.priceYearly;
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="text-left p-4 border-b">Features</th>
            {plans.map((plan) => (
              <th
                key={plan.id}
                className={cn(
                  "text-center p-4 border-b min-w-[160px]",
                  plan.popular && "bg-primary/5"
                )}
              >
                <div className="space-y-2">
                  <div className="font-semibold">{plan.name}</div>
                  <div className="text-2xl font-bold">
                    {getPrice(plan) === 0
                      ? "Free"
                      : `${currency}${getPrice(plan)}`}
                  </div>
                  <Button
                    size="sm"
                    variant={plan.popular ? "default" : "outline"}
                    asChild
                    className="w-full"
                  >
                    <Link href={plan.cta.href}>{plan.cta.label}</Link>
                  </Button>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {allFeatures.map((featureText, index) => (
            <tr key={index}>
              <td className="p-4 border-b text-sm">{featureText}</td>
              {plans.map((plan) => {
                const feature = plan.features.find(
                  (f) => f.text === featureText
                );
                return (
                  <td
                    key={plan.id}
                    className={cn(
                      "p-4 border-b text-center",
                      plan.popular && "bg-primary/5"
                    )}
                  >
                    {feature?.included ? (
                      <Check className="h-5 w-5 text-primary mx-auto" />
                    ) : (
                      <X className="h-5 w-5 text-muted-foreground/30 mx-auto" />
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

### Key Implementation Notes

1. **Billing Toggle**: Switches between monthly/yearly with discount badge
2. **Popular Highlight**: Elevated card with primary border
3. **Feature Tooltips**: Help icons explain complex features
4. **Table Comparison**: Full feature comparison grid

## Variants

### Cards (Default)

```tsx
<Pricing
  plans={[
    {
      id: "free",
      name: "Free",
      description: "For individuals",
      priceMonthly: 0,
      priceYearly: 0,
      features: [
        { text: "5 projects", included: true },
        { text: "Basic analytics", included: true },
        { text: "API access", included: false },
      ],
      cta: { label: "Get Started", href: "/signup" },
    },
    {
      id: "pro",
      name: "Pro",
      description: "For teams",
      priceMonthly: 29,
      priceYearly: 290,
      popular: true,
      features: [
        { text: "Unlimited projects", included: true },
        { text: "Advanced analytics", included: true },
        { text: "API access", included: true },
      ],
      cta: { label: "Start Free Trial", href: "/signup?plan=pro" },
    },
  ]}
/>
```

### Table Comparison

```tsx
<Pricing variant="table" plans={plans} />
```

### Compact List

```tsx
<Pricing variant="compact" plans={plans} showBillingToggle={false} />
```

## States

| State | Description | Visual Change |
|-------|-------------|---------------|
| Monthly Billing | Monthly pricing selected | "Monthly" label highlighted, switch off, monthly prices shown |
| Yearly Billing | Yearly pricing selected | "Yearly" label highlighted, switch on, yearly prices shown with discount badge |
| Plan Default | Standard pricing card | Normal border, default button styling |
| Plan Popular | Recommended/highlighted plan | "Most Popular" badge, primary border, shadow, slight vertical offset |
| Plan Hover | Mouse over pricing card | Subtle shadow increase, border color change |
| Feature Included | Feature available in plan | Green checkmark icon, normal text color |
| Feature Excluded | Feature not in plan | Gray X icon, muted text color |
| Feature Tooltip | Help icon hovered/focused | Tooltip appears with feature explanation |
| Free Plan | $0 price | Shows "Free" instead of "$0/mo" |
| Loading Animation | Initial page load | Cards animate in with stagger effect (whileInView) |

## Anti-patterns

### Bad: Hardcoding prices instead of calculating from data

```tsx
// Bad - Manually showing different prices
{billing === 'monthly' ? (
  <span>$29/mo</span>
) : (
  <span>$290/yr</span>
)}

// Good - Calculate from plan data
const getPrice = (plan: Plan) => {
  return billing === 'monthly' ? plan.priceMonthly : plan.priceYearly;
};

<span>{formatPrice(getPrice(plan))}/{billing === 'monthly' ? 'mo' : 'yr'}</span>
```

### Bad: Not making the billing toggle accessible

```tsx
// Bad - Switch without proper labeling
<Switch
  checked={billing === 'yearly'}
  onChange={handleChange}
/>

// Good - Proper label association and accessible switch
<Label
  htmlFor="billing"
  className={cn(billing === 'monthly' && 'text-foreground')}
>
  Monthly
</Label>
<Switch
  id="billing"
  checked={billing === 'yearly'}
  onCheckedChange={(checked) => setBilling(checked ? 'yearly' : 'monthly')}
  aria-describedby="billing-description"
/>
<Label
  htmlFor="billing"
  className={cn(billing === 'yearly' && 'text-foreground')}
>
  Yearly
  <Badge>Save {yearlyDiscount}%</Badge>
</Label>
```

### Bad: Not highlighting the recommended plan clearly

```tsx
// Bad - No visual distinction for popular plan
{plans.map(plan => (
  <Card key={plan.id}>
    <PlanContent plan={plan} />
  </Card>
))}

// Good - Visual elevation and badge for popular plan
{plans.map(plan => (
  <Card
    key={plan.id}
    className={cn(
      plan.popular && 'border-primary shadow-lg -mt-4 mb-4'
    )}
  >
    {plan.popular && (
      <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
        Most Popular
      </Badge>
    )}
    <PlanContent plan={plan} />
  </Card>
))}
```

### Bad: CTA buttons not differentiating between plans

```tsx
// Bad - Same button style for all plans
<Button>Get Started</Button>

// Good - Differentiate popular plan CTA
<Button
  variant={plan.popular ? 'default' : 'outline'}
  className="w-full"
  asChild
>
  <Link href={plan.cta.href}>{plan.cta.label}</Link>
</Button>
```

## Accessibility

### Required Attributes

- Clear plan names and descriptions
- Included/excluded features clearly indicated
- Switch has proper label association

### Screen Reader

- Billing period change announced
- Feature inclusion state announced
- Price and plan details clear

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

### Composes From
- [molecules/card](../molecules/card.md)

### Composes Into
- [templates/pricing-page](../templates/pricing-page.md)

---

## Changelog

### 2.0.0 (2025-01-17)
- Standardized to atomic design system v2
- Updated frontmatter schema
- Added explicit composition references

### 1.0.0 (2025-01-16)
- Initial implementation
- Three layout variants
- Billing toggle with discount
