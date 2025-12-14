'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';

const AUSTRALIAN_STATES = [
  { value: 'NSW', label: 'New South Wales' },
  { value: 'VIC', label: 'Victoria' },
  { value: 'QLD', label: 'Queensland' },
  { value: 'SA', label: 'South Australia' },
  { value: 'WA', label: 'Western Australia' },
  { value: 'TAS', label: 'Tasmania' },
  { value: 'ACT', label: 'Australian Capital Territory' },
  { value: 'NT', label: 'Northern Territory' },
];

interface SearchBarProps {
  variant?: 'hero' | 'compact';
  defaultQuery?: string;
  defaultState?: string;
  defaultPostcode?: string;
}

export function SearchBar({
  variant = 'hero',
  defaultQuery = '',
  defaultState = 'NSW',
  defaultPostcode = '2000',
}: SearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState(defaultQuery);
  const [deliveryState, setDeliveryState] = useState(defaultState);
  const [postcode, setPostcode] = useState(defaultPostcode);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    const params = new URLSearchParams();
    if (query) params.set('q', query);
    params.set('deliveryState', deliveryState);
    params.set('postcode', postcode);

    router.push(`/search?${params.toString()}`);
  };

  if (variant === 'compact') {
    return (
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            placeholder="Search make, model..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button type="submit">Search</Button>
      </form>
    );
  }

  return (
    <form onSubmit={handleSearch} className="w-full max-w-4xl">
      <div className="rounded-2xl bg-white p-4 shadow-xl ring-1 ring-gray-200 sm:p-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Search Query */}
          <div className="sm:col-span-2">
            <label htmlFor="search" className="mb-1.5 block text-sm font-medium text-gray-700">
              What are you looking for?
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <Input
                id="search"
                type="text"
                placeholder="e.g. Mini Cooper, Tesla Model 3"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="h-12 pl-10 text-base"
              />
            </div>
          </div>

          {/* Delivery State */}
          <div>
            <label htmlFor="state" className="mb-1.5 block text-sm font-medium text-gray-700">
              Deliver to
            </label>
            <Select
              id="state"
              value={deliveryState}
              onChange={(e) => setDeliveryState(e.target.value)}
              options={AUSTRALIAN_STATES}
              className="h-12"
            />
          </div>

          {/* Postcode */}
          <div>
            <label htmlFor="postcode" className="mb-1.5 block text-sm font-medium text-gray-700">
              Postcode
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <Input
                id="postcode"
                type="text"
                placeholder="e.g. 2000"
                value={postcode}
                onChange={(e) => setPostcode(e.target.value)}
                maxLength={4}
                className="h-12 pl-10"
              />
            </div>
          </div>
        </div>

        {/* Search Button */}
        <Button type="submit" size="lg" className="mt-4 w-full sm:mt-6">
          <Search className="mr-2 h-5 w-5" />
          Find Cars
        </Button>
      </div>

      {/* Helper Text */}
      <p className="mt-4 text-center text-sm text-gray-500">
        We&apos;ll show you the total delivered cost including transport, stamp duty, rego &amp; CTP
      </p>
    </form>
  );
}
