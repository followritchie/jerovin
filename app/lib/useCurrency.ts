"use client";
import { useState, useEffect } from "react";
import { getLocationAndCurrency, convertPrice, formatPrice } from "./currency";

export function useCurrency() {
  const [currency, setCurrency] = useState({ country: "", countryCode: "", currency: "INR", symbol: "₹" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getLocationAndCurrency().then((loc) => {
      setCurrency(loc);
      setLoading(false);
    });
  }, []);

  const format = async (priceINR: number): Promise<string> => {
    const converted = await convertPrice(priceINR, currency.currency);
    return formatPrice(converted, currency.symbol, currency.currency);
  };

  return { ...currency, loading, format };
}
