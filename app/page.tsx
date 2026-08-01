"use client";
import { useState, useEffect } from "react";
import Nav from "./components/Nav";
import ProductCard from "./components/ProductCard";

export default function Home() {
  const [timeLeft, setTimeLeft] = useState({ hours: 5, minutes: 59, seconds: 59 });
  const [email, setEmail] = useState("");
  const [country, setCountry] = useState("other");
  const [announcementIndex, setAnnouncementIndex] = useState(0);

  const announcements = [
    "FREE SHIPPING ACROSS INDIA",
    "WORLDWIDE DELIVERY IN 5-7 DAYS",
    "NEW COLLECTION NOW LIVE",
    "HANDCRAFTED AUTHENTIC INDIAN FASHION",
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
    const interval = setInterval(() => setAnnouncementIndex(prev => (prev + 1) % announcements.length), 3000);
    return () => clearInterval(interval);
  }, []);

  const categories = [
    { name: "WOMEN", description: "Sarees and Lehengas", emoji: "👗", href: "/women", image: "https://res.cloudinary.com/dbl36lrco/image/upload/v1782577625/jerovin/products/xjzvc4agzodd3ufhyg9r.png" },
    { name: "MEN", description: "Kurtas and Sherwanis", emoji: "👔", href: "/men" },
    { name: "KIDS", description: "Ethnic and Casual", emoji: "👶", href: "/kids" },
    { name: "JEWELLERY", description: "Artificial and Bridal", emoji: "💎", href: "/jewellery" },
    { name: "FOOTWEAR", description: "Handcrafted Footwear", emoji: "👡", href: "/footwear" },
    { name: "CUSTOM GIFTS", description: "Personalised Gifts", emoji: "🎁", href: "/gifts" },
    { name: "PARCELS", description: "Ship Anywhere", emoji: "📦", href: "/parcels" },
    { name: "SNACKS", description: "Indian Snacks", emoji: "🍱", href: "/snacks" },
  ];

  const deals = [
    { id: 1, name: "Kanchipuram Silk Saree", price: 4999, original: 7999, images: ["https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600","https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600"] },
    { id: 2, name: "Nehru Jacket", price: 2999, original: 4999, images: ["https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600","https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600"] },
    { id: 3, name: "Kids Lehenga Set", price: 1999, original: 3499, images: ["https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?w=600","https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=600"] },
    { id: 4, name: "Kolhapuri Sandals", price: 1499, original: 2499, images: ["https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=600","https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600"] },
  ];

  const featured = [
    { id: 5, name: "Uppada Silk Saree", price: 5999, original: 8999, images: ["https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600","https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600"] },
    { id: 6, name: "Royal Sherwani", price: 8999, original: 12999, images: ["https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600","https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600"] },
    { id: 7, name: "Oxidised Necklace", price: 1299, original: 1999, images: ["https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600","https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600"] },
    { id: 8, name: "Custom Photo Frame", price: 899, original: 1299, images: ["https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=600","https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=600"] },
  ];

  const reviews = [
    { name: "Priya S.", location: "Mumbai, India", rating: 5, text: "Absolutely stunning saree. The quality is beyond expectations." },
    { name: "Sarah M.", location: "London, UK", rating: 5, text: "Ordered a custom kurta for my wedding. It arrived perfectly." },
    { name: "Rahul K.", location: "Toronto, Canada", rating: 5, text: "Best Indian fashion store online. Authentic products and great service." },
  ];

  const discount = country === "india" ? 10 : 5;
  const HERO_BG = "https://res.cloudinary.com/dbl36lrco/image/upload/v1781663249/jerovin/products/oqaooqxjgdu12r7sk1qn.png";

  return (
    <main className="min-h-screen bg-black text-white pb-16 lg:pb-0">
      <div className="bg-white text-black text-center py-2 text-xs tracking-widest font-bold">
        {announcements[announcementIndex]}
      </div>
      <Nav/>

      {/* HERO with background image */}
      <section className="relative w-full h-screen overflow-hidden">
        {/* Background image */}
        <img src={HERO_BG} alt="Hero" className="absolute inset-0 w-full h-full object-cover object-top"/>
        {/* Dark overlay so text is readable */}
        
        {/* Text content on top */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-6">
          <p className="text-xs tracking-widest text-gray-300 mb-4">AUTHENTIC INDIAN FASHION DELIVERED WORLDWIDE</p>
          <h2 className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight leading-tight mb-6">
            WEAR YOUR<br/>IDENTITY
          </h2>
          <p className="text-gray-200 text-base md:text-lg max-w-xl mb-8">
            Premium handcrafted Indian fashion delivered globally.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <a href="/women" className="bg-white text-black px-10 py-4 text-sm tracking-widest font-bold hover:bg-gray-200 transition">SHOP NOW</a>
            <a href="/custom" className="border border-white text-white px-10 py-4 text-sm tracking-widest hover:bg-white hover:text-black transition">CUSTOM ORDER</a>
          </div>
        </div>
      </section>

      <section className="px-6 md:px-10 py-16 border-t border-gray-800">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <p className="text-xs tracking-widest text-gray-500 mb-1">LIMITED TIME</p>
            <h3 className="text-2xl md:text-3xl font-bold tracking-widest">FLASH DEALS</h3>
          </div>
          <div className="flex gap-3">
            {[{label:"HRS",value:timeLeft.hours},{label:"MIN",value:timeLeft.minutes},{label:"SEC",value:timeLeft.seconds}].map((t) => (
              <div key={t.label} className="bg-white text-black px-3 py-2 text-center min-w-14">
                <p className="text-xl font-bold">{String(t.value).padStart(2,"0")}</p>
                <p className="text-xs">{t.label}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {deals.map((deal) => (<ProductCard key={deal.id} {...deal}/>))}
        </div>
      </section>

      <section className="px-6 md:px-10 py-16 border-t border-gray-800">
        <p className="text-center text-xs tracking-widest text-gray-500 mb-2">EXPLORE</p>
        <h3 className="text-center text-2xl md:text-3xl font-bold tracking-widest mb-8">SHOP BY CATEGORY</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories.map((cat) => (
              <a
              key={cat.name}
              href={cat.href}
              className="relative border border-gray-800 h-40 md:h-56 flex flex-col items-start justify-end p-4 md:p-6 hover:border-gray-400 transition cursor-pointer group overflow-hidden"
              style={(cat as any).image ? {
                backgroundImage: `linear-gradient(to top, rgba(0,0,0,0.75), rgba(0,0,0,0.15)), url(${(cat as any).image})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              } : {}}
            >
              {!(cat as any).image && <span className="text-2xl mb-2">{cat.emoji}</span>}
              <span className="text-sm md:text-base font-bold tracking-widest text-white mb-1">{cat.name}</span>
              <span className="text-xs tracking-widest text-gray-300 group-hover:text-gray-100 transition hidden sm:block">{cat.description}</span>
            </a>
          ))}
        </div>
      </section>

      <section className="px-6 md:px-10 py-16 border-t border-gray-800">
        <p className="text-center text-xs tracking-widest text-gray-500 mb-2">HANDPICKED</p>
        <h3 className="text-center text-2xl md:text-3xl font-bold tracking-widest mb-8">FEATURED PRODUCTS</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {featured.map((p) => (<ProductCard key={p.id} {...p}/>))}
        </div>
      </section>

      <section className="px-6 md:px-10 py-16 border-t border-gray-800 bg-gray-900">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xs tracking-widest text-gray-500 mb-2">MADE FOR YOU</p>
          <h3 className="text-2xl md:text-4xl font-bold tracking-widest mb-4">CREATE YOUR OWN</h3>
          <p className="text-gray-400 mb-8 max-w-xl mx-auto">Choose your colour, size, design and fabric. We craft it exclusively for you.</p>
          <a href="/custom" className="inline-block bg-white text-black px-12 py-4 text-sm tracking-widest font-bold hover:bg-gray-200 transition">CUSTOMIZE NOW</a>
        </div>
      </section>

      <section className="px-6 md:px-10 py-16 border-t border-gray-800">
        <p className="text-center text-xs tracking-widest text-gray-500 mb-2">CUSTOMER REVIEWS</p>
        <h3 className="text-center text-2xl md:text-3xl font-bold tracking-widest mb-8">WHAT THEY SAY</h3>
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
          <h3 className="text-2xl md:text-3xl font-bold tracking-widest mb-2">GET {discount}% OFF</h3>
          <p className="text-gray-400 mb-6">Subscribe and get {discount}% off your first order.</p>
          <div className="flex flex-col sm:flex-row gap-3">
            <select value={country} onChange={(e) => setCountry(e.target.value)} className="bg-black border border-gray-700 text-gray-400 px-4 py-3 text-xs tracking-widest">
              <option value="india">India</option>
              <option value="other">Outside India</option>
            </select>
            <input type="email" placeholder="YOUR EMAIL" value={email} onChange={(e) => setEmail(e.target.value)} className="flex-1 bg-black border border-gray-700 text-white px-4 py-3 text-xs tracking-widest outline-none"/>
            <button className="bg-white text-black px-6 py-3 text-xs tracking-widest font-bold hover:bg-gray-200 transition">GET {discount}% OFF</button>
          </div>
        </div>
      </section>

      <footer className="border-t border-gray-800 px-6 md:px-10 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          <div>
            <h4 className="font-bold tracking-widest mb-4">JEROVIN</h4>
            <p className="text-xs text-gray-500 leading-relaxed">Authentic Indian fashion delivered worldwide.</p>
          </div>
          <div>
            <h4 className="text-xs font-bold tracking-widest mb-4">CATEGORIES</h4>
            {categories.map((cat) => (
              <a key={cat.name} href={cat.href} className="block text-xs text-gray-500 hover:text-white transition mb-2">{cat.name}</a>
            ))}
          </div>
          <div>
            <h4 className="text-xs font-bold tracking-widest mb-4">HELP</h4>
            <a href="/returns" className="block text-xs text-gray-500 hover:text-white transition mb-2">Returns and Refunds</a>
            <a href="/track" className="block text-xs text-gray-500 hover:text-white transition mb-2">Track Order</a>
            <a href="/contact" className="block text-xs text-gray-500 hover:text-white transition mb-2">Contact Us</a>
            <a href="/faq" className="block text-xs text-gray-500 hover:text-white transition mb-2">FAQ</a>
          </div>
          <div>
            <h4 className="text-xs font-bold tracking-widest mb-4">LEGAL</h4>
            <a href="/privacy" className="block text-xs text-gray-500 hover:text-white transition mb-2">Privacy Policy</a>
            <a href="/terms" className="block text-xs text-gray-500 hover:text-white transition mb-2">Terms and Conditions</a>
          </div>
        </div>
        <div className="border-t border-gray-800 pt-6 text-center">
          <p className="text-xs text-gray-500">© 2026 JEROVIN. ALL RIGHTS RESERVED.</p>
        </div>
      </footer>
    </main>
  );
}
