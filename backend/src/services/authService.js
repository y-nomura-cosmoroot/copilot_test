const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const database = require('../config/database');
require('dotenv').config();

class AuthService {
  
  static async login(username, password) {
    try {
      // ユーザーを取得
      const user = await database.get(
        'SELECT id, username, password_hash, name FROM users WHERE username = ?',
        [username]
      );

      if (!user) {
        throw new Error('ユーザーが見つかりません');
      }

      // パスワードを検証
      const isValid = await bcrypt.compare(password, user.password_hash);
      if (!isValid) {
        throw new Error('パスワードが正しくありません');
      }

      // JWTトークンを生成
      const token = jwt.sign(
        { 
          id: user.id, 
          username: user.username,
          name: user.name 
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
      );

      return {
        token,
        user: {
          id: user.id,
          username: user.username,
          name: user.name
        }
      };

    } catch (error) {
      throw error;
    }
  }

  static async register(username, password, name) {
    try {
      // ユーザーの重複チェック
      const existingUser = await database.get(
        'SELECT id FROM users WHERE username = ?',
        [username]
      );

      if (existingUser) {
        throw new Error('このユーザー名は既に使用されています');
      }

      // パスワードをハッシュ化
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // ユーザーを作成
      const result = await database.run(
        'INSERT INTO users (username, password_hash, name) VALUES (?, ?, ?)',
        [username, hashedPassword, name]
      );

      // 作成されたユーザーを取得
      const newUser = await database.get(
        'SELECT id, username, name FROM users WHERE id = ?',
        [result.lastID]
      );

      // JWTトークンを生成
      const token = jwt.sign(
        { 
          id: newUser.id, 
          username: newUser.username,
          name: newUser.name 
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
      );

      return {
        token,
        user: {
          id: newUser.id,
          username: newUser.username,
          name: newUser.name
        }
      };

    } catch (error) {
      throw error;
    }
  }

  static async refreshToken(oldToken) {
    try {
      // 古いトークンを検証（期限切れでも内容を取得）
      const decoded = jwt.verify(oldToken, process.env.JWT_SECRET, { ignoreExpiration: true });
      
      // ユーザーが存在するかチェック
      const user = await database.get(
        'SELECT id, username, name FROM users WHERE id = ?',
        [decoded.id]
      );

      if (!user) {
        throw new Error('ユーザーが見つかりません');
      }

      // 新しいトークンを生成
      const newToken = jwt.sign(
        { 
          id: user.id, 
          username: user.username,
          name: user.name 
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
      );

      return {
        token: newToken,
        user: {
          id: user.id,
          username: user.username,
          name: user.name
        }
      };

    } catch (error) {
      if (error.name === 'JsonWebTokenError') {
        throw new Error('無効なトークンです');
      }
      throw error;
    }
  }

  static validatePassword(password) {
    if (!password || password.length < 6) {
      throw new Error('パスワードは6文字以上である必要があります');
    }
    return true;
  }

  static validateUsername(username) {
    if (!username || username.length < 3) {
      throw new Error('ユーザー名は3文字以上である必要があります');
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      throw new Error('ユーザー名は英数字とアンダースコアのみ使用できます');
    }
    return true;
  }
}

module.exports = AuthService;