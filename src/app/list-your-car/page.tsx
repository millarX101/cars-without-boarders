'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Car, Upload, CheckCircle, AlertCircle, ArrowLeft, Camera, X } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

const STATES = [
  { value: 'NSW', label: 'New South Wales' },
  { value: 'VIC', label: 'Victoria' },
  { value: 'QLD', label: 'Queensland' },
  { value: 'SA', label: 'South Australia' },
  { value: 'WA', label: 'Western Australia' },
  { value: 'TAS', label: 'Tasmania' },
  { value: 'ACT', label: 'ACT' },
  { value: 'NT', label: 'Northern Territory' },
];

const FUEL_TYPES = [
  { value: 'petrol', label: 'Petrol' },
  { value: 'diesel', label: 'Diesel' },
  { value: 'electric', label: 'Electric' },
  { value: 'hybrid', label: 'Hybrid' },
  { value: 'plug-in-hybrid', label: 'Plug-in Hybrid' },
  { value: 'lpg', label: 'LPG' },
  { value: 'other', label: 'Other' },
];

const TRANSMISSIONS = [
  { value: 'automatic', label: 'Automatic' },
  { value: 'manual', label: 'Manual' },
  { value: 'cvt', label: 'CVT' },
  { value: 'dct', label: 'DCT' },
  { value: 'other', label: 'Other' },
];

const BODY_TYPES = [
  { value: 'sedan', label: 'Sedan' },
  { value: 'hatchback', label: 'Hatchback' },
  { value: 'suv', label: 'SUV' },
  { value: 'wagon', label: 'Wagon' },
  { value: 'ute', label: 'Ute' },
  { value: 'van', label: 'Van' },
  { value: 'coupe', label: 'Coupe' },
  { value: 'convertible', label: 'Convertible' },
  { value: 'other', label: 'Other' },
];

const DRIVE_TYPES = [
  { value: 'fwd', label: 'Front Wheel Drive (FWD)' },
  { value: 'rwd', label: 'Rear Wheel Drive (RWD)' },
  { value: 'awd', label: 'All Wheel Drive (AWD)' },
  { value: '4wd', label: 'Four Wheel Drive (4WD)' },
  { value: 'other', label: 'Other' },
];

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 50 }, (_, i) => ({
  value: String(currentYear - i),
  label: String(currentYear - i),
}));

interface FormData {
  // Vehicle info
  make: string;
  model: string;
  variant: string;
  year: string;
  price: string;
  odometer: string;
  transmission: string;
  fuelType: string;
  bodyType: string;
  driveType: string;
  colour: string;
  engineSize: string;
  cylinders: string;
  // Guardrails
  clearTitle: boolean; // Confirm no finance/encumbrance
  regoExpiry: string;
  vin: string;
  // Location
  sellerState: string;
  sellerPostcode: string;
  sellerSuburb: string;
  // Contact
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  showPhone: boolean;
  // Listing
  title: string;
  description: string;
  hasRwc: boolean;
  hasRego: boolean;
  isNegotiable: boolean;
}

export default function ListYourCarPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);

  const [formData, setFormData] = useState<FormData>({
    make: '',
    model: '',
    variant: '',
    year: '',
    price: '',
    odometer: '',
    transmission: '',
    fuelType: '',
    bodyType: '',
    driveType: '',
    colour: '',
    engineSize: '',
    cylinders: '',
    clearTitle: false,
    regoExpiry: '',
    vin: '',
    sellerState: '',
    sellerPostcode: '',
    sellerSuburb: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    showPhone: false,
    title: '',
    description: '',
    hasRwc: false,
    hasRego: true,
    isNegotiable: true,
  });

  const updateField = (field: keyof FormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + images.length > 10) {
      setError('Maximum 10 images allowed');
      return;
    }

    const newImages = [...images, ...files].slice(0, 10);
    setImages(newImages);

    // Create preview URLs
    const newPreviewUrls = newImages.map((file) => URL.createObjectURL(file));
    setImagePreviewUrls(newPreviewUrls);
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);

    // Revoke old URL and create new preview URLs
    URL.revokeObjectURL(imagePreviewUrls[index]);
    const newPreviewUrls = newImages.map((file) => URL.createObjectURL(file));
    setImagePreviewUrls(newPreviewUrls);
  };

  const generateTitle = () => {
    if (formData.year && formData.make && formData.model) {
      const title = `${formData.year} ${formData.make} ${formData.model}${formData.variant ? ` ${formData.variant}` : ''}`;
      updateField('title', title);
    }
  };

  const validateStep = (currentStep: number): boolean => {
    setError(null);

    if (currentStep === 1) {
      if (!formData.make || !formData.model || !formData.year || !formData.price) {
        setError('Please fill in all required fields: Make, Model, Year, and Price');
        return false;
      }
      const price = parseFloat(formData.price);
      if (isNaN(price) || price <= 0) {
        setError('Please enter a valid price');
        return false;
      }
      // VIN is required for buyer protection
      if (!formData.vin || formData.vin.length < 11) {
        setError('Please enter a valid VIN (Vehicle Identification Number). This helps protect both buyers and sellers.');
        return false;
      }
      // Clear title confirmation required
      if (!formData.clearTitle) {
        setError('You must confirm the vehicle has a clear title with no finance or encumbrances');
        return false;
      }
    }

    if (currentStep === 2) {
      if (!formData.sellerState || !formData.sellerPostcode) {
        setError('Please enter your state and postcode');
        return false;
      }
      if (!formData.contactName || !formData.contactEmail) {
        setError('Please enter your name and email');
        return false;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.contactEmail)) {
        setError('Please enter a valid email address');
        return false;
      }
    }

    if (currentStep === 3) {
      if (!formData.title) {
        setError('Please enter a listing title');
        return false;
      }
    }

    return true;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      if (step === 1) {
        generateTitle();
      }
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleSubmit = async () => {
    if (!validateStep(3)) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const supabase = createClient();

      // Check if user is logged in
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        // Save form data to localStorage and redirect to login
        localStorage.setItem('pendingListing', JSON.stringify(formData));
        router.push('/auth/login?redirect=/list-your-car&message=Please log in to list your car');
        return;
      }

      // Create the listing
      // Using type assertion since Supabase types aren't auto-generated from DB schema
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: listing, error: listingError } = await (supabase as any)
        .from('marketplace_listings')
        .insert({
          user_id: user.id,
          make: formData.make,
          model: formData.model,
          variant: formData.variant || null,
          year: parseInt(formData.year),
          price: parseFloat(formData.price),
          odometer: formData.odometer ? parseInt(formData.odometer) : null,
          transmission: formData.transmission || null,
          fuel_type: formData.fuelType || null,
          body_type: formData.bodyType || null,
          drive_type: formData.driveType || null,
          colour: formData.colour || null,
          engine_size: formData.engineSize || null,
          cylinders: formData.cylinders ? parseInt(formData.cylinders) : null,
          rego_expiry: formData.regoExpiry || null,
          vin: formData.vin || null,
          seller_state: formData.sellerState,
          seller_postcode: formData.sellerPostcode,
          seller_suburb: formData.sellerSuburb || null,
          contact_name: formData.contactName,
          contact_email: formData.contactEmail,
          contact_phone: formData.contactPhone || null,
          show_phone: formData.showPhone,
          title: formData.title,
          description: formData.description || null,
          has_rwc: formData.hasRwc,
          has_rego: formData.hasRego,
          is_negotiable: formData.isNegotiable,
          status: 'active',
          published_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (listingError) throw listingError;

      // Upload images if any
      if (images.length > 0 && listing) {
        for (let i = 0; i < images.length; i++) {
          const file = images[i];
          const fileExt = file.name.split('.').pop();
          const fileName = `${user.id}/${listing.id}/${i}.${fileExt}`;

          const { error: uploadError } = await supabase.storage
            .from('listing-images')
            .upload(fileName, file);

          if (!uploadError) {
            const { data: { publicUrl } } = supabase.storage
              .from('listing-images')
              .getPublicUrl(fileName);

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await (supabase as any).from('listing_images').insert({
              listing_id: listing.id,
              user_id: user.id,
              storage_path: fileName,
              url: publicUrl,
              file_name: file.name,
              file_size: file.size,
              mime_type: file.type,
              sort_order: i,
              is_primary: i === 0,
            });
          }
        }
      }

      // Redirect to success page or listing
      router.push(`/marketplace/${listing.id}?success=true`);
    } catch (err) {
      console.error('Error creating listing:', err);
      setError('Failed to create listing. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-purple-700 to-purple-900 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Link href="/search" className="inline-flex items-center gap-2 text-purple-200 hover:text-white mb-4">
            <ArrowLeft className="h-4 w-4" />
            Back to Search
          </Link>
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/10">
              <Car className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white sm:text-4xl">List Your Car Free</h1>
              <p className="mt-1 text-lg text-purple-200">
                Reach buyers across Australia who can see exactly what it costs delivered
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Progress Steps */}
      <div className="border-b bg-white">
        <div className="mx-auto max-w-3xl px-4 py-4">
          <div className="flex items-center justify-between">
            {[
              { num: 1, label: 'Vehicle Details' },
              { num: 2, label: 'Location & Contact' },
              { num: 3, label: 'Photos & Description' },
            ].map((s, i) => (
              <div key={s.num} className="flex items-center">
                <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                  step >= s.num
                    ? 'bg-purple-700 text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}>
                  {step > s.num ? <CheckCircle className="h-5 w-5" /> : s.num}
                </div>
                <span className={`ml-2 hidden text-sm sm:block ${
                  step >= s.num ? 'text-purple-700 font-medium' : 'text-gray-500'
                }`}>
                  {s.label}
                </span>
                {i < 2 && (
                  <div className={`mx-4 h-0.5 w-12 sm:w-24 ${
                    step > s.num ? 'bg-purple-700' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="mx-auto max-w-3xl px-4 py-8">
        {error && (
          <div className="mb-6 flex items-center gap-2 rounded-lg bg-red-50 p-4 text-red-700">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {/* Step 1: Vehicle Details */}
        {step === 1 && (
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Vehicle Details</h2>

            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Make <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.make}
                  onChange={(e) => updateField('make', e.target.value)}
                  placeholder="e.g. Toyota"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Model <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.model}
                  onChange={(e) => updateField('model', e.target.value)}
                  placeholder="e.g. Camry"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Variant
                </label>
                <input
                  type="text"
                  value={formData.variant}
                  onChange={(e) => updateField('variant', e.target.value)}
                  placeholder="e.g. SL"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Year <span className="text-red-500">*</span>
                </label>
                <Select
                  value={formData.year}
                  onChange={(e) => updateField('year', e.target.value)}
                  options={[{ value: '', label: 'Select Year' }, ...YEARS]}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price (AUD) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => updateField('price', e.target.value)}
                    placeholder="25000"
                    className="w-full rounded-lg border border-gray-300 pl-8 pr-4 py-2 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Odometer (km)
                </label>
                <input
                  type="number"
                  value={formData.odometer}
                  onChange={(e) => updateField('odometer', e.target.value)}
                  placeholder="50000"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Transmission
                </label>
                <Select
                  value={formData.transmission}
                  onChange={(e) => updateField('transmission', e.target.value)}
                  options={[{ value: '', label: 'Select Transmission' }, ...TRANSMISSIONS]}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fuel Type
                </label>
                <Select
                  value={formData.fuelType}
                  onChange={(e) => updateField('fuelType', e.target.value)}
                  options={[{ value: '', label: 'Select Fuel Type' }, ...FUEL_TYPES]}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Body Type
                </label>
                <Select
                  value={formData.bodyType}
                  onChange={(e) => updateField('bodyType', e.target.value)}
                  options={[{ value: '', label: 'Select Body Type' }, ...BODY_TYPES]}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Drive Type
                </label>
                <Select
                  value={formData.driveType}
                  onChange={(e) => updateField('driveType', e.target.value)}
                  options={[{ value: '', label: 'Select Drive Type' }, ...DRIVE_TYPES]}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Colour
                </label>
                <input
                  type="text"
                  value={formData.colour}
                  onChange={(e) => updateField('colour', e.target.value)}
                  placeholder="e.g. Silver"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Engine Size
                </label>
                <input
                  type="text"
                  value={formData.engineSize}
                  onChange={(e) => updateField('engineSize', e.target.value)}
                  placeholder="e.g. 2.5L"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>
            </div>

            {/* VIN & Clear Title - Required for buyer protection */}
            <div className="mt-8 p-4 bg-purple-50 rounded-lg border border-purple-200">
              <h3 className="font-semibold text-gray-900 mb-4">Verification (Required)</h3>
              <p className="text-sm text-gray-600 mb-4">
                To protect buyers and sellers, we require VIN and clear title confirmation for all listings.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    VIN (Vehicle Identification Number) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.vin}
                    onChange={(e) => updateField('vin', e.target.value.toUpperCase())}
                    placeholder="e.g. 1HGBH41JXMN109186"
                    maxLength={17}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 font-mono"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Found on your registration papers or driver&apos;s door jamb. 11-17 characters.
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="clearTitle"
                    checked={formData.clearTitle}
                    onChange={(e) => updateField('clearTitle', e.target.checked)}
                    className="mt-1 h-5 w-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  <label htmlFor="clearTitle" className="text-sm">
                    <span className="font-medium text-gray-900">I confirm this vehicle has a clear title <span className="text-red-500">*</span></span>
                    <p className="text-gray-600 mt-0.5">
                      The vehicle has no outstanding finance, encumbrances, or liens. I am the legal owner or authorised to sell.
                    </p>
                  </label>
                </div>
              </div>
            </div>

            {/* Private Sale Notice */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600">
                <strong className="text-gray-900">Private sales only.</strong> landedX is currently for private sellers only.
                Dealer listings are not permitted at this time.
              </p>
            </div>

            <div className="mt-8 flex justify-end">
              <Button onClick={handleNext}>
                Continue
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Location & Contact */}
        {step === 2 && (
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Location & Contact</h2>

            <div className="space-y-6">
              <div>
                <h3 className="font-medium text-gray-900 mb-4">Car Location</h3>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      State <span className="text-red-500">*</span>
                    </label>
                    <Select
                      value={formData.sellerState}
                      onChange={(e) => updateField('sellerState', e.target.value)}
                      options={[{ value: '', label: 'Select State' }, ...STATES]}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Postcode <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.sellerPostcode}
                      onChange={(e) => updateField('sellerPostcode', e.target.value)}
                      placeholder="3000"
                      maxLength={4}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Suburb
                    </label>
                    <input
                      type="text"
                      value={formData.sellerSuburb}
                      onChange={(e) => updateField('sellerSuburb', e.target.value)}
                      placeholder="Melbourne"
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                    />
                  </div>
                </div>
              </div>

              <hr />

              <div>
                <h3 className="font-medium text-gray-900 mb-4">Contact Details</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Your Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.contactName}
                      onChange={(e) => updateField('contactName', e.target.value)}
                      placeholder="John Smith"
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={formData.contactEmail}
                      onChange={(e) => updateField('contactEmail', e.target.value)}
                      placeholder="john@example.com"
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={formData.contactPhone}
                      onChange={(e) => updateField('contactPhone', e.target.value)}
                      placeholder="0400 000 000"
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.showPhone}
                        onChange={(e) => updateField('showPhone', e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 text-purple-700 focus:ring-purple-500"
                      />
                      <span className="text-sm text-gray-700">Show phone number on listing</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-between">
              <Button variant="outline" onClick={handleBack}>
                Back
              </Button>
              <Button onClick={handleNext}>
                Continue
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Photos & Description */}
        {step === 3 && (
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Photos & Description</h2>

            <div className="space-y-6">
              {/* Photos */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Photos (up to 10)
                </label>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
                  {imagePreviewUrls.map((url, index) => (
                    <div key={index} className="relative aspect-square rounded-lg border overflow-hidden">
                      <img src={url} alt={`Preview ${index + 1}`} className="h-full w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                      {index === 0 && (
                        <span className="absolute bottom-1 left-1 rounded bg-purple-700 px-1.5 py-0.5 text-xs text-white">
                          Primary
                        </span>
                      )}
                    </div>
                  ))}
                  {images.length < 10 && (
                    <label className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 hover:border-purple-500 hover:bg-purple-50">
                      <Camera className="h-8 w-8 text-gray-400" />
                      <span className="mt-2 text-xs text-gray-500">Add Photo</span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageSelect}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
                <p className="mt-2 text-xs text-gray-500">First photo will be the main listing image</p>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Listing Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => updateField('title', e.target.value)}
                  placeholder="e.g. 2020 Toyota Camry SL - Low KMs, Full Service History"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => updateField('description', e.target.value)}
                  rows={6}
                  placeholder="Describe your car's condition, features, service history, reason for selling..."
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>

              {/* Options */}
              <div className="grid gap-4 sm:grid-cols-3">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.hasRwc}
                    onChange={(e) => updateField('hasRwc', e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-purple-700 focus:ring-purple-500"
                  />
                  <span className="text-sm text-gray-700">Has Roadworthy</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.hasRego}
                    onChange={(e) => updateField('hasRego', e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-purple-700 focus:ring-purple-500"
                  />
                  <span className="text-sm text-gray-700">Currently Registered</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.isNegotiable}
                    onChange={(e) => updateField('isNegotiable', e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-purple-700 focus:ring-purple-500"
                  />
                  <span className="text-sm text-gray-700">Price Negotiable</span>
                </label>
              </div>
            </div>

            {/* Terms */}
            <div className="mt-6 rounded-lg bg-gray-50 p-4">
              <p className="text-sm text-gray-600">
                By listing your car, you confirm that:
              </p>
              <ul className="mt-2 space-y-1 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-teal-500 mt-0.5 flex-shrink-0" />
                  You are the legal owner or authorised to sell this vehicle
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-teal-500 mt-0.5 flex-shrink-0" />
                  All information provided is accurate to the best of your knowledge
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-teal-500 mt-0.5 flex-shrink-0" />
                  You agree to our <Link href="/privacy" className="text-purple-700 hover:underline">Privacy Policy</Link>
                </li>
              </ul>
            </div>

            <div className="mt-8 flex justify-between">
              <Button variant="outline" onClick={handleBack}>
                Back
              </Button>
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? 'Publishing...' : 'Publish Listing'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
