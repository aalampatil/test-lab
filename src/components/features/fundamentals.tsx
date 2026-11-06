'use client';
import { useEffect, useRef, useState } from 'react';
import { ArrowRight, BookOpen, Check, CheckCircle2, ChevronRight, Lightbulb } from 'lucide-react';
import { concepts } from '@/lib/content';
import { type Progress, type Navigate } from '@/lib/progress';
import { Button } from '@/components/ui/button';
export function Fundamentals({
  progress,
  complete,
  navigate,
}: {
  progress: Progress;
  complete: (id: string, title: string, minutes: number, kind: 'concept') => void;
  navigate: Navigate;
}) {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const c = concepts[index];
  const correct = selected === c.answer;
  const startedAt = useRef(0);
  useEffect(() => {
    startedAt.current = Date.now();
  }, [index]);
  const chooseConcept = (i: number) => {
    setIndex(i);
    setSelected(null);
    setChecked(false);
  };
  return (
    <div className="page-enter">
      <div className="page-heading">
        <div>
          <div className="eyebrow">A STRONG FOUNDATION</div>
          <h1>Learn to think like a tester.</h1>
          <p>Ten small concepts. A whole new way to look at your code.</p>
        </div>
        <span className="badge">
          <CheckCircle2 size={14} />
          {concepts.filter((_, i) => progress.completed.includes(`concept-${i}`)).length} / 10
          complete
        </span>
      </div>
      <div className="fundamentals-layout">
        <aside className="concept-nav">
          {concepts.map((concept, i) => (
            <button
              key={concept.title}
              className={index === i ? 'active' : ''}
              onClick={() => chooseConcept(i)}
            >
              <span>
                {progress.completed.includes(`concept-${i}`) ? (
                  <Check size={14} />
                ) : (
                  String(i + 1).padStart(2, '0')
                )}
              </span>
              {concept.title}
              <ChevronRight size={14} />
            </button>
          ))}
        </aside>
        <article className="concept-content">
          <span className="icon-box orange">
            <BookOpen size={24} />
          </span>
          <div className="eyebrow">CONCEPT {String(index + 1).padStart(2, '0')} OF 10</div>
          <h2>{c.title}</h2>
          <p className="concept-explanation">{c.text}</p>
          <div className="concept-example">
            <span>
              <Lightbulb size={17} /> Think about your own app
            </span>
            <p>
              {index < 4
                ? 'Imagine changing the price calculation in an online store. Which behavior should stay the same? Write that expectation down — you have the beginning of a test.'
                : 'Imagine a checkout with a cart, a coupon, and a payment. Decide which small behavior you would verify first, and which complete journey matters most to a customer.'}
            </p>
            <pre>
              <code>
                {index === 9
                  ? '// Runs code, but checks nothing useful:\nexpect(true).toBe(true);\n\n// Verifies real behavior:\nexpect(cartTotal([10, 10])).toBe(20);'
                  : "describe('shopping cart', () => {\n  it('totals two $10 items', () => {\n    expect(cartTotal([10, 10])).toBe(20);\n  });\n});"}
              </code>
            </pre>
          </div>
          <div className="knowledge-check">
            <span className="eyebrow">A QUICK CHECK-IN</span>
            <h3>{c.question}</h3>
            <div className="quiz-options">
              {c.options.map((option, i) => (
                <button
                  key={option}
                  onClick={() => {
                    setSelected(i);
                    setChecked(false);
                  }}
                  className={`${selected === i ? 'selected' : ''} ${checked && selected === i ? (correct ? 'correct' : 'incorrect') : ''}`}
                >
                  <span className="radio-dot">{selected === i && <span />}</span>
                  {option}
                  {checked && selected === i && correct && <Check size={16} />}
                </button>
              ))}
            </div>
            {checked && (
              <p role="status" className={correct ? 'success-text' : 'error-text'}>
                {correct
                  ? 'Exactly! You’ve got it. This concept is now complete.'
                  : 'Not quite. Revisit the explanation and give it another try.'}
              </p>
            )}
            <div className="quiz-actions">
              <Button
                disabled={selected === null}
                onClick={() => {
                  setChecked(true);
                  if (correct)
                    complete(
                      `concept-${index}`,
                      c.title,
                      Math.max(1, Math.round((Date.now() - startedAt.current) / 60000)),
                      'concept',
                    );
                }}
              >
                Check my answer
                <Check size={15} />
              </Button>
              {checked && correct && (
                <Button
                  variant="outline"
                  onClick={() =>
                    index < 9 ? chooseConcept(index + 1) : navigate('playground', 'first-test')
                  }
                >
                  {index < 9 ? 'Next concept' : 'Write your first test'}
                  <ArrowRight size={15} />
                </Button>
              )}
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}
