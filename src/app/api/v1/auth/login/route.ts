import { NextResponse } from 'next/server';
import { StravaClient } from '@/app/lib/stravaClient';

const STRAVA_AUTH_BASE = 'https://www.strava.com/oauth';

export async function GET() {
  try {
    const clientId = process.env.NEXT_PUBLIC_STRAVA_CLIENT_ID;
    const redirectUri = process.env.NEXT_PUBLIC_STRAVA_REDIRECT_URI;
    const scope = 'read,activity:read_all,profile:read_all';

    var authUrl = `${STRAVA_AUTH_BASE}/authorize?client_id=${clientId}&response_type=code&redirect_uri=${redirectUri}&approval_prompt=force&scope=${scope}`;
    
    return NextResponse.json({ authUrl });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to generate auth URL' },
      { status: 500 }
    );
  }
}
