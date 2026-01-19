---
id: pt-testing-unit
name: Unit Testing
version: 2.0.0
layer: L5
category: testing
description: Unit testing React components and utilities with Vitest and Testing Library
tags: [testing, unit-tests, vitest, testing-library, next15]
composes: []
dependencies:
  vitest: "^2.1.0"
formula: "Vitest + RTL + vi.mock = isolated unit validation"
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# Unit Testing

## Overview

Unit testing in Next.js 15 focuses on testing individual components and utilities in isolation. This pattern uses Vitest for fast test execution and React Testing Library for component testing.

## When to Use

- **Utility functions**: Test pure functions like formatters, validators, and helpers
- **Component rendering**: Test UI components in isolation with mocked props
- **Hook logic**: Test custom hooks with renderHook
- **Form validation**: Test Zod schemas and form validation logic
- **State management**: Test reducers and state update logic
- **API response handling**: Test data transformation and error handling

## Composition Diagram

```
+------------------+     +-------------------+     +------------------+
| Vitest Runner    | --> | Test File         | --> | Assertions       |
| (fast execution) |     | (*.test.ts)       |     | (expect)         |
+------------------+     +-------------------+     +------------------+
         |                        |                        |
         v                        v                        v
+------------------+     +-------------------+     +------------------+
| Mocking Pattern  |     | Component Testing |     | Hook Testing     |
| (vi.mock)        |     | (RTL render)      |     | (renderHook)     |
+------------------+     +-------------------+     +------------------+
         |                        |
         v                        v
+------------------+     +-------------------+
| Snapshot Tests   |     | Accessibility     |
| (toMatchSnapshot)|     | (jest-axe)        |
+------------------+     +-------------------+
```

## Setup

```typescript
// vitest.config.ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    include: ["**/*.test.{ts,tsx}"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: ["node_modules/", "vitest.setup.ts"],
    },
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "./"),
    },
  },
});

// vitest.setup.ts
import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock Next.js router
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
  useParams: () => ({}),
}));

// Mock Next.js Image
vi.mock("next/image", () => ({
  default: (props: any) => <img {...props} />,
}));
```

## Testing Components

```typescript
// components/button.test.tsx
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { Button } from "./button";

describe("Button", () => {
  it("renders with children", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole("button", { name: "Click me" })).toBeInTheDocument();
  });

  it("calls onClick when clicked", () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByRole("button"));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("is disabled when disabled prop is true", () => {
    render(<Button disabled>Click me</Button>);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("shows loading state", () => {
    render(<Button loading>Submit</Button>);
    expect(screen.getByRole("button")).toHaveAttribute("aria-busy", "true");
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("applies variant classes", () => {
    render(<Button variant="destructive">Delete</Button>);
    expect(screen.getByRole("button")).toHaveClass("bg-destructive");
  });
});
```

## Testing Forms

```typescript
// components/login-form.test.tsx
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { LoginForm } from "./login-form";

// Mock the signIn function
vi.mock("next-auth/react", () => ({
  signIn: vi.fn(),
}));

import { signIn } from "next-auth/react";

describe("LoginForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders email and password fields", () => {
    render(<LoginForm />);
    
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument();
  });

  it("shows validation errors for empty fields", async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    await user.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
    });
  });

  it("shows error for invalid email", async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    await user.type(screen.getByLabelText(/email/i), "invalid-email");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText(/invalid email/i)).toBeInTheDocument();
    });
  });

  it("submits form with valid data", async () => {
    const user = userEvent.setup();
    (signIn as vi.Mock).mockResolvedValue({ ok: true });

    render(<LoginForm />);

    await user.type(screen.getByLabelText(/email/i), "test@example.com");
    await user.type(screen.getByLabelText(/password/i), "password123");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(signIn).toHaveBeenCalledWith("credentials", {
        email: "test@example.com",
        password: "password123",
        redirect: false,
      });
    });
  });

  it("shows error on failed login", async () => {
    const user = userEvent.setup();
    (signIn as vi.Mock).mockResolvedValue({ error: "Invalid credentials" });

    render(<LoginForm />);

    await user.type(screen.getByLabelText(/email/i), "test@example.com");
    await user.type(screen.getByLabelText(/password/i), "wrongpassword");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
    });
  });
});
```

## Testing Hooks

```typescript
// hooks/use-counter.test.ts
import { renderHook, act } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { useCounter } from "./use-counter";

describe("useCounter", () => {
  it("initializes with default value", () => {
    const { result } = renderHook(() => useCounter());
    expect(result.current.count).toBe(0);
  });

  it("initializes with provided value", () => {
    const { result } = renderHook(() => useCounter(10));
    expect(result.current.count).toBe(10);
  });

  it("increments count", () => {
    const { result } = renderHook(() => useCounter());
    
    act(() => {
      result.current.increment();
    });
    
    expect(result.current.count).toBe(1);
  });

  it("decrements count", () => {
    const { result } = renderHook(() => useCounter(5));
    
    act(() => {
      result.current.decrement();
    });
    
    expect(result.current.count).toBe(4);
  });

  it("resets to initial value", () => {
    const { result } = renderHook(() => useCounter(5));
    
    act(() => {
      result.current.increment();
      result.current.increment();
      result.current.reset();
    });
    
    expect(result.current.count).toBe(5);
  });
});
```

## Testing Async Components

```typescript
// components/user-profile.test.tsx
import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { UserProfile } from "./user-profile";

// Mock the fetch function
vi.mock("@/lib/api", () => ({
  getUser: vi.fn(),
}));

import { getUser } from "@/lib/api";

describe("UserProfile", () => {
  it("shows loading state initially", () => {
    (getUser as vi.Mock).mockReturnValue(new Promise(() => {})); // Never resolves
    
    render(<UserProfile userId="123" />);
    
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it("displays user data when loaded", async () => {
    (getUser as vi.Mock).mockResolvedValue({
      id: "123",
      name: "John Doe",
      email: "john@example.com",
    });

    render(<UserProfile userId="123" />);

    await waitFor(() => {
      expect(screen.getByText("John Doe")).toBeInTheDocument();
      expect(screen.getByText("john@example.com")).toBeInTheDocument();
    });
  });

  it("shows error state on failure", async () => {
    (getUser as vi.Mock).mockRejectedValue(new Error("Failed to fetch"));

    render(<UserProfile userId="123" />);

    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument();
    });
  });
});
```

## Testing Utilities

```typescript
// lib/utils.test.ts
import { describe, it, expect } from "vitest";
import { cn, formatCurrency, formatDate, slugify } from "./utils";

describe("cn", () => {
  it("merges class names", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("handles conditional classes", () => {
    expect(cn("base", false && "hidden", true && "visible")).toBe("base visible");
  });

  it("handles Tailwind conflicts", () => {
    expect(cn("p-4", "p-2")).toBe("p-2");
    expect(cn("text-red-500", "text-blue-500")).toBe("text-blue-500");
  });
});

describe("formatCurrency", () => {
  it("formats USD correctly", () => {
    expect(formatCurrency(1234.56)).toBe("$1,234.56");
  });

  it("handles zero", () => {
    expect(formatCurrency(0)).toBe("$0.00");
  });

  it("handles negative values", () => {
    expect(formatCurrency(-50)).toBe("-$50.00");
  });
});

describe("formatDate", () => {
  it("formats date correctly", () => {
    const date = new Date("2025-01-15T12:00:00Z");
    expect(formatDate(date)).toBe("January 15, 2025");
  });

  it("handles string input", () => {
    expect(formatDate("2025-01-15")).toBe("January 15, 2025");
  });
});

describe("slugify", () => {
  it("converts to lowercase", () => {
    expect(slugify("Hello World")).toBe("hello-world");
  });

  it("replaces spaces with hyphens", () => {
    expect(slugify("foo bar baz")).toBe("foo-bar-baz");
  });

  it("removes special characters", () => {
    expect(slugify("Hello! World?")).toBe("hello-world");
  });

  it("handles multiple spaces", () => {
    expect(slugify("foo   bar")).toBe("foo-bar");
  });
});
```

## Testing with Providers

```typescript
// test/test-utils.tsx
import { render, type RenderOptions } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@/components/providers/theme-provider";

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

interface WrapperProps {
  children: React.ReactNode;
}

function AllProviders({ children }: WrapperProps) {
  const queryClient = createTestQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="light">
        {children}
      </ThemeProvider>
    </QueryClientProvider>
  );
}

const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, "wrapper">
) => render(ui, { wrapper: AllProviders, ...options });

export * from "@testing-library/react";
export { customRender as render };

// Usage
import { render, screen } from "@/test/test-utils";

it("renders with providers", () => {
  render(<MyComponent />);
  // Component has access to all providers
});
```

## Snapshot Testing

```typescript
// components/card.test.tsx
import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Card, CardHeader, CardTitle, CardContent } from "./card";

describe("Card", () => {
  it("matches snapshot", () => {
    const { container } = render(
      <Card>
        <CardHeader>
          <CardTitle>Title</CardTitle>
        </CardHeader>
        <CardContent>Content</CardContent>
      </Card>
    );

    expect(container).toMatchSnapshot();
  });
});
```

## Testing Accessibility

```typescript
// components/form.test.tsx
import { render } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import { describe, it, expect } from "vitest";
import { LoginForm } from "./login-form";

expect.extend(toHaveNoViolations);

describe("LoginForm accessibility", () => {
  it("has no accessibility violations", async () => {
    const { container } = render(<LoginForm />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
```

## Anti-patterns

### Don't Test Implementation Details

```typescript
// BAD - Testing internal state
expect(component.state.isOpen).toBe(true);

// GOOD - Test what user sees
expect(screen.getByRole("dialog")).toBeVisible();
```

### Don't Skip User Interactions

```typescript
// BAD - Direct state manipulation
component.setState({ value: "test" });

// GOOD - Simulate user behavior
await user.type(screen.getByRole("textbox"), "test");
```

## Related Skills

- [testing-integration](./testing-integration.md)
- [testing-e2e](./testing-e2e.md)

---

## Changelog

### 2.0.0 (2025-01-18)
- Standardized to atomic design system v2
- Updated frontmatter schema

### 1.0.0 (2025-01-16)
- Initial implementation
- Vitest setup
- Component testing patterns
- Hook testing
