# Next.js 15 Claude Skill

A comprehensive atomic design skillbase for Claude Code to build Next.js 15 applications. This skill provides reusable patterns, components, and recipes following a strict 7-layer architecture.

## Installation

Add this skill to your Claude Code project:

```bash
# Clone into your .claude/skills directory
git clone https://github.com/soilmass/nextjs-15-claude-skill.git .claude/skills/nextjs15
```

Or add as a git submodule:

```bash
git submodule add https://github.com/soilmass/nextjs-15-claude-skill.git .claude/skills/nextjs15
```

## Architecture

The skill follows atomic design principles with 7 layers:

```
L6 recipes     (r-)   - Complete application blueprints
L5 patterns    (pt-)  - Implementation patterns and best practices
L4 templates   (t-)   - Page layouts and compositions
L3 organisms   (o-)   - Complex UI components
L2 molecules   (m-)   - Simple UI components
L1 atoms       (a-)   - Basic UI elements
L0 primitives  (p-)   - Design tokens and foundations
```

### Layer Composition Rules

Each layer can only compose from layers beneath it:

| Layer | Can Compose From |
|-------|------------------|
| L6 recipes | L0, L1, L2, L3, L4, L5 |
| L5 patterns | L0, L1, L2, L3, L4 |
| L4 templates | L0, L1, L2, L3 |
| L3 organisms | L0, L1, L2 |
| L2 molecules | L0, L1 |
| L1 atoms | L0 |
| L0 primitives | - |

## Skill Counts

| Layer | Count |
|-------|-------|
| Primitives (L0) | 20 |
| Atoms (L1) | 42 |
| Molecules (L2) | 50 |
| Organisms (L3) | 70 |
| Templates (L4) | 32 |
| Patterns (L5) | 366 |
| Recipes (L6) | 46 |
| **Total** | **626 skills** |

## Directory Structure

```
.claude/
├── commands/
│   └── build-nextjs.md      # /build-nextjs command
├── docs/                     # Documentation and guides
└── skills/
    └── nextjs15/
        ├── references/       # Skill documentation
        │   ├── primitives/   # L0 - Design tokens
        │   ├── atoms/        # L1 - Basic elements
        │   ├── molecules/    # L2 - Simple components
        │   ├── organisms/    # L3 - Complex components
        │   ├── templates/    # L4 - Page layouts
        │   ├── patterns/     # L5 - Implementation patterns
        │   └── recipes/      # L6 - Application blueprints
        └── _validate.ts      # Validation script
```

## Usage

Reference skills by their ID prefix when working with Claude:

- `p-*` for primitives (e.g., `p-colors`, `p-typography`)
- `a-*` for atoms (e.g., `a-input-button`, `a-display-text`)
- `m-*` for molecules (e.g., `m-form-field`, `m-card`)
- `o-*` for organisms (e.g., `o-header`, `o-data-table`)
- `t-*` for templates (e.g., `t-dashboard-layout`, `t-auth-layout`)
- `pt-*` for patterns (e.g., `pt-authentication`, `pt-caching`)
- `r-*` for recipes (e.g., `r-saas-dashboard`, `r-ecommerce`)

## Example Recipes

Build complete applications with pre-defined recipes:

- **SaaS Dashboard** - Admin panels with analytics
- **E-commerce** - Product catalogs with checkout
- **Blog Platform** - Content management with MDX
- **Documentation** - Technical docs with search
- **Marketing Site** - Landing pages with CTA sections
- **And 41 more...**

## Frontmatter Schema

Each skill file uses YAML frontmatter for metadata:

```yaml
---
id: prefix-skill-name
name: Skill Name
version: 1.0.0
layer: L5
category: category-name
description: Brief description
tags: [tag1, tag2]
composes:
  - ../layer/skill.md
dependencies:
  package: "^1.0.0"
formula: Skill = A + B + C
performance:
  impact: low|medium|high
accessibility:
  wcag: AA|AAA
  keyboard: true
  screen-reader: true
---
```

## Validation

Check layer compliance with the validation script:

```bash
npx ts-node .claude/skills/nextjs15/_validate.ts
```

## License

MIT
