"use client";
import Nav from "../components/Nav";
import ProductCard from "../components/ProductCard";

export default function CategoryPage() {
  const categoryName = "jewellery".toUpperCase();

  const products = [
    { id: 1, name: "Kanchipuram Silk Saree", price: 4999, original: 7999 },
    { id: 2, name: "Uppada Silk Saree", price: 5999, original: 8999 },
    { id: 3, name: "Banarasi Saree", price: 6999, original: 9999 },
    { id: 4, name: "Cotton Saree", price: 1999, original: 3499 },
    { id: 5, name: "Designer Lehenga", price: 8999, original: 14999 },
    { id: 6, name: "Anarkali Suit", price: 3499, original: 5999 },
    { id: 7, name: "Silk Kurti", price: 1499, original: 2499 },
    { id: 8, name: "Embroidered Set", price: 999, original: 1999 },
  ];

  return (
    <main className="min-h-screen bg-black text-white pb-16 lg:pb-0">
      <Nav/>
      <div className="px-6 md:px-10 py-4 text-xs tracking-widest text-gray-500">
        <a href="/" className="hover:text-white transition">HOME</a>
        <span className="mx-2">→</span>
        <span className="text-white">{categoryName}</span>
      </div>
      <div className="px-6 md:px-10 py-8">
        <div className="flex justify-between items-end mb-8">
          <h1 className="text-3xl md:text-5xl font-bold tracking-widest">{categoryName}</h1>
          <p className="text-xs tracking-widest text-gray-500">{products.length} PRODUCTS</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} {...product}/>
          ))}
        </div>
      </div>
      <footer className="border-t border-gray-800 px-6 md:px-10 py-6 mt-10">
        <div className="flex justify-between items-center">
          <a href="/" className="text-lg font-bold tracking-widest">JEROVIN</a>
          <p className="text-xs text-gray-500">© 2026 JEROVIN. ALL RIGHTS RESERVED.</p>
        </div>
      </footer>
    </main>
  );
}
