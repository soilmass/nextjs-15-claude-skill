---
id: pt-virtual-tour
name: 360 Virtual Tour
version: 1.0.0
layer: L5
category: media
description: 360-degree virtual tour implementation for Next.js applications
tags: [360, virtual-tour, panorama, three.js, media, next15, react19]
composes:
  - ../atoms/input-button.md
  - ../molecules/card.md
  - ../organisms/dialog.md
dependencies: []
formula: Three.js + Panorama Images + Hotspots = Interactive Virtual Tours
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# 360 Virtual Tour

## When to Use

- **Real estate**: Property virtual walkthroughs
- **Tourism**: Location and attraction previews
- **Retail**: Store virtual experiences
- **Education**: Museum and exhibit tours

**Avoid when**: Simple image galleries suffice, or using dedicated platforms (Matterport).

## Composition Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ Virtual Tour Architecture                                    │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Tour Viewer                                           │  │
│  │  ├─ Panorama Renderer: Three.js sphere mapping       │  │
│  │  ├─ Navigation: Scene transitions, hotspots          │  │
│  │  └─ Controls: Mouse/touch pan, zoom, fullscreen      │  │
│  └───────────────────────────────────────────────────────┘  │
│         │                    │                    │         │
│         ▼                    ▼                    ▼         │
│  ┌────────────┐     ┌──────────────┐     ┌─────────────┐   │
│  │ Scene      │     │ Hotspot      │     │ Mini Map    │   │
│  │ Manager    │     │ System       │     │ Navigation  │   │
│  └────────────┘     └──────────────┘     └─────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Tour Types

```typescript
// lib/virtual-tour/types.ts
export interface TourScene {
  id: string;
  name: string;
  panoramaUrl: string;
  thumbnailUrl: string;
  initialView?: {
    pitch: number;
    yaw: number;
    fov: number;
  };
  hotspots: Hotspot[];
}

export interface Hotspot {
  id: string;
  type: 'scene' | 'info' | 'link' | 'video';
  position: { pitch: number; yaw: number };
  targetSceneId?: string;
  title?: string;
  description?: string;
  url?: string;
  icon?: string;
}

export interface Tour {
  id: string;
  name: string;
  description: string;
  scenes: TourScene[];
  startSceneId: string;
  floorPlan?: {
    imageUrl: string;
    scenePositions: { sceneId: string; x: number; y: number }[];
  };
}
```

## Panorama Viewer Component

```typescript
// components/virtual-tour/panorama-viewer.tsx
'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { TourScene, Hotspot } from '@/lib/virtual-tour/types';
import { Button } from '@/components/ui/button';
import { Maximize, Minimize, ZoomIn, ZoomOut } from 'lucide-react';

interface PanoramaViewerProps {
  scene: TourScene;
  onHotspotClick?: (hotspot: Hotspot) => void;
  onSceneChange?: (sceneId: string) => void;
}

export function PanoramaViewer({ scene, onHotspotClick, onSceneChange }: PanoramaViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize Three.js
  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene
    const threeScene = new THREE.Scene();
    sceneRef.current = threeScene;

    // Camera
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.set(0, 0, 0.1);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableZoom = true;
    controls.enablePan = false;
    controls.rotateSpeed = -0.5;
    controls.minDistance = 0.1;
    controls.maxDistance = 0.1;
    controlsRef.current = controls;

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(threeScene, camera);
    };
    animate();

    // Resize handler
    const handleResize = () => {
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      container.removeChild(renderer.domElement);
    };
  }, []);

  // Load panorama
  useEffect(() => {
    if (!sceneRef.current) return;

    setIsLoading(true);

    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(
      scene.panoramaUrl,
      (texture) => {
        texture.mapping = THREE.EquirectangularReflectionMapping;

        // Create sphere
        const geometry = new THREE.SphereGeometry(500, 60, 40);
        geometry.scale(-1, 1, 1);

        const material = new THREE.MeshBasicMaterial({ map: texture });
        const sphere = new THREE.Mesh(geometry, material);

        // Clear previous panorama
        sceneRef.current!.clear();
        sceneRef.current!.add(sphere);

        // Add hotspots
        scene.hotspots.forEach((hotspot) => {
          const hotspotMesh = createHotspotMesh(hotspot);
          sceneRef.current!.add(hotspotMesh);
        });

        // Set initial view
        if (scene.initialView && cameraRef.current) {
          // Convert pitch/yaw to camera rotation
        }

        setIsLoading(false);
      },
      undefined,
      (error) => {
        console.error('Failed to load panorama:', error);
        setIsLoading(false);
      }
    );
  }, [scene]);

  const createHotspotMesh = (hotspot: Hotspot): THREE.Mesh => {
    const geometry = new THREE.SphereGeometry(5, 16, 16);
    const material = new THREE.MeshBasicMaterial({
      color: hotspot.type === 'scene' ? 0x00ff00 : 0xff0000,
      transparent: true,
      opacity: 0.8,
    });
    const mesh = new THREE.Mesh(geometry, material);

    // Convert pitch/yaw to position
    const phi = THREE.MathUtils.degToRad(90 - hotspot.position.pitch);
    const theta = THREE.MathUtils.degToRad(hotspot.position.yaw);
    const radius = 100;

    mesh.position.x = radius * Math.sin(phi) * Math.cos(theta);
    mesh.position.y = radius * Math.cos(phi);
    mesh.position.z = radius * Math.sin(phi) * Math.sin(theta);

    mesh.userData = { hotspot };

    return mesh;
  };

  const handleZoom = useCallback((direction: 'in' | 'out') => {
    if (!cameraRef.current) return;
    const delta = direction === 'in' ? -5 : 5;
    cameraRef.current.fov = Math.max(30, Math.min(90, cameraRef.current.fov + delta));
    cameraRef.current.updateProjectionMatrix();
  }, []);

  const toggleFullscreen = useCallback(async () => {
    if (!containerRef.current) return;

    if (!isFullscreen) {
      await containerRef.current.requestFullscreen();
    } else {
      await document.exitFullscreen();
    }
    setIsFullscreen(!isFullscreen);
  }, [isFullscreen]);

  // Raycaster for hotspot clicks
  useEffect(() => {
    if (!rendererRef.current || !cameraRef.current || !sceneRef.current) return;

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleClick = (event: MouseEvent) => {
      const rect = rendererRef.current!.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, cameraRef.current!);
      const intersects = raycaster.intersectObjects(sceneRef.current!.children);

      for (const intersect of intersects) {
        const hotspot = intersect.object.userData?.hotspot as Hotspot | undefined;
        if (hotspot) {
          if (hotspot.type === 'scene' && hotspot.targetSceneId) {
            onSceneChange?.(hotspot.targetSceneId);
          } else {
            onHotspotClick?.(hotspot);
          }
          break;
        }
      }
    };

    rendererRef.current.domElement.addEventListener('click', handleClick);

    return () => {
      rendererRef.current?.domElement.removeEventListener('click', handleClick);
    };
  }, [onHotspotClick, onSceneChange]);

  return (
    <div className="relative w-full h-full">
      <div ref={containerRef} className="w-full h-full" />

      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="text-white">Loading panorama...</div>
        </div>
      )}

      {/* Controls */}
      <div className="absolute bottom-4 right-4 flex gap-2">
        <Button variant="secondary" size="icon" onClick={() => handleZoom('in')}>
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button variant="secondary" size="icon" onClick={() => handleZoom('out')}>
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button variant="secondary" size="icon" onClick={toggleFullscreen}>
          {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
}
```

## Tour Navigation Component

```typescript
// components/virtual-tour/tour-viewer.tsx
'use client';

import { useState, useCallback } from 'react';
import { Tour, TourScene, Hotspot } from '@/lib/virtual-tour/types';
import { PanoramaViewer } from './panorama-viewer';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import Image from 'next/image';

interface TourViewerProps {
  tour: Tour;
}

export function TourViewer({ tour }: TourViewerProps) {
  const [currentSceneId, setCurrentSceneId] = useState(tour.startSceneId);
  const [selectedHotspot, setSelectedHotspot] = useState<Hotspot | null>(null);

  const currentScene = tour.scenes.find((s) => s.id === currentSceneId) || tour.scenes[0];

  const handleSceneChange = useCallback((sceneId: string) => {
    setCurrentSceneId(sceneId);
  }, []);

  const handleHotspotClick = useCallback((hotspot: Hotspot) => {
    if (hotspot.type === 'info') {
      setSelectedHotspot(hotspot);
    } else if (hotspot.type === 'link' && hotspot.url) {
      window.open(hotspot.url, '_blank');
    }
  }, []);

  return (
    <div className="relative w-full h-[600px]">
      <PanoramaViewer
        scene={currentScene}
        onSceneChange={handleSceneChange}
        onHotspotClick={handleHotspotClick}
      />

      {/* Scene selector */}
      <div className="absolute bottom-4 left-4 flex gap-2 overflow-x-auto max-w-[calc(100%-200px)] pb-2">
        {tour.scenes.map((scene) => (
          <button
            key={scene.id}
            onClick={() => setCurrentSceneId(scene.id)}
            className={`flex-shrink-0 rounded-lg overflow-hidden border-2 transition-colors ${
              scene.id === currentSceneId ? 'border-primary' : 'border-transparent'
            }`}
          >
            <div className="relative w-20 h-14">
              <Image
                src={scene.thumbnailUrl}
                alt={scene.name}
                fill
                className="object-cover"
              />
            </div>
          </button>
        ))}
      </div>

      {/* Floor plan mini-map */}
      {tour.floorPlan && (
        <Card className="absolute top-4 right-4 w-48">
          <CardContent className="p-2">
            <div className="relative">
              <Image
                src={tour.floorPlan.imageUrl}
                alt="Floor plan"
                width={180}
                height={120}
                className="rounded"
              />
              {tour.floorPlan.scenePositions.map((pos) => (
                <button
                  key={pos.sceneId}
                  onClick={() => setCurrentSceneId(pos.sceneId)}
                  className={`absolute w-4 h-4 rounded-full -translate-x-1/2 -translate-y-1/2 ${
                    pos.sceneId === currentSceneId
                      ? 'bg-primary'
                      : 'bg-muted-foreground'
                  }`}
                  style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Hotspot info dialog */}
      <Dialog open={!!selectedHotspot} onOpenChange={() => setSelectedHotspot(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedHotspot?.title}</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground">{selectedHotspot?.description}</p>
        </DialogContent>
      </Dialog>
    </div>
  );
}
```

## Tour Editor (Admin)

```typescript
// components/virtual-tour/tour-editor.tsx
'use client';

import { useState } from 'react';
import { Tour, TourScene, Hotspot } from '@/lib/virtual-tour/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, Save } from 'lucide-react';
import { toast } from 'sonner';

interface TourEditorProps {
  tour: Tour;
  onSave: (tour: Tour) => Promise<void>;
}

export function TourEditor({ tour: initialTour, onSave }: TourEditorProps) {
  const [tour, setTour] = useState<Tour>(initialTour);
  const [saving, setSaving] = useState(false);

  const addScene = () => {
    const newScene: TourScene = {
      id: `scene-${Date.now()}`,
      name: 'New Scene',
      panoramaUrl: '',
      thumbnailUrl: '',
      hotspots: [],
    };
    setTour({ ...tour, scenes: [...tour.scenes, newScene] });
  };

  const updateScene = (sceneId: string, updates: Partial<TourScene>) => {
    setTour({
      ...tour,
      scenes: tour.scenes.map((s) => (s.id === sceneId ? { ...s, ...updates } : s)),
    });
  };

  const removeScene = (sceneId: string) => {
    setTour({
      ...tour,
      scenes: tour.scenes.filter((s) => s.id !== sceneId),
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(tour);
      toast.success('Tour saved successfully');
    } catch {
      toast.error('Failed to save tour');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Edit Tour: {tour.name}</h2>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Saving...' : 'Save'}
        </Button>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Tour Name</Label>
          <Input
            value={tour.name}
            onChange={(e) => setTour({ ...tour, name: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Scenes</Label>
            <Button variant="outline" size="sm" onClick={addScene}>
              <Plus className="h-4 w-4 mr-2" />
              Add Scene
            </Button>
          </div>

          {tour.scenes.map((scene) => (
            <div key={scene.id} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <Input
                  value={scene.name}
                  onChange={(e) => updateScene(scene.id, { name: e.target.value })}
                  className="max-w-xs"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeScene(scene.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Panorama URL</Label>
                  <Input
                    value={scene.panoramaUrl}
                    onChange={(e) => updateScene(scene.id, { panoramaUrl: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
                <div className="space-y-2">
                  <Label>Thumbnail URL</Label>
                  <Input
                    value={scene.thumbnailUrl}
                    onChange={(e) => updateScene(scene.id, { thumbnailUrl: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

## Related Patterns

- [lazy-loading](./lazy-loading.md)
- [image-optimization](./image-optimization.md)
- [video-player](./video-player.md)

---

## Changelog

### 1.0.0 (2025-01-18)
- Initial implementation
- Three.js panorama viewer
- Hotspot system
- Tour navigation
- Floor plan mini-map
