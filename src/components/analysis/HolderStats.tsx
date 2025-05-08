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
  change: number | null;
  changePercent: number | null;
}

interface SupplyItem {
  supplyPercent: string | number;
  percentage?: string | number;
}

interface HoldersByAcquisition {
  swap: number;
  transfer: number;
  airdrop: number;
  [key: string]: number;
}

interface DetailData {
  holderChange?: {
    '30m'?: { change: number | null; changePercent: number | null };
    '1h'?: { change: number | null; changePercent: number | null };
    '2h'?: { change: number | null; changePercent: number | null };
    '4h'?: { change: number | null; changePercent: number | null };
    '8h'?: { change: number | null; changePercent: number | null };
    '24h'?: { change: number | null; changePercent: number | null };
    '7d'?: { change: number | null; changePercent: number | null };
    '30d'?: { change: number | null; changePercent: number | null };
    [key: string]: { change: number | null; changePercent: number | null } | undefined;
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
      '30m'?: HolderChangeItem;
      '1h'?: HolderChangeItem;
      '2h'?: HolderChangeItem;
      '4h'?: HolderChangeItem;
      '8h'?: HolderChangeItem;
      '24h'?: HolderChangeItem;
      '7d'?: HolderChangeItem;
      '30d'?: HolderChangeItem;
      [key: string]: HolderChangeItem | undefined;
    };
    holderDistribution?: Partial<DistributionItem>;
    detail?: DetailData;
  };
  chain?: string;
}

const HolderStats: React.FC<HolderStatsProps> = ({ data, chain }) => {
  // 初始化翻译 hook
  const t = useTranslations('HolderStats');
  
  if (!data) {
    return <div className="text-xs text-gray-500">{t('noData')}</div>;
  }

  // 判断是否为BSC链数据
  const isBscData = !!(data.holderSupply?.top10 || data.detail?.holderSupply?.top10);
  
  // 如果是BSC数据，确保至少持仓比例部分能显示
  if (isBscData) {
  }

  // 计算持有者数量变化
  const calculateChange = (period: string): { change: number | null; percent: number | null } | null => {
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
    // 优先从 detail.holderSupply 获取数据
    if (detailData?.holderSupply?.[key]) {
      const supplyPercentValue = detailData.holderSupply[key]?.supplyPercent;
      
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
      
      if (supplyPercentValue !== undefined) {
        const numericValue = typeof supplyPercentValue === 'string' 
          ? parseFloat(supplyPercentValue) 
          : Number(supplyPercentValue);
        
        return { supplyPercent: isNaN(numericValue) ? 0 : numericValue };
      }
    }
    
    // 针对BSC数据的额外兼容处理
    // 检查是否有其他可能的数据格式或字段
    if (isBscData) {
      // 尝试查找可能的替代字段名称或父对象
      // 例如，某些数据可能存储为data.holderSupply.[key].percentage而不是supplyPercent
      if (data.holderSupply?.[key]?.percentage !== undefined) {
        const alternativeValue = data.holderSupply[key]?.percentage;
        const numericValue = typeof alternativeValue === 'string' 
          ? parseFloat(alternativeValue) 
          : Number(alternativeValue);
        return { supplyPercent: isNaN(numericValue) ? 0 : numericValue };
      }
      
      // 检查是否可能直接以数值形式存储
      if (typeof data.holderSupply?.[key] === 'number') {
        return { supplyPercent: data.holderSupply[key] as number };
      }
    }

    return { supplyPercent: 0 }; // Return default object with 0 to prevent errors
  };
  
  // 获取持有者分布数据
  const getHolderDistribution = (): Record<string, number> | undefined => {
    if (detailData?.holderDistribution) {
      return detailData.holderDistribution as unknown as Record<string, number>;
    }
    if (data?.holderSupply?.holderDistribution) {
      return data.holderSupply.holderDistribution as unknown as Record<string, number>;
    }
    if (data?.holderDistribution) {
      return data.holderDistribution as unknown as Record<string, number>;
    }
    return undefined;
  };

  // 格式化数字函数
  const formatNumber = (num: number | string | undefined): string => {
    if (num === undefined || num === null) return 'N/A';
    return typeof num === 'number' ? num.toLocaleString() : num;
  };

  // 获取变化百分比的样式
  const getChangeStyle = (percent: number | null | undefined): string => {
    if (percent === undefined || percent === null) return 'text-gray-500';
    return percent > 0 
      ? 'text-green-600 dark:text-green-400' 
      : percent < 0 
        ? 'text-red-600 dark:text-red-400' 
        : 'text-gray-500';
  };

  // 获取持有者分布数据
  const holderDistribution = getHolderDistribution();
  
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

  // 安全格式化百分比值
  const safeFormatPercent = (percentValue: number | null | undefined): string => {
    if (typeof percentValue !== 'number' || isNaN(percentValue)) {
      return 'N/A';
    }
    return `${percentValue > 0 ? '+' : ''}${percentValue.toFixed(2)}%`;
  };

  // 获取持有者获取方式数据
  const acquisitionData = detailData?.holdersByAcquisition;

  // 根据链类型确定要显示的时间维度
  let displayTimeframes: string[] = [];
  if (chain === 'bsc') {
    // BSC链使用24h, 7d, 30d三个时间维度
    displayTimeframes = ['24h', '7d', '30d'];
  } else {
    // Solana链或其他默认情况使用Birdeye API的6个时间维度
    displayTimeframes = ['30m', '1h', '2h', '4h', '8h', '24h'];
  }

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
                {calculateChange('24h') !== null && (
                  <div className={`text-sm ${getChangeStyle(calculateChange('24h')?.percent)}`}>
                    {(() => {
                      const changeData = calculateChange('24h');
                      const changeValue = changeData?.change;
                      const percentValue = changeData?.percent;
                      
                      // 格式化变化量（若无绝对变化值，仅显示百分比）
                      let formattedText = '';
                      
                      // 如果有绝对变化值，添加到显示中
                      if (typeof changeValue === 'number' && !isNaN(changeValue)) {
                        formattedText += `${changeValue > 0 ? '+' : ''}${formatNumber(changeValue)} `;
                      }
                        
                      // 添加百分比变化（如果有的话）
                      const formattedPercent = safeFormatPercent(percentValue);
                      if (formattedPercent !== 'N/A') {
                        formattedText += formattedText ? `(${formattedPercent})` : formattedPercent;
                      } else if (!formattedText) {
                        formattedText = 'N/A';
                      }
                        
                      return formattedText;
                    })()}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* 持有者变化 - 移到第二位 */}
        <div>
          <h5 className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">⏳ {t('holderChangeTitle')}</h5>
          <div className={`grid ${chain === 'bsc' ? 'grid-cols-3' : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-6'} gap-2 text-sm`}>
            {displayTimeframes.map((timeframe) => {
              // 检查是否有这个时间段的数据
              const changeData = calculateChange(timeframe);
              const hasData = changeData !== null && (
                changeData.change !== null || changeData.percent !== null
              );
              
              return (
                <div key={timeframe} className="flex justify-between bg-indigo-50 dark:bg-indigo-900/30 p-2 rounded">
                  <div className="text-gray-700 dark:text-gray-300">{timeframe}</div>
                  <div className={`font-mono ${getChangeStyle(changeData?.percent)}`}>
                    {hasData ? safeFormatPercent(changeData?.percent) : 'N/A'}
                  </div>
                </div>
              );
            })}
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
                {(() => {
                  const value = getHolderSupply('top10').supplyPercent;
                  return typeof value === 'number' && !isNaN(value) ? value.toFixed(2) + '%' : 'N/A';
                })()}
              </div>
            </div>
            <div className="flex justify-between bg-indigo-50 dark:bg-indigo-900/30 p-2 rounded">
              <div className="text-gray-700 dark:text-gray-300">{t('top25Label')}</div>
              <div className="font-semibold font-mono text-gray-900 dark:text-white">
                {(() => {
                  const value = getHolderSupply('top25').supplyPercent;
                  return typeof value === 'number' && !isNaN(value) ? value.toFixed(2) + '%' : 'N/A';
                })()}
              </div>
            </div>
            <div className="flex justify-between bg-indigo-50 dark:bg-indigo-900/30 p-2 rounded">
              <div className="text-gray-700 dark:text-gray-300">{t('top50Label')}</div>
              <div className="font-semibold font-mono text-gray-900 dark:text-white">
                {(() => {
                  const value = getHolderSupply('top50').supplyPercent;
                  return typeof value === 'number' && !isNaN(value) ? value.toFixed(2) + '%' : 'N/A';
                })()}
              </div>
            </div>
            <div className="flex justify-between bg-indigo-50 dark:bg-indigo-900/30 p-2 rounded">
              <div className="text-gray-700 dark:text-gray-300">{t('top100Label')}</div>
              <div className="font-semibold font-mono text-gray-900 dark:text-white">
                {(() => {
                  const value = getHolderSupply('top100').supplyPercent;
                  return typeof value === 'number' && !isNaN(value) ? value.toFixed(2) + '%' : 'N/A';
                })()}
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