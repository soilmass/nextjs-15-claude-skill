# L2: Molecules

> Composed units combining atoms into functional groups.

## Overview

Molecules are combinations of atoms that form functional UI units. They represent the first level of meaningful composition in the atomic design system.

**Key principle**: Molecules compose from atoms (L1) and primitives (L0). They should be reusable across different contexts.

## Composition Rules

```
L2 Molecules
├── composes: L0 (primitives), L1 (atoms)
└── composed by: L3, L4, L5, L6
```

## Categories

| Category | Description | Count |
|----------|-------------|-------|
| `forms` | Form fields, date pickers, specialized inputs | 13 |
| `navigation` | Nav links, tabs, breadcrumbs, pagination | 6 |
| `content` | Cards, callouts, media objects, stats | 8 |
| `data` | List items, table rows, ratings | 5 |
| `interactive` | Action menus, copy buttons, toolbars | 7 |
| `state` | State patterns for cards and form fields | 3 |

## Files (40 total)

### Forms (13)
| ID | Name | Description |
|----|------|-------------|
| `m-form-field` | Form Field | Label + input + error message |
| `m-date-picker` | Date Picker | Calendar date selection |
| `m-password-input` | Password Input | Password with visibility toggle |
| `m-search-input` | Search Input | Search with suggestions |
| `m-combobox` | Combobox | Searchable select |
| `m-tag-input` | Tag Input | Multi-value tag input |
| `m-mention-input` | Mention Input | @mention support |
| `m-phone-input` | Phone Input | Phone number formatting |
| `m-address-input` | Address Input | Address autocomplete |
| `m-credit-card-input` | Credit Card Input | Card number formatting |
| `m-inline-edit` | Inline Edit | In-place editing |
| `m-color-picker` | Color Picker | Color selection |
| `m-range-slider` | Range Slider | Range selection |

### Navigation (6)
| ID | Name | Description |
|----|------|-------------|
| `m-nav-link` | Nav Link | Navigation link with active state |
| `m-tabs` | Tabs | Tab navigation |
| `m-breadcrumb` | Breadcrumb | Breadcrumb trail |
| `m-pagination` | Pagination | Page navigation |
| `m-stepper` | Stepper | Step indicator |
| `m-state-nav-item` | Nav Item States | Navigation state patterns |

### Content (8)
| ID | Name | Description |
|----|------|-------------|
| `m-card` | Card | Content card container |
| `m-avatar-group` | Avatar Group | Stacked avatars |
| `m-empty-state` | Empty State | No content placeholder |
| `m-callout` | Callout | Highlighted information |
| `m-media-object` | Media Object | Media + text layout |
| `m-stat-card` | Stat Card | Statistics display |
| `m-key-value` | Key Value | Label-value pairs |
| `m-timeline-item` | Timeline Item | Timeline entry |

### Data (5)
| ID | Name | Description |
|----|------|-------------|
| `m-list-item` | List Item | List row component |
| `m-table-row` | Table Row | Table row component |
| `m-rating` | Rating | Star rating |
| `m-accordion-item` | Accordion Item | Collapsible section |
| `m-notification-badge` | Notification Badge | Count indicator |

### Interactive (5)
| ID | Name | Description |
|----|------|-------------|
| `m-action-menu` | Action Menu | Context actions |
| `m-copy-button` | Copy Button | Copy to clipboard |
| `m-share-button` | Share Button | Share functionality |
| `m-toolbar` | Toolbar | Action toolbar |
| `m-sortable-item` | Sortable Item | Drag-and-drop item |

### State (3)
| ID | Name | Description |
|----|------|-------------|
| `m-state-card` | Card States | Card state patterns |
| `m-state-form-field` | Form Field States | Form field state patterns |
| `m-error-boundary` | Error Boundary | Error handling component |

## Composition Example

```tsx
// m-form-field composes atoms
import { Label } from "@/components/ui/label";      // a-display-text
import { Input } from "@/components/ui/input";      // a-input-text
import { AlertCircle } from "lucide-react";         // a-display-icon

export function FormField({ label, error, children }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
      {error && (
        <p className="text-destructive flex items-center gap-1">
          <AlertCircle className="h-4 w-4" />
          {error}
        </p>
      )}
    </div>
  );
}
```

## ID Convention

All molecules use the `m-` prefix: `m-{name}`
