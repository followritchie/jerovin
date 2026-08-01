"use client";
import { useState, useRef, useEffect } from "react";
import { Upload, Copy, Check, X, Trash2, ExternalLink, LayoutDashboard, Package2, ShoppingBag, Users, Store, UserCog, BarChart3, ShieldCheck, Image as ImageIcon, ArrowLeft } from "lucide-react";

const CATS = [
  {id:"all",name:"ALL FILES"},
  {id:"women-sarees-designer",name:"Designer Sarees"},
  {id:"women-sarees-uppada",name:"Uppada Sarees"},
  {id:"women-sarees-kanjivaram",name:"Kanjivaram Sarees"},
  {id:"women-lehengas",name:"Lehengas"},
  {id:"women-blouses",name:"Blouses"},
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
  {id:"uncategorized",name:"Uncategorized"},
];

const NAV = [
  {id:"dashboard",label:"Dashboard",icon:LayoutDashboard,href:"/admin"},
  {id:"orders",label:"Orders",icon:Package2,href:"/admin#orders"},
  {id:"products",label:"Products",icon:ShoppingBag,href:"/admin/products"},
  {id:"customers",label:"Customers",icon:Users,href:"/admin#customers"},
  {id:"sellers",label:"Sellers",icon:Store,href:"/admin#sellers"},
  {id:"team",label:"Team & Access",icon:UserCog,href:"/admin#team"},
  {id:"reports",label:"Reports",icon:BarChart3,href:"/admin#reports"},
  {id:"audit",label:"Audit Log",icon:ShieldCheck,href:"/admin#audit"},
];

function fmtEST(iso: string){ try { return new Date(iso).toLocaleString("en-US",{timeZone:"America/New_York",dateStyle:"medium",timeStyle:"short"})+" EST"; } catch { return ""; } }
function fmtLocal(iso: string, tz: string){ try { return new Date(iso).toLocaleString("en-US",{timeZone:tz,dateStyle:"medium",timeStyle:"short"})+" ("+tz+")"; } catch { return iso; } }

export default function MediaLibrary() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState({done:0,total:0});
  const [allCopied, setAllCopied] = useState(false);
  const [cat, setCat] = useState("all");
  const [userTZ, setUserTZ] = useState("UTC");
  const fileRef = useRef(null);

  useEffect(() => {
    setUserTZ(Intl.DateTimeFormat().resolvedOptions().timeZone);
    fetch("/api/media").then(r=>r.json()).then(d=>{
      if(Array.isArray(d)) setFiles(d.map((f)=>({...f,selected:false,copied:false})));
    }).catch(()=>{}).finally(()=>setLoading(false));
  }, []);

  const uploadFiles = async (fileList) => {
    if (!fileList.length) return;
    setUploading(true); setProgress({done:0,total:fileList.length});
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    for (let i=0;i<fileList.length;i++) {
      const file = fileList[i];
      const isVid = file.type.startsWith("video/");
      const sizeKB = Math.round(file.size/1024);
      const sizeStr = sizeKB>1024?(sizeKB/1024).toFixed(1)+" MB":sizeKB+" KB";
      try {
        const fd = new FormData(); fd.append("file",file); fd.append("fileName",file.name); fd.append("folder","media-library");
        const res = await fetch("/api/upload",{method:"POST",body:fd});
        const data = await res.json();
        if (data.url) {
          const now = new Date().toISOString();
          const category = cat==="all"?"uncategorized":cat;
          const saved = await fetch("/api/media",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({url:data.url,name:file.name,type:isVid?"video":"image",size:sizeStr,category,uploadedAt:now,timezone:tz,uploadedAtEST:fmtEST(now)})});
          const sd = await saved.json();
          setFiles(prev=>[{id:sd.id,url:data.url,name:file.name,type:isVid?"video":"image",size:sizeStr,category,uploadedAt:now,timezone:tz,uploadedAtEST:fmtEST(now),copied:false,selected:false},...prev]);
        }
      } catch {}
      setProgress(p=>({...p,done:i+1}));
    }
    setUploading(false); if(fileRef.current) fileRef.current.value="";
  };

  const filtered = cat==="all" ? files : files.filter(f=>f.category===cat);
  const selectedCount = filtered.filter(f=>f.selected).length;
  const toggleSelect = (url) => setFiles(prev=>prev.map(f=>f.url===url?{...f,selected:!f.selected}:f));
  const selectAll = () => { const urls=new Set(filtered.map(f=>f.url)); const allSel=filtered.every(f=>f.selected); setFiles(prev=>prev.map(f=>urls.has(f.url)?{...f,selected:!allSel}:f)); };
  const deleteSelected = async () => {
    const sel = files.filter(f=>f.selected);
    if (!sel.length||!confirm("Delete "+sel.length+" file(s)?")) return;
    const ids = sel.map(f=>f.id).filter(Boolean);
    if (ids.length) await fetch("/api/media",{method:"DELETE",headers:{"Content-Type":"application/json"},body:JSON.stringify({ids})});
    setFiles(prev=>prev.filter(f=>!f.selected));
  };
  const copyUrl = (url) => {
    navigator.clipboard.writeText(url);
    setFiles(prev=>prev.map(f=>f.url===url?{...f,copied:true}:f));
    setTimeout(()=>setFiles(prev=>prev.map(f=>f.url===url?{...f,copied:false}:f)),2000);
  };
  const copyAll = () => { navigator.clipboard.writeText(filtered.map(f=>f.url).join("\n")); setAllCopied(true); setTimeout(()=>setAllCopied(false),2000); };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex">

      {/* Sidebar */}
      <div className="w-60 flex-shrink-0 border-r border-gray-100 bg-white flex flex-col sticky top-0 h-screen">
        <div className="px-6 py-5 border-b border-gray-100">
          <a href="/" className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-gray-900 flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs font-bold">J</span>
            </div>
            <div>
              <p className="text-sm font-semibold tracking-tight text-gray-900 leading-none">Jerovin</p>
              <p className="text-[10px] text-gray-400 mt-0.5 leading-none tracking-wide">ADMIN</p>
            </div>
          </a>
        </div>
        <div className="flex-1 py-3 overflow-y-auto">
          <nav className="px-3 space-y-0.5">
            {NAV.map(m=>{
              const Icon = m.icon;
              return (
                <a key={m.id} href={m.href} className="w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg transition text-gray-600 hover:text-gray-900 hover:bg-gray-50">
                  <Icon size={17} strokeWidth={1.75}/><span>{m.label}</span>
                </a>
              );
            })}
          </nav>
          <div className="border-t border-gray-100 mt-3 pt-3 px-3">
            <a href="/admin/media" className="w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg bg-gray-900 text-white transition">
              <ImageIcon size={17} strokeWidth={1.75}/><span>Media Library</span>
            </a>
          </div>
        </div>
        <div className="px-6 py-5 border-t border-gray-100">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-semibold text-gray-600">R</span>
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-gray-900 truncate">Roy</p>
              <p className="text-[10px] text-gray-400 truncate">Super Admin</p>
            </div>
          </div>
          <a href="/" className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-900 transition">
            <ArrowLeft size={12}/> View storefront
          </a>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        <div className="flex items-center justify-between px-8 py-5 border-b border-gray-100 bg-white sticky top-0 z-10">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-gray-900">Media Library</h1>
            <p className="text-sm text-gray-400 mt-0.5">{files.length} files total</p>
          </div>
          <div className="flex gap-2">
            {selectedCount>0&&<button onClick={deleteSelected} className="flex items-center gap-1.5 px-4 py-2.5 text-sm rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition"><Trash2 size={14}/>Delete {selectedCount}</button>}
            {filtered.length>0&&<button onClick={copyAll} className={"px-4 py-2.5 text-sm rounded-lg transition "+(allCopied?"bg-emerald-50 text-emerald-700":"bg-gray-50 text-gray-700 hover:bg-gray-100")}>{allCopied?"Copied!":"Copy all URLs"}</button>}
            <button onClick={()=>fileRef.current?.click()} className="flex items-center gap-1.5 px-4 py-2.5 text-sm rounded-lg bg-gray-900 text-white hover:bg-gray-800 transition"><Upload size={14}/>Upload</button>
            <input ref={fileRef} type="file" accept="image/*,video/*" multiple onChange={e=>uploadFiles(Array.from(e.target.files||[]))} className="hidden"/>
          </div>
        </div>

        <div className="flex flex-1">
          <div className="w-56 flex-shrink-0 border-r border-gray-100 bg-white p-4 overflow-y-auto" style={{maxHeight:"calc(100vh - 81px)"}}>
            <p className="text-xs text-gray-400 tracking-wide uppercase font-medium mb-2 px-2">Categories</p>
            {CATS.map(c=>(
              <button key={c.id} onClick={()=>setCat(c.id)} className={"w-full text-left px-3 py-2 text-sm rounded-lg mb-0.5 transition flex justify-between items-center "+(cat===c.id?"bg-gray-900 text-white":"text-gray-600 hover:bg-gray-50")}>
                <span className="truncate">{c.name}</span>
                <span className={"text-xs ml-1 "+(cat===c.id?"text-gray-300":"text-gray-400")}>{c.id==="all"?files.length:files.filter(f=>f.category===c.id).length}</span>
              </button>
            ))}
          </div>

          <div className="flex-1 p-8 overflow-y-auto">
            <div className="bg-sky-50 border border-sky-100 p-4 mb-6 rounded-xl text-sm text-sky-700">
              <p className="font-medium mb-1">Bulk import workflow</p>
              <p className="text-sky-600">Select category &rarr; Upload images &rarr; Copy URLs &rarr; Paste into Excel &rarr; Bulk import in Products</p>
            </div>

            <div onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault();uploadFiles(Array.from(e.dataTransfer.files));}} onClick={()=>fileRef.current?.click()}
              className="border-2 border-dashed border-gray-200 hover:border-gray-300 transition rounded-2xl p-12 text-center cursor-pointer mb-6 bg-white">
              <Upload size={28} className="mx-auto mb-3 text-gray-300" strokeWidth={1.5}/>
              <p className="text-sm text-gray-700 font-medium mb-1">Drag & drop or click to upload</p>
              <p className="text-xs text-gray-400">JPG, PNG, WEBP, GIF, MP4, MOV &middot; uploading to: {CATS.find(c=>c.id===cat)?.name}</p>
            </div>

            {uploading&&(
              <div className="bg-white border border-gray-100 p-4 mb-6 rounded-xl">
                <div className="flex justify-between mb-2"><span className="text-sm text-gray-600">Uploading {progress.done}/{progress.total}</span><span className="text-sm text-gray-400">{Math.round((progress.done/progress.total)*100)}%</span></div>
                <div className="bg-gray-100 h-1.5 rounded-full"><div className="bg-gray-900 h-1.5 rounded-full transition-all" style={{width:(progress.done/progress.total)*100+"%"}}/></div>
              </div>
            )}

            {loading ? (
              <div className="text-center py-24 text-gray-400 text-sm">Loading...</div>
            ) : filtered.length===0 ? (
              <div className="text-center py-24 text-gray-400 text-sm">No files here &mdash; upload above</div>
            ) : (
              <>
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-sm text-gray-400">{filtered.length} file(s)</span>
                  <button onClick={selectAll} className="text-sm text-gray-500 hover:text-gray-900 transition">{filtered.every(f=>f.selected)?"Deselect all":"Select all"}</button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {filtered.map((file,i)=>(
                    <div key={i} className={"bg-white border rounded-xl overflow-hidden transition "+(file.selected?"border-gray-900":"border-gray-100")}>
                      <div className="relative aspect-square bg-gray-50 cursor-pointer" onClick={()=>toggleSelect(file.url)}>
                        {file.type==="video"
                          ? <video src={file.url} className="absolute inset-0 w-full h-full object-cover" muted playsInline onMouseEnter={e=>e.target.play().catch(()=>{})} onMouseLeave={e=>{e.target.pause();e.target.currentTime=0;}}/>
                          : <img src={file.url} alt={file.name} className="absolute inset-0 w-full h-full object-cover"/>
                        }
                        <div className={"absolute top-2 left-2 w-5 h-5 rounded-md border-2 flex items-center justify-center transition "+(file.selected?"bg-gray-900 border-gray-900":"border-white bg-white/70")}>
                          {file.selected&&<Check size={11} color="#fff"/>}
                        </div>
                        {file.type==="video"&&<div className="absolute bottom-1.5 right-1.5 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded">Video</div>}
                        <a href={file.url} target="_blank" onClick={e=>e.stopPropagation()} className="absolute top-2 right-2 w-7 h-7 bg-white/90 rounded-full flex items-center justify-center text-gray-700 hover:bg-white transition">
                          <ExternalLink size={12}/>
                        </a>
                      </div>
                      <div className="p-3">
                        <p className="text-xs text-gray-700 truncate mb-0.5">{file.name}</p>
                        {file.size&&<p className="text-xs text-gray-400 mb-2">{file.size}</p>}
                        {file.uploadedAt&&(
                          <div className="mb-2">
                            <p className="text-[10px] text-gray-400">{fmtLocal(file.uploadedAt,file.timezone||userTZ)}</p>
                          </div>
                        )}
                        <button onClick={()=>copyUrl(file.url)} className={"w-full py-1.5 text-xs rounded-lg transition "+(file.copied?"bg-emerald-50 text-emerald-700":"bg-gray-50 text-gray-600 hover:bg-gray-100")}>
                          {file.copied?"Copied!":"Copy URL"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
