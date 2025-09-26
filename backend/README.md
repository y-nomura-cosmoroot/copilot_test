# TODO Backend API

JWT認証機能付きのTODO管理APIサーバー

## 🚀 セットアップ

### 1. 依存関係のインストール
```bash
cd backend
npm install
```

### 2. 環境変数の設定
```bash
# .envファイルをコピー
cp .env.example .env
```

### 3. データベース初期化
```bash
npm run init-db
```

### 4. サーバー起動
```bash
# 開発モード（ホットリロード）
npm run dev

# 本番モード
npm start
```

## 📊 API エンドポイント

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

## 💡 使用例

### ログイン
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"yamada","password":"password123"}'
```

### TODO作成
```bash
curl -X POST http://localhost:3001/api/todos \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"text":"新しいタスク","assignees":[1,2]}'
```

## 🗄️ データベース

SQLiteを使用。テーブル構成：

- `users` - ユーザー情報
- `todos` - TODO情報  
- `todo_assignees` - TODO担当者関連付け（多対多）

## 🔐 初期ユーザー

データベース初期化時に以下のユーザーが作成されます：

| ユーザー名 | パスワード | 表示名 |
|-----------|----------|--------|
| yamada | password123 | 山田太郎 |
| sato | password123 | 佐藤花子 |
| suzuki | password123 | 鈴木一郎 |

## 🛠️ 技術スタック

- Node.js + Express
- SQLite3
- JWT認証
- bcrypt（パスワードハッシュ化）
- CORS対応

## 📝 注意事項

- JWTトークンは24時間で期限切れ
- 本番環境では`.env`の`JWT_SECRET`を必ず変更してください
- TODOの削除は作成者のみ可能
- 全APIでCORS対応済み