import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ success: true });
  
  // Clear all Strava authentication cookies
  response.cookies.delete('strava_access_token');
  response.cookies.delete('strava_refresh_token');
  response.cookies.delete('strava_expires_at');
  response.cookies.delete('strava_athlete_id');
  
  return response;
}
