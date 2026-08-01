"use client";
import { useState } from "react";

interface PaymentButtonProps {
  amount: number;
  currency: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  orderId: string;
  onSuccess: (paymentId: string) => void;
  onFailure: (error: string) => void;
}

export default function PaymentButton({
  amount,
  currency,
  customerName,
  customerEmail,
  customerPhone,
  orderId,
  onSuccess,
  onFailure,
}: PaymentButtonProps) {
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/payment/razorpay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount,
          currency: "INR",
          receipt: orderId,
          notes: { customerName, customerEmail },
        }),
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      const options = {
        key: data.key,
        amount: data.amount,
        currency: data.currency,
        name: "JEROVIN",
        description: "Authentic Indian Fashion",
        image: "/logo.png",
        order_id: data.orderId,
        handler: async function(response: any) {
          try {
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
            if (verifyData.success) {
              onSuccess(response.razorpay_payment_id);
            } else {
              onFailure("Payment verification failed");
            }
          } catch {
            onFailure("Payment verification failed");
          }
        },
        prefill: {
          name: customerName,
          email: customerEmail,
          contact: customerPhone,
        },
        theme: { color: "#ffffff" },
        modal: {
          ondismiss: function() {
            setLoading(false);
          }
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on("payment.failed", function(response: any) {
        onFailure(response.error.description);
        setLoading(false);
      });
      rzp.open();
    } catch (error: any) {
      onFailure(error.message);
      setLoading(false);
    }
  };

  return (
    <>
      <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
      <button
        onClick={handlePayment}
        disabled={loading}
        className="w-full bg-white text-black py-4 text-xs tracking-widest font-bold hover:bg-gray-200 transition disabled:opacity-50"
      >
        {loading ? "PROCESSING..." : `PAY ${currency}${amount.toLocaleString()}`}
      </button>
    </>
  );
}
