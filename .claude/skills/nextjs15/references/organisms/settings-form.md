---
id: o-settings-form
name: Settings Form
version: 2.0.0
layer: L3
category: forms
description: User settings form with sections for profile, notifications, and preferences
tags: [settings, profile, preferences, notifications, form]
formula: SettingsForm = (FormField + PasswordInput) + (Button + Input + Switch + Select + Avatar) + Sections
composes:
  - ../molecules/form-field.md
  - ../molecules/password-input.md
dependencies: [react-hook-form, zod, lucide-react, @hookform/resolvers]
performance:
  impact: low
  lcp: low
  cls: low
accessibility:
  wcag: AA
  keyboard: true
  screen-reader: true
---

# Settings Form

## Overview

The Settings Form organism provides a complete user settings interface with sections for profile information, notification preferences, appearance settings, and account management. Features auto-save option, section navigation, and confirmation dialogs for destructive actions.

## When to Use

Use this skill when:
- Building user account settings pages
- Creating preference management interfaces
- Implementing profile editing forms
- Building admin configuration panels

## Composes

- [form-field](../molecules/form-field.md) - Form inputs with labels and validation
- [password-input](../molecules/password-input.md) - Password change fields
- [button](../atoms/button.md) - Form actions
- [input](../atoms/input.md) - Text inputs
- [switch](../atoms/switch.md) - Toggle preferences
- [select](../atoms/select.md) - Dropdown selections
- [avatar](../atoms/avatar.md) - Profile image display

## Composition Diagram

```
+------------------------------------------------------------------+
|                        SettingsForm                              |
|  +------------------------------------------------------------+  |
|  |                    ProfileSection                          |  |
|  |  +------------------+  +-------------------------------+   |  |
|  |  |     Avatar       |  |        FormField (Name)       |   |  |
|  |  |  +------------+  |  |  +-------------------------+  |   |  |
|  |  |  |   Image    |  |  |  |    Input (fullName)     |  |   |  |
|  |  |  +------------+  |  |  +-------------------------+  |   |  |
|  |  |  | UploadBtn  |  |  +-------------------------------+   |  |
|  |  +------------------+  +-------------------------------+   |  |
|  |                        |      FormField (Email)        |   |  |
|  |                        |  +-------------------------+  |   |  |
|  |                        |  |    Input (email)        |  |   |  |
|  |                        +-------------------------------+   |  |
|  |                        +-------------------------------+   |  |
|  |                        |      FormField (Bio)          |   |  |
|  |                        |  +-------------------------+  |   |  |
|  |                        |  |    Textarea (bio)       |  |   |  |
|  |                        +-------------------------------+   |  |
|  +------------------------------------------------------------+  |
|                                                                  |
|  +------------------------------------------------------------+  |
|  |                NotificationsSection                        |  |
|  |  +------------------------------------------------------+  |  |
|  |  |  NotificationRow: emailNotifications                 |  |  |
|  |  |  +--------+  +-----------------------------------+   |  |  |
|  |  |  | Switch |  | Label + Description               |   |  |  |
|  |  |  +--------+  +-----------------------------------+   |  |  |
|  |  +------------------------------------------------------+  |  |
|  |  +------------------------------------------------------+  |  |
|  |  |  NotificationRow: pushNotifications                  |  |  |
|  |  |  +--------+  +-----------------------------------+   |  |  |
|  |  |  | Switch |  | Label + Description               |   |  |  |
|  |  |  +--------+  +-----------------------------------+   |  |  |
|  |  +------------------------------------------------------+  |  |
|  |  +------------------------------------------------------+  |  |
|  |  |  NotificationRow: marketingEmails                    |  |  |
|  |  |  +--------+  +-----------------------------------+   |  |  |
|  |  |  | Switch |  | Label + Description               |   |  |  |
|  |  |  +--------+  +-----------------------------------+   |  |  |
|  |  +------------------------------------------------------+  |  |
|  |  +------------------------------------------------------+  |  |
|  |  |  FormField: digestFrequency                          |  |  |
|  |  |  +------------------------------------------------+  |  |  |
|  |  |  |    Select (daily/weekly/monthly/never)         |  |  |  |
|  |  |  +------------------------------------------------+  |  |  |
|  |  +------------------------------------------------------+  |  |
|  +------------------------------------------------------------+  |
|                                                                  |
|  +------------------------------------------------------------+  |
|  |                   SecuritySection                          |  |
|  |  +------------------------------------------------------+  |  |
|  |  |  FormField: currentPassword                          |  |  |
|  |  |  +------------------------------------------------+  |  |  |
|  |  |  |    PasswordInput (current)                     |  |  |  |
|  |  |  +------------------------------------------------+  |  |  |
|  |  +------------------------------------------------------+  |  |
|  |  +------------------------------------------------------+  |  |
|  |  |  FormField: newPassword                              |  |  |
|  |  |  +------------------------------------------------+  |  |  |
|  |  |  |    PasswordInput (new, with strength)          |  |  |  |
|  |  |  +------------------------------------------------+  |  |  |
|  |  +------------------------------------------------------+  |  |
|  |  +------------------------------------------------------+  |  |
|  |  |  FormField: confirmPassword                          |  |  |
|  |  |  +------------------------------------------------+  |  |  |
|  |  |  |    PasswordInput (confirm)                     |  |  |  |
|  |  |  +------------------------------------------------+  |  |  |
|  |  +------------------------------------------------------+  |  |
|  |  +------------------------------------------------------+  |  |
|  |  |       Button (Change Password)                       |  |  |
|  |  +------------------------------------------------------+  |  |
|  +------------------------------------------------------------+  |
|                                                                  |
|  +------------------------------------------------------------+  |
|  |                     FormActions                            |  |
|  |  +--------------------+  +-----------------------------+   |  |
|  |  |  Button (Cancel)   |  |  Button (Save, primary)     |   |  |
|  |  +--------------------+  +-----------------------------+   |  |
|  +------------------------------------------------------------+  |
+------------------------------------------------------------------+
```

## Implementation

```typescript
// components/organisms/settings-form.tsx
"use client";

import * as React from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  User,
  Bell,
  Shield,
  Camera,
  Loader2,
  Check,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PasswordInput } from "@/components/ui/password-input";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// -----------------------------------------------------------------------------
// Validation Schemas
// -----------------------------------------------------------------------------

const profileSchema = z.object({
  fullName: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters"),
  email: z.string().email("Please enter a valid email address"),
  bio: z.string().max(500, "Bio must be less than 500 characters").optional(),
  avatarUrl: z.string().url().optional().or(z.literal("")),
});

const notificationSchema = z.object({
  emailNotifications: z.boolean(),
  pushNotifications: z.boolean(),
  marketingEmails: z.boolean(),
  securityAlerts: z.boolean(),
  digestFrequency: z.enum(["daily", "weekly", "monthly", "never"]),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain an uppercase letter")
      .regex(/[a-z]/, "Password must contain a lowercase letter")
      .regex(/\d/, "Password must contain a number"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

const settingsSchema = z.object({
  profile: profileSchema,
  notifications: notificationSchema,
});

type ProfileFormData = z.infer<typeof profileSchema>;
type NotificationFormData = z.infer<typeof notificationSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;
type SettingsFormData = z.infer<typeof settingsSchema>;

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

interface SettingsFormProps {
  /** Initial profile values */
  defaultValues?: Partial<SettingsFormData>;
  /** Called when settings are saved */
  onSubmit: (data: SettingsFormData) => Promise<void>;
  /** Called when avatar is uploaded */
  onAvatarUpload?: (file: File) => Promise<string>;
  /** Called when password is changed */
  onPasswordChange?: (data: PasswordFormData) => Promise<void>;
  /** Enable auto-save on field blur */
  autoSave?: boolean;
  /** Auto-save debounce delay in ms */
  autoSaveDelay?: number;
  /** Show success toast */
  showToast?: (message: string) => void;
  /** Additional class names */
  className?: string;
}

interface SectionProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  children: React.ReactNode;
}

interface NotificationRowProps {
  id: string;
  label: string;
  description: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
}

// -----------------------------------------------------------------------------
// Sub-components
// -----------------------------------------------------------------------------

function Section({ icon, title, description, children }: SectionProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            {icon}
          </div>
          <div>
            <CardTitle className="text-lg">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function NotificationRow({
  id,
  label,
  description,
  checked,
  onCheckedChange,
  disabled = false,
}: NotificationRowProps) {
  return (
    <div className="flex items-center justify-between py-3">
      <div className="space-y-0.5">
        <Label
          htmlFor={id}
          className={cn(
            "text-sm font-medium",
            disabled && "cursor-not-allowed opacity-70"
          )}
        >
          {label}
        </Label>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <Switch
        id={id}
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        aria-describedby={`${id}-description`}
      />
    </div>
  );
}

function FormField({
  label,
  description,
  error,
  required,
  children,
  className,
}: {
  label: string;
  description?: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  const id = React.useId();
  const descriptionId = `${id}-description`;
  const errorId = `${id}-error`;

  const enhancedChild = React.isValidElement(children)
    ? React.cloneElement(children as React.ReactElement, {
        id,
        "aria-describedby":
          cn(description && descriptionId, error && errorId) || undefined,
        "aria-invalid": !!error,
        "aria-required": required,
      })
    : children;

  return (
    <div className={cn("space-y-2", className)}>
      <Label
        htmlFor={id}
        className={cn(
          "text-sm font-medium",
          error && "text-destructive"
        )}
      >
        {label}
        {required && (
          <span className="ml-1 text-destructive" aria-hidden="true">
            *
          </span>
        )}
      </Label>
      {description && (
        <p id={descriptionId} className="text-sm text-muted-foreground">
          {description}
        </p>
      )}
      {enhancedChild}
      {error && (
        <p
          id={errorId}
          className="flex items-center gap-1 text-sm text-destructive"
          role="alert"
        >
          <AlertCircle className="h-3 w-3" />
          {error}
        </p>
      )}
    </div>
  );
}

// -----------------------------------------------------------------------------
// Main Component
// -----------------------------------------------------------------------------

export function SettingsForm({
  defaultValues,
  onSubmit,
  onAvatarUpload,
  onPasswordChange,
  autoSave = false,
  autoSaveDelay = 2000,
  showToast,
  className,
}: SettingsFormProps) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = React.useState(false);
  const [isChangingPassword, setIsChangingPassword] = React.useState(false);
  const [saveStatus, setSaveStatus] = React.useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");
  const autoSaveTimeoutRef = React.useRef<NodeJS.Timeout>();

  // Main settings form
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      profile: {
        fullName: "",
        email: "",
        bio: "",
        avatarUrl: "",
        ...defaultValues?.profile,
      },
      notifications: {
        emailNotifications: true,
        pushNotifications: true,
        marketingEmails: false,
        securityAlerts: true,
        digestFrequency: "weekly",
        ...defaultValues?.notifications,
      },
    },
  });

  // Password change form (separate)
  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPassword,
    formState: { errors: passwordErrors },
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const avatarUrl = watch("profile.avatarUrl");
  const fullName = watch("profile.fullName");

  // Auto-save functionality
  React.useEffect(() => {
    if (!autoSave || !isDirty) return;

    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    autoSaveTimeoutRef.current = setTimeout(() => {
      handleSubmit(handleFormSubmit)();
    }, autoSaveDelay);

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [autoSave, isDirty, autoSaveDelay]);

  // Avatar upload handler
  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file || !onAvatarUpload) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      showToast?.("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showToast?.("Image must be less than 5MB");
      return;
    }

    setIsUploadingAvatar(true);
    try {
      const newUrl = await onAvatarUpload(file);
      setValue("profile.avatarUrl", newUrl, { shouldDirty: true });
      showToast?.("Avatar updated successfully");
    } catch (error) {
      showToast?.("Failed to upload avatar");
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  // Form submission
  const handleFormSubmit = async (data: SettingsFormData) => {
    setIsSubmitting(true);
    setSaveStatus("saving");
    try {
      await onSubmit(data);
      setSaveStatus("saved");
      showToast?.("Settings saved successfully");
      setTimeout(() => setSaveStatus("idle"), 2000);
    } catch (error) {
      setSaveStatus("error");
      showToast?.("Failed to save settings");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Password change submission
  const handlePasswordChangeSubmit = async (data: PasswordFormData) => {
    if (!onPasswordChange) return;

    setIsChangingPassword(true);
    try {
      await onPasswordChange(data);
      resetPassword();
      showToast?.("Password changed successfully");
    } catch (error) {
      showToast?.("Failed to change password");
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Get avatar initials
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className={cn("space-y-6", className)}>
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        {/* Profile Section */}
        <Section
          icon={<User className="h-5 w-5" />}
          title="Profile"
          description="Manage your personal information and public profile"
        >
          <div className="space-y-6">
            {/* Avatar */}
            <div className="flex items-center gap-6">
              <div className="relative">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={avatarUrl} alt={fullName || "Avatar"} />
                  <AvatarFallback className="text-lg">
                    {fullName ? getInitials(fullName) : "?"}
                  </AvatarFallback>
                </Avatar>
                <button
                  type="button"
                  onClick={handleAvatarClick}
                  disabled={isUploadingAvatar || !onAvatarUpload}
                  className={cn(
                    "absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center",
                    "rounded-full border-2 border-background bg-primary text-primary-foreground",
                    "transition-colors hover:bg-primary/90",
                    "disabled:cursor-not-allowed disabled:opacity-50"
                  )}
                  aria-label="Upload new avatar"
                >
                  {isUploadingAvatar ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Camera className="h-4 w-4" />
                  )}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="sr-only"
                  aria-label="Avatar file input"
                />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Profile Photo</p>
                <p className="text-sm text-muted-foreground">
                  Click the camera icon to upload a new photo
                </p>
              </div>
            </div>

            <Separator />

            {/* Name */}
            <FormField
              label="Full Name"
              error={errors.profile?.fullName?.message}
              required
            >
              <Input
                {...register("profile.fullName")}
                placeholder="Enter your full name"
              />
            </FormField>

            {/* Email */}
            <FormField
              label="Email"
              description="This is the email associated with your account"
              error={errors.profile?.email?.message}
              required
            >
              <Input
                {...register("profile.email")}
                type="email"
                placeholder="you@example.com"
              />
            </FormField>

            {/* Bio */}
            <FormField
              label="Bio"
              description="Brief description for your profile (max 500 characters)"
              error={errors.profile?.bio?.message}
            >
              <Textarea
                {...register("profile.bio")}
                placeholder="Tell us about yourself..."
                rows={4}
                className="resize-none"
              />
            </FormField>
          </div>
        </Section>

        {/* Notifications Section */}
        <Section
          icon={<Bell className="h-5 w-5" />}
          title="Notifications"
          description="Configure how you receive notifications and updates"
        >
          <div className="space-y-1">
            <Controller
              name="notifications.emailNotifications"
              control={control}
              render={({ field }) => (
                <NotificationRow
                  id="email-notifications"
                  label="Email Notifications"
                  description="Receive email notifications for important updates"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
            <Separator />

            <Controller
              name="notifications.pushNotifications"
              control={control}
              render={({ field }) => (
                <NotificationRow
                  id="push-notifications"
                  label="Push Notifications"
                  description="Receive push notifications on your devices"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
            <Separator />

            <Controller
              name="notifications.marketingEmails"
              control={control}
              render={({ field }) => (
                <NotificationRow
                  id="marketing-emails"
                  label="Marketing Emails"
                  description="Receive emails about new features and promotions"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
            <Separator />

            <Controller
              name="notifications.securityAlerts"
              control={control}
              render={({ field }) => (
                <NotificationRow
                  id="security-alerts"
                  label="Security Alerts"
                  description="Get notified about security events and login attempts"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
            <Separator />

            {/* Digest Frequency */}
            <div className="py-3">
              <Controller
                name="notifications.digestFrequency"
                control={control}
                render={({ field }) => (
                  <FormField
                    label="Email Digest Frequency"
                    description="How often would you like to receive email digests?"
                  >
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger className="w-full sm:w-[200px]">
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="never">Never</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormField>
                )}
              />
            </div>
          </div>
        </Section>

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-3">
          {saveStatus === "saved" && (
            <span className="flex items-center gap-1 text-sm text-green-600">
              <Check className="h-4 w-4" />
              Saved
            </span>
          )}
          <Button type="button" variant="outline" disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting || !isDirty}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>
      </form>

      {/* Security Section (separate form) */}
      {onPasswordChange && (
        <form onSubmit={handlePasswordSubmit(handlePasswordChangeSubmit)}>
          <Section
            icon={<Shield className="h-5 w-5" />}
            title="Security"
            description="Update your password and security settings"
          >
            <div className="space-y-4">
              <FormField
                label="Current Password"
                error={passwordErrors.currentPassword?.message}
                required
              >
                <PasswordInput
                  {...registerPassword("currentPassword")}
                  placeholder="Enter your current password"
                  autoComplete="current-password"
                />
              </FormField>

              <FormField
                label="New Password"
                description="Must be at least 8 characters with uppercase, lowercase, and number"
                error={passwordErrors.newPassword?.message}
                required
              >
                <PasswordInput
                  {...registerPassword("newPassword")}
                  placeholder="Enter new password"
                  autoComplete="new-password"
                  showStrength
                />
              </FormField>

              <FormField
                label="Confirm New Password"
                error={passwordErrors.confirmPassword?.message}
                required
              >
                <PasswordInput
                  {...registerPassword("confirmPassword")}
                  placeholder="Confirm new password"
                  autoComplete="new-password"
                />
              </FormField>

              <div className="pt-2">
                <Button type="submit" disabled={isChangingPassword}>
                  {isChangingPassword ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Changing Password...
                    </>
                  ) : (
                    "Change Password"
                  )}
                </Button>
              </div>
            </div>
          </Section>
        </form>
      )}
    </div>
  );
}

// -----------------------------------------------------------------------------
// Exports
// -----------------------------------------------------------------------------

export type {
  SettingsFormProps,
  ProfileFormData,
  NotificationFormData,
  PasswordFormData,
  SettingsFormData,
};
```

### Key Implementation Notes

1. **Section-based Organization**: Uses Card components to visually group related settings
2. **Separate Password Form**: Password change is a separate form for security isolation
3. **Auto-save Support**: Optional debounced auto-save on field changes
4. **Avatar Upload**: File input with validation for type and size
5. **Zod Validation**: Comprehensive schemas for all form sections

## Variants

### Full Settings Form

```tsx
<SettingsForm
  defaultValues={currentSettings}
  onSubmit={updateSettings}
  onAvatarUpload={uploadAvatar}
  onPasswordChange={changePassword}
  showToast={toast}
/>
```

### Auto-save Settings

```tsx
<SettingsForm
  defaultValues={currentSettings}
  onSubmit={updateSettings}
  autoSave
  autoSaveDelay={2000}
  showToast={toast}
/>
```

### Profile Only

```tsx
<SettingsForm
  defaultValues={{ profile: userData }}
  onSubmit={updateProfile}
  onAvatarUpload={uploadAvatar}
  // No onPasswordChange = no security section
/>
```

### With Custom Toast

```tsx
import { toast } from "sonner";

<SettingsForm
  defaultValues={currentSettings}
  onSubmit={updateSettings}
  showToast={(message) => toast.success(message)}
/>;
```

## States

| State | Indicator | Actions | Form |
|-------|-----------|---------|------|
| Idle | None | All enabled | Editable |
| Dirty | None | Save enabled | Editable |
| Saving | Spinner | Disabled | Disabled |
| Saved | Checkmark | All enabled | Editable |
| Error | Alert | All enabled | Editable |
| Uploading | Spinner on avatar | Avatar disabled | Editable |

## Accessibility

### Required Attributes

- Labels linked to all inputs via `htmlFor` and `id`
- Switch components with proper labels and `aria-describedby`
- Error messages with `role="alert"`
- Required fields marked with `aria-required`
- Form sections in Card components with headings

### Keyboard Navigation

| Key | Action |
|-----|--------|
| `Tab` | Navigate between sections and fields |
| `Space` | Toggle switches |
| `Enter` | Submit form / activate buttons |
| `Arrow keys` | Navigate within select dropdowns |
| `Escape` | Close select dropdowns |

### Screen Reader Announcements

- Section titles read with heading hierarchy
- Field labels read when focused
- Error messages announced with role="alert"
- Save status changes announced
- Switch state changes announced

## Dependencies

```json
{
  "dependencies": {
    "react-hook-form": "^7.53.0",
    "@hookform/resolvers": "^3.9.0",
    "zod": "^3.23.0",
    "lucide-react": "^0.460.0",
    "@radix-ui/react-avatar": "^1.1.0",
    "@radix-ui/react-select": "^2.1.0",
    "@radix-ui/react-switch": "^1.1.0",
    "@radix-ui/react-label": "^2.1.0",
    "@radix-ui/react-separator": "^1.1.0"
  }
}
```

### Installation

```bash
npm install react-hook-form @hookform/resolvers zod lucide-react @radix-ui/react-avatar @radix-ui/react-select @radix-ui/react-switch @radix-ui/react-label @radix-ui/react-separator
```

## Examples

### Account Settings Page

```tsx
import { SettingsForm } from "@/components/organisms/settings-form";
import { toast } from "sonner";
import { useCurrentUser, useUpdateUser } from "@/hooks/use-user";

export function AccountSettingsPage() {
  const { user, isLoading } = useCurrentUser();
  const { updateUser, uploadAvatar, changePassword } = useUpdateUser();

  if (isLoading) return <SettingsFormSkeleton />;

  return (
    <div className="container max-w-2xl py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Account Settings</h1>
        <p className="text-muted-foreground">
          Manage your account preferences and security
        </p>
      </div>

      <SettingsForm
        defaultValues={{
          profile: {
            fullName: user.name,
            email: user.email,
            bio: user.bio,
            avatarUrl: user.avatarUrl,
          },
          notifications: user.notificationPreferences,
        }}
        onSubmit={updateUser}
        onAvatarUpload={uploadAvatar}
        onPasswordChange={changePassword}
        showToast={(message) => toast.success(message)}
      />
    </div>
  );
}
```

### With Server Actions

```tsx
// app/settings/page.tsx
import { SettingsForm } from "@/components/organisms/settings-form";
import { updateSettings, uploadAvatar, changePassword } from "./actions";
import { getUser } from "@/lib/auth";

export default async function SettingsPage() {
  const user = await getUser();

  return (
    <SettingsForm
      defaultValues={{
        profile: {
          fullName: user.name,
          email: user.email,
          bio: user.bio || "",
          avatarUrl: user.image || "",
        },
        notifications: user.preferences,
      }}
      onSubmit={updateSettings}
      onAvatarUpload={uploadAvatar}
      onPasswordChange={changePassword}
    />
  );
}

// app/settings/actions.ts
"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";

export async function updateSettings(data: SettingsFormData) {
  await db.user.update({
    where: { id: getCurrentUserId() },
    data: {
      name: data.profile.fullName,
      email: data.profile.email,
      bio: data.profile.bio,
      preferences: data.notifications,
    },
  });
  revalidatePath("/settings");
}
```

### Admin Configuration Panel

```tsx
import { SettingsForm } from "@/components/organisms/settings-form";

export function AdminPanel() {
  return (
    <SettingsForm
      defaultValues={adminSettings}
      onSubmit={updateAdminSettings}
      autoSave
      autoSaveDelay={3000}
      showToast={toast}
    />
  );
}
```

## Anti-patterns

### No Loading States

```tsx
// Bad - no feedback during save
const onSubmit = async (data) => {
  await updateSettings(data);
  // User doesn't know if it worked
};

// Good - use showToast for feedback
<SettingsForm
  onSubmit={updateSettings}
  showToast={(msg) => toast.success(msg)}
/>
```

### Mixing Password in Main Form

```tsx
// Bad - password change mixed with profile
const schema = z.object({
  name: z.string(),
  email: z.string(),
  password: z.string(), // Should be separate
});

// Good - separate forms for different concerns
<SettingsForm
  onSubmit={updateProfile}
  onPasswordChange={changePassword} // Separate handler
/>
```

### No Validation Feedback

```tsx
// Bad - validation errors not shown
<input {...register("email")} />

// Good - errors displayed via FormField
<FormField label="Email" error={errors.email?.message}>
  <Input {...register("email")} />
</FormField>
```

### Destructive Actions Without Confirmation

```tsx
// Bad - immediate deletion
<Button onClick={deleteAccount}>Delete Account</Button>

// Good - use confirmation dialog (see file-uploader pattern)
<DeleteAccountDialog onConfirm={deleteAccount} />
```

## Related Skills

### Composes From
- [molecules/form-field](../molecules/form-field.md) - Form inputs with validation
- [molecules/password-input](../molecules/password-input.md) - Password fields
- [atoms/button](../atoms/button.md) - Action buttons
- [atoms/input](../atoms/input.md) - Text inputs
- [atoms/switch](../atoms/switch.md) - Toggle switches
- [atoms/select](../atoms/select.md) - Dropdown selections
- [atoms/avatar](../atoms/avatar.md) - Profile images

### Composes Into
- [templates/settings-page](../templates/settings-page.md) - Full settings page layout

### Alternatives
- Individual settings components for simpler use cases
- Tabbed settings interface for more sections

---

## Changelog

### 2.1.0 (2025-01-18)
- Complete implementation with all sections
- Added formula and composition diagram
- Added Zod validation schemas
- Added auto-save functionality
- Added avatar upload with file validation
- Added separate password change form
- Added loading and success states
- Added comprehensive accessibility support

### 2.0.0 (2025-01-17)
- Standardized to atomic design system v2
- Updated frontmatter schema
- Added explicit composition references

### 1.0.0 (2025-01-16)
- Initial implementation
- Auto-save support
- Section navigation
