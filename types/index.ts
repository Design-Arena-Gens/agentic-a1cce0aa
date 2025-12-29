export type RecipientStatus = "idle" | "scheduled" | "sending" | "sent" | "failed";

export interface Recipient {
  id: string;
  handle: string;
  igUserId: string;
  name: string;
  tags: string[];
  status: RecipientStatus;
  scheduledAt?: string | null;
  lastMessagePreview?: string;
  lastResult?: string;
  createdAt: string;
}

export interface AutomationLog {
  id: string;
  recipientId: string;
  recipientHandle: string;
  status: "queued" | "sending" | "sent" | "failed";
  timestamp: string;
  message: string;
  responseDetail?: string;
}

export interface TemplateVariable {
  key: string;
  label: string;
  description: string;
  sample: string;
}

export interface SendDmPayload {
  recipientIgUserId: string;
  message: string;
  tag?: string;
  metadata?: Record<string, string>;
}
