import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'landedX | True Cost of Cars Across Australia',
    template: '%s | landedX',
  },
  description:
    'See the true delivered cost of any car in Australia. Compare prices across all states including transport, stamp duty, and registration.',
  keywords: [
    'used cars Australia',
    'car comparison',
    'car transport',
    'stamp duty calculator',
    'buy car interstate',
    'delivered car cost',
    'car cost calculator',
  ],
  authors: [{ name: 'landedX' }],
  openGraph: {
    type: 'website',
    locale: 'en_AU',
    siteName: 'landedX',
    title: 'landedX | True Cost of Cars Across Australia',
    description:
      'See the true delivered cost of any car in Australia. Compare prices across all states.',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.className}>
      <body className="min-h-screen bg-gray-50 antialiased">
        <div className="flex min-h-screen flex-col">
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
