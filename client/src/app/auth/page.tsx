'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AuthRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/auth/citizen');
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
      <div className="flex flex-col items-center space-y-4">
        <div className="w-10 h-10 rounded-xl bg-indigo-650 animate-bounce flex items-center justify-center">
          <div className="w-4 h-4 rounded-full bg-white animate-ping" />
        </div>
        <p className="text-sm font-semibold">Redirecting to Citizen Portal...</p>
      </div>
    </div>
  );
}
