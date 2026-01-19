---
id: pt-vector-database
name: Vector Database Integration
version: 1.0.0
layer: L5
category: ai
description: Vector database integration with Pinecone for Next.js AI applications
tags: [vector-db, pinecone, embeddings, rag, ai, next15]
composes:
  - ../molecules/card.md
  - ../atoms/input-text.md
  - ../atoms/input-button.md
dependencies:
  @pinecone-database/pinecone: "^4.0.0"
formula: Embeddings + Vector Store + Similarity Search = Semantic Search
performance:
  impact: medium
  lcp: medium
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# Vector Database Integration

## When to Use

- **Semantic search**: Finding content by meaning, not just keywords
- **RAG applications**: Retrieval-augmented generation for LLMs
- **Recommendation systems**: Finding similar items
- **Document Q&A**: Answering questions from document collections

**Avoid when**: Simple keyword search suffices, or data volume is very small.

## Composition Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ Vector Database Architecture                                 │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Vector Service                                        │  │
│  │  ├─ Embeddings: OpenAI text-embedding-3-small        │  │
│  │  ├─ Vector Store: Pinecone index management          │  │
│  │  └─ Search: Similarity queries with metadata         │  │
│  └───────────────────────────────────────────────────────┘  │
│         │                    │                    │         │
│         ▼                    ▼                    ▼         │
│  ┌────────────┐     ┌──────────────┐     ┌─────────────┐   │
│  │ Document   │     │ Semantic     │     │ RAG         │   │
│  │ Ingestion  │     │ Search       │     │ Pipeline    │   │
│  └────────────┘     └──────────────┘     └─────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Vector Service Implementation

```typescript
// lib/vector/client.ts
import { Pinecone } from '@pinecone-database/pinecone';
import { OpenAI } from 'openai';

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!,
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

const INDEX_NAME = process.env.PINECONE_INDEX_NAME || 'default';
const EMBEDDING_MODEL = 'text-embedding-3-small';
const EMBEDDING_DIMENSIONS = 1536;

export interface VectorDocument {
  id: string;
  content: string;
  metadata: Record<string, string | number | boolean>;
}

export interface SearchResult {
  id: string;
  score: number;
  content: string;
  metadata: Record<string, string | number | boolean>;
}

export class VectorService {
  private index = pinecone.index(INDEX_NAME);

  async generateEmbedding(text: string): Promise<number[]> {
    const response = await openai.embeddings.create({
      model: EMBEDDING_MODEL,
      input: text,
    });
    return response.data[0].embedding;
  }

  async generateEmbeddings(texts: string[]): Promise<number[][]> {
    const response = await openai.embeddings.create({
      model: EMBEDDING_MODEL,
      input: texts,
    });
    return response.data.map((d) => d.embedding);
  }

  async upsertDocument(document: VectorDocument, namespace?: string): Promise<void> {
    const embedding = await this.generateEmbedding(document.content);

    await this.index.namespace(namespace || '').upsert([
      {
        id: document.id,
        values: embedding,
        metadata: {
          ...document.metadata,
          content: document.content,
        },
      },
    ]);
  }

  async upsertDocuments(
    documents: VectorDocument[],
    namespace?: string,
    batchSize = 100
  ): Promise<void> {
    for (let i = 0; i < documents.length; i += batchSize) {
      const batch = documents.slice(i, i + batchSize);
      const contents = batch.map((d) => d.content);
      const embeddings = await this.generateEmbeddings(contents);

      const vectors = batch.map((doc, idx) => ({
        id: doc.id,
        values: embeddings[idx],
        metadata: {
          ...doc.metadata,
          content: doc.content,
        },
      }));

      await this.index.namespace(namespace || '').upsert(vectors);
    }
  }

  async search(
    query: string,
    options: {
      topK?: number;
      namespace?: string;
      filter?: Record<string, any>;
      includeMetadata?: boolean;
    } = {}
  ): Promise<SearchResult[]> {
    const { topK = 10, namespace, filter, includeMetadata = true } = options;

    const queryEmbedding = await this.generateEmbedding(query);

    const results = await this.index.namespace(namespace || '').query({
      vector: queryEmbedding,
      topK,
      filter,
      includeMetadata,
    });

    return (results.matches || []).map((match) => ({
      id: match.id,
      score: match.score || 0,
      content: (match.metadata?.content as string) || '',
      metadata: match.metadata as Record<string, string | number | boolean>,
    }));
  }

  async deleteDocument(id: string, namespace?: string): Promise<void> {
    await this.index.namespace(namespace || '').deleteOne(id);
  }

  async deleteByFilter(
    filter: Record<string, any>,
    namespace?: string
  ): Promise<void> {
    await this.index.namespace(namespace || '').deleteMany(filter);
  }

  async getStats(): Promise<{
    dimension: number;
    indexFullness: number;
    totalVectorCount: number;
  }> {
    const stats = await this.index.describeIndexStats();
    return {
      dimension: stats.dimension || EMBEDDING_DIMENSIONS,
      indexFullness: stats.indexFullness || 0,
      totalVectorCount: stats.totalRecordCount || 0,
    };
  }
}

export const vectorService = new VectorService();
```

## Document Ingestion

```typescript
// lib/vector/ingestion.ts
import { vectorService, VectorDocument } from './client';
import { nanoid } from 'nanoid';

interface TextChunk {
  content: string;
  metadata: Record<string, any>;
}

export function chunkText(
  text: string,
  chunkSize = 1000,
  overlap = 200
): string[] {
  const chunks: string[] = [];
  let start = 0;

  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);
    chunks.push(text.slice(start, end));
    start = end - overlap;
    if (start + overlap >= text.length) break;
  }

  return chunks;
}

export async function ingestDocument(
  content: string,
  metadata: Record<string, any>,
  options: {
    namespace?: string;
    chunkSize?: number;
    overlap?: number;
  } = {}
): Promise<string[]> {
  const { namespace, chunkSize = 1000, overlap = 200 } = options;

  const chunks = chunkText(content, chunkSize, overlap);
  const documentId = metadata.documentId || nanoid();

  const documents: VectorDocument[] = chunks.map((chunk, index) => ({
    id: `${documentId}-chunk-${index}`,
    content: chunk,
    metadata: {
      ...metadata,
      documentId,
      chunkIndex: index,
      totalChunks: chunks.length,
    },
  }));

  await vectorService.upsertDocuments(documents, namespace);

  return documents.map((d) => d.id);
}

export async function ingestFile(
  file: File,
  metadata: Record<string, any>,
  namespace?: string
): Promise<string[]> {
  const content = await file.text();

  return ingestDocument(content, {
    ...metadata,
    filename: file.name,
    fileType: file.type,
    fileSize: file.size,
  }, { namespace });
}
```

## RAG Pipeline

```typescript
// lib/vector/rag.ts
import { vectorService } from './client';
import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';

export interface RAGOptions {
  namespace?: string;
  topK?: number;
  filter?: Record<string, any>;
  systemPrompt?: string;
  model?: string;
}

export async function ragQuery(
  query: string,
  options: RAGOptions = {}
): Promise<{
  answer: string;
  sources: { id: string; content: string; score: number }[];
}> {
  const {
    namespace,
    topK = 5,
    filter,
    systemPrompt = 'You are a helpful assistant. Use the provided context to answer questions accurately. If the context doesn\'t contain relevant information, say so.',
    model = 'gpt-4o',
  } = options;

  // Retrieve relevant documents
  const results = await vectorService.search(query, {
    topK,
    namespace,
    filter,
  });

  // Build context from results
  const context = results
    .map((r, i) => `[Source ${i + 1}]: ${r.content}`)
    .join('\n\n');

  // Generate answer
  const response = await generateText({
    model: openai(model),
    system: systemPrompt,
    messages: [
      {
        role: 'user',
        content: `Context:\n${context}\n\nQuestion: ${query}\n\nAnswer based on the context provided:`,
      },
    ],
  });

  return {
    answer: response.text,
    sources: results.map((r) => ({
      id: r.id,
      content: r.content,
      score: r.score,
    })),
  };
}
```

## API Routes

```typescript
// app/api/vector/search/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { vectorService } from '@/lib/vector/client';
import { auth } from '@/lib/auth';

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { query, topK = 10, filter } = await request.json();

  if (!query) {
    return NextResponse.json({ error: 'Query is required' }, { status: 400 });
  }

  const results = await vectorService.search(query, {
    topK,
    filter: { ...filter, userId: session.user.id },
    namespace: session.user.id,
  });

  return NextResponse.json({ results });
}

// app/api/vector/ingest/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { ingestDocument } from '@/lib/vector/ingestion';
import { auth } from '@/lib/auth';

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { content, metadata } = await request.json();

  if (!content) {
    return NextResponse.json({ error: 'Content is required' }, { status: 400 });
  }

  const chunkIds = await ingestDocument(
    content,
    { ...metadata, userId: session.user.id },
    { namespace: session.user.id }
  );

  return NextResponse.json({ chunkIds, count: chunkIds.length });
}

// app/api/vector/ask/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { ragQuery } from '@/lib/vector/rag';
import { auth } from '@/lib/auth';

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { question, topK = 5 } = await request.json();

  if (!question) {
    return NextResponse.json({ error: 'Question is required' }, { status: 400 });
  }

  const result = await ragQuery(question, {
    namespace: session.user.id,
    topK,
    filter: { userId: session.user.id },
  });

  return NextResponse.json(result);
}
```

## Semantic Search Component

```typescript
// components/vector/semantic-search.tsx
'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Loader2 } from 'lucide-react';

interface SearchResult {
  id: string;
  score: number;
  content: string;
  metadata: Record<string, any>;
}

export function SemanticSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;

    setLoading(true);
    try {
      const res = await fetch('/api/vector/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, topK: 10 }),
      });

      const data = await res.json();
      setResults(data.results);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          placeholder="Search your documents..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        />
        <Button onClick={handleSearch} disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
        </Button>
      </div>

      <div className="space-y-3">
        {results.map((result) => (
          <Card key={result.id}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-sm">
                  {result.metadata.filename || result.id}
                </CardTitle>
                <span className="text-xs text-muted-foreground">
                  Score: {(result.score * 100).toFixed(1)}%
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground line-clamp-3">
                {result.content}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
```

## Related Patterns

- [token-counting](./token-counting.md)
- [streaming](./streaming.md)
- [search](./search.md)

---

## Changelog

### 1.0.0 (2025-01-18)
- Initial implementation
- Pinecone integration
- Document chunking
- RAG pipeline
- Semantic search component
