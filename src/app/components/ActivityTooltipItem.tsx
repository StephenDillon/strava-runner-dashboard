"use client";

import React from 'react';
import { StravaActivity } from '../types/strava';

interface ActivityTooltipItemProps {
  activity: StravaActivity;
  isDisabled: boolean;
  onToggle: (activityId: number) => void;
  distance: string;
  unitLabel: string;
  showCadence?: boolean;
}

export default function ActivityTooltipItem({ 
  activity, 
  isDisabled, 
  onToggle, 
  distance, 
  unitLabel,
  showCadence = false
}: ActivityTooltipItemProps) {
  // Format pace (min/mile or min/km)
  const formatPace = (metersPerSecond: number): string => {
    if (!metersPerSecond || metersPerSecond === 0) return 'N/A';
    const minutesPerUnit = unitLabel === 'km' 
      ? 16.6667 / metersPerSecond  // minutes per km
      : 26.8224 / metersPerSecond; // minutes per mile
    const mins = Math.floor(minutesPerUnit);
    const secs = Math.round((minutesPerUnit - mins) * 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Format time
  const formatTime = (seconds: number): string => {
    if (seconds === 0 || !isFinite(seconds)) return 'N/A';
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.round(seconds % 60);
    
    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const pace = formatPace(activity.average_speed);
  const time = formatTime(activity.moving_time);
  
  return (
    <div
      className={`flex items-center gap-2 py-1 px-2 rounded transition-colors ${
        isDisabled ? 'opacity-50 bg-gray-100 dark:bg-gray-600' : 'hover:bg-gray-50 dark:hover:bg-gray-600'
      }`}
    >
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onToggle(activity.id);
        }}
        className={`shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
          isDisabled
            ? 'border-red-500 bg-red-500 text-white'
            : 'border-gray-400 dark:border-gray-500 hover:border-red-500'
        }`}
        title={isDisabled ? 'Enable activity' : 'Disable activity'}
      >
        {isDisabled && (
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        )}
      </button>
      <div className="flex-1 text-xs">
        <a
          href={`https://www.strava.com/activities/${activity.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className={`block ${
            isDisabled
              ? 'text-gray-500 dark:text-gray-400'
              : 'text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline'
          }`}
        >
          View on Strava
        </a>
        <div className={`font-medium ${
          isDisabled
            ? 'text-gray-500 dark:text-gray-400 line-through'
            : 'text-gray-900 dark:text-gray-100'
        }`}>
          {activity.name}
        </div>
        <div className="text-gray-600 dark:text-gray-400">
          {new Date(activity.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} • {time}
        </div>
        <div className="text-gray-600 dark:text-gray-400">
          {distance} {unitLabel} • {pace}/{unitLabel}
        </div>
      </div>
    </div>
  );
}
