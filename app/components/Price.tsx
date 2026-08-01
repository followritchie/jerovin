"use client";
import { useState, useEffect } from "react";
interface PriceProps { amountINR: number|string; className?: string; strikethrough?: boolean; }
function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? decodeURIComponent(match[2]) : null;
}
function setCookie(name: string, value: string, hours: number) {
  const expires = new Date(Date.now() + hours * 3600000).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)};expires=${expires};path=/`;
}
const CURRENCY_SYMBOLS: Record<string, string> = {
  USD:"$",CAD:"$",AUD:"$",NZD:"$",SGD:"$",HKD:"$",GBP:"£",EUR:"€",INR:"₹",
  JPY:"¥",CNY:"¥",CHF:"CHF ",SEK:"kr",NOK:"kr",DKK:"kr",MXN:"$",BRL:"R$",
  ARS:"$",COP:"$",ZAR:"R",NGN:"₦",KES:"KSh",AED:"AED ",SAR:"SR",QAR:"QR",
  KWD:"KD",THB:"฿",MYR:"RM",IDR:"Rp",PHP:"₱",PKR:"Rs",BDT:"৳",LKR:"Rs",
  TRY:"₺",ILS:"₪",PLN:"zł",KRW:"₩",
};
export default function Price({ amountINR, className = "", strikethrough = false }: PriceProps) {
  const amount = parseFloat(String(amountINR)) || 0;
  const [display, setDisplay] = useState<string>("");
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const cached = getCookie("jerovin_loc");
    if (cached) {
      try {
        const loc = JSON.parse(cached);
        const converted = (amount * loc.rate).toFixed(2);
        setDisplay(`${loc.symbol}${parseFloat(converted).toLocaleString("en",{minimumFractionDigits:2,maximumFractionDigits:2})}`);
        setReady(true); return;
      } catch {}
    }
    fetch("/api/location").then(r=>r.json()).then(data=>{
      const symbol = CURRENCY_SYMBOLS[data.currency]||data.symbol||"$";
      const rate = data.rates?.[data.currency]||1;
      const loc = {symbol,rate};
      setCookie("jerovin_loc",JSON.stringify(loc),24);
      const converted = (amount * rate).toFixed(2);
      setDisplay(`${symbol}${parseFloat(converted).toLocaleString("en",{minimumFractionDigits:2,maximumFractionDigits:2})}`);
      setReady(true);
    }).catch(()=>{ setDisplay(`₹${amount.toFixed(2)}`); setReady(true); });
  },[amount]);
  return (
    <span className={className} style={{opacity:ready?1:0,transition:"opacity 0.15s",textDecoration:strikethrough?"line-through":"none",color:strikethrough?"#6b7280":undefined}}>
      {display||`₹${amount.toFixed(2)}`}
    </span>
  );
}
