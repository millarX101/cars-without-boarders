import { Car, Users, Target, Shield } from 'lucide-react';

export const metadata = {
  title: 'About Us',
  description: 'Learn about landedX - see the true delivered cost of any car in Australia.',
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-purple-700 to-purple-900 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white sm:text-5xl">About landed<span className="font-black">X</span></h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-purple-100">
              Helping Australians find the best car deals, no matter where they are.
            </p>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold text-gray-900">Our Mission</h2>
            <p className="mt-6 text-lg text-gray-600">
              We believe buying a car shouldn&apos;t be limited by state borders. Our platform aggregates
              listings from across Australia and calculates the true delivered cost to your door,
              including transport, stamp duty, registration, and all on-road costs.
            </p>
            <p className="mt-4 text-lg text-gray-600">
              This transparency helps you make informed decisions and potentially save thousands
              by finding better deals interstate.
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-3xl font-bold text-gray-900">What We Stand For</h2>
          <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: <Target className="h-8 w-8" />,
                title: 'Transparency',
                description: 'No hidden costs. We show you the full picture before you commit.',
              },
              {
                icon: <Users className="h-8 w-8" />,
                title: 'Accessibility',
                description: 'Making interstate car buying simple and accessible for everyone.',
              },
              {
                icon: <Shield className="h-8 w-8" />,
                title: 'Trust',
                description: 'Accurate calculations based on official government rates and industry data.',
              },
              {
                icon: <Car className="h-8 w-8" />,
                title: 'Choice',
                description: 'Access to thousands of listings from multiple sources across Australia.',
              },
            ].map((value) => (
              <div key={value.title} className="text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-purple-100 text-purple-700">
                  {value.icon}
                </div>
                <h3 className="mt-4 text-lg font-semibold text-gray-900">{value.title}</h3>
                <p className="mt-2 text-sm text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-3xl font-bold text-gray-900">How Our Calculations Work</h2>
          <div className="mt-12 mx-auto max-w-3xl">
            <div className="space-y-6">
              <div className="rounded-lg bg-white p-6 shadow-sm">
                <h3 className="font-semibold text-gray-900">Transport Costs</h3>
                <p className="mt-2 text-gray-600">
                  Based on real industry rates for enclosed and open carrier transport between all Australian states.
                </p>
              </div>
              <div className="rounded-lg bg-white p-6 shadow-sm">
                <h3 className="font-semibold text-gray-900">Stamp Duty</h3>
                <p className="mt-2 text-gray-600">
                  Calculated using current state government rates, including EV exemptions and concessions where applicable.
                </p>
              </div>
              <div className="rounded-lg bg-white p-6 shadow-sm">
                <h3 className="font-semibold text-gray-900">Registration & CTP</h3>
                <p className="mt-2 text-gray-600">
                  Includes registration fees and compulsory third party insurance for your destination state.
                </p>
              </div>
              <div className="rounded-lg bg-white p-6 shadow-sm">
                <h3 className="font-semibold text-gray-900">Roadworthy & Inspections</h3>
                <p className="mt-2 text-gray-600">
                  Interstate purchases require safety inspections - we include these costs in our calculations.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
