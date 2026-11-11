import { describe, expect, it } from 'vitest';
import { BodyTooLargeError, readLimitedJson } from './read-json';

describe('submission request limits', () => {
  it('accepts valid JSON at the exact byte limit', async () => {
    const body = JSON.stringify({ code: 'hello' });
    expect(
      await readLimitedJson(
        new Request('https://example.test', { method: 'POST', body }),
        new TextEncoder().encode(body).length,
      ),
    ).toEqual({ code: 'hello' });
  });
  it('rejects oversized bodies with missing or understated Content-Length', async () => {
    const headerCases: HeadersInit[] = [{}, { 'Content-Length': '1' }];
    for (const headers of headerCases) {
      const request = new Request('https://example.test', {
        method: 'POST',
        body: JSON.stringify({ code: 'x'.repeat(100) }),
        headers,
      });
      await expect(readLimitedJson(request, 50)).rejects.toBeInstanceOf(BodyTooLargeError);
    }
  });
  it('counts UTF-8 bytes rather than characters', async () => {
    const body = JSON.stringify({ code: '🙂'.repeat(10) });
    const request = new Request('https://example.test', { method: 'POST', body });
    await expect(readLimitedJson(request, body.length)).rejects.toBeInstanceOf(BodyTooLargeError);
  });
  it('cancels a chunked stream as soon as it exceeds the limit', async () => {
    let cancelled = false;
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode('{"code":"'));
        controller.enqueue(new Uint8Array(100));
      },
      cancel() {
        cancelled = true;
      },
    });
    const request = new Request('https://example.test', {
      method: 'POST',
      body: stream,
      duplex: 'half',
    } as RequestInit);
    await expect(readLimitedJson(request, 50)).rejects.toBeInstanceOf(BodyTooLargeError);
    expect(cancelled).toBe(true);
  });
  it('rejects invalid JSON', async () => {
    await expect(
      readLimitedJson(new Request('https://example.test', { method: 'POST', body: '{' }), 50),
    ).rejects.toBeInstanceOf(SyntaxError);
  });
});
