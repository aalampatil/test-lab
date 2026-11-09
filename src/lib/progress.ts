import { z } from 'zod';
export const progressSchema = z.object({
  name: z.string().min(1).max(40),
  completed: z.array(z.string().max(50)).max(100),
  activity: z
    .array(
      z.object({
        title: z.string().max(200),
        date: z.iso.datetime(),
        kind: z.enum(['lesson', 'concept']),
      }),
    )
    .max(100),
  drafts: z
    .record(z.string().max(50), z.string().max(15000))
    .refine((drafts) => Object.keys(drafts).length <= 100),
  minutes: z.number().min(0).max(1000000),
});
export type Progress = z.infer<typeof progressSchema>;
export const emptyProgress: Progress = {
  name: 'Alex',
  completed: [],
  activity: [],
  drafts: {},
  minutes: 0,
};

// The newer snapshot wins draft/name conflicts; completion and activity accumulate.
export function mergeProgress(older: Progress, newer: Progress): Progress {
  const activity = new Map(
    [...older.activity, ...newer.activity].map((item) => [
      `${item.kind}:${item.date}:${item.title}`,
      item,
    ]),
  );
  return {
    name: newer.name,
    completed: [...new Set([...older.completed, ...newer.completed])].slice(0, 100),
    activity: [...activity.values()].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 100),
    drafts: Object.fromEntries(Object.entries({ ...older.drafts, ...newer.drafts }).slice(-100)),
    minutes: Math.max(older.minutes, newer.minutes),
  };
}

// While the initial query is loading, retain edits made after hydration.
export function reconcileProgress(base: Progress, local: Progress, remote: Progress): Progress {
  const merged = mergeProgress(local, remote);
  for (const [id, draft] of Object.entries(local.drafts)) {
    if (draft !== base.drafts[id]) merged.drafts[id] = draft;
  }
  if (local.name !== base.name) merged.name = local.name;
  return progressSchema.parse(merged);
}
export type View =
  'overview' | 'paths' | 'fundamentals' | 'playground' | 'bugs' | 'tools' | 'about';
export type Navigate = (view: View, lessonId?: string) => void;
