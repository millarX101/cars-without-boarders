'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Heart, MapPin, Gauge, Fuel, Settings2, Car } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatPrice, formatNumber } from '@/lib/utils/format';
import { cn } from '@/lib/utils/cn';

interface CarCardProps {
  listing: {
    id: string;
    source: string;
    make: string;
    model: string;
    variant?: string;
    year: number;
    price: number;
    odometer?: number;
    transmission?: string;
    fuelType?: string;
    sellerState: string;
    sellerSuburb?: string;
    sellerType?: string;
    title: string;
    images: string[];
    costs: {
      vehiclePrice: number;
      transport: { cost: number; type: string };
      stampDuty: { amount: number };
      registration: { amount: number };
      roadworthy: { cost: number };
      totalDelivered: number;
    };
  };
  deliveryState: string;
  onSave?: () => void;
  isSaved?: boolean;
}

export function CarCard({ listing, deliveryState, onSave, isSaved = false }: CarCardProps) {
  const savings = listing.price - listing.costs.totalDelivered;
  const hasSavings = listing.costs.transport.cost > 0 && savings < 0;

  return (
    <Card className="group overflow-hidden transition-shadow hover:shadow-lg">
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
        {listing.images[0] && !listing.images[0].includes('placeholder') ? (
          <Image
            src={listing.images[0]}
            alt={listing.title}
            fill
            className="object-cover transition-transform group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 text-gray-400">
            <Car className="h-16 w-16 text-gray-300" />
            <span className="mt-2 text-sm">Image coming soon</span>
          </div>
        )}

        {/* Badges */}
        <div className="absolute left-2 top-2 flex flex-wrap gap-1.5">
          <Badge variant={listing.source === 'carsales' ? 'default' : 'secondary'}>
            {listing.source === 'carsales' ? 'Carsales' : 'Gumtree'}
          </Badge>
          {listing.sellerType === 'dealer' && (
            <Badge variant="outline" className="bg-white/90">
              Dealer
            </Badge>
          )}
        </div>

        {/* Save Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            onSave?.();
          }}
          className={cn(
            'absolute right-2 top-2 rounded-full bg-white/90 p-2 shadow-sm transition-colors hover:bg-white',
            isSaved && 'text-red-500'
          )}
        >
          <Heart className={cn('h-5 w-5', isSaved && 'fill-current')} />
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Title */}
        <Link href={`/car/${listing.id}`} className="block">
          <h3 className="font-semibold text-gray-900 group-hover:text-blue-600">
            {listing.year} {listing.make} {listing.model}
          </h3>
          {listing.variant && (
            <p className="text-sm text-gray-500">{listing.variant}</p>
          )}
        </Link>

        {/* Specs */}
        <div className="mt-3 flex flex-wrap gap-3 text-sm text-gray-600">
          {listing.odometer && (
            <span className="flex items-center gap-1">
              <Gauge className="h-4 w-4" />
              {formatNumber(listing.odometer)} km
            </span>
          )}
          {listing.transmission && (
            <span className="flex items-center gap-1">
              <Settings2 className="h-4 w-4" />
              {listing.transmission === 'automatic' ? 'Auto' : 'Manual'}
            </span>
          )}
          {listing.fuelType && (
            <span className="flex items-center gap-1">
              <Fuel className="h-4 w-4" />
              {listing.fuelType.charAt(0).toUpperCase() + listing.fuelType.slice(1)}
            </span>
          )}
        </div>

        {/* Location */}
        <div className="mt-2 flex items-center gap-1 text-sm text-gray-500">
          <MapPin className="h-4 w-4" />
          {listing.sellerSuburb ? `${listing.sellerSuburb}, ` : ''}{listing.sellerState}
        </div>

        {/* Pricing */}
        <div className="mt-4 space-y-2 border-t border-gray-100 pt-4">
          {/* Listed Price */}
          <div className="flex items-baseline justify-between">
            <span className="text-sm text-gray-500">Listed price</span>
            <span className="font-medium">{formatPrice(listing.price)}</span>
          </div>

          {/* Delivered Price */}
          <div className="flex items-baseline justify-between">
            <span className="text-sm font-medium text-gray-700">
              Delivered to {deliveryState}
            </span>
            <span className="text-lg font-bold text-blue-600">
              {formatPrice(listing.costs.totalDelivered)}
            </span>
          </div>

          {/* Cost Breakdown Hint */}
          {listing.costs.transport.cost > 0 && (
            <p className="text-xs text-gray-400">
              Incl. {formatPrice(listing.costs.transport.cost)} transport +{' '}
              {formatPrice(listing.costs.stampDuty.amount + listing.costs.registration.amount)} on-road
            </p>
          )}

          {/* Savings Badge */}
          {!hasSavings && listing.sellerState === deliveryState && (
            <Badge variant="success" className="mt-2">
              Local pickup available
            </Badge>
          )}
        </div>

        {/* CTA */}
        <Button asChild className="mt-4 w-full" variant="outline">
          <Link href={`/car/${listing.id}`}>View Details</Link>
        </Button>
      </div>
    </Card>
  );
}
