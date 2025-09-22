const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const database = require('../config/database');

const router = express.Router();

// TODO一覧取得
router.get('/', authenticateToken, async (req, res) => {
  try {
    const todos = await database.all(`
      SELECT 
        t.id, 
        t.text, 
        t.status, 
        t.created_by,
        t.created_at, 
        t.updated_at,
        u.name as created_by_name
      FROM todos t
      LEFT JOIN users u ON t.created_by = u.id
      ORDER BY t.created_at DESC
    `);

    // 各TODOの担当者を取得
    for (let todo of todos) {
      const assignees = await database.all(`
        SELECT u.id, u.name, u.username
        FROM users u
        INNER JOIN todo_assignees ta ON u.id = ta.user_id
        WHERE ta.todo_id = ?
        ORDER BY u.name
      `, [todo.id]);
      
      todo.assignees = assignees;
    }

    res.json({
      message: 'TODO一覧を取得しました',
      todos
    });

  } catch (error) {
    console.error('TODO一覧取得エラー:', error.message);
    res.status(500).json({
      error: 'TODO一覧の取得に失敗しました',
      code: 'FETCH_TODOS_FAILED'
    });
  }
});

// TODO作成
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { text, assignees } = req.body;

    // バリデーション
    if (!text || text.trim().length === 0) {
      return res.status(400).json({
        error: 'TODO内容が必要です',
        code: 'MISSING_TEXT'
      });
    }

    if (!assignees || !Array.isArray(assignees) || assignees.length === 0) {
      return res.status(400).json({
        error: '担当者を最低1人選択してください',
        code: 'MISSING_ASSIGNEES'
      });
    }

    // TODO ID生成
    const todoId = require('crypto').randomUUID();

    // トランザクション開始
    await database.run('BEGIN TRANSACTION');

    try {
      // TODO作成
      await database.run(
        'INSERT INTO todos (id, text, status, created_by) VALUES (?, ?, ?, ?)',
        [todoId, text.trim(), 'TODO', req.user.id]
      );

      // 担当者を追加
      for (let assigneeId of assignees) {
        // ユーザーが存在するかチェック
        const user = await database.get(
          'SELECT id FROM users WHERE id = ?',
          [assigneeId]
        );

        if (!user) {
          throw new Error(`ユーザーID ${assigneeId} が存在しません`);
        }

        await database.run(
          'INSERT INTO todo_assignees (todo_id, user_id) VALUES (?, ?)',
          [todoId, assigneeId]
        );
      }

      await database.run('COMMIT');

      // 作成されたTODOを取得
      const createdTodo = await database.get(`
        SELECT 
          t.id, 
          t.text, 
          t.status, 
          t.created_by,
          t.created_at, 
          t.updated_at,
          u.name as created_by_name
        FROM todos t
        LEFT JOIN users u ON t.created_by = u.id
        WHERE t.id = ?
      `, [todoId]);

      // 担当者情報を取得
      const assigneesList = await database.all(`
        SELECT u.id, u.name, u.username
        FROM users u
        INNER JOIN todo_assignees ta ON u.id = ta.user_id
        WHERE ta.todo_id = ?
        ORDER BY u.name
      `, [todoId]);

      createdTodo.assignees = assigneesList;

      res.status(201).json({
        message: 'TODOを作成しました',
        todo: createdTodo
      });

    } catch (error) {
      await database.run('ROLLBACK');
      throw error;
    }

  } catch (error) {
    console.error('TODO作成エラー:', error.message);
    res.status(500).json({
      error: error.message || 'TODOの作成に失敗しました',
      code: 'CREATE_TODO_FAILED'
    });
  }
});

// TODOステータス更新
router.put('/:id/status', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // バリデーション
    if (!status) {
      return res.status(400).json({
        error: 'ステータスが必要です',
        code: 'MISSING_STATUS'
      });
    }

    const validStatuses = ['TODO', 'PROGRESS', 'DONE'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        error: `無効なステータスです。有効な値: ${validStatuses.join(', ')}`,
        code: 'INVALID_STATUS'
      });
    }

    // TODOが存在するかチェック
    const todo = await database.get('SELECT id FROM todos WHERE id = ?', [id]);
    if (!todo) {
      return res.status(404).json({
        error: 'TODOが見つかりません',
        code: 'TODO_NOT_FOUND'
      });
    }

    // ステータスを更新
    await database.run(
      'UPDATE todos SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [status, id]
    );

    // 更新されたTODOを取得
    const updatedTodo = await database.get(`
      SELECT 
        t.id, 
        t.text, 
        t.status, 
        t.created_by,
        t.created_at, 
        t.updated_at,
        u.name as created_by_name
      FROM todos t
      LEFT JOIN users u ON t.created_by = u.id
      WHERE t.id = ?
    `, [id]);

    // 担当者情報を取得
    const assignees = await database.all(`
      SELECT u.id, u.name, u.username
      FROM users u
      INNER JOIN todo_assignees ta ON u.id = ta.user_id
      WHERE ta.todo_id = ?
      ORDER BY u.name
    `, [id]);

    updatedTodo.assignees = assignees;

    res.json({
      message: 'TODOステータスを更新しました',
      todo: updatedTodo
    });

  } catch (error) {
    console.error('TODOステータス更新エラー:', error.message);
    res.status(500).json({
      error: 'TODOステータスの更新に失敗しました',
      code: 'UPDATE_TODO_STATUS_FAILED'
    });
  }
});

// TODO削除
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // TODOが存在するかチェック
    const todo = await database.get(
      'SELECT id, created_by FROM todos WHERE id = ?', 
      [id]
    );
    
    if (!todo) {
      return res.status(404).json({
        error: 'TODOが見つかりません',
        code: 'TODO_NOT_FOUND'
      });
    }

    // 作成者のみ削除可能
    if (todo.created_by !== req.user.id) {
      return res.status(403).json({
        error: 'このTODOを削除する権限がありません',
        code: 'DELETE_PERMISSION_DENIED'
      });
    }

    // トランザクション開始
    await database.run('BEGIN TRANSACTION');

    try {
      // 担当者の関連付けを削除（外部キー制約により自動削除されるが明示的に実行）
      await database.run('DELETE FROM todo_assignees WHERE todo_id = ?', [id]);
      
      // TODOを削除
      await database.run('DELETE FROM todos WHERE id = ?', [id]);

      await database.run('COMMIT');

      res.json({
        message: 'TODOを削除しました',
        deletedId: id
      });

    } catch (error) {
      await database.run('ROLLBACK');
      throw error;
    }

  } catch (error) {
    console.error('TODO削除エラー:', error.message);
    res.status(500).json({
      error: 'TODOの削除に失敗しました',
      code: 'DELETE_TODO_FAILED'
    });
  }
});

// 特定TODO取得
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const todo = await database.get(`
      SELECT 
        t.id, 
        t.text, 
        t.status, 
        t.created_by,
        t.created_at, 
        t.updated_at,
        u.name as created_by_name
      FROM todos t
      LEFT JOIN users u ON t.created_by = u.id
      WHERE t.id = ?
    `, [id]);

    if (!todo) {
      return res.status(404).json({
        error: 'TODOが見つかりません',
        code: 'TODO_NOT_FOUND'
      });
    }

    // 担当者情報を取得
    const assignees = await database.all(`
      SELECT u.id, u.name, u.username
      FROM users u
      INNER JOIN todo_assignees ta ON u.id = ta.user_id
      WHERE ta.todo_id = ?
      ORDER BY u.name
    `, [id]);

    todo.assignees = assignees;

    res.json({
      message: 'TODOを取得しました',
      todo
    });

  } catch (error) {
    console.error('TODO取得エラー:', error.message);
    res.status(500).json({
      error: 'TODOの取得に失敗しました',
      code: 'FETCH_TODO_FAILED'
    });
  }
});

module.exports = router;