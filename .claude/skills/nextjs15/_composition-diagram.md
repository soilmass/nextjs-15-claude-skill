# Atomic Design Composition Diagram

## Layer Hierarchy

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              L6: RECIPES (37)                               │
│                                                                             │
│   Complete application implementations combining all layers                  │
│   Examples: r-marketing-site, r-ecommerce, r-saas-dashboard                 │
│                                                                             │
│   Composes: L0, L1, L2, L3, L4, L5                                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                              L5: PATTERNS (244)                             │
│                                                                             │
│   Architectural patterns and cross-cutting concerns                         │
│   Examples: pt-server-actions, pt-rbac, pt-streaming, pt-redis-cache       │
│                                                                             │
│   Composes: L0, L1, L2, L3, L4                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                             L4: TEMPLATES (32)                              │
│                                                                             │
│   Page layouts and complete page compositions                               │
│   Examples: t-root-layout, t-landing-page, t-dashboard-home                │
│                                                                             │
│   Composes: L0, L1, L2, L3                                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                             L3: ORGANISMS (50)                              │
│                                                                             │
│   Complex feature blocks combining molecules into sections                  │
│   Examples: o-header, o-data-table, o-hero, o-auth-form                    │
│                                                                             │
│   Composes: L0, L1, L2                                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                             L2: MOLECULES (40)                              │
│                                                                             │
│   Composed units combining atoms into functional groups                     │
│   Examples: m-form-field, m-nav-link, m-card, m-pagination                 │
│                                                                             │
│   Composes: L0, L1                                                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                               L1: ATOMS (42)                                │
│                                                                             │
│   Base UI components - single-purpose, highly reusable                      │
│   Examples: a-input-button, a-display-text, a-feedback-alert               │
│                                                                             │
│   Composes: L0                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                            L0: PRIMITIVES (20)                              │
│                                                                             │
│   Design tokens - no React components, only values                          │
│   Examples: p-colors, p-typography, p-spacing, p-motion                    │
│                                                                             │
│   Composes: nothing (foundation)                                           │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Composition Flow

```
                    ┌──────────────┐
                    │   L6 Recipe  │
                    │ r-ecommerce  │
                    └──────┬───────┘
                           │ composes
        ┌──────────────────┼──────────────────┐
        │                  │                  │
        ▼                  ▼                  ▼
┌───────────────┐ ┌───────────────┐ ┌───────────────┐
│  L5 Pattern   │ │  L4 Template  │ │  L3 Organism  │
│ pt-stripe-... │ │ t-checkout-.. │ │   o-cart      │
└───────┬───────┘ └───────┬───────┘ └───────┬───────┘
        │                 │                 │
        │                 │ composes        │ composes
        │                 │                 │
        │         ┌───────┴───────┐ ┌───────┴───────┐
        │         │               │ │               │
        │         ▼               ▼ ▼               │
        │ ┌───────────────┐ ┌───────────────┐       │
        │ │  L3 Organism  │ │  L2 Molecule  │       │
        │ │   o-header    │ │  m-form-field │       │
        │ └───────┬───────┘ └───────┬───────┘       │
        │         │                 │               │
        │         │ composes        │ composes      │
        │         │                 │               │
        │ ┌───────┴───────┐ ┌───────┴───────┐       │
        │ │               │ │               │       │
        │ ▼               ▼ ▼               ▼       │
        │ ┌───────────────┐ ┌───────────────┐       │
        │ │  L2 Molecule  │ │   L1 Atom     │◄──────┘
        │ │   m-nav-link  │ │ a-input-text  │
        │ └───────┬───────┘ └───────┬───────┘
        │         │                 │
        │         │ composes        │ composes
        │         │                 │
        │ ┌───────┴───────┐ ┌───────┴───────┐
        │ │               │ │               │
        │ ▼               ▼ ▼               │
        │ ┌───────────────┐ ┌───────────────┐
        │ │   L1 Atom     │ │ L0 Primitive  │◄───────┘
        │ │  a-display-.. │ │  p-colors     │
        │ └───────┬───────┘ └───────────────┘
        │         │                 ▲
        │         │ composes        │
        │         │                 │
        │         └─────────────────┘
        │
        └─────────────────────────────────────────►  (Patterns can reference
                                                      any lower layer for
                                                      code examples)
```

## ID Prefix Convention

| Layer | Prefix | Example |
|-------|--------|---------|
| L0 | `p-` | `p-colors`, `p-typography` |
| L1 | `a-` | `a-input-button`, `a-display-text` |
| L2 | `m-` | `m-form-field`, `m-nav-link` |
| L3 | `o-` | `o-header`, `o-data-table` |
| L4 | `t-` | `t-landing-page`, `t-dashboard-layout` |
| L5 | `pt-` | `pt-server-actions`, `pt-rbac` |
| L6 | `r-` | `r-marketing-site`, `r-ecommerce` |

## Composition Rules

### Rule 1: Downward Only
A skill can ONLY compose from layers with **lower** numbers.
- ✅ `o-header` (L3) can compose `m-nav-link` (L2)
- ❌ `m-nav-link` (L2) cannot compose `o-header` (L3)

### Rule 2: Skip Allowed
A skill can compose from any lower layer, not just adjacent.
- ✅ `o-header` (L3) can compose `a-input-button` (L1) directly
- ✅ `t-landing-page` (L4) can compose `p-colors` (L0) directly

### Rule 3: Explicit Declaration
All compositions must be declared in the `composes` frontmatter field.
```yaml
composes:
  - ../molecules/nav-link.md
  - ../atoms/input-button.md
  - ../primitives/colors.md
```

### Rule 4: Patterns Are Special
Patterns (L5) are architectural, not UI compositions. They reference other layers primarily for code examples, not structural composition.

## Skill Counts by Layer

| Layer | Name | Count | Percentage |
|-------|------|-------|------------|
| L0 | Primitives | 20 | 4.3% |
| L1 | Atoms | 42 | 9.0% |
| L2 | Molecules | 40 | 8.6% |
| L3 | Organisms | 50 | 10.8% |
| L4 | Templates | 32 | 6.9% |
| L5 | Patterns | 244 | 52.5% |
| L6 | Recipes | 37 | 8.0% |
| **Total** | | **465** | **100%** |

## Validation

Run the validation script to check composition rules:

```bash
npx ts-node .claude/skills/nextjs15/_validate.ts
```

This will:
1. Verify all frontmatter conforms to schema
2. Check for upward composition violations
3. Validate all cross-references exist
4. Report broken links
