import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') || '/';

  if (code) {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Redirect to the next URL or home page with verified flag
      return NextResponse.redirect(new URL('/auth/login?verified=true', requestUrl.origin));
    }
  }

  // Return the user to an error page if something went wrong
  return NextResponse.redirect(new URL('/auth/login?error=Could not verify email', requestUrl.origin));
}
