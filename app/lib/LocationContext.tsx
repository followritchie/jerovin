"use client";
import { createContext, useContext, ReactNode } from "react";

interface LocationData {
  currency: string;
  symbol: string;
  rates: Record<string, number>;
}

const LocationContext = createContext<LocationData | null>(null);

export function LocationProvider({ children, location }: { children: ReactNode; location: LocationData }) {
  return <LocationContext.Provider value={location}>{children}</LocationContext.Provider>;
}

export function useLocation() {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error("useLocation must be used within LocationProvider");
  }
  return context;
}