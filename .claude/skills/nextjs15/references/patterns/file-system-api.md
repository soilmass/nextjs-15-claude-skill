---
id: pt-file-system-api
name: File System Access API
version: 2.0.0
layer: L5
category: browser
description: Native file system access for reading, writing, and managing local files
tags: [file-system, native, read, write, directory, picker]
composes:
  - ../atoms/input-button.md
dependencies: []
formula: File System Access API + Permissions + Handles = Native File Operations
performance:
  impact: low
  lcp: low
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

## When to Use

- Building desktop-like file management
- Implementing "Open" and "Save As" functionality
- Reading and writing local files
- Working with directories and file trees
- Creating offline-capable document editors

## Composition Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ File System Access API Flow                                 │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ User Interaction (Required)                         │   │
│  │ - Click event triggers file picker                  │   │
│  │ - User grants permission                            │   │
│  └─────────────────────┬───────────────────────────────┘   │
│                        │                                    │
│                        ▼                                    │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ File/Directory Pickers                              │   │
│  │ - showOpenFilePicker()                              │   │
│  │ - showSaveFilePicker()                              │   │
│  │ - showDirectoryPicker()                             │   │
│  └─────────────────────┬───────────────────────────────┘   │
│                        │                                    │
│                        ▼                                    │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ File System Handles                                 │   │
│  │ - FileSystemFileHandle (read/write files)          │   │
│  │ - FileSystemDirectoryHandle (navigate dirs)         │   │
│  │ - Persist handles in IndexedDB                      │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Browser Support: Chrome 86+, Edge 86+ (Chromium-based)    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

# File System Access API

## Overview

Use the File System Access API for native file operations including reading, writing, and managing local files and directories with user permission.

## Implementation

### File System Types

```tsx
// lib/file-system/types.ts
export interface FileEntry {
  name: string;
  kind: 'file' | 'directory';
  handle: FileSystemHandle;
  path?: string;
  size?: number;
  lastModified?: Date;
  type?: string;
}

export interface FilePickerOptions {
  types?: {
    description: string;
    accept: Record<string, string[]>;
  }[];
  excludeAcceptAllOption?: boolean;
  multiple?: boolean;
  startIn?: 'desktop' | 'documents' | 'downloads' | 'music' | 'pictures' | 'videos';
}

export interface DirectoryPickerOptions {
  id?: string;
  mode?: 'read' | 'readwrite';
  startIn?: 'desktop' | 'documents' | 'downloads' | 'music' | 'pictures' | 'videos';
}

export interface SaveFileOptions {
  suggestedName?: string;
  types?: {
    description: string;
    accept: Record<string, string[]>;
  }[];
}
```

### File System Hook

```tsx
// hooks/use-file-system.ts
'use client';

import { useState, useCallback } from 'react';
import { FileEntry, FilePickerOptions, DirectoryPickerOptions, SaveFileOptions } from '@/lib/file-system/types';

interface UseFileSystemState {
  isSupported: boolean;
  isLoading: boolean;
  error: string | null;
  recentFiles: FileEntry[];
}

export function useFileSystem() {
  const [state, setState] = useState<UseFileSystemState>({
    isSupported: typeof window !== 'undefined' && 'showOpenFilePicker' in window,
    isLoading: false,
    error: null,
    recentFiles: [],
  });

  // Open file picker
  const openFile = useCallback(
    async (options: FilePickerOptions = {}): Promise<FileEntry | null> => {
      if (!state.isSupported) {
        setState((prev) => ({ ...prev, error: 'File System API not supported' }));
        return null;
      }

      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const [handle] = await window.showOpenFilePicker({
          ...options,
          multiple: false,
        });

        const file = await handle.getFile();
        const entry: FileEntry = {
          name: file.name,
          kind: 'file',
          handle,
          size: file.size,
          lastModified: new Date(file.lastModified),
          type: file.type,
        };

        setState((prev) => ({
          ...prev,
          isLoading: false,
          recentFiles: [entry, ...prev.recentFiles.slice(0, 9)],
        }));

        return entry;
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          setState((prev) => ({
            ...prev,
            error: (error as Error).message,
            isLoading: false,
          }));
        } else {
          setState((prev) => ({ ...prev, isLoading: false }));
        }
        return null;
      }
    },
    [state.isSupported]
  );

  // Open multiple files
  const openFiles = useCallback(
    async (options: FilePickerOptions = {}): Promise<FileEntry[]> => {
      if (!state.isSupported) {
        setState((prev) => ({ ...prev, error: 'File System API not supported' }));
        return [];
      }

      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const handles = await window.showOpenFilePicker({
          ...options,
          multiple: true,
        });

        const entries: FileEntry[] = await Promise.all(
          handles.map(async (handle) => {
            const file = await handle.getFile();
            return {
              name: file.name,
              kind: 'file' as const,
              handle,
              size: file.size,
              lastModified: new Date(file.lastModified),
              type: file.type,
            };
          })
        );

        setState((prev) => ({
          ...prev,
          isLoading: false,
          recentFiles: [...entries, ...prev.recentFiles].slice(0, 10),
        }));

        return entries;
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          setState((prev) => ({
            ...prev,
            error: (error as Error).message,
            isLoading: false,
          }));
        } else {
          setState((prev) => ({ ...prev, isLoading: false }));
        }
        return [];
      }
    },
    [state.isSupported]
  );

  // Open directory picker
  const openDirectory = useCallback(
    async (options: DirectoryPickerOptions = {}): Promise<FileEntry | null> => {
      if (!state.isSupported) {
        setState((prev) => ({ ...prev, error: 'File System API not supported' }));
        return null;
      }

      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const handle = await window.showDirectoryPicker(options);
        const entry: FileEntry = {
          name: handle.name,
          kind: 'directory',
          handle,
        };

        setState((prev) => ({ ...prev, isLoading: false }));
        return entry;
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          setState((prev) => ({
            ...prev,
            error: (error as Error).message,
            isLoading: false,
          }));
        } else {
          setState((prev) => ({ ...prev, isLoading: false }));
        }
        return null;
      }
    },
    [state.isSupported]
  );

  // Read file contents
  const readFile = useCallback(
    async (handle: FileSystemFileHandle): Promise<string | null> => {
      try {
        const file = await handle.getFile();
        return await file.text();
      } catch (error) {
        setState((prev) => ({ ...prev, error: (error as Error).message }));
        return null;
      }
    },
    []
  );

  // Read file as ArrayBuffer
  const readFileAsBuffer = useCallback(
    async (handle: FileSystemFileHandle): Promise<ArrayBuffer | null> => {
      try {
        const file = await handle.getFile();
        return await file.arrayBuffer();
      } catch (error) {
        setState((prev) => ({ ...prev, error: (error as Error).message }));
        return null;
      }
    },
    []
  );

  // Save file with picker
  const saveFile = useCallback(
    async (content: string | Blob, options: SaveFileOptions = {}): Promise<FileEntry | null> => {
      if (!state.isSupported) {
        setState((prev) => ({ ...prev, error: 'File System API not supported' }));
        return null;
      }

      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const handle = await window.showSaveFilePicker(options);
        const writable = await handle.createWritable();
        await writable.write(content);
        await writable.close();

        const file = await handle.getFile();
        const entry: FileEntry = {
          name: file.name,
          kind: 'file',
          handle,
          size: file.size,
          lastModified: new Date(file.lastModified),
          type: file.type,
        };

        setState((prev) => ({
          ...prev,
          isLoading: false,
          recentFiles: [entry, ...prev.recentFiles.slice(0, 9)],
        }));

        return entry;
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          setState((prev) => ({
            ...prev,
            error: (error as Error).message,
            isLoading: false,
          }));
        } else {
          setState((prev) => ({ ...prev, isLoading: false }));
        }
        return null;
      }
    },
    [state.isSupported]
  );

  // Write to existing file handle
  const writeFile = useCallback(
    async (handle: FileSystemFileHandle, content: string | Blob): Promise<boolean> => {
      try {
        const writable = await handle.createWritable();
        await writable.write(content);
        await writable.close();
        return true;
      } catch (error) {
        setState((prev) => ({ ...prev, error: (error as Error).message }));
        return false;
      }
    },
    []
  );

  // Read directory contents
  const readDirectory = useCallback(
    async (handle: FileSystemDirectoryHandle): Promise<FileEntry[]> => {
      const entries: FileEntry[] = [];

      try {
        for await (const [name, entryHandle] of handle.entries()) {
          if (entryHandle.kind === 'file') {
            const file = await (entryHandle as FileSystemFileHandle).getFile();
            entries.push({
              name,
              kind: 'file',
              handle: entryHandle,
              size: file.size,
              lastModified: new Date(file.lastModified),
              type: file.type,
            });
          } else {
            entries.push({
              name,
              kind: 'directory',
              handle: entryHandle,
            });
          }
        }
      } catch (error) {
        setState((prev) => ({ ...prev, error: (error as Error).message }));
      }

      return entries.sort((a, b) => {
        if (a.kind !== b.kind) return a.kind === 'directory' ? -1 : 1;
        return a.name.localeCompare(b.name);
      });
    },
    []
  );

  // Check if we have permission
  const checkPermission = useCallback(
    async (handle: FileSystemHandle, mode: 'read' | 'readwrite' = 'read'): Promise<boolean> => {
      try {
        const options = { mode };
        const permission = await handle.queryPermission(options);
        
        if (permission === 'granted') return true;
        if (permission === 'prompt') {
          const result = await handle.requestPermission(options);
          return result === 'granted';
        }
        return false;
      } catch {
        return false;
      }
    },
    []
  );

  return {
    ...state,
    openFile,
    openFiles,
    openDirectory,
    readFile,
    readFileAsBuffer,
    saveFile,
    writeFile,
    readDirectory,
    checkPermission,
  };
}
```

### File Browser Component

```tsx
// components/file-browser.tsx
'use client';

import { useState, useCallback } from 'react';
import {
  Folder,
  File,
  FileText,
  FileImage,
  FileVideo,
  FileAudio,
  ChevronRight,
  ChevronDown,
  Upload,
  Download,
  Plus,
  Trash2,
  RefreshCw,
} from 'lucide-react';
import { useFileSystem } from '@/hooks/use-file-system';
import { FileEntry } from '@/lib/file-system/types';

interface FileBrowserProps {
  onFileSelect?: (file: FileEntry, content: string) => void;
  className?: string;
}

export function FileBrowser({ onFileSelect, className }: FileBrowserProps) {
  const [rootHandle, setRootHandle] = useState<FileSystemDirectoryHandle | null>(null);
  const [entries, setEntries] = useState<FileEntry[]>([]);
  const [expandedDirs, setExpandedDirs] = useState<Set<string>>(new Set());
  const [selectedFile, setSelectedFile] = useState<FileEntry | null>(null);

  const {
    isSupported,
    isLoading,
    error,
    openDirectory,
    readDirectory,
    readFile,
    saveFile,
    checkPermission,
  } = useFileSystem();

  const handleOpenDirectory = async () => {
    const dir = await openDirectory({ mode: 'readwrite' });
    if (dir) {
      setRootHandle(dir.handle as FileSystemDirectoryHandle);
      const contents = await readDirectory(dir.handle as FileSystemDirectoryHandle);
      setEntries(contents);
      setExpandedDirs(new Set());
      setSelectedFile(null);
    }
  };

  const handleToggleDir = async (entry: FileEntry, path: string) => {
    const key = path || entry.name;
    const newExpanded = new Set(expandedDirs);

    if (expandedDirs.has(key)) {
      newExpanded.delete(key);
    } else {
      newExpanded.add(key);
      // Load directory contents if not already loaded
      const contents = await readDirectory(entry.handle as FileSystemDirectoryHandle);
      // Store in a nested structure (simplified here)
    }

    setExpandedDirs(newExpanded);
  };

  const handleFileClick = async (entry: FileEntry) => {
    setSelectedFile(entry);
    
    if (onFileSelect) {
      const content = await readFile(entry.handle as FileSystemFileHandle);
      if (content) {
        onFileSelect(entry, content);
      }
    }
  };

  const handleRefresh = async () => {
    if (rootHandle) {
      const contents = await readDirectory(rootHandle);
      setEntries(contents);
    }
  };

  const getFileIcon = (entry: FileEntry) => {
    if (entry.kind === 'directory') {
      return <Folder className="w-5 h-5 text-yellow-500" />;
    }

    const type = entry.type || '';
    if (type.startsWith('image/')) {
      return <FileImage className="w-5 h-5 text-green-500" />;
    }
    if (type.startsWith('video/')) {
      return <FileVideo className="w-5 h-5 text-purple-500" />;
    }
    if (type.startsWith('audio/')) {
      return <FileAudio className="w-5 h-5 text-pink-500" />;
    }
    if (type.includes('text') || entry.name.match(/\.(txt|md|json|js|ts|css|html)$/)) {
      return <FileText className="w-5 h-5 text-blue-500" />;
    }
    return <File className="w-5 h-5 text-gray-500" />;
  };

  const formatSize = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (!isSupported) {
    return (
      <div className={`p-8 text-center bg-yellow-50 rounded-lg ${className}`}>
        <p className="text-yellow-700">
          File System Access API is not supported in this browser.
          Please use Chrome or Edge for native file access.
        </p>
      </div>
    );
  }

  return (
    <div className={`border rounded-lg overflow-hidden ${className}`}>
      {/* Toolbar */}
      <div className="flex items-center gap-2 p-2 bg-gray-50 border-b">
        <button
          onClick={handleOpenDirectory}
          className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <Folder className="w-4 h-4" />
          Open Folder
        </button>

        {rootHandle && (
          <>
            <button
              onClick={handleRefresh}
              className="p-1.5 hover:bg-gray-200 rounded-md"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </>
        )}
      </div>

      {/* Error message */}
      {error && (
        <div className="px-4 py-2 bg-red-50 text-red-600 text-sm">
          {error}
        </div>
      )}

      {/* File tree */}
      <div className="min-h-[300px] max-h-[500px] overflow-auto">
        {!rootHandle ? (
          <div className="flex items-center justify-center h-64 text-gray-500">
            <p>Click "Open Folder" to browse files</p>
          </div>
        ) : (
          <div className="p-2">
            {entries.map((entry) => (
              <FileTreeItem
                key={entry.name}
                entry={entry}
                path=""
                isExpanded={expandedDirs.has(entry.name)}
                isSelected={selectedFile?.name === entry.name}
                onToggle={(e, p) => handleToggleDir(e, p)}
                onClick={handleFileClick}
                getIcon={getFileIcon}
                formatSize={formatSize}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface FileTreeItemProps {
  entry: FileEntry;
  path: string;
  isExpanded: boolean;
  isSelected: boolean;
  onToggle: (entry: FileEntry, path: string) => void;
  onClick: (entry: FileEntry) => void;
  getIcon: (entry: FileEntry) => React.ReactNode;
  formatSize: (bytes?: number) => string;
  level?: number;
}

function FileTreeItem({
  entry,
  path,
  isExpanded,
  isSelected,
  onToggle,
  onClick,
  getIcon,
  formatSize,
  level = 0,
}: FileTreeItemProps) {
  return (
    <div style={{ paddingLeft: `${level * 16}px` }}>
      <div
        className={`
          flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer
          ${isSelected ? 'bg-blue-100' : 'hover:bg-gray-100'}
        `}
        onClick={() => {
          if (entry.kind === 'directory') {
            onToggle(entry, path);
          } else {
            onClick(entry);
          }
        }}
      >
        {entry.kind === 'directory' && (
          <span className="w-4 h-4 flex items-center justify-center">
            {isExpanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </span>
        )}
        {entry.kind === 'file' && <span className="w-4" />}
        {getIcon(entry)}
        <span className="flex-1 truncate text-sm">{entry.name}</span>
        {entry.size !== undefined && (
          <span className="text-xs text-gray-400">{formatSize(entry.size)}</span>
        )}
      </div>
    </div>
  );
}
```

### Text Editor Component

```tsx
// components/file-editor.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Save, FileUp, FilePlus } from 'lucide-react';
import { useFileSystem } from '@/hooks/use-file-system';
import { FileEntry } from '@/lib/file-system/types';

interface FileEditorProps {
  className?: string;
}

export function FileEditor({ className }: FileEditorProps) {
  const [content, setContent] = useState('');
  const [currentFile, setCurrentFile] = useState<FileEntry | null>(null);
  const [isDirty, setIsDirty] = useState(false);

  const {
    isSupported,
    isLoading,
    error,
    openFile,
    saveFile,
    writeFile,
    readFile,
  } = useFileSystem();

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'o') {
        e.preventDefault();
        handleOpen();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [content, currentFile]);

  const handleOpen = async () => {
    const entry = await openFile({
      types: [
        {
          description: 'Text files',
          accept: {
            'text/*': ['.txt', '.md', '.json', '.js', '.ts', '.css', '.html', '.xml'],
          },
        },
      ],
    });

    if (entry) {
      const fileContent = await readFile(entry.handle as FileSystemFileHandle);
      if (fileContent !== null) {
        setContent(fileContent);
        setCurrentFile(entry);
        setIsDirty(false);
      }
    }
  };

  const handleSave = async () => {
    if (currentFile) {
      const success = await writeFile(
        currentFile.handle as FileSystemFileHandle,
        content
      );
      if (success) {
        setIsDirty(false);
      }
    } else {
      await handleSaveAs();
    }
  };

  const handleSaveAs = async () => {
    const entry = await saveFile(content, {
      suggestedName: currentFile?.name || 'untitled.txt',
      types: [
        {
          description: 'Text files',
          accept: {
            'text/plain': ['.txt'],
            'text/markdown': ['.md'],
            'application/json': ['.json'],
          },
        },
      ],
    });

    if (entry) {
      setCurrentFile(entry);
      setIsDirty(false);
    }
  };

  const handleNew = () => {
    if (isDirty) {
      const confirm = window.confirm('Discard unsaved changes?');
      if (!confirm) return;
    }
    setContent('');
    setCurrentFile(null);
    setIsDirty(false);
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    setIsDirty(true);
  };

  if (!isSupported) {
    return (
      <div className={`p-8 text-center bg-yellow-50 rounded-lg ${className}`}>
        <p className="text-yellow-700">
          File System Access API is not supported in this browser.
        </p>
      </div>
    );
  }

  return (
    <div className={`flex flex-col border rounded-lg overflow-hidden ${className}`}>
      {/* Toolbar */}
      <div className="flex items-center gap-2 p-2 bg-gray-50 border-b">
        <button
          onClick={handleNew}
          className="flex items-center gap-1 px-3 py-1.5 text-sm hover:bg-gray-200 rounded-md"
          title="New (Ctrl+N)"
        >
          <FilePlus className="w-4 h-4" />
          New
        </button>

        <button
          onClick={handleOpen}
          className="flex items-center gap-1 px-3 py-1.5 text-sm hover:bg-gray-200 rounded-md"
          title="Open (Ctrl+O)"
        >
          <FileUp className="w-4 h-4" />
          Open
        </button>

        <button
          onClick={handleSave}
          disabled={!isDirty}
          className="flex items-center gap-1 px-3 py-1.5 text-sm hover:bg-gray-200 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
          title="Save (Ctrl+S)"
        >
          <Save className="w-4 h-4" />
          Save
        </button>

        <div className="flex-1" />

        {currentFile && (
          <span className="text-sm text-gray-500">
            {currentFile.name}
            {isDirty && ' *'}
          </span>
        )}
      </div>

      {/* Editor */}
      <textarea
        value={content}
        onChange={handleContentChange}
        placeholder="Start typing or open a file..."
        className="flex-1 p-4 font-mono text-sm resize-none focus:outline-none min-h-[400px]"
        spellCheck={false}
      />

      {/* Status bar */}
      <div className="flex items-center justify-between px-4 py-1 bg-gray-50 border-t text-xs text-gray-500">
        <span>
          {content.split('\n').length} lines, {content.length} characters
        </span>
        <span>
          {currentFile?.lastModified
            ? `Last modified: ${currentFile.lastModified.toLocaleString()}`
            : 'Unsaved'}
        </span>
      </div>
    </div>
  );
}
```

## Usage

```tsx
// app/editor/page.tsx
import { FileBrowser } from '@/components/file-browser';
import { FileEditor } from '@/components/file-editor';

export default function EditorPage() {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold mb-8">File Editor</h1>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* File Browser */}
        <div className="lg:col-span-1">
          <h2 className="text-lg font-semibold mb-4">Files</h2>
          <FileBrowser
            onFileSelect={(file, content) => {
              console.log('Selected:', file.name, content.substring(0, 100));
            }}
          />
        </div>

        {/* Editor */}
        <div className="lg:col-span-2">
          <h2 className="text-lg font-semibold mb-4">Editor</h2>
          <FileEditor className="h-[600px]" />
        </div>
      </div>
    </div>
  );
}
```

## Related Skills

- [[multipart-upload]] - File uploads
- [[download-files]] - File downloads
- [[drag-drop]] - Drag and drop
- [[offline-mode]] - Offline storage

## Changelog

### 2.0.0 (2025-01-17)
- Standardized to atomic design system v2
- Updated frontmatter schema

### 1.0.0 (2025-01-17)
- Initial implementation
- File and directory pickers
- Read and write operations
- File browser component
- Text editor with save/open
