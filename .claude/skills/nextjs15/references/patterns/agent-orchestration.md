---
id: pt-agent-orchestration
name: AI Agent Orchestration
version: 1.0.0
layer: L5
category: ai
description: Build multi-step AI agents with tool coordination, memory management, ReAct patterns, and robust error recovery
tags: [ai, agents, tools, orchestration, react-pattern, memory, llm, next15, react19]
composes: []
dependencies:
  ai: "^4.0.0"
  openai: "^4.77.0"
  "@anthropic-ai/sdk": "^0.33.0"
  zod: "^3.23.0"
formula: "AgentOrchestration = ReActLoop + ToolRegistry + MemoryStore + ErrorRecovery + StreamingUI"
performance:
  impact: medium
  lcp: neutral
  cls: neutral
accessibility:
  wcag: AA
  keyboard: true
  screen-reader: true
---

# AI Agent Orchestration

## Overview

AI agents are autonomous systems that can reason about tasks, use tools, and take actions to achieve goals. Unlike simple chat completions, agents operate in a loop where they analyze the situation, decide on actions, execute tools, observe results, and iterate until the task is complete. This pattern implements production-ready agent orchestration with the ReAct (Reasoning + Acting) framework.

The orchestration layer handles the complexity of multi-step reasoning, tool coordination, memory management, and graceful error recovery. It supports both synchronous and streaming execution modes, allowing users to observe the agent's thought process in real-time. The pattern integrates seamlessly with the Vercel AI SDK's tool calling capabilities and can work with OpenAI, Anthropic, or other LLM providers.

Production agents face unique challenges: they must handle tool failures gracefully, maintain context across multiple steps, avoid infinite loops, and provide transparency into their decision-making. This pattern addresses these concerns with retry strategies, memory limits, step budgets, and structured output that makes agent behavior observable and debuggable.

## When to Use

- When building assistants that need to perform multi-step tasks autonomously
- For automating workflows that require multiple tool invocations
- When implementing research agents that gather and synthesize information
- For code agents that can read, analyze, and modify codebases
- When building customer service bots that need to access multiple systems
- For data analysis agents that query databases and generate reports

## When NOT to Use

- Simple Q&A chatbots without tool usage
- Single-turn completions that don't require reasoning loops
- Tasks with strict latency requirements (agents add overhead)
- When human oversight is required for every action
- Highly deterministic workflows better suited to traditional programming

## Composition Diagram

```
+------------------------------------------------------------------+
|                        Agent Orchestrator                         |
|  +------------------------------------------------------------+  |
|  |                      ReAct Loop                             |  |
|  |  +--------+    +--------+    +--------+    +--------+      |  |
|  |  | Think  | -> | Decide | -> |  Act   | -> |Observe |--+   |  |
|  |  +--------+    +--------+    +--------+    +--------+  |   |  |
|  |       ^                                                |   |  |
|  |       +------------------------------------------------+   |  |
|  +------------------------------------------------------------+  |
|                              |                                    |
|  +------------------------------------------------------------+  |
|  |                    Tool Registry                            |  |
|  |  [search] [calculator] [code_exec] [web_browse] [database] |  |
|  +------------------------------------------------------------+  |
|                              |                                    |
|  +------------------------------------------------------------+  |
|  |                    Memory Store                             |  |
|  |  [Short-term: Messages] [Long-term: Vector DB] [Working]   |  |
|  +------------------------------------------------------------+  |
|                              |                                    |
|  +------------------------------------------------------------+  |
|  |                   Error Recovery                            |  |
|  |  [Retry Logic] [Fallback Tools] [Human Escalation]         |  |
|  +------------------------------------------------------------+  |
+------------------------------------------------------------------+
```

## Installation

```bash
npm install ai openai @anthropic-ai/sdk zod uuid
```

## Environment Configuration

```bash
# .env.local
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...

# Agent configuration
AGENT_MAX_STEPS=20
AGENT_STEP_TIMEOUT_MS=30000
AGENT_MEMORY_LIMIT=50
```

## Type Definitions

```typescript
// lib/agents/types.ts

import { z } from 'zod';

export type AgentStatus = 'idle' | 'thinking' | 'acting' | 'observing' | 'complete' | 'error';

export interface AgentMessage {
  id: string;
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string;
  timestamp: Date;
  toolCallId?: string;
  toolName?: string;
}

export interface ToolDefinition<TInput = unknown, TOutput = unknown> {
  name: string;
  description: string;
  parameters: z.ZodType<TInput>;
  execute: (input: TInput, context: ToolContext) => Promise<TOutput>;
  retryable?: boolean;
  timeout?: number;
}

export interface ToolContext {
  agentId: string;
  stepNumber: number;
  memory: MemoryStore;
  abort: AbortSignal;
}

export interface ToolCall {
  id: string;
  name: string;
  arguments: Record<string, unknown>;
}

export interface ToolResult {
  toolCallId: string;
  name: string;
  result: unknown;
  error?: string;
  duration: number;
}

export interface AgentStep {
  stepNumber: number;
  thought: string;
  action?: ToolCall;
  observation?: string;
  error?: string;
  duration: number;
  timestamp: Date;
}

export interface AgentConfig {
  maxSteps: number;
  stepTimeout: number;
  memoryLimit: number;
  model: string;
  systemPrompt: string;
  tools: ToolDefinition[];
  onStep?: (step: AgentStep) => void;
  onStatusChange?: (status: AgentStatus) => void;
}

export interface AgentResult {
  success: boolean;
  answer: string;
  steps: AgentStep[];
  totalDuration: number;
  tokensUsed: number;
  error?: string;
}

export interface MemoryEntry {
  id: string;
  type: 'message' | 'fact' | 'observation';
  content: string;
  timestamp: Date;
  importance: number;
  metadata?: Record<string, unknown>;
}

export interface MemoryStore {
  add(entry: Omit<MemoryEntry, 'id' | 'timestamp'>): string;
  get(id: string): MemoryEntry | undefined;
  search(query: string, limit?: number): MemoryEntry[];
  getRecent(limit?: number): MemoryEntry[];
  clear(): void;
  summarize(): string;
}
```

## Tool Registry

```typescript
// lib/agents/tools/registry.ts

import { ToolDefinition, ToolContext } from '../types';
import { z } from 'zod';

const toolRegistry = new Map<string, ToolDefinition>();

export function registerTool<TInput, TOutput>(tool: ToolDefinition<TInput, TOutput>): void {
  toolRegistry.set(tool.name, tool as ToolDefinition);
}

export function getTool(name: string): ToolDefinition | undefined {
  return toolRegistry.get(name);
}

export function getAllTools(): ToolDefinition[] {
  return Array.from(toolRegistry.values());
}

export function getToolsForAI(): Array<{
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters: Record<string, unknown>;
  };
}> {
  return getAllTools().map(tool => ({
    type: 'function' as const,
    function: {
      name: tool.name,
      description: tool.description,
      parameters: zodToJsonSchema(tool.parameters),
    },
  }));
}

function zodToJsonSchema(schema: z.ZodType): Record<string, unknown> {
  // Simplified conversion - in production use zod-to-json-schema
  if (schema instanceof z.ZodObject) {
    const shape = schema.shape;
    const properties: Record<string, unknown> = {};
    const required: string[] = [];

    for (const [key, value] of Object.entries(shape)) {
      properties[key] = zodToJsonSchema(value as z.ZodType);
      if (!(value as z.ZodType).isOptional()) {
        required.push(key);
      }
    }

    return {
      type: 'object',
      properties,
      required,
    };
  }

  if (schema instanceof z.ZodString) {
    return { type: 'string', description: schema.description };
  }

  if (schema instanceof z.ZodNumber) {
    return { type: 'number', description: schema.description };
  }

  if (schema instanceof z.ZodBoolean) {
    return { type: 'boolean', description: schema.description };
  }

  if (schema instanceof z.ZodArray) {
    return {
      type: 'array',
      items: zodToJsonSchema(schema.element),
    };
  }

  return { type: 'string' };
}
```

## Built-in Tools

```typescript
// lib/agents/tools/search.ts

import { z } from 'zod';
import { ToolDefinition } from '../types';

export const searchTool: ToolDefinition<{ query: string; limit?: number }, string[]> = {
  name: 'search',
  description: 'Search for information on the web. Returns relevant snippets.',
  parameters: z.object({
    query: z.string().describe('The search query'),
    limit: z.number().optional().default(5).describe('Maximum number of results'),
  }),
  retryable: true,
  timeout: 10000,
  execute: async ({ query, limit = 5 }, context) => {
    // Integration with search API (e.g., Serper, Tavily)
    const response = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.TAVILY_API_KEY}`,
      },
      body: JSON.stringify({
        query,
        max_results: limit,
        include_answer: true,
      }),
      signal: context.abort,
    });

    if (!response.ok) {
      throw new Error(`Search failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data.results.map((r: { content: string }) => r.content);
  },
};
```

```typescript
// lib/agents/tools/calculator.ts

import { z } from 'zod';
import { ToolDefinition } from '../types';

export const calculatorTool: ToolDefinition<{ expression: string }, number> = {
  name: 'calculator',
  description: 'Evaluate mathematical expressions. Supports basic arithmetic, percentages, and common functions.',
  parameters: z.object({
    expression: z.string().describe('The mathematical expression to evaluate (e.g., "2 + 2", "sqrt(16)", "15% of 200")'),
  }),
  retryable: false,
  timeout: 1000,
  execute: async ({ expression }) => {
    // Safe math evaluation (in production, use a proper math parser)
    const sanitized = expression
      .replace(/[^0-9+\-*/.()%\s]/g, '')
      .replace(/(\d+)%\s*of\s*(\d+)/gi, '($1/100)*$2')
      .replace(/sqrt\(([^)]+)\)/g, 'Math.sqrt($1)')
      .replace(/pow\(([^,]+),([^)]+)\)/g, 'Math.pow($1,$2)');

    try {
      const result = Function(`"use strict"; return (${sanitized})`)();
      if (typeof result !== 'number' || isNaN(result)) {
        throw new Error('Invalid result');
      }
      return result;
    } catch {
      throw new Error(`Could not evaluate expression: ${expression}`);
    }
  },
};
```

```typescript
// lib/agents/tools/code-executor.ts

import { z } from 'zod';
import { ToolDefinition } from '../types';

export const codeExecutorTool: ToolDefinition<
  { code: string; language: 'javascript' | 'python' },
  { output: string; error?: string }
> = {
  name: 'execute_code',
  description: 'Execute code in a sandboxed environment. Returns stdout output.',
  parameters: z.object({
    code: z.string().describe('The code to execute'),
    language: z.enum(['javascript', 'python']).describe('Programming language'),
  }),
  retryable: false,
  timeout: 30000,
  execute: async ({ code, language }, context) => {
    // In production, use a sandboxed execution environment like E2B or Modal
    const response = await fetch('https://api.e2b.dev/execute', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.E2B_API_KEY}`,
      },
      body: JSON.stringify({ code, language }),
      signal: context.abort,
    });

    if (!response.ok) {
      throw new Error(`Code execution failed: ${response.statusText}`);
    }

    return response.json();
  },
};
```

```typescript
// lib/agents/tools/database.ts

import { z } from 'zod';
import { ToolDefinition } from '../types';
import { sql } from '@vercel/postgres';

export const databaseQueryTool: ToolDefinition<
  { query: string; params?: unknown[] },
  { rows: unknown[]; rowCount: number }
> = {
  name: 'database_query',
  description: 'Execute a read-only SQL query against the database. Only SELECT queries are allowed.',
  parameters: z.object({
    query: z.string().describe('The SQL SELECT query to execute'),
    params: z.array(z.unknown()).optional().describe('Query parameters for prepared statements'),
  }),
  retryable: true,
  timeout: 10000,
  execute: async ({ query, params = [] }) => {
    // Validate query is read-only
    const normalized = query.trim().toUpperCase();
    if (!normalized.startsWith('SELECT')) {
      throw new Error('Only SELECT queries are allowed');
    }

    // Check for dangerous patterns
    const dangerous = ['DROP', 'DELETE', 'UPDATE', 'INSERT', 'ALTER', 'TRUNCATE'];
    for (const keyword of dangerous) {
      if (normalized.includes(keyword)) {
        throw new Error(`Query contains forbidden keyword: ${keyword}`);
      }
    }

    const result = await sql.query(query, params);
    return {
      rows: result.rows,
      rowCount: result.rowCount || 0,
    };
  },
};
```

```typescript
// lib/agents/tools/web-browser.ts

import { z } from 'zod';
import { ToolDefinition } from '../types';

export const webBrowserTool: ToolDefinition<
  { url: string; action: 'read' | 'screenshot' },
  { content: string; title?: string }
> = {
  name: 'web_browser',
  description: 'Read content from a webpage or take a screenshot.',
  parameters: z.object({
    url: z.string().url().describe('The URL to browse'),
    action: z.enum(['read', 'screenshot']).describe('Action to perform'),
  }),
  retryable: true,
  timeout: 15000,
  execute: async ({ url, action }, context) => {
    if (action === 'read') {
      const response = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; AgentBot/1.0)' },
        signal: context.abort,
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.statusText}`);
      }

      const html = await response.text();

      // Extract text content (simplified - use proper HTML parser in production)
      const textContent = html
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 5000); // Limit content length

      const titleMatch = html.match(/<title>([^<]+)<\/title>/i);

      return {
        content: textContent,
        title: titleMatch?.[1],
      };
    }

    // Screenshot action would use a headless browser service
    throw new Error('Screenshot action not implemented');
  },
};
```

## Memory Store Implementation

```typescript
// lib/agents/memory.ts

import { MemoryStore, MemoryEntry } from './types';
import { v4 as uuid } from 'uuid';

export class InMemoryStore implements MemoryStore {
  private entries: Map<string, MemoryEntry> = new Map();
  private maxEntries: number;

  constructor(maxEntries: number = 100) {
    this.maxEntries = maxEntries;
  }

  add(entry: Omit<MemoryEntry, 'id' | 'timestamp'>): string {
    const id = uuid();
    const fullEntry: MemoryEntry = {
      ...entry,
      id,
      timestamp: new Date(),
    };

    this.entries.set(id, fullEntry);

    // Prune old entries if over limit
    if (this.entries.size > this.maxEntries) {
      this.pruneOldEntries();
    }

    return id;
  }

  get(id: string): MemoryEntry | undefined {
    return this.entries.get(id);
  }

  search(query: string, limit: number = 10): MemoryEntry[] {
    const queryLower = query.toLowerCase();
    const results: Array<{ entry: MemoryEntry; score: number }> = [];

    for (const entry of this.entries.values()) {
      const contentLower = entry.content.toLowerCase();
      if (contentLower.includes(queryLower)) {
        // Simple relevance score based on position and importance
        const position = contentLower.indexOf(queryLower);
        const score = entry.importance * (1 - position / contentLower.length);
        results.push({ entry, score });
      }
    }

    return results
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(r => r.entry);
  }

  getRecent(limit: number = 20): MemoryEntry[] {
    return Array.from(this.entries.values())
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  clear(): void {
    this.entries.clear();
  }

  summarize(): string {
    const recent = this.getRecent(10);
    if (recent.length === 0) return 'No memory entries.';

    const facts = recent.filter(e => e.type === 'fact');
    const observations = recent.filter(e => e.type === 'observation');

    let summary = '';

    if (facts.length > 0) {
      summary += 'Known facts:\n';
      facts.forEach(f => { summary += `- ${f.content}\n`; });
    }

    if (observations.length > 0) {
      summary += '\nRecent observations:\n';
      observations.forEach(o => { summary += `- ${o.content}\n`; });
    }

    return summary;
  }

  private pruneOldEntries(): void {
    // Remove lowest importance entries first
    const sorted = Array.from(this.entries.entries())
      .sort(([, a], [, b]) => a.importance - b.importance);

    const toRemove = sorted.slice(0, sorted.length - this.maxEntries);
    for (const [id] of toRemove) {
      this.entries.delete(id);
    }
  }
}

// Vector-based memory for production (requires embeddings)
export class VectorMemoryStore implements MemoryStore {
  private entries: Map<string, MemoryEntry> = new Map();
  private embeddings: Map<string, number[]> = new Map();

  constructor(private embeddingFn: (text: string) => Promise<number[]>) {}

  async add(entry: Omit<MemoryEntry, 'id' | 'timestamp'>): Promise<string> {
    const id = uuid();
    const fullEntry: MemoryEntry = {
      ...entry,
      id,
      timestamp: new Date(),
    };

    this.entries.set(id, fullEntry);

    // Generate and store embedding
    const embedding = await this.embeddingFn(entry.content);
    this.embeddings.set(id, embedding);

    return id;
  }

  get(id: string): MemoryEntry | undefined {
    return this.entries.get(id);
  }

  async search(query: string, limit: number = 10): Promise<MemoryEntry[]> {
    const queryEmbedding = await this.embeddingFn(query);

    const results: Array<{ entry: MemoryEntry; similarity: number }> = [];

    for (const [id, embedding] of this.embeddings.entries()) {
      const entry = this.entries.get(id);
      if (entry) {
        const similarity = cosineSimilarity(queryEmbedding, embedding);
        results.push({ entry, similarity });
      }
    }

    return results
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit)
      .map(r => r.entry);
  }

  getRecent(limit: number = 20): MemoryEntry[] {
    return Array.from(this.entries.values())
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  clear(): void {
    this.entries.clear();
    this.embeddings.clear();
  }

  summarize(): string {
    const recent = this.getRecent(10);
    return recent.map(e => e.content).join('\n');
  }
}

function cosineSimilarity(a: number[], b: number[]): number {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}
```

## Agent Orchestrator

```typescript
// lib/agents/orchestrator.ts

import OpenAI from 'openai';
import { v4 as uuid } from 'uuid';
import {
  AgentConfig,
  AgentResult,
  AgentStep,
  AgentStatus,
  ToolCall,
  ToolResult,
  ToolContext,
  AgentMessage,
} from './types';
import { getTool, getToolsForAI } from './tools/registry';
import { InMemoryStore } from './memory';

const REACT_SYSTEM_PROMPT = `You are an AI agent that solves tasks by reasoning and using tools.

For each step, you should:
1. THINK: Analyze the current situation and what you know
2. DECIDE: Choose whether to use a tool or provide a final answer
3. ACT: If using a tool, specify the tool and arguments
4. OBSERVE: Review the tool result and update your understanding

When you have enough information to answer the user's question, respond with your final answer prefixed with "FINAL ANSWER:".

Available tools will be provided. Use them wisely to gather information and complete tasks.

Guidelines:
- Break complex tasks into smaller steps
- Verify information from multiple sources when possible
- If a tool fails, try an alternative approach
- Be concise but thorough in your reasoning
- If you cannot complete the task, explain why`;

export class AgentOrchestrator {
  private config: AgentConfig;
  private messages: AgentMessage[] = [];
  private steps: AgentStep[] = [];
  private status: AgentStatus = 'idle';
  private memory = new InMemoryStore();
  private abortController: AbortController | null = null;
  private openai: OpenAI;

  constructor(config: Partial<AgentConfig> & { tools: AgentConfig['tools'] }) {
    this.config = {
      maxSteps: config.maxSteps || 20,
      stepTimeout: config.stepTimeout || 30000,
      memoryLimit: config.memoryLimit || 50,
      model: config.model || 'gpt-4-turbo-preview',
      systemPrompt: config.systemPrompt || REACT_SYSTEM_PROMPT,
      tools: config.tools,
      onStep: config.onStep,
      onStatusChange: config.onStatusChange,
    };

    this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    // Register tools
    for (const tool of config.tools) {
      const { registerTool } = require('./tools/registry');
      registerTool(tool);
    }
  }

  private setStatus(status: AgentStatus): void {
    this.status = status;
    this.config.onStatusChange?.(status);
  }

  async run(userMessage: string): Promise<AgentResult> {
    const startTime = Date.now();
    this.abortController = new AbortController();

    // Initialize conversation
    this.messages = [
      {
        id: uuid(),
        role: 'system',
        content: this.config.systemPrompt,
        timestamp: new Date(),
      },
      {
        id: uuid(),
        role: 'user',
        content: userMessage,
        timestamp: new Date(),
      },
    ];

    this.memory.add({
      type: 'message',
      content: `User request: ${userMessage}`,
      importance: 1,
    });

    let totalTokens = 0;

    try {
      for (let step = 0; step < this.config.maxSteps; step++) {
        this.setStatus('thinking');

        const stepStartTime = Date.now();
        const stepResult = await this.executeStep(step);

        totalTokens += stepResult.tokens;

        const agentStep: AgentStep = {
          stepNumber: step + 1,
          thought: stepResult.thought,
          action: stepResult.action,
          observation: stepResult.observation,
          error: stepResult.error,
          duration: Date.now() - stepStartTime,
          timestamp: new Date(),
        };

        this.steps.push(agentStep);
        this.config.onStep?.(agentStep);

        // Check if agent provided final answer
        if (stepResult.finalAnswer) {
          this.setStatus('complete');
          return {
            success: true,
            answer: stepResult.finalAnswer,
            steps: this.steps,
            totalDuration: Date.now() - startTime,
            tokensUsed: totalTokens,
          };
        }

        // Add observation to memory
        if (stepResult.observation) {
          this.memory.add({
            type: 'observation',
            content: stepResult.observation,
            importance: 0.8,
          });
        }
      }

      // Max steps reached
      this.setStatus('error');
      return {
        success: false,
        answer: 'Maximum steps reached without completing the task.',
        steps: this.steps,
        totalDuration: Date.now() - startTime,
        tokensUsed: totalTokens,
        error: 'MAX_STEPS_EXCEEDED',
      };
    } catch (error) {
      this.setStatus('error');
      return {
        success: false,
        answer: 'Agent encountered an error.',
        steps: this.steps,
        totalDuration: Date.now() - startTime,
        tokensUsed: totalTokens,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  private async executeStep(stepNumber: number): Promise<{
    thought: string;
    action?: ToolCall;
    observation?: string;
    finalAnswer?: string;
    error?: string;
    tokens: number;
  }> {
    // Get completion from LLM
    const response = await this.openai.chat.completions.create({
      model: this.config.model,
      messages: this.messages.map(m => ({
        role: m.role as 'system' | 'user' | 'assistant',
        content: m.content,
        tool_call_id: m.toolCallId,
        name: m.toolName,
      })),
      tools: getToolsForAI(),
      tool_choice: 'auto',
    });

    const message = response.choices[0].message;
    const tokens = response.usage?.total_tokens || 0;

    // Check for final answer
    if (message.content?.includes('FINAL ANSWER:')) {
      const finalAnswer = message.content.split('FINAL ANSWER:')[1].trim();
      return { thought: message.content, finalAnswer, tokens };
    }

    // Handle tool calls
    if (message.tool_calls && message.tool_calls.length > 0) {
      const toolCall = message.tool_calls[0];
      const action: ToolCall = {
        id: toolCall.id,
        name: toolCall.function.name,
        arguments: JSON.parse(toolCall.function.arguments),
      };

      // Add assistant message
      this.messages.push({
        id: uuid(),
        role: 'assistant',
        content: message.content || `Using tool: ${action.name}`,
        timestamp: new Date(),
      });

      // Execute tool
      this.setStatus('acting');
      const toolResult = await this.executeTool(action, stepNumber);

      // Add tool result message
      this.messages.push({
        id: uuid(),
        role: 'tool',
        content: toolResult.error || JSON.stringify(toolResult.result, null, 2),
        timestamp: new Date(),
        toolCallId: action.id,
        toolName: action.name,
      });

      this.setStatus('observing');

      return {
        thought: message.content || '',
        action,
        observation: toolResult.error || JSON.stringify(toolResult.result),
        error: toolResult.error,
        tokens,
      };
    }

    // No tool call, just thinking
    this.messages.push({
      id: uuid(),
      role: 'assistant',
      content: message.content || '',
      timestamp: new Date(),
    });

    return { thought: message.content || '', tokens };
  }

  private async executeTool(action: ToolCall, stepNumber: number): Promise<ToolResult> {
    const startTime = Date.now();
    const tool = getTool(action.name);

    if (!tool) {
      return {
        toolCallId: action.id,
        name: action.name,
        result: null,
        error: `Unknown tool: ${action.name}`,
        duration: Date.now() - startTime,
      };
    }

    const context: ToolContext = {
      agentId: uuid(),
      stepNumber,
      memory: this.memory,
      abort: this.abortController!.signal,
    };

    // Execute with timeout and retry
    const maxRetries = tool.retryable ? 3 : 1;
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(
            () => reject(new Error('Tool execution timeout')),
            tool.timeout || this.config.stepTimeout
          );
        });

        const result = await Promise.race([
          tool.execute(action.arguments, context),
          timeoutPromise,
        ]);

        return {
          toolCallId: action.id,
          name: action.name,
          result,
          duration: Date.now() - startTime,
        };
      } catch (error) {
        lastError = error as Error;
        if (attempt < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
        }
      }
    }

    return {
      toolCallId: action.id,
      name: action.name,
      result: null,
      error: lastError?.message || 'Tool execution failed',
      duration: Date.now() - startTime,
    };
  }

  abort(): void {
    this.abortController?.abort();
    this.setStatus('idle');
  }

  getStatus(): AgentStatus {
    return this.status;
  }

  getSteps(): AgentStep[] {
    return [...this.steps];
  }

  getMessages(): AgentMessage[] {
    return [...this.messages];
  }
}
```

## Streaming Agent Implementation

```typescript
// lib/agents/streaming-orchestrator.ts

import { streamText, tool } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';
import { AgentConfig, AgentStep, ToolDefinition } from './types';
import { InMemoryStore } from './memory';

export async function* streamAgent(
  userMessage: string,
  tools: ToolDefinition[],
  config: Partial<AgentConfig> = {}
): AsyncGenerator<{
  type: 'thought' | 'action' | 'observation' | 'answer' | 'error';
  content: string;
  step?: number;
}> {
  const maxSteps = config.maxSteps || 10;
  const memory = new InMemoryStore();

  const aiTools = Object.fromEntries(
    tools.map(t => [
      t.name,
      tool({
        description: t.description,
        parameters: t.parameters,
        execute: async (args) => {
          const context = {
            agentId: 'streaming',
            stepNumber: 0,
            memory,
            abort: new AbortController().signal,
          };
          return t.execute(args, context);
        },
      }),
    ])
  );

  const messages: Array<{ role: 'user' | 'assistant'; content: string }> = [
    { role: 'user', content: userMessage },
  ];

  for (let step = 0; step < maxSteps; step++) {
    yield { type: 'thought', content: `Step ${step + 1}: Analyzing...`, step };

    try {
      const result = await streamText({
        model: openai(config.model || 'gpt-4-turbo-preview'),
        system: config.systemPrompt || 'You are a helpful AI agent. Use tools to complete tasks.',
        messages,
        tools: aiTools,
        maxSteps: 1,
      });

      let fullResponse = '';

      for await (const chunk of result.textStream) {
        fullResponse += chunk;
        yield { type: 'thought', content: chunk, step };
      }

      // Check for tool calls
      const toolCalls = await result.toolCalls;
      if (toolCalls && toolCalls.length > 0) {
        for (const call of toolCalls) {
          yield {
            type: 'action',
            content: `Using ${call.toolName}: ${JSON.stringify(call.args)}`,
            step,
          };
        }

        const toolResults = await result.toolResults;
        for (const toolResult of toolResults) {
          yield {
            type: 'observation',
            content: JSON.stringify(toolResult.result),
            step,
          };
        }

        // Add to messages for next iteration
        messages.push({ role: 'assistant', content: fullResponse });
      }

      // Check for final answer
      if (fullResponse.includes('FINAL ANSWER:')) {
        const answer = fullResponse.split('FINAL ANSWER:')[1].trim();
        yield { type: 'answer', content: answer };
        return;
      }

      if (!toolCalls || toolCalls.length === 0) {
        // No tool calls and no final answer - might be done
        yield { type: 'answer', content: fullResponse };
        return;
      }
    } catch (error) {
      yield {
        type: 'error',
        content: error instanceof Error ? error.message : 'Unknown error',
        step,
      };
      return;
    }
  }

  yield { type: 'error', content: 'Maximum steps reached' };
}
```

## API Route Handler

```typescript
// app/api/agent/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { AgentOrchestrator } from '@/lib/agents/orchestrator';
import { searchTool } from '@/lib/agents/tools/search';
import { calculatorTool } from '@/lib/agents/tools/calculator';
import { webBrowserTool } from '@/lib/agents/tools/web-browser';
import { z } from 'zod';

const requestSchema = z.object({
  message: z.string().min(1).max(10000),
  tools: z.array(z.string()).optional(),
  maxSteps: z.number().min(1).max(50).optional(),
});

const availableTools = {
  search: searchTool,
  calculator: calculatorTool,
  web_browser: webBrowserTool,
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, tools: toolNames, maxSteps } = requestSchema.parse(body);

    // Select tools
    const selectedTools = toolNames
      ? toolNames.map(name => availableTools[name as keyof typeof availableTools]).filter(Boolean)
      : Object.values(availableTools);

    const agent = new AgentOrchestrator({
      tools: selectedTools,
      maxSteps: maxSteps || 20,
    });

    const result = await agent.run(message);

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Agent error:', error);
    return NextResponse.json(
      { error: 'Agent execution failed' },
      { status: 500 }
    );
  }
}
```

## Streaming API Route

```typescript
// app/api/agent/stream/route.ts

import { NextRequest } from 'next/server';
import { streamAgent } from '@/lib/agents/streaming-orchestrator';
import { searchTool } from '@/lib/agents/tools/search';
import { calculatorTool } from '@/lib/agents/tools/calculator';

export async function POST(request: NextRequest) {
  const { message } = await request.json();

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const event of streamAgent(message, [searchTool, calculatorTool])) {
          const data = JSON.stringify(event) + '\n';
          controller.enqueue(encoder.encode(`data: ${data}\n`));
        }
        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
      } catch (error) {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ type: 'error', content: 'Stream error' })}\n\n`)
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
```

## React Components

```typescript
// components/agent-workspace.tsx

'use client';

import { useState, useCallback } from 'react';
import { AgentStep, AgentStatus } from '@/lib/agents/types';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Play, Square, CheckCircle, XCircle, Wrench, Brain } from 'lucide-react';

interface AgentWorkspaceProps {
  onSubmit: (message: string) => Promise<void>;
  steps: AgentStep[];
  status: AgentStatus;
  answer: string | null;
  onAbort?: () => void;
}

export function AgentWorkspace({
  onSubmit,
  steps,
  status,
  answer,
  onAbort,
}: AgentWorkspaceProps) {
  const [input, setInput] = useState('');

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || status !== 'idle') return;
    await onSubmit(input);
    setInput('');
  }, [input, status, onSubmit]);

  const getStatusIcon = () => {
    switch (status) {
      case 'thinking':
        return <Brain className="h-4 w-4 animate-pulse" />;
      case 'acting':
        return <Wrench className="h-4 w-4 animate-bounce" />;
      case 'observing':
        return <Loader2 className="h-4 w-4 animate-spin" />;
      case 'complete':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Describe a task for the agent..."
          className="flex-1"
          disabled={status !== 'idle'}
        />
        <div className="flex flex-col gap-2">
          <Button type="submit" disabled={status !== 'idle' || !input.trim()}>
            <Play className="h-4 w-4 mr-2" />
            Run
          </Button>
          {status !== 'idle' && status !== 'complete' && status !== 'error' && (
            <Button type="button" variant="destructive" onClick={onAbort}>
              <Square className="h-4 w-4 mr-2" />
              Stop
            </Button>
          )}
        </div>
      </form>

      {status !== 'idle' && (
        <div className="flex items-center gap-2">
          {getStatusIcon()}
          <span className="text-sm capitalize">{status}</span>
        </div>
      )}

      <div className="space-y-3">
        {steps.map((step, index) => (
          <Card key={index} className={step.error ? 'border-red-500' : ''}>
            <CardHeader className="py-3">
              <CardTitle className="text-sm flex items-center justify-between">
                <span>Step {step.stepNumber}</span>
                <Badge variant="outline">{step.duration}ms</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="py-2 space-y-2">
              {step.thought && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Thought</p>
                  <p className="text-sm">{step.thought}</p>
                </div>
              )}
              {step.action && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Action</p>
                  <code className="text-xs bg-muted p-2 rounded block">
                    {step.action.name}({JSON.stringify(step.action.arguments)})
                  </code>
                </div>
              )}
              {step.observation && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Observation</p>
                  <pre className="text-xs bg-muted p-2 rounded overflow-x-auto">
                    {step.observation.slice(0, 500)}
                    {step.observation.length > 500 && '...'}
                  </pre>
                </div>
              )}
              {step.error && (
                <div className="text-red-500 text-sm">
                  Error: {step.error}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {answer && (
        <Card className="bg-primary/5 border-primary">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Final Answer
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap">{answer}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
```

```typescript
// hooks/use-agent.ts

'use client';

import { useState, useCallback, useRef } from 'react';
import { AgentStep, AgentStatus, AgentResult } from '@/lib/agents/types';

export function useAgent() {
  const [steps, setSteps] = useState<AgentStep[]>([]);
  const [status, setStatus] = useState<AgentStatus>('idle');
  const [answer, setAnswer] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const run = useCallback(async (message: string) => {
    setSteps([]);
    setAnswer(null);
    setError(null);
    setStatus('thinking');

    abortRef.current = new AbortController();

    try {
      const response = await fetch('/api/agent/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
        signal: abortRef.current.signal,
      });

      if (!response.ok) throw new Error('Agent request failed');

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');

      const decoder = new TextDecoder();
      let currentStep: Partial<AgentStep> = {};

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter(line => line.startsWith('data: '));

        for (const line of lines) {
          const data = line.slice(6);
          if (data === '[DONE]') continue;

          try {
            const event = JSON.parse(data);

            switch (event.type) {
              case 'thought':
                setStatus('thinking');
                currentStep.thought = (currentStep.thought || '') + event.content;
                break;
              case 'action':
                setStatus('acting');
                currentStep.action = event.content;
                break;
              case 'observation':
                setStatus('observing');
                currentStep.observation = event.content;
                // Complete the step
                setSteps(prev => [...prev, {
                  ...currentStep,
                  stepNumber: (event.step || 0) + 1,
                  duration: 0,
                  timestamp: new Date(),
                } as AgentStep]);
                currentStep = {};
                break;
              case 'answer':
                setAnswer(event.content);
                setStatus('complete');
                break;
              case 'error':
                setError(event.content);
                setStatus('error');
                break;
            }
          } catch {
            // Ignore parse errors
          }
        }
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        setStatus('idle');
        return;
      }
      setError(err instanceof Error ? err.message : 'Unknown error');
      setStatus('error');
    }
  }, []);

  const abort = useCallback(() => {
    abortRef.current?.abort();
    setStatus('idle');
  }, []);

  const reset = useCallback(() => {
    setSteps([]);
    setAnswer(null);
    setError(null);
    setStatus('idle');
  }, []);

  return {
    steps,
    status,
    answer,
    error,
    run,
    abort,
    reset,
  };
}
```

## Examples

### Example 1: Research Agent

```typescript
// app/research/page.tsx

'use client';

import { useAgent } from '@/hooks/use-agent';
import { AgentWorkspace } from '@/components/agent-workspace';

export default function ResearchPage() {
  const { steps, status, answer, run, abort } = useAgent();

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Research Agent</h1>
      <p className="text-muted-foreground mb-4">
        Ask the agent to research any topic. It will search the web, analyze sources,
        and synthesize information into a comprehensive answer.
      </p>

      <AgentWorkspace
        onSubmit={run}
        steps={steps}
        status={status}
        answer={answer}
        onAbort={abort}
      />
    </div>
  );
}
```

### Example 2: Data Analysis Agent

```typescript
// lib/agents/tools/data-analysis.ts

import { z } from 'zod';
import { ToolDefinition } from '../types';

export const analyzeDataTool: ToolDefinition<
  { data: unknown[]; operation: 'sum' | 'avg' | 'count' | 'group' },
  unknown
> = {
  name: 'analyze_data',
  description: 'Perform statistical analysis on data arrays',
  parameters: z.object({
    data: z.array(z.unknown()).describe('The data array to analyze'),
    operation: z.enum(['sum', 'avg', 'count', 'group']).describe('Analysis operation'),
  }),
  execute: async ({ data, operation }) => {
    const numbers = data.filter((d): d is number => typeof d === 'number');

    switch (operation) {
      case 'sum':
        return numbers.reduce((a, b) => a + b, 0);
      case 'avg':
        return numbers.length > 0 ? numbers.reduce((a, b) => a + b, 0) / numbers.length : 0;
      case 'count':
        return data.length;
      case 'group':
        const groups: Record<string, number> = {};
        for (const item of data) {
          const key = String(item);
          groups[key] = (groups[key] || 0) + 1;
        }
        return groups;
    }
  },
};

// Example usage in agent
const dataAgent = new AgentOrchestrator({
  tools: [analyzeDataTool, databaseQueryTool],
  systemPrompt: `You are a data analysis agent. You can query databases and perform statistical analysis.
    Always validate data before analysis. Present results clearly with explanations.`,
});
```

### Example 3: Customer Support Agent

```typescript
// lib/agents/support-agent.ts

import { AgentOrchestrator } from './orchestrator';
import { z } from 'zod';
import { ToolDefinition } from './types';

const lookupOrderTool: ToolDefinition<{ orderId: string }, unknown> = {
  name: 'lookup_order',
  description: 'Look up order details by order ID',
  parameters: z.object({
    orderId: z.string().describe('The order ID to look up'),
  }),
  execute: async ({ orderId }) => {
    // Integration with order management system
    const response = await fetch(`/api/orders/${orderId}`);
    return response.json();
  },
};

const createTicketTool: ToolDefinition<
  { subject: string; description: string; priority: string },
  { ticketId: string }
> = {
  name: 'create_ticket',
  description: 'Create a support ticket for complex issues',
  parameters: z.object({
    subject: z.string().describe('Ticket subject'),
    description: z.string().describe('Detailed description'),
    priority: z.enum(['low', 'medium', 'high']).describe('Priority level'),
  }),
  execute: async ({ subject, description, priority }) => {
    const response = await fetch('/api/tickets', {
      method: 'POST',
      body: JSON.stringify({ subject, description, priority }),
    });
    return response.json();
  },
};

const refundTool: ToolDefinition<
  { orderId: string; reason: string; amount?: number },
  { refundId: string; status: string }
> = {
  name: 'process_refund',
  description: 'Process a refund for an order',
  parameters: z.object({
    orderId: z.string(),
    reason: z.string(),
    amount: z.number().optional().describe('Partial refund amount, omit for full refund'),
  }),
  execute: async ({ orderId, reason, amount }) => {
    // Refund processing logic
    const response = await fetch('/api/refunds', {
      method: 'POST',
      body: JSON.stringify({ orderId, reason, amount }),
    });
    return response.json();
  },
};

export const supportAgent = new AgentOrchestrator({
  tools: [lookupOrderTool, createTicketTool, refundTool],
  systemPrompt: `You are a customer support agent. Help customers with their orders, refunds, and issues.

Guidelines:
- Always look up order details before processing requests
- Be empathetic and professional
- For complex issues, create a support ticket
- Only process refunds when clearly justified
- Provide clear explanations of actions taken`,
  maxSteps: 10,
});
```

## Anti-patterns

### Anti-pattern 1: Unbounded Agent Loops

```typescript
// BAD - No step limit, can run forever
async function runAgent(message: string) {
  while (true) {
    const response = await llm.complete(message);

    if (response.includes('DONE')) break;

    // Agent can get stuck in infinite loop
    message = await executeTools(response);
  }
}

// GOOD - Bounded steps with clear termination
async function runAgent(message: string, maxSteps = 20) {
  for (let step = 0; step < maxSteps; step++) {
    const response = await llm.complete(message);

    // Check for explicit completion
    if (response.includes('FINAL ANSWER:')) {
      return extractAnswer(response);
    }

    // Check for no-progress (same response twice)
    if (response === previousResponse) {
      return { error: 'Agent stuck in loop' };
    }

    previousResponse = response;
    message = await executeTools(response);
  }

  return { error: 'Max steps exceeded' };
}
```

### Anti-pattern 2: Ignoring Tool Errors

```typescript
// BAD - Silently ignoring tool failures
async function executeTool(name: string, args: unknown) {
  try {
    const result = await tools[name].execute(args);
    return result;
  } catch {
    return null; // Agent has no idea what went wrong
  }
}

// GOOD - Informative error handling
async function executeTool(name: string, args: unknown) {
  try {
    const result = await tools[name].execute(args);
    return { success: true, result };
  } catch (error) {
    // Return error info so agent can adapt
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      suggestion: 'Try an alternative approach or different parameters',
    };
  }
}
```

### Anti-pattern 3: No Memory Management

```typescript
// BAD - Unlimited context growth
class Agent {
  private messages: Message[] = [];

  async run(input: string) {
    this.messages.push({ role: 'user', content: input });

    // Messages array grows without bound
    // Eventually exceeds context window
    const response = await llm.complete(this.messages);
    this.messages.push({ role: 'assistant', content: response });
  }
}

// GOOD - Managed memory with summarization
class Agent {
  private messages: Message[] = [];
  private memory: MemoryStore;
  private maxContextMessages = 20;

  async run(input: string) {
    this.messages.push({ role: 'user', content: input });

    // Summarize and trim old messages
    if (this.messages.length > this.maxContextMessages) {
      const oldMessages = this.messages.slice(0, -10);
      const summary = await this.summarizeMessages(oldMessages);

      this.memory.add({ type: 'fact', content: summary, importance: 0.9 });
      this.messages = this.messages.slice(-10);
    }

    // Include memory summary in context
    const memorySummary = this.memory.summarize();
    const context = [
      { role: 'system', content: `Previous context: ${memorySummary}` },
      ...this.messages,
    ];

    const response = await llm.complete(context);
    this.messages.push({ role: 'assistant', content: response });
  }
}
```

### Anti-pattern 4: Unsafe Tool Execution

```typescript
// BAD - Executing arbitrary code from LLM
const codeExecutor = {
  name: 'execute_code',
  execute: async ({ code }) => {
    // DANGEROUS: Running untrusted code
    return eval(code);
  },
};

// GOOD - Sandboxed execution with validation
const codeExecutor = {
  name: 'execute_code',
  execute: async ({ code, language }) => {
    // Validate code doesn't contain dangerous patterns
    const dangerous = ['process.', 'require(', 'import ', 'eval(', 'exec('];
    for (const pattern of dangerous) {
      if (code.includes(pattern)) {
        throw new Error(`Code contains forbidden pattern: ${pattern}`);
      }
    }

    // Execute in sandboxed environment
    const result = await sandboxedRuntime.execute({
      code,
      language,
      timeout: 5000,
      memoryLimit: '128MB',
      networkAccess: false,
    });

    return result;
  },
};
```

## Testing

```typescript
// __tests__/agent-orchestrator.test.ts

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AgentOrchestrator } from '@/lib/agents/orchestrator';
import { ToolDefinition } from '@/lib/agents/types';
import { z } from 'zod';

const mockTool: ToolDefinition<{ input: string }, string> = {
  name: 'mock_tool',
  description: 'A mock tool for testing',
  parameters: z.object({ input: z.string() }),
  execute: vi.fn().mockResolvedValue('mock result'),
};

describe('AgentOrchestrator', () => {
  let agent: AgentOrchestrator;

  beforeEach(() => {
    vi.clearAllMocks();
    agent = new AgentOrchestrator({
      tools: [mockTool],
      maxSteps: 5,
    });
  });

  it('completes simple task without tools', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        choices: [{
          message: {
            content: 'FINAL ANSWER: Hello, world!',
          },
        }],
        usage: { total_tokens: 100 },
      }),
    } as Response);

    const result = await agent.run('Say hello');

    expect(result.success).toBe(true);
    expect(result.answer).toBe('Hello, world!');
    expect(result.steps.length).toBe(1);
  });

  it('executes tools and returns result', async () => {
    // First call - tool usage
    vi.spyOn(global, 'fetch')
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [{
            message: {
              content: 'Let me use the tool',
              tool_calls: [{
                id: 'call_1',
                function: {
                  name: 'mock_tool',
                  arguments: JSON.stringify({ input: 'test' }),
                },
              }],
            },
          }],
          usage: { total_tokens: 50 },
        }),
      } as Response)
      // Second call - final answer
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [{
            message: {
              content: 'FINAL ANSWER: The result is mock result',
            },
          }],
          usage: { total_tokens: 50 },
        }),
      } as Response);

    const result = await agent.run('Use the tool');

    expect(result.success).toBe(true);
    expect(mockTool.execute).toHaveBeenCalledWith(
      { input: 'test' },
      expect.any(Object)
    );
  });

  it('respects max steps limit', async () => {
    // Always return tool call, never finish
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [{
          message: {
            content: 'Continuing...',
            tool_calls: [{
              id: 'call_1',
              function: {
                name: 'mock_tool',
                arguments: JSON.stringify({ input: 'loop' }),
              },
            }],
          },
        }],
        usage: { total_tokens: 50 },
      }),
    } as Response);

    const result = await agent.run('Run forever');

    expect(result.success).toBe(false);
    expect(result.error).toBe('MAX_STEPS_EXCEEDED');
    expect(result.steps.length).toBe(5);
  });

  it('handles tool execution errors', async () => {
    mockTool.execute = vi.fn().mockRejectedValue(new Error('Tool failed'));

    vi.spyOn(global, 'fetch')
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [{
            message: {
              tool_calls: [{
                id: 'call_1',
                function: {
                  name: 'mock_tool',
                  arguments: JSON.stringify({ input: 'fail' }),
                },
              }],
            },
          }],
          usage: { total_tokens: 50 },
        }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [{
            message: {
              content: 'FINAL ANSWER: Tool failed but I can still answer',
            },
          }],
          usage: { total_tokens: 50 },
        }),
      } as Response);

    const result = await agent.run('Handle error');

    expect(result.success).toBe(true);
    expect(result.steps[0].error).toBe('Tool failed');
  });
});
```

```typescript
// __tests__/memory.test.ts

import { describe, it, expect } from 'vitest';
import { InMemoryStore } from '@/lib/agents/memory';

describe('InMemoryStore', () => {
  it('adds and retrieves entries', () => {
    const store = new InMemoryStore();

    const id = store.add({
      type: 'fact',
      content: 'The sky is blue',
      importance: 0.8,
    });

    const entry = store.get(id);
    expect(entry?.content).toBe('The sky is blue');
  });

  it('searches by content', () => {
    const store = new InMemoryStore();

    store.add({ type: 'fact', content: 'Cats are mammals', importance: 0.8 });
    store.add({ type: 'fact', content: 'Dogs are mammals', importance: 0.8 });
    store.add({ type: 'fact', content: 'Fish are not mammals', importance: 0.8 });

    const results = store.search('mammals');
    expect(results.length).toBe(3);
  });

  it('prunes old entries when over limit', () => {
    const store = new InMemoryStore(3);

    store.add({ type: 'fact', content: 'Entry 1', importance: 0.1 });
    store.add({ type: 'fact', content: 'Entry 2', importance: 0.5 });
    store.add({ type: 'fact', content: 'Entry 3', importance: 0.9 });
    store.add({ type: 'fact', content: 'Entry 4', importance: 0.8 });

    const recent = store.getRecent(10);
    expect(recent.length).toBe(3);

    // Lowest importance entry should be removed
    const contents = recent.map(e => e.content);
    expect(contents).not.toContain('Entry 1');
  });
});
```

## Related Skills

- [model-routing](./model-routing.md) - Route between LLM providers
- [streaming](./streaming.md) - Stream AI responses
- [function-calling](./function-calling.md) - LLM function calling
- [embeddings](./embeddings.md) - Vector embeddings for memory
- [prompt-versioning](./prompt-versioning.md) - Version control for agent prompts

---

## Changelog

### 1.0.0 (2025-01-18)
- Initial implementation
- ReAct pattern orchestration
- Tool registry and built-in tools
- Memory management (in-memory and vector)
- Streaming agent support
- Error recovery and retry logic
- React components and hooks
