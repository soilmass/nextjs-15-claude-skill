---
id: pt-prettier-config
name: Prettier Configuration Patterns
version: 2.0.0
layer: L5
category: devops
description: Prettier setup for consistent code formatting in Next.js projects with Tailwind CSS integration
tags: [prettier, formatting, code-style, tailwind, dx]
composes: []
dependencies: []
formula: "Format Rules + Tailwind Plugin + Editor Integration = Consistent Code Style"
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# Prettier Configuration Patterns

## Overview

Prettier enforces consistent code formatting, eliminating debates about code style. This pattern covers optimal configuration for Next.js projects with Tailwind CSS and editor integration.

## When to Use

- Setting up automatic code formatting in a new project
- Eliminating code style debates in team environments
- Sorting Tailwind CSS classes automatically
- Integrating format-on-save in VS Code or other editors
- Running formatting checks in CI/CD pipelines

## Implementation

### Base Prettier Configuration

```javascript
// prettier.config.mjs
/** @type {import("prettier").Config} */
const config = {
  // Line width
  printWidth: 80,
  
  // Indentation
  tabWidth: 2,
  useTabs: false,
  
  // Semicolons
  semi: true,
  
  // Quotes
  singleQuote: false,
  jsxSingleQuote: false,
  quoteProps: "as-needed",
  
  // Trailing commas (es5 is safe for all environments)
  trailingComma: "es5",
  
  // Brackets
  bracketSpacing: true,
  bracketSameLine: false,
  
  // Arrow functions
  arrowParens: "always",
  
  // Line endings
  endOfLine: "lf",
  
  // JSX
  jsxSingleQuote: false,
  
  // Prose wrapping (for markdown)
  proseWrap: "preserve",
  
  // HTML whitespace sensitivity
  htmlWhitespaceSensitivity: "css",
  
  // Vue-specific (if using Vue components)
  vueIndentScriptAndStyle: false,
  
  // Embedded language formatting
  embeddedLanguageFormatting: "auto",
  
  // Single attribute per line in HTML/JSX
  singleAttributePerLine: false,
  
  // Plugins
  plugins: ["prettier-plugin-tailwindcss"],
  
  // Tailwind CSS plugin options
  tailwindConfig: "./tailwind.config.ts",
  tailwindFunctions: ["clsx", "cn", "cva"],
};

export default config;
```

### Package.json Scripts

```json
{
  "scripts": {
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "format:staged": "prettier --write --staged"
  }
}
```

### Ignore File

```plaintext
# .prettierignore

# Dependencies
node_modules/
.pnpm-store/

# Build outputs
.next/
out/
build/
dist/
coverage/

# Generated files
*.min.js
*.min.css
pnpm-lock.yaml
package-lock.json
yarn.lock

# Static assets
public/

# Cache
.cache/
.turbo/

# IDE
.idea/
.vscode/

# Environment files (may contain sensitive formatting)
.env*

# Auto-generated types
*.d.ts
!src/**/*.d.ts

# Specific files
next-env.d.ts
```

### VS Code Integration

```json
// .vscode/settings.json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "editor.formatOnPaste": false,
  "[javascript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[javascriptreact]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[typescriptreact]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[json]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[jsonc]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[markdown]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode",
    "editor.wordWrap": "on"
  },
  "[html]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[css]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[scss]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[yaml]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  }
}
```

### ESLint Integration

```javascript
// eslint.config.mjs
import eslintConfigPrettier from "eslint-config-prettier";

export default [
  // ... other configs
  
  // Prettier must be last to override other formatting rules
  eslintConfigPrettier,
];
```

### Tailwind CSS Class Sorting

```typescript
// The prettier-plugin-tailwindcss automatically sorts classes
// Before:
<div className="p-4 flex bg-blue-500 items-center justify-between text-white hover:bg-blue-600">

// After formatting:
<div className="flex items-center justify-between bg-blue-500 p-4 text-white hover:bg-blue-600">
```

### Custom Function Support for Tailwind

```javascript
// prettier.config.mjs
const config = {
  plugins: ["prettier-plugin-tailwindcss"],
  
  // Sort Tailwind classes in these functions
  tailwindFunctions: [
    "clsx",
    "cn",
    "cva",
    "twMerge",
    "twJoin",
  ],
  
  // Also sort in these attributes (besides className)
  tailwindAttributes: [
    "class",
    "className",
    "ngClass",
    ".*[cC]lass[nN]ame", // Matches customClassName, baseClassName, etc.
  ],
};
```

### Pre-commit Hook with lint-staged

```json
// package.json
{
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{json,md,yml,yaml,css,scss}": [
      "prettier --write"
    ]
  }
}
```

```bash
# .husky/pre-commit
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

npx lint-staged
```

### Editor Config

```ini
# .editorconfig
# Ensures consistent settings across editors

root = true

[*]
indent_style = space
indent_size = 2
end_of_line = lf
charset = utf-8
trim_trailing_whitespace = true
insert_final_newline = true

[*.md]
trim_trailing_whitespace = false

[*.{yml,yaml}]
indent_size = 2

[Makefile]
indent_style = tab
```

## Variants

### Monorepo Configuration

```javascript
// packages/prettier-config/index.mjs
/** @type {import("prettier").Config} */
export default {
  printWidth: 80,
  tabWidth: 2,
  semi: true,
  singleQuote: false,
  trailingComma: "es5",
  plugins: ["prettier-plugin-tailwindcss"],
};

// apps/web/prettier.config.mjs
import baseConfig from "@acme/prettier-config";

/** @type {import("prettier").Config} */
export default {
  ...baseConfig,
  // App-specific overrides
  tailwindConfig: "./tailwind.config.ts",
};
```

### Alternative Styles

```javascript
// prettier.config.mjs - Alternative: Single quotes, no semicolons
const config = {
  semi: false,
  singleQuote: true,
  trailingComma: "all",
  // ... rest of config
};
```

### Markdown Formatting

```javascript
// prettier.config.mjs
const config = {
  // Prose wrapping options:
  // "always" - wrap prose at printWidth
  // "never" - no wrapping
  // "preserve" - keep original wrapping
  proseWrap: "always",
  
  // Overrides for specific files
  overrides: [
    {
      files: "*.md",
      options: {
        proseWrap: "always",
        printWidth: 80,
      },
    },
    {
      files: "CHANGELOG.md",
      options: {
        proseWrap: "preserve",
      },
    },
  ],
};
```

### SQL Formatting (with plugin)

```javascript
// prettier.config.mjs
const config = {
  plugins: [
    "prettier-plugin-tailwindcss",
    "prettier-plugin-sql",
  ],
  
  overrides: [
    {
      files: "*.sql",
      options: {
        language: "postgresql",
        keywordCase: "upper",
      },
    },
  ],
};
```

## Anti-patterns

1. **Inconsistent configs**: Different formatting rules across projects
2. **No format-on-save**: Manual formatting leads to inconsistency
3. **Ignoring too much**: Missing formatting on important files
4. **Conflicting ESLint rules**: ESLint and Prettier fighting
5. **Not committing config**: Team members using different settings

## Related Skills

- `L5/patterns/eslint-config` - ESLint configuration
- `L5/patterns/typescript-config` - TypeScript configuration
- `L5/patterns/code-quality` - Code quality automation
- `L5/patterns/ci-cd` - CI/CD integration

## Changelog

### 2.0.0 (2025-01-18)
- Standardized to atomic design system v2
- Updated frontmatter schema

- 1.0.0: Initial implementation with Tailwind CSS plugin
