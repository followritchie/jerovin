import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch("https://freeipapi.com/api/json", {
      headers: { "Accept": "application/json" }
    });
    const data = await res.json();
    const currencyCode = data.currencies?.[0] || "USD";

    const symbols: Record<string, string> = {
      INR: "₹", USD: "$", CAD: "CA$", GBP: "£", EUR: "€",
      AUD: "A$", SGD: "S$", AED: "AED ", PKR: "Rs", BDT: "৳",
      MYR: "RM", THB: "฿", JPY: "¥", CNY: "¥", ZAR: "R",
      NGN: "₦", NZD: "NZ$", CHF: "CHF ", MXN: "MX$", BRL: "R$",
      PHP: "₱", IDR: "Rp", KRW: "₩", SAR: "SR", QAR: "QR",
      KWD: "KD", TRY: "₺", ILS: "₪", PLN: "zł",
    };

    const rateRes = await fetch("https://open.er-api.com/v6/latest/INR");
    const rateData = await rateRes.json();

    return NextResponse.json({
      country: data.countryName,
      countryCode: data.countryCode,
      currency: currencyCode,
      symbol: symbols[currencyCode] || currencyCode + " ",
      rates: rateData.rates,
    });
  } catch {
    return NextResponse.json({
      country: "United States",
      countryCode: "US",
      currency: "USD",
      symbol: "$",
      rates: { USD: 0.012 },
    });
  }
}
