import React from 'react';
import PriceChangeCard from './PriceChangeCard';
import WalletActivityCard from './WalletActivityCard';
import TradeCountsCard from './TradeCountsCard';
import TradeVolumesCard from './TradeVolumesCard';

// 定义标准时间维度数组
const STANDARD_ACTIVITY_TIMEFRAMES = ['1m', '30m', '2h', '6h', '12h', '24h'] as const;

// 新类型定义
interface TimeFrameValueObj {
  value: string | null;
  actualTimeframe: string;
}

// 兼容所有子组件的时间帧数据类型
interface TimeFrameValues {
  '1m': TimeFrameValueObj | undefined;
  '30m': TimeFrameValueObj | undefined;
  '2h': TimeFrameValueObj | undefined;
  '6h': TimeFrameValueObj | undefined;
  '12h': TimeFrameValueObj | undefined;
  '24h': TimeFrameValueObj | undefined;
  [key: string]: TimeFrameValueObj | undefined;
}

interface TokenAnalyticsData {
  priceChangePercent: TimeFrameValues;
  uniqueWallets: TimeFrameValues;
  uniqueWalletsChangePercent: TimeFrameValues;
  buyCounts: TimeFrameValues;
  sellCounts: TimeFrameValues;
  tradeCountChangePercent: TimeFrameValues;
  buyVolumeUSD: TimeFrameValues;
  sellVolumeUSD: TimeFrameValues;
  volumeChangePercent: TimeFrameValues;
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
  // 使用标准时间维度数组
  const timeLabels = STANDARD_ACTIVITY_TIMEFRAMES;

  // 处理价格变化数据
  const getPriceChangeData = (): TimePointData[] | null => {
    if (!tokenAnalytics?.priceChangePercent) return null;
    return timeLabels.map(timeLabel => {
      const obj = tokenAnalytics.priceChangePercent[timeLabel];
      const value = obj?.value ?? '';
      const actualTimeframe = obj?.actualTimeframe ?? timeLabel;
      return {
        time: actualTimeframe,
        displayValue: value
      };
    });
  };

  // 处理钱包活动数据
  const getWalletsData = () => {
    if (!tokenAnalytics) return { wallets: {} as TimeFrameValues, change: {} as TimeFrameValues };
    const wallets: TimeFrameValues = {
      '1m': tokenAnalytics.uniqueWallets?.['1m'],
      '30m': tokenAnalytics.uniqueWallets?.['30m'],
      '2h': tokenAnalytics.uniqueWallets?.['2h'],
      '6h': tokenAnalytics.uniqueWallets?.['6h'],
      '12h': tokenAnalytics.uniqueWallets?.['12h'],
      '24h': tokenAnalytics.uniqueWallets?.['24h']
    };
    const change: TimeFrameValues = {
      '1m': tokenAnalytics.uniqueWalletsChangePercent?.['1m'],
      '30m': tokenAnalytics.uniqueWalletsChangePercent?.['30m'],
      '2h': tokenAnalytics.uniqueWalletsChangePercent?.['2h'],
      '6h': tokenAnalytics.uniqueWalletsChangePercent?.['6h'],
      '12h': tokenAnalytics.uniqueWalletsChangePercent?.['12h'],
      '24h': tokenAnalytics.uniqueWalletsChangePercent?.['24h']
    };
    return { wallets, change };
  };

  // 处理交易计数数据
  const getTradeCountsData = () => {
    if (!tokenAnalytics) return { buy: {} as TimeFrameValues, sell: {} as TimeFrameValues, change: {} as TimeFrameValues };
    const buy: TimeFrameValues = {
      '1m': tokenAnalytics.buyCounts?.['1m'],
      '30m': tokenAnalytics.buyCounts?.['30m'],
      '2h': tokenAnalytics.buyCounts?.['2h'],
      '6h': tokenAnalytics.buyCounts?.['6h'],
      '12h': tokenAnalytics.buyCounts?.['12h'],
      '24h': tokenAnalytics.buyCounts?.['24h']
    };
    const sell: TimeFrameValues = {
      '1m': tokenAnalytics.sellCounts?.['1m'],
      '30m': tokenAnalytics.sellCounts?.['30m'],
      '2h': tokenAnalytics.sellCounts?.['2h'],
      '6h': tokenAnalytics.sellCounts?.['6h'],
      '12h': tokenAnalytics.sellCounts?.['12h'],
      '24h': tokenAnalytics.sellCounts?.['24h']
    };
    const change: TimeFrameValues = {
      '1m': tokenAnalytics.tradeCountChangePercent?.['1m'],
      '30m': tokenAnalytics.tradeCountChangePercent?.['30m'],
      '2h': tokenAnalytics.tradeCountChangePercent?.['2h'],
      '6h': tokenAnalytics.tradeCountChangePercent?.['6h'],
      '12h': tokenAnalytics.tradeCountChangePercent?.['12h'],
      '24h': tokenAnalytics.tradeCountChangePercent?.['24h']
    };
    return { buy, sell, change };
  };

  // 处理交易量数据
  const getTradeVolumesData = () => {
    if (!tokenAnalytics) return { buy: {} as TimeFrameValues, sell: {} as TimeFrameValues, change: {} as TimeFrameValues };
    const buy: TimeFrameValues = {
      '1m': tokenAnalytics.buyVolumeUSD?.['1m'],
      '30m': tokenAnalytics.buyVolumeUSD?.['30m'],
      '2h': tokenAnalytics.buyVolumeUSD?.['2h'],
      '6h': tokenAnalytics.buyVolumeUSD?.['6h'],
      '12h': tokenAnalytics.buyVolumeUSD?.['12h'],
      '24h': tokenAnalytics.buyVolumeUSD?.['24h']
    };
    const sell: TimeFrameValues = {
      '1m': tokenAnalytics.sellVolumeUSD?.['1m'],
      '30m': tokenAnalytics.sellVolumeUSD?.['30m'],
      '2h': tokenAnalytics.sellVolumeUSD?.['2h'],
      '6h': tokenAnalytics.sellVolumeUSD?.['6h'],
      '12h': tokenAnalytics.sellVolumeUSD?.['12h'],
      '24h': tokenAnalytics.sellVolumeUSD?.['24h']
    };
    const change: TimeFrameValues = {
      '1m': tokenAnalytics.volumeChangePercent?.['1m'],
      '30m': tokenAnalytics.volumeChangePercent?.['30m'],
      '2h': tokenAnalytics.volumeChangePercent?.['2h'],
      '6h': tokenAnalytics.volumeChangePercent?.['6h'],
      '12h': tokenAnalytics.volumeChangePercent?.['12h'],
      '24h': tokenAnalytics.volumeChangePercent?.['24h']
    };
    return { buy, sell, change };
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
          uniqueWalletsData={getWalletsData().wallets}
          walletChangePercentData={getWalletsData().change}
          timeframes={STANDARD_ACTIVITY_TIMEFRAMES}
          isLoading={isLoading}
        />
      </div>
      
      {/* 3. Trade Counts Card (bottom left) */}
      <div>
        <TradeCountsCard 
          buyCountData={getTradeCountsData().buy}
          sellCountData={getTradeCountsData().sell}
          tradeCountChangePercentData={getTradeCountsData().change}
          timeframes={STANDARD_ACTIVITY_TIMEFRAMES}
          isLoading={isLoading}
        />
      </div>
      
      {/* 4. Trade Volumes Card (bottom right) */}
      <div>
        <TradeVolumesCard 
          buyVolumeUSDData={getTradeVolumesData().buy}
          sellVolumeUSDData={getTradeVolumesData().sell}
          volumeChangePercentData={getTradeVolumesData().change}
          timeframes={STANDARD_ACTIVITY_TIMEFRAMES}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};

export default ActivityStatsOverview; 