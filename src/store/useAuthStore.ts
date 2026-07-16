import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Supervisor' | 'Viewer';
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      login: (user, token) => {
        // Also set a cookie so the Next.js middleware can read it for page requests
        document.cookie = `token=${token}; path=/; max-age=2592000; SameSite=Strict`;
        set({ user, token, isAuthenticated: true });
      },
      logout: () => {
        document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
        set({ user: null, token: null, isAuthenticated: false });
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);
