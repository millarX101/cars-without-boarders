'use client';

import { useState, useEffect, use } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import {
  ArrowLeft, MapPin, Calendar, Gauge, Fuel, Settings,
  Car, CheckCircle, Mail, Phone, Share2, Heart, AlertCircle,
  ChevronLeft, ChevronRight
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { MarketplaceListing, ListingImage } from '@/lib/types/database';
import { calculateStampDuty } from '@/lib/calculators/stamp-duty';
import { calculateRego } from '@/lib/calculators/registration';
import { getTransportCost } from '@/lib/calculators/transport';

const STATES = [
  { value: 'NSW', label: 'NSW' },
  { value: 'VIC', label: 'VIC' },
  { value: 'QLD', label: 'QLD' },
  { value: 'SA', label: 'SA' },
  { value: 'WA', label: 'WA' },
  { value: 'TAS', label: 'TAS' },
  { value: 'ACT', label: 'ACT' },
  { value: 'NT', label: 'NT' },
];


interface ListingWithImages extends MarketplaceListing {
  images: ListingImage[];
}

export default function MarketplaceListingPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const searchParams = useSearchParams();
  const showSuccess = searchParams.get('success') === 'true';

  const [listing, setListing] = useState<ListingWithImages | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [deliveryState, setDeliveryState] = useState('VIC');
  const [showInterestForm, setShowInterestForm] = useState(false);
  const [showEnquiryForm, setShowEnquiryForm] = useState(false);
  const [interestSubmitted, setInterestSubmitted] = useState(false);
  const [interestForm, setInterestForm] = useState({
    buyerState: 'NSW',
    buyerPostcode: '',
    timing: '',
    financeInterest: false,
  });
  const [enquiryForm, setEnquiryForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  const [enquirySubmitting, setEnquirySubmitting] = useState(false);
  const [enquirySuccess, setEnquirySuccess] = useState(false);

  useEffect(() => {
    async function fetchListing() {
      try {
        const supabase = createClient();

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: listingData, error: listingError } = await (supabase as any)
          .from('marketplace_listings')
          .select('*')
          .eq('id', resolvedParams.id)
          .single();

        if (listingError) throw listingError;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: imagesData } = await (supabase as any)
          .from('listing_images')
          .select('*')
          .eq('listing_id', resolvedParams.id)
          .order('sort_order');

        setListing({
          ...listingData,
          images: imagesData || [],
        });

        // Increment view count (may not exist yet)
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await (supabase as any).rpc('increment_listing_views', { listing_uuid: resolvedParams.id });
        } catch {
          // RPC function may not exist yet
        }
      } catch (err) {
        console.error('Error fetching listing:', err);
        setError('Listing not found');
      } finally {
        setLoading(false);
      }
    }

    fetchListing();
  }, [resolvedParams.id]);

  const handleEnquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!listing) return;

    setEnquirySubmitting(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any).from('listing_enquiries').insert({
        listing_id: listing.id,
        user_id: user?.id || null,
        name: enquiryForm.name,
        email: enquiryForm.email,
        phone: enquiryForm.phone || null,
        message: enquiryForm.message,
        delivery_state: deliveryState,
      });

      setEnquirySuccess(true);
      setShowEnquiryForm(false);
    } catch (err) {
      console.error('Error sending enquiry:', err);
    } finally {
      setEnquirySubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse text-gray-500">Loading...</div>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h1 className="text-xl font-bold text-gray-900">Listing Not Found</h1>
        <p className="mt-2 text-gray-600">This listing may have been removed or sold.</p>
        <Link href="/search" className="mt-4 text-fuchsia-700 hover:underline">
          Browse all cars
        </Link>
      </div>
    );
  }

  // Calculate costs
  const price = listing.price;
  const isInterstate = listing.seller_state !== deliveryState;
  const transport = isInterstate ? getTransportCost(listing.seller_state as any, deliveryState as any) : 0;
  const isEV = listing.fuel_type === 'electric';
  const stampDuty = calculateStampDuty({ state: deliveryState, price, isEV });
  const regoResult = calculateRego({ state: deliveryState, term: 12, ev: isEV, cylinders: listing.cylinders || 4 });
  const regoPlusCtp = typeof regoResult === 'number' ? regoResult : Math.round(regoResult.total);
  const roadworthy = isInterstate ? 150 : 0;
  const totalCost = price + transport + stampDuty + regoPlusCtp + roadworthy;

  const images = listing.images.length > 0
    ? listing.images.map(img => img.url)
    : ['/placeholder-car.jpg'];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Success Banner */}
      {showSuccess && (
        <div className="bg-teal-500 text-white px-4 py-3 text-center">
          <CheckCircle className="inline h-5 w-5 mr-2" />
          Your listing has been published! It&apos;s now visible to buyers across Australia.
        </div>
      )}

      {/* Header */}
      <div className="bg-white border-b">
        <div className="mx-auto max-w-7xl px-4 py-4">
          <Link href="/search" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900">
            <ArrowLeft className="h-4 w-4" />
            Back to Search
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <div className="rounded-xl bg-white overflow-hidden shadow-sm">
              <div className="relative aspect-[16/10]">
                <Image
                  src={images[currentImageIndex]}
                  alt={listing.title}
                  fill
                  className="object-cover"
                  priority
                />
                {images.length > 1 && (
                  <>
                    <button
                      onClick={() => setCurrentImageIndex(i => i === 0 ? images.length - 1 : i - 1)}
                      className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white hover:bg-black/70"
                    >
                      <ChevronLeft className="h-6 w-6" />
                    </button>
                    <button
                      onClick={() => setCurrentImageIndex(i => i === images.length - 1 ? 0 : i + 1)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white hover:bg-black/70"
                    >
                      <ChevronRight className="h-6 w-6" />
                    </button>
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                      {images.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setCurrentImageIndex(i)}
                          className={`h-2 w-2 rounded-full ${i === currentImageIndex ? 'bg-white' : 'bg-white/50'}`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
              {images.length > 1 && (
                <div className="flex gap-2 p-4 overflow-x-auto">
                  {images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentImageIndex(i)}
                      className={`flex-shrink-0 h-16 w-24 rounded-lg overflow-hidden border-2 ${
                        i === currentImageIndex ? 'border-fuchsia-700' : 'border-transparent'
                      }`}
                    >
                      <Image src={img} alt="" width={96} height={64} className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Title & Price */}
            <div className="rounded-xl bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{listing.title}</h1>
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {listing.seller_suburb || listing.seller_state}, {listing.seller_postcode}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {listing.year}
                    </span>
                    {listing.odometer && (
                      <span className="flex items-center gap-1">
                        <Gauge className="h-4 w-4" />
                        {listing.odometer.toLocaleString()} km
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-fuchsia-700">
                    ${listing.price.toLocaleString()}
                  </div>
                  {listing.is_negotiable && (
                    <span className="text-sm text-gray-500">Negotiable</span>
                  )}
                </div>
              </div>

              {/* Tags */}
              <div className="mt-4 flex flex-wrap gap-2">
                {listing.has_rwc && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-teal-100 px-3 py-1 text-sm text-teal-700">
                    <CheckCircle className="h-3.5 w-3.5" />
                    Roadworthy
                  </span>
                )}
                {listing.has_rego && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-fuchsia-100 px-3 py-1 text-sm text-fuchsia-700">
                    <CheckCircle className="h-3.5 w-3.5" />
                    Registered
                  </span>
                )}
              </div>
            </div>

            {/* Specs */}
            <div className="rounded-xl bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Specifications</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {listing.transmission && (
                  <div className="flex items-center gap-3">
                    <Settings className="h-5 w-5 text-gray-400" />
                    <div>
                      <div className="text-xs text-gray-500">Transmission</div>
                      <div className="font-medium capitalize">{listing.transmission}</div>
                    </div>
                  </div>
                )}
                {listing.fuel_type && (
                  <div className="flex items-center gap-3">
                    <Fuel className="h-5 w-5 text-gray-400" />
                    <div>
                      <div className="text-xs text-gray-500">Fuel Type</div>
                      <div className="font-medium capitalize">{listing.fuel_type}</div>
                    </div>
                  </div>
                )}
                {listing.body_type && (
                  <div className="flex items-center gap-3">
                    <Car className="h-5 w-5 text-gray-400" />
                    <div>
                      <div className="text-xs text-gray-500">Body Type</div>
                      <div className="font-medium capitalize">{listing.body_type}</div>
                    </div>
                  </div>
                )}
                {listing.drive_type && (
                  <div className="flex items-center gap-3">
                    <Settings className="h-5 w-5 text-gray-400" />
                    <div>
                      <div className="text-xs text-gray-500">Drive Type</div>
                      <div className="font-medium uppercase">{listing.drive_type}</div>
                    </div>
                  </div>
                )}
                {listing.colour && (
                  <div className="flex items-center gap-3">
                    <div className="h-5 w-5 rounded-full border" style={{ backgroundColor: listing.colour.toLowerCase() }} />
                    <div>
                      <div className="text-xs text-gray-500">Colour</div>
                      <div className="font-medium capitalize">{listing.colour}</div>
                    </div>
                  </div>
                )}
                {listing.engine_size && (
                  <div className="flex items-center gap-3">
                    <Settings className="h-5 w-5 text-gray-400" />
                    <div>
                      <div className="text-xs text-gray-500">Engine</div>
                      <div className="font-medium">{listing.engine_size}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            {listing.description && (
              <div className="rounded-xl bg-white p-6 shadow-sm">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Description</h2>
                <p className="text-gray-600 whitespace-pre-wrap">{listing.description}</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Cost Calculator */}
            <div className="rounded-xl bg-white p-6 shadow-sm sticky top-4">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Total Delivered Cost</h2>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Deliver to
                </label>
                <Select
                  value={deliveryState}
                  onChange={(e) => setDeliveryState(e.target.value)}
                  options={STATES}
                />
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Vehicle Price</span>
                  <span className="font-medium">${price.toLocaleString()}</span>
                </div>
                {transport > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Transport ({listing.seller_state} → {deliveryState})</span>
                    <span className="font-medium">${transport.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Stamp Duty ({deliveryState})</span>
                  <span className="font-medium">${stampDuty.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Rego + CTP ({deliveryState})</span>
                  <span className="font-medium">${regoPlusCtp.toLocaleString()}</span>
                </div>
                {roadworthy > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Roadworthy</span>
                    <span className="font-medium">${roadworthy.toLocaleString()}</span>
                  </div>
                )}
                <hr />
                <div className="flex justify-between text-lg font-bold">
                  <span className="text-gray-900">Total</span>
                  <span className="text-fuchsia-700">${totalCost.toLocaleString()}</span>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                {!interestSubmitted ? (
                  <Button className="w-full" onClick={() => setShowInterestForm(true)}>
                    <Heart className="h-4 w-4 mr-2" />
                    I&apos;m Interested
                  </Button>
                ) : (
                  <>
                    <Button className="w-full" onClick={() => setShowEnquiryForm(true)}>
                      <Mail className="h-4 w-4 mr-2" />
                      Contact Seller
                    </Button>
                    {listing.show_phone && listing.contact_phone && (
                      <Button variant="outline" className="w-full" asChild>
                        <a href={`tel:${listing.contact_phone}`}>
                          <Phone className="h-4 w-4 mr-2" />
                          {listing.contact_phone}
                        </a>
                      </Button>
                    )}
                  </>
                )}
              </div>

              <div className="mt-4 flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Heart className="h-4 w-4 mr-1" />
                  Save
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  <Share2 className="h-4 w-4 mr-1" />
                  Share
                </Button>
              </div>
            </div>

            {/* Seller Info - Only show after interest submitted */}
            {interestSubmitted ? (
              <div className="rounded-xl bg-white p-6 shadow-sm">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Private Seller</h2>
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-fuchsia-100 text-fuchsia-700">
                    {listing.contact_name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-medium">{listing.contact_name}</div>
                    <div className="text-sm text-gray-500">
                      {listing.seller_suburb || listing.seller_state}, {listing.seller_postcode}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-xl bg-gray-50 p-6 border border-gray-200">
                <h2 className="text-lg font-bold text-gray-900 mb-2">Private Seller</h2>
                <p className="text-sm text-gray-600">
                  Click &quot;I&apos;m Interested&quot; to see seller details and contact information.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Interest Modal - First step before revealing seller contact */}
      {showInterestForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Tell us about your interest</h2>
            <p className="text-sm text-gray-600 mb-6">
              Help the seller understand your situation so they can give you the best response.
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                // Track interest
                console.log('[Track] buyer_interest_submitted', {
                  listing_id: listing?.id,
                  buyer_state: interestForm.buyerState,
                  timing: interestForm.timing,
                  finance_interest: interestForm.financeInterest,
                });
                setInterestSubmitted(true);
                setShowInterestForm(false);
                // Update delivery state to match buyer location
                setDeliveryState(interestForm.buyerState);
              }}
              className="space-y-4"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Your State</label>
                  <Select
                    value={interestForm.buyerState}
                    onChange={(e) => setInterestForm(f => ({ ...f, buyerState: e.target.value }))}
                    options={STATES}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Postcode</label>
                  <input
                    type="text"
                    maxLength={4}
                    value={interestForm.buyerPostcode}
                    onChange={(e) => setInterestForm(f => ({ ...f, buyerPostcode: e.target.value }))}
                    placeholder="e.g. 2000"
                    className="w-full rounded-lg border border-gray-300 px-4 py-2"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">When are you looking to buy?</label>
                <Select
                  value={interestForm.timing}
                  onChange={(e) => setInterestForm(f => ({ ...f, timing: e.target.value }))}
                  options={[
                    { value: '', label: 'Select timing...' },
                    { value: 'asap', label: 'As soon as possible' },
                    { value: '1-2weeks', label: 'Within 1-2 weeks' },
                    { value: '1month', label: 'Within a month' },
                    { value: 'browsing', label: 'Just browsing for now' },
                  ]}
                />
              </div>

              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <input
                  type="checkbox"
                  id="financeInterest"
                  checked={interestForm.financeInterest}
                  onChange={(e) => setInterestForm(f => ({ ...f, financeInterest: e.target.checked }))}
                  className="mt-1 h-4 w-4 rounded border-gray-300 text-fuchsia-600 focus:ring-fuchsia-500"
                />
                <label htmlFor="financeInterest" className="text-sm">
                  <span className="font-medium text-gray-900">I may be interested in finance options</span>
                  <p className="text-gray-500 mt-0.5">We&apos;ll let you know about finance options if available (coming soon)</p>
                </label>
              </div>

              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setShowInterestForm(false)} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" className="flex-1">
                  Continue
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Enquiry Modal */}
      {showEnquiryForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Send Enquiry</h2>
            <form onSubmit={handleEnquirySubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
                <input
                  type="text"
                  required
                  value={enquiryForm.name}
                  onChange={(e) => setEnquiryForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={enquiryForm.email}
                  onChange={(e) => setEnquiryForm(f => ({ ...f, email: e.target.value }))}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone (optional)</label>
                <input
                  type="tel"
                  value={enquiryForm.phone}
                  onChange={(e) => setEnquiryForm(f => ({ ...f, phone: e.target.value }))}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <textarea
                  required
                  rows={4}
                  value={enquiryForm.message}
                  onChange={(e) => setEnquiryForm(f => ({ ...f, message: e.target.value }))}
                  placeholder={`Hi, I'm interested in your ${listing.year} ${listing.make} ${listing.model}. Is it still available?`}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2"
                />
              </div>
              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={() => setShowEnquiryForm(false)} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" disabled={enquirySubmitting} className="flex-1">
                  {enquirySubmitting ? 'Sending...' : 'Send'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Enquiry Success Toast */}
      {enquirySuccess && (
        <div className="fixed bottom-4 right-4 z-50 rounded-lg bg-teal-500 px-6 py-4 text-white shadow-lg">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            <span>Enquiry sent! The seller will be in touch.</span>
          </div>
        </div>
      )}
    </div>
  );
}
