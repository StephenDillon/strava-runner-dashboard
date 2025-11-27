import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getStravaClientFromCookies } from '@/app/lib/stravaClient';
import { StravaService } from '@/app/lib/stravaService';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');

  if (!startDate || !endDate) {
    return NextResponse.json(
      { error: 'startDate and endDate are required' },
      { status: 400 }
    );
  }

  try {
    // Get user-specific Strava client from cookies
    const cookieStore = await cookies();
    const client = getStravaClientFromCookies(cookieStore);
    
    // Check if we have tokens
    const initialTokenData = client.getTokenData();
    if (!initialTokenData.accessToken) {
      console.error('No access token found in cookies');
      return NextResponse.json(
        { error: 'Authentication required. Please log in with Strava.' },
        { status: 401 }
      );
    }
    
    const stravaService = new StravaService(client);
    
    const activities = await stravaService.getActivitiesInDateRange(
      new Date(startDate),
      new Date(endDate)
    );

    // Check if tokens were refreshed and update cookies if needed
    const updatedTokenData = client.getTokenData();
    const response = NextResponse.json({ activities });
    
    // Update cookies if tokens changed
    if (updatedTokenData.accessToken && updatedTokenData.accessToken !== initialTokenData.accessToken) {
      response.cookies.set('strava_access_token', updatedTokenData.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 6,
        path: '/'
      });
    }
    if (updatedTokenData.refreshToken && updatedTokenData.refreshToken !== initialTokenData.refreshToken) {
      response.cookies.set('strava_refresh_token', updatedTokenData.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 365,
        path: '/'
      });
    }
    if (updatedTokenData.expiresAt && updatedTokenData.expiresAt !== initialTokenData.expiresAt) {
      response.cookies.set('strava_expires_at', updatedTokenData.expiresAt.toString(), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 365,
        path: '/'
      });
    }
    
    // Cache for 15 minutes, allow stale data for 1 day while revalidating in background
    response.headers.set('Cache-Control', 'public, max-age=900, stale-while-revalidate=86400');
    
    return response;
  } catch (error) {
    console.error('Error fetching activities:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    // If authentication error, clear cookies
    if (errorMessage.includes('authenticate') || errorMessage.includes('token')) {
      const response = NextResponse.json(
        { error: 'Authentication required', details: errorMessage },
        { status: 401 }
      );
      response.cookies.delete('strava_access_token');
      response.cookies.delete('strava_refresh_token');
      response.cookies.delete('strava_expires_at');
      response.cookies.delete('strava_athlete_id');
      return response;
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch activities', details: errorMessage },
      { status: 500 }
    );
  }
}
