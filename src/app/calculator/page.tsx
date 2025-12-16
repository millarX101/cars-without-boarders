'use client';

import { useState, useEffect } from 'react';
import { Calculator, Car, MapPin, DollarSign, Truck, FileText, Shield, Plus, X, Trophy, Mail, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import type { AustralianState, FuelType } from '@/lib/types/car';
import { calculateRego } from '@/lib/calculators/registration';

const STATES: { value: AustralianState; label: string }[] = [
  { value: 'NSW', label: 'New South Wales' },
  { value: 'VIC', label: 'Victoria' },
  { value: 'QLD', label: 'Queensland' },
  { value: 'SA', label: 'South Australia' },
  { value: 'WA', label: 'Western Australia' },
  { value: 'TAS', label: 'Tasmania' },
  { value: 'ACT', label: 'ACT' },
  { value: 'NT', label: 'Northern Territory' },
];

const FUEL_TYPES: { value: FuelType; label: string }[] = [
  { value: 'petrol', label: 'Petrol' },
  { value: 'diesel', label: 'Diesel' },
  { value: 'electric', label: 'Electric (EV)' },
  { value: 'hybrid', label: 'Hybrid' },
  { value: 'plug-in-hybrid', label: 'Plug-in Hybrid' },
];

interface CarEntry {
  id: string;
  name: string;
  vehiclePrice: string;
  sellerState: AustralianState | '';
  fuelType: FuelType;
}

interface CostResult {
  id: string;
  name: string;
  vehiclePrice: number;
  transport: number;
  stampDuty: number;
  regoPlusCtp: number;  // Combined from enhanced calculator (includes CTP/MII/MAI)
  roadworthy: number;
  totalDelivered: number;
  sellerState: AustralianState;
}

const createEmptyCar = (): CarEntry => ({
  id: Math.random().toString(36).substr(2, 9),
  name: '',
  vehiclePrice: '',
  sellerState: '',
  fuelType: 'petrol',
});

type TransportType = 'depot' | 'door';

// Simple event tracking helper - logs to console and can be extended for analytics
const trackEvent = (eventName: string, data?: Record<string, unknown>) => {
  console.log(`[Track] ${eventName}`, data);
  // TODO: Add analytics integration (Google Analytics, Mixpanel, etc.)
  // window.gtag?.('event', eventName, data);
};

export default function CalculatorPage() {
  const [cars, setCars] = useState<CarEntry[]>([createEmptyCar()]);
  const [deliveryState, setDeliveryState] = useState<AustralianState | ''>('');
  const [transportType, setTransportType] = useState<TransportType>('depot');
  const [results, setResults] = useState<CostResult[]>([]);
  const [isCalculating, setIsCalculating] = useState(false);

  // Email waitlist state
  const [waitlistEmail, setWaitlistEmail] = useState('');
  const [waitlistSubmitted, setWaitlistSubmitted] = useState(false);
  const [waitlistLoading, setWaitlistLoading] = useState(false);

  const addCar = () => {
    if (cars.length < 5) {
      setCars([...cars, createEmptyCar()]);
    }
  };

  const removeCar = (id: string) => {
    if (cars.length > 1) {
      setCars(cars.filter(car => car.id !== id));
      setResults(results.filter(r => r.id !== id));
    }
  };

  const updateCar = (id: string, field: keyof CarEntry, value: string) => {
    setCars(cars.map(car =>
      car.id === id ? { ...car, [field]: value } : car
    ));
  };

  // Handle waitlist email submission
  const handleWaitlistSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!waitlistEmail) return;

    setWaitlistLoading(true);
    trackEvent('transport_waitlist_submit', { email: waitlistEmail });

    // Simulate API call - replace with actual endpoint later
    await new Promise(resolve => setTimeout(resolve, 800));

    // Store in localStorage for now (can be replaced with Supabase later)
    const existingEmails = JSON.parse(localStorage.getItem('waitlistEmails') || '[]');
    if (!existingEmails.includes(waitlistEmail)) {
      existingEmails.push(waitlistEmail);
      localStorage.setItem('waitlistEmails', JSON.stringify(existingEmails));
    }

    setWaitlistSubmitted(true);
    setWaitlistLoading(false);
  };

  const calculateCosts = async () => {
    if (!deliveryState) return;

    const validCars = cars.filter(car => car.vehiclePrice && car.sellerState);
    if (validCars.length === 0) return;

    setIsCalculating(true);
    await new Promise(resolve => setTimeout(resolve, 300));

    // Track calculation event
    const hasInterstate = validCars.some(car => car.sellerState !== deliveryState);
    trackEvent('calculator_completed', {
      cars_count: validCars.length,
      delivery_state: deliveryState,
      has_interstate: hasInterstate,
      transport_type: transportType,
    });

    // Transport costs: depot-to-depot quotes + 10% margin (sedan rates, Dec 2024)
    // Based on real carrier quotes for standard sedans
    const transportCosts: Record<string, Record<string, number>> = {
      'NSW': { 'NSW': 0, 'VIC': 770, 'QLD': 880, 'SA': 1100, 'WA': 2200, 'TAS': 1320, 'ACT': 330, 'NT': 2420 },
      'VIC': { 'NSW': 770, 'VIC': 0, 'QLD': 1210, 'SA': 770, 'WA': 2420, 'TAS': 880, 'ACT': 880, 'NT': 2640 },
      'QLD': { 'NSW': 880, 'VIC': 1210, 'QLD': 0, 'SA': 1540, 'WA': 2860, 'TAS': 1650, 'ACT': 990, 'NT': 1980 },
      'SA': { 'NSW': 1100, 'VIC': 770, 'QLD': 1540, 'SA': 0, 'WA': 1650, 'TAS': 1210, 'ACT': 1210, 'NT': 1980 },
      'WA': { 'NSW': 2200, 'VIC': 2420, 'QLD': 2860, 'SA': 1650, 'WA': 0, 'TAS': 2860, 'ACT': 2310, 'NT': 2200 },
      'TAS': { 'NSW': 1320, 'VIC': 880, 'QLD': 1650, 'SA': 1210, 'WA': 2860, 'TAS': 0, 'ACT': 1430, 'NT': 2860 },
      'ACT': { 'NSW': 330, 'VIC': 880, 'QLD': 990, 'SA': 1210, 'WA': 2310, 'TAS': 1430, 'ACT': 0, 'NT': 2530 },
      'NT': { 'NSW': 2420, 'VIC': 2640, 'QLD': 1980, 'SA': 1980, 'WA': 2200, 'TAS': 2860, 'ACT': 2530, 'NT': 0 },
    };

    const calculateStampDuty = (state: AustralianState, price: number, fuelType: FuelType): number => {
      const isEV = fuelType === 'electric';

      if (isEV) {
        if (state === 'NSW' || state === 'ACT' || state === 'SA') return 0;
        if (state === 'VIC') return price * 0.029;
      }

      switch (state) {
        case 'NSW':
          if (price <= 45000) return price * 0.03;
          return 1350 + (price - 45000) * 0.05;
        case 'VIC':
          return price * 0.042;
        case 'QLD':
          if (price <= 100000) return price * 0.03;
          return 3000 + (price - 100000) * 0.05;
        case 'SA':
          return price * 0.04;
        case 'WA':
          return price * 0.0275;
        case 'TAS':
          return price * 0.03;
        case 'ACT':
          return price * 0.03;
        case 'NT':
          return price * 0.03;
        default:
          return price * 0.03;
      }
    };

    const roadworthyByState: Record<AustralianState, number> = {
      'NSW': 150, 'VIC': 180, 'QLD': 120, 'SA': 130, 'WA': 200, 'TAS': 140, 'ACT': 160, 'NT': 100,
    };

    // Door-to-door adds $200 each end (pickup from seller home + delivery to buyer home)
    const doorToDoorFee = transportType === 'door' ? 400 : 0;

    const newResults: CostResult[] = validCars.map((car, index) => {
      const price = parseFloat(car.vehiclePrice);
      const isInterstate = car.sellerState !== deliveryState;
      const baseTransport = transportCosts[car.sellerState]?.[deliveryState] || 0;
      const transport = isInterstate ? baseTransport + doorToDoorFee : 0;
      const stampDuty = Math.round(calculateStampDuty(deliveryState, price, car.fuelType));

      // Use enhanced registration calculator (includes CTP/MII/MAI)
      const regoResult = calculateRego({
        state: deliveryState,
        term: 12,
        ev: car.fuelType === 'electric',
        cylinders: 4, // Default to 4-cylinder
      });
      const regoPlusCtp = typeof regoResult === 'number' ? regoResult : Math.round(regoResult.total);

      const roadworthy = isInterstate ? roadworthyByState[deliveryState] : 0;
      const totalDelivered = price + transport + stampDuty + regoPlusCtp + roadworthy;

      return {
        id: car.id,
        name: car.name || `Car ${index + 1}`,
        vehiclePrice: price,
        transport,
        stampDuty,
        regoPlusCtp,
        roadworthy,
        totalDelivered: Math.round(totalDelivered),
        sellerState: car.sellerState as AustralianState,
      };
    });

    setResults(newResults.sort((a, b) => a.totalDelivered - b.totalDelivered));
    setIsCalculating(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const bestDeal = results.length > 0 ? results[0] : null;
  const worstDeal = results.length > 1 ? results[results.length - 1] : null;
  const savingsVsWorst = bestDeal && worstDeal ? worstDeal.totalDelivered - bestDeal.totalDelivered : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-purple-600 via-purple-700 to-purple-900 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-purple-500/20 px-4 py-2 text-sm font-medium text-purple-100">
              <Calculator className="h-4 w-4" />
              True Cost Calculator
            </div>
            <h1 className="mt-4 text-3xl font-bold text-white sm:text-4xl">
              Compare Cars From Different States
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-purple-100">
              Add up to 5 cars and see the estimated delivered cost to your door.
              Find out which deal is actually the best value.
            </p>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Delivery Location & Transport Type */}
        <div className="mb-8 rounded-xl bg-white p-6 shadow-sm">
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Your Location</h2>
              <p className="mt-1 text-sm text-gray-500">Where will you register the car?</p>
              <div className="mt-4 max-w-xs">
                <Select
                  value={deliveryState}
                  onChange={(e) => setDeliveryState(e.target.value as AustralianState)}
                  options={[{ value: '', label: 'Select your state...' }, ...STATES]}
                />
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-900">Transport</h2>
              <p className="mt-1 text-sm text-gray-500">Transport costs are depot-to-depot by default</p>
              <div className="mt-4">
                <label className="flex cursor-pointer items-center gap-3">
                  <input
                    type="checkbox"
                    checked={transportType === 'door'}
                    onChange={(e) => setTransportType(e.target.checked ? 'door' : 'depot')}
                    className="h-5 w-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  <div>
                    <span className="font-medium text-gray-900">Include door-to-door pickup</span>
                    <span className="ml-2 text-sm text-gray-500">(+$400)</span>
                    <p className="text-xs text-gray-500">Adds ~$200 each end for home pickup & delivery</p>
                  </div>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Car Entry Forms */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Cars to Compare</h2>
            {cars.length < 5 && (
              <Button variant="outline" size="sm" onClick={addCar}>
                <Plus className="mr-1 h-4 w-4" />
                Add Car
              </Button>
            )}
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {cars.map((car, index) => (
              <div key={car.id} className="rounded-xl bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-500">Car {index + 1}</span>
                  {cars.length > 1 && (
                    <button
                      onClick={() => removeCar(car.id)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>

                <div className="mt-3 space-y-3">
                  <Input
                    placeholder="Name (e.g. Blue Civic)"
                    value={car.name}
                    onChange={(e) => updateCar(car.id, 'name', e.target.value)}
                  />

                  <Input
                    type="number"
                    placeholder="Advertised price (excl. govt charges)"
                    value={car.vehiclePrice}
                    onChange={(e) => updateCar(car.id, 'vehiclePrice', e.target.value)}
                  />

                  <Select
                    value={car.sellerState}
                    onChange={(e) => updateCar(car.id, 'sellerState', e.target.value)}
                    options={[{ value: '', label: 'Car location...' }, ...STATES]}
                  />

                  <Select
                    value={car.fuelType}
                    onChange={(e) => updateCar(car.id, 'fuelType', e.target.value as FuelType)}
                    options={FUEL_TYPES}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Calculate Button */}
        <div className="mb-8">
          <Button
            onClick={calculateCosts}
            disabled={!deliveryState || cars.every(c => !c.vehiclePrice || !c.sellerState) || isCalculating}
            size="lg"
            className="w-full sm:w-auto"
          >
            {isCalculating ? 'Calculating...' : 'Estimate Delivery Costs'}
          </Button>
        </div>

        {/* Results */}
        {results.length > 0 && (
          <div className="space-y-6">
            {/* Summary */}
            {results.length > 1 && savingsVsWorst > 0 && (
              <div className="rounded-xl bg-green-50 p-6 border border-green-200">
                <div className="flex items-center gap-3">
                  <Trophy className="h-8 w-8 text-green-600" />
                  <div>
                    <h3 className="font-semibold text-green-900">Best Deal: {bestDeal?.name}</h3>
                    <p className="text-green-700">
                      Save <strong>{formatCurrency(savingsVsWorst)}</strong> compared to the most expensive option
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Results Table */}
            <div className="rounded-xl bg-white shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Car</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">Advertised Price</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">Transport</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">Stamp Duty</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">Rego + CTP</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">Inspection</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900 bg-purple-50">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {results.map((result, index) => (
                      <tr key={result.id} className={index === 0 && results.length > 1 ? 'bg-green-50' : ''}>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            {index === 0 && results.length > 1 && (
                              <Trophy className="h-4 w-4 text-green-600" />
                            )}
                            <div>
                              <div className="font-medium text-gray-900">{result.name}</div>
                              <div className="text-sm text-gray-500">From {result.sellerState}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-right text-gray-900">{formatCurrency(result.vehiclePrice)}</td>
                        <td className="px-4 py-4 text-right text-gray-600">
                          {result.transport > 0 ? formatCurrency(result.transport) : '-'}
                        </td>
                        <td className="px-4 py-4 text-right text-gray-600">
                          {result.stampDuty === 0 ? (
                            <span className="text-green-600">$0</span>
                          ) : (
                            formatCurrency(result.stampDuty)
                          )}
                        </td>
                        <td className="px-4 py-4 text-right text-gray-600">
                          {formatCurrency(result.regoPlusCtp)}
                        </td>
                        <td className="px-4 py-4 text-right text-gray-600">
                          {result.roadworthy > 0 ? formatCurrency(result.roadworthy) : '-'}
                        </td>
                        <td className="px-4 py-4 text-right font-bold text-purple-600 bg-purple-50">
                          {formatCurrency(result.totalDelivered)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Detailed Breakdown Cards (Mobile Friendly) */}
            <div className="grid gap-4 md:hidden">
              {results.map((result, index) => (
                <div
                  key={result.id}
                  className={`rounded-xl p-5 ${
                    index === 0 && results.length > 1 ? 'bg-green-50 border-2 border-green-200' : 'bg-white'
                  } shadow-sm`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {index === 0 && results.length > 1 && <Trophy className="h-5 w-5 text-green-600" />}
                      <div>
                        <div className="font-semibold text-gray-900">{result.name}</div>
                        <div className="text-sm text-gray-500">From {result.sellerState}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500">Total</div>
                      <div className="text-xl font-bold text-purple-600">{formatCurrency(result.totalDelivered)}</div>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Advertised Price</span>
                      <span>{formatCurrency(result.vehiclePrice)}</span>
                    </div>
                    {result.transport > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Transport</span>
                        <span>{formatCurrency(result.transport)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-500">Stamp Duty</span>
                      <span>{result.stampDuty === 0 ? <span className="text-green-600">$0</span> : formatCurrency(result.stampDuty)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Rego + CTP</span>
                      <span>{formatCurrency(result.regoPlusCtp)}</span>
                    </div>
                    {result.roadworthy > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Inspection</span>
                        <span>{formatCurrency(result.roadworthy)}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Transport Quotes Coming Soon Section */}
            <div className="rounded-xl border-2 border-dashed border-purple-300 bg-purple-50 p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-purple-100 text-purple-600">
                  <Truck className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">Transport Quotes Coming Soon</h3>
                  <p className="mt-1 text-sm text-gray-600">
                    We&apos;re partnering with trusted car transport providers to bring you real-time quotes.
                    Leave your email to get early access when we launch.
                  </p>

                  {waitlistSubmitted ? (
                    <div className="mt-4 flex items-center gap-2 text-green-600">
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="font-medium">You&apos;re on the list! We&apos;ll be in touch.</span>
                    </div>
                  ) : (
                    <form onSubmit={handleWaitlistSubmit} className="mt-4 flex gap-2">
                      <input
                        type="email"
                        placeholder="Enter your email"
                        value={waitlistEmail}
                        onChange={(e) => setWaitlistEmail(e.target.value)}
                        className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                        required
                      />
                      <Button
                        type="submit"
                        disabled={waitlistLoading}
                        className="bg-purple-600 hover:bg-purple-700"
                        onClick={() => trackEvent('transport_cta_clicked')}
                      >
                        {waitlistLoading ? 'Joining...' : 'Notify Me'}
                      </Button>
                    </form>
                  )}
                </div>
              </div>
            </div>

            {/* Disclaimer */}
            <div className="rounded-lg bg-gray-100 p-4">
              <p className="text-xs text-gray-500">
                <strong>Note:</strong> These are estimates based on current government rates and average
                industry costs. Actual costs may vary. Stamp duty is calculated for used vehicles.
                Transport costs are indicative and subject to change. Always verify with official sources.
              </p>
            </div>
          </div>
        )}

        {/* Info Cards */}
        {results.length === 0 && (
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <Truck className="h-8 w-8 text-purple-600" />
              <h3 className="mt-3 font-semibold text-gray-900">Transport Estimates</h3>
              <p className="mt-2 text-sm text-gray-600">
                Interstate transport costs are estimated based on average carrier rates. Real quotes coming soon.
              </p>
            </div>
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <FileText className="h-8 w-8 text-purple-600" />
              <h3 className="mt-3 font-semibold text-gray-900">All Fees Included</h3>
              <p className="mt-2 text-sm text-gray-600">
                Stamp duty, registration, CTP insurance, and inspection costs all estimated.
              </p>
            </div>
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <Shield className="h-8 w-8 text-purple-600" />
              <h3 className="mt-3 font-semibold text-gray-900">EV Benefits</h3>
              <p className="mt-2 text-sm text-gray-600">
                Electric vehicles may qualify for stamp duty exemptions in NSW, ACT, and SA.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
