import { cookies } from 'next/headers';
import { randomUUID } from 'node:crypto';
import { database } from '@/lib/database';
import { progressSchema } from '@/lib/progress';
const sessionName = 'testlab-session';
async function session() {
  const store = await cookies();
  const current = store.get(sessionName)?.value;
  if (current && /^[0-9a-f-]{36}$/i.test(current)) return current;
  const id = randomUUID();
  store.set(sessionName, id, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 31536000,
  });
  return id;
}
export async function GET() {
  if (!process.env.DATABASE_URL) return Response.json({ mode: 'local', progress: null });
  try {
    const learner = await database().learner.findUnique({ where: { id: await session() } });
    return Response.json({ mode: 'database', progress: learner?.progress ?? null });
  } catch {
    return Response.json(
      { error: 'Database unavailable. Your browser copy is still available.' },
      { status: 503 },
    );
  }
}
export async function POST(request: Request) {
  if (!process.env.DATABASE_URL) return Response.json({ mode: 'local' });
  if (request.headers.get('origin') !== new URL(request.url).origin)
    return Response.json({ error: 'Invalid origin.' }, { status: 403 });
  if (Number(request.headers.get('content-length') ?? 0) > 200000)
    return Response.json({ error: 'Progress is too large.' }, { status: 413 });
  try {
    const parsed = progressSchema.safeParse(await request.json());
    if (!parsed.success)
      return Response.json({ error: 'Invalid learning progress.' }, { status: 400 });
    const id = await session();
    await database().learner.upsert({
      where: { id },
      create: { id, progress: parsed.data },
      update: { progress: parsed.data },
    });
    return Response.json({ mode: 'database', saved: true });
  } catch {
    return Response.json(
      { error: 'Could not sync progress. Your browser copy is still available.' },
      { status: 503 },
    );
  }
}
