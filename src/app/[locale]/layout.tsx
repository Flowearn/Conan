import { NextIntlClientProvider, AbstractIntlMessages } from 'next-intl';
import { getMessages } from '@/i18n';
import { ReactNode } from 'react';
import IntlProviderClient from './IntlProviderClient';

type LayoutProps = {
  children: ReactNode;
  params: {
    locale: string;
  };
}

export default async function LocalizedLayout({
  children,
  params: { locale }
}: LayoutProps) {
  // 获取当前语言环境的消息
  let messages: AbstractIntlMessages | undefined;
  try {
    messages = await getMessages({ locale });
  } catch (error) {
    console.error(`Failed to get messages for locale ${locale}:`, error);
    messages = {};
  }

  return (
    <html lang={locale}>
      <body>
        <IntlProviderClient messages={messages} locale={locale}>
          {children}
        </IntlProviderClient>
      </body>
    </html>
  );
} 