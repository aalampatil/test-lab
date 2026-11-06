type Task = { id: number; title: string; done: boolean };
const task: Task = { id: 1, title: 'Learn testing', done: false };
export const title: string = task.title;
// Try done: 'false' above, then run npm run typecheck.
