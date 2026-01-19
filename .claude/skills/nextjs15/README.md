# Next.js 15 Skillbase

A comprehensive atomic design skillbase for Next.js 15 applications. This skillbase provides reusable patterns, components, and recipes following a strict 7-layer architecture.

## Architecture

```
L6 recipes     (r-)   - Complete application blueprints
L5 patterns    (pt-)  - Implementation patterns and best practices
L4 templates   (t-)   - Page layouts and compositions
L3 organisms   (o-)   - Complex UI components
L2 molecules   (m-)   - Simple UI components
L1 atoms       (a-)   - Basic UI elements
L0 primitives  (p-)   - Design tokens and foundations
```

## Layer Composition Rules

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

## Directory Structure

```
nextjs15/
├── references/           # Skill documentation
│   ├── primitives/      # L0 - Design tokens
│   ├── atoms/           # L1 - Basic elements
│   ├── molecules/       # L2 - Simple components
│   ├── organisms/       # L3 - Complex components
│   ├── templates/       # L4 - Page layouts
│   ├── patterns/        # L5 - Implementation patterns
│   └── recipes/         # L6 - Application blueprints
├── .templates/          # Development templates
└── _validate.ts         # Validation script
```

## Skill Counts

- **Primitives (L0):** 20 skills
- **Atoms (L1):** 42 skills
- **Molecules (L2):** 50 skills
- **Organisms (L3):** 70 skills
- **Templates (L4):** 32 skills
- **Patterns (L5):** 366 skills
- **Recipes (L6):** 46 skills

**Total: 626 skills**

## Frontmatter Schema

Each skill file uses YAML frontmatter:

```yaml
---
id: prefix-skill-name        # Unique identifier
name: Skill Name             # Human-readable name
version: 1.0.0               # Semantic version
layer: L5                    # Layer level
category: category-name      # Skill category
description: Brief desc      # One-line description
tags: [tag1, tag2]           # Searchable tags
composes:                    # Dependencies (from lower layers)
  - ../layer/skill.md
dependencies:                # NPM dependencies
  package: "^1.0.0"
formula: Skill = A + B + C   # Composition formula
performance:
  impact: low|medium|high
  lcp: neutral|positive|low|medium|high
  cls: neutral|positive|low|medium|high
accessibility:
  wcag: AA|AAA|N/A
  keyboard: true|false
  screen-reader: true|false
---
```

## Validation

Run the validation script to check layer compliance:

```bash
npx ts-node _validate.ts
```

## Usage

Reference skills in your implementation by their ID prefix:

- `p-*` for primitives
- `a-*` for atoms
- `m-*` for molecules
- `o-*` for organisms
- `t-*` for templates
- `pt-*` for patterns
- `r-*` for recipes

## License

MIT
