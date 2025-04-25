import type { Metadata } from "next";
import "./globals.css";
// 使用next/font直接导入默认字体
// import { Inter } from "next/font/google";
// import Link from "next/link";
// 暂时注释掉未使用的导入
// import LanguageSwitcher from "@/components/LanguageSwitcher";
// import { ReactNode, Suspense } from "react";
import { ReactNode } from "react";

// 使用Inter字体作为替代 - 暂时注释掉
// const inter = Inter({
//   subsets: ["latin"],
//   display: "swap",
// });

export const metadata: Metadata = {
  title: "Conan Token Explorer",
  description: "Explore token information on BSC and Solana",
};

export default function RootLayout({
  children,
  params
}: {
  children: ReactNode;
  params?: { locale?: string };
}) {
  const locale = params?.locale || 'en';

  return (
    <html lang={locale}>
      <body>
        {/* === 开始：恢复 main 元素 === */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
        {/* === 结束：恢复 main 元素 === */}
      </body>
    </html>
  );
}
