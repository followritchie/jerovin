export async function getLocationAndCurrency() {
  try {
    const res = await fetch("https://freeipapi.com/api/json");
    const data = await res.json();
    const currencyCode = data.currencies?.[0] || "USD";
    const symbols: Record<string, string> = {
      INR: "₹", USD: "$", CAD: "CA$", GBP: "£", EUR: "€",
      AUD: "A$", SGD: "S$", AED: "AED ", PKR: "Rs", BDT: "৳",
      LKR: "Rs", MYR: "RM", THB: "฿", JPY: "¥", CNY: "¥",
      ZAR: "R", NGN: "₦", KES: "KSh", NZD: "NZ$", CHF: "CHF ",
      SEK: "kr", NOK: "kr", DKK: "kr", HKD: "HK$", MXN: "MX$",
      BRL: "R$", ARS: "AR$", COP: "CO$", PHP: "₱", IDR: "Rp",
      VND: "₫", KRW: "₩", TWD: "NT$", SAR: "SR", QAR: "QR",
      KWD: "KD", BHD: "BD", OMR: "OMR ", JOD: "JD", EGP: "E£",
      TRY: "₺", ILS: "₪", CZK: "Kč", PLN: "zł", HUF: "Ft",
    };
    return {
      country: data.countryName || "United States",
      countryCode: data.countryCode || "US",
      currency: currencyCode,
      symbol: symbols[currencyCode] || currencyCode + " ",
    };
  } catch {
    return {
      country: "United States",
      countryCode: "US",
      currency: "USD",
      symbol: "$",
    };
  }
}

export async function convertPrice(priceINR: number, targetCurrency: string): Promise<number> {
  try {
    const res = await fetch("https://open.er-api.com/v6/latest/INR");
    const data = await res.json();
    const rate = data.rates[targetCurrency] || 1;
    return Math.round(priceINR * rate);
  } catch {
    return priceINR;
  }
}

export function formatPrice(amount: number, symbol: string, currency: string): string {
  return `${symbol}${amount.toLocaleString()} ${currency}`;
}
