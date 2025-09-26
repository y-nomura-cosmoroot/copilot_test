export interface Assignee {
  id: number;
  name: string;
  username?: string;
}

export type TodoStatus = 'TODO' | 'PROGRESS' | 'DONE';

export interface Todo {
  id: string;
  text: string;
  assignees: Assignee[];
  status: TodoStatus;
  created_by?: number;
  created_at?: string;
  updated_at?: string;
}

export interface User {
  id: number;
  username: string;
  name: string;
  created_at?: string;
}

export interface AuthUser {
  user: User;
  token: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  password: string;
  name: string;
}