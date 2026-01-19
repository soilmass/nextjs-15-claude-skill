---
id: pt-structured-data
name: Structured Data Patterns
version: 2.0.0
layer: L5
category: seo
description: JSON-LD structured data implementation for rich search results and SEO
tags: [seo, structured-data, json-ld, schema-org, rich-snippets]
composes:
  - ../molecules/accordion-item.md
  - ../molecules/breadcrumb.md
dependencies: []
formula: JSON-LD + Schema.org Types + Page Content = Rich Search Results
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

## When to Use

- Enabling rich snippets in Google search results (stars, prices, FAQs)
- Adding Organization schema for brand knowledge panel
- Implementing Article schema for blog posts and news
- Creating Product schema with reviews and pricing for e-commerce
- Building Breadcrumb, FAQ, Event, and LocalBusiness schemas

## Composition Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    STRUCTURED DATA PATTERN                       │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────┐      │
│  │              Schema.org Types                         │      │
│  │  ┌───────────┐  ┌───────────┐  ┌───────────────────┐ │      │
│  │  │Organization│  │  Article  │  │     Product       │ │      │
│  │  │  WebSite   │  │ BlogPost  │  │   LocalBusiness   │ │      │
│  │  └───────────┘  └───────────┘  └───────────────────┘ │      │
│  │  ┌───────────┐  ┌───────────┐  ┌───────────────────┐ │      │
│  │  │Breadcrumb │  │   FAQ     │  │      Event        │ │      │
│  │  │   List    │  │   Page    │  │     Recipe        │ │      │
│  │  └───────────┘  └───────────┘  └───────────────────┘ │      │
│  └──────────────────────────────────────────────────────┘      │
│         │                                                       │
│         ▼                                                       │
│  ┌──────────────────────────────────────────────────────┐      │
│  │              JSON-LD Generation                       │      │
│  │  ┌─────────────────────────────────────────────────┐ │      │
│  │  │  getArticleSchema({ title, author, date })      │ │      │
│  │  │  getProductSchema({ name, price, reviews })     │ │      │
│  │  │  getBreadcrumbSchema(items)                     │ │      │
│  │  └─────────────────────────────────────────────────┘ │      │
│  └──────────────────────────────────────────────────────┘      │
│         │                                                       │
│         ▼                                                       │
│  ┌──────────────────────────────────────────────────────┐      │
│  │              Page Integration                         │      │
│  │  ┌─────────────────────────────────────────────────┐ │      │
│  │  │  <script type="application/ld+json">            │ │      │
│  │  │    { "@context": "https://schema.org", ... }    │ │      │
│  │  │  </script>                                      │ │      │
│  │  └─────────────────────────────────────────────────┘ │      │
│  └──────────────────────────────────────────────────────┘      │
│         │                                                       │
│         ▼                                                       │
│  ┌──────────────────────────────────────────────────────┐      │
│  │              Rich Results                             │      │
│  │  ┌───────────┐  ┌───────────┐  ┌───────────────────┐ │      │
│  │  │  Stars    │  │   Price   │  │   FAQ Dropdowns   │ │      │
│  │  │  Reviews  │  │   Stock   │  │   Breadcrumbs     │ │      │
│  │  └───────────┘  └───────────┘  └───────────────────┘ │      │
│  └──────────────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────────────┘
```

# Structured Data Patterns

## Overview

Structured data helps search engines understand your content and display rich results (rich snippets) in search. This pattern covers JSON-LD implementation for common content types.

## Implementation

### JSON-LD Component

```typescript
// components/structured-data.tsx
interface StructuredDataProps {
  data: Record<string, unknown>;
}

export function StructuredData({ data }: StructuredDataProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data, null, 2),
      }}
    />
  );
}
```

### Organization Schema

```typescript
// lib/structured-data/organization.ts
export function getOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Your Company Name",
    url: process.env.NEXT_PUBLIC_APP_URL,
    logo: `${process.env.NEXT_PUBLIC_APP_URL}/logo.png`,
    description: "Your company description",
    foundingDate: "2020",
    sameAs: [
      "https://twitter.com/yourcompany",
      "https://linkedin.com/company/yourcompany",
      "https://github.com/yourcompany",
    ],
    contactPoint: [
      {
        "@type": "ContactPoint",
        telephone: "+1-555-555-5555",
        contactType: "customer service",
        email: "support@yourcompany.com",
        availableLanguage: ["English", "Spanish"],
      },
    ],
    address: {
      "@type": "PostalAddress",
      streetAddress: "123 Main St",
      addressLocality: "San Francisco",
      addressRegion: "CA",
      postalCode: "94105",
      addressCountry: "US",
    },
  };
}

// app/layout.tsx
import { StructuredData } from "@/components/structured-data";
import { getOrganizationSchema } from "@/lib/structured-data/organization";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <head>
        <StructuredData data={getOrganizationSchema()} />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

### Website Schema with Search

```typescript
// lib/structured-data/website.ts
export function getWebsiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Your Site Name",
    url: process.env.NEXT_PUBLIC_APP_URL,
    description: "Your site description",
    publisher: {
      "@type": "Organization",
      name: "Your Company Name",
    },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${process.env.NEXT_PUBLIC_APP_URL}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}
```

### Article/Blog Post Schema

```typescript
// lib/structured-data/article.ts
interface ArticleSchemaProps {
  title: string;
  description: string;
  url: string;
  imageUrl: string;
  datePublished: string;
  dateModified: string;
  author: {
    name: string;
    url?: string;
  };
  publisher?: {
    name: string;
    logo: string;
  };
}

export function getArticleSchema({
  title,
  description,
  url,
  imageUrl,
  datePublished,
  dateModified,
  author,
  publisher,
}: ArticleSchemaProps) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description,
    url,
    image: imageUrl,
    datePublished,
    dateModified,
    author: {
      "@type": "Person",
      name: author.name,
      url: author.url,
    },
    publisher: publisher
      ? {
          "@type": "Organization",
          name: publisher.name,
          logo: {
            "@type": "ImageObject",
            url: publisher.logo,
          },
        }
      : undefined,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
  };
}

// app/blog/[slug]/page.tsx
import { StructuredData } from "@/components/structured-data";
import { getArticleSchema } from "@/lib/structured-data/article";

export default async function BlogPost({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPost(slug);

  const articleSchema = getArticleSchema({
    title: post.title,
    description: post.excerpt,
    url: `${process.env.NEXT_PUBLIC_APP_URL}/blog/${post.slug}`,
    imageUrl: post.featuredImage,
    datePublished: post.publishedAt.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    author: {
      name: post.author.name,
      url: `${process.env.NEXT_PUBLIC_APP_URL}/authors/${post.author.slug}`,
    },
    publisher: {
      name: "Your Company",
      logo: `${process.env.NEXT_PUBLIC_APP_URL}/logo.png`,
    },
  });

  return (
    <>
      <StructuredData data={articleSchema} />
      <article>
        <h1>{post.title}</h1>
        {/* ... */}
      </article>
    </>
  );
}
```

### Product Schema

```typescript
// lib/structured-data/product.ts
interface ProductSchemaProps {
  name: string;
  description: string;
  url: string;
  imageUrls: string[];
  sku: string;
  brand: string;
  price: number;
  currency: string;
  availability: "InStock" | "OutOfStock" | "PreOrder";
  reviews?: {
    count: number;
    average: number;
  };
  offers?: {
    priceCurrency: string;
    price: number;
    priceValidUntil?: string;
    itemCondition?: string;
    availability: string;
    url: string;
    seller?: {
      name: string;
    };
  }[];
}

export function getProductSchema({
  name,
  description,
  url,
  imageUrls,
  sku,
  brand,
  price,
  currency,
  availability,
  reviews,
  offers,
}: ProductSchemaProps) {
  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    description,
    url,
    image: imageUrls,
    sku,
    brand: {
      "@type": "Brand",
      name: brand,
    },
    offers: offers || {
      "@type": "Offer",
      priceCurrency: currency,
      price,
      priceValidUntil: new Date(
        Date.now() + 30 * 24 * 60 * 60 * 1000
      ).toISOString().split("T")[0],
      itemCondition: "https://schema.org/NewCondition",
      availability: `https://schema.org/${availability}`,
      url,
    },
  };

  if (reviews && reviews.count > 0) {
    schema.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: reviews.average,
      reviewCount: reviews.count,
      bestRating: 5,
      worstRating: 1,
    };
  }

  return schema;
}

// app/products/[slug]/page.tsx
import { StructuredData } from "@/components/structured-data";
import { getProductSchema } from "@/lib/structured-data/product";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProduct(slug);

  const productSchema = getProductSchema({
    name: product.name,
    description: product.description,
    url: `${process.env.NEXT_PUBLIC_APP_URL}/products/${product.slug}`,
    imageUrls: product.images,
    sku: product.sku,
    brand: product.brand,
    price: product.price,
    currency: "USD",
    availability: product.stock > 0 ? "InStock" : "OutOfStock",
    reviews: product.reviewCount > 0
      ? {
          count: product.reviewCount,
          average: product.averageRating,
        }
      : undefined,
  });

  return (
    <>
      <StructuredData data={productSchema} />
      <div>
        <h1>{product.name}</h1>
        {/* ... */}
      </div>
    </>
  );
}
```

### Breadcrumb Schema

```typescript
// lib/structured-data/breadcrumb.ts
interface BreadcrumbItem {
  name: string;
  url: string;
}

export function getBreadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

// components/breadcrumbs.tsx
import Link from "next/link";
import { StructuredData } from "./structured-data";
import { getBreadcrumbSchema } from "@/lib/structured-data/breadcrumb";

interface BreadcrumbsProps {
  items: { name: string; href: string }[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  const schemaItems = items.map((item) => ({
    name: item.name,
    url: `${process.env.NEXT_PUBLIC_APP_URL}${item.href}`,
  }));

  return (
    <>
      <StructuredData data={getBreadcrumbSchema(schemaItems)} />
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm">
        {items.map((item, index) => (
          <span key={item.href} className="flex items-center gap-2">
            {index > 0 && <span className="text-muted-foreground">/</span>}
            {index === items.length - 1 ? (
              <span className="text-muted-foreground">{item.name}</span>
            ) : (
              <Link href={item.href} className="hover:underline">
                {item.name}
              </Link>
            )}
          </span>
        ))}
      </nav>
    </>
  );
}
```

### FAQ Schema

```typescript
// lib/structured-data/faq.ts
interface FAQItem {
  question: string;
  answer: string;
}

export function getFAQSchema(items: FAQItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

// components/faq.tsx
import { StructuredData } from "./structured-data";
import { getFAQSchema } from "@/lib/structured-data/faq";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface FAQProps {
  items: { question: string; answer: string }[];
}

export function FAQ({ items }: FAQProps) {
  return (
    <>
      <StructuredData data={getFAQSchema(items)} />
      <Accordion type="single" collapsible>
        {items.map((item, index) => (
          <AccordionItem key={index} value={`item-${index}`}>
            <AccordionTrigger>{item.question}</AccordionTrigger>
            <AccordionContent>{item.answer}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </>
  );
}
```

### Local Business Schema

```typescript
// lib/structured-data/local-business.ts
interface LocalBusinessSchemaProps {
  name: string;
  type: string; // e.g., "Restaurant", "Store", "Dentist"
  url: string;
  telephone: string;
  address: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  geo: {
    latitude: number;
    longitude: number;
  };
  openingHours: string[]; // e.g., ["Mo-Fr 09:00-17:00", "Sa 10:00-14:00"]
  priceRange?: string; // e.g., "$$"
  image?: string;
}

export function getLocalBusinessSchema(props: LocalBusinessSchemaProps) {
  return {
    "@context": "https://schema.org",
    "@type": props.type,
    name: props.name,
    url: props.url,
    telephone: props.telephone,
    image: props.image,
    priceRange: props.priceRange,
    address: {
      "@type": "PostalAddress",
      streetAddress: props.address.street,
      addressLocality: props.address.city,
      addressRegion: props.address.state,
      postalCode: props.address.postalCode,
      addressCountry: props.address.country,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: props.geo.latitude,
      longitude: props.geo.longitude,
    },
    openingHoursSpecification: props.openingHours.map((hours) => {
      const [days, time] = hours.split(" ");
      const [opens, closes] = time?.split("-") || ["09:00", "17:00"];
      return {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: days,
        opens,
        closes,
      };
    }),
  };
}
```

### Event Schema

```typescript
// lib/structured-data/event.ts
interface EventSchemaProps {
  name: string;
  description: string;
  url: string;
  imageUrl: string;
  startDate: string;
  endDate: string;
  location: {
    name: string;
    address: string;
  } | {
    type: "VirtualLocation";
    url: string;
  };
  offers?: {
    price: number;
    currency: string;
    url: string;
    availability: "InStock" | "SoldOut" | "PreOrder";
    validFrom: string;
  };
  performer?: {
    name: string;
    type: "Person" | "Organization";
  };
  organizer: {
    name: string;
    url: string;
  };
}

export function getEventSchema(props: EventSchemaProps) {
  return {
    "@context": "https://schema.org",
    "@type": "Event",
    name: props.name,
    description: props.description,
    url: props.url,
    image: props.imageUrl,
    startDate: props.startDate,
    endDate: props.endDate,
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "type" in props.location 
      ? "https://schema.org/OnlineEventAttendanceMode"
      : "https://schema.org/OfflineEventAttendanceMode",
    location: "type" in props.location
      ? {
          "@type": "VirtualLocation",
          url: props.location.url,
        }
      : {
          "@type": "Place",
          name: props.location.name,
          address: props.location.address,
        },
    offers: props.offers
      ? {
          "@type": "Offer",
          price: props.offers.price,
          priceCurrency: props.offers.currency,
          url: props.offers.url,
          availability: `https://schema.org/${props.offers.availability}`,
          validFrom: props.offers.validFrom,
        }
      : undefined,
    performer: props.performer
      ? {
          "@type": props.performer.type,
          name: props.performer.name,
        }
      : undefined,
    organizer: {
      "@type": "Organization",
      name: props.organizer.name,
      url: props.organizer.url,
    },
  };
}
```

## Variants

### Multiple Schemas on One Page

```typescript
// Combine multiple schemas
export function CombinedStructuredData({ schemas }: { schemas: object[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schemas),
      }}
    />
  );
}

// Usage
<CombinedStructuredData
  schemas={[
    getOrganizationSchema(),
    getWebsiteSchema(),
    getBreadcrumbSchema(breadcrumbs),
  ]}
/>
```

## Anti-patterns

1. **Missing required fields**: Schema validation failures
2. **Incorrect types**: Using wrong schema types
3. **Duplicate schemas**: Multiple conflicting schemas
4. **Outdated data**: Prices/availability not matching page
5. **Invalid URLs**: Broken links in schema

## Related Skills

- `L5/patterns/metadata-api` - Next.js metadata
- `L5/patterns/open-graph` - Open Graph tags
- `L5/patterns/sitemap` - XML sitemap
- `L5/patterns/seo` - General SEO patterns

## Changelog

### 2.0.0 (2025-01-18)
- Standardized to atomic design system v2
- Updated frontmatter schema

- 1.0.0: Initial implementation with common schema types
