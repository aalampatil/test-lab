function validOrigin(value, suffix) {
  try {
    const url = new URL(value);
    return (
      url.protocol === 'https:' &&
      !url.username &&
      !url.password &&
      url.pathname === '/' &&
      !url.search &&
      !url.hash &&
      (!suffix || url.hostname.endsWith(suffix))
    );
  } catch {
    return false;
  }
}

export function inspectConfiguration(env, { production = false } = {}) {
  const checks = [];
  const check = (name, valid, message) =>
    checks.push({ name, status: valid ? 'pass' : 'fail', message });
  const publishable = env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || '';
  const secret = env.CLERK_SECRET_KEY || '';
  check(
    'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
    /^pk_(test|live)_[A-Za-z0-9_-]+$/.test(publishable),
    'A Clerk publishable key is required for accounts.',
  );
  check(
    'CLERK_SECRET_KEY',
    /^sk_(test|live)_[A-Za-z0-9_-]+$/.test(secret),
    'A server-only Clerk secret key is required.',
  );
  check(
    'Clerk environment',
    Boolean(publishable && secret) && publishable.split('_')[1] === secret.split('_')[1],
    'The Clerk keys must belong to the same development/production environment.',
  );
  check(
    'NEXT_PUBLIC_CONVEX_URL',
    validOrigin(env.NEXT_PUBLIC_CONVEX_URL, '.convex.cloud'),
    env.CLOUD_URL && !env.NEXT_PUBLIC_CONVEX_URL
      ? 'Copy the existing CLOUD_URL into NEXT_PUBLIC_CONVEX_URL; CLOUD_URL is not read by the app.'
      : 'Use the HTTPS .convex.cloud deployment origin, not the HTTP actions URL.',
  );
  const exposedSecret = Object.keys(env).some(
    (name) =>
      name.startsWith('NEXT_PUBLIC_') &&
      /SECRET|PRIVATE|DEPLOY_KEY|ACCESS_TOKEN/.test(name) &&
      env[name],
  );
  check(
    'Server secret scope',
    !exposedSecret,
    'Server credentials must not use NEXT_PUBLIC_ names.',
  );
  if (production) {
    check(
      'Production Clerk keys',
      publishable.startsWith('pk_live_') && secret.startsWith('sk_live_'),
      'Production accounts require production Clerk keys.',
    );
    check(
      'CONVEX_DEPLOY_KEY',
      Boolean(env.CONVEX_DEPLOY_KEY),
      'A private deployment key is required for the Vercel backend deployment.',
    );
    check(
      'Deployment separation',
      !env.CONVEX_DEPLOYMENT?.startsWith('dev:'),
      'Production must not target a development Convex deployment.',
    );
  }
  return { ready: checks.every((item) => item.status === 'pass'), checks };
}

export function clerkIssuerFromKey(key) {
  if (!/^pk_(test|live)_/.test(key || '')) return null;
  const host = Buffer.from(key.replace(/^pk_(test|live)_/, ''), 'base64url')
    .toString('utf8')
    .replace(/\$$/, '');
  return validOrigin(`https://${host}`) && host.includes('.') ? `https://${host}` : null;
}

export async function inspectLiveConfiguration(env, fetcher = fetch) {
  const checks = [];
  const issuer = clerkIssuerFromKey(env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);
  try {
    const response = await fetcher('https://api.clerk.com/v1/jwt_templates', {
      headers: { Authorization: `Bearer ${env.CLERK_SECRET_KEY}` },
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok)
      checks.push({
        name: 'Clerk API credentials',
        status: 'fail',
        message: 'Clerk did not accept the configured credentials.',
      });
    else {
      checks.push({
        name: 'Clerk API credentials',
        status: 'pass',
        message: 'Clerk accepted the server credentials.',
      });
      const templates = await response.json();
      const template = Array.isArray(templates)
        ? templates.find((item) => item.name === 'convex')
        : null;
      checks.push({
        name: 'Clerk Convex JWT template',
        status: template?.claims?.aud === 'convex' ? 'pass' : 'fail',
        message: 'The convex JWT template must have audience convex.',
      });
    }
  } catch {
    checks.push({
      name: 'Clerk API reachability',
      status: 'fail',
      message: 'Could not reach Clerk. Check network access and retry.',
    });
  }
  if (issuer) {
    try {
      const response = await fetcher(`${issuer}/.well-known/openid-configuration`, {
        signal: AbortSignal.timeout(10000),
      });
      const config = response.ok ? await response.json() : null;
      checks.push({
        name: 'Clerk issuer discovery',
        status: config?.issuer === issuer ? 'pass' : 'fail',
        message: 'The publishable key must resolve to a valid Clerk issuer.',
      });
    } catch {
      checks.push({
        name: 'Clerk issuer discovery',
        status: 'fail',
        message: 'Could not verify the Clerk issuer.',
      });
    }
  }
  try {
    const response = await fetcher(`${env.NEXT_PUBLIC_CONVEX_URL}/api/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: 'progress:get', args: {}, format: 'json' }),
      signal: AbortSignal.timeout(10000),
    });
    const result = await response.json();
    const deniesGuest =
      result.status === 'error' &&
      typeof result.errorMessage === 'string' &&
      result.errorMessage.includes('Sign in to access progress.');
    checks.push({
      name: 'Convex progress deployment',
      status: deniesGuest ? 'pass' : 'fail',
      message: deniesGuest
        ? 'The deployed progress query rejects anonymous access.'
        : 'The expected protected progress query was not confirmed. Deploy the current functions and retry.',
    });
  } catch {
    checks.push({
      name: 'Convex reachability',
      status: 'fail',
      message: 'Could not reach the configured Convex deployment.',
    });
  }
  return checks;
}
