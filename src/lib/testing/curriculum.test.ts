import { describe, it, expect } from 'vitest';
import { lessons, concepts } from '../content';
import { projectGuide } from '../project-guides';
import { runLocal } from './local-runner';
import { stages } from '../curriculum/stages';
describe('curriculum integrity and local learning objectives', () => {
  it('keeps all lesson IDs unique and all stages valid', () => {
    expect(new Set(lessons.map((l) => l.id)).size).toBe(lessons.length);
    expect(lessons.every((l) => stages.some((s) => s.id === l.stage))).toBe(true);
    expect(lessons.every((l, i) => i === 0 || l.order! >= lessons[i - 1].order!)).toBe(true);
  });
  it('has a usable question and three answers for every concept', () => {
    for (const c of concepts) {
      expect(c.options).toHaveLength(3);
      expect(c.options[c.answer]).toBeTruthy();
    }
  });
  for (const lesson of lessons.filter((l) => !l.repository)) {
    it(`accepts the meaningful worked solution for ${lesson.id}`, () => {
      const guide = projectGuide(lesson, 'js');
      const code = guide.test.replace(/from '\.\.\/src\/utils\/[^']+'/, "from './app'");
      expect(runLocal(lesson.id, code).complete).toBe(true);
    });
    it(`rejects trivial completion for ${lesson.id}`, () => {
      expect(
        runLocal(
          lesson.id,
          "import { it, expect } from 'vitest'; it('unrelated', () => { expect(true).toBe(true); });",
        ).complete,
      ).toBe(false);
    });
  }
  for (const lesson of lessons.filter((l) => l.repository)) {
    it(`includes runnable instructions and honest completion checks for ${lesson.id}`, () => {
      expect(lesson.repository!.files.length).toBeGreaterThan(0);
      expect(lesson.repository!.solution.length).toBeGreaterThan(100);
      expect(lesson.repository!.steps.length).toBeGreaterThan(2);
      expect(
        lesson.repository!.checkpoint.options[lesson.repository!.checkpoint.answer],
      ).toBeTruthy();
      expect(lesson.repository!.checklist.length).toBeGreaterThan(1);
      expect(() => runLocal(lesson.id, lesson.repository!.solution)).toThrow();
    });
  }
});
