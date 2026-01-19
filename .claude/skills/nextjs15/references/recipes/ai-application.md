---
id: r-ai-application
name: AI Application Recipe
version: 3.0.0
layer: L6
category: recipes
description: Complete recipe for building AI-powered applications with Next.js 15 and LLMs
tags: [recipe, ai, llm, openai, anthropic, streaming, chat, rag]
formula: "AiApplication = DashboardLayout(t-dashboard-layout) + SettingsPage(t-settings-page) + AuthLayout(t-auth-layout) + ProfilePage(t-profile-page) + Header(o-header) + Sidebar(o-sidebar) + ChatInterface(o-chat-interface) + MessageList(o-message-list) + ChatInput(o-chat-input) + DataTable(o-data-table) + Tabs(o-tabs) + Modal(o-modal) + Breadcrumb(m-breadcrumb) + Card(m-card) + FormField(m-form-field) + Badge(m-badge) + Avatar(m-avatar) + SearchInput(m-search-input) + StatCard(m-stat-card) + Toast(m-toast) + CodeBlock(m-code-block) + NextAuth(pt-next-auth) + AuthMiddleware(pt-auth-middleware) + SessionManagement(pt-session-management) + Rbac(pt-rbac) + RateLimiting(pt-rate-limiting) + AuditLogging(pt-audit-logging) + GdprCompliance(pt-gdpr-compliance) + FormValidation(pt-form-validation) + ZodSchemas(pt-zod-schemas) + ServerActions(pt-server-actions) + Streaming(pt-streaming) + Rag(pt-rag) + VectorDatabase(pt-vector-database) + Embeddings(pt-embeddings) + PromptEngineering(pt-prompt-engineering) + FunctionCalling(pt-function-calling) + TokenCounting(pt-token-counting) + StripeSubscriptions(pt-stripe-subscriptions) + UsageMetering(pt-usage-metering) + TransactionalEmail(pt-transactional-email) + ErrorBoundaries(pt-error-boundaries) + ErrorTracking(pt-error-tracking) + SkeletonLoading(pt-skeleton-loading) + AnalyticsEvents(pt-analytics-events) + Filtering(pt-filtering) + Pagination(pt-pagination) + Search(pt-search) + ReactQuery(pt-react-query) + Zustand(pt-zustand) + OptimisticUpdates(pt-optimistic-updates) + FileUpload(pt-file-upload) + TestingE2e(pt-testing-e2e) + TestingUnit(pt-testing-unit) + Sitemap(pt-sitemap) + StructuredData(pt-structured-data) + MetadataApi(pt-metadata-api) + Csp(pt-csp) + InputSanitization(pt-input-sanitization) + UserAnalytics(pt-user-analytics)"
composes:
  # L4 Templates
  - ../templates/dashboard-layout.md
  - ../templates/settings-page.md
  - ../templates/auth-layout.md
  - ../templates/profile-page.md
  # L3 Organisms
  - ../organisms/header.md
  - ../organisms/sidebar.md
  - ../organisms/chat-interface.md
  - ../organisms/message-list.md
  - ../organisms/chat-input.md
  - ../organisms/data-table.md
  - ../organisms/tabs.md
  - ../organisms/modal.md
  # L2 Molecules
  - ../molecules/breadcrumb.md
  - ../molecules/card.md
  - ../molecules/form-field.md
  - ../molecules/badge.md
  - ../molecules/avatar.md
  - ../molecules/search-input.md
  - ../molecules/stat-card.md
  - ../molecules/toast.md
  - ../molecules/code-block.md
  # L5 Patterns - Authentication
  - ../patterns/next-auth.md
  - ../patterns/auth-middleware.md
  - ../patterns/session-management.md
  - ../patterns/rbac.md
  # L5 Patterns - Security
  - ../patterns/rate-limiting.md
  - ../patterns/audit-logging.md
  - ../patterns/gdpr-compliance.md
  # L5 Patterns - Forms & Validation
  - ../patterns/form-validation.md
  - ../patterns/zod-schemas.md
  - ../patterns/server-actions.md
  # L5 Patterns - AI Specific
  - ../patterns/streaming.md
  - ../patterns/rag.md
  - ../patterns/vector-database.md
  - ../patterns/embeddings.md
  - ../patterns/prompt-engineering.md
  - ../patterns/function-calling.md
  - ../patterns/token-counting.md
  # L5 Patterns - Monetization
  - ../patterns/stripe-subscriptions.md
  - ../patterns/usage-metering.md
  # L5 Patterns - Communication
  - ../patterns/transactional-email.md
  # L5 Patterns - Error Handling
  - ../patterns/error-boundaries.md
  - ../patterns/error-tracking.md
  - ../patterns/skeleton-loading.md
  # L5 Patterns - Analytics
  - ../patterns/analytics-events.md
  # L5 Patterns - Data Management
  - ../patterns/filtering.md
  - ../patterns/pagination.md
  - ../patterns/search.md
  # L5 Patterns - State Management
  - ../patterns/react-query.md
  - ../patterns/zustand.md
  - ../patterns/optimistic-updates.md
  # L5 Patterns - Files
  - ../patterns/file-upload.md
  # L5 Patterns - Testing
  - ../patterns/testing-e2e.md
  - ../patterns/testing-unit.md
  # L5 Patterns - SEO
  - ../patterns/sitemap.md
  - ../patterns/structured-data.md
  - ../patterns/metadata-api.md
  # L5 Patterns - Security (Additional)
  - ../patterns/csp.md
  - ../patterns/input-sanitization.md
  # L5 Patterns - Analytics (Additional)
  - ../patterns/user-analytics.md
dependencies:
  - next
  - ai
  - openai
  - "@anthropic-ai/sdk"
  - langchain
complexity: advanced
estimated_time: 8-16 hours
performance:
  impact: high
  lcp: medium
  cls: low
accessibility:
  wcag: AA
  keyboard: true
  screen-reader: true
---

# AI Application Recipe

## Overview

Build production-ready AI applications with Next.js 15. Includes streaming chat interfaces, RAG (Retrieval-Augmented Generation), function calling, and multi-modal support. Optimized for real-time responses and efficient token usage.

## Architecture

```
app/
├── (chat)/                      # Chat interface
│   ├── layout.tsx              # Chat layout
│   ├── page.tsx                # New chat
│   └── [id]/
│       └── page.tsx            # Chat conversation
├── (dashboard)/                 # User dashboard
│   ├── layout.tsx
│   ├── page.tsx                # Chat history
│   └── settings/
│       └── page.tsx            # API keys, preferences
├── api/
│   ├── chat/
│   │   └── route.ts            # Chat completion API
│   ├── embeddings/
│   │   └── route.ts            # Generate embeddings
│   ├── documents/
│   │   └── route.ts            # Document upload/process
│   └── assistants/
│       └── route.ts            # OpenAI Assistants API
└── webhooks/
    └── stripe/
        └── route.ts            # Usage-based billing

lib/
├── ai/
│   ├── providers.ts            # AI provider configuration
│   ├── prompts.ts              # System prompts
│   ├── tools.ts                # Function definitions
│   └── rag.ts                  # RAG implementation
├── db/
│   └── vectors.ts              # Vector database operations
└── rate-limit.ts               # Rate limiting
```

## Skills Used

| Skill | Layer | Purpose |
|-------|-------|---------|
| chat-interface | L4 | Chat UI |
| message-list | L3 | Message display |
| chat-input | L3 | User input |
| streaming | L5 | Real-time responses |
| ai-sdk | L5 | Vercel AI SDK |
| rag | L5 | Document retrieval |
| vector-db | L5 | Embeddings storage |

## Implementation

### AI Provider Configuration

```typescript
// lib/ai/providers.ts
import { createOpenAI } from '@ai-sdk/openai';
import { createAnthropic } from '@ai-sdk/anthropic';
import { createGoogleGenerativeAI } from '@ai-sdk/google';

// OpenAI provider
export const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Anthropic provider
export const anthropic = createAnthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Google provider
export const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_AI_API_KEY,
});

// Model configurations
export const models = {
  'gpt-4o': openai('gpt-4o'),
  'gpt-4o-mini': openai('gpt-4o-mini'),
  'claude-3-5-sonnet': anthropic('claude-3-5-sonnet-20241022'),
  'claude-3-5-haiku': anthropic('claude-3-5-haiku-20241022'),
  'gemini-pro': google('gemini-1.5-pro'),
} as const;

export type ModelId = keyof typeof models;
```

### Chat API with Streaming

```typescript
// app/api/chat/route.ts
import { streamText, convertToCoreMessages } from 'ai';
import { z } from 'zod';
import { models, type ModelId } from '@/lib/ai/providers';
import { auth } from '@/lib/auth';
import { rateLimit } from '@/lib/rate-limit';
import { getSystemPrompt } from '@/lib/ai/prompts';
import { tools } from '@/lib/ai/tools';
import { retrieveContext } from '@/lib/ai/rag';
import { prisma } from '@/lib/prisma';

const requestSchema = z.object({
  messages: z.array(z.object({
    role: z.enum(['user', 'assistant', 'system']),
    content: z.string(),
  })),
  model: z.string().default('gpt-4o-mini'),
  conversationId: z.string().optional(),
  useRAG: z.boolean().default(false),
  temperature: z.number().min(0).max(2).default(0.7),
});

export async function POST(request: Request) {
  try {
    // Authenticate
    const session = await auth();
    if (!session?.user) {
      return new Response('Unauthorized', { status: 401 });
    }

    // Rate limit
    const { success, remaining } = await rateLimit(session.user.id);
    if (!success) {
      return new Response('Rate limit exceeded', { 
        status: 429,
        headers: { 'X-RateLimit-Remaining': remaining.toString() },
      });
    }

    // Parse request
    const body = await request.json();
    const { messages, model, conversationId, useRAG, temperature } = requestSchema.parse(body);

    // Verify model is valid
    if (!(model in models)) {
      return new Response('Invalid model', { status: 400 });
    }

    // Build system prompt with optional RAG context
    let systemPrompt = getSystemPrompt();
    
    if (useRAG) {
      const lastUserMessage = messages.filter(m => m.role === 'user').pop();
      if (lastUserMessage) {
        const context = await retrieveContext(lastUserMessage.content, session.user.id);
        if (context) {
          systemPrompt += `\n\n## Relevant Context\n${context}`;
        }
      }
    }

    // Create or update conversation
    let conversation;
    if (conversationId) {
      conversation = await prisma.conversation.update({
        where: { id: conversationId },
        data: { updatedAt: new Date() },
      });
    } else {
      conversation = await prisma.conversation.create({
        data: {
          userId: session.user.id,
          title: messages[0]?.content.slice(0, 100) || 'New Chat',
        },
      });
    }

    // Store user message
    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        role: 'user',
        content: messages[messages.length - 1].content,
      },
    });

    // Stream response
    const result = streamText({
      model: models[model as ModelId],
      system: systemPrompt,
      messages: convertToCoreMessages(messages),
      temperature,
      maxTokens: 4096,
      tools,
      
      // Callbacks for tracking
      onFinish: async ({ text, usage, finishReason }) => {
        // Store assistant message
        await prisma.message.create({
          data: {
            conversationId: conversation.id,
            role: 'assistant',
            content: text,
            metadata: {
              model,
              usage,
              finishReason,
            },
          },
        });

        // Track token usage for billing
        await prisma.usage.create({
          data: {
            userId: session.user.id,
            model,
            promptTokens: usage.promptTokens,
            completionTokens: usage.completionTokens,
            totalTokens: usage.totalTokens,
          },
        });
      },
    });

    // Return streaming response with conversation ID
    return result.toDataStreamResponse({
      headers: {
        'X-Conversation-Id': conversation.id,
      },
    });
  } catch (error) {
    console.error('Chat API error:', error);
    
    if (error instanceof z.ZodError) {
      return new Response('Invalid request', { status: 400 });
    }
    
    return new Response('Internal server error', { status: 500 });
  }
}
```

### Function Calling / Tools

```typescript
// lib/ai/tools.ts
import { tool } from 'ai';
import { z } from 'zod';

export const tools = {
  // Web search tool
  webSearch: tool({
    description: 'Search the web for current information',
    parameters: z.object({
      query: z.string().describe('The search query'),
    }),
    execute: async ({ query }) => {
      // Implement with Tavily, Serper, or similar
      const response = await fetch('https://api.tavily.com/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': process.env.TAVILY_API_KEY!,
        },
        body: JSON.stringify({
          query,
          search_depth: 'basic',
          max_results: 5,
        }),
      });
      
      const data = await response.json();
      return data.results.map((r: any) => ({
        title: r.title,
        url: r.url,
        content: r.content,
      }));
    },
  }),

  // Calculator tool
  calculate: tool({
    description: 'Perform mathematical calculations',
    parameters: z.object({
      expression: z.string().describe('The mathematical expression to evaluate'),
    }),
    execute: async ({ expression }) => {
      // Safe evaluation using mathjs or similar
      const math = await import('mathjs');
      try {
        const result = math.evaluate(expression);
        return { result: result.toString() };
      } catch {
        return { error: 'Invalid expression' };
      }
    },
  }),

  // Get current weather
  getWeather: tool({
    description: 'Get current weather for a location',
    parameters: z.object({
      location: z.string().describe('City name or coordinates'),
    }),
    execute: async ({ location }) => {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${process.env.OPENWEATHER_API_KEY}&units=metric`
      );
      
      if (!response.ok) {
        return { error: 'Location not found' };
      }
      
      const data = await response.json();
      return {
        location: data.name,
        temperature: data.main.temp,
        description: data.weather[0].description,
        humidity: data.main.humidity,
      };
    },
  }),

  // Generate image
  generateImage: tool({
    description: 'Generate an image from a text description',
    parameters: z.object({
      prompt: z.string().describe('Image description'),
      size: z.enum(['1024x1024', '1792x1024', '1024x1792']).default('1024x1024'),
    }),
    execute: async ({ prompt, size }) => {
      const response = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'dall-e-3',
          prompt,
          size,
          quality: 'standard',
          n: 1,
        }),
      });
      
      const data = await response.json();
      return { imageUrl: data.data[0].url };
    },
  }),
};
```

### RAG Implementation

```typescript
// lib/ai/rag.ts
import { openai } from './providers';
import { embed } from 'ai';
import { prisma } from '@/lib/prisma';

const EMBEDDING_MODEL = 'text-embedding-3-small';
const SIMILARITY_THRESHOLD = 0.7;
const MAX_RESULTS = 5;

export async function generateEmbedding(text: string): Promise<number[]> {
  const { embedding } = await embed({
    model: openai.embedding(EMBEDDING_MODEL),
    value: text,
  });
  
  return embedding;
}

export async function retrieveContext(
  query: string,
  userId: string,
  collectionId?: string
): Promise<string | null> {
  // Generate query embedding
  const queryEmbedding = await generateEmbedding(query);
  
  // Search for similar documents using pgvector
  const results = await prisma.$queryRaw<Array<{
    content: string;
    similarity: number;
    metadata: any;
  }>>`
    SELECT 
      content,
      1 - (embedding <=> ${queryEmbedding}::vector) as similarity,
      metadata
    FROM documents
    WHERE user_id = ${userId}
      ${collectionId ? `AND collection_id = ${collectionId}` : ''}
      AND 1 - (embedding <=> ${queryEmbedding}::vector) > ${SIMILARITY_THRESHOLD}
    ORDER BY similarity DESC
    LIMIT ${MAX_RESULTS}
  `;
  
  if (results.length === 0) {
    return null;
  }
  
  // Format context
  const context = results
    .map((r, i) => `[${i + 1}] ${r.content}`)
    .join('\n\n');
  
  return context;
}

export async function indexDocument(
  content: string,
  userId: string,
  metadata: Record<string, any> = {}
): Promise<void> {
  // Split into chunks
  const chunks = splitIntoChunks(content, 1000, 200);
  
  // Generate embeddings for each chunk
  for (const chunk of chunks) {
    const embedding = await generateEmbedding(chunk);
    
    await prisma.document.create({
      data: {
        userId,
        content: chunk,
        embedding,
        metadata,
      },
    });
  }
}

function splitIntoChunks(
  text: string,
  chunkSize: number,
  overlap: number
): string[] {
  const chunks: string[] = [];
  let start = 0;
  
  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);
    chunks.push(text.slice(start, end));
    start += chunkSize - overlap;
  }
  
  return chunks;
}
```

### Chat Interface Component

```tsx
// components/chat/chat-interface.tsx
'use client';

import * as React from 'react';
import { useChat } from 'ai/react';
import { Send, Paperclip, Mic, StopCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { MessageList } from './message-list';
import { ModelSelector } from './model-selector';
import { cn } from '@/lib/utils';

interface ChatInterfaceProps {
  conversationId?: string;
  initialMessages?: any[];
}

export function ChatInterface({ conversationId, initialMessages = [] }: ChatInterfaceProps) {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    stop,
    reload,
    error,
    setMessages,
  } = useChat({
    api: '/api/chat',
    id: conversationId,
    initialMessages,
    body: {
      conversationId,
      model: 'gpt-4o-mini',
    },
    onResponse: (response) => {
      // Get conversation ID from response headers
      const newConversationId = response.headers.get('X-Conversation-Id');
      if (newConversationId && !conversationId) {
        // Update URL with new conversation ID
        window.history.replaceState({}, '', `/chat/${newConversationId}`);
      }
    },
    onError: (error) => {
      console.error('Chat error:', error);
    },
  });

  // Auto-resize textarea
  React.useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (input.trim() && !isLoading) {
        handleSubmit(e as any);
      }
    }
  };

  return (
    <div className="flex h-full flex-col">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        <MessageList
          messages={messages}
          isLoading={isLoading}
          onRegenerate={() => reload()}
        />
      </div>

      {/* Error display */}
      {error && (
        <div className="mx-4 mb-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          {error.message}
        </div>
      )}

      {/* Input area */}
      <div className="border-t bg-background p-4">
        <form onSubmit={handleSubmit} className="mx-auto max-w-3xl">
          <div className="relative rounded-lg border bg-muted/50 focus-within:ring-2 focus-within:ring-primary">
            {/* Model selector */}
            <div className="flex items-center gap-2 border-b px-3 py-2">
              <ModelSelector />
            </div>
            
            {/* Input */}
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Send a message..."
              className="min-h-[60px] resize-none border-0 bg-transparent p-3 focus-visible:ring-0"
              rows={1}
              disabled={isLoading}
            />
            
            {/* Actions */}
            <div className="flex items-center justify-between px-3 py-2">
              <div className="flex items-center gap-2">
                <Button type="button" variant="ghost" size="icon" disabled>
                  <Paperclip className="h-4 w-4" />
                </Button>
                <Button type="button" variant="ghost" size="icon" disabled>
                  <Mic className="h-4 w-4" />
                </Button>
              </div>
              
              {isLoading ? (
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={stop}
                >
                  <StopCircle className="mr-2 h-4 w-4" />
                  Stop
                </Button>
              ) : (
                <Button
                  type="submit"
                  size="sm"
                  disabled={!input.trim()}
                >
                  <Send className="mr-2 h-4 w-4" />
                  Send
                </Button>
              )}
            </div>
          </div>
          
          <p className="mt-2 text-center text-xs text-muted-foreground">
            AI can make mistakes. Consider checking important information.
          </p>
        </form>
      </div>
    </div>
  );
}
```

### Message Component with Markdown

```tsx
// components/chat/message.tsx
'use client';

import * as React from 'react';
import { Bot, User, Copy, Check, RefreshCw } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface MessageProps {
  role: 'user' | 'assistant';
  content: string;
  isStreaming?: boolean;
  onRegenerate?: () => void;
}

export function Message({ role, content, isStreaming, onRegenerate }: MessageProps) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={cn(
        'group flex gap-4 px-4 py-6',
        role === 'assistant' && 'bg-muted/50'
      )}
    >
      <Avatar className="h-8 w-8 shrink-0">
        <AvatarFallback>
          {role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 space-y-2">
        <div className="prose prose-sm max-w-none dark:prose-invert">
          <ReactMarkdown
            components={{
              code({ node, className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || '');
                const isInline = !match;
                
                if (isInline) {
                  return (
                    <code className="rounded bg-muted px-1 py-0.5" {...props}>
                      {children}
                    </code>
                  );
                }
                
                return (
                  <div className="relative">
                    <SyntaxHighlighter
                      style={oneDark}
                      language={match[1]}
                      PreTag="div"
                      className="rounded-lg !mt-0"
                    >
                      {String(children).replace(/\n$/, '')}
                    </SyntaxHighlighter>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-2 h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100"
                      onClick={handleCopy}
                    >
                      {copied ? (
                        <Check className="h-3 w-3" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </Button>
                  </div>
                );
              },
            }}
          >
            {content}
          </ReactMarkdown>
          
          {isStreaming && (
            <span className="inline-block h-4 w-2 animate-pulse bg-primary" />
          )}
        </div>

        {/* Actions */}
        {role === 'assistant' && !isStreaming && (
          <div className="flex items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
            <Button variant="ghost" size="sm" onClick={handleCopy}>
              {copied ? <Check className="mr-1 h-3 w-3" /> : <Copy className="mr-1 h-3 w-3" />}
              {copied ? 'Copied' : 'Copy'}
            </Button>
            {onRegenerate && (
              <Button variant="ghost" size="sm" onClick={onRegenerate}>
                <RefreshCw className="mr-1 h-3 w-3" />
                Regenerate
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
```

## Database Schema

```prisma
// prisma/schema.prisma additions for AI app
model Conversation {
  id        String    @id @default(cuid())
  userId    String
  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  title     String
  messages  Message[]
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt

  @@index([userId, updatedAt])
}

model Message {
  id             String       @id @default(cuid())
  conversationId String
  conversation   Conversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)
  role           String       // user, assistant, system
  content        String       @db.Text
  metadata       Json?
  createdAt      DateTime     @default(now())

  @@index([conversationId])
}

model Document {
  id        String   @id @default(cuid())
  userId    String
  content   String   @db.Text
  embedding Unsupported("vector(1536)")
  metadata  Json?
  createdAt DateTime @default(now())

  @@index([userId])
}

model Usage {
  id               String   @id @default(cuid())
  userId           String
  model            String
  promptTokens     Int
  completionTokens Int
  totalTokens      Int
  createdAt        DateTime @default(now())

  @@index([userId, createdAt])
}
```

## Testing

### Test Setup

```bash
# Install testing dependencies
npm install -D vitest @vitejs/plugin-react @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
npm install -D playwright @playwright/test
npm install -D msw undici
npx playwright install
```

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    include: ['**/*.test.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'tests/e2e/'],
      thresholds: {
        statements: 80,
        branches: 75,
        functions: 80,
        lines: 80,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

```typescript
// tests/setup.ts
import '@testing-library/jest-dom';
import { vi } from 'vitest';
import { server } from './mocks/server';

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/',
}));

// Mock Next.js Image
vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: any) => <img src={src} alt={alt} {...props} />,
}));

// Mock AI SDK useChat hook
vi.mock('ai/react', () => ({
  useChat: vi.fn(() => ({
    messages: [],
    input: '',
    handleInputChange: vi.fn(),
    handleSubmit: vi.fn(),
    isLoading: false,
    stop: vi.fn(),
    reload: vi.fn(),
    error: null,
    setMessages: vi.fn(),
  })),
}));

// Setup MSW server
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

```typescript
// tests/mocks/server.ts
import { setupServer } from 'msw/node';
import { handlers } from './handlers';

export const server = setupServer(...handlers);
```

```typescript
// tests/mocks/handlers.ts
import { http, HttpResponse } from 'msw';

// Mock streaming response helper
function createStreamResponse(chunks: string[]) {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      for (const chunk of chunks) {
        controller.enqueue(encoder.encode(`0:${JSON.stringify(chunk)}\n`));
        await new Promise(resolve => setTimeout(resolve, 10));
      }
      controller.close();
    },
  });
  return new Response(stream, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}

export const handlers = [
  // Chat API - streaming response
  http.post('/api/chat', async ({ request }) => {
    const body = await request.json() as { messages: any[] };
    const lastMessage = body.messages[body.messages.length - 1]?.content || '';
    
    // Simulate different responses based on input
    if (lastMessage.includes('error')) {
      return HttpResponse.json(
        { error: 'Simulated error' },
        { status: 500 }
      );
    }
    
    if (lastMessage.includes('rate limit')) {
      return new HttpResponse(null, {
        status: 429,
        headers: { 'X-RateLimit-Remaining': '0' },
      });
    }
    
    return createStreamResponse([
      'Hello',
      ', how can I',
      ' help you today?',
    ]);
  }),

  // Embeddings API
  http.post('/api/embeddings', async () => {
    return HttpResponse.json({
      embedding: new Array(1536).fill(0).map(() => Math.random()),
    });
  }),

  // Documents API
  http.post('/api/documents', async () => {
    return HttpResponse.json({
      id: 'doc-123',
      status: 'indexed',
      chunks: 5,
    });
  }),

  // Conversations API
  http.get('/api/conversations', async () => {
    return HttpResponse.json([
      { id: 'conv-1', title: 'Test conversation', updatedAt: new Date().toISOString() },
    ]);
  }),

  http.get('/api/conversations/:id', async ({ params }) => {
    return HttpResponse.json({
      id: params.id,
      title: 'Test conversation',
      messages: [
        { role: 'user', content: 'Hello' },
        { role: 'assistant', content: 'Hi there!' },
      ],
    });
  }),

  // Usage API
  http.get('/api/usage', async () => {
    return HttpResponse.json({
      totalTokens: 10000,
      promptTokens: 7500,
      completionTokens: 2500,
      costEstimate: 0.15,
    });
  }),
];
```

### Unit Tests

```typescript
// tests/unit/ai/providers.test.ts
import { describe, it, expect, vi } from 'vitest';
import { models, type ModelId } from '@/lib/ai/providers';

describe('AI Providers', () => {
  it('exports all expected models', () => {
    const expectedModels: ModelId[] = [
      'gpt-4o',
      'gpt-4o-mini',
      'claude-3-5-sonnet',
      'claude-3-5-haiku',
      'gemini-pro',
    ];
    
    expectedModels.forEach((modelId) => {
      expect(models[modelId]).toBeDefined();
    });
  });

  it('model IDs match expected format', () => {
    Object.keys(models).forEach((modelId) => {
      expect(modelId).toMatch(/^[a-z0-9-]+$/);
    });
  });
});
```

```typescript
// tests/unit/ai/prompts.test.ts
import { describe, it, expect } from 'vitest';
import { getSystemPrompt, buildPromptWithContext } from '@/lib/ai/prompts';

describe('AI Prompts', () => {
  describe('getSystemPrompt', () => {
    it('returns a non-empty system prompt', () => {
      const prompt = getSystemPrompt();
      expect(prompt).toBeTruthy();
      expect(prompt.length).toBeGreaterThan(50);
    });

    it('includes key behavioral instructions', () => {
      const prompt = getSystemPrompt();
      expect(prompt.toLowerCase()).toContain('helpful');
    });
  });

  describe('buildPromptWithContext', () => {
    it('appends context to base prompt', () => {
      const basePrompt = 'You are a helpful assistant.';
      const context = 'Document content here.';
      
      const result = buildPromptWithContext(basePrompt, context);
      
      expect(result).toContain(basePrompt);
      expect(result).toContain(context);
      expect(result).toContain('Relevant Context');
    });

    it('handles empty context gracefully', () => {
      const basePrompt = 'You are a helpful assistant.';
      
      const result = buildPromptWithContext(basePrompt, '');
      
      expect(result).toBe(basePrompt);
    });
  });
});
```

```typescript
// tests/unit/ai/tools.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { tools } from '@/lib/ai/tools';

// Mock fetch
global.fetch = vi.fn();

describe('AI Tools', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('webSearch', () => {
    it('returns search results', async () => {
      (global.fetch as any).mockResolvedValue({
        json: () => Promise.resolve({
          results: [
            { title: 'Result 1', url: 'https://example.com', content: 'Content' },
          ],
        }),
      });

      const result = await tools.webSearch.execute({ query: 'test query' });
      
      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty('title', 'Result 1');
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.tavily.com/search',
        expect.objectContaining({ method: 'POST' })
      );
    });
  });

  describe('calculate', () => {
    it('evaluates mathematical expressions', async () => {
      const result = await tools.calculate.execute({ expression: '2 + 2 * 3' });
      expect(result).toEqual({ result: '8' });
    });

    it('handles invalid expressions', async () => {
      const result = await tools.calculate.execute({ expression: 'invalid' });
      expect(result).toEqual({ error: 'Invalid expression' });
    });
  });

  describe('getWeather', () => {
    it('returns weather data for valid location', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          name: 'London',
          main: { temp: 15, humidity: 70 },
          weather: [{ description: 'cloudy' }],
        }),
      });

      const result = await tools.getWeather.execute({ location: 'London' });
      
      expect(result).toEqual({
        location: 'London',
        temperature: 15,
        description: 'cloudy',
        humidity: 70,
      });
    });

    it('handles location not found', async () => {
      (global.fetch as any).mockResolvedValue({ ok: false });

      const result = await tools.getWeather.execute({ location: 'InvalidCity' });
      
      expect(result).toEqual({ error: 'Location not found' });
    });
  });

  describe('generateImage', () => {
    it('returns image URL on success', async () => {
      (global.fetch as any).mockResolvedValue({
        json: () => Promise.resolve({
          data: [{ url: 'https://example.com/image.png' }],
        }),
      });

      const result = await tools.generateImage.execute({
        prompt: 'A sunset over the ocean',
        size: '1024x1024',
      });
      
      expect(result).toEqual({ imageUrl: 'https://example.com/image.png' });
    });
  });
});
```

```typescript
// tests/unit/ai/rag.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateEmbedding, retrieveContext, splitIntoChunks } from '@/lib/ai/rag';

// Mock embed function
vi.mock('ai', () => ({
  embed: vi.fn().mockResolvedValue({
    embedding: new Array(1536).fill(0).map(() => Math.random()),
  }),
}));

// Mock prisma
vi.mock('@/lib/prisma', () => ({
  prisma: {
    $queryRaw: vi.fn(),
    document: {
      create: vi.fn(),
    },
  },
}));

describe('RAG Implementation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('generateEmbedding', () => {
    it('returns embedding array of correct dimension', async () => {
      const embedding = await generateEmbedding('test text');
      
      expect(Array.isArray(embedding)).toBe(true);
      expect(embedding.length).toBe(1536);
    });
  });

  describe('splitIntoChunks', () => {
    it('splits text into correct number of chunks', () => {
      const text = 'a'.repeat(2500);
      const chunks = splitIntoChunks(text, 1000, 200);
      
      expect(chunks.length).toBe(3);
    });

    it('respects overlap between chunks', () => {
      const text = 'abcdefghij';
      const chunks = splitIntoChunks(text, 5, 2);
      
      // First chunk: abcde, second: defgh, third: ghij
      expect(chunks[0].slice(-2)).toBe(chunks[1].slice(0, 2));
    });

    it('handles text shorter than chunk size', () => {
      const text = 'short text';
      const chunks = splitIntoChunks(text, 1000, 200);
      
      expect(chunks).toHaveLength(1);
      expect(chunks[0]).toBe(text);
    });
  });

  describe('retrieveContext', () => {
    it('returns null when no similar documents found', async () => {
      const { prisma } = await import('@/lib/prisma');
      (prisma.$queryRaw as any).mockResolvedValue([]);

      const context = await retrieveContext('query', 'user-123');
      
      expect(context).toBeNull();
    });

    it('formats multiple results with numbering', async () => {
      const { prisma } = await import('@/lib/prisma');
      (prisma.$queryRaw as any).mockResolvedValue([
        { content: 'First doc', similarity: 0.9 },
        { content: 'Second doc', similarity: 0.85 },
      ]);

      const context = await retrieveContext('query', 'user-123');
      
      expect(context).toContain('[1] First doc');
      expect(context).toContain('[2] Second doc');
    });
  });
});
```

```typescript
// tests/unit/components/chat-interface.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useChat } from 'ai/react';
import { ChatInterface } from '@/components/chat/chat-interface';

describe('ChatInterface', () => {
  const mockUseChat = {
    messages: [],
    input: '',
    handleInputChange: vi.fn(),
    handleSubmit: vi.fn((e) => e.preventDefault()),
    isLoading: false,
    stop: vi.fn(),
    reload: vi.fn(),
    error: null,
    setMessages: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useChat as any).mockReturnValue(mockUseChat);
  });

  it('renders input field and send button', () => {
    render(<ChatInterface />);
    
    expect(screen.getByPlaceholderText(/send a message/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /send/i })).toBeInTheDocument();
  });

  it('disables send button when input is empty', () => {
    render(<ChatInterface />);
    
    const sendButton = screen.getByRole('button', { name: /send/i });
    expect(sendButton).toBeDisabled();
  });

  it('enables send button when input has text', () => {
    (useChat as any).mockReturnValue({ ...mockUseChat, input: 'Hello' });
    
    render(<ChatInterface />);
    
    const sendButton = screen.getByRole('button', { name: /send/i });
    expect(sendButton).not.toBeDisabled();
  });

  it('shows stop button when loading', () => {
    (useChat as any).mockReturnValue({ ...mockUseChat, isLoading: true });
    
    render(<ChatInterface />);
    
    expect(screen.getByRole('button', { name: /stop/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /send/i })).not.toBeInTheDocument();
  });

  it('calls stop function when stop button clicked', async () => {
    const user = userEvent.setup();
    const stop = vi.fn();
    (useChat as any).mockReturnValue({ ...mockUseChat, isLoading: true, stop });
    
    render(<ChatInterface />);
    
    await user.click(screen.getByRole('button', { name: /stop/i }));
    expect(stop).toHaveBeenCalled();
  });

  it('displays error message when error exists', () => {
    (useChat as any).mockReturnValue({
      ...mockUseChat,
      error: new Error('API Error'),
    });
    
    render(<ChatInterface />);
    
    expect(screen.getByText('API Error')).toBeInTheDocument();
  });

  it('submits on Enter key (without Shift)', async () => {
    const user = userEvent.setup();
    const handleSubmit = vi.fn((e) => e.preventDefault());
    (useChat as any).mockReturnValue({
      ...mockUseChat,
      input: 'Hello',
      handleSubmit,
    });
    
    render(<ChatInterface />);
    
    const textarea = screen.getByPlaceholderText(/send a message/i);
    await user.type(textarea, '{Enter}');
    
    expect(handleSubmit).toHaveBeenCalled();
  });

  it('allows newline on Shift+Enter', async () => {
    const user = userEvent.setup();
    const handleSubmit = vi.fn();
    const handleInputChange = vi.fn();
    (useChat as any).mockReturnValue({
      ...mockUseChat,
      input: 'Hello',
      handleSubmit,
      handleInputChange,
    });
    
    render(<ChatInterface />);
    
    const textarea = screen.getByPlaceholderText(/send a message/i);
    await user.type(textarea, '{Shift>}{Enter}{/Shift}');
    
    expect(handleSubmit).not.toHaveBeenCalled();
  });

  it('displays messages from conversation', () => {
    (useChat as any).mockReturnValue({
      ...mockUseChat,
      messages: [
        { id: '1', role: 'user', content: 'Hello' },
        { id: '2', role: 'assistant', content: 'Hi there!' },
      ],
    });
    
    render(<ChatInterface />);
    
    expect(screen.getByText('Hello')).toBeInTheDocument();
    expect(screen.getByText('Hi there!')).toBeInTheDocument();
  });
});
```

```typescript
// tests/unit/components/message.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Message } from '@/components/chat/message';

describe('Message', () => {
  it('renders user message with correct styling', () => {
    render(<Message role="user" content="Hello" />);
    
    const message = screen.getByText('Hello');
    expect(message).toBeInTheDocument();
  });

  it('renders assistant message with different styling', () => {
    render(<Message role="assistant" content="Hi there!" />);
    
    expect(screen.getByText('Hi there!')).toBeInTheDocument();
  });

  it('renders markdown content correctly', () => {
    render(<Message role="assistant" content="Here is **bold** and *italic*" />);
    
    expect(screen.getByText('bold')).toBeInTheDocument();
    expect(screen.getByText('italic')).toBeInTheDocument();
  });

  it('renders code blocks with syntax highlighting', () => {
    const code = '```typescript\nconst x = 1;\n```';
    render(<Message role="assistant" content={code} />);
    
    expect(screen.getByText(/const/)).toBeInTheDocument();
  });

  it('shows copy button for code blocks on hover', async () => {
    const code = '```javascript\nconsole.log("hello");\n```';
    render(<Message role="assistant" content={code} />);
    
    // Copy button should exist in the DOM
    const copyButton = document.querySelector('[aria-label="Copy code"]') || 
                       document.querySelector('button');
    expect(copyButton).toBeTruthy();
  });

  it('copies content to clipboard when copy button clicked', async () => {
    const user = userEvent.setup();
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: { writeText },
    });
    
    render(<Message role="assistant" content="Copy this text" />);
    
    const copyButton = screen.getByRole('button', { name: /copy/i });
    await user.click(copyButton);
    
    expect(writeText).toHaveBeenCalledWith('Copy this text');
  });

  it('shows streaming cursor when streaming', () => {
    render(<Message role="assistant" content="Generating" isStreaming />);
    
    const cursor = document.querySelector('.animate-pulse');
    expect(cursor).toBeTruthy();
  });

  it('shows regenerate button for assistant messages', () => {
    const onRegenerate = vi.fn();
    render(
      <Message role="assistant" content="Response" onRegenerate={onRegenerate} />
    );
    
    expect(screen.getByRole('button', { name: /regenerate/i })).toBeInTheDocument();
  });

  it('does not show regenerate button for user messages', () => {
    render(<Message role="user" content="Question" />);
    
    expect(screen.queryByRole('button', { name: /regenerate/i })).not.toBeInTheDocument();
  });
});
```

```typescript
// tests/unit/lib/rate-limit.test.ts
import { describe, it, expect, vi } from 'vitest';
import { rateLimit } from '@/lib/rate-limit';

// Mock Upstash
vi.mock('@upstash/ratelimit', () => ({
  Ratelimit: vi.fn().mockImplementation(() => ({
    limit: vi.fn().mockResolvedValue({
      success: true,
      limit: 100,
      remaining: 99,
      reset: Date.now() + 60000,
    }),
  })),
}));

describe('Rate Limiter', () => {
  it('allows requests under limit', async () => {
    const result = await rateLimit('user-123');
    
    expect(result.success).toBe(true);
    expect(result.remaining).toBe(99);
  });

  it('returns rate limit headers', async () => {
    const result = await rateLimit('user-123');
    
    expect(result.limit).toBe(100);
    expect(result.reset).toBeDefined();
  });
});
```

### Integration Tests

```typescript
// tests/integration/chat-flow.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ChatPage from '@/app/(chat)/page';
import { server } from '../mocks/server';
import { http, HttpResponse } from 'msw';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('Chat Flow Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('loads and displays new chat interface', async () => {
    render(<ChatPage />, { wrapper: createWrapper() });
    
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/send a message/i)).toBeInTheDocument();
    });
  });

  it('handles rate limit exceeded gracefully', async () => {
    server.use(
      http.post('/api/chat', () => {
        return new HttpResponse(null, {
          status: 429,
          headers: {
            'X-RateLimit-Remaining': '0',
            'Retry-After': '60',
          },
        });
      })
    );

    render(<ChatPage />, { wrapper: createWrapper() });
    
    const textarea = screen.getByPlaceholderText(/send a message/i);
    await userEvent.type(textarea, 'Hello');
    await userEvent.click(screen.getByRole('button', { name: /send/i }));
    
    await waitFor(() => {
      expect(screen.getByText(/rate limit/i)).toBeInTheDocument();
    });
  });

  it('displays usage statistics', async () => {
    render(<ChatPage />, { wrapper: createWrapper() });
    
    // Open usage panel/stats
    const usageButton = screen.queryByRole('button', { name: /usage/i });
    if (usageButton) {
      await userEvent.click(usageButton);
      
      await waitFor(() => {
        expect(screen.getByText(/tokens/i)).toBeInTheDocument();
      });
    }
  });
});
```

```typescript
// tests/integration/document-upload.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import DocumentUpload from '@/components/documents/upload';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('Document Upload Integration', () => {
  it('uploads document and shows success', async () => {
    const user = userEvent.setup();
    
    render(<DocumentUpload />, { wrapper: createWrapper() });
    
    const file = new File(['test content'], 'test.txt', { type: 'text/plain' });
    const input = screen.getByLabelText(/upload/i);
    
    await user.upload(input, file);
    
    await waitFor(() => {
      expect(screen.getByText(/indexed/i)).toBeInTheDocument();
    });
  });

  it('shows progress during upload', async () => {
    const user = userEvent.setup();
    
    render(<DocumentUpload />, { wrapper: createWrapper() });
    
    const file = new File(['test content'], 'test.txt', { type: 'text/plain' });
    const input = screen.getByLabelText(/upload/i);
    
    await user.upload(input, file);
    
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });
});
```

```typescript
// tests/integration/conversation-history.test.tsx
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ConversationList from '@/components/chat/conversation-list';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('Conversation History', () => {
  it('loads and displays conversations', async () => {
    render(<ConversationList />, { wrapper: createWrapper() });
    
    await waitFor(() => {
      expect(screen.getByText('Test conversation')).toBeInTheDocument();
    });
  });

  it('navigates to conversation on click', async () => {
    const user = userEvent.setup();
    
    render(<ConversationList />, { wrapper: createWrapper() });
    
    await waitFor(() => {
      expect(screen.getByText('Test conversation')).toBeInTheDocument();
    });
    
    await user.click(screen.getByText('Test conversation'));
    
    // Navigation would be triggered
  });
});
```

### API Route Tests

```typescript
// tests/api/chat.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '@/app/api/chat/route';
import { NextRequest } from 'next/server';

// Mock dependencies
vi.mock('@/lib/auth', () => ({
  auth: vi.fn().mockResolvedValue({ user: { id: 'user-123' } }),
}));

vi.mock('@/lib/rate-limit', () => ({
  rateLimit: vi.fn().mockResolvedValue({ success: true, remaining: 99 }),
}));

vi.mock('@/lib/prisma', () => ({
  prisma: {
    conversation: {
      create: vi.fn().mockResolvedValue({ id: 'conv-123' }),
      update: vi.fn().mockResolvedValue({ id: 'conv-123' }),
    },
    message: {
      create: vi.fn().mockResolvedValue({ id: 'msg-123' }),
    },
    usage: {
      create: vi.fn().mockResolvedValue({ id: 'usage-123' }),
    },
  },
}));

vi.mock('ai', () => ({
  streamText: vi.fn().mockReturnValue({
    toDataStreamResponse: vi.fn().mockReturnValue(
      new Response('stream', { headers: { 'X-Conversation-Id': 'conv-123' } })
    ),
  }),
  convertToCoreMessages: vi.fn((msgs) => msgs),
}));

describe('Chat API Route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when not authenticated', async () => {
    const { auth } = await import('@/lib/auth');
    (auth as any).mockResolvedValueOnce(null);
    
    const request = new NextRequest('http://localhost/api/chat', {
      method: 'POST',
      body: JSON.stringify({ messages: [{ role: 'user', content: 'Hello' }] }),
    });
    
    const response = await POST(request);
    
    expect(response.status).toBe(401);
  });

  it('returns 429 when rate limited', async () => {
    const { rateLimit } = await import('@/lib/rate-limit');
    (rateLimit as any).mockResolvedValueOnce({ success: false, remaining: 0 });
    
    const request = new NextRequest('http://localhost/api/chat', {
      method: 'POST',
      body: JSON.stringify({ messages: [{ role: 'user', content: 'Hello' }] }),
    });
    
    const response = await POST(request);
    
    expect(response.status).toBe(429);
  });

  it('returns 400 for invalid model', async () => {
    const request = new NextRequest('http://localhost/api/chat', {
      method: 'POST',
      body: JSON.stringify({
        messages: [{ role: 'user', content: 'Hello' }],
        model: 'invalid-model',
      }),
    });
    
    const response = await POST(request);
    
    expect(response.status).toBe(400);
  });

  it('validates message format with Zod', async () => {
    const request = new NextRequest('http://localhost/api/chat', {
      method: 'POST',
      body: JSON.stringify({
        messages: [{ role: 'invalid', content: 'Hello' }],
      }),
    });
    
    const response = await POST(request);
    
    expect(response.status).toBe(400);
  });

  it('creates conversation for new chat', async () => {
    const { prisma } = await import('@/lib/prisma');
    
    const request = new NextRequest('http://localhost/api/chat', {
      method: 'POST',
      body: JSON.stringify({
        messages: [{ role: 'user', content: 'Hello' }],
        model: 'gpt-4o-mini',
      }),
    });
    
    await POST(request);
    
    expect(prisma.conversation.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        userId: 'user-123',
        title: 'Hello',
      }),
    });
  });

  it('updates existing conversation', async () => {
    const { prisma } = await import('@/lib/prisma');
    
    const request = new NextRequest('http://localhost/api/chat', {
      method: 'POST',
      body: JSON.stringify({
        messages: [{ role: 'user', content: 'Hello' }],
        model: 'gpt-4o-mini',
        conversationId: 'existing-conv',
      }),
    });
    
    await POST(request);
    
    expect(prisma.conversation.update).toHaveBeenCalledWith({
      where: { id: 'existing-conv' },
      data: expect.objectContaining({ updatedAt: expect.any(Date) }),
    });
  });

  it('returns streaming response with conversation ID header', async () => {
    const request = new NextRequest('http://localhost/api/chat', {
      method: 'POST',
      body: JSON.stringify({
        messages: [{ role: 'user', content: 'Hello' }],
        model: 'gpt-4o-mini',
      }),
    });
    
    const response = await POST(request);
    
    expect(response.headers.get('X-Conversation-Id')).toBe('conv-123');
  });
});
```

```typescript
// tests/api/embeddings.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '@/app/api/embeddings/route';
import { NextRequest } from 'next/server';

vi.mock('@/lib/auth', () => ({
  auth: vi.fn().mockResolvedValue({ user: { id: 'user-123' } }),
}));

vi.mock('@/lib/ai/rag', () => ({
  generateEmbedding: vi.fn().mockResolvedValue(new Array(1536).fill(0)),
}));

describe('Embeddings API Route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('generates embedding for text input', async () => {
    const request = new NextRequest('http://localhost/api/embeddings', {
      method: 'POST',
      body: JSON.stringify({ text: 'Test text' }),
    });
    
    const response = await POST(request);
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data.embedding).toHaveLength(1536);
  });

  it('returns 400 for empty text', async () => {
    const request = new NextRequest('http://localhost/api/embeddings', {
      method: 'POST',
      body: JSON.stringify({ text: '' }),
    });
    
    const response = await POST(request);
    
    expect(response.status).toBe(400);
  });

  it('returns 400 for text exceeding limit', async () => {
    const request = new NextRequest('http://localhost/api/embeddings', {
      method: 'POST',
      body: JSON.stringify({ text: 'a'.repeat(100001) }),
    });
    
    const response = await POST(request);
    
    expect(response.status).toBe(400);
  });
});
```

```typescript
// tests/api/documents.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST, GET, DELETE } from '@/app/api/documents/route';
import { NextRequest } from 'next/server';

vi.mock('@/lib/auth', () => ({
  auth: vi.fn().mockResolvedValue({ user: { id: 'user-123' } }),
}));

vi.mock('@/lib/prisma', () => ({
  prisma: {
    document: {
      findMany: vi.fn().mockResolvedValue([]),
      create: vi.fn().mockResolvedValue({ id: 'doc-123' }),
      delete: vi.fn().mockResolvedValue({ id: 'doc-123' }),
    },
  },
}));

vi.mock('@/lib/ai/rag', () => ({
  indexDocument: vi.fn().mockResolvedValue(undefined),
}));

describe('Documents API Route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET', () => {
    it('returns user documents', async () => {
      const { prisma } = await import('@/lib/prisma');
      (prisma.document.findMany as any).mockResolvedValue([
        { id: 'doc-1', content: 'Test' },
      ]);
      
      const request = new NextRequest('http://localhost/api/documents');
      const response = await GET(request);
      const data = await response.json();
      
      expect(data).toHaveLength(1);
    });
  });

  describe('POST', () => {
    it('indexes document and returns success', async () => {
      const request = new NextRequest('http://localhost/api/documents', {
        method: 'POST',
        body: JSON.stringify({ content: 'Document content' }),
      });
      
      const response = await POST(request);
      
      expect(response.status).toBe(201);
    });

    it('validates content is not empty', async () => {
      const request = new NextRequest('http://localhost/api/documents', {
        method: 'POST',
        body: JSON.stringify({ content: '' }),
      });
      
      const response = await POST(request);
      
      expect(response.status).toBe(400);
    });
  });

  describe('DELETE', () => {
    it('deletes document by id', async () => {
      const request = new NextRequest('http://localhost/api/documents?id=doc-123', {
        method: 'DELETE',
      });
      
      const response = await DELETE(request);
      
      expect(response.status).toBe(200);
    });
  });
});
```

### E2E Tests (Playwright)

```typescript
// tests/e2e/chat.spec.ts
import { test, expect } from '@playwright/test';

test.describe('AI Chat E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login');
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'password');
    await page.click('button[type="submit"]');
    await page.waitForURL('/chat');
  });

  test('sends message and receives streaming response', async ({ page }) => {
    await page.goto('/chat');
    
    // Type message
    await page.fill('textarea[placeholder*="message"]', 'Hello, AI!');
    await page.click('button:has-text("Send")');
    
    // Wait for response to start streaming
    await expect(page.locator('.message-assistant')).toBeVisible({ timeout: 10000 });
    
    // Verify stop button appears during streaming
    await expect(page.locator('button:has-text("Stop")')).toBeVisible();
  });

  test('stops streaming when stop button clicked', async ({ page }) => {
    await page.goto('/chat');
    
    await page.fill('textarea', 'Write a very long story');
    await page.click('button:has-text("Send")');
    
    // Click stop button
    await page.click('button:has-text("Stop")');
    
    // Send button should reappear
    await expect(page.locator('button:has-text("Send")')).toBeVisible();
  });

  test('displays conversation history', async ({ page }) => {
    await page.goto('/chat');
    
    // Send first message
    await page.fill('textarea', 'First question');
    await page.click('button:has-text("Send")');
    await expect(page.locator('.message-assistant').first()).toBeVisible({ timeout: 10000 });
    
    // Send second message
    await page.fill('textarea', 'Second question');
    await page.click('button:has-text("Send")');
    await expect(page.locator('.message-assistant').nth(1)).toBeVisible({ timeout: 10000 });
    
    // Verify both exchanges are visible
    expect(await page.locator('.message-user').count()).toBe(2);
  });

  test('regenerates response', async ({ page }) => {
    await page.goto('/chat');
    
    await page.fill('textarea', 'Tell me a joke');
    await page.click('button:has-text("Send")');
    await expect(page.locator('.message-assistant')).toBeVisible({ timeout: 10000 });
    
    const firstResponse = await page.locator('.message-assistant').textContent();
    
    // Hover and click regenerate
    await page.locator('.message-assistant').hover();
    await page.click('button:has-text("Regenerate")');
    
    // Wait for new response
    await page.waitForTimeout(1000);
    const secondResponse = await page.locator('.message-assistant').textContent();
    
    // Response should change (or at least the regenerate was triggered)
    expect(firstResponse).toBeDefined();
    expect(secondResponse).toBeDefined();
  });

  test('copies message to clipboard', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.goto('/chat');
    
    await page.fill('textarea', 'Give me a code example');
    await page.click('button:has-text("Send")');
    await expect(page.locator('.message-assistant')).toBeVisible({ timeout: 10000 });
    
    // Hover and click copy
    await page.locator('.message-assistant').hover();
    await page.click('button:has-text("Copy")');
    
    // Verify clipboard content
    const clipboardContent = await page.evaluate(() => navigator.clipboard.readText());
    expect(clipboardContent).toBeTruthy();
  });

  test('model selection works', async ({ page }) => {
    await page.goto('/chat');
    
    // Open model selector
    await page.click('[data-testid="model-selector"]');
    
    // Select a different model
    await page.click('text=Claude 3.5 Sonnet');
    
    // Verify selection
    await expect(page.locator('[data-testid="model-selector"]')).toContainText('Claude');
  });

  test('conversation persists and loads', async ({ page }) => {
    await page.goto('/chat');
    
    // Send message
    await page.fill('textarea', 'Remember this message');
    await page.click('button:has-text("Send")');
    await expect(page.locator('.message-assistant')).toBeVisible({ timeout: 10000 });
    
    // Get conversation ID from URL
    const url = page.url();
    const conversationId = url.split('/chat/')[1];
    
    // Navigate away and back
    await page.goto('/');
    await page.goto(`/chat/${conversationId}`);
    
    // Verify message is still there
    await expect(page.locator('text=Remember this message')).toBeVisible();
  });

  test('handles API errors gracefully', async ({ page }) => {
    // Mock API error
    await page.route('/api/chat', (route) => {
      route.fulfill({
        status: 500,
        body: JSON.stringify({ error: 'Internal server error' }),
      });
    });
    
    await page.goto('/chat');
    await page.fill('textarea', 'This will fail');
    await page.click('button:has-text("Send")');
    
    // Error message should be displayed
    await expect(page.locator('.error-message, [role="alert"]')).toBeVisible();
  });

  test('rate limiting feedback is shown', async ({ page }) => {
    await page.route('/api/chat', (route) => {
      route.fulfill({
        status: 429,
        headers: { 'Retry-After': '60' },
      });
    });
    
    await page.goto('/chat');
    await page.fill('textarea', 'Rate limited request');
    await page.click('button:has-text("Send")');
    
    await expect(page.locator('text=/rate limit|too many/i')).toBeVisible();
  });
});

test.describe('Document RAG E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'password');
    await page.click('button[type="submit"]');
  });

  test('uploads document and uses in chat', async ({ page }) => {
    // Navigate to documents
    await page.goto('/dashboard/documents');
    
    // Upload document
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'test.txt',
      mimeType: 'text/plain',
      buffer: Buffer.from('This is test document content about AI.'),
    });
    
    // Wait for upload completion
    await expect(page.locator('text=uploaded successfully')).toBeVisible({ timeout: 30000 });
    
    // Go to chat and enable RAG
    await page.goto('/chat');
    await page.click('[data-testid="rag-toggle"]');
    
    // Ask question about document
    await page.fill('textarea', 'What is in my document about AI?');
    await page.click('button:has-text("Send")');
    
    // Should reference document content
    await expect(page.locator('.message-assistant')).toContainText(/document|AI/i);
  });
});

test.describe('Accessibility', () => {
  test('chat interface is keyboard accessible', async ({ page }) => {
    await page.goto('/chat');
    
    // Tab to input
    await page.keyboard.press('Tab');
    await expect(page.locator('textarea')).toBeFocused();
    
    // Type message
    await page.keyboard.type('Hello');
    
    // Tab to send button
    await page.keyboard.press('Tab');
    await expect(page.locator('button:has-text("Send")')).toBeFocused();
    
    // Press Enter to send
    await page.keyboard.press('Enter');
    
    // Wait for response
    await expect(page.locator('.message-assistant')).toBeVisible({ timeout: 10000 });
  });

  test('has no accessibility violations', async ({ page }) => {
    await page.goto('/chat');
    
    // Inject axe-core
    await page.addScriptTag({ url: 'https://cdnjs.cloudflare.com/ajax/libs/axe-core/4.7.2/axe.min.js' });
    
    const violations = await page.evaluate(async () => {
      const results = await (window as any).axe.run();
      return results.violations;
    });
    
    expect(violations).toEqual([]);
  });

  test('screen reader announces new messages', async ({ page }) => {
    await page.goto('/chat');
    
    // Verify aria-live region exists
    await expect(page.locator('[aria-live="polite"]')).toBeAttached();
    
    // Send message
    await page.fill('textarea', 'Test message');
    await page.click('button:has-text("Send")');
    
    // Verify response appears in accessible region
    await expect(page.locator('.message-assistant[role="article"]')).toBeVisible({ timeout: 10000 });
  });
});

test.describe('Mobile Experience', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('chat is usable on mobile', async ({ page }) => {
    await page.goto('/chat');
    
    // Input should be full width
    const textarea = page.locator('textarea');
    const box = await textarea.boundingBox();
    expect(box?.width).toBeGreaterThan(300);
    
    // Send message
    await page.fill('textarea', 'Mobile test');
    await page.click('button:has-text("Send")');
    
    await expect(page.locator('.message-assistant')).toBeVisible({ timeout: 10000 });
  });

  test('virtual keyboard does not obscure input', async ({ page }) => {
    await page.goto('/chat');
    
    // Focus input (simulates keyboard appearing)
    await page.locator('textarea').focus();
    
    // Input should remain visible
    await expect(page.locator('textarea')).toBeInViewport();
  });
});
```

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
  ],
  use: {
    baseURL: process.env.TEST_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 12'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
```

## Error Handling

### Error Boundary

```typescript
// components/error-boundary.tsx
'use client';

import { Component, ReactNode } from 'react';
import * as Sentry from '@sentry/nextjs';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    Sentry.captureException(error, {
      extra: { componentStack: errorInfo.componentStack },
      tags: { component: 'AI Application' },
    });
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div role="alert" className="flex flex-col items-center justify-center p-8 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
          <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-xl font-semibold text-red-800 dark:text-red-200 mb-2">
            Something went wrong
          </h2>
          <p className="text-red-600 dark:text-red-300 mb-4 text-center max-w-md">
            {this.state.error?.message || 'An unexpected error occurred'}
          </p>
          <Button
            onClick={() => this.setState({ hasError: false })}
            variant="destructive"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Try again
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

### Global Error Page

```typescript
// app/error.tsx
'use client';

import { useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';
import { AlertCircle, Home, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error, {
      tags: { page: 'error-boundary' },
    });
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full text-center">
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-red-100 dark:bg-red-900 rounded-full">
            <AlertCircle className="h-12 w-12 text-red-600 dark:text-red-400" />
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Something went wrong
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          We've been notified and are working on a fix.
        </p>
        
        {error.digest && (
          <p className="text-sm text-gray-500 dark:text-gray-500 mb-6 font-mono">
            Error ID: {error.digest}
          </p>
        )}
        
        <div className="flex justify-center gap-4">
          <Button onClick={reset} variant="default">
            <RefreshCw className="mr-2 h-4 w-4" />
            Try again
          </Button>
          <Button variant="outline" asChild>
            <a href="/">
              <Home className="mr-2 h-4 w-4" />
              Go home
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}
```

### AI-Specific Error Classes

```typescript
// lib/errors/ai-errors.ts
import * as Sentry from '@sentry/nextjs';

export class AIError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = 'AIError';
  }

  toJSON() {
    return {
      error: {
        message: this.message,
        code: this.code,
        details: this.details,
      },
    };
  }
}

// Token limit exceeded
export class TokenLimitError extends AIError {
  constructor(used: number, limit: number) {
    super(
      `Token limit exceeded: ${used} used of ${limit} allowed`,
      'TOKEN_LIMIT_EXCEEDED',
      429,
      { used, limit, remaining: limit - used }
    );
    this.name = 'TokenLimitError';
  }
}

// Rate limit exceeded
export class RateLimitError extends AIError {
  constructor(retryAfter: number) {
    super(
      `Rate limit exceeded. Please try again in ${retryAfter} seconds`,
      'RATE_LIMIT_EXCEEDED',
      429,
      { retryAfter }
    );
    this.name = 'RateLimitError';
  }
}

// Model not available
export class ModelUnavailableError extends AIError {
  constructor(model: string, fallback?: string) {
    super(
      `Model ${model} is currently unavailable`,
      'MODEL_UNAVAILABLE',
      503,
      { model, fallback }
    );
    this.name = 'ModelUnavailableError';
  }
}

// Content moderation rejection
export class ContentModerationError extends AIError {
  constructor(category: string) {
    super(
      'Your message was flagged by content moderation',
      'CONTENT_MODERATION',
      400,
      { category }
    );
    this.name = 'ContentModerationError';
  }
}

// Streaming error
export class StreamingError extends AIError {
  constructor(phase: 'start' | 'middle' | 'end') {
    super(
      `Streaming failed during ${phase} phase`,
      'STREAMING_ERROR',
      500,
      { phase }
    );
    this.name = 'StreamingError';
  }
}

// Provider API error
export class ProviderAPIError extends AIError {
  constructor(provider: string, originalError: string) {
    super(
      `Error from ${provider}: ${originalError}`,
      'PROVIDER_ERROR',
      502,
      { provider, originalError }
    );
    this.name = 'ProviderAPIError';
  }
}

// API error handler
export function handleAIError(error: unknown): Response {
  console.error('[AI Error]', error);

  if (error instanceof AIError) {
    // Don't report client errors to Sentry
    if (error.statusCode >= 500) {
      Sentry.captureException(error);
    }
    return Response.json(error.toJSON(), { status: error.statusCode });
  }

  // Handle provider-specific errors
  if (error instanceof Error) {
    if (error.message.includes('rate limit')) {
      return Response.json(
        new RateLimitError(60).toJSON(),
        { status: 429 }
      );
    }
    
    if (error.message.includes('context length')) {
      return Response.json(
        new TokenLimitError(0, 0).toJSON(),
        { status: 400 }
      );
    }

    Sentry.captureException(error);
    return Response.json(
      { error: { message: 'Internal server error', code: 'INTERNAL_ERROR' } },
      { status: 500 }
    );
  }

  return Response.json(
    { error: { message: 'Unknown error', code: 'UNKNOWN_ERROR' } },
    { status: 500 }
  );
}
```

### React Query Error Handling for AI

```typescript
// lib/query-client.ts
import { QueryClient, QueryCache, MutationCache } from '@tanstack/react-query';
import { toast } from 'sonner';
import { AIError, RateLimitError } from './errors/ai-errors';

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error, query) => {
      // Only show toast for user-initiated queries
      if (query.meta?.showErrorToast !== false) {
        const message = error instanceof AIError 
          ? error.message 
          : 'Failed to fetch data';
        toast.error(message);
      }
    },
  }),
  mutationCache: new MutationCache({
    onError: (error) => {
      if (error instanceof RateLimitError) {
        toast.error(error.message, {
          duration: 10000,
          action: {
            label: 'Upgrade',
            onClick: () => window.location.href = '/settings/billing',
          },
        });
      } else if (error instanceof AIError) {
        toast.error(error.message);
      } else {
        toast.error('An error occurred');
      }
    },
  }),
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        // Don't retry on client errors
        if (error instanceof AIError && error.statusCode < 500) {
          return false;
        }
        // Retry up to 3 times for server errors
        return failureCount < 3;
      },
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
    mutations: {
      retry: (failureCount, error) => {
        // Only retry server errors once
        if (error instanceof AIError && error.statusCode >= 500) {
          return failureCount < 1;
        }
        return false;
      },
    },
  },
});
```

### Streaming Error Recovery

```typescript
// hooks/use-chat-with-recovery.ts
'use client';

import { useChat as useAIChat } from 'ai/react';
import { useState, useCallback } from 'react';
import { toast } from 'sonner';

interface UseChatWithRecoveryOptions {
  conversationId?: string;
  model?: string;
  onError?: (error: Error) => void;
}

export function useChatWithRecovery(options: UseChatWithRecoveryOptions) {
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;

  const chat = useAIChat({
    api: '/api/chat',
    id: options.conversationId,
    body: {
      conversationId: options.conversationId,
      model: options.model || 'gpt-4o-mini',
    },
    onError: (error) => {
      console.error('Chat error:', error);
      
      if (retryCount < maxRetries && !error.message.includes('rate limit')) {
        setRetryCount((c) => c + 1);
        toast.error(`Connection lost. Retrying... (${retryCount + 1}/${maxRetries})`);
        
        // Auto-retry after delay
        setTimeout(() => {
          chat.reload();
        }, 1000 * Math.pow(2, retryCount));
      } else {
        options.onError?.(error);
        toast.error(error.message || 'Failed to send message', {
          action: {
            label: 'Retry',
            onClick: () => chat.reload(),
          },
        });
      }
    },
    onFinish: () => {
      setRetryCount(0); // Reset on success
    },
  });

  const resetRetries = useCallback(() => {
    setRetryCount(0);
  }, []);

  return {
    ...chat,
    retryCount,
    resetRetries,
    canRetry: retryCount < maxRetries,
  };
}
```

## Accessibility

### Accessibility Standards

This recipe implements WCAG 2.1 Level AA compliance with AI-specific considerations:

| Criterion | Implementation |
|-----------|---------------|
| 1.1.1 Non-text Content | All icons have labels, code blocks have descriptions |
| 1.3.1 Info and Relationships | Chat messages use semantic HTML, roles defined |
| 1.3.2 Meaningful Sequence | Messages ordered chronologically, DOM order matches visual |
| 1.4.1 Use of Color | Status indicators have icons + text, not just color |
| 1.4.3 Contrast | 4.5:1 minimum, code blocks maintain readability |
| 2.1.1 Keyboard | Full keyboard navigation for chat, model selection |
| 2.1.2 No Keyboard Trap | Focus escapes modals, dialogs properly |
| 2.4.1 Bypass Blocks | Skip to chat input, skip to messages |
| 2.4.4 Link Purpose | Clear action buttons, descriptive labels |
| 2.4.7 Focus Visible | Custom focus rings on all interactive elements |
| 3.2.2 On Input | No unexpected context changes on input |
| 4.1.2 Name, Role, Value | ARIA labels on custom components |
| 4.1.3 Status Messages | Streaming responses announced, errors announced |

### Skip Links for Chat

```typescript
// components/chat/skip-links.tsx
export function ChatSkipLinks() {
  return (
    <div className="sr-only focus-within:not-sr-only">
      <a
        href="#chat-input"
        className="absolute top-4 left-4 z-50 px-4 py-2 bg-primary text-primary-foreground rounded-lg focus:outline-none focus:ring-2"
      >
        Skip to chat input
      </a>
      <a
        href="#messages"
        className="absolute top-4 left-48 z-50 px-4 py-2 bg-primary text-primary-foreground rounded-lg focus:outline-none focus:ring-2"
      >
        Skip to messages
      </a>
    </div>
  );
}
```

### Accessible Chat Message

```typescript
// components/chat/accessible-message.tsx
'use client';

import { forwardRef } from 'react';
import { Bot, User } from 'lucide-react';

interface AccessibleMessageProps {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: Date;
  isStreaming?: boolean;
}

export const AccessibleMessage = forwardRef<HTMLDivElement, AccessibleMessageProps>(
  ({ role, content, timestamp, isStreaming }, ref) => {
    const roleLabel = role === 'user' ? 'You' : 'AI Assistant';
    const timeString = timestamp?.toLocaleTimeString();
    
    return (
      <article
        ref={ref}
        role="article"
        aria-label={`${roleLabel} message${timeString ? ` at ${timeString}` : ''}`}
        className={cn(
          'group flex gap-4 p-4',
          role === 'assistant' && 'bg-muted/50'
        )}
      >
        <div
          className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-primary/10"
          aria-hidden="true"
        >
          {role === 'user' ? (
            <User className="h-4 w-4" />
          ) : (
            <Bot className="h-4 w-4" />
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2 mb-1">
            <span className="font-medium text-sm">{roleLabel}</span>
            {timestamp && (
              <time
                dateTime={timestamp.toISOString()}
                className="text-xs text-muted-foreground"
              >
                {timeString}
              </time>
            )}
          </div>
          
          <div 
            className="prose prose-sm max-w-none dark:prose-invert"
            aria-busy={isStreaming}
          >
            {content}
            {isStreaming && (
              <span 
                className="inline-block w-2 h-4 ml-1 bg-primary animate-pulse"
                aria-label="Generating response"
              />
            )}
          </div>
        </div>
      </article>
    );
  }
);

AccessibleMessage.displayName = 'AccessibleMessage';
```

### Live Region for Streaming

```typescript
// components/chat/streaming-announcer.tsx
'use client';

import { useEffect, useRef, useState } from 'react';

interface StreamingAnnouncerProps {
  isStreaming: boolean;
  messageCount: number;
}

export function StreamingAnnouncer({ isStreaming, messageCount }: StreamingAnnouncerProps) {
  const [announcement, setAnnouncement] = useState('');
  const prevMessageCount = useRef(messageCount);
  const prevStreaming = useRef(isStreaming);

  useEffect(() => {
    // Announce when streaming starts
    if (isStreaming && !prevStreaming.current) {
      setAnnouncement('AI is generating a response...');
    }
    
    // Announce when streaming completes
    if (!isStreaming && prevStreaming.current) {
      setAnnouncement('AI response complete.');
    }
    
    // Announce new message
    if (messageCount > prevMessageCount.current) {
      // Clear and re-set to trigger announcement
      setAnnouncement('');
      setTimeout(() => {
        setAnnouncement('New message received.');
      }, 100);
    }
    
    prevStreaming.current = isStreaming;
    prevMessageCount.current = messageCount;
  }, [isStreaming, messageCount]);

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="sr-only"
    >
      {announcement}
    </div>
  );
}
```

### Keyboard Navigation

```typescript
// hooks/use-chat-keyboard.ts
'use client';

import { useCallback, useEffect, useRef } from 'react';

interface UseChatKeyboardOptions {
  onSend: () => void;
  onStop: () => void;
  onRegenerate: () => void;
  onNewChat: () => void;
  isLoading: boolean;
}

export function useChatKeyboard({
  onSend,
  onStop,
  onRegenerate,
  onNewChat,
  isLoading,
}: UseChatKeyboardOptions) {
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Cmd/Ctrl + Enter to send
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      if (!isLoading) {
        onSend();
      } else {
        onStop();
      }
    }
    
    // Cmd/Ctrl + Shift + R to regenerate
    if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'r') {
      e.preventDefault();
      onRegenerate();
    }
    
    // Cmd/Ctrl + Shift + N for new chat
    if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'n') {
      e.preventDefault();
      onNewChat();
    }
    
    // Escape to focus input
    if (e.key === 'Escape') {
      e.preventDefault();
      inputRef.current?.focus();
    }
  }, [isLoading, onSend, onStop, onRegenerate, onNewChat]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return { inputRef };
}
```

### Focus Management for Modals

```typescript
// components/chat/model-selector-dialog.tsx
'use client';

import { useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface ModelSelectorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  models: { id: string; name: string }[];
  selectedModel: string;
  onSelectModel: (id: string) => void;
}

export function ModelSelectorDialog({
  open,
  onOpenChange,
  models,
  selectedModel,
  onSelectModel,
}: ModelSelectorDialogProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const selectedIndex = models.findIndex((m) => m.id === selectedModel);

  // Focus selected model on open
  useEffect(() => {
    if (open && listRef.current) {
      const selectedButton = listRef.current.querySelector(
        `[data-model="${selectedModel}"]`
      ) as HTMLButtonElement;
      selectedButton?.focus();
    }
  }, [open, selectedModel]);

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    let newIndex = index;
    
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      newIndex = Math.min(index + 1, models.length - 1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      newIndex = Math.max(index - 1, 0);
    } else if (e.key === 'Home') {
      e.preventDefault();
      newIndex = 0;
    } else if (e.key === 'End') {
      e.preventDefault();
      newIndex = models.length - 1;
    }
    
    if (newIndex !== index) {
      const button = listRef.current?.querySelector(
        `[data-model="${models[newIndex].id}"]`
      ) as HTMLButtonElement;
      button?.focus();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent aria-describedby="model-description">
        <DialogHeader>
          <DialogTitle>Select AI Model</DialogTitle>
        </DialogHeader>
        <p id="model-description" className="text-sm text-muted-foreground">
          Choose an AI model for your conversation. Different models have different capabilities.
        </p>
        <div
          ref={listRef}
          role="listbox"
          aria-label="AI Models"
          aria-activedescendant={selectedModel}
          className="space-y-2"
        >
          {models.map((model, index) => (
            <button
              key={model.id}
              id={model.id}
              data-model={model.id}
              role="option"
              aria-selected={model.id === selectedModel}
              onClick={() => {
                onSelectModel(model.id);
                onOpenChange(false);
              }}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className={cn(
                'w-full p-3 text-left rounded-lg border-2 transition-colors',
                model.id === selectedModel
                  ? 'border-primary bg-primary/10'
                  : 'border-transparent hover:bg-muted'
              )}
            >
              {model.name}
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

## Security

### Input Validation with Zod

```typescript
// lib/validations/chat.ts
import { z } from 'zod';

// Message validation
export const messageSchema = z.object({
  role: z.enum(['user', 'assistant', 'system']),
  content: z.string()
    .min(1, 'Message cannot be empty')
    .max(32000, 'Message too long (max 32,000 characters)')
    .refine(
      (val) => !containsPromptInjection(val),
      'Message contains potentially harmful content'
    ),
});

// Chat request validation
export const chatRequestSchema = z.object({
  messages: z.array(messageSchema)
    .min(1, 'At least one message required')
    .max(100, 'Too many messages in conversation'),
  model: z.string()
    .regex(/^[a-z0-9-]+$/, 'Invalid model ID'),
  conversationId: z.string().cuid().optional(),
  useRAG: z.boolean().default(false),
  temperature: z.number().min(0).max(2).default(0.7),
  maxTokens: z.number().min(1).max(16384).optional(),
});

// Document upload validation
export const documentUploadSchema = z.object({
  content: z.string()
    .min(10, 'Document too short')
    .max(1000000, 'Document too large (max 1MB of text)'),
  metadata: z.object({
    filename: z.string().max(255),
    mimeType: z.string().max(100),
    collectionId: z.string().cuid().optional(),
  }).optional(),
});

// Prompt injection detection
function containsPromptInjection(text: string): boolean {
  const patterns = [
    /ignore\s+(previous|above|all)\s+instructions/i,
    /disregard\s+(previous|above|all)/i,
    /you\s+are\s+now\s+a/i,
    /new\s+instructions:/i,
    /system\s*:\s*you/i,
    /\[INST\]/i,
    /<\|im_start\|>/i,
    /###\s*instruction/i,
  ];
  
  return patterns.some((pattern) => pattern.test(text));
}

export type ChatRequest = z.infer<typeof chatRequestSchema>;
export type DocumentUpload = z.infer<typeof documentUploadSchema>;
```

### Token Usage Limits

```typescript
// lib/usage-limits.ts
import { prisma } from '@/lib/prisma';
import { TokenLimitError } from './errors/ai-errors';

interface UsageLimits {
  daily: number;
  monthly: number;
  perRequest: number;
}

const PLAN_LIMITS: Record<string, UsageLimits> = {
  free: {
    daily: 10000,
    monthly: 100000,
    perRequest: 4096,
  },
  pro: {
    daily: 100000,
    monthly: 2000000,
    perRequest: 16384,
  },
  enterprise: {
    daily: Infinity,
    monthly: Infinity,
    perRequest: 32768,
  },
};

export async function checkUsageLimits(
  userId: string,
  plan: string = 'free',
  requestedTokens: number = 0
): Promise<{ allowed: boolean; remaining: number }> {
  const limits = PLAN_LIMITS[plan] || PLAN_LIMITS.free;
  
  // Check per-request limit
  if (requestedTokens > limits.perRequest) {
    throw new TokenLimitError(requestedTokens, limits.perRequest);
  }
  
  // Get daily usage
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const dailyUsage = await prisma.usage.aggregate({
    where: {
      userId,
      createdAt: { gte: today },
    },
    _sum: { totalTokens: true },
  });
  
  const usedToday = dailyUsage._sum.totalTokens || 0;
  
  if (usedToday + requestedTokens > limits.daily) {
    throw new TokenLimitError(usedToday + requestedTokens, limits.daily);
  }
  
  // Get monthly usage
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  
  const monthlyUsage = await prisma.usage.aggregate({
    where: {
      userId,
      createdAt: { gte: monthStart },
    },
    _sum: { totalTokens: true },
  });
  
  const usedThisMonth = monthlyUsage._sum.totalTokens || 0;
  
  if (usedThisMonth + requestedTokens > limits.monthly) {
    throw new TokenLimitError(usedThisMonth + requestedTokens, limits.monthly);
  }
  
  return {
    allowed: true,
    remaining: Math.min(
      limits.daily - usedToday,
      limits.monthly - usedThisMonth
    ),
  };
}

// Estimate tokens before sending
export function estimateTokens(text: string): number {
  // Rough estimation: ~4 characters per token for English
  return Math.ceil(text.length / 4);
}
```

### Rate Limiting for AI Endpoints

```typescript
// lib/ai-rate-limit.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { RateLimitError } from './errors/ai-errors';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL!,
  token: process.env.UPSTASH_REDIS_TOKEN!,
});

// Different rate limiters for different operations
export const aiRateLimiters = {
  // Chat completions - higher limit for streaming
  chat: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(30, '1 m'),
    prefix: 'ratelimit:ai:chat',
    analytics: true,
  }),
  
  // Embeddings - lower limit, computationally expensive
  embeddings: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(60, '1 m'),
    prefix: 'ratelimit:ai:embeddings',
    analytics: true,
  }),
  
  // Image generation - very limited
  imageGen: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, '1 h'),
    prefix: 'ratelimit:ai:image',
    analytics: true,
  }),
  
  // Document indexing - moderate limit
  indexing: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, '1 m'),
    prefix: 'ratelimit:ai:index',
    analytics: true,
  }),
};

export async function checkAIRateLimit(
  userId: string,
  operation: keyof typeof aiRateLimiters
): Promise<void> {
  const limiter = aiRateLimiters[operation];
  const { success, reset } = await limiter.limit(userId);
  
  if (!success) {
    const retryAfter = Math.ceil((reset - Date.now()) / 1000);
    throw new RateLimitError(retryAfter);
  }
}
```

### Content Moderation

```typescript
// lib/moderation.ts
import { openai } from './ai/providers';
import { ContentModerationError } from './errors/ai-errors';

interface ModerationResult {
  flagged: boolean;
  categories: Record<string, boolean>;
  scores: Record<string, number>;
}

export async function moderateContent(text: string): Promise<ModerationResult> {
  const response = await fetch('https://api.openai.com/v1/moderations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({ input: text }),
  });
  
  if (!response.ok) {
    console.error('Moderation API error:', await response.text());
    // Fail open - allow content if moderation fails
    return { flagged: false, categories: {}, scores: {} };
  }
  
  const data = await response.json();
  const result = data.results[0];
  
  return {
    flagged: result.flagged,
    categories: result.categories,
    scores: result.category_scores,
  };
}

export async function validateAndModerate(
  content: string,
  options: { strict?: boolean } = {}
): Promise<void> {
  const result = await moderateContent(content);
  
  if (result.flagged) {
    const flaggedCategory = Object.entries(result.categories)
      .find(([_, flagged]) => flagged)?.[0] || 'unknown';
    
    throw new ContentModerationError(flaggedCategory);
  }
  
  // In strict mode, also check for borderline content
  if (options.strict) {
    const highScores = Object.entries(result.scores)
      .filter(([_, score]) => score > 0.5);
    
    if (highScores.length > 0) {
      throw new ContentModerationError('borderline-content');
    }
  }
}
```

### Security Headers Configuration

```typescript
// next.config.js
const ContentSecurityPolicy = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline';
  style-src 'self' 'unsafe-inline';
  img-src 'self' blob: data: https://oaidalleapiprodscus.blob.core.windows.net;
  font-src 'self';
  connect-src 'self' 
    https://api.openai.com 
    https://api.anthropic.com 
    https://generativelanguage.googleapis.com
    https://*.sentry.io;
  frame-ancestors 'none';
  base-uri 'self';
  form-action 'self';
`;

const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: ContentSecurityPolicy.replace(/\s{2,}/g, ' ').trim(),
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block',
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=31536000; includeSubDomains',
  },
];

module.exports = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
};
```

### API Key Security

```typescript
// lib/api-key-validation.ts
import { createHash, timingSafeEqual } from 'crypto';
import { prisma } from '@/lib/prisma';

// Hash API keys before storing
export function hashApiKey(key: string): string {
  return createHash('sha256').update(key).digest('hex');
}

// Validate API key with timing-safe comparison
export async function validateApiKey(key: string): Promise<{
  valid: boolean;
  userId?: string;
  scopes?: string[];
}> {
  const hashedKey = hashApiKey(key);
  
  const apiKey = await prisma.apiKey.findFirst({
    where: {
      hashedKey,
      revokedAt: null,
      OR: [
        { expiresAt: null },
        { expiresAt: { gt: new Date() } },
      ],
    },
    include: {
      user: {
        select: { id: true },
      },
    },
  });
  
  if (!apiKey) {
    return { valid: false };
  }
  
  // Update last used
  await prisma.apiKey.update({
    where: { id: apiKey.id },
    data: { lastUsedAt: new Date() },
  });
  
  return {
    valid: true,
    userId: apiKey.user.id,
    scopes: apiKey.scopes as string[],
  };
}

// Generate secure API key
export function generateApiKey(): { key: string; prefix: string } {
  const bytes = require('crypto').randomBytes(32);
  const key = bytes.toString('base64url');
  const prefix = key.slice(0, 8);
  
  return {
    key: `sk_${key}`,
    prefix: `sk_${prefix}...`,
  };
}
```

## Performance

### Streaming Response Optimization

```typescript
// lib/ai/streaming.ts
import { StreamingTextResponse } from 'ai';

// Custom streaming with backpressure handling
export function createOptimizedStream(
  source: AsyncIterable<string>,
  options: {
    onChunk?: (chunk: string) => void;
    onComplete?: (fullText: string) => void;
  } = {}
): ReadableStream {
  let fullText = '';
  
  return new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      
      try {
        for await (const chunk of source) {
          fullText += chunk;
          options.onChunk?.(chunk);
          
          // Use 0 prefix for text chunks (Vercel AI SDK format)
          controller.enqueue(encoder.encode(`0:${JSON.stringify(chunk)}\n`));
        }
        
        options.onComplete?.(fullText);
        controller.close();
      } catch (error) {
        controller.error(error);
      }
    },
  });
}

// Response caching for common queries
import { LRUCache } from 'lru-cache';

const responseCache = new LRUCache<string, string>({
  max: 1000,
  ttl: 1000 * 60 * 60, // 1 hour
});

export function getCachedResponse(
  messages: string,
  model: string
): string | undefined {
  const key = createHash('sha256')
    .update(`${model}:${messages}`)
    .digest('hex');
  
  return responseCache.get(key);
}

export function setCachedResponse(
  messages: string,
  model: string,
  response: string
): void {
  const key = createHash('sha256')
    .update(`${model}:${messages}`)
    .digest('hex');
  
  responseCache.set(key, response);
}
```

### React Query Optimization

```typescript
// hooks/use-conversations.ts
import { useQuery, useInfiniteQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/query-client';

// Optimized conversation list with infinite loading
export function useConversations() {
  return useInfiniteQuery({
    queryKey: ['conversations'],
    queryFn: async ({ pageParam = 0 }) => {
      const response = await fetch(`/api/conversations?offset=${pageParam}&limit=20`);
      return response.json();
    },
    getNextPageParam: (lastPage, pages) => {
      if (lastPage.length < 20) return undefined;
      return pages.length * 20;
    },
    staleTime: 30 * 1000, // 30 seconds
  });
}

// Optimistic updates for new messages
export function useSendMessage(conversationId: string) {
  return useMutation({
    mutationFn: async (content: string) => {
      const response = await fetch('/api/chat', {
        method: 'POST',
        body: JSON.stringify({ conversationId, content }),
      });
      return response.json();
    },
    onMutate: async (content) => {
      // Cancel outgoing fetches
      await queryClient.cancelQueries({ queryKey: ['conversation', conversationId] });
      
      // Snapshot previous value
      const previous = queryClient.getQueryData(['conversation', conversationId]);
      
      // Optimistically add message
      queryClient.setQueryData(['conversation', conversationId], (old: any) => ({
        ...old,
        messages: [...old.messages, { role: 'user', content, id: 'temp' }],
      }));
      
      return { previous };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      queryClient.setQueryData(['conversation', conversationId], context?.previous);
    },
    onSettled: () => {
      // Refetch after mutation
      queryClient.invalidateQueries({ queryKey: ['conversation', conversationId] });
    },
  });
}
```

### Embedding Caching

```typescript
// lib/ai/embedding-cache.ts
import { Redis } from '@upstash/redis';
import { createHash } from 'crypto';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL!,
  token: process.env.UPSTASH_REDIS_TOKEN!,
});

const EMBEDDING_CACHE_TTL = 60 * 60 * 24 * 7; // 7 days

export async function getCachedEmbedding(text: string): Promise<number[] | null> {
  const key = `embedding:${createHash('sha256').update(text).digest('hex')}`;
  const cached = await redis.get<number[]>(key);
  return cached;
}

export async function setCachedEmbedding(text: string, embedding: number[]): Promise<void> {
  const key = `embedding:${createHash('sha256').update(text).digest('hex')}`;
  await redis.setex(key, EMBEDDING_CACHE_TTL, embedding);
}

// Batch embedding with caching
export async function getEmbeddingsWithCache(
  texts: string[],
  generateFn: (texts: string[]) => Promise<number[][]>
): Promise<number[][]> {
  const results: (number[] | null)[] = await Promise.all(
    texts.map((text) => getCachedEmbedding(text))
  );
  
  const uncachedIndices: number[] = [];
  const uncachedTexts: string[] = [];
  
  results.forEach((result, i) => {
    if (!result) {
      uncachedIndices.push(i);
      uncachedTexts.push(texts[i]);
    }
  });
  
  if (uncachedTexts.length > 0) {
    const newEmbeddings = await generateFn(uncachedTexts);
    
    await Promise.all(
      uncachedTexts.map((text, i) => 
        setCachedEmbedding(text, newEmbeddings[i])
      )
    );
    
    uncachedIndices.forEach((originalIndex, i) => {
      results[originalIndex] = newEmbeddings[i];
    });
  }
  
  return results as number[][];
}
```

### Dynamic Imports

```typescript
// Lazy load heavy AI components
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

// Only load syntax highlighter when needed
const CodeBlock = dynamic(
  () => import('@/components/chat/code-block'),
  {
    loading: () => <Skeleton className="h-32 w-full" />,
    ssr: false,
  }
);

// Lazy load markdown renderer
const MarkdownRenderer = dynamic(
  () => import('@/components/chat/markdown-renderer'),
  {
    loading: () => <Skeleton className="h-20 w-full" />,
  }
);

// Lazy load document viewer
const DocumentViewer = dynamic(
  () => import('@/components/documents/viewer'),
  {
    loading: () => <Skeleton className="h-96 w-full" />,
    ssr: false,
  }
);
```

## CI/CD

### GitHub Actions Workflow

```yaml
# .github/workflows/ci.yml
name: AI Application CI/CD

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

env:
  NODE_VERSION: '20'
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check

  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      - run: npm ci
      - run: npm run test:unit -- --coverage
      - uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
          flags: unittests

  integration-tests:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: pgvector/pgvector:pg15
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432
      redis:
        image: redis:7
        ports:
          - 6379:6379
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      - run: npm ci
      - run: npx prisma migrate deploy
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test
      - run: npm run test:integration
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test
          UPSTASH_REDIS_URL: redis://localhost:6379

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run build
        env:
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY_TEST }}
      - run: npm run test:e2e
        env:
          TEST_URL: http://localhost:3000
      - uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 7

  ai-safety-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      - run: npm ci
      - run: npm run test:safety
        env:
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY_TEST }}

  deploy-preview:
    needs: [lint, unit-tests]
    if: github.event_name == 'pull_request'
    runs-on: ubuntu-latest
    environment:
      name: preview
      url: ${{ steps.deploy.outputs.url }}
    steps:
      - uses: actions/checkout@v4
      - uses: amondnet/vercel-action@v25
        id: deploy
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          scope: ${{ secrets.VERCEL_ORG_ID }}

  deploy-production:
    needs: [lint, unit-tests, integration-tests, e2e-tests, ai-safety-tests]
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    environment:
      name: production
      url: https://your-ai-app.com
    steps:
      - uses: actions/checkout@v4
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
          scope: ${{ secrets.VERCEL_ORG_ID }}
      - name: Notify on deploy
        uses: slackapi/slack-github-action@v1
        with:
          payload: |
            {
              "text": "AI Application deployed to production! :rocket:"
            }
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
```

### Package Scripts

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit",
    "test": "vitest",
    "test:unit": "vitest run --exclude='**/integration/**' --exclude='**/e2e/**'",
    "test:integration": "vitest run tests/integration",
    "test:watch": "vitest watch",
    "test:coverage": "vitest run --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:safety": "vitest run tests/safety",
    "db:generate": "prisma generate",
    "db:migrate": "prisma migrate dev",
    "db:push": "prisma db push",
    "postinstall": "prisma generate"
  }
}
```

## Monitoring

### Sentry Setup for AI

```typescript
// sentry.client.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  integrations: [
    new Sentry.Replay({
      maskAllText: false,
      blockAllMedia: false,
      maskAllInputs: true, // Mask chat inputs for privacy
    }),
  ],
  beforeSend(event, hint) {
    // Filter out sensitive AI data
    if (event.extra) {
      delete event.extra.apiKey;
      delete event.extra.messages;
    }
    return event;
  },
});
```

```typescript
// sentry.server.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
  beforeSend(event) {
    // Remove sensitive data
    if (event.request?.data) {
      const data = JSON.parse(event.request.data);
      if (data.messages) {
        data.messages = '[REDACTED]';
        event.request.data = JSON.stringify(data);
      }
    }
    return event;
  },
});
```

### Custom AI Metrics

```typescript
// lib/metrics.ts
import { track } from '@vercel/analytics';
import * as Sentry from '@sentry/nextjs';

interface AIMetrics {
  model: string;
  promptTokens: number;
  completionTokens: number;
  latencyMs: number;
  success: boolean;
  errorType?: string;
}

export function trackAIRequest(metrics: AIMetrics) {
  // Vercel Analytics
  track('ai_request', {
    model: metrics.model,
    tokens: metrics.promptTokens + metrics.completionTokens,
    latency: metrics.latencyMs,
    success: metrics.success,
  });
  
  // Sentry performance
  const transaction = Sentry.getCurrentHub().getScope()?.getTransaction();
  if (transaction) {
    transaction.setMeasurement('ai.prompt_tokens', metrics.promptTokens, 'none');
    transaction.setMeasurement('ai.completion_tokens', metrics.completionTokens, 'none');
    transaction.setMeasurement('ai.latency', metrics.latencyMs, 'millisecond');
  }
  
  // Custom span for AI operations
  Sentry.addBreadcrumb({
    category: 'ai',
    message: `AI request: ${metrics.model}`,
    data: {
      tokens: metrics.promptTokens + metrics.completionTokens,
      latency: `${metrics.latencyMs}ms`,
    },
    level: metrics.success ? 'info' : 'error',
  });
}

// Track cost estimation
export function trackAICost(model: string, tokens: number) {
  const costs: Record<string, number> = {
    'gpt-4o': 0.00003,
    'gpt-4o-mini': 0.000001,
    'claude-3-5-sonnet': 0.000015,
    'claude-3-5-haiku': 0.000001,
  };
  
  const costPerToken = costs[model] || 0.00001;
  const estimatedCost = tokens * costPerToken;
  
  track('ai_cost', {
    model,
    tokens,
    cost_usd: estimatedCost,
  });
}
```

### Health Check with AI Provider Status

```typescript
// app/api/health/route.ts
import { prisma } from '@/lib/prisma';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL!,
  token: process.env.UPSTASH_REDIS_TOKEN!,
});

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  services: {
    database: 'up' | 'down';
    redis: 'up' | 'down';
    openai: 'up' | 'down' | 'unknown';
    anthropic: 'up' | 'down' | 'unknown';
  };
  latencies?: {
    database: number;
    redis: number;
  };
}

export async function GET() {
  const start = Date.now();
  const status: HealthStatus = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    services: {
      database: 'down',
      redis: 'down',
      openai: 'unknown',
      anthropic: 'unknown',
    },
    latencies: {
      database: 0,
      redis: 0,
    },
  };

  // Check database
  try {
    const dbStart = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    status.services.database = 'up';
    status.latencies!.database = Date.now() - dbStart;
  } catch {
    status.status = 'unhealthy';
  }

  // Check Redis
  try {
    const redisStart = Date.now();
    await redis.ping();
    status.services.redis = 'up';
    status.latencies!.redis = Date.now() - redisStart;
  } catch {
    status.status = 'degraded';
  }

  // Check OpenAI (cached status)
  try {
    const openaiStatus = await redis.get<string>('health:openai');
    status.services.openai = (openaiStatus as any) || 'unknown';
  } catch {}

  // Check Anthropic (cached status)
  try {
    const anthropicStatus = await redis.get<string>('health:anthropic');
    status.services.anthropic = (anthropicStatus as any) || 'unknown';
  } catch {}

  const statusCode = status.status === 'healthy' ? 200 : 
                     status.status === 'degraded' ? 200 : 503;

  return Response.json(status, { status: statusCode });
}
```

### Usage Dashboard API

```typescript
// app/api/analytics/usage/route.ts
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { startOfDay, startOfMonth, subDays, format } from 'date-fns';

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = session.user.id;
  const today = startOfDay(new Date());
  const monthStart = startOfMonth(new Date());

  // Daily usage for last 30 days
  const dailyUsage = await prisma.$queryRaw<Array<{
    date: Date;
    tokens: bigint;
    requests: bigint;
  }>>`
    SELECT 
      DATE(created_at) as date,
      SUM(total_tokens) as tokens,
      COUNT(*) as requests
    FROM usage
    WHERE user_id = ${userId}
      AND created_at >= ${subDays(today, 30)}
    GROUP BY DATE(created_at)
    ORDER BY date
  `;

  // Usage by model
  const modelUsage = await prisma.usage.groupBy({
    by: ['model'],
    where: {
      userId,
      createdAt: { gte: monthStart },
    },
    _sum: {
      totalTokens: true,
    },
    _count: true,
  });

  // Current period totals
  const [dailyTotal, monthlyTotal] = await Promise.all([
    prisma.usage.aggregate({
      where: { userId, createdAt: { gte: today } },
      _sum: { totalTokens: true },
    }),
    prisma.usage.aggregate({
      where: { userId, createdAt: { gte: monthStart } },
      _sum: { totalTokens: true },
    }),
  ]);

  return Response.json({
    dailyUsage: dailyUsage.map((d) => ({
      date: format(d.date, 'yyyy-MM-dd'),
      tokens: Number(d.tokens),
      requests: Number(d.requests),
    })),
    modelUsage: modelUsage.map((m) => ({
      model: m.model,
      tokens: m._sum.totalTokens || 0,
      requests: m._count,
    })),
    totals: {
      today: dailyTotal._sum.totalTokens || 0,
      month: monthlyTotal._sum.totalTokens || 0,
    },
  });
}
```

## Environment Variables

```bash
# .env.example

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME="AI Application"

# Database (with pgvector)
DATABASE_URL="postgresql://user:pass@localhost:5432/aiapp?schema=public"

# Authentication
NEXTAUTH_SECRET=
NEXTAUTH_URL=http://localhost:3000

# AI Providers
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_AI_API_KEY=

# AI Tools
TAVILY_API_KEY=
OPENWEATHER_API_KEY=

# Rate Limiting
UPSTASH_REDIS_URL=
UPSTASH_REDIS_TOKEN=

# Monitoring
NEXT_PUBLIC_SENTRY_DSN=
SENTRY_DSN=
SENTRY_AUTH_TOKEN=

# Analytics
NEXT_PUBLIC_VERCEL_ANALYTICS_ID=

# Billing (optional)
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
```

## Deployment Checklist

- [ ] All AI provider API keys configured and tested
- [ ] Database with pgvector extension deployed
- [ ] Vector indices created for documents table
- [ ] Rate limiting configured and tested
- [ ] Token usage limits configured per plan
- [ ] Content moderation enabled
- [ ] Streaming responses tested across networks
- [ ] Error boundaries implemented for all AI components
- [ ] Sentry configured with AI-specific filtering
- [ ] Usage tracking and billing webhooks working
- [ ] Security headers configured (CSP allows AI providers)
- [ ] CORS configured for API routes
- [ ] API key rotation strategy documented
- [ ] Fallback models configured for provider outages
- [ ] Health check endpoint monitoring set up
- [ ] Cost alerts configured in provider dashboards
- [ ] Privacy policy updated for AI data usage
- [ ] All tests passing (unit, integration, E2E, safety)
- [ ] CI/CD pipeline configured with AI safety tests

## Related Recipes

- [saas-dashboard](./saas-dashboard.md) - For user management and billing
- [realtime-app](./realtime-app.md) - For live collaboration features

---

## Changelog

### v2.0.0 (2025-01-18)
- Standardized to god-tier template
- Added comprehensive Testing section with AI-specific tests
- Added Error Handling with AI error classes
- Added Accessibility section with streaming announcements
- Added Security section with content moderation, token limits
- Added Performance section with caching strategies
- Added CI/CD with AI safety tests
- Added Monitoring with AI metrics tracking

### v1.0.0 (2025-01-17)
- Initial recipe for Next.js 15
- Vercel AI SDK integration
- RAG implementation
- Multi-provider support

## Related Recipes

- [saas-dashboard](./saas-dashboard.md) - For user management
- [realtime-app](./realtime-app.md) - For live features

---

## Changelog

### 1.0.0 (2025-01-17)
- Initial recipe for Next.js 15
- Vercel AI SDK integration
- RAG implementation
- Multi-provider support
