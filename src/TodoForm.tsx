import React, { useState } from 'react';
import { Assignee } from './App';

interface TodoFormProps {
  assignees: Assignee[];
  onAdd: (text: string, assignee: Assignee) => void;
}

/**
 * 新規Todo追加フォーム
 * @param assignees 担当者リスト
 * @param onAdd Todo追加時のコールバック
 */
const TodoForm: React.FC<TodoFormProps> = ({ assignees, onAdd }) => {
  const [text, setText] = useState('');
  const [assigneeId, setAssigneeId] = useState<number | ''>('');

  /**
   * フォーム送信時の処理
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text || assigneeId === '') return;
    const assignee = assignees.find(a => a.id === assigneeId);
    if (!assignee) return;
    onAdd(text, assignee);
    setText('');
    setAssigneeId('');
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: 24 }}>
      <div style={{ marginBottom: 8 }}>
        <input
          type="text"
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Todo内容を入力"
          style={{ width: '70%', padding: 8, fontSize: 16 }}
        />
      </div>
      <div style={{ marginBottom: 8 }}>
        <select
          value={assigneeId}
          onChange={e => setAssigneeId(Number(e.target.value))}
          style={{ width: '70%', padding: 8, fontSize: 16 }}
        >
          <option value="">担当者を選択</option>
          {assignees.map(a => (
            <option key={a.id} value={a.id}>{a.name}</option>
          ))}
        </select>
      </div>
      <button type="submit" style={{ padding: '8px 24px', fontSize: 16 }}>追加</button>
    </form>
  );
};

export default TodoForm;
