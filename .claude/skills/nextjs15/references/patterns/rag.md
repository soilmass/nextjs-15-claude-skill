---
id: pt-rag
name: Retrieval Augmented Generation
version: 1.0.0
layer: L5
category: ai
description: Implement RAG patterns for AI-powered search with vector databases
tags: [ai, rag, embeddings, vector-db, next15, react19]
composes: []
dependencies:
  openai: "^4.77.0"
formula: "RAG = Embeddings + VectorDB + SemanticSearch + LLMGeneration"
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# Retrieval Augmented Generation

## Overview

RAG enhances LLM responses by retrieving relevant context from a knowledge base before generation. This pattern covers document embedding, vector storage, semantic search, and context-aware generation.

## When to Use

- AI chatbots with custom knowledge bases
- Document Q&A systems
- Semantic search implementations
- Customer support automation
- Knowledge management systems

## Vector Database Setup (Pinecone)

```typescript
// lib/vector/pinecone.ts
import { Pinecone } from '@pinecone-database/pinecone';

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!,
});

export const index = pinecone.index(process.env.PINECONE_INDEX!);

export interface VectorMetadata {
  documentId: string;
  chunkIndex: number;
  text: string;
  source: string;
  title?: string;
}

export async function upsertVectors(
  vectors: Array<{
    id: string;
    values: number[];
    metadata: VectorMetadata;
  }>
) {
  await index.upsert(vectors);
}

export async function queryVectors(
  embedding: number[],
  topK: number = 5,
  filter?: Record<string, unknown>
) {
  const results = await index.query({
    vector: embedding,
    topK,
    includeMetadata: true,
    filter,
  });

  return results.matches || [];
}

export async function deleteVectors(ids: string[]) {
  await index.deleteMany(ids);
}
```

## Embeddings Service

```typescript
// lib/ai/embeddings.ts
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function createEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text,
  });

  return response.data[0].embedding;
}

export async function createEmbeddings(texts: string[]): Promise<number[][]> {
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: texts,
  });

  return response.data.map((d) => d.embedding);
}
```

## Document Processing

```typescript
// lib/rag/document-processor.ts
import { createEmbeddings } from '@/lib/ai/embeddings';
import { upsertVectors, type VectorMetadata } from '@/lib/vector/pinecone';
import { prisma } from '@/lib/db';

interface ProcessDocumentOptions {
  chunkSize?: number;
  chunkOverlap?: number;
}

export async function processDocument(
  documentId: string,
  content: string,
  metadata: { source: string; title?: string },
  options: ProcessDocumentOptions = {}
) {
  const { chunkSize = 1000, chunkOverlap = 200 } = options;

  // Split into chunks
  const chunks = splitIntoChunks(content, chunkSize, chunkOverlap);

  // Create embeddings
  const embeddings = await createEmbeddings(chunks);

  // Prepare vectors
  const vectors = chunks.map((text, index) => ({
    id: `${documentId}-${index}`,
    values: embeddings[index],
    metadata: {
      documentId,
      chunkIndex: index,
      text,
      source: metadata.source,
      title: metadata.title,
    } as VectorMetadata,
  }));

  // Upsert to vector database
  await upsertVectors(vectors);

  // Update document status
  await prisma.document.update({
    where: { id: documentId },
    data: {
      indexed: true,
      chunkCount: chunks.length,
      indexedAt: new Date(),
    },
  });

  return { chunksProcessed: chunks.length };
}

function splitIntoChunks(
  text: string,
  chunkSize: number,
  overlap: number
): string[] {
  const chunks: string[] = [];
  const sentences = text.split(/(?<=[.!?])\s+/);

  let currentChunk = '';

  for (const sentence of sentences) {
    if ((currentChunk + sentence).length > chunkSize && currentChunk) {
      chunks.push(currentChunk.trim());

      // Keep overlap from previous chunk
      const words = currentChunk.split(' ');
      const overlapWords = words.slice(-Math.floor(overlap / 5));
      currentChunk = overlapWords.join(' ') + ' ' + sentence;
    } else {
      currentChunk += (currentChunk ? ' ' : '') + sentence;
    }
  }

  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}
```

## RAG Query Service

```typescript
// lib/rag/query.ts
import { createEmbedding } from '@/lib/ai/embeddings';
import { queryVectors } from '@/lib/vector/pinecone';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface RAGQueryOptions {
  topK?: number;
  filter?: Record<string, unknown>;
  systemPrompt?: string;
}

interface RAGResponse {
  answer: string;
  sources: Array<{
    documentId: string;
    text: string;
    score: number;
  }>;
}

export async function ragQuery(
  question: string,
  options: RAGQueryOptions = {}
): Promise<RAGResponse> {
  const { topK = 5, filter, systemPrompt } = options;

  // Create embedding for the question
  const questionEmbedding = await createEmbedding(question);

  // Query vector database
  const matches = await queryVectors(questionEmbedding, topK, filter);

  // Extract context from matches
  const context = matches
    .map((match) => {
      const metadata = match.metadata as { text: string; source: string };
      return `Source: ${metadata.source}\n${metadata.text}`;
    })
    .join('\n\n---\n\n');

  // Generate response with context
  const response = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [
      {
        role: 'system',
        content:
          systemPrompt ||
          `You are a helpful assistant. Answer questions based on the provided context. If the answer isn't in the context, say so.

Context:
${context}`,
      },
      {
        role: 'user',
        content: question,
      },
    ],
    temperature: 0.3,
  });

  return {
    answer: response.choices[0]?.message?.content || '',
    sources: matches.map((match) => ({
      documentId: (match.metadata as { documentId: string }).documentId,
      text: (match.metadata as { text: string }).text,
      score: match.score || 0,
    })),
  };
}
```

## RAG API Route

```typescript
// app/api/rag/query/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { ragQuery } from '@/lib/rag/query';
import { auth } from '@/lib/auth';

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { question, filter } = await request.json();

    if (!question) {
      return NextResponse.json(
        { error: 'Question is required' },
        { status: 400 }
      );
    }

    const result = await ragQuery(question, { filter });

    return NextResponse.json(result);
  } catch (error) {
    console.error('RAG query error:', error);
    return NextResponse.json(
      { error: 'Failed to process query' },
      { status: 500 }
    );
  }
}
```

## RAG Chat Component

```typescript
// components/rag-chat.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Send, FileText } from 'lucide-react';

interface Source {
  documentId: string;
  text: string;
  score: number;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  sources?: Source[];
}

export function RAGChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const question = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: question }]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/rag/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question }),
      });

      const data = await response.json();

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: data.answer,
          sources: data.sources,
        },
      ]);
    } catch (error) {
      console.error('RAG error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[600px]">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div key={index} className="space-y-2">
            <div
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-4 py-2 ${
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                }`}
              >
                {message.content}
              </div>
            </div>

            {message.sources && message.sources.length > 0 && (
              <div className="ml-4 space-y-1">
                <p className="text-xs text-muted-foreground">Sources:</p>
                {message.sources.slice(0, 3).map((source, i) => (
                  <Card key={i} className="p-2">
                    <div className="flex items-start gap-2">
                      <FileText className="h-4 w-4 mt-0.5 text-muted-foreground" />
                      <p className="text-xs line-clamp-2">{source.text}</p>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-muted rounded-lg px-4 py-2">
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question..."
          disabled={isLoading}
        />
        <Button type="submit" disabled={isLoading} size="icon">
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
```

## Anti-patterns

### Don't Skip Chunking

```typescript
// BAD - Embedding entire documents
const embedding = await createEmbedding(entireDocument);

// GOOD - Chunk documents appropriately
const chunks = splitIntoChunks(document, 1000, 200);
const embeddings = await createEmbeddings(chunks);
```

## Related Skills

- [prompt-engineering](./prompt-engineering.md)
- [streaming](./streaming.md)

---

## Changelog

### 1.0.0 (2025-01-18)
- Initial implementation
- Document processing
- Vector search
- RAG query service
