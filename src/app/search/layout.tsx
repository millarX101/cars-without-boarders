import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Search Used Cars Australia | See True Delivered Cost',
  description:
    'Search used cars across all Australian states. See the true delivered price including interstate transport, stamp duty, registration, and CTP. Filter by make, model, price, and location.',
  keywords: [
    'search used cars Australia',
    'buy used car',
    'used cars for sale',
    'cars for sale Australia',
    'cheap used cars',
    'second hand cars',
    'car search',
    'find cars Australia',
  ],
  openGraph: {
    title: 'Search Used Cars Australia | landedX',
    description:
      'Find your perfect car from anywhere in Australia. See the true delivered price to your door.',
    type: 'website',
    locale: 'en_AU',
    url: 'https://landedx.com.au/search',
  },
  alternates: {
    canonical: 'https://landedx.com.au/search',
  },
};

export default function SearchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
