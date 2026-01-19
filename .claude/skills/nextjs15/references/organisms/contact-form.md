---
id: o-contact-form
name: Contact Form
version: 2.1.0
layer: L3
category: forms
description: Contact form with validation, file attachments, and success states
tags: [contact, form, support, inquiry, feedback]
formula: ContactForm = FormField[] + Select + Button + Textarea + Input + FileUpload
composes:
  - ../molecules/form-field.md
  - ../molecules/combobox.md
dependencies: [react-hook-form, zod, lucide-react]
performance:
  impact: low
  lcp: low
  cls: low
accessibility:
  wcag: AA
  keyboard: true
  screen-reader: true
---

# Contact Form

## Overview

The Contact Form organism provides a complete contact/inquiry form with field validation, optional file attachments, department/topic selection, and success confirmation. Supports multiple layout variants for different use cases.

## When to Use

Use this skill when:
- Building contact pages
- Creating support request forms
- Implementing feedback forms
- Building inquiry/lead capture forms

## Composes

- [form-field](../molecules/form-field.md) - Form inputs with labels and error handling
- [combobox](../molecules/combobox.md) - Department/subject selection

## Composition Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│ ContactForm (L3 Organism)                                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ FormField (L2 Molecule) - Name                          │   │
│  │  ┌─────────────────────────────────────────────────┐    │   │
│  │  │ Input (L1 Atom)                                 │    │   │
│  │  └─────────────────────────────────────────────────┘    │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ FormField (L2 Molecule) - Email                         │   │
│  │  ┌─────────────────────────────────────────────────┐    │   │
│  │  │ Input (L1 Atom)                                 │    │   │
│  │  └─────────────────────────────────────────────────┘    │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ FormField (L2 Molecule) - Subject                       │   │
│  │  ┌─────────────────────────────────────────────────┐    │   │
│  │  │ Select (L1 Atom)                                │    │   │
│  │  └─────────────────────────────────────────────────┘    │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ FormField (L2 Molecule) - Message                       │   │
│  │  ┌─────────────────────────────────────────────────┐    │   │
│  │  │ Textarea (L1 Atom)                              │    │   │
│  │  └─────────────────────────────────────────────────┘    │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ FileUpload (Optional)                                   │   │
│  │  ┌─────────────────────────────────────────────────┐    │   │
│  │  │ Input[type=file] + Drag & Drop Zone             │    │   │
│  │  └─────────────────────────────────────────────────┘    │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Button (L1 Atom) - Submit                               │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ SuccessMessage / ErrorAlert (Conditional)               │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Implementation

```typescript
// components/organisms/contact-form.tsx
"use client";

import * as React from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Loader2,
  Send,
  CheckCircle2,
  AlertCircle,
  Paperclip,
  X,
  Upload
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// ============================================================================
// Types & Schemas
// ============================================================================

/** Validation schema for contact form */
const contactFormSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters"),
  email: z
    .string()
    .email("Please enter a valid email address"),
  subject: z
    .string()
    .min(1, "Please select a subject"),
  message: z
    .string()
    .min(10, "Message must be at least 10 characters")
    .max(5000, "Message must be less than 5000 characters"),
  company: z
    .string()
    .max(100, "Company name must be less than 100 characters")
    .optional(),
  phone: z
    .string()
    .regex(/^[\d\s\-+()]*$/, "Please enter a valid phone number")
    .optional()
    .or(z.literal("")),
});

export type ContactFormData = z.infer<typeof contactFormSchema>;

/** Subject options for the contact form */
export interface SubjectOption {
  value: string;
  label: string;
}

/** File attachment with metadata */
export interface FileAttachment {
  file: File;
  id: string;
  progress?: number;
  error?: string;
}

/** Contact form component props */
export interface ContactFormProps {
  /** Form title */
  title?: string;
  /** Form description */
  description?: string;
  /** Subject/department options */
  subjects?: SubjectOption[];
  /** Submit handler */
  onSubmit: (data: ContactFormData, files?: File[]) => Promise<void>;
  /** Show company field */
  showCompany?: boolean;
  /** Show phone field */
  showPhone?: boolean;
  /** Allow file attachments */
  allowAttachments?: boolean;
  /** Maximum file size in bytes (default: 10MB) */
  maxFileSize?: number;
  /** Allowed file types */
  allowedFileTypes?: string[];
  /** Maximum number of files */
  maxFiles?: number;
  /** Success message */
  successMessage?: string;
  /** Reset form after submit */
  resetOnSuccess?: boolean;
  /** Additional class names */
  className?: string;
}

// ============================================================================
// Default Values
// ============================================================================

const DEFAULT_SUBJECTS: SubjectOption[] = [
  { value: "general", label: "General Inquiry" },
  { value: "support", label: "Technical Support" },
  { value: "sales", label: "Sales Question" },
  { value: "feedback", label: "Feedback" },
  { value: "other", label: "Other" },
];

const DEFAULT_FILE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "application/pdf",
  "text/plain",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_FILES = 5;

// ============================================================================
// Helper Components
// ============================================================================

interface FormFieldWrapperProps {
  label: string;
  description?: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}

function FormFieldWrapper({
  label,
  description,
  error,
  required,
  children,
  className,
}: FormFieldWrapperProps) {
  const id = React.useId();
  const descriptionId = `${id}-description`;
  const errorId = `${id}-error`;

  return (
    <div className={cn("space-y-2", className)}>
      <Label
        htmlFor={id}
        className={cn(error && "text-destructive")}
      >
        {label}
        {required && (
          <span className="text-destructive ml-1" aria-hidden="true">*</span>
        )}
      </Label>

      {description && (
        <p id={descriptionId} className="text-sm text-muted-foreground">
          {description}
        </p>
      )}

      {React.isValidElement(children)
        ? React.cloneElement(children as React.ReactElement, {
            id,
            "aria-describedby": cn(
              description && descriptionId,
              error && errorId
            ) || undefined,
            "aria-invalid": !!error,
            "aria-required": required,
          })
        : children}

      {error && (
        <p
          id={errorId}
          className="text-sm text-destructive flex items-center gap-1"
          role="alert"
        >
          <AlertCircle className="h-3 w-3" />
          {error}
        </p>
      )}
    </div>
  );
}

interface FileUploadProps {
  files: FileAttachment[];
  onFilesChange: (files: FileAttachment[]) => void;
  maxFileSize: number;
  maxFiles: number;
  allowedFileTypes: string[];
  disabled?: boolean;
}

function FileUpload({
  files,
  onFilesChange,
  maxFileSize,
  maxFiles,
  allowedFileTypes,
  disabled,
}: FileUploadProps) {
  const [isDragOver, setIsDragOver] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    if (!allowedFileTypes.includes(file.type)) {
      return "File type not allowed";
    }
    if (file.size > maxFileSize) {
      return `File size must be less than ${Math.round(maxFileSize / 1024 / 1024)}MB`;
    }
    return null;
  };

  const addFiles = (newFiles: FileList | null) => {
    if (!newFiles) return;

    const remainingSlots = maxFiles - files.length;
    const filesToAdd = Array.from(newFiles).slice(0, remainingSlots);

    const newAttachments: FileAttachment[] = filesToAdd.map((file) => ({
      file,
      id: `${file.name}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      error: validateFile(file) || undefined,
    }));

    onFilesChange([...files, ...newAttachments]);
  };

  const removeFile = (id: string) => {
    onFilesChange(files.filter((f) => f.id !== id));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (!disabled) addFiles(e.dataTransfer.files);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-3">
      <Label>Attachments (optional)</Label>

      {/* Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && inputRef.current?.click()}
        className={cn(
          "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
          isDragOver && "border-primary bg-primary/5",
          disabled && "opacity-50 cursor-not-allowed",
          !isDragOver && !disabled && "hover:border-primary/50"
        )}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={allowedFileTypes.join(",")}
          onChange={(e) => addFiles(e.target.files)}
          className="hidden"
          disabled={disabled || files.length >= maxFiles}
        />
        <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          Drag and drop files here, or click to browse
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Max {maxFiles} files, up to {Math.round(maxFileSize / 1024 / 1024)}MB each
        </p>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <ul className="space-y-2">
          {files.map((attachment) => (
            <li
              key={attachment.id}
              className={cn(
                "flex items-center gap-2 p-2 rounded-md bg-muted/50",
                attachment.error && "bg-destructive/10"
              )}
            >
              <Paperclip className="h-4 w-4 text-muted-foreground shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm truncate">{attachment.file.name}</p>
                <p className={cn(
                  "text-xs",
                  attachment.error ? "text-destructive" : "text-muted-foreground"
                )}>
                  {attachment.error || formatFileSize(attachment.file.size)}
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-6 w-6 shrink-0"
                onClick={() => removeFile(attachment.id)}
                disabled={disabled}
              >
                <X className="h-3 w-3" />
                <span className="sr-only">Remove {attachment.file.name}</span>
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function ContactForm({
  title,
  description,
  subjects = DEFAULT_SUBJECTS,
  onSubmit,
  showCompany = false,
  showPhone = false,
  allowAttachments = false,
  maxFileSize = MAX_FILE_SIZE,
  allowedFileTypes = DEFAULT_FILE_TYPES,
  maxFiles = MAX_FILES,
  successMessage = "Thank you for your message! We'll get back to you soon.",
  resetOnSuccess = true,
  className,
}: ContactFormProps) {
  const [files, setFiles] = React.useState<FileAttachment[]>([]);
  const [submitState, setSubmitState] = React.useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [submitError, setSubmitError] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
      company: "",
      phone: "",
    },
  });

  const handleFormSubmit = async (data: ContactFormData) => {
    setSubmitState("loading");
    setSubmitError(null);

    // Filter out files with errors
    const validFiles = files
      .filter((f) => !f.error)
      .map((f) => f.file);

    try {
      await onSubmit(data, validFiles.length > 0 ? validFiles : undefined);
      setSubmitState("success");

      if (resetOnSuccess) {
        reset();
        setFiles([]);
      }
    } catch (error) {
      setSubmitState("error");
      setSubmitError(
        error instanceof Error
          ? error.message
          : "An error occurred. Please try again."
      );
    }
  };

  const isLoading = submitState === "loading" || isSubmitting;

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      {(title || description) && (
        <div className="space-y-2">
          {title && (
            <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
          )}
          {description && (
            <p className="text-muted-foreground">{description}</p>
          )}
        </div>
      )}

      {/* Success Message */}
      {submitState === "success" && (
        <Alert className="bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-900">
          <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
          <AlertTitle className="text-green-800 dark:text-green-200">
            Message Sent!
          </AlertTitle>
          <AlertDescription className="text-green-700 dark:text-green-300">
            {successMessage}
          </AlertDescription>
        </Alert>
      )}

      {/* Error Message */}
      {submitState === "error" && submitError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{submitError}</AlertDescription>
        </Alert>
      )}

      {/* Form */}
      <form
        onSubmit={handleSubmit(handleFormSubmit)}
        className="space-y-6"
        noValidate
      >
        {/* Name & Email Row */}
        <div className="grid gap-4 sm:grid-cols-2">
          <FormFieldWrapper
            label="Name"
            error={errors.name?.message}
            required
          >
            <Input
              {...register("name")}
              placeholder="Your name"
              disabled={isLoading}
              autoComplete="name"
            />
          </FormFieldWrapper>

          <FormFieldWrapper
            label="Email"
            error={errors.email?.message}
            required
          >
            <Input
              {...register("email")}
              type="email"
              placeholder="you@example.com"
              disabled={isLoading}
              autoComplete="email"
            />
          </FormFieldWrapper>
        </div>

        {/* Optional: Company & Phone Row */}
        {(showCompany || showPhone) && (
          <div className="grid gap-4 sm:grid-cols-2">
            {showCompany && (
              <FormFieldWrapper
                label="Company"
                error={errors.company?.message}
              >
                <Input
                  {...register("company")}
                  placeholder="Your company (optional)"
                  disabled={isLoading}
                  autoComplete="organization"
                />
              </FormFieldWrapper>
            )}

            {showPhone && (
              <FormFieldWrapper
                label="Phone"
                error={errors.phone?.message}
              >
                <Input
                  {...register("phone")}
                  type="tel"
                  placeholder="Your phone number (optional)"
                  disabled={isLoading}
                  autoComplete="tel"
                />
              </FormFieldWrapper>
            )}
          </div>
        )}

        {/* Subject */}
        <FormFieldWrapper
          label="Subject"
          error={errors.subject?.message}
          required
        >
          <Controller
            name="subject"
            control={control}
            render={({ field }) => (
              <Select
                onValueChange={field.onChange}
                value={field.value}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </FormFieldWrapper>

        {/* Message */}
        <FormFieldWrapper
          label="Message"
          error={errors.message?.message}
          description="Please describe your inquiry in detail"
          required
        >
          <Textarea
            {...register("message")}
            placeholder="How can we help you?"
            rows={5}
            disabled={isLoading}
            className="resize-none"
          />
        </FormFieldWrapper>

        {/* File Attachments */}
        {allowAttachments && (
          <FileUpload
            files={files}
            onFilesChange={setFiles}
            maxFileSize={maxFileSize}
            maxFiles={maxFiles}
            allowedFileTypes={allowedFileTypes}
            disabled={isLoading}
          />
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isLoading}
          className="w-full sm:w-auto"
          size="lg"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Send className="mr-2 h-4 w-4" />
              Send Message
            </>
          )}
        </Button>
      </form>
    </div>
  );
}
```

### Key Implementation Notes

1. **Zod Schema Validation**: Comprehensive validation with custom error messages
2. **React Hook Form Integration**: Uses `zodResolver` for seamless validation
3. **File Upload**: Drag-and-drop with file type and size validation
4. **State Management**: Tracks loading, success, and error states
5. **Accessibility**: Proper ARIA attributes, labels, and error announcements

## Variants

### Basic Contact Form

```tsx
<ContactForm
  onSubmit={async (data) => {
    await sendContactEmail(data);
  }}
/>
```

### With Title and Description

```tsx
<ContactForm
  title="Get in Touch"
  description="Have a question? We'd love to hear from you."
  onSubmit={handleSubmit}
/>
```

### With All Fields

```tsx
<ContactForm
  title="Contact Sales"
  description="Our team will respond within 24 hours."
  onSubmit={handleSubmit}
  showCompany
  showPhone
  allowAttachments
/>
```

### Custom Subjects

```tsx
<ContactForm
  subjects={[
    { value: "billing", label: "Billing Question" },
    { value: "technical", label: "Technical Issue" },
    { value: "partnership", label: "Partnership Inquiry" },
    { value: "press", label: "Press & Media" },
  ]}
  onSubmit={handleSubmit}
/>
```

### With Custom File Settings

```tsx
<ContactForm
  allowAttachments
  maxFiles={3}
  maxFileSize={5 * 1024 * 1024} // 5MB
  allowedFileTypes={["image/jpeg", "image/png", "application/pdf"]}
  onSubmit={handleSubmit}
/>
```

## States

| State | Visual | Button | Fields |
|-------|--------|--------|--------|
| Idle | Default styling | "Send Message" | Enabled |
| Loading | Spinner visible | "Sending..." + disabled | Disabled |
| Success | Green alert shown | Reset to default | Cleared (if resetOnSuccess) |
| Error | Red alert shown | Default | Enabled |

## Accessibility

### Required ARIA Attributes

- Labels linked to inputs via `htmlFor`
- Required fields marked with asterisk and `aria-required`
- Error messages with `aria-invalid` and `role="alert"`
- Description linked via `aria-describedby`

### Keyboard Navigation

| Key | Action |
|-----|--------|
| `Tab` | Navigate fields |
| `Shift+Tab` | Navigate backwards |
| `Enter` | Submit form (when focused on button) |
| `Space` | Open select dropdowns |
| `Arrow keys` | Navigate select options |

### Screen Reader Announcements

- Field labels announced on focus
- Required state announced
- Error messages announced immediately via live region
- Success/error alerts announced when they appear

## Dependencies

```json
{
  "dependencies": {
    "react-hook-form": "^7.53.0",
    "@hookform/resolvers": "^3.9.0",
    "zod": "^3.23.0",
    "lucide-react": "^0.460.0"
  }
}
```

### Installation

```bash
npm install react-hook-form @hookform/resolvers zod lucide-react
```

## Examples

### Contact Page

```tsx
import { ContactForm } from "@/components/organisms/contact-form";

export default function ContactPage() {
  const handleSubmit = async (data, files) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value) formData.append(key, value);
    });
    files?.forEach((file) => formData.append("attachments", file));

    const response = await fetch("/api/contact", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Failed to send message");
    }
  };

  return (
    <div className="container max-w-2xl py-12">
      <ContactForm
        title="Contact Us"
        description="Fill out the form below and we'll get back to you as soon as possible."
        onSubmit={handleSubmit}
        showCompany
        allowAttachments
      />
    </div>
  );
}
```

### Support Request Form

```tsx
import { ContactForm } from "@/components/organisms/contact-form";

const supportSubjects = [
  { value: "bug", label: "Report a Bug" },
  { value: "feature", label: "Feature Request" },
  { value: "account", label: "Account Issue" },
  { value: "billing", label: "Billing Question" },
];

export function SupportForm() {
  return (
    <ContactForm
      title="Submit a Support Request"
      description="Please provide as much detail as possible to help us assist you."
      subjects={supportSubjects}
      onSubmit={async (data, files) => {
        await createSupportTicket(data, files);
      }}
      allowAttachments
      maxFiles={10}
      successMessage="Your support ticket has been created. Check your email for the ticket number."
    />
  );
}
```

### Embedded in Card

```tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ContactForm } from "@/components/organisms/contact-form";

export function ContactCard() {
  return (
    <Card className="max-w-xl mx-auto">
      <CardHeader>
        <CardTitle>Quick Contact</CardTitle>
      </CardHeader>
      <CardContent>
        <ContactForm
          onSubmit={handleSubmit}
          resetOnSuccess
        />
      </CardContent>
    </Card>
  );
}
```

### Sales Inquiry with Custom Validation

```tsx
import { ContactForm } from "@/components/organisms/contact-form";

export function SalesInquiryForm() {
  return (
    <ContactForm
      title="Talk to Sales"
      description="Interested in our enterprise plan? Let's chat."
      subjects={[
        { value: "demo", label: "Request a Demo" },
        { value: "pricing", label: "Pricing Question" },
        { value: "enterprise", label: "Enterprise Solutions" },
      ]}
      showCompany
      showPhone
      onSubmit={async (data) => {
        await submitToHubspot(data);
      }}
      successMessage="Thanks! A sales representative will contact you within 1 business day."
    />
  );
}
```

## Anti-patterns

### Missing Error Handling

```tsx
// Bad - no error handling
<ContactForm
  onSubmit={async (data) => {
    await fetch("/api/contact", { body: JSON.stringify(data) });
  }}
/>

// Good - proper error handling
<ContactForm
  onSubmit={async (data) => {
    const res = await fetch("/api/contact", {
      method: "POST",
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      throw new Error("Failed to send message");
    }
  }}
/>
```

### Ignoring Loading State

```tsx
// Bad - allows multiple submissions
function MyForm() {
  return <button onClick={submitForm}>Send</button>;
}

// Good - ContactForm handles loading state automatically
<ContactForm onSubmit={handleSubmit} />
```

### No Success Feedback

```tsx
// Bad - user doesn't know if submission worked
<form onSubmit={handleSubmit}>
  <button type="submit">Send</button>
</form>

// Good - clear success message
<ContactForm
  onSubmit={handleSubmit}
  successMessage="Your message has been sent successfully!"
/>
```

### Inconsistent Validation

```tsx
// Bad - mixing client and server validation styles
const validate = (data) => {
  if (!data.email.includes("@")) return "Bad email";
  // Server returns different error format
};

// Good - use Zod schema for consistent validation
const schema = z.object({
  email: z.string().email("Please enter a valid email"),
});
```

## Related Skills

### Composes From
- [molecules/form-field](../molecules/form-field.md) - Form field wrapper with label and error
- [atoms/button](../atoms/button.md) - Submit button
- [atoms/input](../atoms/input.md) - Text inputs
- [atoms/textarea](../atoms/textarea.md) - Message textarea
- [atoms/select](../atoms/select.md) - Subject dropdown

### Composes Into
- [templates/contact-page](../templates/contact-page.md) - Full contact page template
- [templates/support-page](../templates/support-page.md) - Support request page

### Alternatives
- [organisms/auth-form](./auth-form.md) - For login/signup forms
- [organisms/newsletter-form](./newsletter-form.md) - For email subscriptions
- Custom form with react-hook-form - For highly specialized forms

---

## Changelog

### 2.1.0 (2025-01-18)
- Added complete TypeScript implementation
- Added formula and composition diagram
- Added file upload with drag-and-drop support
- Added loading, success, and error states
- Added Zod validation schema
- Added react-hook-form integration
- Added comprehensive accessibility support
- Added anti-patterns section
- Added multiple usage examples

### 2.0.0 (2025-01-17)
- Standardized to atomic design system v2
- Updated frontmatter schema
- Added explicit composition references

### 1.0.0 (2025-01-16)
- Initial implementation
- File attachment support
- Department selection
