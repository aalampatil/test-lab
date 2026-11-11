import { randomUUID } from 'node:crypto';
import { mkdir, readFile, writeFile, rm } from 'node:fs/promises';
import assert from 'node:assert/strict';
import nextEnv from '@next/env';
import { createClerkClient } from '@clerk/backend';
import { ConvexHttpClient } from 'convex/browser';
import { makeFunctionReference } from 'convex/server';
import { chromium, expect } from '@playwright/test';
import { clerkIssuerFromKey } from './lib/configuration.mjs';

nextEnv.loadEnvConfig(process.cwd(), true, { info() {}, error() {} });
if (!process.argv.includes('--allow-test-users') && !process.argv.includes('--cleanup')) {
  console.error(
    'This check creates and deletes two disposable development users. Run with --allow-test-users only after the project owner approves.',
  );
  process.exit(1);
}
if (
  !process.env.CLERK_SECRET_KEY?.startsWith('sk_test_') ||
  !process.env.CONVEX_DEPLOYMENT?.startsWith('dev:')
) {
  console.error(
    'Account verification requires Clerk development keys and a cloud development Convex deployment.',
  );
  process.exit(1);
}
const baseURL = process.env.ACCOUNT_TEST_BASE_URL || 'http://localhost:3000';
if (!['127.0.0.1', 'localhost'].includes(new URL(baseURL).hostname)) {
  console.error('Browser account verification must target a local app server.');
  process.exit(1);
}
const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
const references = {
  get: makeFunctionReference('progress:get'),
  save: makeFunctionReference('progress:save'),
  remove: makeFunctionReference('progress:remove'),
};
const stateFile = '.account-verification/state.json';
const empty = { name: 'Verification', completed: [], activity: [], drafts: {}, minutes: 0 };
const apiOnly = process.argv.includes('--api-only');
let state;
let browser;
let lastPage;
const privateValues = new Set([process.env.CLERK_SECRET_KEY]);
let stage = 'initialization';

async function clientFor(userId) {
  const session = await clerk.sessions.createSession({ userId });
  const token = await clerk.sessions.getToken(session.id, 'convex');
  privateValues.add(token.jwt);
  const client = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL, { logger: false });
  client.setAuth(token.jwt);
  return client;
}

async function signIn(context, userId) {
  const page = await context.newPage();
  lastPage = page;
  await page.goto(baseURL);
  await page.waitForFunction(() => window.Clerk?.loaded, undefined, { timeout: 30000 });
  const ticket = await clerk.signInTokens.createSignInToken({ userId, expiresInSeconds: 600 });
  privateValues.add(ticket.token);
  await page.evaluate(async (token) => {
    const result = await window.Clerk.client.signIn.create({ strategy: 'ticket', ticket: token });
    if (!result.createdSessionId) throw new Error('Test sign-in did not create a session.');
    await window.Clerk.setActive({ session: result.createdSessionId });
  }, ticket.token);
  await expect(page.getByText('Progress synced to your account.', { exact: true })).toBeVisible({
    timeout: 30000,
  });
  return page;
}

async function editorFor(page) {
  await page.goto(`${baseURL}/?view=playground&lesson=first-test`);
  await expect(page.getByText('Progress synced to your account.', { exact: true })).toBeVisible({
    timeout: 30000,
  });
  await page.getByRole('button', { name: 'Simple editor', exact: true }).click();
  return page.getByRole('textbox', { name: 'Test code editor' });
}

async function cleanup() {
  await browser?.close();
  if (!state) return;
  const remaining = [];
  for (const userId of state.users) {
    try {
      const user = await clerk.users.getUser(userId);
      assert.equal(user.privateMetadata.testlabVerificationRun, state.runId);
      const client = await clientFor(userId);
      await client.mutation(references.remove, {});
      assert.equal(await client.query(references.get, {}), null);
      await clerk.users.deleteUser(userId);
    } catch {
      remaining.push(userId);
    }
  }
  if (remaining.length) {
    state.users = remaining;
    await writeFile(stateFile, JSON.stringify(state));
    console.error(
      'Some disposable test resources could not be removed. Run npm run test:accounts -- --cleanup to retry.',
    );
    process.exitCode = 1;
  } else {
    await rm(stateFile, { force: true });
    console.log('PASS: disposable Clerk users and Convex progress cleaned up.');
  }
}

try {
  try {
    state = JSON.parse(await readFile(stateFile, 'utf8'));
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
  if (process.argv.includes('--cleanup')) {
    if (!state) console.log('No saved test resources to clean up.');
  } else {
    if (state) throw new Error('A prior run needs cleanup first.');
    if (!apiOnly) {
      const issuer = clerkIssuerFromKey(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);
      const response = await fetch(`${issuer}/v1/environment`, {
        signal: AbortSignal.timeout(10000),
      });
      const settings = await response.json();
      if (!response.ok || !settings.user_settings?.attributes?.email_address?.enabled)
        throw new Error(
          'Disposable browser checks require email identification in the development instance. Keep existing login settings and use --api-only, then verify browser sign-in with a real account.',
        );
    }
    state = { runId: randomUUID(), users: [] };
    await mkdir('.account-verification', { recursive: true });
    await writeFile(stateFile, JSON.stringify(state));
    stage = 'creating disposable development users';
    for (let i = 0; i < 2; i++) {
      const user = await clerk.users.createUser({
        externalId: `testlab-verification-${state.runId}-${i}`,
        skipPasswordRequirement: true,
        firstName: 'TestLab',
        lastName: 'Verification',
        privateMetadata: { testlabVerificationRun: state.runId },
      });
      state.users.push(user.id);
      await writeFile(stateFile, JSON.stringify(state));
      // OAuth-only instances reject email fields during user creation. Attach a
      // verified synthetic identification to this disposable user for ticket login.
      if (!apiOnly)
        await clerk.emailAddresses.createEmailAddress({
          userId: user.id,
          emailAddress: `testlab-${state.runId}-${i}+clerk_test@example.com`,
          verified: true,
          primary: true,
        });
    }
    const [userA, userB] = state.users;
    stage = 'verifying live token validation and ownership';
    const a = await clientFor(userA);
    const b = await clientFor(userB);
    assert.equal(await a.query(references.get, {}), null);
    await a.mutation(references.save, {
      progress: {
        ...empty,
        name: 'Verification A',
        completed: ['first-test'],
        drafts: { 'first-test': '// private draft A' },
      },
    });
    assert.equal(await b.query(references.get, {}), null);
    await b.mutation(references.save, { progress: { ...empty, name: 'Verification B' } });
    assert.equal((await a.query(references.get, {})).drafts['first-test'], '// private draft A');
    console.log('PASS: real Clerk JWTs accepted by Convex; account progress isolated.');

    if (!apiOnly) {
      stage = 'opening the configured application';
      browser = await chromium.launch({ channel: 'chrome', headless: true });
      const contextA = await browser.newContext();
      const contextB = await browser.newContext();
      const contextOtherDevice = await browser.newContext();
      stage = 'signing in to account A';
      const pageA = await signIn(contextA, userA);
      const editorA = await editorFor(pageA);
      await expect(editorA).toHaveValue('// private draft A');
      const edited = '// account verification: saved in the browser';
      await editorA.fill(edited);
      await expect
        .poll(async () => (await a.query(references.get, {}))?.drafts['first-test'], {
          timeout: 15000,
        })
        .toBe(edited);
      stage = 'checking a second device';
      const otherDevice = await signIn(contextOtherDevice, userA);
      await expect(await editorFor(otherDevice)).toHaveValue(edited);
      stage = 'checking account B in a separate browser';
      const pageB = await signIn(contextB, userB);
      await expect(await editorFor(pageB)).not.toHaveValue(edited);
      stage = 'signing out and checking the guest workspace';
      await pageA.evaluate(() => window.Clerk.signOut());
      await expect(pageA.getByRole('button', { name: 'Sign in', exact: true })).toBeVisible();
      const guestHasPrivateDraft = await pageA.evaluate(
        (value) =>
          JSON.parse(localStorage.getItem('testlab-progress-v1') || '{}').drafts?.['first-test'] ===
          value,
        edited,
      );
      assert.equal(guestHasPrivateDraft, false);
      console.log(
        'PASS: browser sign-in, saved drafts, second-device loading, account isolation, and sign-out.',
      );
    }
  }
} catch (error) {
  console.error(
    `Account verification failed during ${stage}. No credentials or API responses were printed.`,
  );
  if (Array.isArray(error.errors)) {
    console.error(
      JSON.stringify({
        errors: error.errors.map((item) => ({ code: item.code, parameter: item.meta?.paramName })),
      }),
    );
  }
  let detail = String(error.message || error.name || 'Unknown error');
  for (const value of privateValues) if (value) detail = detail.split(value).join('[redacted]');
  console.error(detail.slice(0, 600));
  await lastPage?.screenshot({ path: '.account-verification/failure.png' }).catch(() => {});
  process.exitCode = 1;
} finally {
  await cleanup();
}
