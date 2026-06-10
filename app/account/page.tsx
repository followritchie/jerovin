"use client";
import { useState } from "react";
import Nav from "../components/Nav";

export default function AccountPage() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [user, setUser] = useState<any>(null);

  const inputClass = "w-full bg-black border border-gray-700 text-white px-4 py-3 text-xs tracking-widest outline-none hover:border-gray-400 transition placeholder-gray-700";

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: mode, ...form }),
      });
      const data = await res.json();
      if (data.error) { setError(data.error); }
      else { setUser(data.user); localStorage.setItem("jerovin_user", JSON.stringify(data.user)); }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (user) return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-6">
      <h1 className="text-3xl font-bold tracking-widest mb-4">WELCOME, {user.name.toUpperCase()}</h1>
      <p className="text-gray-500 text-xs tracking-widest mb-8">{user.email}</p>
      <div className="grid grid-cols-2 gap-4 w-full max-w-md mb-8">
        <a href="/orders" className="border border-gray-700 p-6 text-center hover:border-white transition">
          <p className="text-2xl mb-2">📦</p>
          <p className="text-xs tracking-widest">MY ORDERS</p>
        </a>
        <a href="/account/profile" className="border border-gray-700 p-6 text-center hover:border-white transition">
          <p className="text-2xl mb-2">👤</p>
          <p className="text-xs tracking-widest">MY PROFILE</p>
        </a>
        <a href="/account/addresses" className="border border-gray-700 p-6 text-center hover:border-white transition">
          <p className="text-2xl mb-2">📍</p>
          <p className="text-xs tracking-widest">MY ADDRESSES</p>
        </a>
        <a href="/wishlist" className="border border-gray-700 p-6 text-center hover:border-white transition">
          <p className="text-2xl mb-2">❤️</p>
          <p className="text-xs tracking-widest">WISHLIST</p>
        </a>
      </div>
      <button onClick={() => { setUser(null); localStorage.removeItem("jerovin_user"); }} className="text-xs tracking-widest text-gray-500 hover:text-white transition border border-gray-700 px-8 py-3">
        SIGN OUT
      </button>
    </main>
  );

  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-6">
      <a href="/" className="text-2xl font-bold tracking-widest mb-12">JEROVIN</a>
      <div className="w-full max-w-md">
        <div className="flex mb-8">
          <button onClick={() => setMode("login")} className={`flex-1 py-3 text-xs tracking-widest border-b-2 transition ${mode === "login" ? "border-white text-white" : "border-gray-800 text-gray-500"}`}>
            SIGN IN
          </button>
          <button onClick={() => setMode("register")} className={`flex-1 py-3 text-xs tracking-widest border-b-2 transition ${mode === "register" ? "border-white text-white" : "border-gray-800 text-gray-500"}`}>
            CREATE ACCOUNT
          </button>
        </div>

        <div className="flex flex-col gap-4">
          {mode === "register" && (
            <input placeholder="FULL NAME" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} className={inputClass}/>
          )}
          <input placeholder="EMAIL ADDRESS" type="email" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} className={inputClass}/>
          <input placeholder="PASSWORD" type="password" value={form.password} onChange={(e) => setForm({...form, password: e.target.value})} className={inputClass}/>

          {error && <p className="text-red-500 text-xs tracking-widest">{error}</p>}

          <button onClick={handleSubmit} disabled={loading} className="w-full bg-white text-black py-4 text-xs tracking-widest font-bold hover:bg-gray-200 transition disabled:opacity-50">
            {loading ? "PLEASE WAIT..." : mode === "login" ? "SIGN IN" : "CREATE ACCOUNT"}
          </button>

          <div className="flex items-center gap-4 my-2">
            <div className="flex-1 border-t border-gray-800"></div>
            <p className="text-xs text-gray-600 tracking-widest">OR CONTINUE WITH</p>
            <div className="flex-1 border-t border-gray-800"></div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <button className="border border-gray-700 py-3 text-xs tracking-widest text-gray-400 hover:border-white hover:text-white transition">
              G GOOGLE
            </button>
            <button className="border border-gray-700 py-3 text-xs tracking-widest text-gray-400 hover:border-white hover:text-white transition">
              f FACEBOOK
            </button>
            <button className="border border-gray-700 py-3 text-xs tracking-widest text-gray-400 hover:border-white hover:text-white transition">
              📷 INSTAGRAM
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
