import { describe, expect, it } from 'vitest';
import { defineTestApp } from 'convex-test';
import schema from '../../convex/schema';
import * as progress from '../../convex/progress';
import { emptyProgress } from './progress';

const { createTest, api } = defineTestApp({ schema }).defineModules({ progress });
const identity = (subject: string, issuer = 'https://clerk.test') => ({
  subject,
  issuer,
  tokenIdentifier: `${issuer}|${subject}`,
});

describe('Clerk-owned Convex progress', () => {
  it('rejects unauthenticated reads and writes', async () => {
    const t = createTest();
    await expect(t.query(api.progress.get)).rejects.toThrow('Sign in');
    await expect(t.mutation(api.progress.save, { progress: emptyProgress })).rejects.toThrow(
      'Sign in',
    );
    expect(await t.run((ctx) => ctx.db.query('learners').collect())).toEqual([]);
    await expect(t.mutation(api.progress.remove)).rejects.toThrow('Sign in');
  });

  it('deletes only the authenticated learner and is safe to repeat', async () => {
    const t = createTest();
    const alice = t.withIdentity(identity('alice'));
    const bob = t.withIdentity(identity('bob'));
    await alice.mutation(api.progress.save, { progress: { ...emptyProgress, name: 'Alice' } });
    await bob.mutation(api.progress.save, { progress: { ...emptyProgress, name: 'Bob' } });
    await alice.mutation(api.progress.remove);
    await alice.mutation(api.progress.remove);
    expect(await alice.query(api.progress.get)).toBeNull();
    expect((await bob.query(api.progress.get))?.name).toBe('Bob');
  });

  it('separates accounts and derives ownership from the verified identity', async () => {
    const t = createTest();
    const alice = t.withIdentity(identity('alice'));
    const bob = t.withIdentity(identity('bob'));
    await alice.mutation(api.progress.save, {
      progress: { ...emptyProgress, drafts: { first: 'private draft' } },
    });
    expect(await bob.query(api.progress.get)).toBeNull();
    await bob.mutation(api.progress.save, { progress: { ...emptyProgress, name: 'Bob' } });
    expect((await alice.query(api.progress.get))?.drafts.first).toBe('private draft');
    expect((await bob.query(api.progress.get))?.drafts).toEqual({});
    const otherIssuer = t.withIdentity(identity('alice', 'https://other-clerk.test'));
    expect(await otherIssuer.query(api.progress.get)).toBeNull();
  });

  it('does not let the client submit an owner', async () => {
    const t = createTest().withIdentity(identity('alice'));
    await expect(
      t.mutation(api.progress.save, {
        progress: emptyProgress,
        owner: 'bob',
      } as { progress: typeof emptyProgress }),
    ).rejects.toThrow();
  });

  it('merges saves from different devices into one learner row', async () => {
    const t = createTest();
    const user = t.withIdentity(identity('alice'));
    await user.mutation(api.progress.save, {
      progress: { ...emptyProgress, completed: ['first'], drafts: { first: 'draft' } },
    });
    await user.mutation(api.progress.save, {
      progress: { ...emptyProgress, completed: ['second'] },
    });
    const saved = await user.query(api.progress.get);
    expect(saved?.completed).toEqual(['first', 'second']);
    expect(saved?.drafts).toEqual({ first: 'draft' });
    expect(await t.run((ctx) => ctx.db.query('learners').collect())).toHaveLength(1);
  });

  it('rejects oversized or invalid progress without changing stored data', async () => {
    const user = createTest().withIdentity(identity('alice'));
    await user.mutation(api.progress.save, { progress: emptyProgress });
    await expect(
      user.mutation(api.progress.save, {
        progress: { ...emptyProgress, drafts: { first: 'x'.repeat(15001) } },
      }),
    ).rejects.toThrow('Invalid learning progress');
    await expect(
      user.mutation(api.progress.save, { progress: { ...emptyProgress, minutes: -1 } }),
    ).rejects.toThrow('Invalid learning progress');
    expect(await user.query(api.progress.get)).toEqual(emptyProgress);
  });
});
