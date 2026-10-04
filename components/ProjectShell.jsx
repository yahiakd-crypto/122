"use client";
import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { api } from "@/lib/client/api";
import { useApp } from "./AppContext";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import RightPanel from "./RightPanel";

const ShellCtx = createContext(null);
export const useShell = () => useContext(ShellCtx);

export default function ProjectShell({ projectId, currentNum, children }) {
  const { toast } = useApp();
  const [data, setData] = useState({ project: null, product: null, sections: {}, aiConfig: null, settings: null });
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const load = useCallback(async () => {
    try {
      const [p, sec, cfg, st] = await Promise.all([
        api.get(`/api/projects/${projectId}`),
        api.get(`/api/projects/${projectId}/sections`),
        api.get("/api/ai/config"),
        api.get("/api/settings"),
      ]);
      setData((d) => ({ project: p.project, product: p.product, sections: sec.sections, aiConfig: cfg.config, settings: st.settings }));
    } catch (e) {
      toast(e.message, "error");
    } finally {
      setLoaded(true);
    }
  }, [projectId, toast]);

  useEffect(() => { load(); }, [load]);

  const reloadSections = async () => {
    const sec = await api.get(`/api/projects/${projectId}/sections`);
    setData((d) => ({ ...d, sections: sec.sections }));
  };

  const updateSettings = async (patch) => {
    const { settings } = await api.put("/api/settings", patch);
    setData((d) => ({ ...d, settings }));
  };

  const currentSection = data.sections[currentNum] || null;
  const modelLabel = data.aiConfig?.models?.[`${currentNum}`] || data.aiConfig?.models?.same || data.aiConfig?.model || "";

  return (
    <ShellCtx.Provider value={{ ...data, projectId, currentSection, modelLabel, reloadSections, updateSettings, setMobileOpen }}>
      <div className="app-shell">
        <Sidebar
          projectId={projectId}
          currentNum={currentNum}
          sections={data.sections}
          project={data.project}
          mobileOpen={mobileOpen}
          onClose={() => setMobileOpen(false)}
        />
        <main className="main">
          <TopBar projectId={projectId} currentNum={currentNum} sections={data.sections} onMenu={() => setMobileOpen(true)} />
          <div className="section-scroll">
            {!loaded ? (
              <div className="content-wrap"><div className="card"><div className="skeleton" style={{ height: 40, marginBottom: 12 }} /><div className="skeleton" style={{ height: 300 }} /></div></div>
            ) : (
              children
            )}
          </div>
        </main>
        <RightPanel product={data.product} section={currentSection} sectionNum={currentNum} modelLabel={modelLabel} aiConfig={data.aiConfig} />
      </div>
    </ShellCtx.Provider>
  );
}