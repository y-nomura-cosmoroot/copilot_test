---
applyTo: "**"
---
# コーディング基準

## 概要

このドキュメントは、品質向上を目的として、Googleの標準的なコーディング基準を参考に作成されています。
GitHub Copilotを使用する際の開発ガイドラインとして活用してください。

## 共通原則

### 1. 読みやすさを重視する
- コードは書く時間よりも読む時間の方が長い
- 明確で理解しやすいコードを心がける
- 適切なコメントを追加する

### 2. 一貫性を保つ
- チーム全体で同じスタイルを使用する
- 既存のコードスタイルに合わせる

### 3. シンプルさを保つ
- 複雑な実装よりもシンプルな実装を選ぶ
- 必要以上に抽象化しない

## 言語別ガイドライン

### Python

#### スタイル
- [PEP 8](https://peps.python.org/pep-0008/) に準拠
- インデントは4スペース
- 行の長さは79文字以内
- 関数名と変数名は `snake_case`
- クラス名は `PascalCase`
- 定数は `UPPER_CASE`

#### 例
```python
def calculate_total_price(items: List[Item]) -> float:
    """商品リストの合計価格を計算する。
    
    Args:
        items: 商品のリスト
        
    Returns:
        合計価格
    """
    total = 0.0
    for item in items:
        total += item.price
    return total
```

#### docstring
- 関数とクラスには必ずdocstringを追加
- Google形式のdocstringを使用
- 日本語で記述する

### JavaScript/TypeScript

#### スタイル
- [Google JavaScript Style Guide](https://google.github.io/styleguide/jsguide.html) に準拠
- インデントは2スペース
- セミコロンを使用
- 関数名と変数名は `camelCase`
- クラス名は `PascalCase`
- 定数は `UPPER_CASE`

#### 例
```javascript
/**
 * 商品リストの合計価格を計算する
 * @param {Array<Object>} items - 商品のリスト
 * @returns {number} 合計価格
 */
function calculateTotalPrice(items) {
  let total = 0;
  for (const item of items) {
    total += item.price;
  }
  return total;
}
```

#### TypeScript固有
- 型注釈を適切に使用
- interfaceを活用
- strictモードを有効にする

### Java

#### スタイル
- [Google Java Style Guide](https://google.github.io/styleguide/javaguide.html) に準拠
- インデントは2スペース
- 行の長さは100文字以内
- クラス名は `PascalCase`
- メソッド名と変数名は `camelCase`
- 定数は `UPPER_CASE`

#### 例
```java
/**
 * 商品リストの合計価格を計算する
 * @param items 商品のリスト
 * @return 合計価格
 */
public double calculateTotalPrice(List<Item> items) {
  double total = 0.0;
  for (Item item : items) {
    total += item.getPrice();
  }
  return total;
}
```

### C++

#### スタイル
- [Google C++ Style Guide](https://google.github.io/styleguide/cppguide.html) に準拠
- インデントは2スペース
- 関数名は `PascalCase`
- 変数名は `snake_case`
- 定数は `kConstantName`

#### 例
```cpp
/**
 * 商品リストの合計価格を計算する
 * @param items 商品のリスト
 * @return 合計価格
 */
double CalculateTotalPrice(const std::vector<Item>& items) {
  double total = 0.0;
  for (const auto& item : items) {
    total += item.price();
  }
  return total;
}
```

### Go

#### スタイル
- [Effective Go](https://go.dev/doc/effective_go) に準拠
- `go fmt` を使用
- パッケージ名は小文字
- 関数名と変数名は `camelCase`（public関数は `PascalCase`）

#### 例
```go
// CalculateTotalPrice は商品リストの合計価格を計算する
func CalculateTotalPrice(items []Item) float64 {
    var total float64
    for _, item := range items {
        total += item.Price
    }
    return total
}
```

## コメントガイドライン

### 1. 日本語でコメントを書く
- チームメンバーが理解しやすい日本語を使用
- 英語の技術用語は適切に使用

### 2. コメントの種類
- **機能コメント**: 関数やクラスの目的を説明
- **実装コメント**: 複雑なロジックの説明
- **TODOコメント**: 将来の改善点

### 3. コメントの例
```python
# TODO: パフォーマンスを改善するためにキャッシュを実装する
def expensive_operation(data):
    # データの前処理を行う
    # 複雑な計算ロジックのため、ステップごとに説明
    processed_data = preprocess(data)
    result = complex_calculation(processed_data)
    return result
```

## エラーハンドリング

### 1. 適切な例外処理
- 具体的な例外を捕捉する
- エラーメッセージは日本語で分かりやすく
- ログレベルを適切に設定

### 2. 例
```python
try:
    result = process_data(data)
except ValueError as e:
    logger.error(f"データ処理エラー: {e}")
    raise ProcessingError("データの形式が不正です")
except Exception as e:
    logger.error(f"予期しないエラー: {e}")
    raise
```

## テストガイドライン

### 1. テストの原則
- 単体テストを必ず作成
- テストケース名は日本語で記述
- Given-When-Then パターンを使用

### 2. テストの例
```python
def test_合計価格計算_正常ケース():
    # Given: 商品リストを準備
    items = [
        Item("商品A", 100),
        Item("商品B", 200)
    ]
    
    # When: 合計価格を計算
    total = calculate_total_price(items)
    
    # Then: 正しい合計価格が返される
    assert total == 300
```

## Git コミットメッセージ

### 1. フォーマット
```
タイプ: 簡潔な説明

詳細な説明（必要に応じて）

関連するIssue番号
```

### 2. タイプ
- `feat`: 新機能
- `fix`: バグ修正
- `docs`: ドキュメント更新
- `style`: コードスタイル修正
- `refactor`: リファクタリング
- `test`: テスト追加/修正
- `chore`: その他の作業

### 3. 例
```
feat: 商品価格計算機能を追加

- 商品リストから合計価格を計算する機能を実装
- 税込み価格の計算にも対応
- 単体テストを追加

Fixes #123
```

## レビューガイドライン

### 1. レビューの視点
- 機能要件を満たしているか
- コードの品質と保守性
- パフォーマンスへの影響
- セキュリティ上の問題

### 2. レビューコメントの接頭辞
- `[must]`: 必須の修正
- `[imo]`: 提案・意見
- `[nits]`: 軽微な指摘
- `[ask]`: 質問
- `[fyi]`: 参考情報

### 3. レビューのマナー
- 建設的なフィードバックを心がける
- 具体的な改善案を提示する
- 相手を尊重したコミュニケーション

## パフォーマンス考慮事項

### 1. 共通原則
- 早期最適化を避ける
- 必要に応じてプロファイリングを実行
- アルゴリズムの計算量を考慮

### 2. 言語固有の考慮事項
- **Python**: リスト内包表記の活用
- **JavaScript**: 非同期処理の適切な使用
- **Java**: ガベージコレクションの考慮
- **C++**: メモリ管理の最適化

## セキュリティガイドライン

### 1. 基本原則
- 入力値の検証を必ず行う
- 機密情報をログに出力しない
- 適切な権限設定を行う

### 2. 実装例
```python
def validate_user_input(user_input: str) -> bool:
    """ユーザー入力を検証する"""
    if not user_input:
        return False
    
    # SQLインジェクション対策
    if any(char in user_input for char in ['<', '>', ';', '"', "'"]):
        return False
    
    return True
```

## このガイドラインの更新

このコーディング基準は、チームの成長とプロジェクトの進化に合わせて定期的に更新します。
改善提案がある場合は、Issueを作成するか、プルリクエストを提出してください。

## 参考資料

- [Google Style Guides](https://google.github.io/styleguide/)
- [PEP 8 -- Style Guide for Python Code](https://peps.python.org/pep-0008/)
- [Effective Go](https://go.dev/doc/effective_go)
- [Clean Code by Robert C. Martin](https://www.amazon.co.jp/dp/4048676881)