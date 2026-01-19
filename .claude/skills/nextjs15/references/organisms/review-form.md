---
id: o-review-form
name: Review Form
version: 2.0.0
layer: L3
category: forms
composes:
  - ../molecules/form-field.md
  - ../molecules/rating.md
description: Star rating input with review text, photo upload, and submission
tags: [review, rating, stars, feedback, form]
performance:
  impact: medium
  lcp: low
  cls: low
formula: "ReviewForm = FormField(m-form-field) + Rating(m-rating) + Button(a-button) + Textarea(a-textarea) + Input(a-input)"
dependencies:
  - react
  - react-hook-form
  - zod
  - lucide-react
accessibility:
  wcag: AA
  keyboard: true
  screen-reader: true
---

# Review Form

## Overview

A review form organism with interactive star rating, text review, optional photo uploads, and form validation. Supports editing existing reviews and displaying character counts.

## Composition Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ ReviewForm                                                   │
├─────────────────────────────────────────────────────────────┤
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Header                                                 │  │
│  │ "Write a review for {productName}"                    │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Rating (m-rating)                                      │  │
│  │ FormField (m-form-field)                              │  │
│  │  ★ ★ ★ ★ ☆   "Very Good"                             │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ FormField (m-form-field)                              │  │
│  │  ┌─────────────────────────────────────────────────┐  │  │
│  │  │ Input (a-input)                                 │  │  │
│  │  │ Review Title                                    │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ FormField (m-form-field)                              │  │
│  │  ┌─────────────────────────────────────────────────┐  │  │
│  │  │ Textarea (a-textarea)                           │  │  │
│  │  │ Your review...                                  │  │  │
│  │  │                                                 │  │  │
│  │  │                                                 │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  │  Minimum 10 characters              125/2000          │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Photo Upload                                           │  │
│  │  ┌─────┐ ┌─────┐ ┌─────┐                              │  │
│  │  │ img │ │ img │ │ [+] │  2/5 photos                  │  │
│  │  └─────┘ └─────┘ └─────┘                              │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Recommend Toggle                                       │  │
│  │  ┌─────────────┐  ┌─────────────┐                     │  │
│  │  │ 👍 Yes      │  │ 👎 No       │                     │  │
│  │  └─────────────┘  └─────────────┘                     │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                              │
│  ─────────────────────────────────────────────────────────  │
│  ┌─────────────────┐  ┌────────────────────────────────┐   │
│  │ Button(a-button)│  │ Button (a-button)              │   │
│  │ [Cancel]        │  │ [Submit Review]                │   │
│  └─────────────────┘  └────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Implementation

```tsx
// components/organisms/review-form.tsx
'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Star,
  Camera,
  X,
  Loader2,
  ThumbsUp,
  AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Types
interface ReviewFormData {
  rating: number;
  title?: string;
  content: string;
  photos?: File[];
  recommend?: boolean;
}

interface ExistingReview {
  id: string;
  rating: number;
  title?: string;
  content: string;
  photos?: string[];
  recommend?: boolean;
}

interface ReviewFormProps {
  productName?: string;
  existingReview?: ExistingReview;
  onSubmit: (data: ReviewFormData) => Promise<void>;
  onCancel?: () => void;
  minRating?: number;
  maxPhotos?: number;
  maxCharacters?: number;
  showTitle?: boolean;
  showRecommend?: boolean;
  showPhotos?: boolean;
  guidelines?: string[];
}

// Validation schema
const createReviewSchema = (minRating: number, maxCharacters: number) =>
  z.object({
    rating: z.number().min(minRating, `Please select at least ${minRating} star`),
    title: z.string().max(100, 'Title is too long').optional(),
    content: z
      .string()
      .min(10, 'Review must be at least 10 characters')
      .max(maxCharacters, `Review cannot exceed ${maxCharacters} characters`),
    recommend: z.boolean().optional(),
  });

// Rating labels
const ratingLabels: Record<number, string> = {
  1: 'Poor',
  2: 'Fair',
  3: 'Good',
  4: 'Very Good',
  5: 'Excellent',
};

// Star Rating Input
function StarRatingInput({
  value,
  onChange,
  disabled,
  error,
}: {
  value: number;
  onChange: (rating: number) => void;
  disabled?: boolean;
  error?: string;
}) {
  const [hoverRating, setHoverRating] = React.useState(0);
  const displayRating = hoverRating || value;

  return (
    <div>
      <div
        className="flex items-center gap-1"
        role="radiogroup"
        aria-label="Rating"
      >
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={disabled}
            onClick={() => onChange(star)}
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            onFocus={() => setHoverRating(star)}
            onBlur={() => setHoverRating(0)}
            className={cn(
              'p-1 transition-transform focus:outline-none focus:ring-2 focus:ring-ring rounded',
              !disabled && 'hover:scale-110',
              disabled && 'cursor-not-allowed opacity-50'
            )}
            role="radio"
            aria-checked={value === star}
            aria-label={`${star} star${star !== 1 ? 's' : ''}`}
          >
            <Star
              className={cn(
                'h-8 w-8 transition-colors',
                star <= displayRating
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-muted-foreground'
              )}
            />
          </button>
        ))}
        
        {displayRating > 0 && (
          <span className="ml-3 text-sm font-medium">
            {ratingLabels[displayRating]}
          </span>
        )}
      </div>
      
      {error && (
        <p className="mt-1 text-sm text-destructive flex items-center gap-1">
          <AlertCircle className="h-4 w-4" />
          {error}
        </p>
      )}
    </div>
  );
}

// Photo Upload
function PhotoUpload({
  photos,
  existingPhotos,
  onAdd,
  onRemove,
  onRemoveExisting,
  maxPhotos,
  disabled,
}: {
  photos: File[];
  existingPhotos?: string[];
  onAdd: (files: File[]) => void;
  onRemove: (index: number) => void;
  onRemoveExisting?: (index: number) => void;
  maxPhotos: number;
  disabled?: boolean;
}) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const totalPhotos = photos.length + (existingPhotos?.length || 0);
  const canAddMore = totalPhotos < maxPhotos;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const remaining = maxPhotos - totalPhotos;
    onAdd(files.slice(0, remaining));
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium mb-2">
        Add photos (optional)
      </label>
      
      <div className="flex flex-wrap gap-2">
        {/* Existing photos */}
        {existingPhotos?.map((url, index) => (
          <div
            key={`existing-${index}`}
            className="relative h-20 w-20 rounded-lg overflow-hidden group"
          >
            <img
              src={url}
              alt={`Review photo ${index + 1}`}
              className="h-full w-full object-cover"
            />
            {onRemoveExisting && !disabled && (
              <button
                type="button"
                onClick={() => onRemoveExisting(index)}
                className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
              >
                <X className="h-5 w-5 text-white" />
              </button>
            )}
          </div>
        ))}

        {/* New photos */}
        {photos.map((file, index) => (
          <div
            key={`new-${index}`}
            className="relative h-20 w-20 rounded-lg overflow-hidden group"
          >
            <img
              src={URL.createObjectURL(file)}
              alt={`New photo ${index + 1}`}
              className="h-full w-full object-cover"
            />
            {!disabled && (
              <button
                type="button"
                onClick={() => onRemove(index)}
                className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
              >
                <X className="h-5 w-5 text-white" />
              </button>
            )}
          </div>
        ))}

        {/* Add button */}
        {canAddMore && !disabled && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className={cn(
              'h-20 w-20 rounded-lg border-2 border-dashed',
              'flex flex-col items-center justify-center gap-1',
              'text-muted-foreground hover:text-foreground hover:border-primary',
              'transition-colors'
            )}
          >
            <Camera className="h-5 w-5" />
            <span className="text-xs">Add</span>
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled}
      />

      <p className="mt-1 text-xs text-muted-foreground">
        {totalPhotos}/{maxPhotos} photos
      </p>
    </div>
  );
}

// Recommend Toggle
function RecommendToggle({
  value,
  onChange,
  disabled,
}: {
  value?: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <div>
      <label className="block text-sm font-medium mb-2">
        Would you recommend this product?
      </label>
      <div className="flex gap-3">
        {[
          { value: true, label: 'Yes', icon: ThumbsUp },
          { value: false, label: 'No', icon: ThumbsUp },
        ].map((option) => (
          <button
            key={String(option.value)}
            type="button"
            disabled={disabled}
            onClick={() => onChange(option.value)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors',
              value === option.value
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-input hover:border-primary/50',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
          >
            <option.icon
              className={cn(
                'h-4 w-4',
                !option.value && 'rotate-180'
              )}
            />
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// Main Review Form
export function ReviewForm({
  productName,
  existingReview,
  onSubmit,
  onCancel,
  minRating = 1,
  maxPhotos = 5,
  maxCharacters = 2000,
  showTitle = true,
  showRecommend = true,
  showPhotos = true,
  guidelines,
}: ReviewFormProps) {
  const [photos, setPhotos] = React.useState<File[]>([]);
  const [existingPhotos, setExistingPhotos] = React.useState<string[]>(
    existingReview?.photos || []
  );
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const schema = React.useMemo(
    () => createReviewSchema(minRating, maxCharacters),
    [minRating, maxCharacters]
  );

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ReviewFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      rating: existingReview?.rating || 0,
      title: existingReview?.title || '',
      content: existingReview?.content || '',
      recommend: existingReview?.recommend,
    },
  });

  const rating = watch('rating');
  const content = watch('content');
  const recommend = watch('recommend');

  const handleFormSubmit = async (data: ReviewFormData) => {
    setIsSubmitting(true);
    try {
      await onSubmit({
        ...data,
        photos,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Header */}
      {productName && (
        <div>
          <h2 className="text-lg font-semibold">
            {existingReview ? 'Edit your review' : 'Write a review'}
          </h2>
          <p className="text-sm text-muted-foreground">for {productName}</p>
        </div>
      )}

      {/* Rating */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Overall rating <span className="text-destructive">*</span>
        </label>
        <StarRatingInput
          value={rating}
          onChange={(value) => setValue('rating', value)}
          disabled={isSubmitting}
          error={errors.rating?.message}
        />
      </div>

      {/* Title */}
      {showTitle && (
        <div>
          <label className="block text-sm font-medium mb-2">
            Review title
          </label>
          <input
            {...register('title')}
            placeholder="Sum up your experience in a few words"
            disabled={isSubmitting}
            className={cn(
              'w-full rounded-lg border bg-background px-3 py-2 text-sm',
              'placeholder:text-muted-foreground',
              'focus:outline-none focus:ring-2 focus:ring-ring',
              errors.title && 'border-destructive'
            )}
          />
          {errors.title && (
            <p className="mt-1 text-sm text-destructive">
              {errors.title.message}
            </p>
          )}
        </div>
      )}

      {/* Content */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Your review <span className="text-destructive">*</span>
        </label>
        <textarea
          {...register('content')}
          rows={5}
          placeholder="What did you like or dislike? What did you use this product for?"
          disabled={isSubmitting}
          className={cn(
            'w-full rounded-lg border bg-background px-3 py-2 text-sm resize-none',
            'placeholder:text-muted-foreground',
            'focus:outline-none focus:ring-2 focus:ring-ring',
            errors.content && 'border-destructive'
          )}
        />
        <div className="mt-1 flex justify-between text-xs">
          {errors.content ? (
            <p className="text-destructive">{errors.content.message}</p>
          ) : (
            <p className="text-muted-foreground">
              Minimum 10 characters
            </p>
          )}
          <p
            className={cn(
              'text-muted-foreground',
              content?.length > maxCharacters && 'text-destructive'
            )}
          >
            {content?.length || 0}/{maxCharacters}
          </p>
        </div>
      </div>

      {/* Photos */}
      {showPhotos && (
        <PhotoUpload
          photos={photos}
          existingPhotos={existingPhotos}
          onAdd={(files) => setPhotos((prev) => [...prev, ...files])}
          onRemove={(index) =>
            setPhotos((prev) => prev.filter((_, i) => i !== index))
          }
          onRemoveExisting={(index) =>
            setExistingPhotos((prev) => prev.filter((_, i) => i !== index))
          }
          maxPhotos={maxPhotos}
          disabled={isSubmitting}
        />
      )}

      {/* Recommend */}
      {showRecommend && (
        <RecommendToggle
          value={recommend}
          onChange={(value) => setValue('recommend', value)}
          disabled={isSubmitting}
        />
      )}

      {/* Guidelines */}
      {guidelines && guidelines.length > 0 && (
        <div className="rounded-lg bg-muted p-4">
          <h4 className="text-sm font-medium mb-2">Review guidelines</h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            {guidelines.map((guideline, index) => (
              <li key={index}>• {guideline}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="px-4 py-2 text-sm hover:bg-accent rounded-lg"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className={cn(
            'flex items-center gap-2 px-6 py-2 text-sm font-medium rounded-lg',
            'bg-primary text-primary-foreground hover:bg-primary/90',
            'disabled:opacity-50'
          )}
        >
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {existingReview ? 'Update review' : 'Submit review'}
        </button>
      </div>
    </form>
  );
}
```

## Usage

### Basic Usage

```tsx
import { ReviewForm } from '@/components/organisms/review-form';

export function ProductReview({ product }) {
  const handleSubmit = async (data) => {
    await api.submitReview({
      productId: product.id,
      ...data,
    });
    toast.success('Review submitted!');
  };

  return (
    <ReviewForm
      productName={product.name}
      onSubmit={handleSubmit}
      guidelines={[
        'Focus on the product and your experience',
        'Be specific about what you liked or disliked',
        'Avoid inappropriate language',
      ]}
    />
  );
}
```

### Edit Existing Review

```tsx
<ReviewForm
  productName={product.name}
  existingReview={{
    id: review.id,
    rating: review.rating,
    title: review.title,
    content: review.content,
    photos: review.photos,
    recommend: review.recommend,
  }}
  onSubmit={handleUpdate}
  onCancel={() => setEditing(false)}
/>
```

### Minimal Form

```tsx
<ReviewForm
  onSubmit={handleSubmit}
  showTitle={false}
  showPhotos={false}
  showRecommend={false}
  maxCharacters={500}
/>
```

## States

| State | Description | Visual Change |
|-------|-------------|---------------|
| Empty | Form ready for input, no rating selected | Stars gray/unfilled, form fields empty |
| Rating Hover | Mouse hovering over star rating | Stars up to hovered position turn yellow, rating label appears |
| Rating Selected | User clicked to select rating | Selected stars filled yellow, rating label shown (e.g., "Very Good") |
| Rating Error | Form submitted without rating | Error message below rating with alert icon |
| Title Focused | Review title input has focus | Input border highlighted with focus ring |
| Content Focused | Review textarea has focus | Textarea border highlighted, character count visible |
| Content Invalid | Content too short or too long | Destructive border, error message, character count in red |
| Photo Added | User added photo(s) | Photo thumbnail previews shown with remove buttons on hover |
| Photo Limit Reached | Maximum photos uploaded | Add photo button hidden, "X/Y photos" shows at limit |
| Recommend Yes | User selected "Yes" to recommend | Yes button has primary border and background tint |
| Recommend No | User selected "No" to recommend | No button has primary border, thumbs-down icon rotated |
| Submitting | Form submission in progress | Submit button shows spinner, all inputs disabled |
| Edit Mode | Editing existing review | Header shows "Edit your review", existing data pre-filled |

## Anti-patterns

### Bad: Not providing real-time character count feedback

```tsx
// Bad - No character count visible
<textarea {...register('content')} />

// Good - Show character count with limit indication
<textarea
  {...register('content')}
  className={cn(errors.content && 'border-destructive')}
/>
<div className="flex justify-between text-xs mt-1">
  <span className="text-muted-foreground">Minimum 10 characters</span>
  <span className={cn(
    'text-muted-foreground',
    content?.length > maxCharacters && 'text-destructive'
  )}>
    {content?.length || 0}/{maxCharacters}
  </span>
</div>
```

### Bad: Star rating not accessible via keyboard

```tsx
// Bad - Only click interaction
<div onClick={() => setRating(star)}>
  <Star />
</div>

// Good - Full keyboard accessibility with ARIA
<button
  type="button"
  onClick={() => onChange(star)}
  onFocus={() => setHoverRating(star)}
  onBlur={() => setHoverRating(0)}
  role="radio"
  aria-checked={value === star}
  aria-label={`${star} star${star !== 1 ? 's' : ''}`}
  className="p-1 focus:outline-none focus:ring-2 focus:ring-ring rounded"
>
  <Star className={cn(star <= displayRating && 'fill-yellow-400')} />
</button>
```

### Bad: Not cleaning up object URLs for photo previews

```tsx
// Bad - Memory leak from object URLs
{photos.map((file, index) => (
  <img src={URL.createObjectURL(file)} alt="" />
))}

// Good - Clean up object URLs when component unmounts or photos change
useEffect(() => {
  const urls = photos.map(file => URL.createObjectURL(file));
  return () => urls.forEach(url => URL.revokeObjectURL(url));
}, [photos]);

// Or use useMemo with cleanup
const photoUrls = useMemo(() => {
  return photos.map(file => URL.createObjectURL(file));
}, [photos]);
```

### Bad: Not disabling form during submission

```tsx
// Bad - User can modify form while submitting
<form onSubmit={handleSubmit}>
  <input {...register('title')} />
  <button type="submit">Submit</button>
</form>

// Good - Disable all inputs during submission
<input
  {...register('title')}
  disabled={isSubmitting}
/>
<button
  type="submit"
  disabled={isSubmitting}
>
  {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
  {isSubmitting ? 'Submitting...' : 'Submit Review'}
</button>
```

## Related Skills

- `molecules/rating` - Star rating display
- `patterns/form-validation` - Form validation
- `organisms/comments-section` - Comments

## Changelog

### 2.0.0 (2025-01-17)
- Standardized to atomic design system v2
- Updated frontmatter schema
- Added explicit composition references

### 1.0.0 (2025-01-17)

- Initial implementation
- Interactive star rating
- Photo upload with preview
- Recommend toggle
- Character count
- Form validation
