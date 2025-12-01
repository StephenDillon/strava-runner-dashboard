"use client";

import { useState, useEffect } from 'react';
import { Race } from '../types/race';

export function useRaces() {
    const [races, setRaces] = useState<Race[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const savedRaces = localStorage.getItem('races');
        if (savedRaces) {
            try {
                setRaces(JSON.parse(savedRaces));
            } catch (e) {
                console.error('Failed to parse races from localStorage', e);
            }
        }
        setIsLoaded(true);
    }, []);

    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem('races', JSON.stringify(races));
        }
    }, [races, isLoaded]);

    const addRace = (name: string, date: string) => {
        const newRace: Race = {
            id: crypto.randomUUID(),
            name,
            date,
        };
        setRaces((prev) => [...prev, newRace]);
    };

    const removeRace = (id: string) => {
        setRaces((prev) => prev.filter((race) => race.id !== id));
    };

    return { races, addRace, removeRace, isLoaded };
}
