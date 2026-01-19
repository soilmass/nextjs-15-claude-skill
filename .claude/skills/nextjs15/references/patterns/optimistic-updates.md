---
id: pt-optimistic-updates
name: Optimistic Updates
version: 2.1.0
layer: L5
category: data
description: Update UI immediately before server confirmation using useOptimistic hook
tags: [data, optimistic, mutations, useOptimistic, react19, next15]
composes:
  - ../atoms/input-button.md
  - ../atoms/input-checkbox.md
  - ../atoms/display-icon.md
  - ../molecules/list-item.md
  - ../molecules/avatar-group.md
dependencies: []
formula: "OptimisticUpdate = useOptimistic + useTransition + ListItem(m-list-item) + Icon(a-display-icon)"
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# Optimistic Updates

## Overview

Optimistic updates allow you to update the UI immediately when a user performs an action, without waiting for the server response. React 19 introduces the `useOptimistic` hook to make this pattern simple and revertible on error.

## When to Use

- Like/favorite buttons
- Todo list toggle/delete
- Comment submissions
- Cart quantity updates
- Any action where instant feedback improves UX

## Composition Diagram

```
+------------------------------------------+
|           Optimistic Update              |
|  +------------------------------------+  |
|  |  User clicks "Like"               |  |
|  +------------------------------------+  |
|           |                             |
|           v                             |
|  +------------------------------------+  |
|  |  useOptimistic -> UI updates      |  |
|  |  instantly (heart fills red)      |  |
|  +------------------------------------+  |
|           |                             |
|           v                             |
|  +------------------------------------+  |
|  |  Server Action runs async         |  |
|  +------------------------------------+  |
|           |                             |
|     +-----+-----+                       |
|     |           |                       |
|  Success     Error                      |
|  (keep)    (auto-revert)                |
+------------------------------------------+
```

## Basic useOptimistic

```typescript
// components/like-button.tsx
'use client';

import { useOptimistic, useTransition } from 'react';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toggleLike } from '@/app/actions/likes';
import { cn } from '@/lib/utils';

interface LikeButtonProps {
  postId: string;
  initialLiked: boolean;
  initialCount: number;
}

export function LikeButton({ postId, initialLiked, initialCount }: LikeButtonProps) {
  const [isPending, startTransition] = useTransition();
  
  const [optimisticState, addOptimistic] = useOptimistic(
    { liked: initialLiked, count: initialCount },
    (state, _) => ({
      liked: !state.liked,
      count: state.liked ? state.count - 1 : state.count + 1,
    })
  );

  const handleClick = () => {
    startTransition(async () => {
      addOptimistic(null);  // Immediately update UI
      await toggleLike(postId);  // Then sync with server
    });
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleClick}
      disabled={isPending}
      className="gap-2"
    >
      <Heart
        className={cn(
          'h-4 w-4 transition-colors',
          optimisticState.liked && 'fill-red-500 text-red-500'
        )}
      />
      <span>{optimisticState.count}</span>
    </Button>
  );
}
```

## Optimistic List Updates

```typescript
// components/todo-list.tsx
'use client';

import { useOptimistic, useTransition } from 'react';
import { addTodo, deleteTodo, toggleTodo } from '@/app/actions/todos';
import { Todo } from '@/types';

interface TodoListProps {
  initialTodos: Todo[];
}

type OptimisticAction =
  | { type: 'add'; todo: Todo }
  | { type: 'delete'; id: string }
  | { type: 'toggle'; id: string };

export function TodoList({ initialTodos }: TodoListProps) {
  const [isPending, startTransition] = useTransition();
  
  const [optimisticTodos, updateTodos] = useOptimistic(
    initialTodos,
    (state: Todo[], action: OptimisticAction) => {
      switch (action.type) {
        case 'add':
          return [...state, action.todo];
        case 'delete':
          return state.filter(t => t.id !== action.id);
        case 'toggle':
          return state.map(t =>
            t.id === action.id ? { ...t, completed: !t.completed } : t
          );
        default:
          return state;
      }
    }
  );

  const handleAdd = (formData: FormData) => {
    const title = formData.get('title') as string;
    const optimisticTodo: Todo = {
      id: `temp-${Date.now()}`,
      title,
      completed: false,
    };

    startTransition(async () => {
      updateTodos({ type: 'add', todo: optimisticTodo });
      await addTodo(formData);
    });
  };

  const handleDelete = (id: string) => {
    startTransition(async () => {
      updateTodos({ type: 'delete', id });
      await deleteTodo(id);
    });
  };

  const handleToggle = (id: string) => {
    startTransition(async () => {
      updateTodos({ type: 'toggle', id });
      await toggleTodo(id);
    });
  };

  return (
    <div>
      <form action={handleAdd} className="flex gap-2 mb-4">
        <input name="title" placeholder="Add todo..." className="flex-1" />
        <button type="submit">Add</button>
      </form>
      
      <ul className="space-y-2">
        {optimisticTodos.map((todo) => (
          <li
            key={todo.id}
            className={cn(
              'flex items-center gap-2 p-2 rounded border',
              todo.id.startsWith('temp-') && 'opacity-70'
            )}
          >
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => handleToggle(todo.id)}
            />
            <span className={cn(todo.completed && 'line-through')}>
              {todo.title}
            </span>
            <button
              onClick={() => handleDelete(todo.id)}
              className="ml-auto text-red-500"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

## With Error Recovery

```typescript
// hooks/use-optimistic-action.ts
'use client';

import { useOptimistic, useTransition, useState, useCallback } from 'react';
import { toast } from 'sonner';

export function useOptimisticAction<TState, TPayload>(
  currentState: TState,
  updateFn: (state: TState, payload: TPayload) => TState,
  serverAction: (payload: TPayload) => Promise<void>
) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<Error | null>(null);
  const [optimisticState, addOptimistic] = useOptimistic(currentState, updateFn);

  const execute = useCallback(
    (payload: TPayload) => {
      setError(null);
      
      startTransition(async () => {
        addOptimistic(payload);
        
        try {
          await serverAction(payload);
        } catch (e) {
          const error = e instanceof Error ? e : new Error('Action failed');
          setError(error);
          toast.error(error.message);
          // Note: useOptimistic automatically reverts on error
        }
      });
    },
    [serverAction, addOptimistic]
  );

  return {
    state: optimisticState,
    execute,
    isPending,
    error,
  };
}

// Usage
import { useOptimisticAction } from '@/hooks/use-optimistic-action';
import { updateProfile } from '@/app/actions/profile';

function ProfileForm({ profile }) {
  const { state, execute, isPending, error } = useOptimisticAction(
    profile,
    (state, updates) => ({ ...state, ...updates }),
    async (updates) => {
      await updateProfile(updates);
    }
  );

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      execute({ name: e.target.name.value });
    }}>
      <input name="name" defaultValue={state.name} />
      <button type="submit" disabled={isPending}>
        {isPending ? 'Saving...' : 'Save'}
      </button>
    </form>
  );
}
```

## Optimistic Comments

```typescript
// components/comments.tsx
'use client';

import { useOptimistic, useTransition } from 'react';
import { addComment, deleteComment } from '@/app/actions/comments';
import { Comment, User } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';

interface CommentsProps {
  postId: string;
  initialComments: Comment[];
  currentUser: User;
}

type CommentAction =
  | { type: 'add'; comment: Comment }
  | { type: 'delete'; id: string };

export function Comments({ postId, initialComments, currentUser }: CommentsProps) {
  const [isPending, startTransition] = useTransition();
  
  const [comments, updateComments] = useOptimistic(
    initialComments,
    (state: Comment[], action: CommentAction) => {
      if (action.type === 'add') {
        return [action.comment, ...state];
      }
      if (action.type === 'delete') {
        return state.filter(c => c.id !== action.id);
      }
      return state;
    }
  );

  const handleSubmit = async (formData: FormData) => {
    const content = formData.get('content') as string;
    
    if (!content.trim()) return;

    const optimisticComment: Comment = {
      id: `temp-${Date.now()}`,
      content,
      createdAt: new Date().toISOString(),
      author: currentUser,
      postId,
      isOptimistic: true,
    };

    startTransition(async () => {
      updateComments({ type: 'add', comment: optimisticComment });
      await addComment(postId, formData);
    });
  };

  const handleDelete = (commentId: string) => {
    startTransition(async () => {
      updateComments({ type: 'delete', id: commentId });
      await deleteComment(commentId);
    });
  };

  return (
    <div className="space-y-4">
      {/* Add comment form */}
      <form action={handleSubmit} className="flex gap-3">
        <Avatar className="h-8 w-8">
          <AvatarImage src={currentUser.avatar} />
          <AvatarFallback>{currentUser.name[0]}</AvatarFallback>
        </Avatar>
        <div className="flex-1 flex gap-2">
          <input
            name="content"
            placeholder="Add a comment..."
            className="flex-1 px-3 py-2 border rounded-md"
          />
          <button
            type="submit"
            disabled={isPending}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
          >
            Post
          </button>
        </div>
      </form>

      {/* Comments list */}
      <div className="space-y-4">
        {comments.map((comment) => (
          <div
            key={comment.id}
            className={cn(
              'flex gap-3',
              comment.isOptimistic && 'opacity-70'
            )}
          >
            <Avatar className="h-8 w-8">
              <AvatarImage src={comment.author.avatar} />
              <AvatarFallback>{comment.author.name[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium">{comment.author.name}</span>
                <span className="text-sm text-muted-foreground">
                  {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                </span>
                {comment.isOptimistic && (
                  <span className="text-xs text-muted-foreground">Posting...</span>
                )}
              </div>
              <p className="mt-1">{comment.content}</p>
            </div>
            {comment.author.id === currentUser.id && !comment.isOptimistic && (
              <button
                onClick={() => handleDelete(comment.id)}
                className="text-muted-foreground hover:text-destructive"
              >
                Delete
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
```

## Optimistic Cart Updates

```typescript
// components/cart.tsx
'use client';

import { useOptimistic, useTransition } from 'react';
import { updateQuantity, removeItem } from '@/app/actions/cart';
import { CartItem } from '@/types';
import { Minus, Plus, Trash2 } from 'lucide-react';

interface CartProps {
  initialItems: CartItem[];
}

type CartAction =
  | { type: 'increment'; id: string }
  | { type: 'decrement'; id: string }
  | { type: 'remove'; id: string };

export function Cart({ initialItems }: CartProps) {
  const [isPending, startTransition] = useTransition();
  
  const [items, updateItems] = useOptimistic(
    initialItems,
    (state: CartItem[], action: CartAction) => {
      switch (action.type) {
        case 'increment':
          return state.map(item =>
            item.id === action.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          );
        case 'decrement':
          return state.map(item =>
            item.id === action.id
              ? { ...item, quantity: Math.max(1, item.quantity - 1) }
              : item
          );
        case 'remove':
          return state.filter(item => item.id !== action.id);
        default:
          return state;
      }
    }
  );

  const handleIncrement = (id: string, currentQty: number) => {
    startTransition(async () => {
      updateItems({ type: 'increment', id });
      await updateQuantity(id, currentQty + 1);
    });
  };

  const handleDecrement = (id: string, currentQty: number) => {
    if (currentQty <= 1) return;
    startTransition(async () => {
      updateItems({ type: 'decrement', id });
      await updateQuantity(id, currentQty - 1);
    });
  };

  const handleRemove = (id: string) => {
    startTransition(async () => {
      updateItems({ type: 'remove', id });
      await removeItem(id);
    });
  };

  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <div key={item.id} className="flex items-center gap-4 p-4 border rounded">
          <img
            src={item.image}
            alt={item.name}
            className="w-16 h-16 object-cover rounded"
          />
          <div className="flex-1">
            <h3 className="font-medium">{item.name}</h3>
            <p className="text-muted-foreground">${item.price}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleDecrement(item.id, item.quantity)}
              disabled={item.quantity <= 1}
              className="p-1 rounded border"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="w-8 text-center">{item.quantity}</span>
            <button
              onClick={() => handleIncrement(item.id, item.quantity)}
              className="p-1 rounded border"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
          <button
            onClick={() => handleRemove(item.id)}
            className="p-2 text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ))}
      
      <div className="text-right text-xl font-bold">
        Total: ${total.toFixed(2)}
      </div>
    </div>
  );
}
```

## Anti-patterns

### Don't Forget Loading States

```typescript
// BAD - No indication of pending state
function LikeButton({ liked }) {
  const [optimistic, update] = useOptimistic(liked);
  // User can't tell if action is pending
}

// GOOD - Show pending state
function LikeButton({ liked }) {
  const [isPending, startTransition] = useTransition();
  const [optimistic, update] = useOptimistic(liked);
  
  return (
    <button disabled={isPending} className={isPending ? 'opacity-50' : ''}>
      {/* ... */}
    </button>
  );
}
```

### Don't Overuse for Critical Actions

```typescript
// BAD - Optimistic update for payment
const handlePayment = () => {
  updateOptimistic({ status: 'paid' });  // Dangerous!
  await processPayment();
};

// GOOD - Wait for confirmation on critical actions
const handlePayment = () => {
  setLoading(true);
  const result = await processPayment();
  if (result.success) {
    // Update UI after confirmation
  }
};
```

## Related Skills

- [server-actions](./server-actions.md)
- [mutations](./mutations.md)
- [react-query](./react-query.md)

---

## Changelog

### 2.0.0 (2025-01-17)
- Standardized to atomic design system v2
- Updated frontmatter schema

### 1.0.0 (2025-01-16)
- Initial implementation
- useOptimistic patterns
- Error recovery
- List and cart examples
