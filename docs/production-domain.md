# Production domain

The selected application domain is `testlab.aalampatil.in`.

## Verified configuration

- The domain is attached to the Vercel `testlab` project and ownership is verified.
- Vercel reports the application CNAME correctly configured.
- The production Clerk instance uses `clerk.testlab.aalampatil.in` for its Frontend API.
- All five Clerk-required CNAME targets match public DNS. The nameservers are
  `ns51.domaincontrol.com` and `ns52.domaincontrol.com`; DNS is managed outside Vercel.
- The Clerk HTTPS OpenID discovery endpoint returns HTTP 200 and the expected issuer.
- The production Clerk JWT template `convex` exists with audience `convex`.
- Production Convex has `CLERK_JWT_ISSUER_DOMAIN` set to
  `https://clerk.testlab.aalampatil.in`.

These settings do not establish that the production backend functions, frontend,
OAuth provider credentials, or complete account flow have been released and tested.
The existing login methods were not changed.

## Clerk DNS reference

These records were returned by this Clerk instance and verified against public DNS.
In the `aalampatil.in` DNS zone, the Name column is relative to the zone.

| Type  | Name                      | Target                              |
| ----- | ------------------------- | ----------------------------------- |
| CNAME | `clerk.testlab`           | `frontend-api.clerk.services`       |
| CNAME | `accounts.testlab`        | `accounts.clerk.services`           |
| CNAME | `clkmail.testlab`         | `mail.bj8k8cikya8g.clerk.services`  |
| CNAME | `clk._domainkey.testlab`  | `dkim1.bj8k8cikya8g.clerk.services` |
| CNAME | `clk2._domainkey.testlab` | `dkim2.bj8k8cikya8g.clerk.services` |

Preserve these records and unrelated application/email records. No DNS writes or
nameserver changes were needed during verification.

## Remaining release work

Deploy and verify the production Convex functions and Vercel app with matching
production environment settings, review production social-login credentials, and
verify real-account sign-in, progress sync, sign-out, and recovery. Follow the
[production readiness checklist](production-readiness.md); domain configuration
alone does not change the development-only release status.
