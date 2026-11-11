import { describe, expect, it } from 'vitest';
import {
  inspectConfiguration,
  inspectLiveConfiguration,
} from '../../scripts/lib/configuration.mjs';

const environment = {
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: `pk_test_${Buffer.from('example.clerk.accounts.dev$').toString('base64url')}`,
  CLERK_SECRET_KEY: 'sk_test_example',
  NEXT_PUBLIC_CONVEX_URL: 'https://example.convex.cloud',
};

describe('credential-safe configuration checks', () => {
  it('accepts development configuration without disclosing values', () => {
    const result = inspectConfiguration(environment);
    expect(result.ready).toBe(true);
    expect(JSON.stringify(result)).not.toContain(environment.CLERK_SECRET_KEY);
    expect(JSON.stringify(result)).not.toContain(environment.NEXT_PUBLIC_CONVEX_URL);
  });
  it('catches URL aliases, HTTP action URLs, mixed keys, and public secrets', () => {
    expect(
      inspectConfiguration({
        ...environment,
        NEXT_PUBLIC_CONVEX_URL: '',
        CLOUD_URL: environment.NEXT_PUBLIC_CONVEX_URL,
      }).ready,
    ).toBe(false);
    expect(
      inspectConfiguration({
        ...environment,
        NEXT_PUBLIC_CONVEX_URL: 'https://example.convex.site',
      }).ready,
    ).toBe(false);
    expect(
      inspectConfiguration({ ...environment, CLERK_SECRET_KEY: 'sk_live_example' }).ready,
    ).toBe(false);
    expect(
      inspectConfiguration({ ...environment, NEXT_PUBLIC_CLERK_SECRET_KEY: 'secret' }).ready,
    ).toBe(false);
  });
  it('rejects development credentials for production', () => {
    expect(inspectConfiguration(environment, { production: true }).ready).toBe(false);
  });
  it('checks live services without sending Clerk credentials to Convex or leaking responses', async () => {
    const calls: { url: string; headers?: HeadersInit }[] = [];
    const checks = await inspectLiveConfiguration(
      environment,
      async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = String(input);
        calls.push({ url, headers: init?.headers });
        if (url.includes('api.clerk.com'))
          return Response.json([{ name: 'convex', claims: { aud: 'convex' } }]);
        if (url.includes('openid-configuration'))
          return Response.json({ issuer: 'https://example.clerk.accounts.dev' });
        return Response.json({ status: 'error', errorMessage: 'Sign in to access progress.' });
      },
    );
    expect(checks.every((check) => check.status === 'pass')).toBe(true);
    expect(calls.find((call) => call.url.includes('convex.cloud'))?.headers).not.toHaveProperty(
      'Authorization',
    );
    expect(JSON.stringify(checks)).not.toContain(environment.CLERK_SECRET_KEY);
  });
});
