---
id: pt-rich-text-editor
name: Rich Text Editor
version: 2.0.0
layer: L5
category: forms
description: Implement rich text editing with Tiptap or Lexical in Next.js 15
tags: [forms, rich, text, editor]
composes:
  - ../molecules/form-field.md
  - ../molecules/toolbar.md
  - ../atoms/input-button.md
  - ../atoms/display-icon.md
  - ../atoms/interactive-tooltip.md
dependencies: []
formula: "RichTextEditor = Tiptap(EditorContent) + EditorToolbar(m-toolbar) + ToolbarButton(a-input-button) + Icons(a-display-icon) + Controller(react-hook-form)"
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# Rich Text Editor Pattern

## Overview

Rich text editors enable formatted content creation with features like bold, italic, lists, images, and more. This pattern covers implementing Tiptap editor in Next.js 15 with Server Components compatibility.

## When to Use

- Blog post or article content editors
- CMS content management interfaces
- Email composition tools
- Comment systems with formatting support
- Documentation editors (wikis, knowledge bases)
- Product descriptions with rich formatting

## Composition Diagram

```
+----------------------------------------------------------------------+
|                     Rich Text Editor Pattern                          |
+----------------------------------------------------------------------+
|                                                                      |
|  +----------------------------------------------------------------+  |
|  |              RichTextEditor Component                           |  |
|  |  +------------------------------------------------------------+|  |
|  |  |              EditorToolbar (m-toolbar)                      ||  |
|  |  |  +----------+  +---------+  +----------+  +------------+   ||  |
|  |  |  | History  |  | Format  |  | Headings |  | Lists/Blk  |   ||  |
|  |  |  | Undo/Redo|  | B I U S |  | H1 H2 H3 |  | Ul Ol Quot |   ||  |
|  |  |  +----------+  +---------+  +----------+  +------------+   ||  |
|  |  |                                                             ||  |
|  |  |  +----------+  +---------+  +-------------+                ||  |
|  |  |  | Align    |  | Media   |  | Custom      |                ||  |
|  |  |  | L C R    |  | Link Img|  | Components  |                ||  |
|  |  |  +----------+  +---------+  +-------------+                ||  |
|  |  |                                                             ||  |
|  |  |  Each button:                                               ||  |
|  |  |  - ToolbarButton (a-input-button variant="ghost")          ||  |
|  |  |  - Icon (a-display-icon from lucide-react)                 ||  |
|  |  |  - Tooltip (a-interactive-tooltip) for title               ||  |
|  |  |  - isActive state for toggle highlighting                  ||  |
|  |  +------------------------------------------------------------+|  |
|  +----------------------------------------------------------------+  |
|                                |                                     |
|                                v                                     |
|  +----------------------------------------------------------------+  |
|  |              EditorContent (Tiptap)                             |  |
|  |  +------------------------------------------------------------+|  |
|  |  | ProseMirror editor area                                     ||  |
|  |  | - prose styling (Tailwind typography)                       ||  |
|  |  | - contentEditable                                           ||  |
|  |  | - placeholder support                                       ||  |
|  |  | - min-height for consistent size                            ||  |
|  |  +------------------------------------------------------------+|  |
|  +----------------------------------------------------------------+  |
|                                                                      |
|  Extensions:                                                         |
|  StarterKit, Link, Image, Underline, TextAlign, Highlight            |
|                                                                      |
|  Form Integration:                                                   |
|  - Controller from react-hook-form                                   |
|  - field.onChange(html) on editor update                             |
|  - field.value for initial content                                   |
|                                                                      |
+----------------------------------------------------------------------+
```

## Implementation

### Tiptap Editor Setup

```tsx
// components/editor/rich-text-editor.tsx
'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Highlight from '@tiptap/extension-highlight';
import { useCallback, useEffect } from 'react';

interface RichTextEditorProps {
  content?: string;
  onChange?: (html: string, json: any) => void;
  placeholder?: string;
  editable?: boolean;
  className?: string;
}

export function RichTextEditor({
  content = '',
  onChange,
  placeholder = 'Start writing...',
  editable = true,
  className = '',
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-500 underline cursor-pointer',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full rounded-lg',
        },
      }),
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Highlight.configure({
        multicolor: true,
      }),
    ],
    content,
    editable,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML(), editor.getJSON());
    },
    editorProps: {
      attributes: {
        class: `prose prose-sm sm:prose lg:prose-lg max-w-none focus:outline-none min-h-[200px] ${className}`,
      },
    },
  });

  // Update content when prop changes
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  if (!editor) {
    return <div className="h-[200px] animate-pulse bg-gray-100 rounded" />;
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <EditorToolbar editor={editor} />
      <EditorContent
        editor={editor}
        className="p-4"
      />
    </div>
  );
}
```

### Editor Toolbar

```tsx
// components/editor/editor-toolbar.tsx
'use client';

import { Editor } from '@tiptap/react';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Code,
  List,
  ListOrdered,
  Quote,
  Heading1,
  Heading2,
  Heading3,
  Link,
  Image,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Highlighter,
  Undo,
  Redo,
} from 'lucide-react';
import { useCallback, useState } from 'react';

interface EditorToolbarProps {
  editor: Editor;
}

export function EditorToolbar({ editor }: EditorToolbarProps) {
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');

  const setLink = useCallback(() => {
    if (linkUrl) {
      editor
        .chain()
        .focus()
        .extendMarkRange('link')
        .setLink({ href: linkUrl })
        .run();
    }
    setShowLinkInput(false);
    setLinkUrl('');
  }, [editor, linkUrl]);

  const addImage = useCallback(() => {
    const url = window.prompt('Image URL:');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  }, [editor]);

  return (
    <div className="border-b bg-gray-50 p-2 flex flex-wrap gap-1">
      {/* History */}
      <ToolbarGroup>
        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="Undo"
        >
          <Undo className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="Redo"
        >
          <Redo className="w-4 h-4" />
        </ToolbarButton>
      </ToolbarGroup>

      <ToolbarDivider />

      {/* Text formatting */}
      <ToolbarGroup>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive('bold')}
          title="Bold"
        >
          <Bold className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive('italic')}
          title="Italic"
        >
          <Italic className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          isActive={editor.isActive('underline')}
          title="Underline"
        >
          <Underline className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          isActive={editor.isActive('strike')}
          title="Strikethrough"
        >
          <Strikethrough className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCode().run()}
          isActive={editor.isActive('code')}
          title="Code"
        >
          <Code className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHighlight().run()}
          isActive={editor.isActive('highlight')}
          title="Highlight"
        >
          <Highlighter className="w-4 h-4" />
        </ToolbarButton>
      </ToolbarGroup>

      <ToolbarDivider />

      {/* Headings */}
      <ToolbarGroup>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          isActive={editor.isActive('heading', { level: 1 })}
          title="Heading 1"
        >
          <Heading1 className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          isActive={editor.isActive('heading', { level: 2 })}
          title="Heading 2"
        >
          <Heading2 className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          isActive={editor.isActive('heading', { level: 3 })}
          title="Heading 3"
        >
          <Heading3 className="w-4 h-4" />
        </ToolbarButton>
      </ToolbarGroup>

      <ToolbarDivider />

      {/* Lists */}
      <ToolbarGroup>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive('bulletList')}
          title="Bullet List"
        >
          <List className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive('orderedList')}
          title="Numbered List"
        >
          <ListOrdered className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          isActive={editor.isActive('blockquote')}
          title="Quote"
        >
          <Quote className="w-4 h-4" />
        </ToolbarButton>
      </ToolbarGroup>

      <ToolbarDivider />

      {/* Alignment */}
      <ToolbarGroup>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          isActive={editor.isActive({ textAlign: 'left' })}
          title="Align Left"
        >
          <AlignLeft className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          isActive={editor.isActive({ textAlign: 'center' })}
          title="Align Center"
        >
          <AlignCenter className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          isActive={editor.isActive({ textAlign: 'right' })}
          title="Align Right"
        >
          <AlignRight className="w-4 h-4" />
        </ToolbarButton>
      </ToolbarGroup>

      <ToolbarDivider />

      {/* Media */}
      <ToolbarGroup>
        <ToolbarButton
          onClick={() => setShowLinkInput(!showLinkInput)}
          isActive={editor.isActive('link')}
          title="Add Link"
        >
          <Link className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton onClick={addImage} title="Add Image">
          <Image className="w-4 h-4" />
        </ToolbarButton>
      </ToolbarGroup>

      {/* Link input popup */}
      {showLinkInput && (
        <div className="absolute mt-10 bg-white border rounded shadow-lg p-2 flex gap-2">
          <input
            type="url"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            placeholder="https://..."
            className="border rounded px-2 py-1 text-sm"
            autoFocus
          />
          <button
            onClick={setLink}
            className="px-3 py-1 bg-blue-500 text-white rounded text-sm"
          >
            Add
          </button>
        </div>
      )}
    </div>
  );
}

function ToolbarButton({
  onClick,
  isActive,
  disabled,
  title,
  children,
}: {
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`p-2 rounded hover:bg-gray-200 disabled:opacity-50 ${
        isActive ? 'bg-gray-200 text-blue-600' : ''
      }`}
    >
      {children}
    </button>
  );
}

function ToolbarGroup({ children }: { children: React.ReactNode }) {
  return <div className="flex gap-0.5">{children}</div>;
}

function ToolbarDivider() {
  return <div className="w-px bg-gray-300 mx-1" />;
}
```

### Form Integration

```tsx
// components/forms/post-editor-form.tsx
'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { RichTextEditor } from '@/components/editor/rich-text-editor';

const postSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  content: z.string().min(10, 'Content must be at least 10 characters'),
  excerpt: z.string().max(500).optional(),
});

type PostFormData = z.infer<typeof postSchema>;

interface PostEditorFormProps {
  initialData?: Partial<PostFormData>;
  onSubmit: (data: PostFormData) => Promise<void>;
}

export function PostEditorForm({ initialData, onSubmit }: PostEditorFormProps) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PostFormData>({
    resolver: zodResolver(postSchema),
    defaultValues: initialData,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label className="block text-sm font-medium mb-1">Title</label>
        <input
          {...register('title')}
          className="w-full p-3 border rounded-lg text-lg"
          placeholder="Enter post title..."
        />
        {errors.title && (
          <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Content</label>
        <Controller
          name="content"
          control={control}
          render={({ field }) => (
            <RichTextEditor
              content={field.value}
              onChange={(html) => field.onChange(html)}
              placeholder="Write your post content..."
            />
          )}
        />
        {errors.content && (
          <p className="text-red-500 text-sm mt-1">{errors.content.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Excerpt (optional)
        </label>
        <textarea
          {...register('excerpt')}
          className="w-full p-3 border rounded-lg"
          rows={3}
          placeholder="Brief summary of your post..."
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
      >
        {isSubmitting ? 'Saving...' : 'Save Post'}
      </button>
    </form>
  );
}
```

### Image Upload Extension

```tsx
// lib/editor/image-upload-extension.ts
import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';

export interface ImageUploadOptions {
  uploadFn: (file: File) => Promise<string>;
  maxSize?: number;
  allowedTypes?: string[];
}

export const ImageUpload = Extension.create<ImageUploadOptions>({
  name: 'imageUpload',

  addOptions() {
    return {
      uploadFn: async () => '',
      maxSize: 5 * 1024 * 1024, // 5MB
      allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    };
  },

  addProseMirrorPlugins() {
    const { uploadFn, maxSize, allowedTypes } = this.options;

    return [
      new Plugin({
        key: new PluginKey('imageUpload'),
        props: {
          handleDrop: (view, event, slice, moved) => {
            if (moved || !event.dataTransfer?.files.length) {
              return false;
            }

            const file = event.dataTransfer.files[0];
            
            if (!allowedTypes?.includes(file.type)) {
              alert('Invalid file type');
              return true;
            }

            if (file.size > (maxSize || 0)) {
              alert('File too large');
              return true;
            }

            const coordinates = view.posAtCoords({
              left: event.clientX,
              top: event.clientY,
            });

            uploadFn(file).then((url) => {
              if (url && coordinates) {
                const node = view.state.schema.nodes.image.create({
                  src: url,
                });
                const transaction = view.state.tr.insert(
                  coordinates.pos,
                  node
                );
                view.dispatch(transaction);
              }
            });

            return true;
          },
          handlePaste: (view, event, slice) => {
            const items = event.clipboardData?.items;
            if (!items) return false;

            for (const item of items) {
              if (item.type.startsWith('image/')) {
                const file = item.getAsFile();
                if (!file) continue;

                if (file.size > (maxSize || 0)) {
                  alert('File too large');
                  return true;
                }

                uploadFn(file).then((url) => {
                  if (url) {
                    const node = view.state.schema.nodes.image.create({
                      src: url,
                    });
                    const transaction = view.state.tr.replaceSelectionWith(node);
                    view.dispatch(transaction);
                  }
                });

                return true;
              }
            }

            return false;
          },
        },
      }),
    ];
  },
});
```

### Markdown Support

```tsx
// components/editor/markdown-editor.tsx
'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Markdown } from 'tiptap-markdown';

interface MarkdownEditorProps {
  content?: string;
  onChange?: (markdown: string) => void;
}

export function MarkdownEditor({ content = '', onChange }: MarkdownEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Markdown.configure({
        html: false,
        transformCopiedText: true,
        transformPastedText: true,
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      const markdown = editor.storage.markdown.getMarkdown();
      onChange?.(markdown);
    },
  });

  return <EditorContent editor={editor} className="prose max-w-none p-4" />;
}
```

## Variants

### Read-Only Content Renderer

```tsx
// components/editor/content-renderer.tsx
'use client';

import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';

export function ContentRenderer({ content }: { content: string }) {
  const editor = useEditor({
    extensions: [StarterKit, Link, Image],
    content,
    editable: false,
  });

  return <EditorContent editor={editor} className="prose max-w-none" />;
}
```

## Anti-Patterns

```tsx
// Bad: SSR with Tiptap (causes hydration errors)
export default function Page() {
  const editor = useEditor({...}); // Runs on server!
  return <EditorContent editor={editor} />;
}

// Good: Client-only with dynamic import
const Editor = dynamic(() => import('@/components/editor'), { ssr: false });

// Bad: No content sanitization
<div dangerouslySetInnerHTML={{ __html: userContent }} />

// Good: Use Tiptap's built-in sanitization
<ContentRenderer content={userContent} />
```

## Related Skills

- `form-validation` - Form validation
- `file-upload` - Image uploads
- `mdx` - Markdown/MDX content
- `autosave` - Auto-saving content

## Changelog

### 2.0.0 (2025-01-18)
- Standardized to atomic design system v2
- Updated frontmatter schema

- 1.0.0: Initial rich text editor pattern with Tiptap
