---
id: pt-model-routing
name: LLM Model Routing
version: 1.0.0
layer: L5
category: ai
description: Intelligent routing between LLM providers (OpenAI, Anthropic, Azure) with cost optimization, automatic fallbacks, and model-specific adaptation
tags: [ai, llm, openai, anthropic, azure, routing, fallback, cost-optimization, next15, react19]
composes: []
dependencies:
  ai: "^4.0.0"
  openai: "^4.77.0"
  "@anthropic-ai/sdk": "^0.33.0"
  "@azure/openai": "^1.0.0"
formula: "ModelRouting = ProviderRegistry + CostCalculator + FallbackChain + AdaptiveSelection"
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# LLM Model Routing

## Overview

Model routing is a critical pattern for production AI applications that need to balance cost, performance, latency, and reliability across multiple LLM providers. Rather than hardcoding a single model, intelligent routing allows your application to dynamically select the optimal model based on task complexity, user tier, cost constraints, and provider availability.

This pattern implements a comprehensive routing system that supports OpenAI, Anthropic, and Azure OpenAI, with automatic fallbacks when providers experience outages or rate limits. The router tracks costs, monitors latency, and can adapt model selection based on real-time performance metrics. It integrates seamlessly with the Vercel AI SDK for streaming responses.

Production AI systems face several challenges: different models excel at different tasks (Claude for reasoning, GPT-4 for coding, smaller models for simple queries), costs vary dramatically between providers, and outages can disrupt service. A well-designed routing layer abstracts these concerns, allowing your application code to simply request "the best model for this task" while the router handles provider selection, failover, and optimization.

## When to Use

- When building applications that need high availability across multiple LLM providers
- For cost optimization by routing simple queries to cheaper models
- When different user tiers (free vs paid) need different model access
- For A/B testing different models to compare quality and cost
- When implementing graceful degradation during provider outages
- For compliance requirements that mandate specific providers for certain data
- When optimizing for latency by selecting geographically closer endpoints

## When NOT to Use

- Simple prototypes or MVPs with single-model requirements
- Applications with strict single-provider contracts
- When model consistency is more important than cost/availability optimization
- Offline or edge deployments where multiple providers add complexity
- When the overhead of routing logic exceeds the benefits

## Composition Diagram

```
+------------------------------------------------------------------+
|                        Model Router                               |
|  +------------------------------------------------------------+  |
|  |                    Request Analysis                         |  |
|  |  [Task Type] [Complexity] [Token Estimate] [User Tier]     |  |
|  +------------------------------------------------------------+  |
|                              |                                    |
|                              v                                    |
|  +------------------------------------------------------------+  |
|  |                   Provider Selection                        |  |
|  |  +----------------+  +----------------+  +----------------+ |  |
|  |  |    OpenAI     |  |   Anthropic    |  |     Azure      | |  |
|  |  |  gpt-4-turbo  |  |  claude-3-5    |  |  gpt-4-azure   | |  |
|  |  |  gpt-4o       |  |  claude-3-opus |  |  gpt-35-turbo  | |  |
|  |  |  gpt-3.5      |  |  claude-3-haiku|  |                | |  |
|  |  +----------------+  +----------------+  +----------------+ |  |
|  +------------------------------------------------------------+  |
|                              |                                    |
|                              v                                    |
|  +------------------------------------------------------------+  |
|  |                   Fallback Chain                            |  |
|  |  Primary -> Secondary -> Tertiary -> Error Handler         |  |
|  +------------------------------------------------------------+  |
|                              |                                    |
|                              v                                    |
|  +------------------------------------------------------------+  |
|  |                   Cost & Metrics                            |  |
|  |  [Token Usage] [Latency] [Success Rate] [Cost Tracking]    |  |
|  +------------------------------------------------------------+  |
+------------------------------------------------------------------+
```

## Installation

```bash
npm install ai openai @anthropic-ai/sdk @azure/openai zod
```

## Environment Configuration

```bash
# .env.local
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
AZURE_OPENAI_API_KEY=...
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com
AZURE_OPENAI_DEPLOYMENT_NAME=gpt-4

# Optional: Model routing configuration
DEFAULT_PROVIDER=openai
FALLBACK_ENABLED=true
COST_TRACKING_ENABLED=true
```

## Type Definitions

```typescript
// lib/ai/types.ts

export type Provider = 'openai' | 'anthropic' | 'azure';

export type OpenAIModel =
  | 'gpt-4-turbo-preview'
  | 'gpt-4o'
  | 'gpt-4o-mini'
  | 'gpt-4'
  | 'gpt-3.5-turbo';

export type AnthropicModel =
  | 'claude-3-5-sonnet-20241022'
  | 'claude-3-opus-20240229'
  | 'claude-3-sonnet-20240229'
  | 'claude-3-haiku-20240307';

export type AzureModel = 'gpt-4' | 'gpt-35-turbo';

export type ModelId = OpenAIModel | AnthropicModel | AzureModel;

export interface ModelConfig {
  id: ModelId;
  provider: Provider;
  displayName: string;
  contextWindow: number;
  maxOutputTokens: number;
  costPer1kInput: number;
  costPer1kOutput: number;
  capabilities: ModelCapability[];
  tier: 'free' | 'pro' | 'enterprise';
}

export type ModelCapability =
  | 'chat'
  | 'code'
  | 'reasoning'
  | 'vision'
  | 'function-calling'
  | 'json-mode'
  | 'streaming';

export interface RoutingContext {
  taskType: TaskType;
  estimatedTokens: number;
  userTier: 'free' | 'pro' | 'enterprise';
  preferredProvider?: Provider;
  maxCostPerRequest?: number;
  requiresVision?: boolean;
  requiresFunctionCalling?: boolean;
}

export type TaskType =
  | 'simple-chat'
  | 'complex-reasoning'
  | 'code-generation'
  | 'code-review'
  | 'summarization'
  | 'translation'
  | 'creative-writing'
  | 'data-extraction';

export interface RoutingResult {
  model: ModelConfig;
  provider: Provider;
  estimatedCost: number;
  fallbackChain: ModelConfig[];
}

export interface UsageMetrics {
  provider: Provider;
  model: ModelId;
  inputTokens: number;
  outputTokens: number;
  cost: number;
  latencyMs: number;
  success: boolean;
  timestamp: Date;
}
```

## Model Registry

```typescript
// lib/ai/registry.ts

import { ModelConfig, Provider, ModelId, ModelCapability } from './types';

export const MODEL_REGISTRY: Record<ModelId, ModelConfig> = {
  // OpenAI Models
  'gpt-4-turbo-preview': {
    id: 'gpt-4-turbo-preview',
    provider: 'openai',
    displayName: 'GPT-4 Turbo',
    contextWindow: 128000,
    maxOutputTokens: 4096,
    costPer1kInput: 0.01,
    costPer1kOutput: 0.03,
    capabilities: ['chat', 'code', 'reasoning', 'vision', 'function-calling', 'json-mode', 'streaming'],
    tier: 'pro',
  },
  'gpt-4o': {
    id: 'gpt-4o',
    provider: 'openai',
    displayName: 'GPT-4o',
    contextWindow: 128000,
    maxOutputTokens: 4096,
    costPer1kInput: 0.005,
    costPer1kOutput: 0.015,
    capabilities: ['chat', 'code', 'reasoning', 'vision', 'function-calling', 'json-mode', 'streaming'],
    tier: 'pro',
  },
  'gpt-4o-mini': {
    id: 'gpt-4o-mini',
    provider: 'openai',
    displayName: 'GPT-4o Mini',
    contextWindow: 128000,
    maxOutputTokens: 16384,
    costPer1kInput: 0.00015,
    costPer1kOutput: 0.0006,
    capabilities: ['chat', 'code', 'function-calling', 'json-mode', 'streaming'],
    tier: 'free',
  },
  'gpt-4': {
    id: 'gpt-4',
    provider: 'openai',
    displayName: 'GPT-4',
    contextWindow: 8192,
    maxOutputTokens: 4096,
    costPer1kInput: 0.03,
    costPer1kOutput: 0.06,
    capabilities: ['chat', 'code', 'reasoning', 'function-calling', 'streaming'],
    tier: 'enterprise',
  },
  'gpt-3.5-turbo': {
    id: 'gpt-3.5-turbo',
    provider: 'openai',
    displayName: 'GPT-3.5 Turbo',
    contextWindow: 16385,
    maxOutputTokens: 4096,
    costPer1kInput: 0.0005,
    costPer1kOutput: 0.0015,
    capabilities: ['chat', 'code', 'function-calling', 'json-mode', 'streaming'],
    tier: 'free',
  },

  // Anthropic Models
  'claude-3-5-sonnet-20241022': {
    id: 'claude-3-5-sonnet-20241022',
    provider: 'anthropic',
    displayName: 'Claude 3.5 Sonnet',
    contextWindow: 200000,
    maxOutputTokens: 8192,
    costPer1kInput: 0.003,
    costPer1kOutput: 0.015,
    capabilities: ['chat', 'code', 'reasoning', 'vision', 'function-calling', 'streaming'],
    tier: 'pro',
  },
  'claude-3-opus-20240229': {
    id: 'claude-3-opus-20240229',
    provider: 'anthropic',
    displayName: 'Claude 3 Opus',
    contextWindow: 200000,
    maxOutputTokens: 4096,
    costPer1kInput: 0.015,
    costPer1kOutput: 0.075,
    capabilities: ['chat', 'code', 'reasoning', 'vision', 'function-calling', 'streaming'],
    tier: 'enterprise',
  },
  'claude-3-sonnet-20240229': {
    id: 'claude-3-sonnet-20240229',
    provider: 'anthropic',
    displayName: 'Claude 3 Sonnet',
    contextWindow: 200000,
    maxOutputTokens: 4096,
    costPer1kInput: 0.003,
    costPer1kOutput: 0.015,
    capabilities: ['chat', 'code', 'reasoning', 'vision', 'function-calling', 'streaming'],
    tier: 'pro',
  },
  'claude-3-haiku-20240307': {
    id: 'claude-3-haiku-20240307',
    provider: 'anthropic',
    displayName: 'Claude 3 Haiku',
    contextWindow: 200000,
    maxOutputTokens: 4096,
    costPer1kInput: 0.00025,
    costPer1kOutput: 0.00125,
    capabilities: ['chat', 'code', 'function-calling', 'streaming'],
    tier: 'free',
  },

  // Azure Models
  'gpt-4': {
    id: 'gpt-4',
    provider: 'azure',
    displayName: 'Azure GPT-4',
    contextWindow: 8192,
    maxOutputTokens: 4096,
    costPer1kInput: 0.03,
    costPer1kOutput: 0.06,
    capabilities: ['chat', 'code', 'reasoning', 'function-calling', 'streaming'],
    tier: 'enterprise',
  },
  'gpt-35-turbo': {
    id: 'gpt-35-turbo',
    provider: 'azure',
    displayName: 'Azure GPT-3.5 Turbo',
    contextWindow: 16385,
    maxOutputTokens: 4096,
    costPer1kInput: 0.0005,
    costPer1kOutput: 0.0015,
    capabilities: ['chat', 'code', 'function-calling', 'streaming'],
    tier: 'free',
  },
};

export function getModelsByProvider(provider: Provider): ModelConfig[] {
  return Object.values(MODEL_REGISTRY).filter(m => m.provider === provider);
}

export function getModelsByCapability(capability: ModelCapability): ModelConfig[] {
  return Object.values(MODEL_REGISTRY).filter(m => m.capabilities.includes(capability));
}

export function getModelsByTier(tier: 'free' | 'pro' | 'enterprise'): ModelConfig[] {
  const tierHierarchy = { free: 0, pro: 1, enterprise: 2 };
  return Object.values(MODEL_REGISTRY).filter(
    m => tierHierarchy[m.tier] <= tierHierarchy[tier]
  );
}
```

## Provider Clients

```typescript
// lib/ai/providers/openai.ts

import OpenAI from 'openai';
import { createOpenAI } from '@ai-sdk/openai';

const openaiClient = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const openaiProvider = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function checkOpenAIHealth(): Promise<boolean> {
  try {
    const response = await openaiClient.models.list();
    return response.data.length > 0;
  } catch {
    return false;
  }
}

export { openaiClient };
```

```typescript
// lib/ai/providers/anthropic.ts

import Anthropic from '@anthropic-ai/sdk';
import { createAnthropic } from '@ai-sdk/anthropic';

const anthropicClient = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export const anthropicProvider = createAnthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function checkAnthropicHealth(): Promise<boolean> {
  try {
    // Anthropic doesn't have a dedicated health endpoint
    // We use a minimal request to check availability
    await anthropicClient.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 1,
      messages: [{ role: 'user', content: 'hi' }],
    });
    return true;
  } catch {
    return false;
  }
}

export { anthropicClient };
```

```typescript
// lib/ai/providers/azure.ts

import { AzureOpenAI } from 'openai';
import { createAzure } from '@ai-sdk/azure';

const azureClient = new AzureOpenAI({
  apiKey: process.env.AZURE_OPENAI_API_KEY,
  endpoint: process.env.AZURE_OPENAI_ENDPOINT,
  deployment: process.env.AZURE_OPENAI_DEPLOYMENT_NAME,
  apiVersion: '2024-02-15-preview',
});

export const azureProvider = createAzure({
  apiKey: process.env.AZURE_OPENAI_API_KEY,
  resourceName: process.env.AZURE_OPENAI_RESOURCE_NAME,
});

export async function checkAzureHealth(): Promise<boolean> {
  try {
    const response = await azureClient.models.list();
    return true;
  } catch {
    return false;
  }
}

export { azureClient };
```

## Cost Calculator

```typescript
// lib/ai/cost.ts

import { ModelConfig, UsageMetrics } from './types';
import { MODEL_REGISTRY } from './registry';

export function estimateCost(
  modelId: string,
  inputTokens: number,
  outputTokens: number
): number {
  const model = MODEL_REGISTRY[modelId as keyof typeof MODEL_REGISTRY];
  if (!model) return 0;

  const inputCost = (inputTokens / 1000) * model.costPer1kInput;
  const outputCost = (outputTokens / 1000) * model.costPer1kOutput;

  return inputCost + outputCost;
}

export function estimateTokens(text: string): number {
  // Rough approximation: 1 token ~= 4 characters for English
  return Math.ceil(text.length / 4);
}

export function estimateOutputTokens(taskType: string, inputTokens: number): number {
  const outputRatios: Record<string, number> = {
    'simple-chat': 0.5,
    'complex-reasoning': 2.0,
    'code-generation': 1.5,
    'code-review': 1.0,
    'summarization': 0.3,
    'translation': 1.0,
    'creative-writing': 2.0,
    'data-extraction': 0.5,
  };

  const ratio = outputRatios[taskType] || 1.0;
  return Math.ceil(inputTokens * ratio);
}

export class CostTracker {
  private usage: UsageMetrics[] = [];

  record(metrics: UsageMetrics): void {
    this.usage.push(metrics);
  }

  getTotalCost(since?: Date): number {
    const filtered = since
      ? this.usage.filter(u => u.timestamp >= since)
      : this.usage;

    return filtered.reduce((sum, u) => sum + u.cost, 0);
  }

  getCostByProvider(provider: string, since?: Date): number {
    const filtered = this.usage.filter(u => {
      const matchesProvider = u.provider === provider;
      const matchesDate = since ? u.timestamp >= since : true;
      return matchesProvider && matchesDate;
    });

    return filtered.reduce((sum, u) => sum + u.cost, 0);
  }

  getUsageReport(since?: Date): {
    totalCost: number;
    byProvider: Record<string, number>;
    byModel: Record<string, number>;
    totalRequests: number;
    successRate: number;
    avgLatency: number;
  } {
    const filtered = since
      ? this.usage.filter(u => u.timestamp >= since)
      : this.usage;

    const byProvider: Record<string, number> = {};
    const byModel: Record<string, number> = {};

    for (const u of filtered) {
      byProvider[u.provider] = (byProvider[u.provider] || 0) + u.cost;
      byModel[u.model] = (byModel[u.model] || 0) + u.cost;
    }

    const successCount = filtered.filter(u => u.success).length;
    const totalLatency = filtered.reduce((sum, u) => sum + u.latencyMs, 0);

    return {
      totalCost: filtered.reduce((sum, u) => sum + u.cost, 0),
      byProvider,
      byModel,
      totalRequests: filtered.length,
      successRate: filtered.length > 0 ? successCount / filtered.length : 0,
      avgLatency: filtered.length > 0 ? totalLatency / filtered.length : 0,
    };
  }
}

export const costTracker = new CostTracker();
```

## Model Router

```typescript
// lib/ai/router.ts

import {
  Provider,
  ModelConfig,
  RoutingContext,
  RoutingResult,
  TaskType,
  ModelCapability
} from './types';
import { MODEL_REGISTRY, getModelsByTier, getModelsByCapability } from './registry';
import { estimateCost, estimateOutputTokens } from './cost';

interface ProviderHealth {
  provider: Provider;
  healthy: boolean;
  lastCheck: Date;
  latencyMs: number;
}

const providerHealth: Map<Provider, ProviderHealth> = new Map();

// Task to capability mapping
const TASK_CAPABILITIES: Record<TaskType, ModelCapability[]> = {
  'simple-chat': ['chat'],
  'complex-reasoning': ['chat', 'reasoning'],
  'code-generation': ['code', 'chat'],
  'code-review': ['code', 'reasoning'],
  'summarization': ['chat'],
  'translation': ['chat'],
  'creative-writing': ['chat'],
  'data-extraction': ['json-mode', 'function-calling'],
};

// Task to recommended models (preference order)
const TASK_MODEL_PREFERENCES: Record<TaskType, string[]> = {
  'simple-chat': ['gpt-4o-mini', 'claude-3-haiku-20240307', 'gpt-3.5-turbo'],
  'complex-reasoning': ['claude-3-opus-20240229', 'gpt-4-turbo-preview', 'claude-3-5-sonnet-20241022'],
  'code-generation': ['claude-3-5-sonnet-20241022', 'gpt-4-turbo-preview', 'gpt-4o'],
  'code-review': ['claude-3-5-sonnet-20241022', 'gpt-4o', 'gpt-4-turbo-preview'],
  'summarization': ['claude-3-haiku-20240307', 'gpt-4o-mini', 'gpt-3.5-turbo'],
  'translation': ['gpt-4o', 'claude-3-5-sonnet-20241022', 'gpt-4-turbo-preview'],
  'creative-writing': ['claude-3-opus-20240229', 'gpt-4-turbo-preview', 'claude-3-5-sonnet-20241022'],
  'data-extraction': ['gpt-4o', 'gpt-4-turbo-preview', 'claude-3-5-sonnet-20241022'],
};

export class ModelRouter {
  private healthCheckInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.startHealthChecks();
  }

  private async startHealthChecks(): Promise<void> {
    // Initial health check
    await this.checkAllProviders();

    // Periodic health checks every 30 seconds
    this.healthCheckInterval = setInterval(() => {
      this.checkAllProviders();
    }, 30000);
  }

  private async checkAllProviders(): Promise<void> {
    const providers: Provider[] = ['openai', 'anthropic', 'azure'];

    await Promise.all(providers.map(async (provider) => {
      const start = Date.now();
      let healthy = false;

      try {
        switch (provider) {
          case 'openai':
            const { checkOpenAIHealth } = await import('./providers/openai');
            healthy = await checkOpenAIHealth();
            break;
          case 'anthropic':
            const { checkAnthropicHealth } = await import('./providers/anthropic');
            healthy = await checkAnthropicHealth();
            break;
          case 'azure':
            const { checkAzureHealth } = await import('./providers/azure');
            healthy = await checkAzureHealth();
            break;
        }
      } catch {
        healthy = false;
      }

      providerHealth.set(provider, {
        provider,
        healthy,
        lastCheck: new Date(),
        latencyMs: Date.now() - start,
      });
    }));
  }

  isProviderHealthy(provider: Provider): boolean {
    const health = providerHealth.get(provider);
    if (!health) return true; // Assume healthy if not checked yet

    // Consider stale health checks as potentially healthy
    const staleThreshold = 60000; // 1 minute
    if (Date.now() - health.lastCheck.getTime() > staleThreshold) {
      return true;
    }

    return health.healthy;
  }

  selectModel(context: RoutingContext): RoutingResult {
    const {
      taskType,
      estimatedTokens,
      userTier,
      preferredProvider,
      maxCostPerRequest,
      requiresVision,
      requiresFunctionCalling,
    } = context;

    // Get models available to user tier
    let availableModels = getModelsByTier(userTier);

    // Filter by required capabilities
    const requiredCapabilities = [...TASK_CAPABILITIES[taskType]];
    if (requiresVision) requiredCapabilities.push('vision');
    if (requiresFunctionCalling) requiredCapabilities.push('function-calling');

    availableModels = availableModels.filter(model =>
      requiredCapabilities.every(cap => model.capabilities.includes(cap))
    );

    // Filter by healthy providers
    availableModels = availableModels.filter(model =>
      this.isProviderHealthy(model.provider)
    );

    // Prefer specified provider if healthy
    if (preferredProvider && this.isProviderHealthy(preferredProvider)) {
      const preferredModels = availableModels.filter(m => m.provider === preferredProvider);
      if (preferredModels.length > 0) {
        availableModels = preferredModels;
      }
    }

    // Filter by cost constraint
    if (maxCostPerRequest) {
      const estimatedOutput = estimateOutputTokens(taskType, estimatedTokens);
      availableModels = availableModels.filter(model => {
        const cost = estimateCost(model.id, estimatedTokens, estimatedOutput);
        return cost <= maxCostPerRequest;
      });
    }

    // Sort by task preference order
    const preferenceOrder = TASK_MODEL_PREFERENCES[taskType];
    availableModels.sort((a, b) => {
      const aIndex = preferenceOrder.indexOf(a.id);
      const bIndex = preferenceOrder.indexOf(b.id);

      // Models in preference list come first
      if (aIndex === -1 && bIndex === -1) return 0;
      if (aIndex === -1) return 1;
      if (bIndex === -1) return -1;

      return aIndex - bIndex;
    });

    if (availableModels.length === 0) {
      throw new Error('No suitable models available for the given constraints');
    }

    const selectedModel = availableModels[0];
    const estimatedOutput = estimateOutputTokens(taskType, estimatedTokens);

    // Build fallback chain from remaining models
    const fallbackChain = availableModels.slice(1, 4);

    return {
      model: selectedModel,
      provider: selectedModel.provider,
      estimatedCost: estimateCost(selectedModel.id, estimatedTokens, estimatedOutput),
      fallbackChain,
    };
  }

  async executeWithFallback<T>(
    context: RoutingContext,
    executor: (model: ModelConfig) => Promise<T>
  ): Promise<{ result: T; model: ModelConfig; attempts: number }> {
    const routing = this.selectModel(context);
    const chain = [routing.model, ...routing.fallbackChain];

    let lastError: Error | null = null;

    for (let i = 0; i < chain.length; i++) {
      const model = chain[i];

      try {
        const result = await executor(model);
        return { result, model, attempts: i + 1 };
      } catch (error) {
        lastError = error as Error;

        // Mark provider as unhealthy
        providerHealth.set(model.provider, {
          provider: model.provider,
          healthy: false,
          lastCheck: new Date(),
          latencyMs: 0,
        });

        console.warn(`Model ${model.id} failed, trying fallback...`, error);
      }
    }

    throw lastError || new Error('All models in fallback chain failed');
  }

  destroy(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }
  }
}

export const modelRouter = new ModelRouter();
```

## Vercel AI SDK Integration

```typescript
// lib/ai/sdk.ts

import { streamText, generateText, LanguageModel } from 'ai';
import { openaiProvider } from './providers/openai';
import { anthropicProvider } from './providers/anthropic';
import { azureProvider } from './providers/azure';
import { ModelConfig, Provider, RoutingContext } from './types';
import { modelRouter } from './router';
import { costTracker, estimateCost, estimateTokens } from './cost';

function getLanguageModel(model: ModelConfig): LanguageModel {
  switch (model.provider) {
    case 'openai':
      return openaiProvider(model.id);
    case 'anthropic':
      return anthropicProvider(model.id);
    case 'azure':
      return azureProvider(model.id);
    default:
      throw new Error(`Unknown provider: ${model.provider}`);
  }
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface StreamOptions {
  messages: ChatMessage[];
  context?: Partial<RoutingContext>;
  onStart?: (model: ModelConfig) => void;
  onFinish?: (usage: { inputTokens: number; outputTokens: number; cost: number }) => void;
}

export async function streamWithRouting(options: StreamOptions) {
  const { messages, context = {}, onStart, onFinish } = options;

  // Estimate tokens from messages
  const inputText = messages.map(m => m.content).join(' ');
  const estimatedTokens = estimateTokens(inputText);

  const routingContext: RoutingContext = {
    taskType: context.taskType || 'simple-chat',
    estimatedTokens,
    userTier: context.userTier || 'free',
    preferredProvider: context.preferredProvider,
    maxCostPerRequest: context.maxCostPerRequest,
    requiresVision: context.requiresVision,
    requiresFunctionCalling: context.requiresFunctionCalling,
  };

  return modelRouter.executeWithFallback(routingContext, async (model) => {
    const languageModel = getLanguageModel(model);

    onStart?.(model);

    const startTime = Date.now();

    const result = await streamText({
      model: languageModel,
      messages,
    });

    // Track usage after completion
    result.usage.then((usage) => {
      const cost = estimateCost(model.id, usage.promptTokens, usage.completionTokens);

      costTracker.record({
        provider: model.provider,
        model: model.id,
        inputTokens: usage.promptTokens,
        outputTokens: usage.completionTokens,
        cost,
        latencyMs: Date.now() - startTime,
        success: true,
        timestamp: new Date(),
      });

      onFinish?.({
        inputTokens: usage.promptTokens,
        outputTokens: usage.completionTokens,
        cost,
      });
    });

    return result;
  });
}

export async function generateWithRouting(options: Omit<StreamOptions, 'onStart'>) {
  const { messages, context = {}, onFinish } = options;

  const inputText = messages.map(m => m.content).join(' ');
  const estimatedTokens = estimateTokens(inputText);

  const routingContext: RoutingContext = {
    taskType: context.taskType || 'simple-chat',
    estimatedTokens,
    userTier: context.userTier || 'free',
    preferredProvider: context.preferredProvider,
    maxCostPerRequest: context.maxCostPerRequest,
    requiresVision: context.requiresVision,
    requiresFunctionCalling: context.requiresFunctionCalling,
  };

  return modelRouter.executeWithFallback(routingContext, async (model) => {
    const languageModel = getLanguageModel(model);
    const startTime = Date.now();

    const result = await generateText({
      model: languageModel,
      messages,
    });

    const cost = estimateCost(model.id, result.usage.promptTokens, result.usage.completionTokens);

    costTracker.record({
      provider: model.provider,
      model: model.id,
      inputTokens: result.usage.promptTokens,
      outputTokens: result.usage.completionTokens,
      cost,
      latencyMs: Date.now() - startTime,
      success: true,
      timestamp: new Date(),
    });

    onFinish?.({
      inputTokens: result.usage.promptTokens,
      outputTokens: result.usage.completionTokens,
      cost,
    });

    return result;
  });
}
```

## API Route Handler

```typescript
// app/api/chat/route.ts

import { NextRequest } from 'next/server';
import { streamWithRouting, ChatMessage } from '@/lib/ai/sdk';
import { TaskType, Provider } from '@/lib/ai/types';
import { z } from 'zod';

const requestSchema = z.object({
  messages: z.array(z.object({
    role: z.enum(['user', 'assistant', 'system']),
    content: z.string(),
  })),
  taskType: z.enum([
    'simple-chat',
    'complex-reasoning',
    'code-generation',
    'code-review',
    'summarization',
    'translation',
    'creative-writing',
    'data-extraction',
  ]).optional(),
  preferredProvider: z.enum(['openai', 'anthropic', 'azure']).optional(),
  maxCostPerRequest: z.number().positive().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages, taskType, preferredProvider, maxCostPerRequest } = requestSchema.parse(body);

    // Get user tier from session/auth (simplified example)
    const userTier = 'pro' as const;

    const { result, model } = await streamWithRouting({
      messages: messages as ChatMessage[],
      context: {
        taskType: taskType as TaskType,
        userTier,
        preferredProvider: preferredProvider as Provider,
        maxCostPerRequest,
      },
    });

    // Return streaming response with model info in headers
    return result.toDataStreamResponse({
      headers: {
        'X-Model-Id': model.id,
        'X-Model-Provider': model.provider,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: 'Invalid request', details: error.errors }, { status: 400 });
    }

    console.error('Chat error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

## React Hook for Model Routing

```typescript
// hooks/use-routed-chat.ts

'use client';

import { useChat, Message } from 'ai/react';
import { useState, useCallback } from 'react';
import { TaskType, Provider, ModelConfig } from '@/lib/ai/types';

interface UseRoutedChatOptions {
  taskType?: TaskType;
  preferredProvider?: Provider;
  maxCostPerRequest?: number;
  onModelSelect?: (model: ModelConfig) => void;
}

export function useRoutedChat(options: UseRoutedChatOptions = {}) {
  const { taskType, preferredProvider, maxCostPerRequest, onModelSelect } = options;
  const [currentModel, setCurrentModel] = useState<string | null>(null);
  const [currentProvider, setCurrentProvider] = useState<Provider | null>(null);

  const chat = useChat({
    api: '/api/chat',
    body: {
      taskType,
      preferredProvider,
      maxCostPerRequest,
    },
    onResponse: (response) => {
      const modelId = response.headers.get('X-Model-Id');
      const provider = response.headers.get('X-Model-Provider') as Provider;

      if (modelId) setCurrentModel(modelId);
      if (provider) setCurrentProvider(provider);
    },
  });

  const sendMessage = useCallback(async (content: string) => {
    await chat.append({
      role: 'user',
      content,
    });
  }, [chat]);

  return {
    ...chat,
    currentModel,
    currentProvider,
    sendMessage,
  };
}
```

## Model Selector Component

```typescript
// components/model-selector.tsx

'use client';

import { useState } from 'react';
import { Provider, TaskType } from '@/lib/ai/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

interface ModelSelectorProps {
  onTaskTypeChange: (taskType: TaskType) => void;
  onProviderChange: (provider: Provider | undefined) => void;
  disabled?: boolean;
}

const TASK_TYPES: { value: TaskType; label: string; description: string }[] = [
  { value: 'simple-chat', label: 'Chat', description: 'General conversation' },
  { value: 'complex-reasoning', label: 'Reasoning', description: 'Complex analysis' },
  { value: 'code-generation', label: 'Code Gen', description: 'Write code' },
  { value: 'code-review', label: 'Code Review', description: 'Review code' },
  { value: 'summarization', label: 'Summarize', description: 'Condense content' },
  { value: 'translation', label: 'Translate', description: 'Language translation' },
  { value: 'creative-writing', label: 'Creative', description: 'Creative content' },
  { value: 'data-extraction', label: 'Extract', description: 'Structured data' },
];

const PROVIDERS: { value: Provider | 'auto'; label: string; color: string }[] = [
  { value: 'auto', label: 'Auto', color: 'bg-gray-500' },
  { value: 'openai', label: 'OpenAI', color: 'bg-green-500' },
  { value: 'anthropic', label: 'Anthropic', color: 'bg-orange-500' },
  { value: 'azure', label: 'Azure', color: 'bg-blue-500' },
];

export function ModelSelector({
  onTaskTypeChange,
  onProviderChange,
  disabled = false,
}: ModelSelectorProps) {
  const [taskType, setTaskType] = useState<TaskType>('simple-chat');
  const [provider, setProvider] = useState<Provider | 'auto'>('auto');

  const handleTaskTypeChange = (value: TaskType) => {
    setTaskType(value);
    onTaskTypeChange(value);
  };

  const handleProviderChange = (value: Provider | 'auto') => {
    setProvider(value);
    onProviderChange(value === 'auto' ? undefined : value);
  };

  const currentProvider = PROVIDERS.find(p => p.value === provider);

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Task:</span>
        <Select value={taskType} onValueChange={handleTaskTypeChange} disabled={disabled}>
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TASK_TYPES.map((task) => (
              <SelectItem key={task.value} value={task.value}>
                <div className="flex flex-col">
                  <span>{task.label}</span>
                  <span className="text-xs text-muted-foreground">{task.description}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Provider:</span>
        <Select value={provider} onValueChange={handleProviderChange} disabled={disabled}>
          <SelectTrigger className="w-[120px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PROVIDERS.map((p) => (
              <SelectItem key={p.value} value={p.value}>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${p.color}`} />
                  <span>{p.label}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {currentProvider && currentProvider.value !== 'auto' && (
        <Badge variant="outline" className="text-xs">
          <div className={`w-2 h-2 rounded-full ${currentProvider.color} mr-1`} />
          {currentProvider.label}
        </Badge>
      )}
    </div>
  );
}
```

## Examples

### Example 1: Cost-Optimized Customer Support Bot

```typescript
// app/support/chat.tsx

'use client';

import { useRoutedChat } from '@/hooks/use-routed-chat';
import { Badge } from '@/components/ui/badge';

export function SupportChat() {
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    currentModel,
    currentProvider,
  } = useRoutedChat({
    taskType: 'simple-chat',
    maxCostPerRequest: 0.01, // Cap at 1 cent per message
  });

  return (
    <div className="flex flex-col h-[500px]">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`p-3 rounded-lg ${
              message.role === 'user' ? 'bg-primary text-primary-foreground ml-auto' : 'bg-muted'
            } max-w-[80%]`}
          >
            {message.content}
          </div>
        ))}
      </div>

      <div className="border-t p-4">
        <div className="flex items-center gap-2 mb-2">
          {currentModel && (
            <Badge variant="secondary" className="text-xs">
              {currentProvider}: {currentModel}
            </Badge>
          )}
        </div>

        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            value={input}
            onChange={handleInputChange}
            placeholder="Ask a question..."
            className="flex-1 px-3 py-2 border rounded-lg"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
```

### Example 2: Multi-Provider Code Assistant

```typescript
// app/code/assistant.tsx

'use client';

import { useState } from 'react';
import { useRoutedChat } from '@/hooks/use-routed-chat';
import { ModelSelector } from '@/components/model-selector';
import { TaskType, Provider } from '@/lib/ai/types';

export function CodeAssistant() {
  const [taskType, setTaskType] = useState<TaskType>('code-generation');
  const [provider, setProvider] = useState<Provider | undefined>();

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    currentModel,
    currentProvider,
  } = useRoutedChat({
    taskType,
    preferredProvider: provider,
  });

  return (
    <div className="space-y-4">
      <ModelSelector
        onTaskTypeChange={setTaskType}
        onProviderChange={setProvider}
        disabled={isLoading}
      />

      <div className="border rounded-lg p-4 min-h-[400px]">
        {messages.map((message) => (
          <div key={message.id} className="mb-4">
            <div className="font-semibold text-sm text-muted-foreground mb-1">
              {message.role === 'user' ? 'You' : `Assistant (${currentModel})`}
            </div>
            <pre className="whitespace-pre-wrap bg-muted p-3 rounded-lg">
              {message.content}
            </pre>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <textarea
          value={input}
          onChange={handleInputChange}
          placeholder="Describe what code you need..."
          className="flex-1 px-3 py-2 border rounded-lg min-h-[80px]"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-2 bg-primary text-primary-foreground rounded-lg self-end"
        >
          {isLoading ? 'Generating...' : 'Generate'}
        </button>
      </form>
    </div>
  );
}
```

### Example 3: Usage Dashboard with Cost Tracking

```typescript
// app/admin/usage/page.tsx

import { costTracker } from '@/lib/ai/cost';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default async function UsageDashboard() {
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // Last 30 days
  const report = costTracker.getUsageReport(since);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">AI Usage Dashboard</h1>

      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Total Cost</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">${report.totalCost.toFixed(4)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Total Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{report.totalRequests}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Success Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{(report.successRate * 100).toFixed(1)}%</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Avg Latency</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{report.avgLatency.toFixed(0)}ms</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Cost by Provider</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(report.byProvider).map(([provider, cost]) => (
                <div key={provider} className="flex justify-between">
                  <span className="capitalize">{provider}</span>
                  <span className="font-mono">${cost.toFixed(4)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cost by Model</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(report.byModel)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 5)
                .map(([model, cost]) => (
                  <div key={model} className="flex justify-between">
                    <span className="text-sm">{model}</span>
                    <span className="font-mono">${cost.toFixed(4)}</span>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
```

## Anti-patterns

### Anti-pattern 1: Hardcoding Provider Selection

```typescript
// BAD - Hardcoded provider with no fallback
async function generateResponse(prompt: string) {
  const openai = new OpenAI();

  // If OpenAI is down, entire feature breaks
  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [{ role: 'user', content: prompt }],
  });

  return response.choices[0].message.content;
}

// GOOD - Use router with automatic fallbacks
async function generateResponse(prompt: string) {
  const { result } = await generateWithRouting({
    messages: [{ role: 'user', content: prompt }],
    context: {
      taskType: 'simple-chat',
      userTier: 'pro',
    },
  });

  return result.text;
}
```

### Anti-pattern 2: Ignoring Cost Constraints

```typescript
// BAD - Using expensive model for simple tasks
async function classifySentiment(text: string) {
  const anthropic = new Anthropic();

  // Claude Opus for simple classification is overkill
  const response = await anthropic.messages.create({
    model: 'claude-3-opus-20240229',
    max_tokens: 10,
    messages: [{ role: 'user', content: `Classify sentiment: ${text}` }],
  });

  return response.content[0].text;
}

// GOOD - Route to appropriate model based on task
async function classifySentiment(text: string) {
  const { result } = await generateWithRouting({
    messages: [
      { role: 'user', content: `Classify the sentiment of this text as positive, negative, or neutral: ${text}` }
    ],
    context: {
      taskType: 'data-extraction',
      userTier: 'free', // Use cheapest available model
      maxCostPerRequest: 0.001,
    },
  });

  return result.text;
}
```

### Anti-pattern 3: Not Tracking Usage

```typescript
// BAD - No visibility into costs
export async function POST(request: Request) {
  const { messages } = await request.json();

  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages,
  });

  // No tracking - surprise bill at end of month
  return Response.json({ content: response.choices[0].message.content });
}

// GOOD - Track all usage with metrics
export async function POST(request: Request) {
  const { messages } = await request.json();

  const { result, model } = await streamWithRouting({
    messages,
    context: { taskType: 'simple-chat', userTier: 'pro' },
    onFinish: ({ inputTokens, outputTokens, cost }) => {
      // Metrics are automatically tracked by costTracker
      console.log(`Request cost: $${cost.toFixed(4)}`);

      // Additional custom tracking
      analytics.track('ai_request', {
        model: model.id,
        provider: model.provider,
        cost,
        tokens: inputTokens + outputTokens,
      });
    },
  });

  return result.toDataStreamResponse();
}
```

### Anti-pattern 4: Synchronous Health Checks

```typescript
// BAD - Health check blocks every request
async function selectProvider(): Promise<Provider> {
  // These sequential checks add 500ms+ to every request
  const openaiHealthy = await checkOpenAIHealth();
  const anthropicHealthy = await checkAnthropicHealth();
  const azureHealthy = await checkAzureHealth();

  if (openaiHealthy) return 'openai';
  if (anthropicHealthy) return 'anthropic';
  if (azureHealthy) return 'azure';

  throw new Error('No providers available');
}

// GOOD - Background health checks with cached status
class ModelRouter {
  private healthCache: Map<Provider, boolean> = new Map();

  constructor() {
    // Check health in background every 30 seconds
    this.startHealthChecks();
  }

  private async startHealthChecks() {
    setInterval(async () => {
      const checks = await Promise.all([
        checkOpenAIHealth().then(h => this.healthCache.set('openai', h)),
        checkAnthropicHealth().then(h => this.healthCache.set('anthropic', h)),
        checkAzureHealth().then(h => this.healthCache.set('azure', h)),
      ]);
    }, 30000);
  }

  // Instant provider selection using cached health
  selectProvider(): Provider {
    if (this.healthCache.get('openai')) return 'openai';
    if (this.healthCache.get('anthropic')) return 'anthropic';
    if (this.healthCache.get('azure')) return 'azure';
    throw new Error('No providers available');
  }
}
```

## Testing

```typescript
// __tests__/model-router.test.ts

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ModelRouter } from '@/lib/ai/router';
import { RoutingContext } from '@/lib/ai/types';

describe('ModelRouter', () => {
  let router: ModelRouter;

  beforeEach(() => {
    router = new ModelRouter();
  });

  afterEach(() => {
    router.destroy();
  });

  describe('selectModel', () => {
    it('selects appropriate model for simple chat', () => {
      const context: RoutingContext = {
        taskType: 'simple-chat',
        estimatedTokens: 100,
        userTier: 'free',
      };

      const result = router.selectModel(context);

      // Should select a cheap model for simple chat
      expect(['gpt-4o-mini', 'claude-3-haiku-20240307', 'gpt-3.5-turbo'])
        .toContain(result.model.id);
    });

    it('selects reasoning-capable model for complex tasks', () => {
      const context: RoutingContext = {
        taskType: 'complex-reasoning',
        estimatedTokens: 500,
        userTier: 'enterprise',
      };

      const result = router.selectModel(context);

      expect(result.model.capabilities).toContain('reasoning');
    });

    it('respects cost constraints', () => {
      const context: RoutingContext = {
        taskType: 'code-generation',
        estimatedTokens: 1000,
        userTier: 'pro',
        maxCostPerRequest: 0.01,
      };

      const result = router.selectModel(context);

      expect(result.estimatedCost).toBeLessThanOrEqual(0.01);
    });

    it('prefers specified provider when healthy', () => {
      const context: RoutingContext = {
        taskType: 'simple-chat',
        estimatedTokens: 100,
        userTier: 'pro',
        preferredProvider: 'anthropic',
      };

      const result = router.selectModel(context);

      expect(result.provider).toBe('anthropic');
    });

    it('filters models by required capabilities', () => {
      const context: RoutingContext = {
        taskType: 'data-extraction',
        estimatedTokens: 500,
        userTier: 'pro',
        requiresFunctionCalling: true,
      };

      const result = router.selectModel(context);

      expect(result.model.capabilities).toContain('function-calling');
    });

    it('builds fallback chain with alternative models', () => {
      const context: RoutingContext = {
        taskType: 'code-generation',
        estimatedTokens: 500,
        userTier: 'pro',
      };

      const result = router.selectModel(context);

      expect(result.fallbackChain.length).toBeGreaterThan(0);
      expect(result.fallbackChain[0].id).not.toBe(result.model.id);
    });
  });

  describe('executeWithFallback', () => {
    it('returns result from primary model on success', async () => {
      const context: RoutingContext = {
        taskType: 'simple-chat',
        estimatedTokens: 100,
        userTier: 'free',
      };

      const executor = vi.fn().mockResolvedValue('response');

      const { result, attempts } = await router.executeWithFallback(context, executor);

      expect(result).toBe('response');
      expect(attempts).toBe(1);
    });

    it('falls back to secondary model on primary failure', async () => {
      const context: RoutingContext = {
        taskType: 'simple-chat',
        estimatedTokens: 100,
        userTier: 'pro',
      };

      const executor = vi.fn()
        .mockRejectedValueOnce(new Error('Primary failed'))
        .mockResolvedValue('fallback response');

      const { result, attempts } = await router.executeWithFallback(context, executor);

      expect(result).toBe('fallback response');
      expect(attempts).toBe(2);
    });

    it('throws after all fallbacks exhausted', async () => {
      const context: RoutingContext = {
        taskType: 'simple-chat',
        estimatedTokens: 100,
        userTier: 'free',
      };

      const executor = vi.fn().mockRejectedValue(new Error('All failed'));

      await expect(router.executeWithFallback(context, executor))
        .rejects.toThrow('All failed');
    });
  });
});
```

```typescript
// __tests__/cost-calculator.test.ts

import { describe, it, expect } from 'vitest';
import { estimateCost, estimateTokens, CostTracker } from '@/lib/ai/cost';

describe('Cost Calculator', () => {
  describe('estimateCost', () => {
    it('calculates correct cost for GPT-4', () => {
      const cost = estimateCost('gpt-4-turbo-preview', 1000, 500);

      // $0.01/1k input + $0.03/1k output
      const expected = (1000 / 1000) * 0.01 + (500 / 1000) * 0.03;
      expect(cost).toBeCloseTo(expected);
    });

    it('calculates correct cost for Claude', () => {
      const cost = estimateCost('claude-3-5-sonnet-20241022', 1000, 500);

      // $0.003/1k input + $0.015/1k output
      const expected = (1000 / 1000) * 0.003 + (500 / 1000) * 0.015;
      expect(cost).toBeCloseTo(expected);
    });
  });

  describe('estimateTokens', () => {
    it('estimates tokens from text length', () => {
      const text = 'Hello, world!'; // 13 chars
      const tokens = estimateTokens(text);

      // ~4 chars per token
      expect(tokens).toBe(Math.ceil(13 / 4));
    });
  });

  describe('CostTracker', () => {
    it('tracks total cost', () => {
      const tracker = new CostTracker();

      tracker.record({
        provider: 'openai',
        model: 'gpt-4',
        inputTokens: 100,
        outputTokens: 50,
        cost: 0.05,
        latencyMs: 500,
        success: true,
        timestamp: new Date(),
      });

      tracker.record({
        provider: 'anthropic',
        model: 'claude-3-sonnet',
        inputTokens: 200,
        outputTokens: 100,
        cost: 0.03,
        latencyMs: 400,
        success: true,
        timestamp: new Date(),
      });

      expect(tracker.getTotalCost()).toBeCloseTo(0.08);
    });

    it('generates usage report by provider', () => {
      const tracker = new CostTracker();

      tracker.record({
        provider: 'openai',
        model: 'gpt-4',
        inputTokens: 100,
        outputTokens: 50,
        cost: 0.05,
        latencyMs: 500,
        success: true,
        timestamp: new Date(),
      });

      const report = tracker.getUsageReport();

      expect(report.byProvider.openai).toBeCloseTo(0.05);
      expect(report.successRate).toBe(1);
    });
  });
});
```

## Related Skills

- [embeddings](./embeddings.md) - Vector embeddings for semantic search
- [streaming](./streaming.md) - Streaming AI responses with Suspense
- [agent-orchestration](./agent-orchestration.md) - Multi-step AI agents
- [prompt-versioning](./prompt-versioning.md) - A/B testing prompts
- [model-evaluation](./model-evaluation.md) - Evaluating LLM outputs

---

## Changelog

### 1.0.0 (2025-01-18)
- Initial implementation
- Multi-provider support (OpenAI, Anthropic, Azure)
- Cost calculation and tracking
- Automatic fallback chain
- Task-based model selection
- Vercel AI SDK integration
- React hooks for client components
