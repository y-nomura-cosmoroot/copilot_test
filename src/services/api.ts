import { Todo, User, AuthUser, LoginCredentials, RegisterData, TodoStatus } from '../types';

const API_BASE_URL = 'http://localhost:3001/api';

class ApiService {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('token');
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers,
      },
      ...options,
    };

    console.log(`API Request: ${options.method || 'GET'} ${url}`);
    console.log('Token:', this.token ? 'Present' : 'None');

    const response = await fetch(url, config);

    console.log(`API Response: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Network error' }));
      console.error('API Error:', error);
      throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('API Response Data:', data);
    return data;
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('token');
  }

  // Authentication
  async login(credentials: LoginCredentials): Promise<AuthUser> {
    const response = await this.request<AuthUser>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    this.setToken(response.token);
    return response;
  }

  async register(data: RegisterData): Promise<AuthUser> {
    const response = await this.request<AuthUser>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    this.setToken(response.token);
    return response;
  }

  async verifyToken(): Promise<User> {
    return this.request<User>('/auth/verify', {
      method: 'POST',
    });
  }

  // Users
  async getUsers(): Promise<User[]> {
    const response = await this.request<{ users: User[] }>('/users');
    return response.users;
  }

  async getCurrentUser(): Promise<User> {
    return this.request<User>('/users/me');
  }

  // Todos
  async getTodos(): Promise<Todo[]> {
    const response = await this.request<{ todos: Todo[] }>('/todos');
    return response.todos;
  }

  async createTodo(text: string, assigneeIds: number[]): Promise<Todo> {
    const response = await this.request<{ todo: Todo }>('/todos', {
      method: 'POST',
      body: JSON.stringify({ text, assignee_ids: assigneeIds }),
    });
    return response.todo;
  }

  async updateTodoStatus(todoId: string, status: TodoStatus): Promise<Todo> {
    return this.request<Todo>(`/todos/${todoId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  async deleteTodo(todoId: string): Promise<void> {
    await this.request(`/todos/${todoId}`, {
      method: 'DELETE',
    });
  }

  // Health check
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    return this.request<{ status: string; timestamp: string }>('/health');
  }
}

export const apiService = new ApiService();