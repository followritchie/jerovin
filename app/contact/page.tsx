"use client";
import { useState } from "react";
import Nav from "../components/Nav";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [sent, setSent] = useState(false);

  const inputClass = "w-full bg-black border border-gray-700 text-white px-4 py-3 text-xs tracking-widest outline-none hover:border-gray-400 transition placeholder-gray-700";

  return (
    <main className="min-h-screen bg-black text-white pb-16 lg:pb-0">
      <Nav/>
      <div className="max-w-4xl mx-auto px-6 py-16">
        <p className="text-xs tracking-widest text-gray-500 mb-2">GET IN TOUCH</p>
        <h1 className="text-3xl font-bold tracking-widest mb-12">CONTACT US</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
          <div>
            {sent ? (
              <div className="border border-gray-800 p-8 text-center">
                <p className="text-4xl mb-4">✓</p>
                <p className="font-bold tracking-widest mb-2">MESSAGE SENT</p>
                <p className="text-xs text-gray-500 tracking-widest">We will get back to you within 24 hours.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <input placeholder="YOUR NAME" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} className={inputClass}/>
                <input placeholder="EMAIL ADDRESS" type="email" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} className={inputClass}/>
                <input placeholder="SUBJECT" value={form.subject} onChange={(e) => setForm({...form, subject: e.target.value})} className={inputClass}/>
                <textarea placeholder="YOUR MESSAGE" value={form.message} onChange={(e) => setForm({...form, message: e.target.value})} rows={6} className={inputClass + " resize-none"}/>
                <button onClick={() => setSent(true)} className="w-full bg-white text-black py-4 text-xs tracking-widest font-bold hover:bg-gray-200 transition">
                  SEND MESSAGE
                </button>
              </div>
            )}
          </div>
          <div className="flex flex-col gap-8">
            <div>
              <p className="text-xs tracking-widest text-gray-500 mb-3">EMAIL</p>
              <p className="text-sm">hello@jerovin.com</p>
            </div>
            <div>
              <p className="text-xs tracking-widest text-gray-500 mb-3">WHATSAPP</p>
              <p className="text-sm">Available on request</p>
            </div>
            <div>
              <p className="text-xs tracking-widest text-gray-500 mb-3">BUSINESS HOURS</p>
              <p className="text-sm text-gray-400">Monday — Saturday</p>
              <p className="text-sm text-gray-400">10:00 AM — 7:00 PM IST</p>
            </div>
            <div>
              <p className="text-xs tracking-widest text-gray-500 mb-3">RESPONSE TIME</p>
              <p className="text-sm text-gray-400">We respond within 24 hours</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
