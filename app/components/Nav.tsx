"use client";
import { useState, useEffect, useRef } from "react";
import { ShoppingBag, User, Menu, X, Heart, ChevronDown, Search } from "lucide-react";
import { getCart } from "../lib/store";

const NAV_CATS = [
  { name: "WOMEN", sub: [
    { group: "SAREES", items: [
      { name: "Designer Sarees", href: "/women/sarees/designer" },
      { name: "Uppada Silk Sarees", href: "/women/sarees/uppada" },
      { name: "Kanjivaram Silk Sarees", href: "/women/sarees/kanjivaram" },
    ]},
    { group: "", items: [
      { name: "Lehengas", href: "/women/lehengas" },
      { name: "Blouses", href: "/women/blouses" },
      { name: "Kurta Sets", href: "/women/kurta-sets" },
    ]},
  ]},
  { name: "MEN", sub: [
    { group: "", items: [
      { name: "Sherwanis", href: "/men/sherwanis" },
      { name: "Kurtas", href: "/men/kurtas" },
      { name: "Blazers", href: "/men/blazers" },
      { name: "Indo Western", href: "/men/indo-western" },
    ]},
  ]},
  { name: "KIDS", sub: [
    { group: "", items: [
      { name: "Boys", href: "/kids/boys" },
      { name: "Girls", href: "/kids/girls" },
    ]},
  ]},
  { name: "JEWELLERY", sub: [
    { group: "", items: [
      { name: "Rings", href: "/jewellery/rings" },
      { name: "Earrings", href: "/jewellery/earrings" },
      { name: "Pendants", href: "/jewellery/pendants" },
      { name: "Clips", href: "/jewellery/clips" },
    ]},
  ]},
  { name: "FOOTWEAR", href: "/footwear", sub: [] },
  { name: "CUSTOM GIFTS", href: "/gifts", sub: [] },
  { name: "PARCELS", href: "/parcels", sub: [] },
  { name: "SNACKS", href: "/snacks", sub: [] },
  { name: "HANDICRAFTS", href: "/handicrafts", sub: [] },
];

export default function Nav() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState<string|null>(null);
  const [cartCount, setCartCount] = useState(0);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const update = () => {
      const cart = getCart();
      setCartCount(cart.reduce((sum: number, item: any) => sum + item.quantity, 0));
    };
    update();
    window.addEventListener("cartUpdated", update);
    return () => window.removeEventListener("cartUpdated", update);
  }, []);

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);

  const handleSearch = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery.trim())}`;
    }
    if (e.key === "Escape") { setSearchOpen(false); setSearchQuery(""); }
  };

  return (
    <>
      <nav className="flex items-center justify-between px-6 md:px-10 py-4 border-b border-gray-800 bg-black sticky top-0 z-40">
        {/* Logo */}
        <div className="flex items-center gap-4">
          <button onClick={() => setMenuOpen(true)} className="lg:hidden p-1">
            <Menu size={20} color="white"/>
          </button>
          <a href="/" className="text-xl md:text-2xl font-bold tracking-widest text-white">JEROVIN</a>
        </div>

        {/* Desktop nav */}
        <div className="hidden lg:flex gap-6 text-xs tracking-widest text-gray-400">
          {NAV_CATS.map((cat) => (
            <div key={cat.name} className="relative group">
              {cat.sub && cat.sub.length > 0 ? (
                <span className="hover:text-white transition flex items-center gap-1 py-2 cursor-default select-none">
                  {cat.name}
                  <ChevronDown size={10} className="group-hover:rotate-180 transition-transform duration-200"/>
                </span>
              ) : (
                <a href={(cat as any).href} className="hover:text-white transition flex items-center gap-1 py-2">{cat.name}</a>
              )}
              {cat.sub && cat.sub.length > 0 && (
                <div className="absolute top-full left-0 bg-black border border-gray-800 py-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 shadow-2xl min-w-48">
                  {cat.sub.map((group, gi) => (
                    <div key={gi}>
                      {group.group && (
                        <div className="px-4 pt-2 pb-1 text-xs text-gray-600 tracking-widest font-bold">{group.group}</div>
                      )}
                      {group.items.map((item) => (
                        <a key={item.name} href={item.href} className="block px-4 py-2 text-xs text-gray-400 hover:text-white hover:bg-gray-900 tracking-widest transition whitespace-nowrap">
                          {group.group ? `  ${item.name}` : item.name}
                        </a>
                      ))}
                      {gi < cat.sub.length - 1 && group.group && <div className="border-t border-gray-800 my-2"/>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Right icons + inline search */}
        <div className="flex items-center gap-4">
          {searchOpen ? (
            <div className="flex items-center border border-gray-700 bg-black px-3 py-1.5 gap-2" style={{width:220}}>
              <Search size={14} color="#9ca3af" strokeWidth={1.5}/>
              <input
                ref={searchRef}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={handleSearch}
                placeholder="Search products..."
                className="bg-transparent text-white text-xs tracking-widest outline-none w-full placeholder-gray-600"
              />
              <button onClick={() => { setSearchOpen(false); setSearchQuery(""); }}>
                <X size={12} color="#9ca3af"/>
              </button>
            </div>
          ) : (
            <button onClick={() => setSearchOpen(true)} className="text-gray-400 hover:text-white transition">
              <Search size={18} strokeWidth={1.5}/>
            </button>
          )}
          <a href="/wishlist" className="text-gray-400 hover:text-white transition hidden md:block"><Heart size={18} strokeWidth={1.5}/></a>
          <a href="/cart" className="text-gray-400 hover:text-white transition relative">
            <ShoppingBag size={18} strokeWidth={1.5}/>
            {cartCount > 0 && <span className="absolute -top-2 -right-2 w-4 h-4 bg-white text-black text-xs rounded-full flex items-center justify-center font-bold">{cartCount}</span>}
          </a>
          <a href="/account" className="text-gray-400 hover:text-white transition"><User size={18} strokeWidth={1.5}/></a>
        </div>
      </nav>

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="fixed top-0 left-0 h-full w-72 bg-black border-r border-gray-800 z-50 flex flex-col overflow-y-auto">
          <div className="flex justify-between items-center p-6 border-b border-gray-800">
            <h2 className="text-lg font-bold tracking-widest">MENU</h2>
            <button onClick={() => setMenuOpen(false)}><X size={20} color="white"/></button>
          </div>
          {/* Mobile search */}
          <div className="flex items-center border-b border-gray-800 px-6 py-3 gap-2">
            <Search size={14} color="#9ca3af"/>
            <input
              placeholder="Search..."
              className="bg-transparent text-white text-xs tracking-widest outline-none flex-1 placeholder-gray-600"
              onKeyDown={e => { if (e.key === "Enter") { const v = (e.target as HTMLInputElement).value.trim(); if(v) window.location.href=`/search?q=${encodeURIComponent(v)}`; }}}
            />
          </div>
          {NAV_CATS.map((cat) => (
            <div key={cat.name} className="border-b border-gray-800">
              <div className="flex items-center justify-between">
                {cat.sub && cat.sub.length > 0 ? (
                  <span className="flex-1 py-4 px-6 text-sm tracking-widest text-white">{cat.name}</span>
                ) : (
                  <a href={(cat as any).href} onClick={() => setMenuOpen(false)} className="flex-1 py-4 px-6 text-sm tracking-widest text-white">{cat.name}</a>
                )}
                {cat.sub && cat.sub.length > 0 && (
                  <button onClick={() => setMobileExpanded(mobileExpanded === cat.name ? null : cat.name)} className="px-4 py-4 text-gray-500">
                    <ChevronDown size={14} className={`transition-transform ${mobileExpanded === cat.name ? "rotate-180" : ""}`}/>
                  </button>
                )}
              </div>
              {mobileExpanded === cat.name && cat.sub && cat.sub.length > 0 && (
                <div className="bg-gray-950 border-t border-gray-800 pb-2">
                  {cat.sub.map((group, gi) => (
                    <div key={gi}>
                      {group.group && <div className="px-8 pt-3 pb-1 text-xs text-gray-600 tracking-widest font-bold">{group.group}</div>}
                      {group.items.map(item => (
                        <a key={item.name} href={item.href} onClick={() => setMenuOpen(false)} className="block px-10 py-2.5 text-xs tracking-widest text-gray-400 hover:text-white transition">{item.name}</a>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
          <div className="flex flex-col gap-4 p-6 mt-2">
            <a href="/account" onClick={() => setMenuOpen(false)} className="text-xs tracking-widest text-gray-400 hover:text-white transition flex items-center gap-2"><User size={14}/> ACCOUNT</a>
            <a href="/wishlist" onClick={() => setMenuOpen(false)} className="text-xs tracking-widest text-gray-400 hover:text-white transition flex items-center gap-2"><Heart size={14}/> WISHLIST</a>
          </div>
        </div>
      )}
      {menuOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setMenuOpen(false)}/>}

      {/* Mobile bottom nav */}
      <div className="fixed bottom-0 left-0 right-0 bg-black border-t border-gray-800 flex justify-around items-center py-3 lg:hidden z-30">
        <a href="/" className="flex flex-col items-center gap-1">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          <span className="text-xs tracking-widest text-gray-400">HOME</span>
        </a>
        <button onClick={() => { setMenuOpen(false); setSearchOpen(true); }} className="flex flex-col items-center gap-1">
          <Search size={18} color="#9ca3af" strokeWidth={1.5}/>
          <span className="text-xs tracking-widest text-gray-400">SEARCH</span>
        </button>
        <a href="/cart" className="flex flex-col items-center gap-1 relative">
          <ShoppingBag size={18} color="#9ca3af" strokeWidth={1.5}/>
          {cartCount > 0 && <span className="absolute -top-1 right-3 w-3.5 h-3.5 bg-white text-black text-xs rounded-full flex items-center justify-center font-bold">{cartCount}</span>}
          <span className="text-xs tracking-widest text-gray-400">BAG</span>
        </a>
        <a href="/account" className="flex flex-col items-center gap-1"><User size={18} color="#9ca3af" strokeWidth={1.5}/><span className="text-xs tracking-widest text-gray-400">ACCOUNT</span></a>
        <button onClick={() => setMenuOpen(true)} className="flex flex-col items-center gap-1"><Menu size={18} color="#9ca3af" strokeWidth={1.5}/><span className="text-xs tracking-widest text-gray-400">MORE</span></button>
      </div>
    </>
  );
}
