"use client";
import { useState } from "react";
import { useCart } from "@/app/lib/CartContext";

interface AddToCartButtonProps {
  productId: string;
  productName: string;
  priceINR: number;
  className?: string;
}

export default function AddToCartButton({
  productId,
  productName,
  priceINR,
  className = "",
}: AddToCartButtonProps) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  const handleClick = () => {
    addItem({
      id: productId,
      name: productName,
      priceINR,
      quantity: 1,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <button
      onClick={handleClick}
      className={`px-6 py-2 bg-white text-black rounded transition ${
        added ? "bg-green-500 text-white" : "hover:bg-gray-100"
      } ${className}`}
    >
      {added ? "✓ Added to Cart" : "Add to Cart"}
    </button>
  );
}