import Link from 'next/link';
import { Car, TrendingUp, Truck, Calculator, Shield, ArrowRight, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const features = [
  {
    icon: <Calculator className="h-6 w-6" />,
    title: 'True Cost Calculator',
    description: 'See the real delivered price including transport, stamp duty, rego, and CTP.',
  },
  {
    icon: <TrendingUp className="h-6 w-6" />,
    title: 'Compare Up to 5 Cars',
    description: 'Enter details for multiple cars and compare total costs side by side.',
  },
  {
    icon: <Truck className="h-6 w-6" />,
    title: 'Interstate Transport Costs',
    description: 'Get accurate transport estimates from any state to your location.',
  },
  {
    icon: <Shield className="h-6 w-6" />,
    title: 'No Hidden Costs',
    description: 'All on-road costs calculated upfront so you know exactly what you\'ll pay.',
  },
];

const costItems = [
  'Stamp duty by state',
  'Registration fees',
  'CTP insurance',
  'Interstate transport',
  'Roadworthy inspections',
  'EV stamp duty exemptions',
];

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 py-20 sm:py-28">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/20 px-4 py-2 text-sm font-medium text-blue-100 backdrop-blur">
              <Calculator className="h-4 w-4" />
              Calculate the true cost of any car
            </div>

            <h1 className="mt-6 text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
              What Will Your Car <span className="text-yellow-300">Really</span> Cost?
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-lg text-blue-100 sm:text-xl">
              Found a great deal interstate? Our calculator shows the{' '}
              <span className="font-semibold text-white">true delivered price</span> including
              transport, stamp duty, rego, and all on-road costs.
            </p>

            {/* CTA Buttons */}
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50" asChild>
                <Link href="/calculator" className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Try the Calculator
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10" asChild>
                <Link href="/search">
                  Browse Cars
                </Link>
              </Button>
            </div>

            {/* What's Included */}
            <div className="mx-auto mt-12 max-w-2xl">
              <p className="mb-4 text-sm font-medium text-blue-200">Costs we calculate for you:</p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                {costItems.map((item) => (
                  <span
                    key={item}
                    className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-sm text-white backdrop-blur"
                  >
                    <CheckCircle className="h-3.5 w-3.5 text-green-300" />
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works - Calculator Focus */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Compare cars from any state
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
              Enter the details from any listing and we&apos;ll calculate the total cost to get it registered at your address.
            </p>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {[
              {
                step: '1',
                title: 'Enter car details',
                description: 'Add the price, seller state, and fuel type for up to 5 cars you\'re considering.',
                icon: <Car className="h-8 w-8" />,
              },
              {
                step: '2',
                title: 'Set your location',
                description: 'Tell us which state you\'ll register the car in.',
                icon: <Calculator className="h-8 w-8" />,
              },
              {
                step: '3',
                title: 'Compare total costs',
                description: 'See the full breakdown and find which car gives you the best value.',
                icon: <TrendingUp className="h-8 w-8" />,
              },
            ].map((item) => (
              <div key={item.step} className="relative">
                <div className="flex flex-col items-center text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 text-white">
                    {item.icon}
                  </div>
                  <div className="mt-2 flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600">
                    {item.step}
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-gray-900">{item.title}</h3>
                  <p className="mt-2 text-sm text-gray-600">{item.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Button size="lg" asChild>
              <Link href="/calculator" className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Calculate Costs Now
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-gray-50 py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Why use our calculator?
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
              Don&apos;t get caught out by hidden costs when buying interstate.
            </p>
          </div>

          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="relative rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200 transition-shadow hover:shadow-md"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                  {feature.icon}
                </div>
                <h3 className="mt-4 text-lg font-semibold text-gray-900">{feature.title}</h3>
                <p className="mt-2 text-sm text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Example Savings */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 shadow-xl">
            <div className="px-6 py-12 sm:px-12 sm:py-16 lg:flex lg:items-center lg:justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white sm:text-3xl">
                  Example: A $30,000 car from Melbourne to Sydney
                </h2>
                <p className="mt-4 max-w-xl text-lg text-blue-100">
                  Transport (~$800) + Stamp Duty (~$1,050) + Rego (~$300) + CTP (~$500) = <span className="font-bold text-white">$32,650 total</span>
                </p>
                <p className="mt-2 text-sm text-blue-200">
                  Know the true cost before you commit.
                </p>
              </div>
              <div className="mt-8 lg:mt-0 lg:shrink-0">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50" asChild>
                  <Link href="/calculator" className="flex items-center gap-2">
                    Calculate Your Car
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-gray-900 py-16">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            Ready to find out the true cost?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-gray-400">
            Compare up to 5 cars and find the best deal after all costs.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700" asChild>
              <Link href="/calculator" className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Open Calculator
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
