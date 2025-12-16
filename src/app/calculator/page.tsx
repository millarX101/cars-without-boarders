'use client';

import { useState } from 'react';
import { Calculator, Car, MapPin, DollarSign, Truck, FileText, Shield, Plus, X, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import type { AustralianState, FuelType } from '@/lib/types/car';

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
  registration: number;
  ctp: number;
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

export default function CalculatorPage() {
  const [cars, setCars] = useState<CarEntry[]>([createEmptyCar()]);
  const [deliveryState, setDeliveryState] = useState<AustralianState | ''>('');
  const [results, setResults] = useState<CostResult[]>([]);
  const [isCalculating, setIsCalculating] = useState(false);

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

  const calculateCosts = async () => {
    if (!deliveryState) return;

    const validCars = cars.filter(car => car.vehiclePrice && car.sellerState);
    if (validCars.length === 0) return;

    setIsCalculating(true);
    await new Promise(resolve => setTimeout(resolve, 300));

    const transportCosts: Record<string, Record<string, number>> = {
      'NSW': { 'NSW': 0, 'VIC': 450, 'QLD': 550, 'SA': 700, 'WA': 1100, 'TAS': 900, 'ACT': 250, 'NT': 1300 },
      'VIC': { 'NSW': 450, 'VIC': 0, 'QLD': 650, 'SA': 450, 'WA': 1200, 'TAS': 750, 'ACT': 500, 'NT': 1400 },
      'QLD': { 'NSW': 550, 'VIC': 650, 'QLD': 0, 'SA': 950, 'WA': 1300, 'TAS': 1050, 'ACT': 650, 'NT': 1200 },
      'SA': { 'NSW': 700, 'VIC': 450, 'QLD': 950, 'SA': 0, 'WA': 950, 'TAS': 850, 'ACT': 750, 'NT': 1100 },
      'WA': { 'NSW': 1100, 'VIC': 1200, 'QLD': 1300, 'SA': 950, 'WA': 0, 'TAS': 1400, 'ACT': 1150, 'NT': 1200 },
      'TAS': { 'NSW': 900, 'VIC': 750, 'QLD': 1050, 'SA': 850, 'WA': 1400, 'TAS': 0, 'ACT': 950, 'NT': 1500 },
      'ACT': { 'NSW': 250, 'VIC': 500, 'QLD': 650, 'SA': 750, 'WA': 1150, 'TAS': 950, 'ACT': 0, 'NT': 1350 },
      'NT': { 'NSW': 1300, 'VIC': 1400, 'QLD': 1200, 'SA': 1100, 'WA': 1200, 'TAS': 1500, 'ACT': 1350, 'NT': 0 },
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

    const regoByState: Record<AustralianState, number> = {
      'NSW': 450, 'VIC': 380, 'QLD': 420, 'SA': 480, 'WA': 520, 'TAS': 350, 'ACT': 440, 'NT': 520,
    };

    const ctpByState: Record<AustralianState, number> = {
      'NSW': 550, 'VIC': 520, 'QLD': 350, 'SA': 450, 'WA': 480, 'TAS': 380, 'ACT': 550, 'NT': 500,
    };

    const roadworthyByState: Record<AustralianState, number> = {
      'NSW': 150, 'VIC': 180, 'QLD': 120, 'SA': 130, 'WA': 200, 'TAS': 140, 'ACT': 160, 'NT': 100,
    };

    const newResults: CostResult[] = validCars.map((car, index) => {
      const price = parseFloat(car.vehiclePrice);
      const isInterstate = car.sellerState !== deliveryState;
      const transport = transportCosts[car.sellerState]?.[deliveryState] || 0;
      const stampDuty = Math.round(calculateStampDuty(deliveryState, price, car.fuelType));
      const registration = regoByState[deliveryState];
      const ctp = ctpByState[deliveryState];
      const roadworthy = isInterstate ? roadworthyByState[deliveryState] : 0;
      const totalDelivered = price + transport + stampDuty + registration + ctp + roadworthy;

      return {
        id: car.id,
        name: car.name || `Car ${index + 1}`,
        vehiclePrice: price,
        transport,
        stampDuty,
        registration,
        ctp,
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
      <section className="bg-gradient-to-br from-blue-600 to-indigo-700 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/20 px-4 py-2 text-sm font-medium text-blue-100">
              <Calculator className="h-4 w-4" />
              True Cost Calculator
            </div>
            <h1 className="mt-4 text-3xl font-bold text-white sm:text-4xl">
              Compare Cars From Different States
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-blue-100">
              Add up to 5 cars and see the true delivered cost to your door.
              Find out which deal is actually the best value.
            </p>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Delivery Location */}
        <div className="mb-8 rounded-xl bg-white p-6 shadow-sm">
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
                    placeholder="Price (e.g. 35000)"
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
            {isCalculating ? 'Calculating...' : 'Calculate & Compare'}
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
                      <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">Price</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">Transport</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">Stamp Duty</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">Rego + CTP</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">Inspection</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900 bg-blue-50">Total</th>
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
                          {formatCurrency(result.registration + result.ctp)}
                        </td>
                        <td className="px-4 py-4 text-right text-gray-600">
                          {result.roadworthy > 0 ? formatCurrency(result.roadworthy) : '-'}
                        </td>
                        <td className="px-4 py-4 text-right font-bold text-blue-600 bg-blue-50">
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
                      <div className="text-xl font-bold text-blue-600">{formatCurrency(result.totalDelivered)}</div>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Vehicle Price</span>
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
                      <span>{formatCurrency(result.registration + result.ctp)}</span>
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

            {/* Disclaimer */}
            <div className="rounded-lg bg-gray-100 p-4">
              <p className="text-xs text-gray-500">
                <strong>Note:</strong> These are estimates based on current government rates and average
                industry costs. Actual costs may vary. Stamp duty is calculated for used vehicles.
                Transport costs are for enclosed carrier delivery. Always verify with official sources.
              </p>
            </div>
          </div>
        )}

        {/* Info Cards */}
        {results.length === 0 && (
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <Truck className="h-8 w-8 text-blue-600" />
              <h3 className="mt-3 font-semibold text-gray-900">Transport Included</h3>
              <p className="mt-2 text-sm text-gray-600">
                Interstate transport costs are automatically calculated based on carrier rates.
              </p>
            </div>
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <FileText className="h-8 w-8 text-blue-600" />
              <h3 className="mt-3 font-semibold text-gray-900">All Fees Included</h3>
              <p className="mt-2 text-sm text-gray-600">
                Stamp duty, registration, CTP insurance, and inspection costs all calculated.
              </p>
            </div>
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <Shield className="h-8 w-8 text-blue-600" />
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
