'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import AIAnalysis from '@/components/analysis/AIAnalysis';
import HolderStats from '@/components/analysis/HolderStats';
import { useTranslations } from 'next-intl'; // 导入 next-intl 翻译 hook

interface OHLCVDataPoint {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface SupplyItem {
  supplyPercent: number;
  formatted: string;
  percentage?: number;
}

interface HolderChangeItem {
  value: number;
  formatted?: string;
  change: number;
  changePercent: number;
}

interface TokenData {
  tokenOverview?: {
    name: string;
    symbol: string;
    logoURI?: string;
    price: number;
    priceChange24h: number;
    priceFormatted: string;
    liquidityFormatted: string;
    marketCapFormatted: string;
    totalSupplyFormatted: string;
    fdvFormatted?: string;
    circulatingSupplyFormatted?: string;
    lastTradeTimeFormatted: string;
    marketCap?: number;
    circulatingSupply?: string | number;
  };
  ohlcv?: {
    '1d'?: Array<OHLCVDataPoint>;
    '4h'?: Array<OHLCVDataPoint>;
    '1h'?: Array<OHLCVDataPoint>;
    '10min'?: Array<OHLCVDataPoint>;
  };
  holderAnalysis?: { top10Percentage: string; concentrationRisk: string, totalHolders?: number };
  holderStats?: {
    totalHolders: string | number;
    holderSupply?: {
      [key: string]: SupplyItem | undefined;
      top10?: SupplyItem;
      top25?: SupplyItem;
      top50?: SupplyItem;
      top100?: SupplyItem;
    };
    holderChange?: {
      [key: string]: HolderChangeItem | undefined;
      '24h'?: HolderChangeItem;
      '7d'?: HolderChangeItem;
      '30d'?: HolderChangeItem;
    };
    holderDistribution?: Partial<Record<string, number>>;
  };
  top10Holders?: Array<{
    TokenHolderAddress: string;
    TokenHolderQuantity: string;
    TokenHolderQuantityFormatted: string;
    TokenHolderUsdValueFormatted: string;
  }>;
  topTraders?: Trader[];
  aiAnalysis?: {
    holderReport?: string;
    priceReport?: string;
    riskReport?: string;
    fundamentalReport?: string;
    communityReport?: string;
    tokenInsight?: string;
    technicalAnalysis?: string;
    maxCapReport?: string;
    entryExitReport?: string;
  };
  metadata?: {
    name: string;
    symbol: string;
    logo?: string;
    thumbnail?: string;
    security_score?: number;
    verified_contract?: boolean;
    possible_spam?: boolean;
    links?: Record<string, string>;
    circulating_supply?: string | number;
    market_cap_usd?: number;
  };
  tokenAnalytics?: Record<string, unknown>;
}

interface Trader {
  address: string;
  buy?: { count: number };
  sell?: { count: number };
  total?: { amountUSDFormatted: string };
  tags?: string[];
}

interface Params {
  address: string;
  locale: string;
}

// Add type for raw params
interface RawParams {
  address?: string;
  locale?: string;
}

export default function TokenPage() {
  // 初始化翻译 hook
  const t = useTranslations('TokenPage');
  
  const rawParams = useParams() as RawParams;
  const params: Params = {
    address: rawParams.address || '',
    locale: rawParams.locale || 'en'
  };
  const [tokenData, setTokenData] = useState<TokenData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [showAiAnalysis, setShowAiAnalysis] = useState<boolean>(false);
  const [isTradersExpanded, setIsTradersExpanded] = useState<boolean>(false);

  // 添加重试计数器
  const [connectionRetryCount, setConnectionRetryCount] = useState<number>(0);
  const maxRetries = 3;

  // 获取当前语言环境（用于 AI 分析）
  const locale = params.locale as string;

  // Helper function to get price change class
  const getPriceChangeClass = (change?: number | string | null): string => {
    if (!change) return '';
    const numericChange = typeof change === 'string' ? parseFloat(change) : change;
    return numericChange > 0 ? 'text-green-600 dark:text-green-400' : 
           numericChange < 0 ? 'text-red-600 dark:text-red-400' : 
           'text-gray-600 dark:text-gray-400';
  };

  // Helper function to format address
  const formatAddress = (address: string): string => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // 获取代币数据
  const handleFetchData = useCallback(async () => {
    if (!params.address) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // 使用环境变量中的API基础URL
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3023';
      const chain = 'bsc'; // 默认使用 bsc 链
      const url = `${baseUrl}/api/token-data/${chain}/${params.address}`;
      console.log('--- Debug: Fetching URL:', url);
      
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      console.log('--- Debug: 尝试解析 API 响应...');
      try {
        const result = await res.json();
        console.log('Backend Response Received in Frontend:', result);
        console.log('--- Debug: API Response Data (Parsed):', result);
        
        if (result?.success && result.data) {
          setTokenData(result.data as TokenData); // 只设置 result.data 部分
        } else {
          const errorMsg = result.errors?.[0]?.message || '未能获取有效的代币数据';
          console.error('--- Debug: API响应错误, success=false 或 data缺失:', errorMsg);
          setError(errorMsg);
          setTokenData(null); // 错误时设置为 null
        }
      } catch (parseError) {
        console.error('--- Debug: JSON解析错误:', parseError);
        setError('无法解析API响应');
        setTokenData(null);
        throw new Error('无法解析API响应');
      }
    } catch (error) {
      console.error('--- Debug: API请求错误:', error);
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      setError(`获取代币数据失败: ${errorMessage}`);
      setTokenData(null);
      
      // 如果是网络错误且未超过重试次数，则重试
      if (error instanceof Error && error.message.includes('Failed to fetch') && connectionRetryCount < maxRetries) {
        console.log(`--- Debug: 网络错误，将在3秒后进行第${connectionRetryCount + 1}次重试...`);
        setConnectionRetryCount(prev => prev + 1);
        setTimeout(() => {
          handleFetchData();
        }, 3000);
      }
    } finally {
      setLoading(false);
    }
  }, [params.address, connectionRetryCount, maxRetries]);

  // 处理 AI 分析请求
  const handleRequestAiAnalysis = useCallback(async () => {
    if (!params.address) return;
    
    setIsAiLoading(true);
    setAiError(null);
    
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3023';
      const chain = 'bsc';
      const aiUrl = `${baseUrl}/api/token-data/${chain}/${params.address}?analyze=true&lang=${locale}`;
      console.log(`尝试连接 AI 分析 API: ${aiUrl}`);
      
      const res = await fetch(aiUrl);
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const result = await res.json();
      if (result?.success && result.data?.aiAnalysis) {
        setTokenData(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            aiAnalysis: result.data.aiAnalysis
          };
        });
        setShowAiAnalysis(true);
      } else {
        throw new Error('AI分析结果无效或为空');
      }
    } catch (error) {
      console.error('AI分析请求失败:', error);
      setAiError(error instanceof Error ? error.message : '未知错误');
    } finally {
      setIsAiLoading(false);
    }
  }, [params.address, locale]);

  // 使用 useEffect 调用初始数据获取
  useEffect(() => {
    handleFetchData();
  }, [handleFetchData]);

  // 渲染主要内容
  return (
    <div className="space-y-6">
      {/* === Basic Info Card === */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 sm:p-6">
        {error && (
          <div className="mb-4 p-4 text-sm text-red-700 bg-red-100 dark:bg-red-900 dark:text-red-200 rounded-lg">
            {error}
          </div>
        )}
        <div className="flex items-center space-x-3 mb-4">
          {(tokenData?.tokenOverview?.logoURI || tokenData?.metadata?.thumbnail || tokenData?.metadata?.logo) && (
            <Image 
              src={tokenData?.tokenOverview?.logoURI || tokenData?.metadata?.thumbnail || tokenData?.metadata?.logo || '/images/default-token.png'}
              alt={`${tokenData?.tokenOverview?.name || tokenData?.metadata?.name || 'Token'} logo`} 
              className="rounded-full" 
              width={40}
              height={40}
            />
          )}
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {tokenData?.tokenOverview?.name || tokenData?.metadata?.name || 'Token'} ({tokenData?.tokenOverview?.symbol || tokenData?.metadata?.symbol || 'SYMBOL'})
          </h2>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm mb-4">
          <div>
            <span className="text-gray-500 dark:text-gray-400">{t('priceLabel')}</span>
            <span className="font-semibold dark:text-white font-mono">{tokenData?.tokenOverview?.priceFormatted || 'N/A'}</span>
          </div>
          <div>
            <span className="text-gray-500 dark:text-gray-400">{t('change24hLabel')}</span>
            <span className={`${getPriceChangeClass(tokenData?.tokenOverview?.priceChange24h)} font-mono`}>
              {tokenData?.tokenOverview?.priceChange24h ?? 'N/A'}
            </span>
          </div>
          <div>
            <span className="text-gray-500 dark:text-gray-400">{t('liquidityLabel')}</span>
            <span className="font-semibold dark:text-white font-mono">{tokenData?.tokenOverview?.liquidityFormatted || 'N/A'}</span>
          </div>
          <div>
            <span className="text-gray-500 dark:text-gray-400">{t('marketCapLabel')}</span>
            <span className="font-semibold dark:text-white font-mono">{tokenData?.tokenOverview?.marketCapFormatted || 'N/A'}</span>
          </div>
          <div>
            <span className="text-gray-500 dark:text-gray-400">{t('fdvLabel')}</span>
            <span className="font-semibold dark:text-white font-mono">{tokenData?.tokenOverview?.fdvFormatted || 'N/A'}</span>
          </div>
          <div>
            <span className="text-gray-500 dark:text-gray-400">{t('circulatingSupplyLabel')}</span>
            <span className="font-semibold dark:text-white font-mono">{tokenData?.tokenOverview?.circulatingSupplyFormatted ?? 'N/A'}</span>
          </div>
          {tokenData?.metadata?.security_score !== undefined && (
            <div>
              <span className="text-gray-500 dark:text-gray-400">{t('securityScoreLabel')}</span>
              <span className={`font-semibold dark:text-white ml-1 font-mono ${
                (tokenData?.metadata?.security_score ?? 0) >= 80 ? 'text-green-600 dark:text-green-400' :
                (tokenData?.metadata?.security_score ?? 0) >= 50 ? 'text-yellow-600 dark:text-yellow-400' :
                'text-red-600 dark:text-red-400'
              }`}>{tokenData?.metadata?.security_score ?? 'N/A'}</span>
            </div>
          )}
          {tokenData?.metadata?.verified_contract !== undefined && (
            <div>
              <span className="text-gray-500 dark:text-gray-400">{t('verifiedContractLabel')}</span>
              <span className={`font-semibold ml-1 ${tokenData?.metadata?.verified_contract ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {tokenData?.metadata?.verified_contract ? t('yesText') : t('noText')}
              </span>
            </div>
          )}
          {tokenData?.metadata?.possible_spam !== undefined && (
            <div>
              <span className="text-gray-500 dark:text-gray-400">{t('possibleSpamLabel')}</span>
              <span className={`font-semibold ml-1 ${tokenData?.metadata?.possible_spam ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                {tokenData?.metadata?.possible_spam ? t('yesText') : t('noText')}
              </span>
            </div>
          )}
          <div className="col-span-2 sm:col-span-1 text-sm">
            <span className="text-gray-500 dark:text-gray-400">{t('contractAddressLabel')}</span>
            <a 
              href={`https://bscscan.com/token/${params.address}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-indigo-600 dark:text-indigo-400 hover:underline break-all font-mono"
            >
              {formatAddress(params.address as string)}
            </a>
          </div>
        </div>
        
        {tokenData?.metadata?.links && Object.keys(tokenData.metadata.links).length > 0 ? (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('socialLinksTitle')}</h4>
            <div className="flex items-center justify-between">
              <div className="flex flex-wrap gap-3">
                {Object.entries(tokenData.metadata.links).map(([platform, url]) => {
                  if (!url) return null;
                  
                  if (platform.includes('telegram')) {
                    return (
                      <a 
                        key={platform} 
                        href={url as string} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="flex items-center text-xs px-3 py-1.5 bg-blue-100 dark:bg-blue-900 rounded hover:bg-blue-200 dark:hover:bg-blue-800 text-blue-700 dark:text-blue-300"
                      >
                        <span className="text-blue-400">✈️</span>
                        <span className="ml-1.5">Telegram</span>
                      </a>
                    );
                  } else if (platform.includes('twitter')) {
                    return (
                      <a 
                        key={platform} 
                        href={url as string} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="flex items-center text-xs px-3 py-1.5 bg-blue-100 dark:bg-blue-900 rounded hover:bg-blue-200 dark:hover:bg-blue-800 text-blue-700 dark:text-blue-300"
                      >
                        <span className="text-blue-500">🐦</span>
                        <span className="ml-1.5">X</span>
                      </a>
                    );
                  }
                  
                  return null;
                })}
              </div>
              
              <button
                onClick={handleRequestAiAnalysis}
                disabled={loading || isAiLoading}
                className={`px-4 py-1.5 rounded-md font-medium text-xs ml-auto ${
                  isAiLoading 
                    ? 'bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-400 cursor-not-allowed' 
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                }`}
              >
                {isAiLoading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {t('loadingAnalysisText')}
                  </span>
                ) : (
                  showAiAnalysis ? t('updateAIButton') : t('generateAIButton')
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex justify-end">
              <button
                onClick={handleRequestAiAnalysis}
                disabled={loading || isAiLoading}
                className={`px-4 py-1.5 rounded-md font-medium text-xs ${
                  isAiLoading 
                    ? 'bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-400 cursor-not-allowed' 
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                }`}
              >
                {isAiLoading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {t('loadingAnalysisText')}
                  </span>
                ) : (
                  showAiAnalysis ? t('updateAIButton') : t('generateAIButton')
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* === AI Analysis Card === */}
      {showAiAnalysis && (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 sm:p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('aiAnalysisTitle')}</h3>
            
            {!isAiLoading && (aiError || tokenData?.aiAnalysis === undefined) && (
              <button 
                onClick={handleRequestAiAnalysis}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                {t('retryButton')}
              </button>
            )}
          </div>
          
          {isAiLoading && (
            <div className="flex flex-col items-center justify-center py-8">
              <div role="status" className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]">
                <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">Loading...</span>
              </div>
              <div>
                <p className="mt-3 text-xs text-gray-600 dark:text-gray-400">{t('loadingAnalysisText')}</p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{t('loadingModelText')}</p>
              </div>
            </div>
          )}
          
          {!isAiLoading && !aiError && tokenData?.aiAnalysis && (
            <div>
              <AIAnalysis data={tokenData.aiAnalysis} />
            </div>
          )}
        </div>
      )}

      {/* === Holder Stats Card === */}
      {tokenData?.holderStats && (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 sm:p-6 mt-6">
          <h3 className="text-lg font-bold mb-3 text-gray-900 dark:text-white">📊 {t('holderStatsTitle') || 'Holder Statistics'}</h3>
          <HolderStats data={tokenData.holderStats} />
        </div>
      )}

      {/* === OHLCV 获取状态 === */}
      {tokenData?.ohlcv && (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 sm:p-6">
          <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">{t('klineDataStatusTitle')}</h3>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
            {(['1d', '4h', '1h', '10min'] as const).map((tf) => {
              const ohlcvList = tokenData?.ohlcv?.[tf] ?? null;
              const isFetched = Array.isArray(ohlcvList) && ohlcvList.length > 0;
              return (
                <div key={tf} className="flex items-center space-x-2">
                  <span className="font-medium text-gray-600 dark:text-gray-400 w-16">{tf}:</span>
                  {isFetched ? (
                    <span className="text-green-600 dark:text-green-400 font-semibold">✅ 已获取 ({ohlcvList.length} 条)</span>
                  ) : (
                    <span className="text-red-600 dark:text-red-400 font-semibold">❌ 未获取</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* === Top Traders Card === */}
      {tokenData?.topTraders && tokenData.topTraders.length > 0 && (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 sm:p-6">
          <h3 className="text-lg font-bold mb-3 text-gray-900 dark:text-white">🔄 {t('top10TradersTitle') || 'Top Traders'}</h3>
          <div className="overflow-x-auto text-xs">
            <table className="min-w-full">
              <thead>
                <tr className="border-b dark:border-gray-700">
                  <th className="text-left py-2 px-2 text-xs font-medium text-gray-500 dark:text-gray-400">{t('ownerHeader')}</th>
                  <th className="text-right py-2 px-2 text-xs font-medium text-gray-500 dark:text-gray-400">{t('countBuySellHeader')}</th>
                  <th className="text-right py-2 px-2 text-xs font-medium text-gray-500 dark:text-gray-400">{t('usdValueHeader')}</th>
                  <th className="text-left py-2 px-2 text-xs font-medium text-gray-500 dark:text-gray-400">{t('tagsHeader')}</th>
                </tr>
              </thead>
              <tbody>
                {(isTradersExpanded ? tokenData.topTraders : tokenData.topTraders.slice(0, 3)).map((trader) => (
                  <tr key={trader.address} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="py-2 px-2 text-xs text-indigo-600 dark:text-indigo-400 hover:underline">
                      <a href={`https://bscscan.com/address/${trader.address}`} target="_blank" rel="noopener noreferrer">
                        {formatAddress(trader.address)}
                      </a>
                    </td>
                    <td className="py-2 px-2 text-right">
                      {trader.buy?.count ?? 'N/A'} / {trader.sell?.count ?? 'N/A'}
                    </td>
                    <td className="py-2 px-2 text-right">
                      {trader.total?.amountUSDFormatted ?? 'N/A'}
                    </td>
                    <td className="py-2 px-2">
                      {trader.tags && (trader.tags.includes('sniper-bot') || trader.tags.includes('arbitrage-bot'))
                        ? 'bot'
                        : trader.tags?.join(', ') || 'N/A'
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {tokenData.topTraders.length > 3 && (
              <button 
                onClick={() => setIsTradersExpanded(prev => !prev)}
                className="mt-2 text-xs text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
              >
                {isTradersExpanded ? t('showLessButton') : t('showMoreButton', { count: tokenData.topTraders.length })}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}