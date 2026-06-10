import { getAllProducts } from "@/app/lib/products";
import Link from "next/link";
import Price from "@/app/components/Price";

export default async function ProductsPage() {
  const products = await getAllProducts();

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-gray-800 p-8">
        <h1 className="text-4xl font-bold mb-2">PRODUCTS</h1>
        <p className="text-gray-400">Explore our custom collection</p>
      </div>

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto p-8">
        {products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400">No products available</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product) => (
              <Link
                key={product.id}
                href={`/product/${product.id}`}
                className="group cursor-pointer"
              >
                {/* Product Card */}
                <div className="bg-gray-900 rounded aspect-square mb-4 overflow-hidden group-hover:bg-gray-800 transition">
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-600">
                      No image
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <h3 className="text-lg font-semibold mb-2 group-hover:text-gray-300 transition">
                  {product.name}
                </h3>
                <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                  {product.description}
                </p>
                <p className="text-xl font-bold">
                  <Price amountINR={product.priceINR} />
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}