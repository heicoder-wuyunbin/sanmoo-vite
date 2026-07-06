import { create } from 'zustand';
import { getCurrentUser, setAuth, clearAuth } from '@/utils/auth';
import { usePermStore } from './usePermStore';

interface AuthState {
  user: { username: string; roleName: string } | undefined;
  setAuthInfo: (
    accessToken: string,
    refreshToken: string,
    userInfo: { username: string; roleName: string }
  ) => void;
  clearAuthInfo: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: getCurrentUser(),
  setAuthInfo: (accessToken, refreshToken, userInfo) => {
    setAuth(accessToken, refreshToken, userInfo);
    usePermStore.getState().clearPermissions();
    set({ user: userInfo });
  },
  clearAuthInfo: () => {
    clearAuth();
    usePermStore.getState().clearPermissions();
    set({ user: undefined });
  },
}));
