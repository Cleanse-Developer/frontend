"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { productApi } from "@/lib/endpoints";

export default function UnitRedirect() {
  const router = useRouter();
  useEffect(() => {
    // Carry any hash through the redirect, so /unit#ingredients lands on the
    // resolved product's Ingredients panel instead of its hero.
    const hash = typeof window !== "undefined" ? window.location.hash : "";
    productApi.getAll({ limit: 1 }).then((data) => {
      const first = data.products?.[0];
      if (first) router.replace(`/unit/${first.slug}${hash}`);
      else router.replace("/wardrobe");
    }).catch(() => router.replace("/wardrobe"));
  }, [router]);
  return null;
}
