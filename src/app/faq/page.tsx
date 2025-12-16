export const metadata = {
  title: 'FAQ',
  description: 'Frequently asked questions about landedX and calculating true car costs in Australia.',
};

const faqs = [
  {
    question: 'How accurate are the cost calculations?',
    answer: 'Our calculations are based on current government rates and industry averages. Stamp duty and registration fees are calculated using official state government formulas. Transport costs are estimates based on real industry rates. Always verify final costs with service providers before committing.',
  },
  {
    question: 'Can I really save money buying a car from another state?',
    answer: 'Yes! Car prices vary significantly between states due to supply, demand, and local market conditions. Even after factoring in transport, stamp duty, and registration costs, you can often save thousands by buying interstate. Our calculator helps you see the true delivered cost to make an informed decision.',
  },
  {
    question: 'How does stamp duty work for interstate purchases?',
    answer: 'You pay stamp duty in the state where you will register the vehicle, not where you buy it. Each state has different rates and calculation methods. Some states offer exemptions or reduced rates for electric vehicles.',
  },
  {
    question: 'Do I need a roadworthy certificate for interstate purchases?',
    answer: 'Yes, when transferring a vehicle from another state, you typically need a safety inspection (called different things in each state - Blue Slip in NSW, RWC in VIC, Safety Certificate in QLD, etc.). We include estimated inspection costs in our calculations.',
  },
  {
    question: 'How is transport arranged?',
    answer: 'You can arrange transport through professional car carriers who specialise in interstate vehicle transport. Options include open carriers (more economical) and enclosed carriers (better protection). Transport typically takes 2-10 days depending on the route.',
  },
  {
    question: 'What about warranty on used cars?',
    answer: 'Dealer warranties and statutory consumer guarantees apply regardless of which state you purchase from. Private sales typically have no warranty. Always check warranty terms and transferability before purchasing.',
  },
  {
    question: 'Where do you get your car listings?',
    answer: 'We aggregate listings from major Australian automotive marketplaces including Carsales and Gumtree. Our system regularly updates to show current availability and prices.',
  },
  {
    question: 'Is this service free?',
    answer: 'Yes, searching and comparing cars is completely free. We may offer optional services like transport booking in the future, but our core comparison tool will always be free to use.',
  },
  {
    question: 'How do I contact a seller?',
    answer: 'Click through to the original listing to contact the seller directly. We provide links to the source listing where you can find contact details and arrange viewings or purchases.',
  },
  {
    question: 'Can I save cars to compare later?',
    answer: 'Yes! Create a free account to save cars and compare them side by side. Your saved cars will include the calculated delivery costs to your location.',
  },
];

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-600 to-indigo-700 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white sm:text-5xl">Frequently Asked Questions</h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-blue-100">
              Everything you need to know about buying cars interstate.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ List */}
      <section className="py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <div key={index} className="rounded-lg bg-white p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900">{faq.question}</h3>
                <p className="mt-3 text-gray-600">{faq.answer}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 rounded-lg bg-blue-50 p-6 text-center">
            <h3 className="text-lg font-semibold text-gray-900">Still have questions?</h3>
            <p className="mt-2 text-gray-600">
              Can&apos;t find what you&apos;re looking for? Get in touch with us.
            </p>
            <a
              href="/contact"
              className="mt-4 inline-block rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700"
            >
              Contact Us
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
