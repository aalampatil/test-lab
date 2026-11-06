'use client';
import { useState } from 'react';
import { ArrowUpRight, Check, Copy, Search, Terminal } from 'lucide-react';
import { tools, type TestingTool } from '@/lib/content';
import { type Navigate } from '@/lib/progress';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
export function ToolExplorer({ navigate }: { navigate: Navigate }) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All tools');
  const [tool, setTool] = useState<TestingTool | null>(null);
  const [copied, setCopied] = useState(false);
  const filtered = tools.filter(
    (t) =>
      (category === 'All tools' || t.category === category) &&
      `${t.name} ${t.tech} ${t.overview}`.toLowerCase().includes(search.toLowerCase()),
  );
  return (
    <div className="page-enter">
      <div className="page-heading">
        <div>
          <div className="eyebrow">THE RIGHT TOOL FOR THE TEST</div>
          <h1>Meet your testing toolkit.</h1>
          <p>Understand what each tool does, and when to reach for it.</p>
        </div>
      </div>
      <div className="tool-toolbar">
        <div className="filter-pills">
          {[
            'All tools',
            'Unit testing',
            'Component testing',
            'End-to-end testing',
            'API testing',
          ].map((c) => (
            <button
              className={category === c ? 'active' : ''}
              onClick={() => setCategory(c)}
              key={c}
            >
              {c}
            </button>
          ))}
        </div>
        <label className="search-field">
          <Search size={16} />
          <input
            aria-label="Search testing tools"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Find a tool..."
          />
        </label>
      </div>
      <div className="tool-grid">
        {filtered.map((t) => (
          <button
            className="tool-card"
            key={t.name}
            onClick={() => {
              setTool(t);
              setCopied(false);
            }}
          >
            <div className="path-card-top">
              <span className={`tool-logo ${t.color}`}>{t.mark}</span>
              <ArrowUpRight size={18} />
            </div>
            <h2>{t.name}</h2>
            <span className="tool-category">{t.category}</span>
            <p>{t.overview}</p>
            <div className="tool-card-footer">
              <span>{t.tech.split(' · ').slice(0, 2).join(' · ')}</span>
              <span className={t.executable ? 'executable-label' : ''}>
                {t.executable ? '● Practice in TestLab' : 'Tool guide'}
              </span>
            </div>
          </button>
        ))}
      </div>
      {!filtered.length && (
        <div className="empty-state">
          <Search size={28} />
          <h3>No tools found</h3>
          <p>Try another name or choose a different category.</p>
          <Button
            variant="outline"
            onClick={() => {
              setSearch('');
              setCategory('All tools');
            }}
          >
            Clear filters
          </Button>
        </div>
      )}
      <div className="info-note">
        <Terminal size={17} />
        <p>
          Vitest-style exercises run in local practice mode. The other tools have informational
          guides; their examples do not execute in TestLab.
        </p>
      </div>
      <Dialog
        open={!!tool}
        onOpenChange={(open) => !open && setTool(null)}
        title={tool?.name ?? 'Tool guide'}
      >
        {tool && (
          <div className="tool-detail">
            <span className="badge">{tool.category}</span>
            <p>{tool.overview}</p>
            <dl>
              <dt>Works with</dt>
              <dd>{tool.tech}</dd>
              <dt>When to use it</dt>
              <dd>{tool.use}</dd>
              <dt>When to choose something else</dt>
              <dd>{tool.avoid}</dd>
              <dt>Advantages</dt>
              <dd>{tool.advantage}</dd>
              <dt>Limitations</dt>
              <dd>{tool.limitation}</dd>
            </dl>
            <div className="code-label">
              INSTALLATION
              <button
                aria-label="Copy installation command"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(tool.install);
                    setCopied(true);
                  } catch {
                    setCopied(false);
                  }
                }}
              >
                {copied ? <Check size={15} /> : <Copy size={15} />}
              </button>
            </div>
            <pre>
              <code>{tool.install}</code>
            </pre>
            <div className="code-label">EXAMPLE TEST</div>
            <pre>
              <code>{tool.example}</code>
            </pre>
            <div className="dialog-actions">
              <a className="button button-outline" href={tool.url} target="_blank" rel="noreferrer">
                Official documentation
                <ArrowUpRight size={15} />
              </a>
              {tool.executable && (
                <Button
                  onClick={() => {
                    setTool(null);
                    navigate('playground', 'first-test');
                  }}
                >
                  Try a lesson
                </Button>
              )}
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
}
