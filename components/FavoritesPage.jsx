"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/client/api";
import { useApp } from "./AppContext";
import { Icon } from "./icons";
import { SECTIONS } from "@/lib/client/constants";

export default function FavoritesPage({ projectId }) {
  const router = useRouter();
  const { toast } = useApp();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const { favorites } = await api.get(`/api/projects/${projectId}/favorites`);
      setFavorites(favorites || []);
    } catch (e) {
      toast(e.message, "error");
    } finally {
      setLoading(false);
    }
  }, [projectId, toast]);

  useEffect(() => { load(); }, [load]);

  const remove = async (id) => {
    await api.del(`/api/projects/${projectId}/favorites/${id}`);
    setFavorites((f) => f.filter((x) => x.id !== id));
    toast("Removed from favorites.", "warn");
  };

  const sectionTitle = (sid) => SECTIONS.find((s) => s.num === sid)?.title || "";

  return (
    <div className="content-wrap">
      <div style={{ marginBottom: 18 }}>
        <h1>Favorites</h1>
        <p className="muted small">Your saved headlines, offers, personas, palettes and ad concepts — ready to reuse.</p>
      </div>

      {loading ? <div className="card"><div className="skeleton" style={{ height: 120 }} /></div> : favorites.length === 0 ? (
        <div className="card empty">
          <div className="empty-icon"><Icon.Heart /></div>
          <h3>No favorites yet</h3>
          <p className="muted">Use the heart icon on any generated item to keep it here.</p>
        </div>
      ) : (
        <div className="grid-col-3">
          {favorites.map((f) => (
            <div key={f.id} className="card" style={{ padding: 14 }}>
              <div className="row-between" style={{ marginBottom: 6 }}>
                <button className="btn btn-sm btn-ghost" style={{ padding: 0, fontSize: 12 }} onClick={() => f.sectionId >= 1 && f.sectionId <= 17 && router.push(`/projects/${projectId}/sections/${f.sectionId}`)}>
                  Section {String(f.sectionId).padStart(2, "0")} · {sectionTitle(f.sectionId)}
                </button>
                <div className="row">
                  <button className="copy-btn" onClick={async () => { await api.copy(f.content); toast("Copied."); }}><Icon.Copy /></button>
                  <button className="copy-btn" style={{ color: "var(--error)" }} onClick={() => remove(f.id)}><Icon.Trash /></button>
                </div>
              </div>
              <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 6 }}>{f.label}</div>
              <div className="small muted" style={{ fontSize: 12, maxHeight: 120, overflow: "auto" }}>{f.content.slice(0, 600)}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}