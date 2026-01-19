# Skill References

This directory contains all skill documentation organized by atomic design layers.

## Layers

### L0 - Primitives (`primitives/`)
Design tokens and foundational values.
- Colors, typography, spacing scales
- CSS variables and theme tokens
- Animation timing functions

### L1 - Atoms (`atoms/`)
Basic UI elements that cannot be broken down further.
- Buttons, inputs, labels
- Icons, badges, avatars
- Loading indicators

**Naming convention:** `{category}-{name}.md`
- `display-*` - Visual display elements
- `input-*` - Form input elements
- `feedback-*` - User feedback elements

### L2 - Molecules (`molecules/`)
Simple components composed of atoms.
- Form fields, cards, tooltips
- Navigation items, breadcrumbs
- Search inputs, date pickers

### L3 - Organisms (`organisms/`)
Complex UI components with business logic.
- Headers, footers, sidebars
- Data tables, forms, modals
- Charts, calendars, file uploaders

### L4 - Templates (`templates/`)
Page layouts and structural compositions.
- Dashboard layouts, auth layouts
- Marketing pages, settings pages
- Error pages (404, 500)

### L5 - Patterns (`patterns/`)
Implementation patterns and best practices.
- Authentication patterns
- Data fetching strategies
- State management approaches
- Performance optimizations

### L6 - Recipes (`recipes/`)
Complete application blueprints.
- E-commerce platforms
- SaaS dashboards
- Blog platforms
- Enterprise applications

## File Structure

Each skill file follows this structure:

```markdown
---
[YAML Frontmatter]
---

# Skill Name

## Overview / When to Use

## Composition Diagram

## Implementation

### Code Examples

## Anti-patterns

## Related Skills

---

## Changelog
```

## Validation

All skills are validated for:
- Layer composition rules (no upward references)
- Required frontmatter fields
- File naming conventions
- Reference integrity
