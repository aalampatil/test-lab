export type Lesson = {
  id: string;
  title: string;
  description: string;
  category: string;
  minutes: number;
  objective: string;
  explanation: string;
  source: string;
  starter: string;
  hint: string;
};
export const lessons: Lesson[] = [
  {
    id: 'first-test',
    title: 'Your first passing test',
    description: 'Meet describe, it, and expect. Small tests, big confidence.',
    category: 'Unit testing',
    minutes: 8,
    objective: 'Verify that adding two numbers returns their sum.',
    explanation:
      'A unit test checks one small piece of your application in isolation. Here, the unit is an add function. Arrange your inputs, act by calling add, and assert that the result matches your expectation. Name your test after the behavior you care about.',
    source: 'export function add(a, b) {\n  return a + b;\n}',
    starter:
      "import { describe, it, expect } from 'vitest';\nimport { add } from './app';\n\ndescribe('add', () => {\n  it('adds two numbers together', () => {\n    // Arrange & act\n    const result = add(2, 3);\n\n    // Assert: fix the expected value\n    expect(result).toBe(0);\n  });\n});",
    hint: 'add(2, 3) returns 5. toBe compares your actual result to the expected value. Try a negative number too!',
  },
  {
    id: 'edge-cases',
    title: 'Beyond the happy path',
    description: 'Find the boundaries hiding in a free-shipping rule.',
    category: 'Unit testing',
    minutes: 10,
    objective: 'Test the exact $50 boundary and an amount below it.',
    explanation:
      'Bugs often live at boundaries: zero, an empty list, or exactly the minimum purchase amount. Free shipping starts at $50, including $50 itself. Check both sides so a change from >= to > cannot slip through.',
    source: 'export function hasFreeShipping(total) {\n  return total >= 50;\n}',
    starter:
      "import { it, expect } from 'vitest';\nimport { hasFreeShipping } from './app';\n\nit('offers free shipping at the boundary', () => {\n  expect(hasFreeShipping(50)).toBe(false);\n});\n\n// Add a test for a total below $50",
    hint: 'At exactly 50, expect true. At 49, expect false. Both cases matter.',
  },
  {
    id: 'test-arrays',
    title: 'Make every item count',
    description: 'Test a real shopping cart, including an empty one.',
    category: 'Unit testing',
    minutes: 12,
    objective: 'Verify a cart with multiple items and an empty cart.',
    explanation:
      'Tests should represent the shapes of data your application receives. A cart may contain several prices, or no items at all. toEqual compares the contents of arrays and objects, while toBe works well for numeric totals.',
    source:
      'export function cartTotal(prices) {\n  return prices.reduce((sum, price) => sum + price, 0);\n}',
    starter:
      "import { it, expect } from 'vitest';\nimport { cartTotal } from './app';\n\nit('totals the items in a cart', () => {\n  expect(cartTotal([10, 20, 5])).toBe(0);\n});\n\n// What should an empty cart cost?",
    hint: 'The three items total 35. An empty array should return 0.',
  },
  {
    id: 'integration',
    title: 'Better together',
    description: 'Test the handoff between a cart and a discount.',
    category: 'Integration testing',
    minutes: 14,
    objective: 'Check a discounted multi-item order and an order without a discount.',
    explanation:
      'An integration test checks how pieces work together. checkout combines cartTotal with a percentage discount. Testing each function alone can miss a mistake in how the discount is applied to the total. Verify their combined behavior using realistic orders.',
    source:
      'function cartTotal(prices) {\n  return prices.reduce((sum, price) => sum + price, 0);\n}\n\nexport function checkout(prices, discount) {\n  return cartTotal(prices) * (1 - discount / 100);\n}',
    starter:
      "import { it, expect } from 'vitest';\nimport { checkout } from './app';\n\nit('applies a discount to the whole order', () => {\n  expect(checkout([20, 30], 10)).toBe(0);\n});",
    hint: 'A $50 order with 10% off costs $45. With a 0% discount it still costs $50.',
  },
  {
    id: 'bug-discount',
    title: 'The disappearing discount',
    description: 'A coupon makes the price go up. Catch the regression.',
    category: 'Bug hunting',
    minutes: 12,
    objective: 'Write a regression test that catches an incorrect discount calculation.',
    explanation:
      'A regression test captures a bug so it cannot quietly return. A 20% coupon should reduce a $100 order to $80. Your test runs against the corrected implementation, then against the original bug. It must pass for the fix and fail for the bug.',
    source:
      '// Original bug: price * (1 + percent / 100)\n// Corrected implementation:\nexport function applyDiscount(price, percent) {\n  return price * (1 - percent / 100);\n}',
    starter:
      "import { it, expect } from 'vitest';\nimport { applyDiscount } from './app';\n\nit('reduces the price with a coupon', () => {\n  expect(applyDiscount(100, 20)).toBe(100);\n});",
    hint: '20% of 100 is 20. Subtract it from the price. A 0% coupon would miss this bug!',
  },
  {
    id: 'bug-validation',
    title: 'You shall not pass',
    description: 'An age gate is letting the wrong people through.',
    category: 'Bug hunting',
    minutes: 10,
    objective: 'Check that 18 is allowed and 17 is rejected.',
    explanation:
      'Off-by-one errors are common in validation. When the minimum age is 18, an 18-year-old must be allowed and a 17-year-old must be rejected. Test both to catch a boundary that is too strict or too permissive.',
    source: 'export function canRegister(age) {\n  return age >= 18;\n}',
    starter:
      "import { it, expect } from 'vitest';\nimport { canRegister } from './app';\n\nit('accepts someone who is exactly 18', () => {\n  expect(canRegister(18)).toBe(false);\n});",
    hint: 'Use two assertions: canRegister(18) is true, and canRegister(17) is false.',
  },
];
export const concepts = [
  {
    title: 'What is software testing?',
    text: 'Testing compares what your software does with what you expect it to do. For a shopping cart, check that two $10 items total $20. A test is an executable example of a requirement.',
    question: 'What does a test compare?',
    options: [
      'Actual behavior with expected behavior',
      'Your code with a colleague’s code',
      'The number of lines in two files',
    ],
    answer: 0,
  },
  {
    title: 'Why developers write tests',
    text: 'Tests give you fast feedback and confidence when changing code. If you update tax calculations, existing cart tests help you see whether checkout still works. They also document decisions for the next developer.',
    question: 'What is a regression?',
    options: ['A faster build', 'A previously working behavior that breaks', 'A new test file'],
    answer: 1,
  },
  {
    title: 'Manual vs automated testing',
    text: 'Manual testing means a person clicks through checkout and inspects the result. Automated testing means a program repeats that check. Automate repeatable checks and use human exploration to find surprising behavior.',
    question: 'Which check is best suited to automation?',
    options: [
      'Whether a design feels welcoming',
      'Exploring a brand-new interaction',
      'Calculating the same cart total after every change',
    ],
    answer: 2,
  },
  {
    title: 'Unit testing',
    text: 'A unit test checks a small, isolated piece of behavior, like add(2, 3) returning 5. These tests are usually fast and precise. Keep external services out so a failure points to your own logic.',
    question: 'Which is a unit test?',
    options: [
      'Checking a pure price calculation',
      'Buying an item in a real browser',
      'Testing a live payment provider',
    ],
    answer: 0,
  },
  {
    title: 'Integration testing',
    text: 'Integration tests check how parts work together. Verify that checkout reads cart items, applies a coupon, and saves the correct total. A unit test might miss a mismatch between these parts.',
    question: 'What is the focus of integration tests?',
    options: [
      'A single isolated function',
      'How multiple components interact',
      'Only the appearance of a page',
    ],
    answer: 1,
  },
  {
    title: 'End-to-end testing',
    text: 'An end-to-end test follows a complete journey: open the store, add a product, and check out. Playwright automates a real browser. These tests provide broad confidence but take more time to run and maintain.',
    question: 'Which is an end-to-end scenario?',
    options: [
      'Calling add(1, 2)',
      'Comparing two objects',
      'Signing in and placing an order in a browser',
    ],
    answer: 2,
  },
  {
    title: 'Assertions and expectations',
    text: 'An assertion states what must be true. In expect(total).toBe(20), total is the actual value and 20 is the expected value. Use toEqual to compare object contents.',
    question: 'In expect(total).toBe(20), what is 20?',
    options: ['The expected value', 'The actual value', 'The test duration'],
    answer: 0,
  },
  {
    title: 'Test cases and edge cases',
    text: 'A test case specifies inputs and an expected outcome. Edge cases sit near boundaries: an empty cart, zero quantity, or exactly the $50 free-shipping threshold. Check below, at, and above important boundaries.',
    question: 'Which value is most useful for a $50 shipping boundary?',
    options: ['$1,000', '$50 exactly', '$200'],
    answer: 1,
  },
  {
    title: 'Test suites',
    text: 'A suite groups related tests. describe("checkout", ...) contains tests for discounts, shipping, and empty carts. Give each it(...) a behavior name so failures explain what broke.',
    question: 'What does describe do in Vitest?',
    options: ['Checks equality', 'Installs dependencies', 'Groups related tests into a suite'],
    answer: 2,
  },
  {
    title: 'Understanding test coverage',
    text: 'Coverage reports which lines, functions, and branches your tests execute. 100% line coverage does not prove your assertions are useful. expect(true).toBe(true) can run beside unverified code. Use coverage to find gaps, then test meaningful outcomes.',
    question: 'Does 100% line coverage guarantee correctness?',
    options: [
      'No — executed code may still have untested behavior',
      'Yes — every possible input is covered',
      'Yes — no bugs can remain',
    ],
    answer: 0,
  },
];
export type TestingTool = {
  name: string;
  mark: string;
  color: string;
  category: string;
  tech: string;
  overview: string;
  use: string;
  avoid: string;
  install: string;
  example: string;
  advantage: string;
  limitation: string;
  url: string;
  executable?: boolean;
};
export const tools: TestingTool[] = [
  {
    name: 'Vitest',
    mark: 'ϟ',
    color: 'green',
    category: 'Unit testing',
    tech: 'JavaScript · TypeScript · Vite',
    overview:
      'A fast, Vite-native testing framework with a familiar API and excellent TypeScript support.',
    use: 'Application logic, utilities, and components in modern JavaScript projects.',
    avoid: 'Full journeys that need real browser navigation.',
    install: 'npm install -D vitest',
    example:
      "import { it, expect } from 'vitest';\nit('adds numbers', () => {\n  expect(2 + 3).toBe(5);\n});",
    advantage: 'Fast feedback, watch mode, and Vite configuration reuse.',
    limitation: 'DOM tests need additional environment configuration.',
    url: 'https://vitest.dev/guide/',
    executable: true,
  },
  {
    name: 'Jest',
    mark: '♜',
    color: 'rose',
    category: 'Unit testing',
    tech: 'JavaScript · TypeScript · Node.js',
    overview: 'A widely used testing framework with assertions, mocking, and coverage.',
    use: 'Established JavaScript suites and projects built around Jest.',
    avoid: 'Vite projects where sharing build configuration is the priority.',
    install: 'npm install -D jest',
    example: "test('adds numbers', () => {\n  expect(2 + 3).toBe(5);\n});",
    advantage: 'Mature ecosystem and broad community support.',
    limitation: 'ES modules and TypeScript can require extra configuration.',
    url: 'https://jestjs.io/docs/getting-started',
  },
  {
    name: 'React Testing Library',
    mark: '⚛',
    color: 'purple',
    category: 'Component testing',
    tech: 'React · DOM · JavaScript',
    overview:
      'Test components the way people use them, through accessible roles and visible behavior.',
    use: 'Check that users can fill a form and see its success message.',
    avoid: 'Testing internal state or cross-page browser journeys.',
    install: 'npm install -D @testing-library/react @testing-library/dom',
    example:
      "render(<Button>Save</Button>);\nexpect(screen.getByRole('button', { name: 'Save' })).toBeVisible();",
    advantage: 'Encourages accessible markup and behavior-focused tests.',
    limitation: 'Requires a test runner and DOM environment.',
    url: 'https://testing-library.com/docs/react-testing-library/intro/',
  },
  {
    name: 'Playwright',
    mark: '◒',
    color: 'green',
    category: 'End-to-end testing',
    tech: 'Chromium · Firefox · WebKit',
    overview: 'Browser automation for complete user journeys across modern browsers.',
    use: 'Sign-in, checkout, and critical workflows in real browsers.',
    avoid: 'Small pure functions where a unit test is sufficient.',
    install: 'npm init playwright@latest',
    example:
      "test('home page', async ({ page }) => {\n  await page.goto('http://localhost:3000');\n  await expect(page).toHaveTitle(/TestLab/);\n});",
    advantage: 'Auto-waiting, traces, and cross-browser testing.',
    limitation: 'Browser setup and slower execution than unit tests.',
    url: 'https://playwright.dev/docs/intro',
  },
  {
    name: 'Cypress',
    mark: 'cy',
    color: 'teal',
    category: 'End-to-end testing',
    tech: 'JavaScript · TypeScript · Browsers',
    overview: 'An interactive browser testing tool with a visual runner for debugging user flows.',
    use: 'Develop and debug browser journeys with step-by-step feedback.',
    avoid: 'Backend-only unit tests or multiple browser contexts.',
    install: 'npm install -D cypress',
    example:
      "it('opens home', () => {\n  cy.visit('http://localhost:3000');\n  cy.contains('TestLab').should('be.visible');\n});",
    advantage: 'Interactive debugging and automatic retries.',
    limitation: 'Its command queue differs from normal async JavaScript.',
    url: 'https://docs.cypress.io/app/get-started/why-cypress',
  },
  {
    name: 'Postman',
    mark: '↗',
    color: 'orange',
    category: 'API testing',
    tech: 'REST · GraphQL · HTTP',
    overview: 'Explore, document, and test APIs using reusable request collections.',
    use: 'Response status, JSON data, authentication, and API workflows.',
    avoid: 'React components or interactions in a real browser.',
    install: 'npm install -g newman',
    example: "pm.test('returns success', () => {\n  pm.response.to.have.status(200);\n});",
    advantage: 'Accessible API exploration and shareable collections.',
    limitation: 'Collections use a separate format from application tests.',
    url: 'https://learning.postman.com/docs/tests-and-scripts/write-scripts/test-scripts/',
  },
];
