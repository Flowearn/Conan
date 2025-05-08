import React from 'react';
import PriceChangeCard from './PriceChangeCard';
import WalletActivityCard from './WalletActivityCard';
import TradeCountsCard from './TradeCountsCard';
import TradeVolumesCard from './TradeVolumesCard';

interface TimeFrameData {
  '30m': string | null;
  '1h': string | null;
  '2h': string | null;
  '4h': string | null;
  '8h': string | null;
  '24h': string | null;
  [key: string]: string | null; // Allow indexing with timeframe string
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

interface TimePointData {
  time: string;
  displayValue: string;
}

interface ActivityStatsOverviewProps {
  tokenAnalytics?: TokenAnalyticsData | null;
  isLoading?: boolean;
}

const ActivityStatsOverview: React.FC<ActivityStatsOverviewProps> = ({
  tokenAnalytics,
  isLoading = false
}) => {
  const timeLabels = ['30m', '1h', '2h', '4h', '8h', '24h'];

  // Process price change data
  const getPriceChangeData = (): TimePointData[] | null => {
    if (!tokenAnalytics?.priceChangePercent) return null;
    
    return timeLabels.map(timeLabel => ({
      time: timeLabel,
      displayValue: tokenAnalytics.priceChangePercent[timeLabel] || '0%'
    }));
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 px-3">
      {/* 1. Price Change Card (top left) */}
      <div>
        {getPriceChangeData() && <PriceChangeCard dataPoints={getPriceChangeData()!} />}
      </div>
      
      {/* 2. Wallet Activity Card (top right) */}
      <div>
        <WalletActivityCard 
          uniqueWalletsData={tokenAnalytics?.uniqueWallets} 
          walletChangePercentData={tokenAnalytics?.uniqueWalletsChangePercent}
          isLoading={isLoading}
        />
      </div>
      
      {/* 3. Trade Counts Card (bottom left) */}
      <div>
        <TradeCountsCard 
          buyCountData={tokenAnalytics?.buyCounts}
          sellCountData={tokenAnalytics?.sellCounts}
          tradeCountChangePercentData={tokenAnalytics?.tradeCountChangePercent}
          isLoading={isLoading}
        />
      </div>
      
      {/* 4. Trade Volumes Card (bottom right) */}
      <div>
        <TradeVolumesCard 
          buyVolumeUSDData={tokenAnalytics?.buyVolumeUSD}
          sellVolumeUSDData={tokenAnalytics?.sellVolumeUSD}
          volumeChangePercentData={tokenAnalytics?.volumeChangePercent}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};

export default ActivityStatsOverview; 