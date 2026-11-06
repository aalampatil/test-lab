import type { Lesson } from './content';

type ProjectExample = {
  module: string;
  subject: string;
  cases: { name: string; assertion: string }[];
};
const examples: Record<string, ProjectExample> = {
  'first-test': {
    module: 'add',
    subject: 'add',
    cases: [
      { name: 'adds two numbers together', assertion: 'expect(add(2, 3)).toBe(5);' },
      { name: 'handles negative numbers', assertion: 'expect(add(-2, 3)).toBe(1);' },
    ],
  },
  'edge-cases': {
    module: 'shipping',
    subject: 'hasFreeShipping',
    cases: [
      {
        name: 'includes the exact free-shipping boundary',
        assertion: 'expect(hasFreeShipping(50)).toBe(true);',
      },
      {
        name: 'rejects a total below the boundary',
        assertion: 'expect(hasFreeShipping(49)).toBe(false);',
      },
    ],
  },
  'test-arrays': {
    module: 'cart',
    subject: 'cartTotal',
    cases: [
      { name: 'adds all item prices', assertion: 'expect(cartTotal([10, 20, 5])).toBe(35);' },
      { name: 'returns zero for an empty cart', assertion: 'expect(cartTotal([])).toBe(0);' },
    ],
  },
  integration: {
    module: 'checkout',
    subject: 'checkout',
    cases: [
      {
        name: 'applies a discount to the complete cart',
        assertion: 'expect(checkout([20, 30], 10)).toBe(45);',
      },
      {
        name: 'preserves the total without a discount',
        assertion: 'expect(checkout([20, 30], 0)).toBe(50);',
      },
    ],
  },
  'bug-discount': {
    module: 'discount',
    subject: 'applyDiscount',
    cases: [
      {
        name: 'reduces a 100 dollar order by 20 percent',
        assertion: 'expect(applyDiscount(100, 20)).toBe(80);',
      },
      {
        name: 'preserves a price with no coupon',
        assertion: 'expect(applyDiscount(100, 0)).toBe(100);',
      },
    ],
  },
  'bug-validation': {
    module: 'registration',
    subject: 'canRegister',
    cases: [
      {
        name: 'accepts someone who is exactly 18',
        assertion: 'expect(canRegister(18)).toBe(true);',
      },
      { name: 'rejects someone who is 17', assertion: 'expect(canRegister(17)).toBe(false);' },
    ],
  },
};

export function projectGuide(lesson: Lesson, language: 'js' | 'ts') {
  const example = examples[lesson.id];
  if (!example) throw Error(`No project guide for ${lesson.id}`);
  let source = lesson.source;
  if (language === 'ts')
    source = source
      .replace('add(a, b)', 'add(a: number, b: number)')
      .replace('hasFreeShipping(total)', 'hasFreeShipping(total: number)')
      .replace('cartTotal(prices)', 'cartTotal(prices: number[])')
      .replace('checkout(prices, discount)', 'checkout(prices: number[], discount: number)')
      .replace('applyDiscount(price, percent)', 'applyDiscount(price: number, percent: number)')
      .replace('canRegister(age)', 'canRegister(age: number)');
  const sourcePath = `src/utils/${example.module}.${language}`;
  const testPath = `tests/${example.module}.test.${language}`;
  const test = `import { describe, it, expect } from 'vitest';\nimport { ${example.subject} } from '../src/utils/${example.module}';\n\ndescribe('${example.subject}', () => {\n${example.cases.map((c) => `  it('${c.name}', () => {\n    ${c.assertion}\n  });`).join('\n\n')}\n});\n`;
  return {
    sourcePath,
    testPath,
    source,
    test,
    tree: `your-repo/\n├── package.json\n├── vitest.config.mjs\n├── src/\n│   └── utils/\n│       └── ${example.module}.${language}\n└── tests/\n    └── ${example.module}.test.${language}`,
    config:
      "import { defineConfig } from 'vitest/config';\n\nexport default defineConfig({\n  test: {\n    environment: 'node',\n    include: ['tests/**/*.test.{js,ts}'],\n  },\n});",
    scripts: '"scripts": {\n  "test": "vitest run",\n  "test:watch": "vitest"\n}',
    run: `npm test -- ${testPath}`,
    watch: `npm run test:watch -- ${testPath}`,
  };
}
