---
id: pt-graphql
name: GraphQL
version: 2.1.0
layer: L5
category: data
description: Implement GraphQL APIs and clients in Next.js 15
tags: [data, graphql]
composes:
  - ../atoms/display-skeleton.md
  - ../atoms/input-button.md
  - ../molecules/card.md
  - ../organisms/data-table.md
dependencies: []
formula: "GraphQL = GraphQLYoga + ApolloClient + useQuery + useMutation + Skeleton(a-display-skeleton)"
performance:
  impact: low
  lcp: low
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# GraphQL Pattern

## Overview

GraphQL provides a flexible query language for APIs, allowing clients to request exactly the data they need. This pattern covers setting up GraphQL servers with Apollo Server or Yoga, client integration, and code generation for type safety.

## When to Use

- Complex data relationships requiring flexible queries
- Teams needing strong API contracts
- Mobile + web clients with different data needs
- When REST over/under-fetching is problematic
- Existing GraphQL ecosystem or tooling

## Composition Diagram

```
+------------------------------------------+
|             GraphQL Pattern              |
|  +------------------------------------+  |
|  |     GraphQL Yoga Server           |  |
|  |  Schema + Resolvers + Context     |  |
|  +------------------------------------+  |
|           |                             |
|           v                             |
|  +------------------------------------+  |
|  |     Apollo Client                 |  |
|  |  Cache + Links + ErrorHandling    |  |
|  +------------------------------------+  |
|           |                             |
|           v                             |
|  +------------------------------------+  |
|  |     useQuery / useMutation        |  |
|  +------------------------------------+  |
|           |                             |
|           v                             |
|  +------------------------------------+  |
|  |  Components (Skeleton, Card...)   |  |
|  +------------------------------------+  |
+------------------------------------------+
```

## Implementation

### GraphQL Yoga Server

```typescript
// app/api/graphql/route.ts
import { createSchema, createYoga } from 'graphql-yoga';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

// Type definitions
const typeDefs = /* GraphQL */ `
  type Query {
    me: User
    user(id: ID!): User
    users(first: Int, after: String, search: String): UserConnection!
    posts(first: Int, after: String, authorId: ID): PostConnection!
    post(id: ID!): Post
  }

  type Mutation {
    createPost(input: CreatePostInput!): Post!
    updatePost(id: ID!, input: UpdatePostInput!): Post!
    deletePost(id: ID!): Boolean!
    updateUser(input: UpdateUserInput!): User!
  }

  type User {
    id: ID!
    email: String!
    name: String
    avatar: String
    posts(first: Int, after: String): PostConnection!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type Post {
    id: ID!
    title: String!
    content: String!
    published: Boolean!
    author: User!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type UserConnection {
    edges: [UserEdge!]!
    pageInfo: PageInfo!
    totalCount: Int!
  }

  type UserEdge {
    cursor: String!
    node: User!
  }

  type PostConnection {
    edges: [PostEdge!]!
    pageInfo: PageInfo!
    totalCount: Int!
  }

  type PostEdge {
    cursor: String!
    node: Post!
  }

  type PageInfo {
    hasNextPage: Boolean!
    hasPreviousPage: Boolean!
    startCursor: String
    endCursor: String
  }

  input CreatePostInput {
    title: String!
    content: String!
    published: Boolean
  }

  input UpdatePostInput {
    title: String
    content: String
    published: Boolean
  }

  input UpdateUserInput {
    name: String
    avatar: String
  }

  scalar DateTime
`;

// Context type
interface Context {
  userId: string | null;
  prisma: typeof prisma;
}

// Resolvers
const resolvers = {
  Query: {
    me: async (_: unknown, __: unknown, ctx: Context) => {
      if (!ctx.userId) return null;
      return ctx.prisma.user.findUnique({ where: { id: ctx.userId } });
    },
    
    user: async (_: unknown, { id }: { id: string }, ctx: Context) => {
      return ctx.prisma.user.findUnique({ where: { id } });
    },
    
    users: async (
      _: unknown,
      { first = 10, after, search }: { first?: number; after?: string; search?: string },
      ctx: Context
    ) => {
      const where = search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' as const } },
              { email: { contains: search, mode: 'insensitive' as const } },
            ],
          }
        : {};

      const cursor = after ? { id: after } : undefined;
      
      const [users, totalCount] = await Promise.all([
        ctx.prisma.user.findMany({
          where,
          take: first + 1,
          skip: cursor ? 1 : 0,
          cursor,
          orderBy: { createdAt: 'desc' },
        }),
        ctx.prisma.user.count({ where }),
      ]);

      const hasNextPage = users.length > first;
      const edges = users.slice(0, first).map((user) => ({
        cursor: user.id,
        node: user,
      }));

      return {
        edges,
        pageInfo: {
          hasNextPage,
          hasPreviousPage: !!after,
          startCursor: edges[0]?.cursor,
          endCursor: edges[edges.length - 1]?.cursor,
        },
        totalCount,
      };
    },
    
    posts: async (
      _: unknown,
      { first = 10, after, authorId }: { first?: number; after?: string; authorId?: string },
      ctx: Context
    ) => {
      const where = {
        published: true,
        ...(authorId && { authorId }),
      };

      const cursor = after ? { id: after } : undefined;
      
      const [posts, totalCount] = await Promise.all([
        ctx.prisma.post.findMany({
          where,
          take: first + 1,
          skip: cursor ? 1 : 0,
          cursor,
          orderBy: { createdAt: 'desc' },
        }),
        ctx.prisma.post.count({ where }),
      ]);

      const hasNextPage = posts.length > first;
      const edges = posts.slice(0, first).map((post) => ({
        cursor: post.id,
        node: post,
      }));

      return {
        edges,
        pageInfo: {
          hasNextPage,
          hasPreviousPage: !!after,
          startCursor: edges[0]?.cursor,
          endCursor: edges[edges.length - 1]?.cursor,
        },
        totalCount,
      };
    },
    
    post: async (_: unknown, { id }: { id: string }, ctx: Context) => {
      return ctx.prisma.post.findUnique({ where: { id } });
    },
  },
  
  Mutation: {
    createPost: async (
      _: unknown,
      { input }: { input: { title: string; content: string; published?: boolean } },
      ctx: Context
    ) => {
      if (!ctx.userId) throw new Error('Not authenticated');
      
      return ctx.prisma.post.create({
        data: {
          ...input,
          authorId: ctx.userId,
        },
      });
    },
    
    updatePost: async (
      _: unknown,
      { id, input }: { id: string; input: { title?: string; content?: string; published?: boolean } },
      ctx: Context
    ) => {
      if (!ctx.userId) throw new Error('Not authenticated');
      
      const post = await ctx.prisma.post.findUnique({ where: { id } });
      if (!post || post.authorId !== ctx.userId) {
        throw new Error('Not authorized');
      }
      
      return ctx.prisma.post.update({
        where: { id },
        data: input,
      });
    },
    
    deletePost: async (_: unknown, { id }: { id: string }, ctx: Context) => {
      if (!ctx.userId) throw new Error('Not authenticated');
      
      const post = await ctx.prisma.post.findUnique({ where: { id } });
      if (!post || post.authorId !== ctx.userId) {
        throw new Error('Not authorized');
      }
      
      await ctx.prisma.post.delete({ where: { id } });
      return true;
    },
    
    updateUser: async (
      _: unknown,
      { input }: { input: { name?: string; avatar?: string } },
      ctx: Context
    ) => {
      if (!ctx.userId) throw new Error('Not authenticated');
      
      return ctx.prisma.user.update({
        where: { id: ctx.userId },
        data: input,
      });
    },
  },
  
  User: {
    posts: async (
      parent: { id: string },
      { first = 10, after }: { first?: number; after?: string },
      ctx: Context
    ) => {
      const posts = await ctx.prisma.post.findMany({
        where: { authorId: parent.id, published: true },
        take: first + 1,
        skip: after ? 1 : 0,
        cursor: after ? { id: after } : undefined,
        orderBy: { createdAt: 'desc' },
      });

      const hasNextPage = posts.length > first;
      const edges = posts.slice(0, first).map((post) => ({
        cursor: post.id,
        node: post,
      }));

      return {
        edges,
        pageInfo: {
          hasNextPage,
          hasPreviousPage: !!after,
          startCursor: edges[0]?.cursor,
          endCursor: edges[edges.length - 1]?.cursor,
        },
        totalCount: 0, // Would need separate count query
      };
    },
  },
  
  Post: {
    author: async (parent: { authorId: string }, _: unknown, ctx: Context) => {
      return ctx.prisma.user.findUnique({ where: { id: parent.authorId } });
    },
  },
  
  DateTime: {
    serialize: (value: Date) => value.toISOString(),
    parseValue: (value: string) => new Date(value),
  },
};

// Create schema
const schema = createSchema({
  typeDefs,
  resolvers,
});

// Create Yoga instance
const yoga = createYoga({
  schema,
  graphqlEndpoint: '/api/graphql',
  context: async ({ request }): Promise<Context> => {
    const session = await auth();
    return {
      userId: session?.user?.id ?? null,
      prisma,
    };
  },
});

// Route handlers
export const GET = yoga;
export const POST = yoga;
```

### GraphQL Code Generation

```typescript
// codegen.ts
import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: 'http://localhost:3000/api/graphql',
  documents: ['app/**/*.tsx', 'components/**/*.tsx', 'lib/**/*.ts'],
  ignoreNoDocuments: true,
  generates: {
    './lib/graphql/generated/': {
      preset: 'client',
      config: {
        documentMode: 'string',
      },
    },
    './lib/graphql/generated/types.ts': {
      plugins: ['typescript', 'typescript-operations'],
      config: {
        scalars: {
          DateTime: 'string',
        },
      },
    },
  },
};

export default config;
```

### Apollo Client Setup

```typescript
// lib/graphql/apollo-client.ts
import { ApolloClient, InMemoryCache, HttpLink, from } from '@apollo/client';
import { onError } from '@apollo/client/link/error';
import { relayStylePagination } from '@apollo/client/utilities';

const httpLink = new HttpLink({
  uri: '/api/graphql',
  credentials: 'same-origin',
});

const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path }) => {
      console.error(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
      );
    });
  }
  if (networkError) {
    console.error(`[Network error]: ${networkError}`);
  }
});

export const apolloClient = new ApolloClient({
  link: from([errorLink, httpLink]),
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          posts: relayStylePagination(['authorId']),
          users: relayStylePagination(['search']),
        },
      },
    },
  }),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network',
    },
  },
});
```

### Apollo Provider

```tsx
// components/providers/apollo-provider.tsx
'use client';

import { ApolloProvider as BaseApolloProvider } from '@apollo/client';
import { apolloClient } from '@/lib/graphql/apollo-client';

export function ApolloProvider({ children }: { children: React.ReactNode }) {
  return (
    <BaseApolloProvider client={apolloClient}>
      {children}
    </BaseApolloProvider>
  );
}
```

### Using GraphQL in Components

```tsx
// components/posts/post-list.tsx
'use client';

import { useQuery, useMutation, gql } from '@apollo/client';

const GET_POSTS = gql`
  query GetPosts($first: Int, $after: String) {
    posts(first: $first, after: $after) {
      edges {
        cursor
        node {
          id
          title
          content
          createdAt
          author {
            id
            name
            avatar
          }
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
      totalCount
    }
  }
`;

const CREATE_POST = gql`
  mutation CreatePost($input: CreatePostInput!) {
    createPost(input: $input) {
      id
      title
      content
      published
    }
  }
`;

export function PostList() {
  const { data, loading, error, fetchMore } = useQuery(GET_POSTS, {
    variables: { first: 10 },
  });

  const [createPost, { loading: creating }] = useMutation(CREATE_POST, {
    update(cache, { data }) {
      // Update cache after mutation
      cache.modify({
        fields: {
          posts(existingPosts = { edges: [] }) {
            const newPostRef = cache.writeFragment({
              data: data.createPost,
              fragment: gql`
                fragment NewPost on Post {
                  id
                  title
                  content
                  published
                }
              `,
            });
            return {
              ...existingPosts,
              edges: [{ node: newPostRef, cursor: data.createPost.id }, ...existingPosts.edges],
            };
          },
        },
      });
    },
  });

  if (loading && !data) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  const posts = data?.posts.edges || [];
  const { hasNextPage, endCursor } = data?.posts.pageInfo || {};

  const loadMore = () => {
    fetchMore({
      variables: { after: endCursor },
    });
  };

  return (
    <div className="space-y-4">
      {posts.map(({ node: post }) => (
        <article key={post.id} className="border p-4 rounded">
          <h2 className="text-xl font-bold">{post.title}</h2>
          <p className="text-gray-600">{post.content}</p>
          <div className="mt-2 text-sm text-gray-500">
            By {post.author.name} on {new Date(post.createdAt).toLocaleDateString()}
          </div>
        </article>
      ))}

      {hasNextPage && (
        <button
          onClick={loadMore}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          {loading ? 'Loading...' : 'Load More'}
        </button>
      )}
    </div>
  );
}
```

### Server Component with GraphQL

```tsx
// app/posts/page.tsx
import { apolloClient } from '@/lib/graphql/apollo-client';
import { gql } from '@apollo/client';

const GET_POSTS = gql`
  query GetPosts($first: Int) {
    posts(first: $first) {
      edges {
        node {
          id
          title
          content
          author {
            name
          }
        }
      }
    }
  }
`;

export default async function PostsPage() {
  const { data } = await apolloClient.query({
    query: GET_POSTS,
    variables: { first: 10 },
  });

  return (
    <div>
      <h1>Posts</h1>
      {data.posts.edges.map(({ node: post }) => (
        <article key={post.id}>
          <h2>{post.title}</h2>
          <p>{post.content}</p>
          <span>By {post.author.name}</span>
        </article>
      ))}
    </div>
  );
}
```

## Variants

### URQL Client

```typescript
// lib/graphql/urql-client.ts
import { createClient, cacheExchange, fetchExchange } from 'urql';

export const urqlClient = createClient({
  url: '/api/graphql',
  exchanges: [cacheExchange, fetchExchange],
  fetchOptions: () => ({
    credentials: 'same-origin',
  }),
});

// Usage with hooks
import { useQuery } from 'urql';

function PostList() {
  const [result] = useQuery({
    query: GET_POSTS,
    variables: { first: 10 },
  });

  const { data, fetching, error } = result;
  // ...
}
```

## Anti-Patterns

```typescript
// Bad: N+1 queries
const resolvers = {
  Post: {
    author: (post) => prisma.user.findUnique({ where: { id: post.authorId } }),
    // Called for each post - N+1 problem!
  },
};

// Good: Use DataLoader
import DataLoader from 'dataloader';

const userLoader = new DataLoader(async (ids: string[]) => {
  const users = await prisma.user.findMany({ where: { id: { in: ids } } });
  return ids.map(id => users.find(u => u.id === id));
});

const resolvers = {
  Post: {
    author: (post) => userLoader.load(post.authorId), // Batched!
  },
};
```

## Related Skills

- `api-types` - Type generation
- `react-query` - Alternative data fetching
- `trpc` - Type-safe API alternative
- `rest-api-design` - REST comparison

## Changelog

### 2.0.0 (2025-01-18)
- Standardized to atomic design system v2
- Updated frontmatter schema

- 1.0.0: Initial GraphQL pattern with Yoga and Apollo
