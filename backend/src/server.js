const express = require('express');
const path = require('path');
require('dotenv').config();

const database = require('./config/database');
const corsMiddleware = require('./middleware/cors');

// ルートインポート
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const todoRoutes = require('./routes/todos');

const app = express();
const PORT = process.env.PORT || 3001;

// ミドルウェア設定
app.use(corsMiddleware);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// リクエストログ
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// ルート設定
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/todos', todoRoutes);

// ヘルスチェック
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// 404エラーハンドラー
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'エンドポイントが見つかりません',
    path: req.originalUrl 
  });
});

// エラーハンドラー
app.use((err, req, res, next) => {
  console.error('エラー発生:', err);
  
  if (err.name === 'ValidationError') {
    return res.status(400).json({ 
      error: 'バリデーションエラー', 
      details: err.message 
    });
  }
  
  if (err.code === 'SQLITE_CONSTRAINT') {
    return res.status(400).json({ 
      error: 'データベース制約エラー', 
      details: 'データの整合性に問題があります' 
    });
  }

  res.status(500).json({ 
    error: 'サーバー内部エラー',
    ...(process.env.NODE_ENV === 'development' && { details: err.message })
  });
});

// サーバー起動
const startServer = async () => {
  try {
    // データベース接続
    await database.connect();
    
    // サーバー起動
    app.listen(PORT, () => {
      console.log(`\n🚀 サーバーが起動しました！`);
      console.log(`📍 http://localhost:${PORT}`);
      console.log(`🌍 環境: ${process.env.NODE_ENV || 'development'}`);
      console.log(`📊 ヘルスチェック: http://localhost:${PORT}/api/health\n`);
    });
  } catch (error) {
    console.error('サーバー起動エラー:', error);
    process.exit(1);
  }
};

// グレースフルシャットダウン
process.on('SIGTERM', async () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  await database.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received. Shutting down gracefully...');
  await database.close();
  process.exit(0);
});

if (require.main === module) {
  startServer();
}

module.exports = app;