---
id: pt-model-evaluation
name: LLM Model Evaluation
version: 1.0.0
layer: L5
category: ai
description: Comprehensive evaluation of LLM outputs with quality metrics, automated testing, human-in-the-loop review, and continuous monitoring
tags: [ai, evaluation, testing, metrics, quality, llm, human-review, next15, react19]
composes: []
dependencies:
  openai: "^4.77.0"
  zod: "^3.23.0"
  uuid: "^9.0.0"
formula: "ModelEvaluation = TestSuite + AutomatedMetrics + HumanReview + ContinuousMonitoring + Reporting"
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: AA
  keyboard: true
  screen-reader: true
---

# LLM Model Evaluation

## Overview

Evaluating LLM outputs is fundamentally different from traditional software testing. Outputs are non-deterministic, quality is often subjective, and failure modes are nuanced. This pattern provides a comprehensive evaluation framework that combines automated metrics, LLM-as-judge approaches, human review workflows, and continuous monitoring to ensure consistent output quality.

Effective LLM evaluation requires multiple perspectives: automated metrics catch obvious issues (length, format, factuality), LLM judges evaluate semantic quality at scale, and human reviewers provide ground truth for edge cases and subjective criteria. The evaluation pipeline should run continuously, not just during development, as model behavior can drift and prompts can regress.

This pattern implements a complete evaluation system with test suites, multiple metric types, review queues, and dashboards. It supports both batch evaluation (for model comparison and regression testing) and real-time monitoring (for production quality assurance). The system integrates with prompt versioning to track how changes affect quality over time.

## When to Use

- When deploying LLMs to production and needing quality assurance
- For comparing different models or prompt versions
- When building products where output quality directly impacts user experience
- For regulated industries requiring audit trails of AI behavior
- When fine-tuning models and needing to validate improvements
- For detecting model drift or quality degradation over time

## When NOT to Use

- Quick prototyping where informal testing suffices
- Applications where any plausible output is acceptable
- When you lack resources for human review (for quality-critical applications)
- Simple deterministic tasks where traditional testing works

## Composition Diagram

```
+------------------------------------------------------------------+
|                    Model Evaluation System                        |
|  +------------------------------------------------------------+  |
|  |                     Test Suite                              |  |
|  |  [Test Cases] [Golden Sets] [Edge Cases] [Regression]      |  |
|  +------------------------------------------------------------+  |
|                              |                                    |
|  +------------------------------------------------------------+  |
|  |                  Automated Metrics                          |  |
|  |  +------------+  +------------+  +------------+            |  |
|  |  | Lexical    |  | Semantic   |  | Task-      |            |  |
|  |  | BLEU,ROUGE |  | Embeddings |  | Specific   |            |  |
|  |  +------------+  +------------+  +------------+            |  |
|  +------------------------------------------------------------+  |
|                              |                                    |
|  +------------------------------------------------------------+  |
|  |                   LLM-as-Judge                              |  |
|  |  [Correctness] [Helpfulness] [Safety] [Style]              |  |
|  +------------------------------------------------------------+  |
|                              |                                    |
|  +------------------------------------------------------------+  |
|  |                   Human Review                              |  |
|  |  [Review Queue] [Annotations] [Feedback] [Calibration]     |  |
|  +------------------------------------------------------------+  |
|                              |                                    |
|  +------------------------------------------------------------+  |
|  |                 Continuous Monitoring                       |  |
|  |  [Dashboards] [Alerts] [Trends] [Reports]                  |  |
|  +------------------------------------------------------------+  |
+------------------------------------------------------------------+
```

## Installation

```bash
npm install openai zod uuid date-fns natural
```

## Environment Configuration

```bash
# .env.local
OPENAI_API_KEY=sk-...

# Evaluation configuration
EVALUATION_MODEL=gpt-4-turbo-preview
EVALUATION_CONCURRENCY=5
HUMAN_REVIEW_SAMPLE_RATE=0.1

# Alerts
QUALITY_ALERT_THRESHOLD=0.7
ALERT_WEBHOOK_URL=https://...
```

## Type Definitions

```typescript
// lib/evaluation/types.ts

export interface TestCase {
  id: string;
  name: string;
  description?: string;
  input: TestInput;
  expectedOutput?: string;
  criteria: EvaluationCriteria[];
  tags: string[];
  weight: number;
  metadata?: Record<string, unknown>;
}

export interface TestInput {
  messages: ChatMessage[];
  systemPrompt?: string;
  context?: string;
  variables?: Record<string, unknown>;
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface EvaluationCriteria {
  name: string;
  type: CriteriaType;
  weight: number;
  config: CriteriaConfig;
}

export type CriteriaType =
  | 'exact_match'
  | 'contains'
  | 'regex'
  | 'length'
  | 'json_valid'
  | 'semantic_similarity'
  | 'llm_judge'
  | 'custom';

export interface CriteriaConfig {
  // For exact_match, contains
  value?: string;
  caseSensitive?: boolean;

  // For regex
  pattern?: string;

  // For length
  minLength?: number;
  maxLength?: number;

  // For semantic_similarity
  threshold?: number;
  referenceText?: string;

  // For llm_judge
  judgePrompt?: string;
  rubric?: string[];

  // For custom
  evaluator?: (output: string, testCase: TestCase) => Promise<number>;
}

export interface TestSuite {
  id: string;
  name: string;
  description: string;
  testCases: TestCase[];
  model?: string;
  promptId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface EvaluationRun {
  id: string;
  suiteId: string;
  modelId: string;
  promptVersionId?: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  startedAt: Date;
  completedAt?: Date;
  results: TestResult[];
  summary: EvaluationSummary;
}

export interface TestResult {
  testCaseId: string;
  output: string;
  scores: CriteriaScore[];
  overallScore: number;
  passed: boolean;
  latencyMs: number;
  tokenUsage: {
    input: number;
    output: number;
  };
  error?: string;
  metadata?: Record<string, unknown>;
}

export interface CriteriaScore {
  criteriaName: string;
  score: number;
  maxScore: number;
  details?: string;
}

export interface EvaluationSummary {
  totalTests: number;
  passedTests: number;
  failedTests: number;
  passRate: number;
  avgScore: number;
  avgLatency: number;
  avgTokens: number;
  criteriaBreakdown: Record<string, {
    avgScore: number;
    passRate: number;
  }>;
}

export interface HumanReview {
  id: string;
  testResultId: string;
  reviewerId: string;
  scores: HumanScore[];
  feedback: string;
  approved: boolean;
  reviewedAt: Date;
}

export interface HumanScore {
  dimension: string;
  score: number;
  maxScore: number;
  comment?: string;
}

export interface QualityAlert {
  id: string;
  type: 'threshold' | 'regression' | 'anomaly';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  metric: string;
  currentValue: number;
  expectedValue: number;
  triggeredAt: Date;
  acknowledged: boolean;
}
```

## Automated Metrics

```typescript
// lib/evaluation/metrics/automated.ts

import { TestCase, TestResult, CriteriaScore, CriteriaConfig } from '../types';

export class AutomatedMetrics {
  // Exact match scoring
  scoreExactMatch(output: string, config: CriteriaConfig): number {
    const expected = config.value || '';
    const caseSensitive = config.caseSensitive ?? false;

    const outputNorm = caseSensitive ? output.trim() : output.trim().toLowerCase();
    const expectedNorm = caseSensitive ? expected.trim() : expected.trim().toLowerCase();

    return outputNorm === expectedNorm ? 1 : 0;
  }

  // Contains scoring
  scoreContains(output: string, config: CriteriaConfig): number {
    const target = config.value || '';
    const caseSensitive = config.caseSensitive ?? false;

    const outputNorm = caseSensitive ? output : output.toLowerCase();
    const targetNorm = caseSensitive ? target : target.toLowerCase();

    return outputNorm.includes(targetNorm) ? 1 : 0;
  }

  // Regex match scoring
  scoreRegex(output: string, config: CriteriaConfig): number {
    if (!config.pattern) return 0;

    try {
      const regex = new RegExp(config.pattern);
      return regex.test(output) ? 1 : 0;
    } catch {
      return 0;
    }
  }

  // Length scoring
  scoreLength(output: string, config: CriteriaConfig): number {
    const length = output.length;
    const { minLength = 0, maxLength = Infinity } = config;

    if (length < minLength) {
      return Math.max(0, 1 - (minLength - length) / minLength);
    }

    if (length > maxLength) {
      return Math.max(0, 1 - (length - maxLength) / maxLength);
    }

    return 1;
  }

  // JSON validity scoring
  scoreJsonValid(output: string): number {
    try {
      JSON.parse(output);
      return 1;
    } catch {
      // Try to find JSON in the output
      const jsonMatch = output.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
      if (jsonMatch) {
        try {
          JSON.parse(jsonMatch[0]);
          return 0.8; // Partial credit for JSON embedded in text
        } catch {
          return 0;
        }
      }
      return 0;
    }
  }

  // BLEU score (simplified)
  scoreBLEU(output: string, reference: string): number {
    const outputTokens = this.tokenize(output);
    const referenceTokens = this.tokenize(reference);

    if (outputTokens.length === 0) return 0;

    // Calculate n-gram precision for n=1 to 4
    let totalPrecision = 0;

    for (let n = 1; n <= 4; n++) {
      const outputNgrams = this.getNgrams(outputTokens, n);
      const referenceNgrams = this.getNgrams(referenceTokens, n);

      let matches = 0;
      for (const ngram of outputNgrams) {
        if (referenceNgrams.has(ngram)) {
          matches++;
        }
      }

      const precision = outputNgrams.size > 0 ? matches / outputNgrams.size : 0;
      totalPrecision += precision;
    }

    // Brevity penalty
    const brevityPenalty = outputTokens.length < referenceTokens.length
      ? Math.exp(1 - referenceTokens.length / outputTokens.length)
      : 1;

    return brevityPenalty * (totalPrecision / 4);
  }

  // ROUGE-L score (simplified)
  scoreROUGEL(output: string, reference: string): number {
    const outputTokens = this.tokenize(output);
    const referenceTokens = this.tokenize(reference);

    const lcsLength = this.longestCommonSubsequence(outputTokens, referenceTokens);

    const precision = outputTokens.length > 0 ? lcsLength / outputTokens.length : 0;
    const recall = referenceTokens.length > 0 ? lcsLength / referenceTokens.length : 0;

    if (precision + recall === 0) return 0;

    // F1 score
    return (2 * precision * recall) / (precision + recall);
  }

  private tokenize(text: string): string[] {
    return text.toLowerCase().split(/\s+/).filter(t => t.length > 0);
  }

  private getNgrams(tokens: string[], n: number): Set<string> {
    const ngrams = new Set<string>();
    for (let i = 0; i <= tokens.length - n; i++) {
      ngrams.add(tokens.slice(i, i + n).join(' '));
    }
    return ngrams;
  }

  private longestCommonSubsequence(a: string[], b: string[]): number {
    const m = a.length;
    const n = b.length;
    const dp: number[][] = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));

    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (a[i - 1] === b[j - 1]) {
          dp[i][j] = dp[i - 1][j - 1] + 1;
        } else {
          dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
        }
      }
    }

    return dp[m][n];
  }
}

export const automatedMetrics = new AutomatedMetrics();
```

## Semantic Similarity

```typescript
// lib/evaluation/metrics/semantic.ts

import OpenAI from 'openai';
import { CriteriaConfig } from '../types';

const openai = new OpenAI();

export class SemanticMetrics {
  private embeddingCache: Map<string, number[]> = new Map();

  async getEmbedding(text: string): Promise<number[]> {
    const cacheKey = text.slice(0, 100);
    if (this.embeddingCache.has(cacheKey)) {
      return this.embeddingCache.get(cacheKey)!;
    }

    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: text,
    });

    const embedding = response.data[0].embedding;
    this.embeddingCache.set(cacheKey, embedding);

    return embedding;
  }

  async scoreSemanticSimilarity(output: string, config: CriteriaConfig): Promise<number> {
    const reference = config.referenceText || '';
    const threshold = config.threshold || 0.8;

    if (!reference) return 0;

    const [outputEmb, referenceEmb] = await Promise.all([
      this.getEmbedding(output),
      this.getEmbedding(reference),
    ]);

    const similarity = this.cosineSimilarity(outputEmb, referenceEmb);

    // Return 1 if above threshold, scaled score otherwise
    if (similarity >= threshold) {
      return 1;
    }

    return similarity / threshold;
  }

  async findMostSimilar(
    output: string,
    candidates: string[]
  ): Promise<{ index: number; similarity: number }> {
    const outputEmb = await this.getEmbedding(output);
    const candidateEmbs = await Promise.all(candidates.map(c => this.getEmbedding(c)));

    let maxSimilarity = -1;
    let maxIndex = -1;

    for (let i = 0; i < candidateEmbs.length; i++) {
      const similarity = this.cosineSimilarity(outputEmb, candidateEmbs[i]);
      if (similarity > maxSimilarity) {
        maxSimilarity = similarity;
        maxIndex = i;
      }
    }

    return { index: maxIndex, similarity: maxSimilarity };
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }
}

export const semanticMetrics = new SemanticMetrics();
```

## LLM-as-Judge

```typescript
// lib/evaluation/metrics/llm-judge.ts

import OpenAI from 'openai';
import { TestCase, CriteriaConfig } from '../types';
import { z } from 'zod';

const openai = new OpenAI();

const DEFAULT_JUDGE_PROMPT = `You are an expert evaluator assessing the quality of AI-generated responses.

Given the following:
- User Input: {input}
- AI Response: {output}
{{#if expected}}
- Expected Response: {expected}
{{/if}}
{{#if rubric}}
- Evaluation Rubric:
{rubric}
{{/if}}

Evaluate the response on a scale of 1-5 where:
1 = Completely incorrect or unhelpful
2 = Mostly incorrect with some relevant elements
3 = Partially correct but missing key information
4 = Mostly correct with minor issues
5 = Fully correct and helpful

Provide your evaluation in the following JSON format:
{
  "score": <1-5>,
  "reasoning": "<brief explanation>",
  "strengths": ["<strength 1>", "<strength 2>"],
  "weaknesses": ["<weakness 1>", "<weakness 2>"]
}`;

const judgeResponseSchema = z.object({
  score: z.number().min(1).max(5),
  reasoning: z.string(),
  strengths: z.array(z.string()).optional(),
  weaknesses: z.array(z.string()).optional(),
});

export class LLMJudge {
  private model: string;

  constructor(model: string = 'gpt-4-turbo-preview') {
    this.model = model;
  }

  async evaluate(
    output: string,
    testCase: TestCase,
    config: CriteriaConfig
  ): Promise<{
    score: number;
    reasoning: string;
    details: {
      strengths?: string[];
      weaknesses?: string[];
    };
  }> {
    const judgePrompt = this.buildJudgePrompt(output, testCase, config);

    const response = await openai.chat.completions.create({
      model: this.model,
      messages: [
        { role: 'user', content: judgePrompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0,
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error('Empty response from judge');
    }

    const parsed = judgeResponseSchema.parse(JSON.parse(content));

    // Normalize score to 0-1
    const normalizedScore = (parsed.score - 1) / 4;

    return {
      score: normalizedScore,
      reasoning: parsed.reasoning,
      details: {
        strengths: parsed.strengths,
        weaknesses: parsed.weaknesses,
      },
    };
  }

  async evaluateBatch(
    outputs: string[],
    testCases: TestCase[],
    config: CriteriaConfig
  ): Promise<Array<{
    score: number;
    reasoning: string;
    details: { strengths?: string[]; weaknesses?: string[] };
  }>> {
    const results = await Promise.all(
      outputs.map((output, i) => this.evaluate(output, testCases[i], config))
    );
    return results;
  }

  async evaluateMultiDimensional(
    output: string,
    testCase: TestCase,
    dimensions: string[]
  ): Promise<Record<string, { score: number; reasoning: string }>> {
    const prompt = `You are evaluating an AI response across multiple dimensions.

Input: ${this.formatInput(testCase.input)}

Response: ${output}

${testCase.expectedOutput ? `Expected: ${testCase.expectedOutput}` : ''}

Evaluate the response on each of the following dimensions (score 1-5):
${dimensions.map(d => `- ${d}`).join('\n')}

Provide your evaluation as JSON with this structure:
{
  "<dimension>": { "score": <1-5>, "reasoning": "<brief explanation>" },
  ...
}`;

    const response = await openai.chat.completions.create({
      model: this.model,
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      temperature: 0,
    });

    const content = response.choices[0].message.content;
    if (!content) throw new Error('Empty response');

    const parsed = JSON.parse(content);
    const result: Record<string, { score: number; reasoning: string }> = {};

    for (const dim of dimensions) {
      if (parsed[dim]) {
        result[dim] = {
          score: (parsed[dim].score - 1) / 4, // Normalize to 0-1
          reasoning: parsed[dim].reasoning,
        };
      }
    }

    return result;
  }

  private buildJudgePrompt(
    output: string,
    testCase: TestCase,
    config: CriteriaConfig
  ): string {
    let prompt = config.judgePrompt || DEFAULT_JUDGE_PROMPT;

    prompt = prompt.replace('{input}', this.formatInput(testCase.input));
    prompt = prompt.replace('{output}', output);

    if (testCase.expectedOutput) {
      prompt = prompt.replace('{{#if expected}}', '');
      prompt = prompt.replace('{{/if}}', '');
      prompt = prompt.replace('{expected}', testCase.expectedOutput);
    } else {
      prompt = prompt.replace(/\{\{#if expected\}\}[\s\S]*?\{\{\/if\}\}/g, '');
    }

    if (config.rubric && config.rubric.length > 0) {
      prompt = prompt.replace('{{#if rubric}}', '');
      prompt = prompt.replace('{{/if}}', '');
      prompt = prompt.replace('{rubric}', config.rubric.map((r, i) => `${i + 1}. ${r}`).join('\n'));
    } else {
      prompt = prompt.replace(/\{\{#if rubric\}\}[\s\S]*?\{\{\/if\}\}/g, '');
    }

    return prompt;
  }

  private formatInput(input: TestCase['input']): string {
    return input.messages.map(m => `${m.role}: ${m.content}`).join('\n');
  }
}

export const llmJudge = new LLMJudge();
```

## Evaluation Runner

```typescript
// lib/evaluation/runner.ts

import { v4 as uuid } from 'uuid';
import OpenAI from 'openai';
import {
  TestSuite,
  TestCase,
  EvaluationRun,
  TestResult,
  CriteriaScore,
  EvaluationSummary,
} from './types';
import { automatedMetrics } from './metrics/automated';
import { semanticMetrics } from './metrics/semantic';
import { llmJudge } from './metrics/llm-judge';

const openai = new OpenAI();

export class EvaluationRunner {
  private concurrency: number;

  constructor(concurrency: number = 5) {
    this.concurrency = concurrency;
  }

  async runSuite(
    suite: TestSuite,
    modelId: string,
    options: {
      promptVersionId?: string;
      systemPrompt?: string;
      onProgress?: (completed: number, total: number) => void;
    } = {}
  ): Promise<EvaluationRun> {
    const run: EvaluationRun = {
      id: uuid(),
      suiteId: suite.id,
      modelId,
      promptVersionId: options.promptVersionId,
      status: 'running',
      startedAt: new Date(),
      results: [],
      summary: this.emptySummary(),
    };

    const results: TestResult[] = [];
    const total = suite.testCases.length;

    // Process in batches
    for (let i = 0; i < total; i += this.concurrency) {
      const batch = suite.testCases.slice(i, i + this.concurrency);

      const batchResults = await Promise.all(
        batch.map(testCase => this.runTestCase(testCase, modelId, options.systemPrompt))
      );

      results.push(...batchResults);
      options.onProgress?.(results.length, total);
    }

    run.results = results;
    run.status = 'completed';
    run.completedAt = new Date();
    run.summary = this.calculateSummary(results, suite.testCases);

    return run;
  }

  async runTestCase(
    testCase: TestCase,
    modelId: string,
    systemPrompt?: string
  ): Promise<TestResult> {
    const startTime = Date.now();

    try {
      // Generate output
      const messages = systemPrompt
        ? [{ role: 'system' as const, content: systemPrompt }, ...testCase.input.messages]
        : testCase.input.messages;

      const response = await openai.chat.completions.create({
        model: modelId,
        messages,
        max_tokens: 2000,
      });

      const output = response.choices[0].message.content || '';
      const latencyMs = Date.now() - startTime;

      // Evaluate against criteria
      const scores = await this.evaluateCriteria(output, testCase);

      // Calculate overall score
      const totalWeight = testCase.criteria.reduce((sum, c) => sum + c.weight, 0);
      const weightedSum = scores.reduce((sum, s, i) => {
        return sum + (s.score / s.maxScore) * testCase.criteria[i].weight;
      }, 0);
      const overallScore = totalWeight > 0 ? weightedSum / totalWeight : 0;

      return {
        testCaseId: testCase.id,
        output,
        scores,
        overallScore,
        passed: overallScore >= 0.7, // 70% threshold
        latencyMs,
        tokenUsage: {
          input: response.usage?.prompt_tokens || 0,
          output: response.usage?.completion_tokens || 0,
        },
      };
    } catch (error) {
      return {
        testCaseId: testCase.id,
        output: '',
        scores: [],
        overallScore: 0,
        passed: false,
        latencyMs: Date.now() - startTime,
        tokenUsage: { input: 0, output: 0 },
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  private async evaluateCriteria(
    output: string,
    testCase: TestCase
  ): Promise<CriteriaScore[]> {
    const scores: CriteriaScore[] = [];

    for (const criteria of testCase.criteria) {
      let score = 0;
      let details: string | undefined;

      switch (criteria.type) {
        case 'exact_match':
          score = automatedMetrics.scoreExactMatch(output, criteria.config);
          break;

        case 'contains':
          score = automatedMetrics.scoreContains(output, criteria.config);
          break;

        case 'regex':
          score = automatedMetrics.scoreRegex(output, criteria.config);
          break;

        case 'length':
          score = automatedMetrics.scoreLength(output, criteria.config);
          break;

        case 'json_valid':
          score = automatedMetrics.scoreJsonValid(output);
          break;

        case 'semantic_similarity':
          score = await semanticMetrics.scoreSemanticSimilarity(output, criteria.config);
          break;

        case 'llm_judge':
          const judgeResult = await llmJudge.evaluate(output, testCase, criteria.config);
          score = judgeResult.score;
          details = judgeResult.reasoning;
          break;

        case 'custom':
          if (criteria.config.evaluator) {
            score = await criteria.config.evaluator(output, testCase);
          }
          break;
      }

      scores.push({
        criteriaName: criteria.name,
        score,
        maxScore: 1,
        details,
      });
    }

    return scores;
  }

  private calculateSummary(results: TestResult[], testCases: TestCase[]): EvaluationSummary {
    const totalTests = results.length;
    const passedTests = results.filter(r => r.passed).length;
    const failedTests = totalTests - passedTests;

    const avgScore = results.reduce((sum, r) => sum + r.overallScore, 0) / totalTests;
    const avgLatency = results.reduce((sum, r) => sum + r.latencyMs, 0) / totalTests;
    const avgTokens = results.reduce((sum, r) => sum + r.tokenUsage.input + r.tokenUsage.output, 0) / totalTests;

    // Calculate criteria breakdown
    const criteriaBreakdown: Record<string, { avgScore: number; passRate: number }> = {};

    const allCriteriaNames = new Set(testCases.flatMap(tc => tc.criteria.map(c => c.name)));

    for (const criteriaName of allCriteriaNames) {
      const relevantScores = results.flatMap(r =>
        r.scores.filter(s => s.criteriaName === criteriaName)
      );

      if (relevantScores.length > 0) {
        const avg = relevantScores.reduce((sum, s) => sum + s.score / s.maxScore, 0) / relevantScores.length;
        const passRate = relevantScores.filter(s => s.score / s.maxScore >= 0.7).length / relevantScores.length;

        criteriaBreakdown[criteriaName] = { avgScore: avg, passRate };
      }
    }

    return {
      totalTests,
      passedTests,
      failedTests,
      passRate: passedTests / totalTests,
      avgScore,
      avgLatency,
      avgTokens,
      criteriaBreakdown,
    };
  }

  private emptySummary(): EvaluationSummary {
    return {
      totalTests: 0,
      passedTests: 0,
      failedTests: 0,
      passRate: 0,
      avgScore: 0,
      avgLatency: 0,
      avgTokens: 0,
      criteriaBreakdown: {},
    };
  }
}

export const evaluationRunner = new EvaluationRunner();
```

## Human Review System

```typescript
// lib/evaluation/human-review.ts

import { v4 as uuid } from 'uuid';
import { TestResult, HumanReview, HumanScore } from './types';

interface ReviewQueueItem {
  id: string;
  testResult: TestResult;
  priority: number;
  assignedTo?: string;
  status: 'pending' | 'in_progress' | 'completed';
  createdAt: Date;
}

class HumanReviewSystem {
  private queue: Map<string, ReviewQueueItem> = new Map();
  private reviews: Map<string, HumanReview> = new Map();
  private sampleRate: number;

  constructor(sampleRate: number = 0.1) {
    this.sampleRate = sampleRate;
  }

  // Add items to review queue based on sampling
  addToQueue(results: TestResult[], forceSample: boolean = false): ReviewQueueItem[] {
    const added: ReviewQueueItem[] = [];

    for (const result of results) {
      // Sample logic
      const shouldSample = forceSample ||
        Math.random() < this.sampleRate ||
        result.overallScore < 0.5 || // Always review low scores
        !result.passed; // Always review failures

      if (shouldSample) {
        const item: ReviewQueueItem = {
          id: uuid(),
          testResult: result,
          priority: this.calculatePriority(result),
          status: 'pending',
          createdAt: new Date(),
        };

        this.queue.set(item.id, item);
        added.push(item);
      }
    }

    return added;
  }

  // Get next item for reviewer
  getNextItem(reviewerId: string): ReviewQueueItem | null {
    const available = Array.from(this.queue.values())
      .filter(item => item.status === 'pending' || (item.status === 'in_progress' && item.assignedTo === reviewerId))
      .sort((a, b) => b.priority - a.priority);

    if (available.length === 0) return null;

    const item = available[0];
    item.status = 'in_progress';
    item.assignedTo = reviewerId;

    return item;
  }

  // Submit review
  submitReview(
    queueItemId: string,
    reviewerId: string,
    scores: HumanScore[],
    feedback: string,
    approved: boolean
  ): HumanReview {
    const queueItem = this.queue.get(queueItemId);
    if (!queueItem) {
      throw new Error(`Queue item ${queueItemId} not found`);
    }

    const review: HumanReview = {
      id: uuid(),
      testResultId: queueItem.testResult.testCaseId,
      reviewerId,
      scores,
      feedback,
      approved,
      reviewedAt: new Date(),
    };

    this.reviews.set(review.id, review);

    // Update queue item
    queueItem.status = 'completed';

    return review;
  }

  // Get queue statistics
  getQueueStats(): {
    pending: number;
    inProgress: number;
    completed: number;
    avgWaitTime: number;
  } {
    const items = Array.from(this.queue.values());
    const now = new Date();

    const pending = items.filter(i => i.status === 'pending').length;
    const inProgress = items.filter(i => i.status === 'in_progress').length;
    const completed = items.filter(i => i.status === 'completed').length;

    const waitTimes = items
      .filter(i => i.status === 'pending')
      .map(i => now.getTime() - i.createdAt.getTime());

    const avgWaitTime = waitTimes.length > 0
      ? waitTimes.reduce((a, b) => a + b, 0) / waitTimes.length
      : 0;

    return { pending, inProgress, completed, avgWaitTime };
  }

  // Calculate inter-rater reliability
  calculateIRR(testResultId: string): number {
    const relevantReviews = Array.from(this.reviews.values())
      .filter(r => r.testResultId === testResultId);

    if (relevantReviews.length < 2) return 1; // Not enough reviews

    // Calculate Krippendorff's alpha (simplified)
    const scores = relevantReviews.map(r =>
      r.scores.reduce((sum, s) => sum + s.score, 0) / r.scores.length
    );

    const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
    const variance = scores.reduce((sum, s) => sum + Math.pow(s - mean, 2), 0) / scores.length;

    // Higher variance = lower agreement
    return Math.max(0, 1 - Math.sqrt(variance) / 2.5); // Normalize
  }

  // Get calibration data for reviewers
  getReviewerCalibration(reviewerId: string): {
    totalReviews: number;
    avgScore: number;
    agreementRate: number;
  } {
    const reviewerReviews = Array.from(this.reviews.values())
      .filter(r => r.reviewerId === reviewerId);

    if (reviewerReviews.length === 0) {
      return { totalReviews: 0, avgScore: 0, agreementRate: 0 };
    }

    const avgScore = reviewerReviews.reduce((sum, r) =>
      sum + r.scores.reduce((s, sc) => s + sc.score, 0) / r.scores.length, 0
    ) / reviewerReviews.length;

    // Agreement with majority
    const agreements = reviewerReviews.filter(r => r.approved).length;
    const agreementRate = agreements / reviewerReviews.length;

    return {
      totalReviews: reviewerReviews.length,
      avgScore,
      agreementRate,
    };
  }

  private calculatePriority(result: TestResult): number {
    let priority = 0;

    // Low scores get higher priority
    priority += (1 - result.overallScore) * 50;

    // Failures get higher priority
    if (!result.passed) priority += 30;

    // Errors get highest priority
    if (result.error) priority += 50;

    return priority;
  }
}

export const humanReviewSystem = new HumanReviewSystem();
```

## Continuous Monitoring

```typescript
// lib/evaluation/monitoring.ts

import { v4 as uuid } from 'uuid';
import { QualityAlert, EvaluationRun, EvaluationSummary } from './types';

interface MetricDataPoint {
  timestamp: Date;
  value: number;
  metadata?: Record<string, unknown>;
}

class QualityMonitor {
  private metrics: Map<string, MetricDataPoint[]> = new Map();
  private alerts: Map<string, QualityAlert> = new Map();
  private alertWebhook?: string;
  private thresholds: Record<string, number>;

  constructor(options: {
    alertWebhook?: string;
    thresholds?: Record<string, number>;
  } = {}) {
    this.alertWebhook = options.alertWebhook;
    this.thresholds = {
      passRate: 0.7,
      avgScore: 0.7,
      errorRate: 0.1,
      ...options.thresholds,
    };
  }

  // Record metric from evaluation run
  recordRun(run: EvaluationRun): void {
    const timestamp = run.completedAt || new Date();

    this.recordMetric('passRate', run.summary.passRate, timestamp);
    this.recordMetric('avgScore', run.summary.avgScore, timestamp);
    this.recordMetric('avgLatency', run.summary.avgLatency, timestamp);
    this.recordMetric('avgTokens', run.summary.avgTokens, timestamp);

    // Record criteria-specific metrics
    for (const [criteria, data] of Object.entries(run.summary.criteriaBreakdown)) {
      this.recordMetric(`criteria_${criteria}_score`, data.avgScore, timestamp);
      this.recordMetric(`criteria_${criteria}_passRate`, data.passRate, timestamp);
    }

    // Check for alerts
    this.checkAlerts(run);
  }

  // Record individual metric
  recordMetric(name: string, value: number, timestamp: Date = new Date()): void {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }

    this.metrics.get(name)!.push({ timestamp, value });

    // Keep only last 1000 data points per metric
    const points = this.metrics.get(name)!;
    if (points.length > 1000) {
      this.metrics.set(name, points.slice(-1000));
    }
  }

  // Get metric trend
  getMetricTrend(name: string, period: 'hour' | 'day' | 'week'): {
    current: number;
    previous: number;
    change: number;
    trend: 'up' | 'down' | 'stable';
    dataPoints: MetricDataPoint[];
  } {
    const points = this.metrics.get(name) || [];
    if (points.length === 0) {
      return {
        current: 0,
        previous: 0,
        change: 0,
        trend: 'stable',
        dataPoints: [],
      };
    }

    const periodMs = {
      hour: 60 * 60 * 1000,
      day: 24 * 60 * 60 * 1000,
      week: 7 * 24 * 60 * 60 * 1000,
    }[period];

    const now = Date.now();
    const currentPeriod = points.filter(
      p => now - p.timestamp.getTime() < periodMs
    );
    const previousPeriod = points.filter(
      p => now - p.timestamp.getTime() >= periodMs &&
           now - p.timestamp.getTime() < periodMs * 2
    );

    const current = currentPeriod.length > 0
      ? currentPeriod.reduce((sum, p) => sum + p.value, 0) / currentPeriod.length
      : 0;

    const previous = previousPeriod.length > 0
      ? previousPeriod.reduce((sum, p) => sum + p.value, 0) / previousPeriod.length
      : current;

    const change = previous !== 0 ? ((current - previous) / previous) * 100 : 0;

    let trend: 'up' | 'down' | 'stable' = 'stable';
    if (Math.abs(change) > 5) {
      trend = change > 0 ? 'up' : 'down';
    }

    return {
      current,
      previous,
      change,
      trend,
      dataPoints: currentPeriod,
    };
  }

  // Check and generate alerts
  private checkAlerts(run: EvaluationRun): void {
    // Threshold alerts
    if (run.summary.passRate < this.thresholds.passRate) {
      this.createAlert({
        type: 'threshold',
        severity: run.summary.passRate < 0.5 ? 'critical' : 'high',
        message: `Pass rate dropped below threshold`,
        metric: 'passRate',
        currentValue: run.summary.passRate,
        expectedValue: this.thresholds.passRate,
      });
    }

    if (run.summary.avgScore < this.thresholds.avgScore) {
      this.createAlert({
        type: 'threshold',
        severity: 'medium',
        message: `Average score below threshold`,
        metric: 'avgScore',
        currentValue: run.summary.avgScore,
        expectedValue: this.thresholds.avgScore,
      });
    }

    // Regression alerts (compare to previous)
    const passRateTrend = this.getMetricTrend('passRate', 'day');
    if (passRateTrend.change < -10) { // >10% drop
      this.createAlert({
        type: 'regression',
        severity: 'high',
        message: `Pass rate regression detected (${passRateTrend.change.toFixed(1)}% drop)`,
        metric: 'passRate',
        currentValue: passRateTrend.current,
        expectedValue: passRateTrend.previous,
      });
    }

    // Anomaly detection (simplified)
    const scoreTrend = this.getMetricTrend('avgScore', 'week');
    const stdDev = this.calculateStdDev(scoreTrend.dataPoints.map(p => p.value));
    if (Math.abs(run.summary.avgScore - scoreTrend.current) > 2 * stdDev) {
      this.createAlert({
        type: 'anomaly',
        severity: 'medium',
        message: `Anomalous score detected`,
        metric: 'avgScore',
        currentValue: run.summary.avgScore,
        expectedValue: scoreTrend.current,
      });
    }
  }

  private createAlert(params: Omit<QualityAlert, 'id' | 'triggeredAt' | 'acknowledged'>): void {
    const alert: QualityAlert = {
      ...params,
      id: uuid(),
      triggeredAt: new Date(),
      acknowledged: false,
    };

    this.alerts.set(alert.id, alert);

    // Send webhook notification
    if (this.alertWebhook) {
      this.sendWebhook(alert);
    }
  }

  private async sendWebhook(alert: QualityAlert): Promise<void> {
    if (!this.alertWebhook) return;

    try {
      await fetch(this.alertWebhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(alert),
      });
    } catch (error) {
      console.error('Failed to send alert webhook:', error);
    }
  }

  private calculateStdDev(values: number[]): number {
    if (values.length === 0) return 0;
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const squareDiffs = values.map(v => Math.pow(v - mean, 2));
    const avgSquareDiff = squareDiffs.reduce((a, b) => a + b, 0) / values.length;
    return Math.sqrt(avgSquareDiff);
  }

  getActiveAlerts(): QualityAlert[] {
    return Array.from(this.alerts.values())
      .filter(a => !a.acknowledged)
      .sort((a, b) => {
        const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
        return severityOrder[a.severity] - severityOrder[b.severity];
      });
  }

  acknowledgeAlert(alertId: string): void {
    const alert = this.alerts.get(alertId);
    if (alert) {
      alert.acknowledged = true;
    }
  }

  getDashboardData(): {
    metrics: Record<string, { current: number; trend: 'up' | 'down' | 'stable'; change: number }>;
    alerts: QualityAlert[];
    recentRuns: number;
  } {
    const metricNames = ['passRate', 'avgScore', 'avgLatency', 'avgTokens'];
    const metrics: Record<string, { current: number; trend: 'up' | 'down' | 'stable'; change: number }> = {};

    for (const name of metricNames) {
      const trend = this.getMetricTrend(name, 'day');
      metrics[name] = {
        current: trend.current,
        trend: trend.trend,
        change: trend.change,
      };
    }

    return {
      metrics,
      alerts: this.getActiveAlerts(),
      recentRuns: (this.metrics.get('passRate') || []).length,
    };
  }
}

export const qualityMonitor = new QualityMonitor();
```

## API Routes

```typescript
// app/api/evaluation/suites/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { TestSuite, TestCase } from '@/lib/evaluation/types';
import { v4 as uuid } from 'uuid';
import { z } from 'zod';

// In-memory storage (use database in production)
const testSuites: Map<string, TestSuite> = new Map();

const createSuiteSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  testCases: z.array(z.object({
    name: z.string(),
    description: z.string().optional(),
    input: z.object({
      messages: z.array(z.object({
        role: z.enum(['system', 'user', 'assistant']),
        content: z.string(),
      })),
      systemPrompt: z.string().optional(),
    }),
    expectedOutput: z.string().optional(),
    criteria: z.array(z.object({
      name: z.string(),
      type: z.string(),
      weight: z.number(),
      config: z.record(z.unknown()),
    })),
    tags: z.array(z.string()).optional(),
    weight: z.number().optional(),
  })),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = createSuiteSchema.parse(body);

    const suite: TestSuite = {
      id: uuid(),
      name: data.name,
      description: data.description || '',
      testCases: data.testCases.map(tc => ({
        ...tc,
        id: uuid(),
        tags: tc.tags || [],
        weight: tc.weight || 1,
        criteria: tc.criteria.map(c => ({
          ...c,
          type: c.type as any,
          config: c.config as any,
        })),
      })),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    testSuites.set(suite.id, suite);

    return NextResponse.json({ suite });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: 'Failed to create suite' }, { status: 500 });
  }
}

export async function GET() {
  const suites = Array.from(testSuites.values());
  return NextResponse.json({ suites });
}
```

```typescript
// app/api/evaluation/run/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { evaluationRunner } from '@/lib/evaluation/runner';
import { qualityMonitor } from '@/lib/evaluation/monitoring';
import { humanReviewSystem } from '@/lib/evaluation/human-review';
import { z } from 'zod';

const runSchema = z.object({
  suiteId: z.string(),
  modelId: z.string(),
  promptVersionId: z.string().optional(),
  systemPrompt: z.string().optional(),
  sampleForReview: z.boolean().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { suiteId, modelId, promptVersionId, systemPrompt, sampleForReview } = runSchema.parse(body);

    // Get suite (would come from database)
    // const suite = await getSuite(suiteId);

    // For demo, create simple suite
    const suite = {
      id: suiteId,
      name: 'Demo Suite',
      description: '',
      testCases: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const run = await evaluationRunner.runSuite(suite, modelId, {
      promptVersionId,
      systemPrompt,
    });

    // Record metrics
    qualityMonitor.recordRun(run);

    // Add to review queue if requested
    if (sampleForReview) {
      humanReviewSystem.addToQueue(run.results);
    }

    return NextResponse.json({ run });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: 'Evaluation failed' }, { status: 500 });
  }
}
```

## React Components

```typescript
// components/evaluation-dashboard.tsx

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, TrendingUp, TrendingDown, Minus, CheckCircle, XCircle } from 'lucide-react';

interface DashboardData {
  metrics: Record<string, {
    current: number;
    trend: 'up' | 'down' | 'stable';
    change: number;
  }>;
  alerts: Array<{
    id: string;
    type: string;
    severity: string;
    message: string;
    metric: string;
    currentValue: number;
  }>;
  recentRuns: number;
}

export function EvaluationDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    const response = await fetch('/api/evaluation/dashboard');
    if (response.ok) {
      const result = await response.json();
      setData(result);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading || !data) {
    return <div>Loading...</div>;
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatMetric = (name: string, value: number) => {
    if (name.includes('Rate') || name.includes('Score')) {
      return `${(value * 100).toFixed(1)}%`;
    }
    if (name.includes('Latency')) {
      return `${value.toFixed(0)}ms`;
    }
    return value.toFixed(2);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Model Evaluation Dashboard</h1>
        <Badge variant="outline">
          {data.recentRuns} evaluations
        </Badge>
      </div>

      {data.alerts.length > 0 && (
        <Card className="border-amber-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-500">
              <AlertTriangle className="h-5 w-5" />
              Active Alerts ({data.alerts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.alerts.map((alert) => (
                <div
                  key={alert.id}
                  className="flex items-center justify-between p-3 bg-amber-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium">{alert.message}</p>
                    <p className="text-sm text-muted-foreground">
                      {alert.metric}: {formatMetric(alert.metric, alert.currentValue)}
                    </p>
                  </div>
                  <Badge variant={alert.severity === 'critical' ? 'destructive' : 'outline'}>
                    {alert.severity}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(data.metrics).map(([name, metric]) => (
          <Card key={name}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground capitalize">
                {name.replace(/([A-Z])/g, ' $1').trim()}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">
                  {formatMetric(name, metric.current)}
                </span>
                <div className="flex items-center gap-1">
                  {getTrendIcon(metric.trend)}
                  <span className={`text-sm ${
                    metric.trend === 'up' ? 'text-green-500' :
                    metric.trend === 'down' ? 'text-red-500' : 'text-gray-500'
                  }`}>
                    {metric.change > 0 ? '+' : ''}{metric.change.toFixed(1)}%
                  </span>
                </div>
              </div>
              <Progress
                value={name.includes('Latency') ? 100 - Math.min(metric.current / 20, 100) : metric.current * 100}
                className="h-2 mt-2"
              />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
```

```typescript
// components/review-queue.tsx

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { ThumbsUp, ThumbsDown, SkipForward } from 'lucide-react';

interface ReviewItem {
  id: string;
  testResult: {
    testCaseId: string;
    output: string;
    overallScore: number;
    passed: boolean;
  };
  priority: number;
}

interface ReviewScore {
  dimension: string;
  score: number;
}

const REVIEW_DIMENSIONS = [
  'Accuracy',
  'Relevance',
  'Helpfulness',
  'Clarity',
  'Safety',
];

export function ReviewQueue() {
  const [currentItem, setCurrentItem] = useState<ReviewItem | null>(null);
  const [scores, setScores] = useState<ReviewScore[]>(
    REVIEW_DIMENSIONS.map(d => ({ dimension: d, score: 3 }))
  );
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ pending: 0, completed: 0 });

  const fetchNextItem = async () => {
    setLoading(true);
    const response = await fetch('/api/evaluation/review/next');
    if (response.ok) {
      const data = await response.json();
      setCurrentItem(data.item);
      setScores(REVIEW_DIMENSIONS.map(d => ({ dimension: d, score: 3 })));
      setFeedback('');
    } else {
      setCurrentItem(null);
    }
    setLoading(false);
  };

  const fetchStats = async () => {
    const response = await fetch('/api/evaluation/review/stats');
    if (response.ok) {
      const data = await response.json();
      setStats(data);
    }
  };

  useEffect(() => {
    fetchNextItem();
    fetchStats();
  }, []);

  const submitReview = async (approved: boolean) => {
    if (!currentItem) return;

    await fetch('/api/evaluation/review/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        queueItemId: currentItem.id,
        scores: scores.map(s => ({ ...s, maxScore: 5 })),
        feedback,
        approved,
      }),
    });

    fetchNextItem();
    fetchStats();
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!currentItem) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">No items in review queue</p>
          <Button className="mt-4" onClick={fetchNextItem}>
            Refresh
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Human Review</h2>
        <div className="flex gap-2">
          <Badge variant="outline">{stats.pending} pending</Badge>
          <Badge variant="secondary">{stats.completed} completed</Badge>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Review Item</span>
            <div className="flex gap-2">
              <Badge variant={currentItem.testResult.passed ? 'default' : 'destructive'}>
                Auto Score: {(currentItem.testResult.overallScore * 100).toFixed(0)}%
              </Badge>
              <Badge variant="outline">Priority: {currentItem.priority}</Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="text-sm font-medium mb-2">Model Output</h4>
            <div className="bg-muted p-4 rounded-lg whitespace-pre-wrap max-h-64 overflow-y-auto">
              {currentItem.testResult.output}
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-medium">Rate Each Dimension (1-5)</h4>
            {scores.map((score, index) => (
              <div key={score.dimension} className="space-y-2">
                <div className="flex justify-between">
                  <label className="text-sm">{score.dimension}</label>
                  <span className="text-sm font-medium">{score.score}</span>
                </div>
                <Slider
                  value={[score.score]}
                  min={1}
                  max={5}
                  step={1}
                  onValueChange={([value]) => {
                    const newScores = [...scores];
                    newScores[index].score = value;
                    setScores(newScores);
                  }}
                />
              </div>
            ))}
          </div>

          <div>
            <h4 className="text-sm font-medium mb-2">Feedback</h4>
            <Textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Optional feedback about this response..."
              rows={3}
            />
          </div>

          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={fetchNextItem}>
              <SkipForward className="h-4 w-4 mr-2" />
              Skip
            </Button>
            <div className="flex gap-2">
              <Button variant="destructive" onClick={() => submitReview(false)}>
                <ThumbsDown className="h-4 w-4 mr-2" />
                Reject
              </Button>
              <Button onClick={() => submitReview(true)}>
                <ThumbsUp className="h-4 w-4 mr-2" />
                Approve
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

## Examples

### Example 1: Customer Support Evaluation Suite

```typescript
// lib/evaluation/suites/customer-support.ts

import { TestSuite, TestCase } from '../types';
import { v4 as uuid } from 'uuid';

export const customerSupportSuite: TestSuite = {
  id: uuid(),
  name: 'Customer Support Quality',
  description: 'Evaluation suite for customer support chatbot responses',
  testCases: [
    {
      id: uuid(),
      name: 'Refund Request - Happy Path',
      description: 'Customer asks for refund on eligible order',
      input: {
        messages: [
          { role: 'user', content: 'I want to return the headphones I bought last week. Order #12345.' },
        ],
        systemPrompt: 'You are a helpful customer support agent.',
      },
      expectedOutput: 'I can help you with the return for order #12345.',
      criteria: [
        {
          name: 'Acknowledges Request',
          type: 'contains',
          weight: 1,
          config: { value: 'return', caseSensitive: false },
        },
        {
          name: 'References Order',
          type: 'contains',
          weight: 1,
          config: { value: '12345', caseSensitive: false },
        },
        {
          name: 'Helpful Tone',
          type: 'llm_judge',
          weight: 2,
          config: {
            rubric: [
              'Response is empathetic',
              'Response offers clear next steps',
              'Response is professional',
            ],
          },
        },
      ],
      tags: ['refund', 'happy-path'],
      weight: 1,
    },
    {
      id: uuid(),
      name: 'Angry Customer - De-escalation',
      description: 'Customer is frustrated about delayed delivery',
      input: {
        messages: [
          { role: 'user', content: 'This is ridiculous! My package was supposed to arrive 5 days ago! I paid for express shipping!' },
        ],
        systemPrompt: 'You are a helpful customer support agent. De-escalate frustrated customers.',
      },
      criteria: [
        {
          name: 'Apology Present',
          type: 'llm_judge',
          weight: 2,
          config: {
            judgePrompt: 'Does the response include a sincere apology? Score 5 if yes with empathy, 3 if minimal, 1 if none.',
          },
        },
        {
          name: 'Solution Offered',
          type: 'llm_judge',
          weight: 2,
          config: {
            rubric: [
              'Offers to investigate the issue',
              'Provides compensation or solution',
              'Sets clear expectations',
            ],
          },
        },
        {
          name: 'Not Defensive',
          type: 'llm_judge',
          weight: 1,
          config: {
            judgePrompt: 'Is the response defensive or blaming? Score 5 if completely non-defensive, 1 if defensive.',
          },
        },
      ],
      tags: ['angry-customer', 'escalation'],
      weight: 2,
    },
    {
      id: uuid(),
      name: 'Technical Question',
      description: 'Customer asks technical product question',
      input: {
        messages: [
          { role: 'user', content: 'Does the XYZ-2000 laptop support Thunderbolt 4?' },
        ],
      },
      criteria: [
        {
          name: 'Accuracy',
          type: 'llm_judge',
          weight: 3,
          config: {
            judgePrompt: 'Evaluate if the response is technically accurate. If uncertain, it should acknowledge uncertainty.',
          },
        },
        {
          name: 'Not Hallucinating',
          type: 'llm_judge',
          weight: 2,
          config: {
            rubric: [
              'Does not make up specifications',
              'Admits when information is not available',
              'Suggests where to find accurate info',
            ],
          },
        },
      ],
      tags: ['technical', 'product-info'],
      weight: 1,
    },
  ],
  createdAt: new Date(),
  updatedAt: new Date(),
};
```

### Example 2: Code Generation Evaluation

```typescript
// lib/evaluation/suites/code-generation.ts

import { TestSuite } from '../types';
import { v4 as uuid } from 'uuid';

export const codeGenerationSuite: TestSuite = {
  id: uuid(),
  name: 'Code Generation Quality',
  description: 'Evaluation suite for code generation tasks',
  testCases: [
    {
      id: uuid(),
      name: 'Simple Function',
      input: {
        messages: [
          { role: 'user', content: 'Write a Python function that calculates the factorial of a number.' },
        ],
      },
      criteria: [
        {
          name: 'Contains Code Block',
          type: 'regex',
          weight: 1,
          config: { pattern: '```python[\\s\\S]*```' },
        },
        {
          name: 'Valid Python Syntax',
          type: 'custom',
          weight: 2,
          config: {
            evaluator: async (output) => {
              // Extract code and validate syntax
              const codeMatch = output.match(/```python\n([\s\S]*?)```/);
              if (!codeMatch) return 0;

              // In production, actually validate syntax
              return 1;
            },
          },
        },
        {
          name: 'Handles Edge Cases',
          type: 'llm_judge',
          weight: 2,
          config: {
            rubric: [
              'Handles negative numbers appropriately',
              'Handles zero correctly',
              'Uses appropriate recursion limit or iteration',
            ],
          },
        },
      ],
      tags: ['python', 'function'],
      weight: 1,
    },
    {
      id: uuid(),
      name: 'SQL Query',
      input: {
        messages: [
          { role: 'user', content: 'Write a SQL query to find the top 5 customers by total purchase amount from orders table.' },
        ],
      },
      expectedOutput: 'SELECT',
      criteria: [
        {
          name: 'Contains SQL',
          type: 'contains',
          weight: 1,
          config: { value: 'SELECT', caseSensitive: false },
        },
        {
          name: 'Valid SQL Structure',
          type: 'llm_judge',
          weight: 2,
          config: {
            judgePrompt: 'Is this a valid SQL query that would return the top 5 customers by purchase amount?',
          },
        },
        {
          name: 'Efficient Query',
          type: 'llm_judge',
          weight: 1,
          config: {
            rubric: [
              'Uses appropriate aggregation',
              'Includes GROUP BY if needed',
              'Uses LIMIT or TOP appropriately',
            ],
          },
        },
      ],
      tags: ['sql', 'query'],
      weight: 1,
    },
  ],
  createdAt: new Date(),
  updatedAt: new Date(),
};
```

### Example 3: Automated Regression Testing

```typescript
// scripts/run-regression.ts

import { evaluationRunner } from '@/lib/evaluation/runner';
import { qualityMonitor } from '@/lib/evaluation/monitoring';
import { customerSupportSuite } from '@/lib/evaluation/suites/customer-support';

async function runRegressionTest(modelId: string, baselineModelId: string) {
  console.log('Running regression test...');

  // Run evaluation on new model
  const newModelRun = await evaluationRunner.runSuite(customerSupportSuite, modelId, {
    onProgress: (completed, total) => {
      console.log(`Progress: ${completed}/${total}`);
    },
  });

  console.log('New Model Results:', newModelRun.summary);

  // Run evaluation on baseline
  const baselineRun = await evaluationRunner.runSuite(customerSupportSuite, baselineModelId);

  console.log('Baseline Results:', baselineRun.summary);

  // Compare results
  const comparison = {
    passRateDiff: newModelRun.summary.passRate - baselineRun.summary.passRate,
    avgScoreDiff: newModelRun.summary.avgScore - baselineRun.summary.avgScore,
    latencyDiff: newModelRun.summary.avgLatency - baselineRun.summary.avgLatency,
  };

  console.log('Comparison:', comparison);

  // Check for regressions
  const hasRegression =
    comparison.passRateDiff < -0.05 || // >5% drop in pass rate
    comparison.avgScoreDiff < -0.1;    // >10% drop in avg score

  if (hasRegression) {
    console.error('REGRESSION DETECTED!');
    console.error('New model performs worse than baseline');
    process.exit(1);
  }

  // Record metrics
  qualityMonitor.recordRun(newModelRun);

  console.log('Regression test passed!');
  return { newModelRun, baselineRun, comparison };
}

// Usage in CI/CD
runRegressionTest('gpt-4o-mini', 'gpt-3.5-turbo');
```

## Anti-patterns

### Anti-pattern 1: Single Metric Evaluation

```typescript
// BAD - Only checking if output is non-empty
async function evaluate(output: string) {
  return output.length > 0 ? 'pass' : 'fail';
}

// GOOD - Multi-dimensional evaluation
async function evaluate(output: string, testCase: TestCase) {
  const scores = await Promise.all([
    evaluateAccuracy(output, testCase),
    evaluateHelpfulness(output),
    evaluateSafety(output),
    evaluateStyle(output),
  ]);

  return {
    accuracy: scores[0],
    helpfulness: scores[1],
    safety: scores[2],
    style: scores[3],
    overall: weightedAverage(scores, [0.4, 0.3, 0.2, 0.1]),
  };
}
```

### Anti-pattern 2: No Human Validation

```typescript
// BAD - Trusting automated metrics completely
async function deployModel(modelId: string) {
  const run = await evaluationRunner.runSuite(suite, modelId);

  if (run.summary.passRate > 0.8) {
    await deployToProduction(modelId); // Dangerous!
  }
}

// GOOD - Include human review for critical decisions
async function deployModel(modelId: string) {
  const run = await evaluationRunner.runSuite(suite, modelId);

  if (run.summary.passRate < 0.8) {
    console.log('Automated evaluation failed');
    return;
  }

  // Add sample to human review queue
  humanReviewSystem.addToQueue(run.results, true);

  // Wait for human review completion
  const humanResults = await waitForHumanReview(run.id, {
    minReviews: 10,
    timeout: 24 * 60 * 60 * 1000, // 24 hours
  });

  if (humanResults.approvalRate > 0.9) {
    await deployToProduction(modelId);
  } else {
    console.log('Human review failed');
  }
}
```

### Anti-pattern 3: Static Test Sets

```typescript
// BAD - Same test cases forever
const TEST_CASES = [
  { input: 'Hello', expected: 'Hi there!' },
  { input: 'Goodbye', expected: 'Bye!' },
];

async function evaluate(modelId: string) {
  return runTests(TEST_CASES, modelId);
}

// GOOD - Evolving test sets with production examples
async function evaluate(modelId: string) {
  // Core regression tests
  const coreResults = await runTests(CORE_TEST_CASES, modelId);

  // Recent production examples
  const recentExamples = await getRecentProductionSamples(100);
  const productionResults = await runTests(recentExamples, modelId);

  // Adversarial tests (regularly updated)
  const adversarialTests = await getAdversarialTests();
  const adversarialResults = await runTests(adversarialTests, modelId);

  // Edge cases discovered from human review
  const edgeCases = await getEdgeCasesFromReviews();
  const edgeCaseResults = await runTests(edgeCases, modelId);

  return combineResults([
    { weight: 0.4, results: coreResults },
    { weight: 0.3, results: productionResults },
    { weight: 0.2, results: adversarialResults },
    { weight: 0.1, results: edgeCaseResults },
  ]);
}
```

## Testing

```typescript
// __tests__/automated-metrics.test.ts

import { describe, it, expect } from 'vitest';
import { automatedMetrics } from '@/lib/evaluation/metrics/automated';

describe('AutomatedMetrics', () => {
  describe('scoreExactMatch', () => {
    it('scores 1 for exact match', () => {
      const score = automatedMetrics.scoreExactMatch(
        'Hello World',
        { value: 'Hello World' }
      );
      expect(score).toBe(1);
    });

    it('scores 0 for mismatch', () => {
      const score = automatedMetrics.scoreExactMatch(
        'Hello World',
        { value: 'Hello' }
      );
      expect(score).toBe(0);
    });

    it('handles case insensitivity', () => {
      const score = automatedMetrics.scoreExactMatch(
        'HELLO',
        { value: 'hello', caseSensitive: false }
      );
      expect(score).toBe(1);
    });
  });

  describe('scoreLength', () => {
    it('scores 1 for content within range', () => {
      const score = automatedMetrics.scoreLength(
        'Hello World',
        { minLength: 5, maxLength: 20 }
      );
      expect(score).toBe(1);
    });

    it('penalizes too short content', () => {
      const score = automatedMetrics.scoreLength(
        'Hi',
        { minLength: 10 }
      );
      expect(score).toBeLessThan(1);
    });
  });

  describe('scoreBLEU', () => {
    it('scores 1 for identical text', () => {
      const score = automatedMetrics.scoreBLEU(
        'The quick brown fox',
        'The quick brown fox'
      );
      expect(score).toBe(1);
    });

    it('scores lower for different text', () => {
      const score = automatedMetrics.scoreBLEU(
        'The quick brown fox',
        'A slow red dog'
      );
      expect(score).toBeLessThan(0.5);
    });
  });
});

// __tests__/llm-judge.test.ts

import { describe, it, expect, vi } from 'vitest';
import { llmJudge } from '@/lib/evaluation/metrics/llm-judge';

describe('LLMJudge', () => {
  it('evaluates output against criteria', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        choices: [{
          message: {
            content: JSON.stringify({
              score: 4,
              reasoning: 'Good response',
              strengths: ['Clear', 'Helpful'],
              weaknesses: ['Could be more detailed'],
            }),
          },
        }],
      }),
    } as Response);

    const result = await llmJudge.evaluate(
      'This is a helpful response',
      {
        id: 'test',
        name: 'Test Case',
        input: { messages: [{ role: 'user', content: 'Help me' }] },
        criteria: [],
        tags: [],
        weight: 1,
      },
      {}
    );

    expect(result.score).toBeCloseTo(0.75); // (4-1)/4 = 0.75
    expect(result.reasoning).toBe('Good response');
  });
});
```

## Related Skills

- [model-routing](./model-routing.md) - Route between LLM providers
- [prompt-versioning](./prompt-versioning.md) - Version control for prompts
- [fine-tuning](./fine-tuning.md) - Fine-tune models with custom data
- [agent-orchestration](./agent-orchestration.md) - Multi-step AI agents

---

## Changelog

### 1.0.0 (2025-01-18)
- Initial implementation
- Automated metrics (BLEU, ROUGE, semantic similarity)
- LLM-as-judge evaluation
- Human review system with queue
- Continuous monitoring with alerts
- React components for dashboard and review
