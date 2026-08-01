"use client";

export interface CartItem {
  id: number;
  name: string;
  price: number;
  original: number;
  image: string;
  quantity: number;
  size?: string;
  color?: string;
}

export interface WishlistItem {
  id: number;
  name: string;
  price: number;
  original: number;
  image: string;
}

export function getCart(): CartItem[] {
  try {
    const stored = localStorage.getItem("jerovin_cart");
    return stored ? JSON.parse(stored) : [];
  } catch { return []; }
}

export function saveCart(items: CartItem[]) {
  localStorage.setItem("jerovin_cart", JSON.stringify(items));
  window.dispatchEvent(new Event("cartUpdated"));
}

export function addToCart(item: CartItem) {
  const cart = getCart();
  const existing = cart.find(i => i.id === item.id && (i.size || "") === (item.size || ""));
  if (existing) {
    existing.quantity += item.quantity;
    saveCart(cart);
  } else {
    saveCart([...cart, item]);
  }
}

export function removeFromCart(id: number, size?: string) {
  saveCart(getCart().filter(i => !(i.id === id && (i.size || "") === (size || ""))));
}

export function updateCartQuantity(id: number, quantity: number, size?: string) {
  if (quantity <= 0) { removeFromCart(id, size); return; }
  const cart = getCart();
  const item = cart.find(i => i.id === id && (i.size || "") === (size || ""));
  if (item) { item.quantity = quantity; saveCart(cart); }
}

export function getWishlist(): WishlistItem[] {
  try {
    const stored = localStorage.getItem("jerovin_wishlist");
    return stored ? JSON.parse(stored) : [];
  } catch { return []; }
}

export function toggleWishlist(item: WishlistItem): boolean {
  const wishlist = getWishlist();
  const exists = wishlist.find(i => i.id === item.id);
  if (exists) {
    localStorage.setItem("jerovin_wishlist", JSON.stringify(wishlist.filter(i => i.id !== item.id)));
    return false;
  } else {
    localStorage.setItem("jerovin_wishlist", JSON.stringify([...wishlist, item]));
    return true;
  }
}

export function isWishlisted(id: number): boolean {
  return getWishlist().some(i => i.id === id);
}
