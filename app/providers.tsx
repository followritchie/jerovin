"use client";
import { ReactNode } from "react";
import { LocationProvider } from "@/app/lib/LocationContext";
import { CartProvider } from "@/app/lib/CartContext";

interface ProvidersProps {
  children: ReactNode;
  location: any;
}

export function Providers({ children, location }: ProvidersProps) {
  return (
    <LocationProvider location={location}>
      <CartProvider>{children}</CartProvider>
    </LocationProvider>
  );
}