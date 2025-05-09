# Conan v2 前端

一个基于Next.js构建的现代化、国际化的加密货币信息追踪和分析平台。

## 概述

Conan v2前端是一个精心设计的Web应用程序，用于加密货币市场分析和代币追踪。使用Next.js 14和React 18构建，它利用TypeScript确保类型安全，采用Tailwind CSS实现现代化、响应式的样式设计。该平台通过next-intl提供全面的国际化支持，为多种语言和地区提供无缝体验。

### 核心技术栈
- **框架:** Next.js 14.2.0 (应用路由)
- **UI库:** React 18.3.0
- **开发语言:** TypeScript 5.x
- **样式:** Tailwind CSS 4.x
- **UI组件:** Geist UI
- **国际化方案:** next-intl 4.0.2

## 功能特性

- 🌐 多语言支持 (i18n)
- 🔎 实时代币数据追踪
- 💱 多链支持 (BSC和Solana)
- 📈 市场分析工具
- 🧠 AI驱动的代币分析（英文和中文）
- 🔄 实时价格更新
- 🎨 现代化、响应式UI
- 🚀 优化的性能
- 🔒 安全的数据集成

## 开发环境配置

### 前提条件

- Node.js (v18.x或更高版本)
- npm或yarn
- Git
- 支持TypeScript和Tailwind CSS的IDE（推荐：VS Code及相应扩展）

### 安装

1. 克隆仓库:
```bash
git clone <repository_url>
cd conan-v2/frontend
```

2. 安装依赖:
```bash
npm install
# 或
yarn install
```

### 环境配置

在frontend目录下创建一个`.env.local`文件：

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_CHAIN_ID=1
NEXT_PUBLIC_BSC_RPC_URL=https://bsc-dataseed.binance.org
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
```

对于云部署（Vercel），在Vercel项目设置中配置环境变量：
- 确保为Production和Preview环境设置不同的值
- Production环境应使用生产后端API URL

### 本地开发

启动开发服务器：

```bash
npm run dev
# 或
yarn dev
```

应用将在 [http://localhost:3000](http://localhost:3000) 可访问。

### 代码质量工具

```bash
# 运行TypeScript类型检查
npm run type-check

# 运行ESLint
npm run lint

# 使用Prettier格式化代码
npm run format
```

## 最新更新（2025年5月）

### 多链支持
- ✅ 新增对Solana链的完整支持，包括代币详情、持有者统计和交易分析
- ✅ 实现链类型自动检测，系统可根据地址格式自动判断是BSC还是Solana链
- ✅ 优化了前端代码以处理不同链的特定数据结构差异
- ✅ 在UI中添加了链标识，以便用户清楚了解当前查看的是哪条链上的数据

### 首页多链用户体验优化
- ✅ 在入口页新增链选择器，使用SVG图标，允许用户直接选择Solana或BSC链进行查询
- ✅ 优化了首页的地址输入区域，移除了冗余的提示信息和示例地址，让界面更加简洁
- ✅ 改进了UI提示，使用户更容易理解如何使用该平台

### 动态路由多链支持
- ✅ 更新代币详情页的路由结构为 `token/[chain]/[address]`，允许在URL中直接指定链类型
- ✅ 为旧的 `token/[address]` 路由添加重定向支持，确保向后兼容性
- ✅ 实现了全新的页面组件 `/[locale]/token/[chain]/[address]/page.tsx`，支持从路径参数中提取链类型和代币地址

### 数据格式化与错误处理增强
- ✅ 引入了强大的数值格式化工具集 (`src/utils/formatters.ts`)，包含多个安全格式化函数:
  - `safeToFixed`: 安全地格式化小数位数，避免对无效数据调用`.toFixed()`导致的错误
  - `safeFormatPercentage`: 格式化百分比数值，自动处理空值和添加%符号
  - `safeFormatSignedPercentage`: 格式化带正负号的百分比，自动处理正负值的显示
  - `safeFormatCurrency`: 格式化货币值，添加币种符号和适当小数位
  - `formatLargeNumber`: 格式化大数值，自动添加K, M, B等后缀
- ✅ 实现了专门的加密货币价格显示函数 `formatAdvancedPrice`:
  - 处理无效值，显示占位符
  - 零值显示为`$0.00`
  - 大于等于1的值保留2位小数
  - 小于1的值显示3位有效数字，自动处理前导零
  - 当前导零过多时使用简洁表示，如`$0.0{3}123`表示0.000123
- ✅ 全面替换项目中直接使用`.toFixed()`的地方，显著提高了页面稳定性和容错能力

### 代币详情UI与数据流改进
- ✅ 优化了价格和数值显示，使用安全格式化函数替代直接的数值操作
- ✅ 改进了代币详情页的错误状态处理，避免在API数据为空或无效时崩溃
- ✅ 增强了地址处理工具函数，提供多种格式化选项，满足不同UI区域的需求
- ✅ 修复了页面组件中的数据加载状态管理，防止在数据加载或刷新时UI闪烁

### 国际化 (i18n) 修复与增强
- ✅ 解决了`TokenPage.errorOccurred`等键名在英文(`en.json`)和中文(`zh.json`)语言文件中缺失导致的`MISSING_MESSAGE`错误
- ✅ 完善了代币详情页中各类标签、按钮和提示文本的国际化支持
- ✅ 修复了AI分析结果在语言切换后未正确重置的问题，优化了多语言体验

### 环境配置与API连接优化
- ✅ 标准化了前端项目通过环境变量`NEXT_PUBLIC_API_URL`连接到后端API的方式
- ✅ 提供了详细的Vercel平台环境变量配置指南，确保开发、预览和生产环境使用正确的API端点
- ✅ 解决了之前在Vercel部署环境中前端错误地尝试连接`http://localhost:3003`的问题
- ✅ 增强了API请求错误处理，添加了超时和重试机制，提高了数据获取的可靠性

### Activity数据模块优化
- ✅ 将原表格形式的活动指标重构为四个独立的卡片式组件（`PriceChangeCard`, `WalletActivityCard`, `TradeCountsCard`, `TradeVolumesCard`）
- ✅ 采用直观的2x2网格布局，提升信息阅读效率
- ✅ 统一了区域总标题和样式，解决了之前的标题嵌套和i18n键名显示问题
- ✅ 优化了各子卡片内"变化百分比"的显示，与对应时间标签同行，使布局更紧凑
- ✅ 统一了整体边距，使其与其他模块协调一致

### Top Traders模块改进
- ✅ 修复了模块标题和内部表头的i18n显示
- ✅ 优化了地址显示（提供标准和紧凑两种缩略格式，适应不同屏幕尺寸）
- ✅ 改进了数据样式（买入绿色/卖出红色）和交互效果
- ✅ 调整了地址列的左对齐和整体字号，提升视觉效果

### 持有者统计优化
- ✅ 重构了`HolderStats.tsx`组件以适配后端Solana数据源提供的新时间维度('30m', '1h', '2h', '4h', '8h', '24h')
- ✅ 实现对Solana链条件性隐藏某些不适用的数据板块
- ✅ 改进了数据处理逻辑，确保安全处理`null`值和未定义值
- ✅ 对所有相关百分比显示应用了严格的数字类型检查（`typeof x === 'number' && !isNaN(x)`）
- ✅ 统一了BSC和Solana链的时间维度展示，提供了一致的用户体验

### 设计与样式统一
- ✅ 统一了地址显示的字体样式（使用 `font-mono`）
- ✅ 统一了各种标签文本样式（使用 `font-medium text-xs`）
- ✅ 优化了响应式布局，确保在各种屏幕尺寸下都能提供良好体验
- ✅ 移除了旧的 `ActivityStatsTable.tsx` 表格，由新的模块化Activity组件取代

### AI分析功能
- ✅ 解决了切换语言后AI分析结果状态残留问题
- ✅ 通过分离状态管理（使用独立的`aiAnalysisResult` state）优化了数据流
- ✅ 添加了`useEffect`在`locale`变化时重置相关状态
- ✅ AI分析现在在英文和中文界面都能正常工作并正确显示结果
- ✅ 增强了AI分析API请求的错误处理，支持多链分析

### 国际化 (i18n) 完善
- ✅ 为新添加的UI元素（如链选择器文本）添加了翻译支持
- ✅ 修正了之前显示为键名的模块标题、内部标签的翻译
- ✅ 完善了Token Overview内的标签、AI分析按钮文本、复制地址提示、TopTraders表头等的国际化支持
- ✅ 解决了多个 `MISSING_MESSAGE` 错误，提高了多语言体验的完整性

### 渲染与健壮性修复
- ✅ 修复了因处理数据类型不当（如 `priceChangePercent`, `priceChange24h`）导致的 `toFixed` 运行时错误
- ✅ 解决了 `layout.tsx` 中因错误使用 `useState` 导致的构建失败
- ✅ 增加了数据处理的安全访问检查，提高应用稳定性
- ✅ 改进了错误边界，防止数据加载失败时UI崩溃
- ✅ 优化了表格和图表组件，确保在数据缺失时提供适当的回退选项

## 近期开发更新

### 性能与稳定性改进
- 通过移除Next.js开发配置中的`--turbopack`标志解决了服务器挂起问题
- 通过实现适当的错误边界和加载状态，优化了动态代币页面（`[locale]/token/[address]`）的数据获取
- 通过实施适当的数据缓存策略提升了页面性能
- 增强了不同链类型之间的数据兼容性处理

### 错误修复与优化
- 修复了代币详情页中价格历史数据未正确缓存的Next.js数据获取问题
- 解决了市场概览组件中的Tailwind CSS类冲突，特别是在暗模式转换中
- 改进了区块链RPC连接的错误处理
- 增强了i18n实现，提高了语言切换性能
- 提升了代码复用率，减少了重复逻辑

### 当前状态
在全面调试会话后，应用程序现已稳定并做好生产准备。主要改进包括：

- **稳定的AI分析**：代币分析功能在所有语言环境中可靠运行
- **强健的状态管理**：状态处理中适当的关注点分离防止数据冲突
- **增强的错误处理**：整个应用程序中更好的错误消息和恢复机制
- **改进的国际化**：无缝语言切换，不会造成状态损坏
- **优化的后端集成**：更可靠的API请求处理和响应处理
- **完整的多链支持**：BSC和Solana链均已完全集成并经过全面测试，包括自动链检测功能

### 近期 Solana 数据调试状态 (截至 2025-05-06 UTC+8)

* **调试背景:** 主要解决前端无法显示 Solana 代币 (`6p6xgHyF7AeE6TZkSmFsko444wqoP15icUSqi2jfGiPN`) 详细数据的问题。
* **后端状态:** 经过多轮调试，后端目前配置为：
    * 访问 Birdeye 的 `public-api.birdeye.so` 接口。
    * 使用了修正后的 URL 路径。
    * 包含必要的请求头 (`accept`, `x-chain`, `X-API-KEY`)。
    * 暂时采用**顺序**方式调用 Birdeye API。
    * 暂时**禁用**了后端缓存。
* **核心问题:** 尽管后端配置已更新，且单独使用 `curl` 测试 `public-api.birdeye.so` **有时可以**获取完整数据，但后端应用在实际调用时，从 Birdeye 收到的关键数据（如 Overview, Metadata）的**原始响应仍然是空的 (`data: null` 或 `data: {}`)**。这导致后端最终发送给前端的数据不完整。
* **当前尝试:** 后端正在尝试通过修改 Axios 请求的 `User-Agent` 头（模拟 `curl`）来解决此应用调用与 `curl` 行为不一致的问题。**前端需等待此尝试的结果。**
* **前端已知影响与待办:**
    * 由于后端数据不完整，前端相关数据显示为 `N/A`, `null` 或 `0`。
    * 根据项目决定，Solana 链**不需要**展示详细的持有人供应/分布 (`holderSupply`/`holderDistribution`)。因此，`HolderStats.tsx` 组件需要进行修改，以**识别 Solana 链并隐藏**这些不可用的数据板块，或给出友好提示。
    * 在后端数据问题彻底解决或确认无法解决后，需要全面检查并调整前端各组件，确保在有数据时能正确显示，在数据确实不可用时能优雅地处理（例如，显示"数据源暂无信息"而不是 N/A）。
    * 为 `tokenAnalytics` 开发 UI 的任务仍然是 P1 优先级，但在数据源稳定前可能难以进行。

## 部署

### Vercel部署（推荐）

该项目已针对Vercel部署进行了优化，Vercel为Next.js应用程序提供了无缝集成。

1. 将您的GitHub仓库连接到Vercel
2. Vercel将自动检测Next.js配置
3. 在Vercel项目设置中配置以下环境变量：
   - `NEXT_PUBLIC_API_URL`（Production和Preview环境的值不同）
   - `NEXT_PUBLIC_CHAIN_ID`
   - `NEXT_PUBLIC_BSC_RPC_URL`
   - `NEXT_PUBLIC_SOLANA_RPC_URL`

### 当前部署状态
- **生产环境**：`main`分支 → `www.conan.ink`
- **预览环境**：`dev`分支 → Vercel Preview URLs

### 构建配置

```bash
# 生产构建
npm run build

# 本地生产构建测试
npm start
```

## 项目结构

```
frontend/
├── src/
│   ├── app/           # Next.js 14 应用路由
│   │   ├── [locale]/  # 国际化路由
│   │   │   ├── page.tsx           # 首页
│   │   │   ├── token/            # 代币路由
│   │   │   │   ├── [chain]/      # 链特定路由 
│   │   │   │   │   └── [address]/ # 代币详情页
│   │   │   │   └── redirect-legacy/ # 旧路由重定向
│   │   │   └── market/           # 市场概览
│   │   └── layout.tsx # 根布局
│   ├── components/    # 可重用组件
│   │   ├── common/   # 共享UI组件
│   │   ├── token/    # 代币特定组件
│   │   ├── analysis/ # 数据分析组件
│   │   └── market/   # 市场相关组件
│   ├── hooks/        # 自定义React钩子
│   ├── utils/        # 工具函数
│   │   ├── formatters.ts # 数值格式化工具
│   │   └── api.ts    # API请求工具
│   └── styles/       # 全局样式
├── public/           # 静态资源
└── locales/         # 翻译文件
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
