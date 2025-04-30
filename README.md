# Conan v2 Frontend

A modern, internationalized cryptocurrency info tracking and analysis platform built with Next.js.

## Overview

Conan v2 Frontend is a sophisticated web application designed for cryptocurrency market analysis and token tracking. Built with Next.js 14 and React 18, it leverages TypeScript for type safety and Tailwind CSS for modern, responsive styling. The platform features comprehensive internationalization support through next-intl, delivering a seamless experience across multiple languages and regions.

### Core Technology Stack
- **Framework:** Next.js 14.2.0 with App Router
- **UI Library:** React 18.3.0
- **Language:** TypeScript 5.x
- **Styling:** Tailwind CSS 4.x
- **UI Components:** Geist UI
- **i18n Solution:** next-intl 4.0.2

## Features

- 🌐 Multi-language Support (i18n)
- 📊 Real-time token data Tracking
- 💱 Multi-chain Support
- 📈 Market Analysis Tools
- 🔄 Real-time Price Updates
- 🎨 Modern, Responsive UI
- 🚀 Optimized Performance
- 🔒 Secure Data Integration

## Development Setup

### Prerequisites

- Node.js (v18.x or higher)
- npm or yarn
- Git
- IDE with TypeScript and Tailwind CSS support (recommended: VS Code with appropriate extensions)

### Installation

1. Clone the repository:
```bash
git clone <repository_url>
cd conan-v2/frontend
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

### Environment Configuration

Create a `.env.local` file in the frontend directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_CHAIN_ID=1
NEXT_PUBLIC_BSC_RPC_URL=https://bsc-dataseed.binance.org
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
```

### Local Development

Start the development server:

```bash
npm run dev
# or
yarn dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).

### Code Quality Tools

```bash
# Run TypeScript type checking
npm run type-check

# Run ESLint
npm run lint

# Format code with Prettier
npm run format
```

## Recent Development Updates

### Performance & Stability Improvements
- Resolved server hanging issues by removing `--turbopack` flag from Next.js development configuration
- Optimized data fetching in dynamic token pages (`[locale]/token/[address]`) by implementing proper error boundaries and loading states
- Enhanced page performance by implementing proper data caching strategies

### Bug Fixes & Optimizations
- Fixed Next.js data fetching issues in the token detail page where price history data wasn't properly cached
- Resolved Tailwind CSS class conflicts in the market overview components, particularly in dark mode transitions
- Improved error handling for blockchain RPC connections
- Enhanced i18n implementation for better language switching performance

### Current Status
Project stability has significantly improved following these fixes, and the codebase is now optimized for Vercel deployment. All critical performance issues have been addressed, and the application is ready for production deployment.

## Deployment

### Vercel Deployment (Recommended)

The project is optimized for deployment on Vercel, which offers seamless integration with Next.js applications.

1. Connect your GitHub repository to Vercel
2. Vercel will automatically detect Next.js configuration
3. Configure the following environment variables in Vercel project settings:
   - `NEXT_PUBLIC_API_URL`
   - `NEXT_PUBLIC_CHAIN_ID`
   - `NEXT_PUBLIC_BSC_RPC_URL`
   - `NEXT_PUBLIC_SOLANA_RPC_URL`

### Build Configuration

```bash
# Production build
npm run build

# Local production build testing
npm start
```

## Project Structure

```
frontend/
├── src/
│   ├── app/           # Next.js 14 App Router
│   │   ├── [locale]/  # Internationalized routes
│   │   │   ├── page.tsx           # Home page
│   │   │   ├── token/            # Token routes
│   │   │   │   └── [address]/    # Token detail pages
│   │   │   └── market/           # Market overview
│   │   └── layout.tsx # Root layout
│   ├── components/    # Reusable components
│   │   ├── common/   # Shared UI components
│   │   ├── token/    # Token-specific components
│   │   └── market/   # Market-related components
│   ├── hooks/        # Custom React hooks
│   ├── lib/          # Utility functions
│   │   ├── api/      # API integration
│   │   └── chain/    # Blockchain utilities
│   └── styles/       # Global styles
├── public/           # Static assets
└── locales/         # Translation files
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
