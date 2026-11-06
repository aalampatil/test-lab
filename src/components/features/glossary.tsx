'use client';
import { useState } from 'react';
import { Search } from 'lucide-react';
import { glossary } from '@/lib/curriculum/concepts';
export function Glossary() {
  const [search, setSearch] = useState('');
  const [group, setGroup] = useState('All terms');
  const filtered = glossary.filter(
    (item) =>
      (group === 'All terms' || item.group === group) &&
      `${item.term} ${item.definition} ${item.example}`
        .toLowerCase()
        .includes(search.toLowerCase()),
  );
  return (
    <section className="glossary">
      <div className="tool-toolbar">
        <label className="search-field">
          <Search size={16} />
          <input
            aria-label="Search testing terminology"
            placeholder="Search a testing term..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>
        <select
          className="glossary-filter"
          aria-label="Filter terminology"
          value={group}
          onChange={(e) => setGroup(e.target.value)}
        >
          {['All terms', ...new Set(glossary.map((item) => item.group))].map((category) => (
            <option key={category}>{category}</option>
          ))}
        </select>
        <span className="muted small">
          {filtered.length} of {glossary.length} terms
        </span>
      </div>
      <p className="glossary-intro">
        Use this as a reference while practicing. You do not need to memorize every term before
        writing your first test.
      </p>
      <div className="glossary-grid">
        {filtered.map((item) => (
          <article key={item.term}>
            <span className="eyebrow">{item.group.toUpperCase()}</span>
            <h2>{item.term}</h2>
            <p>{item.definition}</p>
            <div>
              <strong>Example</strong>
              <p>{item.example}</p>
            </div>
          </article>
        ))}
      </div>
      {!filtered.length && (
        <div className="empty-state">
          <h3>No matching terminology</h3>
          <p>Try a broader term or another category.</p>
        </div>
      )}
    </section>
  );
}
