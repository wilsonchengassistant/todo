import React, { useState } from 'react';
import './App.css';

function App() {
  const [todos, setTodos] = useState<string[]>([]);
  const [newTodo, setNewTodo] = useState('');

  const addTodo = () => {
    if (newTodo.trim()) {
      setTodos([...todos, newTodo.trim()]);
      setNewTodo('');
    }
  };

  const deleteTodo = (index: number) => {
    setTodos(todos.filter((_, i) => i !== index));
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>ToDo App</h1>
        <div>
          <input
            type="text"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            placeholder="Add a new task"
          />
          <button onClick={addTodo}>Add</button>
        </div>
        <ul>
          {todos.map((todo, index) => (
            <li key={index}>
              {todo}
              <button onClick={() => deleteTodo(index)}>Delete</button>
            </li>
          ))}
        </ul>
      </header>
    </div>
  );
}

export default App;