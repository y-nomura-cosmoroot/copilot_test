const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const database = require('../config/database');

const router = express.Router();

// 全ユーザー一覧取得（担当者選択用）
router.get('/', authenticateToken, async (req, res) => {
  try {
    const users = await database.all(
      'SELECT id, username, name, created_at FROM users ORDER BY name'
    );

    res.json({
      message: 'ユーザー一覧を取得しました',
      users: users.map(user => ({
        id: user.id,
        name: user.name,
        username: user.username,
        created_at: user.created_at
      }))
    });

  } catch (error) {
    console.error('ユーザー一覧取得エラー:', error.message);
    res.status(500).json({
      error: 'ユーザー一覧の取得に失敗しました',
      code: 'FETCH_USERS_FAILED'
    });
  }
});

// 自分の情報取得
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await database.get(
      'SELECT id, username, name, created_at FROM users WHERE id = ?',
      [req.user.id]
    );

    if (!user) {
      return res.status(404).json({
        error: 'ユーザーが見つかりません',
        code: 'USER_NOT_FOUND'
      });
    }

    res.json({
      message: 'ユーザー情報を取得しました',
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        created_at: user.created_at
      }
    });

  } catch (error) {
    console.error('ユーザー情報取得エラー:', error.message);
    res.status(500).json({
      error: 'ユーザー情報の取得に失敗しました',
      code: 'FETCH_USER_FAILED'
    });
  }
});

// 特定ユーザーの情報取得
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    if (isNaN(parseInt(id))) {
      return res.status(400).json({
        error: '無効なユーザーIDです',
        code: 'INVALID_USER_ID'
      });
    }

    const user = await database.get(
      'SELECT id, username, name, created_at FROM users WHERE id = ?',
      [parseInt(id)]
    );

    if (!user) {
      return res.status(404).json({
        error: 'ユーザーが見つかりません',
        code: 'USER_NOT_FOUND'
      });
    }

    res.json({
      message: 'ユーザー情報を取得しました',
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        created_at: user.created_at
      }
    });

  } catch (error) {
    console.error('ユーザー情報取得エラー:', error.message);
    res.status(500).json({
      error: 'ユーザー情報の取得に失敗しました',
      code: 'FETCH_USER_FAILED'
    });
  }
});

// ユーザーの統計情報取得
router.get('/:id/stats', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    if (isNaN(parseInt(id))) {
      return res.status(400).json({
        error: '無効なユーザーIDです',
        code: 'INVALID_USER_ID'
      });
    }

    // ユーザーが存在するかチェック
    const user = await database.get(
      'SELECT id, name FROM users WHERE id = ?',
      [parseInt(id)]
    );

    if (!user) {
      return res.status(404).json({
        error: 'ユーザーが見つかりません',
        code: 'USER_NOT_FOUND'
      });
    }

    // 統計情報を取得
    const stats = await database.all(`
      SELECT 
        t.status,
        COUNT(*) as count
      FROM todos t
      INNER JOIN todo_assignees ta ON t.id = ta.todo_id
      WHERE ta.user_id = ?
      GROUP BY t.status
    `, [parseInt(id)]);

    // 作成したTODO数
    const createdCount = await database.get(
      'SELECT COUNT(*) as count FROM todos WHERE created_by = ?',
      [parseInt(id)]
    );

    const statusStats = {
      TODO: 0,
      PROGRESS: 0,
      DONE: 0
    };

    stats.forEach(stat => {
      statusStats[stat.status] = stat.count;
    });

    res.json({
      message: 'ユーザー統計情報を取得しました',
      user: {
        id: user.id,
        name: user.name
      },
      stats: {
        assigned: statusStats,
        created: createdCount.count,
        total_assigned: statusStats.TODO + statusStats.PROGRESS + statusStats.DONE
      }
    });

  } catch (error) {
    console.error('ユーザー統計取得エラー:', error.message);
    res.status(500).json({
      error: 'ユーザー統計情報の取得に失敗しました',
      code: 'FETCH_USER_STATS_FAILED'
    });
  }
});

module.exports = router;