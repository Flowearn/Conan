import React from 'react';
import { useTranslations } from 'next-intl';

interface DistributionItem {
  whales?: number;
  sharks?: number;
  dolphins?: number;
  fish?: number;
  octopus?: number;
  crab?: number;
  shrimps?: number;
  [key: string]: number | undefined;
}

interface HolderChangeItem {
  change: number;
  changePercent: number;
}

interface SupplyItem {
  supplyPercent: string | number;
}

interface HoldersByAcquisition {
  swap: number;
  transfer: number;
  airdrop: number;
  [key: string]: number;
}

interface DetailData {
  holderChange?: {
    '24h'?: { change: number; changePercent: number };
    '7d'?: { change: number; changePercent: number };
    '30d'?: { change: number; changePercent: number };
    [key: string]: { change: number; changePercent: number } | undefined;
  };
  holderSupply?: {
    top10?: { supplyPercent: string | number };
    top25?: { supplyPercent: string | number };
    top50?: { supplyPercent: string | number };
    top100?: { supplyPercent: string | number };
    [key: string]: { supplyPercent: string | number } | undefined;
  };
  holderDistribution?: Partial<DistributionItem>;
  totalHolders?: string | number;
  holdersByAcquisition?: HoldersByAcquisition;
}

interface HolderStatsProps {
  data?: {
    totalHolders: string | number;
    holderSupply?: {
      top10?: SupplyItem;
      top25?: SupplyItem;
      top50?: SupplyItem;
      top100?: SupplyItem;
      [key: string]: SupplyItem | undefined;
    };
    holderChange?: {
      '24h'?: HolderChangeItem;
      '7d'?: HolderChangeItem;
      '30d'?: HolderChangeItem;
      [key: string]: HolderChangeItem | undefined;
    };
    holderDistribution?: Partial<DistributionItem>;
    detail?: DetailData;
  };
}

const HolderStats: React.FC<HolderStatsProps> = ({ data }) => {
  // 初始化翻译 hook
  const t = useTranslations('HolderStats');
  
  // Add debug logs to track data structure
  console.log('HolderStats received data:', data);
  console.log('holderSupply structure:', data?.holderSupply);
  
  if (!data) {
    console.log('No data provided to HolderStats component');
    return <div className="text-xs text-gray-500">{t('noData')}</div>;
  }

  // 计算持有者数量变化
  const calculateChange = (period: string): { change: number; percent: number } | null => {
    // 优先从 detail.holderChange 获取数据
    if (data.detail?.holderChange?.[period]) {
      return {
        change: data.detail.holderChange[period]!.change,
        percent: data.detail.holderChange[period]!.changePercent
      };
    }

    // 如果没有，尝试从顶层 holderChange 获取数据
    if (data.holderChange?.[period]) {
      return {
        change: data.holderChange[period]!.change,
        percent: data.holderChange[period]!.changePercent
      };
    }

    return null;
  };

  // 获取持有者总数
  const totalHolders = data.detail?.totalHolders || data.totalHolders;

  // 计算持有者获取方式占比的总和
  const holdersByAcquisition = data.detail?.holdersByAcquisition;
  const totalAcquisition = holdersByAcquisition ? 
    Object.values(holdersByAcquisition).reduce((sum, val) => sum + val, 0) : 0;

  // 从 detail 获取数据，如果有的话
  const detailData = data.detail;
  
  // 获取持有者供应占比数据
  const getHolderSupply = (key: string): { supplyPercent: number } => {
    console.log(`Attempting to get holderSupply for key: ${key}`);
    
    // 优先从 detail.holderSupply 获取数据
    if (detailData?.holderSupply?.[key]) {
      const supplyPercentValue = detailData.holderSupply[key]?.supplyPercent;
      console.log(`From detail.holderSupply[${key}]:`, supplyPercentValue);
      
      if (supplyPercentValue !== undefined) {
        const numericValue = typeof supplyPercentValue === 'string' 
          ? parseFloat(supplyPercentValue) 
          : Number(supplyPercentValue);
        
        return { supplyPercent: isNaN(numericValue) ? 0 : numericValue };
      }
    }

    // 如果没有，尝试从 holderSupply 获取数据
    if (data.holderSupply?.[key]) {
      const supplyPercentValue = data.holderSupply[key]?.supplyPercent;
      console.log(`From data.holderSupply[${key}]:`, supplyPercentValue);
      
      if (supplyPercentValue !== undefined) {
        const numericValue = typeof supplyPercentValue === 'string' 
          ? parseFloat(supplyPercentValue) 
          : Number(supplyPercentValue);
        
        return { supplyPercent: isNaN(numericValue) ? 0 : numericValue };
      }
    }

    console.log(`No valid data found for ${key}, returning default value`);
    return { supplyPercent: 0 }; // Return default object with 0 to prevent errors
  };
  
  // 获取持有者分布数据
  const getHolderDistribution = (): Record<string, number> | undefined => {
    console.log('Getting holder distribution from:');
    if (detailData?.holderDistribution) {
      console.log('- detailData.holderDistribution');
      return detailData.holderDistribution as unknown as Record<string, number>;
    }
    if (data?.holderSupply?.holderDistribution) {
      console.log('- data.holderSupply.holderDistribution');
      return data.holderSupply.holderDistribution as unknown as Record<string, number>;
    }
    if (data?.holderDistribution) {
      console.log('- data.holderDistribution');
      return data.holderDistribution as unknown as Record<string, number>;
    }
    console.log('No holder distribution data found');
    return undefined;
  };

  // 格式化数字函数
  const formatNumber = (num: number | string | undefined): string => {
    if (num === undefined || num === null) return 'N/A';
    return typeof num === 'number' ? num.toLocaleString() : num;
  };

  // 获取变化百分比的样式
  const getChangeStyle = (percent: number | undefined): string => {
    if (percent === undefined) return 'text-gray-500';
    return percent > 0 
      ? 'text-green-600 dark:text-green-400' 
      : percent < 0 
        ? 'text-red-600 dark:text-red-400' 
        : 'text-gray-500';
  };

  // 获取持有者分布数据
  const holderDistribution = getHolderDistribution();
  console.log('Holder distribution data:', holderDistribution);
  
  // 检查是否有任何有效的分布数据
  const hasDistributionData = holderDistribution && Object.keys(holderDistribution).length > 0;

  // 安全获取数值函数
  const safeGetNumber = (obj: Record<string, unknown> | undefined, key: string): number => {
    if (!obj) return 0;
    const value = obj[key];
    if (typeof value === 'number') return value;
    return 0;
  };

  // 计算合并后的持有者分布数据
  const combinedWhales = safeGetNumber(holderDistribution, 'whales') + safeGetNumber(holderDistribution, 'sharks');
  const combinedDolphins = safeGetNumber(holderDistribution, 'dolphins') + safeGetNumber(holderDistribution, 'fish') + safeGetNumber(holderDistribution, 'octopus');
  const combinedShrimps = safeGetNumber(holderDistribution, 'crab') + safeGetNumber(holderDistribution, 'shrimps');

  const combinedDistributionData = [
    { label: t('distWhales'), value: combinedWhales, key: 'whales' },
    { label: t('distDolphins'), value: combinedDolphins, key: 'dolphins' },
    { label: t('distShrimps'), value: combinedShrimps, key: 'shrimps' },
  ];

  const formatDistributionValue = (value: number | undefined) => {
    if (typeof value === 'number') {
      return formatNumber(value);
    }
    return 'N/A';
  };

  // 获取持有者获取方式数据
  const acquisitionData = detailData?.holdersByAcquisition;

  return (
    <div className="mt-4 space-y-4">
      {/* 主要网格容器 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 持有者数量 - 保持在第一位 */}
        <div>
          <h5 className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">{t('holderCountTitle')}</h5>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm px-2 py-4">
            <div className="flex items-baseline">
              <div className="text-sm font-semibold font-mono text-gray-900 dark:text-white">
                {formatNumber(totalHolders)}
              </div>
              <div className="ml-2">
                {/* 24h 变化 */}
                {calculateChange('24h') && (
                  <div className={`text-sm ${getChangeStyle(calculateChange('24h')?.percent)}`}>
                    {(calculateChange('24h')?.change ?? 0) > 0 ? '+' : ''}
                    {formatNumber(calculateChange('24h')?.change ?? 0)} ({(calculateChange('24h')?.percent ?? 0) > 0 ? '+' : ''}
                    {calculateChange('24h')?.percent?.toFixed(2) ?? 'N/A'}%)
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* 持有者变化 - 移到第二位 */}
        <div>
          <h5 className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">⏳ {t('holderChangeTitle')}</h5>
          <div className="grid grid-cols-3 gap-2 text-sm">
            <div className="flex justify-between bg-indigo-50 dark:bg-indigo-900/30 p-2 rounded">
              <div className="text-gray-700 dark:text-gray-300">{t('h24')}</div>
              <div className={`font-mono ${getChangeStyle(calculateChange('24h')?.percent)}`}>
                {calculateChange('24h')?.percent !== undefined
                  ? `${calculateChange('24h')!.percent > 0 ? '+' : ''}${calculateChange('24h')!.percent.toFixed(2)}%`
                  : 'N/A'}
              </div>
            </div>
            <div className="flex justify-between bg-indigo-50 dark:bg-indigo-900/30 p-2 rounded">
              <div className="text-gray-700 dark:text-gray-300">{t('d7')}</div>
              <div className={`font-mono ${getChangeStyle(calculateChange('7d')?.percent)}`}>
                {calculateChange('7d')?.percent !== undefined
                  ? `${calculateChange('7d')!.percent > 0 ? '+' : ''}${calculateChange('7d')!.percent.toFixed(2)}%`
                  : 'N/A'}
              </div>
            </div>
            <div className="flex justify-between bg-indigo-50 dark:bg-indigo-900/30 p-2 rounded">
              <div className="text-gray-700 dark:text-gray-300">{t('d30')}</div>
              <div className={`font-mono ${getChangeStyle(calculateChange('30d')?.percent)}`}>
                {calculateChange('30d')?.percent !== undefined
                  ? `${calculateChange('30d')!.percent > 0 ? '+' : ''}${calculateChange('30d')!.percent.toFixed(2)}%`
                  : 'N/A'}
              </div>
            </div>
          </div>
        </div>

        {/* 持有者分布 - 移到第三位 (第一列第二行) */}
        {hasDistributionData && (
          <div>
            <h5 className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">{t('holderDistributionTitle')}</h5>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm">
              {combinedDistributionData.map((item) => {
                // 只显示有效的数值
                if (item.value > 0) {
                  return (
                    <div key={item.key} className="flex justify-between bg-indigo-50 dark:bg-indigo-900/30 p-2 rounded">
                      <div className="text-gray-700 dark:text-gray-300">
                        {item.label}
                      </div>
                      <div className="font-semibold font-mono text-gray-900 dark:text-white">
                        {formatDistributionValue(item.value)}
                      </div>
                    </div>
                  );
                }
                return null;
              })}
            </div>
          </div>
        )}

        {/* 持仓占比 - 移到第四位 (第二列第二行) */}
        <div>
          <h5 className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">{t('holdingsRatioTitle')}</h5>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex justify-between bg-indigo-50 dark:bg-indigo-900/30 p-2 rounded">
              <div className="text-gray-700 dark:text-gray-300">{t('top10Label')}</div>
              <div className="font-semibold font-mono text-gray-900 dark:text-white">
                {(getHolderSupply('top10').supplyPercent ?? 0).toFixed(2)}%
              </div>
            </div>
            <div className="flex justify-between bg-indigo-50 dark:bg-indigo-900/30 p-2 rounded">
              <div className="text-gray-700 dark:text-gray-300">{t('top25Label')}</div>
              <div className="font-semibold font-mono text-gray-900 dark:text-white">
                {(getHolderSupply('top25').supplyPercent ?? 0).toFixed(2)}%
              </div>
            </div>
            <div className="flex justify-between bg-indigo-50 dark:bg-indigo-900/30 p-2 rounded">
              <div className="text-gray-700 dark:text-gray-300">{t('top50Label')}</div>
              <div className="font-semibold font-mono text-gray-900 dark:text-white">
                {(getHolderSupply('top50').supplyPercent ?? 0).toFixed(2)}%
              </div>
            </div>
            <div className="flex justify-between bg-indigo-50 dark:bg-indigo-900/30 p-2 rounded">
              <div className="text-gray-700 dark:text-gray-300">{t('top100Label')}</div>
              <div className="font-semibold font-mono text-gray-900 dark:text-white">
                {(getHolderSupply('top100').supplyPercent ?? 0).toFixed(2)}%
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 持有者获取方式 - 保持在网格外部 */}
      {acquisitionData && totalAcquisition > 0 && (
        <div className="mt-4">
          <h5 className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">{t('acquisitionMethodTitle')}</h5>
          <div className="grid grid-cols-3 gap-2 text-sm">
            <div className="flex flex-col bg-indigo-50 dark:bg-indigo-900/30 p-2 rounded">
              <div className="text-gray-700 dark:text-gray-300">{t('acqSwap')}</div>
              <div className="font-semibold text-gray-900 dark:text-white">
                <span className="font-mono">{formatNumber(acquisitionData.swap)}</span>
                <span className="text-sm text-gray-500 ml-1 font-mono">
                  ({((acquisitionData.swap / totalAcquisition) * 100).toFixed(1)}%)
                </span>
              </div>
            </div>
            <div className="flex flex-col bg-indigo-50 dark:bg-indigo-900/30 p-2 rounded">
              <div className="text-gray-700 dark:text-gray-300">{t('acqTransfer')}</div>
              <div className="font-semibold text-gray-900 dark:text-white">
                <span className="font-mono">{formatNumber(acquisitionData.transfer)}</span>
                <span className="text-sm text-gray-500 ml-1 font-mono">
                  ({((acquisitionData.transfer / totalAcquisition) * 100).toFixed(1)}%)
                </span>
              </div>
            </div>
            <div className="flex flex-col bg-indigo-50 dark:bg-indigo-900/30 p-2 rounded">
              <div className="text-gray-700 dark:text-gray-300">{t('acqAirdrop')}</div>
              <div className="font-semibold text-gray-900 dark:text-white">
                <span className="font-mono">{formatNumber(acquisitionData.airdrop)}</span>
                <span className="text-sm text-gray-500 ml-1 font-mono">
                  ({((acquisitionData.airdrop / totalAcquisition) * 100).toFixed(1)}%)
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HolderStats; 