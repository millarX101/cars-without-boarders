'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CarCostBreakdown } from '@/components/cars/car-cost-breakdown';
import { formatPrice, formatNumber } from '@/lib/utils/format';
import {
  ArrowLeft,
  Heart,
  Share2,
  ExternalLink,
  MapPin,
  Gauge,
  Fuel,
  Settings2,
  Calendar,
  Palette,
  Car,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

// Mock data - in production this would come from API
const MOCK_LISTING = {
  id: '1',
  source: 'carsales',
  sourceUrl: 'https://www.carsales.com.au/cars/details/SSE-AD-12345',
  make: 'Mini',
  model: 'Cooper SE',
  variant: 'Electric Hatch',
  year: 2023,
  price: 52990,
  odometer: 12500,
  transmission: 'automatic',
  fuelType: 'electric',
  bodyType: 'Hatchback',
  driveType: 'FWD',
  colour: 'British Racing Green',
  engineSize: null,
  cylinders: 0,
  sellerState: 'VIC',
  sellerSuburb: 'Richmond',
  sellerPostcode: '3121',
  sellerType: 'dealer',
  sellerName: 'Mini Garage Richmond',
  title: '2023 Mini Cooper SE Electric Hatch',
  description: `This stunning Mini Cooper SE is the perfect blend of iconic design and modern electric technology. With only 12,500km on the clock, this near-new vehicle is in immaculate condition.

Features include:
- Premium Navigation System
- Heated Front Seats
- Apple CarPlay & Android Auto
- Parking Sensors & Reverse Camera
- LED Headlights
- 17" Alloy Wheels

Full service history available. Still under manufacturer warranty until 2026.`,
  images: [
    'https://via.placeholder.com/800x600?text=Mini+Cooper+SE+1',
    'https://via.placeholder.com/800x600?text=Mini+Cooper+SE+2',
    'https://via.placeholder.com/800x600?text=Mini+Cooper+SE+3',
    'https://via.placeholder.com/800x600?text=Mini+Cooper+SE+4',
  ],
  features: [
    'Apple CarPlay',
    'Android Auto',
    'Heated Seats',
    'Navigation',
    'Parking Sensors',
    'Reverse Camera',
    'LED Headlights',
    'Alloy Wheels',
    'Climate Control',
    'Cruise Control',
  ],
  isActive: true,
};

export default function CarDetailPage() {
  const params = useParams();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isSaved, setIsSaved] = useState(false);

  // In production, fetch from API using params.id
  const listing = MOCK_LISTING;

  // Default delivery location - would come from user profile or selection
  const deliveryState = 'NSW';
  const deliveryPostcode = '2000';

  // Calculate costs
  const costs = {
    vehiclePrice: listing.price,
    transport: {
      cost: 450,
      type: 'interstate' as const,
      distance: 880,
      estimatedDays: { min: 2, max: 4 },
    },
    stampDuty: {
      amount: 2120,
      state: deliveryState,
      effectiveRate: '4.0%',
    },
    registration: {
      amount: 850,
      state: deliveryState,
      period: '12 months',
      includesCTP: true,
    },
    roadworthy: {
      required: true,
      cost: 150,
      reason: 'Interstate transfer requires Blue Slip inspection',
    },
    totalDelivered: listing.price + 450 + 2120 + 850 + 150,
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % listing.images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + listing.images.length) % listing.images.length);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back Navigation */}
      <div className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
          <Link
            href="/search"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to search
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <div className="relative overflow-hidden rounded-xl bg-gray-100">
              <div className="aspect-[4/3] relative">
                {listing.images[currentImageIndex] ? (
                  <Image
                    src={listing.images[currentImageIndex]}
                    alt={`${listing.title} - Image ${currentImageIndex + 1}`}
                    fill
                    className="object-cover"
                    priority
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-gray-400">
                    No image available
                  </div>
                )}

                {/* Navigation Arrows */}
                {listing.images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow-lg hover:bg-white"
                    >
                      <ChevronLeft className="h-6 w-6" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow-lg hover:bg-white"
                    >
                      <ChevronRight className="h-6 w-6" />
                    </button>
                  </>
                )}

                {/* Image Counter */}
                <div className="absolute bottom-4 right-4 rounded-full bg-black/60 px-3 py-1 text-sm text-white">
                  {currentImageIndex + 1} / {listing.images.length}
                </div>
              </div>

              {/* Thumbnails */}
              {listing.images.length > 1 && (
                <div className="flex gap-2 p-4">
                  {listing.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={`relative h-16 w-24 overflow-hidden rounded-lg ${
                        idx === currentImageIndex ? 'ring-2 ring-blue-600' : 'opacity-70 hover:opacity-100'
                      }`}
                    >
                      <Image src={img} alt="" fill className="object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Title & Actions */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Badge variant={listing.source === 'carsales' ? 'default' : 'secondary'}>
                    {listing.source === 'carsales' ? 'Carsales' : 'Gumtree'}
                  </Badge>
                  {listing.sellerType === 'dealer' && (
                    <Badge variant="outline">Dealer</Badge>
                  )}
                </div>
                <h1 className="mt-2 text-2xl font-bold text-gray-900 sm:text-3xl">
                  {listing.year} {listing.make} {listing.model}
                </h1>
                {listing.variant && (
                  <p className="mt-1 text-lg text-gray-600">{listing.variant}</p>
                )}
                <div className="mt-2 flex items-center gap-1 text-gray-500">
                  <MapPin className="h-4 w-4" />
                  {listing.sellerSuburb}, {listing.sellerState}
                  {listing.sellerName && ` • ${listing.sellerName}`}
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setIsSaved(!isSaved)}
                  className={isSaved ? 'text-red-500' : ''}
                >
                  <Heart className={`h-5 w-5 ${isSaved ? 'fill-current' : ''}`} />
                </Button>
                <Button variant="outline" size="icon">
                  <Share2 className="h-5 w-5" />
                </Button>
                <Button asChild>
                  <a href={listing.sourceUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    View on {listing.source === 'carsales' ? 'Carsales' : 'Gumtree'}
                  </a>
                </Button>
              </div>
            </div>

            {/* Key Specs */}
            <Card>
              <CardHeader>
                <CardTitle>Specifications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                  {listing.odometer && (
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
                        <Gauge className="h-5 w-5 text-gray-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Odometer</p>
                        <p className="font-semibold">{formatNumber(listing.odometer)} km</p>
                      </div>
                    </div>
                  )}
                  {listing.transmission && (
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
                        <Settings2 className="h-5 w-5 text-gray-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Transmission</p>
                        <p className="font-semibold capitalize">{listing.transmission}</p>
                      </div>
                    </div>
                  )}
                  {listing.fuelType && (
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
                        <Fuel className="h-5 w-5 text-gray-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Fuel Type</p>
                        <p className="font-semibold capitalize">{listing.fuelType}</p>
                      </div>
                    </div>
                  )}
                  {listing.bodyType && (
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
                        <Car className="h-5 w-5 text-gray-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Body Type</p>
                        <p className="font-semibold">{listing.bodyType}</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
                      <Calendar className="h-5 w-5 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Year</p>
                      <p className="font-semibold">{listing.year}</p>
                    </div>
                  </div>
                  {listing.colour && (
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
                        <Palette className="h-5 w-5 text-gray-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Colour</p>
                        <p className="font-semibold">{listing.colour}</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Description */}
            {listing.description && (
              <Card>
                <CardHeader>
                  <CardTitle>Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-line text-gray-600">{listing.description}</p>
                </CardContent>
              </Card>
            )}

            {/* Features */}
            {listing.features.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Features</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {listing.features.map((feature) => (
                      <Badge key={feature} variant="secondary">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar - Cost Breakdown */}
          <div className="space-y-6">
            {/* Listed Price */}
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <p className="text-sm text-gray-500">Listed Price</p>
                  <p className="text-3xl font-bold text-gray-900">{formatPrice(listing.price)}</p>
                </div>
              </CardContent>
            </Card>

            {/* Cost Breakdown */}
            <CarCostBreakdown
              vehiclePrice={listing.price}
              costs={costs}
              sellerState={listing.sellerState}
              deliveryState={deliveryState}
            />

            {/* CTA */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-900">Interested in this car?</h3>
                <p className="mt-1 text-sm text-gray-500">
                  We can help arrange transport from {listing.sellerState} to {deliveryState}.
                </p>
                <Button className="mt-4 w-full">Get Transport Quote</Button>
                <Button variant="outline" className="mt-2 w-full" asChild>
                  <a href={listing.sourceUrl} target="_blank" rel="noopener noreferrer">
                    Contact Seller
                  </a>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
