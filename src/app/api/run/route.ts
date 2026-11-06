import { z } from 'zod';
import { lessons } from '@/lib/content';
import { runLocal } from '@/lib/local-runner';
export const runtime = 'nodejs';
const submission = z.object({ lessonId: z.string().max(50), code: z.string().min(1).max(15000) });
export async function POST(request: Request) {
  if (Number(request.headers.get('content-length') ?? 0) > 20000) return Response.json({ error: 'Submission is too large.' }, { status: 413 });
  try {
    const parsed = submission.safeParse(await request.json());
    if (!parsed.success) return Response.json({ error: 'Provide a lesson and test code (maximum 15,000 characters).' }, { status: 400 });
    if (!lessons.some(l => l.id === parsed.data.lessonId)) return Response.json({ error: 'Lesson not found.' }, { status: 404 });
    return Response.json(runLocal(parsed.data.lessonId, parsed.data.code));
  } catch (error) { return Response.json({ error: error instanceof Error ? error.message : 'Could not run this test.' }, { status: 400 }); }
}
