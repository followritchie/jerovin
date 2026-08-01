"use client";
import { useEffect, useState } from "react";
import Nav from "../components/Nav";
import { Check, Package } from "lucide-react";
import { getCart, saveCart } from "../lib/store";

export default function OrderConfirmedPage() {
  const [orderNumber, setOrderNumber] = useState("");
  useEffect(() => {
    const n = localStorage.getItem("jerovin_last_order") || "";
    setOrderNumber(n);
    saveCart([]);
    window.dispatchEvent(new Event("cartUpdated"));
  }, []);
  return (
    <main className="min-h-screen bg-black text-white pb-16 lg:pb-0">
      <Nav/>
      <div className="max-w-lg mx-auto px-6 py-20 text-center">
        <div className="w-20 h-20 rounded-full bg-green-900 flex items-center justify-center mx-auto mb-6">
          <Check size={40} color="#22c55e" strokeWidth={2.5}/>
        </div>
        <h1 className="text-2xl font-bold tracking-widest mb-3">ORDER CONFIRMED!</h1>
        <p className="text-gray-400 text-sm mb-2">Thank you for shopping with Jerovin</p>
        {orderNumber && <p className="text-xs text-gray-500 tracking-widest mb-8">Order: <span className="text-white font-bold">{orderNumber}</span></p>}
        <p className="text-xs text-gray-600 tracking-widest mb-10">You will receive a confirmation email shortly. Track your order from your account page.</p>
        <div className="flex flex-col gap-3">
          <a href="/account" className="w-full bg-white text-black py-4 text-xs tracking-widest font-bold hover:bg-gray-200 transition flex items-center justify-center gap-2"><Package size={14}/>VIEW MY ORDERS</a>
          <a href="/" className="w-full border border-gray-700 text-gray-400 py-4 text-xs tracking-widest hover:border-white hover:text-white transition">CONTINUE SHOPPING</a>
        </div>
      </div>
    </main>
  );
}
