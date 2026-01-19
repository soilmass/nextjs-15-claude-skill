---
id: pt-conflict-resolution
name: Conflict Resolution Advanced
version: 2.0.0
layer: L5
category: data
description: Advanced conflict resolution patterns including OT vs CRDT tradeoffs, three-way merges, vector clocks, and user communication strategies for collaborative applications
tags: [conflict-resolution, crdt, ot, three-way-merge, collaborative, real-time, versioning, next15]
composes: []
dependencies:
  yjs: "^13.6.0"
  automerge: "^2.2.0"
  diff-match-patch: "^1.0.5"
  immer: "^10.0.0"
formula: "ConflictResolution = VersionTracking(VectorClocks|Timestamps) + ConflictDetection + MergeStrategy(OT|CRDT|3WayMerge) + UserResolution"
performance:
  impact: medium
  lcp: neutral
  cls: low
accessibility:
  wcag: AA
  keyboard: true
  screen-reader: true
---

# Conflict Resolution Advanced

## Overview

Conflict resolution is one of the most challenging aspects of building collaborative applications. When multiple users modify the same data simultaneously, conflicts are inevitable. This pattern provides comprehensive strategies for detecting, resolving, and communicating conflicts, covering the spectrum from simple optimistic locking to advanced techniques like Operational Transformation (OT) and Conflict-free Replicated Data Types (CRDTs).

The choice between conflict resolution strategies significantly impacts user experience and system complexity. Simple last-write-wins is easy to implement but can frustrate users who lose their work. Three-way merges preserve intent but require careful implementation. CRDTs provide automatic conflict resolution but come with memory overhead. OT enables real-time collaboration but requires complex server infrastructure. This pattern helps you choose and implement the right approach.

We cover practical implementations for common scenarios: document editing, form submissions, inventory management, and real-time collaboration. Each approach includes strategies for communicating conflicts to users and providing them with options to resolve ambiguities while preserving their work.

## When to Use

- Collaborative document editing (Google Docs-style)
- Multi-user form editing where concurrent updates are likely
- Inventory systems where stock levels change from multiple sources
- Offline-first applications syncing after reconnection
- Distributed systems with eventual consistency requirements
- Real-time collaboration features (whiteboards, shared lists)
- Multi-device sync where user may edit on multiple devices
- Team workflows where multiple users modify shared resources

## When NOT to Use

- Single-user applications with no collaboration
- Strict transactional systems requiring strong consistency
- Simple CRUD applications with low concurrency
- When conflicts can be prevented architecturally (e.g., user-specific data)
- High-frequency updates better served by event sourcing
- When data loss is acceptable (analytics, logs)

## Composition Diagram

```
+============================================================================+
|                    CONFLICT RESOLUTION ARCHITECTURE                         |
+=============================================================================+
|                                                                             |
|   CONFLICT DETECTION LAYER                                                  |
|   +------------------------------------------------------------------+     |
|   |                                                                   |     |
|   |  Version Tracking Strategies                                      |     |
|   |  +----------------------------+  +----------------------------+  |     |
|   |  | Scalar Version             |  | Vector Clock              |  |     |
|   |  | - Simple incrementing int  |  | - Per-node counters       |  |     |
|   |  | - Good for single writer   |  | - Tracks causality        |  |     |
|   |  | - Fast comparison          |  | - Detects concurrent ops  |  |     |
|   |  +----------------------------+  +----------------------------+  |     |
|   |                                                                   |     |
|   |  +----------------------------+  +----------------------------+  |     |
|   |  | Timestamp (Last-Modified)  |  | Content Hash              |  |     |
|   |  | - Wall clock time          |  | - SHA256 of content       |  |     |
|   |  | - Clock skew issues        |  | - Detects any change      |  |     |
|   |  | - Useful for simple cases  |  | - No ordering info        |  |     |
|   |  +----------------------------+  +----------------------------+  |     |
|   |                                                                   |     |
|   +------------------------------------------------------------------+     |
|                       |                                                     |
|                       v                                                     |
|   +------------------------------------------------------------------+     |
|   |  CONFLICT DETECTED?                                               |     |
|   |                                                                   |     |
|   |    Client Version != Server Version                               |     |
|   |              OR                                                   |     |
|   |    Vector clocks are concurrent (neither dominates)               |     |
|   |              OR                                                   |     |
|   |    Content hash mismatch with expected base                       |     |
|   |                                                                   |     |
|   +------------------------------------------------------------------+     |
|                       |                                                     |
|           +-----------+-----------+-----------+                             |
|           |           |           |           |                             |
|           v           v           v           v                             |
|   +-----------+ +-----------+ +-----------+ +-----------+                  |
|   | STRATEGY  | | STRATEGY  | | STRATEGY  | | STRATEGY  |                  |
|   |   1: OT   | | 2: CRDT   | | 3: 3-Way  | | 4: Manual |                  |
|   +-----------+ +-----------+ +-----------+ +-----------+                  |
|                                                                             |
|   STRATEGY 1: OPERATIONAL TRANSFORMATION (OT)                               |
|   +------------------------------------------------------------------+     |
|   | - Transform operations against concurrent operations              |     |
|   | - Server maintains canonical order                                |     |
|   | - Best for: Real-time text editing                               |     |
|   | - Complexity: High (transform functions for each op type)         |     |
|   |                                                                   |     |
|   | Op1: insert(5, "hello")  +  Op2: delete(3, 2)                    |     |
|   |           |                        |                              |     |
|   |           v                        v                              |     |
|   |    Transform(Op1, Op2) = insert(3, "hello")  (position adjusted) |     |
|   +------------------------------------------------------------------+     |
|                                                                             |
|   STRATEGY 2: CRDT (Conflict-free Replicated Data Types)                    |
|   +------------------------------------------------------------------+     |
|   | - Data structures that automatically merge                        |     |
|   | - No conflicts by mathematical design                             |     |
|   | - Best for: Distributed systems, offline-first                    |     |
|   | - Types: G-Counter, PN-Counter, LWW-Register, OR-Set, RGA         |     |
|   |                                                                   |     |
|   | Node A: add("item1")  |  Node B: add("item2")                    |     |
|   |           |                        |                              |     |
|   |           +--------> Merge <-------+                              |     |
|   |                        |                                          |     |
|   |                        v                                          |     |
|   |              Result: {"item1", "item2"}  (both preserved)        |     |
|   +------------------------------------------------------------------+     |
|                                                                             |
|   STRATEGY 3: THREE-WAY MERGE                                               |
|   +------------------------------------------------------------------+     |
|   | - Compare: base, server, client versions                          |     |
|   | - Merge non-conflicting changes automatically                     |     |
|   | - Flag true conflicts for resolution                              |     |
|   |                                                                   |     |
|   |        BASE (v1)                                                  |     |
|   |        /      \                                                   |     |
|   |       /        \                                                  |     |
|   |   CLIENT       SERVER                                             |     |
|   |   (v1')        (v2)                                               |     |
|   |       \        /                                                  |     |
|   |        \      /                                                   |     |
|   |      MERGED (v3)                                                  |     |
|   |   + CONFLICTS[]                                                   |     |
|   +------------------------------------------------------------------+     |
|                                                                             |
|   STRATEGY 4: MANUAL/USER RESOLUTION                                        |
|   +------------------------------------------------------------------+     |
|   | - Present conflict to user with clear options                     |     |
|   | - Show diff between versions                                      |     |
|   | - Allow: Keep mine, Keep theirs, Merge manually                   |     |
|   | - Best UX: Preview merged result                                  |     |
|   +------------------------------------------------------------------+     |
|                                                                             |
|   USER COMMUNICATION                                                        |
|   +------------------------------------------------------------------+     |
|   | - Visual indicators (badges, highlights, tooltips)                |     |
|   | - Conflict resolution dialogs                                     |     |
|   | - Real-time presence indicators                                   |     |
|   | - Undo/redo support                                               |     |
|   | - Version history browsing                                        |     |
|   +------------------------------------------------------------------+     |
|                                                                             |
+=============================================================================+
```

## Implementation

### Core Types and Interfaces

```typescript
// lib/conflict/types.ts
export interface VersionVector {
  [nodeId: string]: number;
}

export interface VersionedDocument<T> {
  id: string;
  data: T;
  version: number;
  vectorClock: VersionVector;
  updatedAt: Date;
  updatedBy: string;
  baseVersion?: number; // For 3-way merge
}

export interface ConflictInfo<T> {
  field: string;
  path: string[];
  baseValue: T | undefined;
  serverValue: T;
  clientValue: T;
  autoResolvable: boolean;
  suggestedResolution?: T;
}

export interface MergeResult<T> {
  success: boolean;
  merged?: T;
  conflicts?: ConflictInfo<unknown>[];
  resolution?: ConflictResolution;
}

export type ConflictResolution =
  | "auto-merged"
  | "server-wins"
  | "client-wins"
  | "manual"
  | "deferred";

export interface ConflictResolutionContext<T> {
  documentId: string;
  base: VersionedDocument<T> | null;
  server: VersionedDocument<T>;
  client: { data: T; version: number };
  userId: string;
}

export type MergeStrategy<T> =
  | "last-write-wins"
  | "first-write-wins"
  | "server-wins"
  | "client-wins"
  | "three-way-merge"
  | "crdt"
  | "manual"
  | ((context: ConflictResolutionContext<T>) => Promise<MergeResult<T>>);
```

### Vector Clock Implementation

```typescript
// lib/conflict/vector-clock.ts
import type { VersionVector } from "./types";

export class VectorClock {
  private clock: VersionVector;

  constructor(initial: VersionVector = {}) {
    this.clock = { ...initial };
  }

  /**
   * Increment the clock for a specific node
   */
  increment(nodeId: string): VectorClock {
    const newClock = new VectorClock(this.clock);
    newClock.clock[nodeId] = (newClock.clock[nodeId] || 0) + 1;
    return newClock;
  }

  /**
   * Get the clock value for a node
   */
  get(nodeId: string): number {
    return this.clock[nodeId] || 0;
  }

  /**
   * Merge two vector clocks (take max of each component)
   */
  merge(other: VectorClock): VectorClock {
    const merged: VersionVector = { ...this.clock };

    for (const [nodeId, value] of Object.entries(other.clock)) {
      merged[nodeId] = Math.max(merged[nodeId] || 0, value);
    }

    return new VectorClock(merged);
  }

  /**
   * Compare two vector clocks
   * Returns:
   *   -1: this < other (this happened before other)
   *    0: this || other (concurrent, no causal relationship)
   *    1: this > other (other happened before this)
   */
  compare(other: VectorClock): -1 | 0 | 1 {
    let thisGreater = false;
    let otherGreater = false;

    const allNodes = new Set([
      ...Object.keys(this.clock),
      ...Object.keys(other.clock),
    ]);

    for (const nodeId of allNodes) {
      const thisValue = this.get(nodeId);
      const otherValue = other.get(nodeId);

      if (thisValue > otherValue) {
        thisGreater = true;
      } else if (otherValue > thisValue) {
        otherGreater = true;
      }
    }

    if (thisGreater && !otherGreater) return 1;
    if (otherGreater && !thisGreater) return -1;
    return 0; // Concurrent
  }

  /**
   * Check if clocks are concurrent (neither dominates)
   */
  isConcurrent(other: VectorClock): boolean {
    return this.compare(other) === 0;
  }

  /**
   * Check if this clock happened before the other
   */
  happenedBefore(other: VectorClock): boolean {
    return this.compare(other) === -1;
  }

  /**
   * Serialize for storage
   */
  toJSON(): VersionVector {
    return { ...this.clock };
  }

  /**
   * Create from JSON
   */
  static fromJSON(json: VersionVector): VectorClock {
    return new VectorClock(json);
  }
}
```

### Three-Way Merge Implementation

```typescript
// lib/conflict/three-way-merge.ts
import { diff_match_patch } from "diff-match-patch";
import type { ConflictInfo, MergeResult } from "./types";

const dmp = new diff_match_patch();

/**
 * Deep three-way merge for objects
 */
export function threeWayMerge<T extends Record<string, unknown>>(
  base: T | null,
  server: T,
  client: T,
  options: {
    fieldMergers?: Record<string, (b: any, s: any, c: any) => MergeResult<any>>;
    ignoreFields?: string[];
  } = {}
): MergeResult<T> {
  const { fieldMergers = {}, ignoreFields = [] } = options;

  const merged: Record<string, unknown> = {};
  const conflicts: ConflictInfo<unknown>[] = [];

  // Get all unique keys
  const allKeys = new Set([
    ...Object.keys(base || {}),
    ...Object.keys(server),
    ...Object.keys(client),
  ]);

  for (const key of allKeys) {
    if (ignoreFields.includes(key)) {
      merged[key] = server[key]; // Default to server for ignored fields
      continue;
    }

    const baseValue = base?.[key];
    const serverValue = server[key];
    const clientValue = client[key];

    // Check for custom merger
    if (fieldMergers[key]) {
      const result = fieldMergers[key](baseValue, serverValue, clientValue);
      if (result.success) {
        merged[key] = result.merged;
      } else if (result.conflicts) {
        conflicts.push(...result.conflicts);
      }
      continue;
    }

    // Determine merge outcome
    const mergeResult = mergeValue(key, [key], baseValue, serverValue, clientValue);

    if (mergeResult.success) {
      merged[key] = mergeResult.merged;
    } else if (mergeResult.conflicts) {
      conflicts.push(...mergeResult.conflicts);
      // Use server value as default for conflicting fields
      merged[key] = serverValue;
    }
  }

  return {
    success: conflicts.length === 0,
    merged: merged as T,
    conflicts: conflicts.length > 0 ? conflicts : undefined,
    resolution: conflicts.length === 0 ? "auto-merged" : "manual",
  };
}

function mergeValue(
  field: string,
  path: string[],
  base: unknown,
  server: unknown,
  client: unknown
): MergeResult<unknown> {
  // Case 1: No change from base on either side
  if (deepEqual(server, base) && deepEqual(client, base)) {
    return { success: true, merged: base };
  }

  // Case 2: Only server changed
  if (deepEqual(client, base) && !deepEqual(server, base)) {
    return { success: true, merged: server };
  }

  // Case 3: Only client changed
  if (deepEqual(server, base) && !deepEqual(client, base)) {
    return { success: true, merged: client };
  }

  // Case 4: Both changed to same value
  if (deepEqual(server, client)) {
    return { success: true, merged: server };
  }

  // Case 5: Both changed to different values - CONFLICT
  // Try type-specific merging
  if (typeof server === "string" && typeof client === "string") {
    const textMerge = mergeText(
      (base as string) || "",
      server,
      client
    );
    if (textMerge.success) {
      return textMerge;
    }
  }

  if (Array.isArray(server) && Array.isArray(client)) {
    return mergeArrays(field, path, base as unknown[], server, client);
  }

  if (isPlainObject(server) && isPlainObject(client)) {
    return threeWayMerge(
      base as Record<string, unknown>,
      server as Record<string, unknown>,
      client as Record<string, unknown>
    );
  }

  // Cannot auto-merge - return conflict
  return {
    success: false,
    conflicts: [
      {
        field,
        path,
        baseValue: base,
        serverValue: server,
        clientValue: client,
        autoResolvable: false,
      },
    ],
  };
}

/**
 * Merge text using diff-match-patch
 */
export function mergeText(
  base: string,
  server: string,
  client: string
): MergeResult<string> {
  try {
    // Create patches from base to each version
    const serverPatches = dmp.patch_make(base, server);
    const clientPatches = dmp.patch_make(base, client);

    // Apply server patches first
    let [merged, serverApplied] = dmp.patch_apply(serverPatches, base);

    // Then apply client patches
    const [finalMerged, clientApplied] = dmp.patch_apply(clientPatches, merged);

    // Check if all patches applied cleanly
    const allApplied =
      serverApplied.every(Boolean) && clientApplied.every(Boolean);

    if (allApplied) {
      return { success: true, merged: finalMerged, resolution: "auto-merged" };
    }

    // Some patches failed - there's a conflict
    return {
      success: false,
      merged: finalMerged, // Best effort merge
      conflicts: [
        {
          field: "text",
          path: [],
          baseValue: base,
          serverValue: server,
          clientValue: client,
          autoResolvable: false,
          suggestedResolution: finalMerged,
        },
      ],
    };
  } catch (error) {
    return {
      success: false,
      conflicts: [
        {
          field: "text",
          path: [],
          baseValue: base,
          serverValue: server,
          clientValue: client,
          autoResolvable: false,
        },
      ],
    };
  }
}

/**
 * Merge arrays - union of additions, intersection of deletions
 */
function mergeArrays(
  field: string,
  path: string[],
  base: unknown[],
  server: unknown[],
  client: unknown[]
): MergeResult<unknown[]> {
  const baseSet = new Set(base?.map((i) => JSON.stringify(i)) || []);
  const serverSet = new Set(server.map((i) => JSON.stringify(i)));
  const clientSet = new Set(client.map((i) => JSON.stringify(i)));

  // Items added by server
  const serverAdded = [...serverSet].filter((i) => !baseSet.has(i));
  // Items added by client
  const clientAdded = [...clientSet].filter((i) => !baseSet.has(i));
  // Items removed by both (intersection of removals)
  const serverRemoved = [...baseSet].filter((i) => !serverSet.has(i));
  const clientRemoved = [...baseSet].filter((i) => !clientSet.has(i));
  const bothRemoved = serverRemoved.filter((i) => clientRemoved.includes(i));

  // Start with base
  let merged = new Set(baseSet);

  // Add items added by either
  serverAdded.forEach((i) => merged.add(i));
  clientAdded.forEach((i) => merged.add(i));

  // Remove items removed by both
  bothRemoved.forEach((i) => merged.delete(i));

  const result = [...merged].map((i) => JSON.parse(i));

  // Check for order conflicts
  const orderConflict =
    server.length > 0 &&
    client.length > 0 &&
    JSON.stringify(server) !== JSON.stringify(client);

  if (orderConflict) {
    return {
      success: true,
      merged: result,
      conflicts: [
        {
          field,
          path,
          baseValue: base,
          serverValue: server,
          clientValue: client,
          autoResolvable: true,
          suggestedResolution: result,
        },
      ],
    };
  }

  return { success: true, merged: result };
}

function deepEqual(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
```

### CRDT Implementation (Using Yjs)

```typescript
// lib/conflict/crdt-document.ts
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";

export interface CRDTDocumentOptions {
  documentId: string;
  websocketUrl?: string;
  onSync?: () => void;
  onUpdate?: (update: Uint8Array) => void;
}

export class CRDTDocument {
  private doc: Y.Doc;
  private provider?: WebsocketProvider;
  private documentId: string;

  constructor(options: CRDTDocumentOptions) {
    this.documentId = options.documentId;
    this.doc = new Y.Doc();

    // Connect to WebSocket provider for real-time sync
    if (options.websocketUrl) {
      this.provider = new WebsocketProvider(
        options.websocketUrl,
        options.documentId,
        this.doc
      );

      this.provider.on("sync", () => {
        options.onSync?.();
      });
    }

    // Listen for local updates
    this.doc.on("update", (update: Uint8Array) => {
      options.onUpdate?.(update);
    });
  }

  /**
   * Get a shared text for collaborative editing
   */
  getText(name: string = "content"): Y.Text {
    return this.doc.getText(name);
  }

  /**
   * Get a shared map for key-value data
   */
  getMap<T>(name: string = "data"): Y.Map<T> {
    return this.doc.getMap(name);
  }

  /**
   * Get a shared array
   */
  getArray<T>(name: string = "items"): Y.Array<T> {
    return this.doc.getArray(name);
  }

  /**
   * Apply a remote update
   */
  applyUpdate(update: Uint8Array): void {
    Y.applyUpdate(this.doc, update);
  }

  /**
   * Get current state as update
   */
  getStateAsUpdate(): Uint8Array {
    return Y.encodeStateAsUpdate(this.doc);
  }

  /**
   * Get state vector for syncing
   */
  getStateVector(): Uint8Array {
    return Y.encodeStateVector(this.doc);
  }

  /**
   * Compute diff from state vector
   */
  getDiff(stateVector: Uint8Array): Uint8Array {
    return Y.encodeStateAsUpdate(this.doc, stateVector);
  }

  /**
   * Transact multiple changes atomically
   */
  transact(fn: () => void, origin?: string): void {
    this.doc.transact(fn, origin);
  }

  /**
   * Get undo manager for a shared type
   */
  createUndoManager(
    scope: Y.Text | Y.Array<unknown> | Y.Map<unknown>
  ): Y.UndoManager {
    return new Y.UndoManager(scope);
  }

  /**
   * Observe changes to the document
   */
  observe(callback: (events: Y.YEvent<any>[], transaction: Y.Transaction) => void): void {
    this.doc.on("update", (update, origin, doc, transaction) => {
      callback(transaction.changedParentTypes as any, transaction);
    });
  }

  /**
   * Destroy the document and disconnect
   */
  destroy(): void {
    this.provider?.destroy();
    this.doc.destroy();
  }
}

// React hook for CRDT document
// hooks/use-crdt-document.ts
import { useEffect, useState, useRef } from "react";

export function useCRDTDocument(documentId: string, websocketUrl?: string) {
  const [isConnected, setIsConnected] = useState(false);
  const [isSynced, setIsSynced] = useState(false);
  const docRef = useRef<CRDTDocument | null>(null);

  useEffect(() => {
    const doc = new CRDTDocument({
      documentId,
      websocketUrl,
      onSync: () => setIsSynced(true),
    });

    docRef.current = doc;
    setIsConnected(true);

    return () => {
      doc.destroy();
      docRef.current = null;
      setIsConnected(false);
      setIsSynced(false);
    };
  }, [documentId, websocketUrl]);

  return {
    doc: docRef.current,
    isConnected,
    isSynced,
  };
}
```

### Operational Transformation Implementation

```typescript
// lib/conflict/ot.ts
export type Operation =
  | { type: "insert"; position: number; text: string }
  | { type: "delete"; position: number; length: number }
  | { type: "retain"; count: number };

export interface OperationSet {
  id: string;
  baseVersion: number;
  operations: Operation[];
  userId: string;
  timestamp: number;
}

/**
 * Transform operation A against operation B
 * Returns transformed A that can be applied after B
 */
export function transform(opA: Operation, opB: Operation): Operation {
  // Insert vs Insert
  if (opA.type === "insert" && opB.type === "insert") {
    if (opA.position <= opB.position) {
      return opA; // A comes first, no change
    }
    return {
      ...opA,
      position: opA.position + opB.text.length,
    };
  }

  // Insert vs Delete
  if (opA.type === "insert" && opB.type === "delete") {
    if (opA.position <= opB.position) {
      return opA;
    }
    if (opA.position >= opB.position + opB.length) {
      return {
        ...opA,
        position: opA.position - opB.length,
      };
    }
    // Insert position is within deleted range - move to deletion point
    return {
      ...opA,
      position: opB.position,
    };
  }

  // Delete vs Insert
  if (opA.type === "delete" && opB.type === "insert") {
    if (opA.position >= opB.position) {
      return {
        ...opA,
        position: opA.position + opB.text.length,
      };
    }
    if (opA.position + opA.length <= opB.position) {
      return opA;
    }
    // Delete range spans insert position - split deletion
    return {
      ...opA,
      length: opA.length + opB.text.length,
    };
  }

  // Delete vs Delete
  if (opA.type === "delete" && opB.type === "delete") {
    if (opA.position >= opB.position + opB.length) {
      return {
        ...opA,
        position: opA.position - opB.length,
      };
    }
    if (opA.position + opA.length <= opB.position) {
      return opA;
    }
    // Overlapping deletions
    const start = Math.max(opA.position, opB.position);
    const endA = opA.position + opA.length;
    const endB = opB.position + opB.length;
    const end = Math.min(endA, endB);

    if (opA.position < opB.position) {
      return {
        type: "delete",
        position: opA.position,
        length: opA.length - (end - start),
      };
    }
    return {
      type: "delete",
      position: opB.position,
      length: opA.length - (end - start),
    };
  }

  // Retain operations
  return opA;
}

/**
 * Transform a set of operations against another set
 */
export function transformOperations(
  opsA: Operation[],
  opsB: Operation[]
): Operation[] {
  let transformed = [...opsA];

  for (const opB of opsB) {
    transformed = transformed.map((opA) => transform(opA, opB));
  }

  return transformed;
}

/**
 * Apply operations to a string
 */
export function applyOperations(text: string, operations: Operation[]): string {
  let result = text;
  let offset = 0;

  for (const op of operations) {
    switch (op.type) {
      case "insert":
        result =
          result.slice(0, op.position + offset) +
          op.text +
          result.slice(op.position + offset);
        offset += op.text.length;
        break;
      case "delete":
        result =
          result.slice(0, op.position + offset) +
          result.slice(op.position + offset + op.length);
        offset -= op.length;
        break;
      case "retain":
        // No change
        break;
    }
  }

  return result;
}

/**
 * OT Server for managing document versions
 */
export class OTServer {
  private history: OperationSet[] = [];
  private currentVersion: number = 0;
  private document: string = "";

  constructor(initialDocument: string = "") {
    this.document = initialDocument;
  }

  /**
   * Process incoming operations from a client
   */
  processOperations(clientOps: OperationSet): {
    transformed: OperationSet;
    serverVersion: number;
    document: string;
  } {
    // Get operations since client's base version
    const concurrentOps = this.history.slice(clientOps.baseVersion);

    // Transform client ops against all concurrent server ops
    let transformedOps = clientOps.operations;

    for (const serverOp of concurrentOps) {
      transformedOps = transformOperations(transformedOps, serverOp.operations);
    }

    // Apply transformed operations
    this.document = applyOperations(this.document, transformedOps);
    this.currentVersion++;

    // Store in history
    const transformedSet: OperationSet = {
      id: clientOps.id,
      baseVersion: this.currentVersion - 1,
      operations: transformedOps,
      userId: clientOps.userId,
      timestamp: Date.now(),
    };

    this.history.push(transformedSet);

    // Trim history if too long
    if (this.history.length > 1000) {
      this.history = this.history.slice(-500);
    }

    return {
      transformed: transformedSet,
      serverVersion: this.currentVersion,
      document: this.document,
    };
  }

  getDocument(): string {
    return this.document;
  }

  getVersion(): number {
    return this.currentVersion;
  }

  getHistory(sinceVersion: number): OperationSet[] {
    return this.history.slice(sinceVersion);
  }
}
```

### Conflict Resolution Service

```typescript
// lib/conflict/resolution-service.ts
import { prisma } from "@/lib/db";
import { VectorClock } from "./vector-clock";
import { threeWayMerge } from "./three-way-merge";
import type {
  VersionedDocument,
  MergeResult,
  MergeStrategy,
  ConflictResolutionContext,
} from "./types";

export class ConflictResolutionService<T extends Record<string, unknown>> {
  private model: string;
  private defaultStrategy: MergeStrategy<T>;

  constructor(model: string, defaultStrategy: MergeStrategy<T> = "three-way-merge") {
    this.model = model;
    this.defaultStrategy = defaultStrategy;
  }

  /**
   * Attempt to update a document with conflict detection
   */
  async update(
    id: string,
    clientData: T,
    clientVersion: number,
    userId: string,
    options: {
      strategy?: MergeStrategy<T>;
      forceOverwrite?: boolean;
    } = {}
  ): Promise<{
    success: boolean;
    document?: VersionedDocument<T>;
    conflict?: ConflictResolutionContext<T>;
    mergeResult?: MergeResult<T>;
  }> {
    const { strategy = this.defaultStrategy, forceOverwrite = false } = options;

    return prisma.$transaction(async (tx) => {
      // Get current server document
      const server = await (tx as any)[this.model].findUnique({
        where: { id },
        include: { history: { orderBy: { version: "desc" }, take: 1 } },
      });

      if (!server) {
        throw new Error("Document not found");
      }

      // No conflict - versions match
      if (server.version === clientVersion || forceOverwrite) {
        const updated = await this.applyUpdate(tx, id, clientData, server, userId);
        return { success: true, document: updated };
      }

      // Conflict detected - versions don't match
      const context: ConflictResolutionContext<T> = {
        documentId: id,
        base: server.history[0] || null,
        server: {
          id: server.id,
          data: server.data as T,
          version: server.version,
          vectorClock: server.vectorClock || {},
          updatedAt: server.updatedAt,
          updatedBy: server.updatedBy,
        },
        client: { data: clientData, version: clientVersion },
        userId,
      };

      // Apply resolution strategy
      const mergeResult = await this.resolveConflict(context, strategy);

      if (mergeResult.success && mergeResult.merged) {
        const updated = await this.applyUpdate(
          tx,
          id,
          mergeResult.merged,
          server,
          userId
        );
        return { success: true, document: updated, mergeResult };
      }

      // Could not auto-resolve - return conflict for manual resolution
      return {
        success: false,
        conflict: context,
        mergeResult,
      };
    });
  }

  private async resolveConflict(
    context: ConflictResolutionContext<T>,
    strategy: MergeStrategy<T>
  ): Promise<MergeResult<T>> {
    if (typeof strategy === "function") {
      return strategy(context);
    }

    switch (strategy) {
      case "last-write-wins":
        return {
          success: true,
          merged: context.client.data,
          resolution: "client-wins",
        };

      case "first-write-wins":
      case "server-wins":
        return {
          success: true,
          merged: context.server.data,
          resolution: "server-wins",
        };

      case "client-wins":
        return {
          success: true,
          merged: context.client.data,
          resolution: "client-wins",
        };

      case "three-way-merge":
        return threeWayMerge(
          context.base?.data || null,
          context.server.data,
          context.client.data
        );

      case "manual":
        return {
          success: false,
          resolution: "manual",
        };

      default:
        return { success: false };
    }
  }

  private async applyUpdate(
    tx: any,
    id: string,
    data: T,
    currentServer: any,
    userId: string
  ): Promise<VersionedDocument<T>> {
    // Save current version to history
    await tx[`${this.model}History`].create({
      data: {
        [`${this.model.toLowerCase()}Id`]: id,
        data: currentServer.data,
        version: currentServer.version,
        updatedBy: currentServer.updatedBy,
        updatedAt: currentServer.updatedAt,
      },
    });

    // Update document
    const updated = await tx[this.model].update({
      where: { id },
      data: {
        data,
        version: currentServer.version + 1,
        updatedBy: userId,
        updatedAt: new Date(),
        vectorClock: this.incrementVectorClock(
          currentServer.vectorClock || {},
          userId
        ),
      },
    });

    return {
      id: updated.id,
      data: updated.data as T,
      version: updated.version,
      vectorClock: updated.vectorClock,
      updatedAt: updated.updatedAt,
      updatedBy: updated.updatedBy,
    };
  }

  private incrementVectorClock(
    clock: Record<string, number>,
    nodeId: string
  ): Record<string, number> {
    return {
      ...clock,
      [nodeId]: (clock[nodeId] || 0) + 1,
    };
  }
}
```

### Conflict Resolution UI Components

```typescript
// components/conflict/conflict-resolution-dialog.tsx
"use client";

import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, GitMerge, RefreshCw, Check } from "lucide-react";
import type { ConflictInfo, MergeResult } from "@/lib/conflict/types";

interface ConflictResolutionDialogProps<T> {
  open: boolean;
  onClose: () => void;
  serverData: T;
  clientData: T;
  conflicts: ConflictInfo<unknown>[];
  suggestedMerge?: T;
  onResolve: (
    resolution: "keep-mine" | "keep-theirs" | "merge",
    mergedData?: T
  ) => void;
  entityName?: string;
}

export function ConflictResolutionDialog<T extends Record<string, unknown>>({
  open,
  onClose,
  serverData,
  clientData,
  conflicts,
  suggestedMerge,
  onResolve,
  entityName = "document",
}: ConflictResolutionDialogProps<T>) {
  const [selectedResolutions, setSelectedResolutions] = useState<
    Record<string, "server" | "client">
  >({});
  const [activeTab, setActiveTab] = useState<string>("conflicts");

  const resolvedData = useMemo(() => {
    if (!suggestedMerge) return serverData;

    const resolved = { ...suggestedMerge };

    for (const [field, choice] of Object.entries(selectedResolutions)) {
      if (choice === "server") {
        (resolved as any)[field] = (serverData as any)[field];
      } else {
        (resolved as any)[field] = (clientData as any)[field];
      }
    }

    return resolved;
  }, [suggestedMerge, selectedResolutions, serverData, clientData]);

  const handleFieldResolution = (
    field: string,
    choice: "server" | "client"
  ) => {
    setSelectedResolutions((prev) => ({
      ...prev,
      [field]: choice,
    }));
  };

  const handleResolve = (action: "keep-mine" | "keep-theirs" | "merge") => {
    switch (action) {
      case "keep-mine":
        onResolve("keep-mine", clientData);
        break;
      case "keep-theirs":
        onResolve("keep-theirs", serverData);
        break;
      case "merge":
        onResolve("merge", resolvedData);
        break;
    }
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Conflict Detected
          </DialogTitle>
          <DialogDescription>
            This {entityName} was modified by someone else while you were editing.
            Choose how to resolve the conflict.
          </DialogDescription>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex-1 overflow-hidden flex flex-col"
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="conflicts">
              Conflicts
              <Badge variant="destructive" className="ml-2">
                {conflicts.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="compare">Side by Side</TabsTrigger>
            <TabsTrigger value="preview">Preview Merge</TabsTrigger>
          </TabsList>

          <TabsContent value="conflicts" className="flex-1 overflow-auto mt-4">
            <div className="space-y-4">
              {conflicts.map((conflict, index) => (
                <ConflictField
                  key={conflict.field}
                  conflict={conflict}
                  selectedResolution={selectedResolutions[conflict.field]}
                  onSelect={(choice) =>
                    handleFieldResolution(conflict.field, choice)
                  }
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="compare" className="flex-1 overflow-auto mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Badge variant="outline">Server Version</Badge>
                </h4>
                <pre className="p-4 bg-muted rounded-lg text-sm overflow-auto max-h-96">
                  {JSON.stringify(serverData, null, 2)}
                </pre>
              </div>
              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Badge variant="outline">Your Version</Badge>
                </h4>
                <pre className="p-4 bg-muted rounded-lg text-sm overflow-auto max-h-96">
                  {JSON.stringify(clientData, null, 2)}
                </pre>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="preview" className="flex-1 overflow-auto mt-4">
            <div>
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <GitMerge className="h-4 w-4" />
                Merged Result
              </h4>
              <pre className="p-4 bg-muted rounded-lg text-sm overflow-auto max-h-96">
                {JSON.stringify(resolvedData, null, 2)}
              </pre>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="flex gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => handleResolve("keep-theirs")}>
            Keep Server Version
          </Button>
          <Button variant="outline" onClick={() => handleResolve("keep-mine")}>
            Keep My Version
          </Button>
          <Button onClick={() => handleResolve("merge")}>
            <GitMerge className="h-4 w-4 mr-2" />
            Apply Merged
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ConflictField({
  conflict,
  selectedResolution,
  onSelect,
}: {
  conflict: ConflictInfo<unknown>;
  selectedResolution?: "server" | "client";
  onSelect: (choice: "server" | "client") => void;
}) {
  return (
    <div className="border rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-medium">{conflict.field}</h4>
        {conflict.autoResolvable && (
          <Badge variant="secondary">Auto-resolvable</Badge>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => onSelect("server")}
          className={`p-3 border rounded-lg text-left transition-colors ${
            selectedResolution === "server"
              ? "border-primary bg-primary/5"
              : "hover:border-muted-foreground/50"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Server</span>
            {selectedResolution === "server" && (
              <Check className="h-4 w-4 text-primary" />
            )}
          </div>
          <pre className="text-sm bg-muted p-2 rounded overflow-auto max-h-24">
            {JSON.stringify(conflict.serverValue, null, 2)}
          </pre>
        </button>

        <button
          onClick={() => onSelect("client")}
          className={`p-3 border rounded-lg text-left transition-colors ${
            selectedResolution === "client"
              ? "border-primary bg-primary/5"
              : "hover:border-muted-foreground/50"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Your Changes</span>
            {selectedResolution === "client" && (
              <Check className="h-4 w-4 text-primary" />
            )}
          </div>
          <pre className="text-sm bg-muted p-2 rounded overflow-auto max-h-24">
            {JSON.stringify(conflict.clientValue, null, 2)}
          </pre>
        </button>
      </div>

      {conflict.baseValue !== undefined && (
        <div className="mt-3 pt-3 border-t">
          <span className="text-sm text-muted-foreground">Original value:</span>
          <pre className="text-sm bg-muted p-2 rounded mt-1 overflow-auto max-h-20">
            {JSON.stringify(conflict.baseValue, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
```

### Hook for Conflict-Aware Updates

```typescript
// hooks/use-conflict-aware-mutation.ts
"use client";

import { useState, useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  ConflictResolutionContext,
  MergeResult,
  VersionedDocument,
} from "@/lib/conflict/types";

interface UseConflictAwareMutationOptions<T> {
  mutationFn: (
    id: string,
    data: T,
    version: number
  ) => Promise<{
    success: boolean;
    document?: VersionedDocument<T>;
    conflict?: ConflictResolutionContext<T>;
    mergeResult?: MergeResult<T>;
  }>;
  onSuccess?: (document: VersionedDocument<T>) => void;
  onConflict?: (context: ConflictResolutionContext<T>) => void;
  queryKey?: string[];
  autoResolveStrategy?: "server-wins" | "client-wins" | "ask-user";
}

export function useConflictAwareMutation<T extends Record<string, unknown>>({
  mutationFn,
  onSuccess,
  onConflict,
  queryKey,
  autoResolveStrategy = "ask-user",
}: UseConflictAwareMutationOptions<T>) {
  const queryClient = useQueryClient();
  const [conflict, setConflict] = useState<ConflictResolutionContext<T> | null>(
    null
  );
  const [mergeResult, setMergeResult] = useState<MergeResult<T> | null>(null);

  const mutation = useMutation({
    mutationFn: async ({
      id,
      data,
      version,
    }: {
      id: string;
      data: T;
      version: number;
    }) => {
      const result = await mutationFn(id, data, version);

      if (result.success && result.document) {
        return result.document;
      }

      if (result.conflict) {
        setConflict(result.conflict);
        setMergeResult(result.mergeResult || null);

        // Auto-resolve if configured
        if (autoResolveStrategy !== "ask-user" && result.mergeResult) {
          if (autoResolveStrategy === "server-wins") {
            return mutationFn(
              id,
              result.conflict.server.data,
              result.conflict.server.version
            ).then((r) => r.document!);
          } else if (autoResolveStrategy === "client-wins") {
            // Force overwrite with client data
            return mutationFn(id, data, result.conflict.server.version).then(
              (r) => r.document!
            );
          }
        }

        onConflict?.(result.conflict);
        throw new ConflictError(result.conflict);
      }

      throw new Error("Update failed");
    },
    onSuccess: (document) => {
      setConflict(null);
      setMergeResult(null);

      if (queryKey) {
        queryClient.invalidateQueries({ queryKey });
      }

      onSuccess?.(document);
    },
  });

  const resolveConflict = useCallback(
    async (
      resolution: "keep-mine" | "keep-theirs" | "merge",
      mergedData?: T
    ) => {
      if (!conflict) return;

      let dataToSave: T;

      switch (resolution) {
        case "keep-mine":
          dataToSave = conflict.client.data;
          break;
        case "keep-theirs":
          dataToSave = conflict.server.data;
          break;
        case "merge":
          if (!mergedData) {
            throw new Error("Merged data required for merge resolution");
          }
          dataToSave = mergedData;
          break;
      }

      // Re-attempt with server's current version
      const result = await mutationFn(
        conflict.documentId,
        dataToSave,
        conflict.server.version
      );

      if (result.success && result.document) {
        setConflict(null);
        setMergeResult(null);

        if (queryKey) {
          queryClient.invalidateQueries({ queryKey });
        }

        onSuccess?.(result.document);
      } else if (result.conflict) {
        // Another conflict occurred - update state
        setConflict(result.conflict);
        setMergeResult(result.mergeResult || null);
      }
    },
    [conflict, mutationFn, queryClient, queryKey, onSuccess]
  );

  const dismissConflict = useCallback(() => {
    setConflict(null);
    setMergeResult(null);
  }, []);

  return {
    ...mutation,
    conflict,
    mergeResult,
    resolveConflict,
    dismissConflict,
    hasConflict: conflict !== null,
  };
}

class ConflictError extends Error {
  constructor(public context: ConflictResolutionContext<unknown>) {
    super("Conflict detected");
    this.name = "ConflictError";
  }
}
```

## Examples

### Example 1: Collaborative Document Editor

```typescript
// app/documents/[id]/editor.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { useCRDTDocument } from "@/hooks/use-crdt-document";
import * as Y from "yjs";

export function CollaborativeEditor({ documentId }: { documentId: string }) {
  const { doc, isConnected, isSynced } = useCRDTDocument(
    documentId,
    process.env.NEXT_PUBLIC_WS_URL
  );
  const [content, setContent] = useState("");

  useEffect(() => {
    if (!doc) return;

    const text = doc.getText("content");

    // Initial content
    setContent(text.toString());

    // Observe changes
    text.observe((event) => {
      setContent(text.toString());
    });
  }, [doc]);

  const handleChange = useCallback(
    (newContent: string) => {
      if (!doc) return;

      const text = doc.getText("content");

      doc.transact(() => {
        text.delete(0, text.length);
        text.insert(0, newContent);
      });
    },
    [doc]
  );

  return (
    <div className="h-screen flex flex-col">
      <div className="flex items-center gap-2 p-2 border-b">
        <div
          className={`w-2 h-2 rounded-full ${
            isConnected ? "bg-green-500" : "bg-red-500"
          }`}
        />
        <span className="text-sm">
          {isConnected
            ? isSynced
              ? "Connected & Synced"
              : "Connecting..."
            : "Disconnected"}
        </span>
      </div>

      <textarea
        value={content}
        onChange={(e) => handleChange(e.target.value)}
        className="flex-1 p-4 resize-none outline-none font-mono"
        placeholder="Start typing..."
      />
    </div>
  );
}
```

### Example 2: Form with Conflict Detection

```typescript
// app/settings/profile/page.tsx
"use client";

import { useState } from "react";
import { useConflictAwareMutation } from "@/hooks/use-conflict-aware-mutation";
import { ConflictResolutionDialog } from "@/components/conflict/conflict-resolution-dialog";

interface ProfileData {
  name: string;
  bio: string;
  location: string;
  website: string;
}

export function ProfileSettings({
  initialData,
  initialVersion,
}: {
  initialData: ProfileData;
  initialVersion: number;
}) {
  const [formData, setFormData] = useState(initialData);
  const [version, setVersion] = useState(initialVersion);

  const {
    mutate,
    isPending,
    conflict,
    mergeResult,
    resolveConflict,
    dismissConflict,
    hasConflict,
  } = useConflictAwareMutation<ProfileData>({
    mutationFn: async (id, data, version) => {
      const response = await fetch(`/api/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data, version }),
      });

      return response.json();
    },
    onSuccess: (doc) => {
      setFormData(doc.data);
      setVersion(doc.version);
    },
    autoResolveStrategy: "ask-user",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutate({ id: "profile", data: formData, version });
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
        <div>
          <label className="block text-sm font-medium mb-1">Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, name: e.target.value }))
            }
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Bio</label>
          <textarea
            value={formData.bio}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, bio: e.target.value }))
            }
            className="w-full px-3 py-2 border rounded-lg"
            rows={3}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Location</label>
          <input
            type="text"
            value={formData.location}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, location: e.target.value }))
            }
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Website</label>
          <input
            type="url"
            value={formData.website}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, website: e.target.value }))
            }
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full py-2 bg-primary text-primary-foreground rounded-lg disabled:opacity-50"
        >
          {isPending ? "Saving..." : "Save Changes"}
        </button>
      </form>

      {hasConflict && conflict && (
        <ConflictResolutionDialog
          open={true}
          onClose={dismissConflict}
          serverData={conflict.server.data}
          clientData={conflict.client.data}
          conflicts={mergeResult?.conflicts || []}
          suggestedMerge={mergeResult?.merged}
          onResolve={resolveConflict}
          entityName="profile"
        />
      )}
    </>
  );
}
```

### Example 3: Inventory Management with Conflict Resolution

```typescript
// app/api/inventory/[productId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { ConflictResolutionService } from "@/lib/conflict/resolution-service";

interface InventoryData {
  quantity: number;
  reservedQuantity: number;
  location: string;
  lastCountedAt: string;
}

const inventoryResolver = new ConflictResolutionService<InventoryData>(
  "inventory",
  // Custom strategy: for quantity fields, add the deltas
  async (context) => {
    const base = context.base?.data;
    const server = context.server.data;
    const client = context.client.data;

    // Calculate quantity delta from client
    const clientQuantityDelta = base
      ? client.quantity - base.quantity
      : client.quantity;

    // Apply client's delta to server's current quantity
    const mergedQuantity = server.quantity + clientQuantityDelta;

    // For reserved quantity, take the max (most conservative)
    const mergedReserved = Math.max(
      server.reservedQuantity,
      client.reservedQuantity
    );

    return {
      success: true,
      merged: {
        quantity: Math.max(0, mergedQuantity), // Prevent negative
        reservedQuantity: mergedReserved,
        location: client.location, // Last write wins for location
        lastCountedAt: new Date().toISOString(),
      },
      resolution: "auto-merged",
    };
  }
);

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  const { productId } = await params;
  const { data, version } = await request.json();
  const userId = request.headers.get("x-user-id") || "system";

  const result = await inventoryResolver.update(productId, data, version, userId);

  if (result.success) {
    return NextResponse.json({ success: true, document: result.document });
  }

  if (result.conflict) {
    return NextResponse.json(
      {
        success: false,
        error: "Conflict",
        conflict: result.conflict,
        mergeResult: result.mergeResult,
      },
      { status: 409 }
    );
  }

  return NextResponse.json({ error: "Update failed" }, { status: 500 });
}
```

## Anti-patterns

### Anti-pattern 1: Silently Overwriting Data

```typescript
// BAD: Overwrites without version check - loses other user's changes
async function updateDocument(id: string, data: any) {
  await prisma.document.update({
    where: { id },
    data,
  });
}

// GOOD: Check version and handle conflicts
async function updateDocument(id: string, data: any, expectedVersion: number) {
  const result = await conflictService.update(id, data, expectedVersion, userId);

  if (!result.success && result.conflict) {
    // Handle conflict appropriately
    throw new ConflictError(result.conflict);
  }

  return result.document;
}
```

### Anti-pattern 2: Last-Write-Wins Without User Awareness

```typescript
// BAD: Last-write-wins without telling the user
async function saveChanges(data: any) {
  await api.save(data); // Silently overwrites - user doesn't know they lost changes
}

// GOOD: Inform user when their changes conflict
async function saveChanges(data: any, version: number) {
  try {
    await api.save(data, version);
    toast.success("Changes saved");
  } catch (error) {
    if (error instanceof ConflictError) {
      // Show conflict dialog
      setConflict(error.context);
    }
  }
}
```

### Anti-pattern 3: Not Preserving User's Work

```typescript
// BAD: Forces user to re-enter their changes
function handleConflict(serverData: any) {
  setFormData(serverData); // User's unsaved changes are lost!
  toast.error("Your changes were overwritten");
}

// GOOD: Preserve user's changes and let them decide
function handleConflict(conflict: ConflictContext) {
  // User's changes are preserved in conflict.client.data
  setShowConflictDialog(true);
  // Show options: keep mine, keep theirs, or merge
}
```

### Anti-pattern 4: Ignoring Concurrent Edits

```typescript
// BAD: No real-time awareness
function Editor({ document }) {
  // User edits for 30 minutes, then submits
  // All intervening changes cause conflicts
}

// GOOD: Real-time presence and change awareness
function Editor({ document }) {
  const { otherUsers, recentChanges } = usePresence(document.id);

  return (
    <>
      <PresenceIndicator users={otherUsers} />
      {recentChanges.length > 0 && (
        <RecentChangesNotification changes={recentChanges} />
      )}
      {/* Editor content */}
    </>
  );
}
```

## Testing

### Unit Tests for Three-Way Merge

```typescript
// __tests__/conflict/three-way-merge.test.ts
import { describe, it, expect } from "vitest";
import { threeWayMerge, mergeText } from "@/lib/conflict/three-way-merge";

describe("threeWayMerge", () => {
  it("should auto-merge when only one side changed", () => {
    const base = { name: "Original", bio: "Hello" };
    const server = { name: "Original", bio: "Hello" };
    const client = { name: "Updated", bio: "Hello" };

    const result = threeWayMerge(base, server, client);

    expect(result.success).toBe(true);
    expect(result.merged).toEqual({ name: "Updated", bio: "Hello" });
  });

  it("should detect conflicts when both sides changed same field", () => {
    const base = { name: "Original" };
    const server = { name: "Server Change" };
    const client = { name: "Client Change" };

    const result = threeWayMerge(base, server, client);

    expect(result.success).toBe(false);
    expect(result.conflicts).toHaveLength(1);
    expect(result.conflicts![0].field).toBe("name");
  });

  it("should merge non-conflicting changes from both sides", () => {
    const base = { name: "Original", bio: "Original Bio" };
    const server = { name: "Server Name", bio: "Original Bio" };
    const client = { name: "Original", bio: "Client Bio" };

    const result = threeWayMerge(base, server, client);

    expect(result.success).toBe(true);
    expect(result.merged).toEqual({ name: "Server Name", bio: "Client Bio" });
  });
});

describe("mergeText", () => {
  it("should merge non-overlapping text changes", () => {
    const base = "Hello World";
    const server = "Hello Beautiful World";
    const client = "Hello World!";

    const result = mergeText(base, server, client);

    expect(result.success).toBe(true);
    expect(result.merged).toBe("Hello Beautiful World!");
  });

  it("should detect conflicting text changes", () => {
    const base = "Hello World";
    const server = "Hello Universe";
    const client = "Hello Galaxy";

    const result = mergeText(base, server, client);

    // Both changed "World" to different things
    expect(result.conflicts).toBeDefined();
  });
});
```

### Integration Tests for Conflict Resolution

```typescript
// __tests__/conflict/resolution-service.test.ts
import { describe, it, expect, beforeEach } from "vitest";
import { ConflictResolutionService } from "@/lib/conflict/resolution-service";
import { prisma } from "@/lib/db";

describe("ConflictResolutionService", () => {
  let service: ConflictResolutionService<{ title: string; content: string }>;

  beforeEach(async () => {
    service = new ConflictResolutionService("document", "three-way-merge");

    // Clean up and seed test data
    await prisma.documentHistory.deleteMany();
    await prisma.document.deleteMany();

    await prisma.document.create({
      data: {
        id: "test-doc",
        data: { title: "Original", content: "Original content" },
        version: 1,
        updatedBy: "user-1",
      },
    });
  });

  it("should update when versions match", async () => {
    const result = await service.update(
      "test-doc",
      { title: "Updated", content: "Updated content" },
      1,
      "user-2"
    );

    expect(result.success).toBe(true);
    expect(result.document?.version).toBe(2);
  });

  it("should detect conflict when versions differ", async () => {
    // Simulate another update first
    await service.update(
      "test-doc",
      { title: "Other Update", content: "Original content" },
      1,
      "user-3"
    );

    // Try to update with stale version
    const result = await service.update(
      "test-doc",
      { title: "Original", content: "My content" },
      1, // Stale version
      "user-2"
    );

    // Should auto-merge since different fields changed
    expect(result.success).toBe(true);
    expect(result.document?.data).toEqual({
      title: "Other Update",
      content: "My content",
    });
  });

  it("should return conflict for same-field changes", async () => {
    // Simulate another update first
    await service.update(
      "test-doc",
      { title: "Server Title", content: "Original content" },
      1,
      "user-3"
    );

    // Try to update same field with stale version
    const result = await service.update(
      "test-doc",
      { title: "Client Title", content: "Original content" },
      1,
      "user-2"
    );

    expect(result.success).toBe(false);
    expect(result.conflict).toBeDefined();
  });
});
```

## Related Skills

- [crdt.md](./crdt.md) - CRDT data structures
- [optimistic-updates.md](./optimistic-updates.md) - Optimistic UI patterns
- [websockets.md](./websockets.md) - Real-time communication
- [collaboration.md](./collaboration.md) - Collaboration features
- [autosave.md](./autosave.md) - Auto-save patterns
- [presence.md](./presence.md) - Presence indicators

---

## Changelog

### 2.0.0 (2025-01-18)
- Complete rewrite with comprehensive coverage
- Added OT implementation
- Added CRDT integration with Yjs
- Added vector clock implementation
- Added three-way merge with text support
- Added conflict resolution UI components
- Added conflict-aware mutation hook
- Added real-world examples
- Added comprehensive testing patterns

### 1.0.0 (2025-01-18)
- Initial implementation with basic optimistic locking
