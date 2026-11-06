'use client';
import {
  ArrowUpRight,
  ArrowRight,
  BookOpen,
  Check,
  CheckCheck,
  ChevronRight,
  Clock3,
  Code2,
  FlaskConical,
  Layers3,
  Lightbulb,
  Play,
  Route,
  Sparkles,
  Target,
  Terminal,
  Trophy,
  Zap,
} from 'lucide-react';
import { lessons, concepts } from '@/lib/content';
import { type Progress, type Navigate } from '@/lib/progress';
import { Button } from '@/components/ui/button';

export function PathCards({ progress, navigate }: { progress: Progress; navigate: Navigate }) {
  const paths = [
    {
      name: 'Testing fundamentals',
      description: 'Build a solid foundation. Learn the what, why, and how of testing.',
      icon: BookOpen,
      color: 'orange',
      ids: concepts.map((_, i) => `concept-${i}`),
      meta: '10 concepts',
      level: 'Beginner',
      view: 'fundamentals' as const,
    },
    {
      name: 'Unit testing with Vitest',
      description: 'Write your first tests and turn small functions into reliable code.',
      icon: FlaskConical,
      color: 'purple',
      ids: lessons.filter((l) => l.category === 'Unit testing').map((l) => l.id),
      meta: '3 hands-on lessons',
      level: 'Beginner',
      view: 'playground' as const,
    },
    {
      name: 'Integration testing',
      description: 'Connect the dots. Make sure your application works together.',
      icon: Layers3,
      color: 'teal',
      ids: ['integration'],
      meta: '1 hands-on lesson',
      level: 'Intermediate',
      view: 'playground' as const,
    },
  ];
  return (
    <div className="path-grid">
      {paths.map((path) => {
        const done = path.ids.filter((id) => progress.completed.includes(id)).length;
        const percent = Math.round((done / path.ids.length) * 100);
        return (
          <button
            className="path-card"
            key={path.name}
            onClick={() =>
              navigate(
                path.view,
                path.view === 'playground'
                  ? (path.ids.find((id) => !progress.completed.includes(id)) ?? path.ids[0])
                  : undefined,
              )
            }
          >
            <div className="path-card-top">
              <span className={`icon-box ${path.color}`}>
                <path.icon size={23} strokeWidth={1.8} />
              </span>
              <span className={`level ${path.level === 'Intermediate' ? 'intermediate' : ''}`}>
                {path.level}
              </span>
            </div>
            <h3>
              {path.name}
              <ArrowUpRight size={17} />
            </h3>
            <p>{path.description}</p>
            <div className="path-meta">
              <span>
                <BookOpen size={13} />
                {path.meta}
              </span>
              <span>
                <Clock3 size={13} />
                {path.view === 'fundamentals' ? '25' : path.color === 'purple' ? '30' : '14'} min
              </span>
            </div>
            <div className="progress-track">
              <span style={{ width: `${percent}%` }} />
            </div>
            <div className="progress-caption">
              <span>{done ? `${done} of ${path.ids.length} completed` : 'Ready when you are'}</span>
              <span>{percent}%</span>
            </div>
          </button>
        );
      })}
    </div>
  );
}

export function Dashboard({ progress, navigate }: { progress: Progress; navigate: Navigate }) {
  const done = progress.completed.length;
  const total = lessons.length + concepts.length;
  const next = lessons.find((l) => !progress.completed.includes(l.id)) ?? lessons[0];
  const completedLessons = lessons.filter((l) => progress.completed.includes(l.id)).length;
  return (
    <div className="dashboard page-enter">
      <div className="page-heading">
        <div>
          <div className="eyebrow">
            <span className="tiny-sun">✳</span> A LITTLE PRACTICE. A LOT MORE CONFIDENCE.
          </div>
          <h1>
            Good to see you, {progress.name}
            <span className="wave">✺</span>
          </h1>
          <p>Great software starts with a curious mind. Let’s put yours to the test.</p>
        </div>
        <span className="date-pill">
          <span className="live-dot" />
          Your testing journey
        </span>
      </div>
      <section className="welcome-card">
        <div className="welcome-copy">
          <span className="hero-badge">
            <Sparkles size={13} /> BUILT FOR LEARNING BY DOING
          </span>
          <h2>
            Small tests.
            <br />
            Big <span>“I’ve got this.”</span> energy.
          </h2>
          <p>
            Learn to test real applications, one bug at a time.
            <br className="desktop-br" /> Write code, break things, and build your confidence.
          </p>
          <div className="hero-actions">
            <Button onClick={() => navigate('playground', next.id)}>
              {completedLessons ? 'Continue learning' : 'Start your first lesson'}
              <ArrowRight size={16} />
            </Button>
            <span>
              <Clock3 size={14} /> Just 8 minutes to get started
            </span>
          </div>
        </div>
        <div className="hero-visual" aria-hidden="true">
          <div className="floating-tag">
            <span className="green-dot" /> A little green goes a long way.
          </div>
          <div className="mini-editor">
            <div className="mini-title">
              <span>
                <i />
                <i />
                <i />
              </span>
              <span>hello-confidence.test.js</span>
              <Code2 size={12} />
            </div>
            <div className="mini-code">
              <div>
                <b>1</b>
                <span className="syntax-purple">it</span>(
                <span className="syntax-green">'you can do this'</span>, () =&gt; {'{'}
              </div>
              <div>
                <b>2</b> <span className="syntax-purple">expect</span>(yourPotential).
                <span className="syntax-blue">toBe</span>(
              </div>
              <div>
                <b>3</b> <span className="syntax-orange">'limitless'</span>
              </div>
              <div>
                <b>4</b> );
              </div>
              <div>
                <b>5</b>
                {'}'});
              </div>
            </div>
            <div className="mini-result">
              <span>
                <Check size={14} /> 1 test passed
              </span>
              <span>12ms</span>
            </div>
          </div>
          <div className="check-sticker">
            <CheckCheck size={29} strokeWidth={2.5} />
          </div>
          <span className="visual-spark spark-one">✳</span>
          <span className="visual-spark spark-two">+</span>
        </div>
      </section>
      <div className="stats-grid">
        <Stat
          icon={BookOpen}
          color="orange"
          label="Lessons completed"
          value={`${completedLessons}`}
          suffix={`/ ${lessons.length}`}
          note={completedLessons ? 'Keep that momentum going' : 'Your first win is waiting'}
        />
        <Stat
          icon={Route}
          color="purple"
          label="Overall progress"
          value={`${Math.round((done / total) * 100)}%`}
          note={`${done} of ${total} learning activities`}
        />
        <Stat
          icon={Clock3}
          color="teal"
          label="Time invested"
          value={`${progress.minutes}`}
          suffix="min"
          note="Every minute is a step forward"
        />
        <Stat
          icon={Trophy}
          color="amber"
          label="Challenges solved"
          value={`${lessons.filter((l) => l.category === 'Bug hunting' && progress.completed.includes(l.id)).length}`}
          suffix="/ 2"
          note="Put your detective hat on"
        />
      </div>
      <section className="section">
        <div className="section-heading">
          <div>
            <h2>Your learning paths</h2>
            <p>A clear path from “where do I start?” to “I know what to test.”</p>
          </div>
          <button className="text-link" onClick={() => navigate('paths')}>
            Explore all paths
            <ArrowRight size={15} />
          </button>
        </div>
        <PathCards progress={progress} navigate={navigate} />
      </section>
      <div className="dashboard-bottom">
        <section className="next-section">
          <div className="section-heading">
            <div>
              <h2>A little practice, every day</h2>
              <p>Your next steps to becoming a more confident developer.</p>
            </div>
          </div>
          <div className="lesson-list">
            {lessons.slice(0, 3).map((lesson, i) => (
              <button
                key={lesson.id}
                onClick={() => navigate('playground', lesson.id)}
                className="lesson-row"
              >
                <span
                  className={`lesson-number ${progress.completed.includes(lesson.id) ? 'is-done' : ''}`}
                >
                  {progress.completed.includes(lesson.id) ? <Check size={17} /> : `0${i + 1}`}
                </span>
                <span className="lesson-row-text">
                  <strong>{lesson.title}</strong>
                  <span>
                    {lesson.category}
                    <i />
                    {lesson.minutes} min
                  </span>
                </span>
                <span className="lesson-row-tag">
                  {progress.completed.includes(lesson.id)
                    ? 'Completed'
                    : i === 0
                      ? 'Start here'
                      : 'Hands-on'}
                </span>
                <ChevronRight size={17} />
              </button>
            ))}
          </div>
        </section>
        <aside className="tester-tip">
          <div className="tip-title">
            <span className="icon-box amber">
              <Lightbulb size={20} />
            </span>
            <span>THE TESTER’S MINDSET</span>
          </div>
          <h3>
            Don’t just ask,
            <br />
            “Does it work?”
          </h3>
          <p>
            Ask, “What could go wrong?”
            <br />
            The best tests start with a<br className="desktop-br" /> better question.
          </p>
          <button className="text-link" onClick={() => navigate('fundamentals')}>
            Learn to think like a tester
            <ArrowUpRight size={15} />
          </button>
          <span className="tip-decoration">?</span>
        </aside>
      </div>
      <footer className="workspace-footer">
        <span>
          <Terminal size={13} /> Built for curious developers. Bugs welcome.
        </span>
        <button onClick={() => navigate('about')}>
          Learn about TestLab
          <ArrowUpRight size={12} />
        </button>
      </footer>
    </div>
  );
}
function Stat({
  icon: Icon,
  color,
  label,
  value,
  suffix,
  note,
}: {
  icon: typeof BookOpen;
  color: string;
  label: string;
  value: string;
  suffix?: string;
  note: string;
}) {
  return (
    <div className="stat-card">
      <div className="stat-label">
        <span>{label}</span>
        <Icon size={17} className={`stat-icon ${color}`} />
      </div>
      <div className="stat-value">
        {value}
        <span>{suffix}</span>
      </div>
      <p>{note}</p>
    </div>
  );
}

export function LearningPaths({ progress, navigate }: { progress: Progress; navigate: Navigate }) {
  return (
    <div className="page-enter">
      <div className="page-heading">
        <div>
          <div className="eyebrow">YOUR NEXT CHAPTER</div>
          <h1>Build confidence, step by step.</h1>
          <p>Start with the fundamentals, then learn by writing real tests.</p>
        </div>
      </div>
      <PathCards progress={progress} navigate={navigate} />
      <div className="section-heading spaced">
        <div>
          <h2>The full curriculum</h2>
          <p>No locked lessons. Follow your curiosity.</p>
        </div>
      </div>
      <div className="curriculum">
        {lessons.map((l, i) => (
          <button
            className="curriculum-row"
            key={l.id}
            onClick={() => navigate('playground', l.id)}
          >
            <span className="lesson-number">
              {progress.completed.includes(l.id) ? (
                <Check size={18} />
              ) : (
                String(i + 1).padStart(2, '0')
              )}
            </span>
            <div>
              <h3>{l.title}</h3>
              <p>{l.description}</p>
            </div>
            <span className="badge">{l.category}</span>
            <span className="muted">{l.minutes} min</span>
            <ArrowRight size={17} />
          </button>
        ))}
      </div>
    </div>
  );
}

export function BugHunting({ progress, navigate }: { progress: Progress; navigate: Navigate }) {
  return (
    <div className="page-enter">
      <div className="page-heading">
        <div>
          <div className="eyebrow">FOLLOW THE CLUES</div>
          <h1>Every bug tells a story.</h1>
          <p>Turn a customer’s bug report into a test that stops it coming back.</p>
        </div>
        <span className="icon-box orange">
          <Target size={25} />
        </span>
      </div>
      <div className="bug-banner">
        <div>
          <span className="hero-badge">
            <Zap size={13} /> REGRESSION TESTING
          </span>
          <h2>Find it. Test it. Keep it fixed.</h2>
          <p>
            These challenges run your tests against both a fix and a deliberate bug.
            <br />
            To complete a challenge, your test needs to tell them apart.
          </p>
        </div>
        <div className="bug-art">
          <Code2 size={60} />
          <span>!</span>
        </div>
      </div>
      <div className="challenge-grid">
        {lessons
          .filter((l) => l.category === 'Bug hunting')
          .map((l, i) => (
            <article className="challenge-card" key={l.id}>
              <div className="path-card-top">
                <span className={`icon-box ${i ? 'purple' : 'orange'}`}>
                  <Target size={24} />
                </span>
                <span className="level">
                  {progress.completed.includes(l.id) ? 'Solved' : 'Beginner'}
                </span>
              </div>
              <span className="eyebrow">CASE 00{i + 1}</span>
              <h2>{l.title}</h2>
              <p>{l.description}</p>
              <div className="challenge-report">
                <strong>Customer report</strong>
                <p>
                  {i
                    ? '“I just turned 18, but your app says I’m too young to register.”'
                    : '“I applied my 20% coupon and my order became more expensive!”'}
                </p>
              </div>
              <Button variant="outline" onClick={() => navigate('playground', l.id)}>
                {progress.completed.includes(l.id) ? 'Revisit challenge' : 'Investigate the bug'}
                <ArrowRight size={16} />
              </Button>
            </article>
          ))}
      </div>
    </div>
  );
}
