# /build-nextjs

Build a world-class Next.js 15 website using the atomic design skill system.

## Usage

```
/build-nextjs [site-type] [options]
```

### Site Types

- `marketing` - Corporate marketing website (20+ pages)
- `ecommerce` - E-commerce store with Stripe (25+ pages)
- `saas` - SaaS dashboard application (15+ pages)
- `docs` - Documentation site with MDX (dynamic)
- `blog` - Blog platform (15+ pages)
- `ai-app` - AI chat application (10+ pages)
- `realtime` - Real-time collaborative app (8+ pages)
- `custom` - Custom configuration (interactive)

### Options

- `--name <name>` - Project name
- `--dir <path>` - Output directory (default: ./examples/<name>)
- `--minimal` - Skip optional features
- `--full` - Include all polish features
- `--no-examples` - Skip example content

## Process

When invoked, this command will:

1. **Gather Requirements**
   - Confirm site type and features
   - Collect project metadata (name, description)
   - Determine required integrations

2. **Load Recipe**
   - Load the appropriate recipe from `.claude/skills/nextjs15/references/recipes/`
   - Identify all required skills across layers

3. **Scaffold Project**
   - Create Next.js 15 project structure
   - Install dependencies with exact versions
   - Configure TypeScript, Tailwind, ESLint

4. **Implement Skills (Bottom-Up)**
   - **Primitives**: Design tokens in `tailwind.config.ts` and `globals.css`
   - **Atoms**: Base components in `components/ui/`
   - **Molecules**: Composed components in `components/ui/`
   - **Organisms**: Feature blocks in `components/organisms/`
   - **Templates**: Layouts and pages
   - **Patterns**: Architectural implementations

5. **Apply Polish**
   - Micro-interactions and animations
   - Dark mode support
   - Accessibility audit
   - Performance optimization

6. **Verify**
   - TypeScript compilation
   - Build success
   - Lighthouse audit

## Skill Loading

Skills are loaded from the registry and applied in order:

```
.claude/skills/nextjs15/
├── skill.json           # Master manifest
├── registry.json        # All skills with metadata
└── references/
    ├── primitives/      # 15 design token skills
    ├── atoms/           # 30 base component skills
    ├── molecules/       # 25 composed component skills
    ├── organisms/       # 33 feature block skills
    ├── templates/       # 17 layout/page skills
    ├── patterns/        # 211 architectural pattern skills
    └── recipes/         # 7 complete site recipes
```

## Example Invocations

### Marketing Site
```
/build-nextjs marketing --name acme-corp --full
```

### SaaS Dashboard
```
/build-nextjs saas --name dashboard-pro
```

### E-commerce with Custom Path
```
/build-nextjs ecommerce --name store --dir ./projects/store
```

## Performance Targets

All generated sites must meet:

| Metric | Target | Excellent |
|--------|--------|-----------|
| LCP | < 1.2s | < 1.0s |
| INP | < 100ms | < 50ms |
| CLS | < 0.05 | < 0.02 |
| Lighthouse | 95+ | 100 |

## Dependencies

Core packages installed for every project:

```json
{
  "next": "15.0.0",
  "react": "19.0.0",
  "react-dom": "19.0.0",
  "typescript": "5.6.0",
  "tailwindcss": "4.0.0",
  "class-variance-authority": "0.7.1",
  "clsx": "2.1.1",
  "tailwind-merge": "2.5.5",
  "@radix-ui/react-slot": "1.1.0",
  "lucide-react": "0.460.0",
  "zod": "3.23.0"
}
```

Additional packages are installed based on the recipe requirements.

## Notes

- All code is TypeScript with strict mode
- Components follow shadcn/ui conventions
- Accessibility is built-in (WCAG 2.1 AA minimum)
- Dark mode is supported by default
- All interactive elements have micro-interactions
