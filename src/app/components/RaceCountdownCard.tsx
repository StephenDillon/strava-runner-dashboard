"use client";

import { Race } from '../types/race';
import { parseRaceDate } from '../utils/dateUtils';

interface RaceCountdownCardProps {
    race: Race;
}

export default function RaceCountdownCard({ race }: RaceCountdownCardProps) {
    const calculateTimeLeft = () => {
        const now = new Date();
        now.setHours(0, 0, 0, 0);

        const raceDateLocal = parseRaceDate(race.date);

        const difference = raceDateLocal.getTime() - now.getTime();

        if (difference < 0) {
            return { weeks: 0, days: 0, isPast: true };
        }

        const daysTotal = Math.ceil(difference / (1000 * 60 * 60 * 24));
        const weeks = Math.floor(daysTotal / 7);
        const days = daysTotal % 7;

        return { weeks, days, isPast: false };
    };

    const { weeks, days, isPast } = calculateTimeLeft();

    return (
        <div id="race-countdown-card" className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 flex flex-row justify-between items-center h-full border-l-4 border-blue-500">
            <div className="flex flex-row items-baseline gap-3">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {race.name}
                </h2>
                <div className="text-sm text-gray-400 dark:text-gray-500">
                    {parseRaceDate(race.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
            </div>

            <div>
                {isPast ? (
                    <div className="text-xl font-semibold text-gray-500 dark:text-gray-400">
                        Race Completed
                    </div>
                ) : (
                    <div className="flex items-baseline space-x-2">
                        <span className="text-4xl font-extrabold text-blue-600 dark:text-blue-400">
                            {weeks}
                        </span>
                        <span className="text-gray-500 dark:text-gray-400 font-medium mr-4">
                            weeks
                        </span>
                        <span className="text-4xl font-extrabold text-blue-600 dark:text-blue-400">
                            {days}
                        </span>
                        <span className="text-gray-500 dark:text-gray-400 font-medium">
                            days
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
}
