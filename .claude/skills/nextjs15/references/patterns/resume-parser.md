---
id: pt-resume-parser
name: Resume Parser
version: 1.0.0
layer: L5
category: features
description: Parse and extract structured data from resume/CV documents
tags: [features, parsing, documents, ai, next15, react19]
composes:
  - ../atoms/input-file.md
dependencies: []
formula: "ResumeParser = FileUpload + PDFExtraction + AIStructuring + DataValidation"
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# Resume Parser

## Overview

Resume parsing extracts structured data from CV documents (PDF, DOCX) using text extraction and AI. This pattern covers file upload, text extraction, and intelligent data structuring.

## When to Use

- Job application systems
- HR management platforms
- Recruitment tools
- LinkedIn-style profile imports
- Talent management systems

## Resume Schema

```typescript
// lib/resume/types.ts
import { z } from 'zod';

export const contactInfoSchema = z.object({
  name: z.string(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  location: z.string().optional(),
  linkedin: z.string().url().optional(),
  github: z.string().url().optional(),
  website: z.string().url().optional(),
});

export const experienceSchema = z.object({
  company: z.string(),
  title: z.string(),
  location: z.string().optional(),
  startDate: z.string(),
  endDate: z.string().optional(),
  current: z.boolean().default(false),
  description: z.string().optional(),
  highlights: z.array(z.string()).default([]),
});

export const educationSchema = z.object({
  institution: z.string(),
  degree: z.string(),
  field: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  gpa: z.string().optional(),
  honors: z.array(z.string()).default([]),
});

export const resumeSchema = z.object({
  contact: contactInfoSchema,
  summary: z.string().optional(),
  experience: z.array(experienceSchema).default([]),
  education: z.array(educationSchema).default([]),
  skills: z.array(z.string()).default([]),
  certifications: z.array(z.string()).default([]),
  languages: z.array(z.object({
    language: z.string(),
    proficiency: z.string().optional(),
  })).default([]),
});

export type Resume = z.infer<typeof resumeSchema>;
export type Experience = z.infer<typeof experienceSchema>;
export type Education = z.infer<typeof educationSchema>;
```

## File Upload API

```typescript
// app/api/resume/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { extractText } from '@/lib/resume/extractor';
import { parseResume } from '@/lib/resume/parser';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload PDF or DOCX.' },
        { status: 400 }
      );
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 5MB.' },
        { status: 400 }
      );
    }

    // Extract text from file
    const buffer = Buffer.from(await file.arrayBuffer());
    const text = await extractText(buffer, file.type);

    // Parse resume using AI
    const resumeData = await parseResume(text);

    // Save to database
    const resume = await prisma.resume.create({
      data: {
        userId: session.user.id,
        originalFileName: file.name,
        rawText: text,
        parsedData: resumeData as any,
      },
    });

    return NextResponse.json({
      id: resume.id,
      data: resumeData,
    });
  } catch (error) {
    console.error('Resume upload error:', error);
    return NextResponse.json(
      { error: 'Failed to process resume' },
      { status: 500 }
    );
  }
}
```

## Text Extraction

```typescript
// lib/resume/extractor.ts
import pdf from 'pdf-parse';
import mammoth from 'mammoth';

export async function extractText(buffer: Buffer, mimeType: string): Promise<string> {
  switch (mimeType) {
    case 'application/pdf':
      return extractPdfText(buffer);
    case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
      return extractDocxText(buffer);
    default:
      throw new Error(`Unsupported file type: ${mimeType}`);
  }
}

async function extractPdfText(buffer: Buffer): Promise<string> {
  const data = await pdf(buffer);
  return data.text;
}

async function extractDocxText(buffer: Buffer): Promise<string> {
  const result = await mammoth.extractRawText({ buffer });
  return result.value;
}
```

## AI-Powered Parser

```typescript
// lib/resume/parser.ts
import OpenAI from 'openai';
import { resumeSchema, type Resume } from './types';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function parseResume(text: string): Promise<Resume> {
  const systemPrompt = `You are a resume parser. Extract structured data from the resume text.

Return a JSON object with this structure:
{
  "contact": {
    "name": "Full Name",
    "email": "email@example.com",
    "phone": "123-456-7890",
    "location": "City, State",
    "linkedin": "https://linkedin.com/in/...",
    "github": "https://github.com/...",
    "website": "https://..."
  },
  "summary": "Professional summary if present",
  "experience": [
    {
      "company": "Company Name",
      "title": "Job Title",
      "location": "City, State",
      "startDate": "Jan 2020",
      "endDate": "Present",
      "current": true,
      "description": "Brief description",
      "highlights": ["Achievement 1", "Achievement 2"]
    }
  ],
  "education": [
    {
      "institution": "University Name",
      "degree": "Bachelor of Science",
      "field": "Computer Science",
      "startDate": "2014",
      "endDate": "2018",
      "gpa": "3.8",
      "honors": ["Cum Laude"]
    }
  ],
  "skills": ["Skill 1", "Skill 2"],
  "certifications": ["AWS Certified", "PMP"],
  "languages": [
    { "language": "English", "proficiency": "Native" },
    { "language": "Spanish", "proficiency": "Intermediate" }
  ]
}

Only include fields that are present in the resume. Use null for missing optional fields.`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Parse this resume:\n\n${text}` },
    ],
    temperature: 0,
    response_format: { type: 'json_object' },
  });

  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error('No response from AI');

  const parsed = JSON.parse(content);
  return resumeSchema.parse(parsed);
}
```

## Resume Upload Component

```typescript
// components/resume-uploader.tsx
'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Upload, FileText, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import type { Resume } from '@/lib/resume/types';

interface ResumeUploaderProps {
  onSuccess: (resume: Resume) => void;
}

export function ResumeUploader({ onSuccess }: ResumeUploaderProps) {
  const [status, setStatus] = useState<'idle' | 'uploading' | 'parsing' | 'success' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setStatus('uploading');
    setProgress(0);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      setProgress(30);
      setStatus('parsing');

      const response = await fetch('/api/resume/upload', {
        method: 'POST',
        body: formData,
      });

      setProgress(70);

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Upload failed');
      }

      const { data } = await response.json();
      setProgress(100);
      setStatus('success');
      onSuccess(data);
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Upload failed');
    }
  }, [onSuccess]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024,
  });

  return (
    <Card>
      <CardContent className="pt-6">
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
          }`}
        >
          <input {...getInputProps()} />

          {status === 'idle' && (
            <>
              <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg font-medium">
                {isDragActive ? 'Drop your resume here' : 'Upload your resume'}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                PDF or DOCX, max 5MB
              </p>
            </>
          )}

          {(status === 'uploading' || status === 'parsing') && (
            <>
              <Loader2 className="h-12 w-12 mx-auto mb-4 animate-spin text-primary" />
              <p className="text-lg font-medium">
                {status === 'uploading' ? 'Uploading...' : 'Parsing resume...'}
              </p>
              <Progress value={progress} className="mt-4 w-48 mx-auto" />
            </>
          )}

          {status === 'success' && (
            <>
              <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
              <p className="text-lg font-medium text-green-600">
                Resume parsed successfully!
              </p>
            </>
          )}

          {status === 'error' && (
            <>
              <AlertCircle className="h-12 w-12 mx-auto mb-4 text-destructive" />
              <p className="text-lg font-medium text-destructive">{error}</p>
              <Button variant="outline" className="mt-4" onClick={() => setStatus('idle')}>
                Try Again
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
```

## Parsed Resume Display

```typescript
// components/resume-preview.tsx
import type { Resume } from '@/lib/resume/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ResumePreviewProps {
  resume: Resume;
}

export function ResumePreview({ resume }: ResumePreviewProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{resume.contact.name}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {resume.contact.email && <p>{resume.contact.email}</p>}
          {resume.contact.phone && <p>{resume.contact.phone}</p>}
          {resume.contact.location && <p>{resume.contact.location}</p>}
        </CardContent>
      </Card>

      {resume.summary && (
        <Card>
          <CardHeader><CardTitle>Summary</CardTitle></CardHeader>
          <CardContent><p>{resume.summary}</p></CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle>Skills</CardTitle></CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {resume.skills.map((skill, i) => (
            <Badge key={i} variant="secondary">{skill}</Badge>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
```

## Anti-patterns

### Don't Parse Directly in Route Handler

```typescript
// BAD - Blocking route with heavy parsing
export async function POST(req) {
  const text = await extractText(file); // Heavy operation
  return NextResponse.json(parseResume(text));
}

// GOOD - Queue for background processing
export async function POST(req) {
  await queue.add('parse-resume', { fileId });
  return NextResponse.json({ status: 'processing' });
}
```

## Related Skills

- [file-upload](./file-upload.md)
- [prompt-engineering](./prompt-engineering.md)

---

## Changelog

### 1.0.0 (2025-01-18)
- Initial implementation
- PDF/DOCX extraction
- AI-powered parsing
- Upload component
