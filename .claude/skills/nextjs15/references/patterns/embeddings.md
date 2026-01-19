---
id: pt-embeddings
name: Vector Embeddings
version: 1.0.0
layer: L5
category: ai
description: Generate and use vector embeddings for semantic search, similarity matching, and RAG applications
tags: [embeddings, vectors, ai, openai, semantic-search, rag, next15, react19]
composes: []
dependencies:
  openai: "^4.77.0"
formula: "Embeddings = TextChunking + EmbeddingModel + VectorStore + SimilaritySearch"
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# Vector Embeddings

## When to Use

- When implementing semantic search
- For building recommendation systems
- When creating RAG (Retrieval Augmented Generation) pipelines
- For document similarity matching
- When building knowledge bases with AI

## Overview

This pattern implements vector embeddings generation using OpenAI's embedding models, stored in PostgreSQL with pgvector for efficient similarity search. It covers chunking, embedding generation, storage, and retrieval.

## Installation

```bash
npm install openai @vercel/postgres
```

## Database Setup with pgvector

```sql
-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Documents table with embedding
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  embedding vector(1536),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create index for similarity search
CREATE INDEX ON documents USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);
```

## Embedding Generator

```typescript
// lib/embeddings/generate.ts
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: text.replace(/\n/g, " ").trim(),
  });

  return response.data[0].embedding;
}

export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  const response = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: texts.map((t) => t.replace(/\n/g, " ").trim()),
  });

  return response.data.map((d) => d.embedding);
}
```

## Text Chunking

```typescript
// lib/embeddings/chunking.ts

interface ChunkOptions {
  maxChunkSize?: number;
  overlap?: number;
  separator?: string;
}

export function chunkText(
  text: string,
  options: ChunkOptions = {}
): string[] {
  const {
    maxChunkSize = 1000,
    overlap = 200,
    separator = "\n\n",
  } = options;

  const paragraphs = text.split(separator);
  const chunks: string[] = [];
  let currentChunk = "";

  for (const paragraph of paragraphs) {
    if (currentChunk.length + paragraph.length > maxChunkSize) {
      if (currentChunk) {
        chunks.push(currentChunk.trim());
        // Keep overlap from previous chunk
        const words = currentChunk.split(" ");
        const overlapWords = words.slice(-Math.floor(overlap / 5));
        currentChunk = overlapWords.join(" ");
      }
    }
    currentChunk += (currentChunk ? separator : "") + paragraph;
  }

  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}

export function chunkByTokens(
  text: string,
  maxTokens: number = 500,
  overlap: number = 50
): string[] {
  // Approximate tokens (1 token ~ 4 chars)
  const approxCharsPerChunk = maxTokens * 4;
  const approxOverlapChars = overlap * 4;

  return chunkText(text, {
    maxChunkSize: approxCharsPerChunk,
    overlap: approxOverlapChars,
  });
}
```

## Vector Store Operations

```typescript
// lib/embeddings/store.ts
import { sql } from "@vercel/postgres";
import { generateEmbedding, generateEmbeddings } from "./generate";
import { chunkText } from "./chunking";

interface Document {
  id: string;
  content: string;
  metadata: Record<string, unknown>;
  similarity?: number;
}

export async function storeDocument(
  content: string,
  metadata: Record<string, unknown> = {}
): Promise<string> {
  const embedding = await generateEmbedding(content);
  const embeddingStr = `[${embedding.join(",")}]`;

  const result = await sql`
    INSERT INTO documents (content, metadata, embedding)
    VALUES (${content}, ${JSON.stringify(metadata)}, ${embeddingStr}::vector)
    RETURNING id
  `;

  return result.rows[0].id;
}

export async function storeDocumentChunks(
  content: string,
  metadata: Record<string, unknown> = {}
): Promise<string[]> {
  const chunks = chunkText(content);
  const embeddings = await generateEmbeddings(chunks);
  const ids: string[] = [];

  for (let i = 0; i < chunks.length; i++) {
    const embeddingStr = `[${embeddings[i].join(",")}]`;
    const chunkMetadata = { ...metadata, chunkIndex: i, totalChunks: chunks.length };

    const result = await sql`
      INSERT INTO documents (content, metadata, embedding)
      VALUES (${chunks[i]}, ${JSON.stringify(chunkMetadata)}, ${embeddingStr}::vector)
      RETURNING id
    `;

    ids.push(result.rows[0].id);
  }

  return ids;
}

export async function searchSimilar(
  query: string,
  limit: number = 5,
  threshold: number = 0.7
): Promise<Document[]> {
  const queryEmbedding = await generateEmbedding(query);
  const embeddingStr = `[${queryEmbedding.join(",")}]`;

  const result = await sql`
    SELECT
      id,
      content,
      metadata,
      1 - (embedding <=> ${embeddingStr}::vector) as similarity
    FROM documents
    WHERE 1 - (embedding <=> ${embeddingStr}::vector) > ${threshold}
    ORDER BY embedding <=> ${embeddingStr}::vector
    LIMIT ${limit}
  `;

  return result.rows as Document[];
}

export async function deleteDocument(id: string): Promise<void> {
  await sql`DELETE FROM documents WHERE id = ${id}`;
}
```

## Semantic Search API

```typescript
// app/api/search/route.ts
import { NextRequest, NextResponse } from "next/server";
import { searchSimilar } from "@/lib/embeddings/store";
import { z } from "zod";

const searchSchema = z.object({
  query: z.string().min(1).max(1000),
  limit: z.number().min(1).max(20).optional().default(5),
  threshold: z.number().min(0).max(1).optional().default(0.7),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, limit, threshold } = searchSchema.parse(body);

    const results = await searchSimilar(query, limit, threshold);

    return NextResponse.json({ results });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Search failed" },
      { status: 500 }
    );
  }
}
```

## RAG Context Builder

```typescript
// lib/embeddings/rag.ts
import { searchSimilar } from "./store";
import OpenAI from "openai";

const openai = new OpenAI();

export async function buildContext(
  query: string,
  maxTokens: number = 3000
): Promise<string> {
  const documents = await searchSimilar(query, 10, 0.6);

  let context = "";
  let tokenCount = 0;

  for (const doc of documents) {
    const docTokens = Math.ceil(doc.content.length / 4);
    if (tokenCount + docTokens > maxTokens) break;

    context += doc.content + "\n\n---\n\n";
    tokenCount += docTokens;
  }

  return context.trim();
}

export async function ragQuery(
  userQuery: string,
  systemPrompt?: string
): Promise<string> {
  const context = await buildContext(userQuery);

  const response = await openai.chat.completions.create({
    model: "gpt-4-turbo-preview",
    messages: [
      {
        role: "system",
        content: systemPrompt || `You are a helpful assistant. Answer questions based on the following context:\n\n${context}`,
      },
      { role: "user", content: userQuery },
    ],
    temperature: 0.7,
  });

  return response.choices[0].message.content || "";
}
```

## Semantic Search Component

```typescript
// components/semantic-search.tsx
"use client";

import { useState } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Loader2, Search } from "lucide-react";

interface SearchResult {
  id: string;
  content: string;
  similarity: number;
}

export function SemanticSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    if (!debouncedQuery) {
      setResults([]);
      return;
    }

    setLoading(true);
    fetch("/api/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: debouncedQuery }),
    })
      .then((res) => res.json())
      .then((data) => setResults(data.results))
      .finally(() => setLoading(false));
  }, [debouncedQuery]);

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search semantically..."
          className="pl-10"
        />
        {loading && (
          <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin" />
        )}
      </div>

      <div className="space-y-2">
        {results.map((result) => (
          <Card key={result.id} className="p-4">
            <p className="text-sm">{result.content}</p>
            <p className="text-xs text-muted-foreground mt-2">
              Similarity: {(result.similarity * 100).toFixed(1)}%
            </p>
          </Card>
        ))}
      </div>
    </div>
  );
}
```

## Anti-patterns

### Don't Generate Embeddings Synchronously for Large Documents

```typescript
// BAD - Blocks response
const embedding = await generateEmbedding(largeDocument);
return { success: true };

// GOOD - Queue for background processing
await embeddingQueue.add({ documentId, content: largeDocument });
return { success: true, status: "processing" };
```

## Related Patterns

- [function-calling](./function-calling.md)
- [search](./search.md)
- [streaming](./streaming.md)

---

## Changelog

### 1.0.0 (2025-01-18)
- Initial implementation
- OpenAI embeddings
- pgvector integration
- RAG context builder
