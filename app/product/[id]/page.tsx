"use client";
import { useState, useEffect, use } from "react";
import { Heart, ChevronLeft, ChevronRight, X, ZoomIn } from "lucide-react";
import Nav from "../../components/Nav";
import Price from "../../components/Price";
import { addToCart, toggleWishlist, isWishlisted } from "../../lib/store";

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [currentImage, setCurrentImage] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);
  const [added, setAdded] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/products/${id}`)
      .then(r => r.json())
      .then(data => {
        if (data && !data.error) {
          setProduct(data);
          setWishlisted(isWishlisted(data.id));
        } else {
          setError("Product not found");
        }
        setLoading(false);
      })
      .catch(() => { setError("Failed to load product"); setLoading(false); });
  }, [id]);

  if (loading) return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center">
      <Nav />
      <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
    </main>
  );

  if (error || !product) return (
    <main className="min-h-screen bg-black text-white">
      <Nav />
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <p className="text-gray-500 text-xs tracking-widest">PRODUCT NOT FOUND</p>
        <a href="/" className="text-xs tracking-widest border border-gray-700 px-6 py-3 hover:border-white hover:text-white transition">BACK TO HOME</a>
      </div>
    </main>
  );

  const allMedia: any[] = product.media || [];
  const displayMedia = allMedia.map((m: any) => ({ url: m.url, type: m.type || "image" }));
  const images = allMedia.filter((m: any) => m.type === "image").map((m: any) => m.url);
  const firstImage = images[0] || displayMedia[0]?.url || "";

  // Detect saree / jewellery / snacks — no size needed
  const noSizeCategories = ["saree", "jewellery", "snack", "gift", "parcel", "handicraft"];
  const needsSize = !noSizeCategories.some(cat =>
    product.category_id?.toLowerCase().includes(cat) ||
    product.name?.toLowerCase().includes(cat)
  ) && !product.isCustom;

  const sizes = ["XS", "S", "M", "L", "XL", "XXL"];

  const handleAddToCart = () => {
    if (needsSize && !selectedSize) {
      alert("Please select a size");
      return;
    }
    addToCart({
      id: product.id,
      name: product.name,
      price: product.priceINR,
      original: product.comparePriceINR || product.priceINR,
      image: firstImage,
      quantity,
      size: selectedSize || undefined,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
    window.dispatchEvent(new Event("cartUpdated"));
  };

  const handleWishlist = () => {
    const r = toggleWishlist({
      id: product.id,
      name: product.name,
      price: product.priceINR,
      original: product.comparePriceINR || product.priceINR,
      image: firstImage,
    });
    setWishlisted(r);
  };

  const prevImg = (e?: any) => { e?.stopPropagation(); setCurrentImage(p => p === 0 ? displayMedia.length - 1 : p - 1); };
  const nextImg = (e?: any) => { e?.stopPropagation(); setCurrentImage(p => p === displayMedia.length - 1 ? 0 : p + 1); };

  const MediaItem = ({ src, type, cls }: { src: string; type: string; cls: string }) =>
    type === "video"
      ? <video src={src} className={cls} autoPlay muted loop playsInline controls={false} />
      : <img src={src} alt={product.name} className={cls} />;

  return (
    <main className="min-h-screen bg-black text-white pb-16 lg:pb-0">
      <Nav />

      {/* Breadcrumb */}
      <div className="px-6 md:px-10 py-4 text-xs tracking-widest text-gray-500">
        <a href="/" className="hover:text-white">HOME</a>
        <span className="mx-2">→</span>
        <a href={`/${product.category_id?.split("-")[0] || "products"}`} className="hover:text-white capitalize">
          {product.category_id?.split("-")[0]?.toUpperCase() || "PRODUCTS"}
        </a>
        <span className="mx-2">→</span>
        <span className="text-white">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 px-6 md:px-10 py-4 max-w-7xl mx-auto">

        {/* Media Gallery */}
        <div className="flex flex-col gap-3">
          <div
            className="relative overflow-hidden cursor-zoom-in group"
            style={{ aspectRatio: "3/4" }}
            onClick={() => setLightboxOpen(true)}
          >
            {displayMedia.length > 0 ? (
              <MediaItem
                src={displayMedia[currentImage].url}
                type={displayMedia[currentImage].type}
                cls="w-full h-full object-cover group-hover:scale-105 transition duration-700"
              />
            ) : (
              <div className="w-full h-full bg-gray-900 flex items-center justify-center text-gray-700 text-xs">NO IMAGE</div>
            )}
            {displayMedia.length > 1 && (
              <>
                <button onClick={prevImg} className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black bg-opacity-60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition"><ChevronLeft size={16} /></button>
                <button onClick={nextImg} className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black bg-opacity-60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition"><ChevronRight size={16} /></button>
              </>
            )}
            <div className="absolute top-3 right-3 w-8 h-8 bg-white bg-opacity-80 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
              <ZoomIn size={14} color="#000" />
            </div>
          </div>

          {/* Thumbnails */}
          {displayMedia.length > 1 && (
            <div className="grid grid-cols-5 gap-2">
              {displayMedia.slice(0, 5).map((m: any, i: number) => (
                <div
                  key={i}
                  onClick={() => setCurrentImage(i)}
                  className={`aspect-square overflow-hidden cursor-pointer border-2 transition ${i === currentImage ? "border-white" : "border-transparent hover:border-gray-500"}`}
                >
                  {m.type === "video"
                    ? <video src={m.url} className="w-full h-full object-cover" muted />
                    : <img src={m.url} alt="" className="w-full h-full object-cover" />}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="flex flex-col gap-5">
          <div>
            <p className="text-xs tracking-widest text-gray-500 mb-2">{product.category_id?.toUpperCase()}</p>
            <h1 className="text-2xl md:text-3xl font-bold tracking-widest mb-4">{product.name}</h1>
            <div className="flex items-center gap-4 mb-1">
              {product.comparePriceINR && (
                <Price amountINR={product.comparePriceINR} className="text-gray-500 line-through text-sm" strikethrough />
              )}
              <Price amountINR={product.priceINR} className="text-2xl font-bold" />
            </div>
            <p className="text-xs text-gray-500 tracking-widest">TAXES INCLUDED — SHIPPING CALCULATED AT CHECKOUT</p>
          </div>

          {product.description && (
            <p className="text-gray-400 text-sm leading-relaxed">{product.description}</p>
          )}

          {/* Size selector */}
          {needsSize && (
            <div>
              <p className="text-xs tracking-widest text-gray-500 mb-3">SELECT SIZE</p>
              <div className="flex gap-2 flex-wrap">
                {sizes.map(s => (
                  <button
                    key={s}
                    onClick={() => setSelectedSize(s)}
                    className={`px-4 py-3 text-xs tracking-widest border transition ${selectedSize === s ? "border-white bg-white text-black" : "border-gray-700 text-gray-500 hover:border-gray-400"}`}
                  >{s}</button>
                ))}
              </div>
            </div>
          )}

          {/* Custom product CTA */}
          {product.isCustom && (
            <div className="border border-gray-700 p-4">
              <p className="text-xs tracking-widest text-gray-400 mb-3">THIS IS A CUSTOMIZABLE PRODUCT</p>
              <a href="/custom-order" className="block w-full text-center py-3 text-xs tracking-widest border border-white hover:bg-white hover:text-black transition">
                REQUEST CUSTOMIZATION
              </a>
            </div>
          )}

          {/* Quantity */}
          <div>
            <p className="text-xs tracking-widest text-gray-500 mb-3">QUANTITY</p>
            <div className="flex items-center border border-gray-700 w-fit">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-10 hover:bg-gray-800 transition flex items-center justify-center">−</button>
              <span className="text-sm w-10 h-10 flex items-center justify-center border-x border-gray-700">{quantity}</span>
              <button onClick={() => setQuantity(quantity + 1)} className="w-10 h-10 hover:bg-gray-800 transition flex items-center justify-center">+</button>
            </div>
          </div>

          {/* CTAs */}
          <div className="flex flex-col gap-3">
            <button
              onClick={handleAddToCart}
              className={`w-full py-4 text-xs tracking-widest font-bold transition ${added ? "bg-gray-300 text-black" : "bg-white text-black hover:bg-gray-200"}`}
            >
              {added ? "✓ ADDED TO BAG" : "ADD TO BAG"}
            </button>
            <button
              onClick={handleWishlist}
              className={`w-full py-4 text-xs tracking-widest border transition flex items-center justify-center gap-2 ${wishlisted ? "border-white text-white" : "border-gray-600 text-gray-400 hover:border-white hover:text-white"}`}
            >
              <Heart size={14} strokeWidth={1.5} fill={wishlisted ? "#fff" : "none"} />
              {wishlisted ? "SAVED TO WISHLIST" : "ADD TO WISHLIST"}
            </button>
          </div>

          {/* Trust badges */}
          <div className="grid grid-cols-2 gap-3 border border-gray-800 p-4">
            <p className="text-xs tracking-widest text-gray-500">🚚 FREE INDIA SHIPPING</p>
            <p className="text-xs tracking-widest text-gray-500">🌍 WORLDWIDE DELIVERY</p>
            <p className="text-xs tracking-widest text-gray-500">↩️ 7 DAY RETURNS</p>
            <p className="text-xs tracking-widest text-gray-500">🔒 SECURE PAYMENT</p>
          </div>

          {/* Tags */}
          {product.tags && (
            <div className="flex flex-wrap gap-2">
              {product.tags.split(",").map((t: string, i: number) => (
                <span key={i} className="text-xs text-gray-600 border border-gray-800 px-2 py-1">{t.trim()}</span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Lightbox */}
      {lightboxOpen && displayMedia.length > 0 && (
        <div
          className="fixed inset-0 bg-black bg-opacity-98 z-50 flex items-center justify-center"
          onClick={() => setLightboxOpen(false)}
        >
          <button onClick={() => setLightboxOpen(false)} className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center hover:bg-gray-800 rounded-full transition">
            <X size={20} />
          </button>
          {displayMedia.length > 1 && (
            <button onClick={prevImg} className="absolute left-4 w-10 h-10 flex items-center justify-center hover:bg-gray-800 rounded-full transition">
              <ChevronLeft size={24} />
            </button>
          )}
          <MediaItem
            src={displayMedia[currentImage].url}
            type={displayMedia[currentImage].type}
            cls="max-h-screen max-w-3xl object-contain px-16"
          />
          {displayMedia.length > 1 && (
            <button onClick={nextImg} className="absolute right-4 w-10 h-10 flex items-center justify-center hover:bg-gray-800 rounded-full transition">
              <ChevronRight size={24} />
            </button>
          )}
          <p className="absolute bottom-6 text-xs text-gray-500 tracking-widest">{currentImage + 1} / {displayMedia.length}</p>
        </div>
      )}
    </main>
  );
}
