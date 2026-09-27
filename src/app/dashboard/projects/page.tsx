'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardProjectsRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.push('/dashboard');
  }, [router]);

  return (
    <div className="min-h-screen bg-[#F4F5F7] flex items-center justify-center font-mono text-xs text-slate-500">
      Redirecting to dashboard...
    </div>
  );
}
