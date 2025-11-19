import { NextRequest, NextResponse } from 'next/server';
import { stravaService } from '@/app/services/stravaService';

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
    const activities = await stravaService.getActivitiesInDateRange(
      new Date(startDate),
      new Date(endDate)
    );

    // Filter for running activities only
    const runActivities = activities.filter(
      (activity) => activity.type === 'Run' || activity.type === 'VirtualRun'
    );

    const response = NextResponse.json({ activities: runActivities });
    
    // Cache for 7 days (604800 seconds)
    response.headers.set('Cache-Control', 'public, max-age=604800, s-maxage=604800');
    
    return response;
  } catch (error) {
    console.error('Error fetching activities:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { error: 'Failed to fetch activities', details: errorMessage },
      { status: 500 }
    );
  }
}
