# copilot_test

## プロジェクトのタイトル

React + TypeScript 担当者選択付きTodoアプリ

## プロジェクトの説明

Google標準コーディング基準を参考にした、学習用のシンプルなTodoアプリです。担当者はJSONファイルから選択できます。バックエンド未実装。

## 目次

- インストール・実行方法
- 使用方法
- ファイル構成
- クレジット
- バッジ
- APIエンドポイント一覧
- 注意点・備考

## インストールおよび実行方法

1. 必要なパッケージをインストール

   ```sh
   npm install
   ```

2. 開発サーバーを起動

   ```sh
   npm start
   ```

3. ブラウザで `http://localhost:3000` を開く

## プロジェクトの使用方法

1. Todo内容を入力
2. 担当者を選択
3. 「追加」ボタンでTodoを登録
4. 登録済みTodoは一覧で確認可能

## クレジット

- 開発: GitHub Copilot
- コーディング基準: `.github/copilot-instructions.md`（Google標準ガイドライン参考）

## バッジ

[![npm version](https://badge.fury.io/js/react.svg)](https://www.npmjs.com/package/react)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-blue)](https://www.typescriptlang.org/)

## APIのエンドポイント一覧

- `/assignees.json` : 担当者一覧（GETのみ、public配下の静的ファイル）

## ファイル構成

```text
├─ public
│  ├─ index.html
│  └─ assignees.json
├─ src
│  ├─ App.tsx
│  ├─ TodoForm.tsx
│  ├─ TodoList.tsx
│  └─ index.tsx
├─ .github
│  └─ copilot-instructions.md
├─ package.json
├─ tsconfig.json
├─ webpack.config.js
└─ README.md
```

## 注意点や備考

- 本アプリは学習用です。セキュリティやパフォーマンスは最小限の考慮です。
- 担当者データは `public/assignees.json` で管理してください。
- コーディング基準は `.github/copilot-instructions.md` を参照。
- バックエンドは不要ですが、API拡張は容易です。
