---
id: t-onboarding-layout
name: Onboarding Layout
version: 2.0.0
layer: L4
category: layouts
description: Multi-step onboarding flow layout with progress tracking
tags: [onboarding, wizard, steps, setup, registration]
performance:
  impact: medium
  lcp: medium
  cls: low
formula: "OnboardingLayout = OnboardingFlow(o-onboarding-flow) + MultiStepForm(o-multi-step-form) + Stepper(m-stepper)"
composes:
  - ../organisms/onboarding-flow.md
  - ../organisms/multi-step-form.md
  - ../molecules/stepper.md
dependencies:
  - react
  - next
  - lucide-react
  - framer-motion
accessibility:
  wcag: AA
  keyboard: true
  screen-reader: true
---

# Onboarding Layout

## Overview

A multi-step onboarding layout for user setup flows, featuring progress indicators, step navigation, and persistent state management.

## Composition Diagram

```
+------------------------------------------------------------------+
|                      OnboardingLayout                             |
+------------------------------------------------------------------+
|  +------------------------------------------------------------+  |
|  |                   OnboardingHeader                          |  |
|  |  [Logo]                                    [Skip for now X] |  |
|  +------------------------------------------------------------+  |
|                                                                   |
|  +------------------------------------------------------------+  |
|  |                OnboardingProgress (m-stepper)               |  |
|  |   (1)---------(2)---------(3)---------(4)                   |  |
|  |  Profile    Workspace     Team     Preferences              |  |
|  +------------------------------------------------------------+  |
|                                                                   |
|  +------------------------------------------------------------+  |
|  |              OnboardingFlow (o-onboarding-flow)             |  |
|  |  +--------------------------------------------------------+ |  |
|  |  |          MultiStepForm (o-multi-step-form)             | |  |
|  |  |                                                        | |  |
|  |  |    [Step Title]                                        | |  |
|  |  |    [Step Description]                                  | |  |
|  |  |                                                        | |  |
|  |  |    +------------------------------------------+        | |  |
|  |  |    |           {children} Step Content        |        | |  |
|  |  |    +------------------------------------------+        | |  |
|  |  |                                                        | |  |
|  |  |    [<- Back]                    [Continue ->]          | |  |
|  |  +--------------------------------------------------------+ |  |
|  +------------------------------------------------------------+  |
+------------------------------------------------------------------+
```

## Implementation

### Onboarding Layout

```tsx
// app/onboarding/layout.tsx
import { OnboardingProvider } from '@/components/onboarding/onboarding-provider';
import { OnboardingHeader } from '@/components/onboarding/onboarding-header';
import { OnboardingProgress } from '@/components/onboarding/onboarding-progress';

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <OnboardingProvider>
      <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-gray-950">
        <OnboardingHeader />
        <OnboardingProgress />
        <main className="flex flex-1 flex-col">
          {children}
        </main>
      </div>
    </OnboardingProvider>
  );
}
```

### Onboarding Provider

```tsx
// components/onboarding/onboarding-provider.tsx
'use client';

import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
  useEffect,
} from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface OnboardingData {
  // Step 1: Profile
  name?: string;
  avatar?: string;
  role?: string;
  
  // Step 2: Workspace
  workspaceName?: string;
  workspaceUrl?: string;
  
  // Step 3: Team
  teamMembers?: { email: string; role: string }[];
  
  // Step 4: Preferences
  theme?: 'light' | 'dark' | 'system';
  notifications?: boolean;
  newsletter?: boolean;
}

interface OnboardingContextValue {
  currentStep: number;
  totalSteps: number;
  data: OnboardingData;
  updateData: (updates: Partial<OnboardingData>) => void;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: number) => void;
  canGoNext: boolean;
  canGoPrev: boolean;
  isComplete: boolean;
  completeOnboarding: () => Promise<void>;
}

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within OnboardingProvider');
  }
  return context;
}

const steps = [
  { path: '/onboarding/profile', name: 'Profile' },
  { path: '/onboarding/workspace', name: 'Workspace' },
  { path: '/onboarding/team', name: 'Team' },
  { path: '/onboarding/preferences', name: 'Preferences' },
];

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [data, setData] = useState<OnboardingData>({});
  const [isComplete, setIsComplete] = useState(false);

  const currentStep = steps.findIndex((step) => step.path === pathname) + 1 || 1;
  const totalSteps = steps.length;

  // Load saved data from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('onboarding-data');
    if (saved) {
      setData(JSON.parse(saved));
    }
  }, []);

  // Save data to localStorage
  useEffect(() => {
    localStorage.setItem('onboarding-data', JSON.stringify(data));
  }, [data]);

  const updateData = useCallback((updates: Partial<OnboardingData>) => {
    setData((prev) => ({ ...prev, ...updates }));
  }, []);

  const nextStep = useCallback(() => {
    if (currentStep < totalSteps) {
      router.push(steps[currentStep].path);
    }
  }, [currentStep, totalSteps, router]);

  const prevStep = useCallback(() => {
    if (currentStep > 1) {
      router.push(steps[currentStep - 2].path);
    }
  }, [currentStep, router]);

  const goToStep = useCallback(
    (step: number) => {
      if (step >= 1 && step <= totalSteps) {
        router.push(steps[step - 1].path);
      }
    },
    [totalSteps, router]
  );

  const completeOnboarding = useCallback(async () => {
    try {
      await fetch('/api/onboarding/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      localStorage.removeItem('onboarding-data');
      setIsComplete(true);
      router.push('/dashboard');
    } catch (error) {
      console.error('Failed to complete onboarding:', error);
    }
  }, [data, router]);

  return (
    <OnboardingContext.Provider
      value={{
        currentStep,
        totalSteps,
        data,
        updateData,
        nextStep,
        prevStep,
        goToStep,
        canGoNext: currentStep < totalSteps,
        canGoPrev: currentStep > 1,
        isComplete,
        completeOnboarding,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
}
```

### Onboarding Header

```tsx
// components/onboarding/onboarding-header.tsx
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { X } from 'lucide-react';

export function OnboardingHeader() {
  return (
    <header className="border-b border-gray-200 bg-white px-4 py-4 dark:border-gray-800 dark:bg-gray-900">
      <div className="mx-auto flex max-w-3xl items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/logo.svg"
            alt="Logo"
            width={32}
            height={32}
            className="h-8 w-8"
          />
          <span className="text-lg font-bold text-gray-900 dark:text-white">
            Company
          </span>
        </Link>

        <Link
          href="/dashboard"
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
        >
          <span>Skip for now</span>
          <X className="h-4 w-4" />
        </Link>
      </div>
    </header>
  );
}
```

### Onboarding Progress

```tsx
// components/onboarding/onboarding-progress.tsx
'use client';

import { Check } from 'lucide-react';
import { useOnboarding } from './onboarding-provider';
import { cn } from '@/lib/utils';

const steps = [
  { id: 1, name: 'Profile', description: 'Your basic information' },
  { id: 2, name: 'Workspace', description: 'Create your workspace' },
  { id: 3, name: 'Team', description: 'Invite team members' },
  { id: 4, name: 'Preferences', description: 'Customize your experience' },
];

export function OnboardingProgress() {
  const { currentStep, goToStep } = useOnboarding();

  return (
    <nav
      aria-label="Onboarding progress"
      className="border-b border-gray-200 bg-white px-4 py-6 dark:border-gray-800 dark:bg-gray-900"
    >
      <ol className="mx-auto flex max-w-3xl items-center justify-between">
        {steps.map((step, index) => {
          const isActive = step.id === currentStep;
          const isCompleted = step.id < currentStep;

          return (
            <li key={step.id} className="flex items-center">
              <button
                onClick={() => isCompleted && goToStep(step.id)}
                disabled={!isCompleted && !isActive}
                className={cn(
                  'group flex flex-col items-center',
                  isCompleted && 'cursor-pointer'
                )}
              >
                {/* Step Circle */}
                <div
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors',
                    isCompleted &&
                      'border-green-500 bg-green-500 text-white',
                    isActive &&
                      'border-blue-600 bg-blue-600 text-white',
                    !isCompleted &&
                      !isActive &&
                      'border-gray-300 bg-white text-gray-500 dark:border-gray-600 dark:bg-gray-800'
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <span className="text-sm font-semibold">{step.id}</span>
                  )}
                </div>

                {/* Step Label */}
                <div className="mt-2 hidden text-center sm:block">
                  <p
                    className={cn(
                      'text-sm font-medium',
                      isActive
                        ? 'text-blue-600 dark:text-blue-400'
                        : isCompleted
                        ? 'text-gray-900 dark:text-white'
                        : 'text-gray-500 dark:text-gray-400'
                    )}
                  >
                    {step.name}
                  </p>
                  <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-500">
                    {step.description}
                  </p>
                </div>
              </button>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    'mx-4 h-0.5 w-12 sm:w-24',
                    step.id < currentStep
                      ? 'bg-green-500'
                      : 'bg-gray-200 dark:bg-gray-700'
                  )}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
```

### Onboarding Step Container

```tsx
// components/onboarding/onboarding-step.tsx
'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import { useOnboarding } from './onboarding-provider';

interface OnboardingStepProps {
  title: string;
  description: string;
  children: ReactNode;
  onSubmit?: () => Promise<void> | void;
  isValid?: boolean;
  isLoading?: boolean;
  nextLabel?: string;
  showSkip?: boolean;
}

export function OnboardingStep({
  title,
  description,
  children,
  onSubmit,
  isValid = true,
  isLoading = false,
  nextLabel = 'Continue',
  showSkip = false,
}: OnboardingStepProps) {
  const { currentStep, totalSteps, nextStep, prevStep, canGoPrev, completeOnboarding } =
    useOnboarding();

  const isLastStep = currentStep === totalSteps;

  const handleNext = async () => {
    if (onSubmit) {
      await onSubmit();
    }
    if (isLastStep) {
      await completeOnboarding();
    } else {
      nextStep();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex flex-1 flex-col"
    >
      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 py-12">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {title}
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">{description}</p>
        </div>

        {/* Content */}
        <div className="flex-1">{children}</div>

        {/* Footer */}
        <div className="mt-8 flex items-center justify-between">
          <div>
            {canGoPrev && (
              <button
                onClick={prevStep}
                className="flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            {showSkip && (
              <button
                onClick={nextStep}
                className="rounded-lg px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
              >
                Skip this step
              </button>
            )}

            <button
              onClick={handleNext}
              disabled={!isValid || isLoading}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  {isLastStep ? 'Complete Setup' : nextLabel}
                  {!isLastStep && <ArrowRight className="h-4 w-4" />}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
```

### Profile Step

```tsx
// app/onboarding/profile/page.tsx
'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { Camera, User } from 'lucide-react';
import { OnboardingStep } from '@/components/onboarding/onboarding-step';
import { useOnboarding } from '@/components/onboarding/onboarding-provider';

const roles = [
  { id: 'developer', name: 'Developer', description: 'Building software' },
  { id: 'designer', name: 'Designer', description: 'Creating interfaces' },
  { id: 'manager', name: 'Manager', description: 'Leading teams' },
  { id: 'other', name: 'Other', description: 'Something else' },
];

export default function ProfileStep() {
  const { data, updateData } = useOnboarding();
  const [name, setName] = useState(data.name || '');
  const [role, setRole] = useState(data.role || '');
  const [avatar, setAvatar] = useState(data.avatar || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatar(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    updateData({ name, role, avatar });
  };

  const isValid = name.trim().length >= 2 && role;

  return (
    <OnboardingStep
      title="Tell us about yourself"
      description="Let's personalize your experience"
      onSubmit={handleSubmit}
      isValid={isValid}
    >
      <div className="space-y-8">
        {/* Avatar Upload */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
              {avatar ? (
                <Image
                  src={avatar}
                  alt="Avatar"
                  width={96}
                  height={96}
                  className="h-full w-full object-cover"
                />
              ) : (
                <User className="h-12 w-12 text-gray-400" />
              )}
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-1 -right-1 rounded-full bg-blue-600 p-2 text-white shadow-lg hover:bg-blue-700"
            >
              <Camera className="h-4 w-4" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />
          </div>
        </div>

        {/* Name Input */}
        <div>
          <label
            htmlFor="name"
            className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
          >
            Full Name
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your full name"
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400"
          />
        </div>

        {/* Role Selection */}
        <div>
          <label className="mb-3 block text-sm font-medium text-gray-900 dark:text-white">
            What best describes your role?
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            {roles.map((r) => (
              <button
                key={r.id}
                onClick={() => setRole(r.id)}
                className={`flex flex-col items-start rounded-lg border p-4 text-left transition-colors ${
                  role === r.id
                    ? 'border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-900/20'
                    : 'border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600'
                }`}
              >
                <span
                  className={`font-medium ${
                    role === r.id
                      ? 'text-blue-700 dark:text-blue-400'
                      : 'text-gray-900 dark:text-white'
                  }`}
                >
                  {r.name}
                </span>
                <span className="mt-1 text-sm text-gray-500">{r.description}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </OnboardingStep>
  );
}
```

### Workspace Step

```tsx
// app/onboarding/workspace/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Building2, Globe, Check, X } from 'lucide-react';
import { OnboardingStep } from '@/components/onboarding/onboarding-step';
import { useOnboarding } from '@/components/onboarding/onboarding-provider';
import { useDebouncedCallback } from 'use-debounce';

export default function WorkspaceStep() {
  const { data, updateData } = useOnboarding();
  const [workspaceName, setWorkspaceName] = useState(data.workspaceName || '');
  const [workspaceUrl, setWorkspaceUrl] = useState(data.workspaceUrl || '');
  const [urlStatus, setUrlStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');

  const checkUrlAvailability = useDebouncedCallback(async (url: string) => {
    if (url.length < 3) {
      setUrlStatus('idle');
      return;
    }

    setUrlStatus('checking');
    try {
      const res = await fetch(`/api/workspaces/check-url?url=${url}`);
      const { available } = await res.json();
      setUrlStatus(available ? 'available' : 'taken');
    } catch {
      setUrlStatus('idle');
    }
  }, 500);

  useEffect(() => {
    if (workspaceUrl) {
      checkUrlAvailability(workspaceUrl);
    }
  }, [workspaceUrl, checkUrlAvailability]);

  // Auto-generate URL from name
  const handleNameChange = (name: string) => {
    setWorkspaceName(name);
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    setWorkspaceUrl(slug);
  };

  const handleSubmit = () => {
    updateData({ workspaceName, workspaceUrl });
  };

  const isValid = workspaceName.trim().length >= 2 && urlStatus === 'available';

  return (
    <OnboardingStep
      title="Create your workspace"
      description="Your team's home base"
      onSubmit={handleSubmit}
      isValid={isValid}
    >
      <div className="space-y-6">
        {/* Workspace Name */}
        <div>
          <label
            htmlFor="workspace-name"
            className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
          >
            Workspace Name
          </label>
          <div className="relative">
            <Building2 className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              id="workspace-name"
              type="text"
              value={workspaceName}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Acme Inc."
              className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-4 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
          </div>
        </div>

        {/* Workspace URL */}
        <div>
          <label
            htmlFor="workspace-url"
            className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
          >
            Workspace URL
          </label>
          <div className="relative">
            <Globe className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              id="workspace-url"
              type="text"
              value={workspaceUrl}
              onChange={(e) => setWorkspaceUrl(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
              placeholder="acme"
              className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-32 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
              .app.com
            </span>
          </div>

          {/* URL Status */}
          {urlStatus !== 'idle' && (
            <div className="mt-2 flex items-center gap-2 text-sm">
              {urlStatus === 'checking' && (
                <span className="text-gray-500">Checking availability...</span>
              )}
              {urlStatus === 'available' && (
                <>
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="text-green-600">URL is available</span>
                </>
              )}
              {urlStatus === 'taken' && (
                <>
                  <X className="h-4 w-4 text-red-500" />
                  <span className="text-red-600">URL is already taken</span>
                </>
              )}
            </div>
          )}
        </div>

        {/* Preview */}
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Your workspace will be available at:
          </p>
          <p className="mt-1 font-mono text-sm text-gray-900 dark:text-white">
            https://{workspaceUrl || 'your-workspace'}.app.com
          </p>
        </div>
      </div>
    </OnboardingStep>
  );
}
```

### Team Step

```tsx
// app/onboarding/team/page.tsx
'use client';

import { useState } from 'react';
import { Plus, X, Mail, UserPlus } from 'lucide-react';
import { OnboardingStep } from '@/components/onboarding/onboarding-step';
import { useOnboarding } from '@/components/onboarding/onboarding-provider';

interface TeamMember {
  email: string;
  role: 'admin' | 'member';
}

export default function TeamStep() {
  const { data, updateData } = useOnboarding();
  const [members, setMembers] = useState<TeamMember[]>(data.teamMembers || []);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'admin' | 'member'>('member');

  const addMember = () => {
    if (email && !members.find((m) => m.email === email)) {
      setMembers([...members, { email, role }]);
      setEmail('');
    }
  };

  const removeMember = (emailToRemove: string) => {
    setMembers(members.filter((m) => m.email !== emailToRemove));
  };

  const handleSubmit = () => {
    updateData({ teamMembers: members });
  };

  return (
    <OnboardingStep
      title="Invite your team"
      description="Collaboration is better together"
      onSubmit={handleSubmit}
      showSkip
    >
      <div className="space-y-6">
        {/* Add Member Form */}
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addMember()}
              placeholder="colleague@company.com"
              className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-4 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
          </div>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as 'admin' | 'member')}
            className="rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          >
            <option value="member">Member</option>
            <option value="admin">Admin</option>
          </select>
          <button
            onClick={addMember}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-white hover:bg-blue-700"
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>

        {/* Member List */}
        {members.length > 0 ? (
          <div className="divide-y divide-gray-200 rounded-lg border border-gray-200 dark:divide-gray-700 dark:border-gray-700">
            {members.map((member) => (
              <div
                key={member.email}
                className="flex items-center justify-between p-4"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                    <UserPlus className="h-5 w-5 text-gray-500" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {member.email}
                    </p>
                    <p className="text-sm capitalize text-gray-500">
                      {member.role}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => removeMember(member.email)}
                  className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border-2 border-dashed border-gray-200 p-8 text-center dark:border-gray-700">
            <UserPlus className="mx-auto h-12 w-12 text-gray-300" />
            <p className="mt-2 text-gray-500">No team members added yet</p>
            <p className="text-sm text-gray-400">
              Add email addresses above to invite colleagues
            </p>
          </div>
        )}

        <p className="text-center text-sm text-gray-500">
          Invitations will be sent after you complete setup
        </p>
      </div>
    </OnboardingStep>
  );
}
```

### Preferences Step

```tsx
// app/onboarding/preferences/page.tsx
'use client';

import { useState } from 'react';
import { Sun, Moon, Monitor, Bell, Mail } from 'lucide-react';
import { OnboardingStep } from '@/components/onboarding/onboarding-step';
import { useOnboarding } from '@/components/onboarding/onboarding-provider';
import { cn } from '@/lib/utils';

export default function PreferencesStep() {
  const { data, updateData } = useOnboarding();
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>(data.theme || 'system');
  const [notifications, setNotifications] = useState(data.notifications ?? true);
  const [newsletter, setNewsletter] = useState(data.newsletter ?? false);

  const handleSubmit = () => {
    updateData({ theme, notifications, newsletter });
  };

  const themes = [
    { id: 'light', name: 'Light', icon: Sun },
    { id: 'dark', name: 'Dark', icon: Moon },
    { id: 'system', name: 'System', icon: Monitor },
  ] as const;

  return (
    <OnboardingStep
      title="Set your preferences"
      description="Customize your experience"
      onSubmit={handleSubmit}
      nextLabel="Complete Setup"
    >
      <div className="space-y-8">
        {/* Theme Selection */}
        <div>
          <h3 className="mb-4 text-sm font-medium text-gray-900 dark:text-white">
            Appearance
          </h3>
          <div className="grid grid-cols-3 gap-4">
            {themes.map((t) => (
              <button
                key={t.id}
                onClick={() => setTheme(t.id)}
                className={cn(
                  'flex flex-col items-center gap-3 rounded-lg border p-4 transition-colors',
                  theme === t.id
                    ? 'border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-900/20'
                    : 'border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600'
                )}
              >
                <t.icon
                  className={cn(
                    'h-8 w-8',
                    theme === t.id
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-gray-500'
                  )}
                />
                <span
                  className={cn(
                    'text-sm font-medium',
                    theme === t.id
                      ? 'text-blue-700 dark:text-blue-400'
                      : 'text-gray-700 dark:text-gray-300'
                  )}
                >
                  {t.name}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Notification Preferences */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white">
            Notifications
          </h3>

          <label className="flex items-center justify-between rounded-lg border border-gray-200 p-4 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <Bell className="h-5 w-5 text-gray-500" />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  Push Notifications
                </p>
                <p className="text-sm text-gray-500">
                  Get notified about important updates
                </p>
              </div>
            </div>
            <button
              role="switch"
              aria-checked={notifications}
              onClick={() => setNotifications(!notifications)}
              className={cn(
                'relative h-6 w-11 rounded-full transition-colors',
                notifications ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
              )}
            >
              <span
                className={cn(
                  'absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white transition-transform',
                  notifications && 'translate-x-5'
                )}
              />
            </button>
          </label>

          <label className="flex items-center justify-between rounded-lg border border-gray-200 p-4 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-gray-500" />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  Newsletter
                </p>
                <p className="text-sm text-gray-500">
                  Receive product updates and tips
                </p>
              </div>
            </div>
            <button
              role="switch"
              aria-checked={newsletter}
              onClick={() => setNewsletter(!newsletter)}
              className={cn(
                'relative h-6 w-11 rounded-full transition-colors',
                newsletter ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
              )}
            >
              <span
                className={cn(
                  'absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white transition-transform',
                  newsletter && 'translate-x-5'
                )}
              />
            </button>
          </label>
        </div>
      </div>
    </OnboardingStep>
  );
}
```

## Usage

```tsx
// Onboarding flow starts at:
// /onboarding/profile -> /onboarding/workspace -> /onboarding/team -> /onboarding/preferences

// Redirect new users to onboarding
// middleware.ts
export function middleware(request: NextRequest) {
  const isOnboarded = request.cookies.get('onboarded');
  
  if (!isOnboarded && !request.nextUrl.pathname.startsWith('/onboarding')) {
    return NextResponse.redirect(new URL('/onboarding/profile', request.url));
  }
}
```

## Error States

### Onboarding Error Boundary

```tsx
// app/onboarding/error.tsx
'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

export default function OnboardingError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Onboarding error:', error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 dark:bg-gray-950">
      <div className="mx-auto max-w-md text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
          <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
        </div>

        <h1 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
          Setup encountered an error
        </h1>
        <p className="mb-6 text-gray-600 dark:text-gray-400">
          Don't worry, your progress has been saved. Please try again.
        </p>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
          >
            <RefreshCw className="h-4 w-4" />
            Try again
          </button>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            <Home className="h-4 w-4" />
            Skip setup
          </Link>
        </div>
      </div>
    </div>
  );
}
```

### Step Validation Error

```tsx
// components/onboarding/step-error.tsx
'use client';

import { AlertCircle, ArrowRight } from 'lucide-react';

interface StepErrorProps {
  errors: Record<string, string>;
  onDismiss?: () => void;
}

export function StepError({ errors, onDismiss }: StepErrorProps) {
  const errorMessages = Object.values(errors);

  if (errorMessages.length === 0) return null;

  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800/50 dark:bg-red-900/20">
      <div className="flex gap-3">
        <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-600 dark:text-red-400" />
        <div className="flex-1">
          <h3 className="font-medium text-red-800 dark:text-red-300">
            Please fix the following errors
          </h3>
          <ul className="mt-2 list-disc list-inside text-sm text-red-700 dark:text-red-400 space-y-1">
            {errorMessages.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
```

### API Error Handler

```tsx
// components/onboarding/onboarding-step.tsx (enhanced)
'use client';

import { useState } from 'react';
import { toast } from 'sonner';

interface OnboardingStepProps {
  // ... existing props
  onSubmit?: () => Promise<void>;
}

export function OnboardingStep({ onSubmit, ...props }: OnboardingStepProps) {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleNext = async () => {
    setError(null);
    setIsLoading(true);

    try {
      if (onSubmit) {
        await onSubmit();
      }
      // Navigate to next step
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setError(message);
      toast.error('Failed to save', {
        description: message,
        action: {
          label: 'Retry',
          onClick: handleNext,
        },
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800/50 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}
      {/* Step content */}
    </div>
  );
}
```

## Loading States

### Onboarding Layout Loading

```tsx
// app/onboarding/loading.tsx
export default function OnboardingLoading() {
  return (
    <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-gray-950">
      {/* Header Skeleton */}
      <header className="border-b border-gray-200 bg-white px-4 py-4 dark:border-gray-800 dark:bg-gray-900">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-800" />
            <div className="h-5 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
          </div>
          <div className="h-8 w-24 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-800" />
        </div>
      </header>

      {/* Progress Skeleton */}
      <nav className="border-b border-gray-200 bg-white px-4 py-6 dark:border-gray-800 dark:bg-gray-900">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center">
              <div className="h-10 w-10 animate-pulse rounded-full bg-gray-200 dark:bg-gray-800" />
              {i < 4 && (
                <div className="mx-4 h-0.5 w-12 animate-pulse bg-gray-200 sm:w-24 dark:bg-gray-800" />
              )}
            </div>
          ))}
        </div>
      </nav>

      {/* Content Skeleton */}
      <main className="flex flex-1 flex-col">
        <div className="mx-auto w-full max-w-2xl flex-1 px-4 py-12">
          <div className="mb-8 text-center">
            <div className="mx-auto h-8 w-64 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
            <div className="mx-auto mt-2 h-5 w-48 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
          </div>

          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
                <div className="h-12 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-800" />
              </div>
            ))}
          </div>

          <div className="mt-8 flex justify-end">
            <div className="h-11 w-32 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-800" />
          </div>
        </div>
      </main>
    </div>
  );
}
```

### Step Transition Loading

```tsx
// components/onboarding/step-loading.tsx
'use client';

import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

export function StepTransitionLoading() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex min-h-[400px] items-center justify-center"
    >
      <div className="text-center">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-600" />
        <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
          Saving your progress...
        </p>
      </div>
    </motion.div>
  );
}
```

### Avatar Upload Loading

```tsx
// components/onboarding/avatar-upload-loading.tsx
'use client';

import { Loader2 } from 'lucide-react';

interface AvatarUploadProps {
  isUploading?: boolean;
  uploadProgress?: number;
}

export function AvatarUploadWithLoading({ isUploading, uploadProgress }: AvatarUploadProps) {
  return (
    <div className="relative">
      <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
        {isUploading ? (
          <div className="flex flex-col items-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            {uploadProgress !== undefined && (
              <span className="mt-1 text-xs text-gray-500">{uploadProgress}%</span>
            )}
          </div>
        ) : (
          // Avatar content
          null
        )}
      </div>

      {/* Upload Progress Ring */}
      {isUploading && uploadProgress !== undefined && (
        <svg className="absolute inset-0 h-24 w-24 -rotate-90">
          <circle
            cx="48"
            cy="48"
            r="46"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            className="text-gray-200 dark:text-gray-700"
          />
          <circle
            cx="48"
            cy="48"
            r="46"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            strokeDasharray={289}
            strokeDashoffset={289 - (289 * uploadProgress) / 100}
            className="text-blue-600 transition-all duration-300"
          />
        </svg>
      )}
    </div>
  );
}
```

## Mobile Responsiveness

### Responsive Onboarding Layout

```tsx
// components/onboarding/onboarding-layout-responsive.tsx
'use client';

import { OnboardingProvider } from './onboarding-provider';

export function OnboardingLayoutResponsive({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <OnboardingProvider>
      <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-gray-950">
        {/* Mobile Header */}
        <header className="border-b border-gray-200 bg-white px-4 py-3 dark:border-gray-800 dark:bg-gray-900 sm:py-4">
          <div className="mx-auto flex max-w-3xl items-center justify-between">
            <div className="flex items-center gap-2">
              <img src="/logo.svg" alt="Logo" className="h-7 w-7 sm:h-8 sm:w-8" />
              <span className="hidden text-lg font-bold sm:block">Company</span>
            </div>
            <button className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400">
              <span className="hidden sm:inline">Skip for now</span>
              <span className="sm:hidden">Skip</span>
            </button>
          </div>
        </header>

        {/* Responsive Progress */}
        <OnboardingProgressResponsive />

        <main className="flex flex-1 flex-col px-4 sm:px-6">
          {children}
        </main>
      </div>
    </OnboardingProvider>
  );
}
```

### Mobile Progress Indicator

```tsx
// components/onboarding/onboarding-progress-responsive.tsx
'use client';

import { Check } from 'lucide-react';
import { useOnboarding } from './onboarding-provider';
import { cn } from '@/lib/utils';

const steps = [
  { id: 1, name: 'Profile' },
  { id: 2, name: 'Workspace' },
  { id: 3, name: 'Team' },
  { id: 4, name: 'Preferences' },
];

export function OnboardingProgressResponsive() {
  const { currentStep } = useOnboarding();

  return (
    <nav className="border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
      {/* Mobile: Simple progress bar */}
      <div className="px-4 py-3 sm:hidden">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-gray-900 dark:text-white">
            Step {currentStep} of {steps.length}
          </span>
          <span className="text-gray-500">{steps[currentStep - 1]?.name}</span>
        </div>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
          <div
            className="h-full bg-blue-600 transition-all duration-300"
            style={{ width: `${(currentStep / steps.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Desktop: Full stepper */}
      <div className="hidden px-4 py-6 sm:block">
        <ol className="mx-auto flex max-w-3xl items-center justify-between">
          {steps.map((step, index) => {
            const isActive = step.id === currentStep;
            const isCompleted = step.id < currentStep;

            return (
              <li key={step.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      'flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors',
                      isCompleted && 'border-green-500 bg-green-500 text-white',
                      isActive && 'border-blue-600 bg-blue-600 text-white',
                      !isCompleted && !isActive && 'border-gray-300 bg-white text-gray-500 dark:border-gray-600 dark:bg-gray-800'
                    )}
                  >
                    {isCompleted ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      <span className="text-sm font-semibold">{step.id}</span>
                    )}
                  </div>
                  <span
                    className={cn(
                      'mt-2 text-sm font-medium',
                      isActive ? 'text-blue-600' : 'text-gray-500'
                    )}
                  >
                    {step.name}
                  </span>
                </div>

                {index < steps.length - 1 && (
                  <div
                    className={cn(
                      'mx-4 h-0.5 w-16 lg:w-24',
                      step.id < currentStep ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'
                    )}
                  />
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </nav>
  );
}
```

### Mobile-Optimized Step Content

```tsx
// components/onboarding/onboarding-step-responsive.tsx
'use client';

import { ReactNode } from 'react';
import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import { useOnboarding } from './onboarding-provider';

interface OnboardingStepResponsiveProps {
  title: string;
  description: string;
  children: ReactNode;
  onSubmit?: () => Promise<void>;
  isValid?: boolean;
  isLoading?: boolean;
}

export function OnboardingStepResponsive({
  title,
  description,
  children,
  onSubmit,
  isValid = true,
  isLoading = false,
}: OnboardingStepResponsiveProps) {
  const { currentStep, totalSteps, nextStep, prevStep, canGoPrev, completeOnboarding } =
    useOnboarding();

  const isLastStep = currentStep === totalSteps;

  return (
    <div className="flex flex-1 flex-col">
      <div className="mx-auto w-full max-w-2xl flex-1 py-6 sm:py-12">
        {/* Header - Smaller on mobile */}
        <div className="mb-6 text-center sm:mb-8">
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl dark:text-white">
            {title}
          </h1>
          <p className="mt-1 text-sm text-gray-600 sm:mt-2 sm:text-base dark:text-gray-400">
            {description}
          </p>
        </div>

        {/* Content */}
        <div className="flex-1">{children}</div>
      </div>

      {/* Footer - Fixed on mobile */}
      <div className="sticky bottom-0 border-t border-gray-200 bg-white px-4 py-4 dark:border-gray-800 dark:bg-gray-900 sm:static sm:border-0 sm:bg-transparent sm:py-8">
        <div className="mx-auto flex max-w-2xl items-center justify-between">
          <div>
            {canGoPrev && (
              <button
                onClick={prevStep}
                className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 sm:gap-2 sm:px-4 sm:py-2.5 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Back</span>
              </button>
            )}
          </div>

          <button
            onClick={async () => {
              if (onSubmit) await onSubmit();
              if (isLastStep) await completeOnboarding();
              else nextStep();
            }}
            disabled={!isValid || isLoading}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 sm:px-6 sm:py-2.5"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="hidden sm:inline">Saving...</span>
              </>
            ) : (
              <>
                <span>{isLastStep ? 'Complete' : 'Continue'}</span>
                {!isLastStep && <ArrowRight className="h-4 w-4" />}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
```

### Mobile Breakpoints Reference

```tsx
// Onboarding responsive patterns:
//
// Mobile (< 640px):
// - Progress shown as simple bar with step count
// - Smaller title text (text-2xl)
// - Fixed footer with navigation buttons
// - Compact button labels
// - Single column form fields
//
// Tablet (640px - 1024px):
// - Full step indicators visible
// - Larger title text (text-3xl)
// - Static footer
// - Full button labels with icons
//
// Desktop (> 1024px):
// - max-w-2xl centered content
// - Generous padding and spacing
// - All labels and descriptions visible
// - Two-column layouts where appropriate
```

## Related Skills

- [L3/onboarding-flow](../organisms/onboarding-flow.md) - Onboarding wizard
- [L4/auth-layout](./auth-layout.md) - Authentication layout
- [L2/progress](../molecules/progress.md) - Progress indicators

## Changelog

### 1.0.0 (2025-01-17)
- Initial implementation with multi-step wizard
