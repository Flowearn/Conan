import { ReactNode } from 'react';
// import { NextIntlClientProvider, AbstractIntlMessages } from 'next-intl';
// import { getMessages } from '@/i18n';
// import IntlProviderClient from './IntlProviderClient';

type LayoutProps = {
  children: ReactNode;
  params: {
    locale: string;
  };
}

export default function LocalizedLayout({
  children,
}: LayoutProps) {
  // 彻底绕过 next-intl，直接渲染 children
  return <>{children}</>;

  // 原始逻辑已注释掉
  // const { locale } = params;
  // let messages: AbstractIntlMessages | undefined;
  // try {
  //   messages = await getMessages({ locale });
  // } catch (error) {
  //   console.error(`Failed to get messages for locale ${locale}:`, error);
  //   messages = {};
  // }

  // return (
  //   <IntlProviderClient messages={messages} locale={locale}>
  //     {children}
  //   </IntlProviderClient>
  // );
} 