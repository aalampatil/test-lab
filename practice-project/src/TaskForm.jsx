import React, { useState } from 'react';
export function TaskForm({ onAdd }) {
  const [title, setTitle] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  async function submit(event) {
    event.preventDefault();
    if (!title.trim()) { setError('Enter a task title'); return; }
    setError(''); setSaving(true);
    try { await onAdd(title.trim()); setTitle(''); }
    catch { setError('Could not save task'); }
    finally { setSaving(false); }
  }
  return <form onSubmit={submit}>
    <label htmlFor="task-title">Task title</label>
    <input id="task-title" value={title} onChange={event => setTitle(event.target.value)} />
    <button disabled={saving}>{saving ? 'Saving…' : 'Add task'}</button>
    {error && <p role="alert">{error}</p>}
  </form>;
}
