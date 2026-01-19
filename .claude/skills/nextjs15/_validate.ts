#!/usr/bin/env npx ts-node
/**
 * Skill Docbase Validation Script
 *
 * Validates all skill markdown files against the canonical schema and layer rules.
 *
 * Usage:
 *   npx ts-node _validate.ts              # Full validation
 *   npx ts-node _validate.ts --fix        # Attempt to fix minor issues
 *   npx ts-node _validate.ts --layer=L1   # Validate specific layer only
 *   npx ts-node _validate.ts --graph      # Output composition graph
 *   npx ts-node _validate.ts --formulas   # Validate all formula fields
 *   npx ts-node _validate.ts --orphans    # Find skills never composed into
 *   npx ts-node _validate.ts --stats      # Show composition statistics
 *   npx ts-node _validate.ts --generate-registry  # Generate _compositions.json
 */

import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'yaml';

// Types
interface Frontmatter {
  id: string;
  name: string;
  version: string;
  layer: string;
  category: string;
  description: string;
  tags: string[];
  composes?: string[];
  formula?: string;
  dependencies?: Record<string, string>;
  performance?: {
    impact?: string;
    lcp?: string;
    cls?: string;
  };
  accessibility?: {
    wcag?: string;
    keyboard?: boolean;
    'screen-reader'?: boolean;
  };
  complexity?: string;
  estimated_time?: string;
}

interface ValidationResult {
  file: string;
  errors: string[];
  warnings: string[];
}

interface LayerRules {
  layers: Record<string, {
    name: string;
    directory: string;
    idPrefix: string;
    canCompose: string[];
    mustCompose?: boolean;
    minCompositions?: number;
    categories: string[];
  }>;
  validation: {
    formulaRules?: {
      pattern: string;
      required: string[];
    };
    sectionExemptions?: Record<string, string[]>;
  };
}

interface CompositionGraph {
  nodes: Map<string, { id: string; layer: string; name: string }>;
  edges: Map<string, Set<string>>; // id -> set of composed ids
  reverseEdges: Map<string, Set<string>>; // id -> set of ids that compose this
}

interface SkillFile {
  path: string;
  frontmatter: Frontmatter;
  body: string;
}

// Load layer rules
const layerRulesPath = path.join(__dirname, '_layer-rules.json');
const layerRules: LayerRules = JSON.parse(fs.readFileSync(layerRulesPath, 'utf-8'));

// Layer number extraction
const getLayerNumber = (layer: string): number => {
  const match = layer.match(/^L(\d+)$/);
  return match ? parseInt(match[1], 10) : -1;
};

// Parse frontmatter from markdown
const parseFrontmatter = (content: string): { frontmatter: Frontmatter | null; body: string } => {
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) {
    return { frontmatter: null, body: content };
  }
  try {
    const frontmatter = yaml.parse(match[1]) as Frontmatter;
    return { frontmatter, body: match[2] };
  } catch (e) {
    return { frontmatter: null, body: content };
  }
};

// Validate a single file
const validateFile = (filePath: string, allFiles: Set<string>): ValidationResult => {
  const result: ValidationResult = {
    file: filePath,
    errors: [],
    warnings: [],
  };

  const content = fs.readFileSync(filePath, 'utf-8');
  const { frontmatter, body } = parseFrontmatter(content);

  if (!frontmatter) {
    result.errors.push('Missing or invalid YAML frontmatter');
    return result;
  }

  // Get expected layer from directory
  const dirName = path.basename(path.dirname(filePath));
  const expectedLayer = Object.entries(layerRules.layers).find(
    ([_, config]) => config.directory === dirName
  );

  // Validate required fields
  const requiredFields = ['id', 'name', 'version', 'layer', 'category', 'description', 'tags'];
  for (const field of requiredFields) {
    if (!frontmatter[field as keyof Frontmatter]) {
      result.errors.push(`Missing required field: ${field}`);
    }
  }

  // Validate layer format
  if (frontmatter.layer && !/^L[0-6]$/.test(frontmatter.layer)) {
    result.errors.push(`Invalid layer format: "${frontmatter.layer}" (expected L0-L6)`);
  }

  // Validate ID prefix matches layer
  if (frontmatter.id && frontmatter.layer && expectedLayer) {
    const [layerKey, layerConfig] = expectedLayer;
    if (!frontmatter.id.startsWith(layerConfig.idPrefix)) {
      result.errors.push(
        `ID "${frontmatter.id}" should start with "${layerConfig.idPrefix}" for ${layerKey}`
      );
    }
  }

  // Validate category is valid for layer
  if (frontmatter.category && frontmatter.layer) {
    const layerConfig = layerRules.layers[frontmatter.layer];
    if (layerConfig && !layerConfig.categories.includes(frontmatter.category)) {
      result.warnings.push(
        `Category "${frontmatter.category}" not in allowed list for ${frontmatter.layer}: [${layerConfig.categories.join(', ')}]`
      );
    }
  }

  // Validate composition rules
  if (frontmatter.composes && frontmatter.layer) {
    const currentLayerNum = getLayerNumber(frontmatter.layer);
    const layerConfig = layerRules.layers[frontmatter.layer];

    for (const composePath of frontmatter.composes) {
      // Check for proper relative path format (../directory/file.md)
      const relativePathPattern = /^\.\.\/[a-z]+\/[a-z0-9-]+\.md$/;
      if (!relativePathPattern.test(composePath)) {
        result.errors.push(
          `Invalid composes format: "${composePath}" (expected "../directory/filename.md")`
        );
        continue;
      }

      // Check if referenced file exists
      const absolutePath = path.resolve(path.dirname(filePath), composePath);
      if (!allFiles.has(absolutePath)) {
        result.errors.push(`Broken composition reference: ${composePath}`);
      }

      // Check for upward composition (violation)
      const composedDir = composePath.split('/')[1]; // e.g., "../atoms/button.md" -> "atoms"
      const composedLayerEntry = Object.entries(layerRules.layers).find(
        ([_, config]) => config.directory === composedDir
      );

      if (composedLayerEntry) {
        const [composedLayerKey] = composedLayerEntry;
        const composedLayerNum = getLayerNumber(composedLayerKey);

        if (composedLayerNum >= currentLayerNum) {
          result.errors.push(
            `Upward composition violation: ${frontmatter.layer} cannot compose from ${composedLayerKey} (${composePath})`
          );
        }
      }
    }
  }

  // Validate cross-references in body
  const crossRefPattern = /\[.*?\]\((\.\.\/[^)]+\.md)\)/g;
  let match;
  while ((match = crossRefPattern.exec(body)) !== null) {
    const refPath = match[1];
    const absolutePath = path.resolve(path.dirname(filePath), refPath);
    if (!allFiles.has(absolutePath)) {
      result.warnings.push(`Broken cross-reference in content: ${refPath}`);
    }
  }

  // Check for required sections
  const requiredSections = ['## Overview', '## When to Use', '## Implementation', '## Examples'];
  for (const section of requiredSections) {
    if (!body.includes(section)) {
      result.warnings.push(`Missing recommended section: ${section}`);
    }
  }

  // Check for composition diagram (required for L2+)
  const layerNum = getLayerNumber(frontmatter.layer);
  const exemptions = layerRules.validation?.sectionExemptions?.[frontmatter.layer] || [];
  if (layerNum >= 2 && !exemptions.includes('Composition Diagram')) {
    if (!body.includes('## Composition Diagram')) {
      result.warnings.push('Missing Composition Diagram section (required for L2+)');
    }
  }

  // Validate formula field (required for L2+)
  const formulaRequired = layerRules.validation?.formulaRules?.required || [];
  if (formulaRequired.includes(frontmatter.layer)) {
    if (!frontmatter.formula) {
      result.warnings.push(`Missing formula field (required for ${frontmatter.layer})`);
    } else {
      // Validate formula format
      const formulaPattern = layerRules.validation?.formulaRules?.pattern;
      if (formulaPattern && !new RegExp(formulaPattern).test(frontmatter.formula)) {
        result.warnings.push(`Invalid formula format: "${frontmatter.formula}"`);
      }

      // Validate formula-composes consistency
      if (frontmatter.composes && frontmatter.composes.length > 0) {
        // Extract IDs from formula (e.g., "ProductCard(o-product-card)" -> "o-product-card")
        const formulaIdPattern = /\(([a-z]+-[a-z0-9-]+)\)/g;
        const formulaIds = new Set<string>();
        let match;
        while ((match = formulaIdPattern.exec(frontmatter.formula)) !== null) {
          formulaIds.add(match[1]);
        }

        // Extract IDs from composes paths (e.g., "../organisms/product-card.md" -> "o-product-card")
        const composesIds: string[] = [];
        for (const composePath of frontmatter.composes) {
          const pathMatch = composePath.match(/^\.\.\/([a-z]+)\/([a-z0-9-]+)\.md$/);
          if (pathMatch) {
            const dirName = pathMatch[1];
            const baseName = pathMatch[2];
            const layerEntry = Object.entries(layerRules.layers).find(
              ([_, config]) => config.directory === dirName
            );
            if (layerEntry) {
              composesIds.push(`${layerEntry[1].idPrefix}${baseName}`);
            }
          }
        }

        // Check for missing IDs in formula
        const missingInFormula = composesIds.filter(id => !formulaIds.has(id));
        if (missingInFormula.length > 0) {
          result.warnings.push(
            `Formula missing ${missingInFormula.length} composed skill(s): ${missingInFormula.slice(0, 3).join(', ')}${missingInFormula.length > 3 ? '...' : ''}`
          );
        }
      }
    }
  }

  // Validate minimum compositions
  const layerConfig = layerRules.layers[frontmatter.layer];
  if (layerConfig?.mustCompose && layerConfig?.minCompositions) {
    const composesCount = frontmatter.composes?.length || 0;
    if (composesCount < layerConfig.minCompositions) {
      result.warnings.push(
        `Insufficient compositions: ${composesCount} < ${layerConfig.minCompositions} required for ${frontmatter.layer}`
      );
    }
  }

  // Validate version format
  if (frontmatter.version && !/^\d+\.\d+\.\d+$/.test(frontmatter.version)) {
    result.errors.push(`Invalid version format: "${frontmatter.version}" (expected semver)`);
  }

  // Validate tags format
  if (frontmatter.tags) {
    for (const tag of frontmatter.tags) {
      if (!/^[a-z][a-z0-9-]*$/.test(tag)) {
        result.warnings.push(`Invalid tag format: "${tag}" (should be lowercase with hyphens)`);
      }
    }
  }

  return result;
};

// Find all markdown files in references directory
const findMarkdownFiles = (dir: string): string[] => {
  const files: string[] = [];
  
  const walk = (currentDir: string) => {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (entry.isFile() && entry.name.endsWith('.md') && !entry.name.startsWith('_')) {
        files.push(fullPath);
      }
    }
  };
  
  walk(dir);
  return files;
};

// Build composition graph from all skill files
const buildCompositionGraph = (referencesDir: string, allFilePaths: Set<string>): { graph: CompositionGraph; files: SkillFile[] } => {
  const graph: CompositionGraph = {
    nodes: new Map(),
    edges: new Map(),
    reverseEdges: new Map(),
  };
  const files: SkillFile[] = [];

  for (const filePath of allFilePaths) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const { frontmatter, body } = parseFrontmatter(content);
    if (!frontmatter?.id) continue;

    files.push({ path: filePath, frontmatter, body });

    // Add node
    graph.nodes.set(frontmatter.id, {
      id: frontmatter.id,
      layer: frontmatter.layer,
      name: frontmatter.name,
    });

    // Initialize edge sets
    if (!graph.edges.has(frontmatter.id)) {
      graph.edges.set(frontmatter.id, new Set());
    }
    if (!graph.reverseEdges.has(frontmatter.id)) {
      graph.reverseEdges.set(frontmatter.id, new Set());
    }
  }

  // Build edges from composes arrays
  for (const file of files) {
    if (!file.frontmatter.composes) continue;

    for (const composePath of file.frontmatter.composes) {
      // Extract the ID from the file path (e.g., "../atoms/button.md" -> "a-button")
      const baseName = path.basename(composePath, '.md');
      const dirName = composePath.split('/')[1]; // e.g., "atoms"
      const layerEntry = Object.entries(layerRules.layers).find(
        ([_, config]) => config.directory === dirName
      );

      if (layerEntry) {
        const composedId = `${layerEntry[1].idPrefix}${baseName}`;

        graph.edges.get(file.frontmatter.id)?.add(composedId);

        if (!graph.reverseEdges.has(composedId)) {
          graph.reverseEdges.set(composedId, new Set());
        }
        graph.reverseEdges.get(composedId)?.add(file.frontmatter.id);
      }
    }
  }

  return { graph, files };
};

// Detect circular dependencies in the composition graph
const detectCircularDependencies = (graph: CompositionGraph): string[][] => {
  const cycles: string[][] = [];
  const visited = new Set<string>();
  const recursionStack = new Set<string>();
  const pathStack: string[] = [];

  const dfs = (nodeId: string): void => {
    visited.add(nodeId);
    recursionStack.add(nodeId);
    pathStack.push(nodeId);

    const edges = graph.edges.get(nodeId) || new Set();
    for (const neighborId of edges) {
      if (!visited.has(neighborId)) {
        dfs(neighborId);
      } else if (recursionStack.has(neighborId)) {
        // Found a cycle
        const cycleStart = pathStack.indexOf(neighborId);
        const cycle = [...pathStack.slice(cycleStart), neighborId];
        cycles.push(cycle);
      }
    }

    pathStack.pop();
    recursionStack.delete(nodeId);
  };

  for (const nodeId of graph.nodes.keys()) {
    if (!visited.has(nodeId)) {
      dfs(nodeId);
    }
  }

  return cycles;
};

// Find orphan skills (never composed into by anything)
const findOrphanSkills = (graph: CompositionGraph): string[] => {
  const orphans: string[] = [];

  for (const [id, node] of graph.nodes) {
    // L0 (primitives) are expected to not be composed - they're design tokens
    // L6 (recipes) are top-level and shouldn't be composed into
    if (node.layer === 'L0' || node.layer === 'L6') continue;

    const composedBy = graph.reverseEdges.get(id);
    if (!composedBy || composedBy.size === 0) {
      orphans.push(id);
    }
  }

  return orphans.sort();
};

// Get composition statistics
const getCompositionStats = (graph: CompositionGraph): {
  totalSkills: number;
  compositionEdges: number;
  byLayer: Record<string, { count: number; avgCompositions: number }>;
  mostComposed: Array<{ id: string; count: number }>;
  mostComposing: Array<{ id: string; count: number }>;
} => {
  const stats = {
    totalSkills: graph.nodes.size,
    compositionEdges: 0,
    byLayer: {} as Record<string, { count: number; totalCompositions: number; avgCompositions: number }>,
    mostComposed: [] as Array<{ id: string; count: number }>,
    mostComposing: [] as Array<{ id: string; count: number }>,
  };

  // Count edges
  for (const edges of graph.edges.values()) {
    stats.compositionEdges += edges.size;
  }

  // Group by layer
  for (const [id, node] of graph.nodes) {
    if (!stats.byLayer[node.layer]) {
      stats.byLayer[node.layer] = { count: 0, totalCompositions: 0, avgCompositions: 0 };
    }
    stats.byLayer[node.layer].count++;
    stats.byLayer[node.layer].totalCompositions += graph.edges.get(id)?.size || 0;
  }

  // Calculate averages
  for (const layer of Object.keys(stats.byLayer)) {
    const layerStats = stats.byLayer[layer];
    layerStats.avgCompositions = layerStats.count > 0
      ? Math.round((layerStats.totalCompositions / layerStats.count) * 10) / 10
      : 0;
  }

  // Find most composed (most reused)
  const composedCounts: Array<{ id: string; count: number }> = [];
  for (const [id, composedBy] of graph.reverseEdges) {
    composedCounts.push({ id, count: composedBy.size });
  }
  stats.mostComposed = composedCounts
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Find most composing (most dependencies)
  const composingCounts: Array<{ id: string; count: number }> = [];
  for (const [id, edges] of graph.edges) {
    composingCounts.push({ id, count: edges.size });
  }
  stats.mostComposing = composingCounts
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return stats;
};

// Output composition graph as JSON
const outputGraph = (graph: CompositionGraph): void => {
  const output: Record<string, { composedBy: string[]; composes: string[] }> = {};

  for (const [id] of graph.nodes) {
    output[id] = {
      composedBy: Array.from(graph.reverseEdges.get(id) || []).sort(),
      composes: Array.from(graph.edges.get(id) || []).sort(),
    };
  }

  console.log(JSON.stringify(output, null, 2));
};

// Generate _compositions.json registry
const generateCompositionsRegistry = (graph: CompositionGraph, files: SkillFile[]): void => {
  const stats = getCompositionStats(graph);
  const orphans = findOrphanSkills(graph);

  // Build graph object
  const graphOutput: Record<string, { composedBy: string[]; composes: string[] }> = {};
  for (const [id] of graph.nodes) {
    graphOutput[id] = {
      composedBy: Array.from(graph.reverseEdges.get(id) || []).sort(),
      composes: Array.from(graph.edges.get(id) || []).sort(),
    };
  }

  // Build formulas map
  const formulas: Record<string, string> = {};
  for (const file of files) {
    if (file.frontmatter.formula) {
      formulas[file.frontmatter.id] = file.frontmatter.formula;
    }
  }

  const registry = {
    generated: new Date().toISOString(),
    totalSkills: stats.totalSkills,
    compositionEdges: stats.compositionEdges,
    byLayer: Object.fromEntries(
      Object.entries(stats.byLayer).map(([layer, data]) => [
        layer,
        { count: data.count, avgCompositions: data.avgCompositions }
      ])
    ),
    graph: graphOutput,
    orphans,
    mostReused: stats.mostComposed.filter(item => item.count > 0).map(item => ({
      id: item.id,
      usedBy: item.count
    })),
    mostDependencies: stats.mostComposing.filter(item => item.count > 0).map(item => ({
      id: item.id,
      dependsOn: item.count
    })),
    formulas,
  };

  const outputPath = path.join(__dirname, '_compositions.json');
  fs.writeFileSync(outputPath, JSON.stringify(registry, null, 2));
  console.log(`\n✅ Generated _compositions.json with ${stats.totalSkills} skills and ${stats.compositionEdges} composition edges.\n`);
};

// Main validation function
const main = () => {
  const args = process.argv.slice(2);
  const layerFilter = args.find(arg => arg.startsWith('--layer='))?.split('=')[1];
  const showGraph = args.includes('--graph');
  const showFormulas = args.includes('--formulas');
  const showOrphans = args.includes('--orphans');
  const showStats = args.includes('--stats');
  const generateRegistry = args.includes('--generate-registry');

  const referencesDir = path.join(__dirname, 'references');
  const allFilePaths = new Set(findMarkdownFiles(referencesDir));

  // Build composition graph for graph-based operations
  const { graph, files } = buildCompositionGraph(referencesDir, allFilePaths);

  // Handle --generate-registry flag
  if (generateRegistry) {
    generateCompositionsRegistry(graph, files);
    return;
  }

  // Handle --graph flag
  if (showGraph) {
    console.log('\n📊 Composition Graph:\n');
    outputGraph(graph);
    return;
  }

  // Handle --stats flag
  if (showStats) {
    const stats = getCompositionStats(graph);
    console.log('\n📊 Composition Statistics:\n');
    console.log(`   Total skills: ${stats.totalSkills}`);
    console.log(`   Composition edges: ${stats.compositionEdges}`);
    console.log('\n   By Layer:');
    for (const [layer, layerStats] of Object.entries(stats.byLayer).sort()) {
      console.log(`     ${layer}: ${layerStats.count} skills, avg ${layerStats.avgCompositions} compositions`);
    }
    console.log('\n   Most Reused (composed by others):');
    for (const item of stats.mostComposed.slice(0, 10)) {
      if (item.count > 0) {
        console.log(`     ${item.id}: ${item.count} uses`);
      }
    }
    console.log('\n   Most Dependencies (composes from):');
    for (const item of stats.mostComposing.slice(0, 10)) {
      if (item.count > 0) {
        console.log(`     ${item.id}: ${item.count} dependencies`);
      }
    }
    console.log('');
    return;
  }

  // Handle --orphans flag
  if (showOrphans) {
    const orphans = findOrphanSkills(graph);
    console.log('\n🔍 Orphan Skills (never composed into):\n');
    if (orphans.length === 0) {
      console.log('   No orphans found! All L1-L5 skills are composed into higher layers.\n');
    } else {
      console.log(`   Found ${orphans.length} orphan skill(s):\n`);
      for (const id of orphans) {
        const node = graph.nodes.get(id);
        console.log(`   - ${id} (${node?.layer})`);
      }
      console.log('');
    }
    return;
  }

  // Handle --formulas flag
  if (showFormulas) {
    console.log('\n📐 Formula Validation:\n');
    let formulaErrors = 0;
    let formulaCount = 0;
    const formulaRequired = layerRules.validation?.formulaRules?.required || [];

    for (const file of files) {
      if (!formulaRequired.includes(file.frontmatter.layer)) continue;

      if (!file.frontmatter.formula) {
        console.log(`   ❌ ${file.frontmatter.id}: Missing formula`);
        formulaErrors++;
      } else {
        formulaCount++;
        // Optionally validate formula format
        const formulaPattern = layerRules.validation?.formulaRules?.pattern;
        if (formulaPattern && !new RegExp(formulaPattern).test(file.frontmatter.formula)) {
          console.log(`   ⚠️  ${file.frontmatter.id}: Invalid format "${file.frontmatter.formula}"`);
          formulaErrors++;
        }
      }
    }

    console.log('\n' + '─'.repeat(60));
    console.log(`   Valid formulas: ${formulaCount}`);
    console.log(`   Issues: ${formulaErrors}`);
    console.log('');
    return;
  }

  // Standard validation
  console.log(`\n📁 Scanning ${allFilePaths.size} skill files...\n`);

  // Check for circular dependencies
  const cycles = detectCircularDependencies(graph);
  if (cycles.length > 0) {
    console.log('🔄 Circular Dependencies Detected:\n');
    for (const cycle of cycles) {
      console.log(`   ❌ ${cycle.join(' → ')}`);
    }
    console.log('');
  }

  const results: ValidationResult[] = [];
  let errorCount = cycles.length; // Include cycle errors
  let warningCount = 0;

  for (const file of allFilePaths) {
    // Filter by layer if specified
    if (layerFilter) {
      const dirName = path.basename(path.dirname(file));
      const layerConfig = Object.entries(layerRules.layers).find(
        ([key]) => key === layerFilter
      );
      if (layerConfig && layerConfig[1].directory !== dirName) {
        continue;
      }
    }

    const result = validateFile(file, allFilePaths);
    if (result.errors.length > 0 || result.warnings.length > 0) {
      results.push(result);
      errorCount += result.errors.length;
      warningCount += result.warnings.length;
    }
  }

  // Output results
  if (results.length === 0 && cycles.length === 0) {
    console.log('✅ All files passed validation!\n');
  } else {
    for (const result of results) {
      const relativePath = path.relative(referencesDir, result.file);
      console.log(`\n📄 ${relativePath}`);

      for (const error of result.errors) {
        console.log(`   ❌ ERROR: ${error}`);
      }
      for (const warning of result.warnings) {
        console.log(`   ⚠️  WARN: ${warning}`);
      }
    }

    console.log('\n' + '─'.repeat(60));
    console.log(`\n📊 Summary:`);
    console.log(`   Files scanned: ${allFilePaths.size}`);
    console.log(`   Files with issues: ${results.length}`);
    console.log(`   Circular dependencies: ${cycles.length}`);
    console.log(`   Total errors: ${errorCount}`);
    console.log(`   Total warnings: ${warningCount}`);
    console.log('');
  }

  // Exit with error code if there are errors
  process.exit(errorCount > 0 ? 1 : 0);
};

main();
