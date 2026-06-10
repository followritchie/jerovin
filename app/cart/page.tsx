"use client";
import { useState } from "react";
import Nav from "../components/Nav";
import Price from "../components/Price";
import Nav from "../components/Nav";

export default function CartPage() {
  const [cartItems, setCartItems] = useState([
    { id: 1, name: "Royal Silk Saree", category: "WOMEN", price: 4999, original: 6999, quantity: 1, size: "M", color: "#8B0000" },
    { id: 2, name: "Nehru Jacket", category: "MEN", price: 2999, original: 4999, quantity: 1, size: "L", color: "#000080" },
  ]);

  const removeItem = (id: number) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  const updateQuantity = (id: number, qty: number) => {
    if (qty <= 0) removeItem(id);
    else setCartItems(prev => prev.map(item => item.id === id ? {...item, quantity: qty} : item));
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <main className="min-h-screen bg-black text-white pb-16 lg:pb-0">
      <Nav/>

      <div className="px-6 md:px-10 py-10">
        <h1 className="text-4xl font-bold tracking-widest mb-10">CART</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2">
            {cartItems.length === 0 ? (
              <div className="text-center py-20 border border-gray-800">
                <p className="text-gray-500 mb-6 tracking-widest text-sm">YOUR CART IS EMPTY</p>
                <a href="/" className="text-white text-xs tracking-widest border border-gray-600 px-8 py-3 hover:border-white transition">CONTINUE SHOPPING</a>
              </div>
            ) : (
              cartItems.map((item) => (
                <div key={item.id} className="grid grid-cols-4 gap-6 border-b border-gray-800 py-6">
                  <div className="bg-gray-900 aspect-square flex items-center justify-center border border-gray-800">
                    <span className="text-gray-700 text-xs">IMAGE</span>
                  </div>
                  <div className="col-span-3 flex flex-col gap-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-bold tracking-widest mb-1">{item.name}</p>
                        <p className="text-xs text-gray-500">SIZE: {item.size}</p>
                      </div>
                      <div className="text-right">
                        <Price amountINR={item.original} className="text-gray-500 line-through text-xs block"/>
                        <Price amountINR={item.price * item.quantity} className="font-bold"/>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-8 h-8 border border-gray-700 text-white hover:border-white transition">-</button>
                        <input type="text" inputMode="numeric" value={item.quantity} onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 0)} onFocus={(e) => e.target.select()} className="w-12 text-center bg-black border border-gray-700 text-white text-sm py-1"/>
                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-8 h-8 border border-gray-700 text-white hover:border-white transition">+</button>
                      </div>
                      <button onClick={() => removeItem(item.id)} className="text-xs text-gray-500 tracking-widest hover:text-white transition">REMOVE</button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="bg-gray-900 border border-gray-800 p-6 h-fit">
            <p className="text-xs tracking-widest text-gray-500 mb-6">ORDER SUMMARY</p>
            <div className="flex justify-between mb-4">
              <span className="text-xs text-gray-400 tracking-widest">SUBTOTAL</span>
              <Price amountINR={subtotal} className="text-sm font-bold"/>
            </div>
            <div className="flex justify-between mb-4">
              <span className="text-xs text-gray-400 tracking-widest">SHIPPING</span>
              <span className="text-xs text-gray-500">AT CHECKOUT</span>
            </div>
            <div className="flex justify-between mb-6">
              <span className="text-xs text-gray-400 tracking-widest">TAX</span>
              <span className="text-xs text-gray-500">AT CHECKOUT</span>
            </div>
            <div className="border-t border-gray-700 pt-6 mb-6 flex justify-between">
              <span className="font-bold tracking-widest">SUBTOTAL</span>
              <Price amountINR={subtotal} className="font-bold"/>
            </div>
            <a href="/checkout" className="block w-full bg-white text-black py-4 text-xs tracking-widest font-bold text-center hover:bg-gray-200 transition mb-3">PROCEED TO CHECKOUT</a>
            <a href="/" className="block w-full border border-gray-600 text-white py-4 text-xs tracking-widest text-center hover:border-white transition">CONTINUE SHOPPING</a>
          </div>
        </div>
      </div>
    </main>
  );
}
