import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sell Your Car Free | List Your Car Australia',
  description:
    'List your car for free on landedX. Reach buyers across all Australian states who can see the true delivered cost to their door. Private sellers only, no dealer fees.',
  keywords: [
    'sell car free Australia',
    'list car online',
    'private car sale Australia',
    'sell my car',
    'advertise car free',
    'sell used car',
    'car marketplace Australia',
    'private seller car',
  ],
  openGraph: {
    title: 'Sell Your Car Free | landedX',
    description:
      'List your car for free and reach buyers across Australia. Show them the true delivered cost.',
    type: 'website',
    locale: 'en_AU',
  },
};

export default function ListYourCarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
