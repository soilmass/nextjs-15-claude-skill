# L6: Recipes

> Complete application implementations combining all layers.

## Overview

Recipes are comprehensive implementation guides for building complete applications. They combine skills from all layers to create production-ready solutions.

**Key principle**: Recipes compose from all layers (L0-L5) and provide end-to-end implementation guidance.

## Composition Rules

```
L6 Recipes
├── composes: L0, L1, L2, L3, L4, L5 (all layers)
└── composed by: nothing (top of hierarchy)
```

## Categories

| Category | Description | Count |
|----------|-------------|-------|
| `business` | SaaS, CRM, project management | 7 |
| `commerce` | E-commerce, marketplaces | 3 |
| `content` | Blogs, documentation, portfolios | 5 |
| `social` | Social networks, communities | 3 |
| `booking` | Appointments, events, properties | 5 |
| `tech` | AI apps, real-time, file sharing | 4 |
| `health` | Telehealth, fitness, wellness | 3 |
| `finance` | Invoicing, expenses, crowdfunding | 4 |
| `utility` | Status pages, surveys | 3 |

## Files (37 total)

### Business (7)
| ID | Name | Description |
|----|------|-------------|
| `r-saas-dashboard` | SaaS Dashboard | Multi-tenant SaaS app |
| `r-crm` | CRM | Customer relationship management |
| `r-analytics-dashboard` | Analytics Dashboard | Business analytics |
| `r-project-management` | Project Management | Task and project tracking |
| `r-helpdesk` | Helpdesk | Customer support system |
| `r-invoice-app` | Invoice App | Invoicing and billing |
| `r-subscription-billing` | Subscription Billing | Subscription management |

### Commerce (3)
| ID | Name | Description |
|----|------|-------------|
| `r-ecommerce` | E-commerce | Full e-commerce platform |
| `r-marketplace` | Marketplace | Multi-vendor marketplace |
| `r-api-marketplace` | API Marketplace | API/digital products |

### Content (5)
| ID | Name | Description |
|----|------|-------------|
| `r-blog-platform` | Blog Platform | MDX-based blogging |
| `r-documentation` | Documentation | Technical docs site |
| `r-portfolio` | Portfolio | Personal portfolio |
| `r-newsletter` | Newsletter | Email newsletter |
| `r-video-streaming` | Video Streaming | Video platform |

### Social (3)
| ID | Name | Description |
|----|------|-------------|
| `r-social-network` | Social Network | Social media platform |
| `r-meetup-clone` | Meetup Clone | Event communities |
| `r-job-board` | Job Board | Job listings |

### Booking (5)
| ID | Name | Description |
|----|------|-------------|
| `r-booking-app` | Booking App | Appointment scheduling |
| `r-event-platform` | Event Platform | Event ticketing |
| `r-restaurant-ordering` | Restaurant Ordering | Food ordering |
| `r-property-listing` | Property Listing | Real estate |
| `r-rental-management` | Rental Management | Property management |

### Tech (4)
| ID | Name | Description |
|----|------|-------------|
| `r-ai-application` | AI Application | AI/LLM app |
| `r-realtime-app` | Realtime App | WebSocket collaboration |
| `r-file-sharing` | File Sharing | File upload/sharing |
| `r-link-shortener` | Link Shortener | URL shortening |

### Health (3)
| ID | Name | Description |
|----|------|-------------|
| `r-telehealth` | Telehealth | Healthcare platform |
| `r-fitness-tracker` | Fitness Tracker | Fitness app |
| `r-meditation-app` | Meditation App | Wellness app |

### Finance (4)
| ID | Name | Description |
|----|------|-------------|
| `r-crowdfunding` | Crowdfunding | Fundraising platform |
| `r-expense-tracker` | Expense Tracker | Expense management |
| `r-invoice-app` | Invoice App | Invoice generation |
| `r-subscription-billing` | Subscription Billing | Billing management |

### Utility (3)
| ID | Name | Description |
|----|------|-------------|
| `r-status-page` | Status Page | Service status |
| `r-survey-builder` | Survey Builder | Form builder |
| `r-recipe-app` | Recipe App | Culinary app |

## Recipe Structure

Each recipe provides:

1. **Architecture** - Directory structure and route organization
2. **Composes** - Complete list of skills used from all layers
3. **Database Schema** - Prisma schema definitions
4. **Implementation** - Full code for key features
5. **Deployment Checklist** - Production readiness guide

```markdown
---
id: r-{name}
name: {Name}
version: 2.0.0
layer: L6
category: {category}
description: {description}
tags: [relevant, tags]
composes:
  - ../patterns/server-actions.md
  - ../patterns/next-auth.md
  - ../templates/dashboard-layout.md
  - ../organisms/data-table.md
complexity: advanced
estimated_time: 8-16 hours
---

# {Name}

## Overview
## Architecture
## Composes
## Implementation
## Database Schema
## Deployment Checklist
## Related Recipes
## Changelog
```

## Example: E-commerce Recipe Composition

```
r-ecommerce
├── L5 Patterns
│   ├── pt-server-actions (data mutations)
│   ├── pt-stripe-checkout (payments)
│   ├── pt-next-auth (authentication)
│   └── pt-redis-cache (caching)
├── L4 Templates
│   ├── t-marketing-layout (public pages)
│   ├── t-product-listing (catalog)
│   ├── t-product-detail (product page)
│   └── t-checkout-page (checkout)
├── L3 Organisms
│   ├── o-header (navigation)
│   ├── o-product-card (products)
│   ├── o-cart (shopping cart)
│   └── o-checkout-form (payment)
├── L2 Molecules
│   ├── m-search-input (product search)
│   ├── m-pagination (catalog pages)
│   └── m-form-field (forms)
├── L1 Atoms
│   ├── a-input-button (buttons)
│   ├── a-display-badge (labels)
│   └── a-display-image (product images)
└── L0 Primitives
    ├── p-colors (theme)
    ├── p-typography (fonts)
    └── p-spacing (layout)
```

## ID Convention

All recipes use the `r-` prefix: `r-{name}`
