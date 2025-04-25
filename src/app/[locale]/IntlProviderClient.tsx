'use client'; // 标记为 Client Component

import { NextIntlClientProvider, AbstractIntlMessages } from 'next-intl';
import { ReactNode } from 'react';

type Props = {
  messages: AbstractIntlMessages | undefined; // 接收从 Server Component 传来的消息
  locale: string;
  children: ReactNode;
};

export default function IntlProviderClient({ messages, locale, children }: Props) {
  // 在 Client Component 中渲染真正的 Provider
  if (!messages) {
    // 如果消息加载失败，可以显示加载状态或错误信息，或者渲染 children 但不带 provider
    // 这里简单地直接渲染 children，可能导致 useTranslations 失败，需要根据业务决定
    console.warn("IntlProviderClient received undefined messages for locale:", locale);
    return <>{children}</>;
  }

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
} 