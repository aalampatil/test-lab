import { createRequire } from 'node:module';
import { spawn } from 'node:child_process';
import nextEnv from '@next/env';

// Build and start must use the same Clerk/Convex development instance even when
// an unrelated production configuration exists. Never modify production files.
nextEnv.loadEnvConfig(process.cwd(), true, { info() {}, error() {} });
if (
  !process.env.CLERK_SECRET_KEY?.startsWith('sk_test_') ||
  !process.env.CONVEX_DEPLOYMENT?.startsWith('dev:')
) {
  console.error(
    'Account verification requires a configured cloud development deployment and Clerk development keys.',
  );
  process.exit(1);
}
const [command, ...args] = process.argv.slice(2);
if (!['build', 'start'].includes(command)) throw new Error('Use build or start.');
const require = createRequire(import.meta.url);
function run(script, scriptArgs) {
  return new Promise((resolve) => {
    const child = spawn(process.execPath, [script, ...scriptArgs], {
      stdio: 'inherit',
      env: process.env,
      windowsHide: true,
    });
    child.once('error', () => resolve(1));
    child.once('exit', (code) => resolve(code ?? 1));
  });
}
if (command === 'build') {
  const status = await run('scripts/setup-monaco.mjs', []);
  if (status) process.exit(status);
}
process.exitCode = await run(require.resolve('next/dist/bin/next'), [command, ...args]);
