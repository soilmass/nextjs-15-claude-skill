---
id: t-checkout-page
name: Checkout Page
version: 2.0.0
layer: L4
category: pages
description: Multi-step checkout page with shipping, payment, and order confirmation
tags: [page, checkout, e-commerce, payment, multi-step, stripe]
formula: "CheckoutPage = CheckoutForm(o-checkout-form) + CheckoutSummary(o-checkout-summary) + Stepper(m-stepper) + AddressInput(m-address-input) + CreditCardInput(m-credit-card-input)"
composes:
  - ../organisms/checkout-form.md
  - ../organisms/checkout-summary.md
  - ../molecules/stepper.md
  - ../molecules/address-input.md
  - ../molecules/credit-card-input.md
dependencies: []
performance:
  impact: critical
  lcp: high
  cls: critical
accessibility:
  wcag: AA
  keyboard: true
  screen-reader: true
---

# Checkout Page

## Overview

The Checkout Page template provides a complete multi-step checkout flow with shipping address collection, payment processing via Stripe, and order confirmation. Designed for conversion optimization with clear progress indication, form validation, and error recovery.

## When to Use

Use this skill when:
- Building e-commerce checkout flows
- Implementing multi-step purchase processes
- Integrating Stripe payment processing
- Creating secure order completion experiences

## Composition Diagram

```
+------------------------------------------------------------------+
|                        CheckoutPage                               |
+------------------------------------------------------------------+
|  +--------------------------------------------------------------+ |
|  |  m Stepper                                                    | |
|  |  ( Contact )---( Shipping )---( Payment )---( Review )        | |
|  +--------------------------------------------------------------+ |
|                                                                   |
|  +----------------------------------------+  +-----------------+  |
|  |         o CheckoutForm                  |  | o CheckoutSummary|  |
|  |  +----------------------------------+   |  |  +-----------+  |  |
|  |  | Contact Step                     |   |  |  | Cart      |  |  |
|  |  | - Email input                    |   |  |  | Items     |  |  |
|  |  | - Create account checkbox        |   |  |  +-----------+  |  |
|  |  +----------------------------------+   |  |  +-----------+  |  |
|  |  +----------------------------------+   |  |  | Subtotal  |  |  |
|  |  | Shipping Step                    |   |  |  | Shipping  |  |  |
|  |  | m AddressInput                   |   |  |  | Tax       |  |  |
|  |  | - Name, Address, City, etc.      |   |  |  | ---------  |  |
|  |  | - Shipping method selection      |   |  |  | Total     |  |  |
|  |  +----------------------------------+   |  |  +-----------+  |  |
|  |  +----------------------------------+   |  |                 |  |
|  |  | Payment Step                     |   |  |  [ Promo Code ] |  |
|  |  | m CreditCardInput (Stripe)       |   |  |                 |  |
|  |  +----------------------------------+   |  +-----------------+  |
|  |  +----------------------------------+   |                      |
|  |  | Review Step                      |   |                      |
|  |  | - Order summary                  |   |                      |
|  |  | - [Place Order] button           |   |                      |
|  |  +----------------------------------+   |                      |
|  +----------------------------------------+                       |
+------------------------------------------------------------------+
```

## Organisms Used

- [checkout-form](../organisms/checkout-form.md) - Multi-step form controller
- [checkout-summary](../organisms/checkout-summary.md) - Order summary sidebar
- [stepper](../molecules/stepper.md) - Progress indicator
- [auth-form](../organisms/auth-form.md) - Guest/login option

## Implementation

```typescript
// app/(checkout)/checkout/page.tsx
import { Suspense } from "react";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCart } from "@/lib/cart";
import { getSession } from "@/lib/auth";
import { CheckoutProvider } from "@/components/providers/checkout-provider";
import { CheckoutForm } from "@/components/organisms/checkout-form";
import { CheckoutSummary } from "@/components/organisms/checkout-summary";
import { CheckoutSummarySkeleton } from "@/components/skeletons/checkout-summary-skeleton";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Complete your purchase securely",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function CheckoutPage() {
  const [cart, session] = await Promise.all([
    getCart(),
    getSession(),
  ]);

  // Redirect to cart if empty
  if (!cart || cart.items.length === 0) {
    redirect("/cart");
  }

  return (
    <CheckoutProvider cart={cart} session={session}>
      <div className="container py-8">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Checkout Form - Main Content */}
          <div className="lg:col-span-7 xl:col-span-8">
            <h1 className="text-2xl font-bold tracking-tight mb-8">
              Checkout
            </h1>
            <CheckoutForm />
          </div>

          {/* Order Summary - Sidebar */}
          <div className="lg:col-span-5 xl:col-span-4">
            <div className="lg:sticky lg:top-24">
              <Suspense fallback={<CheckoutSummarySkeleton />}>
                <CheckoutSummary cart={cart} />
              </Suspense>
            </div>
          </div>
        </div>
      </div>
    </CheckoutProvider>
  );
}
```

### Checkout Form Implementation

```typescript
// components/organisms/checkout-form.tsx
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useCheckout } from "@/components/providers/checkout-provider";
import { Stepper, Step } from "@/components/molecules/stepper";
import { ContactStep } from "./checkout/contact-step";
import { ShippingStep } from "./checkout/shipping-step";
import { PaymentStep } from "./checkout/payment-step";
import { ReviewStep } from "./checkout/review-step";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

const steps = [
  { id: "contact", label: "Contact", description: "Email & account" },
  { id: "shipping", label: "Shipping", description: "Delivery address" },
  { id: "payment", label: "Payment", description: "Payment method" },
  { id: "review", label: "Review", description: "Confirm order" },
] as const;

type StepId = typeof steps[number]["id"];

export function CheckoutForm() {
  const router = useRouter();
  const { state, dispatch, session } = useCheckout();
  const [currentStep, setCurrentStep] = React.useState<StepId>(
    session ? "shipping" : "contact"
  );
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [completedSteps, setCompletedSteps] = React.useState<Set<StepId>>(
    new Set(session ? ["contact"] : [])
  );

  const currentStepIndex = steps.findIndex((s) => s.id === currentStep);

  const handleNext = async () => {
    // Mark current step as completed
    setCompletedSteps((prev) => new Set([...prev, currentStep]));
    
    // Move to next step
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < steps.length) {
      setCurrentStep(steps[nextIndex].id);
    }
  };

  const handleBack = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(steps[prevIndex].id);
    }
  };

  const handleStepClick = (stepId: StepId) => {
    const stepIndex = steps.findIndex((s) => s.id === stepId);
    // Only allow clicking on completed steps or the next step
    if (completedSteps.has(stepId) || stepIndex <= currentStepIndex) {
      setCurrentStep(stepId);
    }
  };

  const handleSubmitOrder = async () => {
    setIsSubmitting(true);
    try {
      // Submit order logic handled in ReviewStep
      router.push("/checkout/success");
    } catch (error) {
      console.error("Order submission failed:", error);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Progress Stepper */}
      <Stepper currentStep={currentStepIndex}>
        {steps.map((step, index) => (
          <Step
            key={step.id}
            index={index}
            label={step.label}
            description={step.description}
            completed={completedSteps.has(step.id)}
            onClick={() => handleStepClick(step.id)}
            className="cursor-pointer"
          />
        ))}
      </Stepper>

      {/* Step Content */}
      <div className="min-h-[400px]">
        <Elements stripe={stripePromise}>
          {currentStep === "contact" && (
            <ContactStep onComplete={handleNext} />
          )}
          {currentStep === "shipping" && (
            <ShippingStep onComplete={handleNext} onBack={handleBack} />
          )}
          {currentStep === "payment" && (
            <PaymentStep onComplete={handleNext} onBack={handleBack} />
          )}
          {currentStep === "review" && (
            <ReviewStep
              onSubmit={handleSubmitOrder}
              onBack={handleBack}
              isSubmitting={isSubmitting}
            />
          )}
        </Elements>
      </div>
    </div>
  );
}
```

### Contact Step

```typescript
// components/organisms/checkout/contact-step.tsx
"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCheckout } from "@/components/providers/checkout-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { ChevronRight } from "lucide-react";

const contactSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  createAccount: z.boolean().optional(),
  password: z.string().min(8).optional(),
  marketingConsent: z.boolean().optional(),
}).refine((data) => {
  if (data.createAccount && !data.password) {
    return false;
  }
  return true;
}, {
  message: "Password is required to create an account",
  path: ["password"],
});

type ContactFormData = z.infer<typeof contactSchema>;

interface ContactStepProps {
  onComplete: () => void;
}

export function ContactStep({ onComplete }: ContactStepProps) {
  const { state, dispatch, session } = useCheckout();

  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      email: state.contact?.email || session?.user?.email || "",
      createAccount: false,
      marketingConsent: false,
    },
  });

  const createAccount = form.watch("createAccount");

  const onSubmit = async (data: ContactFormData) => {
    dispatch({
      type: "SET_CONTACT",
      payload: {
        email: data.email,
        marketingConsent: data.marketingConsent,
      },
    });

    if (data.createAccount && data.password) {
      // Handle account creation
      await createAccountAction(data.email, data.password);
    }

    onComplete();
  };

  if (session) {
    return (
      <div className="space-y-6">
        <div className="bg-muted/50 rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Signed in as</p>
          <p className="font-medium">{session.user.email}</p>
        </div>
        <Button onClick={onComplete} className="w-full sm:w-auto">
          Continue to Shipping
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Contact Information</h2>
        
        <FormField
          label="Email address"
          error={form.formState.errors.email?.message}
          required
        >
          <Input
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            {...form.register("email")}
          />
        </FormField>

        <div className="flex items-start space-x-3">
          <Checkbox
            id="createAccount"
            checked={createAccount}
            onCheckedChange={(checked) => 
              form.setValue("createAccount", checked as boolean)
            }
          />
          <label htmlFor="createAccount" className="text-sm leading-none">
            Create an account for faster checkout next time
          </label>
        </div>

        {createAccount && (
          <FormField
            label="Password"
            error={form.formState.errors.password?.message}
            required
          >
            <Input
              type="password"
              autoComplete="new-password"
              {...form.register("password")}
            />
          </FormField>
        )}

        <div className="flex items-start space-x-3">
          <Checkbox
            id="marketingConsent"
            {...form.register("marketingConsent")}
          />
          <label htmlFor="marketingConsent" className="text-sm text-muted-foreground leading-none">
            Email me about new products, deals, and updates
          </label>
        </div>
      </div>

      <Separator />

      <div className="flex justify-between">
        <Button type="button" variant="ghost" asChild>
          <a href="/cart">Return to cart</a>
        </Button>
        <Button type="submit" disabled={form.formState.isSubmitting}>
          Continue to Shipping
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </form>
  );
}
```

### Shipping Step

```typescript
// components/organisms/checkout/shipping-step.tsx
"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCheckout } from "@/components/providers/checkout-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { ChevronLeft, ChevronRight, Truck, Zap, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

const shippingSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  address1: z.string().min(1, "Address is required"),
  address2: z.string().optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  postalCode: z.string().min(5, "Valid postal code required"),
  country: z.string().min(1, "Country is required"),
  phone: z.string().min(10, "Valid phone number required"),
  shippingMethod: z.enum(["standard", "express", "overnight"]),
});

type ShippingFormData = z.infer<typeof shippingSchema>;

const shippingMethods = [
  {
    id: "standard",
    name: "Standard Shipping",
    description: "5-7 business days",
    price: 0,
    icon: Truck,
  },
  {
    id: "express",
    name: "Express Shipping",
    description: "2-3 business days",
    price: 12.99,
    icon: Zap,
  },
  {
    id: "overnight",
    name: "Overnight Shipping",
    description: "Next business day",
    price: 24.99,
    icon: Clock,
  },
];

interface ShippingStepProps {
  onComplete: () => void;
  onBack: () => void;
}

export function ShippingStep({ onComplete, onBack }: ShippingStepProps) {
  const { state, dispatch } = useCheckout();

  const form = useForm<ShippingFormData>({
    resolver: zodResolver(shippingSchema),
    defaultValues: {
      firstName: state.shipping?.firstName || "",
      lastName: state.shipping?.lastName || "",
      address1: state.shipping?.address1 || "",
      address2: state.shipping?.address2 || "",
      city: state.shipping?.city || "",
      state: state.shipping?.state || "",
      postalCode: state.shipping?.postalCode || "",
      country: state.shipping?.country || "US",
      phone: state.shipping?.phone || "",
      shippingMethod: state.shippingMethod || "standard",
    },
  });

  const selectedMethod = form.watch("shippingMethod");

  const onSubmit = (data: ShippingFormData) => {
    dispatch({
      type: "SET_SHIPPING",
      payload: {
        ...data,
      },
    });
    dispatch({
      type: "SET_SHIPPING_METHOD",
      payload: data.shippingMethod,
    });
    onComplete();
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
      {/* Shipping Address */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Shipping Address</h2>
        
        <div className="grid sm:grid-cols-2 gap-4">
          <FormField
            label="First name"
            error={form.formState.errors.firstName?.message}
            required
          >
            <Input
              autoComplete="given-name"
              {...form.register("firstName")}
            />
          </FormField>
          <FormField
            label="Last name"
            error={form.formState.errors.lastName?.message}
            required
          >
            <Input
              autoComplete="family-name"
              {...form.register("lastName")}
            />
          </FormField>
        </div>

        <FormField
          label="Address"
          error={form.formState.errors.address1?.message}
          required
        >
          <Input
            autoComplete="address-line1"
            placeholder="Street address"
            {...form.register("address1")}
          />
        </FormField>

        <FormField label="Apartment, suite, etc. (optional)">
          <Input
            autoComplete="address-line2"
            {...form.register("address2")}
          />
        </FormField>

        <div className="grid sm:grid-cols-3 gap-4">
          <FormField
            label="City"
            error={form.formState.errors.city?.message}
            required
          >
            <Input
              autoComplete="address-level2"
              {...form.register("city")}
            />
          </FormField>
          <FormField
            label="State"
            error={form.formState.errors.state?.message}
            required
          >
            <Select
              value={form.watch("state")}
              onValueChange={(value) => form.setValue("state", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select state" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CA">California</SelectItem>
                <SelectItem value="NY">New York</SelectItem>
                <SelectItem value="TX">Texas</SelectItem>
                {/* Add all states */}
              </SelectContent>
            </Select>
          </FormField>
          <FormField
            label="ZIP Code"
            error={form.formState.errors.postalCode?.message}
            required
          >
            <Input
              autoComplete="postal-code"
              {...form.register("postalCode")}
            />
          </FormField>
        </div>

        <FormField
          label="Phone"
          error={form.formState.errors.phone?.message}
          description="For delivery updates"
          required
        >
          <Input
            type="tel"
            autoComplete="tel"
            {...form.register("phone")}
          />
        </FormField>
      </div>

      {/* Shipping Method */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Shipping Method</h2>
        
        <RadioGroup
          value={selectedMethod}
          onValueChange={(value) => 
            form.setValue("shippingMethod", value as ShippingFormData["shippingMethod"])
          }
          className="space-y-3"
        >
          {shippingMethods.map((method) => (
            <label
              key={method.id}
              className={cn(
                "flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-colors",
                selectedMethod === method.id
                  ? "border-primary bg-primary/5"
                  : "border-input hover:border-primary/50"
              )}
            >
              <div className="flex items-center gap-4">
                <RadioGroupItem value={method.id} />
                <method.icon className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">{method.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {method.description}
                  </p>
                </div>
              </div>
              <span className="font-medium">
                {method.price === 0 ? "Free" : `$${method.price.toFixed(2)}`}
              </span>
            </label>
          ))}
        </RadioGroup>
      </div>

      <Separator />

      <div className="flex justify-between">
        <Button type="button" variant="ghost" onClick={onBack}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button type="submit" disabled={form.formState.isSubmitting}>
          Continue to Payment
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </form>
  );
}
```

### Payment Step with Stripe

```typescript
// components/organisms/checkout/payment-step.tsx
"use client";

import * as React from "react";
import {
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { useCheckout } from "@/components/providers/checkout-provider";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ChevronLeft, ChevronRight, Lock, AlertCircle } from "lucide-react";
import { createPaymentIntent } from "@/app/actions/payment";

interface PaymentStepProps {
  onComplete: () => void;
  onBack: () => void;
}

export function PaymentStep({ onComplete, onBack }: PaymentStepProps) {
  const stripe = useStripe();
  const elements = useElements();
  const { state, dispatch } = useCheckout();
  const [error, setError] = React.useState<string | null>(null);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [clientSecret, setClientSecret] = React.useState<string | null>(null);

  // Create payment intent on mount
  React.useEffect(() => {
    async function initPayment() {
      const { clientSecret } = await createPaymentIntent({
        amount: state.totals.total,
        currency: "usd",
        metadata: {
          email: state.contact?.email,
        },
      });
      setClientSecret(clientSecret);
    }
    initPayment();
  }, [state.totals.total, state.contact?.email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements || !clientSecret) {
      return;
    }

    setIsProcessing(true);
    setError(null);

    const { error: submitError } = await elements.submit();
    if (submitError) {
      setError(submitError.message || "An error occurred");
      setIsProcessing(false);
      return;
    }

    const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
      elements,
      clientSecret,
      confirmParams: {
        return_url: `${window.location.origin}/checkout/success`,
      },
      redirect: "if_required",
    });

    if (confirmError) {
      setError(confirmError.message || "Payment failed");
      setIsProcessing(false);
      return;
    }

    if (paymentIntent?.status === "succeeded") {
      dispatch({
        type: "SET_PAYMENT",
        payload: {
          paymentIntentId: paymentIntent.id,
          status: "succeeded",
        },
      });
      onComplete();
    }

    setIsProcessing(false);
  };

  if (!clientSecret) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Payment Method</h2>
        
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="p-4 border rounded-lg">
          <PaymentElement
            options={{
              layout: "tabs",
              paymentMethodOrder: ["card", "apple_pay", "google_pay"],
            }}
          />
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Lock className="h-4 w-4" />
          <span>Your payment information is encrypted and secure</span>
        </div>
      </div>

      <Separator />

      <div className="flex justify-between">
        <Button type="button" variant="ghost" onClick={onBack}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button 
          type="submit" 
          disabled={!stripe || isProcessing}
        >
          {isProcessing ? (
            <>
              <span className="animate-spin mr-2">...</span>
              Processing...
            </>
          ) : (
            <>
              Continue to Review
              <ChevronRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
```

### Review Step

```typescript
// components/organisms/checkout/review-step.tsx
"use client";

import * as React from "react";
import { useCheckout } from "@/components/providers/checkout-provider";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, Check, Loader2, ShieldCheck } from "lucide-react";
import { submitOrder } from "@/app/actions/orders";
import { formatCurrency } from "@/lib/utils";

interface ReviewStepProps {
  onSubmit: () => void;
  onBack: () => void;
  isSubmitting: boolean;
}

export function ReviewStep({ onSubmit, onBack, isSubmitting }: ReviewStepProps) {
  const { state, cart } = useCheckout();

  const handlePlaceOrder = async () => {
    await submitOrder({
      contact: state.contact,
      shipping: state.shipping,
      shippingMethod: state.shippingMethod,
      payment: state.payment,
      cart,
    });
    onSubmit();
  };

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">Review Your Order</h2>

      <div className="grid gap-4">
        {/* Contact Info */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Contact</CardTitle>
              <Button variant="link" size="sm" className="h-auto p-0">
                Edit
              </Button>
            </div>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            {state.contact?.email}
          </CardContent>
        </Card>

        {/* Shipping Address */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Ship to</CardTitle>
              <Button variant="link" size="sm" className="h-auto p-0">
                Edit
              </Button>
            </div>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <p>{state.shipping?.firstName} {state.shipping?.lastName}</p>
            <p>{state.shipping?.address1}</p>
            {state.shipping?.address2 && <p>{state.shipping.address2}</p>}
            <p>
              {state.shipping?.city}, {state.shipping?.state} {state.shipping?.postalCode}
            </p>
          </CardContent>
        </Card>

        {/* Shipping Method */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">
                Shipping Method
              </CardTitle>
              <Button variant="link" size="sm" className="h-auto p-0">
                Edit
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground capitalize">
                {state.shippingMethod} Shipping
              </span>
              <span>{formatCurrency(state.totals.shipping)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Payment */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Payment</CardTitle>
              <Badge variant="secondary" className="gap-1">
                <Check className="h-3 w-3" />
                Verified
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-green-500" />
              Payment authorized and ready
            </div>
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* Order Items Summary */}
      <div className="space-y-4">
        <h3 className="font-medium">Order Items ({cart.items.length})</h3>
        <div className="space-y-3">
          {cart.items.map((item) => (
            <div key={item.id} className="flex items-center gap-4">
              <div className="relative h-16 w-16 rounded border overflow-hidden">
                <img
                  src={item.image}
                  alt={item.name}
                  className="object-cover"
                />
                <span className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                  {item.quantity}
                </span>
              </div>
              <div className="flex-1">
                <p className="font-medium">{item.name}</p>
                {item.variant && (
                  <p className="text-sm text-muted-foreground">{item.variant}</p>
                )}
              </div>
              <span className="font-medium">
                {formatCurrency(item.price * item.quantity)}
              </span>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      <div className="flex justify-between">
        <Button type="button" variant="ghost" onClick={onBack}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button 
          onClick={handlePlaceOrder}
          disabled={isSubmitting}
          size="lg"
          className="px-8"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Placing Order...
            </>
          ) : (
            <>
              Place Order - {formatCurrency(state.totals.total)}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
```

## Variants

### Express Checkout

```tsx
// Single-page checkout for returning customers
export default function ExpressCheckoutPage() {
  return (
    <div className="container max-w-2xl py-8">
      <ExpressCheckoutForm
        savedAddresses={addresses}
        savedPaymentMethods={paymentMethods}
        onComplete={handleComplete}
      />
    </div>
  );
}
```

### Guest vs Logged In

```tsx
// Different flows based on auth state
export function CheckoutForm({ session }) {
  if (session) {
    return (
      <LoggedInCheckout
        user={session.user}
        savedAddresses={session.addresses}
      />
    );
  }
  return <GuestCheckout />;
}
```

## Performance

### LCP Optimization

- Preload Stripe.js in head
- Skeleton loading for summary
- Lazy load payment form until needed

### CLS Prevention

- Fixed height containers for each step
- Reserve space for error messages
- Smooth step transitions

### Conversion Optimization

- Progress indicator always visible
- Minimal form fields
- Trust signals near payment
- Clear error recovery

## Accessibility

### Required Features

- Step navigation with keyboard
- Clear focus indicators
- Form validation announcements
- Screen reader step labels

### ARIA Implementation

```tsx
<div role="form" aria-labelledby="checkout-title">
  <nav aria-label="Checkout steps">
    <ol role="list">
      <li aria-current={currentStep === "contact" ? "step" : undefined}>
        Contact
      </li>
    </ol>
  </nav>
</div>
```

## Security

- HTTPS only
- No PCI data stored
- CSRF protection
- Rate limiting on submit

## Error States

### Form Validation Errors

```tsx
// components/checkout/form-error.tsx
"use client";

import { useFormState } from "react-dom";
import { AlertCircle, X } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

interface FormErrorProps {
  errors: Record<string, string[]>;
  onDismiss?: () => void;
}

export function FormError({ errors, onDismiss }: FormErrorProps) {
  const errorMessages = Object.entries(errors).flatMap(([field, messages]) =>
    messages.map((message) => ({ field, message }))
  );

  if (errorMessages.length === 0) return null;

  return (
    <Alert variant="destructive" className="relative">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>
        <ul className="list-disc pl-4 space-y-1">
          {errorMessages.map(({ field, message }, index) => (
            <li key={index}>
              <span className="font-medium capitalize">{field.replace(/_/g, " ")}</span>: {message}
            </li>
          ))}
        </ul>
      </AlertDescription>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="absolute top-2 right-2"
          aria-label="Dismiss errors"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </Alert>
  );
}
```

### Payment Processing Error

```tsx
// components/checkout/payment-error.tsx
"use client";

import { AlertTriangle, CreditCard, RefreshCw, HelpCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface PaymentErrorProps {
  error: {
    code?: string;
    message: string;
    declineCode?: string;
  };
  onRetry: () => void;
}

const errorMessages: Record<string, { title: string; description: string; action?: string }> = {
  card_declined: {
    title: "Card Declined",
    description: "Your card was declined. Please try a different payment method.",
    action: "Try Different Card",
  },
  insufficient_funds: {
    title: "Insufficient Funds",
    description: "Your card has insufficient funds for this transaction.",
  },
  expired_card: {
    title: "Card Expired",
    description: "Your card has expired. Please use a different card.",
  },
  processing_error: {
    title: "Processing Error",
    description: "An error occurred while processing your payment. Please try again.",
    action: "Retry Payment",
  },
  invalid_cvc: {
    title: "Invalid Security Code",
    description: "The security code (CVC) you entered is invalid.",
  },
};

export function PaymentError({ error, onRetry }: PaymentErrorProps) {
  const errorInfo = errorMessages[error.declineCode || error.code || "processing_error"] || {
    title: "Payment Failed",
    description: error.message,
  };

  return (
    <Alert variant="destructive" className="mb-6">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>{errorInfo.title}</AlertTitle>
      <AlertDescription className="mt-2">
        <p className="mb-4">{errorInfo.description}</p>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline" onClick={onRetry}>
            <RefreshCw className="h-4 w-4 mr-2" />
            {errorInfo.action || "Try Again"}
          </Button>
          <Button size="sm" variant="ghost" asChild>
            <a href="/help/payment">
              <HelpCircle className="h-4 w-4 mr-2" />
              Get Help
            </a>
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
}
```

### Order Submission Error

```tsx
// components/checkout/order-error.tsx
"use client";

import { useRouter } from "next/navigation";
import { AlertCircle, ShoppingCart, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

interface OrderErrorProps {
  error: Error;
  onRetry: () => void;
}

export function OrderError({ error, onRetry }: OrderErrorProps) {
  const router = useRouter();

  const isStockError = error.message.includes("stock");
  const isPriceError = error.message.includes("price");

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
          <AlertCircle className="h-6 w-6 text-destructive" />
        </div>
        <CardTitle>Unable to Complete Order</CardTitle>
      </CardHeader>
      <CardContent className="text-center text-muted-foreground">
        {isStockError ? (
          <p>Some items in your cart are no longer available in the requested quantity.</p>
        ) : isPriceError ? (
          <p>The price of some items has changed. Please review your cart before continuing.</p>
        ) : (
          <p>{error.message || "An unexpected error occurred. Please try again."}</p>
        )}
      </CardContent>
      <CardFooter className="flex justify-center gap-3">
        {(isStockError || isPriceError) ? (
          <Button onClick={() => router.push("/cart")}>
            <ShoppingCart className="h-4 w-4 mr-2" />
            Review Cart
          </Button>
        ) : (
          <>
            <Button variant="outline" onClick={() => router.push("/cart")}>
              Return to Cart
            </Button>
            <Button onClick={onRetry}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </>
        )}
      </CardFooter>
    </Card>
  );
}
```

### Stripe Integration Error Boundary

```tsx
// components/checkout/stripe-error-boundary.tsx
"use client";

import { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class StripeErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Stripe error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="p-6 border rounded-lg bg-destructive/5 text-center">
            <AlertTriangle className="h-8 w-8 text-destructive mx-auto mb-3" />
            <h3 className="font-semibold mb-2">Payment System Error</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Unable to load payment form. Please refresh and try again.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                this.setState({ hasError: false });
                window.location.reload();
              }}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Page
            </Button>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
```

## Loading States

### Full Checkout Page Skeleton

```tsx
// components/skeletons/checkout-page-skeleton.tsx
import { Skeleton } from "@/components/ui/skeleton";

export function CheckoutPageSkeleton() {
  return (
    <div className="container py-8">
      <div className="grid lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Form Skeleton */}
        <div className="lg:col-span-7 xl:col-span-8">
          <Skeleton className="h-8 w-32 mb-8" />

          {/* Stepper Skeleton */}
          <div className="flex items-center gap-4 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-2">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="hidden sm:block">
                  <Skeleton className="h-4 w-16 mb-1" />
                  <Skeleton className="h-3 w-20" />
                </div>
                {i < 4 && <Skeleton className="h-0.5 w-8 ml-2" />}
              </div>
            ))}
          </div>

          {/* Form Fields Skeleton */}
          <div className="space-y-6">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
          </div>

          {/* Navigation Buttons Skeleton */}
          <div className="flex justify-between mt-8 pt-6 border-t">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-40" />
          </div>
        </div>

        {/* Summary Skeleton */}
        <div className="lg:col-span-5 xl:col-span-4">
          <div className="lg:sticky lg:top-24">
            <Skeleton className="h-6 w-32 mb-4" />
            <div className="border rounded-lg p-4 space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-3">
                  <Skeleton className="h-16 w-16 rounded" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-3/4 mb-2" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                  <Skeleton className="h-4 w-16" />
                </div>
              ))}
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-12" />
                </div>
                <div className="flex justify-between pt-2 border-t">
                  <Skeleton className="h-5 w-12" />
                  <Skeleton className="h-5 w-20" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

### Step Content Loading

```tsx
// components/checkout/step-loading.tsx
"use client";

import { Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function StepLoading({ step }: { step: "contact" | "shipping" | "payment" | "review" }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
        <span className="text-muted-foreground">Loading {step} step...</span>
      </div>

      {step === "payment" ? (
        <div className="p-4 border rounded-lg space-y-4">
          <Skeleton className="h-12 w-full" />
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
          <Skeleton className="h-10 w-full" />
        </div>
      ) : (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

### Submit Button Loading

```tsx
// components/checkout/submit-button.tsx
"use client";

import { useFormStatus } from "react-dom";
import { Loader2, Lock } from "lucide-react";
import { Button, ButtonProps } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";

interface SubmitButtonProps extends ButtonProps {
  amount?: number;
  label?: string;
  loadingLabel?: string;
}

export function SubmitButton({
  amount,
  label = "Place Order",
  loadingLabel = "Processing...",
  ...props
}: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      size="lg"
      disabled={pending}
      className="w-full sm:w-auto px-8"
      {...props}
    >
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {loadingLabel}
        </>
      ) : (
        <>
          <Lock className="mr-2 h-4 w-4" />
          {label}
          {amount && ` - ${formatCurrency(amount)}`}
        </>
      )}
    </Button>
  );
}
```

### Shipping Methods Loading

```tsx
// components/checkout/shipping-methods-loading.tsx
import { Skeleton } from "@/components/ui/skeleton";

export function ShippingMethodsLoading() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-5 w-32 mb-4" />
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center gap-4">
            <Skeleton className="h-5 w-5 rounded-full" />
            <Skeleton className="h-5 w-5" />
            <div>
              <Skeleton className="h-4 w-32 mb-1" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
          <Skeleton className="h-4 w-16" />
        </div>
      ))}
    </div>
  );
}
```

## Mobile Responsiveness

### Responsive Breakpoints

| Breakpoint | Stepper | Form | Summary | Actions |
|------------|---------|------|---------|---------|
| < 640px | Compact (numbers only) | Single column | Top (collapsible) | Full width, stacked |
| 640-1023px | Labels visible | Two column for some fields | Top (sticky) | Inline buttons |
| >= 1024px | Full stepper | Multi-column grid | Sidebar (sticky) | Right-aligned |

### Mobile Checkout Form

```tsx
// components/checkout/checkout-form-mobile.tsx
"use client";

import * as React from "react";
import { useMediaQuery } from "@/hooks/use-media-query";
import { CheckoutSummaryMobile } from "./checkout-summary-mobile";
import { CheckoutSummary } from "@/components/organisms/checkout-summary";
import { CheckoutForm } from "./checkout-form";
import { cn } from "@/lib/utils";

export function CheckoutFormResponsive() {
  const isMobile = useMediaQuery("(max-width: 1023px)");

  return (
    <div className="grid lg:grid-cols-12 gap-4 lg:gap-8">
      {/* Mobile Summary - Top */}
      {isMobile && (
        <div className="lg:hidden">
          <CheckoutSummaryMobile />
        </div>
      )}

      {/* Form */}
      <div className="lg:col-span-7 xl:col-span-8">
        <div className="bg-background rounded-lg border p-4 sm:p-6">
          <CheckoutForm />
        </div>
      </div>

      {/* Desktop Summary - Sidebar */}
      {!isMobile && (
        <div className="hidden lg:block lg:col-span-5 xl:col-span-4">
          <div className="sticky top-24">
            <CheckoutSummary sticky />
          </div>
        </div>
      )}
    </div>
  );
}
```

### Mobile Shipping Step

```tsx
// components/checkout/shipping-step-mobile.tsx
"use client";

import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { ChevronRight, ChevronLeft } from "lucide-react";

export function ShippingStepMobile({ onComplete, onBack }) {
  const form = useForm();

  return (
    <form onSubmit={form.handleSubmit(onComplete)} className="space-y-4">
      {/* Name Fields - Stack on mobile */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <FormField label="First name" required>
          <Input
            autoComplete="given-name"
            className="h-12"
            inputMode="text"
            {...form.register("firstName")}
          />
        </FormField>
        <FormField label="Last name" required>
          <Input
            autoComplete="family-name"
            className="h-12"
            inputMode="text"
            {...form.register("lastName")}
          />
        </FormField>
      </div>

      {/* Address - Full width */}
      <FormField label="Address" required>
        <Input
          autoComplete="address-line1"
          placeholder="Street address"
          className="h-12"
          {...form.register("address1")}
        />
      </FormField>

      <FormField label="Apt, suite, etc. (optional)">
        <Input
          autoComplete="address-line2"
          className="h-12"
          {...form.register("address2")}
        />
      </FormField>

      {/* City, State, ZIP - Responsive grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <FormField label="City" required className="col-span-2 sm:col-span-1">
          <Input
            autoComplete="address-level2"
            className="h-12"
            {...form.register("city")}
          />
        </FormField>
        <FormField label="State" required>
          <Input
            autoComplete="address-level1"
            className="h-12"
            {...form.register("state")}
          />
        </FormField>
        <FormField label="ZIP" required>
          <Input
            autoComplete="postal-code"
            inputMode="numeric"
            className="h-12"
            {...form.register("postalCode")}
          />
        </FormField>
      </div>

      {/* Phone - Numeric keyboard on mobile */}
      <FormField label="Phone" description="For delivery updates" required>
        <Input
          type="tel"
          autoComplete="tel"
          inputMode="tel"
          className="h-12"
          {...form.register("phone")}
        />
      </FormField>

      {/* Navigation - Full width on mobile */}
      <div className="flex flex-col-reverse sm:flex-row justify-between gap-3 pt-4 border-t">
        <Button type="button" variant="ghost" onClick={onBack} className="w-full sm:w-auto">
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button type="submit" className="w-full sm:w-auto h-12">
          Continue to Payment
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </form>
  );
}
```

### Mobile Payment Step

```tsx
// components/checkout/payment-step-mobile.tsx
"use client";

import { PaymentElement } from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { Lock, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function PaymentStepMobile({ onComplete, onBack, isProcessing }) {
  return (
    <div className="space-y-4">
      {/* Payment Element with mobile-optimized styling */}
      <div className="border rounded-lg p-3 sm:p-4">
        <PaymentElement
          options={{
            layout: {
              type: "tabs",
              defaultCollapsed: false,
            },
            paymentMethodOrder: ["card", "apple_pay", "google_pay"],
            fields: {
              billingDetails: {
                address: {
                  country: "never",
                },
              },
            },
          }}
        />
      </div>

      {/* Security indicator */}
      <div className="flex items-center justify-center gap-2 text-xs sm:text-sm text-muted-foreground bg-muted/50 rounded-lg py-2 px-3">
        <Lock className="h-3 w-3 sm:h-4 sm:w-4" />
        <span>Your payment is secured with 256-bit SSL encryption</span>
      </div>

      {/* Navigation */}
      <div className="flex flex-col-reverse sm:flex-row justify-between gap-3 pt-4 border-t">
        <Button
          type="button"
          variant="ghost"
          onClick={onBack}
          disabled={isProcessing}
          className="w-full sm:w-auto"
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button
          type="submit"
          disabled={isProcessing}
          className="w-full sm:w-auto h-12"
        >
          {isProcessing ? (
            <>
              <span className="animate-pulse">Processing...</span>
            </>
          ) : (
            <>
              Review Order
              <ChevronRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
```

### Fixed Bottom Action Bar (Mobile)

```tsx
// components/checkout/checkout-action-bar.tsx
"use client";

import { useCheckout } from "@/components/providers/checkout-provider";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { Lock, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface CheckoutActionBarProps {
  step: "contact" | "shipping" | "payment" | "review";
  onContinue: () => void;
  isLoading?: boolean;
}

export function CheckoutActionBar({ step, onContinue, isLoading }: CheckoutActionBarProps) {
  const { state } = useCheckout();

  const buttonLabels = {
    contact: "Continue to Shipping",
    shipping: "Continue to Payment",
    payment: "Review Order",
    review: `Place Order - ${formatCurrency(state.totals.total)}`,
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-background border-t shadow-lg safe-area-pb">
      <div className="container px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="text-sm">
            <span className="text-muted-foreground">Total: </span>
            <span className="font-bold text-lg">{formatCurrency(state.totals.total)}</span>
          </div>
          <Button
            onClick={onContinue}
            disabled={isLoading}
            className="min-w-[160px] h-12"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : step === "review" ? (
              <>
                <Lock className="h-4 w-4 mr-2" />
                Place Order
              </>
            ) : (
              buttonLabels[step]
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
```

## Related Skills

### Uses Layout
- [checkout-layout](./checkout-layout.md)

### Related Pages
- [cart-page](./cart-page.md)
- [product-detail](./product-detail.md)

### Related Organisms
- [checkout-form](../organisms/checkout-form.md)
- [checkout-summary](../organisms/checkout-summary.md)

---

## Changelog

### 1.0.0 (2025-01-16)
- Initial implementation
- Multi-step form flow
- Stripe integration
- Review and confirmation
