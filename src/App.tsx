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

export type TodoStatus = 'TODO' | 'PROGRESS' | 'DONE';

export interface Todo {
  id: string;
  text: string;
  assignees: Assignee[];
  status: TodoStatus;
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
        console.error('Failed to fetch assignees:', err); // エラーをログに記録
        // エラー時は空配列
        setAssignees([]);
      });
  }, []);

  /**
   * 新しいTodoを追加する
   * @param text Todo内容
   * @param assignees 担当者リスト
   */
  const addTodo = (text: string, assignees: Assignee[]) => {
    const newTodo: Todo = {
      id: crypto.randomUUID(),
      text,
      assignees,
      status: 'TODO',
    };
    setTodos([...todos, newTodo]);
  };

  /**
   * Todoのステータスを更新する
   * @param todoId TodoのID
   * @param newStatus 新しいステータス
   */
  const updateTodoStatus = (todoId: string, newStatus: TodoStatus) => {
    setTodos(todos.map(todo => 
      todo.id === todoId ? { ...todo, status: newStatus } : todo
    ));
  };

  return (
    <div style={{ maxWidth: 1200, margin: '40px auto', padding: 20, background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px #eee' }}>
      <h1>Todoアプリ（カンバン方式）</h1>
      <TodoForm assignees={assignees} onAdd={addTodo} />
      <TodoList todos={todos} onStatusChange={updateTodoStatus} />
    </div>
  );
};

export default App;
