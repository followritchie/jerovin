"use client";
import Price from "./Price";

interface ProductCardProps {
  id: number;
  name: string;
  price: number;
  original: number;
  imageUrl?: string;
  href?: string;
}

export default function ProductCard({ id, name, price, original, imageUrl, href }: ProductCardProps) {
  const link = href || `/product/${id}`;

  return (
    <a href={link} className="group cursor-pointer">
      <div className="bg-gray-900 aspect-square flex items-center justify-center border border-gray-800 group-hover:border-gray-500 transition mb-3 relative overflow-hidden">
        {imageUrl ? (
          <img src={imageUrl} alt={name} className="w-full h-full object-cover"/>
        ) : (
          <span className="text-gray-700 text-xs tracking-widest">IMAGE</span>
        )}
      </div>
      <p className="text-sm font-bold tracking-widest mb-2">{name}</p>
      <div className="flex items-center gap-3">
        <Price amountINR={original} className="text-xs text-gray-500" strikethrough={true}/>
        <Price amountINR={price} className="text-sm font-bold text-white"/>
      </div>
    </a>
  );
}
