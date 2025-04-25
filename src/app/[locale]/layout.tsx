import { AbstractIntlMessages } from 'next-intl';
import { getMessages } from '@/i18n'; // 确认此路径!
import { ReactNode } from 'react';
import IntlProviderClient from './IntlProviderClient'; // 导入客户端组件

export default async function LocalizedLayout({
  children,
  params: { locale }
}: {
  children: ReactNode;
  params: { locale: string };
}) {
  let messages: AbstractIntlMessages | undefined;
  try {
    messages = await getMessages({ locale });
  } catch (error) {
    console.error(`Failed to get messages for locale ${locale}:`, error);
    messages = {}; // 使用空对象作为回退
  }

  return (
    // 重新使用 IntlProviderClient 来提供 i18n 上下文
    <IntlProviderClient messages={messages} locale={locale}>
      {children}
    </IntlProviderClient>
  );
} 