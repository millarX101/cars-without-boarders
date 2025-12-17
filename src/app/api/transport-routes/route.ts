import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/types/database';

// Create a Supabase client for server-side
const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET() {
  try {
    const { data: routes, error } = await (supabase as any)
      .from('transport_routes')
      .select('from_state, to_state, base_price, per_km_rate, estimated_days_min, estimated_days_max, notes')
      .order('from_state')
      .order('to_state');

    if (error) {
      console.error('Error fetching transport routes:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch transport routes' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      routes: routes || [],
    });
  } catch (error) {
    console.error('Transport routes API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
