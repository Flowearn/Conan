'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function RedirectLegacyIndex() {
  const router = useRouter();
  const params = useParams();
  
  useEffect(() => {
    const { locale } = params;
    
    // Just redirect to the home page
    router.replace(`/${locale}`);
  }, [router, params]);
  
  // Show a loading state while redirecting
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      <span className="ml-3 text-gray-600 dark:text-gray-400">Redirecting to home page...</span>
    </div>
  );
} 