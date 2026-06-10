"use client";
import { useState, useEffect } from "react";
import Price from "../components/Price";
import Nav from "../components/Nav";

export default function CheckoutPage() {
  const [country, setCountry] = useState("");
  const [locationData, setLocationData] = useState<any>(null);
  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", phone: "",
    address1: "", address2: "", city: "", state: "", pincode: ""
  });

  const cartItems = [
    { id: 1, name: "Royal Silk Saree", price: 4999, quantity: 1, weight: 0.5 },
    { id: 2, name: "Nehru Jacket", price: 2999, quantity: 1, weight: 0.3 },
  ];

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalWeight = cartItems.reduce((sum, item) => sum + item.weight * item.quantity, 0);

  useEffect(() => {
    fetch("/api/location").then(r => r.json()).then(data => {
      setLocationData(data);
      setCountry(data.country || "");
    });
  }, []);

  const getShipping = () => {
    if (!country) return null;
    if (country.toLowerCase() === "india") return 0;
    if (totalWeight <= 0.25) return 2700;
    if (totalWeight <= 0.5) return 2750;
    if (totalWeight <= 1) return 2800;
    if (totalWeight <= 2) return 3500;
    if (totalWeight <= 3) return 3800;
    return 4200;
  };

  const getTax = () => {
    if (!country) return null;
    const c = country.toLowerCase();
    if (c === "india") return Math.round(subtotal * 0.18);
    if (c === "united states" || c === "usa") return Math.round(subtotal * 0.08);
    if (c === "canada") return Math.round(subtotal * 0.13);
    if (c === "united kingdom" || c === "uk") return Math.round(subtotal * 0.20);
    if (c === "australia") return Math.round(subtotal * 0.10);
    if (c === "uae") return Math.round(subtotal * 0.05);
    return Math.round(subtotal * 0.10);
  };

  const shipping = getShipping();
  const tax = getTax();
  const total = subtotal + (shipping || 0) + (tax || 0);

  const inputClass = "w-full bg-black border border-gray-700 text-white px-4 py-3 text-xs tracking-widest outline-none hover:border-gray-400 transition placeholder-gray-700";

  return (
    <main className="min-h-screen bg-black text-white pb-16 lg:pb-0">
      <Nav/>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 px-6 md:px-10 py-10">
        <div>
          <h1 className="text-3xl font-bold tracking-widest mb-8">CHECKOUT</h1>

          <p className="text-xs tracking-widest text-gray-500 mb-4">CONTACT INFORMATION</p>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <input placeholder="FIRST NAME" value={form.firstName} onChange={(e) => setForm({...form, firstName: e.target.value})} className={inputClass}/>
            <input placeholder="LAST NAME" value={form.lastName} onChange={(e) => setForm({...form, lastName: e.target.value})} className={inputClass}/>
          </div>
          <input placeholder="EMAIL ADDRESS" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} className={inputClass + " mb-3"}/>
          <input placeholder="PHONE NUMBER" value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value})} className={inputClass + " mb-8"}/>

          <p className="text-xs tracking-widest text-gray-500 mb-4">SHIPPING ADDRESS</p>
          <select value={country} onChange={(e) => setCountry(e.target.value)} className={inputClass + " mb-3 cursor-pointer"}>
            <option value="">SELECT COUNTRY</option>
            <option value="india">India</option>
            <option value="united states">United States</option>
            <option value="canada">Canada</option>
            <option value="united kingdom">United Kingdom</option>
            <option value="australia">Australia</option>
            <option value="singapore">Singapore</option>
            <option value="uae">UAE</option>
            <option value="other">Other</option>
          </select>
          <input placeholder="ADDRESS LINE 1" value={form.address1} onChange={(e) => setForm({...form, address1: e.target.value})} className={inputClass + " mb-3"}/>
          <input placeholder="ADDRESS LINE 2 (OPTIONAL)" value={form.address2} onChange={(e) => setForm({...form, address2: e.target.value})} className={inputClass + " mb-3"}/>
          <div className="grid grid-cols-3 gap-3 mb-8">
            <input placeholder="CITY" value={form.city} onChange={(e) => setForm({...form, city: e.target.value})} className={inputClass}/>
            <input placeholder="STATE" value={form.state} onChange={(e) => setForm({...form, state: e.target.value})} className={inputClass}/>
            <input placeholder="PINCODE / ZIP" value={form.pincode} onChange={(e) => setForm({...form, pincode: e.target.value})} className={inputClass}/>
          </div>

          <button className="w-full bg-white text-black py-4 text-xs tracking-widest font-bold hover:bg-gray-200 transition">
            PROCEED TO PAYMENT
          </button>
        </div>

        <div>
          <p className="text-xs tracking-widest text-gray-500 mb-6">ORDER SUMMARY</p>
          {cartItems.map(item => (
            <div key={item.id} className="flex justify-between mb-4 pb-4 border-b border-gray-800">
              <div>
                <p className="text-sm font-bold">{item.name}</p>
                <p className="text-xs text-gray-500">QTY: {item.quantity}</p>
              </div>
              <Price amountINR={item.price * item.quantity} className="text-sm font-bold"/>
            </div>
          ))}

          <div className="mt-6 flex flex-col gap-3">
            <div className="flex justify-between">
              <span className="text-xs text-gray-400 tracking-widest">SUBTOTAL</span>
              <Price amountINR={subtotal} className="text-sm"/>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-gray-400 tracking-widest">SHIPPING</span>
              <span className="text-sm" style={{color: shipping === null ? "#555" : shipping === 0 ? "#00ff00" : "#fff"}}>
                {shipping === null ? "SELECT COUNTRY" : shipping === 0 ? "FREE" : <Price amountINR={shipping} className="text-sm"/>}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-gray-400 tracking-widest">TAX</span>
              <span className="text-sm text-gray-500">
                {tax === null ? "SELECT COUNTRY" : <Price amountINR={tax} className="text-sm"/>}
              </span>
            </div>
            <div className="border-t border-gray-700 pt-4 flex justify-between">
              <span className="font-bold tracking-widest">TOTAL</span>
              {shipping !== null ? <Price amountINR={total} className="font-bold text-lg"/> : <span className="text-gray-500">—</span>}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
