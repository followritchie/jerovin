"use client";
import { useState } from "react";
import { Search, X } from "lucide-react";
import Nav from "../components/Nav";
import ProductCard from "../components/ProductCard";

const ALL_PRODUCTS = [
  { id: 1, name: "Kanchipuram Silk Saree", price: 4999, original: 7999, category: "women", images: ["https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600","https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600","https://images.unsplash.com/photo-1591130901921-e8f54d2b738a?w=600"] },
  { id: 2, name: "Uppada Silk Saree", price: 5999, original: 8999, category: "women", images: ["https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600","https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600","https://images.unsplash.com/photo-1591130901921-e8f54d2b738a?w=600"] },
  { id: 3, name: "Banarasi Silk Saree", price: 6999, original: 9999, category: "women", images: ["https://images.unsplash.com/photo-1591130901921-e8f54d2b738a?w=600","https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600","https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600"] },
  { id: 4, name: "Bridal Lehenga", price: 14999, original: 24999, category: "women", images: ["https://images.unsplash.com/photo-1594938298603-c8148c4b4571?w=600","https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600","https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600"] },
  { id: 10, name: "Royal Sherwani", price: 8999, original: 14999, category: "men", images: ["https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600","https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600","https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600"] },
  { id: 12, name: "Silk Kurta", price: 2499, original: 3999, category: "men", images: ["https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600","https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600","https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600"] },
  { id: 13, name: "Nehru Jacket", price: 2999, original: 4999, category: "men", images: ["https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=600","https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600","https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600"] },
  { id: 20, name: "Boys Sherwani", price: 1999, original: 3499, category: "kids", images: ["https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=600","https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?w=600","https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=600"] },
  { id: 23, name: "Girls Lehenga", price: 1999, original: 3499, category: "kids", images: ["https://images.unsplash.com/photo-1471286174890-9c112ffca5b4?w=600","https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=600","https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?w=600"] },
  { id: 30, name: "Gold Ring", price: 1299, original: 1999, category: "jewellery", images: ["https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=600","https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600","https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600"] },
  { id: 32, name: "Jhumka Earrings", price: 799, original: 1299, category: "jewellery", images: ["https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600","https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600","https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=600"] },
  { id: 1, name: "Kolhapuri Sandals", price: 1499, original: 2499, category: "footwear", images: ["https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=600","https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600","https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600"] },
  { id: 40, name: "Hand Painted Vase", price: 1499, original: 2499, category: "handicrafts", images: ["https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600","https://images.unsplash.com/photo-1567538096621-38d2284b23ff?w=600","https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600"] },
  { id: 41, name: "Wooden Elephant", price: 999, original: 1699, category: "handicrafts", images: ["https://images.unsplash.com/photo-1567538096621-38d2284b23ff?w=600","https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600","https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600"] },
];

const POPULAR = ["Saree", "Kurta", "Lehenga", "Sherwani", "Jewellery", "Sandals", "Kids", "Handicrafts"];

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [searched, setSearched] = useState(false);

  const handleSearch = (q?: string) => {
    const searchTerm = (q || query).toLowerCase().trim();
    if (!searchTerm) return;
    setSearched(true);
    const found = ALL_PRODUCTS.filter(p =>
      p.name.toLowerCase().includes(searchTerm) ||
      p.category.toLowerCase().includes(searchTerm)
    );
    setResults(found);
    if (q) setQuery(q);
  };

  return (
    <main className="min-h-screen bg-black text-white pb-16 lg:pb-0">
      <Nav/>
      <div className="max-w-5xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold tracking-widest mb-8">SEARCH</h1>

        <div className="flex gap-3 mb-10">
          <div className="flex-1 flex items-center border border-gray-700 hover:border-gray-400 transition">
            <Search size={16} color="#6b7280" className="ml-4 flex-shrink-0"/>
            <input
              type="text"
              placeholder="SEARCH FOR SAREES, KURTAS, JEWELLERY..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="flex-1 bg-transparent text-white px-4 py-4 text-xs tracking-widest outline-none placeholder-gray-700"
            />
            {query && (
              <button onClick={() => { setQuery(""); setResults([]); setSearched(false); }} className="mr-3 text-gray-600 hover:text-white transition">
                <X size={14}/>
              </button>
            )}
          </div>
          <button onClick={() => handleSearch()} className="bg-white text-black px-8 py-4 text-xs tracking-widest font-bold hover:bg-gray-200 transition">
            SEARCH
          </button>
        </div>

        {!searched && (
          <div>
            <p className="text-xs tracking-widest text-gray-500 mb-4">POPULAR SEARCHES</p>
            <div className="flex gap-3 flex-wrap">
              {POPULAR.map((term) => (
                <button key={term} onClick={() => handleSearch(term)} className="border border-gray-700 px-4 py-2 text-xs tracking-widest text-gray-400 hover:border-white hover:text-white transition">
                  {term}
                </button>
              ))}
            </div>
          </div>
        )}

        {searched && results.length === 0 && (
          <div className="text-center py-20 border border-gray-800">
            <Search size={40} color="#374151" style={{margin:"0 auto 16px"}}/>
            <p className="text-gray-500 tracking-widest text-sm mb-2">No results for "{query}"</p>
            <p className="text-gray-700 text-xs tracking-widest">Try different keywords</p>
          </div>
        )}

        {searched && results.length > 0 && (
          <div>
            <p className="text-xs tracking-widest text-gray-500 mb-6">{results.length} RESULTS FOR "{query.toUpperCase()}"</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {results.map((product, i) => (
                <ProductCard key={`${product.id}-${i}`} {...product}/>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
