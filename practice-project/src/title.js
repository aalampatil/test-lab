export function cleanTitle(title) {
  return title.trim();
}
export function summarize(tasks) {
  return { total: tasks.length, complete: tasks.filter(task => task.done).length };
}
