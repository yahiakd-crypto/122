import { useRouter } from "next/navigation";
import { SECTIONS } from "@/lib/client/constants";
import { Icon } from "./icons";

export default function TopBar({ projectId, currentNum, sections, onMenu }) {
  const router = useRouter();
  const done = Object.values(sections || {}).filter((s) => s.status === "completed").length;
  const skipped = Object.values(sections || {}).filter((s) => s.status === "skipped").length;
  const current = SECTIONS.find((s) => s.num === currentNum);
  const pct = Math.round(((done + skipped) / 17) * 100);

  return (
    <header className="topbar no-print">
      {onMenu && (
        <button className="btn btn-ghost mobile-drawer-toggle" onClick={onMenu} aria-label="Open navigation">
          <Icon.Menu />
        </button>
      )}
      <div style={{ minWidth: 0 }}>
        <div className="small muted" style={{ fontWeight: 700, letterSpacing: "0.06em", fontSize: 11 }}>
          STEP {String(currentNum || "").padStart(2, "0")} / 17
        </div>
        <div style={{ fontWeight: 800, fontSize: 15, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {current ? current.title : "Product Research & CRO Lab"}
        </div>
      </div>

      <div className="row grow" style={{ width: 220, minWidth: 160 }}>
        <div className="progress-track grow">
          <div className="progress-fill" style={{ width: `${pct}%` }} />
        </div>
        <span className="small muted" style={{ whiteSpace: "nowrap" }}>{pct}%</span>
      </div>

      <div className="step-tabs" aria-label="Section progress">
        {SECTIONS.map((s) => {
          const st = sections?.[s.num]?.status;
          const cls = st === "completed" ? "done" : st === "skipped" ? "skipped" : st === "in_progress" || s.num === currentNum ? "current" : "";
          return (
            <button
              key={s.num}
              className={`step-chip ${cls}`}
              onClick={() => router.push(`/projects/${projectId}/sections/${s.num}`)}
              title={`${s.num}. ${s.title}`}
              aria-label={`Section ${s.num} ${s.title} — ${st || "not started"}`}
            >
              {s.num}
            </button>
          );
        })}
      </div>
    </header>
  );
}