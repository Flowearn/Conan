'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function Home() {
  const t = useTranslations('HomePage');
  const router = useRouter();
  const params = useParams();
  const [tokenAddress, setTokenAddress] = useState('');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (tokenAddress.trim()) {
      const locale = params.locale as string;
      router.push(`/${locale}/token/${tokenAddress.trim()}`);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-12rem)]">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800 dark:text-white">
          Conan Token Explorer
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="tokenAddress" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('tokenAddressLabel')}
            </label>
            <input
              type="text"
              id="tokenAddress"
              placeholder="0x..."
              value={tokenAddress}
              onChange={(e) => setTokenAddress(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {t('analyzeButtonText')}
          </button>
        </form>
        <div className="mt-8 text-sm text-gray-600 dark:text-gray-400 text-center">
          <p>{t('exampleLabel')}</p>
          <p className="mt-2 font-mono break-all">0x0df0587216a4a1bb7d5082fdc491d93d2dd4b413</p>
        </div>
      </div>
    </div>
  );
} 