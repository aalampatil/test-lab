'use client';
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Bug,
  Check,
  Code2,
  FlaskConical,
  Play,
  Terminal,
} from 'lucide-react';
import { type Navigate, type Progress } from '@/lib/progress';
import { Button } from '@/components/ui/button';
import { PathCards } from './dashboard';
export function Landing({ navigate, progress }: { navigate: Navigate; progress: Progress }) {
  return (
    <div className="landing page-enter">
      <div className="landing-hero">
        <span className="hero-badge">
          <FlaskConical size={14} /> A SAFE PLACE TO BREAK THINGS
        </span>
        <h1>
          Good developers write code.
          <br />
          <span>Confident developers test it.</span>
        </h1>
        <p>
          Learn to test real applications, one bug at a time.
          <br />
          Short lessons. Real code. That satisfying little green check.
        </p>
        <div>
          <Button onClick={() => navigate('playground', 'first-test')}>
            Start learning
            <ArrowRight size={16} />
          </Button>
          <Button variant="outline" onClick={() => navigate('paths')}>
            Explore the curriculum
          </Button>
        </div>
        <span className="landing-note">No account needed. Just bring your curiosity.</span>
      </div>
      <div className="landing-preview">
        <div className="preview-code">
          <div className="code-label">
            <Code2 size={15} />
            your-first-test.js
          </div>
          <pre>
            <code>
              <span className="syntax-purple">it</span>(
              <span className="syntax-green">{"'adds two numbers'"}</span>, () =&gt; {'{'}
              {'\n'} <span className="syntax-purple">expect</span>(add(2, 3)).
              <span className="syntax-blue">toBe</span>(5);{'\n'}
              {'}'});
            </code>
          </pre>
        </div>
        <div className="preview-result">
          <span>
            <Check size={18} />1 passing test. Your first step.
          </span>
          <Button variant="outline" onClick={() => navigate('playground', 'first-test')}>
            <Play size={14} />
            Make it your own
          </Button>
        </div>
      </div>
      <div className="framework-strip">
        <span>MEET YOUR FUTURE TOOLKIT</span>
        <b>ϟ Vitest</b>
        <b>♜ Jest</b>
        <b>⚛ Testing Library</b>
        <b>◒ Playwright</b>
        <b>cy Cypress</b>
      </div>
      <div className="section-heading spaced">
        <div>
          <h2>Less watching. More “I get it.”</h2>
          <p>A learning loop that turns concepts into confidence.</p>
        </div>
      </div>
      <div className="how-grid">
        {[
          {
            icon: BookOpen,
            title: '01. Understand the why',
            text: 'Start with a short explanation and a real-world example.',
          },
          {
            icon: Terminal,
            title: '02. Write. Run. Repeat.',
            text: 'Edit a test, run it, and understand every result.',
          },
          {
            icon: Bug,
            title: '03. Think like a tester',
            text: 'Find edge cases and prove your test catches real bugs.',
          },
        ].map((item) => (
          <div key={item.title}>
            <span className="icon-box orange">
              <item.icon size={22} />
            </span>
            <h3>{item.title}</h3>
            <p>{item.text}</p>
          </div>
        ))}
      </div>
      <div className="section-heading spaced">
        <div>
          <h2>A good place to start.</h2>
          <p>Practical paths for your next chapter as a developer.</p>
        </div>
      </div>
      <PathCards progress={progress} navigate={navigate} />
      <footer className="landing-footer">
        <span>TestLab · Built for curious developers.</span>
        <button className="text-link" onClick={() => navigate('tools')}>
          Explore testing tools
          <ArrowUpRight size={14} />
        </button>
      </footer>
    </div>
  );
}
