---
id: pt-server-actions
name: Server Actions
version: 2.1.0
layer: L5
category: data
description: Execute server-side code from client components using the 'use server' directive
tags: [data, server-actions, mutations, forms, next15, react19]
composes:
  - ../atoms/input-button.md
  - ../atoms/input-text.md
  - ../atoms/feedback-spinner.md
  - ../molecules/form-field.md
  - ../organisms/auth-form.md
  - ../organisms/file-uploader.md
dependencies: []
formula: "ServerAction = useActionState + FormField(m-form-field) + Button(a-input-button) + Spinner(a-feedback-spinner)"
performance:
  impact: medium
  lcp: positive
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# Server Actions

## Overview

Server Actions are async functions that run on the server. They can be called from both Server and Client Components for handling form submissions, data mutations, and other server-side operations. In Next.js 15 with React 19, Server Actions integrate with `useActionState` for enhanced form handling.

## When to Use

- Form submissions with server-side validation
- Data mutations (create, update, delete)
- File uploads to server
- Authentication flows (login, signup)
- Any operation requiring direct database access
- Progressive enhancement (works without JS)

## Composition Diagram

```
+------------------------------------------+
|              Server Action               |
|  'use server'                            |
|  +------------------------------------+  |
|  | Validation (Zod) -> DB Operation  |  |
|  | -> revalidatePath/Tag -> Return   |  |
|  +------------------------------------+  |
+------------------------------------------+
                    |
                    v
+------------------------------------------+
|            Client Component              |
|  +------------------------------------+  |
|  |          useActionState           |  |
|  +------------------------------------+  |
|  | +--------+  +--------+  +-------+ |  |
|  | |FormFld.|  | Button |  |Spinner| |  |
|  | +--------+  +--------+  +-------+ |  |
|  +------------------------------------+  |
+------------------------------------------+
```

## Basic Server Action

```typescript
// app/actions.ts
'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db';

export async function createTodo(formData: FormData) {
  const title = formData.get('title') as string;
  
  await prisma.todo.create({
    data: { title },
  });
  
  revalidatePath('/todos');
}
```

## Using in Forms

```typescript
// app/todos/page.tsx
import { createTodo } from '@/app/actions';

export default function TodosPage() {
  return (
    <form action={createTodo}>
      <input name="title" placeholder="Add todo..." />
      <button type="submit">Add</button>
    </form>
  );
}
```

## With useActionState (React 19)

```typescript
// app/actions/auth.ts
'use server';

import { z } from 'zod';
import { signIn } from '@/lib/auth';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export type LoginState = {
  success: boolean;
  errors?: {
    email?: string[];
    password?: string[];
    _form?: string[];
  };
};

export async function login(
  prevState: LoginState | null,
  formData: FormData
): Promise<LoginState> {
  const parsed = loginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  });

  if (!parsed.success) {
    return {
      success: false,
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    await signIn(parsed.data.email, parsed.data.password);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      errors: { _form: ['Invalid credentials'] },
    };
  }
}

// components/login-form.tsx
'use client';

import { useActionState } from 'react';
import { login, type LoginState } from '@/app/actions/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormField } from '@/components/ui/form-field';

export function LoginForm() {
  const [state, action, isPending] = useActionState<LoginState | null, FormData>(
    login,
    null
  );

  return (
    <form action={action} className="space-y-4">
      <FormField
        label="Email"
        error={state?.errors?.email?.[0]}
      >
        <Input 
          name="email" 
          type="email" 
          required 
          disabled={isPending}
        />
      </FormField>

      <FormField
        label="Password"
        error={state?.errors?.password?.[0]}
      >
        <Input 
          name="password" 
          type="password" 
          required 
          disabled={isPending}
        />
      </FormField>

      {state?.errors?._form && (
        <p className="text-destructive text-sm">{state.errors._form[0]}</p>
      )}

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? 'Signing in...' : 'Sign in'}
      </Button>
    </form>
  );
}
```

## With Zod Validation

```typescript
// app/actions/contact.ts
'use server';

import { z } from 'zod';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

export type ContactState = {
  success: boolean;
  message?: string;
  errors?: Record<string, string[]>;
};

export async function submitContact(
  prevState: ContactState | null,
  formData: FormData
): Promise<ContactState> {
  const parsed = contactSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    message: formData.get('message'),
  });

  if (!parsed.success) {
    return {
      success: false,
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    await resend.emails.send({
      from: 'noreply@example.com',
      to: 'support@example.com',
      subject: `Contact from ${parsed.data.name}`,
      text: parsed.data.message,
      replyTo: parsed.data.email,
    });

    return {
      success: true,
      message: 'Message sent successfully!',
    };
  } catch (error) {
    return {
      success: false,
      errors: { _form: ['Failed to send message. Please try again.'] },
    };
  }
}
```

## Calling Server Actions Programmatically

```typescript
// app/actions/cart.ts
'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/db';

export async function addToCart(productId: string, quantity: number = 1) {
  const cookieStore = await cookies();
  const cartId = cookieStore.get('cartId')?.value;
  
  if (!cartId) {
    // Create new cart
    const cart = await prisma.cart.create({
      data: {
        items: {
          create: { productId, quantity },
        },
      },
    });
    
    cookieStore.set('cartId', cart.id);
  } else {
    // Add to existing cart
    await prisma.cartItem.upsert({
      where: {
        cartId_productId: { cartId, productId },
      },
      create: { cartId, productId, quantity },
      update: { quantity: { increment: quantity } },
    });
  }
  
  revalidatePath('/cart');
}

// components/add-to-cart-button.tsx
'use client';

import { useTransition } from 'react';
import { addToCart } from '@/app/actions/cart';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { ShoppingCart, Loader2 } from 'lucide-react';

interface AddToCartButtonProps {
  productId: string;
  productName: string;
}

export function AddToCartButton({ productId, productName }: AddToCartButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    startTransition(async () => {
      await addToCart(productId);
      toast.success(`${productName} added to cart`);
    });
  };

  return (
    <Button onClick={handleClick} disabled={isPending}>
      {isPending ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <ShoppingCart className="mr-2 h-4 w-4" />
      )}
      Add to Cart
    </Button>
  );
}
```

## Error Handling

```typescript
// app/actions/posts.ts
'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function createPost(formData: FormData) {
  const session = await getSession();
  
  if (!session) {
    throw new Error('Unauthorized');
  }

  const title = formData.get('title') as string;
  const content = formData.get('content') as string;

  try {
    const post = await prisma.post.create({
      data: {
        title,
        content,
        authorId: session.user.id,
      },
    });

    revalidatePath('/posts');
    redirect(`/posts/${post.id}`);
  } catch (error) {
    // Return error to be handled by error.tsx or useActionState
    throw new Error('Failed to create post');
  }
}
```

## With File Uploads

```typescript
// app/actions/upload.ts
'use server';

import { writeFile } from 'fs/promises';
import { join } from 'path';
import { prisma } from '@/lib/db';

export async function uploadImage(formData: FormData) {
  const file = formData.get('file') as File;
  
  if (!file || file.size === 0) {
    return { error: 'No file uploaded' };
  }

  // Validate file type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    return { error: 'Invalid file type' };
  }

  // Validate file size (5MB max)
  if (file.size > 5 * 1024 * 1024) {
    return { error: 'File too large (max 5MB)' };
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Generate unique filename
  const uniqueName = `${Date.now()}-${file.name}`;
  const path = join(process.cwd(), 'public/uploads', uniqueName);
  
  await writeFile(path, buffer);

  // Save to database
  const image = await prisma.image.create({
    data: {
      filename: uniqueName,
      url: `/uploads/${uniqueName}`,
      size: file.size,
      mimeType: file.type,
    },
  });

  return { success: true, image };
}

// components/image-upload.tsx
'use client';

import { useState } from 'react';
import { uploadImage } from '@/app/actions/upload';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, Loader2 } from 'lucide-react';

export function ImageUpload() {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setUploading(true);

    const formData = new FormData(e.currentTarget);
    const result = await uploadImage(formData);

    if (result.error) {
      alert(result.error);
    } else if (result.image) {
      setPreview(result.image.url);
    }

    setUploading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        type="file"
        name="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            setPreview(URL.createObjectURL(file));
          }
        }}
      />
      
      {preview && (
        <img src={preview} alt="Preview" className="max-w-xs rounded" />
      )}
      
      <Button type="submit" disabled={uploading}>
        {uploading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Upload className="mr-2 h-4 w-4" />
        )}
        Upload
      </Button>
    </form>
  );
}
```

## Revalidation Strategies

```typescript
// app/actions/products.ts
'use server';

import { revalidatePath, revalidateTag } from 'next/cache';
import { prisma } from '@/lib/db';

export async function updateProduct(id: string, data: ProductData) {
  await prisma.product.update({
    where: { id },
    data,
  });

  // Option 1: Revalidate specific path
  revalidatePath(`/products/${id}`);

  // Option 2: Revalidate all products
  revalidatePath('/products');

  // Option 3: Revalidate by cache tag
  revalidateTag('products');
  revalidateTag(`product-${id}`);

  // Option 4: Revalidate layout + all pages using it
  revalidatePath('/products', 'layout');
}
```

## Protected Server Actions

```typescript
// lib/auth-action.ts
import { getSession } from '@/lib/auth';

export function authAction<T extends unknown[], R>(
  action: (session: Session, ...args: T) => Promise<R>
) {
  return async (...args: T): Promise<R> => {
    const session = await getSession();
    
    if (!session) {
      throw new Error('Unauthorized');
    }
    
    return action(session, ...args);
  };
}

// app/actions/posts.ts
'use server';

import { authAction } from '@/lib/auth-action';
import { prisma } from '@/lib/db';

export const deletePost = authAction(async (session, postId: string) => {
  const post = await prisma.post.findUnique({
    where: { id: postId },
  });

  if (post?.authorId !== session.user.id) {
    throw new Error('Forbidden');
  }

  await prisma.post.delete({ where: { id: postId } });
});
```

## Anti-patterns

### Don't Expose Sensitive Logic

```typescript
// BAD - Direct database access without validation
export async function deleteUser(userId: string) {
  await prisma.user.delete({ where: { id: userId } });  // Anyone can delete anyone!
}

// GOOD - Auth check + ownership validation
export async function deleteUser(userId: string) {
  const session = await getSession();
  if (!session || session.user.id !== userId) {
    throw new Error('Forbidden');
  }
  await prisma.user.delete({ where: { id: userId } });
}
```

### Don't Return Sensitive Data

```typescript
// BAD - Returns full user object with password hash
export async function getUser(id: string) {
  return prisma.user.findUnique({ where: { id } });
}

// GOOD - Select only needed fields
export async function getUser(id: string) {
  return prisma.user.findUnique({
    where: { id },
    select: { id: true, name: true, email: true },
  });
}
```

## Related Skills

- [server-components-data](./server-components-data.md)
- [optimistic-updates](./optimistic-updates.md)
- [mutations](./mutations.md)
- [form-validation](./form-validation.md)

---

## Changelog

### 2.0.0 (2025-01-18)
- Standardized to atomic design system v2
- Updated frontmatter schema

### 1.0.0 (2025-01-16)
- Initial implementation
- useActionState integration
- File upload patterns
- Protected actions
