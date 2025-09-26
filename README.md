# TODO管理アプリ（ログイン認証付き）

JWT認証機能とデータベース連携を備えたフルスタックTODO管理アプリケーション

## 📋 プロジェクト概要

React + TypeScript（フロントエンド）とExpress + SQLite（バックエンド）で構築された、企業レベルのセキュリティを持つTODO管理システムです。

### 🎯 主な機能

- **🔐 ユーザー認証** - JWT認証によるセキュアなログインシステム
- **📝 TODO管理** - カンバン方式でのタスク管理
- **👥 担当者管理** - 複数ユーザーへのタスク割り当て
- **🔔 ブラウザ通知** - 担当者への新規TODO通知
- **💾 データベース保存** - SQLiteによる永続化データ管理

## 🏗️ システム構成

```
┌─────────────────┐    HTTPS    ┌─────────────────┐
│   フロントエンド   │ ◄────────► │   バックエンド    │
│   (React)       │   JWT認証   │   (Express)     │
│                 │             │                 │
│ ・ログイン画面    │             │ ・認証API        │
│ ・TODOカンバン   │             │ ・TODO API      │
│ ・ブラウザ通知    │             │ ・JWT検証       │
└─────────────────┘             └─────────────────┘
                                          │
                                          ▼
                                ┌─────────────────┐
                                │   SQLite DB     │
                                │                 │
                                │ ・users         │
                                │ ・todos         │
                                │ ・todo_assignees│
                                └─────────────────┘
```

## 🚀 セットアップ

### 1. バックエンド起動

```bash
# バックエンドディレクトリに移動
cd backend

# 依存関係インストール
npm install

# データベース初期化
npm run init-db

# サーバー起動（開発モード）
npm run dev
```

バックエンドは `http://localhost:3001` で起動します。

### 2. フロントエンド起動

```bash
# ルートディレクトリで実行
npm install
npm start
```

フロントエンドは `http://localhost:3000` で起動します。

## 🔑 初期ログインユーザー

| ユーザー名 | パスワード | 表示名 |
|-----------|----------|--------|
| yamada | password123 | 山田太郎 |
| sato | password123 | 佐藤花子 |
| suzuki | password123 | 鈴木一郎 |

## 📊 API仕様

### 認証系API
- `POST /api/auth/login` - ログイン
- `POST /api/auth/register` - ユーザー登録
- `POST /api/auth/refresh` - トークンリフレッシュ
- `POST /api/auth/verify` - トークン検証

### ユーザー系API（JWT認証必須）
- `GET /api/users` - ユーザー一覧取得
- `GET /api/users/me` - 自分の情報取得
- `GET /api/users/:id` - 特定ユーザー情報取得
- `GET /api/users/:id/stats` - ユーザー統計情報取得

### TODO系API（JWT認証必須）
- `GET /api/todos` - TODO一覧取得
- `POST /api/todos` - TODO作成
- `GET /api/todos/:id` - 特定TODO取得
- `PUT /api/todos/:id/status` - TODOステータス更新
- `DELETE /api/todos/:id` - TODO削除（作成者のみ）

### その他
- `GET /api/health` - ヘルスチェック

## 🗄️ データベース設計

### テーブル構成

```sql
-- ユーザーテーブル
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- TODOテーブル
CREATE TABLE todos (
    id VARCHAR(36) PRIMARY KEY,
    text TEXT NOT NULL,
    status VARCHAR(10) CHECK(status IN ('TODO', 'PROGRESS', 'DONE')) DEFAULT 'TODO',
    created_by INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- TODO担当者テーブル（多対多）
CREATE TABLE todo_assignees (
    todo_id VARCHAR(36),
    user_id INTEGER,
    PRIMARY KEY (todo_id, user_id),
    FOREIGN KEY (todo_id) REFERENCES todos(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

## 🛠️ 技術スタック

### フロントエンド
- **React 18** - UIライブラリ
- **TypeScript** - 型安全性
- **Webpack 5** - バンドラー
- **ts-loader** - TypeScript コンパイラ

### バックエンド
- **Node.js + Express** - サーバーサイド
- **SQLite3** - データベース
- **JWT** - 認証トークン
- **bcrypt** - パスワードハッシュ化
- **CORS** - クロスオリジン対応
- **dotenv** - 環境変数管理

## 📁 プロジェクト構成

```
copilot_test/
├── src/                    # フロントエンドソース
│   ├── App.tsx
│   ├── TodoForm.tsx
│   ├── TodoList.tsx
│   └── index.tsx
├── backend/                # バックエンド
│   ├── src/
│   │   ├── config/         # 設定ファイル
│   │   ├── middleware/     # ミドルウェア
│   │   ├── models/         # データモデル
│   │   ├── routes/         # APIルート
│   │   ├── services/       # ビジネスロジック
│   │   ├── scripts/        # ユーティリティ
│   │   └── server.js       # サーバーエントリーポイント
│   ├── database/           # SQLiteファイル
│   └── package.json
├── public/
│   ├── index.html
│   └── assignees.json
├── package.json
└── README.md
```

## 🔒 セキュリティ仕様

- **パスワードハッシュ化** - bcryptで12ラウンド
- **JWT認証** - 24時間有効期限
- **CORS設定** - 開発・本番環境対応
- **入力検証** - 全APIエンドポイントでバリデーション
- **認可制御** - TODO削除は作成者のみ可能

## 🔔 通知機能仕様

- **ブラウザ通知** - 担当者への新規TODO通知
- **権限要求** - 初回アクセス時に通知許可を要求
- **対象判定** - ログインユーザーが担当者に含まれる場合のみ通知

## 🚧 実装状況

### ✅ 完了済み
- [x] バックエンドAPI実装
- [x] データベース設計・初期化
- [x] JWT認証システム
- [x] ユーザー管理機能
- [x] TODO CRUD操作
- [x] セキュリティ対応

### 🔄 実装予定
- [x] フロントエンド認証機能
- [x] ログイン画面UI
- [x] 既存TodoList→API連携
- [ ] ブラウザ通知機能
- [ ] リアルタイム通知（WebSocket検討）

## 📝 開発メモ

- 本プロジェクトは学習・デモ目的で構築
- 本番環境では`JWT_SECRET`の変更必須
- SQLiteファイルは`backend/database/todos.db`に保存
- 開発時は`npm run dev`でホットリロード対応

## 🤝 クレジット

- **設計・開発**: Claude Code
- **コーディング基準**: Google Style Guide準拠
- **セキュリティ設計**: 企業レベルのベストプラクティス適用