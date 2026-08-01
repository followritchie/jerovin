"use client";
import { useState, useEffect, useCallback } from "react";
import { X, Check, AlertCircle, Plus, Eye, Download, Search, ChevronDown, Package, Truck, LayoutDashboard, ShoppingBag, Users, Store, UserCog, BarChart3, ShieldCheck, Image as ImageIcon, ArrowLeft } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, CartesianGrid } from "recharts";

const ROLES = [
  {id:1,name:"Super Admin",desc:"Full access"},
  {id:2,name:"Admin",desc:"Products, orders, reports"},
  {id:3,name:"Product Manager",desc:"Products only"},
  {id:4,name:"Order Manager",desc:"Orders only"},
  {id:5,name:"Finance Manager",desc:"Reports only"},
  {id:6,name:"Seller",desc:"Own products"},
  {id:7,name:"Support Staff",desc:"Orders & customers"},
];

const CATS = ["women-sarees-designer","women-sarees-uppada","women-sarees-kanjivaram","women-lehengas","women-blouses","women-kurta-sets","men-sherwanis","men-kurtas","men-blazers","men-indo-western","kids-boys","kids-girls","jewellery-rings","jewellery-earrings","jewellery-pendants","jewellery-clips","footwear","gifts","snacks","handicrafts"];

const COURIERS = ["FedEx","DHL","UPS","Blue Dart","DTDC","Delhivery","Ekart","India Post","Aramex","XpressBees","Shadowfax","Dunzo","Porter","Amazon Logistics","Flipkart Logistics","TNT","Schenker","Kuehne+Nagel","Kerry Logistics","SF Express","J&T Express","Ninjavan"];

const COUNTRIES = ["India","United States","Canada","United Kingdom","Australia","UAE","Singapore","Germany","France","Saudi Arabia","Qatar","Kuwait","Bahrain","Oman","Malaysia","Sri Lanka","Nepal","Bangladesh","Pakistan","South Africa","New Zealand","Japan","China","Other"];

const USD = 0.012;
function fmt(n:number){return"₹"+(n||0).toLocaleString("en-IN");}
function fmtUSD(n:number){return"$"+((n||0)*USD).toFixed(2);}

const MENU = [
  {id:"dashboard",label:"Dashboard",icon:LayoutDashboard},
  {id:"orders",label:"Orders",icon:Package},
  {id:"products",label:"Products",icon:ShoppingBag},
  {id:"customers",label:"Customers",icon:Users},
  {id:"sellers",label:"Sellers",icon:Store},
  {id:"team",label:"Team & Access",icon:UserCog},
  {id:"reports",label:"Reports",icon:BarChart3},
  {id:"audit",label:"Audit Log",icon:ShieldCheck},
];

export default function AdminDashboard() {
  const [tab, setTab] = useState("dashboard");
  useEffect(() => {
    const applyHash = () => {
      const hash = window.location.hash.replace("#", "");
      const validTabs = ["dashboard","orders","products","customers","sellers","team","reports","audit"];
      if (hash && validTabs.includes(hash)) setTab(hash);
    };
    applyHash();
    window.addEventListener("hashchange", applyHash);
    return () => window.removeEventListener("hashchange", applyHash);
  }, []);
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [sellers, setSellers] = useState<any[]>([]);
  const [team, setTeam] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{msg:string;ok:boolean}|null>(null);
  const [dashPeriod, setDashPeriod] = useState("month");
  const [orderFilters, setOrderFilters] = useState({period:"all",status:"",country:"",minPrice:"",maxPrice:"",dateFrom:"",dateTo:""});
  const [productCat, setProductCat] = useState("all");
  const [productSearch, setProductSearch] = useState("");
  const [expandedOrder, setExpandedOrder] = useState<number|null>(null);
  const [expandedProduct, setExpandedProduct] = useState<number|null>(null);
  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
  const [productStatusFilter, setProductStatusFilter] = useState("");
  const [productMinPrice, setProductMinPrice] = useState("");
  const [productMaxPrice, setProductMaxPrice] = useState("");
  const [expandedCustomer, setExpandedCustomer] = useState<number|null>(null);
  const [trackingForm, setTrackingForm] = useState<Record<number,{courier:string;number:string}>>({});
  const [showAddSeller, setShowAddSeller] = useState(false);
  const [showAddTeam, setShowAddTeam] = useState(false);
  const [sellerForm, setSellerForm] = useState({businessName:"",businessEmail:"",phone:"",gstNumber:"",panNumber:"",city:"",country:"India",productCategories:"",bankAccount:"",ifsc:"",commissionRate:"15"});
  const [teamForm, setTeamForm] = useState({name:"",email:"",phone:"",password:"",roleId:"2"});
  const [reportPeriod, setReportPeriod] = useState("month");
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [shareOrder, setShareOrder] = useState<any>(null);
  const [shareCopied, setShareCopied] = useState(false);

  const pop=(msg:string,ok=true)=>{setToast({msg,ok});setTimeout(()=>setToast(null),4000);};

  const load = useCallback(async()=>{
    setLoading(true);
    try {
      const [o,p,c,s,t] = await Promise.all([
        fetch("/api/orders").then(r=>r.json()).catch(()=>[]),
        fetch("/api/products").then(r=>r.json()).catch(()=>[]),
        fetch("/api/customers").then(r=>r.json()).catch(()=>[]),
        fetch("/api/sellers").then(r=>r.json()).catch(()=>[]),
        fetch("/api/team").then(r=>r.json()).catch(()=>[]),
      ]);
      const ordersWithItems = Array.isArray(o) ? await Promise.all(o.map(async (ord:any)=>{
        try {
          const detail = await fetch(`/api/orders?id=${ord.id}`).then(r=>r.json());
          return {...ord, items: detail?.items || []};
        } catch { return {...ord, items: []}; }
      })) : [];
      setOrders(ordersWithItems);
      setProducts(Array.isArray(p)?p:[]);
      setCustomers(Array.isArray(c)?c:[]);
      setSellers(Array.isArray(s)?s:[]);
      setTeam(Array.isArray(t)?t:[]);
    } catch{}
    setLoading(false);
  },[]);

  useEffect(()=>{load();},[load]);
  useEffect(()=>{
    if (tab==="audit") fetch("/api/audit-logs").then(r=>r.json()).then(d=>setAuditLogs(Array.isArray(d)?d:[])).catch(()=>{});
  },[tab]);

  const getAddr=(o:any)=>{try{return typeof o.shipping_address==="string"?JSON.parse(o.shipping_address):o.shipping_address||{};}catch{return{};}};

  const now = new Date();
  const thisMonth = now.toISOString().slice(0,7);
  const thisYear = now.getFullYear().toString();
  const thisWeek = new Date(now.getTime()-7*86400000).toISOString();
  const today = now.toISOString().slice(0,10);

  const periodFilter=(items:any[],p:string)=>{
    if(p==="today") return items.filter(o=>o.created_at?.slice(0,10)===today);
    if(p==="week") return items.filter(o=>o.created_at>thisWeek);
    if(p==="month") return items.filter(o=>o.created_at?.slice(0,7)===thisMonth);
    if(p==="year") return items.filter(o=>o.created_at?.slice(0,4)===thisYear);
    return items;
  };

  const dashOrders = periodFilter(orders, dashPeriod);
  const dashRevenue = dashOrders.reduce((s,o)=>s+(parseFloat(o.total_inr)||0),0);
  const catCounts:Record<string,number>={};
  products.forEach(p=>{const c=p.category_id||"other";catCounts[c]=(catCounts[c]||0)+1;});

  const filteredOrders = orders.filter(o=>{
    const addr = getAddr(o);
    if(orderFilters.status&&o.status!==orderFilters.status) return false;
    if(orderFilters.country&&!addr.country?.toLowerCase().includes(orderFilters.country.toLowerCase())) return false;
    if(orderFilters.minPrice&&parseFloat(o.total_inr)<parseFloat(orderFilters.minPrice)) return false;
    if(orderFilters.maxPrice&&parseFloat(o.total_inr)>parseFloat(orderFilters.maxPrice)) return false;
    if(orderFilters.dateFrom&&o.created_at?.slice(0,10)<orderFilters.dateFrom) return false;
    if(orderFilters.dateTo&&o.created_at?.slice(0,10)>orderFilters.dateTo) return false;
    if(orderFilters.period!=="all"){const f=periodFilter([o],orderFilters.period);if(!f.length) return false;}
    return true;
  });

  const filteredProducts = products.filter(p=>{
    if(productCat!=="all"&&p.category_id!==productCat) return false;
    if(productSearch&&!p.name?.toLowerCase().includes(productSearch.toLowerCase())) return false;
    if(productStatusFilter==="active"&&!p.is_active) return false;
    if(productStatusFilter==="inactive"&&p.is_active) return false;
    if(productMinPrice&&parseFloat(p.priceINR||0)<parseFloat(productMinPrice)) return false;
    if(productMaxPrice&&parseFloat(p.priceINR||0)>parseFloat(productMaxPrice)) return false;
    return true;
  });

  const inp="w-full bg-white border border-gray-200 text-gray-900 px-3 py-2.5 text-sm outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition placeholder-gray-400 rounded-lg";
  const sel=inp+" cursor-pointer";

  const updateOrderStatus = async(orderId:number, status:string)=>{
    await fetch("/api/orders",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({orderId,status})});
    load(); pop("Status updated");
  };

  const saveTracking = async(orderId:number)=>{
    const t = trackingForm[orderId];
    if(!t?.courier||!t?.number){pop("Select courier and enter tracking number",false);return;}
    await fetch("/api/orders",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({orderId,status:"shipped",trackingNumber:t.number,courier:t.courier})});
    load(); pop("Tracking saved — customer can now track order");
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex">
      {toast&&<div className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-5 py-3 text-xs tracking-widest shadow-lg rounded ${toast.ok?"bg-green-700":"bg-red-700"}`}>{toast.ok?<Check size={12}/>:<AlertCircle size={12}/>}{toast.msg}</div>}

      {/* Left sidebar */}
      <div className="w-60 flex-shrink-0 border-r border-gray-100 bg-white flex flex-col sticky top-0 h-screen">
        <div className="px-6 py-5 border-b border-gray-100">
          <a href="/" className="flex items-center gap-2.5 group">
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
          <nav className="px-3 space-y-0.5">
            {MENU.map(m=>{
              const Icon = m.icon;
              const isActive = tab===m.id;
              return (
                <button key={m.id} onClick={()=>{setTab(m.id);window.location.hash=m.id;}} className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg transition text-left ${isActive?"bg-gray-900 text-white":"text-gray-600 hover:text-gray-900 hover:bg-gray-50"}`}>
                  <Icon size={17} strokeWidth={1.75}/><span>{m.label}</span>
                </button>
              );
            })}
          </nav>
          <div className="border-t border-gray-100 mt-3 pt-3 px-3">
            <a href="/admin/media" className="w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition">
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
      <div className="flex-1 overflow-y-auto p-6">

        {/* DASHBOARD */}
        {tab==="dashboard"&&(
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400 mb-1">{new Date().toLocaleDateString("en-US",{month:"long",year:"numeric"})}</p>
                <h2 className="text-2xl font-semibold tracking-tight text-gray-900">Revenue overview</h2>
              </div>
              <div className="flex gap-1.5">
                {["today","week","month","year","all"].map(p=>(
                  <button key={p} onClick={()=>setDashPeriod(p)} className={`px-3 py-1.5 text-xs rounded-lg transition ${dashPeriod===p?"bg-gray-900 text-white":"border border-gray-200 text-gray-500 bg-white hover:border-gray-300"}`}>{p.charAt(0).toUpperCase()+p.slice(1)}</button>
                ))}
              </div>
            </div>

            {/* Gradient KPI cards */}
            <div className="grid grid-cols-4 gap-4">
              <div className="rounded-2xl p-5 text-white" style={{background:"linear-gradient(135deg,#4f63d2,#6e7ff3)"}}>
                <p className="text-xs font-medium opacity-80 tracking-wide uppercase mb-3">Total Revenue</p>
                <p className="text-3xl font-bold">{fmt(dashRevenue)}</p>
                <p className="text-xs opacity-80 mt-2">{fmtUSD(dashRevenue)} USD</p>
              </div>
              <div className="rounded-2xl p-5 text-white" style={{background:"linear-gradient(135deg,#1ca97a,#34d399)"}}>
                <p className="text-xs font-medium opacity-80 tracking-wide uppercase mb-3">Orders</p>
                <p className="text-3xl font-bold">{dashOrders.length}</p>
                <p className="text-xs opacity-80 mt-2">Avg {fmt(dashOrders.length?dashRevenue/dashOrders.length:0)}/order</p>
              </div>
              <div className="rounded-2xl p-5 text-white" style={{background:"linear-gradient(135deg,#7c3aed,#a78bfa)"}}>
                <p className="text-xs font-medium opacity-80 tracking-wide uppercase mb-3">Products</p>
                <p className="text-3xl font-bold">{products.length}</p>
                <p className="text-xs opacity-80 mt-2">{products.filter(p=>p.is_active).length} active</p>
              </div>
              <div className="rounded-2xl p-5 text-white" style={{background:"linear-gradient(135deg,#0e7490,#22d3ee)"}}>
                <p className="text-xs font-medium opacity-80 tracking-wide uppercase mb-3">Customers</p>
                <p className="text-3xl font-bold">{customers.length}</p>
                <p className="text-xs opacity-80 mt-2">{orders.filter(o=>o.created_at?.slice(0,7)===thisMonth).length} orders this month</p>
              </div>
            </div>

            {/* Charts row */}
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2 bg-white border border-gray-100 rounded-2xl p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Revenue Trend</p>
                    <p className="text-xs text-gray-400">Last 6 months</p>
                  </div>
                </div>
                {(()=>{
                  const months = Array.from({length:6}).map((_,i)=>{
                    const d = new Date(); d.setMonth(d.getMonth()-(5-i));
                    const key = d.toISOString().slice(0,7);
                    const label = d.toLocaleDateString("en-US",{month:"short"});
                    const rev = orders.filter(o=>o.created_at?.slice(0,7)===key).reduce((s,o)=>s+(parseFloat(o.total_inr)||0),0);
                    return {month:label, revenue:Math.round(rev/1000)};
                  });
                  return (
                    <ResponsiveContainer width="100%" height={220}>
                      <LineChart data={months}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9"/>
                        <XAxis dataKey="month" tick={{fontSize:11,fill:"#9ca3af"}} axisLine={false} tickLine={false}/>
                        <YAxis tick={{fontSize:11,fill:"#9ca3af"}} axisLine={false} tickLine={false} tickFormatter={(v)=>"₹"+v+"K"}/>
                        <Tooltip formatter={(v:any)=>"₹"+v+"K"} contentStyle={{borderRadius:8,border:"1px solid #f1f5f9",fontSize:12}}/>
                        <Line type="monotone" dataKey="revenue" stroke="#4f63d2" strokeWidth={2.5} dot={{r:4,fill:"#4f63d2"}}/>
                      </LineChart>
                    </ResponsiveContainer>
                  );
                })()}
              </div>

              <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
                <p className="text-sm font-semibold text-gray-900 mb-1">Category Mix</p>
                <p className="text-xs text-gray-400 mb-4">{products.length} products total</p>
                {(()=>{
                  const top = Object.entries(catCounts).sort((a,b)=>b[1]-a[1]).slice(0,5);
                  const colors = ["#4f63d2","#7c3aed","#1ca97a","#f59e0b","#0e7490"];
                  const pieData = top.map(([name,value],i)=>({name,value,fill:colors[i]}));
                  return (
                    <>
                      <ResponsiveContainer width="100%" height={140}>
                        <PieChart>
                          <Pie data={pieData} dataKey="value" innerRadius={40} outerRadius={60} paddingAngle={2}>
                            {pieData.map((entry,i)=><Cell key={i} fill={entry.fill}/>)}
                          </Pie>
                          <Tooltip contentStyle={{borderRadius:8,border:"1px solid #f1f5f9",fontSize:12}}/>
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="mt-2 space-y-1.5">
                        {pieData.map((d,i)=>(
                          <div key={i} className="flex items-center justify-between text-xs">
                            <span className="flex items-center gap-1.5 text-gray-600"><span className="w-2 h-2 rounded-full" style={{background:d.fill}}/>{d.name}</span>
                            <span className="text-gray-400">{d.value}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>

            {/* Recent orders */}
            <div className="bg-white border border-gray-100 rounded-2xl shadow-[0_1px_2px_rgba(0,0,0,0.04)] overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <p className="text-sm font-semibold text-gray-900">Recent Orders</p>
                <button onClick={()=>{setTab("orders");window.location.hash="orders";}} className="text-xs text-gray-400 hover:text-gray-900 transition">View all &rarr;</button>
              </div>
              {orders.slice(0,5).map(o=>{
                const a=getAddr(o);
                return (
                  <div key={o.id} className="flex items-center justify-between px-6 py-3.5 border-b border-gray-50 last:border-0 hover:bg-gray-50/60 transition cursor-pointer" onClick={()=>window.location.href="/admin/orders/"+o.id}>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{o.order_number}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{a.firstName} {a.lastName} &middot; {a.country}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900">{fmt(parseFloat(o.total_inr)||0)}</p>
                      <p className={`text-xs mt-0.5 font-medium ${o.status==="delivered"?"text-emerald-600":o.status==="shipped"?"text-sky-600":"text-amber-600"}`}>{(o.status||"pending").charAt(0).toUpperCase()+(o.status||"pending").slice(1)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {tab==="orders"&&(
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold tracking-tight text-gray-900">ORDERS ({filteredOrders.length})</h2>
            </div>
            {/* Filters */}
            <div className="grid grid-cols-3 lg:grid-cols-7 gap-2 bg-white border border-gray-200 p-3 rounded shadow-sm">
              <select value={orderFilters.period} onChange={e=>setOrderFilters(f=>({...f,period:e.target.value}))} className={sel}>
                <option value="all">ALL TIME</option>
                <option value="today">TODAY</option>
                <option value="week">THIS WEEK</option>
                <option value="month">THIS MONTH</option>
                <option value="year">THIS YEAR</option>
                <option value="custom">CUSTOM</option>
              </select>
              <select value={orderFilters.status} onChange={e=>setOrderFilters(f=>({...f,status:e.target.value}))} className={sel}>
                <option value="">ALL STATUS</option>
                <option value="pending">PENDING</option>
                <option value="confirmed">CONFIRMED</option>
                <option value="shipped">SHIPPED</option>
                <option value="delivered">DELIVERED</option>
                <option value="cancelled">CANCELLED</option>
              </select>
              <select value={orderFilters.country} onChange={e=>setOrderFilters(f=>({...f,country:e.target.value}))} className={sel}>
                <option value="">ALL COUNTRIES</option>
                {COUNTRIES.map(c=><option key={c} value={c}>{c}</option>)}
              </select>
              <input placeholder="Min ₹" type="number" value={orderFilters.minPrice} onChange={e=>setOrderFilters(f=>({...f,minPrice:e.target.value}))} className={inp}/>
              <input placeholder="Max ₹" type="number" value={orderFilters.maxPrice} onChange={e=>setOrderFilters(f=>({...f,maxPrice:e.target.value}))} className={inp}/>
              <input type="date" value={orderFilters.dateFrom} onChange={e=>setOrderFilters(f=>({...f,dateFrom:e.target.value}))} className={inp} title="From date"/>
              <input type="date" value={orderFilters.dateTo} onChange={e=>setOrderFilters(f=>({...f,dateTo:e.target.value}))} className={inp} title="To date"/>
            </div>

            <div className="bg-white border border-gray-100 rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.04)] overflow-hidden">
              <div className="grid grid-cols-12 gap-2 px-4 py-3 bg-gray-50 text-xs tracking-widest text-gray-700 border-b border-gray-200">
                <span className="col-span-1">IMG</span>
                <span className="col-span-2">ORDER</span>
                <span className="col-span-3">CUSTOMER</span>
                <span className="col-span-2">AMOUNT</span>
                <span className="col-span-2">STATUS</span>
                <span className="col-span-2">ACTIONS</span>
              </div>
              {filteredOrders.length===0&&<div className="text-center py-12 text-gray-600 text-xs tracking-widest">NO ORDERS FOUND</div>}
              {filteredOrders.map(o=>{
                const addr=getAddr(o);
                const totalINR=parseFloat(o.total_inr)||0;
                const tf=trackingForm[o.id]||{courier:"",number:""};
                return(
                  <div key={o.id}>
                    <div className="grid grid-cols-12 gap-2 px-4 py-3 border-b border-gray-50 hover:bg-gray-50/60 transition items-center cursor-pointer" onClick={()=>setExpandedOrder(expandedOrder===o.id?null:o.id)} onDoubleClick={()=>window.location.href="/admin/orders/"+o.id}>
                      <div className="col-span-1">
                        <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center">
                          <Package size={16} color="#6b7280"/>
                        </div>
                      </div>
                      <div className="col-span-2">
                        <p className="text-xs font-bold">{o.order_number}</p>
                        <p className="text-xs text-gray-600">{o.created_at?.slice(0,10)}</p>
                      </div>
                      <div className="col-span-3">
                        <p className="text-xs font-bold">{addr.firstName} {addr.lastName}</p>
                        <p className="text-xs text-gray-700 truncate">{addr.email}</p>
                        <p className="text-xs text-gray-600">{addr.city}, {addr.country}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-xs font-bold text-gray-900">{fmt(totalINR)}</p>
                        <p className="text-xs text-gray-600">{fmtUSD(totalINR)}</p>
                      </div>
                      <div className="col-span-2" onClick={e=>e.stopPropagation()}>
                        <select value={o.status||"pending"} onChange={e=>updateOrderStatus(o.id,e.target.value)} className={`text-xs px-2.5 py-1.5 border outline-none bg-white cursor-pointer rounded-lg font-medium ${o.status==="delivered"?"border-green-300 text-gray-900":o.status==="shipped"?"border-blue-300 text-gray-900":o.status==="confirmed"?"border-purple-300 text-gray-900":"border-yellow-300 text-gray-900"}`}>
                          <option value="pending">PENDING</option>
                          <option value="confirmed">CONFIRMED</option>
                          <option value="shipped">SHIPPED</option>
                          <option value="delivered">DELIVERED</option>
                          <option value="cancelled">CANCELLED</option>
                          <option value="returned">RETURNED</option>
                        </select>
                      </div>
                      <div className="col-span-2 flex gap-1" onClick={e=>e.stopPropagation()}>
                        <button onClick={()=>setExpandedOrder(expandedOrder===o.id?null:o.id)} className="text-xs border border-gray-800 px-2 py-1 hover:border-gray-500 text-gray-700 transition"><Eye size={10}/></button>
                        {o.tracking_number&&<span className="text-xs text-gray-900 flex items-center gap-1"><Truck size={10}/></span>}
                      </div>
                    </div>
                    {expandedOrder===o.id&&(
                      <div className="bg-gray-50 border-b border-gray-200 p-5">
                        <div className="grid grid-cols-4 gap-5">
                          <div>
                            <p className="text-xs text-gray-700 tracking-widest mb-2">SHIPPING ADDRESS</p>
                            <p className="text-xs font-bold">{addr.firstName} {addr.lastName}</p>
                            <p className="text-xs text-gray-600">{addr.address1}{addr.address2?", "+addr.address2:""}</p>
                            <p className="text-xs text-gray-600">{addr.city}, {addr.state} {addr.pincode}</p>
                            <p className="text-xs text-gray-600">{addr.country}</p>
                            <p className="text-xs text-gray-700 mt-1">{addr.email}</p>
                            <p className="text-xs text-gray-700">{addr.phone}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-700 tracking-widest mb-2">ORDER BREAKDOWN</p>
                            <p className="text-xs text-gray-600">Subtotal: {fmt(parseFloat(o.subtotal_inr)||0)}</p>
                            <p className="text-xs text-gray-600">Shipping: {fmt(parseFloat(o.shipping_inr)||0)}</p>
                            <p className="text-xs text-gray-600">Tax: {fmt(parseFloat(o.tax_inr)||0)}</p>
                            <p className="text-xs font-bold text-gray-900 mt-1">Total: {fmt(parseFloat(o.total_inr)||0)} / {fmtUSD(parseFloat(o.total_inr)||0)}</p>
                            <p className="text-xs text-gray-600 mt-1">{o.payment_method?.toUpperCase()} — {o.payment_status?.toUpperCase()}</p>
                            {o.payment_id&&<p className="text-xs text-gray-700 truncate">ID: {o.payment_id}</p>}
                          </div>
                          <div>
                            <p className="text-xs text-gray-700 tracking-widest mb-2">SHIPPING & TRACKING</p>
                            {o.tracking_number?(
                              <div className="bg-blue-50 border border-blue-200 p-3 rounded mb-3">
                                <p className="text-xs text-gray-900 font-bold">{o.courier}</p>
                                <p className="text-xs text-gray-900">{o.tracking_number}</p>
                              </div>
                            ):<p className="text-xs text-gray-600 mb-3">No tracking yet</p>}
                            <div className="flex flex-col gap-2">
                              <select value={tf.courier} onChange={e=>setTrackingForm(f=>({...f,[o.id]:{...tf,courier:e.target.value}}))} className={sel}>
                                <option value="">SELECT COURIER</option>
                                {COURIERS.map(c=><option key={c} value={c}>{c}</option>)}
                              </select>
                              <input placeholder="Tracking number" value={tf.number} onChange={e=>setTrackingForm(f=>({...f,[o.id]:{...tf,number:e.target.value}}))} className={inp}/>
                              <button onClick={()=>saveTracking(o.id)} className="w-full bg-white text-black py-2 text-xs tracking-widest font-bold hover:bg-gray-200 transition flex items-center justify-center gap-2"><Truck size={12}/>SAVE & MARK SHIPPED</button>
                            </div>
                          </div>
                          <div>
                            <p className="text-xs text-gray-700 tracking-widest mb-2">PRODUCT & CUSTOM DETAILS</p>
                            {o.items && o.items.length > 0 ? o.items.map((it:any, idx:number) => (
                              <div key={idx} className="mb-3 pb-3 border-b border-gray-200 last:border-0">
                                <p className="text-xs font-bold text-gray-900">{it.name || "Product #" + it.product_id}</p>
                                {it.size && <p className="text-xs text-gray-600">Size: {it.size}</p>}
                                {it.color && (
                                  <p className="text-xs text-gray-600 flex items-center gap-1">
                                    Colour: <span className="inline-block w-3 h-3 rounded-full border border-gray-300" style={{background: it.color}}/> {it.color}
                                  </p>
                                )}
                                {it.custom_details && (
                                  <div className="mt-1">
                                    <p className="text-xs text-gray-700 font-bold">Measurements:</p>
                                    {Object.entries(typeof it.custom_details === "string" ? JSON.parse(it.custom_details) : it.custom_details).map(([k, v]: any) => (
                                      <p key={k} className="text-xs text-gray-600 ml-2">{k}: {String(v)}</p>
                                    ))}
                                  </div>
                                )}
                                {it.special_instructions && (
                                  <p className="text-xs text-gray-600 mt-1"><span className="font-bold">Note:</span> {it.special_instructions}</p>
                                )}
                                {it.reference_image_urls && it.reference_image_urls.length > 0 && (
                                  <div className="mt-2">
                                    <p className="text-xs text-gray-700 font-bold mb-1">Reference Images:</p>
                                    <div className="flex gap-2 flex-wrap">
                                      {it.reference_image_urls.map((url: string, i: number) => (
                                        <a key={i} href={url} target="_blank" rel="noreferrer">
                                          <img src={url} alt="" className="w-12 h-12 object-cover rounded border border-gray-300"/>
                                        </a>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )) : <p className="text-xs text-gray-600">No item details available</p>}
                            <button onClick={()=>setShareOrder(o)} className="w-full mt-2 border border-gray-300 text-gray-700 py-2 text-xs tracking-widest hover:border-gray-500 hover:text-gray-900 transition rounded">
                              SHARE WITH DESIGNER / SELLER
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* PRODUCTS — styled to match Orders tab */}
        {tab==="products"&&(
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold tracking-tight text-gray-900">PRODUCTS ({filteredProducts.length})</h2>
              <a href="/admin/products" className="bg-white text-black px-4 py-2 text-xs tracking-widest font-bold hover:bg-gray-200 transition flex items-center gap-2"><Plus size={12}/>ADD / MANAGE</a>
            </div>

            <div className="grid grid-cols-3 lg:grid-cols-5 gap-2 bg-white border border-gray-200 p-3 rounded shadow-sm">
              <div className="flex items-center border border-gray-200 bg-white px-3 gap-2 rounded-lg">
                <Search size={14} color="#6b7280"/>
                <input placeholder="Search products..." value={productSearch} onChange={e=>setProductSearch(e.target.value)} className="bg-transparent text-gray-900 text-sm py-2 outline-none flex-1 placeholder-gray-400"/>
              </div>
              <select value={productCat} onChange={e=>setProductCat(e.target.value)} className={sel}>
                <option value="all">ALL CATEGORIES</option>
                {CATS.map(c=><option key={c} value={c}>{c.replace(/-/g," ")} ({products.filter(p=>p.category_id===c).length})</option>)}
              </select>
              <select value={productStatusFilter} onChange={e=>setProductStatusFilter(e.target.value)} className={sel}>
                <option value="">ALL STATUS</option>
                <option value="active">ACTIVE</option>
                <option value="inactive">INACTIVE</option>
              </select>
              <input placeholder="Min ₹" type="number" value={productMinPrice} onChange={e=>setProductMinPrice(e.target.value)} className={inp}/>
              <input placeholder="Max ₹" type="number" value={productMaxPrice} onChange={e=>setProductMaxPrice(e.target.value)} className={inp}/>
            </div>

            {selectedProducts.length>0&&(
              <div className="flex items-center gap-3 bg-gray-900 text-white px-4 py-2.5 rounded-lg">
                <span className="text-xs tracking-widest">{selectedProducts.length} SELECTED</span>
                <button onClick={async()=>{
                  await Promise.all(selectedProducts.map(id=>fetch("/api/products",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({id,is_active:true})})));
                  setSelectedProducts([]); load(); pop("Activated");
                }} className="text-xs bg-white text-gray-900 px-3 py-1.5 rounded font-bold hover:bg-gray-100 transition">ACTIVATE</button>
                <button onClick={async()=>{
                  await Promise.all(selectedProducts.map(id=>fetch("/api/products",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({id,is_active:false})})));
                  setSelectedProducts([]); load(); pop("Deactivated");
                }} className="text-xs bg-white text-gray-900 px-3 py-1.5 rounded font-bold hover:bg-gray-100 transition">DEACTIVATE</button>
                <button onClick={async()=>{
                  if(!confirm(`Delete ${selectedProducts.length} products? This cannot be undone.`)) return;
                  await Promise.all(selectedProducts.map(id=>fetch("/api/products?id="+id,{method:"DELETE"})));
                  setSelectedProducts([]); load(); pop("Deleted");
                }} className="text-xs bg-red-600 text-white px-3 py-1.5 rounded font-bold hover:bg-red-500 transition">DELETE</button>
                <button onClick={()=>setSelectedProducts([])} className="text-xs text-gray-300 hover:text-white ml-auto">CLEAR</button>
              </div>
            )}

            <div className="bg-white border border-gray-100 rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.04)] overflow-hidden">
              <div className="grid grid-cols-12 gap-2 px-4 py-3 bg-gray-50 text-xs tracking-widest text-gray-700 border-b border-gray-200 items-center">
                <span className="col-span-1 flex items-center gap-2">
                  <input type="checkbox" checked={filteredProducts.length>0&&selectedProducts.length===filteredProducts.length} onChange={e=>setSelectedProducts(e.target.checked?filteredProducts.map(p=>p.id):[])}/>
                  IMG
                </span>
                <span className="col-span-3">PRODUCT</span>
                <span className="col-span-2">CATEGORY</span>
                <span className="col-span-2">PRICE</span>
                <span className="col-span-1">STOCK</span>
                <span className="col-span-1">STATUS</span>
                <span className="col-span-2">ACTIONS</span>
              </div>
              {filteredProducts.length===0&&<div className="text-center py-12 text-gray-600 text-xs tracking-widest">NO PRODUCTS FOUND</div>}
              {filteredProducts.slice(0,100).map(p=>{
                const img=p.media?.find((m:any)=>m.type==="image")?.url;
                const checked=selectedProducts.includes(p.id);
                return(
                  <div key={p.id}>
                    <div className="grid grid-cols-12 gap-2 px-4 py-3 border-b border-gray-50 hover:bg-gray-50/60 transition items-center cursor-pointer" onClick={()=>setExpandedProduct(expandedProduct===p.id?null:p.id)}>
                      <div className="col-span-1 flex items-center gap-2" onClick={e=>e.stopPropagation()}>
                        <input type="checkbox" checked={checked} onChange={()=>setSelectedProducts(s=>checked?s.filter(id=>id!==p.id):[...s,p.id])}/>
                        {img?<img src={img} alt="" className="w-9 h-9 object-cover rounded"/>:<div className="w-9 h-9 bg-gray-200 rounded flex items-center justify-center"><Package size={14} color="#9ca3af"/></div>}
                      </div>
                      <div className="col-span-3"><p className="text-xs font-bold truncate">{p.name}</p><p className="text-xs text-gray-600">SKU: {p.sku||"—"}</p></div>
                      <p className="col-span-2 text-xs text-gray-600 truncate">{p.category_id}</p>
                      <p className="col-span-2 text-xs font-bold text-gray-900">₹{parseFloat(p.priceINR||0).toLocaleString()}</p>
                      <p className="col-span-1 text-xs text-gray-700">{p.stock||0}</p>
                      <div className="col-span-1" onClick={e=>e.stopPropagation()}>
                        <button onClick={async()=>{
                          await fetch("/api/products",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({id:p.id,is_active:!p.is_active})});
                          load();
                        }} className={`text-xs px-2 py-1 rounded font-medium ${p.is_active?"bg-green-100 text-gray-900":"bg-gray-200 text-gray-600"}`}>{p.is_active?"ACTIVE":"INACTIVE"}</button>
                      </div>
                      <div className="col-span-2 flex gap-1" onClick={e=>e.stopPropagation()}>
                        <button onClick={()=>setExpandedProduct(expandedProduct===p.id?null:p.id)} className="text-xs border border-gray-800 px-2 py-1 hover:border-gray-500 text-gray-700 transition"><Eye size={10}/></button>
                        <a href={`/admin/products?edit=${p.id}`} className="text-xs border border-gray-300 px-2 py-1 hover:border-gray-500 text-gray-700 transition">EDIT</a>
                      </div>
                    </div>
                    {expandedProduct===p.id&&(
                      <div className="bg-gray-50 border-b border-gray-200 p-5">
                        <div className="grid grid-cols-4 gap-5">
                          <div>
                            <p className="text-xs text-gray-700 tracking-widest mb-2">IMAGES</p>
                            <div className="flex flex-wrap gap-2">
                              {(p.media||[]).filter((m:any)=>m.type==="image").slice(0,4).map((m:any,i:number)=>(
                                <img key={i} src={m.url} alt="" className="w-14 h-14 object-cover rounded border border-gray-200"/>
                              ))}
                              {(!p.media||p.media.length===0)&&<p className="text-xs text-gray-500">No images uploaded</p>}
                            </div>
                          </div>
                          <div>
                            <p className="text-xs text-gray-700 tracking-widest mb-2">PRICING</p>
                            <p className="text-xs text-gray-600">Price: ₹{parseFloat(p.priceINR||0).toLocaleString()}</p>
                            <p className="text-xs text-gray-600">Compare at: {p.compareAtINR?"₹"+parseFloat(p.compareAtINR).toLocaleString():"—"}</p>
                            <p className="text-xs text-gray-600">Stock: {p.stock||0} units</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-700 tracking-widest mb-2">CATEGORY & TAGS</p>
                            <p className="text-xs text-gray-600">{p.category_id||"—"}</p>
                            <p className="text-xs text-gray-600 mt-1">{p.description?p.description.slice(0,120):"No description"}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-700 tracking-widest mb-2">QUICK ACTIONS</p>
                            <div className="flex flex-col gap-2">
                              <a href={`/admin/products?edit=${p.id}`} className="text-xs bg-white border border-gray-300 text-gray-900 px-3 py-2 rounded text-center hover:border-gray-500 transition">EDIT PRODUCT</a>
                              <button onClick={async()=>{
                                if(!confirm("Delete this product?")) return;
                                await fetch("/api/products?id="+p.id,{method:"DELETE"});
                                load(); pop("Product deleted");
                              }} className="text-xs border border-red-200 text-red-600 px-3 py-2 rounded hover:border-red-400 transition">DELETE PRODUCT</button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* CUSTOMERS */}
        {tab==="customers"&&(
          <div className="flex flex-col gap-4">
            <h2 className="text-base font-semibold tracking-tight text-gray-900">CUSTOMERS ({customers.length})</h2>
            <div className="grid grid-cols-4 gap-3">
              <div className="rounded-2xl p-5 text-white" style={{background:"linear-gradient(135deg,#6366f1,#8b5cf6)"}}>
                <p className="text-xs uppercase tracking-widest opacity-90">TOTAL CUSTOMERS</p>
                <p className="text-3xl font-bold mt-1">{customers.length}</p>
              </div>
              <div className="rounded-2xl p-5 text-white" style={{background:"linear-gradient(135deg,#10b981,#34d399)"}}>
                <p className="text-xs uppercase tracking-widest opacity-90">REPEAT CUSTOMERS</p>
                <p className="text-3xl font-bold mt-1">{customers.filter((c:any)=>orders.filter(o=>{const a=getAddr(o);return a.email===c.email;}).length>1).length}</p>
              </div>
              <div className="rounded-2xl p-5 text-white" style={{background:"linear-gradient(135deg,#8b5cf6,#a78bfa)"}}>
                <p className="text-xs uppercase tracking-widest opacity-90">TOTAL SPENT</p>
                <p className="text-3xl font-bold mt-1">{fmt(customers.reduce((s:number,c:any)=>s+orders.filter(o=>{const a=getAddr(o);return a.email===c.email;}).reduce((s2:number,o:any)=>s2+(parseFloat(o.total_inr)||0),0),0))}</p>
              </div>
              <div className="rounded-2xl p-5 text-white" style={{background:"linear-gradient(135deg,#0ea5e9,#38bdf8)"}}>
                <p className="text-xs uppercase tracking-widest opacity-90">NEW THIS MONTH</p>
                <p className="text-3xl font-bold mt-1">{customers.filter((c:any)=>{const d=new Date(c.created_at||c.createdAt||0);const n=new Date();return d.getMonth()===n.getMonth()&&d.getFullYear()===n.getFullYear();}).length}</p>
              </div>
            </div>
            <div className="bg-white border border-gray-100 rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.04)] overflow-hidden">
              <div className="grid grid-cols-12 gap-2 px-4 py-3 bg-gray-50 text-xs tracking-widest text-gray-700 border-b border-gray-200">
                <span className="col-span-3">NAME / EMAIL</span>
                <span className="col-span-2">PHONE</span>
                <span className="col-span-2">LOCATION</span>
                <span className="col-span-2">ORDERS</span>
                <span className="col-span-2">TOTAL SPENT</span>
                <span className="col-span-1">VIEW</span>
              </div>
              {customers.length===0&&<div className="text-center py-12 text-gray-600 text-xs">NO CUSTOMERS YET</div>}
              {customers.map((c:any)=>{
                const custOrders=orders.filter(o=>{const a=getAddr(o);return a.email===c.email;});
                const spent=custOrders.reduce((s:number,o:any)=>s+(parseFloat(o.total_inr)||0),0);
                return(
                  <div key={c.id}>
                    <div className="grid grid-cols-12 gap-2 px-4 py-3 border-b border-gray-50 hover:bg-gray-50/60 transition items-center">
                      <div className="col-span-3"><p className="text-xs font-bold">{c.name||"Guest"}</p><p className="text-xs text-gray-700 truncate">{c.email}</p></div>
                      <p className="col-span-2 text-xs text-gray-700">{c.phone||"—"}</p>
                      <p className="col-span-2 text-xs text-gray-700">{c.city||"—"}</p>
                      <p className="col-span-2 text-xs text-gray-700">{custOrders.length} orders</p>
                      <div className="col-span-2"><p className="text-xs font-bold text-gray-900">{fmt(spent)}</p></div>
                      <button onClick={()=>setExpandedCustomer(expandedCustomer===c.id?null:c.id)} className="col-span-1 text-xs border border-gray-800 px-2 py-1 hover:border-gray-500 text-gray-700 transition"><Eye size={10}/></button>
                    </div>
                    {expandedCustomer===c.id&&(
                      <div className="bg-gray-50 border-b border-gray-200 p-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs text-gray-700 tracking-widest mb-2">PERSONAL DETAILS</p>
                            <p className="text-xs">Name: {c.name||"—"}</p>
                            <p className="text-xs text-gray-600">Email: {c.email}</p>
                            <p className="text-xs text-gray-600">Phone: {c.phone||"—"}</p>
                            <p className="text-xs text-gray-600">DOB: {c.dob?.slice(0,10)||"—"}</p>
                            <p className="text-xs text-gray-600">Anniversary: {c.anniversary?.slice(0,10)||"—"}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-700 tracking-widest mb-2">ORDER HISTORY</p>
                            {custOrders.length===0?<p className="text-xs text-gray-600">No orders</p>:custOrders.map(o=>(
                              <div key={o.id} className="flex justify-between py-1.5 border-b border-gray-800">
                                <div><p className="text-xs font-bold">{o.order_number}</p><p className="text-xs text-gray-700">{o.created_at?.slice(0,10)}</p></div>
                                <div className="text-right"><p className="text-xs font-bold">{fmt(parseFloat(o.total_inr)||0)}</p><p className={`text-xs ${o.status==="delivered"?"text-gray-900":"text-gray-900"}`}>{o.status?.toUpperCase()}</p></div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* SELLERS */}
        {tab==="sellers"&&(
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold tracking-tight text-gray-900">SELLERS ({sellers.length})</h2>
              <button onClick={()=>setShowAddSeller(true)} className="bg-white text-black px-4 py-2 text-xs tracking-widest font-bold hover:bg-gray-200 transition flex items-center gap-2"><Plus size={12}/>ADD SELLER</button>
            </div>
            <div className="grid grid-cols-4 gap-3">
              <div className="rounded-2xl p-5 text-white" style={{background:"linear-gradient(135deg,#6366f1,#8b5cf6)"}}>
                <p className="text-xs uppercase tracking-widest opacity-90">TOTAL SELLERS</p>
                <p className="text-3xl font-bold mt-1">{sellers.length}</p>
              </div>
              <div className="rounded-2xl p-5 text-white" style={{background:"linear-gradient(135deg,#10b981,#34d399)"}}>
                <p className="text-xs uppercase tracking-widest opacity-90">ACTIVE</p>
                <p className="text-3xl font-bold mt-1">{sellers.filter((s:any)=>s.status==="active"||!s.status).length}</p>
              </div>
              <div className="rounded-2xl p-5 text-white" style={{background:"linear-gradient(135deg,#f59e0b,#fbbf24)"}}>
                <p className="text-xs uppercase tracking-widest opacity-90">AVG COMMISSION</p>
                <p className="text-3xl font-bold mt-1">{sellers.length?Math.round(sellers.reduce((s:number,x:any)=>s+(parseFloat(x.commission_rate)||15),0)/sellers.length):15}%</p>
              </div>
              <div className="rounded-2xl p-5 text-white" style={{background:"linear-gradient(135deg,#ef4444,#f87171)"}}>
                <p className="text-xs uppercase tracking-widest opacity-90">SUSPENDED</p>
                <p className="text-3xl font-bold mt-1">{sellers.filter((s:any)=>s.status==="suspended").length}</p>
              </div>
            </div>
            <div className="bg-white border border-gray-100 rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.04)] overflow-hidden">
              <div className="grid grid-cols-12 gap-2 px-4 py-3 bg-gray-50 text-xs tracking-widest text-gray-700 border-b border-gray-200">
                <span className="col-span-3">BUSINESS</span><span className="col-span-2">CONTACT</span><span className="col-span-2">LOCATION</span><span className="col-span-2">CATEGORIES</span><span className="col-span-1">GST</span><span className="col-span-1">COMM%</span><span className="col-span-1">STATUS</span>
              </div>
              {sellers.length===0&&<div className="text-center py-12 text-gray-600 text-xs">NO SELLERS YET</div>}
              {sellers.map((s:any)=>(
                <div key={s.id} className="grid grid-cols-12 gap-2 px-4 py-3 border-b border-gray-50 hover:bg-gray-50/60 transition items-center">
                  <div className="col-span-3"><p className="text-xs font-bold">{s.business_name||s.name}</p><p className="text-xs text-gray-700 truncate">{s.business_email||s.email}</p></div>
                  <p className="col-span-2 text-xs text-gray-700">{s.phone||"—"}</p>
                  <p className="col-span-2 text-xs text-gray-700">{s.city||"—"}, {s.country||"India"}</p>
                  <p className="col-span-2 text-xs text-gray-600 truncate">{s.product_categories||"—"}</p>
                  <p className="col-span-1 text-xs text-gray-600">{s.gst_number||"—"}</p>
                  <p className="col-span-1 text-xs text-gray-900">{s.commission_rate||15}%</p>
                  <span className={`col-span-1 text-xs px-1.5 py-0.5 rounded ${s.status==="active"||!s.status?"bg-green-100 text-gray-900":"bg-red-100 text-gray-900"}`}>{(s.status||"active").toUpperCase()}</span>
                </div>
              ))}
            </div>
            {showAddSeller&&(
              <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-6" onClick={()=>setShowAddSeller(false)}>
                <div className="bg-white border border-gray-100 w-full max-w-2xl p-7 rounded-2xl max-h-screen overflow-y-auto shadow-xl" onClick={e=>e.stopPropagation()}>
                  <div className="flex justify-between mb-5"><h3 className="text-base font-semibold tracking-tight text-gray-900">ADD SELLER</h3><button onClick={()=>setShowAddSeller(false)}><X size={16}/></button></div>
                  <div className="grid grid-cols-2 gap-3">
                    {[["Business Name","businessName","text"],["Business Email","businessEmail","email"],["Phone","phone","tel"],["City","city","text"],["Country","country","text"],["GST Number","gstNumber","text"],["PAN Number","panNumber","text"],["Bank Account","bankAccount","text"],["IFSC Code","ifsc","text"],["Commission %","commissionRate","number"]].map(([l,k,t])=>(
                      <div key={k}><label className="text-xs text-gray-600 mb-1 block font-medium">{l}</label>
                        <input type={t} value={(sellerForm as any)[k]} onChange={e=>setSellerForm(f=>({...f,[k]:e.target.value}))} className={inp}/></div>
                    ))}
                    <div className="col-span-2"><label className="text-xs text-gray-600 mb-1 block font-medium">PRODUCT CATEGORIES</label>
                      <input value={sellerForm.productCategories} onChange={e=>setSellerForm(f=>({...f,productCategories:e.target.value}))} placeholder="Sarees, Lehengas" className={inp}/></div>
                  </div>
                  <button onClick={async()=>{
                    const res=await fetch("/api/sellers",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(sellerForm)});
                    const d=await res.json();
                    if(d.success||d.id){pop("Seller added!");setShowAddSeller(false);load();}
                    else pop(d.error||"Failed",false);
                  }} className="w-full bg-white text-black py-3 text-xs tracking-widest font-bold hover:bg-gray-200 transition mt-4">ADD SELLER</button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TEAM */}
        {tab==="team"&&(
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold tracking-tight text-gray-900">TEAM & ACCESS ({team.length})</h2>
              <button onClick={()=>setShowAddTeam(true)} className="bg-white text-black px-4 py-2 text-xs tracking-widest font-bold hover:bg-gray-200 transition flex items-center gap-2"><Plus size={12}/>INVITE MEMBER</button>
            </div>
            <div className="grid grid-cols-4 gap-3">
              <div className="rounded-2xl p-5 text-white" style={{background:"linear-gradient(135deg,#6366f1,#8b5cf6)"}}>
                <p className="text-xs uppercase tracking-widest opacity-90">TEAM MEMBERS</p>
                <p className="text-3xl font-bold mt-1">{team.length}</p>
              </div>
              <div className="rounded-2xl p-5 text-white" style={{background:"linear-gradient(135deg,#10b981,#34d399)"}}>
                <p className="text-xs uppercase tracking-widest opacity-90">ACTIVE</p>
                <p className="text-3xl font-bold mt-1">{team.filter((m:any)=>m.is_active).length}</p>
              </div>
              <div className="rounded-2xl p-5 text-white" style={{background:"linear-gradient(135deg,#f59e0b,#fbbf24)"}}>
                <p className="text-xs uppercase tracking-widest opacity-90">INACTIVE</p>
                <p className="text-3xl font-bold mt-1">{team.filter((m:any)=>!m.is_active).length}</p>
              </div>
              <div className="rounded-2xl p-5 text-white" style={{background:"linear-gradient(135deg,#0ea5e9,#38bdf8)"}}>
                <p className="text-xs uppercase tracking-widest opacity-90">ROLES AVAILABLE</p>
                <p className="text-3xl font-bold mt-1">{ROLES.length}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-2">
              {ROLES.map((r,i)=>{
                const grads=[
                  "linear-gradient(135deg,#6366f1,#8b5cf6)",
                  "linear-gradient(135deg,#10b981,#34d399)",
                  "linear-gradient(135deg,#f59e0b,#fbbf24)",
                  "linear-gradient(135deg,#0ea5e9,#38bdf8)",
                  "linear-gradient(135deg,#ec4899,#f472b6)",
                  "linear-gradient(135deg,#8b5cf6,#a78bfa)",
                  "linear-gradient(135deg,#ef4444,#f87171)",
                ];
                return (
                  <div key={r.id} className="rounded-2xl p-4 text-white" style={{background:grads[i%grads.length]}}>
                    <p className="text-sm font-bold">{r.name}</p>
                    <p className="text-xs mt-0.5 opacity-90">{r.desc}</p>
                  </div>
                );
              })}
            </div>
            <div className="bg-white border border-gray-100 rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.04)] overflow-hidden">
              <div className="grid grid-cols-12 gap-2 px-4 py-3 bg-gray-50 text-xs tracking-widest text-gray-700 border-b border-gray-200">
                <span className="col-span-3">NAME</span><span className="col-span-4">EMAIL</span><span className="col-span-2">ROLE</span><span className="col-span-2">STATUS</span><span className="col-span-1">DEL</span>
              </div>
              {team.length===0&&<div className="text-center py-12 text-gray-600 text-xs">NO TEAM MEMBERS YET</div>}
              {team.map((m:any)=>(
                <div key={m.id} className="grid grid-cols-12 gap-2 px-4 py-3 border-b border-gray-50 hover:bg-gray-50/60 transition items-center">
                  <p className="col-span-3 text-xs font-bold">{m.name}</p>
                  <p className="col-span-4 text-xs text-gray-600 truncate">{m.email}</p>
                  <p className="col-span-2 text-xs text-gray-700">{m.role_name||"Admin"}</p>
                  <span className={`col-span-2 text-xs px-2 py-0.5 rounded w-fit ${m.is_active?"bg-green-100 text-gray-900":"bg-yellow-100 text-gray-900"}`}>{m.is_active?"ACTIVE":"INACTIVE"}</span>
                  <button onClick={async()=>{if(confirm("Remove?")){await fetch(`/api/team?id=${m.id}`,{method:"DELETE"});load();pop("Removed");}}} className="col-span-1 text-xs border border-red-200 px-2 py-1 hover:border-red-400 text-gray-600 hover:text-gray-900 transition"><X size={10}/></button>
                </div>
              ))}
            </div>
            {showAddTeam&&(
              <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-6" onClick={()=>setShowAddTeam(false)}>
                <div className="bg-white border border-gray-100 w-full max-w-md p-7 rounded-2xl shadow-xl" onClick={e=>e.stopPropagation()}>
                  <div className="flex justify-between mb-5"><h3 className="text-base font-semibold tracking-tight text-gray-900">INVITE MEMBER</h3><button onClick={()=>setShowAddTeam(false)}><X size={16}/></button></div>
                  <div className="flex flex-col gap-3">
                    {[["Full Name","name","text"],["Email","email","email"],["Phone","phone","tel"],["Password","password","password"]].map(([l,k,t])=>(
                      <div key={k}><label className="text-xs text-gray-600 mb-1 block font-medium">{l}</label>
                        <input type={t} value={(teamForm as any)[k]} onChange={e=>setTeamForm(f=>({...f,[k]:e.target.value}))} className={inp}/></div>
                    ))}
                    <div><label className="text-xs text-gray-600 mb-1 block font-medium">ROLE</label>
                      <select value={teamForm.roleId} onChange={e=>setTeamForm(f=>({...f,roleId:e.target.value}))} className={sel}>
                        {ROLES.map(r=><option key={r.id} value={r.id}>{r.name} — {r.desc}</option>)}
                      </select>
                    </div>
                    <button onClick={async()=>{
                      if(!teamForm.name||!teamForm.email||!teamForm.password){pop("All fields required",false);return;}
                      const res=await fetch("/api/team",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name:teamForm.name,email:teamForm.email,password:teamForm.password,roleId:parseInt(teamForm.roleId)})});
                      const d=await res.json();
                      if(d.success||d.id){pop("Member added!");setShowAddTeam(false);load();setTeamForm({name:"",email:"",phone:"",password:"",roleId:"2"});}
                      else pop(d.error||"Failed",false);
                    }} className="w-full bg-white text-black py-3 text-xs tracking-widest font-bold hover:bg-gray-200 transition mt-2">ADD MEMBER</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* REPORTS */}
        {tab==="reports"&&(()=>{
          const rOrders=periodFilter(orders,reportPeriod);
          const rev=rOrders.reduce((s,o)=>s+(parseFloat(o.total_inr)||0),0);
          const countryCounts:Record<string,number>={};
          rOrders.forEach(o=>{const a=getAddr(o);const raw=a.country||"Unknown";const c=raw.trim().toLowerCase().replace(/\b\w/g,(ch:string)=>ch.toUpperCase());countryCounts[c]=(countryCounts[c]||0)+1;});
          return(
            <div className="flex flex-col gap-5">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold tracking-tight text-gray-900">REPORTS & ANALYTICS</h2>
                <div className="flex gap-1.5">
                  {["week","month","year","all"].map(p=>(
                    <button key={p} onClick={()=>setReportPeriod(p)} className={`px-3 py-1.5 text-xs tracking-widest transition rounded ${reportPeriod===p?"bg-gray-900 text-white":"border border-gray-200 text-gray-500 bg-white hover:border-gray-300"}`}>{p.toUpperCase()}</button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-4 gap-3">
                {[
                  ["GROSS REVENUE",fmt(rev)+" / "+fmtUSD(rev),"linear-gradient(135deg,#6366f1,#8b5cf6)"],
                  ["ORDERS",rOrders.length,"linear-gradient(135deg,#0ea5e9,#38bdf8)"],
                  ["DELIVERED",rOrders.filter(o=>o.status==="delivered").length,"linear-gradient(135deg,#10b981,#34d399)"],
                  ["PENDING",rOrders.filter(o=>o.status==="pending").length,"linear-gradient(135deg,#f59e0b,#fbbf24)"]
                ].map(([l,v,grad])=>(
                  <div key={String(l)} className="rounded-2xl p-6 text-white" style={{background:String(grad)}}>
                    <p className="text-xs tracking-widest mb-2 uppercase opacity-90">{l}</p>
                    <p className="text-lg font-bold">{v}</p>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white border border-gray-100 p-6 rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
                  <p className="text-xs text-gray-700 tracking-widest mb-3 uppercase">ORDERS BY COUNTRY</p>
                  {Object.entries(countryCounts).sort((a,b)=>b[1]-a[1]).slice(0,8).map(([country,cnt])=>(
                    <div key={country} className="flex items-center gap-2 mb-2">
                      <span className="text-xs text-gray-600 w-28 truncate">{country}</span>
                      <div className="flex-1 bg-gray-100 h-1.5 rounded-full"><div className="bg-gray-900 h-1.5 rounded-full" style={{width:`${(cnt/rOrders.length*100)||0}%`}}/></div>
                      <span className="text-xs text-gray-700 w-5 text-right">{cnt}</span>
                    </div>
                  ))}
                </div>
                <div className="bg-white border border-gray-100 p-6 rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
                  <p className="text-xs text-gray-700 tracking-widest mb-3 uppercase">PRODUCTS BY CATEGORY</p>
                  {Object.entries(catCounts).sort((a,b)=>b[1]-a[1]).slice(0,8).map(([cat,cnt])=>(
                    <div key={cat} className="flex items-center gap-2 mb-2">
                      <span className="text-xs text-gray-600 w-40 truncate">{cat}</span>
                      <div className="flex-1 bg-gray-100 h-1.5 rounded-full"><div className="bg-gray-900 h-1.5 rounded-full" style={{width:`${(cnt/products.length*100)||0}%`}}/></div>
                      <span className="text-xs text-gray-700 w-5 text-right">{cnt}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white border border-gray-100 p-6 rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-xs text-gray-600 tracking-widest">ORDER EXPORT FOR CA / TAX TEAM</p>
                  <button onClick={()=>{
                    const rows=rOrders.map(o=>{const a=getAddr(o);return{"Order":o.order_number,"Date":o.created_at?.slice(0,10),"Customer":a.firstName+" "+a.lastName,"Email":a.email,"Phone":a.phone,"Address":a.address1,"City":a.city,"State":a.state,"Country":a.country,"Subtotal INR":o.subtotal_inr,"Shipping INR":o.shipping_inr,"Tax INR":o.tax_inr,"Total INR":o.total_inr,"Total USD":((parseFloat(o.total_inr)||0)*USD).toFixed(2),"Payment":o.payment_method,"Pay Status":o.payment_status,"Order Status":o.status};});
                    const csv=[Object.keys(rows[0]||{}).join(","),...rows.map(r=>Object.values(r).map(v=>`"${v||""}"`).join(","))].join("\n");
                    const a=document.createElement("a");a.href="data:text/csv;charset=utf-8,"+encodeURIComponent(csv);a.download="jerovin_orders_"+reportPeriod+".csv";a.click();
                    pop("Report downloaded!");
                  }} className="flex items-center gap-2 bg-white text-black px-4 py-2 text-xs tracking-widest font-bold hover:bg-gray-200 transition"><Download size={12}/>DOWNLOAD CSV</button>
                </div>
                {rOrders.slice(0,8).map(o=>{const a=getAddr(o);return(
                  <div key={o.id} className="flex justify-between py-2 border-b border-gray-200 text-xs">
                    <span className="text-gray-700">{o.order_number}</span>
                    <span className="text-gray-600">{a.firstName} {a.lastName}</span>
                    <span className="text-gray-700">{a.country}</span>
                    <span className="text-gray-900 font-bold">{fmt(parseFloat(o.total_inr)||0)}</span>
                    <span className="text-gray-600">{fmtUSD(parseFloat(o.total_inr)||0)}</span>
                    <span className={o.status==="delivered"?"text-gray-900":"text-gray-900"}>{o.status?.toUpperCase()}</span>
                  </div>
                );})}
              </div>
            </div>
          );
        })()}

        {shareOrder && (
          <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-6" onClick={()=>setShareOrder(null)}>
            <div className="bg-white border border-gray-100 w-full max-w-lg p-7 rounded-2xl shadow-xl" onClick={e=>e.stopPropagation()}>
              <div className="flex justify-between mb-4">
                <h3 className="text-base font-semibold tracking-tight text-gray-900">SHARE PRODUCTION DETAILS</h3>
                <button onClick={()=>setShareOrder(null)}><X size={16} color="#111827"/></button>
              </div>
              <p className="text-xs text-gray-500 mb-4">Customer name, email, phone, and address are excluded. Only the order reference and product details below will be shared.</p>
              <div className="bg-gray-50 border border-gray-200 p-4 rounded text-xs text-gray-700 max-h-64 overflow-y-auto">
                <p className="font-bold text-gray-900">Order Ref: {shareOrder.order_number}</p>
                {shareOrder.items && shareOrder.items.map((it:any, idx:number) => (
                  <div key={idx} className="mt-2 pt-2 border-t border-gray-200 first:border-0 first:mt-0 first:pt-0">
                    <p className="font-bold">{it.name || "Product #" + it.product_id}</p>
                    {it.size && <p>Size: {it.size}</p>}
                    {it.color && <p>Colour: {it.color}</p>}
                    {it.custom_details && Object.entries(typeof it.custom_details === "string" ? JSON.parse(it.custom_details) : it.custom_details).map(([k,v]:any)=>(
                      <p key={k}>{k}: {String(v)}</p>
                    ))}
                    {it.special_instructions && <p>Note: {it.special_instructions}</p>}
                    {it.reference_image_urls && it.reference_image_urls.length > 0 && (
                      <p>Reference images: {it.reference_image_urls.length} attached</p>
                    )}
                  </div>
                ))}
              </div>
              <button onClick={()=>{
                const text = "Order Ref: " + shareOrder.order_number + "\n" + (shareOrder.items||[]).map((it:any)=>{
                  const cd = it.custom_details ? (typeof it.custom_details==="string"?JSON.parse(it.custom_details):it.custom_details) : {};
                  const measurements = Object.entries(cd).map(([k,v])=>k+": "+v).join(", ");
                  const imgs = (it.reference_image_urls||[]).join(", ");
                  return "\nProduct: " + (it.name||it.product_id) + "\nSize: " + (it.size||"-") + "\nColour: " + (it.color||"-") + "\nMeasurements: " + (measurements||"-") + "\nNote: " + (it.special_instructions||"-") + "\nReference images: " + (imgs||"none");
                }).join("\n");
                navigator.clipboard.writeText(text);
                setShareCopied(true);
                setTimeout(()=>setShareCopied(false), 2000);
              }} className="w-full bg-gray-900 text-white py-3 text-sm font-medium hover:bg-gray-800 transition mt-4 rounded-xl">
                {shareCopied ? "✓ COPIED — PASTE TO SELLER/DESIGNER" : "COPY SHAREABLE DETAILS"}
              </button>
            </div>
          </div>
        )}

        {tab==="audit"&&(
          <div className="flex flex-col gap-4">
            <h2 className="text-base font-semibold tracking-tight">AUDIT LOG ({auditLogs.length})</h2>
            <p className="text-xs text-gray-700">Complete history of product, price, order, and account changes across the platform.</p>
            <div className="grid grid-cols-4 gap-3">
              <div className="rounded-2xl p-5 text-white" style={{background:"linear-gradient(135deg,#6366f1,#8b5cf6)"}}>
                <p className="text-xs uppercase tracking-widest opacity-90">TOTAL EVENTS</p>
                <p className="text-3xl font-bold mt-1">{auditLogs.length}</p>
              </div>
              <div className="rounded-2xl p-5 text-white" style={{background:"linear-gradient(135deg,#10b981,#34d399)"}}>
                <p className="text-xs uppercase tracking-widest opacity-90">PRODUCT CHANGES</p>
                <p className="text-3xl font-bold mt-1">{auditLogs.filter((l:any)=>l.entity_type==="product").length}</p>
              </div>
              <div className="rounded-2xl p-5 text-white" style={{background:"linear-gradient(135deg,#f59e0b,#fbbf24)"}}>
                <p className="text-xs uppercase tracking-widest opacity-90">ORDER CHANGES</p>
                <p className="text-3xl font-bold mt-1">{auditLogs.filter((l:any)=>l.entity_type==="order").length}</p>
              </div>
              <div className="rounded-2xl p-5 text-white" style={{background:"linear-gradient(135deg,#0ea5e9,#38bdf8)"}}>
                <p className="text-xs uppercase tracking-widest opacity-90">ACCOUNT CHANGES</p>
                <p className="text-3xl font-bold mt-1">{auditLogs.filter((l:any)=>l.entity_type==="account"||l.entity_type==="user").length}</p>
              </div>
            </div>
            <div className="bg-white border border-gray-100 rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.04)] overflow-hidden">
              <div className="grid grid-cols-12 gap-2 px-4 py-3 bg-gray-50 text-xs tracking-widest text-gray-700 border-b border-gray-200">
                <span className="col-span-2">WHEN</span>
                <span className="col-span-3">USER</span>
                <span className="col-span-2">ACTION</span>
                <span className="col-span-2">ENTITY</span>
                <span className="col-span-3">CHANGE</span>
              </div>
              {auditLogs.length===0&&<div className="text-center py-12 text-gray-600 text-xs">NO AUDIT EVENTS YET</div>}
              {auditLogs.map((log)=>(
                <div key={log.id} className="grid grid-cols-12 gap-2 px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition items-start">
                  <p className="col-span-2 text-xs text-gray-700">{log.created_at ? log.created_at.slice(0,16).replace("T"," ") : ""}</p>
                  <p className="col-span-3 text-xs text-gray-700 truncate">{log.user_email || "System"}</p>
                  <p className="col-span-2 text-xs font-bold text-gray-900">{log.action}</p>
                  <p className="col-span-2 text-xs text-gray-600">{log.entity_type} #{log.entity_id}</p>
                  <div className="col-span-3 text-xs text-gray-700">
                    {log.before_value && <p className="truncate">From: {JSON.stringify(log.before_value).slice(0,40)}</p>}
                    {log.after_value && <p className="truncate text-gray-700">To: {JSON.stringify(log.after_value).slice(0,40)}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
