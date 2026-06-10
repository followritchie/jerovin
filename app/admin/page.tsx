"use client";
import { useState } from "react";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: "📊" },
    { id: "products", label: "Products", icon: "🛍️" },
    { id: "orders", label: "Orders", icon: "📦" },
    { id: "customers", label: "Customers", icon: "👥" },
    { id: "sellers", label: "Sellers", icon: "🏪" },
    { id: "categories", label: "Categories", icon: "🗂️" },
    { id: "team", label: "Team & Access", icon: "👤" },
    { id: "reports", label: "Financial Reports", icon: "📈" },
    { id: "settings", label: "Settings", icon: "⚙️" },
  ];

  const stats = [
    { label: "TOTAL ORDERS", value: "0", icon: "📦" },
    { label: "TOTAL PRODUCTS", value: "0", icon: "🛍️" },
    { label: "TOTAL CUSTOMERS", value: "0", icon: "👥" },
    { label: "TOTAL REVENUE", value: "₹0", icon: "💰" },
    { label: "PENDING ORDERS", value: "0", icon: "⏳" },
    { label: "ACTIVE SELLERS", value: "0", icon: "🏪" },
  ];

  return (
    <div className="flex min-h-screen bg-black text-white">

      <div className="w-60 bg-gray-950 border-r border-gray-800 flex flex-col fixed h-full">
        <div className="p-6 border-b border-gray-800">
          <h1 className="text-lg font-bold tracking-widest">JEROVIN</h1>
          <p className="text-xs text-gray-600 tracking-widest mt-1">ADMIN PANEL</p>
        </div>
        <div className="flex-1 py-4 overflow-y-auto">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-6 py-3 text-xs tracking-widest transition text-left border-l-2 ${activeTab === item.id ? "bg-gray-900 text-white border-white" : "text-gray-500 border-transparent hover:text-gray-300 hover:bg-gray-900"}`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </div>
        <div className="p-6 border-t border-gray-800">
          <p className="text-xs text-gray-600 tracking-widest">LOGGED IN AS</p>
          <p className="text-sm font-bold mt-1">ROY — SUPER ADMIN</p>
        </div>
      </div>

      <div className="ml-60 flex-1 p-10 overflow-y-auto">

        {activeTab === "dashboard" && (
          <div>
            <p className="text-xs tracking-widest text-gray-500 mb-2">OVERVIEW</p>
            <h2 className="text-3xl font-bold tracking-widest mb-8">DASHBOARD</h2>
            <div className="grid grid-cols-3 gap-4 mb-8">
              {stats.map((stat, i) => (
                <div key={i} className="bg-gray-900 border border-gray-800 p-6">
                  <p className="text-3xl mb-3">{stat.icon}</p>
                  <p className="text-2xl font-bold mb-1">{stat.value}</p>
                  <p className="text-xs tracking-widest text-gray-500">{stat.label}</p>
                </div>
              ))}
            </div>
            <div className="bg-gray-900 border border-gray-800 p-6">
              <p className="text-xs tracking-widest text-gray-500 mb-4">RECENT ORDERS</p>
              <p className="text-gray-700 text-sm text-center py-10">No orders yet.</p>
            </div>
          </div>
        )}

        {activeTab === "products" && (
          <div>
            <div className="flex justify-between items-center mb-8">
              <div>
                <p className="text-xs tracking-widest text-gray-500 mb-2">MANAGE</p>
                <h2 className="text-3xl font-bold tracking-widest">PRODUCTS</h2>
              </div>
              <button className="bg-white text-black px-6 py-3 text-xs tracking-widest font-bold hover:bg-gray-200 transition">
                + ADD PRODUCT
              </button>
            </div>
            <div className="bg-gray-900 border border-gray-800 p-6">
              <p className="text-gray-700 text-sm text-center py-10">No products yet. Click ADD PRODUCT to upload your first product.</p>
            </div>
          </div>
        )}

        {activeTab === "orders" && (
          <div>
            <p className="text-xs tracking-widest text-gray-500 mb-2">MANAGE</p>
            <h2 className="text-3xl font-bold tracking-widest mb-8">ORDERS</h2>
            <div className="flex gap-3 mb-6">
              {["ALL", "PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"].map((status) => (
                <button key={status} className="text-xs tracking-widest border border-gray-700 px-4 py-2 text-gray-400 hover:border-white hover:text-white transition">
                  {status}
                </button>
              ))}
            </div>
            <div className="bg-gray-900 border border-gray-800 p-6">
              <p className="text-gray-700 text-sm text-center py-10">No orders yet.</p>
            </div>
          </div>
        )}

        {activeTab === "customers" && (
          <div>
            <p className="text-xs tracking-widest text-gray-500 mb-2">MANAGE</p>
            <h2 className="text-3xl font-bold tracking-widest mb-8">CUSTOMERS</h2>
            <div className="bg-gray-900 border border-gray-800 p-6">
              <p className="text-gray-700 text-sm text-center py-10">No customers yet.</p>
            </div>
          </div>
        )}

        {activeTab === "sellers" && (
          <div>
            <div className="flex justify-between items-center mb-8">
              <div>
                <p className="text-xs tracking-widest text-gray-500 mb-2">MANAGE</p>
                <h2 className="text-3xl font-bold tracking-widest">SELLERS</h2>
              </div>
              <button className="bg-white text-black px-6 py-3 text-xs tracking-widest font-bold hover:bg-gray-200 transition">
                + INVITE SELLER
              </button>
            </div>
            <div className="grid grid-cols-3 gap-4 mb-6">
              {["PENDING APPROVAL", "ACTIVE SELLERS", "SUSPENDED"].map((s) => (
                <div key={s} className="bg-gray-900 border border-gray-800 p-4">
                  <p className="text-2xl font-bold mb-1">0</p>
                  <p className="text-xs tracking-widest text-gray-500">{s}</p>
                </div>
              ))}
            </div>
            <div className="bg-gray-900 border border-gray-800 p-6">
              <p className="text-gray-700 text-sm text-center py-10">No sellers yet.</p>
            </div>
          </div>
        )}

        {activeTab === "categories" && (
          <div>
            <div className="flex justify-between items-center mb-8">
              <div>
                <p className="text-xs tracking-widest text-gray-500 mb-2">MANAGE</p>
                <h2 className="text-3xl font-bold tracking-widest">CATEGORIES</h2>
              </div>
              <button className="bg-white text-black px-6 py-3 text-xs tracking-widest font-bold hover:bg-gray-200 transition">
                + ADD CATEGORY
              </button>
            </div>
            <div className="grid grid-cols-4 gap-4">
              {["WOMEN", "MEN", "KIDS", "JEWELLERY", "FOOTWEAR", "GIFTS", "PARCELS", "SNACKS"].map((cat) => (
                <div key={cat} className="bg-gray-900 border border-gray-800 p-5">
                  <p className="font-bold tracking-widest mb-1">{cat}</p>
                  <p className="text-xs text-gray-600 mb-4">0 PRODUCTS</p>
                  <div className="flex gap-2">
                    <button className="text-xs text-gray-500 border border-gray-700 px-3 py-1 hover:border-white hover:text-white transition">EDIT</button>
                    <button className="text-xs text-gray-500 border border-gray-700 px-3 py-1 hover:border-white hover:text-white transition">VIEW</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "team" && (
          <div>
            <div className="flex justify-between items-center mb-8">
              <div>
                <p className="text-xs tracking-widest text-gray-500 mb-2">MANAGE</p>
                <h2 className="text-3xl font-bold tracking-widest">TEAM & ACCESS</h2>
              </div>
              <button className="bg-white text-black px-6 py-3 text-xs tracking-widest font-bold hover:bg-gray-200 transition">
                + ADD TEAM MEMBER
              </button>
            </div>
            <div className="grid grid-cols-3 gap-4 mb-8">
              {[
                { role: "Super Admin", desc: "Full access to everything", count: 1 },
                { role: "Admin", desc: "Products, orders, reports", count: 0 },
                { role: "Product Manager", desc: "Products and inventory", count: 0 },
                { role: "Order Manager", desc: "Orders and shipping", count: 0 },
                { role: "Finance Manager", desc: "Reports and finances", count: 0 },
                { role: "Support Staff", desc: "Orders and customers", count: 0 },
              ].map((r) => (
                <div key={r.role} className="bg-gray-900 border border-gray-800 p-5">
                  <p className="font-bold tracking-widest mb-1">{r.role}</p>
                  <p className="text-xs text-gray-500 mb-3">{r.desc}</p>
                  <p className="text-xs text-gray-600">{r.count} MEMBER{r.count !== 1 ? "S" : ""}</p>
                </div>
              ))}
            </div>
            <div className="bg-gray-900 border border-gray-800 p-6">
              <p className="text-xs tracking-widest text-gray-500 mb-4">TEAM MEMBERS</p>
              <div className="flex items-center gap-4 p-4 border border-gray-800">
                <div className="w-10 h-10 bg-white text-black flex items-center justify-center font-bold text-sm">R</div>
                <div className="flex-1">
                  <p className="font-bold text-sm">Roy</p>
                  <p className="text-xs text-gray-500">Super Admin — Full Access</p>
                </div>
                <p className="text-xs text-green-500 tracking-widest">ACTIVE</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "reports" && (
          <div>
            <p className="text-xs tracking-widest text-gray-500 mb-2">FINANCIAL</p>
            <h2 className="text-3xl font-bold tracking-widest mb-8">REPORTS</h2>
            <div className="grid grid-cols-3 gap-4 mb-8">
              {[
                { title: "Monthly Report", desc: "Revenue, orders, commission" },
                { title: "Yearly Report", desc: "Annual financial summary" },
                { title: "GST Report", desc: "India GST filing data" },
                { title: "Tax Report", desc: "Global tax by country" },
                { title: "Commission Report", desc: "Seller commission breakdown" },
                { title: "CA Export", desc: "Send to chartered accountant" },
              ].map((r) => (
                <button key={r.title} className="bg-gray-900 border border-gray-800 p-5 text-left hover:border-gray-500 transition">
                  <p className="font-bold tracking-widest mb-1">📄 {r.title}</p>
                  <p className="text-xs text-gray-500 mb-3">{r.desc}</p>
                  <p className="text-xs text-gray-600 tracking-widest">DOWNLOAD PDF / EXCEL →</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {activeTab === "settings" && (
          <div>
            <p className="text-xs tracking-widest text-gray-500 mb-2">CONFIGURE</p>
            <h2 className="text-3xl font-bold tracking-widest mb-8">SETTINGS</h2>
            <div className="grid grid-cols-2 gap-4">
              {[
                { title: "Store Settings", desc: "Name, logo, contact details" },
                { title: "Payment Settings", desc: "Razorpay and Stripe configuration" },
                { title: "Shipping Settings", desc: "Rates and courier settings" },
                { title: "Tax Settings", desc: "GST, VAT, sales tax configuration" },
                { title: "Email Settings", desc: "Klaviyo and email templates" },
                { title: "WhatsApp Settings", desc: "WhatsApp Business API" },
                { title: "SEO Settings", desc: "Meta tags and sitemap" },
                { title: "Security Settings", desc: "Password, 2FA, access logs" },
              ].map((s) => (
                <button key={s.title} className="bg-gray-900 border border-gray-800 p-5 text-left hover:border-gray-500 transition">
                  <p className="font-bold tracking-widest mb-1">⚙️ {s.title}</p>
                  <p className="text-xs text-gray-500 mb-3">{s.desc}</p>
                  <p className="text-xs text-gray-600 tracking-widest">CONFIGURE →</p>
                </button>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
