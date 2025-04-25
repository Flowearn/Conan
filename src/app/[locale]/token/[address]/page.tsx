'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import TokenAnalytics from '@/components/analysis/TokenAnalytics';
import AIAnalysis from '@/components/analysis/AIAnalysis';
import { useTranslations } from 'next-intl'; // 导入 next-intl 翻译 hook

interface OHLCVDataPoint {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface TokenData {
  success: boolean;
  data?: {
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
    holderStats?: Record<string, unknown>;
    holderStatistics?: Record<string, unknown>;
    top10Holders?: Array<{
      TokenHolderAddress: string;
      TokenHolderQuantity: string;
      TokenHolderQuantityFormatted: string;
      TokenHolderUsdValueFormatted: string;
    }>;
    topTraders?: Array<Trader>;
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
      name?: string;
      symbol?: string;
      thumbnail?: string;
      logo?: string;
      security_score?: number;
      verified_contract?: boolean;
      possible_spam?: boolean;
      social_links?: Record<string, string | null>;
      circulating_supply?: string | number;
      market_cap_usd?: number;
    };
    tokenAnalytics?: Record<string, unknown>;
  };
  errors?: Array<{
    type: string;
    message: string;
    details?: unknown;
  }>;
}

interface RawAnalyticsData {
  totalBuyers: Record<string, number>;
  totalSellers: Record<string, number>;
  totalBuys: Record<string, number>;
  totalSells: Record<string, number>;
  totalBuyVolume: Record<string, number>;
  totalSellVolume: Record<string, number>;
  [key: string]: unknown;
}

interface AnalyticsData {
  success: boolean;
  data?: {
    totalBuyers?: Record<string, number>;
    totalSellers?: Record<string, number>;
    totalBuys?: Record<string, number>;
    totalSells?: Record<string, number>;
    totalBuyVolumeFormatted?: Record<string, string | number>;
    totalSellVolumeFormatted?: Record<string, string | number>;
    rawData?: RawAnalyticsData;
  }
}

interface Trader {
  owner: string;
  tradeBuy: number;
  tradeSell: number;
  volumeTokenFormatted: string;
  volumeUsdFormatted: string;
  tags?: string[];
}

export default function TokenPage() {
  // 初始化翻译 hook
  const t = useTranslations('TokenPage');
  
  const params = useParams();
  const [tokenData, setTokenData] = useState<TokenData | null>(null);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [showAiAnalysis, setShowAiAnalysis] = useState<boolean>(false);
  const [isTradersExpanded, setIsTradersExpanded] = useState(false);
  const [isHoldersExpanded, setIsHoldersExpanded] = useState(false);

  // 添加重试计数器
  const [connectionRetryCount, setConnectionRetryCount] = useState(0);
  const maxRetries = 3;
  
  // 首先定义 handleFetchAnalyticsData 函数
  const handleFetchAnalyticsData = useCallback(async () => {
    if (!params.address) return;

    console.log('开始获取分析数据...');
    setLoading(true);
    setAnalyticsData(null);

    try {
      // 使用环境变量中的API基础URL
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3023';
      console.log(`使用API基础URL: ${baseUrl}`);
      
      try {
        const analyticsUrl = `${baseUrl}/api/token-analytics/${params.address}`;
        console.log(`尝试连接分析API: ${analyticsUrl}`);
        
        const res = await fetch(analyticsUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          signal: AbortSignal.timeout(5000)
        });

        if (res.ok) {
          console.log(`成功连接到分析API`);
          const data = await res.json();
          setAnalyticsData(data);
          setLoading(false);
          setError(null);
        } else {
          console.warn(`分析API返回错误状态码: ${res.status}`);
          const errorMessage = `服务器返回错误状态码: ${res.status}`;
          
          // 尝试解析错误响应
          try {
            const errorData = await res.json();
            console.warn(`分析API错误详情:`, errorData);
            setError(`${errorMessage}, 详情: ${JSON.stringify(errorData)}`);
          } catch (parseErr: unknown) {
            console.warn(`无法解析错误响应`, parseErr);
            setError(errorMessage);
          }
          setLoading(false);
        }
      } catch (e: unknown) {
        const errorMessage = e instanceof Error ? e.message : String(e);
        console.warn(`连接分析API失败:`, errorMessage);
        setError(errorMessage);
        setLoading(false);
      }
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : String(e);
      console.error(`获取分析数据失败:`, errorMessage);
      setError(errorMessage);
      setLoading(false);
    }
  }, [params.address]);

  useEffect(() => {
    handleFetchAnalyticsData();
  }, [handleFetchAnalyticsData]);

  // 然后定义 handleFetchData 函数
  const handleFetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log(`尝试连接后端服务 (${new Date().toISOString()})...`);
      
      try {
        // 添加详细的 address 调试信息
        console.log('--- Debug: Using address for fetch:', params.address);
        
        // 使用环境变量中的API基础URL
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3023';
        const url = `${baseUrl}/api/token-data/${params.address}`;
        console.log('--- Debug: Fetching URL:', url);
        
        // 发送请求
        const res = await fetch(url, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          signal: AbortSignal.timeout(30000) // 30秒超时
        });

        console.log('--- Debug: API Response Status:', res.status);

        if (res.ok) {
          console.log(`成功连接到API服务`);
          
          // 检查响应是否有效
          const contentType = res.headers.get('content-type');
          if (!contentType || !contentType.includes('application/json')) {
            console.error('返回的不是JSON格式:', contentType);
            throw new Error('服务器未返回JSON格式数据');
          }
          
          console.log('--- Debug: 尝试解析 API 响应...');
          try {
            const result = await res.json() as TokenData;
            console.log('--- Debug: API Response Data (Parsed):', result);
            
            if (result.success && result.data) {
              setTokenData(result);
              // 调用分析数据获取函数
              handleFetchAnalyticsData();
            } else {
              const errorMsg = result.errors?.[0]?.message || '未能获取有效的代币数据';
              console.error('--- Debug: API响应错误, success=false 或 data缺失:', errorMsg);
              setError(errorMsg);
              
              // 设置一个错误状态的 tokenData 对象，而不是保留为 null
              setTokenData({
                success: false,
                errors: result.errors || [{ type: 'API_ERROR', message: errorMsg }]
              });
            }
          } catch (parseError) {
            console.error('--- Debug: Error parsing API response:', parseError);
            // 尝试获取原始文本以获取更多线索
            try {
              const rawText = await res.text();
              console.log('--- Debug: API Response Text (Raw on parse error):', rawText);
            } catch (textError) {
              console.error('--- Debug: Error reading response text after parse error:', textError);
            }
            throw parseError; // 重新抛出以便外层 catch 捕获
          }
        } else {
          console.log(`API响应状态码: ${res.status}`);
          const errorMessage = `服务器返回错误状态码: ${res.status}`;
          
          // 尝试读取错误详情
          try {
            const errorData = await res.json();
            console.log(`API错误详情:`, errorData);
            throw new Error(`${errorMessage}, 详情: ${JSON.stringify(errorData)}`);
          } catch (_) { // eslint-disable-line @typescript-eslint/no-unused-vars
            console.log(`无法解析API的错误响应`);
            throw new Error(errorMessage);
          }
        }
      } catch (error: unknown) {
        const typedError = error as Error;
        console.log(`连接API失败:`, typedError);
        if (typedError instanceof TypeError && typedError.message.includes('Failed to fetch')) {
          console.log('网络连接错误，可能是CORS问题或服务器未运行');
        } else if (typedError.name === 'AbortError') {
          console.log('请求超时');
        }
        
        // 设置错误状态
        setError(typedError.message || '无法连接到后端服务，请检查服务是否运行');
        
        // 设置一个错误状态的 tokenData 对象，而不是保留为 null
        setTokenData({
          success: false,
          errors: [{ 
            type: 'CONNECTION_ERROR', 
            message: typedError.message || '无法连接到后端服务，请检查服务是否运行'
          }]
        });
      }
    } catch (error: unknown) {
      console.error('获取数据异常:', error);
      setError(error instanceof Error ? error.message : '未知错误');
    } finally {
      // 确保无论是何种情况下，loading 状态都会被关闭
      // 添加一个小延迟以确保 tokenData 已经被设置
      setTimeout(() => {
        setLoading(false);
      }, 300); // 300ms延迟，足够让状态更新完成但又不至于让用户等待太久
    }
  }, [params.address, handleFetchAnalyticsData]);

  // 定义 handleRetry 函数
  const handleRetry = useCallback(() => {
    setConnectionRetryCount(prev => prev + 1);
    setError(null);
    handleFetchData();
  }, [handleFetchData]);

  // 定义 handleRequestAiAnalysis 函数
  const handleRequestAiAnalysis = useCallback(async () => {
    if (loading || isAiLoading) return;
    
    console.log('请求 AI 分析...');
    setAiError(null);
    setIsAiLoading(true);
    
    try {
      // Get the current locale from params
      const { locale = 'zh' } = params;
      console.log(`Current locale for AI analysis: ${locale}`);
      
      // 使用环境变量中的API基础URL
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3023';
      const aiUrl = `${baseUrl}/api/token-data/${params.address}?analyze=true&lang=${locale}`;
      console.log(`尝试连接 AI 分析 API: ${aiUrl}`);
      
      const aiResponse = await fetch(aiUrl, {
        method: 'GET',
        headers: { 
          'Content-Type': 'application/json', 
          'Accept': 'application/json'
        },
        signal: AbortSignal.timeout(60000) // 60秒超时，AI分析需要更长时间
      });
      
      if (!aiResponse.ok) {
        const errorText = await aiResponse.text().catch(() => '无法获取错误详情');
        console.error(`AI分析请求失败，状态码: ${aiResponse.status}，错误: ${errorText}`);
        throw new Error(`AI分析请求失败 (${aiResponse.status}): ${errorText}`);
      }
      
      const aiResult = await aiResponse.json() as TokenData;
      console.log('AI分析响应:', aiResult);
      
      if (!aiResult.success || !aiResult.data?.aiAnalysis) {
        const errorMsg = aiResult.errors?.[0]?.message || 'AI分析未返回有效数据';
        console.error('AI分析API错误:', errorMsg);
        throw new Error(errorMsg);
      }
      
      // 更新状态
      setTokenData(prevData => {
        if (!prevData) return aiResult;
        
        return {
          ...prevData,
          data: {
            ...prevData.data,
            aiAnalysis: aiResult.data?.aiAnalysis
          }
        };
      });
      
      console.log('AI分析完成');
      // 设置显示AI分析
      setShowAiAnalysis(true);
    } catch (error: unknown) {
      console.error('AI分析请求错误:', error);
      setAiError(error instanceof Error ? error.message : '未知错误');
    } finally {
      setIsAiLoading(false);
    }
  }, [loading, isAiLoading, params]);
  
  // 使用useEffect调用初始数据获取
  useEffect(() => {
    if (params.address) {
      handleFetchData();
    }
  }, [params.address, handleFetchData]);

  // Helper to shorten address
  const formatAddress = (addr: string | undefined | null): string => {
    if (!addr || addr.length < 10) return addr || 'N/A';
    return `0x.${addr.substring(addr.length - 4)}`;
  };
  
  // Helper for price change color
  const getPriceChangeClass = (change: number | undefined | null): string => {
    if (typeof change !== 'number') return 'text-gray-500 dark:text-gray-400';
    if (change > 0) return 'text-green-600 dark:text-green-400';
    if (change < 0) return 'text-red-600 dark:text-red-400';
    return 'text-gray-500 dark:text-gray-400';
  };

  // 在访问数据前添加日志和健壮性检查
  console.log('Value of tokenData right before accessing .data:', tokenData);
  
  // --- 重构渲染逻辑, 按状态优先级顺序检查 ---
  
  // 1. 首先检查加载状态
  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[calc(100vh-12rem)] text-center">
        <div role="status" className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]">
          <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">Loading...</span>
        </div>
        <p className="mt-3 text-gray-600 dark:text-gray-400">{t('loadingText')}</p>
      </div>
    );
  }
  
  // 2. 检查错误状态
  if (error) {
    // 处理连接错误、网络错误等
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 my-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-600 dark:text-red-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200">{t('error')}</h3>
              <p className="text-sm text-red-700 dark:text-red-300 mt-2">{error}</p>
              
              {connectionRetryCount < maxRetries && (
                <button
                  onClick={handleRetry}
                  className="mt-3 text-sm font-medium text-white bg-red-600 hover:bg-red-700 px-4 py-2 rounded-md"
                >
                  {t('retryButton')} ({connectionRetryCount}/{maxRetries})
                </button>
              )}
              
              <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                <p>{t('possibleSolutionsText')}</p>
                <ul className="list-disc list-inside mt-2">
                  <li>{t('checkBackendRunningText')} (端口 3023)</li>
                  <li>{t('checkNetworkConnectionText')}</li>
                  <li>{t('refreshPageText')}</li>
                  <li>{t('verifyAddressText')}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // 3. 检查tokenData是否为null/undefined（异常情况）- 使用与loading相同的UI
  if (!tokenData) {
    console.log('--- Reached !tokenData after loading=false, showing loader temporarily ---');
    return (
      <div className="flex flex-col justify-center items-center min-h-[calc(100vh-12rem)] text-center">
        <div role="status" className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]">
          <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">Loading...</span>
        </div>
        <p className="mt-3 text-gray-600 dark:text-gray-400">{t('loadingText')}</p>
      </div>
    );
  }
  
  // 4. 检查API级别错误（tokenData存在但success为false或data缺失）
  if (!tokenData.success || !tokenData.data) {
    const backendErrors = tokenData.errors;
    let detailedErrorMessage = t('loadTokenDataFailedText');
    
    if (Array.isArray(backendErrors) && backendErrors.length > 0) {
      detailedErrorMessage += ` (${t('errorDetails')}: ${backendErrors.map(e => `${e.type}: ${e.message || e.details}`).join('; ')})`;
    }
    
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-12rem)]">
        <div className="text-center p-6 bg-yellow-100 dark:bg-yellow-900 border border-yellow-400 dark:border-yellow-700 rounded-lg max-w-md mx-auto">
          <h2 className="text-xl font-bold text-yellow-700 dark:text-yellow-200 mb-2">{t('dataUnavailableTitle')}</h2>
          <p className="text-gray-700 dark:text-gray-300 text-sm">
            {detailedErrorMessage}
          </p>
        </div>
      </div>
    );
  }
  
  // 5. 成功状态 - 解构数据并渲染主要内容
  const { 
    tokenOverview, 
    top10Holders: hList, 
    metadata, 
    topTraders: ttList,
  } = tokenData.data;
  
  const contractAddr = params.address as string;

  // 在TokenPage组件渲染函数return之前添加日志
  console.log('[DEBUG page.tsx] Current analyticsData state before render:', JSON.stringify(analyticsData, null, 2));
  
  // 添加专门用于调试 Top Holders 数据的日志
  console.log('--- Debug: Top 10 Holders Data for Rendering:', tokenData.data.top10Holders);
  console.log('--- Debug: hList variable (aliased from top10Holders):', hList);
  console.log('--- DEBUG ENHANCED: Is top10Holders data present?', {
    isDefined: !!tokenData.data.top10Holders,
    isArray: Array.isArray(tokenData.data.top10Holders),
    length: tokenData.data.top10Holders?.length || 0,
    firstItem: tokenData.data.top10Holders?.[0] || 'No items',
    sample: tokenData.data.top10Holders?.slice(0, 2) || []
  });
  console.log('--- DEBUG CONDITIONAL RENDERING: Top Holders Section', {
    willRender: !!(hList && hList.length > 0),
    hListExists: !!hList,
    hListLength: hList?.length || 0,
    hListIsArray: Array.isArray(hList)
  });

  return (
    <div className="space-y-6">
      {/* === Basic Info Card === */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 sm:p-6">
        <div className="flex items-center space-x-3 mb-4">
          {(tokenOverview?.logoURI || metadata?.thumbnail || metadata?.logo) && (
            // TODO: 如果 logo 使用外部 URL，请确保 next.config.js 中的 remotePatterns 允许这些域名。
            <Image 
              src={tokenOverview?.logoURI || metadata?.thumbnail || metadata?.logo || '/images/default-token.png'}
              alt={`${tokenOverview?.name || metadata?.name || 'Token'} logo`} 
              className="rounded-full" 
              width={40}
              height={40}
            />
          )}
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">{tokenOverview?.name || metadata?.name || 'Token'} ({tokenOverview?.symbol || metadata?.symbol || 'SYMBOL'})</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm mb-4">
          <div><span className="text-gray-500 dark:text-gray-400">{t('priceLabel')}</span> <span className="font-semibold dark:text-white font-mono">{tokenOverview?.priceFormatted || 'N/A'}</span></div>
          <div><span className="text-gray-500 dark:text-gray-400">{t('change24hLabel')}</span> <span className={`${getPriceChangeClass(tokenOverview?.priceChange24h)} font-mono`}>{tokenOverview?.priceChange24h?.toFixed(2) ?? 'N/A'}%</span></div>
          <div><span className="text-gray-500 dark:text-gray-400">{t('liquidityLabel')}</span> <span className="font-semibold dark:text-white font-mono">{tokenOverview?.liquidityFormatted || 'N/A'}</span></div>
          <div><span className="text-gray-500 dark:text-gray-400">{t('marketCapLabel')}</span> <span className="font-semibold dark:text-white font-mono">{tokenOverview?.marketCapFormatted || 'N/A'}</span></div>
          <div><span className="text-gray-500 dark:text-gray-400">{t('fdvLabel')}</span> <span className="font-semibold dark:text-white font-mono">{tokenOverview?.fdvFormatted || 'N/A'}</span></div>
          <div><span className="text-gray-500 dark:text-gray-400">{t('circulatingSupplyLabel')}</span> <span className="font-semibold dark:text-white font-mono">{tokenOverview?.circulatingSupplyFormatted ?? 'N/A'}</span></div>
          {metadata?.security_score !== undefined && (
            <div>
              <span className="text-gray-500 dark:text-gray-400">{t('securityScoreLabel')}</span> 
              <span className={`font-semibold dark:text-white ml-1 font-mono ${
                  (metadata.security_score ?? 0) >= 80 ? 'text-green-600 dark:text-green-400' :
                  (metadata.security_score ?? 0) >= 50 ? 'text-yellow-600 dark:text-yellow-400' :
                  'text-red-600 dark:text-red-400'
              }`}>{metadata.security_score ?? 'N/A'}</span>
            </div>
          )}
          {metadata?.verified_contract !== undefined && (
            <div>
              <span className="text-gray-500 dark:text-gray-400">{t('verifiedContractLabel')}</span> 
              <span className={`font-semibold ml-1 ${metadata.verified_contract ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {metadata.verified_contract ? t('yesText') : t('noText')}
              </span>
            </div>
          )}
          {metadata?.possible_spam !== undefined && (
            <div>
              <span className="text-gray-500 dark:text-gray-400">{t('possibleSpamLabel')}</span> 
              <span className={`font-semibold ml-1 ${metadata.possible_spam ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                {metadata.possible_spam ? t('yesText') : t('noText')}
              </span>
            </div>
          )}
          <div className="col-span-2 sm:col-span-1 text-sm"><span className="text-gray-500 dark:text-gray-400">{t('contractAddressLabel')}</span> <a href={`https://bscscan.com/token/${contractAddr}`} target="_blank" rel="noopener noreferrer" className="font-medium text-indigo-600 dark:text-indigo-400 hover:underline break-all font-mono">{formatAddress(contractAddr)}</a></div>
        </div>
        
        {metadata?.social_links && Object.keys(metadata.social_links).length > 0 ? (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('socialLinksTitle')}</h4>
            <div className="flex items-center justify-between">
              <div className="flex flex-wrap gap-3">
                {Object.entries(metadata.social_links).map(([platform, url]) => {
                  if (!url) return null;
                  
                  // 只显示telegram和twitter
                  if (platform.includes('telegram')) {
                    return (
                      <a 
                        key={platform} 
                        href={url} 
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
                        href={url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="flex items-center text-xs px-3 py-1.5 bg-blue-100 dark:bg-blue-900 rounded hover:bg-blue-200 dark:hover:bg-blue-800 text-blue-700 dark:text-blue-300"
                      >
                        <span className="text-blue-500">🐦</span>
                        <span className="ml-1.5">X</span>
                      </a>
                    );
                  }
                  
                  return null; // 不显示其他社交链接
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
            
            {!isAiLoading && (aiError || tokenData?.data?.aiAnalysis === undefined) && (
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
          
          {!isAiLoading && aiError && (
            <div className="p-4 text-red-700 bg-red-100 dark:bg-red-900 dark:text-red-200 rounded-lg text-xs">
              <p className="font-medium">{t('aiErrorTitle')}</p>
              <p className="mt-1">{aiError}</p>
              <p className="mt-2 text-red-600 dark:text-red-300">
                可能原因：后端无法连接AI服务、服务超时或处理错误。请稍后再试。
              </p>
            </div>
          )}
          
          {!isAiLoading && !aiError && tokenData?.data?.aiAnalysis && (
            <div>
              <AIAnalysis data={tokenData.data.aiAnalysis} />
            </div>
          )}

          {!isAiLoading && !aiError && tokenData?.data?.aiAnalysis === undefined && (
            <div className="p-4 text-yellow-700 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-200 rounded-lg text-xs">
              <p className="font-medium">{t('aiNoDataFound')}</p>
              <p className="mt-1">
                {t('aiDataUnavailable')}
                {tokenData?.data && <span className="block mt-2">已接收数据字段: {Object.keys(tokenData.data).join(', ')}</span>}
              </p>
            </div>
          )}
        </div>
      )}

      {/* === TokenAnalytics Card === */}
      <TokenAnalytics data={analyticsData ?? null} />

      {/* === OHLCV 获取状态 === */}
      {tokenData?.data?.ohlcv && (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 sm:p-6">
          <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">{t('klineDataStatusTitle')}</h3>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
            {(['1d', '4h', '1h', '10min'] as const).map((tf) => {
              const ohlcvList = tokenData.data?.ohlcv?.[tf] ?? null;
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
      {ttList && ttList.length > 0 && (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 sm:p-6">
          <h3 className="text-lg font-bold mb-3 text-gray-900 dark:text-white">{t('top10TradersTitle')}</h3>
          <div className="overflow-x-auto text-xs">
            <table className="min-w-full">
              <thead>
                <tr className="border-b dark:border-gray-700">
                  <th className="text-left py-2 px-2 text-xs font-medium text-gray-500 dark:text-gray-400">{t('ownerHeader')}</th>
                  <th className="text-right py-2 px-2 text-xs font-medium text-gray-500 dark:text-gray-400">{t('countBuySellHeader')}</th>
                  <th className="text-right py-2 px-2 text-xs font-medium text-gray-500 dark:text-gray-400">{t('tokenVolumeHeader')}</th>
                  <th className="text-right py-2 px-2 text-xs font-medium text-gray-500 dark:text-gray-400">{t('usdValueHeader')}</th>
                  <th className="text-left py-2 px-2 text-xs font-medium text-gray-500 dark:text-gray-400">{t('tagsHeader')}</th>
                </tr>
              </thead>
              <tbody>
                {(isTradersExpanded ? ttList : ttList.slice(0, 3)).map((trader) => (
                  <tr key={trader.owner} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="py-2 px-2 text-xs text-indigo-600 dark:text-indigo-400 hover:underline"><a href={`https://bscscan.com/address/${trader.owner}`} target="_blank" rel="noopener noreferrer">{formatAddress(trader.owner)}</a></td>
                    <td className="py-2 px-2">
                      {trader.tradeBuy} / {trader.tradeSell}
                    </td>
                    <td className="py-2 px-2">
                      {trader.volumeTokenFormatted}
                    </td>
                    <td className="py-2 px-2">
                      {trader.volumeUsdFormatted}
                    </td>
                    <td className="py-2 px-2">
                      {trader.tags && (trader.tags.includes('sniper-bot') || trader.tags.includes('arbitrage-bot'))
                        ? 'bot' /* 如果包含任一机器人tag，显示 'bot' */
                        : trader.tags?.join(', ') || 'N/A' /* 否则显示原始tag或N/A */
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {ttList && ttList.length > 3 && (
              <button 
                onClick={() => setIsTradersExpanded(prev => !prev)}
                className="mt-2 text-xs text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
              >
                {isTradersExpanded ? t('showLessButton') : t('showMoreButton', { count: ttList.length })}
              </button>
            )}
          </div>
        </div>
      )}

      {/* === Top Holders Card === */}
      {hList && hList.length > 0 && (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 sm:p-6">
          <h3 className="text-lg font-bold mb-3 text-gray-900 dark:text-white">{t('topHoldersTitle') || 'Top Holders'}</h3>
          <div className="overflow-x-auto text-xs">
            <table className="min-w-full">
              <thead>
                <tr className="border-b dark:border-gray-700">
                  <th className="text-left py-2 px-2 text-xs font-medium text-gray-500 dark:text-gray-400">{t('addressHeader') || 'Address'}</th>
                  <th className="text-right py-2 px-2 text-xs font-medium text-gray-500 dark:text-gray-400">{t('holdingsHeader') || 'Holdings'}</th>
                  <th className="text-right py-2 px-2 text-xs font-medium text-gray-500 dark:text-gray-400">{t('valueHeader') || 'Value'}</th>
                </tr>
              </thead>
              <tbody>
                {(isHoldersExpanded ? hList : hList.slice(0, 3)).map((holder) => (
                  <tr key={holder.TokenHolderAddress} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="py-2 px-2 text-xs text-indigo-600 dark:text-indigo-400 hover:underline">
                      <a href={`https://bscscan.com/address/${holder.TokenHolderAddress}`} target="_blank" rel="noopener noreferrer">
                        {formatAddress(holder.TokenHolderAddress)}
                      </a>
                    </td>
                    <td className="py-2 px-2 text-right font-mono">
                      {holder.TokenHolderQuantityFormatted || holder.TokenHolderQuantity}
                    </td>
                    <td className="py-2 px-2 text-right font-mono">
                      {holder.TokenHolderUsdValueFormatted || 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {hList && hList.length > 3 && (
              <button 
                onClick={() => setIsHoldersExpanded(prev => !prev)}
                className="mt-2 text-xs text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
              >
                {isHoldersExpanded ? t('showLessButton') : t('showMoreButton', { count: hList.length })}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}