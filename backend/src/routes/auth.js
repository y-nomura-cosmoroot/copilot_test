const express = require('express');
const AuthService = require('../services/authService');

const router = express.Router();

// ログイン
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // バリデーション
    if (!username || !password) {
      return res.status(400).json({
        error: 'ユーザー名とパスワードが必要です',
        code: 'MISSING_CREDENTIALS'
      });
    }

    const result = await AuthService.login(username, password);
    
    res.json({
      message: 'ログインに成功しました',
      ...result
    });

  } catch (error) {
    console.error('ログインエラー:', error.message);
    
    res.status(401).json({
      error: error.message,
      code: 'LOGIN_FAILED'
    });
  }
});

// ユーザー登録
router.post('/register', async (req, res) => {
  try {
    const { username, password, name } = req.body;

    // バリデーション
    if (!username || !password || !name) {
      return res.status(400).json({
        error: 'ユーザー名、パスワード、名前が必要です',
        code: 'MISSING_FIELDS'
      });
    }

    // 追加のバリデーション
    AuthService.validateUsername(username);
    AuthService.validatePassword(password);

    if (name.length < 1) {
      return res.status(400).json({
        error: '名前を入力してください',
        code: 'INVALID_NAME'
      });
    }

    const result = await AuthService.register(username, password, name);
    
    res.status(201).json({
      message: 'ユーザー登録に成功しました',
      ...result
    });

  } catch (error) {
    console.error('登録エラー:', error.message);
    
    res.status(400).json({
      error: error.message,
      code: 'REGISTRATION_FAILED'
    });
  }
});

// トークンリフレッシュ
router.post('/refresh', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        error: 'トークンが必要です',
        code: 'MISSING_TOKEN'
      });
    }

    const result = await AuthService.refreshToken(token);
    
    res.json({
      message: 'トークンを更新しました',
      ...result
    });

  } catch (error) {
    console.error('トークン更新エラー:', error.message);
    
    res.status(401).json({
      error: error.message,
      code: 'TOKEN_REFRESH_FAILED'
    });
  }
});

// トークン検証（開発・テスト用）
router.post('/verify', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(400).json({
        error: 'トークンが必要です',
        code: 'MISSING_TOKEN'
      });
    }

    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    res.json({
      message: 'トークンは有効です',
      user: decoded,
      expires: new Date(decoded.exp * 1000)
    });

  } catch (error) {
    console.error('トークン検証エラー:', error.message);
    
    res.status(401).json({
      error: 'トークンが無効です',
      code: 'INVALID_TOKEN'
    });
  }
});

module.exports = router;