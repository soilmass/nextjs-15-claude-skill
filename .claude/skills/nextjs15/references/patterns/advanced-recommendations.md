---
id: pt-advanced-recommendations
name: Advanced Recommendations
version: 1.0.0
layer: L5
category: e-commerce
description: Multi-strategy recommendation engine with collaborative filtering, content-based, and hybrid approaches
tags: [recommendations, collaborative-filtering, personalization, machine-learning, next15]
composes: []
dependencies: {}
formula: Recommendations = Collaborative Filtering + Content-Based + Hybrid Ranking + Cold Start Handling
performance:
  impact: medium
  lcp: neutral
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# Advanced Recommendations

## Overview

Advanced recommendation systems combine multiple algorithmic approaches to deliver personalized product suggestions. This pattern covers collaborative filtering, content-based filtering, hybrid approaches, cold-start problem solutions, and real-time personalization strategies optimized for Next.js 15 applications.

### Key Concepts

- **Collaborative Filtering**: Recommendations based on user behavior similarities
- **Content-Based Filtering**: Recommendations based on item attribute similarities
- **Hybrid Approaches**: Combining multiple recommendation strategies
- **Cold-Start Handling**: Strategies for new users and new products
- **Real-Time Personalization**: Dynamic recommendations based on session behavior

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        RECOMMENDATION ENGINE                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐                  │
│  │   User       │    │   Product    │    │  Interaction │                  │
│  │   Profiles   │    │   Catalog    │    │    Events    │                  │
│  └──────┬───────┘    └──────┬───────┘    └──────┬───────┘                  │
│         │                   │                    │                          │
│         ▼                   ▼                    ▼                          │
│  ┌────────────────────────────────────────────────────────────┐            │
│  │                    DATA AGGREGATION LAYER                   │            │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │            │
│  │  │   Feature   │  │   Vector    │  │   Behavior         │ │            │
│  │  │   Store     │  │   Database  │  │   Analytics        │ │            │
│  │  └─────────────┘  └─────────────┘  └─────────────────────┘ │            │
│  └────────────────────────────────────────────────────────────┘            │
│                              │                                              │
│         ┌────────────────────┼────────────────────┐                        │
│         ▼                    ▼                    ▼                        │
│  ┌─────────────┐      ┌─────────────┐      ┌─────────────┐                 │
│  │Collaborative│      │Content-Based│      │   Hybrid    │                 │
│  │  Filtering  │      │  Filtering  │      │   Engine    │                 │
│  └──────┬──────┘      └──────┬──────┘      └──────┬──────┘                 │
│         │                    │                    │                        │
│         └────────────────────┼────────────────────┘                        │
│                              ▼                                              │
│  ┌────────────────────────────────────────────────────────────┐            │
│  │                    RANKING & FILTERING                      │            │
│  │  ┌────────────┐  ┌────────────┐  ┌───────────────────────┐ │            │
│  │  │   Score    │  │  Business  │  │   Diversity &         │ │            │
│  │  │   Fusion   │  │   Rules    │  │   Freshness          │ │            │
│  │  └────────────┘  └────────────┘  └───────────────────────┘ │            │
│  └────────────────────────────────────────────────────────────┘            │
│                              │                                              │
│                              ▼                                              │
│  ┌────────────────────────────────────────────────────────────┐            │
│  │                    DELIVERY LAYER                           │            │
│  │  ┌────────────┐  ┌────────────┐  ┌───────────────────────┐ │            │
│  │  │  Real-Time │  │   Batch    │  │   A/B Testing         │ │            │
│  │  │    API     │  │   Export   │  │   Framework           │ │            │
│  │  └────────────┘  └────────────┘  └───────────────────────┘ │            │
│  └────────────────────────────────────────────────────────────┘            │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Implementation

### Core Types and Interfaces

```typescript
// types/recommendations.ts
export interface UserProfile {
  id: string;
  preferences: CategoryPreferences;
  purchaseHistory: PurchaseEvent[];
  browsingHistory: BrowsingEvent[];
  demographics?: Demographics;
  segments: string[];
  coldStartStatus: ColdStartStatus;
}

export interface CategoryPreferences {
  [categoryId: string]: {
    score: number;
    lastInteraction: Date;
    interactionCount: number;
  };
}

export interface PurchaseEvent {
  productId: string;
  categoryId: string;
  price: number;
  timestamp: Date;
  quantity: number;
}

export interface BrowsingEvent {
  productId: string;
  categoryId: string;
  duration: number;
  timestamp: Date;
  eventType: 'view' | 'click' | 'add_to_cart' | 'wishlist';
}

export interface Demographics {
  ageRange?: string;
  location?: string;
  gender?: string;
}

export type ColdStartStatus = 'new' | 'warming' | 'active';

export interface Product {
  id: string;
  name: string;
  categoryId: string;
  attributes: ProductAttributes;
  embedding?: number[];
  popularity: number;
  rating: number;
  reviewCount: number;
  price: number;
  createdAt: Date;
}

export interface ProductAttributes {
  brand?: string;
  color?: string;
  size?: string;
  material?: string;
  tags: string[];
  [key: string]: unknown;
}

export interface RecommendationResult {
  productId: string;
  score: number;
  source: RecommendationSource;
  explanation?: string;
  diversity: number;
}

export type RecommendationSource =
  | 'collaborative'
  | 'content-based'
  | 'trending'
  | 'similar-users'
  | 'purchase-history'
  | 'cold-start'
  | 'hybrid';

export interface RecommendationContext {
  userId?: string;
  sessionId: string;
  currentProductId?: string;
  currentCategoryId?: string;
  pageType: 'home' | 'product' | 'category' | 'cart' | 'checkout';
  device: 'mobile' | 'desktop' | 'tablet';
  timestamp: Date;
}

export interface RecommendationConfig {
  limit: number;
  diversityWeight: number;
  freshnessWeight: number;
  personalizedWeight: number;
  excludeProductIds?: string[];
  includeCategoryIds?: string[];
  priceRange?: { min: number; max: number };
}
```

### Collaborative Filtering Engine

```typescript
// lib/recommendations/collaborative-filtering.ts
import { redis } from '@/lib/redis';
import { db } from '@/lib/database';

interface UserSimilarity {
  userId: string;
  similarity: number;
}

interface ItemSimilarity {
  productId: string;
  similarity: number;
}

export class CollaborativeFilteringEngine {
  private readonly minSimilarity = 0.1;
  private readonly maxNeighbors = 50;

  /**
   * User-based collaborative filtering
   * Find similar users and recommend items they liked
   */
  async getUserBasedRecommendations(
    userId: string,
    limit: number = 20
  ): Promise<RecommendationResult[]> {
    // Get user interaction vector
    const userVector = await this.getUserInteractionVector(userId);

    if (userVector.length === 0) {
      return [];
    }

    // Find similar users
    const similarUsers = await this.findSimilarUsers(userId, userVector);

    // Get products liked by similar users
    const candidateProducts = await this.getCandidateProducts(
      userId,
      similarUsers
    );

    // Score and rank products
    return this.scoreProducts(candidateProducts, similarUsers, limit);
  }

  /**
   * Item-based collaborative filtering
   * Find similar items based on co-occurrence patterns
   */
  async getItemBasedRecommendations(
    productId: string,
    userId?: string,
    limit: number = 20
  ): Promise<RecommendationResult[]> {
    // Get item co-occurrence matrix
    const similarItems = await this.findSimilarItems(productId);

    // Filter out items user has already purchased
    const filteredItems = userId
      ? await this.filterPurchasedItems(similarItems, userId)
      : similarItems;

    return filteredItems.slice(0, limit).map((item) => ({
      productId: item.productId,
      score: item.similarity,
      source: 'collaborative' as const,
      explanation: 'Customers who bought this also bought',
      diversity: 0,
    }));
  }

  private async getUserInteractionVector(userId: string): Promise<number[]> {
    const cacheKey = `user:vector:${userId}`;
    const cached = await redis.get(cacheKey);

    if (cached) {
      return JSON.parse(cached);
    }

    // Build interaction vector from database
    const interactions = await db.query(`
      SELECT
        product_id,
        SUM(CASE event_type
          WHEN 'purchase' THEN 5.0
          WHEN 'add_to_cart' THEN 3.0
          WHEN 'wishlist' THEN 2.0
          WHEN 'view' THEN 1.0
          ELSE 0.5
        END) as score
      FROM user_interactions
      WHERE user_id = $1
        AND created_at > NOW() - INTERVAL '90 days'
      GROUP BY product_id
      ORDER BY score DESC
      LIMIT 1000
    `, [userId]);

    // Create sparse vector
    const vector = await this.createSparseVector(interactions.rows);

    // Cache for 1 hour
    await redis.setex(cacheKey, 3600, JSON.stringify(vector));

    return vector;
  }

  private async findSimilarUsers(
    userId: string,
    userVector: number[]
  ): Promise<UserSimilarity[]> {
    // Use approximate nearest neighbor search for scalability
    const cacheKey = `similar:users:${userId}`;
    const cached = await redis.get(cacheKey);

    if (cached) {
      return JSON.parse(cached);
    }

    // Query vector database for similar users
    const similarUsers = await this.vectorSearch(
      'user_vectors',
      userVector,
      this.maxNeighbors,
      { excludeId: userId }
    );

    const filtered = similarUsers.filter(
      (u) => u.similarity >= this.minSimilarity
    );

    // Cache for 30 minutes
    await redis.setex(cacheKey, 1800, JSON.stringify(filtered));

    return filtered;
  }

  private async findSimilarItems(productId: string): Promise<ItemSimilarity[]> {
    const cacheKey = `similar:items:${productId}`;
    const cached = await redis.get(cacheKey);

    if (cached) {
      return JSON.parse(cached);
    }

    // Calculate item-item similarity using co-occurrence
    const result = await db.query(`
      WITH item_users AS (
        SELECT DISTINCT user_id
        FROM user_interactions
        WHERE product_id = $1
          AND event_type IN ('purchase', 'add_to_cart')
          AND created_at > NOW() - INTERVAL '180 days'
      ),
      co_occurrences AS (
        SELECT
          ui.product_id,
          COUNT(DISTINCT ui.user_id) as co_count,
          COUNT(DISTINCT ui.user_id)::float /
            (SELECT COUNT(*) FROM item_users)::float as jaccard_approx
        FROM user_interactions ui
        INNER JOIN item_users iu ON ui.user_id = iu.user_id
        WHERE ui.product_id != $1
          AND ui.event_type IN ('purchase', 'add_to_cart')
        GROUP BY ui.product_id
        HAVING COUNT(DISTINCT ui.user_id) >= 3
        ORDER BY jaccard_approx DESC
        LIMIT 100
      )
      SELECT product_id, jaccard_approx as similarity
      FROM co_occurrences
    `, [productId]);

    const similarItems = result.rows.map((row) => ({
      productId: row.product_id,
      similarity: row.similarity,
    }));

    // Cache for 2 hours
    await redis.setex(cacheKey, 7200, JSON.stringify(similarItems));

    return similarItems;
  }

  private async getCandidateProducts(
    userId: string,
    similarUsers: UserSimilarity[]
  ): Promise<Map<string, number[]>> {
    const userIds = similarUsers.map((u) => u.userId);

    const result = await db.query(`
      SELECT
        product_id,
        user_id,
        SUM(CASE event_type
          WHEN 'purchase' THEN 5.0
          WHEN 'add_to_cart' THEN 3.0
          WHEN 'wishlist' THEN 2.0
          WHEN 'view' THEN 1.0
          ELSE 0.5
        END) as score
      FROM user_interactions
      WHERE user_id = ANY($1)
        AND product_id NOT IN (
          SELECT DISTINCT product_id
          FROM user_interactions
          WHERE user_id = $2
            AND event_type = 'purchase'
        )
        AND created_at > NOW() - INTERVAL '30 days'
      GROUP BY product_id, user_id
    `, [userIds, userId]);

    // Group scores by product
    const productScores = new Map<string, number[]>();

    for (const row of result.rows) {
      const scores = productScores.get(row.product_id) || [];
      const userSim = similarUsers.find((u) => u.userId === row.user_id);
      if (userSim) {
        scores.push(row.score * userSim.similarity);
      }
      productScores.set(row.product_id, scores);
    }

    return productScores;
  }

  private scoreProducts(
    candidates: Map<string, number[]>,
    similarUsers: UserSimilarity[],
    limit: number
  ): RecommendationResult[] {
    const results: RecommendationResult[] = [];

    for (const [productId, scores] of candidates) {
      // Weighted average of scores from similar users
      const totalScore = scores.reduce((a, b) => a + b, 0);
      const avgScore = totalScore / similarUsers.length;

      results.push({
        productId,
        score: avgScore,
        source: 'collaborative',
        explanation: 'Recommended based on similar customers',
        diversity: 0,
      });
    }

    return results
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  private async createSparseVector(
    interactions: Array<{ product_id: string; score: number }>
  ): Promise<number[]> {
    // Implementation of sparse vector creation
    // Uses product index mapping for efficient storage
    const vectorSize = 10000; // Configurable dimension
    const vector = new Array(vectorSize).fill(0);

    for (const interaction of interactions) {
      const index = await this.getProductIndex(interaction.product_id);
      if (index < vectorSize) {
        vector[index] = interaction.score;
      }
    }

    return vector;
  }

  private async getProductIndex(productId: string): Promise<number> {
    // Hash product ID to vector index
    let hash = 0;
    for (let i = 0; i < productId.length; i++) {
      hash = ((hash << 5) - hash) + productId.charCodeAt(i);
      hash = hash & hash;
    }
    return Math.abs(hash) % 10000;
  }

  private async vectorSearch(
    collection: string,
    vector: number[],
    limit: number,
    options: { excludeId?: string }
  ): Promise<UserSimilarity[]> {
    // Integration with vector database (e.g., Pinecone, Weaviate)
    // Placeholder implementation
    return [];
  }

  private async filterPurchasedItems(
    items: ItemSimilarity[],
    userId: string
  ): Promise<ItemSimilarity[]> {
    const purchasedIds = await this.getUserPurchasedProductIds(userId);
    return items.filter((item) => !purchasedIds.has(item.productId));
  }

  private async getUserPurchasedProductIds(userId: string): Promise<Set<string>> {
    const result = await db.query(`
      SELECT DISTINCT product_id
      FROM user_interactions
      WHERE user_id = $1 AND event_type = 'purchase'
    `, [userId]);

    return new Set(result.rows.map((row) => row.product_id));
  }
}
```

### Content-Based Filtering Engine

```typescript
// lib/recommendations/content-based-filtering.ts
import { openai } from '@/lib/openai';
import { redis } from '@/lib/redis';
import { db } from '@/lib/database';

interface ProductEmbedding {
  productId: string;
  embedding: number[];
}

export class ContentBasedFilteringEngine {
  private readonly embeddingDimension = 1536; // OpenAI ada-002

  /**
   * Generate recommendations based on product content similarity
   */
  async getContentBasedRecommendations(
    referenceProductIds: string[],
    limit: number = 20,
    excludeIds: string[] = []
  ): Promise<RecommendationResult[]> {
    // Get embeddings for reference products
    const referenceEmbeddings = await this.getProductEmbeddings(
      referenceProductIds
    );

    if (referenceEmbeddings.length === 0) {
      return [];
    }

    // Calculate centroid of reference embeddings
    const centroid = this.calculateCentroid(
      referenceEmbeddings.map((e) => e.embedding)
    );

    // Find similar products using vector search
    const similarProducts = await this.findSimilarProducts(
      centroid,
      [...referenceProductIds, ...excludeIds],
      limit * 2 // Fetch more for diversity
    );

    // Apply diversity and ranking
    return this.rankWithDiversity(similarProducts, limit);
  }

  /**
   * Get recommendations for a user based on their preferences
   */
  async getUserPreferenceRecommendations(
    userId: string,
    limit: number = 20
  ): Promise<RecommendationResult[]> {
    // Build user preference embedding
    const userEmbedding = await this.buildUserPreferenceEmbedding(userId);

    if (!userEmbedding) {
      return [];
    }

    // Get user's purchased products to exclude
    const purchasedIds = await this.getUserPurchasedProductIds(userId);

    // Find similar products
    const similarProducts = await this.findSimilarProducts(
      userEmbedding,
      Array.from(purchasedIds),
      limit * 2
    );

    return this.rankWithDiversity(similarProducts, limit);
  }

  /**
   * Generate or retrieve product embedding
   */
  async generateProductEmbedding(product: Product): Promise<number[]> {
    const cacheKey = `embedding:product:${product.id}`;
    const cached = await redis.get(cacheKey);

    if (cached) {
      return JSON.parse(cached);
    }

    // Create text representation of product
    const productText = this.createProductText(product);

    // Generate embedding using OpenAI
    const response = await openai.embeddings.create({
      model: 'text-embedding-ada-002',
      input: productText,
    });

    const embedding = response.data[0].embedding;

    // Cache indefinitely (until product update)
    await redis.set(cacheKey, JSON.stringify(embedding));

    // Store in vector database for efficient search
    await this.storeProductEmbedding(product.id, embedding);

    return embedding;
  }

  private createProductText(product: Product): string {
    const parts = [
      product.name,
      product.attributes.brand,
      product.attributes.tags.join(' '),
      product.categoryId,
    ].filter(Boolean);

    return parts.join(' ').substring(0, 8000); // Token limit
  }

  private async getProductEmbeddings(
    productIds: string[]
  ): Promise<ProductEmbedding[]> {
    const embeddings: ProductEmbedding[] = [];

    for (const productId of productIds) {
      const cacheKey = `embedding:product:${productId}`;
      const cached = await redis.get(cacheKey);

      if (cached) {
        embeddings.push({
          productId,
          embedding: JSON.parse(cached),
        });
      }
    }

    return embeddings;
  }

  private calculateCentroid(embeddings: number[][]): number[] {
    if (embeddings.length === 0) {
      return [];
    }

    const dimension = embeddings[0].length;
    const centroid = new Array(dimension).fill(0);

    for (const embedding of embeddings) {
      for (let i = 0; i < dimension; i++) {
        centroid[i] += embedding[i];
      }
    }

    for (let i = 0; i < dimension; i++) {
      centroid[i] /= embeddings.length;
    }

    return centroid;
  }

  private async findSimilarProducts(
    embedding: number[],
    excludeIds: string[],
    limit: number
  ): Promise<RecommendationResult[]> {
    // Query vector database
    const results = await this.vectorSearch(
      'product_embeddings',
      embedding,
      limit,
      { excludeIds }
    );

    return results.map((result) => ({
      productId: result.id,
      score: result.score,
      source: 'content-based' as const,
      explanation: 'Similar to products you\'ve shown interest in',
      diversity: 0,
    }));
  }

  private async buildUserPreferenceEmbedding(
    userId: string
  ): Promise<number[] | null> {
    // Get user's interaction history
    const result = await db.query(`
      SELECT
        p.id,
        SUM(CASE ui.event_type
          WHEN 'purchase' THEN 5.0
          WHEN 'add_to_cart' THEN 3.0
          WHEN 'wishlist' THEN 2.0
          WHEN 'view' THEN 1.0
        END) as weight
      FROM user_interactions ui
      JOIN products p ON ui.product_id = p.id
      WHERE ui.user_id = $1
        AND ui.created_at > NOW() - INTERVAL '90 days'
      GROUP BY p.id
      ORDER BY weight DESC
      LIMIT 50
    `, [userId]);

    if (result.rows.length === 0) {
      return null;
    }

    // Get embeddings for interacted products
    const productIds = result.rows.map((row) => row.id);
    const embeddings = await this.getProductEmbeddings(productIds);

    // Calculate weighted centroid
    const weights = new Map(
      result.rows.map((row) => [row.id, row.weight])
    );

    return this.calculateWeightedCentroid(embeddings, weights);
  }

  private calculateWeightedCentroid(
    embeddings: ProductEmbedding[],
    weights: Map<string, number>
  ): number[] {
    if (embeddings.length === 0) {
      return [];
    }

    const dimension = embeddings[0].embedding.length;
    const centroid = new Array(dimension).fill(0);
    let totalWeight = 0;

    for (const { productId, embedding } of embeddings) {
      const weight = weights.get(productId) || 1;
      totalWeight += weight;

      for (let i = 0; i < dimension; i++) {
        centroid[i] += embedding[i] * weight;
      }
    }

    for (let i = 0; i < dimension; i++) {
      centroid[i] /= totalWeight;
    }

    return centroid;
  }

  private rankWithDiversity(
    results: RecommendationResult[],
    limit: number
  ): RecommendationResult[] {
    // Implement Maximal Marginal Relevance (MMR)
    const selected: RecommendationResult[] = [];
    const remaining = [...results];

    while (selected.length < limit && remaining.length > 0) {
      let bestIdx = 0;
      let bestScore = -Infinity;

      for (let i = 0; i < remaining.length; i++) {
        const candidate = remaining[i];

        // Calculate diversity penalty
        const maxSimilarity = selected.reduce((max, item) => {
          const sim = this.calculateDiversityPenalty(candidate, item);
          return Math.max(max, sim);
        }, 0);

        // MMR score: relevance - lambda * max_similarity
        const lambda = 0.5;
        const mmrScore = candidate.score - lambda * maxSimilarity;

        if (mmrScore > bestScore) {
          bestScore = mmrScore;
          bestIdx = i;
        }
      }

      const chosen = remaining.splice(bestIdx, 1)[0];
      chosen.diversity = 1 - (bestScore / (chosen.score + 0.001));
      selected.push(chosen);
    }

    return selected;
  }

  private calculateDiversityPenalty(
    a: RecommendationResult,
    b: RecommendationResult
  ): number {
    // Use category similarity as proxy for diversity
    // In production, use actual embedding similarity
    return a.productId === b.productId ? 1 : 0.2;
  }

  private async vectorSearch(
    collection: string,
    embedding: number[],
    limit: number,
    options: { excludeIds?: string[] }
  ): Promise<Array<{ id: string; score: number }>> {
    // Vector database integration
    return [];
  }

  private async storeProductEmbedding(
    productId: string,
    embedding: number[]
  ): Promise<void> {
    // Store in vector database
  }

  private async getUserPurchasedProductIds(userId: string): Promise<Set<string>> {
    const result = await db.query(`
      SELECT DISTINCT product_id
      FROM user_interactions
      WHERE user_id = $1 AND event_type = 'purchase'
    `, [userId]);

    return new Set(result.rows.map((row) => row.product_id));
  }
}
```

### Hybrid Recommendation Engine

```typescript
// lib/recommendations/hybrid-engine.ts
import { CollaborativeFilteringEngine } from './collaborative-filtering';
import { ContentBasedFilteringEngine } from './content-based-filtering';
import { ColdStartHandler } from './cold-start-handler';
import { redis } from '@/lib/redis';
import { db } from '@/lib/database';

interface HybridConfig {
  collaborativeWeight: number;
  contentBasedWeight: number;
  trendingWeight: number;
  personalizedBoost: number;
  diversityFactor: number;
}

export class HybridRecommendationEngine {
  private collaborativeEngine: CollaborativeFilteringEngine;
  private contentEngine: ContentBasedFilteringEngine;
  private coldStartHandler: ColdStartHandler;

  private defaultConfig: HybridConfig = {
    collaborativeWeight: 0.4,
    contentBasedWeight: 0.35,
    trendingWeight: 0.15,
    personalizedBoost: 0.1,
    diversityFactor: 0.3,
  };

  constructor() {
    this.collaborativeEngine = new CollaborativeFilteringEngine();
    this.contentEngine = new ContentBasedFilteringEngine();
    this.coldStartHandler = new ColdStartHandler();
  }

  /**
   * Get hybrid recommendations combining multiple strategies
   */
  async getRecommendations(
    context: RecommendationContext,
    config: RecommendationConfig
  ): Promise<RecommendationResult[]> {
    // Check for cold start conditions
    const coldStartStatus = await this.getColdStartStatus(context);

    if (coldStartStatus === 'new') {
      return this.coldStartHandler.getNewUserRecommendations(
        context,
        config.limit
      );
    }

    // Adjust weights based on cold start status
    const hybridConfig = this.adjustConfigForColdStart(
      this.defaultConfig,
      coldStartStatus
    );

    // Fetch recommendations from all sources in parallel
    const [collaborative, contentBased, trending, contextual] = await Promise.all([
      this.getCollaborativeRecommendations(context, config),
      this.getContentBasedRecommendations(context, config),
      this.getTrendingRecommendations(context, config),
      this.getContextualRecommendations(context, config),
    ]);

    // Merge and score all recommendations
    const merged = this.mergeRecommendations(
      [
        { results: collaborative, weight: hybridConfig.collaborativeWeight },
        { results: contentBased, weight: hybridConfig.contentBasedWeight },
        { results: trending, weight: hybridConfig.trendingWeight },
        { results: contextual, weight: hybridConfig.personalizedBoost },
      ],
      config.excludeProductIds || []
    );

    // Apply business rules
    const filtered = await this.applyBusinessRules(merged, context, config);

    // Apply diversity optimization
    const diversified = this.applyDiversityOptimization(
      filtered,
      hybridConfig.diversityFactor
    );

    // Return top N results
    return diversified.slice(0, config.limit);
  }

  private async getColdStartStatus(
    context: RecommendationContext
  ): Promise<ColdStartStatus> {
    if (!context.userId) {
      return 'new';
    }

    const interactionCount = await this.getUserInteractionCount(context.userId);

    if (interactionCount < 3) {
      return 'new';
    } else if (interactionCount < 20) {
      return 'warming';
    }

    return 'active';
  }

  private async getUserInteractionCount(userId: string): Promise<number> {
    const cacheKey = `user:interactions:count:${userId}`;
    const cached = await redis.get(cacheKey);

    if (cached) {
      return parseInt(cached, 10);
    }

    const result = await db.query(`
      SELECT COUNT(*) as count
      FROM user_interactions
      WHERE user_id = $1
        AND event_type IN ('purchase', 'add_to_cart', 'view')
        AND created_at > NOW() - INTERVAL '90 days'
    `, [userId]);

    const count = parseInt(result.rows[0].count, 10);

    await redis.setex(cacheKey, 3600, count.toString());

    return count;
  }

  private adjustConfigForColdStart(
    config: HybridConfig,
    status: ColdStartStatus
  ): HybridConfig {
    if (status === 'warming') {
      return {
        ...config,
        collaborativeWeight: 0.2, // Reduce collaborative
        contentBasedWeight: 0.3,
        trendingWeight: 0.35, // Increase trending
        personalizedBoost: 0.15,
      };
    }

    return config;
  }

  private async getCollaborativeRecommendations(
    context: RecommendationContext,
    config: RecommendationConfig
  ): Promise<RecommendationResult[]> {
    if (!context.userId) {
      return [];
    }

    // Get user-based recommendations
    const userBased = await this.collaborativeEngine.getUserBasedRecommendations(
      context.userId,
      config.limit
    );

    // If on product page, also get item-based
    if (context.currentProductId) {
      const itemBased = await this.collaborativeEngine.getItemBasedRecommendations(
        context.currentProductId,
        context.userId,
        config.limit
      );

      // Merge with preference for user-based
      return this.mergeWithPriority(userBased, itemBased, 0.6);
    }

    return userBased;
  }

  private async getContentBasedRecommendations(
    context: RecommendationContext,
    config: RecommendationConfig
  ): Promise<RecommendationResult[]> {
    if (context.currentProductId) {
      // Similar products to current
      return this.contentEngine.getContentBasedRecommendations(
        [context.currentProductId],
        config.limit,
        config.excludeProductIds
      );
    }

    if (context.userId) {
      // Based on user preferences
      return this.contentEngine.getUserPreferenceRecommendations(
        context.userId,
        config.limit
      );
    }

    return [];
  }

  private async getTrendingRecommendations(
    context: RecommendationContext,
    config: RecommendationConfig
  ): Promise<RecommendationResult[]> {
    const cacheKey = context.currentCategoryId
      ? `trending:category:${context.currentCategoryId}`
      : 'trending:global';

    const cached = await redis.get(cacheKey);

    if (cached) {
      return JSON.parse(cached);
    }

    const query = context.currentCategoryId
      ? `
        SELECT
          product_id,
          COUNT(*) as interaction_count,
          SUM(CASE event_type
            WHEN 'purchase' THEN 10
            WHEN 'add_to_cart' THEN 5
            WHEN 'view' THEN 1
          END) as score
        FROM user_interactions ui
        JOIN products p ON ui.product_id = p.id
        WHERE p.category_id = $1
          AND ui.created_at > NOW() - INTERVAL '7 days'
        GROUP BY product_id
        ORDER BY score DESC
        LIMIT $2
      `
      : `
        SELECT
          product_id,
          COUNT(*) as interaction_count,
          SUM(CASE event_type
            WHEN 'purchase' THEN 10
            WHEN 'add_to_cart' THEN 5
            WHEN 'view' THEN 1
          END) as score
        FROM user_interactions
        WHERE created_at > NOW() - INTERVAL '7 days'
        GROUP BY product_id
        ORDER BY score DESC
        LIMIT $1
      `;

    const params = context.currentCategoryId
      ? [context.currentCategoryId, config.limit]
      : [config.limit];

    const result = await db.query(query, params);

    const trending = result.rows.map((row) => ({
      productId: row.product_id,
      score: parseFloat(row.score) / 100, // Normalize
      source: 'trending' as const,
      explanation: 'Trending now',
      diversity: 0,
    }));

    await redis.setex(cacheKey, 1800, JSON.stringify(trending));

    return trending;
  }

  private async getContextualRecommendations(
    context: RecommendationContext,
    config: RecommendationConfig
  ): Promise<RecommendationResult[]> {
    // Device-specific recommendations
    const deviceBoost = context.device === 'mobile' ? 1.1 : 1.0;

    // Time-based recommendations
    const hour = context.timestamp.getHours();
    const isEvening = hour >= 18 || hour < 6;

    // Category affinity for page type
    let categoryFilter: string | null = null;
    if (context.pageType === 'category' && context.currentCategoryId) {
      categoryFilter = context.currentCategoryId;
    }

    const result = await db.query(`
      SELECT
        p.id as product_id,
        p.popularity * $1 as score
      FROM products p
      WHERE ($2::text IS NULL OR p.category_id = $2)
        AND p.is_active = true
      ORDER BY score DESC
      LIMIT $3
    `, [deviceBoost, categoryFilter, config.limit]);

    return result.rows.map((row) => ({
      productId: row.product_id,
      score: row.score,
      source: 'similar-users' as const,
      explanation: 'Recommended for you',
      diversity: 0,
    }));
  }

  private mergeRecommendations(
    sources: Array<{ results: RecommendationResult[]; weight: number }>,
    excludeIds: string[]
  ): RecommendationResult[] {
    const scoreMap = new Map<string, {
      score: number;
      sources: RecommendationSource[];
      explanations: string[];
    }>();

    const excludeSet = new Set(excludeIds);

    for (const { results, weight } of sources) {
      for (const result of results) {
        if (excludeSet.has(result.productId)) {
          continue;
        }

        const existing = scoreMap.get(result.productId);

        if (existing) {
          existing.score += result.score * weight;
          if (!existing.sources.includes(result.source)) {
            existing.sources.push(result.source);
          }
          if (result.explanation && !existing.explanations.includes(result.explanation)) {
            existing.explanations.push(result.explanation);
          }
        } else {
          scoreMap.set(result.productId, {
            score: result.score * weight,
            sources: [result.source],
            explanations: result.explanation ? [result.explanation] : [],
          });
        }
      }
    }

    const merged: RecommendationResult[] = [];

    for (const [productId, data] of scoreMap) {
      merged.push({
        productId,
        score: data.score,
        source: data.sources.length > 1 ? 'hybrid' : data.sources[0],
        explanation: data.explanations[0],
        diversity: 0,
      });
    }

    return merged.sort((a, b) => b.score - a.score);
  }

  private mergeWithPriority(
    primary: RecommendationResult[],
    secondary: RecommendationResult[],
    primaryWeight: number
  ): RecommendationResult[] {
    const scoreMap = new Map<string, number>();

    for (const item of primary) {
      scoreMap.set(item.productId, item.score * primaryWeight);
    }

    for (const item of secondary) {
      const existing = scoreMap.get(item.productId) || 0;
      scoreMap.set(item.productId, existing + item.score * (1 - primaryWeight));
    }

    return Array.from(scoreMap.entries())
      .map(([productId, score]) => {
        const primaryItem = primary.find((p) => p.productId === productId);
        return {
          productId,
          score,
          source: primaryItem?.source || 'collaborative' as const,
          explanation: primaryItem?.explanation,
          diversity: 0,
        };
      })
      .sort((a, b) => b.score - a.score);
  }

  private async applyBusinessRules(
    recommendations: RecommendationResult[],
    context: RecommendationContext,
    config: RecommendationConfig
  ): Promise<RecommendationResult[]> {
    // Filter by price range
    if (config.priceRange) {
      const productPrices = await this.getProductPrices(
        recommendations.map((r) => r.productId)
      );

      recommendations = recommendations.filter((r) => {
        const price = productPrices.get(r.productId);
        return (
          price !== undefined &&
          price >= config.priceRange!.min &&
          price <= config.priceRange!.max
        );
      });
    }

    // Filter by category
    if (config.includeCategoryIds?.length) {
      const productCategories = await this.getProductCategories(
        recommendations.map((r) => r.productId)
      );

      const categorySet = new Set(config.includeCategoryIds);
      recommendations = recommendations.filter((r) => {
        const category = productCategories.get(r.productId);
        return category && categorySet.has(category);
      });
    }

    // Boost in-stock items
    recommendations = await this.boostInStockItems(recommendations);

    return recommendations;
  }

  private async getProductPrices(
    productIds: string[]
  ): Promise<Map<string, number>> {
    const result = await db.query(`
      SELECT id, price FROM products WHERE id = ANY($1)
    `, [productIds]);

    return new Map(result.rows.map((row) => [row.id, row.price]));
  }

  private async getProductCategories(
    productIds: string[]
  ): Promise<Map<string, string>> {
    const result = await db.query(`
      SELECT id, category_id FROM products WHERE id = ANY($1)
    `, [productIds]);

    return new Map(result.rows.map((row) => [row.id, row.category_id]));
  }

  private async boostInStockItems(
    recommendations: RecommendationResult[]
  ): Promise<RecommendationResult[]> {
    const productIds = recommendations.map((r) => r.productId);

    const result = await db.query(`
      SELECT id, stock_quantity FROM products WHERE id = ANY($1)
    `, [productIds]);

    const stockMap = new Map(
      result.rows.map((row) => [row.id, row.stock_quantity])
    );

    return recommendations.map((r) => {
      const stock = stockMap.get(r.productId) || 0;
      const boost = stock > 0 ? 1.0 : 0.5; // Penalize out-of-stock
      return { ...r, score: r.score * boost };
    }).sort((a, b) => b.score - a.score);
  }

  private applyDiversityOptimization(
    recommendations: RecommendationResult[],
    diversityFactor: number
  ): RecommendationResult[] {
    if (diversityFactor === 0 || recommendations.length < 2) {
      return recommendations;
    }

    // Implement greedy diversification
    const selected: RecommendationResult[] = [];
    const remaining = [...recommendations];

    // Always select the top item first
    selected.push(remaining.shift()!);

    while (remaining.length > 0 && selected.length < recommendations.length) {
      let bestIdx = 0;
      let bestScore = -Infinity;

      for (let i = 0; i < remaining.length; i++) {
        const candidate = remaining[i];

        // Calculate diversity bonus
        const diversityBonus = this.calculateDiversityBonus(candidate, selected);

        // Combined score
        const combinedScore =
          candidate.score * (1 - diversityFactor) +
          diversityBonus * diversityFactor;

        if (combinedScore > bestScore) {
          bestScore = combinedScore;
          bestIdx = i;
        }
      }

      selected.push(remaining.splice(bestIdx, 1)[0]);
    }

    return selected;
  }

  private calculateDiversityBonus(
    candidate: RecommendationResult,
    selected: RecommendationResult[]
  ): number {
    // Simple diversity based on source variety
    const selectedSources = new Set(selected.map((s) => s.source));
    return selectedSources.has(candidate.source) ? 0 : 0.5;
  }
}
```

### Cold Start Handler

```typescript
// lib/recommendations/cold-start-handler.ts
import { redis } from '@/lib/redis';
import { db } from '@/lib/database';

export class ColdStartHandler {
  /**
   * Handle recommendations for brand new users
   */
  async getNewUserRecommendations(
    context: RecommendationContext,
    limit: number
  ): Promise<RecommendationResult[]> {
    // Strategy 1: Popular items
    const popular = await this.getPopularItems(limit);

    // Strategy 2: Category-based if available
    if (context.currentCategoryId) {
      const categoryPopular = await this.getCategoryPopular(
        context.currentCategoryId,
        limit
      );
      return this.interleaveLists(popular, categoryPopular, limit);
    }

    // Strategy 3: Demographic-based if available
    const demographicRecs = await this.getDemographicRecommendations(
      context,
      limit
    );

    if (demographicRecs.length > 0) {
      return this.interleaveLists(popular, demographicRecs, limit);
    }

    return popular;
  }

  /**
   * Handle recommendations for new products
   */
  async getNewProductRecommendations(
    productId: string,
    limit: number
  ): Promise<RecommendationResult[]> {
    // Get product attributes
    const product = await this.getProduct(productId);

    if (!product) {
      return [];
    }

    // Find similar products by attributes
    const similarByAttributes = await this.findSimilarByAttributes(
      product,
      limit
    );

    // Find products in same category
    const categoryProducts = await this.getCategoryProducts(
      product.categoryId,
      productId,
      limit
    );

    return this.interleaveLists(similarByAttributes, categoryProducts, limit);
  }

  private async getPopularItems(limit: number): Promise<RecommendationResult[]> {
    const cacheKey = 'cold-start:popular';
    const cached = await redis.get(cacheKey);

    if (cached) {
      return JSON.parse(cached).slice(0, limit);
    }

    const result = await db.query(`
      SELECT
        product_id,
        COUNT(*) as purchase_count,
        AVG(rating) as avg_rating
      FROM orders o
      JOIN order_items oi ON o.id = oi.order_id
      JOIN products p ON oi.product_id = p.id
      WHERE o.created_at > NOW() - INTERVAL '30 days'
        AND p.is_active = true
        AND p.stock_quantity > 0
      GROUP BY product_id
      ORDER BY purchase_count DESC, avg_rating DESC
      LIMIT 100
    `);

    const recommendations = result.rows.map((row, idx) => ({
      productId: row.product_id,
      score: 1.0 - (idx / 100), // Decay score by rank
      source: 'cold-start' as const,
      explanation: 'Popular with our customers',
      diversity: 0,
    }));

    await redis.setex(cacheKey, 3600, JSON.stringify(recommendations));

    return recommendations.slice(0, limit);
  }

  private async getCategoryPopular(
    categoryId: string,
    limit: number
  ): Promise<RecommendationResult[]> {
    const cacheKey = `cold-start:category:${categoryId}`;
    const cached = await redis.get(cacheKey);

    if (cached) {
      return JSON.parse(cached).slice(0, limit);
    }

    const result = await db.query(`
      SELECT
        p.id as product_id,
        COUNT(oi.id) as purchase_count
      FROM products p
      LEFT JOIN order_items oi ON p.id = oi.product_id
      LEFT JOIN orders o ON oi.order_id = o.id AND o.created_at > NOW() - INTERVAL '30 days'
      WHERE p.category_id = $1
        AND p.is_active = true
        AND p.stock_quantity > 0
      GROUP BY p.id
      ORDER BY purchase_count DESC, p.rating DESC
      LIMIT 50
    `, [categoryId]);

    const recommendations = result.rows.map((row, idx) => ({
      productId: row.product_id,
      score: 1.0 - (idx / 50),
      source: 'cold-start' as const,
      explanation: 'Popular in this category',
      diversity: 0,
    }));

    await redis.setex(cacheKey, 1800, JSON.stringify(recommendations));

    return recommendations.slice(0, limit);
  }

  private async getDemographicRecommendations(
    context: RecommendationContext,
    limit: number
  ): Promise<RecommendationResult[]> {
    // Use device as demographic signal for anonymous users
    const deviceType = context.device;

    const cacheKey = `cold-start:device:${deviceType}`;
    const cached = await redis.get(cacheKey);

    if (cached) {
      return JSON.parse(cached).slice(0, limit);
    }

    // Products that convert well on this device type
    const result = await db.query(`
      SELECT
        p.id as product_id,
        COUNT(CASE WHEN o.status = 'completed' THEN 1 END)::float /
          NULLIF(COUNT(ui.id), 0) as conversion_rate
      FROM products p
      JOIN user_interactions ui ON p.id = ui.product_id
      LEFT JOIN orders o ON ui.session_id = o.session_id
      WHERE ui.device_type = $1
        AND ui.created_at > NOW() - INTERVAL '30 days'
        AND p.is_active = true
      GROUP BY p.id
      HAVING COUNT(ui.id) >= 10
      ORDER BY conversion_rate DESC
      LIMIT 50
    `, [deviceType]);

    const recommendations = result.rows.map((row) => ({
      productId: row.product_id,
      score: row.conversion_rate,
      source: 'cold-start' as const,
      explanation: 'Recommended for you',
      diversity: 0,
    }));

    await redis.setex(cacheKey, 3600, JSON.stringify(recommendations));

    return recommendations.slice(0, limit);
  }

  private async getProduct(productId: string): Promise<Product | null> {
    const result = await db.query(`
      SELECT * FROM products WHERE id = $1
    `, [productId]);

    return result.rows[0] || null;
  }

  private async findSimilarByAttributes(
    product: Product,
    limit: number
  ): Promise<RecommendationResult[]> {
    const result = await db.query(`
      SELECT
        p.id as product_id,
        (
          CASE WHEN p.attributes->>'brand' = $2 THEN 0.3 ELSE 0 END +
          CASE WHEN p.attributes->'tags' ?| $3 THEN 0.3 ELSE 0 END +
          CASE WHEN ABS(p.price - $4) / $4 < 0.2 THEN 0.2 ELSE 0 END +
          CASE WHEN p.attributes->>'color' = $5 THEN 0.1 ELSE 0 END +
          CASE WHEN p.attributes->>'size' = $6 THEN 0.1 ELSE 0 END
        ) as similarity_score
      FROM products p
      WHERE p.category_id = $1
        AND p.id != $7
        AND p.is_active = true
        AND p.stock_quantity > 0
      ORDER BY similarity_score DESC
      LIMIT $8
    `, [
      product.categoryId,
      product.attributes.brand,
      product.attributes.tags,
      product.price,
      product.attributes.color,
      product.attributes.size,
      product.id,
      limit,
    ]);

    return result.rows.map((row) => ({
      productId: row.product_id,
      score: row.similarity_score,
      source: 'content-based' as const,
      explanation: 'Similar products',
      diversity: 0,
    }));
  }

  private async getCategoryProducts(
    categoryId: string,
    excludeId: string,
    limit: number
  ): Promise<RecommendationResult[]> {
    const result = await db.query(`
      SELECT id as product_id, popularity
      FROM products
      WHERE category_id = $1
        AND id != $2
        AND is_active = true
        AND stock_quantity > 0
      ORDER BY popularity DESC
      LIMIT $3
    `, [categoryId, excludeId, limit]);

    return result.rows.map((row) => ({
      productId: row.product_id,
      score: row.popularity,
      source: 'cold-start' as const,
      explanation: 'From this category',
      diversity: 0,
    }));
  }

  private interleaveLists(
    list1: RecommendationResult[],
    list2: RecommendationResult[],
    limit: number
  ): RecommendationResult[] {
    const result: RecommendationResult[] = [];
    const seen = new Set<string>();

    let i = 0;
    let j = 0;

    while (result.length < limit && (i < list1.length || j < list2.length)) {
      // Alternate between lists with 2:1 ratio
      if (i < list1.length && (result.length % 3 !== 2 || j >= list2.length)) {
        if (!seen.has(list1[i].productId)) {
          seen.add(list1[i].productId);
          result.push(list1[i]);
        }
        i++;
      } else if (j < list2.length) {
        if (!seen.has(list2[j].productId)) {
          seen.add(list2[j].productId);
          result.push(list2[j]);
        }
        j++;
      }
    }

    return result;
  }
}
```

### Server Component Integration

```typescript
// app/components/recommendations/ProductRecommendations.tsx
import { Suspense } from 'react';
import { HybridRecommendationEngine } from '@/lib/recommendations/hybrid-engine';
import { ProductCard } from '@/components/ProductCard';
import { RecommendationsSkeleton } from './RecommendationsSkeleton';

interface ProductRecommendationsProps {
  userId?: string;
  sessionId: string;
  currentProductId?: string;
  currentCategoryId?: string;
  pageType: 'home' | 'product' | 'category' | 'cart' | 'checkout';
  limit?: number;
  title?: string;
}

async function RecommendationsContent({
  userId,
  sessionId,
  currentProductId,
  currentCategoryId,
  pageType,
  limit = 12,
}: ProductRecommendationsProps) {
  const engine = new HybridRecommendationEngine();

  const context: RecommendationContext = {
    userId,
    sessionId,
    currentProductId,
    currentCategoryId,
    pageType,
    device: 'desktop', // Determine from headers
    timestamp: new Date(),
  };

  const config: RecommendationConfig = {
    limit,
    diversityWeight: 0.3,
    freshnessWeight: 0.2,
    personalizedWeight: 0.5,
    excludeProductIds: currentProductId ? [currentProductId] : [],
  };

  const recommendations = await engine.getRecommendations(context, config);

  // Fetch product details
  const products = await getProductsByIds(
    recommendations.map((r) => r.productId)
  );

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {products.map((product, index) => (
        <ProductCard
          key={product.id}
          product={product}
          recommendation={recommendations[index]}
          priority={index < 4}
        />
      ))}
    </div>
  );
}

export function ProductRecommendations(props: ProductRecommendationsProps) {
  return (
    <section className="py-8">
      <h2 className="text-2xl font-bold mb-4">
        {props.title || 'Recommended for you'}
      </h2>
      <Suspense fallback={<RecommendationsSkeleton count={props.limit || 12} />}>
        <RecommendationsContent {...props} />
      </Suspense>
    </section>
  );
}

async function getProductsByIds(ids: string[]): Promise<Product[]> {
  // Fetch products in order
  return [];
}
```

### Real-Time Personalization API

```typescript
// app/api/recommendations/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { HybridRecommendationEngine } from '@/lib/recommendations/hybrid-engine';
import { trackRecommendationImpression } from '@/lib/analytics';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      userId,
      sessionId,
      currentProductId,
      currentCategoryId,
      pageType,
      limit = 12,
      excludeProductIds = [],
    } = body;

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    const engine = new HybridRecommendationEngine();

    const context: RecommendationContext = {
      userId,
      sessionId,
      currentProductId,
      currentCategoryId,
      pageType: pageType || 'home',
      device: getDeviceType(request),
      timestamp: new Date(),
    };

    const config: RecommendationConfig = {
      limit,
      diversityWeight: 0.3,
      freshnessWeight: 0.2,
      personalizedWeight: 0.5,
      excludeProductIds,
    };

    const recommendations = await engine.getRecommendations(context, config);

    // Track impressions asynchronously
    trackRecommendationImpression({
      userId,
      sessionId,
      recommendations: recommendations.map((r) => r.productId),
      context: pageType,
    }).catch(console.error);

    return NextResponse.json({
      recommendations,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Recommendation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate recommendations' },
      { status: 500 }
    );
  }
}

function getDeviceType(request: NextRequest): 'mobile' | 'desktop' | 'tablet' {
  const userAgent = request.headers.get('user-agent') || '';

  if (/mobile/i.test(userAgent)) {
    return 'mobile';
  }
  if (/tablet|ipad/i.test(userAgent)) {
    return 'tablet';
  }
  return 'desktop';
}
```

## Examples

### Basic Product Page Recommendations

```typescript
// app/products/[id]/page.tsx
import { ProductRecommendations } from '@/components/recommendations/ProductRecommendations';
import { getSessionId, getUserId } from '@/lib/session';

export default async function ProductPage({
  params,
}: {
  params: { id: string };
}) {
  const sessionId = await getSessionId();
  const userId = await getUserId();

  return (
    <div>
      {/* Product details */}

      <ProductRecommendations
        userId={userId}
        sessionId={sessionId}
        currentProductId={params.id}
        pageType="product"
        title="You might also like"
        limit={8}
      />

      <ProductRecommendations
        userId={userId}
        sessionId={sessionId}
        currentProductId={params.id}
        pageType="product"
        title="Frequently bought together"
        limit={4}
      />
    </div>
  );
}
```

### Cart Page Cross-Sell

```typescript
// app/cart/page.tsx
import { getCart } from '@/lib/cart';
import { CartCrossSell } from '@/components/recommendations/CartCrossSell';

export default async function CartPage() {
  const cart = await getCart();
  const productIds = cart.items.map((item) => item.productId);

  return (
    <div>
      {/* Cart items */}

      <CartCrossSell
        cartProductIds={productIds}
        title="Complete your purchase"
        limit={4}
      />
    </div>
  );
}
```

## Anti-Patterns

### What to Avoid

```typescript
// BAD: Fetching all products and filtering client-side
async function getRecommendations() {
  const allProducts = await db.query('SELECT * FROM products');
  return allProducts.filter((p) => p.category === userCategory);
}

// BAD: No caching for expensive operations
async function getSimilarUsers(userId: string) {
  // Recalculating on every request
  return await calculateCosineSimilarity(userId);
}

// BAD: Synchronous blocking for non-critical recommendations
async function getProductPage(productId: string) {
  const product = await getProduct(productId);
  const recommendations = await getRecommendations(productId); // Blocks render
  return { product, recommendations };
}

// BAD: No cold start handling
async function getPersonalized(userId: string) {
  const userHistory = await getUserHistory(userId);
  if (userHistory.length === 0) {
    return []; // Empty recommendations for new users
  }
  return calculateRecommendations(userHistory);
}

// BAD: Not excluding already purchased items
async function getRecommendations(userId: string) {
  return await collaborativeFilter.recommend(userId);
  // User sees items they already bought
}
```

### Correct Patterns

```typescript
// GOOD: Use database for filtering with proper indexes
async function getRecommendations(categoryId: string, limit: number) {
  return db.query(`
    SELECT * FROM products
    WHERE category_id = $1
    ORDER BY popularity DESC
    LIMIT $2
  `, [categoryId, limit]);
}

// GOOD: Cache expensive computations
async function getSimilarUsers(userId: string) {
  const cacheKey = `similar:${userId}`;
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached);

  const result = await calculateCosineSimilarity(userId);
  await redis.setex(cacheKey, 3600, JSON.stringify(result));
  return result;
}

// GOOD: Use Suspense for non-blocking recommendations
function ProductPage({ productId }) {
  return (
    <div>
      <ProductDetails productId={productId} />
      <Suspense fallback={<RecommendationsSkeleton />}>
        <Recommendations productId={productId} />
      </Suspense>
    </div>
  );
}

// GOOD: Handle cold start gracefully
async function getPersonalized(userId: string) {
  const userHistory = await getUserHistory(userId);
  if (userHistory.length < 3) {
    return getPopularItems(); // Fallback for new users
  }
  return calculateRecommendations(userHistory);
}

// GOOD: Exclude purchased items
async function getRecommendations(userId: string) {
  const purchasedIds = await getPurchasedProductIds(userId);
  return collaborativeFilter.recommend(userId, {
    excludeIds: purchasedIds,
  });
}
```

## Testing

### Unit Tests

```typescript
// __tests__/recommendations/collaborative-filtering.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CollaborativeFilteringEngine } from '@/lib/recommendations/collaborative-filtering';

describe('CollaborativeFilteringEngine', () => {
  let engine: CollaborativeFilteringEngine;

  beforeEach(() => {
    engine = new CollaborativeFilteringEngine();
  });

  describe('getUserBasedRecommendations', () => {
    it('returns empty array for user with no history', async () => {
      vi.mock('@/lib/database', () => ({
        db: {
          query: vi.fn().mockResolvedValue({ rows: [] }),
        },
      }));

      const result = await engine.getUserBasedRecommendations('new-user', 10);
      expect(result).toEqual([]);
    });

    it('returns recommendations based on similar users', async () => {
      // Setup mock data
      const mockSimilarUsers = [
        { userId: 'user-2', similarity: 0.8 },
        { userId: 'user-3', similarity: 0.6 },
      ];

      const result = await engine.getUserBasedRecommendations('user-1', 10);

      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toHaveProperty('productId');
      expect(result[0]).toHaveProperty('score');
      expect(result[0].source).toBe('collaborative');
    });

    it('excludes products user has already purchased', async () => {
      const purchasedId = 'product-already-bought';

      const result = await engine.getUserBasedRecommendations('user-1', 10);

      const productIds = result.map((r) => r.productId);
      expect(productIds).not.toContain(purchasedId);
    });
  });

  describe('getItemBasedRecommendations', () => {
    it('finds similar items based on co-occurrence', async () => {
      const result = await engine.getItemBasedRecommendations('product-1', null, 10);

      expect(result.length).toBeGreaterThan(0);
      result.forEach((rec) => {
        expect(rec.productId).not.toBe('product-1');
        expect(rec.score).toBeGreaterThan(0);
        expect(rec.score).toBeLessThanOrEqual(1);
      });
    });
  });
});
```

### Integration Tests

```typescript
// __tests__/recommendations/hybrid-engine.integration.test.ts
import { describe, it, expect } from 'vitest';
import { HybridRecommendationEngine } from '@/lib/recommendations/hybrid-engine';
import { setupTestDatabase, cleanupTestDatabase } from '../helpers';

describe('HybridRecommendationEngine Integration', () => {
  beforeAll(async () => {
    await setupTestDatabase();
  });

  afterAll(async () => {
    await cleanupTestDatabase();
  });

  it('generates recommendations for active users', async () => {
    const engine = new HybridRecommendationEngine();

    const context: RecommendationContext = {
      userId: 'test-user-active',
      sessionId: 'session-1',
      pageType: 'home',
      device: 'desktop',
      timestamp: new Date(),
    };

    const config: RecommendationConfig = {
      limit: 10,
      diversityWeight: 0.3,
      freshnessWeight: 0.2,
      personalizedWeight: 0.5,
    };

    const result = await engine.getRecommendations(context, config);

    expect(result.length).toBe(10);
    expect(result[0].score).toBeGreaterThanOrEqual(result[9].score);
  });

  it('handles cold start for new users', async () => {
    const engine = new HybridRecommendationEngine();

    const context: RecommendationContext = {
      userId: 'brand-new-user',
      sessionId: 'session-2',
      pageType: 'home',
      device: 'mobile',
      timestamp: new Date(),
    };

    const config: RecommendationConfig = {
      limit: 10,
      diversityWeight: 0.3,
      freshnessWeight: 0.2,
      personalizedWeight: 0.5,
    };

    const result = await engine.getRecommendations(context, config);

    expect(result.length).toBe(10);
    expect(result.some((r) => r.source === 'cold-start' || r.source === 'trending')).toBe(true);
  });

  it('respects diversity settings', async () => {
    const engine = new HybridRecommendationEngine();

    const context: RecommendationContext = {
      userId: 'test-user',
      sessionId: 'session-3',
      pageType: 'home',
      device: 'desktop',
      timestamp: new Date(),
    };

    const lowDiversity = await engine.getRecommendations(context, {
      limit: 10,
      diversityWeight: 0,
      freshnessWeight: 0,
      personalizedWeight: 1,
    });

    const highDiversity = await engine.getRecommendations(context, {
      limit: 10,
      diversityWeight: 0.8,
      freshnessWeight: 0.1,
      personalizedWeight: 0.1,
    });

    // High diversity should have more varied sources
    const lowSources = new Set(lowDiversity.map((r) => r.source));
    const highSources = new Set(highDiversity.map((r) => r.source));

    expect(highSources.size).toBeGreaterThanOrEqual(lowSources.size);
  });
});
```

### Performance Tests

```typescript
// __tests__/recommendations/performance.test.ts
import { describe, it, expect } from 'vitest';
import { HybridRecommendationEngine } from '@/lib/recommendations/hybrid-engine';

describe('Recommendation Performance', () => {
  it('generates recommendations within 200ms', async () => {
    const engine = new HybridRecommendationEngine();

    const context: RecommendationContext = {
      userId: 'perf-test-user',
      sessionId: 'perf-session',
      pageType: 'home',
      device: 'desktop',
      timestamp: new Date(),
    };

    const config: RecommendationConfig = {
      limit: 20,
      diversityWeight: 0.3,
      freshnessWeight: 0.2,
      personalizedWeight: 0.5,
    };

    const start = performance.now();
    await engine.getRecommendations(context, config);
    const duration = performance.now() - start;

    expect(duration).toBeLessThan(200);
  });

  it('handles concurrent requests efficiently', async () => {
    const engine = new HybridRecommendationEngine();

    const requests = Array.from({ length: 100 }, (_, i) => ({
      userId: `user-${i}`,
      sessionId: `session-${i}`,
      pageType: 'home' as const,
      device: 'desktop' as const,
      timestamp: new Date(),
    }));

    const config: RecommendationConfig = {
      limit: 10,
      diversityWeight: 0.3,
      freshnessWeight: 0.2,
      personalizedWeight: 0.5,
    };

    const start = performance.now();
    await Promise.all(
      requests.map((context) => engine.getRecommendations(context, config))
    );
    const duration = performance.now() - start;

    // Average should be under 50ms per request with batching
    expect(duration / 100).toBeLessThan(50);
  });
});
```

## Changelog

### v1.0.0 (2025-01-18)
- Initial pattern documentation
| 1.1.0 | 2025-01-18 | Added cold start strategies |
| 1.2.0 | 2025-01-18 | Added hybrid engine implementation |
| 1.3.0 | 2025-01-18 | Added real-time personalization API |
| 1.4.0 | 2025-01-18 | Added comprehensive testing examples |
