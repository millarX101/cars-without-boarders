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
    'See the true delivered cost of any car in Australia. Compare prices across all states including transport, stamp duty, registration, and CTP insurance.',
  keywords: [
    // Core keywords
    'used cars Australia',
    'buy car interstate',
    'car cost calculator',
    'delivered car cost',
    // Stamp duty
    'stamp duty calculator',
    'car stamp duty NSW',
    'car stamp duty Victoria',
    'car stamp duty QLD',
    'vehicle stamp duty Australia',
    'motor vehicle duty',
    // Registration
    'car registration cost',
    'rego calculator',
    'registration fees Australia',
    'CTP insurance cost',
    'greenslip calculator',
    // Transport
    'car transport Australia',
    'interstate car transport',
    'car delivery cost',
    'vehicle transport quote',
    // Comparison
    'compare car costs',
    'car price comparison',
    'true cost of car',
    'on road costs',
  ],
  authors: [{ name: 'landedX' }],
  openGraph: {
    type: 'website',
    locale: 'en_AU',
    siteName: 'landedX',
    title: 'landedX | True Cost of Cars Across Australia',
    description:
      'See the true delivered cost of any car in Australia. Calculate stamp duty, rego, CTP, and transport.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'landedX | True Cost of Cars Across Australia',
    description: 'Calculate the true delivered cost of any car including stamp duty, rego, and transport.',
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: 'https://landedx.com.au',
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
