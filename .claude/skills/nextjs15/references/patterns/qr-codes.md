---
id: pt-qr-codes
name: QR Codes
version: 2.0.0
layer: L5
category: data
description: QR code generation with customization, logos, and download options
tags: [qr-code, generation, download, svg, canvas, share]
composes: []
formula: "QRCode = DataEncoding + CanvasGeneration + LogoOverlay + ExportFormats + ShareIntegration"
dependencies:
  - react
  - next
  - qrcode
accessibility:
  wcag: AA
  keyboard: true
  screen-reader: true
performance:
  impact: low
  lcp: neutral
  cls: neutral
---

# QR Codes

## When to Use

- Sharing URLs, contact info, or WiFi credentials via scannable codes
- Generating printable marketing materials with QR codes
- Creating downloadable QR codes for tickets, boarding passes, or receipts
- Building QR code generators for user-created content
- Adding payment QR codes (PayPal, Venmo, crypto wallets)
- Event check-in systems with unique QR identifiers

## Composition Diagram

```
[User Input]
      |
      +---> [URL / Text / Email / WiFi / vCard]
      |
      v
[QR Generator Hook]
      |
      +---> [qrcode Library] ---> [Data Encoding]
      |
      +---> [Canvas Rendering] ---> [Logo Overlay]
      |
      +---> [Customization] ---> [Colors / Size / Error Correction]
      |
      v
[Output Options]
      |
      +---> [PNG Export (scaled)]
      +---> [SVG Export (vector)]
      +---> [PDF Export (printable)]
      +---> [Clipboard Copy]
      +---> [Web Share API]
```

## Overview

Generate customizable QR codes with support for logos, colors, error correction, and multiple export formats (SVG, PNG, PDF). Includes both client-side and server-side generation.

## Implementation

### QR Code Types

```tsx
// lib/qr-code/types.ts
export interface QRCodeOptions {
  value: string;
  size?: number;
  level?: 'L' | 'M' | 'Q' | 'H'; // Error correction level
  margin?: number;
  fgColor?: string;
  bgColor?: string;
  logo?: {
    src: string;
    width?: number;
    height?: number;
    padding?: number;
  };
  cornerRadius?: number;
  style?: 'squares' | 'dots' | 'rounded';
}

export interface QRCodeExportOptions {
  format: 'png' | 'svg' | 'pdf';
  filename?: string;
  scale?: number;
}
```

### QR Code Generator Hook

```tsx
// hooks/use-qr-code.ts
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import QRCode from 'qrcode';
import { QRCodeOptions, QRCodeExportOptions } from '@/lib/qr-code/types';

interface UseQRCodeResult {
  dataUrl: string | null;
  svgString: string | null;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  isGenerating: boolean;
  error: string | null;
  download: (options: QRCodeExportOptions) => Promise<void>;
  regenerate: () => void;
}

export function useQRCode(options: QRCodeOptions): UseQRCodeResult {
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [svgString, setSvgString] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const generate = useCallback(async () => {
    if (!options.value) {
      setDataUrl(null);
      setSvgString(null);
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const qrOptions: QRCode.QRCodeToDataURLOptions = {
        width: options.size || 256,
        margin: options.margin ?? 2,
        errorCorrectionLevel: options.level || 'M',
        color: {
          dark: options.fgColor || '#000000',
          light: options.bgColor || '#ffffff',
        },
      };

      // Generate data URL
      const url = await QRCode.toDataURL(options.value, qrOptions);
      
      // If logo provided, draw it on canvas
      if (options.logo) {
        const withLogo = await addLogoToQR(url, options);
        setDataUrl(withLogo);
      } else {
        setDataUrl(url);
      }

      // Generate SVG string
      const svg = await QRCode.toString(options.value, {
        type: 'svg',
        width: options.size || 256,
        margin: options.margin ?? 2,
        errorCorrectionLevel: options.level || 'M',
        color: {
          dark: options.fgColor || '#000000',
          light: options.bgColor || '#ffffff',
        },
      });
      setSvgString(svg);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate QR code');
    } finally {
      setIsGenerating(false);
    }
  }, [options]);

  useEffect(() => {
    generate();
  }, [generate]);

  const download = useCallback(
    async ({ format, filename = 'qrcode', scale = 2 }: QRCodeExportOptions) => {
      if (!dataUrl && !svgString) return;

      const downloadName = `${filename}.${format}`;

      if (format === 'svg' && svgString) {
        const blob = new Blob([svgString], { type: 'image/svg+xml' });
        downloadBlob(blob, downloadName);
        return;
      }

      if (format === 'png' && dataUrl) {
        // Create scaled canvas for higher resolution
        const canvas = document.createElement('canvas');
        const size = (options.size || 256) * scale;
        canvas.width = size;
        canvas.height = size;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const img = new Image();
        img.onload = () => {
          ctx.drawImage(img, 0, 0, size, size);
          canvas.toBlob((blob) => {
            if (blob) downloadBlob(blob, downloadName);
          }, 'image/png');
        };
        img.src = dataUrl;
        return;
      }

      if (format === 'pdf' && dataUrl) {
        const { jsPDF } = await import('jspdf');
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4',
        });

        const size = 80; // mm
        const x = (210 - size) / 2; // Center on A4
        const y = 50;

        pdf.addImage(dataUrl, 'PNG', x, y, size, size);
        pdf.save(downloadName);
      }
    },
    [dataUrl, svgString, options.size]
  );

  return {
    dataUrl,
    svgString,
    canvasRef,
    isGenerating,
    error,
    download,
    regenerate: generate,
  };
}

async function addLogoToQR(
  qrDataUrl: string,
  options: QRCodeOptions
): Promise<string> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const size = options.size || 256;
    canvas.width = size;
    canvas.height = size;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      reject(new Error('Canvas context not available'));
      return;
    }

    const qrImg = new Image();
    qrImg.onload = () => {
      ctx.drawImage(qrImg, 0, 0, size, size);

      if (options.logo) {
        const logoImg = new Image();
        logoImg.crossOrigin = 'anonymous';
        logoImg.onload = () => {
          const logoSize = options.logo!.width || size * 0.2;
          const logoX = (size - logoSize) / 2;
          const logoY = (size - logoSize) / 2;
          const padding = options.logo!.padding || 4;

          // Draw white background for logo
          ctx.fillStyle = options.bgColor || '#ffffff';
          ctx.fillRect(
            logoX - padding,
            logoY - padding,
            logoSize + padding * 2,
            logoSize + padding * 2
          );

          // Draw logo
          ctx.drawImage(logoImg, logoX, logoY, logoSize, logoSize);
          resolve(canvas.toDataURL('image/png'));
        };
        logoImg.onerror = () => resolve(qrDataUrl);
        logoImg.src = options.logo.src;
      } else {
        resolve(canvas.toDataURL('image/png'));
      }
    };
    qrImg.onerror = () => reject(new Error('Failed to load QR code'));
    qrImg.src = qrDataUrl;
  });
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
```

### QR Code Component

```tsx
// components/qr-code.tsx
'use client';

import { useState } from 'react';
import { Download, Copy, Check, Share2 } from 'lucide-react';
import { useQRCode } from '@/hooks/use-qr-code';
import { QRCodeOptions } from '@/lib/qr-code/types';

interface QRCodeDisplayProps extends QRCodeOptions {
  showControls?: boolean;
  className?: string;
}

export function QRCodeDisplay({
  showControls = true,
  className = '',
  ...options
}: QRCodeDisplayProps) {
  const { dataUrl, svgString, isGenerating, error, download } = useQRCode(options);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!dataUrl) return;

    try {
      const response = await fetch(dataUrl);
      const blob = await response.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob }),
      ]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback: copy data URL
      await navigator.clipboard.writeText(dataUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShare = async () => {
    if (!dataUrl || !navigator.share) return;

    try {
      const response = await fetch(dataUrl);
      const blob = await response.blob();
      const file = new File([blob], 'qrcode.png', { type: 'image/png' });

      await navigator.share({
        title: 'QR Code',
        files: [file],
      });
    } catch {
      // User cancelled or share failed
    }
  };

  if (error) {
    return (
      <div className={`p-4 bg-red-50 text-red-600 rounded-lg ${className}`}>
        {error}
      </div>
    );
  }

  return (
    <div className={`inline-flex flex-col items-center gap-4 ${className}`}>
      <div className="relative">
        {isGenerating ? (
          <div
            className="bg-gray-100 animate-pulse rounded-lg"
            style={{ width: options.size || 256, height: options.size || 256 }}
          />
        ) : dataUrl ? (
          <img
            src={dataUrl}
            alt="QR Code"
            width={options.size || 256}
            height={options.size || 256}
            className="rounded-lg"
          />
        ) : null}
      </div>

      {showControls && dataUrl && (
        <div className="flex items-center gap-2">
          <button
            onClick={() => download({ format: 'png', scale: 3 })}
            className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
            title="Download PNG"
          >
            <Download className="w-4 h-4" />
            PNG
          </button>

          <button
            onClick={() => download({ format: 'svg' })}
            className="flex items-center gap-1 px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
            title="Download SVG"
          >
            <Download className="w-4 h-4" />
            SVG
          </button>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
            title="Copy to clipboard"
          >
            {copied ? (
              <Check className="w-4 h-4 text-green-600" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>

          {typeof navigator !== 'undefined' && 'share' in navigator && (
            <button
              onClick={handleShare}
              className="flex items-center gap-1 px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
              title="Share"
            >
              <Share2 className="w-4 h-4" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
```

### QR Code Generator Form

```tsx
// components/qr-code-generator.tsx
'use client';

import { useState } from 'react';
import { QRCodeDisplay } from './qr-code';
import { QRCodeOptions } from '@/lib/qr-code/types';

type QRContentType = 'url' | 'text' | 'email' | 'phone' | 'sms' | 'wifi' | 'vcard';

interface QRGeneratorProps {
  defaultType?: QRContentType;
}

export function QRCodeGenerator({ defaultType = 'url' }: QRGeneratorProps) {
  const [contentType, setContentType] = useState<QRContentType>(defaultType);
  const [options, setOptions] = useState<QRCodeOptions>({
    value: '',
    size: 256,
    level: 'M',
    fgColor: '#000000',
    bgColor: '#ffffff',
  });

  // Content type specific fields
  const [url, setUrl] = useState('');
  const [text, setText] = useState('');
  const [email, setEmail] = useState({ to: '', subject: '', body: '' });
  const [phone, setPhone] = useState('');
  const [sms, setSms] = useState({ number: '', message: '' });
  const [wifi, setWifi] = useState({ ssid: '', password: '', encryption: 'WPA' });
  const [vcard, setVcard] = useState({
    name: '',
    phone: '',
    email: '',
    organization: '',
    title: '',
  });

  // Generate QR code value based on content type
  const generateValue = (): string => {
    switch (contentType) {
      case 'url':
        return url;
      case 'text':
        return text;
      case 'email':
        return `mailto:${email.to}?subject=${encodeURIComponent(email.subject)}&body=${encodeURIComponent(email.body)}`;
      case 'phone':
        return `tel:${phone}`;
      case 'sms':
        return `sms:${sms.number}?body=${encodeURIComponent(sms.message)}`;
      case 'wifi':
        return `WIFI:T:${wifi.encryption};S:${wifi.ssid};P:${wifi.password};;`;
      case 'vcard':
        return `BEGIN:VCARD
VERSION:3.0
N:${vcard.name}
TEL:${vcard.phone}
EMAIL:${vcard.email}
ORG:${vcard.organization}
TITLE:${vcard.title}
END:VCARD`;
      default:
        return '';
    }
  };

  const qrValue = generateValue();

  const contentTypes: { value: QRContentType; label: string }[] = [
    { value: 'url', label: 'URL' },
    { value: 'text', label: 'Text' },
    { value: 'email', label: 'Email' },
    { value: 'phone', label: 'Phone' },
    { value: 'sms', label: 'SMS' },
    { value: 'wifi', label: 'WiFi' },
    { value: 'vcard', label: 'vCard' },
  ];

  return (
    <div className="grid md:grid-cols-2 gap-8">
      {/* Form */}
      <div className="space-y-6">
        {/* Content Type */}
        <div>
          <label className="block text-sm font-medium mb-2">Content Type</label>
          <div className="flex flex-wrap gap-2">
            {contentTypes.map((type) => (
              <button
                key={type.value}
                onClick={() => setContentType(type.value)}
                className={`px-3 py-1.5 text-sm rounded-full ${
                  contentType === type.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content Input */}
        <div className="space-y-4">
          {contentType === 'url' && (
            <div>
              <label className="block text-sm font-medium mb-1">URL</label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com"
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
          )}

          {contentType === 'text' && (
            <div>
              <label className="block text-sm font-medium mb-1">Text</label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Enter any text..."
                rows={4}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
          )}

          {contentType === 'email' && (
            <>
              <div>
                <label className="block text-sm font-medium mb-1">To</label>
                <input
                  type="email"
                  value={email.to}
                  onChange={(e) => setEmail({ ...email, to: e.target.value })}
                  placeholder="recipient@example.com"
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Subject</label>
                <input
                  type="text"
                  value={email.subject}
                  onChange={(e) => setEmail({ ...email, subject: e.target.value })}
                  placeholder="Email subject"
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Body</label>
                <textarea
                  value={email.body}
                  onChange={(e) => setEmail({ ...email, body: e.target.value })}
                  placeholder="Email body"
                  rows={3}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
            </>
          )}

          {contentType === 'phone' && (
            <div>
              <label className="block text-sm font-medium mb-1">Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1234567890"
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
          )}

          {contentType === 'sms' && (
            <>
              <div>
                <label className="block text-sm font-medium mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={sms.number}
                  onChange={(e) => setSms({ ...sms, number: e.target.value })}
                  placeholder="+1234567890"
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Message</label>
                <textarea
                  value={sms.message}
                  onChange={(e) => setSms({ ...sms, message: e.target.value })}
                  placeholder="Pre-filled message"
                  rows={3}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
            </>
          )}

          {contentType === 'wifi' && (
            <>
              <div>
                <label className="block text-sm font-medium mb-1">Network Name (SSID)</label>
                <input
                  type="text"
                  value={wifi.ssid}
                  onChange={(e) => setWifi({ ...wifi, ssid: e.target.value })}
                  placeholder="WiFi Network"
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Password</label>
                <input
                  type="text"
                  value={wifi.password}
                  onChange={(e) => setWifi({ ...wifi, password: e.target.value })}
                  placeholder="Password"
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Encryption</label>
                <select
                  value={wifi.encryption}
                  onChange={(e) => setWifi({ ...wifi, encryption: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="WPA">WPA/WPA2</option>
                  <option value="WEP">WEP</option>
                  <option value="nopass">None</option>
                </select>
              </div>
            </>
          )}

          {contentType === 'vcard' && (
            <>
              <div>
                <label className="block text-sm font-medium mb-1">Full Name</label>
                <input
                  type="text"
                  value={vcard.name}
                  onChange={(e) => setVcard({ ...vcard, name: e.target.value })}
                  placeholder="John Doe"
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Phone</label>
                <input
                  type="tel"
                  value={vcard.phone}
                  onChange={(e) => setVcard({ ...vcard, phone: e.target.value })}
                  placeholder="+1234567890"
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  value={vcard.email}
                  onChange={(e) => setVcard({ ...vcard, email: e.target.value })}
                  placeholder="john@example.com"
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Organization</label>
                <input
                  type="text"
                  value={vcard.organization}
                  onChange={(e) => setVcard({ ...vcard, organization: e.target.value })}
                  placeholder="Company Name"
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input
                  type="text"
                  value={vcard.title}
                  onChange={(e) => setVcard({ ...vcard, title: e.target.value })}
                  placeholder="Job Title"
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
            </>
          )}
        </div>

        {/* Style Options */}
        <div className="border-t pt-6 space-y-4">
          <h3 className="font-medium">Customize</h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Foreground</label>
              <input
                type="color"
                value={options.fgColor}
                onChange={(e) => setOptions({ ...options, fgColor: e.target.value })}
                className="w-full h-10 rounded border cursor-pointer"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Background</label>
              <input
                type="color"
                value={options.bgColor}
                onChange={(e) => setOptions({ ...options, bgColor: e.target.value })}
                className="w-full h-10 rounded border cursor-pointer"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Error Correction: {options.level}
            </label>
            <select
              value={options.level}
              onChange={(e) =>
                setOptions({ ...options, level: e.target.value as 'L' | 'M' | 'Q' | 'H' })
              }
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="L">Low (7%)</option>
              <option value="M">Medium (15%)</option>
              <option value="Q">Quartile (25%)</option>
              <option value="H">High (30%)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Size: {options.size}px</label>
            <input
              type="range"
              min="128"
              max="512"
              step="32"
              value={options.size}
              onChange={(e) => setOptions({ ...options, size: Number(e.target.value) })}
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* Preview */}
      <div className="flex flex-col items-center justify-center p-8 bg-gray-50 rounded-lg">
        {qrValue ? (
          <QRCodeDisplay {...options} value={qrValue} />
        ) : (
          <div className="text-gray-500 text-center">
            <p>Enter content to generate QR code</p>
          </div>
        )}
      </div>
    </div>
  );
}
```

### Server-Side QR Code Generation

```tsx
// app/api/qr/route.ts
import { NextRequest, NextResponse } from 'next/server';
import QRCode from 'qrcode';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  
  const data = searchParams.get('data');
  const size = parseInt(searchParams.get('size') || '256');
  const format = searchParams.get('format') || 'png';
  const fgColor = searchParams.get('fg') || '#000000';
  const bgColor = searchParams.get('bg') || '#ffffff';
  const level = (searchParams.get('level') || 'M') as 'L' | 'M' | 'Q' | 'H';

  if (!data) {
    return NextResponse.json({ error: 'Data parameter required' }, { status: 400 });
  }

  try {
    const options = {
      width: size,
      margin: 2,
      errorCorrectionLevel: level,
      color: { dark: fgColor, light: bgColor },
    };

    if (format === 'svg') {
      const svg = await QRCode.toString(data, { ...options, type: 'svg' });
      return new NextResponse(svg, {
        headers: { 'Content-Type': 'image/svg+xml' },
      });
    }

    const buffer = await QRCode.toBuffer(data, options);
    return new NextResponse(buffer, {
      headers: { 'Content-Type': 'image/png' },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate QR code' },
      { status: 500 }
    );
  }
}
```

## Usage

```tsx
// app/qr/page.tsx
import { QRCodeDisplay } from '@/components/qr-code';
import { QRCodeGenerator } from '@/components/qr-code-generator';

export default function QRPage() {
  return (
    <div className="max-w-4xl mx-auto p-8 space-y-12">
      <section>
        <h1 className="text-3xl font-bold mb-4">QR Code Generator</h1>
        <QRCodeGenerator />
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">Simple QR Code</h2>
        <QRCodeDisplay
          value="https://example.com"
          size={200}
          fgColor="#1e40af"
        />
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">QR Code with Logo</h2>
        <QRCodeDisplay
          value="https://example.com"
          size={256}
          level="H"
          logo={{
            src: "/logo.png",
            width: 50,
          }}
        />
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">Server-Generated QR Code</h2>
        <img
          src="/api/qr?data=https://example.com&size=200&fg=%231e40af"
          alt="QR Code"
          width={200}
          height={200}
        />
      </section>
    </div>
  );
}
```

## Related Skills

- [[barcode-scanner]] - Scan QR codes
- [[share-api]] - Share content
- [[download-files]] - File downloads
- [[canvas]] - Canvas operations

## Changelog

### 2.0.0 (2025-01-18)
- Standardized to atomic design system v2
- Updated frontmatter schema

### 1.0.0 (2025-01-17)
- Initial implementation
- Multiple content types (URL, email, WiFi, vCard)
- Customization options
- Export to PNG, SVG, PDF
- Server-side generation API
