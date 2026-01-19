---
id: pt-reviews
name: Review System
version: 1.0.0
layer: L5
category: features
description: Implement product/service reviews with ratings and moderation
tags: [features, reviews, ratings, moderation, next15, react19]
composes:
  - ../atoms/input-textarea.md
dependencies: []
formula: "Reviews = StarRating + ReviewForm + ReviewList + Moderation + Aggregation"
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# Review System

## Overview

A review system allows users to rate and comment on products, services, or content. This pattern covers star ratings, review submission, moderation, and aggregate calculations.

## When to Use

- E-commerce product reviews
- Service marketplace ratings
- Course/content reviews
- App store-style feedback
- Restaurant/venue reviews

## Review Schema

```prisma
// prisma/schema.prisma
model Review {
  id        String   @id @default(cuid())
  rating    Int      // 1-5
  title     String?
  content   String
  pros      String[]
  cons      String[]
  verified  Boolean  @default(false) // Verified purchase
  helpful   Int      @default(0)
  status    ReviewStatus @default(PENDING)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  userId    String
  user      User     @relation(fields: [userId], references: [id])

  productId String
  product   Product  @relation(fields: [productId], references: [id])

  images    ReviewImage[]
  votes     ReviewVote[]
  responses ReviewResponse[]

  @@unique([userId, productId])
  @@index([productId])
  @@index([status])
  @@map("reviews")
}

enum ReviewStatus {
  PENDING
  APPROVED
  REJECTED
  FLAGGED
}

model ReviewImage {
  id       String @id @default(cuid())
  url      String
  reviewId String
  review   Review @relation(fields: [reviewId], references: [id], onDelete: Cascade)

  @@map("review_images")
}

model ReviewVote {
  id       String  @id @default(cuid())
  helpful  Boolean
  userId   String
  reviewId String
  review   Review  @relation(fields: [reviewId], references: [id], onDelete: Cascade)

  @@unique([userId, reviewId])
  @@map("review_votes")
}

model ReviewResponse {
  id        String   @id @default(cuid())
  content   String
  isOfficial Boolean @default(false)
  createdAt DateTime @default(now())
  reviewId  String
  review    Review   @relation(fields: [reviewId], references: [id], onDelete: Cascade)
  userId    String
  user      User     @relation(fields: [userId], references: [id])

  @@map("review_responses")
}
```

## Review Service

```typescript
// lib/services/reviews.ts
import { prisma } from '@/lib/db';

interface CreateReviewInput {
  productId: string;
  userId: string;
  rating: number;
  title?: string;
  content: string;
  pros?: string[];
  cons?: string[];
}

export async function createReview(input: CreateReviewInput) {
  // Check if user already reviewed
  const existing = await prisma.review.findUnique({
    where: {
      userId_productId: {
        userId: input.userId,
        productId: input.productId,
      },
    },
  });

  if (existing) {
    throw new Error('You have already reviewed this product');
  }

  // Check if verified purchase
  const purchase = await prisma.orderItem.findFirst({
    where: {
      order: { userId: input.userId, status: 'COMPLETED' },
      productId: input.productId,
    },
  });

  const review = await prisma.review.create({
    data: {
      ...input,
      verified: !!purchase,
      status: 'PENDING', // Requires moderation
    },
    include: {
      user: { select: { id: true, name: true, image: true } },
    },
  });

  return review;
}

export async function getProductReviews(
  productId: string,
  options: {
    page?: number;
    limit?: number;
    sort?: 'newest' | 'oldest' | 'helpful' | 'rating-high' | 'rating-low';
    rating?: number;
    verified?: boolean;
  } = {}
) {
  const { page = 1, limit = 10, sort = 'newest', rating, verified } = options;

  const where = {
    productId,
    status: 'APPROVED' as const,
    ...(rating && { rating }),
    ...(verified !== undefined && { verified }),
  };

  const orderBy = (() => {
    switch (sort) {
      case 'oldest': return { createdAt: 'asc' as const };
      case 'helpful': return { helpful: 'desc' as const };
      case 'rating-high': return { rating: 'desc' as const };
      case 'rating-low': return { rating: 'asc' as const };
      default: return { createdAt: 'desc' as const };
    }
  })();

  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
      include: {
        user: { select: { id: true, name: true, image: true } },
        images: true,
        responses: {
          include: { user: { select: { name: true } } },
        },
      },
    }),
    prisma.review.count({ where }),
  ]);

  return { reviews, total, page, totalPages: Math.ceil(total / limit) };
}

export async function getReviewStats(productId: string) {
  const reviews = await prisma.review.findMany({
    where: { productId, status: 'APPROVED' },
    select: { rating: true },
  });

  const total = reviews.length;
  const distribution = [1, 2, 3, 4, 5].map(
    (rating) => reviews.filter((r) => r.rating === rating).length
  );
  const average =
    total > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / total : 0;

  return {
    average: Math.round(average * 10) / 10,
    total,
    distribution,
  };
}

export async function voteReview(
  reviewId: string,
  userId: string,
  helpful: boolean
) {
  const existing = await prisma.reviewVote.findUnique({
    where: { userId_reviewId: { userId, reviewId } },
  });

  if (existing) {
    if (existing.helpful === helpful) {
      // Remove vote
      await prisma.reviewVote.delete({ where: { id: existing.id } });
      await prisma.review.update({
        where: { id: reviewId },
        data: { helpful: { decrement: helpful ? 1 : 0 } },
      });
    } else {
      // Change vote
      await prisma.reviewVote.update({
        where: { id: existing.id },
        data: { helpful },
      });
      await prisma.review.update({
        where: { id: reviewId },
        data: { helpful: { increment: helpful ? 2 : -2 } },
      });
    }
  } else {
    // New vote
    await prisma.reviewVote.create({
      data: { reviewId, userId, helpful },
    });
    await prisma.review.update({
      where: { id: reviewId },
      data: { helpful: { increment: helpful ? 1 : 0 } },
    });
  }
}
```

## Star Rating Component

```typescript
// components/star-rating.tsx
'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  value?: number;
  onChange?: (rating: number) => void;
  readonly?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-6 w-6',
};

export function StarRating({
  value = 0,
  onChange,
  readonly = false,
  size = 'md',
}: StarRatingProps) {
  const [hoverValue, setHoverValue] = useState(0);

  const displayValue = hoverValue || value;

  return (
    <div className="flex gap-1" onMouseLeave={() => setHoverValue(0)}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          className={cn(
            'transition-colors',
            readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'
          )}
          onMouseEnter={() => !readonly && setHoverValue(star)}
          onClick={() => onChange?.(star)}
        >
          <Star
            className={cn(
              sizeClasses[size],
              star <= displayValue
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            )}
          />
        </button>
      ))}
    </div>
  );
}
```

## Review Form

```typescript
// components/review-form.tsx
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { StarRating } from './star-rating';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { submitReview } from '@/app/products/[id]/reviews/actions';

const reviewSchema = z.object({
  rating: z.number().min(1).max(5),
  title: z.string().max(100).optional(),
  content: z.string().min(10).max(2000),
  pros: z.array(z.string()).default([]),
  cons: z.array(z.string()).default([]),
});

type ReviewFormData = z.infer<typeof reviewSchema>;

interface ReviewFormProps {
  productId: string;
  onSuccess?: () => void;
}

export function ReviewForm({ productId, onSuccess }: ReviewFormProps) {
  const [rating, setRating] = useState(0);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
    defaultValues: { rating: 0, pros: [], cons: [] },
  });

  const onSubmit = async (data: ReviewFormData) => {
    try {
      await submitReview(productId, { ...data, rating });
      onSuccess?.();
    } catch (error) {
      console.error('Failed to submit review:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label>Rating</Label>
        <StarRating
          value={rating}
          onChange={(v) => {
            setRating(v);
            setValue('rating', v);
          }}
          size="lg"
        />
        {errors.rating && (
          <p className="text-sm text-destructive">Please select a rating</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="title">Review Title (optional)</Label>
        <Input id="title" {...register('title')} placeholder="Summarize your experience" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="content">Your Review</Label>
        <Textarea
          id="content"
          {...register('content')}
          placeholder="Share your experience..."
          rows={5}
        />
        {errors.content && (
          <p className="text-sm text-destructive">{errors.content.message}</p>
        )}
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Submitting...' : 'Submit Review'}
      </Button>
    </form>
  );
}
```

## Review Summary

```typescript
// components/review-summary.tsx
import { StarRating } from './star-rating';
import { Progress } from '@/components/ui/progress';

interface ReviewSummaryProps {
  stats: {
    average: number;
    total: number;
    distribution: number[];
  };
}

export function ReviewSummary({ stats }: ReviewSummaryProps) {
  return (
    <div className="flex gap-8">
      <div className="text-center">
        <div className="text-5xl font-bold">{stats.average}</div>
        <StarRating value={Math.round(stats.average)} readonly />
        <p className="text-sm text-muted-foreground mt-1">
          {stats.total} reviews
        </p>
      </div>

      <div className="flex-1 space-y-2">
        {[5, 4, 3, 2, 1].map((rating) => {
          const count = stats.distribution[rating - 1];
          const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0;

          return (
            <div key={rating} className="flex items-center gap-2">
              <span className="w-8 text-sm">{rating} star</span>
              <Progress value={percentage} className="flex-1" />
              <span className="w-8 text-sm text-muted-foreground">{count}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

## Anti-patterns

### Don't Allow Self-Reviews

```typescript
// BAD - No ownership check
await prisma.review.create({ data: { productId, userId, rating } });

// GOOD - Prevent reviewing own products
const product = await prisma.product.findUnique({ where: { id: productId } });
if (product.sellerId === userId) {
  throw new Error('Cannot review your own product');
}
```

## Related Skills

- [form-validation](./form-validation.md)
- [moderation](./moderation.md)

---

## Changelog

### 1.0.0 (2025-01-18)
- Initial implementation
- Star ratings
- Review form and list
- Voting system
