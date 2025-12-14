'use client';

import { Truck, FileText, Car, Wrench, ChevronDown, ChevronUp, Info } from 'lucide-react';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatPrice } from '@/lib/utils/format';
import { cn } from '@/lib/utils/cn';

interface CostBreakdownProps {
  vehiclePrice: number;
  costs: {
    transport: {
      cost: number;
      type: string;
      distance?: number;
      estimatedDays?: { min: number; max: number };
    };
    stampDuty: {
      amount: number;
      state: string;
      effectiveRate?: string;
    };
    registration: {
      amount: number;
      state: string;
      period: string;
      includesCTP: boolean;
    };
    roadworthy: {
      required: boolean;
      cost: number;
      reason?: string;
    };
    totalDelivered: number;
  };
  sellerState: string;
  deliveryState: string;
  className?: string;
}

interface CostLineProps {
  icon: React.ReactNode;
  label: string;
  amount: number;
  detail?: string;
  highlight?: boolean;
}

function CostLine({ icon, label, amount, detail, highlight = false }: CostLineProps) {
  return (
    <div className={cn('flex items-start justify-between py-3', highlight && 'bg-blue-50 -mx-4 px-4 rounded-lg')}>
      <div className="flex items-start gap-3">
        <div className={cn('mt-0.5 text-gray-400', highlight && 'text-blue-500')}>
          {icon}
        </div>
        <div>
          <span className={cn('font-medium text-gray-700', highlight && 'text-blue-700')}>
            {label}
          </span>
          {detail && (
            <p className="text-xs text-gray-500 mt-0.5">{detail}</p>
          )}
        </div>
      </div>
      <span className={cn('font-semibold', highlight ? 'text-blue-700' : 'text-gray-900')}>
        {amount === 0 ? 'Free' : formatPrice(amount)}
      </span>
    </div>
  );
}

export function CarCostBreakdown({
  vehiclePrice,
  costs,
  sellerState,
  deliveryState,
  className,
}: CostBreakdownProps) {
  const [expanded, setExpanded] = useState(true);
  const isLocalPickup = costs.transport.type === 'pickup' || sellerState === deliveryState;

  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Cost Breakdown</CardTitle>
          <button
            onClick={() => setExpanded(!expanded)}
            className="rounded-full p-1 hover:bg-white/10"
          >
            {expanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </button>
        </div>
        <p className="text-sm text-blue-100">
          {isLocalPickup
            ? `Buying locally in ${deliveryState}`
            : `${sellerState} → ${deliveryState}`}
        </p>
      </CardHeader>

      <CardContent className="p-4">
        {/* Vehicle Price */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <span className="text-gray-600">Vehicle Price</span>
          <span className="text-lg font-bold">{formatPrice(vehiclePrice)}</span>
        </div>

        {/* Expandable Details */}
        {expanded && (
          <div className="divide-y divide-gray-100">
            {/* Transport */}
            <CostLine
              icon={<Truck className="h-5 w-5" />}
              label={isLocalPickup ? 'Transport (Local Pickup)' : `Transport (${sellerState} → ${deliveryState})`}
              amount={costs.transport.cost}
              detail={
                costs.transport.estimatedDays && costs.transport.cost > 0
                  ? `${costs.transport.estimatedDays.min}-${costs.transport.estimatedDays.max} days delivery`
                  : isLocalPickup
                  ? 'Collect in person'
                  : undefined
              }
              highlight={costs.transport.cost > 0}
            />

            {/* Stamp Duty */}
            <CostLine
              icon={<FileText className="h-5 w-5" />}
              label={`Stamp Duty (${costs.stampDuty.state})`}
              amount={costs.stampDuty.amount}
              detail={costs.stampDuty.effectiveRate ? `Effective rate: ${costs.stampDuty.effectiveRate}` : undefined}
            />

            {/* Registration + CTP */}
            <CostLine
              icon={<Car className="h-5 w-5" />}
              label={`Registration + CTP (${costs.registration.state})`}
              amount={costs.registration.amount}
              detail={`${costs.registration.period}${costs.registration.includesCTP ? ', includes CTP' : ''}`}
            />

            {/* Roadworthy */}
            {costs.roadworthy.required && (
              <CostLine
                icon={<Wrench className="h-5 w-5" />}
                label="Roadworthy / Inspection"
                amount={costs.roadworthy.cost}
                detail={costs.roadworthy.reason}
              />
            )}
          </div>
        )}

        {/* Total */}
        <div className="mt-4 rounded-lg bg-gray-50 p-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-medium text-gray-600">Total Delivered</span>
              <p className="text-xs text-gray-500">All-inclusive estimate</p>
            </div>
            <span className="text-2xl font-bold text-blue-600">
              {formatPrice(costs.totalDelivered)}
            </span>
          </div>
        </div>

        {/* Info Note */}
        <div className="mt-4 flex items-start gap-2 rounded-lg bg-amber-50 p-3 text-xs text-amber-800">
          <Info className="h-4 w-4 flex-shrink-0 mt-0.5" />
          <p>
            Costs are estimates only. Actual amounts may vary based on vehicle specifics,
            insurance provider, and market conditions. Verify with official sources.
          </p>
        </div>

        {/* Transport Badge */}
        {costs.transport.cost > 0 && (
          <div className="mt-4">
            <Badge variant="outline" className="w-full justify-center py-2">
              Need transport? We can help arrange delivery
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
