---
id: pt-function-calling
name: LLM Function Calling
version: 1.0.0
layer: L5
category: ai
description: Implement LLM function calling for tool use, API integrations, and agentic workflows
tags: [ai, llm, function-calling, tools, openai, anthropic, next15, react19]
composes: []
dependencies:
  openai: "^4.77.0"
formula: "FunctionCalling = ToolDefinitions + LLMRequest + ToolExecution + ResponseParsing"
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# LLM Function Calling

## When to Use

- When building AI assistants that interact with APIs
- For automating workflows with natural language
- When creating chatbots with external tool access
- For building agentic AI applications
- When implementing RAG with tool augmentation

## Overview

This pattern implements LLM function calling using OpenAI and Anthropic APIs. It covers tool definitions, execution loops, and streaming responses with tool use.

## Tool Definitions

```typescript
// lib/ai/tools.ts
import { z } from "zod";

export interface ToolDefinition {
  name: string;
  description: string;
  parameters: z.ZodType<any>;
  execute: (params: any) => Promise<any>;
}

// Weather tool
export const weatherTool: ToolDefinition = {
  name: "get_weather",
  description: "Get the current weather for a location",
  parameters: z.object({
    location: z.string().describe("City name or coordinates"),
    units: z.enum(["celsius", "fahrenheit"]).optional().default("celsius"),
  }),
  execute: async ({ location, units }) => {
    const response = await fetch(
      `https://api.weatherapi.com/v1/current.json?key=${process.env.WEATHER_API_KEY}&q=${location}`
    );
    const data = await response.json();
    return {
      location: data.location.name,
      temperature: units === "fahrenheit"
        ? data.current.temp_f
        : data.current.temp_c,
      condition: data.current.condition.text,
      humidity: data.current.humidity,
    };
  },
};

// Search tool
export const searchTool: ToolDefinition = {
  name: "search_web",
  description: "Search the web for information",
  parameters: z.object({
    query: z.string().describe("Search query"),
    limit: z.number().optional().default(5),
  }),
  execute: async ({ query, limit }) => {
    // Implement with your preferred search API
    const results = await performWebSearch(query, limit);
    return results;
  },
};

// Database query tool
export const queryDatabaseTool: ToolDefinition = {
  name: "query_database",
  description: "Query the application database",
  parameters: z.object({
    table: z.enum(["users", "orders", "products"]),
    filters: z.record(z.string()).optional(),
    limit: z.number().optional().default(10),
  }),
  execute: async ({ table, filters, limit }) => {
    // Implement database query with proper authorization
    return await queryDatabase(table, filters, limit);
  },
};

export const tools = [weatherTool, searchTool, queryDatabaseTool];
```

## OpenAI Function Calling

```typescript
// lib/ai/openai-tools.ts
import OpenAI from "openai";
import { tools, type ToolDefinition } from "./tools";
import { zodToJsonSchema } from "zod-to-json-schema";

const openai = new OpenAI();

function toolsToOpenAIFormat(tools: ToolDefinition[]): OpenAI.Chat.ChatCompletionTool[] {
  return tools.map((tool) => ({
    type: "function",
    function: {
      name: tool.name,
      description: tool.description,
      parameters: zodToJsonSchema(tool.parameters),
    },
  }));
}

export async function chatWithTools(
  messages: OpenAI.Chat.ChatCompletionMessageParam[],
  availableTools: ToolDefinition[] = tools
): Promise<string> {
  const openaiTools = toolsToOpenAIFormat(availableTools);

  let response = await openai.chat.completions.create({
    model: "gpt-4-turbo-preview",
    messages,
    tools: openaiTools,
    tool_choice: "auto",
  });

  // Tool execution loop
  while (response.choices[0].finish_reason === "tool_calls") {
    const toolCalls = response.choices[0].message.tool_calls!;

    // Add assistant message with tool calls
    messages.push(response.choices[0].message);

    // Execute each tool call
    for (const toolCall of toolCalls) {
      const tool = availableTools.find((t) => t.name === toolCall.function.name);

      if (!tool) {
        messages.push({
          role: "tool",
          tool_call_id: toolCall.id,
          content: JSON.stringify({ error: "Tool not found" }),
        });
        continue;
      }

      try {
        const args = JSON.parse(toolCall.function.arguments);
        const validatedArgs = tool.parameters.parse(args);
        const result = await tool.execute(validatedArgs);

        messages.push({
          role: "tool",
          tool_call_id: toolCall.id,
          content: JSON.stringify(result),
        });
      } catch (error) {
        messages.push({
          role: "tool",
          tool_call_id: toolCall.id,
          content: JSON.stringify({ error: String(error) }),
        });
      }
    }

    // Continue conversation with tool results
    response = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages,
      tools: openaiTools,
      tool_choice: "auto",
    });
  }

  return response.choices[0].message.content || "";
}
```

## Anthropic Tool Use

```typescript
// lib/ai/anthropic-tools.ts
import Anthropic from "@anthropic-ai/sdk";
import { tools, type ToolDefinition } from "./tools";
import { zodToJsonSchema } from "zod-to-json-schema";

const anthropic = new Anthropic();

function toolsToAnthropicFormat(tools: ToolDefinition[]): Anthropic.Tool[] {
  return tools.map((tool) => ({
    name: tool.name,
    description: tool.description,
    input_schema: zodToJsonSchema(tool.parameters) as Anthropic.Tool.InputSchema,
  }));
}

export async function chatWithToolsAnthropic(
  messages: Anthropic.MessageParam[],
  availableTools: ToolDefinition[] = tools
): Promise<string> {
  const anthropicTools = toolsToAnthropicFormat(availableTools);

  let response = await anthropic.messages.create({
    model: "claude-3-opus-20240229",
    max_tokens: 4096,
    messages,
    tools: anthropicTools,
  });

  // Tool execution loop
  while (response.stop_reason === "tool_use") {
    const toolUseBlocks = response.content.filter(
      (block): block is Anthropic.ToolUseBlock => block.type === "tool_use"
    );

    // Add assistant message
    messages.push({ role: "assistant", content: response.content });

    // Execute tools and collect results
    const toolResults: Anthropic.ToolResultBlockParam[] = [];

    for (const toolUse of toolUseBlocks) {
      const tool = availableTools.find((t) => t.name === toolUse.name);

      if (!tool) {
        toolResults.push({
          type: "tool_result",
          tool_use_id: toolUse.id,
          content: JSON.stringify({ error: "Tool not found" }),
          is_error: true,
        });
        continue;
      }

      try {
        const validatedInput = tool.parameters.parse(toolUse.input);
        const result = await tool.execute(validatedInput);

        toolResults.push({
          type: "tool_result",
          tool_use_id: toolUse.id,
          content: JSON.stringify(result),
        });
      } catch (error) {
        toolResults.push({
          type: "tool_result",
          tool_use_id: toolUse.id,
          content: JSON.stringify({ error: String(error) }),
          is_error: true,
        });
      }
    }

    // Add tool results and continue
    messages.push({ role: "user", content: toolResults });

    response = await anthropic.messages.create({
      model: "claude-3-opus-20240229",
      max_tokens: 4096,
      messages,
      tools: anthropicTools,
    });
  }

  const textBlock = response.content.find(
    (block): block is Anthropic.TextBlock => block.type === "text"
  );

  return textBlock?.text || "";
}
```

## API Route with Function Calling

```typescript
// app/api/chat/route.ts
import { NextRequest } from "next/server";
import { chatWithTools } from "@/lib/ai/openai-tools";
import { auth } from "@/auth";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { messages } = await request.json();

  try {
    const response = await chatWithTools([
      {
        role: "system",
        content: "You are a helpful assistant with access to various tools.",
      },
      ...messages,
    ]);

    return Response.json({ response });
  } catch (error) {
    console.error("Chat error:", error);
    return Response.json({ error: "Chat failed" }, { status: 500 });
  }
}
```

## Streaming with Tool Use

```typescript
// lib/ai/streaming-tools.ts
import OpenAI from "openai";
import { tools, type ToolDefinition } from "./tools";

const openai = new OpenAI();

export async function* streamWithTools(
  messages: OpenAI.Chat.ChatCompletionMessageParam[],
  availableTools: ToolDefinition[] = tools
): AsyncGenerator<{ type: string; content: any }> {
  const openaiTools = toolsToOpenAIFormat(availableTools);

  const stream = await openai.chat.completions.create({
    model: "gpt-4-turbo-preview",
    messages,
    tools: openaiTools,
    stream: true,
  });

  let toolCalls: Map<number, { name: string; arguments: string }> = new Map();
  let fullContent = "";

  for await (const chunk of stream) {
    const delta = chunk.choices[0].delta;

    if (delta.content) {
      fullContent += delta.content;
      yield { type: "text", content: delta.content };
    }

    if (delta.tool_calls) {
      for (const tc of delta.tool_calls) {
        if (!toolCalls.has(tc.index)) {
          toolCalls.set(tc.index, { name: "", arguments: "" });
        }
        const current = toolCalls.get(tc.index)!;
        if (tc.function?.name) current.name += tc.function.name;
        if (tc.function?.arguments) current.arguments += tc.function.arguments;
      }
    }

    if (chunk.choices[0].finish_reason === "tool_calls") {
      // Execute tools
      for (const [, { name, arguments: args }] of toolCalls) {
        yield { type: "tool_start", content: { name } };

        const tool = availableTools.find((t) => t.name === name);
        if (tool) {
          try {
            const result = await tool.execute(JSON.parse(args));
            yield { type: "tool_result", content: { name, result } };
          } catch (error) {
            yield { type: "tool_error", content: { name, error: String(error) } };
          }
        }
      }
    }
  }
}
```

## Chat Component with Tools

```typescript
// components/chat/chat-with-tools.tsx
"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
  toolResults?: { name: string; result: any }[];
}

export function ChatWithTools() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = { role: "user" as const, content: input };
    setMessages((m) => [...m, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(({ role, content }) => ({
            role,
            content,
          })),
        }),
      });

      const data = await response.json();
      setMessages((m) => [
        ...m,
        { role: "assistant", content: data.response },
      ]);
    } catch (error) {
      console.error("Chat error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[600px]">
      <div className="flex-1 overflow-auto p-4 space-y-4">
        {messages.map((msg, i) => (
          <Card
            key={i}
            className={`p-4 ${msg.role === "user" ? "ml-12 bg-primary text-primary-foreground" : "mr-12"}`}
          >
            <p className="whitespace-pre-wrap">{msg.content}</p>
          </Card>
        ))}
        {loading && (
          <div className="flex justify-center">
            <Loader2 className="animate-spin" />
          </div>
        )}
      </div>

      <div className="p-4 border-t flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Ask me anything..."
          disabled={loading}
        />
        <Button onClick={sendMessage} disabled={loading}>
          Send
        </Button>
      </div>
    </div>
  );
}
```

## Anti-patterns

### Don't Execute Tools Without Validation

```typescript
// BAD - Direct execution
const result = await tool.execute(JSON.parse(args));

// GOOD - Validate first
const validatedArgs = tool.parameters.parse(JSON.parse(args));
const result = await tool.execute(validatedArgs);
```

## Related Patterns

- [streaming](./streaming.md)
- [embeddings](./embeddings.md)
- [server-actions](./server-actions.md)

---

## Changelog

### 1.0.0 (2025-01-18)
- Initial implementation
- OpenAI and Anthropic support
- Tool definitions with Zod
- Streaming support
