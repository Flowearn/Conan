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
  
  // 处理大于等于1的值，保留2位小数
  if (num >= 1) {
    return `${symbol}${num.toFixed(2)}`;
  }
  
  // 处理小于1且大于0的值
  if (num > 0 && num < 1) {
    // 使用高精度表示转换为字符串，避免科学计数法
    let numStr = num.toPrecision(15).toString();
    
    // 如果是科学计数法，转换为普通小数表示
    if (numStr.includes('e')) {
      const parts = numStr.split('e');
      const base = parts[0].replace('.', '');
      const exponent = parseInt(parts[1]);
      
      if (exponent < 0) {
        // 处理负指数 (例如 1.23e-5)
        const absExponent = Math.abs(exponent);
        if (absExponent <= 1) {
          numStr = '0.' + base;
        } else {
          numStr = '0.' + '0'.repeat(absExponent - 1) + base;
        }
      }
    }
    
    // 确保numStr是小数形式
    if (!numStr.includes('.')) {
      numStr += '.0';
    }
    
    // 分离小数部分
    const decimalPart = numStr.split('.')[1];
    
    // 计算前导零的数量
    let leadingZerosCount = 0;
    for (let i = 0; i < decimalPart.length; i++) {
      if (decimalPart[i] === '0') {
        leadingZerosCount++;
      } else {
        break;
      }
    }
    
    // 提取从第一个非零数字开始的有效数字（固定3位，不足补0）
    let significantDigits = '';
    if (leadingZerosCount < decimalPart.length) {
      significantDigits = decimalPart.substring(leadingZerosCount);
      if (significantDigits.length > 3) {
        significantDigits = significantDigits.substring(0, 3);
      } else if (significantDigits.length < 3) {
        // 不足3位，补0
        significantDigits = significantDigits.padEnd(3, '0');
      }
    } else {
      // 全是0的情况
      significantDigits = '000';
    }
    
    // 根据前导零数量决定显示方式
    if (leadingZerosCount >= zeroAbbreviationThreshold) {
      return `${symbol}0.0{${leadingZerosCount}}${significantDigits}`;
    } else {
      // 处理阈值不同的情况
      if (zeroAbbreviationThreshold > 3 && leadingZerosCount === 3) {
        // 特殊情况：zeroAbbreviationThreshold=4，leadingZerosCount=3，此时应该显示0.0001而不是0.0{3}1
        return `${symbol}0.${'0'.repeat(leadingZerosCount)}${significantDigits.charAt(0)}`;
      }
      
      // 普通情况：显示完整的前导零和3位有效数字
      return `${symbol}0.${'0'.repeat(leadingZerosCount)}${significantDigits}`;
    }
  }
  
  // 处理负数 (可选，根据需求可添加)
  return placeholder;
}; 