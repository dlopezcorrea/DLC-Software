import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
}

interface AuthState {
  accessToken: string | null;
  user: AuthUser | null;
  orgId: string | null;
  setAuth: (token: string, user: AuthUser, orgId: string) => void;
  setAccessToken: (token: string) => void;
  clearAuth: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      user: null,
      orgId: null,

      setAuth: (accessToken, user, orgId) => set({ accessToken, user, orgId }),
      setAccessToken: (accessToken) => set({ accessToken }),
      clearAuth: () => set({ accessToken: null, user: null, orgId: null }),
      isAuthenticated: () => !!get().accessToken && !!get().user,
    }),
    {
      name: 'dlc-crm-auth',
      partialize: (state) => ({ user: state.user, orgId: state.orgId }),
    }
  )
);
