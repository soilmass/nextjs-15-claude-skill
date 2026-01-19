---
id: pt-canned-responses
name: Canned Responses
version: 1.0.0
layer: L5
category: communication
description: Saved quick reply templates with variables and keyboard shortcuts
tags: [templates, responses, support, messaging, next15]
composes: []
dependencies: []
formula: "CannedResponses = TemplateLibrary + VariableSubstitution + CategoryOrganization + SearchFilter"
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# Canned Responses

## When to Use

- Customer support chat systems
- Email response automation
- Help desk ticket replies
- Sales outreach templates
- Team collaboration messaging

## Composition Diagram

```
Canned Response Flow
====================

+------------------------------------------+
|  Template Library                        |
|  - Organized by category                 |
|  - Searchable by keyword                 |
|  - User-specific + team templates        |
+------------------------------------------+
              |
              v
+------------------------------------------+
|  Template Selection                      |
|  - Keyboard shortcut (/)                 |
|  - Dropdown picker                       |
|  - Search autocomplete                   |
+------------------------------------------+
              |
              v
+------------------------------------------+
|  Variable Substitution                   |
|  - {{customerName}}                      |
|  - {{ticketNumber}}                      |
|  - {{agentName}}                         |
+------------------------------------------+
              |
              v
+------------------------------------------+
|  Inserted Response                       |
|  - Editable before sending               |
|  - Usage tracking                        |
+------------------------------------------+
```

## Database Schema

```prisma
// prisma/schema.prisma
model CannedResponse {
  id         String   @id @default(cuid())
  title      String
  shortcut   String?  // e.g., "/greeting"
  content    String   @db.Text
  category   String?
  isTeam     Boolean  @default(false)
  userId     String?
  user       User?    @relation(fields: [userId], references: [id])
  teamId     String?
  usageCount Int      @default(0)
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  @@unique([userId, shortcut])
  @@index([userId])
  @@index([teamId])
}
```

## Canned Response Service

```typescript
// lib/canned-responses/service.ts
import { prisma } from '@/lib/db';

export async function getCannedResponses(userId: string, teamId?: string) {
  return prisma.cannedResponse.findMany({
    where: {
      OR: [
        { userId },
        { teamId, isTeam: true },
      ],
    },
    orderBy: [
      { usageCount: 'desc' },
      { title: 'asc' },
    ],
  });
}

export async function searchCannedResponses(
  userId: string,
  query: string,
  teamId?: string
) {
  return prisma.cannedResponse.findMany({
    where: {
      OR: [
        { userId },
        { teamId, isTeam: true },
      ],
      AND: {
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { shortcut: { contains: query, mode: 'insensitive' } },
          { content: { contains: query, mode: 'insensitive' } },
        ],
      },
    },
    take: 10,
    orderBy: { usageCount: 'desc' },
  });
}

export async function applyVariables(
  template: string,
  variables: Record<string, string>
): string {
  return template.replace(
    /\{\{(\w+)\}\}/g,
    (match, key) => variables[key] || match
  );
}

export async function trackUsage(responseId: string) {
  await prisma.cannedResponse.update({
    where: { id: responseId },
    data: { usageCount: { increment: 1 } },
  });
}
```

## Response Picker Component

```typescript
// components/canned-responses/response-picker.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Command, CommandInput, CommandList, CommandItem, CommandGroup } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { MessageSquare } from 'lucide-react';

interface ResponsePickerProps {
  onSelect: (content: string, responseId: string) => void;
  variables?: Record<string, string>;
}

export function ResponsePicker({ onSelect, variables = {} }: ResponsePickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const { data: responses } = useQuery({
    queryKey: ['canned-responses', search],
    queryFn: () =>
      fetch(`/api/canned-responses?q=${encodeURIComponent(search)}`)
        .then((r) => r.json()),
  });

  const handleSelect = async (response: any) => {
    // Apply variables
    let content = response.content;
    Object.entries(variables).forEach(([key, value]) => {
      content = content.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value);
    });

    // Track usage
    await fetch(`/api/canned-responses/${response.id}/use`, { method: 'POST' });

    onSelect(content, response.id);
    setOpen(false);
  };

  // Group responses by category
  const groupedResponses = responses?.data?.reduce((acc: any, response: any) => {
    const category = response.category || 'General';
    if (!acc[category]) acc[category] = [];
    acc[category].push(response);
    return acc;
  }, {});

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon">
          <MessageSquare className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <Command>
          <CommandInput
            placeholder="Search templates..."
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            {groupedResponses && Object.entries(groupedResponses).map(([category, items]: [string, any]) => (
              <CommandGroup key={category} heading={category}>
                {items.map((response: any) => (
                  <CommandItem
                    key={response.id}
                    onSelect={() => handleSelect(response)}
                    className="flex flex-col items-start"
                  >
                    <div className="flex items-center gap-2 w-full">
                      <span className="font-medium">{response.title}</span>
                      {response.shortcut && (
                        <span className="text-xs text-muted-foreground ml-auto">
                          {response.shortcut}
                        </span>
                      )}
                    </div>
                    <span className="text-sm text-muted-foreground truncate w-full">
                      {response.content.substring(0, 50)}...
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
```

## Inline Shortcut Handler

```typescript
// hooks/use-canned-shortcut.ts
'use client';

import { useState, useEffect, useCallback } from 'react';

interface UseCannedShortcutOptions {
  onMatch: (content: string) => void;
  triggerChar?: string;
}

export function useCannedShortcut({ onMatch, triggerChar = '/' }: UseCannedShortcutOptions) {
  const [isSearching, setIsSearching] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const handleKeyDown = useCallback((e: KeyboardEvent, inputValue: string) => {
    if (e.key === triggerChar && !isSearching) {
      setIsSearching(true);
      setSearchTerm('');
    } else if (isSearching) {
      if (e.key === 'Escape') {
        setIsSearching(false);
        setSearchTerm('');
      } else if (e.key === 'Enter') {
        // Fetch matching response
        fetchMatchingResponse(searchTerm).then((response) => {
          if (response) {
            onMatch(response.content);
          }
          setIsSearching(false);
          setSearchTerm('');
        });
      } else if (e.key === 'Backspace') {
        if (searchTerm.length === 0) {
          setIsSearching(false);
        } else {
          setSearchTerm((s) => s.slice(0, -1));
        }
      } else if (e.key.length === 1) {
        setSearchTerm((s) => s + e.key);
      }
    }
  }, [isSearching, searchTerm, triggerChar, onMatch]);

  return { isSearching, searchTerm, handleKeyDown };
}

async function fetchMatchingResponse(shortcut: string) {
  const response = await fetch(`/api/canned-responses/shortcut/${shortcut}`);
  if (response.ok) {
    return response.json();
  }
  return null;
}
```

## Response Management Component

```typescript
// components/canned-responses/response-manager.tsx
'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export function ResponseManager() {
  const [editingResponse, setEditingResponse] = useState<any>(null);
  const queryClient = useQueryClient();

  const { data: responses } = useQuery({
    queryKey: ['canned-responses'],
    queryFn: () => fetch('/api/canned-responses').then((r) => r.json()),
  });

  const saveMutation = useMutation({
    mutationFn: (data: any) =>
      fetch(`/api/canned-responses${data.id ? `/${data.id}` : ''}`, {
        method: data.id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['canned-responses'] });
      setEditingResponse(null);
      toast.success('Response saved');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      fetch(`/api/canned-responses/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['canned-responses'] });
      toast.success('Response deleted');
    },
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium">Canned Responses</h2>
        <Button onClick={() => setEditingResponse({})}>
          <Plus className="h-4 w-4 mr-2" />
          New Response
        </Button>
      </div>

      <div className="space-y-2">
        {responses?.data?.map((response: any) => (
          <div key={response.id} className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <p className="font-medium">{response.title}</p>
              <p className="text-sm text-muted-foreground">{response.shortcut}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="icon" onClick={() => setEditingResponse(response)}>
                <Edit className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(response.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={!!editingResponse} onOpenChange={() => setEditingResponse(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingResponse?.id ? 'Edit Response' : 'New Response'}
            </DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              saveMutation.mutate({
                ...editingResponse,
                title: formData.get('title'),
                shortcut: formData.get('shortcut'),
                content: formData.get('content'),
                category: formData.get('category'),
              });
            }}
            className="space-y-4"
          >
            <Input name="title" placeholder="Title" defaultValue={editingResponse?.title} />
            <Input name="shortcut" placeholder="/shortcut" defaultValue={editingResponse?.shortcut} />
            <Input name="category" placeholder="Category" defaultValue={editingResponse?.category} />
            <Textarea name="content" placeholder="Response content..." defaultValue={editingResponse?.content} rows={5} />
            <p className="text-sm text-muted-foreground">
              Use {'{{variableName}}'} for dynamic values
            </p>
            <Button type="submit">Save</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
```

## Anti-patterns

### Don't Hardcode Responses

```typescript
// BAD
const greeting = "Hello! Thanks for contacting support.";

// GOOD
const response = await getCannedResponse('greeting');
const greeting = applyVariables(response.content, { customerName });
```

## Related Skills

- [rich-text-editor](./rich-text-editor.md)
- [command-palette](./command-palette.md)

---

## Changelog

### 1.0.0 (2025-01-18)
- Initial implementation
- Variable substitution
- Shortcut support
- Usage tracking
