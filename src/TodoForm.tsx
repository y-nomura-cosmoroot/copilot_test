/**
 * Todo追加フォームコンポーネント
 * @author y-nomura-cosmoroot
 */
import React, { useState } from 'react';
import { Assignee } from './types';

interface TodoFormProps {
  assignees: Assignee[];
  onAdd: (text: string, assignees: Assignee[]) => Promise<void>;
}

/**
 * 新規Todo追加フォーム
 * @param assignees 担当者リスト
 * @param onAdd Todo追加時のコールバック
 */
const TodoForm: React.FC<TodoFormProps> = ({ assignees, onAdd }) => {
  const [text, setText] = useState('');
  const [selectedAssigneeIds, setSelectedAssigneeIds] = useState<number[]>([]);

  /**
   * フォーム送信時の処理
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text || selectedAssigneeIds.length === 0) return;
    const selectedAssignees = assignees.filter(a => selectedAssigneeIds.includes(a.id));
    if (selectedAssignees.length === 0) return;
    await onAdd(text, selectedAssignees);
    setText('');
    setSelectedAssigneeIds([]);
  };

  /**
   * 担当者の選択状態を切り替える
   */
  const toggleAssignee = (assigneeId: number) => {
    setSelectedAssigneeIds(prev => 
      prev.includes(assigneeId)
        ? prev.filter(id => id !== assigneeId)
        : [...prev, assigneeId]
    );
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
        <label style={{ display: 'block', marginBottom: 4, fontWeight: 'bold' }}>担当者を選択（複数選択可）:</label>
        <div style={{ border: '1px solid #ccc', borderRadius: 4, padding: 8, maxHeight: 120, overflowY: 'auto' }}>
          {assignees.map(assignee => (
            <label key={assignee.id} style={{ display: 'block', marginBottom: 4, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={selectedAssigneeIds.includes(assignee.id)}
                onChange={() => toggleAssignee(assignee.id)}
                style={{ marginRight: 8 }}
              />
              {assignee.name}
            </label>
          ))}
        </div>
      </div>
      <button type="submit" style={{ padding: '8px 24px', fontSize: 16 }}>追加</button>
    </form>
  );
};

export default TodoForm;
