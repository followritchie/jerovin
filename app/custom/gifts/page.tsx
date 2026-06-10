"use client";
import { useState } from "react";
import Nav from "../../components/Nav";
import Price from "../../components/Price";

export default function CustomGiftsPage() {
  const [selectedType, setSelectedType] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState("");
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

  const giftTypes = [
    { name: "PHOTO FRAME", price: 899 },
    { name: "CUSTOM T-SHIRT", price: 699 },
    { name: "PERSONALISED MUG", price: 499 },
    { name: "CUSTOM CUSHION", price: 799 },
    { name: "ENGRAVED ITEM", price: 1299 },
    { name: "GIFT HAMPER", price: 1999 },
    { name: "FESTIVAL GIFT", price: 1499 },
    { name: "OTHER", price: 999 },
  ];

  const selectedGift = giftTypes.find(g => g.name === selectedType);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setUploadedImage(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <main className="min-h-screen bg-black text-white pb-16 lg:pb-0">
      <Nav/>
      <div className="px-6 md:px-10 py-4 text-xs tracking-widest text-gray-500">
        <a href="/" className="hover:text-white transition">HOME</a>
        <span className="mx-2">→</span>
        <a href="/custom" className="hover:text-white transition">CUSTOM</a>
        <span className="mx-2">→</span>
        <span className="text-white">CUSTOM GIFTS</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 px-6 md:px-10 py-8">
        <div className="flex flex-col gap-4">
          <div className="bg-gray-900 w-full aspect-square flex items-center justify-center border border-gray-800">
            {uploadedImage ? (
              <img src={uploadedImage} alt="Reference" className="w-full h-full object-cover opacity-60"/>
            ) : (
              <div className="text-center">
                <p className="text-6xl mb-4">🎁</p>
                <p className="text-gray-700 text-xs tracking-widest">YOUR CUSTOM GIFT</p>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div>
            <p className="text-xs tracking-widest text-gray-500 mb-2">CUSTOM GIFTS</p>
            <h1 className="text-2xl md:text-4xl font-bold tracking-widest mb-4">PERSONALISE YOUR GIFT</h1>
            {selectedGift ? (
              <Price amountINR={selectedGift.price} className="text-2xl font-bold"/>
            ) : (
              <p className="text-lg text-gray-500 tracking-widest">SELECT A GIFT TYPE</p>
            )}
          </div>

          <div>
            <p className="text-xs tracking-widest text-gray-500 mb-3">SELECT GIFT TYPE</p>
            <div className="grid grid-cols-2 gap-2">
              {giftTypes.map((gift) => (
                <button key={gift.name} onClick={() => setSelectedType(gift.name)} className={`px-4 py-3 text-xs tracking-widest border transition text-left ${selectedType === gift.name ? "border-white text-white" : "border-gray-700 text-gray-500 hover:border-gray-400"}`}>
                  <p>{gift.name}</p>
                  <Price amountINR={gift.price} className="text-gray-600 mt-1 text-xs"/>
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs tracking-widest text-gray-500 mb-3">UPLOAD YOUR PHOTO / DESIGN</p>
            <label className="block border border-dashed border-gray-700 p-6 text-center cursor-pointer hover:border-gray-400 transition">
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden"/>
              {uploadedImage ? (
                <div>
                  <img src={uploadedImage} alt="Uploaded" className="w-20 h-20 object-cover mx-auto mb-2"/>
                  <p className="text-xs text-green-400 tracking-widest">✓ UPLOADED — CLICK TO CHANGE</p>
                </div>
              ) : (
                <div>
                  <p className="text-2xl mb-2">+</p>
                  <p className="text-xs text-gray-500 tracking-widest">UPLOAD YOUR PHOTO OR DESIGN</p>
                </div>
              )}
            </label>
          </div>

          <div>
            <p className="text-xs tracking-widest text-gray-500 mb-3">PERSONALISED MESSAGE / INSTRUCTIONS</p>
            <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="What would you like printed or personalised? Add names, dates, or special messages..." rows={4} className="w-full bg-black border border-gray-700 text-white px-4 py-3 text-xs tracking-widest outline-none resize-none hover:border-gray-400 transition placeholder-gray-700"/>
          </div>

          <div>
            <p className="text-xs tracking-widest text-gray-500 mb-3">QUANTITY</p>
            <div className="flex items-center gap-4">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-10 border border-gray-700 text-white text-lg hover:border-white transition">−</button>
              <span className="text-lg w-8 text-center">{quantity}</span>
              <button onClick={() => setQuantity(quantity + 1)} className="w-10 h-10 border border-gray-700 text-white text-lg hover:border-white transition">+</button>
            </div>
          </div>

          <button className="w-full bg-white text-black py-4 text-xs tracking-widest font-bold hover:bg-gray-200 transition">ADD TO CART</button>
          <button className="w-full border border-gray-600 text-white py-4 text-xs tracking-widest hover:border-white transition">BUY NOW</button>

          <div className="border border-gray-800 p-4 flex flex-col gap-2">
            <p className="text-xs tracking-widest text-gray-500">🎨 FULLY PERSONALISED FOR YOU</p>
            <p className="text-xs tracking-widest text-gray-500">⏱ READY IN 3-5 WORKING DAYS</p>
            <p className="text-xs tracking-widest text-gray-500">🚚 FREE SHIPPING WITHIN INDIA</p>
            <p className="text-xs tracking-widest text-gray-500">❌ CUSTOM PRODUCTS CANNOT BE RETURNED</p>
          </div>
        </div>
      </div>
    </main>
  );
}
