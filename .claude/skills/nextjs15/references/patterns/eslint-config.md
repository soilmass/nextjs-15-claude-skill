---
id: pt-eslint-config
name: ESLint Configuration Patterns
version: 2.0.0
layer: L5
category: devops
description: ESLint flat config setup for Next.js 15 with TypeScript, React, and accessibility rules
tags: [eslint, linting, code-quality, typescript, accessibility]
composes: []
dependencies: []
formula: "Flat Config + TypeScript Plugin + a11y Rules = Comprehensive Code Quality"
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# ESLint Configuration Patterns

## Overview

ESLint enforces code quality and consistency across your codebase. This pattern covers the new flat config format for Next.js 15, TypeScript integration, and accessibility rules.

## When to Use

- Setting up code quality standards for a new Next.js project
- Migrating from legacy ESLint config to flat config format
- Enforcing accessibility (a11y) rules in React components
- Standardizing import ordering and TypeScript best practices
- Integrating linting into CI/CD pipelines

## Implementation

### ESLint Flat Config (ESLint 9+)

```typescript
// eslint.config.mjs
import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import js from "@eslint/js";
import typescriptPlugin from "@typescript-eslint/eslint-plugin";
import typescriptParser from "@typescript-eslint/parser";
import reactPlugin from "eslint-plugin-react";
import reactHooksPlugin from "eslint-plugin-react-hooks";
import jsxA11yPlugin from "eslint-plugin-jsx-a11y";
import importPlugin from "eslint-plugin-import";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

export default [
  // Base JavaScript rules
  js.configs.recommended,

  // Extend Next.js config
  ...compat.extends("next/core-web-vitals"),

  // TypeScript files
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        project: "./tsconfig.json",
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      "@typescript-eslint": typescriptPlugin,
      react: reactPlugin,
      "react-hooks": reactHooksPlugin,
      "jsx-a11y": jsxA11yPlugin,
      import: importPlugin,
    },
    rules: {
      // TypeScript rules
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "@typescript-eslint/no-non-null-assertion": "warn",
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { prefer: "type-imports", fixStyle: "inline-type-imports" },
      ],
      "@typescript-eslint/no-import-type-side-effects": "error",

      // React rules
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
      "react/jsx-no-target-blank": "error",
      "react/jsx-curly-brace-presence": [
        "error",
        { props: "never", children: "never" },
      ],
      "react/self-closing-comp": "error",
      "react/jsx-sort-props": [
        "warn",
        {
          callbacksLast: true,
          shorthandFirst: true,
          reservedFirst: true,
        },
      ],

      // React Hooks rules
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",

      // Accessibility rules
      "jsx-a11y/alt-text": "error",
      "jsx-a11y/anchor-is-valid": "error",
      "jsx-a11y/aria-props": "error",
      "jsx-a11y/aria-proptypes": "error",
      "jsx-a11y/aria-unsupported-elements": "error",
      "jsx-a11y/click-events-have-key-events": "warn",
      "jsx-a11y/heading-has-content": "error",
      "jsx-a11y/html-has-lang": "error",
      "jsx-a11y/img-redundant-alt": "error",
      "jsx-a11y/interactive-supports-focus": "warn",
      "jsx-a11y/label-has-associated-control": "error",
      "jsx-a11y/no-autofocus": "warn",
      "jsx-a11y/no-redundant-roles": "error",
      "jsx-a11y/role-has-required-aria-props": "error",
      "jsx-a11y/role-supports-aria-props": "error",
      "jsx-a11y/tabindex-no-positive": "error",

      // Import rules
      "import/order": [
        "error",
        {
          groups: [
            "builtin",
            "external",
            "internal",
            ["parent", "sibling"],
            "index",
            "type",
          ],
          "newlines-between": "always",
          alphabetize: { order: "asc", caseInsensitive: true },
        },
      ],
      "import/no-duplicates": "error",
      "import/no-unresolved": "off", // TypeScript handles this
      "import/newline-after-import": "error",

      // General rules
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "prefer-const": "error",
      "no-var": "error",
      eqeqeq: ["error", "always", { null: "ignore" }],
      "no-nested-ternary": "warn",
      "no-unneeded-ternary": "error",
    },
    settings: {
      react: {
        version: "detect",
      },
      "import/resolver": {
        typescript: {
          alwaysTryTypes: true,
        },
      },
    },
  },

  // JavaScript files
  {
    files: ["**/*.js", "**/*.mjs"],
    rules: {
      "@typescript-eslint/no-var-requires": "off",
    },
  },

  // Test files
  {
    files: [
      "**/*.test.ts",
      "**/*.test.tsx",
      "**/*.spec.ts",
      "**/*.spec.tsx",
      "**/__tests__/**/*",
    ],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "no-console": "off",
    },
  },

  // Config files
  {
    files: [
      "*.config.js",
      "*.config.mjs",
      "*.config.ts",
      "tailwind.config.*",
      "postcss.config.*",
    ],
    rules: {
      "import/no-default-export": "off",
    },
  },

  // Ignore patterns
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "out/**",
      "build/**",
      "dist/**",
      "coverage/**",
      "*.min.js",
      "public/**",
    ],
  },
];
```

### Package.json Scripts

```json
{
  "scripts": {
    "lint": "eslint .",
    "lint:fix": "eslint . --fix",
    "lint:strict": "eslint . --max-warnings 0",
    "lint:report": "eslint . -f html -o reports/eslint-report.html"
  }
}
```

### VS Code Integration

```json
// .vscode/settings.json
{
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
  "eslint.validate": [
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact"
  ],
  "eslint.useFlatConfig": true,
  "eslint.workingDirectories": [{ "mode": "auto" }]
}
```

### Custom Rules for Next.js

```typescript
// eslint.config.mjs (additional rules)

// Server Component rules
{
  files: ["**/app/**/*.tsx", "**/app/**/*.ts"],
  rules: {
    // Warn about hooks in server components (they should only be in client components)
    "react-hooks/rules-of-hooks": "error",
  },
},

// Client Component rules  
{
  files: ["**/*.client.tsx", "**/components/**/*.tsx"],
  rules: {
    // Allow "use client" directive
  },
},

// API Routes
{
  files: ["**/app/api/**/*.ts"],
  rules: {
    // API-specific rules
    "no-console": "off", // Allow console in API routes for logging
  },
},

// Server Actions
{
  files: ["**/actions/**/*.ts", "**/*.actions.ts"],
  rules: {
    // Ensure "use server" is present
  },
},
```

### Strict Mode Configuration

```typescript
// eslint.config.strict.mjs - For CI/CD
import baseConfig from "./eslint.config.mjs";

export default [
  ...baseConfig,
  {
    rules: {
      // Upgrade warnings to errors in strict mode
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-non-null-assertion": "error",
      "no-console": "error",
      "no-nested-ternary": "error",
      "jsx-a11y/click-events-have-key-events": "error",
      "jsx-a11y/interactive-supports-focus": "error",
      "jsx-a11y/no-autofocus": "error",
      "react-hooks/exhaustive-deps": "error",
    },
  },
];
```

## Variants

### Monorepo Configuration

```typescript
// eslint.config.mjs for monorepo
export default [
  // Shared base config
  ...baseConfig,
  
  // Package-specific overrides
  {
    files: ["packages/ui/**/*.tsx"],
    rules: {
      // UI package specific rules
      "import/no-default-export": "error",
    },
  },
  {
    files: ["apps/web/**/*.tsx"],
    rules: {
      // Web app specific rules
    },
  },
];
```

### Pre-commit Hook

```bash
# .husky/pre-commit
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

npx lint-staged
```

```json
// package.json
{
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{json,md,yml}": [
      "prettier --write"
    ]
  }
}
```

## Anti-patterns

1. **Disabling rules inline**: `// eslint-disable-next-line` everywhere
2. **Ignoring entire directories**: Missing linting on important code
3. **Too many warnings**: Warning fatigue leads to ignored issues
4. **Inconsistent configs**: Different rules in different projects
5. **No CI integration**: Linting only locally

## Related Skills

- `L5/patterns/prettier-config` - Code formatting
- `L5/patterns/typescript-config` - TypeScript configuration
- `L5/patterns/code-quality` - Code quality automation
- `L5/patterns/ci-cd` - CI/CD integration

## Changelog

### 2.0.0 (2025-01-17)
- Standardized to atomic design system v2
- Updated frontmatter schema

### 1.0.0
- Initial implementation with ESLint 9 flat config
