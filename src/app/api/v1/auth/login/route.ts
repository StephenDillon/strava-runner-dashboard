import { NextResponse } from 'next/server';
import { StravaClient } from '@/app/lib/stravaClient';

export async function GET() {
  try {
    const client = new StravaClient();
    const authUrl = client.getAuthorizationUrl();
    
    return NextResponse.json({ authUrl });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to generate auth URL' },
      { status: 500 }
    );
  }
}
