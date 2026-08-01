import Nav from "../components/Nav";

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-black text-white pb-16 lg:pb-0">
      <Nav/>
      <div className="max-w-3xl mx-auto px-6 py-16">
        <p className="text-xs tracking-widest text-gray-500 mb-2">LEGAL</p>
        <h1 className="text-3xl font-bold tracking-widest mb-12">PRIVACY POLICY</h1>
        <div className="flex flex-col gap-8 text-sm text-gray-400 leading-relaxed">
          <div>
            <h2 className="text-white font-bold tracking-widest mb-3">1. INFORMATION WE COLLECT</h2>
            <p>We collect information you provide directly to us, including name, email address, phone number, shipping address, and payment information when you make a purchase.</p>
          </div>
          <div>
            <h2 className="text-white font-bold tracking-widest mb-3">2. HOW WE USE YOUR INFORMATION</h2>
            <p>We use the information we collect to process orders, send order confirmations and updates, provide customer support, send marketing communications (with your consent), and improve our services.</p>
          </div>
          <div>
            <h2 className="text-white font-bold tracking-widest mb-3">3. DATA SECURITY</h2>
            <p>All payment information is fully encrypted. We use industry-standard security measures to protect your personal information. We never store your complete card details on our servers.</p>
          </div>
          <div>
            <h2 className="text-white font-bold tracking-widest mb-3">4. DATA SHARING</h2>
            <p>We never sell your personal data to third parties. We may share your information with trusted service providers who assist us in operating our website and conducting our business, subject to strict confidentiality agreements.</p>
          </div>
          <div>
            <h2 className="text-white font-bold tracking-widest mb-3">5. COOKIES</h2>
            <p>We use cookies to personalize your experience, analyze website traffic, and improve our services. You can control cookie settings through your browser settings.</p>
          </div>
          <div>
            <h2 className="text-white font-bold tracking-widest mb-3">6. YOUR RIGHTS</h2>
            <p>You have the right to access, correct, or delete your personal data at any time. To exercise these rights, contact us at privacy@jerovin.com.</p>
          </div>
          <div>
            <h2 className="text-white font-bold tracking-widest mb-3">7. CONTACT</h2>
            <p>For any privacy-related questions, contact us at privacy@jerovin.com</p>
          </div>
        </div>
      </div>
    </main>
  );
}
