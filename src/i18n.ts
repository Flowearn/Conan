import { notFound } from 'next/navigation';
import { getRequestConfig } from 'next-intl/server';

// 定义支持的语言
export const locales = ['en', 'zh'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'zh';

// 添加 getMessages 函数以支持 layout.tsx 的调用
export async function getMessages({ locale }: { locale: string }) {
  // 确保 locale 是有效的
  if (!locales.includes(locale as Locale)) {
    notFound();
  }
  
  try {
    // 动态导入对应语言的翻译文件
    return (await import(`./messages/${locale}.json`)).default;
  } catch (error) {
    console.error(`Could not load messages for locale: ${locale}`, error);
    notFound();
  }
}

// 这个函数会被 Next.js 的 middleware 调用
export default getRequestConfig(async ({ locale }) => {
  // 确保有一个有效的 locale
  const resolvedLocale: Locale = locale && locales.includes(locale as Locale) 
    ? (locale as Locale) 
    : defaultLocale;
  
  // 使用 getMessages 函数加载翻译
  return {
    messages: await getMessages({ locale: resolvedLocale }),
    locale: resolvedLocale // 使用已解析的有效 locale
  };
}); 