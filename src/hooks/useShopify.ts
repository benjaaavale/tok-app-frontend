"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import { authFetch } from "@/lib/api";

/* ── Types ── */
export interface ShopifyStatus {
  connected: boolean;
  shopName: string | null;
  domain: string | null;
}

export interface ShopifyProduct {
  id: number;
  title: string;
  handle: string;
  vendor: string;
  product_type: string;
  status: string;
  variants: Array<{
    id: number;
    title: string;
    price: string;
    sku: string;
    inventory_quantity: number;
  }>;
  image: { src: string } | null;
}

export interface ShopifyAbandonedCheckout {
  id: number;
  token: string;
  cart_token: string;
  email: string;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
  total_price: string;
  subtotal_price: string;
  currency: string;
  line_items: Array<{
    id: number;
    title: string;
    quantity: number;
    price: string;
    variant_title: string;
  }>;
  customer: {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    phone: string | null;
  } | null;
  abandoned_checkout_url: string;
}

/* ── Queries ── */

export function useShopifyStatus() {
  const { getToken } = useAuth();
  return useQuery<ShopifyStatus>({
    queryKey: ["shopify-status"],
    queryFn: async () => {
      const res = await authFetch("/shopify/status", {}, () => getToken());
      return res.json();
    },
  });
}

export function useShopifyProducts(search?: string) {
  const { getToken } = useAuth();
  return useQuery<ShopifyProduct[]>({
    queryKey: ["shopify-products", search],
    queryFn: async () => {
      const url = search ? `/shopify/products?search=${encodeURIComponent(search)}` : "/shopify/products";
      const res = await authFetch(url, {}, () => getToken());
      return res.json();
    },
  });
}

export function useShopifyAbandonedCheckouts() {
  const { getToken } = useAuth();
  return useQuery<ShopifyAbandonedCheckout[]>({
    queryKey: ["shopify-abandoned-checkouts"],
    queryFn: async () => {
      const res = await authFetch("/shopify/abandoned-checkouts", {}, () => getToken());
      return res.json();
    },
  });
}

/* ── Mutations ── */

export function useConnectShopify() {
  const { getToken } = useAuth();
  return useMutation({
    mutationFn: async (shopDomain: string) => {
      const res = await authFetch(
        `/auth/shopify/url?shop=${encodeURIComponent(shopDomain)}`,
        {},
        () => getToken()
      );
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No se pudo obtener URL de autorización de Shopify");
      }
    },
  });
}

export function useDisconnectShopify() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      await authFetch(
        "/auth/shopify/disconnect",
        { method: "DELETE" },
        () => getToken()
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shopify-status"] });
      queryClient.invalidateQueries({ queryKey: ["shopify-products"] });
      queryClient.invalidateQueries({ queryKey: ["shopify-abandoned-checkouts"] });
    },
  });
}
