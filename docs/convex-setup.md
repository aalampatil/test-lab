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
