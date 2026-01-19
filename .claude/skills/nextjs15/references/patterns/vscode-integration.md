---
id: pt-vscode-integration
name: VS Code Integration
version: 2.0.0
layer: L5
category: devops
description: VS Code configuration and extensions for optimal Next.js 15 development experience
tags: [dx, vscode, editor, extensions, debugging, settings, snippets]
composes: []
dependencies:
  - vscode
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
formula: "Extensions + Settings + Snippets + Tasks = Optimized Developer Experience"
---

# VS Code Integration

## Overview

Comprehensive VS Code configuration for Next.js 15 development. Includes recommended extensions, workspace settings, debugging configuration, custom snippets, and task automation for maximum productivity.

## When to Use

Use this skill when:
- Setting up a new Next.js project
- Onboarding team members to a project
- Standardizing development environment across team
- Improving TypeScript/React development experience
- Setting up debugging workflows

## Implementation

```json
// .vscode/extensions.json
{
  "recommendations": [
    // Essential
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    
    // TypeScript/React
    "ms-vscode.vscode-typescript-next",
    "dsznajder.es7-react-js-snippets",
    "styled-components.vscode-styled-components",
    
    // Next.js specific
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense",
    "mikestead.dotenv",
    
    // Git
    "eamodio.gitlens",
    "mhutchie.git-graph",
    
    // Productivity
    "usernamehw.errorlens",
    "streetsidesoftware.code-spell-checker",
    "gruntfuggly.todo-tree",
    "wayou.vscode-todo-highlight",
    
    // Testing
    "vitest.explorer",
    "ms-playwright.playwright",
    
    // API Development
    "humao.rest-client",
    "prisma.prisma",
    
    // Optional but helpful
    "yoavbls.pretty-ts-errors",
    "antfu.iconify",
    "csstools.postcss"
  ],
  "unwantedRecommendations": []
}
```

```json
// .vscode/settings.json
{
  // Editor settings
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "editor.formatOnPaste": false,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit",
    "source.organizeImports": "never"
  },
  "editor.quickSuggestions": {
    "strings": "on"
  },
  "editor.linkedEditing": true,
  "editor.bracketPairColorization.enabled": true,
  "editor.guides.bracketPairs": "active",
  
  // TypeScript settings
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true,
  "typescript.preferences.importModuleSpecifier": "non-relative",
  "typescript.suggest.autoImports": true,
  "typescript.updateImportsOnFileMove.enabled": "always",
  "typescript.inlayHints.parameterNames.enabled": "literals",
  "typescript.inlayHints.functionLikeReturnTypes.enabled": true,
  "typescript.inlayHints.variableTypes.enabled": false,
  
  // JavaScript settings
  "javascript.preferences.importModuleSpecifier": "non-relative",
  "javascript.updateImportsOnFileMove.enabled": "always",
  
  // ESLint settings
  "eslint.validate": [
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact"
  ],
  "eslint.workingDirectories": [{ "mode": "auto" }],
  
  // Prettier settings
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[typescriptreact]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[javascript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[javascriptreact]": {
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
  "[css]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[scss]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[prisma]": {
    "editor.defaultFormatter": "Prisma.prisma"
  },
  
  // Tailwind CSS settings
  "tailwindCSS.experimental.classRegex": [
    ["cva\\(([^)]*)\\)", "[\"'`]([^\"'`]*).*?[\"'`]"],
    ["cx\\(([^)]*)\\)", "(?:'|\"|`)([^']*)(?:'|\"|`)"],
    ["cn\\(([^)]*)\\)", "(?:'|\"|`)([^']*)(?:'|\"|`)"],
    ["clsx\\(([^)]*)\\)", "(?:'|\"|`)([^']*)(?:'|\"|`)"]
  ],
  "tailwindCSS.includeLanguages": {
    "typescript": "javascript",
    "typescriptreact": "javascript"
  },
  "css.validate": false,
  "scss.validate": false,
  
  // File associations
  "files.associations": {
    "*.css": "tailwindcss",
    ".env*": "dotenv"
  },
  
  // Emmet settings
  "emmet.includeLanguages": {
    "javascript": "javascriptreact",
    "typescript": "typescriptreact"
  },
  "emmet.triggerExpansionOnTab": true,
  
  // File exclusions
  "files.exclude": {
    "**/.git": true,
    "**/.next": true,
    "**/node_modules": true,
    "**/.turbo": true
  },
  "search.exclude": {
    "**/node_modules": true,
    "**/.next": true,
    "**/dist": true,
    "**/.turbo": true,
    "**/coverage": true,
    "pnpm-lock.yaml": true,
    "package-lock.json": true,
    "yarn.lock": true
  },
  
  // Error Lens settings
  "errorLens.enabledDiagnosticLevels": ["error", "warning"],
  "errorLens.excludeBySource": ["cSpell"],
  
  // Todo Tree settings
  "todo-tree.general.tags": [
    "TODO",
    "FIXME",
    "HACK",
    "BUG",
    "XXX",
    "[ ]",
    "[x]"
  ],
  "todo-tree.highlights.defaultHighlight": {
    "gutterIcon": true
  },
  
  // Git settings
  "git.enableSmartCommit": true,
  "git.confirmSync": false,
  "git.autofetch": true,
  
  // Terminal settings
  "terminal.integrated.defaultProfile.osx": "zsh",
  "terminal.integrated.defaultProfile.linux": "bash"
}
```

```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Next.js: debug server-side",
      "type": "node-terminal",
      "request": "launch",
      "command": "npm run dev"
    },
    {
      "name": "Next.js: debug client-side",
      "type": "chrome",
      "request": "launch",
      "url": "http://localhost:3000",
      "webRoot": "${workspaceFolder}",
      "sourceMapPathOverrides": {
        "webpack://_N_E/*": "${webRoot}/*"
      }
    },
    {
      "name": "Next.js: debug full stack",
      "type": "node-terminal",
      "request": "launch",
      "command": "npm run dev",
      "serverReadyAction": {
        "pattern": "- Local:.+(https?://.+)",
        "uriFormat": "%s",
        "action": "debugWithChrome"
      }
    },
    {
      "name": "Next.js: debug production build",
      "type": "node-terminal",
      "request": "launch",
      "command": "npm run build && npm run start"
    },
    {
      "name": "Debug Current Test File",
      "type": "node",
      "request": "launch",
      "autoAttachChildProcesses": true,
      "skipFiles": ["<node_internals>/**", "**/node_modules/**"],
      "program": "${workspaceRoot}/node_modules/vitest/vitest.mjs",
      "args": ["run", "${relativeFile}"],
      "smartStep": true,
      "console": "integratedTerminal"
    },
    {
      "name": "Debug Playwright Tests",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/node_modules/.bin/playwright",
      "args": ["test", "--debug"],
      "console": "integratedTerminal"
    }
  ],
  "compounds": [
    {
      "name": "Next.js: Full Stack Debug",
      "configurations": ["Next.js: debug server-side", "Next.js: debug client-side"],
      "stopAll": true
    }
  ]
}
```

```json
// .vscode/tasks.json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "dev",
      "type": "npm",
      "script": "dev",
      "problemMatcher": [],
      "isBackground": true,
      "presentation": {
        "reveal": "always",
        "panel": "new"
      },
      "group": {
        "kind": "build",
        "isDefault": true
      }
    },
    {
      "label": "dev:turbo",
      "type": "shell",
      "command": "npm run dev -- --turbo",
      "problemMatcher": [],
      "isBackground": true,
      "presentation": {
        "reveal": "always",
        "panel": "new"
      }
    },
    {
      "label": "build",
      "type": "npm",
      "script": "build",
      "problemMatcher": ["$tsc"],
      "presentation": {
        "reveal": "always"
      },
      "group": "build"
    },
    {
      "label": "lint",
      "type": "npm",
      "script": "lint",
      "problemMatcher": ["$eslint-stylish"],
      "presentation": {
        "reveal": "silent"
      }
    },
    {
      "label": "lint:fix",
      "type": "npm",
      "script": "lint:fix",
      "problemMatcher": ["$eslint-stylish"]
    },
    {
      "label": "typecheck",
      "type": "npm",
      "script": "typecheck",
      "problemMatcher": ["$tsc"],
      "presentation": {
        "reveal": "silent"
      }
    },
    {
      "label": "test",
      "type": "npm",
      "script": "test",
      "problemMatcher": [],
      "group": {
        "kind": "test",
        "isDefault": true
      }
    },
    {
      "label": "test:watch",
      "type": "npm",
      "script": "test:watch",
      "isBackground": true,
      "problemMatcher": []
    },
    {
      "label": "test:e2e",
      "type": "npm",
      "script": "test:e2e",
      "problemMatcher": []
    },
    {
      "label": "db:push",
      "type": "npm",
      "script": "db:push",
      "problemMatcher": []
    },
    {
      "label": "db:studio",
      "type": "npm",
      "script": "db:studio",
      "isBackground": true,
      "problemMatcher": []
    },
    {
      "label": "generate",
      "type": "npm",
      "script": "generate",
      "problemMatcher": []
    },
    {
      "label": "clean",
      "type": "shell",
      "command": "rm -rf .next node_modules/.cache",
      "problemMatcher": []
    },
    {
      "label": "clean:full",
      "type": "shell",
      "command": "rm -rf .next node_modules .turbo",
      "problemMatcher": []
    }
  ]
}
```

### Key Implementation Notes

1. **Workspace TypeScript**: Always use workspace TypeScript version for consistent behavior across team
2. **Tailwind Regex**: Custom regex patterns enable IntelliSense for utility libraries like `cva`, `cn`, `clsx`

## Variants

### Custom Snippets

```json
// .vscode/nextjs.code-snippets
{
  // React Component Snippets
  "React Functional Component": {
    "prefix": "rfc",
    "body": [
      "interface ${1:${TM_FILENAME_BASE}}Props {",
      "  $2",
      "}",
      "",
      "export function ${1:${TM_FILENAME_BASE}}({ $3 }: ${1:${TM_FILENAME_BASE}}Props) {",
      "  return (",
      "    <div>",
      "      $0",
      "    </div>",
      "  );",
      "}"
    ],
    "description": "React Functional Component with TypeScript"
  },
  
  "React Client Component": {
    "prefix": "rcc",
    "body": [
      "'use client';",
      "",
      "import * as React from 'react';",
      "",
      "interface ${1:${TM_FILENAME_BASE}}Props {",
      "  $2",
      "}",
      "",
      "export function ${1:${TM_FILENAME_BASE}}({ $3 }: ${1:${TM_FILENAME_BASE}}Props) {",
      "  return (",
      "    <div>",
      "      $0",
      "    </div>",
      "  );",
      "}"
    ],
    "description": "React Client Component"
  },
  
  "React Server Component": {
    "prefix": "rsc",
    "body": [
      "interface ${1:${TM_FILENAME_BASE}}Props {",
      "  $2",
      "}",
      "",
      "export async function ${1:${TM_FILENAME_BASE}}({ $3 }: ${1:${TM_FILENAME_BASE}}Props) {",
      "  $4",
      "  ",
      "  return (",
      "    <div>",
      "      $0",
      "    </div>",
      "  );",
      "}"
    ],
    "description": "React Server Component (async)"
  },

  // Next.js Page Snippets
  "Next.js Page": {
    "prefix": "npage",
    "body": [
      "import type { Metadata } from 'next';",
      "",
      "export const metadata: Metadata = {",
      "  title: '${1:Page Title}',",
      "  description: '${2:Page description}',",
      "};",
      "",
      "interface ${3:Page}Props {",
      "  params: Promise<{ ${4:slug}: string }>;",
      "  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;",
      "}",
      "",
      "export default async function ${3:Page}({",
      "  params,",
      "  searchParams,",
      "}: ${3:Page}Props) {",
      "  const { ${4:slug} } = await params;",
      "  const query = await searchParams;",
      "  ",
      "  return (",
      "    <main>",
      "      $0",
      "    </main>",
      "  );",
      "}"
    ],
    "description": "Next.js 15 Page with params and searchParams"
  },
  
  "Next.js Layout": {
    "prefix": "nlayout",
    "body": [
      "import type { Metadata } from 'next';",
      "",
      "export const metadata: Metadata = {",
      "  title: {",
      "    template: '%s | ${1:Site Name}',",
      "    default: '${1:Site Name}',",
      "  },",
      "  description: '${2:Site description}',",
      "};",
      "",
      "interface ${3:Root}LayoutProps {",
      "  children: React.ReactNode;",
      "}",
      "",
      "export default function ${3:Root}Layout({ children }: ${3:Root}LayoutProps) {",
      "  return (",
      "    <html lang=\"en\">",
      "      <body>",
      "        {children}",
      "      </body>",
      "    </html>",
      "  );",
      "}"
    ],
    "description": "Next.js Layout Component"
  },
  
  "Next.js Loading": {
    "prefix": "nloading",
    "body": [
      "export default function Loading() {",
      "  return (",
      "    <div className=\"flex items-center justify-center min-h-screen\">",
      "      <div className=\"animate-spin rounded-full h-8 w-8 border-b-2 border-primary\" />",
      "    </div>",
      "  );",
      "}"
    ],
    "description": "Next.js Loading Component"
  },
  
  "Next.js Error": {
    "prefix": "nerror",
    "body": [
      "'use client';",
      "",
      "import { useEffect } from 'react';",
      "",
      "interface ErrorProps {",
      "  error: Error & { digest?: string };",
      "  reset: () => void;",
      "}",
      "",
      "export default function Error({ error, reset }: ErrorProps) {",
      "  useEffect(() => {",
      "    console.error(error);",
      "  }, [error]);",
      "",
      "  return (",
      "    <div className=\"flex flex-col items-center justify-center min-h-screen gap-4\">",
      "      <h2 className=\"text-xl font-semibold\">Something went wrong!</h2>",
      "      <button",
      "        onClick={reset}",
      "        className=\"px-4 py-2 bg-primary text-primary-foreground rounded-md\"",
      "      >",
      "        Try again",
      "      </button>",
      "    </div>",
      "  );",
      "}"
    ],
    "description": "Next.js Error Boundary"
  },

  // API Route Snippets
  "Next.js API Route": {
    "prefix": "napi",
    "body": [
      "import { NextRequest, NextResponse } from 'next/server';",
      "",
      "export async function GET(request: NextRequest) {",
      "  try {",
      "    $1",
      "    ",
      "    return NextResponse.json({ $2 });",
      "  } catch (error) {",
      "    console.error('${3:API} error:', error);",
      "    return NextResponse.json(",
      "      { error: 'Internal server error' },",
      "      { status: 500 }",
      "    );",
      "  }",
      "}",
      "",
      "export async function POST(request: NextRequest) {",
      "  try {",
      "    const body = await request.json();",
      "    $0",
      "    ",
      "    return NextResponse.json({ success: true });",
      "  } catch (error) {",
      "    console.error('${3:API} error:', error);",
      "    return NextResponse.json(",
      "      { error: 'Internal server error' },",
      "      { status: 500 }",
      "    );",
      "  }",
      "}"
    ],
    "description": "Next.js API Route Handler"
  },
  
  "Server Action": {
    "prefix": "naction",
    "body": [
      "'use server';",
      "",
      "import { revalidatePath } from 'next/cache';",
      "import { z } from 'zod';",
      "",
      "const ${1:action}Schema = z.object({",
      "  $2",
      "});",
      "",
      "export async function ${1:action}(formData: FormData) {",
      "  const rawData = Object.fromEntries(formData);",
      "  const validated = ${1:action}Schema.safeParse(rawData);",
      "  ",
      "  if (!validated.success) {",
      "    return { error: validated.error.flatten().fieldErrors };",
      "  }",
      "  ",
      "  try {",
      "    $0",
      "    ",
      "    revalidatePath('/${3:path}');",
      "    return { success: true };",
      "  } catch (error) {",
      "    console.error('${1:action} error:', error);",
      "    return { error: 'Something went wrong' };",
      "  }",
      "}"
    ],
    "description": "Next.js Server Action"
  },

  // Hook Snippets
  "React useState": {
    "prefix": "us",
    "body": [
      "const [${1:state}, set${1/(.*)/${1:/capitalize}/}] = React.useState<${2:type}>(${3:initialValue});"
    ],
    "description": "React useState hook"
  },
  
  "React useEffect": {
    "prefix": "ue",
    "body": [
      "React.useEffect(() => {",
      "  $1",
      "  ",
      "  return () => {",
      "    $2",
      "  };",
      "}, [${3:deps}]);"
    ],
    "description": "React useEffect hook"
  },
  
  "React useCallback": {
    "prefix": "uc",
    "body": [
      "const ${1:callback} = React.useCallback((",
      "  ${2:args}",
      ") => {",
      "  $0",
      "}, [${3:deps}]);"
    ],
    "description": "React useCallback hook"
  },
  
  "React useMemo": {
    "prefix": "um",
    "body": [
      "const ${1:value} = React.useMemo(() => {",
      "  return $0;",
      "}, [${2:deps}]);"
    ],
    "description": "React useMemo hook"
  },

  // Utility Snippets
  "Console Log": {
    "prefix": "cl",
    "body": ["console.log('${1:label}:', $2);"],
    "description": "Console log with label"
  },
  
  "Try Catch": {
    "prefix": "tc",
    "body": [
      "try {",
      "  $1",
      "} catch (error) {",
      "  console.error('Error:', error);",
      "  $0",
      "}"
    ],
    "description": "Try-catch block"
  },
  
  "Async Function": {
    "prefix": "af",
    "body": [
      "async function ${1:name}(${2:params}): Promise<${3:void}> {",
      "  $0",
      "}"
    ],
    "description": "Async function"
  },
  
  "Type Interface": {
    "prefix": "int",
    "body": [
      "interface ${1:Name} {",
      "  $0",
      "}"
    ],
    "description": "TypeScript interface"
  },
  
  "Type Definition": {
    "prefix": "typ",
    "body": [
      "type ${1:Name} = ${0};"
    ],
    "description": "TypeScript type"
  }
}
```

### Keybindings

```json
// .vscode/keybindings.json (User settings reference)
// Add to your personal keybindings.json
[
  {
    "key": "ctrl+shift+t",
    "command": "workbench.action.tasks.runTask",
    "args": "dev"
  },
  {
    "key": "ctrl+shift+b",
    "command": "workbench.action.tasks.runTask",
    "args": "build"
  },
  {
    "key": "ctrl+shift+l",
    "command": "workbench.action.tasks.runTask",
    "args": "lint:fix"
  },
  {
    "key": "ctrl+shift+y",
    "command": "workbench.action.tasks.runTask",
    "args": "typecheck"
  },
  {
    "key": "ctrl+alt+t",
    "command": "workbench.action.tasks.runTask",
    "args": "test:watch"
  }
]
```

### EditorConfig

```ini
# .editorconfig
root = true

[*]
charset = utf-8
end_of_line = lf
indent_size = 2
indent_style = space
insert_final_newline = true
trim_trailing_whitespace = true

[*.md]
trim_trailing_whitespace = false

[*.{json,yml,yaml}]
indent_size = 2

[Makefile]
indent_style = tab
```

## Multi-Root Workspace

```json
// project.code-workspace
{
  "folders": [
    {
      "name": "Frontend",
      "path": "./apps/web"
    },
    {
      "name": "API",
      "path": "./apps/api"
    },
    {
      "name": "Packages",
      "path": "./packages"
    },
    {
      "name": "Root",
      "path": "."
    }
  ],
  "settings": {
    "typescript.tsdk": "node_modules/typescript/lib",
    "eslint.workingDirectories": [
      { "directory": "./apps/web", "changeProcessCWD": true },
      { "directory": "./apps/api", "changeProcessCWD": true },
      { "directory": "./packages/ui", "changeProcessCWD": true }
    ]
  },
  "extensions": {
    "recommendations": [
      "dbaeumer.vscode-eslint",
      "esbenp.prettier-vscode"
    ]
  }
}
```

## Anti-patterns

### Conflicting Formatters

```json
// Bad - Multiple formatters fighting
{
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "editor.formatOnSave": true,
  "eslint.format.enable": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  }
}

// Good - Clear formatter hierarchy
{
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "editor.formatOnSave": true,
  "eslint.format.enable": false, // Disable ESLint formatting
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit" // ESLint for linting only
  }
}
```

### Ignoring Workspace TypeScript

```json
// Bad - Using bundled TypeScript
{
  "typescript.tsdk": null
}

// Good - Using workspace TypeScript for consistency
{
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true
}
```

## Related Skills

### Composes From
- [eslint-config](./eslint-config.md) - ESLint configuration
- [prettier-config](./prettier-config.md) - Prettier configuration

### Composes Into
- [development-workflow](./development-workflow.md) - Complete dev setup
- [team-onboarding](./team-onboarding.md) - Team setup guide

### Alternatives
- WebStorm - JetBrains IDE alternative
- Neovim with LSP - Terminal-based alternative

---

## Changelog

### 2.0.0 (2025-01-18)
- Standardized to atomic design system v2
- Updated frontmatter schema

### 1.0.0 (2025-01-17)
- Initial implementation for Next.js 15
- Custom snippets for Server Components
- Debugging configuration
- Task automation
