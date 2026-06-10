import { db } from "./db";

export interface Product {
  id: string;
  name: string;
  description: string;
  priceINR: number;
  image?: string;
  category?: string;
}

export async function getProduct(id: string): Promise<Product | null> {
  try {
    const result = await db.query(
      "SELECT id, name, description, price_inr as priceINR FROM products WHERE id = $1",
      [id]
    );
    return result.rows[0] || null;
  } catch (error) {
    console.error("Error fetching product:", error);
    return null;
  }
}

export async function getAllProducts(): Promise<Product[]> {
  try {
    const result = await db.query(
      "SELECT id, name, description, price_inr as priceINR FROM products ORDER BY created_at DESC"
    );
    return result.rows;
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
}