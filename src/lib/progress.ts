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
export type View =
  'overview' | 'paths' | 'fundamentals' | 'playground' | 'bugs' | 'tools' | 'about';
export type Navigate = (view: View, lessonId?: string) => void;
