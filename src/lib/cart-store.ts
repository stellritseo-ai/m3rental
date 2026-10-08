import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import type { Equipment } from "@/data/equipment";

export type CartItem = {
  equipment: Equipment;
  rentalDays: number;
  addedAt: string;
};

const STORAGE_KEY_CART = "m3_rental_cart_items_v1";
const EVENT_CART_UPDATED = "m3-cart-updated";
const EVENT_CART_TOGGLE = "m3-cart-toggle-drawer";

let isDrawerOpenGlobal = false;

export function getCartItems(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CART);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error("Failed to parse cart items:", e);
    return [];
  }
}

export function saveCartItems(items: CartItem[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY_CART, JSON.stringify(items));
    window.dispatchEvent(new Event(EVENT_CART_UPDATED));
  } catch (e) {
    console.error("Failed to save cart items:", e);
  }
}

export function openCartDrawer(): void {
  if (typeof window === "undefined") return;
  isDrawerOpenGlobal = true;
  window.dispatchEvent(new CustomEvent(EVENT_CART_TOGGLE, { detail: { open: true } }));
}

export function closeCartDrawer(): void {
  if (typeof window === "undefined") return;
  isDrawerOpenGlobal = false;
  window.dispatchEvent(new CustomEvent(EVENT_CART_TOGGLE, { detail: { open: false } }));
}

export function toggleCartDrawer(): void {
  if (typeof window === "undefined") return;
  isDrawerOpenGlobal = !isDrawerOpenGlobal;
  window.dispatchEvent(new CustomEvent(EVENT_CART_TOGGLE, { detail: { open: isDrawerOpenGlobal } }));
}

export function addToCart(equipment: Equipment, days: number = 1, showToast: boolean = true): void {
  const items = getCartItems();
  const existing = items.find((i) => i.equipment.slug === equipment.slug);

  if (existing) {
    existing.rentalDays += days;
    saveCartItems(items);
    if (showToast) {
      toast.success(`Updated rental days for ${equipment.name}`, {
        description: `Now reserved for ${existing.rentalDays} days.`,
        action: {
          label: "View Cart",
          onClick: () => openCartDrawer(),
        },
      });
    }
  } else {
    items.push({
      equipment,
      rentalDays: Math.max(1, days),
      addedAt: new Date().toISOString(),
    });
    saveCartItems(items);
    if (showToast) {
      toast.success(`Added to Cart: ${equipment.name}`, {
        description: `$${equipment.dayRate}/day • Houston Yard Ready`,
        action: {
          label: "View Cart",
          onClick: () => openCartDrawer(),
        },
      });
    }
  }
}

export function removeFromCart(slug: string): void {
  const items = getCartItems();
  const filtered = items.filter((i) => i.equipment.slug !== slug);
  saveCartItems(filtered);
  toast.info("Item removed from your rental cart");
}

export function updateCartDays(slug: string, days: number): void {
  const items = getCartItems();
  const target = items.find((i) => i.equipment.slug === slug);
  if (target) {
    target.rentalDays = Math.max(1, days);
    saveCartItems(items);
  }
}

export function clearCart(): void {
  saveCartItems([]);
  toast.info("Your rental cart has been cleared");
}

export function useCart() {
  const [items, setItems] = useState<CartItem[]>(() => getCartItems());
  const [isOpen, setIsOpen] = useState<boolean>(() => isDrawerOpenGlobal);

  useEffect(() => {
    const handleUpdate = () => {
      setItems(getCartItems());
    };
    const handleToggle = (e: any) => {
      if (e.detail && typeof e.detail.open === "boolean") {
        setIsOpen(e.detail.open);
      } else {
        setIsOpen((prev) => !prev);
      }
    };

    window.addEventListener(EVENT_CART_UPDATED, handleUpdate);
    window.addEventListener(EVENT_CART_TOGGLE, handleToggle);
    return () => {
      window.removeEventListener(EVENT_CART_UPDATED, handleUpdate);
      window.removeEventListener(EVENT_CART_TOGGLE, handleToggle);
    };
  }, []);

  const totalCost = items.reduce((acc, curr) => {
    return acc + curr.equipment.dayRate * curr.rentalDays;
  }, 0);

  const totalCount = items.length;

  return {
    items,
    totalCount,
    totalCost,
    isOpen,
    openCart: openCartDrawer,
    closeCart: closeCartDrawer,
    toggleCart: toggleCartDrawer,
    addToCart: useCallback((eq: Equipment, days?: number, notify?: boolean) => addToCart(eq, days, notify), []),
    removeFromCart: useCallback((slug: string) => removeFromCart(slug), []),
    updateCartDays: useCallback((slug: string, days: number) => updateCartDays(slug, days), []),
    clearCart: useCallback(() => clearCart(), []),
  };
}
