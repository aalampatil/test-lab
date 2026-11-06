import { it, expect } from 'vitest';
import { cleanTitle } from '../src/title.js';
it('trims the task title', () => {
  expect(cleanTitle('  Learn testing  ')).toBe('Learn testing');
});
