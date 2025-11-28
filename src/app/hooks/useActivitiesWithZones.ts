import { useState, useEffect } from 'react';
import { DetailedStravaActivity } from '../types/strava';
import { getClientSideStravaClient } from '../lib/stravaClient';
import { StravaService } from '../lib/stravaService';
import { useStravaAuth } from '../context/StravaAuthContext';

interface CachedActivitiesWithZones {
  activities: DetailedStravaActivity[];
  lastFetched: number;
  startDate: string;
  endDate: string;
}

const CACHE_KEY = 'strava_activities_zones_cache';
const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes

export function useActivitiesWithZones(startDate: Date, endDate: Date) {
  const [activities, setActivities] = useState<DetailedStravaActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { setIsAuthenticated } = useStravaAuth();

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true);
        setError(null);

        const startDateStr = startDate.toISOString();
        const endDateStr = endDate.toISOString();

        // Check cache first
        const cached = getCachedActivitiesWithZones();
        if (cached && isCacheValid(cached, startDateStr, endDateStr)) {
          console.log('✓ Using cached activities with zones');
          setActivities(cached.activities);
          setLoading(false);
          return;
        }

        console.log('⟳ Fetching activities with zones from Strava API');
        
        // Get Strava client and call API directly
        const client = await getClientSideStravaClient();
        if (!client) {
          setIsAuthenticated(false);
          throw new Error('Your Strava session has expired. Please connect with Strava again.');
        }

        const stravaService = new StravaService(client);
        const fetchedActivities = await stravaService.getActivitiesWithZones(
          startDate,
          endDate
        );

        // Update cache
        const cacheData: CachedActivitiesWithZones = {
          activities: fetchedActivities,
          lastFetched: Date.now(),
          startDate: startDateStr,
          endDate: endDateStr,
        };
        localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
        console.log('💾 Activities with zones cache updated');

        setActivities(fetchedActivities);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        setActivities([]);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate.getTime(), endDate.getTime()]);

  return { activities, loading, error };
}

function getCachedActivitiesWithZones(): CachedActivitiesWithZones | null {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;
    return JSON.parse(cached) as CachedActivitiesWithZones;
  } catch {
    return null;
  }
}

function isCacheValid(
  cached: CachedActivitiesWithZones,
  requestedStart: string,
  requestedEnd: string
): boolean {
  const now = Date.now();
  const cacheAge = now - cached.lastFetched;

  // Check if cache is not expired
  if (cacheAge > CACHE_DURATION) {
    return false;
  }

  // Check if cached range covers requested range
  return cached.startDate === requestedStart && cached.endDate === requestedEnd;
}
