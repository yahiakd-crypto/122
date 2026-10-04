const BASE = "";

async function j(res) {
  if (!res.ok) {
    let data = null;
    try { data = await res.json(); } catch {}
    const err = new Error(data?.error || `Request failed (${res.status})`);
    err.code = data?.code || "";
    err.detail = data?.detail || "";
    err.status = res.status;
    throw err;
  }
  const text = await res.text();
  try { return JSON.parse(text); } catch { return text; }
}

export const api = {
  get: (path) => fetch(`${BASE}${path}`, { cache: "no-store" }).then(j),
  post: (path, body) => fetch(`${BASE}${path}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body || {}) }).then(j),
  put: (path, body) => fetch(`${BASE}${path}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body || {}) }).then(j),
  del: (path) => fetch(`${BASE}${path}`, { method: "DELETE" }).then(j),
  download: (path, filename) => {
    const a = document.createElement("a");
    a.href = `${BASE}${path}`;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
  },
  copy: (text) => {
    if (navigator.clipboard) return navigator.clipboard.writeText(text);
    return Promise.resolve();
  },
};