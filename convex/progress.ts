import {
  queryGeneric,
  mutationGeneric,
  type DataModelFromSchemaDefinition,
  type QueryBuilder,
  type MutationBuilder,
} from 'convex/server';
import { ConvexError } from 'convex/values';
import schema, { progressValidator } from './schema';
import { mergeProgress, progressSchema } from '../src/lib/progress';

type DataModel = DataModelFromSchemaDefinition<typeof schema>;
const query: QueryBuilder<DataModel, 'public'> = queryGeneric;
const mutation: MutationBuilder<DataModel, 'public'> = mutationGeneric;

export const get = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError('Sign in to access progress.');
    const learner = await ctx.db
      .query('learners')
      .withIndex('by_owner', (q) => q.eq('owner', identity.tokenIdentifier))
      .unique();
    return learner?.progress ?? null;
  },
});

export const save = mutation({
  args: { progress: progressValidator },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError('Sign in to save progress.');
    const parsed = progressSchema.safeParse(args.progress);
    if (!parsed.success) throw new ConvexError('Invalid learning progress.');
    const learner = await ctx.db
      .query('learners')
      .withIndex('by_owner', (q) => q.eq('owner', identity.tokenIdentifier))
      .unique();
    // Transactional merge preserves completions when devices save concurrently.
    const progress = learner ? mergeProgress(learner.progress, parsed.data) : parsed.data;
    if (learner) await ctx.db.patch(learner._id, { progress });
    else await ctx.db.insert('learners', { owner: identity.tokenIdentifier, progress });
    return progress;
  },
});

// Deletes only the caller's stored progress. Also used to clean up disposable
// development verification users without granting tests administrative data access.
export const remove = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError('Sign in to delete progress.');
    const learner = await ctx.db
      .query('learners')
      .withIndex('by_owner', (q) => q.eq('owner', identity.tokenIdentifier))
      .unique();
    if (learner) await ctx.db.delete(learner._id);
    return null;
  },
});
