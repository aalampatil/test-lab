import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export const progressValidator = v.object({
  name: v.string(),
  completed: v.array(v.string()),
  activity: v.array(
    v.object({
      title: v.string(),
      date: v.string(),
      kind: v.union(v.literal('lesson'), v.literal('concept')),
    }),
  ),
  drafts: v.record(v.string(), v.string()),
  minutes: v.number(),
});

export default defineSchema({
  learners: defineTable({
    // tokenIdentifier includes the issuer as well as the Clerk subject.
    owner: v.string(),
    progress: progressValidator,
  }).index('by_owner', ['owner']),
});
