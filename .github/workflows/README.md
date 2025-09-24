# GitHub Workflows

このディレクトリには以下のGitHubワークフローが含まれています：

## claude-code-review.yml
ClaudeCode自動レビューワークフロー

### 概要
プルリクエストが開かれた際に、JavaScript/TypeScriptファイルの変更を自動で検出し、Claude AIによるコードレビューを実行します。

### トリガー条件
- プルリクエストが開かれた時（`pull_request: types: [opened]`）

### 機能
1. **ファイル変更検出**: PRで変更されたJS/TSファイル（.js, .jsx, .ts, .tsx）のみを抽出
2. **Claude AIレビュー**: 検出されたファイルに対してClaude AIが以下の観点でレビューを実行
   - バグや潜在的な問題
   - Reactのベストプラクティス
   - TypeScriptの型安全性
   - コードの可読性
3. **自動コメント投稿**: レビュー結果をPRにコメントとして自動投稿

### 必要な設定
ワークフローを有効にするには、リポジトリの Secrets に以下を設定してください：
- `CLAUDE_CODE_OAUTH_TOKEN`: Claude Code Action用のOAuthトークン

### 権限
- `pull-requests: write` - PRにコメントを投稿するため
- `contents: read` - コードを読み取るため

## pr-build-check.yml
ビルドチェックワークフロー

### 概要
コードがプッシュされた際に、プロジェクトのビルドが成功することを確認します。

### トリガー条件
- コードがプッシュされた時（`push`）

### 機能
1. Node.js環境のセットアップ
2. 依存関係のインストール
3. プロジェクトのビルド実行