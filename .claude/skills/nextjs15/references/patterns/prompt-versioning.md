---
id: pt-prompt-versioning
name: Prompt Versioning & A/B Testing
version: 1.0.0
layer: L5
category: ai
description: Version control for prompts with A/B testing, performance tracking, rollback capabilities, and analytics
tags: [ai, prompts, versioning, ab-testing, analytics, experiments, llm, next15, react19]
composes: []
dependencies:
  zod: "^3.23.0"
  uuid: "^9.0.0"
formula: "PromptVersioning = VersionControl + ABTesting + MetricsCollection + RollbackSystem"
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# Prompt Versioning & A/B Testing

## Overview

Prompts are the interface between your application and LLMs, making them critical to output quality and user experience. Like any critical code, prompts need version control, testing, and monitoring. This pattern implements a comprehensive prompt management system with version history, A/B testing capabilities, performance tracking, and instant rollback.

Traditional software benefits from version control, code review, and A/B testing. Prompt engineering deserves the same rigor. Small changes in wording can dramatically affect LLM output quality, cost, and latency. Without proper versioning, teams lose the ability to track what changed, why, and how it affected results. This pattern provides infrastructure for treating prompts as first-class software artifacts.

The system supports multiple prompt types (system prompts, user templates, few-shot examples), tracks performance metrics per version, enables controlled experiments between prompt variants, and provides instant rollback when issues are detected. It integrates with analytics to correlate prompt versions with business outcomes.

## When to Use

- When multiple team members edit prompts and changes need to be tracked
- For A/B testing different prompt strategies to optimize performance
- When deploying prompts to production requires rollback capability
- For tracking prompt performance metrics over time
- When compliance requires audit trails of AI system changes
- For experimenting with prompt variations without disrupting production

## When NOT to Use

- Single-developer prototypes with rapid iteration
- Prompts that never change after initial deployment
- Applications where prompt changes don't meaningfully affect output
- When the overhead of versioning exceeds the value of tracking

## Composition Diagram

```
+------------------------------------------------------------------+
|                    Prompt Versioning System                       |
|  +------------------------------------------------------------+  |
|  |                   Version Control                           |  |
|  |  [v1.0.0] -> [v1.1.0] -> [v1.2.0] -> [v2.0.0]             |  |
|  |  [Commit History] [Diffs] [Tags] [Branches]                |  |
|  +------------------------------------------------------------+  |
|                              |                                    |
|  +------------------------------------------------------------+  |
|  |                   A/B Test Engine                           |  |
|  |  +---------------+  +---------------+  +---------------+   |  |
|  |  | Control (50%) |  | Variant A(25%)|  | Variant B(25%)|   |  |
|  |  +---------------+  +---------------+  +---------------+   |  |
|  +------------------------------------------------------------+  |
|                              |                                    |
|  +------------------------------------------------------------+  |
|  |                   Metrics Collection                        |  |
|  |  [Latency] [Tokens] [Quality Score] [User Feedback]        |  |
|  |  [Conversion] [Error Rate] [Cost]                          |  |
|  +------------------------------------------------------------+  |
|                              |                                    |
|  +------------------------------------------------------------+  |
|  |                   Deployment Control                        |  |
|  |  [Production] [Staging] [Preview] [Rollback]               |  |
|  +------------------------------------------------------------+  |
+------------------------------------------------------------------+
```

## Installation

```bash
npm install zod uuid date-fns
```

## Environment Configuration

```bash
# .env.local
PROMPT_STORAGE_TYPE=database  # or 'file', 'redis'
DATABASE_URL=postgresql://...

# Analytics
ANALYTICS_ENABLED=true
ANALYTICS_SAMPLE_RATE=1.0

# Feature flags
PROMPT_AB_TESTING_ENABLED=true
```

## Type Definitions

```typescript
// lib/prompts/types.ts

export interface PromptTemplate {
  id: string;
  name: string;
  description: string;
  type: PromptType;
  content: string;
  variables: PromptVariable[];
  metadata: PromptMetadata;
  version: string;
  createdAt: Date;
  createdBy: string;
  updatedAt: Date;
  updatedBy: string;
}

export type PromptType = 'system' | 'user' | 'assistant' | 'few-shot' | 'template';

export interface PromptVariable {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  description: string;
  required: boolean;
  defaultValue?: unknown;
  validation?: string; // Regex or zod schema string
}

export interface PromptMetadata {
  tags: string[];
  category: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
}

export interface PromptVersion {
  id: string;
  promptId: string;
  version: string;
  content: string;
  variables: PromptVariable[];
  metadata: PromptMetadata;
  changeDescription: string;
  createdAt: Date;
  createdBy: string;
  status: VersionStatus;
  metrics?: VersionMetrics;
}

export type VersionStatus = 'draft' | 'review' | 'approved' | 'production' | 'deprecated' | 'archived';

export interface VersionMetrics {
  totalRequests: number;
  avgLatencyMs: number;
  avgInputTokens: number;
  avgOutputTokens: number;
  avgCost: number;
  qualityScore: number;
  errorRate: number;
  userSatisfaction?: number;
}

export interface ABExperiment {
  id: string;
  name: string;
  description: string;
  promptId: string;
  status: ExperimentStatus;
  variants: ExperimentVariant[];
  targetMetric: string;
  minimumSampleSize: number;
  confidenceLevel: number;
  startedAt?: Date;
  endedAt?: Date;
  winner?: string;
  createdAt: Date;
  createdBy: string;
}

export type ExperimentStatus = 'draft' | 'running' | 'paused' | 'completed' | 'cancelled';

export interface ExperimentVariant {
  id: string;
  name: string;
  promptVersionId: string;
  trafficPercentage: number;
  metrics: VariantMetrics;
}

export interface VariantMetrics {
  impressions: number;
  conversions: number;
  conversionRate: number;
  avgLatencyMs: number;
  avgQualityScore: number;
  avgCost: number;
  samples: MetricSample[];
}

export interface MetricSample {
  timestamp: Date;
  latencyMs: number;
  inputTokens: number;
  outputTokens: number;
  cost: number;
  qualityScore?: number;
  userFeedback?: number;
  converted?: boolean;
  metadata?: Record<string, unknown>;
}

export interface PromptExecutionContext {
  userId?: string;
  sessionId?: string;
  experimentId?: string;
  variantId?: string;
  metadata?: Record<string, unknown>;
}
```

## Prompt Store

```typescript
// lib/prompts/store.ts

import { v4 as uuid } from 'uuid';
import {
  PromptTemplate,
  PromptVersion,
  PromptVariable,
  PromptMetadata,
  VersionStatus,
  VersionMetrics,
} from './types';

class PromptStore {
  private prompts: Map<string, PromptTemplate> = new Map();
  private versions: Map<string, PromptVersion[]> = new Map();
  private productionVersions: Map<string, string> = new Map(); // promptId -> versionId

  // Create a new prompt
  createPrompt(params: {
    name: string;
    description: string;
    type: PromptTemplate['type'];
    content: string;
    variables?: PromptVariable[];
    metadata?: Partial<PromptMetadata>;
    createdBy: string;
  }): PromptTemplate {
    const id = uuid();
    const now = new Date();

    const prompt: PromptTemplate = {
      id,
      name: params.name,
      description: params.description,
      type: params.type,
      content: params.content,
      variables: params.variables || [],
      metadata: {
        tags: [],
        category: 'general',
        ...params.metadata,
      },
      version: '1.0.0',
      createdAt: now,
      createdBy: params.createdBy,
      updatedAt: now,
      updatedBy: params.createdBy,
    };

    this.prompts.set(id, prompt);

    // Create initial version
    this.createVersion(id, {
      content: params.content,
      variables: params.variables || [],
      metadata: prompt.metadata,
      changeDescription: 'Initial version',
      createdBy: params.createdBy,
    });

    return prompt;
  }

  // Get prompt by ID
  getPrompt(id: string): PromptTemplate | undefined {
    return this.prompts.get(id);
  }

  // Get prompt by name
  getPromptByName(name: string): PromptTemplate | undefined {
    return Array.from(this.prompts.values()).find(p => p.name === name);
  }

  // List all prompts
  listPrompts(filters?: {
    type?: PromptTemplate['type'];
    category?: string;
    tags?: string[];
  }): PromptTemplate[] {
    let prompts = Array.from(this.prompts.values());

    if (filters?.type) {
      prompts = prompts.filter(p => p.type === filters.type);
    }

    if (filters?.category) {
      prompts = prompts.filter(p => p.metadata.category === filters.category);
    }

    if (filters?.tags && filters.tags.length > 0) {
      prompts = prompts.filter(p =>
        filters.tags!.some(tag => p.metadata.tags.includes(tag))
      );
    }

    return prompts;
  }

  // Create a new version
  createVersion(promptId: string, params: {
    content: string;
    variables: PromptVariable[];
    metadata: PromptMetadata;
    changeDescription: string;
    createdBy: string;
  }): PromptVersion {
    const prompt = this.prompts.get(promptId);
    if (!prompt) throw new Error(`Prompt ${promptId} not found`);

    const existingVersions = this.versions.get(promptId) || [];
    const newVersionNumber = this.incrementVersion(
      existingVersions.length > 0
        ? existingVersions[existingVersions.length - 1].version
        : '0.0.0'
    );

    const version: PromptVersion = {
      id: uuid(),
      promptId,
      version: newVersionNumber,
      content: params.content,
      variables: params.variables,
      metadata: params.metadata,
      changeDescription: params.changeDescription,
      createdAt: new Date(),
      createdBy: params.createdBy,
      status: 'draft',
    };

    if (!this.versions.has(promptId)) {
      this.versions.set(promptId, []);
    }
    this.versions.get(promptId)!.push(version);

    // Update prompt with latest version
    prompt.version = newVersionNumber;
    prompt.content = params.content;
    prompt.variables = params.variables;
    prompt.metadata = params.metadata;
    prompt.updatedAt = new Date();
    prompt.updatedBy = params.createdBy;

    return version;
  }

  // Get version by ID
  getVersion(versionId: string): PromptVersion | undefined {
    for (const versions of this.versions.values()) {
      const version = versions.find(v => v.id === versionId);
      if (version) return version;
    }
    return undefined;
  }

  // Get all versions for a prompt
  getVersions(promptId: string): PromptVersion[] {
    return this.versions.get(promptId) || [];
  }

  // Get production version
  getProductionVersion(promptId: string): PromptVersion | undefined {
    const versionId = this.productionVersions.get(promptId);
    if (!versionId) return undefined;
    return this.getVersion(versionId);
  }

  // Promote version to production
  promoteToProduction(versionId: string, promotedBy: string): PromptVersion {
    const version = this.getVersion(versionId);
    if (!version) throw new Error(`Version ${versionId} not found`);

    // Demote current production version
    const currentProdId = this.productionVersions.get(version.promptId);
    if (currentProdId) {
      const currentProd = this.getVersion(currentProdId);
      if (currentProd) {
        currentProd.status = 'deprecated';
      }
    }

    // Promote new version
    version.status = 'production';
    this.productionVersions.set(version.promptId, versionId);

    return version;
  }

  // Update version status
  updateVersionStatus(versionId: string, status: VersionStatus): void {
    const version = this.getVersion(versionId);
    if (version) {
      version.status = status;
    }
  }

  // Update version metrics
  updateVersionMetrics(versionId: string, metrics: Partial<VersionMetrics>): void {
    const version = this.getVersion(versionId);
    if (version) {
      version.metrics = {
        totalRequests: 0,
        avgLatencyMs: 0,
        avgInputTokens: 0,
        avgOutputTokens: 0,
        avgCost: 0,
        qualityScore: 0,
        errorRate: 0,
        ...version.metrics,
        ...metrics,
      };
    }
  }

  // Compare two versions
  compareVersions(versionAId: string, versionBId: string): {
    contentDiff: { added: string[]; removed: string[] };
    variablesDiff: { added: string[]; removed: string[] };
    metricsDiff?: Record<string, { a: number; b: number; diff: number }>;
  } {
    const versionA = this.getVersion(versionAId);
    const versionB = this.getVersion(versionBId);

    if (!versionA || !versionB) {
      throw new Error('One or both versions not found');
    }

    // Content diff (simple line-based)
    const linesA = versionA.content.split('\n');
    const linesB = versionB.content.split('\n');

    const contentDiff = {
      added: linesB.filter(l => !linesA.includes(l)),
      removed: linesA.filter(l => !linesB.includes(l)),
    };

    // Variables diff
    const varsA = versionA.variables.map(v => v.name);
    const varsB = versionB.variables.map(v => v.name);

    const variablesDiff = {
      added: varsB.filter(v => !varsA.includes(v)),
      removed: varsA.filter(v => !varsB.includes(v)),
    };

    // Metrics diff
    let metricsDiff: Record<string, { a: number; b: number; diff: number }> | undefined;

    if (versionA.metrics && versionB.metrics) {
      metricsDiff = {};
      const metricKeys = ['avgLatencyMs', 'avgCost', 'qualityScore', 'errorRate'] as const;

      for (const key of metricKeys) {
        const a = versionA.metrics[key] || 0;
        const b = versionB.metrics[key] || 0;
        metricsDiff[key] = { a, b, diff: b - a };
      }
    }

    return { contentDiff, variablesDiff, metricsDiff };
  }

  // Rollback to previous version
  rollback(promptId: string, targetVersionId: string, rolledBackBy: string): PromptVersion {
    const targetVersion = this.getVersion(targetVersionId);
    if (!targetVersion || targetVersion.promptId !== promptId) {
      throw new Error('Target version not found or does not belong to prompt');
    }

    // Create a new version based on the target (for audit trail)
    const newVersion = this.createVersion(promptId, {
      content: targetVersion.content,
      variables: targetVersion.variables,
      metadata: targetVersion.metadata,
      changeDescription: `Rollback to version ${targetVersion.version}`,
      createdBy: rolledBackBy,
    });

    // Promote to production
    return this.promoteToProduction(newVersion.id, rolledBackBy);
  }

  private incrementVersion(version: string): string {
    const parts = version.split('.').map(Number);
    parts[2]++; // Increment patch
    return parts.join('.');
  }
}

export const promptStore = new PromptStore();
```

## Prompt Renderer

```typescript
// lib/prompts/renderer.ts

import { PromptTemplate, PromptVariable, PromptVersion } from './types';
import { z } from 'zod';

export class PromptRenderer {
  render(
    prompt: PromptTemplate | PromptVersion,
    variables: Record<string, unknown> = {}
  ): string {
    // Validate required variables
    this.validateVariables(prompt.variables, variables);

    // Replace variables in content
    let content = prompt.content;

    for (const variable of prompt.variables) {
      const value = variables[variable.name] ?? variable.defaultValue;
      const placeholder = `{{${variable.name}}}`;

      if (variable.type === 'array') {
        content = content.replace(placeholder, (value as unknown[]).join('\n'));
      } else if (variable.type === 'object') {
        content = content.replace(placeholder, JSON.stringify(value, null, 2));
      } else {
        content = content.replace(placeholder, String(value));
      }
    }

    // Handle conditional blocks {{#if variable}}...{{/if}}
    content = this.processConditionals(content, variables);

    // Handle loops {{#each items}}...{{/each}}
    content = this.processLoops(content, variables);

    return content.trim();
  }

  private validateVariables(
    definitions: PromptVariable[],
    provided: Record<string, unknown>
  ): void {
    for (const def of definitions) {
      if (def.required && !(def.name in provided) && def.defaultValue === undefined) {
        throw new Error(`Required variable '${def.name}' is missing`);
      }

      const value = provided[def.name];
      if (value !== undefined) {
        this.validateType(def, value);

        if (def.validation) {
          this.validatePattern(def, value);
        }
      }
    }
  }

  private validateType(def: PromptVariable, value: unknown): void {
    const typeMap: Record<string, string> = {
      string: 'string',
      number: 'number',
      boolean: 'boolean',
      array: 'object', // typeof [] === 'object'
      object: 'object',
    };

    const expectedType = typeMap[def.type];
    const actualType = typeof value;

    if (def.type === 'array' && !Array.isArray(value)) {
      throw new Error(`Variable '${def.name}' must be an array`);
    }

    if (def.type !== 'array' && actualType !== expectedType) {
      throw new Error(`Variable '${def.name}' must be of type ${def.type}`);
    }
  }

  private validatePattern(def: PromptVariable, value: unknown): void {
    if (def.type === 'string' && def.validation) {
      const regex = new RegExp(def.validation);
      if (!regex.test(String(value))) {
        throw new Error(`Variable '${def.name}' does not match pattern ${def.validation}`);
      }
    }
  }

  private processConditionals(content: string, variables: Record<string, unknown>): string {
    const conditionalRegex = /\{\{#if\s+(\w+)\}\}([\s\S]*?)\{\{\/if\}\}/g;

    return content.replace(conditionalRegex, (_, varName, inner) => {
      const value = variables[varName];
      if (value && (Array.isArray(value) ? value.length > 0 : true)) {
        return inner;
      }
      return '';
    });
  }

  private processLoops(content: string, variables: Record<string, unknown>): string {
    const loopRegex = /\{\{#each\s+(\w+)\}\}([\s\S]*?)\{\{\/each\}\}/g;

    return content.replace(loopRegex, (_, varName, inner) => {
      const items = variables[varName];
      if (!Array.isArray(items)) return '';

      return items.map((item, index) => {
        let result = inner;
        result = result.replace(/\{\{this\}\}/g, String(item));
        result = result.replace(/\{\{@index\}\}/g, String(index));

        if (typeof item === 'object' && item !== null) {
          for (const [key, value] of Object.entries(item)) {
            result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), String(value));
          }
        }

        return result;
      }).join('\n');
    });
  }
}

export const promptRenderer = new PromptRenderer();
```

## A/B Testing Engine

```typescript
// lib/prompts/ab-testing.ts

import { v4 as uuid } from 'uuid';
import {
  ABExperiment,
  ExperimentVariant,
  ExperimentStatus,
  VariantMetrics,
  MetricSample,
  PromptExecutionContext,
} from './types';
import { promptStore } from './store';

class ABTestingEngine {
  private experiments: Map<string, ABExperiment> = new Map();
  private userAssignments: Map<string, Map<string, string>> = new Map(); // userId -> experimentId -> variantId

  createExperiment(params: {
    name: string;
    description: string;
    promptId: string;
    variants: Array<{
      name: string;
      promptVersionId: string;
      trafficPercentage: number;
    }>;
    targetMetric: string;
    minimumSampleSize?: number;
    confidenceLevel?: number;
    createdBy: string;
  }): ABExperiment {
    // Validate traffic percentages sum to 100
    const totalTraffic = params.variants.reduce((sum, v) => sum + v.trafficPercentage, 0);
    if (Math.abs(totalTraffic - 100) > 0.01) {
      throw new Error('Traffic percentages must sum to 100');
    }

    const experiment: ABExperiment = {
      id: uuid(),
      name: params.name,
      description: params.description,
      promptId: params.promptId,
      status: 'draft',
      variants: params.variants.map(v => ({
        id: uuid(),
        name: v.name,
        promptVersionId: v.promptVersionId,
        trafficPercentage: v.trafficPercentage,
        metrics: {
          impressions: 0,
          conversions: 0,
          conversionRate: 0,
          avgLatencyMs: 0,
          avgQualityScore: 0,
          avgCost: 0,
          samples: [],
        },
      })),
      targetMetric: params.targetMetric,
      minimumSampleSize: params.minimumSampleSize || 1000,
      confidenceLevel: params.confidenceLevel || 0.95,
      createdAt: new Date(),
      createdBy: params.createdBy,
    };

    this.experiments.set(experiment.id, experiment);
    return experiment;
  }

  startExperiment(experimentId: string): ABExperiment {
    const experiment = this.experiments.get(experimentId);
    if (!experiment) throw new Error(`Experiment ${experimentId} not found`);

    experiment.status = 'running';
    experiment.startedAt = new Date();

    return experiment;
  }

  pauseExperiment(experimentId: string): ABExperiment {
    const experiment = this.experiments.get(experimentId);
    if (!experiment) throw new Error(`Experiment ${experimentId} not found`);

    experiment.status = 'paused';
    return experiment;
  }

  completeExperiment(experimentId: string, winnerId?: string): ABExperiment {
    const experiment = this.experiments.get(experimentId);
    if (!experiment) throw new Error(`Experiment ${experimentId} not found`);

    experiment.status = 'completed';
    experiment.endedAt = new Date();

    if (winnerId) {
      experiment.winner = winnerId;
    } else {
      // Auto-determine winner based on target metric
      experiment.winner = this.determineWinner(experiment);
    }

    return experiment;
  }

  // Get variant for a user based on experiment assignment
  getVariantForUser(
    experimentId: string,
    userId: string
  ): ExperimentVariant | null {
    const experiment = this.experiments.get(experimentId);
    if (!experiment || experiment.status !== 'running') {
      return null;
    }

    // Check existing assignment
    const userExperiments = this.userAssignments.get(userId);
    if (userExperiments?.has(experimentId)) {
      const variantId = userExperiments.get(experimentId)!;
      return experiment.variants.find(v => v.id === variantId) || null;
    }

    // Assign variant based on traffic percentages
    const variant = this.assignVariant(experiment, userId);

    // Store assignment
    if (!this.userAssignments.has(userId)) {
      this.userAssignments.set(userId, new Map());
    }
    this.userAssignments.get(userId)!.set(experimentId, variant.id);

    return variant;
  }

  // Get prompt version for request (considering active experiments)
  resolvePromptVersion(
    promptId: string,
    context: PromptExecutionContext
  ): { versionId: string; experimentId?: string; variantId?: string } {
    // Find active experiment for this prompt
    const activeExperiment = Array.from(this.experiments.values()).find(
      e => e.promptId === promptId && e.status === 'running'
    );

    if (activeExperiment && context.userId) {
      const variant = this.getVariantForUser(activeExperiment.id, context.userId);
      if (variant) {
        return {
          versionId: variant.promptVersionId,
          experimentId: activeExperiment.id,
          variantId: variant.id,
        };
      }
    }

    // Fall back to production version
    const productionVersion = promptStore.getProductionVersion(promptId);
    if (!productionVersion) {
      throw new Error(`No production version found for prompt ${promptId}`);
    }

    return { versionId: productionVersion.id };
  }

  // Record metric for a variant
  recordMetric(
    experimentId: string,
    variantId: string,
    sample: MetricSample
  ): void {
    const experiment = this.experiments.get(experimentId);
    if (!experiment) return;

    const variant = experiment.variants.find(v => v.id === variantId);
    if (!variant) return;

    variant.metrics.samples.push(sample);
    variant.metrics.impressions++;

    if (sample.converted) {
      variant.metrics.conversions++;
    }

    // Update aggregates
    this.updateVariantAggregates(variant);

    // Check if we have enough data to conclude
    this.checkExperimentCompletion(experiment);
  }

  getExperiment(experimentId: string): ABExperiment | undefined {
    return this.experiments.get(experimentId);
  }

  getExperimentsForPrompt(promptId: string): ABExperiment[] {
    return Array.from(this.experiments.values()).filter(e => e.promptId === promptId);
  }

  getExperimentResults(experimentId: string): {
    experiment: ABExperiment;
    analysis: {
      winner: string | null;
      confidence: number;
      improvement: number;
      significanceReached: boolean;
    };
  } {
    const experiment = this.experiments.get(experimentId);
    if (!experiment) throw new Error(`Experiment ${experimentId} not found`);

    const analysis = this.analyzeExperiment(experiment);

    return { experiment, analysis };
  }

  private assignVariant(experiment: ABExperiment, userId: string): ExperimentVariant {
    // Use deterministic hash for consistent assignment
    const hash = this.hashUserId(userId, experiment.id);
    const normalizedHash = (hash % 10000) / 100; // 0-100

    let cumulativePercentage = 0;
    for (const variant of experiment.variants) {
      cumulativePercentage += variant.trafficPercentage;
      if (normalizedHash < cumulativePercentage) {
        return variant;
      }
    }

    // Fallback to last variant
    return experiment.variants[experiment.variants.length - 1];
  }

  private hashUserId(userId: string, experimentId: string): number {
    const str = `${userId}-${experimentId}`;
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
  }

  private updateVariantAggregates(variant: ExperimentVariant): void {
    const samples = variant.metrics.samples;
    if (samples.length === 0) return;

    variant.metrics.conversionRate =
      variant.metrics.conversions / variant.metrics.impressions;

    variant.metrics.avgLatencyMs =
      samples.reduce((sum, s) => sum + s.latencyMs, 0) / samples.length;

    variant.metrics.avgCost =
      samples.reduce((sum, s) => sum + s.cost, 0) / samples.length;

    const qualityScores = samples.filter(s => s.qualityScore !== undefined);
    if (qualityScores.length > 0) {
      variant.metrics.avgQualityScore =
        qualityScores.reduce((sum, s) => sum + (s.qualityScore || 0), 0) / qualityScores.length;
    }
  }

  private checkExperimentCompletion(experiment: ABExperiment): void {
    const totalSamples = experiment.variants.reduce(
      (sum, v) => sum + v.metrics.impressions,
      0
    );

    if (totalSamples >= experiment.minimumSampleSize) {
      const analysis = this.analyzeExperiment(experiment);
      if (analysis.significanceReached) {
        // Auto-complete experiment
        this.completeExperiment(experiment.id, analysis.winner || undefined);
      }
    }
  }

  private analyzeExperiment(experiment: ABExperiment): {
    winner: string | null;
    confidence: number;
    improvement: number;
    significanceReached: boolean;
  } {
    if (experiment.variants.length < 2) {
      return { winner: null, confidence: 0, improvement: 0, significanceReached: false };
    }

    // Find control (first variant) and best performer
    const control = experiment.variants[0];
    let bestVariant = control;
    let bestMetric = this.getTargetMetric(control.metrics, experiment.targetMetric);

    for (const variant of experiment.variants.slice(1)) {
      const metric = this.getTargetMetric(variant.metrics, experiment.targetMetric);
      if (this.isBetterMetric(metric, bestMetric, experiment.targetMetric)) {
        bestMetric = metric;
        bestVariant = variant;
      }
    }

    // Calculate statistical significance (simplified)
    const controlMetric = this.getTargetMetric(control.metrics, experiment.targetMetric);
    const improvement = controlMetric > 0
      ? ((bestMetric - controlMetric) / controlMetric) * 100
      : 0;

    // Simplified confidence calculation
    const totalSamples = control.metrics.impressions + bestVariant.metrics.impressions;
    const confidence = Math.min(0.99, totalSamples / experiment.minimumSampleSize);

    return {
      winner: bestVariant.id,
      confidence,
      improvement,
      significanceReached: confidence >= experiment.confidenceLevel,
    };
  }

  private getTargetMetric(metrics: VariantMetrics, targetMetric: string): number {
    const metricMap: Record<string, number> = {
      conversionRate: metrics.conversionRate,
      avgLatencyMs: metrics.avgLatencyMs,
      avgQualityScore: metrics.avgQualityScore,
      avgCost: metrics.avgCost,
    };
    return metricMap[targetMetric] || 0;
  }

  private isBetterMetric(a: number, b: number, metricName: string): boolean {
    // For latency and cost, lower is better
    const lowerIsBetter = ['avgLatencyMs', 'avgCost'];
    if (lowerIsBetter.includes(metricName)) {
      return a < b;
    }
    return a > b;
  }

  private determineWinner(experiment: ABExperiment): string {
    const analysis = this.analyzeExperiment(experiment);
    return analysis.winner || experiment.variants[0].id;
  }
}

export const abTestingEngine = new ABTestingEngine();
```

## Metrics Collector

```typescript
// lib/prompts/metrics.ts

import { MetricSample, PromptExecutionContext } from './types';
import { promptStore } from './store';
import { abTestingEngine } from './ab-testing';

interface MetricsBuffer {
  samples: MetricSample[];
  lastFlush: Date;
}

class MetricsCollector {
  private buffers: Map<string, MetricsBuffer> = new Map();
  private flushInterval: NodeJS.Timeout | null = null;
  private readonly bufferSize = 100;
  private readonly flushIntervalMs = 10000;

  constructor() {
    this.startAutoFlush();
  }

  record(
    versionId: string,
    sample: Omit<MetricSample, 'timestamp'>,
    context?: PromptExecutionContext
  ): void {
    const fullSample: MetricSample = {
      ...sample,
      timestamp: new Date(),
      metadata: context?.metadata,
    };

    // Add to buffer
    if (!this.buffers.has(versionId)) {
      this.buffers.set(versionId, { samples: [], lastFlush: new Date() });
    }
    const buffer = this.buffers.get(versionId)!;
    buffer.samples.push(fullSample);

    // Record for A/B test if applicable
    if (context?.experimentId && context?.variantId) {
      abTestingEngine.recordMetric(context.experimentId, context.variantId, fullSample);
    }

    // Flush if buffer is full
    if (buffer.samples.length >= this.bufferSize) {
      this.flushBuffer(versionId);
    }
  }

  getRecentMetrics(versionId: string, limit: number = 100): MetricSample[] {
    const buffer = this.buffers.get(versionId);
    if (!buffer) return [];
    return buffer.samples.slice(-limit);
  }

  getAggregatedMetrics(versionId: string, period: 'hour' | 'day' | 'week'): {
    avgLatencyMs: number;
    avgInputTokens: number;
    avgOutputTokens: number;
    avgCost: number;
    avgQualityScore: number;
    totalRequests: number;
    errorRate: number;
  } {
    const buffer = this.buffers.get(versionId);
    if (!buffer || buffer.samples.length === 0) {
      return {
        avgLatencyMs: 0,
        avgInputTokens: 0,
        avgOutputTokens: 0,
        avgCost: 0,
        avgQualityScore: 0,
        totalRequests: 0,
        errorRate: 0,
      };
    }

    const now = new Date();
    const periodMs = {
      hour: 60 * 60 * 1000,
      day: 24 * 60 * 60 * 1000,
      week: 7 * 24 * 60 * 60 * 1000,
    }[period];

    const relevantSamples = buffer.samples.filter(
      s => now.getTime() - s.timestamp.getTime() < periodMs
    );

    if (relevantSamples.length === 0) {
      return {
        avgLatencyMs: 0,
        avgInputTokens: 0,
        avgOutputTokens: 0,
        avgCost: 0,
        avgQualityScore: 0,
        totalRequests: 0,
        errorRate: 0,
      };
    }

    const sum = relevantSamples.reduce(
      (acc, s) => ({
        latency: acc.latency + s.latencyMs,
        inputTokens: acc.inputTokens + s.inputTokens,
        outputTokens: acc.outputTokens + s.outputTokens,
        cost: acc.cost + s.cost,
        quality: acc.quality + (s.qualityScore || 0),
        qualityCount: acc.qualityCount + (s.qualityScore !== undefined ? 1 : 0),
      }),
      { latency: 0, inputTokens: 0, outputTokens: 0, cost: 0, quality: 0, qualityCount: 0 }
    );

    const count = relevantSamples.length;

    return {
      avgLatencyMs: sum.latency / count,
      avgInputTokens: sum.inputTokens / count,
      avgOutputTokens: sum.outputTokens / count,
      avgCost: sum.cost / count,
      avgQualityScore: sum.qualityCount > 0 ? sum.quality / sum.qualityCount : 0,
      totalRequests: count,
      errorRate: 0, // Calculate from error samples
    };
  }

  private flushBuffer(versionId: string): void {
    const buffer = this.buffers.get(versionId);
    if (!buffer || buffer.samples.length === 0) return;

    // Calculate aggregates
    const metrics = this.getAggregatedMetrics(versionId, 'day');

    // Update version metrics
    promptStore.updateVersionMetrics(versionId, {
      totalRequests: metrics.totalRequests,
      avgLatencyMs: metrics.avgLatencyMs,
      avgInputTokens: metrics.avgInputTokens,
      avgOutputTokens: metrics.avgOutputTokens,
      avgCost: metrics.avgCost,
      qualityScore: metrics.avgQualityScore,
      errorRate: metrics.errorRate,
    });

    // Keep recent samples, clear old ones
    buffer.samples = buffer.samples.slice(-50);
    buffer.lastFlush = new Date();
  }

  private startAutoFlush(): void {
    this.flushInterval = setInterval(() => {
      for (const versionId of this.buffers.keys()) {
        this.flushBuffer(versionId);
      }
    }, this.flushIntervalMs);
  }

  destroy(): void {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
    }
  }
}

export const metricsCollector = new MetricsCollector();
```

## Unified Prompt Service

```typescript
// lib/prompts/service.ts

import { PromptTemplate, PromptVersion, PromptExecutionContext, MetricSample } from './types';
import { promptStore } from './store';
import { promptRenderer } from './renderer';
import { abTestingEngine } from './ab-testing';
import { metricsCollector } from './metrics';

export class PromptService {
  // Get rendered prompt for execution
  async getPrompt(
    promptName: string,
    variables: Record<string, unknown> = {},
    context: PromptExecutionContext = {}
  ): Promise<{
    content: string;
    versionId: string;
    experimentId?: string;
    variantId?: string;
  }> {
    const prompt = promptStore.getPromptByName(promptName);
    if (!prompt) {
      throw new Error(`Prompt '${promptName}' not found`);
    }

    // Resolve version (considering A/B tests)
    const resolution = abTestingEngine.resolvePromptVersion(prompt.id, context);

    const version = promptStore.getVersion(resolution.versionId);
    if (!version) {
      throw new Error(`Version ${resolution.versionId} not found`);
    }

    // Render prompt with variables
    const content = promptRenderer.render(version, variables);

    return {
      content,
      versionId: version.id,
      experimentId: resolution.experimentId,
      variantId: resolution.variantId,
    };
  }

  // Record execution metrics
  recordExecution(
    versionId: string,
    metrics: Omit<MetricSample, 'timestamp'>,
    context?: PromptExecutionContext
  ): void {
    metricsCollector.record(versionId, metrics, context);
  }

  // High-level API for getting and recording in one call
  async execute<T>(
    promptName: string,
    variables: Record<string, unknown>,
    executor: (content: string) => Promise<{
      result: T;
      latencyMs: number;
      inputTokens: number;
      outputTokens: number;
      cost: number;
    }>,
    context: PromptExecutionContext = {}
  ): Promise<T> {
    const { content, versionId, experimentId, variantId } = await this.getPrompt(
      promptName,
      variables,
      context
    );

    const { result, latencyMs, inputTokens, outputTokens, cost } = await executor(content);

    this.recordExecution(
      versionId,
      { latencyMs, inputTokens, outputTokens, cost },
      { ...context, experimentId, variantId }
    );

    return result;
  }
}

export const promptService = new PromptService();
```

## API Routes

```typescript
// app/api/prompts/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { promptStore } from '@/lib/prompts/store';
import { z } from 'zod';

const createPromptSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  type: z.enum(['system', 'user', 'assistant', 'few-shot', 'template']),
  content: z.string().min(1),
  variables: z.array(z.object({
    name: z.string(),
    type: z.enum(['string', 'number', 'boolean', 'array', 'object']),
    description: z.string(),
    required: z.boolean(),
    defaultValue: z.unknown().optional(),
    validation: z.string().optional(),
  })).optional(),
  metadata: z.object({
    tags: z.array(z.string()).optional(),
    category: z.string().optional(),
    model: z.string().optional(),
    maxTokens: z.number().optional(),
    temperature: z.number().optional(),
  }).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = createPromptSchema.parse(body);

    const prompt = promptStore.createPrompt({
      ...data,
      description: data.description || '',
      createdBy: 'api', // In production, get from auth
    });

    return NextResponse.json({ prompt });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: 'Failed to create prompt' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') as any;
  const category = searchParams.get('category') || undefined;

  const prompts = promptStore.listPrompts({ type, category });

  return NextResponse.json({ prompts });
}
```

```typescript
// app/api/prompts/[id]/versions/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { promptStore } from '@/lib/prompts/store';
import { z } from 'zod';

const createVersionSchema = z.object({
  content: z.string().min(1),
  variables: z.array(z.object({
    name: z.string(),
    type: z.enum(['string', 'number', 'boolean', 'array', 'object']),
    description: z.string(),
    required: z.boolean(),
    defaultValue: z.unknown().optional(),
  })),
  metadata: z.object({
    tags: z.array(z.string()).optional(),
    category: z.string().optional(),
    model: z.string().optional(),
  }),
  changeDescription: z.string().min(1),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const data = createVersionSchema.parse(body);

    const version = promptStore.createVersion(id, {
      ...data,
      createdBy: 'api',
    });

    return NextResponse.json({ version });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: 'Failed to create version' }, { status: 500 });
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const versions = promptStore.getVersions(id);

  return NextResponse.json({ versions });
}
```

```typescript
// app/api/experiments/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { abTestingEngine } from '@/lib/prompts/ab-testing';
import { z } from 'zod';

const createExperimentSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  promptId: z.string(),
  variants: z.array(z.object({
    name: z.string(),
    promptVersionId: z.string(),
    trafficPercentage: z.number().min(0).max(100),
  })),
  targetMetric: z.string(),
  minimumSampleSize: z.number().optional(),
  confidenceLevel: z.number().min(0).max(1).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = createExperimentSchema.parse(body);

    const experiment = abTestingEngine.createExperiment({
      ...data,
      description: data.description || '',
      createdBy: 'api',
    });

    return NextResponse.json({ experiment });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: 'Failed to create experiment' }, { status: 500 });
  }
}
```

## React Components

```typescript
// components/prompt-editor.tsx

'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Save, Play, GitBranch, History } from 'lucide-react';

interface PromptEditorProps {
  promptId?: string;
  initialContent?: string;
  onSave: (content: string, changeDescription: string) => Promise<void>;
  onTest: (content: string, variables: Record<string, string>) => Promise<string>;
}

export function PromptEditor({
  promptId,
  initialContent = '',
  onSave,
  onTest,
}: PromptEditorProps) {
  const [content, setContent] = useState(initialContent);
  const [changeDescription, setChangeDescription] = useState('');
  const [testVariables, setTestVariables] = useState<Record<string, string>>({});
  const [testOutput, setTestOutput] = useState('');
  const [loading, setLoading] = useState(false);

  // Extract variables from content
  const variables = Array.from(content.matchAll(/\{\{(\w+)\}\}/g)).map(m => m[1]);

  const handleSave = async () => {
    if (!changeDescription) return;
    setLoading(true);
    await onSave(content, changeDescription);
    setChangeDescription('');
    setLoading(false);
  };

  const handleTest = async () => {
    setLoading(true);
    const output = await onTest(content, testVariables);
    setTestOutput(output);
    setLoading(false);
  };

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Prompt Content</span>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={handleTest} disabled={loading}>
                  <Play className="h-4 w-4 mr-2" />
                  Test
                </Button>
                <Button size="sm" onClick={handleSave} disabled={loading || !changeDescription}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Version
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Enter your prompt template..."
              rows={15}
              className="font-mono text-sm"
            />
            <div className="mt-4">
              <Input
                value={changeDescription}
                onChange={(e) => setChangeDescription(e.target.value)}
                placeholder="Describe your changes..."
              />
            </div>
          </CardContent>
        </Card>

        {variables.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Variables</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {variables.map((variable) => (
                <div key={variable}>
                  <label className="text-xs text-muted-foreground">{`{{${variable}}}`}</label>
                  <Input
                    value={testVariables[variable] || ''}
                    onChange={(e) => setTestVariables({
                      ...testVariables,
                      [variable]: e.target.value,
                    })}
                    placeholder={`Value for ${variable}`}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Test Output</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="whitespace-pre-wrap bg-muted p-4 rounded-lg text-sm min-h-[200px]">
              {testOutput || 'Run a test to see output...'}
            </pre>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
```

```typescript
// components/experiment-dashboard.tsx

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Play, Pause, CheckCircle, Trophy } from 'lucide-react';

interface Variant {
  id: string;
  name: string;
  trafficPercentage: number;
  metrics: {
    impressions: number;
    conversions: number;
    conversionRate: number;
    avgLatencyMs: number;
    avgQualityScore: number;
  };
}

interface Experiment {
  id: string;
  name: string;
  status: string;
  variants: Variant[];
  minimumSampleSize: number;
  winner?: string;
}

interface ExperimentDashboardProps {
  experimentId: string;
}

export function ExperimentDashboard({ experimentId }: ExperimentDashboardProps) {
  const [experiment, setExperiment] = useState<Experiment | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchExperiment = async () => {
    const response = await fetch(`/api/experiments/${experimentId}`);
    if (response.ok) {
      const data = await response.json();
      setExperiment(data.experiment);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchExperiment();
    const interval = setInterval(fetchExperiment, 10000);
    return () => clearInterval(interval);
  }, [experimentId]);

  if (loading || !experiment) {
    return <div>Loading...</div>;
  }

  const totalImpressions = experiment.variants.reduce(
    (sum, v) => sum + v.metrics.impressions,
    0
  );
  const progress = Math.min(100, (totalImpressions / experiment.minimumSampleSize) * 100);

  const toggleStatus = async () => {
    const action = experiment.status === 'running' ? 'pause' : 'start';
    await fetch(`/api/experiments/${experimentId}/${action}`, { method: 'POST' });
    fetchExperiment();
  };

  const complete = async () => {
    await fetch(`/api/experiments/${experimentId}/complete`, { method: 'POST' });
    fetchExperiment();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{experiment.name}</h2>
          <Badge variant={experiment.status === 'running' ? 'default' : 'secondary'}>
            {experiment.status}
          </Badge>
        </div>
        <div className="flex gap-2">
          {experiment.status !== 'completed' && (
            <>
              <Button onClick={toggleStatus} variant="outline">
                {experiment.status === 'running' ? (
                  <><Pause className="h-4 w-4 mr-2" /> Pause</>
                ) : (
                  <><Play className="h-4 w-4 mr-2" /> Start</>
                )}
              </Button>
              <Button onClick={complete}>
                <CheckCircle className="h-4 w-4 mr-2" />
                Complete
              </Button>
            </>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Progress to Statistical Significance</CardTitle>
        </CardHeader>
        <CardContent>
          <Progress value={progress} className="h-2" />
          <p className="text-sm text-muted-foreground mt-2">
            {totalImpressions.toLocaleString()} / {experiment.minimumSampleSize.toLocaleString()} samples
          </p>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {experiment.variants.map((variant) => (
          <Card
            key={variant.id}
            className={experiment.winner === variant.id ? 'border-green-500 border-2' : ''}
          >
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{variant.name}</span>
                {experiment.winner === variant.id && (
                  <Trophy className="h-5 w-5 text-yellow-500" />
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Traffic</span>
                <span className="font-mono">{variant.trafficPercentage}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Impressions</span>
                <span className="font-mono">{variant.metrics.impressions.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Conversion Rate</span>
                <span className="font-mono">
                  {(variant.metrics.conversionRate * 100).toFixed(2)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Avg Latency</span>
                <span className="font-mono">{variant.metrics.avgLatencyMs.toFixed(0)}ms</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Quality Score</span>
                <span className="font-mono">{variant.metrics.avgQualityScore.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
```

## Examples

### Example 1: Customer Service Prompt A/B Test

```typescript
// scripts/setup-support-experiment.ts

import { promptStore } from '@/lib/prompts/store';
import { abTestingEngine } from '@/lib/prompts/ab-testing';

async function setupSupportExperiment() {
  // Create the prompt
  const prompt = promptStore.createPrompt({
    name: 'customer-support',
    description: 'Customer support response prompt',
    type: 'system',
    content: `You are a customer support agent for {{company_name}}.

{{#if customer_name}}
The customer's name is {{customer_name}}. Address them by name.
{{/if}}

Your responses should be:
- Professional and empathetic
- Solution-oriented
- Concise but complete

Previous context:
{{#each previous_messages}}
{{role}}: {{content}}
{{/each}}`,
    variables: [
      { name: 'company_name', type: 'string', description: 'Company name', required: true },
      { name: 'customer_name', type: 'string', description: 'Customer name', required: false },
      { name: 'previous_messages', type: 'array', description: 'Chat history', required: false },
    ],
    createdBy: 'setup-script',
  });

  // Create control version (current)
  const controlVersion = promptStore.getVersions(prompt.id)[0];
  promptStore.promoteToProduction(controlVersion.id, 'setup-script');

  // Create variant A - more casual tone
  const variantA = promptStore.createVersion(prompt.id, {
    content: `Hey there! I'm here to help you with anything related to {{company_name}}.

{{#if customer_name}}
Nice to chat with you, {{customer_name}}!
{{/if}}

I'll do my best to solve your issue quickly. Let me know what's going on!`,
    variables: prompt.variables,
    metadata: prompt.metadata,
    changeDescription: 'Variant A: More casual, friendly tone',
    createdBy: 'setup-script',
  });

  // Create variant B - more structured
  const variantB = promptStore.createVersion(prompt.id, {
    content: `Welcome to {{company_name}} Support.

{{#if customer_name}}
Hello {{customer_name}},
{{/if}}

I'm here to assist you. To provide the best support, I will:
1. Understand your issue
2. Provide a solution or escalate if needed
3. Confirm resolution

How can I help you today?`,
    variables: prompt.variables,
    metadata: prompt.metadata,
    changeDescription: 'Variant B: More structured, formal approach',
    createdBy: 'setup-script',
  });

  // Create A/B experiment
  const experiment = abTestingEngine.createExperiment({
    name: 'Support Tone Test',
    description: 'Testing different tones for customer support responses',
    promptId: prompt.id,
    variants: [
      { name: 'Control', promptVersionId: controlVersion.id, trafficPercentage: 50 },
      { name: 'Casual', promptVersionId: variantA.id, trafficPercentage: 25 },
      { name: 'Structured', promptVersionId: variantB.id, trafficPercentage: 25 },
    ],
    targetMetric: 'conversionRate',
    minimumSampleSize: 1000,
    confidenceLevel: 0.95,
    createdBy: 'setup-script',
  });

  console.log('Created experiment:', experiment.id);

  // Start the experiment
  abTestingEngine.startExperiment(experiment.id);

  return experiment;
}

setupSupportExperiment();
```

### Example 2: Dynamic Prompt Rendering

```typescript
// app/api/chat/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { promptService } from '@/lib/prompts/service';
import OpenAI from 'openai';

const openai = new OpenAI();

export async function POST(request: NextRequest) {
  const { message, userId, sessionId, customerName } = await request.json();

  // Get prompt with A/B testing consideration
  const { content, versionId, experimentId, variantId } = await promptService.getPrompt(
    'customer-support',
    {
      company_name: 'TechCorp',
      customer_name: customerName,
      previous_messages: [], // Would come from session
    },
    { userId, sessionId }
  );

  const startTime = Date.now();

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content },
      { role: 'user', content: message },
    ],
  });

  const latencyMs = Date.now() - startTime;
  const usage = response.usage!;

  // Record metrics
  promptService.recordExecution(
    versionId,
    {
      latencyMs,
      inputTokens: usage.prompt_tokens,
      outputTokens: usage.completion_tokens,
      cost: (usage.prompt_tokens * 0.00015 + usage.completion_tokens * 0.0006) / 1000,
    },
    { userId, sessionId, experimentId, variantId }
  );

  return NextResponse.json({
    message: response.choices[0].message.content,
    versionId,
    experimentId,
    variantId,
  });
}
```

### Example 3: Version Rollback Workflow

```typescript
// app/api/prompts/[id]/rollback/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { promptStore } from '@/lib/prompts/store';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { targetVersionId, reason } = await request.json();

  // Get current production for comparison
  const currentProduction = promptStore.getProductionVersion(id);

  if (!currentProduction) {
    return NextResponse.json(
      { error: 'No production version to rollback from' },
      { status: 400 }
    );
  }

  // Compare versions
  const comparison = promptStore.compareVersions(currentProduction.id, targetVersionId);

  // Perform rollback
  const newVersion = promptStore.rollback(id, targetVersionId, 'api-user');

  // Log the rollback action
  console.log('Rollback performed:', {
    promptId: id,
    from: currentProduction.version,
    to: newVersion.version,
    reason,
    comparison,
  });

  return NextResponse.json({
    success: true,
    newVersion,
    previousVersion: currentProduction,
    comparison,
  });
}
```

## Anti-patterns

### Anti-pattern 1: Hardcoded Prompts

```typescript
// BAD - Hardcoded prompt with no versioning
async function generateResponse(input: string) {
  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      {
        role: 'system',
        content: 'You are a helpful assistant. Be concise.',
      },
      { role: 'user', content: input },
    ],
  });

  return response.choices[0].message.content;
}

// GOOD - Versioned prompt with metrics
async function generateResponse(input: string, userId: string) {
  const { content, versionId, experimentId, variantId } = await promptService.getPrompt(
    'helpful-assistant',
    {},
    { userId }
  );

  const startTime = Date.now();

  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      { role: 'system', content },
      { role: 'user', content: input },
    ],
  });

  promptService.recordExecution(versionId, {
    latencyMs: Date.now() - startTime,
    inputTokens: response.usage!.prompt_tokens,
    outputTokens: response.usage!.completion_tokens,
    cost: calculateCost(response.usage!),
  }, { userId, experimentId, variantId });

  return response.choices[0].message.content;
}
```

### Anti-pattern 2: No Change Tracking

```typescript
// BAD - Updating prompts without history
function updatePrompt(id: string, newContent: string) {
  const prompt = prompts.get(id);
  prompt.content = newContent; // Previous content is lost
  prompt.updatedAt = new Date();
}

// GOOD - Every change creates a version
function updatePrompt(id: string, newContent: string, changeDescription: string, author: string) {
  const prompt = promptStore.getPrompt(id);

  const version = promptStore.createVersion(id, {
    content: newContent,
    variables: prompt.variables,
    metadata: prompt.metadata,
    changeDescription,
    createdBy: author,
  });

  // Optionally auto-promote to production
  // promptStore.promoteToProduction(version.id, author);

  return version;
}
```

### Anti-pattern 3: Deploying Without Testing

```typescript
// BAD - Direct production deployment
async function deployPrompt(promptId: string, content: string) {
  const version = promptStore.createVersion(promptId, {
    content,
    variables: [],
    metadata: {},
    changeDescription: 'Quick fix',
    createdBy: 'developer',
  });

  // Immediately to production without testing
  promptStore.promoteToProduction(version.id, 'developer');
}

// GOOD - Staged deployment with A/B testing
async function deployPrompt(promptId: string, content: string, config: {
  testFirst?: boolean;
  abTestPercentage?: number;
}) {
  const version = promptStore.createVersion(promptId, {
    content,
    variables: [],
    metadata: {},
    changeDescription: 'New version for testing',
    createdBy: 'developer',
  });

  if (config.testFirst) {
    // Run automated tests first
    const testResults = await runPromptTests(version.id);
    if (!testResults.passed) {
      version.status = 'draft';
      throw new Error(`Tests failed: ${testResults.errors.join(', ')}`);
    }
  }

  if (config.abTestPercentage) {
    // Deploy to percentage of traffic
    const currentProd = promptStore.getProductionVersion(promptId);

    abTestingEngine.createExperiment({
      name: `Gradual rollout - ${version.version}`,
      promptId,
      variants: [
        { name: 'Current', promptVersionId: currentProd!.id, trafficPercentage: 100 - config.abTestPercentage },
        { name: 'New', promptVersionId: version.id, trafficPercentage: config.abTestPercentage },
      ],
      targetMetric: 'avgQualityScore',
      minimumSampleSize: 500,
      createdBy: 'developer',
    });
  } else {
    promptStore.promoteToProduction(version.id, 'developer');
  }
}
```

## Testing

```typescript
// __tests__/prompt-store.test.ts

import { describe, it, expect, beforeEach } from 'vitest';
import { promptStore } from '@/lib/prompts/store';

describe('PromptStore', () => {
  beforeEach(() => {
    // Reset store state
  });

  it('creates prompt with initial version', () => {
    const prompt = promptStore.createPrompt({
      name: 'test-prompt',
      description: 'Test description',
      type: 'system',
      content: 'Hello {{name}}',
      variables: [
        { name: 'name', type: 'string', description: 'Name', required: true },
      ],
      createdBy: 'test',
    });

    expect(prompt.version).toBe('1.0.0');

    const versions = promptStore.getVersions(prompt.id);
    expect(versions.length).toBe(1);
    expect(versions[0].content).toBe('Hello {{name}}');
  });

  it('creates new version and increments version number', () => {
    const prompt = promptStore.createPrompt({
      name: 'test-prompt-2',
      description: '',
      type: 'system',
      content: 'Original',
      variables: [],
      createdBy: 'test',
    });

    const newVersion = promptStore.createVersion(prompt.id, {
      content: 'Updated',
      variables: [],
      metadata: { tags: [], category: 'general' },
      changeDescription: 'Updated content',
      createdBy: 'test',
    });

    expect(newVersion.version).toBe('1.0.1');

    const versions = promptStore.getVersions(prompt.id);
    expect(versions.length).toBe(2);
  });

  it('promotes version to production', () => {
    const prompt = promptStore.createPrompt({
      name: 'test-prompt-3',
      description: '',
      type: 'system',
      content: 'Content',
      variables: [],
      createdBy: 'test',
    });

    const version = promptStore.getVersions(prompt.id)[0];
    promptStore.promoteToProduction(version.id, 'test');

    const prodVersion = promptStore.getProductionVersion(prompt.id);
    expect(prodVersion?.id).toBe(version.id);
    expect(prodVersion?.status).toBe('production');
  });

  it('compares two versions', () => {
    const prompt = promptStore.createPrompt({
      name: 'test-prompt-4',
      description: '',
      type: 'system',
      content: 'Line 1\nLine 2',
      variables: [{ name: 'a', type: 'string', description: '', required: true }],
      createdBy: 'test',
    });

    const v1 = promptStore.getVersions(prompt.id)[0];

    const v2 = promptStore.createVersion(prompt.id, {
      content: 'Line 1\nLine 3',
      variables: [
        { name: 'a', type: 'string', description: '', required: true },
        { name: 'b', type: 'string', description: '', required: false },
      ],
      metadata: { tags: [], category: 'general' },
      changeDescription: 'Changed line 2',
      createdBy: 'test',
    });

    const comparison = promptStore.compareVersions(v1.id, v2.id);

    expect(comparison.contentDiff.added).toContain('Line 3');
    expect(comparison.contentDiff.removed).toContain('Line 2');
    expect(comparison.variablesDiff.added).toContain('b');
  });
});

// __tests__/ab-testing.test.ts

import { describe, it, expect } from 'vitest';
import { abTestingEngine } from '@/lib/prompts/ab-testing';
import { promptStore } from '@/lib/prompts/store';

describe('ABTestingEngine', () => {
  it('assigns users consistently to variants', () => {
    const prompt = promptStore.createPrompt({
      name: 'ab-test-prompt',
      description: '',
      type: 'system',
      content: 'Test',
      variables: [],
      createdBy: 'test',
    });

    const v1 = promptStore.getVersions(prompt.id)[0];
    const v2 = promptStore.createVersion(prompt.id, {
      content: 'Test v2',
      variables: [],
      metadata: { tags: [], category: 'general' },
      changeDescription: 'v2',
      createdBy: 'test',
    });

    const experiment = abTestingEngine.createExperiment({
      name: 'Test Experiment',
      promptId: prompt.id,
      variants: [
        { name: 'Control', promptVersionId: v1.id, trafficPercentage: 50 },
        { name: 'Treatment', promptVersionId: v2.id, trafficPercentage: 50 },
      ],
      targetMetric: 'conversionRate',
      createdBy: 'test',
    });

    abTestingEngine.startExperiment(experiment.id);

    // Same user should get same variant
    const variant1 = abTestingEngine.getVariantForUser(experiment.id, 'user-123');
    const variant2 = abTestingEngine.getVariantForUser(experiment.id, 'user-123');

    expect(variant1?.id).toBe(variant2?.id);
  });

  it('validates traffic percentages sum to 100', () => {
    expect(() => {
      abTestingEngine.createExperiment({
        name: 'Invalid',
        promptId: 'test',
        variants: [
          { name: 'A', promptVersionId: 'v1', trafficPercentage: 60 },
          { name: 'B', promptVersionId: 'v2', trafficPercentage: 60 },
        ],
        targetMetric: 'conversionRate',
        createdBy: 'test',
      });
    }).toThrow('Traffic percentages must sum to 100');
  });
});
```

## Related Skills

- [model-routing](./model-routing.md) - Route between LLM providers
- [fine-tuning](./fine-tuning.md) - Fine-tune models with custom data
- [model-evaluation](./model-evaluation.md) - Evaluate model outputs
- [feature-flags](./feature-flags.md) - Feature flag management

---

## Changelog

### 1.0.0 (2025-01-18)
- Initial implementation
- Version control for prompts
- A/B testing engine
- Metrics collection and aggregation
- Prompt rendering with variables
- React components for management
