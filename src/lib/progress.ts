import { z } from 'zod';
export const progressSchema = z.object({ name: z.string().max(40), completed: z.array(z.string()).max(100), activity: z.array(z.object({ title: z.string(), date: z.string(), kind: z.enum(['lesson', 'concept']) })).max(100), drafts: z.record(z.string(), z.string().max(15000)), minutes: z.number().min(0) });
export type Progress = z.infer<typeof progressSchema>;
export const emptyProgress: Progress = { name: 'Alex', completed: [], activity: [], drafts: {}, minutes: 0 };
export type View = 'overview' | 'paths' | 'fundamentals' | 'playground' | 'bugs' | 'tools' | 'about';
export type Navigate = (view: View, lessonId?: string) => void;
