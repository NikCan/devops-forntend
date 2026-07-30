import { useState, useEffect } from 'react';

interface Todo {
  id: number;
  title: string;
  completed: boolean;
}

// Получаем API_URL из глобального window.APP_CONFIG (Runtime Config)
declare global {
  interface Window {
    APP_CONFIG?: {
      API_URL?: string;
    };
  }
}

const API_BASE = window.APP_CONFIG?.API_URL || 'http://localhost:3001/api/todos';

export default function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchTodos = async () => {
    try {
      const res = await fetch(API_BASE);
      if (res.ok) {
        const data = await res.json();
        setTodos(data);
      }
    } catch (err) {
      console.error('Failed to fetch todos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  const addTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    try {
      const res = await fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: input.trim() }),
      });
      if (res.ok) {
        setInput('');
        fetchTodos();
      }
    } catch (err) {
      console.error('Failed to add todo:', err);
    }
  };

  const toggleTodo = async (id: number) => {
    try {
      const res = await fetch(`${API_BASE}/${id}`, { method: 'PATCH' });
      if (res.ok) fetchTodos();
    } catch (err) {
      console.error('Failed to toggle todo:', err);
    }
  };

  const deleteTodo = async (id: number) => {
    try {
      const res = await fetch(`${API_BASE}/${id}`, { method: 'DELETE' });
      if (res.ok) fetchTodos();
    } catch (err) {
      console.error('Failed to delete todo:', err);
    }
  };

  return (
    <div className="container">
      <div className="header">
        <h1 className="title">K8s Task Tracker</h1>
        <span className="badge">PostgreSQL Connected</span>
      </div>

      <form className="form" onSubmit={addTodo}>
        <input
          className="input"
          type="text"
          placeholder="Add a new task..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button className="btn-add" type="submit">
          Add
        </button>
      </form>

      {loading ? (
        <div className="empty-state">Loading tasks from Postgres...</div>
      ) : todos.length === 0 ? (
        <div className="empty-state">No tasks yet. Create one above!</div>
      ) : (
        <ul className="todo-list">
          {todos.map((todo) => (
            <li
              key={todo.id}
              className={`todo-item ${todo.completed ? 'completed' : ''}`}
            >
              <span
                className="todo-text"
                onClick={() => toggleTodo(todo.id)}
              >
                {todo.completed ? '✓ ' : '○ '}
                {todo.title}
              </span>
              <button
                className="btn-delete"
                onClick={() => deleteTodo(todo.id)}
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
