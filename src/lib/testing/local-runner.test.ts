import { describe, expect, it } from 'vitest';
import { runLocal } from '../local-runner';
import { lessons } from '../content';
const testCode = (body: string) =>
  `import { it, expect } from 'vitest';\nit('checks behavior', () => { ${body} });`;
describe('local learning runner', () => {
  it('reports an incorrect expectation with expected and actual values', () => {
    const result = runLocal('first-test', lessons[0].starter);
    expect(result.complete).toBe(false);
    expect(result.assertions[0]).toMatchObject({ passed: false, actual: '5', expected: '0' });
  });
  it('completes a meaningful test with an aliased application import', () => {
    const result = runLocal(
      'first-test',
      `import { add as sum } from './app';\n${testCode('const total = sum(2, 3); expect(total).toBe(5);')}`,
    );
    expect(result.complete).toBe(true);
  });
  it('does not award completion for a trivial assertion', () => {
    expect(runLocal('first-test', testCode('expect(true).toBe(true);')).complete).toBe(false);
  });
  it('does not award completion for an unrelated subject call', () => {
    expect(runLocal('first-test', testCode('add(2, 3); expect(5).toBe(5);')).complete).toBe(false);
  });
  it('requires both sides of the free shipping boundary', () => {
    expect(
      runLocal('edge-cases', testCode('expect(hasFreeShipping(50)).toBe(true);')).complete,
    ).toBe(false);
    expect(
      runLocal(
        'edge-cases',
        testCode(
          'expect(hasFreeShipping(50)).toBe(true); expect(hasFreeShipping(49)).toBe(false);',
        ),
      ).complete,
    ).toBe(true);
  });
  it('requires the empty cart as well as a multi-item cart', () => {
    expect(
      runLocal(
        'test-arrays',
        testCode('expect(cartTotal([10, 20, 5])).toBe(35); expect(cartTotal([])).toBe(0);'),
      ).complete,
    ).toBe(true);
  });
  it('checks integrated discount behavior', () => {
    expect(
      runLocal(
        'integration',
        testCode(
          'expect(checkout([20, 30], 10)).toBe(45); expect(checkout([20, 30], 0)).toBe(50);',
        ),
      ).complete,
    ).toBe(true);
  });
  it('catches the original coupon regression', () => {
    expect(
      runLocal('bug-discount', testCode('expect(applyDiscount(100, 20)).toBe(80);')).complete,
    ).toBe(true);
  });
  it('catches both age gate boundary bugs', () => {
    expect(
      runLocal(
        'bug-validation',
        testCode('expect(canRegister(18)).toBe(true); expect(canRegister(17)).toBe(false);'),
      ).complete,
    ).toBe(true);
  });
  it.each([
    'process.exit()',
    "fetch('https://example.com')",
    'while(true) {}',
    "import fs from 'node:fs';",
    "expect.constructor('return process')()",
    'globalThis.process.exit()',
  ])('rejects executable or unsupported syntax: %s', (code) => {
    expect(() => runLocal('first-test', code)).toThrow();
  });
  it('handles malformed syntax without executing anything', () => {
    expect(() => runLocal('first-test', 'it(')).toThrow();
  });
  it('does not pass an empty submission', () => {
    expect(runLocal('first-test', '// no tests').complete).toBe(false);
  });
});
