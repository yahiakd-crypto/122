"use client";
import React from "react";
import { createContext, useContext, useState, useCallback } from "react";

export const AppCtx = createContext(null);

export function AppProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const [settings, setSettings] = useState({ language: "darja", autoRunNext: false, liveWebResearch: false });

  const toast = useCallback((message, type = "success") => {
    const id = Math.random().toString(36).slice(2);
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3600);
  }, []);

  const applySettings = useCallback((patch) => {
    setSettings((s) => ({ ...s, ...patch }));
  }, []);

  return (
    <AppCtx.Provider value={{ toast, settings, applySettings, setSettings }}>
      {children}
      <div className="toast-zone" role="status" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast-${t.type}`}>
            {t.message}
          </div>
        ))}
      </div>
    </AppCtx.Provider>
  );
}

export function useApp() {
  return useContext(AppCtx);
}