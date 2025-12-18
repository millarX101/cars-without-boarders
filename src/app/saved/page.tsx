'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatPrice, formatNumber, formatRelativeDate } from '@/lib/utils/format';
import { Heart, Trash2, ExternalLink, Bell, Search, MapPin, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface SavedCar {
  id: string;
  listing_id: string;
  delivery_state: string;
  total_delivered: number | null;
  created_at: string;
  listing: {
    id: string;
    make: string;
    model: string;
    year: number;
    price: number;
    odometer: number | null;
    seller_state: string;
    seller_suburb: string | null;
    title: string;
    status: string;
    images: { url: string }[];
  };
}

interface SavedSearch {
  id: string;
  name: string;
  criteria: Record<string, unknown>;
  delivery_state: string;
  delivery_postcode: string | null;
  email_alerts: boolean;
  last_results_count: number;
  created_at: string;
}

type Tab = 'cars' | 'searches';

export default function SavedPage() {
  const [activeTab, setActiveTab] = useState<Tab>('cars');
  const [savedCars, setSavedCars] = useState<SavedCar[]>([]);
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    checkAuthAndFetchData();
  }, []);

  const checkAuthAndFetchData = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setIsLoggedIn(false);
      setLoading(false);
      return;
    }

    setIsLoggedIn(true);

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: cars } = await (supabase as any)
        .from('saved_cars')
        .select(`
          id, listing_id, delivery_state, total_delivered, created_at,
          listing:marketplace_listings(id, make, model, year, price, odometer,
            seller_state, seller_suburb, title, status, images:listing_images(url))
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (cars) setSavedCars(cars);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: searches } = await (supabase as any)
        .from('saved_searches')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (searches) setSavedSearches(searches);
    } catch (err) {
      console.error('Error fetching saved items:', err);
    }

    setLoading(false);
  };

  const removeSavedCar = async (id: string) => {
    const supabase = createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any).from('saved_cars').delete().eq('id', id);
    if (!error) setSavedCars(savedCars.filter(c => c.id !== id));
  };

  const removeSavedSearch = async (id: string) => {
    const supabase = createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any).from('saved_searches').delete().eq('id', id);
    if (!error) setSavedSearches(savedSearches.filter(s => s.id !== id));
  };

  const toggleSearchAlerts = async (id: string) => {
    const search = savedSearches.find(s => s.id === id);
    if (!search) return;
    const supabase = createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from('saved_searches')
      .update({ email_alerts: !search.email_alerts })
      .eq('id', id);
    if (!error) {
      setSavedSearches(savedSearches.map(s =>
        s.id === id ? { ...s, email_alerts: !s.email_alerts } : s
      ));
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-fuchsia-700" />
      </div>
    );
  }

  if (isLoggedIn === false) {
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
                ? 'border-fuchsia-700 text-fuchsia-700'
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
                ? 'border-fuchsia-700 text-fuchsia-700'
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
                        {saved.listing?.images?.[0]?.url ? (
                          <Image
                            src={saved.listing.images[0].url}
                            alt={saved.listing.title || 'Car'}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-gray-400">
                            <Heart className="h-8 w-8" />
                          </div>
                        )}
                        {saved.listing?.status !== 'active' && (
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
                              href={`/marketplace/${saved.listing_id}`}
                              className="font-semibold text-gray-900 hover:text-fuchsia-700"
                            >
                              {saved.listing?.year} {saved.listing?.make} {saved.listing?.model}
                            </Link>
                            <div className="mt-1 flex items-center gap-3 text-sm text-gray-500">
                              {saved.listing?.odometer && (
                                <span>{formatNumber(saved.listing.odometer)} km</span>
                              )}
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {saved.listing?.seller_suburb || saved.listing?.seller_state}, {saved.listing?.seller_state}
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
                              <p className="font-medium">{formatPrice(saved.listing?.price || 0)}</p>
                            </div>
                            {saved.total_delivered && (
                              <div>
                                <p className="text-xs text-gray-500">Delivered to {saved.delivery_state}</p>
                                <p className="font-bold text-fuchsia-700">{formatPrice(saved.total_delivered)}</p>
                              </div>
                            )}
                          </div>
                          <div className="text-right text-xs text-gray-400">
                            Saved {formatRelativeDate(saved.created_at)}
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
              {savedSearches.map((search) => {
                const criteria = search.criteria as Record<string, unknown>;
                return (
                <Card key={search.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-gray-900">{search.name}</h3>
                          {search.email_alerts && (
                            <Badge variant="secondary" className="gap-1">
                              <Bell className="h-3 w-3" />
                              Alerts on
                            </Badge>
                          )}
                        </div>
                        <div className="mt-1 flex flex-wrap gap-2 text-sm text-gray-500">
                          {criteria.query ? <span>&quot;{String(criteria.query)}&quot;</span> : null}
                          {criteria.make ? <span>{String(criteria.make)}</span> : null}
                          {criteria.model ? <span>{String(criteria.model)}</span> : null}
                          {criteria.maxPrice ? <span>Under {formatPrice(Number(criteria.maxPrice))}</span> : null}
                          {criteria.fuelType ? <span className="capitalize">{String(criteria.fuelType)}</span> : null}
                          {criteria.minYear ? <span>{String(criteria.minYear)}+</span> : null}
                        </div>
                        <p className="mt-2 text-sm text-gray-600">
                          {search.last_results_count} results • Delivering to {search.delivery_state} {search.delivery_postcode}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => toggleSearchAlerts(search.id)}
                          className={search.email_alerts ? 'text-fuchsia-700' : 'text-gray-400'}
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
                            Object.entries(criteria).reduce((acc, [key, value]) => {
                              if (value !== undefined && value !== null) acc[key] = String(value);
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
                );
              })}
            </div>
          )
        )}
      </div>
    </div>
  );
}
