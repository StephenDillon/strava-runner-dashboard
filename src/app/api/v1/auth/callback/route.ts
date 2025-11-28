import { NextRequest, NextResponse } from 'next/server';
import { StravaTokenResponse } from '../../../../types/strava';

const STRAVA_AUTH_BASE = 'https://www.strava.com/oauth';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  if (error) {
    return NextResponse.redirect(new URL('/?error=access_denied', request.url));
  }

  if (!code) {
    return NextResponse.json({ error: 'No code provided' }, { status: 400 });
  }

  try {
    const tokenResponse = await fetch(`${STRAVA_AUTH_BASE}/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: process.env.NEXT_PUBLIC_STRAVA_CLIENT_ID,
        client_secret: process.env.STRAVA_CLIENT_SECRET,
        code,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error('Failed to exchange token');
    }

    const tokenData: StravaTokenResponse = await tokenResponse.json();

    console.log('Token data received:', {
      athlete: tokenData.athlete,
      expiresAt: new Date(tokenData.expires_at * 1000),
    });

    // Store tokens in HTTP-only cookies for security
    const response = NextResponse.redirect(
      new URL('/?auth=success', request.url)
    );
    
    // Set secure HTTP-only cookies
    response.cookies.set('strava_access_token', tokenData.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 6, // 6 hours
      path: '/'
    });
    
    response.cookies.set('strava_refresh_token', tokenData.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 365, // 1 year
      path: '/'
    });
    
    response.cookies.set('strava_expires_at', tokenData.expires_at.toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 365, // 1 year
      path: '/'
    });
    
    response.cookies.set('strava_athlete_id', tokenData.athlete.id.toString(), {
      httpOnly: false, // Allow client to read this for display purposes
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 365, // 1 year
      path: '/'
    });

    return response;
  } catch (error) {
    console.error('Error exchanging token:', error);
    return NextResponse.redirect(
      new URL('/?error=token_exchange_failed', request.url)
    );
  }
}
