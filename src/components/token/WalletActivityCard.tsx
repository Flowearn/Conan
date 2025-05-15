import React from 'react';
import { useTranslations } from 'next-intl';
import type { MetricTimeFrames } from '@/types/token';

interface WalletActivityCardProps {
  uniqueWalletsData?: MetricTimeFrames | null;     // "Unique Wallets" 的时间序列数据
  walletChangePercentData?: MetricTimeFrames | null; // "Wallet Change (%)" 的时间序列数据
  timeframes: readonly string[];                  // 标准时间维度数组
  isLoading?: boolean;                             // 可选的加载状态
}

const WalletActivityCard: React.FC<WalletActivityCardProps> = ({
  uniqueWalletsData,
  walletChangePercentData,
  timeframes,
  isLoading = false
}) => {
  const t = useTranslations('TokenAnalytics');
  
  // 检查是否有数据可显示
  const hasData = uniqueWalletsData || walletChangePercentData;

  // 根据百分比值的符号确定文本颜色
  const getColorClass = (value: string | number | null | undefined): string => {
    // 如果值为null或undefined，直接返回中性颜色
    if (value === null || value === undefined || value === '') {
      return 'text-gray-500 dark:text-gray-400'; // 中性/默认颜色
    }

    // 安全地将任何输入值转换为字符串
    const stringValue = String(value);
    
    // 检查stringValue是否有includes方法（应该总是有的，因为我们调用了String()）
    if (typeof stringValue.includes !== 'function') {
      return 'text-gray-500 dark:text-gray-400'; // 类型异常，返回中性颜色
    }

    if (stringValue.includes('+')) {
      return 'text-green-500 dark:text-green-400';
    }
    if (stringValue.includes('-')) {
      return 'text-red-500 dark:text-red-400';
    }
    
    // 处理不带符号的数值 (例如"5.26%")
    // 先去掉百分比符号，然后尝试转换为数值
    const numValue = parseFloat(stringValue.replace('%', '').trim());
    if (!isNaN(numValue)) {
      if (numValue > 0) return 'text-green-500 dark:text-green-400';
      if (numValue < 0) return 'text-red-500 dark:text-red-400';
    }
    
    // 处理"0.00%"、"0%"和"0.00"等零值情况
    if (stringValue === '0.00%' || stringValue === '0%' || stringValue === '0.00' || stringValue === '0') {
      return 'text-gray-700 dark:text-gray-300'; // 零值使用中性颜色
    }
    
    // 默认返回中性颜色
    return 'text-gray-500 dark:text-gray-400';
  };

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <h5 className="text-xs font-medium mb-2 text-gray-700 dark:text-gray-300">
          {t('walletActivityCardTitle')}
        </h5>
        <div className="grid grid-cols-3 sm:grid-cols-3 gap-2">
          {timeframes.map((time) => (
            <div key={time} className="bg-indigo-900/20 rounded p-2">
              <div className="h-4 bg-gray-600 rounded mb-2"></div>
              <div className="h-3 bg-gray-600 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!hasData) {
    return (
      <div>
        <h5 className="text-xs font-medium mb-2 text-gray-700 dark:text-gray-300">
          {t('walletActivityCardTitle')}
        </h5>
        <div className="text-gray-500 dark:text-gray-400 text-center py-2 text-sm">
          {t('noDataText')}
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* 子模块标题 */}
      <h5 className="text-xs font-medium mb-2 text-gray-700 dark:text-gray-300">
        {t('walletActivityCardTitle')}
      </h5>
      
      {/* 时间数据网格 */}
      <div className="grid grid-cols-3 sm:grid-cols-3 gap-2 text-xs">
        {/* 为每个时间点创建一个区块 */}
        {timeframes.map((time) => {
          const walletsObj = uniqueWalletsData?.[time];
          const changeObj = walletChangePercentData?.[time];
          return (
            <div 
              key={time} 
              className="bg-indigo-50 dark:bg-indigo-900/30 px-2 py-1.5 rounded"
            >
              {/* 时间标签和百分比变化 */}
              <div className="flex justify-between items-baseline mb-2">
                <span className="text-gray-700 dark:text-gray-300 font-medium font-mono">
                  {/* 直接使用actualTimeframe作为时间标签，与PriceChangeCard一致 */}
                  {walletsObj?.actualTimeframe ?? time}
                </span>
                <span className={`font-mono font-medium ${getColorClass(changeObj?.value)}`}>
                  {changeObj?.value ?? 'N/A'}
                </span>
              </div>
              
              {/* 数据显示区域，其他非百分比指标 */}
              <div className="space-y-2">
                {/* 独立钱包数据 - 始终显示，即使数据不存在 */}
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-700 dark:text-gray-400 font-medium font-mono">{t('walletCountLabel')}</span>
                  <span className="font-mono font-medium text-gray-900 dark:text-white">
                    {/* 直接显示后端提供的预格式化字符串，不做任何格式化 */}
                    {walletsObj?.value ?? 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WalletActivityCard; 