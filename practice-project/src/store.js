export function createStore() {
  let tasks = [];
  let nextId = 1;
  return {
    list() { return tasks.map(task => ({ ...task })); },
    add(title) {
      const task = { id: nextId++, title: title.trim(), done: false };
      tasks.push(task);
      return { ...task };
    },
    clear() { tasks = []; nextId = 1; },
  };
}
