import { describe, expect, it } from 'vitest';
import { emptyProgress, mergeProgress, reconcileProgress, progressSchema } from './progress';

describe('progress reconciliation', () => {
  it('keeps completions, deduplicates activity, and resolves draft conflicts without adding overlapping time', () => {
    const activity = {
      title: 'First test',
      date: '2026-11-09T12:00:00.000Z',
      kind: 'lesson' as const,
    };
    const older = {
      ...emptyProgress,
      completed: ['first-test'],
      activity: [activity],
      drafts: { one: 'old', two: 'keep' },
      minutes: 5,
    };
    const newer = {
      ...emptyProgress,
      completed: ['another-test'],
      activity: [activity],
      drafts: { one: 'new' },
      minutes: 3,
    };
    const merged = mergeProgress(older, newer);
    expect(merged.completed).toEqual(['first-test', 'another-test']);
    expect(merged.activity).toEqual([activity]);
    expect(merged.drafts).toEqual({ one: 'new', two: 'keep' });
    expect(merged.minutes).toBe(5);
    expect(older.drafts.one).toBe('old');
  });

  it('loads fresh server drafts while retaining edits made during the initial query', () => {
    const base = { ...emptyProgress, drafts: { editing: 'cached', untouched: 'cached' } };
    const local = { ...base, name: 'Learner', drafts: { ...base.drafts, editing: 'typing' } };
    const remote = {
      ...emptyProgress,
      completed: ['remote'],
      drafts: { editing: 'server', untouched: 'fresh' },
    };
    const result = reconcileProgress(base, local, remote);
    expect(result.drafts).toEqual({ editing: 'typing', untouched: 'fresh' });
    expect(result.name).toBe('Learner');
    expect(result.completed).toEqual(['remote']);
  });

  it('keeps merged history within storage limits', () => {
    const older = {
      ...emptyProgress,
      completed: Array.from({ length: 100 }, (_, i) => `old-${i}`),
    };
    const newer = {
      ...emptyProgress,
      completed: Array.from({ length: 100 }, (_, i) => `new-${i}`),
    };
    expect(progressSchema.safeParse(mergeProgress(older, newer)).success).toBe(true);
  });
});
