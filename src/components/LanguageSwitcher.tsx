'use client';

import { useParams, usePathname, useRouter, useSearchParams } from 'next/navigation';
import { locales } from '@/i18n';

export default function LanguageSwitcher() {
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const currentLocale = params.locale as string;
  
  // Function to handle locale change
  const handleLocaleChange = (newLocale: string) => {
    if (currentLocale === newLocale) return; // No change needed if same locale
    
    console.log('Switching locale from', currentLocale, 'to', newLocale);
    console.log('Current pathname:', pathname);
    
    // Get the path without the locale prefix
    const pathWithoutLocale = pathname.replace(`/${currentLocale}`, '');
    console.log('Path without locale:', pathWithoutLocale);
    
    // If path is empty after removing locale, it means we're at the root path for the locale
    if (pathWithoutLocale === '') {
      console.log('At root path, navigating to new locale root');
      // Just navigate to the new locale root
      router.push(`/${newLocale}`);
      return;
    }
    
    // Construct the new URL
    const search = searchParams.toString();
    const searchSuffix = search ? `?${search}` : '';
    const newPath = `/${newLocale}${pathWithoutLocale}${searchSuffix}`;
    
    console.log('Navigating to:', newPath);
    
    // Navigate to the new URL
    router.push(newPath);
  };
  
  return (
    <div className="flex items-center space-x-4">
      {locales.map((locale) => (
        <button
          key={locale}
          onClick={() => handleLocaleChange(locale)}
          className={`text-sm text-white cursor-pointer ${
            locale === currentLocale ? 'font-bold' : ''
          }`}
        >
          {locale === 'en' ? 'English' : '中文'}
        </button>
      ))}
    </div>
  );
} 