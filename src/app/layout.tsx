import type { Metadata } from "next";
import "./globals.css";
import { Inter } from "next/font/google";
import Link from "next/link";
// import LanguageSwitcher from "@/components/LanguageSwitcher";
// import { ReactNode, Suspense } from "react";
import { ReactNode } from "react";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

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
      <body className={`${inter.className} antialiased`} suppressHydrationWarning={true}>
        <nav className="bg-blue-600 dark:bg-blue-800 shadow-sm sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex">
                <div className="flex-shrink-0 flex items-center">
                  <Link href="/" className="text-xl font-bold text-white">
                    Conan
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </nav>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}
