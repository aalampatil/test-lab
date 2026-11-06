import type { Lesson } from './types';

function exercise(
  input: Omit<Lesson, 'starter' | 'projectExample'> & {
    subject: string;
    module: string;
    typedSource: string;
    cases: { name: string; assertion: string }[];
  },
): Lesson {
  const { subject, module, typedSource, cases, ...lesson } = input;
  return {
    ...lesson,
    starter: `import { describe, it, expect } from 'vitest';\nimport { ${subject} } from './app';\n\ndescribe('${subject}', () => {\n  it('${cases[0].name}', () => {\n    // Arrange: choose a realistic input.\n    // Act: call ${subject}.\n    // Assert: replace this unrelated assertion.\n    expect(true).toBe(true);\n  });\n\n  // Add another test for the edge case in your objective.\n});`,
    projectExample: { subject, module, typedSource, cases },
  };
}

export const interactiveLessons: Lesson[] = [
  exercise({
    id: 'normalize-title',
    title: 'Start with a string',
    category: 'Unit testing',
    stage: 'start',
    difficulty: 'Beginner',
    order: 20,
    minutes: 10,
    description: 'Turn a messy task title into a predictable string.',
    objective: 'Assert the trimmed title and a title containing only spaces.',
    explanation:
      'Start with a function you can explain in one sentence: cleanTitle removes surrounding spaces. Pick an ordinary example, then ask what happens when there is no meaningful text. Arrange a string, call the function, and compare the exact returned string. Checking just that something is truthy would miss whitespace bugs.',
    source: 'export function cleanTitle(title) {\n  return title.trim();\n}',
    typedSource: 'export function cleanTitle(title: string) {\n  return title.trim();\n}',
    subject: 'cleanTitle',
    module: 'title',
    cases: [
      {
        name: 'trims surrounding spaces',
        assertion: "expect(cleanTitle('  Learn testing  ')).toBe('Learn testing');",
      },
      { name: 'handles an all-space title', assertion: "expect(cleanTitle('   ')).toBe('');" },
    ],
    hint: 'Use the function inside expect. Check a padded title and a string made entirely of spaces. The second result is an empty string.',
  }),
  exercise({
    id: 'object-equality',
    title: 'Objects need a different matcher',
    category: 'Unit testing',
    stage: 'unit',
    difficulty: 'Beginner',
    order: 50,
    minutes: 12,
    description: 'Compare a whole task object with toEqual.',
    objective:
      'Check every field of a new task, including its trimmed title and initial incomplete status.',
    explanation:
      'Two object literals can have identical contents while being different references. toBe checks reference identity for objects; toEqual checks their contents. A task has more than a title: its ID and initial completed state are part of the public behavior too. Assert the whole result so a missing field cannot hide.',
    source:
      'export function makeTask(title) {\n  return { id: 1, title: title.trim(), done: false };\n}',
    typedSource:
      'export function makeTask(title: string) {\n  return { id: 1, title: title.trim(), done: false };\n}',
    subject: 'makeTask',
    module: 'task',
    cases: [
      {
        name: 'creates an incomplete task with a clean title',
        assertion:
          "expect(makeTask('  Read docs  ')).toEqual({ id: 1, title: 'Read docs', done: false });",
      },
      {
        name: 'preserves an already clean title',
        assertion:
          "expect(makeTask('Practice')).toEqual({ id: 1, title: 'Practice', done: false });",
      },
    ],
    hint: 'Use toEqual with { id: 1, title: your trimmed title, done: false }. Include spaces in one input so a missing trim is detected.',
  }),
  exercise({
    id: 'filter-tasks',
    title: 'Find what should stay out',
    category: 'Unit testing',
    stage: 'unit',
    difficulty: 'Beginner',
    order: 60,
    minutes: 12,
    description: 'Verify filtering with mixed data and an empty collection.',
    objective:
      'Assert that completed tasks are excluded from a mixed list and that an empty list stays empty.',
    explanation:
      'A positive check asks whether an active task appears. A stronger filter test also asks whether a completed task disappears. Arrange both kinds in the same list, then compare the complete returned list. This avoids a test that passes when the filter simply returns every input item.',
    source: 'export function activeTasks(tasks) {\n  return tasks.filter(task => !task.done);\n}',
    typedSource:
      'type Task = { id: number; done: boolean };\nexport function activeTasks(tasks: Task[]) {\n  return tasks.filter(task => !task.done);\n}',
    subject: 'activeTasks',
    module: 'active-tasks',
    cases: [
      {
        name: 'keeps only incomplete tasks',
        assertion:
          'expect(activeTasks([{ id: 1, done: true }, { id: 2, done: false }])).toEqual([{ id: 2, done: false }]);',
      },
      { name: 'handles no tasks', assertion: 'expect(activeTasks([])).toEqual([]);' },
    ],
    hint: 'Use one completed task and one incomplete task in the same input, then use toEqual for the exact expected list. Also test [].',
  }),
  exercise({
    id: 'quantity-validation',
    title: 'Truthy does not mean valid',
    category: 'Unit testing',
    stage: 'unit',
    difficulty: 'Beginner',
    order: 70,
    minutes: 12,
    description: 'Reject zero, fractions, and values with the wrong type.',
    objective: 'Check a valid quantity, zero, a fraction, and a numeric string.',
    explanation:
      'Validation should describe a rule, not a vague feeling that a value is present. Here a quantity must be a positive integer number. The string "2" and the fraction 1.5 look plausible but are invalid. Include one valid case so an implementation that rejects everything cannot pass.',
    source:
      'export function validQuantity(value) {\n  return typeof value === "number" && Number.isInteger(value) && value > 0;\n}',
    typedSource:
      'export function validQuantity(value: unknown) {\n  return typeof value === "number" && Number.isInteger(value) && value > 0;\n}',
    subject: 'validQuantity',
    module: 'quantity',
    cases: [
      { name: 'accepts a positive integer', assertion: 'expect(validQuantity(2)).toBe(true);' },
      {
        name: 'rejects invalid quantities',
        assertion:
          'expect(validQuantity(0)).toBe(false);\n    expect(validQuantity(1.5)).toBe(false);\n    expect(validQuantity("2")).toBe(false);',
      },
    ],
    hint: 'Assert true for 2; false for 0, 1.5, and "2". Exact booleans communicate the validation contract.',
  }),
  exercise({
    id: 'permission-matrix',
    title: 'Test the permission matrix',
    category: 'Unit testing',
    stage: 'unit',
    difficulty: 'Intermediate',
    order: 80,
    minutes: 15,
    description: 'Cover both allowed and denied editing decisions.',
    objective: 'Check an administrator, an owner, and a viewer who is not the owner.',
    explanation:
      'Permissions usually combine multiple conditions. An admin can edit any task; its owner can edit their own task; an unrelated viewer cannot. Testing only the admin path would miss a rule that accidentally allows everyone. Write a small matrix of roles and ownership before you write the assertions.',
    source: 'export function canEdit(role, isOwner) {\n  return role === "admin" || isOwner;\n}',
    typedSource:
      'export function canEdit(role: string, isOwner: boolean) {\n  return role === "admin" || isOwner;\n}',
    subject: 'canEdit',
    module: 'permissions',
    cases: [
      {
        name: 'allows admins and owners',
        assertion:
          'expect(canEdit("admin", false)).toBe(true);\n    expect(canEdit("member", true)).toBe(true);',
      },
      {
        name: 'denies an unrelated viewer',
        assertion: 'expect(canEdit("viewer", false)).toBe(false);',
      },
    ],
    hint: 'Use ("admin", false), ("member", true), and ("viewer", false). Both true and false outcomes matter.',
  }),
  exercise({
    id: 'decimal-money',
    title: 'Decimals have sharp edges',
    category: 'Unit testing',
    stage: 'unit',
    difficulty: 'Intermediate',
    order: 90,
    minutes: 14,
    description: 'Catch a floating-point bug in a line-item total.',
    objective: 'Verify a decimal price multiplied by a quantity and a normal whole-number total.',
    explanation:
      'JavaScript stores most decimal fractions approximately: 0.1 * 3 is not represented as exactly 0.3. This function explicitly rounds a displayed line total to two decimal places, so its exact result is part of its contract. In other numerical work use toBeCloseTo with a meaningful precision. Real financial systems often store integer minor units instead.',
    source:
      'export function lineTotal(price, quantity) {\n  return Math.round(price * quantity * 100) / 100;\n}',
    typedSource:
      'export function lineTotal(price: number, quantity: number) {\n  return Math.round(price * quantity * 100) / 100;\n}',
    subject: 'lineTotal',
    module: 'line-total',
    cases: [
      { name: 'rounds a decimal line total', assertion: 'expect(lineTotal(0.1, 3)).toBe(0.3);' },
      { name: 'multiplies whole-number prices', assertion: 'expect(lineTotal(10, 2)).toBe(20);' },
    ],
    hint: 'Check lineTotal(0.1, 3) against 0.3 exactly, and lineTotal(10, 2) against 20. A very loose matcher can hide the rounding bug.',
  }),
  exercise({
    id: 'immutable-inputs',
    title: 'Do not surprise the caller',
    category: 'Unit testing',
    stage: 'unit',
    difficulty: 'Intermediate',
    order: 100,
    minutes: 16,
    description: 'Check the returned array and the original input.',
    objective: 'Verify the new task is appended and the original list remains unchanged.',
    explanation:
      'A function can return the right value while damaging something else. If addTask mutates its input list, another component using that list may change unexpectedly. Arrange the original list, call addTask, assert the new result, then assert the original list is unchanged. This is a test of observable behavior, not the function’s private implementation.',
    source: 'export function addTask(tasks, task) {\n  return [...tasks, task];\n}',
    typedSource:
      'type Task = { id: number };\nexport function addTask(tasks: Task[], task: Task) {\n  return [...tasks, task];\n}',
    subject: 'addTask',
    module: 'add-task',
    cases: [
      {
        name: 'returns an extended list without changing its input',
        assertion:
          'const tasks = [{ id: 1 }];\n    const result = addTask(tasks, { id: 2 });\n    expect(result).toEqual([{ id: 1 }, { id: 2 }]);\n    expect(tasks).toEqual([{ id: 1 }]);',
      },
      {
        name: 'can add the first task',
        assertion: 'expect(addTask([], { id: 1 })).toEqual([{ id: 1 }]);',
      },
    ],
    hint: 'Save the input in a constant, call addTask, then assert both arrays with toEqual. Merely checking the result would miss a push-based mutation.',
  }),
  exercise({
    id: 'expected-errors',
    title: 'An error can be the right answer',
    category: 'Unit testing',
    stage: 'unit',
    difficulty: 'Intermediate',
    order: 110,
    minutes: 15,
    description: 'Test exceptions without throwing before the assertion.',
    objective: 'Assert normal division and rejection of a zero divisor with the expected message.',
    explanation:
      'Rejecting invalid input is useful behavior. expect(() => divide(8, 0)).toThrow("Cannot divide by zero") passes a function to expect so the matcher can catch the exception. Calling divide(8, 0) before expect would throw too early. Also test a valid divisor: an implementation that always throws is broken too.',
    source:
      'export function divide(a, b) {\n  if (b === 0) throw new Error("Cannot divide by zero");\n  return a / b;\n}',
    typedSource:
      'export function divide(a: number, b: number) {\n  if (b === 0) throw new Error("Cannot divide by zero");\n  return a / b;\n}',
    subject: 'divide',
    module: 'divide',
    cases: [
      { name: 'divides valid numbers', assertion: 'expect(divide(8, 2)).toBe(4);' },
      {
        name: 'rejects a zero divisor',
        assertion: 'expect(() => divide(8, 0)).toThrow("Cannot divide by zero");',
      },
    ],
    hint: 'Wrap the invalid call in () => divide(8, 0). Use toThrow("Cannot divide by zero"), and add an ordinary assertion for 8 / 2.',
  }),
];
