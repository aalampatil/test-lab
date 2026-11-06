import http from 'node:http';
import { spawn } from 'node:child_process';
import { mkdtemp, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve, sep } from 'node:path';
import { randomUUID } from 'node:crypto';

// Trusted orchestration service. Keep private; only containers run submitted code.
const token = process.env.RUNNER_TOKEN;
if (!token || token.length < 24) throw Error('Set RUNNER_TOKEN to at least 24 random characters.');
let active = 0;
const json = (response, status, value) => {
  response.writeHead(status, { 'Content-Type': 'application/json' });
  response.end(JSON.stringify(value));
};
http
  .createServer(async (request, response) => {
    if (request.url !== '/run' || request.method !== 'POST')
      return json(response, 404, { error: 'Not found.' });
    if (request.headers.authorization !== `Bearer ${token}`)
      return json(response, 401, { error: 'Unauthorized.' });
    if (active >= 2) return json(response, 429, { error: 'Runner is busy. Try again shortly.' });
    active++;
    let directory;
    let containerName;
    try {
      let body = '';
      for await (const chunk of request) {
        body += chunk;
        if (Buffer.byteLength(body) > 20000) throw Error('Request is too large.');
      }
      const { code, source } = JSON.parse(body);
      if (
        typeof code !== 'string' ||
        typeof source !== 'string' ||
        code.length > 15000 ||
        source.length > 3000
      )
        throw Error('Invalid submission.');
      directory = await mkdtemp(join(tmpdir(), 'testlab-'));
      await writeFile(join(directory, 'app.js'), source);
      await writeFile(join(directory, 'submission.test.js'), code);
      containerName = `testlab-${randomUUID()}`;
      const args = [
        'run',
        '--rm',
        '--name',
        containerName,
        '--network=none',
        '--read-only',
        '--cap-drop=ALL',
        '--security-opt=no-new-privileges',
        '--pids-limit=64',
        '--memory=256m',
        '--cpus=1',
        '--user=1000:1000',
        '--tmpfs=/tmp:rw,noexec,nosuid,size=67108864',
        '--mount',
        `type=bind,source=${directory},target=/submission,readonly`,
        'testlab-vitest',
      ];
      const output = await new Promise((resolve, reject) => {
        const child = spawn('docker', args, { shell: false, windowsHide: true });
        let stdout = '';
        let stderr = '';
        const timeout = setTimeout(() => {
          child.kill();
          reject(Error('Test execution timed out.'));
        }, 12000);
        child.stdout.on('data', (data) => {
          stdout += data;
          if (stdout.length > 100000) {
            child.kill();
            reject(Error('Output limit exceeded.'));
          }
        });
        child.stderr.on('data', (data) => {
          stderr = (stderr + data).slice(-2000);
        });
        child.on('error', (error) => {
          clearTimeout(timeout);
          reject(error);
        });
        child.on('close', () => {
          clearTimeout(timeout);
          try {
            resolve(JSON.parse(stdout));
          } catch {
            reject(Error(stderr || 'Invalid Vitest output. Build the runner image first.'));
          }
        });
      });
      json(response, 200, output);
    } catch (error) {
      json(response, 400, { error: error.message });
    } finally {
      if (containerName) {
        const cleanup = spawn('docker', ['rm', '-f', containerName], {
          shell: false,
          windowsHide: true,
        });
        cleanup.on('error', () => {});
      }
      if (directory && resolve(directory).startsWith(`${resolve(tmpdir())}${sep}testlab-`)) {
        await rm(directory, { recursive: true, force: true }).catch(() => {});
      }
      active--;
    }
  })
  .listen(Number(process.env.RUNNER_PORT || 4001), '127.0.0.1', () =>
    console.log('TestLab isolated runner listening on http://127.0.0.1:4001'),
  );
