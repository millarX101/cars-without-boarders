export const metadata = {
  title: 'Privacy Policy',
  description: 'Privacy Policy for landedX - how we handle your data.',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-fuchsia-700 to-fuchsia-900 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white sm:text-5xl">Privacy Policy</h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-fuchsia-100">
              Last updated: December 2024
            </p>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="prose prose-lg mx-auto">
            <div className="rounded-lg bg-white p-8 shadow-sm space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Introduction</h2>
                <p className="mt-4 text-gray-600">
                  landedX (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) is committed to protecting your privacy.
                  This Privacy Policy explains how we collect, use, disclose, and safeguard your information
                  when you visit our website and use our services.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-900">Information We Collect</h2>
                <p className="mt-4 text-gray-600">We may collect information about you in various ways:</p>
                <ul className="mt-4 list-disc pl-6 text-gray-600 space-y-2">
                  <li><strong>Personal Data:</strong> When you create an account, we collect your email address and any profile information you provide.</li>
                  <li><strong>Usage Data:</strong> We automatically collect information about how you use our website, including pages visited, search queries, and interactions.</li>
                  <li><strong>Location Data:</strong> We may collect your postcode to provide accurate delivery cost calculations.</li>
                  <li><strong>Cookies:</strong> We use cookies and similar technologies to enhance your experience and analyse usage patterns.</li>
                </ul>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-900">How We Use Your Information</h2>
                <p className="mt-4 text-gray-600">We use the information we collect to:</p>
                <ul className="mt-4 list-disc pl-6 text-gray-600 space-y-2">
                  <li>Provide and maintain our services</li>
                  <li>Calculate accurate delivery costs based on your location</li>
                  <li>Save your preferences and favourite cars</li>
                  <li>Send you updates about saved searches (if you opt in)</li>
                  <li>Improve our website and services</li>
                  <li>Respond to your enquiries and support requests</li>
                </ul>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-900">Information Sharing</h2>
                <p className="mt-4 text-gray-600">
                  We do not sell your personal information. We may share your information with:
                </p>
                <ul className="mt-4 list-disc pl-6 text-gray-600 space-y-2">
                  <li><strong>Service Providers:</strong> Third parties who help us operate our website and services (e.g., hosting, analytics)</li>
                  <li><strong>Transport Partners:</strong> If you request transport quotes, we may share relevant details with transport providers</li>
                  <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
                </ul>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-900">Data Security</h2>
                <p className="mt-4 text-gray-600">
                  We implement appropriate technical and organisational measures to protect your personal
                  information. However, no method of transmission over the Internet is 100% secure, and
                  we cannot guarantee absolute security.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-900">Your Rights</h2>
                <p className="mt-4 text-gray-600">You have the right to:</p>
                <ul className="mt-4 list-disc pl-6 text-gray-600 space-y-2">
                  <li>Access the personal information we hold about you</li>
                  <li>Request correction of inaccurate information</li>
                  <li>Request deletion of your account and data</li>
                  <li>Opt out of marketing communications</li>
                  <li>Withdraw consent where processing is based on consent</li>
                </ul>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-900">Cookies</h2>
                <p className="mt-4 text-gray-600">
                  We use cookies to improve your experience, remember your preferences, and analyse how
                  our website is used. You can control cookies through your browser settings, but
                  disabling cookies may affect functionality.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-900">Third-Party Links</h2>
                <p className="mt-4 text-gray-600">
                  Our website contains links to third-party websites (car listings). We are not
                  responsible for the privacy practices of these external sites. We encourage you
                  to review their privacy policies.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-900">Changes to This Policy</h2>
                <p className="mt-4 text-gray-600">
                  We may update this Privacy Policy from time to time. We will notify you of any
                  changes by posting the new Privacy Policy on this page and updating the
                  &quot;Last updated&quot; date.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-900">Contact Us</h2>
                <p className="mt-4 text-gray-600">
                  If you have any questions about this Privacy Policy, please contact us at:
                </p>
                <p className="mt-2 text-gray-600">
                  <a href="mailto:privacy@landedx.com.au" className="text-fuchsia-700 hover:underline">
                    privacy@landedx.com.au
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
