# L4: Templates

> Page layouts and complete page compositions.

## Overview

Templates define the structure and layout of pages. They combine organisms, molecules, and atoms into complete page views. Templates are divided into **layouts** (structural wrappers) and **pages** (content compositions).

**Key principle**: Templates compose from organisms (L3), molecules (L2), atoms (L1), and primitives (L0). They define the page structure.

## Composition Rules

```
L4 Templates
├── composes: L0 (primitives), L1 (atoms), L2 (molecules), L3 (organisms)
└── composed by: L5, L6
```

## Categories

| Category | Description | Count |
|----------|-------------|-------|
| `layouts` | Structural page wrappers | 12 |
| `pages` | Complete page templates | 20 |

## Files (32 total)

### Layouts (12)
| ID | Name | Description |
|----|------|-------------|
| `t-root-layout` | Root Layout | Application root with providers |
| `t-marketing-layout` | Marketing Layout | Public marketing pages |
| `t-dashboard-layout` | Dashboard Layout | Authenticated dashboard |
| `t-auth-layout` | Auth Layout | Authentication pages |
| `t-admin-layout` | Admin Layout | Admin panel |
| `t-documentation-layout` | Documentation Layout | Docs site |
| `t-checkout-layout` | Checkout Layout | E-commerce checkout |
| `t-onboarding-layout` | Onboarding Layout | User onboarding |
| `t-minimal-layout` | Minimal Layout | Stripped-down layout |
| `t-email-template-layout` | Email Template Layout | Email templates |

### Pages - Marketing (2)
| ID | Name | Description |
|----|------|-------------|
| `t-landing-page` | Landing Page | Homepage template |
| `t-about-page` | About Page | About us page |

### Pages - Blog (2)
| ID | Name | Description |
|----|------|-------------|
| `t-blog-index` | Blog Index | Blog listing page |
| `t-blog-post-page` | Blog Post Page | Individual blog post |

### Pages - E-commerce (4)
| ID | Name | Description |
|----|------|-------------|
| `t-product-listing` | Product Listing | Product catalog |
| `t-product-detail` | Product Detail | Single product page |
| `t-cart-page` | Cart Page | Shopping cart |
| `t-checkout-page` | Checkout Page | Payment page |

### Pages - Dashboard (4)
| ID | Name | Description |
|----|------|-------------|
| `t-dashboard-home` | Dashboard Home | Dashboard overview |
| `t-settings-page` | Settings Page | User settings |
| `t-profile-page` | Profile Page | User profile |
| `t-notifications-page` | Notifications Page | Notifications list |

### Pages - Error (4)
| ID | Name | Description |
|----|------|-------------|
| `t-404-page` | 404 Page | Not found |
| `t-500-page` | 500 Page | Server error |
| `t-coming-soon-page` | Coming Soon Page | Pre-launch |
| `t-maintenance-page` | Maintenance Page | Maintenance mode |

### Pages - Content (6)
| ID | Name | Description |
|----|------|-------------|
| `t-help-center-page` | Help Center Page | Help documentation |
| `t-search-results-page` | Search Results Page | Search results |
| `t-gallery-page` | Gallery Page | Media gallery |
| `t-team-page` | Team Page | Team directory |
| `t-changelog-page` | Changelog Page | Version history |
| `t-invoice-page` | Invoice Page | Invoice display |

## Layout vs Page

### Layouts
- Define route groups: `(marketing)/layout.tsx`, `(dashboard)/layout.tsx`
- Persist across page navigations within the group
- Handle cross-cutting concerns: auth, providers, global state
- Include shared navigation: headers, sidebars, footers

### Pages
- Leaf nodes that render content
- Handle page-specific data fetching
- Define SEO metadata
- Use Suspense boundaries for streaming

## Composition Example

```tsx
// t-dashboard-layout composes organisms
import { Sidebar } from "@/components/organisms/sidebar";     // o-sidebar
import { Header } from "@/components/organisms/header";       // o-header

export default function DashboardLayout({ children }) {
  return (
    <div className="flex h-screen">
      <Sidebar navigation={dashboardNav} />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
```

```tsx
// t-dashboard-home composes organisms within the layout
import { StatsCards } from "@/components/organisms/stats-dashboard";  // o-stats-dashboard
import { RecentActivity } from "@/components/organisms/activity-feed"; // o-activity-feed
import { Chart } from "@/components/organisms/chart";                  // o-chart

export default function DashboardHome() {
  return (
    <>
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <StatsCards />
      <div className="grid grid-cols-2 gap-6 mt-6">
        <Chart />
        <RecentActivity />
      </div>
    </>
  );
}
```

## ID Convention

All templates use the `t-` prefix: `t-{name}`
