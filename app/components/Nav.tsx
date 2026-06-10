"use client";
import { useState } from "react";
import { Search, ShoppingBag, User, Menu, X } from "lucide-react";

export default function Nav() {
  const [menuOpen, setMenuOpen] = useState(false);

  const categories = [
    { name: "WOMEN", href: "/women" },
    { name: "MEN", href: "/men" },
    { name: "KIDS", href: "/kids" },
    { name: "JEWELLERY", href: "/jewellery" },
    { name: "FOOTWEAR", href: "/footwear" },
    { name: "CUSTOM GIFTS", href: "/custom/gifts" },
    { name: "PARCELS", href: "/parcels" },
    { name: "SNACKS", href: "/snacks" },
  ];

  return (
    <>
      <nav className="flex items-center justify-between px-6 md:px-10 py-5 border-b border-gray-800 bg-black sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <button onClick={() => setMenuOpen(!menuOpen)} className="lg:hidden p-1" aria-label="Menu">
            <Menu size={20} color="white"/>
          </button>
          <a href="/" className="text-xl md:text-2xl font-bold tracking-widest text-white no-underline">JEROVIN</a>
        </div>
        <div className="hidden lg:flex gap-6 text-xs tracking-widest text-gray-400">
          {categories.map((cat) => (
            <a key={cat.name} href={cat.href} className="hover:text-white transition">{cat.name}</a>
          ))}
        </div>
        <div className="flex items-center gap-5">
          <a href="/search" className="text-gray-400 hover:text-white transition" aria-label="Search">
            <Search size={18}/>
          </a>
          <a href="/cart" className="text-gray-400 hover:text-white transition" aria-label="Cart">
            <ShoppingBag size={18}/>
          </a>
          <a href="/account" className="text-gray-400 hover:text-white transition" aria-label="Account">
            <User size={18}/>
          </a>
        </div>
      </nav>

      {menuOpen && (
        <div className="fixed top-0 left-0 h-full w-72 bg-black border-r border-gray-800 z-50 flex flex-col p-6 overflow-y-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-lg font-bold tracking-widest">MENU</h2>
            <button onClick={() => setMenuOpen(false)} aria-label="Close">
              <X size={20} color="white"/>
            </button>
          </div>
          {categories.map((cat) => (
            <a key={cat.name} href={cat.href} onClick={() => setMenuOpen(false)} className="border-b border-gray-800 py-4 text-sm tracking-widest text-white hover:text-gray-300 transition">
              {cat.name}
            </a>
          ))}
          <div className="flex gap-6 pt-6">
            <a href="/account" className="text-xs tracking-widest text-gray-400 hover:text-white transition flex items-center gap-2">
              <User size={14}/> ACCOUNT
            </a>
          </div>
        </div>
      )}
      {menuOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setMenuOpen(false)}></div>}

      <div className="fixed bottom-0 left-0 right-0 bg-black border-t border-gray-800 flex justify-around items-center py-3 lg:hidden z-30">
        <a href="/women" className="flex flex-col items-center gap-1">
          <span className="text-base">👗</span>
          <span className="text-xs tracking-widest text-gray-400">WOMEN</span>
        </a>
        <a href="/men" className="flex flex-col items-center gap-1">
          <span className="text-base">👔</span>
          <span className="text-xs tracking-widest text-gray-400">MEN</span>
        </a>
        <a href="/kids" className="flex flex-col items-center gap-1">
          <span className="text-base">👶</span>
          <span className="text-xs tracking-widest text-gray-400">KIDS</span>
        </a>
        <a href="/cart" className="flex flex-col items-center gap-1">
          <ShoppingBag size={18} color="#9ca3af"/>
          <span className="text-xs tracking-widest text-gray-400">CART</span>
        </a>
        <button onClick={() => setMenuOpen(true)} className="flex flex-col items-center gap-1">
          <Menu size={18} color="#9ca3af"/>
          <span className="text-xs tracking-widest text-gray-400">MORE</span>
        </button>
      </div>
    </>
  );
}
