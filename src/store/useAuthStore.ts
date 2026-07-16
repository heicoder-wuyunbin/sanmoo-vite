import { create } from 'zustand';
import { getCurrentUser, setAuth, clearAuth } from '@/utils/auth';

interface AuthState {
  user: { username: string; isAdmin: boolean } | undefined;
  setAuthInfo: (
    accessToken: string,
    refreshToken: string,
    userInfo: { username: string; isAdmin: boolean }
  ) => void;
  clearAuthInfo: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: getCurrentUser(),
  setAuthInfo: (accessToken, refreshToken, userInfo) => {
    setAuth(accessToken, refreshToken, userInfo);
    set({ user: userInfo });
  },
  clearAuthInfo: () => {
    clearAuth();
    set({ user: undefined });
  },
}));
