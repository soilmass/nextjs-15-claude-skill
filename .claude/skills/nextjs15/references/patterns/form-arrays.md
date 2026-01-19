---
id: pt-form-arrays
name: Form Array Patterns
version: 2.0.0
layer: L5
category: forms
description: Dynamic form arrays with add/remove/reorder functionality using react-hook-form
tags: [forms, arrays, dynamic-fields, react-hook-form, drag-drop]
composes:
  - ../molecules/form-field.md
  - ../molecules/sortable-item.md
  - ../atoms/input-text.md
  - ../atoms/input-textarea.md
  - ../atoms/input-number.md
  - ../atoms/input-checkbox.md
  - ../atoms/input-button.md
  - ../atoms/display-icon.md
dependencies: []
formula: "FormArrays = useFieldArray + FormField(m-form-field) + SortableItem(m-sortable-item) + dnd-kit + Button(a-input-button) + Icons (add/remove/drag)"
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: AA
  keyboard: true
  screen-reader: true
---

# Form Array Patterns

## Overview

Form arrays handle dynamic lists of form fields where users can add, remove, and reorder items. This pattern covers react-hook-form's useFieldArray, validation, and drag-and-drop reordering.

## When to Use

- Work experience or education history in resume builders
- Line items in invoice or order forms
- Multiple addresses (shipping, billing, additional)
- Skills, tags, or keywords lists
- Dynamic configuration options
- Repeatable form sections (team members, references, etc.)

## Composition Diagram

```
+----------------------------------------------------------------------+
|                       Form Array Pattern                              |
+----------------------------------------------------------------------+
|                                                                      |
|  +----------------------------------------------------------------+  |
|  |              Header with Add Button                             |  |
|  |  +---------------------------+  +---------------------------+   |  |
|  |  | Title (e.g., "Work        |  | Add Button                |   |  |
|  |  | Experience")              |  | (a-input-button + icon)   |   |  |
|  |  +---------------------------+  | [+ Add Experience]        |   |  |
|  |                                 +---------------------------+   |  |
|  +----------------------------------------------------------------+  |
|                                                                      |
|  +----------------------------------------------------------------+  |
|  |              Array Items Container                              |  |
|  |  +------------------------------------------------------------+|  |
|  |  | DndContext (dnd-kit) - for drag-drop reordering            ||  |
|  |  | SortableContext                                             ||  |
|  |  |  +--------------------------------------------------------+||  |
|  |  |  | SortableItem (m-sortable-item)                 [key=id]|||  |
|  |  |  |  +----------------------------------------------------+|||  |
|  |  |  |  | +----+  +---------------------------------------+  ||||  |
|  |  |  |  | |Drag|  | Item Fields                           |  ||||  |
|  |  |  |  | |Grip|  | +---------------+ +---------------+   |  ||||  |
|  |  |  |  | |Icon|  | | FormField     | | FormField     |   |  ||||  |
|  |  |  |  | |(a- |  | | (m-form-field)| | (m-form-field)|   |  ||||  |
|  |  |  |  | |disp|  | | + Input       | | + Input       |   |  ||||  |
|  |  |  |  | |-icn|  | +---------------+ +---------------+   |  ||||  |
|  |  |  |  | +----+  +---------------------------------------+  ||||  |
|  |  |  |  |                                    +-------------+ ||||  |
|  |  |  |  |                                    | Delete Btn  | ||||  |
|  |  |  |  |                                    | (a-input-   | ||||  |
|  |  |  |  |                                    | button+icon)| ||||  |
|  |  |  |  |                                    +-------------+ ||||  |
|  |  |  |  +----------------------------------------------------+|||  |
|  |  |  +--------------------------------------------------------+||  |
|  |  |  | ... more SortableItems                                  ||  |
|  |  +------------------------------------------------------------+|  |
|  +----------------------------------------------------------------+  |
|                                                                      |
|  useFieldArray provides: fields, append, remove, move, swap          |
|                                                                      |
+----------------------------------------------------------------------+
```

## Implementation

### Basic Field Array

```typescript
// components/experience-form.tsx
"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/ui/form-field";

const experienceSchema = z.object({
  company: z.string().min(1, "Company is required"),
  title: z.string().min(1, "Title is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional(),
  current: z.boolean().default(false),
  description: z.string().optional(),
});

const formSchema = z.object({
  experiences: z
    .array(experienceSchema)
    .min(1, "Add at least one experience")
    .max(10, "Maximum 10 experiences"),
});

type FormValues = z.infer<typeof formSchema>;

const defaultExperience = {
  company: "",
  title: "",
  startDate: "",
  endDate: "",
  current: false,
  description: "",
};

export function ExperienceForm() {
  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      experiences: [defaultExperience],
    },
  });

  const { fields, append, remove, move } = useFieldArray({
    control,
    name: "experiences",
  });

  const onSubmit = (data: FormValues) => {
    console.log(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Work Experience</h2>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => append(defaultExperience)}
          disabled={fields.length >= 10}
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Experience
        </Button>
      </div>

      {errors.experiences?.root && (
        <p className="text-sm text-destructive">
          {errors.experiences.root.message}
        </p>
      )}

      <div className="space-y-6">
        {fields.map((field, index) => {
          const isCurrent = watch(`experiences.${index}.current`);

          return (
            <div
              key={field.id}
              className="relative border rounded-lg p-4 space-y-4"
            >
              {/* Remove button */}
              {fields.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={() => remove(index)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              )}

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  label="Company"
                  error={errors.experiences?.[index]?.company?.message}
                  required
                >
                  <Input
                    {...register(`experiences.${index}.company`)}
                    placeholder="Company name"
                  />
                </FormField>

                <FormField
                  label="Job Title"
                  error={errors.experiences?.[index]?.title?.message}
                  required
                >
                  <Input
                    {...register(`experiences.${index}.title`)}
                    placeholder="Your role"
                  />
                </FormField>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  label="Start Date"
                  error={errors.experiences?.[index]?.startDate?.message}
                  required
                >
                  <Input
                    {...register(`experiences.${index}.startDate`)}
                    type="month"
                  />
                </FormField>

                <FormField
                  label="End Date"
                  error={errors.experiences?.[index]?.endDate?.message}
                >
                  <Input
                    {...register(`experiences.${index}.endDate`)}
                    type="month"
                    disabled={isCurrent}
                  />
                </FormField>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  {...register(`experiences.${index}.current`)}
                  id={`current-${index}`}
                />
                <label htmlFor={`current-${index}`} className="text-sm">
                  I currently work here
                </label>
              </div>

              <FormField
                label="Description"
                error={errors.experiences?.[index]?.description?.message}
              >
                <Textarea
                  {...register(`experiences.${index}.description`)}
                  placeholder="Describe your responsibilities..."
                  rows={3}
                />
              </FormField>
            </div>
          );
        })}
      </div>

      <Button type="submit">Save Experience</Button>
    </form>
  );
}
```

### Nested Field Arrays

```typescript
// components/invoice-form.tsx
"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";

const lineItemSchema = z.object({
  description: z.string().min(1, "Description is required"),
  quantity: z.coerce.number().min(1, "Minimum quantity is 1"),
  unitPrice: z.coerce.number().min(0, "Price must be positive"),
});

const invoiceSchema = z.object({
  invoiceNumber: z.string().min(1, "Invoice number is required"),
  clientName: z.string().min(1, "Client name is required"),
  clientEmail: z.string().email("Invalid email"),
  lineItems: z
    .array(lineItemSchema)
    .min(1, "Add at least one line item"),
  notes: z.string().optional(),
});

type InvoiceForm = z.infer<typeof invoiceSchema>;

const defaultLineItem = {
  description: "",
  quantity: 1,
  unitPrice: 0,
};

export function InvoiceForm() {
  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<InvoiceForm>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      invoiceNumber: "",
      clientName: "",
      clientEmail: "",
      lineItems: [defaultLineItem],
      notes: "",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "lineItems",
  });

  const lineItems = watch("lineItems");
  
  const subtotal = lineItems.reduce(
    (sum, item) => sum + (item.quantity || 0) * (item.unitPrice || 0),
    0
  );
  const tax = subtotal * 0.1;
  const total = subtotal + tax;

  const onSubmit = (data: InvoiceForm) => {
    console.log(data);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Invoice Details */}
      <div className="grid grid-cols-3 gap-4">
        <FormField
          label="Invoice Number"
          error={errors.invoiceNumber?.message}
          required
        >
          <Input {...register("invoiceNumber")} placeholder="INV-001" />
        </FormField>

        <FormField
          label="Client Name"
          error={errors.clientName?.message}
          required
        >
          <Input {...register("clientName")} placeholder="Client name" />
        </FormField>

        <FormField
          label="Client Email"
          error={errors.clientEmail?.message}
          required
        >
          <Input
            {...register("clientEmail")}
            type="email"
            placeholder="client@example.com"
          />
        </FormField>
      </div>

      {/* Line Items */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Line Items</h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => append(defaultLineItem)}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Item
          </Button>
        </div>

        {/* Table header */}
        <div className="grid grid-cols-12 gap-2 text-sm font-medium text-muted-foreground">
          <div className="col-span-5">Description</div>
          <div className="col-span-2">Quantity</div>
          <div className="col-span-2">Unit Price</div>
          <div className="col-span-2 text-right">Total</div>
          <div className="col-span-1"></div>
        </div>

        {/* Line items */}
        {fields.map((field, index) => {
          const quantity = lineItems[index]?.quantity || 0;
          const unitPrice = lineItems[index]?.unitPrice || 0;
          const lineTotal = quantity * unitPrice;

          return (
            <div key={field.id} className="grid grid-cols-12 gap-2 items-start">
              <div className="col-span-5">
                <Input
                  {...register(`lineItems.${index}.description`)}
                  placeholder="Item description"
                  className={
                    errors.lineItems?.[index]?.description
                      ? "border-destructive"
                      : ""
                  }
                />
              </div>

              <div className="col-span-2">
                <Input
                  {...register(`lineItems.${index}.quantity`)}
                  type="number"
                  min={1}
                  className={
                    errors.lineItems?.[index]?.quantity
                      ? "border-destructive"
                      : ""
                  }
                />
              </div>

              <div className="col-span-2">
                <Input
                  {...register(`lineItems.${index}.unitPrice`)}
                  type="number"
                  min={0}
                  step={0.01}
                  className={
                    errors.lineItems?.[index]?.unitPrice
                      ? "border-destructive"
                      : ""
                  }
                />
              </div>

              <div className="col-span-2 text-right py-2">
                {formatCurrency(lineTotal)}
              </div>

              <div className="col-span-1">
                {fields.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => remove(index)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                )}
              </div>
            </div>
          );
        })}

        {/* Totals */}
        <div className="border-t pt-4 space-y-2">
          <div className="flex justify-end gap-8">
            <span className="text-muted-foreground">Subtotal:</span>
            <span className="w-24 text-right">{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-end gap-8">
            <span className="text-muted-foreground">Tax (10%):</span>
            <span className="w-24 text-right">{formatCurrency(tax)}</span>
          </div>
          <div className="flex justify-end gap-8 font-semibold">
            <span>Total:</span>
            <span className="w-24 text-right">{formatCurrency(total)}</span>
          </div>
        </div>
      </div>

      <Button type="submit">Create Invoice</Button>
    </form>
  );
}
```

### Drag and Drop Reordering

```typescript
// components/sortable-list-form.tsx
"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const itemSchema = z.object({
  id: z.string(),
  title: z.string().min(1, "Title is required"),
  priority: z.number(),
});

const formSchema = z.object({
  items: z.array(itemSchema).min(1, "Add at least one item"),
});

type FormValues = z.infer<typeof formSchema>;

interface SortableItemProps {
  id: string;
  index: number;
  register: ReturnType<typeof useForm<FormValues>>["register"];
  error?: string;
  onRemove: () => void;
  canRemove: boolean;
}

function SortableItem({
  id,
  index,
  register,
  error,
  onRemove,
  canRemove,
}: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-2 p-3 bg-background border rounded-lg",
        isDragging && "opacity-50 shadow-lg"
      )}
    >
      <button
        type="button"
        className="cursor-grab touch-none"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-5 w-5 text-muted-foreground" />
      </button>

      <span className="text-sm font-medium text-muted-foreground w-8">
        {index + 1}.
      </span>

      <Input
        {...register(`items.${index}.title`)}
        placeholder="Item title"
        className={cn("flex-1", error && "border-destructive")}
      />

      {canRemove && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onRemove}
        >
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      )}
    </div>
  );
}

export function SortableListForm() {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      items: [
        { id: "1", title: "", priority: 1 },
      ],
    },
  });

  const { fields, append, remove, move } = useFieldArray({
    control,
    name: "items",
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = fields.findIndex((f) => f.id === active.id);
      const newIndex = fields.findIndex((f) => f.id === over.id);
      move(oldIndex, newIndex);
    }
  };

  const addItem = () => {
    append({
      id: crypto.randomUUID(),
      title: "",
      priority: fields.length + 1,
    });
  };

  const onSubmit = (data: FormValues) => {
    // Update priorities based on order
    const orderedData = {
      ...data,
      items: data.items.map((item, index) => ({
        ...item,
        priority: index + 1,
      })),
    };
    console.log(orderedData);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Priority List</h2>
        <Button type="button" variant="outline" size="sm" onClick={addItem}>
          <Plus className="h-4 w-4 mr-1" />
          Add Item
        </Button>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={fields.map((f) => f.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2">
            {fields.map((field, index) => (
              <SortableItem
                key={field.id}
                id={field.id}
                index={index}
                register={register}
                error={errors.items?.[index]?.title?.message}
                onRemove={() => remove(index)}
                canRemove={fields.length > 1}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <Button type="submit">Save List</Button>
    </form>
  );
}
```

### Field Array with Server Action

```typescript
// app/actions/items.ts
"use server";

import { z } from "zod";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

const itemsSchema = z.object({
  items: z.array(
    z.object({
      id: z.string().optional(),
      title: z.string().min(1),
      priority: z.number(),
    })
  ),
});

export async function saveItems(formData: FormData) {
  const rawData = Object.fromEntries(formData);
  const items = JSON.parse(rawData.items as string);

  const parsed = itemsSchema.safeParse({ items });

  if (!parsed.success) {
    return { success: false, error: "Validation failed" };
  }

  try {
    // Use transaction for atomic updates
    await prisma.$transaction(async (tx) => {
      // Delete items not in the new list
      const existingIds = parsed.data.items
        .filter((i) => i.id)
        .map((i) => i.id as string);

      await tx.item.deleteMany({
        where: {
          id: { notIn: existingIds },
        },
      });

      // Upsert all items
      for (const item of parsed.data.items) {
        if (item.id) {
          await tx.item.update({
            where: { id: item.id },
            data: { title: item.title, priority: item.priority },
          });
        } else {
          await tx.item.create({
            data: { title: item.title, priority: item.priority },
          });
        }
      }
    });

    revalidatePath("/items");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to save items" };
  }
}
```

## Variants

### Conditional Field Arrays

```typescript
// Show different fields based on item type
const itemSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("text"),
    content: z.string().min(1),
  }),
  z.object({
    type: z.literal("image"),
    url: z.string().url(),
    alt: z.string(),
  }),
  z.object({
    type: z.literal("link"),
    url: z.string().url(),
    label: z.string(),
  }),
]);

// Render different inputs based on item.type
{fields.map((field, index) => (
  <div key={field.id}>
    {field.type === "text" && (
      <Textarea {...register(`items.${index}.content`)} />
    )}
    {field.type === "image" && (
      <>
        <Input {...register(`items.${index}.url`)} />
        <Input {...register(`items.${index}.alt`)} />
      </>
    )}
    {field.type === "link" && (
      <>
        <Input {...register(`items.${index}.url`)} />
        <Input {...register(`items.${index}.label`)} />
      </>
    )}
  </div>
))}
```

## Anti-patterns

1. **No unique keys**: Using array index as React key
2. **Missing min/max validation**: No limits on array size
3. **No confirmation on delete**: Accidentally removing items
4. **Complex nested arrays**: Too deep nesting hurts UX
5. **No optimistic updates**: Slow feedback on add/remove

## Related Skills

- `L5/patterns/form-validation` - Zod array validation
- `L5/patterns/react-hook-form` - Form library basics
- `L5/patterns/drag-drop` - Drag and drop patterns
- `L5/patterns/server-actions` - Server-side processing

## Changelog

### 2.0.0 (2025-01-17)
- Standardized to atomic design system v2
- Updated frontmatter schema

### 1.0.0
- Initial implementation with dnd-kit integration
