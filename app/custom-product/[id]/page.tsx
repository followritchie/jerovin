"use client";
import { useState, useEffect, use } from "react";
import { Heart, ChevronLeft, ChevronRight } from "lucide-react";
import Nav from "../../components/Nav";
import Price from "../../components/Price";
import { addToCart, toggleWishlist, isWishlisted } from "../../lib/store";

const BLOUSE_SIZES = ["28","30","32","34","36","38","40","42","44","CUSTOM"];
const LEHENGA_SIZES = ["XS","S","M","L","XL","XXL","CUSTOM"];
const COLORS = ["#000000","#FFFFFF","#8B0000","#FFD700","#006400","#000080","#FF69B4","#FFA500","#800080","#A52A2A","#D4AF37","#C41E3A"];

const BLOUSE_MEASUREMENTS = [
  {key:"chest",label:"Chest (inches)",placeholder:"e.g. 36"},
  {key:"waist",label:"Waist (inches)",placeholder:"e.g. 32"},
  {key:"hips",label:"Hips (inches)",placeholder:"e.g. 38"},
  {key:"shoulderWidth",label:"Shoulder Width (inches)",placeholder:"e.g. 14"},
  {key:"sleeveLength",label:"Sleeve Length (inches)",placeholder:"e.g. 6"},
  {key:"blouseLength",label:"Blouse Length (inches)",placeholder:"e.g. 15"},
  {key:"neckDepthFront",label:"Neck Depth Front (inches)",placeholder:"e.g. 5"},
  {key:"neckDepthBack",label:"Neck Depth Back (inches)",placeholder:"e.g. 7"},
  {key:"armhole",label:"Armhole (inches)",placeholder:"e.g. 16"},
];

const LEHENGA_MEASUREMENTS = [
  {key:"waist",label:"Waist (inches)",placeholder:"e.g. 32"},
  {key:"hips",label:"Hips (inches)",placeholder:"e.g. 40"},
  {key:"lehengaLength",label:"Lehenga Length (inches)",placeholder:"e.g. 42"},
  {key:"choliChest",label:"Choli Chest (inches)",placeholder:"e.g. 36"},
  {key:"choliLength",label:"Choli Length (inches)",placeholder:"e.g. 14"},
  {key:"choliSleeve",label:"Choli Sleeve Length (inches)",placeholder:"e.g. 5"},
];

export default function CustomProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("#000000");
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState("");
  const [referenceImageFiles, setReferenceImageFiles] = useState<File[]>([]);
  const [referenceImagePreviews, setReferenceImagePreviews] = useState<string[]>([]);
  const [measurements, setMeasurements] = useState<Record<string,string>>({});
  const [wishlisted, setWishlisted] = useState(false);
  const [added, setAdded] = useState(false);
  const [currentImage, setCurrentImage] = useState(0);
  const [measurementType, setMeasurementType] = useState<"standard"|"custom">("standard");

  useEffect(() => {
    fetch(`/api/products/${id}`)
      .then(r=>r.json())
      .then(data=>{
        if(data&&!data.error){setProduct(data);setWishlisted(isWishlisted(data.id));}
        setLoading(false);
      }).catch(()=>setLoading(false));
  },[id]);

  const isLehenga = product?.category_id?.includes("lehenga");
  const measurementFields = isLehenga ? LEHENGA_MEASUREMENTS : BLOUSE_MEASUREMENTS;
  const sizes = isLehenga ? LEHENGA_SIZES : BLOUSE_SIZES;

  const handleRefImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files||[]);
    if (files.length) {
      setReferenceImageFiles(prev=>[...prev, ...files]);
      files.forEach(file=>{
        const reader = new FileReader();
        reader.onload = ev => setReferenceImagePreviews(prev=>[...prev, ev.target?.result as string]);
        reader.readAsDataURL(file);
      });
    }
  };
  const removeRefImage = (idx:number) => {
    setReferenceImageFiles(prev=>prev.filter((_,i)=>i!==idx));
    setReferenceImagePreviews(prev=>prev.filter((_,i)=>i!==idx));
  };

  const handleAddToCart = async () => {
    if (!selectedSize) { alert("Please select a size"); return; }
    if (measurementType==="custom" && Object.keys(measurements).length===0) { alert("Please enter at least one measurement"); return; }

    const images = product?.media?.filter((m:any)=>m.type==="image").map((m:any)=>m.url)||[];
    const firstImage = images[0]||"";

    // Upload all reference images if provided
    const refImageUrls: string[] = [];
    for (const file of referenceImageFiles) {
      try {
        const fd = new FormData();
        fd.append("file", file);
        fd.append("fileName", file.name);
        const res = await fetch("/api/upload", {method:"POST", body:fd});
        const data = await res.json();
        if (data.url) refImageUrls.push(data.url);
      } catch {}
    }

    const customDetails = {
      measurements: measurementType==="custom" ? measurements : {size: selectedSize},
      color: selectedColor,
      specialInstructions: message,
      referenceImageUrls: refImageUrls,
      measurementType,
    };

    addToCart({
      id: product.id,
      name: product.name,
      price: product.priceINR,
      original: product.comparePriceINR||product.priceINR,
      image: firstImage,
      quantity,
      size: measurementType==="custom" ? `CUSTOM (${Object.entries(measurements).slice(0,2).map(([k,v])=>`${k}:${v}`).join(", ")})` : selectedSize,
      color: selectedColor,
    });

    // Store custom details in localStorage for checkout
    const existing = JSON.parse(localStorage.getItem("jerovin_custom_orders")||"{}");
    existing[product.id] = customDetails;
    localStorage.setItem("jerovin_custom_orders", JSON.stringify(existing));

    setAdded(true);
    setTimeout(()=>setAdded(false),2000);
    window.dispatchEvent(new Event("cartUpdated"));
  };

  const handleWishlist = () => {
    const images = product?.media?.filter((m:any)=>m.type==="image").map((m:any)=>m.url)||[];
    const r = toggleWishlist({id:product.id,name:product.name,price:product.priceINR,original:product.comparePriceINR||product.priceINR,image:images[0]||""});
    setWishlisted(r);
  };

  if (loading) return <main className="min-h-screen bg-black text-white flex items-center justify-center"><Nav/><div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"/></main>;
  if (!product) return <main className="min-h-screen bg-black text-white"><Nav/><div className="flex items-center justify-center h-96"><p className="text-gray-500 text-xs tracking-widest">PRODUCT NOT FOUND</p></div></main>;

  const allMedia = product.media||[];
  const displayMedia = allMedia.map((m:any)=>({url:m.url,type:m.type||"image"}));

  return (
    <main className="min-h-screen bg-black text-white pb-16 lg:pb-0">
      <Nav/>
      <div className="px-6 md:px-10 py-4 text-xs tracking-widest text-gray-500">
        <a href="/" className="hover:text-white">HOME</a><span className="mx-2">›</span>
        <a href={`/${product.category_id?.split("-")[0]}`} className="hover:text-white capitalize">{product.category_id?.split("-")[0]?.toUpperCase()}</a>
        <span className="mx-2">›</span><span className="text-white">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 px-6 md:px-10 py-4 max-w-7xl mx-auto">
        {/* Images */}
        <div className="flex flex-col gap-3">
          <div className="relative overflow-hidden group" style={{aspectRatio:"3/4"}}>
            {displayMedia.length>0
              ? displayMedia[currentImage].type==="video"
                ? <video src={displayMedia[currentImage].url} className="w-full h-full object-cover" autoPlay muted loop playsInline/>
                : <img src={displayMedia[currentImage].url} alt={product.name} className="w-full h-full object-cover"/>
              : <div className="w-full h-full bg-gray-900 flex items-center justify-center text-gray-700 text-xs">NO IMAGE</div>
            }
            {displayMedia.length>1&&(
              <>
                <button onClick={()=>setCurrentImage(p=>p===0?displayMedia.length-1:p-1)} className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black bg-opacity-60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition"><ChevronLeft size={16}/></button>
                <button onClick={()=>setCurrentImage(p=>p===displayMedia.length-1?0:p+1)} className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black bg-opacity-60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition"><ChevronRight size={16}/></button>
              </>
            )}
            <div className="absolute top-3 left-3 bg-white text-black text-xs px-2 py-1 tracking-widest font-bold">CUSTOM ORDER</div>
          </div>
          {displayMedia.length>1&&(
            <div className="grid grid-cols-5 gap-2">
              {displayMedia.slice(0,5).map((m:any,i:number)=>(
                <div key={i} onClick={()=>setCurrentImage(i)} className={`aspect-square overflow-hidden cursor-pointer border-2 transition ${i===currentImage?"border-white":"border-transparent hover:border-gray-500"}`}>
                  {m.type==="video"?<video src={m.url} className="w-full h-full object-cover" muted/>:<img src={m.url} alt="" className="w-full h-full object-cover"/>}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="flex flex-col gap-5">
          <div>
            <p className="text-xs tracking-widest text-gray-500 mb-1">{product.category_id?.toUpperCase()} — MADE TO ORDER</p>
            <h1 className="text-2xl font-bold tracking-widest mb-3">{product.name}</h1>
            <div className="flex items-center gap-4">
              {product.comparePriceINR&&<Price amountINR={product.comparePriceINR} className="text-gray-500 line-through text-sm" strikethrough/>}
              <Price amountINR={product.priceINR} className="text-2xl font-bold"/>
            </div>
            <p className="text-xs text-gray-500 mt-1 tracking-widest">TAXES INCLUDED · FREE INDIA SHIPPING · 15-21 DAYS DELIVERY</p>
          </div>

          {product.description&&<p className="text-gray-400 text-sm leading-relaxed">{product.description}</p>}

          {/* Color */}
          <div>
            <p className="text-xs tracking-widest text-gray-500 mb-3">SELECT COLOUR</p>
            <div className="flex gap-2 flex-wrap mb-3">
              {COLORS.map(c=>(
                <button key={c} onClick={()=>setSelectedColor(c)} className="w-8 h-8 rounded-full border-2 transition flex-shrink-0" style={{background:c,borderColor:selectedColor===c?"#fff":"#444"}}/>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-500 tracking-widest">CUSTOM HEX:</span>
              <input type="text" value={selectedColor} onChange={e=>setSelectedColor(e.target.value)} className="bg-black border border-gray-700 text-white px-3 py-1.5 text-xs w-24 outline-none focus:border-white transition"/>
              <input type="color" value={selectedColor} onChange={e=>setSelectedColor(e.target.value)} className="w-8 h-8 border-none cursor-pointer bg-transparent"/>
              <div className="w-8 h-8 rounded-full border-2 border-gray-600" style={{background:selectedColor}}/>
            </div>
          </div>

          {/* Size/Measurement */}
          <div>
            <div className="flex gap-4 mb-3">
              <button onClick={()=>setMeasurementType("standard")} className={`text-xs tracking-widest py-1.5 border-b-2 transition ${measurementType==="standard"?"border-white text-white":"border-transparent text-gray-500 hover:text-gray-300"}`}>STANDARD SIZES</button>
              <button onClick={()=>setMeasurementType("custom")} className={`text-xs tracking-widest py-1.5 border-b-2 transition ${measurementType==="custom"?"border-white text-white":"border-transparent text-gray-500 hover:text-gray-300"}`}>CUSTOM MEASUREMENTS</button>
            </div>
            {measurementType==="standard"?(
              <div className="flex gap-2 flex-wrap">
                {sizes.map(s=>(
                  <button key={s} onClick={()=>setSelectedSize(s)} className={`px-4 py-2.5 text-xs tracking-widest border transition ${selectedSize===s?"border-white bg-white text-black":"border-gray-700 text-gray-500 hover:border-gray-400"}`}>{s}</button>
                ))}
              </div>
            ):(
              <div className="grid grid-cols-2 gap-3">
                {measurementFields.map(f=>(
                  <div key={f.key}>
                    <label className="text-xs text-gray-500 tracking-widest mb-1 block">{f.label}</label>
                    <input type="number" step="0.5" placeholder={f.placeholder} value={measurements[f.key]||""} onChange={e=>setMeasurements(m=>({...m,[f.key]:e.target.value}))} className="w-full bg-black border border-gray-700 text-white px-3 py-2 text-xs outline-none focus:border-white transition"/>
                  </div>
                ))}
                <div className="col-span-2">
                  <p className="text-xs text-gray-600 tracking-widest">💡 Tip: Measure while wearing a well-fitted inner garment. Add 0.5-1 inch for comfort.</p>
                </div>
              </div>
            )}
          </div>

          {/* Reference Images */}
          <div>
            <p className="text-xs tracking-widest text-gray-500 mb-2">REFERENCE IMAGES <span className="text-gray-700">(for seller — not added to product)</span></p>
            <label className="block border border-dashed border-gray-700 p-4 text-center cursor-pointer hover:border-gray-400 transition rounded mb-2">
              <input type="file" accept="image/*" multiple onChange={handleRefImage} className="hidden"/>
              <p className="text-xs text-gray-500 tracking-widest">UPLOAD REFERENCE IMAGES</p>
              <p className="text-xs text-gray-700 mt-1">Share as many design inspirations as you like</p>
            </label>
            {referenceImagePreviews.length>0&&(
              <div className="grid grid-cols-4 gap-2">
                {referenceImagePreviews.map((preview,idx)=>(
                  <div key={idx} className="relative aspect-square">
                    <img src={preview} alt={`Reference ${idx+1}`} className="w-full h-full object-cover rounded"/>
                    <button onClick={()=>removeRefImage(idx)} className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-600 rounded-full flex items-center justify-center text-xs text-white">×</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Special Instructions */}
          <div>
            <p className="text-xs tracking-widest text-gray-500 mb-2">SPECIAL INSTRUCTIONS</p>
            <textarea value={message} onChange={e=>setMessage(e.target.value)} placeholder="Describe embroidery style, fabric preference, occasion, any specific design elements..." rows={3} className="w-full bg-black border border-gray-700 text-white px-4 py-3 text-xs tracking-widest outline-none resize-none placeholder-gray-700 focus:border-white transition"/>
          </div>

          {/* Quantity */}
          <div>
            <p className="text-xs tracking-widest text-gray-500 mb-2">QUANTITY</p>
            <div className="flex items-center border border-gray-700 w-fit">
              <button onClick={()=>setQuantity(Math.max(1,quantity-1))} className="w-10 h-10 hover:bg-gray-800 transition flex items-center justify-center">−</button>
              <span className="text-sm w-10 h-10 flex items-center justify-center border-x border-gray-700">{quantity}</span>
              <button onClick={()=>setQuantity(quantity+1)} className="w-10 h-10 hover:bg-gray-800 transition flex items-center justify-center">+</button>
            </div>
          </div>

          {/* CTAs */}
          <div className="flex flex-col gap-3">
            <button onClick={handleAddToCart} className={`w-full py-4 text-xs tracking-widest font-bold transition ${added?"bg-gray-300 text-black":"bg-white text-black hover:bg-gray-200"}`}>
              {added?"✓ ADDED TO BAG":"ADD TO BAG"}
            </button>
            <button onClick={handleWishlist} className={`w-full py-4 text-xs tracking-widest border transition flex items-center justify-center gap-2 ${wishlisted?"border-white text-white":"border-gray-600 text-gray-400 hover:border-white hover:text-white"}`}>
              <Heart size={14} strokeWidth={1.5} fill={wishlisted?"#fff":"none"}/>
              {wishlisted?"SAVED TO WISHLIST":"ADD TO WISHLIST"}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 border border-gray-800 p-4">
            <p className="text-xs tracking-widest text-gray-500">✂️ MADE TO ORDER</p>
            <p className="text-xs tracking-widest text-gray-500">📏 CUSTOM MEASUREMENTS</p>
            <p className="text-xs tracking-widest text-gray-500">🚚 FREE INDIA SHIPPING</p>
            <p className="text-xs tracking-widest text-gray-500">🔒 SECURE PAYMENT</p>
          </div>
        </div>
      </div>
    </main>
  );
}
