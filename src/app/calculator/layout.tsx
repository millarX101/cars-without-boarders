import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Car Cost Calculator | Stamp Duty, Rego & Transport Costs Australia',
  description:
    'Free calculator for buying a car interstate in Australia. Calculate stamp duty, registration, CTP insurance, and transport costs for any state. Compare up to 5 cars side by side.',
  keywords: [
    'stamp duty calculator Australia',
    'car stamp duty NSW',
    'car stamp duty VIC',
    'car stamp duty QLD',
    'registration cost calculator',
    'rego calculator Australia',
    'CTP calculator',
    'car transport cost Australia',
    'interstate car transport',
    'buy car interstate Australia',
    'car delivery cost',
    'true cost of car',
    'on road costs calculator',
    'vehicle duty calculator',
    'motor vehicle stamp duty',
  ],
  openGraph: {
    title: 'Car Cost Calculator | Stamp Duty, Rego & Transport Costs',
    description:
      'Calculate the true delivered cost of any car in Australia. Compare stamp duty, registration, CTP, and transport costs across all states.',
    type: 'website',
    locale: 'en_AU',
    url: 'https://landedx.com.au/calculator',
  },
  alternates: {
    canonical: 'https://landedx.com.au/calculator',
  },
};

export default function CalculatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
