# Skill File Sections

This document defines the required sections for each skill markdown file and their purpose.

## Section Order

Every skill file MUST follow this exact section ordering:

1. **Frontmatter** (YAML) - Metadata
2. **Overview** - What this skill does
3. **When to Use** - Triggers and use cases
4. **Implementation** - Code with explanation
5. **Variants** (optional) - Different configurations
6. **States** (optional) - State matrix for interactive elements
7. **Accessibility** - A11y requirements
8. **Dependencies** - Required packages
9. **Examples** - Usage examples
10. **Anti-patterns** - What NOT to do
11. **Related Skills** - Links to related skills

---

## Section Specifications

### 1. Frontmatter

```yaml
---
id: unique-identifier
name: Human Readable Name
version: 1.0.0
layer: primitives | atoms | molecules | organisms | templates | patterns | recipes
category: subcategory
description: One-line description
tags: [tag1, tag2]
dependencies:
  - package@version
atoms: [] # For molecules/organisms
molecules: [] # For organisms
patterns: [] # For templates/recipes
performance:
  impact: low | medium | high
  lcp: neutral | positive | negative
  cls: neutral | positive | negative
accessibility:
  wcag: AA | AAA
  keyboard: true | false
  screen-reader: true | false
---
```

### 2. Overview

Brief explanation (2-3 paragraphs) covering:
- What this skill provides
- Why it matters
- Key features

### 3. When to Use

Trigger conditions and scenarios:
- User intent phrases
- Context clues
- Project requirements

### 4. Implementation

Complete, production-ready code:
- TypeScript with full types
- Comments explaining key decisions
- Ready to copy-paste

### 5. Variants (Optional)

Different configurations:
- Size variants
- Color variants
- Behavior variants

### 6. States (Optional)

For interactive elements:
- State matrix table
- Transition timings
- ARIA states

### 7. Accessibility

Required accessibility features:
- ARIA attributes
- Keyboard navigation
- Screen reader support
- Focus management

### 8. Dependencies

Package requirements:
- NPM packages with exact versions
- Peer dependencies
- Optional dependencies

### 9. Examples

Usage examples:
- Basic usage
- With props/configuration
- Composition with other skills

### 10. Anti-patterns

Common mistakes to avoid:
- Performance pitfalls
- Accessibility violations
- Security issues

### 11. Related Skills

Links to related skills:
- Skills that compose this one
- Skills this composes into
- Alternative approaches

---

## Impact Scoring

Skills are scored on their impact to guide the LLM on priority:

| Layer | Average Impact | Notes |
|-------|---------------|-------|
| Primitives | Critical | Foundation for everything |
| Atoms | High | Core building blocks |
| Molecules | Medium-High | Common compositions |
| Organisms | Medium | Feature blocks |
| Templates | High | Page structure |
| Patterns | Critical | Architectural decisions |
| Recipes | High | Complete implementations |

---

## File Naming Convention

```
{layer}/{category}-{name}.md

Examples:
- primitives/colors.md
- atoms/input-button.md
- molecules/form-field.md
- organisms/header.md
- templates/layout-dashboard.md
- patterns/data/server-actions.md
- recipes/marketing-site.md
```

For patterns with subcategories:
```
patterns/{category}/{name}.md

Examples:
- patterns/routing/app-router.md
- patterns/auth/nextauth.md
- patterns/cache/redis.md
```
