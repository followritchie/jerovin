"use client";
import { useState, useEffect } from "react";
import { Heart, X, ShoppingBag } from "lucide-react";
import Nav from "../components/Nav";
import Price from "../components/Price";
import { getWishlist, toggleWishlist, addToCart } from "../lib/store";

export default function WishlistPage() {
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => { setItems(getWishlist()); }, []);

  const handleRemove = (item: any) => {
    toggleWishlist(item);
    setItems(getWishlist());
  };

  const handleAddToCart = (item: any) => {
    addToCart({ id: item.id, name: item.name, price: item.price, original: item.original, image: item.image, quantity: 1 });
    window.dispatchEvent(new Event("cartUpdated"));
    alert("Added to bag!");
  };

  return (
    <main className="min-h-screen bg-black text-white pb-16 lg:pb-0">
      <Nav/>
      <div className="px-6 md:px-10 py-10">
        <div className="flex justify-between items-end mb-10">
          <h1 className="text-3xl md:text-5xl font-bold tracking-widest">WISHLIST</h1>
          <p className="text-xs tracking-widest text-gray-500">{items.length} ITEMS</p>
        </div>
        {items.length === 0 ? (
          <div className="text-center py-20 border border-gray-800">
            <Heart size={40} color="#374151" strokeWidth={1} style={{margin:"0 auto"}}/>
            <p className="text-gray-500 mt-4 mb-6 tracking-widest text-sm">YOUR WISHLIST IS EMPTY</p>
            <a href="/" className="text-white text-xs tracking-widest border border-gray-600 px-8 py-3 hover:border-white transition">CONTINUE SHOPPING</a>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {items.map((item) => (
              <div key={item.id} className="group">
                <div className="relative mb-3" style={{aspectRatio:"3/4"}}>
                  <a href={"/product/" + item.id}>
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover"/>
                  </a>
                  <button onClick={() => handleRemove(item)} className="absolute top-3 right-3 w-8 h-8 bg-white bg-opacity-90 rounded-full flex items-center justify-center">
                    <X size={14} color="#000"/>
                  </button>
                </div>
                <p className="text-sm font-bold tracking-widest mb-1">{item.name}</p>
                <div className="flex items-center gap-3 mb-3">
                  <Price amountINR={item.original} className="text-xs text-gray-500" strikethrough={true}/>
                  <Price amountINR={item.price} className="text-sm font-bold"/>
                </div>
                <button onClick={() => handleAddToCart(item)} className="w-full py-2 text-xs tracking-widest border border-gray-700 text-gray-400 hover:border-white hover:text-white transition flex items-center justify-center gap-2">
                  <ShoppingBag size={12}/> ADD TO BAG
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
