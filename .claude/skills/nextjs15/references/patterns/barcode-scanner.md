---
id: pt-barcode-scanner
name: Barcode Scanner
version: 2.0.0
layer: L5
category: browser
description: Scan barcodes and QR codes using camera or file upload
tags: [barcode, qr-code, scanner, camera, zxing, detection]
composes:
  - ../organisms/dialog.md
  - ../atoms/input-button.md
dependencies: []
formula: Camera API + ZXing/BarcodeDetector + Image Processing = Barcode Scanning
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

## When to Use

- Scanning product barcodes (EAN, UPC)
- Reading QR codes for payments or links
- Inventory management systems
- Event ticket validation
- Mobile scanning applications

## Composition Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ Barcode Scanner Architecture                                │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Input Sources                                       │   │
│  │                                                     │   │
│  │ ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │   │
│  │ │ Camera      │  │ File Upload │  │ Image URL   │ │   │
│  │ │ Stream      │  │             │  │             │ │   │
│  │ └─────────────┘  └─────────────┘  └─────────────┘ │   │
│  └─────────────────────┬───────────────────────────────┘   │
│                        │                                    │
│                        ▼                                    │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Detection Engine                                    │   │
│  │                                                     │   │
│  │ Option 1: BarcodeDetector API (Chrome)              │   │
│  │ Option 2: @zxing/library (cross-browser)            │   │
│  │                                                     │   │
│  │ Supported formats:                                  │   │
│  │ QR, EAN-13, EAN-8, UPC-A, UPC-E, Code-128, etc.    │   │
│  └─────────────────────┬───────────────────────────────┘   │
│                        │                                    │
│                        ▼                                    │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Result: { format, rawValue, boundingBox }           │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

# Barcode Scanner

## Overview

Scan barcodes and QR codes using the device camera or file upload. Supports multiple barcode formats including QR, EAN, UPC, Code128, and more.

## Implementation

### Scanner Types

```tsx
// lib/scanner/types.ts
export type BarcodeFormat =
  | 'QR_CODE'
  | 'DATA_MATRIX'
  | 'AZTEC'
  | 'PDF_417'
  | 'EAN_13'
  | 'EAN_8'
  | 'UPC_A'
  | 'UPC_E'
  | 'CODE_39'
  | 'CODE_93'
  | 'CODE_128'
  | 'ITF'
  | 'CODABAR';

export interface ScanResult {
  text: string;
  format: BarcodeFormat;
  rawBytes?: Uint8Array;
  timestamp: Date;
}

export interface ScannerOptions {
  formats?: BarcodeFormat[];
  facingMode?: 'environment' | 'user';
  torch?: boolean;
  zoom?: number;
}

export interface ScannerState {
  isScanning: boolean;
  isSupported: boolean;
  hasPermission: boolean | null;
  error: string | null;
  lastResult: ScanResult | null;
}
```

### Barcode Scanner Hook

```tsx
// hooks/use-barcode-scanner.ts
'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { BrowserMultiFormatReader, DecodeHintType, BarcodeFormat as ZXingFormat } from '@zxing/library';
import { ScanResult, ScannerOptions, ScannerState, BarcodeFormat } from '@/lib/scanner/types';

interface UseBarcodeScanner {
  options?: ScannerOptions;
  onScan?: (result: ScanResult) => void;
  onError?: (error: Error) => void;
  continuous?: boolean;
  debounceMs?: number;
}

const FORMAT_MAP: Record<BarcodeFormat, ZXingFormat> = {
  QR_CODE: ZXingFormat.QR_CODE,
  DATA_MATRIX: ZXingFormat.DATA_MATRIX,
  AZTEC: ZXingFormat.AZTEC,
  PDF_417: ZXingFormat.PDF_417,
  EAN_13: ZXingFormat.EAN_13,
  EAN_8: ZXingFormat.EAN_8,
  UPC_A: ZXingFormat.UPC_A,
  UPC_E: ZXingFormat.UPC_E,
  CODE_39: ZXingFormat.CODE_39,
  CODE_93: ZXingFormat.CODE_93,
  CODE_128: ZXingFormat.CODE_128,
  ITF: ZXingFormat.ITF,
  CODABAR: ZXingFormat.CODABAR,
};

export function useBarcodeScanner({
  options = {},
  onScan,
  onError,
  continuous = true,
  debounceMs = 500,
}: UseBarcodeScanner = {}) {
  const [state, setState] = useState<ScannerState>({
    isScanning: false,
    isSupported: false,
    hasPermission: null,
    error: null,
    lastResult: null,
  });

  const readerRef = useRef<BrowserMultiFormatReader | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const lastScanRef = useRef<number>(0);

  // Check browser support
  useEffect(() => {
    const isSupported =
      typeof window !== 'undefined' &&
      'mediaDevices' in navigator &&
      'getUserMedia' in navigator.mediaDevices;

    setState((prev) => ({ ...prev, isSupported }));
  }, []);

  // Initialize reader
  useEffect(() => {
    const hints = new Map();
    
    if (options.formats?.length) {
      hints.set(
        DecodeHintType.POSSIBLE_FORMATS,
        options.formats.map((f) => FORMAT_MAP[f])
      );
    }

    readerRef.current = new BrowserMultiFormatReader(hints);

    return () => {
      readerRef.current?.reset();
    };
  }, [options.formats]);

  const handleResult = useCallback(
    (text: string, format: ZXingFormat) => {
      const now = Date.now();
      
      // Debounce repeated scans
      if (now - lastScanRef.current < debounceMs) {
        return;
      }
      lastScanRef.current = now;

      const formatName = Object.entries(FORMAT_MAP).find(
        ([, v]) => v === format
      )?.[0] as BarcodeFormat;

      const result: ScanResult = {
        text,
        format: formatName,
        timestamp: new Date(),
      };

      setState((prev) => ({ ...prev, lastResult: result }));
      onScan?.(result);
    },
    [onScan, debounceMs]
  );

  const startScanning = useCallback(
    async (videoElement: HTMLVideoElement) => {
      if (!readerRef.current || !state.isSupported) {
        onError?.(new Error('Scanner not supported'));
        return;
      }

      videoRef.current = videoElement;

      try {
        // Request camera permission
        const constraints: MediaStreamConstraints = {
          video: {
            facingMode: options.facingMode || 'environment',
          },
        };

        setState((prev) => ({ ...prev, hasPermission: true, error: null }));

        await readerRef.current.decodeFromConstraints(
          constraints,
          videoElement,
          (result, error) => {
            if (result) {
              handleResult(result.getText(), result.getBarcodeFormat());
              
              if (!continuous) {
                stopScanning();
              }
            }
            // Ignore errors during continuous scanning
          }
        );

        setState((prev) => ({ ...prev, isScanning: true }));
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Failed to start scanner';
        
        if (message.includes('Permission denied')) {
          setState((prev) => ({ ...prev, hasPermission: false }));
        }
        
        setState((prev) => ({ ...prev, error: message }));
        onError?.(error instanceof Error ? error : new Error(message));
      }
    },
    [state.isSupported, options.facingMode, continuous, handleResult, onError]
  );

  const stopScanning = useCallback(() => {
    readerRef.current?.reset();
    setState((prev) => ({ ...prev, isScanning: false }));
  }, []);

  const scanFromFile = useCallback(
    async (file: File): Promise<ScanResult | null> => {
      if (!readerRef.current) {
        onError?.(new Error('Scanner not initialized'));
        return null;
      }

      try {
        const imageUrl = URL.createObjectURL(file);
        const result = await readerRef.current.decodeFromImageUrl(imageUrl);
        URL.revokeObjectURL(imageUrl);

        const formatName = Object.entries(FORMAT_MAP).find(
          ([, v]) => v === result.getBarcodeFormat()
        )?.[0] as BarcodeFormat;

        const scanResult: ScanResult = {
          text: result.getText(),
          format: formatName,
          timestamp: new Date(),
        };

        setState((prev) => ({ ...prev, lastResult: scanResult }));
        onScan?.(scanResult);
        return scanResult;
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Failed to scan image';
        setState((prev) => ({ ...prev, error: message }));
        onError?.(error instanceof Error ? error : new Error(message));
        return null;
      }
    },
    [onScan, onError]
  );

  const requestPermission = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach((track) => track.stop());
      setState((prev) => ({ ...prev, hasPermission: true }));
      return true;
    } catch {
      setState((prev) => ({ ...prev, hasPermission: false }));
      return false;
    }
  }, []);

  return {
    ...state,
    startScanning,
    stopScanning,
    scanFromFile,
    requestPermission,
  };
}
```

### Barcode Scanner Component

```tsx
// components/barcode-scanner.tsx
'use client';

import { useRef, useEffect, useState } from 'react';
import { Camera, CameraOff, Upload, FlashlightOff, Flashlight, RefreshCw } from 'lucide-react';
import { useBarcodeScanner } from '@/hooks/use-barcode-scanner';
import { ScanResult, BarcodeFormat } from '@/lib/scanner/types';

interface BarcodeScannerProps {
  onScan: (result: ScanResult) => void;
  onError?: (error: Error) => void;
  formats?: BarcodeFormat[];
  continuous?: boolean;
  showFileUpload?: boolean;
  className?: string;
}

export function BarcodeScanner({
  onScan,
  onError,
  formats,
  continuous = true,
  showFileUpload = true,
  className = '',
}: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [torchOn, setTorchOn] = useState(false);

  const {
    isScanning,
    isSupported,
    hasPermission,
    error,
    lastResult,
    startScanning,
    stopScanning,
    scanFromFile,
    requestPermission,
  } = useBarcodeScanner({
    options: { formats, facingMode },
    onScan,
    onError,
    continuous,
  });

  // Start scanning when video element is available
  useEffect(() => {
    if (videoRef.current && hasPermission === true && !isScanning) {
      startScanning(videoRef.current);
    }
  }, [hasPermission, isScanning]);

  const handleToggleCamera = () => {
    if (isScanning) {
      stopScanning();
    } else if (videoRef.current) {
      startScanning(videoRef.current);
    }
  };

  const handleSwitchCamera = () => {
    stopScanning();
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await scanFromFile(file);
    }
  };

  if (!isSupported) {
    return (
      <div className={`p-8 text-center bg-gray-100 rounded-lg ${className}`}>
        <CameraOff className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <p className="text-gray-600">
          Camera access is not supported in this browser.
        </p>
        {showFileUpload && (
          <div className="mt-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Upload className="w-4 h-4 inline mr-2" />
              Upload Image
            </button>
          </div>
        )}
      </div>
    );
  }

  if (hasPermission === false) {
    return (
      <div className={`p-8 text-center bg-gray-100 rounded-lg ${className}`}>
        <CameraOff className="w-12 h-12 mx-auto mb-4 text-red-400" />
        <p className="text-gray-600 mb-4">
          Camera permission was denied. Please allow camera access to scan barcodes.
        </p>
        <button
          onClick={requestPermission}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Request Permission
        </button>
      </div>
    );
  }

  if (hasPermission === null) {
    return (
      <div className={`p-8 text-center bg-gray-100 rounded-lg ${className}`}>
        <Camera className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <p className="text-gray-600 mb-4">
          Camera access is required to scan barcodes.
        </p>
        <button
          onClick={requestPermission}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Enable Camera
        </button>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {/* Video Preview */}
      <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          playsInline
          muted
        />

        {/* Scanning overlay */}
        {isScanning && (
          <div className="absolute inset-0 pointer-events-none">
            {/* Corner markers */}
            <div className="absolute top-1/4 left-1/4 w-1/2 h-1/2">
              <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-blue-500 rounded-tl-lg" />
              <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-blue-500 rounded-tr-lg" />
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-blue-500 rounded-bl-lg" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-blue-500 rounded-br-lg" />
            </div>

            {/* Scanning line animation */}
            <div className="absolute top-1/4 left-1/4 w-1/2 h-1/2 overflow-hidden">
              <div className="w-full h-0.5 bg-blue-500 animate-scan" />
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3">
          <button
            onClick={handleToggleCamera}
            className={`p-3 rounded-full ${
              isScanning
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-blue-600 hover:bg-blue-700'
            } text-white shadow-lg`}
          >
            {isScanning ? (
              <CameraOff className="w-6 h-6" />
            ) : (
              <Camera className="w-6 h-6" />
            )}
          </button>

          <button
            onClick={handleSwitchCamera}
            className="p-3 rounded-full bg-white/90 hover:bg-white text-gray-700 shadow-lg"
            title="Switch camera"
          >
            <RefreshCw className="w-5 h-5" />
          </button>

          {showFileUpload && (
            <>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-3 rounded-full bg-white/90 hover:bg-white text-gray-700 shadow-lg"
                title="Upload image"
              >
                <Upload className="w-5 h-5" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Last scan result */}
      {lastResult && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-600 font-medium">Scanned successfully!</p>
          <p className="text-lg font-mono mt-1 break-all">{lastResult.text}</p>
          <p className="text-xs text-green-500 mt-1">Format: {lastResult.format}</p>
        </div>
      )}

      <style jsx>{`
        @keyframes scan {
          0% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(100%);
          }
          100% {
            transform: translateY(0);
          }
        }
        .animate-scan {
          animation: scan 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
```

### Product Lookup Component

```tsx
// components/product-lookup.tsx
'use client';

import { useState } from 'react';
import { BarcodeScanner } from './barcode-scanner';
import { ScanResult } from '@/lib/scanner/types';
import { Loader2, Package, AlertCircle } from 'lucide-react';

interface Product {
  name: string;
  description: string;
  price: number;
  image?: string;
  barcode: string;
}

interface ProductLookupProps {
  onProductFound?: (product: Product) => void;
}

export function ProductLookup({ onProductFound }: ProductLookupProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [product, setProduct] = useState<Product | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleScan = async (result: ScanResult) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/products/lookup?barcode=${result.text}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Product not found');
        }
        throw new Error('Failed to lookup product');
      }

      const productData = await response.json();
      setProduct(productData);
      onProductFound?.(productData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lookup failed');
      setProduct(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-6">
      <BarcodeScanner
        onScan={handleScan}
        formats={['EAN_13', 'EAN_8', 'UPC_A', 'UPC_E', 'QR_CODE']}
      />

      {isLoading && (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <span className="ml-2">Looking up product...</span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      {product && (
        <div className="border rounded-lg overflow-hidden">
          {product.image && (
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-48 object-cover"
            />
          )}
          <div className="p-4">
            <h3 className="text-lg font-semibold">{product.name}</h3>
            <p className="text-gray-600 text-sm mt-1">{product.description}</p>
            <div className="flex justify-between items-center mt-4">
              <span className="text-2xl font-bold text-green-600">
                ${product.price.toFixed(2)}
              </span>
              <span className="text-xs text-gray-400 font-mono">
                {product.barcode}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
```

### Product Lookup API Route

```tsx
// app/api/products/lookup/route.ts
import { NextRequest, NextResponse } from 'next/server';

// Mock product database
const products: Record<string, { name: string; description: string; price: number; image?: string }> = {
  '5901234123457': {
    name: 'Premium Coffee Beans',
    description: 'Single origin arabica coffee beans, 500g',
    price: 14.99,
    image: '/products/coffee.jpg',
  },
  '4006381333931': {
    name: 'Organic Honey',
    description: 'Pure organic wildflower honey, 350g',
    price: 8.49,
    image: '/products/honey.jpg',
  },
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const barcode = searchParams.get('barcode');

  if (!barcode) {
    return NextResponse.json({ error: 'Barcode required' }, { status: 400 });
  }

  // Look up product
  const product = products[barcode];

  if (!product) {
    // Could also call external API like Open Food Facts
    // const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);
    return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  }

  return NextResponse.json({
    ...product,
    barcode,
  });
}
```

## Usage

```tsx
// app/scan/page.tsx
'use client';

import { useState } from 'react';
import { BarcodeScanner } from '@/components/barcode-scanner';
import { ProductLookup } from '@/components/product-lookup';
import { ScanResult } from '@/lib/scanner/types';

export default function ScanPage() {
  const [scannedCodes, setScannedCodes] = useState<ScanResult[]>([]);

  const handleScan = (result: ScanResult) => {
    setScannedCodes((prev) => [result, ...prev].slice(0, 10));
  };

  return (
    <div className="max-w-2xl mx-auto p-8 space-y-8">
      <h1 className="text-3xl font-bold">Barcode Scanner</h1>

      <section>
        <h2 className="text-xl font-semibold mb-4">Scan Any Barcode</h2>
        <BarcodeScanner
          onScan={handleScan}
          continuous
          showFileUpload
        />
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">Product Lookup</h2>
        <ProductLookup
          onProductFound={(product) => console.log('Found:', product)}
        />
      </section>

      {scannedCodes.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold mb-4">Scan History</h2>
          <ul className="space-y-2">
            {scannedCodes.map((code, i) => (
              <li
                key={i}
                className="p-3 bg-gray-50 rounded-lg flex justify-between"
              >
                <span className="font-mono">{code.text}</span>
                <span className="text-sm text-gray-500">{code.format}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
```

## Related Skills

- [[qr-codes]] - QR code generation
- [[camera]] - Camera access
- [[image-processing]] - Image analysis
- [[product-catalog]] - Product management

## Changelog

### 2.0.0 (2025-01-17)
- Standardized to atomic design system v2
- Updated frontmatter schema

### 1.0.0 (2025-01-17)
- Initial implementation
- Camera-based scanning
- File upload scanning
- Multiple barcode format support
- Product lookup component
