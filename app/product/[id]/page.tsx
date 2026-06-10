"use client";
import { useState, useEffect } from "react";
import Price from "../../components/Price";
import Nav from "../../components/Nav";

export default function ProductPage() {
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const sizes = ["XS", "S", "M", "L", "XL", "XXL"];

  const product = {
    name: "Kanchipuram Silk Saree",
    category: "WOMEN",
    price: 4999,
    description: "Handcrafted pure silk saree with intricate zari work. Perfect for weddings, festivals and special occasions. Each piece is uniquely crafted by skilled artisans from India.",
    details: [
      "100% Pure Silk",
      "Handwoven by master artisans",
      "Zari border with traditional motifs",
      "Comes with matching blouse piece",
      "Dry clean only",
    ]
  };

  if (!mounted) return null;

  return (
    <main className="min-h-screen bg-black text-white pb-16 lg:pb-0">
      <Nav/>
      <nav className="flex items-center justify-between px-6 md:px-10 py-5 border-b border-gray-800">
        <a href="/" className="text-xl md:text-2xl font-bold tracking-widest text-white no-underline">JEROVIN</a>
        <div className="flex gap-4 text-xs tracking-widest text-gray-400">
          <a href="/search" className="hover:text-white transition">SEARCH</a>
          <a href="/cart" className="hover:text-white transition">CART</a>
          <a href="/account" className="hover:text-white transition">ACCOUNT</a>
        </div>
      </nav>

      <div className="px-6 md:px-10 py-4 text-xs tracking-widest text-gray-500">
        <a href="/" className="hover:text-white transition">HOME</a>
        <span className="mx-2">→</span>
        <a href="/women" className="hover:text-white transition">{product.category}</a>
        <span className="mx-2">→</span>
        <span className="text-white">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 px-6 md:px-10 py-8">
        <div className="flex flex-col gap-4">
          <div className="bg-gray-900 w-full aspect-square flex items-center justify-center border border-gray-800">
            <span className="text-gray-700 text-xs tracking-widest">PRODUCT IMAGE</span>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {[1,2,3,4].map((i) => (
              <div key={i} className="bg-gray-900 aspect-square flex items-center justify-center border border-gray-800 cursor-pointer hover:border-gray-500 transition">
                <span className="text-gray-700 text-xs">{i}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div>
            <p className="text-xs tracking-widest text-gray-500 mb-2">{product.category}</p>
            <h1 className="text-2xl md:text-4xl font-bold tracking-widest mb-4">{product.name}</h1>
            <Price amountINR={product.price} className="text-2xl md:text-3xl font-bold"/>
            <p className="text-xs text-gray-500 tracking-widest mt-1">TAXES INCLUDED — SHIPPING CALCULATED AT CHECKOUT</p>
          </div>

          <p className="text-gray-400 text-sm leading-relaxed">{product.description}</p>

          <div>
            <p className="text-xs tracking-widest text-gray-500 mb-3">PRODUCT DETAILS</p>
            <ul className="flex flex-col gap-2">
              {product.details.map((detail, i) => (
                <li key={i} className="text-xs text-gray-400 tracking-widest flex items-center gap-2">
                  <span className="text-white">—</span> {detail}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs tracking-widest text-gray-500 mb-3">SELECT SIZE</p>
            <div className="flex gap-2 flex-wrap">
              {sizes.map((size) => (
                <button key={size} onClick={() => setSelectedSize(size)} className={`px-4 py-3 text-xs tracking-widest border transition cursor-pointer ${selectedSize === size ? "border-white text-white" : "border-gray-700 text-gray-500 hover:border-gray-400"}`}>
                  {size}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs tracking-widest text-gray-500 mb-3">QUANTITY</p>
            <div className="flex items-center gap-4">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-10 border border-gray-700 text-white text-lg hover:border-white transition">−</button>
              <span className="text-lg tracking-widest w-8 text-center">{quantity}</span>
              <button onClick={() => setQuantity(quantity + 1)} className="w-10 h-10 border border-gray-700 text-white text-lg hover:border-white transition">+</button>
            </div>
          </div>

          <div className="flex flex-col gap-3 mt-2">
            <button className="w-full bg-white text-black py-4 text-xs tracking-widest font-bold hover:bg-gray-200 transition">ADD TO CART</button>
            <button className="w-full border border-gray-600 text-white py-4 text-xs tracking-widest hover:border-white transition">BUY NOW</button>
          </div>

          <div className="border border-gray-800 p-4 flex flex-col gap-2">
            <p className="text-xs tracking-widest text-gray-500">FREE SHIPPING WITHIN INDIA</p>
            <p className="text-xs tracking-widest text-gray-500">WORLDWIDE DELIVERY IN 5-7 DAYS</p>
            <p className="text-xs tracking-widest text-gray-500">7 DAY RETURNS FOR INDIA</p>
            <p className="text-xs tracking-widest text-gray-500">SECURE PAYMENT</p>
          </div>
        </div>
      </div>
    </main>
  );
}
