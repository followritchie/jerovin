"use client";
import { useState } from "react";
import Price from "../../components/Price";
import MediaUpload from "../../components/MediaUpload";

export default function CustomProductPage() {
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("#000000");
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState("");
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

  const sizes = ["XS", "S", "M", "L", "XL", "XXL", "CUSTOM"];
  const colors = ["#000000", "#FFFFFF", "#8B0000", "#FFD700", "#006400", "#000080", "#FF69B4", "#FFA500", "#800080", "#A52A2A"];

  const product = {
    name: "Custom Silk Blouse",
    category: "CUSTOM CLOTHING",
    price: 2499,
    description: "Fully customised silk blouse crafted exclusively for you. Choose your colour, size and fabric. Upload a reference image and add your special instructions.",
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setUploadedImage(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <main className="min-h-screen bg-black text-white">
      <nav className="flex items-center justify-between px-6 md:px-10 py-5 border-b border-gray-800">
        <a href="/" className="text-xl md:text-2xl font-bold tracking-widest text-white no-underline">JEROVIN</a>
        <div className="flex gap-4 text-xs tracking-widest text-gray-400">
          <a href="/search" className="hover:text-white transition">SEARCH</a>
          <a href="/cart" className="hover:text-white transition">CART</a>
          <a href="/account" className="hover:text-white transition">ACCOUNT</a>
        </div>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 px-6 md:px-10 py-8">
        <MediaUpload />

        <div className="flex flex-col gap-6">
          <div>
            <p className="text-xs tracking-widest text-gray-500 mb-2">{product.category}</p>
            <h1 className="text-2xl md:text-4xl font-bold tracking-widest mb-4">{product.name}</h1>
            <Price amountINR={product.price} className="text-2xl font-bold"/>
            <p className="text-xs text-gray-500 tracking-widest mt-1">SHIPPING CALCULATED AT CHECKOUT</p>
          </div>

          <p className="text-gray-400 text-sm leading-relaxed">{product.description}</p>

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
            <p className="text-xs tracking-widest text-gray-500 mb-3">SELECT COLOUR</p>
            <div className="flex gap-3 flex-wrap mb-3">
              {colors.map((color) => (
                <button key={color} onClick={() => setSelectedColor(color)} className="w-8 h-8 rounded-full border-2 transition cursor-pointer" style={{background: color, borderColor: selectedColor === color ? "#fff" : "#333"}}/>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <p className="text-xs tracking-widest text-gray-500">HEX:</p>
              <input type="text" value={selectedColor} onChange={(e) => setSelectedColor(e.target.value)} className="bg-black border border-gray-700 text-white px-3 py-2 text-xs w-28 outline-none"/>
              <input type="color" value={selectedColor} onChange={(e) => setSelectedColor(e.target.value)} className="w-10 h-10 border-none cursor-pointer bg-transparent"/>
            </div>
          </div>

          <div>
            <p className="text-xs tracking-widest text-gray-500 mb-3">UPLOAD REFERENCE IMAGE</p>
            <label className="block border border-dashed border-gray-700 p-6 text-center cursor-pointer hover:border-gray-400 transition">
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden"/>
              {uploadedImage ? (
                <div>
                  <img src={uploadedImage} alt="Uploaded" className="w-20 h-20 object-cover mx-auto mb-2"/>
                  <p className="text-xs text-green-400 tracking-widest">IMAGE UPLOADED — CLICK TO CHANGE</p>
                </div>
              ) : (
                <div>
                  <p className="text-2xl mb-2">+</p>
                  <p className="text-xs text-gray-500 tracking-widest">CLICK TO UPLOAD REFERENCE IMAGE</p>
                  <p className="text-xs text-gray-700 tracking-widest mt-1">JPG, PNG, WEBP — MAX 10MB</p>
                </div>
              )}
            </label>
          </div>

          <div>
            <p className="text-xs tracking-widest text-gray-500 mb-3">PERSONALIZED MESSAGE / SPECIAL INSTRUCTIONS</p>
            <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Write your special instructions here..." rows={4} className="w-full bg-black border border-gray-700 text-white px-4 py-3 text-xs tracking-widest outline-none resize-none hover:border-gray-400 transition placeholder-gray-700"/>
            <p className="text-xs text-gray-700 tracking-widest mt-1">{message.length}/500 CHARACTERS</p>
          </div>

          <div>
            <p className="text-xs tracking-widest text-gray-500 mb-3">QUANTITY</p>
            <div className="flex items-center gap-4">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-10 border border-gray-700 text-white text-lg hover:border-white transition">-</button>
              <span className="text-lg w-8 text-center">{quantity}</span>
              <button onClick={() => setQuantity(quantity + 1)} className="w-10 h-10 border border-gray-700 text-white text-lg hover:border-white transition">+</button>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <button className="w-full bg-white text-black py-4 text-xs tracking-widest font-bold hover:bg-gray-200 transition">ADD TO CART</button>
            <button className="w-full border border-gray-600 text-white py-4 text-xs tracking-widest hover:border-white transition">BUY NOW</button>
          </div>

          <div className="border border-gray-800 p-4 flex flex-col gap-2">
            <p className="text-xs tracking-widest text-gray-500">FULLY CUSTOMISED FOR YOU</p>
            <p className="text-xs tracking-widest text-gray-500">DELIVERY IN 7-10 WORKING DAYS</p>
            <p className="text-xs tracking-widest text-gray-500">FREE SHIPPING WITHIN INDIA</p>
            <p className="text-xs tracking-widest text-gray-500">CUSTOM PRODUCTS CANNOT BE RETURNED</p>
          </div>
        </div>
      </div>
    </main>
  );
}
