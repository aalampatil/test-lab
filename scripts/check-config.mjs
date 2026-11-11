import nextEnv from '@next/env';
import { inspectConfiguration, inspectLiveConfiguration } from './lib/configuration.mjs';

const production = process.argv.includes('--production');
nextEnv.loadEnvConfig(process.cwd(), !production, { info() {}, error() {} });
const result = inspectConfiguration(process.env, { production });
if (process.argv.includes('--live') && result.ready) {
  result.checks.push(...(await inspectLiveConfiguration(process.env)));
  result.ready = result.checks.every((item) => item.status === 'pass');
}
for (const check of result.checks) {
  console.log(
    `${check.status.toUpperCase()}: ${check.name}${check.status === 'fail' ? ` — ${check.message}` : ''}`,
  );
}
console.log(
  'Convex CLERK_JWT_ISSUER_DOMAIN must also be configured on the deployment; local checks do not verify that setting.',
);
if (!result.ready) process.exitCode = 1;
