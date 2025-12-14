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
    default: 'Cars Without Borders | Find Used Cars Across Australia',
    template: '%s | Cars Without Borders',
  },
  description:
    'Compare used car prices across Australia. Find the best deals by calculating the true delivered cost including transport, stamp duty, and registration.',
  keywords: [
    'used cars Australia',
    'car comparison',
    'car transport',
    'stamp duty calculator',
    'buy car interstate',
    'carsales',
    'gumtree cars',
  ],
  authors: [{ name: 'Cars Without Borders' }],
  openGraph: {
    type: 'website',
    locale: 'en_AU',
    siteName: 'Cars Without Borders',
    title: 'Cars Without Borders | Find Used Cars Across Australia',
    description:
      'Compare used car prices across Australia. Find the best deals by calculating the true delivered cost.',
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
