"use client";
import { useState } from "react";

interface ProductFormProps {
  onSubmit: (data: FormData) => Promise<void>;
  isLoading?: boolean;
  initialData?: {
    id: string;
    name: string;
    description: string;
    priceINR: number;
  };
}

export default function ProductForm({
  onSubmit,
  isLoading = false,
  initialData,
}: ProductFormProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    description: initialData?.description || "",
    priceINR: initialData?.priceINR || 0,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = new FormData();
    data.append("name", formData.name);
    data.append("description", formData.description);
    data.append("priceINR", formData.priceINR.toString());
    if (initialData?.id) {
      data.append("id", initialData.id);
    }
    await onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Product Name</label>
        <input
          type="text"
          required
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-4 py-2 bg-gray-800 text-white border border-gray-700 rounded"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Description</label>
        <textarea
          required
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          className="w-full px-4 py-2 bg-gray-800 text-white border border-gray-700 rounded h-32"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Price (INR)</label>
        <input
          type="number"
          required
          min="0"
          step="0.01"
          value={formData.priceINR}
          onChange={(e) =>
            setFormData({ ...formData, priceINR: parseFloat(e.target.value) })
          }
          className="w-full px-4 py-2 bg-gray-800 text-white border border-gray-700 rounded"
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full px-4 py-2 bg-white text-black rounded font-semibold hover:bg-gray-100 disabled:opacity-50"
      >
        {isLoading ? "Saving..." : initialData ? "Update Product" : "Add Product"}
      </button>
    </form>
  );
}