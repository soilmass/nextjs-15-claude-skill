# Next.js 15 Page Templates & Layouts Research

> Comprehensive analysis of essential templates for top-tier Next.js 15 sites
> Focus: Organism composition, data requirements, SEO, performance, and responsive design

---

## Table of Contents

1. [Layouts (6)](#layouts)
   - [Root Layout](#1-root-layout)
   - [Marketing Layout](#2-marketing-layout)
   - [Dashboard Layout](#3-dashboard-layout)
   - [Auth Layout](#4-auth-layout)
   - [Documentation Layout](#5-documentation-layout)
   - [Checkout Layout](#6-checkout-layout)
2. [Pages (11)](#pages)
   - [Landing Page](#7-landing-page)
   - [About Page](#8-about-page)
   - [Blog Index](#9-blog-index)
   - [Blog Post](#10-blog-post)
   - [Product Listing](#11-product-listing)
   - [Product Detail](#12-product-detail)
   - [Cart Page](#13-cart-page)
   - [Checkout Page](#14-checkout-page)
   - [Dashboard Home](#15-dashboard-home)
   - [Settings Page](#16-settings-page)
   - [404 Page](#17-404-page)

---

## Layouts

### 1. Root Layout

**File:** `app/layout.tsx`

#### Structure (Organisms)

```
RootLayout
├── html (lang attribute for i18n)
│   └── body
│       ├── ThemeProvider (dark/light mode)
│       ├── FontProvider (Google Fonts / local fonts)
│       ├── AnalyticsProvider (Google Analytics, Vercel Analytics)
│       ├── AuthProvider (session management)
│       ├── ToastProvider (global notifications)
│       ├── {children} (page content)
│       └── TailwindIndicator (dev only)
```

#### Data Requirements

| Data | Source | Caching Strategy |
|------|--------|------------------|
| Theme preference | cookies() | Per-request |
| User session | cookies()/headers() | Per-request |
| Site config | Static import | Build-time |
| Font files | next/font | Build-time + CDN |

#### SEO Considerations

```tsx
// Static metadata object
export const metadata: Metadata = {
  metadataBase: new URL('https://example.com'),
  title: {
    default: 'Site Name',
    template: '%s | Site Name', // Child pages inherit
  },
  description: 'Default description',
  openGraph: {
    type: 'website',
    siteName: 'Site Name',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    creator: '@handle',
  },
  robots: {
    index: true,
    follow: true,
  },
}

// Viewport configuration (separate export in Next.js 15)
export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
  ],
  width: 'device-width',
  initialScale: 1,
}
```

#### Performance

- **Rendering:** Static shell (always prerendered)
- **Streaming:** Enable via `loading.tsx` for children
- **Fonts:** Use `next/font` with `display: 'swap'`
- **Providers:** Keep minimal, use React.lazy for heavy providers

```tsx
// Optimal font loading
import { Inter, JetBrains_Mono } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
})

const mono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-mono',
})
```

#### Responsive Considerations

- Set viewport meta correctly
- Use CSS variables for consistent spacing
- Provider components should be render-agnostic

#### Best Examples

- **Vercel.com** - Minimal root layout, theme switching
- **Linear.app** - Smooth provider composition
- **shadcn/ui** - Reference implementation

---

### 2. Marketing Layout

**File:** `app/(marketing)/layout.tsx`

#### Structure (Organisms)

```
MarketingLayout
├── AnnouncementBanner (dismissible, optional)
├── Header/Navbar
│   ├── Logo
│   ├── NavigationMenu (desktop mega-menu)
│   ├── MobileNav (sheet/drawer on mobile)
│   ├── SearchTrigger
│   ├── ThemeToggle
│   └── CTAButton
├── main
│   └── {children}
└── Footer
    ├── FooterNavigation (column groups)
    ├── SocialLinks
    ├── NewsletterForm
    ├── LegalLinks (privacy, terms)
    └── Copyright
```

#### Data Requirements

| Data | Source | Caching Strategy |
|------|--------|------------------|
| Navigation items | CMS or static | `use cache` with `cacheLife('days')` |
| Announcement | CMS | `use cache` with `cacheLife('hours')` |
| Footer links | Static config | Build-time |
| Social links | Static config | Build-time |

#### SEO Considerations

- Layout doesn't define metadata (pages do)
- Ensure header uses semantic `<header>` tag
- Footer uses semantic `<footer>` tag
- Navigation uses `<nav>` with proper aria labels

#### Performance

- **Rendering:** Static (no dynamic data in layout)
- **Streaming:** Header/Footer render in static shell
- **Navigation:** Use `<Link>` for client-side transitions
- **Images:** Logo should use `priority` prop

```tsx
// Optimal marketing layout structure
export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <AnnouncementBanner />
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}
```

#### Responsive Considerations

- **Mobile:** Hamburger menu, collapsible navigation
- **Tablet:** Simplified nav, may keep some desktop elements
- **Desktop:** Full mega-menu, all CTAs visible
- **Sticky header:** Consider `position: sticky` with backdrop blur

#### Best Examples

- **Stripe.com** - Mega-menu navigation, smooth animations
- **Vercel.com** - Clean, minimal, excellent mobile nav
- **Linear.app** - Beautiful transitions, announcement bar

---

### 3. Dashboard Layout

**File:** `app/(dashboard)/layout.tsx`

#### Structure (Organisms)

```
DashboardLayout
├── SidebarProvider (state management)
│   ├── Sidebar
│   │   ├── SidebarHeader
│   │   │   ├── Logo/TeamSwitcher
│   │   │   └── SearchCommand
│   │   ├── SidebarContent (scrollable)
│   │   │   ├── SidebarGroup (main nav)
│   │   │   ├── SidebarGroup (secondary nav)
│   │   │   └── SidebarGroup (projects/items)
│   │   └── SidebarFooter
│   │       └── UserMenu
│   └── SidebarInset
│       ├── DashboardHeader
│       │   ├── SidebarTrigger
│       │   ├── Breadcrumb
│       │   ├── SearchBar
│       │   ├── Notifications
│       │   └── UserDropdown
│       └── main
│           └── {children}
```

#### Data Requirements

| Data | Source | Caching Strategy |
|------|--------|------------------|
| User session | cookies() | Per-request (Suspense) |
| Sidebar state | Cookie: `sidebar_state` | Cookie persistence |
| Navigation items | User permissions | Per-request + cache |
| Team/Workspace | DB query | `use cache` per user |
| Notification count | Real-time/API | Client-side polling |

```tsx
// Sidebar state persistence
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const defaultOpen = cookieStore.get('sidebar_state')?.value === 'true'

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <AppSidebar />
      <SidebarInset>
        <DashboardHeader />
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  )
}
```

#### SEO Considerations

- Dashboard pages typically use `robots: { index: false }` (private)
- Still provide meaningful titles for browser tabs
- No need for OG images

#### Performance

- **Rendering:** Dynamic (requires authentication)
- **Streaming:** Wrap user-dependent content in Suspense
- **Sidebar:** Persist collapse state in cookie
- **Navigation:** Skeleton loaders for menu items

```tsx
// Streaming pattern for user data
<Suspense fallback={<SidebarSkeleton />}>
  <NavigationItems userId={session.userId} />
</Suspense>
```

#### Responsive Considerations

- **Mobile:** Sidebar becomes off-canvas drawer (Sheet component)
- **Tablet:** Collapsed icon-only sidebar
- **Desktop:** Full sidebar with text labels
- **Breakpoint:** Use `collapsible="icon"` variant at md breakpoint

```tsx
// shadcn/ui sidebar responsive pattern
<Sidebar
  collapsible="icon"
  className="group-has-data-[collapsible=icon]/sidebar-wrapper:w-[--sidebar-width-icon]"
/>
```

#### Best Examples

- **shadcn/ui dashboard blocks** - Reference implementation
- **Linear.app** - Excellent keyboard navigation
- **Vercel Dashboard** - Clean, functional
- **Notion** - Powerful sidebar patterns

---

### 4. Auth Layout

**File:** `app/(auth)/layout.tsx`

#### Structure (Organisms)

```
AuthLayout
├── div (centered container)
│   ├── Logo (links to home)
│   ├── Card (main content area)
│   │   ├── CardHeader
│   │   │   ├── CardTitle
│   │   │   └── CardDescription
│   │   ├── CardContent
│   │   │   └── {children} (form)
│   │   └── CardFooter
│   │       └── AlternativeAction (switch between login/register)
│   └── LegalLinks (optional)
└── BackgroundDecoration (optional pattern/gradient)
```

#### Data Requirements

| Data | Source | Caching Strategy |
|------|--------|------------------|
| OAuth providers | Static config | Build-time |
| CSRF token | Server-generated | Per-request |
| Redirect URL | searchParams | Per-request |
| Error messages | searchParams | Per-request |

#### SEO Considerations

```tsx
export const metadata: Metadata = {
  title: 'Sign In',
  description: 'Sign in to your account',
  robots: { index: false, follow: false }, // Don't index auth pages
}
```

#### Performance

- **Rendering:** Static shell + dynamic form state
- **Forms:** Use Server Actions for submission
- **OAuth:** Prefetch OAuth provider endpoints
- **Images:** Logo should be optimized SVG

```tsx
// Optimal auth layout
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <Link href="/" className="flex items-center gap-2 self-center font-medium">
          <Logo className="h-6 w-6" />
          <span>Company Name</span>
        </Link>
        {children}
      </div>
    </div>
  )
}
```

#### Responsive Considerations

- **Mobile:** Full-width card, minimal padding
- **Desktop:** Centered card, optional split-screen with image
- **Form inputs:** Touch-friendly sizing (min 44px)
- **Keyboard:** Proper tab order, autofocus on first field

#### Best Examples

- **shadcn/ui login blocks** - Multiple variants
- **Clerk** - Polished OAuth flows
- **Supabase Auth UI** - Clean, customizable
- **Linear** - Beautiful split-screen design

---

### 5. Documentation Layout

**File:** `app/(docs)/layout.tsx`

#### Structure (Organisms)

```
DocsLayout
├── DocsHeader
│   ├── Logo
│   ├── VersionSelector
│   ├── SearchCommand (cmd+k)
│   ├── NavigationLinks
│   ├── GitHubLink
│   └── ThemeToggle
├── div (content area)
│   ├── DocsSidebar (left, sticky)
│   │   ├── SidebarNav
│   │   │   └── SidebarNavItems (collapsible groups)
│   │   └── SidebarFooter
│   ├── main (article content)
│   │   ├── Breadcrumb
│   │   ├── article
│   │   │   └── {children} (MDX content)
│   │   ├── PrevNextLinks
│   │   └── EditOnGitHub
│   └── TableOfContents (right, sticky)
│       ├── OnThisPage heading
│       └── TOCLinks (auto-generated)
└── DocsFooter (optional)
```

#### Data Requirements

| Data | Source | Caching Strategy |
|------|--------|------------------|
| Sidebar navigation | File system / CMS | Build-time (static) |
| Page content | MDX files | Build-time (generateStaticParams) |
| Table of contents | Extracted from MDX | Build-time |
| Search index | Generated at build | Static JSON |
| Version info | Package.json / CMS | Build-time |

```tsx
// Documentation with static generation
export async function generateStaticParams() {
  const docs = await getAllDocs()
  return docs.map((doc) => ({ slug: doc.slug.split('/') }))
}

export async function generateMetadata({ params }): Promise<Metadata> {
  const { slug } = await params
  const doc = await getDocBySlug(slug.join('/'))
  
  return {
    title: doc.title,
    description: doc.description,
    openGraph: {
      type: 'article',
      title: doc.title,
      description: doc.description,
    },
  }
}
```

#### SEO Considerations

- **Structured data:** Use Article or TechArticle schema
- **Canonical URLs:** Important for versioned docs
- **Sitemap:** Auto-generate from file structure
- **Meta descriptions:** Extract from content or frontmatter

```tsx
// JSON-LD for documentation
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'TechArticle',
  headline: doc.title,
  description: doc.description,
  author: { '@type': 'Organization', name: 'Company' },
  dateModified: doc.lastUpdated,
}
```

#### Performance

- **Rendering:** 100% Static (ISR for updates)
- **Search:** Client-side with prebuilt index (Algolia, Pagefind, Flexsearch)
- **TOC:** Extract headings at build time
- **MDX:** Compile at build time, not runtime

```tsx
// Optimal docs layout with ISR
export const revalidate = 3600 // Revalidate every hour

// Or with Cache Components
export default async function DocsLayout({ children }) {
  'use cache'
  cacheLife('hours')
  
  return (
    <div className="flex">
      <DocsSidebar />
      <main>{children}</main>
      <TableOfContents />
    </div>
  )
}
```

#### Responsive Considerations

- **Mobile:** Hide sidebars, show via drawer/sheet
- **Tablet:** Show left sidebar, hide TOC
- **Desktop:** Three-column layout
- **Reading width:** Limit prose to ~65ch for readability

```tsx
// Responsive docs layout
<div className="container flex-1 items-start md:grid md:grid-cols-[220px_minmax(0,1fr)] md:gap-6 lg:grid-cols-[240px_minmax(0,1fr)_200px] lg:gap-10">
  <aside className="fixed top-14 z-30 -ml-2 hidden h-[calc(100vh-3.5rem)] w-full shrink-0 md:sticky md:block">
    <DocsSidebar />
  </aside>
  <main className="relative py-6 lg:gap-10 lg:py-8 xl:grid xl:grid-cols-[1fr_200px]">
    <article className="prose prose-neutral dark:prose-invert max-w-none">
      {children}
    </article>
    <TableOfContents className="hidden xl:block" />
  </main>
</div>
```

#### Best Examples

- **Next.js Docs** - Reference implementation
- **Nextra** - MDX-powered, excellent DX
- **Stripe Docs** - Beautiful, functional
- **Tailwind CSS** - Excellent search, clean design

---

### 6. Checkout Layout

**File:** `app/(checkout)/layout.tsx`

#### Structure (Organisms)

```
CheckoutLayout
├── CheckoutHeader (minimal)
│   ├── Logo (links back to store)
│   ├── ProgressSteps (visual indicator)
│   └── SecureBadge (trust signal)
├── main
│   ├── div (form column - 60%)
│   │   └── {children}
│   └── OrderSummary (sticky sidebar - 40%)
│       ├── CartItems (collapsible on mobile)
│       ├── DiscountCodeInput
│       ├── Subtotal
│       ├── ShippingCost
│       ├── TaxAmount
│       └── TotalAmount
└── CheckoutFooter (minimal)
    ├── SecurePaymentBadges
    └── SupportLink
```

#### Data Requirements

| Data | Source | Caching Strategy |
|------|--------|------------------|
| Cart items | Session/cookies | Per-request (always fresh) |
| User addresses | Database | Per-request + cache per user |
| Shipping rates | API (carrier) | Short cache (minutes) |
| Tax calculation | API (tax service) | Per-request |
| Payment methods | Stripe/payment provider | Static config |

```tsx
// Checkout data loading pattern
export default async function CheckoutLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      <CheckoutHeader />
      <div className="flex-1 container grid lg:grid-cols-[1fr_400px] gap-8 py-8">
        <div>{children}</div>
        <Suspense fallback={<OrderSummarySkeleton />}>
          <OrderSummary />
        </Suspense>
      </div>
      <CheckoutFooter />
    </div>
  )
}
```

#### SEO Considerations

```tsx
export const metadata: Metadata = {
  title: 'Checkout',
  robots: { index: false, follow: false }, // Never index checkout
}
```

#### Performance

- **Rendering:** Dynamic (cart data required)
- **Streaming:** Stream order summary independently
- **Forms:** Progressive enhancement with Server Actions
- **Payment:** Lazy load payment form SDKs

```tsx
// Lazy load Stripe Elements
const StripeElements = dynamic(
  () => import('@/components/stripe-elements'),
  { 
    loading: () => <PaymentFormSkeleton />,
    ssr: false 
  }
)
```

#### Responsive Considerations

- **Mobile:** Single column, order summary as collapsible accordion at top
- **Desktop:** Two-column, sticky order summary
- **Form inputs:** Large touch targets, mobile-optimized keyboards
- **Progress:** Horizontal steps on desktop, vertical/compact on mobile

#### Best Examples

- **Shopify Checkout** - Industry standard
- **Stripe Checkout** - Clean, conversion-optimized
- **Apple Store** - Premium feel, clear progression
- **Amazon** - Efficient, well-tested patterns

---

## Pages

### 7. Landing Page

**File:** `app/(marketing)/page.tsx`

#### Structure (Organisms)

```
LandingPage
├── HeroSection
│   ├── AnnouncementPill (optional "New" badge)
│   ├── Headline (H1)
│   ├── Subheadline (supporting text)
│   ├── CTAButtons (primary + secondary)
│   ├── SocialProof (logos, ratings)
│   └── HeroVisual (image, video, or illustration)
├── LogoCloud (trusted by section)
├── FeaturesSection
│   ├── SectionHeader
│   └── FeatureGrid / FeatureBento
│       └── FeatureCard (icon, title, description)
├── ProductShowcase (visual demo)
│   ├── TabsNavigation
│   └── DemoContent (screenshots, videos)
├── TestimonialsSection
│   ├── SectionHeader
│   └── TestimonialGrid / Carousel
│       └── TestimonialCard (quote, author, company)
├── PricingSection (optional)
│   ├── SectionHeader
│   ├── PricingToggle (monthly/annual)
│   └── PricingCards
├── FAQSection
│   ├── SectionHeader
│   └── AccordionItems
├── CTASection (final conversion push)
│   ├── Headline
│   ├── Description
│   └── CTAButtons
└── (Footer from layout)
```

#### Data Requirements

| Data | Source | Caching Strategy |
|------|--------|------------------|
| Hero content | CMS / static | `use cache` with `cacheLife('days')` |
| Customer logos | CMS / static | Build-time |
| Testimonials | CMS / database | `use cache` with `cacheLife('hours')` |
| Pricing | Database / config | `use cache` + revalidateTag |
| FAQ | CMS / static | Build-time |

#### SEO Considerations

```tsx
export const metadata: Metadata = {
  title: 'Product Name - Tagline that converts',
  description: 'Compelling meta description with keywords (150-160 chars)',
  keywords: ['keyword1', 'keyword2', 'keyword3'],
  openGraph: {
    title: 'Product Name - Tagline',
    description: 'Social-optimized description',
    images: [{ url: '/og/landing.png', width: 1200, height: 630 }],
  },
  alternates: {
    canonical: 'https://example.com',
  },
}

// JSON-LD Organization schema
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Company Name',
  url: 'https://example.com',
  logo: 'https://example.com/logo.png',
  sameAs: ['https://twitter.com/company', 'https://linkedin.com/company/name'],
}
```

#### Performance

- **Rendering:** Static (100% cacheable)
- **Images:** Use `priority` for hero, lazy-load below fold
- **Videos:** Lazy load, use poster images
- **Animations:** Use CSS or intersection-observer

```tsx
// Optimal landing page rendering
export default function LandingPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HeroSection />
      <Suspense fallback={<LogoCloudSkeleton />}>
        <LogoCloud />
      </Suspense>
      <FeaturesSection />
      {/* Continue with other sections */}
    </>
  )
}
```

#### Responsive Considerations

- **Hero:** Stack layout on mobile, side-by-side on desktop
- **Features:** 1 column mobile, 2-3 columns tablet/desktop
- **Testimonials:** Carousel on mobile, grid on desktop
- **CTAs:** Full-width buttons on mobile

#### Best Examples

- **Linear.app** - Beautiful animations, clear value prop
- **Vercel.com** - Clean, developer-focused
- **Stripe.com** - Feature-rich, excellent copywriting
- **Framer.com** - Innovative layouts, smooth animations

---

### 8. About Page

**File:** `app/(marketing)/about/page.tsx`

#### Structure (Organisms)

```
AboutPage
├── AboutHero
│   ├── PageTitle (H1: "About Us")
│   ├── Subtitle (mission statement)
│   └── HeroImage (team photo or illustration)
├── StorySection
│   ├── SectionHeader ("Our Story")
│   ├── Timeline / Milestones
│   └── FounderQuote
├── MissionValuesSection
│   ├── MissionStatement
│   └── ValuesGrid
│       └── ValueCard (icon, title, description)
├── TeamSection
│   ├── SectionHeader ("Meet the Team")
│   └── TeamGrid
│       └── TeamMemberCard (photo, name, role, social links)
├── CultureSection (optional)
│   ├── CulturePhotos (gallery)
│   └── Perks / Benefits
├── InvestorsSection (optional)
│   └── InvestorLogos
├── LocationsSection (optional)
│   ├── OfficeCards
│   └── MapEmbed
└── JoinCTASection
    ├── "Join Us" Headline
    └── CareersButton
```

#### Data Requirements

| Data | Source | Caching Strategy |
|------|--------|------------------|
| Team members | CMS / database | `use cache` with `cacheLife('days')` |
| Company values | CMS / static | Build-time |
| Timeline events | CMS / static | Build-time |
| Office locations | Static config | Build-time |
| Open positions count | Careers API | `use cache` with `cacheLife('hours')` |

#### SEO Considerations

```tsx
export const metadata: Metadata = {
  title: 'About Us - Company Name',
  description: 'Learn about Company Name, our mission, values, and the team behind the product.',
  openGraph: {
    title: 'About Company Name',
    description: 'Our mission is to...',
    images: [{ url: '/og/about.png' }],
  },
}

// JSON-LD for About page
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'AboutPage',
  mainEntity: {
    '@type': 'Organization',
    name: 'Company Name',
    foundingDate: '2020',
    founders: [
      { '@type': 'Person', name: 'Founder Name' }
    ],
    numberOfEmployees: { '@type': 'QuantitativeValue', value: 50 },
  },
}
```

#### Performance

- **Rendering:** Static
- **Images:** Optimize team photos (WebP, multiple sizes)
- **Maps:** Lazy load map embeds

#### Responsive Considerations

- **Team grid:** 1 column mobile, 2 tablet, 3-4 desktop
- **Timeline:** Vertical on mobile, horizontal on desktop
- **Images:** Responsive image sizes with `sizes` prop

#### Best Examples

- **Stripe** - Comprehensive, professional
- **Linear** - Clean, values-focused
- **Notion** - Team-focused, casual tone
- **GitLab** - Transparent, detailed

---

### 9. Blog Index

**File:** `app/(marketing)/blog/page.tsx`

#### Structure (Organisms)

```
BlogIndexPage
├── BlogHeader
│   ├── PageTitle (H1: "Blog")
│   ├── Description
│   └── SubscribeForm (newsletter)
├── FeaturedPost (optional, highlighted)
│   └── FeaturedPostCard (large, image + excerpt)
├── FilterBar
│   ├── CategoryTabs / Dropdown
│   ├── SearchInput
│   └── SortDropdown (newest, popular)
├── PostsGrid / PostsList
│   └── PostCard
│       ├── PostImage
│       ├── CategoryBadge
│       ├── PostTitle
│       ├── PostExcerpt
│       ├── AuthorInfo (avatar, name)
│       ├── PublishDate
│       └── ReadTime
├── Pagination
│   ├── PreviousButton
│   ├── PageNumbers
│   └── NextButton
└── NewsletterCTA (bottom)
```

#### Data Requirements

| Data | Source | Caching Strategy |
|------|--------|------------------|
| Posts list | CMS / MDX files | `use cache` + revalidateTag('posts') |
| Categories | CMS / static | Build-time |
| Featured post | CMS flag | Same as posts |
| Pagination | Query params | Dynamic |
| Search | searchParams | Dynamic (client-side filter) |

```tsx
// Blog index with pagination
export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; category?: string }>
}) {
  const { page = '1', category } = await searchParams
  
  const { posts, totalPages } = await getPosts({
    page: parseInt(page),
    category,
    limit: 12,
  })

  return (
    <div className="container py-12">
      <BlogHeader />
      <FilterBar activeCategory={category} />
      <PostsGrid posts={posts} />
      <Pagination currentPage={parseInt(page)} totalPages={totalPages} />
    </div>
  )
}
```

#### SEO Considerations

```tsx
export const metadata: Metadata = {
  title: 'Blog - Company Name',
  description: 'Read the latest articles about [topic]',
  alternates: {
    types: {
      'application/rss+xml': '/blog/rss.xml',
    },
  },
}

// Generate RSS feed
export async function GET() {
  const posts = await getAllPosts()
  const feed = generateRSSFeed(posts)
  return new Response(feed, {
    headers: { 'Content-Type': 'application/xml' },
  })
}
```

#### Performance

- **Rendering:** Static for initial page, dynamic for filtered views
- **Images:** Use `<Image>` with blur placeholder
- **Pagination:** Generate static pages for first N pages
- **Search:** Client-side filtering or dedicated search API

```tsx
// Static generation for paginated blog
export async function generateStaticParams() {
  const { totalPages } = await getPostsCount()
  
  return Array.from({ length: Math.min(totalPages, 10) }, (_, i) => ({
    page: String(i + 1),
  }))
}
```

#### Responsive Considerations

- **Posts grid:** 1 column mobile, 2 tablet, 3 desktop
- **Featured post:** Full-width card on all sizes
- **Filters:** Horizontal tabs desktop, dropdown mobile
- **Cards:** Image aspect ratio consistent (16:9 or 3:2)

#### Best Examples

- **Vercel Blog** - Clean, excellent typography
- **Linear Blog** - Beautiful cards, smooth transitions
- **Stripe Blog** - Categorized, searchable
- **Next.js Blog** - Reference implementation

---

### 10. Blog Post

**File:** `app/(marketing)/blog/[slug]/page.tsx`

#### Structure (Organisms)

```
BlogPostPage
├── ArticleHeader
│   ├── Breadcrumb (Blog > Category > Post)
│   ├── CategoryBadge
│   ├── PostTitle (H1)
│   ├── PostMeta
│   │   ├── AuthorInfo (avatar, name, link)
│   │   ├── PublishDate
│   │   └── ReadTime
│   └── ShareButtons (optional)
├── FeaturedImage (full-width hero)
├── article (prose content)
│   ├── TableOfContents (optional, sticky sidebar)
│   └── MDXContent
│       ├── Prose (p, h2, h3, lists, etc.)
│       ├── CodeBlocks (syntax highlighted)
│       ├── Images (captioned)
│       ├── Embeds (YouTube, Twitter)
│       └── CustomComponents (Callout, Tabs)
├── ArticleFooter
│   ├── Tags
│   ├── ShareButtons
│   └── AuthorBio
├── CommentsSection (optional)
├── RelatedPosts
│   └── RelatedPostCard (3-4 posts)
└── NewsletterCTA
```

#### Data Requirements

| Data | Source | Caching Strategy |
|------|--------|------------------|
| Post content | MDX / CMS | `use cache` + revalidateTag |
| Author info | CMS / database | Cached with post |
| Related posts | Algorithm / CMS | Cached with post |
| Comments | Database / Disqus | Client-side |
| Views count | Analytics | Client-side |

```tsx
// Static generation for blog posts
export async function generateStaticParams() {
  const posts = await getAllPosts()
  return posts.map((post) => ({ slug: post.slug }))
}

export async function generateMetadata({ params }): Promise<Metadata> {
  const { slug } = await params
  const post = await getPostBySlug(slug)

  return {
    title: post.title,
    description: post.excerpt,
    authors: [{ name: post.author.name }],
    openGraph: {
      type: 'article',
      title: post.title,
      description: post.excerpt,
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      authors: [post.author.name],
      images: [{ url: post.ogImage || post.coverImage }],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
      images: [post.ogImage || post.coverImage],
    },
  }
}
```

#### SEO Considerations

```tsx
// JSON-LD for blog post
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BlogPosting',
  headline: post.title,
  description: post.excerpt,
  image: post.coverImage,
  datePublished: post.publishedAt,
  dateModified: post.updatedAt,
  author: {
    '@type': 'Person',
    name: post.author.name,
    url: post.author.url,
  },
  publisher: {
    '@type': 'Organization',
    name: 'Company Name',
    logo: { '@type': 'ImageObject', url: '/logo.png' },
  },
  mainEntityOfPage: {
    '@type': 'WebPage',
    '@id': `https://example.com/blog/${post.slug}`,
  },
}
```

#### Performance

- **Rendering:** Static (generateStaticParams)
- **MDX:** Compile at build time
- **Images:** Blur placeholder, lazy load below fold
- **Code blocks:** Highlight at build time (not runtime)
- **Dynamic OG Image:** Generate via ImageResponse

```tsx
// Dynamic OG image generation
// app/blog/[slug]/opengraph-image.tsx
export default async function OGImage({ params }: { params: { slug: string } }) {
  const post = await getPostBySlug(params.slug)

  return new ImageResponse(
    (
      <div style={{ /* ... */ }}>
        <h1>{post.title}</h1>
      </div>
    ),
    { width: 1200, height: 630 }
  )
}
```

#### Responsive Considerations

- **Content width:** Max 65ch for readability
- **TOC:** Sidebar on desktop, collapsible/hidden on mobile
- **Images:** Full-width on mobile, contained on desktop
- **Code blocks:** Horizontal scroll on mobile

#### Best Examples

- **Lee Robinson's Blog** - Clean MDX, excellent reading experience
- **Josh Comeau** - Interactive elements, great code blocks
- **Stripe Blog** - Professional, well-structured
- **Vercel Blog** - Reference Next.js implementation

---

### 11. Product Listing

**File:** `app/(shop)/products/page.tsx`

#### Structure (Organisms)

```
ProductListingPage
├── PageHeader
│   ├── Breadcrumb
│   ├── CategoryTitle (H1)
│   └── ProductCount
├── div (main content area)
│   ├── FilterSidebar (desktop) / FilterSheet (mobile)
│   │   ├── FilterGroup (Category)
│   │   ├── FilterGroup (Price Range)
│   │   ├── FilterGroup (Brand)
│   │   ├── FilterGroup (Size)
│   │   ├── FilterGroup (Color)
│   │   ├── FilterGroup (Rating)
│   │   └── ClearFiltersButton
│   └── div (products area)
│       ├── ToolBar
│       │   ├── MobileFilterTrigger
│       │   ├── ActiveFilters (chips)
│       │   ├── ViewToggle (grid/list)
│       │   └── SortDropdown
│       ├── ProductGrid
│       │   └── ProductCard
│       │       ├── ProductImage (hover for second image)
│       │       ├── WishlistButton
│       │       ├── QuickViewButton
│       │       ├── ProductTitle
│       │       ├── ProductPrice (sale price, original)
│       │       ├── RatingStars
│       │       ├── ColorSwatches (preview)
│       │       └── AddToCartButton
│       └── Pagination / InfiniteScroll
└── RecentlyViewed (optional)
```

#### Data Requirements

| Data | Source | Caching Strategy |
|------|--------|------------------|
| Products | Database / PIM | `use cache` + revalidateTag |
| Filters | searchParams | Dynamic |
| Categories | Database | Build-time |
| Facet counts | Search engine | Per-request |
| Inventory | Real-time API | Client-side / short cache |

```tsx
// Product listing with filters
export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{
    category?: string
    minPrice?: string
    maxPrice?: string
    brand?: string[]
    sort?: string
    page?: string
  }>
}) {
  const filters = await searchParams

  return (
    <div className="container py-8">
      <PageHeader category={filters.category} />
      <div className="flex gap-8">
        <Suspense fallback={<FilterSidebarSkeleton />}>
          <FilterSidebar activeFilters={filters} />
        </Suspense>
        <div className="flex-1">
          <ToolBar activeFilters={filters} />
          <Suspense fallback={<ProductGridSkeleton />}>
            <ProductGrid filters={filters} />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
```

#### SEO Considerations

```tsx
export async function generateMetadata({ searchParams }): Promise<Metadata> {
  const filters = await searchParams
  const category = filters.category

  return {
    title: category ? `${category} Products` : 'All Products',
    description: `Shop our collection of ${category || 'products'}`,
    openGraph: {
      type: 'website',
      title: `Shop ${category || 'Products'}`,
    },
    // Canonical without filter params for SEO
    alternates: {
      canonical: `/products${category ? `?category=${category}` : ''}`,
    },
  }
}

// JSON-LD for product listing
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: 'Products',
  description: 'Browse our product collection',
  mainEntity: {
    '@type': 'ItemList',
    numberOfItems: products.length,
    itemListElement: products.map((product, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: `/products/${product.slug}`,
    })),
  },
}
```

#### Performance

- **Rendering:** Dynamic (filters in searchParams)
- **Streaming:** Stream product grid independently
- **Images:** Use `sizes` prop for responsive images
- **Pagination:** Use pagination over infinite scroll for SEO
- **Filters:** Update URL with shallow routing

```tsx
// Optimistic UI for filters
'use client'
import { useRouter, useSearchParams } from 'next/navigation'
import { useOptimistic, useTransition } from 'react'

export function FilterCheckbox({ name, value }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  
  const handleChange = (checked: boolean) => {
    const params = new URLSearchParams(searchParams)
    if (checked) {
      params.append(name, value)
    } else {
      params.delete(name, value)
    }
    startTransition(() => {
      router.push(`?${params.toString()}`, { scroll: false })
    })
  }
  
  return <Checkbox onChange={handleChange} disabled={isPending} />
}
```

#### Responsive Considerations

- **Grid:** 2 columns mobile, 3 tablet, 4 desktop
- **Filters:** Off-canvas sheet on mobile
- **Product cards:** Adjust image size with `sizes` prop
- **Touch targets:** Ensure buttons are 44px minimum

#### Best Examples

- **Next.js Commerce** - Reference implementation (Shopify)
- **Medusa Store** - Open source, customizable
- **Vercel Store** - Demo with all patterns
- **Nike** - Excellent filtering, fast

---

### 12. Product Detail

**File:** `app/(shop)/products/[slug]/page.tsx`

#### Structure (Organisms)

```
ProductDetailPage
├── Breadcrumb
├── ProductSection (main)
│   ├── ProductGallery
│   │   ├── ThumbnailList
│   │   ├── MainImage (with zoom)
│   │   └── ImageModal (lightbox)
│   └── ProductInfo
│       ├── ProductTitle (H1)
│       ├── RatingDisplay (stars + review count)
│       ├── ProductPrice
│       │   ├── CurrentPrice
│       │   ├── OriginalPrice (if sale)
│       │   └── DiscountBadge
│       ├── ProductDescription (short)
│       ├── VariantSelectors
│       │   ├── ColorSelector (swatches)
│       │   ├── SizeSelector (buttons)
│       │   └── SizeGuideLink
│       ├── QuantitySelector
│       ├── AddToCartButton
│       ├── BuyNowButton
│       ├── WishlistButton
│       ├── StockStatus
│       ├── DeliveryEstimate
│       └── ShareButtons
├── ProductTabs
│   ├── Tab: Description (full)
│   ├── Tab: Specifications
│   ├── Tab: Shipping & Returns
│   └── Tab: Reviews
│       ├── ReviewSummary
│       ├── ReviewFilters
│       ├── ReviewList
│       └── WriteReviewButton
├── RelatedProducts
│   └── ProductCarousel
├── RecentlyViewed
└── (Sticky AddToCart bar on mobile)
```

#### Data Requirements

| Data | Source | Caching Strategy |
|------|--------|------------------|
| Product details | Database / PIM | `use cache` + revalidateTag |
| Inventory/Stock | Real-time API | Client-side / ISR short |
| Reviews | Database | `use cache` + pagination |
| Related products | Recommendation engine | Cached with product |
| Delivery estimate | Shipping API | Client-side (needs location) |

```tsx
// Product page with static generation
export async function generateStaticParams() {
  const products = await getProducts({ limit: 100 }) // Top 100
  return products.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }): Promise<Metadata> {
  const { slug } = await params
  const product = await getProduct(slug)

  return {
    title: `${product.name} | Store Name`,
    description: product.shortDescription,
    openGraph: {
      type: 'website',
      title: product.name,
      description: product.shortDescription,
      images: product.images.map((img) => ({ url: img.url })),
    },
  }
}
```

#### SEO Considerations

```tsx
// JSON-LD Product schema
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: product.name,
  description: product.description,
  image: product.images.map((i) => i.url),
  sku: product.sku,
  brand: {
    '@type': 'Brand',
    name: product.brand,
  },
  offers: {
    '@type': 'Offer',
    url: `https://store.com/products/${product.slug}`,
    priceCurrency: 'USD',
    price: product.price,
    availability: product.inStock
      ? 'https://schema.org/InStock'
      : 'https://schema.org/OutOfStock',
    seller: {
      '@type': 'Organization',
      name: 'Store Name',
    },
  },
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: product.rating,
    reviewCount: product.reviewCount,
  },
}
```

#### Performance

- **Rendering:** Static shell + dynamic inventory
- **Images:** Priority for first image, lazy load gallery
- **Reviews:** Paginate and stream
- **Variants:** Client-side state management
- **Add to Cart:** Optimistic UI

```tsx
// Streaming pattern for product page
export default async function ProductPage({ params }) {
  const { slug } = await params

  return (
    <div className="container py-8">
      <Suspense fallback={<ProductSkeleton />}>
        <ProductDetails slug={slug} />
      </Suspense>
      <Suspense fallback={<ReviewsSkeleton />}>
        <ProductReviews slug={slug} />
      </Suspense>
      <Suspense fallback={<RelatedSkeleton />}>
        <RelatedProducts slug={slug} />
      </Suspense>
    </div>
  )
}
```

#### Responsive Considerations

- **Gallery:** Horizontal scroll on mobile, thumbnail grid on desktop
- **Sticky cart:** Fixed bar at bottom on mobile
- **Tabs:** Accordion on mobile, tabs on desktop
- **Images:** Full-width on mobile

#### Best Examples

- **Apple Store** - Gallery interactions, clean design
- **Nike** - Size selectors, availability
- **Shopify Dawn theme** - Reference implementation
- **Amazon** - Comprehensive product info

---

### 13. Cart Page

**File:** `app/(shop)/cart/page.tsx`

#### Structure (Organisms)

```
CartPage
├── PageHeader
│   ├── PageTitle (H1: "Shopping Cart")
│   └── ItemCount
├── div (main content)
│   ├── CartItems (main column)
│   │   └── CartItemRow
│   │       ├── ItemImage (link to product)
│   │       ├── ItemDetails
│   │       │   ├── ItemName
│   │       │   ├── ItemVariants (size, color)
│   │       │   └── ItemPrice
│   │       ├── QuantitySelector
│   │       ├── ItemTotal
│   │       ├── SaveForLaterButton
│   │       └── RemoveButton
│   └── CartSummary (sidebar)
│       ├── Subtotal
│       ├── PromoCodeInput
│       │   └── AppliedPromos
│       ├── EstimatedShipping
│       ├── EstimatedTax
│       ├── OrderTotal
│       ├── CheckoutButton
│       ├── PayPalButton (express checkout)
│       └── TrustBadges
├── EmptyCartState (conditional)
│   ├── EmptyIllustration
│   ├── Message
│   └── ContinueShoppingButton
├── SavedForLater (optional)
│   └── SavedItemsGrid
└── RecommendedProducts
    └── ProductCarousel ("You might also like")
```

#### Data Requirements

| Data | Source | Caching Strategy |
|------|--------|------------------|
| Cart items | Session / cookies / DB | Per-request |
| Product details | Database | Cached (for display) |
| Inventory check | Real-time API | Per-request |
| Promo codes | Database | Per-request validation |
| Shipping estimate | Shipping API | Client-side |
| Recommendations | ML service | Cached per cart |

```tsx
// Cart page with real-time data
export default async function CartPage() {
  const cart = await getCart() // From cookies/session

  if (!cart || cart.items.length === 0) {
    return <EmptyCartState />
  }

  return (
    <div className="container py-8">
      <PageHeader itemCount={cart.items.length} />
      <div className="grid lg:grid-cols-[1fr_400px] gap-8">
        <CartItems items={cart.items} />
        <CartSummary cart={cart} />
      </div>
      <Suspense fallback={<RecommendationsSkeleton />}>
        <RecommendedProducts cartItems={cart.items} />
      </Suspense>
    </div>
  )
}
```

#### SEO Considerations

```tsx
export const metadata: Metadata = {
  title: 'Shopping Cart',
  robots: { index: false, follow: false }, // Don't index cart
}
```

#### Performance

- **Rendering:** Dynamic (cart is per-user)
- **Updates:** Optimistic UI for quantity changes
- **Validation:** Server Actions for cart mutations
- **Images:** Small thumbnails, lazy load

```tsx
// Optimistic cart update
'use client'
import { useOptimistic } from 'react'
import { updateCartItemQuantity } from '@/actions/cart'

export function QuantitySelector({ item }) {
  const [optimisticQuantity, setOptimisticQuantity] = useOptimistic(
    item.quantity,
    (_, newQuantity) => newQuantity
  )

  async function handleChange(newQuantity: number) {
    setOptimisticQuantity(newQuantity)
    await updateCartItemQuantity(item.id, newQuantity)
  }

  return (
    <select value={optimisticQuantity} onChange={(e) => handleChange(Number(e.target.value))}>
      {[1, 2, 3, 4, 5].map((n) => (
        <option key={n} value={n}>{n}</option>
      ))}
    </select>
  )
}
```

#### Responsive Considerations

- **Mobile:** Stack layout, summary at bottom
- **Desktop:** Two-column layout
- **Items:** Compact on mobile, expanded on desktop
- **Checkout button:** Sticky on mobile

#### Best Examples

- **Apple Store** - Clean, focused
- **Amazon** - Feature-complete, saved items
- **Shopify themes** - Good balance

---

### 14. Checkout Page

**File:** `app/(checkout)/checkout/page.tsx`

#### Structure (Organisms)

```
CheckoutPage
├── ProgressIndicator (steps)
├── CheckoutForm
│   ├── ContactSection
│   │   ├── EmailInput
│   │   └── PhoneInput (optional)
│   ├── ShippingSection
│   │   ├── AddressAutocomplete
│   │   ├── AddressForm
│   │   │   ├── FirstName / LastName
│   │   │   ├── Address Line 1 / 2
│   │   │   ├── City / State / Zip
│   │   │   └── Country
│   │   └── SavedAddresses (if logged in)
│   ├── ShippingMethodSection
│   │   └── ShippingOptions (radio group)
│   │       └── ShippingOption (name, price, estimate)
│   ├── PaymentSection
│   │   ├── PaymentMethodTabs
│   │   │   ├── CreditCard (Stripe Elements)
│   │   │   ├── PayPal
│   │   │   ├── ApplePay / GooglePay
│   │   │   └── Afterpay / Klarna
│   │   ├── BillingAddressToggle
│   │   └── BillingAddressForm (if different)
│   └── ReviewSection (optional step)
│       ├── OrderItems (readonly)
│       └── TermsCheckbox
├── SubmitButton
└── SecurityBadges
```

#### Data Requirements

| Data | Source | Caching Strategy |
|------|--------|------------------|
| Cart | Session | Per-request |
| User addresses | Database | Per-user cache |
| Shipping rates | Carrier APIs | Short cache (5 min) |
| Tax calculation | Tax API | Per-request |
| Payment intent | Stripe API | Per-request |
| Promo validation | Database | Per-request |

```tsx
// Multi-step checkout with Server Actions
export default async function CheckoutPage() {
  const cart = await getCart()
  const user = await getUser()

  if (!cart || cart.items.length === 0) {
    redirect('/cart')
  }

  return (
    <CheckoutForm cart={cart} user={user}>
      <ContactStep />
      <ShippingStep />
      <PaymentStep />
    </CheckoutForm>
  )
}

// Server Action for checkout
'use server'
export async function processCheckout(formData: FormData) {
  const cart = await getCart()
  
  // Validate inventory
  const validation = await validateInventory(cart.items)
  if (!validation.success) {
    return { error: 'Some items are no longer available' }
  }

  // Calculate final totals
  const totals = await calculateTotals(cart, formData)

  // Process payment
  const payment = await processPayment(totals, formData)
  if (!payment.success) {
    return { error: payment.error }
  }

  // Create order
  const order = await createOrder(cart, payment, formData)

  // Clear cart
  await clearCart()

  redirect(`/order/${order.id}/confirmation`)
}
```

#### SEO Considerations

```tsx
export const metadata: Metadata = {
  title: 'Checkout',
  robots: { index: false, follow: false },
}
```

#### Performance

- **Rendering:** Dynamic (requires auth/cart)
- **Payment SDKs:** Lazy load payment elements
- **Address:** Use autocomplete to reduce typing
- **Validation:** Server-side with client hints
- **Forms:** Progressive enhancement

```tsx
// Lazy load Stripe with Suspense
const StripePaymentElement = dynamic(
  () => import('@/components/stripe-payment'),
  { 
    ssr: false,
    loading: () => <PaymentSkeleton />
  }
)
```

#### Responsive Considerations

- **Mobile:** Single column, step-by-step
- **Desktop:** Two-column with sticky summary
- **Forms:** Large inputs, mobile-friendly keyboards
- **Buttons:** Full-width on mobile

#### Best Examples

- **Stripe Checkout** - Reference for payments
- **Shopify Checkout** - Optimized conversion
- **Linear** - Clean subscription flow

---

### 15. Dashboard Home

**File:** `app/(dashboard)/dashboard/page.tsx`

#### Structure (Organisms)

```
DashboardHomePage
├── WelcomeHeader
│   ├── Greeting ("Good morning, {name}")
│   ├── DateDisplay
│   └── QuickActions (common tasks)
├── StatsSection
│   └── StatCards (grid)
│       └── StatCard
│           ├── Icon
│           ├── Label
│           ├── Value
│           └── TrendIndicator (up/down %)
├── ChartsSection
│   ├── MainChart (area/line chart)
│   │   ├── ChartHeader (title, period selector)
│   │   └── Chart
│   └── SecondaryCharts (smaller)
│       ├── PieChart
│       └── BarChart
├── ActivitySection
│   ├── SectionHeader ("Recent Activity")
│   └── ActivityList
│       └── ActivityItem (icon, description, time)
├── TasksSection (optional)
│   ├── SectionHeader
│   └── TaskList
│       └── TaskItem (checkbox, title, due date)
├── QuickLinksSection
│   └── QuickLinkCards (grid)
│       └── QuickLinkCard (icon, title, description)
└── NotificationsPanel (optional sidebar)
```

#### Data Requirements

| Data | Source | Caching Strategy |
|------|--------|------------------|
| User info | Session | Per-request |
| Stats | Database aggregation | `use cache` with short TTL |
| Chart data | Analytics service | `use cache` or client-side |
| Activity feed | Database | Per-request, paginated |
| Tasks | Database | Per-request |
| Notifications | Database/WebSocket | Real-time |

```tsx
// Dashboard with parallel data loading
export default async function DashboardPage() {
  return (
    <div className="space-y-6">
      <WelcomeHeader />
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Suspense fallback={<StatCardSkeleton />}>
          <StatsCards />
        </Suspense>
      </div>

      <div className="grid gap-4 lg:grid-cols-7">
        <div className="lg:col-span-4">
          <Suspense fallback={<ChartSkeleton />}>
            <MainChart />
          </Suspense>
        </div>
        <div className="lg:col-span-3">
          <Suspense fallback={<ActivitySkeleton />}>
            <RecentActivity />
          </Suspense>
        </div>
      </div>

      <Suspense fallback={<DataTableSkeleton />}>
        <RecentOrders />
      </Suspense>
    </div>
  )
}
```

#### SEO Considerations

```tsx
export const metadata: Metadata = {
  title: 'Dashboard',
  robots: { index: false }, // Private page
}
```

#### Performance

- **Rendering:** Dynamic (requires auth)
- **Streaming:** Stream each section independently
- **Charts:** Use client-side rendering or SSR with fallback
- **Data:** Consider stale-while-revalidate pattern

```tsx
// Cached stats with revalidation
async function StatsCards() {
  'use cache'
  cacheLife('minutes')
  
  const stats = await getStats()
  return (
    <>
      {stats.map((stat) => (
        <StatCard key={stat.id} {...stat} />
      ))}
    </>
  )
}
```

#### Responsive Considerations

- **Stats:** 1 col mobile, 2 col tablet, 4 col desktop
- **Charts:** Stack on mobile, side-by-side on desktop
- **Tables:** Horizontal scroll or card view on mobile

#### Best Examples

- **shadcn/ui dashboard blocks** - Reference implementation
- **Vercel Dashboard** - Clean, data-focused
- **Linear** - Excellent keyboard navigation
- **Stripe Dashboard** - Information dense, usable

---

### 16. Settings Page

**File:** `app/(dashboard)/settings/page.tsx`

#### Structure (Organisms)

```
SettingsPage
├── SettingsHeader
│   ├── PageTitle (H1: "Settings")
│   └── Description
├── SettingsNavigation (tabs or sidebar)
│   ├── ProfileLink
│   ├── AccountLink
│   ├── NotificationsLink
│   ├── BillingLink
│   ├── TeamLink
│   └── APILink
├── SettingsContent
│   └── {children} (nested routes)

// Profile Settings (app/settings/profile/page.tsx)
ProfileSettings
├── SectionHeader ("Profile Information")
├── ProfileForm
│   ├── AvatarUpload
│   ├── NameInput
│   ├── EmailInput (readonly or verification required)
│   ├── UsernameInput
│   ├── BioTextarea
│   └── TimezoneSelect
├── SaveButton
└── DeleteAccountSection

// Account Settings (app/settings/account/page.tsx)
AccountSettings
├── PasswordSection
│   ├── ChangePasswordForm
│   └── TwoFactorToggle
├── SessionsSection
│   └── ActiveSessions (list with revoke)
├── ConnectedAccountsSection
│   └── OAuthProviders (connect/disconnect)
└── DangerZone
    ├── ExportDataButton
    └── DeleteAccountButton

// Notification Settings
NotificationSettings
├── EmailNotifications
│   └── ToggleGroups
├── PushNotifications
│   └── ToggleGroups
└── SlackIntegration
```

#### Data Requirements

| Data | Source | Caching Strategy |
|------|--------|------------------|
| User profile | Database | Per-request |
| User preferences | Database | Per-request |
| Active sessions | Database | Per-request |
| Billing info | Payment provider | Per-request |
| Team members | Database | Per-request |
| API keys | Database | Per-request |

```tsx
// Settings layout with navigation
export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-6">
      <SettingsHeader />
      <Separator />
      <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
        <aside className="lg:w-1/5">
          <SettingsNavigation />
        </aside>
        <div className="flex-1 lg:max-w-2xl">{children}</div>
      </div>
    </div>
  )
}

// Profile settings page
export default async function ProfileSettings() {
  const user = await getUser()

  return (
    <div className="space-y-6">
      <ProfileForm user={user} />
    </div>
  )
}
```

#### SEO Considerations

```tsx
export const metadata: Metadata = {
  title: 'Settings',
  robots: { index: false },
}
```

#### Performance

- **Rendering:** Dynamic (requires auth)
- **Forms:** Server Actions for mutations
- **File uploads:** Use presigned URLs
- **Validation:** Server-side with client feedback

```tsx
// Settings form with Server Action
'use client'
import { useActionState } from 'react'
import { updateProfile } from '@/actions/settings'

export function ProfileForm({ user }) {
  const [state, formAction, pending] = useActionState(updateProfile, null)

  return (
    <form action={formAction}>
      <div className="space-y-4">
        <Field
          label="Name"
          name="name"
          defaultValue={user.name}
          error={state?.errors?.name}
        />
        {/* More fields */}
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? 'Saving...' : 'Save Changes'}
      </Button>
      {state?.success && <p className="text-green-600">Settings saved!</p>}
    </form>
  )
}
```

#### Responsive Considerations

- **Navigation:** Horizontal tabs on mobile, vertical sidebar on desktop
- **Forms:** Full-width on mobile
- **Sections:** Stack vertically on all sizes

#### Best Examples

- **GitHub Settings** - Comprehensive, well-organized
- **Linear Settings** - Clean, keyboard-friendly
- **Vercel Settings** - Clear sections
- **Stripe Dashboard** - Excellent form patterns

---

### 17. 404 Page

**File:** `app/not-found.tsx`

#### Structure (Organisms)

```
NotFoundPage
├── Container (centered)
│   ├── Illustration (optional graphic/animation)
│   ├── ErrorCode ("404")
│   ├── Title ("Page Not Found")
│   ├── Description ("The page you're looking for doesn't exist or has been moved.")
│   ├── SearchBar (optional)
│   ├── SuggestionLinks
│   │   └── Link (Home, Products, Support, etc.)
│   └── BackButton / HomeButton
└── (Optional: Footer from layout)
```

#### Data Requirements

| Data | Source | Caching Strategy |
|------|--------|------------------|
| Popular pages | Static config | Build-time |
| Search | Client-side | N/A |

```tsx
// Root not-found page
export default function NotFound() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center">
      <div className="mx-auto max-w-md text-center">
        <h1 className="text-9xl font-bold text-muted-foreground">404</h1>
        <h2 className="mt-4 text-2xl font-semibold">Page Not Found</h2>
        <p className="mt-2 text-muted-foreground">
          Sorry, we couldn't find the page you're looking for.
        </p>
        
        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Button asChild>
            <Link href="/">Go Home</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/support">Contact Support</Link>
          </Button>
        </div>

        <div className="mt-8">
          <p className="text-sm text-muted-foreground">Popular pages:</p>
          <div className="mt-2 flex flex-wrap justify-center gap-2">
            <Link href="/products" className="text-sm underline">Products</Link>
            <Link href="/blog" className="text-sm underline">Blog</Link>
            <Link href="/docs" className="text-sm underline">Documentation</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
```

#### SEO Considerations

```tsx
export const metadata: Metadata = {
  title: '404 - Page Not Found',
  robots: { index: false, follow: true }, // Don't index, but follow links
}
```

**Important:** Next.js handles 404 status codes automatically for `not-found.tsx`

#### Performance

- **Rendering:** Static (always)
- **Images:** Preload any illustration
- **No data fetching:** Should be instant

#### Responsive Considerations

- **Layout:** Centered on all sizes
- **Buttons:** Stack on mobile, inline on desktop
- **Illustration:** Scale appropriately

#### Best Examples

- **GitHub** - Clean, helpful suggestions
- **Vercel** - Minimal, on-brand
- **Linear** - Playful illustration
- **Stripe** - Helpful navigation

---

## Summary: Composition Patterns

### Layout Composition Pattern

```
RootLayout (providers, fonts, analytics)
└── RouteGroupLayout (marketing | dashboard | auth | checkout)
    └── PageLayout (if needed, e.g., docs sidebar)
        └── Page (actual content)
```

### Page Composition Pattern

```
Page
├── Header Section (breadcrumb, title, actions)
├── Main Content
│   ├── Primary Section(s)
│   └── Secondary Section(s) (with Suspense)
├── Related/Recommended (lazy loaded)
└── CTA Section (conversion focused)
```

### Data Loading Pattern

```tsx
// Parallel loading with Suspense
export default async function Page() {
  return (
    <>
      {/* Critical content - no Suspense */}
      <Header />
      
      {/* Independent sections - parallel Suspense */}
      <Suspense fallback={<Section1Skeleton />}>
        <Section1 />
      </Suspense>
      <Suspense fallback={<Section2Skeleton />}>
        <Section2 />
      </Suspense>
      
      {/* Below fold - can stream later */}
      <Suspense fallback={<RelatedSkeleton />}>
        <Related />
      </Suspense>
    </>
  )
}
```

### Rendering Strategy Summary

| Template | Rendering | Caching |
|----------|-----------|---------|
| Root Layout | Static | Build-time |
| Marketing Layout | Static | Build-time |
| Dashboard Layout | Dynamic | Per-request |
| Auth Layout | Static shell | Dynamic form |
| Docs Layout | Static | ISR hourly |
| Checkout Layout | Dynamic | Per-request |
| Landing Page | Static | Build-time |
| About Page | Static | Build-time |
| Blog Index | Static + Dynamic (filters) | ISR + searchParams |
| Blog Post | Static | generateStaticParams |
| Product Listing | Dynamic | Short cache |
| Product Detail | Static shell + Dynamic inventory | ISR |
| Cart Page | Dynamic | Per-request |
| Checkout Page | Dynamic | Per-request |
| Dashboard Home | Dynamic | Stream sections |
| Settings Page | Dynamic | Per-request |
| 404 Page | Static | Build-time |

---

## References

- [Next.js Docs - Layouts and Templates](https://nextjs.org/docs/app/building-your-application/routing/layouts-and-templates)
- [Next.js Docs - Metadata](https://nextjs.org/docs/app/building-your-application/optimizing/metadata)
- [Next.js Docs - Cache Components](https://nextjs.org/docs/app/getting-started/cache-components)
- [shadcn/ui Sidebar Component](https://ui.shadcn.com/docs/components/sidebar)
- [shadcn/ui Blocks](https://ui.shadcn.com/blocks)
- [Vercel Templates](https://vercel.com/templates/next.js)
- [Next.js Commerce](https://github.com/vercel/commerce)
- [Nextra Documentation](https://nextra.site)
