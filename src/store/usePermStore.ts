import { create } from 'zustand';
import { fetchUserPermissions } from '@/services/blog/permission-api';

interface PermState {
  permKeys: string[];
  permSet: Set<string>;
  isLoaded: boolean;
  loadPermissions: () => Promise<void>;
  clearPermissions: () => void;
  hasPerm: (permKey: string) => boolean;
  hasAnyPerm: (permKeys: string[]) => boolean;
  hasAllPerm: (permKeys: string[]) => boolean;
}

export const usePermStore = create<PermState>((set, get) => ({
  permKeys: [],
  permSet: new Set<string>(),
  isLoaded: false,

  loadPermissions: async () => {
    try {
      const res = await fetchUserPermissions();
      const keys = res.data.permKeys || [];
      set({
        permKeys: keys,
        permSet: new Set(keys),
        isLoaded: true,
      });
    } catch (e) {
      console.error('加载用户权限失败', e);
      set({ isLoaded: true });
    }
  },

  clearPermissions: () => {
    set({ permKeys: [], permSet: new Set(), isLoaded: false });
  },

  hasPerm: (permKey: string) => {
    const { permSet, isLoaded } = get();
    if (!isLoaded) return true;
    return permSet.has(permKey);
  },

  hasAnyPerm: (permKeys: string[]) => {
    const { permSet, isLoaded } = get();
    if (!isLoaded) return true;
    return permKeys.some((k) => permSet.has(k));
  },

  hasAllPerm: (permKeys: string[]) => {
    const { permSet, isLoaded } = get();
    if (!isLoaded) return true;
    return permKeys.every((k) => permSet.has(k));
  },
}));
