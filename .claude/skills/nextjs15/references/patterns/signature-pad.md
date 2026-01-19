---
id: pt-signature-pad
name: Signature Pad
version: 2.0.0
layer: L5
category: forms
description: Digital signature capture component using HTML Canvas with touch and mouse support
tags: [forms, signature, canvas, touch, drawing, esignature]
composes:
  - ../molecules/form-field.md
  - ../atoms/input-button.md
  - ../atoms/display-icon.md
  - ../atoms/display-text.md
formula: "SignaturePad = signature_pad(canvas) + ToolbarButtons(a-input-button) + Icons(a-display-icon) + Controller(react-hook-form)"
dependencies:
  - react
  - signature_pad
performance:
  impact: low
  lcp: low
  cls: neutral
accessibility:
  wcag: AA
  keyboard: true
  screen-reader: true
---

# Signature Pad

## Overview

A digital signature capture component built on HTML Canvas. Supports mouse, touch, and stylus input with pressure sensitivity. Exports signatures as PNG, SVG, or base64 data URLs. Ideal for contracts, forms, and any document requiring electronic signatures.

## When to Use

Use this skill when:
- Building contract or agreement signing flows
- Creating electronic document workflows
- Need to capture user signatures for forms
- Building delivery confirmation systems
- Implementing consent capture mechanisms

## Composition Diagram

```
+----------------------------------------------------------------------+
|                       Signature Pad Pattern                           |
+----------------------------------------------------------------------+
|                                                                      |
|  +----------------------------------------------------------------+  |
|  |              SignaturePad Component                             |  |
|  |  +------------------------------------------------------------+|  |
|  |  |              Canvas Container (border, rounded)             ||  |
|  |  |  +--------------------------------------------------------+||  |
|  |  |  | HTML Canvas                                             |||  |
|  |  |  | - signature_pad library handles drawing                 |||  |
|  |  |  | - touch-none for mobile                                 |||  |
|  |  |  | - Device pixel ratio scaling for crisp lines            |||  |
|  |  |  +--------------------------------------------------------+||  |
|  |  |                                                             ||  |
|  |  |  +--------------------------------------------------------+||  |
|  |  |  | Placeholder (when empty)                                |||  |
|  |  |  | Text (a-display-text): "Sign here"                      |||  |
|  |  |  +--------------------------------------------------------+||  |
|  |  |                                                             ||  |
|  |  |  +--------------------------------------------------------+||  |
|  |  |  | Signature Line (visual guide)                           |||  |
|  |  |  | X ----------------------------------------              |||  |
|  |  |  +--------------------------------------------------------+||  |
|  |  +------------------------------------------------------------+|  |
|  +----------------------------------------------------------------+  |
|                                |                                     |
|                                v                                     |
|  +----------------------------------------------------------------+  |
|  |              Toolbar (when showToolbar=true)                    |  |
|  |  +----------+ +----------+ +----------+    +----------------+  |  |
|  |  | Undo     | | Clear    | | Download |    | Signed Status  |  |  |
|  |  | (a-input | | (a-input | | (a-input |    | (a-display-    |  |  |
|  |  | -button) | | -button) | | -button) |    | text + icon)   |  |  |
|  |  | [Undo2]  | | [Eraser] | | [Downld] |    | [Check] Signed |  |  |
|  |  +----------+ +----------+ +----------+    +----------------+  |  |
|  +----------------------------------------------------------------+  |
|                                                                      |
|  SignatureField (react-hook-form integration):                       |
|  - Controller wraps SignaturePad                                     |
|  - field.onChange(dataUrl) on signature end                          |
|  - Validation for required signatures                                |
|                                                                      |
+----------------------------------------------------------------------+
```

## Implementation

```tsx
// components/signature-pad/signature-pad.tsx
'use client';

import * as React from 'react';
import SignaturePadLib from 'signature_pad';
import { Eraser, Undo2, Download, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export interface SignaturePadRef {
  clear: () => void;
  undo: () => void;
  isEmpty: () => boolean;
  toDataURL: (type?: string, encoderOptions?: number) => string;
  toSVG: () => string;
  fromDataURL: (dataUrl: string) => Promise<void>;
  getCanvas: () => HTMLCanvasElement | null;
}

export interface SignaturePadProps {
  /** Callback when signature changes */
  onChange?: (isEmpty: boolean, dataUrl: string | null) => void;
  /** Callback when user finishes signing (on pointer up) */
  onEnd?: (dataUrl: string) => void;
  /** Width of the signature pad */
  width?: number;
  /** Height of the signature pad */
  height?: number;
  /** Pen color */
  penColor?: string;
  /** Background color */
  backgroundColor?: string;
  /** Minimum stroke width */
  minWidth?: number;
  /** Maximum stroke width */
  maxWidth?: number;
  /** Velocity filter weight for pressure simulation */
  velocityFilterWeight?: number;
  /** Dot size for single click */
  dotSize?: number;
  /** Whether the pad is disabled */
  disabled?: boolean;
  /** Show toolbar with clear/undo buttons */
  showToolbar?: boolean;
  /** Placeholder text when empty */
  placeholder?: string;
  /** Custom class name */
  className?: string;
  /** Error state */
  error?: boolean;
  /** Initial signature data URL to load */
  initialValue?: string;
}

export const SignaturePad = React.forwardRef<SignaturePadRef, SignaturePadProps>(
  (
    {
      onChange,
      onEnd,
      width = 500,
      height = 200,
      penColor = '#000000',
      backgroundColor = '#ffffff',
      minWidth = 0.5,
      maxWidth = 2.5,
      velocityFilterWeight = 0.7,
      dotSize,
      disabled = false,
      showToolbar = true,
      placeholder = 'Sign here',
      className,
      error = false,
      initialValue,
    },
    ref
  ) => {
    const canvasRef = React.useRef<HTMLCanvasElement>(null);
    const signaturePadRef = React.useRef<SignaturePadLib | null>(null);
    const [isEmpty, setIsEmpty] = React.useState(true);
    const containerRef = React.useRef<HTMLDivElement>(null);

    // Initialize signature pad
    React.useEffect(() => {
      if (!canvasRef.current) return;

      const canvas = canvasRef.current;
      const ratio = Math.max(window.devicePixelRatio || 1, 1);
      
      // Set canvas size with device pixel ratio for crisp rendering
      canvas.width = width * ratio;
      canvas.height = height * ratio;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.scale(ratio, ratio);
      }

      const signaturePad = new SignaturePadLib(canvas, {
        penColor,
        backgroundColor,
        minWidth,
        maxWidth,
        velocityFilterWeight,
        dotSize: dotSize ?? (minWidth + maxWidth) / 2,
      });

      signaturePad.addEventListener('endStroke', () => {
        const dataUrl = signaturePad.toDataURL();
        const empty = signaturePad.isEmpty();
        setIsEmpty(empty);
        onChange?.(empty, empty ? null : dataUrl);
        onEnd?.(dataUrl);
      });

      signaturePadRef.current = signaturePad;

      // Load initial value if provided
      if (initialValue) {
        signaturePad.fromDataURL(initialValue).then(() => {
          setIsEmpty(signaturePad.isEmpty());
        });
      }

      // Clear background
      signaturePad.clear();

      return () => {
        signaturePad.off();
      };
    }, [width, height]);

    // Update options when props change
    React.useEffect(() => {
      if (signaturePadRef.current) {
        signaturePadRef.current.penColor = penColor;
        signaturePadRef.current.minWidth = minWidth;
        signaturePadRef.current.maxWidth = maxWidth;
        signaturePadRef.current.velocityFilterWeight = velocityFilterWeight;
      }
    }, [penColor, minWidth, maxWidth, velocityFilterWeight]);

    // Handle disabled state
    React.useEffect(() => {
      if (signaturePadRef.current) {
        if (disabled) {
          signaturePadRef.current.off();
        } else {
          signaturePadRef.current.on();
        }
      }
    }, [disabled]);

    // Handle resize
    React.useEffect(() => {
      const handleResize = () => {
        if (!canvasRef.current || !signaturePadRef.current) return;
        
        // Save current signature
        const data = signaturePadRef.current.toData();
        
        // Resize canvas
        const canvas = canvasRef.current;
        const ratio = Math.max(window.devicePixelRatio || 1, 1);
        canvas.width = width * ratio;
        canvas.height = height * ratio;
        
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.scale(ratio, ratio);
        }
        
        // Restore signature
        signaturePadRef.current.clear();
        if (data.length > 0) {
          signaturePadRef.current.fromData(data);
        }
      };

      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }, [width, height]);

    // Expose methods via ref
    React.useImperativeHandle(ref, () => ({
      clear: () => {
        signaturePadRef.current?.clear();
        setIsEmpty(true);
        onChange?.(true, null);
      },
      undo: () => {
        const data = signaturePadRef.current?.toData();
        if (data && data.length > 0) {
          data.pop();
          signaturePadRef.current?.fromData(data);
          const empty = signaturePadRef.current?.isEmpty() ?? true;
          setIsEmpty(empty);
          onChange?.(empty, empty ? null : signaturePadRef.current?.toDataURL() ?? null);
        }
      },
      isEmpty: () => signaturePadRef.current?.isEmpty() ?? true,
      toDataURL: (type?: string, encoderOptions?: number) => {
        return signaturePadRef.current?.toDataURL(type, encoderOptions) ?? '';
      },
      toSVG: () => {
        return signaturePadRef.current?.toSVG() ?? '';
      },
      fromDataURL: async (dataUrl: string) => {
        await signaturePadRef.current?.fromDataURL(dataUrl);
        setIsEmpty(signaturePadRef.current?.isEmpty() ?? true);
      },
      getCanvas: () => canvasRef.current,
    }));

    const handleClear = () => {
      signaturePadRef.current?.clear();
      setIsEmpty(true);
      onChange?.(true, null);
    };

    const handleUndo = () => {
      const data = signaturePadRef.current?.toData();
      if (data && data.length > 0) {
        data.pop();
        signaturePadRef.current?.fromData(data);
        const empty = signaturePadRef.current?.isEmpty() ?? true;
        setIsEmpty(empty);
        onChange?.(empty, empty ? null : signaturePadRef.current?.toDataURL() ?? null);
      }
    };

    const handleDownload = () => {
      if (signaturePadRef.current?.isEmpty()) return;
      
      const dataUrl = signaturePadRef.current?.toDataURL('image/png');
      if (dataUrl) {
        const link = document.createElement('a');
        link.download = `signature-${Date.now()}.png`;
        link.href = dataUrl;
        link.click();
      }
    };

    return (
      <div
        ref={containerRef}
        className={cn('inline-block', className)}
        role="application"
        aria-label="Signature pad"
      >
        <div
          className={cn(
            'relative border rounded-lg overflow-hidden',
            error ? 'border-destructive' : 'border-input',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        >
          <canvas
            ref={canvasRef}
            className={cn(
              'touch-none',
              disabled ? 'cursor-not-allowed' : 'cursor-crosshair'
            )}
            aria-label="Signature drawing area"
          />
          
          {/* Placeholder */}
          {isEmpty && !disabled && (
            <div
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
              aria-hidden="true"
            >
              <span className="text-muted-foreground text-sm">{placeholder}</span>
            </div>
          )}
          
          {/* Signature line */}
          <div
            className="absolute bottom-8 left-4 right-4 border-b border-dashed border-muted-foreground/30"
            aria-hidden="true"
          />
          <div
            className="absolute bottom-2 left-4 text-xs text-muted-foreground"
            aria-hidden="true"
          >
            X
          </div>
        </div>
        
        {showToolbar && (
          <div className="flex items-center gap-2 mt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleUndo}
              disabled={disabled || isEmpty}
              aria-label="Undo last stroke"
            >
              <Undo2 className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleClear}
              disabled={disabled || isEmpty}
              aria-label="Clear signature"
            >
              <Eraser className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleDownload}
              disabled={disabled || isEmpty}
              aria-label="Download signature"
            >
              <Download className="h-4 w-4" />
            </Button>
            {!isEmpty && (
              <div className="flex items-center gap-1 ml-auto text-sm text-green-600">
                <Check className="h-4 w-4" />
                <span>Signed</span>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
);

SignaturePad.displayName = 'SignaturePad';
```

```tsx
// components/signature-pad/signature-field.tsx
'use client';

import * as React from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { SignaturePad, SignaturePadRef } from './signature-pad';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface SignatureFieldProps {
  name: string;
  label?: string;
  description?: string;
  required?: boolean;
  disabled?: boolean;
  width?: number;
  height?: number;
  className?: string;
}

export function SignatureField({
  name,
  label,
  description,
  required = false,
  disabled = false,
  width = 500,
  height = 200,
  className,
}: SignatureFieldProps) {
  const { control, formState: { errors } } = useFormContext();
  const signaturePadRef = React.useRef<SignaturePadRef>(null);
  const error = errors[name]?.message as string | undefined;

  return (
    <Controller
      name={name}
      control={control}
      rules={{
        validate: (value) => {
          if (required && (!value || signaturePadRef.current?.isEmpty())) {
            return 'Signature is required';
          }
          return true;
        },
      }}
      render={({ field }) => (
        <div className={cn('space-y-2', className)}>
          {label && (
            <Label>
              {label}
              {required && <span className="text-destructive ml-1">*</span>}
            </Label>
          )}
          
          <SignaturePad
            ref={signaturePadRef}
            width={width}
            height={height}
            disabled={disabled}
            error={!!error}
            initialValue={field.value}
            onChange={(isEmpty, dataUrl) => {
              field.onChange(isEmpty ? null : dataUrl);
            }}
          />
          
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
          
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
        </div>
      )}
    />
  );
}
```

### Key Implementation Notes

1. **Device Pixel Ratio**: Canvas is scaled for retina displays to ensure crisp signatures
2. **Touch Support**: Built-in support for touch, stylus, and mouse input with pressure sensitivity simulation

## Variants

### Responsive Signature Pad

```tsx
'use client';

import * as React from 'react';
import { SignaturePad, SignaturePadRef } from './signature-pad';

export function ResponsiveSignaturePad() {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const signaturePadRef = React.useRef<SignaturePadRef>(null);
  const [dimensions, setDimensions] = React.useState({ width: 500, height: 200 });

  React.useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const width = containerRef.current.offsetWidth;
        const height = Math.min(200, width * 0.4); // Maintain aspect ratio
        setDimensions({ width, height });
      }
    };

    updateDimensions();
    
    const observer = new ResizeObserver(updateDimensions);
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="w-full">
      <SignaturePad
        ref={signaturePadRef}
        width={dimensions.width}
        height={dimensions.height}
      />
    </div>
  );
}
```

### Signature with Typed Name

```tsx
'use client';

import * as React from 'react';
import { SignaturePad, SignaturePadRef } from './signature-pad';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface SignatureWithNameProps {
  onComplete: (data: { type: 'drawn' | 'typed'; value: string }) => void;
}

export function SignatureWithName({ onComplete }: SignatureWithNameProps) {
  const signaturePadRef = React.useRef<SignaturePadRef>(null);
  const [typedName, setTypedName] = React.useState('');
  const [activeTab, setActiveTab] = React.useState<'draw' | 'type'>('draw');

  const handleSubmit = () => {
    if (activeTab === 'draw') {
      const dataUrl = signaturePadRef.current?.toDataURL();
      if (dataUrl && !signaturePadRef.current?.isEmpty()) {
        onComplete({ type: 'drawn', value: dataUrl });
      }
    } else {
      if (typedName.trim()) {
        onComplete({ type: 'typed', value: typedName });
      }
    }
  };

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'draw' | 'type')}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="draw">Draw Signature</TabsTrigger>
          <TabsTrigger value="type">Type Signature</TabsTrigger>
        </TabsList>
        
        <TabsContent value="draw" className="mt-4">
          <SignaturePad ref={signaturePadRef} />
        </TabsContent>
        
        <TabsContent value="type" className="mt-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="typed-signature">Type your full name</Label>
            <Input
              id="typed-signature"
              value={typedName}
              onChange={(e) => setTypedName(e.target.value)}
              placeholder="John Doe"
              className="text-2xl h-14"
              style={{ fontFamily: 'cursive' }}
            />
          </div>
          
          {typedName && (
            <div className="p-4 border rounded-lg bg-white">
              <p
                className="text-3xl text-center"
                style={{ fontFamily: "'Dancing Script', cursive" }}
              >
                {typedName}
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

### Multi-Signature Document

```tsx
'use client';

import * as React from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { SignatureField } from './signature-field';
import { Button } from '@/components/ui/button';

interface ContractSignatures {
  clientSignature: string | null;
  witnessSignature: string | null;
  date: string;
}

export function ContractSigningForm() {
  const form = useForm<ContractSignatures>({
    defaultValues: {
      clientSignature: null,
      witnessSignature: null,
      date: new Date().toISOString().split('T')[0],
    },
  });

  const onSubmit = async (data: ContractSignatures) => {
    // Upload signatures to server
    const response = await fetch('/api/contracts/sign', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...data,
        signedAt: new Date().toISOString(),
      }),
    });

    if (response.ok) {
      alert('Contract signed successfully!');
    }
  };

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="prose max-w-none">
          <h2>Service Agreement</h2>
          <p>
            By signing below, I agree to the terms and conditions outlined
            in this service agreement...
          </p>
        </div>

        <SignatureField
          name="clientSignature"
          label="Client Signature"
          description="Please sign using your mouse or touch screen"
          required
        />

        <SignatureField
          name="witnessSignature"
          label="Witness Signature"
          description="Optional witness signature"
        />

        <Button type="submit" className="w-full">
          Complete Signing
        </Button>
      </form>
    </FormProvider>
  );
}
```

## Server Integration

```typescript
// app/api/signatures/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { auth } from '@/lib/auth';

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { signature, documentId } = await request.json();

  if (!signature || !signature.startsWith('data:image/')) {
    return NextResponse.json({ error: 'Invalid signature data' }, { status: 400 });
  }

  // Convert base64 to buffer
  const base64Data = signature.replace(/^data:image\/\w+;base64,/, '');
  const buffer = Buffer.from(base64Data, 'base64');

  // Upload to blob storage
  const blob = await put(
    `signatures/${session.user.id}/${documentId}-${Date.now()}.png`,
    buffer,
    {
      access: 'private',
      contentType: 'image/png',
    }
  );

  // Store reference in database
  await prisma.signature.create({
    data: {
      userId: session.user.id,
      documentId,
      blobUrl: blob.url,
      signedAt: new Date(),
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
    },
  });

  return NextResponse.json({
    success: true,
    signatureId: blob.url,
  });
}
```

## Anti-patterns

### Not Handling Canvas Resize

```tsx
// Bad - Fixed size canvas breaks on mobile
<SignaturePad width={600} height={300} />

// Good - Responsive sizing
function ResponsiveSignature() {
  const [width, setWidth] = useState(500);
  
  useEffect(() => {
    const handleResize = () => {
      setWidth(Math.min(500, window.innerWidth - 32));
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return <SignaturePad width={width} height={width * 0.4} />;
}
```

### Storing Signatures Insecurely

```tsx
// Bad - Storing signature in localStorage
localStorage.setItem('signature', signaturePad.toDataURL());

// Good - Upload to secure storage with audit trail
async function saveSignature(dataUrl: string) {
  await fetch('/api/signatures/upload', {
    method: 'POST',
    body: JSON.stringify({
      signature: dataUrl,
      documentId,
      timestamp: Date.now(),
    }),
  });
}
```

## Dependencies

```json
{
  "dependencies": {
    "signature_pad": "^5.0.0"
  }
}
```

### Installation

```bash
npm install signature_pad
```

## Related Skills

### Composes From
- [canvas](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API) - HTML Canvas API
- [touch-events](https://developer.mozilla.org/en-US/docs/Web/API/Touch_events) - Touch handling

### Composes Into
- [multi-step-form](../organisms/multi-step-form.md) - Form wizard with signature step
- [contract-signing](../templates/contract-signing.md) - Document signing workflow

### Alternatives
- [react-signature-canvas](https://www.npmjs.com/package/react-signature-canvas) - Alternative React wrapper

---

## Changelog

### 2.0.0 (2025-01-18)
- Standardized to atomic design system v2
- Updated frontmatter schema

### 1.0.0 (2025-01-17)
- Initial implementation with signature_pad
- Touch and mouse support
- Form integration with react-hook-form
