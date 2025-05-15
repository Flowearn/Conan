import React from 'react';
import { useTranslations } from 'next-intl';
import type { MetricTimeFrames } from '@/types/token';

interface TradeVolumesCardProps {
  buyVolumeUSDData?: MetricTimeFrames | null;
  sellVolumeUSDData?: MetricTimeFrames | null;
  volumeChangePercentData?: MetricTimeFrames | null;
  timeframes: readonly string[];
  isLoading?: boolean;
}

const TradeVolumesCard: React.FC<TradeVolumesCardProps> = ({
  buyVolumeUSDData,
  sellVolumeUSDData,
  volumeChangePercentData,
  timeframes,
  isLoading = false
}) => {
  const t = useTranslations('TokenAnalytics');
  
  // 检查是否有数据可显示
  const hasData = buyVolumeUSDData || sellVolumeUSDData || volumeChangePercentData;

  // 根据百分比值的符号确定文本颜色
  const getColorClass = (value: string | null | undefined): string => {
    if (!value) return 'text-gray-500 dark:text-gray-400';
    if (value.includes('+')) return 'text-green-500 dark:text-green-400';
    if (value.includes('-')) return 'text-red-500 dark:text-red-400';
    
    // 处理不带符号的数值 (例如"5.26%")
    // 先去掉百分比符号，然后尝试转换为数值
    const numValue = parseFloat(value.replace('%', '').trim());
    if (!isNaN(numValue)) {
      if (numValue > 0) return 'text-green-500 dark:text-green-400';
      if (numValue < 0) return 'text-red-500 dark:text-red-400';
    }
    
    return 'text-gray-500 dark:text-gray-400';
  };

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <h5 className="text-xs font-medium mb-2 text-gray-700 dark:text-gray-300">
          {t('tradeVolumesCardTitle')}
        </h5>
        <div className="grid grid-cols-3 sm:grid-cols-3 gap-2">
          {timeframes.map((time) => (
            <div key={time} className="bg-indigo-900/20 rounded p-2">
              <div className="h-4 bg-gray-600 rounded mb-2"></div>
              <div className="h-3 bg-gray-600 rounded mb-2"></div>
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
          {t('tradeVolumesCardTitle')}
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
        {t('tradeVolumesCardTitle')}
      </h5>
      
      {/* 时间数据网格 */}
      <div className="grid grid-cols-3 sm:grid-cols-3 gap-2 text-xs">
        {/* 为每个时间点创建一个区块 */}
        {timeframes.map((time) => {
          const buyObj = buyVolumeUSDData?.[time];
          const sellObj = sellVolumeUSDData?.[time];
          const changeObj = volumeChangePercentData?.[time];
          return (
            <div 
              key={time} 
              className="bg-indigo-50 dark:bg-indigo-900/30 px-2 py-1.5 rounded"
            >
              {/* 时间标签和百分比变化 */}
              <div className="flex justify-between items-baseline mb-2">
                <span className="text-gray-700 dark:text-gray-300 font-medium font-mono">
                  {/* 直接使用actualTimeframe作为时间标签，与PriceChangeCard一致 */}
                  {buyObj?.actualTimeframe ?? time}
                </span>
                <span className={`font-mono font-medium ${getColorClass(changeObj?.value)}`}>
                  {changeObj?.value ?? 'N/A'}
                </span>
              </div>
              {/* 其他非百分比指标垂直排列 - 始终显示 */}
              <div className="space-y-2">
                {/* Buy Volume (USD) 数据 */}
                <div className="flex justify-between items-center text-xs">
                  <span className="text-green-500 dark:text-green-400 font-medium font-mono">{t('buyVolumeLabel')}</span>
                  <span className="font-mono font-medium text-gray-900 dark:text-white">
                    {/* 直接显示后端提供的预格式化字符串，不做任何格式化 */}
                    {buyObj?.value ?? 'N/A'}
                  </span>
                </div>
                {/* Sell Volume (USD) 数据 */}
                <div className="flex justify-between items-center text-xs">
                  <span className="text-red-500 dark:text-red-400 font-medium font-mono">{t('sellVolumeLabel')}</span>
                  <span className="font-mono font-medium text-gray-900 dark:text-white">
                    {/* 直接显示后端提供的预格式化字符串，不做任何格式化 */}
                    {sellObj?.value ?? 'N/A'}
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

export default TradeVolumesCard; 