# Showcase-Quality Next.js 15 Site Recipes

> Complete specifications for building award-winning Next.js 15 sites across 7 major categories.

---

## Performance Benchmarks (All Sites)

### Core Web Vitals Targets (Award-Winning Quality)

| Metric | Target | Description |
|--------|--------|-------------|
| **LCP** | < 1.2s | Largest Contentful Paint (excellent: < 1.0s) |
| **INP** | < 100ms | Interaction to Next Paint (excellent: < 50ms) |
| **CLS** | < 0.05 | Cumulative Layout Shift (excellent: < 0.02) |
| **FCP** | < 1.0s | First Contentful Paint |
| **TTFB** | < 200ms | Time to First Byte |
| **TBT** | < 150ms | Total Blocking Time |

### Lighthouse Score Targets

| Category | Minimum | Showcase |
|----------|---------|----------|
| Performance | 95 | 100 |
| Accessibility | 100 | 100 |
| Best Practices | 100 | 100 |
| SEO | 100 | 100 |

---

## 1. Marketing Site (Vercel.com / Linear.app Style)

### Complete Page List

```
/                           # Hero + value proposition
/features                   # Feature grid/showcase
/features/[feature-slug]    # Individual feature deep-dive
/pricing                    # Pricing tiers with comparison
/customers                  # Customer logos + testimonials
/customers/[case-study]     # Individual case study
/about                      # Company story, mission, team
/careers                    # Job listings
/careers/[job-slug]         # Individual job posting
/blog                       # Blog listing with categories
/blog/[slug]                # Blog post with MDX
/changelog                  # Product changelog
/docs                       # Documentation (optional)
/contact                    # Contact form
/demo                       # Request demo / book meeting
/legal/privacy              # Privacy policy
/legal/terms                # Terms of service
/404                        # Custom 404
/500                        # Custom error
```

### Key Features

| Feature | Implementation | Priority |
|---------|---------------|----------|
| **Hero Animations** | Motion.dev with scroll-triggered reveals | Critical |
| **Bento Grid** | CSS Grid + framer-motion layout animations | Critical |
| **Gradient Mesh** | Canvas/WebGL background gradients | High |
| **Dark Mode** | next-themes with system preference | Critical |
| **Scroll Progress** | Sticky headers with progress indicators | High |
| **Logo Carousel** | Infinite scroll client logos | Medium |
| **Testimonial Cards** | Staggered reveal animations | High |
| **Comparison Tables** | Interactive toggle pricing | Critical |
| **Video Embeds** | Lazy-loaded with poster images | Medium |
| **Cal.com Integration** | Embedded booking widget | High |

### Animation Patterns

```typescript
// Hero entrance sequence
const heroVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { staggerChildren: 0.1 }
  }
}

// Scroll-triggered feature cards
const useScrollReveal = () => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  return { ref, isInView }
}

// Smooth section transitions
const sectionTransition = {
  initial: { opacity: 0, filter: "blur(10px)" },
  animate: { opacity: 1, filter: "blur(0px)" },
  transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
}
```

### Skills/Components Used

| Layer | Components |
|-------|------------|
| **Atoms** | Button, Badge, Icon, Logo, GradientText |
| **Molecules** | FeatureCard, TestimonialCard, PricingCard, StatCard |
| **Organisms** | Navbar, Footer, Hero, FeatureGrid, PricingTable, CTASection |
| **Templates** | MarketingLayout, BlogLayout, LegalLayout |

### External Integrations

| Service | Purpose | Package |
|---------|---------|---------|
| Vercel Analytics | Performance monitoring | `@vercel/analytics` |
| Vercel Speed Insights | Core Web Vitals | `@vercel/speed-insights` |
| Resend | Transactional email | `resend` |
| Cal.com | Meeting scheduling | `@calcom/embed-react` |
| Sanity/Contentlayer | CMS for blog | `next-sanity` / `contentlayer` |
| Crisp/Intercom | Live chat | Widget script |
| PostHog | Product analytics | `posthog-js` |

### Polish Features

- [ ] Magnetic cursor effects on CTAs
- [ ] Parallax depth on hero images
- [ ] Gradient border animations on hover
- [ ] Smooth scroll with Lenis
- [ ] Easter egg: Konami code reveals hidden page
- [ ] Custom cursor on interactive elements
- [ ] Sound effects on key interactions (optional)
- [ ] Page transition animations
- [ ] Skeleton loading states
- [ ] Optimistic UI updates

### Reference Implementations

| Site | Notable Features |
|------|-----------------|
| [vercel.com](https://vercel.com) | Gradient mesh, bento grid, scroll animations |
| [linear.app](https://linear.app) | Dark theme, keyboard shortcuts, smooth scrolling |
| [raycast.com](https://raycast.com) | Command palette demo, video showcases |
| [stripe.com](https://stripe.com) | Documentation quality, gradient animations |
| [resend.com](https://resend.com) | Minimalist, beautiful typography |

---

## 2. E-commerce Site (Nike.com / Shopify Stores)

### Complete Page List

```
/                           # Hero + featured products
/products                   # Product listing with filters
/products/[handle]          # Product detail page (PDP)
/collections                # All collections
/collections/[handle]       # Collection page
/cart                       # Shopping cart (or slide-over)
/checkout                   # Multi-step checkout
/checkout/success           # Order confirmation
/account                    # Account dashboard
/account/orders             # Order history
/account/orders/[id]        # Order detail
/account/addresses          # Address book
/account/settings           # Account settings
/login                      # Sign in
/register                   # Sign up
/forgot-password            # Password reset
/wishlist                   # Saved items
/search                     # Search results
/about                      # Brand story
/stores                     # Store locator
/size-guide                 # Size charts
/shipping                   # Shipping info
/returns                    # Returns policy
/contact                    # Customer service
```

### Key Features

| Feature | Implementation | Priority |
|---------|---------------|----------|
| **Product Gallery** | Zoom, thumbnails, video support | Critical |
| **Variant Selector** | Color swatches, size grid | Critical |
| **Quick View** | Modal product preview | High |
| **Add to Cart Animation** | Optimistic UI with cart drawer | Critical |
| **Infinite Scroll** | Product grid pagination | High |
| **Faceted Search** | URL-based filter state | Critical |
| **Wishlist** | Persistent across sessions | Medium |
| **Recently Viewed** | Local storage tracking | Medium |
| **Size Recommender** | Quiz-based sizing | High |
| **AR Try-On** | WebXR product visualization | Low |

### Commerce Patterns

```typescript
// Optimistic cart update
const addToCart = async (variantId: string) => {
  // Optimistically update UI
  setOptimisticCart(prev => ({
    ...prev,
    items: [...prev.items, { variantId, quantity: 1 }]
  }))
  
  // Server action
  await addToCartAction(variantId)
  
  // Revalidate
  revalidateTag('cart')
}

// Streaming product page
export default async function ProductPage({ params }) {
  return (
    <>
      <Suspense fallback={<ProductSkeleton />}>
        <ProductDetails handle={params.handle} />
      </Suspense>
      <Suspense fallback={<RecommendationsSkeleton />}>
        <RelatedProducts handle={params.handle} />
      </Suspense>
    </>
  )
}
```

### Skills/Components Used

| Layer | Components |
|-------|------------|
| **Atoms** | Price, Badge, QuantityInput, ColorSwatch, SizeButton |
| **Molecules** | ProductCard, CartItem, AddressCard, FilterChip |
| **Organisms** | ProductGallery, CartDrawer, FilterSidebar, CheckoutForm |
| **Templates** | StorefrontLayout, CheckoutLayout, AccountLayout |

### External Integrations

| Service | Purpose | Package |
|---------|---------|---------|
| Shopify Storefront API | Commerce backend | GraphQL client |
| Stripe | Payment processing | `@stripe/stripe-js` |
| Algolia | Product search | `algoliasearch` |
| Klaviyo | Email marketing | REST API |
| Sanity | Editorial content | `next-sanity` |
| Gorgias | Customer support | Widget |
| Yotpo/Judge.me | Reviews | API/Widget |
| Affirm/Klarna | Buy now pay later | Widget |

### Polish Features

- [ ] Product image zoom on hover
- [ ] 360-degree product views
- [ ] Animated cart count badge
- [ ] Confetti on successful purchase
- [ ] Social proof notifications ("X just bought...")
- [ ] Low stock urgency indicators
- [ ] Smooth variant image transitions
- [ ] Haptic feedback on mobile actions
- [ ] Recently viewed carousel
- [ ] Smart product recommendations

### Reference Implementations

| Site | Notable Features |
|------|-----------------|
| [vercel/commerce](https://github.com/vercel/commerce) | Next.js + Shopify reference |
| [demo.vercel.store](https://demo.vercel.store) | Live demo |
| [nike.com](https://nike.com) | Filtering, gallery, customization |
| [allbirds.com](https://allbirds.com) | Sustainability storytelling |
| [hydrogen.shopify.dev](https://hydrogen.shopify.dev) | Shopify's own stack |

---

## 3. SaaS Dashboard (Linear / Notion / Vercel Dashboard)

### Complete Page List

```
/                           # Marketing/landing (logged out)
/login                      # Sign in with providers
/signup                     # Registration flow
/onboarding                 # Multi-step onboarding
/dashboard                  # Main dashboard
/dashboard/projects         # Project listing
/dashboard/projects/[id]    # Project detail
/dashboard/projects/new     # Create project
/dashboard/analytics        # Charts and metrics
/dashboard/settings         # User settings
/dashboard/settings/team    # Team management
/dashboard/settings/billing # Subscription management
/dashboard/settings/api     # API keys
/dashboard/notifications    # Notification center
/invite/[token]             # Team invite accept
/api/...                    # API routes
```

### Key Features

| Feature | Implementation | Priority |
|---------|---------------|----------|
| **Auth System** | NextAuth.js / Auth.js v5 | Critical |
| **Data Tables** | TanStack Table with virtual scrolling | Critical |
| **Charts** | Recharts / Tremor / Visx | Critical |
| **Command Palette** | cmdk (Cmd+K) | Critical |
| **Real-time Updates** | Server-Sent Events / WebSockets | High |
| **Optimistic Updates** | useOptimistic + Server Actions | Critical |
| **RBAC** | Role-based access control | High |
| **Multi-tenancy** | Workspace/org switching | High |
| **Keyboard Shortcuts** | Global hotkey handling | High |
| **Toast Notifications** | Sonner toast system | Critical |

### Auth Patterns

```typescript
// Auth.js v5 configuration
export const { auth, handlers, signIn, signOut } = NextAuth({
  providers: [
    GitHub,
    Google,
    Credentials({
      credentials: {
        email: { type: "email" },
        password: { type: "password" }
      },
      authorize: async (credentials) => {
        const user = await verifyUser(credentials)
        return user
      }
    })
  ],
  callbacks: {
    authorized: async ({ auth, request: { nextUrl } }) => {
      const isLoggedIn = !!auth?.user
      const isProtected = nextUrl.pathname.startsWith('/dashboard')
      
      if (isProtected && !isLoggedIn) {
        return Response.redirect(new URL('/login', nextUrl))
      }
      return true
    }
  }
})

// Middleware for route protection
export { auth as middleware } from "@/auth"
export const config = {
  matcher: ["/dashboard/:path*"]
}
```

### Data Visualization Patterns

```typescript
// Real-time chart updates
const useRealtimeMetrics = (projectId: string) => {
  const [metrics, setMetrics] = useState<Metric[]>([])
  
  useEffect(() => {
    const eventSource = new EventSource(`/api/metrics/${projectId}/stream`)
    
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data)
      setMetrics(prev => [...prev.slice(-99), data])
    }
    
    return () => eventSource.close()
  }, [projectId])
  
  return metrics
}
```

### Skills/Components Used

| Layer | Components |
|-------|------------|
| **Atoms** | Avatar, Badge, Spinner, ProgressBar, StatusDot |
| **Molecules** | MetricCard, UserDropdown, SearchInput, DatePicker |
| **Organisms** | DataTable, Chart, Sidebar, CommandPalette, SettingsPanel |
| **Templates** | DashboardLayout, SettingsLayout, OnboardingLayout |

### External Integrations

| Service | Purpose | Package |
|---------|---------|---------|
| Auth.js | Authentication | `next-auth@beta` |
| Prisma | Database ORM | `prisma` |
| Stripe | Billing | `stripe` |
| Resend | Transactional email | `resend` |
| Upstash Redis | Rate limiting / caching | `@upstash/redis` |
| PlanetScale/Neon | Serverless DB | Prisma adapter |
| Posthog | Product analytics | `posthog-js` |
| Sentry | Error tracking | `@sentry/nextjs` |

### Polish Features

- [ ] Keyboard navigation everywhere (j/k, g+h)
- [ ] Command palette with search
- [ ] Drag-and-drop reordering
- [ ] Inline editing with blur-save
- [ ] Smooth sidebar collapse
- [ ] Skeleton states for all data
- [ ] Empty state illustrations
- [ ] Loading spinners with context
- [ ] Undo/redo for destructive actions
- [ ] Bulk selection and actions

### Reference Implementations

| Site | Notable Features |
|------|-----------------|
| [linear.app](https://linear.app) | Keyboard-first, speed, animations |
| [vercel.com/dashboard](https://vercel.com/dashboard) | Clean data presentation |
| [notion.so](https://notion.so) | Block-based editing, collaboration |
| [planetscale.com](https://planetscale.com) | Terminal-style UI elements |
| [cal.com](https://github.com/calcom/cal.com) | Open source scheduling app |

---

## 4. Documentation Site (Next.js Docs / Stripe Docs)

### Complete Page List

```
/                           # Docs landing / overview
/docs                       # Docs index
/docs/[...slug]             # Dynamic doc pages
/docs/getting-started       # Quick start guide
/docs/api-reference         # API documentation
/docs/examples              # Code examples
/blog                       # Changelog/blog
/blog/[slug]                # Blog post
/search                     # Full-text search
```

### Key Features

| Feature | Implementation | Priority |
|---------|---------------|----------|
| **MDX Processing** | next-mdx-remote / contentlayer | Critical |
| **Sidebar Navigation** | Collapsible nested menu | Critical |
| **Table of Contents** | Auto-generated from headings | Critical |
| **Code Highlighting** | Shiki with themes | Critical |
| **Copy Code Button** | Click-to-copy with feedback | High |
| **Full-text Search** | Algolia DocSearch / Pagefind | Critical |
| **Version Selector** | Multi-version docs | High |
| **Dark Mode** | Theme toggle | High |
| **Edit on GitHub** | Direct file links | Medium |
| **Feedback Widget** | Was this helpful? | Medium |

### MDX Configuration

```typescript
// next.config.js with MDX
import createMDX from '@next/mdx'
import remarkGfm from 'remark-gfm'
import rehypePrettyCode from 'rehype-pretty-code'

const withMDX = createMDX({
  options: {
    remarkPlugins: [remarkGfm],
    rehypePlugins: [
      [rehypePrettyCode, {
        theme: 'github-dark',
        onVisitLine(node) {
          if (node.children.length === 0) {
            node.children = [{ type: 'text', value: ' ' }]
          }
        },
        onVisitHighlightedLine(node) {
          node.properties.className.push('highlighted')
        }
      }]
    ]
  }
})

export default withMDX(nextConfig)
```

### Navigation Structure

```typescript
// docs navigation config
export const docsConfig = {
  sidebarNav: [
    {
      title: "Getting Started",
      items: [
        { title: "Introduction", href: "/docs" },
        { title: "Installation", href: "/docs/installation" },
        { title: "Quick Start", href: "/docs/quick-start" }
      ]
    },
    {
      title: "Core Concepts",
      items: [
        { title: "Routing", href: "/docs/routing" },
        { title: "Data Fetching", href: "/docs/data-fetching" },
        { title: "Rendering", href: "/docs/rendering" }
      ]
    }
  ]
}
```

### Skills/Components Used

| Layer | Components |
|-------|------------|
| **Atoms** | CodeBlock, Callout, Badge, CopyButton |
| **Molecules** | TOCItem, NavLink, SearchInput, ThemeToggle |
| **Organisms** | DocsSidebar, TableOfContents, SearchModal, MDXComponents |
| **Templates** | DocsLayout, BlogLayout |

### External Integrations

| Service | Purpose | Package |
|---------|---------|---------|
| Algolia DocSearch | Search | `@docsearch/react` |
| GitHub API | Edit links, contributors | REST API |
| Shiki | Syntax highlighting | `shiki` |
| Contentlayer | MDX processing | `contentlayer` |
| Nextra | Docs framework | `nextra` |

### Polish Features

- [ ] Syntax highlighting with language badges
- [ ] Line highlighting in code blocks
- [ ] Code block file names
- [ ] Interactive code playgrounds
- [ ] Copy code with one click
- [ ] Breadcrumb navigation
- [ ] Previous/Next page links
- [ ] Reading progress indicator
- [ ] Print-friendly styles
- [ ] Keyboard navigation (n/p for nav)

### Reference Implementations

| Site | Notable Features |
|------|-----------------|
| [nextjs.org/docs](https://nextjs.org/docs) | Nested sidebar, tabs, code blocks |
| [stripe.com/docs](https://stripe.com/docs) | API reference, language toggles |
| [nextra.site](https://nextra.site) | Next.js docs framework |
| [ui.shadcn.com](https://ui.shadcn.com) | Component documentation |
| [tailwindcss.com](https://tailwindcss.com) | Search, utility reference |

---

## 5. Blog Platform (Hashnode / Medium Style)

### Complete Page List

```
/                           # Home feed
/trending                   # Trending posts
/explore                    # Discover by topic
/tags/[tag]                 # Posts by tag
/[username]                 # Author profile
/[username]/[slug]          # Blog post
/[username]/followers       # Follower list
/[username]/following       # Following list
/new                        # Create new post
/edit/[id]                  # Edit post
/drafts                     # My drafts
/settings                   # User settings
/settings/account           # Account settings
/settings/appearance        # Theme settings
/bookmarks                  # Saved posts
/notifications              # Activity feed
/search                     # Search posts
/feed                       # Personalized feed (logged in)
```

### Key Features

| Feature | Implementation | Priority |
|---------|---------------|----------|
| **Rich Text Editor** | Tiptap / Lexical | Critical |
| **Markdown Support** | MDX with preview | Critical |
| **Image Upload** | Drag-drop, paste, Cloudinary | Critical |
| **Code Blocks** | Syntax highlighting | Critical |
| **Reading Time** | Auto-calculated | High |
| **Reactions** | Like, bookmark, share | High |
| **Comments** | Threaded discussions | Critical |
| **Following** | User/tag subscriptions | High |
| **RSS Feed** | Auto-generated | Medium |
| **OG Images** | Dynamic generation | Critical |

### Editor Configuration

```typescript
// Tiptap editor setup
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import Image from '@tiptap/extension-image'

const editor = useEditor({
  extensions: [
    StarterKit,
    Placeholder.configure({
      placeholder: 'Start writing...'
    }),
    CodeBlockLowlight.configure({
      lowlight
    }),
    Image.configure({
      inline: true,
      allowBase64: true
    })
  ],
  content: '',
  editorProps: {
    attributes: {
      class: 'prose prose-lg focus:outline-none'
    }
  }
})
```

### Skills/Components Used

| Layer | Components |
|-------|------------|
| **Atoms** | Avatar, ReadingTime, ReactionButton, ShareButton |
| **Molecules** | PostCard, CommentInput, AuthorCard, TagChip |
| **Organisms** | RichTextEditor, CommentThread, PostFeed, FollowList |
| **Templates** | FeedLayout, PostLayout, ProfileLayout, EditorLayout |

### External Integrations

| Service | Purpose | Package |
|---------|---------|---------|
| Cloudinary | Image hosting | `cloudinary` |
| Prisma | Database | `prisma` |
| Auth.js | Authentication | `next-auth` |
| Tiptap | Rich text editing | `@tiptap/react` |
| Resend | Email notifications | `resend` |
| Twitter API | Social sharing | REST API |

### Polish Features

- [ ] Auto-save drafts
- [ ] Markdown shortcuts in editor
- [ ] Image upload with drag-drop
- [ ] Code syntax detection
- [ ] Estimated reading time
- [ ] Social share previews
- [ ] Keyboard shortcuts (Cmd+Enter to publish)
- [ ] Smooth reading progress bar
- [ ] Table of contents for long posts
- [ ] Series/collections support

### Reference Implementations

| Site | Notable Features |
|------|-----------------|
| [hashnode.com](https://hashnode.com) | Custom domains, analytics |
| [dev.to](https://dev.to) | Community features, reactions |
| [medium.com](https://medium.com) | Reading experience, highlighting |
| [ghost.org](https://ghost.org) | Publishing platform |
| [leerob.io](https://leerob.io) | Personal blog with Next.js |

---

## 6. AI Application (ChatGPT / Claude.ai Style)

### Complete Page List

```
/                           # Landing/marketing
/chat                       # New conversation
/chat/[id]                  # Conversation thread
/history                    # Conversation history
/explore                    # Prompt templates
/settings                   # User preferences
/settings/models            # Model selection
/settings/api               # API key management
/api/chat                   # Streaming endpoint
/api/messages               # Message CRUD
```

### Key Features

| Feature | Implementation | Priority |
|---------|---------------|----------|
| **Streaming Responses** | AI SDK with SSE | Critical |
| **Message Rendering** | Markdown + code blocks | Critical |
| **Typing Indicator** | Animated dots/cursor | High |
| **Code Execution** | Sandboxed code blocks | Medium |
| **File Upload** | Multi-modal inputs | High |
| **Conversation Memory** | Persisted history | Critical |
| **Model Switching** | Runtime model selection | High |
| **Token Usage** | Usage tracking/limits | High |
| **Prompt Templates** | Pre-built starters | Medium |
| **Export** | Download conversations | Medium |

### AI SDK Integration

```typescript
// app/api/chat/route.ts
import { streamText } from 'ai'
import { anthropic } from '@ai-sdk/anthropic'

export async function POST(req: Request) {
  const { messages, model = 'claude-sonnet-4-20250514' } = await req.json()
  
  const result = streamText({
    model: anthropic(model),
    messages,
    system: `You are a helpful AI assistant...`,
    maxTokens: 4096,
    temperature: 0.7,
    onFinish: async ({ text, usage }) => {
      // Log usage, save to database
      await saveMessage({ role: 'assistant', content: text })
    }
  })
  
  return result.toDataStreamResponse()
}

// components/Chat.tsx
import { useChat } from 'ai/react'

export function Chat() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/chat',
    onError: (error) => toast.error(error.message)
  })
  
  return (
    <div className="flex flex-col h-full">
      <MessageList messages={messages} isLoading={isLoading} />
      <ChatInput 
        value={input}
        onChange={handleInputChange}
        onSubmit={handleSubmit}
        disabled={isLoading}
      />
    </div>
  )
}
```

### Streaming UI Patterns

```typescript
// Typing indicator with streaming
const StreamingMessage = ({ content, isStreaming }) => {
  return (
    <div className="prose">
      <ReactMarkdown>{content}</ReactMarkdown>
      {isStreaming && (
        <span className="inline-block w-2 h-5 bg-current animate-pulse ml-1" />
      )}
    </div>
  )
}

// Generative UI with tool calls
const { messages, ... } = useChat({
  maxSteps: 5,
  async onToolCall({ toolCall }) {
    if (toolCall.toolName === 'getWeather') {
      const result = await getWeather(toolCall.args)
      return result
    }
  }
})
```

### Skills/Components Used

| Layer | Components |
|-------|------------|
| **Atoms** | TypingIndicator, CopyButton, ModelBadge, TokenCounter |
| **Molecules** | MessageBubble, ChatInput, FileUploader, PromptCard |
| **Organisms** | MessageList, ConversationSidebar, ModelSelector |
| **Templates** | ChatLayout, ExploreLayout |

### External Integrations

| Service | Purpose | Package |
|---------|---------|---------|
| AI SDK | LLM integration | `ai` |
| Anthropic | Claude models | `@ai-sdk/anthropic` |
| OpenAI | GPT models | `@ai-sdk/openai` |
| Upstash Redis | Rate limiting | `@upstash/ratelimit` |
| Prisma | Conversation storage | `prisma` |
| Clerk/Auth.js | Authentication | Auth provider |
| Vercel KV | Session storage | `@vercel/kv` |

### Polish Features

- [ ] Smooth message appear animation
- [ ] Streaming text with cursor
- [ ] Code block language detection
- [ ] One-click code copy
- [ ] Syntax highlighted code
- [ ] Image generation previews
- [ ] Regenerate response button
- [ ] Edit previous messages
- [ ] Branch conversations
- [ ] Export as markdown

### Reference Implementations

| Site | Notable Features |
|------|-----------------|
| [chat.openai.com](https://chat.openai.com) | Streaming, tool use |
| [claude.ai](https://claude.ai) | Artifacts, code execution |
| [vercel.com/ai](https://sdk.vercel.ai) | AI SDK documentation |
| [ai-chatbot template](https://github.com/vercel/ai-chatbot) | Full reference implementation |
| [chathn.vercel.app](https://chathn.vercel.app) | Minimal AI chat example |

---

## 7. Realtime Collaborative App (Figma / Notion Style)

### Complete Page List

```
/                           # Dashboard/home
/[workspace]                # Workspace home
/[workspace]/[document]     # Collaborative document
/[workspace]/settings       # Workspace settings
/[workspace]/members        # Team members
/templates                  # Template gallery
/settings                   # User settings
/invite/[token]             # Invite acceptance
```

### Key Features

| Feature | Implementation | Priority |
|---------|---------------|----------|
| **Real-time Sync** | Liveblocks / Yjs | Critical |
| **Presence Indicators** | Live cursors, avatars | Critical |
| **Conflict Resolution** | CRDT-based sync | Critical |
| **Undo/Redo** | History management | High |
| **Comments** | Inline annotations | High |
| **Notifications** | Activity updates | High |
| **Permissions** | View/edit/admin roles | Critical |
| **Offline Support** | Local-first with sync | Medium |
| **Version History** | Point-in-time restore | High |
| **Export** | Multiple formats | Medium |

### Liveblocks Integration

```typescript
// liveblocks.config.ts
import { createClient } from "@liveblocks/client"
import { createRoomContext } from "@liveblocks/react"

const client = createClient({
  authEndpoint: "/api/liveblocks-auth",
  throttle: 16, // 60fps for smooth cursors
})

type Presence = {
  cursor: { x: number; y: number } | null
  selection: string[]
  user: {
    name: string
    color: string
    avatar: string
  }
}

type Storage = {
  document: LiveObject<Document>
  elements: LiveList<Element>
}

export const {
  RoomProvider,
  useRoom,
  useMyPresence,
  useOthers,
  useStorage,
  useMutation
} = createRoomContext<Presence, Storage>(client)

// Collaborative cursor component
function LiveCursors() {
  const others = useOthers()
  
  return (
    <>
      {others.map(({ connectionId, presence }) => {
        if (!presence.cursor) return null
        
        return (
          <Cursor
            key={connectionId}
            x={presence.cursor.x}
            y={presence.cursor.y}
            color={presence.user.color}
            name={presence.user.name}
          />
        )
      })}
    </>
  )
}
```

### Collaborative Editing Patterns

```typescript
// Real-time document mutation
const updateElement = useMutation(({ storage }, elementId, updates) => {
  const elements = storage.get("elements")
  const index = elements.findIndex(el => el.get("id") === elementId)
  
  if (index !== -1) {
    const element = elements.get(index)
    Object.entries(updates).forEach(([key, value]) => {
      element.set(key, value)
    })
  }
}, [])

// Undo/redo with history
const room = useRoom()
const history = useHistory()

const handleUndo = () => history.undo()
const handleRedo = () => history.redo()
const canUndo = useCanUndo()
const canRedo = useCanRedo()
```

### Skills/Components Used

| Layer | Components |
|-------|------------|
| **Atoms** | Cursor, PresenceAvatar, SelectionBox, Handle |
| **Molecules** | UserList, ElementToolbar, CommentThread, VersionCard |
| **Organisms** | Canvas, LayerPanel, Toolbar, CollaboratorBar |
| **Templates** | EditorLayout, WorkspaceLayout |

### External Integrations

| Service | Purpose | Package |
|---------|---------|---------|
| Liveblocks | Real-time infrastructure | `@liveblocks/react` |
| Yjs | CRDT document sync | `yjs`, `y-websocket` |
| Tiptap | Collaborative text | `@tiptap/extension-collaboration` |
| Prisma | Persistence layer | `prisma` |
| Clerk | User management | `@clerk/nextjs` |
| R2/S3 | Asset storage | AWS SDK |

### Polish Features

- [ ] Smooth cursor interpolation (60fps)
- [ ] Cursor labels with names
- [ ] Selection highlighting by user
- [ ] Who's viewing indicator
- [ ] Conflict resolution UI
- [ ] Offline mode indicator
- [ ] Auto-reconnect handling
- [ ] Loading skeletons for sync
- [ ] Activity timeline
- [ ] Keyboard shortcuts overlay

### Reference Implementations

| Site | Notable Features |
|------|-----------------|
| [liveblocks.io/examples](https://liveblocks.io/examples) | Full collaboration examples |
| [tldraw.com](https://tldraw.com) | Whiteboard collaboration |
| [excalidraw.com](https://excalidraw.com) | Drawing with multiplayer |
| [figma.com](https://figma.com) | Gold standard for collaboration |
| [yjs.dev](https://yjs.dev) | CRDT implementation |

---

## Universal Polish Checklist

### Before Launch

- [ ] All images optimized with next/image
- [ ] Fonts subset and self-hosted
- [ ] Critical CSS inlined
- [ ] Prefetching for navigation
- [ ] Error boundaries on all pages
- [ ] 404/500 pages styled
- [ ] Meta tags and OG images
- [ ] Sitemap.xml generated
- [ ] robots.txt configured
- [ ] Analytics connected
- [ ] Error tracking (Sentry)
- [ ] Performance monitoring (Speed Insights)

### Accessibility

- [ ] ARIA labels on all interactive elements
- [ ] Keyboard navigation works everywhere
- [ ] Focus states visible
- [ ] Skip-to-content link
- [ ] Color contrast passes WCAG AA
- [ ] Screen reader tested
- [ ] Reduced motion support
- [ ] Touch targets 44px minimum

### Award-Winning Details

- [ ] Custom cursor effects
- [ ] Micro-interactions on every action
- [ ] Page transition animations
- [ ] Scroll-linked animations
- [ ] Easter eggs for power users
- [ ] Sound design (subtle, optional)
- [ ] Haptic feedback on mobile
- [ ] Delight moments (confetti, etc.)
- [ ] Loading state storytelling
- [ ] Empty state illustrations
