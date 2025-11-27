import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('strava_access_token')?.value;
  const athleteId = cookieStore.get('strava_athlete_id')?.value;
  
  return NextResponse.json({
    authenticated: !!accessToken,
    athleteId: athleteId || null
  });
}
