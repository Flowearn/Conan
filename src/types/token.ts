/**
 * 标准时间维度数据值对象类型
 * 表示特定时间维度下的数据点
 */
export interface TimeFrameValueObj {
  value: string | null;
  actualTimeframe: string;
}

/**
 * 代表不同时间维度的指标数据
 * 键是时间字符串（如'1m', '30m'等），值是TimeFrameValueObj
 */
export type MetricTimeFrames = Record<string, TimeFrameValueObj | undefined>;

/**
 * 代币分析数据接口
 * 包含所有用于分析的指标，每个指标都是按时间维度组织的
 */
export interface TokenAnalyticsData {
  priceChangePercent?: MetricTimeFrames;
  uniqueWallets?: MetricTimeFrames;
  uniqueWalletsChangePercent?: MetricTimeFrames;
  buyCounts?: MetricTimeFrames;
  sellCounts?: MetricTimeFrames;
  tradeCountChangePercent?: MetricTimeFrames;  // 对应后端 SolanaService 的 tradeCountChangePercent
  volumeChangePercent?: MetricTimeFrames;      // 对应后端 SolanaService 的 volumeChangePercent
  buyVolumeUSD?: MetricTimeFrames;
  sellVolumeUSD?: MetricTimeFrames;
  // 注意：之前在 aiAnalysisService.js 中为 Prompt 构建的 tradeVolumes, walletActivity, tradeCounts 的对象结构与此不同。
  // 此 TokenAnalyticsData 定义的是从后端API直接获取的、传递给 ActivityStatsOverview 的结构。
  // ActivityStatsOverview 内部的 getWalletsData 等函数会再处理成卡片期望的格式。
} 