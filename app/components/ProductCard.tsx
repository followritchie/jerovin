"use client";
import { useState, useRef, useEffect } from "react";
import { Heart, ShoppingBag } from "lucide-react";
import Price from "./Price";
import { addToCart, toggleWishlist, isWishlisted } from "../lib/store";

// Categories that go to the custom product page
const CUSTOM_CATEGORIES = ["women-blouses", "blouse"];

interface ProductCardProps {
  id: number;
  name: string;
  price: number;
  original: number;
  images: string[];
  href?: string;
  categoryId?: string;
}

export default function ProductCard({ id, name, price, original, images, href, categoryId }: ProductCardProps) {
  const [currentImage, setCurrentImage] = useState(0);
  const [added, setAdded] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);
  const intervalRef = useRef<any>(null);

  const isCustom = CUSTOM_CATEGORIES.some(cat => categoryId?.toLowerCase().includes(cat));
  const link = href || (isCustom ? `/custom-product/${id}` : `/product/${id}`);

  useEffect(() => {
    setWishlisted(isWishlisted(id));
  }, [id]);

  const startImageCycle = () => {
    if (images.length <= 1) return;
    let index = 0;
    intervalRef.current = setInterval(() => {
      index = (index + 1) % images.length;
      setCurrentImage(index);
    }, 800);
  };

  const stopImageCycle = () => {
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
    setCurrentImage(0);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    addToCart({ id, name, price, original, image: images[0], quantity: 1 });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
    window.dispatchEvent(new Event("cartUpdated"));
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    const result = toggleWishlist({ id, name, price, original, image: images[0] });
    setWishlisted(result);
  };

  return (
    <div className="group cursor-pointer">
      <a href={link}>
        <div className="relative overflow-hidden mb-3" style={{aspectRatio:"3/4"}} onMouseEnter={startImageCycle} onMouseLeave={stopImageCycle}>
          <img src={images[currentImage]} alt={name} className="w-full h-full object-cover group-hover:scale-105 transition duration-700"/>
          <button onClick={handleWishlist} className="absolute top-3 right-3 w-8 h-8 bg-white bg-opacity-90 rounded-full flex items-center justify-center hover:bg-opacity-100 transition z-10" aria-label="Wishlist">
            <Heart size={14} strokeWidth={1.5} fill={wishlisted ? "#000" : "none"} color="#000"/>
          </button>
          {isCustom && (
            <div className="absolute top-3 left-3 bg-white text-black text-xs px-2 py-1 tracking-widest font-bold">CUSTOM</div>
          )}
          {images.length > 1 && (
            <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1 opacity-0 group-hover:opacity-100 transition">
              {images.map((_, i) => <div key={i} className={`w-1.5 h-1.5 rounded-full transition-all ${i === currentImage ? "bg-white" : "bg-white/40"}`}/>)}
            </div>
          )}
        </div>
        <p className="text-sm font-bold tracking-widest mb-1">{name}</p>
        <div className="flex items-center gap-3 mb-3">
          <Price amountINR={original} className="text-xs text-gray-500" strikethrough={true}/>
          <Price amountINR={price} className="text-sm font-bold text-white"/>
        </div>
      </a>
      <button onClick={handleAddToCart} className={`w-full py-2 text-xs tracking-widest transition border flex items-center justify-center gap-2 ${added ? "bg-white text-black border-white" : "border-gray-700 text-gray-400 hover:border-white hover:text-white"}`}>
        <ShoppingBag size={12} strokeWidth={1.5}/>
        {added ? "✓ ADDED TO BAG" : "ADD TO BAG"}
      </button>
    </div>
  );
}
