import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const STRAVA_AUTH_BASE = 'https://www.strava.com/oauth';

export async function POST() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get('strava_refresh_token')?.value;

  if (!refreshToken) {
    return NextResponse.json(
      { error: 'No refresh token available' },
      { status: 401 }
    );
  }

  try {
    const response = await fetch(`${STRAVA_AUTH_BASE}/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: process.env.NEXT_PUBLIC_STRAVA_CLIENT_ID,
        client_secret: process.env.STRAVA_CLIENT_SECRET,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to refresh token:', errorText);
      
      // Clear cookies on refresh failure
      const errorResponse = NextResponse.json(
        { error: 'Failed to refresh token' },
        { status: 401 }
      );
      errorResponse.cookies.delete('strava_access_token');
      errorResponse.cookies.delete('strava_refresh_token');
      errorResponse.cookies.delete('strava_expires_at');
      errorResponse.cookies.delete('strava_athlete_id');
      
      return errorResponse;
    }

    const tokenData = await response.json();

    // Update cookies with new tokens
    const successResponse = NextResponse.json({
      access_token: tokenData.access_token,
      expires_at: tokenData.expires_at,
    });

    successResponse.cookies.set('strava_access_token', tokenData.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 6, // 6 hours
      path: '/'
    });

    successResponse.cookies.set('strava_refresh_token', tokenData.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 365, // 1 year
      path: '/'
    });

    successResponse.cookies.set('strava_expires_at', tokenData.expires_at.toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 365, // 1 year
      path: '/'
    });

    return successResponse;
  } catch (error) {
    console.error('Error refreshing token:', error);
    return NextResponse.json(
      { error: 'Failed to refresh token' },
      { status: 500 }
    );
  }
}
