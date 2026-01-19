---
id: pt-mutations
name: Data Mutations
version: 2.1.0
layer: L5
category: data
description: Patterns for mutating data with optimistic updates, rollback, and revalidation
tags: [data, mutations, server-actions, optimistic-ui, next15, react19]
composes:
  - ../atoms/input-button.md
  - ../atoms/input-checkbox.md
  - ../atoms/feedback-spinner.md
  - ../atoms/feedback-toast.md
  - ../molecules/list-item.md
  - ../organisms/dialog.md
dependencies: []
formula: "Mutation = useOptimistic + useTransition + Button(a-input-button) + Toast(a-feedback-toast) + Dialog(o-dialog)"
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# Data Mutations

## Overview

Data mutations in Next.js 15 combine Server Actions with React 19's hooks for seamless data updates. This pattern covers creating, updating, and deleting data with proper error handling, optimistic updates, and cache revalidation.

## When to Use

- Create, update, delete operations
- Form submissions
- Batch operations
- Operations requiring confirmation dialogs
- Actions with optimistic UI updates

## Composition Diagram

```
+------------------------------------------+
|              Mutation Flow               |
|  +------------------------------------+  |
|  |         User Action               |  |
|  +------------------------------------+  |
|           |                             |
|           v                             |
|  +------------------------------------+  |
|  |    useOptimistic (instant UI)     |  |
|  +------------------------------------+  |
|           |                             |
|           v                             |
|  +------------------------------------+  |
|  |    Server Action (async)          |  |
|  +------------------------------------+  |
|           |                             |
|     +-----+-----+                       |
|     |           |                       |
|     v           v                       |
|  Success      Error                     |
|  [Toast]    [Rollback]                  |
+------------------------------------------+
```

## Basic Mutation Pattern

```typescript
// app/actions/todos.ts
'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const todoSchema = z.object({
  title: z.string().min(1).max(200),
  completed: z.boolean().optional(),
});

export async function createTodo(formData: FormData) {
  const parsed = todoSchema.safeParse({
    title: formData.get('title'),
    completed: false,
  });

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  await prisma.todo.create({
    data: parsed.data,
  });

  revalidatePath('/todos');
  return { success: true };
}

export async function updateTodo(id: string, data: Partial<z.infer<typeof todoSchema>>) {
  const parsed = todoSchema.partial().safeParse(data);

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  await prisma.todo.update({
    where: { id },
    data: parsed.data,
  });

  revalidatePath('/todos');
  return { success: true };
}

export async function deleteTodo(id: string) {
  await prisma.todo.delete({
    where: { id },
  });

  revalidatePath('/todos');
  return { success: true };
}
```

## Mutation with Optimistic Updates

```typescript
// hooks/use-mutation.ts
'use client';

import { useOptimistic, useTransition } from 'react';
import { toast } from 'sonner';

type MutationState<T> = {
  data: T;
  isOptimistic: boolean;
};

export function useMutation<T, P>(
  currentData: T,
  serverAction: (payload: P) => Promise<{ success: boolean; error?: string }>,
  optimisticUpdate: (current: T, payload: P) => T
) {
  const [isPending, startTransition] = useTransition();
  const [optimisticData, setOptimisticData] = useOptimistic(
    { data: currentData, isOptimistic: false },
    (state, payload: P) => ({
      data: optimisticUpdate(state.data, payload),
      isOptimistic: true,
    })
  );

  const mutate = async (payload: P) => {
    startTransition(async () => {
      setOptimisticData(payload);
      
      const result = await serverAction(payload);
      
      if (!result.success) {
        toast.error(result.error || 'Operation failed');
        // Data will automatically revert when transition completes
      }
    });
  };

  return {
    data: optimisticData.data,
    isOptimistic: optimisticData.isOptimistic,
    isPending,
    mutate,
  };
}

// Usage: Todo list with optimistic delete
// components/todo-list.tsx
'use client';

import { useMutation } from '@/hooks/use-mutation';
import { deleteTodo, updateTodo } from '@/app/actions/todos';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Trash2, Loader2 } from 'lucide-react';

interface Todo {
  id: string;
  title: string;
  completed: boolean;
}

interface TodoListProps {
  initialTodos: Todo[];
}

export function TodoList({ initialTodos }: TodoListProps) {
  const { data: todos, mutate, isPending } = useMutation(
    initialTodos,
    async ({ action, id, data }: { action: 'delete' | 'update'; id: string; data?: Partial<Todo> }) => {
      if (action === 'delete') {
        return deleteTodo(id);
      }
      return updateTodo(id, data!);
    },
    (current, { action, id, data }) => {
      if (action === 'delete') {
        return current.filter((todo) => todo.id !== id);
      }
      return current.map((todo) =>
        todo.id === id ? { ...todo, ...data } : todo
      );
    }
  );

  return (
    <ul className="space-y-2">
      {todos.map((todo) => (
        <li key={todo.id} className="flex items-center gap-3 p-3 border rounded-lg">
          <Checkbox
            checked={todo.completed}
            onCheckedChange={(checked) =>
              mutate({
                action: 'update',
                id: todo.id,
                data: { completed: !!checked },
              })
            }
          />
          <span className={todo.completed ? 'line-through text-muted-foreground' : ''}>
            {todo.title}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto"
            onClick={() => mutate({ action: 'delete', id: todo.id })}
            disabled={isPending}
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
          </Button>
        </li>
      ))}
    </ul>
  );
}
```

## Batch Mutations

```typescript
// app/actions/batch.ts
'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db';

export async function batchDeleteTodos(ids: string[]) {
  try {
    await prisma.todo.deleteMany({
      where: { id: { in: ids } },
    });

    revalidatePath('/todos');
    return { success: true, deletedCount: ids.length };
  } catch (error) {
    return { success: false, error: 'Failed to delete items' };
  }
}

export async function batchUpdateTodos(
  ids: string[],
  data: { completed?: boolean }
) {
  try {
    await prisma.todo.updateMany({
      where: { id: { in: ids } },
      data,
    });

    revalidatePath('/todos');
    return { success: true, updatedCount: ids.length };
  } catch (error) {
    return { success: false, error: 'Failed to update items' };
  }
}

// components/batch-actions.tsx
'use client';

import { useTransition } from 'react';
import { batchDeleteTodos, batchUpdateTodos } from '@/app/actions/batch';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface BatchActionsProps {
  selectedIds: string[];
  onComplete: () => void;
}

export function BatchActions({ selectedIds, onComplete }: BatchActionsProps) {
  const [isPending, startTransition] = useTransition();

  const handleBatchDelete = () => {
    startTransition(async () => {
      const result = await batchDeleteTodos(selectedIds);
      if (result.success) {
        toast.success(`Deleted ${result.deletedCount} items`);
        onComplete();
      } else {
        toast.error(result.error);
      }
    });
  };

  const handleMarkComplete = () => {
    startTransition(async () => {
      const result = await batchUpdateTodos(selectedIds, { completed: true });
      if (result.success) {
        toast.success(`Updated ${result.updatedCount} items`);
        onComplete();
      } else {
        toast.error(result.error);
      }
    });
  };

  if (selectedIds.length === 0) return null;

  return (
    <div className="flex items-center gap-2 p-2 bg-muted rounded-lg">
      <span className="text-sm">{selectedIds.length} selected</span>
      <Button
        variant="outline"
        size="sm"
        onClick={handleMarkComplete}
        disabled={isPending}
      >
        Mark Complete
      </Button>
      <Button
        variant="destructive"
        size="sm"
        onClick={handleBatchDelete}
        disabled={isPending}
      >
        Delete
      </Button>
    </div>
  );
}
```

## Mutation with Confirmation

```typescript
// hooks/use-confirm-mutation.ts
'use client';

import { useState, useTransition } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface ConfirmOptions {
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'default' | 'destructive';
}

export function useConfirmMutation<T>(
  action: (payload: T) => Promise<void>,
  options: ConfirmOptions
) {
  const [isPending, startTransition] = useTransition();
  const [pendingPayload, setPendingPayload] = useState<T | null>(null);

  const trigger = (payload: T) => {
    setPendingPayload(payload);
  };

  const confirm = () => {
    if (pendingPayload === null) return;
    
    startTransition(async () => {
      await action(pendingPayload);
      setPendingPayload(null);
    });
  };

  const cancel = () => {
    setPendingPayload(null);
  };

  const ConfirmDialog = () => (
    <AlertDialog open={pendingPayload !== null} onOpenChange={cancel}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{options.title}</AlertDialogTitle>
          <AlertDialogDescription>{options.description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>
            {options.cancelLabel || 'Cancel'}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={confirm}
            disabled={isPending}
            className={
              options.variant === 'destructive'
                ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
                : ''
            }
          >
            {isPending ? 'Processing...' : options.confirmLabel || 'Confirm'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );

  return { trigger, ConfirmDialog, isPending };
}

// Usage
// components/delete-button.tsx
'use client';

import { useConfirmMutation } from '@/hooks/use-confirm-mutation';
import { deleteProject } from '@/app/actions/projects';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';

export function DeleteProjectButton({ projectId }: { projectId: string }) {
  const { trigger, ConfirmDialog, isPending } = useConfirmMutation(
    async (id: string) => {
      await deleteProject(id);
    },
    {
      title: 'Delete Project',
      description: 'Are you sure? This action cannot be undone.',
      confirmLabel: 'Delete',
      variant: 'destructive',
    }
  );

  return (
    <>
      <Button
        variant="destructive"
        size="sm"
        onClick={() => trigger(projectId)}
        disabled={isPending}
      >
        <Trash2 className="h-4 w-4 mr-2" />
        Delete
      </Button>
      <ConfirmDialog />
    </>
  );
}
```

## Mutation Queue

```typescript
// lib/mutation-queue.ts
'use client';

import { useState, useCallback, useRef } from 'react';

type QueuedMutation<T> = {
  id: string;
  payload: T;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error?: string;
};

export function useMutationQueue<T>(
  action: (payload: T) => Promise<{ success: boolean; error?: string }>,
  options: { maxConcurrent?: number } = {}
) {
  const { maxConcurrent = 3 } = options;
  const [queue, setQueue] = useState<QueuedMutation<T>[]>([]);
  const processing = useRef(0);

  const processQueue = useCallback(async () => {
    if (processing.current >= maxConcurrent) return;

    const pendingIndex = queue.findIndex((m) => m.status === 'pending');
    if (pendingIndex === -1) return;

    processing.current++;
    
    setQueue((prev) =>
      prev.map((m, i) =>
        i === pendingIndex ? { ...m, status: 'processing' } : m
      )
    );

    const mutation = queue[pendingIndex];
    const result = await action(mutation.payload);

    setQueue((prev) =>
      prev.map((m) =>
        m.id === mutation.id
          ? {
              ...m,
              status: result.success ? 'completed' : 'failed',
              error: result.error,
            }
          : m
      )
    );

    processing.current--;
    processQueue(); // Process next item
  }, [queue, action, maxConcurrent]);

  const enqueue = useCallback((payload: T) => {
    const mutation: QueuedMutation<T> = {
      id: crypto.randomUUID(),
      payload,
      status: 'pending',
    };

    setQueue((prev) => [...prev, mutation]);
    setTimeout(processQueue, 0);
  }, [processQueue]);

  const clearCompleted = useCallback(() => {
    setQueue((prev) => prev.filter((m) => m.status !== 'completed'));
  }, []);

  return {
    queue,
    enqueue,
    clearCompleted,
    pendingCount: queue.filter((m) => m.status === 'pending').length,
    processingCount: queue.filter((m) => m.status === 'processing').length,
  };
}
```

## Anti-patterns

### Don't Mutate Without Validation

```typescript
// BAD - No input validation
export async function updateProfile(data: any) {
  await prisma.user.update({
    where: { id: data.id },
    data: data,
  });
}

// GOOD - Validate all inputs
export async function updateProfile(formData: FormData) {
  const parsed = profileSchema.safeParse({
    name: formData.get('name'),
    bio: formData.get('bio'),
  });
  
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }
  
  // ... continue with validated data
}
```

### Don't Forget Revalidation

```typescript
// BAD - Data is stale after mutation
export async function createComment(data: CommentData) {
  await prisma.comment.create({ data });
  // Missing revalidation!
}

// GOOD - Revalidate affected paths
export async function createComment(data: CommentData) {
  await prisma.comment.create({ data });
  revalidatePath(`/posts/${data.postId}`);
  revalidateTag('comments');
}
```

## Related Skills

- [server-actions](./server-actions.md)
- [optimistic-updates](./optimistic-updates.md)
- [revalidation](./revalidation.md)
- [form-validation](./form-validation.md)

---

## Changelog

### 2.0.0 (2025-01-18)
- Standardized to atomic design system v2
- Updated frontmatter schema

### 1.0.0 (2025-01-16)
- Initial implementation
- Optimistic mutation hook
- Batch mutations
- Confirmation dialogs
- Mutation queue
