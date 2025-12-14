import { SearchBar } from '@/components/search/search-bar';
import { Car, TrendingUp, Truck, Calculator, Shield } from 'lucide-react';

const features = [
  {
    icon: <TrendingUp className="h-6 w-6" />,
    title: 'Compare Prices Nationwide',
    description: 'Search cars from Carsales and Gumtree across all Australian states in one place.',
  },
  {
    icon: <Calculator className="h-6 w-6" />,
    title: 'True Cost Calculator',
    description: 'See the real delivered price including transport, stamp duty, rego, and CTP.',
  },
  {
    icon: <Truck className="h-6 w-6" />,
    title: 'Transport Included',
    description: 'Get instant transport quotes and arrange delivery to your doorstep.',
  },
  {
    icon: <Shield className="h-6 w-6" />,
    title: 'No Hidden Costs',
    description: 'All on-road costs calculated upfront so you know exactly what you\'ll pay.',
  },
];

const stats = [
  { label: 'Cars Listed', value: '50,000+' },
  { label: 'States Covered', value: '8' },
  { label: 'Average Savings', value: '$2,500' },
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
              <Car className="h-4 w-4" />
              Find your perfect car, anywhere in Australia
            </div>

            <h1 className="mt-6 text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Cars Without Borders
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-lg text-blue-100 sm:text-xl">
              Compare used cars across Australia and see the{' '}
              <span className="font-semibold text-white">true delivered cost</span> to your
              location. No surprises, no hidden fees.
            </p>

            {/* Stats */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-8 text-white">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-3xl font-bold">{stat.value}</div>
                  <div className="text-sm text-blue-200">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Search Bar */}
          <div className="mx-auto mt-12 max-w-4xl">
            <SearchBar />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Why use Cars Without Borders?
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
              We make it easy to find the best car deal, no matter where it is in Australia.
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

      {/* How It Works */}
      <section className="bg-gray-100 py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              How it works
            </h2>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {[
              {
                step: '1',
                title: 'Search for your car',
                description: 'Enter the make and model you\'re looking for and your location.',
                icon: <Car className="h-8 w-8" />,
              },
              {
                step: '2',
                title: 'Compare total costs',
                description: 'See listings from across Australia with full delivered costs calculated.',
                icon: <Calculator className="h-8 w-8" />,
              },
              {
                step: '3',
                title: 'Save or book transport',
                description: 'Save your favourites or arrange transport directly through us.',
                icon: <Truck className="h-8 w-8" />,
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
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 py-16">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            Ready to find your next car?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-blue-100">
            Start searching now and discover cars you might have missed - with full cost
            transparency.
          </p>
          <div className="mt-8 flex justify-center">
            <SearchBar variant="compact" />
          </div>
        </div>
      </section>
    </div>
  );
}
