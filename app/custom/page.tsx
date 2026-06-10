"use client";

export default function CustomPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <nav className="flex items-center justify-between px-6 md:px-10 py-5 border-b border-gray-800">
        <a href="/" className="text-xl md:text-2xl font-bold tracking-widest text-white no-underline">JEROVIN</a>
        <div className="flex gap-4 text-xs tracking-widest text-gray-400">
          <a href="/cart" className="hover:text-white transition">CART</a>
          <a href="/account" className="hover:text-white transition">ACCOUNT</a>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-20 text-center">
        <p className="text-xs tracking-widest text-gray-500 mb-4">MADE FOR YOU</p>
        <h1 className="text-4xl md:text-6xl font-bold tracking-widest mb-6">CREATE YOUR OWN</h1>
        <p className="text-gray-400 text-lg max-w-xl mx-auto mb-16">Choose what you want to customise. Every piece is crafted exclusively for you.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <a href="/custom/clothing" className="border border-gray-700 p-12 hover:border-white transition group cursor-pointer">
            <p className="text-6xl mb-6">👗</p>
            <h2 className="text-2xl font-bold tracking-widest mb-3">CUSTOM CLOTHING</h2>
            <p className="text-gray-500 text-sm mb-6">Blouses, Lehengas, Sarees, Kurtas — any garment made to your exact specifications</p>
            <p className="text-xs tracking-widest text-gray-600 group-hover:text-white transition">CHOOSE COLOUR, SIZE, FABRIC →</p>
          </a>

          <a href="/custom/gifts" className="border border-gray-700 p-12 hover:border-white transition group cursor-pointer">
            <p className="text-6xl mb-6">🎁</p>
            <h2 className="text-2xl font-bold tracking-widest mb-3">CUSTOM GIFTS</h2>
            <p className="text-gray-500 text-sm mb-6">Photo frames, T-shirts, mugs, cushions — personalised gifts for every occasion</p>
            <p className="text-xs tracking-widest text-gray-600 group-hover:text-white transition">PERSONALISE YOUR GIFT →</p>
          </a>
        </div>
      </div>
    </main>
  );
}
