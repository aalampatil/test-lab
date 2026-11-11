# Convex with Clerk and Vercel

The product stack is Next.js on Vercel, Clerk authentication, and Convex data
storage. Neon/PostgreSQL is no longer required. Submitted code still runs through
the restricted interpreter or a separately configured execution runner, never in
Convex database functions.

## Development

1. Add the existing Clerk application's development keys to `.env.local` as
   described in [Clerk setup](clerk-setup.md). Never share secret values in chat.
2. Connect the intended Convex project/development deployment using `npm run db:dev`.
   The CLI may require an interactive login. Keep it in development; do not select
   a production deployment for local tests.
3. Activate Clerk's Convex integration/JWT template, with audience `convex`, as
   described in [Convex's Clerk guide](https://docs.convex.dev/auth/clerk).
4. Set `CLERK_JWT_ISSUER_DOMAIN` on the **Convex development deployment** to the
   development Clerk Frontend API URL, including `https://`. This is backend
   configuration; adding it only to Next.js does not configure token verification.
5. Sync the `convex/` functions and auth configuration with `npm run db:dev`.
6. Set `NEXT_PUBLIC_CONVEX_URL` in `.env.local` to that deployment's cloud URL and
   restart Next.js. Convex's CLI usually writes this value during setup.

Run `npm run config:check` to check variable names and key environments without
printing credentials. `npm run config:check -- --live` also checks Clerk issuer
discovery, the Convex JWT template, and anonymous rejection by the deployed
progress query. These are read-only checks; they do not prove browser sign-in.
`CLOUD_URL` and `HTTP_ACTIONS_URL` alone do not configure the Next.js client.

Select a **cloud development** deployment when linking the existing project:

```sh
npx convex dev --configure existing --dev-deployment cloud --once
```

A local deployment URL in `.env.local` takes precedence over a cloud URL in `.env`.
Use the same development deployment for the client, backend functions, and Clerk
issuer configuration. Generated Convex files and local backend state are ignored.

The client uses `ConvexProviderWithClerk`. Queries wait for Convex authentication,
which can finish after Clerk sign-in. Every progress function checks
`ctx.auth.getUserIdentity()` and derives ownership from its `tokenIdentifier`.
The client never selects an owner. Mutations validate bounded progress data and
merge completion history within a transaction.

The repository uses `convex/server`'s generic function builders with schema-derived
types and a typed `ApiFromModules` client reference. A local guest build does not
need a linked deployment or generated files. Convex CLI-generated files can still
be produced during development; they are not imported by this application.

## Vercel environments

| Environment | Clerk            | Convex                                            |
| ----------- | ---------------- | ------------------------------------------------- |
| Development | Development keys | Development deployment with fake data             |
| Preview     | Development keys | Separate preview/test deployment with fake data   |
| Production  | Production keys  | Production deployment and production Clerk issuer |

On Vercel, configure `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`,
`NEXT_PUBLIC_CONVEX_URL`, and the appropriate private `CONVEX_DEPLOY_KEY`. Never
prefix the deploy key with `NEXT_PUBLIC_`. On each Convex deployment, configure
the matching `CLERK_JWT_ISSUER_DOMAIN`.

For a configured deployment, use this Vercel build override:

```sh
npx convex deploy --cmd 'npm run build'
```

Configure preview deployment keys and preview creation separately using
[Convex's Vercel guide](https://docs.convex.dev/production/hosting/vercel). Do not
reuse a production deploy key for untrusted previews. Keep the web and backend
deployment URLs aligned, and test schema changes against nonproduction data first.

## Progress behavior and limits

- Guest progress remains on the device until the learner explicitly imports it.
- Each account has a separate browser cache. Signing out remounts the guest
  workspace. Browser caches are not encryption or protection from local access.
- Server progress streams to other devices. Completed IDs accumulate and activity
  is deduplicated. Draft/name conflicts use the latest accepted save. Total minutes
  uses the larger snapshot; it does not add overlapping device sessions.
- A failed save leaves the browser copy available and offers retry. Browser storage
  failure is reported separately. This is not a full offline conflict-resolution engine.
- Existing PostgreSQL rows are not migrated or deleted. The old unsigned anonymous
  cookie cannot establish ownership of an account.
- Backups/restores, retention/deletion, rate limits, abuse protection, load behavior,
  and live identity verification still need configuration and staging verification.

Verify sign-in, reload, cross-device progress, sign-out, account switching,
unauthorized reads/writes, network failures, and guest import before release.

## Live account verification

After explicit approval to create disposable users, run the development account
check. It creates two temporary Clerk users, verifies real JWTs against Convex,
tests browser sign-in and draft sync, and deletes only its own test users and data.
It uses temporary sign-in tickets rather than changing the instance's login methods.

Build and start with matching development keys, even when `.env.production` exists:

```sh
npm run build:accounts
npm run start:accounts
```

In another terminal (PowerShell):

```powershell
$env:ACCOUNT_TEST_BASE_URL = 'http://localhost:3002'
npm run test:accounts -- --allow-test-users
```

For an OAuth-only instance with email identification disabled, preserve its login
settings and run the backend portion instead:

```powershell
npm run test:accounts -- --allow-test-users --api-only
```

That checks real token verification, reads/writes, per-user isolation, and cleanup.
It does not verify browser sign-in. Test the configured OAuth login with a real
account, then verify that a saved draft survives reload and appears on another
device, and that signing out returns to the guest workspace. The full disposable
browser check requires development email identification and refuses to enable it.

Use a dedicated port so a running development server cannot handle some requests
for the test server. The configured test server uses `localhost`, matching Clerk's
development handshake. Do not change `.env.production` to run development checks.

Test cleanup state and failure screenshots live in ignored `.account-verification/`,
separate from Playwright's output directory. If cleanup fails, run
`npm run test:accounts -- --cleanup` before another live account test. The script
refuses production Clerk keys and production Convex deployments. This account
verification command modifies external development resources; it is not part of
the default unit or browser suite.
