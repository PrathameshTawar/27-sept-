'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function ProjectIdRedirect() {
  const router = useRouter();
  const params = useParams();

  useEffect(() => {
    if (params.id) {
      router.push(`/dashboard/projects/${params.id}`);
    } else {
      router.push('/dashboard');
    }
  }, [router, params]);

  return (
    <div className="min-h-screen bg-[#F4F5F7] flex items-center justify-center font-mono text-xs text-slate-500">
      Redirecting to project workspace...
    </div>
  );
}
