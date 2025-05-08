import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  /* 其他配置选项 */
  
  // 添加内容安全策略配置
  async headers() {
    return [
      {
        // 应用于所有路径
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' localhost:* https:;"
          }
        ]
      }
    ];
  },
  
  // 添加远程图片域名配置
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'logo.moralis.io',
      },
      {
        protocol: 'https',
        hostname: 'bafkreibk3covs5ltyqxa272uodhculbr6kea6betidfwy3ajsav2vjzyum.ipfs.nftstorage.link',
      },
      {
        protocol: 'https',
        hostname: 'arweave.net',
      }
    ],
  },
};

export default withNextIntl(nextConfig); 