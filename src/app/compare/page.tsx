'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatPrice, formatNumber } from '@/lib/utils/format';
import { Plus, X, Check, Minus, ExternalLink } from 'lucide-react';

// Mock comparison data
const MOCK_CARS = [
  {
    id: '1',
    make: 'Mini',
    model: 'Cooper SE',
    year: 2023,
    price: 52990,
    odometer: 12500,
    transmission: 'automatic',
    fuelType: 'electric',
    sellerState: 'VIC',
    sellerSuburb: 'Richmond',
    image: 'https://via.placeholder.com/400x300?text=Mini+Cooper+SE',
    costs: {
      transport: 450,
      stampDuty: 2120,
      registration: 850,
      roadworthy: 150,
      totalDelivered: 56560,
    },
    features: ['Apple CarPlay', 'Heated Seats', 'Navigation', 'Parking Sensors'],
  },
  {
    id: '2',
    make: 'Tesla',
    model: 'Model 3',
    year: 2023,
    price: 55990,
    odometer: 15000,
    transmission: 'automatic',
    fuelType: 'electric',
    sellerState: 'NSW',
    sellerSuburb: 'Parramatta',
    image: 'https://via.placeholder.com/400x300?text=Tesla+Model+3',
    costs: {
      transport: 0,
      stampDuty: 2240,
      registration: 850,
      roadworthy: 0,
      totalDelivered: 59080,
    },
    features: ['Autopilot', 'Premium Audio', 'Glass Roof', 'Supercharger Access'],
  },
  {
    id: '3',
    make: 'Hyundai',
    model: 'Ioniq 5',
    year: 2023,
    price: 58990,
    odometer: 8000,
    transmission: 'automatic',
    fuelType: 'electric',
    sellerState: 'QLD',
    sellerSuburb: 'Brisbane',
    image: 'https://via.placeholder.com/400x300?text=Hyundai+Ioniq+5',
    costs: {
      transport: 550,
      stampDuty: 2360,
      registration: 850,
      roadworthy: 150,
      totalDelivered: 62900,
    },
    features: ['Vehicle-to-Load', 'Highway Driving Assist', 'Panoramic Roof', 'Bose Audio'],
  },
];

type Car = typeof MOCK_CARS[0];

interface CompareRowProps {
  label: string;
  values: (string | number | React.ReactNode)[];
  highlight?: boolean;
}

function CompareRow({ label, values, highlight = false }: CompareRowProps) {
  return (
    <div className={`grid grid-cols-${values.length + 1} gap-4 py-3 ${highlight ? 'bg-blue-50 -mx-4 px-4 rounded-lg' : ''}`}>
      <div className="text-sm font-medium text-gray-600">{label}</div>
      {values.map((value, idx) => (
        <div key={idx} className={`text-sm ${highlight ? 'font-bold text-blue-700' : 'text-gray-900'}`}>
          {value}
        </div>
      ))}
    </div>
  );
}

export default function ComparePage() {
  const [selectedCars, setSelectedCars] = useState<Car[]>(MOCK_CARS.slice(0, 2));
  const deliveryState = 'NSW';

  const addCar = (car: Car) => {
    if (selectedCars.length < 4 && !selectedCars.find(c => c.id === car.id)) {
      setSelectedCars([...selectedCars, car]);
    }
  };

  const removeCar = (carId: string) => {
    setSelectedCars(selectedCars.filter(c => c.id !== carId));
  };

  // Find best values
  const lowestPrice = Math.min(...selectedCars.map(c => c.price));
  const lowestTotal = Math.min(...selectedCars.map(c => c.costs.totalDelivered));
  const lowestOdometer = Math.min(...selectedCars.map(c => c.odometer));

  // All unique features
  const allFeatures = [...new Set(selectedCars.flatMap(c => c.features))];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Compare Cars</h1>
          <p className="mt-2 text-gray-600">
            Compare up to 4 cars side by side with full delivered costs to {deliveryState}
          </p>
        </div>

        {selectedCars.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <h2 className="text-xl font-semibold text-gray-900">No cars to compare</h2>
              <p className="mt-2 text-gray-500">
                Search for cars and add them to your comparison list.
              </p>
              <Button asChild className="mt-4">
                <Link href="/search">Search Cars</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Car Cards Header */}
            <div className="overflow-x-auto">
              <div className="grid gap-4" style={{ gridTemplateColumns: `200px repeat(${selectedCars.length}, minmax(250px, 1fr))` }}>
                {/* Empty corner */}
                <div />

                {/* Car Cards */}
                {selectedCars.map((car) => (
                  <Card key={car.id} className="relative">
                    <button
                      onClick={() => removeCar(car.id)}
                      className="absolute -right-2 -top-2 z-10 rounded-full bg-gray-100 p-1 shadow hover:bg-gray-200"
                    >
                      <X className="h-4 w-4" />
                    </button>
                    <div className="aspect-[4/3] relative overflow-hidden rounded-t-lg bg-gray-100">
                      <Image
                        src={car.image}
                        alt={`${car.year} ${car.make} ${car.model}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-gray-900">
                        {car.year} {car.make} {car.model}
                      </h3>
                      <div className="mt-1 flex items-center gap-1 text-sm text-gray-500">
                        {car.sellerSuburb}, {car.sellerState}
                      </div>
                      <div className="mt-3 flex items-baseline justify-between">
                        <span className="text-sm text-gray-500">Listed</span>
                        <span className={`font-semibold ${car.price === lowestPrice ? 'text-green-600' : ''}`}>
                          {formatPrice(car.price)}
                        </span>
                      </div>
                      <div className="mt-1 flex items-baseline justify-between">
                        <span className="text-sm text-gray-500">Delivered</span>
                        <span className={`text-lg font-bold ${car.costs.totalDelivered === lowestTotal ? 'text-green-600' : 'text-blue-600'}`}>
                          {formatPrice(car.costs.totalDelivered)}
                        </span>
                      </div>
                      {car.costs.totalDelivered === lowestTotal && (
                        <Badge variant="success" className="mt-2 w-full justify-center">
                          Best Value
                        </Badge>
                      )}
                    </CardContent>
                  </Card>
                ))}

                {/* Add Car Slot */}
                {selectedCars.length < 4 && (
                  <Card className="flex items-center justify-center border-dashed">
                    <CardContent className="py-12 text-center">
                      <Button variant="outline" asChild>
                        <Link href="/search">
                          <Plus className="mr-2 h-4 w-4" />
                          Add Car
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>

            {/* Comparison Table */}
            <Card>
              <CardHeader>
                <CardTitle>Specifications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <div className="min-w-[600px]">
                    {/* Basic Info */}
                    <div className="border-b border-gray-200 pb-4">
                      <h4 className="mb-3 font-semibold text-gray-900">Basic Info</h4>
                      <div className="space-y-1">
                        <CompareRow
                          label="Year"
                          values={selectedCars.map(c => c.year)}
                        />
                        <CompareRow
                          label="Odometer"
                          values={selectedCars.map(c => (
                            <span className={c.odometer === lowestOdometer ? 'text-green-600 font-medium' : ''}>
                              {formatNumber(c.odometer)} km
                            </span>
                          ))}
                        />
                        <CompareRow
                          label="Transmission"
                          values={selectedCars.map(c => c.transmission)}
                        />
                        <CompareRow
                          label="Fuel Type"
                          values={selectedCars.map(c => c.fuelType)}
                        />
                        <CompareRow
                          label="Location"
                          values={selectedCars.map(c => `${c.sellerSuburb}, ${c.sellerState}`)}
                        />
                      </div>
                    </div>

                    {/* Pricing */}
                    <div className="border-b border-gray-200 py-4">
                      <h4 className="mb-3 font-semibold text-gray-900">Pricing & Costs</h4>
                      <div className="space-y-1">
                        <CompareRow
                          label="Listed Price"
                          values={selectedCars.map(c => (
                            <span className={c.price === lowestPrice ? 'text-green-600 font-medium' : ''}>
                              {formatPrice(c.price)}
                            </span>
                          ))}
                        />
                        <CompareRow
                          label="Transport"
                          values={selectedCars.map(c =>
                            c.costs.transport === 0 ? 'Free (Local)' : formatPrice(c.costs.transport)
                          )}
                        />
                        <CompareRow
                          label="Stamp Duty"
                          values={selectedCars.map(c => formatPrice(c.costs.stampDuty))}
                        />
                        <CompareRow
                          label="Rego + CTP"
                          values={selectedCars.map(c => formatPrice(c.costs.registration))}
                        />
                        <CompareRow
                          label="Roadworthy"
                          values={selectedCars.map(c =>
                            c.costs.roadworthy === 0 ? 'N/A' : formatPrice(c.costs.roadworthy)
                          )}
                        />
                        <CompareRow
                          label="Total Delivered"
                          values={selectedCars.map(c => (
                            <span className={c.costs.totalDelivered === lowestTotal ? 'text-green-600' : ''}>
                              {formatPrice(c.costs.totalDelivered)}
                            </span>
                          ))}
                          highlight
                        />
                      </div>
                    </div>

                    {/* Features */}
                    <div className="pt-4">
                      <h4 className="mb-3 font-semibold text-gray-900">Features</h4>
                      <div className="space-y-1">
                        {allFeatures.map(feature => (
                          <CompareRow
                            key={feature}
                            label={feature}
                            values={selectedCars.map(c =>
                              c.features.includes(feature) ? (
                                <Check className="h-5 w-5 text-green-600" />
                              ) : (
                                <Minus className="h-5 w-5 text-gray-300" />
                              )
                            )}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex flex-wrap gap-4">
              {selectedCars.map((car) => (
                <Button key={car.id} variant="outline" asChild>
                  <Link href={`/car/${car.id}`}>
                    View {car.make} {car.model}
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
