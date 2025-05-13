'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import AIAnalysis from '@/components/analysis/AIAnalysis';
import HolderStats from '@/components/analysis/HolderStats';
import ActivityStatsOverview from '@/components/token/ActivityStatsOverview';
import { useTranslations } from 'next-intl';
import { safeFormatSignedPercentage, safeFormatPercentage, formatAdvancedPrice } from '@/utils/formatters';

interface TimeFrameData {
  '1m': string | null;
  '30m': string | null;
  '2h': string | null;
  '6h': string | null;
  '12h': string | null;
  '24h': string | null;
  [key: string]: string | null;
}

interface TokenAnalyticsData {
  priceChangePercent: TimeFrameData;
  uniqueWallets: TimeFrameData;
  uniqueWalletsChangePercent: TimeFrameData;
  buyCounts: TimeFrameData;
  sellCounts: TimeFrameData;
  tradeCountChangePercent: TimeFrameData;
  buyVolumeUSD: TimeFrameData;
  sellVolumeUSD: TimeFrameData;
  volumeChangePercent: TimeFrameData;
}

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
    totalSupply?: string | number;
    fdvFormatted?: string;
    circulatingSupplyFormatted?: string;
    lastTradeTimeFormatted: string;
    marketCap?: number;
    circulatingSupply?: string | number;
    circulationRatio?: number | null;
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
    total_supply?: string | number;
    market_cap_usd?: number;
  };
  tokenAnalytics?: Record<string, unknown>;
}

// Define AiAnalysisData type based on the existing aiAnalysis field structure
type AiAnalysisData = {
  basicAnalysis?: string;
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
  chain: string;
}

// Add type for raw params
interface RawParams {
  address?: string;
  locale?: string;
  chain?: string;
}

export default function TokenPage() {
  // 初始化翻译 hook
  const t = useTranslations('TokenPage');
  
  const rawParams = useParams() as RawParams;
  const params: Params = {
    address: rawParams.address || '',
    locale: rawParams.locale || 'en',
    chain: rawParams.chain || 'bsc'
  };
  const [tokenData, setTokenData] = useState<TokenData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiAnalysisResult, setAiAnalysisResult] = useState<AiAnalysisData | null>(null);
  const [showAiAnalysis, setShowAiAnalysis] = useState<boolean>(false);
  const [isTradersExpanded, setIsTradersExpanded] = useState<boolean>(false);

  console.log('--- Render State Check: loading=', loading, 'isAiLoading=', isAiLoading);

  // Reset AI analysis state when locale changes
  useEffect(() => {
    console.log(`--- Locale changed to: ${params.locale}, resetting AI analysis state ---`);
    setAiAnalysisResult(null);
    setIsAiLoading(false);
    setShowAiAnalysis(false);
  }, [params.locale]);

  // 用于ActivityStatsTable的调试日志
  useEffect(() => {
    if (tokenData?.tokenAnalytics) {
      console.log('[Page.tsx] Data for ActivityStatsTable:', tokenData.tokenAnalytics);
    }
  }, [tokenData?.tokenAnalytics]);

  // 添加重试计数器
  const [connectionRetryCount, setConnectionRetryCount] = useState<number>(0);
  const maxRetries = 3;

  // Helper function to get price change class
  const getPriceChangeClass = (change?: number | string | null): string => {
    if (!change) return '';
    const numericChange = typeof change === 'string' ? parseFloat(change) : change;
    return numericChange > 0 ? 'text-green-600 dark:text-green-400' : 
           numericChange < 0 ? 'text-red-600 dark:text-red-400' : 
           'text-gray-600 dark:text-gray-400';
  };

  // Helper function to safely format price change
  const formatPriceChange = (priceChange?: number | string | null): string => {
    if (priceChange === null || priceChange === undefined) {
      return 'N/A';
    }
    
    // Case 1: priceChange is already a formatted string with '%'
    if (typeof priceChange === 'string' && priceChange.includes('%')) {
      // If it's a positive value without a '+' prefix, add it
      if (!priceChange.startsWith('-') && !priceChange.startsWith('+')) {
        return `+${priceChange}`;
      }
      return priceChange;
    }
    
    // Case 2: Convert to numeric value and format
    return safeFormatSignedPercentage(priceChange, 2);
  };

  // Helper function to format address
  const formatAddress = (address: string): string => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Helper function to format address with ultra-short display (first char + last 4 chars)
  const formatAddressShort = (address: string): string => {
    if (!address) return '';
    return `${address.slice(0, 1)}...${address.slice(-4)}`;
  };

  // Helper function to get explorer URL based on chain
  const getExplorerUrl = (address: string): string => {
    switch(params.chain.toLowerCase()) {
      case 'solana':
        return `https://solscan.io/token/${address}`;
      case 'bsc':
        return `https://bscscan.com/token/${address}`;
      default:
        return `https://etherscan.io/token/${address}`;
    }
  };

  // 获取代币数据
  const handleFetchData = useCallback(async () => {
    if (!params.address) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003';
      const chain = params.chain;
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
        
        // 添加流通比例相关调试日志
        if (result?.metadata?.circulating_supply || result?.metadata?.total_supply) {
          console.log('[Circ Ratio] Metadata supply values:', {
            circulating_supply: result.metadata.circulating_supply,
            total_supply: result.metadata.total_supply,
            types: {
              circulating_supply: typeof result.metadata.circulating_supply,
              total_supply: typeof result.metadata.total_supply,
            }
          });
        }
        
        if (result?.success && result.data) {
          // 详细打印BSC链时的持有者相关数据，帮助调试
          if (result.chain === 'bsc' || params.chain === 'bsc') {
            console.log('=== BSC Chain Holder Data DEBUG ===');
            console.log('holderStats structure:', result.data.holderStats);
            console.log('holderAnalysis structure:', result.data.holderAnalysis);
            if (result.data.holderStats?.holderSupply) {
              console.log('holderSupply keys:', Object.keys(result.data.holderStats.holderSupply));
              console.log('top10 data:', result.data.holderStats.holderSupply.top10);
              console.log('top25 data:', result.data.holderStats.holderSupply.top25);
            } else {
              console.warn('holderSupply is missing in BSC data!');
            }
          }
          
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
  }, [params.address, params.chain, connectionRetryCount, maxRetries]);

  // 处理 AI 分析请求
  const handleRequestAiAnalysis = useCallback(async () => {
    console.log("--- AI Analysis START ---"); // 1. 函数开始

    if (!params.address) {
      console.log("--- AI Analysis EXIT: No params.address ---"); // 2. 检查地址参数
      return;
    }
    console.log("--- AI Analysis: params.address present:", params.address); // 3. 地址参数存在

    console.log("--- AI Analysis: Setting loading true ---"); // 4. 准备设置加载状态
    setIsAiLoading(true);
    setAiError(null);

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003'; // 使用修正后的后备 URL
      const chain = params.chain;

      // 5. 获取并检查 locale
      const currentLocale = params.locale; // 使用已有的 params 对象
      console.log("--- AI Analysis: Locale obtained:", currentLocale, typeof currentLocale);

      // 6. 检查 locale 是否有效 (非常重要)
      if (typeof currentLocale !== 'string' || currentLocale.trim().length === 0) {
         console.error("--- AI Analysis ERROR: Invalid locale detected:", currentLocale);
         throw new Error("Invalid locale for AI analysis request");
      }
      console.log("--- AI Analysis: Locale is valid, constructing URL..."); // 7. Locale 有效

      const aiUrl = `${baseUrl}/api/token-data/${chain}/${params.address}?analyze=true&lang=${currentLocale}`;
      console.log(`--- AI Analysis: Attempting to fetch URL: ${aiUrl}`); // 8. 打印将要请求的 URL

      const res = await fetch(aiUrl);
      console.log("--- AI Analysis: Fetch call returned, status:", res.status); // 9. Fetch 调用返回

      if (!res.ok) {
        console.error("--- AI Analysis ERROR: Fetch response not OK", res.status, res.statusText);
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      console.log("--- AI Analysis: Fetch response OK, attempting to parse JSON..."); // 10. 准备解析 JSON
      const result = await res.json();
      console.log("--- AI Analysis: JSON parsed successfully:", result?.success); // 11. JSON 解析完成

      if (result?.success && result.data?.aiAnalysis) {
        console.log("--- AI Analysis: Success and aiAnalysis data found, updating state..."); // 12. 数据有效，准备更新状态
        
        // Add detailed logging to see the exact data structure received
        console.log("--- AI Analysis: DETAILED STRUCTURE OF result.data.aiAnalysis:", JSON.stringify(result.data.aiAnalysis, null, 2));
        console.log("--- AI Analysis: basicAnalysis content type:", typeof result.data.aiAnalysis.basicAnalysis);
        console.log("--- AI Analysis: basicAnalysis content length:", result.data.aiAnalysis.basicAnalysis ? result.data.aiAnalysis.basicAnalysis.length : 0);
        
        setAiAnalysisResult(result.data.aiAnalysis);
        setShowAiAnalysis(true);
        console.log("--- AI Analysis: Set showAiAnalysis to true"); // 13. UI 状态更新
      } else {
        console.error("--- AI Analysis ERROR: Response success was false or aiAnalysis data missing", result); // 14. 响应无效
        throw new Error('AI分析结果无效或为空');
      }
    } catch (error) {
      console.error('--- AI Analysis CATCH BLOCK: Caught Error:', error); // 15. 捕获到错误
      setAiError(error instanceof Error ? error.message : '未知错误');
    } finally {
      console.log("--- AI Analysis FINALLY BLOCK: Setting loading false ---"); // 16. Finally 块执行
      setIsAiLoading(false);
    }
  }, [params]); // *** 依赖数组中使用整个 params 对象 ***

  // 使用 useEffect 调用初始数据获取
  useEffect(() => {
    handleFetchData();
  }, [handleFetchData]);

  // 渲染主要内容
  return (
    <div className="space-y-6">
      {/* === Basic Info Card === */}
      {loading && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
        </div>
      )}
      
      {error && !loading && (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">{t('errorOccurred')}</h3>
          <p>{error}</p>
        </div>
      )}
      
      {!loading && !error && tokenData?.tokenOverview && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 relative">
          {/* 顶部行：代币基本信息和价格 */}
          <div className="flex flex-col md:flex-row gap-4 items-start justify-between mb-4">
            {/* Logo, Name and Symbol */}
            <div className="flex items-center">
              {tokenData.tokenOverview.logoURI && (
                <Image
                  src={tokenData.tokenOverview.logoURI}
                  alt={tokenData.tokenOverview.symbol || 'Token'}
                  width={48}
                  height={48}
                  className="rounded-full mr-4"
                  unoptimized
                />
              )}
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {tokenData.tokenOverview.name || t('unknownToken')}
                </h1>
                <div className="flex items-center flex-wrap gap-2">
                  <span className="text-gray-600 dark:text-gray-400 font-mono">{tokenData.tokenOverview.symbol}</span>
                  <a 
                    href={getExplorerUrl(params.address)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-xs bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 font-mono break-all"
                    title={params.address}
                  >
                    {formatAddress(params.address)}
                    <button 
                      onClick={(e) => {
                        e.preventDefault();
                        navigator.clipboard.writeText(params.address);
                        // 可选：显示复制成功提示
                        alert("Contract address copied!");
                      }}
                      className="ml-1 text-indigo-500 hover:text-indigo-600"
                      title={t('copyAddress')}
                    >
                      📋
                    </button>
                  </a>
                </div>
              </div>
            </div>
            
            {/* Price Info - 调整对齐和定位 */}
            <div className="flex flex-col items-end">
              <div className="flex items-baseline gap-2">
                <div className="text-2xl font-bold text-gray-900 dark:text-white font-mono">
                  {formatAdvancedPrice(tokenData.tokenOverview.price, '$', '$0.00')}
                </div>
                <div className={`${getPriceChangeClass(tokenData.tokenOverview.priceChange24h)} font-mono`}>
                  {formatPriceChange(tokenData.tokenOverview.priceChange24h)}
                  <span className="text-xs text-gray-600 dark:text-gray-400 ml-1 font-mono">(24h)</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* 社交链接区域 */}
          {tokenData.metadata?.links && Object.keys(tokenData.metadata.links).length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {tokenData.metadata.links.website && (
                <a 
                  href={tokenData.metadata.links.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                >
                  🌐 {t('website')}
                </a>
              )}
              {tokenData.metadata.links.twitter && (
                <a 
                  href={tokenData.metadata.links.twitter} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-800 dark:text-blue-100 dark:hover:bg-blue-700"
                >
                  🐦 Twitter
                </a>
              )}
              {tokenData.metadata.links.telegram && (
                <a 
                  href={tokenData.metadata.links.telegram} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-indigo-100 text-indigo-800 hover:bg-indigo-200 dark:bg-indigo-800 dark:text-indigo-100 dark:hover:bg-indigo-700"
                >
                  📱 Telegram
                </a>
              )}
              {tokenData.metadata.links.discord && (
                <a 
                  href={tokenData.metadata.links.discord} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-purple-100 text-purple-800 hover:bg-purple-200 dark:bg-purple-800 dark:text-purple-100 dark:hover:bg-purple-700"
                >
                  💬 Discord
                </a>
              )}
            </div>
          )}
          
          {/* 详细数据指标 - 紧凑的网格布局 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-3">
            {/* 市值 */}
            <div>
              <div className="text-xs text-gray-500 dark:text-gray-400 font-medium font-mono">{t('marketCapLabel')}</div>
              <div className="text-sm font-semibold text-gray-900 dark:text-white font-mono">
                {tokenData.tokenOverview.marketCapFormatted || 'N/A'}
              </div>
            </div>
            
            {/* 完全稀释估值 (FDV) */}
            <div>
              <div className="text-xs text-gray-500 dark:text-gray-400 font-medium font-mono">{t('fdvLabel')}</div>
              <div className="text-sm font-semibold text-gray-900 dark:text-white font-mono">
                {tokenData.tokenOverview.fdvFormatted || 'N/A'}
              </div>
            </div>
            
            {/* 流动性 */}
            <div>
              <div className="text-xs text-gray-500 dark:text-gray-400 font-medium font-mono">{t('liquidityLabel')}</div>
              <div className="text-sm font-semibold text-gray-900 dark:text-white font-mono">
                {tokenData.tokenOverview.liquidityFormatted || 'N/A'}
              </div>
            </div>
            
            {/* 流通供应量 */}
            <div>
              <div className="text-xs text-gray-500 dark:text-gray-400 font-medium font-mono">{t('circulatingSupplyLabel')}</div>
              <div className="text-sm font-semibold text-gray-900 dark:text-white font-mono">
                {tokenData.tokenOverview.circulatingSupplyFormatted || 'N/A'}
              </div>
            </div>
            
            {/* 流通比例 - 新增 */}
            <div>
              <div className="text-xs text-gray-500 dark:text-gray-400 font-medium font-mono">{t('circulationRatioLabel')}</div>
              <div className="text-sm font-semibold text-gray-900 dark:text-white font-mono">
                {typeof tokenData?.tokenOverview?.circulationRatio === 'number' ? `${tokenData.tokenOverview.circulationRatio}%` : 'N/A'}
              </div>
            </div>
            
            {/* 持有者数量 */}
            <div>
              <div className="text-xs text-gray-500 dark:text-gray-400 font-medium font-mono">{t('totalHoldersLabel')}</div>
              <div className="flex items-baseline gap-2">
                <div className="text-sm font-semibold text-gray-900 dark:text-white font-mono">
                  {(tokenData.holderStats?.totalHolders || tokenData.holderAnalysis?.totalHolders || 'N/A').toString()}
                </div>
                {tokenData.holderStats?.holderChange?.['24h'] && (
                  <div className={`text-xs ${getPriceChangeClass(tokenData.holderStats.holderChange['24h'].changePercent)} font-mono`}>
                    {tokenData.holderStats.holderChange['24h'].changePercent > 0 ? '+' : ''}
                    {safeFormatPercentage(tokenData.holderStats.holderChange['24h'].changePercent, 2)}
                  </div>
                )}
              </div>
            </div>
            
            {/* 合约验证状态 */}
            {tokenData.metadata?.verified_contract !== undefined && (
              <div>
                <div className="text-xs text-gray-500 dark:text-gray-400 font-medium font-mono">{t('verifiedContractLabel')}</div>
                <div className="text-sm font-semibold text-gray-900 dark:text-white">
                  {tokenData.metadata.verified_contract ? 
                    <span className="text-green-600 dark:text-green-400 font-mono">✓ {t('yesText')}</span> : 
                    <span className="text-red-600 dark:text-red-400 font-mono">⚠ {t('noText')}</span>}
                </div>
              </div>
            )}
            
            {/* 安全分数 */}
            {tokenData.metadata?.security_score !== undefined && (
              <div>
                <div className="text-xs text-gray-500 dark:text-gray-400 font-medium font-mono">{t('securityScoreLabel')}</div>
                <div className="text-sm font-semibold text-gray-900 dark:text-white font-mono">
                  {tokenData.metadata.security_score} / 100
                </div>
              </div>
            )}
          </div>

          {/* AI Analysis Button - 移至右下角 */}
          {!showAiAnalysis && !isAiLoading && (
            <div className="flex justify-end mt-4">
              <button
                onClick={handleRequestAiAnalysis}
                disabled={isAiLoading}
                className="px-4 py-1 text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded-md disabled:opacity-50"
              >
                {t('generateAIButton')}
              </button>
            </div>
          )}
        </div>
      )}
      
      {/* === AI Analysis Card === */}
      {(showAiAnalysis || isAiLoading || aiError) && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="p-4 sm:p-6">
            <div className="flex items-center mb-4">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                {t('aiAnalysisTitle')}
              </h2>
            </div>
            
            {isAiLoading && (
              <div className="flex items-center justify-center p-6">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                <span className="ml-3 text-gray-600 dark:text-gray-400">{t('aiGenerating')}</span>
              </div>
            )}
            
            {aiError && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-md">
                {aiError}
              </div>
            )}
            
            {showAiAnalysis && aiAnalysisResult && (
              <div>
                <AIAnalysis 
                  data={{
                    basicAnalysis: aiAnalysisResult.basicAnalysis
                  }}
                />
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* === Holder Analysis Card === */}
      {!loading && !error && params.chain === 'bsc' && (tokenData?.holderStats || tokenData?.holderAnalysis) && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="p-4 sm:p-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              {t('holderAnalysisTitle')}
            </h2>
            
            <div className="mt-4 px-3">
              <HolderStats 
                data={{
                  totalHolders: tokenData.holderStats?.totalHolders || tokenData.holderAnalysis?.totalHolders || 0,
                  holderSupply: tokenData.holderStats?.holderSupply,
                  holderChange: tokenData.holderStats?.holderChange,
                  detail: {
                    totalHolders: tokenData.holderAnalysis?.totalHolders,
                    holderSupply: tokenData.holderStats?.holderSupply
                  }
                }}
                chain={params.chain}
              />
            </div>
          </div>
        </div>
      )}
      
      {/* === Activity Stats Card === */}
      {!loading && !error && tokenData?.tokenAnalytics && params.chain === 'solana' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="p-4 sm:p-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              {t('activityOverview.title')}
            </h2>
            
            <div className="bg-white dark:bg-gray-800">
              <ActivityStatsOverview tokenAnalytics={tokenData.tokenAnalytics as unknown as TokenAnalyticsData} />
            </div>
          </div>
        </div>
      )}
      
      {/* === Top Traders Card === */}
      {!loading && !error && tokenData?.topTraders && tokenData.topTraders.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="p-4 sm:p-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              {t('top10TradersTitle')}
            </h2>
            
            <div className="overflow-x-auto px-3">
              <table className="w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead>
                  <tr>
                    <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-2/5 font-mono">
                      {t('addressHeader')}
                    </th>
                    <th className="px-2 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-1/5 font-mono">
                      {t('buyLabel')}
                    </th>
                    <th className="px-2 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-1/5 font-mono">
                      {t('sellLabel')}
                    </th>
                    <th className="px-2 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-1/5 font-mono">
                      {t('usdValueHeader')}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {tokenData.topTraders.slice(0, isTradersExpanded ? undefined : 5).map((trader, index) => (
                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <td className="px-2 py-2 whitespace-nowrap">
                        <div className="flex items-center">
                          <a 
                            href={`${getExplorerUrl(trader.address)}`} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-xs text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 font-mono break-all"
                            title={formatAddress(trader.address)}
                          >
                            <span className="hidden sm:inline">{formatAddress(trader.address)}</span>
                            <span className="sm:hidden">{formatAddressShort(trader.address)}</span>
                          </a>
                          {trader.tags && trader.tags.length > 0 && (
                            <span className="ml-1 inline-flex items-center px-1 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100">
                              {trader.tags[0]}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap text-xs text-right">
                        <span className="text-green-500 dark:text-green-400 font-medium font-mono">
                          {trader.buy?.count || 0}
                        </span>
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap text-xs text-right">
                        <span className="text-red-500 dark:text-red-400 font-medium font-mono">
                          {trader.sell?.count || 0}
                        </span>
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap text-xs text-right font-semibold text-gray-900 dark:text-white font-mono">
                        {trader.total?.amountUSDFormatted || '$0.00'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {tokenData.topTraders.length > 5 && (
              <div className="mt-4 text-center">
                <button
                  onClick={() => setIsTradersExpanded(!isTradersExpanded)}
                  className="inline-flex items-center px-2 sm:px-3 py-1 sm:py-1.5 border border-indigo-300 dark:border-indigo-700 text-xs font-medium rounded-md text-indigo-600 dark:text-indigo-400 bg-white dark:bg-gray-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-indigo-700 transition-colors"
                >
                  {isTradersExpanded 
                    ? <><span>{t('showLessButton')}</span><svg className="ml-1 -mr-0.5 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" /></svg></>
                    : <><span>{t('showMoreButton', { count: tokenData.topTraders.length })}</span><svg className="ml-1 -mr-0.5 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg></>
                  }
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 