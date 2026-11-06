'use client';
import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronDown,
  Code2,
  FileCode2,
  FlaskConical,
  Lightbulb,
  LoaderCircle,
  Play,
  RotateCcw,
  Terminal,
  X,
  Zap,
} from 'lucide-react';
import { lessons, type Lesson } from '@/lib/content';
import { type Progress, type Navigate } from '@/lib/progress';
import type { RunResult } from '@/lib/testing/local-runner';
import { Button } from '@/components/ui/button';
const Editor = dynamic(() => import('@/components/ui/code-editor'), { ssr: false });

export function Playground({
  lesson,
  progress,
  navigate,
  saveDraft,
  complete,
}: {
  lesson: Lesson;
  progress: Progress;
  navigate: Navigate;
  saveDraft: (id: string, code: string) => void;
  complete: (id: string, title: string, minutes: number) => void;
}) {
  const [code, setCode] = useState(progress.drafts[lesson.id] ?? lesson.starter);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<RunResult | null>(null);
  const [error, setError] = useState('');
  const [hint, setHint] = useState(false);
  const [simple, setSimple] = useState(false);
  const [tab, setTab] = useState<'lesson' | 'syntax'>('lesson');
  const requestRef = useRef(0);
  const startedAt = useRef(0);
  useEffect(() => {
    startedAt.current = Date.now();
  }, []);
  const update = (value: string) => {
    setCode(value);
    saveDraft(lesson.id, value);
    setResult(null);
    setError('');
  };
  const run = async () => {
    const requestId = ++requestRef.current;
    setRunning(true);
    setError('');
    setResult(null);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    try {
      const response = await fetch('/api/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lessonId: lesson.id, code }),
        signal: controller.signal,
      });
      const data = await response.json();
      if (requestRef.current !== requestId) return;
      if (!response.ok) throw Error(data.error ?? 'The runner is unavailable. Please retry.');
      setResult(data);
      if (data.complete)
        complete(
          lesson.id,
          lesson.title,
          Math.max(1, Math.round((Date.now() - startedAt.current) / 60000)),
        );
    } catch (err) {
      if (requestRef.current === requestId)
        setError(
          err instanceof Error && err.name === 'AbortError'
            ? 'The run timed out. Please try a smaller test.'
            : err instanceof Error
              ? err.message
              : 'Unable to connect to the runner.',
        );
    } finally {
      clearTimeout(timeout);
      if (requestRef.current === requestId) setRunning(false);
    }
  };
  const fallback = (
    <textarea
      aria-label="Test code editor"
      className="fallback-editor"
      spellCheck={false}
      value={code}
      onChange={(e) => update(e.target.value)}
      disabled={running}
    />
  );
  const next = lessons[lessons.findIndex((l) => l.id === lesson.id) + 1];
  return (
    <div className="playground page-enter">
      <div className="lab-heading">
        <div>
          <button className="text-link" onClick={() => navigate('paths')}>
            <ArrowLeft size={14} />
            Back to learning paths
          </button>
          <h1>{lesson.title}</h1>
          <p>
            <span className="badge">{lesson.category}</span>
            <span>{lesson.minutes} min</span>
            {progress.completed.includes(lesson.id) && (
              <span className="success-text">
                <CheckCircle2 size={14} />
                Completed
              </span>
            )}
          </p>
        </div>
        <label className="lesson-select">
          <span className="sr-only">Choose a lesson</span>
          <select value={lesson.id} onChange={(e) => navigate('playground', e.target.value)}>
            {lessons.map((l) => (
              <option key={l.id} value={l.id}>
                {l.title}
              </option>
            ))}
          </select>
          <ChevronDown size={15} />
        </label>
      </div>
      <div className="lab-layout">
        <section className="lesson-panel">
          <div className="panel-tabs">
            <button className={tab === 'lesson' ? 'active' : ''} onClick={() => setTab('lesson')}>
              <FlaskConical size={15} />
              The lesson
            </button>
            <button className={tab === 'syntax' ? 'active' : ''} onClick={() => setTab('syntax')}>
              <Code2 size={15} />
              Syntax explained
            </button>
          </div>
          <div className="lesson-panel-content">
            {tab === 'lesson' ? (
              <>
                <span className="eyebrow">LET’S MAKE IT CLICK</span>
                <h2>A small piece of confidence.</h2>
                <p>{lesson.explanation}</p>
                <div className="objective">
                  <span>
                    <CheckCircle2 size={17} />
                    YOUR OBJECTIVE
                  </span>
                  <p>{lesson.objective}</p>
                </div>
                <div className="code-label">
                  <FileCode2 size={14} />
                  app.js<span>read-only</span>
                </div>
                <pre className="application-code">
                  <code>{lesson.source}</code>
                </pre>
                <h3>Your turn</h3>
                <p>
                  Write or fix the test on the right. Run it, read the feedback, and try again. Your
                  test should pass for the correct behavior and fail if we introduce a bug.
                </p>
                <button
                  className={`hint-button ${hint ? 'open' : ''}`}
                  onClick={() => setHint(!hint)}
                >
                  <Lightbulb size={17} />
                  {hint ? 'Hide hint' : 'A little nudge?'}
                  <ChevronDown size={15} />
                </button>
                {hint && <div className="hint-content">{lesson.hint}</div>}
                <div className="lesson-note">
                  <Zap size={17} />
                  <p>
                    A green test is just the beginning. We also check that your test catches a
                    deliberately broken implementation.
                  </p>
                </div>
              </>
            ) : (
              <>
                <span className="eyebrow">EVERY LINE HAS A JOB</span>
                <h2>Read tests like a story.</h2>
                <Syntax
                  code="import { it, expect } from 'vitest'"
                  title="Bring in your tools"
                  text="it defines a test case. expect starts an assertion. Import your application function from './app'."
                />
                <Syntax
                  code="describe('add', () => { ... })"
                  title="Group related behavior"
                  text="describe creates a suite. Its name tells you which feature or function is being tested."
                />
                <Syntax
                  code="it('adds two numbers', () => { ... })"
                  title="Describe one expectation"
                  text="The callback contains the test. A clear name makes failures easier to understand."
                />
                <Syntax
                  code="const result = add(2, 3)"
                  title="Act on your application"
                  text="Call the real function with known inputs. Store the actual result in a constant."
                />
                <Syntax
                  code="expect(result).toBe(5)"
                  title="Assert the outcome"
                  text="toBe compares the actual value with the expected value. For arrays or objects, use toEqual. Never assert an unrelated truth just to get a green test."
                />
                <div className="info-note">
                  <p>
                    Local practice supports imports, describe, it/test, constants, arrays, objects,
                    and common expect matchers. Full Vitest execution requires the optional Docker
                    runner.
                  </p>
                </div>
              </>
            )}
          </div>
        </section>
        <section className="editor-panel">
          <div className="editor-title">
            <span>
              <FileCode2 size={15} />
              {lesson.id}.test.js
              <span className="unsaved-dot" title="Draft saved locally" />
            </span>
            <button className="text-link" onClick={() => setSimple(!simple)}>
              {simple ? 'Monaco editor' : 'Simple editor'}
            </button>
          </div>
          <div className="editor-container">
            {simple ? (
              fallback
            ) : (
              <Editor
                height="100%"
                language="javascript"
                value={code}
                onChange={(value) => update(value ?? '')}
                theme="vs"
                loading={fallback}
                options={{
                  minimap: { enabled: false },
                  fontSize: 13,
                  fontFamily: 'var(--font-geist-mono), monospace',
                  lineHeight: 24,
                  padding: { top: 22 },
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  tabSize: 2,
                  wordWrap: 'on',
                  readOnly: running,
                  renderLineHighlight: 'none',
                }}
              />
            )}
          </div>
          <div className="editor-actions">
            <span>
              <span className="green-dot" />
              Local practice mode
            </span>
            <div>
              <Button
                variant="ghost"
                disabled={running}
                onClick={() => {
                  update(lesson.starter);
                }}
              >
                <RotateCcw size={14} />
                Reset code
              </Button>
              <Button disabled={running || !code.trim()} onClick={run}>
                {running ? (
                  <LoaderCircle size={15} className="spin" />
                ) : (
                  <Play size={14} fill="currentColor" />
                )}
                {running ? 'Running…' : 'Run test'}
              </Button>
            </div>
          </div>
          <div className="output-panel">
            <div className="output-header">
              <span>
                <Terminal size={15} />
                Test output
              </span>
              {result && <span>{result.duration} ms</span>}
            </div>
            <div className="output-content" aria-live="polite">
              {!result && !error && !running && (
                <div className="output-empty">
                  <span className="terminal-icon">
                    <Terminal size={24} />
                  </span>
                  <h3>Your next “aha!” starts here.</h3>
                  <p>
                    Run your test to see what passes,
                    <br />
                    what fails, and what to try next.
                  </p>
                </div>
              )}
              {running && (
                <div className="output-empty">
                  <LoaderCircle size={25} className="spin" />
                  <h3>Putting your test to the test…</h3>
                  <p>Checking assertions and learning objectives.</p>
                </div>
              )}
              {error && (
                <div className="runner-error">
                  <X size={19} />
                  <div>
                    <h3>Let’s take another look.</h3>
                    <p>{error}</p>
                  </div>
                </div>
              )}
              {result && (
                <>
                  <div
                    className={`result-summary ${result.assertions.every((a) => a.passed) && result.assertions.length ? 'passed' : 'failed'}`}
                  >
                    <span>
                      {result.complete ? (
                        <CheckCircle2 size={20} />
                      ) : result.assertions.some((a) => !a.passed) ? (
                        <X size={20} />
                      ) : (
                        <Lightbulb size={20} />
                      )}
                    </span>
                    <div>
                      <h3>
                        {result.complete
                          ? 'Challenge complete. Nicely tested!'
                          : result.assertions.some((a) => !a.passed)
                            ? 'A failing test. A learning moment.'
                            : 'Passing — now cover the objective.'}
                      </h3>
                      <p>
                        {result.assertions.filter((a) => a.passed).length} passed ·{' '}
                        {result.assertions.filter((a) => !a.passed).length} failed
                      </p>
                    </div>
                  </div>
                  <p className="result-explanation">{result.explanation}</p>
                  <div className="assertion-list">
                    {result.assertions.map((a, i) => (
                      <div className={`assertion ${a.passed ? 'passed' : 'failed'}`} key={i}>
                        <div>
                          {a.passed ? <Check size={15} /> : <X size={15} />}
                          <strong>{a.name}</strong>
                        </div>
                        {!a.passed && (
                          <dl>
                            <dt>Expected</dt>
                            <dd>{a.expected}</dd>
                            <dt>Received</dt>
                            <dd>{a.actual}</dd>
                          </dl>
                        )}
                        {a.error && <pre className="assertion-error">{a.error}</pre>}
                      </div>
                    ))}
                  </div>
                  {result.complete && next && (
                    <Button onClick={() => navigate('playground', next.id)}>
                      Next lesson
                      <ArrowRight size={15} />
                    </Button>
                  )}
                  <span className="engine-label">{result.engine}</span>
                </>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
function Syntax({ code, title, text }: { code: string; title: string; text: string }) {
  return (
    <div className="syntax-explanation">
      <code>{code}</code>
      <h3>{title}</h3>
      <p>{text}</p>
    </div>
  );
}
