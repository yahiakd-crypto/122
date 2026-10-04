"use client";
import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/client/api";
import { Icon } from "@/components/icons";
import { useApp } from "@/components/AppContext";

const CURRENCIES = ["USD", "EUR", "GBP", "DZD", "AED", "SAR", "CAD", "AUD", "MAD", "TND"];

function dup(arr) {
  return arr.filter((v, i) => arr.indexOf(v) === i);
}

export default function ProductSetup({ projectId }) {
  const router = useRouter();
  const { toast } = useApp();
  const [product, setProduct] = useState(null);
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const fileRef = useRef(null);

  const load = useCallback(async () => {
    try {
      const { product } = await api.get(`/api/projects/${projectId}/product`);
      setProduct(product);
    } catch (e) {
      toast(e.message, "error");
    } finally {
      setLoaded(true);
    }
  }, [projectId, toast]);

  useEffect(() => { load(); }, [load]);

  const set = (k, v) => setProduct((p) => ({ ...p, [k]: v }));

  const addImages = (files) => {
    const list = [...files];
    list.forEach((file, i) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        const max = 720;
        let { width, height } = img;
        if (width > max || height > max) {
          const r = Math.min(max / width, max / height);
          width = Math.round(width * r);
          height = Math.round(height * r);
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        canvas.getContext("2d").drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.82);
        setProduct((p) => ({ ...p, images: dup([...(p.images || []), dataUrl]) }));
        URL.revokeObjectURL(url);
      };
      img.src = url;
    });
  };

  const save = async (goNext = true) => {
    setSaving(true);
    try {
      const payload = {
        name: (product.name || "").trim(),
        category: (product.category || "").trim(),
        description: (product.description || "").trim(),
        url: (product.url || "").trim(),
        images: product.images || [],
        price: (product.price || "").trim(),
        currency: product.currency || "USD",
        productType: (product.productType || "").trim(),
        deliveryMethod: (product.deliveryMethod || "").trim(),
        usp: (product.usp || "").trim(),
        brandName: (product.brandName || "").trim(),
        additionalInstructions: (product.additionalInstructions || "").trim(),
      };
      await api.put(`/api/projects/${projectId}/product`, payload);
      toast("Product saved.");
      if (goNext) router.push(`/projects/${projectId}/sections/1`);
    } catch (e) {
      toast(e.message, "error");
    } finally {
      setSaving(false);
    }
  };

  if (!loaded) return <div className="center"><div className="spin spin-dark" /></div>;

  return (
    <div>
      <div className="content-wrap">
        <div style={{ marginBottom: 20 }}>
          <div className="row-between" style={{ alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
            <div>
              <h1>Product Setup</h1>
              <p className="muted small" style={{ marginBottom: 0 }}>
                This profile feeds every research section automatically. Edit anytime — changes apply to the next AI run.
              </p>
            </div>
            <button className="btn btn-primary" onClick={() => router.push(`/projects/${projectId}/ai-studio/generate`)}>
              <Icon.Sparkle /> Generate AI Image
            </button>
          </div>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); save(true); }}>
          <div className="card" style={{ marginBottom: 16 }}>
            <h3>Core product</h3>
            <div className="form-grid">
              <div className="field"><label className="lbl" htmlFor="name">Product Name *</label><input id="name" className="input" value={product.name} onChange={(e) => set("name", e.target.value)} required placeholder="Ultimate Sewing Master Bundle" /></div>
              <div className="field"><label className="lbl" htmlFor="cat">Category</label><input id="cat" className="input" value={product.category} onChange={(e) => set("category", e.target.value)} placeholder="Digital Sewing Patterns" /></div>
              <div className="field full"><label className="lbl" htmlFor="desc">Product Description</label><textarea id="desc" className="textarea" rows={3} value={product.description} onChange={(e) => set("description", e.target.value)} placeholder="What exactly is this product, what does the customer receive, and how?" /></div>
              <div className="field"><label className="lbl" htmlFor="url">Product URL</label><input id="url" className="input" type="url" value={product.url} onChange={(e) => set("url", e.target.value)} placeholder="https://…  (paste here for research)" /></div>
              <div className="field"><label className="lbl" htmlFor="brand">Brand Name</label><input id="brand" className="input" value={product.brandName} onChange={(e) => set("brandName", e.target.value)} /></div>
              <div className="field"><label className="lbl" htmlFor="price">Price</label><input id="price" className="input" value={product.price} onChange={(e) => set("price", e.target.value)} type="number" step="0.1" min="0" /></div>
              <div className="field"><label className="lbl" htmlFor="currency">Currency</label>
                <select id="currency" className="select" value={product.currency} onChange={(e) => set("currency", e.target.value)}>
                  {CURRENCIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="field"><label className="lbl" htmlFor="type">Product Type</label>
                <select id="type" className="select" value={product.productType} onChange={(e) => set("productType", e.target.value)}>
                  <option value="">Select…</option>
                  <option>Digital Product</option><option>Physical Product</option><option>Service</option><option>Course / Education</option><option>Software / SaaS</option><option>Subscription</option><option>Print on Demand</option><option>Other</option>
                </select>
              </div>
              <div className="field"><label className="lbl" htmlFor="delivery">Delivery Method</label>
                <select id="delivery" className="select" value={product.deliveryMethod} onChange={(e) => set("deliveryMethod", e.target.value)}>
                  <option value="">Select…</option>
                  <option>Instant download</option><option>Email delivery</option><option>Shipping</option><option>Dropshipping</option><option>Local pickup</option><option>In-app access</option>
                </select>
              </div>
              <div className="field full"><label className="lbl" htmlFor="usp">Unique Selling Proposition (USP)</label><textarea id="usp" className="textarea" rows={2} value={product.usp} onChange={(e) => set("usp", e.target.value)} placeholder="The single strongest reason a customer chooses you over anyone else." /></div>
            </div>
          </div>

          <div className="card" style={{ marginBottom: 16 }}>
            <h3>Product images</h3>
            <div className="row wrap" style={{ marginBottom: 12 }}>
              {product.images.map((img, i) => (
                <div key={i} style={{ position: "relative" }}>
                  <img src={img} alt={`Product ${i + 1}`} style={{ width: 88, height: 88, objectFit: "cover", borderRadius: 10, border: "1px solid var(--border)" }} />
                  <button type="button" className="btn btn-sm btn-danger" style={{ position: "absolute", top: -6, right: -6, padding: "0 5px" }} aria-label="Remove image" onClick={() => set("images", product.images.filter((_, x) => x !== i))}>×</button>
                </div>
              ))}
            </div>
            <button type="button" className="btn" onClick={() => fileRef.current?.click()}>
              <span style={{ fontSize: 16 }}>＋</span> Upload Images
            </button>
            <input ref={fileRef} type="file" accept="image/*" multiple style={{ display: "none" }} onChange={(e) => { addImages([...e.target.files]); e.target.value = ""; }} aria-label="Upload product images" />
            <span className="muted small" style={{ marginLeft: 10 }}>Multiple images allowed · auto-compressed locally</span>
          </div>

          <div className="card" style={{ marginBottom: 16 }}>
            <h3>Additional instructions (optional)</h3>
            <textarea className="textarea" rows={3} value={product.additionalInstructions} onChange={(e) => set("additionalInstructions", e.target.value)} placeholder="Anything the AI should always keep in mind about this product or audience." />
          </div>

          <div className="row" style={{ marginBottom: 30 }}>
            <button className="btn btn-primary btn-lg" disabled={saving || !product.name} onClick={() => save(true)}>
              <span style={{ fontWeight: 800 }}>START ANALYSIS →</span>
            </button>
            <button className="btn btn-lg" disabled={saving} onClick={() => save(false)}>Save only</button>
            <button className="btn btn-ghost btn-lg" onClick={() => router.push(`/projects/${projectId}/settings/ai`)}>Configure AI first →</button>
          </div>
        </form>
      </div>
    </div>
  );
}