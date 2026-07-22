import type { PointsLog } from "@/types";

export function HistoryList({ history }: { history: PointsLog[] }) {
  if (history.length === 0) {
    return (
      <p className="text-sm" style={{ color: "var(--brand-secondary)", opacity: 0.6 }}>
        لا يوجد نشاط بعد
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {history.map((log) => (
        <div key={log.id} className="flex items-center justify-between text-sm">
          <div>
            <p style={{ color: "var(--brand-secondary)" }}>{log.action}</p>
            <p className="text-xs" style={{ color: "var(--brand-secondary)", opacity: 0.5 }}>
              {new Date(log.created_at).toLocaleDateString("ar")}
            </p>
          </div>
          <span
            className="font-semibold"
            style={{ color: log.points >= 0 ? "var(--brand-accent)" : "#f87171" }}
          >
            {log.points >= 0 ? "+" : ""}
            {log.points}
          </span>
        </div>
      ))}
    </div>
  );
}
