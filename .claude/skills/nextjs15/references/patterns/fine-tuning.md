---
id: pt-fine-tuning
name: LLM Fine-Tuning
version: 1.0.0
layer: L5
category: ai
description: Domain-specific fine-tuning workflows including dataset preparation, training pipelines, model versioning, and deployment
tags: [ai, fine-tuning, training, datasets, openai, llm, mlops, next15, react19]
composes: []
dependencies:
  openai: "^4.77.0"
  zod: "^3.23.0"
  papaparse: "^5.4.0"
formula: "FineTuning = DatasetPreparation + TrainingPipeline + ModelVersioning + Evaluation + Deployment"
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# LLM Fine-Tuning

## Overview

Fine-tuning allows you to customize large language models for specific domains, tasks, or communication styles. Rather than relying solely on prompt engineering, fine-tuning embeds domain knowledge directly into model weights, resulting in more consistent outputs, reduced token usage (shorter prompts), and better performance on specialized tasks. This pattern covers the complete fine-tuning workflow from dataset preparation to deployment.

The fine-tuning pipeline involves several critical steps: curating high-quality training examples, formatting data according to provider specifications, managing training jobs, versioning models, and evaluating results. OpenAI's fine-tuning API makes this process accessible, but success depends heavily on dataset quality and proper evaluation methodologies. This pattern provides production-ready implementations for each stage.

Organizations typically pursue fine-tuning when they need consistent formatting (legal documents, medical reports), domain expertise (company-specific knowledge, technical jargon), behavioral consistency (brand voice, response style), or cost optimization (shorter prompts by encoding context in weights). The investment in fine-tuning pays off when the specialized behavior is needed across many interactions.

## When to Use

- When prompt engineering alone cannot achieve consistent desired behavior
- For encoding domain-specific knowledge that would require lengthy prompts
- When maintaining consistent output format across many requests
- For reducing token costs by eliminating repetitive prompt context
- When building specialized assistants for specific industries
- For teaching models company-specific terminology or procedures

## When NOT to Use

- For general-purpose chat applications
- When you have fewer than 100 high-quality training examples
- If requirements change frequently (retraining is expensive)
- When prompt engineering can achieve acceptable results
- For tasks requiring real-time knowledge (fine-tuning has knowledge cutoff)
- If you lack domain experts to validate training data quality

## Composition Diagram

```
+------------------------------------------------------------------+
|                    Fine-Tuning Pipeline                           |
|  +------------------------------------------------------------+  |
|  |                  Dataset Preparation                        |  |
|  |  [Raw Data] -> [Cleaning] -> [Formatting] -> [Validation]  |  |
|  +------------------------------------------------------------+  |
|                              |                                    |
|                              v                                    |
|  +------------------------------------------------------------+  |
|  |                   Training Pipeline                         |  |
|  |  [Upload] -> [Create Job] -> [Monitor] -> [Download Model] |  |
|  +------------------------------------------------------------+  |
|                              |                                    |
|  +------------------------------------------------------------+  |
|  |                   Model Versioning                          |  |
|  |  [v1.0] -> [v1.1] -> [v2.0]                                |  |
|  |  [Tags: production, staging, experiment]                    |  |
|  +------------------------------------------------------------+  |
|                              |                                    |
|  +------------------------------------------------------------+  |
|  |                    Evaluation                               |  |
|  |  [Test Set] -> [Metrics] -> [Human Review] -> [A/B Test]   |  |
|  +------------------------------------------------------------+  |
|                              |                                    |
|  +------------------------------------------------------------+  |
|  |                    Deployment                               |  |
|  |  [Promote to Production] -> [Monitor] -> [Rollback]        |  |
|  +------------------------------------------------------------+  |
+------------------------------------------------------------------+
```

## Installation

```bash
npm install openai zod papaparse uuid date-fns
```

## Environment Configuration

```bash
# .env.local
OPENAI_API_KEY=sk-...

# Fine-tuning configuration
FINE_TUNING_BASE_MODEL=gpt-4o-mini-2024-07-18
TRAINING_DATA_BUCKET=s3://your-bucket/training-data
MODEL_REGISTRY_URL=https://your-model-registry.com
```

## Type Definitions

```typescript
// lib/fine-tuning/types.ts

export interface TrainingExample {
  id: string;
  messages: ChatMessage[];
  metadata?: Record<string, unknown>;
  source?: string;
  validated?: boolean;
  validatedBy?: string;
  validatedAt?: Date;
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
  weight?: number;
}

export interface Dataset {
  id: string;
  name: string;
  description: string;
  version: string;
  examples: TrainingExample[];
  createdAt: Date;
  updatedAt: Date;
  metadata: {
    totalExamples: number;
    validatedExamples: number;
    avgTokensPerExample: number;
    categories: Record<string, number>;
  };
}

export interface TrainingJob {
  id: string;
  status: 'pending' | 'running' | 'succeeded' | 'failed' | 'cancelled';
  baseModel: string;
  datasetId: string;
  hyperparameters: TrainingHyperparameters;
  fineTunedModel?: string;
  trainedTokens?: number;
  createdAt: Date;
  finishedAt?: Date;
  error?: string;
  events: TrainingEvent[];
}

export interface TrainingHyperparameters {
  nEpochs?: number | 'auto';
  batchSize?: number | 'auto';
  learningRateMultiplier?: number | 'auto';
}

export interface TrainingEvent {
  type: 'message' | 'metrics';
  timestamp: Date;
  message?: string;
  data?: {
    step?: number;
    trainLoss?: number;
    validLoss?: number;
    trainMeanTokenAccuracy?: number;
  };
}

export interface ModelVersion {
  id: string;
  name: string;
  version: string;
  modelId: string;
  baseModel: string;
  datasetId: string;
  trainingJobId: string;
  metrics: ModelMetrics;
  tags: string[];
  status: 'active' | 'deprecated' | 'archived';
  createdAt: Date;
  promotedAt?: Date;
  promotedBy?: string;
}

export interface ModelMetrics {
  trainLoss: number;
  validLoss: number;
  accuracy?: number;
  f1Score?: number;
  humanEvalScore?: number;
  customMetrics?: Record<string, number>;
}

export interface EvaluationResult {
  modelVersionId: string;
  testSetId: string;
  metrics: {
    accuracy: number;
    precision: number;
    recall: number;
    f1Score: number;
    averageLatency: number;
    averageTokens: number;
  };
  examples: EvaluationExample[];
  timestamp: Date;
}

export interface EvaluationExample {
  id: string;
  input: ChatMessage[];
  expectedOutput: string;
  actualOutput: string;
  score: number;
  latency: number;
  tokens: number;
}
```

## Dataset Preparation

```typescript
// lib/fine-tuning/dataset.ts

import { v4 as uuid } from 'uuid';
import { z } from 'zod';
import { Dataset, TrainingExample, ChatMessage } from './types';

const messageSchema = z.object({
  role: z.enum(['system', 'user', 'assistant']),
  content: z.string().min(1),
  weight: z.number().optional(),
});

const exampleSchema = z.object({
  messages: z.array(messageSchema).min(2),
  metadata: z.record(z.unknown()).optional(),
});

export class DatasetBuilder {
  private examples: TrainingExample[] = [];
  private name: string;
  private description: string;

  constructor(name: string, description: string = '') {
    this.name = name;
    this.description = description;
  }

  addExample(messages: ChatMessage[], metadata?: Record<string, unknown>): this {
    const example: TrainingExample = {
      id: uuid(),
      messages,
      metadata,
      validated: false,
    };

    // Validate format
    const result = exampleSchema.safeParse(example);
    if (!result.success) {
      throw new Error(`Invalid example: ${result.error.message}`);
    }

    this.examples.push(example);
    return this;
  }

  addConversation(
    systemPrompt: string,
    turns: Array<{ user: string; assistant: string }>,
    metadata?: Record<string, unknown>
  ): this {
    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
    ];

    for (const turn of turns) {
      messages.push({ role: 'user', content: turn.user });
      messages.push({ role: 'assistant', content: turn.assistant });
    }

    return this.addExample(messages, metadata);
  }

  addFromCSV(csvData: string, mapping: {
    systemColumn?: string;
    userColumn: string;
    assistantColumn: string;
    metadataColumns?: string[];
  }): this {
    const Papa = require('papaparse');
    const parsed = Papa.parse(csvData, { header: true });

    for (const row of parsed.data) {
      if (!row[mapping.userColumn] || !row[mapping.assistantColumn]) continue;

      const messages: ChatMessage[] = [];

      if (mapping.systemColumn && row[mapping.systemColumn]) {
        messages.push({ role: 'system', content: row[mapping.systemColumn] });
      }

      messages.push({ role: 'user', content: row[mapping.userColumn] });
      messages.push({ role: 'assistant', content: row[mapping.assistantColumn] });

      const metadata: Record<string, unknown> = {};
      for (const col of mapping.metadataColumns || []) {
        if (row[col]) metadata[col] = row[col];
      }

      this.addExample(messages, metadata);
    }

    return this;
  }

  addFromJSON(jsonData: Array<{
    messages: ChatMessage[];
    metadata?: Record<string, unknown>;
  }>): this {
    for (const item of jsonData) {
      this.addExample(item.messages, item.metadata);
    }
    return this;
  }

  validateExample(exampleId: string, validatedBy: string): this {
    const example = this.examples.find(e => e.id === exampleId);
    if (example) {
      example.validated = true;
      example.validatedBy = validatedBy;
      example.validatedAt = new Date();
    }
    return this;
  }

  removeExample(exampleId: string): this {
    this.examples = this.examples.filter(e => e.id !== exampleId);
    return this;
  }

  filterExamples(predicate: (example: TrainingExample) => boolean): this {
    this.examples = this.examples.filter(predicate);
    return this;
  }

  splitDataset(trainRatio: number = 0.8): {
    train: TrainingExample[];
    validation: TrainingExample[];
  } {
    const shuffled = [...this.examples].sort(() => Math.random() - 0.5);
    const splitIndex = Math.floor(shuffled.length * trainRatio);

    return {
      train: shuffled.slice(0, splitIndex),
      validation: shuffled.slice(splitIndex),
    };
  }

  build(): Dataset {
    const avgTokens = this.examples.reduce((sum, ex) => {
      const tokens = ex.messages.reduce((t, m) => t + estimateTokens(m.content), 0);
      return sum + tokens;
    }, 0) / this.examples.length;

    const categories: Record<string, number> = {};
    for (const ex of this.examples) {
      const cat = (ex.metadata?.category as string) || 'uncategorized';
      categories[cat] = (categories[cat] || 0) + 1;
    }

    return {
      id: uuid(),
      name: this.name,
      description: this.description,
      version: '1.0.0',
      examples: this.examples,
      createdAt: new Date(),
      updatedAt: new Date(),
      metadata: {
        totalExamples: this.examples.length,
        validatedExamples: this.examples.filter(e => e.validated).length,
        avgTokensPerExample: avgTokens,
        categories,
      },
    };
  }

  toJSONL(): string {
    return this.examples
      .map(ex => JSON.stringify({ messages: ex.messages }))
      .join('\n');
  }
}

function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

// Dataset validation utilities
export function validateDataset(dataset: Dataset): {
  valid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check minimum examples
  if (dataset.examples.length < 10) {
    errors.push(`Dataset has only ${dataset.examples.length} examples. Minimum 10 required.`);
  }

  // Recommend more examples
  if (dataset.examples.length < 100) {
    warnings.push('Dataset has fewer than 100 examples. Consider adding more for better results.');
  }

  // Check for duplicate examples
  const seen = new Set<string>();
  for (const ex of dataset.examples) {
    const key = ex.messages.map(m => m.content).join('|||');
    if (seen.has(key)) {
      warnings.push(`Duplicate example found: ${ex.id}`);
    }
    seen.add(key);
  }

  // Check message structure
  for (const ex of dataset.examples) {
    if (ex.messages.length < 2) {
      errors.push(`Example ${ex.id} has fewer than 2 messages`);
    }

    const lastMessage = ex.messages[ex.messages.length - 1];
    if (lastMessage.role !== 'assistant') {
      errors.push(`Example ${ex.id} does not end with assistant message`);
    }

    // Check for empty content
    for (const msg of ex.messages) {
      if (!msg.content.trim()) {
        errors.push(`Example ${ex.id} has empty message content`);
      }
    }
  }

  // Check token limits
  for (const ex of dataset.examples) {
    const totalTokens = ex.messages.reduce((sum, m) => sum + estimateTokens(m.content), 0);
    if (totalTokens > 16000) {
      warnings.push(`Example ${ex.id} has ~${totalTokens} tokens (may be truncated)`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}
```

## Training Pipeline

```typescript
// lib/fine-tuning/training.ts

import OpenAI from 'openai';
import { TrainingJob, TrainingHyperparameters, TrainingEvent, Dataset } from './types';
import { v4 as uuid } from 'uuid';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export class TrainingPipeline {
  private jobs: Map<string, TrainingJob> = new Map();

  async uploadDataset(dataset: Dataset): Promise<string> {
    // Convert to JSONL format
    const jsonl = dataset.examples
      .map(ex => JSON.stringify({ messages: ex.messages }))
      .join('\n');

    // Create file buffer
    const file = new File([jsonl], `${dataset.name}.jsonl`, {
      type: 'application/jsonl',
    });

    // Upload to OpenAI
    const uploadedFile = await openai.files.create({
      file,
      purpose: 'fine-tune',
    });

    return uploadedFile.id;
  }

  async createTrainingJob(
    datasetFileId: string,
    options: {
      baseModel?: string;
      hyperparameters?: TrainingHyperparameters;
      suffix?: string;
      validationFileId?: string;
    } = {}
  ): Promise<TrainingJob> {
    const {
      baseModel = 'gpt-4o-mini-2024-07-18',
      hyperparameters = {},
      suffix,
      validationFileId,
    } = options;

    const fineTune = await openai.fineTuning.jobs.create({
      training_file: datasetFileId,
      model: baseModel,
      hyperparameters: {
        n_epochs: hyperparameters.nEpochs || 'auto',
        batch_size: hyperparameters.batchSize || 'auto',
        learning_rate_multiplier: hyperparameters.learningRateMultiplier || 'auto',
      },
      suffix,
      validation_file: validationFileId,
    });

    const job: TrainingJob = {
      id: fineTune.id,
      status: this.mapStatus(fineTune.status),
      baseModel,
      datasetId: datasetFileId,
      hyperparameters,
      createdAt: new Date(fineTune.created_at * 1000),
      events: [],
    };

    this.jobs.set(job.id, job);
    return job;
  }

  async getJobStatus(jobId: string): Promise<TrainingJob> {
    const fineTune = await openai.fineTuning.jobs.retrieve(jobId);

    const job: TrainingJob = {
      id: fineTune.id,
      status: this.mapStatus(fineTune.status),
      baseModel: fineTune.model,
      datasetId: fineTune.training_file,
      hyperparameters: {
        nEpochs: fineTune.hyperparameters.n_epochs as number,
        batchSize: fineTune.hyperparameters.batch_size as number,
        learningRateMultiplier: fineTune.hyperparameters.learning_rate_multiplier as number,
      },
      fineTunedModel: fineTune.fine_tuned_model || undefined,
      trainedTokens: fineTune.trained_tokens || undefined,
      createdAt: new Date(fineTune.created_at * 1000),
      finishedAt: fineTune.finished_at ? new Date(fineTune.finished_at * 1000) : undefined,
      error: fineTune.error?.message,
      events: [],
    };

    this.jobs.set(job.id, job);
    return job;
  }

  async getJobEvents(jobId: string): Promise<TrainingEvent[]> {
    const events = await openai.fineTuning.jobs.listEvents(jobId, { limit: 100 });

    return events.data.map(event => ({
      type: event.type as 'message' | 'metrics',
      timestamp: new Date(event.created_at * 1000),
      message: event.message,
      data: event.data as TrainingEvent['data'],
    }));
  }

  async cancelJob(jobId: string): Promise<TrainingJob> {
    await openai.fineTuning.jobs.cancel(jobId);
    return this.getJobStatus(jobId);
  }

  async listJobs(options: { limit?: number } = {}): Promise<TrainingJob[]> {
    const jobs = await openai.fineTuning.jobs.list({ limit: options.limit || 20 });

    return jobs.data.map(fineTune => ({
      id: fineTune.id,
      status: this.mapStatus(fineTune.status),
      baseModel: fineTune.model,
      datasetId: fineTune.training_file,
      hyperparameters: {},
      fineTunedModel: fineTune.fine_tuned_model || undefined,
      trainedTokens: fineTune.trained_tokens || undefined,
      createdAt: new Date(fineTune.created_at * 1000),
      finishedAt: fineTune.finished_at ? new Date(fineTune.finished_at * 1000) : undefined,
      events: [],
    }));
  }

  private mapStatus(status: string): TrainingJob['status'] {
    const statusMap: Record<string, TrainingJob['status']> = {
      validating_files: 'pending',
      queued: 'pending',
      running: 'running',
      succeeded: 'succeeded',
      failed: 'failed',
      cancelled: 'cancelled',
    };
    return statusMap[status] || 'pending';
  }

  async waitForCompletion(
    jobId: string,
    options: {
      pollInterval?: number;
      timeout?: number;
      onProgress?: (job: TrainingJob, events: TrainingEvent[]) => void;
    } = {}
  ): Promise<TrainingJob> {
    const { pollInterval = 30000, timeout = 3600000, onProgress } = options;
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      const job = await this.getJobStatus(jobId);
      const events = await this.getJobEvents(jobId);

      onProgress?.(job, events);

      if (job.status === 'succeeded' || job.status === 'failed' || job.status === 'cancelled') {
        return job;
      }

      await new Promise(resolve => setTimeout(resolve, pollInterval));
    }

    throw new Error(`Training job ${jobId} timed out`);
  }
}

export const trainingPipeline = new TrainingPipeline();
```

## Model Versioning

```typescript
// lib/fine-tuning/versioning.ts

import { ModelVersion, ModelMetrics, TrainingJob } from './types';
import { v4 as uuid } from 'uuid';

interface ModelRegistry {
  versions: Map<string, ModelVersion>;
  byTag: Map<string, Set<string>>;
}

class ModelVersionManager {
  private registry: ModelRegistry = {
    versions: new Map(),
    byTag: new Map(),
  };

  createVersion(
    name: string,
    trainingJob: TrainingJob,
    metrics: ModelMetrics,
    tags: string[] = []
  ): ModelVersion {
    if (!trainingJob.fineTunedModel) {
      throw new Error('Training job has no fine-tuned model');
    }

    // Parse version from existing versions
    const existingVersions = this.getVersionsByName(name);
    const latestVersion = existingVersions
      .map(v => v.version)
      .sort()
      .pop() || '0.0.0';

    const newVersion = incrementVersion(latestVersion);

    const version: ModelVersion = {
      id: uuid(),
      name,
      version: newVersion,
      modelId: trainingJob.fineTunedModel,
      baseModel: trainingJob.baseModel,
      datasetId: trainingJob.datasetId,
      trainingJobId: trainingJob.id,
      metrics,
      tags,
      status: 'active',
      createdAt: new Date(),
    };

    this.registry.versions.set(version.id, version);

    // Update tag index
    for (const tag of tags) {
      if (!this.registry.byTag.has(tag)) {
        this.registry.byTag.set(tag, new Set());
      }
      this.registry.byTag.get(tag)!.add(version.id);
    }

    return version;
  }

  getVersion(id: string): ModelVersion | undefined {
    return this.registry.versions.get(id);
  }

  getVersionsByName(name: string): ModelVersion[] {
    return Array.from(this.registry.versions.values())
      .filter(v => v.name === name)
      .sort((a, b) => compareVersions(a.version, b.version));
  }

  getVersionsByTag(tag: string): ModelVersion[] {
    const ids = this.registry.byTag.get(tag) || new Set();
    return Array.from(ids)
      .map(id => this.registry.versions.get(id)!)
      .filter(Boolean);
  }

  getProductionVersion(name: string): ModelVersion | undefined {
    return this.getVersionsByTag('production')
      .filter(v => v.name === name)
      .sort((a, b) => compareVersions(b.version, a.version))[0];
  }

  promoteToProduction(versionId: string, promotedBy: string): ModelVersion {
    const version = this.registry.versions.get(versionId);
    if (!version) {
      throw new Error(`Version ${versionId} not found`);
    }

    // Demote current production version
    const currentProduction = this.getProductionVersion(version.name);
    if (currentProduction) {
      this.removeTag(currentProduction.id, 'production');
    }

    // Promote new version
    this.addTag(versionId, 'production');
    version.promotedAt = new Date();
    version.promotedBy = promotedBy;

    return version;
  }

  addTag(versionId: string, tag: string): void {
    const version = this.registry.versions.get(versionId);
    if (!version) return;

    if (!version.tags.includes(tag)) {
      version.tags.push(tag);
    }

    if (!this.registry.byTag.has(tag)) {
      this.registry.byTag.set(tag, new Set());
    }
    this.registry.byTag.get(tag)!.add(versionId);
  }

  removeTag(versionId: string, tag: string): void {
    const version = this.registry.versions.get(versionId);
    if (!version) return;

    version.tags = version.tags.filter(t => t !== tag);
    this.registry.byTag.get(tag)?.delete(versionId);
  }

  deprecateVersion(versionId: string): void {
    const version = this.registry.versions.get(versionId);
    if (version) {
      version.status = 'deprecated';
      this.removeTag(versionId, 'production');
    }
  }

  archiveVersion(versionId: string): void {
    const version = this.registry.versions.get(versionId);
    if (version) {
      version.status = 'archived';
      this.removeTag(versionId, 'production');
    }
  }

  compareVersions(versionA: string, versionB: string): {
    metricsComparison: Record<string, { a: number; b: number; diff: number }>;
    winner: string;
  } {
    const a = this.registry.versions.get(versionA);
    const b = this.registry.versions.get(versionB);

    if (!a || !b) {
      throw new Error('One or both versions not found');
    }

    const comparison: Record<string, { a: number; b: number; diff: number }> = {};

    const metricKeys = new Set([
      ...Object.keys(a.metrics),
      ...Object.keys(b.metrics),
    ]);

    for (const key of metricKeys) {
      const aValue = (a.metrics as Record<string, number>)[key] || 0;
      const bValue = (b.metrics as Record<string, number>)[key] || 0;
      comparison[key] = {
        a: aValue,
        b: bValue,
        diff: bValue - aValue,
      };
    }

    // Determine winner based on primary metrics
    const aScore = (a.metrics.accuracy || 0) - (a.metrics.trainLoss || 0);
    const bScore = (b.metrics.accuracy || 0) - (b.metrics.trainLoss || 0);

    return {
      metricsComparison: comparison,
      winner: bScore > aScore ? versionB : versionA,
    };
  }

  exportRegistry(): string {
    const data = {
      versions: Array.from(this.registry.versions.values()),
      exportedAt: new Date().toISOString(),
    };
    return JSON.stringify(data, null, 2);
  }

  importRegistry(json: string): void {
    const data = JSON.parse(json);
    for (const version of data.versions) {
      this.registry.versions.set(version.id, {
        ...version,
        createdAt: new Date(version.createdAt),
        promotedAt: version.promotedAt ? new Date(version.promotedAt) : undefined,
      });

      for (const tag of version.tags) {
        if (!this.registry.byTag.has(tag)) {
          this.registry.byTag.set(tag, new Set());
        }
        this.registry.byTag.get(tag)!.add(version.id);
      }
    }
  }
}

function incrementVersion(version: string): string {
  const parts = version.split('.').map(Number);
  parts[2]++; // Increment patch version
  return parts.join('.');
}

function compareVersions(a: string, b: string): number {
  const aParts = a.split('.').map(Number);
  const bParts = b.split('.').map(Number);

  for (let i = 0; i < 3; i++) {
    if (aParts[i] > bParts[i]) return 1;
    if (aParts[i] < bParts[i]) return -1;
  }
  return 0;
}

export const modelVersionManager = new ModelVersionManager();
```

## Model Evaluation

```typescript
// lib/fine-tuning/evaluation.ts

import OpenAI from 'openai';
import { EvaluationResult, EvaluationExample, ChatMessage, ModelVersion } from './types';
import { v4 as uuid } from 'uuid';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface TestCase {
  id: string;
  input: ChatMessage[];
  expectedOutput: string;
  metadata?: Record<string, unknown>;
}

export class ModelEvaluator {
  async evaluate(
    modelId: string,
    testCases: TestCase[],
    options: {
      concurrency?: number;
      scoringFn?: (expected: string, actual: string) => number;
    } = {}
  ): Promise<EvaluationResult> {
    const { concurrency = 5, scoringFn = defaultScoring } = options;
    const examples: EvaluationExample[] = [];

    // Process in batches
    for (let i = 0; i < testCases.length; i += concurrency) {
      const batch = testCases.slice(i, i + concurrency);

      const results = await Promise.all(
        batch.map(async (testCase) => {
          const startTime = Date.now();

          try {
            const response = await openai.chat.completions.create({
              model: modelId,
              messages: testCase.input,
              max_tokens: 2000,
            });

            const actualOutput = response.choices[0].message.content || '';
            const latency = Date.now() - startTime;
            const tokens = response.usage?.total_tokens || 0;
            const score = scoringFn(testCase.expectedOutput, actualOutput);

            return {
              id: testCase.id,
              input: testCase.input,
              expectedOutput: testCase.expectedOutput,
              actualOutput,
              score,
              latency,
              tokens,
            };
          } catch (error) {
            return {
              id: testCase.id,
              input: testCase.input,
              expectedOutput: testCase.expectedOutput,
              actualOutput: `Error: ${error instanceof Error ? error.message : 'Unknown'}`,
              score: 0,
              latency: Date.now() - startTime,
              tokens: 0,
            };
          }
        })
      );

      examples.push(...results);
    }

    // Calculate aggregate metrics
    const totalExamples = examples.length;
    const correctExamples = examples.filter(e => e.score >= 0.8).length;

    const metrics = {
      accuracy: correctExamples / totalExamples,
      precision: calculatePrecision(examples),
      recall: calculateRecall(examples),
      f1Score: 0,
      averageLatency: examples.reduce((sum, e) => sum + e.latency, 0) / totalExamples,
      averageTokens: examples.reduce((sum, e) => sum + e.tokens, 0) / totalExamples,
    };

    metrics.f1Score = (2 * metrics.precision * metrics.recall) / (metrics.precision + metrics.recall) || 0;

    return {
      modelVersionId: modelId,
      testSetId: uuid(),
      metrics,
      examples,
      timestamp: new Date(),
    };
  }

  async compareModels(
    modelIds: string[],
    testCases: TestCase[]
  ): Promise<Map<string, EvaluationResult>> {
    const results = new Map<string, EvaluationResult>();

    for (const modelId of modelIds) {
      const result = await this.evaluate(modelId, testCases);
      results.set(modelId, result);
    }

    return results;
  }

  async runHumanEvaluation(
    modelId: string,
    testCases: TestCase[],
    evaluatorFn: (input: ChatMessage[], output: string) => Promise<number>
  ): Promise<{ averageScore: number; scores: number[] }> {
    const scores: number[] = [];

    for (const testCase of testCases) {
      const response = await openai.chat.completions.create({
        model: modelId,
        messages: testCase.input,
        max_tokens: 2000,
      });

      const output = response.choices[0].message.content || '';
      const score = await evaluatorFn(testCase.input, output);
      scores.push(score);
    }

    return {
      averageScore: scores.reduce((sum, s) => sum + s, 0) / scores.length,
      scores,
    };
  }
}

function defaultScoring(expected: string, actual: string): number {
  const expectedLower = expected.toLowerCase().trim();
  const actualLower = actual.toLowerCase().trim();

  // Exact match
  if (expectedLower === actualLower) return 1.0;

  // Contains expected content
  if (actualLower.includes(expectedLower)) return 0.9;

  // Levenshtein similarity for partial matches
  const similarity = calculateSimilarity(expectedLower, actualLower);
  return similarity;
}

function calculateSimilarity(a: string, b: string): number {
  const longer = a.length > b.length ? a : b;
  const shorter = a.length > b.length ? b : a;

  if (longer.length === 0) return 1.0;

  const editDistance = levenshteinDistance(longer, shorter);
  return (longer.length - editDistance) / longer.length;
}

function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

function calculatePrecision(examples: EvaluationExample[]): number {
  const truePositives = examples.filter(e => e.score >= 0.8).length;
  const predictedPositives = examples.length;
  return predictedPositives > 0 ? truePositives / predictedPositives : 0;
}

function calculateRecall(examples: EvaluationExample[]): number {
  const truePositives = examples.filter(e => e.score >= 0.8).length;
  const actualPositives = examples.length;
  return actualPositives > 0 ? truePositives / actualPositives : 0;
}

export const modelEvaluator = new ModelEvaluator();
```

## API Routes

```typescript
// app/api/fine-tuning/datasets/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { DatasetBuilder, validateDataset } from '@/lib/fine-tuning/dataset';
import { z } from 'zod';

const createDatasetSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  examples: z.array(z.object({
    messages: z.array(z.object({
      role: z.enum(['system', 'user', 'assistant']),
      content: z.string(),
    })),
    metadata: z.record(z.unknown()).optional(),
  })),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, examples } = createDatasetSchema.parse(body);

    const builder = new DatasetBuilder(name, description);

    for (const example of examples) {
      builder.addExample(example.messages, example.metadata);
    }

    const dataset = builder.build();
    const validation = validateDataset(dataset);

    if (!validation.valid) {
      return NextResponse.json(
        { error: 'Dataset validation failed', details: validation.errors },
        { status: 400 }
      );
    }

    return NextResponse.json({
      dataset,
      validation,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: 'Failed to create dataset' }, { status: 500 });
  }
}
```

```typescript
// app/api/fine-tuning/jobs/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { trainingPipeline } from '@/lib/fine-tuning/training';
import { z } from 'zod';

const createJobSchema = z.object({
  datasetFileId: z.string(),
  baseModel: z.string().optional(),
  hyperparameters: z.object({
    nEpochs: z.union([z.number(), z.literal('auto')]).optional(),
    batchSize: z.union([z.number(), z.literal('auto')]).optional(),
    learningRateMultiplier: z.union([z.number(), z.literal('auto')]).optional(),
  }).optional(),
  suffix: z.string().optional(),
  validationFileId: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const options = createJobSchema.parse(body);

    const job = await trainingPipeline.createTrainingJob(
      options.datasetFileId,
      {
        baseModel: options.baseModel,
        hyperparameters: options.hyperparameters,
        suffix: options.suffix,
        validationFileId: options.validationFileId,
      }
    );

    return NextResponse.json({ job });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: 'Failed to create training job' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');

    const jobs = await trainingPipeline.listJobs({ limit });

    return NextResponse.json({ jobs });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to list jobs' }, { status: 500 });
  }
}
```

```typescript
// app/api/fine-tuning/jobs/[jobId]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { trainingPipeline } from '@/lib/fine-tuning/training';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { jobId } = await params;

    const job = await trainingPipeline.getJobStatus(jobId);
    const events = await trainingPipeline.getJobEvents(jobId);

    return NextResponse.json({ job, events });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to get job status' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { jobId } = await params;

    const job = await trainingPipeline.cancelJob(jobId);

    return NextResponse.json({ job });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to cancel job' }, { status: 500 });
  }
}
```

## React Components

```typescript
// components/dataset-manager.tsx

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Upload, Check, AlertCircle } from 'lucide-react';

interface Example {
  id: string;
  messages: Array<{ role: string; content: string }>;
  validated: boolean;
}

export function DatasetManager() {
  const [name, setName] = useState('');
  const [examples, setExamples] = useState<Example[]>([]);
  const [currentExample, setCurrentExample] = useState({
    system: '',
    user: '',
    assistant: '',
  });

  const addExample = () => {
    if (!currentExample.user || !currentExample.assistant) return;

    const messages = [];
    if (currentExample.system) {
      messages.push({ role: 'system', content: currentExample.system });
    }
    messages.push({ role: 'user', content: currentExample.user });
    messages.push({ role: 'assistant', content: currentExample.assistant });

    setExamples([
      ...examples,
      {
        id: crypto.randomUUID(),
        messages,
        validated: false,
      },
    ]);

    setCurrentExample({ system: '', user: '', assistant: '' });
  };

  const removeExample = (id: string) => {
    setExamples(examples.filter(e => e.id !== id));
  };

  const validateExample = (id: string) => {
    setExamples(examples.map(e =>
      e.id === id ? { ...e, validated: true } : e
    ));
  };

  const uploadDataset = async () => {
    const response = await fetch('/api/fine-tuning/datasets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        examples: examples.map(e => ({ messages: e.messages })),
      }),
    });

    if (response.ok) {
      const data = await response.json();
      alert(`Dataset created with ${data.dataset.metadata.totalExamples} examples`);
    }
  };

  const validatedCount = examples.filter(e => e.validated).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Dataset Manager</h2>
        <div className="flex items-center gap-2">
          <Badge variant="outline">
            {examples.length} examples ({validatedCount} validated)
          </Badge>
          <Button onClick={uploadDataset} disabled={examples.length < 10}>
            <Upload className="h-4 w-4 mr-2" />
            Upload Dataset
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Dataset Info</CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Dataset name"
            className="max-w-md"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Add Example</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm text-muted-foreground">System Prompt (optional)</label>
            <Textarea
              value={currentExample.system}
              onChange={(e) => setCurrentExample({ ...currentExample, system: e.target.value })}
              placeholder="You are a helpful assistant..."
              rows={2}
            />
          </div>
          <div>
            <label className="text-sm text-muted-foreground">User Message *</label>
            <Textarea
              value={currentExample.user}
              onChange={(e) => setCurrentExample({ ...currentExample, user: e.target.value })}
              placeholder="User's question or request..."
              rows={3}
            />
          </div>
          <div>
            <label className="text-sm text-muted-foreground">Assistant Response *</label>
            <Textarea
              value={currentExample.assistant}
              onChange={(e) => setCurrentExample({ ...currentExample, assistant: e.target.value })}
              placeholder="Ideal assistant response..."
              rows={4}
            />
          </div>
          <Button onClick={addExample}>
            <Plus className="h-4 w-4 mr-2" />
            Add Example
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {examples.map((example, index) => (
          <Card key={example.id} className={example.validated ? 'border-green-500' : ''}>
            <CardContent className="py-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium">Example {index + 1}</p>
                  {example.messages.map((msg, i) => (
                    <div key={i} className="mt-2">
                      <Badge variant="outline" className="text-xs">
                        {msg.role}
                      </Badge>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {msg.content}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  {!example.validated ? (
                    <Button size="sm" variant="outline" onClick={() => validateExample(example.id)}>
                      <Check className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Badge className="bg-green-500">Validated</Badge>
                  )}
                  <Button size="sm" variant="destructive" onClick={() => removeExample(example.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {examples.length < 10 && (
        <div className="flex items-center gap-2 text-amber-500">
          <AlertCircle className="h-4 w-4" />
          <p className="text-sm">Minimum 10 examples required for fine-tuning</p>
        </div>
      )}
    </div>
  );
}
```

```typescript
// components/training-dashboard.tsx

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { RefreshCw, XCircle, CheckCircle, Clock, AlertTriangle } from 'lucide-react';

interface TrainingJob {
  id: string;
  status: string;
  baseModel: string;
  fineTunedModel?: string;
  trainedTokens?: number;
  createdAt: string;
  finishedAt?: string;
}

interface TrainingEvent {
  type: string;
  timestamp: string;
  message?: string;
  data?: {
    step?: number;
    trainLoss?: number;
  };
}

export function TrainingDashboard() {
  const [jobs, setJobs] = useState<TrainingJob[]>([]);
  const [selectedJob, setSelectedJob] = useState<string | null>(null);
  const [events, setEvents] = useState<TrainingEvent[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchJobs = async () => {
    setLoading(true);
    const response = await fetch('/api/fine-tuning/jobs');
    if (response.ok) {
      const data = await response.json();
      setJobs(data.jobs);
    }
    setLoading(false);
  };

  const fetchJobDetails = async (jobId: string) => {
    const response = await fetch(`/api/fine-tuning/jobs/${jobId}`);
    if (response.ok) {
      const data = await response.json();
      setEvents(data.events);
    }
  };

  const cancelJob = async (jobId: string) => {
    await fetch(`/api/fine-tuning/jobs/${jobId}`, { method: 'DELETE' });
    fetchJobs();
  };

  useEffect(() => {
    fetchJobs();
    const interval = setInterval(fetchJobs, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedJob) {
      fetchJobDetails(selectedJob);
      const interval = setInterval(() => fetchJobDetails(selectedJob), 10000);
      return () => clearInterval(interval);
    }
  }, [selectedJob]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'succeeded':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'running':
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'cancelled':
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const latestLoss = events
    .filter(e => e.data?.trainLoss)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0]
    ?.data?.trainLoss;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Training Jobs</h2>
        <Button onClick={fetchJobs} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-3">
          {jobs.map((job) => (
            <Card
              key={job.id}
              className={`cursor-pointer transition-colors ${
                selectedJob === job.id ? 'border-primary' : ''
              }`}
              onClick={() => setSelectedJob(job.id)}
            >
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-mono text-sm">{job.id.slice(0, 20)}...</p>
                    <p className="text-sm text-muted-foreground">{job.baseModel}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(job.status)}
                    <Badge variant="outline">{job.status}</Badge>
                  </div>
                </div>
                {job.fineTunedModel && (
                  <p className="text-xs text-green-600 mt-2">
                    Model: {job.fineTunedModel}
                  </p>
                )}
                {job.status === 'running' && (
                  <Button
                    size="sm"
                    variant="destructive"
                    className="mt-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      cancelJob(job.id);
                    }}
                  >
                    Cancel
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {selectedJob && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Training Progress</CardTitle>
            </CardHeader>
            <CardContent>
              {latestLoss && (
                <div className="mb-4">
                  <p className="text-sm text-muted-foreground">Current Loss</p>
                  <p className="text-2xl font-bold">{latestLoss.toFixed(4)}</p>
                </div>
              )}
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {events.map((event, i) => (
                  <div key={i} className="text-sm border-l-2 border-muted pl-3 py-1">
                    <p className="text-xs text-muted-foreground">
                      {new Date(event.timestamp).toLocaleTimeString()}
                    </p>
                    {event.message && <p>{event.message}</p>}
                    {event.data?.trainLoss && (
                      <p className="font-mono">
                        Step {event.data.step}: Loss = {event.data.trainLoss.toFixed(4)}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
```

## Examples

### Example 1: Customer Support Fine-Tuning

```typescript
// scripts/prepare-support-dataset.ts

import { DatasetBuilder } from '@/lib/fine-tuning/dataset';
import { trainingPipeline } from '@/lib/fine-tuning/training';
import fs from 'fs';

async function prepareSupportDataset() {
  const builder = new DatasetBuilder(
    'customer-support-v1',
    'Fine-tuning dataset for customer support responses'
  );

  // Add system prompt for all examples
  const systemPrompt = `You are a helpful customer support agent for TechCorp.
Your responses should be professional, empathetic, and solution-oriented.
Always acknowledge the customer's concern before providing solutions.`;

  // Load historical support tickets
  const tickets = JSON.parse(fs.readFileSync('data/support-tickets.json', 'utf-8'));

  for (const ticket of tickets) {
    if (ticket.resolution_rating >= 4) { // Only high-rated resolutions
      builder.addConversation(
        systemPrompt,
        [
          { user: ticket.customer_message, assistant: ticket.agent_response },
        ],
        {
          category: ticket.category,
          rating: ticket.resolution_rating,
          ticketId: ticket.id,
        }
      );
    }
  }

  const dataset = builder.build();
  console.log(`Created dataset with ${dataset.metadata.totalExamples} examples`);
  console.log('Categories:', dataset.metadata.categories);

  // Upload and start training
  const fileId = await trainingPipeline.uploadDataset(dataset);
  console.log('Uploaded file:', fileId);

  const job = await trainingPipeline.createTrainingJob(fileId, {
    suffix: 'support-v1',
    hyperparameters: {
      nEpochs: 3,
    },
  });

  console.log('Training job started:', job.id);
}

prepareSupportDataset();
```

### Example 2: Legal Document Formatter

```typescript
// lib/fine-tuning/legal-formatter.ts

import { DatasetBuilder, validateDataset } from '@/lib/fine-tuning/dataset';

const LEGAL_SYSTEM_PROMPT = `You are a legal document formatter. Transform informal legal descriptions into properly formatted legal language with appropriate citations and structure.`;

export function createLegalFormatterDataset(examples: Array<{
  informal: string;
  formal: string;
  documentType: string;
}>) {
  const builder = new DatasetBuilder(
    'legal-formatter-v1',
    'Transforms informal legal text to formal legal documents'
  );

  for (const example of examples) {
    builder.addConversation(
      LEGAL_SYSTEM_PROMPT,
      [
        {
          user: `Format the following as a formal ${example.documentType}:\n\n${example.informal}`,
          assistant: example.formal,
        },
      ],
      { documentType: example.documentType }
    );
  }

  const dataset = builder.build();
  const validation = validateDataset(dataset);

  if (!validation.valid) {
    console.error('Validation errors:', validation.errors);
    throw new Error('Dataset validation failed');
  }

  if (validation.warnings.length > 0) {
    console.warn('Warnings:', validation.warnings);
  }

  return dataset;
}
```

### Example 3: Code Review Assistant

```typescript
// lib/fine-tuning/code-reviewer.ts

import { DatasetBuilder } from '@/lib/fine-tuning/dataset';
import { modelEvaluator } from '@/lib/fine-tuning/evaluation';
import { trainingPipeline } from '@/lib/fine-tuning/training';
import { modelVersionManager } from '@/lib/fine-tuning/versioning';

const CODE_REVIEW_PROMPT = `You are an expert code reviewer. Analyze the provided code for:
1. Bugs and potential issues
2. Performance problems
3. Security vulnerabilities
4. Code style and best practices
5. Suggestions for improvement

Be specific and provide line-by-line feedback where applicable.`;

async function trainCodeReviewer(trainingData: Array<{
  code: string;
  language: string;
  review: string;
}>) {
  // Build dataset
  const builder = new DatasetBuilder(
    'code-reviewer-v1',
    'Code review assistant for multiple languages'
  );

  for (const item of trainingData) {
    builder.addConversation(
      CODE_REVIEW_PROMPT,
      [
        {
          user: `Review this ${item.language} code:\n\n\`\`\`${item.language}\n${item.code}\n\`\`\``,
          assistant: item.review,
        },
      ],
      { language: item.language }
    );
  }

  const dataset = builder.build();

  // Split for training and validation
  const { train, validation } = builder.splitDataset(0.9);

  // Upload files
  const trainBuilder = new DatasetBuilder('train', '');
  train.forEach(ex => trainBuilder.addExample(ex.messages, ex.metadata));
  const trainFileId = await trainingPipeline.uploadDataset(trainBuilder.build());

  const valBuilder = new DatasetBuilder('val', '');
  validation.forEach(ex => valBuilder.addExample(ex.messages, ex.metadata));
  const valFileId = await trainingPipeline.uploadDataset(valBuilder.build());

  // Start training
  const job = await trainingPipeline.createTrainingJob(trainFileId, {
    suffix: 'code-reviewer',
    validationFileId: valFileId,
    hyperparameters: {
      nEpochs: 4,
      learningRateMultiplier: 1.5,
    },
  });

  // Wait for completion
  const completedJob = await trainingPipeline.waitForCompletion(job.id, {
    onProgress: (j, events) => {
      const latestLoss = events
        .filter(e => e.data?.trainLoss)
        .pop()?.data?.trainLoss;
      if (latestLoss) {
        console.log(`Status: ${j.status}, Loss: ${latestLoss.toFixed(4)}`);
      }
    },
  });

  if (completedJob.status !== 'succeeded' || !completedJob.fineTunedModel) {
    throw new Error(`Training failed: ${completedJob.error}`);
  }

  // Evaluate model
  const testCases = validation.map(ex => ({
    id: ex.id,
    input: ex.messages.slice(0, -1), // All messages except last
    expectedOutput: ex.messages[ex.messages.length - 1].content,
  }));

  const evalResult = await modelEvaluator.evaluate(
    completedJob.fineTunedModel,
    testCases
  );

  console.log('Evaluation results:', evalResult.metrics);

  // Create model version
  const version = modelVersionManager.createVersion(
    'code-reviewer',
    completedJob,
    {
      trainLoss: completedJob.trainedTokens ? 0 : 0, // Get from events
      validLoss: 0,
      accuracy: evalResult.metrics.accuracy,
      f1Score: evalResult.metrics.f1Score,
    },
    ['staging']
  );

  console.log(`Created model version: ${version.name} v${version.version}`);

  return version;
}
```

## Anti-patterns

### Anti-pattern 1: Low-Quality Training Data

```typescript
// BAD - Using unfiltered, low-quality examples
async function badDataPreparation(rawData: any[]) {
  const builder = new DatasetBuilder('bad-dataset', '');

  for (const item of rawData) {
    // No validation, no quality filtering
    builder.addExample([
      { role: 'user', content: item.input },
      { role: 'assistant', content: item.output },
    ]);
  }

  return builder.build();
}

// GOOD - Quality-filtered, validated examples
async function goodDataPreparation(rawData: any[]) {
  const builder = new DatasetBuilder('quality-dataset', '');

  for (const item of rawData) {
    // Skip low-quality examples
    if (!item.input || !item.output) continue;
    if (item.input.length < 10 || item.output.length < 20) continue;
    if (item.qualityScore && item.qualityScore < 0.8) continue;

    // Validate format
    if (!isValidConversation(item)) continue;

    builder.addExample(
      [
        { role: 'user', content: item.input.trim() },
        { role: 'assistant', content: item.output.trim() },
      ],
      {
        source: item.source,
        qualityScore: item.qualityScore,
        reviewer: item.reviewer,
      }
    );
  }

  const dataset = builder.build();
  const validation = validateDataset(dataset);

  if (!validation.valid) {
    throw new Error(`Dataset invalid: ${validation.errors.join(', ')}`);
  }

  return dataset;
}
```

### Anti-pattern 2: No Versioning or Rollback Plan

```typescript
// BAD - Deploying directly without versioning
async function badDeployment(modelId: string) {
  // No versioning, no way to rollback
  process.env.PRODUCTION_MODEL = modelId;
  console.log('Deployed!');
}

// GOOD - Proper versioning with rollback capability
async function goodDeployment(modelId: string, trainingJob: TrainingJob) {
  // Create versioned model entry
  const version = modelVersionManager.createVersion(
    'my-model',
    trainingJob,
    {
      trainLoss: 0.1,
      validLoss: 0.12,
      accuracy: 0.95,
    },
    ['candidate']
  );

  // Evaluate against current production
  const currentProd = modelVersionManager.getProductionVersion('my-model');

  if (currentProd) {
    const comparison = modelVersionManager.compareVersions(
      currentProd.id,
      version.id
    );

    console.log('Comparison:', comparison);

    if (comparison.winner !== version.id) {
      console.warn('New model performs worse than production');
      return; // Don't deploy
    }
  }

  // Promote with audit trail
  modelVersionManager.promoteToProduction(version.id, 'deploy-script');

  console.log(`Deployed ${version.name} v${version.version}`);
  console.log(`Previous version: ${currentProd?.version || 'none'}`);
}
```

### Anti-pattern 3: Skipping Evaluation

```typescript
// BAD - Deploying without evaluation
async function badWorkflow() {
  const job = await trainingPipeline.createTrainingJob(fileId);
  const completed = await trainingPipeline.waitForCompletion(job.id);

  // Deploy immediately without testing
  deployModel(completed.fineTunedModel);
}

// GOOD - Comprehensive evaluation before deployment
async function goodWorkflow() {
  const job = await trainingPipeline.createTrainingJob(fileId, {
    validationFileId, // Include validation set
  });

  const completed = await trainingPipeline.waitForCompletion(job.id);

  if (!completed.fineTunedModel) {
    throw new Error('Training failed');
  }

  // Automated evaluation
  const autoEval = await modelEvaluator.evaluate(
    completed.fineTunedModel,
    testCases
  );

  if (autoEval.metrics.accuracy < 0.9) {
    console.error('Model accuracy below threshold');
    return;
  }

  // Human evaluation sample
  const humanEval = await modelEvaluator.runHumanEvaluation(
    completed.fineTunedModel,
    testCases.slice(0, 20),
    async (input, output) => {
      // Present to human evaluator and collect score
      return await getHumanScore(input, output);
    }
  );

  if (humanEval.averageScore < 4.0) {
    console.error('Human evaluation score too low');
    return;
  }

  // A/B test in staging
  await runABTest(completed.fineTunedModel, currentProductionModel);

  // Only then deploy
  deployModel(completed.fineTunedModel);
}
```

## Testing

```typescript
// __tests__/dataset.test.ts

import { describe, it, expect } from 'vitest';
import { DatasetBuilder, validateDataset } from '@/lib/fine-tuning/dataset';

describe('DatasetBuilder', () => {
  it('creates valid dataset with examples', () => {
    const builder = new DatasetBuilder('test-dataset', 'Test description');

    builder.addExample([
      { role: 'user', content: 'Hello' },
      { role: 'assistant', content: 'Hi there!' },
    ]);

    const dataset = builder.build();

    expect(dataset.name).toBe('test-dataset');
    expect(dataset.examples.length).toBe(1);
  });

  it('adds conversation with system prompt', () => {
    const builder = new DatasetBuilder('test', '');

    builder.addConversation(
      'You are helpful.',
      [
        { user: 'Hello', assistant: 'Hi!' },
        { user: 'How are you?', assistant: 'I am well!' },
      ]
    );

    const dataset = builder.build();
    const messages = dataset.examples[0].messages;

    expect(messages.length).toBe(5); // system + 2 user + 2 assistant
    expect(messages[0].role).toBe('system');
  });

  it('rejects invalid examples', () => {
    const builder = new DatasetBuilder('test', '');

    expect(() => {
      builder.addExample([
        { role: 'user', content: '' }, // Empty content
        { role: 'assistant', content: 'Response' },
      ]);
    }).toThrow();
  });

  it('splits dataset correctly', () => {
    const builder = new DatasetBuilder('test', '');

    for (let i = 0; i < 100; i++) {
      builder.addExample([
        { role: 'user', content: `Question ${i}` },
        { role: 'assistant', content: `Answer ${i}` },
      ]);
    }

    const { train, validation } = builder.splitDataset(0.8);

    expect(train.length).toBe(80);
    expect(validation.length).toBe(20);
  });
});

describe('validateDataset', () => {
  it('fails with too few examples', () => {
    const builder = new DatasetBuilder('test', '');
    builder.addExample([
      { role: 'user', content: 'Hello' },
      { role: 'assistant', content: 'Hi' },
    ]);

    const result = validateDataset(builder.build());

    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('10'))).toBe(true);
  });

  it('warns about duplicates', () => {
    const builder = new DatasetBuilder('test', '');

    for (let i = 0; i < 15; i++) {
      builder.addExample([
        { role: 'user', content: 'Same question' },
        { role: 'assistant', content: 'Same answer' },
      ]);
    }

    const result = validateDataset(builder.build());

    expect(result.warnings.some(w => w.includes('Duplicate'))).toBe(true);
  });
});
```

## Related Skills

- [model-routing](./model-routing.md) - Route between base and fine-tuned models
- [model-evaluation](./model-evaluation.md) - Comprehensive model evaluation
- [prompt-versioning](./prompt-versioning.md) - Version control for prompts
- [embeddings](./embeddings.md) - Generate embeddings for dataset analysis

---

## Changelog

### 1.0.0 (2025-01-18)
- Initial implementation
- Dataset preparation with validation
- OpenAI fine-tuning API integration
- Model versioning and registry
- Automated and human evaluation
- React components for management UI
