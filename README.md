# Conan - Meme代币数据分析平台前端

## 1. 项目概述

Conan前端是一个现代化的Web应用程序，专注于展示加密货币（特别是Meme代币）的详细信息和分析。主要功能包括：

- 展示代币基本信息（价格、市值、流动性等）
- 显示多时间维度的活动统计数据（价格变化、交易量、钱包活动、交易次数等）
- 呈现代币持有者分布情况
- 展示顶级交易者信息
- 提供AI驱动的代币分析结果（支持英文和中文）
- 支持多链数据展示（BSC和Solana）

## 2. 核心数据消费原则

### 后端提供预格式化数据

前端直接消费由后端API提供的、已经完全预格式化的数据。所有数值（价格、金额、数量、百分比等）都以最终的显示字符串形式从后端获取，例如：

- 货币值：`"$1.2M"`, `"$45.67"`
- 百分比：`"+12.34%"`, `"-5.83%"`
- 计数值：`"1.5K"`, `"2.3M"`
- 无效/缺失数据：`"N/A"`

### 前端不进行数值格式化

前端组件**不再对**从API获取的核心统计数据执行任何数值解析、转换或格式化操作。特别是不再调用前端的`formatLargeNumber`、`safeFormatSignedPercentage`等工具函数来处理这些已经格式化的数据。这消除了前端与后端数据格式不一致的问题，并简化了前端代码。

### `value` 和 `actualTimeframe` 的直接使用

组件直接使用后端提供的数据结构：

- `value`：直接用于展示的预格式化字符串
- `actualTimeframe`：表示数据实际来源的时间维度，用作数据的时间标签

例如，后端提供的`tokenAnalytics`数据结构如下：

```typescript
interface TimeFrameValueObj {
  value: string | null;         // 预格式化的显示值
  actualTimeframe: string;      // 实际数据来源的时间维度
}

interface TimeFrameValues {
  '1m': TimeFrameValueObj | undefined;
  '30m': TimeFrameValueObj | undefined;
  '2h': TimeFrameValueObj | undefined;
  '6h': TimeFrameValueObj | undefined;
  '12h': TimeFrameValueObj | undefined;
  '24h': TimeFrameValueObj | undefined;
  [key: string]: TimeFrameValueObj | undefined;
}
```

前端组件直接使用这些值进行渲染，确保UI显示的是准确的数据和时间标签。

## 3. 主要技术栈与特性

- **框架:** Next.js 14.2.0 (App Router)
- **UI库:** React 18.3.0
- **开发语言:** TypeScript 5.x
- **样式:** Tailwind CSS 4.x
- **UI组件:** Geist UI
- **国际化:** next-intl 4.0.2，支持英文和中文
- **组件结构:**
  - 核心代币数据组件位于 `src/components/token/` 目录
  - 主要活动统计卡片：`PriceChangeCard`, `WalletActivityCard`, `TradeCountsCard`, `TradeVolumesCard`
  - 活动统计总览：`ActivityStatsOverview`（负责协调各个具体卡片）
  - 分析组件位于 `src/components/analysis/` 目录

## 4. 本地开发与API连接

### 设置环境变量

在项目根目录创建 `.env.local` 文件：

```env
NEXT_PUBLIC_API_URL=http://localhost:3003  # 本地后端服务地址
```

### 安装依赖

```bash
npm install
# 或
yarn install
```

### 运行开发服务器

```bash
npm run dev
# 或
yarn dev
```

应用将在 [http://localhost:3000](http://localhost:3000) 可访问。

## 5. 部署

项目采用Vercel部署，通过推送代码到对应分支自动触发部署：

- **生产环境:** `main` 分支 → `www.conan.ink`
- **开发环境:** `dev` 分支 → Vercel Preview URLs

在Vercel项目设置中，确保配置了正确的环境变量，特别是指向生产后端API的`NEXT_PUBLIC_API_URL`。

## 6. 近期关键修复与改进

### 数据处理优化

- ✅ 移除了前端组件中对核心统计数据的二次格式化逻辑，改为直接消费后端预格式化的字符串
- ✅ 修改了`TimeFrameValueObj`接口，将`value`字段类型从`number | null`改为`string | null`，以匹配后端提供的预格式化字符串
- ✅ 修正了时间标签的显示逻辑，确保UI显示的时间标签准确反映`actualTimeframe`值
- ✅ 解决了K后缀丢失等因前端不当格式化导致的数据显示问题

### 组件重构

- ✅ 将原表格形式的活动指标重构为四个独立的卡片式组件，采用直观的2x2网格布局
- ✅ 统一了区域总标题和样式，解决了之前的标题嵌套和i18n键名显示问题
- ✅ 优化了各子卡片内"变化百分比"的显示，与对应时间标签同行，使布局更紧凑

### 多链支持

- ✅ 新增对Solana链的完整支持，包括代币详情、持有者统计和交易分析
- ✅ 实现链类型自动检测，系统可根据地址格式自动判断是BSC还是Solana链
- ✅ 优化了前端代码以处理不同链的特定数据结构差异

### 错误处理与健壮性

- ✅ 增强了对缺失数据和无效值的处理，确保UI不会因数据问题而崩溃
- ✅ 实现了适当的加载状态，提升用户体验
- ✅ 改进了API请求错误处理，添加了超时和重试机制

### 国际化完善

- ✅ 修复了模块标题和内部标签的i18n显示问题
- ✅ 完善了Token Overview内的标签、AI分析按钮文本等的国际化支持
- ✅ 解决了多个`MISSING_MESSAGE`错误，提高了多语言体验的完整性

## 7. 项目结构

```
frontend/
├── src/
│   ├── app/                    # Next.js 14 应用路由
│   │   └── [locale]/           # 国际化路由
│   │       ├── page.tsx        # 首页
│   │       └── token/          # 代币相关路由
│   ├── components/             # 可重用组件
│   │   ├── common/             # 共享UI组件
│   │   ├── token/              # 代币特定组件
│   │   │   ├── ActivityStatsOverview.tsx  # 活动统计总览
│   │   │   ├── PriceChangeCard.tsx        # 价格变化卡片
│   │   │   ├── WalletActivityCard.tsx     # 钱包活动卡片
│   │   │   ├── TradeCountsCard.tsx        # 交易次数卡片
│   │   │   └── TradeVolumesCard.tsx       # 交易量卡片
│   │   └── analysis/           # 数据分析组件
│   ├── utils/                  # 工具函数
│   └── styles/                 # 全局样式
├── public/                     # 静态资源
└── locales/                    # 翻译文件
```

## 贡献

1. Fork仓库
2. 创建您的功能分支（`git checkout -b feature/AmazingFeature`）
3. 提交您的更改（`git commit -m 'Add some AmazingFeature'`）
4. 推送到分支（`git push origin feature/AmazingFeature`）
5. 开启Pull Request

## 许可证

该项目采用MIT许可证 - 详见LICENSE文件。

## 了解更多

要了解更多关于Next.js的信息，请查看以下资源：

- [Next.js文档](https://nextjs.org/docs) - 了解Next.js功能和API。
- [学习Next.js](https://nextjs.org/learn) - 交互式Next.js教程。

您可以查看[Next.js GitHub仓库](https://github.com/vercel/next.js) - 欢迎您的反馈和贡献！

## 在Vercel上部署

部署Next.js应用的最简单方法是使用Next.js创建者提供的[Vercel平台](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme)。

查看我们的[Next.js部署文档](https://nextjs.org/docs/app/building-your-application/deploying)获取更多详情。
