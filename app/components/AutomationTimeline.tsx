"use client";

import type { AutomationLog } from "@/types";

interface AutomationTimelineProps {
  logs: AutomationLog[];
}

const statusIcon: Record<AutomationLog["status"], string> = {
  queued: "🗓️",
  sending: "📤",
  sent: "✅",
  failed: "⚠️",
};

const statusColor: Record<AutomationLog["status"], string> = {
  queued: "rgba(250, 204, 21, 0.35)",
  sending: "rgba(14, 165, 233, 0.3)",
  sent: "rgba(34, 197, 94, 0.35)",
  failed: "rgba(239, 68, 68, 0.35)",
};

export function AutomationTimeline({ logs }: AutomationTimelineProps) {
  if (logs.length === 0) {
    return (
      <div
        style={{
          padding: "1.5rem",
          textAlign: "center",
          border: "1px dashed rgba(148,163,184,0.3)",
          borderRadius: "16px",
          color: "rgba(148,163,184,0.65)",
          background: "rgba(15, 23, 42, 0.45)",
        }}
      >
        Messaging activity will show up here as you send DMs.
      </div>
    );
  }

  return (
    <div className="timeline">
      {logs.map((log) => (
        <article
          key={log.id}
          className="timeline-item"
          style={{ borderColor: statusColor[log.status] }}
        >
          <div className="icon" style={{ background: statusColor[log.status] }}>
            <span aria-hidden>{statusIcon[log.status]}</span>
          </div>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "0.4rem" }}>
            <header style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <strong style={{ fontSize: "0.95rem" }}>@{log.recipientHandle}</strong>
                <time
                  dateTime={log.timestamp}
                  style={{ fontSize: "0.75rem", color: "rgba(148,163,184,0.6)" }}
                >
                  {new Date(log.timestamp).toLocaleString()}
                </time>
              </div>
              <span className="badge" style={{ alignSelf: "flex-start", background: statusColor[log.status] }}>
                {log.status.toUpperCase()}
              </span>
            </header>
            <p style={{ margin: 0, fontSize: "0.9rem", lineHeight: 1.5, color: "rgba(226,232,240,0.85)" }}>
              {log.message}
            </p>
            {log.responseDetail && (
              <p style={{ margin: 0, fontSize: "0.8rem", color: "rgba(148,163,184,0.65)" }}>
                {log.responseDetail}
              </p>
            )}
          </div>
        </article>
      ))}
    </div>
  );
}
