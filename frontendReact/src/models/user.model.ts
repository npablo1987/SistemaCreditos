export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER',
}

export interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  username: string;
  phone: string;
  document_id: string;
  rut?: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserCreate {
  first_name: string;
  last_name: string;
  email: string;
  username: string;
  password: string;
  phone: string;
  document_id: string;
  role: UserRole;
  is_active?: boolean;
}

export interface UserUpdate {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  is_active?: boolean;
}

export interface ChangePassword {
  current_password: string;
  new_password: string;
}
