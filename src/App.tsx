import React, { useEffect, useState } from 'react';
import './App.css';

type Todo = {
  id: string;
  text: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  due?: string; // ISO date
};

const STORAGE_KEY = 'todo_v1';

function App() {
  const [todos, setTodos] = useState<Todo[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  });
  const [newText, setNewText] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [search, setSearch] = useState('');
  const [theme, setTheme] = useState<'light' | 'dark'>(() => (localStorage.getItem('theme') as 'light' | 'dark') || 'light');

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  }, [todos]);

  useEffect(() => {
    localStorage.setItem('theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const addTodo = () => {
    const text = newText.trim();
    if (!text) return;
    const t: Todo = { id: Date.now().toString(), text, completed: false, priority: 'medium' };
    setTodos((s) => [...s, t]);
    setNewText('');
  };

  const toggle = (id: string) => setTodos((s) => s.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  const remove = (id: string) => setTodos((s) => s.filter(t => t.id !== id));
  const update = (id: string, patch: Partial<Todo>) => setTodos((s) => s.map(t => t.id === id ? { ...t, ...patch } : t));

  const move = (id: string, dir: -1 | 1) => {
    setTodos((s) => {
      const idx = s.findIndex(t => t.id === id);
      if (idx === -1) return s;
      const newIdx = idx + dir;
      if (newIdx < 0 || newIdx >= s.length) return s;
      const copy = [...s];
      const [item] = copy.splice(idx, 1);
      copy.splice(newIdx, 0, item);
      return copy;
    });
  };

  const exportCSV = () => {
    const rows = todos.map(t => ({ text: t.text, completed: t.completed, priority: t.priority, due: t.due || '' }));
    const csv = [Object.keys(rows[0] || {}).join(','), ...rows.map(r => `${r.text.replaceAll(',', ' ')} ,${r.completed},${r.priority},${r.due}`)].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'todos.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const importCSV = (file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const text = reader.result as string;
        const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
        const data = lines.slice(1);
        const items = data.map(line => {
          const parts = line.split(',');
          return {
            id: Date.now().toString() + Math.random().toString(36).slice(2,8),
            text: parts[0] || 'Imported',
            completed: parts[1] === 'true',
            priority: (parts[2] as Todo['priority']) || 'medium',
            due: parts[3] || undefined
          } as Todo;
        });
        setTodos((s) => [...s, ...items]);
      } catch (e) { /* ignore */ }
    };
    reader.readAsText(file);
  };

  const filtered = todos.filter(t => {
    if (filter === 'active' && t.completed) return false;
    if (filter === 'completed' && !t.completed) return false;
    if (search && !t.text.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="App">
      <header className="App-header">
        <h1>Todo App</h1>
        <div className="controls">
          <div className="left">
            <input value={newText} onChange={e => setNewText(e.target.value)} placeholder="Add a new task" />
            <button onClick={addTodo}>Add</button>
            <select onChange={e => update('0', { priority: e.target.value as any })} style={{display:'none'}} />
          </div>
          <div className="right">
            <input placeholder="Search" value={search} onChange={e => setSearch(e.target.value)} />
            <select value={filter} onChange={e => setFilter(e.target.value as any)}>
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
            </select>
            <button onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')}>Theme</button>
            <button onClick={exportCSV}>Export CSV</button>
            <label className="import">
              Import CSV
              <input type="file" accept=".csv,text/csv" onChange={e => importCSV(e.target.files?.[0])} />
            </label>
          </div>
        </div>

        <ul className="todo-list">
          {filtered.map((t, i) => (
            <li key={t.id} className={"todo-item" + (t.completed ? ' done' : '')}>
              <input type="checkbox" checked={t.completed} onChange={() => toggle(t.id)} />
              <input className="edit" value={t.text} onChange={e => update(t.id, { text: e.target.value })} />
              <select value={t.priority} onChange={e => update(t.id, { priority: e.target.value as any })}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
              <input type="date" value={t.due || ''} onChange={e => update(t.id, { due: e.target.value || undefined })} />
              <button onClick={() => move(t.id, -1)}>↑</button>
              <button onClick={() => move(t.id, 1)}>↓</button>
              <button onClick={() => remove(t.id)}>Delete</button>
            </li>
          ))}
        </ul>
      </header>
    </div>
  );
}

export default App;
