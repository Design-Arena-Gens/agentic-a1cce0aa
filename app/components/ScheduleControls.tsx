"use client";

import { useState } from "react";

interface ScheduleControlsProps {
  onSendNow: () => void;
  onSchedule: (scheduledAt: string) => void;
  disabled: boolean;
  selectedCount: number;
}

export function ScheduleControls({
  onSendNow,
  onSchedule,
  disabled,
  selectedCount,
}: ScheduleControlsProps) {
  const [scheduleAt, setScheduleAt] = useState<string>("");

  const handleScheduleClick = () => {
    if (!scheduleAt) return;
    onSchedule(scheduleAt);
    setScheduleAt("");
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "0.8rem",
        background: "rgba(15, 23, 42, 0.55)",
        border: "1px solid rgba(99,102,241,0.2)",
        borderRadius: "16px",
        padding: "1rem",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h3 style={{ margin: 0, fontSize: "1rem" }}>Delivery controls</h3>
        <span style={{ fontSize: "0.8rem", color: "rgba(148,163,184,0.6)" }}>
          Selected recipients: <strong>{selectedCount}</strong>
        </span>
      </div>
      <p style={{ margin: 0, fontSize: "0.85rem", color: "rgba(148,163,184,0.7)" }}>
        Send instantly or schedule a send time. Scheduling requires this browser tab to stay
        open.
      </p>
      <div className="grid two" style={{ gap: "0.75rem" }}>
        <button type="button" className="primary" onClick={onSendNow} disabled={disabled}>
          Send now
        </button>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <input
            type="datetime-local"
            value={scheduleAt}
            onChange={(event) => setScheduleAt(event.target.value)}
            style={{ flex: 1 }}
          />
          <button
            type="button"
            className="secondary"
            onClick={handleScheduleClick}
            disabled={disabled || !scheduleAt}
          >
            Schedule
          </button>
        </div>
      </div>
    </div>
  );
}
