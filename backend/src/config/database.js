const sqlite3 = require('sqlite3').verbose();
const path = require('path');
require('dotenv').config();

class Database {
  constructor() {
    this.db = null;
  }

  connect() {
    return new Promise((resolve, reject) => {
      const dbPath = path.resolve(process.env.DB_PATH || './database/todos.db');
      
      this.db = new sqlite3.Database(dbPath, (err) => {
        if (err) {
          console.error('データベース接続エラー:', err.message);
          reject(err);
        } else {
          console.log('SQLiteデータベースに接続しました。');
          resolve();
        }
      });
    });
  }

  getDatabase() {
    return this.db;
  }

  close() {
    return new Promise((resolve, reject) => {
      if (this.db) {
        this.db.close((err) => {
          if (err) {
            console.error('データベース接続終了エラー:', err.message);
            reject(err);
          } else {
            console.log('データベース接続を終了しました。');
            resolve();
          }
        });
      } else {
        resolve();
      }
    });
  }

  // プロミスベースのクエリヘルパー
  run(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ lastID: this.lastID, changes: this.changes });
        }
      });
    });
  }

  get(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  all(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }
}

// シングルトンインスタンス
const database = new Database();

module.exports = database;