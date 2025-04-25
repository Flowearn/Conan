import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './i18n';

// 创建中间件
export default createMiddleware({
  // 支持的语言列表
  locales: locales,
  // 默认语言
  defaultLocale: defaultLocale,
  // 本地化路径
  localePrefix: 'always', // 始终添加语言前缀，确保一致性
});

// 指定中间件应该匹配哪些路径
export const config = {
  // 跳过所有不需要国际化的路径 (例如：api, _next静态文件, 带点的文件如favicon.ico)
  matcher: ['/((?!api|_next|.*\\..*).*)']
}; 