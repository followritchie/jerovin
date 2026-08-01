"use client";
import Nav from "../components/Nav";
import { useState } from "react";

export default function TrackPage() {
  const [orderNumber, setOrderNumber] = useState("");
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const trackOrder = async () => {
    if (!orderNumber) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/orders?orderNumber=${orderNumber}`);
      const data = await res.json();
      if (!data) setError("Order not found. Please check your order number.");
      else setOrder(data);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const steps = ["ORDER PLACED", "CONFIRMED", "PACKED", "SHIPPED", "OUT FOR DELIVERY", "DELIVERED"];

  const getStepIndex = (status: string) => {
    const map: Record<string, number> = {
      pending: 0, confirmed: 1, processing: 2, shipped: 3, out_for_delivery: 4, delivered: 5
    };
    return map[status] || 0;
  };

  return (
    <main className="min-h-screen bg-black text-white pb-16 lg:pb-0">
      <Nav/>

      <div className="max-w-2xl mx-auto px-6 py-16">
        <p className="text-xs tracking-widest text-gray-500 mb-2">DELIVERY</p>
        <h1 className="text-3xl font-bold tracking-widest mb-8">TRACK YOUR ORDER</h1>

        <div className="flex gap-3 mb-8">
          <input
            placeholder="ENTER YOUR ORDER NUMBER (e.g. JRV1234567890)"
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
            className="flex-1 bg-black border border-gray-700 text-white px-4 py-3 text-xs tracking-widest outline-none hover:border-gray-400 transition placeholder-gray-700"
          />
          <button onClick={trackOrder} disabled={loading} className="bg-white text-black px-6 py-3 text-xs tracking-widest font-bold hover:bg-gray-200 transition disabled:opacity-50">
            {loading ? "..." : "TRACK"}
          </button>
        </div>

        {error && <p className="text-red-500 text-xs tracking-widest mb-6">{error}</p>}

        {order && (
          <div>
            <div className="bg-gray-900 border border-gray-800 p-6 mb-6">
              <div className="flex justify-between mb-4">
                <div>
                  <p className="text-xs text-gray-500 tracking-widest mb-1">ORDER NUMBER</p>
                  <p className="font-bold tracking-widest">{order.order_number}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500 tracking-widest mb-1">TOTAL</p>
                  <p className="font-bold">₹{order.total_inr?.toLocaleString()}</p>
                </div>
              </div>
              {order.tracking_number && (
                <div className="border-t border-gray-800 pt-4 mt-4">
                  <p className="text-xs text-gray-500 tracking-widest mb-1">TRACKING NUMBER</p>
                  <p className="font-bold tracking-widest">{order.tracking_number}</p>
                  {order.courier && <p className="text-xs text-gray-500 mt-1">via {order.courier}</p>}
                </div>
              )}
            </div>

            <div className="flex justify-between mb-8">
              {steps.map((step, i) => {
                const currentStep = getStepIndex(order.status);
                const isComplete = i <= currentStep;
                const isActive = i === currentStep;
                return (
                  <div key={step} className="flex flex-col items-center gap-2 flex-1">
                    <div className={`w-4 h-4 rounded-full border-2 ${isActive ? "bg-white border-white" : isComplete ? "bg-white border-white" : "bg-black border-gray-700"}`}></div>
                    <p className={`text-xs tracking-widest text-center ${isComplete ? "text-white" : "text-gray-600"}`} style={{fontSize:"9px"}}>{step}</p>
                    {i < steps.length - 1 && (
                      <div className={`h-0.5 w-full mt-2 ${isComplete ? "bg-white" : "bg-gray-800"}`}></div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
