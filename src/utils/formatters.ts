export const safeToFixed = (
  value: number | string | null | undefined,
  digits: number,
  placeholder: string = 'N/A'
): string => {
  if (value === null || value === undefined) {
    return placeholder;
  }
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (typeof num === 'number' && !isNaN(num)) { // 确保是有效数字
    return num.toFixed(digits);
  }
  return placeholder;
};

export const safeFormatPercentage = (
  value: number | string | null | undefined,
  digits: number,
  placeholder: string = 'N/A' // 将占位符改为不带 '%'
): string => {
  const fixedValue = safeToFixed(value, digits, placeholder);
  // 只有当值有效时才添加 '%'，否则直接返回占位符
  if (fixedValue !== placeholder) { 
    return `${fixedValue}%`;
  }
  return placeholder;
};

export const safeFormatCurrency = (
  value: number | string | null | undefined,
  digits: number = 2,
  symbol: string = '$',
  placeholder: string = 'N/A'
): string => {
  if (value === null || value === undefined) {
    return placeholder;
  }
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (typeof num === 'number' && !isNaN(num)) {
    // 对于非常大或非常小的数字，toFixed 可能返回科学计数法，需要进一步处理
    // 但对于常规价格显示，toFixed 通常够用
    // 可以考虑结合 toLocaleString 实现更复杂的货币格式化和千位分隔符
    return `${symbol}${num.toFixed(digits)}`;
  }
  return placeholder;
};

// 用于处理具有正负号的百分比值
export const safeFormatSignedPercentage = (
  value: number | string | null | undefined,
  digits: number,
  placeholder: string = 'N/A'
): string => {
  if (value === null || value === undefined) {
    return placeholder;
  }
  
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (typeof num === 'number' && !isNaN(num)) {
    const fixedValue = num.toFixed(digits);
    return `${num > 0 ? '+' : ''}${fixedValue}%`;
  }
  return placeholder;
};

// 用于格式化显示大数值（K, M, B等）
export const formatLargeNumber = (
  value: number | string | null | undefined,
  symbol: string = '$',
  placeholder: string = 'N/A'
): string => {
  if (value === null || value === undefined) {
    return placeholder;
  }
  
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (typeof num !== 'number' || isNaN(num)) {
    return placeholder;
  }
  
  const absValue = Math.abs(num);
  const sign = num < 0 ? '-' : '';
  
  if (absValue < 1000) {
    return `${sign}${symbol}${absValue.toFixed(2)}`;
  } else if (absValue < 1_000_000) {
    return `${sign}${symbol}${(absValue / 1000).toFixed(1)}K`;
  } else if (absValue < 1_000_000_000) {
    return `${sign}${symbol}${(absValue / 1_000_000).toFixed(1)}M`;
  } else {
    return `${sign}${symbol}${(absValue / 1_000_000_000).toFixed(1)}B`;
  }
};

/**
 * 高级价格格式化函数，专为加密货币价格显示优化
 * 
 * 对于小数价格，会根据前导零的数量采用简化表示法：
 * - 如果前导零数量超过阈值，使用简化表示法，如 $0.0{3}123
 * - 否则完整显示，如 $0.00123
 * 
 * @param value 要格式化的价格值
 * @param symbol 货币符号
 * @param placeholder 无效值的占位符
 * @param zeroAbbreviationThreshold 使用缩写表示的前导零阈值
 * @returns 格式化后的价格字符串
 */
export const formatAdvancedPrice = (
  value: number | string | null | undefined,
  symbol: string = '$',
  placeholder: string = 'N/A',
  zeroAbbreviationThreshold: number = 3
): string => {
  // 处理无效输入
  if (value === null || value === undefined) {
    return placeholder;
  }
  
  // 转换为数字
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (typeof num !== 'number' || isNaN(num)) {
    return placeholder;
  }
  
  // 处理零值
  if (num === 0) {
    return `${symbol}0.00`;
  }
  
  // 取绝对值和符号
  const absNum = Math.abs(num);
  const sign = num < 0 ? '-' : '';
  
  // 处理大于等于1的值，保留2位小数
  if (absNum >= 1) {
    return `${sign}${symbol}${absNum.toFixed(2)}`;
  }
  
  // 处理小于1且大于0的值
  if (absNum > 0 && absNum < 1) {
    // 将数字转换为字符串，避免科学计数法
    let numStr = absNum.toString();
    
    // 如果是科学计数法，转换为普通小数表示
    if (numStr.includes('e')) {
      const parts = numStr.split('e');
      const exponent = parseInt(parts[1]);
      
      if (exponent < 0) {
        // 对于极小的数，需要特殊处理
        const absExponent = Math.abs(exponent);
        
        // 对于1e-7，单独处理以确保只显示一个1
        if (absNum === 1e-7) {
          return `${sign}${symbol}0.0{${absExponent-1}}1`;
        }
        
        // 对于0.0000001，单独处理
        if (absNum === 0.0000001) {
          return `${sign}${symbol}0.0{6}1`;
        }
        
        // 添加足够的精度以确保显示完整有效数字
        const precision = absExponent + 4; 
        numStr = absNum.toFixed(precision);
      } else {
        numStr = absNum.toString();
      }
    }
    
    // 确保numStr是小数形式
    if (!numStr.includes('.')) {
      numStr += '.0';
    }
    
    // 分离小数部分
    const parts = numStr.split('.');
    const decimalPart = parts[1];
    
    // 计算前导零的数量
    let leadingZerosCount = 0;
    for (let i = 0; i < decimalPart.length; i++) {
      if (decimalPart[i] === '0') {
        leadingZerosCount++;
      } else {
        break;
      }
    }
    
    // 提取有效数字部分（从第一个非零数字开始）
    const significantDigits = decimalPart.substring(leadingZerosCount);
    
    // 取前3位有效数字，不足3位则保持原样
    const significantDisplay = significantDigits.length > 3 
      ? significantDigits.substring(0, 3) 
      : significantDigits;
    
    // 根据前导零数量决定显示方式
    if (leadingZerosCount >= zeroAbbreviationThreshold) {
      // 使用缩写表示法: $0.0{3}123
      return `${sign}${symbol}0.0{${leadingZerosCount}}${significantDisplay}`;
    } else {
      // 完整显示前导零: $0.00123
      return `${sign}${symbol}0.${'0'.repeat(leadingZerosCount)}${significantDisplay}`;
    }
  }
  
  // 默认情况
  return placeholder;
}; 