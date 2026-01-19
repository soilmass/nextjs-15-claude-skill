---
id: pt-sso
name: Sso
version: 2.0.0
layer: L5
category: auth
description: Implement SAML and OIDC-based SSO for enterprise authentication
tags: [auth, sso]
composes: []
dependencies: []
formula: "SSO = DomainDetection + (SAML | OIDC) Config + IdPRedirect + CallbackHandler + SessionCreate"
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# Single Sign-On (SSO) Pattern

## When to Use

- For enterprise customers requiring centralized authentication
- When organizations need to enforce their identity provider
- For compliance with enterprise security policies
- When integrating with Okta, Azure AD, or Google Workspace
- For B2B SaaS applications with organization-level auth

## Composition Diagram

```
SSO Architecture
================

1. Email Domain Detection:
[Email: user@company.com] -> [Detect: company.com] -> [SSO Required]

2. SSO Configuration (Admin):
+------------------------------------------+
|  SSO Settings                            |
|  Provider: [SAML v] / [OIDC v]           |
|  +------------------------------------+  |
|  | IdP URL: https://idp.company.com  |  |
|  +------------------------------------+  |
|  | Certificate: [Upload .pem]        |  |
|  +------------------------------------+  |
|  [ Test Connection ] [ Save ]            |
+------------------------------------------+

3. Login Flow:
[Enter Email] -> [Domain Match] -> [Redirect to IdP]
                                         |
[Session Created] <- [Validate Response] <-+
```

## Overview

Single Sign-On enables users to authenticate once and access multiple applications. This pattern covers implementing SAML 2.0 and OIDC-based SSO for enterprise customers in Next.js 15.

## Implementation

### SSO Configuration Types

```typescript
// lib/sso/types.ts
export type SSOProvider = 'saml' | 'oidc';

export interface SAMLConfig {
  provider: 'saml';
  entryPoint: string; // IdP login URL
  issuer: string; // SP entity ID
  cert: string; // IdP certificate
  callbackUrl: string;
  signatureAlgorithm?: 'sha256' | 'sha512';
  wantAuthnResponseSigned?: boolean;
  wantAssertionsSigned?: boolean;
}

export interface OIDCConfig {
  provider: 'oidc';
  issuer: string;
  clientId: string;
  clientSecret: string;
  authorizationUrl: string;
  tokenUrl: string;
  userInfoUrl: string;
  callbackUrl: string;
  scopes: string[];
}

export type SSOConfig = SAMLConfig | OIDCConfig;

export interface Organization {
  id: string;
  name: string;
  domain: string;
  ssoEnabled: boolean;
  ssoConfig?: SSOConfig;
}
```

### Organization SSO Service

```typescript
// lib/sso/organization-service.ts
import { prisma } from '@/lib/prisma';
import type { Organization, SSOConfig } from './types';

export async function getOrganizationByDomain(domain: string): Promise<Organization | null> {
  const org = await prisma.organization.findFirst({
    where: {
      domains: {
        has: domain,
      },
    },
    select: {
      id: true,
      name: true,
      domain: true,
      ssoEnabled: true,
      ssoConfig: true,
    },
  });

  return org as Organization | null;
}

export async function getOrganizationByEmail(email: string): Promise<Organization | null> {
  const domain = email.split('@')[1];
  return getOrganizationByDomain(domain);
}

export async function updateSSOConfig(
  organizationId: string,
  config: SSOConfig
): Promise<void> {
  await prisma.organization.update({
    where: { id: organizationId },
    data: {
      ssoEnabled: true,
      ssoConfig: config as any,
    },
  });
}
```

### SAML Authentication

```typescript
// lib/sso/saml.ts
import { SignedXml } from 'xml-crypto';
import { DOMParser } from '@xmldom/xmldom';
import { deflateRaw } from 'zlib';
import { promisify } from 'util';
import type { SAMLConfig } from './types';

const deflate = promisify(deflateRaw);

export class SAMLAuth {
  private config: SAMLConfig;

  constructor(config: SAMLConfig) {
    this.config = config;
  }

  // Generate SAML authentication request
  async createAuthRequest(relayState?: string): Promise<string> {
    const id = `_${crypto.randomUUID()}`;
    const issueInstant = new Date().toISOString();

    const request = `
      <samlp:AuthnRequest
        xmlns:samlp="urn:oasis:names:tc:SAML:2.0:protocol"
        xmlns:saml="urn:oasis:names:tc:SAML:2.0:assertion"
        ID="${id}"
        Version="2.0"
        IssueInstant="${issueInstant}"
        Destination="${this.config.entryPoint}"
        AssertionConsumerServiceURL="${this.config.callbackUrl}"
        ProtocolBinding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST">
        <saml:Issuer>${this.config.issuer}</saml:Issuer>
        <samlp:NameIDPolicy
          Format="urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress"
          AllowCreate="true"/>
      </samlp:AuthnRequest>
    `.trim();

    // Deflate and encode
    const deflated = await deflate(Buffer.from(request));
    const encoded = deflated.toString('base64');

    // Build redirect URL
    const params = new URLSearchParams({
      SAMLRequest: encoded,
      ...(relayState && { RelayState: relayState }),
    });

    return `${this.config.entryPoint}?${params.toString()}`;
  }

  // Validate SAML response
  async validateResponse(samlResponse: string): Promise<{
    valid: boolean;
    user?: {
      email: string;
      name?: string;
      attributes: Record<string, string>;
    };
    error?: string;
  }> {
    try {
      const xml = Buffer.from(samlResponse, 'base64').toString('utf-8');
      const doc = new DOMParser().parseFromString(xml);

      // Verify signature
      const signature = doc.getElementsByTagNameNS(
        'http://www.w3.org/2000/09/xmldsig#',
        'Signature'
      )[0];

      if (!signature) {
        return { valid: false, error: 'No signature found' };
      }

      const sig = new SignedXml();
      sig.keyInfoProvider = {
        getKey: () => this.config.cert,
        getKeyInfo: () => '',
      };
      sig.loadSignature(signature);

      if (!sig.checkSignature(xml)) {
        return { valid: false, error: 'Invalid signature' };
      }

      // Extract user attributes
      const assertion = doc.getElementsByTagNameNS(
        'urn:oasis:names:tc:SAML:2.0:assertion',
        'Assertion'
      )[0];

      if (!assertion) {
        return { valid: false, error: 'No assertion found' };
      }

      // Check conditions (timestamps, audience)
      const conditions = assertion.getElementsByTagNameNS(
        'urn:oasis:names:tc:SAML:2.0:assertion',
        'Conditions'
      )[0];

      if (conditions) {
        const notBefore = conditions.getAttribute('NotBefore');
        const notOnOrAfter = conditions.getAttribute('NotOnOrAfter');
        const now = new Date();

        if (notBefore && new Date(notBefore) > now) {
          return { valid: false, error: 'Assertion not yet valid' };
        }

        if (notOnOrAfter && new Date(notOnOrAfter) <= now) {
          return { valid: false, error: 'Assertion expired' };
        }
      }

      // Extract NameID (email)
      const nameId = assertion.getElementsByTagNameNS(
        'urn:oasis:names:tc:SAML:2.0:assertion',
        'NameID'
      )[0]?.textContent;

      if (!nameId) {
        return { valid: false, error: 'No NameID found' };
      }

      // Extract attributes
      const attributes: Record<string, string> = {};
      const attributeStatements = assertion.getElementsByTagNameNS(
        'urn:oasis:names:tc:SAML:2.0:assertion',
        'Attribute'
      );

      for (let i = 0; i < attributeStatements.length; i++) {
        const attr = attributeStatements[i];
        const name = attr.getAttribute('Name') || '';
        const value = attr.getElementsByTagNameNS(
          'urn:oasis:names:tc:SAML:2.0:assertion',
          'AttributeValue'
        )[0]?.textContent || '';
        attributes[name] = value;
      }

      return {
        valid: true,
        user: {
          email: nameId,
          name: attributes['displayName'] || attributes['name'],
          attributes,
        },
      };
    } catch (error) {
      return {
        valid: false,
        error: error instanceof Error ? error.message : 'Validation failed',
      };
    }
  }
}
```

### OIDC Authentication

```typescript
// lib/sso/oidc.ts
import { jwtVerify, createRemoteJWKSet } from 'jose';
import type { OIDCConfig } from './types';

export class OIDCAuth {
  private config: OIDCConfig;
  private jwks: ReturnType<typeof createRemoteJWKSet> | null = null;

  constructor(config: OIDCConfig) {
    this.config = config;
  }

  // Generate authorization URL
  createAuthUrl(state: string, nonce: string): string {
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.config.clientId,
      redirect_uri: this.config.callbackUrl,
      scope: this.config.scopes.join(' '),
      state,
      nonce,
    });

    return `${this.config.authorizationUrl}?${params.toString()}`;
  }

  // Exchange code for tokens
  async exchangeCode(code: string): Promise<{
    accessToken: string;
    idToken: string;
    refreshToken?: string;
  }> {
    const response = await fetch(this.config.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: this.config.callbackUrl,
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error_description || 'Token exchange failed');
    }

    const data = await response.json();

    return {
      accessToken: data.access_token,
      idToken: data.id_token,
      refreshToken: data.refresh_token,
    };
  }

  // Validate ID token
  async validateIdToken(
    idToken: string,
    nonce: string
  ): Promise<{
    valid: boolean;
    claims?: {
      sub: string;
      email: string;
      name?: string;
      [key: string]: unknown;
    };
    error?: string;
  }> {
    try {
      // Get JWKS
      if (!this.jwks) {
        this.jwks = createRemoteJWKSet(
          new URL(`${this.config.issuer}/.well-known/jwks.json`)
        );
      }

      const { payload } = await jwtVerify(idToken, this.jwks, {
        issuer: this.config.issuer,
        audience: this.config.clientId,
      });

      // Verify nonce
      if (payload.nonce !== nonce) {
        return { valid: false, error: 'Invalid nonce' };
      }

      return {
        valid: true,
        claims: payload as {
          sub: string;
          email: string;
          name?: string;
          [key: string]: unknown;
        },
      };
    } catch (error) {
      return {
        valid: false,
        error: error instanceof Error ? error.message : 'Validation failed',
      };
    }
  }

  // Get user info
  async getUserInfo(accessToken: string): Promise<Record<string, unknown>> {
    const response = await fetch(this.config.userInfoUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user info');
    }

    return response.json();
  }
}
```

### SSO Route Handlers

```typescript
// app/api/auth/sso/[...action]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { getOrganizationByEmail, getOrganizationByDomain } from '@/lib/sso/organization-service';
import { SAMLAuth } from '@/lib/sso/saml';
import { OIDCAuth } from '@/lib/sso/oidc';
import type { SAMLConfig, OIDCConfig } from '@/lib/sso/types';

interface RouteParams {
  params: Promise<{ action: string[] }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const { action } = await params;
  const [provider, step] = action;

  // Initiate SSO login
  if (step === 'login') {
    const email = request.nextUrl.searchParams.get('email');
    const domain = request.nextUrl.searchParams.get('domain');

    const org = email
      ? await getOrganizationByEmail(email)
      : domain
      ? await getOrganizationByDomain(domain)
      : null;

    if (!org || !org.ssoEnabled || !org.ssoConfig) {
      return NextResponse.redirect(
        new URL('/login?error=sso_not_configured', request.url)
      );
    }

    const config = org.ssoConfig;

    if (config.provider === 'saml') {
      const saml = new SAMLAuth(config as SAMLConfig);
      const redirectUrl = await saml.createAuthRequest(org.id);
      return NextResponse.redirect(redirectUrl);
    }

    if (config.provider === 'oidc') {
      const oidc = new OIDCAuth(config as OIDCConfig);
      const state = crypto.randomUUID();
      const nonce = crypto.randomUUID();

      // Store state and nonce in cookies
      const cookieStore = await cookies();
      cookieStore.set('sso_state', state, { httpOnly: true, maxAge: 600 });
      cookieStore.set('sso_nonce', nonce, { httpOnly: true, maxAge: 600 });
      cookieStore.set('sso_org', org.id, { httpOnly: true, maxAge: 600 });

      const authUrl = oidc.createAuthUrl(state, nonce);
      return NextResponse.redirect(authUrl);
    }
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  const { action } = await params;
  const [provider, step] = action;

  // SAML callback (POST binding)
  if (provider === 'saml' && step === 'callback') {
    const formData = await request.formData();
    const samlResponse = formData.get('SAMLResponse') as string;
    const relayState = formData.get('RelayState') as string;

    if (!samlResponse || !relayState) {
      return NextResponse.redirect(new URL('/login?error=invalid_response', request.url));
    }

    const org = await prisma.organization.findUnique({
      where: { id: relayState },
    });

    if (!org?.ssoConfig || org.ssoConfig.provider !== 'saml') {
      return NextResponse.redirect(new URL('/login?error=invalid_org', request.url));
    }

    const saml = new SAMLAuth(org.ssoConfig as SAMLConfig);
    const result = await saml.validateResponse(samlResponse);

    if (!result.valid || !result.user) {
      console.error('SAML validation failed:', result.error);
      return NextResponse.redirect(
        new URL(`/login?error=${encodeURIComponent(result.error || 'validation_failed')}`, request.url)
      );
    }

    // Create or update user
    const user = await findOrCreateSSOUser(result.user.email, org.id, result.user.name);

    // Create session
    const session = await createSession(user.id);

    const response = NextResponse.redirect(new URL('/dashboard', request.url));
    response.cookies.set('session', session.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}

// OIDC callback handler
// app/api/auth/sso/oidc/callback/route.ts
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code');
  const state = request.nextUrl.searchParams.get('state');
  const error = request.nextUrl.searchParams.get('error');

  if (error) {
    return NextResponse.redirect(new URL(`/login?error=${error}`, request.url));
  }

  const cookieStore = await cookies();
  const savedState = cookieStore.get('sso_state')?.value;
  const savedNonce = cookieStore.get('sso_nonce')?.value;
  const orgId = cookieStore.get('sso_org')?.value;

  if (!code || !state || state !== savedState || !savedNonce || !orgId) {
    return NextResponse.redirect(new URL('/login?error=invalid_state', request.url));
  }

  const org = await prisma.organization.findUnique({
    where: { id: orgId },
  });

  if (!org?.ssoConfig || org.ssoConfig.provider !== 'oidc') {
    return NextResponse.redirect(new URL('/login?error=invalid_org', request.url));
  }

  const oidc = new OIDCAuth(org.ssoConfig as OIDCConfig);

  try {
    const tokens = await oidc.exchangeCode(code);
    const result = await oidc.validateIdToken(tokens.idToken, savedNonce);

    if (!result.valid || !result.claims) {
      throw new Error(result.error || 'Token validation failed');
    }

    const user = await findOrCreateSSOUser(
      result.claims.email,
      org.id,
      result.claims.name
    );

    const session = await createSession(user.id);

    const response = NextResponse.redirect(new URL('/dashboard', request.url));

    // Clear SSO cookies
    response.cookies.delete('sso_state');
    response.cookies.delete('sso_nonce');
    response.cookies.delete('sso_org');

    // Set session cookie
    response.cookies.set('session', session.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch (error) {
    console.error('OIDC callback error:', error);
    return NextResponse.redirect(
      new URL('/login?error=auth_failed', request.url)
    );
  }
}

async function findOrCreateSSOUser(email: string, orgId: string, name?: string) {
  return prisma.user.upsert({
    where: { email },
    update: {
      lastLoginAt: new Date(),
    },
    create: {
      email,
      name,
      organizationId: orgId,
      authProvider: 'sso',
    },
  });
}

async function createSession(userId: string) {
  return prisma.session.create({
    data: {
      userId,
      token: crypto.randomUUID(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });
}
```

### Login Page with SSO

```tsx
// app/login/page.tsx
'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [showSSOOption, setShowSSOOption] = useState(false);
  const [ssoOrg, setSSOOrg] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  const checkSSO = async () => {
    const response = await fetch(`/api/auth/sso/check?email=${encodeURIComponent(email)}`);
    const data = await response.json();
    
    if (data.ssoEnabled) {
      setShowSSOOption(true);
      setSSOOrg(data.organizationName);
    } else {
      // Show password form
      setShowSSOOption(false);
    }
  };

  const handleSSOLogin = () => {
    window.location.href = `/api/auth/sso/login?email=${encodeURIComponent(email)}`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-6">Sign In</h1>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded">
            {error === 'sso_not_configured' && 'SSO is not configured for your organization'}
            {error === 'auth_failed' && 'Authentication failed. Please try again.'}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={checkSSO}
              className="w-full p-3 border rounded"
              placeholder="you@company.com"
            />
          </div>

          {showSSOOption ? (
            <div className="space-y-3">
              <p className="text-sm text-gray-600">
                Your organization ({ssoOrg}) uses Single Sign-On.
              </p>
              <button
                onClick={handleSSOLogin}
                className="w-full py-3 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Continue with SSO
              </button>
            </div>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium mb-1">Password</label>
                <input
                  type="password"
                  className="w-full p-3 border rounded"
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Sign In
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
```

## Variants

### SP-Initiated vs IdP-Initiated

```typescript
// Support IdP-initiated SAML (user starts from IdP)
export async function handleIdPInitiated(samlResponse: string) {
  // No RelayState - need to extract org from assertion
  const decoded = Buffer.from(samlResponse, 'base64').toString('utf-8');
  // Parse issuer to identify IdP and map to org
}
```

## Anti-Patterns

```typescript
// Bad: Not validating SAML response signature
const user = extractUserFromResponse(samlResponse);
// Anyone could forge a response!

// Good: Always validate signature
const result = await saml.validateResponse(samlResponse);
if (!result.valid) throw new Error('Invalid response');

// Bad: Not checking assertion conditions
// Expired or not-yet-valid assertions could be replayed

// Good: Check all conditions
if (notBefore && new Date(notBefore) > now) {
  return { valid: false, error: 'Assertion not yet valid' };
}
```

## Related Skills

- `next-auth` - NextAuth.js integration
- `oauth-providers` - OAuth configuration
- `session-management` - Session handling
- `jwt-tokens` - Token management

## Changelog

### 2.0.0 (2025-01-18)
- Standardized to atomic design system v2
- Updated frontmatter schema

- 1.0.0: Initial SSO pattern with SAML and OIDC
