export default function TermsPage() {
  return (
    <main className="min-h-screen bg-black text-white pb-16 lg:pb-0">
      <Nav/>
      <div className="max-w-3xl mx-auto px-6 py-16">
        <p className="text-xs tracking-widest text-gray-500 mb-2">LEGAL</p>
        <h1 className="text-3xl font-bold tracking-widest mb-12">TERMS & CONDITIONS</h1>
        <div className="flex flex-col gap-8 text-sm text-gray-400 leading-relaxed">
          <div>
            <h2 className="text-white font-bold tracking-widest mb-3">1. ACCEPTANCE OF TERMS</h2>
            <p>By accessing and using jerovin.com, you accept and agree to be bound by these Terms and Conditions. If you do not agree, please do not use our website.</p>
          </div>
          <div>
            <h2 className="text-white font-bold tracking-widest mb-3">2. PRODUCTS & PRICING</h2>
            <p>All prices are shown in your local currency based on your location. Prices are subject to change without notice. We reserve the right to refuse or cancel any order at our discretion.</p>
          </div>
          <div>
            <h2 className="text-white font-bold tracking-widest mb-3">3. PAYMENTS</h2>
            <p>We accept all major credit and debit cards, UPI, net banking (India), and international payment methods. All transactions are secured and encrypted.</p>
          </div>
          <div>
            <h2 className="text-white font-bold tracking-widest mb-3">4. SHIPPING</h2>
            <p>Shipping within India is free. International shipping rates are calculated at checkout based on weight and destination. Delivery times are estimates and not guaranteed.</p>
          </div>
          <div>
            <h2 className="text-white font-bold tracking-widest mb-3">5. CUSTOM PRODUCTS</h2>
            <p>Custom and personalised products are made to order and cannot be returned or refunded unless there is a manufacturing defect. Please ensure all custom details are correct before placing your order.</p>
          </div>
          <div>
            <h2 className="text-white font-bold tracking-widest mb-3">6. INTELLECTUAL PROPERTY</h2>
            <p>All content on jerovin.com including images, text, logos and design is the property of Jerovin and may not be used without written permission.</p>
          </div>
          <div>
            <h2 className="text-white font-bold tracking-widest mb-3">7. CONTACT</h2>
            <p>For any questions regarding these terms, contact us at legal@jerovin.com</p>
          </div>
        </div>
      </div>
    </main>
  );
}
