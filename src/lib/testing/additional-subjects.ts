export const additionalSubjectNames: Record<string, string> = {
  'normalize-title': 'cleanTitle',
  'object-equality': 'makeTask',
  'filter-tasks': 'activeTasks',
  'quantity-validation': 'validQuantity',
  'permission-matrix': 'canEdit',
  'decimal-money': 'lineTotal',
  'immutable-inputs': 'addTask',
  'expected-errors': 'divide',
};
export function additionalSubjects(
  mutation: number,
): Record<string, (...args: unknown[]) => unknown> {
  return {
    cleanTitle: (title) =>
      mutation === 1 ? String(title) : mutation === 2 ? 'Title' : String(title).trim(),
    makeTask: (title) => ({
      id: 1,
      title: mutation === 1 ? String(title) : String(title).trim(),
      done: mutation === 2,
    }),
    activeTasks: (tasks) => {
      if (!Array.isArray(tasks)) throw Error('activeTasks expects an array.');
      return mutation === 1 ? tasks : mutation === 2 ? [] : tasks.filter((task) => !task.done);
    },
    validQuantity: (value) =>
      mutation === 1
        ? Number(value) > 0
        : mutation === 2
          ? typeof value === 'number' && value >= 0
          : typeof value === 'number' && Number.isInteger(value) && value > 0,
    canEdit: (role, owner) =>
      mutation === 1
        ? true
        : mutation === 2
          ? role === 'admin'
          : role === 'admin' || owner === true,
    lineTotal: (price, quantity) =>
      mutation === 1
        ? Number(price) * Number(quantity)
        : mutation === 2
          ? Number(price)
          : Math.round(Number(price) * Number(quantity) * 100) / 100,
    addTask: (tasks, task) => {
      if (!Array.isArray(tasks)) throw Error('addTask expects an array.');
      if (mutation === 1) {
        tasks.push(task);
        return tasks;
      }
      return mutation === 2 ? [...tasks] : [...tasks, task];
    },
    divide: (a, b) => {
      if (b === 0 && mutation !== 1) throw Error('Cannot divide by zero');
      return mutation === 2 ? Number(a) * Number(b) : Number(a) / Number(b);
    },
  };
}
export function additionalObjective(id: string, args: unknown[][]): boolean | undefined {
  if (id === 'normalize-title')
    return (
      args.some((a) => typeof a[0] === 'string' && a[0].trim() && a[0] !== a[0].trim()) &&
      args.some((a) => typeof a[0] === 'string' && a[0].length > 0 && a[0].trim() === '')
    );
  if (id === 'object-equality')
    return args.some((a) => typeof a[0] === 'string' && a[0].trim() && a[0] !== a[0].trim());
  if (id === 'filter-tasks')
    return (
      args.some(
        (a) =>
          Array.isArray(a[0]) &&
          a[0].some((t) => t.done === true) &&
          a[0].some((t) => t.done === false),
      ) && args.some((a) => Array.isArray(a[0]) && a[0].length === 0)
    );
  if (id === 'quantity-validation')
    return (
      args.some((a) => typeof a[0] === 'number' && Number.isInteger(a[0]) && a[0] > 0) &&
      args.some((a) => a[0] === 0) &&
      args.some((a) => typeof a[0] === 'number' && !Number.isInteger(a[0])) &&
      args.some((a) => typeof a[0] === 'string')
    );
  if (id === 'permission-matrix')
    return (
      args.some((a) => a[0] === 'admin' && a[1] === false) &&
      args.some((a) => a[0] !== 'admin' && a[1] === true) &&
      args.some((a) => a[0] !== 'admin' && a[1] === false)
    );
  if (id === 'decimal-money')
    return (
      args.some((a) => a[0] === 0.1 && a[1] === 3) &&
      args.some((a) => Number.isInteger(a[0]) && Number(a[0]) > 0 && Number(a[1]) > 1)
    );
  if (id === 'immutable-inputs') return args.some((a) => Array.isArray(a[0]) && a[0].length > 0);
  if (id === 'expected-errors')
    return args.some((a) => a[1] === 0) && args.some((a) => typeof a[1] === 'number' && a[1] !== 0);
  return undefined;
}
