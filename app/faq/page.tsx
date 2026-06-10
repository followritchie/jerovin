"use client";
import { useState } from "react";
import Nav from "../components/Nav";

export default function FAQPage() {
  const [open, setOpen] = useState<number | null>(null);

  const faqs = [
    { q: "How long does delivery take?", a: "Within India, delivery takes 3-7 business days. International orders take 7-14 business days depending on location." },
    { q: "Is shipping free?", a: "Yes, shipping is completely free within India. For international orders, shipping is calculated at checkout based on weight and destination." },
    { q: "Can I return a product?", a: "India customers can return within 7 days with an unboxing video as proof. International customers can only return damaged products with video evidence. Custom products cannot be returned." },
    { q: "How do I track my order?", a: "Once your order is shipped, you will receive a tracking number via email and WhatsApp. You can also track your order at jerovin.com/track." },
    { q: "What payment methods do you accept?", a: "We accept all major credit and debit cards, UPI, net banking (India), PayPal, and all major international payment methods." },
    { q: "Do you ship worldwide?", a: "Yes, we ship to 50+ countries worldwide. Enter your address at checkout to see shipping options and costs." },
    { q: "How does the custom order process work?", a: "Select your product type, choose colour, size and fabric, upload a reference image, add your special instructions, and place your order. Our artisans will craft it exclusively for you." },
    { q: "How long do custom orders take?", a: "Custom clothing takes 7-10 working days. Custom gifts take 3-5 working days. You will receive updates via WhatsApp throughout the process." },
    { q: "Are the products authentic Indian products?", a: "Yes, all our products are sourced directly from skilled artisans and manufacturers across India. We guarantee authenticity and quality." },
    { q: "How are prices shown on the website?", a: "Prices are automatically shown in your local currency based on your location. You will always see the price in your own currency." },
  ];

  return (
    <main className="min-h-screen bg-black text-white pb-16 lg:pb-0">
      <Nav/>
      <div className="max-w-3xl mx-auto px-6 py-16">
        <p className="text-xs tracking-widest text-gray-500 mb-2">HELP</p>
        <h1 className="text-3xl font-bold tracking-widest mb-12">FREQUENTLY ASKED QUESTIONS</h1>
        <div className="flex flex-col gap-2">
          {faqs.map((faq, i) => (
            <div key={i} className="border border-gray-800 hover:border-gray-600 transition">
              <button onClick={() => setOpen(open === i ? null : i)} className="w-full flex justify-between items-center p-5 text-left">
                <p className="text-sm tracking-widest font-bold">{faq.q}</p>
                <span className="text-gray-500 text-lg ml-4">{open === i ? "−" : "+"}</span>
              </button>
              {open === i && (
                <div className="px-5 pb-5">
                  <p className="text-gray-400 text-sm leading-relaxed">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
