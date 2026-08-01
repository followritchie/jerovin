"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Nav from "../components/Nav";
import { getCart, CartItem } from "../lib/store";

const COUNTRIES = [
  "Afghanistan","Albania","Algeria","Andorra","Angola","Argentina","Armenia","Australia","Austria",
  "Azerbaijan","Bahamas","Bahrain","Bangladesh","Barbados","Belarus","Belgium","Belize","Benin",
  "Bhutan","Bolivia","Bosnia and Herzegovina","Botswana","Brazil","Brunei","Bulgaria","Cambodia",
  "Cameroon","Canada","Chile","China","Colombia","Costa Rica","Croatia","Cuba","Cyprus",
  "Czech Republic","Denmark","Dominican Republic","Ecuador","Egypt","El Salvador","Estonia",
  "Ethiopia","Fiji","Finland","France","Georgia","Germany","Ghana","Greece","Guatemala","Haiti",
  "Honduras","Hungary","Iceland","India","Indonesia","Iran","Iraq","Ireland","Israel","Italy",
  "Jamaica","Japan","Jordan","Kazakhstan","Kenya","Kuwait","Kyrgyzstan","Laos","Latvia","Lebanon",
  "Libya","Liechtenstein","Lithuania","Luxembourg","Madagascar","Malaysia","Maldives","Mali","Malta",
  "Mauritius","Mexico","Moldova","Monaco","Mongolia","Montenegro","Morocco","Mozambique","Myanmar",
  "Namibia","Nepal","Netherlands","New Zealand","Nicaragua","Nigeria","Norway","Oman","Pakistan",
  "Panama","Paraguay","Peru","Philippines","Poland","Portugal","Qatar","Romania","Russia","Rwanda",
  "Saudi Arabia","Senegal","Serbia","Singapore","Slovakia","Slovenia","Somalia","South Africa",
  "South Korea","Spain","Sri Lanka","Sudan","Sweden","Switzerland","Syria","Taiwan","Tanzania",
  "Thailand","Tunisia","Turkey","Uganda","Ukraine","United Arab Emirates","United Kingdom",
  "United States","Uruguay","Uzbekistan","Venezuela","Vietnam","Yemen","Zambia","Zimbabwe"
];

const TAX_RATES: Record<string, number> = {
  "india": 0.18, "united states": 0.08, "canada": 0.13,
  "united kingdom": 0.20, "australia": 0.10, "uae": 0.05,
  "united arab emirates": 0.05, "singapore": 0.09,
};

const CURRENCY_SYMBOLS: Record<string,string> = {
  USD:"$",CAD:"CA$",AUD:"A$",GBP:"£",EUR:"€",INR:"₹",SGD:"S$",
  AED:"AED ",SAR:"SR",JPY:"¥",CNY:"¥",CHF:"CHF ",NZD:"NZ$",
  MYR:"RM",THB:"฿",PHP:"₱",KRW:"₩",ZAR:"R",BRL:"R$",
};

function fmt(amount: number, symbol: string, rate: number) {
  const converted = amount * rate;
  return `${symbol}${converted.toLocaleString("en", {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
}

export default function CheckoutPage() {
  const router = useRouter();
  const [step, setStep] = useState<"address" | "payment">("address");
  const [orderId, setOrderId] = useState("");
  const [orderNumber, setOrderNumber] = useState("");
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [country, setCountry] = useState("India");
  const [localSymbol, setLocalSymbol] = useState("₹");
  const [localRate, setLocalRate] = useState(1);
  const [localCurrency, setLocalCurrency] = useState("INR");
  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", phone: "",
    address1: "", address2: "", city: "", state: "", pincode: ""
  });

  useEffect(() => {
    setCartItems(getCart());
    fetch("/api/location").then(r => r.json()).then(data => {
      if (data.country) {
        const found = COUNTRIES.find(c => c.toLowerCase() === data.country.toLowerCase());
        if (found) setCountry(found);
      }
      if (data.currency) {
        setLocalCurrency(data.currency);
        setLocalSymbol(CURRENCY_SYMBOLS[data.currency] || data.currency + " ");
        if (data.rates?.[data.currency]) setLocalRate(data.rates[data.currency]);
      }
    }).catch(() => {});
  }, []);

  const subtotalINR = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalWeight = cartItems.reduce((sum, item) => sum + (item.quantity * 0.5), 0);

  const getShippingINR = () => {
    if (country.toLowerCase() === "india") return 0;
    if (totalWeight <= 0.25) return 2700;
    if (totalWeight <= 0.5) return 2750;
    if (totalWeight <= 1) return 2800;
    if (totalWeight <= 2) return 3500;
    if (totalWeight <= 3) return 3800;
    return 4200;
  };

  const getTaxINR = () => {
    const rate = TAX_RATES[country.toLowerCase()] || 0.10;
    return Math.round(subtotalINR * rate);
  };

  const shippingINR = getShippingINR();
  const taxINR = getTaxINR();
  const totalINR = subtotalINR + shippingINR + taxINR;
  const isIndia = localCurrency === "INR";

  const handleAddressSubmit = async () => {
    if (!form.firstName || !form.email || !form.phone || !form.address1 || !form.city || !country) {
      setError("Please fill in all required fields"); return;
    }
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cartItems.map(item => {
            const customOrders = JSON.parse(localStorage.getItem("jerovin_custom_orders")||"{}");
            const customDetails = customOrders[item.id] || null;
            return { productId: item.id, quantity: item.quantity, price: item.price, size: item.size, color: item.color, customDetails: customDetails?.measurements || null, referenceImageUrls: customDetails?.referenceImageUrls || [], specialInstructions: customDetails?.specialInstructions || null };
          }),
          shippingAddress: { ...form, country },
          subtotal: subtotalINR, shipping: shippingINR, tax: taxINR, total: totalINR,
          currency: "INR", currencyRate: 1, paymentMethod: "razorpay",
        }),
      });
      const data = await res.json();
      if (data.error) { setError("Failed to create order: " + data.details); setLoading(false); return; }
      setOrderId(data.orderId.toString());
      setOrderNumber(data.orderNumber);
      localStorage.setItem("jerovin_last_order", data.orderNumber);
      setStep("payment");
    } catch { setError("Connection error. Please try again."); }
    finally { setLoading(false); }
  };

  const handlePayment = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/payment/razorpay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: totalINR, currency: "INR", receipt: orderNumber }),
      });
      const data = await res.json();
      if (data.error) { setError("Payment initiation failed"); setLoading(false); return; }
      const options = {
        key: data.key,
        amount: data.amount,
        currency: data.currency,
        name: "JEROVIN",
        description: "Authentic Indian Fashion",
        order_id: data.orderId,
        handler: async function(response: any) {
          const verifyRes = await fetch("/api/payment/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderId,
            }),
          });
          const verifyData = await verifyRes.json();
          if (verifyData.success) router.push("/order-confirmed");
          else setError("Payment verification failed.");
        },
        prefill: { name: form.firstName + " " + form.lastName, email: form.email, contact: form.phone },
        theme: { color: "#000000" },
        modal: { ondismiss: () => setLoading(false) }
      };
      const rzp = new (window as any).Razorpay(options);
      rzp.on("payment.failed", (response: any) => {
        setError("Payment failed: " + response.error.description);
        setLoading(false);
      });
      rzp.open();
    } catch { setError("Payment failed. Please try again."); setLoading(false); }
  };

  const inputClass = "w-full bg-black border border-gray-700 text-white px-4 py-3 text-xs tracking-widest outline-none focus:border-white transition placeholder-gray-600";

  return (
    <main className="min-h-screen bg-black text-white pb-16 lg:pb-0">
      <script src="https://checkout.razorpay.com/v1/checkout.js" async></script>
      <Nav/>
      <div className="max-w-6xl mx-auto px-6 md:px-10 py-10">
        <div className="flex items-center gap-2 mb-10 text-xs tracking-widest text-gray-500">
          <a href="/" className="hover:text-white">HOME</a><span>→</span>
          <a href="/cart" className="hover:text-white">BAG</a><span>→</span>
          <span className="text-white">CHECKOUT</span>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
          <div className="lg:col-span-3">
            <div className="flex items-center gap-6 mb-8">
              <div className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${step==="address"?"bg-white text-black":"bg-gray-800 text-gray-400"}`}>1</div>
                <span className="text-xs tracking-widest">ADDRESS</span>
              </div>
              <div className="flex-1 h-px bg-gray-800"/>
              <div className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${step==="payment"?"bg-white text-black":"bg-gray-800 text-gray-400"}`}>2</div>
                <span className="text-xs tracking-widest">PAYMENT</span>
              </div>
            </div>

            {step==="address" && (
              <div className="flex flex-col gap-4">
                <p className="text-xs tracking-widest text-gray-500">CONTACT INFORMATION</p>
                <div className="grid grid-cols-2 gap-3">
                  <input placeholder="FIRST NAME *" value={form.firstName} onChange={e=>setForm({...form,firstName:e.target.value})} className={inputClass}/>
                  <input placeholder="LAST NAME" value={form.lastName} onChange={e=>setForm({...form,lastName:e.target.value})} className={inputClass}/>
                </div>
                <input placeholder="EMAIL ADDRESS *" type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} className={inputClass}/>
                <input placeholder="PHONE NUMBER *" type="tel" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} className={inputClass}/>
                <p className="text-xs tracking-widest text-gray-500 mt-2">SHIPPING ADDRESS</p>
                <select value={country} onChange={e=>setCountry(e.target.value)} className={inputClass+" cursor-pointer"}>
                  <option value="">SELECT COUNTRY *</option>
                  {COUNTRIES.map(c=><option key={c} value={c}>{c}</option>)}
                </select>
                <input placeholder="ADDRESS LINE 1 *" value={form.address1} onChange={e=>setForm({...form,address1:e.target.value})} className={inputClass} autoComplete="address-line1"/>
                <input placeholder="ADDRESS LINE 2 (OPTIONAL)" value={form.address2} onChange={e=>setForm({...form,address2:e.target.value})} className={inputClass}/>
                <div className="grid grid-cols-3 gap-3">
                  <input placeholder="CITY *" value={form.city} onChange={e=>setForm({...form,city:e.target.value})} className={inputClass}/>
                  <input placeholder="STATE" value={form.state} onChange={e=>setForm({...form,state:e.target.value})} className={inputClass}/>
                  <input placeholder="PINCODE / ZIP" value={form.pincode} onChange={e=>setForm({...form,pincode:e.target.value})} className={inputClass}/>
                </div>
                {error && <p className="text-red-500 text-xs tracking-widest">{error}</p>}
                <button onClick={handleAddressSubmit} disabled={loading} className="w-full bg-white text-black py-4 text-xs tracking-widest font-bold hover:bg-gray-200 transition disabled:opacity-50 mt-2">
                  {loading ? "PLEASE WAIT..." : "CONTINUE TO PAYMENT"}
                </button>
              </div>
            )}

            {step==="payment" && (
              <div className="flex flex-col gap-6">
                <div className="bg-gray-900 border border-gray-800 p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-xs tracking-widest text-gray-500 mb-3">DELIVERING TO</p>
                      <p className="font-bold text-sm">{form.firstName} {form.lastName}</p>
                      <p className="text-xs text-gray-400 mt-1">{form.address1}{form.address2?", "+form.address2:""}</p>
                      <p className="text-xs text-gray-400">{form.city}{form.state?", "+form.state:""} {form.pincode}</p>
                      <p className="text-xs text-gray-400">{country}</p>
                      <p className="text-xs text-gray-400 mt-1">{form.email} | {form.phone}</p>
                    </div>
                    <button onClick={()=>setStep("address")} className="text-xs text-gray-500 hover:text-white tracking-widest">EDIT</button>
                  </div>
                </div>
                <div className="bg-gray-900 border border-gray-800 p-6">
                  <p className="text-xs tracking-widest text-gray-500 mb-4">PAYMENT METHOD</p>
                  <div className="border border-white p-4 flex items-center gap-3 mb-4">
                    <div className="w-4 h-4 rounded-full bg-white flex-shrink-0"/>
                    <div>
                      <p className="text-xs tracking-widest font-bold">RAZORPAY</p>
                      <p className="text-xs text-gray-500 mt-0.5">Cards, UPI, Net Banking, Wallets</p>
                    </div>
                  </div>

                  <p className="text-xs text-gray-600 tracking-widest mt-2">🔒 SECURED WITH 256-BIT SSL ENCRYPTION</p>
                </div>
                {error && <p className="text-red-500 text-xs tracking-widest">{error}</p>}
                <button onClick={handlePayment} disabled={loading} className="w-full bg-white text-black py-4 text-xs tracking-widest font-bold hover:bg-gray-200 transition disabled:opacity-50">
                  {loading ? "PROCESSING..." : `PAY ${fmt(totalINR, localSymbol, localRate)}`}
                </button>
</div>
            )}
          </div>

          <div className="lg:col-span-2">
            <div className="bg-gray-900 border border-gray-800 p-6 sticky top-24">
              <p className="text-xs tracking-widest text-gray-500 mb-6">ORDER SUMMARY ({cartItems.length} ITEMS)</p>
              <div className="flex flex-col gap-4 mb-6 max-h-64 overflow-y-auto">
                {cartItems.length===0 ? (
                  <p className="text-xs text-gray-600">No items. <a href="/" className="text-white underline">Shop now</a></p>
                ) : cartItems.map((item,i) => (
                  <div key={`${item.id}-${i}`} className="flex gap-3">
                    <img src={item.image} alt={item.name} className="w-14 object-cover flex-shrink-0" style={{height:"72px"}}/>
                    <div className="flex-1">
                      <p className="text-xs font-bold tracking-widest">{item.name}</p>
                      {item.size && <p className="text-xs text-gray-500 mt-0.5">SIZE: {item.size}</p>}
                      {item.color && <p className="text-xs text-gray-500">COLOUR: {item.color}</p>}
                      <p className="text-xs text-gray-500">QTY: {item.quantity}</p>
                    </div>
                    <span className="text-xs font-bold flex-shrink-0">{fmt(item.price * item.quantity, localSymbol, localRate)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-800 pt-4 flex flex-col gap-3">
                <div className="flex justify-between">
                  <span className="text-xs text-gray-400 tracking-widest">SUBTOTAL</span>
                  <span className="text-xs">{fmt(subtotalINR, localSymbol, localRate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-gray-400 tracking-widest">SHIPPING</span>
                  <span className="text-xs" style={{color:shippingINR===0?"#22c55e":"#fff"}}>
                    {shippingINR===0 ? "FREE" : fmt(shippingINR, localSymbol, localRate)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-gray-400 tracking-widest">TAX</span>
                  <span className="text-xs">{fmt(taxINR, localSymbol, localRate)}</span>
                </div>
                <div className="border-t border-gray-700 pt-3 flex justify-between">
                  <span className="text-sm font-bold tracking-widest">TOTAL</span>
                  <span className="text-sm font-bold">{fmt(totalINR, localSymbol, localRate)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
