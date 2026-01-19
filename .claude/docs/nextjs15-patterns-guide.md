# Next.js 15 App Router: 48 A+++ Grade Architectural Patterns

> **Version**: Next.js 15.x with React 19
> **Last Updated**: January 2026
> **Key Changes**: Async Request APIs, `use cache` directive, Proxy (formerly Middleware), Cache Components

---

## Table of Contents
1. [Routing Patterns (6)](#1-routing-patterns)
2. [Data Patterns (8)](#2-data-patterns)
3. [State Patterns (5)](#3-state-patterns)
4. [Auth Patterns (5)](#4-auth-patterns)
5. [Caching Patterns (5)](#5-caching-patterns)
6. [Rendering Patterns (5)](#6-rendering-patterns)
7. [Performance Patterns (6)](#7-performance-patterns)
8. [SEO Patterns (4)](#8-seo-patterns)
9. [Testing Patterns (3)](#9-testing-patterns)
10. [Deployment Patterns (1)](#10-deployment-patterns)

---

## Dependencies Summary

```json
{
  "dependencies": {
    "next": "^15.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "devDependencies": {
    "@next/bundle-analyzer": "^15.0.0",
    "@playwright/test": "^1.40.0",
    "@testing-library/react": "^14.0.0",
    "jest": "^29.7.0",
    "vitest": "^1.0.0"
  }
}
```

---

## 1. ROUTING PATTERNS

### 1.1 App Router Structure

**When to Use:**
- Every Next.js 15 project (mandatory for App Router)
- File-based routing with layouts, pages, and special files
- Nested layouts with shared UI

**Implementation:**

```
app/
  layout.tsx          # Root layout (required, must have <html> and <body>)
  page.tsx            # Homepage (/)
  loading.tsx         # Loading UI for Suspense
  error.tsx           # Error boundary
  not-found.tsx       # 404 page
  blog/
    layout.tsx        # Nested layout for /blog/*
    page.tsx          # /blog
    [slug]/
      page.tsx        # /blog/:slug
```

```tsx
// app/layout.tsx - Root Layout (Required)
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <nav>Global Navigation</nav>
        <main>{children}</main>
      </body>
    </html>
  )
}

// app/blog/layout.tsx - Nested Layout
export default function BlogLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <section>
      <aside>Blog Sidebar</aside>
      <article>{children}</article>
    </section>
  )
}
```

**Common Mistakes:**
- Missing `<html>` and `<body>` tags in root layout
- Placing `'use client'` in layouts unnecessarily
- Not using TypeScript's auto-generated `PageProps` and `LayoutProps`

**Performance Impact:**
- Layouts don't re-render on navigation (partial rendering)
- Shared layouts reduce JavaScript bundle size by ~15-30%

---

### 1.2 Parallel Routes

**When to Use:**
- Dashboards with multiple independent sections
- Conditional rendering based on user roles
- Modals with deep linking
- Tab interfaces

**Implementation:**

```
app/
  layout.tsx
  @team/
    page.tsx
    default.tsx       # Fallback for unmatched routes
  @analytics/
    page.tsx
    default.tsx
```

```tsx
// app/layout.tsx
export default function Layout({
  children,
  team,
  analytics,
}: {
  children: React.ReactNode
  team: React.ReactNode
  analytics: React.ReactNode
}) {
  return (
    <>
      {children}
      <div className="dashboard-grid">
        {team}
        {analytics}
      </div>
    </>
  )
}

// app/@team/default.tsx - Required fallback
export default function Default() {
  return null
}

// Conditional rendering based on user role
// app/dashboard/layout.tsx
import { checkUserRole } from '@/lib/auth'

export default function Layout({
  user,
  admin,
}: {
  user: React.ReactNode
  admin: React.ReactNode
}) {
  const role = checkUserRole()
  return role === 'admin' ? admin : user
}
```

**Common Mistakes:**
- Forgetting `default.tsx` files (causes 404 on hard refresh)
- Not understanding slots don't affect URL structure
- Mixing static and dynamic slots at same level (all become dynamic)

**Performance Impact:**
- Independent streaming per slot
- Each slot can have its own `loading.tsx` and `error.tsx`

---

### 1.3 Intercepting Routes

**When to Use:**
- Photo galleries with modal previews
- Shopping carts as side panels
- Login modals with dedicated page fallback
- Social media feed with expandable posts

**Implementation:**

```
app/
  feed/
    page.tsx
    (..)photo/[id]/     # Intercepts /photo/[id] from feed
      page.tsx
  photo/[id]/
    page.tsx            # Direct navigation or hard refresh
```

```tsx
// Convention:
// (.)  - same level
// (..) - one level above
// (..)(..) - two levels above
// (...) - from root app directory

// app/feed/(..)photo/[id]/page.tsx - Modal view
import { Modal } from '@/components/modal'

export default async function PhotoModal({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const photo = await getPhoto(id)
  
  return (
    <Modal>
      <img src={photo.url} alt={photo.alt} />
    </Modal>
  )
}

// app/photo/[id]/page.tsx - Full page view
export default async function PhotoPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const photo = await getPhoto(id)
  
  return (
    <div className="full-page">
      <img src={photo.url} alt={photo.alt} />
      <PhotoDetails photo={photo} />
    </div>
  )
}
```

**Common Mistakes:**
- Convention is based on route segments, not file system
- `@slot` folders don't count in `(..)` calculations
- Not providing both intercepted and direct routes

**Performance Impact:**
- Preserves context during soft navigation
- Enables modal deep linking (shareable URLs)

---

### 1.4 Dynamic Routes

**When to Use:**
- Blog posts, product pages, user profiles
- Any content where URL segments are data-driven
- Static generation with `generateStaticParams`

**Implementation:**

```tsx
// app/blog/[slug]/page.tsx
// NEXT.JS 15: params is now a Promise!
export default async function BlogPost({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params  // Must await!
  const post = await getPost(slug)
  
  return <article>{post.content}</article>
}

// Static generation for known paths
export async function generateStaticParams() {
  const posts = await getPosts()
  return posts.map((post) => ({
    slug: post.slug,
  }))
}

// Type-safe with auto-generated helpers
export default async function Page(props: PageProps<'/blog/[slug]'>) {
  const { slug } = await props.params
  return <h1>Blog post: {slug}</h1>
}
```

**Common Mistakes:**
- **BREAKING CHANGE**: Not awaiting `params` (was sync in Next.js 14)
- Using sync access without migration codemod
- Not generating static params for known paths

**Performance Impact:**
- Pre-rendered pages: ~50-100ms TTFB vs ~200-500ms dynamic
- `generateStaticParams` enables build-time optimization

---

### 1.5 Catch-all Routes

**When to Use:**
- Documentation with nested sections
- File browser interfaces
- CMS with arbitrary nesting
- Fallback routes

**Implementation:**

```tsx
// app/docs/[...slug]/page.tsx - Required segments
export default async function DocsPage({
  params,
}: {
  params: Promise<{ slug: string[] }>
}) {
  const { slug } = await params
  // /docs/a -> ['a']
  // /docs/a/b/c -> ['a', 'b', 'c']
  
  return <Doc path={slug.join('/')} />
}

// app/docs/[[...slug]]/page.tsx - Optional catch-all
export default async function DocsPage({
  params,
}: {
  params: Promise<{ slug?: string[] }>
}) {
  const { slug } = await params
  // /docs -> undefined
  // /docs/a -> ['a']
  
  const path = slug?.join('/') ?? 'index'
  return <Doc path={path} />
}
```

**Common Mistakes:**
- Using `[...slug]` when you need `[[...slug]]` for root
- Not handling empty array case
- Forgetting params is now async

**Performance Impact:**
- Same as dynamic routes
- Use with `generateStaticParams` for static generation

---

### 1.6 Proxy (Middleware)

**When to Use:**
- Authentication redirects
- Geolocation-based routing
- A/B testing
- Request/response header manipulation
- Bot detection

**Implementation:**

```tsx
// proxy.ts (previously middleware.ts)
// NEXT.JS 16+: Renamed from middleware to proxy
import { NextResponse, NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
  // Authentication check
  const token = request.cookies.get('token')?.value
  
  if (!token && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  
  // Add custom headers
  const response = NextResponse.next({
    request: {
      headers: new Headers(request.headers),
    },
  })
  
  response.headers.set('x-custom-header', 'value')
  return response
}

// Matcher configuration
export const config = {
  matcher: [
    // Match all paths except static files
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
```

```tsx
// Advanced: Geolocation-based routing
export function proxy(request: NextRequest) {
  const country = request.geo?.country || 'US'
  
  if (country === 'DE' && !request.nextUrl.pathname.startsWith('/de')) {
    return NextResponse.redirect(new URL('/de' + request.nextUrl.pathname, request.url))
  }
  
  return NextResponse.next()
}
```

**Common Mistakes:**
- Running heavy computations in proxy (runs on edge)
- Not using matchers (runs on every request)
- Attempting to use Node.js APIs (edge runtime only)
- Fetching data in proxy is uncached

**Performance Impact:**
- Adds ~1-5ms latency per request
- Runs at edge, closest to user
- Use sparingly for critical path logic

---

## 2. DATA PATTERNS

### 2.1 Server Components

**When to Use:**
- Data fetching at component level
- Accessing backend resources directly
- Reducing client bundle size
- SEO-critical content

**Implementation:**

```tsx
// app/products/page.tsx - Server Component by default
import { db } from '@/lib/db'

export default async function ProductsPage() {
  // Direct database access - no API needed
  const products = await db.query.products.findMany({
    limit: 10,
  })
  
  return (
    <ul>
      {products.map((product) => (
        <li key={product.id}>
          <h2>{product.name}</h2>
          <p>${product.price}</p>
        </li>
      ))}
    </ul>
  )
}
```

```tsx
// Fetch with caching
async function getData() {
  const res = await fetch('https://api.example.com/data', {
    cache: 'force-cache',  // Opt into Data Cache
    next: { revalidate: 3600 }  // Revalidate every hour
  })
  return res.json()
}

export default async function Page() {
  const data = await getData()
  return <div>{data.title}</div>
}
```

**Common Mistakes:**
- Adding `'use client'` when not needed
- Using hooks in Server Components (not allowed)
- Not leveraging direct database access

**Performance Impact:**
- Zero JavaScript sent for Server Component code
- Reduced bundle size by 30-70% for data-heavy pages
- Streaming enabled by default

---

### 2.2 Client Components

**When to Use:**
- Interactive UI (onClick, onChange, etc.)
- Browser APIs (localStorage, geolocation)
- React hooks (useState, useEffect, useContext)
- Third-party client libraries

**Implementation:**

```tsx
// app/components/counter.tsx
'use client'

import { useState } from 'react'

export function Counter({ initialCount }: { initialCount: number }) {
  const [count, setCount] = useState(initialCount)
  
  return (
    <button onClick={() => setCount(count + 1)}>
      Count: {count}
    </button>
  )
}

// Usage in Server Component
// app/page.tsx
import { Counter } from './components/counter'

export default async function Page() {
  const initialCount = await getInitialCount()
  
  return (
    <div>
      <h1>Server-rendered heading</h1>
      <Counter initialCount={initialCount} />
    </div>
  )
}
```

**Common Mistakes:**
- Making entire pages client components
- Not passing server data as props
- Using `'use client'` at top of every file

**Performance Impact:**
- Client Components are still SSR'd initially
- JavaScript bundle includes component code
- Keep client boundary as low as possible

---

### 2.3 Server Actions (Server Functions)

**When to Use:**
- Form submissions
- Data mutations (create, update, delete)
- Revalidating cache after mutations
- Progressive enhancement

**Implementation:**

```tsx
// app/actions.ts
'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createPost(formData: FormData) {
  const title = formData.get('title') as string
  const content = formData.get('content') as string
  
  // Validate
  if (!title || !content) {
    return { error: 'Title and content required' }
  }
  
  // Create in database
  await db.posts.create({ data: { title, content } })
  
  // Revalidate and redirect
  revalidatePath('/posts')
  redirect('/posts')
}

// app/posts/new/page.tsx
import { createPost } from '@/app/actions'

export default function NewPost() {
  return (
    <form action={createPost}>
      <input name="title" placeholder="Title" required />
      <textarea name="content" placeholder="Content" required />
      <button type="submit">Create Post</button>
    </form>
  )
}
```

```tsx
// With useActionState for pending states
'use client'

import { useActionState } from 'react'
import { createPost } from '@/app/actions'

export function CreatePostForm() {
  const [state, formAction, isPending] = useActionState(createPost, null)
  
  return (
    <form action={formAction}>
      <input name="title" disabled={isPending} />
      <button type="submit" disabled={isPending}>
        {isPending ? 'Creating...' : 'Create'}
      </button>
      {state?.error && <p className="error">{state.error}</p>}
    </form>
  )
}
```

**Common Mistakes:**
- Not validating input on server
- Forgetting `'use server'` directive
- Not handling errors properly
- Not revalidating after mutations

**Performance Impact:**
- No API route needed (reduced latency)
- Progressive enhancement (works without JS)
- Automatic request deduplication

---

### 2.4 Data Fetching

**When to Use:**
- Always in Server Components for SSR data
- Parallel fetching with `Promise.all`
- Sequential fetching when data depends on previous

**Implementation:**

```tsx
// PARALLEL FETCHING - Best for independent data
async function getArtist(username: string) {
  const res = await fetch(`https://api.example.com/artist/${username}`)
  return res.json()
}

async function getAlbums(username: string) {
  const res = await fetch(`https://api.example.com/artist/${username}/albums`)
  return res.json()
}

export default async function Page({
  params,
}: {
  params: Promise<{ username: string }>
}) {
  const { username } = await params
  
  // Start both requests immediately
  const artistPromise = getArtist(username)
  const albumsPromise = getAlbums(username)
  
  // Wait for both
  const [artist, albums] = await Promise.all([artistPromise, albumsPromise])
  
  return (
    <>
      <h1>{artist.name}</h1>
      <AlbumList albums={albums} />
    </>
  )
}
```

```tsx
// SEQUENTIAL FETCHING - When data depends on previous
export default async function Page({
  params,
}: {
  params: Promise<{ username: string }>
}) {
  const { username } = await params
  
  const artist = await getArtist(username)
  // Albums need artistID
  const albums = await getAlbums(artist.id)
  
  return (...)
}
```

**Common Mistakes:**
- Sequential fetching when parallel is possible
- Not using `Promise.all` for independent requests
- Fetching in client when server is better

**Performance Impact:**
- Parallel: 2x faster for independent requests
- Sequential: Use Suspense to show partial UI

---

### 2.5 Streaming

**When to Use:**
- Long data fetches that shouldn't block entire page
- Progressive loading of content
- Improving perceived performance

**Implementation:**

```tsx
// loading.tsx - Automatic Suspense boundary
// app/dashboard/loading.tsx
export default function Loading() {
  return <DashboardSkeleton />
}

// app/dashboard/page.tsx
export default async function Dashboard() {
  const data = await fetchDashboardData() // This is slow
  return <DashboardContent data={data} />
}
```

```tsx
// Manual Suspense for granular streaming
import { Suspense } from 'react'

export default function Page() {
  return (
    <div>
      {/* Renders immediately */}
      <h1>Dashboard</h1>
      
      {/* Streams in when ready */}
      <Suspense fallback={<ChartSkeleton />}>
        <SlowChart />
      </Suspense>
      
      {/* Independent stream */}
      <Suspense fallback={<TableSkeleton />}>
        <SlowTable />
      </Suspense>
    </div>
  )
}
```

```tsx
// Streaming with Client Components using React 19 `use` hook
'use client'

import { use } from 'react'

export function Posts({ postsPromise }: { postsPromise: Promise<Post[]> }) {
  const posts = use(postsPromise)  // Suspends until resolved
  
  return (
    <ul>
      {posts.map((post) => (
        <li key={post.id}>{post.title}</li>
      ))}
    </ul>
  )
}

// Server Component passes promise
export default function Page() {
  const postsPromise = getPosts()  // Don't await!
  
  return (
    <Suspense fallback={<Loading />}>
      <Posts postsPromise={postsPromise} />
    </Suspense>
  )
}
```

**Common Mistakes:**
- Not using Suspense boundaries
- Blocking entire page on slow data
- Not providing meaningful loading states

**Performance Impact:**
- TTFB reduced by streaming static shell first
- Perceived performance improvement: 2-5x
- SEO unaffected (bots wait for content)

---

### 2.6 Mutations

**When to Use:**
- Any data modification (create, update, delete)
- Form submissions
- Optimistic updates

**Implementation:**

```tsx
// app/actions.ts
'use server'

import { revalidatePath, revalidateTag } from 'next/cache'

export async function updatePost(id: string, formData: FormData) {
  const title = formData.get('title') as string
  
  await db.posts.update({
    where: { id },
    data: { title },
  })
  
  // Revalidate specific path
  revalidatePath(`/posts/${id}`)
  
  // Or revalidate by tag
  revalidateTag('posts')
}

export async function deletePost(id: string) {
  await db.posts.delete({ where: { id } })
  
  revalidatePath('/posts')
  redirect('/posts')
}
```

**Common Mistakes:**
- Not revalidating after mutations
- Forgetting redirect after successful mutation
- Not handling concurrent mutations

**Performance Impact:**
- Instant UI updates with optimistic updates
- Single round-trip for mutation + revalidation

---

### 2.7 Optimistic Updates

**When to Use:**
- Like/unlike buttons
- Comment submissions
- Any mutation where UX > consistency
- Low-risk operations

**Implementation:**

```tsx
'use client'

import { useOptimistic, useTransition } from 'react'
import { likePost } from '@/app/actions'

export function LikeButton({ 
  postId, 
  initialLikes 
}: { 
  postId: string
  initialLikes: number 
}) {
  const [isPending, startTransition] = useTransition()
  const [optimisticLikes, addOptimisticLike] = useOptimistic(
    initialLikes,
    (current, increment: number) => current + increment
  )
  
  async function handleLike() {
    startTransition(async () => {
      addOptimisticLike(1)  // Immediate UI update
      await likePost(postId)  // Server mutation
    })
  }
  
  return (
    <button onClick={handleLike} disabled={isPending}>
      {optimisticLikes} {optimisticLikes === 1 ? 'Like' : 'Likes'}
    </button>
  )
}
```

**Common Mistakes:**
- Not handling rollback on error
- Using for high-risk operations
- Not showing pending state

**Performance Impact:**
- Perceived latency: 0ms
- Better UX for common actions

---

### 2.8 Revalidation

**When to Use:**
- After mutations
- Scheduled content updates
- Webhook triggers
- Cache invalidation

**Implementation:**

```tsx
// Time-based revalidation
async function getData() {
  const res = await fetch('https://api.example.com/data', {
    next: { revalidate: 3600 }  // Revalidate every hour
  })
  return res.json()
}

// On-demand revalidation by path
// app/api/revalidate/route.ts
import { revalidatePath } from 'next/cache'

export async function POST(request: Request) {
  const { path, secret } = await request.json()
  
  if (secret !== process.env.REVALIDATION_SECRET) {
    return Response.json({ error: 'Invalid secret' }, { status: 401 })
  }
  
  revalidatePath(path)
  return Response.json({ revalidated: true })
}

// On-demand revalidation by tag
import { revalidateTag } from 'next/cache'

async function getData() {
  const res = await fetch('https://api.example.com/posts', {
    next: { tags: ['posts'] }  // Tag for revalidation
  })
  return res.json()
}

// In Server Action
export async function createPost(formData: FormData) {
  'use server'
  await db.posts.create(...)
  revalidateTag('posts')  // Invalidate all 'posts' tagged data
}
```

```tsx
// NEXT.JS 15+: use cache with cacheLife and cacheTag
import { cacheLife, cacheTag } from 'next/cache'

async function getPosts() {
  'use cache'
  cacheLife('hours')  // Cache profile
  cacheTag('posts')   // Tag for invalidation
  
  return await db.posts.findMany()
}
```

**Common Mistakes:**
- Revalidating too aggressively
- Not using tags for related data
- Forgetting to revalidate after mutations

**Performance Impact:**
- Stale-while-revalidate: instant response
- Background revalidation: no user wait

---

## 3. STATE PATTERNS

### 3.1 URL State

**When to Use:**
- Search filters
- Pagination
- Sorting
- Shareable view states
- Back/forward navigation state

**Implementation:**

```tsx
// app/products/page.tsx
export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ 
    q?: string
    sort?: string
    page?: string 
  }>
}) {
  const params = await searchParams
  const query = params.q || ''
  const sort = params.sort || 'newest'
  const page = parseInt(params.page || '1')
  
  const products = await getProducts({ query, sort, page })
  
  return (
    <>
      <SearchFilters currentQuery={query} currentSort={sort} />
      <ProductGrid products={products} />
      <Pagination currentPage={page} />
    </>
  )
}
```

```tsx
// Client-side URL state management
'use client'

import { useSearchParams, usePathname, useRouter } from 'next/navigation'

export function SearchFilters() {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const { replace } = useRouter()
  
  function handleSearch(term: string) {
    const params = new URLSearchParams(searchParams)
    if (term) {
      params.set('q', term)
    } else {
      params.delete('q')
    }
    replace(`${pathname}?${params.toString()}`)
  }
  
  return (
    <input
      defaultValue={searchParams.get('q') || ''}
      onChange={(e) => handleSearch(e.target.value)}
      placeholder="Search..."
    />
  )
}
```

**Common Mistakes:**
- Using useState for shareable state
- Not debouncing search inputs
- Forgetting `searchParams` is now async

**Performance Impact:**
- URL state survives refresh
- Enables deep linking
- SEO-friendly for filtered content

---

### 3.2 Server State

**When to Use:**
- Data that lives on the server
- Needs real-time sync
- Multiple components need same data

**Implementation:**

```tsx
// Lift data fetching to Server Components
// app/dashboard/layout.tsx
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()
  const notifications = await getNotifications(user.id)
  
  return (
    <div>
      <Header user={user} notifications={notifications} />
      {children}
    </div>
  )
}

// Or use React cache for deduplication
import { cache } from 'react'

export const getUser = cache(async (id: string) => {
  const user = await db.users.findUnique({ where: { id } })
  return user
})

// Called multiple times, executes once
async function UserProfile({ userId }: { userId: string }) {
  const user = await getUser(userId)
  return <div>{user.name}</div>
}

async function UserPosts({ userId }: { userId: string }) {
  const user = await getUser(userId)  // Same cache hit
  const posts = await db.posts.findMany({ where: { authorId: user.id } })
  return <PostList posts={posts} />
}
```

**Common Mistakes:**
- Prop drilling instead of fetching at component level
- Not using React cache for deduplication
- Mixing server and client state incorrectly

**Performance Impact:**
- Request memoization: single DB call per request
- Data cached across components

---

### 3.3 Client State

**When to Use:**
- UI state (modals, dropdowns, tabs)
- Form input state
- Ephemeral state that shouldn't persist

**Implementation:**

```tsx
'use client'

import { useState, createContext, useContext } from 'react'

// Local component state
function Modal() {
  const [isOpen, setIsOpen] = useState(false)
  
  return (
    <>
      <button onClick={() => setIsOpen(true)}>Open</button>
      {isOpen && <div className="modal">...</div>}
    </>
  )
}

// Shared state with Context
const ThemeContext = createContext<{
  theme: 'light' | 'dark'
  toggle: () => void
} | null>(null)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  
  return (
    <ThemeContext.Provider 
      value={{ 
        theme, 
        toggle: () => setTheme(t => t === 'light' ? 'dark' : 'light') 
      }}
    >
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) throw new Error('useTheme must be used within ThemeProvider')
  return context
}
```

**Common Mistakes:**
- Using client state for server data
- Creating global state when URL state works
- Not considering SSR hydration

**Performance Impact:**
- Client state requires hydration
- Keep client state boundary minimal

---

### 3.4 Form State

**When to Use:**
- Complex form validation
- Multi-step forms
- Form submission feedback

**Implementation:**

```tsx
// Using useActionState (React 19)
'use client'

import { useActionState } from 'react'
import { createUser } from '@/app/actions'

type FormState = {
  errors?: {
    name?: string[]
    email?: string[]
  }
  message?: string
}

export function SignupForm() {
  const [state, formAction, isPending] = useActionState<FormState, FormData>(
    createUser,
    { errors: {} }
  )
  
  return (
    <form action={formAction}>
      <div>
        <label htmlFor="name">Name</label>
        <input id="name" name="name" required />
        {state.errors?.name && (
          <p className="error">{state.errors.name[0]}</p>
        )}
      </div>
      
      <div>
        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" required />
        {state.errors?.email && (
          <p className="error">{state.errors.email[0]}</p>
        )}
      </div>
      
      <button type="submit" disabled={isPending}>
        {isPending ? 'Signing up...' : 'Sign Up'}
      </button>
      
      {state.message && <p>{state.message}</p>}
    </form>
  )
}
```

```tsx
// Server Action with validation
'use server'

import { z } from 'zod'

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
})

export async function createUser(prevState: FormState, formData: FormData) {
  const validated = schema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
  })
  
  if (!validated.success) {
    return {
      errors: validated.error.flatten().fieldErrors,
    }
  }
  
  await db.users.create({ data: validated.data })
  
  return { message: 'User created!' }
}
```

**Common Mistakes:**
- Not showing pending state
- Client-only validation (always validate server-side)
- Not handling errors gracefully

**Performance Impact:**
- Progressive enhancement (works without JS)
- Instant feedback with isPending

---

### 3.5 Context Patterns

**When to Use:**
- Theme switching
- User preferences
- Shopping cart
- Avoiding prop drilling for deep trees

**Implementation:**

```tsx
// Providers wrapper for multiple contexts
// app/providers.tsx
'use client'

import { ThemeProvider } from '@/contexts/theme'
import { CartProvider } from '@/contexts/cart'
import { AuthProvider } from '@/contexts/auth'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ThemeProvider>
        <CartProvider>
          {children}
        </CartProvider>
      </ThemeProvider>
    </AuthProvider>
  )
}

// app/layout.tsx
import { Providers } from './providers'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
```

```tsx
// Composition pattern - Pass Server data to Client context
// app/layout.tsx
import { Providers } from './providers'
import { getUser } from '@/lib/auth'

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getUser()  // Server-side fetch
  
  return (
    <html lang="en">
      <body>
        <Providers initialUser={user}>
          {children}
        </Providers>
      </body>
    </html>
  )
}
```

**Common Mistakes:**
- Putting providers in Server Components
- Not initializing with server data
- Creating unnecessary context

**Performance Impact:**
- Context changes re-render all consumers
- Use multiple small contexts over one large

---

## 4. AUTH PATTERNS

### 4.1 Session Management

**When to Use:**
- User authentication state
- Persistent login
- Session-based auth

**Implementation:**

```tsx
// lib/session.ts
import { cookies } from 'next/headers'
import { SignJWT, jwtVerify } from 'jose'

const secret = new TextEncoder().encode(process.env.JWT_SECRET)

export async function createSession(userId: string) {
  const token = await new SignJWT({ userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .sign(secret)
  
  const cookieStore = await cookies()
  cookieStore.set('session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  })
}

export async function getSession() {
  const cookieStore = await cookies()
  const token = cookieStore.get('session')?.value
  
  if (!token) return null
  
  try {
    const { payload } = await jwtVerify(token, secret)
    return payload as { userId: string }
  } catch {
    return null
  }
}

export async function deleteSession() {
  const cookieStore = await cookies()
  cookieStore.delete('session')
}
```

```tsx
// Usage in Server Component
import { getSession } from '@/lib/session'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const session = await getSession()
  
  if (!session) {
    redirect('/login')
  }
  
  const user = await db.users.findUnique({
    where: { id: session.userId },
  })
  
  return <Dashboard user={user} />
}
```

**Common Mistakes:**
- Storing sensitive data in JWT payload
- Not setting httpOnly flag
- Using localStorage for sessions

**Performance Impact:**
- Cookie-based: ~0ms overhead
- JWT verification: ~1-5ms

---

### 4.2 Auth Proxy (Middleware)

**When to Use:**
- Route protection at edge
- Redirect unauthenticated users
- Rate limiting by auth status

**Implementation:**

```tsx
// proxy.ts
import { NextResponse, NextRequest } from 'next/server'
import { getSession } from '@/lib/session'

const protectedRoutes = ['/dashboard', '/settings', '/api/protected']
const authRoutes = ['/login', '/register']

export async function proxy(request: NextRequest) {
  const session = await getSession()
  const { pathname } = request.nextUrl
  
  // Redirect authenticated users away from auth pages
  if (session && authRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }
  
  // Redirect unauthenticated users to login
  if (!session && protectedRoutes.some(route => pathname.startsWith(route))) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('from', pathname)
    return NextResponse.redirect(loginUrl)
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
```

**Common Mistakes:**
- Heavy auth logic in proxy (keep it lightweight)
- Not handling API routes differently
- Forgetting to exclude static files

**Performance Impact:**
- Runs at edge: ~1-10ms
- Prevents unauthorized page loads

---

### 4.3 Protected Routes

**When to Use:**
- Page-level protection
- Different protection per route
- Server-side auth checks

**Implementation:**

```tsx
// lib/auth.ts
import { getSession } from '@/lib/session'
import { redirect } from 'next/navigation'
import { cache } from 'react'

export const getCurrentUser = cache(async () => {
  const session = await getSession()
  if (!session) return null
  
  return db.users.findUnique({
    where: { id: session.userId },
    select: { id: true, name: true, email: true, role: true },
  })
})

export async function requireAuth() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')
  return user
}

export async function requireRole(roles: string[]) {
  const user = await requireAuth()
  if (!roles.includes(user.role)) {
    redirect('/unauthorized')
  }
  return user
}
```

```tsx
// app/admin/page.tsx
import { requireRole } from '@/lib/auth'

export default async function AdminPage() {
  const user = await requireRole(['admin', 'superadmin'])
  
  return <AdminDashboard user={user} />
}
```

```tsx
// Layout-level protection
// app/dashboard/layout.tsx
import { requireAuth } from '@/lib/auth'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await requireAuth()
  
  return (
    <div>
      <DashboardNav user={user} />
      {children}
    </div>
  )
}
```

**Common Mistakes:**
- Only checking in proxy (double-check in component)
- Not caching user lookups
- Exposing sensitive data to client

**Performance Impact:**
- React cache: single DB call per request
- Layout protection: checks once for all children

---

### 4.4 RBAC (Role-Based Access Control)

**When to Use:**
- Multi-tenant applications
- Admin vs user permissions
- Feature flags by role

**Implementation:**

```tsx
// lib/permissions.ts
type Role = 'user' | 'editor' | 'admin' | 'superadmin'

type Permission = 
  | 'read:posts'
  | 'write:posts'
  | 'delete:posts'
  | 'manage:users'
  | 'access:admin'

const rolePermissions: Record<Role, Permission[]> = {
  user: ['read:posts'],
  editor: ['read:posts', 'write:posts'],
  admin: ['read:posts', 'write:posts', 'delete:posts', 'manage:users'],
  superadmin: ['read:posts', 'write:posts', 'delete:posts', 'manage:users', 'access:admin'],
}

export function hasPermission(role: Role, permission: Permission): boolean {
  return rolePermissions[role]?.includes(permission) ?? false
}

export async function requirePermission(permission: Permission) {
  const user = await getCurrentUser()
  if (!user) redirect('/login')
  
  if (!hasPermission(user.role as Role, permission)) {
    redirect('/unauthorized')
  }
  
  return user
}
```

```tsx
// Usage
// app/posts/new/page.tsx
import { requirePermission } from '@/lib/permissions'

export default async function NewPostPage() {
  await requirePermission('write:posts')
  
  return <PostEditor />
}
```

```tsx
// Component-level permission check
import { getCurrentUser } from '@/lib/auth'
import { hasPermission } from '@/lib/permissions'

export default async function PostActions({ postId }: { postId: string }) {
  const user = await getCurrentUser()
  const canDelete = user && hasPermission(user.role, 'delete:posts')
  
  return (
    <div>
      <button>Edit</button>
      {canDelete && <button>Delete</button>}
    </div>
  )
}
```

**Common Mistakes:**
- Hardcoding role checks everywhere
- Not using centralized permission system
- Client-side only permission checks

**Performance Impact:**
- Permission lookup: O(n) where n = permissions per role
- Consider caching for complex permission trees

---

### 4.5 OAuth Integration

**When to Use:**
- Social login (Google, GitHub, etc.)
- Third-party authentication
- SSO implementations

**Implementation:**

```tsx
// Using NextAuth.js v5 (Auth.js)
// auth.ts
import NextAuth from 'next-auth'
import GitHub from 'next-auth/providers/github'
import Google from 'next-auth/providers/google'

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    GitHub({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
    Google({
      clientId: process.env.GOOGLE_ID!,
      clientSecret: process.env.GOOGLE_SECRET!,
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (token.sub) {
        session.user.id = token.sub
      }
      return session
    },
  },
})

// app/api/auth/[...nextauth]/route.ts
import { handlers } from '@/auth'
export const { GET, POST } = handlers

// Usage in Server Component
import { auth } from '@/auth'

export default async function Page() {
  const session = await auth()
  
  if (!session?.user) {
    return <SignInButton />
  }
  
  return <p>Welcome, {session.user.name}</p>
}

// Sign in/out actions
import { signIn, signOut } from '@/auth'

export function SignInButton() {
  return (
    <form action={async () => {
      'use server'
      await signIn('github')
    }}>
      <button type="submit">Sign in with GitHub</button>
    </form>
  )
}
```

**Dependencies:**
```json
{
  "next-auth": "^5.0.0-beta.x"
}
```

**Common Mistakes:**
- Exposing client secrets
- Not validating OAuth state
- Missing CSRF protection

**Performance Impact:**
- OAuth adds ~200-500ms to sign-in flow
- Session checks: ~1-5ms with JWT

---

## 5. CACHING PATTERNS

### 5.1 Request Memoization

**When to Use:**
- Same data needed in multiple components
- Automatic deduplication
- Within single request lifecycle

**Implementation:**

```tsx
// Automatic memoization with fetch
async function getUser(id: string) {
  // Automatically memoized within single render pass
  const res = await fetch(`https://api.example.com/users/${id}`)
  return res.json()
}

// Called multiple times, executes once
async function UserProfile({ userId }: { userId: string }) {
  const user = await getUser(userId)  // First call
  return <div>{user.name}</div>
}

async function UserPosts({ userId }: { userId: string }) {
  const user = await getUser(userId)  // Same cache hit
  return <PostList authorId={user.id} />
}
```

```tsx
// Manual memoization with React cache
import { cache } from 'react'

export const getUser = cache(async (id: string) => {
  const user = await db.users.findUnique({ where: { id } })
  return user
})

// Works for non-fetch operations (database, etc.)
```

**Key Points:**
- Only applies to GET/HEAD fetch requests
- Only during React render pass
- Resets after request completes

**Performance Impact:**
- Eliminates duplicate network requests
- Single DB query for same data

---

### 5.2 Data Cache

**When to Use:**
- Persisting data across requests
- Sharing data between users
- Expensive API calls

**Implementation:**

```tsx
// NEXT.JS 15: fetch is NOT cached by default
// Must explicitly opt in

// Opt into caching
async function getCachedData() {
  const res = await fetch('https://api.example.com/data', {
    cache: 'force-cache',  // Explicit opt-in
  })
  return res.json()
}

// Time-based revalidation
async function getTimedData() {
  const res = await fetch('https://api.example.com/data', {
    next: { revalidate: 3600 },  // Revalidate hourly
  })
  return res.json()
}

// Tagged for on-demand revalidation
async function getTaggedData() {
  const res = await fetch('https://api.example.com/posts', {
    next: { tags: ['posts'] },
  })
  return res.json()
}

// Revalidate in Server Action
'use server'
import { revalidateTag } from 'next/cache'

export async function createPost() {
  await db.posts.create(...)
  revalidateTag('posts')
}
```

**NEXT.JS 15 Breaking Change:**
- `fetch` is uncached by default
- Must use `cache: 'force-cache'` or `next.revalidate` to cache

**Performance Impact:**
- Cached responses: ~0-10ms
- Uncached: ~50-500ms+ depending on API

---

### 5.3 Full Route Cache

**When to Use:**
- Static pages
- Infrequently changing content
- High-traffic pages

**Implementation:**

```tsx
// Static generation (default for static content)
// app/about/page.tsx
export default function AboutPage() {
  return <div>Static content</div>
}
// Rendered at build time, cached indefinitely

// Dynamic with revalidation
export const revalidate = 3600  // Revalidate every hour

export default async function BlogPage() {
  const posts = await getPosts()
  return <PostList posts={posts} />
}

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const data = await getUserSpecificData()
  return <Dashboard data={data} />
}
```

**NEXT.JS 15: Cache Components (PPR)**
```tsx
// next.config.ts
const config = {
  cacheComponents: true,  // Enable Partial Prerendering
}

// app/page.tsx
import { Suspense } from 'react'
import { cacheLife } from 'next/cache'

export default async function Page() {
  return (
    <>
      {/* Static shell - prerendered */}
      <header>Static Header</header>
      
      {/* Dynamic content - streams in */}
      <Suspense fallback={<Loading />}>
        <DynamicContent />
      </Suspense>
    </>
  )
}

async function CachedSection() {
  'use cache'
  cacheLife('hours')
  
  const data = await fetchData()
  return <div>{data}</div>
}
```

**Performance Impact:**
- Static: ~10-50ms TTFB
- Dynamic: ~100-500ms TTFB
- PPR: Static shell + streaming dynamic

---

### 5.4 Router Cache

**When to Use:**
- Client-side navigation
- Prefetching
- Back/forward navigation

**Implementation:**

```tsx
// NEXT.JS 15: Pages are NOT cached by default
// Layout and loading states are cached

// Opt into page caching
// next.config.ts
const config = {
  experimental: {
    staleTimes: {
      dynamic: 30,  // Cache dynamic pages for 30 seconds
      static: 180,  // Cache static pages for 3 minutes
    },
  },
}
```

```tsx
// Prefetching with Link
import Link from 'next/link'

export function Navigation() {
  return (
    <nav>
      {/* Prefetches on hover/viewport */}
      <Link href="/dashboard">Dashboard</Link>
      
      {/* Disable prefetching */}
      <Link href="/settings" prefetch={false}>Settings</Link>
      
      {/* Full prefetch (layout + page) */}
      <Link href="/profile" prefetch={true}>Profile</Link>
    </nav>
  )
}
```

```tsx
// Invalidate router cache
'use client'

import { useRouter } from 'next/navigation'

export function RefreshButton() {
  const router = useRouter()
  
  return (
    <button onClick={() => router.refresh()}>
      Refresh
    </button>
  )
}
```

**NEXT.JS 15 Breaking Change:**
- Page segments are not cached by default
- `staleTimes.dynamic` defaults to 0
- Layouts and loading states still cached

**Performance Impact:**
- Instant back/forward navigation
- Prefetch: ~50-200ms saved on navigation

---

### 5.5 Cache Strategies

**When to Use:**
- Deciding caching approach per use case
- Balancing freshness vs performance

**Implementation:**

```tsx
// Strategy 1: Static (build-time)
// Best for: Marketing pages, documentation
export default function StaticPage() {
  return <div>Never changes</div>
}

// Strategy 2: ISR (Incremental Static Regeneration)
// Best for: Blog posts, product pages
export const revalidate = 3600

export default async function ISRPage() {
  const data = await getData()
  return <div>{data}</div>
}

// Strategy 3: Stale-While-Revalidate
// Best for: Frequently accessed, can tolerate staleness
async function getSWRData() {
  const res = await fetch('https://api.example.com/data', {
    next: { 
      revalidate: 60,  // Revalidate every minute
      tags: ['swr-data'],
    },
  })
  return res.json()
}

// Strategy 4: On-Demand Revalidation
// Best for: CMS content, user-generated content
'use server'

export async function publishPost() {
  await db.posts.update(...)
  revalidateTag('posts')  // Immediate cache invalidation
}

// Strategy 5: No Cache (Dynamic)
// Best for: Personalized content, real-time data
async function getDynamicData() {
  const res = await fetch('https://api.example.com/realtime', {
    cache: 'no-store',
  })
  return res.json()
}

// NEXT.JS 15+: use cache directive
async function getCachedData() {
  'use cache'
  cacheLife('days')  // 'seconds', 'minutes', 'hours', 'days', 'weeks', 'max'
  cacheTag('my-data')
  
  return await expensiveOperation()
}
```

**Decision Matrix:**

| Strategy | Freshness | Performance | Use Case |
|----------|-----------|-------------|----------|
| Static | Low | Highest | Marketing, docs |
| ISR | Medium | High | Blogs, products |
| SWR | Medium | High | API data |
| On-Demand | High | Medium | CMS content |
| Dynamic | Highest | Lower | Personalized |

---

## 6. RENDERING PATTERNS

### 6.1 Static Rendering

**When to Use:**
- Content known at build time
- No personalization needed
- Maximum performance required

**Implementation:**

```tsx
// Automatic static rendering
export default function AboutPage() {
  return <div>Static content</div>
}

// With data fetching
export default async function BlogPage() {
  const posts = await fetch('https://api.example.com/posts', {
    cache: 'force-cache',
  }).then(r => r.json())
  
  return <PostList posts={posts} />
}

// Generate static paths
export async function generateStaticParams() {
  const posts = await getPosts()
  return posts.map((post) => ({
    slug: post.slug,
  }))
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const post = await getPost(slug)
  return <Post post={post} />
}
```

**Performance Impact:**
- TTFB: ~10-50ms (CDN cached)
- Zero runtime computation
- Best Core Web Vitals scores

---

### 6.2 Dynamic Rendering

**When to Use:**
- Personalized content
- Request-time data (cookies, headers)
- Real-time data

**Implementation:**

```tsx
// Automatic dynamic rendering when using:
import { cookies, headers } from 'next/headers'

export default async function DashboardPage() {
  const cookieStore = await cookies()  // Makes route dynamic
  const token = cookieStore.get('session')?.value
  
  const userData = await getUserData(token)
  return <Dashboard data={userData} />
}

// Force dynamic
export const dynamic = 'force-dynamic'

export default async function Page() {
  return <div>Always dynamic</div>
}

// Dynamic with searchParams
export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = await searchParams  // Makes route dynamic
  const results = await search(q)
  return <SearchResults results={results} />
}
```

**What makes a route dynamic:**
- `cookies()`, `headers()`, `connection()`
- `searchParams` in page
- `{ cache: 'no-store' }` in fetch
- `dynamic = 'force-dynamic'`

**Performance Impact:**
- TTFB: ~100-500ms (server processing)
- Fresh data on every request

---

### 6.3 PPR (Partial Prerendering)

**When to Use:**
- Pages with mixed static/dynamic content
- Personalized sections in static pages
- Best of both worlds

**Implementation:**

```tsx
// next.config.ts
const config = {
  cacheComponents: true,  // Enables PPR
}

// app/product/[id]/page.tsx
import { Suspense } from 'react'

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const product = await getProduct(id)  // Can be cached
  
  return (
    <div>
      {/* Static shell - instant */}
      <h1>{product.name}</h1>
      <p>{product.description}</p>
      
      {/* Dynamic - streams in */}
      <Suspense fallback={<PriceSkeleton />}>
        <DynamicPrice productId={id} />
      </Suspense>
      
      <Suspense fallback={<ReviewsSkeleton />}>
        <PersonalizedReviews productId={id} />
      </Suspense>
    </div>
  )
}

// Dynamic component that needs request data
async function DynamicPrice({ productId }: { productId: string }) {
  const cookieStore = await cookies()
  const region = cookieStore.get('region')?.value || 'US'
  
  const price = await getPrice(productId, region)
  return <span>${price}</span>
}
```

```tsx
// Using 'use cache' directive
async function CachedProductInfo({ id }: { id: string }) {
  'use cache'
  cacheLife('hours')
  
  const product = await db.products.findUnique({ where: { id } })
  return <div>{product.name}</div>
}
```

**Performance Impact:**
- Static shell: ~10-50ms
- Dynamic content streams progressively
- Best perceived performance

---

### 6.4 Streaming SSR

**When to Use:**
- Slow data sources
- Prioritizing content display
- Progressive enhancement

**Implementation:**

```tsx
// Streaming with Suspense
import { Suspense } from 'react'

export default function Page() {
  return (
    <div>
      {/* Instant */}
      <Header />
      
      {/* Stream 1 */}
      <Suspense fallback={<MainSkeleton />}>
        <MainContent />
      </Suspense>
      
      {/* Stream 2 - independent */}
      <Suspense fallback={<SidebarSkeleton />}>
        <Sidebar />
      </Suspense>
      
      {/* Instant */}
      <Footer />
    </div>
  )
}

// Nested streaming for waterfall optimization
async function MainContent() {
  const basicData = await getBasicData()  // Fast
  
  return (
    <div>
      <h1>{basicData.title}</h1>
      
      <Suspense fallback={<DetailsSkeleton />}>
        <Details dataId={basicData.id} />
      </Suspense>
    </div>
  )
}
```

```tsx
// loading.tsx for route-level streaming
// app/dashboard/loading.tsx
export default function Loading() {
  return (
    <div className="dashboard-skeleton">
      <div className="header-skeleton" />
      <div className="content-skeleton" />
    </div>
  )
}
```

**Performance Impact:**
- TTFB: Same as static (shell)
- FCP: Dramatically improved
- LCP: Depends on content priority

---

### 6.5 ISR (Incremental Static Regeneration)

**When to Use:**
- Content that changes periodically
- High traffic pages
- Can tolerate slight staleness

**Implementation:**

```tsx
// Time-based ISR
export const revalidate = 60  // Revalidate every 60 seconds

export default async function BlogPost({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const post = await getPost(slug)
  
  return <Article post={post} />
}

// On-demand ISR
// app/api/revalidate/route.ts
import { revalidatePath, revalidateTag } from 'next/cache'

export async function POST(request: Request) {
  const { path, tag, secret } = await request.json()
  
  if (secret !== process.env.REVALIDATION_SECRET) {
    return Response.json({ error: 'Invalid secret' }, { status: 401 })
  }
  
  if (path) {
    revalidatePath(path)
  }
  if (tag) {
    revalidateTag(tag)
  }
  
  return Response.json({ revalidated: true, now: Date.now() })
}

// Webhook handler for CMS
// app/api/webhook/route.ts
export async function POST(request: Request) {
  const payload = await request.json()
  
  // Contentful webhook
  if (payload.sys?.contentType?.sys?.id === 'blogPost') {
    revalidateTag('blog-posts')
    revalidatePath(`/blog/${payload.fields.slug}`)
  }
  
  return Response.json({ success: true })
}
```

**Performance Impact:**
- First request: Static (cached)
- After revalidate: Background regeneration
- Stale-while-revalidate behavior

---

## 7. PERFORMANCE PATTERNS

### 7.1 Code Splitting

**When to Use:**
- Large applications
- Route-based splitting (automatic)
- Component-based splitting (manual)

**Implementation:**

```tsx
// Automatic route-based splitting
// Each page.tsx is automatically code-split

// Manual component splitting with dynamic import
import dynamic from 'next/dynamic'

// Load only when needed
const HeavyChart = dynamic(() => import('@/components/heavy-chart'), {
  loading: () => <ChartSkeleton />,
})

// Disable SSR for client-only components
const ClientOnlyEditor = dynamic(
  () => import('@/components/rich-editor'),
  { ssr: false }
)

// Named exports
const Modal = dynamic(() => 
  import('@/components/modals').then(mod => mod.Modal)
)

export default function DashboardPage() {
  return (
    <div>
      <h1>Dashboard</h1>
      <HeavyChart />
      <ClientOnlyEditor />
    </div>
  )
}
```

**Performance Impact:**
- Initial bundle: 30-70% smaller
- Route chunks: ~50-200KB each
- Lazy components: Load on demand

---

### 7.2 Lazy Loading

**When to Use:**
- Below-the-fold content
- Modal content
- Heavy components

**Implementation:**

```tsx
// Lazy load with Suspense
import { lazy, Suspense } from 'react'

const LazyComponent = lazy(() => import('./lazy-component'))

export default function Page() {
  return (
    <Suspense fallback={<Skeleton />}>
      <LazyComponent />
    </Suspense>
  )
}

// Intersection Observer pattern
'use client'

import { useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'

const HeavyComponent = dynamic(() => import('./heavy-component'))

export function LazySection() {
  const ref = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { rootMargin: '100px' }
    )
    
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])
  
  return (
    <div ref={ref}>
      {isVisible ? <HeavyComponent /> : <Placeholder />}
    </div>
  )
}
```

**Performance Impact:**
- Reduced initial JavaScript
- Faster TTI (Time to Interactive)
- Better LCP for above-fold content

---

### 7.3 Image Optimization

**When to Use:**
- All images (always use next/image)
- Responsive images
- Lazy loading images

**Implementation:**

```tsx
import Image from 'next/image'

// Local image (auto-optimized)
import profilePic from './profile.png'

export function LocalImage() {
  return (
    <Image
      src={profilePic}
      alt="Profile"
      // width/height automatically inferred
      placeholder="blur"  // Auto-generated blur
      priority={false}    // Lazy load by default
    />
  )
}

// Remote image
export function RemoteImage() {
  return (
    <Image
      src="https://example.com/image.jpg"
      alt="Remote"
      width={800}
      height={600}
      sizes="(max-width: 768px) 100vw, 50vw"
    />
  )
}

// Fill container
export function FillImage() {
  return (
    <div style={{ position: 'relative', width: '100%', height: '400px' }}>
      <Image
        src="/hero.jpg"
        alt="Hero"
        fill
        style={{ objectFit: 'cover' }}
        priority  // Above-fold: disable lazy loading
      />
    </div>
  )
}

// next.config.ts - Remote patterns
const config = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.example.com',
        pathname: '/uploads/**',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
}
```

**Performance Impact:**
- WebP/AVIF: 25-50% smaller than JPEG
- Lazy loading: Reduced initial payload
- Responsive: Appropriate size per device
- CLS: Zero layout shift

---

### 7.4 Font Optimization

**When to Use:**
- Custom fonts (Google, local)
- Preventing FOUT/FOIT
- Self-hosting fonts

**Implementation:**

```tsx
// app/layout.tsx
import { Inter, Roboto_Mono } from 'next/font/google'

// Variable font (recommended)
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

// Static font with specific weights
const robotoMono = Roboto_Mono({
  subsets: ['latin'],
  weight: ['400', '700'],
  display: 'swap',
  variable: '--font-roboto-mono',
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${robotoMono.variable}`}>
      <body className={inter.className}>{children}</body>
    </html>
  )
}

// Local fonts
import localFont from 'next/font/local'

const customFont = localFont({
  src: [
    {
      path: './fonts/CustomFont-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: './fonts/CustomFont-Bold.woff2',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-custom',
})
```

```css
/* globals.css */
:root {
  --font-sans: var(--font-inter);
  --font-mono: var(--font-roboto-mono);
}

body {
  font-family: var(--font-sans);
}

code {
  font-family: var(--font-mono);
}
```

**Performance Impact:**
- Self-hosted: No external requests
- `display: swap`: No FOIT
- Subset: Reduced font size
- Preloaded: No layout shift

---

### 7.5 Script Optimization

**When to Use:**
- Third-party scripts (analytics, widgets)
- Controlling script loading strategy
- Preventing render-blocking

**Implementation:**

```tsx
// app/layout.tsx
import Script from 'next/script'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        {children}
        
        {/* After page interactive */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=GA_ID"
          strategy="afterInteractive"
        />
        
        {/* Inline script after interactive */}
        <Script id="gtag-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'GA_ID');
          `}
        </Script>
        
        {/* Load when browser is idle */}
        <Script
          src="https://widget.example.com/widget.js"
          strategy="lazyOnload"
        />
        
        {/* Before page interactive (use sparingly) */}
        <Script
          src="https://critical.example.com/script.js"
          strategy="beforeInteractive"
        />
      </body>
    </html>
  )
}
```

```tsx
// Component-level script
'use client'

import Script from 'next/script'

export function ChatWidget() {
  return (
    <>
      <Script
        src="https://chat.example.com/widget.js"
        strategy="lazyOnload"
        onLoad={() => {
          console.log('Chat widget loaded')
        }}
      />
      <div id="chat-widget" />
    </>
  )
}
```

**Strategies:**
- `beforeInteractive`: Critical scripts (rare)
- `afterInteractive`: Analytics, tracking (default)
- `lazyOnload`: Non-critical widgets
- `worker`: Web Worker (experimental)

**Performance Impact:**
- `lazyOnload`: Zero impact on TTI
- `afterInteractive`: Minimal impact
- `beforeInteractive`: Can block rendering

---

### 7.6 Bundle Analysis

**When to Use:**
- Identifying large dependencies
- Optimizing bundle size
- Finding duplicate code

**Implementation:**

```bash
# Install analyzer
npm install @next/bundle-analyzer
```

```tsx
// next.config.ts
import bundleAnalyzer from '@next/bundle-analyzer'

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})

const config = {
  // ... other config
}

export default withBundleAnalyzer(config)
```

```bash
# Run analysis
ANALYZE=true npm run build
```

```tsx
// Optimizing imports
// Bad - imports entire library
import { format } from 'date-fns'

// Good - tree-shakeable import
import format from 'date-fns/format'

// Using optimizePackageImports
// next.config.ts
const config = {
  experimental: {
    optimizePackageImports: ['lucide-react', '@heroicons/react'],
  },
}
```

**Performance Impact:**
- Identify 30-50% potential reduction
- Find duplicate dependencies
- Optimize tree-shaking

---

## 8. SEO PATTERNS

### 8.1 Metadata API

**When to Use:**
- Page titles and descriptions
- Open Graph data
- Twitter cards
- Robots directives

**Implementation:**

```tsx
// Static metadata
// app/about/page.tsx
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About Us',
  description: 'Learn about our company',
  keywords: ['about', 'company', 'team'],
  authors: [{ name: 'Company Name' }],
  creator: 'Company Name',
  publisher: 'Company Name',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: 'About Us',
    description: 'Learn about our company',
    url: 'https://example.com/about',
    siteName: 'Company Name',
    images: [
      {
        url: 'https://example.com/og-about.jpg',
        width: 1200,
        height: 630,
        alt: 'About Us',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About Us',
    description: 'Learn about our company',
    images: ['https://example.com/og-about.jpg'],
    creator: '@company',
  },
}

export default function AboutPage() {
  return <div>About content</div>
}
```

```tsx
// Dynamic metadata
// app/blog/[slug]/page.tsx
import type { Metadata, ResolvingMetadata } from 'next'

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { slug } = await params
  const post = await getPost(slug)
  
  const previousImages = (await parent).openGraph?.images || []
  
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: [post.image, ...previousImages],
      type: 'article',
      publishedTime: post.publishedAt,
      authors: [post.author.name],
    },
  }
}

export default async function BlogPost({ params }: Props) {
  const { slug } = await params
  const post = await getPost(slug)
  return <Article post={post} />
}
```

```tsx
// Root layout with template
// app/layout.tsx
export const metadata: Metadata = {
  metadataBase: new URL('https://example.com'),
  title: {
    default: 'Company Name',
    template: '%s | Company Name',
  },
  description: 'Default description',
}
```

**Performance Impact:**
- Metadata is static when possible
- Dynamic metadata can be streamed
- No impact on runtime performance

---

### 8.2 OpenGraph Images

**When to Use:**
- Social media sharing
- Dynamic OG images
- Brand consistency

**Implementation:**

```tsx
// app/opengraph-image.tsx - Static OG image
import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Site Name'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 128,
          background: 'white',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        Site Name
      </div>
    ),
    { ...size }
  )
}
```

```tsx
// app/blog/[slug]/opengraph-image.tsx - Dynamic OG image
import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Blog Post'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const post = await getPost(slug)
  
  // Load font
  const interBold = fetch(
    new URL('./Inter-Bold.ttf', import.meta.url)
  ).then((res) => res.arrayBuffer())
  
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#1a1a1a',
          padding: 40,
        }}
      >
        <div
          style={{
            fontSize: 60,
            fontWeight: 'bold',
            color: 'white',
            textAlign: 'center',
            maxWidth: '80%',
          }}
        >
          {post.title}
        </div>
        <div
          style={{
            fontSize: 30,
            color: '#888',
            marginTop: 20,
          }}
        >
          {post.author.name}
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: 'Inter',
          data: await interBold,
          weight: 700,
        },
      ],
    }
  )
}
```

**File naming:**
- `opengraph-image.tsx` - OG image
- `twitter-image.tsx` - Twitter image
- `icon.tsx` - Favicon

**Performance Impact:**
- Generated at build time when static
- Edge runtime for dynamic: ~50-200ms
- Cached after generation

---

### 8.3 Sitemap

**When to Use:**
- Search engine discovery
- Large sites with many pages
- Dynamic content

**Implementation:**

```tsx
// app/sitemap.ts - Static sitemap
import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://example.com',
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 1,
    },
    {
      url: 'https://example.com/about',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: 'https://example.com/blog',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.5,
    },
  ]
}
```

```tsx
// app/sitemap.ts - Dynamic sitemap
import type { MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await db.posts.findMany({
    select: { slug: true, updatedAt: true },
  })
  
  const postUrls = posts.map((post) => ({
    url: `https://example.com/blog/${post.slug}`,
    lastModified: post.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))
  
  return [
    {
      url: 'https://example.com',
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 1,
    },
    ...postUrls,
  ]
}
```

```tsx
// Multiple sitemaps for large sites
// app/sitemap.ts
export async function generateSitemaps() {
  const totalPosts = await db.posts.count()
  const sitemapCount = Math.ceil(totalPosts / 50000)
  
  return Array.from({ length: sitemapCount }, (_, i) => ({ id: i }))
}

export default async function sitemap({
  id,
}: {
  id: number
}): Promise<MetadataRoute.Sitemap> {
  const start = id * 50000
  const posts = await db.posts.findMany({
    skip: start,
    take: 50000,
    select: { slug: true, updatedAt: true },
  })
  
  return posts.map((post) => ({
    url: `https://example.com/blog/${post.slug}`,
    lastModified: post.updatedAt,
  }))
}
// Generates: /sitemap/0.xml, /sitemap/1.xml, etc.
```

```tsx
// app/robots.ts
import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/private/', '/api/'],
    },
    sitemap: 'https://example.com/sitemap.xml',
  }
}
```

**Performance Impact:**
- Static sitemap: Built once
- Dynamic sitemap: Generated on request
- Consider caching for large sitemaps

---

### 8.4 Structured Data (JSON-LD)

**When to Use:**
- Rich search results
- Product information
- Articles, events, organizations
- Breadcrumbs

**Implementation:**

```tsx
// app/components/structured-data.tsx
export function ArticleJsonLd({
  title,
  description,
  publishedTime,
  modifiedTime,
  author,
  image,
  url,
}: {
  title: string
  description: string
  publishedTime: string
  modifiedTime: string
  author: { name: string; url: string }
  image: string
  url: string
}) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description: description,
    image: image,
    datePublished: publishedTime,
    dateModified: modifiedTime,
    author: {
      '@type': 'Person',
      name: author.name,
      url: author.url,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Company Name',
      logo: {
        '@type': 'ImageObject',
        url: 'https://example.com/logo.png',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}

// Usage in page
export default async function BlogPost({ params }: Props) {
  const { slug } = await params
  const post = await getPost(slug)
  
  return (
    <>
      <ArticleJsonLd
        title={post.title}
        description={post.excerpt}
        publishedTime={post.publishedAt}
        modifiedTime={post.updatedAt}
        author={post.author}
        image={post.image}
        url={`https://example.com/blog/${slug}`}
      />
      <article>{post.content}</article>
    </>
  )
}
```

```tsx
// Product structured data
export function ProductJsonLd({
  name,
  description,
  image,
  price,
  currency,
  availability,
  rating,
  reviewCount,
}: ProductProps) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name,
    description,
    image,
    offers: {
      '@type': 'Offer',
      price,
      priceCurrency: currency,
      availability: `https://schema.org/${availability}`,
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: rating,
      reviewCount,
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}
```

```tsx
// Breadcrumb structured data
export function BreadcrumbJsonLd({
  items,
}: {
  items: { name: string; url: string }[]
}) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}
```

**Performance Impact:**
- Zero runtime cost (static JSON)
- Improves CTR from search results
- Enables rich snippets

---

## 9. TESTING PATTERNS

### 9.1 Unit Testing

**When to Use:**
- Testing individual functions
- Testing utility modules
- Testing hooks

**Dependencies:**
```json
{
  "devDependencies": {
    "vitest": "^1.0.0",
    "@testing-library/react": "^14.0.0",
    "@testing-library/jest-dom": "^6.0.0"
  }
}
```

**Implementation:**

```tsx
// vitest.config.ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    globals: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
})

// vitest.setup.ts
import '@testing-library/jest-dom'
```

```tsx
// lib/utils.test.ts
import { describe, it, expect } from 'vitest'
import { formatPrice, slugify } from './utils'

describe('formatPrice', () => {
  it('formats USD correctly', () => {
    expect(formatPrice(1234.56, 'USD')).toBe('$1,234.56')
  })

  it('formats EUR correctly', () => {
    expect(formatPrice(1234.56, 'EUR')).toBe('1.234,56 EUR')
  })
})

describe('slugify', () => {
  it('converts spaces to hyphens', () => {
    expect(slugify('Hello World')).toBe('hello-world')
  })

  it('removes special characters', () => {
    expect(slugify('Hello! World?')).toBe('hello-world')
  })
})
```

```tsx
// components/button.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from './button'

describe('Button', () => {
  it('renders correctly', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button')).toHaveTextContent('Click me')
  })

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>Click me</Button>)
    
    fireEvent.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Click me</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
  })
})
```

**Performance Impact:**
- Fast feedback loop (~1-10ms per test)
- Run frequently during development

---

### 9.2 Integration Testing

**When to Use:**
- Testing component interactions
- Testing data flow
- Testing form submissions

**Implementation:**

```tsx
// __tests__/integration/checkout.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CheckoutPage } from '@/app/checkout/page'

// Mock server actions
vi.mock('@/app/actions', () => ({
  submitOrder: vi.fn().mockResolvedValue({ success: true, orderId: '123' }),
}))

describe('Checkout Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('completes checkout successfully', async () => {
    const user = userEvent.setup()
    render(<CheckoutPage />)
    
    // Fill form
    await user.type(screen.getByLabelText('Email'), 'test@example.com')
    await user.type(screen.getByLabelText('Card Number'), '4242424242424242')
    await user.type(screen.getByLabelText('Expiry'), '12/25')
    await user.type(screen.getByLabelText('CVC'), '123')
    
    // Submit
    await user.click(screen.getByRole('button', { name: 'Place Order' }))
    
    // Verify
    await waitFor(() => {
      expect(screen.getByText('Order Confirmed!')).toBeInTheDocument()
    })
  })

  it('shows validation errors', async () => {
    const user = userEvent.setup()
    render(<CheckoutPage />)
    
    // Submit without filling form
    await user.click(screen.getByRole('button', { name: 'Place Order' }))
    
    await waitFor(() => {
      expect(screen.getByText('Email is required')).toBeInTheDocument()
    })
  })
})
```

```tsx
// Testing with React Server Components mock
// __tests__/integration/blog.test.tsx
import { describe, it, expect, vi } from 'vitest'

// Mock database
vi.mock('@/lib/db', () => ({
  db: {
    posts: {
      findMany: vi.fn().mockResolvedValue([
        { id: '1', title: 'Post 1', slug: 'post-1' },
        { id: '2', title: 'Post 2', slug: 'post-2' },
      ]),
    },
  },
}))

describe('Blog Page', () => {
  it('renders posts from database', async () => {
    // For async Server Components, use E2E testing instead
    // This is a simplified example
    const { db } = await import('@/lib/db')
    const posts = await db.posts.findMany()
    
    expect(posts).toHaveLength(2)
    expect(posts[0].title).toBe('Post 1')
  })
})
```

**Performance Impact:**
- ~10-100ms per test
- Good balance of coverage and speed

---

### 9.3 E2E Testing

**When to Use:**
- Full user flows
- Critical paths (checkout, auth)
- Testing Server Components
- Cross-browser testing

**Dependencies:**
```json
{
  "devDependencies": {
    "@playwright/test": "^1.40.0"
  }
}
```

**Implementation:**

```tsx
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
})
```

```tsx
// e2e/auth.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Authentication', () => {
  test('can sign up new user', async ({ page }) => {
    await page.goto('/signup')
    
    await page.fill('[name="email"]', 'newuser@example.com')
    await page.fill('[name="password"]', 'SecurePassword123!')
    await page.fill('[name="confirmPassword"]', 'SecurePassword123!')
    
    await page.click('button[type="submit"]')
    
    await expect(page).toHaveURL('/dashboard')
    await expect(page.locator('h1')).toContainText('Welcome')
  })

  test('shows error for invalid credentials', async ({ page }) => {
    await page.goto('/login')
    
    await page.fill('[name="email"]', 'wrong@example.com')
    await page.fill('[name="password"]', 'wrongpassword')
    
    await page.click('button[type="submit"]')
    
    await expect(page.locator('.error')).toContainText('Invalid credentials')
  })
})
```

```tsx
// e2e/checkout.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Checkout Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto('/login')
    await page.fill('[name="email"]', 'test@example.com')
    await page.fill('[name="password"]', 'password')
    await page.click('button[type="submit"]')
    await page.waitForURL('/dashboard')
  })

  test('complete purchase flow', async ({ page }) => {
    // Add item to cart
    await page.goto('/products/test-product')
    await page.click('button:has-text("Add to Cart")')
    
    // Go to cart
    await page.click('[data-testid="cart-icon"]')
    await expect(page.locator('.cart-item')).toHaveCount(1)
    
    // Checkout
    await page.click('button:has-text("Checkout")')
    
    // Fill payment
    await page.fill('[name="cardNumber"]', '4242424242424242')
    await page.fill('[name="expiry"]', '12/25')
    await page.fill('[name="cvc"]', '123')
    
    // Complete order
    await page.click('button:has-text("Place Order")')
    
    await expect(page).toHaveURL(/\/orders\//)
    await expect(page.locator('h1')).toContainText('Order Confirmed')
  })
})
```

```tsx
// e2e/visual.spec.ts - Visual regression testing
import { test, expect } from '@playwright/test'

test('homepage visual regression', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveScreenshot('homepage.png', {
    fullPage: true,
  })
})

test('product page visual regression', async ({ page }) => {
  await page.goto('/products/test-product')
  await page.waitForLoadState('networkidle')
  
  await expect(page).toHaveScreenshot('product-page.png')
})
```

**Running Tests:**
```bash
# Run all E2E tests
npx playwright test

# Run specific test file
npx playwright test e2e/auth.spec.ts

# Run in UI mode
npx playwright test --ui

# Update snapshots
npx playwright test --update-snapshots
```

**Performance Impact:**
- ~1-10 seconds per test
- Run on CI for critical paths
- Consider parallelization

---

## 10. DEPLOYMENT PATTERNS

### 10.1 Vercel Deployment

**When to Use:**
- Production Next.js apps
- Automatic previews
- Edge functions
- Optimal performance

**Implementation:**

```tsx
// vercel.json (optional - most config via dashboard)
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "regions": ["iad1", "sfo1"],  // Multi-region
  "crons": [
    {
      "path": "/api/cron/daily",
      "schedule": "0 0 * * *"
    }
  ]
}
```

```tsx
// Environment variables setup
// .env.local (local development)
DATABASE_URL="postgresql://..."
NEXT_PUBLIC_API_URL="http://localhost:3000"

// Set in Vercel dashboard for production:
// - DATABASE_URL (encrypted)
// - NEXT_PUBLIC_API_URL
// - JWT_SECRET
// - etc.
```

```tsx
// next.config.ts for Vercel optimization
const config = {
  images: {
    domains: ['images.example.com'],
    loader: 'default',  // Uses Vercel Image Optimization
  },
  
  // Serverless function configuration
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
}
```

```bash
# Deployment commands
# Via Git (recommended)
git push origin main  # Auto-deploys

# Via CLI
npm i -g vercel
vercel  # Preview deployment
vercel --prod  # Production deployment
```

```tsx
// Monitoring with Vercel Analytics
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
```

**Dependencies:**
```json
{
  "devDependencies": {
    "@vercel/analytics": "^1.0.0",
    "@vercel/speed-insights": "^1.0.0"
  }
}
```

**Feature Support:**

| Feature | Vercel Support |
|---------|---------------|
| Server Components | Full |
| Server Actions | Full |
| Streaming | Full |
| PPR | Full |
| ISR | Full |
| Image Optimization | Full |
| Edge Runtime | Full |
| Cron Jobs | Full |

**Performance Impact:**
- Global CDN: ~20-50ms TTFB
- Edge Functions: ~1-10ms cold start
- Automatic cache optimization
- Zero-config scaling

---

## Quick Reference: Next.js 15 Breaking Changes

### 1. Async Request APIs
```tsx
// OLD (Next.js 14)
export default function Page({ params, searchParams }) {
  const { id } = params  // Sync access
  const { q } = searchParams
}

// NEW (Next.js 15)
export default async function Page({ params, searchParams }) {
  const { id } = await params  // Must await
  const { q } = await searchParams
}
```

### 2. Caching Defaults
```tsx
// OLD (Next.js 14) - Cached by default
fetch('https://api.example.com/data')

// NEW (Next.js 15) - NOT cached by default
fetch('https://api.example.com/data')  // Uncached
fetch('https://api.example.com/data', { cache: 'force-cache' })  // Cached
```

### 3. Route Handlers
```tsx
// OLD (Next.js 14) - GET cached by default
export async function GET() { ... }

// NEW (Next.js 15) - NOT cached by default
export async function GET() { ... }  // Uncached
export const dynamic = 'force-static'  // To cache
```

### 4. Middleware Renamed to Proxy
```tsx
// OLD: middleware.ts
export function middleware(request) { ... }

// NEW: proxy.ts
export function proxy(request) { ... }
```

### 5. Cookies API
```tsx
// OLD (Next.js 14)
const cookieStore = cookies()
const token = cookieStore.get('token')

// NEW (Next.js 15)
const cookieStore = await cookies()  // Must await
const token = cookieStore.get('token')
```

### 6. Headers API
```tsx
// OLD (Next.js 14)
const headersList = headers()

// NEW (Next.js 15)
const headersList = await headers()  // Must await
```

---

## Migration Codemod

```bash
# Run the official migration codemod
npx @next/codemod@canary upgrade latest

# Specific codemods
npx @next/codemod@canary next-async-request-api .
npx @next/codemod@canary middleware-to-proxy .
```

---

## Recommended Reading Order

1. **Start Here**: Routing Patterns (1.1-1.6)
2. **Core Concepts**: Data Patterns (2.1-2.8)
3. **State Management**: State Patterns (3.1-3.5)
4. **Security**: Auth Patterns (4.1-4.5)
5. **Optimization**: Caching (5.1-5.5) + Performance (7.1-7.6)
6. **Advanced**: Rendering (6.1-6.5)
7. **Production**: SEO (8.1-8.4) + Testing (9.1-9.3) + Deployment (10.1)
