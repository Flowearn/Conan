import React from 'react';
import { useTranslations } from 'next-intl';
import { formatLargeNumber } from '@/utils/formatters';

// Define the interface for raw analytics data
interface RawAnalyticsData {
  totalBuyers: Record<string, number>;
  totalSellers: Record<string, number>;
  totalBuys: Record<string, number>;
  totalSells: Record<string, number>;
  totalBuyVolume: Record<string, number>;
  totalSellVolume: Record<string, number>;
  [key: string]: unknown;
}

interface TokenAnalyticsProps {
  data?: {
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
  } | null;
}

const timeFrames = ['24h', '6h', '1h', '5m'] as const;

const TokenAnalytics: React.FC<TokenAnalyticsProps> = ({ data }) => {
  const t = useTranslations('TokenAnalytics');
  
  if (!data) {
    return null;
  }

  // Add detailed logs, print the complete data prop
  console.log('[DEBUG] TokenAnalytics received data prop:', JSON.stringify(data, null, 2));

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 sm:p-6">
      <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">📈 {t('recentTradingActivity')}</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Trading Volume Block */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <h4 className="text-base font-medium mb-3 text-gray-700 dark:text-gray-300">{t('tradingVolumeUSD')}</h4>
          <div className="space-y-4">
            {/* Header row - using grid layout */}
            <div className="grid grid-cols-3 gap-x-4">
              <div className="text-sm font-semibold text-gray-600 dark:text-gray-400 border-b dark:border-gray-600 pb-1">
                {t('timeframe')}
              </div>
              <div className="text-sm font-semibold text-green-600 dark:text-green-400 text-right border-b dark:border-gray-600 pb-1">
                {t('buy')}
              </div>
              <div className="text-sm font-semibold text-red-600 dark:text-red-400 text-right border-b dark:border-gray-600 pb-1">
                {t('sell')}
              </div>
            </div>
            
            {/* Data rows */}
            {timeFrames.map((timeFrame) => {
              // Get buy volume and format it
              const rawBuyVolume = data.data?.rawData?.totalBuyVolume?.[timeFrame];
              console.log(`[DEBUG] Formatting Buy Volume for ${timeFrame}: Input =`, rawBuyVolume, `(Type: ${typeof rawBuyVolume})`);
              const formattedBuyVolume = formatLargeNumber(rawBuyVolume, '$', '$0');
              console.log(`[DEBUG] Formatting Buy Volume for ${timeFrame}: Output =`, formattedBuyVolume);
              
              // Get sell volume and format it
              const rawSellVolume = data.data?.rawData?.totalSellVolume?.[timeFrame];
              console.log(`[DEBUG] Formatting Sell Volume for ${timeFrame}: Input =`, rawSellVolume, `(Type: ${typeof rawSellVolume})`);
              const formattedSellVolume = formatLargeNumber(rawSellVolume, '$', '$0');
              console.log(`[DEBUG] Formatting Sell Volume for ${timeFrame}: Output =`, formattedSellVolume);
              
              return (
                <div key={`volume-${timeFrame}`} className="grid grid-cols-3 gap-x-4">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {timeFrame}
                  </div>
                  <div className="text-sm font-mono text-green-600 dark:text-green-400 text-right">
                    {formattedBuyVolume}
                  </div>
                  <div className="text-sm font-mono text-red-600 dark:text-red-400 text-right">
                    {formattedSellVolume}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Buyer/Seller Count Block */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <h4 className="text-base font-medium mb-3 text-gray-700 dark:text-gray-300">{t('buyerSellerCount')}</h4>
          <div className="space-y-4">
            {/* Header row - using grid layout */}
            <div className="grid grid-cols-3 gap-x-4">
              <div className="text-sm font-semibold text-gray-600 dark:text-gray-400 border-b dark:border-gray-600 pb-1">
                {t('timeframe')}
              </div>
              <div className="text-sm font-semibold text-green-600 dark:text-green-400 text-right border-b dark:border-gray-600 pb-1">
                {t('buyers')}
              </div>
              <div className="text-sm font-semibold text-red-600 dark:text-red-400 text-right border-b dark:border-gray-600 pb-1">
                {t('sellers')}
              </div>
            </div>
            
            {/* Data rows */}
            {timeFrames.map((timeFrame) => {
              // Get buyer and seller counts
              const buyers = data.data?.totalBuyers?.[timeFrame] ?? 'N/A';
              const sellers = data.data?.totalSellers?.[timeFrame] ?? 'N/A';
              
              console.log(`[DEBUG] Buyers/Sellers for ${timeFrame}:`, { buyers, sellers });
              
              return (
                <div key={`users-${timeFrame}`} className="grid grid-cols-3 gap-x-4">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {timeFrame}
                  </div>
                  <div className="text-sm font-mono text-green-600 dark:text-green-400 text-right">
                    {buyers}
                  </div>
                  <div className="text-sm font-mono text-red-600 dark:text-red-400 text-right">
                    {sellers}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Order Count Block */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <h4 className="text-base font-medium mb-3 text-gray-700 dark:text-gray-300">{t('orderCount')}</h4>
          <div className="space-y-4">
            {/* Header row - using grid layout */}
            <div className="grid grid-cols-3 gap-x-4">
              <div className="text-sm font-semibold text-gray-600 dark:text-gray-400 border-b dark:border-gray-600 pb-1">
                {t('timeframe')}
              </div>
              <div className="text-sm font-semibold text-green-600 dark:text-green-400 text-right border-b dark:border-gray-600 pb-1">
                {t('buyOrders')}
              </div>
              <div className="text-sm font-semibold text-red-600 dark:text-red-400 text-right border-b dark:border-gray-600 pb-1">
                {t('sellOrders')}
              </div>
            </div>
            
            {/* Data rows */}
            {timeFrames.map((timeFrame) => {
              // Get buy and sell order counts
              const buys = data.data?.totalBuys?.[timeFrame] ?? 'N/A';
              const sells = data.data?.totalSells?.[timeFrame] ?? 'N/A';
              
              console.log(`[DEBUG] Buy/Sell Orders for ${timeFrame}:`, { buys, sells });
              
              return (
                <div key={`orders-${timeFrame}`} className="grid grid-cols-3 gap-x-4">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {timeFrame}
                  </div>
                  <div className="text-sm font-mono text-green-600 dark:text-green-400 text-right">
                    {buys}
                  </div>
                  <div className="text-sm font-mono text-red-600 dark:text-red-400 text-right">
                    {sells}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      
      <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
        <p>{t('dataDisclaimer')}</p>
      </div>
    </div>
  );
};

export default TokenAnalytics; 