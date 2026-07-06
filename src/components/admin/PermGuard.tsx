import type { ReactNode } from 'react';
import { usePermStore } from '@/store/usePermStore';

interface PermGuardProps {
  permKey: string | string[];
  mode?: 'any' | 'all';
  children: ReactNode;
  fallback?: ReactNode;
}

export function PermGuard({ permKey, mode = 'any', children, fallback = null }: PermGuardProps) {
  const { hasPerm, hasAnyPerm, hasAllPerm, isLoaded } = usePermStore();

  if (!isLoaded) {
    return <>{fallback}</>;
  }

  let hasAccess = false;
  if (Array.isArray(permKey)) {
    hasAccess = mode === 'all' ? hasAllPerm(permKey) : hasAnyPerm(permKey);
  } else {
    hasAccess = hasPerm(permKey);
  }

  return hasAccess ? <>{children}</> : <>{fallback}</>;
}
