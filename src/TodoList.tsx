/**
 * Todo一覧表示コンポーネント（カンバン方式）
 * @author y-nomura-cosmoroot
 */
import React from 'react';
import { Todo, TodoStatus } from './App';

interface TodoListProps {
  todos: Todo[];
  onStatusChange: (todoId: string, newStatus: TodoStatus) => void;
}

/**
 * Todo一覧表示コンポーネント（カンバン方式）
 * @param todos Todoリスト
 * @param onStatusChange ステータス変更時のコールバック
 */
const TodoList: React.FC<TodoListProps> = ({ todos, onStatusChange }) => {
  const statuses: { status: TodoStatus; title: string; bgColor: string }[] = [
    { status: 'TODO', title: '未着手', bgColor: '#fff2e6' },
    { status: 'PROGRESS', title: '進行中', bgColor: '#e6f3ff' },
    { status: 'DONE', title: '完了', bgColor: '#e6ffe6' }
  ];

  /**
   * 指定されたステータスのTodoをフィルタリング
   */
  const getTodosByStatus = (status: TodoStatus): Todo[] => {
    return todos.filter(todo => todo.status === status);
  };

  /**
   * TodoItemコンポーネント
   */
  const TodoItem: React.FC<{ todo: Todo }> = ({ todo }) => (
    <div style={{ 
      marginBottom: 8, 
      padding: 12, 
      background: '#fff', 
      borderRadius: 6, 
      border: '1px solid #ddd',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
    }}>
      <div style={{ fontWeight: 'bold', marginBottom: 8 }}>{todo.text}</div>
      <div style={{ fontSize: 12, color: '#666', marginBottom: 8 }}>
        担当: {todo.assignees.map(a => a.name).join(', ')}
      </div>
      <div style={{ display: 'flex', gap: 4 }}>
        {statuses.map(statusConfig => (
          <button
            key={statusConfig.status}
            onClick={() => onStatusChange(todo.id, statusConfig.status)}
            disabled={todo.status === statusConfig.status}
            style={{
              padding: '4px 8px',
              fontSize: 10,
              border: 'none',
              borderRadius: 3,
              cursor: todo.status === statusConfig.status ? 'default' : 'pointer',
              backgroundColor: todo.status === statusConfig.status ? '#ccc' : '#007bff',
              color: todo.status === statusConfig.status ? '#666' : '#fff'
            }}
          >
            {statusConfig.title}
          </button>
        ))}
      </div>
    </div>
  );

  if (todos.length === 0) {
    return <p>Todoはありません</p>;
  }

  return (
    <div style={{ display: 'flex', gap: 16, minHeight: 400 }}>
      {statuses.map(statusConfig => (
        <div key={statusConfig.status} style={{ flex: 1 }}>
          <h3 style={{ 
            margin: '0 0 16px 0', 
            padding: 12, 
            backgroundColor: statusConfig.bgColor, 
            borderRadius: 6, 
            textAlign: 'center' 
          }}>
            {statusConfig.title} ({getTodosByStatus(statusConfig.status).length})
          </h3>
          <div>
            {getTodosByStatus(statusConfig.status).length === 0 ? (
              <div style={{ 
                padding: 16, 
                textAlign: 'center', 
                color: '#999', 
                fontStyle: 'italic' 
              }}>
                アイテムなし
              </div>
            ) : (
              getTodosByStatus(statusConfig.status).map(todo => (
                <TodoItem key={todo.id} todo={todo} />
              ))
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default TodoList;
