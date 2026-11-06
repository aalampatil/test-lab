import { createServer } from 'node:http';
import { createStore } from './store.js';
export function createTaskServer(store = createStore(), html = '<h1>TaskBoard</h1>') {
  return createServer(async (request, response) => {
    const send = (status, body) => {
      response.writeHead(status, { 'Content-Type': 'application/json' });
      response.end(JSON.stringify(body));
    };
    if (request.url === '/' && request.method === 'GET') {
      response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return response.end(html);
    }
    if (request.url !== '/api/tasks') return send(404, { error: 'Not found' });
    if (request.method === 'GET') return send(200, store.list());
    // This reset is only for the local learning app, never a production pattern.
    if (request.method === 'DELETE' && process.env.NODE_ENV !== 'production') {
      store.clear(); return send(200, { cleared: true });
    }
    if (request.method !== 'POST') return send(405, { error: 'Method not allowed' });
    // A fixed demo token illustrates a boundary; it is not real user authentication.
    if (request.headers.authorization !== 'Bearer practice-token') return send(401, { error: 'Unauthorized' });
    try {
      let raw = '';
      for await (const chunk of request) { raw += chunk; if (raw.length > 10000) return send(413, { error: 'Too large' }); }
      const body = JSON.parse(raw);
      if (typeof body.title !== 'string' || !body.title.trim()) return send(400, { error: 'Title is required' });
      return send(201, store.add(body.title));
    } catch { return send(400, { error: 'Invalid JSON' }); }
  });
}
