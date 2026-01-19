---
id: pt-autosave
name: Autosave Patterns
version: 2.0.0
layer: L5
category: forms
description: Automatic form saving with debouncing, optimistic updates, and conflict resolution
tags: [forms, autosave, debounce, optimistic-updates, drafts]
composes:
  - ../molecules/form-field.md
  - ../atoms/input-text.md
  - ../atoms/input-textarea.md
  - ../atoms/feedback-spinner.md
  - ../atoms/display-icon.md
dependencies:
  react-hook-form: "^7.54.0"
formula: "Autosave = useAutosave hook + debounce(use-debounce) + AutosaveIndicator + FormField(m-form-field) + Server Actions"
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# Autosave Patterns

## Overview

Autosave automatically persists form changes without manual save actions, improving UX by preventing data loss. This pattern covers debounced saving, draft management, and conflict resolution.

## When to Use

- Document editors (blog posts, notes, articles) where users expect automatic saving
- Long forms where losing data would be frustrating (applications, surveys)
- Collaborative editing where changes need to sync to the server
- Settings pages where users make frequent small changes
- Draft management systems with recovery after browser crashes

## Composition Diagram

```
+------------------------------------------------------------------+
|                        Autosave Pattern                           |
+------------------------------------------------------------------+
|                                                                  |
|  +-------------------------------------------------------------+ |
|  |                    AutosaveForm                              | |
|  |  +------------------------+  +---------------------------+  | |
|  |  |    Form Title/Header   |  | AutosaveIndicator         |  | |
|  |  +------------------------+  | +---------------------+   |  | |
|  |                              | | Spinner | Icon | Text|   |  | |
|  |                              | | (a-feed | (a-  | Last|   |  | |
|  |                              | | -spinner| disp | save|   |  | |
|  |                              | |         | -icon| time|   |  | |
|  |                              | +---------------------+   |  | |
|  |                              +---------------------------+  | |
|  +-------------------------------------------------------------+ |
|                                |                                 |
|                                v                                 |
|  +-------------------------------------------------------------+ |
|  |              FormField (m-form-field)                        | |
|  |  +----------+  +----------------------------+               | |
|  |  | Label    |  | Input/Textarea             |               | |
|  |  +----------+  | (a-input-text/textarea)    |               | |
|  |                +----------------------------+               | |
|  +-------------------------------------------------------------+ |
|                                |                                 |
|              useWatch monitors all field changes                 |
|                                |                                 |
|                                v                                 |
|  +-------------------------------------------------------------+ |
|  |              useAutosave Hook                                | |
|  |  +------------------+  +---------------+  +--------------+  | |
|  |  | Data change      |->| Debounce     |->| Server save  |  | |
|  |  | detection        |  | (1-2 seconds)|  | (Server Act) |  | |
|  |  +------------------+  +---------------+  +--------------+  | |
|  +-------------------------------------------------------------+ |
|                                |                                 |
|                                v                                 |
|  +-------------------------------------------------------------+ |
|  |              Status States                                   | |
|  |  idle -> saving -> saved -> idle (or error)                  | |
|  +-------------------------------------------------------------+ |
|                                                                  |
+------------------------------------------------------------------+
```

## Implementation

### Basic Autosave Hook

```typescript
// hooks/use-autosave.ts
"use client";

import { useEffect, useCallback, useRef, useState } from "react";
import { useDebouncedCallback } from "use-debounce";

interface UseAutosaveOptions<T> {
  data: T;
  onSave: (data: T) => Promise<void>;
  interval?: number;
  enabled?: boolean;
}

interface UseAutosaveResult {
  status: "idle" | "saving" | "saved" | "error";
  lastSaved: Date | null;
  error: Error | null;
  save: () => Promise<void>;
}

export function useAutosave<T>({
  data,
  onSave,
  interval = 2000,
  enabled = true,
}: UseAutosaveOptions<T>): UseAutosaveResult {
  const [status, setStatus] = useState<UseAutosaveResult["status"]>("idle");
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const previousData = useRef<T>(data);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const performSave = useCallback(async () => {
    if (!enabled) return;

    setStatus("saving");
    setError(null);

    try {
      await onSave(data);
      if (isMounted.current) {
        setStatus("saved");
        setLastSaved(new Date());
        previousData.current = data;

        // Reset to idle after showing saved status
        setTimeout(() => {
          if (isMounted.current) {
            setStatus("idle");
          }
        }, 2000);
      }
    } catch (err) {
      if (isMounted.current) {
        const error = err instanceof Error ? err : new Error("Save failed");
        setError(error);
        setStatus("error");
      }
    }
  }, [data, onSave, enabled]);

  const debouncedSave = useDebouncedCallback(performSave, interval);

  // Trigger save when data changes
  useEffect(() => {
    if (!enabled) return;

    // Check if data has actually changed
    const hasChanged =
      JSON.stringify(data) !== JSON.stringify(previousData.current);

    if (hasChanged) {
      debouncedSave();
    }
  }, [data, debouncedSave, enabled]);

  // Save on unmount if there are pending changes
  useEffect(() => {
    return () => {
      const hasUnsavedChanges =
        JSON.stringify(data) !== JSON.stringify(previousData.current);
      if (hasUnsavedChanges && enabled) {
        // Flush debounced save
        debouncedSave.flush();
      }
    };
  }, [data, debouncedSave, enabled]);

  const save = useCallback(async () => {
    debouncedSave.cancel();
    await performSave();
  }, [debouncedSave, performSave]);

  return {
    status,
    lastSaved,
    error,
    save,
  };
}
```

### Autosave Status Indicator

```typescript
// components/autosave-indicator.tsx
"use client";

import { Check, Cloud, CloudOff, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface AutosaveIndicatorProps {
  status: "idle" | "saving" | "saved" | "error";
  lastSaved?: Date | null;
  error?: Error | null;
  className?: string;
}

export function AutosaveIndicator({
  status,
  lastSaved,
  error,
  className,
}: AutosaveIndicatorProps) {
  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "numeric",
    }).format(date);
  };

  return (
    <div
      className={cn(
        "flex items-center gap-2 text-sm transition-opacity",
        status === "idle" && "opacity-50",
        className
      )}
    >
      {status === "saving" && (
        <>
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          <span className="text-muted-foreground">Saving...</span>
        </>
      )}

      {status === "saved" && (
        <>
          <Check className="h-4 w-4 text-green-500" />
          <span className="text-green-600">Saved</span>
        </>
      )}

      {status === "idle" && lastSaved && (
        <>
          <Cloud className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">
            Last saved at {formatTime(lastSaved)}
          </span>
        </>
      )}

      {status === "error" && (
        <>
          <CloudOff className="h-4 w-4 text-destructive" />
          <span className="text-destructive">
            {error?.message || "Failed to save"}
          </span>
        </>
      )}
    </div>
  );
}
```

### Form with Autosave

```typescript
// components/autosave-form.tsx
"use client";

import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAutosave } from "@/hooks/use-autosave";
import { AutosaveIndicator } from "./autosave-indicator";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/ui/form-field";
import { updateDocument } from "@/app/actions/documents";

const documentSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string(),
  tags: z.string(),
});

type DocumentForm = z.infer<typeof documentSchema>;

interface AutosaveFormProps {
  documentId: string;
  initialData: DocumentForm;
}

export function AutosaveForm({ documentId, initialData }: AutosaveFormProps) {
  const {
    register,
    control,
    formState: { errors },
  } = useForm<DocumentForm>({
    resolver: zodResolver(documentSchema),
    defaultValues: initialData,
    mode: "onChange",
  });

  // Watch all form values for autosave
  const formValues = useWatch({ control });

  const { status, lastSaved, error } = useAutosave({
    data: formValues as DocumentForm,
    onSave: async (data) => {
      const result = await updateDocument(documentId, data);
      if (!result.success) {
        throw new Error(result.error);
      }
    },
    interval: 1500,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Edit Document</h1>
        <AutosaveIndicator
          status={status}
          lastSaved={lastSaved}
          error={error}
        />
      </div>

      <form className="space-y-4">
        <FormField label="Title" error={errors.title?.message} required>
          <Input {...register("title")} placeholder="Document title" />
        </FormField>

        <FormField label="Content" error={errors.content?.message}>
          <Textarea
            {...register("content")}
            placeholder="Write your content..."
            rows={10}
          />
        </FormField>

        <FormField label="Tags" error={errors.tags?.message}>
          <Input {...register("tags")} placeholder="Comma-separated tags" />
        </FormField>
      </form>
    </div>
  );
}
```

### Local Draft Storage

```typescript
// hooks/use-draft.ts
"use client";

import { useEffect, useState, useCallback } from "react";
import { useDebouncedCallback } from "use-debounce";

interface UseDraftOptions<T> {
  key: string;
  initialData: T;
  debounceMs?: number;
}

interface UseDraftResult<T> {
  data: T;
  setData: (data: T | ((prev: T) => T)) => void;
  hasDraft: boolean;
  clearDraft: () => void;
  restoreDraft: () => void;
}

export function useDraft<T>({
  key,
  initialData,
  debounceMs = 1000,
}: UseDraftOptions<T>): UseDraftResult<T> {
  const storageKey = `draft:${key}`;
  
  const [data, setDataState] = useState<T>(initialData);
  const [hasDraft, setHasDraft] = useState(false);

  // Check for existing draft on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        const draftTime = parsed._draftTime;
        
        // Draft is valid for 24 hours
        if (draftTime && Date.now() - draftTime < 24 * 60 * 60 * 1000) {
          setHasDraft(true);
        } else {
          localStorage.removeItem(storageKey);
        }
      }
    } catch {
      localStorage.removeItem(storageKey);
    }
  }, [storageKey]);

  // Save to localStorage with debounce
  const saveDraft = useDebouncedCallback((newData: T) => {
    try {
      localStorage.setItem(
        storageKey,
        JSON.stringify({ ...newData, _draftTime: Date.now() })
      );
      setHasDraft(true);
    } catch {
      // Storage full or other error
      console.warn("Failed to save draft");
    }
  }, debounceMs);

  const setData = useCallback(
    (newData: T | ((prev: T) => T)) => {
      setDataState((prev) => {
        const resolved = typeof newData === "function"
          ? (newData as (prev: T) => T)(prev)
          : newData;
        saveDraft(resolved);
        return resolved;
      });
    },
    [saveDraft]
  );

  const clearDraft = useCallback(() => {
    localStorage.removeItem(storageKey);
    setHasDraft(false);
  }, [storageKey]);

  const restoreDraft = useCallback(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        delete parsed._draftTime;
        setDataState(parsed);
      }
    } catch {
      console.warn("Failed to restore draft");
    }
  }, [storageKey]);

  return {
    data,
    setData,
    hasDraft,
    clearDraft,
    restoreDraft,
  };
}
```

### Draft Recovery Dialog

```typescript
// components/draft-recovery.tsx
"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface DraftRecoveryProps {
  hasDraft: boolean;
  onRestore: () => void;
  onDiscard: () => void;
}

export function DraftRecovery({
  hasDraft,
  onRestore,
  onDiscard,
}: DraftRecoveryProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (hasDraft) {
      setOpen(true);
    }
  }, [hasDraft]);

  const handleRestore = () => {
    onRestore();
    setOpen(false);
  };

  const handleDiscard = () => {
    onDiscard();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Restore Draft?</DialogTitle>
          <DialogDescription>
            We found an unsaved draft from your previous session. Would you like
            to restore it?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={handleDiscard}>
            Discard
          </Button>
          <Button onClick={handleRestore}>Restore Draft</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Usage
function EditorPage() {
  const { data, setData, hasDraft, clearDraft, restoreDraft } = useDraft({
    key: "post-editor",
    initialData: { title: "", content: "" },
  });

  return (
    <>
      <DraftRecovery
        hasDraft={hasDraft}
        onRestore={restoreDraft}
        onDiscard={clearDraft}
      />
      <Editor data={data} onChange={setData} />
    </>
  );
}
```

### Server Action with Optimistic Autosave

```typescript
// app/actions/documents.ts
"use server";

import { z } from "zod";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

const updateSchema = z.object({
  title: z.string().min(1),
  content: z.string(),
  tags: z.string(),
});

export async function updateDocument(id: string, data: unknown) {
  const parsed = updateSchema.safeParse(data);

  if (!parsed.success) {
    return {
      success: false,
      error: "Validation failed",
    };
  }

  try {
    const document = await prisma.document.update({
      where: { id },
      data: {
        ...parsed.data,
        updatedAt: new Date(),
      },
    });

    // Don't revalidate on every autosave to avoid layout flashing
    // revalidatePath(`/documents/${id}`);

    return {
      success: true,
      data: document,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Update failed",
    };
  }
}
```

### Conflict Resolution

```typescript
// hooks/use-autosave-with-conflict.ts
"use client";

import { useState, useCallback } from "react";
import { useAutosave } from "./use-autosave";

interface ConflictData<T> {
  local: T;
  remote: T;
  serverVersion: number;
}

interface UseAutosaveWithConflictOptions<T> {
  data: T;
  version: number;
  onSave: (data: T, version: number) => Promise<{ version: number }>;
  onConflict?: (conflict: ConflictData<T>) => Promise<"local" | "remote" | "merge">;
  interval?: number;
}

export function useAutosaveWithConflict<T>({
  data,
  version,
  onSave,
  onConflict,
  interval = 2000,
}: UseAutosaveWithConflictOptions<T>) {
  const [conflict, setConflict] = useState<ConflictData<T> | null>(null);
  const [localVersion, setLocalVersion] = useState(version);

  const handleSave = useCallback(
    async (saveData: T) => {
      try {
        const result = await onSave(saveData, localVersion);
        setLocalVersion(result.version);
      } catch (error: unknown) {
        // Check if it's a conflict error
        if (
          error instanceof Error &&
          error.message.includes("VERSION_CONFLICT")
        ) {
          const remoteData = (error as unknown as { remoteData: T }).remoteData;
          const conflict: ConflictData<T> = {
            local: saveData,
            remote: remoteData,
            serverVersion: (error as unknown as { serverVersion: number }).serverVersion,
          };

          setConflict(conflict);

          if (onConflict) {
            const resolution = await onConflict(conflict);
            // Handle resolution...
          }
        }
        throw error;
      }
    },
    [localVersion, onSave, onConflict]
  );

  const autosave = useAutosave({
    data,
    onSave: handleSave,
    interval,
  });

  const resolveConflict = useCallback(
    (resolution: "local" | "remote", mergedData?: T) => {
      if (!conflict) return;

      if (resolution === "local" || mergedData) {
        // Re-save with updated version
        handleSave(mergedData ?? conflict.local);
      }

      setConflict(null);
    },
    [conflict, handleSave]
  );

  return {
    ...autosave,
    conflict,
    resolveConflict,
  };
}
```

## Variants

### Autosave with Undo

```typescript
// hooks/use-autosave-with-history.ts
"use client";

import { useState, useCallback } from "react";
import { useAutosave } from "./use-autosave";

const MAX_HISTORY = 50;

export function useAutosaveWithHistory<T>(options: UseAutosaveOptions<T>) {
  const [history, setHistory] = useState<T[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const { save, ...rest } = useAutosave(options);

  const addToHistory = useCallback((data: T) => {
    setHistory((prev) => {
      const newHistory = [...prev.slice(-MAX_HISTORY + 1), data];
      setHistoryIndex(newHistory.length - 1);
      return newHistory;
    });
  }, []);

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex((i) => i - 1);
      return history[historyIndex - 1];
    }
    return null;
  }, [history, historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex((i) => i + 1);
      return history[historyIndex + 1];
    }
    return null;
  }, [history, historyIndex]);

  return {
    ...rest,
    save,
    addToHistory,
    undo,
    redo,
    canUndo: historyIndex > 0,
    canRedo: historyIndex < history.length - 1,
  };
}
```

## Anti-patterns

1. **No debouncing**: Saving on every keystroke overloads server
2. **No error recovery**: Silent failures without retry
3. **Missing offline support**: Data loss when disconnected
4. **No visual feedback**: Users don't know save status
5. **Ignoring conflicts**: Overwriting concurrent changes

## Related Skills

- `L5/patterns/optimistic-updates` - Optimistic UI updates
- `L5/patterns/local-storage` - Client-side persistence
- `L5/patterns/form-validation` - Validation before save
- `L5/patterns/server-actions` - Server-side save handlers

## Changelog

### 2.0.0 (2025-01-17)
- Standardized to atomic design system v2
- Updated frontmatter schema

### 1.0.0
- Initial implementation with conflict resolution
