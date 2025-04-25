import React, { useEffect, useRef } from 'react';

// 定义图表选项接口
interface ChartWidgetOptions {
  autoSize: boolean;
  chainId: string;
  tokenAddress?: string; // 代币地址
  pairAddress?: string; // 交易对地址
  defaultInterval: string;
  timeZone: string;
  theme: string;
  locale: string;
  backgroundColor: string;
  gridColor: string;
  textColor: string;
  candleUpColor: string;
  candleDownColor: string;
  hideLeftToolbar: boolean;
  hideTopToolbar: boolean;
  hideBottomToolbar: boolean;
}

// 定义组件属性接口
interface PriceChartWidgetProps {
  tokenAddress: string;
  pairAddress?: string; // 添加可选的pairAddress属性
  chainId?: string;
  height?: string;
}

// 定义 window 的接口扩展
declare global {
  interface Window {
    createMyWidget: (containerId: string, options: ChartWidgetOptions) => void;
  }
}

const PRICE_CHART_ID = 'price-chart-widget-container';

export const PriceChartWidget: React.FC<PriceChartWidgetProps> = ({ 
  tokenAddress,
  pairAddress,
  chainId = '0x38',
  height = '500px'
}) => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const loadWidget = () => {
      if (typeof window.createMyWidget === 'function') {
        // 如果有pairAddress，使用它
        const options: ChartWidgetOptions = {
          autoSize: true,
          chainId: chainId,
          defaultInterval: '1d',
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone ?? 'Etc/UTC',
          theme: 'moralis',
          locale: 'en',
          backgroundColor: '#071321',
          gridColor: '#0d2035',
          textColor: '#68738D',
          candleUpColor: '#4CE666',
          candleDownColor: '#E64C4C',
          hideLeftToolbar: false,
          hideTopToolbar: false,
          hideBottomToolbar: false
        };

        // 优先使用pairAddress，如果没有再使用tokenAddress
        if (pairAddress) {
          console.log('Using pair address for chart:', pairAddress);
          options.pairAddress = pairAddress;
        } else {
          console.log('Using token address for chart:', tokenAddress);
          options.tokenAddress = tokenAddress;
        }

        window.createMyWidget(PRICE_CHART_ID, options);
      } else {
        console.error('createMyWidget function is not defined.');
      }
    };

    if (!document.getElementById('moralis-chart-widget')) {
      const script = document.createElement('script');
      script.id = 'moralis-chart-widget';
      script.src = 'https://moralis.com/static/embed/chart.js';
      script.type = 'text/javascript';
      script.async = true;
      script.onload = loadWidget;
      script.onerror = () => {
        console.error('Failed to load the chart widget script.');
      };
      document.body.appendChild(script);
    } else {
      loadWidget();
    }

    // Cleanup function
    return () => {
      const scriptElement = document.getElementById('moralis-chart-widget');
      if (scriptElement) {
        scriptElement.remove();
      }
    };
  }, [tokenAddress, pairAddress, chainId]);

  return (
    <div className="w-full" style={{ height }}>
      <div
        id={PRICE_CHART_ID}
        ref={containerRef}
        className="w-full h-full"
      />
    </div>
  );
};

export default PriceChartWidget; 