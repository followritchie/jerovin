"use client";
import { useState, useEffect, useRef } from "react";
import Nav from "../components/Nav";
import { Package, User, Heart, MapPin, LogOut } from "lucide-react";
import {
  firebaseAuth,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  GoogleAuthProvider,
  signInWithPopup,
} from "../lib/firebase";

const inp = "w-full bg-black border border-gray-700 text-white px-4 py-3 text-xs tracking-widest outline-none focus:border-white transition placeholder-gray-600";

const COUNTRY_CODES = [
  { code: "+1", label: "US/CA +1" },
  { code: "+44", label: "UK +44" },
  { code: "+91", label: "IN +91" },
  { code: "+61", label: "AU +61" },
  { code: "+971", label: "UAE +971" },
  { code: "+65", label: "SG +65" },
  { code: "+49", label: "DE +49" },
  { code: "+33", label: "FR +33" },
  { code: "+81", label: "JP +81" },
  { code: "+86", label: "CN +86" },
  { code: "+27", label: "ZA +27" },
  { code: "+55", label: "BR +55" },
  { code: "+92", label: "PK +92" },
  { code: "+880", label: "BD +880" },
  { code: "+94", label: "LK +94" },
];

export default function AccountPage() {
  const [mode, setMode] = useState<"login"|"register"|"phone"|"forgot"|"reset">("login");
  const [form, setForm] = useState({name:"",email:"",password:"",phone:"",countryCode:"+1",dob:"",anniversary:""});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [user, setUser] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [tab, setTab] = useState("orders");
  const [mounted, setMounted] = useState(false);

  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [confirmationResult, setConfirmationResult] = useState<any>(null);
  const recaptchaRef = useRef<HTMLDivElement>(null);
  const verifierRef = useRef<any>(null);

  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");

  useEffect(()=>{
    setMounted(true);
    const stored = localStorage.getItem("jerovin_user");
    if (stored) { try { const u=JSON.parse(stored); setUser(u); fetchOrders(u.email, u.phone); } catch {} }

  },[]);

  const fetchOrders = async (email?: string, phone?: string) => {
    if (!email && !phone) return;
    try {
      const params = email ? `email=${encodeURIComponent(email)}` : `phone=${encodeURIComponent(phone!)}`;
      const res = await fetch(`/api/orders?${params}`);
      const data = await res.json();
      setOrders(Array.isArray(data)?data:[]);
    } catch {}
  };

  const finishLogin = (userData: any) => {
    localStorage.setItem("jerovin_user", JSON.stringify(userData));
    setUser(userData);
    if (userData.email || userData.phone) fetchOrders(userData.email, userData.phone);
  };

  const handleSubmit = async () => {
    setLoading(true); setError("");
    try {
      const combinedPhone = mode === "register" && form.phone
        ? `${form.countryCode}${form.phone.replace(/\D/g,"")}`
        : form.phone;
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({action: mode, ...form, phone: combinedPhone}),
      });
      const data = await res.json();
      if (data.error) { setError(data.error); setLoading(false); return; }
      finishLogin(data.user || data);
    } catch { setError("Connection error. Try again."); }
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    setError(""); setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(firebaseAuth, provider);
      const googleUser = result.user;
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({ action: "google", email: googleUser.email, name: googleUser.displayName }),
      });
      const data = await res.json();
      if (data.error) { setError(data.error); }
      else { finishLogin(data.user || data); }
    } catch (err: any) {
      console.error("Google login error:", err);
      if (err.code === "auth/popup-closed-by-user") setError("Sign-in was cancelled.");
      else setError("Google sign-in failed. Please try again.");
    }
    setLoading(false);
  };

  const setupRecaptcha = () => {
    if (verifierRef.current) return verifierRef.current;
    const verifier = new RecaptchaVerifier(firebaseAuth, recaptchaRef.current!, { size: "invisible" });
    verifierRef.current = verifier;
    return verifier;
  };

  const sendOtp = async () => {
    setError(""); setLoading(true);
    try {
      const digitsOnly = form.phone.replace(/\D/g,"");
      if (digitsOnly.length < 6) {
        setError("Enter a valid phone number");
        setLoading(false); return;
      }
      const phoneFormatted = `${form.countryCode}${digitsOnly}`;
      const verifier = setupRecaptcha();
      const confirmation = await signInWithPhoneNumber(firebaseAuth, phoneFormatted, verifier);
      setConfirmationResult(confirmation);
      setOtpSent(true);
    } catch (err: any) {
      console.error("OTP send error:", err);
      if (err.code === "auth/too-many-requests") setError("Too many attempts. Please wait a few minutes and try again.");
      else if (err.code === "auth/invalid-phone-number") setError("That phone number format isn't valid. Check the country code and number.");
      else setError("Could not send code. Check the number and try again.");
    }
    setLoading(false);
  };

  const verifyOtp = async () => {
    setError(""); setLoading(true);
    try {
      const result = await confirmationResult.confirm(otpCode);
      const phoneUser = result.user;
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({ action: "phone-verify", phone: phoneUser.phoneNumber, name: form.name || undefined }),
      });
      const data = await res.json();
      if (data.error) { setError(data.error); setLoading(false); return; }
      finishLogin(data.user || data);
    } catch (err: any) {
      console.error("OTP verify error:", err);
      setError("Incorrect code. Please try again.");
    }
    setLoading(false);
  };

  const sendResetCode = async () => {
    setError(""); setInfo(""); setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({ email: form.email }),
      });
      const data = await res.json();
      if (data.error) { setError(data.error); setLoading(false); return; }
      setInfo("If that email exists, a reset code has been sent.");
      setMode("reset");
    } catch { setError("Connection error. Try again."); }
    setLoading(false);
  };

  const resetPassword = async () => {
    setError(""); setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({ email: form.email, code: resetCode, newPassword }),
      });
      const data = await res.json();
      if (data.error) { setError(data.error); setLoading(false); return; }
      setInfo("Password updated. Please sign in.");
      setMode("login");
      setForm(f=>({...f, password: ""}));
    } catch { setError("Connection error. Try again."); }
    setLoading(false);
  };

  const logout = () => { localStorage.removeItem("jerovin_user"); setUser(null); setOrders([]); };
  const getAddr = (o:any) => { try { return typeof o.shipping_address==="string"?JSON.parse(o.shipping_address):o.shipping_address||{}; } catch { return {}; } };

  if (!mounted) return null;

  if (!user) return (
    <main className="min-h-screen bg-black text-white pb-16 lg:pb-0">
      <Nav/>
      <div className="max-w-md mx-auto px-6 py-20">
        <p className="text-xs tracking-[0.3em] text-gray-500 mb-3">JEROVIN MEMBERS</p>
        <h1 className="text-3xl font-bold tracking-tight mb-2 leading-tight">
          {mode==="register" ? "Join the world of Jerovin" :
           mode==="phone" ? "Sign in with your phone" :
           mode==="forgot" ? "Reset your password" :
           mode==="reset" ? "Set a new password" :
           "Your style, your story"}
        </h1>
        <p className="text-gray-500 text-sm mb-10">
          {mode==="register" ? "Create an account for faster checkout, order tracking, and early access to new collections." :
           mode==="phone" ? "We'll text you a one-time code, anywhere in the world." :
           mode==="forgot" ? "Enter your email and we'll send you a code to reset your password." :
           mode==="reset" ? "Enter the code we sent you and choose a new password." :
           "Sign in to track orders, save addresses, and check out faster."}
        </p>

        {(mode === "login" || mode === "register") && (
          <div className="flex flex-col gap-4 mb-8">
            {mode==="register"&&<input placeholder="FULL NAME" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} className={inp}/>}
            <input placeholder="EMAIL ADDRESS" type="email" value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))} className={inp}/>
            <input placeholder="PASSWORD" type="password" value={form.password} onChange={e=>setForm(f=>({...f,password:e.target.value}))} className={inp}/>

            {mode==="login" && (
              <button onClick={()=>{setMode("forgot");setError("");setInfo("");}} className="text-xs text-gray-500 hover:text-white tracking-widest transition self-end -mt-1">
                Forgot password?
              </button>
            )}

            {mode==="register"&&<>
              <div className="flex gap-2">
                <select value={form.countryCode} onChange={e=>setForm(f=>({...f,countryCode:e.target.value}))} className={inp + " w-20 flex-shrink-0 px-2"}>
                  {COUNTRY_CODES.map(c => <option key={c.code} value={c.code}>{c.code}</option>)}
                </select>
                <input placeholder="PHONE NUMBER" type="tel" value={form.phone} onChange={e=>setForm(f=>({...f,phone:e.target.value}))} className={inp + " flex-1"}/>
              </div>
              <div><label className="text-xs text-gray-500 tracking-widest mb-1 block">DATE OF BIRTH (for birthday offers)</label>
                <input type="date" value={form.dob} onChange={e=>setForm(f=>({...f,dob:e.target.value}))} className={inp}/></div>
              <div><label className="text-xs text-gray-500 tracking-widest mb-1 block">ANNIVERSARY DATE (optional)</label>
                <input type="date" value={form.anniversary} onChange={e=>setForm(f=>({...f,anniversary:e.target.value}))} className={inp}/></div>
            </>}

            {error&&<p className="text-red-500 text-xs tracking-widest">{error}</p>}
            {info&&<p className="text-green-500 text-xs tracking-widest">{info}</p>}

            <button onClick={handleSubmit} disabled={loading} className="w-full bg-white text-black py-4 text-xs tracking-widest font-bold hover:bg-gray-200 transition disabled:opacity-50 mt-1">
              {loading?"PLEASE WAIT...":mode==="login"?"SIGN IN":"CREATE ACCOUNT"}
            </button>
            <button onClick={()=>{setMode(m=>m==="login"?"register":"login");setError("");setInfo("");}} className="text-xs text-gray-500 hover:text-white tracking-widest transition text-center">
              {mode==="login"?"Don't have an account? REGISTER →":"Already have an account? SIGN IN →"}
            </button>
          </div>
        )}

        {mode === "forgot" && (
          <div className="flex flex-col gap-4 mb-8">
            <input placeholder="EMAIL ADDRESS" type="email" value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))} className={inp}/>
            {error&&<p className="text-red-500 text-xs tracking-widest">{error}</p>}
            {info&&<p className="text-green-500 text-xs tracking-widest">{info}</p>}
            <button onClick={sendResetCode} disabled={loading} className="w-full bg-white text-black py-4 text-xs tracking-widest font-bold hover:bg-gray-200 transition disabled:opacity-50">
              {loading ? "SENDING..." : "SEND RESET CODE"}
            </button>
            <button onClick={()=>{setMode("login");setError("");setInfo("");}} className="text-xs text-gray-500 hover:text-white tracking-widest transition text-center">
              ← Back to sign in
            </button>
          </div>
        )}

        {mode === "reset" && (
          <div className="flex flex-col gap-4 mb-8">
            <p className="text-xs text-gray-400 tracking-widest">Code sent to {form.email}</p>
            <input placeholder="6-DIGIT RESET CODE" value={resetCode} onChange={e=>setResetCode(e.target.value)} className={inp}/>
            <input placeholder="NEW PASSWORD" type="password" value={newPassword} onChange={e=>setNewPassword(e.target.value)} className={inp}/>
            {error&&<p className="text-red-500 text-xs tracking-widest">{error}</p>}
            {info&&<p className="text-green-500 text-xs tracking-widest">{info}</p>}
            <button onClick={resetPassword} disabled={loading} className="w-full bg-white text-black py-4 text-xs tracking-widest font-bold hover:bg-gray-200 transition disabled:opacity-50">
              {loading ? "UPDATING..." : "SET NEW PASSWORD"}
            </button>
            <button onClick={()=>{setMode("login");setError("");setInfo("");}} className="text-xs text-gray-500 hover:text-white tracking-widest transition text-center">
              ← Back to sign in
            </button>
          </div>
        )}

        {mode === "phone" && (
          <div className="flex flex-col gap-4 mb-8">
            {!otpSent ? (
              <>
                <div className="flex gap-2">
                  <select value={form.countryCode} onChange={e=>setForm(f=>({...f,countryCode:e.target.value}))} className={inp + " w-20 flex-shrink-0 px-2"}>
                    {COUNTRY_CODES.map(c => <option key={c.code} value={c.code}>{c.code}</option>)}
                  </select>
                  <input placeholder="PHONE NUMBER" value={form.phone} onChange={e=>setForm(f=>({...f,phone:e.target.value}))} className={inp + " flex-1"}/>
                </div>
                {error && <p className="text-red-500 text-xs tracking-widest">{error}</p>}
                <button onClick={sendOtp} disabled={loading} className="w-full bg-white text-black py-4 text-xs tracking-widest font-bold hover:bg-gray-200 transition disabled:opacity-50">
                  {loading ? "SENDING CODE..." : "SEND CODE"}
                </button>
              </>
            ) : (
              <>
                <p className="text-xs text-gray-400 tracking-widest">Code sent to {form.countryCode}{form.phone}</p>
                <input placeholder="ENTER 6-DIGIT CODE" value={otpCode} onChange={e=>setOtpCode(e.target.value)} className={inp}/>
                {error && <p className="text-red-500 text-xs tracking-widest">{error}</p>}
                <button onClick={verifyOtp} disabled={loading} className="w-full bg-white text-black py-4 text-xs tracking-widest font-bold hover:bg-gray-200 transition disabled:opacity-50">
                  {loading ? "VERIFYING..." : "VERIFY & SIGN IN"}
                </button>
                <button onClick={()=>{setOtpSent(false);setOtpCode("");setError("");}} className="text-xs text-gray-500 hover:text-white tracking-widest transition text-center">
                  ← Use a different number
                </button>
              </>
            )}
            <button onClick={()=>{setMode("login");setError("");setOtpSent(false);}} className="text-xs text-gray-500 hover:text-white tracking-widest transition text-center mt-2">
              ← Back to sign in
            </button>
          </div>
        )}

        {(mode === "login" || mode === "register" || mode === "phone") && (
          <>
            <div className="flex items-center gap-3 mb-6">
              <div className="flex-1 h-px bg-gray-800"/>
              <span className="text-gray-600 text-xs tracking-widest">OR CONTINUE WITH</span>
              <div className="flex-1 h-px bg-gray-800"/>
            </div>
            <div className="flex flex-col gap-3">
              <button onClick={handleGoogleLogin} disabled={loading} className="w-full flex items-center justify-center gap-3 border border-gray-700 hover:border-white py-3.5 text-xs tracking-widest font-bold transition disabled:opacity-50">
                <svg width="16" height="16" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.93c.87-2.6 3.3-4.62 6.16-4.62z"/></svg>
                CONTINUE WITH GOOGLE
              </button>
              {mode !== "phone" && (
                <button onClick={()=>{setMode("phone");setError("");setOtpSent(false);}} className="w-full flex items-center justify-center gap-3 border border-gray-700 hover:border-white py-3.5 text-xs tracking-widest font-bold transition">
                  📱 CONTINUE WITH PHONE
                </button>
              )}
            </div>
          </>
        )}

        <div ref={recaptchaRef}/>
      </div>
    </main>
  );

  return (
    <main className="min-h-screen bg-black text-white pb-16 lg:pb-0">
      <Nav/>
      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-xl font-bold tracking-widest">MY ACCOUNT</h1>
            <p className="text-xs text-gray-500 tracking-widest mt-1">{user.email || user.phone}</p>
          </div>
          <button onClick={logout} className="flex items-center gap-2 text-xs text-gray-500 hover:text-white tracking-widest transition"><LogOut size={14}/>SIGN OUT</button>
        </div>

        <div className="flex gap-0 border-b border-gray-800 mb-8">
          {[{id:"orders",label:"MY ORDERS",icon:<Package size={12}/>},{id:"profile",label:"PROFILE",icon:<User size={12}/>},{id:"wishlist",label:"WISHLIST",icon:<Heart size={12}/>},{id:"addresses",label:"ADDRESSES",icon:<MapPin size={12}/>}].map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)} className={`flex items-center gap-2 px-5 py-3 text-xs tracking-widest border-b-2 transition ${tab===t.id?"border-white text-white":"border-transparent text-gray-500 hover:text-gray-300"}`}>
              {t.icon}{t.label}
            </button>
          ))}
        </div>

        {tab==="orders"&&(
          <div className="flex flex-col gap-4">
            {orders.length===0?(
              <div className="text-center py-20 border border-gray-800">
                <Package size={40} color="#374151" className="mx-auto mb-4"/>
                <p className="text-gray-500 text-xs tracking-widest mb-4">NO ORDERS YET</p>
                <a href="/" className="text-xs tracking-widest border border-gray-700 px-6 py-3 hover:border-white hover:text-white transition">START SHOPPING</a>
              </div>
            ):orders.map(o=>{
              const addr = getAddr(o);
              return (
                <div key={o.id} className="border border-gray-800 bg-gray-950 rounded overflow-hidden">
                  <div className="flex items-center justify-between p-4 border-b border-gray-800">
                    <div>
                      <p className="text-xs font-bold tracking-widest">{o.order_number}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{o.created_at?.slice(0,10)} — {addr.city}, {addr.country}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold">₹{parseFloat(o.total_inr||0).toLocaleString()}</p>
                      <span className={`text-xs px-2 py-0.5 rounded mt-1 inline-block ${o.status==="delivered"?"bg-green-900 text-green-400":o.status==="shipped"?"bg-blue-900 text-blue-400":"bg-yellow-900 text-yellow-400"}`}>
                        {(o.status||"pending").toUpperCase()}
                      </span>
                    </div>
                  </div>
                  {(o.tracking_number||o.courier)&&(
                    <div className="p-4 bg-blue-950 bg-opacity-30 border-b border-gray-800">
                      <p className="text-xs text-blue-400 tracking-widest">🚚 TRACKING: {o.courier} — {o.tracking_number}</p>
                    </div>
                  )}
                  <div className="p-4 flex justify-between text-xs text-gray-500">
                    <span>Payment: {o.payment_method?.toUpperCase()} — {o.payment_status?.toUpperCase()}</span>
                    <span>Shipping: ₹{parseFloat(o.shipping_inr||0).toLocaleString()}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {tab==="profile"&&(
          <div className="max-w-md flex flex-col gap-4">
            <p className="text-xs text-gray-500 tracking-widest mb-2">PERSONAL DETAILS</p>
            <div><label className="text-xs text-gray-500 tracking-widest mb-1 block">FULL NAME</label>
              <input defaultValue={user.name||""} className={inp}/></div>
            <div><label className="text-xs text-gray-500 tracking-widest mb-1 block">EMAIL</label>
              <input defaultValue={user.email||""} className={inp} readOnly/></div>
            <div><label className="text-xs text-gray-500 tracking-widest mb-1 block">PHONE</label>
              <input defaultValue={user.phone||""} className={inp}/></div>
            <div><label className="text-xs text-gray-500 tracking-widest mb-1 block">DATE OF BIRTH</label>
              <input type="date" defaultValue={user.dob?.slice(0,10)||""} className={inp}/></div>
            <div><label className="text-xs text-gray-500 tracking-widest mb-1 block">ANNIVERSARY DATE</label>
              <input type="date" defaultValue={user.anniversary?.slice(0,10)||""} className={inp}/></div>
            <button className="w-full bg-white text-black py-3 text-xs tracking-widest font-bold hover:bg-gray-200 transition mt-2">SAVE CHANGES</button>
          </div>
        )}

        {tab==="wishlist"&&(
          <div className="text-center py-20 border border-gray-800">
            <Heart size={40} color="#374151" className="mx-auto mb-4"/>
            <p className="text-gray-500 text-xs tracking-widest mb-4">YOUR WISHLIST IS EMPTY</p>
            <a href="/" className="text-xs tracking-widest border border-gray-700 px-6 py-3 hover:border-white hover:text-white transition">BROWSE PRODUCTS</a>
          </div>
        )}

        {tab==="addresses"&&(
          <div className="text-center py-20 border border-gray-800">
            <MapPin size={40} color="#374151" className="mx-auto mb-4"/>
            <p className="text-gray-500 text-xs tracking-widest">Addresses are saved at checkout</p>
          </div>
        )}
      </div>
    </main>
  );
}
