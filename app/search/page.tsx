"use client";
import { useState } from "react";
import Nav from "../components/Nav";
import Price from "../components/Price";
import Nav from "../components/Nav";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setSearched(true);
    try {
      const res = await fetch(`/api/products?search=${encodeURIComponent(query)}`);
      const data = await res.json();
      setResults(data);
    } catch {
      setResults([]);
    }
  };

  return (
    <main className="min-h-screen bg-black text-white pb-16 lg:pb-0">
      <Nav/>

      <div className="max-w-4xl mx-auto px-6 py-16">
        <p className="text-xs tracking-widest text-gray-500 mb-2">FIND PRODUCTS</p>
        <h1 className="text-3xl font-bold tracking-widest mb-8">SEARCH</h1>

        <div className="flex gap-3 mb-10">
          <input
            type="text"
            placeholder="SEARCH FOR SAREES, KURTAS, JEWELLERY..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="flex-1 bg-black border border-gray-700 text-white px-4 py-3 text-xs tracking-widest outline-none hover:border-gray-400 transition placeholder-gray-700"
          />
          <button onClick={handleSearch} className="bg-white text-black px-8 py-3 text-xs tracking-widest font-bold hover:bg-gray-200 transition">
            SEARCH
          </button>
        </div>

        {searched && (
          results.length === 0 ? (
            <div className="text-center py-20 border border-gray-800">
              <p className="text-4xl mb-4">🔍</p>
              <p className="text-gray-500 tracking-widest text-sm">No results found for "{query}"</p>
              <p className="text-gray-700 text-xs mt-2 tracking-widest">Try searching for sarees, kurtas, jewellery, footwear</p>
            </div>
          ) : (
            <div>
              <p className="text-xs tracking-widest text-gray-500 mb-6">{results.length} RESULTS FOR "{query.toUpperCase()}"</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {results.map((product) => (
                  <a key={product.id} href={`/product/${product.id}`} className="group cursor-pointer">
                    <div className="bg-gray-900 aspect-square flex items-center justify-center border border-gray-800 group-hover:border-gray-500 transition mb-3">
                      {product.image_url ? (
                        <img src={product.image_url} alt={product.name} className="w-full h-full object-cover"/>
                      ) : (
                        <span className="text-gray-700 text-xs">IMAGE</span>
                      )}
                    </div>
                    <p className="text-sm font-bold tracking-widest mb-2">{product.name}</p>
                    <Price amountINR={product.priceINR} className="text-sm font-bold"/>
                  </a>
                ))}
              </div>
            </div>
          )
        )}

        {!searched && (
          <div>
            <p className="text-xs tracking-widest text-gray-500 mb-6">POPULAR SEARCHES</p>
            <div className="flex gap-3 flex-wrap">
              {["Kanchipuram Saree", "Silk Saree", "Kurta", "Lehenga", "Sherwani", "Jewellery", "Kolhapuri", "Custom Blouse"].map((term) => (
                <button key={term} onClick={() => { setQuery(term); handleSearch(); }} className="border border-gray-700 px-4 py-2 text-xs tracking-widest text-gray-400 hover:border-white hover:text-white transition">
                  {term}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
