import React from 'react';
import { useTranslations } from 'next-intl';

interface TimePointData {
  time: string;        // 例如: '1m', '30m', '2h', '6h', '12h', '24h'
  displayValue: string; // 用于直接显示的格式化字符串，例如: '-0.48%', '+2.75%'
}

interface PriceChangeCardProps {
  dataPoints: TimePointData[]; // 确保此数组包含6个标准时间点的数据
}

const PriceChangeCard: React.FC<PriceChangeCardProps> = ({ dataPoints }) => {
  const t = useTranslations('TokenAnalytics');
  
  // 根据数值的符号确定文本颜色
  const getColorClass = (value: string | number | null | undefined): string => {
    // 如果值为null或undefined，直接返回中性颜色
    if (value === null || value === undefined) {
      return 'text-gray-500 dark:text-gray-400';
    }
    
    // 安全地将任何输入值转换为字符串
    const stringValue = String(value);
    
    // 检查stringValue是否有includes方法（应该总是有的，因为我们调用了String()）
    if (typeof stringValue.includes !== 'function') {
      return 'text-gray-500 dark:text-gray-400'; // 类型异常，返回中性颜色
    }
    
    // 根据字符串中的符号判断颜色
    if (stringValue.includes('+')) return 'text-green-500 dark:text-green-400';
    if (stringValue.includes('-')) return 'text-red-500 dark:text-red-400';
    
    // 处理不带符号的数值 (例如"5.26%")
    // 先去掉百分比符号，然后尝试转换为数值
    const cleanValue = stringValue.replace('%', '').trim();
    const numValue = parseFloat(cleanValue);
    
    if (!isNaN(numValue)) {
      if (numValue > 0) return 'text-green-500 dark:text-green-400';
      if (numValue < 0) return 'text-red-500 dark:text-red-400';
    }
    
    // 处理"0.00%"、"0%"和"0.00"等零值情况
    if (stringValue === '0.00%' || stringValue === '0%' || stringValue === '0.00' || stringValue === '0') {
      return 'text-gray-700 dark:text-gray-300'; // 零值使用中性颜色
    }
    
    // 处理"N/A"或其他情况
    return 'text-gray-500 dark:text-gray-400';
  };

  return (
    <div>
      {/* 子模块标题 */}
      <h5 className="text-xs font-medium mb-2 text-gray-700 dark:text-gray-300">
        {t('priceChangeCardTitle')}
      </h5>
      
      {/* 数据展示网格 - 3x2网格布局，展示6个标准时间维度 */}
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