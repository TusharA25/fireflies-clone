'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from './auth-provider';

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) router.replace(`/login?next=${encodeURIComponent(pathname)}`);
  }, [isLoading, pathname, router, user]);

  if (isLoading || !user) {
    return <div className="min-h-screen bg-zinc-950 text-zinc-400 grid place-items-center text-sm">Loading workspace…</div>;
  }
  return <>{children}</>;
}
