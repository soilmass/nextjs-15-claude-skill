---
id: pt-ocr
name: OCR Text Extraction
version: 1.0.0
layer: L5
category: ai
description: Extract text from images and documents using OCR
tags: [ocr, text-extraction, image, document, tesseract, vision, next15, react19]
composes: []
dependencies: []
formula: "OCR = ImagePreprocessing + OCREngine + TextExtraction + PostProcessing"
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# OCR Text Extraction

## When to Use

- When extracting text from scanned documents
- For receipt or invoice processing
- When implementing document digitization
- For ID verification and data extraction
- When building document search features

## Overview

This pattern implements OCR (Optical Character Recognition) using Tesseract.js for client-side processing and cloud APIs (Google Vision, AWS Textract) for server-side extraction.

## Client-Side OCR with Tesseract.js

```typescript
// lib/ocr/tesseract.ts
"use client";

import Tesseract from "tesseract.js";

export interface OCRResult {
  text: string;
  confidence: number;
  words: {
    text: string;
    confidence: number;
    bbox: { x0: number; y0: number; x1: number; y1: number };
  }[];
}

export async function extractTextFromImage(
  image: File | string,
  language: string = "eng",
  onProgress?: (progress: number) => void
): Promise<OCRResult> {
  const result = await Tesseract.recognize(image, language, {
    logger: (m) => {
      if (m.status === "recognizing text" && onProgress) {
        onProgress(Math.round(m.progress * 100));
      }
    },
  });

  return {
    text: result.data.text,
    confidence: result.data.confidence,
    words: result.data.words.map((w) => ({
      text: w.text,
      confidence: w.confidence,
      bbox: w.bbox,
    })),
  };
}

// Pre-load Tesseract worker for faster subsequent calls
let worker: Tesseract.Worker | null = null;

export async function initializeWorker(language: string = "eng") {
  if (!worker) {
    worker = await Tesseract.createWorker(language);
  }
  return worker;
}

export async function extractTextWithWorker(
  image: File | string,
  onProgress?: (progress: number) => void
): Promise<OCRResult> {
  if (!worker) {
    await initializeWorker();
  }

  const result = await worker!.recognize(image);

  return {
    text: result.data.text,
    confidence: result.data.confidence,
    words: result.data.words.map((w) => ({
      text: w.text,
      confidence: w.confidence,
      bbox: w.bbox,
    })),
  };
}

export async function terminateWorker() {
  if (worker) {
    await worker.terminate();
    worker = null;
  }
}
```

## Google Cloud Vision OCR

```typescript
// lib/ocr/google-vision.ts
import { ImageAnnotatorClient } from "@google-cloud/vision";

const client = new ImageAnnotatorClient({
  credentials: JSON.parse(process.env.GOOGLE_CLOUD_CREDENTIALS!),
});

export interface VisionOCRResult {
  text: string;
  blocks: {
    text: string;
    confidence: number;
    boundingBox: { x: number; y: number }[];
  }[];
  language: string;
}

export async function extractTextWithVision(
  imageBuffer: Buffer
): Promise<VisionOCRResult> {
  const [result] = await client.textDetection({
    image: { content: imageBuffer },
  });

  const fullText = result.fullTextAnnotation;

  if (!fullText) {
    return { text: "", blocks: [], language: "" };
  }

  const blocks = fullText.pages?.[0]?.blocks?.map((block) => ({
    text: block.paragraphs
      ?.map((p) => p.words?.map((w) => w.symbols?.map((s) => s.text).join("")).join(" "))
      .join("\n") || "",
    confidence: block.confidence || 0,
    boundingBox: block.boundingBox?.vertices?.map((v) => ({
      x: v.x || 0,
      y: v.y || 0,
    })) || [],
  })) || [];

  return {
    text: fullText.text || "",
    blocks,
    language: result.textAnnotations?.[0]?.locale || "",
  };
}

// Document OCR for multi-page PDFs
export async function extractTextFromDocument(
  documentBuffer: Buffer,
  mimeType: string = "application/pdf"
): Promise<VisionOCRResult[]> {
  const [operation] = await client.asyncBatchAnnotateFiles({
    requests: [
      {
        inputConfig: {
          content: documentBuffer,
          mimeType,
        },
        features: [{ type: "DOCUMENT_TEXT_DETECTION" }],
        outputConfig: {
          gcsDestination: {
            uri: `gs://${process.env.GCS_BUCKET}/ocr-output/`,
          },
        },
      },
    ],
  });

  const [response] = await operation.promise();
  // Process response from GCS...

  return [];
}
```

## AWS Textract OCR

```typescript
// lib/ocr/textract.ts
import { TextractClient, AnalyzeDocumentCommand, DetectDocumentTextCommand } from "@aws-sdk/client-textract";

const textract = new TextractClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export interface TextractResult {
  text: string;
  lines: {
    text: string;
    confidence: number;
    boundingBox: {
      width: number;
      height: number;
      left: number;
      top: number;
    };
  }[];
  keyValuePairs?: { key: string; value: string }[];
  tables?: string[][];
}

export async function detectDocumentText(
  imageBuffer: Buffer
): Promise<TextractResult> {
  const command = new DetectDocumentTextCommand({
    Document: { Bytes: imageBuffer },
  });

  const response = await textract.send(command);

  const lines = response.Blocks?.filter((b) => b.BlockType === "LINE").map((block) => ({
    text: block.Text || "",
    confidence: block.Confidence || 0,
    boundingBox: block.Geometry?.BoundingBox || { width: 0, height: 0, left: 0, top: 0 },
  })) || [];

  return {
    text: lines.map((l) => l.text).join("\n"),
    lines,
  };
}

export async function analyzeDocument(
  imageBuffer: Buffer
): Promise<TextractResult> {
  const command = new AnalyzeDocumentCommand({
    Document: { Bytes: imageBuffer },
    FeatureTypes: ["FORMS", "TABLES"],
  });

  const response = await textract.send(command);

  // Extract key-value pairs
  const keyValuePairs: { key: string; value: string }[] = [];
  const keyBlocks = response.Blocks?.filter((b) => b.BlockType === "KEY_VALUE_SET" && b.EntityTypes?.includes("KEY")) || [];

  for (const keyBlock of keyBlocks) {
    const keyText = getBlockText(keyBlock, response.Blocks || []);
    const valueId = keyBlock.Relationships?.find((r) => r.Type === "VALUE")?.Ids?.[0];
    const valueBlock = response.Blocks?.find((b) => b.Id === valueId);
    const valueText = valueBlock ? getBlockText(valueBlock, response.Blocks || []) : "";

    if (keyText) {
      keyValuePairs.push({ key: keyText, value: valueText });
    }
  }

  // Extract tables
  const tables: string[][] = [];
  // Table extraction logic...

  const lines = response.Blocks?.filter((b) => b.BlockType === "LINE").map((block) => ({
    text: block.Text || "",
    confidence: block.Confidence || 0,
    boundingBox: block.Geometry?.BoundingBox || { width: 0, height: 0, left: 0, top: 0 },
  })) || [];

  return {
    text: lines.map((l) => l.text).join("\n"),
    lines,
    keyValuePairs,
    tables,
  };
}

function getBlockText(block: any, allBlocks: any[]): string {
  const childIds = block.Relationships?.find((r: any) => r.Type === "CHILD")?.Ids || [];
  return childIds
    .map((id: string) => allBlocks.find((b) => b.Id === id)?.Text || "")
    .join(" ");
}
```

## OCR API Route

```typescript
// app/api/ocr/route.ts
import { NextRequest, NextResponse } from "next/server";
import { extractTextWithVision } from "@/lib/ocr/google-vision";
import { auth } from "@/auth";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  // Validate file type
  const allowedTypes = ["image/png", "image/jpeg", "image/webp", "application/pdf"];
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await extractTextWithVision(buffer);

    return NextResponse.json(result);
  } catch (error) {
    console.error("OCR error:", error);
    return NextResponse.json({ error: "OCR processing failed" }, { status: 500 });
  }
}
```

## OCR Scanner Component

```typescript
// components/ocr/document-scanner.tsx
"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { extractTextFromImage, type OCRResult } from "@/lib/ocr/tesseract";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Upload, FileText, Copy, Check, Loader2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

export function DocumentScanner() {
  const [image, setImage] = useState<string | null>(null);
  const [result, setResult] = useState<OCRResult | null>(null);
  const [progress, setProgress] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [copied, setCopied] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    // Preview image
    const reader = new FileReader();
    reader.onload = (e) => setImage(e.target?.result as string);
    reader.readAsDataURL(file);

    // Process OCR
    setProcessing(true);
    setProgress(0);
    setResult(null);

    try {
      const ocrResult = await extractTextFromImage(file, "eng", setProgress);
      setResult(ocrResult);
    } catch (error) {
      console.error("OCR failed:", error);
    } finally {
      setProcessing(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".webp"],
    },
    maxFiles: 1,
  });

  const handleCopy = () => {
    if (result?.text) {
      navigator.clipboard.writeText(result.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleServerOCR = async () => {
    if (!image) return;

    setProcessing(true);
    setProgress(0);

    try {
      // Convert data URL to blob
      const response = await fetch(image);
      const blob = await response.blob();

      const formData = new FormData();
      formData.append("file", blob);

      const res = await fetch("/api/ocr", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      setResult({ text: data.text, confidence: 95, words: [] });
    } catch (error) {
      console.error("Server OCR failed:", error);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Upload area */}
      <div>
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
            transition-colors
            ${isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25"}
          `}
        >
          <input {...getInputProps()} />
          <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">
            {isDragActive
              ? "Drop the image here..."
              : "Drag & drop an image, or click to select"}
          </p>
        </div>

        {image && (
          <div className="mt-4">
            <img
              src={image}
              alt="Uploaded document"
              className="rounded-lg border max-h-64 mx-auto"
            />
          </div>
        )}

        {processing && (
          <div className="mt-4 space-y-2">
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Processing...</span>
            </div>
            <Progress value={progress} />
          </div>
        )}
      </div>

      {/* Results */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Extracted Text
          </h3>
          {result && (
            <Button variant="ghost" size="sm" onClick={handleCopy}>
              {copied ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>

        <Textarea
          value={result?.text || ""}
          readOnly
          placeholder="Extracted text will appear here..."
          className="min-h-[200px] font-mono text-sm"
        />

        {result && (
          <p className="text-xs text-muted-foreground mt-2">
            Confidence: {result.confidence.toFixed(1)}%
          </p>
        )}

        {image && !processing && (
          <Button
            variant="outline"
            className="w-full mt-4"
            onClick={handleServerOCR}
          >
            Use Cloud OCR (Higher Accuracy)
          </Button>
        )}
      </Card>
    </div>
  );
}
```

## Anti-patterns

### Don't Process Large Images Client-Side

```typescript
// BAD - Large image on client
await extractTextFromImage(largeImage); // Slow, may crash

// GOOD - Resize or use server
const resized = await resizeImage(largeImage, { maxWidth: 2000 });
await extractTextFromImage(resized);
// Or send to server for cloud OCR
```

## Related Patterns

- [file-preview](./file-preview.md)
- [embeddings](./embeddings.md)
- [search](./search.md)

---

## Changelog

### 1.0.0 (2025-01-18)
- Initial implementation
- Tesseract.js client-side OCR
- Google Vision integration
- AWS Textract integration
- Scanner component
