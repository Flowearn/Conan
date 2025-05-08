'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';

export default function Home() {
  const t = useTranslations('HomePage');
  const router = useRouter();
  const params = useParams();
  const [tokenAddress, setTokenAddress] = useState('');
  const [selectedChain, setSelectedChain] = useState<'solana' | 'bsc'>('solana');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (tokenAddress.trim()) {
      const locale = params.locale as string;
      router.push(`/${locale}/token/${selectedChain}/${tokenAddress.trim()}`);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-12rem)]">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800 dark:text-white">
          Conan Meme 
        </h1>
        
        {/* Chain Selector */}
        <div className="mb-4">
          <div className="flex gap-4 justify-center">
            {/* Solana 按钮 */}
            <button
              type="button"
              className={`flex items-center px-3 py-2 rounded border transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500
                ${selectedChain === 'solana' ? 'border-blue-500 bg-gray-100 dark:bg-gray-700' : 'border-transparent bg-white dark:bg-gray-800 opacity-70 hover:opacity-100'}`}
              onClick={() => setSelectedChain('solana')}
              aria-pressed={selectedChain === 'solana'}
            >
              <Image src="/SOLlogo.svg" alt="Solana" width={24} height={24} className="mr-2" unoptimized={true} />
              <span className="font-semibold">Solana</span>
            </button>
            {/* BSC 按钮 */}
            <button
              type="button"
              className={`flex items-center px-3 py-2 rounded border transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500
                ${selectedChain === 'bsc' ? 'border-blue-500 bg-gray-100 dark:bg-gray-700' : 'border-transparent bg-white dark:bg-gray-800 opacity-70 hover:opacity-100'}`}
              onClick={() => setSelectedChain('bsc')}
              aria-pressed={selectedChain === 'bsc'}
            >
              <Image src="/BSClogo.svg" alt="BSC" width={24} height={24} className="mr-2" unoptimized={true} />
              <span className="font-semibold">BSC</span>
            </button>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="tokenAddress" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('tokenAddressLabel')}
            </label>
            <input
              type="text"
              id="tokenAddress"
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
      </div>
    </div>
  );
} 