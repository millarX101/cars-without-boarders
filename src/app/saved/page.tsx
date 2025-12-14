'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatPrice, formatNumber, formatRelativeDate } from '@/lib/utils/format';
import { Heart, Trash2, ExternalLink, Bell, Search, MapPin } from 'lucide-react';

// Mock saved cars
const MOCK_SAVED_CARS = [
  {
    id: '1',
    listing: {
      id: '1',
      make: 'Mini',
      model: 'Cooper SE',
      year: 2023,
      price: 52990,
      odometer: 12500,
      sellerState: 'VIC',
      sellerSuburb: 'Richmond',
      image: 'https://via.placeholder.com/400x300?text=Mini+Cooper+SE',
      isActive: true,
    },
    deliveryState: 'NSW',
    totalDelivered: 56560,
    savedAt: '2024-01-10T10:30:00Z',
  },
  {
    id: '2',
    listing: {
      id: '2',
      make: 'Tesla',
      model: 'Model 3',
      year: 2023,
      price: 55990,
      odometer: 15000,
      sellerState: 'NSW',
      sellerSuburb: 'Parramatta',
      image: 'https://via.placeholder.com/400x300?text=Tesla+Model+3',
      isActive: true,
    },
    deliveryState: 'NSW',
    totalDelivered: 59080,
    savedAt: '2024-01-08T14:20:00Z',
  },
];

// Mock saved searches
const MOCK_SAVED_SEARCHES = [
  {
    id: '1',
    name: 'Electric Hatchbacks',
    criteria: {
      query: 'electric hatchback',
      maxPrice: 60000,
      fuelType: 'electric',
    },
    deliveryState: 'NSW',
    deliveryPostcode: '2000',
    emailAlerts: true,
    resultsCount: 45,
    createdAt: '2024-01-05T09:00:00Z',
  },
  {
    id: '2',
    name: 'Mini Cooper',
    criteria: {
      make: 'Mini',
      model: 'Cooper',
      minYear: 2020,
    },
    deliveryState: 'NSW',
    deliveryPostcode: '2000',
    emailAlerts: false,
    resultsCount: 28,
    createdAt: '2024-01-03T16:45:00Z',
  },
];

type Tab = 'cars' | 'searches';

export default function SavedPage() {
  const [activeTab, setActiveTab] = useState<Tab>('cars');
  const [savedCars, setSavedCars] = useState(MOCK_SAVED_CARS);
  const [savedSearches, setSavedSearches] = useState(MOCK_SAVED_SEARCHES);

  // Check if user is logged in (mock)
  const isLoggedIn = true;

  const removeSavedCar = (id: string) => {
    setSavedCars(savedCars.filter(c => c.id !== id));
  };

  const removeSavedSearch = (id: string) => {
    setSavedSearches(savedSearches.filter(s => s.id !== id));
  };

  const toggleSearchAlerts = (id: string) => {
    setSavedSearches(savedSearches.map(s =>
      s.id === id ? { ...s, emailAlerts: !s.emailAlerts } : s
    ));
  };

  if (!isLoggedIn) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <Card className="max-w-md text-center">
          <CardContent className="py-12">
            <Heart className="mx-auto h-12 w-12 text-gray-400" />
            <h2 className="mt-4 text-xl font-semibold text-gray-900">Sign in to save cars</h2>
            <p className="mt-2 text-gray-500">
              Create an account to save your favourite cars and searches.
            </p>
            <div className="mt-6 flex gap-3 justify-center">
              <Button asChild>
                <Link href="/auth/login">Sign in</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/auth/signup">Create account</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Saved</h1>
          <p className="mt-2 text-gray-600">
            Your saved cars and searches in one place
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-2 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('cars')}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 -mb-px ${
              activeTab === 'cars'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Heart className="h-4 w-4" />
            Saved Cars ({savedCars.length})
          </button>
          <button
            onClick={() => setActiveTab('searches')}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 -mb-px ${
              activeTab === 'searches'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Search className="h-4 w-4" />
            Saved Searches ({savedSearches.length})
          </button>
        </div>

        {/* Content */}
        {activeTab === 'cars' ? (
          savedCars.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Heart className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-4 text-lg font-semibold text-gray-900">No saved cars</h3>
                <p className="mt-2 text-gray-500">
                  Start searching and save cars you like to compare later.
                </p>
                <Button asChild className="mt-4">
                  <Link href="/search">Search Cars</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {savedCars.map((saved) => (
                <Card key={saved.id}>
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      {/* Image */}
                      <div className="relative h-24 w-32 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                        <Image
                          src={saved.listing.image}
                          alt={`${saved.listing.year} ${saved.listing.make} ${saved.listing.model}`}
                          fill
                          className="object-cover"
                        />
                        {!saved.listing.isActive && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                            <Badge variant="destructive">Sold</Badge>
                          </div>
                        )}
                      </div>

                      {/* Details */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <Link
                              href={`/car/${saved.listing.id}`}
                              className="font-semibold text-gray-900 hover:text-blue-600"
                            >
                              {saved.listing.year} {saved.listing.make} {saved.listing.model}
                            </Link>
                            <div className="mt-1 flex items-center gap-3 text-sm text-gray-500">
                              <span>{formatNumber(saved.listing.odometer)} km</span>
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {saved.listing.sellerSuburb}, {saved.listing.sellerState}
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={() => removeSavedCar(saved.id)}
                            className="text-gray-400 hover:text-red-500"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>

                        <div className="mt-3 flex items-center justify-between">
                          <div className="flex gap-4">
                            <div>
                              <p className="text-xs text-gray-500">Listed</p>
                              <p className="font-medium">{formatPrice(saved.listing.price)}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Delivered to {saved.deliveryState}</p>
                              <p className="font-bold text-blue-600">{formatPrice(saved.totalDelivered)}</p>
                            </div>
                          </div>
                          <div className="text-right text-xs text-gray-400">
                            Saved {formatRelativeDate(saved.savedAt)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )
        ) : (
          savedSearches.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Search className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-4 text-lg font-semibold text-gray-900">No saved searches</h3>
                <p className="mt-2 text-gray-500">
                  Save your searches to quickly access them later.
                </p>
                <Button asChild className="mt-4">
                  <Link href="/search">Start Searching</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {savedSearches.map((search) => (
                <Card key={search.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-gray-900">{search.name}</h3>
                          {search.emailAlerts && (
                            <Badge variant="secondary" className="gap-1">
                              <Bell className="h-3 w-3" />
                              Alerts on
                            </Badge>
                          )}
                        </div>
                        <div className="mt-1 flex flex-wrap gap-2 text-sm text-gray-500">
                          {search.criteria.query && <span>"{search.criteria.query}"</span>}
                          {search.criteria.make && <span>{search.criteria.make}</span>}
                          {search.criteria.model && <span>{search.criteria.model}</span>}
                          {search.criteria.maxPrice && <span>Under {formatPrice(search.criteria.maxPrice)}</span>}
                          {search.criteria.fuelType && <span className="capitalize">{search.criteria.fuelType}</span>}
                          {search.criteria.minYear && <span>{search.criteria.minYear}+</span>}
                        </div>
                        <p className="mt-2 text-sm text-gray-600">
                          {search.resultsCount} results • Delivering to {search.deliveryState} {search.deliveryPostcode}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => toggleSearchAlerts(search.id)}
                          className={search.emailAlerts ? 'text-blue-600' : 'text-gray-400'}
                        >
                          <Bell className="h-5 w-5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeSavedSearch(search.id)}
                          className="text-gray-400 hover:text-red-500"
                        >
                          <Trash2 className="h-5 w-5" />
                        </Button>
                        <Button asChild>
                          <Link href={`/search?${new URLSearchParams(
                            Object.entries(search.criteria).reduce((acc, [key, value]) => {
                              if (value !== undefined) acc[key] = String(value);
                              return acc;
                            }, {} as Record<string, string>)
                          ).toString()}`}>
                            View Results
                            <ExternalLink className="ml-2 h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}
