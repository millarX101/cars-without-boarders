import Link from 'next/link';
import { Car } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-fuchsia-700">
                <Car className="h-6 w-6 text-white" />
              </div>
              <span className="text-lg font-bold text-gray-900">landed<span className="font-black text-fuchsia-700">X</span></span>
            </Link>
            <p className="mt-4 max-w-md text-sm text-gray-600">
              Compare used car prices across Australia. Find the best deals by calculating
              the true delivered cost including transport, stamp duty, and registration.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Quick Links</h3>
            <ul className="mt-4 space-y-3">
              <li>
                <Link href="/search" className="text-sm text-gray-600 hover:text-gray-900">
                  Search Cars
                </Link>
              </li>
              <li>
                <Link href="/compare" className="text-sm text-gray-600 hover:text-gray-900">
                  Compare Cars
                </Link>
              </li>
              <li>
                <Link href="/saved" className="text-sm text-gray-600 hover:text-gray-900">
                  Saved Cars
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Resources</h3>
            <ul className="mt-4 space-y-3">
              <li>
                <Link href="/about" className="text-sm text-gray-600 hover:text-gray-900">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-sm text-gray-600 hover:text-gray-900">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm text-gray-600 hover:text-gray-900">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-sm text-gray-600 hover:text-gray-900">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-gray-200 pt-8">
          <p className="text-center text-sm text-gray-500">
            &copy; {new Date().getFullYear()} landedX. All rights reserved.
          </p>
          <p className="mt-2 text-center text-xs text-gray-400">
            Prices and costs are estimates only. Always verify with official sources before purchasing.
          </p>
        </div>
      </div>
    </footer>
  );
}
