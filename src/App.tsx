/**
 * Todoアプリのメインコンポーネント
 * @author y-nomura-cosmoroot
 */
import React, { useEffect, useState } from 'react';
import TodoForm from './TodoForm';
import TodoList from './TodoList';

export interface Assignee {
  id: number;
  name: string;
}

export interface Todo {
  id: number;
  text: string;
  assignee: Assignee;
}

/**
 * Todoアプリのメインコンポーネント
 */
const App: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [assignees, setAssignees] = useState<Assignee[]>([]);

  // 担当者データをJSONから取得
  useEffect(() => {
    fetch('/assignees.json')
      .then((res) => res.json())
      .then((data) => setAssignees(data))
      .catch((err) => {
        // エラー時は空配列
        setAssignees([]);
      });
  }, []);

  /**
   * 新しいTodoを追加する
   * @param text Todo内容
   * @param assignee 担当者
   */
  const addTodo = (text: string, assignee: Assignee) => {
    const newTodo: Todo = {
      id: Date.now(),
      text,
      assignee,
    };
    setTodos([...todos, newTodo]);
  };

  return (
    <div style={{ maxWidth: 500, margin: '40px auto', padding: 20, background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px #eee' }}>
      <h1>Todoアプリ</h1>
      <TodoForm assignees={assignees} onAdd={addTodo} />
      <TodoList todos={todos} />
    </div>
  );
};

export default App;
