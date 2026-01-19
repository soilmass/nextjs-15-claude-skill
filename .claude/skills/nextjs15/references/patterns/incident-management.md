---
id: pt-incident-management
name: Incident Management
version: 1.0.0
layer: L5
category: operations
description: Implement incident response workflows with alerting, escalation, and resolution tracking
tags: [incident, ops, alerting, escalation, on-call, statuspage, next15, react19]
composes: []
dependencies: []
formula: "IncidentManagement = Detection + Alerting + Escalation + Resolution + Postmortem"
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# Incident Management

## When to Use

- When building internal operations dashboards
- For managing production incidents
- When implementing on-call rotations
- For status page management
- When tracking incident resolution

## Overview

This pattern implements incident management with detection, alerting, escalation policies, and resolution tracking. It integrates with PagerDuty/Opsgenie-style workflows.

## Database Schema

```prisma
// prisma/schema.prisma
model Incident {
  id            String          @id @default(cuid())
  title         String
  description   String
  severity      Severity
  status        IncidentStatus  @default(INVESTIGATING)

  // Tracking
  detectedAt    DateTime        @default(now())
  acknowledgedAt DateTime?
  resolvedAt    DateTime?

  // Ownership
  reportedById  String
  assignedToId  String?

  // Relations
  timeline      IncidentEvent[]
  affectedServices Service[]

  createdAt     DateTime        @default(now())
  updatedAt     DateTime        @updatedAt

  @@index([status])
  @@index([severity])
  @@index([detectedAt])
}

enum Severity {
  SEV1  // Critical - Full outage
  SEV2  // Major - Significant impact
  SEV3  // Minor - Limited impact
  SEV4  // Low - Minimal impact
}

enum IncidentStatus {
  INVESTIGATING
  IDENTIFIED
  MONITORING
  RESOLVED
}

model IncidentEvent {
  id          String   @id @default(cuid())
  incidentId  String
  incident    Incident @relation(fields: [incidentId], references: [id])
  type        EventType
  message     String
  userId      String?
  metadata    Json?
  createdAt   DateTime @default(now())

  @@index([incidentId, createdAt])
}

enum EventType {
  CREATED
  ACKNOWLEDGED
  STATUS_CHANGE
  SEVERITY_CHANGE
  ASSIGNED
  COMMENT
  RESOLVED
  ESCALATED
}

model OnCallSchedule {
  id          String   @id @default(cuid())
  teamId      String
  userId      String
  startTime   DateTime
  endTime     DateTime

  @@index([teamId, startTime, endTime])
}

model EscalationPolicy {
  id          String   @id @default(cuid())
  name        String
  teamId      String
  levels      Json     // Array of escalation levels

  @@unique([teamId, name])
}
```

## Incident Service

```typescript
// lib/incidents/service.ts
import { prisma } from "@/lib/db";
import { sendAlert } from "./alerting";
import { Severity, IncidentStatus, EventType } from "@prisma/client";

interface CreateIncidentParams {
  title: string;
  description: string;
  severity: Severity;
  reportedById: string;
  affectedServiceIds?: string[];
}

export async function createIncident(params: CreateIncidentParams) {
  const incident = await prisma.incident.create({
    data: {
      title: params.title,
      description: params.description,
      severity: params.severity,
      reportedById: params.reportedById,
      affectedServices: params.affectedServiceIds ? {
        connect: params.affectedServiceIds.map((id) => ({ id })),
      } : undefined,
      timeline: {
        create: {
          type: "CREATED",
          message: `Incident created with severity ${params.severity}`,
          userId: params.reportedById,
        },
      },
    },
    include: { affectedServices: true },
  });

  // Alert on-call team
  await alertOnCall(incident);

  return incident;
}

export async function acknowledgeIncident(incidentId: string, userId: string) {
  const incident = await prisma.incident.update({
    where: { id: incidentId },
    data: {
      acknowledgedAt: new Date(),
      assignedToId: userId,
      timeline: {
        create: {
          type: "ACKNOWLEDGED",
          message: "Incident acknowledged",
          userId,
        },
      },
    },
  });

  return incident;
}

export async function updateIncidentStatus(
  incidentId: string,
  status: IncidentStatus,
  userId: string,
  message?: string
) {
  const data: any = {
    status,
    timeline: {
      create: {
        type: "STATUS_CHANGE",
        message: message || `Status changed to ${status}`,
        userId,
        metadata: { newStatus: status },
      },
    },
  };

  if (status === "RESOLVED") {
    data.resolvedAt = new Date();
  }

  const incident = await prisma.incident.update({
    where: { id: incidentId },
    data,
  });

  // Notify stakeholders
  await notifyStatusChange(incident, status);

  return incident;
}

export async function addIncidentComment(
  incidentId: string,
  userId: string,
  message: string
) {
  return prisma.incidentEvent.create({
    data: {
      incidentId,
      type: "COMMENT",
      message,
      userId,
    },
  });
}

export async function escalateIncident(incidentId: string, userId: string) {
  const incident = await prisma.incident.findUnique({
    where: { id: incidentId },
    include: { affectedServices: true },
  });

  if (!incident) throw new Error("Incident not found");

  // Get escalation policy
  const policy = await getEscalationPolicy(incident);

  // Find next escalation level
  const nextLevel = await getNextEscalationLevel(incidentId, policy);

  if (nextLevel) {
    await prisma.incidentEvent.create({
      data: {
        incidentId,
        type: "ESCALATED",
        message: `Escalated to ${nextLevel.name}`,
        userId,
        metadata: { level: nextLevel },
      },
    });

    // Alert next level
    await alertEscalationLevel(incident, nextLevel);
  }

  return incident;
}
```

## Alerting System

```typescript
// lib/incidents/alerting.ts
import { prisma } from "@/lib/db";
import { Incident, Severity } from "@prisma/client";

interface AlertChannel {
  type: "email" | "slack" | "pagerduty" | "sms";
  target: string;
}

const SEVERITY_CHANNELS: Record<Severity, AlertChannel[]> = {
  SEV1: [
    { type: "pagerduty", target: "critical" },
    { type: "slack", target: "#incidents-critical" },
    { type: "sms", target: "on-call" },
  ],
  SEV2: [
    { type: "pagerduty", target: "high" },
    { type: "slack", target: "#incidents" },
  ],
  SEV3: [
    { type: "slack", target: "#incidents" },
  ],
  SEV4: [
    { type: "slack", target: "#incidents-low" },
  ],
};

export async function alertOnCall(incident: Incident) {
  const channels = SEVERITY_CHANNELS[incident.severity];

  for (const channel of channels) {
    await sendAlert(channel, incident);
  }
}

export async function sendAlert(channel: AlertChannel, incident: Incident) {
  switch (channel.type) {
    case "slack":
      await sendSlackAlert(channel.target, incident);
      break;
    case "pagerduty":
      await sendPagerDutyAlert(channel.target, incident);
      break;
    case "email":
      await sendEmailAlert(channel.target, incident);
      break;
    case "sms":
      await sendSMSAlert(channel.target, incident);
      break;
  }
}

async function sendSlackAlert(channel: string, incident: Incident) {
  const color = {
    SEV1: "#dc2626",
    SEV2: "#ea580c",
    SEV3: "#ca8a04",
    SEV4: "#65a30d",
  }[incident.severity];

  await fetch(process.env.SLACK_WEBHOOK_URL!, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      channel,
      attachments: [{
        color,
        title: `[${incident.severity}] ${incident.title}`,
        text: incident.description,
        fields: [
          { title: "Status", value: incident.status, short: true },
          { title: "Severity", value: incident.severity, short: true },
        ],
        actions: [
          {
            type: "button",
            text: "Acknowledge",
            url: `${process.env.NEXT_PUBLIC_APP_URL}/incidents/${incident.id}`,
          },
        ],
      }],
    }),
  });
}

async function sendPagerDutyAlert(severity: string, incident: Incident) {
  await fetch("https://events.pagerduty.com/v2/enqueue", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      routing_key: process.env.PAGERDUTY_ROUTING_KEY,
      event_action: "trigger",
      dedup_key: incident.id,
      payload: {
        summary: `[${incident.severity}] ${incident.title}`,
        severity: severity === "critical" ? "critical" : "error",
        source: "incident-management",
        custom_details: {
          description: incident.description,
          incident_url: `${process.env.NEXT_PUBLIC_APP_URL}/incidents/${incident.id}`,
        },
      },
    }),
  });
}
```

## Incident Dashboard Component

```typescript
// components/incidents/incident-list.tsx
"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { AlertTriangle, Clock, CheckCircle } from "lucide-react";
import type { Incident, Severity, IncidentStatus } from "@prisma/client";

const severityColors: Record<Severity, string> = {
  SEV1: "bg-red-100 text-red-800 border-red-300",
  SEV2: "bg-orange-100 text-orange-800 border-orange-300",
  SEV3: "bg-yellow-100 text-yellow-800 border-yellow-300",
  SEV4: "bg-green-100 text-green-800 border-green-300",
};

const statusIcons: Record<IncidentStatus, React.ReactNode> = {
  INVESTIGATING: <AlertTriangle className="h-4 w-4 text-red-500" />,
  IDENTIFIED: <Clock className="h-4 w-4 text-orange-500" />,
  MONITORING: <Clock className="h-4 w-4 text-yellow-500" />,
  RESOLVED: <CheckCircle className="h-4 w-4 text-green-500" />,
};

export function IncidentList({ incidents }: { incidents: Incident[] }) {
  const [filter, setFilter] = useState<IncidentStatus | "all">("all");

  const filtered = filter === "all"
    ? incidents
    : incidents.filter((i) => i.status === filter);

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {["all", "INVESTIGATING", "IDENTIFIED", "MONITORING", "RESOLVED"].map((status) => (
          <Button
            key={status}
            variant={filter === status ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(status as any)}
          >
            {status === "all" ? "All" : status}
          </Button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map((incident) => (
          <IncidentCard key={incident.id} incident={incident} />
        ))}
      </div>
    </div>
  );
}

function IncidentCard({ incident }: { incident: Incident }) {
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          {statusIcons[incident.status]}
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-medium">{incident.title}</h3>
              <Badge className={severityColors[incident.severity]}>
                {incident.severity}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {incident.description}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Detected {formatDistanceToNow(incident.detectedAt, { addSuffix: true })}
            </p>
          </div>
        </div>

        <Button variant="outline" size="sm" asChild>
          <a href={`/incidents/${incident.id}`}>View</a>
        </Button>
      </div>
    </Card>
  );
}
```

## Incident Timeline Component

```typescript
// components/incidents/incident-timeline.tsx
"use client";

import { formatDistanceToNow } from "date-fns";
import { IncidentEvent, EventType } from "@prisma/client";

const eventLabels: Record<EventType, string> = {
  CREATED: "Incident created",
  ACKNOWLEDGED: "Acknowledged",
  STATUS_CHANGE: "Status updated",
  SEVERITY_CHANGE: "Severity changed",
  ASSIGNED: "Assigned",
  COMMENT: "Comment added",
  RESOLVED: "Resolved",
  ESCALATED: "Escalated",
};

export function IncidentTimeline({ events }: { events: IncidentEvent[] }) {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold">Timeline</h3>
      <div className="relative border-l-2 border-muted pl-4 space-y-4">
        {events.map((event) => (
          <div key={event.id} className="relative">
            <div className="absolute -left-[21px] w-3 h-3 bg-primary rounded-full" />
            <div>
              <p className="text-sm font-medium">{eventLabels[event.type]}</p>
              <p className="text-sm text-muted-foreground">{event.message}</p>
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(event.createdAt, { addSuffix: true })}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

## Server Actions

```typescript
// app/actions/incidents.ts
"use server";

import { auth } from "@/auth";
import {
  createIncident,
  acknowledgeIncident,
  updateIncidentStatus,
  addIncidentComment,
} from "@/lib/incidents/service";
import { revalidatePath } from "next/cache";
import { Severity, IncidentStatus } from "@prisma/client";

export async function createIncidentAction(formData: FormData) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const incident = await createIncident({
    title: formData.get("title") as string,
    description: formData.get("description") as string,
    severity: formData.get("severity") as Severity,
    reportedById: session.user.id,
  });

  revalidatePath("/incidents");
  return incident;
}

export async function acknowledgeIncidentAction(incidentId: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const incident = await acknowledgeIncident(incidentId, session.user.id);
  revalidatePath(`/incidents/${incidentId}`);
  return incident;
}

export async function updateStatusAction(
  incidentId: string,
  status: IncidentStatus,
  message?: string
) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const incident = await updateIncidentStatus(incidentId, status, session.user.id, message);
  revalidatePath(`/incidents/${incidentId}`);
  return incident;
}
```

## Anti-patterns

### Don't Skip Severity Classification

```typescript
// BAD - All incidents same priority
createIncident({ title, severity: "SEV3" });

// GOOD - Proper severity assessment
const severity = assessSeverity(impact, urgency);
createIncident({ title, severity });
```

## Related Patterns

- [health-checks](./health-checks.md)
- [alerting](./alerting.md)
- [logging](./logging.md)

---

## Changelog

### 1.0.0 (2025-01-18)
- Initial implementation
- Incident lifecycle
- Alerting integration
- Timeline tracking
- Escalation policies
