"use client";
import { useState, useEffect } from "react";
import { X, ShoppingBag, ArrowRight, Tag } from "lucide-react";
import Nav from "../components/Nav";
import Price from "../components/Price";
import { getCart, removeFromCart, updateCartQuantity, CartItem } from "../lib/store";

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [coupon, setCoupon] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setCartItems(getCart());
    const handler = () => setCartItems(getCart());
    window.addEventListener("cartUpdated", handler);
    return () => window.removeEventListener("cartUpdated", handler);
  }, []);

  const handleRemove = (id: number, size?: string) => {
    removeFromCart(id, size);
    setCartItems(getCart());
  };

  const handleQuantity = (id: number, qty: number, size?: string) => {
    updateCartQuantity(id, qty, size);
    setCartItems(getCart());
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (!mounted) return null;

  const CUSTOM_CATS = ["blouse"];

  return (
    <main className="min-h-screen bg-black text-white pb-16 lg:pb-0">
      <Nav/>
      <div className="max-w-6xl mx-auto px-6 md:px-10 py-10">
        <div className="flex items-center justify-between mb-10">
          <h1 className="text-3xl font-bold tracking-widest">MY BAG</h1>
          <p className="text-xs tracking-widest text-gray-500">{cartItems.length} {cartItems.length === 1 ? "ITEM" : "ITEMS"}</p>
        </div>

        {cartItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 border border-gray-800">
            <ShoppingBag size={48} color="#374151" strokeWidth={1}/>
            <p className="text-gray-500 mt-6 mb-2 tracking-widest text-sm font-bold">YOUR BAG IS EMPTY</p>
            <p className="text-gray-700 text-xs tracking-widest mb-8">Looks like you haven't added anything yet</p>
            <a href="/" className="bg-white text-black px-10 py-4 text-xs tracking-widest font-bold hover:bg-gray-200 transition">START SHOPPING</a>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2 flex flex-col gap-0">
              <div className="hidden md:grid grid-cols-12 gap-4 pb-4 border-b border-gray-800 text-xs tracking-widest text-gray-500">
                <div className="col-span-6">PRODUCT</div>
                <div className="col-span-2 text-center">PRICE</div>
                <div className="col-span-2 text-center">QUANTITY</div>
                <div className="col-span-2 text-right">TOTAL</div>
              </div>

              {cartItems.map((item, index) => {
                const itemKey = `${item.id}-${item.size || "nosize"}-${index}`;
                const productLink = item.color ? `/custom-product/${item.id}` : `/product/${item.id}`;
                return (
                  <div key={itemKey} className="grid grid-cols-12 gap-4 py-6 border-b border-gray-800 items-center">
                    <div className="col-span-12 md:col-span-6 flex gap-4">
                      <a href={productLink} className="flex-shrink-0">
                        <img src={item.image} alt={item.name} className="w-20 h-24 md:w-24 md:h-28 object-cover"/>
                      </a>
                      <div className="flex flex-col justify-between py-1">
                        <div>
                          <a href={productLink}>
                            <p className="text-sm font-bold tracking-widest hover:text-gray-300 transition">{item.name}</p>
                          </a>
                          {item.size && <p className="text-xs text-gray-500 mt-1 tracking-widest">SIZE: {item.size}</p>}
                          {item.color && <p className="text-xs text-gray-500 tracking-widest">COLOUR: {item.color}</p>}
                        </div>
                        <button
                          onClick={() => handleRemove(item.id, item.size)}
                          className="text-xs text-gray-600 hover:text-white transition tracking-widest flex items-center gap-1 w-fit mt-2"
                        >
                          <X size={10}/> REMOVE
                        </button>
                      </div>
                    </div>

                    <div className="col-span-4 md:col-span-2 text-center">
                      <div className="flex flex-col items-center gap-1">
                        {item.original && item.original !== item.price && (
                          <Price amountINR={item.original} className="text-xs text-gray-500" strikethrough={true}/>
                        )}
                        <Price amountINR={item.price} className="text-sm font-bold"/>
                      </div>
                    </div>

                    <div className="col-span-4 md:col-span-2 flex items-center justify-center">
                      <div className="flex items-center border border-gray-700">
                        <button
                          onClick={() => handleQuantity(item.id, item.quantity - 1, item.size)}
                          className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-800 transition"
                        >−</button>
                        <span className="w-8 h-8 flex items-center justify-center text-sm border-x border-gray-700">{item.quantity}</span>
                        <button
                          onClick={() => handleQuantity(item.id, item.quantity + 1, item.size)}
                          className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-800 transition"
                        >+</button>
                      </div>
                    </div>

                    <div className="col-span-4 md:col-span-2 text-right">
                      <Price amountINR={item.price * item.quantity} className="text-sm font-bold"/>
                    </div>
                  </div>
                );
              })}

              <div className="flex gap-3 mt-6">
                <div className="flex flex-1 border border-gray-700 items-center">
                  <Tag size={14} color="#6b7280" className="ml-3 flex-shrink-0"/>
                  <input
                    placeholder="COUPON CODE"
                    value={coupon}
                    onChange={(e) => setCoupon(e.target.value)}
                    className="flex-1 bg-transparent text-white px-3 py-3 text-xs tracking-widest outline-none placeholder-gray-700"
                  />
                </div>
                <button className="border border-gray-600 text-white px-6 py-3 text-xs tracking-widest hover:border-white transition">APPLY</button>
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="bg-gray-900 border border-gray-800 p-6 sticky top-24">
                <p className="text-xs tracking-widest text-gray-500 mb-6 pb-4 border-b border-gray-800">ORDER SUMMARY</p>
                <div className="flex flex-col gap-3 mb-6">
                  <div className="flex justify-between">
                    <span className="text-xs text-gray-400 tracking-widest">SUBTOTAL ({cartItems.reduce((s,i)=>s+i.quantity,0)} ITEMS)</span>
                    <Price amountINR={subtotal} className="text-xs font-bold"/>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-gray-400 tracking-widest">SHIPPING</span>
                    <span className="text-xs text-gray-500">CALCULATED AT CHECKOUT</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-gray-400 tracking-widest">TAX</span>
                    <span className="text-xs text-gray-500">CALCULATED AT CHECKOUT</span>
                  </div>
                </div>
                <div className="border-t border-gray-700 pt-4 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold tracking-widest">ESTIMATED TOTAL</span>
                    <Price amountINR={subtotal} className="text-sm font-bold"/>
                  </div>
                  <p className="text-xs text-gray-600 mt-1 tracking-widest">Tax and shipping calculated at checkout</p>
                </div>
                <a href="/checkout" className="flex items-center justify-center gap-2 w-full bg-white text-black py-4 text-xs tracking-widest font-bold hover:bg-gray-200 transition mb-3">
                  PROCEED TO CHECKOUT <ArrowRight size={14}/>
                </a>
                <a href="/" className="flex items-center justify-center w-full border border-gray-700 text-white py-4 text-xs tracking-widest hover:border-white transition">
                  CONTINUE SHOPPING
                </a>
                <div className="mt-6 pt-6 border-t border-gray-800 flex flex-col gap-2">
                  <p className="text-xs text-gray-600 tracking-widest">🔒 SECURE CHECKOUT</p>
                  <p className="text-xs text-gray-600 tracking-widest">🚚 FREE SHIPPING IN INDIA</p>
                  <p className="text-xs text-gray-600 tracking-widest">↩️ 7 DAY RETURNS</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
