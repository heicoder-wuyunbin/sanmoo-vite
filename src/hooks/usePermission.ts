import { useEffect } from 'react';
import { usePermStore } from '@/store/usePermStore';
import { useAuthStore } from '@/store/useAuthStore';

export function usePermission() {
  const { user } = useAuthStore();
  const { isLoaded, loadPermissions, clearPermissions, hasPerm, hasAnyPerm, hasAllPerm, permKeys, permSet } =
    usePermStore();

  useEffect(() => {
    if (user && !isLoaded) {
      loadPermissions();
    }
    if (!user) {
      clearPermissions();
    }
  }, [user, isLoaded, loadPermissions, clearPermissions]);

  return {
    isLoaded,
    permKeys,
    permSet,
    hasPerm,
    hasAnyPerm,
    hasAllPerm,
    reload: loadPermissions,
  };
}
