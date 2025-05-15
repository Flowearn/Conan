import React from 'react';
import { useTranslations } from 'next-intl';
import { safeFormatSignedPercentage } from '@/utils/formatters';
import type { TokenAnalyticsData, TimeFrameValueObj } from '@/types/token';

interface ActivityStatsTableProps {
  tokenAnalytics: TokenAnalyticsData;
  isLoading?: boolean; // 可选的加载状态prop
}

const ActivityStatsTable: React.FC<ActivityStatsTableProps> = ({ tokenAnalytics, isLoading = false }) => {
  // Use Next-intl translations
  const t = useTranslations('TokenAnalytics');
  
  // Array of timeframes to display in columns
  const timeframes = ['30m', '1h', '2h', '4h', '8h', '24h'];
  
  // Helper function to safely access time frame data
  const safeGetTimeFrameValue = (dataObj: Record<string, unknown> | null | undefined, timeframe: string): string | null => {
    // First check if the data object exists
    if (!dataObj || typeof dataObj !== 'object') {
      return null;
    }
    
    // Then check if the timeframe exists in the data object
    if (!(timeframe in dataObj)) {
      return null;
    }
    
    // Handle both old format (string | null) and new format (TimeFrameValueObj)
    const value = dataObj[timeframe];
    
    // Handle new TimeFrameValueObj format
    if (value && typeof value === 'object' && 'value' in value) {
      return (value as TimeFrameValueObj).value;
    }
    
    // Handle old string format
    return value as string | null;
  };

  // Helper function to format percentage values
  const formatPercentValue = (value: string | null | undefined, isPercentage: boolean = true): string => {
    if (isPercentage) {
      return safeFormatSignedPercentage(value, 2);
    }
    return value ?? 'N/A';
  };
  
  // Helper function to get cell color based on value (for percentage changes)
  const getPercentageColorFromString = (value: string | null | undefined): string => {
    if (!value || value === 'N/A' || value === '') {
      return '';
    }
    // 检查字符串是否包含负号来确定颜色
    return value.includes('-') 
      ? 'text-red-600 dark:text-red-400' 
      : value === '0.00%' || value === '0%'
        ? ''
        : 'text-green-600 dark:text-green-400';
  };
  
  // 如果数据正在加载或tokenAnalytics为空，显示加载状态
  if (isLoading || !tokenAnalytics) {
    return (
      <div className="min-h-[200px] flex items-center justify-center">
        <p className="text-gray-500 dark:text-gray-400">{isLoading ? t('loading') || 'Loading...' : t('noDataAvailable') || 'No data available'}</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="bg-gray-100 dark:bg-gray-800 border-b dark:border-gray-700">
            <th className="px-4 py-2 text-left font-medium text-gray-600 dark:text-gray-300">
              {t('indicator') || 'Indicator'}
            </th>
            {timeframes.map(timeframe => (
              <th 
                key={timeframe} 
                className="px-4 py-2 text-right font-medium text-gray-600 dark:text-gray-300"
              >
                {timeframe}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {/* Price change row */}
          <tr className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
            <td className="px-4 py-2 text-left font-medium text-gray-700 dark:text-gray-300">
              {t('priceChangePercent') || 'Price Change (%)'}
            </td>
            {timeframes.map(timeframe => {
              const value = safeGetTimeFrameValue(tokenAnalytics.priceChangePercent, timeframe);
              const formattedValue = formatPercentValue(value);
              return (
                <td 
                  key={timeframe} 
                  className={`px-4 py-2 text-right ${getPercentageColorFromString(formattedValue)}`}
                >
                  {formattedValue}
                </td>
              );
            })}
          </tr>
          
          {/* Unique wallets row */}
          <tr className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
            <td className="px-4 py-2 text-left font-medium text-gray-700 dark:text-gray-300">
              {t('uniqueWallets') || 'Unique Wallets'}
            </td>
            {timeframes.map(timeframe => {
              const value = safeGetTimeFrameValue(tokenAnalytics.uniqueWallets, timeframe);
              return (
                <td 
                  key={timeframe} 
                  className="px-4 py-2 text-right text-gray-700 dark:text-gray-300"
                >
                  {value ?? 'N/A'}
                </td>
              );
            })}
          </tr>
          
          {/* Unique wallets change row */}
          <tr className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
            <td className="px-4 py-2 text-left font-medium text-gray-700 dark:text-gray-300">
              {t('uniqueWalletsChangePercent') || 'Wallets Change (%)'}
            </td>
            {timeframes.map(timeframe => {
              const value = safeGetTimeFrameValue(tokenAnalytics.uniqueWalletsChangePercent, timeframe);
              const formattedValue = formatPercentValue(value);
              return (
                <td 
                  key={timeframe} 
                  className={`px-4 py-2 text-right ${getPercentageColorFromString(formattedValue)}`}
                >
                  {formattedValue}
                </td>
              );
            })}
          </tr>
          
          {/* Buy counts row */}
          <tr className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
            <td className="px-4 py-2 text-left font-medium text-gray-700 dark:text-gray-300">
              {t('buyCounts') || 'Buy Count'}
            </td>
            {timeframes.map(timeframe => {
              const value = safeGetTimeFrameValue(tokenAnalytics.buyCounts, timeframe);
              return (
                <td 
                  key={timeframe} 
                  className="px-4 py-2 text-right text-gray-700 dark:text-gray-300"
                >
                  {value ?? 'N/A'}
                </td>
              );
            })}
          </tr>
          
          {/* Sell counts row */}
          <tr className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
            <td className="px-4 py-2 text-left font-medium text-gray-700 dark:text-gray-300">
              {t('sellCounts') || 'Sell Count'}
            </td>
            {timeframes.map(timeframe => {
              const value = safeGetTimeFrameValue(tokenAnalytics.sellCounts, timeframe);
              return (
                <td 
                  key={timeframe} 
                  className="px-4 py-2 text-right text-gray-700 dark:text-gray-300"
                >
                  {value ?? 'N/A'}
                </td>
              );
            })}
          </tr>
          
          {/* Trade count change row */}
          <tr className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
            <td className="px-4 py-2 text-left font-medium text-gray-700 dark:text-gray-300">
              {t('tradeCountChangePercent') || 'Trade Count Change (%)'}
            </td>
            {timeframes.map(timeframe => {
              const value = safeGetTimeFrameValue(tokenAnalytics.tradeCountChangePercent, timeframe);
              const formattedValue = formatPercentValue(value);
              return (
                <td 
                  key={timeframe} 
                  className={`px-4 py-2 text-right ${getPercentageColorFromString(formattedValue)}`}
                >
                  {formattedValue}
                </td>
              );
            })}
          </tr>
          
          {/* Buy volume row */}
          <tr className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
            <td className="px-4 py-2 text-left font-medium text-gray-700 dark:text-gray-300">
              {t('buyVolumeUSD') || 'Buy Volume (USD)'}
            </td>
            {timeframes.map(timeframe => {
              const value = safeGetTimeFrameValue(tokenAnalytics.buyVolumeUSD, timeframe);
              return (
                <td 
                  key={timeframe} 
                  className="px-4 py-2 text-right text-gray-700 dark:text-gray-300"
                >
                  {value ?? 'N/A'}
                </td>
              );
            })}
          </tr>
          
          {/* Sell volume row */}
          <tr className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
            <td className="px-4 py-2 text-left font-medium text-gray-700 dark:text-gray-300">
              {t('sellVolumeUSD') || 'Sell Volume (USD)'}
            </td>
            {timeframes.map(timeframe => {
              const value = safeGetTimeFrameValue(tokenAnalytics.sellVolumeUSD, timeframe);
              return (
                <td 
                  key={timeframe} 
                  className="px-4 py-2 text-right text-gray-700 dark:text-gray-300"
                >
                  {value ?? 'N/A'}
                </td>
              );
            })}
          </tr>
          
          {/* Volume change row */}
          <tr className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
            <td className="px-4 py-2 text-left font-medium text-gray-700 dark:text-gray-300">
              {t('volumeChangePercent') || 'Volume Change (%)'}
            </td>
            {timeframes.map(timeframe => {
              const value = safeGetTimeFrameValue(tokenAnalytics.volumeChangePercent, timeframe);
              const formattedValue = formatPercentValue(value);
              return (
                <td 
                  key={timeframe} 
                  className={`px-4 py-2 text-right ${getPercentageColorFromString(formattedValue)}`}
                >
                  {formattedValue}
                </td>
              );
            })}
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default ActivityStatsTable; 