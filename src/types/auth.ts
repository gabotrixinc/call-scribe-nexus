
export type UserRole = 'admin' | 'manager' | 'agent' | 'viewer';

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: UserRole;
  avatarUrl?: string | null;
  createdAt: string;
}

export interface UserWithRole extends User {
  status?: 'active' | 'inactive' | 'pending';
  lastSignIn?: string;
}
