# L3: Organisms

> Complex feature blocks combining molecules into distinct sections.

## Overview

Organisms are self-contained feature blocks that represent complete sections of a UI. They combine molecules and atoms to create functional, reusable sections.

**Key principle**: Organisms compose from molecules (L2), atoms (L1), and primitives (L0). They should be complete features that can stand alone.

## Composition Rules

```
L3 Organisms
├── composes: L0 (primitives), L1 (atoms), L2 (molecules)
└── composed by: L4, L5, L6
```

## Categories

| Category | Description | Count |
|----------|-------------|-------|
| `navigation` | Headers, footers, sidebars, menus | 6 |
| `forms` | Complete form patterns | 7 |
| `marketing` | Hero sections, features, pricing | 8 |
| `data` | Data tables, charts, dashboards | 8 |
| `commerce` | Product cards, carts, checkout | 3 |
| `overlays` | Dialogs, drawers, modals | 4 |
| `user` | User menus, notifications, activity | 8 |
| `utility` | Theme switchers, cookie consent | 6 |

## Files (50 total)

### Navigation (6)
| ID | Name | Description |
|----|------|-------------|
| `o-header` | Header | Site navigation header |
| `o-footer` | Footer | Site footer |
| `o-sidebar` | Sidebar | Dashboard sidebar |
| `o-mobile-menu` | Mobile Menu | Responsive mobile navigation |
| `o-mega-menu` | Mega Menu | Large dropdown navigation |
| `o-command-palette` | Command Palette | Cmd+K command interface |

### Forms (7)
| ID | Name | Description |
|----|------|-------------|
| `o-auth-form` | Auth Form | Login/signup forms |
| `o-contact-form` | Contact Form | Contact inquiry form |
| `o-multi-step-form` | Multi-Step Form | Wizard form |
| `o-file-uploader` | File Uploader | File upload interface |
| `o-checkout-form` | Checkout Form | Payment form |
| `o-settings-form` | Settings Form | User settings |
| `o-review-form` | Review Form | Product review form |

### Marketing (8)
| ID | Name | Description |
|----|------|-------------|
| `o-hero` | Hero | Landing page hero |
| `o-features` | Features | Feature showcase |
| `o-pricing` | Pricing | Pricing tables |
| `o-testimonials` | Testimonials | Customer testimonials |
| `o-faq` | FAQ | FAQ accordion |
| `o-cta` | CTA | Call-to-action section |
| `o-blog-post` | Blog Post | Blog article display |
| `o-team` | Team | Team member showcase |

### Data (8)
| ID | Name | Description |
|----|------|-------------|
| `o-data-table` | Data Table | Advanced data table |
| `o-kanban-board` | Kanban Board | Drag-and-drop board |
| `o-calendar` | Calendar | Calendar view |
| `o-chart` | Chart | Data visualization |
| `o-timeline` | Timeline | Event timeline |
| `o-comparison-table` | Comparison Table | Feature comparison |
| `o-invoice-table` | Invoice Table | Invoice display |
| `o-stats-dashboard` | Stats Dashboard | Statistics overview |

### Commerce (3)
| ID | Name | Description |
|----|------|-------------|
| `o-product-card` | Product Card | E-commerce product |
| `o-cart` | Cart | Shopping cart |
| `o-checkout-summary` | Checkout Summary | Order summary |

### Overlays (4)
| ID | Name | Description |
|----|------|-------------|
| `o-dialog` | Dialog | Modal dialog |
| `o-drawer` | Drawer | Slide-out drawer |
| `o-sheet` | Sheet | Bottom/side sheet |
| `o-search-modal` | Search Modal | Search overlay |

### User (8)
| ID | Name | Description |
|----|------|-------------|
| `o-user-menu` | User Menu | User dropdown |
| `o-notification-center` | Notification Center | Notifications panel |
| `o-activity-feed` | Activity Feed | Activity timeline |
| `o-comments-section` | Comments Section | Comment thread |
| `o-media-gallery` | Media Gallery | Image/video gallery |
| `o-scroll-animations` | Scroll Animations | Scroll-triggered effects |
| `o-empty-dashboard` | Empty Dashboard | Empty state for dashboards |
| `o-onboarding-flow` | Onboarding Flow | User onboarding |

### Utility (6)
| ID | Name | Description |
|----|------|-------------|
| `o-theme-switcher` | Theme Switcher | Dark/light mode |
| `o-language-switcher` | Language Switcher | Locale selection |
| `o-keyboard-shortcuts` | Keyboard Shortcuts | Shortcuts dialog |
| `o-cookie-consent` | Cookie Consent | Cookie banner |
| `o-announcement-banner` | Announcement Banner | Site announcements |
| `o-social-share` | Social Share | Share buttons |

## Composition Example

```tsx
// o-header composes molecules and atoms
import { NavLink } from "@/components/molecules/nav-link";     // m-nav-link
import { SearchInput } from "@/components/molecules/search";   // m-search-input
import { Button } from "@/components/ui/button";               // a-input-button
import { Avatar } from "@/components/ui/avatar";               // a-display-avatar

export function Header({ navigation }) {
  return (
    <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur">
      <nav className="container flex items-center justify-between h-16">
        <Logo />
        <div className="hidden md:flex gap-6">
          {navigation.map(item => (
            <NavLink key={item.href} href={item.href}>
              {item.label}
            </NavLink>
          ))}
        </div>
        <div className="flex items-center gap-4">
          <SearchInput />
          <Button>Sign In</Button>
        </div>
      </nav>
    </header>
  );
}
```

## ID Convention

All organisms use the `o-` prefix: `o-{name}`
