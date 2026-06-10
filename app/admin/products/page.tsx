"use client";
import { useState, useEffect } from "react";

interface Product {
  id: string;
  name: string;
  description: string;
  priceINR: number;
  seo_title?: string;
  seo_description?: string;
  category_id?: string;
  is_custom?: boolean;
  stock?: number;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [generatingSEO, setGeneratingSEO] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageUrl, setImageUrl] = useState("");

  const [form, setForm] = useState({
    name: "",
    description: "",
    priceINR: "",
    categoryId: "",
    isCustom: false,
    seoTitle: "",
    seoDescription: "",
  });

  const categories = [
    { id: "1", name: "WOMEN" },
    { id: "2", name: "MEN" },
    { id: "3", name: "KIDS" },
    { id: "4", name: "JEWELLERY" },
    { id: "5", name: "FOOTWEAR" },
    { id: "6", name: "GIFTS" },
    { id: "7", name: "PARCELS" },
    { id: "8", name: "SNACKS" },
  ];

  const inputClass = "w-full bg-black border border-gray-700 text-white px-4 py-3 text-xs tracking-widest outline-none hover:border-gray-400 transition placeholder-gray-700";

  useEffect(() => { fetchProducts(); }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/products");
      const data = await res.json();
      setProducts(data);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("fileName", file.name);
      formData.append("folder", "products");
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data.url) setImageUrl(data.url);
    } catch (error) {
      console.error("Upload error:", error);
    } finally {
      setUploadingImage(false);
    }
  };

  const generateSEO = async () => {
    if (!form.name || !form.description) {
      alert("Please fill in product name and description first");
      return;
    }
    setGeneratingSEO(true);
    try {
      const res = await fetch("/api/generate-seo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productName: form.name, description: form.description }),
      });
      const data = await res.json();
      if (data.seoTitle) setForm(prev => ({ ...prev, seoTitle: data.seoTitle, seoDescription: data.seoDescription }));
    } catch (error) {
      console.error("SEO generation error:", error);
    } finally {
      setGeneratingSEO(false);
    }
  };

  const handleSubmit = async () => {
    if (!form.name || !form.description || !form.priceINR) {
      alert("Please fill in name, description and price");
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("description", form.description);
      formData.append("priceINR", form.priceINR);
      formData.append("categoryId", form.categoryId);
      formData.append("isCustom", form.isCustom.toString());
      formData.append("seoTitle", form.seoTitle);
      formData.append("seoDescription", form.seoDescription);
      formData.append("imageUrl", imageUrl);
      if (editingId) formData.append("id", editingId);

      const res = await fetch("/api/products", { method: "POST", body: formData });
      if (res.ok) {
        resetForm();
        fetchProducts();
      }
    } catch (error) {
      console.error("Submit error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product: Product) => {
    setForm({
      name: product.name,
      description: product.description,
      priceINR: product.priceINR.toString(),
      categoryId: product.category_id || "",
      isCustom: product.is_custom || false,
      seoTitle: product.seo_title || "",
      seoDescription: product.seo_description || "",
    });
    setEditingId(product.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    try {
      await fetch(`/api/products?id=${id}`, { method: "DELETE" });
      fetchProducts();
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  const resetForm = () => {
    setForm({ name: "", description: "", priceINR: "", categoryId: "", isCustom: false, seoTitle: "", seoDescription: "" });
    setEditingId(null);
    setImageUrl("");
    setShowForm(false);
  };

  return (
    <div className="min-h-screen bg-black text-white p-10">
      <div className="flex justify-between items-center mb-8">
        <div>
          <a href="/admin" className="text-xs text-gray-500 tracking-widest hover:text-white transition">← BACK TO DASHBOARD</a>
          <p className="text-xs tracking-widest text-gray-500 mb-2 mt-4">MANAGE</p>
          <h1 className="text-3xl font-bold tracking-widest">PRODUCTS</h1>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="bg-white text-black px-6 py-3 text-xs tracking-widest font-bold hover:bg-gray-200 transition">
          {showForm ? "✕ CANCEL" : "+ ADD PRODUCT"}
        </button>
      </div>

      {showForm && (
        <div className="bg-gray-900 border border-gray-800 p-8 mb-8">
          <h2 className="text-xl font-bold tracking-widest mb-8">{editingId ? "EDIT PRODUCT" : "ADD NEW PRODUCT"}</h2>
          <div className="grid grid-cols-2 gap-8">
            <div className="flex flex-col gap-4">
              <div>
                <p className="text-xs tracking-widest text-gray-500 mb-2">PRODUCT NAME *</p>
                <input placeholder="Enter product name" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} className={inputClass}/>
              </div>
              <div>
                <p className="text-xs tracking-widest text-gray-500 mb-2">DESCRIPTION *</p>
                <textarea placeholder="Enter product description" value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} rows={4} className={inputClass + " resize-none"}/>
              </div>
              <div>
                <p className="text-xs tracking-widest text-gray-500 mb-2">PRICE (₹) *</p>
                <input type="number" placeholder="Enter price in INR" value={form.priceINR} onChange={(e) => setForm({...form, priceINR: e.target.value})} className={inputClass}/>
              </div>
              <div>
                <p className="text-xs tracking-widest text-gray-500 mb-2">CATEGORY</p>
                <select value={form.categoryId} onChange={(e) => setForm({...form, categoryId: e.target.value})} className={inputClass + " cursor-pointer"}>
                  <option value="">SELECT CATEGORY</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-3">
                <input type="checkbox" checked={form.isCustom} onChange={(e) => setForm({...form, isCustom: e.target.checked})} className="w-4 h-4"/>
                <p className="text-xs tracking-widest text-gray-400">THIS IS A CUSTOM PRODUCT (shows color picker and instructions)</p>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div>
                <p className="text-xs tracking-widest text-gray-500 mb-2">PRODUCT IMAGE / VIDEO</p>
                <label className="block border border-dashed border-gray-700 p-6 text-center cursor-pointer hover:border-gray-400 transition">
                  <input type="file" accept="image/*,video/*" onChange={handleImageUpload} className="hidden"/>
                  {uploadingImage ? (
                    <p className="text-xs text-gray-500 tracking-widest">UPLOADING...</p>
                  ) : imageUrl ? (
                    <div>
                      <img src={imageUrl} alt="Uploaded" className="w-32 h-32 object-cover mx-auto mb-2"/>
                      <p className="text-xs text-green-400 tracking-widest">✓ UPLOADED — CLICK TO CHANGE</p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-2xl mb-2">+</p>
                      <p className="text-xs text-gray-500 tracking-widest">CLICK TO UPLOAD IMAGE OR VIDEO</p>
                    </div>
                  )}
                </label>
              </div>

              <div className="border border-gray-800 p-4">
                <div className="flex justify-between items-center mb-4">
                  <p className="text-xs tracking-widest text-gray-500">SEO OPTIMIZATION</p>
                  <button onClick={generateSEO} disabled={generatingSEO} className="bg-white text-black px-4 py-2 text-xs tracking-widest font-bold hover:bg-gray-200 transition disabled:opacity-50">
                    {generatingSEO ? "GENERATING..." : "AI GENERATE SEO"}
                  </button>
                </div>
                <div className="flex flex-col gap-3">
                  <div>
                    <p className="text-xs tracking-widest text-gray-600 mb-1">SEO TITLE ({form.seoTitle.length}/60)</p>
                    <input placeholder="SEO title — max 60 characters" value={form.seoTitle} onChange={(e) => setForm({...form, seoTitle: e.target.value})} maxLength={60} className={inputClass}/>
                  </div>
                  <div>
                    <p className="text-xs tracking-widest text-gray-600 mb-1">SEO DESCRIPTION ({form.seoDescription.length}/160)</p>
                    <textarea placeholder="SEO description — max 160 characters" value={form.seoDescription} onChange={(e) => setForm({...form, seoDescription: e.target.value})} maxLength={160} rows={3} className={inputClass + " resize-none"}/>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-4 mt-8">
            <button onClick={handleSubmit} disabled={loading} className="bg-white text-black px-8 py-3 text-xs tracking-widest font-bold hover:bg-gray-200 transition disabled:opacity-50">
              {loading ? "SAVING..." : editingId ? "UPDATE PRODUCT" : "SAVE PRODUCT"}
            </button>
            <button onClick={resetForm} className="border border-gray-600 text-white px-8 py-3 text-xs tracking-widest hover:border-white transition">
              CANCEL
            </button>
          </div>
        </div>
      )}

      <div className="bg-gray-900 border border-gray-800">
        <div className="grid grid-cols-6 gap-4 p-4 border-b border-gray-800 text-xs tracking-widest text-gray-500">
          <span className="col-span-2">PRODUCT</span>
          <span>CATEGORY</span>
          <span>PRICE</span>
          <span>STOCK</span>
          <span>ACTIONS</span>
        </div>
        {products.length === 0 ? (
          <p className="text-gray-700 text-sm text-center py-16">No products yet. Click ADD PRODUCT to upload your first product.</p>
        ) : (
          products.map((product) => (
            <div key={product.id} className="grid grid-cols-6 gap-4 p-4 border-b border-gray-800 items-center hover:bg-gray-800 transition">
              <div className="col-span-2">
                <p className="font-bold text-sm tracking-widest">{product.name}</p>
                <p className="text-xs text-gray-500 mt-1 truncate">{product.description}</p>
              </div>
              <p className="text-xs text-gray-400 tracking-widest">{product.category_id || "—"}</p>
              <p className="text-sm font-bold">₹{product.priceINR?.toLocaleString()}</p>
              <p className="text-xs text-gray-400">{product.stock || 0}</p>
              <div className="flex gap-2">
                <button onClick={() => handleEdit(product)} className="text-xs border border-gray-700 px-3 py-1 hover:border-white hover:text-white transition text-gray-400">EDIT</button>
                <button onClick={() => handleDelete(product.id)} className="text-xs border border-red-900 px-3 py-1 hover:border-red-500 hover:text-red-500 transition text-gray-600">DELETE</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
