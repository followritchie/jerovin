import Link from "next/link";
import Price from "./Price";
import Nav from "./Nav";

interface Product {
  id: number;
  name: string;
  priceINR: number;
  comparePriceINR?: number | null;
  category_id?: string;
  media?: { url: string; type: string }[];
  image?: string;
}

interface Breadcrumb { name: string; href: string; }

interface Props {
  products: Product[];
  breadcrumbs: Breadcrumb[];
  isCustom?: boolean;
}

export default function CategoryPage({ products, breadcrumbs, isCustom }: Props) {
  return (
    <main className="min-h-screen bg-black text-white pb-20 lg:pb-0">
      <Nav/>
      {/* Slim breadcrumb only — no big heading */}
      <div className="px-6 md:px-12 py-3 border-b border-gray-900 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs tracking-widest text-gray-600">
          <a href="/" className="hover:text-white transition">HOME</a>
          {breadcrumbs.map((b, i) => (
            <span key={i} className="flex items-center gap-1.5">
              <span>›</span>
              {i === breadcrumbs.length - 1
                ? <span className="text-gray-400">{b.name.toUpperCase()}</span>
                : <a href={b.href} className="hover:text-white transition">{b.name.toUpperCase()}</a>
              }
            </span>
          ))}
        </div>
        <span className="text-xs text-gray-700 tracking-widest">{products.length} PRODUCTS</span>
      </div>

      {products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32">
          <p className="text-gray-700 text-xs tracking-widest mb-6">NO PRODUCTS YET</p>
          <a href="/" className="text-xs tracking-widest border border-gray-800 px-8 py-3 hover:border-white hover:text-white transition">CONTINUE SHOPPING</a>
        </div>
      ) : (
        <div className="px-4 md:px-8 py-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-px bg-gray-900">
            {products.map(p => {
              const allMedia = p.media || [];
              const images = allMedia.filter(m => m.type === "image").map(m => m.url);
              const firstImg = images[0] || p.image || "";
              const secondImg = images[1] || firstImg;
              const productLink = isCustom ? `/custom-product/${p.id}` : `/product/${p.id}`;
              return (
                <Link key={p.id} href={productLink} className="group bg-black block relative overflow-hidden">
                  {/* Image container — tall portrait ratio like luxury fashion sites */}
                  <div className="relative overflow-hidden" style={{paddingBottom:"133%"}}>
                    {firstImg ? (
                      <>
                        <img
                          src={firstImg}
                          alt={p.name}
                          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500 group-hover:opacity-0"
                        />
                        {secondImg && secondImg !== firstImg && (
                          <img
                            src={secondImg}
                            alt={p.name}
                            className="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                          />
                        )}
                      </>
                    ) : (
                      <div className="absolute inset-0 bg-gray-950 flex items-center justify-center">
                        <span className="text-gray-800 text-xs tracking-widest">NO IMAGE</span>
                      </div>
                    )}
                    {isCustom && (
                      <div className="absolute top-2 left-2 bg-white text-black text-xs px-2 py-0.5 tracking-widest font-bold">CUSTOM</div>
                    )}
                    {p.comparePriceINR && p.comparePriceINR > p.priceINR && (
                      <div className="absolute top-2 right-2 bg-black bg-opacity-80 text-white text-xs px-2 py-0.5 tracking-widest">
                        -{Math.round((1 - p.priceINR / p.comparePriceINR) * 100)}%
                      </div>
                    )}
                  </div>
                  {/* Product info — minimal */}
                  <div className="p-3">
                    <p className="text-xs font-medium tracking-wide text-white truncate group-hover:text-gray-300 transition leading-snug">{p.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Price amountINR={p.priceINR} className="text-xs font-bold text-white"/>
                      {p.comparePriceINR && p.comparePriceINR > p.priceINR && (
                        <Price amountINR={p.comparePriceINR} className="text-xs text-gray-600" strikethrough/>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </main>
  );
}
