import { z } from 'zod';
import { lessons } from '@/lib/content';
import { runLocal } from '@/lib/local-runner';
const submission = z.object({ lessonId: z.string().max(50), code: z.string().min(1).max(15000) });
export async function POST(request: Request) {
  if (Number(request.headers.get('content-length') ?? 0) > 20000)
    return Response.json({ error: 'Submission is too large.' }, { status: 413 });
  try {
    const parsed = submission.safeParse(await request.json());
    if (!parsed.success)
      return Response.json(
        { error: 'Provide a lesson and test code (maximum 15,000 characters).' },
        { status: 400 },
      );
    if (!lessons.some((l) => l.id === parsed.data.lessonId))
      return Response.json({ error: 'Lesson not found.' }, { status: 404 });
    const local = runLocal(parsed.data.lessonId, parsed.data.code);
    if (!process.env.RUNNER_URL) return Response.json(local);
    if (!process.env.RUNNER_TOKEN)
      return Response.json({ error: 'Runner credentials are missing.' }, { status: 503 });
    const runner = await fetch(`${process.env.RUNNER_URL}/run`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.RUNNER_TOKEN}`,
      },
      body: JSON.stringify({
        code: parsed.data.code,
        source: lessons.find((l) => l.id === parsed.data.lessonId)!.source,
      }),
      signal: AbortSignal.timeout(14000),
    });
    const report = await runner.json();
    if (!runner.ok)
      return Response.json(
        { error: report.error ?? 'The isolated runner is unavailable.' },
        { status: 503 },
      );
    const assertions = (report.testResults ?? []).flatMap(
      (file: {
        assertionResults?: { title: string; status: string; failureMessages?: string[] }[];
      }) =>
        (file.assertionResults ?? []).map((a) => ({
          name: a.title,
          passed: a.status === 'passed',
          error: a.failureMessages?.join('\n'),
        })),
    );
    const actualPass =
      report.success === true &&
      assertions.length > 0 &&
      assertions.every((a: { passed: boolean }) => a.passed);
    return Response.json({
      ...local,
      assertions: actualPass
        ? local.assertions
        : assertions.length
          ? assertions
          : [
              {
                name: 'Vitest execution',
                passed: false,
                error: 'The isolated runner returned no test results. Check the runner logs.',
              },
            ],
      complete: actualPass && local.complete,
      engine: 'Vitest · isolated Docker container',
      explanation: actualPass
        ? local.explanation
        : 'Vitest could not pass this submission. Check the test syntax and runner output.',
      vitestOutput: assertions,
    });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : 'Could not run this test.' },
      { status: 400 },
    );
  }
}
