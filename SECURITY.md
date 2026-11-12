# Security policy

## Supported code

TestLab is a development-only learning project with no production-ready release or security service
commitment. Security fixes target the latest code on `main`; older commits and forks do not receive
backported fixes. See [production readiness](docs/production-readiness.md) for known limitations.

## Report a vulnerability

Do not disclose vulnerabilities, exploit instructions, credentials, or personal data in public issues
or pull requests.

1. Open the repository's [security advisories](https://github.com/aalampatil/test-lab/security/advisories)
   and choose **Report a vulnerability**, if that option is available. This submits a private report
   through GitHub.
2. If private vulnerability reporting is unavailable, open a public issue titled "Security contact
   request" containing only a request for a private reporting channel. Share technical details only
   after the maintainer provides that channel. There is currently no dedicated security email address
   published by this project.

Include the affected commit, component, impact, prerequisites, and minimal steps to reproduce. A small
proof of concept and a suggested fix are helpful. Remove secrets and personal data from any evidence.
Coordinate disclosure with the maintainer so a fix can be prepared before details become public.

This is a personally maintained project. Response times vary; there is no guaranteed response window
or bug bounty program.

## Scope and safe investigation

Relevant reports include execution-boundary escapes, unauthorized access to account progress,
authentication or authorization bypasses, injection, and accidental exposure of credentials or user
data. A known limitation can still have an unexpected security impact; report that impact privately.

Use a local checkout and accounts or infrastructure you own or have explicit permission to test. Do not
access other people's data, disrupt hosted services, or run unsolicited scans against deployments.
The practice project's fixed token and development reset endpoint are documented teaching features,
not production security controls.

For non-sensitive bugs and documentation corrections, use the normal issue forms. Never include real
tokens, populated environment files, session cookies, or private account records in reports.
