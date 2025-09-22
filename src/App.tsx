/**
 * Todoアプリのメインコンポーネント
 * @author y-nomura-cosmoroot
 */
import React, { useEffect, useState } from 'react';
import TodoForm from './TodoForm';
import TodoList from './TodoList';
import Login from './components/Login';
import { apiService } from './services/api';
import { Todo, User, LoginCredentials, RegisterData, Assignee, TodoStatus } from './types';

/**
 * Todoアプリのメインコンポーネント
 */
const App: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [assignees, setAssignees] = useState<Assignee[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 初期化処理
  useEffect(() => {
    const initializeApp = async () => {
      try {
        setLoading(true);
        setError(null);

        // トークンが存在する場合、認証確認
        const token = localStorage.getItem('token');
        if (token) {
          try {
            console.log('トークン検証を開始します');
            const currentUser = await apiService.verifyToken();
            console.log('トークン検証成功:', currentUser);
            setUser(currentUser);

            // ユーザーデータと TODO データを並列取得
            const [usersData, todosData] = await Promise.all([
              apiService.getUsers(),
              apiService.getTodos()
            ]);

            if (Array.isArray(usersData)) {
              setAssignees(usersData.map(u => ({ id: u.id, name: u.name, username: u.username })));
            } else {
              console.error('Invalid users data format:', usersData);
              setAssignees([]);
            }

            if (Array.isArray(todosData)) {
              setTodos(todosData);
            } else {
              console.error('Invalid todos data format:', todosData);
              setTodos([]);
            }
          } catch (err) {
            console.error('Token verification failed:', err);
            console.log('トークンをクリアしてログアウト状態にします');
            apiService.clearToken();
            setUser(null);
            // フォールバック: JSONファイルから担当者データを取得
            await loadAssigneesFromJson();
          }
        } else {
          // ログインしていない場合、JSONファイルから担当者データを取得
          await loadAssigneesFromJson();
        }
      } catch (err) {
        console.error('App initialization failed:', err);
        setError('アプリケーションの初期化に失敗しました');
      } finally {
        setLoading(false);
      }
    };

    const loadAssigneesFromJson = async () => {
      try {
        const response = await fetch('/assignees.json');
        const data = await response.json();
        setAssignees(data);
      } catch (err) {
        console.error('Failed to fetch assignees from JSON:', err);
        setAssignees([]);
      }
    };

    initializeApp();
  }, []);

  /**
   * 新しいTodoを追加する
   * @param text Todo内容
   * @param assignees 担当者リスト
   */
  const addTodo = async (text: string, assignees: Assignee[]) => {
    if (!user) {
      // ログインしていない場合はローカルでのみ処理
      const newTodo: Todo = {
        id: crypto.randomUUID(),
        text,
        assignees,
        status: 'TODO',
      };
      setTodos([...todos, newTodo]);
      return;
    }

    try {
      setError(null);
      const assigneeIds = assignees.map(a => a.id);
      console.log('Creating TODO with assignee IDs:', assigneeIds);

      const newTodo = await apiService.createTodo(text, assigneeIds);
      console.log('Created TODO:', newTodo);

      // APIから返された担当者情報を使用するが、フロントエンドの情報で補完
      const todoWithAssignees = {
        ...newTodo,
        assignees: newTodo.assignees && newTodo.assignees.length > 0
          ? newTodo.assignees
          : assignees // APIから担当者情報が来ない場合はフロントエンドの情報を使用
      };

      console.log('Adding TODO to list:', todoWithAssignees);
      setTodos(prevTodos => {
        const updatedTodos = [...prevTodos, todoWithAssignees];
        console.log('Updated todos list:', updatedTodos);
        return updatedTodos;
      });
    } catch (err) {
      console.error('Failed to create todo:', err);
      setError('TODOの作成に失敗しました');
    }
  };

  /**
   * Todoのステータスを更新する
   * @param todoId TodoのID
   * @param newStatus 新しいステータス
   */
  const updateTodoStatus = async (todoId: string, newStatus: TodoStatus) => {
    if (!user) {
      // ログインしていない場合はローカルでのみ処理
      setTodos(todos.map(todo =>
        todo.id === todoId ? { ...todo, status: newStatus } : todo
      ));
      return;
    }

    try {
      setError(null);
      await apiService.updateTodoStatus(todoId, newStatus);
      setTodos(todos.map(todo =>
        todo.id === todoId ? { ...todo, status: newStatus } : todo
      ));
    } catch (err) {
      console.error('Failed to update todo status:', err);
      setError('TODOのステータス更新に失敗しました');
    }
  };

  /**
   * ログイン処理
   */
  const handleLogin = async (credentials: LoginCredentials) => {
    try {
      setAuthLoading(true);
      setError(null);

      const authUser = await apiService.login(credentials);
      setUser(authUser.user);

      // ログイン後にデータを再取得
      const [usersData, todosData] = await Promise.all([
        apiService.getUsers(),
        apiService.getTodos()
      ]);

      if (Array.isArray(usersData)) {
        setAssignees(usersData.map(u => ({ id: u.id, name: u.name, username: u.username })));
      } else {
        console.error('Invalid users data format:', usersData);
        setAssignees([]);
      }

      if (Array.isArray(todosData)) {
        setTodos(todosData);
      } else {
        console.error('Invalid todos data format:', todosData);
        setTodos([]);
      }
    } catch (err: any) {
      console.error('Login failed:', err);
      setError(err.message || 'ログインに失敗しました');
    } finally {
      setAuthLoading(false);
    }
  };

  /**
   * ユーザー登録処理
   */
  const handleRegister = async (data: RegisterData) => {
    try {
      setAuthLoading(true);
      setError(null);

      const authUser = await apiService.register(data);
      setUser(authUser.user);

      // 登録後にデータを再取得
      const [usersData, todosData] = await Promise.all([
        apiService.getUsers(),
        apiService.getTodos()
      ]);

      if (Array.isArray(usersData)) {
        setAssignees(usersData.map(u => ({ id: u.id, name: u.name, username: u.username })));
      } else {
        console.error('Invalid users data format:', usersData);
        setAssignees([]);
      }

      if (Array.isArray(todosData)) {
        setTodos(todosData);
      } else {
        console.error('Invalid todos data format:', todosData);
        setTodos([]);
      }
    } catch (err: any) {
      console.error('Registration failed:', err);
      setError(err.message || 'ユーザー登録に失敗しました');
    } finally {
      setAuthLoading(false);
    }
  };

  /**
   * ログアウト処理
   */
  const handleLogout = () => {
    apiService.clearToken();
    setUser(null);
    setTodos([]);
    // JSONから担当者データを再取得
    fetch('/assignees.json')
      .then((res) => res.json())
      .then((data) => setAssignees(data))
      .catch((err) => {
        console.error('Failed to fetch assignees:', err);
        setAssignees([]);
      });
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '1.2rem'
      }}>
        読み込み中...
      </div>
    );
  }

  if (!user) {
    return (
      <Login
        onLogin={handleLogin}
        onRegister={handleRegister}
        loading={authLoading}
        error={error}
      />
    );
  }

  return (
    <div style={{ maxWidth: 1200, margin: '40px auto', padding: 20, background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px #eee' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>Todoアプリ（カンバン方式）</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span>ようこそ、{user.name}さん</span>
          <button
            onClick={handleLogout}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#dc3545',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            ログアウト
          </button>
        </div>
      </div>

      {error && (
        <div style={{
          background: '#fee',
          color: '#c33',
          padding: '0.75rem',
          borderRadius: '4px',
          marginBottom: '1rem',
          border: '1px solid #fcc'
        }}>
          {error}
        </div>
      )}

      <TodoForm assignees={assignees} onAdd={addTodo} />
      <TodoList todos={todos} onStatusChange={updateTodoStatus} />
    </div>
  );
};

export default App;
