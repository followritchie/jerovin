import { getProductsByCategory } from "@/app/lib/products";
import Link from "next/link";
import Price from "@/app/components/Price";
import Nav from "@/app/components/Nav";
export const revalidate = 0;
export default async function Page() {
  const products = await getProductsByCategory("parcels");
  return (
    <main className="min-h-screen bg-black text-white">
      <Nav/>
      <div className="border-b border-gray-800 p-8">
        <h1 className="text-4xl font-bold tracking-widest mb-2">PARCELS</h1>
        <p className="text-gray-400 text-xs tracking-widest">{products.length} products</p>
      </div>
      <div className="max-w-7xl mx-auto p-8">
        {products.length===0?(
          <div className="text-center py-24">
            <p className="text-gray-500 text-xs tracking-widest mb-4">No products in this category yet</p>
            <a href="/products" className="text-xs tracking-widest border border-gray-700 px-6 py-3 hover:border-white hover:text-white transition">VIEW ALL PRODUCTS</a>
          </div>
        ):(
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map(p=>{
              const img=p.media?.find(m=>m.type==="image")?.url||p.image;
              return (
                <Link key={p.id} href={`/product/${p.id}`} className="group cursor-pointer">
                  <div className="bg-gray-900 rounded aspect-square mb-3 overflow-hidden">
                    {img?<img src={img} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-500"/>:<div className="w-full h-full flex items-center justify-center text-gray-700 text-xs">NO IMAGE</div>}
                  </div>
                  <p className="text-xs text-gray-500 tracking-widest mb-1">{p.category_id?.toUpperCase()||""}</p>
                  <h3 className="text-sm font-semibold mb-1 group-hover:text-gray-300 transition truncate">{p.name}</h3>
                  <div className="flex items-center gap-3">
                    {p.comparePriceINR&&<Price amountINR={p.comparePriceINR} strikethrough className="text-xs text-gray-500"/>}
                    <Price amountINR={p.priceINR} className="text-sm font-bold"/>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
