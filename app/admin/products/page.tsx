"use client";
import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { X, Upload, Plus, Eye, Check, AlertCircle, Download, FileSpreadsheet, ChevronLeft, Trash2, Globe, LayoutDashboard, Package2, ShoppingBag, Users, Store, UserCog, BarChart3, ShieldCheck, Image as ImageIcon, ArrowLeft } from "lucide-react";
import * as XLSX from "xlsx";

const CATS = [
  { id:"women", name:"WOMEN", sub:[
    { id:"women-sarees", name:"Sarees", sub:[
      { id:"women-sarees-designer", name:"Designer Sarees" },
      { id:"women-sarees-uppada", name:"Uppada Silk Sarees" },
      { id:"women-sarees-kanjivaram", name:"Kanjivaram Silk Sarees" },
    ]},
    { id:"women-lehengas", name:"Lehengas", sub:[] },
    { id:"women-blouses", name:"Blouses", sub:[] },
    { id:"women-kurta-sets", name:"Kurta Sets", sub:[] },
  ]},
  { id:"men", name:"MEN", sub:[
    { id:"men-sherwanis", name:"Sherwanis", sub:[] },
    { id:"men-kurtas", name:"Kurtas", sub:[] },
    { id:"men-blazers", name:"Blazers", sub:[] },
    { id:"men-indo-western", name:"Indo Western", sub:[] },
  ]},
  { id:"kids", name:"KIDS", sub:[
    { id:"kids-boys", name:"Boys", sub:[] },
    { id:"kids-girls", name:"Girls", sub:[] },
  ]},
  { id:"jewellery", name:"JEWELLERY", sub:[
    { id:"jewellery-rings", name:"Rings", sub:[] },
    { id:"jewellery-earrings", name:"Earrings", sub:[] },
    { id:"jewellery-pendants", name:"Pendants", sub:[] },
    { id:"jewellery-clips", name:"Clips", sub:[] },
  ]},
  { id:"footwear", name:"FOOTWEAR", sub:[] },
  { id:"gifts", name:"CUSTOM GIFTS", sub:[] },
  { id:"parcels", name:"PARCELS", sub:[] },
  { id:"snacks", name:"SNACKS", sub:[] },
  { id:"handicrafts", name:"HANDICRAFTS", sub:[] },
];

interface Media { url:string; type:string; name:string; done:boolean; error?:boolean }
const blank = () => ({ name:"",description:"",roughNotes:"",priceINR:"",comparePriceINR:"",brand:"Jerovin",stock:"10",sku:"",shipping:"free",indiaShipping:"0",internationalShipping:"2800",isCustom:false,seoTitle:"",seoDescription:"",tags:"",cat1:"",cat2:"",cat3:"" });

function AdminProductsInner() {
  const [view, setView] = useState<"list"|"drafts"|"add">("list");
  const [live, setLive] = useState<any[]>([]);
  const [drafts, setDrafts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [seoLoading, setSeoLoading] = useState(false);
  const [media, setMedia] = useState<Media[]>([]);
  const [form, setForm] = useState(blank());
  const [errs, setErrs] = useState<Record<string,string>>({});
  const [toast, setToast] = useState<{msg:string,ok:boolean}|null>(null);
  const [bulkBusy, setBulkBusy] = useState(false);
  const [bulkMsg, setBulkMsg] = useState("");
  const [preview, setPreview] = useState<any>(null);
  const [selectedLive, setSelectedLive] = useState<number[]>([]);
  const [selectedDrafts, setSelectedDrafts] = useState<number[]>([]);
  const [search, setSearch] = useState("");
  const [productCatFilter, setProductCatFilter] = useState("all");
  const [editProduct, setEditProduct] = useState<any>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const bulkRef = useRef<HTMLInputElement>(null);

  const pop = (msg:string, ok=true) => { setToast({msg,ok}); setTimeout(()=>setToast(null),4000); };

  const load = async () => {
    setLoading(true);
    try {
      const [l,d] = await Promise.all([
        fetch("/api/products").then(r=>r.json()).catch(()=>[]),
        fetch("/api/product-drafts?status=draft").then(r=>r.json()).catch(()=>[]),
      ]);
      setLive(Array.isArray(l)?l:[]);
      setDrafts(Array.isArray(d)?d:[]);
    } catch {}
    setLoading(false);
  };

  const searchParams = useSearchParams();
  useEffect(()=>{ load(); },[]);
  useEffect(()=>{
    const editId = searchParams.get("edit");
    if (editId && live.length > 0) {
      const found = live.find((p:any) => String(p.id) === editId);
      if (found) setEditProduct(found);
    }
  },[searchParams, live]);

  const cat1data = CATS.find(c=>c.id===form.cat1);
  const cat2data = (cat1data?.sub||[]).find((s:any)=>s.id===form.cat2) as any;
  const finalCat = form.cat3||form.cat2||form.cat1;

  const handleFiles = async (e:React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files||[]);
    if (!files.length) return;
    if (errs.media) setErrs(p=>({...p,media:""}));
    for (const file of files) {
      const localUrl = URL.createObjectURL(file);
      const isVid = file.type.startsWith("video/");
      const entry: Media = {url:localUrl,type:isVid?"video":"image",name:file.name,done:false};
      setMedia(prev=>[...prev,entry]);
      try {
        const fd = new FormData();
        fd.append("file",file); fd.append("fileName",file.name);
        const res = await fetch("/api/upload",{method:"POST",body:fd});
        const data = await res.json();
        setMedia(prev=>prev.map(m=>m.name===file.name&&!m.done ? {url:data.url||localUrl,type:isVid?"video":"image",name:file.name,done:true,error:!data.url} : m));
      } catch {
        setMedia(prev=>prev.map(m=>m.name===file.name&&!m.done ? {...m,done:true,error:true} : m));
      }
    }
    if (fileRef.current) fileRef.current.value="";
  };

  const genSEO = async () => {
    if (!form.name&&!form.roughNotes) { pop("Enter product name or rough notes first",false); return; }
    setSeoLoading(true);
    try {
      const res = await fetch("/api/generate-seo",{
        method:"POST", headers:{"Content-Type":"application/json"},
        body:JSON.stringify({productName:form.name||form.roughNotes, description:form.description, roughNotes:form.roughNotes, category:finalCat}),
      });
      const data = await res.json();
      setForm(p=>({...p,
        seoTitle:data.seoTitle||p.seoTitle,
        seoDescription:data.seoDescription||p.seoDescription,
        tags:Array.isArray(data.tags)?data.tags.join(", "):(data.tags||p.tags),
        name:data.productTitle&&!p.name?data.productTitle:p.name,
        description:data.productDescription&&!p.description?data.productDescription:p.description,
      }));
      pop("AI content generated!");
    } catch { pop("Generation failed",false); }
    setSeoLoading(false);
  };

  const validate = () => {
    const e:Record<string,string>={};
    if (!form.name.trim()) e.name="Required";
    if (!form.description.trim()) e.description="Required";
    if (!form.priceINR||parseFloat(form.priceINR)<=0) e.priceINR="Required";
    if (!form.cat1) e.cat="Required";
    if (media.filter(m=>m.done&&!m.error).length===0) e.media="At least one image required";
    setErrs(e);
    return Object.keys(e).length===0;
  };

  const save = async (publish:boolean) => {
    if (!validate()) { pop("Please fix required fields",false); return; }
    setSaving(true);
    try {
      const imageUrls = media.filter(m=>m.done&&!m.error).map(m=>m.url);
      const res = await fetch("/api/product-drafts",{
        method:"POST", headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          name:form.name.trim(), description:form.description,
          priceINR:parseFloat(form.priceINR),
          comparePriceINR:form.comparePriceINR?parseFloat(form.comparePriceINR):null,
          categoryId:finalCat, brand:form.brand, sku:form.sku,
          stock:parseInt(form.stock)||0, shippingType:form.shipping,
          indiaShipping:parseFloat(form.indiaShipping)||0,
          internationalShipping:parseFloat(form.internationalShipping)||2800,
          isCustom:form.isCustom, seoTitle:form.seoTitle,
          seoDescription:form.seoDescription, tags:form.tags,
          imageUrls, status:"draft",
        }),
      });
      const data = await res.json();
      if (!data.success) { pop(data.error||"Save failed",false); setSaving(false); return; }
      if (publish) {
        const pRes = await fetch("/api/product-drafts",{
          method:"PATCH", headers:{"Content-Type":"application/json"},
          body:JSON.stringify({id:data.id,status:"published"}),
        });
        const pData = await pRes.json();
        if (pData.success) { pop("✅ Product is LIVE!"); setForm(blank()); setMedia([]); setErrs({}); await load(); setView("list"); }
        else pop(pData.error||"Publish failed",false);
      } else {
        pop("✅ Saved as draft"); setForm(blank()); setMedia([]); setErrs({}); await load(); setView("drafts");
      }
    } catch(e:any) { pop("Error: "+e.message,false); }
    setSaving(false);
  };

  const publishDraft = async (id:number) => {
    const res = await fetch("/api/product-drafts",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({id,status:"published"})});
    const data = await res.json();
    if (data.success) { pop("✅ Product is LIVE!"); load(); } else pop(data.error||"Failed",false);
  };

  const publishSelected = async () => {
    if (!selectedDrafts.length) return;
    const res = await fetch("/api/product-drafts",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({ids:selectedDrafts,status:"published"})});
    const data = await res.json();
    if (data.success) { pop(`✅ ${data.published} products published!`); setSelectedDrafts([]); load(); }
    else pop(data.error||"Failed",false);
  };

  const deleteSelected = async (type:"live"|"drafts") => {
    const ids = type==="live" ? selectedLive : selectedDrafts;
    if (!ids.length) return;
    if (!confirm(`Delete ${ids.length} products?`)) return;
    const endpoint = type==="live" ? `/api/products?ids=${ids.join(",")}` : `/api/product-drafts?ids=${ids.join(",")}`;
    await fetch(endpoint,{method:"DELETE"});
    if (type==="live") setSelectedLive([]); else setSelectedDrafts([]);
    pop(`${ids.length} products deleted`); load();
  };

  const toggleSelect = (id:number, type:"live"|"drafts") => {
    if (type==="live") setSelectedLive(p=>p.includes(id)?p.filter(x=>x!==id):[...p,id]);
    else setSelectedDrafts(p=>p.includes(id)?p.filter(x=>x!==id):[...p,id]);
  };

  const selectAll = (type:"live"|"drafts") => {
    if (type==="live") setSelectedLive(selectedLive.length===live.length?[]:live.map(p=>p.id));
    else setSelectedDrafts(selectedDrafts.length===drafts.length?[]:drafts.map(d=>d.id));
  };

  const PRODUCT_CATS = ["women-sarees-designer","women-sarees-uppada","women-sarees-kanjivaram","women-lehengas","women-blouses","women-kurta-sets","men-sherwanis","men-kurtas","men-blazers","men-indo-western","kids-boys","kids-girls","jewellery-rings","jewellery-earrings","jewellery-pendants","jewellery-clips","footwear","gifts","snacks","handicrafts"];
  const filteredLive = (search ? live.filter(p=>p.name.toLowerCase().includes(search.toLowerCase())||p.category_id?.includes(search.toLowerCase())) : live).filter(p=>productCatFilter==="all"||p.category_id===productCatFilter);
  const filteredDrafts = search ? drafts.filter(d=>d.name.toLowerCase().includes(search.toLowerCase())) : drafts;

  const downloadTemplate = () => {
    const wb = XLSX.utils.book_new();
    const t = [{
      "Raw Seller Notes (AI will generate content from this)":"Pure kanjivaram silk saree, red with gold zari border, bridal wear, handwoven by artisans in Kanchipuram, weight 800g",
      "Product Name (leave blank for AI)":"",
      "Description (leave blank for AI)":"",
      "Selling Price INR (REQUIRED)":4999,
      "Original Price INR":7999,
      "Category ID (REQUIRED)":"women-sarees-kanjivaram",
      "Brand":"Jerovin",
      "SKU":"KSS-001",
      "Stock Quantity":10,
      "Is Custom (yes/no)":"no",
      "Tags (leave blank for AI)":"",
      "SEO Title (leave blank for AI)":"",
      "SEO Description (leave blank for AI)":"",
      "Image URLs (comma separated)":""
    }];
    const ws1 = XLSX.utils.json_to_sheet(t);
    ws1["!cols"]=Array(14).fill({wch:35});
    XLSX.utils.book_append_sheet(wb,ws1,"Products");
    const catSheet = XLSX.utils.json_to_sheet([
      {id:"women-sarees-designer",name:"Designer Sarees"},
      {id:"women-sarees-uppada",name:"Uppada Silk Sarees"},
      {id:"women-sarees-kanjivaram",name:"Kanjivaram Silk Sarees"},
      {id:"women-lehengas",name:"Lehengas"},
      {id:"women-blouses",name:"Blouses (Custom)"},
      {id:"women-kurta-sets",name:"Kurta Sets"},
      {id:"men-sherwanis",name:"Sherwanis"},
      {id:"men-kurtas",name:"Kurtas"},
      {id:"men-blazers",name:"Blazers"},
      {id:"men-indo-western",name:"Indo Western"},
      {id:"kids-boys",name:"Kids Boys"},
      {id:"kids-girls",name:"Kids Girls"},
      {id:"jewellery-rings",name:"Rings"},
      {id:"jewellery-earrings",name:"Earrings"},
      {id:"jewellery-pendants",name:"Pendants"},
      {id:"jewellery-clips",name:"Clips"},
      {id:"footwear",name:"Footwear"},
      {id:"gifts",name:"Custom Gifts"},
      {id:"snacks",name:"Snacks"},
      {id:"handicrafts",name:"Handicrafts"},
    ]);
    catSheet["!cols"]=[{wch:30},{wch:30}];
    XLSX.utils.book_append_sheet(wb,catSheet,"Category IDs");
    XLSX.writeFile(wb,"jerovin_product_template.xlsx");
    pop("Template downloaded — fill Raw Seller Notes, AI will generate the rest");
  };

  const handleBulk = async (e:React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    setBulkBusy(true); setBulkMsg("Reading file...");
    try {
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf);
      const rawRows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]) as any[];
      if (!rawRows.length) { setBulkMsg("❌ No rows found. Use the downloaded template."); setBulkBusy(false); return; }
      setBulkMsg(`Processing ${rawRows.length} rows — generating AI content where needed...`);
      const rows = [];
      for (let i=0; i<rawRows.length; i++) {
        const row = rawRows[i];
        const rawNotes = (row["Raw Seller Notes (AI will generate content from this)"]||"").toString().trim();
        const hasName = (row["Product Name (leave blank for AI)"]||"").toString().trim();
        const price = parseFloat(row["Selling Price INR (REQUIRED)"]||0);
        if (!price) continue;
        if (rawNotes && !hasName) {
          setBulkMsg(`AI generating content for row ${i+1} of ${rawRows.length}...`);
          try {
            const aiRes = await fetch("/api/generate-seo", {
              method:"POST", headers:{"Content-Type":"application/json"},
              body: JSON.stringify({
                productName: rawNotes,
                roughNotes: rawNotes,
                category: (row["Category ID (REQUIRED)"]||"").toString(),
                description: "",
              })
            });
            const aiData = await aiRes.json();
            row["Product Name (leave blank for AI)"] = aiData.productTitle || rawNotes.slice(0,60);
            row["Description (leave blank for AI)"] = aiData.productDescription || rawNotes;
            row["Tags (leave blank for AI)"] = Array.isArray(aiData.tags) ? aiData.tags.join(", ") : (aiData.tags||"");
            row["SEO Title (leave blank for AI)"] = aiData.seoTitle || "";
            row["SEO Description (leave blank for AI)"] = aiData.seoDescription || "";
          } catch {}
        }
        // Normalize keys to match what bulk-import API expects
        rows.push({
          "Product Name (REQUIRED)": row["Product Name (leave blank for AI)"] || row["Product Name (REQUIRED)"] || rawNotes.slice(0,60),
          "Description (REQUIRED)": row["Description (leave blank for AI)"] || row["Description (REQUIRED)"] || "",
          "Selling Price INR (REQUIRED)": price,
          "Original Price INR": row["Original Price INR"] || 0,
          "Category ID (REQUIRED)": row["Category ID (REQUIRED)"] || "",
          "Brand": row["Brand"] || "Jerovin",
          "SKU": row["SKU"] || "",
          "Stock Quantity": row["Stock Quantity"] || 10,
          "Is Custom (yes/no)": row["Is Custom (yes/no)"] || "no",
          "Tags": row["Tags (leave blank for AI)"] || row["Tags"] || "",
          "SEO Title (max 60)": row["SEO Title (leave blank for AI)"] || row["SEO Title (max 60)"] || "",
          "SEO Description (max 160)": row["SEO Description (leave blank for AI)"] || row["SEO Description (max 160)"] || "",
          "Image URLs (comma separated)": row["Image URLs (comma separated)"] || "",
        });
      }
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      setBulkMsg(`Uploading ${rows.length} products to database...`);
      const res = await fetch("/api/products/bulk-import", {
        method: "POST", headers: {"Content-Type":"application/json"},
        body: JSON.stringify({ rows, timezone: tz }),
      });
      const data = await res.json();
      if (data.success) {
        setBulkMsg(`✅ ${data.imported} products now LIVE with AI-generated content. ${data.failed>0?`❌ ${data.failed} failed.`:""}`);
        await load(); setView("list");
      } else {
        setBulkMsg(`❌ Import failed: ${data.error}`);
      }
    } catch(err:any) { setBulkMsg("❌ Could not read file: " + err.message); }
    setBulkBusy(false); if (bulkRef.current) bulkRef.current.value="";
  };

  const inp = (f:string) => `w-full bg-white border ${errs[f]?"border-red-400":"border-gray-200 focus:border-gray-900"} text-gray-900 px-4 py-3 text-sm outline-none transition placeholder-gray-400 rounded-lg focus:ring-1 focus:ring-gray-900`;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex">
      <div className="w-60 flex-shrink-0 border-r border-gray-100 bg-white flex flex-col sticky top-0 h-screen">
        <div className="px-6 py-5 border-b border-gray-100">
          <a href="/admin" className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-gray-900 flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs font-bold">J</span>
            </div>
            <div>
              <p className="text-sm font-semibold tracking-tight text-gray-900 leading-none">Jerovin</p>
              <p className="text-[10px] text-gray-400 mt-0.5 leading-none tracking-wide">ADMIN</p>
            </div>
          </a>
        </div>
        <div className="flex-1 py-2 overflow-y-auto">
          {[
            {id:"dashboard",label:"Dashboard",icon:LayoutDashboard,href:"/admin"},
            {id:"orders",label:"Orders",icon:Package2,href:"/admin#orders"},
            {id:"products",label:"Products",icon:ShoppingBag,href:"/admin/products"},
            {id:"customers",label:"Customers",icon:Users,href:"/admin#customers"},
            {id:"sellers",label:"Sellers",icon:Store,href:"/admin#sellers"},
            {id:"team",label:"Team & Access",icon:UserCog,href:"/admin#team"},
            {id:"reports",label:"Reports",icon:BarChart3,href:"/admin#reports"},
            {id:"audit",label:"Audit Log",icon:ShieldCheck,href:"/admin#audit"},
          ].map(m=>(
            <a key={m.id} href={m.href} className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg transition text-left ${m.id==="products"?"bg-gray-900 text-white":"text-gray-600 hover:text-gray-900 hover:bg-gray-50"}`}>
              {typeof m.icon==="string"?<span>{m.icon}</span>:(()=>{const Icon=m.icon;return <Icon size={17} strokeWidth={1.75}/>;})()}<span>{m.label}</span>
            </a>
          ))}
          <div className="border-t border-gray-200 mt-2 pt-2">
            <a href="/admin/media" className="w-full flex items-center gap-3 px-5 py-3.5 text-xs tracking-widest text-gray-600 border-l-2 border-transparent hover:text-gray-900 hover:bg-gray-100 transition"><ImageIcon size={17} strokeWidth={1.75}/> Media Library</a>
          </div>
        </div>
        <div className="p-4 border-t border-gray-200 text-xs text-gray-600">
          <p>LOGGED IN AS</p>
          <p className="font-bold text-gray-900 mt-0.5">ROY — SUPER ADMIN</p>
          <a href="/" className="block mt-2 text-gray-700 hover:text-gray-900 transition">← VIEW WEBSITE</a>
        </div>
      </div>
      <div className="flex-1 min-h-screen">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-5 py-4 text-sm tracking-widest shadow-2xl ${toast.ok?"bg-green-600":"bg-red-600"}`}>
          {toast.ok?<Check size={16}/>:<AlertCircle size={16}/>} {toast.msg}
        </div>
      )}

      {editProduct && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 flex items-start justify-center p-6 overflow-y-auto" onClick={()=>setEditProduct(null)}>
          <div className="bg-white border border-gray-200 shadow-xl w-full max-w-4xl p-8 my-4" onClick={e=>e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-sm font-bold tracking-widest">EDIT PRODUCT</h2>
                <p className="text-xs text-gray-700 mt-1">ID: {editProduct.id} — Changes save directly to live store</p>
              </div>
              <button onClick={()=>setEditProduct(null)}><X size={20} color="#111827"/></button>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="flex flex-col gap-4">
                <div><label className="text-xs tracking-widest text-gray-700 mb-1.5 block">PRODUCT NAME <span className="text-red-500">*</span></label>
                  <input value={editProduct.name||""} onChange={e=>setEditProduct((p:any)=>({...p,name:e.target.value}))} className="w-full bg-white border border-gray-200 text-gray-900 px-4 py-3 text-sm outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition rounded-lg"/></div>
                <div><label className="text-xs tracking-widest text-gray-700 mb-1.5 block">DESCRIPTION <span className="text-red-500">*</span></label>
                  <textarea value={editProduct.description||""} onChange={e=>setEditProduct((p:any)=>({...p,description:e.target.value}))} rows={5} className="w-full bg-white border border-gray-200 text-gray-900 px-4 py-3 text-sm outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition rounded-lg resize-none"/></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="text-xs tracking-widest text-gray-700 mb-1.5 block">SELLING PRICE ₹ <span className="text-red-500">*</span></label>
                    <input type="number" value={editProduct.priceINR||""} onChange={e=>setEditProduct((p:any)=>({...p,priceINR:e.target.value}))} className="w-full bg-white border border-gray-200 text-gray-900 px-4 py-3 text-sm outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition rounded-lg"/></div>
                  <div><label className="text-xs tracking-widest text-gray-700 mb-1.5 block">ORIGINAL PRICE ₹</label>
                    <input type="number" value={editProduct.comparePriceINR||""} onChange={e=>setEditProduct((p:any)=>({...p,comparePriceINR:e.target.value}))} className="w-full bg-white border border-gray-200 text-gray-900 px-4 py-3 text-sm outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition rounded-lg"/></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="text-xs tracking-widest text-gray-700 mb-1.5 block">STOCK</label>
                    <input type="number" value={editProduct.stock||0} onChange={e=>setEditProduct((p:any)=>({...p,stock:e.target.value}))} className="w-full bg-white border border-gray-200 text-gray-900 px-4 py-3 text-sm outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition rounded-lg"/></div>
                  <div><label className="text-xs tracking-widest text-gray-700 mb-1.5 block">SKU</label>
                    <input value={editProduct.sku||""} onChange={e=>setEditProduct((p:any)=>({...p,sku:e.target.value}))} className="w-full bg-white border border-gray-200 text-gray-900 px-4 py-3 text-sm outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition rounded-lg"/></div>
                </div>
                <div><label className="text-xs tracking-widest text-gray-700 mb-1.5 block">TAGS</label>
                  <input value={editProduct.tags||""} onChange={e=>setEditProduct((p:any)=>({...p,tags:e.target.value}))} placeholder="silk saree, bridal, kanjivaram" className="w-full bg-white border border-gray-200 text-gray-900 px-4 py-3 text-sm outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition rounded-lg"/></div>
              </div>
              <div className="flex flex-col gap-4">
                <div><label className="text-xs tracking-widest text-gray-700 mb-1.5 block">CATEGORY ID</label>
                  <input value={editProduct.category_id||""} onChange={e=>setEditProduct((p:any)=>({...p,category_id:e.target.value}))} placeholder="e.g. women-sarees-kanjivaram" className="w-full bg-white border border-gray-200 text-gray-900 px-4 py-3 text-sm outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition rounded-lg"/></div>
                <div><label className="text-xs tracking-widest text-gray-700 mb-1.5 block">SEO TITLE (max 60 chars)</label>
                  <input value={editProduct.seoTitle||""} onChange={e=>setEditProduct((p:any)=>({...p,seoTitle:e.target.value}))} maxLength={60} className="w-full bg-white border border-gray-200 text-gray-900 px-4 py-3 text-sm outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition rounded-lg"/>
                  <p className="text-xs text-gray-600 mt-1">{(editProduct.seoTitle||"").length}/60</p></div>
                <div><label className="text-xs tracking-widest text-gray-700 mb-1.5 block">SEO DESCRIPTION (max 160 chars)</label>
                  <textarea value={editProduct.seoDescription||""} onChange={e=>setEditProduct((p:any)=>({...p,seoDescription:e.target.value}))} maxLength={160} rows={3} className="w-full bg-white border border-gray-200 text-gray-900 px-4 py-3 text-sm outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition rounded-lg resize-none"/>
                  <p className="text-xs text-gray-600 mt-1">{(editProduct.seoDescription||"").length}/160</p></div>
                <div>
                  <label className="text-xs tracking-widest text-gray-700 mb-1.5 block">CURRENT MEDIA ({(editProduct.media||[]).length} files)</label>
                  <div className="grid grid-cols-4 gap-2 mb-2">
                    {(editProduct.media||[]).map((m:any,i:number)=>(
                      <div key={i} className="relative aspect-square bg-gray-800 rounded overflow-hidden">
                        {m.type==="video"?<video src={m.url} className="w-full h-full object-cover" muted/>:<img src={m.url} alt="" className="w-full h-full object-cover"/>}
                      </div>
                    ))}
                  </div>
                  <div><label className="text-xs tracking-widest text-gray-700 mb-1.5 block">ADD IMAGE URLs (comma separated)</label>
                    <textarea value={editProduct.newImageUrls||""} onChange={e=>setEditProduct((p:any)=>({...p,newImageUrls:e.target.value}))} rows={2} placeholder="https://... , https://..." className="w-full bg-white border border-gray-200 text-gray-900 px-4 py-3 text-sm outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition rounded-lg resize-none"/></div>
                </div>
                <div className="flex items-center gap-3">
                  <input type="checkbox" id="editCustom" checked={editProduct.isCustom||false} onChange={e=>setEditProduct((p:any)=>({...p,isCustom:e.target.checked}))} className="w-4 h-4"/>
                  <label htmlFor="editCustom" className="text-xs tracking-widest text-gray-700">CUSTOM PRODUCT (shows customization options)</label>
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200">
              <button onClick={async()=>{
                const fd=new FormData();
                fd.append("id",String(editProduct.id));
                fd.append("name",editProduct.name||"");
                fd.append("description",editProduct.description||"");
                fd.append("priceINR",String(editProduct.priceINR||0));
                fd.append("comparePriceINR",String(editProduct.comparePriceINR||""));
                fd.append("categoryId",editProduct.category_id||"");
                fd.append("stock",String(editProduct.stock||0));
                fd.append("tags",editProduct.tags||"");
                fd.append("sku",editProduct.sku||"");
                fd.append("seoTitle",editProduct.seoTitle||"");
                fd.append("seoDescription",editProduct.seoDescription||"");
                fd.append("isCustom",String(editProduct.isCustom||false));
                const res=await fetch("/api/products",{method:"POST",body:fd});
                const data=await res.json();
                if(!data.success){pop(data.error||"Update failed",false);return;}
                // Add new media if provided
                if(editProduct.newImageUrls?.trim()){
                  const urls=editProduct.newImageUrls.split(",").map((s:string)=>s.trim()).filter(Boolean);
                  for(let i=0;i<urls.length;i++){
                    const type=urls[i].match(/\.(mp4|mov|webm)/i)?"video":"image";
                    await fetch("/api/product-media",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({productId:editProduct.id,url:urls[i],type,sortOrder:(editProduct.media?.length||0)+i})});
                  }
                }
                pop("✅ Product updated and live!");setEditProduct(null);load();
              }} className="flex-1 bg-blue-600 text-white py-3 text-xs font-semibold hover:bg-blue-700 transition">SAVE & PUBLISH CHANGES</button>
              <button onClick={async()=>{
                const aiRes=await fetch("/api/generate-seo",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({productName:editProduct.name,description:editProduct.description,category:editProduct.category_id,roughNotes:editProduct.tags||""})});
                const aiData=await aiRes.json();
                setEditProduct((p:any)=>({...p,seoTitle:aiData.seoTitle||p.seoTitle,seoDescription:aiData.seoDescription||p.seoDescription,tags:Array.isArray(aiData.tags)?aiData.tags.join(", "):(aiData.tags||p.tags),description:aiData.productDescription||p.description}));
                pop("✨ AI content generated!");
              }} className="px-6 py-3 text-xs tracking-widest bg-blue-700 hover:bg-blue-600 text-gray-900 font-bold transition">✨ AI REGENERATE</button>
              <button onClick={()=>setEditProduct(null)} className="px-6 py-3 text-xs tracking-widest border border-gray-300 text-gray-700 hover:border-white hover:text-gray-900 transition">CANCEL</button>
            </div>
          </div>
        </div>
      )}

      {preview && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 flex items-start justify-center p-8 overflow-y-auto" onClick={()=>setPreview(null)}>
          <div className="bg-white border border-gray-200 shadow-xl w-full max-w-4xl p-8" onClick={e=>e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-sm font-bold tracking-widest">LIVE PREVIEW</h2>
              <button onClick={()=>setPreview(null)}><X size={20} color="#111827"/></button>
            </div>
            <div className="grid grid-cols-2 gap-10">
              <div>
                {(()=>{
                  const urls=preview.image_urls||preview.media?.map((m:any)=>m.url)||[];
                  return urls.length>0?(
                    <><img src={urls[0]} alt={preview.name} className="w-full aspect-square object-cover mb-2"/>
                    {urls.length>1&&<div className="grid grid-cols-4 gap-1">{urls.slice(1,5).map((u:string,i:number)=><img key={i} src={u} alt="" className="aspect-square object-cover"/>)}</div>}</>
                  ):<div className="w-full aspect-square bg-gray-800 flex items-center justify-center text-gray-600">NO IMAGE</div>;
                })()}
              </div>
              <div className="flex flex-col gap-3">
                <p className="text-xs text-gray-700 tracking-widest">{(preview.category_id||"")?.toUpperCase()}</p>
                <h3 className="text-2xl font-bold">{preview.name}</h3>
                <div className="flex items-center gap-4">
                  {(preview.compare_price_inr||preview.comparePriceINR)&&<p className="text-gray-700 line-through">₹{parseFloat(preview.compare_price_inr||preview.comparePriceINR).toLocaleString()}</p>}
                  <p className="text-3xl font-bold text-green-400">₹{parseFloat(preview.price_inr||preview.priceINR||0).toLocaleString()}</p>
                </div>
                <p className="text-gray-700 text-sm leading-relaxed">{preview.description}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between px-8 py-4 border-b border-gray-100 bg-white sticky top-0 z-10">
        <div className="flex items-center gap-1">
          {[{id:"list",label:"Live ("+live.length+")"},{id:"drafts",label:"Drafts ("+drafts.length+")"},{id:"add",label:"+ Add product"}].map(tab=>(
            <button key={tab.id} onClick={()=>{setView(tab.id as any);if(tab.id==="add"){setForm(blank());setMedia([]);setErrs({});}}} className={`px-4 py-2 text-sm rounded-lg transition ${view===tab.id?"bg-gray-900 text-white":"text-gray-600 hover:bg-gray-50"}`}>{tab.label}</button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search products..." className="bg-gray-50 border border-gray-200 text-gray-900 px-3 py-2 text-sm outline-none focus:border-gray-900 focus:bg-white transition w-48 rounded-lg placeholder-gray-400"/>
          <button onClick={downloadTemplate} className="border border-gray-200 text-gray-600 px-3 py-2 text-sm hover:border-gray-300 hover:text-gray-900 transition flex items-center gap-1.5 rounded-lg"><Download size={14}/> Template</button>
          <label className={`px-3 py-2 text-sm transition flex items-center gap-1.5 cursor-pointer rounded-lg ${bulkBusy?"bg-amber-50 text-amber-700":"border border-gray-200 text-gray-600 hover:border-gray-300 hover:text-gray-900"}`}>
            <FileSpreadsheet size={14}/> {bulkBusy?"Importing...":"Bulk import"}
            <input ref={bulkRef} type="file" accept=".xlsx,.xls" onChange={handleBulk} className="hidden" disabled={bulkBusy}/>
          </label>
        </div>
      </div>

      {bulkMsg&&(
        <div className={`px-6 py-2 text-xs tracking-widest flex items-center justify-between border-b ${bulkMsg.includes("✅")?"bg-green-50 border-green-300 text-gray-900":"bg-red-50 border-red-300 text-gray-900"}`}>
          {bulkMsg}<button onClick={()=>setBulkMsg("")}><X size={12}/></button>
        </div>
      )}

      {view==="list"&&(
        <div className="px-6 py-5 flex gap-4">
          <div className="w-48 flex-shrink-0">
            <div className="bg-white border border-gray-200 rounded shadow-sm overflow-hidden sticky top-4">
              <div className="p-3 border-b border-gray-200 text-xs text-gray-700 tracking-widest">CATEGORIES</div>
              <button onClick={()=>setProductCatFilter("all")} className={`w-full text-left px-3 py-2.5 text-sm rounded-lg mb-0.5 flex justify-between transition ${productCatFilter==="all"?"bg-gray-900 text-white":"text-gray-600 hover:bg-gray-50"}`}>
                <span>ALL</span><span>{live.length}</span>
              </button>
              {PRODUCT_CATS.map(c=>(
                <button key={c} onClick={()=>setProductCatFilter(c)} className={`w-full text-left px-3 py-2.5 text-sm rounded-lg mb-0.5 flex justify-between transition ${productCatFilter===c?"bg-gray-900 text-white":"text-gray-600 hover:bg-gray-50"}`}>
                  <span className="truncate">{c.replace(/-/g," ")}</span>
                  <span className="ml-1 flex-shrink-0">{live.filter(p=>p.category_id===c).length}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="flex-1">
          {selectedLive.length>0&&(
            <div className="flex gap-3 mb-4 p-3 bg-white border border-gray-100 rounded-2xl shadow-sm items-center">
              <p className="text-xs text-gray-700">{selectedLive.length} selected</p>
              <button onClick={()=>deleteSelected("live")} className="flex items-center gap-1 text-xs border border-red-800 text-red-400 px-3 py-1.5 hover:border-red-500 transition"><Trash2 size={10}/> DELETE SELECTED</button>
              <button onClick={()=>setSelectedLive([])} className="text-xs text-gray-600 hover:text-gray-900">CLEAR</button>
            </div>
          )}
          {loading?<div className="text-center py-20"><div className="w-8 h-8 border-2 border-gray-400 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div><p className="text-gray-600 text-xs">LOADING...</p></div>
          :filteredLive.length===0?(
            <div className="border border-gray-200 bg-white border border-gray-100 rounded-2xl text-center py-20">
              <Upload size={48} color="#374151" style={{margin:"0 auto 16px"}}/>
              <p className="text-gray-700 text-base mb-2">No live products yet</p>
              <div className="flex gap-3 justify-center">
                <button onClick={()=>{setView("add");setForm(blank());setMedia([]);}} className="bg-blue-600 text-white px-8 py-3 text-xs font-semibold hover:bg-blue-700 transition">+ ADD PRODUCT</button>
                <button onClick={downloadTemplate} className="border border-gray-300 text-gray-700 px-8 py-3 text-xs tracking-widest hover:border-gray-500 hover:text-gray-900 transition rounded">DOWNLOAD TEMPLATE</button>
              </div>
            </div>
          ):(
            <div className="bg-white border border-gray-100 rounded-2xl shadow-[0_1px_2px_rgba(0,0,0,0.04)] overflow-hidden">
              <div className="grid grid-cols-12 gap-3 px-4 py-3 bg-gray-50 border-b border-gray-200 text-xs tracking-widest text-gray-700">
                <div className="col-span-1 flex items-center gap-2"><input type="checkbox" checked={selectedLive.length===live.length&&live.length>0} onChange={()=>selectAll("live")} className="w-3.5 h-3.5 cursor-pointer"/><span>IMG</span></div>
                <span className="col-span-3">PRODUCT</span><span className="col-span-2">CATEGORY</span>
                <span className="col-span-2">PRICE</span><span className="col-span-1">STOCK</span>
                <span className="col-span-1">FILES</span><span className="col-span-2">ACTIONS</span>
              </div>
              {filteredLive.map(p=>{
                const imgs=p.media||[];
                const firstImg=imgs.find((m:any)=>m.type==="image");
                return (
                  <div key={p.id} onDoubleClick={()=>setEditProduct(p)} className={`grid grid-cols-12 gap-3 px-4 py-3 border-b border-gray-50 items-center hover:bg-gray-50/60 transition cursor-pointer ${selectedLive.includes(p.id)?"bg-blue-50":""}`}>
                    <div className="col-span-1 flex items-center gap-2">
                      <input type="checkbox" checked={selectedLive.includes(p.id)} onChange={()=>toggleSelect(p.id,"live")} className="w-3.5 h-3.5 cursor-pointer"/>
                      {firstImg?.url?<img src={firstImg.url} alt={p.name} className="w-10 h-10 object-cover rounded"/>:<div className="w-10 h-10 bg-gray-800 rounded flex items-center justify-center text-gray-600 text-xs">—</div>}
                    </div>
                    <div className="col-span-3"><p className="text-xs font-bold">{p.name}</p><p className="text-xs text-gray-600">{p.sku||"—"}</p></div>
                    <p className="col-span-2 text-xs text-gray-700 truncate">{p.category_id||"—"}</p>
                    <div className="col-span-2">
                      {p.comparePriceINR&&<p className="text-xs text-gray-600 line-through">₹{parseFloat(p.comparePriceINR).toLocaleString()}</p>}
                      <p className="text-xs font-bold text-gray-900 font-bold">₹{parseFloat(p.priceINR||0).toLocaleString()}</p>
                    </div>
                    <p className="col-span-1 text-xs text-gray-700">{p.stock||0}</p>
                    <div className="col-span-1">
                      <p className="text-xs text-gray-700">{imgs.length} files</p>
                      {p.uploaded_at_local&&<p className="text-xs text-gray-600 truncate" title={p.uploaded_at_est||""}>{p.uploaded_at_local}</p>}
                    </div>
                    <div className="col-span-2 flex gap-1 flex-wrap">
                      <button onClick={()=>setPreview(p)} className="text-xs border border-gray-300 px-2 py-1 hover:border-gray-500 text-gray-600 rounded transition flex items-center gap-1"><Eye size={10}/></button>
                      <button onClick={()=>setEditProduct(p)} className="text-xs border border-sky-200 px-2.5 py-1 bg-sky-50 hover:border-sky-300 rounded-lg text-gray-900 font-bold transition text-xs">EDIT</button>
                      <a href={p.category_id?.includes("blouse")?`/custom-product/${p.id}`:`/product/${p.id}`} target="_blank" className="text-xs border border-gray-300 px-2 py-1 hover:border-gray-500 text-gray-600 rounded transition flex items-center gap-1"><Globe size={10}/></a>
                      <button onClick={async()=>{
                        const res=await fetch("/api/products",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({id:p.id,is_active:!p.is_active})});
                        if((await res.json()).success){pop(p.is_active?"Product disabled":"Product enabled!");load();}
                      }} className={`text-xs border px-2 py-1 transition ${p.is_active?"border-green-300 text-gray-900 hover:border-green-500 rounded":"border-gray-300 text-gray-600 hover:border-gray-500 hover:text-gray-900 rounded"}`}>
                        {p.is_active?"ON":"OFF"}
                      </button>
                      <button onClick={async()=>{if(confirm("Delete?")){await fetch(`/api/products?id=${p.id}`,{method:"DELETE"});load();}}} className="text-xs border border-red-300 px-2 py-1 hover:border-red-500 hover:text-gray-900 text-gray-700 rounded transition"><X size={10}/></button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          </div>
        </div>
      )}

      {view==="drafts"&&(
        <div className="px-6 py-5">
          {selectedDrafts.length>0&&(
            <div className="flex gap-3 mb-4 p-3 bg-white border border-gray-100 rounded-2xl shadow-sm items-center">
              <p className="text-xs text-gray-700">{selectedDrafts.length} selected</p>
              <button onClick={publishSelected} className="flex items-center gap-1 text-xs bg-green-700 hover:bg-green-600 text-gray-900 px-3 py-1.5 transition"><Globe size={10}/> PUBLISH ALL SELECTED</button>
              <button onClick={()=>deleteSelected("drafts")} className="flex items-center gap-1 text-xs border border-red-800 text-red-400 px-3 py-1.5 hover:border-red-500 transition"><Trash2 size={10}/> DELETE SELECTED</button>
              <button onClick={()=>setSelectedDrafts([])} className="text-xs text-gray-600 hover:text-gray-900">CLEAR</button>
            </div>
          )}
          {filteredDrafts.length===0?(
            <div className="border border-gray-200 bg-white border border-gray-100 rounded-2xl text-center py-20">
              <Check size={48} color="#22c55e" style={{margin:"0 auto 16px"}}/>
              <p className="text-gray-700 text-base">No drafts pending</p>
            </div>
          ):(
            <div className="bg-white border border-gray-100 rounded-2xl shadow-[0_1px_2px_rgba(0,0,0,0.04)] overflow-hidden">
              <div className="grid grid-cols-10 gap-3 px-4 py-3 bg-gray-50 border-b border-gray-200 text-xs tracking-widest text-gray-700">
                <div className="col-span-1 flex items-center gap-2"><input type="checkbox" checked={selectedDrafts.length===drafts.length&&drafts.length>0} onChange={()=>selectAll("drafts")} className="w-3.5 h-3.5 cursor-pointer"/><span>IMG</span></div>
                <span className="col-span-3">PRODUCT</span><span className="col-span-2">CATEGORY</span>
                <span className="col-span-1">PRICE</span><span className="col-span-1">FILES</span><span className="col-span-2">ACTIONS</span>
              </div>
              {filteredDrafts.map(d=>{
                const urls=Array.isArray(d.image_urls)?d.image_urls:[];
                const firstImg=urls[0];
                return (
                  <div key={d.id} className={`grid grid-cols-10 gap-3 px-4 py-3 border-b border-gray-50 items-center hover:bg-gray-50/60 transition ${selectedDrafts.includes(d.id)?"bg-blue-50":""}`}>
                    <div className="col-span-1 flex items-center gap-2">
                      <input type="checkbox" checked={selectedDrafts.includes(d.id)} onChange={()=>toggleSelect(d.id,"drafts")} className="w-3.5 h-3.5 cursor-pointer"/>
                      {firstImg?<img src={firstImg} alt={d.name} className="w-10 h-10 object-cover rounded"/>:<div className="w-10 h-10 bg-gray-800 rounded flex items-center justify-center text-gray-600 text-xs">—</div>}
                    </div>
                    <div className="col-span-3"><p className="text-xs font-bold">{d.name}</p><p className="text-xs text-gray-600 truncate">{d.description?.slice(0,40)}...</p></div>
                    <p className="col-span-2 text-xs text-gray-700 truncate">{d.category_id||"—"}</p>
                    <p className="col-span-1 text-xs font-bold">₹{parseFloat(d.price_inr||0).toLocaleString()}</p>
                    <p className="col-span-1 text-xs text-gray-700">{urls.length} img</p>
                    <div className="col-span-2 flex gap-1.5">
                      <button onClick={()=>setPreview({...d,priceINR:d.price_inr,comparePriceINR:d.compare_price_inr})} className="text-xs border border-gray-300 px-2 py-1 hover:border-gray-500 text-gray-600 rounded transition"><Eye size={10}/></button>
                      <button onClick={()=>publishDraft(d.id)} className="text-xs bg-green-700 hover:bg-green-600 text-gray-900 px-2 py-1 transition font-bold">PUBLISH</button>
                      <button onClick={async()=>{if(confirm("Delete?")){await fetch(`/api/product-drafts?id=${d.id}`,{method:"DELETE"});load();}}} className="text-xs border border-red-300 px-2 py-1 hover:border-red-500 hover:text-gray-900 text-gray-700 rounded transition"><X size={10}/></button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {view==="add"&&(
        <div className="px-6 py-5 max-w-6xl">
          <div className="grid grid-cols-2 gap-8">
            <div className="flex flex-col gap-4">
              <div className="border border-blue-800 bg-blue-950 bg-opacity-30 p-4 rounded">
                <label className="text-xs tracking-widest text-blue-300 mb-1.5 block font-bold">✨ AI QUICK FILL</label>
                <textarea value={form.roughNotes} onChange={e=>setForm(p=>({...p,roughNotes:e.target.value}))} placeholder="e.g. kanjivaram silk saree red, bridal, 4999 rupees" rows={3} className="w-full bg-black border border-blue-700 text-gray-900 px-4 py-3 text-xs tracking-widest outline-none focus:border-blue-400 transition placeholder-gray-600 resize-none mb-2"/>
                <button onClick={genSEO} disabled={seoLoading} className="w-full bg-blue-600 hover:bg-blue-500 text-gray-900 py-2.5 text-xs font-semibold transition flex items-center justify-center gap-2 disabled:opacity-50">
                  {seoLoading?<><div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>GENERATING...</>:"✨ GENERATE ALL CONTENT WITH AI"}
                </button>
              </div>

              <div>
                <label className="text-xs tracking-widest text-gray-700 mb-1.5 block">PRODUCT NAME <span className="text-red-500">*</span></label>
                <input value={form.name} onChange={e=>{setForm(p=>({...p,name:e.target.value}));setErrs(p=>({...p,name:""}));}} className={inp("name")}/>
                {errs.name&&<p className="text-red-400 text-xs mt-1">{errs.name}</p>}
              </div>

              <div>
                <label className="text-xs tracking-widest text-gray-700 mb-1.5 block">DESCRIPTION <span className="text-red-500">*</span></label>
                <textarea value={form.description} onChange={e=>{setForm(p=>({...p,description:e.target.value}));setErrs(p=>({...p,description:""}));}} rows={4} className={inp("description")+" resize-none"}/>
                {errs.description&&<p className="text-red-400 text-xs mt-1">{errs.description}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs tracking-widest text-gray-700 mb-1.5 block">SELLING PRICE ₹ <span className="text-red-500">*</span></label>
                  <input type="number" value={form.priceINR} onChange={e=>{setForm(p=>({...p,priceINR:e.target.value}));setErrs(p=>({...p,priceINR:""}));}} className={inp("priceINR")}/>
                  {errs.priceINR&&<p className="text-red-400 text-xs mt-1">{errs.priceINR}</p>}
                </div>
                <div>
                  <label className="text-xs tracking-widest text-gray-700 mb-1.5 block">ORIGINAL PRICE ₹</label>
                  <input type="number" value={form.comparePriceINR} onChange={e=>setForm(p=>({...p,comparePriceINR:e.target.value}))} className={inp("")}/>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div><label className="text-xs tracking-widest text-gray-700 mb-1.5 block">BRAND</label><input value={form.brand} onChange={e=>setForm(p=>({...p,brand:e.target.value}))} className={inp("")}/></div>
                <div><label className="text-xs tracking-widest text-gray-700 mb-1.5 block">STOCK</label><input type="number" value={form.stock} onChange={e=>setForm(p=>({...p,stock:e.target.value}))} className={inp("")}/></div>
                <div><label className="text-xs tracking-widest text-gray-700 mb-1.5 block">SKU</label><input value={form.sku} onChange={e=>setForm(p=>({...p,sku:e.target.value}))} className={inp("")}/></div>
              </div>

              <div>
                <label className="text-xs tracking-widest text-gray-700 mb-1.5 block">CATEGORY <span className="text-red-500">*</span></label>
                <select value={form.cat1} onChange={e=>{setForm(p=>({...p,cat1:e.target.value,cat2:"",cat3:""}));setErrs(p=>({...p,cat:""}));}} className={inp("cat")+" cursor-pointer mb-2"}>
                  <option value="">SELECT MAIN CATEGORY</option>
                  {CATS.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                {errs.cat&&<p className="text-red-400 text-xs mb-2">{errs.cat}</p>}
                {cat1data&&cat1data.sub.length>0&&(
                  <select value={form.cat2} onChange={e=>setForm(p=>({...p,cat2:e.target.value,cat3:""}))} className={inp("")+" cursor-pointer mb-2"}>
                    <option value="">SELECT SUBCATEGORY (optional)</option>
                    {cat1data.sub.map((s:any)=><option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                )}
                {cat2data?.sub?.length>0&&(
                  <select value={form.cat3} onChange={e=>setForm(p=>({...p,cat3:e.target.value}))} className={inp("")+" cursor-pointer"}>
                    <option value="">SELECT SUB-SUBCATEGORY (optional)</option>
                    {cat2data.sub.map((s:any)=><option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                )}
                {finalCat&&<p className="text-xs text-green-500 mt-1">✓ Category: {finalCat}</p>}
              </div>

              <div>
                <label className="text-xs tracking-widest text-gray-700 mb-2 block">SHIPPING</label>
                <div className="flex gap-3 mb-3">
                  <button type="button" onClick={()=>setForm(p=>({...p,shipping:"free"}))} className={`flex-1 py-3 text-xs font-semibold border-2 transition ${form.shipping==="free"?"border-white bg-blue-600 text-white":"border-gray-300 text-gray-700"}`}>✓ FREE SHIPPING</button>
                  <button type="button" onClick={()=>setForm(p=>({...p,shipping:"charged"}))} className={`flex-1 py-3 text-xs font-semibold border-2 transition ${form.shipping==="charged"?"border-white bg-blue-600 text-white":"border-gray-300 text-gray-700"}`}>CHARGEABLE</button>
                </div>
              </div>

              <div className="border border-gray-200 bg-gray-950 p-4 rounded">
                <p className="text-xs font-bold tracking-widest mb-3">SEO & TAGS</p>
                <div className="flex flex-col gap-3">
                  <div><p className="text-xs text-gray-600 mb-1">{form.seoTitle.length}/60</p><input value={form.seoTitle} onChange={e=>setForm(p=>({...p,seoTitle:e.target.value}))} maxLength={60} placeholder="SEO title" className={inp("")}/></div>
                  <div><p className="text-xs text-gray-600 mb-1">{form.seoDescription.length}/160</p><textarea value={form.seoDescription} onChange={e=>setForm(p=>({...p,seoDescription:e.target.value}))} maxLength={160} rows={3} placeholder="SEO description" className={inp("")+" resize-none"}/></div>
                  <div><input value={form.tags} onChange={e=>setForm(p=>({...p,tags:e.target.value}))} placeholder="silk saree, kanjivaram, bridal" className={inp("")}/></div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div>
                <label className="text-xs tracking-widest text-gray-700 mb-1.5 block">IMAGES & VIDEOS <span className="text-red-500">*</span></label>
                {errs.media&&<p className="text-red-400 text-xs mb-2">⚠ {errs.media}</p>}
                <div className="border-2 border-dashed border-gray-600 hover:border-gray-400 transition cursor-pointer p-8 text-center mb-3 bg-gray-950 rounded" onClick={()=>fileRef.current?.click()}>
                  <Upload size={28} color="#6b7280" style={{margin:"0 auto 10px"}}/>
                  <p className="text-sm text-gray-300 tracking-widest mb-1">CLICK TO SELECT FILES</p>
                  <p className="text-xs text-gray-600">JPG, PNG, WEBP, MP4, MOV — Select multiple at once</p>
                </div>
                <input ref={fileRef} type="file" accept="image/*,video/*" multiple onChange={handleFiles} className="hidden"/>
                {media.length>0&&(
                  <div className="grid grid-cols-3 gap-2">
                    {media.map((m,i)=>(
                      <div key={i} className="relative aspect-square bg-gray-900 rounded overflow-hidden border border-gray-300 group">
                        {!m.done?(
                          <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                            <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                            <p className="text-xs text-blue-400">UPLOADING</p>
                          </div>
                        ):m.error?(
                          <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-red-950">
                            <AlertCircle size={24} color="#ef4444"/><p className="text-xs text-red-400">FAILED</p>
                          </div>
                        ):m.type==="video"?(
                          <div className="w-full h-full flex flex-col items-center justify-center bg-gray-800 gap-2">
                            <div className="text-3xl">▶</div>
                            <p className="text-xs text-gray-300 text-center px-2 truncate w-full text-center">{m.name}</p>
                            <p className="text-xs text-green-400">VIDEO READY</p>
                          </div>
                        ):<img src={m.url} alt="" className="w-full h-full object-cover"/>}
                        {i===0&&m.done&&!m.error&&<span className="absolute top-1 left-1 bg-blue-600 text-white text-xs px-1.5 py-0.5 font-bold leading-none">MAIN</span>}
                        {m.type==="video"&&m.done&&!m.error&&<span className="absolute bottom-1 left-1 bg-black bg-opacity-80 text-gray-900 text-xs px-1">▶ VIDEO</span>}
                        {m.done&&<button onClick={()=>setMedia(prev=>prev.filter((_,idx)=>idx!==i))} className="absolute top-1 right-1 w-6 h-6 bg-red-600 rounded-full items-center justify-center hidden group-hover:flex"><X size={12}/></button>}
                      </div>
                    ))}
                    <div onClick={()=>fileRef.current?.click()} className="aspect-square border-2 border-dashed border-gray-300 flex flex-col items-center justify-center hover:border-gray-400 transition cursor-pointer bg-gray-950 rounded">
                      <Plus size={24} color="#6b7280"/><p className="text-xs text-gray-600 mt-1">More</p>
                    </div>
                  </div>
                )}
                {media.some(m=>m.done&&!m.error)&&<p className="text-xs text-green-500 mt-2">✓ {media.filter(m=>m.done&&!m.error).length} file(s) ready</p>}
              </div>

              <div className="border-t border-gray-200 pt-4 mt-auto">
                <div className="grid grid-cols-2 gap-3 mb-2">
                  <button onClick={()=>save(false)} disabled={saving} className="border-2 border-gray-600 text-gray-900 py-4 text-xs tracking-widest hover:border-white transition disabled:opacity-50 flex items-center justify-center gap-2 font-bold rounded">
                    {saving?<div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>:null} SAVE AS DRAFT
                  </button>
                  <button onClick={()=>save(true)} disabled={saving} className="bg-green-600 hover:bg-green-500 text-gray-900 py-4 text-xs font-semibold transition disabled:opacity-50 flex items-center justify-center gap-2 rounded">
                    {saving?<div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>:<Check size={14}/>} PUBLISH NOW
                  </button>
                </div>
                <p className="text-xs text-gray-700 text-center">PUBLISH NOW = live on website immediately</p>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}


export default function AdminProducts() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-700 text-xs tracking-widest">LOADING...</div>}>
      <AdminProductsInner />
    </Suspense>
  );
}
