import { create } from 'zustand';
import { fetchUserPermissions, fetchUserMenus } from '@/services/blog/permission-api';

interface MenuItem {
  id: number;
  permKey: string;
  name: string;
  module: string;
  frontPath: string;
  icon: string;
  sortOrder: number;
}

interface PermState {
  permKeys: string[];
  permSet: Set<string>;
  menus: MenuItem[];
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
  menus: [],
  isLoaded: false,

  loadPermissions: async () => {
    try {
      const [permRes, menuRes] = await Promise.all([
        fetchUserPermissions(),
        fetchUserMenus(),
      ]);
      const keys = permRes.data.permKeys || [];
      const menus = menuRes.data.menus || [];
      set({
        permKeys: keys,
        permSet: new Set(keys),
        menus,
        isLoaded: true,
      });
    } catch (e) {
      console.error('加载用户权限失败', e);
      set({ isLoaded: true });
    }
  },

  clearPermissions: () => {
    set({ permKeys: [], permSet: new Set(), menus: [], isLoaded: false });
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
