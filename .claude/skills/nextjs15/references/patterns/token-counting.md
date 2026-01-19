---
id: pt-token-counting
name: LLM Token Counting
version: 1.0.0
layer: L5
category: ai
description: Token counting for LLM API calls in Next.js applications
tags: [tokens, llm, openai, anthropic, ai, next15]
composes:
  - ../molecules/card.md
  - ../molecules/progress-bar.md
  - ../molecules/badge.md
dependencies:
  tiktoken: "^1.0.0"
formula: Tokenizer + Cost Calculation + Usage Tracking = Token Management
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# LLM Token Counting

## When to Use

- **Cost estimation**: Estimating API costs before making calls
- **Usage limits**: Enforcing per-user or per-request token limits
- **Billing**: Tracking token usage for billing purposes
- **Prompt optimization**: Analyzing and optimizing prompt lengths

**Avoid when**: Using fixed-cost APIs, or token limits are not a concern.

## Composition Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ Token Counting Architecture                                  │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Token Service                                         │  │
│  │  ├─ Tokenizer: tiktoken for accurate counting        │  │
│  │  ├─ Cost Calculator: Model-specific pricing          │  │
│  │  └─ Usage Tracker: Per-user/org token tracking       │  │
│  └───────────────────────────────────────────────────────┘  │
│         │                    │                    │         │
│         ▼                    ▼                    ▼         │
│  ┌────────────┐     ┌──────────────┐     ┌─────────────┐   │
│  │ Pre-call   │     │ Post-call    │     │ Usage       │   │
│  │ Estimation │     │ Recording    │     │ Dashboard   │   │
│  └────────────┘     └──────────────┘     └─────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Token Counting Service

```typescript
// lib/tokens/service.ts
import { encoding_for_model, TiktokenModel } from 'tiktoken';
import { db } from '@/lib/db';

export interface TokenCount {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
}

export interface TokenCost {
  inputCost: number;
  outputCost: number;
  totalCost: number;
}

type ModelPricing = {
  input: number;  // per 1K tokens
  output: number; // per 1K tokens
};

const MODEL_PRICING: Record<string, ModelPricing> = {
  'gpt-4o': { input: 0.0025, output: 0.01 },
  'gpt-4o-mini': { input: 0.00015, output: 0.0006 },
  'gpt-4-turbo': { input: 0.01, output: 0.03 },
  'gpt-3.5-turbo': { input: 0.0005, output: 0.0015 },
  'claude-3-5-sonnet': { input: 0.003, output: 0.015 },
  'claude-3-opus': { input: 0.015, output: 0.075 },
  'claude-3-haiku': { input: 0.00025, output: 0.00125 },
};

const MODEL_LIMITS: Record<string, number> = {
  'gpt-4o': 128000,
  'gpt-4o-mini': 128000,
  'gpt-4-turbo': 128000,
  'gpt-3.5-turbo': 16385,
  'claude-3-5-sonnet': 200000,
  'claude-3-opus': 200000,
  'claude-3-haiku': 200000,
};

export class TokenService {
  private encoders = new Map<string, ReturnType<typeof encoding_for_model>>();

  private getEncoder(model: string) {
    // Map model to tiktoken model name
    const tiktokenModel = model.startsWith('gpt')
      ? model as TiktokenModel
      : 'gpt-4o' as TiktokenModel; // Fallback for non-OpenAI models

    if (!this.encoders.has(tiktokenModel)) {
      this.encoders.set(tiktokenModel, encoding_for_model(tiktokenModel));
    }
    return this.encoders.get(tiktokenModel)!;
  }

  countTokens(text: string, model = 'gpt-4o'): number {
    const encoder = this.getEncoder(model);
    return encoder.encode(text).length;
  }

  countMessageTokens(
    messages: { role: string; content: string }[],
    model = 'gpt-4o'
  ): number {
    const encoder = this.getEncoder(model);
    let tokens = 0;

    for (const message of messages) {
      tokens += 4; // Message overhead
      tokens += encoder.encode(message.role).length;
      tokens += encoder.encode(message.content).length;
    }
    tokens += 2; // Priming tokens

    return tokens;
  }

  estimateCost(tokens: TokenCount, model: string): TokenCost {
    const pricing = MODEL_PRICING[model] || MODEL_PRICING['gpt-4o'];

    const inputCost = (tokens.inputTokens / 1000) * pricing.input;
    const outputCost = (tokens.outputTokens / 1000) * pricing.output;

    return {
      inputCost,
      outputCost,
      totalCost: inputCost + outputCost,
    };
  }

  getContextLimit(model: string): number {
    return MODEL_LIMITS[model] || 128000;
  }

  async trackUsage(
    userId: string,
    model: string,
    tokens: TokenCount,
    cost: TokenCost
  ): Promise<void> {
    await db.tokenUsage.create({
      data: {
        userId,
        model,
        inputTokens: tokens.inputTokens,
        outputTokens: tokens.outputTokens,
        totalTokens: tokens.totalTokens,
        cost: cost.totalCost,
        timestamp: new Date(),
      },
    });

    // Update monthly aggregate
    const month = new Date().toISOString().slice(0, 7);
    await db.tokenUsageMonthly.upsert({
      where: { userId_month: { userId, month } },
      create: {
        userId,
        month,
        totalTokens: tokens.totalTokens,
        totalCost: cost.totalCost,
      },
      update: {
        totalTokens: { increment: tokens.totalTokens },
        totalCost: { increment: cost.totalCost },
      },
    });
  }

  async getUsage(userId: string, period: 'day' | 'week' | 'month' = 'month') {
    const startDate = new Date();
    if (period === 'day') startDate.setDate(startDate.getDate() - 1);
    else if (period === 'week') startDate.setDate(startDate.getDate() - 7);
    else startDate.setMonth(startDate.getMonth() - 1);

    const usage = await db.tokenUsage.aggregate({
      where: { userId, timestamp: { gte: startDate } },
      _sum: { inputTokens: true, outputTokens: true, totalTokens: true, cost: true },
    });

    return {
      inputTokens: usage._sum.inputTokens || 0,
      outputTokens: usage._sum.outputTokens || 0,
      totalTokens: usage._sum.totalTokens || 0,
      totalCost: usage._sum.cost || 0,
    };
  }

  async checkLimit(userId: string, estimatedTokens: number): Promise<{
    allowed: boolean;
    remaining: number;
    limit: number;
  }> {
    const user = await db.user.findUnique({
      where: { id: userId },
      include: { subscription: true },
    });

    const limit = user?.subscription?.tokenLimit || 100000; // Default 100K
    const usage = await this.getUsage(userId, 'month');
    const remaining = limit - usage.totalTokens;

    return {
      allowed: remaining >= estimatedTokens,
      remaining: Math.max(0, remaining),
      limit,
    };
  }
}

export const tokenService = new TokenService();
```

## API Integration

```typescript
// lib/ai/chat.ts
import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';
import { tokenService } from '@/lib/tokens/service';

export async function chat(
  userId: string,
  messages: { role: 'user' | 'assistant' | 'system'; content: string }[],
  model = 'gpt-4o'
) {
  // Pre-call token estimation
  const inputTokens = tokenService.countMessageTokens(messages, model);

  // Check user limits
  const limitCheck = await tokenService.checkLimit(userId, inputTokens + 1000);
  if (!limitCheck.allowed) {
    throw new Error(`Token limit exceeded. ${limitCheck.remaining} tokens remaining.`);
  }

  // Make the API call
  const result = await generateText({
    model: openai(model),
    messages,
  });

  // Calculate actual usage
  const outputTokens = tokenService.countTokens(result.text, model);
  const tokens = {
    inputTokens,
    outputTokens,
    totalTokens: inputTokens + outputTokens,
  };

  // Calculate cost and track usage
  const cost = tokenService.estimateCost(tokens, model);
  await tokenService.trackUsage(userId, model, tokens, cost);

  return {
    text: result.text,
    usage: { tokens, cost },
  };
}
```

## Token Usage Dashboard

```typescript
// components/tokens/usage-dashboard.tsx
'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

interface UsageData {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  totalCost: number;
  limit: number;
}

export function TokenUsageDashboard() {
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/tokens/usage')
      .then((res) => res.json())
      .then(setUsage)
      .finally(() => setLoading(false));
  }, []);

  if (loading || !usage) {
    return <div>Loading...</div>;
  }

  const usagePercent = (usage.totalTokens / usage.limit) * 100;
  const isNearLimit = usagePercent > 80;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Total Tokens</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {usage.totalTokens.toLocaleString()}
          </div>
          <Progress value={usagePercent} className="mt-2" />
          <p className="text-xs text-muted-foreground mt-1">
            {usage.limit.toLocaleString()} limit
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Input Tokens</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {usage.inputTokens.toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground">
            Prompts and context
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Output Tokens</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {usage.outputTokens.toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground">
            AI responses
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Estimated Cost</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            ${usage.totalCost.toFixed(4)}
          </div>
          <Badge variant={isNearLimit ? 'destructive' : 'secondary'}>
            This month
          </Badge>
        </CardContent>
      </Card>
    </div>
  );
}
```

## Token Counter Component

```typescript
// components/tokens/token-counter.tsx
'use client';

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';

interface TokenCounterProps {
  text: string;
  model?: string;
  maxTokens?: number;
}

export function TokenCounter({ text, model = 'gpt-4o', maxTokens }: TokenCounterProps) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    // Debounced token counting
    const timer = setTimeout(async () => {
      const res = await fetch('/api/tokens/count', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, model }),
      });
      const { tokens } = await res.json();
      setCount(tokens);
    }, 300);

    return () => clearTimeout(timer);
  }, [text, model]);

  const isOverLimit = maxTokens && count > maxTokens;

  return (
    <Badge variant={isOverLimit ? 'destructive' : 'secondary'}>
      {count.toLocaleString()} tokens
      {maxTokens && ` / ${maxTokens.toLocaleString()}`}
    </Badge>
  );
}
```

## Related Patterns

- [usage-metering](./usage-metering.md)
- [stripe-payments](./stripe-payments.md)
- [rate-limiting](./rate-limiting.md)

---

## Changelog

### 1.0.0 (2025-01-18)
- Initial implementation
- tiktoken integration
- Cost calculation
- Usage tracking
- Dashboard components
