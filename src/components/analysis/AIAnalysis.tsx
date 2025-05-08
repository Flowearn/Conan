import React, { useEffect } from 'react';
import { useTranslations } from 'next-intl';

/**
 * AI analysis component properties interface
 * 
 * Data structure:
 * - basicAnalysis: Comprehensive basic analysis content
 * 
 * Backend data should conform to this interface for proper UI display
 */
interface AIAnalysisProps {
  data?: {
    basicAnalysis?: string;
    // Keep index signature to support possible extensions
    [key: string]: string | undefined;
  } | null;
}

/**
 * AI Analysis Component - Shows comprehensive basic analysis content
 */
const AIAnalysis: React.FC<AIAnalysisProps> = ({ data }) => {
  // Initialize translation hook
  const t = useTranslations('AIAnalysis');
  
  // Log data changes
  useEffect(() => {
    if (data) {
      console.log('AIAnalysis component data received:', data);
      console.log('basicAnalysis:', data.basicAnalysis);
      // Add more detailed logging
      console.log('AIAnalysis detail - basicAnalysis type:', typeof data.basicAnalysis);
      console.log('AIAnalysis detail - basicAnalysis length:', data.basicAnalysis ? data.basicAnalysis.length : 0);
      if (data.basicAnalysis && data.basicAnalysis.length > 0) {
        console.log('AIAnalysis detail - first 100 chars:', data.basicAnalysis.substring(0, 100));
      }
    }
  }, [data]);
  
  if (!data) {
    console.log('AIAnalysis: No data received');
    return null;
  }

  // Check if content is valid
  const isValidContent = (content?: string): boolean => {
    if (!content) return false;
    
    // Don't filter error messages, only filter empty content and placeholders
    return (
      content.trim() !== "" && 
      content !== t('placeholderText') && 
      !content.startsWith(t('comingSoonPrefix')) &&
      content.length > 10  // Content should have a minimum length
    );
  }

  // Check if basic analysis content is valid
  const hasValidBasicAnalysis = isValidContent(data.basicAnalysis);
  
  // If no valid content, return no data prompt
  if (!hasValidBasicAnalysis) {
    console.log('AIAnalysis: No valid basicAnalysis content');
    return (
      <div className="space-y-6">
        <div className="mb-6">
          <div className="bg-gray-50 dark:bg-gray-900 rounded-md py-3">
            <div className="text-center px-4 py-2 text-gray-500 dark:text-gray-400">
              <p>{t('unavailableText')}</p>
              <p className="text-sm mt-2">{t('tryLaterText')}</p>
            </div>
          </div>
        </div>
        
        <div className="text-xs text-gray-500 dark:text-gray-400 pt-2">
          <p>{t('disclaimer')}</p>
        </div>
      </div>
    );
  }

  // Check if it's an error message
  const isError = data.basicAnalysis?.startsWith(t('errorPrefixCheck'));
  const displayContent = isError && data.basicAnalysis 
    ? data.basicAnalysis.replace(new RegExp(`^${t('errorPrefixCheck')}：`), '') // Use translation to replace error prefix
    : data.basicAnalysis;

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <div className={`whitespace-pre-wrap py-3 rounded-md text-sm leading-relaxed tracking-wide ${
          isError 
            ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800' 
            : 'bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200'
        }`}>
          {isError 
            ? <p className="px-4 py-2">{t('errorPrefix')}{displayContent}</p>
            : <div className="px-4 py-2">{displayContent}</div>
          }
        </div>
      </div>
      
      <div className="text-xs text-gray-500 dark:text-gray-400 pt-2">
        <p>{t('disclaimer')}</p>
      </div>
    </div>
  );
};

export default AIAnalysis;
