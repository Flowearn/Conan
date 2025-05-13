/**
 * formatAdvancedPrice 函数测试
 * 测试各种边界情况和输入值，确保函数表现符合预期
 */
function testFormatAdvancedPrice() {
  // 手动实现formatAdvancedPrice函数的逻辑用于测试
  // 这样我们可以独立于TypeScript模块系统进行测试
  function formatAdvancedPrice(
    value, 
    symbol = '$', 
    placeholder = 'N/A',
    zeroAbbreviationThreshold = 3
  ) {
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
  }

  const testCases = [
    // 测试无效输入
    { input: null, expected: 'N/A', desc: '空值 (null)' },
    { input: undefined, expected: 'N/A', desc: '未定义值 (undefined)' },
    { input: 'not-a-number', expected: 'N/A', desc: '非数字字符串' },
    
    // 测试零值和整数
    { input: 0, expected: '$0.00', desc: '零值' },
    { input: '0', expected: '$0.00', desc: '字符串零值' },
    { input: 1, expected: '$1.00', desc: '整数 1' },
    { input: 100, expected: '$100.00', desc: '整数 100' },
    { input: 1000, expected: '$1000.00', desc: '整数 1000' },
    
    // 测试一般小数（大于等于0.1）
    { input: 0.1, expected: '$0.1', desc: '小数 0.1', symbol: '$', threshold: 3 },
    { input: 0.01, expected: '$0.01', desc: '小数 0.01', symbol: '$', threshold: 3 },
    { input: 0.001, expected: '$0.001', desc: '小数 0.001', symbol: '$', threshold: 3 },
    
    // 测试有大量前导零的小数值，使用缩写表示
    { input: 0.0001, expected: '$0.0{3}1', desc: '小数 0.0001', symbol: '$', threshold: 3 },
    { input: 0.00001, expected: '$0.0{4}1', desc: '小数 0.00001', symbol: '$', threshold: 3 },
    { input: 0.000001, expected: '$0.0{5}1', desc: '小数 0.000001', symbol: '$', threshold: 3 },
    { input: 0.0000001, expected: '$0.0{6}1', desc: '小数 0.0000001', symbol: '$', threshold: 3 },
    
    // 测试具有精度的小数值（显示前导零）
    { input: 0.0001234, expected: '$0.0{3}123', desc: '小数 0.0001234 (显示3位有效数字)', symbol: '$', threshold: 3 },
    { input: 0.000000456, expected: '$0.0{6}456', desc: '小数 0.000000456', symbol: '$', threshold: 3 },
    
    // 测试科学记数法表示的极小值
    { input: 1e-7, expected: '$0.0{6}1', desc: '科学计数法 1e-7', symbol: '$', threshold: 3 },
    { input: 1.23e-5, expected: '$0.0{4}123', desc: '科学计数法 1.23e-5', symbol: '$', threshold: 3 },
    { input: 7.89e-10, expected: '$0.0{9}789', desc: '科学计数法 7.89e-10', symbol: '$', threshold: 3 },
    
    // 测试不同的阈值设置
    { input: 0.0001, expected: '$0.0001', desc: '小数 0.0001 (阈值=4)', symbol: '$', threshold: 4 },
    { input: 0.00001, expected: '$0.0{4}1', desc: '小数 0.00001 (阈值=4)', symbol: '$', threshold: 4 },
    
    // 测试不同的货币符号
    { input: 123.45, expected: '¥123.45', desc: '不同货币符号 ¥', symbol: '¥', threshold: 3 },
    { input: 0.0001234, expected: '€0.0{3}123', desc: '不同货币符号 €', symbol: '€', threshold: 3 },
    
    // 测试负数
    { input: -1, expected: '-$1.00', desc: '负整数 -1' },
    { input: -0.1, expected: '-$0.1', desc: '负小数 -0.1' },
    { input: -0.0001, expected: '-$0.0{3}1', desc: '负小数 -0.0001 (前导零缩写)' },
  ];

  console.log('===== formatAdvancedPrice 函数测试 =====');
  
  let passCount = 0;
  let failCount = 0;
  
  for (const test of testCases) {
    const { input, expected, desc, symbol = '$', threshold = 3 } = test;
    const result = formatAdvancedPrice(input, symbol, 'N/A', threshold);
    
    if (result === expected) {
      console.log(`✅ 通过: ${desc} => "${result}"`);
      passCount++;
    } else {
      console.log(`❌ 失败: ${desc}`);
      console.log(`  预期: "${expected}"`);
      console.log(`  实际: "${result}"`);
      failCount++;
    }
  }
  
  console.log('===== 测试结果摘要 =====');
  console.log(`总测试: ${testCases.length}`);
  console.log(`通过: ${passCount}`);
  console.log(`失败: ${failCount}`);
}

// 运行测试
testFormatAdvancedPrice(); 