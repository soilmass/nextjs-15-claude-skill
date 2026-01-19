---
id: pt-bundle-optimization
name: Bundle Optimization
version: 2.0.0
layer: L5
category: performance
description: Tree shaking, chunk optimization, and bundle size reduction strategies for Next.js 15 applications
tags: [bundle, optimization, tree-shaking, performance, webpack]
composes: []
dependencies: []
formula: "bundle_size = tree_shaking + dynamic_imports + module_replacement + chunk_splitting + compression"
performance:
  impact: high
  lcp: positive
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# Bundle Optimization Pattern

## Overview

Tree shaking, chunk optimization, and bundle size reduction strategies for Next.js 15 applications. Minimizes JavaScript payload for faster load times.

## When to Use

- **Large dependencies**: Replace heavy libraries with lighter alternatives
- **Icon libraries**: Use named imports instead of wildcard imports
- **Third-party packages**: Lazy load heavy SDKs (charts, editors, PDF)
- **Build analysis**: Identify and eliminate unused code
- **CI/CD pipelines**: Enforce bundle size budgets

## Composition Diagram

```
+------------------+     +-------------------+     +------------------+
|   Source Code    | --> |  Webpack/Turbo    | --> |  Optimized Bundles|
|                  |     |                   |     |                  |
+------------------+     +-------------------+     +------------------+
                               |
          +--------------------+--------------------+
          |                    |                    |
          v                    v                    v
+------------------+  +------------------+  +------------------+
|   Tree Shaking   |  | Chunk Splitting  |  |   Compression    |
|  (unused code)   |  |  (vendor/common) |  |  (gzip/brotli)   |
+------------------+  +------------------+  +------------------+
          |                    |                    |
          +--------------------+--------------------+
                               |
                               v
                    +------------------+
                    |  Bundle Analyzer |
                    |   (verification) |
                    +------------------+
```

## Implementation

### Next.js Bundle Analyzer

```javascript
// next.config.js
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Optimize production builds
  productionBrowserSourceMaps: false,
  
  // Experimental features for optimization
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      '@radix-ui/react-icons',
      'lodash',
      'date-fns',
    ],
  },

  // Webpack optimizations
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Replace large modules with smaller alternatives
      config.resolve.alias = {
        ...config.resolve.alias,
        'lodash': 'lodash-es',
      };
    }
    
    return config;
  },
};

module.exports = withBundleAnalyzer(nextConfig);
```

### Optimized Imports

```typescript
// BAD: Importing entire library
import _ from 'lodash';
import * as Icons from 'lucide-react';

// GOOD: Named imports (tree-shakable)
import { debounce, throttle } from 'lodash-es';
import { Search, Menu, X } from 'lucide-react';

// GOOD: Direct path imports for large libraries
import debounce from 'lodash/debounce';
import format from 'date-fns/format';
```

### Component Library Optimization

```typescript
// components/icons/index.ts
// Re-export only used icons for tree-shaking

// Instead of: export * from 'lucide-react';
export {
  Search,
  Menu,
  X,
  ChevronDown,
  ChevronUp,
  Check,
  Plus,
  Minus,
  Trash,
  Edit,
  Settings,
  User,
  LogOut,
  ShoppingCart,
  Heart,
} from 'lucide-react';

// Type re-export
export type { LucideIcon } from 'lucide-react';
```

```typescript
// components/ui/index.ts
// Barrel file with explicit exports

export { Button } from './button';
export { Input } from './input';
export { Label } from './label';
export { Card, CardHeader, CardContent, CardFooter } from './card';
export { Dialog, DialogContent, DialogHeader, DialogTitle } from './dialog';

// Avoid: export * from './all-components';
```

### Dynamic Imports for Heavy Libraries

```typescript
// lib/heavy-libs.ts
// Lazy load heavy libraries

export async function loadChart() {
  const Chart = await import('chart.js/auto');
  return Chart.default;
}

export async function loadEditor() {
  const { Editor } = await import('@tiptap/react');
  const StarterKit = await import('@tiptap/starter-kit');
  return { Editor, StarterKit: StarterKit.default };
}

export async function loadPdfGenerator() {
  const jsPDF = await import('jspdf');
  return jsPDF.default;
}

// Usage in component
function ChartComponent({ data }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    let chart: Chart | null = null;
    
    loadChart().then((Chart) => {
      chart = new Chart(canvasRef.current, {
        type: 'bar',
        data,
      });
    });

    return () => chart?.destroy();
  }, [data]);

  return <canvas ref={canvasRef} />;
}
```

### Module Replacement

```javascript
// next.config.js
module.exports = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        
        // Use smaller alternatives
        'moment': 'dayjs',
        'lodash': 'lodash-es',
        
        // Remove unused locales
        'moment/locale': false,
        
        // Use browser-specific builds
        'crypto': 'crypto-browserify',
      };

      // Replace large dependencies with stubs in client
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        os: false,
      };
    }
    
    return config;
  },
};
```

### Code Splitting Configuration

```javascript
// next.config.js
module.exports = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          // Vendor chunks
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name(module) {
              const packageName = module.context.match(
                /[\\/]node_modules[\\/](.*?)([\\/]|$)/
              )[1];
              return `vendor.${packageName.replace('@', '')}`;
            },
            priority: 10,
          },
          
          // Common chunks
          common: {
            minChunks: 2,
            priority: 5,
            reuseExistingChunk: true,
          },
          
          // Framework chunks (React, etc.)
          framework: {
            test: /[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/,
            name: 'framework',
            priority: 20,
          },
          
          // UI library chunks
          ui: {
            test: /[\\/]node_modules[\\/](@radix-ui|@headlessui)[\\/]/,
            name: 'ui-lib',
            priority: 15,
          },
        },
      };
    }
    
    return config;
  },
};
```

### Tree Shaking Verification

```typescript
// scripts/check-bundle.ts
import { execSync } from 'child_process';
import * as fs from 'fs';

interface BundleCheck {
  file: string;
  sizeKB: number;
  gzipKB: number;
}

async function checkBundle(): Promise<void> {
  // Build with analysis
  execSync('ANALYZE=true npm run build', { stdio: 'inherit' });

  // Check for large chunks
  const buildDir = '.next/static/chunks';
  const files = fs.readdirSync(buildDir);
  
  const largeFiles: BundleCheck[] = [];
  
  for (const file of files) {
    if (!file.endsWith('.js')) continue;
    
    const filePath = `${buildDir}/${file}`;
    const stats = fs.statSync(filePath);
    const sizeKB = stats.size / 1024;
    
    // Check gzip size
    const gzipSize = execSync(`gzip -c ${filePath} | wc -c`);
    const gzipKB = parseInt(gzipSize.toString()) / 1024;
    
    if (sizeKB > 50) {
      largeFiles.push({ file, sizeKB, gzipKB });
    }
  }
  
  if (largeFiles.length > 0) {
    console.log('\nLarge chunks detected:');
    largeFiles.forEach(({ file, sizeKB, gzipKB }) => {
      console.log(`  ${file}: ${sizeKB.toFixed(1)}KB (${gzipKB.toFixed(1)}KB gzip)`);
    });
  }
}

checkBundle();
```

### Import Cost Monitoring

```json
// .vscode/settings.json
{
  "importCost.bundleSizeDecoration": "both",
  "importCost.showCalculatingDecoration": true,
  "importCost.smallPackageSize": 10,
  "importCost.mediumPackageSize": 50,
  "importCost.smallPackageColor": "#7cc36e",
  "importCost.mediumPackageColor": "#f9a825",
  "importCost.largePackageColor": "#d44e40"
}
```

### Dependency Analysis Script

```typescript
// scripts/analyze-deps.ts
import { execSync } from 'child_process';

interface DepSize {
  name: string;
  size: string;
}

function analyzeDependencies(): void {
  console.log('Analyzing package sizes...\n');
  
  const deps = [
    'react',
    'react-dom',
    'next',
    'lodash',
    'date-fns',
    '@tanstack/react-query',
    'zod',
    'framer-motion',
  ];
  
  const sizes: DepSize[] = [];
  
  for (const dep of deps) {
    try {
      const result = execSync(`npx package-size ${dep}`, {
        encoding: 'utf-8',
      });
      
      const match = result.match(/(\d+\.?\d*)\s*(KB|MB)/);
      if (match) {
        sizes.push({ name: dep, size: `${match[1]} ${match[2]}` });
      }
    } catch {
      sizes.push({ name: dep, size: 'Error' });
    }
  }
  
  console.log('Package Sizes:');
  sizes.forEach(({ name, size }) => {
    console.log(`  ${name.padEnd(30)} ${size}`);
  });
}

analyzeDependencies();
```

### Bundle Size CI Check

```yaml
# .github/workflows/bundle-size.yml
name: Bundle Size Check

on:
  pull_request:
    branches: [main]

jobs:
  bundle-size:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      
      - run: npm ci
      - run: npm run build
      
      - name: Check bundle size
        run: |
          # Get total JS size
          TOTAL_SIZE=$(find .next/static -name "*.js" -exec cat {} + | wc -c)
          TOTAL_KB=$((TOTAL_SIZE / 1024))
          
          echo "Total JS bundle: ${TOTAL_KB}KB"
          
          # Fail if over 500KB
          if [ $TOTAL_KB -gt 500 ]; then
            echo "Bundle too large! Max: 500KB, Actual: ${TOTAL_KB}KB"
            exit 1
          fi
      
      - name: Size limit check
        uses: andresz1/size-limit-action@v1
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
```

### Package.json Sideeffects

```json
// package.json
{
  "sideEffects": [
    "*.css",
    "*.scss",
    "./src/polyfills.ts"
  ]
}
```

### ESM-Only Configuration

```typescript
// lib/esm-imports.ts
// Force ESM imports for better tree-shaking

// Prefer ESM packages
import { format } from 'date-fns'; // ESM
import { clsx } from 'clsx'; // ESM
import { twMerge } from 'tailwind-merge'; // ESM

// Avoid CJS when ESM is available
// BAD: const _ = require('lodash');
// GOOD: import { debounce } from 'lodash-es';
```

### Compression Configuration

```javascript
// next.config.js
module.exports = {
  compress: true,
  
  // Enable modern compression in production
  experimental: {
    // Brotli compression
    outputFileTracingIncludes: {},
  },
  
  // Custom headers for compression
  async headers() {
    return [
      {
        source: '/:all*(js|css)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};
```

## Variants

### With Bundlewatch

```json
// bundlewatch.config.json
{
  "files": [
    {
      "path": ".next/static/chunks/main-*.js",
      "maxSize": "100KB"
    },
    {
      "path": ".next/static/chunks/pages/_app-*.js",
      "maxSize": "50KB"
    },
    {
      "path": ".next/static/chunks/pages/index-*.js",
      "maxSize": "30KB"
    },
    {
      "path": ".next/static/css/*.css",
      "maxSize": "50KB"
    }
  ],
  "defaultCompression": "gzip"
}
```

### With Source Map Explorer

```bash
# package.json scripts
{
  "scripts": {
    "analyze:source-map": "source-map-explorer .next/static/chunks/*.js --html report.html"
  }
}
```

## Anti-patterns

```typescript
// BAD: Importing entire library
import * as _ from 'lodash';
_.debounce(fn, 300);

// GOOD: Named import
import { debounce } from 'lodash-es';
debounce(fn, 300);

// BAD: Barrel imports that break tree-shaking
import { Button, Input, Card } from '@/components/ui';

// GOOD: Direct imports when tree-shaking doesn't work
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// BAD: Client-side heavy computation
import { parse } from 'csv-parse/sync';

// GOOD: Move to API route or use web worker
const parseCSV = async (data) => {
  const response = await fetch('/api/parse-csv', {
    method: 'POST',
    body: data,
  });
  return response.json();
};
```

## Related Patterns

- `lazy-loading.md` - Dynamic imports
- `code-splitting.md` - Code splitting
- `tree-shaking.md` - Tree shaking
- `lighthouse-optimization.md` - Performance scoring

## Changelog

### 2.0.0 (2025-01-17)
- Standardized to atomic design system v2
- Updated frontmatter schema

### 1.0.0 (2024-01-15)
- Initial bundle optimization pattern
