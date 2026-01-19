---
id: pt-prompt-engineering
name: Prompt Engineering
version: 1.1.0
layer: L5
category: ai
description: LLM prompt engineering patterns for Next.js 15 AI features including streaming, structured outputs, and error handling
tags: [ai, llm, prompt-engineering, openai, anthropic, next15, react19]
composes: []
dependencies:
  ai: "^4.0.0"
  openai: "^4.0.0"
  "@anthropic-ai/sdk": "^0.30.0"
  zod: "^3.23.0"
formula: "PromptEngineering = SystemPrompts + UserContext + StructuredOutput + ErrorHandling"
performance:
  impact: variable
  lcp: neutral
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# Prompt Engineering

## Overview

Prompt engineering is the discipline of designing and optimizing inputs to Large Language Models (LLMs) to achieve reliable, accurate, and useful outputs. In the context of Next.js 15 applications, effective prompt engineering enables features like intelligent search, content generation, chatbots, code assistants, and data extraction while maintaining control over output quality and format.

This pattern covers the essential techniques for building production-ready AI features in Next.js applications using the Vercel AI SDK. It addresses the complete lifecycle from prompt design through response handling, including streaming for real-time feedback, structured outputs with Zod schemas for type-safe responses, error handling for rate limits and failures, and caching strategies for cost optimization.

The key to successful prompt engineering in production applications is treating prompts as code: versioned, tested, and continuously refined based on real-world usage. The patterns presented here provide a foundation for building maintainable AI features that can evolve with your application requirements and changing model capabilities.

## When to Use

- **Content Generation**: Generating product descriptions, blog posts, summaries, or marketing copy where quality and tone matter
- **Conversational AI**: Building chatbots, customer support agents, or interactive assistants that need context awareness
- **Data Extraction**: Parsing unstructured text into structured data like extracting entities, dates, or sentiment
- **Code Assistance**: Generating, explaining, or reviewing code within development tools
- **Search Enhancement**: Query understanding, semantic search, and result summarization
- **Personalization**: Tailoring content recommendations or user experiences based on context

## When NOT to Use

- **Deterministic Operations**: Tasks requiring exact, reproducible results every time
- **Security-Critical Logic**: Authentication, authorization, or cryptographic operations
- **High-Volume Simple Tasks**: Operations better served by traditional algorithms or regex
- **Real-Time Systems**: Applications requiring sub-100ms response times without caching

## Composition Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    Prompt Engineering Architecture                       │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                    Prompt Construction                           │   │
│  │                                                                  │   │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │   │
│  │  │ System Prompt   │  │ User Context    │  │ Few-Shot        │  │   │
│  │  │                 │  │                 │  │ Examples        │  │   │
│  │  │ - Role          │  │ - User input    │  │                 │  │   │
│  │  │ - Constraints   │  │ - Session data  │  │ - Input/Output  │  │   │
│  │  │ - Output format │  │ - Preferences   │  │ - Edge cases    │  │   │
│  │  │ - Guidelines    │  │ - History       │  │ - Format demos  │  │   │
│  │  └─────────────────┘  └─────────────────┘  └─────────────────┘  │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│            │                    │                    │                  │
│            └────────────────────┼────────────────────┘                  │
│                                 ▼                                       │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                    AI SDK Integration                            │   │
│  │                                                                  │   │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │   │
│  │  │ generateText    │  │ streamText      │  │ generateObject  │  │   │
│  │  │                 │  │                 │  │                 │  │   │
│  │  │ - Single call   │  │ - Real-time     │  │ - Structured    │  │   │
│  │  │ - Full response │  │ - Token stream  │  │ - Type-safe     │  │   │
│  │  │ - Async/await   │  │ - Partial UI    │  │ - Zod schema    │  │   │
│  │  └─────────────────┘  └─────────────────┘  └─────────────────┘  │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│            │                    │                    │                  │
│            ▼                    ▼                    ▼                  │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                    Response Handling                             │   │
│  │                                                                  │   │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │   │
│  │  │ Streaming UI    │  │ Error Handling  │  │ Output Parsing  │  │   │
│  │  │                 │  │                 │  │                 │  │   │
│  │  │ - useChat hook  │  │ - Rate limits   │  │ - JSON parsing  │  │   │
│  │  │ - Suspense      │  │ - Timeouts      │  │ - Validation    │  │   │
│  │  │ - Loading state │  │ - Retries       │  │ - Sanitization  │  │   │
│  │  └─────────────────┘  └─────────────────┘  └─────────────────┘  │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│            │                                                            │
│            ▼                                                            │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                    Optimization & Caching                        │   │
│  │                                                                  │   │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │   │
│  │  │ Semantic Cache  │  │ Cost Management │  │ Prompt Testing  │  │   │
│  │  │                 │  │                 │  │                 │  │   │
│  │  │ - Embeddings    │  │ - Token limits  │  │ - A/B testing   │  │   │
│  │  │ - Redis/KV      │  │ - Model select  │  │ - Eval suites   │  │   │
│  │  │ - TTL           │  │ - Compression   │  │ - Monitoring    │  │   │
│  │  └─────────────────┘  └─────────────────┘  └─────────────────┘  │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
```

## Implementation

### Prompt Templates

```typescript
// lib/ai/prompts.ts

/**
 * System prompts define the AI's role, constraints, and output format
 */
export const systemPrompts = {
  // E-commerce product description generator
  productDescription: `You are an expert e-commerce copywriter specializing in compelling product descriptions.

Your task is to write a product description that:
- Opens with a hook that captures attention
- Highlights key features and benefits
- Uses sensory language when appropriate
- Addresses potential customer objections
- Includes a clear call-to-action
- Maintains a consistent brand voice

Output format:
- Headline (max 60 characters)
- Hook paragraph (2-3 sentences)
- Features section (3-5 bullet points)
- Benefits paragraph (2-3 sentences)
- Call-to-action (1 sentence)

Constraints:
- Keep total length between 150-250 words
- Avoid superlatives without evidence
- Do not make health or safety claims
- Use second person ("you") perspective`,

  // Customer support agent
  customerSupport: `You are a helpful customer support agent for an e-commerce platform.

Your responsibilities:
1. Answer questions about orders, shipping, and returns
2. Help troubleshoot product issues
3. Provide information about policies
4. Escalate complex issues appropriately

Guidelines:
- Be empathetic and professional
- Acknowledge customer frustration
- Provide specific, actionable information
- Offer alternatives when requests cannot be fulfilled
- Always verify order details before making changes

Limitations:
- Cannot process refunds or cancellations (escalate to human)
- Cannot access payment details
- Cannot make promises about inventory or shipping times`,

  // Data extraction specialist
  dataExtraction: `You are a data extraction specialist. Your task is to extract structured information from unstructured text.

Extraction rules:
1. Only extract information explicitly stated in the text
2. Use null for missing or unclear fields
3. Normalize dates to ISO 8601 format
4. Normalize phone numbers to E.164 format

Output must be valid JSON matching the provided schema exactly.`,
};

export interface PromptTemplate {
  system: string;
  user: string;
  examples?: Array<{ user: string; assistant: string }>;
}

/**
 * Build a prompt with variable interpolation
 */
export function buildPrompt(
  template: string,
  variables: Record<string, string>
): string {
  let result = template;

  for (const [key, value] of Object.entries(variables)) {
    result = result.replace(new RegExp(`{{${key}}}`, 'g'), value);
  }

  return result;
}

/**
 * Create few-shot examples for consistent formatting
 */
export function createFewShotPrompt(
  systemPrompt: string,
  examples: Array<{ input: string; output: string }>,
  currentInput: string
): Array<{ role: 'system' | 'user' | 'assistant'; content: string }> {
  const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
    { role: 'system', content: systemPrompt },
  ];

  for (const example of examples) {
    messages.push({ role: 'user', content: example.input });
    messages.push({ role: 'assistant', content: example.output });
  }

  messages.push({ role: 'user', content: currentInput });

  return messages;
}
```

### Streaming Text Generation with AI SDK

```typescript
// app/api/ai/generate/route.ts
import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { z } from 'zod';
import { systemPrompts } from '@/lib/ai/prompts';

export const runtime = 'edge';

const requestSchema = z.object({
  prompt: z.string().min(1).max(2000),
  context: z.object({
    productName: z.string(),
    category: z.string(),
    features: z.array(z.string()),
    targetAudience: z.string().optional(),
  }),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { prompt, context } = requestSchema.parse(body);

    const userMessage = `
Product: ${context.productName}
Category: ${context.category}
Features: ${context.features.join(', ')}
${context.targetAudience ? `Target Audience: ${context.targetAudience}` : ''}

Additional instructions: ${prompt}
`;

    const result = streamText({
      model: openai('gpt-4o'),
      system: systemPrompts.productDescription,
      prompt: userMessage,
      maxTokens: 1000,
      temperature: 0.7,
    });

    return result.toDataStreamResponse();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: 'Invalid request' }, { status: 400 });
    }
    return Response.json({ error: 'Failed to generate' }, { status: 500 });
  }
}
```

### Structured Output with Zod

```typescript
// app/api/ai/extract/route.ts
import { openai } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { z } from 'zod';
import { systemPrompts } from '@/lib/ai/prompts';

export const runtime = 'edge';

const contactSchema = z.object({
  name: z.string().nullable(),
  email: z.string().email().nullable(),
  phone: z.string().nullable(),
  company: z.string().nullable(),
  notes: z.array(z.string()).default([]),
});

const extractionResultSchema = z.object({
  contacts: z.array(contactSchema),
  confidence: z.number().min(0).max(1),
});

export async function POST(request: Request) {
  try {
    const { text } = await request.json();

    if (!text || typeof text !== 'string') {
      return Response.json({ error: 'Text is required' }, { status: 400 });
    }

    const result = await generateObject({
      model: openai('gpt-4o'),
      system: systemPrompts.dataExtraction,
      prompt: `Extract contact information:\n\n${text}`,
      schema: extractionResultSchema,
      maxTokens: 2000,
      temperature: 0,
    });

    return Response.json(result.object);
  } catch (error) {
    return Response.json({ error: 'Failed to extract' }, { status: 500 });
  }
}
```

### Error Handling and Retries

```typescript
// lib/ai/client.ts
import { openai } from '@ai-sdk/openai';
import { anthropic } from '@ai-sdk/anthropic';
import { generateObject } from 'ai';
import { z, ZodSchema } from 'zod';

interface AIClientOptions {
  maxRetries?: number;
  retryDelay?: number;
  fallbackModel?: boolean;
}

/**
 * Robust AI client with retries and fallback
 */
export async function generateWithFallback<T>(
  prompt: string,
  schema: ZodSchema<T>,
  options: AIClientOptions = {}
): Promise<T> {
  const { maxRetries = 3, retryDelay = 1000, fallbackModel = true } = options;
  let lastError: Error | null = null;

  // Try primary model with retries
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const result = await generateObject({
        model: openai('gpt-4o'),
        prompt,
        schema,
        maxTokens: 2000,
        temperature: 0,
      });
      return result.object;
    } catch (error) {
      lastError = error as Error;
      if (isRateLimitError(error)) {
        await sleep(retryDelay * Math.pow(2, attempt));
        continue;
      }
      break;
    }
  }

  // Try fallback model
  if (fallbackModel) {
    try {
      const result = await generateObject({
        model: anthropic('claude-3-5-sonnet-20241022'),
        prompt,
        schema,
        maxTokens: 2000,
        temperature: 0,
      });
      return result.object;
    } catch (error) {
      console.error('Fallback model failed:', error);
    }
  }

  throw lastError || new Error('AI generation failed');
}

function isRateLimitError(error: unknown): boolean {
  if (error instanceof Error) {
    return error.message.includes('rate_limit') || error.message.includes('429');
  }
  return false;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Token counting for cost estimation
 */
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

/**
 * Truncate text to fit within token limit
 */
export function truncateToTokenLimit(text: string, maxTokens: number): string {
  const estimatedTokens = estimateTokens(text);
  if (estimatedTokens <= maxTokens) return text;
  const charLimit = maxTokens * 4 * 0.9;
  return text.slice(0, charLimit) + '...';
}
```

### Chat Interface with useChat Hook

```tsx
// components/ai/chat-interface.tsx
'use client';

import { useChat } from 'ai/react';
import { useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Loader2, Send, Bot, User, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';

interface ChatInterfaceProps {
  conversationId?: string;
  initialMessages?: Array<{ role: 'user' | 'assistant'; content: string }>;
}

export function ChatInterface({ conversationId, initialMessages = [] }: ChatInterfaceProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    error,
    reload,
    stop,
  } = useChat({
    api: '/api/ai/chat',
    body: { conversationId },
    initialMessages: initialMessages.map((m, i) => ({ id: `initial-${i}`, ...m })),
  });

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="flex flex-col h-[600px] border rounded-lg">
      <ScrollArea ref={scrollRef} className="flex-1 p-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Bot className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold">How can I help you?</h3>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn('flex gap-3', message.role === 'user' ? 'justify-end' : 'justify-start')}
              >
                {message.role === 'assistant' && (
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      <Bot className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={cn(
                    'max-w-[80%] rounded-lg px-4 py-2',
                    message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'
                  )}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>
                {message.role === 'user' && (
                  <Avatar className="h-8 w-8">
                    <AvatarFallback><User className="h-4 w-4" /></AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    <Bot className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="bg-muted rounded-lg px-4 py-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              </div>
            )}
          </div>
        )}
      </ScrollArea>

      {error && (
        <Alert variant="destructive" className="mx-4 mb-2">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>Something went wrong.</span>
            <Button variant="outline" size="sm" onClick={() => reload()}>Retry</Button>
          </AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={handleInputChange}
            placeholder="Type your message..."
            disabled={isLoading}
            className="flex-1"
          />
          {isLoading ? (
            <Button type="button" variant="outline" onClick={stop}>Stop</Button>
          ) : (
            <Button type="submit" disabled={!input.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
```

## Examples

### Example 1: Product Description Generator

```tsx
// app/admin/products/[id]/generate/page.tsx
'use client';

import { useState } from 'react';
import { useCompletion } from 'ai/react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Sparkles, Copy, Check } from 'lucide-react';

interface ProductGeneratorProps {
  product: { name: string; category: string; features: string[] };
}

export function ProductDescriptionGenerator({ product }: ProductGeneratorProps) {
  const [instructions, setInstructions] = useState('');
  const [copied, setCopied] = useState(false);

  const { complete, completion, isLoading, error } = useCompletion({
    api: '/api/ai/generate',
    body: {
      context: {
        productName: product.name,
        category: product.category,
        features: product.features,
      },
    },
  });

  const handleGenerate = () => complete(instructions || 'Generate a compelling description');

  const handleCopy = async () => {
    await navigator.clipboard.writeText(completion);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Card>
        <CardHeader><CardTitle>Generate Description</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Product</label>
            <p className="text-lg font-semibold">{product.name}</p>
          </div>
          <div>
            <label className="text-sm font-medium">Features</label>
            <ul className="list-disc list-inside text-sm text-muted-foreground">
              {product.features.map((f, i) => <li key={i}>{f}</li>)}
            </ul>
          </div>
          <Textarea
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            placeholder="Additional instructions..."
            rows={3}
          />
          <Button onClick={handleGenerate} disabled={isLoading} className="w-full">
            {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
            {isLoading ? 'Generating...' : 'Generate'}
          </Button>
          {error && <p className="text-sm text-destructive">{error.message}</p>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Result</CardTitle>
          {completion && (
            <Button variant="outline" size="sm" onClick={handleCopy}>
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {completion ? (
            <div className="prose prose-sm whitespace-pre-wrap">{completion}</div>
          ) : (
            <p className="text-muted-foreground text-center py-8">Output will appear here</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
```

### Example 2: Semantic Search with Query Understanding

```typescript
// lib/ai/search.ts
import { openai } from '@ai-sdk/openai';
import { generateObject, embed } from 'ai';
import { z } from 'zod';
import { prisma } from '@/lib/db';

const queryAnalysisSchema = z.object({
  intent: z.enum(['product_search', 'order_lookup', 'support_question', 'navigation']),
  filters: z.object({
    category: z.string().nullable(),
    priceRange: z.object({ min: z.number().nullable(), max: z.number().nullable() }).nullable(),
  }),
  searchTerms: z.array(z.string()),
});

export async function analyzeSearchQuery(query: string) {
  const result = await generateObject({
    model: openai('gpt-4o-mini'),
    system: 'Analyze e-commerce search queries to extract intent and filters.',
    prompt: `Analyze: "${query}"`,
    schema: queryAnalysisSchema,
    temperature: 0,
  });
  return result.object;
}

export async function getSearchEmbedding(text: string) {
  const result = await embed({
    model: openai.embedding('text-embedding-3-small'),
    value: text,
  });
  return result.embedding;
}

export async function semanticProductSearch(query: string, limit = 20) {
  const analysis = await analyzeSearchQuery(query);
  const embedding = await getSearchEmbedding(analysis.searchTerms.join(' ') || query);

  const products = await prisma.$queryRaw`
    SELECT p.*, 1 - (p.embedding <=> ${embedding}::vector) as similarity
    FROM products p
    ORDER BY similarity DESC
    LIMIT ${limit}
  `;

  return { products, analysis };
}
```

### Example 3: Content Moderation

```typescript
// lib/ai/moderation.ts
import { openai } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { z } from 'zod';

const moderationSchema = z.object({
  flagged: z.boolean(),
  categories: z.object({
    spam: z.boolean(),
    harassment: z.boolean(),
    hate: z.boolean(),
    violence: z.boolean(),
  }),
  reasoning: z.string(),
  suggestedAction: z.enum(['allow', 'flag_for_review', 'block']),
});

export async function moderateContent(content: string, contentType: string) {
  const result = await generateObject({
    model: openai('gpt-4o-mini'),
    system: `Content moderation system for e-commerce. Context: ${contentType}`,
    prompt: `Analyze:\n\n${content}`,
    schema: moderationSchema,
    temperature: 0,
  });
  return result.object;
}

export async function checkBeforePublish(
  content: string,
  contentType: 'review' | 'comment' | 'message'
): Promise<{ allowed: boolean; reason?: string }> {
  const moderation = await moderateContent(content, contentType);

  if (moderation.suggestedAction === 'block') {
    return { allowed: false, reason: moderation.reasoning };
  }
  return { allowed: true };
}
```

## Anti-patterns

### Anti-pattern 1: Unstructured Prompts

```typescript
// BAD - Vague prompt
const result = await generateText({
  model: openai('gpt-4o'),
  prompt: `Write something about ${product.name}`,
});

// GOOD - Structured with clear instructions
const result = await generateText({
  model: openai('gpt-4o'),
  system: systemPrompts.productDescription,
  prompt: `
Product: ${product.name}
Category: ${product.category}
Features: ${product.features.join(', ')}

Write a compelling product description following the guidelines.`,
});
```

### Anti-pattern 2: No Output Validation

```typescript
// BAD - Trusting raw AI output
const response = await generateText({ model, prompt });
const data = JSON.parse(response.text); // May fail

// GOOD - Use structured output with schema
const result = await generateObject({
  model: openai('gpt-4o'),
  schema: z.object({
    title: z.string(),
    description: z.string(),
  }),
  prompt: 'Generate product content...',
});
// result.object is typed and validated
```

### Anti-pattern 3: Ignoring Rate Limits

```typescript
// BAD - No retry logic
async function generateAll(items: string[]) {
  return Promise.all(items.map(item => generateText({ model, prompt: item })));
}

// GOOD - Handle rate limits
async function generateAll(items: string[]) {
  const results = [];
  for (const item of items) {
    try {
      results.push(await generateWithFallback(item, schema));
    } catch (error) {
      if (isRateLimitError(error)) {
        await sleep(60000);
        results.push(await generateWithFallback(item, schema));
      } else throw error;
    }
  }
  return results;
}
```

## Testing

### Unit Tests for Prompts

```typescript
// __tests__/lib/ai/prompts.test.ts
import { buildPrompt, createFewShotPrompt } from '@/lib/ai/prompts';

describe('Prompt Utilities', () => {
  describe('buildPrompt', () => {
    it('replaces variables in template', () => {
      const template = 'Hello {{name}}, welcome to {{company}}';
      const result = buildPrompt(template, { name: 'Alice', company: 'Acme' });
      expect(result).toBe('Hello Alice, welcome to Acme');
    });

    it('handles multiple occurrences', () => {
      const template = '{{name}} likes {{name}}';
      const result = buildPrompt(template, { name: 'Bob' });
      expect(result).toBe('Bob likes Bob');
    });
  });

  describe('createFewShotPrompt', () => {
    it('creates proper message structure', () => {
      const messages = createFewShotPrompt(
        'You are helpful.',
        [{ input: 'Hi', output: 'Hello!' }],
        'How are you?'
      );
      expect(messages).toHaveLength(4);
      expect(messages[0]).toEqual({ role: 'system', content: 'You are helpful.' });
      expect(messages[3]).toEqual({ role: 'user', content: 'How are you?' });
    });
  });
});
```

### Integration Tests

```typescript
// __tests__/api/ai.test.ts
import { POST } from '@/app/api/ai/extract/route';

describe('AI Extraction API', () => {
  it('extracts contact information', async () => {
    const request = new Request('http://localhost/api/ai/extract', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: 'Contact John at john@example.com' }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(data.contacts).toHaveLength(1);
    expect(data.contacts[0].email).toBe('john@example.com');
  });

  it('handles empty text', async () => {
    const request = new Request('http://localhost/api/ai/extract', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: '' }),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });
});
```

## Related Skills

- [Streaming](../patterns/streaming.md) - Real-time AI response streaming
- [Caching](../patterns/caching.md) - Caching AI responses
- [Rate Limiting](../patterns/rate-limiting.md) - Protecting AI endpoints
- [Error Handling](../patterns/error-handling.md) - Graceful AI failures
- [WebSockets](../patterns/websockets.md) - Real-time AI interactions

---

## Changelog

### 1.1.0 (2026-01-18)
- Added comprehensive Overview section
- Added When NOT to Use section
- Added detailed Composition Diagram
- Added prompt templates with multiple use cases
- Added 3 real-world examples including semantic search
- Added 3 anti-patterns with corrections
- Added unit and integration tests
- Added error handling with fallback models
- Expanded Related Skills section

### 1.0.0 (2025-01-18)
- Initial implementation
- Prompt templates
- Structured outputs
- Streaming chat
