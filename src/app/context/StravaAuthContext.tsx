"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface StravaAuthContextType {
  isAuthenticated: boolean;
  setIsAuthenticated: (value: boolean) => void;
  checkAuth: () => void;
}

const StravaAuthContext = createContext<StravaAuthContextType | undefined>(undefined);

export function StravaAuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const checkAuth = () => {
    // Check if user has tokens in localStorage or session
    const hasTokens = typeof window !== 'undefined' && 
      (localStorage.getItem('strava_authenticated') === 'true');
    setIsAuthenticated(hasTokens);
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <StravaAuthContext.Provider value={{ isAuthenticated, setIsAuthenticated, checkAuth }}>
      {children}
    </StravaAuthContext.Provider>
  );
}

export function useStravaAuth() {
  const context = useContext(StravaAuthContext);
  if (context === undefined) {
    throw new Error('useStravaAuth must be used within a StravaAuthProvider');
  }
  return context;
}
