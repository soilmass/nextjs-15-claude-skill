---
id: o-checkout-form
name: Checkout Form
version: 2.1.0
layer: L3
category: forms
description: E-commerce checkout form with shipping, billing, and payment sections
tags: [checkout, payment, e-commerce, form, shipping]
formula: CheckoutForm = FormField + FormFieldGroup + Combobox + Button + Input + Checkbox + Select + Card
composes:
  - ../molecules/form-field.md
  - ../molecules/combobox.md
  - ../atoms/input-button.md
  - ../atoms/input-text.md
  - ../atoms/input-checkbox.md
  - ../atoms/input-select.md
dependencies: [react-hook-form, zod, lucide-react]
performance:
  impact: medium
  lcp: medium
  cls: low
accessibility:
  wcag: AA
  keyboard: true
  screen-reader: true
---

# Checkout Form

## Overview

The Checkout Form organism provides a complete e-commerce checkout experience with customer information, shipping address, billing address (with same-as-shipping option), payment method selection, and order summary integration.

## When to Use

Use this skill when:
- Building e-commerce checkout flows
- Creating order forms with address collection
- Implementing payment method selection
- Building subscription checkout pages

## Composes

- [form-field](../molecules/form-field.md) - Form inputs with labels and validation
- [combobox](../molecules/combobox.md) - Country/state selection with search
- [button](../atoms/input-button.md) - Form submission and actions
- [input](../atoms/input-text.md) - Text inputs for customer data
- [checkbox](../atoms/input-checkbox.md) - Same as shipping toggle
- [select](../atoms/input-select.md) - Shipping method selection

## Composition Diagram

```
+------------------------------------------------------------------+
|                      CheckoutForm (Organism)                       |
+------------------------------------------------------------------+
|                                                                    |
|  +-----------------------------+  +-----------------------------+  |
|  |   Contact Section           |  |   Order Summary Slot        |  |
|  |  +------------------------+ |  |  +------------------------+ |  |
|  |  | FormField [Email]      | |  |  | (props.orderSummary)   | |  |
|  |  |  +------------------+  | |  |  |                        | |  |
|  |  |  | Input (email)    |  | |  |  | - Cart items           | |  |
|  |  |  +------------------+  | |  |  | - Subtotal             | |  |
|  |  +------------------------+ |  |  | - Shipping             | |  |
|  |  | FormField [Phone]      | |  |  | - Tax                  | |  |
|  |  |  +------------------+  | |  |  | - Total                | |  |
|  |  |  | Input (tel)      |  | |  |  +------------------------+ |  |
|  |  |  +------------------+  | |  +-----------------------------+  |
|  |  +------------------------+ |                                   |
|  +-----------------------------+                                   |
|                                                                    |
|  +--------------------------------------------------------------+  |
|  |   Shipping Address Section (FormFieldGroup)                   |  |
|  |  +-------------------------+  +-------------------------+     |  |
|  |  | FormField [First Name]  |  | FormField [Last Name]   |     |  |
|  |  |  +-------------------+  |  |  +-------------------+  |     |  |
|  |  |  | Input             |  |  |  | Input             |  |     |  |
|  |  |  +-------------------+  |  |  +-------------------+  |     |  |
|  |  +-------------------------+  +-------------------------+     |  |
|  |  +----------------------------------------------------------+ |  |
|  |  | FormField [Street Address]                                | |  |
|  |  |  +------------------------------------------------------+ | |  |
|  |  |  | Input                                                 | | |  |
|  |  |  +------------------------------------------------------+ | |  |
|  |  +----------------------------------------------------------+ |  |
|  |  +-------------------------+  +-------------------------+     |  |
|  |  | FormField [City]        |  | FormField [State]       |     |  |
|  |  |  +-------------------+  |  |  +-------------------+  |     |  |
|  |  |  | Input             |  |  |  | Combobox          |  |     |  |
|  |  |  +-------------------+  |  |  +-------------------+  |     |  |
|  |  +-------------------------+  +-------------------------+     |  |
|  |  +-------------------------+  +-------------------------+     |  |
|  |  | FormField [ZIP Code]    |  | FormField [Country]     |     |  |
|  |  |  +-------------------+  |  |  +-------------------+  |     |  |
|  |  |  | Input             |  |  |  | Combobox          |  |     |  |
|  |  |  +-------------------+  |  |  +-------------------+  |     |  |
|  |  +-------------------------+  +-------------------------+     |  |
|  +--------------------------------------------------------------+  |
|                                                                    |
|  +--------------------------------------------------------------+  |
|  |   Billing Address Section                                     |  |
|  |  +----------------------------------------------------------+ |  |
|  |  | Checkbox [Same as shipping]                               | |  |
|  |  +----------------------------------------------------------+ |  |
|  |  +----------------------------------------------------------+ |  |
|  |  | (Conditional: Billing address fields if not same)         | |  |
|  |  +----------------------------------------------------------+ |  |
|  +--------------------------------------------------------------+  |
|                                                                    |
|  +--------------------------------------------------------------+  |
|  |   Shipping Method Section                                     |  |
|  |  +----------------------------------------------------------+ |  |
|  |  | Select [Shipping Options]                                 | |  |
|  |  |  +------------------------------------------------------+ | |  |
|  |  |  | - Standard (Free, 5-7 days)                           | | |  |
|  |  |  | - Express ($9.99, 2-3 days)                           | | |  |
|  |  |  | - Overnight ($19.99, 1 day)                           | | |  |
|  |  |  +------------------------------------------------------+ | |  |
|  |  +----------------------------------------------------------+ |  |
|  +--------------------------------------------------------------+  |
|                                                                    |
|  +--------------------------------------------------------------+  |
|  |   Payment Display Section (Read-only)                         |  |
|  |  +----------------------------------------------------------+ |  |
|  |  | Card [Payment Method Display]                             | |  |
|  |  |  +------------------------------------------------------+ | |  |
|  |  |  | Icon + **** **** **** 4242                            | | |  |
|  |  |  | Expires 12/26                                         | | |  |
|  |  |  +------------------------------------------------------+ | |  |
|  |  +----------------------------------------------------------+ |  |
|  +--------------------------------------------------------------+  |
|                                                                    |
|  +--------------------------------------------------------------+  |
|  |   Actions                                                     |  |
|  |  +-------------------------+  +-------------------------+     |  |
|  |  | Button [Back]           |  | Button [Place Order]    |     |  |
|  |  | variant="outline"       |  | variant="default"       |     |  |
|  |  |                         |  | loading={isSubmitting}  |     |  |
|  |  +-------------------------+  +-------------------------+     |  |
|  +--------------------------------------------------------------+  |
|                                                                    |
+------------------------------------------------------------------+
```

## Implementation

```typescript
// components/organisms/checkout-form.tsx
"use client";

import * as React from "react";
import { useForm, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  CreditCard,
  Truck,
  Package,
  Zap,
  MapPin,
  User,
  Phone,
  Mail,
  AlertCircle,
  ChevronLeft,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Combobox } from "@/components/ui/combobox";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

// ============================================================================
// Types & Interfaces
// ============================================================================

interface ShippingMethod {
  id: string;
  name: string;
  description: string;
  price: number;
  estimatedDays: string;
}

interface PaymentMethod {
  id: string;
  type: "card" | "paypal" | "bank";
  last4?: string;
  expiryMonth?: number;
  expiryYear?: number;
  brand?: string;
  email?: string;
}

interface CheckoutFormProps {
  /** Available shipping methods */
  shippingMethods: ShippingMethod[];
  /** Saved payment method to display */
  paymentMethod?: PaymentMethod;
  /** Order summary component */
  orderSummary?: React.ReactNode;
  /** Submit handler */
  onSubmit: (data: CheckoutFormData) => Promise<void>;
  /** Back/cancel handler */
  onBack?: () => void;
  /** Pre-filled customer data */
  defaultValues?: Partial<CheckoutFormData>;
  /** Show express checkout options */
  showExpressCheckout?: boolean;
  /** Custom class names */
  className?: string;
  /** Disable form during processing */
  disabled?: boolean;
}

// ============================================================================
// Validation Schemas
// ============================================================================

const addressSchema = z.object({
  firstName: z
    .string()
    .min(1, "First name is required")
    .max(50, "First name must be 50 characters or less"),
  lastName: z
    .string()
    .min(1, "Last name is required")
    .max(50, "Last name must be 50 characters or less"),
  address1: z
    .string()
    .min(1, "Street address is required")
    .max(100, "Address must be 100 characters or less"),
  address2: z.string().max(100, "Address must be 100 characters or less").optional(),
  city: z
    .string()
    .min(1, "City is required")
    .max(50, "City must be 50 characters or less"),
  state: z.string().min(1, "State/Province is required"),
  postalCode: z
    .string()
    .min(1, "ZIP/Postal code is required")
    .max(20, "ZIP/Postal code must be 20 characters or less"),
  country: z.string().min(1, "Country is required"),
});

const checkoutFormSchema = z.object({
  // Contact information
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  phone: z
    .string()
    .min(1, "Phone number is required")
    .regex(
      /^[\d\s\-+()]+$/,
      "Phone number can only contain digits, spaces, and + - ( )"
    ),

  // Shipping address
  shippingAddress: addressSchema,

  // Billing address
  sameAsShipping: z.boolean(),
  billingAddress: addressSchema.optional(),

  // Shipping method
  shippingMethodId: z.string().min(1, "Please select a shipping method"),

  // Order notes
  orderNotes: z.string().max(500, "Notes must be 500 characters or less").optional(),
}).refine(
  (data) => {
    // If billing is not same as shipping, billing address is required
    if (!data.sameAsShipping) {
      return data.billingAddress !== undefined;
    }
    return true;
  },
  {
    message: "Billing address is required when different from shipping",
    path: ["billingAddress"],
  }
);

export type CheckoutFormData = z.infer<typeof checkoutFormSchema>;

// ============================================================================
// Country & State Data
// ============================================================================

const countries = [
  { value: "US", label: "United States" },
  { value: "CA", label: "Canada" },
  { value: "GB", label: "United Kingdom" },
  { value: "AU", label: "Australia" },
  { value: "DE", label: "Germany" },
  { value: "FR", label: "France" },
  { value: "JP", label: "Japan" },
  { value: "NL", label: "Netherlands" },
  { value: "IT", label: "Italy" },
  { value: "ES", label: "Spain" },
];

const statesByCountry: Record<string, Array<{ value: string; label: string }>> = {
  US: [
    { value: "AL", label: "Alabama" },
    { value: "AK", label: "Alaska" },
    { value: "AZ", label: "Arizona" },
    { value: "AR", label: "Arkansas" },
    { value: "CA", label: "California" },
    { value: "CO", label: "Colorado" },
    { value: "CT", label: "Connecticut" },
    { value: "DE", label: "Delaware" },
    { value: "FL", label: "Florida" },
    { value: "GA", label: "Georgia" },
    { value: "HI", label: "Hawaii" },
    { value: "ID", label: "Idaho" },
    { value: "IL", label: "Illinois" },
    { value: "IN", label: "Indiana" },
    { value: "NY", label: "New York" },
    { value: "TX", label: "Texas" },
    { value: "WA", label: "Washington" },
  ],
  CA: [
    { value: "AB", label: "Alberta" },
    { value: "BC", label: "British Columbia" },
    { value: "MB", label: "Manitoba" },
    { value: "ON", label: "Ontario" },
    { value: "QC", label: "Quebec" },
  ],
  GB: [
    { value: "ENG", label: "England" },
    { value: "SCT", label: "Scotland" },
    { value: "WLS", label: "Wales" },
    { value: "NIR", label: "Northern Ireland" },
  ],
  AU: [
    { value: "NSW", label: "New South Wales" },
    { value: "VIC", label: "Victoria" },
    { value: "QLD", label: "Queensland" },
    { value: "WA", label: "Western Australia" },
    { value: "SA", label: "South Australia" },
  ],
};

// ============================================================================
// Form Field Component (Internal)
// ============================================================================

interface FormFieldProps {
  label: string;
  error?: string;
  required?: boolean;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

function FormField({
  label,
  error,
  required,
  description,
  children,
  className,
}: FormFieldProps) {
  const id = React.useId();
  const descriptionId = `${id}-description`;
  const errorId = `${id}-error`;

  return (
    <div className={cn("space-y-2", className)}>
      <Label
        htmlFor={id}
        className={cn("text-sm font-medium", error && "text-destructive")}
      >
        {label}
        {required && (
          <span className="text-destructive ml-1" aria-hidden="true">
            *
          </span>
        )}
      </Label>
      {description && (
        <p id={descriptionId} className="text-sm text-muted-foreground">
          {description}
        </p>
      )}
      {React.isValidElement(children)
        ? React.cloneElement(children as React.ReactElement, {
            id,
            "aria-describedby":
              cn(description && descriptionId, error && errorId) || undefined,
            "aria-invalid": !!error,
          })
        : children}
      {error && (
        <p
          id={errorId}
          className="text-sm text-destructive flex items-center gap-1"
          role="alert"
        >
          <AlertCircle className="h-3 w-3" />
          {error}
        </p>
      )}
    </div>
  );
}

// ============================================================================
// Address Fields Component (Internal)
// ============================================================================

interface AddressFieldsProps {
  prefix: "shippingAddress" | "billingAddress";
  control: any;
  errors: any;
  disabled?: boolean;
}

function AddressFields({ prefix, control, errors, disabled }: AddressFieldsProps) {
  const country = useWatch({ control, name: `${prefix}.country` });
  const states = statesByCountry[country] || [];

  return (
    <div className="space-y-4">
      {/* Name Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Controller
          name={`${prefix}.firstName`}
          control={control}
          render={({ field }) => (
            <FormField
              label="First name"
              error={errors?.[prefix]?.firstName?.message}
              required
            >
              <Input
                {...field}
                placeholder="John"
                disabled={disabled}
                autoComplete="given-name"
              />
            </FormField>
          )}
        />
        <Controller
          name={`${prefix}.lastName`}
          control={control}
          render={({ field }) => (
            <FormField
              label="Last name"
              error={errors?.[prefix]?.lastName?.message}
              required
            >
              <Input
                {...field}
                placeholder="Doe"
                disabled={disabled}
                autoComplete="family-name"
              />
            </FormField>
          )}
        />
      </div>

      {/* Street Address */}
      <Controller
        name={`${prefix}.address1`}
        control={control}
        render={({ field }) => (
          <FormField
            label="Street address"
            error={errors?.[prefix]?.address1?.message}
            required
          >
            <Input
              {...field}
              placeholder="123 Main Street"
              disabled={disabled}
              autoComplete="address-line1"
            />
          </FormField>
        )}
      />

      {/* Address Line 2 */}
      <Controller
        name={`${prefix}.address2`}
        control={control}
        render={({ field }) => (
          <FormField label="Apartment, suite, etc. (optional)">
            <Input
              {...field}
              placeholder="Apt 4B"
              disabled={disabled}
              autoComplete="address-line2"
            />
          </FormField>
        )}
      />

      {/* City & State */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Controller
          name={`${prefix}.city`}
          control={control}
          render={({ field }) => (
            <FormField
              label="City"
              error={errors?.[prefix]?.city?.message}
              required
            >
              <Input
                {...field}
                placeholder="New York"
                disabled={disabled}
                autoComplete="address-level2"
              />
            </FormField>
          )}
        />
        <Controller
          name={`${prefix}.state`}
          control={control}
          render={({ field }) => (
            <FormField
              label="State / Province"
              error={errors?.[prefix]?.state?.message}
              required
            >
              {states.length > 0 ? (
                <Combobox
                  options={states}
                  value={field.value}
                  onChange={(val) => field.onChange(val as string)}
                  placeholder="Select state..."
                  searchPlaceholder="Search states..."
                  disabled={disabled}
                />
              ) : (
                <Input
                  {...field}
                  placeholder="State/Province"
                  disabled={disabled}
                  autoComplete="address-level1"
                />
              )}
            </FormField>
          )}
        />
      </div>

      {/* ZIP & Country */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Controller
          name={`${prefix}.postalCode`}
          control={control}
          render={({ field }) => (
            <FormField
              label="ZIP / Postal code"
              error={errors?.[prefix]?.postalCode?.message}
              required
            >
              <Input
                {...field}
                placeholder="10001"
                disabled={disabled}
                autoComplete="postal-code"
              />
            </FormField>
          )}
        />
        <Controller
          name={`${prefix}.country`}
          control={control}
          render={({ field }) => (
            <FormField
              label="Country"
              error={errors?.[prefix]?.country?.message}
              required
            >
              <Combobox
                options={countries}
                value={field.value}
                onChange={(val) => field.onChange(val as string)}
                placeholder="Select country..."
                searchPlaceholder="Search countries..."
                disabled={disabled}
              />
            </FormField>
          )}
        />
      </div>
    </div>
  );
}

// ============================================================================
// Payment Method Display Component (Internal)
// ============================================================================

interface PaymentMethodDisplayProps {
  paymentMethod: PaymentMethod;
}

function PaymentMethodDisplay({ paymentMethod }: PaymentMethodDisplayProps) {
  const getCardIcon = (brand?: string) => {
    // In a real app, you would use brand-specific icons
    return <CreditCard className="h-5 w-5" />;
  };

  if (paymentMethod.type === "card") {
    return (
      <div className="flex items-center gap-3 p-4 border rounded-lg bg-muted/50">
        {getCardIcon(paymentMethod.brand)}
        <div className="flex-1">
          <p className="text-sm font-medium">
            {paymentMethod.brand || "Card"} ending in {paymentMethod.last4}
          </p>
          <p className="text-xs text-muted-foreground">
            Expires {paymentMethod.expiryMonth?.toString().padStart(2, "0")}/
            {paymentMethod.expiryYear?.toString().slice(-2)}
          </p>
        </div>
      </div>
    );
  }

  if (paymentMethod.type === "paypal") {
    return (
      <div className="flex items-center gap-3 p-4 border rounded-lg bg-muted/50">
        <div className="h-5 w-5 flex items-center justify-center text-primary font-bold text-xs">
          PP
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium">PayPal</p>
          <p className="text-xs text-muted-foreground">{paymentMethod.email}</p>
        </div>
      </div>
    );
  }

  return null;
}

// ============================================================================
// Shipping Method Option Component (Internal)
// ============================================================================

interface ShippingMethodOptionProps {
  method: ShippingMethod;
  selected: boolean;
  onSelect: () => void;
  disabled?: boolean;
}

function ShippingMethodOption({
  method,
  selected,
  onSelect,
  disabled,
}: ShippingMethodOptionProps) {
  const getIcon = (name: string) => {
    if (name.toLowerCase().includes("express")) return <Zap className="h-5 w-5" />;
    if (name.toLowerCase().includes("overnight")) return <Truck className="h-5 w-5" />;
    return <Package className="h-5 w-5" />;
  };

  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={disabled}
      className={cn(
        "w-full flex items-center gap-4 p-4 border rounded-lg text-left transition-colors",
        "hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        selected && "border-primary bg-primary/5",
        disabled && "opacity-50 cursor-not-allowed"
      )}
      role="radio"
      aria-checked={selected}
    >
      <div
        className={cn(
          "shrink-0 p-2 rounded-full",
          selected ? "bg-primary text-primary-foreground" : "bg-muted"
        )}
      >
        {getIcon(method.name)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">{method.name}</p>
        <p className="text-xs text-muted-foreground">{method.description}</p>
        <p className="text-xs text-muted-foreground mt-1">{method.estimatedDays}</p>
      </div>
      <div className="shrink-0 text-right">
        <p className="text-sm font-semibold">
          {method.price === 0 ? "Free" : `$${method.price.toFixed(2)}`}
        </p>
      </div>
    </button>
  );
}

// ============================================================================
// Main CheckoutForm Component
// ============================================================================

export function CheckoutForm({
  shippingMethods,
  paymentMethod,
  orderSummary,
  onSubmit,
  onBack,
  defaultValues,
  showExpressCheckout = false,
  className,
  disabled = false,
}: CheckoutFormProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: {
      email: "",
      phone: "",
      shippingAddress: {
        firstName: "",
        lastName: "",
        address1: "",
        address2: "",
        city: "",
        state: "",
        postalCode: "",
        country: "US",
      },
      sameAsShipping: true,
      billingAddress: undefined,
      shippingMethodId: shippingMethods[0]?.id || "",
      orderNotes: "",
      ...defaultValues,
    },
  });

  const sameAsShipping = watch("sameAsShipping");
  const selectedShippingMethodId = watch("shippingMethodId");

  // Initialize billing address when toggling off same-as-shipping
  React.useEffect(() => {
    if (!sameAsShipping) {
      setValue("billingAddress", {
        firstName: "",
        lastName: "",
        address1: "",
        address2: "",
        city: "",
        state: "",
        postalCode: "",
        country: "US",
      });
    } else {
      setValue("billingAddress", undefined);
    }
  }, [sameAsShipping, setValue]);

  const onFormSubmit = async (data: CheckoutFormData) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await onSubmit(data);
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "An error occurred. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onFormSubmit)}
      className={cn("space-y-8", className)}
      noValidate
    >
      {/* Global Error */}
      {submitError && (
        <div
          className="p-4 border border-destructive bg-destructive/10 rounded-lg flex items-start gap-3"
          role="alert"
        >
          <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-destructive">
              Unable to process your order
            </p>
            <p className="text-sm text-destructive/80 mt-1">{submitError}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Form Column */}
        <div className="lg:col-span-2 space-y-8">
          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Contact Information
              </CardTitle>
              <CardDescription>
                We will use this to send your order confirmation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Controller
                  name="email"
                  control={control}
                  render={({ field }) => (
                    <FormField
                      label="Email"
                      error={errors.email?.message}
                      required
                    >
                      <Input
                        {...field}
                        type="email"
                        placeholder="john@example.com"
                        disabled={disabled || isSubmitting}
                        autoComplete="email"
                      />
                    </FormField>
                  )}
                />
                <Controller
                  name="phone"
                  control={control}
                  render={({ field }) => (
                    <FormField
                      label="Phone"
                      error={errors.phone?.message}
                      required
                    >
                      <Input
                        {...field}
                        type="tel"
                        placeholder="+1 (555) 123-4567"
                        disabled={disabled || isSubmitting}
                        autoComplete="tel"
                      />
                    </FormField>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Shipping Address */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Shipping Address
              </CardTitle>
              <CardDescription>Where should we deliver your order?</CardDescription>
            </CardHeader>
            <CardContent>
              <AddressFields
                prefix="shippingAddress"
                control={control}
                errors={errors}
                disabled={disabled || isSubmitting}
              />
            </CardContent>
          </Card>

          {/* Billing Address */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Billing Address
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Controller
                name="sameAsShipping"
                control={control}
                render={({ field }) => (
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id="same-as-shipping"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={disabled || isSubmitting}
                    />
                    <Label
                      htmlFor="same-as-shipping"
                      className="text-sm font-normal cursor-pointer"
                    >
                      Same as shipping address
                    </Label>
                  </div>
                )}
              />

              {!sameAsShipping && (
                <div className="pt-4 border-t">
                  <AddressFields
                    prefix="billingAddress"
                    control={control}
                    errors={errors}
                    disabled={disabled || isSubmitting}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Shipping Method */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5" />
                Shipping Method
              </CardTitle>
              <CardDescription>Choose how you want your order delivered</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3" role="radiogroup" aria-label="Shipping method">
                {shippingMethods.map((method) => (
                  <ShippingMethodOption
                    key={method.id}
                    method={method}
                    selected={selectedShippingMethodId === method.id}
                    onSelect={() => setValue("shippingMethodId", method.id)}
                    disabled={disabled || isSubmitting}
                  />
                ))}
              </div>
              {errors.shippingMethodId && (
                <p className="text-sm text-destructive mt-2 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.shippingMethodId.message}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Payment Method Display */}
          {paymentMethod && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment Method
                </CardTitle>
              </CardHeader>
              <CardContent>
                <PaymentMethodDisplay paymentMethod={paymentMethod} />
              </CardContent>
            </Card>
          )}

          {/* Order Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Order Notes (Optional)</CardTitle>
              <CardDescription>
                Special instructions for your order
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Controller
                name="orderNotes"
                control={control}
                render={({ field }) => (
                  <FormField label="Notes" error={errors.orderNotes?.message}>
                    <textarea
                      {...field}
                      className={cn(
                        "w-full min-h-[100px] px-3 py-2 text-sm rounded-md border border-input",
                        "bg-background ring-offset-background",
                        "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                        "disabled:cursor-not-allowed disabled:opacity-50",
                        "placeholder:text-muted-foreground resize-y"
                      )}
                      placeholder="Leave at the door, ring the bell, etc."
                      disabled={disabled || isSubmitting}
                    />
                  </FormField>
                )}
              />
            </CardContent>
          </Card>
        </div>

        {/* Order Summary Column */}
        <div className="lg:col-span-1">
          <div className="lg:sticky lg:top-6 space-y-6">
            {/* Order Summary Slot */}
            {orderSummary && (
              <Card>
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent>{orderSummary}</CardContent>
              </Card>
            )}

            {/* Action Buttons */}
            <Card>
              <CardContent className="pt-6 space-y-4">
                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={disabled || isSubmitting}
                  loading={isSubmitting}
                >
                  {isSubmitting ? "Processing..." : "Place Order"}
                </Button>

                {onBack && (
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={onBack}
                    disabled={isSubmitting}
                  >
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    Back to Cart
                  </Button>
                )}

                <p className="text-xs text-center text-muted-foreground">
                  By placing your order, you agree to our{" "}
                  <a href="/terms" className="underline hover:text-foreground">
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a href="/privacy" className="underline hover:text-foreground">
                    Privacy Policy
                  </a>
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </form>
  );
}

// ============================================================================
// Export Types
// ============================================================================

export type { ShippingMethod, PaymentMethod, CheckoutFormProps };
```

### Key Implementation Notes

1. **Zod Validation**: Comprehensive schema with address validation and conditional billing address
2. **React Hook Form**: Controller pattern for full control over form state and validation
3. **Conditional Fields**: Billing address only required when not same as shipping
4. **useWatch Hook**: Efficient re-renders for dependent fields (state dropdown based on country)
5. **Error Handling**: Global submit errors and per-field validation errors
6. **Loading States**: Form-wide disabled state during submission
7. **Accessibility**: Proper ARIA attributes, form field associations, and role attributes

## Variants

### Basic Checkout

```tsx
<CheckoutForm
  shippingMethods={shippingMethods}
  onSubmit={async (data) => {
    await processOrder(data);
  }}
/>
```

### With Order Summary

```tsx
<CheckoutForm
  shippingMethods={shippingMethods}
  onSubmit={handleCheckout}
  orderSummary={<OrderSummary items={cartItems} />}
/>
```

### With Pre-filled Data

```tsx
<CheckoutForm
  shippingMethods={shippingMethods}
  onSubmit={handleCheckout}
  defaultValues={{
    email: user.email,
    phone: user.phone,
    shippingAddress: user.defaultAddress,
  }}
/>
```

### With Payment Method Display

```tsx
<CheckoutForm
  shippingMethods={shippingMethods}
  paymentMethod={{
    id: "pm_1234",
    type: "card",
    brand: "Visa",
    last4: "4242",
    expiryMonth: 12,
    expiryYear: 2026,
  }}
  onSubmit={handleCheckout}
/>
```

## States

| State | Form | Inputs | Submit Button | Error Display |
|-------|------|--------|---------------|---------------|
| Default | enabled | interactive | enabled | hidden |
| Submitting | disabled | disabled | loading spinner | hidden |
| Error | enabled | interactive | enabled | visible |
| Validation Error | enabled | error styling | enabled | per-field |
| Disabled | disabled | disabled | disabled | hidden |

## Accessibility

### Required Attributes

- Labels linked to all inputs via `htmlFor`
- Required fields marked with `*` and `aria-required`
- Error messages with proper association via `aria-describedby`
- `aria-invalid` on fields with errors
- `role="alert"` on error messages

### Keyboard Navigation

| Key | Action |
|-----|--------|
| `Tab` | Navigate fields |
| `Shift+Tab` | Navigate backwards |
| `Enter` | Open selects, submit form |
| `Space` | Toggle checkboxes |
| `Arrow keys` | Navigate within selects/comboboxes |
| `Escape` | Close dropdowns |

### Screen Reader Announcements

- Form section headings announced
- Required field indicator announced
- Validation errors announced on blur
- Submit status changes announced
- Shipping method selection announced

## Dependencies

```json
{
  "dependencies": {
    "react-hook-form": "^7.53.0",
    "@hookform/resolvers": "^3.9.0",
    "zod": "^3.23.0",
    "lucide-react": "^0.460.0",
    "@radix-ui/react-checkbox": "^1.1.0",
    "@radix-ui/react-select": "^2.1.0",
    "@radix-ui/react-label": "^2.1.0"
  }
}
```

### Installation

```bash
npm install react-hook-form @hookform/resolvers zod lucide-react
```

## Examples

### E-commerce Checkout Page

```tsx
import { CheckoutForm } from "@/components/organisms/checkout-form";
import { OrderSummary } from "@/components/organisms/order-summary";

const shippingMethods = [
  {
    id: "standard",
    name: "Standard Shipping",
    description: "Delivered by postal service",
    price: 0,
    estimatedDays: "5-7 business days",
  },
  {
    id: "express",
    name: "Express Shipping",
    description: "Priority delivery",
    price: 9.99,
    estimatedDays: "2-3 business days",
  },
  {
    id: "overnight",
    name: "Overnight Shipping",
    description: "Next business day delivery",
    price: 19.99,
    estimatedDays: "1 business day",
  },
];

export function CheckoutPage() {
  const { cartItems, cartTotal } = useCart();
  const router = useRouter();

  const handleSubmit = async (data: CheckoutFormData) => {
    const response = await fetch("/api/orders", {
      method: "POST",
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error("Failed to process order");
    }

    const order = await response.json();
    router.push(`/orders/${order.id}/confirmation`);
  };

  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-8">Checkout</h1>
      <CheckoutForm
        shippingMethods={shippingMethods}
        onSubmit={handleSubmit}
        onBack={() => router.push("/cart")}
        orderSummary={
          <OrderSummary items={cartItems} subtotal={cartTotal} />
        }
      />
    </div>
  );
}
```

### With Authenticated User

```tsx
import { useAuth } from "@/hooks/use-auth";
import { CheckoutForm } from "@/components/organisms/checkout-form";

export function AuthenticatedCheckout() {
  const { user, savedPaymentMethods } = useAuth();
  const defaultPaymentMethod = savedPaymentMethods[0];

  return (
    <CheckoutForm
      shippingMethods={shippingMethods}
      paymentMethod={defaultPaymentMethod}
      defaultValues={{
        email: user.email,
        phone: user.phone,
        shippingAddress: user.addresses[0],
        sameAsShipping: true,
      }}
      onSubmit={handleCheckout}
    />
  );
}
```

### Subscription Checkout

```tsx
export function SubscriptionCheckout() {
  return (
    <CheckoutForm
      shippingMethods={[
        {
          id: "monthly",
          name: "Monthly Delivery",
          description: "Delivered on the 1st of each month",
          price: 0,
          estimatedDays: "Recurring monthly",
        },
      ]}
      onSubmit={async (data) => {
        await createSubscription({
          ...data,
          interval: "monthly",
        });
      }}
      orderSummary={<SubscriptionSummary />}
    />
  );
}
```

## Anti-patterns

### Missing Error Handling

```tsx
// Bad - no error handling
<CheckoutForm
  onSubmit={async (data) => {
    await api.createOrder(data); // What if this fails?
  }}
/>

// Good - proper error handling
<CheckoutForm
  onSubmit={async (data) => {
    try {
      await api.createOrder(data);
    } catch (error) {
      // CheckoutForm catches and displays this
      throw new Error("Payment failed. Please try again.");
    }
  }}
/>
```

### Not Validating on Server

```tsx
// Bad - trusting client validation only
app.post("/api/orders", (req, res) => {
  createOrder(req.body); // Dangerous!
});

// Good - validate on server too
app.post("/api/orders", (req, res) => {
  const result = checkoutFormSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ errors: result.error });
  }
  createOrder(result.data);
});
```

### Storing Sensitive Data

```tsx
// Bad - storing card details
<CheckoutForm
  onSubmit={async (data) => {
    await saveCardDetails(data.cardNumber); // Never do this!
  }}
/>

// Good - use payment processor tokens
<CheckoutForm
  paymentMethod={tokenizedPaymentMethod}
  onSubmit={async (data) => {
    await processPayment(data, paymentMethodToken);
  }}
/>
```

### No Loading Feedback

```tsx
// Bad - no indication of progress
<Button onClick={submit}>Submit</Button>

// Good - clear loading state (built into CheckoutForm)
<Button loading={isSubmitting}>
  {isSubmitting ? "Processing..." : "Place Order"}
</Button>
```

## Related Skills

### Composes From
- [molecules/form-field](../molecules/form-field.md) - Form inputs with validation
- [molecules/combobox](../molecules/combobox.md) - Searchable country/state selects
- [atoms/input-button](../atoms/input-button.md) - Submit and back buttons
- [atoms/input-checkbox](../atoms/input-checkbox.md) - Same as shipping toggle
- [atoms/input-select](../atoms/input-select.md) - Shipping method selection

### Composes Into
- [templates/checkout-page](../templates/checkout-page.md) - Full checkout page layout

### Related
- [organisms/checkout-summary](./checkout-summary.md) - Order summary display
- [organisms/auth-form](./auth-form.md) - Login/signup forms
- [organisms/payment-form](./payment-form.md) - Payment input (if collecting card details)

---

## Changelog

### 2.1.0 (2025-01-18)
- Complete implementation with full TypeScript code
- Added formula and composition diagram
- Comprehensive Zod validation schemas
- React Hook Form integration with Controller pattern
- Conditional billing address handling
- Country/state dynamic selection
- Payment method display component
- Shipping method selection with visual options
- Loading states and error handling
- Full accessibility support

### 2.0.0 (2025-01-17)
- Standardized to atomic design system v2
- Updated frontmatter schema
- Added explicit composition references

### 1.0.0 (2025-01-16)
- Initial implementation
- Express checkout support
- Accordion-based sections
