import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Jerovin — Authentic Indian Fashion Delivered Worldwide",
  description: "Premium handcrafted Indian fashion, jewellery, footwear and personalised gifts delivered across the globe.",
  keywords: "Indian fashion, sarees, kurtas, Indian jewellery, Indian footwear, custom Indian wear, Indian snacks",
  openGraph: {
    title: "Jerovin — Authentic Indian Fashion Delivered Worldwide",
    description: "Premium handcrafted Indian fashion delivered globally",
    url: "https://jerovin.com",
    siteName: "Jerovin",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
