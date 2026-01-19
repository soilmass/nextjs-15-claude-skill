---
id: o-team
name: Team Section
version: 2.0.0
layer: L3
category: marketing
description: Team member showcase with cards, social links, and filtering
tags: [team, about, people, members, staff, organization]
formula: "Team = Avatar(m-avatar) + Card(m-card) + Badge(a-badge) + Button(a-button)"
composes:
  - ../molecules/avatar.md
  - ../molecules/card.md
dependencies: [framer-motion, lucide-react]
performance:
  impact: medium
  lcp: medium
  cls: low
accessibility:
  wcag: AA
  keyboard: true
  screen-reader: true
---

# Team Section

## Overview

The Team organism displays team members with photos, roles, bios, and social links. Supports multiple layout variants including grid, carousel, and featured layouts. Includes filtering by department and animated transitions.

## When to Use

Use this skill when:
- Building about/team pages
- Showcasing company leadership
- Creating contributor sections for open source
- Building employee directories

## Composition Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│ Team Section                                                     │
├──────────────────────────────────────────────────────────────────┤
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ Header: Title + Description                                │  │
│  └────────────────────────────────────────────────────────────┘  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ Filter Buttons (a-button)                                  │  │
│  │ [All] [Engineering] [Design] [Marketing]                   │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐   │
│  │ Card (m-card)   │  │ Card (m-card)   │  │ Card (m-card)   │   │
│  │ ┌─────────────┐ │  │ ┌─────────────┐ │  │ ┌─────────────┐ │   │
│  │ │Avatar       │ │  │ │Avatar       │ │  │ │Avatar       │ │   │
│  │ │(m-avatar)   │ │  │ │(m-avatar)   │ │  │ │(m-avatar)   │ │   │
│  │ └─────────────┘ │  │ └─────────────┘ │  │ └─────────────┘ │   │
│  │ Name + Role     │  │ Name + Role     │  │ Name + Role     │   │
│  │ ┌─────────────┐ │  │ ┌─────────────┐ │  │ ┌─────────────┐ │   │
│  │ │Badge        │ │  │ │Badge        │ │  │ │Badge        │ │   │
│  │ │(a-badge)    │ │  │ │(a-badge)    │ │  │ │(a-badge)    │ │   │
│  │ │[Department] │ │  │ │[Department] │ │  │ │[Department] │ │   │
│  │ └─────────────┘ │  │ └─────────────┘ │  │ └─────────────┘ │   │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
```

## Molecules Used

- [avatar](../molecules/avatar.md) - Member photos
- [card](../molecules/card.md) - Member cards
- [badge](../atoms/badge.md) - Department tags

## Implementation

```typescript
// components/organisms/team.tsx
"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Twitter, Linkedin, Github, Mail, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SocialLink {
  type: "twitter" | "linkedin" | "github" | "email" | "website";
  url: string;
}

interface TeamMember {
  id: string;
  name: string;
  role: string;
  department?: string;
  bio?: string;
  image: string;
  imageAlt?: string;
  socials?: SocialLink[];
  featured?: boolean;
}

interface TeamProps {
  /** Section title */
  title?: string;
  /** Section description */
  description?: string;
  /** Team members */
  members: TeamMember[];
  /** Layout variant */
  variant?: "grid" | "carousel" | "featured" | "compact" | "list";
  /** Number of columns for grid layout */
  columns?: 2 | 3 | 4;
  /** Show department filter */
  showFilter?: boolean;
  /** Show member bio */
  showBio?: boolean;
  /** Card click behavior */
  onMemberClick?: (member: TeamMember) => void;
  /** Link to member detail page */
  memberLinkPattern?: string;
  /** Disable animations */
  disableAnimations?: boolean;
  /** Additional class names */
  className?: string;
}

const socialIcons: Record<SocialLink["type"], React.ComponentType<{ className?: string }>> = {
  twitter: Twitter,
  linkedin: Linkedin,
  github: Github,
  email: Mail,
  website: ExternalLink,
};

const socialLabels: Record<SocialLink["type"], string> = {
  twitter: "Twitter",
  linkedin: "LinkedIn",
  github: "GitHub",
  email: "Email",
  website: "Website",
};

function SocialLinks({ socials }: { socials: SocialLink[] }) {
  return (
    <TooltipProvider>
      <div className="flex items-center gap-2">
        {socials.map((social) => {
          const Icon = socialIcons[social.type];
          const href = social.type === "email" ? `mailto:${social.url}` : social.url;
          
          return (
            <Tooltip key={social.type}>
              <TooltipTrigger asChild>
                <a
                  href={href}
                  target={social.type !== "email" ? "_blank" : undefined}
                  rel={social.type !== "email" ? "noopener noreferrer" : undefined}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={socialLabels[social.type]}
                >
                  <Icon className="h-4 w-4" />
                </a>
              </TooltipTrigger>
              <TooltipContent>
                <p>{socialLabels[social.type]}</p>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
}

function MemberCard({
  member,
  showBio,
  onClick,
  linkPattern,
  disableAnimations,
}: {
  member: TeamMember;
  showBio?: boolean;
  onClick?: (member: TeamMember) => void;
  linkPattern?: string;
  disableAnimations?: boolean;
}) {
  const MotionCard = disableAnimations ? Card : motion(Card);
  const motionProps = disableAnimations
    ? {}
    : {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -20 },
        whileHover: { y: -4 },
        transition: { duration: 0.3 },
      };

  const content = (
    <MotionCard
      {...motionProps}
      className={cn(
        "overflow-hidden group",
        onClick && "cursor-pointer"
      )}
      onClick={() => onClick?.(member)}
    >
      <div className="relative aspect-square overflow-hidden">
        <Image
          src={member.image}
          alt={member.imageAlt ?? member.name}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {/* Overlay on hover */}
        {member.socials && member.socials.length > 0 && (
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <div className="flex gap-4">
              {member.socials.map((social) => {
                const Icon = socialIcons[social.type];
                const href = social.type === "email" ? `mailto:${social.url}` : social.url;
                
                return (
                  <a
                    key={social.type}
                    href={href}
                    target={social.type !== "email" ? "_blank" : undefined}
                    rel={social.type !== "email" ? "noopener noreferrer" : undefined}
                    className="text-white hover:text-primary transition-colors"
                    aria-label={socialLabels[social.type]}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Icon className="h-5 w-5" />
                  </a>
                );
              })}
            </div>
          </div>
        )}
      </div>
      <CardHeader className="text-center">
        <CardTitle className="text-lg">{member.name}</CardTitle>
        <CardDescription>{member.role}</CardDescription>
        {member.department && (
          <Badge variant="secondary" className="mt-2 w-fit mx-auto">
            {member.department}
          </Badge>
        )}
      </CardHeader>
      {showBio && member.bio && (
        <CardContent className="text-center">
          <p className="text-sm text-muted-foreground line-clamp-3">
            {member.bio}
          </p>
        </CardContent>
      )}
    </MotionCard>
  );

  if (linkPattern) {
    const href = linkPattern.replace("[id]", member.id);
    return <Link href={href}>{content}</Link>;
  }

  return content;
}

function FeaturedMember({
  member,
  disableAnimations,
}: {
  member: TeamMember;
  disableAnimations?: boolean;
}) {
  const MotionDiv = disableAnimations ? "div" : motion.div;
  const motionProps = disableAnimations
    ? {}
    : {
        initial: { opacity: 0, scale: 0.95 },
        animate: { opacity: 1, scale: 1 },
        transition: { duration: 0.5 },
      };

  return (
    <MotionDiv
      {...motionProps}
      className="grid md:grid-cols-2 gap-8 items-center p-6 rounded-2xl bg-muted/50"
    >
      <div className="relative aspect-square rounded-xl overflow-hidden">
        <Image
          src={member.image}
          alt={member.imageAlt ?? member.name}
          fill
          className="object-cover"
        />
      </div>
      <div className="space-y-4">
        {member.department && (
          <Badge variant="secondary">{member.department}</Badge>
        )}
        <h3 className="text-2xl font-bold">{member.name}</h3>
        <p className="text-lg text-muted-foreground">{member.role}</p>
        {member.bio && (
          <p className="text-muted-foreground">{member.bio}</p>
        )}
        {member.socials && member.socials.length > 0 && (
          <div className="pt-4">
            <SocialLinks socials={member.socials} />
          </div>
        )}
      </div>
    </MotionDiv>
  );
}

function CompactMember({ member }: { member: TeamMember }) {
  return (
    <div className="flex items-center gap-4 p-4 rounded-lg hover:bg-muted/50 transition-colors">
      <div className="relative h-12 w-12 rounded-full overflow-hidden flex-shrink-0">
        <Image
          src={member.image}
          alt={member.imageAlt ?? member.name}
          fill
          className="object-cover"
        />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{member.name}</p>
        <p className="text-sm text-muted-foreground truncate">{member.role}</p>
      </div>
      {member.socials && member.socials.length > 0 && (
        <SocialLinks socials={member.socials} />
      )}
    </div>
  );
}

function ListMember({ member, showBio }: { member: TeamMember; showBio?: boolean }) {
  return (
    <div className="flex items-start gap-6 p-6 rounded-lg border hover:border-primary/50 transition-colors">
      <div className="relative h-24 w-24 rounded-lg overflow-hidden flex-shrink-0">
        <Image
          src={member.image}
          alt={member.imageAlt ?? member.name}
          fill
          className="object-cover"
        />
      </div>
      <div className="flex-1 space-y-2">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="font-semibold">{member.name}</h3>
            <p className="text-muted-foreground">{member.role}</p>
            {member.department && (
              <Badge variant="outline" className="mt-1">
                {member.department}
              </Badge>
            )}
          </div>
          {member.socials && member.socials.length > 0 && (
            <SocialLinks socials={member.socials} />
          )}
        </div>
        {showBio && member.bio && (
          <p className="text-sm text-muted-foreground">{member.bio}</p>
        )}
      </div>
    </div>
  );
}

export function Team({
  title = "Our Team",
  description,
  members,
  variant = "grid",
  columns = 4,
  showFilter = false,
  showBio = false,
  onMemberClick,
  memberLinkPattern,
  disableAnimations = false,
  className,
}: TeamProps) {
  const [activeFilter, setActiveFilter] = React.useState<string | null>(null);

  // Get unique departments for filter
  const departments = React.useMemo(() => {
    const deps = new Set<string>();
    members.forEach((m) => {
      if (m.department) deps.add(m.department);
    });
    return Array.from(deps);
  }, [members]);

  // Filter members
  const filteredMembers = React.useMemo(() => {
    if (!activeFilter) return members;
    return members.filter((m) => m.department === activeFilter);
  }, [members, activeFilter]);

  // Separate featured members
  const featuredMembers = filteredMembers.filter((m) => m.featured);
  const regularMembers = filteredMembers.filter((m) => !m.featured);

  const columnClasses = {
    2: "sm:grid-cols-2",
    3: "sm:grid-cols-2 lg:grid-cols-3",
    4: "sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
  };

  return (
    <section className={cn("py-16 lg:py-24", className)}>
      <div className="container">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
            {title}
          </h2>
          {description && (
            <p className="text-lg text-muted-foreground">{description}</p>
          )}
        </div>

        {/* Filter */}
        {showFilter && departments.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            <Button
              variant={activeFilter === null ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveFilter(null)}
            >
              All
            </Button>
            {departments.map((dept) => (
              <Button
                key={dept}
                variant={activeFilter === dept ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveFilter(dept)}
              >
                {dept}
              </Button>
            ))}
          </div>
        )}

        {/* Featured Members */}
        {variant === "featured" && featuredMembers.length > 0 && (
          <div className="mb-12 space-y-8">
            {featuredMembers.map((member) => (
              <FeaturedMember
                key={member.id}
                member={member}
                disableAnimations={disableAnimations}
              />
            ))}
          </div>
        )}

        {/* Members Grid */}
        <AnimatePresence mode="wait">
          {variant === "grid" && (
            <div className={cn("grid gap-6", columnClasses[columns])}>
              {filteredMembers.map((member) => (
                <MemberCard
                  key={member.id}
                  member={member}
                  showBio={showBio}
                  onClick={onMemberClick}
                  linkPattern={memberLinkPattern}
                  disableAnimations={disableAnimations}
                />
              ))}
            </div>
          )}

          {variant === "featured" && (
            <div className={cn("grid gap-6", columnClasses[columns])}>
              {regularMembers.map((member) => (
                <MemberCard
                  key={member.id}
                  member={member}
                  showBio={showBio}
                  onClick={onMemberClick}
                  linkPattern={memberLinkPattern}
                  disableAnimations={disableAnimations}
                />
              ))}
            </div>
          )}

          {variant === "compact" && (
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {filteredMembers.map((member) => (
                <CompactMember key={member.id} member={member} />
              ))}
            </div>
          )}

          {variant === "list" && (
            <div className="grid gap-4 lg:grid-cols-2">
              {filteredMembers.map((member) => (
                <ListMember key={member.id} member={member} showBio={showBio} />
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
```

### Key Implementation Notes

1. **Multiple Layouts**: Grid, featured, compact, and list variants
2. **Department Filter**: Optional filtering by department
3. **Social Links**: Hover overlay with social icons
4. **Animated Transitions**: Framer Motion for smooth interactions

## Variants

### Grid Layout

```tsx
<Team
  title="Meet Our Team"
  description="The people behind the product"
  members={[
    {
      id: "1",
      name: "Jane Doe",
      role: "CEO",
      department: "Leadership",
      image: "/team/jane.jpg",
      socials: [
        { type: "twitter", url: "https://twitter.com/jane" },
        { type: "linkedin", url: "https://linkedin.com/in/jane" },
      ],
    },
    // More members...
  ]}
  columns={4}
  showBio
/>
```

### Featured Layout

```tsx
<Team
  variant="featured"
  members={[
    {
      id: "1",
      name: "John Smith",
      role: "Founder & CEO",
      bio: "John founded the company in 2020...",
      image: "/team/john.jpg",
      featured: true,
    },
    // Regular members...
  ]}
/>
```

### With Department Filter

```tsx
<Team
  title="Our Team"
  members={teamMembers}
  showFilter
  variant="grid"
  columns={3}
/>
```

### Compact List

```tsx
<Team
  variant="compact"
  members={teamMembers}
  showFilter={false}
/>
```

### With Member Links

```tsx
<Team
  members={teamMembers}
  memberLinkPattern="/team/[id]"
/>
```

## Performance

### Image Optimization

- Team photos use Next.js Image component
- Consider using blur placeholders
- Lazy loading for off-screen members

### Animation Performance

- Use `layout` prop sparingly
- Filter animations use AnimatePresence
- Disable animations for reduced motion

## Accessibility

### Required Attributes

- Alt text on all member images
- Social links have aria-labels
- Proper heading hierarchy

### Screen Reader

- Member cards announce name and role
- Social links describe destination
- Filter buttons describe current state

### Keyboard Navigation

- All social links are focusable
- Filter buttons support keyboard
- Card interactions are accessible

## Dependencies

```json
{
  "dependencies": {
    "framer-motion": "^11.0.0",
    "lucide-react": "^0.460.0"
  }
}
```

## States

| State | Description | Visual Change |
|-------|-------------|---------------|
| Default | Team grid displayed normally | Cards visible with photos |
| Filtered | Department filter applied | Only matching members shown |
| Hover | Card is being hovered | Image scales, overlay appears |
| Focused | Card has keyboard focus | Focus ring around card |
| Featured | Member marked as featured | Larger layout, more details |
| Loading | Images still loading | Skeleton or blur placeholder |
| Animated | Cards animating into view | Staggered fade/slide effect |

## Anti-patterns

### 1. Not optimizing team member images

```tsx
// Bad: Using unoptimized img tags
<img src={member.image} alt={member.name} />

// Good: Use Next.js Image with proper sizing
<Image
  src={member.image}
  alt={member.name}
  fill
  sizes="(max-width: 768px) 50vw, 25vw"
  className="object-cover"
  placeholder="blur"
  blurDataURL={member.blurDataUrl}
/>
```

### 2. Social links opening in same tab without warning

```tsx
// Bad: External links without indication
<a href={social.url}>
  <TwitterIcon />
</a>

// Good: External links open in new tab with proper attributes
<a
  href={social.url}
  target="_blank"
  rel="noopener noreferrer"
  aria-label={`${member.name}'s ${social.type} profile (opens in new tab)`}
>
  <TwitterIcon />
</a>
```

### 3. Filter buttons not showing current state

```tsx
// Bad: Can't tell which filter is active
<button onClick={() => setFilter('engineering')}>
  Engineering
</button>

// Good: Visual indication of active filter
<button
  onClick={() => setFilter('engineering')}
  className={cn(
    filter === 'engineering'
      ? 'bg-primary text-primary-foreground'
      : 'bg-secondary'
  )}
  aria-pressed={filter === 'engineering'}
>
  Engineering
</button>
```

### 4. Not handling empty filter results

```tsx
// Bad: Shows empty grid with no feedback
{filteredMembers.map((member) => (
  <MemberCard member={member} />
))}

// Good: Show message when filter has no results
{filteredMembers.length === 0 ? (
  <div className="col-span-full text-center py-12">
    <p className="text-muted-foreground">
      No team members found in {activeFilter}.
    </p>
    <button
      onClick={() => setActiveFilter(null)}
      className="mt-2 text-primary"
    >
      Clear filter
    </button>
  </div>
) : (
  filteredMembers.map((member) => (
    <MemberCard key={member.id} member={member} />
  ))
)}
```

## Related Skills

### Composes Into
- [templates/about-page](../templates/about-page.md)
- [templates/marketing-layout](../templates/marketing-layout.md)

---

## Changelog

### 2.0.0 (2025-01-17)
- Standardized to atomic design system v2
- Updated frontmatter schema
- Added explicit composition references

### 1.0.0 (2025-01-16)
- Initial implementation
- Four layout variants
- Department filtering
- Social links with hover overlay
