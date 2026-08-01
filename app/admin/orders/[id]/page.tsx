"use client";
import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Truck, Package, MapPin, CreditCard, X, Check, Star, History } from "lucide-react";

const COURIERS = ["FedEx","DHL","UPS","Blue Dart","DTDC","Delhivery","Ekart","India Post","Aramex","XpressBees","Shadowfax","Dunzo","Porter","Amazon Logistics","Flipkart Logistics","TNT","Schenker","Kuehne+Nagel","Kerry Logistics","SF Express","J&T Express","Ninjavan"];
const USD = 0.012;
function fmt(n){return"₹"+(n||0).toLocaleString("en-IN");}
function fmtUSD(n){return"$"+((n||0)*USD).toFixed(2);}

export default function OrderDetailPage({ params }) {
  const { id } = use(params);
  const router = useRouter();
  const [order, setOrder] = useState(null);
  const [history, setHistory] = useState({orders:[],reviews:[]});
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [courier, setCourier] = useState("");
  const [trackingNum, setTrackingNum] = useState("");
  const [showShare, setShowShare] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  const [shareFields, setShareFields] = useState({
    orderNumber: true, firstName: false, lastName: false, email: false, phone: false,
    address: false, productName: true, size: true, color: true, measurements: true,
    instructions: true, images: true,
  });

  const getAddr = (o) => { try { return typeof o.shipping_address==="string"?JSON.parse(o.shipping_address):o.shipping_address||{}; } catch { return {}; } };

  const load = () => {
    setLoading(true);
    fetch("/api/orders?id="+id).then(r=>r.json()).then(d=>{
      setOrder(d);
      setCourier(d?.courier||"");
      setTrackingNum(d?.tracking_number||"");
      const addr = getAddr(d);
      if (addr.email) {
        fetch("/api/customer-history?email="+encodeURIComponent(addr.email)).then(r=>r.json()).then(setHistory).catch(()=>{});
      }
      setLoading(false);
    }).catch(()=>setLoading(false));
  };

  useEffect(()=>{ load(); },[id]);

  const updateStatus = async (status) => {
    await fetch("/api/orders",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({orderId:id,status})});
    setToast("Status updated to " + status.toUpperCase());
    setTimeout(()=>setToast(null),3000);
    load();
  };

  const saveTracking = async () => {
    if (!courier || !trackingNum) { setToast("Select courier and enter tracking number"); setTimeout(()=>setToast(null),3000); return; }
    await fetch("/api/orders",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({orderId:id,status:"shipped",trackingNumber:trackingNum,courier})});
    setToast("Tracking saved — customer can now track this order");
    setTimeout(()=>setToast(null),3000);
    load();
  };

  const toggleField = (key) => setShareFields(f=>({...f,[key]:!f[key]}));

  const buildShareText = () => {
    if (!order) return "";
    const addr = getAddr(order);
    let lines = [];
    if (shareFields.orderNumber) lines.push("Order Ref: " + order.order_number);
    if (shareFields.firstName || shareFields.lastName) {
      const name = [shareFields.firstName?addr.firstName:"", shareFields.lastName?addr.lastName:""].filter(Boolean).join(" ");
      if (name) lines.push("Name: " + name);
    }
    if (shareFields.email && addr.email) lines.push("Email: " + addr.email);
    if (shareFields.phone && addr.phone) lines.push("Phone: " + addr.phone);
    if (shareFields.address) lines.push("Address: " + [addr.address1,addr.city,addr.state,addr.country].filter(Boolean).join(", "));

    (order.items||[]).forEach((it) => {
      lines.push("");
      if (shareFields.productName) lines.push("Product: " + (it.name||it.product_id));
      if (shareFields.size && it.size) lines.push("Size: " + it.size);
      if (shareFields.color && it.color) lines.push("Colour: " + it.color);
      if (shareFields.measurements && it.custom_details) {
        const cd = typeof it.custom_details==="string"?JSON.parse(it.custom_details):it.custom_details;
        lines.push("Measurements: " + Object.entries(cd).map(([k,v])=>k+": "+v).join(", "));
      }
      if (shareFields.instructions && it.special_instructions) lines.push("Note: " + it.special_instructions);
      if (shareFields.images && it.reference_image_urls?.length) lines.push("Reference images: " + it.reference_image_urls.join(", "));
    });
    return lines.join("\n");
  };

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-500 text-xs tracking-widest">LOADING ORDER...</div>;
  if (!order) return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-500 text-xs tracking-widest">ORDER NOT FOUND</div>;

  const addr = getAddr(order);
  const totalINR = parseFloat(order.total_inr)||0;
  const pastOrders = history.orders.filter((o)=>String(o.id)!==String(id));

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {toast && <div className="fixed top-4 right-4 z-50 bg-green-600 text-white px-5 py-3 text-xs tracking-widest rounded shadow-lg flex items-center gap-2"><Check size={14}/>{toast}</div>}

      <div className="bg-white border-b border-gray-200 px-8 py-4 sticky top-0 z-10 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={()=>router.back()} className="text-xs text-gray-500 hover:text-gray-900 transition flex items-center gap-1"><ChevronLeft size={14}/> BACK</button>
          <span className="text-gray-300">|</span>
          <h1 className="text-base font-semibold tracking-tight">{order.order_number}</h1>
          <span className={`text-xs px-2 py-0.5 rounded font-bold ${order.status==="delivered"?"bg-green-100 text-green-700":order.status==="shipped"?"bg-blue-100 text-blue-700":order.status==="confirmed"?"bg-purple-100 text-purple-700":"bg-yellow-100 text-yellow-700"}`}>{(order.status||"pending").toUpperCase()}</span>
        </div>
        <p className="text-xs text-gray-400">{order.created_at?.slice(0,16).replace("T"," ")}</p>
      </div>

      <div className="max-w-7xl mx-auto p-8 grid grid-cols-4 gap-6">

        <div className="flex flex-col gap-6">
          <div className="bg-white border border-gray-100 rounded-2xl shadow-[0_1px_2px_rgba(0,0,0,0.04)] p-5">
            <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-3 flex items-center gap-2"><MapPin size={12}/>SHIPPING ADDRESS</p>
            <p className="text-sm font-bold">{addr.firstName} {addr.lastName}</p>
            <p className="text-xs text-gray-600 mt-1">{addr.address1}{addr.address2?", "+addr.address2:""}</p>
            <p className="text-xs text-gray-600">{addr.city}, {addr.state} {addr.pincode}</p>
            <p className="text-xs text-gray-600">{addr.country}</p>
            <div className="border-t border-gray-100 mt-3 pt-3">
              <p className="text-xs text-gray-600">{addr.email}</p>
              <p className="text-xs text-gray-600">{addr.phone}</p>
            </div>
          </div>

          <div className="bg-white border border-gray-100 rounded-2xl shadow-[0_1px_2px_rgba(0,0,0,0.04)] p-5">
            <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-3 flex items-center gap-2"><CreditCard size={12}/>PAYMENT</p>
            <p className="text-xs text-gray-600">Subtotal: {fmt(parseFloat(order.subtotal_inr)||0)}</p>
            <p className="text-xs text-gray-600">Shipping: {fmt(parseFloat(order.shipping_inr)||0)}</p>
            <p className="text-xs text-gray-600">Tax: {fmt(parseFloat(order.tax_inr)||0)}</p>
            <p className="text-sm font-bold mt-2">Total: {fmt(totalINR)} <span className="text-gray-400 font-normal">/ {fmtUSD(totalINR)}</span></p>
            <div className="border-t border-gray-100 mt-3 pt-3">
              <p className="text-xs text-gray-600">{order.payment_method?.toUpperCase()} — {order.payment_status?.toUpperCase()}</p>
              {order.payment_id && <p className="text-xs text-gray-400 truncate mt-1">ID: {order.payment_id}</p>}
            </div>
          </div>

          <div className="bg-white border border-gray-100 rounded-2xl shadow-[0_1px_2px_rgba(0,0,0,0.04)] p-5">
            <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-3">UPDATE ORDER STATUS</p>
            <div className="flex flex-col gap-2">
              {["pending","confirmed","shipped","delivered","cancelled","returned"].map(s=>(
                <button key={s} onClick={()=>updateStatus(s)} className={`text-xs tracking-widest py-2 px-3 rounded border transition text-left ${order.status===s?"bg-blue-50 border-sky-200 text-sky-700 bg-sky-50 font-bold":"border-gray-200 text-gray-600 hover:border-gray-400"}`}>{s.toUpperCase()}</button>
              ))}
            </div>
          </div>
        </div>

        <div className="col-span-2 flex flex-col gap-6">
          <div className="bg-white border border-gray-100 rounded-2xl shadow-[0_1px_2px_rgba(0,0,0,0.04)] p-5">
            <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-3 flex items-center gap-2"><Package size={12}/>PRODUCTS ORDERED</p>
            {order.items && order.items.length > 0 ? order.items.map((it, idx) => (
              <div key={idx} className="mb-4 pb-4 border-b border-gray-100 last:border-0 last:mb-0 last:pb-0">
                <div className="flex gap-3">
                  {it.image && <img src={it.image} alt="" className="w-16 h-16 object-cover rounded border border-gray-200"/>}
                  <div className="flex-1">
                    <p className="text-sm font-bold">{it.name || "Product #" + it.product_id}</p>
                    <p className="text-xs text-gray-500">Qty: {it.quantity} × {fmt(parseFloat(it.price_inr)||0)}</p>
                    {it.size && <p className="text-xs text-gray-600">Size: {it.size}</p>}
                    {it.color && (
                      <p className="text-xs text-gray-600 flex items-center gap-1.5">
                        Colour: <span className="inline-block w-3 h-3 rounded-full border border-gray-300" style={{background: it.color}}/> {it.color}
                      </p>
                    )}
                  </div>
                </div>
                {it.custom_details && (
                  <div className="mt-3 bg-purple-50 border border-purple-200 rounded p-3">
                    <p className="text-xs font-bold text-purple-700 mb-1">CUSTOM MEASUREMENTS</p>
                    {Object.entries(typeof it.custom_details === "string" ? JSON.parse(it.custom_details) : it.custom_details).map(([k,v]) => (
                      <p key={k} className="text-xs text-gray-700">{k}: <span className="font-bold">{String(v)}</span></p>
                    ))}
                  </div>
                )}
                {it.special_instructions && (
                  <div className="mt-3 bg-amber-50 border border-amber-200 rounded p-3">
                    <p className="text-xs font-bold text-amber-700 mb-1">SPECIAL INSTRUCTIONS FROM CUSTOMER</p>
                    <p className="text-xs text-gray-700">{it.special_instructions}</p>
                  </div>
                )}
                {it.reference_image_urls && it.reference_image_urls.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs font-bold text-gray-700 mb-2">REFERENCE IMAGES ({it.reference_image_urls.length})</p>
                    <div className="grid grid-cols-4 gap-2">
                      {it.reference_image_urls.map((url, i) => (
                        <a key={i} href={url} target="_blank" rel="noreferrer">
                          <img src={url} alt="" className="w-full aspect-square object-cover rounded border border-gray-200 hover:border-blue-400 transition"/>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )) : <p className="text-xs text-gray-400">No item details available</p>}
          </div>

          <button onClick={()=>setShowShare(true)} className="w-full bg-gray-900 text-white py-3 text-xs tracking-widest font-bold hover:bg-gray-700 transition rounded">
            SHARE PRODUCTION DETAILS WITH SELLER / DESIGNER
          </button>

          <div className="bg-white border border-gray-100 rounded-2xl shadow-[0_1px_2px_rgba(0,0,0,0.04)] p-5">
            <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-3 flex items-center gap-2"><Truck size={12}/>SHIPPING & TRACKING</p>
            {order.tracking_number ? (
              <div className="bg-blue-50 border border-blue-200 p-3 rounded mb-4">
                <p className="text-xs font-bold text-blue-700">{order.courier}</p>
                <p className="text-xs text-blue-600">{order.tracking_number}</p>
              </div>
            ) : <p className="text-xs text-gray-400 mb-4">No tracking added yet</p>}
            <p className="text-xs text-gray-500 mb-1.5">Courier</p>
            <select value={courier} onChange={e=>setCourier(e.target.value)} className="w-full bg-white border border-gray-200 text-gray-900 px-3 py-2.5 text-sm outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition rounded-lg mb-3 rounded">
              <option value="">SELECT COURIER</option>
              {COURIERS.map(c=><option key={c} value={c}>{c}</option>)}
            </select>
            <p className="text-xs text-gray-500 mb-1.5">Tracking Number</p>
            <input value={trackingNum} onChange={e=>setTrackingNum(e.target.value)} placeholder="Enter tracking number" className="w-full bg-white border border-gray-200 text-gray-900 px-3 py-2.5 text-sm outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition rounded-lg mb-3 rounded"/>
            <button onClick={saveTracking} className="w-full bg-gray-900 text-white py-2.5 text-sm font-medium hover:bg-gray-800 transition flex items-center justify-center gap-2 rounded-xl">
              <Truck size={12}/>SAVE & MARK SHIPPED
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="bg-white border border-gray-100 rounded-2xl shadow-[0_1px_2px_rgba(0,0,0,0.04)] p-5">
            <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-3 flex items-center gap-2"><History size={12}/>CUSTOMER ORDER HISTORY</p>
            {pastOrders.length === 0 ? (
              <p className="text-xs text-gray-400">No previous orders</p>
            ) : pastOrders.map((o)=>(
              <a key={o.id} href={"/admin/orders/"+o.id} className="block mb-2 pb-2 border-b border-gray-100 last:border-0 hover:bg-gray-50 -mx-2 px-2 rounded transition">
                <p className="text-xs font-bold text-gray-900">{o.order_number}</p>
                <div className="flex justify-between">
                  <p className="text-xs text-gray-500">{o.created_at?.slice(0,10)}</p>
                  <p className="text-xs text-gray-600">{fmt(parseFloat(o.total_inr)||0)}</p>
                </div>
                <p className={`text-xs ${o.status==="delivered"?"text-green-600":"text-gray-500"}`}>{o.status?.toUpperCase()}</p>
              </a>
            ))}
          </div>

          <div className="bg-white border border-gray-100 rounded-2xl shadow-[0_1px_2px_rgba(0,0,0,0.04)] p-5">
            <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-3 flex items-center gap-2"><Star size={12}/>CUSTOMER RATINGS</p>
            {history.reviews.length === 0 ? (
              <p className="text-xs text-gray-400">No ratings given yet</p>
            ) : history.reviews.map((r, i)=>(
              <div key={i} className="mb-2 pb-2 border-b border-gray-100 last:border-0">
                <div className="flex gap-0.5 mb-1">
                  {[1,2,3,4,5].map(n=><Star key={n} size={12} fill={n<=r.rating?"#facc15":"none"} color={n<=r.rating?"#facc15":"#d1d5db"}/>)}
                </div>
                {r.comment && <p className="text-xs text-gray-600">{r.comment}</p>}
                <p className="text-xs text-gray-400 mt-0.5">{r.created_at?.slice(0,10)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showShare && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-6" onClick={()=>setShowShare(false)}>
          <div className="bg-white border border-gray-100 w-full max-w-2xl p-7 rounded-2xl shadow-xl max-h-screen overflow-y-auto" onClick={e=>e.stopPropagation()}>
            <div className="flex justify-between mb-4">
              <h3 className="text-base font-semibold tracking-tight">SHARE PRODUCTION DETAILS</h3>
              <button onClick={()=>setShowShare(false)}><X size={16} color="#111827"/></button>
            </div>
            <p className="text-xs text-gray-500 mb-4">Choose exactly what gets shared with the seller or designer.</p>

            <div className="grid grid-cols-2 gap-2 mb-4">
              {[
                ["orderNumber","Order Number"],["firstName","First Name"],["lastName","Last Name"],
                ["email","Email"],["phone","Phone"],["address","Address"],
                ["productName","Product Name"],["size","Size"],["color","Colour"],
                ["measurements","Measurements"],["instructions","Special Instructions"],["images","Reference Images"],
              ].map(([key,label])=>(
                <label key={key} className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer">
                  <input type="checkbox" checked={shareFields[key]} onChange={()=>toggleField(key)} className="w-3.5 h-3.5"/>
                  {label}
                </label>
              ))}
            </div>

            <div className="bg-gray-50 border border-gray-200 p-4 rounded text-xs text-gray-700 max-h-48 overflow-y-auto whitespace-pre-wrap">
              {buildShareText() || "Select at least one field to preview"}
            </div>

            <button onClick={()=>{
              navigator.clipboard.writeText(buildShareText());
              setShareCopied(true);
              setTimeout(()=>setShareCopied(false), 2000);
            }} className="w-full bg-gray-900 text-white py-3 text-sm font-medium hover:bg-gray-800 transition mt-4 rounded-xl">
              {shareCopied ? "✓ COPIED — PASTE TO SELLER/DESIGNER" : "COPY SHAREABLE DETAILS"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
