"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import { MessageComposer } from "./components/MessageComposer";
import { RecipientForm } from "./components/RecipientForm";
import { RecipientsTable } from "./components/RecipientsTable";
import { AutomationTimeline } from "./components/AutomationTimeline";
import { StatsPanel } from "./components/StatsPanel";
import { ScheduleControls } from "./components/ScheduleControls";
import { buildMessage } from "@/lib/messageBuilder";
import type { AutomationLog, Recipient, TemplateVariable } from "@/types";
import { useLocalStorageState } from "@/hooks/useLocalStorageState";

const defaultTemplate = `Hey {{first_name}}! Absolutely loved your latest post about {{topic}}. We're launching a campaign with creators who align with {{brand_values}} and would be thrilled to collaborate with you. Can I send more details?`;

const templateVariables: TemplateVariable[] = [
  {
    key: "first_name",
    label: "First name",
    description: "Automatically extracted from the contact name.",
    sample: "Jamie",
  },
  {
    key: "full_name",
    label: "Full name",
    description: "Complete name stored for the contact.",
    sample: "Jamie Rivera",
  },
  {
    key: "handle",
    label: "Instagram handle",
    description: "@handle stored for the recipient.",
    sample: "creatorlife",
  },
  {
    key: "topic",
    label: "Campaign topic",
    description: "Outline what resonated with you in their content.",
    sample: "sustainable skincare",
  },
  {
    key: "brand_values",
    label: "Brand values",
    description: "Share your brand focus or campaign positioning.",
    sample: "eco-conscious partnerships",
  },
];

interface ScheduledTask {
  id: string;
  recipientId: string;
  runAt: number;
  message: string;
}

export default function HomePage() {
  const [template, setTemplate] = useLocalStorageState("ig_dm_template", defaultTemplate);
  const [customVariables, setCustomVariables] = useLocalStorageState<Record<string, string>>(
    "ig_dm_custom_variables",
    {
      topic: "your wellness journey",
      brand_values: "meaningful partnerships with wellness creators",
    }
  );
  const [recipients, setRecipients] = useLocalStorageState<Recipient[]>("ig_dm_recipients", []);
  const [logs, setLogs] = useLocalStorageState<AutomationLog[]>("ig_dm_logs", []);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [primaryPreviewId, setPrimaryPreviewId] = useState<string | null>(null);
  const [scheduledTasks, setScheduledTasks] = useState<ScheduledTask[]>([]);
  const [isSending, setIsSending] = useState(false);

  const selectedRecipient = useMemo(() => {
    if (!primaryPreviewId) return recipients[0] ?? null;
    return recipients.find((candidate) => candidate.id === primaryPreviewId) ?? recipients[0] ?? null;
  }, [primaryPreviewId, recipients]);

  useEffect(() => {
    if (selectedIds.length === 0) {
      setPrimaryPreviewId(null);
      return;
    }
    if (!primaryPreviewId || !selectedIds.includes(primaryPreviewId)) {
      setPrimaryPreviewId(selectedIds[0]);
    }
  }, [primaryPreviewId, selectedIds]);

  const toggleSelection = (id: string) => {
    setSelectedIds((current) =>
      current.includes(id) ? current.filter((value) => value !== id) : [...current, id]
    );
  };

  const removeRecipient = (id: string) => {
    setRecipients((current) => current.filter((recipient) => recipient.id !== id));
    setSelectedIds((current) => current.filter((value) => value !== id));
    setPrimaryPreviewId((current) => (current === id ? null : current));
  };

  const appendLog = useCallback(
    (entry: AutomationLog) => {
      setLogs((current) => [entry, ...current].slice(0, 200));
    },
    [setLogs]
  );

  const updateLog = useCallback(
    (id: string, partial: Partial<AutomationLog>) => {
      setLogs((current) => current.map((log) => (log.id === id ? { ...log, ...partial } : log)));
    },
    [setLogs]
  );

  const markRecipientStatus = useCallback(
    (id: string, status: Recipient["status"], scheduledAt?: string | null, message?: string) => {
      setRecipients((current) =>
        current.map((recipient) =>
          recipient.id === id
            ? {
                ...recipient,
                status,
                scheduledAt,
                lastMessagePreview: message ?? recipient.lastMessagePreview,
              }
            : recipient
        )
      );
    },
    [setRecipients]
  );

  const dispatchSend = useCallback(
    async (recipient: Recipient, message: string) => {
      const logId = crypto.randomUUID();
      appendLog({
        id: logId,
        recipientId: recipient.id,
        recipientHandle: recipient.handle,
        status: "sending",
        timestamp: new Date().toISOString(),
        message,
      });
      markRecipientStatus(recipient.id, "sending", null, message);

    try {
      const response = await fetch("/api/send-dm", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          recipientIgUserId: recipient.igUserId,
          message,
        }),
      });

      let data: any = null;
      try {
        data = await response.json();
      } catch {
        data = null;
      }

      if (!response.ok || !data?.success) {
        throw new Error(data?.error ?? "Failed to send Instagram message");
      }

      markRecipientStatus(recipient.id, "sent", null, message);
      updateLog(logId, {
        status: "sent",
        timestamp: new Date().toISOString(),
        responseDetail: data?.result?.id ? `Message id: ${data.result.id}` : undefined,
      });
    } catch (error) {
      markRecipientStatus(recipient.id, "failed", null, message);
      updateLog(logId, {
        status: "failed",
        timestamp: new Date().toISOString(),
        responseDetail: error instanceof Error ? error.message : String(error),
      });
    }
  },
    [appendLog, markRecipientStatus, updateLog]
  );

  const sendNow = useCallback(async () => {
    if (selectedIds.length === 0 || isSending) return;
    setIsSending(true);
    for (const recipientId of selectedIds) {
      const recipient = recipients.find((candidate) => candidate.id === recipientId);
      if (!recipient) continue;
      const message = buildMessage({ template, recipient, customVariables });
      await dispatchSend(recipient, message);
    }
    setIsSending(false);
  }, [customVariables, dispatchSend, isSending, recipients, selectedIds, template]);

  const scheduleSend = useCallback(
    (scheduledAtIso: string) => {
      if (selectedIds.length === 0) return;
      const runAt = dayjs(scheduledAtIso).valueOf();
      const now = Date.now();
      if (!runAt || runAt <= now) {
        void sendNow();
        return;
      }

      setScheduledTasks((current) => {
        const newTasks = [...current];
        selectedIds.forEach((recipientId) => {
          const recipient = recipients.find((candidate) => candidate.id === recipientId);
          if (!recipient) return;
          const message = buildMessage({ template, recipient, customVariables });
          newTasks.push({
            id: crypto.randomUUID(),
            recipientId,
            runAt,
            message,
          });
          markRecipientStatus(recipientId, "scheduled", new Date(runAt).toISOString(), message);
          appendLog({
            id: crypto.randomUUID(),
            recipientId,
            recipientHandle: recipient.handle,
            status: "queued",
            timestamp: new Date().toISOString(),
            message,
            responseDetail: `Scheduled for ${dayjs(runAt).format("MMM D, HH:mm")}`,
          });
        });
        return newTasks;
      });
    },
    [appendLog, customVariables, markRecipientStatus, recipients, selectedIds, sendNow, template]
  );

  useEffect(() => {
    if (scheduledTasks.length === 0) return;

    const timer = setInterval(() => {
      const now = Date.now();
      setScheduledTasks((current) => {
        const ready = current.filter((task) => task.runAt <= now);
        const pending = current.filter((task) => task.runAt > now);
        ready.forEach((task) => {
          const recipient = recipients.find((candidate) => candidate.id === task.recipientId);
          if (!recipient) return;
          void dispatchSend(recipient, task.message);
        });
        return pending;
      });
    }, 1_000);

    return () => clearInterval(timer);
  }, [dispatchSend, scheduledTasks.length, recipients]);

  const queuedCount = recipients.filter((recipient) => recipient.status === "scheduled").length;
  const sentCount = recipients.filter((recipient) => recipient.status === "sent").length;
  const failedCount = recipients.filter((recipient) => recipient.status === "failed").length;

  return (
    <main
      style={{
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "2.5rem 1.5rem 4rem",
        display: "flex",
        flexDirection: "column",
        gap: "1.5rem",
      }}
    >
      <header style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        <span className="badge" style={{ alignSelf: "flex-start", background: "var(--accent-soft)" }}>
          Instagram DM Automation
        </span>
        <h1 style={{ margin: 0, fontSize: "2.5rem" }}>Personalised outreach at scale</h1>
        <p style={{ margin: 0, maxWidth: "720px", color: "rgba(148,163,184,0.75)", lineHeight: 1.6 }}>
          Manage leads, craft tailored templates, and deliver Instagram direct messages in one
          streamlined workspace. Connect your Meta access token in the environment configuration to
          go live.
        </p>
      </header>

      <StatsPanel queued={queuedCount} sent={sentCount} failed={failedCount} />

      <section className="card" style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h2 style={{ margin: 0, fontSize: "1.2rem" }}>Audience manager</h2>
            <p style={{ margin: "0.35rem 0 0", color: "rgba(148,163,184,0.7)", fontSize: "0.9rem" }}>
              Upload qualified profiles and segment them with tags to power follow-up flows.
            </p>
          </div>
        </header>
        <RecipientForm
          onSubmit={(recipient) => {
            setRecipients((current) => [recipient, ...current]);
            appendLog({
              id: crypto.randomUUID(),
              recipientId: recipient.id,
              recipientHandle: recipient.handle,
              status: "queued",
              timestamp: new Date().toISOString(),
              message: "Recipient added to workspace",
            });
          }}
        />
        <RecipientsTable
          recipients={recipients}
          selectedIds={selectedIds}
          toggleSelection={toggleSelection}
          removeRecipient={removeRecipient}
          setPrimarySelection={setPrimaryPreviewId}
        />
      </section>

      <MessageComposer
        template={template}
        onTemplateChange={(value) => setTemplate(value)}
        selectedRecipient={selectedRecipient ?? null}
        customVariables={customVariables}
        onCustomVariableChange={(key, value) =>
          setCustomVariables((current) => ({
            ...current,
            [key]: value,
          }))
        }
        variableCatalog={templateVariables}
      />

      <section className="card" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <ScheduleControls
          onSendNow={() => void sendNow()}
          onSchedule={(time) => scheduleSend(time)}
          disabled={selectedIds.length === 0 || isSending}
          selectedCount={selectedIds.length}
        />
        {isSending && (
          <p style={{ margin: 0, fontSize: "0.85rem", color: "rgba(148,163,184,0.75)" }}>
            Dispatching messages… keep this window open until everything is delivered.
          </p>
        )}
      </section>

      <section className="card" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h2 style={{ margin: 0, fontSize: "1.2rem" }}>Automation timeline</h2>
            <p style={{ margin: "0.35rem 0 0", color: "rgba(148,163,184,0.7)", fontSize: "0.9rem" }}>
              Real-time visibility into queued, in-flight, and delivered messages.
            </p>
          </div>
        </header>
        <AutomationTimeline logs={logs} />
      </section>
    </main>
  );
}
