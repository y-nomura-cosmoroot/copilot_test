import React from 'react';
import { Todo } from './App';

interface TodoListProps {
  todos: Todo[];
}

/**
 * Todo一覧表示コンポーネント
 * @param todos Todoリスト
 */
const TodoList: React.FC<TodoListProps> = ({ todos }) => {
  if (todos.length === 0) {
    return <p>Todoはありません</p>;
  }
  return (
    <ul style={{ listStyle: 'none', padding: 0 }}>
      {todos.map(todo => (
        <li key={todo.id} style={{ marginBottom: 12, padding: 12, background: '#f7f7f7', borderRadius: 6 }}>
          <span style={{ fontWeight: 'bold' }}>{todo.text}</span>
          <span style={{ marginLeft: 16, color: '#888' }}>担当: {todo.assignee.name}</span>
        </li>
      ))}
    </ul>
  );
};

export default TodoList;
