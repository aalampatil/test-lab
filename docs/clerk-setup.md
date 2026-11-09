# Clerk authentication

TestLab uses Clerk for sign-in, sign-up, session verification, and account controls.
Use the existing Clerk application; do not create a replacement application or paste
secret keys into chat or source control.

## Local development

Add the development instance's keys to the ignored `.env.local` file:

```dotenv
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

Restart Next.js after changing environment variables. Sign-in and Create account
buttons appear in the workspace header. Signed-in learners get Clerk's account
menu, including sign-out. Enable the intended login methods in the existing
application's Clerk Dashboard.

Without a publishable key, the local course remains available as a guest. Guest
progress stays in browser storage. Convex verifies Clerk tokens before every
account query or mutation, independently of the frontend.

Browser progress uses a separate storage key for each Clerk user ID. Switching
accounts remounts the workspace so one account's progress and drafts are not carried
into another account's session. This is separation between app sessions, not
encryption against someone with access to the browser's local storage.

## Vercel production

Configure development Clerk keys for Development and Preview, and production
Clerk keys for Production. Set the production domain and complete Clerk's required
DNS and login-provider configuration. Configure each environment's database
separately; never attach test deployments to production user data.

Only the publishable key is public. `CLERK_SECRET_KEY` is server-only. Never use
`NEXT_PUBLIC_` for the secret key. Redeploy after updating Vercel environment
variables. For account storage, also follow [Convex setup](convex-setup.md).

## Verification

Test sign-up, sign-in, sign-out, session expiry, and account switching with the
configured Clerk instance. Verify account A cannot read or overwrite account B's
progress. The visible DEV ONLY status remains until production infrastructure and
the release checks are verified; adding Clerk alone does not approve a release.
