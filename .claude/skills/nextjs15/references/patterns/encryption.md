---
id: pt-encryption
name: Data Encryption
version: 1.0.0
layer: L5
category: security
description: Implement data encryption at rest and in transit for sensitive information
tags: [encryption, security, aes, crypto, sensitive-data, next15, react19]
composes: []
dependencies: []
formula: "Encryption = KeyManagement + AES-GCM (at rest) + TLS (in transit) + FieldLevel"
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# Data Encryption

## When to Use

- When storing sensitive data (PII, financial data)
- For encrypting API keys and secrets
- When compliance requires encryption at rest
- For encrypting file uploads
- When handling healthcare or financial data

## Overview

This pattern implements field-level encryption using AES-256-GCM for data at rest, with proper key management and rotation support. It covers encryption utilities, Prisma middleware, and secure key handling.

## Encryption Utilities

```typescript
// lib/crypto/encryption.ts
import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;
const KEY_LENGTH = 32;

// Get encryption key from environment
function getEncryptionKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY;
  if (!key) {
    throw new Error("ENCRYPTION_KEY environment variable is not set");
  }

  // Key should be 64 hex characters (32 bytes)
  if (key.length !== 64) {
    throw new Error("ENCRYPTION_KEY must be 64 hex characters (256 bits)");
  }

  return Buffer.from(key, "hex");
}

export function encrypt(plaintext: string): string {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(IV_LENGTH);

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(plaintext, "utf8", "base64");
  encrypted += cipher.final("base64");

  const authTag = cipher.getAuthTag();

  // Combine iv + authTag + encrypted data
  const combined = Buffer.concat([
    iv,
    authTag,
    Buffer.from(encrypted, "base64"),
  ]);

  return combined.toString("base64");
}

export function decrypt(ciphertext: string): string {
  const key = getEncryptionKey();
  const combined = Buffer.from(ciphertext, "base64");

  // Extract components
  const iv = combined.subarray(0, IV_LENGTH);
  const authTag = combined.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
  const encrypted = combined.subarray(IV_LENGTH + AUTH_TAG_LENGTH);

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encrypted.toString("base64"), "base64", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}

// Generate a new encryption key
export function generateEncryptionKey(): string {
  return crypto.randomBytes(KEY_LENGTH).toString("hex");
}

// Hash sensitive data for lookups (one-way)
export function hashForLookup(data: string): string {
  const salt = process.env.HASH_SALT || "";
  return crypto
    .createHash("sha256")
    .update(salt + data)
    .digest("hex");
}
```

## Key Rotation Support

```typescript
// lib/crypto/key-rotation.ts
import crypto from "crypto";

interface EncryptedData {
  version: number;
  data: string;
}

const CURRENT_KEY_VERSION = 1;

function getKeyByVersion(version: number): Buffer {
  const keys: Record<number, string | undefined> = {
    1: process.env.ENCRYPTION_KEY_V1,
    2: process.env.ENCRYPTION_KEY_V2,
  };

  const key = keys[version];
  if (!key) {
    throw new Error(`Encryption key version ${version} not found`);
  }

  return Buffer.from(key, "hex");
}

export function encryptWithVersion(plaintext: string): string {
  const key = getKeyByVersion(CURRENT_KEY_VERSION);
  const iv = crypto.randomBytes(16);

  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  let encrypted = cipher.update(plaintext, "utf8", "base64");
  encrypted += cipher.final("base64");

  const authTag = cipher.getAuthTag();

  const payload: EncryptedData = {
    version: CURRENT_KEY_VERSION,
    data: Buffer.concat([iv, authTag, Buffer.from(encrypted, "base64")]).toString("base64"),
  };

  return JSON.stringify(payload);
}

export function decryptWithVersion(ciphertext: string): string {
  const payload: EncryptedData = JSON.parse(ciphertext);
  const key = getKeyByVersion(payload.version);

  const combined = Buffer.from(payload.data, "base64");
  const iv = combined.subarray(0, 16);
  const authTag = combined.subarray(16, 32);
  const encrypted = combined.subarray(32);

  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encrypted.toString("base64"), "base64", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}

// Re-encrypt with current key version
export function rotateEncryption(ciphertext: string): string {
  const plaintext = decryptWithVersion(ciphertext);
  return encryptWithVersion(plaintext);
}
```

## Prisma Middleware for Auto-Encryption

```typescript
// lib/db/encryption-middleware.ts
import { Prisma } from "@prisma/client";
import { encrypt, decrypt } from "@/lib/crypto/encryption";

// Define which fields should be encrypted per model
const ENCRYPTED_FIELDS: Record<string, string[]> = {
  User: ["ssn", "taxId"],
  PaymentMethod: ["cardNumber", "cvv"],
  Document: ["content"],
};

export function encryptionMiddleware(): Prisma.Middleware {
  return async (params, next) => {
    const modelFields = ENCRYPTED_FIELDS[params.model || ""];

    if (!modelFields) {
      return next(params);
    }

    // Encrypt on create/update
    if (params.action === "create" || params.action === "update") {
      for (const field of modelFields) {
        if (params.args.data?.[field]) {
          params.args.data[field] = encrypt(params.args.data[field]);
        }
      }
    }

    if (params.action === "createMany") {
      for (const record of params.args.data || []) {
        for (const field of modelFields) {
          if (record[field]) {
            record[field] = encrypt(record[field]);
          }
        }
      }
    }

    const result = await next(params);

    // Decrypt on read
    if (result && (params.action === "findUnique" || params.action === "findFirst")) {
      for (const field of modelFields) {
        if (result[field]) {
          result[field] = decrypt(result[field]);
        }
      }
    }

    if (Array.isArray(result) && params.action === "findMany") {
      for (const record of result) {
        for (const field of modelFields) {
          if (record[field]) {
            record[field] = decrypt(record[field]);
          }
        }
      }
    }

    return result;
  };
}
```

## Secure API Keys Storage

```typescript
// lib/api-keys/storage.ts
import { encrypt, decrypt, hashForLookup } from "@/lib/crypto/encryption";
import { prisma } from "@/lib/db";
import crypto from "crypto";

export async function createApiKey(
  userId: string,
  name: string
): Promise<{ key: string; id: string }> {
  // Generate random API key
  const rawKey = `sk_live_${crypto.randomBytes(24).toString("base64url")}`;

  // Store encrypted version with hash for lookup
  const apiKey = await prisma.apiKey.create({
    data: {
      userId,
      name,
      keyHash: hashForLookup(rawKey),
      encryptedKey: encrypt(rawKey),
      lastFourChars: rawKey.slice(-4),
    },
  });

  // Return raw key only once
  return { key: rawKey, id: apiKey.id };
}

export async function validateApiKey(key: string): Promise<string | null> {
  const keyHash = hashForLookup(key);

  const apiKey = await prisma.apiKey.findUnique({
    where: { keyHash },
    select: { userId: true, active: true },
  });

  if (!apiKey || !apiKey.active) {
    return null;
  }

  // Update last used
  await prisma.apiKey.update({
    where: { keyHash },
    data: { lastUsedAt: new Date() },
  });

  return apiKey.userId;
}
```

## Encrypted File Upload

```typescript
// lib/storage/encrypted-upload.ts
import crypto from "crypto";
import { Readable } from "stream";

export async function encryptFile(
  file: Buffer,
  key: Buffer
): Promise<{ encrypted: Buffer; iv: Buffer; authTag: Buffer }> {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);

  const encrypted = Buffer.concat([
    cipher.update(file),
    cipher.final(),
  ]);

  return {
    encrypted,
    iv,
    authTag: cipher.getAuthTag(),
  };
}

export async function decryptFile(
  encrypted: Buffer,
  key: Buffer,
  iv: Buffer,
  authTag: Buffer
): Promise<Buffer> {
  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(authTag);

  return Buffer.concat([
    decipher.update(encrypted),
    decipher.final(),
  ]);
}

// Upload encrypted file
export async function uploadEncryptedFile(
  file: Buffer,
  filename: string
): Promise<{ fileId: string; keyId: string }> {
  // Generate per-file encryption key
  const fileKey = crypto.randomBytes(32);
  const { encrypted, iv, authTag } = await encryptFile(file, fileKey);

  // Store file key encrypted with master key
  const encryptedFileKey = encrypt(fileKey.toString("base64"));

  // Save to storage and database
  const fileId = await saveToStorage(encrypted, filename);
  const keyId = await saveFileKey(fileId, encryptedFileKey, iv, authTag);

  return { fileId, keyId };
}
```

## Environment Setup

```bash
# .env.local
# Generate with: openssl rand -hex 32
ENCRYPTION_KEY=your_64_character_hex_key_here

# For key rotation
ENCRYPTION_KEY_V1=old_key_hex
ENCRYPTION_KEY_V2=new_key_hex

# Hash salt for lookups
HASH_SALT=your_random_salt_here
```

## Anti-patterns

### Don't Use Weak Encryption

```typescript
// BAD - ECB mode is insecure
const cipher = crypto.createCipheriv("aes-256-ecb", key, null);

// GOOD - Use GCM for authenticated encryption
const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
```

### Don't Store Keys in Code

```typescript
// BAD - Hardcoded key
const key = Buffer.from("0123456789abcdef0123456789abcdef");

// GOOD - Environment variable
const key = Buffer.from(process.env.ENCRYPTION_KEY!, "hex");
```

## Related Patterns

- [api-keys](./api-keys.md)
- [hipaa-compliance](./hipaa-compliance.md)
- [session-management](./session-management.md)

---

## Changelog

### 1.0.0 (2025-01-18)
- Initial implementation
- AES-256-GCM encryption
- Key rotation support
- Prisma middleware
- Encrypted file uploads
