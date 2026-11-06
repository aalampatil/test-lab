export async function loadTasks(fetcher) {
  const response = await fetcher('/api/tasks');
  if (!response.ok) throw new Error('Could not load tasks');
  return response.json();
}
export function notifyTask(task, send) {
  send({ subject: 'Task created', title: task.title });
}
export function scheduleReminder(callback, delay) {
  return setTimeout(callback, delay);
}
