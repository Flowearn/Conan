import React from 'react';
import { useTranslations } from 'next-intl';

interface TimePointData {
  time: string;        // 例如: '30m', '1h', '2h', '4h', '8h', '24h'
  displayValue: string; // 用于直接显示的格式化字符串，例如: '-0.48%', '+2.75%'
}

interface PriceChangeCardProps {
  dataPoints: TimePointData[]; // 确保此数组包含6个时间点的数据
}

const PriceChangeCard: React.FC<PriceChangeCardProps> = ({ dataPoints }) => {
  const t = useTranslations('TokenAnalytics');
  
  // 根据数值的符号确定文本颜色
  const getColorClass = (value: string): string => {
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

  return (
    <div>
      {/* 子模块标题 */}
      <h5 className="text-xs font-medium mb-2 text-gray-700 dark:text-gray-300">
        {t('priceChangeCardTitle')}
      </h5>
      
      {/* 数据展示网格 - 3x2网格布局 */}
      <div className="grid grid-cols-3 sm:grid-cols-3 gap-2 text-xs">
        {dataPoints.map((item, index) => (
          <div 
            key={index} 
            className="flex items-center justify-between bg-indigo-50 dark:bg-indigo-900/30 px-2 py-1.5 rounded"
          >
            <span className="text-gray-600 dark:text-gray-400 font-medium font-mono">{item.time}</span>
            <span className={`font-mono font-medium ${getColorClass(item.displayValue)}`}>
              {item.displayValue}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PriceChangeCard; 