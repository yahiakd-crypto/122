"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";

const AdTestingDashboard = dynamic(() => import("@/components/AdTestingDashboard"), {
  ssr: false,
  loading: () => (
    <div style={{ display: "flex", height: "100vh", width: "100vw", alignItems: "center", justifyContent: "center", background: "#f8fafc", fontFamily: "monospace", color: "#64748b" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
        <div style={{ width: 36, height: 36, border: "3px solid #cbd5e1", borderTopColor: "#3b82f6", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
        <span>Loading Strategy Dashboard...</span>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  )
});

export default function NoteRoutePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/board")
      .then(r => r.json())
      .then(d => setProducts(Array.isArray(d.products) ? d.products : []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ padding: 40, fontFamily: "monospace", color: "#64748b" }}>
        Loading products from board…
      </div>
    );
  }

  return (
    <main style={{ position: "relative", width: "100vw", height: "100vh", overflow: "hidden", background: "#f8fafc" }}>
      <div style={{ position: "absolute", top: 16, left: 16, zIndex: 50 }}>
        <Link
          href="/"
          style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "#fff", padding: "8px 14px", borderRadius: 8,
            border: "1px solid #e2e8f0", color: "#475569", fontSize: 13,
            fontWeight: 600, textDecoration: "none", boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          }}
        >
          ← Back
        </Link>
      </div>
      <AdTestingDashboard products={products} onBack={() => {}} />
    </main>
  );
}
