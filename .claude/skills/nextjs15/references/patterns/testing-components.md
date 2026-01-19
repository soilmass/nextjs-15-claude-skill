---
id: pt-testing-components
name: Component Testing
version: 2.0.0
layer: L5
category: testing
description: Test React components with React Testing Library in Next.js
tags: [testing, components, react-testing-library, vitest, next15, react19]
composes: []
dependencies:
  @testing-library/react: "^16.0.0"
  vitest: "^2.1.0"
formula: "RTL + userEvent + jest-axe = component behavior validation"
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# Component Testing

## Overview

Component testing verifies that UI components render correctly and respond to user interactions. This pattern covers testing with React Testing Library, handling async operations, testing forms, and mocking providers.

## When to Use

- **UI components**: Test buttons, forms, modals, and other interactive elements
- **Form validation**: Verify error messages and submission handling
- **Loading states**: Test skeleton screens and loading indicators
- **Error states**: Validate error boundaries and fallback UI
- **Accessibility**: Check ARIA attributes and keyboard navigation
- **Provider integration**: Test components with context providers
- **Async rendering**: Handle data fetching and suspense boundaries

## Composition Diagram

```
+------------------+     +-------------------+     +------------------+
| React Testing    | --> | userEvent         | --> | DOM Assertions   |
| Library (render) |     | (interactions)    |     | (screen queries) |
+------------------+     +-------------------+     +------------------+
         |                        |                        |
         v                        v                        v
+------------------+     +-------------------+     +------------------+
| Mocking Pattern  |     | Test Fixtures     |     | Accessibility    |
| (vi.mock)        |     | (mock props)      |     | (jest-axe)       |
+------------------+     +-------------------+     +------------------+
         |                        |
         v                        v
+------------------+     +-------------------+
| Hook Testing     |     | Snapshot Testing  |
| (renderHook)     |     | (visual changes)  |
+------------------+     +-------------------+
```

## Basic Component Test

```typescript
// components/button.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from './button';

describe('Button', () => {
  it('renders with children', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
  });

  it('applies variant classes', () => {
    render(<Button variant="destructive">Delete</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-destructive');
  });

  it('handles click events', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();

    render(<Button onClick={handleClick}>Click</Button>);

    await user.click(screen.getByRole('button'));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('can be disabled', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();

    render(
      <Button onClick={handleClick} disabled>
        Disabled
      </Button>
    );

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();

    await user.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('shows loading state', () => {
    render(<Button loading>Submit</Button>);

    expect(screen.getByRole('button')).toBeDisabled();
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });
});
```

## Testing Forms

```typescript
// components/contact-form.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ContactForm } from './contact-form';

// Mock server action
vi.mock('@/app/actions/contact', () => ({
  submitContact: vi.fn(),
}));

import { submitContact } from '@/app/actions/contact';

describe('ContactForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all form fields', () => {
    render(<ContactForm />);

    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/message/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /send/i })).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    const user = userEvent.setup();
    render(<ContactForm />);

    await user.click(screen.getByRole('button', { name: /send/i }));

    await waitFor(() => {
      expect(screen.getByText(/name is required/i)).toBeInTheDocument();
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
    });

    expect(submitContact).not.toHaveBeenCalled();
  });

  it('validates email format', async () => {
    const user = userEvent.setup();
    render(<ContactForm />);

    await user.type(screen.getByLabelText(/name/i), 'John Doe');
    await user.type(screen.getByLabelText(/email/i), 'invalid-email');
    await user.type(screen.getByLabelText(/message/i), 'Hello there!');
    await user.click(screen.getByRole('button', { name: /send/i }));

    await waitFor(() => {
      expect(screen.getByText(/invalid email/i)).toBeInTheDocument();
    });
  });

  it('submits form with valid data', async () => {
    const user = userEvent.setup();
    vi.mocked(submitContact).mockResolvedValue({ success: true });

    render(<ContactForm />);

    await user.type(screen.getByLabelText(/name/i), 'John Doe');
    await user.type(screen.getByLabelText(/email/i), 'john@example.com');
    await user.type(screen.getByLabelText(/message/i), 'Hello there!');
    await user.click(screen.getByRole('button', { name: /send/i }));

    await waitFor(() => {
      expect(submitContact).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({
          get: expect.any(Function),
        })
      );
    });
  });

  it('shows success message after submission', async () => {
    const user = userEvent.setup();
    vi.mocked(submitContact).mockResolvedValue({
      success: true,
      message: 'Message sent!',
    });

    render(<ContactForm />);

    await user.type(screen.getByLabelText(/name/i), 'John');
    await user.type(screen.getByLabelText(/email/i), 'john@example.com');
    await user.type(screen.getByLabelText(/message/i), 'Test message');
    await user.click(screen.getByRole('button', { name: /send/i }));

    await waitFor(() => {
      expect(screen.getByText(/message sent/i)).toBeInTheDocument();
    });
  });

  it('shows error message on failure', async () => {
    const user = userEvent.setup();
    vi.mocked(submitContact).mockResolvedValue({
      success: false,
      errors: { _form: ['Server error occurred'] },
    });

    render(<ContactForm />);

    await user.type(screen.getByLabelText(/name/i), 'John');
    await user.type(screen.getByLabelText(/email/i), 'john@example.com');
    await user.type(screen.getByLabelText(/message/i), 'Test message');
    await user.click(screen.getByRole('button', { name: /send/i }));

    await waitFor(() => {
      expect(screen.getByText(/server error/i)).toBeInTheDocument();
    });
  });

  it('disables submit button while submitting', async () => {
    const user = userEvent.setup();

    let resolveSubmit: () => void;
    vi.mocked(submitContact).mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveSubmit = () => resolve({ success: true });
        })
    );

    render(<ContactForm />);

    await user.type(screen.getByLabelText(/name/i), 'John');
    await user.type(screen.getByLabelText(/email/i), 'john@example.com');
    await user.type(screen.getByLabelText(/message/i), 'Test');
    await user.click(screen.getByRole('button', { name: /send/i }));

    expect(screen.getByRole('button')).toBeDisabled();
    expect(screen.getByText(/sending/i)).toBeInTheDocument();

    resolveSubmit!();

    await waitFor(() => {
      expect(screen.getByRole('button')).not.toBeDisabled();
    });
  });
});
```

## Testing with Providers

```typescript
// tests/utils/render.tsx
import { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SessionProvider } from 'next-auth/react';
import { ThemeProvider } from '@/components/theme-provider';

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  });

interface AllProvidersProps {
  children: React.ReactNode;
  session?: any;
}

function AllProviders({ children, session = null }: AllProvidersProps) {
  const queryClient = createTestQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider session={session}>
        <ThemeProvider attribute="class" defaultTheme="light">
          {children}
        </ThemeProvider>
      </SessionProvider>
    </QueryClientProvider>
  );
}

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  session?: any;
}

function customRender(
  ui: ReactElement,
  { session, ...options }: CustomRenderOptions = {}
) {
  return render(ui, {
    wrapper: ({ children }) => (
      <AllProviders session={session}>{children}</AllProviders>
    ),
    ...options,
  });
}

export * from '@testing-library/react';
export { customRender as render };

// Usage
// components/user-menu.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@/tests/utils/render';
import { UserMenu } from './user-menu';

describe('UserMenu', () => {
  it('shows login button when not authenticated', () => {
    render(<UserMenu />);
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('shows user avatar when authenticated', () => {
    const session = {
      user: {
        name: 'John Doe',
        email: 'john@example.com',
        image: 'https://example.com/avatar.jpg',
      },
    };

    render(<UserMenu />, { session });

    expect(screen.getByRole('img', { name: /john/i })).toBeInTheDocument();
  });
});
```

## Testing Async Components

```typescript
// components/user-profile.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { UserProfile } from './user-profile';

// Mock the data fetching hook
vi.mock('@/hooks/use-user', () => ({
  useUser: vi.fn(),
}));

import { useUser } from '@/hooks/use-user';

describe('UserProfile', () => {
  it('shows loading state', () => {
    vi.mocked(useUser).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    } as any);

    render(<UserProfile userId="123" />);

    expect(screen.getByTestId('profile-skeleton')).toBeInTheDocument();
  });

  it('shows user data when loaded', () => {
    vi.mocked(useUser).mockReturnValue({
      data: { id: '123', name: 'John Doe', email: 'john@example.com' },
      isLoading: false,
      error: null,
    } as any);

    render(<UserProfile userId="123" />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
  });

  it('shows error state', () => {
    vi.mocked(useUser).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('Failed to fetch'),
    } as any);

    render(<UserProfile userId="123" />);

    expect(screen.getByText(/failed to load/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
  });
});
```

## Testing Modals and Dialogs

```typescript
// components/confirm-dialog.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ConfirmDialog } from './confirm-dialog';

describe('ConfirmDialog', () => {
  it('opens when trigger is clicked', async () => {
    const user = userEvent.setup();

    render(
      <ConfirmDialog
        trigger={<button>Delete</button>}
        title="Confirm Delete"
        description="Are you sure?"
        onConfirm={() => {}}
      />
    );

    await user.click(screen.getByRole('button', { name: /delete/i }));

    await waitFor(() => {
      expect(screen.getByRole('alertdialog')).toBeInTheDocument();
      expect(screen.getByText('Confirm Delete')).toBeInTheDocument();
    });
  });

  it('closes when cancel is clicked', async () => {
    const user = userEvent.setup();

    render(
      <ConfirmDialog
        trigger={<button>Delete</button>}
        title="Confirm"
        onConfirm={() => {}}
      />
    );

    await user.click(screen.getByRole('button', { name: /delete/i }));
    await waitFor(() => {
      expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /cancel/i }));

    await waitFor(() => {
      expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    });
  });

  it('calls onConfirm when confirmed', async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();

    render(
      <ConfirmDialog
        trigger={<button>Delete</button>}
        title="Confirm"
        onConfirm={onConfirm}
      />
    );

    await user.click(screen.getByRole('button', { name: /delete/i }));
    await waitFor(() => {
      expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /confirm/i }));

    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('shows loading state during async confirm', async () => {
    const user = userEvent.setup();

    let resolveConfirm: () => void;
    const onConfirm = () =>
      new Promise<void>((resolve) => {
        resolveConfirm = resolve;
      });

    render(
      <ConfirmDialog
        trigger={<button>Delete</button>}
        title="Confirm"
        onConfirm={onConfirm}
      />
    );

    await user.click(screen.getByRole('button', { name: /delete/i }));
    await user.click(screen.getByRole('button', { name: /confirm/i }));

    expect(screen.getByRole('button', { name: /confirm/i })).toBeDisabled();

    resolveConfirm!();

    await waitFor(() => {
      expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    });
  });
});
```

## Testing Accessibility

```typescript
// components/navigation.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { Navigation } from './navigation';

expect.extend(toHaveNoViolations);

describe('Navigation', () => {
  it('has no accessibility violations', async () => {
    const { container } = render(<Navigation />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('supports keyboard navigation', async () => {
    const user = userEvent.setup();
    render(<Navigation />);

    const firstLink = screen.getAllByRole('link')[0];
    firstLink.focus();
    expect(firstLink).toHaveFocus();

    await user.keyboard('{Tab}');
    const secondLink = screen.getAllByRole('link')[1];
    expect(secondLink).toHaveFocus();
  });

  it('has proper ARIA labels', () => {
    render(<Navigation />);

    expect(screen.getByRole('navigation')).toHaveAttribute('aria-label', 'Main navigation');
  });

  it('indicates current page', () => {
    render(<Navigation currentPath="/about" />);

    const aboutLink = screen.getByRole('link', { name: /about/i });
    expect(aboutLink).toHaveAttribute('aria-current', 'page');
  });
});
```

## Anti-patterns

### Don't Test Implementation Details

```typescript
// BAD - Testing internal state
it('updates count state', () => {
  const { result } = renderHook(() => useState(0));
  act(() => result.current[1](1));
  expect(result.current[0]).toBe(1); // Testing React's useState
});

// GOOD - Test behavior from user perspective
it('increments counter when clicked', async () => {
  const user = userEvent.setup();
  render(<Counter />);
  
  await user.click(screen.getByRole('button', { name: /increment/i }));
  
  expect(screen.getByText('Count: 1')).toBeInTheDocument();
});
```

### Don't Use Arbitrary Waits

```typescript
// BAD - Using setTimeout
it('shows data', async () => {
  render(<DataComponent />);
  await new Promise(r => setTimeout(r, 1000)); // Arbitrary wait
  expect(screen.getByText('Data')).toBeInTheDocument();
});

// GOOD - Use waitFor
it('shows data', async () => {
  render(<DataComponent />);
  await waitFor(() => {
    expect(screen.getByText('Data')).toBeInTheDocument();
  });
});
```

## Related Skills

- [testing-unit](./testing-unit.md)
- [testing-integration](./testing-integration.md)
- [testing-e2e](./testing-e2e.md)

---

## Changelog

### 2.0.0 (2025-01-18)
- Standardized to atomic design system v2
- Updated frontmatter schema

### 1.0.0 (2025-01-16)
- Initial implementation
- Form testing
- Provider testing
- Async components
- Modal testing
- Accessibility testing
