"use client";

import React from 'react';
import { StravaActivity } from '../types/strava';
import ActivityTooltipItem from './ActivityTooltipItem';
import { metersToMiles } from '../utils/activityAggregation';

interface WeekActivitiesTooltipProps {
  activities: StravaActivity[];
  onClose: () => void;
  isActivityDisabled: (id: number) => boolean;
  onToggleActivity: (id: number) => void;
  unit: 'miles' | 'kilometers';
  showCadence?: boolean;
}

export default function WeekActivitiesTooltip({
  activities,
  onClose,
  isActivityDisabled,
  onToggleActivity,
  unit,
  showCadence = false
}: WeekActivitiesTooltipProps) {
  const unitLabel = unit === 'kilometers' ? 'km' : 'mi';
  
  // Sort activities from oldest to newest
  const sortedActivities = [...activities].sort((a, b) => 
    new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
  );
  
  // Calculate total distance
  const totalDistance = sortedActivities.reduce((sum, activity) => {
    if (isActivityDisabled(activity.id)) return sum;
    const distanceMiles = metersToMiles(activity.distance);
    return sum + (unit === 'kilometers' ? distanceMiles * 1.60934 : distanceMiles);
  }, 0);

  return (
    <div className="absolute left-0 top-10 z-50 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-xl p-3 min-w-[300px] max-w-[400px]">
      <button
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
        title="Close"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      <div className="text-xs font-semibold text-gray-700 dark:text-gray-200 mb-1">
        {activities.length} {activities.length === 1 ? 'Activity' : 'Activities'} this week:
      </div>
      <div className="text-[10px] text-gray-500 dark:text-gray-400 mb-2 italic">
        Click to keep open, click X to close
      </div>
      
      {/* Summary Stats */}
      <div className="mb-2 pb-2 border-b border-gray-200 dark:border-gray-600">
        <div className="text-xs text-gray-700 dark:text-gray-300">
          <span className="font-semibold">Total:</span> {totalDistance.toFixed(2)} {unitLabel}
        </div>
      </div>

      <div className="space-y-1 max-h-60 overflow-y-auto">
        {sortedActivities.map((activity) => {
          const distance = unit === 'kilometers' 
            ? (metersToMiles(activity.distance) * 1.60934).toFixed(2)
            : metersToMiles(activity.distance).toFixed(2);
          return (
            <ActivityTooltipItem
              key={activity.id}
              activity={activity}
              isDisabled={isActivityDisabled(activity.id)}
              onToggle={onToggleActivity}
              distance={distance}
              unitLabel={unitLabel}
              showCadence={showCadence}
            />
          );
        })}
      </div>
    </div>
  );
}
