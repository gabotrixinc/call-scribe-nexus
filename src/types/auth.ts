
export type UserRole = 'admin' | 'manager' | 'agent' | 'viewer';

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: UserRole;
  avatarUrl?: string;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  session: any | null;
  isLoading: boolean;
}

export interface UserWithRole {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: UserRole;
  avatarUrl?: string;
  createdAt: string;
  lastSignIn?: string;
  status: 'active' | 'inactive' | 'pending';
}
