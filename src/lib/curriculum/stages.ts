import { lessons, concepts } from '../content';
export const stages = [
  {
    id: 'start',
    title: 'Start small',
    description: 'Strings, numbers, arrays, and your first useful assertions.',
    difficulty: 'Beginner',
    color: 'orange',
  },
  {
    id: 'unit',
    title: 'Build strong unit tests',
    description: 'Objects, validation, permissions, errors, and regressions.',
    difficulty: 'Intermediate',
    color: 'purple',
  },
  {
    id: 'async',
    title: 'Async code and test doubles',
    description: 'Promises, failure paths, mocks, spies, and controlled time.',
    difficulty: 'Intermediate',
    color: 'teal',
  },
  {
    id: 'components',
    title: 'Test what people can do',
    description: 'React rendering, forms, loading states, and recovery.',
    difficulty: 'Intermediate',
    color: 'orange',
  },
  {
    id: 'services',
    title: 'Cross real boundaries',
    description: 'Storage integration, HTTP APIs, authorization, and contracts.',
    difficulty: 'Intermediate',
    color: 'teal',
  },
  {
    id: 'browser',
    title: 'Follow real user journeys',
    description: 'Smoke, end-to-end, keyboard, accessibility, and visual checks.',
    difficulty: 'Advanced',
    color: 'purple',
  },
  {
    id: 'advanced',
    title: 'Think beyond a green test',
    description: 'Properties, performance, mutation, coverage, CI, and a test plan.',
    difficulty: 'Advanced',
    color: 'orange',
  },
];
export function coursePaths() {
  return [
    {
      id: 'fundamentals',
      title: 'Testing fundamentals',
      description: 'Build a solid foundation. Learn the what, why, and how of testing.',
      difficulty: 'Beginner',
      color: 'orange',
      ids: concepts.map((_, i) => `concept-${i}`),
      minutes: concepts.length * 3,
      view: 'fundamentals' as const,
    },
    ...stages.map((stage) => ({
      ...stage,
      ids: lessons.filter((l) => l.stage === stage.id).map((l) => l.id),
      minutes: lessons.filter((l) => l.stage === stage.id).reduce((sum, l) => sum + l.minutes, 0),
      view: 'playground' as const,
    })),
  ];
}
