export class BodyTooLargeError extends Error {
  constructor() {
    super('Submission is too large.');
  }
}

// Enforce the limit on actual bytes, including chunked requests and absent or
// misleading Content-Length headers. Never buffer the remainder of a large body.
export async function readLimitedJson(request: Request, maxBytes: number): Promise<unknown> {
  if (Number(request.headers.get('content-length')) > maxBytes) throw new BodyTooLargeError();
  if (!request.body) throw new SyntaxError('A JSON body is required.');
  const reader = request.body.getReader();
  const decoder = new TextDecoder();
  let size = 0;
  let text = '';
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > maxBytes) {
        await reader.cancel().catch(() => {});
        throw new BodyTooLargeError();
      }
      text += decoder.decode(value, { stream: true });
    }
    return JSON.parse(text + decoder.decode());
  } finally {
    reader.releaseLock();
  }
}
