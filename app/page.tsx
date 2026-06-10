"use client";
import { useState, useEffect } from "react";
import Price from "./components/Price";

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ hours: 5, minutes: 59, seconds: 59 });
  const [email, setEmail] = useState("");
  const [country, setCountry] = useState("other");
  const [announcementIndex, setAnnouncementIndex] = useState(0);

  const announcements = [
    "FREE SHIPPING ACROSS INDIA 🇮🇳",
    "WORLDWIDE DELIVERY IN 5-7 DAYS 🌍",
    "NEW COLLECTION NOW LIVE ✨",
    "HANDCRAFTED AUTHENTIC INDIAN FASHION 🪡",
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setAnnouncementIndex(prev => (prev + 1) % announcements.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const categories = [
    { name: "WOMEN", description: "Sarees, Lehengas & More", emoji: "👗", href: "/women" },
    { name: "MEN", description: "Kurtas, Sherwanis & More", emoji: "👔", href: "/men" },
    { name: "KIDS", description: "Ethnic & Casual Wear", emoji: "👶", href: "/kids" },
    { name: "JEWELLERY", description: "Artificial & Bridal", emoji: "💎", href: "/jewellery" },
    { name: "FOOTWEAR", description: "Handcrafted Indian Footwear", emoji: "👡", href: "/footwear" },
    { name: "CUSTOM GIFTS", description: "Personalised & Custom Gifts", emoji: "🎁", href: "/custom/gifts" },
    { name: "PARCELS", description: "Ship Anything, Anywhere", emoji: "📦", href: "/parcels" },
    { name: "SNACKS", description: "Authentic Indian Snacks", emoji: "🍱", href: "/snacks" },
  ];

  const deals = [
    { name: "Kanchipuram Silk Saree", price: 4999, original: 7999, discount: 37, category: "WOMEN" },
    { name: "Nehru Jacket", price: 2999, original: 4999, discount: 40, category: "MEN" },
    { name: "Kids Lehenga Set", price: 1999, original: 3499, discount: 42, category: "KIDS" },
    { name: "Kolhapuri Sandals", price: 1499, original: 2499, discount: 40, category: "FOOTWEAR" },
  ];

  const featured = [
    { name: "Uppada Silk Saree", price: 5999, original: 8999 },
    { name: "Royal Sherwani", price: 8999, original: 12999 },
    { name: "Oxidised Necklace Set", price: 1299, original: 1999 },
    { name: "Custom Photo Frame", price: 899, original: 1299 },
    { name: "Banarasi Saree", price: 6999, original: 9999 },
    { name: "Kurta Pyjama Set", price: 2499, original: 3999 },
    { name: "Kids Sherwani", price: 1999, original: 2999 },
    { name: "Jutti Mojari", price: 1199, original: 1999 },
  ];

  const reviews = [
    { name: "Priya S.", location: "Mumbai, India", rating: 5, text: "Absolutely stunning saree. The quality is beyond expectations. Will definitely order again!" },
    { name: "Sarah M.", location: "London, UK", rating: 5, text: "Ordered a custom kurta for my wedding. It arrived perfectly and looked amazing. Fast shipping too!" },
    { name: "Rahul K.", location: "Toronto, Canada", rating: 5, text: "Best Indian fashion store online. Authentic products and great customer service." },
  ];

  const discount = country === "india" ? 10 : 5;

  return (
    <main className="min-h-screen bg-black text-white pb-16 lg:pb-0">

      <div className="bg-white text-black text-center py-2 text-xs tracking-widest font-bold">
        {announcements[announcementIndex]}
      </div>

      <nav className="flex items-center justify-between px-6 md:px-10 py-5 border-b border-gray-800 relative">
        <div className="flex items-center gap-4">
          <button onClick={() => setMenuOpen(!menuOpen)} className="lg:hidden flex flex-col gap-1.5 p-1">
            <span className="block w-6 h-0.5 bg-white"></span>
            <span className="block w-6 h-0.5 bg-white"></span>
            <span className="block w-6 h-0.5 bg-white"></span>
          </button>
          <h1 className="text-xl md:text-2xl font-bold tracking-widest">JEROVIN</h1>
        </div>
        <div className="hidden lg:flex gap-6 text-xs tracking-widest text-gray-400">
          {categories.map((cat) => (
            <a key={cat.name} href={cat.href} className="hover:text-white transition">{cat.name}</a>
          ))}
        </div>
        <div className="flex items-center gap-4 text-xs tracking-widest text-gray-400">
          <a href="/search" className="hover:text-white transition">🔍</a>
          <a href="/cart" className="hover:text-white transition">🛒</a>
          <a href="/account" className="hover:text-white transition">👤</a>
        </div>
        {menuOpen && (
          <div className="fixed top-0 left-0 h-full w-72 bg-black border-r border-gray-800 z-50 flex flex-col p-6 overflow-y-auto">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-lg font-bold tracking-widest">MENU</h2>
              <button onClick={() => setMenuOpen(false)} className="text-gray-400 text-2xl">✕</button>
            </div>
            {categories.map((cat) => (
              <a key={cat.name} href={cat.href} className="border-b border-gray-800 py-4">
                <p className="font-bold text-white text-sm tracking-widest">{cat.emoji} {cat.name}</p>
                <p className="text-xs text-gray-500 mt-1">{cat.description}</p>
              </a>
            ))}
            <div className="flex gap-6 pt-6">
              <a href="/account" className="text-xs tracking-widest text-gray-400 hover:text-white transition">👤 ACCOUNT</a>
            </div>
          </div>
        )}
        {menuOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setMenuOpen(false)}></div>}
      </nav>

      <section className="relative w-full h-screen overflow-hidden">
        <video autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover">
          <source src="/hero.mp4" type="video/mp4"/>
        </video>
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-6">
          <p className="text-xs tracking-widest text-gray-300 mb-4">AUTHENTIC INDIAN FASHION — DELIVERED WORLDWIDE</p>
          <h2 className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight leading-tight mb-6">
            WEAR YOUR <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">IDENTITY</span>
          </h2>
          <p className="text-gray-300 text-base md:text-lg max-w-xl mb-8">Premium handcrafted Indian fashion, jewellery, footwear and personalised gifts delivered across the globe.</p>
          <div className="flex flex-col sm:flex-row gap-4 mb-10">
            <a href="/women" className="bg-white text-black px-10 py-4 text-sm tracking-widest font-bold hover:bg-gray-200 transition">SHOP NOW</a>
            <a href="/custom" className="border border-white text-white px-10 py-4 text-sm tracking-widest hover:bg-white hover:text-black transition">CUSTOM ORDER</a>
          </div>
          <div className="flex gap-8 text-center">
            <div><p className="text-2xl font-bold">500+</p><p className="text-xs text-gray-400 tracking-widest">PRODUCTS</p></div>
            <div><p className="text-2xl font-bold">50+</p><p className="text-xs text-gray-400 tracking-widest">COUNTRIES</p></div>
            <div><p className="text-2xl font-bold">10K+</p><p className="text-xs text-gray-400 tracking-widest">HAPPY CUSTOMERS</p></div>
          </div>
        </div>
      </section>

      <section className="px-6 md:px-10 py-16 border-t border-gray-800">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <p className="text-xs tracking-widest text-gray-500 mb-1">LIMITED TIME</p>
            <h3 className="text-2xl md:text-3xl font-bold tracking-widest">FLASH DEALS 🔥</h3>
          </div>
          <div className="flex gap-3">
            {[{ label: "HRS", value: timeLeft.hours }, { label: "MIN", value: timeLeft.minutes }, { label: "SEC", value: timeLeft.seconds }].map((t) => (
              <div key={t.label} className="bg-white text-black px-3 py-2 text-center min-w-14">
                <p className="text-xl font-bold">{String(t.value).padStart(2, "0")}</p>
                <p className="text-xs">{t.label}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {deals.map((deal, i) => (
            <a key={i} href={`/product/${i + 1}`} className="border border-gray-800 hover:border-gray-500 transition cursor-pointer group">
              <div className="bg-gray-900 h-48 flex items-center justify-center relative">
                <span className="text-gray-700 text-xs tracking-widest">IMAGE</span>
                <span className="absolute top-3 left-3 bg-red-600 text-white text-xs px-2 py-1 font-bold">-{deal.discount}%</span>
              </div>
              <div className="p-4">
                <p className="text-sm font-bold mb-2">{deal.name}</p>
                <div className="flex items-center justify-between mb-3">
                  <Price amountINR={deal.original} className="text-gray-500 line-through text-xs"/>
                  <Price amountINR={deal.price} className="text-white font-bold"/>
                </div>
                <button className="w-full border border-gray-700 py-2 text-xs tracking-widest text-gray-400 hover:border-white hover:text-white transition">ADD TO CART</button>
              </div>
            </a>
          ))}
        </div>
      </section>

      <section className="px-6 md:px-10 py-16 border-t border-gray-800">
        <p className="text-center text-xs tracking-widest text-gray-500 mb-2">EXPLORE</p>
        <h3 className="text-center text-2xl md:text-3xl font-bold tracking-widest mb-8">SHOP BY CATEGORY</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <a key={cat.name} href={cat.href} className="border border-gray-800 h-40 md:h-56 flex flex-col items-start justify-end p-4 md:p-6 hover:border-gray-400 transition cursor-pointer group">
              <span className="text-2xl mb-2">{cat.emoji}</span>
              <span className="text-sm md:text-base font-bold tracking-widest text-white mb-1">{cat.name}</span>
              <span className="text-xs tracking-widest text-gray-500 group-hover:text-gray-300 transition hidden sm:block">{cat.description} →</span>
            </a>
          ))}
        </div>
      </section>

      <section className="px-6 md:px-10 py-16 border-t border-gray-800">
        <p className="text-center text-xs tracking-widest text-gray-500 mb-2">HANDPICKED</p>
        <h3 className="text-center text-2xl md:text-3xl font-bold tracking-widest mb-8">FEATURED PRODUCTS ⭐</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {featured.map((product, i) => (
            <a key={i} href={`/product/${i + 1}`} className="border border-gray-800 hover:border-gray-500 transition cursor-pointer group">
              <div className="bg-gray-900 h-48 md:h-64 flex items-center justify-center">
                <span className="text-gray-700 text-xs tracking-widest">IMAGE</span>
              </div>
              <div className="p-4">
                <p className="text-sm font-bold mb-2">{product.name}</p>
                <div className="flex items-center justify-between">
                  <Price amountINR={product.original} className="text-gray-500 line-through text-xs"/>
                  <Price amountINR={product.price} className="text-white font-bold text-sm"/>
                </div>
              </div>
            </a>
          ))}
        </div>
      </section>

      <section className="px-6 md:px-10 py-16 border-t border-gray-800 bg-gray-900">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xs tracking-widest text-gray-500 mb-2">MADE FOR YOU</p>
          <h3 className="text-2xl md:text-4xl font-bold tracking-widest mb-4">CREATE YOUR OWN 🎨</h3>
          <p className="text-gray-400 mb-8 max-w-xl mx-auto">Choose your colour, size, design and fabric. We craft it exclusively for you and deliver worldwide.</p>
          <a href="/custom" className="inline-block bg-white text-black px-12 py-4 text-sm tracking-widest font-bold hover:bg-gray-200 transition">CUSTOMIZE NOW</a>
        </div>
      </section>

      <section className="px-6 md:px-10 py-16 border-t border-gray-800">
        <p className="text-center text-xs tracking-widest text-gray-500 mb-2">WHAT OUR CUSTOMERS SAY</p>
        <h3 className="text-center text-2xl md:text-3xl font-bold tracking-widest mb-8">REVIEWS ❤️</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.map((review, i) => (
            <div key={i} className="border border-gray-800 p-6">
              <p className="text-yellow-400 text-lg mb-3">{"★".repeat(review.rating)}</p>
              <p className="text-gray-300 text-sm leading-relaxed mb-4">{review.text}</p>
              <p className="text-white font-bold text-xs tracking-widest">{review.name}</p>
              <p className="text-gray-500 text-xs">{review.location}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="px-6 md:px-10 py-16 border-t border-gray-800 bg-gray-900">
        <div className="max-w-xl mx-auto text-center">
          <p className="text-xs tracking-widest text-gray-500 mb-2">EXCLUSIVE OFFER</p>
          <h3 className="text-2xl md:text-3xl font-bold tracking-widest mb-2">GET {discount}% OFF 🎉</h3>
          <p className="text-gray-400 mb-6">Subscribe and get {discount}% off your first order.</p>
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <select value={country} onChange={(e) => setCountry(e.target.value)} className="bg-black border border-gray-700 text-gray-400 px-4 py-3 text-xs tracking-widest">
              <option value="india">🇮🇳 India</option>
              <option value="other">🌍 Outside India</option>
            </select>
            <input type="email" placeholder="YOUR EMAIL ADDRESS" value={email} onChange={(e) => setEmail(e.target.value)} className="flex-1 bg-black border border-gray-700 text-white px-4 py-3 text-xs tracking-widest outline-none"/>
            <button className="bg-white text-black px-6 py-3 text-xs tracking-widest font-bold hover:bg-gray-200 transition">GET {discount}% OFF</button>
          </div>
          <p className="text-gray-600 text-xs">No spam. Unsubscribe anytime.</p>
        </div>
      </section>

      <footer className="border-t border-gray-800 px-6 md:px-10 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          <div>
            <h4 className="font-bold tracking-widest mb-4">JEROVIN</h4>
            <p className="text-xs text-gray-500 leading-relaxed">Authentic Indian fashion delivered worldwide. Handcrafted with love.</p>
          </div>
          <div>
            <h4 className="text-xs font-bold tracking-widest mb-4">CATEGORIES</h4>
            {categories.map((cat) => (
              <a key={cat.name} href={cat.href} className="block text-xs text-gray-500 hover:text-white transition mb-2">{cat.name}</a>
            ))}
          </div>
          <div>
            <h4 className="text-xs font-bold tracking-widest mb-4">HELP</h4>
            <a href="/returns" className="block text-xs text-gray-500 hover:text-white transition mb-2">Returns & Refunds</a>
            <a href="/track" className="block text-xs text-gray-500 hover:text-white transition mb-2">Track Your Order</a>
            <a href="/contact" className="block text-xs text-gray-500 hover:text-white transition mb-2">Contact Us</a>
            <a href="/faq" className="block text-xs text-gray-500 hover:text-white transition mb-2">FAQ</a>
          </div>
          <div>
            <h4 className="text-xs font-bold tracking-widest mb-4">LEGAL</h4>
            <a href="/privacy" className="block text-xs text-gray-500 hover:text-white transition mb-2">Privacy Policy</a>
            <a href="/terms" className="block text-xs text-gray-500 hover:text-white transition mb-2">Terms & Conditions</a>
            <a href="/returns" className="block text-xs text-gray-500 hover:text-white transition mb-2">Return Policy</a>
          </div>
        </div>
        <div className="border-t border-gray-800 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-gray-500">© 2026 JEROVIN. ALL RIGHTS RESERVED.</p>
          <div className="flex gap-4 text-xs text-gray-500">
            <span>💳 VISA</span>
            <span>💳 MASTERCARD</span>
            <span>📱 UPI</span>
            <span>💰 PAYPAL</span>
          </div>
        </div>
      </footer>

      <div className="fixed bottom-0 left-0 right-0 bg-black border-t border-gray-800 flex justify-around items-center py-3 lg:hidden z-30">
        <a href="/women" className="flex flex-col items-center gap-1"><span className="text-lg">👗</span><span className="text-xs tracking-widest text-gray-400">WOMEN</span></a>
        <a href="/men" className="flex flex-col items-center gap-1"><span className="text-lg">👔</span><span className="text-xs tracking-widest text-gray-400">MEN</span></a>
        <a href="/kids" className="flex flex-col items-center gap-1"><span className="text-lg">👶</span><span className="text-xs tracking-widest text-gray-400">KIDS</span></a>
        <a href="/cart" className="flex flex-col items-center gap-1"><span className="text-lg">🛒</span><span className="text-xs tracking-widest text-gray-400">CART</span></a>
        <button onClick={() => setMenuOpen(true)} className="flex flex-col items-center gap-1"><span className="text-lg">☰</span><span className="text-xs tracking-widest text-gray-400">MORE</span></button>
      </div>

    </main>
  );
}
