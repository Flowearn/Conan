import React from 'react';
import { useTranslations } from 'next-intl';

interface TimeFrameValues {
  '30m': string | null; 
  '1h': string | null; 
  '2h': string | null; 
  '4h': string | null; 
  '8h': string | null; 
  '24h': string | null;
  [key: string]: string | null; // 添加索引签名以支持动态访问
}

interface WalletActivityCardProps {
  uniqueWalletsData?: TimeFrameValues | null;     // "Unique Wallets" 的时间序列数据
  walletChangePercentData?: TimeFrameValues | null; // "Wallet Change (%)" 的时间序列数据
  isLoading?: boolean;                             // 可选的加载状态
}

const WalletActivityCard: React.FC<WalletActivityCardProps> = ({
  uniqueWalletsData,
  walletChangePercentData,
  isLoading = false
}) => {
  const t = useTranslations('TokenAnalytics');
  
  // 检查是否有数据可显示
  const hasData = uniqueWalletsData || walletChangePercentData;

  // 根据百分比值的符号确定文本颜色
  const getColorClass = (value: string | null): string => {
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

  // 时间标签数组
  const timeLabels = ['30m', '1h', '2h', '4h', '8h', '24h'];

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <h5 className="text-xs font-medium mb-2 text-gray-700 dark:text-gray-300">
          {t('walletActivityCardTitle')}
        </h5>
        <div className="grid grid-cols-3 sm:grid-cols-3 gap-2">
          {timeLabels.map((time) => (
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
        {timeLabels.map((time) => (
          <div 
            key={time} 
            className="bg-indigo-50 dark:bg-indigo-900/30 px-2 py-1.5 rounded"
          >
            {/* 时间标签和百分比变化 */}
            <div className="flex justify-between items-baseline mb-2">
              <span className="text-gray-700 dark:text-gray-300 font-medium font-mono">{time}</span>
              {walletChangePercentData && walletChangePercentData[time] && (
                <span className={`font-mono font-medium ${getColorClass(walletChangePercentData[time])}`}>
                  {walletChangePercentData[time]}
                </span>
              )}
            </div>
            
            {/* 数据显示区域，其他非百分比指标 */}
            <div className="space-y-2">
              {/* 独立钱包数据 */}
              {uniqueWalletsData && uniqueWalletsData[time] && (
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-700 dark:text-gray-400 font-medium font-mono">{t('walletCountLabel')}</span>
                  <span className="font-mono font-medium text-gray-900 dark:text-white">
                    {uniqueWalletsData[time]}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WalletActivityCard; 