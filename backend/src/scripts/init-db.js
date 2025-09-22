const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, '../../database/todos.db');
const dbDir = path.dirname(dbPath);

// データベースディレクトリを作成
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('データベースの作成に失敗しました:', err.message);
    return;
  }
  console.log('SQLiteデータベースに接続しました。');
});

// テーブル作成
const createTables = () => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // ユーザーテーブル
      db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username VARCHAR(50) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        name VARCHAR(100) NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`, (err) => {
        if (err) {
          console.error('usersテーブル作成エラー:', err.message);
          reject(err);
        } else {
          console.log('usersテーブルを作成しました。');
        }
      });

      // TODOテーブル
      db.run(`CREATE TABLE IF NOT EXISTS todos (
        id VARCHAR(36) PRIMARY KEY,
        text TEXT NOT NULL,
        status VARCHAR(10) CHECK(status IN ('TODO', 'PROGRESS', 'DONE')) DEFAULT 'TODO',
        created_by INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES users(id)
      )`, (err) => {
        if (err) {
          console.error('todosテーブル作成エラー:', err.message);
          reject(err);
        } else {
          console.log('todosテーブルを作成しました。');
        }
      });

      // TODO担当者テーブル（多対多）
      db.run(`CREATE TABLE IF NOT EXISTS todo_assignees (
        todo_id VARCHAR(36),
        user_id INTEGER,
        PRIMARY KEY (todo_id, user_id),
        FOREIGN KEY (todo_id) REFERENCES todos(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )`, (err) => {
        if (err) {
          console.error('todo_assigneesテーブル作成エラー:', err.message);
          reject(err);
        } else {
          console.log('todo_assigneesテーブルを作成しました。');
          resolve();
        }
      });
    });
  });
};

// 初期データ挿入
const insertInitialData = async () => {
  const bcrypt = require('bcrypt');
  
  return new Promise((resolve, reject) => {
    db.serialize(async () => {
      try {
        // 既存ユーザーをチェック
        db.get("SELECT COUNT(*) as count FROM users", async (err, row) => {
          if (err) {
            console.error('ユーザー数確認エラー:', err.message);
            reject(err);
            return;
          }
          
          if (row.count === 0) {
            console.log('初期ユーザーデータを挿入します...');
            
            const users = [
              { username: 'yamada', password: 'password123', name: '山田太郎' },
              { username: 'sato', password: 'password123', name: '佐藤花子' },
              { username: 'suzuki', password: 'password123', name: '鈴木一郎' }
            ];
            
            let insertedCount = 0;
            
            for (const user of users) {
              const hashedPassword = await bcrypt.hash(user.password, 12);
              
              db.run(
                "INSERT INTO users (username, password_hash, name) VALUES (?, ?, ?)",
                [user.username, hashedPassword, user.name],
                function(err) {
                  if (err) {
                    console.error('ユーザー挿入エラー:', err.message);
                    reject(err);
                  } else {
                    console.log(`ユーザー ${user.name} (${user.username}) を作成しました。ID: ${this.lastID}`);
                    insertedCount++;
                    if (insertedCount === users.length) {
                      resolve();
                    }
                  }
                }
              );
            }
          } else {
            console.log('ユーザーデータは既に存在します。');
            resolve();
          }
        });
      } catch (error) {
        reject(error);
      }
    });
  });
};

// メイン実行
const main = async () => {
  try {
    await createTables();
    await insertInitialData();
    console.log('データベースの初期化が完了しました。');
  } catch (error) {
    console.error('データベース初期化エラー:', error);
  } finally {
    db.close((err) => {
      if (err) {
        console.error('データベース接続終了エラー:', err.message);
      } else {
        console.log('データベース接続を終了しました。');
      }
    });
  }
};

if (require.main === module) {
  main();
}

module.exports = { createTables, insertInitialData };