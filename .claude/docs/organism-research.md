# Next.js 15 Organism-Level Component Research

## Executive Summary

This document provides comprehensive research on 32 essential organism-level components for top-tier Next.js 15 sites. Organisms are complex feature blocks that combine multiple molecules and atoms to create functional UI sections.

---

## NAVIGATION ORGANISMS (6)

### 1. Header

**Internal Structure:**
- Logo (Atom) - Brand identity, clickable to home
- Navigation Menu (Molecule) - Primary nav links
- NavigationMenuTrigger + NavigationMenuContent (for mega dropdowns)
- Search/Command Trigger (Molecule) - Cmd+K shortcut indicator
- User Menu/Avatar (Molecule) - Auth state indicator
- Theme Toggle (Atom) - Light/dark mode
- CTA Button (Atom) - Primary action
- Mobile Menu Trigger (Atom) - Hamburger icon

**State Management:**
```typescript
interface HeaderState {
  isScrolled: boolean;          // For background change on scroll
  isMobileMenuOpen: boolean;    // Mobile navigation state
  activeDropdown: string | null; // Current open dropdown
  isSearchOpen: boolean;        // Command palette state
  user: User | null;            // Authentication state
}
```

**Data Requirements:**
```typescript
interface HeaderProps {
  logo: { src: string; alt: string; href: string };
  navigation: NavigationItem[];
  cta?: { label: string; href: string };
  user?: User;
  showSearch?: boolean;
  sticky?: boolean;
}

interface NavigationItem {
  label: string;
  href?: string;
  children?: NavigationItem[];
  description?: string;
  icon?: React.ComponentType;
}
```

**Variants:**
1. **Transparent** - Overlays hero, becomes solid on scroll (Vercel, Linear)
2. **Solid** - Always has background
3. **Floating** - Rounded with margin, floating effect
4. **Minimal** - Logo + hamburger only
5. **Centered** - Logo centered, nav split on sides

**Responsive Behavior:**
- Desktop: Full horizontal navigation with dropdowns
- Tablet: Condensed nav, some items collapse
- Mobile: Hamburger triggers Sheet/Drawer with full nav

**Animation Patterns:**
- Scroll-triggered background transition (opacity, backdrop-blur)
- Dropdown fade-in with subtle translateY
- Mobile menu slide from right (Sheet pattern)
- Logo hover scale
- Nav item underline animation on hover

**Best-in-Class Examples:**
- **Vercel**: Transparent header with glassmorphism on scroll, clean mega menu with product grid
- **Linear**: Minimal header with command palette integration, smooth scroll behavior
- **Stripe**: Multi-column mega menu with rich content, product illustrations

---

### 2. Footer

**Internal Structure:**
- Logo + Tagline section
- Navigation Columns (multiple SidebarGroups pattern)
- Social Links (Icon buttons)
- Newsletter Form (Input + Button)
- Legal Links (small text links)
- Copyright Notice
- Language/Region Selector
- Theme Toggle

**State Management:**
```typescript
interface FooterState {
  newsletterEmail: string;
  isSubmitting: boolean;
  subscriptionStatus: 'idle' | 'success' | 'error';
}
```

**Data Requirements:**
```typescript
interface FooterProps {
  logo: { src: string; alt: string };
  tagline?: string;
  columns: FooterColumn[];
  socialLinks: SocialLink[];
  newsletter?: NewsletterConfig;
  legal: LegalLink[];
  copyright: string;
}

interface FooterColumn {
  title: string;
  links: { label: string; href: string; badge?: string }[];
}
```

**Variants:**
1. **Multi-column** - 4-5 columns with categorized links
2. **Simple** - Single row with essential links
3. **Big** - Large footer with sitemap, social, newsletter
4. **Minimal** - Copyright + essential links only
5. **CTA Footer** - Large CTA section above standard footer

**Responsive Behavior:**
- Desktop: Multi-column grid layout
- Tablet: 2-column grid
- Mobile: Single column accordion or stacked

**Animation Patterns:**
- Fade-in on scroll into view
- Link hover underline animations
- Social icon hover color/scale

**Best-in-Class Examples:**
- **Stripe**: Comprehensive footer with product columns, gradient divider
- **Vercel**: Clean footer with status indicator, social links
- **Linear**: Minimal but complete, organized link structure

---

### 3. Sidebar

**Internal Structure (shadcn pattern):**
- SidebarProvider (Context wrapper)
- SidebarHeader (Logo, team switcher)
- SidebarContent (Scrollable area)
- SidebarGroup + SidebarGroupLabel
- SidebarMenu + SidebarMenuItem + SidebarMenuButton
- SidebarMenuSub (Nested items)
- SidebarMenuBadge (Notification counts)
- SidebarFooter (User menu)
- SidebarRail (Toggle rail)
- SidebarTrigger

**State Management:**
```typescript
interface SidebarState {
  isOpen: boolean;
  openMobile: boolean;
  collapsible: 'offcanvas' | 'icon' | 'none';
  state: 'expanded' | 'collapsed';
  activeItem: string;
  expandedGroups: string[];
}
```

**Data Requirements:**
```typescript
interface SidebarProps {
  items: SidebarItem[];
  user?: User;
  teams?: Team[];
  side?: 'left' | 'right';
  variant?: 'sidebar' | 'floating' | 'inset';
  collapsible?: 'offcanvas' | 'icon' | 'none';
}

interface SidebarItem {
  title: string;
  url?: string;
  icon?: LucideIcon;
  badge?: string | number;
  isActive?: boolean;
  items?: SidebarItem[]; // Sub-items
}
```

**Variants:**
1. **Icon-collapsible** - Collapses to icon rail (Linear, Notion)
2. **Offcanvas** - Slides completely off screen
3. **Floating** - Has gap from edge, rounded corners
4. **Inset** - Embedded within main content area
5. **Dual** - Primary + secondary sidebar

**Responsive Behavior:**
- Desktop: Persistent sidebar, collapsible via shortcut (Cmd+B)
- Mobile: Offcanvas drawer, triggered by hamburger

**Animation Patterns:**
- Width transition for collapse (200ms ease)
- Icon-only mode with tooltip on hover
- Smooth expand/collapse for nested items (Collapsible component)
- Hover state highlighting

**Best-in-Class Examples:**
- **Linear**: Icon-collapsible with keyboard shortcuts, workspace switcher
- **Notion**: Dynamic sidebar with drag-to-resize, nested pages
- **Vercel Dashboard**: Clean sidebar with project switcher

---

### 4. Mobile Menu

**Internal Structure:**
- Sheet/Drawer wrapper (slides from side)
- Close button
- Logo
- Navigation links (larger touch targets)
- Search input
- User section
- Theme toggle
- Social links

**State Management:**
```typescript
interface MobileMenuState {
  isOpen: boolean;
  activeSubmenu: string | null;
}
```

**Data Requirements:**
```typescript
interface MobileMenuProps {
  navigation: NavigationItem[];
  user?: User;
  onClose: () => void;
  isOpen: boolean;
}
```

**Variants:**
1. **Full-screen overlay** - Takes entire viewport
2. **Side sheet** - Slides from left/right (most common)
3. **Bottom drawer** - Slides from bottom
4. **Dropdown** - Expands below header

**Responsive Behavior:**
- Only visible on mobile/tablet breakpoints
- Locks body scroll when open
- Focus trap for accessibility

**Animation Patterns:**
- Slide in from right (150-200ms)
- Backdrop fade
- Staggered item animation
- Spring-based physics (Framer Motion)

**Best-in-Class Examples:**
- **Apple**: Elegant full-screen takeover with blurred background
- **Linear**: Clean slide-over with same navigation structure

---

### 5. Command Palette (Cmd+K)

**Internal Structure (shadcn Command):**
- CommandDialog (Dialog wrapper)
- CommandInput (Search input with icon)
- CommandList (Scrollable results)
- CommandEmpty (No results state)
- CommandGroup (Grouped results)
- CommandItem (Individual result)
- CommandSeparator
- CommandShortcut (Keyboard hints)

**State Management:**
```typescript
interface CommandPaletteState {
  isOpen: boolean;
  query: string;
  selectedIndex: number;
  recentSearches: string[];
  results: CommandResult[];
  isLoading: boolean;
}
```

**Data Requirements:**
```typescript
interface CommandPaletteProps {
  commands: CommandGroup[];
  onSelect: (command: Command) => void;
  recentSearches?: string[];
  placeholder?: string;
}

interface CommandGroup {
  heading: string;
  commands: Command[];
}

interface Command {
  id: string;
  label: string;
  icon?: LucideIcon;
  shortcut?: string;
  keywords?: string[];
  onSelect: () => void;
}
```

**Variants:**
1. **Navigation** - Page/route navigation
2. **Actions** - Run commands/actions
3. **Search** - Full-text search
4. **Combined** - All of the above (Linear, Vercel)

**Responsive Behavior:**
- Desktop: Modal in center
- Mobile: Full-width sheet from top or bottom

**Animation Patterns:**
- Fade + scale on open (100ms)
- Results appear with subtle stagger
- Selection highlight slides smoothly
- Exit animation faster than enter

**Best-in-Class Examples:**
- **Linear**: Comprehensive with themes, recent, all commands
- **Vercel**: Fast, clean, integrates with deployment actions
- **Raycast**: Gold standard for command palettes

---

### 6. Mega Menu

**Internal Structure:**
- NavigationMenu wrapper
- NavigationMenuTrigger (Dropdown trigger)
- NavigationMenuContent (Dropdown panel)
- NavigationMenuLink (Individual links)
- Feature cards with icons/illustrations
- CTA section

**State Management:**
```typescript
interface MegaMenuState {
  activeMenu: string | null;
  isAnimating: boolean;
}
```

**Data Requirements:**
```typescript
interface MegaMenuProps {
  items: MegaMenuItem[];
}

interface MegaMenuItem {
  trigger: string;
  featured?: {
    title: string;
    description: string;
    image?: string;
    href: string;
  };
  columns: MegaMenuColumn[];
  cta?: { label: string; href: string };
}

interface MegaMenuColumn {
  title?: string;
  links: {
    label: string;
    description?: string;
    icon?: LucideIcon;
    href: string;
    badge?: string;
  }[];
}
```

**Variants:**
1. **Simple dropdown** - Single column list
2. **Multi-column** - 2-4 columns of links
3. **Featured** - Large featured item + columns
4. **Full-width** - Spans entire viewport width
5. **Tabbed** - Tabs within dropdown

**Responsive Behavior:**
- Desktop: Hover-triggered dropdown
- Tablet/Mobile: Accordion within mobile menu

**Animation Patterns:**
- Fade + slight translateY (10px)
- Content cross-fade between items
- Pointer/caret animation following active item

**Best-in-Class Examples:**
- **Stripe**: Rich mega menu with product illustrations, organized columns
- **Vercel**: Clean mega menu with product categories
- **AWS**: Comprehensive mega menu with service categories

---

## FORM ORGANISMS (6)

### 7. Auth Form (Login/Register)

**Internal Structure:**
- Card wrapper
- Logo
- Title + Description
- Social auth buttons (Google, GitHub, etc.)
- Divider ("or continue with")
- Form fields (email, password)
- FormField + FormLabel + FormControl + FormMessage
- Remember me checkbox
- Forgot password link
- Submit button
- Footer link (Sign up / Sign in toggle)

**State Management:**
```typescript
interface AuthFormState {
  isLoading: boolean;
  errors: Record<string, string>;
  showPassword: boolean;
  rememberMe: boolean;
}
```

**Data Requirements:**
```typescript
// Using Zod schema
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  rememberMe: z.boolean().optional(),
});

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword);
```

**Variants:**
1. **Simple** - Email/password only
2. **Social-first** - Social buttons prominent
3. **Magic link** - Email-only passwordless
4. **Split-screen** - Form + marketing image
5. **Modal** - Inside dialog
6. **Two-step** - Email first, then password

**Responsive Behavior:**
- Desktop: Centered card, split-screen option
- Mobile: Full-width form, social buttons stack

**Animation Patterns:**
- Field validation shake on error
- Button loading spinner
- Success checkmark animation
- Form transition between login/register

**Best-in-Class Examples:**
- **Vercel**: Clean split-screen with CLI animation
- **Linear**: Minimal with magic link option
- **Clerk**: Comprehensive with social options

---

### 8. Contact Form

**Internal Structure:**
- Form wrapper
- Name field (Input)
- Email field (Input)
- Subject/Topic (Select)
- Message (Textarea)
- File attachment (optional)
- Submit button
- Success/Error toast

**State Management:**
```typescript
interface ContactFormState {
  formData: ContactFormData;
  isSubmitting: boolean;
  errors: Record<string, string>;
  submitStatus: 'idle' | 'success' | 'error';
}
```

**Data Requirements:**
```typescript
const contactSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  subject: z.enum(['general', 'support', 'sales', 'other']),
  message: z.string().min(10).max(1000),
  attachments: z.array(z.instanceof(File)).optional(),
});
```

**Variants:**
1. **Simple** - Name, email, message
2. **Detailed** - With company, phone, subject
3. **Support ticket** - With priority, category
4. **Split** - Form + contact info sidebar
5. **Chatbot-style** - Conversational flow

**Animation Patterns:**
- Field focus ring animation
- Character count indicator
- Submit button loading state
- Success animation (checkmark)

---

### 9. Checkout Form

**Internal Structure:**
- Stepper/Progress indicator
- Billing Information section
  - Name, Email, Phone
  - Address fields
- Payment section
  - Card input (Stripe Elements pattern)
  - Saved cards
  - Payment method selector
- Order summary sidebar
- Terms checkbox
- Submit button with total

**State Management:**
```typescript
interface CheckoutState {
  step: 'information' | 'shipping' | 'payment';
  billingInfo: BillingInfo;
  shippingInfo: ShippingInfo;
  paymentMethod: PaymentMethod;
  savedCards: SavedCard[];
  isProcessing: boolean;
  errors: Record<string, string>;
}
```

**Data Requirements:**
```typescript
interface CheckoutProps {
  items: CartItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  savedAddresses?: Address[];
  savedCards?: SavedCard[];
}

const checkoutSchema = z.object({
  email: z.string().email(),
  firstName: z.string(),
  lastName: z.string(),
  address: z.string(),
  city: z.string(),
  state: z.string(),
  zip: z.string(),
  country: z.string(),
  cardNumber: z.string(),
  expiry: z.string(),
  cvc: z.string(),
});
```

**Variants:**
1. **Single page** - All sections visible
2. **Multi-step** - Wizard with steps
3. **Side-by-side** - Form + summary
4. **Accordion** - Collapsible sections

**Animation Patterns:**
- Step transition slide
- Card flip for payment
- Loading overlay during processing
- Success confetti animation

**Best-in-Class Examples:**
- **Stripe Checkout**: Clean, optimized conversion
- **Shopify**: Clear step progression
- **Apple**: Single-page elegance

---

### 10. Settings Form

**Internal Structure:**
- Tabs or sidebar navigation
- Section headers
- Form groups with labels
- Various input types (Input, Select, Switch, Slider)
- Save button (per section or global)
- Danger zone (account deletion)

**State Management:**
```typescript
interface SettingsState {
  activeSection: string;
  formData: SettingsData;
  isDirty: boolean;
  isSaving: boolean;
  errors: Record<string, string>;
}
```

**Data Requirements:**
```typescript
interface SettingsProps {
  sections: SettingsSection[];
  initialValues: SettingsData;
  onSave: (section: string, data: Partial<SettingsData>) => Promise<void>;
}

interface SettingsSection {
  id: string;
  label: string;
  description?: string;
  icon?: LucideIcon;
  fields: SettingsField[];
}
```

**Variants:**
1. **Tabbed** - Horizontal tabs
2. **Sidebar** - Vertical navigation
3. **Accordion** - Collapsible sections
4. **Single page** - Scrollable sections

**Best-in-Class Examples:**
- **GitHub**: Clean tabbed interface
- **Linear**: Sidebar navigation with sections
- **Notion**: Comprehensive with good UX

---

### 11. Multi-step Form (Wizard)

**Internal Structure:**
- Progress indicator (Stepper)
- Step content area
- Navigation buttons (Back/Next)
- Step validation
- Summary step
- Submit button

**State Management:**
```typescript
interface WizardState {
  currentStep: number;
  totalSteps: number;
  stepData: Record<number, StepData>;
  completedSteps: number[];
  isSubmitting: boolean;
  canGoNext: boolean;
  canGoBack: boolean;
}
```

**Data Requirements:**
```typescript
interface WizardProps {
  steps: WizardStep[];
  onComplete: (data: WizardData) => Promise<void>;
  allowSkip?: boolean;
  showProgress?: boolean;
}

interface WizardStep {
  id: string;
  title: string;
  description?: string;
  component: React.ComponentType<StepProps>;
  validation?: ZodSchema;
  optional?: boolean;
}
```

**Variants:**
1. **Linear** - Must complete in order
2. **Non-linear** - Can jump between steps
3. **Branching** - Different paths based on answers
4. **With preview** - Live preview of result

**Animation Patterns:**
- Step slide transition
- Progress bar animation
- Validation feedback
- Completion celebration

---

### 12. File Uploader

**Internal Structure:**
- Drop zone (dashed border area)
- File input (hidden)
- Upload button
- File list with previews
- Progress indicators
- Remove/Cancel buttons
- Error messages

**State Management:**
```typescript
interface FileUploaderState {
  files: UploadFile[];
  isDragging: boolean;
  uploadProgress: Record<string, number>;
  errors: Record<string, string>;
}

interface UploadFile {
  id: string;
  file: File;
  preview?: string;
  status: 'pending' | 'uploading' | 'complete' | 'error';
  progress: number;
  url?: string;
}
```

**Data Requirements:**
```typescript
interface FileUploaderProps {
  accept?: string[];
  maxFiles?: number;
  maxSize?: number;
  multiple?: boolean;
  onUpload: (files: File[]) => Promise<UploadResult[]>;
  onRemove?: (fileId: string) => void;
}
```

**Variants:**
1. **Simple** - Single file upload
2. **Multiple** - Multiple files
3. **Image gallery** - With previews
4. **Document** - File icons, no preview
5. **Avatar** - Circular crop

**Animation Patterns:**
- Drag enter/leave highlight
- Upload progress bar
- Thumbnail fade-in
- Error shake

---

## DATA DISPLAY ORGANISMS (6)

### 13. Data Table

**Internal Structure (TanStack Table pattern):**
- Table container with scroll
- TableHeader with sortable columns
- TableBody with rows
- Checkbox column for selection
- Action column with dropdown
- Pagination controls
- Filter inputs
- Column visibility toggle
- Row actions menu

**State Management:**
```typescript
interface DataTableState {
  sorting: SortingState;
  columnFilters: ColumnFiltersState;
  columnVisibility: VisibilityState;
  rowSelection: Record<string, boolean>;
  pagination: {
    pageIndex: number;
    pageSize: number;
  };
  globalFilter: string;
}
```

**Data Requirements:**
```typescript
interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  pagination?: boolean;
  sorting?: boolean;
  filtering?: boolean;
  selection?: boolean;
  onRowClick?: (row: T) => void;
  isLoading?: boolean;
}

// Column definition
interface ColumnDef<T> {
  accessorKey: keyof T;
  header: string | ((props: HeaderContext) => ReactNode);
  cell?: (props: CellContext) => ReactNode;
  enableSorting?: boolean;
  enableHiding?: boolean;
  size?: number;
}
```

**Variants:**
1. **Basic** - Simple data display
2. **With selection** - Checkbox selection
3. **Expandable** - Expandable row details
4. **Editable** - Inline editing
5. **Virtual** - Virtualized for large datasets

**Responsive Behavior:**
- Desktop: Full table
- Tablet: Horizontal scroll
- Mobile: Card view or priority columns

**Animation Patterns:**
- Sort indicator rotation
- Row hover highlight
- Selection checkbox animation
- Loading skeleton shimmer

**Best-in-Class Examples:**
- **Linear**: Clean table with inline actions
- **Notion**: Database views with filters
- **Airtable**: Rich data table with views

---

### 14. Kanban Board

**Internal Structure:**
- Board container (horizontal scroll)
- Columns (drag targets)
- Column headers with count
- Cards (draggable items)
- Add card button
- Column options menu

**State Management:**
```typescript
interface KanbanState {
  columns: KanbanColumn[];
  draggedItem: KanbanItem | null;
  dragOverColumn: string | null;
}

interface KanbanColumn {
  id: string;
  title: string;
  items: KanbanItem[];
  color?: string;
}

interface KanbanItem {
  id: string;
  title: string;
  description?: string;
  assignee?: User;
  labels?: Label[];
  dueDate?: Date;
  priority?: Priority;
}
```

**Data Requirements:**
```typescript
interface KanbanProps {
  columns: KanbanColumn[];
  onDragEnd: (result: DragResult) => void;
  onAddItem: (columnId: string) => void;
  onItemClick: (item: KanbanItem) => void;
}
```

**Variants:**
1. **Basic** - Simple drag and drop
2. **Swimlanes** - Horizontal grouping
3. **With WIP limits** - Max items per column
4. **Collapsed columns** - Minimize inactive columns

**Animation Patterns:**
- Drag preview follows cursor
- Drop placeholder animation
- Card reorder animation
- Column collapse/expand

**Best-in-Class Examples:**
- **Linear**: Smooth drag-drop, keyboard shortcuts
- **Trello**: Classic kanban with rich cards
- **Notion**: Database kanban view

---

### 15. Calendar

**Internal Structure (react-day-picker pattern):**
- Calendar header (month/year navigation)
- Weekday headers
- Day grid
- Day cells with events
- Event popover/modal
- Month/year dropdowns

**State Management:**
```typescript
interface CalendarState {
  currentMonth: Date;
  selectedDate: Date | undefined;
  selectedRange: DateRange | undefined;
  events: CalendarEvent[];
  view: 'month' | 'week' | 'day';
}
```

**Data Requirements:**
```typescript
interface CalendarProps {
  mode: 'single' | 'range' | 'multiple';
  selected?: Date | DateRange | Date[];
  onSelect: (date: Date | DateRange | Date[]) => void;
  events?: CalendarEvent[];
  disabled?: Date[] | ((date: Date) => boolean);
  minDate?: Date;
  maxDate?: Date;
}

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  color?: string;
  allDay?: boolean;
}
```

**Variants:**
1. **Date picker** - Single/range selection
2. **Event calendar** - With events
3. **Booking calendar** - Availability slots
4. **Mini calendar** - Compact widget

**Animation Patterns:**
- Month transition slide
- Date selection highlight
- Event hover preview
- Range selection animation

---

### 16. Chart

**Internal Structure (Recharts pattern):**
- ChartContainer wrapper
- Chart component (BarChart, LineChart, etc.)
- CartesianGrid
- XAxis / YAxis
- ChartTooltip + ChartTooltipContent
- ChartLegend + ChartLegendContent
- Data series (Bar, Line, Area, etc.)

**State Management:**
```typescript
interface ChartState {
  activeIndex: number | null;
  hoveredSeries: string | null;
  selectedRange: DateRange | null;
  isZoomed: boolean;
}
```

**Data Requirements:**
```typescript
interface ChartProps {
  data: ChartDataPoint[];
  config: ChartConfig;
  type: 'bar' | 'line' | 'area' | 'pie' | 'radar';
  showLegend?: boolean;
  showTooltip?: boolean;
  showGrid?: boolean;
}

interface ChartConfig {
  [key: string]: {
    label: string;
    color: string;
    icon?: LucideIcon;
  };
}
```

**Variants:**
1. **Bar** - Vertical/horizontal bars
2. **Line** - Trend lines
3. **Area** - Filled area
4. **Pie/Donut** - Part of whole
5. **Radar** - Multi-axis comparison
6. **Combination** - Mixed chart types

**Animation Patterns:**
- Entry animation (bars grow, lines draw)
- Tooltip follow cursor
- Legend item toggle
- Zoom/pan interaction

**Best-in-Class Examples:**
- **Vercel Analytics**: Clean, minimal charts
- **Linear Insights**: Dashboard charts
- **Stripe Dashboard**: Financial charts

---

### 17. Timeline

**Internal Structure:**
- Timeline container (vertical/horizontal)
- Timeline items
- Timeline connectors (lines between items)
- Timeline dots/icons
- Content cards
- Date indicators

**State Management:**
```typescript
interface TimelineState {
  expandedItems: string[];
  activeItem: string | null;
}
```

**Data Requirements:**
```typescript
interface TimelineProps {
  items: TimelineItem[];
  orientation: 'vertical' | 'horizontal';
  variant: 'default' | 'alternating' | 'left' | 'right';
}

interface TimelineItem {
  id: string;
  date: Date;
  title: string;
  description?: string;
  icon?: LucideIcon;
  color?: string;
  content?: ReactNode;
}
```

**Variants:**
1. **Vertical** - Standard vertical timeline
2. **Horizontal** - Horizontal scroll
3. **Alternating** - Left/right alternating
4. **Compact** - Minimal with dots only

---

### 18. Comparison Table

**Internal Structure:**
- Table with sticky first column
- Header row with product/plan names
- Feature rows
- Check/X icons for boolean features
- Value cells for non-boolean
- Highlight for recommended option
- CTA row at bottom

**State Management:**
```typescript
interface ComparisonTableState {
  highlightedColumn: string | null;
  expandedRows: string[];
}
```

**Data Requirements:**
```typescript
interface ComparisonTableProps {
  items: ComparisonItem[];
  features: Feature[];
  highlightedItem?: string;
}

interface ComparisonItem {
  id: string;
  name: string;
  price?: string;
  description?: string;
  cta?: { label: string; href: string };
  features: Record<string, boolean | string | number>;
}
```

---

## CONTENT ORGANISMS (8)

### 19. Hero Section

**Internal Structure:**
- Background (gradient, image, video, or animation)
- Container
- Badge/Announcement (optional)
- Headline (h1)
- Subheadline/Description
- CTA buttons (primary + secondary)
- Visual (image, video, product screenshot, or 3D)
- Social proof (logos, stats)

**State Management:**
```typescript
interface HeroState {
  videoPlaying: boolean;
  activeSlide: number; // For carousel heroes
  isVisible: boolean; // For scroll animations
}
```

**Data Requirements:**
```typescript
interface HeroProps {
  badge?: { text: string; href?: string };
  headline: string;
  subheadline?: string;
  primaryCta: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
  visual?: {
    type: 'image' | 'video' | 'component';
    src?: string;
    component?: ReactNode;
  };
  logos?: { src: string; alt: string }[];
  variant: 'centered' | 'split' | 'background';
}
```

**Variants:**
1. **Centered** - Text centered, visual below
2. **Split** - Text left, visual right
3. **Background** - Visual as background
4. **Video** - Video background
5. **Animated** - With scroll animations
6. **Product** - Screenshot/demo prominent

**Animation Patterns:**
- Text fade + slide up on load
- Staggered element animation
- Parallax background
- Mouse-following gradients (Vercel style)
- 3D product rotation

**Best-in-Class Examples:**
- **Vercel**: Gradient background with animated globe
- **Linear**: Clean split layout with product screenshot
- **Stripe**: Animated code + product demo

---

### 20. Features Section

**Internal Structure:**
- Section wrapper with background
- Section header (Badge, Title, Description)
- Feature grid or list
- Feature cards with icon, title, description
- Optional visual per feature
- CTA link

**State Management:**
```typescript
interface FeaturesState {
  activeFeature: number;
  isInView: boolean;
}
```

**Data Requirements:**
```typescript
interface FeaturesProps {
  badge?: string;
  title: string;
  description?: string;
  features: Feature[];
  layout: 'grid' | 'list' | 'tabs' | 'bento';
  columns?: 2 | 3 | 4;
}

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
  image?: string;
  href?: string;
}
```

**Variants:**
1. **Grid** - 3-4 column grid
2. **List** - Vertical list with visuals
3. **Bento** - Varying size grid (Apple style)
4. **Tabs** - Tabbed feature showcase
5. **Carousel** - Swipeable cards

**Animation Patterns:**
- Scroll-triggered fade-in
- Staggered card entrance
- Icon animation on hover
- Tab content transitions

**Best-in-Class Examples:**
- **Linear**: Clean bento grid with animations
- **Vercel**: Feature tabs with screenshots
- **Stripe**: Rich feature cards with illustrations

---

### 21. Testimonials Section

**Internal Structure:**
- Section header
- Testimonial cards
- Avatar
- Quote text
- Author name and role
- Company logo
- Rating (optional)
- Navigation (carousel)

**State Management:**
```typescript
interface TestimonialsState {
  activeIndex: number;
  autoplay: boolean;
  isAnimating: boolean;
}
```

**Data Requirements:**
```typescript
interface TestimonialsProps {
  title?: string;
  testimonials: Testimonial[];
  layout: 'grid' | 'carousel' | 'masonry' | 'featured';
  autoplay?: boolean;
}

interface Testimonial {
  id: string;
  quote: string;
  author: {
    name: string;
    role: string;
    avatar?: string;
    company?: string;
    companyLogo?: string;
  };
  rating?: number;
}
```

**Variants:**
1. **Grid** - Multiple testimonials visible
2. **Carousel** - Single testimonial, swipeable
3. **Featured** - One large, smaller ones below
4. **Wall** - Social proof wall (many small)
5. **Video** - Video testimonials

**Animation Patterns:**
- Carousel slide transitions
- Quote fade-in
- Avatar zoom on hover
- Auto-rotation

**Best-in-Class Examples:**
- **Vercel**: Logo wall + quotes
- **Linear**: Clean testimonial cards
- **Stripe**: Customer story cards

---

### 22. Pricing Section

**Internal Structure:**
- Section header
- Pricing toggle (monthly/annual)
- Pricing cards
- Plan name
- Price with period
- Feature list
- CTA button
- Highlight badge (Popular/Recommended)
- Comparison table (optional)

**State Management:**
```typescript
interface PricingState {
  billingPeriod: 'monthly' | 'annual';
  selectedPlan: string | null;
}
```

**Data Requirements:**
```typescript
interface PricingProps {
  title?: string;
  description?: string;
  plans: PricingPlan[];
  showToggle?: boolean;
  showComparison?: boolean;
}

interface PricingPlan {
  id: string;
  name: string;
  description?: string;
  price: {
    monthly: number;
    annual: number;
  };
  currency: string;
  features: string[];
  cta: { label: string; href: string };
  highlighted?: boolean;
  badge?: string;
}
```

**Variants:**
1. **Cards** - Side-by-side cards
2. **Table** - Comparison table
3. **Slider** - Interactive pricing slider
4. **Tiered** - Visual tier representation

**Animation Patterns:**
- Price number animation on toggle
- Card highlight pulse
- Feature list stagger

**Best-in-Class Examples:**
- **Vercel**: Clean pricing with comparison
- **Linear**: Simple, clear pricing
- **Stripe**: Comprehensive pricing page

---

### 23. FAQ Section

**Internal Structure:**
- Section header
- Accordion items (Collapsible)
- Question (AccordionTrigger)
- Answer (AccordionContent)
- Category tabs (optional)
- Search (optional)

**State Management:**
```typescript
interface FAQState {
  openItems: string[];
  activeCategory: string;
  searchQuery: string;
}
```

**Data Requirements:**
```typescript
interface FAQProps {
  title?: string;
  items: FAQItem[];
  categories?: string[];
  searchable?: boolean;
  allowMultiple?: boolean;
}

interface FAQItem {
  id: string;
  question: string;
  answer: string | ReactNode;
  category?: string;
}
```

**Variants:**
1. **Simple** - Basic accordion
2. **Categorized** - With category tabs
3. **Searchable** - With search input
4. **Two-column** - Questions left, answers right

**Animation Patterns:**
- Smooth expand/collapse (height animation)
- Rotate chevron indicator
- Fade content on expand

---

### 24. CTA Section

**Internal Structure:**
- Background (gradient, pattern, image)
- Container
- Headline
- Description
- CTA buttons
- Optional image/illustration

**Data Requirements:**
```typescript
interface CTAProps {
  headline: string;
  description?: string;
  primaryCta: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
  variant: 'simple' | 'card' | 'split' | 'banner';
  background?: 'gradient' | 'solid' | 'image';
}
```

**Variants:**
1. **Simple** - Centered text + buttons
2. **Card** - Contained card style
3. **Split** - Text + image side by side
4. **Banner** - Full-width with pattern

---

### 25. Blog Post

**Internal Structure:**
- Article header
  - Category badge
  - Title (h1)
  - Excerpt
  - Author info (avatar, name, date)
  - Reading time
  - Share buttons
- Featured image
- Article body (prose styling)
- Table of contents (sidebar or inline)
- Author bio card
- Related posts
- Comments (optional)

**State Management:**
```typescript
interface BlogPostState {
  currentHeading: string; // For TOC highlight
  readProgress: number;
  isBookmarked: boolean;
}
```

**Data Requirements:**
```typescript
interface BlogPostProps {
  post: {
    title: string;
    excerpt: string;
    content: string; // MDX/HTML
    publishedAt: Date;
    updatedAt?: Date;
    author: Author;
    category: string;
    tags: string[];
    coverImage?: string;
    readingTime: number;
  };
  relatedPosts?: BlogPostPreview[];
}
```

---

### 26. Team Section

**Internal Structure:**
- Section header
- Team member grid
- Member cards
  - Avatar/Photo
  - Name
  - Role
  - Bio (optional)
  - Social links

**Data Requirements:**
```typescript
interface TeamProps {
  title?: string;
  description?: string;
  members: TeamMember[];
  layout: 'grid' | 'list' | 'carousel';
}

interface TeamMember {
  name: string;
  role: string;
  bio?: string;
  avatar: string;
  social?: {
    twitter?: string;
    linkedin?: string;
    github?: string;
  };
}
```

---

## COMMERCE ORGANISMS (3)

### 27. Product Card

**Internal Structure:**
- Card wrapper
- Image/Gallery
- Badge (Sale, New, etc.)
- Wishlist button
- Product name
- Price (original + sale)
- Rating stars
- Color/variant swatches
- Quick add button

**State Management:**
```typescript
interface ProductCardState {
  selectedVariant: string;
  isHovered: boolean;
  isWishlisted: boolean;
  activeImageIndex: number;
}
```

**Data Requirements:**
```typescript
interface ProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    compareAtPrice?: number;
    images: string[];
    rating?: number;
    reviewCount?: number;
    variants?: ProductVariant[];
    badge?: string;
    inStock: boolean;
  };
  onAddToCart: (productId: string, variantId?: string) => void;
  onWishlist: (productId: string) => void;
}
```

**Variants:**
1. **Minimal** - Image, name, price
2. **Standard** - With rating, quick add
3. **Detailed** - With variants, description
4. **Horizontal** - List view style

**Animation Patterns:**
- Image hover zoom/swap
- Add to cart button animation
- Wishlist heart fill
- Skeleton loading

**Best-in-Class Examples:**
- **Nike**: Clean with hover image swap
- **Apple**: Minimal, product focused
- **Shopify themes**: Various styles

---

### 28. Cart

**Internal Structure:**
- Cart header with count
- Cart items list
  - Item image
  - Item name
  - Variant info
  - Quantity selector
  - Price
  - Remove button
- Subtotal
- Discount code input
- Shipping estimate
- Checkout button

**State Management:**
```typescript
interface CartState {
  items: CartItem[];
  isOpen: boolean;
  isUpdating: boolean;
  discountCode: string;
  discountApplied?: Discount;
}

interface CartItem {
  id: string;
  productId: string;
  variantId?: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  variant?: string;
}
```

**Data Requirements:**
```typescript
interface CartProps {
  items: CartItem[];
  subtotal: number;
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onRemove: (itemId: string) => void;
  onApplyDiscount: (code: string) => void;
  onCheckout: () => void;
}
```

**Variants:**
1. **Sidebar/Sheet** - Slides from right
2. **Dropdown** - Drops from header
3. **Page** - Full cart page
4. **Mini cart** - Compact preview

**Animation Patterns:**
- Item add animation
- Quantity update feedback
- Remove item slide out
- Open/close transition

---

### 29. Checkout Summary

**Internal Structure:**
- Order items list (collapsed)
- Item thumbnails
- Subtotal
- Shipping
- Tax
- Discounts
- Total
- Secure checkout badges
- Edit cart link

**Data Requirements:**
```typescript
interface CheckoutSummaryProps {
  items: CartItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  discount?: number;
  total: number;
  currency: string;
}
```

---

## MODAL ORGANISMS (3)

### 30. Dialog

**Internal Structure (Radix pattern):**
- DialogTrigger
- DialogPortal
- DialogOverlay (backdrop)
- DialogContent
  - DialogHeader
    - DialogTitle
    - DialogDescription
  - Body content
  - DialogFooter
    - DialogClose
    - Action buttons

**State Management:**
```typescript
interface DialogState {
  isOpen: boolean;
}
// Usually controlled via open/onOpenChange props
```

**Data Requirements:**
```typescript
interface DialogProps {
  trigger?: ReactNode;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}
```

**Variants:**
1. **Alert** - Confirmation dialog
2. **Form** - Contains form
3. **Full-screen** - Mobile full-screen
4. **Nested** - Dialog within dialog

**Animation Patterns:**
- Fade + scale entrance
- Backdrop blur
- Exit animation (faster)

---

### 31. Drawer (Vaul)

**Internal Structure:**
- DrawerTrigger
- DrawerPortal
- DrawerOverlay
- DrawerContent
  - DrawerHeader + handle indicator
  - DrawerTitle
  - DrawerDescription
  - Body content
  - DrawerFooter

**State Management:**
```typescript
interface DrawerState {
  isOpen: boolean;
  snapPoint: number;
}
```

**Data Requirements:**
```typescript
interface DrawerProps {
  trigger?: ReactNode;
  title?: string;
  description?: string;
  children: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  direction?: 'top' | 'right' | 'bottom' | 'left';
  snapPoints?: number[];
}
```

**Variants:**
1. **Bottom sheet** - Mobile-style from bottom
2. **Side drawer** - From left/right
3. **Resizable** - With snap points

**Animation Patterns:**
- Spring-based slide
- Drag to dismiss
- Snap points
- Backdrop fade

**Best-in-Class Examples:**
- **iOS**: Native bottom sheet behavior
- **Google Maps**: Snap point drawer

---

### 32. Sheet

**Internal Structure:**
- SheetTrigger
- SheetPortal
- SheetOverlay
- SheetContent
  - SheetHeader
  - SheetTitle
  - SheetDescription
  - Body content
  - SheetFooter
  - SheetClose

**State Management:**
```typescript
interface SheetState {
  isOpen: boolean;
}
```

**Data Requirements:**
```typescript
interface SheetProps {
  trigger?: ReactNode;
  title?: string;
  description?: string;
  children: ReactNode;
  side: 'top' | 'right' | 'bottom' | 'left';
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}
```

**Variants:**
1. **Navigation** - Mobile nav
2. **Settings** - Side panel for settings
3. **Details** - Item detail view
4. **Filters** - Filter panel

**Animation Patterns:**
- Slide from edge
- Content fade-in
- Exit slide faster than enter

---

## Cross-Cutting Concerns

### Responsive Patterns

| Breakpoint | Tailwind | Width | Common Adaptations |
|------------|----------|-------|-------------------|
| sm | 640px | Mobile | Single column, stacked |
| md | 768px | Tablet | 2 columns, condensed nav |
| lg | 1024px | Desktop | Full layout |
| xl | 1280px | Large desktop | Max-width containers |
| 2xl | 1536px | Extra large | Wider content |

### Animation Best Practices

1. **Duration**: 150-300ms for most UI, 500ms max for complex
2. **Easing**: `ease-out` for entrances, `ease-in` for exits
3. **Stagger**: 50-100ms between items
4. **Reduce motion**: Respect `prefers-reduced-motion`

### Accessibility Requirements

- Focus management for modals
- ARIA labels and roles
- Keyboard navigation
- Screen reader announcements
- Color contrast (WCAG AA minimum)

### State Management Patterns

1. **Local state**: useState for component-specific state
2. **Context**: For organism-level shared state (SidebarProvider)
3. **URL state**: For shareable state (filters, pagination)
4. **Server state**: React Query/SWR for data fetching
5. **Form state**: react-hook-form + zod

---

## Implementation Recommendations

### Technology Stack
- **React 19** with Server Components
- **Next.js 15** App Router
- **Tailwind CSS v4** for styling
- **shadcn/ui** as component foundation
- **Radix UI** for accessible primitives
- **Framer Motion** for complex animations
- **TanStack Table** for data tables
- **react-hook-form + zod** for forms
- **Recharts** for charts
- **react-day-picker** for calendars

### File Structure
```
components/
  organisms/
    navigation/
      Header/
        Header.tsx
        Header.types.ts
        Header.stories.tsx
        use-header.ts (custom hook)
      Footer/
      Sidebar/
      ...
    forms/
      AuthForm/
      CheckoutForm/
      ...
    data-display/
      DataTable/
      Chart/
      ...
    content/
      Hero/
      Features/
      ...
    commerce/
      ProductCard/
      Cart/
      ...
    modals/
      Dialog/
      Sheet/
      ...
```

### Performance Considerations
- Lazy load heavy organisms (charts, data tables)
- Use React.memo for expensive renders
- Virtualize long lists
- Optimize images with next/image
- Code split by route
