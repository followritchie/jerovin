export default function ReturnsPage() {
  return (
    <main className="min-h-screen bg-black text-white pb-16 lg:pb-0">
      <Nav/>
      <div className="max-w-3xl mx-auto px-6 py-16">
        <p className="text-xs tracking-widest text-gray-500 mb-2">POLICIES</p>
        <h1 className="text-3xl font-bold tracking-widest mb-12">RETURNS & REFUNDS</h1>

        <div className="flex flex-col gap-10">
          <div className="border border-gray-800 p-6">
            <h2 className="font-bold tracking-widest mb-4 text-lg">🇮🇳 INDIA CUSTOMERS</h2>
            <div className="flex flex-col gap-3 text-sm text-gray-400 leading-relaxed">
              <p>Returns are accepted within <span className="text-white font-bold">7 days</span> of delivery.</p>
              <p>An <span className="text-white font-bold">unboxing video</span> is mandatory as proof of the product condition at time of receipt.</p>
              <p>A written return request must be submitted within the 7 day window.</p>
              <p>Product must be unused, unworn and in original condition with all tags intact.</p>
              <p>Once approved, we will arrange a free return pickup from your address.</p>
              <p>Refund will be processed within <span className="text-white font-bold">7 business days</span> of receiving and verifying the returned product.</p>
            </div>
          </div>

          <div className="border border-gray-800 p-6">
            <h2 className="font-bold tracking-widest mb-4 text-lg">🌍 INTERNATIONAL CUSTOMERS</h2>
            <div className="flex flex-col gap-3 text-sm text-gray-400 leading-relaxed">
              <p>Returns are accepted <span className="text-white font-bold">only if the product is damaged</span> during transit or delivery.</p>
              <p>An <span className="text-white font-bold">unboxing video</span> clearly showing the damage at the time of receipt is mandatory. Without this video, return requests will not be accepted.</p>
              <p>The customer is responsible for all return shipping costs to our India address.</p>
              <p>If the product is not damaged, returns are the customer's responsibility and will not be accepted.</p>
              <p>Refund will be processed within <span className="text-white font-bold">7 business days</span> of receiving and verifying the returned product.</p>
            </div>
          </div>

          <div className="border border-red-900 p-6">
            <h2 className="font-bold tracking-widest mb-4 text-lg text-red-400">❌ NON-RETURNABLE ITEMS</h2>
            <div className="flex flex-col gap-3 text-sm text-gray-400 leading-relaxed">
              <p>All <span className="text-white font-bold">customised products</span> are non-returnable and non-refundable under any circumstances, as they are made specifically to your requirements.</p>
              <p>This includes custom blouses, custom gifts, personalised items, and any product made to order.</p>
            </div>
          </div>

          <div className="border border-gray-800 p-6">
            <h2 className="font-bold tracking-widest mb-4 text-lg">📞 HOW TO INITIATE A RETURN</h2>
            <div className="flex flex-col gap-3 text-sm text-gray-400 leading-relaxed">
              <p>1. Email us at <span className="text-white">returns@jerovin.com</span> with your order number and reason for return.</p>
              <p>2. Attach your unboxing video and photos of the product.</p>
              <p>3. Our team will review and respond within 48 hours.</p>
              <p>4. If approved, follow the instructions provided for returning the product.</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
