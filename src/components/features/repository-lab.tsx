'use client';
import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronDown,
  Copy,
  FileCode2,
  FolderTree,
  Lightbulb,
  Terminal,
} from 'lucide-react';
import type { Lesson } from '@/lib/content';
import { lessons } from '@/lib/content';
import type { Navigate, Progress } from '@/lib/progress';
import { Button } from '@/components/ui/button';
const Editor = dynamic(() => import('@/components/ui/code-editor'), { ssr: false });

export function RepositoryLab({
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
  const lab = lesson.repository!;
  const [code, setCode] = useState(progress.drafts[lesson.id] ?? lesson.starter);
  const [tab, setTab] = useState<'learn' | 'setup' | 'files'>('learn');
  const [fileIndex, setFileIndex] = useState(0);
  const [solution, setSolution] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [tasks, setTasks] = useState<boolean[]>(lab.checklist.map(() => false));
  const [message, setMessage] = useState('');
  const [simple, setSimple] = useState(false);
  const startedAt = useRef(0);
  useEffect(() => {
    startedAt.current = Date.now();
  }, []);
  const correct = checked && selected === lab.checkpoint.answer;
  const done = progress.completed.includes(lesson.id);
  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setMessage('Copied. Paste it into your practice project.');
    } catch {
      setMessage('Clipboard unavailable. Select the text and copy it manually.');
    }
  };
  const next = lessons[lessons.findIndex((l) => l.id === lesson.id) + 1];
  const fallback = (
    <textarea
      className="fallback-editor"
      aria-label="Project test draft"
      value={code}
      onChange={(e) => {
        setCode(e.target.value);
        saveDraft(lesson.id, e.target.value);
      }}
      spellCheck={false}
    />
  );
  return (
    <div className="page-enter">
      <div className="lab-heading">
        <div>
          <button className="text-link" onClick={() => navigate('paths')}>
            <ArrowLeft size={14} />
            Back to your study plan
          </button>
          <h1>{lesson.title}</h1>
          <p>
            <span className="badge">{lesson.category}</span>
            <span>
              {lesson.difficulty} · {lesson.minutes} min
            </span>
            {done && (
              <span className="success-text">
                <CheckCircle2 size={14} />
                Completed · self-reported
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
      <div className="repository-mode-note">
        <FolderTree size={19} />
        <div>
          <strong>Real-project lab</strong>
          <p>
            Write here, then run the test in <code>practice-project/</code> on your computer.
            TestLab saves your draft and study progress; it does not execute or verify these
            external runs.
          </p>
        </div>
      </div>
      <div className="lab-layout repository-layout">
        <section className="lesson-panel">
          <div className="panel-tabs">
            {(
              [
                { id: 'learn', title: 'Learn & do' },
                { id: 'setup', title: 'Project setup' },
                { id: 'files', title: 'Source files' },
              ] as const
            ).map((item) => (
              <button
                key={item.id}
                className={tab === item.id ? 'active' : ''}
                onClick={() => setTab(item.id)}
              >
                {item.title}
              </button>
            ))}
          </div>
          <div className="lesson-panel-content">
            {tab === 'setup' ? (
              <>
                <span className="eyebrow">YOUR REPOSITORY, REAL TOOLS</span>
                <h2>Open the TaskBoard project.</h2>
                <p>
                  The complete starter is already in <code>practice-project/</code> inside this
                  repository. Open that folder in your editor. Use Node.js 22 LTS and run these
                  commands there.
                </p>
                <CodeBlock
                  label="One-time setup · terminal"
                  code="cd practice-project\nnpm install\nnpm test"
                  copy={copy}
                />
                <p>
                  For browser labs, also run <code>npx playwright install chromium</code>. The
                  Playwright config starts the application on port 3100 for you. Close a separately
                  started demo server before running browser tests if you want a clean process.
                </p>
                <CodeBlock
                  label="Folders"
                  code={`practice-project/\n├── package.json\n├── vitest.config.mjs\n├── playwright.config.js\n├── server.js\n├── src/                 ← application code\n├── public/index.html    ← real browser UI\n├── tests/               ← Vitest tests\n└── e2e/                 ← Playwright tests\n\nCreate your lab file:\n${lab.testPath}`}
                  copy={copy}
                />
                <p>
                  If the folder for your test does not exist, create it first. Keep an existing
                  package.json and configuration rather than overwriting your own project’s setup.
                  The example imports are relative to the exact file paths shown.
                </p>
                <div className="info-note">
                  <p>
                    Start with TaskBoard, then transfer the same test pattern to a function,
                    component, or endpoint in your own application. The demo uses an in-memory store
                    and fixed demo token; those are teaching conveniences.
                  </p>
                </div>
              </>
            ) : tab === 'files' ? (
              <>
                <span className="eyebrow">READ THE PUBLIC BEHAVIOR</span>
                <h2>Know what you are testing.</h2>
                <div className="source-file-tabs">
                  {lab.files.map((file, i) => (
                    <button
                      key={file.path}
                      onClick={() => setFileIndex(i)}
                      className={fileIndex === i ? 'active' : ''}
                    >
                      <FileCode2 size={13} />
                      {file.path}
                    </button>
                  ))}
                </div>
                <CodeBlock
                  label={lab.files[fileIndex].path}
                  code={lab.files[fileIndex].code}
                  copy={copy}
                />
                <p>
                  These files already exist in the starter. Read them first; temporarily change one
                  behavior when testing whether your assertions can detect a bug.
                </p>
              </>
            ) : (
              <>
                <span className="eyebrow">
                  {lesson.difficulty?.toUpperCase()} · HANDS-ON PRACTICE
                </span>
                <h2>{lesson.objective}</h2>
                <p>{lesson.explanation}</p>
                <div className="objective">
                  <span>
                    <CheckCircle2 size={16} />
                    YOUR TASK
                  </span>
                  <ol className="lab-task-steps">
                    {lab.steps.map((step) => (
                      <li key={step}>{step}</li>
                    ))}
                  </ol>
                </div>
                <CodeBlock
                  label={`Run from practice-project · ${lab.testPath}`}
                  code={lab.command}
                  copy={copy}
                />
                <div className="expected-behavior">
                  <strong>What to expect</strong>
                  <p>{lab.expected}</p>
                </div>
                <details className="lab-hint">
                  <summary>
                    <Lightbulb size={16} />A hint before the answer
                  </summary>
                  <p>{lesson.hint}</p>
                </details>
                <button className="hint-button" onClick={() => setSolution(!solution)}>
                  <FileCode2 size={16} />
                  {solution ? 'Hide worked example' : 'Compare with a worked example'}
                  <ChevronDown size={15} />
                </button>
                {solution && (
                  <>
                    <p className="worked-note">
                      Try the task first. Understand each assertion before copying the example. An
                      empty test or copied template alone does not prove you learned the behavior.
                    </p>
                    <CodeBlock label={lab.testPath} code={lab.solution} copy={copy} />
                  </>
                )}
              </>
            )}
          </div>
        </section>
        <div className="repository-right">
          <section className="editor-panel">
            <div className="editor-title">
              <span>
                <FileCode2 size={15} />
                {lab.testPath}
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
                  value={code}
                  language={
                    lab.testPath.endsWith('.yml')
                      ? 'yaml'
                      : lab.testPath.endsWith('.md')
                        ? 'markdown'
                        : 'javascript'
                  }
                  loading={fallback}
                  options={{
                    minimap: { enabled: false },
                    fontSize: 12,
                    lineHeight: 23,
                    padding: { top: 18 },
                    wordWrap: 'on',
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                  }}
                  onChange={(value) => {
                    setCode(value ?? '');
                    saveDraft(lesson.id, value ?? '');
                  }}
                />
              )}
            </div>
            <div className="editor-actions">
              <span>Draft saved in this browser</span>
              <Button variant="outline" onClick={() => copy(code)}>
                <Copy size={14} />
                Copy draft
              </Button>
            </div>
            <div className="repository-run-command">
              <span>
                <Terminal size={15} />
                Run in your project terminal
              </span>
              <code>{lab.command}</code>
              <Button variant="outline" onClick={() => copy(lab.command)}>
                Copy command
                <Copy size={14} />
              </Button>
              <p>
                No simulated test results. Read the output from Vitest, Playwright, or your
                terminal.
              </p>
            </div>
          </section>
          <section className="repository-reflection">
            <span className="eyebrow">CHECK YOUR UNDERSTANDING</span>
            <h3>{lab.checkpoint.question}</h3>
            <div className="quiz-options">
              {lab.checkpoint.options.map((option, i) => (
                <button
                  key={option}
                  className={selected === i ? 'selected' : ''}
                  onClick={() => {
                    setSelected(i);
                    setChecked(false);
                  }}
                >
                  <span className="radio-dot">{selected === i && <span />}</span>
                  {option}
                </button>
              ))}
            </div>
            <Button variant="outline" disabled={selected === null} onClick={() => setChecked(true)}>
              Check understanding
              <Check size={14} />
            </Button>
            {checked && (
              <p className={correct ? 'success-text' : 'error-text'} role="status">
                {correct
                  ? lab.checkpoint.explanation
                  : 'Not quite. Revisit the explanation and try again.'}
              </p>
            )}
            <div className="project-evidence">
              <h3>Your practice checklist</h3>
              <p>
                Be honest with yourself. Checking these boxes records a self-reported practice
                session, not an independently verified test run.
              </p>
              {lab.checklist.map((item, i) => (
                <label key={item}>
                  <input
                    type="checkbox"
                    checked={tasks[i]}
                    onChange={(e) =>
                      setTasks((previous) =>
                        previous.map((value, index) => (index === i ? e.target.checked : value)),
                      )
                    }
                  />
                  <span>{item}</span>
                </label>
              ))}
              <Button
                disabled={!correct || !tasks.every(Boolean) || done}
                onClick={() => {
                  complete(
                    lesson.id,
                    lesson.title,
                    Math.max(1, Math.round((Date.now() - startedAt.current) / 60000)),
                  );
                  setMessage(
                    'Practice recorded as self-reported. Keep your local test files as evidence.',
                  );
                }}
              >
                {done ? 'Practice recorded' : 'Record my practice'}
                <CheckCircle2 size={15} />
              </Button>
              {done && next && (
                <Button variant="outline" onClick={() => navigate('playground', next.id)}>
                  Next lesson
                  <ArrowRight size={15} />
                </Button>
              )}
            </div>
          </section>
        </div>
      </div>
      {message && (
        <div className="copy-status" role="status">
          <Check size={15} />
          {message}
          <button onClick={() => setMessage('')} aria-label="Dismiss status">
            ×
          </button>
        </div>
      )}
    </div>
  );
}
function CodeBlock({
  label,
  code,
  copy,
}: {
  label: string;
  code: string;
  copy: (code: string) => void;
}) {
  return (
    <div className="project-snippet">
      <div className="code-label">
        <span>{label}</span>
        <button aria-label={`Copy ${label}`} onClick={() => copy(code)}>
          <Copy size={13} />
          Copy
        </button>
      </div>
      <pre>
        <code>{code}</code>
      </pre>
    </div>
  );
}
