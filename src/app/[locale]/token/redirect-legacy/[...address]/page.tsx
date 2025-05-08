'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function LegacyTokenPageRedirect() {
  const router = useRouter();
  const params = useParams();
  
  useEffect(() => {
    const { locale, address } = params;
    
    // 获取地址 - 由于使用了catch-all路由，address可能是一个数组
    const addressValue = Array.isArray(address) ? address.join('/') : address;
    
    // Default to Solana since we've updated the default chain
    const chain = 'solana';
    
    console.log(`Redirecting legacy route to new format: /${locale}/token/${chain}/${addressValue}`);
    
    // Redirect to the new route structure
    router.replace(`/${locale}/token/${chain}/${addressValue}`);
  }, [router, params]);
  
  // Show a loading state while redirecting
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      <span className="ml-3 text-gray-600 dark:text-gray-400">Redirecting to new format...</span>
    </div>
  );
} 