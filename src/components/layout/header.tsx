'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Car, Menu, X, Heart, Search, User, Calculator } from 'lucide-react';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-700">
            <Car className="h-6 w-6 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold text-gray-900">landed<span className="font-black text-purple-700">X</span></span>
            <span className="text-xs text-gray-500">Find your car anywhere in Australia</span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-6 md:flex">
          <Link
            href="/calculator"
            className="flex items-center gap-1.5 text-sm font-medium text-purple-700 hover:text-purple-800"
          >
            <Calculator className="h-4 w-4" />
            Cost Calculator
          </Link>
          <Link
            href="/search"
            className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            <Search className="h-4 w-4" />
            Search
          </Link>
          <Link
            href="/saved"
            className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            <Heart className="h-4 w-4" />
            Saved
          </Link>
        </div>

        {/* Desktop Auth Buttons */}
        <div className="hidden items-center gap-3 md:flex">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/auth/login">Log in</Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/auth/signup">Sign up</Link>
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <button
          type="button"
          className="md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? (
            <X className="h-6 w-6 text-gray-600" />
          ) : (
            <Menu className="h-6 w-6 text-gray-600" />
          )}
        </button>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="border-t border-gray-200 bg-white md:hidden">
          <div className="space-y-1 px-4 py-3">
            <Link
              href="/calculator"
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-base font-medium text-purple-700 hover:bg-purple-50 hover:text-purple-800"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Calculator className="h-5 w-5" />
              Cost Calculator
            </Link>
            <Link
              href="/search"
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-base font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Search className="h-5 w-5" />
              Search Cars
            </Link>
            <Link
              href="/saved"
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-base font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Heart className="h-5 w-5" />
              Saved Cars
            </Link>
            <hr className="my-2" />
            <Link
              href="/auth/login"
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-base font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              onClick={() => setMobileMenuOpen(false)}
            >
              <User className="h-5 w-5" />
              Log in
            </Link>
            <div className="px-3 py-2">
              <Button className="w-full" asChild>
                <Link href="/auth/signup" onClick={() => setMobileMenuOpen(false)}>
                  Sign up
                </Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
