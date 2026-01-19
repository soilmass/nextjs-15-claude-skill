---
id: pt-review-moderation
name: Review Moderation
version: 1.0.0
layer: L5
category: e-commerce
description: Automated and manual review moderation with spam detection and sentiment analysis
tags: [reviews, moderation, spam-detection, sentiment-analysis, next15]
composes: []
dependencies: {}
formula: Review Moderation = Spam Detection + Sentiment Analysis + Manual Queue + Approval Workflow
performance:
  impact: medium
  lcp: neutral
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# Review Moderation

## Overview

Comprehensive review moderation systems ensure authentic, helpful product reviews while preventing spam, fake reviews, and inappropriate content. This pattern covers the complete review lifecycle from submission to publication, including AI-powered spam detection, human moderation workflows, authenticity verification, and merchant response management.

### Key Concepts

- **Review Submission**: Structured review collection with purchase verification
- **Spam Detection**: AI and rule-based spam filtering
- **Moderation Workflows**: Multi-stage review approval pipelines
- **Authenticity Verification**: Verified purchase badges and identity checks
- **Response Management**: Merchant reply systems with templates

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        REVIEW MODERATION SYSTEM                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                     REVIEW SUBMISSION LAYER                           │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌────────────────────────────┐   │   │
│  │  │   Review    │  │   Media     │  │   Purchase                 │   │   │
│  │  │    Form     │  │   Upload    │  │   Verification             │   │   │
│  │  └──────┬──────┘  └──────┬──────┘  └─────────────┬──────────────┘   │   │
│  │         │                │                       │                   │   │
│  │         └────────────────┼───────────────────────┘                   │   │
│  │                          ▼                                           │   │
│  │  ┌────────────────────────────────────────────────────────────────┐ │   │
│  │  │                    SUBMISSION QUEUE                             │ │   │
│  │  └────────────────────────────────────────────────────────────────┘ │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                    │                                         │
│                                    ▼                                         │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                     AUTOMATED PROCESSING LAYER                        │   │
│  │                                                                        │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌────────────┐  │   │
│  │  │   Spam      │  │  Profanity  │  │   Sentiment │  │   Fraud    │  │   │
│  │  │   Filter    │  │   Filter    │  │   Analysis  │  │   Detection│  │   │
│  │  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └─────┬──────┘  │   │
│  │         │                │                │               │          │   │
│  │         └────────────────┼────────────────┼───────────────┘          │   │
│  │                          ▼                ▼                          │   │
│  │  ┌────────────────────────────────────────────────────────────────┐ │   │
│  │  │              AUTOMATED DECISION ENGINE                          │ │   │
│  │  │  ┌──────────┐     ┌──────────┐     ┌────────────────────────┐  │ │   │
│  │  │  │  Auto    │     │  Flag    │     │   Auto Reject          │  │ │   │
│  │  │  │  Approve │     │  Review  │     │   (Spam/Abuse)         │  │ │   │
│  │  │  └────┬─────┘     └────┬─────┘     └───────────┬────────────┘  │ │   │
│  │  └───────┼────────────────┼───────────────────────┼───────────────┘ │   │
│  └──────────┼────────────────┼───────────────────────┼─────────────────┘   │
│             │                │                       │                      │
│             │                ▼                       │                      │
│  ┌──────────┼──────────────────────────────────────┼─────────────────────┐ │
│  │          │      HUMAN MODERATION QUEUE          │                      │ │
│  │          │  ┌─────────────────────────────────┐ │                      │ │
│  │          │  │  ┌─────────┐  ┌─────────┐      │ │                      │ │
│  │          │  │  │Priority │  │ Standard│      │ │                      │ │
│  │          │  │  │ Queue   │  │ Queue   │      │ │                      │ │
│  │          │  │  └────┬────┘  └────┬────┘      │ │                      │ │
│  │          │  │       │            │           │ │                      │ │
│  │          │  │       ▼            ▼           │ │                      │ │
│  │          │  │   ┌────────────────────────┐   │ │                      │ │
│  │          │  │   │   Moderator Dashboard  │   │ │                      │ │
│  │          │  │   └───────────┬────────────┘   │ │                      │ │
│  │          │  └───────────────┼────────────────┘ │                      │ │
│  └──────────┼──────────────────┼──────────────────┼──────────────────────┘ │
│             │                  │                  │                        │
│             ▼                  ▼                  ▼                        │
│  ┌────────────────────────────────────────────────────────────────────────┐│
│  │                      REVIEW STATUS MANAGEMENT                          ││
│  │  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────────────┐  ││
│  │  │ Published │  │  Pending  │  │  Rejected │  │ Merchant Response │  ││
│  │  └───────────┘  └───────────┘  └───────────┘  └───────────────────┘  ││
│  └────────────────────────────────────────────────────────────────────────┘│
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Implementation

### Core Types and Interfaces

```typescript
// types/reviews.ts
export interface Review {
  id: string;
  productId: string;
  userId: string;
  orderId?: string;
  rating: number;
  title: string;
  content: string;
  pros?: string[];
  cons?: string[];
  media: ReviewMedia[];
  status: ReviewStatus;
  verifiedPurchase: boolean;
  helpfulVotes: number;
  notHelpfulVotes: number;
  moderationHistory: ModerationEvent[];
  merchantResponse?: MerchantResponse;
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
}

export interface ReviewMedia {
  id: string;
  type: 'image' | 'video';
  url: string;
  thumbnailUrl?: string;
  status: MediaStatus;
  moderationScore?: number;
}

export type ReviewStatus =
  | 'pending'
  | 'auto_approved'
  | 'in_review'
  | 'approved'
  | 'rejected'
  | 'flagged'
  | 'removed';

export type MediaStatus = 'pending' | 'approved' | 'rejected';

export interface ModerationEvent {
  id: string;
  timestamp: Date;
  action: ModerationAction;
  moderatorId?: string;
  moderatorType: 'system' | 'human';
  reason?: string;
  details?: Record<string, unknown>;
}

export type ModerationAction =
  | 'submitted'
  | 'auto_approved'
  | 'auto_rejected'
  | 'flagged'
  | 'manually_approved'
  | 'manually_rejected'
  | 'edited'
  | 'removed'
  | 'restored'
  | 'escalated';

export interface MerchantResponse {
  id: string;
  reviewId: string;
  merchantId: string;
  content: string;
  status: 'pending' | 'published' | 'removed';
  createdAt: Date;
  updatedAt: Date;
}

export interface ReviewSubmission {
  productId: string;
  orderId?: string;
  rating: number;
  title: string;
  content: string;
  pros?: string[];
  cons?: string[];
  mediaIds?: string[];
}

export interface ModerationResult {
  decision: 'approve' | 'reject' | 'flag';
  confidence: number;
  reasons: ModerationReason[];
  scores: ModerationScores;
}

export interface ModerationReason {
  code: string;
  message: string;
  severity: 'low' | 'medium' | 'high';
}

export interface ModerationScores {
  spam: number;
  profanity: number;
  sentiment: number;
  authenticity: number;
  quality: number;
  fraud: number;
}

export interface ReviewFilter {
  productId?: string;
  userId?: string;
  status?: ReviewStatus[];
  rating?: number[];
  verifiedOnly?: boolean;
  hasMedia?: boolean;
  dateRange?: { start: Date; end: Date };
  sortBy?: 'newest' | 'oldest' | 'highest' | 'lowest' | 'helpful';
}

export interface ReviewStats {
  totalReviews: number;
  averageRating: number;
  ratingDistribution: Record<number, number>;
  verifiedPurchaseCount: number;
  withMediaCount: number;
}
```

### Review Submission Service

```typescript
// lib/reviews/submission-service.ts
import { db } from '@/lib/database';
import { redis } from '@/lib/redis';
import { ModerationPipeline } from './moderation-pipeline';
import { MediaProcessor } from './media-processor';
import { generateId } from '@/lib/utils';

export class ReviewSubmissionService {
  private moderationPipeline: ModerationPipeline;
  private mediaProcessor: MediaProcessor;

  constructor() {
    this.moderationPipeline = new ModerationPipeline();
    this.mediaProcessor = new MediaProcessor();
  }

  /**
   * Submit a new review
   */
  async submitReview(
    userId: string,
    submission: ReviewSubmission
  ): Promise<{ reviewId: string; status: ReviewStatus }> {
    // Validate user can review this product
    await this.validateSubmission(userId, submission);

    // Check for duplicate submission
    const isDuplicate = await this.checkDuplicate(userId, submission.productId);
    if (isDuplicate) {
      throw new Error('You have already reviewed this product');
    }

    // Verify purchase if orderId provided
    const verifiedPurchase = submission.orderId
      ? await this.verifyPurchase(userId, submission.productId, submission.orderId)
      : false;

    // Create review record
    const reviewId = generateId('rev');
    const review: Review = {
      id: reviewId,
      productId: submission.productId,
      userId,
      orderId: submission.orderId,
      rating: submission.rating,
      title: this.sanitizeText(submission.title),
      content: this.sanitizeText(submission.content),
      pros: submission.pros?.map((p) => this.sanitizeText(p)),
      cons: submission.cons?.map((c) => this.sanitizeText(c)),
      media: [],
      status: 'pending',
      verifiedPurchase,
      helpfulVotes: 0,
      notHelpfulVotes: 0,
      moderationHistory: [{
        id: generateId('mod'),
        timestamp: new Date(),
        action: 'submitted',
        moderatorType: 'system',
      }],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Process media if present
    if (submission.mediaIds?.length) {
      review.media = await this.mediaProcessor.processReviewMedia(
        reviewId,
        submission.mediaIds
      );
    }

    // Save to database
    await this.saveReview(review);

    // Queue for moderation
    const moderationResult = await this.moderationPipeline.processReview(review);

    // Update status based on moderation
    const finalStatus = await this.applyModerationResult(reviewId, moderationResult);

    // Invalidate caches
    await this.invalidateProductReviewCache(submission.productId);

    return { reviewId, status: finalStatus };
  }

  private async validateSubmission(
    userId: string,
    submission: ReviewSubmission
  ): Promise<void> {
    // Check rating bounds
    if (submission.rating < 1 || submission.rating > 5) {
      throw new Error('Rating must be between 1 and 5');
    }

    // Check title length
    if (!submission.title || submission.title.length < 5 || submission.title.length > 200) {
      throw new Error('Title must be between 5 and 200 characters');
    }

    // Check content length
    if (!submission.content || submission.content.length < 20 || submission.content.length > 5000) {
      throw new Error('Review must be between 20 and 5000 characters');
    }

    // Check rate limiting
    const recentReviews = await this.getRecentReviewCount(userId, 24);
    if (recentReviews >= 10) {
      throw new Error('Too many reviews submitted. Please try again later.');
    }

    // Check product exists and is reviewable
    const product = await db.query(
      'SELECT id, is_active FROM products WHERE id = $1',
      [submission.productId]
    );

    if (!product.rows[0]) {
      throw new Error('Product not found');
    }

    if (!product.rows[0].is_active) {
      throw new Error('This product cannot be reviewed');
    }
  }

  private async checkDuplicate(
    userId: string,
    productId: string
  ): Promise<boolean> {
    const result = await db.query(`
      SELECT id FROM reviews
      WHERE user_id = $1
        AND product_id = $2
        AND status NOT IN ('rejected', 'removed')
    `, [userId, productId]);

    return result.rows.length > 0;
  }

  private async verifyPurchase(
    userId: string,
    productId: string,
    orderId: string
  ): Promise<boolean> {
    const result = await db.query(`
      SELECT o.id
      FROM orders o
      JOIN order_items oi ON o.id = oi.order_id
      WHERE o.id = $1
        AND o.user_id = $2
        AND oi.product_id = $3
        AND o.status = 'completed'
        AND o.completed_at < NOW() - INTERVAL '1 day'
    `, [orderId, userId, productId]);

    return result.rows.length > 0;
  }

  private sanitizeText(text: string): string {
    // Remove potentially harmful HTML/scripts
    return text
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<[^>]+>/g, '')
      .trim();
  }

  private async getRecentReviewCount(
    userId: string,
    hours: number
  ): Promise<number> {
    const result = await db.query(`
      SELECT COUNT(*) as count
      FROM reviews
      WHERE user_id = $1
        AND created_at > NOW() - INTERVAL '${hours} hours'
    `, [userId]);

    return parseInt(result.rows[0].count, 10);
  }

  private async saveReview(review: Review): Promise<void> {
    await db.query(`
      INSERT INTO reviews (
        id, product_id, user_id, order_id, rating, title, content,
        pros, cons, media, status, verified_purchase, helpful_votes,
        not_helpful_votes, moderation_history, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17
      )
    `, [
      review.id,
      review.productId,
      review.userId,
      review.orderId,
      review.rating,
      review.title,
      review.content,
      JSON.stringify(review.pros),
      JSON.stringify(review.cons),
      JSON.stringify(review.media),
      review.status,
      review.verifiedPurchase,
      review.helpfulVotes,
      review.notHelpfulVotes,
      JSON.stringify(review.moderationHistory),
      review.createdAt,
      review.updatedAt,
    ]);
  }

  private async applyModerationResult(
    reviewId: string,
    result: ModerationResult
  ): Promise<ReviewStatus> {
    let newStatus: ReviewStatus;
    let action: ModerationAction;

    switch (result.decision) {
      case 'approve':
        newStatus = result.confidence >= 0.9 ? 'auto_approved' : 'approved';
        action = 'auto_approved';
        break;
      case 'reject':
        newStatus = 'rejected';
        action = 'auto_rejected';
        break;
      case 'flag':
      default:
        newStatus = 'flagged';
        action = 'flagged';
        break;
    }

    const moderationEvent: ModerationEvent = {
      id: generateId('mod'),
      timestamp: new Date(),
      action,
      moderatorType: 'system',
      reason: result.reasons.map((r) => r.message).join('; '),
      details: { scores: result.scores, confidence: result.confidence },
    };

    await db.query(`
      UPDATE reviews
      SET status = $1,
          moderation_history = moderation_history || $2::jsonb,
          updated_at = NOW(),
          published_at = CASE WHEN $1 IN ('auto_approved', 'approved') THEN NOW() ELSE NULL END
      WHERE id = $3
    `, [newStatus, JSON.stringify(moderationEvent), reviewId]);

    return newStatus;
  }

  private async invalidateProductReviewCache(productId: string): Promise<void> {
    const keys = await redis.keys(`reviews:product:${productId}:*`);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
    await redis.del(`review:stats:${productId}`);
  }
}
```

### Spam Detection Engine

```typescript
// lib/reviews/spam-detector.ts
import { openai } from '@/lib/openai';
import { redis } from '@/lib/redis';

interface SpamAnalysis {
  isSpam: boolean;
  confidence: number;
  signals: SpamSignal[];
}

interface SpamSignal {
  type: string;
  score: number;
  details: string;
}

export class SpamDetector {
  private readonly spamPatterns: RegExp[] = [
    /buy\s+now\s+at/i,
    /visit\s+my\s+(website|site|blog)/i,
    /click\s+here\s+for/i,
    /free\s+money/i,
    /\b(viagra|cialis|casino|lottery)\b/i,
    /(?:https?:\/\/)?(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}/g, // URLs
    /(.)\1{4,}/i, // Repeated characters
  ];

  private readonly suspiciousPatterns: RegExp[] = [
    /best\s+product\s+ever/i,
    /highly\s+recommend/i,
    /must\s+buy/i,
    /worst\s+product/i,
    /never\s+buy/i,
    /scam/i,
    /fake/i,
  ];

  /**
   * Analyze review for spam content
   */
  async analyzeSpam(
    content: string,
    metadata: {
      userId: string;
      productId: string;
      rating: number;
      hasMedia: boolean;
      verifiedPurchase: boolean;
    }
  ): Promise<SpamAnalysis> {
    const signals: SpamSignal[] = [];

    // Pattern-based detection
    const patternSignals = this.detectPatterns(content);
    signals.push(...patternSignals);

    // User behavior analysis
    const behaviorSignals = await this.analyzeUserBehavior(
      metadata.userId,
      metadata.productId
    );
    signals.push(...behaviorSignals);

    // Content quality analysis
    const qualitySignals = this.analyzeContentQuality(content);
    signals.push(...qualitySignals);

    // Rating consistency check
    const ratingSignals = await this.checkRatingConsistency(
      metadata.userId,
      metadata.rating
    );
    signals.push(...ratingSignals);

    // AI-based analysis for borderline cases
    const totalPatternScore = signals.reduce((sum, s) => sum + s.score, 0);
    if (totalPatternScore >= 0.3 && totalPatternScore < 0.7) {
      const aiSignals = await this.aiSpamAnalysis(content);
      signals.push(...aiSignals);
    }

    // Calculate final spam score
    const spamScore = this.calculateSpamScore(signals, metadata);

    return {
      isSpam: spamScore >= 0.7,
      confidence: Math.min(spamScore * 1.2, 1),
      signals,
    };
  }

  private detectPatterns(content: string): SpamSignal[] {
    const signals: SpamSignal[] = [];

    // Check spam patterns
    for (const pattern of this.spamPatterns) {
      const matches = content.match(pattern);
      if (matches) {
        signals.push({
          type: 'spam_pattern',
          score: 0.4,
          details: `Matched spam pattern: ${pattern.source}`,
        });
      }
    }

    // Check suspicious patterns
    for (const pattern of this.suspiciousPatterns) {
      const matches = content.match(pattern);
      if (matches) {
        signals.push({
          type: 'suspicious_pattern',
          score: 0.2,
          details: `Matched suspicious pattern: ${pattern.source}`,
        });
      }
    }

    // Check for excessive caps
    const capsRatio = (content.match(/[A-Z]/g) || []).length / content.length;
    if (capsRatio > 0.5) {
      signals.push({
        type: 'excessive_caps',
        score: 0.3,
        details: `High capital letter ratio: ${capsRatio.toFixed(2)}`,
      });
    }

    // Check for excessive punctuation
    const punctRatio = (content.match(/[!?]{2,}/g) || []).length;
    if (punctRatio > 3) {
      signals.push({
        type: 'excessive_punctuation',
        score: 0.2,
        details: `Excessive punctuation: ${punctRatio} instances`,
      });
    }

    return signals;
  }

  private async analyzeUserBehavior(
    userId: string,
    productId: string
  ): Promise<SpamSignal[]> {
    const signals: SpamSignal[] = [];

    // Check review velocity
    const recentReviewCount = await this.getUserReviewVelocity(userId);
    if (recentReviewCount > 5) {
      signals.push({
        type: 'high_velocity',
        score: 0.3 * Math.min(recentReviewCount / 10, 1),
        details: `${recentReviewCount} reviews in last 24 hours`,
      });
    }

    // Check for same-category reviews
    const categoryReviewCount = await this.getCategoryReviewCount(userId, productId);
    if (categoryReviewCount > 3) {
      signals.push({
        type: 'category_focus',
        score: 0.2,
        details: `${categoryReviewCount} reviews in same category`,
      });
    }

    // Check account age
    const accountAge = await this.getAccountAge(userId);
    if (accountAge < 7) {
      signals.push({
        type: 'new_account',
        score: 0.2,
        details: `Account age: ${accountAge} days`,
      });
    }

    return signals;
  }

  private analyzeContentQuality(content: string): SpamSignal[] {
    const signals: SpamSignal[] = [];

    // Check length
    if (content.length < 50) {
      signals.push({
        type: 'too_short',
        score: 0.2,
        details: `Content length: ${content.length} characters`,
      });
    }

    // Check word diversity
    const words = content.toLowerCase().split(/\s+/);
    const uniqueWords = new Set(words);
    const diversityRatio = uniqueWords.size / words.length;
    if (diversityRatio < 0.5) {
      signals.push({
        type: 'low_diversity',
        score: 0.2,
        details: `Word diversity ratio: ${diversityRatio.toFixed(2)}`,
      });
    }

    // Check for copy-paste indicators
    const hasTemplateMarkers = /\[.*?\]|\{.*?\}|<.*?>/.test(content);
    if (hasTemplateMarkers) {
      signals.push({
        type: 'template_markers',
        score: 0.4,
        details: 'Contains template placeholder patterns',
      });
    }

    return signals;
  }

  private async checkRatingConsistency(
    userId: string,
    rating: number
  ): Promise<SpamSignal[]> {
    const signals: SpamSignal[] = [];

    // Get user's rating history
    const ratingHistory = await this.getUserRatingHistory(userId);

    if (ratingHistory.length >= 5) {
      const avgRating = ratingHistory.reduce((a, b) => a + b, 0) / ratingHistory.length;
      const allExtreme = ratingHistory.every((r) => r === 1 || r === 5);

      if (allExtreme) {
        signals.push({
          type: 'extreme_ratings',
          score: 0.3,
          details: 'User only gives extreme ratings (1 or 5)',
        });
      }

      // Check if rating matches pattern
      const stdDev = this.calculateStdDev(ratingHistory);
      if (stdDev < 0.5) {
        signals.push({
          type: 'uniform_ratings',
          score: 0.2,
          details: `Low rating variance: ${stdDev.toFixed(2)}`,
        });
      }
    }

    return signals;
  }

  private async aiSpamAnalysis(content: string): Promise<SpamSignal[]> {
    try {
      const cacheKey = `spam:ai:${this.hashContent(content)}`;
      const cached = await redis.get(cacheKey);

      if (cached) {
        return JSON.parse(cached);
      }

      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `Analyze this product review for spam indicators. Return JSON with:
              - isSpam: boolean
              - confidence: number (0-1)
              - reasons: string[]
            Be conservative - only flag clear spam.`,
          },
          {
            role: 'user',
            content,
          },
        ],
        response_format: { type: 'json_object' },
        max_tokens: 200,
      });

      const analysis = JSON.parse(response.choices[0].message.content || '{}');

      const signals: SpamSignal[] = [];
      if (analysis.isSpam && analysis.confidence > 0.7) {
        signals.push({
          type: 'ai_spam_detection',
          score: analysis.confidence * 0.5,
          details: analysis.reasons?.join('; ') || 'AI flagged as spam',
        });
      }

      await redis.setex(cacheKey, 86400, JSON.stringify(signals));

      return signals;
    } catch (error) {
      console.error('AI spam analysis failed:', error);
      return [];
    }
  }

  private calculateSpamScore(
    signals: SpamSignal[],
    metadata: { verifiedPurchase: boolean; hasMedia: boolean }
  ): number {
    let baseScore = signals.reduce((sum, s) => sum + s.score, 0);

    // Apply trust modifiers
    if (metadata.verifiedPurchase) {
      baseScore *= 0.7; // 30% reduction for verified purchases
    }

    if (metadata.hasMedia) {
      baseScore *= 0.85; // 15% reduction for reviews with media
    }

    return Math.min(baseScore, 1);
  }

  private async getUserReviewVelocity(userId: string): Promise<number> {
    const result = await db.query(`
      SELECT COUNT(*) as count
      FROM reviews
      WHERE user_id = $1
        AND created_at > NOW() - INTERVAL '24 hours'
    `, [userId]);

    return parseInt(result.rows[0].count, 10);
  }

  private async getCategoryReviewCount(
    userId: string,
    productId: string
  ): Promise<number> {
    const result = await db.query(`
      SELECT COUNT(*) as count
      FROM reviews r
      JOIN products p ON r.product_id = p.id
      WHERE r.user_id = $1
        AND p.category_id = (
          SELECT category_id FROM products WHERE id = $2
        )
        AND r.created_at > NOW() - INTERVAL '30 days'
    `, [userId, productId]);

    return parseInt(result.rows[0].count, 10);
  }

  private async getAccountAge(userId: string): Promise<number> {
    const result = await db.query(`
      SELECT EXTRACT(DAY FROM NOW() - created_at) as age_days
      FROM users
      WHERE id = $1
    `, [userId]);

    return parseFloat(result.rows[0]?.age_days || '0');
  }

  private async getUserRatingHistory(userId: string): Promise<number[]> {
    const result = await db.query(`
      SELECT rating
      FROM reviews
      WHERE user_id = $1
        AND status IN ('approved', 'auto_approved')
      ORDER BY created_at DESC
      LIMIT 20
    `, [userId]);

    return result.rows.map((row) => row.rating);
  }

  private calculateStdDev(numbers: number[]): number {
    const mean = numbers.reduce((a, b) => a + b, 0) / numbers.length;
    const squareDiffs = numbers.map((n) => Math.pow(n - mean, 2));
    return Math.sqrt(squareDiffs.reduce((a, b) => a + b, 0) / numbers.length);
  }

  private hashContent(content: string): string {
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash.toString(16);
  }
}

import { db } from '@/lib/database';
```

### Moderation Pipeline

```typescript
// lib/reviews/moderation-pipeline.ts
import { SpamDetector } from './spam-detector';
import { ProfanityFilter } from './profanity-filter';
import { SentimentAnalyzer } from './sentiment-analyzer';
import { FraudDetector } from './fraud-detector';
import { db } from '@/lib/database';

export class ModerationPipeline {
  private spamDetector: SpamDetector;
  private profanityFilter: ProfanityFilter;
  private sentimentAnalyzer: SentimentAnalyzer;
  private fraudDetector: FraudDetector;

  // Configurable thresholds
  private readonly autoApproveThreshold = 0.9;
  private readonly autoRejectThreshold = 0.8;
  private readonly flagThreshold = 0.5;

  constructor() {
    this.spamDetector = new SpamDetector();
    this.profanityFilter = new ProfanityFilter();
    this.sentimentAnalyzer = new SentimentAnalyzer();
    this.fraudDetector = new FraudDetector();
  }

  /**
   * Process a review through the moderation pipeline
   */
  async processReview(review: Review): Promise<ModerationResult> {
    const scores: ModerationScores = {
      spam: 0,
      profanity: 0,
      sentiment: 0,
      authenticity: 0,
      quality: 0,
      fraud: 0,
    };

    const reasons: ModerationReason[] = [];

    // Run all checks in parallel
    const [spamResult, profanityResult, sentimentResult, fraudResult] = await Promise.all([
      this.spamDetector.analyzeSpam(review.content, {
        userId: review.userId,
        productId: review.productId,
        rating: review.rating,
        hasMedia: review.media.length > 0,
        verifiedPurchase: review.verifiedPurchase,
      }),
      this.profanityFilter.analyze(review.title + ' ' + review.content),
      this.sentimentAnalyzer.analyze(review.content, review.rating),
      this.fraudDetector.analyze(review),
    ]);

    // Update scores
    scores.spam = spamResult.confidence;
    scores.profanity = profanityResult.severity;
    scores.sentiment = sentimentResult.consistency;
    scores.fraud = fraudResult.riskScore;
    scores.quality = this.calculateQualityScore(review);
    scores.authenticity = this.calculateAuthenticityScore(review, fraudResult);

    // Collect reasons
    if (spamResult.isSpam) {
      reasons.push({
        code: 'SPAM_DETECTED',
        message: spamResult.signals.map((s) => s.details).join('; '),
        severity: 'high',
      });
    }

    if (profanityResult.hasProfanity) {
      reasons.push({
        code: 'PROFANITY_DETECTED',
        message: `Profane content detected: ${profanityResult.matches.length} instances`,
        severity: profanityResult.severity > 0.7 ? 'high' : 'medium',
      });
    }

    if (!sentimentResult.isConsistent) {
      reasons.push({
        code: 'SENTIMENT_MISMATCH',
        message: `Review sentiment doesn't match rating`,
        severity: 'low',
      });
    }

    if (fraudResult.isFraudulent) {
      reasons.push({
        code: 'FRAUD_SUSPECTED',
        message: fraudResult.reasons.join('; '),
        severity: 'high',
      });
    }

    // Make decision
    const decision = this.makeDecision(scores, reasons, review);

    return {
      decision: decision.action,
      confidence: decision.confidence,
      reasons,
      scores,
    };
  }

  private calculateQualityScore(review: Review): number {
    let score = 0.5; // Base score

    // Length bonus
    if (review.content.length > 100) score += 0.1;
    if (review.content.length > 200) score += 0.1;

    // Structure bonus (has pros/cons)
    if (review.pros?.length) score += 0.1;
    if (review.cons?.length) score += 0.1;

    // Media bonus
    if (review.media.length > 0) score += 0.1;

    // Title quality
    if (review.title.length > 10 && review.title.length < 100) score += 0.05;

    return Math.min(score, 1);
  }

  private calculateAuthenticityScore(
    review: Review,
    fraudResult: { riskScore: number }
  ): number {
    let score = 0.5;

    // Verified purchase is major boost
    if (review.verifiedPurchase) score += 0.3;

    // Media adds authenticity
    if (review.media.length > 0) score += 0.1;

    // Fraud score is a penalty
    score -= fraudResult.riskScore * 0.3;

    return Math.max(0, Math.min(score, 1));
  }

  private makeDecision(
    scores: ModerationScores,
    reasons: ModerationReason[],
    review: Review
  ): { action: 'approve' | 'reject' | 'flag'; confidence: number } {
    // Check for auto-reject conditions
    const highSeverityReasons = reasons.filter((r) => r.severity === 'high');
    if (highSeverityReasons.length > 0) {
      const rejectConfidence = Math.max(scores.spam, scores.profanity, scores.fraud);
      if (rejectConfidence >= this.autoRejectThreshold) {
        return { action: 'reject', confidence: rejectConfidence };
      }
    }

    // Check for auto-approve conditions
    const trustScore = this.calculateTrustScore(scores, review);
    if (
      trustScore >= this.autoApproveThreshold &&
      reasons.length === 0
    ) {
      return { action: 'approve', confidence: trustScore };
    }

    // Flag for manual review
    return {
      action: 'flag',
      confidence: Math.max(scores.spam, scores.profanity, scores.fraud),
    };
  }

  private calculateTrustScore(scores: ModerationScores, review: Review): number {
    let trust = 1;

    // Penalties
    trust -= scores.spam * 0.4;
    trust -= scores.profanity * 0.3;
    trust -= scores.fraud * 0.4;
    trust -= (1 - scores.sentiment) * 0.1;

    // Bonuses
    trust += scores.quality * 0.2;
    trust += scores.authenticity * 0.2;

    // Verified purchase bonus
    if (review.verifiedPurchase) {
      trust *= 1.1;
    }

    return Math.max(0, Math.min(trust, 1));
  }
}
```

### Profanity Filter

```typescript
// lib/reviews/profanity-filter.ts
import { redis } from '@/lib/redis';

interface ProfanityResult {
  hasProfanity: boolean;
  severity: number;
  matches: ProfanityMatch[];
  cleanedContent: string;
}

interface ProfanityMatch {
  word: string;
  position: number;
  category: string;
}

export class ProfanityFilter {
  private profanityLists: Map<string, Set<string>> = new Map();
  private initialized = false;

  /**
   * Analyze text for profanity
   */
  async analyze(text: string): Promise<ProfanityResult> {
    await this.ensureInitialized();

    const lowerText = text.toLowerCase();
    const words = lowerText.split(/\s+/);
    const matches: ProfanityMatch[] = [];

    // Check against profanity lists
    for (let i = 0; i < words.length; i++) {
      const word = words[i].replace(/[^a-z]/g, '');

      for (const [category, wordSet] of this.profanityLists) {
        if (wordSet.has(word)) {
          matches.push({
            word,
            position: i,
            category,
          });
        }
      }

      // Check for leetspeak variations
      const deobfuscated = this.deobfuscate(word);
      if (deobfuscated !== word) {
        for (const [category, wordSet] of this.profanityLists) {
          if (wordSet.has(deobfuscated)) {
            matches.push({
              word,
              position: i,
              category,
            });
          }
        }
      }
    }

    // Calculate severity
    const severity = this.calculateSeverity(matches);

    // Create cleaned content
    const cleanedContent = this.censorText(text, matches);

    return {
      hasProfanity: matches.length > 0,
      severity,
      matches,
      cleanedContent,
    };
  }

  private async ensureInitialized(): Promise<void> {
    if (this.initialized) return;

    // Load profanity lists from database or cache
    const categories = ['severe', 'moderate', 'mild'];

    for (const category of categories) {
      const cacheKey = `profanity:list:${category}`;
      let words: string[];

      const cached = await redis.get(cacheKey);
      if (cached) {
        words = JSON.parse(cached);
      } else {
        words = await this.loadProfanityList(category);
        await redis.setex(cacheKey, 86400, JSON.stringify(words));
      }

      this.profanityLists.set(category, new Set(words));
    }

    this.initialized = true;
  }

  private async loadProfanityList(category: string): Promise<string[]> {
    // In production, load from database or external service
    // This is a placeholder with example categories
    const lists: Record<string, string[]> = {
      severe: [], // Explicit content
      moderate: [], // General profanity
      mild: [], // Mild language
    };

    return lists[category] || [];
  }

  private deobfuscate(word: string): string {
    const leetMap: Record<string, string> = {
      '0': 'o',
      '1': 'i',
      '3': 'e',
      '4': 'a',
      '5': 's',
      '7': 't',
      '@': 'a',
      '$': 's',
    };

    return word
      .split('')
      .map((char) => leetMap[char] || char)
      .join('');
  }

  private calculateSeverity(matches: ProfanityMatch[]): number {
    if (matches.length === 0) return 0;

    const weights: Record<string, number> = {
      severe: 1.0,
      moderate: 0.6,
      mild: 0.3,
    };

    const totalWeight = matches.reduce(
      (sum, m) => sum + (weights[m.category] || 0.5),
      0
    );

    // Normalize to 0-1 scale
    return Math.min(totalWeight / 3, 1);
  }

  private censorText(text: string, matches: ProfanityMatch[]): string {
    let result = text;
    const words = text.split(/\s+/);

    for (const match of matches) {
      const originalWord = words[match.position];
      const censored = originalWord[0] + '*'.repeat(originalWord.length - 2) + originalWord[originalWord.length - 1];
      result = result.replace(new RegExp(`\\b${originalWord}\\b`, 'gi'), censored);
    }

    return result;
  }
}
```

### Human Moderation Workflow

```typescript
// lib/reviews/moderation-workflow.ts
import { db } from '@/lib/database';
import { redis } from '@/lib/redis';
import { notifyModerator, notifyUser, notifyMerchant } from '@/lib/notifications';
import { generateId } from '@/lib/utils';

interface ModerationTask {
  id: string;
  reviewId: string;
  priority: 'high' | 'normal' | 'low';
  assignedTo?: string;
  status: 'pending' | 'in_progress' | 'completed';
  flags: string[];
  createdAt: Date;
  dueAt: Date;
}

interface ModeratorDecision {
  action: 'approve' | 'reject' | 'edit' | 'escalate';
  reason?: string;
  editedContent?: string;
  note?: string;
}

export class ModerationWorkflow {
  private readonly slaHours = {
    high: 2,
    normal: 24,
    low: 72,
  };

  /**
   * Queue a review for human moderation
   */
  async queueForModeration(
    reviewId: string,
    reasons: ModerationReason[],
    scores: ModerationScores
  ): Promise<ModerationTask> {
    const priority = this.determinePriority(reasons, scores);

    const task: ModerationTask = {
      id: generateId('task'),
      reviewId,
      priority,
      status: 'pending',
      flags: reasons.map((r) => r.code),
      createdAt: new Date(),
      dueAt: new Date(Date.now() + this.slaHours[priority] * 60 * 60 * 1000),
    };

    // Save task
    await db.query(`
      INSERT INTO moderation_tasks (
        id, review_id, priority, status, flags, created_at, due_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
    `, [
      task.id,
      task.reviewId,
      task.priority,
      task.status,
      JSON.stringify(task.flags),
      task.createdAt,
      task.dueAt,
    ]);

    // Add to priority queue
    await redis.zadd(
      'moderation:queue',
      this.getPriorityScore(priority),
      task.id
    );

    // Notify moderators if high priority
    if (priority === 'high') {
      await notifyModerator({
        type: 'high_priority_review',
        taskId: task.id,
        reviewId,
      });
    }

    return task;
  }

  /**
   * Get next task for moderator
   */
  async getNextTask(moderatorId: string): Promise<ModerationTask | null> {
    // Get highest priority unassigned task
    const taskIds = await redis.zrange('moderation:queue', 0, 0);

    if (taskIds.length === 0) {
      return null;
    }

    const taskId = taskIds[0];

    // Assign to moderator
    const result = await db.query(`
      UPDATE moderation_tasks
      SET assigned_to = $1, status = 'in_progress'
      WHERE id = $2 AND assigned_to IS NULL
      RETURNING *
    `, [moderatorId, taskId]);

    if (result.rows.length === 0) {
      // Task was assigned to someone else, try again
      return this.getNextTask(moderatorId);
    }

    // Remove from queue
    await redis.zrem('moderation:queue', taskId);

    return this.mapTaskRow(result.rows[0]);
  }

  /**
   * Process moderator decision
   */
  async processDecision(
    taskId: string,
    moderatorId: string,
    decision: ModeratorDecision
  ): Promise<void> {
    // Get task and review
    const task = await this.getTask(taskId);
    if (!task) {
      throw new Error('Task not found');
    }

    if (task.assignedTo !== moderatorId) {
      throw new Error('Task not assigned to this moderator');
    }

    const review = await this.getReview(task.reviewId);
    if (!review) {
      throw new Error('Review not found');
    }

    // Process decision
    switch (decision.action) {
      case 'approve':
        await this.approveReview(review, moderatorId, decision);
        break;
      case 'reject':
        await this.rejectReview(review, moderatorId, decision);
        break;
      case 'edit':
        await this.editReview(review, moderatorId, decision);
        break;
      case 'escalate':
        await this.escalateReview(review, moderatorId, decision);
        return; // Don't complete task
    }

    // Complete task
    await db.query(`
      UPDATE moderation_tasks
      SET status = 'completed', completed_at = NOW()
      WHERE id = $1
    `, [taskId]);

    // Update moderator stats
    await this.updateModeratorStats(moderatorId, decision.action);
  }

  private async approveReview(
    review: Review,
    moderatorId: string,
    decision: ModeratorDecision
  ): Promise<void> {
    const moderationEvent: ModerationEvent = {
      id: generateId('mod'),
      timestamp: new Date(),
      action: 'manually_approved',
      moderatorId,
      moderatorType: 'human',
      reason: decision.note,
    };

    await db.query(`
      UPDATE reviews
      SET status = 'approved',
          moderation_history = moderation_history || $1::jsonb,
          updated_at = NOW(),
          published_at = NOW()
      WHERE id = $2
    `, [JSON.stringify(moderationEvent), review.id]);

    // Notify user
    await notifyUser(review.userId, {
      type: 'review_approved',
      reviewId: review.id,
      productId: review.productId,
    });

    // Invalidate caches
    await this.invalidateCaches(review.productId);
  }

  private async rejectReview(
    review: Review,
    moderatorId: string,
    decision: ModeratorDecision
  ): Promise<void> {
    const moderationEvent: ModerationEvent = {
      id: generateId('mod'),
      timestamp: new Date(),
      action: 'manually_rejected',
      moderatorId,
      moderatorType: 'human',
      reason: decision.reason,
    };

    await db.query(`
      UPDATE reviews
      SET status = 'rejected',
          moderation_history = moderation_history || $1::jsonb,
          updated_at = NOW()
      WHERE id = $2
    `, [JSON.stringify(moderationEvent), review.id]);

    // Notify user with reason
    await notifyUser(review.userId, {
      type: 'review_rejected',
      reviewId: review.id,
      productId: review.productId,
      reason: decision.reason,
    });
  }

  private async editReview(
    review: Review,
    moderatorId: string,
    decision: ModeratorDecision
  ): Promise<void> {
    if (!decision.editedContent) {
      throw new Error('Edited content required');
    }

    const moderationEvent: ModerationEvent = {
      id: generateId('mod'),
      timestamp: new Date(),
      action: 'edited',
      moderatorId,
      moderatorType: 'human',
      reason: decision.note,
      details: { originalContent: review.content },
    };

    await db.query(`
      UPDATE reviews
      SET status = 'approved',
          content = $1,
          moderation_history = moderation_history || $2::jsonb,
          updated_at = NOW(),
          published_at = NOW()
      WHERE id = $3
    `, [decision.editedContent, JSON.stringify(moderationEvent), review.id]);

    // Notify user
    await notifyUser(review.userId, {
      type: 'review_edited',
      reviewId: review.id,
      productId: review.productId,
    });

    await this.invalidateCaches(review.productId);
  }

  private async escalateReview(
    review: Review,
    moderatorId: string,
    decision: ModeratorDecision
  ): Promise<void> {
    const moderationEvent: ModerationEvent = {
      id: generateId('mod'),
      timestamp: new Date(),
      action: 'escalated',
      moderatorId,
      moderatorType: 'human',
      reason: decision.reason,
    };

    await db.query(`
      UPDATE reviews
      SET moderation_history = moderation_history || $1::jsonb,
          updated_at = NOW()
      WHERE id = $2
    `, [JSON.stringify(moderationEvent), review.id]);

    // Reassign task with higher priority
    await this.queueForModeration(
      review.id,
      [{ code: 'ESCALATED', message: decision.reason || 'Escalated', severity: 'high' }],
      {} as ModerationScores
    );
  }

  private determinePriority(
    reasons: ModerationReason[],
    scores: ModerationScores
  ): 'high' | 'normal' | 'low' {
    // High priority if fraud or severe content
    if (scores.fraud > 0.7 || scores.profanity > 0.8) {
      return 'high';
    }

    // High priority if multiple severe reasons
    const severeCount = reasons.filter((r) => r.severity === 'high').length;
    if (severeCount >= 2) {
      return 'high';
    }

    // Low priority if only minor issues
    if (reasons.every((r) => r.severity === 'low')) {
      return 'low';
    }

    return 'normal';
  }

  private getPriorityScore(priority: 'high' | 'normal' | 'low'): number {
    const scores = { high: 0, normal: 1, low: 2 };
    return scores[priority] * 1000000 + Date.now();
  }

  private async getTask(taskId: string): Promise<ModerationTask | null> {
    const result = await db.query(
      'SELECT * FROM moderation_tasks WHERE id = $1',
      [taskId]
    );
    return result.rows[0] ? this.mapTaskRow(result.rows[0]) : null;
  }

  private async getReview(reviewId: string): Promise<Review | null> {
    const result = await db.query(
      'SELECT * FROM reviews WHERE id = $1',
      [reviewId]
    );
    return result.rows[0] || null;
  }

  private mapTaskRow(row: any): ModerationTask {
    return {
      id: row.id,
      reviewId: row.review_id,
      priority: row.priority,
      assignedTo: row.assigned_to,
      status: row.status,
      flags: row.flags,
      createdAt: row.created_at,
      dueAt: row.due_at,
    };
  }

  private async updateModeratorStats(
    moderatorId: string,
    action: string
  ): Promise<void> {
    await db.query(`
      INSERT INTO moderator_stats (moderator_id, date, ${action}_count)
      VALUES ($1, CURRENT_DATE, 1)
      ON CONFLICT (moderator_id, date)
      DO UPDATE SET ${action}_count = moderator_stats.${action}_count + 1
    `, [moderatorId]);
  }

  private async invalidateCaches(productId: string): Promise<void> {
    const keys = await redis.keys(`reviews:product:${productId}:*`);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
    await redis.del(`review:stats:${productId}`);
  }
}
```

### Merchant Response Management

```typescript
// lib/reviews/merchant-response.ts
import { db } from '@/lib/database';
import { redis } from '@/lib/redis';
import { notifyUser } from '@/lib/notifications';
import { generateId } from '@/lib/utils';

interface ResponseTemplate {
  id: string;
  merchantId: string;
  name: string;
  content: string;
  category: 'positive' | 'negative' | 'neutral' | 'custom';
}

export class MerchantResponseService {
  /**
   * Submit a merchant response to a review
   */
  async submitResponse(
    merchantId: string,
    reviewId: string,
    content: string
  ): Promise<MerchantResponse> {
    // Validate merchant owns the product
    const canRespond = await this.validateMerchantAccess(merchantId, reviewId);
    if (!canRespond) {
      throw new Error('Merchant cannot respond to this review');
    }

    // Check for existing response
    const existing = await this.getExistingResponse(reviewId);
    if (existing && existing.status === 'published') {
      throw new Error('A response already exists for this review');
    }

    // Validate content
    const validationResult = await this.validateResponseContent(content);
    if (!validationResult.valid) {
      throw new Error(validationResult.reason);
    }

    const response: MerchantResponse = {
      id: generateId('resp'),
      reviewId,
      merchantId,
      content: this.sanitizeContent(content),
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Save response
    await db.query(`
      INSERT INTO merchant_responses (
        id, review_id, merchant_id, content, status, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (review_id) DO UPDATE
      SET content = $4, status = $5, updated_at = $7
    `, [
      response.id,
      response.reviewId,
      response.merchantId,
      response.content,
      response.status,
      response.createdAt,
      response.updatedAt,
    ]);

    // Auto-approve if merchant has good standing
    const merchantStanding = await this.getMerchantStanding(merchantId);
    if (merchantStanding === 'good') {
      response.status = 'published';
      await this.publishResponse(response.id);
    }

    return response;
  }

  /**
   * Get response templates for merchant
   */
  async getTemplates(merchantId: string): Promise<ResponseTemplate[]> {
    const result = await db.query(`
      SELECT * FROM response_templates
      WHERE merchant_id = $1 OR merchant_id IS NULL
      ORDER BY category, name
    `, [merchantId]);

    return result.rows;
  }

  /**
   * Create a response template
   */
  async createTemplate(
    merchantId: string,
    template: Omit<ResponseTemplate, 'id' | 'merchantId'>
  ): Promise<ResponseTemplate> {
    const id = generateId('tmpl');

    await db.query(`
      INSERT INTO response_templates (id, merchant_id, name, content, category)
      VALUES ($1, $2, $3, $4, $5)
    `, [id, merchantId, template.name, template.content, template.category]);

    return { id, merchantId, ...template };
  }

  /**
   * Get suggested response based on review content
   */
  async getSuggestedResponse(reviewId: string): Promise<string> {
    const review = await this.getReview(reviewId);
    if (!review) {
      throw new Error('Review not found');
    }

    // Determine sentiment category
    const category = review.rating >= 4 ? 'positive' :
                    review.rating <= 2 ? 'negative' : 'neutral';

    // Get appropriate template
    const result = await db.query(`
      SELECT content FROM response_templates
      WHERE category = $1 AND merchant_id IS NULL
      ORDER BY RANDOM()
      LIMIT 1
    `, [category]);

    if (result.rows.length === 0) {
      return this.getDefaultResponse(category);
    }

    // Personalize template
    return this.personalizeTemplate(result.rows[0].content, review);
  }

  private async validateMerchantAccess(
    merchantId: string,
    reviewId: string
  ): Promise<boolean> {
    const result = await db.query(`
      SELECT r.id
      FROM reviews r
      JOIN products p ON r.product_id = p.id
      WHERE r.id = $1 AND p.merchant_id = $2
    `, [reviewId, merchantId]);

    return result.rows.length > 0;
  }

  private async getExistingResponse(
    reviewId: string
  ): Promise<MerchantResponse | null> {
    const result = await db.query(`
      SELECT * FROM merchant_responses WHERE review_id = $1
    `, [reviewId]);

    return result.rows[0] || null;
  }

  private async validateResponseContent(
    content: string
  ): Promise<{ valid: boolean; reason?: string }> {
    // Check length
    if (content.length < 10) {
      return { valid: false, reason: 'Response too short' };
    }

    if (content.length > 1000) {
      return { valid: false, reason: 'Response too long' };
    }

    // Check for prohibited content
    const prohibitedPatterns = [
      /contact\s+us\s+directly/i,
      /call\s+us\s+at/i,
      /email\s+us\s+at/i,
      /www\.|https?:\/\//i,
    ];

    for (const pattern of prohibitedPatterns) {
      if (pattern.test(content)) {
        return {
          valid: false,
          reason: 'Response contains prohibited content (contact info or links)',
        };
      }
    }

    return { valid: true };
  }

  private sanitizeContent(content: string): string {
    return content
      .replace(/<[^>]+>/g, '')
      .trim();
  }

  private async getMerchantStanding(
    merchantId: string
  ): Promise<'good' | 'review' | 'probation'> {
    const result = await db.query(`
      SELECT standing FROM merchants WHERE id = $1
    `, [merchantId]);

    return result.rows[0]?.standing || 'review';
  }

  private async publishResponse(responseId: string): Promise<void> {
    const result = await db.query(`
      UPDATE merchant_responses
      SET status = 'published', updated_at = NOW()
      WHERE id = $1
      RETURNING review_id
    `, [responseId]);

    const reviewId = result.rows[0]?.review_id;
    if (reviewId) {
      // Update review to include response
      await db.query(`
        UPDATE reviews
        SET merchant_response = (
          SELECT row_to_json(mr) FROM merchant_responses mr WHERE mr.id = $1
        ),
        updated_at = NOW()
        WHERE id = $2
      `, [responseId, reviewId]);

      // Notify reviewer
      const review = await this.getReview(reviewId);
      if (review) {
        await notifyUser(review.userId, {
          type: 'merchant_response',
          reviewId,
          productId: review.productId,
        });
      }

      // Invalidate cache
      await this.invalidateCache(review?.productId);
    }
  }

  private async getReview(reviewId: string): Promise<Review | null> {
    const result = await db.query(
      'SELECT * FROM reviews WHERE id = $1',
      [reviewId]
    );
    return result.rows[0] || null;
  }

  private getDefaultResponse(category: string): string {
    const defaults: Record<string, string> = {
      positive: 'Thank you for your wonderful review! We appreciate your support.',
      negative: 'We\'re sorry to hear about your experience. We take all feedback seriously and would like to make things right.',
      neutral: 'Thank you for taking the time to share your feedback. We value your input.',
    };

    return defaults[category] || defaults.neutral;
  }

  private personalizeTemplate(template: string, review: Review): string {
    return template
      .replace('{customer_name}', 'Valued Customer')
      .replace('{product_name}', review.productId); // Would fetch actual name
  }

  private async invalidateCache(productId?: string): Promise<void> {
    if (productId) {
      const keys = await redis.keys(`reviews:product:${productId}:*`);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    }
  }
}
```

### Review Display Component

```typescript
// app/components/reviews/ProductReviews.tsx
import { Suspense } from 'react';
import { ReviewList } from './ReviewList';
import { ReviewStats } from './ReviewStats';
import { ReviewFilters } from './ReviewFilters';
import { ReviewsSkeleton } from './ReviewsSkeleton';

interface ProductReviewsProps {
  productId: string;
  initialFilter?: ReviewFilter;
}

export function ProductReviews({
  productId,
  initialFilter,
}: ProductReviewsProps) {
  return (
    <section className="space-y-6">
      <h2 className="text-2xl font-bold">Customer Reviews</h2>

      <Suspense fallback={<div className="h-32 animate-pulse bg-gray-100" />}>
        <ReviewStats productId={productId} />
      </Suspense>

      <ReviewFilters productId={productId} initialFilter={initialFilter} />

      <Suspense fallback={<ReviewsSkeleton count={5} />}>
        <ReviewList productId={productId} filter={initialFilter} />
      </Suspense>
    </section>
  );
}

// ReviewStats component
async function ReviewStatsContent({ productId }: { productId: string }) {
  const stats = await getReviewStats(productId);

  return (
    <div className="flex items-center gap-8 p-4 bg-gray-50 rounded-lg">
      <div className="text-center">
        <div className="text-4xl font-bold">{stats.averageRating.toFixed(1)}</div>
        <div className="flex items-center justify-center">
          <StarRating rating={stats.averageRating} />
        </div>
        <div className="text-sm text-gray-600">
          {stats.totalReviews} reviews
        </div>
      </div>

      <div className="flex-1">
        {[5, 4, 3, 2, 1].map((rating) => (
          <div key={rating} className="flex items-center gap-2">
            <span className="w-4">{rating}</span>
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div
                className="bg-yellow-400 rounded-full h-2"
                style={{
                  width: `${(stats.ratingDistribution[rating] / stats.totalReviews) * 100}%`,
                }}
              />
            </div>
            <span className="w-12 text-sm text-gray-600">
              {stats.ratingDistribution[rating]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ReviewStats({ productId }: { productId: string }) {
  return <ReviewStatsContent productId={productId} />;
}
```

### Review API Routes

```typescript
// app/api/reviews/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { ReviewSubmissionService } from '@/lib/reviews/submission-service';
import { getReviewsByProduct } from '@/lib/reviews/queries';
import { auth } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const service = new ReviewSubmissionService();

    const result = await service.submitReview(session.user.id, {
      productId: body.productId,
      orderId: body.orderId,
      rating: body.rating,
      title: body.title,
      content: body.content,
      pros: body.pros,
      cons: body.cons,
      mediaIds: body.mediaIds,
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Review submission error:', error);

    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to submit review' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const productId = searchParams.get('productId');
    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID required' },
        { status: 400 }
      );
    }

    const filter: ReviewFilter = {
      productId,
      status: ['approved', 'auto_approved'],
      rating: searchParams.get('rating')
        ? [parseInt(searchParams.get('rating')!)]
        : undefined,
      verifiedOnly: searchParams.get('verified') === 'true',
      hasMedia: searchParams.get('hasMedia') === 'true',
      sortBy: (searchParams.get('sort') as ReviewFilter['sortBy']) || 'newest',
    };

    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const result = await getReviewsByProduct(filter, page, limit);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Review fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}
```

## Examples

### Complete Review Flow

```typescript
// Example: Submit and moderate a review
const service = new ReviewSubmissionService();

// User submits review
const result = await service.submitReview('user-123', {
  productId: 'prod-abc',
  orderId: 'order-xyz',
  rating: 4,
  title: 'Great product with minor issues',
  content: 'I\'ve been using this for a month now. The quality is excellent...',
  pros: ['Durable', 'Good value'],
  cons: ['Slow shipping'],
});

console.log(result);
// { reviewId: 'rev_abc123', status: 'auto_approved' }
```

### Moderation Dashboard

```typescript
// Example: Moderator workflow
const workflow = new ModerationWorkflow();

// Get next task
const task = await workflow.getNextTask('mod-001');

// Review the content and decide
await workflow.processDecision(task.id, 'mod-001', {
  action: 'approve',
  note: 'Content verified, approved for publication',
});
```

## Anti-Patterns

### What to Avoid

```typescript
// BAD: No rate limiting on review submissions
async function submitReview(userId: string, review: any) {
  // Anyone can submit unlimited reviews
  return await db.insert('reviews', review);
}

// BAD: Client-side only validation
function ReviewForm() {
  const handleSubmit = (data) => {
    if (data.rating >= 1 && data.rating <= 5) {
      // Trusting client validation only
      submitReview(data);
    }
  };
}

// BAD: No moderation pipeline
async function createReview(review: Review) {
  // Directly publishing without moderation
  review.status = 'published';
  await db.insert('reviews', review);
}

// BAD: Blocking page render for reviews
export default async function ProductPage({ params }) {
  const product = await getProduct(params.id);
  const reviews = await getAllReviews(params.id); // Blocks render
  return <div>...</div>;
}

// BAD: Storing sensitive moderation data client-side
const moderationResult = {
  fraudScore: 0.8, // Exposed to client
  userTrustLevel: 'low',
};
```

### Correct Patterns

```typescript
// GOOD: Rate limiting and validation
async function submitReview(userId: string, review: ReviewSubmission) {
  // Check rate limit
  const recentCount = await getRecentReviewCount(userId);
  if (recentCount >= 10) {
    throw new RateLimitError('Too many reviews submitted');
  }

  // Server-side validation
  await validateReview(review);

  return await service.submitReview(userId, review);
}

// GOOD: Full moderation pipeline
async function createReview(review: Review) {
  const moderationResult = await pipeline.processReview(review);

  review.status = moderationResult.decision === 'approve'
    ? 'auto_approved'
    : 'pending';

  await db.insert('reviews', review);
}

// GOOD: Non-blocking reviews with Suspense
export default async function ProductPage({ params }) {
  return (
    <div>
      <ProductDetails productId={params.id} />
      <Suspense fallback={<ReviewsSkeleton />}>
        <ProductReviews productId={params.id} />
      </Suspense>
    </div>
  );
}

// GOOD: Server-only moderation data
// Keep moderation scores server-side
const publicReview = {
  id: review.id,
  rating: review.rating,
  content: review.content,
  verifiedPurchase: review.verifiedPurchase,
  // No moderation scores exposed
};
```

## Testing

### Unit Tests

```typescript
// __tests__/reviews/spam-detector.test.ts
import { describe, it, expect } from 'vitest';
import { SpamDetector } from '@/lib/reviews/spam-detector';

describe('SpamDetector', () => {
  const detector = new SpamDetector();

  describe('analyzeSpam', () => {
    it('detects obvious spam content', async () => {
      const result = await detector.analyzeSpam(
        'Buy now at www.spam-site.com! FREE MONEY!!!',
        {
          userId: 'user-1',
          productId: 'prod-1',
          rating: 5,
          hasMedia: false,
          verifiedPurchase: false,
        }
      );

      expect(result.isSpam).toBe(true);
      expect(result.confidence).toBeGreaterThan(0.7);
    });

    it('passes legitimate reviews', async () => {
      const result = await detector.analyzeSpam(
        'I bought this product last month and it has been working great. The quality is excellent for the price.',
        {
          userId: 'user-1',
          productId: 'prod-1',
          rating: 4,
          hasMedia: true,
          verifiedPurchase: true,
        }
      );

      expect(result.isSpam).toBe(false);
    });

    it('reduces spam score for verified purchases', async () => {
      const content = 'This is the best product ever! Must buy!';

      const unverified = await detector.analyzeSpam(content, {
        userId: 'user-1',
        productId: 'prod-1',
        rating: 5,
        hasMedia: false,
        verifiedPurchase: false,
      });

      const verified = await detector.analyzeSpam(content, {
        userId: 'user-1',
        productId: 'prod-1',
        rating: 5,
        hasMedia: false,
        verifiedPurchase: true,
      });

      expect(verified.confidence).toBeLessThan(unverified.confidence);
    });
  });
});
```

### Integration Tests

```typescript
// __tests__/reviews/moderation-pipeline.integration.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { ModerationPipeline } from '@/lib/reviews/moderation-pipeline';
import { setupTestDatabase, cleanupTestDatabase } from '../helpers';

describe('ModerationPipeline Integration', () => {
  let pipeline: ModerationPipeline;

  beforeAll(async () => {
    await setupTestDatabase();
    pipeline = new ModerationPipeline();
  });

  afterAll(async () => {
    await cleanupTestDatabase();
  });

  it('auto-approves high quality verified purchase reviews', async () => {
    const review: Review = {
      id: 'test-review-1',
      productId: 'prod-1',
      userId: 'user-1',
      orderId: 'order-1',
      rating: 4,
      title: 'Solid product',
      content: 'I have been using this product for three weeks now and I am very satisfied. The build quality is excellent and it performs exactly as described.',
      pros: ['Good quality', 'Fast shipping'],
      cons: ['Price is a bit high'],
      media: [{ id: 'img-1', type: 'image', url: '/test.jpg', status: 'approved' }],
      status: 'pending',
      verifiedPurchase: true,
      helpfulVotes: 0,
      notHelpfulVotes: 0,
      moderationHistory: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await pipeline.processReview(review);

    expect(result.decision).toBe('approve');
    expect(result.confidence).toBeGreaterThan(0.8);
  });

  it('flags reviews with profanity for human review', async () => {
    const review: Review = {
      id: 'test-review-2',
      productId: 'prod-1',
      userId: 'user-2',
      rating: 1,
      title: 'Terrible',
      content: 'This product is [profanity] garbage!',
      media: [],
      status: 'pending',
      verifiedPurchase: false,
      helpfulVotes: 0,
      notHelpfulVotes: 0,
      moderationHistory: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await pipeline.processReview(review);

    expect(result.decision).toBe('flag');
    expect(result.reasons.some(r => r.code === 'PROFANITY_DETECTED')).toBe(true);
  });
});
```

### E2E Tests

```typescript
// __tests__/reviews/e2e/review-submission.test.ts
import { test, expect } from '@playwright/test';

test.describe('Review Submission', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'password');
    await page.click('button[type="submit"]');
  });

  test('user can submit a review for purchased product', async ({ page }) => {
    await page.goto('/products/test-product');
    await page.click('text=Write a Review');

    // Fill review form
    await page.click('[data-rating="4"]');
    await page.fill('[name="title"]', 'Great product!');
    await page.fill('[name="content"]', 'I really enjoyed using this product. It works exactly as described and the quality is excellent.');

    await page.click('button[type="submit"]');

    await expect(page.locator('.success-message')).toContainText('Review submitted');
  });

  test('review appears after moderation approval', async ({ page }) => {
    // Submit review
    await page.goto('/products/test-product');
    // ... submit review flow

    // Wait for moderation (or mock it)
    await page.waitForTimeout(1000);

    // Check review appears
    await page.reload();
    await expect(page.locator('.review-list')).toContainText('Great product!');
  });
});
```

## Changelog

### v1.0.0 (2025-01-18)
- Initial pattern documentation
| 1.1.0 | 2025-01-18 | Added spam detection engine |
| 1.2.0 | 2025-01-18 | Added profanity filter |
| 1.3.0 | 2025-01-18 | Added moderation workflow |
| 1.4.0 | 2025-01-18 | Added merchant response management |
| 1.5.0 | 2025-01-18 | Added comprehensive testing examples |
